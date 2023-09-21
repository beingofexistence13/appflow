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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/editor/contrib/inlayHints/browser/inlayHints", "vs/editor/contrib/inlayHints/browser/inlayHintsController", "vs/nls!vs/workbench/contrib/inlayHints/browser/inlayHintsAccessibilty", "vs/platform/actions/common/actions", "vs/platform/audioCues/browser/audioCueService", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/opener/browser/link"], function (require, exports, dom, cancellation_1, lifecycle_1, editorExtensions_1, editorContextKeys_1, inlayHints_1, inlayHintsController_1, nls_1, actions_1, audioCueService_1, contextkey_1, instantiation_1, link_1) {
    "use strict";
    var $pYb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$pYb = void 0;
    let $pYb = class $pYb {
        static { $pYb_1 = this; }
        static { this.IsReading = new contextkey_1.$2i('isReadingLineWithInlayHints', false, { type: 'boolean', description: (0, nls_1.localize)(0, null) }); }
        static { this.ID = 'editor.contrib.InlayHintsAccessibility'; }
        static get(editor) {
            return editor.getContribution($pYb_1.ID) ?? undefined;
        }
        constructor(d, contextKeyService, e, f) {
            this.d = d;
            this.e = e;
            this.f = f;
            this.c = new lifecycle_1.$jc();
            this.a = document.createElement('span');
            this.a.style.position = 'fixed';
            this.a.className = 'inlayhint-accessibility-element';
            this.a.tabIndex = 0;
            this.a.setAttribute('aria-description', (0, nls_1.localize)(1, null));
            this.b = $pYb_1.IsReading.bindTo(contextKeyService);
        }
        dispose() {
            this.c.dispose();
            this.b.reset();
            this.a.remove();
        }
        g() {
            dom.$lO(this.a);
            this.c.clear();
            this.b.reset();
        }
        async h(line, hints) {
            this.c.clear();
            if (!this.a.isConnected) {
                this.d.getDomNode()?.appendChild(this.a);
            }
            if (!this.d.hasModel() || !this.a.isConnected) {
                this.b.set(false);
                return;
            }
            const cts = new cancellation_1.$pd();
            this.c.add(cts);
            for (const hint of hints) {
                await hint.resolve(cts.token);
            }
            if (cts.token.isCancellationRequested) {
                return;
            }
            const model = this.d.getModel();
            // const text = this._editor.getModel().getLineContent(line);
            const newChildren = [];
            let start = 0;
            let tooLongToRead = false;
            for (const item of hints) {
                // text
                const part = model.getValueInRange({ startLineNumber: line, startColumn: start + 1, endLineNumber: line, endColumn: item.hint.position.column });
                if (part.length > 0) {
                    newChildren.push(part);
                    start = item.hint.position.column - 1;
                }
                // check length
                if (start > 750) {
                    newChildren.push('…');
                    tooLongToRead = true;
                    break;
                }
                // hint
                const em = document.createElement('em');
                const { label } = item.hint;
                if (typeof label === 'string') {
                    em.innerText = label;
                }
                else {
                    for (const part of label) {
                        if (part.command) {
                            const link = this.f.createInstance(link_1.$40, em, { href: (0, inlayHints_1.$n9)(part.command), label: part.label, title: part.command.title }, undefined);
                            this.c.add(link);
                        }
                        else {
                            em.innerText += part.label;
                        }
                    }
                }
                newChildren.push(em);
            }
            // trailing text
            if (!tooLongToRead) {
                newChildren.push(model.getValueInRange({ startLineNumber: line, startColumn: start + 1, endLineNumber: line, endColumn: Number.MAX_SAFE_INTEGER }));
            }
            dom.$_O(this.a, ...newChildren);
            this.a.focus();
            this.b.set(true);
            // reset on blur
            this.c.add(dom.$nO(this.a, 'focusout', () => {
                this.g();
            }));
        }
        startInlayHintsReading() {
            if (!this.d.hasModel()) {
                return;
            }
            const line = this.d.getPosition().lineNumber;
            const hints = inlayHintsController_1.$r9.get(this.d)?.getInlayHintsForLine(line);
            if (!hints || hints.length === 0) {
                this.e.playAudioCue(audioCueService_1.$wZ.noInlayHints);
            }
            else {
                this.h(line, hints);
            }
        }
        stopInlayHintsReading() {
            this.g();
            this.d.focus();
        }
    };
    exports.$pYb = $pYb;
    exports.$pYb = $pYb = $pYb_1 = __decorate([
        __param(1, contextkey_1.$3i),
        __param(2, audioCueService_1.$sZ),
        __param(3, instantiation_1.$Ah)
    ], $pYb);
    (0, actions_1.$Xu)(class StartReadHints extends editorExtensions_1.$uV {
        constructor() {
            super({
                id: 'inlayHints.startReadingLineWithHint',
                title: {
                    value: (0, nls_1.localize)(2, null),
                    original: 'Read Line With Inline Hints'
                },
                precondition: editorContextKeys_1.EditorContextKeys.hasInlayHintsProvider,
                f1: true
            });
        }
        runEditorCommand(_accessor, editor) {
            const ctrl = $pYb.get(editor);
            ctrl?.startInlayHintsReading();
        }
    });
    (0, actions_1.$Xu)(class StopReadHints extends editorExtensions_1.$uV {
        constructor() {
            super({
                id: 'inlayHints.stopReadingLineWithHint',
                title: {
                    value: (0, nls_1.localize)(3, null),
                    original: 'Stop Inlay Hints Reading'
                },
                precondition: $pYb.IsReading,
                f1: true,
                keybinding: {
                    weight: 100 /* KeybindingWeight.EditorContrib */,
                    primary: 9 /* KeyCode.Escape */
                }
            });
        }
        runEditorCommand(_accessor, editor) {
            const ctrl = $pYb.get(editor);
            ctrl?.stopInlayHintsReading();
        }
    });
    (0, editorExtensions_1.$AV)($pYb.ID, $pYb, 4 /* EditorContributionInstantiation.Lazy */);
});
//# sourceMappingURL=inlayHintsAccessibilty.js.map