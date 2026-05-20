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
          is_dismissed: boolean;
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
          is_dismissed?: boolean;
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
          is_dismissed?: boolean;
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
          supporter_identity_hash: string | null;
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
          supporter_identity_hash?: string | null;
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
          supporter_identity_hash?: string | null;
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
      creator_platform_subscriptions: {
        Row: {
          amount_used_this_period: number;
          created_at: string;
          id: number;
          period_end: string;
          period_start: string;
          plan_id: number;
          price_at_purchase: number;
          profile_id: string;
          service_type: string;
          status: string;
          transaction_reference_id: string | null;
          transactions_used_this_period: number;
          updated_at: string;
        };
        Insert: {
          amount_used_this_period?: number;
          created_at?: string;
          id?: never;
          period_end: string;
          period_start: string;
          plan_id: number;
          price_at_purchase: number;
          profile_id: string;
          service_type: string;
          status?: string;
          transaction_reference_id?: string | null;
          transactions_used_this_period?: number;
          updated_at?: string;
        };
        Update: {
          amount_used_this_period?: number;
          created_at?: string;
          id?: never;
          period_end?: string;
          period_start?: string;
          plan_id?: number;
          price_at_purchase?: number;
          profile_id?: string;
          service_type?: string;
          status?: string;
          transaction_reference_id?: string | null;
          transactions_used_this_period?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "creator_platform_subscriptions_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "platform_subscription_plans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "creator_platform_subscriptions_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "creator_platform_subscriptions_transaction_reference_id_fkey";
            columns: ["transaction_reference_id"];
            isOneToOne: false;
            referencedRelation: "transactions";
            referencedColumns: ["reference_id"];
          },
        ];
      };
      creator_subscription_notifications: {
        Row: {
          id: number;
          notification_type: string;
          sent_at: string;
          subscription_id: number;
        };
        Insert: {
          id?: never;
          notification_type: string;
          sent_at?: string;
          subscription_id: number;
        };
        Update: {
          id?: never;
          notification_type?: string;
          sent_at?: string;
          subscription_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "creator_subscription_notifications_subscription_id_fkey";
            columns: ["subscription_id"];
            isOneToOne: false;
            referencedRelation: "creator_platform_subscriptions";
            referencedColumns: ["id"];
          },
        ];
      };
      feed_item_bookmarks: {
        Row: {
          created_at: string;
          feed_item_id: number;
          id: number;
          profile_id: string;
        };
        Insert: {
          created_at?: string;
          feed_item_id: number;
          id?: never;
          profile_id: string;
        };
        Update: {
          created_at?: string;
          feed_item_id?: number;
          id?: never;
          profile_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feed_item_bookmarks_feed_item_id_fkey";
            columns: ["feed_item_id"];
            isOneToOne: false;
            referencedRelation: "feed_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "feed_item_bookmarks_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      feed_item_comments: {
        Row: {
          body: string | null;
          created_at: string;
          feed_item_id: number;
          id: number;
          is_deleted: boolean;
          parent_comment_id: number | null;
          profile_id: string;
          updated_at: string;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          feed_item_id: number;
          id?: never;
          is_deleted?: boolean;
          parent_comment_id?: number | null;
          profile_id: string;
          updated_at?: string;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          feed_item_id?: number;
          id?: never;
          is_deleted?: boolean;
          parent_comment_id?: number | null;
          profile_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feed_item_comments_feed_item_id_fkey";
            columns: ["feed_item_id"];
            isOneToOne: false;
            referencedRelation: "feed_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "feed_item_comments_parent_comment_id_fkey";
            columns: ["parent_comment_id"];
            isOneToOne: false;
            referencedRelation: "feed_item_comments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "feed_item_comments_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      feed_item_likes: {
        Row: {
          created_at: string;
          feed_item_id: number;
          id: number;
          profile_id: string;
        };
        Insert: {
          created_at?: string;
          feed_item_id: number;
          id?: never;
          profile_id: string;
        };
        Update: {
          created_at?: string;
          feed_item_id?: number;
          id?: never;
          profile_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feed_item_likes_feed_item_id_fkey";
            columns: ["feed_item_id"];
            isOneToOne: false;
            referencedRelation: "feed_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "feed_item_likes_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      feed_item_shares: {
        Row: {
          created_at: string;
          feed_item_id: number;
          id: number;
          profile_id: string;
        };
        Insert: {
          created_at?: string;
          feed_item_id: number;
          id?: never;
          profile_id: string;
        };
        Update: {
          created_at?: string;
          feed_item_id?: number;
          id?: never;
          profile_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feed_item_shares_feed_item_id_fkey";
            columns: ["feed_item_id"];
            isOneToOne: false;
            referencedRelation: "feed_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "feed_item_shares_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      feed_items: {
        Row: {
          boost_tier: number;
          content_type: string;
          created_at: string;
          creator_profile_id: string | null;
          id: number;
          interaction_counts: Json;
          is_pinned: boolean;
          metadata: Json;
          rank_score: number;
          reference_id: string | null;
          search_vector: unknown;
          updated_at: string;
          visibility: Database["public"]["Enums"]["visibility_enum"];
        };
        Insert: {
          boost_tier?: number;
          content_type: string;
          created_at?: string;
          creator_profile_id?: string | null;
          id?: never;
          interaction_counts?: Json;
          is_pinned?: boolean;
          metadata?: Json;
          rank_score?: number;
          reference_id?: string | null;
          search_vector?: unknown;
          updated_at?: string;
          visibility?: Database["public"]["Enums"]["visibility_enum"];
        };
        Update: {
          boost_tier?: number;
          content_type?: string;
          created_at?: string;
          creator_profile_id?: string | null;
          id?: never;
          interaction_counts?: Json;
          is_pinned?: boolean;
          metadata?: Json;
          rank_score?: number;
          reference_id?: string | null;
          search_vector?: unknown;
          updated_at?: string;
          visibility?: Database["public"]["Enums"]["visibility_enum"];
        };
        Relationships: [
          {
            foreignKeyName: "feed_items_creator_profile_id_fkey";
            columns: ["creator_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
      kyc_sessions: {
        Row: {
          created_at: string;
          expires_at: string;
          id: number;
          profile_id: string;
          status: Database["public"]["Enums"]["kyc_session_status_enum"];
          token: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          expires_at?: string;
          id?: never;
          profile_id: string;
          status?: Database["public"]["Enums"]["kyc_session_status_enum"];
          token?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          expires_at?: string;
          id?: never;
          profile_id?: string;
          status?: Database["public"]["Enums"]["kyc_session_status_enum"];
          token?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "kyc_sessions_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      kyc_submissions: {
        Row: {
          admin_notes: string | null;
          attempt_number: number;
          consent_given_at: string;
          consent_ip: unknown;
          created_at: string;
          id: number;
          nid_back_path: string;
          nid_front_path: string;
          nid_number: string;
          profile_id: string;
          rejection_reason: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          selfie_path: string;
          status: Database["public"]["Enums"]["kyc_status_enum"];
          updated_at: string;
        };
        Insert: {
          admin_notes?: string | null;
          attempt_number?: number;
          consent_given_at?: string;
          consent_ip?: unknown;
          created_at?: string;
          id?: never;
          nid_back_path: string;
          nid_front_path: string;
          nid_number: string;
          profile_id: string;
          rejection_reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          selfie_path: string;
          status?: Database["public"]["Enums"]["kyc_status_enum"];
          updated_at?: string;
        };
        Update: {
          admin_notes?: string | null;
          attempt_number?: number;
          consent_given_at?: string;
          consent_ip?: unknown;
          created_at?: string;
          id?: never;
          nid_back_path?: string;
          nid_front_path?: string;
          nid_number?: string;
          profile_id?: string;
          rejection_reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          selfie_path?: string;
          status?: Database["public"]["Enums"]["kyc_status_enum"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "kyc_submissions_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "kyc_submissions_reviewed_by_fkey";
            columns: ["reviewed_by"];
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
            isOneToOne: true;
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
      membership_notifications: {
        Row: {
          created_at: string;
          id: string;
          notification_type: Database["public"]["Enums"]["membership_notification_type_enum"];
          profile_membership_id: string;
          sent_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          notification_type: Database["public"]["Enums"]["membership_notification_type_enum"];
          profile_membership_id: string;
          sent_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          notification_type?: Database["public"]["Enums"]["membership_notification_type_enum"];
          profile_membership_id?: string;
          sent_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "membership_notifications_profile_membership_id_fkey";
            columns: ["profile_membership_id"];
            isOneToOne: false;
            referencedRelation: "profile_memberships";
            referencedColumns: ["id"];
          },
        ];
      };
      membership_plans: {
        Row: {
          access_config: Json;
          billing_cycle: Database["public"]["Enums"]["membership_billing_cycle_enum"];
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          is_featured: boolean;
          name: string;
          owner_profile_id: string;
          price: number;
          service_type: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          access_config?: Json;
          billing_cycle: Database["public"]["Enums"]["membership_billing_cycle_enum"];
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          is_featured?: boolean;
          name: string;
          owner_profile_id: string;
          price: number;
          service_type: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          access_config?: Json;
          billing_cycle?: Database["public"]["Enums"]["membership_billing_cycle_enum"];
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          is_featured?: boolean;
          name?: string;
          owner_profile_id?: string;
          price?: number;
          service_type?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "membership_plans_owner_profile_id_fkey";
            columns: ["owner_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
      messages_2026_05: {
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
      messages_2026_06: {
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
      newsletter_post_analytics_daily: {
        Row: {
          clicks: number;
          created_at: string;
          date: string;
          id: string;
          post_id: string;
          purchases: number;
          revenue: number;
          updated_at: string;
          views: number;
        };
        Insert: {
          clicks?: number;
          created_at?: string;
          date: string;
          id?: string;
          post_id: string;
          purchases?: number;
          revenue?: number;
          updated_at?: string;
          views?: number;
        };
        Update: {
          clicks?: number;
          created_at?: string;
          date?: string;
          id?: string;
          post_id?: string;
          purchases?: number;
          revenue?: number;
          updated_at?: string;
          views?: number;
        };
        Relationships: [
          {
            foreignKeyName: "newsletter_post_analytics_daily_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "newsletter_posts";
            referencedColumns: ["id"];
          },
        ];
      };
      newsletter_post_likes: {
        Row: {
          created_at: string;
          id: string;
          post_id: string;
          profile_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          post_id: string;
          profile_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          post_id?: string;
          profile_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "newsletter_post_likes_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "newsletter_posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "newsletter_post_likes_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      newsletter_post_versions: {
        Row: {
          content: string | null;
          created_at: string;
          id: string;
          post_id: string;
          source: Database["public"]["Enums"]["post_version_source_enum"];
          title: string | null;
          version_number: number;
        };
        Insert: {
          content?: string | null;
          created_at?: string;
          id?: string;
          post_id: string;
          source: Database["public"]["Enums"]["post_version_source_enum"];
          title?: string | null;
          version_number: number;
        };
        Update: {
          content?: string | null;
          created_at?: string;
          id?: string;
          post_id?: string;
          source?: Database["public"]["Enums"]["post_version_source_enum"];
          title?: string | null;
          version_number?: number;
        };
        Relationships: [
          {
            foreignKeyName: "newsletter_post_versions_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "newsletter_posts";
            referencedColumns: ["id"];
          },
        ];
      };
      newsletter_posts: {
        Row: {
          click_count: number;
          content: string | null;
          cover_image_url: string | null;
          created_at: string;
          excerpt: string | null;
          id: string;
          is_members_only: boolean;
          is_pay_per_post: boolean;
          like_count: number;
          price: number | null;
          profile_id: string;
          published_at: string | null;
          purchase_count: number;
          reading_time_minutes: number | null;
          reject_reason: string | null;
          revenue_total: number;
          slug: string | null;
          status: Database["public"]["Enums"]["post_status_enum"];
          subtitle: string | null;
          tags: string[];
          title: string;
          updated_at: string;
          view_count: number;
          visibility: Database["public"]["Enums"]["visibility_enum"];
        };
        Insert: {
          click_count?: number;
          content?: string | null;
          cover_image_url?: string | null;
          created_at?: string;
          excerpt?: string | null;
          id?: string;
          is_members_only?: boolean;
          is_pay_per_post?: boolean;
          like_count?: number;
          price?: number | null;
          profile_id: string;
          published_at?: string | null;
          purchase_count?: number;
          reading_time_minutes?: number | null;
          reject_reason?: string | null;
          revenue_total?: number;
          slug?: string | null;
          status?: Database["public"]["Enums"]["post_status_enum"];
          subtitle?: string | null;
          tags?: string[];
          title: string;
          updated_at?: string;
          view_count?: number;
          visibility?: Database["public"]["Enums"]["visibility_enum"];
        };
        Update: {
          click_count?: number;
          content?: string | null;
          cover_image_url?: string | null;
          created_at?: string;
          excerpt?: string | null;
          id?: string;
          is_members_only?: boolean;
          is_pay_per_post?: boolean;
          like_count?: number;
          price?: number | null;
          profile_id?: string;
          published_at?: string | null;
          purchase_count?: number;
          reading_time_minutes?: number | null;
          reject_reason?: string | null;
          revenue_total?: number;
          slug?: string | null;
          status?: Database["public"]["Enums"]["post_status_enum"];
          subtitle?: string | null;
          tags?: string[];
          title?: string;
          updated_at?: string;
          view_count?: number;
          visibility?: Database["public"]["Enums"]["visibility_enum"];
        };
        Relationships: [
          {
            foreignKeyName: "newsletter_posts_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      newsletter_settings: {
        Row: {
          annual_plan_id: string | null;
          annual_price: number | null;
          created_at: string;
          free_tier_label: string;
          gifting_enabled: boolean;
          id: string;
          member_label: string;
          memberships_enabled: boolean;
          monthly_plan_id: string | null;
          monthly_price: number | null;
          newsletter_description: string | null;
          newsletter_title: string | null;
          profile_id: string;
          updated_at: string;
          welcome_message: string | null;
        };
        Insert: {
          annual_plan_id?: string | null;
          annual_price?: number | null;
          created_at?: string;
          free_tier_label?: string;
          gifting_enabled?: boolean;
          id?: string;
          member_label?: string;
          memberships_enabled?: boolean;
          monthly_plan_id?: string | null;
          monthly_price?: number | null;
          newsletter_description?: string | null;
          newsletter_title?: string | null;
          profile_id: string;
          updated_at?: string;
          welcome_message?: string | null;
        };
        Update: {
          annual_plan_id?: string | null;
          annual_price?: number | null;
          created_at?: string;
          free_tier_label?: string;
          gifting_enabled?: boolean;
          id?: string;
          member_label?: string;
          memberships_enabled?: boolean;
          monthly_plan_id?: string | null;
          monthly_price?: number | null;
          newsletter_description?: string | null;
          newsletter_title?: string | null;
          profile_id?: string;
          updated_at?: string;
          welcome_message?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "newsletter_settings_annual_plan_id_fkey";
            columns: ["annual_plan_id"];
            isOneToOne: false;
            referencedRelation: "membership_plans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "newsletter_settings_monthly_plan_id_fkey";
            columns: ["monthly_plan_id"];
            isOneToOne: false;
            referencedRelation: "membership_plans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "newsletter_settings_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
      platform_settings: {
        Row: {
          description: string | null;
          key: string;
          updated_at: string;
          value: Json;
        };
        Insert: {
          description?: string | null;
          key: string;
          updated_at?: string;
          value: Json;
        };
        Update: {
          description?: string | null;
          key?: string;
          updated_at?: string;
          value?: Json;
        };
        Relationships: [];
      };
      platform_subscription_plans: {
        Row: {
          created_at: string;
          description: string | null;
          id: number;
          is_active: boolean;
          monthly_amount_cap: number | null;
          monthly_transaction_cap: number | null;
          name: string;
          price_per_month: number;
          service_type: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: never;
          is_active?: boolean;
          monthly_amount_cap?: number | null;
          monthly_transaction_cap?: number | null;
          name: string;
          price_per_month: number;
          service_type: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: never;
          is_active?: boolean;
          monthly_amount_cap?: number | null;
          monthly_transaction_cap?: number | null;
          name?: string;
          price_per_month?: number;
          service_type?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      post_access_grants: {
        Row: {
          created_at: string;
          expires_at: string | null;
          gift_message: string | null;
          grant_type: Database["public"]["Enums"]["access_grant_type_enum"];
          granted_by_profile_id: string | null;
          grantee_profile_id: string;
          id: string;
          is_redeemed: boolean;
          post_id: string;
          redeemed_at: string | null;
          transaction_reference_id: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          expires_at?: string | null;
          gift_message?: string | null;
          grant_type: Database["public"]["Enums"]["access_grant_type_enum"];
          granted_by_profile_id?: string | null;
          grantee_profile_id: string;
          id?: string;
          is_redeemed?: boolean;
          post_id: string;
          redeemed_at?: string | null;
          transaction_reference_id?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          expires_at?: string | null;
          gift_message?: string | null;
          grant_type?: Database["public"]["Enums"]["access_grant_type_enum"];
          granted_by_profile_id?: string | null;
          grantee_profile_id?: string;
          id?: string;
          is_redeemed?: boolean;
          post_id?: string;
          redeemed_at?: string | null;
          transaction_reference_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "post_access_grants_granted_by_profile_id_fkey";
            columns: ["granted_by_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_access_grants_grantee_profile_id_fkey";
            columns: ["grantee_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_access_grants_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "newsletter_posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_access_grants_transaction_reference_id_fkey";
            columns: ["transaction_reference_id"];
            isOneToOne: false;
            referencedRelation: "transactions";
            referencedColumns: ["reference_id"];
          },
        ];
      };
      profile_memberships: {
        Row: {
          auto_renew: boolean;
          cancelled_at: string | null;
          created_at: string;
          id: string;
          member_profile_id: string;
          owner_profile_id: string;
          period_end: string | null;
          period_start: string;
          plan_id: string;
          price_at_purchase: number;
          renewed_at: string | null;
          service_type: string;
          status: Database["public"]["Enums"]["membership_status_enum"];
          transaction_id: string | null;
          updated_at: string;
        };
        Insert: {
          auto_renew?: boolean;
          cancelled_at?: string | null;
          created_at?: string;
          id?: string;
          member_profile_id: string;
          owner_profile_id: string;
          period_end?: string | null;
          period_start?: string;
          plan_id: string;
          price_at_purchase: number;
          renewed_at?: string | null;
          service_type: string;
          status?: Database["public"]["Enums"]["membership_status_enum"];
          transaction_id?: string | null;
          updated_at?: string;
        };
        Update: {
          auto_renew?: boolean;
          cancelled_at?: string | null;
          created_at?: string;
          id?: string;
          member_profile_id?: string;
          owner_profile_id?: string;
          period_end?: string | null;
          period_start?: string;
          plan_id?: string;
          price_at_purchase?: number;
          renewed_at?: string | null;
          service_type?: string;
          status?: Database["public"]["Enums"]["membership_status_enum"];
          transaction_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profile_memberships_member_profile_id_fkey";
            columns: ["member_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profile_memberships_owner_profile_id_fkey";
            columns: ["owner_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profile_memberships_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "membership_plans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profile_memberships_transaction_id_fkey";
            columns: ["transaction_id"];
            isOneToOne: false;
            referencedRelation: "transactions";
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
          categories: string[] | null;
          created_at: string | null;
          display_name: string | null;
          first_service_name: string | null;
          follower_count: number | null;
          following_count: number | null;
          full_name: string | null;
          has_first_service: boolean | null;
          has_wallet_balance: boolean | null;
          id: string;
          is_kyc_verified: boolean;
          is_page_active: boolean | null;
          is_verified: boolean;
          kyc_verified_at: string | null;
          layout: Json | null;
          onboarding_completed_at: string | null;
          onboarding_step: number | null;
          page_slug: string;
          popularity_score: number | null;
          role: Database["public"]["Enums"]["user_role"];
          social_links: Json | null;
          thank_you_items: Json | null;
          theme: Json | null;
          total_supporter_count: number | null;
          updated_at: string | null;
          username: string;
        };
        Insert: {
          allow_gifting?: boolean | null;
          allow_subscriptions?: boolean | null;
          avatar_url?: string | null;
          banner_url?: string | null;
          bio?: string | null;
          categories?: string[] | null;
          created_at?: string | null;
          display_name?: string | null;
          first_service_name?: string | null;
          follower_count?: number | null;
          following_count?: number | null;
          full_name?: string | null;
          has_first_service?: boolean | null;
          has_wallet_balance?: boolean | null;
          id: string;
          is_kyc_verified?: boolean;
          is_page_active?: boolean | null;
          is_verified?: boolean;
          kyc_verified_at?: string | null;
          layout?: Json | null;
          onboarding_completed_at?: string | null;
          onboarding_step?: number | null;
          page_slug: string;
          popularity_score?: number | null;
          role?: Database["public"]["Enums"]["user_role"];
          social_links?: Json | null;
          thank_you_items?: Json | null;
          theme?: Json | null;
          total_supporter_count?: number | null;
          updated_at?: string | null;
          username: string;
        };
        Update: {
          allow_gifting?: boolean | null;
          allow_subscriptions?: boolean | null;
          avatar_url?: string | null;
          banner_url?: string | null;
          bio?: string | null;
          categories?: string[] | null;
          created_at?: string | null;
          display_name?: string | null;
          first_service_name?: string | null;
          follower_count?: number | null;
          following_count?: number | null;
          full_name?: string | null;
          has_first_service?: boolean | null;
          has_wallet_balance?: boolean | null;
          id?: string;
          is_kyc_verified?: boolean;
          is_page_active?: boolean | null;
          is_verified?: boolean;
          kyc_verified_at?: string | null;
          layout?: Json | null;
          onboarding_completed_at?: string | null;
          onboarding_step?: number | null;
          page_slug?: string;
          popularity_score?: number | null;
          role?: Database["public"]["Enums"]["user_role"];
          social_links?: Json | null;
          thank_you_items?: Json | null;
          theme?: Json | null;
          total_supporter_count?: number | null;
          updated_at?: string | null;
          username?: string;
        };
        Relationships: [];
      };
      service_requests: {
        Row: {
          admin_note: string | null;
          category: string;
          created_at: string | null;
          description: string;
          id: string;
          is_custom: boolean | null;
          profile_id: string;
          service_name: string;
          status: Database["public"]["Enums"]["service_request_status"] | null;
          updated_at: string | null;
        };
        Insert: {
          admin_note?: string | null;
          category: string;
          created_at?: string | null;
          description: string;
          id?: string;
          is_custom?: boolean | null;
          profile_id: string;
          service_name: string;
          status?: Database["public"]["Enums"]["service_request_status"] | null;
          updated_at?: string | null;
        };
        Update: {
          admin_note?: string | null;
          category?: string;
          created_at?: string | null;
          description?: string;
          id?: string;
          is_custom?: boolean | null;
          profile_id?: string;
          service_name?: string;
          status?: Database["public"]["Enums"]["service_request_status"] | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "service_requests_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      shop_categories: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          is_visible: boolean;
          name: string;
          product_count: number;
          profile_id: string;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_visible?: boolean;
          name: string;
          product_count?: number;
          profile_id: string;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_visible?: boolean;
          name?: string;
          product_count?: number;
          profile_id?: string;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shop_categories_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      shop_category_drafts: {
        Row: {
          approval_status: Database["public"]["Enums"]["shop_approval_status_enum"];
          category_id: string;
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          profile_id: string;
          rejection_reason: string | null;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          approval_status?: Database["public"]["Enums"]["shop_approval_status_enum"];
          category_id: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          profile_id: string;
          rejection_reason?: string | null;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          approval_status?: Database["public"]["Enums"]["shop_approval_status_enum"];
          category_id?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          profile_id?: string;
          rejection_reason?: string | null;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shop_category_drafts_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: true;
            referencedRelation: "shop_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shop_category_drafts_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      shop_download_tokens: {
        Row: {
          buyer_profile_id: string;
          created_at: string;
          download_count: number;
          expires_at: string;
          file_id: string;
          id: string;
          max_downloads: number;
          order_item_id: string;
          token: string;
        };
        Insert: {
          buyer_profile_id: string;
          created_at?: string;
          download_count?: number;
          expires_at: string;
          file_id: string;
          id?: string;
          max_downloads: number;
          order_item_id: string;
          token: string;
        };
        Update: {
          buyer_profile_id?: string;
          created_at?: string;
          download_count?: number;
          expires_at?: string;
          file_id?: string;
          id?: string;
          max_downloads?: number;
          order_item_id?: string;
          token?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shop_download_tokens_buyer_profile_id_fkey";
            columns: ["buyer_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shop_download_tokens_file_id_fkey";
            columns: ["file_id"];
            isOneToOne: false;
            referencedRelation: "shop_product_files";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shop_download_tokens_order_item_id_fkey";
            columns: ["order_item_id"];
            isOneToOne: false;
            referencedRelation: "shop_order_items";
            referencedColumns: ["id"];
          },
        ];
      };
      shop_order_items: {
        Row: {
          cancellation_reason: string | null;
          carrier: string | null;
          cod_settled_at: string | null;
          created_at: string;
          delivered_at: string | null;
          id: string;
          order_id: string;
          platform_fee_rate: number;
          product_id: string;
          product_title: string;
          product_type: Database["public"]["Enums"]["shop_product_type_enum"];
          quantity: number;
          shipped_at: string | null;
          shipping_cost: number;
          status: Database["public"]["Enums"]["shop_order_item_status_enum"];
          tracking_number: string | null;
          tracking_url: string | null;
          unit_price: number;
          updated_at: string;
          variant_id: string | null;
          variant_label: string | null;
          variant_options: Json | null;
        };
        Insert: {
          cancellation_reason?: string | null;
          carrier?: string | null;
          cod_settled_at?: string | null;
          created_at?: string;
          delivered_at?: string | null;
          id?: string;
          order_id: string;
          platform_fee_rate?: number;
          product_id: string;
          product_title: string;
          product_type: Database["public"]["Enums"]["shop_product_type_enum"];
          quantity?: number;
          shipped_at?: string | null;
          shipping_cost?: number;
          status?: Database["public"]["Enums"]["shop_order_item_status_enum"];
          tracking_number?: string | null;
          tracking_url?: string | null;
          unit_price: number;
          updated_at?: string;
          variant_id?: string | null;
          variant_label?: string | null;
          variant_options?: Json | null;
        };
        Update: {
          cancellation_reason?: string | null;
          carrier?: string | null;
          cod_settled_at?: string | null;
          created_at?: string;
          delivered_at?: string | null;
          id?: string;
          order_id?: string;
          platform_fee_rate?: number;
          product_id?: string;
          product_title?: string;
          product_type?: Database["public"]["Enums"]["shop_product_type_enum"];
          quantity?: number;
          shipped_at?: string | null;
          shipping_cost?: number;
          status?: Database["public"]["Enums"]["shop_order_item_status_enum"];
          tracking_number?: string | null;
          tracking_url?: string | null;
          unit_price?: number;
          updated_at?: string;
          variant_id?: string | null;
          variant_label?: string | null;
          variant_options?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "shop_order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "shop_orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shop_order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "shop_products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shop_order_items_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "shop_product_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      shop_orders: {
        Row: {
          buyer_notes: string | null;
          buyer_profile_id: string;
          cod_settled_at: string | null;
          created_at: string;
          has_digital: boolean;
          has_physical: boolean;
          id: string;
          order_number: string;
          payment_method: Database["public"]["Enums"]["shop_payment_method_enum"];
          platform_fee: number;
          platform_fee_rate: number | null;
          seller_net: number;
          seller_notes: string | null;
          seller_profile_id: string;
          shipping_address: Json | null;
          shipping_total: number;
          subtotal: number;
          transaction_reference_id: string | null;
          updated_at: string;
        };
        Insert: {
          buyer_notes?: string | null;
          buyer_profile_id: string;
          cod_settled_at?: string | null;
          created_at?: string;
          has_digital?: boolean;
          has_physical?: boolean;
          id?: string;
          order_number: string;
          payment_method?: Database["public"]["Enums"]["shop_payment_method_enum"];
          platform_fee: number;
          platform_fee_rate?: number | null;
          seller_net: number;
          seller_notes?: string | null;
          seller_profile_id: string;
          shipping_address?: Json | null;
          shipping_total?: number;
          subtotal: number;
          transaction_reference_id?: string | null;
          updated_at?: string;
        };
        Update: {
          buyer_notes?: string | null;
          buyer_profile_id?: string;
          cod_settled_at?: string | null;
          created_at?: string;
          has_digital?: boolean;
          has_physical?: boolean;
          id?: string;
          order_number?: string;
          payment_method?: Database["public"]["Enums"]["shop_payment_method_enum"];
          platform_fee?: number;
          platform_fee_rate?: number | null;
          seller_net?: number;
          seller_notes?: string | null;
          seller_profile_id?: string;
          shipping_address?: Json | null;
          shipping_total?: number;
          subtotal?: number;
          transaction_reference_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shop_orders_buyer_profile_id_fkey";
            columns: ["buyer_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shop_orders_seller_profile_id_fkey";
            columns: ["seller_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shop_orders_transaction_reference_id_fkey";
            columns: ["transaction_reference_id"];
            isOneToOne: false;
            referencedRelation: "transactions";
            referencedColumns: ["reference_id"];
          },
        ];
      };
      shop_policies: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          is_enabled: boolean;
          policy_type: Database["public"]["Enums"]["shop_policy_type_enum"];
          profile_id: string;
          updated_at: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          is_enabled?: boolean;
          policy_type: Database["public"]["Enums"]["shop_policy_type_enum"];
          profile_id: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          is_enabled?: boolean;
          policy_type?: Database["public"]["Enums"]["shop_policy_type_enum"];
          profile_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shop_policies_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      shop_product_drafts: {
        Row: {
          approval_status: Database["public"]["Enums"]["shop_approval_status_enum"];
          category_id: string | null;
          cod_enabled: boolean;
          compare_at_price: number | null;
          cover_image_url: string | null;
          created_at: string;
          description: string | null;
          download_expires_hours: number;
          id: string;
          images: string[];
          is_featured: boolean;
          low_stock_threshold: number;
          max_downloads: number;
          option_definitions: Json;
          price: number;
          processing_max_days: number | null;
          processing_min_days: number | null;
          product_id: string;
          profile_id: string;
          rejection_reason: string | null;
          requires_shipping: boolean;
          shipping_fee_inside_dhaka: number;
          shipping_fee_outside_dhaka: number;
          sku: string | null;
          slug: string;
          sort_order: number;
          stock_count: number | null;
          tags: string[];
          title: string;
          updated_at: string;
          weight_grams: number | null;
        };
        Insert: {
          approval_status?: Database["public"]["Enums"]["shop_approval_status_enum"];
          category_id?: string | null;
          cod_enabled?: boolean;
          compare_at_price?: number | null;
          cover_image_url?: string | null;
          created_at?: string;
          description?: string | null;
          download_expires_hours?: number;
          id?: string;
          images?: string[];
          is_featured?: boolean;
          low_stock_threshold?: number;
          max_downloads?: number;
          option_definitions?: Json;
          price: number;
          processing_max_days?: number | null;
          processing_min_days?: number | null;
          product_id: string;
          profile_id: string;
          rejection_reason?: string | null;
          requires_shipping?: boolean;
          shipping_fee_inside_dhaka?: number;
          shipping_fee_outside_dhaka?: number;
          sku?: string | null;
          slug: string;
          sort_order?: number;
          stock_count?: number | null;
          tags?: string[];
          title: string;
          updated_at?: string;
          weight_grams?: number | null;
        };
        Update: {
          approval_status?: Database["public"]["Enums"]["shop_approval_status_enum"];
          category_id?: string | null;
          cod_enabled?: boolean;
          compare_at_price?: number | null;
          cover_image_url?: string | null;
          created_at?: string;
          description?: string | null;
          download_expires_hours?: number;
          id?: string;
          images?: string[];
          is_featured?: boolean;
          low_stock_threshold?: number;
          max_downloads?: number;
          option_definitions?: Json;
          price?: number;
          processing_max_days?: number | null;
          processing_min_days?: number | null;
          product_id?: string;
          profile_id?: string;
          rejection_reason?: string | null;
          requires_shipping?: boolean;
          shipping_fee_inside_dhaka?: number;
          shipping_fee_outside_dhaka?: number;
          sku?: string | null;
          slug?: string;
          sort_order?: number;
          stock_count?: number | null;
          tags?: string[];
          title?: string;
          updated_at?: string;
          weight_grams?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "shop_product_drafts_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "shop_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shop_product_drafts_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: true;
            referencedRelation: "shop_products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shop_product_drafts_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      shop_product_files: {
        Row: {
          created_at: string;
          file_name: string;
          file_size_bytes: number | null;
          id: string;
          is_deleted: boolean;
          mime_type: string | null;
          product_id: string;
          sort_order: number;
          storage_path: string;
        };
        Insert: {
          created_at?: string;
          file_name: string;
          file_size_bytes?: number | null;
          id?: string;
          is_deleted?: boolean;
          mime_type?: string | null;
          product_id: string;
          sort_order?: number;
          storage_path: string;
        };
        Update: {
          created_at?: string;
          file_name?: string;
          file_size_bytes?: number | null;
          id?: string;
          is_deleted?: boolean;
          mime_type?: string | null;
          product_id?: string;
          sort_order?: number;
          storage_path?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shop_product_files_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "shop_products";
            referencedColumns: ["id"];
          },
        ];
      };
      shop_product_variants: {
        Row: {
          id: string;
          image_url: string | null;
          is_active: boolean;
          options: Json;
          price_adjustment: number;
          product_id: string;
          sku: string | null;
          sort_order: number;
          stock_count: number | null;
        };
        Insert: {
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          options: Json;
          price_adjustment?: number;
          product_id: string;
          sku?: string | null;
          sort_order?: number;
          stock_count?: number | null;
        };
        Update: {
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          options?: Json;
          price_adjustment?: number;
          product_id?: string;
          sku?: string | null;
          sort_order?: number;
          stock_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "shop_product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "shop_products";
            referencedColumns: ["id"];
          },
        ];
      };
      shop_products: {
        Row: {
          category_id: string | null;
          cod_enabled: boolean;
          compare_at_price: number | null;
          cover_image_url: string | null;
          created_at: string;
          description: string | null;
          download_expires_hours: number;
          id: string;
          images: string[];
          is_active: boolean;
          is_deleted: boolean;
          is_featured: boolean;
          low_stock_threshold: number;
          max_downloads: number;
          option_definitions: Json;
          price: number;
          processing_max_days: number | null;
          processing_min_days: number | null;
          product_type: Database["public"]["Enums"]["shop_product_type_enum"];
          profile_id: string;
          requires_shipping: boolean;
          sales_count: number;
          shipping_fee_inside_dhaka: number;
          shipping_fee_outside_dhaka: number;
          sku: string | null;
          slug: string;
          sort_order: number;
          stock_count: number | null;
          tags: string[];
          title: string;
          updated_at: string;
          weight_grams: number | null;
        };
        Insert: {
          category_id?: string | null;
          cod_enabled?: boolean;
          compare_at_price?: number | null;
          cover_image_url?: string | null;
          created_at?: string;
          description?: string | null;
          download_expires_hours?: number;
          id?: string;
          images?: string[];
          is_active?: boolean;
          is_deleted?: boolean;
          is_featured?: boolean;
          low_stock_threshold?: number;
          max_downloads?: number;
          option_definitions?: Json;
          price: number;
          processing_max_days?: number | null;
          processing_min_days?: number | null;
          product_type: Database["public"]["Enums"]["shop_product_type_enum"];
          profile_id: string;
          requires_shipping?: boolean;
          sales_count?: number;
          shipping_fee_inside_dhaka?: number;
          shipping_fee_outside_dhaka?: number;
          sku?: string | null;
          slug: string;
          sort_order?: number;
          stock_count?: number | null;
          tags?: string[];
          title: string;
          updated_at?: string;
          weight_grams?: number | null;
        };
        Update: {
          category_id?: string | null;
          cod_enabled?: boolean;
          compare_at_price?: number | null;
          cover_image_url?: string | null;
          created_at?: string;
          description?: string | null;
          download_expires_hours?: number;
          id?: string;
          images?: string[];
          is_active?: boolean;
          is_deleted?: boolean;
          is_featured?: boolean;
          low_stock_threshold?: number;
          max_downloads?: number;
          option_definitions?: Json;
          price?: number;
          processing_max_days?: number | null;
          processing_min_days?: number | null;
          product_type?: Database["public"]["Enums"]["shop_product_type_enum"];
          profile_id?: string;
          requires_shipping?: boolean;
          sales_count?: number;
          shipping_fee_inside_dhaka?: number;
          shipping_fee_outside_dhaka?: number;
          sku?: string | null;
          slug?: string;
          sort_order?: number;
          stock_count?: number | null;
          tags?: string[];
          title?: string;
          updated_at?: string;
          weight_grams?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "shop_products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "shop_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shop_products_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      shop_settings: {
        Row: {
          banner_url: string | null;
          cod_enabled: boolean;
          created_at: string;
          deactivation_reason: string | null;
          id: string;
          is_active: boolean;
          logo_url: string | null;
          processing_max_days: number | null;
          processing_min_days: number | null;
          profile_id: string;
          requires_shipping: boolean;
          seo_description: string | null;
          seo_title: string | null;
          shipping_fee_inside_dhaka: number | null;
          shipping_fee_outside_dhaka: number | null;
          shipping_from_address: Json | null;
          shop_description: string | null;
          shop_name: string;
          theme_config: Json;
          total_earnings: number;
          total_products: number;
          total_sales: number;
          total_views: number;
          updated_at: string;
        };
        Insert: {
          banner_url?: string | null;
          cod_enabled?: boolean;
          created_at?: string;
          deactivation_reason?: string | null;
          id?: string;
          is_active?: boolean;
          logo_url?: string | null;
          processing_max_days?: number | null;
          processing_min_days?: number | null;
          profile_id: string;
          requires_shipping?: boolean;
          seo_description?: string | null;
          seo_title?: string | null;
          shipping_fee_inside_dhaka?: number | null;
          shipping_fee_outside_dhaka?: number | null;
          shipping_from_address?: Json | null;
          shop_description?: string | null;
          shop_name: string;
          theme_config?: Json;
          total_earnings?: number;
          total_products?: number;
          total_sales?: number;
          total_views?: number;
          updated_at?: string;
        };
        Update: {
          banner_url?: string | null;
          cod_enabled?: boolean;
          created_at?: string;
          deactivation_reason?: string | null;
          id?: string;
          is_active?: boolean;
          logo_url?: string | null;
          processing_max_days?: number | null;
          processing_min_days?: number | null;
          profile_id?: string;
          requires_shipping?: boolean;
          seo_description?: string | null;
          seo_title?: string | null;
          shipping_fee_inside_dhaka?: number | null;
          shipping_fee_outside_dhaka?: number | null;
          shipping_from_address?: Json | null;
          shop_description?: string | null;
          shop_name?: string;
          theme_config?: Json;
          total_earnings?: number;
          total_products?: number;
          total_sales?: number;
          total_views?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shop_settings_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      supporters: {
        Row: {
          conversation_id: string | null;
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
          conversation_id?: string | null;
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
          conversation_id?: string | null;
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
            foreignKeyName: "supporters_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
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
      user_addresses: {
        Row: {
          address_line1: string;
          address_line2: string | null;
          city: string;
          created_at: string;
          district: string;
          id: string;
          is_default: boolean;
          label: string | null;
          phone: string;
          postal_code: string | null;
          profile_id: string;
          recipient_name: string;
          updated_at: string;
        };
        Insert: {
          address_line1: string;
          address_line2?: string | null;
          city: string;
          created_at?: string;
          district: string;
          id?: string;
          is_default?: boolean;
          label?: string | null;
          phone: string;
          postal_code?: string | null;
          profile_id: string;
          recipient_name: string;
          updated_at?: string;
        };
        Update: {
          address_line1?: string;
          address_line2?: string | null;
          city?: string;
          created_at?: string;
          district?: string;
          id?: string;
          is_default?: boolean;
          label?: string | null;
          phone?: string;
          postal_code?: string | null;
          profile_id?: string;
          recipient_name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_addresses_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_services: {
        Row: {
          config: Json | null;
          created_at: string | null;
          id: string;
          is_enabled: boolean | null;
          profile_id: string;
          service: string;
          updated_at: string | null;
        };
        Insert: {
          config?: Json | null;
          created_at?: string | null;
          id?: string;
          is_enabled?: boolean | null;
          profile_id: string;
          service: string;
          updated_at?: string | null;
        };
        Update: {
          config?: Json | null;
          created_at?: string | null;
          id?: string;
          is_enabled?: boolean | null;
          profile_id?: string;
          service?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_services_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      wallets: {
        Row: {
          balance: number;
          cod_debt: number;
          created_at: string;
          currency: string;
          id: string;
          locked_balance: number;
          profile_id: string;
          updated_at: string;
        };
        Insert: {
          balance?: number;
          cod_debt?: number;
          created_at?: string;
          currency?: string;
          id?: string;
          locked_balance?: number;
          profile_id: string;
          updated_at?: string;
        };
        Update: {
          balance?: number;
          cod_debt?: number;
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
          payout_method_id: string | null;
          payout_snapshot: Json | null;
          processed_at: string | null;
          profile_id: string;
          requested_at: string;
          status: Database["public"]["Enums"]["withdrawal_status"];
          superseded_by: string | null;
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
          payout_method_id?: string | null;
          payout_snapshot?: Json | null;
          processed_at?: string | null;
          profile_id: string;
          requested_at?: string;
          status?: Database["public"]["Enums"]["withdrawal_status"];
          superseded_by?: string | null;
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
          payout_method_id?: string | null;
          payout_snapshot?: Json | null;
          processed_at?: string | null;
          profile_id?: string;
          requested_at?: string;
          status?: Database["public"]["Enums"]["withdrawal_status"];
          superseded_by?: string | null;
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
            foreignKeyName: "withdrawal_requests_superseded_by_fkey";
            columns: ["superseded_by"];
            isOneToOne: false;
            referencedRelation: "withdrawal_requests";
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
      activate_creator_platform_subscription: {
        Args: {
          p_creator_profile_id: string;
          p_plan_id: number;
          p_provider: Database["public"]["Enums"]["provider_enum"];
          p_provider_transaction_id: string;
        };
        Returns: Json;
      };
      add_feed_comment: {
        Args: {
          p_body: string;
          p_feed_item_id: number;
          p_parent_comment_id?: number;
        };
        Returns: {
          body: string | null;
          created_at: string;
          feed_item_id: number;
          id: number;
          is_deleted: boolean;
          parent_comment_id: number | null;
          profile_id: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "feed_item_comments";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      add_shop_product_file: {
        Args: {
          p_file_name: string;
          p_file_size_bytes?: number;
          p_mime_type?: string;
          p_product_id: string;
          p_sort_order?: number;
          p_storage_path: string;
        };
        Returns: Json;
      };
      admin_approve_kyc: {
        Args: {
          p_admin_notes?: string;
          p_reviewed_by: string;
          p_submission_id: number;
        };
        Returns: undefined;
      };
      admin_grant_creator_subscription: {
        Args: { p_months?: number; p_plan_id: number; p_profile_id: string };
        Returns: Json;
      };
      admin_reject_kyc: {
        Args: {
          p_admin_notes?: string;
          p_rejection_reason: string;
          p_request_resubmit?: boolean;
          p_reviewed_by: string;
          p_submission_id: number;
        };
        Returns: undefined;
      };
      approve_newsletter_post: { Args: { p_post_id: string }; Returns: Json };
      approve_shop_category: { Args: { p_category_id: string }; Returns: Json };
      approve_shop_product: { Args: { p_product_id: string }; Returns: Json };
      authorize_manager: {
        Args: {
          requested_permission: Database["public"]["Enums"]["manager_permission"];
        };
        Returns: boolean;
      };
      auto_deactivate_ineligible_shops: { Args: never; Returns: Json };
      cancel_cod_order_item: {
        Args: { p_order_item_id: string; p_reason: string };
        Returns: Json;
      };
      cancel_creator_platform_subscription: {
        Args: { p_service_type: string };
        Returns: Json;
      };
      check_and_emit_milestone: {
        Args: {
          p_creator_profile_id: string;
          p_current_count: number;
          p_milestone_type: string;
        };
        Returns: undefined;
      };
      check_newsletter_post_access: {
        Args: { p_post_id: string };
        Returns: {
          access_reason: string;
          has_access: boolean;
        }[];
      };
      check_shop_active_eligibility: {
        Args: { p_profile_id: string };
        Returns: Json;
      };
      cleanup_orphaned_kyc_documents: { Args: never; Returns: undefined };
      cleanup_orphaned_post_images: { Args: never; Returns: undefined };
      confirm_cod_cash_received: {
        Args: { p_order_item_id: string };
        Returns: Json;
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
      create_manager_feed_post: {
        Args: {
          p_body: string;
          p_cta_label?: string;
          p_cta_url?: string;
          p_image_url?: string;
          p_is_pinned?: boolean;
          p_title: string;
        };
        Returns: number;
      };
      create_newsletter_draft: {
        Args: { p_profile_id: string };
        Returns: {
          id: string;
          slug: string;
          title: string;
        }[];
      };
      create_next_month_partition: { Args: never; Returns: undefined };
      custom_access_token_hook: { Args: { event: Json }; Returns: Json };
      delete_feed_comment: {
        Args: { p_comment_id: number };
        Returns: undefined;
      };
      delete_shop_category: { Args: { p_category_id: string }; Returns: Json };
      delete_shop_policy: {
        Args: {
          p_policy_type: Database["public"]["Enums"]["shop_policy_type_enum"];
        };
        Returns: Json;
      };
      delete_shop_product: { Args: { p_product_id: string }; Returns: Json };
      delete_shop_product_file: { Args: { p_file_id: string }; Returns: Json };
      delete_shop_product_variant: {
        Args: { p_variant_id: string };
        Returns: Json;
      };
      delete_user_address: { Args: { p_address_id: string }; Returns: Json };
      drop_old_partitions: { Args: never; Returns: undefined };
      follow_user: { Args: { target_user_id: string }; Returns: undefined };
      get_buyer_orders: {
        Args: { p_cursor?: string; p_limit?: number };
        Returns: Json;
      };
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
      get_creator_coffee_gifts_stats: {
        Args: {
          p_creator_profile_id: string;
          p_from_date?: string;
          p_to_date?: string;
        };
        Returns: {
          total_coffees: number;
          total_coffees_change: number;
          total_earnings: number;
          total_earnings_change: number;
          unique_supporters: number;
          unique_supporters_change: number;
        }[];
      };
      get_creator_effective_fee_rate: {
        Args: { p_profile_id: string; p_service_type: string };
        Returns: number;
      };
      get_explore_creators: {
        Args: {
          p_category?: string;
          p_cursor_id?: string;
          p_cursor_score?: number;
          p_limit?: number;
          p_search?: string;
        };
        Returns: {
          avatar_url: string;
          banner_url: string;
          bio: string;
          categories: string[];
          display_name: string;
          follower_count: number;
          full_name: string;
          id: string;
          is_verified: boolean;
          page_slug: string;
          popularity_score: number;
          services: string[];
          supporter_count: number;
          username: string;
        }[];
      };
      get_feed: {
        Args: {
          p_content_types?: string[];
          p_cursor_id?: number;
          p_cursor_score?: number;
          p_limit?: number;
        };
        Returns: {
          boost_tier: number;
          content_type: string;
          created_at: string;
          creator_avatar_url: string;
          creator_display_name: string;
          creator_profile_id: string;
          creator_username: string;
          id: number;
          interaction_counts: Json;
          is_bookmarked: boolean;
          is_liked: boolean;
          is_pinned: boolean;
          metadata: Json;
          rank_score: number;
          reference_id: string;
          visibility: Database["public"]["Enums"]["visibility_enum"];
        }[];
      };
      get_followers: { Args: { target_user_id: string }; Returns: string[] };
      get_following: { Args: { target_user_id: string }; Returns: string[] };
      get_kyc_queue: {
        Args: {
          p_cursor?: string;
          p_limit?: number;
          p_status?: Database["public"]["Enums"]["kyc_status_enum"];
        };
        Returns: {
          attempt_number: number;
          created_at: string;
          display_name: string;
          nid_number: string;
          profile_id: string;
          status: Database["public"]["Enums"]["kyc_status_enum"];
          submission_id: number;
          username: string;
        }[];
      };
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
      get_my_active_memberships: {
        Args: never;
        Returns: {
          billing_cycle: Database["public"]["Enums"]["membership_billing_cycle_enum"];
          creator_avatar_url: string;
          creator_display_name: string;
          creator_profile_id: string;
          creator_username: string;
          membership_id: string;
          period_end: string;
          plan_name: string;
          plan_price: number;
          service_type: string;
          status: Database["public"]["Enums"]["membership_status_enum"];
        }[];
      };
      get_newsletter_stats: {
        Args: { p_from?: string; p_profile_id: string; p_to?: string };
        Returns: {
          newsletter_subs: number;
          post_sales_revenue: number;
          total_post_views: number;
        }[];
      };
      get_or_create_direct_conversation: {
        Args: { p_recipient_id: string };
        Returns: string;
      };
      get_order_by_number: { Args: { p_order_number: string }; Returns: Json };
      get_platform_setting: { Args: { p_key: string }; Returns: number };
      get_platform_setting_jsonb: { Args: { p_key: string }; Returns: Json };
      get_popular_content: {
        Args: { p_creator_id: string; p_from_date: string; p_to_date: string };
        Returns: {
          service: string;
          support_count: number;
          total_amount: number;
        }[];
      };
      get_post_analytics: {
        Args: { p_from?: string; p_post_id: string; p_to?: string };
        Returns: {
          chart_date: string;
          conv_rate: number;
          day_clicks: number;
          day_purchases: number;
          day_revenue: number;
          day_views: number;
          total_clicks: number;
          total_sales: number;
          total_views: number;
        }[];
      };
      get_posts_page: {
        Args: {
          p_cursor?: string;
          p_from?: string;
          p_limit?: number;
          p_profile_id: string;
          p_search?: string;
          p_status: Database["public"]["Enums"]["post_status_enum"];
          p_to?: string;
        };
        Returns: {
          click_count: number;
          cover_image_url: string;
          created_at: string;
          draft_count: number;
          excerpt: string;
          id: string;
          is_members_only: boolean;
          is_pay_per_post: boolean;
          like_count: number;
          price: number;
          published_at: string;
          purchase_count: number;
          reject_reason: string;
          revenue_total: number;
          slug: string;
          subtitle: string;
          tags: string[];
          title: string;
          updated_at: string;
          view_count: number;
        }[];
      };
      get_product_by_slug: {
        Args: { p_product_slug: string; p_username: string };
        Returns: Json;
      };
      get_reader_feed: {
        Args: {
          p_cursor?: string;
          p_filter?: string;
          p_from?: string;
          p_limit?: number;
          p_search?: string;
          p_to?: string;
        };
        Returns: {
          access_badge: string;
          author_avatar_url: string;
          author_display_name: string;
          author_username: string;
          cover_image_url: string;
          excerpt: string;
          has_access: boolean;
          is_liked: boolean;
          is_members_only: boolean;
          is_pay_per_post: boolean;
          like_count: number;
          post_id: string;
          price: number;
          profile_id: string;
          published_at: string;
          reading_time_minutes: number;
          slug: string;
          subtitle: string;
          tags: string[];
          title: string;
          view_count: number;
        }[];
      };
      get_recommended_creators: {
        Args: { p_limit?: number };
        Returns: {
          avatar_url: string;
          boost_tier: number;
          display_name: string;
          follower_count: number;
          profile_id: string;
          recent_posts: number;
          username: string;
        }[];
      };
      get_recommended_items: {
        Args: { p_limit?: number };
        Returns: {
          boost_tier: number;
          content_type: string;
          created_at: string;
          creator_avatar_url: string;
          creator_display_name: string;
          creator_profile_id: string;
          creator_username: string;
          id: number;
          interaction_counts: Json;
          metadata: Json;
          rank_score: number;
          reference_id: string;
        }[];
      };
      get_seller_orders: {
        Args: { p_cursor?: string; p_item_status?: string; p_limit?: number };
        Returns: Json;
      };
      get_shop_by_username: {
        Args: { p_featured_limit?: number; p_username: string };
        Returns: Json;
      };
      get_shop_overview: { Args: never; Returns: Json };
      get_shop_policies: { Args: { p_username: string }; Returns: Json };
      get_shop_products: {
        Args: {
          p_category_id?: string;
          p_cursor_id?: string;
          p_cursor_sort?: number;
          p_limit?: number;
          p_username: string;
        };
        Returns: Json;
      };
      get_shop_stats: { Args: never; Returns: Json };
      get_supporter_coffee_gifts_stats: {
        Args: {
          p_from_date: string;
          p_supporter_profile_id: string;
          p_to_date: string;
        };
        Returns: {
          coffees_gifted: number;
          creators_supported: number;
          total_spent: number;
        }[];
      };
      get_total_supports_count: {
        Args: { p_creator_id: string; p_from_date: string; p_to_date: string };
        Returns: number;
      };
      get_transaction_service_breakdown: {
        Args: {
          p_direction?: Database["public"]["Enums"]["transaction_direction_enum"];
          p_from?: string;
          p_to?: string;
        };
        Returns: {
          percentage: number;
          service_type: string;
          total_amount: number;
          transaction_count: number;
        }[];
      };
      get_transaction_stats: {
        Args: { p_from?: string; p_to?: string };
        Returns: {
          earned_change: number;
          earned_one_time: number;
          earned_subscription: number;
          earned_total: number;
          pending_in: number;
          pending_in_change: number;
          pending_out: number;
          pending_out_change: number;
          spent_change: number;
          spent_one_time: number;
          spent_subscription: number;
          spent_total: number;
        }[];
      };
      get_transactions_page: {
        Args: {
          p_amount_sort?: string;
          p_cursor_amount?: number;
          p_cursor_ts?: string;
          p_date_from?: string;
          p_date_to?: string;
          p_limit?: number;
          p_providers?: string[];
          p_reference_types?: string[];
          p_service_types?: string[];
          p_statuses?: string[];
        };
        Returns: {
          created_at: string;
          direction: Database["public"]["Enums"]["transaction_direction_enum"];
          id: string;
          metadata: Json;
          net_amount: number;
          platform_fee: number;
          provider: Database["public"]["Enums"]["provider_enum"];
          provider_transaction_id: string;
          reference_type: Database["public"]["Enums"]["reference_type_enum"];
          service_type: string;
          status: Database["public"]["Enums"]["payment_status_enum"];
          supporter_id: string;
        }[];
      };
      get_user_addresses: {
        Args: never;
        Returns: {
          address_line1: string;
          address_line2: string;
          city: string;
          created_at: string;
          district: string;
          id: string;
          is_default: boolean;
          label: string;
          phone: string;
          postal_code: string;
          recipient_name: string;
        }[];
      };
      get_withdrawal_requests_page: {
        Args: { p_cursor_requested_at?: string; p_limit?: number };
        Returns: {
          amount: number;
          completed_at: string;
          failure_reason: string;
          fee: number;
          id: string;
          net_amount: number;
          payout_method_id: string;
          payout_snapshot: Json;
          processed_at: string;
          profile_id: string;
          requested_at: string;
          status: Database["public"]["Enums"]["withdrawal_status"];
          wallet_id: string;
        }[];
      };
      gift_newsletter_post: {
        Args: {
          p_expires_at?: string;
          p_gift_message?: string;
          p_grantee_profile_id: string;
          p_post_id: string;
          p_transaction_reference_id?: string;
        };
        Returns: string;
      };
      handle_shop_payment_success: {
        Args: { p_order_id: string; p_transaction_reference_id: string };
        Returns: Json;
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
      has_active_membership: {
        Args: {
          p_member_profile_id: string;
          p_owner_profile_id: string;
          p_service_type: string;
        };
        Returns: boolean;
      };
      increment_creator_subscription_usage: {
        Args: {
          p_amount: number;
          p_profile_id: string;
          p_service_type: string;
        };
        Returns: undefined;
      };
      initiate_shop_checkout: {
        Args: {
          p_address_id?: string;
          p_buyer_notes?: string;
          p_items: Json;
          p_payment_method?: Database["public"]["Enums"]["shop_payment_method_enum"];
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
      mark_order_item_delivered: {
        Args: { p_order_item_id: string };
        Returns: Json;
      };
      moderate_user: {
        Args: {
          p_allow_gifting?: boolean;
          p_allow_subs?: boolean;
          p_is_page_active?: boolean;
          p_user_id: string;
        };
        Returns: Json;
      };
      perform_coffee_gift: {
        Args: {
          p_amount: number;
          p_coffee_count?: number;
          p_creator_profile_id: string;
          p_identity_hash: string;
          p_is_monthly?: boolean;
          p_message?: string;
          p_provider: Database["public"]["Enums"]["provider_enum"];
          p_provider_transaction_id: string;
          p_reference_type: Database["public"]["Enums"]["reference_type_enum"];
          p_supporter_name: string;
          p_supporter_platform?: Database["public"]["Enums"]["supporter_platform_enum"];
          p_supporter_profile_id: string;
        };
        Returns: Json;
      };
      process_creator_subscription_expiry: { Args: never; Returns: undefined };
      process_membership_expiry_notifications: {
        Args: never;
        Returns: undefined;
      };
      process_service_payment: {
        Args: {
          p_amount: number;
          p_creator_profile_id: string;
          p_identity_hash: string;
          p_metadata?: Json;
          p_platform_fee: number;
          p_provider: Database["public"]["Enums"]["provider_enum"];
          p_provider_transaction_id: string;
          p_reference_type: Database["public"]["Enums"]["reference_type_enum"];
          p_service_type: string;
          p_supporter_name: string;
          p_supporter_platform?: Database["public"]["Enums"]["supporter_platform_enum"];
          p_supporter_profile_id: string;
        };
        Returns: Json;
      };
      process_withdrawal: {
        Args: {
          p_admin_note?: string;
          p_failure_reason?: string;
          p_fee?: number;
          p_new_status: Database["public"]["Enums"]["withdrawal_status"];
          p_withdrawal_id: string;
        };
        Returns: Json;
      };
      purchase_newsletter_membership: {
        Args: {
          p_buyer_name: string;
          p_buyer_platform?: Database["public"]["Enums"]["supporter_platform_enum"];
          p_buyer_profile_id: string;
          p_identity_hash: string;
          p_message?: string;
          p_plan_id: string;
          p_provider: Database["public"]["Enums"]["provider_enum"];
          p_provider_transaction_id: string;
          p_source?: string;
        };
        Returns: Json;
      };
      purchase_newsletter_post: {
        Args: {
          p_amount: number;
          p_buyer_name: string;
          p_buyer_platform?: Database["public"]["Enums"]["supporter_platform_enum"];
          p_buyer_profile_id: string;
          p_identity_hash: string;
          p_message?: string;
          p_post_id: string;
          p_provider: Database["public"]["Enums"]["provider_enum"];
          p_provider_transaction_id: string;
          p_source?: string;
        };
        Returns: Json;
      };
      recompute_feed_rank_scores: { Args: never; Returns: undefined };
      record_feed_item_share: {
        Args: { p_feed_item_id: number };
        Returns: undefined;
      };
      record_newsletter_post_click: {
        Args: { p_post_id: string };
        Returns: undefined;
      };
      record_newsletter_post_view: {
        Args: { p_post_id: string };
        Returns: undefined;
      };
      record_shop_view: { Args: { p_username: string }; Returns: undefined };
      reject_newsletter_post: {
        Args: { p_post_id: string; p_rejection_reason: string };
        Returns: Json;
      };
      reject_shop_category: {
        Args: { p_category_id: string; p_rejection_reason: string };
        Returns: Json;
      };
      reject_shop_product: {
        Args: { p_product_id: string; p_rejection_reason: string };
        Returns: Json;
      };
      reorder_shop_categories: {
        Args: { p_category_ids: string[] };
        Returns: Json;
      };
      reorder_shop_products: {
        Args: { p_product_ids: string[] };
        Returns: Json;
      };
      request_withdrawal: {
        Args: { p_amount: number; p_payout_method_id: string };
        Returns: string;
      };
      retry_withdrawal: {
        Args: {
          p_amount?: number;
          p_payout_method_id?: string;
          p_withdrawal_id: string;
        };
        Returns: string;
      };
      search_feed: {
        Args: { p_cursor_id?: number; p_limit?: number; p_query: string };
        Returns: {
          boost_tier: number;
          content_type: string;
          created_at: string;
          creator_avatar_url: string;
          creator_display_name: string;
          creator_profile_id: string;
          creator_username: string;
          id: number;
          interaction_counts: Json;
          is_bookmarked: boolean;
          is_liked: boolean;
          is_pinned: boolean;
          metadata: Json;
          rank_score: number;
          reference_id: string;
          search_rank: number;
        }[];
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
      set_shop_active_by_manager: {
        Args: { p_is_active: boolean; p_profile_id: string };
        Returns: Json;
      };
      toggle_feed_item_bookmark: {
        Args: { p_feed_item_id: number };
        Returns: Json;
      };
      toggle_feed_item_like: {
        Args: { p_feed_item_id: number };
        Returns: Json;
      };
      toggle_follow: { Args: { target_user_id: string }; Returns: boolean };
      toggle_newsletter_post_like: {
        Args: { p_post_id: string };
        Returns: Json;
      };
      topup_seller_cod_debt: {
        Args: { p_amount: number; p_profile_id: string };
        Returns: Json;
      };
      unfollow_user: { Args: { target_user_id: string }; Returns: undefined };
      unpublish_newsletter_post: { Args: { p_post_id: string }; Returns: Json };
      update_order_tracking: {
        Args: {
          p_carrier?: string;
          p_order_item_id: string;
          p_tracking_number: string;
          p_tracking_url?: string;
        };
        Returns: Json;
      };
      upsert_shop_category: {
        Args: {
          p_category_id?: string;
          p_description?: string;
          p_name?: string;
          p_slug?: string;
          p_sort_order?: number;
        };
        Returns: Json;
      };
      upsert_shop_policy: {
        Args: {
          p_content?: string;
          p_is_enabled?: boolean;
          p_policy_type: Database["public"]["Enums"]["shop_policy_type_enum"];
        };
        Returns: Json;
      };
      upsert_shop_product: {
        Args: {
          p_category_id?: string;
          p_cod_enabled?: boolean;
          p_compare_at_price?: number;
          p_cover_image_url?: string;
          p_description?: string;
          p_download_expires_hours?: number;
          p_images?: string[];
          p_is_featured?: boolean;
          p_low_stock_threshold?: number;
          p_max_downloads?: number;
          p_option_definitions?: Json;
          p_price?: number;
          p_processing_max_days?: number;
          p_processing_min_days?: number;
          p_product_id?: string;
          p_product_type?: Database["public"]["Enums"]["shop_product_type_enum"];
          p_requires_shipping?: boolean;
          p_shipping_fee_inside_dhaka?: number;
          p_shipping_fee_outside_dhaka?: number;
          p_sku?: string;
          p_slug?: string;
          p_sort_order?: number;
          p_stock_count?: number;
          p_tags?: string[];
          p_title?: string;
          p_weight_grams?: number;
        };
        Returns: Json;
      };
      upsert_shop_product_variant: {
        Args: {
          p_image_url?: string;
          p_is_active?: boolean;
          p_options?: Json;
          p_price_adjustment?: number;
          p_product_id?: string;
          p_sku?: string;
          p_sort_order?: number;
          p_stock_count?: number;
          p_variant_id?: string;
        };
        Returns: Json;
      };
      upsert_shop_settings: {
        Args: {
          p_banner_url?: string;
          p_cod_enabled?: boolean;
          p_is_active?: boolean;
          p_logo_url?: string;
          p_processing_max_days?: number;
          p_processing_min_days?: number;
          p_requires_shipping?: boolean;
          p_seo_description?: string;
          p_seo_title?: string;
          p_shipping_fee_inside_dhaka?: number;
          p_shipping_fee_outside_dhaka?: number;
          p_shipping_from_address?: Json;
          p_shop_description?: string;
          p_shop_name?: string;
          p_theme_config?: Json;
        };
        Returns: Json;
      };
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
      upsert_user_address: {
        Args: {
          p_address_id?: string;
          p_address_line1?: string;
          p_address_line2?: string;
          p_city?: string;
          p_district?: string;
          p_is_default?: boolean;
          p_label?: string;
          p_phone?: string;
          p_postal_code?: string;
          p_recipient_name?: string;
        };
        Returns: Json;
      };
    };
    Enums: {
      access_grant_type_enum: "purchase" | "gift";
      kyc_session_status_enum: "pending" | "opened" | "submitted" | "expired";
      kyc_status_enum:
        | "pending"
        | "under_review"
        | "approved"
        | "rejected"
        | "resubmit_requested";
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
        | "developers.delete"
        | "service_requests.view"
        | "service_requests.approve"
        | "service_requests.reject"
        | "service_requests.mark_implemented";
      manager_role:
        | "super_admin"
        | "content_manager"
        | "support_manager"
        | "finance_manager"
        | "developer_manager";
      manager_status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
      membership_billing_cycle_enum: "monthly" | "annual" | "lifetime";
      membership_notification_type_enum:
        | "5_days"
        | "3_days"
        | "1_day"
        | "expired"
        | "3_days_post"
        | "7_days_post";
      membership_status_enum:
        | "active"
        | "cancelled"
        | "expired"
        | "paused"
        | "past_due";
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
      post_status_enum: "draft" | "published" | "review" | "archived";
      post_version_source_enum:
        | "autosave"
        | "ai_polish"
        | "manual_save"
        | "pre_publish";
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
      service_request_status:
        | "pending"
        | "reviewing"
        | "approved"
        | "implementing"
        | "implemented"
        | "rejected"
        | "duplicate";
      shop_approval_status_enum: "pending" | "approved" | "rejected";
      shop_order_item_status_enum:
        | "pending"
        | "paid"
        | "fulfilled"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded";
      shop_payment_method_enum: "online" | "cod";
      shop_policy_type_enum:
        | "return_refund"
        | "digital_products"
        | "shipping"
        | "privacy"
        | "terms_of_service";
      shop_product_type_enum: "digital" | "physical";
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
      access_grant_type_enum: ["purchase", "gift"],
      kyc_session_status_enum: ["pending", "opened", "submitted", "expired"],
      kyc_status_enum: [
        "pending",
        "under_review",
        "approved",
        "rejected",
        "resubmit_requested",
      ],
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
        "service_requests.view",
        "service_requests.approve",
        "service_requests.reject",
        "service_requests.mark_implemented",
      ],
      manager_role: [
        "super_admin",
        "content_manager",
        "support_manager",
        "finance_manager",
        "developer_manager",
      ],
      manager_status: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      membership_billing_cycle_enum: ["monthly", "annual", "lifetime"],
      membership_notification_type_enum: [
        "5_days",
        "3_days",
        "1_day",
        "expired",
        "3_days_post",
        "7_days_post",
      ],
      membership_status_enum: [
        "active",
        "cancelled",
        "expired",
        "paused",
        "past_due",
      ],
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
      post_status_enum: ["draft", "published", "review", "archived"],
      post_version_source_enum: [
        "autosave",
        "ai_polish",
        "manual_save",
        "pre_publish",
      ],
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
      service_request_status: [
        "pending",
        "reviewing",
        "approved",
        "implementing",
        "implemented",
        "rejected",
        "duplicate",
      ],
      shop_approval_status_enum: ["pending", "approved", "rejected"],
      shop_order_item_status_enum: [
        "pending",
        "paid",
        "fulfilled",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      shop_payment_method_enum: ["online", "cod"],
      shop_policy_type_enum: [
        "return_refund",
        "digital_products",
        "shipping",
        "privacy",
        "terms_of_service",
      ],
      shop_product_type_enum: ["digital", "physical"],
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
