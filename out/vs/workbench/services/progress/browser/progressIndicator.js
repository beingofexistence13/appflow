/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/progress/common/progress"], function (require, exports, event_1, lifecycle_1, progress_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractProgressScope = exports.ScopedProgressIndicator = exports.EditorProgressIndicator = void 0;
    class EditorProgressIndicator extends lifecycle_1.Disposable {
        constructor(progressBar, group) {
            super();
            this.progressBar = progressBar;
            this.group = group;
            this.registerListeners();
        }
        registerListeners() {
            // Stop any running progress when the active editor changes or
            // the group becomes empty.
            // In contrast to the composite progress indicator, we do not
            // track active editor progress and replay it later (yet).
            this._register(this.group.onDidModelChange(e => {
                if (e.kind === 6 /* GroupModelChangeKind.EDITOR_ACTIVE */ ||
                    (e.kind === 4 /* GroupModelChangeKind.EDITOR_CLOSE */ && this.group.isEmpty)) {
                    this.progressBar.stop().hide();
                }
            }));
        }
        show(infiniteOrTotal, delay) {
            // No editor open: ignore any progress reporting
            if (this.group.isEmpty) {
                return progress_1.emptyProgressRunner;
            }
            if (infiniteOrTotal === true) {
                return this.doShow(true, delay);
            }
            return this.doShow(infiniteOrTotal, delay);
        }
        doShow(infiniteOrTotal, delay) {
            if (typeof infiniteOrTotal === 'boolean') {
                this.progressBar.infinite().show(delay);
            }
            else {
                this.progressBar.total(infiniteOrTotal).show(delay);
            }
            return {
                total: (total) => {
                    this.progressBar.total(total);
                },
                worked: (worked) => {
                    if (this.progressBar.hasTotal()) {
                        this.progressBar.worked(worked);
                    }
                    else {
                        this.progressBar.infinite().show();
                    }
                },
                done: () => {
                    this.progressBar.stop().hide();
                }
            };
        }
        async showWhile(promise, delay) {
            // No editor open: ignore any progress reporting
            if (this.group.isEmpty) {
                try {
                    await promise;
                }
                catch (error) {
                    // ignore
                }
            }
            return this.doShowWhile(promise, delay);
        }
        async doShowWhile(promise, delay) {
            try {
                this.progressBar.infinite().show(delay);
                await promise;
            }
            catch (error) {
                // ignore
            }
            finally {
                this.progressBar.stop().hide();
            }
        }
    }
    exports.EditorProgressIndicator = EditorProgressIndicator;
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
    class ScopedProgressIndicator extends lifecycle_1.Disposable {
        constructor(progressBar, scope) {
            super();
            this.progressBar = progressBar;
            this.scope = scope;
            this.progressState = ProgressIndicatorState.None;
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.scope.onDidChangeActive(() => {
                if (this.scope.isActive) {
                    this.onDidScopeActivate();
                }
                else {
                    this.onDidScopeDeactivate();
                }
            }));
        }
        onDidScopeActivate() {
            // Return early if progress state indicates that progress is done
            if (this.progressState.type === ProgressIndicatorState.Done.type) {
                return;
            }
            // Replay Infinite Progress from Promise
            if (this.progressState.type === 3 /* ProgressIndicatorState.Type.While */) {
                let delay;
                if (this.progressState.whileDelay > 0) {
                    const remainingDelay = this.progressState.whileDelay - (Date.now() - this.progressState.whileStart);
                    if (remainingDelay > 0) {
                        delay = remainingDelay;
                    }
                }
                this.doShowWhile(delay);
            }
            // Replay Infinite Progress
            else if (this.progressState.type === 2 /* ProgressIndicatorState.Type.Infinite */) {
                this.progressBar.infinite().show();
            }
            // Replay Finite Progress (Total & Worked)
            else if (this.progressState.type === 4 /* ProgressIndicatorState.Type.Work */) {
                if (this.progressState.total) {
                    this.progressBar.total(this.progressState.total).show();
                }
                if (this.progressState.worked) {
                    this.progressBar.worked(this.progressState.worked).show();
                }
            }
        }
        onDidScopeDeactivate() {
            this.progressBar.stop().hide();
        }
        show(infiniteOrTotal, delay) {
            // Sort out Arguments
            if (typeof infiniteOrTotal === 'boolean') {
                this.progressState = ProgressIndicatorState.Infinite;
            }
            else {
                this.progressState = new ProgressIndicatorState.Work(infiniteOrTotal, undefined);
            }
            // Active: Show Progress
            if (this.scope.isActive) {
                // Infinite: Start Progressbar and Show after Delay
                if (this.progressState.type === 2 /* ProgressIndicatorState.Type.Infinite */) {
                    this.progressBar.infinite().show(delay);
                }
                // Finite: Start Progressbar and Show after Delay
                else if (this.progressState.type === 4 /* ProgressIndicatorState.Type.Work */ && typeof this.progressState.total === 'number') {
                    this.progressBar.total(this.progressState.total).show(delay);
                }
            }
            return {
                total: (total) => {
                    this.progressState = new ProgressIndicatorState.Work(total, this.progressState.type === 4 /* ProgressIndicatorState.Type.Work */ ? this.progressState.worked : undefined);
                    if (this.scope.isActive) {
                        this.progressBar.total(total);
                    }
                },
                worked: (worked) => {
                    // Verify first that we are either not active or the progressbar has a total set
                    if (!this.scope.isActive || this.progressBar.hasTotal()) {
                        this.progressState = new ProgressIndicatorState.Work(this.progressState.type === 4 /* ProgressIndicatorState.Type.Work */ ? this.progressState.total : undefined, this.progressState.type === 4 /* ProgressIndicatorState.Type.Work */ && typeof this.progressState.worked === 'number' ? this.progressState.worked + worked : worked);
                        if (this.scope.isActive) {
                            this.progressBar.worked(worked);
                        }
                    }
                    // Otherwise the progress bar does not support worked(), we fallback to infinite() progress
                    else {
                        this.progressState = ProgressIndicatorState.Infinite;
                        this.progressBar.infinite().show();
                    }
                },
                done: () => {
                    this.progressState = ProgressIndicatorState.Done;
                    if (this.scope.isActive) {
                        this.progressBar.stop().hide();
                    }
                }
            };
        }
        async showWhile(promise, delay) {
            // Join with existing running promise to ensure progress is accurate
            if (this.progressState.type === 3 /* ProgressIndicatorState.Type.While */) {
                promise = Promise.all([promise, this.progressState.whilePromise]);
            }
            // Keep Promise in State
            this.progressState = new ProgressIndicatorState.While(promise, delay || 0, Date.now());
            try {
                this.doShowWhile(delay);
                await promise;
            }
            catch (error) {
                // ignore
            }
            finally {
                // If this is not the last promise in the list of joined promises, skip this
                if (this.progressState.type !== 3 /* ProgressIndicatorState.Type.While */ || this.progressState.whilePromise === promise) {
                    // The while promise is either null or equal the promise we last hooked on
                    this.progressState = ProgressIndicatorState.None;
                    if (this.scope.isActive) {
                        this.progressBar.stop().hide();
                    }
                }
            }
        }
        doShowWhile(delay) {
            // Show Progress when active
            if (this.scope.isActive) {
                this.progressBar.infinite().show(delay);
            }
        }
    }
    exports.ScopedProgressIndicator = ScopedProgressIndicator;
    class AbstractProgressScope extends lifecycle_1.Disposable {
        get isActive() { return this._isActive; }
        constructor(scopeId, _isActive) {
            super();
            this.scopeId = scopeId;
            this._isActive = _isActive;
            this._onDidChangeActive = this._register(new event_1.Emitter());
            this.onDidChangeActive = this._onDidChangeActive.event;
        }
        onScopeOpened(scopeId) {
            if (scopeId === this.scopeId) {
                if (!this._isActive) {
                    this._isActive = true;
                    this._onDidChangeActive.fire();
                }
            }
        }
        onScopeClosed(scopeId) {
            if (scopeId === this.scopeId) {
                if (this._isActive) {
                    this._isActive = false;
                    this._onDidChangeActive.fire();
                }
            }
        }
    }
    exports.AbstractProgressScope = AbstractProgressScope;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3Jlc3NJbmRpY2F0b3IuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvcHJvZ3Jlc3MvYnJvd3Nlci9wcm9ncmVzc0luZGljYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFTaEcsTUFBYSx1QkFBd0IsU0FBUSxzQkFBVTtRQUV0RCxZQUNrQixXQUF3QixFQUN4QixLQUF1QjtZQUV4QyxLQUFLLEVBQUUsQ0FBQztZQUhTLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1lBQ3hCLFVBQUssR0FBTCxLQUFLLENBQWtCO1lBSXhDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFFTyxpQkFBaUI7WUFFeEIsOERBQThEO1lBQzlELDJCQUEyQjtZQUMzQiw2REFBNkQ7WUFDN0QsMERBQTBEO1lBQzFELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDOUMsSUFDQyxDQUFDLENBQUMsSUFBSSwrQ0FBdUM7b0JBQzdDLENBQUMsQ0FBQyxDQUFDLElBQUksOENBQXNDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFDbkU7b0JBQ0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztpQkFDL0I7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUlELElBQUksQ0FBQyxlQUE4QixFQUFFLEtBQWM7WUFFbEQsZ0RBQWdEO1lBQ2hELElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUU7Z0JBQ3ZCLE9BQU8sOEJBQW1CLENBQUM7YUFDM0I7WUFFRCxJQUFJLGVBQWUsS0FBSyxJQUFJLEVBQUU7Z0JBQzdCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FB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