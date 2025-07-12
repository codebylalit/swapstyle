import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database table names
export const TABLES = {
  USERS: 'users',
  ITEMS: 'items',
  SWAPS: 'swaps',
  REDEMPTIONS: 'redemptions'
}

// Storage bucket names
export const STORAGE_BUCKETS = {
  ITEM_IMAGES: 'item-images',
  USER_AVATARS: 'user-avatars'
} 