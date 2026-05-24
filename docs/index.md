---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "হবে নাকি Coffee? Library"
  text: "A framework-agnostic TypeScript package."
  tagline: Essential for our heavy ecosystem.
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: Shamscorner LLC
      link: https://shamscorner.com

features:
  - title: Constants
    details: Payment types, statuses, platforms, visibility, service types, and Bangladesh geo data.
  - title: Utilities
    details: Format amounts, dates, validate phone numbers, social links, and more.
  - title: TypeScript Types
    details: Full Supabase database types and custom type definitions.
  - title: Moderation
    details: Profanity detection for English and Bengali with leetspeak normalization.
  - title: URL State (nuqs)
    details: Type-safe URL state parsers using zod for sorting, filtering, and date ranges.
  - title: Scripts
    details: Build utilities and environment encryption helpers.
---

<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://avatars.githubusercontent.com/u/17263087?v=4',
    name: 'Shamim Hossain',
    title: 'Founder & CTO',
    links: [
      { icon: 'github', link: 'https://github.com/shamscorner' },
      { icon: 'twitter', link: 'https://twitter.com/shamscorner' }
    ]
  },
  {
    avatar: 'https://avatars.githubusercontent.com/u/96902380?v=4',
    name: 'Musfiq Rahman',
    title: 'Co-Founder & Developer',
    links: [
      { icon: 'github', link: 'https://github.com/shamscorner' },
      { icon: 'twitter', link: 'https://twitter.com/shamscorner' }
    ]
  },
  {
    avatar: 'https://avatars.githubusercontent.com/u/39709519?v=4',
    name: 'Masud Rana',
    title: 'Co-Founder & Developer',
    links: [
      { icon: 'github', link: 'https://github.com/shamscorner' },
      { icon: 'twitter', link: 'https://twitter.com/shamscorner' }
    ]
  }
]
</script>

## Our Team

Say hello to our awesome team.

<VPTeamMembers size="small" :members />
