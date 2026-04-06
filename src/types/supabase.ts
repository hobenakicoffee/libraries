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
          created_at: string | null;
          display_name: string | null;
          first_service_name: string | null;
          follower_count: number | null;
          following_count: number | null;
          full_name: string | null;
          has_first_service: boolean | null;
          has_wallet_balance: boolean | null;
          id: string;
          is_page_active: boolean | null;
          layout: Json | null;
          onboarding_completed_at: string | null;
          onboarding_step: number | null;
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
          first_service_name?: string | null;
          follower_count?: number | null;
          following_count?: number | null;
          full_name?: string | null;
          has_first_service?: boolean | null;
          has_wallet_balance?: boolean | null;
          id: string;
          is_page_active?: boolean | null;
          layout?: Json | null;
          onboarding_completed_at?: string | null;
          onboarding_step?: number | null;
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
          first_service_name?: string | null;
          follower_count?: number | null;
          following_count?: number | null;
          full_name?: string | null;
          has_first_service?: boolean | null;
          has_wallet_balance?: boolean | null;
          id?: string;
          is_page_active?: boolean | null;
          layout?: Json | null;
          onboarding_completed_at?: string | null;
          onboarding_step?: number | null;
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
      check_newsletter_post_access: {
        Args: { p_post_id: string };
        Returns: {
          access_reason: string;
          has_access: boolean;
        }[];
      };
      cleanup_orphaned_post_images: { Args: never; Returns: undefined };
      create_manager: {
        Args: {
          manager_department?: string;
          manager_email: string;
          manager_full_name: string;
          manager_role: Database["public"]["Enums"]["manager_role"];
        };
        Returns: string;
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
          revenue_total: number;
          slug: string;
          subtitle: string;
          tags: string[];
          title: string;
          updated_at: string;
          view_count: number;
        }[];
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
      is_admin: { Args: never; Returns: boolean };
      is_following: { Args: { target_user_id: string }; Returns: boolean };
      is_manager: { Args: { user_email: string }; Returns: boolean };
      mark_conversation_as_read: {
        Args: { p_conversation_id: string };
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
      toggle_follow: { Args: { target_user_id: string }; Returns: boolean };
      toggle_newsletter_post_like: {
        Args: { p_post_id: string };
        Returns: Json;
      };
      unfollow_user: { Args: { target_user_id: string }; Returns: undefined };
      unpublish_newsletter_post: { Args: { p_post_id: string }; Returns: Json };
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
      access_grant_type_enum: "purchase" | "gift";
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
      post_status_enum: "draft" | "published" | "archived" | "review";
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
      post_status_enum: ["draft", "published", "archived", "review"],
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
