import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "en-US",
  srcDir: "docs",
  lastUpdated: true,
  base: "/docs/",

  title: "@hobenakicoffee/libraries",
  description:
    "A framework-agnostic TypeScript package providing shared constants, utilities, types, and moderation tools.",

  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
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

    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Home", link: "/" },
          { text: "Getting Started", link: "/getting-started" },
        ],
      },
      {
        text: "Constants",
        items: [
          { text: "Overview", link: "/constants/overview" },
          { text: "Visibility", link: "/constants/visibility" },
          { text: "Payment", link: "/constants/payment" },
          { text: "Platforms", link: "/constants/platforms" },
          { text: "Services", link: "/constants/services" },
        ],
      },
      {
        text: "Utilities",
        items: [
          { text: "Overview", link: "/utils/overview" },
          { text: "Format", link: "/utils/format" },
          { text: "Validation", link: "/utils/validation" },
          { text: "Links", link: "/utils/links" },
          { text: "Sharing", link: "/utils/sharing" },
        ],
      },
      {
        text: "Types",
        items: [
          { text: "Overview", link: "/types/overview" },
          { text: "Supabase", link: "/types/supabase" },
        ],
      },
      {
        text: "More",
        items: [
          { text: "Moderation", link: "/moderation" },
          { text: "Normalizer", link: "/moderation/normalizer" },
          { text: "nuqs", link: "/nuqs" },
          { text: "Hooks", link: "/hooks" },
          { text: "Scripts", link: "/scripts" },
        ],
      },
    ],

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/hobenakicoffee",
      },
    ],
  },
});
