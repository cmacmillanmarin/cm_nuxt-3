<!--
    @/app.vue
-->

<template>
    <Header :nav="nav" class="p-f z-9 t-0 l-0 w-100" />
    <main>
        <NuxtPage />
    </main>
</template>

<script setup>

    import {reactive, watch, onMounted} from "vue";

    const { $core } = useNuxtApp();
    const route = useRoute();
    const nav = reactive(route);

    watch(nav, ()=>{
        // console.log(nav.name);
        // Do stuff here
    });

    onMounted(async ()=> {
        $core.mount();
        $core.scroller.init({smooth: true});
        await $core.scroller.transitionIn();
    });

</script>
