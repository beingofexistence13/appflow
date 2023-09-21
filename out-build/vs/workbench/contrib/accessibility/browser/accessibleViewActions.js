/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/editor/browser/editorExtensions", "vs/nls!vs/workbench/contrib/accessibility/browser/accessibleViewActions", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/accessibility/browser/accessibilityConfiguration", "vs/workbench/contrib/accessibility/browser/accessibleView", "vs/editor/browser/services/codeEditorService", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionsController", "vs/base/browser/ui/aria/aria"], function (require, exports, codicons_1, editorExtensions_1, nls_1, actions_1, contextkey_1, accessibilityConfiguration_1, accessibleView_1, codeEditorService_1, inlineCompletionsController_1, aria_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$uGb = exports.$tGb = void 0;
    const accessibleViewMenu = {
        id: actions_1.$Ru.AccessibleView,
        group: 'navigation',
        when: accessibilityConfiguration_1.$jqb
    };
    const commandPalette = {
        id: actions_1.$Ru.CommandPalette,
        group: '',
        order: 1
    };
    class AccessibleViewNextAction extends actions_1.$Wu {
        constructor() {
            super({
                id: "editor.action.accessibleViewNext" /* AccessibilityCommandId.ShowNext */,
                precondition: contextkey_1.$Ii.and(accessibilityConfiguration_1.$jqb, accessibilityConfiguration_1.$kqb),
                keybinding: {
                    primary: 512 /* KeyMod.Alt */ | 94 /* KeyCode.BracketRight */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                menu: [
                    commandPalette,
                    {
                        ...accessibleViewMenu,
                        when: contextkey_1.$Ii.and(accessibilityConfiguration_1.$jqb, accessibilityConfiguration_1.$kqb),
                    }
                ],
                icon: codicons_1.$Pj.arrowDown,
                title: (0, nls_1.localize)(0, null)
            });
        }
        run(accessor) {
            accessor.get(accessibleView_1.$wqb).next();
        }
    }
    (0, actions_1.$Xu)(AccessibleViewNextAction);
    class AccessibleViewPreviousAction extends actions_1.$Wu {
        constructor() {
            super({
                id: "editor.action.accessibleViewPrevious" /* AccessibilityCommandId.ShowPrevious */,
                precondition: contextkey_1.$Ii.and(accessibilityConfiguration_1.$jqb, accessibilityConfiguration_1.$kqb),
                keybinding: {
                    primary: 512 /* KeyMod.Alt */ | 92 /* KeyCode.BracketLeft */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                icon: codicons_1.$Pj.arrowUp,
                menu: [
                    commandPalette,
                    {
                        ...accessibleViewMenu,
                        when: contextkey_1.$Ii.and(accessibilityConfiguration_1.$jqb, accessibilityConfiguration_1.$kqb),
                    }
                ],
                title: (0, nls_1.localize)(1, null)
            });
        }
        run(accessor) {
            accessor.get(accessibleView_1.$wqb).previous();
        }
    }
    (0, actions_1.$Xu)(AccessibleViewPreviousAction);
    class AccessibleViewGoToSymbolAction extends actions_1.$Wu {
        constructor() {
            super({
                id: "editor.action.accessibleViewGoToSymbol" /* AccessibilityCommandId.GoToSymbol */,
                precondition: contextkey_1.$Ii.and(contextkey_1.$Ii.or(accessibilityConfiguration_1.$jqb, accessibilityConfiguration_1.$iqb), accessibilityConfiguration_1.$mqb),
                keybinding: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 45 /* KeyCode.KeyO */,
                    secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 89 /* KeyCode.Period */],
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 10
                },
                icon: codicons_1.$Pj.symbolField,
                menu: [
                    commandPalette,
                    {
                        ...accessibleViewMenu,
                        when: contextkey_1.$Ii.and(contextkey_1.$Ii.or(accessibilityConfiguration_1.$jqb, accessibilityConfiguration_1.$iqb), accessibilityConfiguration_1.$mqb),
                    }
                ],
                title: (0, nls_1.localize)(2, null)
            });
        }
        run(accessor) {
            accessor.get(accessibleView_1.$wqb).goToSymbol();
        }
    }
    (0, actions_1.$Xu)(AccessibleViewGoToSymbolAction);
    function registerCommand(command) {
        command.register();
        return command;
    }
    exports.$tGb = registerCommand(new editorExtensions_1.$pV({
        id: "editor.action.accessibilityHelp" /* AccessibilityCommandId.OpenAccessibilityHelp */,
        precondition: undefined,
        kbOpts: {
            primary: 512 /* KeyMod.Alt */ | 59 /* KeyCode.F1 */,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            linux: {
                primary: 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 59 /* KeyCode.F1 */,
                secondary: [512 /* KeyMod.Alt */ | 59 /* KeyCode.F1 */]
            }
        },
        menuOpts: [{
                menuId: actions_1.$Ru.CommandPalette,
                group: '',
                title: (0, nls_1.localize)(3, null),
                order: 1
            }],
    }));
    exports.$uGb = registerCommand(new editorExtensions_1.$pV({
        id: "editor.action.accessibleView" /* AccessibilityCommandId.OpenAccessibleView */,
        precondition: undefined,
        kbOpts: {
            primary: 512 /* KeyMod.Alt */ | 60 /* KeyCode.F2 */,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            linux: {
                primary: 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 60 /* KeyCode.F2 */,
                secondary: [512 /* KeyMod.Alt */ | 60 /* KeyCode.F2 */]
            }
        },
        menuOpts: [{
                menuId: actions_1.$Ru.CommandPalette,
                group: '',
                title: (0, nls_1.localize)(4, null),
                order: 1
            }],
    }));
    class AccessibleViewDisableHintAction extends actions_1.$Wu {
        constructor() {
            super({
                id: "editor.action.accessibleViewDisableHint" /* AccessibilityCommandId.DisableVerbosityHint */,
                precondition: contextkey_1.$Ii.and(contextkey_1.$Ii.or(accessibilityConfiguration_1.$jqb, accessibilityConfiguration_1.$iqb), accessibilityConfiguration_1.$lqb),
                keybinding: {
                    primary: 512 /* KeyMod.Alt */ | 64 /* KeyCode.F6 */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                icon: codicons_1.$Pj.bellSlash,
                menu: [
                    commandPalette,
                    {
                        id: actions_1.$Ru.AccessibleView,
                        group: 'navigation',
                        when: contextkey_1.$Ii.and(contextkey_1.$Ii.or(accessibilityConfiguration_1.$jqb, accessibilityConfiguration_1.$iqb), accessibilityConfiguration_1.$lqb),
                    }
                ],
                title: (0, nls_1.localize)(5, null)
            });
        }
        run(accessor) {
            accessor.get(accessibleView_1.$wqb).disableHint();
        }
    }
    (0, actions_1.$Xu)(AccessibleViewDisableHintAction);
    class AccessibleViewAcceptInlineCompletionAction extends actions_1.$Wu {
        constructor() {
            super({
                id: "editor.action.accessibleViewAcceptInlineCompletion" /* AccessibilityCommandId.AccessibleViewAcceptInlineCompletion */,
                precondition: contextkey_1.$Ii.and(accessibilityConfiguration_1.$jqb, contextkey_1.$Ii.equals(accessibilityConfiguration_1.$oqb.key, "inlineCompletions" /* AccessibleViewProviderId.InlineCompletions */)),
                keybinding: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 90 /* KeyCode.Slash */,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 90 /* KeyCode.Slash */ },
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                icon: codicons_1.$Pj.check,
                menu: [
                    commandPalette,
                    {
                        id: actions_1.$Ru.AccessibleView,
                        group: 'navigation',
                        order: 0,
                        when: contextkey_1.$Ii.and(accessibilityConfiguration_1.$jqb, contextkey_1.$Ii.equals(accessibilityConfiguration_1.$oqb.key, "inlineCompletions" /* AccessibleViewProviderId.InlineCompletions */))
                    }
                ],
                title: (0, nls_1.localize)(6, null)
            });
        }
        async run(accessor) {
            const codeEditorService = accessor.get(codeEditorService_1.$nV);
            const editor = codeEditorService.getActiveCodeEditor() || codeEditorService.getFocusedCodeEditor();
            if (!editor) {
                return;
            }
            const model = inlineCompletionsController_1.$V8.get(editor)?.model.get();
            const state = model?.state.get();
            if (!model || !state) {
                return;
            }
            await model.accept(editor);
            (0, aria_1.$$P)('Accepted');
            model.stop();
            editor.focus();
        }
    }
    (0, actions_1.$Xu)(AccessibleViewAcceptInlineCompletionAction);
});
//# sourceMappingURL=accessibleViewActions.js.map