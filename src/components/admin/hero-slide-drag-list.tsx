"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  GripVerticalIcon,
  EditIcon,
  Trash2Icon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";
import Image from "next/image";
import { IHeroSlideWithImage } from "@/types/hero-slide";

interface HeroSlideDragListProps {
  slides: IHeroSlideWithImage[];
  onEdit: (slide: IHeroSlideWithImage) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onReorder: (slides: { id: string; display_order: number }[]) => void;
}

interface SortableItemProps {
  slide: IHeroSlideWithImage;
  onEdit: (slide: IHeroSlideWithImage) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
}

function SortableItem({
  slide,
  onEdit,
  onDelete,
  onToggleStatus,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? "opacity-50" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
          >
            <GripVerticalIcon className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="flex-1 flex items-center space-x-4">
            {/* Image */}
            <div className="relative w-16 h-16 rounded-lg overflow-hidden">
              {slide.image?.backblaze_url ? (
                <Image
                  src={slide.image.backblaze_url}
                  alt={slide.title || "Hero Slide Image"}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    No image
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-medium truncate">{slide.title}</h3>
                <Badge variant={slide.is_active ? "default" : "secondary"}>
                  {slide.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              {slide.subtitle && (
                <p className="text-sm text-muted-foreground truncate">
                  {slide.subtitle}
                </p>
              )}
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  Order: {slide.display_order}
                </span>
                {slide.is_landscape_image && (
                  <Badge variant="outline" className="text-xs">
                    Landscape
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleStatus(slide.id, !slide.is_active)}
            >
              {slide.is_active ? (
                <EyeOffIcon className="w-4 h-4" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
            </Button>
            <Button variant="default" size="sm" onClick={() => onEdit(slide)}>
              <EditIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(slide.id)}
            >
              <Trash2Icon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function HeroSlideDragList({
  slides,
  onEdit,
  onDelete,
  onToggleStatus,
  onReorder,
}: HeroSlideDragListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [slideToDelete, setSlideToDelete] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = slides.findIndex((slide) => slide.id === active.id);
      const newIndex = slides.findIndex((slide) => slide.id === over.id);

      const newSlides = arrayMove(slides, oldIndex, newIndex);
      const reorderedSlides = newSlides.map((slide, index) => ({
        id: slide.id,
        display_order: index + 1,
      }));

      onReorder(reorderedSlides);
    }
  };

  const handleDelete = (id: string) => {
    setSlideToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (slideToDelete) {
      onDelete(slideToDelete);
      setDeleteDialogOpen(false);
      setSlideToDelete(null);
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={slides.map((slide) => slide.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {slides.map((slide) => (
              <SortableItem
                key={slide.id}
                slide={slide}
                onEdit={onEdit}
                onDelete={handleDelete}
                onToggleStatus={onToggleStatus}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hero Slide</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this hero slide? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
