import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

const common = [
  { text: "Go back", link: "/getting-started" },
  { text: "Home", link: "https://developer.hobenakicoffee.com" },
];

const appFrontend = [
  { text: "App Architecture", link: "/app-architecture/frontend/" },
  { text: "Auth", link: "/auth/frontend/" },
  { text: "Onboarding", link: "/onboarding/frontend/" },
  { text: "Settings", link: "/settings/frontend/" },
  { text: "Profile", link: "/profile/frontend/" },
  { text: "Services Hub", link: "/services-hub/frontend/" },
  { text: "Creator Agreement", link: "/creator-agreement/frontend/" },
  { text: "Supporters", link: "/supporters/frontend/" },
  { text: "Notifications", link: "/notifications/frontend/" },
  { text: "Electron Desktop", link: "/electron-desktop/frontend/" },
  { text: "Common Components", link: "/common-components/frontend/" },
  { text: "Custom Hooks", link: "/custom-hooks/frontend/" },
  { text: "Services Layer", link: "/services-layer/frontend/" },
  { text: "Error Handling", link: "/error-handling/frontend/" },
  { text: "Image Upload", link: "/image-upload/frontend/" },
];

const marketingFrontend = [
  { text: "Architecture", link: "/marketing/architecture/" },
  { text: "Routes", link: "/marketing/routes/" },
  { text: "Actions", link: "/marketing/actions/" },
  { text: "Auth", link: "/marketing/auth/" },
  { text: "Creator Pages", link: "/marketing/creator-pages/" },
  { text: "Monetization", link: "/marketing/monetization/" },
  { text: "Social Features", link: "/marketing/social/" },
  { text: "Infrastructure", link: "/marketing/infrastructure/" },
];

const marketingProductBriefs = [
  { text: "Overview", link: "/marketing/product-briefs/" },
  { text: "Product Overview", link: "/marketing/product-briefs/overview" },
  { text: "Features", link: "/marketing/product-briefs/features" },
  { text: "User Journeys", link: "/marketing/product-briefs/user-journeys" },
  { text: "Platform Pages", link: "/marketing/product-briefs/platform-pages" },
  { text: "Copy Guide", link: "/marketing/product-briefs/copy-guide" },
  { text: "Trust Signals", link: "/marketing/product-briefs/trust-signals" },
  { text: "Open Questions", link: "/marketing/product-briefs/open-questions" },
];

const backendRef = [
  { text: "Common Types & Enums", link: "/common/backend/" },
  { text: "Edge Functions", link: "/edge-functions/backend/" },
  { text: "Email Notifications", link: "/email-notifications/backend/" },
  { text: "Infrastructure", link: "/infrastructure/backend/" },
  { text: "Messaging", link: "/messaging/backend/" },
  { text: "Platform Settings", link: "/platform-settings/backend/" },
  { text: "Profiles", link: "/profiles/backend/" },
  { text: "User Services", link: "/user-services/backend/" },
  { text: "Supabase Backend (Master Index)", link: "/supabase-backend" },
];

