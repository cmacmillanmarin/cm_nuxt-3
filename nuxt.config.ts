//
// nuxt.config.ts

import glsl from "vite-plugin-glsl";
import { defineNuxtConfig } from "nuxt"

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
    css: [
        '@/assets/css/main.scss'
    ],
    app: {
        head: {
            charset: "utf-8",
            viewport: "width=device-width, initial-scale=1",
            script: [
                { src: "/js/gsap/gsap.min.js", defer: true }
            ]
        }
    },
    vite: {
        plugins:[glsl()]
    }
})
