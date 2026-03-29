"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Phone, Globe, MessageSquare, Eye } from "lucide-react";

export function ContactPanel({
  phone,
  website,
  name,
  slug,
  isClaimed,
}: {
  phone: string | null;
  website: string | null;
  name: string;
  slug: string;
  isClaimed: boolean;
}) {
  const [phoneRevealed, setPhoneRevealed] = useState(false);

  return (
    <div className="space-y-3">
      {phone && (
        <Button
          className="w-full h-11 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          onClick={() => {
            if (phoneRevealed) {
              window.location.href = `tel:${phone.replace(/\D/g, "")}`;
            } else {
              setPhoneRevealed(true);
            }
          }}
        >
          {phoneRevealed ? (
            <>
              <Phone className="h-4 w-4" />
              {phone}
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              Show Phone Number
            </>
          )}
        </Button>
      )}

      {website && (
        <Button
          variant="outline"
          className="w-full h-11 gap-2 border-primary text-primary hover:bg-primary/5 font-semibold"
          asChild
        >
          <a href={website} target="_blank" rel="noopener noreferrer">
            <Globe className="h-4 w-4" />
            Visit Website
          </a>
        </Button>
      )}

      <Button
        variant="outline"
        className="w-full h-11 gap-2 border-primary text-primary hover:bg-primary/5 font-semibold"
        onClick={() => {
          const subject = encodeURIComponent(`Quote Request — ${name}`);
          const body = encodeURIComponent(
            `Hi,\n\nI found your listing on Haulagua and I'm interested in a quote for bulk water delivery.\n\nPlease contact me at your earliest convenience.\n\nThank you.`
          );
          window.location.href = `mailto:?subject=${subject}&body=${body}`;
        }}
      >
        <MessageSquare className="h-4 w-4" />
        Request a Quote
      </Button>

      {/* Claim link — only show if unclaimed */}
      {!isClaimed && (
        <div className="pt-2 border-t border-border mt-1">
          <Link
            href={`/haulers/${slug}/claim`}
            className="block text-center text-xs text-muted-foreground hover:text-[#005A9C] transition-colors"
          >
            Is this your business?{" "}
            <span className="underline underline-offset-2">Claim this listing</span>
          </Link>
        </div>
      )}
    </div>
  );
}
