/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/nls!vs/editor/contrib/colorPicker/browser/standaloneColorPickerActions", "vs/editor/contrib/colorPicker/browser/standaloneColorPickerWidget", "vs/editor/common/editorContextKeys", "vs/platform/actions/common/actions", "vs/css!./colorPicker"], function (require, exports, editorExtensions_1, nls_1, standaloneColorPickerWidget_1, editorContextKeys_1, actions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$U6 = void 0;
    class $U6 extends editorExtensions_1.$uV {
        constructor() {
            super({
                id: 'editor.action.showOrFocusStandaloneColorPicker',
                title: {
                    value: (0, nls_1.localize)(0, null),
                    mnemonicTitle: (0, nls_1.localize)(1, null),
                    original: 'Show or Focus Standalone Color Picker',
                },
                precondition: undefined,
                menu: [
                    { id: actions_1.$Ru.CommandPalette },
                ]
            });
        }
        runEditorCommand(_accessor, editor) {
            standaloneColorPickerWidget_1.$S6.get(editor)?.showOrFocus();
        }
    }
    exports.$U6 = $U6;
    class HideStandaloneColorPicker extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.hideColorPicker',
                label: (0, nls_1.localize)(2, null),





                alias: 'Hide the Color Picker',
                precondition: editorContextKeys_1.EditorContextKeys.standaloneColorPickerVisible.isEqualTo(true),
                kbOpts: {
                    primary: 9 /* KeyCode.Escape */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(_accessor, editor) {
            standaloneColorPickerWidget_1.$S6.get(editor)?.hide();
        }
    }
    class InsertColorWithStandaloneColorPicker extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.insertColorWithStandaloneColorPicker',
                label: (0, nls_1.localize)(3, null),





                alias: 'Insert Color with Standalone Color Picker',
                precondition: editorContextKeys_1.EditorContextKeys.standaloneColorPickerFocused.isEqualTo(true),
                kbOpts: {
                    primary: 3 /* KeyCode.Enter */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(_accessor, editor) {
            standaloneColorPickerWidget_1.$S6.get(editor)?.insertColor();
        }
    }
    (0, editorExtensions_1.$xV)(HideStandaloneColorPicker);
    (0, editorExtensions_1.$xV)(InsertColorWithStandaloneColorPicker);
    (0, actions_1.$Xu)($U6);
});
//# sourceMappingURL=standaloneColorPickerActions.js.map