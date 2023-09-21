define(["require", "exports", "vs/nls", "vs/workbench/contrib/emmet/browser/emmetActions", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions"], function (require, exports, nls, emmetActions_1, editorExtensions_1, editorContextKeys_1, contextkey_1, actions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ExpandAbbreviationAction extends emmetActions_1.EmmetEditorAction {
        constructor() {
            super({
                id: 'editor.emmet.action.expandAbbreviation',
                label: nls.localize('expandAbbreviationAction', "Emmet: Expand Abbreviation"),
                alias: 'Emmet: Expand Abbreviation',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                actionName: 'expand_abbreviation',
                kbOpts: {
                    primary: 2 /* KeyCode.Tab */,
                    kbExpr: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.editorTextFocus, editorContextKeys_1.EditorContextKeys.tabDoesNotMoveFocus, contextkey_1.ContextKeyExpr.has('config.emmet.triggerExpansionOnTab')),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menuOpts: {
                    menuId: actions_1.MenuId.MenubarEditMenu,
                    group: '5_insert',
                    title: nls.localize({ key: 'miEmmetExpandAbbreviation', comment: ['&& denotes a mnemonic'] }, "Emmet: E&&xpand Abbreviation"),
                    order: 3
                }
            });
        }
    }
    (0, editorExtensions_1.registerEditorAction)(ExpandAbbreviationAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwYW5kQWJicmV2aWF0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZW1tZXQvYnJvd3Nlci9hY3Rpb25zL2V4cGFuZEFiYnJldmlhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFhQSxNQUFNLHdCQUF5QixTQUFRLGdDQUFpQjtRQUV2RDtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsd0NBQXdDO2dCQUM1QyxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQywwQkFBMEIsRUFBRSw0QkFBNEIsQ0FBQztnQkFDN0UsS0FBSyxFQUFFLDRCQUE0QjtnQkFDbkMsWUFBWSxFQUFFLHFDQUFpQixDQUFDLFFBQVE7Z0JBQ3hDLFVBQVUsRUFBRSxxQkFBcUI7Z0JBQ2pDLE1BQU0sRUFBRTtvQkFDUCxPQUFPLHFCQUFhO29CQUNwQixNQUFNLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQ3pCLHFDQUFpQixDQUFDLGVBQWUsRUFDakMscUNBQWlCLENBQUMsbUJBQW1CLEVBQ3JDLDJCQUFjLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxDQUFDLENBQ3hEO29CQUNELE1BQU0sMENBQWdDO2lCQUN0QztnQkFDRCxRQUFRLEVBQUU7b0JBQ1QsTUFBTSxFQUFFLGdCQUFNLENBQUMsZUFBZTtvQkFDOUIsS0FBSyxFQUFFLFVBQVU7b0JBQ2pCLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsR0FBRyxFQUFFLDJCQUEyQixFQUFFLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsRUFBRSw4QkFBOEIsQ0FBQztvQkFDN0gsS0FBSyxFQUFFLENBQUM7aUJBQ1I7YUFDRCxDQUFDLENBQUM7UUFFSixDQUFDO0tBQ0Q7SUFFRCxJQUFBLHVDQUFvQixFQUFDLHdCQUF3QixDQUFDLENBQUMifQ==