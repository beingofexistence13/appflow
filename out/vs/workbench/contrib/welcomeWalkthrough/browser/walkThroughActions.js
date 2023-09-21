/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/welcomeWalkthrough/browser/walkThroughPart", "vs/editor/common/editorContextKeys", "vs/platform/contextkey/common/contextkey"], function (require, exports, editorService_1, walkThroughPart_1, editorContextKeys_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WalkThroughPageDown = exports.WalkThroughPageUp = exports.WalkThroughArrowDown = exports.WalkThroughArrowUp = void 0;
    exports.WalkThroughArrowUp = {
        id: 'workbench.action.interactivePlayground.arrowUp',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(walkThroughPart_1.WALK_THROUGH_FOCUS, editorContextKeys_1.EditorContextKeys.editorTextFocus.toNegated()),
        primary: 16 /* KeyCode.UpArrow */,
        handler: accessor => {
            const editorService = accessor.get(editorService_1.IEditorService);
            const activeEditorPane = editorService.activeEditorPane;
            if (activeEditorPane instanceof walkThroughPart_1.WalkThroughPart) {
                activeEditorPane.arrowUp();
            }
        }
    };
    exports.WalkThroughArrowDown = {
        id: 'workbench.action.interactivePlayground.arrowDown',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(walkThroughPart_1.WALK_THROUGH_FOCUS, editorContextKeys_1.EditorContextKeys.editorTextFocus.toNegated()),
        primary: 18 /* KeyCode.DownArrow */,
        handler: accessor => {
            const editorService = accessor.get(editorService_1.IEditorService);
            const activeEditorPane = editorService.activeEditorPane;
            if (activeEditorPane instanceof walkThroughPart_1.WalkThroughPart) {
                activeEditorPane.arrowDown();
            }
        }
    };
    exports.WalkThroughPageUp = {
        id: 'workbench.action.interactivePlayground.pageUp',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(walkThroughPart_1.WALK_THROUGH_FOCUS, editorContextKeys_1.EditorContextKeys.editorTextFocus.toNegated()),
        primary: 11 /* KeyCode.PageUp */,
        handler: accessor => {
            const editorService = accessor.get(editorService_1.IEditorService);
            const activeEditorPane = editorService.activeEditorPane;
            if (activeEditorPane instanceof walkThroughPart_1.WalkThroughPart) {
                activeEditorPane.pageUp();
            }
        }
    };
    exports.WalkThroughPageDown = {
        id: 'workbench.action.interactivePlayground.pageDown',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(walkThroughPart_1.WALK_THROUGH_FOCUS, editorContextKeys_1.EditorContextKeys.editorTextFocus.toNegated()),
        primary: 12 /* KeyCode.PageDown */,
        handler: accessor => {
            const editorService = accessor.get(editorService_1.IEditorService);
            const activeEditorPane = editorService.activeEditorPane;
            if (activeEditorPane instanceof walkThroughPart_1.WalkThroughPart) {
                activeEditorPane.pageDown();
            }
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Fsa1Rocm91Z2hBY3Rpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvd2VsY29tZVdhbGt0aHJvdWdoL2Jyb3dzZXIvd2Fsa1Rocm91Z2hBY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVNuRixRQUFBLGtCQUFrQixHQUE4QjtRQUM1RCxFQUFFLEVBQUUsZ0RBQWdEO1FBQ3BELE1BQU0sNkNBQW1DO1FBQ3pDLElBQUksRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FBQyxvQ0FBa0IsRUFBRSxxQ0FBaUIsQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDM0YsT0FBTywwQkFBaUI7UUFDeEIsT0FBTyxFQUFFLFFBQVEsQ0FBQyxFQUFFO1lBQ25CLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsOEJBQWMsQ0FBQyxDQUFDO1lBQ25ELE1BQU0sZ0JBQWdCLEdBQUcsYUFBYSxDQUFDLGdCQUFnQixDQUFDO1lBQ3hELElBQUksZ0JBQWdCLFlBQVksaUNBQWUsRUFBRTtnQkFDaEQsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDM0I7UUFDRixDQUFDO0tBQ0QsQ0FBQztJQUVXLFFBQUEsb0JBQW9CLEdBQThCO1FBQzlELEVBQUUsRUFBRSxrREFBa0Q7UUFDdEQsTUFBTSw2Q0FBbUM7UUFDekMsSUFBSSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLG9DQUFrQixFQUFFLHFDQUFpQixDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUMzRixPQUFPLDRCQUFtQjtRQUMxQixPQUFPLEVBQUUsUUFBUSxDQUFDLEVBQUU7WUFDbkIsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw4QkFBYyxDQUFDLENBQUM7WUFDbkQsTUFBTSxnQkFBZ0IsR0FBRyxhQUFhLENBQUMsZ0JBQWdCLENBQUM7WUFDeEQsSUFBSSxnQkFBZ0IsWUFBWSxpQ0FBZSxFQUFFO2dCQUNoRCxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQzthQUM3QjtRQUNGLENBQUM7S0FDRCxDQUFDO0lBRVcsUUFBQSxpQkFBaUIsR0FBOEI7UUFDM0QsRUFBRSxFQUFFLCtDQUErQztRQUNuRCxNQUFNLDZDQUFtQztRQUN6QyxJQUFJLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQUMsb0NBQWtCLEVBQUUscUNBQWlCLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQzNGLE9BQU8seUJBQWdCO1FBQ3ZCLE9BQU8sRUFBRSxRQUFRLENBQUMsRUFBRTtZQUNuQixNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDhCQUFjLENBQUMsQ0FBQztZQUNuRCxNQUFNLGdCQUFnQixHQUFHLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQztZQUN4RCxJQUFJLGdCQUFnQixZQUFZLGlDQUFlLEVBQUU7Z0JBQ2hELGdCQUFnQixDQUFDLE1BQU0sRUFBRSxDQUFDO2FBQzFCO1FBQ0YsQ0FBQztLQUNELENBQUM7SUFFVyxRQUFBLG1CQUFtQixHQUE4QjtRQUM3RCxFQUFFLEVBQUUsaURBQWlEO1FBQ3JELE1BQU0sNkNBQW1DO1FBQ3pDLElBQUksRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FBQyxvQ0FBa0IsRUFBRSxxQ0FBaUIsQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDM0YsT0FBTywyQkFBa0I7UUFDekIsT0FBTyxFQUFFLFFBQVEsQ0FBQyxFQUFFO1lBQ25CLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsOEJBQWMsQ0FBQyxDQUFDO1lBQ25ELE1BQU0sZ0JBQWdCLEdBQUcsYUFBYSxDQUFDLGdCQUFnQixDQUFDO1lBQ3hELElBQUksZ0JBQWdCLFlBQVksaUNBQWUsRUFBRTtnQkFDaEQsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDNUI7UUFDRixDQUFDO0tBQ0QsQ0FBQyJ9