export interface Judge {
  id: string
  name: string
  title: string
  specialization: string
  experience: string
  bio: string
  location: string
  email: string
  phone: string
  image_url: string
  philosophy: string
  certifications: string[]
  achievements: string[]
  specialties: string[]
  competitions_judged: number
  years_experience: number
  certification_level: string
  is_active: boolean
  is_featured: boolean
  sort_order: number
  created_by?: string
  updated_by?: string
  created_at: string
  updated_at: string
}

export interface CreateJudgeRequest {
  name: string
  title: string
  specialization: string
  experience: string
  bio: string
  location: string
  email: string
  phone: string
  image_url?: string
  philosophy: string
  certifications: string[]
  achievements: string[]
  specialties: string[]
  competitions_judged?: number
  years_experience?: number
  certification_level: string
  is_active?: boolean
  is_featured?: boolean
  sort_order?: number
}

export interface UpdateJudgeRequest extends Partial<CreateJudgeRequest> {
  id: string
}

export interface JudgesState {
  judges: Judge[]
  loading: boolean
  error: string | null
  selectedJudge: Judge | null
}

export interface JudgeFormData {
  name: string
  title: string
  specialization: string
  experience: string
  bio: string
  location: string
  email: string
  phone: string
  philosophy: string
  certifications: string[]
  achievements: string[]
  specialties: string[]
  competitions_judged: number
  years_experience: number
  certification_level: string
  is_active: boolean
  is_featured: boolean
  sort_order: number
} 