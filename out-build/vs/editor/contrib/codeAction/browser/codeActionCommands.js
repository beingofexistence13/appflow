/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/editor/contrib/codeAction/browser/codeAction", "vs/nls!vs/editor/contrib/codeAction/browser/codeActionCommands", "vs/platform/contextkey/common/contextkey", "../common/types", "./codeActionController", "./codeActionModel"], function (require, exports, strings_1, editorExtensions_1, editorContextKeys_1, codeAction_1, nls, contextkey_1, types_1, codeActionController_1, codeActionModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$X2 = exports.$W2 = exports.$V2 = exports.$U2 = exports.$T2 = exports.$S2 = exports.$R2 = void 0;
    function contextKeyForSupportedActions(kind) {
        return contextkey_1.$Ii.regex(codeActionModel_1.$O2.keys()[0], new RegExp('(\\s|^)' + (0, strings_1.$qe)(kind.value) + '\\b'));
    }
    const argsSchema = {
        type: 'object',
        defaultSnippets: [{ body: { kind: '' } }],
        properties: {
            'kind': {
                type: 'string',
                description: nls.localize(0, null),
            },
            'apply': {
                type: 'string',
                description: nls.localize(1, null),
                default: "ifSingle" /* CodeActionAutoApply.IfSingle */,
                enum: ["first" /* CodeActionAutoApply.First */, "ifSingle" /* CodeActionAutoApply.IfSingle */, "never" /* CodeActionAutoApply.Never */],
                enumDescriptions: [
                    nls.localize(2, null),
                    nls.localize(3, null),
                    nls.localize(4, null),
                ]
            },
            'preferred': {
                type: 'boolean',
                default: false,
                description: nls.localize(5, null),
            }
        }
    };
    function triggerCodeActionsForEditorSelection(editor, notAvailableMessage, filter, autoApply, triggerAction = types_1.CodeActionTriggerSource.Default) {
        if (editor.hasModel()) {
            const controller = codeActionController_1.$Q2.get(editor);
            controller?.manualTriggerAtCurrentPosition(notAvailableMessage, triggerAction, filter, autoApply);
        }
    }
    class $R2 extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: codeAction_1.$B1,
                label: nls.localize(6, null),
                alias: 'Quick Fix...',
                precondition: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasCodeActionsProvider),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 89 /* KeyCode.Period */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(_accessor, editor) {
            return triggerCodeActionsForEditorSelection(editor, nls.localize(7, null), undefined, undefined, types_1.CodeActionTriggerSource.QuickFix);
        }
    }
    exports.$R2 = $R2;
    class $S2 extends editorExtensions_1.$rV {
        constructor() {
            super({
                id: codeAction_1.$A1,
                precondition: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasCodeActionsProvider),
                description: {
                    description: 'Trigger a code action',
                    args: [{ name: 'args', schema: argsSchema, }]
                }
            });
        }
        runEditorCommand(_accessor, editor, userArgs) {
            const args = types_1.$y1.fromUser(userArgs, {
                kind: types_1.$v1.Empty,
                apply: "ifSingle" /* CodeActionAutoApply.IfSingle */,
            });
            return triggerCodeActionsForEditorSelection(editor, typeof userArgs?.kind === 'string'
                ? args.preferred
                    ? nls.localize(8, null, userArgs.kind)
                    : nls.localize(9, null, userArgs.kind)
                : args.preferred
                    ? nls.localize(10, null)
                    : nls.localize(11, null), {
                include: args.kind,
                includeSourceActions: true,
                onlyIncludePreferredActions: args.preferred,
            }, args.apply);
        }
    }
    exports.$S2 = $S2;
    class $T2 extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: codeAction_1.$D1,
                label: nls.localize(12, null),
                alias: 'Refactor...',
                precondition: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasCodeActionsProvider),
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
                    when: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.writable, contextKeyForSupportedActions(types_1.$v1.Refactor)),
                },
                description: {
                    description: 'Refactor...',
                    args: [{ name: 'args', schema: argsSchema }]
                }
            });
        }
        run(_accessor, editor, userArgs) {
            const args = types_1.$y1.fromUser(userArgs, {
                kind: types_1.$v1.Refactor,
                apply: "never" /* CodeActionAutoApply.Never */
            });
            return triggerCodeActionsForEditorSelection(editor, typeof userArgs?.kind === 'string'
                ? args.preferred
                    ? nls.localize(13, null, userArgs.kind)
                    : nls.localize(14, null, userArgs.kind)
                : args.preferred
                    ? nls.localize(15, null)
                    : nls.localize(16, null), {
                include: types_1.$v1.Refactor.contains(args.kind) ? args.kind : types_1.$v1.None,
                onlyIncludePreferredActions: args.preferred
            }, args.apply, types_1.CodeActionTriggerSource.Refactor);
        }
    }
    exports.$T2 = $T2;
    class $U2 extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: codeAction_1.$F1,
                label: nls.localize(17, null),
                alias: 'Source Action...',
                precondition: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasCodeActionsProvider),
                contextMenuOpts: {
                    group: '1_modification',
                    order: 2.1,
                    when: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.writable, contextKeyForSupportedActions(types_1.$v1.Source)),
                },
                description: {
                    description: 'Source Action...',
                    args: [{ name: 'args', schema: argsSchema }]
                }
            });
        }
        run(_accessor, editor, userArgs) {
            const args = types_1.$y1.fromUser(userArgs, {
                kind: types_1.$v1.Source,
                apply: "never" /* CodeActionAutoApply.Never */
            });
            return triggerCodeActionsForEditorSelection(editor, typeof userArgs?.kind === 'string'
                ? args.preferred
                    ? nls.localize(18, null, userArgs.kind)
                    : nls.localize(19, null, userArgs.kind)
                : args.preferred
                    ? nls.localize(20, null)
                    : nls.localize(21, null), {
                include: types_1.$v1.Source.contains(args.kind) ? args.kind : types_1.$v1.None,
                includeSourceActions: true,
                onlyIncludePreferredActions: args.preferred,
            }, args.apply, types_1.CodeActionTriggerSource.SourceAction);
        }
    }
    exports.$U2 = $U2;
    class $V2 extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: codeAction_1.$G1,
                label: nls.localize(22, null),
                alias: 'Organize Imports',
                precondition: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.writable, contextKeyForSupportedActions(types_1.$v1.SourceOrganizeImports)),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 45 /* KeyCode.KeyO */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
            });
        }
        run(_accessor, editor) {
            return triggerCodeActionsForEditorSelection(editor, nls.localize(23, null), { include: types_1.$v1.SourceOrganizeImports, includeSourceActions: true }, "ifSingle" /* CodeActionAutoApply.IfSingle */, types_1.CodeActionTriggerSource.OrganizeImports);
        }
    }
    exports.$V2 = $V2;
    class $W2 extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: codeAction_1.$H1,
                label: nls.localize(24, null),
                alias: 'Fix All',
                precondition: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.writable, contextKeyForSupportedActions(types_1.$v1.SourceFixAll))
            });
        }
        run(_accessor, editor) {
            return triggerCodeActionsForEditorSelection(editor, nls.localize(25, null), { include: types_1.$v1.SourceFixAll, includeSourceActions: true }, "ifSingle" /* CodeActionAutoApply.IfSingle */, types_1.CodeActionTriggerSource.FixAll);
        }
    }
    exports.$W2 = $W2;
    class $X2 extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: codeAction_1.$C1,
                label: nls.localize(26, null),
                alias: 'Auto Fix...',
                precondition: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.writable, contextKeyForSupportedActions(types_1.$v1.QuickFix)),
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
            return triggerCodeActionsForEditorSelection(editor, nls.localize(27, null), {
                include: types_1.$v1.QuickFix,
                onlyIncludePreferredActions: true
            }, "ifSingle" /* CodeActionAutoApply.IfSingle */, types_1.CodeActionTriggerSource.AutoFix);
        }
    }
    exports.$X2 = $X2;
});
//# sourceMappingURL=codeActionCommands.js.map