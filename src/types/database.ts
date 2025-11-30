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
      folders: {
        Row: {
          id: string
          user_id: string
          name: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          sort_order?: number
          created_at?: string
        }
      }
      prompts: {
        Row: {
          id: string
          user_id: string
          folder_id: string | null
          title: string
          content: string
          platform: string | null
          notes: string | null
          usage_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          folder_id?: string | null
          title: string
          content: string
          platform?: string | null
          notes?: string | null
          usage_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          folder_id?: string | null
          title?: string
          content?: string
          platform?: string | null
          notes?: string | null
          usage_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          user_id: string
          name: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
        }
      }
      prompt_tags: {
        Row: {
          prompt_id: string
          tag_id: string
        }
        Insert: {
          prompt_id: string
          tag_id: string
        }
        Update: {
          prompt_id?: string
          tag_id?: string
        }
      }
    }
  }
}

export type Folder = Database['public']['Tables']['folders']['Row']
export type Prompt = Database['public']['Tables']['prompts']['Row']
export type Tag = Database['public']['Tables']['tags']['Row']
export type PromptTag = Database['public']['Tables']['prompt_tags']['Row']

export type PromptWithTags = Prompt & {
  tags: Tag[]
}

export type TagWithCount = Tag & {
  count: number
}
