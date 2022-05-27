//
// assets/js/core/Index.js

import Events from "./Events";
import Pan from "./Pan";
import Swipe from "./Swipe";
import Scroller from "./Scroller";

export default class Core {
    constructor() {
        this.events = new Events();
        this.pan = Pan;
        this.swipe = Swipe;

        process.browser && this.mount();
    }

    mount() {
        console.log("%c   👻 Christian MacMillan | Independent Tech Lead ~ Developer @ Freelance at cmacmillanmarin.com   ", "background: black; color: white; padding: 10px 0px");

        this.scroller = new Scroller({
            events: this.events
        });

        // this._raf = this.raf.bind(this);
        // this._key = this.key.bind(this);
        // this._mouse = this.mouse.bind(this);
        // requestAnimationFrame(this._raf);
        // window.addEventListener("keyup", this._key);
        // window.addEventListener("mousemove", this._mouse);
    }

    raf(now) {
        this.events.dispatchEvent(this.events.RAF, {params: {now}});
        this._rafID = requestAnimationFrame(this._raf);
    }

    key(e) {
        this.events.dispatchEvent(this.events.KEY_UP, {params: {e}});
    }

    mouse(e) {
        const {clientX: x, clientY: y} = e;
        const px = (x - (window.innerWidth * 0.5)) / (window.innerWidth * 0.5);
        const py = (y - (window.innerHeight * 0.5)) / (window.innerHeight * 0.5);
        this.events.dispatchEvent(this.events.MOUSE, {params: {x, y, px, py}});
    }

    destroy() {
        cancelAnimationFrame(this._rafID);
        window.removeEventListener("keyup", this._key);
        window.removeEventListener("mousemove", this._mouse);
    }
};
