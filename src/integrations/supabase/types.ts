export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agent_configs: {
        Row: {
          active: boolean | null
          agent_key: string
          auto_detect_language: boolean | null
          auto_escalate: boolean | null
          created_at: string
          id: string
          language: string | null
          max_retries: number | null
          name: string
          opening_script: string | null
          schedule_days: string[] | null
          schedule_end: string | null
          schedule_start: string | null
          slack_channel: string | null
          slack_notifications: boolean | null
          updated_at: string
          user_id: string
          voice_profile: string | null
        }
        Insert: {
          active?: boolean | null
          agent_key: string
          auto_detect_language?: boolean | null
          auto_escalate?: boolean | null
          created_at?: string
          id?: string
          language?: string | null
          max_retries?: number | null
          name: string
          opening_script?: string | null
          schedule_days?: string[] | null
          schedule_end?: string | null
          schedule_start?: string | null
          slack_channel?: string | null
          slack_notifications?: boolean | null
          updated_at?: string
          user_id: string
          voice_profile?: string | null
        }
        Update: {
          active?: boolean | null
          agent_key?: string
          auto_detect_language?: boolean | null
          auto_escalate?: boolean | null
          created_at?: string
          id?: string
          language?: string | null
          max_retries?: number | null
          name?: string
          opening_script?: string | null
          schedule_days?: string[] | null
          schedule_end?: string | null
          schedule_start?: string | null
          slack_channel?: string | null
          slack_notifications?: boolean | null
          updated_at?: string
          user_id?: string
          voice_profile?: string | null
        }
        Relationships: []
      }
      agent_documents: {
        Row: {
          agent_key: string
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          status: string | null
          user_id: string
        }
        Insert: {
          agent_key: string
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          status?: string | null
          user_id: string
        }
        Update: {
          agent_key?: string
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      agent_skills: {
        Row: {
          agent_key: string
          completed_at: string | null
          created_at: string
          id: string
          level: number | null
          skill_id: string
          user_id: string
          xp: number | null
        }
        Insert: {
          agent_key: string
          completed_at?: string | null
          created_at?: string
          id?: string
          level?: number | null
          skill_id: string
          user_id: string
          xp?: number | null
        }
        Update: {
          agent_key?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          level?: number | null
          skill_id?: string
          user_id?: string
          xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "bot_skills"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_skills: {
        Row: {
          category: string
          created_at: string
          description: string | null
          difficulty: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          prerequisites: string[] | null
          xp_reward: number | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          difficulty?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          prerequisites?: string[] | null
          xp_reward?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          difficulty?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          prerequisites?: string[] | null
          xp_reward?: number | null
        }
        Relationships: []
      }
      marketplace_skills: {
        Row: {
          author_id: string
          author_name: string | null
          category: string
          created_at: string
          description: string | null
          difficulty: string | null
          downloads: number | null
          icon: string | null
          id: string
          is_published: boolean | null
          is_verified: boolean | null
          name: string
          rating_avg: number | null
          rating_count: number | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          author_id: string
          author_name?: string | null
          category: string
          created_at?: string
          description?: string | null
          difficulty?: string | null
          downloads?: number | null
          icon?: string | null
          id?: string
          is_published?: boolean | null
          is_verified?: boolean | null
          name: string
          rating_avg?: number | null
          rating_count?: number | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          author_name?: string | null
          category?: string
          created_at?: string
          description?: string | null
          difficulty?: string | null
          downloads?: number | null
          icon?: string | null
          id?: string
          is_published?: boolean | null
          is_verified?: boolean | null
          name?: string
          rating_avg?: number | null
          rating_count?: number | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          notification_preferences: Json | null
          organization: string | null
          phone: string | null
          practice_name: string | null
          role: string | null
          specialty: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          notification_preferences?: Json | null
          organization?: string | null
          phone?: string | null
          practice_name?: string | null
          role?: string | null
          specialty?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          notification_preferences?: Json | null
          organization?: string | null
          phone?: string | null
          practice_name?: string | null
          role?: string | null
          specialty?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      skill_ratings: {
        Row: {
          created_at: string
          id: string
          rating: number
          review: string | null
          skill_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rating: number
          review?: string | null
          skill_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rating?: number
          review?: string | null
          skill_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_ratings_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "marketplace_skills"
            referencedColumns: ["id"]
          },
        ]
      }
      training_modules: {
        Row: {
          category: string
          content_url: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          duration_minutes: number | null
          icon: string | null
          id: string
          is_published: boolean | null
          order_index: number | null
          title: string
        }
        Insert: {
          category: string
          content_url?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          icon?: string | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          title: string
        }
        Update: {
          category?: string
          content_url?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          icon?: string | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          title?: string
        }
        Relationships: []
      }
      user_integrations: {
        Row: {
          api_key: string
          created_at: string
          id: string
          integration_key: string
          is_active: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: string
          integration_key: string
          is_active?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          integration_key?: string
          is_active?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_training_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          module_id: string
          progress_percent: number | null
          started_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          module_id: string
          progress_percent?: number | null
          started_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          module_id?: string
          progress_percent?: number | null
          started_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_training_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "master_admin" | "admin" | "manager" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["master_admin", "admin", "manager", "user"],
    },
  },
} as const
