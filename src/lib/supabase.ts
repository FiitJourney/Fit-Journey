import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseAnonKey && supabaseUrl !== '' && supabaseAnonKey !== ''
}

export type Profile = {
  id: string
  name: string
  weight_goal: number
  current_weight: number
  created_at: string
}

export type Juice = {
  id: string
  user_id: string
  name: string
  ingredients: string[]
  benefits: string
  calories: number
  day_of_week: string
  consumed: boolean
  consumed_at: string | null
  created_at: string
}

export type Progress = {
  id: string
  user_id: string
  weight: number
  notes: string | null
  created_at: string
}
