/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/core/characterClassifier", "vs/editor/common/languages", "vs/editor/contrib/parameterHints/browser/provideSignatureHelp"], function (require, exports, async_1, errors_1, event_1, lifecycle_1, characterClassifier_1, languages, provideSignatureHelp_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$l0 = void 0;
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
    class $l0 extends lifecycle_1.$kc {
        static { this.a = 120; } // ms
        constructor(editor, providers, delay = $l0.a) {
            super();
            this.b = this.B(new event_1.$fd());
            this.onChangedHints = this.b.event;
            this.g = false;
            this.h = ParameterHintState.Default;
            this.j = [];
            this.m = this.B(new lifecycle_1.$lc());
            this.n = new characterClassifier_1.$Is();
            this.r = new characterClassifier_1.$Is();
            this.t = 0;
            this.c = editor;
            this.f = providers;
            this.s = new async_1.$Dg(delay);
            this.B(this.c.onDidBlurEditorWidget(() => this.cancel()));
            this.B(this.c.onDidChangeConfiguration(() => this.I()));
            this.B(this.c.onDidChangeModel(e => this.D()));
            this.B(this.c.onDidChangeModelLanguage(_ => this.D()));
            this.B(this.c.onDidChangeCursorSelection(e => this.G(e)));
            this.B(this.c.onDidChangeModelContent(e => this.H()));
            this.B(this.f.onDidChange(this.D, this));
            this.B(this.c.onDidType(text => this.F(text)));
            this.I();
            this.D();
        }
        get u() { return this.h; }
        set u(value) {
            if (this.h.type === 2 /* ParameterHintState.Type.Pending */) {
                this.h.request.cancel();
            }
            this.h = value;
        }
        cancel(silent = false) {
            this.u = ParameterHintState.Default;
            this.s.cancel();
            if (!silent) {
                this.b.fire(undefined);
            }
        }
        trigger(context, delay) {
            const model = this.c.getModel();
            if (!model || !this.f.has(model)) {
                return;
            }
            const triggerId = ++this.t;
            this.j.push(context);
            this.s.trigger(() => {
                return this.y(triggerId);
            }, delay)
                .catch(errors_1.$Y);
        }
        next() {
            if (this.u.type !== 1 /* ParameterHintState.Type.Active */) {
                return;
            }
            const length = this.u.hints.signatures.length;
            const activeSignature = this.u.hints.activeSignature;
            const last = (activeSignature % length) === (length - 1);
            const cycle = this.c.getOption(85 /* EditorOption.parameterHints */).cycle;
            // If there is only one signature, or we're on last signature of list
            if ((length < 2 || last) && !cycle) {
                this.cancel();
                return;
            }
            this.w(last && cycle ? 0 : activeSignature + 1);
        }
        previous() {
            if (this.u.type !== 1 /* ParameterHintState.Type.Active */) {
                return;
            }
            const length = this.u.hints.signatures.length;
            const activeSignature = this.u.hints.activeSignature;
            const first = activeSignature === 0;
            const cycle = this.c.getOption(85 /* EditorOption.parameterHints */).cycle;
            // If there is only one signature, or we're on first signature of list
            if ((length < 2 || first) && !cycle) {
                this.cancel();
                return;
            }
            this.w(first && cycle ? length - 1 : activeSignature - 1);
        }
        w(activeSignature) {
            if (this.u.type !== 1 /* ParameterHintState.Type.Active */) {
                return;
            }
            this.u = new ParameterHintState.Active({ ...this.u.hints, activeSignature });
            this.b.fire(this.u.hints);
        }
        async y(triggerId) {
            const isRetrigger = this.u.type === 1 /* ParameterHintState.Type.Active */ || this.u.type === 2 /* ParameterHintState.Type.Pending */;
            const activeSignatureHelp = this.z();
            this.cancel(true);
            if (this.j.length === 0) {
                return false;
            }
            const context = this.j.reduce(mergeTriggerContexts);
            this.j = [];
            const triggerContext = {
                triggerKind: context.triggerKind,
                triggerCharacter: context.triggerCharacter,
                isRetrigger: isRetrigger,
                activeSignatureHelp: activeSignatureHelp
            };
            if (!this.c.hasModel()) {
                return false;
            }
            const model = this.c.getModel();
            const position = this.c.getPosition();
            this.u = new ParameterHintState.Pending((0, async_1.$ug)(token => (0, provideSignatureHelp_1.$k0)(this.f, model, position, triggerContext, token)), activeSignatureHelp);
            try {
                const result = await this.u.request;
                // Check that we are still resolving the correct signature help
                if (triggerId !== this.t) {
                    result?.dispose();
                    return false;
                }
                if (!result || !result.value.signatures || result.value.signatures.length === 0) {
                    result?.dispose();
                    this.m.clear();
                    this.cancel();
                    return false;
                }
                else {
                    this.u = new ParameterHintState.Active(result.value);
                    this.m.value = result;
                    this.b.fire(this.u.hints);
                    return true;
                }
            }
            catch (error) {
                if (triggerId === this.t) {
                    this.u = ParameterHintState.Default;
                }
                (0, errors_1.$Y)(error);
                return false;
            }
        }
        z() {
            switch (this.u.type) {
                case 1 /* ParameterHintState.Type.Active */: return this.u.hints;
                case 2 /* ParameterHintState.Type.Pending */: return this.u.previouslyActiveHints;
                default: return undefined;
            }
        }
        get C() {
            return this.u.type === 1 /* ParameterHintState.Type.Active */
                || this.u.type === 2 /* ParameterHintState.Type.Pending */
                || this.s.isTriggered();
        }
        D() {
            this.cancel();
            this.n.clear();
            this.r.clear();
            const model = this.c.getModel();
            if (!model) {
                return;
            }
            for (const support of this.f.ordered(model)) {
                for (const ch of support.signatureHelpTriggerCharacters || []) {
                    if (ch.length) {
                        const charCode = ch.charCodeAt(0);
                        this.n.add(charCode);
                        // All trigger characters are also considered retrigger characters
                        this.r.add(charCode);
                    }
                }
                for (const ch of support.signatureHelpRetriggerCharacters || []) {
                    if (ch.length) {
                        this.r.add(ch.charCodeAt(0));
                    }
                }
            }
        }
        F(text) {
            if (!this.g) {
                return;
            }
            const lastCharIndex = text.length - 1;
            const triggerCharCode = text.charCodeAt(lastCharIndex);
            if (this.n.has(triggerCharCode) || this.C && this.r.has(triggerCharCode)) {
                this.trigger({
                    triggerKind: languages.SignatureHelpTriggerKind.TriggerCharacter,
                    triggerCharacter: text.charAt(lastCharIndex),
                });
            }
        }
        G(e) {
            if (e.source === 'mouse') {
                this.cancel();
            }
            else if (this.C) {
                this.trigger({ triggerKind: languages.SignatureHelpTriggerKind.ContentChange });
            }
        }
        H() {
            if (this.C) {
                this.trigger({ triggerKind: languages.SignatureHelpTriggerKind.ContentChange });
            }
        }
        I() {
            this.g = this.c.getOption(85 /* EditorOption.parameterHints */).enabled;
            if (!this.g) {
                this.cancel();
            }
        }
        dispose() {
            this.cancel(true);
            super.dispose();
        }
    }
    exports.$l0 = $l0;
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
//# sourceMappingURL=parameterHintsModel.js.map