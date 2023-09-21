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
    exports.Gesture = exports.EventType = void 0;
    var EventType;
    (function (EventType) {
        EventType.Tap = '-monaco-gesturetap';
        EventType.Change = '-monaco-gesturechange';
        EventType.Start = '-monaco-gesturestart';
        EventType.End = '-monaco-gesturesend';
        EventType.Contextmenu = '-monaco-gesturecontextmenu';
    })(EventType || (exports.EventType = EventType = {}));
    class Gesture extends lifecycle_1.Disposable {
        static { this.SCROLL_FRICTION = -0.005; }
        static { this.HOLD_DELAY = 700; }
        static { this.CLEAR_TAP_COUNT_TIME = 400; } // ms
        constructor() {
            super();
            this.dispatched = false;
            this.targets = new linkedList_1.LinkedList();
            this.ignoreTargets = new linkedList_1.LinkedList();
            this.activeTouches = {};
            this.handle = null;
            this._lastSetTapCountTime = 0;
            this._register(DomUtils.addDisposableListener(document, 'touchstart', (e) => this.onTouchStart(e), { passive: false }));
            this._register(DomUtils.addDisposableListener(document, 'touchend', (e) => this.onTouchEnd(e)));
            this._register(DomUtils.addDisposableListener(document, 'touchmove', (e) => this.onTouchMove(e), { passive: false }));
        }
        static addTarget(element) {
            if (!Gesture.isTouchDevice()) {
                return lifecycle_1.Disposable.None;
            }
            if (!Gesture.INSTANCE) {
                Gesture.INSTANCE = (0, lifecycle_1.markAsSingleton)(new Gesture());
            }
            const remove = Gesture.INSTANCE.targets.push(element);
            return (0, lifecycle_1.toDisposable)(remove);
        }
        static ignoreTarget(element) {
            if (!Gesture.isTouchDevice()) {
                return lifecycle_1.Disposable.None;
            }
            if (!Gesture.INSTANCE) {
                Gesture.INSTANCE = (0, lifecycle_1.markAsSingleton)(new Gesture());
            }
            const remove = Gesture.INSTANCE.ignoreTargets.push(element);
            return (0, lifecycle_1.toDisposable)(remove);
        }
        static isTouchDevice() {
            // `'ontouchstart' in window` always evaluates to true with typescript's modern typings. This causes `window` to be
            // `never` later in `window.navigator`. That's why we need the explicit `window as Window` cast
            return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        }
        dispose() {
            if (this.handle) {
                this.handle.dispose();
                this.handle = null;
            }
            super.dispose();
        }
        onTouchStart(e) {
            const timestamp = Date.now(); // use Date.now() because on FF e.timeStamp is not epoch based.
            if (this.handle) {
                this.handle.dispose();
                this.handle = null;
            }
            for (let i = 0, len = e.targetTouches.length; i < len; i++) {
                const touch = e.targetTouches.item(i);
                this.activeTouches[touch.identifier] = {
                    id: touch.identifier,
                    initialTarget: touch.target,
                    initialTimeStamp: timestamp,
                    initialPageX: touch.pageX,
                    initialPageY: touch.pageY,
                    rollingTimestamps: [timestamp],
                    rollingPageX: [touch.pageX],
                    rollingPageY: [touch.pageY]
                };
                const evt = this.newGestureEvent(EventType.Start, touch.target);
                evt.pageX = touch.pageX;
                evt.pageY = touch.pageY;
                this.dispatchEvent(evt);
            }
            if (this.dispatched) {
                e.preventDefault();
                e.stopPropagation();
                this.dispatched = false;
            }
        }
        onTouchEnd(e) {
            const timestamp = Date.now(); // use Date.now() because on FF e.timeStamp is not epoch based.
            const activeTouchCount = Object.keys(this.activeTouches).length;
            for (let i = 0, len = e.changedTouches.length; i < len; i++) {
                const touch = e.changedTouches.item(i);
                if (!this.activeTouches.hasOwnProperty(String(touch.identifier))) {
                    console.warn('move of an UNKNOWN touch', touch);
                    continue;
                }
                const data = this.activeTouches[touch.identifier], holdTime = Date.now() - data.initialTimeStamp;
                if (holdTime < Gesture.HOLD_DELAY
                    && Math.abs(data.initialPageX - arrays.tail(data.rollingPageX)) < 30
                    && Math.abs(data.initialPageY - arrays.tail(data.rollingPageY)) < 30) {
                    const evt = this.newGestureEvent(EventType.Tap, data.initialTarget);
                    evt.pageX = arrays.tail(data.rollingPageX);
                    evt.pageY = arrays.tail(data.rollingPageY);
                    this.dispatchEvent(evt);
                }
                else if (holdTime >= Gesture.HOLD_DELAY
                    && Math.abs(data.initialPageX - arrays.tail(data.rollingPageX)) < 30
                    && Math.abs(data.initialPageY - arrays.tail(data.rollingPageY)) < 30) {
                    const evt = this.newGestureEvent(EventType.Contextmenu, data.initialTarget);
                    evt.pageX = arrays.tail(data.rollingPageX);
                    evt.pageY = arrays.tail(data.rollingPageY);
                    this.dispatchEvent(evt);
                }
                else if (activeTouchCount === 1) {
                    const finalX = arrays.tail(data.rollingPageX);
                    const finalY = arrays.tail(data.rollingPageY);
                    const deltaT = arrays.tail(data.rollingTimestamps) - data.rollingTimestamps[0];
                    const deltaX = finalX - data.rollingPageX[0];
                    const deltaY = finalY - data.rollingPageY[0];
                    // We need to get all the dispatch targets on the start of the inertia event
                    const dispatchTo = [...this.targets].filter(t => data.initialTarget instanceof Node && t.contains(data.initialTarget));
                    this.inertia(dispatchTo, timestamp, // time now
                    Math.abs(deltaX) / deltaT, // speed
                    deltaX > 0 ? 1 : -1, // x direction
                    finalX, // x now
                    Math.abs(deltaY) / deltaT, // y speed
                    deltaY > 0 ? 1 : -1, // y direction
                    finalY // y now
                    );
                }
                this.dispatchEvent(this.newGestureEvent(EventType.End, data.initialTarget));
                // forget about this touch
                delete this.activeTouches[touch.identifier];
            }
            if (this.dispatched) {
                e.preventDefault();
                e.stopPropagation();
                this.dispatched = false;
            }
        }
        newGestureEvent(type, initialTarget) {
            const event = document.createEvent('CustomEvent');
            event.initEvent(type, false, true);
            event.initialTarget = initialTarget;
            event.tapCount = 0;
            return event;
        }
        dispatchEvent(event) {
            if (event.type === EventType.Tap) {
                const currentTime = (new Date()).getTime();
                let setTapCount = 0;
                if (currentTime - this._lastSetTapCountTime > Gesture.CLEAR_TAP_COUNT_TIME) {
                    setTapCount = 1;
                }
                else {
                    setTapCount = 2;
                }
                this._lastSetTapCountTime = currentTime;
                event.tapCount = setTapCount;
            }
            else if (event.type === EventType.Change || event.type === EventType.Contextmenu) {
                // tap is canceled by scrolling or context menu
                this._lastSetTapCountTime = 0;
            }
            if (event.initialTarget instanceof Node) {
                for (const ignoreTarget of this.ignoreTargets) {
                    if (ignoreTarget.contains(event.initialTarget)) {
                        return;
                    }
                }
                for (const target of this.targets) {
                    if (target.contains(event.initialTarget)) {
                        target.dispatchEvent(event);
                        this.dispatched = true;
                    }
                }
            }
        }
        inertia(dispatchTo, t1, vX, dirX, x, vY, dirY, y) {
            this.handle = DomUtils.scheduleAtNextAnimationFrame(() => {
                const now = Date.now();
                // velocity: old speed + accel_over_time
                const deltaT = now - t1;
                let delta_pos_x = 0, delta_pos_y = 0;
                let stopped = true;
                vX += Gesture.SCROLL_FRICTION * deltaT;
                vY += Gesture.SCROLL_FRICTION * deltaT;
                if (vX > 0) {
                    stopped = false;
                    delta_pos_x = dirX * vX * deltaT;
                }
                if (vY > 0) {
                    stopped = false;
                    delta_pos_y = dirY * vY * deltaT;
                }
                // dispatch translation event
                const evt = this.newGestureEvent(EventType.Change);
                evt.translationX = delta_pos_x;
                evt.translationY = delta_pos_y;
                dispatchTo.forEach(d => d.dispatchEvent(evt));
                if (!stopped) {
                    this.inertia(dispatchTo, now, vX, dirX, x + delta_pos_x, vY, dirY, y + delta_pos_y);
                }
            });
        }
        onTouchMove(e) {
            const timestamp = Date.now(); // use Date.now() because on FF e.timeStamp is not epoch based.
            for (let i = 0, len = e.changedTouches.length; i < len; i++) {
                const touch = e.changedTouches.item(i);
                if (!this.activeTouches.hasOwnProperty(String(touch.identifier))) {
                    console.warn('end of an UNKNOWN touch', touch);
                    continue;
                }
                const data = this.activeTouches[touch.identifier];
                const evt = this.newGestureEvent(EventType.Change, data.initialTarget);
                evt.translationX = touch.pageX - arrays.tail(data.rollingPageX);
                evt.translationY = touch.pageY - arrays.tail(data.rollingPageY);
                evt.pageX = touch.pageX;
                evt.pageY = touch.pageY;
                this.dispatchEvent(evt);
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
            if (this.dispatched) {
                e.preventDefault();
                e.stopPropagation();
                this.dispatched = false;
            }
        }
    }
    exports.Gesture = Gesture;
    __decorate([
        decorators_1.memoize
    ], Gesture, "isTouchDevice", null);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG91Y2guanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2Jyb3dzZXIvdG91Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7O0lBUWhHLElBQWlCLFNBQVMsQ0FNekI7SUFORCxXQUFpQixTQUFTO1FBQ1osYUFBRyxHQUFHLG9CQUFvQixDQUFDO1FBQzNCLGdCQUFNLEdBQUcsdUJBQXVCLENBQUM7UUFDakMsZUFBSyxHQUFHLHNCQUFzQixDQUFDO1FBQy9CLGFBQUcsR0FBRyxxQkFBcUIsQ0FBQztRQUM1QixxQkFBVyxHQUFHLDRCQUE0QixDQUFDO0lBQ3pELENBQUMsRUFOZ0IsU0FBUyx5QkFBVCxTQUFTLFFBTXpCO0lBa0RELE1BQWEsT0FBUSxTQUFRLHNCQUFVO2lCQUVkLG9CQUFlLEdBQUcsQ0FBQyxLQUFLLEFBQVQsQ0FBVTtpQkFFekIsZUFBVSxHQUFHLEdBQUcsQUFBTixDQUFPO2lCQVdqQix5QkFBb0IsR0FBRyxHQUFHLEFBQU4sQ0FBTyxHQUFDLEtBQUs7UUFHekQ7WUFDQyxLQUFLLEVBQUUsQ0FBQztZQWJELGVBQVUsR0FBRyxLQUFLLENBQUM7WUFDVixZQUFPLEdBQUcsSUFBSSx1QkFBVSxFQUFlLENBQUM7WUFDeEMsa0JBQWEsR0FBRyxJQUFJLHVCQUFVLEVBQWUsQ0FBQztZQWE5RCxJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztZQUN4QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztZQUNuQixJQUFJLENBQUMsb0JBQW9CLEdBQUcsQ0FBQyxDQUFDO1lBQzlCLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFhLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUs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