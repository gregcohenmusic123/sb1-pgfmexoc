export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      artist_profiles: {
        Row: {
          background_image_url: string | null
          bio: string | null
          created_at: string | null
          id: string
          instagram_handle: string | null
          name: string
          profile_image_url: string | null
          twitter_handle: string | null
          updated_at: string | null
          user_id: string
          website_url: string | null
        }
        Insert: {
          background_image_url?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string
          instagram_handle?: string | null
          name: string
          profile_image_url?: string | null
          twitter_handle?: string | null
          updated_at?: string | null
          user_id: string
          website_url?: string | null
        }
        Update: {
          background_image_url?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string
          instagram_handle?: string | null
          name?: string
          profile_image_url?: string | null
          twitter_handle?: string | null
          updated_at?: string | null
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      artist_tracks: {
        Row: {
          artist_id: string | null
          audio_url: string
          cover_art_url: string
          created_at: string
          id: string
          inscription: string | null
          price: number
          title: string
          updated_at: string
        }
        Insert: {
          artist_id?: string | null
          audio_url: string
          cover_art_url: string
          created_at?: string
          id?: string
          inscription?: string | null
          price: number
          title: string
          updated_at?: string
        }
        Update: {
          artist_id?: string | null
          audio_url?: string
          cover_art_url?: string
          created_at?: string
          id?: string
          inscription?: string | null
          price?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_tracks_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      artists: {
        Row: {
          bio: string | null
          cover_image: string | null
          created_at: string | null
          followers: number | null
          id: string
          instagram: string | null
          name: string
          profile_image: string | null
          total_sales: number | null
          total_tracks: number | null
          twitter: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          bio?: string | null
          cover_image?: string | null
          created_at?: string | null
          followers?: number | null
          id: string
          instagram?: string | null
          name: string
          profile_image?: string | null
          total_sales?: number | null
          total_tracks?: number | null
          twitter?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          bio?: string | null
          cover_image?: string | null
          created_at?: string | null
          followers?: number | null
          id?: string
          instagram?: string | null
          name?: string
          profile_image?: string | null
          total_sales?: number | null
          total_tracks?: number | null
          twitter?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          author: string
          content: string
          created_at: string
          id: string
          likes: number
          track_id: string
        }
        Insert: {
          author: string
          content: string
          created_at?: string
          id?: string
          likes?: number
          track_id: string
        }
        Update: {
          author?: string
          content?: string
          created_at?: string
          id?: string
          likes?: number
          track_id?: string
        }
        Relationships: []
      }
      escrow_transactions: {
        Row: {
          amount: number
          buyer_address: string
          created_at: string
          id: string
          price: number
          seller_address: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          buyer_address: string
          created_at?: string
          id?: string
          price: number
          seller_address: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          buyer_address?: string
          created_at?: string
          id?: string
          price?: number
          seller_address?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_matches: {
        Row: {
          amount: number
          buy_order_id: string | null
          created_at: string
          id: string
          price: number
          sell_order_id: string | null
          status: string
        }
        Insert: {
          amount: number
          buy_order_id?: string | null
          created_at?: string
          id?: string
          price: number
          sell_order_id?: string | null
          status?: string
        }
        Update: {
          amount?: number
          buy_order_id?: string | null
          created_at?: string
          id?: string
          price?: number
          sell_order_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_matches_buy_order_id_fkey"
            columns: ["buy_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_matches_sell_order_id_fkey"
            columns: ["sell_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          created_at: string
          id: string
          inscription_id: string
          maker_address: string
          network: string
          price: number
          status: string
          type: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          inscription_id: string
          maker_address: string
          network?: string
          price: number
          status?: string
          type: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          inscription_id?: string
          maker_address?: string
          network?: string
          price?: number
          status?: string
          type?: string
        }
        Relationships: []
      }
      payment_attempts: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          next_retry_at: string | null
          retry_count: number | null
          status: string
          subscription_id: string | null
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          next_retry_at?: string | null
          retry_count?: number | null
          status: string
          subscription_id?: string | null
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          next_retry_at?: string | null
          retry_count?: number | null
          status?: string
          subscription_id?: string | null
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_attempts_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_attempts_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_notifications: {
        Row: {
          created_at: string
          id: string
          payload: Json | null
          retry_count: number | null
          status: string
          transaction_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          payload?: Json | null
          retry_count?: number | null
          status: string
          transaction_id?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json | null
          retry_count?: number | null
          status?: string
          transaction_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_notifications_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          background_image_url: string | null
          bio: string | null
          created_at: string
          id: string
          instagram: string | null
          name: string
          profile_picture_url: string | null
          twitter: string | null
          updated_at: string
          usertype: string | null
          website: string | null
        }
        Insert: {
          background_image_url?: string | null
          bio?: string | null
          created_at?: string
          id: string
          instagram?: string | null
          name: string
          profile_picture_url?: string | null
          twitter?: string | null
          updated_at?: string
          usertype?: string | null
          website?: string | null
        }
        Update: {
          background_image_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          instagram?: string | null
          name?: string
          profile_picture_url?: string | null
          twitter?: string | null
          updated_at?: string
          usertype?: string | null
          website?: string | null
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          billing_cycle: string
          created_at: string
          id: string
          last_payment_date: string | null
          metadata: Json | null
          next_billing_date: string
          retry_count: number | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          billing_cycle: string
          created_at?: string
          id?: string
          last_payment_date?: string | null
          metadata?: Json | null
          next_billing_date: string
          retry_count?: number | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          billing_cycle?: string
          created_at?: string
          id?: string
          last_payment_date?: string | null
          metadata?: Json | null
          next_billing_date?: string
          retry_count?: number | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tracks: {
        Row: {
          artist: string | null
          artist_id: string
          audio_url: string
          bitrate: number | null
          cdn_url: string | null
          cover_art_url: string
          created_at: string
          duration: number | null
          format: string | null
          id: string
          inscription: string | null
          metadata: Json | null
          plays: number
          price: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          artist?: string | null
          artist_id: string
          audio_url: string
          bitrate?: number | null
          cdn_url?: string | null
          cover_art_url: string
          created_at?: string
          duration?: number | null
          format?: string | null
          id?: string
          inscription?: string | null
          metadata?: Json | null
          plays?: number
          price: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          artist?: string | null
          artist_id?: string
          audio_url?: string
          bitrate?: number | null
          cdn_url?: string | null
          cover_art_url?: string
          created_at?: string
          duration?: number | null
          format?: string | null
          id?: string
          inscription?: string | null
          metadata?: Json | null
          plays?: number
          price?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracks_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          amount: number
          executed_at: string
          id: string
          network: string
          order_id: string | null
          price: number
          taker_address: string
        }
        Insert: {
          amount: number
          executed_at?: string
          id?: string
          network?: string
          order_id?: string | null
          price: number
          taker_address: string
        }
        Update: {
          amount?: number
          executed_at?: string
          id?: string
          network?: string
          order_id?: string | null
          price?: number
          taker_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          confirmations: number | null
          created_at: string
          description: string | null
          exchange_rate: number
          id: string
          metadata: Json | null
          network: string
          recipient_address: string
          status: string
          tx_hash: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          confirmations?: number | null
          created_at?: string
          description?: string | null
          exchange_rate: number
          id?: string
          metadata?: Json | null
          network: string
          recipient_address: string
          status?: string
          tx_hash?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          confirmations?: number | null
          created_at?: string
          description?: string | null
          exchange_rate?: number
          id?: string
          metadata?: Json | null
          network?: string
          recipient_address?: string
          status?: string
          tx_hash?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      track_details: {
        Row: {
          artist_id: string | null
          artist_name: string | null
          audio_url: string | null
          bitrate: number | null
          cdn_url: string | null
          cover_art_url: string | null
          created_at: string | null
          duration: number | null
          format: string | null
          id: string | null
          inscription: string | null
          metadata: Json | null
          plays: number | null
          price: number | null
          title: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracks_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      increment_comment_likes: {
        Args: {
          comment_id: string
        }
        Returns: undefined
      }
      match_orders: {
        Args: {
          inscription_id: string
        }
        Returns: undefined
      }
      upsert_profile: {
        Args: {
          p_id: string
          p_data: Json
        }
        Returns: undefined
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
