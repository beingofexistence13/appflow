/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/platform/contextkey/common/contextkey", "vs/base/common/cancellation", "vs/base/common/linkedList", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/extensions", "vs/nls!vs/editor/contrib/editorState/browser/keybindingCancellation"], function (require, exports, editorExtensions_1, contextkey_1, cancellation_1, linkedList_1, instantiation_1, extensions_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$r1 = void 0;
    const IEditorCancellationTokens = (0, instantiation_1.$Bh)('IEditorCancelService');
    const ctxCancellableOperation = new contextkey_1.$2i('cancellableOperation', false, (0, nls_1.localize)(0, null));
    (0, extensions_1.$mr)(IEditorCancellationTokens, class {
        constructor() {
            this.a = new WeakMap();
        }
        add(editor, cts) {
            let data = this.a.get(editor);
            if (!data) {
                data = editor.invokeWithinContext(accessor => {
                    const key = ctxCancellableOperation.bindTo(accessor.get(contextkey_1.$3i));
                    const tokens = new linkedList_1.$tc();
                    return { key, tokens };
                });
                this.a.set(editor, data);
            }
            let removeFn;
            data.key.set(true);
            removeFn = data.tokens.push(cts);
            return () => {
                // remove w/o cancellation
                if (removeFn) {
                    removeFn();
                    data.key.set(!data.tokens.isEmpty());
                    removeFn = undefined;
                }
            };
        }
        cancel(editor) {
            const data = this.a.get(editor);
            if (!data) {
                return;
            }
            // remove with cancellation
            const cts = data.tokens.pop();
            if (cts) {
                cts.cancel();
                data.key.set(!data.tokens.isEmpty());
            }
        }
    }, 1 /* InstantiationType.Delayed */);
    class $r1 extends cancellation_1.$pd {
        constructor(editor, parent) {
            super(parent);
            this.editor = editor;
            this.a = editor.invokeWithinContext(accessor => accessor.get(IEditorCancellationTokens).add(editor, this));
        }
        dispose() {
            this.a();
            super.dispose();
        }
    }
    exports.$r1 = $r1;
    (0, editorExtensions_1.$wV)(new class extends editorExtensions_1.$rV {
        constructor() {
            super({
                id: 'editor.cancelOperation',
                kbOpts: {
                    weight: 100 /* KeybindingWeight.EditorContrib */,
                    primary: 9 /* KeyCode.Escape */
                },
                precondition: ctxCancellableOperation
            });
        }
        runEditorCommand(accessor, editor) {
            accessor.get(IEditorCancellationTokens).cancel(editor);
        }
    });
});
//# sourceMappingURL=keybindingCancellation.js.map