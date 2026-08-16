"use client";

import { useState, useEffect } from "react";
import { Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TooltipSimple } from "@/components/ui/tooltip";
import { ImageUpload } from "./image-upload";
import { ICreateHeroSlide } from "@/types/hero-slide";

interface HeroSlideFormProps {
  slideData: ICreateHeroSlide;
  onDataChange: (data: ICreateHeroSlide) => void;
}

function FieldHint({ content }: { content: string }) {
  return (
    <TooltipSimple content={content}>
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground inline-flex"
        aria-label="More info"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
    </TooltipSimple>
  );
}

export function HeroSlideForm({ slideData, onDataChange }: HeroSlideFormProps) {
  const [formData, setFormData] = useState<ICreateHeroSlide>(slideData);

  useEffect(() => {
    setFormData(slideData);
  }, [slideData]);

  const handleInputChange = (
    field: keyof ICreateHeroSlide,
    value: string | boolean
  ) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
  };

  const handleImageSelect = (image: { id: string; url: string }) => {
    const newData = {
      ...formData,
      image_id: image.id,
      image_url: image.url,
    };
    setFormData(newData);
    onDataChange(newData);
  };

  const handleImageRemove = () => {
    const newData = {
      ...formData,
      image_id: null,
      image_url: null,
    };
    setFormData(newData);
    onDataChange(newData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Slide Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="title">Title</Label>
              <FieldHint content="If Title, Subtitle, and Button Text are all left empty, the image is shown without the dark overlay." />
            </div>
            <Input
              id="title"
              value={formData.title || ""}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter slide title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Textarea
              id="subtitle"
              value={formData.subtitle || ""}
              onChange={(e) => handleInputChange("subtitle", e.target.value)}
              placeholder="Enter slide subtitle"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="button_text">Button Text</Label>
              <FieldHint content="Leave empty while a Link URL is set to make the whole image clickable instead of showing a button." />
            </div>
            <Input
              id="button_text"
              value={formData.button_text || ""}
              onChange={(e) => handleInputChange("button_text", e.target.value)}
              placeholder="Enter button text"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="link_url">Link URL</Label>
              <FieldHint content="Used as the button's destination. If Button Text is empty, clicking anywhere on the image goes here instead." />
            </div>
            <Input
              id="link_url"
              value={formData.link_url || ""}
              onChange={(e) => handleInputChange("link_url", e.target.value)}
              placeholder="Enter link URL"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Image Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUpload
            onImageSelect={handleImageSelect}
            onImageRemove={handleImageRemove}
            selectedImage={
              formData.image_id && formData.image_url
                ? { id: formData.image_id, url: formData.image_url }
                : null
            }
          />

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_landscape"
                checked={formData.is_landscape_image || false}
                onCheckedChange={(checked) =>
                  handleInputChange("is_landscape_image", checked)
                }
              />
              <Label htmlFor="is_landscape">
                Landscape Image (shown on desktop)
              </Label>
              <FieldHint content="On = shown to desktop visitors. Off = Portrait image, shown to mobile visitors instead. Desktop and mobile slides rotate in separate carousels." />
            </div>
            <p className="text-sm text-muted-foreground pl-11">
              Recommended size:{" "}
              {formData.is_landscape_image
                ? "1920×820px (21:9)"
                : "1080×1350px (4:5)"}
              , to avoid cropping.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="is_internal"
              checked={formData.is_internal_link || false}
              onCheckedChange={(checked) =>
                handleInputChange("is_internal_link", checked)
              }
            />
            <Label htmlFor="is_internal">Internal Link</Label>
            <FieldHint content="On = Link URL is a page on this site (e.g. /perfumes), navigated to instantly. Off = an external URL, opened in a new tab." />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active !== false}
              onCheckedChange={(checked) =>
                handleInputChange("is_active", checked)
              }
            />
            <Label htmlFor="is_active">Active</Label>
            <FieldHint content="Only Active slides appear in the live homepage carousel. Turn off to hide a slide without deleting it." />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
