/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/editor/contrib/codeAction/browser/codeAction", "vs/nls", "vs/platform/contextkey/common/contextkey", "../common/types", "./codeActionController", "./codeActionModel"], function (require, exports, strings_1, editorExtensions_1, editorContextKeys_1, codeAction_1, nls, contextkey_1, types_1, codeActionController_1, codeActionModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AutoFixAction = exports.FixAllAction = exports.OrganizeImportsAction = exports.SourceAction = exports.RefactorAction = exports.CodeActionCommand = exports.QuickFixAction = void 0;
    function contextKeyForSupportedActions(kind) {
        return contextkey_1.ContextKeyExpr.regex(codeActionModel_1.SUPPORTED_CODE_ACTIONS.keys()[0], new RegExp('(\\s|^)' + (0, strings_1.escapeRegExpCharacters)(kind.value) + '\\b'));
    }
    const argsSchema = {
        type: 'object',
        defaultSnippets: [{ body: { kind: '' } }],
        properties: {
            'kind': {
                type: 'string',
                description: nls.localize('args.schema.kind', "Kind of the code action to run."),
            },
            'apply': {
                type: 'string',
                description: nls.localize('args.schema.apply', "Controls when the returned actions are applied."),
                default: "ifSingle" /* CodeActionAutoApply.IfSingle */,
                enum: ["first" /* CodeActionAutoApply.First */, "ifSingle" /* CodeActionAutoApply.IfSingle */, "never" /* CodeActionAutoApply.Never */],
                enumDescriptions: [
                    nls.localize('args.schema.apply.first', "Always apply the first returned code action."),
                    nls.localize('args.schema.apply.ifSingle', "Apply the first returned code action if it is the only one."),
                    nls.localize('args.schema.apply.never', "Do not apply the returned code actions."),
                ]
            },
            'preferred': {
                type: 'boolean',
                default: false,
                description: nls.localize('args.schema.preferred', "Controls if only preferred code actions should be returned."),
            }
        }
    };
    function triggerCodeActionsForEditorSelection(editor, notAvailableMessage, filter, autoApply, triggerAction = types_1.CodeActionTriggerSource.Default) {
        if (editor.hasModel()) {
            const controller = codeActionController_1.CodeActionController.get(editor);
            controller?.manualTriggerAtCurrentPosition(notAvailableMessage, triggerAction, filter, autoApply);
        }
    }
    class QuickFixAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: codeAction_1.quickFixCommandId,
                label: nls.localize('quickfix.trigger.label', "Quick Fix..."),
                alias: 'Quick Fix...',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasCodeActionsProvider),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 89 /* KeyCode.Period */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(_accessor, editor) {
            return triggerCodeActionsForEditorSelection(editor, nls.localize('editor.action.quickFix.noneMessage', "No code actions available"), undefined, undefined, types_1.CodeActionTriggerSource.QuickFix);
        }
    }
    exports.QuickFixAction = QuickFixAction;
    class CodeActionCommand extends editorExtensions_1.EditorCommand {
        constructor() {
            super({
                id: codeAction_1.codeActionCommandId,
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasCodeActionsProvider),
                description: {
                    description: 'Trigger a code action',
                    args: [{ name: 'args', schema: argsSchema, }]
                }
            });
        }
        runEditorCommand(_accessor, editor, userArgs) {
            const args = types_1.CodeActionCommandArgs.fromUser(userArgs, {
                kind: types_1.CodeActionKind.Empty,
                apply: "ifSingle" /* CodeActionAutoApply.IfSingle */,
            });
            return triggerCodeActionsForEditorSelection(editor, typeof userArgs?.kind === 'string'
                ? args.preferred
                    ? nls.localize('editor.action.codeAction.noneMessage.preferred.kind', "No preferred code actions for '{0}' available", userArgs.kind)
                    : nls.localize('editor.action.codeAction.noneMessage.kind', "No code actions for '{0}' available", userArgs.kind)
                : args.preferred
                    ? nls.localize('editor.action.codeAction.noneMessage.preferred', "No preferred code actions available")
                    : nls.localize('editor.action.codeAction.noneMessage', "No code actions available"), {
                include: args.kind,
                includeSourceActions: true,
                onlyIncludePreferredActions: args.preferred,
            }, args.apply);
        }
    }
    exports.CodeActionCommand = CodeActionCommand;
    class RefactorAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: codeAction_1.refactorCommandId,
                label: nls.localize('refactor.label', "Refactor..."),
                alias: 'Refactor...',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasCodeActionsProvider),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 48 /* KeyCode.KeyR */,
                    mac: {
                        primary: 256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 48 /* KeyCode.KeyR */
                    },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                contextMenuOpts: {
                    group: '1_modification',
                    order: 2,
                    when: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, contextKeyForSupportedActions(types_1.CodeActionKind.Refactor)),
                },
                description: {
                    description: 'Refactor...',
                    args: [{ name: 'args', schema: argsSchema }]
                }
            });
        }
        run(_accessor, editor, userArgs) {
            const args = types_1.CodeActionCommandArgs.fromUser(userArgs, {
                kind: types_1.CodeActionKind.Refactor,
                apply: "never" /* CodeActionAutoApply.Never */
            });
            return triggerCodeActionsForEditorSelection(editor, typeof userArgs?.kind === 'string'
                ? args.preferred
                    ? nls.localize('editor.action.refactor.noneMessage.preferred.kind', "No preferred refactorings for '{0}' available", userArgs.kind)
                    : nls.localize('editor.action.refactor.noneMessage.kind', "No refactorings for '{0}' available", userArgs.kind)
                : args.preferred
                    ? nls.localize('editor.action.refactor.noneMessage.preferred', "No preferred refactorings available")
                    : nls.localize('editor.action.refactor.noneMessage', "No refactorings available"), {
                include: types_1.CodeActionKind.Refactor.contains(args.kind) ? args.kind : types_1.CodeActionKind.None,
                onlyIncludePreferredActions: args.preferred
            }, args.apply, types_1.CodeActionTriggerSource.Refactor);
        }
    }
    exports.RefactorAction = RefactorAction;
    class SourceAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: codeAction_1.sourceActionCommandId,
                label: nls.localize('source.label', "Source Action..."),
                alias: 'Source Action...',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasCodeActionsProvider),
                contextMenuOpts: {
                    group: '1_modification',
                    order: 2.1,
                    when: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, contextKeyForSupportedActions(types_1.CodeActionKind.Source)),
                },
                description: {
                    description: 'Source Action...',
                    args: [{ name: 'args', schema: argsSchema }]
                }
            });
        }
        run(_accessor, editor, userArgs) {
            const args = types_1.CodeActionCommandArgs.fromUser(userArgs, {
                kind: types_1.CodeActionKind.Source,
                apply: "never" /* CodeActionAutoApply.Never */
            });
            return triggerCodeActionsForEditorSelection(editor, typeof userArgs?.kind === 'string'
                ? args.preferred
                    ? nls.localize('editor.action.source.noneMessage.preferred.kind', "No preferred source actions for '{0}' available", userArgs.kind)
                    : nls.localize('editor.action.source.noneMessage.kind', "No source actions for '{0}' available", userArgs.kind)
                : args.preferred
                    ? nls.localize('editor.action.source.noneMessage.preferred', "No preferred source actions available")
                    : nls.localize('editor.action.source.noneMessage', "No source actions available"), {
                include: types_1.CodeActionKind.Source.contains(args.kind) ? args.kind : types_1.CodeActionKind.None,
                includeSourceActions: true,
                onlyIncludePreferredActions: args.preferred,
            }, args.apply, types_1.CodeActionTriggerSource.SourceAction);
        }
    }
    exports.SourceAction = SourceAction;
    class OrganizeImportsAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: codeAction_1.organizeImportsCommandId,
                label: nls.localize('organizeImports.label', "Organize Imports"),
                alias: 'Organize Imports',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, contextKeyForSupportedActions(types_1.CodeActionKind.SourceOrganizeImports)),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 45 /* KeyCode.KeyO */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
            });
        }
        run(_accessor, editor) {
            return triggerCodeActionsForEditorSelection(editor, nls.localize('editor.action.organize.noneMessage', "No organize imports action available"), { include: types_1.CodeActionKind.SourceOrganizeImports, includeSourceActions: true }, "ifSingle" /* CodeActionAutoApply.IfSingle */, types_1.CodeActionTriggerSource.OrganizeImports);
        }
    }
    exports.OrganizeImportsAction = OrganizeImportsAction;
    class FixAllAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: codeAction_1.fixAllCommandId,
                label: nls.localize('fixAll.label', "Fix All"),
                alias: 'Fix All',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, contextKeyForSupportedActions(types_1.CodeActionKind.SourceFixAll))
            });
        }
        run(_accessor, editor) {
            return triggerCodeActionsForEditorSelection(editor, nls.localize('fixAll.noneMessage', "No fix all action available"), { include: types_1.CodeActionKind.SourceFixAll, includeSourceActions: true }, "ifSingle" /* CodeActionAutoApply.IfSingle */, types_1.CodeActionTriggerSource.FixAll);
        }
    }
    exports.FixAllAction = FixAllAction;
    class AutoFixAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: codeAction_1.autoFixCommandId,
                label: nls.localize('autoFix.label', "Auto Fix..."),
                alias: 'Auto Fix...',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, contextKeyForSupportedActions(types_1.CodeActionKind.QuickFix)),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 89 /* KeyCode.Period */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 89 /* KeyCode.Period */
                    },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(_accessor, editor) {
            return triggerCodeActionsForEditorSelection(editor, nls.localize('editor.action.autoFix.noneMessage', "No auto fixes available"), {
                include: types_1.CodeActionKind.QuickFix,
                onlyIncludePreferredActions: true
            }, "ifSingle" /* CodeActionAutoApply.IfSingle */, types_1.CodeActionTriggerSource.AutoFix);
        }
    }
    exports.AutoFixAction = AutoFixAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUFjdGlvbkNvbW1hbmRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvY29kZUFjdGlvbi9icm93c2VyL2NvZGVBY3Rpb25Db21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFnQmhHLFNBQVMsNkJBQTZCLENBQUMsSUFBb0I7UUFDMUQsT0FBTywyQkFBYyxDQUFDLEtBQUssQ0FDMUIsd0NBQXNCLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQ2hDLElBQUksTUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFBLGdDQUFzQixFQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFFRCxNQUFNLFVBQVUsR0FBZ0I7UUFDL0IsSUFBSSxFQUFFLFFBQVE7UUFDZCxlQUFlLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO1FBQ3pDLFVBQVUsRUFBRTtZQUNYLE1BQU0sRUFBRTtnQkFDUCxJQUFJLEVBQUUsUUFBUTtnQkFDZCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxpQ0FBaUMsQ0FBQzthQUNoRjtZQUNELE9BQU8sRUFBRTtnQkFDUixJQUFJLEVBQUUsUUFBUTtnQkFDZCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSxpREFBaUQsQ0FBQztnQkFDakcsT0FBTywrQ0FBOEI7Z0JBQ3JDLElBQUksRUFBRSxpSUFBb0Y7Z0JBQzFGLGdCQUFnQixFQUFFO29CQUNqQixHQUFHLENBQUMsUUFBUSxDQUFDLHlCQUF5QixFQUFFLDhDQUE4QyxDQUFDO29CQUN2RixHQUFHLENBQUMsUUFBUSxDQUFDLDRCQUE0QixFQUFFLDZEQUE2RCxDQUFDO29C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