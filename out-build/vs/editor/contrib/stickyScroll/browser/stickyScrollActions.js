/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/nls!vs/editor/contrib/stickyScroll/browser/stickyScrollActions", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/editor/common/editorContextKeys", "vs/editor/contrib/stickyScroll/browser/stickyScrollController"], function (require, exports, editorExtensions_1, nls_1, actionCommonCategories_1, actions_1, configuration_1, contextkey_1, editorContextKeys_1, stickyScrollController_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$10 = exports.$Z0 = exports.$Y0 = exports.$X0 = exports.$W0 = exports.$V0 = void 0;
    class $V0 extends actions_1.$Wu {
        constructor() {
            super({
                id: 'editor.action.toggleStickyScroll',
                title: {
                    value: (0, nls_1.localize)(0, null),
                    mnemonicTitle: (0, nls_1.localize)(1, null),
                    original: 'Toggle Sticky Scroll',
                },
                category: actionCommonCategories_1.$Nl.View,
                toggled: {
                    condition: contextkey_1.$Ii.equals('config.editor.stickyScroll.enabled', true),
                    title: (0, nls_1.localize)(2, null),
                    mnemonicTitle: (0, nls_1.localize)(3, null),
                },
                menu: [
                    { id: actions_1.$Ru.CommandPalette },
                    { id: actions_1.$Ru.MenubarAppearanceMenu, group: '4_editor', order: 3 },
                    { id: actions_1.$Ru.StickyScrollContext }
                ]
            });
        }
        async run(accessor) {
            const configurationService = accessor.get(configuration_1.$8h);
            const newValue = !configurationService.getValue('editor.stickyScroll.enabled');
            return configurationService.updateValue('editor.stickyScroll.enabled', newValue);
        }
    }
    exports.$V0 = $V0;
    const weight = 100 /* KeybindingWeight.EditorContrib */;
    class $W0 extends editorExtensions_1.$uV {
        constructor() {
            super({
                id: 'editor.action.focusStickyScroll',
                title: {
                    value: (0, nls_1.localize)(4, null),
                    mnemonicTitle: (0, nls_1.localize)(5, null),
                    original: 'Focus Sticky Scroll',
                },
                precondition: contextkey_1.$Ii.and(contextkey_1.$Ii.has('config.editor.stickyScroll.enabled'), editorContextKeys_1.EditorContextKeys.stickyScrollVisible),
                menu: [
                    { id: actions_1.$Ru.CommandPalette },
                ]
            });
        }
        runEditorCommand(_accessor, editor) {
            stickyScrollController_1.$U0.get(editor)?.focus();
        }
    }
    exports.$W0 = $W0;
    class $X0 extends editorExtensions_1.$uV {
        constructor() {
            super({
                id: 'editor.action.selectNextStickyScrollLine',
                title: {
                    value: (0, nls_1.localize)(6, null),
                    original: 'Select next sticky scroll line'
                },
                precondition: editorContextKeys_1.EditorContextKeys.stickyScrollFocused.isEqualTo(true),
                keybinding: {
                    weight,
                    primary: 18 /* KeyCode.DownArrow */
                }
            });
        }
        runEditorCommand(_accessor, editor) {
            stickyScrollController_1.$U0.get(editor)?.focusNext();
        }
    }
    exports.$X0 = $X0;
    class $Y0 extends editorExtensions_1.$uV {
        constructor() {
            super({
                id: 'editor.action.selectPreviousStickyScrollLine',
                title: {
                    value: (0, nls_1.localize)(7, null),
                    original: 'Select previous sticky scroll line'
                },
                precondition: editorContextKeys_1.EditorContextKeys.stickyScrollFocused.isEqualTo(true),
                keybinding: {
                    weight,
                    primary: 16 /* KeyCode.UpArrow */
                }
            });
        }
        runEditorCommand(_accessor, editor) {
            stickyScrollController_1.$U0.get(editor)?.focusPrevious();
        }
    }
    exports.$Y0 = $Y0;
    class $Z0 extends editorExtensions_1.$uV {
        constructor() {
            super({
                id: 'editor.action.goToFocusedStickyScrollLine',
                title: {
                    value: (0, nls_1.localize)(8, null),
                    original: 'Go to focused sticky scroll line'
                },
                precondition: editorContextKeys_1.EditorContextKeys.stickyScrollFocused.isEqualTo(true),
                keybinding: {
                    weight,
                    primary: 3 /* KeyCode.Enter */
                }
            });
        }
        runEditorCommand(_accessor, editor) {
            stickyScrollController_1.$U0.get(editor)?.goToFocused();
        }
    }
    exports.$Z0 = $Z0;
    class $10 extends editorExtensions_1.$uV {
        constructor() {
            super({
                id: 'editor.action.selectEditor',
                title: {
                    value: (0, nls_1.localize)(9, null),
                    original: 'Select Editor'
                },
                precondition: editorContextKeys_1.EditorContextKeys.stickyScrollFocused.isEqualTo(true),
                keybinding: {
                    weight,
                    primary: 9 /* KeyCode.Escape */
                }
            });
        }
        runEditorCommand(_accessor, editor) {
            stickyScrollController_1.$U0.get(editor)?.selectEditor();
        }
    }
    exports.$10 = $10;
});
//# sourceMappingURL=stickyScrollActions.js.map