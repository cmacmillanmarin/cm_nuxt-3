//
// Created by Christian MacMillan on 04/04/2022
// Independent Tech Lead ~ Developer @ cmacmillanmarin.com
// Reserved use plasticbcn.com

import FS from "./glsl/fs.glsl";
import VS from "./glsl/vs.glsl";

class WebGL {
    constructor() {

        this.debug = true;

        this.vs = {
            w: document.body.clientWidth,
            h: window.innerHeight
        };

        this.z = 500;

        this.planes = [];
        this.maxPlanes = 6;

        this.altitude = 50;
        this.amplitude = .25;
        this.cX = 1.8;
        this.cY = 0.2;
        this.scale = .94;
        this.wSpeed = 1.8;
        this.sSpeed = 1.2;

        this.datasetId = "[data-webgl-canvas]";
        this.datasetFixedId = "[data-webgl-canvas-fixed]";
        this.datasetFrameId = "[data-webgl-canvas-frame]";
        this.datasetWidth = "[dataset-width]";
        this.datasetHeight = "[dataset-height]";

        this.loading = false;
        this.transition = false;
        this.running = false;
        this.rendering = false;
        this.wireframes = false;
        this.cameraUpdate = true;

        this.transitionDuration = {in: 0, out: 0};

        this.catche = {};

        this.bind();
    }

    async create() {
        if (this.loading) return;
        if (!window.THREE) await this.loadThree();

        this.log("create()");

        if (window.Tweakpane) this.createControls();

        this.canvas = document.createElement("canvas");
        this.canvas.classList.add("webgl-canvas");
        document.body.appendChild(this.canvas);

        this.scene = new THREE.Scene();

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: false,
            premultipliedAlpha: false
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.vs.w, this.vs.h);

        this.camera = new THREE.PerspectiveCamera(
            40,
            this.vs.w / this.vs.h,
            this.z - 100,
            this.z + 100
        );
        this.camera.position.z = this.z;

        this.index = 0;
        this.planes = [];
        const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
        for (let i = 0; i < this.maxPlanes; i++) {
            const plane = new THREE.Mesh(
                geometry,
                new THREE.ShaderMaterial({
                    vertexShader: VS,
                    fragmentShader: FS,
                    uniforms: {
                        uId: { type: "i", value: i },
                        uVid: { type: "f", value: 0.0 },
                        uWave: { type: "f", value: 0.0 },
                        uZoom: { type: "f", value: 1.0 },
                        uProgress: { type: "f", value: 0.0 },
                        uMask: {type: "f", value: 0.0},
                        uSize: { type: "v2", value: new THREE.Vector2(0.0, 0.0) },
                        uTexture: { type: "t", value: new THREE.Texture() },
                        uTextureSize: { type: "v2", value: new THREE.Vector2(0.0, 0.0) },
                        uTextureVideo: { type: "t", value: null },
                        cAmplitude: {type: "f", value: this.amplitude},
                        cAltitude: {type: "f", value: this.altitude},
                        cX: {type: "f", value: this.cX},
                        cY: {type: "f", value: this.cY},
                        cWireframes: {type: "f", value: this.wireframes ? 1.0 : 0.0}
                    },
                    wireframe: this.wireframes,
                    transparent: true,
                    side: THREE.FrontSide
                })
            );
            const video = {
                active: false,
                loading: false,
                src: "",
                frames: 1,
                frame: 1,
                imgs: [],
                w: 0,
                h: 0,
                texture: null
            };
            plane.scale.set(0, 0);
            plane.visible = false;
            this.planes.push({dom: null, inTransition: false, video, plane, busy: false});
            this.scene.add(plane);
        }

        this.clock = new THREE.Clock();

