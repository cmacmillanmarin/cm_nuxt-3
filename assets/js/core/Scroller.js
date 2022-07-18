//
// @/assets/js/core/Scroller.js

class Scroller {
    constructor(opt = {}) {
        this.debug = false;

        this.disabled = false;

        this.events = opt.events;

        this.utils = {
            toPx: n => `${n}px`
        };

        this.vars = {
            smooth: false,
            target: 0,
            current: 0,
            previous: 0,
            direction: 1,
            elasticity: .075,
            velocity: .5,
            bounding: 0,
            horizontal: 0,
            horizontalGaps: [],
            transitions: 0,
            height: window.innerHeight,
            width: window.innerWidth,
            size: {w: 0, h: 0},
            mobileTemplate: false
        };

        this.section = null;
        
        this.children = [];

        this._html = document.querySelector("html");
        this._body = document.querySelector("body");

        this._void = "VOID";

        this._raf = this.raf.bind(this);

        this._support = {
            hasWheelEvent: 'onwheel' in document,
            hasMouseWheelEvent: 'onmousewheel' in document,
            isFirefox: navigator.userAgent.indexOf('Firefox') > -1
        };
    }

    init({smooth, section}) {
        this.vars.smooth = !!smooth;
        this.section = section || this._body.querySelector("main");
        if (!this.section) {
            this.warn("section is undefined. Read more: ");
        } else {
            this.vars.smooth && this.setSmooth();
            this.addEvents();
            this.start();
        }
    }

    start() {
        this.log("start");
        this.getChildren();
        this.resetTransitions();
        this.update();
        this.run({animations: false, scroll: true});
    }

    reset() {
        this.log("reset");
        this.scrollTo(0);
        this.vars.transitions++;
        this.vars.direction = 1;
        this.children = [];
    }

    set(vars) {
        this.vars = {...this.vars, ...vars};
        this.vars.smooth && this.destroyNative() && this.setSmooth();
        !this.vars.smooth && this.destroySmooth() && this.setNative();
    }

    setSmooth() {
        this.log("setSmooth");
        this.section.classList.add("o-clip");
        this._body.classList.add("o-clip");
        gsap.set(this.section, {height: this.utils.toPx(this.vars.height)});
    }

    destroySmooth() {
        this.log("destroySmooth");
        this.stopRaf();
        this.section.classList.remove("o-clip");
        this._body.classList.remove("o-clip");
        gsap.set(this.section, {height: "auto"});
        this.scrollTo(0);
        for (const child of this.children) {
            if (child.horizontalScroll && child.horizontalEl) {
                child.horizontalEl.style.transform = null;
                child.xProgress = 0;
            }
            if (!child.scroll) continue;
            child.el.style.transform = null;
        }
        this.vars.horizontal = 0;
        this.vars.horizontalGaps = [];
        return true;
    }

    setNative() {
        this.log("setNative");
    }

    destroyNative() {
        this.scrollTo(0);
        this.log("destroyNative");
        return true;
    }

    getScrollPos() {
        return window.pageYOffset || document.documentElement.scrollTop;
    }

    getScrollProgress() {
        return this.getScrollPos() / this.vars.bounding;
    }

    getScrollPosition() {
        return this.vars.current;
    }

    onScroll() {
        if (this.vars.smooth) return;
        this.vars.current = this.getScrollPos();
        this.run({animations: true});
    }

    onWheel(e) {
        if (!this.vars.smooth || this.disabled) return;
        e.preventDefault();
        const {wheelDelta, wheelDeltaY, deltaY, type} = e;
        const s = type === "wheel" ? 1 : -1;
        const y = (wheelDelta || wheelDeltaY || deltaY) * s * this.vars.velocity;
        this.vars.target = Math.max(Math.min(this.vars.bounding, this.vars.target - y), 0);
        this.startRaf();
    }

