---
title: Personal website
slug: oblum-1-0
excerpt: Building my personal website using Astro, with Alpine.js and Tailwind CSS integrations.
---
# Building my personal website using Astro, Alpine.js and Tailwind CSS

For my personal website, I looked for an opinionated Static Site Generator with out-of-the-box support for Tailwind CSS and Alpine.js.  
The website having minimalistic aesthetics, writing Astro components each containing sprinkled Tailwind classes and Alpine code made sense, as it creates compact and complete components, while keeping a clear and accessible overview of the project.

The complete project is available on [GitHub](https://github.com/ofirblum/personal-website).
All pages are static HTML, and the lone interactive feature is the tabs element on the index page, written with Alpine. Within Astro, Alpine components don't need to be created separately and then hydrated. Rather, one can write Alpine code inside .astro files. For sporadic sprinkling of JS, Alpine with its small size is a neat option with minimal performance hindrance.

```html
---
import { Icon } from 'astro-icon'
---
<div class="flex flex-col w-full px-7 md:px-32 mb-10 sm:mb-0 mt-8 py-6"
  x-data="{ 
    openTab: 1,
    activeClasses: 'underline decoration-dashed underline-offset-8'
    }"
  x-cloak
  class="p-6"
>
  <h2 class="flex justify-start w-full text-2xl tracking-tighter mb-6">Technologies I work with:</h2>
  <!-- Tabs -->
  <nav class="grid lg:grid-cols-4 grid-cols-2 justify-items-center border-solid border-2 border-cyan-500 dark:border-cyan-200">
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
  <div class="py-10">
    <!-- Programming languages -->
    <div x-show="openTab === 1" x-transition:enter.duration.500ms
      class="grid grid-cols-3 justify-items-center w-full"
    >
      <a href="https://www.python.org/" target="_blank"
        class={linkClass}
      >
        <Icon name="carbon:logo-python" class={iconClass}/>
      </a>
    </div>
    <!-- Query languages -->
    <div x-show="openTab === 2" x-transition:enter.duration.500ms
      class="grid grid-cols-4 justify-items-center space-x-10 w-full">
      <a href="https://en.wikipedia.org/wiki/SQL" target="_blank"
        class={linkClass}
      >
        <Icon name="carbon:sql" class={iconClass}/>
      </a>
    </div>
    <!-- Libraries -->
    <div x-show="openTab === 3" x-transition:enter.duration.500ms
      class="grid grid-cols-4 gap-y-6 md:grid-cols-8 justify-items-center w-full"
    >
      <a href="https://pandas.pydata.org/" target="_blank"
        class={linkClass}
      >
        <Icon name="simple-icons:pandas" class={iconClass}/>
      </a>
    </div>
    <div x-show="openTab === 4" x-transition:enter.duration.500ms
      class="grid grid-cols-4 justify-items-center space-x-10 w-full"
    >
      <a href="https://code.visualstudio.com/" target="_blank"
        class={linkClass}
      >
        <Icon name="akar-icons:vscode-fill" class={iconClass}/>
      </a>
    </div>
  </div>
</div>
<style>
  [x-cloak] { display: none !important; }
</style>
```