/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, async_1, errors_1, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Z4 = exports.$Y4 = exports.HoverStartSource = exports.HoverStartMode = void 0;
    var HoverOperationState;
    (function (HoverOperationState) {
        HoverOperationState[HoverOperationState["Idle"] = 0] = "Idle";
        HoverOperationState[HoverOperationState["FirstWait"] = 1] = "FirstWait";
        HoverOperationState[HoverOperationState["SecondWait"] = 2] = "SecondWait";
        HoverOperationState[HoverOperationState["WaitingForAsync"] = 3] = "WaitingForAsync";
        HoverOperationState[HoverOperationState["WaitingForAsyncShowingLoading"] = 4] = "WaitingForAsyncShowingLoading";
    })(HoverOperationState || (HoverOperationState = {}));
    var HoverStartMode;
    (function (HoverStartMode) {
        HoverStartMode[HoverStartMode["Delayed"] = 0] = "Delayed";
        HoverStartMode[HoverStartMode["Immediate"] = 1] = "Immediate";
    })(HoverStartMode || (exports.HoverStartMode = HoverStartMode = {}));
    var HoverStartSource;
    (function (HoverStartSource) {
        HoverStartSource[HoverStartSource["Mouse"] = 0] = "Mouse";
        HoverStartSource[HoverStartSource["Keyboard"] = 1] = "Keyboard";
    })(HoverStartSource || (exports.HoverStartSource = HoverStartSource = {}));
    class $Y4 {
        constructor(value, isComplete, hasLoadingMessage) {
            this.value = value;
            this.isComplete = isComplete;
            this.hasLoadingMessage = hasLoadingMessage;
        }
    }
    exports.$Y4 = $Y4;
    /**
     * Computing the hover is very fine tuned.
     *
     * Suppose the hover delay is 300ms (the default). Then, when resting the mouse at an anchor:
     * - at 150ms, the async computation is triggered (i.e. semantic hover)
     *   - if async results already come in, they are not rendered yet.
     * - at 300ms, the sync computation is triggered (i.e. decorations, markers)
     *   - if there are sync or async results, they are rendered.
     * - at 900ms, if the async computation hasn't finished, a "Loading..." result is added.
     */
    class $Z4 extends lifecycle_1.$kc {
        constructor(n, r) {
            super();
            this.n = n;
            this.r = r;
            this.a = this.B(new event_1.$fd());
            this.onResult = this.a.event;
            this.b = this.B(new async_1.$Sg(() => this.z(), 0));
            this.c = this.B(new async_1.$Sg(() => this.C(), 0));
            this.f = this.B(new async_1.$Sg(() => this.D(), 0));
            this.g = 0 /* HoverOperationState.Idle */;
            this.h = null;
            this.j = false;
            this.m = [];
        }
        dispose() {
            if (this.h) {
                this.h.cancel();
                this.h = null;
            }
            super.dispose();
        }
        get s() {
            return this.n.getOption(60 /* EditorOption.hover */).delay;
        }
        get t() {
            return this.s / 2;
        }
        get u() {
            return this.s - this.t;
        }
        get w() {
            return 3 * this.s;
        }
        y(state, fireResult = true) {
            this.g = state;
            if (fireResult) {
                this.F();
            }
        }
        z() {
            this.y(2 /* HoverOperationState.SecondWait */);
            this.c.schedule(this.u);
            if (this.r.computeAsync) {
                this.j = false;
                this.h = (0, async_1.$5g)(token => this.r.computeAsync(token));
                (async () => {
                    try {
                        for await (const item of this.h) {
                            if (item) {
                                this.m.push(item);
                                this.F();
                            }
                        }
                        this.j = true;
                        if (this.g === 3 /* HoverOperationState.WaitingForAsync */ || this.g === 4 /* HoverOperationState.WaitingForAsyncShowingLoading */) {
                            this.y(0 /* HoverOperationState.Idle */);
                        }
                    }
                    catch (e) {
                        (0, errors_1.$Y)(e);
                    }
                })();
            }
            else {
                this.j = true;
            }
        }
        C() {
            if (this.r.computeSync) {
                this.m = this.m.concat(this.r.computeSync());
            }
            this.y(this.j ? 0 /* HoverOperationState.Idle */ : 3 /* HoverOperationState.WaitingForAsync */);
        }
        D() {
            if (this.g === 3 /* HoverOperationState.WaitingForAsync */) {
                this.y(4 /* HoverOperationState.WaitingForAsyncShowingLoading */);
            }
        }
        F() {
            if (this.g === 1 /* HoverOperationState.FirstWait */ || this.g === 2 /* HoverOperationState.SecondWait */) {
                // Do not send out results before the hover time
                return;
            }
            const isComplete = (this.g === 0 /* HoverOperationState.Idle */);
            const hasLoadingMessage = (this.g === 4 /* HoverOperationState.WaitingForAsyncShowingLoading */);
            this.a.fire(new $Y4(this.m.slice(0), isComplete, hasLoadingMessage));
        }
        start(mode) {
            if (mode === 0 /* HoverStartMode.Delayed */) {
                if (this.g === 0 /* HoverOperationState.Idle */) {
                    this.y(1 /* HoverOperationState.FirstWait */);
                    this.b.schedule(this.t);
                    this.f.schedule(this.w);
                }
            }
            else {
                switch (this.g) {
                    case 0 /* HoverOperationState.Idle */:
                        this.z();
                        this.c.cancel();
                        this.C();
                        break;
                    case 2 /* HoverOperationState.SecondWait */:
                        this.c.cancel();
                        this.C();
                        break;
                }
            }
        }
        cancel() {
            this.b.cancel();
            this.c.cancel();
            this.f.cancel();
            if (this.h) {
                this.h.cancel();
                this.h = null;
            }
            this.m = [];
            this.y(0 /* HoverOperationState.Idle */, false);
        }
    }
    exports.$Z4 = $Z4;
});
//# sourceMappingURL=hoverOperation.js.map