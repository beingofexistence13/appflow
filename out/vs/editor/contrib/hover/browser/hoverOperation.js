/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, async_1, errors_1, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HoverOperation = exports.HoverResult = exports.HoverStartSource = exports.HoverStartMode = void 0;
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
    class HoverResult {
        constructor(value, isComplete, hasLoadingMessage) {
            this.value = value;
            this.isComplete = isComplete;
            this.hasLoadingMessage = hasLoadingMessage;
        }
    }
    exports.HoverResult = HoverResult;
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
    class HoverOperation extends lifecycle_1.Disposable {
        constructor(_editor, _computer) {
            super();
            this._editor = _editor;
            this._computer = _computer;
            this._onResult = this._register(new event_1.Emitter());
            this.onResult = this._onResult.event;
            this._firstWaitScheduler = this._register(new async_1.RunOnceScheduler(() => this._triggerAsyncComputation(), 0));
            this._secondWaitScheduler = this._register(new async_1.RunOnceScheduler(() => this._triggerSyncComputation(), 0));
            this._loadingMessageScheduler = this._register(new async_1.RunOnceScheduler(() => this._triggerLoadingMessage(), 0));
            this._state = 0 /* HoverOperationState.Idle */;
            this._asyncIterable = null;
            this._asyncIterableDone = false;
            this._result = [];
        }
        dispose() {
            if (this._asyncIterable) {
                this._asyncIterable.cancel();
                this._asyncIterable = null;
            }
            super.dispose();
        }
        get _hoverTime() {
            return this._editor.getOption(60 /* EditorOption.hover */).delay;
        }
        get _firstWaitTime() {
            return this._hoverTime / 2;
        }
        get _secondWaitTime() {
            return this._hoverTime - this._firstWaitTime;
        }
        get _loadingMessageTime() {
            return 3 * this._hoverTime;
        }
        _setState(state, fireResult = true) {
            this._state = state;
            if (fireResult) {
                this._fireResult();
            }
        }
        _triggerAsyncComputation() {
            this._setState(2 /* HoverOperationState.SecondWait */);
            this._secondWaitScheduler.schedule(this._secondWaitTime);
            if (this._computer.computeAsync) {
                this._asyncIterableDone = false;
                this._asyncIterable = (0, async_1.createCancelableAsyncIterable)(token => this._computer.computeAsync(token));
                (async () => {
                    try {
                        for await (const item of this._asyncIterable) {
                            if (item) {
                                this._result.push(item);
                                this._fireResult();
                            }
                        }
                        this._asyncIterableDone = true;
                        if (this._state === 3 /* HoverOperationState.WaitingForAsync */ || this._state === 4 /* HoverOperationState.WaitingForAsyncShowingLoading */) {
                            this._setState(0 /* HoverOperationState.Idle */);
                        }
                    }
                    catch (e) {
                        (0, errors_1.onUnexpectedError)(e);
                    }
                })();
            }
            else {
                this._asyncIterableDone = true;
            }
        }
        _triggerSyncComputation() {
            if (this._computer.computeSync) {
                this._result = this._result.concat(this._computer.computeSync());
            }
            this._setState(this._asyncIterableDone ? 0 /* HoverOperationState.Idle */ : 3 /* HoverOperationState.WaitingForAsync */);
        }
        _triggerLoadingMessage() {
            if (this._state === 3 /* HoverOperationState.WaitingForAsync */) {
                this._setState(4 /* HoverOperationState.WaitingForAsyncShowingLoading */);
            }
        }
        _fireResult() {
            if (this._state === 1 /* HoverOperationState.FirstWait */ || this._state === 2 /* HoverOperationState.SecondWait */) {
                // Do not send out results before the hover time
                return;
            }
            const isComplete = (this._state === 0 /* HoverOperationState.Idle */);
            const hasLoadingMessage = (this._state === 4 /* HoverOperationState.WaitingForAsyncShowingLoading */);
            this._onResult.fire(new HoverResult(this._result.slice(0), isComplete, hasLoadingMessage));
        }
        start(mode) {
            if (mode === 0 /* HoverStartMode.Delayed */) {
                if (this._state === 0 /* HoverOperationState.Idle */) {
                    this._setState(1 /* HoverOperationState.FirstWait */);
                    this._firstWaitScheduler.schedule(this._firstWaitTime);
                    this._loadingMessageScheduler.schedule(this._loadingMessageTime);
                }
            }
            else {
                switch (this._state) {
                    case 0 /* HoverOperationState.Idle */:
                        this._triggerAsyncComputation();
                        this._secondWaitScheduler.cancel();
                        this._triggerSyncComputation();
                        break;
                    case 2 /* HoverOperationState.SecondWait */:
                        this._secondWaitScheduler.cancel();
                        this._triggerSyncComputation();
                        break;
                }
            }
        }
        cancel() {
            this._firstWaitScheduler.cancel();
            this._secondWaitScheduler.cancel();
            this._loadingMessageScheduler.cancel();
            if (this._asyncIterable) {
                this._asyncIterable.cancel();
                this._asyncIterable = null;
            }
            this._result = [];
            this._setState(0 /* HoverOperationState.Idle */, false);
        }
    }
    exports.HoverOperation = HoverOperation;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG92ZXJPcGVyYXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9ob3Zlci9icm93c2VyL2hvdmVyT3BlcmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXFCaEcsSUFBVyxtQkFNVjtJQU5ELFdBQVcsbUJBQW1CO1FBQzdCLDZEQUFJLENBQUE7UUFDSix1RUFBUyxDQUFBO1FBQ1QseUVBQVUsQ0FBQTtRQUNWLG1GQUFtQixDQUFBO1FBQ25CLCtHQUFpQyxDQUFBO0lBQ2xDLENBQUMsRUFOVSxtQkFBbUIsS0FBbkIsbUJBQW1CLFFBTTdCO0lBRUQsSUFBa0IsY0FHakI7SUFIRCxXQUFrQixjQUFjO1FBQy9CLHlEQUFXLENBQUE7UUFDWCw2REFBYSxDQUFBO0lBQ2QsQ0FBQyxFQUhpQixjQUFjLDhCQUFkLGNBQWMsUUFHL0I7SUFFRCxJQUFrQixnQkFHakI7SUFIRCxXQUFrQixnQkFBZ0I7UUFDakMseURBQVMsQ0FBQTtRQUNULCtEQUFZLENBQUE7SUFDYixDQUFDLEVBSGlCLGdCQUFnQixnQ0FBaEIsZ0JBQWdCLFFBR2pDO0lBRUQsTUFBYSxXQUFXO1FBQ3ZCLFlBQ2lCLEtBQVUsRUFDVixVQUFtQixFQUNuQixpQkFBMEI7WUFGMUIsVUFBSyxHQUFMLEtBQUssQ0FBSztZQUNWLGVBQVUsR0FBVixVQUFVLENBQVM7WUFDbkIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFTO1FBQ3ZDLENBQUM7S0FDTDtJQU5ELGtDQU1DO0lBRUQ7Ozs7Ozs7OztPQVNHO0lBQ0gsTUFBYSxjQUFrQixTQUFRLHNCQUFVO1FBY2hELFlBQ2tCLE9BQW9CLEVBQ3BCLFNBQTRCO1lBRTdDLEtBQUssRUFBRSxDQUFDO1lBSFMsWUFBTyxHQUFQLE9BQU8sQ0FBYTtZQUNwQixjQUFTLEdBQVQsU0FBUyxDQUFtQjtZQWQ3QixjQUFTLEdBQUcsSUFB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