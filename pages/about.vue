<!--
    ~/pages/about.vue
-->

<template>
    <div class="about in-layout py-120">
        <p data-scroll data-transition-in="fade" data-transition-out="fade" class="wc o-0" v-text="`About`" />
    </div>
</template>

<script setup>

    import {onUnmounted} from "vue";

    import { useTransitions } from "@/composables/transitions";

    definePageMeta({
        key: route => route.slug,
        pageTransition: useTransitions()
    });

    onUnmounted(()=>{
        // console.log("Destroy About");
    })

</script>
