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
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/shamim-shamscorner' }
    ]
  },
  {
    avatar: 'https://avatars.githubusercontent.com/u/39709519?v=4',
    name: 'Masud Rana',
    title: 'Co-Founder & Marketing Lead',
    links: [
      { icon: 'github', link: 'https://github.com/Masud09' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/masud-rana09' }
    ]
  },
  {
    avatar: 'https://avatars.githubusercontent.com/u/96902380?v=4',
    name: 'Musfiq Rahman',
    title: 'Co-Founder & Full-stack Developer',
    links: [
      { icon: 'github', link: 'https://github.com/creationsbliss' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/musfiq-rahman' }
    ]
  },
  {
    avatar: 'https://avatars.githubusercontent.com/u/309429190?v=4',
    name: 'Arif Hosen',
    title: 'System Engineer',
    links: [
      { icon: 'github', link: 'https://github.com/arif-infra' }
    ]
  },
  {
    avatar: 'https://avatars.githubusercontent.com/u/76263028?s=200&v=4',
    name: 'Claude',
    title: 'Pair Programmer (works nights, weekends, and holidays)',
    links: [
      {
        icon: {
          svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Claude</title><path d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"/></svg>'
        },
        link: 'https://claude.com'
      }
    ]
  },
  {
    avatar: 'https://avatars.githubusercontent.com/u/14957082?s=200&v=4',
    name: 'ChatGPT',
    title: 'Rubber Duck (occasionally hallucinates a better one)',
    links: [
      {
        icon: {
          svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>OpenAI</title><path d="M14.949 6.547a3.94 3.94 0 0 0-.348-3.273 4.11 4.11 0 0 0-4.4-1.934 4.1 4.1 0 0 0-1.778-.14 4.15 4.15 0 0 0-2.118-.086 4.1 4.1 0 0 0-1.891.948 4.04 4.04 0 0 0-1.158 1.753 4.1 4.1 0 0 0-1.563.679 4 4 0 0 0-1.14 1.253 3.99 3.99 0 0 0 .502 4.731 3.94 3.94 0 0 0 .346 3.274 4.11 4.11 0 0 0 4.402 1.933c.382.425.852.764 1.377.995.526.231 1.095.35 1.67.346 1.78.002 3.358-1.132 3.901-2.804a4.1 4.1 0 0 0 1.563-.68 4 4 0 0 0 1.14-1.253 3.99 3.99 0 0 0-.506-4.716m-6.097 8.406a3.05 3.05 0 0 1-1.945-.694l.096-.054 3.23-1.838a.53.53 0 0 0 .265-.455v-4.49l1.366.778q.02.011.025.035v3.722c-.003 1.653-1.361 2.992-3.037 2.996m-6.53-2.75a2.95 2.95 0 0 1-.36-2.01l.095.057L5.29 12.09a.53.53 0 0 0 .527 0l3.949-2.246v1.555a.05.05 0 0 1-.022.041L6.473 13.3c-1.454.826-3.311.335-4.15-1.098m-.85-6.94A3.02 3.02 0 0 1 3.07 3.949v3.785a.51.51 0 0 0 .262.451l3.93 2.237-1.366.779a.05.05 0 0 1-.048 0L2.585 9.342a2.98 2.98 0 0 1-1.113-4.094zm11.216 2.571L8.747 5.576l1.362-.776a.05.05 0 0 1 .048 0l3.265 1.86a3 3 0 0 1 1.173 1.207 2.96 2.96 0 0 1-.27 3.2 3.05 3.05 0 0 1-1.36.997V8.279a.52.52 0 0 0-.276-.445m1.36-2.015-.097-.057-3.226-1.855a.53.53 0 0 0-.53 0L6.249 6.153V4.598a.04.04 0 0 1 .019-.04L9.533 2.7a3.07 3.07 0 0 1 3.257.139c.474.325.843.778 1.066 1.303.223.526.289 1.103.191 1.664zM5.503 8.575 4.139 7.8a.05.05 0 0 1-.026-.037V4.049c0-.57.166-1.127.476-1.607s.752-.864 1.275-1.105a3.08 3.08 0 0 1 3.234.41l-.096.054-3.23 1.838a.53.53 0 0 0-.265.455zm.742-1.577 1.758-1 1.762 1v2l-1.755 1-1.762-1z"/></svg>'
        },
        link: 'https://chatgpt.com'
      }
    ]
  },
  {
    avatar: 'https://avatars.githubusercontent.com/u/161781182?s=200&v=4',
    name: 'Gemini',
    title: 'Second Opinion (very confident, occasionally wrong)',
    links: [
      {
        icon: {
          svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Google Gemini</title><path d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81"/></svg>'
        },
        link: 'https://gemini.google.com'
      }
    ]
  },
  {
    avatar: 'https://avatars.githubusercontent.com/u/208539476?s=200&v=4',
    name: 'opencode',
    title: 'The New Intern (terminal-native, reads the whole repo before breakfast)',
    links: [
      {
        icon: {
          svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>OpenCode</title><path d="M22 24H2V0h20zM17 4.8H7v14.4h10z"/></svg>'
        },
        link: 'https://opencode.ai'
      }
    ]
  }
]
</script>

## Our Team

Say hello to our awesome team — humans who ship it, and the AIs who never sleep, never complain, and only occasionally make things up.

<VPTeamMembers size="small" :members />
