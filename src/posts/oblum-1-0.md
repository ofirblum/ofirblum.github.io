---
title: Personal website
slug: oblum-1-0
excerpt: Building my personal website using Astro, with Alpine.js and Tailwind CSS integrations.
---
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur quis porttitor mauris. Sed quis nulla malesuada, imperdiet ipsum eleifend, pharetra lacus. Maecenas vehicula tincidunt lorem sed elementum. Vestibulum luctus consectetur risus at aliquet. Donec ac sapien malesuada, congue neque ultrices, fringilla velit. Suspendisse potenti. Maecenas ac elit sem. Suspendisse malesuada ligula eu efficitur vulputate. Mauris tincidunt urna a elit ultricies porttitor. Donec vestibulum nibh euismod lectus rutrum sollicitudin. Aliquam luctus urna volutpat erat malesuada sodales. Etiam dapibus interdum est, sit amet aliquet turpis accumsan non. Sed tincidunt felis ut magna tincidunt, sit amet mollis neque ultricies. Duis mollis, libero sit amet dictum faucibus, mauris sapien volutpat est, sit amet molestie enim eros et lorem.
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