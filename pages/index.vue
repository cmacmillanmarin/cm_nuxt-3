<!--
    ~/pages/index.vue
-->

<template>
    <div class="home">
        <div class="grid in-layout py-120">
            <div id="box-3-1" data-scroll data-transition-in="fade" data-transition-out="fade"  class="col-3 ar-4-5 bg-grey wc o-0" />
            <div id="box-3-2" data-scroll data-transition-in="fade" data-transition-out="fade" class="col-3 ar-4-5 bg-grey wc o-0" />
            <div id="box-3-3" data-scroll data-transition-in="fade" data-transition-out="fade" class="col-3 ar-4-5 bg-grey wc o-0" />
            <div id="box-3-4" data-scroll data-transition-in="fade" data-transition-out="fade" class="col-3 ar-4-5 bg-grey wc o-0" />
            <div id="box-4-1" data-scroll data-transition-in="fade" data-transition-out="fade" class="col-4 ar-4-5 bg-grey wc o-0" />
            <div id="box-4-2" data-scroll data-transition-in="fade" data-transition-out="fade" class="col-4 ar-4-5 bg-grey wc o-0" />
            <div id="box-4-3" data-scroll data-transition-in="fade" data-transition-out="fade" class="col-4 ar-4-5 bg-grey wc o-0" />
            <div id="box-6-1" data-scroll data-transition-in="fade" data-transition-out="fade" class="col-6 ar-4-5 bg-grey wc o-0" />
            <div id="box-6-2" data-scroll data-transition-in="fade" data-transition-out="fade" class="col-6 ar-4-5 bg-grey wc o-0" />
            <div id="box-3-1" data-scroll data-transition-in="fade" data-transition-out="fade" class="col-3 ar-4-5 bg-grey wc o-0" />
            <div id="box-6-2" data-scroll data-transition-in="fade" data-transition-out="fade" class="col-6 ar-4-5 bg-grey wc o-0" />
            <div id="box-3-3" data-scroll data-transition-in="fade" data-transition-out="fade" class="col-3 ar-4-5 bg-grey wc o-0" />
        </div>
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
        // console.log("Destroy Home");
    })

</script>
