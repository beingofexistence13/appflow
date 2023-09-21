/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/event"], function (require, exports, lifecycle_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$uU = void 0;
    class $uU extends lifecycle_1.$kc {
        constructor(referenceDomElement, dimension) {
            super();
            this.a = this.B(new event_1.$fd());
            this.onDidChange = this.a.event;
            this.b = referenceDomElement;
            this.c = -1;
            this.f = -1;
            this.g = null;
            this.h(false, dimension);
        }
        dispose() {
            this.stopObserving();
            super.dispose();
        }
        getWidth() {
            return this.c;
        }
        getHeight() {
            return this.f;
        }
        startObserving() {
            if (!this.g && this.b) {
                // We want to react to the resize observer only once per animation frame
                // The first time the resize observer fires, we will react to it immediately.
                // Otherwise we will postpone to the next animation frame.
                // We'll use `observeContentRect` to store the content rect we received.
                let observeContentRect = null;
                const observeNow = () => {
                    if (observeContentRect) {
                        this.observe({ width: observeContentRect.width, height: observeContentRect.height });
                    }
                    else {
                        this.observe();
                    }
                };
                let shouldObserve = false;
                let alreadyObservedThisAnimationFrame = false;
                const update = () => {
                    if (shouldObserve && !alreadyObservedThisAnimationFrame) {
                        try {
                            shouldObserve = false;
                            alreadyObservedThisAnimationFrame = true;
                            observeNow();
                        }
                        finally {
                            requestAnimationFrame(() => {
                                alreadyObservedThisAnimationFrame = false;
                                update();
                            });
                        }
                    }
                };
                this.g = new ResizeObserver((entries) => {
                    observeContentRect = (entries && entries[0] && entries[0].contentRect ? entries[0].contentRect : null);
                    shouldObserve = true;
                    update();
                });
                this.g.observe(this.b);
            }
        }
        stopObserving() {
            if (this.g) {
                this.g.disconnect();
                this.g = null;
            }
        }
        observe(dimension) {
            this.h(true, dimension);
        }
        h(emitEvent, dimension) {
            let observedWidth = 0;
            let observedHeight = 0;
            if (dimension) {
                observedWidth = dimension.width;
                observedHeight = dimension.height;
            }
            else if (this.b) {
                observedWidth = this.b.clientWidth;
                observedHeight = this.b.clientHeight;
            }
            observedWidth = Math.max(5, observedWidth);
            observedHeight = Math.max(5, observedHeight);
            if (this.c !== observedWidth || this.f !== observedHeight) {
                this.c = observedWidth;
                this.f = observedHeight;
                if (emitEvent) {
                    this.a.fire();
                }
            }
        }
    }
    exports.$uU = $uU;
});
//# sourceMappingURL=elementSizeObserver.js.map