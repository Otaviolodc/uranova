export type Profile = {
  id: string;

  name: string | null;
  username: string | null;
  email?: string | null;

  avatar_url: string | null;
  bio: string | null;

  phone: string | null;

  city: string | null;
  state: string | null;
  address: string | null;

  instagram: string | null;
  telegram: string | null;
  whatsapp: string | null;

  featured_text: string | null;
  featured_url: string | null;

  product_text_color: string | null;

  theme_color: string;
  background_color: string;
  button_style: string;
  background_style: string;
  card_style: string;
  font_style: string;
  template: string;

  stripe_customer: string | null;

  subscription_status: string | null;
  subscription_plan: string | null;
  subscription_end: string | null;

  is_pro: boolean;
  role: "user" | "admin";

  created_at: string;
  updated_at: string;
};