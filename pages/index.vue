<!--
    ~/pages/index.vue
-->

<template>
    <div class="home">
        <div class="grid in-layout py-100">
            <div id="box-3-1" data-scroll='{"in": "fade", "out": "fade"}' class="col-3 ar-4-5 bg-grey wc o-0" />
            <div id="box-3-2" data-scroll='{"in": "fade", "out": "fade"}' class="col-3 ar-4-5 bg-grey wc o-0" />
            <div id="box-3-3" data-scroll='{"in": "fade", "out": "fade"}' class="col-3 ar-4-5 bg-grey wc o-0" />
            <div id="box-3-4" data-scroll='{"in": "fade", "out": "fade"}' class="col-3 ar-4-5 bg-grey wc o-0" />
            <div id="box-4-1" data-scroll='{"in": "fade", "out": "fade"}' class="col-4 ar-4-5 bg-grey wc o-0" />
            <div id="box-4-2" data-scroll='{"in": "fade", "offset": 0.5, "out": "fade"}' class="col-4 ar-4-5 bg-grey wc o-0" />
            <div id="box-4-3" data-scroll='{"in": "fade", "out": "fade"}' class="col-4 ar-4-5 bg-grey wc o-0" />
            <div id="box-6-1" data-scroll='{"in": "fade", "out": "fade"}' class="col-6 ar-4-5 bg-grey wc o-0" />
            <div id="box-6-2" data-scroll='{"in": "fade", "out": "fade"}' class="col-6 ar-4-5 bg-grey wc o-0" />
            <div id="box-3-1" data-scroll='{"in": "fade", "offset": 0.25, "loop": true, "out": "fade"}' class="col-3 ar-4-5 bg-grey wc o-0" />
            <div id="box-6-2" data-scroll='{"in": "fade", "offset": 0.25, "loop": true, "out": "fade"}' class="col-6 ar-4-5 bg-grey wc o-0" />
            <div id="box-3-3" data-scroll='{"in": "fade", "offset": 0.25, "loop": true, "out": "fade"}' class="col-3 ar-4-5 bg-grey wc o-0" />
        </div>
        <Footer data-scroll />
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
