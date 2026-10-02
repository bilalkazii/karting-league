"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CopyShareTextButtonProps {
  text: string;
  label?: string;
}

export function CopyShareTextButton({ text, label = "Copy summary" }: CopyShareTextButtonProps) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");

  const handleCopy = async () => {
    if (!navigator.clipboard) {
      setState("error");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
      window.setTimeout(() => setState("idle"), 2200);
    } catch {
      setState("error");
    }
  };

  const statusLabel = state === "copied" ? "Copied" : state === "error" ? "Copy failed" : "";

  return (
    <Button type="button" variant="secondary" size="sm" onClick={handleCopy} disabled={!text} className="min-h-8">
      {state === "copied" ? <Check size={13} className="text-[var(--green)]" /> : <Copy size={13} />}
      {state === "copied" ? "Copied" : label}
      {state === "error" && <span className="text-[var(--amber)]">copy unsupported — select the text manually</span>}
      <span className="sr-only" aria-live="polite">{statusLabel}</span>
    </Button>
  );
}