    run({animations, scroll}) {
        if (this.vars.current > this.vars.previous) { this.vars.direction = 1; } else { this.vars.direction = -1; }

        const {inGap, from, to, el, id} = this.inHorizontalGap();
        this.vars.horizontal = this.getHorizontalGap();
        if (!inGap) {
            for (const child of this.children) {
                if (animations) {
                    if (child.el === this._void) continue;
                    child.inView = this.childInView(child);
                    child.inOffset = child.inView && child.in ? this.childInOffset(child) : false;
                    if (this.needsTransition(child)) { this.in(child); } else if (this.needsReset(child)) { this.resetTransition(child); }
                }
                if (scroll) {
                    if (!child.scroll) continue;
                    let y = 0;
                    if (child.sticky) y = parseInt(this.stickyPositionOf(child));
                    else if (this.childInScroll(child)) y = parseInt(this.vars.current - this.vars.horizontal);
                    else if (this.vars.current > (child.bounding.top + this.vars.horizontal)) y = child.bounding.top + child.bounding.height + child.scrollOffset;
                    child.el.style.transform = `translate3D(0, -${y}px, 0)`;
                    child.yProgress = Math.min(Math.max(0, (y - (child.bounding.top - this.vars.size.screenH)) / (child.bounding.height + this.vars.size.screenH)), 1);
                    if (child.horizontalScroll) {
                        if (this.vars.current < child.horizontalFrom) {
                            child.xProgress = 0;
                            child.horizontalEl.style.transform = "translate3D(0, 0, 0)";
                        } else {
                            child.xProgress = 1;
                            child.horizontalEl.style.transform = `translate3D(-${child.horizontalTo - child.horizontalFrom}px, 0, 0)`;
                        }
                    }
                }
            }
        } else {
            const child = this.getChildBy(id);
            const x = parseInt(this.vars.current - from);
            for (const child of this.children) {
                if (!child.scroll) continue;   
                child.el.style.transform = `translate3D(0, -${parseInt(from - this.vars.horizontal)}px, 0)`;
            }
            if (child) {
                const bounding = to - from;
                const xProgress = x / bounding;
                child.xProgress = xProgress;
            }
            el.style.transform = `translate3D(-${x}px, 0, 0)`;
        }

        this.dispatch();
        this.vars.previous = this.vars.current;
    }

    stickyPositionOf(child) {
        const {top, bottom, height} = child.stickyBounding;
        if (this.vars.current < top) return this.vars.current;
        if (this.vars.current < bottom - height) return top;
        return top + (this.vars.current - (bottom - height));
    }

    getHorizontalGap() {
        let horizontalGap = 0;
        for (const {from, to} of this.vars.horizontalGaps) {
            if (this.vars.current > to) horizontalGap += (to - from);
        }
        return horizontalGap;
    }

    inHorizontalGap() {
        for (const {from, to, el, id} of this.vars.horizontalGaps) {
            if (this.vars.current >= from && this.vars.current <= to) return {inGap:true, from, to, el, id};
        }
        return {inGap: false};
    }

    raf() {
        this.inRaf = true;
        this.vars.current += (this.vars.target - this.vars.current) * this.vars.elasticity;
        this.run({animations: true, scroll: true});
        this.inTarget() && this.stopRaf();
    }

    startRaf() {
        !this.inRaf && !this.inTarget() && gsap.ticker.add(this._raf);
    }

    stopRaf() {
        gsap.ticker.remove(this._raf);
        this.vars.current = this.vars.target;
        this.inRaf = false;
    }

    inTarget() {
        return Math.abs(this.vars.current - this.vars.target) < .1;
    }

    needsTracking(child) {
        return child.tracking && !child.tracked;
    }

    track(child) {
        // Do Analytics Tracking
        child.tracked = true;
        this.log(`Track Analitics for '${child.id}'`);
    }

    needsTransition(child) {
        return child.in && !child.transitioned && child.inOffset;
    }

    needsReset(child) {
        const scrollPoint = this.vars.current;
        return child.in && child.loop && child.transitioned && child.bounding.top > scrollPoint && !child.inView;
    }

    dispatch() {
        this.log(this.vars.current);
        this.events.dispatchEvent(this.events.SCROLLING, {
            params: {
                pos: this.vars.current,
                dir: this.vars.direction,
                elasticity: this.vars.elasticity,
                size: this.vars.size
            }
        });
    }

    scrollToEl(id) {
        const el = this.section.querySelector(`#${id}`);
        if (!el) return;
        const backup = window.getComputedStyle(el).transform;
        el.style.transform = "none";
        const {top} = el.getBoundingClientRect();
        el.style.transform = backup;
        // const gap = 56 * this.vars.size.screenW / 1440;
        const target = top + (!this.vars.smooth ? this.vars.current : 0);
        this.scrollTo(target, true);
    }

