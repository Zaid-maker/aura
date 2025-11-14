"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "POST" | "COMMENT" | "USER";
  contentId: string; // postId, commentId, or reportedUserId
  contentType?: string; // Optional: description of what's being reported
}

const REPORT_REASONS = [
  {
    value: "SPAM",
    label: "Spam",
    description: "Repetitive or unsolicited content",
  },
  {
    value: "HARASSMENT",
    label: "Harassment or Bullying",
    description: "Intimidating or abusive behavior",
  },
  {
    value: "HATE_SPEECH",
    label: "Hate Speech",
    description: "Discriminatory or offensive content",
  },
  {
    value: "VIOLENCE",
    label: "Violence or Dangerous Content",
    description: "Content promoting violence or harm",
  },
  {
    value: "NUDITY",
    label: "Nudity or Sexual Content",
    description: "Inappropriate explicit content",
  },
  {
    value: "SELF_HARM",
    label: "Self-Harm or Suicide",
    description: "Content promoting self-harm",
  },
  {
    value: "FALSE_INFORMATION",
    label: "False Information",
    description: "Misleading or fake content",
  },
  {
    value: "BULLYING",
    label: "Bullying",
    description: "Content targeting individuals",
  },
  {
    value: "INTELLECTUAL_PROPERTY",
    label: "Intellectual Property Violation",
    description: "Copyright or trademark infringement",
  },
  { value: "OTHER", label: "Other", description: "Something else" },
];

export function ReportDialog({
  open,
  onOpenChange,
  type,
  contentId,
  contentType,
}: ReportDialogProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error("Please select a reason for your report");
      return;
    }

    setIsSubmitting(true);

    try {
      const reportData: any = {
        type,
        reason: selectedReason,
        description: description.trim() || undefined,
      };

      // Add the appropriate content ID based on type
      if (type === "POST") {
        reportData.postId = contentId;
      } else if (type === "COMMENT") {
        reportData.commentId = contentId;
      } else if (type === "USER") {
        reportData.reportedUserId = contentId;
      }

      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Report submitted successfully", {
          description: "Our team will review your report.",
        });
        onOpenChange(false);
        // Reset form
        setSelectedReason("");
        setDescription("");
      } else {
        toast.error(data.error || "Failed to submit report");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Report {type.toLowerCase()}
          </DialogTitle>
          <DialogDescription>
            {contentType
              ? `Help us understand what's wrong with this ${contentType.toLowerCase()}.`
              : "Help us understand what's wrong with this content."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Reason Selection */}
          <div className="space-y-3">
            <Label>Why are you reporting this?</Label>
            <RadioGroup
              value={selectedReason}
              onValueChange={setSelectedReason}
            >
              {REPORT_REASONS.map((reason) => (
                <div
                  key={reason.value}
                  className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => setSelectedReason(reason.value)}
                >
                  <RadioGroupItem value={reason.value} id={reason.value} />
                  <div className="flex-1 space-y-1">
                    <Label
                      htmlFor={reason.value}
                      className="font-medium cursor-pointer"
                    >
                      {reason.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {reason.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Additional Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Additional details (optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide any additional information that might help us review this report..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/1000 characters
            </p>
          </div>

          {/* Privacy Notice */}
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">
              Your report is anonymous. The person or content you're reporting
              won't know who submitted the report.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedReason || isSubmitting}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
