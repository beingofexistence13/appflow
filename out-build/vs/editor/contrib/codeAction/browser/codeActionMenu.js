/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/editor/contrib/codeAction/common/types", "vs/nls!vs/editor/contrib/codeAction/browser/codeActionMenu", "vs/base/browser/ui/codicons/codiconStyles", "vs/editor/contrib/symbolIcons/browser/symbolIcons"], function (require, exports, codicons_1, types_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$I2 = void 0;
    const uncategorizedCodeActionGroup = Object.freeze({ kind: types_1.$v1.Empty, title: (0, nls_1.localize)(0, null) });
    const codeActionGroups = Object.freeze([
        { kind: types_1.$v1.QuickFix, title: (0, nls_1.localize)(1, null) },
        { kind: types_1.$v1.RefactorExtract, title: (0, nls_1.localize)(2, null), icon: codicons_1.$Pj.wrench },
        { kind: types_1.$v1.RefactorInline, title: (0, nls_1.localize)(3, null), icon: codicons_1.$Pj.wrench },
        { kind: types_1.$v1.RefactorRewrite, title: (0, nls_1.localize)(4, null), icon: codicons_1.$Pj.wrench },
        { kind: types_1.$v1.RefactorMove, title: (0, nls_1.localize)(5, null), icon: codicons_1.$Pj.wrench },
        { kind: types_1.$v1.SurroundWith, title: (0, nls_1.localize)(6, null), icon: codicons_1.$Pj.symbolSnippet },
        { kind: types_1.$v1.Source, title: (0, nls_1.localize)(7, null), icon: codicons_1.$Pj.symbolFile },
        uncategorizedCodeActionGroup,
    ]);
    function $I2(inputCodeActions, showHeaders, keybindingResolver) {
        if (!showHeaders) {
            return inputCodeActions.map((action) => {
                return {
                    kind: "action" /* ActionListItemKind.Action */,
                    item: action,
                    group: uncategorizedCodeActionGroup,
                    disabled: !!action.action.disabled,
                    label: action.action.disabled || action.action.title,
                    canPreview: !!action.action.edit?.edits.length,
                };
            });
        }
        // Group code actions
        const menuEntries = codeActionGroups.map(group => ({ group, actions: [] }));
        for (const action of inputCodeActions) {
            const kind = action.action.kind ? new types_1.$v1(action.action.kind) : types_1.$v1.None;
            for (const menuEntry of menuEntries) {
                if (menuEntry.group.kind.contains(kind)) {
                    menuEntry.actions.push(action);
                    break;
                }
            }
        }
        const allMenuItems = [];
        for (const menuEntry of menuEntries) {
            if (menuEntry.actions.length) {
                allMenuItems.push({ kind: "header" /* ActionListItemKind.Header */, group: menuEntry.group });
                for (const action of menuEntry.actions) {
                    allMenuItems.push({
                        kind: "action" /* ActionListItemKind.Action */,
                        item: action,
                        group: menuEntry.group,
                        label: action.action.title,
                        disabled: !!action.action.disabled,
                        keybinding: keybindingResolver(action.action),
                    });
                }
            }
        }
        return allMenuItems;
    }
    exports.$I2 = $I2;
});
//# sourceMappingURL=codeActionMenu.js.map