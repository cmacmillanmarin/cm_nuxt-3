<!--
    @/components/Header.vue
-->

<template>
    <header class="c-header">
        <div class="grid in-layout">
            <div class="col-6">
                <nav>
                    <ul>
                        <li v-for="({to, label}, i) in links" :key="i">
                            <NuxtLink :to="to">{{ label }}</NuxtLink>
                        </li>
                    </ul>
                </nav>
            </div>
            <div class="col-6">
                {{ props.nav.name }}
            </div>
        </div>
    </header>
</template>

<script setup>

import {ref, watch} from "vue";

const props = defineProps(["nav"]);

// console.log(props.nav.name);

// watch(props, ()=>{
//     console.log(props);
// })

const links = ref([
    {to: "/", label: "Home"},
    {to: "/about", label: "About"},
]);

</script>

<style lang="scss" scoped>
    header {
        padding-top: 40px;
        padding-bottom: 20px;
    }
</style>