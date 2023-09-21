/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/progress/common/progress"], function (require, exports, event_1, lifecycle_1, progress_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Eeb = exports.$Deb = exports.$Ceb = void 0;
    class $Ceb extends lifecycle_1.$kc {
        constructor(a, b) {
            super();
            this.a = a;
            this.b = b;
            this.c();
        }
        c() {
            // Stop any running progress when the active editor changes or
            // the group becomes empty.
            // In contrast to the composite progress indicator, we do not
            // track active editor progress and replay it later (yet).
            this.B(this.b.onDidModelChange(e => {
                if (e.kind === 6 /* GroupModelChangeKind.EDITOR_ACTIVE */ ||
                    (e.kind === 4 /* GroupModelChangeKind.EDITOR_CLOSE */ && this.b.isEmpty)) {
                    this.a.stop().hide();
                }
            }));
        }
        show(infiniteOrTotal, delay) {
            // No editor open: ignore any progress reporting
            if (this.b.isEmpty) {
                return progress_1.$3u;
            }
            if (infiniteOrTotal === true) {
                return this.f(true, delay);
            }
            return this.f(infiniteOrTotal, delay);
        }
        f(infiniteOrTotal, delay) {
            if (typeof infiniteOrTotal === 'boolean') {
                this.a.infinite().show(delay);
            }
            else {
                this.a.total(infiniteOrTotal).show(delay);
            }
            return {
                total: (total) => {
                    this.a.total(total);
                },
                worked: (worked) => {
                    if (this.a.hasTotal()) {
                        this.a.worked(worked);
                    }
                    else {
                        this.a.infinite().show();
                    }
                },
                done: () => {
                    this.a.stop().hide();
                }
            };
        }
        async showWhile(promise, delay) {
            // No editor open: ignore any progress reporting
            if (this.b.isEmpty) {
                try {
                    await promise;
                }
                catch (error) {
                    // ignore
                }
            }
            return this.g(promise, delay);
        }
        async g(promise, delay) {
            try {
                this.a.infinite().show(delay);
                await promise;
            }
            catch (error) {
                // ignore
            }
            finally {
                this.a.stop().hide();
            }
        }
    }
    exports.$Ceb = $Ceb;
    var ProgressIndicatorState;
    (function (ProgressIndicatorState) {
        let Type;
        (function (Type) {
            Type[Type["None"] = 0] = "None";
            Type[Type["Done"] = 1] = "Done";
            Type[Type["Infinite"] = 2] = "Infinite";
            Type[Type["While"] = 3] = "While";
            Type[Type["Work"] = 4] = "Work";
        })(Type = ProgressIndicatorState.Type || (ProgressIndicatorState.Type = {}));
        ProgressIndicatorState.None = { type: 0 /* Type.None */ };
        ProgressIndicatorState.Done = { type: 1 /* Type.Done */ };
        ProgressIndicatorState.Infinite = { type: 2 /* Type.Infinite */ };
        class While {
            constructor(whilePromise, whileStart, whileDelay) {
                this.whilePromise = whilePromise;
                this.whileStart = whileStart;
                this.whileDelay = whileDelay;
                this.type = 3 /* Type.While */;
            }
        }
        ProgressIndicatorState.While = While;
        class Work {
            constructor(total, worked) {
                this.total = total;
                this.worked = worked;
                this.type = 4 /* Type.Work */;
            }
        }
        ProgressIndicatorState.Work = Work;
    })(ProgressIndicatorState || (ProgressIndicatorState = {}));
    class $Deb extends lifecycle_1.$kc {
        constructor(b, c) {
            super();
            this.b = b;
            this.c = c;
            this.a = ProgressIndicatorState.None;
            this.registerListeners();
        }
        registerListeners() {
            this.B(this.c.onDidChangeActive(() => {
                if (this.c.isActive) {
                    this.f();
                }
                else {
                    this.g();
                }
            }));
        }
        f() {
            // Return early if progress state indicates that progress is done
            if (this.a.type === ProgressIndicatorState.Done.type) {
                return;
            }
            // Replay Infinite Progress from Promise
            if (this.a.type === 3 /* ProgressIndicatorState.Type.While */) {
                let delay;
                if (this.a.whileDelay > 0) {
                    const remainingDelay = this.a.whileDelay - (Date.now() - this.a.whileStart);
                    if (remainingDelay > 0) {
                        delay = remainingDelay;
                    }
                }
                this.h(delay);
            }
            // Replay Infinite Progress
            else if (this.a.type === 2 /* ProgressIndicatorState.Type.Infinite */) {
                this.b.infinite().show();
            }
            // Replay Finite Progress (Total & Worked)
            else if (this.a.type === 4 /* ProgressIndicatorState.Type.Work */) {
                if (this.a.total) {
                    this.b.total(this.a.total).show();
                }
                if (this.a.worked) {
                    this.b.worked(this.a.worked).show();
                }
            }
        }
        g() {
            this.b.stop().hide();
        }
        show(infiniteOrTotal, delay) {
            // Sort out Arguments
            if (typeof infiniteOrTotal === 'boolean') {
                this.a = ProgressIndicatorState.Infinite;
            }
            else {
                this.a = new ProgressIndicatorState.Work(infiniteOrTotal, undefined);
            }
            // Active: Show Progress
            if (this.c.isActive) {
                // Infinite: Start Progressbar and Show after Delay
                if (this.a.type === 2 /* ProgressIndicatorState.Type.Infinite */) {
                    this.b.infinite().show(delay);
                }
                // Finite: Start Progressbar and Show after Delay
                else if (this.a.type === 4 /* ProgressIndicatorState.Type.Work */ && typeof this.a.total === 'number') {
                    this.b.total(this.a.total).show(delay);
                }
            }
            return {
                total: (total) => {
                    this.a = new ProgressIndicatorState.Work(total, this.a.type === 4 /* ProgressIndicatorState.Type.Work */ ? this.a.worked : undefined);
                    if (this.c.isActive) {
                        this.b.total(total);
                    }
                },
                worked: (worked) => {
                    // Verify first that we are either not active or the progressbar has a total set
                    if (!this.c.isActive || this.b.hasTotal()) {
                        this.a = new ProgressIndicatorState.Work(this.a.type === 4 /* ProgressIndicatorState.Type.Work */ ? this.a.total : undefined, this.a.type === 4 /* ProgressIndicatorState.Type.Work */ && typeof this.a.worked === 'number' ? this.a.worked + worked : worked);
                        if (this.c.isActive) {
                            this.b.worked(worked);
                        }
                    }
                    // Otherwise the progress bar does not support worked(), we fallback to infinite() progress
                    else {
                        this.a = ProgressIndicatorState.Infinite;
                        this.b.infinite().show();
                    }
                },
                done: () => {
                    this.a = ProgressIndicatorState.Done;
                    if (this.c.isActive) {
                        this.b.stop().hide();
                    }
                }
            };
        }
        async showWhile(promise, delay) {
            // Join with existing running promise to ensure progress is accurate
            if (this.a.type === 3 /* ProgressIndicatorState.Type.While */) {
                promise = Promise.all([promise, this.a.whilePromise]);
            }
            // Keep Promise in State
            this.a = new ProgressIndicatorState.While(promise, delay || 0, Date.now());
            try {
                this.h(delay);
                await promise;
            }
            catch (error) {
                // ignore
            }
            finally {
                // If this is not the last promise in the list of joined promises, skip this
                if (this.a.type !== 3 /* ProgressIndicatorState.Type.While */ || this.a.whilePromise === promise) {
                    // The while promise is either null or equal the promise we last hooked on
                    this.a = ProgressIndicatorState.None;
                    if (this.c.isActive) {
                        this.b.stop().hide();
                    }
                }
            }
        }
        h(delay) {
            // Show Progress when active
            if (this.c.isActive) {
                this.b.infinite().show(delay);
            }
        }
    }
    exports.$Deb = $Deb;
    class $Eeb extends lifecycle_1.$kc {
        get isActive() { return this.c; }
        constructor(b, c) {
            super();
            this.b = b;
            this.c = c;
            this.a = this.B(new event_1.$fd());
            this.onDidChangeActive = this.a.event;
        }
        f(scopeId) {
            if (scopeId === this.b) {
                if (!this.c) {
                    this.c = true;
                    this.a.fire();
                }
            }
        }
        g(scopeId) {
            if (scopeId === this.b) {
                if (this.c) {
                    this.c = false;
                    this.a.fire();
                }
            }
        }
    }
    exports.$Eeb = $Eeb;
});
//# sourceMappingURL=progressIndicator.js.map