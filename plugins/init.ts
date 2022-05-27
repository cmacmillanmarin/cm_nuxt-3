//
// @/plugins/client.js

import Core from "@/assets/js/core/Index";

export default defineNuxtPlugin(nuxtApp => {
    return {
        provide: {
            core: new Core()
        }
    }
});