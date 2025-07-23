import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log("[DEBUG] Supabase URL:", supabaseUrl);
console.log(
  "[DEBUG] Supabase Anon Key:",
  supabaseAnonKey ? "Loaded" : "Missing"
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Utility function to get the current site URL for email redirects
export const getSiteUrl = () => {
  return "https://wearshare.vercel.app/";
};

export const TABLES = {
  USERS: "users",
  ITEMS: "items",
  SWAPS: "swaps",
  REDEMPTIONS: "redemptions",
};

export const STORAGE_BUCKETS = {
  ITEM_IMAGES: "item-images",
  USER_AVATARS: "user-avatars",
};
