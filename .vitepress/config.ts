import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

const common = [
  { text: "Go back", link: "/getting-started" },
  { text: "Home", link: "https://developer.hobenakicoffee.com" },
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

    sitemap: {
      hostname: "https://developer.hobenakicoffee.com/docs/",
    },

    themeConfig: {
      nav: [
        { text: "Home", link: "https://developer.hobenakicoffee.com" },
        { text: "Getting Started", link: "/getting-started" },
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
              { text: "Shop Service", link: "/shop-service/frontend/index" },
              {
                text: "Memberships Hub",
                link: "/memberships-hub/frontend/index",
              },
              {
                text: "Newsletter Service",
                link: "/newsletter-service/frontend/",
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
                    text: "RPC Helpers",
                    link: "/shop-service/backend/rpc-helpers",
                  },
                  {
                    text: "RPC Products",
                    link: "/shop-service/backend/rpc-products",
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
