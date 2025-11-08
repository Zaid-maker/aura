import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  verified?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function VerifiedBadge({
  verified = false,
  size = "sm",
  className,
}: VerifiedBadgeProps) {
  if (!verified) return null;

  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <BadgeCheck
      className={cn(
        "fill-blue-500 text-white inline-flex shrink-0",
        sizeClasses[size],
        className
      )}
      aria-label="Verified"
    />
  );
}
