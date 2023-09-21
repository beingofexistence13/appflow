/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/editor/common/cursor/cursorMoveCommands", "vs/editor/common/editorContextKeys", "vs/nls!vs/editor/contrib/lineSelection/browser/lineSelection"], function (require, exports, editorExtensions_1, cursorMoveCommands_1, editorContextKeys_1, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$u9 = void 0;
    class $u9 extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'expandLineSelection',
                label: nls.localize(0, null),
                alias: 'Expand Line Selection',
                precondition: undefined,
                kbOpts: {
                    weight: 0 /* KeybindingWeight.EditorCore */,
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 42 /* KeyCode.KeyL */
                },
            });
        }
        run(_accessor, editor, args) {
            args = args || {};
            if (!editor.hasModel()) {
                return;
            }
            const viewModel = editor._getViewModel();
            viewModel.model.pushStackElement();
            viewModel.setCursorStates(args.source, 3 /* CursorChangeReason.Explicit */, cursorMoveCommands_1.$6V.expandLineSelection(viewModel, viewModel.getCursorStates()));
            viewModel.revealPrimaryCursor(args.source, true);
        }
    }
    exports.$u9 = $u9;
    (0, editorExtensions_1.$xV)($u9);
});
//# sourceMappingURL=lineSelection.js.map