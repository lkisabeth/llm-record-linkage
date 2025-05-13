import React from "react";
import { Info } from "lucide-react";
import { SheetTrigger } from "@/components/ui/sheet";

function Header() {
  return (
    <header className="w-full flex items-center justify-between py-6 px-4 md:px-8 mb-2">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary">LLM Record Linkage Comparison</h1>
        <p className="text-base text-foreground max-w-2xl mt-1">Select two models to compare their performance on record linkage.</p>
      </div>
      <SheetTrigger asChild>
        <button
          className="flex items-center gap-1 px-3 py-2 rounded-md text-primary hover:bg-accent border border-border shadow-sm transition"
          aria-label="About this experiment"
        >
          <Info className="w-5 h-5" />
          <span className="text-sm font-medium">About</span>
        </button>
      </SheetTrigger>
    </header>
  );
}

export default Header; 