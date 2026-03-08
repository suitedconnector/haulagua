"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

export function HeroSection() {
  const [serviceType, setServiceType] = useState("");
  const [zipCode, setZipCode] = useState("");

  return (
    <section className="relative bg-primary overflow-hidden">
      {/* Wave pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg
          className="absolute bottom-0 w-full h-32"
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 60C240 120 480 0 720 60C960 120 1200 0 1440 60V120H0V60Z"
            fill="white"
          />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
        <div className="text-center">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight text-balance">
            Fast, Reliable Bulk Water Delivery
          </h1>
          <p className="mt-4 md:mt-6 text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto text-pretty">
            Find trusted professional water haulers for your pool, construction site, or emergency needs
          </p>

          {/* Search Bar */}
          <div className="mt-8 md:mt-10 max-w-3xl mx-auto">
            <div className="bg-card rounded-xl p-3 md:p-4 shadow-xl">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1">
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger className="h-12 bg-background border-border text-foreground">
                      <SelectValue placeholder="Select Service Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="swimming-pool">Swimming Pool</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="agricultural">Agricultural</SelectItem>
                      <SelectItem value="potable-water">Potable Water</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Enter ZIP Code"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="h-12 bg-background border-border text-foreground"
                  />
                </div>
                <Button 
                  size="lg" 
                  className="h-12 px-8 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Find a Hauler
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
