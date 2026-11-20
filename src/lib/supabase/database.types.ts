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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      cod_spots: {
        Row: {
          active: boolean
          created_at: string
          hours: string
          id: string
          location: string
          name: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          hours: string
          id: string
          location: string
          name: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          hours?: string
          id?: string
          location?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      faculties: {
        Row: {
          active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      ktm_verifications: {
        Row: {
          created_at: string
          id: number
          identifier_number: string
          identifier_type: string
          photo_delete_due_at: string | null
          photo_deleted_at: string | null
          photo_path: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: never
          identifier_number: string
          identifier_type?: string
          photo_delete_due_at?: string | null
          photo_deleted_at?: string | null
          photo_path: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: never
          identifier_number?: string
          identifier_type?: string
          photo_delete_due_at?: string | null
          photo_deleted_at?: string | null
          photo_path?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ktm_verifications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ktm_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          always_available: boolean
          badge: string
          badge_tone: string
          card_bg: string
          category: string
          cod_spot_ids: string[]
          condition: string
          created_at: string
          description: string
          faculty: string
          id: number
          illustration: string
          is_umkm: boolean
          photos: string[]
          price: number
          seed_cod_spot_labels: string[]
          seed_seller_name: string | null
          seed_seller_prodi: string | null
          seller_id: string | null
          slug: string
          status: string
          stock: number
          title: string
          updated_at: string
        }
        Insert: {
          always_available?: boolean
          badge?: string
          badge_tone?: string
          card_bg?: string
          category: string
          cod_spot_ids?: string[]
          condition: string
          created_at?: string
          description?: string
          faculty: string
          id?: never
          illustration?: string
          is_umkm?: boolean
          photos?: string[]
          price?: number
          seed_cod_spot_labels?: string[]
          seed_seller_name?: string | null
          seed_seller_prodi?: string | null
          seller_id?: string | null
          slug: string
          status?: string
          stock?: number
          title: string
          updated_at?: string
        }
        Update: {
          always_available?: boolean
          badge?: string
          badge_tone?: string
          card_bg?: string
          category?: string
          cod_spot_ids?: string[]
          condition?: string
          created_at?: string
          description?: string
          faculty?: string
          id?: never
          illustration?: string
          is_umkm?: boolean
          photos?: string[]
          price?: number
          seed_cod_spot_labels?: string[]
          seed_seller_name?: string | null
          seed_seller_prodi?: string | null
          seller_id?: string | null
          slug?: string
          status?: string
          stock?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          href: string
          id: number
          message: string
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          href?: string
          id?: never
          message: string
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          href?: string
          id?: never
          message?: string
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          auto_complete_at: string | null
          buyer_id: string
          cancel_reason: string | null
          cod_spot_id: string
          cod_spot_name: string
          code: string
          created_at: string
          expires_at: string
          handed_over_at: string | null
          id: number
          listing_id: number
          listing_title: string
          note: string
          payment_method: string
          proposed_time: string
          quantity: number
          seller_id: string
          status: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          auto_complete_at?: string | null
          buyer_id: string
          cancel_reason?: string | null
          cod_spot_id: string
          cod_spot_name: string
          code: string
          created_at?: string
          expires_at?: string
          handed_over_at?: string | null
          id?: never
          listing_id: number
          listing_title: string
          note?: string
          payment_method?: string
          proposed_time: string
          quantity: number
          seller_id: string
          status?: string
          unit_price: number
          updated_at?: string
        }
        Update: {
          auto_complete_at?: string | null
          buyer_id?: string
          cancel_reason?: string | null
          cod_spot_id?: string
          cod_spot_name?: string
          code?: string
          created_at?: string
          expires_at?: string
          handed_over_at?: string | null
          id?: never
          listing_id?: number
          listing_title?: string
          note?: string
          payment_method?: string
          proposed_time?: string
          quantity?: number
          seller_id?: string
          status?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_cod_spot_id_fkey"
            columns: ["cod_spot_id"]
            isOneToOne: false
            referencedRelation: "cod_spots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          campus_email_verified: boolean
          civitas_role: string
          created_at: string
          deleted_at: string | null
          email: string
          faculty: string
          graduation_year: number | null
          id: string
          identifier_number: string | null
          identifier_type: string
          is_suspended: boolean
          is_umkm: boolean
          ktm_photo_path: string | null
          ktm_reason: string | null
          ktm_status: string
          name: string
          pdp_consent: boolean
          pdp_consent_at: string | null
          system_role: string
          unit_or_prodi: string
          updated_at: string
          wa: string
        }
        Insert: {
          campus_email_verified?: boolean
          civitas_role?: string
          created_at?: string
          deleted_at?: string | null
          email?: string
          faculty?: string
          graduation_year?: number | null
          id: string
          identifier_number?: string | null
          identifier_type?: string
          is_suspended?: boolean
          is_umkm?: boolean
          ktm_photo_path?: string | null
          ktm_reason?: string | null
          ktm_status?: string
          name: string
          pdp_consent?: boolean
          pdp_consent_at?: string | null
          system_role?: string
          unit_or_prodi?: string
          updated_at?: string
          wa?: string
        }
        Update: {
          campus_email_verified?: boolean
          civitas_role?: string
          created_at?: string
          deleted_at?: string | null
          email?: string
          faculty?: string
          graduation_year?: number | null
          id?: string
          identifier_number?: string | null
          identifier_type?: string
          is_suspended?: boolean
          is_umkm?: boolean
          ktm_photo_path?: string | null
          ktm_reason?: string | null
          ktm_status?: string
          name?: string
          pdp_consent?: boolean
          pdp_consent_at?: string | null
          system_role?: string
          unit_or_prodi?: string
          updated_at?: string
          wa?: string
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          display_name: string
          faculty: string
          id: string
          is_deleted: boolean
          is_umkm: boolean
          unit_or_prodi: string
          updated_at: string
          verified: boolean
        }
        Insert: {
          display_name: string
          faculty?: string
          id: string
          is_deleted?: boolean
          is_umkm?: boolean
          unit_or_prodi?: string
          updated_at?: string
          verified?: boolean
        }
        Update: {
          display_name?: string
          faculty?: string
          id?: string
          is_deleted?: boolean
          is_umkm?: boolean
          unit_or_prodi?: string
          updated_at?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "public_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          admin_note: string | null
          created_at: string
          id: number
          reason: string
          reporter_id: string
          status: string
          target_id: string
          target_title: string
          target_type: string
          updated_at: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          id?: never
          reason: string
          reporter_id: string
          status?: string
          target_id: string
          target_title: string
          target_type: string
          updated_at?: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          id?: never
          reason?: string
          reporter_id?: string
          status?: string
          target_id?: string
          target_title?: string
          target_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string
          created_at: string
          id: number
          listing_id: number
          order_id: number
          rating: number
          reviewer_id: string
          target_user_id: string
        }
        Insert: {
          comment?: string
          created_at?: string
          id?: never
          listing_id: number
          order_id: number
          rating: number
          reviewer_id: string
          target_user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: never
          listing_id?: number
          order_id?: number
          rating?: number
          reviewer_id?: string
          target_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_listings: {
        Row: {
          created_at: string
          listing_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          listing_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          listing_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_listings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_cod_order: {
        Args: {
          p_cod_spot_id: string
          p_listing_id: number
          p_note?: string
          p_proposed_time: string
          p_quantity: number
        }
        Returns: {
          auto_complete_at: string | null
          buyer_id: string
          cancel_reason: string | null
          cod_spot_id: string
          cod_spot_name: string
          code: string
          created_at: string
          expires_at: string
          handed_over_at: string | null
          id: number
          listing_id: number
          listing_title: string
          note: string
          payment_method: string
          proposed_time: string
          quantity: number
          seller_id: string
          status: string
          unit_price: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      delete_own_account: { Args: never; Returns: undefined }
      get_order_counterparty_wa: {
        Args: { p_order_id: number }
        Returns: {
          counterparty_name: string
          counterparty_wa: string
        }[]
      }
      review_ktm_request: {
        Args: {
          p_decision: string
          p_reason?: string
          p_verification_id: number
        }
        Returns: {
          created_at: string
          id: number
          identifier_number: string
          identifier_type: string
          photo_delete_due_at: string | null
          photo_deleted_at: string | null
          photo_path: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "ktm_verifications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      submit_ktm_request: {
        Args: {
          p_faculty: string
          p_identifier_number: string
          p_name: string
          p_pdp_consent: boolean
          p_photo_path: string
          p_unit_or_prodi: string
          p_wa: string
        }
        Returns: {
          created_at: string
          id: number
          identifier_number: string
          identifier_type: string
          photo_delete_due_at: string | null
          photo_deleted_at: string | null
          photo_path: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "ktm_verifications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_cod_order_status: {
        Args: {
          p_cancel_reason?: string
          p_next_status: string
          p_order_id: number
        }
        Returns: {
          auto_complete_at: string | null
          buyer_id: string
          cancel_reason: string | null
          cod_spot_id: string
          cod_spot_name: string
          code: string
          created_at: string
          expires_at: string
          handed_over_at: string | null
          id: number
          listing_id: number
          listing_title: string
          note: string
          payment_method: string
          proposed_time: string
          quantity: number
          seller_id: string
          status: string
          unit_price: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: true
          isSetofReturn: false
        }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