        this.updateSize();
    }

    createControls() {

        this.log("createControls()");

        const pane = new Tweakpane.Pane();

        const folder = pane.addFolder({
            title: 'Wave Params',
            expanded: true,
          });

        const PARAMS = {
            altitude: this.altitude,
            amplitude: this.amplitude,
            cX: this.cX,
            cY: this.cY,
            scale: this.scale,
            wSpeed: this.wSpeed,
            sSpeed: this.sSpeed,
            theme: "dark",
            title: "Wave Params"
        };

        const altitude = folder.addInput(PARAMS, "altitude", {min: 0, max: 200, step: 1});
        altitude.on("change", ev => {
            this.log("update altitude", ev.value);
            this.altitude = ev.value;
        });

        const amplitude = folder.addInput(PARAMS, "amplitude", {min: 0, max: 1, step: .05});
        amplitude.on("change", ev => {
            this.log("update amplitude", ev.value);
            this.amplitude = ev.value;
        });

        const cX = folder.addInput(PARAMS, "cX", {min: 0, max: 2, step: .001});
        cX.on("change", ev => {
            this.log("update cX", ev.value);
            for (const {plane} of this.planes) plane.material.uniforms.cX.value = ev.value;
        });

        const cY = folder.addInput(PARAMS, "cY", {min: 0, max: 2, step: .001});
        cY.on("change", ev => {
            this.log("update cY", ev.value);
            for (const {plane} of this.planes) plane.material.uniforms.cY.value = ev.value;
        });

        const scale = folder.addInput(PARAMS, "scale", {min: 0.5, max: 1, step: .005});
        scale.on("change", ev => {
            this.log("update scale", ev.value);
            this.scale = ev.value;
        });

        const wSpeed = folder.addInput(PARAMS, "wSpeed", {min: 0, max: 5, step: .05});
        wSpeed.on("change", ev => {
            this.log("update wSpeed", ev.value);
            this.wSpeed = ev.value;
        });

        const sSpeed = folder.addInput(PARAMS, "sSpeed", {min: 0, max: 5, step: .05});
        sSpeed.on("change", ev => {
            this.log("update sSpeed", ev.value);
            this.sSpeed = ev.value;
        });
    }

    async update() {
        if (!document.querySelectorAll(this.datasetId).length || this.running || this.loading) return;
        if (!this.canvas) await this.create();

        this.log("update()");

        this.updateCamera();
        this.addListeners();
        this.play();

        this.running = true;
    }

    clean() {
        if (!this.running) return;

        this.log("clean()");

        this.hide();
        this.stop();

        this.running = false;
    }

    async updatePlane({target, set}) {
        if (this.transition) return;

        const img = target.querySelector("img");
        const vid = target.querySelector("video");
        const dom = vid || img;
        const frame = target.querySelector(this.datasetFrameId) || target;
        const el = this.getPlane(dom);
        const {plane, video} = el;

        if (vid) {
            if (vid.readyState !== 4) return;
            video.texture = new THREE.VideoTexture(vid);
            video.w = vid.videoWidth;
            video.h = vid.videoHeight;
            plane.material.uniforms.uVid.value = 1.0;
            plane.material.uniforms.uTextureVideo.value = video.texture;
            plane.material.uniforms.uTextureVideo.value.needsUpdate = true;
        } else {
            if (!img.complete || img.naturalWidth === 0) return;
            plane.material.uniforms.uVid.value = 0.0;
            plane.material.uniforms.uTexture.value.image = img;
            plane.material.uniforms.uTexture.value.needsUpdate = true;
        }

        const scroll = this.getScroll();
        const {width, height, top, left} = frame.getBoundingClientRect();
        const {x, y} = this.fromDomToCanvas({x: left, y: top + scroll, w: width, h: height});

        plane.visible = true;
        plane.scale.x = width;
        plane.scale.y = height;
        plane.material.uniforms.uMask.value = 0.0;

        // dom.style.opacity = 0;

        plane.position.x = x;
        plane.position.y = y;

        plane.material.uniforms.uSize.value.x = width;
        plane.material.uniforms.uSize.value.y = height;

        const forcedWidth = frame.dataset.width;
        const forcedHeight = frame.dataset.height;

        plane.material.uniforms.uTextureSize.value.x = vid ? video.w : forcedWidth || img.width;
        plane.material.uniforms.uTextureSize.value.y = vid ? video.h : forcedHeight || img.height;

        if (!set) {
            // const ease = "power2.inOut";
            const ease = CustomEase.create("custom", "M0,0 C0.53,0.24 0.08,0.99 1,1");
            const easeIn = "power2.in";
            const easeOut = "power2.out";

            // const normalized = 1;
            const pnormalized = Math.max(1, (640 + 560) / (width + height));
            const mnormalized = Math.min(1, (width + height) / (640 + 560));

            const wSpeed = this.wSpeed * mnormalized;
            const sSpeed = this.sSpeed * mnormalized;

            plane.material.uniforms.cAltitude.value = this.altitude * pnormalized;
            plane.material.uniforms.cAmplitude.value = this.amplitude * pnormalized;

            gsap.killTweensOf(plane.material.uniforms.uZoom);
            gsap.killTweensOf(plane.material.uniforms.uProgress);
            gsap.killTweensOf(plane.material.uniforms.uWave);
            gsap.to(plane.material.uniforms.uZoom, {value: this.scale, duration: sSpeed, ease});
            gsap.to(plane.material.uniforms.uZoom, {value: 1 - ((1 - this.scale) * .5), delay: sSpeed * .65, duration: sSpeed, ease: easeOut});
            gsap.fromTo(plane.material.uniforms.uWave, {value: 0}, {value: 1, duration: wSpeed, ease});
            gsap.to(plane.material.uniforms.uProgress, {value: 1, duration: wSpeed, ease});
        } else {
            el.busy = true;
        };        

        this.log("updatePlane()", {id: plane.material.uniforms.uId.value});
    }

    transitionPlane({target}) {
        const img = target.querySelector("img");
        const vid = target.querySelector("video");
        const dom = vid || img || target;
        const el = this.getPlane(dom);
        el.inTransition = true;
        dom.style.opacity = 0;
        this.log("transitionPlane()", {id: el.plane.material.uniforms.uId.value});
        // const scroll = this.getScroll();
        // const offset = (72/2184)*this.vs.w;
        // const {y} = this.fromDomToCanvas({x: el.plane.position.x, y: scroll + offset, w: el.plane.scale.x, h: el.plane.scale.y});
        //gsap.to(el.plane.position, {y, duration: this.transitionDuration.out, ease: "power2.inOut"});
    }

    endTransition() {
        const el = this.getInTransitionPlane();
        if (!el) return;
        this.log("endTransition()", {id: el.plane.material.uniforms.uId.value});
        // const offset = (72/2184)*this.vs.w;
        // const {y} = this.fromDomToCanvas({x: el.plane.position.x, y: offset, w: el.plane.scale.x, h: el.plane.scale.y}); // Check y value is equal to transitionPlane y scroll offset
        // el.plane.position.y = y;
        gsap.to(
            el.plane.material.uniforms.uMask,
            {
                value: 1,
                duration: this.transitionDuration.in,
                ease: CustomEase.create("custom", "M0,0 C0.53,0.24 0.08,0.99 1,1"),
                onComplete: ()=>{
                    el.inTransition = false;
                    el.dom = null;
                    el.plane.scale.set(0, 0);
                    el.plane.visible = false;
                }
            }
        );
    }

    cleanPlane({target}) {
        const img = target.querySelector("img");
        const vid = target.querySelector("video");
        const el = this.getPlane(vid || img);
        if (el.inTransition) return;
        this.log("cleanPlane()", {id: el.plane.material.uniforms.uId.value, inTransition: el.inTransition});
        gsap.killTweensOf(el.plane.material.uniforms.uZoom);
        gsap.killTweensOf(el.plane.material.uniforms.uProgress);
        gsap.to(el.plane.material.uniforms.uProgress, {value: 0, duration: .5, ease: "power1.out"});
        gsap.to(el.plane.material.uniforms.uZoom, {value: 1, duration: .5, ease: "power1.out", onComplete: ()=>{
            el.dom = null;
            el.plane.scale.set(0, 0);
            el.plane.visible = false;
        }});
    }

    getPlane(_dom) {
        for (const el of this.planes) {
            if (el.dom === _dom) {
                return el;
            }
        }
        let el = this.planes[this.index];
        if (el.busy) {
            while (el.busy) {
                this.index = (this.index + 1) > (this.planes.length - 1) ? 0 : this.index + 1;
                el = this.planes[this.index];
            }
        }
        el.dom = _dom;
        this.index = (this.index + 1) > (this.planes.length - 1) ? 0 : this.index + 1;
        return el;
    }

    getInTransitionPlane() {
        for (const el of this.planes || []) {
            if (el.inTransition) return el;
        }
        return null;
    }

    getScroll() {
        return 0;
    }

    fromDomToCanvas({x, y, w, h}) {
        const _x = x - this.vs.w * 0.5 + (w * 0.5);
        const _y = - y + this.vs.h * 0.5 - (h * 0.5);
        return {x: _x, y: _y};
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    hide() {
        for (const el of this.planes) {
            if (el.inTransition) continue;
            this.log("hide()", {id: el.plane.material.uniforms.uId.value, inTransition: el.inTransition});
            el.dom = null;
            el.plane.scale.set(0, 0);
            el.plane.visible = false;
        }
    }

    play() {
        if (this.rendering) return;
        this.log("play()");
        gsap.ticker.add(this._render);
        this.rendering = true;
    }

    stop() {
        if (!this.rendering) return;
        for(const {inTransition} of this.planes)
            if (inTransition) return;
        this.log("stop()");
        gsap.ticker.remove(this._render);
        this.render();
        this.rendering = false;
    }

    inTransition(value) {
        this.transition = value;
    }

    setTransitionDuration(duration) {
        this.transitionDuration.in = duration.in;
        this.transitionDuration.out = duration.out;
    }

    updateSize() {
        this.vs = {
            w: document.body.clientWidth,
            h: window.innerHeight
        };

        this.camera.aspect = this.vs.w / this.vs.h;
        this.camera.fov = 2 * Math.atan(this.vs.h / (2 * (this.z))) * (180 / Math.PI);
        this.camera.updateProjectionMatrix();

        // console.log(this.camera.aspect, this.camera.fov);

        this.renderer.setSize(this.vs.w, this.vs.h);

        this.log(`updateSize() w: ${this.vs.w}, h: ${this.vs.h}`);
    }

    setCameraUpdate(value, n) {
        this.cameraUpdate = value;
        if (n) this.camera.position.y = n;
    }

    updateCamera() {
        if (this.camera && this.cameraUpdate) this.camera.position.y = - this.getScroll();
    }

    onResize() {
        this.hide();
        this.updateSize();
    }

    addListeners() {
        document.querySelectorAll(this.datasetFixedId).forEach(dom => {
            this.updatePlane({target: dom, set: true});
            dom.addEventListener("mouseenter", this._updatePlane);
            dom.addEventListener("click", this._transitionPlane);
        });
        document.querySelectorAll(this.datasetId).forEach(dom => {
            dom.addEventListener("mouseenter", this._updatePlane);
            dom.addEventListener("click", this._transitionPlane);
            dom.addEventListener("mouseleave", this._cleanPlane);
        });
        window.addEventListener("resize", this._onResize, false);
    }

    removeListeners() {
        document.querySelectorAll(this.datasetId).forEach(dom => {
            dom.removeEventListener("mouseenter", this._updatePlane);
            dom.removeEventListener("click", this._transitionPlane);
            dom.removeEventListener("mouseleave", this._cleanPlane);
        });
        window.removeEventListener("resize", this._onResize);
    }

    async loadThree() {
        this.loading = true;
        await this.loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js");
        const params = new Proxy(new URLSearchParams(window.location.search), {
            get: (searchParams, prop) => searchParams.get(prop),
        });
        const {controls, wireframes} = params;
        this.wireframes = wireframes === "true";
        controls === "true" && await this.loadScript("https://cdn.jsdelivr.net/npm/tweakpane@3.0.8/dist/tweakpane.min.js");
        this.loading = false;
    }

    loadScript(src) {
        return new Promise(resolve=>{
            this.log("loadScript: ", src);
            const script = document.createElement("script");
            script.src = src;
            script.onload = ()=>{
                resolve();
            };
            document.head.appendChild(script);
        })
    }

    bind() {
        this._play = this.play.bind(this);
        this._stop = this.stop.bind(this);
        this._render = this.render.bind(this);
        this._onResize = this.onResize.bind(this);
        this._cleanPlane = this.cleanPlane.bind(this);
        this._updatePlane = this.updatePlane.bind(this);
        this._transitionPlane = this.transitionPlane.bind(this);
    }

    log(msg, data) {
        if (!this.debug) return;
        if (data) console.log(`=== WebGL ${msg}`, data);
        else console.log(`=== WebGL ${msg}`);
    }

    destroy() {

        gsap.ticker.remove(this._render);

        this.log("destroy()");

        this.stop();
        this.removeListeners();
        this.canvas.remove();
        this.canvas = null;
        this.scene = null;
        this.renderer = null;
        this.camera = null;
        this.planes = [];
    }
};

export default WebGL;
