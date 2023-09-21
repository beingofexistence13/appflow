/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/core/characterClassifier", "vs/editor/common/languages", "vs/editor/contrib/parameterHints/browser/provideSignatureHelp"], function (require, exports, async_1, errors_1, event_1, lifecycle_1, characterClassifier_1, languages, provideSignatureHelp_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ParameterHintsModel = void 0;
    var ParameterHintState;
    (function (ParameterHintState) {
        let Type;
        (function (Type) {
            Type[Type["Default"] = 0] = "Default";
            Type[Type["Active"] = 1] = "Active";
            Type[Type["Pending"] = 2] = "Pending";
        })(Type = ParameterHintState.Type || (ParameterHintState.Type = {}));
        ParameterHintState.Default = { type: 0 /* Type.Default */ };
        class Pending {
            constructor(request, previouslyActiveHints) {
                this.request = request;
                this.previouslyActiveHints = previouslyActiveHints;
                this.type = 2 /* Type.Pending */;
            }
        }
        ParameterHintState.Pending = Pending;
        class Active {
            constructor(hints) {
                this.hints = hints;
                this.type = 1 /* Type.Active */;
            }
        }
        ParameterHintState.Active = Active;
    })(ParameterHintState || (ParameterHintState = {}));
    class ParameterHintsModel extends lifecycle_1.Disposable {
        static { this.DEFAULT_DELAY = 120; } // ms
        constructor(editor, providers, delay = ParameterHintsModel.DEFAULT_DELAY) {
            super();
            this._onChangedHints = this._register(new event_1.Emitter());
            this.onChangedHints = this._onChangedHints.event;
            this.triggerOnType = false;
            this._state = ParameterHintState.Default;
            this._pendingTriggers = [];
            this._lastSignatureHelpResult = this._register(new lifecycle_1.MutableDisposable());
            this.triggerChars = new characterClassifier_1.CharacterSet();
            this.retriggerChars = new characterClassifier_1.CharacterSet();
            this.triggerId = 0;
            this.editor = editor;
            this.providers = providers;
            this.throttledDelayer = new async_1.Delayer(delay);
            this._register(this.editor.onDidBlurEditorWidget(() => this.cancel()));
            this._register(this.editor.onDidChangeConfiguration(() => this.onEditorConfigurationChange()));
            this._register(this.editor.onDidChangeModel(e => this.onModelChanged()));
            this._register(this.editor.onDidChangeModelLanguage(_ => this.onModelChanged()));
            this._register(this.editor.onDidChangeCursorSelection(e => this.onCursorChange(e)));
            this._register(this.editor.onDidChangeModelContent(e => this.onModelContentChange()));
            this._register(this.providers.onDidChange(this.onModelChanged, this));
            this._register(this.editor.onDidType(text => this.onDidType(text)));
            this.onEditorConfigurationChange();
            this.onModelChanged();
        }
        get state() { return this._state; }
        set state(value) {
            if (this._state.type === 2 /* ParameterHintState.Type.Pending */) {
                this._state.request.cancel();
            }
            this._state = value;
        }
        cancel(silent = false) {
            this.state = ParameterHintState.Default;
            this.throttledDelayer.cancel();
            if (!silent) {
                this._onChangedHints.fire(undefined);
            }
        }
        trigger(context, delay) {
            const model = this.editor.getModel();
            if (!model || !this.providers.has(model)) {
                return;
            }
            const triggerId = ++this.triggerId;
            this._pendingTriggers.push(context);
            this.throttledDelayer.trigger(() => {
                return this.doTrigger(triggerId);
            }, delay)
                .catch(errors_1.onUnexpectedError);
        }
        next() {
            if (this.state.type !== 1 /* ParameterHintState.Type.Active */) {
                return;
            }
            const length = this.state.hints.signatures.length;
            const activeSignature = this.state.hints.activeSignature;
            const last = (activeSignature % length) === (length - 1);
            const cycle = this.editor.getOption(85 /* EditorOption.parameterHints */).cycle;
            // If there is only one signature, or we're on last signature of list
            if ((length < 2 || last) && !cycle) {
                this.cancel();
                return;
            }
            this.updateActiveSignature(last && cycle ? 0 : activeSignature + 1);
        }
        previous() {
            if (this.state.type !== 1 /* ParameterHintState.Type.Active */) {
                return;
            }
            const length = this.state.hints.signatures.length;
            const activeSignature = this.state.hints.activeSignature;
            const first = activeSignature === 0;
            const cycle = this.editor.getOption(85 /* EditorOption.parameterHints */).cycle;
            // If there is only one signature, or we're on first signature of list
            if ((length < 2 || first) && !cycle) {
                this.cancel();
                return;
            }
            this.updateActiveSignature(first && cycle ? length - 1 : activeSignature - 1);
        }
        updateActiveSignature(activeSignature) {
            if (this.state.type !== 1 /* ParameterHintState.Type.Active */) {
                return;
            }
            this.state = new ParameterHintState.Active({ ...this.state.hints, activeSignature });
            this._onChangedHints.fire(this.state.hints);
        }
        async doTrigger(triggerId) {
            const isRetrigger = this.state.type === 1 /* ParameterHintState.Type.Active */ || this.state.type === 2 /* ParameterHintState.Type.Pending */;
            const activeSignatureHelp = this.getLastActiveHints();
            this.cancel(true);
            if (this._pendingTriggers.length === 0) {
                return false;
            }
            const context = this._pendingTriggers.reduce(mergeTriggerContexts);
            this._pendingTriggers = [];
            const triggerContext = {
                triggerKind: context.triggerKind,
                triggerCharacter: context.triggerCharacter,
                isRetrigger: isRetrigger,
                activeSignatureHelp: activeSignatureHelp
            };
            if (!this.editor.hasModel()) {
                return false;
            }
            const model = this.editor.getModel();
            const position = this.editor.getPosition();
            this.state = new ParameterHintState.Pending((0, async_1.createCancelablePromise)(token => (0, provideSignatureHelp_1.provideSignatureHelp)(this.providers, model, position, triggerContext, token)), activeSignatureHelp);
            try {
                const result = await this.state.request;
                // Check that we are still resolving the correct signature help
                if (triggerId !== this.triggerId) {
                    result?.dispose();
                    return false;
                }
                if (!result || !result.value.signatures || result.value.signatures.length === 0) {
                    result?.dispose();
                    this._lastSignatureHelpResult.clear();
                    this.cancel();
                    return false;
                }
                else {
                    this.state = new ParameterHintState.Active(result.value);
                    this._lastSignatureHelpResult.value = result;
                    this._onChangedHints.fire(this.state.hints);
                    return true;
                }
            }
            catch (error) {
                if (triggerId === this.triggerId) {
                    this.state = ParameterHintState.Default;
                }
                (0, errors_1.onUnexpectedError)(error);
                return false;
            }
        }
        getLastActiveHints() {
            switch (this.state.type) {
                case 1 /* ParameterHintState.Type.Active */: return this.state.hints;
                case 2 /* ParameterHintState.Type.Pending */: return this.state.previouslyActiveHints;
                default: return undefined;
            }
        }
        get isTriggered() {
            return this.state.type === 1 /* ParameterHintState.Type.Active */
                || this.state.type === 2 /* ParameterHintState.Type.Pending */
                || this.throttledDelayer.isTriggered();
        }
        onModelChanged() {
            this.cancel();
            this.triggerChars.clear();
            this.retriggerChars.clear();
            const model = this.editor.getModel();
            if (!model) {
                return;
            }
            for (const support of this.providers.ordered(model)) {
                for (const ch of support.signatureHelpTriggerCharacters || []) {
                    if (ch.length) {
                        const charCode = ch.charCodeAt(0);
                        this.triggerChars.add(charCode);
                        // All trigger characters are also considered retrigger characters
                        this.retriggerChars.add(charCode);
                    }
                }
                for (const ch of support.signatureHelpRetriggerCharacters || []) {
                    if (ch.length) {
                        this.retriggerChars.add(ch.charCodeAt(0));
                    }
                }
            }
        }
        onDidType(text) {
            if (!this.triggerOnType) {
                return;
            }
            const lastCharIndex = text.length - 1;
            const triggerCharCode = text.charCodeAt(lastCharIndex);
            if (this.triggerChars.has(triggerCharCode) || this.isTriggered && this.retriggerChars.has(triggerCharCode)) {
                this.trigger({
                    triggerKind: languages.SignatureHelpTriggerKind.TriggerCharacter,
                    triggerCharacter: text.charAt(lastCharIndex),
                });
            }
        }
        onCursorChange(e) {
            if (e.source === 'mouse') {
                this.cancel();
            }
            else if (this.isTriggered) {
                this.trigger({ triggerKind: languages.SignatureHelpTriggerKind.ContentChange });
            }
        }
        onModelContentChange() {
            if (this.isTriggered) {
                this.trigger({ triggerKind: languages.SignatureHelpTriggerKind.ContentChange });
            }
        }
        onEditorConfigurationChange() {
            this.triggerOnType = this.editor.getOption(85 /* EditorOption.parameterHints */).enabled;
            if (!this.triggerOnType) {
                this.cancel();
            }
        }
        dispose() {
            this.cancel(true);
            super.dispose();
        }
    }
    exports.ParameterHintsModel = ParameterHintsModel;
    function mergeTriggerContexts(previous, current) {
        switch (current.triggerKind) {
            case languages.SignatureHelpTriggerKind.Invoke:
                // Invoke overrides previous triggers.
                return current;
            case languages.SignatureHelpTriggerKind.ContentChange:
                // Ignore content changes triggers
                return previous;
            case languages.SignatureHelpTriggerKind.TriggerCharacter:
            default:
                return current;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYW1ldGVySGludHNNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL3BhcmFtZXRlckhpbnRzL2Jyb3dzZXIvcGFyYW1ldGVySGludHNNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFtQmhHLElBQVUsa0JBQWtCLENBeUIzQjtJQXpCRCxXQUFVLGtCQUFrQjtRQUMzQixJQUFrQixJQUlqQjtRQUpELFdBQWtCLElBQUk7WUFDckIscUNBQU8sQ0FBQTtZQUNQLG1DQUFNLENBQUE7WUFDTixxQ0FBTyxDQUFBO1FBQ1IsQ0FBQyxFQUppQixJQUFJLEdBQUosdUJBQUksS0FBSix1QkFBSSxRQUlyQjtRQUVZLDBCQUFPLEdBQUcsRUFBRSxJQUFJLHNCQUFjLEVBQVcsQ0FBQztRQUV2RCxNQUFhLE9BQU87WUFFbkIsWUFDVSxPQUE0RSxFQUM1RSxxQkFBMEQ7Z0JBRDFELFlBQU8sR0FBUCxPQUFPLENBQXFFO2dCQUM1RSwwQkFBcUIsR0FBckIscUJBQXFCLENBQXFDO2dCQUgzRCxTQUFJLHdCQUFnQjtZQUl6QixDQUFDO1NBQ0w7UUFOWSwwQkFBTyxVQU1uQixDQUFBO1FBRUQsTUFBYSxNQUFNO1lBRWxCLFlBQ1UsS0FBOEI7Z0JBQTlCLFVBQUssR0FBTCxLQUFLLENBQXlCO2dCQUYvQixTQUFJLHVCQUFlO1lBR3hCLENBQUM7U0FDTDtRQUxZLHlCQUFNLFNBS2xCLENBQUE7SUFHRixDQUFDLEVBekJTLGtCQUFrQixLQUFsQixrQkFBa0IsUUF5QjNCO0lBRUQsTUFBYSxtQkFBb0IsU0FBUSxzQkFBVTtpQkFFMUIsa0JBQWEsR0FBRyxHQUFHLEFBQU4sQ0FBTyxHQUFDLEtBQUs7UUFtQmxELFlBQ0MsTUFBbUIsRUFDbkIsU0FBbUUsRUFDbkUsUUFBZ0IsbUJBQW1CLENBQUMsYUFBYTtZQUVqRCxLQUFLLEVBQUUsQ0FB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