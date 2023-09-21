define(["require", "exports", "vs/nls!vs/workbench/contrib/emmet/browser/actions/expandAbbreviation", "vs/workbench/contrib/emmet/browser/emmetActions", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions"], function (require, exports, nls, emmetActions_1, editorExtensions_1, editorContextKeys_1, contextkey_1, actions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ExpandAbbreviationAction extends emmetActions_1.$6Xb {
        constructor() {
            super({
                id: 'editor.emmet.action.expandAbbreviation',
                label: nls.localize(0, null),
                alias: 'Emmet: Expand Abbreviation',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                actionName: 'expand_abbreviation',
                kbOpts: {
                    primary: 2 /* KeyCode.Tab */,
                    kbExpr: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.editorTextFocus, editorContextKeys_1.EditorContextKeys.tabDoesNotMoveFocus, contextkey_1.$Ii.has('config.emmet.triggerExpansionOnTab')),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menuOpts: {
                    menuId: actions_1.$Ru.MenubarEditMenu,
                    group: '5_insert',
                    title: nls.localize(1, null),
                    order: 3
                }
            });
        }
    }
    (0, editorExtensions_1.$xV)(ExpandAbbreviationAction);
});
//# sourceMappingURL=expandAbbreviation.js.map