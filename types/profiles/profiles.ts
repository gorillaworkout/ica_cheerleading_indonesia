export type ProfileRole = "admin" | "coach" | "athlete" | "judge";

export interface Profile {
  id: string; // uuid
  email: string;
  display_name: string | null;
  role: ProfileRole;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  user_id: string | null;
  gender: string | null;
  birth_date: string | null; // date in 'YYYY-MM-DD' format
  phone_number: string | null;
  id_photo_url: string | null;
  profile_photo_url: string | null;
  is_verified: boolean | null;
  province_code: string | null;
  member_code: string | null;
}
