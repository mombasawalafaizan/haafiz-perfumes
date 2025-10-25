"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IHeroSlideWithImage, ICreateHeroSlide } from "@/types/hero-slide";
import {
  createHeroSlide,
  updateHeroSlide,
  getNextDisplayOrder,
} from "@/lib/actions/hero-slides";
import { HeroSlideForm } from "./hero-slide-form";
import { HeroSlidePreview } from "./hero-slide-preview";
import { toast } from "sonner";

interface HeroSlideManagementDialogProps {
  open: boolean;
  mode: "create" | "edit";
  slide: IHeroSlideWithImage | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function HeroSlideManagementDialog({
  open,
  mode,
  slide,
  onClose,
  onSuccess,
}: HeroSlideManagementDialogProps) {
  const [slideData, setSlideData] = useState<ICreateHeroSlide>({
    title: "",
    subtitle: "",
    button_text: "",
    link_url: "",
    is_internal_link: false,
    is_landscape_image: false,
    is_active: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "edit" && slide) {
      setSlideData({
        title: slide.title,
        subtitle: slide.subtitle || "",
        button_text: slide.button_text || "",
        link_url: slide.link_url || "",
        is_internal_link: slide.is_internal_link,
        is_landscape_image: slide.is_landscape_image,
        is_active: slide.is_active,
        image_id: slide.image_id,
        image_url: slide.image_url,
      });
    } else if (mode === "create") {
      setSlideData({
        title: "",
        subtitle: "",
        button_text: "",
        link_url: "",
        is_internal_link: false,
        is_landscape_image: false,
        is_active: true,
      });
    }
  }, [mode, slide]);

  useEffect(() => {
    if (mode === "create" && open) {
      // Get next display order for new slides
      getNextDisplayOrder().then((order) => {
        setSlideData((prev) => ({ ...prev, display_order: order }));
      });
    }
  }, [mode, open]);

  const handleSave = async () => {
    setLoading(true);
    try {
      let result;
      if (mode === "create") {
        result = await createHeroSlide(slideData);
      } else if (slide) {
        result = await updateHeroSlide(slide.id, slideData);
      }

      if (result?.success) {
        toast.success(
          `Hero slide ${mode === "create" ? "created" : "updated"} successfully`
        );
        onSuccess();
        onClose();
      } else {
        toast.error(result?.error || "Failed to save hero slide");
      }
    } catch (error) {
      console.error("Error saving hero slide:", error);
      toast.error("Failed to save hero slide");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        aria-describedby={undefined}
        className="min-w-2xl max-h-[95vh]"
        showCloseButton={!loading}
      >
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Hero Slide" : "Edit Hero Slide"}
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-4">
              <HeroSlideForm
                slideData={slideData}
                onDataChange={setSlideData}
              />
            </div>

            <div className="space-y-4">
              <HeroSlidePreview slideData={slideData} />
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading
              ? "Saving..."
              : mode === "create"
              ? "Create Slide"
              : "Update Slide"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
