/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/editor/browser/editorExtensions", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/accessibility/browser/accessibilityConfiguration", "vs/workbench/contrib/accessibility/browser/accessibleView", "vs/editor/browser/services/codeEditorService", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionsController", "vs/base/browser/ui/aria/aria"], function (require, exports, codicons_1, editorExtensions_1, nls_1, actions_1, contextkey_1, accessibilityConfiguration_1, accessibleView_1, codeEditorService_1, inlineCompletionsController_1, aria_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AccessibleViewAction = exports.AccessibilityHelpAction = void 0;
    const accessibleViewMenu = {
        id: actions_1.MenuId.AccessibleView,
        group: 'navigation',
        when: accessibilityConfiguration_1.accessibleViewIsShown
    };
    const commandPalette = {
        id: actions_1.MenuId.CommandPalette,
        group: '',
        order: 1
    };
    class AccessibleViewNextAction extends actions_1.Action2 {
        constructor() {
            super({
                id: "editor.action.accessibleViewNext" /* AccessibilityCommandId.ShowNext */,
                precondition: contextkey_1.ContextKeyExpr.and(accessibilityConfiguration_1.accessibleViewIsShown, accessibilityConfiguration_1.accessibleViewSupportsNavigation),
                keybinding: {
                    primary: 512 /* KeyMod.Alt */ | 94 /* KeyCode.BracketRight */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                menu: [
                    commandPalette,
                    {
                        ...accessibleViewMenu,
                        when: contextkey_1.ContextKeyExpr.and(accessibilityConfiguration_1.accessibleViewIsShown, accessibilityConfiguration_1.accessibleViewSupportsNavigation),
                    }
                ],
                icon: codicons_1.Codicon.arrowDown,
                title: (0, nls_1.localize)('editor.action.accessibleViewNext', "Show Next in Accessible View")
            });
        }
        run(accessor) {
            accessor.get(accessibleView_1.IAccessibleViewService).next();
        }
    }
    (0, actions_1.registerAction2)(AccessibleViewNextAction);
    class AccessibleViewPreviousAction extends actions_1.Action2 {
        constructor() {
            super({
                id: "editor.action.accessibleViewPrevious" /* AccessibilityCommandId.ShowPrevious */,
                precondition: contextkey_1.ContextKeyExpr.and(accessibilityConfiguration_1.accessibleViewIsShown, accessibilityConfiguration_1.accessibleViewSupportsNavigation),
                keybinding: {
                    primary: 512 /* KeyMod.Alt */ | 92 /* KeyCode.BracketLeft */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                icon: codicons_1.Codicon.arrowUp,
                menu: [
                    commandPalette,
                    {
                        ...accessibleViewMenu,
                        when: contextkey_1.ContextKeyExpr.and(accessibilityConfiguration_1.accessibleViewIsShown, accessibilityConfiguration_1.accessibleViewSupportsNavigation),
                    }
                ],
                title: (0, nls_1.localize)('editor.action.accessibleViewPrevious', "Show Previous in Accessible View")
            });
        }
        run(accessor) {
            accessor.get(accessibleView_1.IAccessibleViewService).previous();
        }
    }
    (0, actions_1.registerAction2)(AccessibleViewPreviousAction);
    class AccessibleViewGoToSymbolAction extends actions_1.Action2 {
        constructor() {
            super({
                id: "editor.action.accessibleViewGoToSymbol" /* AccessibilityCommandId.GoToSymbol */,
                precondition: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(accessibilityConfiguration_1.accessibleViewIsShown, accessibilityConfiguration_1.accessibilityHelpIsShown), accessibilityConfiguration_1.accessibleViewGoToSymbolSupported),
                keybinding: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 45 /* KeyCode.KeyO */,
                    secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 89 /* KeyCode.Period */],
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 10
                },
                icon: codicons_1.Codicon.symbolField,
                menu: [
                    commandPalette,
                    {
                        ...accessibleViewMenu,
                        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(accessibilityConfiguration_1.accessibleViewIsShown, accessibilityConfiguration_1.accessibilityHelpIsShown), accessibilityConfiguration_1.accessibleViewGoToSymbolSupported),
                    }
                ],
                title: (0, nls_1.localize)('editor.action.accessibleViewGoToSymbol', "Go To Symbol in Accessible View")
            });
        }
        run(accessor) {
            accessor.get(accessibleView_1.IAccessibleViewService).goToSymbol();
        }
    }
    (0, actions_1.registerAction2)(AccessibleViewGoToSymbolAction);
    function registerCommand(command) {
        command.register();
        return command;
    }
    exports.AccessibilityHelpAction = registerCommand(new editorExtensions_1.MultiCommand({
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
                menuId: actions_1.MenuId.CommandPalette,
                group: '',
                title: (0, nls_1.localize)('editor.action.accessibilityHelp', "Open Accessibility Help"),
                order: 1
            }],
    }));
    exports.AccessibleViewAction = registerCommand(new editorExtensions_1.MultiCommand({
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
                menuId: actions_1.MenuId.CommandPalette,
                group: '',
                title: (0, nls_1.localize)('editor.action.accessibleView', "Open Accessible View"),
                order: 1
            }],
    }));
    class AccessibleViewDisableHintAction extends actions_1.Action2 {
        constructor() {
            super({
                id: "editor.action.accessibleViewDisableHint" /* AccessibilityCommandId.DisableVerbosityHint */,
                precondition: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(accessibilityConfiguration_1.accessibleViewIsShown, accessibilityConfiguration_1.accessibilityHelpIsShown), accessibilityConfiguration_1.accessibleViewVerbosityEnabled),
                keybinding: {
                    primary: 512 /* KeyMod.Alt */ | 64 /* KeyCode.F6 */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                icon: codicons_1.Codicon.bellSlash,
                menu: [
                    commandPalette,
                    {
                        id: actions_1.MenuId.AccessibleView,
                        group: 'navigation',
                        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(accessibilityConfiguration_1.accessibleViewIsShown, accessibilityConfiguration_1.accessibilityHelpIsShown), accessibilityConfiguration_1.accessibleViewVerbosityEnabled),
                    }
                ],
                title: (0, nls_1.localize)('editor.action.accessibleViewDisableHint', "Disable Accessible View Hint")
            });
        }
        run(accessor) {
            accessor.get(accessibleView_1.IAccessibleViewService).disableHint();
        }
    }
    (0, actions_1.registerAction2)(AccessibleViewDisableHintAction);
    class AccessibleViewAcceptInlineCompletionAction extends actions_1.Action2 {
        constructor() {
            super({
                id: "editor.action.accessibleViewAcceptInlineCompletion" /* AccessibilityCommandId.AccessibleViewAcceptInlineCompletion */,
                precondition: contextkey_1.ContextKeyExpr.and(accessibilityConfiguration_1.accessibleViewIsShown, contextkey_1.ContextKeyExpr.equals(accessibilityConfiguration_1.accessibleViewCurrentProviderId.key, "inlineCompletions" /* AccessibleViewProviderId.InlineCompletions */)),
                keybinding: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 90 /* KeyCode.Slash */,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 90 /* KeyCode.Slash */ },
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                icon: codicons_1.Codicon.check,
                menu: [
                    commandPalette,
                    {
                        id: actions_1.MenuId.AccessibleView,
                        group: 'navigation',
                        order: 0,
                        when: contextkey_1.ContextKeyExpr.and(accessibilityConfiguration_1.accessibleViewIsShown, contextkey_1.ContextKeyExpr.equals(accessibilityConfiguration_1.accessibleViewCurrentProviderId.key, "inlineCompletions" /* AccessibleViewProviderId.InlineCompletions */))
                    }
                ],
                title: (0, nls_1.localize)('editor.action.accessibleViewAcceptInlineCompletionAction', "Accept Inline Completion")
            });
        }
        async run(accessor) {
            const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
            const editor = codeEditorService.getActiveCodeEditor() || codeEditorService.getFocusedCodeEditor();
            if (!editor) {
                return;
            }
            const model = inlineCompletionsController_1.InlineCompletionsController.get(editor)?.model.get();
            const state = model?.state.get();
            if (!model || !state) {
                return;
            }
            await model.accept(editor);
            (0, aria_1.alert)('Accepted');
            model.stop();
            editor.focus();
        }
    }
    (0, actions_1.registerAction2)(AccessibleViewAcceptInlineCompletionAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjZXNzaWJsZVZpZXdBY3Rpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvYWNjZXNzaWJpbGl0eS9icm93c2VyL2FjY2Vzc2libGVWaWV3QWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFnQmhHLE1BQU0sa0JBQWtCLEdBQUc7UUFDMUIsRUFBRSxFQUFFLGdCQUFNLENBQUMsY0FBYztRQUN6QixLQUFLLEVBQUUsWUFBWTtRQUNuQixJQUFJLEVBQUUsa0RBQXFCO0tBQzNCLENBQUM7SUFDRixNQUFNLGNBQWMsR0FBRztRQUN0QixFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxjQUFjO1FBQ3pCLEtBQUssRUFBRSxFQUFFO1FBQ1QsS0FBSyxFQUFFLENBQUM7S0FDUixDQUFDO0lBQ0YsTUFBTSx3QkFBeUIsU0FBUSxpQkFBTztRQUM3QztZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLDBFQUFpQztnQkFDbkMsWUFBWSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLGtEQUFxQixFQUFFLDZEQUFnQyxDQUFDO2dCQUN6RixVQUFVLEVBQUU7b0JBQ1gsT0FBTyxFQUFFLG9EQUFpQztvQkFDMUMsTUFBTSw2Q0FBbUM7aUJBQ3pDO2dCQUNELElBQUksRUFBRTtvQkFDTCxjQUFjO29CQUNkO3dCQUNDLEdBQUcsa0JBQWtCO3dCQUNyQixJQUFJLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQUMsa0RBQXFCLEVBQUUsNkRBQWdDLENBQUM7cUJBQ2pGO2lCQUFDO2dCQUNILElBQUksRUFBRSxrQkFBTyxDQUFDLFNBQVM7Z0JBQ3ZCLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxrQ0FBa0MsRUFBRSw4QkFBOEIsQ0FBQzthQUNuRixDQUFDLENBQUM7UUFDSixDQUFDO1FBQ0QsR0FBRyxDQUFDLFFBQTBCO1lBQzdCLFFBQVEsQ0FB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