import { defineConfig } from "vitepress";

const common = [
  { text: "Go back", link: "/getting-started" },
  { text: "Home", link: "https://developer.hobenakicoffee.com" },
];

export default defineConfig({
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
            { text: "Libraries", link: "/libraries/overview" },
          ],
        },
      ],
      "/libraries/": [
        ...common,
        { text: "Overview", link: "/libraries/overview" },
        {
          text: "Libraries",
          items: [
            {
              text: "Constants",
              collapsed: false,
              items: [
                { text: "Overview", link: "/libraries/constants/overview" },
                { text: "Visibility", link: "/libraries/constants/visibility" },
                { text: "Payment", link: "/libraries/constants/payment" },
                { text: "Platforms", link: "/libraries/constants/platforms" },
                { text: "Services", link: "/libraries/constants/services" },
              ],
            },
            {
              text: "Utilities",
              collapsed: false,
              items: [
                { text: "Overview", link: "/libraries/utils/overview" },
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
                { text: "Overview", link: "/libraries/types/overview" },
                { text: "Supabase", link: "/libraries/types/supabase" },
              ],
            },
            {
              text: "More",
              collapsed: false,
              items: [
                { text: "Moderation", link: "/libraries/more/moderation" },
                {
                  text: "Normalizer",
                  link: "/libraries/more/moderation/normalizer",
                },
                { text: "nuqs", link: "/libraries/more/nuqs" },
                { text: "Hooks", link: "/libraries/more/hooks" },
                { text: "Scripts", link: "/libraries/more/scripts" },
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
});
