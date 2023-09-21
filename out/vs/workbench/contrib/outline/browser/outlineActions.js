/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/codicons", "vs/platform/actions/common/actions", "vs/workbench/browser/parts/views/viewPane", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/outline/browser/outline"], function (require, exports, nls_1, codicons_1, actions_1, viewPane_1, contextkey_1, outline_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // --- commands
    (0, actions_1.registerAction2)(class CollapseAll extends viewPane_1.ViewAction {
        constructor() {
            super({
                viewId: outline_1.IOutlinePane.Id,
                id: 'outline.collapse',
                title: (0, nls_1.localize)('collapse', "Collapse All"),
                f1: false,
                icon: codicons_1.Codicon.collapseAll,
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', outline_1.IOutlinePane.Id), outline_1.ctxAllCollapsed.isEqualTo(false))
                }
            });
        }
        runInView(_accessor, view) {
            view.collapseAll();
        }
    });
    (0, actions_1.registerAction2)(class ExpandAll extends viewPane_1.ViewAction {
        constructor() {
            super({
                viewId: outline_1.IOutlinePane.Id,
                id: 'outline.expand',
                title: (0, nls_1.localize)('expand', "Expand All"),
                f1: false,
                icon: codicons_1.Codicon.expandAll,
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', outline_1.IOutlinePane.Id), outline_1.ctxAllCollapsed.isEqualTo(true))
                }
            });
        }
        runInView(_accessor, view) {
            view.expandAll();
        }
    });
    (0, actions_1.registerAction2)(class FollowCursor extends viewPane_1.ViewAction {
        constructor() {
            super({
                viewId: outline_1.IOutlinePane.Id,
                id: 'outline.followCursor',
                title: (0, nls_1.localize)('followCur', "Follow Cursor"),
                f1: false,
                toggled: outline_1.ctxFollowsCursor,
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    group: 'config',
                    order: 1,
                    when: contextkey_1.ContextKeyExpr.equals('view', outline_1.IOutlinePane.Id)
                }
            });
        }
        runInView(_accessor, view) {
            view.outlineViewState.followCursor = !view.outlineViewState.followCursor;
        }
    });
    (0, actions_1.registerAction2)(class FilterOnType extends viewPane_1.ViewAction {
        constructor() {
            super({
                viewId: outline_1.IOutlinePane.Id,
                id: 'outline.filterOnType',
                title: (0, nls_1.localize)('filterOnType', "Filter on Type"),
                f1: false,
                toggled: outline_1.ctxFilterOnType,
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    group: 'config',
                    order: 2,
                    when: contextkey_1.ContextKeyExpr.equals('view', outline_1.IOutlinePane.Id)
                }
            });
        }
        runInView(_accessor, view) {
            view.outlineViewState.filterOnType = !view.outlineViewState.filterOnType;
        }
    });
    (0, actions_1.registerAction2)(class SortByPosition extends viewPane_1.ViewAction {
        constructor() {
            super({
                viewId: outline_1.IOutlinePane.Id,
                id: 'outline.sortByPosition',
                title: (0, nls_1.localize)('sortByPosition', "Sort By: Position"),
                f1: false,
                toggled: outline_1.ctxSortMode.isEqualTo(0 /* OutlineSortOrder.ByPosition */),
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    group: 'sort',
                    order: 1,
                    when: contextkey_1.ContextKeyExpr.equals('view', outline_1.IOutlinePane.Id)
                }
            });
        }
        runInView(_accessor, view) {
            view.outlineViewState.sortBy = 0 /* OutlineSortOrder.ByPosition */;
        }
    });
    (0, actions_1.registerAction2)(class SortByName extends viewPane_1.ViewAction {
        constructor() {
            super({
                viewId: outline_1.IOutlinePane.Id,
                id: 'outline.sortByName',
                title: (0, nls_1.localize)('sortByName', "Sort By: Name"),
                f1: false,
                toggled: outline_1.ctxSortMode.isEqualTo(1 /* OutlineSortOrder.ByName */),
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    group: 'sort',
                    order: 2,
                    when: contextkey_1.ContextKeyExpr.equals('view', outline_1.IOutlinePane.Id)
                }
            });
        }
        runInView(_accessor, view) {
            view.outlineViewState.sortBy = 1 /* OutlineSortOrder.ByName */;
        }
    });
    (0, actions_1.registerAction2)(class SortByKind extends viewPane_1.ViewAction {
        constructor() {
            super({
                viewId: outline_1.IOutlinePane.Id,
                id: 'outline.sortByKind',
                title: (0, nls_1.localize)('sortByKind', "Sort By: Category"),
                f1: false,
                toggled: outline_1.ctxSortMode.isEqualTo(2 /* OutlineSortOrder.ByKind */),
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    group: 'sort',
                    order: 3,
                    when: contextkey_1.ContextKeyExpr.equals('view', outline_1.IOutlinePane.Id)
                }
            });
        }
        runInView(_accessor, view) {
            view.outlineViewState.sortBy = 2 /* OutlineSortOrder.ByKind */;
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0bGluZUFjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9vdXRsaW5lL2Jyb3dzZXIvb3V0bGluZUFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFXaEcsZUFBZTtJQUVmLElBQUEseUJBQWUsRUFBQyxNQUFNLFdBQVksU0FBUSxxQkFBd0I7UUFDakU7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsTUFBTSxFQUFFLHNCQUFZLENBQUMsRUFBRTtnQkFDdkIsRUFBRSxFQUFFLGtCQUFrQjtnQkFDdEIsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLFVBQVUsRUFBRSxjQUFjLENBQUM7Z0JBQzNDLEVBQUUsRUFBRSxLQUFLO2dCQUNULElBQUksRUFBRSxrQkFBTyxDQUFDLFdBQVc7Z0JBQ3pCLElBQUksRUFBRTtvQkFDTCxFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxTQUFTO29CQUNwQixLQUFLLEVBQUUsWUFBWTtvQkFDbkIsSUFBSSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLDJCQUFjLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxzQkFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLHlCQUFlLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUMxRzthQUNELENBQUMsQ0FBQztRQUNKLENBQUM7UUFDRCxTQUFTLENBQUMsU0FBMkIsRUFBRSxJQUFrQjtZQUN4RCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDcEIsQ0FBQztLQUNELENBQUMsQ0FBQztJQUVILElBQUEseUJBQWUsRUFBQyxNQUFNLFNBQVUsU0FBUSxxQkFBd0I7UUFDL0Q7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsTUFBTSxFQUFFLHNCQUFZLENBQUMsRUFBRTtnQkFDdkIsRUFBRSxFQUFFLGdCQUFnQjtnQkFDcEIsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLFFBQVEsRUFBRSxZQUFZLENBQUM7Z0JBQ3ZDLEVBQUUsRUFBRSxLQUFLO2dCQUNULElBQUksRUFBRSxrQkFBTyxDQUFDLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRTtvQkFDTCxFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxTQUFTO29CQUNwQixLQUFLLEVBQUUsWUFBWTtvQkFDbkIsSUFBSSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLDJCQUFjLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxzQkFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLHlCQUFlLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUN6RzthQUNELENBQUMsQ0FBQztRQUNKLENBQUM7UUFDRCxTQUFTLENBQUMsU0FBMkIsRUFBRSxJQUFrQjtZQUN4RCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDbEIsQ0FBQztLQUNELENBQUMsQ0FBQztJQUVILElBQUEseUJBQWUsRUFBQyxNQUFNLFlBQWEsU0FBUSxxQkFBd0I7UUFDbEU7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsTUFBTSxFQUFFLHNCQUFZLENBQUMsRUFBRTtnQkFDdkIsRUFBRSxFQUFFLHNCQUFzQjtnQkFDMUIsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLFdBQVcsRUFBRSxlQUFlLENBQUM7Z0JBQzdDLEVBQUUsRUFBRSxLQUFLO2dCQUNULE9BQU8sRUFBRSwwQkFBZ0I7Z0JBQ3pCLElBQUksRUFBRTtvQkFDTCxFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxTQUFTO29CQUNwQixLQUFLLEVBQUUsUUFBUTtvQkFDZixLQUFLLEVBQUUsQ0FBQztvQkFDUixJQUFJLEVBQUUsMkJBQWMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLHNCQUFZLENBQUMsRUFBRSxDQUFDO2lCQUNwRDthQUNELENBQUMsQ0FBQztRQUNKLENBQUM7UUFDRCxTQUFTLENBQUMsU0FBMkIsRUFBRSxJQUFrQjtZQUN4RCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQztRQUMxRSxDQUFDO0tBQ0QsQ0FBQyxDQUFDO0lBRUgsSUFBQSx5QkFBZSxFQUFDLE1BQU0sWUFBYSxTQUFRLHFCQUF3QjtRQUNsRTtZQUNDLEtBQUssQ0FBQztnQkFDTCxNQUFNLEVBQUUsc0JBQVksQ0FBQyxFQUFFO2dCQUN2QixFQUFFLEVBQUUsc0JBQXNCO2dCQUMxQixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsY0FBYyxFQUFFLGdCQUFnQixDQUFDO2dCQUNqRCxFQUFFLEVBQUUsS0FBSztnQkFDVCxPQUFPLEVBQUUseUJBQWU7Z0JBQ3hCLElBQUksRUFBRTtvQkFDTCxFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxTQUFTO29CQUNwQixLQUFLLEVBQUUsUUFBUTtvQkFDZixLQUFLLEVBQUUsQ0FBQztvQkFDUixJQUFJLEVBQUUsMkJBQWMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLHNCQUFZLENBQUMsRUFBRSxDQUFDO2lCQUNwRDthQUNELENBQUMsQ0FBQztRQUNKLENBQUM7UUFDRCxTQUFTLENBQUMsU0FBMkIsRUFBRSxJQUFrQjtZQUN4RCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQztRQUMxRSxDQUFDO0tBQ0QsQ0FBQyxDQUFDO0lBR0gsSUFBQSx5QkFBZSxFQUFDLE1BQU0sY0FBZSxTQUFRLHFCQUF3QjtRQUNwRTtZQUNDLEtBQUssQ0FBQztnQkFDTCxNQUFNLEVBQUUsc0JBQVksQ0FBQyxFQUFFO2dCQUN2QixFQUFFLEVBQUUsd0JBQXdCO2dCQUM1QixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsZ0JBQWdCLEVBQUUsbUJBQW1CLENBQUM7Z0JBQ3RELEVBQUUsRUFBRSxLQUFLO2dCQUNULE9BQU8sRUFBRSxxQkFBVyxDQUFDLFNBQVMscUNBQTZCO2dCQUMzRCxJQUFJLEVBQUU7b0JBQ0wsRUFBRSxFQUFFLGdCQUFNLENBQUMsU0FBUztvQkFDcEIsS0FBSyxFQUFFLE1BQU07b0JBQ2IsS0FBSyxFQUFFLENBQUM7b0JBQ1IsSUFBSSxFQUFFLDJCQUFjLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxzQkFBWSxDQUFDLEVBQUUsQ0FBQztpQkFDcEQ7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBQ0QsU0FBUyxDQUFDLFNBQTJCLEVBQUUsSUFBa0I7WUFDeEQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sc0NBQThCLENBQUM7UUFDNUQsQ0FBQztLQUNELENBQUMsQ0FBQztJQUVILElBQUEseUJBQWUsRUFBQyxNQUFNLFVBQVcsU0FBUSxxQkFBd0I7UUFDaEU7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsTUFBTSxFQUFFLHNCQUFZLENBQUMsRUFBRTtnQkFDdkIsRUFBRSxFQUFFLG9CQUFvQjtnQkFDeEIsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLFlBQVksRUFBRSxlQUFlLENBQUM7Z0JBQzlDLEVBQUUsRUFBRSxLQUFLO2dCQUNULE9BQU8sRUFBRSxxQkFBVyxDQUFDLFNBQVMsaUNBQXlCO2dCQUN2RCxJQUFJLEVBQUU7b0JBQ0wsRUFBRSxFQUFFLGdCQUFNLENBQUMsU0FBUztvQkFDcEIsS0FBSyxFQUFFLE1BQU07b0JBQ2IsS0FBSyxFQUFFLENBQUM7b0JBQ1IsSUFBSSxFQUFFLDJCQUFjLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxzQkFBWSxDQUFDLEVBQUUsQ0FBQztpQkFDcEQ7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBQ0QsU0FBUyxDQUFDLFNBQTJCLEVBQUUsSUFBa0I7WUFDeEQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sa0NBQTBCLENBQUM7UUFDeEQsQ0FBQztLQUNELENBQUMsQ0FBQztJQUVILElBQUEseUJBQWUsRUFBQyxNQUFNLFVBQVcsU0FBUSxxQkFBd0I7UUFDaEU7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsTUFBTSxFQUFFLHNCQUFZLENBQUMsRUFBRTtnQkFDdkIsRUFBRSxFQUFFLG9CQUFvQjtnQkFDeEIsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLFlBQVksRUFBRSxtQkFBbUIsQ0FBQztnQkFDbEQsRUFBRSxFQUFFLEtBQUs7Z0JBQ1QsT0FBTyxFQUFFLHFCQUFXLENBQUMsU0FBUyxpQ0FBeUI7Z0JBQ3ZELElBQUksRUFBRTtvQkFDTCxFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxTQUFTO29CQUNwQixLQUFLLEVBQUUsTUFBTTtvQkFDYixLQUFLLEVBQUUsQ0FBQztvQkFDUixJQUFJLEVBQUUsMkJBQWMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLHNCQUFZLENBQUMsRUFBRSxDQUFDO2lCQUNwRDthQUNELENBQUMsQ0FBQztRQUNKLENBQUM7UUFDRCxTQUFTLENBQUMsU0FBMkIsRUFBRSxJQUFrQjtZQUN4RCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxrQ0FBMEIsQ0FBQztRQUN4RCxDQUFDO0tBQ0QsQ0FBQyxDQUFDIn0=