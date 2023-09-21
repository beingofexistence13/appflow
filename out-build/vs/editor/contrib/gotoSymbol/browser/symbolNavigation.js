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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/range", "vs/nls!vs/editor/contrib/gotoSymbol/browser/symbolNavigation", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/notification/common/notification"], function (require, exports, event_1, lifecycle_1, resources_1, editorExtensions_1, codeEditorService_1, range_1, nls_1, contextkey_1, extensions_1, instantiation_1, keybinding_1, keybindingsRegistry_1, notification_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$O4 = exports.$N4 = void 0;
    exports.$N4 = new contextkey_1.$2i('hasSymbols', false, (0, nls_1.localize)(0, null));
    exports.$O4 = (0, instantiation_1.$Bh)('ISymbolNavigationService');
    let SymbolNavigationService = class SymbolNavigationService {
        constructor(contextKeyService, g, h, i) {
            this.g = g;
            this.h = h;
            this.i = i;
            this.b = undefined;
            this.c = -1;
            this.f = false;
            this.a = exports.$N4.bindTo(contextKeyService);
        }
        reset() {
            this.a.reset();
            this.d?.dispose();
            this.e?.dispose();
            this.b = undefined;
            this.c = -1;
        }
        put(anchor) {
            const refModel = anchor.parent.parent;
            if (refModel.references.length <= 1) {
                this.reset();
                return;
            }
            this.b = refModel;
            this.c = refModel.references.indexOf(anchor);
            this.a.set(true);
            this.j();
            const editorState = new EditorState(this.g);
            const listener = editorState.onDidChange(_ => {
                if (this.f) {
                    return;
                }
                const editor = this.g.getActiveCodeEditor();
                if (!editor) {
                    return;
                }
                const model = editor.getModel();
                const position = editor.getPosition();
                if (!model || !position) {
                    return;
                }
                let seenUri = false;
                let seenPosition = false;
                for (const reference of refModel.references) {
                    if ((0, resources_1.$bg)(reference.uri, model.uri)) {
                        seenUri = true;
                        seenPosition = seenPosition || range_1.$ks.containsPosition(reference.range, position);
                    }
                    else if (seenUri) {
                        break;
                    }
                }
                if (!seenUri || !seenPosition) {
                    this.reset();
                }
            });
            this.d = (0, lifecycle_1.$hc)(editorState, listener);
        }
        revealNext(source) {
            if (!this.b) {
                return Promise.resolve();
            }
            // get next result and advance
            this.c += 1;
            this.c %= this.b.references.length;
            const reference = this.b.references[this.c];
            // status
            this.j();
            // open editor, ignore events while that happens
            this.f = true;
            return this.g.openCodeEditor({
                resource: reference.uri,
                options: {
                    selection: range_1.$ks.collapseToStart(reference.range),
                    selectionRevealType: 3 /* TextEditorSelectionRevealType.NearTopIfOutsideViewport */
                }
            }, source).finally(() => {
                this.f = false;
            });
        }
        j() {
            this.e?.dispose();
            const kb = this.i.lookupKeybinding('editor.gotoNextSymbolFromResult');
            const message = kb
                ? (0, nls_1.localize)(1, null, this.c + 1, this.b.references.length, kb.getLabel())
                : (0, nls_1.localize)(2, null, this.c + 1, this.b.references.length);
            this.e = this.h.status(message);
        }
    };
    SymbolNavigationService = __decorate([
        __param(0, contextkey_1.$3i),
        __param(1, codeEditorService_1.$nV),
        __param(2, notification_1.$Yu),
        __param(3, keybinding_1.$2D)
    ], SymbolNavigationService);
    (0, extensions_1.$mr)(exports.$O4, SymbolNavigationService, 1 /* InstantiationType.Delayed */);
    (0, editorExtensions_1.$wV)(new class extends editorExtensions_1.$rV {
        constructor() {
            super({
                id: 'editor.gotoNextSymbolFromResult',
                precondition: exports.$N4,
                kbOpts: {
                    weight: 100 /* KeybindingWeight.EditorContrib */,
                    primary: 70 /* KeyCode.F12 */
                }
            });
        }
        runEditorCommand(accessor, editor) {
            return accessor.get(exports.$O4).revealNext(editor);
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'editor.gotoNextSymbolFromResult.cancel',
        weight: 100 /* KeybindingWeight.EditorContrib */,
        when: exports.$N4,
        primary: 9 /* KeyCode.Escape */,
        handler(accessor) {
            accessor.get(exports.$O4).reset();
        }
    });
    //
    let EditorState = class EditorState {
        constructor(editorService) {
            this.a = new Map();
            this.b = new lifecycle_1.$jc();
            this.c = new event_1.$fd();
            this.onDidChange = this.c.event;
            this.b.add(editorService.onCodeEditorRemove(this.e, this));
            this.b.add(editorService.onCodeEditorAdd(this.d, this));
            editorService.listCodeEditors().forEach(this.d, this);
        }
        dispose() {
            this.b.dispose();
            this.c.dispose();
            (0, lifecycle_1.$fc)(this.a.values());
        }
        d(editor) {
            this.a.set(editor, (0, lifecycle_1.$hc)(editor.onDidChangeCursorPosition(_ => this.c.fire({ editor })), editor.onDidChangeModelContent(_ => this.c.fire({ editor }))));
        }
        e(editor) {
            this.a.get(editor)?.dispose();
            this.a.delete(editor);
        }
    };
    EditorState = __decorate([
        __param(0, codeEditorService_1.$nV)
    ], EditorState);
});
//# sourceMappingURL=symbolNavigation.js.map