    scrollTo(val, animated, promise) {
        return new Promise(async resolve => {
            if (!this.vars.smooth) {
                if (animated) {
                    await this.utils.loadScript(`${process.env.BASE_URL}/js/gsap/ScrollToPlugin.min.js`, "ScrollToPlugin");
                    gsap.to(window, {duration: 1, scrollTo: val});
                } else {
                    document.documentElement.scrollTop = document.body.scrollTop = val;
                    this.vars.current = val;
                }
            }
            if (this.vars.smooth) {
                this.vars.target = val;
                if (!animated) this.vars.current = this.vars.target;
                this.startRaf();
            }
            if (promise && (Math.abs(this.vars.current - val) > 1)) {
                const it = setInterval(()=>{
                    if (Math.abs(this.vars.current - val) < 1) {
                        resolve();
                        clearInterval(it);
                    }
                }, 100);
            } else resolve();
        });
    }

    childInView(child) {
        const initPos = Math.ceil(child.bounding.top + this.vars.horizontal);
        const lastPos = Math.ceil(initPos + child.bounding.height);
        const windowSize = this.vars.height;
        const scrollPoint = this.vars.current;
        return scrollPoint + windowSize > initPos && scrollPoint < lastPos;
    }

    childInScroll(child) {
        const initPos = Math.ceil(child.bounding.top + this.vars.horizontal);
        const lastPos = Math.ceil(initPos + child.bounding.height);
        const windowSize = this.vars.height;
        const scrollPoint = this.vars.current;
        return scrollPoint + windowSize > (initPos - child.scrollOffset) && scrollPoint < (lastPos + child.scrollOffset);
    }

    childInOffset(child) {
        if (!child.offset) { return child.inView; }
        const {height} = child.bounding;
        const offset = child.offset * height;
        const initPos = Math.ceil(child.bounding.top + this.vars.horizontal + offset);
        const lastPos = Math.ceil(initPos + child.bounding.height);
        const windowSize = this.vars.height;
        const scrollPoint = this.vars.current;
        return scrollPoint + windowSize > initPos && scrollPoint < lastPos;
    }

    transitionIn() {
        return new Promise((resolve)=>{
            const children = [];
            for (const child of this.children) {
                if (this.needsTransition(child)) { children.push(child); }
            }
            if (!children.length) {
                resolve();
            } else {
                children.sort((a, b)=>{ return a.duration - b.duration; });
                for (const i in children) {
                    const last = parseInt(i) === children.length - 1;
                    last ? this.in(children[i], resolve) : this.in(children[i]);
                }
            }
        });
    }

    transitionOut() {
        return new Promise((resolve)=>{
            const children = [];
            for (const child of this.children) {
                if (child.out && child.transitioned && child.inView) { children.push(child); }
            }
            if (!children.length) {
                gsap.to(this.section.querySelector(".page > div"), {opacity: 0, duration: .2, ease: "power1.out", onComplete: resolve})
            } else {
                children.sort((a, b)=>{ return a.duration - b.duration; });
                for (const i in children) {
                    const last = parseInt(i) === children.length - 1;
                    last ? this.out(children[i], resolve) : this.out(children[i]);
                }
            }
        });
    }

    customOut() {
        return new Promise((resolve)=>{
            const children = [];
            for (const child of this.children) {
                if (child.customOut && child.transitioned) { children.push(child); }
            }
            if (!children.length) {
                resolve();
            } else {
                children.sort((a, b)=>{ return a.duration - b.duration; });
                for (const i in children) {
                    const last = parseInt(i) === children.length - 1;
                    last ? this.out(children[i], resolve, true) : this.out(children[i], ()=>{}, true);
                }
            }
        });
    }

    in(child, resolve = ()=>{}) {
        if (!child.auto || child.transitioned) return;
        child.transitioned = true;
        gsap.killTweensOf(child.el);
        const transitions = this.vars.transitions;
        const easeIn = "power1.in";
        const easeOut = "power1.out";
        const delay = parseFloat(child.el.dataset.transitionDelay || 0);
        const duration = (this.isDefined(child.durationIn) ? child.durationIn : child.duration) || .4;
        const msg = `${child.in} for '${child.el.id}' in ${duration}s`;
        this.log(`Transition in ${msg}`);
        const onComplete = ()=>{
            this.log(`Transition in ${msg} DONE!`);
            if (this.needsTracking(child)) { this.track(child); }
            if (transitions === this.vars.transitions) resolve();
        };
        switch (child.in) {
        case "fade":
            gsap.to(child.el, {opacity: 1, duration: .4, delay, ease: easeIn, onComplete});
            break;
        default:
            this.log(`UNDEFINED IN TRANSITION FOR '${child.el.id}'`);
            break;
        }
    }

