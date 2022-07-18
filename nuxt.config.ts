//
// nuxt.config.ts

require("dotenv").config({
    path: `./config/env/.env.${process.env.ENV}`
});

import glsl from "vite-plugin-glsl";
import { defineNuxtConfig } from "nuxt"

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
    publicRuntimeConfig: {
        STRAPI_URL: process.env.STRAPI_URL
    },
    privateRuntimeConfig: {},
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
