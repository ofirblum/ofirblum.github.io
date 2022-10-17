---
title: Personal website
slug: oblum-1-0
excerpt: Building my personal website using Astro, with Alpine.js and Tailwind CSS integrations.
---
For my personal website.
<br/><br/>

```html
<div class="flex flex-col w-full px-7 md:px-32 mb-10 sm:mb-0 mt-8 py-6"
  x-data="{ 
    openTab: 1,
    activeClasses: 'underline decoration-dashed underline-offset-8'
    }"
  x-cloak
  class="p-6"
>
  <!-- Tabs -->
  <nav class="flex justify-evenly justify-items-center border-solid border-2 border-cyan-500 dark:border-cyan-200">
    <button @click.prevent="openTab = 1"
        @keyup.right="openTab = 2; $nextTick(() => $refs.secondTab.focus())"
        @keyup.left="openTab = 4; $nextTick(() => $refs.fourthTab.focus())"
        x-ref="firstTab"
        :class="openTab === 1 ? activeClasses : ''"
        class={buttonClass}
    >
        Programming
    </button>
    <button @click.prevent="openTab = 2"
        @keyup.right="openTab = 3; $nextTick(() => $refs.thirdTab.focus())"
        @keyup.left="openTab = 1; $nextTick(() => $refs.firstTab.focus())"
        x-ref="secondTab"
        :class="openTab === 2 ? activeClasses : ''"
        class={buttonClass}
    >
        Querying
    </button>
    <button @click.prevent="openTab = 3"
        @keyup.right="openTab = 4; $nextTick(() => $refs.fourthTab.focus())"
        @keyup.left="openTab = 2; $nextTick(() => $refs.secondTab.focus())"
        x-ref="thirdTab"
        :class="openTab === 3 ? activeClasses : ''"
        class={buttonClass}
    >
        Libraries
    </button>
    <button @click.prevent="openTab = 4"
        @keyup.right="openTab = 1; $nextTick(() => $refs.firstTab.focus())"
        @keyup.left="openTab = 3; $nextTick(() => $refs.thirdTab.focus())"
        x-ref="fourthTab"
        :class="openTab === 4 ? activeClasses : ''"
        class={buttonClass}
    >
        Tools
    </button>
  </nav>