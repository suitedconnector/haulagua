#!/usr/bin/env python3
"""
Water Hauler Directory — classify & extract pipeline
=====================================================
Input : a list of candidate website URLs (one per line in urls.txt)
Output: listings.csv (+ listings.json) with a `qualifies` flag, extracted
        fields, and a `confidence`/`needs_review` marker for borderline calls.

Design:
  For each URL  ->  fetch page text  ->  ONE LLM call (classify + extract)
  ->  write a row.  Deterministic loop, not an agent.  Re-runnable & debuggable.

Key correctness rules baked into the prompt:
  - Return null for any field NOT clearly stated on the page (never guess).
  - Qualify ONLY on an explicit bulk/hauled water-delivery service.
  - Emit strict JSON so output is structured, not prose.

Setup:
  pip install requests beautifulsoup4 anthropic --break-system-packages
  export ANTHROPIC_API_KEY=sk-ant-...
  # put your candidate URLs in urls.txt, then:
  python3 classify_extract.py
"""

import csv
import json
import os
import sys
import time
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup

# ── Config ──────────────────────────────────────────────────────────────────
INPUT_FILE = "urls.txt"
OUT_CSV = "listings.csv"
OUT_JSON = "listings.json"
MODEL = "claude-sonnet-4-20250514"      # fast + cheap enough for hundreds of pages
MAX_PAGE_CHARS = 12000                   # trim long pages to keep cost/latency down
REQUEST_TIMEOUT = 20
SLEEP_BETWEEN = 0.5                       # be polite to sites + the API

# Fields we extract. Order here = column order in the CSV.
FIELDS = [
    "name", "description", "phone", "email", "website",
    "address", "city", "state", "zip", "service_area",
    "water_type", "services", "industries", "hours", "year_established",
]

# ── The qualifying rubric + schema, handed to the model verbatim ─────────────
# Tune the QUALIFY / DISQUALIFY bullets — this is where data quality is won.
SYSTEM_PROMPT = """You are a precise data-extraction assistant building a directory of BULK WATER DELIVERY (water hauling) businesses. You read the text of one business's website and return STRICT JSON.

QUALIFIES (qualifies=true) only if the business EXPLICITLY offers bulk/hauled water DELIVERY — fresh water delivered by truck to a location. Examples of qualifying services: potable water delivery, non-potable/bulk water delivery, pool fills, construction/dust-control water, agricultural/livestock water hauling, cistern/holding-tank fills.

DOES NOT QUALIFY (qualifies=false) if the business is ONLY one of:
- a municipal water utility / water district
- bottled water, water-cooler, or water-dispenser delivery
- water treatment, filtration, or softener sales/service
- septic, sewage, or wastewater pumping with NO fresh-water delivery
- well drilling with no water-hauling service
- a general trucking company with no water hauling
If the page is ambiguous or you cannot tell, set qualifies=false and confidence="low".

EXTRACTION RULES (critical):
- Return null for ANY field not CLEARLY stated on the page. NEVER guess, infer, or fabricate. A plausible-but-unstated value is a data error.
- water_type: one of "potable", "non-potable", "both", or null based on what they state.
- services / industries: arrays of short strings drawn only from what the page states; [] if none stated.
- phone/email/address: copy exactly as written; null if absent.
- year_established: integer or null.
- confidence: "high" if the page clearly states what the business does; "low" if sparse, ambiguous, or you had to stretch.

Return ONLY this JSON object, no preamble, no markdown fences:
{
  "qualifies": true|false,
  "confidence": "high"|"low",
  "name": str|null,
  "description": str|null,        // 1-2 sentences in your own words, only from page facts
  "phone": str|null,
  "email": str|null,
  "website": str|null,
  "address": str|null,
  "city": str|null,
  "state": str|null,              // 2-letter abbreviation if determinable
  "zip": str|null,
  "service_area": str|null,
  "water_type": "potable"|"non-potable"|"both"|null,
  "services": [str],
  "industries": [str],
  "hours": str|null,
  "year_established": int|null
}"""


