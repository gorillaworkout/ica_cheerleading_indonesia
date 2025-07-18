export interface User {
  id: string
  email: string
  displayName: string
  role: "admin" | "coach" | "user"
  createdAt: string
}

export interface Competition {
  id: string
  name: string
  description: string
  date: string
  location: string
  divisions: Division[]
  registrationOpen: boolean
  createdAt: string
  slug:string
}

export interface Division {
  id: string
  name: string
  age_group: string
  skill_level: string
  queue: number
}

export interface Team {
  id: string
  name: string
  coachId: string
  competitionId: string
  divisionId: string
  athletes: Athlete[]
  registeredAt: string
}

export interface Athlete {
  id: string
  name: string
  age: number
  teamId: string
  divisionId: string
}

export interface CompetitionResult {
  id: string
  competitionId: string
  divisionId: string
  teamId: string
  placement: number
  score: number
  createdAt: string
}

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          role: "admin" | "coach" | "user"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          display_name?: string | null
          role?: "admin" | "coach" | "user"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          role?: "admin" | "coach" | "user"
          updated_at?: string
        }
      }
    }
  }
}


export interface DivisionDetailsProps {
  id: string
  name: string
  age_group: string
  skill_level: string
}

export interface CompetitionProps {
  id: string
  name: string
  description: string
  date: string
  location: string
  registrationOpen: boolean
  registrationDeadline: string
  // divisions: DivisionDetailsProps[]
}


export interface newsImageProps {
  src:string;
  alt:string;
}