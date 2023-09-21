/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/nls", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/editor/common/editorContextKeys", "vs/editor/contrib/stickyScroll/browser/stickyScrollController"], function (require, exports, editorExtensions_1, nls_1, actionCommonCategories_1, actions_1, configuration_1, contextkey_1, editorContextKeys_1, stickyScrollController_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SelectEditor = exports.GoToStickyScrollLine = exports.SelectPreviousStickyScrollLine = exports.SelectNextStickyScrollLine = exports.FocusStickyScroll = exports.ToggleStickyScroll = void 0;
    class ToggleStickyScroll extends actions_1.Action2 {
        constructor() {
            super({
                id: 'editor.action.toggleStickyScroll',
                title: {
                    value: (0, nls_1.localize)('toggleStickyScroll', "Toggle Sticky Scroll"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'mitoggleStickyScroll', comment: ['&& denotes a mnemonic'] }, "&&Toggle Sticky Scroll"),
                    original: 'Toggle Sticky Scroll',
                },
                category: actionCommonCategories_1.Categories.View,
                toggled: {
                    condition: contextkey_1.ContextKeyExpr.equals('config.editor.stickyScroll.enabled', true),
                    title: (0, nls_1.localize)('stickyScroll', "Sticky Scroll"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miStickyScroll', comment: ['&& denotes a mnemonic'] }, "&&Sticky Scroll"),
                },
                menu: [
                    { id: actions_1.MenuId.CommandPalette },
                    { id: actions_1.MenuId.MenubarAppearanceMenu, group: '4_editor', order: 3 },
                    { id: actions_1.MenuId.StickyScrollContext }
                ]
            });
        }
        async run(accessor) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const newValue = !configurationService.getValue('editor.stickyScroll.enabled');
            return configurationService.updateValue('editor.stickyScroll.enabled', newValue);
        }
    }
    exports.ToggleStickyScroll = ToggleStickyScroll;
    const weight = 100 /* KeybindingWeight.EditorContrib */;
    class FocusStickyScroll extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'editor.action.focusStickyScroll',
                title: {
                    value: (0, nls_1.localize)('focusStickyScroll', "Focus Sticky Scroll"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'mifocusStickyScroll', comment: ['&& denotes a mnemonic'] }, "&&Focus Sticky Scroll"),
                    original: 'Focus Sticky Scroll',
                },
                precondition: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('config.editor.stickyScroll.enabled'), editorContextKeys_1.EditorContextKeys.stickyScrollVisible),
                menu: [
                    { id: actions_1.MenuId.CommandPalette },
                ]
            });
        }
        runEditorCommand(_accessor, editor) {
            stickyScrollController_1.StickyScrollController.get(editor)?.focus();
        }
    }
    exports.FocusStickyScroll = FocusStickyScroll;
    class SelectNextStickyScrollLine extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'editor.action.selectNextStickyScrollLine',
                title: {
                    value: (0, nls_1.localize)('selectNextStickyScrollLine.title', "Select next sticky scroll line"),
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
            stickyScrollController_1.StickyScrollController.get(editor)?.focusNext();
        }
    }
    exports.SelectNextStickyScrollLine = SelectNextStickyScrollLine;
    class SelectPreviousStickyScrollLine extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'editor.action.selectPreviousStickyScrollLine',
                title: {
                    value: (0, nls_1.localize)('selectPreviousStickyScrollLine.title', "Select previous sticky scroll line"),
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
            stickyScrollController_1.StickyScrollController.get(editor)?.focusPrevious();
        }
    }
    exports.SelectPreviousStickyScrollLine = SelectPreviousStickyScrollLine;
    class GoToStickyScrollLine extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'editor.action.goToFocusedStickyScrollLine',
                title: {
                    value: (0, nls_1.localize)('goToFocusedStickyScrollLine.title', "Go to focused sticky scroll line"),
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
            stickyScrollController_1.StickyScrollController.get(editor)?.goToFocused();
        }
    }
    exports.GoToStickyScrollLine = GoToStickyScrollLine;
    class SelectEditor extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'editor.action.selectEditor',
                title: {
                    value: (0, nls_1.localize)('selectEditor.title', "Select Editor"),
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
            stickyScrollController_1.StickyScrollController.get(editor)?.selectEditor();
        }
    }
    exports.SelectEditor = SelectEditor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RpY2t5U2Nyb2xsQWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL3N0aWNreVNjcm9sbC9icm93c2VyL3N0aWNreVNjcm9sbEFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBY2hHLE1BQWEsa0JBQW1CLFNBQVEsaUJBQU87UUFFOUM7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLGtDQUFrQztnQkFDdEMsS0FBSyxFQUFFO29CQUNOLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxvQkFBb0IsRUFBRSxzQkFBc0IsQ0FBQztvQkFDN0QsYUFBYSxFQUFFLElBQUEsY0FBUSxFQUFDLEVBQUUsR0FBRyxFQUFFLHNCQUFzQixFQUFFLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsRUFBRSx3QkFBd0IsQ0FBQztvQkFDdEgsUUFBUSxFQUFFLHNCQUFzQjtpQkFDaEM7Z0JBQ0QsUUFBUSxFQUFFLG1DQUFVLENBQUMsSUFBSTtnQkFDekIsT0FBTyxFQUFFO29CQUNSLFNBQVMsRUFBRSwyQkFBYyxDQUFDLE1BQU0sQ0FBQyxvQ0FBb0MsRUFBRSxJQUFJLENBQUM7b0JBQzVFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxjQUFjLEVBQUUsZUFBZSxDQUFDO29CQUNoRCxhQUFhLEVBQUUsSUFBQSxjQUFRLEVBQUMsRUFBRSxHQUFHLEVBQUUsZ0JBQWdCLEVBQUUsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLGlCQUFpQixDQUFDO2lCQUN6RztnQkFDRCxJQUFJLEVBQUU7b0JBQ0wsRUFBRSxFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxjQUFjLEVBQUU7b0JBQzdCLEVBQUUsRUFBRSxFQUFFLGdCQUFNLENBQUMscUJBQXFCLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUs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