//
// @/composables/transitions.js

export function useTransitions() {
    return {
        css: false,
        mode: "out-in",
        async onEnter(el, done) {
            const {$core} = useNuxtApp();
            $core.scroller.start();
            await $core.scroller.transitionIn();
            done();
        },
        async onLeave(el, done) {
            const {$core} = useNuxtApp();
            await $core.scroller.transitionOut();
            done();
        },
        onAfterLeave() {
            const {$core} = useNuxtApp();
            $core.scroller.reset();
        }
    };
};