"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ImageIcon } from "lucide-react";
import { IHeroSlideWithImage } from "@/types/hero-slide";
import {
  getHeroSlides,
  deleteHeroSlide,
  toggleHeroSlideStatus,
  reorderHeroSlides,
} from "@/lib/actions/hero-slides";
import { HeroSlideManagementDialog } from "@/components/admin/hero-slide-management-dialog";
import { HeroSlideDragList } from "@/components/admin/hero-slide-drag-list";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export default function HeroSlidesPage() {
  const [editingSlide, setEditingSlide] = useState<IHeroSlideWithImage | null>(
    null
  );
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);

  const {
    data: heroSlides,
    isLoading: loadingSlides,
    refetch: refetchSlides,
  } = useQuery({
    queryKey: ["hero-slides"],
    queryFn: getHeroSlides,
  });

  const handleCreate = () => {
    setEditingSlide(null);
    setDialogMode("create");
  };

  const handleEdit = (slide: IHeroSlideWithImage) => {
    setEditingSlide(slide);
    setDialogMode("edit");
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteHeroSlide(id);
      if (result.success) {
        toast.success("Hero slide deleted successfully");
        refetchSlides();
      } else {
        toast.error(result.error || "Failed to delete hero slide");
      }
    } catch (error) {
      console.error("Error deleting slide:", error);
      toast.error("Failed to delete hero slide");
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      const result = await toggleHeroSlideStatus(id, isActive);
      if (result.success) {
        toast.success(
          `Hero slide ${isActive ? "activated" : "deactivated"} successfully`
        );
        refetchSlides();
      } else {
        toast.error(result.error || "Failed to update hero slide status");
      }
    } catch (error) {
      console.error("Error toggling slide status:", error);
      toast.error("Failed to update hero slide status");
    }
  };

  const handleReorder = async (
    reorderedSlides: { id: string; display_order: number }[]
  ) => {
    try {
      const result = await reorderHeroSlides(reorderedSlides);
      if (result.success) {
        toast.success("Hero slides reordered successfully");
        refetchSlides();
      } else {
        toast.error(result.error || "Failed to reorder hero slides");
      }
    } catch (error) {
      console.error("Error reordering slides:", error);
      toast.error("Failed to reorder hero slides");
    }
  };

  const handleDialogSuccess = () => {
    refetchSlides();
  };

  const activeSlides = heroSlides?.filter((slide) => slide.is_active);
  const inactiveSlides = heroSlides?.filter((slide) => !slide.is_active);

  if (loadingSlides) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Hero Slides</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hero Slides</h1>
          <p className="text-muted-foreground">
            Manage your homepage hero carousel slides
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Slide
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{heroSlides?.length}</p>
                <p className="text-sm text-muted-foreground">Total Slides</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Badge variant="default" className="w-5 h-5 rounded-full" />
              <div>
                <p className="text-2xl font-bold">
                  {activeSlides?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Active Slides</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="w-5 h-5 rounded-full" />
              <div>
                <p className="text-2xl font-bold">
                  {inactiveSlides?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Inactive Slides</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Slides List */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Slides</CardTitle>
        </CardHeader>
        <CardContent>
          {heroSlides?.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hero slides yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first hero slide to get started
              </p>
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Slide
              </Button>
            </div>
          ) : (
            <HeroSlideDragList
              slides={heroSlides || []}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              onReorder={handleReorder}
            />
          )}
        </CardContent>
      </Card>

      {/* Management Dialog */}
      {dialogMode && (
        <HeroSlideManagementDialog
          open={!!dialogMode}
          mode={dialogMode}
          slide={editingSlide}
          onClose={() => {
            setEditingSlide(null);
            setDialogMode(null);
          }}
          onSuccess={handleDialogSuccess}
        />
      )}
    </div>
  );
}
