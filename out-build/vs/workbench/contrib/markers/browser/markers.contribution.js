/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/platform/contextkey/common/contextkey", "vs/platform/configuration/common/configurationRegistry", "vs/platform/action/common/actionCommonCategories", "vs/platform/keybinding/common/keybindingsRegistry", "vs/nls!vs/workbench/contrib/markers/browser/markers.contribution", "vs/workbench/contrib/markers/browser/markersModel", "vs/workbench/contrib/markers/browser/markersView", "vs/platform/actions/common/actions", "vs/platform/registry/common/platform", "vs/workbench/contrib/markers/common/markers", "vs/workbench/contrib/markers/browser/messages", "vs/workbench/common/contributions", "vs/platform/clipboard/common/clipboardService", "vs/base/common/lifecycle", "vs/workbench/services/statusbar/browser/statusbar", "vs/platform/markers/common/markers", "vs/workbench/common/views", "vs/workbench/common/contextkeys", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/platform/instantiation/common/descriptors", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/services/activity/common/activity", "vs/workbench/browser/parts/views/viewFilter", "vs/workbench/contrib/markers/browser/markersFileDecorations"], function (require, exports, contextkey_1, configurationRegistry_1, actionCommonCategories_1, keybindingsRegistry_1, nls_1, markersModel_1, markersView_1, actions_1, platform_1, markers_1, messages_1, contributions_1, clipboardService_1, lifecycle_1, statusbar_1, markers_2, views_1, contextkeys_1, viewPaneContainer_1, descriptors_1, codicons_1, iconRegistry_1, viewPane_1, activity_1, viewFilter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: markers_1.Markers.MARKER_OPEN_ACTION_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.$Ii.and(markers_1.MarkersContextKeys.MarkerFocusContextKey),
        primary: 3 /* KeyCode.Enter */,
        mac: {
            primary: 3 /* KeyCode.Enter */,
            secondary: [2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */]
        },
        handler: (accessor, args) => {
            const markersView = accessor.get(views_1.$$E).getActiveViewWithId(markers_1.Markers.MARKERS_VIEW_ID);
            markersView.openFileAtElement(markersView.getFocusElement(), false, false, true);
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: markers_1.Markers.MARKER_OPEN_SIDE_ACTION_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.$Ii.and(markers_1.MarkersContextKeys.MarkerFocusContextKey),
        primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
        mac: {
            primary: 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */
        },
        handler: (accessor, args) => {
            const markersView = accessor.get(views_1.$$E).getActiveViewWithId(markers_1.Markers.MARKERS_VIEW_ID);
            markersView.openFileAtElement(markersView.getFocusElement(), false, true, true);
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: markers_1.Markers.MARKER_SHOW_PANEL_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: undefined,
        primary: undefined,
        handler: async (accessor, args) => {
            await accessor.get(views_1.$$E).openView(markers_1.Markers.MARKERS_VIEW_ID);
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: markers_1.Markers.MARKER_SHOW_QUICK_FIX,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: markers_1.MarkersContextKeys.MarkerFocusContextKey,
        primary: 2048 /* KeyMod.CtrlCmd */ | 89 /* KeyCode.Period */,
        handler: (accessor, args) => {
            const markersView = accessor.get(views_1.$$E).getActiveViewWithId(markers_1.Markers.MARKERS_VIEW_ID);
            const focusedElement = markersView.getFocusElement();
            if (focusedElement instanceof markersModel_1.$vSb) {
                markersView.showQuickFixes(focusedElement);
            }
        }
    });
    // configuration
    platform_1.$8m.as(configurationRegistry_1.$an.Configuration).registerConfiguration({
        'id': 'problems',
        'order': 101,
        'title': messages_1.default.PROBLEMS_PANEL_CONFIGURATION_TITLE,
        'type': 'object',
        'properties': {
            'problems.autoReveal': {
                'description': messages_1.default.PROBLEMS_PANEL_CONFIGURATION_AUTO_REVEAL,
                'type': 'boolean',
                'default': true
            },
            'problems.defaultViewMode': {
                'description': messages_1.default.PROBLEMS_PANEL_CONFIGURATION_VIEW_MODE,
                'type': 'string',
                'default': 'tree',
                'enum': ['table', 'tree'],
            },
            'problems.showCurrentInStatus': {
                'description': messages_1.default.PROBLEMS_PANEL_CONFIGURATION_SHOW_CURRENT_STATUS,
                'type': 'boolean',
                'default': false
            },
            'problems.sortOrder': {
                'description': messages_1.default.PROBLEMS_PANEL_CONFIGURATION_COMPARE_ORDER,
                'type': 'string',
                'default': 'severity',
                'enum': ['severity', 'position'],
                'enumDescriptions': [
                    messages_1.default.PROBLEMS_PANEL_CONFIGURATION_COMPARE_ORDER_SEVERITY,
                    messages_1.default.PROBLEMS_PANEL_CONFIGURATION_COMPARE_ORDER_POSITION,
                ],
            },
        }
    });
    const markersViewIcon = (0, iconRegistry_1.$9u)('markers-view-icon', codicons_1.$Pj.warning, (0, nls_1.localize)(0, null));
    // markers view container
    const VIEW_CONTAINER = platform_1.$8m.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: markers_1.Markers.MARKERS_CONTAINER_ID,
        title: { value: messages_1.default.MARKERS_PANEL_TITLE_PROBLEMS, original: messages_1.default.MARKERS_PANEL_ORIGINAL_TITLE_PROBLEMS },
        icon: markersViewIcon,
        hideIfEmpty: true,
        order: 0,
        ctorDescriptor: new descriptors_1.$yh(viewPaneContainer_1.$Seb, [markers_1.Markers.MARKERS_CONTAINER_ID, { mergeViewWithContainerWhenSingleView: true }]),
        storageId: markers_1.Markers.MARKERS_VIEW_STORAGE_ID,
    }, 1 /* ViewContainerLocation.Panel */, { doNotRegisterOpenCommand: true });
    platform_1.$8m.as(views_1.Extensions.ViewsRegistry).registerViews([{
            id: markers_1.Markers.MARKERS_VIEW_ID,
            containerIcon: markersViewIcon,
            name: messages_1.default.MARKERS_PANEL_TITLE_PROBLEMS,
            canToggleVisibility: false,
            canMoveView: true,
            ctorDescriptor: new descriptors_1.$yh(markersView_1.$PSb),
            openCommandActionDescriptor: {
                id: 'workbench.actions.view.problems',
                mnemonicTitle: (0, nls_1.localize)(1, null),
                keybindings: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 43 /* KeyCode.KeyM */ },
                order: 0,
            }
        }], VIEW_CONTAINER);
    // workbench
    const workbenchRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    // actions
    (0, actions_1.$Xu)(class extends viewPane_1.$Keb {
        constructor() {
            super({
                id: `workbench.actions.table.${markers_1.Markers.MARKERS_VIEW_ID}.viewAsTree`,
                title: (0, nls_1.localize)(2, null),
                menu: {
                    id: actions_1.$Ru.ViewTitle,
                    when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', markers_1.Markers.MARKERS_VIEW_ID), markers_1.MarkersContextKeys.MarkersViewModeContextKey.isEqualTo("table" /* MarkersViewMode.Table */)),
                    group: 'navigation',
                    order: 3
                },
                icon: codicons_1.$Pj.listTree,
                viewId: markers_1.Markers.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, view) {
            view.setViewMode("tree" /* MarkersViewMode.Tree */);
        }
    });
    (0, actions_1.$Xu)(class extends viewPane_1.$Keb {
        constructor() {
            super({
                id: `workbench.actions.table.${markers_1.Markers.MARKERS_VIEW_ID}.viewAsTable`,
                title: (0, nls_1.localize)(3, null),
                menu: {
                    id: actions_1.$Ru.ViewTitle,
                    when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', markers_1.Markers.MARKERS_VIEW_ID), markers_1.MarkersContextKeys.MarkersViewModeContextKey.isEqualTo("tree" /* MarkersViewMode.Tree */)),
                    group: 'navigation',
                    order: 3
                },
                icon: codicons_1.$Pj.listFlat,
                viewId: markers_1.Markers.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, view) {
            view.setViewMode("table" /* MarkersViewMode.Table */);
        }
    });
    (0, actions_1.$Xu)(class extends viewPane_1.$Keb {
        constructor() {
            super({
                id: `workbench.actions.${markers_1.Markers.MARKERS_VIEW_ID}.toggleErrors`,
                title: (0, nls_1.localize)(4, null),
                category: (0, nls_1.localize)(5, null),
                toggled: {
                    condition: markers_1.MarkersContextKeys.ShowErrorsFilterContextKey,
                    title: (0, nls_1.localize)(6, null)
                },
                menu: {
                    id: viewFilter_1.$Feb,
                    group: '1_filter',
                    when: contextkey_1.$Ii.equals('view', markers_1.Markers.MARKERS_VIEW_ID),
                    order: 1
                },
                viewId: markers_1.Markers.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, view) {
            view.filters.showErrors = !view.filters.showErrors;
        }
    });
    (0, actions_1.$Xu)(class extends viewPane_1.$Keb {
        constructor() {
            super({
                id: `workbench.actions.${markers_1.Markers.MARKERS_VIEW_ID}.toggleWarnings`,
                title: (0, nls_1.localize)(7, null),
                category: (0, nls_1.localize)(8, null),
                toggled: {
                    condition: markers_1.MarkersContextKeys.ShowWarningsFilterContextKey,
                    title: (0, nls_1.localize)(9, null)
                },
                menu: {
                    id: viewFilter_1.$Feb,
                    group: '1_filter',
                    when: contextkey_1.$Ii.equals('view', markers_1.Markers.MARKERS_VIEW_ID),
                    order: 2
                },
                viewId: markers_1.Markers.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, view) {
            view.filters.showWarnings = !view.filters.showWarnings;
        }
    });
    (0, actions_1.$Xu)(class extends viewPane_1.$Keb {
        constructor() {
            super({
                id: `workbench.actions.${markers_1.Markers.MARKERS_VIEW_ID}.toggleInfos`,
                title: (0, nls_1.localize)(10, null),
                category: (0, nls_1.localize)(11, null),
                toggled: {
                    condition: markers_1.MarkersContextKeys.ShowInfoFilterContextKey,
                    title: (0, nls_1.localize)(12, null)
                },
                menu: {
                    id: viewFilter_1.$Feb,
                    group: '1_filter',
                    when: contextkey_1.$Ii.equals('view', markers_1.Markers.MARKERS_VIEW_ID),
                    order: 3
                },
                viewId: markers_1.Markers.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, view) {
            view.filters.showInfos = !view.filters.showInfos;
        }
    });
    (0, actions_1.$Xu)(class extends viewPane_1.$Keb {
        constructor() {
            super({
                id: `workbench.actions.${markers_1.Markers.MARKERS_VIEW_ID}.toggleActiveFile`,
                title: (0, nls_1.localize)(13, null),
                category: (0, nls_1.localize)(14, null),
                toggled: {
                    condition: markers_1.MarkersContextKeys.ShowActiveFileFilterContextKey,
                    title: (0, nls_1.localize)(15, null)
                },
                menu: {
                    id: viewFilter_1.$Feb,
                    group: '2_filter',
                    when: contextkey_1.$Ii.equals('view', markers_1.Markers.MARKERS_VIEW_ID),
                    order: 1
                },
                viewId: markers_1.Markers.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, view) {
            view.filters.activeFile = !view.filters.activeFile;
        }
    });
    (0, actions_1.$Xu)(class extends viewPane_1.$Keb {
        constructor() {
            super({
                id: `workbench.actions.${markers_1.Markers.MARKERS_VIEW_ID}.toggleExcludedFiles`,
                title: (0, nls_1.localize)(16, null),
                category: (0, nls_1.localize)(17, null),
                toggled: {
                    condition: markers_1.MarkersContextKeys.ShowExcludedFilesFilterContextKey,
                    title: (0, nls_1.localize)(18, null)
                },
                menu: {
                    id: viewFilter_1.$Feb,
                    group: '2_filter',
                    when: contextkey_1.$Ii.equals('view', markers_1.Markers.MARKERS_VIEW_ID),
                    order: 2
                },
                viewId: markers_1.Markers.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, view) {
            view.filters.excludedFiles = !view.filters.excludedFiles;
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.problems.focus',
                title: { value: messages_1.default.MARKERS_PANEL_SHOW_LABEL, original: 'Focus Problems (Errors, Warnings, Infos)' },
                category: actionCommonCategories_1.$Nl.View,
                f1: true,
            });
        }
        async run(accessor) {
            accessor.get(views_1.$$E).openView(markers_1.Markers.MARKERS_VIEW_ID, true);
        }
    });
    (0, actions_1.$Xu)(class extends viewPane_1.$Keb {
        constructor() {
            const when = contextkey_1.$Ii.and(contextkeys_1.$Hdb.isEqualTo(markers_1.Markers.MARKERS_VIEW_ID), markers_1.MarkersContextKeys.MarkersTreeVisibilityContextKey, markers_1.MarkersContextKeys.RelatedInformationFocusContextKey.toNegated());
            super({
                id: markers_1.Markers.MARKER_COPY_ACTION_ID,
                title: { value: (0, nls_1.localize)(19, null), original: 'Copy' },
                menu: {
                    id: actions_1.$Ru.ProblemsPanelContext,
                    when,
                    group: 'navigation'
                },
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */,
                    when
                },
                viewId: markers_1.Markers.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, markersView) {
            const clipboardService = serviceAccessor.get(clipboardService_1.$UZ);
            const selection = markersView.getFocusedSelectedElements() || markersView.getAllResourceMarkers();
            const markers = [];
            const addMarker = (marker) => {
                if (!markers.includes(marker)) {
                    markers.push(marker);
                }
            };
            for (const selected of selection) {
                if (selected instanceof markersModel_1.$uSb) {
                    selected.markers.forEach(addMarker);
                }
                else if (selected instanceof markersModel_1.$vSb) {
                    addMarker(selected);
                }
            }
            if (markers.length) {
                await clipboardService.writeText(`[${markers}]`);
            }
        }
    });
    (0, actions_1.$Xu)(class extends viewPane_1.$Keb {
        constructor() {
            super({
                id: markers_1.Markers.MARKER_COPY_MESSAGE_ACTION_ID,
                title: { value: (0, nls_1.localize)(20, null), original: 'Copy Message' },
                menu: {
                    id: actions_1.$Ru.ProblemsPanelContext,
                    when: markers_1.MarkersContextKeys.MarkerFocusContextKey,
                    group: 'navigation'
                },
                viewId: markers_1.Markers.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, markersView) {
            const clipboardService = serviceAccessor.get(clipboardService_1.$UZ);
            const element = markersView.getFocusElement();
            if (element instanceof markersModel_1.$vSb) {
                await clipboardService.writeText(element.marker.message);
            }
        }
    });
    (0, actions_1.$Xu)(class extends viewPane_1.$Keb {
        constructor() {
            super({
                id: markers_1.Markers.RELATED_INFORMATION_COPY_MESSAGE_ACTION_ID,
                title: { value: (0, nls_1.localize)(21, null), original: 'Copy Message' },
                menu: {
                    id: actions_1.$Ru.ProblemsPanelContext,
                    when: markers_1.MarkersContextKeys.RelatedInformationFocusContextKey,
                    group: 'navigation'
                },
                viewId: markers_1.Markers.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, markersView) {
            const clipboardService = serviceAccessor.get(clipboardService_1.$UZ);
            const element = markersView.getFocusElement();
            if (element instanceof markersModel_1.$xSb) {
                await clipboardService.writeText(element.raw.message);
            }
        }
    });
    (0, actions_1.$Xu)(class extends viewPane_1.$Keb {
        constructor() {
            super({
                id: markers_1.Markers.FOCUS_PROBLEMS_FROM_FILTER,
                title: (0, nls_1.localize)(22, null),
                keybinding: {
                    when: markers_1.MarkersContextKeys.MarkerViewFilterFocusContextKey,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */
                },
                viewId: markers_1.Markers.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, markersView) {
            markersView.focus();
        }
    });
    (0, actions_1.$Xu)(class extends viewPane_1.$Keb {
        constructor() {
            super({
                id: markers_1.Markers.MARKERS_VIEW_FOCUS_FILTER,
                title: (0, nls_1.localize)(23, null),
                keybinding: {
                    when: contextkeys_1.$Hdb.isEqualTo(markers_1.Markers.MARKERS_VIEW_ID),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */
                },
                viewId: markers_1.Markers.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, markersView) {
            markersView.focusFilter();
        }
    });
    (0, actions_1.$Xu)(class extends viewPane_1.$Keb {
        constructor() {
            super({
                id: markers_1.Markers.MARKERS_VIEW_SHOW_MULTILINE_MESSAGE,
                title: { value: (0, nls_1.localize)(24, null), original: 'Problems: Show message in multiple lines' },
                category: (0, nls_1.localize)(25, null),
                menu: {
                    id: actions_1.$Ru.CommandPalette,
                    when: contextkey_1.$Ii.has((0, contextkeys_1.$Idb)(markers_1.Markers.MARKERS_VIEW_ID))
                },
                viewId: markers_1.Markers.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, markersView) {
            markersView.setMultiline(true);
        }
    });
    (0, actions_1.$Xu)(class extends viewPane_1.$Keb {
        constructor() {
            super({
                id: markers_1.Markers.MARKERS_VIEW_SHOW_SINGLELINE_MESSAGE,
                title: { value: (0, nls_1.localize)(26, null), original: 'Problems: Show message in single line' },
                category: (0, nls_1.localize)(27, null),
                menu: {
                    id: actions_1.$Ru.CommandPalette,
                    when: contextkey_1.$Ii.has((0, contextkeys_1.$Idb)(markers_1.Markers.MARKERS_VIEW_ID))
                },
                viewId: markers_1.Markers.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, markersView) {
            markersView.setMultiline(false);
        }
    });
    (0, actions_1.$Xu)(class extends viewPane_1.$Keb {
        constructor() {
            super({
                id: markers_1.Markers.MARKERS_VIEW_CLEAR_FILTER_TEXT,
                title: (0, nls_1.localize)(28, null),
                category: (0, nls_1.localize)(29, null),
                keybinding: {
                    when: markers_1.MarkersContextKeys.MarkerViewFilterFocusContextKey,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 9 /* KeyCode.Escape */
                },
                viewId: markers_1.Markers.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, markersView) {
            markersView.clearFilterText();
        }
    });
    (0, actions_1.$Xu)(class extends viewPane_1.$Keb {
        constructor() {
            super({
                id: `workbench.actions.treeView.${markers_1.Markers.MARKERS_VIEW_ID}.collapseAll`,
                title: (0, nls_1.localize)(30, null),
                menu: {
                    id: actions_1.$Ru.ViewTitle,
                    when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', markers_1.Markers.MARKERS_VIEW_ID), markers_1.MarkersContextKeys.MarkersViewModeContextKey.isEqualTo("tree" /* MarkersViewMode.Tree */)),
                    group: 'navigation',
                    order: 2,
                },
                icon: codicons_1.$Pj.collapseAll,
                viewId: markers_1.Markers.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, view) {
            return view.collapseAll();
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: markers_1.Markers.TOGGLE_MARKERS_VIEW_ACTION_ID,
                title: messages_1.default.MARKERS_PANEL_TOGGLE_LABEL,
            });
        }
        async run(accessor) {
            const viewsService = accessor.get(views_1.$$E);
            if (viewsService.isViewVisible(markers_1.Markers.MARKERS_VIEW_ID)) {
                viewsService.closeView(markers_1.Markers.MARKERS_VIEW_ID);
            }
            else {
                viewsService.openView(markers_1.Markers.MARKERS_VIEW_ID, true);
            }
        }
    });
    let MarkersStatusBarContributions = class MarkersStatusBarContributions extends lifecycle_1.$kc {
        constructor(b, c) {
            super();
            this.b = b;
            this.c = c;
            this.a = this.B(this.c.addEntry(this.f(), 'status.problems', 0 /* StatusbarAlignment.LEFT */, 50 /* Medium Priority */));
            this.b.onMarkerChanged(() => this.a.update(this.f()));
        }
        f() {
            const markersStatistics = this.b.getStatistics();
            const tooltip = this.g(markersStatistics);
            return {
                name: (0, nls_1.localize)(31, null),
                text: this.h(markersStatistics),
                ariaLabel: tooltip,
                tooltip,
                command: 'workbench.actions.view.toggleProblems'
            };
        }
        g(stats) {
            const errorTitle = (n) => (0, nls_1.localize)(32, null, n);
            const warningTitle = (n) => (0, nls_1.localize)(33, null, n);
            const infoTitle = (n) => (0, nls_1.localize)(34, null, n);
            const titles = [];
            if (stats.errors > 0) {
                titles.push(errorTitle(stats.errors));
            }
            if (stats.warnings > 0) {
                titles.push(warningTitle(stats.warnings));
            }
            if (stats.infos > 0) {
                titles.push(infoTitle(stats.infos));
            }
            if (titles.length === 0) {
                return (0, nls_1.localize)(35, null);
            }
            return titles.join(', ');
        }
        h(stats) {
            const problemsText = [];
            // Errors
            problemsText.push('$(error) ' + this.j(stats.errors));
            // Warnings
            problemsText.push('$(warning) ' + this.j(stats.warnings));
            // Info (only if any)
            if (stats.infos > 0) {
                problemsText.push('$(info) ' + this.j(stats.infos));
            }
            return problemsText.join(' ');
        }
        j(n) {
            const manyProblems = (0, nls_1.localize)(36, null);
            return n > 9999 ? manyProblems : n > 999 ? n.toString().charAt(0) + 'K' : n.toString();
        }
    };
    MarkersStatusBarContributions = __decorate([
        __param(0, markers_2.$3s),
        __param(1, statusbar_1.$6$)
    ], MarkersStatusBarContributions);
    workbenchRegistry.registerWorkbenchContribution(MarkersStatusBarContributions, 3 /* LifecyclePhase.Restored */);
    let ActivityUpdater = class ActivityUpdater extends lifecycle_1.$kc {
        constructor(b, c) {
            super();
            this.b = b;
            this.c = c;
            this.a = this.B(new lifecycle_1.$lc());
            this.B(this.c.onMarkerChanged(() => this.f()));
            this.f();
        }
        f() {
            const { errors, warnings, infos } = this.c.getStatistics();
            const total = errors + warnings + infos;
            const message = (0, nls_1.localize)(37, null, total);
            this.a.value = this.b.showViewActivity(markers_1.Markers.MARKERS_VIEW_ID, { badge: new activity_1.$IV(total, () => message) });
        }
    };
    ActivityUpdater = __decorate([
        __param(0, activity_1.$HV),
        __param(1, markers_2.$3s)
    ], ActivityUpdater);
    workbenchRegistry.registerWorkbenchContribution(ActivityUpdater, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=markers.contribution.js.map