export default defineNuxtConfig({
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },
  devServer: {
    port: 3000,
    host: "0.0.0.0",
  },
  modules: [
    "@nuxt/ui",
    [
      "nuxt-module-cli-shortcuts",
      {
        rawMode: true,
      },
    ],
    [
      "unplugin-turbo-console/nuxt",
      {
        specifiedEditor: "cursor",
      },
    ],
    "@nuxt/eslint",
    "@vueuse/nuxt",
    "@pinia/nuxt",
  ],
  eslint: {
    config: {
      standalone: false,
    },
  },
  icon: {
    clientBundle: {
      scan: true,
    },
  },
  compatibilityDate: "2024-09-29",
  nitro: {
    routeRules: {
      "/**": {
        headers: {
          "Cross-Origin-Embedder-Policy": "require-corp",
          "Cross-Origin-Opener-Policy": "same-origin",
        },
      },
    },
  },
  app: {
    head: {
      title:
        "Analyzer3 | Visualize the dependency graph of web3 opensource projects.",
      link: [{ rel: "icon", type: "image/svg+xml", href: "/logo-2.svg" }],
    },
  },
  runtimeConfig: {
    public: {
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
      GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL,
    },
  },
});
