"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreatePostDialog } from "@/components/create-post-dialog";
import { useRouter } from "next/navigation";

export default function CreatePage() {
  const [open, setOpen] = useState(true);
  const router = useRouter();

  const handleClose = () => {
    setOpen(false);
    // Navigate back after animation
    setTimeout(() => router.back(), 200);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <CreatePostDialog open={open} onOpenChange={handleClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
