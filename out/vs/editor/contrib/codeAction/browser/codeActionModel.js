/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/platform/contextkey/common/contextkey", "vs/platform/progress/common/progress", "../common/types", "./codeAction"], function (require, exports, async_1, errors_1, event_1, lifecycle_1, resources_1, contextkey_1, progress_1, types_1, codeAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeActionModel = exports.CodeActionsState = exports.SUPPORTED_CODE_ACTIONS = void 0;
    exports.SUPPORTED_CODE_ACTIONS = new contextkey_1.RawContextKey('supportedCodeAction', '');
    class CodeActionOracle extends lifecycle_1.Disposable {
        constructor(_editor, _markerService, _signalChange, _delay = 250) {
            super();
            this._editor = _editor;
            this._markerService = _markerService;
            this._signalChange = _signalChange;
            this._delay = _delay;
            this._autoTriggerTimer = this._register(new async_1.TimeoutTimer());
            this._register(this._markerService.onMarkerChanged(e => this._onMarkerChanges(e)));
            this._register(this._editor.onDidChangeCursorPosition(() => this._tryAutoTrigger()));
        }
        trigger(trigger) {
            const selection = this._getRangeOfSelectionUnlessWhitespaceEnclosed(trigger);
            this._signalChange(selection ? { trigger, selection } : undefined);
        }
        _onMarkerChanges(resources) {
            const model = this._editor.getModel();
            if (model && resources.some(resource => (0, resources_1.isEqual)(resource, model.uri))) {
                this._tryAutoTrigger();
            }
        }
        _tryAutoTrigger() {
            this._autoTriggerTimer.cancelAndSet(() => {
                this.trigger({ type: 2 /* CodeActionTriggerType.Auto */, triggerAction: types_1.CodeActionTriggerSource.Default });
            }, this._delay);
        }
        _getRangeOfSelectionUnlessWhitespaceEnclosed(trigger) {
            if (!this._editor.hasModel()) {
                return undefined;
            }
            const model = this._editor.getModel();
            const selection = this._editor.getSelection();
            if (selection.isEmpty() && trigger.type === 2 /* CodeActionTriggerType.Auto */) {
                const { lineNumber, column } = selection.getPosition();
                const line = model.getLineContent(lineNumber);
                if (line.length === 0) {
                    // empty line
                    return undefined;
                }
                else if (column === 1) {
                    // look only right
                    if (/\s/.test(line[0])) {
                        return undefined;
                    }
                }
                else if (column === model.getLineMaxColumn(lineNumber)) {
                    // look only left
                    if (/\s/.test(line[line.length - 1])) {
                        return undefined;
                    }
                }
                else {
                    // look left and right
                    if (/\s/.test(line[column - 2]) && /\s/.test(line[column - 1])) {
                        return undefined;
                    }
                }
            }
            return selection;
        }
    }
    var CodeActionsState;
    (function (CodeActionsState) {
        let Type;
        (function (Type) {
            Type[Type["Empty"] = 0] = "Empty";
            Type[Type["Triggered"] = 1] = "Triggered";
        })(Type = CodeActionsState.Type || (CodeActionsState.Type = {}));
        CodeActionsState.Empty = { type: 0 /* Type.Empty */ };
        class Triggered {
            constructor(trigger, position, _cancellablePromise) {
                this.trigger = trigger;
                this.position = position;
                this._cancellablePromise = _cancellablePromise;
                this.type = 1 /* Type.Triggered */;
                this.actions = _cancellablePromise.catch((e) => {
                    if ((0, errors_1.isCancellationError)(e)) {
                        return emptyCodeActionSet;
                    }
                    throw e;
                });
            }
            cancel() {
                this._cancellablePromise.cancel();
            }
        }
        CodeActionsState.Triggered = Triggered;
    })(CodeActionsState || (exports.CodeActionsState = CodeActionsState = {}));
    const emptyCodeActionSet = Object.freeze({
        allActions: [],
        validActions: [],
        dispose: () => { },
        documentation: [],
        hasAutoFix: false
    });
    class CodeActionModel extends lifecycle_1.Disposable {
        constructor(_editor, _registry, _markerService, contextKeyService, _progressService) {
            super();
            this._editor = _editor;
            this._registry = _registry;
            this._markerService = _markerService;
            this._progressService = _progressService;
            this._codeActionOracle = this._register(new lifecycle_1.MutableDisposable());
            this._state = CodeActionsState.Empty;
            this._onDidChangeState = this._register(new event_1.Emitter());
            this.onDidChangeState = this._onDidChangeState.event;
            this._disposed = false;
            this._supportedCodeActions = exports.SUPPORTED_CODE_ACTIONS.bindTo(contextKeyService);
            this._register(this._editor.onDidChangeModel(() => this._update()));
            this._register(this._editor.onDidChangeModelLanguage(() => this._update()));
            this._register(this._registry.onDidChange(() => this._update()));
            this._update();
        }
        dispose() {
            if (this._disposed) {
                return;
            }
            this._disposed = true;
            super.dispose();
            this.setState(CodeActionsState.Empty, true);
        }
        _update() {
            if (this._disposed) {
                return;
            }
            this._codeActionOracle.value = undefined;
            this.setState(CodeActionsState.Empty);
            const model = this._editor.getModel();
            if (model
                && this._registry.has(model)
                && !this._editor.getOption(90 /* EditorOption.readOnly */)) {
                const supportedActions = this._registry.all(model).flatMap(provider => provider.providedCodeActionKinds ?? []);
                this._supportedCodeActions.set(supportedActions.join(' '));
                this._codeActionOracle.value = new CodeActionOracle(this._editor, this._markerService, trigger => {
                    if (!trigger) {
                        this.setState(CodeActionsState.Empty);
                        return;
                    }
                    const actions = (0, async_1.createCancelablePromise)(token => (0, codeAction_1.getCodeActions)(this._registry, model, trigger.selection, trigger.trigger, progress_1.Progress.None, token));
                    if (trigger.trigger.type === 1 /* CodeActionTriggerType.Invoke */) {
                        this._progressService?.showWhile(actions, 250);
                    }
                    this.setState(new CodeActionsState.Triggered(trigger.trigger, trigger.selection.getStartPosition(), actions));
                }, undefined);
                this._codeActionOracle.value.trigger({ type: 2 /* CodeActionTriggerType.Auto */, triggerAction: types_1.CodeActionTriggerSource.Default });
            }
            else {
                this._supportedCodeActions.reset();
            }
        }
        trigger(trigger) {
            this._codeActionOracle.value?.trigger(trigger);
        }
        setState(newState, skipNotify) {
            if (newState === this._state) {
                return;
            }
            // Cancel old request
            if (this._state.type === 1 /* CodeActionsState.Type.Triggered */) {
                this._state.cancel();
            }
            this._state = newState;
            if (!skipNotify && !this._disposed) {
                this._onDidChangeState.fire(newState);
            }
        }
    }
    exports.CodeActionModel = CodeActionModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUFjdGlvbk1vZGVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvY29kZUFjdGlvbi9icm93c2VyL2NvZGVBY3Rpb25Nb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFvQm5GLFFBQUEsc0JBQXNCLEdBQUcsSUFBSSwwQkFBYSxDQUFTLHFCQUFxQixFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBTzNGLE1BQU0sZ0JBQWlCLFNBQVEsc0JBQVU7UUFJeEMsWUFDa0IsT0FBb0IsRUFDcEIsY0FBOEIsRUFDOUIsYUFBbUUsRUFDbkUsU0FBaUIsR0FBRztZQUVyQyxLQUFLLEVBQUUsQ0FBQztZQUxTLFlBQU8sR0FBUCxPQUFPLENBQWE7WUFDcEIsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBQzlCLGtCQUFhLEdBQWIsYUFBYSxDQUFzRDtZQUNuRSxXQUFNLEdBQU4sTUFBTSxDQUFjO1lBTnJCLHNCQUFpQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxvQkFBWSxFQUFFLENBQUMsQ0FBQztZQVN2RSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuRixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMseUJBQXlCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN0RixDQUFDO1FBRU0sT0FBTyxDQUFDLE9BQTBCO1lBQ3hDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyw0Q0FBNEMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM3RSxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FB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