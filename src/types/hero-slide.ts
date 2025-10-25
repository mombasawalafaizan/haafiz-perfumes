export interface IImage {
  id: string;
  backblaze_url: string;
  alt_text?: string;
  context?: string;
  created_at: string;
}

export interface IHeroSlide {
  id: string;
  image_id?: string | null;
  image_url?: string | null;
  title?: string | null;
  subtitle?: string | null;
  button_text?: string | null;
  link_url?: string | null;
  is_internal_link: boolean;
  is_landscape_image: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IHeroSlideWithImage extends IHeroSlide {
  image?: IImage | null;
}

export interface ICreateHeroSlide {
  image_id?: string | null;
  image_url?: string | null;
  title?: string | null;
  subtitle?: string | null;
  button_text?: string | null;
  link_url?: string | null;
  is_internal_link?: boolean;
  is_landscape_image?: boolean;
  display_order?: number;
  is_active?: boolean;
}
