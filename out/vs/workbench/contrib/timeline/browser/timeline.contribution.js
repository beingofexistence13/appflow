/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/extensions", "vs/platform/registry/common/platform", "vs/workbench/common/views", "vs/workbench/contrib/files/browser/explorerViewlet", "vs/workbench/contrib/timeline/common/timeline", "vs/workbench/contrib/timeline/common/timelineService", "./timelinePane", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/workbench/contrib/files/common/files", "vs/workbench/common/contextkeys", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry"], function (require, exports, nls_1, descriptors_1, extensions_1, platform_1, views_1, explorerViewlet_1, timeline_1, timelineService_1, timelinePane_1, configurationRegistry_1, contextkey_1, actions_1, commands_1, files_1, contextkeys_1, codicons_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TimelinePaneDescriptor = void 0;
    const timelineViewIcon = (0, iconRegistry_1.registerIcon)('timeline-view-icon', codicons_1.Codicon.history, (0, nls_1.localize)('timelineViewIcon', 'View icon of the timeline view.'));
    const timelineOpenIcon = (0, iconRegistry_1.registerIcon)('timeline-open', codicons_1.Codicon.history, (0, nls_1.localize)('timelineOpenIcon', 'Icon for the open timeline action.'));
    class TimelinePaneDescriptor {
        constructor() {
            this.id = timeline_1.TimelinePaneId;
            this.name = timelinePane_1.TimelinePane.TITLE;
            this.containerIcon = timelineViewIcon;
            this.ctorDescriptor = new descriptors_1.SyncDescriptor(timelinePane_1.TimelinePane);
            this.order = 2;
            this.weight = 30;
            this.collapsed = true;
            this.canToggleVisibility = true;
            this.hideByDefault = false;
            this.canMoveView = true;
            this.when = timelineService_1.TimelineHasProviderContext;
            this.focusCommand = { id: 'timeline.focus' };
        }
    }
    exports.TimelinePaneDescriptor = TimelinePaneDescriptor;
    // Configuration
    const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        id: 'timeline',
        order: 1001,
        title: (0, nls_1.localize)('timelineConfigurationTitle', "Timeline"),
        type: 'object',
        properties: {
            'timeline.pageSize': {
                type: ['number', 'null'],
                default: null,
                markdownDescription: (0, nls_1.localize)('timeline.pageSize', "The number of items to show in the Timeline view by default and when loading more items. Setting to `null` (the default) will automatically choose a page size based on the visible area of the Timeline view."),
            },
            'timeline.pageOnScroll': {
                type: 'boolean',
                default: false,
                description: (0, nls_1.localize)('timeline.pageOnScroll', "Experimental. Controls whether the Timeline view will load the next page of items when you scroll to the end of the list."),
            },
        }
    });
    platform_1.Registry.as(views_1.Extensions.ViewsRegistry).registerViews([new TimelinePaneDescriptor()], explorerViewlet_1.VIEW_CONTAINER);
    var OpenTimelineAction;
    (function (OpenTimelineAction) {
        OpenTimelineAction.ID = 'files.openTimeline';
        OpenTimelineAction.LABEL = (0, nls_1.localize)('files.openTimeline', "Open Timeline");
        function handler() {
            return (accessor, arg) => {
                const service = accessor.get(timeline_1.ITimelineService);
                return service.setUri(arg);
            };
        }
        OpenTimelineAction.handler = handler;
    })(OpenTimelineAction || (OpenTimelineAction = {}));
    commands_1.CommandsRegistry.registerCommand(OpenTimelineAction.ID, OpenTimelineAction.handler());
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, ({
        group: '4_timeline',
        order: 1,
        command: {
            id: OpenTimelineAction.ID,
            title: OpenTimelineAction.LABEL,
            icon: timelineOpenIcon
        },
        when: contextkey_1.ContextKeyExpr.and(files_1.ExplorerFolderContext.toNegated(), contextkeys_1.ResourceContextKey.HasResource, timelineService_1.TimelineHasProviderContext)
    }));
    const timelineFilter = (0, iconRegistry_1.registerIcon)('timeline-filter', codicons_1.Codicon.filter, (0, nls_1.localize)('timelineFilter', 'Icon for the filter timeline action.'));
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.TimelineTitle, {
        submenu: actions_1.MenuId.TimelineFilterSubMenu,
        title: (0, nls_1.localize)('filterTimeline', "Filter Timeline"),
        group: 'navigation',
        order: 100,
        icon: timelineFilter
    });
    (0, extensions_1.registerSingleton)(timeline_1.ITimelineService, timelineService_1.TimelineService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZWxpbmUuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGltZWxpbmUvYnJvd3Nlci90aW1lbGluZS5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBb0JoRyxNQUFNLGdCQUFnQixHQUFHLElBQUEsMkJBQVksRUFBQyxvQkFBb0IsRUFBRSxrQkFBTyxDQUFDLE9BQU8sRUFBRSxJQUFBLGNBQVEsRUFBQyxrQkFBa0IsRUFBRSxpQ0FBaUMsQ0FBQyxDQUFDLENBQUM7SUFDOUksTUFBTSxnQkFBZ0IsR0FBRyxJQUFBLDJCQUFZLEVBQUMsZUFBZSxFQUFFLGtCQUFPLENBQUMsT0FBTyxFQUFFLElBQUEsY0FBUSxFQUFDLGtCQUFrQixFQUFFLG9DQUFvQyxDQUFDLENBQUMsQ0FBQztJQUU1SSxNQUFhLHNCQUFzQjtRQUFuQztZQUNVLE9BQUUsR0FBRyx5QkFBYyxDQUFDO1lBQ3BCLFNBQUksR0FBRywyQkFBWSxDQUFDLEtBQUssQ0FBQztZQUMxQixrQkFBYSxHQUFHLGdCQUFnQixDQUFDO1lBQ2pDLG1CQUFjLEdBQUcsSUFBSSw0QkFBYyxDQUFDLDJCQUFZLENBQUMsQ0FBQztZQUNsRCxVQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQ1YsV0FBTSxHQUFHLEVBQUUsQ0FBQztZQUNaLGNBQVMsR0FBRyxJQUFJLENBQUM7WUFDakIsd0JBQW1CLEdBQUcsSUFBSSxDQUFDO1lBQzNCLGtCQUFhLEdBQUcsS0FBSyxDQUFDO1lBQ3RCLGdCQUFXLEdBQUcsSUFBSSxDQUFDO1lBQ25CLFNBQUksR0FBRyw0Q0FBMEIsQ0FBQztZQUUzQyxpQkFBWSxHQUFHLEVBQUUsRUFBRSxFQUFFLGdCQUFnQixFQUFFLENBQUM7UUFDekMsQ0FBQztLQUFBO0lBZEQsd0RBY0M7SUFFRCxnQkFBZ0I7SUFDaEIsTUFBTSxxQkFBcUIsR0FBRyxtQkFBUSxDQUFDLEVBQUUsQ0FBeUIsa0NBQXVCLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDekcscUJBQXFCLENBQUMscUJBQXFCLENBQUM7UUFDM0MsRUFBRSxFQUFFLFVBQVU7UUFDZCxLQUFLLEVBQUUsSUFBSTtRQUNYLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyw0QkFBNEIsRUFBRSxVQUFVLENBQUM7UUFDekQsSUFBSSxFQUFFLFFBQVE7UUFDZCxVQUFVLEVBQUU7WUFDWCxtQkFBbUIsRUFBRTtnQkFDcEIsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQztnQkFDeEIsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsbUJBQW1CLEVBQUUsSUFBQSxjQUFRLEVBQUMsbUJBQW1CLEVBQUUsZ05BQWdOLENBQUM7YUFDcFE7WUFDRCx1QkFBdUIsRUFBRTtnQkFDeEIsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsT0FBTyxFQUFFLEtBQUs7Z0JBQ2QsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLHVCQUF1QixFQUFFLDJIQUEySCxDQUFDO2FBQzNLO1NBQ0Q7S0FDRCxDQUFDLENBQUM7SUFFSCxtQkFBUSxDQUFDLEVBQUUsQ0FBaUIsa0JBQWMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLHNCQUFzQixFQUFFLENBQUMsRUFBRSxnQ0FBYyxDQUFDLENBQUM7SUFFeEgsSUFBVSxrQkFBa0IsQ0FXM0I7SUFYRCxXQUFVLGtCQUFrQjtRQUVkLHFCQUFFLEdBQUcsb0JBQW9CLENBQUM7UUFDMUIsd0JBQUssR0FBRyxJQUFBLGNBQVEsRUFBQyxvQkFBb0IsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUVyRSxTQUFnQixPQUFPO1lBQ3RCLE9BQU8sQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEVBQUU7Z0JBQ3hCLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsMkJBQWdCLENBQUMsQ0FBQztnQkFDL0MsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzVCLENBQUMsQ0FBQztRQUNILENBQUM7UUFMZSwwQkFBTyxVQUt0QixDQUFBO0lBQ0YsQ0FBQyxFQVhTLGtCQUFrQixLQUFsQixrQkFBa0IsUUFXM0I7SUFFRCwyQkFBZ0IsQ0FBQyxlQUFlLENBQUMsa0JBQWtCLENBQUMsRUFBRSxFQUFFLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFFdEYsc0JBQVksQ0FBQyxjQUFjLENBQUMsZ0JBQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUNwRCxLQUFLLEVBQUUsWUFBWTtRQUNuQixLQUFLLEVBQUUsQ0FBQztRQUNSLE9BQU8sRUFBRTtZQUNSLEVBQUUsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFO1lBQ3pCLEtBQUssRUFBRSxrQkFBa0IsQ0FBQyxLQUFLO1lBQy9CLElBQUksRUFBRSxnQkFBZ0I7U0FDdEI7UUFDRCxJQUFJLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQUMsNkJBQXFCLENBQUMsU0FBUyxFQUFFLEVBQUUsZ0NBQWtCLENBQUMsV0FBVyxFQUFFLDRDQUEwQixDQUFDO0tBQ3ZILENBQUMsQ0FBQyxDQUFDO0lBRUosTUFBTSxjQUFjLEdBQUcsSUFBQSwyQkFBWSxFQUFDLGlCQUFpQixFQUFFLGtCQUFPLENBQUMsTUFBTSxFQUFFLElBQUEsY0FBUSxFQUFDLGdCQUFnQixFQUFFLHNDQUFzQyxDQUFDLENBQUMsQ0FBQztJQUUzSSxzQkFBWSxDQUFDLGNBQWMsQ0FBQyxnQkFBTSxDQUFDLGFBQWEsRUFBZ0I7UUFDL0QsT0FBTyxFQUFFLGdCQUFNLENBQUMscUJBQXFCO1FBQ3JDLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxnQkFBZ0IsRUFBRSxpQkFBaUIsQ0FBQztRQUNwRCxLQUFLLEVBQUUsWUFBWTtRQUNuQixLQUFLLEVBQUUsR0FBRztRQUNWLElBQUksRUFBRSxjQUFjO0tBQ3BCLENBQUMsQ0FBQztJQUVILElBQUEsOEJBQWlCLEVBQUMsMkJBQWdCLEVBQUUsaUNBQWUsb0NBQTRCLENBQUMifQ==