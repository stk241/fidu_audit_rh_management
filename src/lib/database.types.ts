export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: 'ADMIN' | 'CHEF_DE_MISSION' | 'ASSISTANT'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: 'ADMIN' | 'CHEF_DE_MISSION' | 'ASSISTANT'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          role?: 'ADMIN' | 'CHEF_DE_MISSION' | 'ASSISTANT'
          created_at?: string
          updated_at?: string
        }
      }
      saisons: {
        Row: {
          id: string
          name: string
          start_date: string
          end_date: string
          status: 'ACTIVE' | 'ARCHIVED'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          start_date: string
          end_date: string
          status?: 'ACTIVE' | 'ARCHIVED'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          start_date?: string
          end_date?: string
          status?: 'ACTIVE' | 'ARCHIVED'
          created_at?: string
        }
      }
      feedbacks: {
        Row: {
          id: string
          content: string
          author_id: string
          collaborator_id: string
          saison_id: string
          mission: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content: string
          author_id: string
          collaborator_id: string
          saison_id: string
          mission?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content?: string
          author_id?: string
          collaborator_id?: string
          saison_id?: string
          mission?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      rapports: {
        Row: {
          id: string
          collaborator_id: string
          author_id: string
          saison_id: string
          content: string | null
          status: 'DRAFT' | 'VALIDATED'
          generated_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          collaborator_id: string
          author_id: string
          saison_id: string
          content?: string | null
          status?: 'DRAFT' | 'VALIDATED'
          generated_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          collaborator_id?: string
          author_id?: string
          saison_id?: string
          content?: string | null
          status?: 'DRAFT' | 'VALIDATED'
          generated_at?: string
          updated_at?: string
        }
      }
    }
  }
}