    out(child, resolve = ()=>{}, custom = false) {
        gsap.killTweensOf(child.el);
        const out = custom ? child.customOut : child.out;
        const ease = "power1.out";
        const duration = (custom && !child.inView) ? 0 : (this.isDefined(child.durationOut) ? child.durationOut : child.duration) || .2;
        const msg = `${out} for '${child.el.id}' in ${duration}s`;
        this.log(`Transition out ${msg}`);
        const onComplete = ()=>{
            this.log(`Transition out ${msg} DONE!`);
            resolve();
        };
        switch (out) {
        case "fade":
            gsap.to(child.el, {opacity: 0, duration, ease, onComplete});
            break;
        default:
            this.log(`UNDEFINED OUT TRANSITION FOR '${child.el.id}'`);
            break;
        }
    }

    resetTransition(child) {
        if (!child.in) return;
        gsap.killTweensOf(child.el);
        child.transitioned = false;
        this.log(`Transition reset ${child.el.id}`);
        switch (child.in) {
        case "fade":
            gsap.set(child.el, {opacity: 0});
            break;
        default:
            break;
        }
    }

    getChildBy(id) {
        return this.children.find(child=>child.id===id);
    }

    isDefined(n) {
        return n !== undefined && !isNaN(n);
    }

    getChildren() {
        const children = this.section.querySelectorAll("[data-scroll]");
        this.vars.horizontalGaps = [];
        for (const child of children) {
            const data = child.dataset.scroll !== "" ? JSON.parse(child.dataset.scroll) : {};
            const {
                tracking,
                transitionAuto,
                transitionCustomOut,
                scrollSticky,
                scrollStickyParent,
                scrollStickyContent,
                scrollOffset,
                scrollHorizontal,
                transitionForceUpdate
            } = child.dataset;
            const _scroll = true;
            const _sticky = scrollSticky === "";
            const _stickyParent = this.section.querySelector(`#${scrollStickyParent}`);
            const _stickyContent = this.section.querySelector(`#${scrollStickyContent}`);
            const _horizontalScroll = scrollHorizontal === "";
            const auto = transitionAuto === undefined || transitionAuto === "true";
            this.children.push({
                ...data,
                id: child.id,
                el: child,
                scroll: _scroll,
                sticky: _sticky,
                stickyParent: _stickyParent,
                stickyContent: _stickyContent,
                stickyBounding: {top: 0, bottom: 0, height: 0},
                scrollOffset: parseFloat(scrollOffset) || 50,
                horizontalScroll: _horizontalScroll,
                horizontalEl: null,
                horizontalFrom: 0,
                horizontalTo: 0,
                xProgress: 0,
                yProgress: 0,
                bounding: {top: 0, height: 0},
                inView: false,
                inOffset: false,
                forceUpdate: transitionForceUpdate,
                auto,
                customOut: transitionCustomOut,
                transitioned: false,
                tracking,
                tracked: false,
                backup: ""
            });
            if (this.vars.smooth && child.horizontalScroll) this.addHorizontalGap(child, bounding, this.children[this.children.length - 1]);
        }
        console.log("getChildren", this.children);
    }

    resetTransitions() {
        for (const child of this.children) this.resetTransition(child);
    }

    setTransitioned(id) {
        const child = this.children.find(child=>child.id === id);
        child.auto = true;
        child.transitioned = true;
    }

