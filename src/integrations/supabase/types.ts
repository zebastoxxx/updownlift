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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      client_machines: {
        Row: {
          assigned_date: string | null
          client_id: string
          id: string
          machine_id: string
        }
        Insert: {
          assigned_date?: string | null
          client_id: string
          id?: string
          machine_id: string
        }
        Update: {
          assigned_date?: string | null
          client_id?: string
          id?: string
          machine_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_machines_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_machines_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          city: string | null
          contact_person: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          status: string | null
          tax_id: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      machines: {
        Row: {
          action_required: boolean | null
          brand: string | null
          created_at: string
          current_hours: number | null
          id: string
          last_corrective_maintenance_date: string | null
          last_greasing_hours: number | null
          last_preop_date: string | null
          last_preop_id: string | null
          last_preventive_maintenance_date: string | null
          location: string | null
          model: string | null
          name: string
          next_certification_date: string | null
          next_preventive_hours: number | null
          serial_number: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          action_required?: boolean | null
          brand?: string | null
          created_at?: string
          current_hours?: number | null
          id?: string
          last_corrective_maintenance_date?: string | null
          last_greasing_hours?: number | null
          last_preop_date?: string | null
          last_preop_id?: string | null
          last_preventive_maintenance_date?: string | null
          location?: string | null
          model?: string | null
          name: string
          next_certification_date?: string | null
          next_preventive_hours?: number | null
          serial_number?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          action_required?: boolean | null
          brand?: string | null
          created_at?: string
          current_hours?: number | null
          id?: string
          last_corrective_maintenance_date?: string | null
          last_greasing_hours?: number | null
          last_preop_date?: string | null
          last_preop_id?: string | null
          last_preventive_maintenance_date?: string | null
          location?: string | null
          model?: string | null
          name?: string
          next_certification_date?: string | null
          next_preventive_hours?: number | null
          serial_number?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      preoperational: {
        Row: {
          checklist: Json | null
          coolant_level: string | null
          created_at: string
          datetime: string
          fuel_level: string | null
          greased: boolean | null
          horometer_final: number | null
          horometer_initial: number | null
          hoses_note: string | null
          hoses_status: string | null
          hours_worked: number | null
          hydraulic_level: string | null
          id: string
          lights_note: string | null
          lights_status: string | null
          machine_id: string
          observations: string | null
          oil_level: string | null
          project_id: string
          sync_status: string | null
          tires_action: string | null
          tires_bearing_issue: boolean | null
          tires_punctured: boolean | null
          tires_wear: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          checklist?: Json | null
          coolant_level?: string | null
          created_at?: string
          datetime?: string
          fuel_level?: string | null
          greased?: boolean | null
          horometer_final?: number | null
          horometer_initial?: number | null
          hoses_note?: string | null
          hoses_status?: string | null
          hours_worked?: number | null
          hydraulic_level?: string | null
          id?: string
          lights_note?: string | null
          lights_status?: string | null
          machine_id: string
          observations?: string | null
          oil_level?: string | null
          project_id: string
          sync_status?: string | null
          tires_action?: string | null
          tires_bearing_issue?: boolean | null
          tires_punctured?: boolean | null
          tires_wear?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          checklist?: Json | null
          coolant_level?: string | null
          created_at?: string
          datetime?: string
          fuel_level?: string | null
          greased?: boolean | null
          horometer_final?: number | null
          horometer_initial?: number | null
          hoses_note?: string | null
          hoses_status?: string | null
          hours_worked?: number | null
          hydraulic_level?: string | null
          id?: string
          lights_note?: string | null
          lights_status?: string | null
          machine_id?: string
          observations?: string | null
          oil_level?: string | null
          project_id?: string
          sync_status?: string | null
          tires_action?: string | null
          tires_bearing_issue?: boolean | null
          tires_punctured?: boolean | null
          tires_wear?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      preoperational_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          photo_type: string
          preoperational_id: string
          url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          photo_type: string
          preoperational_id: string
          url: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          photo_type?: string
          preoperational_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "preoperational_photos_preoperational_id_fkey"
            columns: ["preoperational_id"]
            isOneToOne: false
            referencedRelation: "preoperational"
            referencedColumns: ["id"]
          },
        ]
      }
      project_clients: {
        Row: {
          assigned_date: string | null
          client_id: string
          id: string
          project_id: string
        }
        Insert: {
          assigned_date?: string | null
          client_id: string
          id?: string
          project_id: string
        }
        Update: {
          assigned_date?: string | null
          client_id?: string
          id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_clients_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_machines: {
        Row: {
          assigned_date: string | null
          id: string
          machine_id: string
          project_id: string
        }
        Insert: {
          assigned_date?: string | null
          id?: string
          machine_id: string
          project_id: string
        }
        Update: {
          assigned_date?: string | null
          id?: string
          machine_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_machines_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_machines_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          address: string | null
          city: string | null
          client_name: string | null
          country: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          location: string | null
          name: string
          start_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          client_name?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          name: string
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          client_name?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          name?: string
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          created_by: string | null
          full_name: string | null
          id: string
          password_hash: string
          role: string
          status: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          full_name?: string | null
          id?: string
          password_hash: string
          role?: string
          status?: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          full_name?: string | null
          id?: string
          password_hash?: string
          role?: string
          status?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
