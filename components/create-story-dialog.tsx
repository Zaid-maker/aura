"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadDropzone } from "@/lib/uploadthing";
import { X, Loader2, Clock } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface CreateStoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateStoryDialog({
  open,
  onOpenChange,
}: CreateStoryDialogProps) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateStory = async () => {
    if (!imageUrl) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl,
        }),
      });

      if (response.ok) {
        setImageUrl("");
        onOpenChange(false);
        toast.success("Story posted! Visible for 24 hours ⏰");
        router.refresh();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to create story");
      }
    } catch (error) {
      console.error("Error creating story:", error);
      toast.error("Failed to create story");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto dark:bg-zinc-950">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Create Story
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Clock className="h-4 w-4" />
              24h
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image Upload */}
          {!imageUrl ? (
            <div className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg p-8">
              <UploadDropzone
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  if (res && res[0]) {
                    setImageUrl(res[0].url);
                    toast.success("Image uploaded successfully");
                  }
                }}
                onUploadError={(error: Error) => {
                  toast.error(`Upload failed: ${error.message}`);
                }}
                appearance={{
                  button: "bg-blue-500 hover:bg-blue-600 text-white",
                  container: "border-0",
                }}
              />
            </div>
          ) : (
            <div className="relative w-full rounded-lg overflow-hidden bg-black">
              <div className="relative aspect-9/16">
                <Image
                  src={imageUrl}
                  alt="Story preview"
                  fill
                  className="object-contain"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => setImageUrl("")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Share Button */}
          {imageUrl && (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                <Clock className="h-4 w-4" />
                <span>Your story will be visible for 24 hours</span>
              </div>

              <Button
                onClick={handleCreateStory}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Share Story"
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
