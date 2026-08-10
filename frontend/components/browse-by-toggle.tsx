"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

type BrowseByContextValue = {
  activeId: string;
  setActiveId: (id: string) => void;
};

const BrowseByContext = createContext<BrowseByContextValue | null>(null);

function useBrowseByContext() {
  const ctx = useContext(BrowseByContext);
  if (!ctx) {
    throw new Error("BrowseByTabs/BrowseByPanel must be used within a BrowseByProvider");
  }
  return ctx;
}

export function BrowseByProvider({
  defaultTabId,
  children,
}: {
  defaultTabId: string;
  children: ReactNode;
}) {
  const [activeId, setActiveId] = useState(defaultTabId);
  return (
    <BrowseByContext.Provider value={{ activeId, setActiveId }}>
      {children}
    </BrowseByContext.Provider>
  );
}

export type BrowseByTabDef = {
  id: string;
  label: string;
  badge?: string;
};

export function BrowseByTabs({
  tabs,
  label = "Browse by:",
}: {
  tabs: BrowseByTabDef[];
  label?: string;
}) {
  const { activeId, setActiveId } = useBrowseByContext();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function focusIndex(index: number) {
    const wrapped = (index + tabs.length) % tabs.length;
    setActiveId(tabs[wrapped].id);
    tabRefs.current[wrapped]?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        focusIndex(index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        focusIndex(index - 1);
        break;
      case "Home":
        e.preventDefault();
        focusIndex(0);
        break;
      case "End":
        e.preventDefault();
        focusIndex(tabs.length - 1);
        break;
    }
  }

  return (
    <>
      {label && <span className="text-muted-foreground mr-1">{label}</span>}
      <div role="tablist" aria-label="Browse by" className="flex flex-wrap items-center gap-2">
        {tabs.map((tab, i) => {
          const selected = tab.id === activeId;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className={`px-4 py-1.5 rounded-full border transition-colors ${
                selected
                  ? "bg-[#005A9C] text-white border-[#005A9C]"
                  : "border-[#005A9C] text-[#005A9C] hover:bg-[#005A9C] hover:text-white"
              }`}
            >
              {tab.label}
              {tab.badge && (
                <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-[#F2A900] text-white align-middle">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}

export function BrowseByPanel({ id, children }: { id: string; children: ReactNode }) {
  const { activeId } = useBrowseByContext();
  const selected = activeId === id;
  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      className={selected ? "block" : "hidden"}
    >
      {children}
    </div>
  );
}
