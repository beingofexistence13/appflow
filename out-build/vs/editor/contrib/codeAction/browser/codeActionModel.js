/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/platform/contextkey/common/contextkey", "vs/platform/progress/common/progress", "../common/types", "./codeAction"], function (require, exports, async_1, errors_1, event_1, lifecycle_1, resources_1, contextkey_1, progress_1, types_1, codeAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$P2 = exports.CodeActionsState = exports.$O2 = void 0;
    exports.$O2 = new contextkey_1.$2i('supportedCodeAction', '');
    class CodeActionOracle extends lifecycle_1.$kc {
        constructor(b, c, f, g = 250) {
            super();
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.a = this.B(new async_1.$Qg());
            this.B(this.c.onMarkerChanged(e => this.h(e)));
            this.B(this.b.onDidChangeCursorPosition(() => this.j()));
        }
        trigger(trigger) {
            const selection = this.m(trigger);
            this.f(selection ? { trigger, selection } : undefined);
        }
        h(resources) {
            const model = this.b.getModel();
            if (model && resources.some(resource => (0, resources_1.$bg)(resource, model.uri))) {
                this.j();
            }
        }
        j() {
            this.a.cancelAndSet(() => {
                this.trigger({ type: 2 /* CodeActionTriggerType.Auto */, triggerAction: types_1.CodeActionTriggerSource.Default });
            }, this.g);
        }
        m(trigger) {
            if (!this.b.hasModel()) {
                return undefined;
            }
            const model = this.b.getModel();
            const selection = this.b.getSelection();
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
            constructor(trigger, position, a) {
                this.trigger = trigger;
                this.position = position;
                this.a = a;
                this.type = 1 /* Type.Triggered */;
                this.actions = a.catch((e) => {
                    if ((0, errors_1.$2)(e)) {
                        return emptyCodeActionSet;
                    }
                    throw e;
                });
            }
            cancel() {
                this.a.cancel();
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
    class $P2 extends lifecycle_1.$kc {
        constructor(h, j, m, contextKeyService, n) {
            super();
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.a = this.B(new lifecycle_1.$lc());
            this.b = CodeActionsState.Empty;
            this.f = this.B(new event_1.$fd());
            this.onDidChangeState = this.f.event;
            this.g = false;
            this.c = exports.$O2.bindTo(contextKeyService);
            this.B(this.h.onDidChangeModel(() => this.r()));
            this.B(this.h.onDidChangeModelLanguage(() => this.r()));
            this.B(this.j.onDidChange(() => this.r()));
            this.r();
        }
        dispose() {
            if (this.g) {
                return;
            }
            this.g = true;
            super.dispose();
            this.s(CodeActionsState.Empty, true);
        }
        r() {
            if (this.g) {
                return;
            }
            this.a.value = undefined;
            this.s(CodeActionsState.Empty);
            const model = this.h.getModel();
            if (model
                && this.j.has(model)
                && !this.h.getOption(90 /* EditorOption.readOnly */)) {
                const supportedActions = this.j.all(model).flatMap(provider => provider.providedCodeActionKinds ?? []);
                this.c.set(supportedActions.join(' '));
                this.a.value = new CodeActionOracle(this.h, this.m, trigger => {
                    if (!trigger) {
                        this.s(CodeActionsState.Empty);
                        return;
                    }
                    const actions = (0, async_1.$ug)(token => (0, codeAction_1.$I1)(this.j, model, trigger.selection, trigger.trigger, progress_1.$4u.None, token));
                    if (trigger.trigger.type === 1 /* CodeActionTriggerType.Invoke */) {
                        this.n?.showWhile(actions, 250);
                    }
                    this.s(new CodeActionsState.Triggered(trigger.trigger, trigger.selection.getStartPosition(), actions));
                }, undefined);
                this.a.value.trigger({ type: 2 /* CodeActionTriggerType.Auto */, triggerAction: types_1.CodeActionTriggerSource.Default });
            }
            else {
                this.c.reset();
            }
        }
        trigger(trigger) {
            this.a.value?.trigger(trigger);
        }
        s(newState, skipNotify) {
            if (newState === this.b) {
                return;
            }
            // Cancel old request
            if (this.b.type === 1 /* CodeActionsState.Type.Triggered */) {
                this.b.cancel();
            }
            this.b = newState;
            if (!skipNotify && !this.g) {
                this.f.fire(newState);
            }
        }
    }
    exports.$P2 = $P2;
});
//# sourceMappingURL=codeActionModel.js.map