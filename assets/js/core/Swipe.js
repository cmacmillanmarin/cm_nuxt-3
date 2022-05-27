//
// Swipe.js

export default class Swipe {
    constructor(opts) {
        this.id = opts.id || "swipe";
        this.xDown = null;
        this.yDown = null;
        this.xUp = null;
        this.yUp = null;
        this.target = opts.target || document;
        this.prevent = opts.prevent;
        this.resistance = opts.resistance || 0;
        this.timeout = opts.timeout || 180;
        this.forceTriggerCallback = opts.forceTriggerCallback || false;
        this.callback = opts.callback || function(swipe) {
            console.log(swipe);
        };
        this.onTouchStartHandler = this.handleTouchStart.bind(this);
        this.onTouchMovementHandler = this.handleTouchMove.bind(this);
        this.onTouchEndHandler = this.handleTouchEnd.bind(this);
        this.onTouchCancelHandler = this.handleTouchCancel.bind(this);

        this.timedUpTimeout = null;
        this.pointerId = -1;
    }

    init() {
        this.addListeners();
    }

    destroy() {
        this.removeListeners();
    }

    addListeners() {
        this.target.addEventListener("pointerdown", this.onTouchStartHandler);
        this.target.addEventListener("pointermove", this.onTouchMovementHandler);
        this.target.addEventListener("pointerup", this.onTouchEndHandler);
        this.target.addEventListener("pointercancel", this.onTouchEndHandler);
        this.target.addEventListener("pointerout", this.onTouchEndHandler);
        this.target.addEventListener("pointerleave", this.onTouchEndHandler);
    }

    removeListeners() {
        this.target.removeEventListener("pointerdown", this.onTouchStartHandler);
        this.target.removeEventListener("pointermove", this.onTouchMovementHandler);
        this.target.removeEventListener("pointerup", this.onTouchEndHandler);
        this.target.removeEventListener("pointercancel", this.onTouchEndHandler);
        this.target.removeEventListener("pointerout", this.onTouchEndHandler);
        this.target.removeEventListener("pointerleave", this.onTouchEndHandler);
    }

    handleTouchStart(e) {
        if (this.prevent) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (this.pointerId !== -1) {
            this.pointerId = -1;
            return;
        }

        const firstTouch = e;
        this.pointerId = firstTouch.pointerId;
        this.xUp = this.xDown = firstTouch.clientX;
        this.yUp = this.yDown = firstTouch.clientY;

        this.clearTimeout();
        this.startTimeout();
    }

    clearTimeout() {
        clearTimeout(this.timedUpTimeout);
    }

    startTimeout() {
        this.timedUpTimeout = setTimeout(()=>{
            if (this.forceTriggerCallback) {
                this.handleTouchEnd({pointerId: this.pointerId});
            }
            this.pointerId = -1;
        }, this.timeout);
    }

    handleTouchMove(e) {
        if (this.prevent) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (e.pointerId !== this.pointerId) { return; }

        this.xUp = e.clientX;
        this.yUp = e.clientY;
    }

    handleTouchEnd(e) {
        if (this.prevent) {
            e.preventDefault();
            e.stopPropagation();
        }
        this.clearTimeout();

        if (e.pointerId !== this.pointerId) { return; } else { this.pointerId = -1; }

        const swipe = {id: this.id};
        const xDiff = this.xDown - this.xUp;
        const yDiff = this.yDown - this.yUp;

        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            swipe.xDiff = xDiff;
            if (xDiff > this.resistance) {
                swipe.left = true;
                this.callback(swipe);
            } else if (xDiff < (this.resistance * -1)) {
                swipe.right = true;
                this.callback(swipe);
            }
        } else if (yDiff > this.resistance) {
            swipe.up = true;
            this.callback(swipe);
        } else if (yDiff < (this.resistance * -1)) {
            swipe.down = true;
            this.callback(swipe);
        }
    }

    handleTouchCancel(e) {
        if (e.pointerId === this.pointerId) { this.pointerId = -1; }
    }
}
