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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/button/button", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/browser/ui/list/listWidget", "vs/base/common/actions", "vs/base/common/arraysFind", "vs/base/common/async", "vs/base/common/color", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/base/common/themables", "vs/base/common/types", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/nls", "vs/platform/actions/browser/dropdownWithPrimaryActionViewItem", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/opener/common/opener", "vs/platform/progress/common/progress", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/browser/defaultStyles", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/iconRegistry", "vs/platform/theme/common/themeService", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/browser/actions/widgetNavigationCommands", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/editor/diffEditorInput", "vs/workbench/common/views", "vs/workbench/contrib/testing/browser/explorerProjections/index", "vs/workbench/contrib/testing/browser/explorerProjections/listProjection", "vs/workbench/contrib/testing/browser/explorerProjections/testItemContextOverlay", "vs/workbench/contrib/testing/browser/explorerProjections/testingObjectTree", "vs/workbench/contrib/testing/browser/explorerProjections/treeProjection", "vs/workbench/contrib/testing/browser/icons", "vs/workbench/contrib/testing/browser/testExplorerActions", "vs/workbench/contrib/testing/browser/testingExplorerFilter", "vs/workbench/contrib/testing/browser/testingProgressUiService", "vs/workbench/contrib/testing/common/configuration", "vs/workbench/contrib/testing/common/constants", "vs/workbench/contrib/testing/common/storedValue", "vs/workbench/contrib/testing/common/testExplorerFilterState", "vs/workbench/contrib/testing/common/testId", "vs/workbench/contrib/testing/common/testProfileService", "vs/workbench/contrib/testing/common/testResult", "vs/workbench/contrib/testing/common/testResultService", "vs/workbench/contrib/testing/common/testService", "vs/workbench/contrib/testing/common/testingContextKeys", "vs/workbench/contrib/testing/common/testingContinuousRunService", "vs/workbench/contrib/testing/common/testingPeekOpener", "vs/workbench/contrib/testing/common/testingStates", "vs/workbench/services/activity/common/activity", "vs/workbench/services/editor/common/editorService", "vs/css!./media/testing"], function (require, exports, dom, actionbar_1, button_1, iconLabels_1, listWidget_1, actions_1, arraysFind_1, async_1, color_1, event_1, lifecycle_1, strings_1, themables_1, types_1, markdownRenderer_1, nls_1, dropdownWithPrimaryActionViewItem_1, menuEntryActionViewItem_1, actions_2, commands_1, configuration_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, opener_1, progress_1, storage_1, telemetry_1, defaultStyles_1, colorRegistry_1, iconRegistry_1, themeService_1, uriIdentity_1, widgetNavigationCommands_1, viewPane_1, diffEditorInput_1, views_1, index_1, listProjection_1, testItemContextOverlay_1, testingObjectTree_1, treeProjection_1, icons, testExplorerActions_1, testingExplorerFilter_1, testingProgressUiService_1, configuration_2, constants_1, storedValue_1, testExplorerFilterState_1, testId_1, testProfileService_1, testResult_1, testResultService_1, testService_1, testingContextKeys_1, testingContinuousRunService_1, testingPeekOpener_1, testingStates_1, activity_1, editorService_1) {
    "use strict";
    var ErrorRenderer_1, TestItemRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestingExplorerView = void 0;
    var LastFocusState;
    (function (LastFocusState) {
        LastFocusState[LastFocusState["Input"] = 0] = "Input";
        LastFocusState[LastFocusState["Tree"] = 1] = "Tree";
    })(LastFocusState || (LastFocusState = {}));
    let TestingExplorerView = class TestingExplorerView extends viewPane_1.ViewPane {
        get focusedTreeElements() {
            return this.viewModel.tree.getFocus().filter(types_1.isDefined);
        }
        constructor(options, contextMenuService, keybindingService, configurationService, instantiationService, viewDescriptorService, contextKeyService, openerService, themeService, testService, telemetryService, testProfileService, commandService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.testService = testService;
            this.testProfileService = testProfileService;
            this.commandService = commandService;
            this.filterActionBar = this._register(new lifecycle_1.MutableDisposable());
            this.discoveryProgress = this._register(new lifecycle_1.MutableDisposable());
            this.filter = this._register(new lifecycle_1.MutableDisposable());
            this.filterFocusListener = this._register(new lifecycle_1.MutableDisposable());
            this.dimensions = { width: 0, height: 0 };
            this.lastFocusState = 0 /* LastFocusState.Input */;
            const relayout = this._register(new async_1.RunOnceScheduler(() => this.layoutBody(), 1));
            this._register(this.onDidChangeViewWelcomeState(() => {
                if (!this.shouldShowWelcome()) {
                    relayout.schedule();
                }
            }));
            this._register(testService.collection.onBusyProvidersChange(busy => {
                this.updateDiscoveryProgress(busy);
            }));
            this._register(testProfileService.onDidChange(() => this.updateActions()));
        }
        shouldShowWelcome() {
            return this.viewModel?.welcomeExperience === 1 /* WelcomeExperience.ForWorkspace */ ?? true;
        }
        focus() {
            super.focus();
            if (this.lastFocusState === 1 /* LastFocusState.Tree */) {
                this.viewModel.tree.domFocus();
            }
            else {
                this.filter.value?.focus();
            }
        }
        /**
         * Gets include/exclude items in the tree, based either on visible tests
         * or a use selection.
         */
        getTreeIncludeExclude(profile, filterToType = 'visible') {
            const projection = this.viewModel.projection.value;
            if (!projection) {
                return { include: [], exclude: [] };
            }
            // To calculate includes and excludes, we include the first children that
            // have a majority of their items included too, and then apply exclusions.
            const include = new Set();
            const exclude = [];
            const attempt = (element, alreadyIncluded) => {
                // sanity check hasElement since updates are debounced and they may exist
                // but not be rendered yet
                if (!(element instanceof index_1.TestItemTreeElement) || !this.viewModel.tree.hasElement(element)) {
                    return;
                }
                // If the current node is not visible or runnable in the current profile, it's excluded
                const inTree = this.viewModel.tree.getNode(element);
                if (!inTree.visible) {
                    if (alreadyIncluded) {
                        exclude.push(element.test);
                    }
                    return;
                }
                // If it's not already included but most of its children are, then add it
                // if it can be run under the current profile (when specified)
                if (
                // If it's not already included...
                !alreadyIncluded
                    // And it can be run using the current profile (if any)
                    && (!profile || (0, testProfileService_1.canUseProfileWithTest)(profile, element.test))
                    // And either it's a leaf node or most children are included, the  include it.
                    && (inTree.children.length === 0 || inTree.visibleChildrenCount * 2 >= inTree.children.length)
                    // And not if we're only showing a single of its children, since it
                    // probably fans out later. (Worse case we'll directly include its single child)
                    && inTree.visibleChildrenCount !== 1) {
                    include.add(element.test);
                    alreadyIncluded = true;
                }
                // Recurse ✨
                for (const child of element.children) {
                    attempt(child, alreadyIncluded);
                }
            };
            if (filterToType === 'selected') {
                const sel = this.viewModel.tree.getSelection().filter(types_1.isDefined);
                if (sel.length) {
                    L: for (const node of sel) {
                        if (node instanceof index_1.TestItemTreeElement) {
                            // avoid adding an item if its parent is already included
                            for (let i = node; i; i = i.parent) {
                                if (include.has(i.test)) {
                                    continue L;
                                }
                            }
                            include.add(node.test);
                            node.children.forEach(c => attempt(c, true));
                        }
                    }
                    return { include: [...include], exclude };
                }
            }
            for (const root of this.testService.collection.rootItems) {
                const element = projection.getElementByTestId(root.item.extId);
                if (!element) {
                    continue;
                }
                if (profile && !(0, testProfileService_1.canUseProfileWithTest)(profile, root)) {
                    continue;
                }
                // single controllers won't have visible root ID nodes, handle that  case specially
                if (!this.viewModel.tree.hasElement(element)) {
                    const visibleChildren = [...element.children].reduce((acc, c) => this.viewModel.tree.hasElement(c) && this.viewModel.tree.getNode(c).visible ? acc + 1 : acc, 0);
                    // note we intentionally check children > 0 here, unlike above, since
                    // we don't want to bother dispatching to controllers who have no discovered tests
                    if (element.children.size > 0 && visibleChildren * 2 >= element.children.size) {
                        include.add(element.test);
                        element.children.forEach(c => attempt(c, true));
                    }
                    else {
                        element.children.forEach(c => attempt(c, false));
                    }
                }
                else {
                    attempt(element, false);
                }
            }
            return { include: [...include], exclude };
        }
        render() {
            super.render();
            this._register((0, widgetNavigationCommands_1.registerNavigableContainer)({
                focusNotifiers: [this],
                focusNextWidget: () => {
                    if (!this.viewModel.tree.isDOMFocused()) {
                        this.viewModel.tree.domFocus();
                    }
                },
                focusPreviousWidget: () => {
                    if (this.viewModel.tree.isDOMFocused()) {
                        this.filter.value?.focus();
                    }
                }
            }));
        }
        /**
         * @override
         */
        renderBody(container) {
            super.renderBody(container);
            this.container = dom.append(container, dom.$('.test-explorer'));
            this.treeHeader = dom.append(this.container, dom.$('.test-explorer-header'));
            this.filterActionBar.value = this.createFilterActionBar();
            const messagesContainer = dom.append(this.treeHeader, dom.$('.result-summary-container'));
            this._register(this.instantiationService.createInstance(ResultSummaryView, messagesContainer));
            const listContainer = dom.append(this.container, dom.$('.test-explorer-tree'));
            this.viewModel = this.instantiationService.createInstance(TestingExplorerViewModel, listContainer, this.onDidChangeBodyVisibility);
            this._register(this.viewModel.tree.onDidFocus(() => this.lastFocusState = 1 /* LastFocusState.Tree */));
            this._register(this.viewModel.onChangeWelcomeVisibility(() => this._onDidChangeViewWelcomeState.fire()));
            this._register(this.viewModel);
            this._onDidChangeViewWelcomeState.fire();
        }
        /** @override  */
        getActionViewItem(action) {
            switch (action.id) {
                case "workbench.actions.treeView.testExplorer.filter" /* TestCommandId.FilterAction */:
                    this.filter.value = this.instantiationService.createInstance(testingExplorerFilter_1.TestingExplorerFilter, action);
                    this.filterFocusListener.value = this.filter.value.onDidFocus(() => this.lastFocusState = 0 /* LastFocusState.Input */);
                    return this.filter.value;
                case "testing.runSelected" /* TestCommandId.RunSelectedAction */:
                    return this.getRunGroupDropdown(2 /* TestRunProfileBitset.Run */, action);
                case "testing.debugSelected" /* TestCommandId.DebugSelectedAction */:
                    return this.getRunGroupDropdown(4 /* TestRunProfileBitset.Debug */, action);
                default:
                    return super.getActionViewItem(action);
            }
        }
        /** @inheritdoc */
        getTestConfigGroupActions(group) {
            const profileActions = [];
            let participatingGroups = 0;
            let hasConfigurable = false;
            const defaults = this.testProfileService.getGroupDefaultProfiles(group);
            for (const { profiles, controller } of this.testProfileService.all()) {
                let hasAdded = false;
                for (const profile of profiles) {
                    if (profile.group !== group) {
                        continue;
                    }
                    if (!hasAdded) {
                        hasAdded = true;
                        participatingGroups++;
                        profileActions.push(new actions_1.Action(`${controller.id}.$root`, controller.label.value, undefined, false));
                    }
                    hasConfigurable = hasConfigurable || profile.hasConfigurationHandler;
                    profileActions.push(new actions_1.Action(`${controller.id}.${profile.profileId}`, defaults.includes(profile) ? (0, nls_1.localize)('defaultTestProfile', '{0} (Default)', profile.label) : profile.label, undefined, undefined, () => {
                        const { include, exclude } = this.getTreeIncludeExclude(profile);
                        this.testService.runResolvedTests({
                            exclude: exclude.map(e => e.item.extId),
                            targets: [{
                                    profileGroup: profile.group,
                                    profileId: profile.profileId,
                                    controllerId: profile.controllerId,
                                    testIds: include.map(i => i.item.extId),
                                }]
                        });
                    }));
                }
            }
            // If there's only one group, don't add a heading for it in the dropdown.
            if (participatingGroups === 1) {
                profileActions.shift();
            }
            const postActions = [];
            if (profileActions.length > 1) {
                postActions.push(new actions_1.Action('selectDefaultTestConfigurations', (0, nls_1.localize)('selectDefaultConfigs', 'Select Default Profile'), undefined, undefined, () => this.commandService.executeCommand("testing.selectDefaultTestProfiles" /* TestCommandId.SelectDefaultTestProfiles */, group)));
            }
            if (hasConfigurable) {
                postActions.push(new actions_1.Action('configureTestProfiles', (0, nls_1.localize)('configureTestProfiles', 'Configure Test Profiles'), undefined, undefined, () => this.commandService.executeCommand("testing.configureProfile" /* TestCommandId.ConfigureTestProfilesAction */, group)));
            }
            return actions_1.Separator.join(profileActions, postActions);
        }
        /**
         * @override
         */
        saveState() {
            this.filter.value?.saveState();
            super.saveState();
        }
        getRunGroupDropdown(group, defaultAction) {
            const dropdownActions = this.getTestConfigGroupActions(group);
            if (dropdownActions.length < 2) {
                return super.getActionViewItem(defaultAction);
            }
            const primaryAction = this.instantiationService.createInstance(actions_2.MenuItemAction, {
                id: defaultAction.id,
                title: defaultAction.label,
                icon: group === 2 /* TestRunProfileBitset.Run */
                    ? icons.testingRunAllIcon
                    : icons.testingDebugAllIcon,
            }, undefined, undefined, undefined);
            const dropdownAction = new actions_1.Action('selectRunConfig', 'Select Configuration...', 'codicon-chevron-down', true);
            return this.instantiationService.createInstance(dropdownWithPrimaryActionViewItem_1.DropdownWithPrimaryActionViewItem, primaryAction, dropdownAction, dropdownActions, '', this.contextMenuService, {});
        }
        createFilterActionBar() {
            const bar = new actionbar_1.ActionBar(this.treeHeader, {
                actionViewItemProvider: action => this.getActionViewItem(action),
                triggerKeys: { keyDown: false, keys: [] },
            });
            bar.push(new actions_1.Action("workbench.actions.treeView.testExplorer.filter" /* TestCommandId.FilterAction */));
            bar.getContainer().classList.add('testing-filter-action-bar');
            return bar;
        }
        updateDiscoveryProgress(busy) {
            if (!busy && this.discoveryProgress) {
                this.discoveryProgress.clear();
            }
            else if (busy && !this.discoveryProgress.value) {
                this.discoveryProgress.value = this.instantiationService.createInstance(progress_1.UnmanagedProgress, { location: this.getProgressLocation() });
            }
        }
        /**
         * @override
         */
        layoutBody(height = this.dimensions.height, width = this.dimensions.width) {
            super.layoutBody(height, width);
            this.dimensions.height = height;
            this.dimensions.width = width;
            this.container.style.height = `${height}px`;
            this.viewModel?.layout(height - this.treeHeader.clientHeight, width);
            this.filter.value?.layout(width);
        }
    };
    exports.TestingExplorerView = TestingExplorerView;
    exports.TestingExplorerView = TestingExplorerView = __decorate([
        __param(1, contextView_1.IContextMenuService),
        __param(2, keybinding_1.IKeybindingService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, views_1.IViewDescriptorService),
        __param(6, contextkey_1.IContextKeyService),
        __param(7, opener_1.IOpenerService),
        __param(8, themeService_1.IThemeService),
        __param(9, testService_1.ITestService),
        __param(10, telemetry_1.ITelemetryService),
        __param(11, testProfileService_1.ITestProfileService),
        __param(12, commands_1.ICommandService)
    ], TestingExplorerView);
    const SUMMARY_RENDER_INTERVAL = 200;
    let ResultSummaryView = class ResultSummaryView extends lifecycle_1.Disposable {
        constructor(container, resultService, activityService, crService, configurationService, instantiationService) {
            super();
            this.container = container;
            this.resultService = resultService;
            this.activityService = activityService;
            this.crService = crService;
            this.elementsWereAttached = false;
            this.badgeDisposable = this._register(new lifecycle_1.MutableDisposable());
            this.renderLoop = this._register(new async_1.RunOnceScheduler(() => this.render(), SUMMARY_RENDER_INTERVAL));
            this.elements = dom.h('div.result-summary', [
                dom.h('div@status'),
                dom.h('div@count'),
                dom.h('div@count'),
                dom.h('span'),
                dom.h('duration@duration'),
                dom.h('a@rerun'),
            ]);
            this.badgeType = configurationService.getValue("testing.countBadge" /* TestingConfigKeys.CountBadge */);
            this._register(resultService.onResultsChanged(this.render, this));
            this._register(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("testing.countBadge" /* TestingConfigKeys.CountBadge */)) {
                    this.badgeType = configurationService.getValue("testing.countBadge" /* TestingConfigKeys.CountBadge */);
                    this.render();
                }
            }));
            const ab = this._register(new actionbar_1.ActionBar(this.elements.rerun, {
                actionViewItemProvider: action => (0, menuEntryActionViewItem_1.createActionViewItem)(instantiationService, action),
            }));
            ab.push(instantiationService.createInstance(actions_2.MenuItemAction, { ...new testExplorerActions_1.ReRunLastRun().desc, icon: icons.testingRerunIcon }, { ...new testExplorerActions_1.DebugLastRun().desc, icon: icons.testingDebugIcon }, {}, undefined), { icon: true, label: false });
            this.render();
        }
        render() {
            const { results } = this.resultService;
            const { count, root, status, duration, rerun } = this.elements;
            if (!results.length) {
                this.container.innerText = (0, nls_1.localize)('noResults', 'No test results yet.');
                if (this.elementsWereAttached) {
                    this.container.removeChild(root);
                    this.elementsWereAttached = false;
                }
                return;
            }
            const live = results.filter(r => !r.completedAt);
            let counts;
            if (live.length) {
                status.className = themables_1.ThemeIcon.asClassName(iconRegistry_1.spinningLoading);
                counts = (0, testingProgressUiService_1.collectTestStateCounts)(true, live);
                this.renderLoop.schedule();
                const last = live[live.length - 1];
                duration.textContent = formatDuration(Date.now() - last.startedAt);
                rerun.style.display = 'none';
            }
            else {
                const last = results[0];
                const dominantState = (0, arraysFind_1.mapFindFirst)(testingStates_1.statesInOrder, s => last.counts[s] > 0 ? s : undefined);
                status.className = themables_1.ThemeIcon.asClassName(icons.testingStatesToIcons.get(dominantState ?? 0 /* TestResultState.Unset */));
                counts = (0, testingProgressUiService_1.collectTestStateCounts)(false, [last]);
                duration.textContent = last instanceof testResult_1.LiveTestResult ? formatDuration(last.completedAt - last.startedAt) : '';
                rerun.style.display = 'block';
            }
            count.textContent = `${counts.passed}/${counts.totalWillBeRun}`;
            count.title = (0, testingProgressUiService_1.getTestProgressText)(counts);
            this.renderActivityBadge(counts);
            if (!this.elementsWereAttached) {
                dom.clearNode(this.container);
                this.container.appendChild(root);
                this.elementsWereAttached = true;
            }
        }
        renderActivityBadge(countSummary) {
            if (countSummary && this.badgeType !== "off" /* TestingCountBadge.Off */ && countSummary[this.badgeType] !== 0) {
                if (this.lastBadge instanceof activity_1.NumberBadge && this.lastBadge.number === countSummary[this.badgeType]) {
                    return;
                }
                this.lastBadge = new activity_1.NumberBadge(countSummary[this.badgeType], num => this.getLocalizedBadgeString(this.badgeType, num));
            }
            else if (this.crService.isEnabled()) {
                if (this.lastBadge instanceof activity_1.IconBadge && this.lastBadge.icon === icons.testingContinuousIsOn) {
                    return;
                }
                this.lastBadge = new activity_1.IconBadge(icons.testingContinuousIsOn, () => (0, nls_1.localize)('testingContinuousBadge', 'Tests are being watched for changes'));
            }
            else {
                if (!this.lastBadge) {
                    return;
                }
                this.lastBadge = undefined;
            }
            this.badgeDisposable.value = this.lastBadge && this.activityService.showViewActivity("workbench.view.testing" /* Testing.ExplorerViewId */, { badge: this.lastBadge });
        }
        getLocalizedBadgeString(countBadgeType, count) {
            switch (countBadgeType) {
                case "passed" /* TestingCountBadge.Passed */:
                    return (0, nls_1.localize)('testingCountBadgePassed', '{0} passed tests', count);
                case "skipped" /* TestingCountBadge.Skipped */:
                    return (0, nls_1.localize)('testingCountBadgeSkipped', '{0} skipped tests', count);
                default:
                    return (0, nls_1.localize)('testingCountBadgeFailed', '{0} failed tests', count);
            }
        }
    };
    ResultSummaryView = __decorate([
        __param(1, testResultService_1.ITestResultService),
        __param(2, activity_1.IActivityService),
        __param(3, testingContinuousRunService_1.ITestingContinuousRunService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, instantiation_1.IInstantiationService)
    ], ResultSummaryView);
    var WelcomeExperience;
    (function (WelcomeExperience) {
        WelcomeExperience[WelcomeExperience["None"] = 0] = "None";
        WelcomeExperience[WelcomeExperience["ForWorkspace"] = 1] = "ForWorkspace";
        WelcomeExperience[WelcomeExperience["ForDocument"] = 2] = "ForDocument";
    })(WelcomeExperience || (WelcomeExperience = {}));
    let TestingExplorerViewModel = class TestingExplorerViewModel extends lifecycle_1.Disposable {
        get viewMode() {
            return this._viewMode.get() ?? "true" /* TestExplorerViewMode.Tree */;
        }
        set viewMode(newMode) {
            if (newMode === this._viewMode.get()) {
                return;
            }
            this._viewMode.set(newMode);
            this.updatePreferredProjection();
            this.storageService.store('testing.viewMode', newMode, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        get viewSorting() {
            return this._viewSorting.get() ?? "status" /* TestExplorerViewSorting.ByStatus */;
        }
        set viewSorting(newSorting) {
            if (newSorting === this._viewSorting.get()) {
                return;
            }
            this._viewSorting.set(newSorting);
            this.tree.resort(null);
            this.storageService.store('testing.viewSorting', newSorting, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        constructor(listContainer, onDidChangeVisibility, configurationService, editorService, menuService, contextMenuService, testService, filterState, instantiationService, storageService, contextKeyService, testResults, peekOpener, testProfileService, crService, commandService) {
            super();
            this.menuService = menuService;
            this.contextMenuService = contextMenuService;
            this.testService = testService;
            this.filterState = filterState;
            this.instantiationService = instantiationService;
            this.storageService = storageService;
            this.contextKeyService = contextKeyService;
            this.testResults = testResults;
            this.peekOpener = peekOpener;
            this.testProfileService = testProfileService;
            this.crService = crService;
            this.projection = this._register(new lifecycle_1.MutableDisposable());
            this.revealTimeout = new lifecycle_1.MutableDisposable();
            this._viewMode = testingContextKeys_1.TestingContextKeys.viewMode.bindTo(this.contextKeyService);
            this._viewSorting = testingContextKeys_1.TestingContextKeys.viewSorting.bindTo(this.contextKeyService);
            this.welcomeVisibilityEmitter = new event_1.Emitter();
            this.actionRunner = new TestExplorerActionRunner(() => this.tree.getSelection().filter(types_1.isDefined));
            this.lastViewState = this._register(new storedValue_1.StoredValue({
                key: 'testing.treeState',
                scope: 1 /* StorageScope.WORKSPACE */,
                target: 1 /* StorageTarget.MACHINE */,
            }, this.storageService));
            /**
             * Whether there's a reveal request which has not yet been delivered. This
             * can happen if the user asks to reveal before the test tree is loaded.
             * We check to see if the reveal request is present on each tree update,
             * and do it then if so.
             */
            this.hasPendingReveal = false;
            /**
             * Fires when the visibility of the placeholder state changes.
             */
            this.onChangeWelcomeVisibility = this.welcomeVisibilityEmitter.event;
            /**
             * Gets whether the welcome should be visible.
             */
            this.welcomeExperience = 0 /* WelcomeExperience.None */;
            this.hasPendingReveal = !!filterState.reveal.value;
            this.noTestForDocumentWidget = this._register(instantiationService.createInstance(NoTestsForDocumentWidget, listContainer));
            this._viewMode.set(this.storageService.get('testing.viewMode', 1 /* StorageScope.WORKSPACE */, "true" /* TestExplorerViewMode.Tree */));
            this._viewSorting.set(this.storageService.get('testing.viewSorting', 1 /* StorageScope.WORKSPACE */, "location" /* TestExplorerViewSorting.ByLocation */));
            this.reevaluateWelcomeState();
            this.filter = this.instantiationService.createInstance(TestsFilter, testService.collection);
            this.tree = instantiationService.createInstance(testingObjectTree_1.TestingObjectTree, 'Test Explorer List', listContainer, new ListDelegate(), [
                instantiationService.createInstance(TestItemRenderer, this.actionRunner),
                instantiationService.createInstance(ErrorRenderer),
            ], {
                identityProvider: instantiationService.createInstance(IdentityProvider),
                hideTwistiesOfChildlessElements: false,
                sorter: instantiationService.createInstance(TreeSorter, this),
                keyboardNavigationLabelProvider: instantiationService.createInstance(TreeKeyboardNavigationLabelProvider),
                accessibilityProvider: instantiationService.createInstance(ListAccessibilityProvider),
                filter: this.filter,
                findWidgetEnabled: false,
                openOnSingleClick: false,
            });
            // saves the collapse state so that if items are removed or refreshed, they
            // retain the same state (#170169)
            const collapseStateSaver = this._register(new async_1.RunOnceScheduler(() => {
                // reuse the last view state to avoid making a bunch of object garbage:
                const state = this.tree.getOptimizedViewState(this.lastViewState.get({}));
                const projection = this.projection.value;
                if (projection) {
                    projection.lastState = state;
                }
            }, 3000));
            this._register(this.tree.onDidChangeCollapseState(evt => {
                if (evt.node.element instanceof index_1.TestItemTreeElement) {
                    if (!evt.node.collapsed) {
                        this.projection.value?.expandElement(evt.node.element, evt.deep ? Infinity : 0);
                    }
                    collapseStateSaver.schedule();
                }
            }));
            this._register(this.crService.onDidChange(testId => {
                if (testId) {
                    // a continuous run test will sort to the top:
                    const elem = this.projection.value?.getElementByTestId(testId);
                    this.tree.resort(elem?.parent && this.tree.hasElement(elem.parent) ? elem.parent : null, false);
                }
            }));
            this._register(onDidChangeVisibility(visible => {
                if (visible) {
                    this.ensureProjection();
                }
            }));
            this._register(this.tree.onContextMenu(e => this.onContextMenu(e)));
            this._register(event_1.Event.any(filterState.text.onDidChange, filterState.fuzzy.onDidChange, testService.excluded.onTestExclusionsChanged)(this.tree.refilter, this.tree));
            this._register(this.tree.onDidOpen(e => {
                if (e.element instanceof index_1.TestItemTreeElement && !e.element.children.size && e.element.test.item.uri) {
                    commandService.executeCommand('vscode.revealTest', e.element.test.item.extId);
                }
            }));
            this._register(this.tree);
            this._register(this.onChangeWelcomeVisibility(e => {
                this.noTestForDocumentWidget.setVisible(e === 2 /* WelcomeExperience.ForDocument */);
            }));
            this._register(dom.addStandardDisposableListener(this.tree.getHTMLElement(), 'keydown', evt => {
                if (evt.equals(3 /* KeyCode.Enter */)) {
                    this.handleExecuteKeypress(evt);
                }
                else if (listWidget_1.DefaultKeyboardNavigationDelegate.mightProducePrintableCharacter(evt)) {
                    filterState.text.value = evt.browserEvent.key;
                    filterState.focusInput();
                }
            }));
            this._register(filterState.reveal.onDidChange(id => this.revealById(id, undefined, false)));
            this._register(onDidChangeVisibility(visible => {
                if (visible) {
                    filterState.focusInput();
                }
            }));
            this._register(this.tree.onDidChangeSelection(evt => {
                if (evt.browserEvent instanceof MouseEvent && (evt.browserEvent.altKey || evt.browserEvent.shiftKey)) {
                    return; // don't focus when alt-clicking to multi select
                }
                const selected = evt.elements[0];
                if (selected && evt.browserEvent && selected instanceof index_1.TestItemTreeElement
                    && selected.children.size === 0 && selected.test.expand === 0 /* TestItemExpandState.NotExpandable */) {
                    this.tryPeekError(selected);
                }
            }));
            let followRunningTests = (0, configuration_2.getTestingConfiguration)(configurationService, "testing.followRunningTest" /* TestingConfigKeys.FollowRunningTest */);
            this._register(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("testing.followRunningTest" /* TestingConfigKeys.FollowRunningTest */)) {
                    followRunningTests = (0, configuration_2.getTestingConfiguration)(configurationService, "testing.followRunningTest" /* TestingConfigKeys.FollowRunningTest */);
                }
            }));
            let alwaysRevealTestAfterStateChange = (0, configuration_2.getTestingConfiguration)(configurationService, "testing.alwaysRevealTestOnStateChange" /* TestingConfigKeys.AlwaysRevealTestOnStateChange */);
            this._register(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("testing.alwaysRevealTestOnStateChange" /* TestingConfigKeys.AlwaysRevealTestOnStateChange */)) {
                    alwaysRevealTestAfterStateChange = (0, configuration_2.getTestingConfiguration)(configurationService, "testing.alwaysRevealTestOnStateChange" /* TestingConfigKeys.AlwaysRevealTestOnStateChange */);
                }
            }));
            this._register(testResults.onTestChanged(evt => {
                if (!followRunningTests) {
                    return;
                }
                if (evt.reason !== 1 /* TestResultItemChangeReason.OwnStateChange */) {
                    return;
                }
                if (this.tree.selectionSize > 1) {
                    return; // don't change a multi-selection #180950
                }
                // follow running tests, or tests whose state changed. Tests that
                // complete very fast may not enter the running state at all.
                if (evt.item.ownComputedState !== 2 /* TestResultState.Running */ && !(evt.previousState === 1 /* TestResultState.Queued */ && (0, testingStates_1.isStateWithResult)(evt.item.ownComputedState))) {
                    return;
                }
                this.revealById(evt.item.item.extId, alwaysRevealTestAfterStateChange, false);
            }));
            this._register(testResults.onResultsChanged(() => {
                this.tree.resort(null);
            }));
            this._register(this.testProfileService.onDidChange(() => {
                this.tree.rerender();
            }));
            const onEditorChange = () => {
                if (editorService.activeEditor instanceof diffEditorInput_1.DiffEditorInput) {
                    this.filter.filterToDocumentUri(editorService.activeEditor.primary.resource);
                }
                else {
                    this.filter.filterToDocumentUri(editorService.activeEditor?.resource);
                }
                if (this.filterState.isFilteringFor("@doc" /* TestFilterTerm.CurrentDoc */)) {
                    this.tree.refilter();
                }
            };
            this._register(editorService.onDidActiveEditorChange(onEditorChange));
            this._register(this.storageService.onWillSaveState(({ reason, }) => {
                if (reason === storage_1.WillSaveStateReason.SHUTDOWN) {
                    this.lastViewState.store(this.tree.getOptimizedViewState());
                }
            }));
            onEditorChange();
        }
        /**
         * Re-layout the tree.
         */
        layout(height, width) {
            this.tree.layout(height, width);
        }
        /**
         * Tries to reveal by extension ID. Queues the request if the extension
         * ID is not currently available.
         */
        revealById(id, expand = true, focus = true) {
            if (!id) {
                this.hasPendingReveal = false;
                return;
            }
            const projection = this.ensureProjection();
            // If the item itself is visible in the tree, show it. Otherwise, expand
            // its closest parent.
            let expandToLevel = 0;
            const idPath = [...testId_1.TestId.fromString(id).idsFromRoot()];
            for (let i = idPath.length - 1; i >= expandToLevel; i--) {
                const element = projection.getElementByTestId(idPath[i].toString());
                // Skip all elements that aren't in the tree.
                if (!element || !this.tree.hasElement(element)) {
                    continue;
                }
                // If this 'if' is true, we're at the closest-visible parent to the node
                // we want to expand. Expand that, and then start the loop again because
                // we might already have children for it.
                if (i < idPath.length - 1) {
                    if (expand) {
                        this.tree.expand(element);
                        expandToLevel = i + 1; // avoid an infinite loop if the test does not exist
                        i = idPath.length - 1; // restart the loop since new children may now be visible
                        continue;
                    }
                }
                // Otherwise, we've arrived!
                // If the node or any of its children are excluded, flip on the 'show
                // excluded tests' checkbox automatically. If we didn't expand, then set
                // target focus target to the first collapsed element.
                let focusTarget = element;
                for (let n = element; n instanceof index_1.TestItemTreeElement; n = n.parent) {
                    if (n.test && this.testService.excluded.contains(n.test)) {
                        this.filterState.toggleFilteringFor("@hidden" /* TestFilterTerm.Hidden */, true);
                        break;
                    }
                    if (!expand && (this.tree.hasElement(n) && this.tree.isCollapsed(n))) {
                        focusTarget = n;
                    }
                }
                this.filterState.reveal.value = undefined;
                this.hasPendingReveal = false;
                if (focus) {
                    this.tree.domFocus();
                }
                if (this.tree.getRelativeTop(focusTarget) === null) {
                    this.tree.reveal(focusTarget, 0.5);
                }
                this.revealTimeout.value = (0, async_1.disposableTimeout)(() => {
                    this.tree.setFocus([focusTarget]);
                    this.tree.setSelection([focusTarget]);
                }, 1);
                return;
            }
            // If here, we've expanded all parents we can. Waiting on data to come
            // in to possibly show the revealed test.
            this.hasPendingReveal = true;
        }
        /**
         * Collapse all items in the tree.
         */
        async collapseAll() {
            this.tree.collapseAll();
        }
        /**
         * Tries to peek the first test error, if the item is in a failed state.
         */
        tryPeekError(item) {
            const lookup = item.test && this.testResults.getStateById(item.test.item.extId);
            return lookup && lookup[1].tasks.some(s => (0, testingStates_1.isFailedState)(s.state))
                ? this.peekOpener.tryPeekFirstError(lookup[0], lookup[1], { preserveFocus: true })
                : false;
        }
        onContextMenu(evt) {
            const element = evt.element;
            if (!(element instanceof index_1.TestItemTreeElement)) {
                return;
            }
            const { actions } = getActionableElementActions(this.contextKeyService, this.menuService, this.testService, this.crService, this.testProfileService, element);
            this.contextMenuService.showContextMenu({
                getAnchor: () => evt.anchor,
                getActions: () => actions.secondary,
                getActionsContext: () => element,
                actionRunner: this.actionRunner,
            });
        }
        handleExecuteKeypress(evt) {
            const focused = this.tree.getFocus();
            const selected = this.tree.getSelection();
            let targeted;
            if (focused.length === 1 && selected.includes(focused[0])) {
                evt.browserEvent?.preventDefault();
                targeted = selected;
            }
            else {
                targeted = focused;
            }
            const toRun = targeted
                .filter((e) => e instanceof index_1.TestItemTreeElement);
            if (toRun.length) {
                this.testService.runTests({
                    group: 2 /* TestRunProfileBitset.Run */,
                    tests: toRun.map(t => t.test),
                });
            }
        }
        reevaluateWelcomeState() {
            const shouldShowWelcome = this.testService.collection.busyProviders === 0 && (0, testService_1.testCollectionIsEmpty)(this.testService.collection);
            const welcomeExperience = shouldShowWelcome
                ? (this.filterState.isFilteringFor("@doc" /* TestFilterTerm.CurrentDoc */) ? 2 /* WelcomeExperience.ForDocument */ : 1 /* WelcomeExperience.ForWorkspace */)
                : 0 /* WelcomeExperience.None */;
            if (welcomeExperience !== this.welcomeExperience) {
                this.welcomeExperience = welcomeExperience;
                this.welcomeVisibilityEmitter.fire(welcomeExperience);
            }
        }
        ensureProjection() {
            return this.projection.value ?? this.updatePreferredProjection();
        }
        updatePreferredProjection() {
            this.projection.clear();
            const lastState = this.lastViewState.get({});
            if (this._viewMode.get() === "list" /* TestExplorerViewMode.List */) {
                this.projection.value = this.instantiationService.createInstance(listProjection_1.ListProjection, lastState);
            }
            else {
                this.projection.value = this.instantiationService.createInstance(treeProjection_1.TreeProjection, lastState);
            }
            const scheduler = this._register(new async_1.RunOnceScheduler(() => this.applyProjectionChanges(), 200));
            this.projection.value.onUpdate(() => {
                if (!scheduler.isScheduled()) {
                    scheduler.schedule();
                }
            });
            this.applyProjectionChanges();
            return this.projection.value;
        }
        applyProjectionChanges() {
            this.reevaluateWelcomeState();
            this.projection.value?.applyTo(this.tree);
            this.tree.refilter();
            if (this.hasPendingReveal) {
                this.revealById(this.filterState.reveal.value);
            }
        }
        /**
         * Gets the selected tests from the tree.
         */
        getSelectedTests() {
            return this.tree.getSelection();
        }
    };
    TestingExplorerViewModel = __decorate([
        __param(2, configuration_1.IConfigurationService),
        __param(3, editorService_1.IEditorService),
        __param(4, actions_2.IMenuService),
        __param(5, contextView_1.IContextMenuService),
        __param(6, testService_1.ITestService),
        __param(7, testExplorerFilterState_1.ITestExplorerFilterState),
        __param(8, instantiation_1.IInstantiationService),
        __param(9, storage_1.IStorageService),
        __param(10, contextkey_1.IContextKeyService),
        __param(11, testResultService_1.ITestResultService),
        __param(12, testingPeekOpener_1.ITestingPeekOpener),
        __param(13, testProfileService_1.ITestProfileService),
        __param(14, testingContinuousRunService_1.ITestingContinuousRunService),
        __param(15, commands_1.ICommandService)
    ], TestingExplorerViewModel);
    var FilterResult;
    (function (FilterResult) {
        FilterResult[FilterResult["Exclude"] = 0] = "Exclude";
        FilterResult[FilterResult["Inherit"] = 1] = "Inherit";
        FilterResult[FilterResult["Include"] = 2] = "Include";
    })(FilterResult || (FilterResult = {}));
    const hasNodeInOrParentOfUri = (collection, ident, testUri, fromNode) => {
        const queue = [fromNode ? [fromNode] : collection.rootIds];
        while (queue.length) {
            for (const id of queue.pop()) {
                const node = collection.getNodeById(id);
                if (!node) {
                    continue;
                }
                if (!node.item.uri || !ident.extUri.isEqualOrParent(testUri, node.item.uri)) {
                    continue;
                }
                // Only show nodes that can be expanded (and might have a child with
                // a range) or ones that have a physical location.
                if (node.item.range || node.expand === 1 /* TestItemExpandState.Expandable */) {
                    return true;
                }
                queue.push(node.children);
            }
        }
        return false;
    };
    let TestsFilter = class TestsFilter {
        constructor(collection, state, testService, uriIdentityService) {
            this.collection = collection;
            this.state = state;
            this.testService = testService;
            this.uriIdentityService = uriIdentityService;
        }
        /**
         * @inheritdoc
         */
        filter(element) {
            if (element instanceof index_1.TestTreeErrorMessage) {
                return 1 /* TreeVisibility.Visible */;
            }
            if (element.test
                && !this.state.isFilteringFor("@hidden" /* TestFilterTerm.Hidden */)
                && this.testService.excluded.contains(element.test)) {
                return 0 /* TreeVisibility.Hidden */;
            }
            switch (Math.min(this.testFilterText(element), this.testLocation(element), this.testState(element), this.testTags(element))) {
                case 0 /* FilterResult.Exclude */:
                    return 0 /* TreeVisibility.Hidden */;
                case 2 /* FilterResult.Include */:
                    return 1 /* TreeVisibility.Visible */;
                default:
                    return 2 /* TreeVisibility.Recurse */;
            }
        }
        filterToDocumentUri(uri) {
            this.documentUri = uri;
        }
        testTags(element) {
            if (!this.state.includeTags.size && !this.state.excludeTags.size) {
                return 2 /* FilterResult.Include */;
            }
            return (this.state.includeTags.size ?
                element.test.item.tags.some(t => this.state.includeTags.has(t)) :
                true) && element.test.item.tags.every(t => !this.state.excludeTags.has(t))
                ? 2 /* FilterResult.Include */
                : 1 /* FilterResult.Inherit */;
        }
        testState(element) {
            if (this.state.isFilteringFor("@failed" /* TestFilterTerm.Failed */)) {
                return (0, testingStates_1.isFailedState)(element.state) ? 2 /* FilterResult.Include */ : 1 /* FilterResult.Inherit */;
            }
            if (this.state.isFilteringFor("@executed" /* TestFilterTerm.Executed */)) {
                return element.state !== 0 /* TestResultState.Unset */ ? 2 /* FilterResult.Include */ : 1 /* FilterResult.Inherit */;
            }
            return 2 /* FilterResult.Include */;
        }
        testLocation(element) {
            if (!this.documentUri) {
                return 2 /* FilterResult.Include */;
            }
            if (!this.state.isFilteringFor("@doc" /* TestFilterTerm.CurrentDoc */) || !(element instanceof index_1.TestItemTreeElement)) {
                return 2 /* FilterResult.Include */;
            }
            if (hasNodeInOrParentOfUri(this.collection, this.uriIdentityService, this.documentUri, element.test.item.extId)) {
                return 2 /* FilterResult.Include */;
            }
            return 1 /* FilterResult.Inherit */;
        }
        testFilterText(element) {
            if (this.state.globList.length === 0) {
                return 2 /* FilterResult.Include */;
            }
            const fuzzy = this.state.fuzzy.value;
            for (let e = element; e; e = e.parent) {
                // start as included if the first glob is a negation
                let included = this.state.globList[0].include === false ? 2 /* FilterResult.Include */ : 1 /* FilterResult.Inherit */;
                const data = e.test.item.label.toLowerCase();
                for (const { include, text } of this.state.globList) {
                    if (fuzzy ? (0, strings_1.fuzzyContains)(data, text) : data.includes(text)) {
                        included = include ? 2 /* FilterResult.Include */ : 0 /* FilterResult.Exclude */;
                    }
                }
                if (included !== 1 /* FilterResult.Inherit */) {
                    return included;
                }
            }
            return 1 /* FilterResult.Inherit */;
        }
    };
    TestsFilter = __decorate([
        __param(1, testExplorerFilterState_1.ITestExplorerFilterState),
        __param(2, testService_1.ITestService),
        __param(3, uriIdentity_1.IUriIdentityService)
    ], TestsFilter);
    class TreeSorter {
        constructor(viewModel) {
            this.viewModel = viewModel;
        }
        compare(a, b) {
            if (a instanceof index_1.TestTreeErrorMessage || b instanceof index_1.TestTreeErrorMessage) {
                return (a instanceof index_1.TestTreeErrorMessage ? -1 : 0) + (b instanceof index_1.TestTreeErrorMessage ? 1 : 0);
            }
            const durationDelta = (b.duration || 0) - (a.duration || 0);
            if (this.viewModel.viewSorting === "duration" /* TestExplorerViewSorting.ByDuration */ && durationDelta !== 0) {
                return durationDelta;
            }
            const stateDelta = (0, testingStates_1.cmpPriority)(a.state, b.state);
            if (this.viewModel.viewSorting === "status" /* TestExplorerViewSorting.ByStatus */ && stateDelta !== 0) {
                return stateDelta;
            }
            let inSameLocation = false;
            if (a instanceof index_1.TestItemTreeElement && b instanceof index_1.TestItemTreeElement && a.test.item.uri && b.test.item.uri && a.test.item.uri.toString() === b.test.item.uri.toString() && a.test.item.range && b.test.item.range) {
                inSameLocation = true;
                const delta = a.test.item.range.startLineNumber - b.test.item.range.startLineNumber;
                if (delta !== 0) {
                    return delta;
                }
            }
            const sa = a.test.item.sortText;
            const sb = b.test.item.sortText;
            // If tests are in the same location and there's no preferred sortText,
            // keep the extension's insertion order (#163449).
            return inSameLocation && !sa && !sb ? 0 : (sa || a.test.item.label).localeCompare(sb || b.test.item.label);
        }
    }
    let NoTestsForDocumentWidget = class NoTestsForDocumentWidget extends lifecycle_1.Disposable {
        constructor(container, filterState) {
            super();
            const el = this.el = dom.append(container, dom.$('.testing-no-test-placeholder'));
            const emptyParagraph = dom.append(el, dom.$('p'));
            emptyParagraph.innerText = (0, nls_1.localize)('testingNoTest', 'No tests were found in this file.');
            const buttonLabel = (0, nls_1.localize)('testingFindExtension', 'Show Workspace Tests');
            const button = this._register(new button_1.Button(el, { title: buttonLabel, ...defaultStyles_1.defaultButtonStyles }));
            button.label = buttonLabel;
            this._register(button.onDidClick(() => filterState.toggleFilteringFor("@doc" /* TestFilterTerm.CurrentDoc */, false)));
        }
        setVisible(isVisible) {
            this.el.classList.toggle('visible', isVisible);
        }
    };
    NoTestsForDocumentWidget = __decorate([
        __param(1, testExplorerFilterState_1.ITestExplorerFilterState)
    ], NoTestsForDocumentWidget);
    class TestExplorerActionRunner extends actions_1.ActionRunner {
        constructor(getSelectedTests) {
            super();
            this.getSelectedTests = getSelectedTests;
        }
        async runAction(action, context) {
            if (!(action instanceof actions_2.MenuItemAction)) {
                return super.runAction(action, context);
            }
            const selection = this.getSelectedTests();
            const contextIsSelected = selection.some(s => s === context);
            const actualContext = contextIsSelected ? selection : [context];
            const actionable = actualContext.filter((t) => t instanceof index_1.TestItemTreeElement);
            await action.run(...actionable);
        }
    }
    const getLabelForTestTreeElement = (element) => {
        let label = (0, constants_1.labelForTestInState)(element.description || element.test.item.label, element.state);
        if (element instanceof index_1.TestItemTreeElement) {
            if (element.duration !== undefined) {
                label = (0, nls_1.localize)({
                    key: 'testing.treeElementLabelDuration',
                    comment: ['{0} is the original label in testing.treeElementLabel, {1} is a duration'],
                }, '{0}, in {1}', label, formatDuration(element.duration));
            }
            if (element.retired) {
                label = (0, nls_1.localize)({
                    key: 'testing.treeElementLabelOutdated',
                    comment: ['{0} is the original label in testing.treeElementLabel'],
                }, '{0}, outdated result', label);
            }
        }
        return label;
    };
    class ListAccessibilityProvider {
        getWidgetAriaLabel() {
            return (0, nls_1.localize)('testExplorer', "Test Explorer");
        }
        getAriaLabel(element) {
            return element instanceof index_1.TestTreeErrorMessage
                ? element.description
                : getLabelForTestTreeElement(element);
        }
    }
    class TreeKeyboardNavigationLabelProvider {
        getKeyboardNavigationLabel(element) {
            return element instanceof index_1.TestTreeErrorMessage ? element.message : element.test.item.label;
        }
    }
    class ListDelegate {
        getHeight(_element) {
            return 22;
        }
        getTemplateId(element) {
            if (element instanceof index_1.TestTreeErrorMessage) {
                return ErrorRenderer.ID;
            }
            return TestItemRenderer.ID;
        }
    }
    class IdentityProvider {
        getId(element) {
            return element.treeId;
        }
    }
    let ErrorRenderer = class ErrorRenderer {
        static { ErrorRenderer_1 = this; }
        static { this.ID = 'error'; }
        constructor(instantionService) {
            this.renderer = instantionService.createInstance(markdownRenderer_1.MarkdownRenderer, {});
        }
        get templateId() {
            return ErrorRenderer_1.ID;
        }
        renderTemplate(container) {
            const label = dom.append(container, dom.$('.error'));
            return { label };
        }
        renderElement({ element }, _, data) {
            if (typeof element.message === 'string') {
                data.label.innerText = element.message;
            }
            else {
                const result = this.renderer.render(element.message, { inline: true });
                data.label.appendChild(result.element);
            }
            data.label.title = element.description;
        }
        disposeTemplate() {
            // noop
        }
    };
    ErrorRenderer = ErrorRenderer_1 = __decorate([
        __param(0, instantiation_1.IInstantiationService)
    ], ErrorRenderer);
    let TestItemRenderer = class TestItemRenderer extends lifecycle_1.Disposable {
        static { TestItemRenderer_1 = this; }
        static { this.ID = 'testItem'; }
        constructor(actionRunner, menuService, testService, profiles, contextKeyService, instantiationService, crService) {
            super();
            this.actionRunner = actionRunner;
            this.menuService = menuService;
            this.testService = testService;
            this.profiles = profiles;
            this.contextKeyService = contextKeyService;
            this.instantiationService = instantiationService;
            this.crService = crService;
            /**
             * @inheritdoc
             */
            this.templateId = TestItemRenderer_1.ID;
        }
        /**
         * @inheritdoc
         */
        renderTemplate(container) {
            const wrapper = dom.append(container, dom.$('.test-item'));
            const icon = dom.append(wrapper, dom.$('.computed-state'));
            const label = dom.append(wrapper, dom.$('.label'));
            const disposable = new lifecycle_1.DisposableStore();
            dom.append(wrapper, dom.$(themables_1.ThemeIcon.asCSSSelector(icons.testingHiddenIcon)));
            const actionBar = disposable.add(new actionbar_1.ActionBar(wrapper, {
                actionRunner: this.actionRunner,
                actionViewItemProvider: action => action instanceof actions_2.MenuItemAction
                    ? this.instantiationService.createInstance(menuEntryActionViewItem_1.MenuEntryActionViewItem, action, undefined)
                    : undefined
            }));
            disposable.add(this.crService.onDidChange(changed => {
                const id = templateData.current?.test.item.extId;
                if (id && (!changed || changed === id || testId_1.TestId.isChild(id, changed))) {
                    this.fillActionBar(templateData.current, templateData);
                }
            }));
            const templateData = { wrapper, label, actionBar, icon, elementDisposable: new lifecycle_1.DisposableStore(), templateDisposable: disposable };
            return templateData;
        }
        /**
         * @inheritdoc
         */
        disposeTemplate(templateData) {
            templateData.templateDisposable.clear();
        }
        /**
         * @inheritdoc
         */
        disposeElement(_element, _, templateData) {
            templateData.elementDisposable.clear();
        }
        fillActionBar(element, data) {
            const { actions, contextOverlay } = getActionableElementActions(this.contextKeyService, this.menuService, this.testService, this.crService, this.profiles, element);
            const crSelf = !!contextOverlay.getContextKeyValue(testingContextKeys_1.TestingContextKeys.isContinuousModeOn.key);
            const crChild = !crSelf && this.crService.isEnabledForAChildOf(element.test.item.extId);
            data.actionBar.domNode.classList.toggle('testing-is-continuous-run', crSelf || crChild);
            data.actionBar.clear();
            data.actionBar.context = element;
            data.actionBar.push(actions.primary, { icon: true, label: false });
        }
        /**
         * @inheritdoc
         */
        renderElement(node, _depth, data) {
            data.elementDisposable.clear();
            data.current = node.element;
            this.fillActionBar(node.element, data);
            data.elementDisposable.add(node.element.onChange(() => this._renderElement(node, data)));
            this._renderElement(node, data);
        }
        _renderElement(node, data) {
            const testHidden = this.testService.excluded.contains(node.element.test);
            data.wrapper.classList.toggle('test-is-hidden', testHidden);
            const icon = icons.testingStatesToIcons.get(node.element.test.expand === 2 /* TestItemExpandState.BusyExpanding */ || node.element.test.item.busy
                ? 2 /* TestResultState.Running */
                : node.element.state);
            data.icon.className = 'computed-state ' + (icon ? themables_1.ThemeIcon.asClassName(icon) : '');
            if (node.element.retired) {
                data.icon.className += ' retired';
            }
            data.label.title = getLabelForTestTreeElement(node.element);
            if (node.element.test.item.label.trim()) {
                dom.reset(data.label, ...(0, iconLabels_1.renderLabelWithIcons)(node.element.test.item.label));
            }
            else {
                data.label.textContent = String.fromCharCode(0xA0); // &nbsp;
            }
            let description = node.element.description;
            if (node.element.duration !== undefined) {
                description = description
                    ? `${description}: ${formatDuration(node.element.duration)}`
                    : formatDuration(node.element.duration);
            }
            if (description) {
                dom.append(data.label, dom.$('span.test-label-description', {}, description));
            }
        }
    };
    TestItemRenderer = TestItemRenderer_1 = __decorate([
        __param(1, actions_2.IMenuService),
        __param(2, testService_1.ITestService),
        __param(3, testProfileService_1.ITestProfileService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, testingContinuousRunService_1.ITestingContinuousRunService)
    ], TestItemRenderer);
    const formatDuration = (ms) => {
        if (ms < 10) {
            return `${ms.toFixed(1)}ms`;
        }
        if (ms < 1000) {
            return `${ms.toFixed(0)}ms`;
        }
        return `${(ms / 1000).toFixed(1)}s`;
    };
    const getActionableElementActions = (contextKeyService, menuService, testService, crService, profiles, element) => {
        const test = element instanceof index_1.TestItemTreeElement ? element.test : undefined;
        const contextKeys = (0, testItemContextOverlay_1.getTestItemContextOverlay)(test, test ? profiles.capabilitiesForTest(test) : 0);
        contextKeys.push(['view', "workbench.view.testing" /* Testing.ExplorerViewId */]);
        if (test) {
            const ctrl = testService.getTestController(test.controllerId);
            const supportsCr = !!ctrl && profiles.getControllerProfiles(ctrl.id).some(p => p.supportsContinuousRun);
            contextKeys.push([
                testingContextKeys_1.TestingContextKeys.canRefreshTests.key,
                !!ctrl?.canRefresh.value && testId_1.TestId.isRoot(test.item.extId),
            ], [
                testingContextKeys_1.TestingContextKeys.testItemIsHidden.key,
                testService.excluded.contains(test)
            ], [
                testingContextKeys_1.TestingContextKeys.isContinuousModeOn.key,
                supportsCr && crService.isSpecificallyEnabledFor(test.item.extId)
            ], [
                testingContextKeys_1.TestingContextKeys.isParentRunningContinuously.key,
                supportsCr && crService.isEnabledForAParentOf(test.item.extId)
            ], [
                testingContextKeys_1.TestingContextKeys.supportsContinuousRun.key,
                supportsCr,
            ]);
        }
        const contextOverlay = contextKeyService.createOverlay(contextKeys);
        const menu = menuService.createMenu(actions_2.MenuId.TestItem, contextOverlay);
        try {
            const primary = [];
            const secondary = [];
            const result = { primary, secondary };
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, {
                shouldForwardArgs: true,
            }, result, 'inline');
            return { actions: result, contextOverlay };
        }
        finally {
            menu.dispose();
        }
    };
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        if (theme.type === 'dark') {
            const foregroundColor = theme.getColor(colorRegistry_1.foreground);
            if (foregroundColor) {
                const fgWithOpacity = new color_1.Color(new color_1.RGBA(foregroundColor.rgba.r, foregroundColor.rgba.g, foregroundColor.rgba.b, 0.65));
                collector.addRule(`.test-explorer .test-explorer-messages { color: ${fgWithOpacity}; }`);
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZ0V4cGxvcmVyVmlldy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlc3RpbmcvYnJvd3Nlci90ZXN0aW5nRXhwbG9yZXJWaWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUEyRWhHLElBQVcsY0FHVjtJQUhELFdBQVcsY0FBYztRQUN4QixxREFBSyxDQUFBO1FBQ0wsbURBQUksQ0FBQTtJQUNMLENBQUMsRUFIVSxjQUFjLEtBQWQsY0FBYyxRQUd4QjtJQUVNLElBQU0sbUJBQW1CLEdBQXpCLE1BQU0sbUJBQW9CLFNBQVEsbUJBQVE7UUFXaEQsSUFBVyxtQkFBbUI7WUFDN0IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxNQUFNLENBQUMsaUJBQVMsQ0FBQyxDQUFDO1FBQ3pELENBQUM7UUFFRCxZQUNDLE9BQTRCLEVBQ1Asa0JBQXVDLEVBQ3hDLGlCQUFxQyxFQUNsQyxvQkFBMkMsRUFDM0Msb0JBQTJDLEVBQzFDLHFCQUE2QyxFQUNqRCxpQkFBcUMsRUFDekMsYUFBNkIsRUFDOUIsWUFBMkIsRUFDNUIsV0FBMEMsRUFDckMsZ0JBQW1DLEVBQ2pDLGtCQUF3RCxFQUM1RCxjQUFnRDtZQUVqRSxLQUFLLENBQUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLGtCQUFrQixFQUFFLG9CQUFvQixFQUFFLGlCQUFpQixFQUFFLHFCQUFxQixFQUFFLG9CQUFvQixFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUw1SixnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUVsQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQzNDLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQTFCMUQsb0JBQWUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFD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