export default withMermaid(
  defineConfig({
    mermaid: {
      theme: "base",
    },
    lang: "en-US",
    srcDir: "docs",
    lastUpdated: true,
    base: "/docs/",

    title: "@hobenakicoffee/libraries",
    description:
      "A framework-agnostic TypeScript package providing shared constants, utilities, types, and moderation tools.",

    head: [
      ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
      ["link", { rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
      [
        "meta",
        {
          property: "og:title",
          content: "@hobenakicoffee/libraries",
        },
      ],
      [
        "meta",
        {
          property: "og:description",
          content:
            "A framework-agnostic TypeScript package providing shared constants, utilities, types, and moderation tools.",
        },
      ],
      ["meta", { property: "og:image", content: "/opengraph.png" }],
      [
        "meta",
        {
          property: "og:url",
          content: "https://developer.hobenakicoffee.com/docs/",
        },
      ],
      ["meta", { name: "twitter:card", content: "summary_large_image" }],
      [
        "meta",
        {
          name: "twitter:title",
          content: "@hobenakicoffee/libraries",
        },
      ],
      [
        "meta",
        {
          name: "twitter:description",
          content:
            "A framework-agnostic TypeScript package providing shared constants, utilities, types, and moderation tools.",
        },
      ],
      ["meta", { name: "theme-color", content: "#CC3355" }],
    ],

    sitemap: {
      hostname: "https://developer.hobenakicoffee.com/docs/",
    },

    themeConfig: {
      logo: "logo-full.svg",
      nav: [
        { text: "Home", link: "https://developer.hobenakicoffee.com" },
        { text: "Getting Started", link: "/getting-started" },
        { text: "Frontend", link: "/frontend/" },
        { text: "Backend", link: "/supabase-backend" },
      ],

      footer: {
        message: "Released under the MIT License.",
        copyright:
          'Copyright © 2014-present <a href="https://shamscorner.com">Shamscorner LLC</a>',
      },

      outline: "deep",

      search: {
        provider: "local",
      },

      sidebar: {
        "/": [
          {
            text: "Guide",
            items: [
              { text: "Home", link: "https://developer.hobenakicoffee.com" },
              { text: "Getting Started", link: "/getting-started" },
              { text: "Libraries", link: "/libraries/" },
              { text: "Frontend Overview", link: "/frontend/" },
              {
                text: "Supabase Backend (Master Index)",
                link: "/supabase-backend",
              },
            ],
          },
          {
            text: "App (React SPA)",
            collapsed: false,
            items: appFrontend,
          },
          {
            text: "Marketing (Astro SSR)",
            collapsed: false,
            items: marketingFrontend,
          },
          {
            text: "Marketing Product Briefs",
            collapsed: false,
            items: marketingProductBriefs,
          },
          {
            text: "Backend Reference",
            collapsed: false,
            items: backendRef,
          },
          {
            text: "Features",
            collapsed: false,
            items: [
              {
                text: "Coffee Gifts",
                link: "/coffee-gifts/frontend/",
              },
              {
                text: "Shop Service",
                link: "/shop-service/frontend/index",
              },
              {
                text: "Memberships Hub",
                link: "/memberships-hub/frontend/index",
              },
              {
                text: "Newsletter Service",
                link: "/newsletter-service/frontend/",
              },
              {
                text: "Payments & Memberships",
                link: "/payments-and-memberships/frontend/",
              },
              {
                text: "KYC Verification",
                link: "/kyc/frontend/",
              },
              {
                text: "Explore Page",
                link: "/explore/frontend/",
              },
              {
                text: "Feed Discovery",
                link: "/feed-discovery/frontend/",
              },
              {
                text: "Managers & RBAC",
                link: "/managers-and-rbac/backend/",
              },
              {
                text: "Creator Reports",
                link: "/reports/frontend/",
              },
              {
                text: "Notifications",
                link: "/notifications/",
              },
              {
                text: "Wishlist Signups",
                link: "/wishlist/",
              },
            ],
          },
          {
            text: "Developer Training",
            link: "/training/day-01-sql-basics",
          },
        ],

        "/frontend/": [
          ...common,
          { text: "Frontend Overview", link: "/frontend/" },
          {
            text: "App (React SPA)",
            collapsed: false,
            items: appFrontend,
          },
          {
            text: "Marketing (Astro SSR)",
            collapsed: false,
            items: marketingFrontend,
          },
          {
            text: "Marketing Product Briefs",
            collapsed: false,
            items: marketingProductBriefs,
          },
        ],

        "/app-architecture/frontend/": [...common, ...appFrontend],
        "/auth/frontend/": [...common, ...appFrontend],
        "/onboarding/frontend/": [...common, ...appFrontend],
        "/settings/frontend/": [...common, ...appFrontend],
        "/profile/frontend/": [...common, ...appFrontend],
        "/services-hub/frontend/": [...common, ...appFrontend],
        "/creator-agreement/frontend/": [...common, ...appFrontend],
        "/supporters/frontend/": [...common, ...appFrontend],
        "/notifications/frontend/": [...common, ...appFrontend],
        "/electron-desktop/frontend/": [...common, ...appFrontend],
        "/common-components/frontend/": [...common, ...appFrontend],
        "/custom-hooks/frontend/": [...common, ...appFrontend],
        "/services-layer/frontend/": [...common, ...appFrontend],
        "/error-handling/frontend/": [...common, ...appFrontend],
        "/image-upload/frontend/": [...common, ...appFrontend],

        "/marketing/": [
          ...common,
          { text: "Marketing Overview", link: "/marketing/architecture/" },
          {
            text: "Marketing (Astro SSR)",
            collapsed: false,
            items: marketingFrontend,
          },
          {
            text: "Marketing Product Briefs",
            collapsed: false,
            items: marketingProductBriefs,
          },
        ],

        "/marketing/product-briefs/": [
          ...common,
          { text: "Marketing Overview", link: "/marketing/architecture/" },
          {
            text: "Marketing Product Briefs",
            collapsed: false,
            items: marketingProductBriefs,
          },
        ],

        "/common/backend/": [...common, ...backendRef],
        "/email-notifications/backend/": [...common, ...backendRef],
        "/messaging/backend/": [...common, ...backendRef],
        "/platform-settings/backend/": [...common, ...backendRef],
        "/profiles/backend/": [...common, ...backendRef],
        "/user-services/backend/": [...common, ...backendRef],

        "/supporters/backend/": [...common, ...backendRef],
        "/edge-functions/backend/": [
          ...common,
          {
            text: "Backend Reference",
            items: [
              { text: "Common Types & Enums", link: "/common/backend/" },
              {
                text: "Edge Functions",
                collapsed: false,
                items: [
                  { text: "Overview", link: "/edge-functions/backend/" },
                  {
                    text: "Middleware",
                    link: "/edge-functions/backend/middleware",
                  },
                  {
                    text: "create-kyc-session",
                    link: "/edge-functions/backend/create-kyc-session",
                  },
                  {
                    text: "delete-user",
                    link: "/edge-functions/backend/delete-user",
                  },
                  {
                    text: "ai-editor-chat",
                    link: "/edge-functions/backend/ai-editor-chat",
                  },
                  {
                    text: "moderate-content",
                    link: "/edge-functions/backend/moderate-content",
                  },
                  {
                    text: "download-shop-file",
                    link: "/edge-functions/backend/download-shop-file",
                  },
                  {
                    text: "export-shop-products",
                    link: "/edge-functions/backend/export-shop-products",
                  },
                ],
              },
              {
                text: "Email Notifications",
                link: "/email-notifications/backend/",
              },
              { text: "Infrastructure", link: "/infrastructure/backend/" },
              { text: "Messaging", link: "/messaging/backend/" },
              {
                text: "Platform Settings",
                link: "/platform-settings/backend/",
              },
              { text: "Profiles", link: "/profiles/backend/" },
              { text: "User Services", link: "/user-services/backend/" },
              {
                text: "Supabase Backend (Master Index)",
                link: "/supabase-backend",
              },
            ],
          },
        ],

        "/infrastructure/backend/": [
          ...common,
          {
            text: "Backend Reference",
            items: [
              { text: "Common Types & Enums", link: "/common/backend/" },
              { text: "Edge Functions", link: "/edge-functions/backend/" },
              {
                text: "Email Notifications",
                link: "/email-notifications/backend/",
              },
              {
                text: "Infrastructure",
                collapsed: false,
                items: [
                  { text: "Overview", link: "/infrastructure/backend/" },
                  {
                    text: "BD Geo Data",
                    link: "/infrastructure/backend/geo-data",
                  },
                ],
              },
              { text: "Messaging", link: "/messaging/backend/" },
              {
                text: "Platform Settings",
                link: "/platform-settings/backend/",
              },
              { text: "Profiles", link: "/profiles/backend/" },
              { text: "User Services", link: "/user-services/backend/" },
              {
                text: "Supabase Backend (Master Index)",
                link: "/supabase-backend",
              },
            ],
          },
        ],

        "/libraries/": [
          ...common,
          { text: "Overview", link: "/libraries/" },
          {
            text: "Libraries",
            items: [
              {
                text: "Constants",
                collapsed: false,
                items: [
                  { text: "Overview", link: "/libraries/constants/" },
                  {
                    text: "Visibility",
                    link: "/libraries/constants/visibility",
                  },
                  { text: "Payment", link: "/libraries/constants/payment" },
                  { text: "Platforms", link: "/libraries/constants/platforms" },
                  { text: "Services", link: "/libraries/constants/services" },
                ],
              },
              {
                text: "Utilities",
                collapsed: false,
                items: [
                  { text: "Overview", link: "/libraries/utils/" },
                  { text: "Format", link: "/libraries/utils/format" },
                  { text: "Validation", link: "/libraries/utils/validation" },
                  { text: "Links", link: "/libraries/utils/links" },
                  { text: "Sharing", link: "/libraries/utils/sharing" },
                ],
              },
              {
                text: "Types",
                collapsed: false,
                items: [
                  { text: "Overview", link: "/libraries/types/" },
                  { text: "Supabase", link: "/libraries/types/supabase" },
                ],
              },
              {
                text: "More",
                collapsed: false,
                items: [
                  { text: "Moderation", link: "/libraries/moderation" },
                  {
                    text: "Normalizer",
                    link: "/libraries/moderation/normalizer",
                  },
                  { text: "nuqs", link: "/libraries/nuqs" },
                  { text: "Hooks", link: "/libraries/hooks" },
                  { text: "Scripts", link: "/libraries/scripts" },
                ],
              },
            ],
          },
        ],

        "/coffee-gifts/": [
          ...common,
          {
            text: "Coffee Gifts",
            items: [
              {
                text: "Frontend",
                collapsed: false,
                items: [
                  { text: "Overview", link: "/coffee-gifts/frontend/" },
                  {
                    text: "Sending a Gift",
                    link: "/coffee-gifts/frontend/sending-a-gift",
                  },
                  {
                    text: "Anonymous vs Authenticated",
                    link: "/coffee-gifts/frontend/anonymous-vs-authenticated",
                  },
                  {
                    text: "Displaying Gifts",
                    link: "/coffee-gifts/frontend/displaying-gifts",
                  },
                  { text: "Stats", link: "/coffee-gifts/frontend/stats" },
                ],
              },
              {
                text: "Backend",
                collapsed: false,
                items: [
                  { text: "Overview", link: "/coffee-gifts/backend/" },
                  {
                    text: "Database Schema",
                    link: "/coffee-gifts/backend/database-schema",
                  },
                  {
                    text: "RPC: Perform Coffee Gift",
                    link: "/coffee-gifts/backend/rpc-perform-coffee-gift",
                  },
                  {
                    text: "RPC: Stats",
                    link: "/coffee-gifts/backend/rpc-stats",
                  },
                  {
                    text: "Payment Pipeline",
                    link: "/coffee-gifts/backend/payment-pipeline",
                  },
                  {
                    text: "Security & RLS",
                    link: "/coffee-gifts/backend/security-and-rls",
                  },
                ],
              },
            ],
          },
        ],

        "/payments-and-memberships/": [
          ...common,
          {
            text: "Payments & Memberships",
            items: [
              {
                text: "Frontend",
                collapsed: false,
                items: [
                  {
                    text: "Overview",
                    link: "/payments-and-memberships/frontend/",
                  },
                  {
                    text: "Wallet",
                    link: "/payments-and-memberships/frontend/wallet",
                  },
                  {
                    text: "Payout Methods",
                    link: "/payments-and-memberships/frontend/payout-methods",
                  },
                  {
                    text: "Transactions",
                    link: "/payments-and-memberships/frontend/transactions",
                  },
                  {
                    text: "Withdrawal",
                    link: "/payments-and-memberships/frontend/withdrawal",
                  },
                  {
                    text: "Activities",
                    link: "/payments-and-memberships/frontend/activities",
                  },
                  {
                    text: "Memberships",
                    link: "/payments-and-memberships/frontend/memberships",
                  },
                ],
              },
              {
                text: "Backend",
                collapsed: false,
                items: [
                  {
                    text: "Overview",
                    link: "/payments-and-memberships/backend/",
                  },
                  {
                    text: "Enums",
                    link: "/payments-and-memberships/backend/enums",
                  },
                  {
                    text: "Wallets",
                    link: "/payments-and-memberships/backend/wallets",
                  },
                  {
                    text: "Payout Methods",
                    link: "/payments-and-memberships/backend/payout-methods",
                  },
                  {
                    text: "Transactions",
                    link: "/payments-and-memberships/backend/transactions",
                  },
                  {
                    text: "Refunds",
                    link: "/payments-and-memberships/backend/refunds",
                  },
                  {
                    text: "Withdrawal Requests",
                    link: "/payments-and-memberships/backend/withdrawal-requests",
                  },
                  {
                    text: "Activities",
                    link: "/payments-and-memberships/backend/activities",
                  },
                  {
                    text: "Memberships",
                    link: "/payments-and-memberships/backend/memberships",
                  },
                  {
                    text: "Payment Functions",
                    link: "/payments-and-memberships/backend/payment-functions",
                  },
                ],
              },
            ],
          },
        ],

        "/shop-service/": [
          ...common,
          {
            text: "Shop Service",
            items: [
              {
                text: "Frontend",
                collapsed: false,
                items: [
                  { text: "Overview", link: "/shop-service/frontend/" },
                  { text: "Theming", link: "/shop-service/frontend/theming" },
                  {
                    text: "Public Pages",
                    link: "/shop-service/frontend/public-pages",
                  },
                  {
                    text: "Studio Settings",
                    link: "/shop-service/frontend/studio-settings",
                  },
                  {
                    text: "Studio Products",
                    link: "/shop-service/frontend/studio-products",
                  },
                  {
                    text: "Studio Categories",
                    link: "/shop-service/frontend/studio-categories",
                  },
                  {
                    text: "Studio Orders",
                    link: "/shop-service/frontend/studio-orders",
                  },
                  { text: "Checkout", link: "/shop-service/frontend/checkout" },
                  {
                    text: "Buyer Orders",
                    link: "/shop-service/frontend/buyer-orders",
                  },
                ],
              },
              {
                text: "Backend",
                collapsed: false,
                items: [
                  { text: "Overview", link: "/shop-service/backend/" },
                  { text: "Schema", link: "/shop-service/backend/schema" },
                  {
                    text: "Shop Settings",
                    link: "/shop-service/backend/shop-settings",
                  },
                  {
                    text: "RPC Helpers",
                    link: "/shop-service/backend/rpc-helpers",
                  },
                  {
                    text: "RPC Products",
                    link: "/shop-service/backend/rpc-products",
                  },
                  {
                    text: "RPC Categories",
                    link: "/shop-service/backend/rpc-categories",
                  },
                  {
                    text: "RPC Checkout",
                    link: "/shop-service/backend/rpc-checkout",
                  },
                  {
                    text: "RPC Orders",
                    link: "/shop-service/backend/rpc-orders",
                  },
                  { text: "RPC COD", link: "/shop-service/backend/rpc-cod" },
                  {
                    text: "RPC Dashboard",
                    link: "/shop-service/backend/rpc-dashboard",
                  },
                  {
                    text: "RPC Reference",
                    link: "/shop-service/backend/rpc-reference",
                  },
                ],
              },
            ],
          },
        ],

        "/newsletter-service/": [
          ...common,
          {
            text: "Newsletter Service",
            items: [
              {
                text: "Frontend",
                collapsed: false,
                items: [
                  { text: "Overview", link: "/newsletter-service/frontend/" },
                  {
                    text: "Reader Feed",
                    link: "/newsletter-service/frontend/reader-feed",
                  },
                  {
                    text: "Post Access",
                    link: "/newsletter-service/frontend/post-access",
                  },
                  {
                    text: "Interactions",
                    link: "/newsletter-service/frontend/interactions",
                  },
                  {
                    text: "Creator Studio",
                    link: "/newsletter-service/frontend/creator-studio",
                  },
                  {
                    text: "Payments",
                    link: "/newsletter-service/frontend/payments",
                  },
                ],
              },
              {
                text: "Backend",
                collapsed: false,
                items: [
                  { text: "Overview", link: "/newsletter-service/backend/" },
                  {
                    text: "Schema",
                    link: "/newsletter-service/backend/tables",
                  },
                  {
                    text: "Newsletter Posts",
                    link: "/newsletter-service/backend/newsletter-posts",
                  },
                  {
                    text: "Engagement & Access",
                    link: "/newsletter-service/backend/engagement-and-access",
                  },
                  {
                    text: "Analytics",
                    link: "/newsletter-service/backend/analytics",
                  },
                  {
                    text: "Triggers & RLS",
                    link: "/newsletter-service/backend/triggers-and-rls",
                  },
                  {
                    text: "RPC Reference",
                    link: "/newsletter-service/backend/rpcs",
                  },
                ],
              },
            ],
          },
        ],

        "/explore/": [
          ...common,
          {
            text: "Explore Page",
            items: [
              {
                text: "Frontend",
                collapsed: false,
                items: [
                  { text: "Implementation Guide", link: "/explore/frontend/" },
                ],
              },
              {
                text: "Backend",
                collapsed: false,
                items: [
                  { text: "Overview", link: "/explore/backend/" },
                  {
                    text: "RPC: get_explore_creators",
                    link: "/explore/backend/rpc-get-explore-creators",
                  },
                ],
              },
            ],
          },
        ],

        "/feed-discovery/": [
          ...common,
          {
            text: "Feed Discovery",
            items: [
              {
                text: "Frontend",
                collapsed: false,
                items: [
                  {
                    text: "Implementation Guide",
                    link: "/feed-discovery/frontend/",
                  },
                ],
              },
              {
                text: "Backend",
                collapsed: false,
                items: [
                  { text: "Overview", link: "/feed-discovery/backend/" },
                  {
                    text: "Data Model",
                    link: "/feed-discovery/backend/data-model",
                  },
                  {
                    text: "Feed Population",
                    link: "/feed-discovery/backend/feed-population",
                  },
                  { text: "Ranking", link: "/feed-discovery/backend/ranking" },
                  {
                    text: "RPC: get_feed",
                    link: "/feed-discovery/backend/rpc-get-feed",
                  },
                  {
                    text: "RPC: search_feed",
                    link: "/feed-discovery/backend/rpc-search-feed",
                  },
                  {
                    text: "RPC: Social Interactions",
                    link: "/feed-discovery/backend/rpc-social",
                  },
                  {
                    text: "RPC: Aside Panels",
                    link: "/feed-discovery/backend/rpc-aside",
                  },
                ],
              },
            ],
          },
        ],

        "/managers-and-rbac/": [
          ...common,
          {
            text: "Managers & RBAC",
            items: [
              {
                text: "Backend",
                collapsed: false,
                items: [
                  {
                    text: "Overview",
                    link: "/managers-and-rbac/backend/",
                  },
                  {
                    text: "Roles & Permissions",
                    link: "/managers-and-rbac/backend/roles-and-permissions",
                  },
                  {
                    text: "RLS Policies",
                    link: "/managers-and-rbac/backend/rls-policies",
                  },
                  {
                    text: "Manager RPCs",
                    link: "/managers-and-rbac/backend/rpcs",
                  },
                ],
              },
            ],
          },
        ],

        "/reports/": [
          ...common,
          {
            text: "Creator Reports",
            items: [
              {
                text: "Frontend",
                collapsed: false,
                items: [{ text: "Overview", link: "/reports/frontend/" }],
              },
              {
                text: "Backend",
                collapsed: false,
                items: [
                  { text: "Overview", link: "/reports/backend/" },
                  { text: "Schema", link: "/reports/backend/schema" },
                ],
              },
            ],
          },
        ],

        "/notifications/": [
          ...common,
          {
            text: "Notifications",
            items: [
              {
                text: "Frontend",
                collapsed: false,
                items: [{ text: "Overview", link: "/notifications/frontend/" }],
              },
              {
                text: "Backend",
                collapsed: false,
                items: [{ text: "Overview", link: "/notifications/" }],
              },
            ],
          },
        ],

        "/kyc/": [
          ...common,
          {
            text: "KYC Verification",
            items: [
              {
                text: "Frontend",
                collapsed: false,
                items: [
                  { text: "Implementation Guide", link: "/kyc/frontend/" },
                ],
              },
              {
                text: "Backend",
                collapsed: false,
                items: [{ text: "Overview", link: "/kyc/backend/" }],
              },
            ],
          },
        ],

        "/memberships-hub/": [
          ...common,
          {
            text: "Memberships Hub",
            items: [
              {
                text: "Frontend",
                collapsed: false,
                items: [
                  { text: "Overview", link: "/memberships-hub/frontend/" },
                  { text: "Feed", link: "/memberships-hub/frontend/feed" },
                  {
                    text: "Interactions",
                    link: "/memberships-hub/frontend/interactions",
                  },
                  { text: "Boost", link: "/memberships-hub/frontend/boost" },
                  {
                    text: "Creator Dashboard",
                    link: "/memberships-hub/frontend/creator-dashboard",
                  },
                ],
              },
              {
                text: "Backend",
                collapsed: false,
                items: [
                  { text: "Overview", link: "/memberships-hub/backend/" },
                  {
                    text: "Feed Items",
                    link: "/memberships-hub/backend/feed-items",
                  },
                  {
                    text: "Interactions",
                    link: "/memberships-hub/backend/interactions",
                  },
                  {
                    text: "Boost Campaigns",
                    link: "/memberships-hub/backend/boost-campaigns",
                  },
                  {
                    text: "Affinity Ranking",
                    link: "/memberships-hub/backend/affinity-ranking",
                  },
                  {
                    text: "RPC Reference",
                    link: "/memberships-hub/backend/rpcs-reference",
                  },
                  {
                    text: "Platform Settings",
                    link: "/memberships-hub/backend/platform-settings",
                  },
                ],
              },
            ],
          },
        ],

        "/training/": [
          ...common,
          {
            text: "Developer Training",
            items: [
              { text: "Overview", link: "/training/day-01-sql-basics" },
              {
                text: "Week 1: SQL Foundations",
                collapsed: false,
                items: [
                  {
                    text: "Day 1: SQL Basics",
                    link: "/training/day-01-sql-basics",
                  },
                  {
                    text: "Day 2: SQL CRUD",
                    link: "/training/day-02-sql-crud",
                  },
                  {
                    text: "Day 3: SQL Joins",
                    link: "/training/day-03-sql-joins",
                  },
                  {
                    text: "Day 4: Functions & Aggregates",
                    link: "/training/day-04-sql-functions-aggregates",
                  },
                  {
                    text: "Day 5: Constraints, Indexes & Enums",
                    link: "/training/day-05-sql-constraints-indexes-enums",
                  },
                ],
              },
              {
                text: "Week 2: PostgreSQL & Supabase Core",
                collapsed: false,
                items: [
                  {
                    text: "Day 6: PL/pgSQL & Triggers",
                    link: "/training/day-06-plpgsql-triggers",
                  },
                  {
                    text: "Day 7: Supabase Auth",
                    link: "/training/day-07-supabase-auth",
                  },
                  {
                    text: "Day 8: Row Level Security",
                    link: "/training/day-08-row-level-security",
                  },
                  {
                    text: "Day 9: Edge Functions",
                    link: "/training/day-09-edge-functions",
                  },
                  { text: "Day 10: Storage", link: "/training/day-10-storage" },
                ],
              },
              {
                text: "Week 3: Project Deep-Dives",
                collapsed: false,
                items: [
                  {
                    text: "Day 11: Schema Walkthrough",
                    link: "/training/day-11-schema-walkthrough",
                  },
                  {
                    text: "Day 12: RBAC & JWT",
                    link: "/training/day-12-rbac-jwt",
                  },
                  {
                    text: "Day 13: Wallets & Transactions",
                    link: "/training/day-13-wallets-transactions",
                  },
                  {
                    text: "Day 14: Edge Functions Deep-Dive",
                    link: "/training/day-14-edge-functions-deepdive",
                  },
                  {
                    text: "Day 15: Testing & Migrations",
                    link: "/training/day-15-testing-migrations",
                  },
                ],
              },
              {
                text: "Week 4: Advanced SQL Patterns",
                collapsed: false,
                items: [
                  {
                    text: "Day 16: CTEs, Subqueries & CASE",
                    link: "/training/day-16-cte-subqueries-case",
                  },
                  {
                    text: "Day 17: Transactions & Locking",
                    link: "/training/day-17-transactions-locking",
                  },
                  {
                    text: "Day 18: Error Handling in PL/pgSQL",
                    link: "/training/day-18-error-handling-plpgsql",
                  },
                  {
                    text: "Day 19: Full-Text Search",
                    link: "/training/day-19-full-text-search",
                  },
                  {
                    text: "Day 20: Table Partitioning",
                    link: "/training/day-20-table-partitioning",
                  },
                  {
                    text: "Day 21: Cron, Aggregation & Grants",
                    link: "/training/day-21-cron-aggregation-grants",
                  },
                ],
              },
            ],
          },
        ],
      },

      socialLinks: [
        {
          icon: "github",
          link: "https://github.com/hobenakicoffee",
        },
      ],
    },
  })
);
