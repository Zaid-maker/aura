"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { Home, Search, PlusSquare, Heart, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { MobileNavSkeleton } from "@/components/navbar-skeleton";

const navItems = [
  { icon: Home, href: "/", label: "Home" },
  { icon: Search, href: "/explore", label: "Explore" },
  { icon: PlusSquare, href: "/create", label: "Create" },
  { icon: Heart, href: "/notifications", label: "Notifications" },
];

export function MobileNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Show skeleton while loading session
  if (status === "loading") {
    return <MobileNavSkeleton />;
  }

  return (
    <>
      {/* Bottom spacing to prevent content from being hidden behind nav */}
      <div className="h-20 md:hidden" />

      {/* Mobile Bottom Navigation */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      >
        {/* Backdrop blur effect */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-lg border-t" />

        {/* Navigation items */}
        <div className="relative flex items-center justify-around px-2 py-2 h-16">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              icon={item.icon}
              href={item.href}
              label={item.label}
              isActive={pathname === item.href}
            />
          ))}

          {/* Profile */}
          <Link
            href={
              session?.user?.username
                ? `/${session.user.username}`
                : "/auth/signin"
            }
            className="relative flex flex-col items-center justify-center w-14 h-14"
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              className={cn(
                "relative transition-all duration-200",
                pathname === `/${session?.user?.username}` &&
                  "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-full",
              )}
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </motion.div>
          </Link>
        </div>
      </motion.nav>
    </>
  );
}

interface NavItemProps {
  icon: React.ElementType;
  href: string;
  label: string;
  isActive: boolean;
}

function NavItem({ icon: Icon, href, label, isActive }: NavItemProps) {
  const scale = useMotionValue(1);
  const y = useMotionValue(0);

  // Spring animation values
  const scaleTransform = useTransform(scale, [0.9, 1, 1.1], [0.9, 1, 1.1]);
  const yTransform = useTransform(y, [-5, 0], [-5, 0]);

  return (
    <Link
      href={href}
      className="relative flex flex-col items-center justify-center w-14 h-14"
    >
      <motion.div
        style={{ scale: scaleTransform, y: yTransform }}
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.05 }}
        onTapStart={() => {
          scale.set(0.9);
          y.set(-2);
        }}
        onTap={() => {
          scale.set(1);
          y.set(0);
        }}
        className="relative"
      >
        {/* Active indicator dot */}
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}

        <motion.div
          animate={{
            scale: isActive ? 1.1 : 1,
            rotate: isActive ? [0, -10, 10, -10, 0] : 0,
          }}
          transition={{
            scale: { type: "spring", stiffness: 300, damping: 20 },
            rotate: { duration: 0.5, ease: "easeInOut" },
          }}
        >
          <Icon
            className={cn(
              "h-6 w-6 transition-colors duration-200",
              isActive ? "text-primary fill-primary" : "text-muted-foreground",
            )}
            strokeWidth={isActive ? 2.5 : 2}
          />
        </motion.div>
      </motion.div>

      {/* Label - only show on long press */}
      <motion.span
        initial={{ opacity: 0, y: 5 }}
        whileHover={{ opacity: 1, y: 0 }}
        className="absolute -bottom-1 text-[10px] font-medium text-muted-foreground"
      >
        {label}
      </motion.span>
    </Link>
  );
}
