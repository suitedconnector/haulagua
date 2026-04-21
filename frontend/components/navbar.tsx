"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 relative" style={{ height: "100px", overflow: "visible" }}>      <div style={{ position: "absolute", inset: 0, zIndex: 0, lineHeight: 0 }}>
        <svg width="100%" height="100%" viewBox="0 0 390 100" preserveAspectRatio="none" style={{ filter: "drop-shadow(0 25px 12px rgba(0, 90, 156, 0.4))" }}>
          <path d="M0,0 L390,0 L390,75 Q293,100 195,75 Q98,50 0,75 Z" fill="white" />
        </svg>
      </div>
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="font-serif text-2xl tracking-tight">
              <span className="font-bold text-primary">HAUL</span>
              <span className="font-light text-foreground">AGUA</span>
            </span>
          </Link>
          <div className="hidden md:flex md:items-center md:gap-8">
            <Link href="/search" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Find a Hauler</Link>
            <Link href="/water-haulers" className="text-sm font-medium text-foreground hover:text-primary transition-colors">By Location</Link>
            <Link href="/resources" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Resource Center</Link>
            <Link href="/for-haulers" className="text-sm font-medium text-foreground hover:text-primary transition-colors">For Haulers</Link>
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Link href="/login">Login</Link>
            </Button>
          </div>
          <button type="button" className="md:hidden p-2 text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4 bg-white rounded-b-xl">
            <div className="flex flex-col gap-4">
              <Link href="/search" className="text-sm font-medium text-foreground hover:text-primary transition-colors px-2 py-2" onClick={() => setMobileMenuOpen(false)}>Find a Hauler</Link>
              <Link href="/water-haulers" className="text-sm font-medium text-foreground hover:text-primary transition-colors px-2 py-2" onClick={() => setMobileMenuOpen(false)}>By Location</Link>
              <Link href="/resources" className="text-sm font-medium text-foreground hover:text-primary transition-colors px-2 py-2" onClick={() => setMobileMenuOpen(false)}>Resource Center</Link>
              <Link href="/for-haulers" className="text-sm font-medium text-foreground hover:text-primary transition-colors px-2 py-2" onClick={() => setMobileMenuOpen(false)}>For Haulers</Link>
              <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground w-full">
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}