    async update() {
        this.log("Update", this.children);
        this.updateSize();
        this.vars.horizontalGaps = [];
        this.vars.smooth && this.cleanTransforms();
        for (const child of this.children) {
            if (child.el === this._void) continue;
            const {top: _top, height} = child.el.getBoundingClientRect();
            let top = _top;
            if (!this.vars.smooth) top += this.vars.current; 
            const bounding = {top: Math.ceil(top), height: Math.ceil(height)};
            child.bounding = bounding;
            child.inView = height !== 0 && this.childInView(child);
            child.inOffset = child.inView && child.in ? this.childInOffset(child) : false;
            if (child.sticky) {
                const {top, bottom} = child.stickyParent.getBoundingClientRect();
                const {height} = child.stickyContent.getBoundingClientRect();
                child.stickyBounding = {top, bottom, height};
            }
            if (child.loop && child.transitioned && !child.inView) { this.resetTransition(child); }
            if (child.forceUpdate) { child.transitioned = false; }
            if (this.vars.smooth && child.horizontalScroll) this.addHorizontalGap(child.el, child.bounding, child);
            this.log(child.el.id || child.el?.classList[0], bounding.top);
        }
        this.vars.smooth && this.applyTransforms();
    }

    cleanTransforms() {
        for (const i in this.children) {
            const child = this.children[i];
            if (child.scroll) {
                child.backup = window.getComputedStyle(child.el).transform;
                child.el.style.transform = "none";
            };
        }
    }

    applyTransforms() {
        for (const i in this.children) {
            const child = this.children[i];
            if (child.scroll) child.el.style.transform = child.backup;
        }
    }

    addHorizontalGap(parent, bounding, object) {
        const el = parent.querySelector(".h-scroll");
        el.classList.add("wc-t");
        const {width} = el.getBoundingClientRect();
        let prevGap = 0;
        for (const {from, to} of this.vars.horizontalGaps) prevGap += (to - from);
        const from = prevGap + bounding.top + (bounding.height * .5) - (this.vars.height * .5);
        const to = from + width - this.vars.width;
        object.horizontalFrom = from;
        object.horizontalTo = to;
        object.horizontalEl = el;
        this.vars.horizontalGaps.push({id: parent.id, el, from, to});
    }

    enableScroll() {
        this.disabled = false;
    }

    disableScroll() {
        this.disabled = true;
    }

    updateSize() {
        const sh = this.section.firstChild;
        this.vars.height = window.innerHeight;
        this.vars.width = window.innerWidth;
        const bounding = sh?.getBoundingClientRect() || {height: 0, width: 0};
        this.vars.bounding = bounding.height - this.vars.height;
        this.vars.size = {
            w: Math.floor(bounding.width),
            h: Math.floor(bounding.height),
            screenW: this.vars.width,
            screenH: this.vars.height
        };
        this.log("updateSize", this.vars.size);
    }

    onResize() {
        if (!this.section) return;
        if (this.vars.smooth) {
            this.scrollTo(0);
            for (const child of this.children) {
                if (child.horizontalScroll && child.horizontalEl) {
                    child.horizontalEl.style.transform = null;
                    child.xProgress = 0;
                }
                if (!child.scroll) continue;
                child.el.style.transform = null;
            }
        } else if (window.innerWidth !== this.vars.width) this.scrollTo(0);
        this.updateSize();
        this.vars.mobileTemplate = this.vars.size.screenW <= 768;
        this.vars.current = this.getScrollPos();
        this.update({transition: false, scroll: false});
        this.dispatch();
    }

    addEvents() {
        this._onWheel = this.onWheel.bind(this);
        this._onScroll = this.onScroll.bind(this);
        this._onResize = this.onResize.bind(this);
        window.addEventListener("scroll", this._onScroll, {passive: true});
        window.addEventListener("resize", this._onResize, {passive: true});
        this._support.hasWheelEvent && window.addEventListener("wheel", this._onWheel, {passive: false});
        this._support.hasMouseWheelEvent && window.addEventListener("mousewheel", this._onWheel, {passive: false});
    }

    removeEvents() {
        window.removeEventListener("wheel", this._onWheel);
        window.removeEventListener("mousewheel", this._onWheel);
        window.removeEventListener("scroll", this._onScroll);
        window.removeEventListener("resize", this._onResize);
        this.stopRaf();
    }

    destroy() {
        this.scrollTo(0);
        this.removeEvents();
    }

    log(msg, data) {
        this.debug && data && console.log(`Scroller :: ${msg} ~ `, data);
        this.debug && !data && console.log(`Scroller :: ${msg}`);
    }

    warn(msg) {
        console.warn(`Scroller :: ${msg}`);
    }
}

export default Scroller;