def fetch_page_text(url: str) -> str | None:
    """Fetch a URL and return cleaned visible text, or None on failure.
    Plain HTTP + BeautifulSoup handles most small-business sites. For heavy
    JS sites you'd swap this one function for crawl4ai/Firecrawl — the rest
    of the pipeline is unchanged."""
    if not urlparse(url).scheme:
        url = "https://" + url
    try:
        r = requests.get(
            url, timeout=REQUEST_TIMEOUT,
            headers={"User-Agent": "Mozilla/5.0 (directory-research)"},
        )
        r.raise_for_status()
    except Exception as e:
        print(f"  ! fetch failed: {e}", file=sys.stderr)
        return None
    soup = BeautifulSoup(r.text, "html.parser")
    for tag in soup(["script", "style", "noscript", "svg"]):
        tag.decompose()
    text = " ".join(soup.get_text(separator=" ").split())
    return text[:MAX_PAGE_CHARS] if text else None


def classify_extract(url: str, page_text: str) -> dict:
    """One LLM call: classify + extract. Returns the parsed JSON dict."""
    from anthropic import Anthropic
    client = Anthropic()  # reads ANTHROPIC_API_KEY from env

    user_msg = f"Business website URL: {url}\n\nPAGE TEXT:\n{page_text}"
    resp = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_msg}],
    )
    raw = "".join(b.text for b in resp.content if b.type == "text").strip()
    # strip accidental code fences just in case
    if raw.startswith("```"):
        raw = raw.split("```")[1].lstrip("json").strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"qualifies": False, "confidence": "low",
                "_error": "unparseable model output", "_raw": raw[:500]}


def main():
    if not os.path.exists(INPUT_FILE):
        print(f"Create {INPUT_FILE} with one candidate URL per line.", file=sys.stderr)
        sys.exit(1)
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("Set ANTHROPIC_API_KEY in your environment.", file=sys.stderr)
        sys.exit(1)

    with open(INPUT_FILE) as f:
        urls = [ln.strip() for ln in f if ln.strip() and not ln.startswith("#")]

    results = []
    for i, url in enumerate(urls, 1):
        print(f"[{i}/{len(urls)}] {url}")
        text = fetch_page_text(url)
        if not text:
            results.append({"website": url, "qualifies": False,
                            "confidence": "low", "_error": "no page text"})
            continue
        data = classify_extract(url, text)
        data.setdefault("website", url)
        # needs_review: a qualifying listing we're not confident about, or any error
        data["needs_review"] = bool(
            data.get("_error")
            or (data.get("qualifies") and data.get("confidence") == "low")
        )
        results.append(data)
        q = "✓ QUALIFIES" if data.get("qualifies") else "· skip"
        flag = "  ⟵ REVIEW" if data.get("needs_review") else ""
        print(f"    {q} ({data.get('confidence','?')}){flag}")
        time.sleep(SLEEP_BETWEEN)

    # ── Write outputs ────────────────────────────────────────────────────────
    with open(OUT_JSON, "w") as f:
        json.dump(results, f, indent=2)

    qualified = [r for r in results if r.get("qualifies")]
    with open(OUT_CSV, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(FIELDS + ["confidence", "needs_review"])
        for r in qualified:
            row = []
            for fld in FIELDS:
                v = r.get(fld)
                if isinstance(v, list):
                    v = ", ".join(v)          # arrays -> delimited cell for the Sheet
                row.append("" if v is None else v)
            row += [r.get("confidence", ""), "yes" if r.get("needs_review") else ""]
            w.writerow(row)

    n_q = len(qualified)
    n_review = sum(1 for r in results if r.get("needs_review"))
    print(f"\nDone. {len(results)} processed → {n_q} qualified "
          f"({n_review} flagged for review).")
    print(f"Wrote {OUT_CSV} (qualified rows, import to Google Sheet) and {OUT_JSON} (full log).")


if __name__ == "__main__":
    main()
