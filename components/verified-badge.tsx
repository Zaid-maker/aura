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
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
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
