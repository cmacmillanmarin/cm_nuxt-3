<!--
    ~/pages/strapi.vue
-->

<template>
    <div class="strapi in-layout py-100">
        <div data-scroll='{"in": "fade", "out": "fade"}' class="wc o-0">
            <h1 class="mb-16" v-text="`Strapi`" />
            <p v-text="`baseUrl: ${$config.STRAPI_URL}`" />
        </div>
    </div>
</template>

<script setup>

    import {ref, onUnmounted} from "vue";

    import { useTransitions } from "@/composables/transitions";

    // const baseUrl = ref(process.env.STRAPI_URL);

    definePageMeta({
        key: route => route.slug,
        pageTransition: useTransitions()
    });

    onUnmounted(()=>{
        // console.log("Destroy About");
    })

</script>
