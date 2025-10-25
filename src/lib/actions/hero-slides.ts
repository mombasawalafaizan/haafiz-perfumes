"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { ICreateHeroSlide, IHeroSlideWithImage } from "@/types/hero-slide";

export async function getHeroSlides(): Promise<IHeroSlideWithImage[]> {
  try {
    const { data, error } = await supabase
      .from("hero_slides")
      .select(
        `
        *,
        image:images(
          id,
          backblaze_url,
          alt_text
        )
      `
      )
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching hero slides:", error);
      return [];
    }

    return data as IHeroSlideWithImage[];
  } catch (error) {
    console.error("Error in getHeroSlides:", error);
    return [];
  }
}

export async function getHeroSlideById(
  id: string
): Promise<IHeroSlideWithImage | null> {
  try {
    const { data, error } = await supabase
      .from("hero_slides")
      .select(
        `
        *,
        image:images(
          id,
          backblaze_url,
          alt_text
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching hero slide with ID ${id}:`, error);
      return null;
    }

    return data as IHeroSlideWithImage;
  } catch (error) {
    console.error("Error in getHeroSlideById:", error);
    return null;
  }
}

export async function getNextDisplayOrder(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from("hero_slides")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 means no rows found, which is fine for initial state
      console.error("Error fetching next display order:", error);
      return 1;
    }

    return (data?.display_order || 0) + 1;
  } catch (error) {
    console.error("Error in getNextDisplayOrder:", error);
    return 1;
  }
}

export async function createHeroSlide(slideData: ICreateHeroSlide): Promise<{
  success: boolean;
  data: IHeroSlideWithImage | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from("hero_slides")
      .insert(slideData)
      .select(
        `
        *,
        image:images(
          id,
          backblaze_url,
          alt_text
        )
      `
      )
      .single();

    if (error) {
      console.error("Error creating hero slide:", error);
      return { success: false, data: null, error: error.message };
    }

    revalidatePath("/");
    return {
      success: true,
      data: data as unknown as IHeroSlideWithImage,
      error: null,
    };
  } catch (error) {
    console.error("Error in createHeroSlide:", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateHeroSlide(
  id: string,
  slideData: Partial<ICreateHeroSlide>
): Promise<{
  success: boolean;
  data: IHeroSlideWithImage | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from("hero_slides")
      .update(slideData)
      .eq("id", id)
      .select(
        `
        *,
        image:images(
          id,
          backblaze_url,
          alt_text
        )
      `
      )
      .single();

    if (error) {
      console.error(`Error updating hero slide with ID ${id}:`, error);
      return { success: false, data: null, error: error.message };
    }

    revalidatePath("/");
    return {
      success: true,
      data: data as unknown as IHeroSlideWithImage,
      error: null,
    };
  } catch (error) {
    console.error("Error in updateHeroSlide:", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteHeroSlide(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase.from("hero_slides").delete().eq("id", id);

    if (error) {
      console.error(`Error deleting hero slide with ID ${id}:`, error);
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    return { success: true, error: null };
  } catch (error) {
    console.error("Error in deleteHeroSlide:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function toggleHeroSlideStatus(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from("hero_slides")
      .update({ is_active: isActive })
      .eq("id", id);

    if (error) {
      console.error(
        `Error toggling status for hero slide with ID ${id}:`,
        error
      );
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/hero-slides");
    revalidatePath("/");
    return { success: true, error: null };
  } catch (error) {
    console.error("Error in toggleHeroSlideStatus:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function reorderHeroSlides(
  slides: { id: string; display_order: number }[]
): Promise<{ success: boolean; error: string | null }> {
  try {
    const updatePromises = slides.map((slide) =>
      supabase
        .from("hero_slides")
        .update({ display_order: slide.display_order })
        .eq("id", slide.id)
    );

    const results = await Promise.all(updatePromises);

    // Check for any errors
    const hasError = results.some((result) => result.error);
    if (hasError) {
      throw new Error("Failed to reorder hero slides");
    }

    revalidatePath("/");
    return { success: true, error: null };
  } catch (error) {
    console.error("Error in reorderHeroSlides:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
