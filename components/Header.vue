<!--
    @/components/Header.vue
-->

<template>
    <header class="c-header p-f t-0 l-0 w-full pt-40 pb-20">
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
            <!-- <div class="col-6">
                {{ props.nav.name }}
            </div> -->
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
    {to: "/strapi", label: "Strapi"},
]);

</script>
