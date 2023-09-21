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
define(["require", "exports", "vs/platform/contextkey/common/contextkey", "vs/platform/configuration/common/configurationRegistry", "vs/platform/action/common/actionCommonCategories", "vs/platform/keybinding/common/keybindingsRegistry", "vs/nls", "vs/workbench/contrib/markers/browser/markersModel", "vs/workbench/contrib/markers/browser/markersView", "vs/platform/actions/common/actions", "vs/platform/registry/common/platform", "vs/workbench/contrib/markers/common/markers", "vs/workbench/contrib/markers/browser/messages", "vs/workbench/common/contributions", "vs/platform/clipboard/common/clipboardService", "vs/base/common/lifecycle", "vs/workbench/services/statusbar/browser/statusbar", "vs/platform/markers/common/markers", "vs/workbench/common/views", "vs/workbench/common/contextkeys", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/platform/instantiation/common/descriptors", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/services/activity/common/activity", "vs/workbench/browser/parts/views/viewFilter", "vs/workbench/contrib/markers/browser/markersFileDecorations"], function (require, exports, contextkey_1, configurationRegistry_1, actionCommonCategories_1, keybindingsRegistry_1, nls_1, markersModel_1, markersView_1, actions_1, platform_1, markers_1, messages_1, contributions_1, clipboardService_1, lifecycle_1, statusbar_1, markers_2, views_1, contextkeys_1, viewPaneContainer_1, descriptors_1, codicons_1, iconRegistry_1, viewPane_1, activity_1, viewFilter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: markers_1.Markers.MARKER_OPEN_ACTION_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(markers_1.MarkersContextKeys.MarkerFocusContextKey),
        primary: 3 /* KeyCode.Enter */,
        mac: {
            primary: 3 /* KeyCode.Enter */,
            secondary: [2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */]
        },
        handler: (accessor, args) => {
            const markersView = accessor.get(views_1.IViewsService).getActiveViewWithId(markers_1.Markers.MARKERS_VIEW_ID);
            markersView.openFileAtElement(markersView.getFocusElement(), false, false, true);
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: markers_1.Markers.MARKER_OPEN_SIDE_ACTION_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(markers_1.MarkersContextKeys.MarkerFocusContextKey),
        primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
        mac: {
            primary: 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */
        },
        handler: (accessor, args) => {
            const markersView = accessor.get(views_1.IViewsService).getActiveViewWithId(markers_1.Markers.MARKERS_VIEW_ID);
            markersView.openFileAtElement(markersView.getFocusElement(), false, true, true);
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: markers_1.Markers.MARKER_SHOW_PANEL_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: undefined,
        primary: undefined,
        handler: async (accessor, args) => {
            await accessor.get(views_1.IViewsService).openView(markers_1.Markers.MARKERS_VIEW_ID);
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: markers_1.Markers.MARKER_SHOW_QUICK_FIX,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: markers_1.MarkersContextKeys.MarkerFocusContextKey,
        primary: 2048 /* KeyMod.CtrlCmd */ | 89 /* KeyCode.Period */,
        handler: (accessor, args) => {
            const markersView = accessor.get(views_1.IViewsService).getActiveViewWithId(markers_1.Markers.MARKERS_VIEW_ID);
            const focusedElement = markersView.getFocusElement();
            if (focusedElement instanceof markersModel_1.Marker) {
                markersView.showQuickFixes(focusedElement);
            }
        }
    });
    // configuration
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
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
    const markersViewIcon = (0, iconRegistry_1.registerIcon)('markers-view-icon', codicons_1.Codicon.warning, (0, nls_1.localize)('markersViewIcon', 'View icon of the markers view.'));
    // markers view container
    const VIEW_CONTAINER = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: markers_1.Markers.MARKERS_CONTAINER_ID,
        title: { value: messages_1.default.MARKERS_PANEL_TITLE_PROBLEMS, original: messages_1.default.MARKERS_PANEL_ORIGINAL_TITLE_PROBLEMS },
        icon: markersViewIcon,
        hideIfEmpty: true,
        order: 0,
        ctorDescriptor: new descriptors_1.SyncDescriptor(viewPaneContainer_1.ViewPaneContainer, [markers_1.Markers.MARKERS_CONTAINER_ID, { mergeViewWithContainerWhenSingleView: true }]),
        storageId: markers_1.Markers.MARKERS_VIEW_STORAGE_ID,
    }, 1 /* ViewContainerLocation.Panel */, { doNotRegisterOpenCommand: true });
    platform_1.Registry.as(views_1.Extensions.ViewsRegistry).registerViews([{
            id: markers_1.Markers.MARKERS_VIEW_ID,
            containerIcon: markersViewIcon,
            name: messages_1.default.MARKERS_PANEL_TITLE_PROBLEMS,
            canToggleVisibility: false,
            canMoveView: true,
            ctorDescriptor: new descriptors_1.SyncDescriptor(markersView_1.MarkersView),
            openCommandActionDescriptor: {
                id: 'workbench.actions.view.problems',
                mnemonicTitle: (0, nls_1.localize)({ key: 'miMarker', comment: ['&& denotes a mnemonic'] }, "&&Problems"),
                keybindings: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 43 /* KeyCode.KeyM */ },
                order: 0,
            }
        }], VIEW_CONTAINER);
    // workbench
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    // actions
    (0, actions_1.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: `workbench.actions.table.${markers_1.Markers.MARKERS_VIEW_ID}.viewAsTree`,
                title: (0, nls_1.localize)('viewAsTree', "View as Tree"),
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', markers_1.Markers.MARKERS_VIEW_ID), markers_1.MarkersContextKeys.MarkersViewModeContextKey.isEqualTo("table" /* MarkersViewMode.Table */)),
                    group: 'navigation',
                    order: 3
                },
                icon: codicons_1.Codicon.listTree,
                viewId: markers_1.Markers.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, view) {
            view.setViewMode("tree" /* MarkersViewMode.Tree */);
        }
    });
    (0, actions_1.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: `workbench.actions.table.${markers_1.Markers.MARKERS_VIEW_ID}.viewAsTable`,
                title: (0, nls_1.localize)('viewAsTable', "View as Table"),
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', markers_1.Markers.MARKERS_VIEW_ID), markers_1.MarkersContextKeys.MarkersViewModeContextKey.isEqualTo("tree" /* MarkersViewMode.Tree */)),
                    group: 'navigation',
                    order: 3
                },
                icon: codicons_1.Codicon.listFlat,
                viewId: markers_1.Markers.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, view) {
            view.setViewMode("table" /* MarkersViewMode.Table */);
        }
    });
    (0, actions_1.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: `workbench.actions.${markers_1.Markers.MARKERS_VIEW_ID}.toggleErrors`,
                title: (0, nls_1.localize)('toggle errors', "Toggle Errors"),
                category: (0, nls_1.localize)('problems', "Problems"),
                toggled: {
                    condition: markers_1.MarkersContextKeys.ShowErrorsFilterContextKey,
                    title: (0, nls_1.localize)('errors', "Show Errors")
                },
                menu: {
                    id: viewFilter_1.viewFilterSubmenu,
                    group: '1_filter',
                    when: contextkey_1.ContextKeyExpr.equals('view', markers_1.Markers.MARKERS_VIEW_ID),
                    order: 1
                },
                viewId: markers_1.Markers.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, view) {
            view.filters.showErrors = !view.filters.showErrors;
        }
    });
    (0, actions_1.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: `workbench.actions.${markers_1.Markers.MARKERS_VIEW_ID}.toggleWarnings`,
                title: (0, nls_1.localize)('toggle warnings', "Toggle Warnings"),
                category: (0, nls_1.localize)('problems', "Problems"),
                toggled: {
                    condition: markers_1.MarkersContextKeys.ShowWarningsFilterContextKey,
                    title: (0, nls_1.localize)('warnings', "Show Warnings")
                },
                menu: {
                    id: viewFilter_1.viewFilterSubmenu,
                    group: '1_filter',
                    when: contextkey_1.ContextKeyExpr.equals('view', markers_1.Markers.MARKERS_VIEW_ID),
                    order: 2
                },
                viewId: markers_1.Markers.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, view) {
            view.filters.showWarnings = !view.filters.showWarnings;
        }
    });
    (0, actions_1.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: `workbench.actions.${markers_1.Markers.MARKERS_VIEW_ID}.toggleInfos`,
                title: (0, nls_1.localize)('toggle infos', "Toggle Infos"),
                category: (0, nls_1.localize)('problems', "Problems"),
                toggled: {
                    condition: markers_1.MarkersContextKeys.ShowInfoFilterContextKey,
                    title: (0, nls_1.localize)('Infos', "Show Infos")
                },
                menu: {
                    id: viewFilter_1.viewFilterSubmenu,
                    group: '1_filter',
                    when: contextkey_1.ContextKeyExpr.equals('view', markers_1.Markers.MARKERS_VIEW_ID),
                    order: 3
                },
                viewId: markers_1.Markers.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, view) {
            view.filters.showInfos = !view.filters.showInfos;
        }
    });
    (0, actions_1.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: `workbench.actions.${markers_1.Markers.MARKERS_VIEW_ID}.toggleActiveFile`,
                title: (0, nls_1.localize)('toggle active file', "Toggle Active File"),
                category: (0, nls_1.localize)('problems', "Problems"),
                toggled: {
                    condition: markers_1.MarkersContextKeys.ShowActiveFileFilterContextKey,
                    title: (0, nls_1.localize)('Active File', "Show Active File Only")
                },
                menu: {
                    id: viewFilter_1.viewFilterSubmenu,
                    group: '2_filter',
                    when: contextkey_1.ContextKeyExpr.equals('view', markers_1.Markers.MARKERS_VIEW_ID),
                    order: 1
                },
                viewId: markers_1.Markers.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, view) {
            view.filters.activeFile = !view.filters.activeFile;
        }
    });
    (0, actions_1.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: `workbench.actions.${markers_1.Markers.MARKERS_VIEW_ID}.toggleExcludedFiles`,
                title: (0, nls_1.localize)('toggle Excluded Files', "Toggle Excluded Files"),
                category: (0, nls_1.localize)('problems', "Problems"),
                toggled: {
                    condition: markers_1.MarkersContextKeys.ShowExcludedFilesFilterContextKey,
                    title: (0, nls_1.localize)('Excluded Files', "Hide Excluded Files")
                },
                menu: {
                    id: viewFilter_1.viewFilterSubmenu,
                    group: '2_filter',
                    when: contextkey_1.ContextKeyExpr.equals('view', markers_1.Markers.MARKERS_VIEW_ID),
                    order: 2
                },
                viewId: markers_1.Markers.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, view) {
            view.filters.excludedFiles = !view.filters.excludedFiles;
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.problems.focus',
                title: { value: messages_1.default.MARKERS_PANEL_SHOW_LABEL, original: 'Focus Problems (Errors, Warnings, Infos)' },
                category: actionCommonCategories_1.Categories.View,
                f1: true,
            });
        }
        async run(accessor) {
            accessor.get(views_1.IViewsService).openView(markers_1.Markers.MARKERS_VIEW_ID, true);
        }
    });
    (0, actions_1.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            const when = contextkey_1.ContextKeyExpr.and(contextkeys_1.FocusedViewContext.isEqualTo(markers_1.Markers.MARKERS_VIEW_ID), markers_1.MarkersContextKeys.MarkersTreeVisibilityContextKey, markers_1.MarkersContextKeys.RelatedInformationFocusContextKey.toNegated());
            super({
                id: markers_1.Markers.MARKER_COPY_ACTION_ID,
                title: { value: (0, nls_1.localize)('copyMarker', "Copy"), original: 'Copy' },
                menu: {
                    id: actions_1.MenuId.ProblemsPanelContext,
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
            const clipboardService = serviceAccessor.get(clipboardService_1.IClipboardService);
            const selection = markersView.getFocusedSelectedElements() || markersView.getAllResourceMarkers();
            const markers = [];
            const addMarker = (marker) => {
                if (!markers.includes(marker)) {
                    markers.push(marker);
                }
            };
            for (const selected of selection) {
                if (selected instanceof markersModel_1.ResourceMarkers) {
                    selected.markers.forEach(addMarker);
                }
                else if (selected instanceof markersModel_1.Marker) {
                    addMarker(selected);
                }
            }
            if (markers.length) {
                await clipboardService.writeText(`[${markers}]`);
            }
        }
    });
    (0, actions_1.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: markers_1.Markers.MARKER_COPY_MESSAGE_ACTION_ID,
                title: { value: (0, nls_1.localize)('copyMessage', "Copy Message"), original: 'Copy Message' },
                menu: {
                    id: actions_1.MenuId.ProblemsPanelContext,
                    when: markers_1.MarkersContextKeys.MarkerFocusContextKey,
                    group: 'navigation'
                },
                viewId: markers_1.Markers.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, markersView) {
            const clipboardService = serviceAccessor.get(clipboardService_1.IClipboardService);
            const element = markersView.getFocusElement();
            if (element instanceof markersModel_1.Marker) {
                await clipboardService.writeText(element.marker.message);
            }
        }
    });
    (0, actions_1.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: markers_1.Markers.RELATED_INFORMATION_COPY_MESSAGE_ACTION_ID,
                title: { value: (0, nls_1.localize)('copyMessage', "Copy Message"), original: 'Copy Message' },
                menu: {
                    id: actions_1.MenuId.ProblemsPanelContext,
                    when: markers_1.MarkersContextKeys.RelatedInformationFocusContextKey,
                    group: 'navigation'
                },
                viewId: markers_1.Markers.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, markersView) {
            const clipboardService = serviceAccessor.get(clipboardService_1.IClipboardService);
            const element = markersView.getFocusElement();
            if (element instanceof markersModel_1.RelatedInformation) {
                await clipboardService.writeText(element.raw.message);
            }
        }
    });
    (0, actions_1.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: markers_1.Markers.FOCUS_PROBLEMS_FROM_FILTER,
                title: (0, nls_1.localize)('focusProblemsList', "Focus problems view"),
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
    (0, actions_1.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: markers_1.Markers.MARKERS_VIEW_FOCUS_FILTER,
                title: (0, nls_1.localize)('focusProblemsFilter', "Focus problems filter"),
                keybinding: {
                    when: contextkeys_1.FocusedViewContext.isEqualTo(markers_1.Markers.MARKERS_VIEW_ID),
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
    (0, actions_1.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: markers_1.Markers.MARKERS_VIEW_SHOW_MULTILINE_MESSAGE,
                title: { value: (0, nls_1.localize)('show multiline', "Show message in multiple lines"), original: 'Problems: Show message in multiple lines' },
                category: (0, nls_1.localize)('problems', "Problems"),
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyExpr.has((0, contextkeys_1.getVisbileViewContextKey)(markers_1.Markers.MARKERS_VIEW_ID))
                },
                viewId: markers_1.Markers.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, markersView) {
            markersView.setMultiline(true);
        }
    });
    (0, actions_1.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: markers_1.Markers.MARKERS_VIEW_SHOW_SINGLELINE_MESSAGE,
                title: { value: (0, nls_1.localize)('show singleline', "Show message in single line"), original: 'Problems: Show message in single line' },
                category: (0, nls_1.localize)('problems', "Problems"),
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyExpr.has((0, contextkeys_1.getVisbileViewContextKey)(markers_1.Markers.MARKERS_VIEW_ID))
                },
                viewId: markers_1.Markers.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, markersView) {
            markersView.setMultiline(false);
        }
    });
    (0, actions_1.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: markers_1.Markers.MARKERS_VIEW_CLEAR_FILTER_TEXT,
                title: (0, nls_1.localize)('clearFiltersText', "Clear filters text"),
                category: (0, nls_1.localize)('problems', "Problems"),
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
    (0, actions_1.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: `workbench.actions.treeView.${markers_1.Markers.MARKERS_VIEW_ID}.collapseAll`,
                title: (0, nls_1.localize)('collapseAll', "Collapse All"),
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', markers_1.Markers.MARKERS_VIEW_ID), markers_1.MarkersContextKeys.MarkersViewModeContextKey.isEqualTo("tree" /* MarkersViewMode.Tree */)),
                    group: 'navigation',
                    order: 2,
                },
                icon: codicons_1.Codicon.collapseAll,
                viewId: markers_1.Markers.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, view) {
            return view.collapseAll();
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: markers_1.Markers.TOGGLE_MARKERS_VIEW_ACTION_ID,
                title: messages_1.default.MARKERS_PANEL_TOGGLE_LABEL,
            });
        }
        async run(accessor) {
            const viewsService = accessor.get(views_1.IViewsService);
            if (viewsService.isViewVisible(markers_1.Markers.MARKERS_VIEW_ID)) {
                viewsService.closeView(markers_1.Markers.MARKERS_VIEW_ID);
            }
            else {
                viewsService.openView(markers_1.Markers.MARKERS_VIEW_ID, true);
            }
        }
    });
    let MarkersStatusBarContributions = class MarkersStatusBarContributions extends lifecycle_1.Disposable {
        constructor(markerService, statusbarService) {
            super();
            this.markerService = markerService;
            this.statusbarService = statusbarService;
            this.markersStatusItem = this._register(this.statusbarService.addEntry(this.getMarkersItem(), 'status.problems', 0 /* StatusbarAlignment.LEFT */, 50 /* Medium Priority */));
            this.markerService.onMarkerChanged(() => this.markersStatusItem.update(this.getMarkersItem()));
        }
        getMarkersItem() {
            const markersStatistics = this.markerService.getStatistics();
            const tooltip = this.getMarkersTooltip(markersStatistics);
            return {
                name: (0, nls_1.localize)('status.problems', "Problems"),
                text: this.getMarkersText(markersStatistics),
                ariaLabel: tooltip,
                tooltip,
                command: 'workbench.actions.view.toggleProblems'
            };
        }
        getMarkersTooltip(stats) {
            const errorTitle = (n) => (0, nls_1.localize)('totalErrors', "Errors: {0}", n);
            const warningTitle = (n) => (0, nls_1.localize)('totalWarnings', "Warnings: {0}", n);
            const infoTitle = (n) => (0, nls_1.localize)('totalInfos', "Infos: {0}", n);
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
                return (0, nls_1.localize)('noProblems', "No Problems");
            }
            return titles.join(', ');
        }
        getMarkersText(stats) {
            const problemsText = [];
            // Errors
            problemsText.push('$(error) ' + this.packNumber(stats.errors));
            // Warnings
            problemsText.push('$(warning) ' + this.packNumber(stats.warnings));
            // Info (only if any)
            if (stats.infos > 0) {
                problemsText.push('$(info) ' + this.packNumber(stats.infos));
            }
            return problemsText.join(' ');
        }
        packNumber(n) {
            const manyProblems = (0, nls_1.localize)('manyProblems', "10K+");
            return n > 9999 ? manyProblems : n > 999 ? n.toString().charAt(0) + 'K' : n.toString();
        }
    };
    MarkersStatusBarContributions = __decorate([
        __param(0, markers_2.IMarkerService),
        __param(1, statusbar_1.IStatusbarService)
    ], MarkersStatusBarContributions);
    workbenchRegistry.registerWorkbenchContribution(MarkersStatusBarContributions, 3 /* LifecyclePhase.Restored */);
    let ActivityUpdater = class ActivityUpdater extends lifecycle_1.Disposable {
        constructor(activityService, markerService) {
            super();
            this.activityService = activityService;
            this.markerService = markerService;
            this.activity = this._register(new lifecycle_1.MutableDisposable());
            this._register(this.markerService.onMarkerChanged(() => this.updateBadge()));
            this.updateBadge();
        }
        updateBadge() {
            const { errors, warnings, infos } = this.markerService.getStatistics();
            const total = errors + warnings + infos;
            const message = (0, nls_1.localize)('totalProblems', 'Total {0} Problems', total);
            this.activity.value = this.activityService.showViewActivity(markers_1.Markers.MARKERS_VIEW_ID, { badge: new activity_1.NumberBadge(total, () => message) });
        }
    };
    ActivityUpdater = __decorate([
        __param(0, activity_1.IActivityService),
        __param(1, markers_2.IMarkerService)
    ], ActivityUpdater);
    workbenchRegistry.registerWorkbenchContribution(ActivityUpdater, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Vycy5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9tYXJrZXJzL2Jyb3dzZXIvbWFya2Vycy5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7SUFpQ2hHLHlDQUFtQixDQUFDLGdDQUFnQyxDQUFDO1FBQ3BELEVBQUUsRUFBRSxpQkFBTyxDQUFDLHFCQUFxQjtRQUNqQyxNQUFNLDZDQUFtQztRQUN6QyxJQUFJLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQUMsNEJBQWtCLENBQUMscUJBQXFCLENBQUM7UUFDbEUsT0FBTyx1QkFBZTtRQUN0QixHQUFHLEVBQUU7WUFDSixPQUFPLHVCQUFlO1lBQ3RCLFNBQVMsRUFBRSxDQUFDLHNEQUFrQyxDQUFDO1NBQy9DO1FBQ0QsT0FBTyxFQUFFLENBQUMsUUFBUSxFQUFFLElBQVMsRUFBRSxFQUFFO1lBQ2hDLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMscUJBQWEsQ0FBQyxDQUFDLG1CQUFtQixDQUFjLGlCQUFPLENBQUMsZUFBZSxDQUFFLENBQUM7WUFDM0csV0FBVyxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxlQUFlLEVBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2xGLENBQUM7S0FDRCxDQUFDLENBQUM7SUFFSCx5Q0FBbUIsQ0FBQyxnQ0FBZ0MsQ0FBQztRQUNwRCxFQUFFLEVBQUUsaUJBQU8sQ0FBQywwQkFBMEI7UUFDdEMsTUFBTSw2Q0FBbUM7UUFDekMsSUFBSSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLDRCQUFrQixDQUFDLHFCQUFxQixDQUFDO1FBQ2xFLE9BQU8sRUFBRSxpREFBOEI7UUFDdkMsR0FBRyxFQUFFO1lBQ0osT0FBTyxFQUFFLGdE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