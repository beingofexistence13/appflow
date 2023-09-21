/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/editor/contrib/codeAction/common/types", "vs/nls", "vs/base/browser/ui/codicons/codiconStyles", "vs/editor/contrib/symbolIcons/browser/symbolIcons"], function (require, exports, codicons_1, types_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toMenuItems = void 0;
    const uncategorizedCodeActionGroup = Object.freeze({ kind: types_1.CodeActionKind.Empty, title: (0, nls_1.localize)('codeAction.widget.id.more', 'More Actions...') });
    const codeActionGroups = Object.freeze([
        { kind: types_1.CodeActionKind.QuickFix, title: (0, nls_1.localize)('codeAction.widget.id.quickfix', 'Quick Fix') },
        { kind: types_1.CodeActionKind.RefactorExtract, title: (0, nls_1.localize)('codeAction.widget.id.extract', 'Extract'), icon: codicons_1.Codicon.wrench },
        { kind: types_1.CodeActionKind.RefactorInline, title: (0, nls_1.localize)('codeAction.widget.id.inline', 'Inline'), icon: codicons_1.Codicon.wrench },
        { kind: types_1.CodeActionKind.RefactorRewrite, title: (0, nls_1.localize)('codeAction.widget.id.convert', 'Rewrite'), icon: codicons_1.Codicon.wrench },
        { kind: types_1.CodeActionKind.RefactorMove, title: (0, nls_1.localize)('codeAction.widget.id.move', 'Move'), icon: codicons_1.Codicon.wrench },
        { kind: types_1.CodeActionKind.SurroundWith, title: (0, nls_1.localize)('codeAction.widget.id.surround', 'Surround With'), icon: codicons_1.Codicon.symbolSnippet },
        { kind: types_1.CodeActionKind.Source, title: (0, nls_1.localize)('codeAction.widget.id.source', 'Source Action'), icon: codicons_1.Codicon.symbolFile },
        uncategorizedCodeActionGroup,
    ]);
    function toMenuItems(inputCodeActions, showHeaders, keybindingResolver) {
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
            const kind = action.action.kind ? new types_1.CodeActionKind(action.action.kind) : types_1.CodeActionKind.None;
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
    exports.toMenuItems = toMenuItems;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUFjdGlvbk1lbnUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9jb2RlQWN0aW9uL2Jyb3dzZXIvY29kZUFjdGlvbk1lbnUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBa0JoRyxNQUFNLDRCQUE0QixHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQWMsRUFBRSxJQUFJLEVBQUUsc0JBQWMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLDJCQUEyQixFQUFFLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRWpLLE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBZ0I7UUFDckQsRUFBRSxJQUFJLEVBQUUsc0JBQWMsQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLCtCQUErQixFQUFFLFdBQVcsQ0FBQyxFQUFFO1FBQ2hHLEVBQUUsSUFBSSxFQUFFLHNCQUFjLENBQUMsZUFBZSxFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyw4QkFBOEIsRUFBRSxTQUFTLENBQUMsRUFBRSxJQUFJLEVBQUUsa0JBQU8sQ0FBQyxNQUFNLEVBQUU7UUFDMUgsRUFBRSxJQUFJLEVBQUUsc0JBQWMsQ0FBQyxjQUFjLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLDZCQUE2QixFQUFFLFFBQVEsQ0FBQyxFQUFFLElBQUksRUFBRSxrQkFBTyxDQUFDLE1BQU0sRUFBRTtRQUN2SCxFQUFFLElBQUksRUFBRSxzQkFBYyxDQUFDLGVBQWUsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsOEJBQThCLEVBQUUsU0FBUyxDQUFDLEVBQUUsSUFBSSxFQUFFLGtCQUFPLENBQUMsTUFBTSxFQUFFO1FBQzFILEVBQUUsSUFBSSxFQUFFLHNCQUFjLENBQUMsWUFBWSxFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQywyQkFBMkIsRUFBRSxNQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsa0JBQU8sQ0FBQyxNQUFNLEVBQUU7UUFDakgsRUFBRSxJQUFJLEVBQUUsc0JBQWMsQ0FBQyxZQUFZLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLCtCQUErQixFQUFFLGVBQWUsQ0FBQyxFQUFFLElBQUksRUFBRSxrQkFBTyxDQUFDLGFBQWEsRUFBRTtRQUNySSxFQUFFLElBQUksRUFBRSxzQkFBYyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsNkJBQTZCLEVBQUUsZUFBZSxDQUFDLEVBQUUsSUFBSSxFQUFFLGtCQUFPLENBQUMsVUFBVSxFQUFFO1FBQzFILDRCQUE0QjtLQUM1QixDQUFDLENBQUM7SUFFSCxTQUFnQixXQUFXLENBQzFCLGdCQUEyQyxFQUMzQyxXQUFvQixFQUNwQixrQkFBMEU7UUFFMUUsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNqQixPQUFPLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBbUMsRUFBRTtnQkFDdkUsT0FBTztvQkFDTixJQUFJLDBDQUEyQjtvQkFDL0IsSUFBSSxFQUFFLE1BQU07b0JBQ1osS0FBSyxFQUFFLDRCQUE0QjtvQkFDbkMsUUFBUSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVE7b0JBQ2xDLEtBQUssRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUs7b0JBQ3BELFVBQVUsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLE1BQU07aUJBQzlDLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztTQUNIO1FBRUQscUJBQXFCO1FBQ3JCLE1BQU0sV0FBVyxHQUFHLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQXNCLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFaEcsS0FBSyxNQUFNLE1BQU0sSUFBSSxnQkFBZ0IsRUFBRTtZQUN0QyxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxzQkFBYyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLHNCQUFjLENBQUMsSUFBSSxDQUFDO1lBQy9GLEtBQUssTUFBTSxTQUFTLElBQUksV0FBVyxFQUFFO2dCQUNwQyxJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDeEMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQy9CLE1BQU07aUJBQ047YUFDRDtTQUNEO1FBRUQsTUFBTSxZQUFZLEdBQXNDLEVBQUUsQ0FBQztRQUMzRCxLQUFLLE1BQU0sU0FBUyxJQUFJLFdBQVcsRUFBRTtZQUNwQyxJQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFO2dCQUM3QixZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSwwQ0FBMkIsRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7Z0JBQy9FLEtBQUssTUFBTSxNQUFNLElBQUksU0FBUyxDQUFDLE9BQU8sRUFBRTtvQkFDdkMsWUFBWSxDQUFDLElBQUksQ0FBQzt3QkFDakIsSUFBSSwwQ0FBMkI7d0JBQy9CLElBQUksRUFBRSxNQUFNO3dCQUNaLEtBQUssRUFBRSxTQUFTLENBQUMsS0FBSzt3QkFDdEIsS0FBSyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSzt3QkFDMUIsUUFBUSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVE7d0JBQ2xDLFVBQVUsRUFBRSxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO3FCQUM3QyxDQUFDLENBQUM7aUJBQ0g7YUFDRDtTQUNEO1FBQ0QsT0FBTyxZQUFZLENBQUM7SUFDckIsQ0FBQztJQWhERCxrQ0FnREMifQ==