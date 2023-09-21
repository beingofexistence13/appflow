/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/timeline/browser/timeline.contribution", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/extensions", "vs/platform/registry/common/platform", "vs/workbench/common/views", "vs/workbench/contrib/files/browser/explorerViewlet", "vs/workbench/contrib/timeline/common/timeline", "vs/workbench/contrib/timeline/common/timelineService", "./timelinePane", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/workbench/contrib/files/common/files", "vs/workbench/common/contextkeys", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry"], function (require, exports, nls_1, descriptors_1, extensions_1, platform_1, views_1, explorerViewlet_1, timeline_1, timelineService_1, timelinePane_1, configurationRegistry_1, contextkey_1, actions_1, commands_1, files_1, contextkeys_1, codicons_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$u1b = void 0;
    const timelineViewIcon = (0, iconRegistry_1.$9u)('timeline-view-icon', codicons_1.$Pj.history, (0, nls_1.localize)(0, null));
    const timelineOpenIcon = (0, iconRegistry_1.$9u)('timeline-open', codicons_1.$Pj.history, (0, nls_1.localize)(1, null));
    class $u1b {
        constructor() {
            this.id = timeline_1.$YI;
            this.name = timelinePane_1.$q1b.TITLE;
            this.containerIcon = timelineViewIcon;
            this.ctorDescriptor = new descriptors_1.$yh(timelinePane_1.$q1b);
            this.order = 2;
            this.weight = 30;
            this.collapsed = true;
            this.canToggleVisibility = true;
            this.hideByDefault = false;
            this.canMoveView = true;
            this.when = timelineService_1.$m1b;
            this.focusCommand = { id: 'timeline.focus' };
        }
    }
    exports.$u1b = $u1b;
    // Configuration
    const configurationRegistry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
    configurationRegistry.registerConfiguration({
        id: 'timeline',
        order: 1001,
        title: (0, nls_1.localize)(2, null),
        type: 'object',
        properties: {
            'timeline.pageSize': {
                type: ['number', 'null'],
                default: null,
                markdownDescription: (0, nls_1.localize)(3, null),
            },
            'timeline.pageOnScroll': {
                type: 'boolean',
                default: false,
                description: (0, nls_1.localize)(4, null),
            },
        }
    });
    platform_1.$8m.as(views_1.Extensions.ViewsRegistry).registerViews([new $u1b()], explorerViewlet_1.$TLb);
    var OpenTimelineAction;
    (function (OpenTimelineAction) {
        OpenTimelineAction.ID = 'files.openTimeline';
        OpenTimelineAction.LABEL = (0, nls_1.localize)(5, null);
        function handler() {
            return (accessor, arg) => {
                const service = accessor.get(timeline_1.$ZI);
                return service.setUri(arg);
            };
        }
        OpenTimelineAction.handler = handler;
    })(OpenTimelineAction || (OpenTimelineAction = {}));
    commands_1.$Gr.registerCommand(OpenTimelineAction.ID, OpenTimelineAction.handler());
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.ExplorerContext, ({
        group: '4_timeline',
        order: 1,
        command: {
            id: OpenTimelineAction.ID,
            title: OpenTimelineAction.LABEL,
            icon: timelineOpenIcon
        },
        when: contextkey_1.$Ii.and(files_1.$Qdb.toNegated(), contextkeys_1.$Kdb.HasResource, timelineService_1.$m1b)
    }));
    const timelineFilter = (0, iconRegistry_1.$9u)('timeline-filter', codicons_1.$Pj.filter, (0, nls_1.localize)(6, null));
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.TimelineTitle, {
        submenu: actions_1.$Ru.TimelineFilterSubMenu,
        title: (0, nls_1.localize)(7, null),
        group: 'navigation',
        order: 100,
        icon: timelineFilter
    });
    (0, extensions_1.$mr)(timeline_1.$ZI, timelineService_1.$n1b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=timeline.contribution.js.map