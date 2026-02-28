export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      activities: {
        Row: {
          counterparty_profile_id: string | null;
          created_at: string;
          id: string;
          metadata: Json;
          reference_id: string;
          role: string;
          service_type: string;
          transaction_id: string | null;
          updated_at: string;
          user_profile_id: string;
          visibility: Database["public"]["Enums"]["visibility_enum"];
        };
        Insert: {
          counterparty_profile_id?: string | null;
          created_at?: string;
          id?: string;
          metadata?: Json;
          reference_id: string;
          role: string;
          service_type?: string;
          transaction_id?: string | null;
          updated_at?: string;
          user_profile_id: string;
          visibility?: Database["public"]["Enums"]["visibility_enum"];
        };
        Update: {
          counterparty_profile_id?: string | null;
          created_at?: string;
          id?: string;
          metadata?: Json;
          reference_id?: string;
          role?: string;
          service_type?: string;
          transaction_id?: string | null;
          updated_at?: string;
          user_profile_id?: string;
          visibility?: Database["public"]["Enums"]["visibility_enum"];
        };
        Relationships: [
          {
            foreignKeyName: "activities_counterparty_profile_id_fkey";
            columns: ["counterparty_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activities_transaction_id_fkey";
            columns: ["transaction_id"];
            isOneToOne: false;
            referencedRelation: "transactions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activities_user_profile_id_fkey";
            columns: ["user_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      coffee_gifts: {
        Row: {
          coffee_count: number;
          created_at: string;
          creator_profile_id: string;
          id: string;
          is_monthly: boolean;
          message: string | null;
          supporter_name: string | null;
          supporter_platform: string | null;
          supporter_profile_id: string | null;
          transaction_reference_id: string;
          updated_at: string;
        };
        Insert: {
          coffee_count: number;
          created_at?: string;
          creator_profile_id: string;
          id?: string;
          is_monthly?: boolean;
          message?: string | null;
          supporter_name?: string | null;
          supporter_platform?: string | null;
          supporter_profile_id?: string | null;
          transaction_reference_id: string;
          updated_at?: string;
        };
        Update: {
          coffee_count?: number;
          created_at?: string;
          creator_profile_id?: string;
          id?: string;
          is_monthly?: boolean;
          message?: string | null;
          supporter_name?: string | null;
          supporter_platform?: string | null;
          supporter_profile_id?: string | null;
          transaction_reference_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "coffee_gifts_creator_profile_id_fkey";
            columns: ["creator_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "coffee_gifts_supporter_profile_id_fkey";
            columns: ["supporter_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "coffee_gifts_transaction_reference_id_fkey";
            columns: ["transaction_reference_id"];
            isOneToOne: false;
            referencedRelation: "transactions";
            referencedColumns: ["reference_id"];
          },
        ];
      };
      conversation_participants: {
        Row: {
          conversation_id: string;
          joined_at: string;
          last_read_at: string | null;
          profile_id: string;
        };
        Insert: {
          conversation_id: string;
          joined_at?: string;
          last_read_at?: string | null;
          profile_id: string;
        };
        Update: {
          conversation_id?: string;
          joined_at?: string;
          last_read_at?: string | null;
          profile_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversation_participants_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      conversations: {
        Row: {
          created_at: string;
          id: string;
          last_message_at: string | null;
          last_message_preview: string | null;
          name: string | null;
          type: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          last_message_at?: string | null;
          last_message_preview?: string | null;
          name?: string | null;
          type?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          last_message_at?: string | null;
          last_message_preview?: string | null;
          name?: string | null;
          type?: string;
        };
        Relationships: [];
      };
      follows: {
        Row: {
          created_at: string | null;
          follower_id: string;
          following_id: string;
          id: number;
        };
        Insert: {
          created_at?: string | null;
          follower_id: string;
          following_id: string;
          id?: never;
        };
        Update: {
          created_at?: string | null;
          follower_id?: string;
          following_id?: string;
          id?: never;
        };
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey";
            columns: ["follower_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "follows_following_id_fkey";
            columns: ["following_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      manager_role_permissions: {
        Row: {
          id: number;
          permission: Database["public"]["Enums"]["manager_permission"];
          role: Database["public"]["Enums"]["manager_role"];
        };
        Insert: {
          id?: number;
          permission: Database["public"]["Enums"]["manager_permission"];
          role: Database["public"]["Enums"]["manager_role"];
        };
        Update: {
          id?: number;
          permission?: Database["public"]["Enums"]["manager_permission"];
          role?: Database["public"]["Enums"]["manager_role"];
        };
        Relationships: [];
      };
      manager_user_roles: {
        Row: {
          assigned_at: string;
          assigned_by: string | null;
          id: number;
          role: Database["public"]["Enums"]["manager_role"];
          user_id: string;
        };
        Insert: {
          assigned_at?: string;
          assigned_by?: string | null;
          id?: number;
          role: Database["public"]["Enums"]["manager_role"];
          user_id: string;
        };
        Update: {
          assigned_at?: string;
          assigned_by?: string | null;
          id?: number;
          role?: Database["public"]["Enums"]["manager_role"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "manager_user_roles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "managers";
            referencedColumns: ["id"];
          },
        ];
      };
      managers: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          created_by: string | null;
          department: string | null;
          email: string;
          full_name: string | null;
          id: string;
          last_login_at: string | null;
          phone: string | null;
          status: Database["public"]["Enums"]["manager_status"] | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          created_by?: string | null;
          department?: string | null;
          email: string;
          full_name?: string | null;
          id: string;
          last_login_at?: string | null;
          phone?: string | null;
          status?: Database["public"]["Enums"]["manager_status"] | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          created_by?: string | null;
          department?: string | null;
          email?: string;
          full_name?: string | null;
          id?: string;
          last_login_at?: string | null;
          phone?: string | null;
          status?: Database["public"]["Enums"]["manager_status"] | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          content: string;
          conversation_id: string;
          created_at: string;
          id: number;
          sender_id: string;
        };
        Insert: {
          content: string;
          conversation_id: string;
          created_at?: string;
          id?: number;
          sender_id: string;
        };
        Update: {
          content?: string;
          conversation_id?: string;
          created_at?: string;
          id?: number;
          sender_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      messages_2026_02: {
        Row: {
          content: string;
          conversation_id: string;
          created_at: string;
          id: number;
          sender_id: string;
        };
        Insert: {
          content: string;
          conversation_id: string;
          created_at?: string;
          id?: number;
          sender_id: string;
        };
        Update: {
          content?: string;
          conversation_id?: string;
          created_at?: string;
          id?: number;
          sender_id?: string;
        };
        Relationships: [];
      };
      messages_2026_03: {
        Row: {
          content: string;
          conversation_id: string;
          created_at: string;
          id: number;
          sender_id: string;
        };
        Insert: {
          content: string;
          conversation_id: string;
          created_at?: string;
          id?: number;
          sender_id: string;
        };
        Update: {
          content?: string;
          conversation_id?: string;
          created_at?: string;
          id?: number;
          sender_id?: string;
        };
        Relationships: [];
      };
      messages_2026_04: {
        Row: {
          content: string;
          conversation_id: string;
          created_at: string;
          id: number;
          sender_id: string;
        };
        Insert: {
          content: string;
          conversation_id: string;
          created_at?: string;
          id?: number;
          sender_id: string;
        };
        Update: {
          content?: string;
          conversation_id?: string;
          created_at?: string;
          id?: number;
          sender_id?: string;
        };
        Relationships: [];
      };
      messages_default: {
        Row: {
          content: string;
          conversation_id: string;
          created_at: string;
          id: number;
          sender_id: string;
        };
        Insert: {
          content: string;
          conversation_id: string;
          created_at?: string;
          id?: number;
          sender_id: string;
        };
        Update: {
          content?: string;
          conversation_id?: string;
          created_at?: string;
          id?: number;
          sender_id?: string;
        };
        Relationships: [];
      };
      payout_methods: {
        Row: {
          created_at: string;
          details: Json;
          id: string;
          is_active: boolean;
          is_default: boolean;
          profile_id: string;
          provider: Database["public"]["Enums"]["payout_provider"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          details?: Json;
          id?: string;
          is_active?: boolean;
          is_default?: boolean;
          profile_id: string;
          provider: Database["public"]["Enums"]["payout_provider"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          details?: Json;
          id?: string;
          is_active?: boolean;
          is_default?: boolean;
          profile_id?: string;
          provider?: Database["public"]["Enums"]["payout_provider"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payout_methods_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          allow_gifting: boolean | null;
          allow_subscriptions: boolean | null;
          avatar_url: string | null;
          banner_url: string | null;
          bio: string | null;
          created_at: string | null;
          display_name: string | null;
          follower_count: number | null;
          following_count: number | null;
          full_name: string | null;
          has_wallet_balance: boolean | null;
          id: string;
          is_page_active: boolean | null;
          layout: Json | null;
          page_slug: string;
          role: Database["public"]["Enums"]["user_role"];
          social_links: Json | null;
          thank_you_items: Json | null;
          theme: Json | null;
          updated_at: string | null;
          username: string;
        };
        Insert: {
          allow_gifting?: boolean | null;
          allow_subscriptions?: boolean | null;
          avatar_url?: string | null;
          banner_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          display_name?: string | null;
          follower_count?: number | null;
          following_count?: number | null;
          full_name?: string | null;
          has_wallet_balance?: boolean | null;
          id: string;
          is_page_active?: boolean | null;
          layout?: Json | null;
          page_slug: string;
          role?: Database["public"]["Enums"]["user_role"];
          social_links?: Json | null;
          thank_you_items?: Json | null;
          theme?: Json | null;
          updated_at?: string | null;
          username: string;
        };
        Update: {
          allow_gifting?: boolean | null;
          allow_subscriptions?: boolean | null;
          avatar_url?: string | null;
          banner_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          display_name?: string | null;
          follower_count?: number | null;
          following_count?: number | null;
          full_name?: string | null;
          has_wallet_balance?: boolean | null;
          id?: string;
          is_page_active?: boolean | null;
          layout?: Json | null;
          page_slug?: string;
          role?: Database["public"]["Enums"]["user_role"];
          social_links?: Json | null;
          thank_you_items?: Json | null;
          theme?: Json | null;
          updated_at?: string | null;
          username?: string;
        };
        Relationships: [];
      };
      supporters: {
        Row: {
          created_at: string;
          creator_id: string;
          first_supported_at: string | null;
          id: string;
          identity_hash: string;
          is_monthly: boolean;
          last_supported_at: string | null;
          last_supported_service: string | null;
          metadata: Json;
          name: string;
          social_platform:
            | Database["public"]["Enums"]["supporter_platform_enum"]
            | null;
          support_count: number;
          total_amount: number;
          updated_at: string;
          user_profile_id: string | null;
        };
        Insert: {
          created_at?: string;
          creator_id: string;
          first_supported_at?: string | null;
          id?: string;
          identity_hash: string;
          is_monthly?: boolean;
          last_supported_at?: string | null;
          last_supported_service?: string | null;
          metadata?: Json;
          name: string;
          social_platform?:
            | Database["public"]["Enums"]["supporter_platform_enum"]
            | null;
          support_count?: number;
          total_amount?: number;
          updated_at?: string;
          user_profile_id?: string | null;
        };
        Update: {
          created_at?: string;
          creator_id?: string;
          first_supported_at?: string | null;
          id?: string;
          identity_hash?: string;
          is_monthly?: boolean;
          last_supported_at?: string | null;
          last_supported_service?: string | null;
          metadata?: Json;
          name?: string;
          social_platform?:
            | Database["public"]["Enums"]["supporter_platform_enum"]
            | null;
          support_count?: number;
          total_amount?: number;
          updated_at?: string;
          user_profile_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "supporters_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "supporters_user_profile_id_fkey";
            columns: ["user_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: {
          amount: number;
          balance_after: number;
          counterparty_profile_id: string | null;
          created_at: string;
          creator_profile_id: string | null;
          direction: Database["public"]["Enums"]["transaction_direction_enum"];
          id: string;
          metadata: Json;
          net_amount: number;
          platform_fee: number;
          provider: Database["public"]["Enums"]["provider_enum"] | null;
          provider_transaction_id: string | null;
          reference_id: string | null;
          reference_type: Database["public"]["Enums"]["reference_type_enum"];
          service_type: string;
          status: Database["public"]["Enums"]["payment_status_enum"];
          supporter_id: string | null;
          updated_at: string;
          user_profile_id: string;
          wallet_id: string | null;
        };
        Insert: {
          amount: number;
          balance_after: number;
          counterparty_profile_id?: string | null;
          created_at?: string;
          creator_profile_id?: string | null;
          direction: Database["public"]["Enums"]["transaction_direction_enum"];
          id?: string;
          metadata?: Json;
          net_amount: number;
          platform_fee?: number;
          provider?: Database["public"]["Enums"]["provider_enum"] | null;
          provider_transaction_id?: string | null;
          reference_id?: string | null;
          reference_type: Database["public"]["Enums"]["reference_type_enum"];
          service_type?: string;
          status: Database["public"]["Enums"]["payment_status_enum"];
          supporter_id?: string | null;
          updated_at?: string;
          user_profile_id: string;
          wallet_id?: string | null;
        };
        Update: {
          amount?: number;
          balance_after?: number;
          counterparty_profile_id?: string | null;
          created_at?: string;
          creator_profile_id?: string | null;
          direction?: Database["public"]["Enums"]["transaction_direction_enum"];
          id?: string;
          metadata?: Json;
          net_amount?: number;
          platform_fee?: number;
          provider?: Database["public"]["Enums"]["provider_enum"] | null;
          provider_transaction_id?: string | null;
          reference_id?: string | null;
          reference_type?: Database["public"]["Enums"]["reference_type_enum"];
          service_type?: string;
          status?: Database["public"]["Enums"]["payment_status_enum"];
          supporter_id?: string | null;
          updated_at?: string;
          user_profile_id?: string;
          wallet_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_counterparty_profile_id_fkey";
            columns: ["counterparty_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_creator_profile_id_fkey";
            columns: ["creator_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_supporter_id_fkey";
            columns: ["supporter_id"];
            isOneToOne: false;
            referencedRelation: "supporters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_user_profile_id_fkey";
            columns: ["user_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_wallet_id_fkey";
            columns: ["wallet_id"];
            isOneToOne: false;
            referencedRelation: "wallets";
            referencedColumns: ["id"];
          },
        ];
      };
      wallets: {
        Row: {
          balance: number;
          created_at: string;
          currency: string;
          id: string;
          locked_balance: number;
          profile_id: string;
          updated_at: string;
        };
        Insert: {
          balance?: number;
          created_at?: string;
          currency?: string;
          id?: string;
          locked_balance?: number;
          profile_id: string;
          updated_at?: string;
        };
        Update: {
          balance?: number;
          created_at?: string;
          currency?: string;
          id?: string;
          locked_balance?: number;
          profile_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wallets_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      withdrawal_requests: {
        Row: {
          admin_note: string | null;
          amount: number;
          completed_at: string | null;
          failure_reason: string | null;
          fee: number;
          id: string;
          net_amount: number;
          payout_method_id: string;
          payout_snapshot: Json | null;
          processed_at: string | null;
          profile_id: string;
          requested_at: string;
          status: Database["public"]["Enums"]["withdrawal_status"];
          wallet_id: string;
        };
        Insert: {
          admin_note?: string | null;
          amount: number;
          completed_at?: string | null;
          failure_reason?: string | null;
          fee?: number;
          id?: string;
          net_amount: number;
          payout_method_id: string;
          payout_snapshot?: Json | null;
          processed_at?: string | null;
          profile_id: string;
          requested_at?: string;
          status?: Database["public"]["Enums"]["withdrawal_status"];
          wallet_id: string;
        };
        Update: {
          admin_note?: string | null;
          amount?: number;
          completed_at?: string | null;
          failure_reason?: string | null;
          fee?: number;
          id?: string;
          net_amount?: number;
          payout_method_id?: string;
          payout_snapshot?: Json | null;
          processed_at?: string | null;
          profile_id?: string;
          requested_at?: string;
          status?: Database["public"]["Enums"]["withdrawal_status"];
          wallet_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_payout_method_id_fkey";
            columns: ["payout_method_id"];
            isOneToOne: false;
            referencedRelation: "payout_methods";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "withdrawal_requests_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "withdrawal_requests_wallet_id_fkey";
            columns: ["wallet_id"];
            isOneToOne: false;
            referencedRelation: "wallets";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      authorize_manager: {
        Args: {
          requested_permission: Database["public"]["Enums"]["manager_permission"];
        };
        Returns: boolean;
      };
      create_manager: {
        Args: {
          manager_department?: string;
          manager_email: string;
          manager_full_name: string;
          manager_role: Database["public"]["Enums"]["manager_role"];
        };
        Returns: string;
      };
      create_next_month_partition: { Args: never; Returns: undefined };
      custom_access_token_hook: { Args: { event: Json }; Returns: Json };
      drop_old_partitions: { Args: never; Returns: undefined };
      follow_user: { Args: { target_user_id: string }; Returns: undefined };
      get_conversations: {
        Args: { p_limit?: number; p_offset?: number };
        Returns: {
          id: string;
          last_message_at: string;
          last_message_preview: string;
          name: string;
          participants: Json;
          type: string;
          unread_count: number;
        }[];
      };
      get_followers: { Args: { target_user_id: string }; Returns: string[] };
      get_following: { Args: { target_user_id: string }; Returns: string[] };
      get_messages: {
        Args: {
          p_conversation_id: string;
          p_limit?: number;
          p_offset?: number;
        };
        Returns: {
          content: string;
          conversation_id: string;
          created_at: string;
          id: number;
          is_mine: boolean;
          sender_avatar_url: string;
          sender_display_name: string;
          sender_id: string;
          sender_username: string;
        }[];
      };
      get_popular_content: {
        Args: { p_creator_id: string; p_from_date: string; p_to_date: string };
        Returns: {
          service: string;
          support_count: number;
          total_amount: number;
        }[];
      };
      get_total_supports_count: {
        Args: { p_creator_id: string; p_from_date: string; p_to_date: string };
        Returns: number;
      };
      handle_successful_payment: {
        Args: {
          p_amount: number;
          p_creator_profile_id: string;
          p_metadata?: Json;
          p_platform_fee: number;
          p_provider: Database["public"]["Enums"]["provider_enum"];
          p_provider_transaction_id: string;
          p_reference_type: Database["public"]["Enums"]["reference_type_enum"];
          p_service_type?: string;
          p_supporter_id: string;
          p_supporter_profile_id?: string;
        };
        Returns: Json;
      };
      is_admin: { Args: never; Returns: boolean };
      is_following: { Args: { target_user_id: string }; Returns: boolean };
      is_manager: { Args: { user_email: string }; Returns: boolean };
      mark_conversation_as_read: {
        Args: { p_conversation_id: string };
        Returns: undefined;
      };
      request_withdrawal: {
        Args: { p_amount: number; p_payout_method_id: string };
        Returns: string;
      };
      send_message: {
        Args: { p_content: string; p_conversation_id: string };
        Returns: {
          content: string;
          conversation_id: string;
          created_at: string;
          id: number;
          sender_id: string;
        }[];
      };
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { "": string }; Returns: string[] };
      toggle_follow: { Args: { target_user_id: string }; Returns: boolean };
      unfollow_user: { Args: { target_user_id: string }; Returns: undefined };
      upsert_supporter: {
        Args: {
          p_amount?: number;
          p_creator_id: string;
          p_identity_hash: string;
          p_metadata?: Json;
          p_name: string;
          p_service_type?: string;
          p_social_platform?: Database["public"]["Enums"]["supporter_platform_enum"];
          p_user_profile_id?: string;
        };
        Returns: string;
      };
    };
    Enums: {
      manager_permission:
        | "managers.create"
        | "managers.view"
        | "managers.update"
        | "managers.delete"
        | "content.moderate"
        | "content.approve"
        | "content.feature"
        | "content.delete"
        | "users.view_details"
        | "users.suspend"
        | "users.reactivate"
        | "users.view_analytics"
        | "transactions.view"
        | "transactions.refund"
        | "payouts.approve"
        | "payouts.process"
        | "support.tickets.view"
        | "support.tickets.respond"
        | "support.tickets.escalate"
        | "support.tickets.close"
        | "developers.create"
        | "developers.view"
        | "developers.update"
        | "developers.delete";
      manager_role:
        | "super_admin"
        | "content_manager"
        | "support_manager"
        | "finance_manager"
        | "developer_manager";
      manager_status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
      payment_status_enum:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "reversed"
        | "cancelled"
        | "refunded"
        | "reviewing";
      payout_provider: "bkash" | "nagad" | "rocket" | "bank";
      provider_enum:
        | "HobeNakiCoffee"
        | "Bkash"
        | "Nagad"
        | "Rocket"
        | "Upay"
        | "SSLCommerz"
        | "Aamarpay"
        | "Portwallet"
        | "Tap"
        | "Other";
      reference_type_enum:
        | "subscription"
        | "one-time"
        | "payout"
        | "withdraw_lock"
        | "withdraw_release"
        | "withdraw_complete"
        | "manual_adjustment";
      supporter_platform_enum:
        | "facebook"
        | "x"
        | "instagram"
        | "youtube"
        | "github"
        | "linkedin"
        | "twitch"
        | "tiktok"
        | "threads"
        | "whatsapp"
        | "telegram"
        | "discord"
        | "reddit"
        | "pinterest"
        | "medium"
        | "devto"
        | "behance"
        | "dribbble";
      transaction_direction_enum: "debit" | "credit";
      user_role: "user" | "admin";
      visibility_enum: "public" | "private";
      withdrawal_status:
        | "requested"
        | "approved"
        | "processing"
        | "paid"
        | "rejected"
        | "failed";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      manager_permission: [
        "managers.create",
        "managers.view",
        "managers.update",
        "managers.delete",
        "content.moderate",
        "content.approve",
        "content.feature",
        "content.delete",
        "users.view_details",
        "users.suspend",
        "users.reactivate",
        "users.view_analytics",
        "transactions.view",
        "transactions.refund",
        "payouts.approve",
        "payouts.process",
        "support.tickets.view",
        "support.tickets.respond",
        "support.tickets.escalate",
        "support.tickets.close",
        "developers.create",
        "developers.view",
        "developers.update",
        "developers.delete",
      ],
      manager_role: [
        "super_admin",
        "content_manager",
        "support_manager",
        "finance_manager",
        "developer_manager",
      ],
      manager_status: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      payment_status_enum: [
        "pending",
        "processing",
        "completed",
        "failed",
        "reversed",
        "cancelled",
        "refunded",
        "reviewing",
      ],
      payout_provider: ["bkash", "nagad", "rocket", "bank"],
      provider_enum: [
        "HobeNakiCoffee",
        "Bkash",
        "Nagad",
        "Rocket",
        "Upay",
        "SSLCommerz",
        "Aamarpay",
        "Portwallet",
        "Tap",
        "Other",
      ],
      reference_type_enum: [
        "subscription",
        "one-time",
        "payout",
        "withdraw_lock",
        "withdraw_release",
        "withdraw_complete",
        "manual_adjustment",
      ],
      supporter_platform_enum: [
        "facebook",
        "x",
        "instagram",
        "youtube",
        "github",
        "linkedin",
        "twitch",
        "tiktok",
        "threads",
        "whatsapp",
        "telegram",
        "discord",
        "reddit",
        "pinterest",
        "medium",
        "devto",
        "behance",
        "dribbble",
      ],
      transaction_direction_enum: ["debit", "credit"],
      user_role: ["user", "admin"],
      visibility_enum: ["public", "private"],
      withdrawal_status: [
        "requested",
        "approved",
        "processing",
        "paid",
        "rejected",
        "failed",
      ],
    },
  },
} as const;
