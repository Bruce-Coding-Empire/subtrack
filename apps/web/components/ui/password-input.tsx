"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

function PasswordInput({ className, ...props }: Omit<React.ComponentProps<"input">, "type">) {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <div className="relative">
      <Input type={isVisible ? "text" : "password"} className={cn(className, "pl-3 pr-9")} {...props} />
      <button
        type="button"
        onClick={() => setIsVisible((visible) => !visible)}
        tabIndex={-1}
        aria-label={isVisible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 text-text-muted hover:text-text-secondary"
      >
        {isVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export { PasswordInput };
