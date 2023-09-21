/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/arrays", "vs/base/common/decorators", "vs/base/common/lifecycle", "vs/base/common/linkedList"], function (require, exports, DomUtils, arrays, decorators_1, lifecycle_1, linkedList_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$EP = exports.EventType = void 0;
    var EventType;
    (function (EventType) {
        EventType.Tap = '-monaco-gesturetap';
        EventType.Change = '-monaco-gesturechange';
        EventType.Start = '-monaco-gesturestart';
        EventType.End = '-monaco-gesturesend';
        EventType.Contextmenu = '-monaco-gesturecontextmenu';
    })(EventType || (exports.EventType = EventType = {}));
    class $EP extends lifecycle_1.$kc {
        static { this.a = -0.005; }
        static { this.c = 700; }
        static { this.r = 400; } // ms
        constructor() {
            super();
            this.f = false;
            this.g = new linkedList_1.$tc();
            this.h = new linkedList_1.$tc();
            this.m = {};
            this.j = null;
            this.n = 0;
            this.B(DomUtils.$nO(document, 'touchstart', (e) => this.s(e), { passive: false }));
            this.B(DomUtils.$nO(document, 'touchend', (e) => this.u(e)));
            this.B(DomUtils.$nO(document, 'touchmove', (e) => this.D(e), { passive: false }));
        }
        static addTarget(element) {
            if (!$EP.isTouchDevice()) {
                return lifecycle_1.$kc.None;
            }
            if (!$EP.b) {
                $EP.b = (0, lifecycle_1.$dc)(new $EP());
            }
            const remove = $EP.b.g.push(element);
            return (0, lifecycle_1.$ic)(remove);
        }
        static ignoreTarget(element) {
            if (!$EP.isTouchDevice()) {
                return lifecycle_1.$kc.None;
            }
            if (!$EP.b) {
                $EP.b = (0, lifecycle_1.$dc)(new $EP());
            }
            const remove = $EP.b.h.push(element);
            return (0, lifecycle_1.$ic)(remove);
        }
        static isTouchDevice() {
            // `'ontouchstart' in window` always evaluates to true with typescript's modern typings. This causes `window` to be
            // `never` later in `window.navigator`. That's why we need the explicit `window as Window` cast
            return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        }
        dispose() {
            if (this.j) {
                this.j.dispose();
                this.j = null;
            }
            super.dispose();
        }
        s(e) {
            const timestamp = Date.now(); // use Date.now() because on FF e.timeStamp is not epoch based.
            if (this.j) {
                this.j.dispose();
                this.j = null;
            }
            for (let i = 0, len = e.targetTouches.length; i < len; i++) {
                const touch = e.targetTouches.item(i);
                this.m[touch.identifier] = {
                    id: touch.identifier,
                    initialTarget: touch.target,
                    initialTimeStamp: timestamp,
                    initialPageX: touch.pageX,
                    initialPageY: touch.pageY,
                    rollingTimestamps: [timestamp],
                    rollingPageX: [touch.pageX],
                    rollingPageY: [touch.pageY]
                };
                const evt = this.w(EventType.Start, touch.target);
                evt.pageX = touch.pageX;
                evt.pageY = touch.pageY;
                this.z(evt);
            }
            if (this.f) {
                e.preventDefault();
                e.stopPropagation();
                this.f = false;
            }
        }
        u(e) {
            const timestamp = Date.now(); // use Date.now() because on FF e.timeStamp is not epoch based.
            const activeTouchCount = Object.keys(this.m).length;
            for (let i = 0, len = e.changedTouches.length; i < len; i++) {
                const touch = e.changedTouches.item(i);
                if (!this.m.hasOwnProperty(String(touch.identifier))) {
                    console.warn('move of an UNKNOWN touch', touch);
                    continue;
                }
                const data = this.m[touch.identifier], holdTime = Date.now() - data.initialTimeStamp;
                if (holdTime < $EP.c
                    && Math.abs(data.initialPageX - arrays.$qb(data.rollingPageX)) < 30
                    && Math.abs(data.initialPageY - arrays.$qb(data.rollingPageY)) < 30) {
                    const evt = this.w(EventType.Tap, data.initialTarget);
                    evt.pageX = arrays.$qb(data.rollingPageX);
                    evt.pageY = arrays.$qb(data.rollingPageY);
                    this.z(evt);
                }
                else if (holdTime >= $EP.c
                    && Math.abs(data.initialPageX - arrays.$qb(data.rollingPageX)) < 30
                    && Math.abs(data.initialPageY - arrays.$qb(data.rollingPageY)) < 30) {
                    const evt = this.w(EventType.Contextmenu, data.initialTarget);
                    evt.pageX = arrays.$qb(data.rollingPageX);
                    evt.pageY = arrays.$qb(data.rollingPageY);
                    this.z(evt);
                }
                else if (activeTouchCount === 1) {
                    const finalX = arrays.$qb(data.rollingPageX);
                    const finalY = arrays.$qb(data.rollingPageY);
                    const deltaT = arrays.$qb(data.rollingTimestamps) - data.rollingTimestamps[0];
                    const deltaX = finalX - data.rollingPageX[0];
                    const deltaY = finalY - data.rollingPageY[0];
                    // We need to get all the dispatch targets on the start of the inertia event
                    const dispatchTo = [...this.g].filter(t => data.initialTarget instanceof Node && t.contains(data.initialTarget));
                    this.C(dispatchTo, timestamp, // time now
                    Math.abs(deltaX) / deltaT, // speed
                    deltaX > 0 ? 1 : -1, // x direction
                    finalX, // x now
                    Math.abs(deltaY) / deltaT, // y speed
                    deltaY > 0 ? 1 : -1, // y direction
                    finalY // y now
                    );
                }
                this.z(this.w(EventType.End, data.initialTarget));
                // forget about this touch
                delete this.m[touch.identifier];
            }
            if (this.f) {
                e.preventDefault();
                e.stopPropagation();
                this.f = false;
            }
        }
        w(type, initialTarget) {
            const event = document.createEvent('CustomEvent');
            event.initEvent(type, false, true);
            event.initialTarget = initialTarget;
            event.tapCount = 0;
            return event;
        }
        z(event) {
            if (event.type === EventType.Tap) {
                const currentTime = (new Date()).getTime();
                let setTapCount = 0;
                if (currentTime - this.n > $EP.r) {
                    setTapCount = 1;
                }
                else {
                    setTapCount = 2;
                }
                this.n = currentTime;
                event.tapCount = setTapCount;
            }
            else if (event.type === EventType.Change || event.type === EventType.Contextmenu) {
                // tap is canceled by scrolling or context menu
                this.n = 0;
            }
            if (event.initialTarget instanceof Node) {
                for (const ignoreTarget of this.h) {
                    if (ignoreTarget.contains(event.initialTarget)) {
                        return;
                    }
                }
                for (const target of this.g) {
                    if (target.contains(event.initialTarget)) {
                        target.dispatchEvent(event);
                        this.f = true;
                    }
                }
            }
        }
        C(dispatchTo, t1, vX, dirX, x, vY, dirY, y) {
            this.j = DomUtils.$vO(() => {
                const now = Date.now();
                // velocity: old speed + accel_over_time
                const deltaT = now - t1;
                let delta_pos_x = 0, delta_pos_y = 0;
                let stopped = true;
                vX += $EP.a * deltaT;
                vY += $EP.a * deltaT;
                if (vX > 0) {
                    stopped = false;
                    delta_pos_x = dirX * vX * deltaT;
                }
                if (vY > 0) {
                    stopped = false;
                    delta_pos_y = dirY * vY * deltaT;
                }
                // dispatch translation event
                const evt = this.w(EventType.Change);
                evt.translationX = delta_pos_x;
                evt.translationY = delta_pos_y;
                dispatchTo.forEach(d => d.dispatchEvent(evt));
                if (!stopped) {
                    this.C(dispatchTo, now, vX, dirX, x + delta_pos_x, vY, dirY, y + delta_pos_y);
                }
            });
        }
        D(e) {
            const timestamp = Date.now(); // use Date.now() because on FF e.timeStamp is not epoch based.
            for (let i = 0, len = e.changedTouches.length; i < len; i++) {
                const touch = e.changedTouches.item(i);
                if (!this.m.hasOwnProperty(String(touch.identifier))) {
                    console.warn('end of an UNKNOWN touch', touch);
                    continue;
                }
                const data = this.m[touch.identifier];
                const evt = this.w(EventType.Change, data.initialTarget);
                evt.translationX = touch.pageX - arrays.$qb(data.rollingPageX);
                evt.translationY = touch.pageY - arrays.$qb(data.rollingPageY);
                evt.pageX = touch.pageX;
                evt.pageY = touch.pageY;
                this.z(evt);
                // only keep a few data points, to average the final speed
                if (data.rollingPageX.length > 3) {
                    data.rollingPageX.shift();
                    data.rollingPageY.shift();
                    data.rollingTimestamps.shift();
                }
                data.rollingPageX.push(touch.pageX);
                data.rollingPageY.push(touch.pageY);
                data.rollingTimestamps.push(timestamp);
            }
            if (this.f) {
                e.preventDefault();
                e.stopPropagation();
                this.f = false;
            }
        }
    }
    exports.$EP = $EP;
    __decorate([
        decorators_1.$6g
    ], $EP, "isTouchDevice", null);
});
//# sourceMappingURL=touch.js.map