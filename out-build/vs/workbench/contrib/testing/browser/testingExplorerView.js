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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/button/button", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/browser/ui/list/listWidget", "vs/base/common/actions", "vs/base/common/arraysFind", "vs/base/common/async", "vs/base/common/color", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/base/common/themables", "vs/base/common/types", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/nls!vs/workbench/contrib/testing/browser/testingExplorerView", "vs/platform/actions/browser/dropdownWithPrimaryActionViewItem", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/opener/common/opener", "vs/platform/progress/common/progress", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/browser/defaultStyles", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/iconRegistry", "vs/platform/theme/common/themeService", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/browser/actions/widgetNavigationCommands", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/editor/diffEditorInput", "vs/workbench/common/views", "vs/workbench/contrib/testing/browser/explorerProjections/index", "vs/workbench/contrib/testing/browser/explorerProjections/listProjection", "vs/workbench/contrib/testing/browser/explorerProjections/testItemContextOverlay", "vs/workbench/contrib/testing/browser/explorerProjections/testingObjectTree", "vs/workbench/contrib/testing/browser/explorerProjections/treeProjection", "vs/workbench/contrib/testing/browser/icons", "vs/workbench/contrib/testing/browser/testExplorerActions", "vs/workbench/contrib/testing/browser/testingExplorerFilter", "vs/workbench/contrib/testing/browser/testingProgressUiService", "vs/workbench/contrib/testing/common/configuration", "vs/workbench/contrib/testing/common/constants", "vs/workbench/contrib/testing/common/storedValue", "vs/workbench/contrib/testing/common/testExplorerFilterState", "vs/workbench/contrib/testing/common/testId", "vs/workbench/contrib/testing/common/testProfileService", "vs/workbench/contrib/testing/common/testResult", "vs/workbench/contrib/testing/common/testResultService", "vs/workbench/contrib/testing/common/testService", "vs/workbench/contrib/testing/common/testingContextKeys", "vs/workbench/contrib/testing/common/testingContinuousRunService", "vs/workbench/contrib/testing/common/testingPeekOpener", "vs/workbench/contrib/testing/common/testingStates", "vs/workbench/services/activity/common/activity", "vs/workbench/services/editor/common/editorService", "vs/css!./media/testing"], function (require, exports, dom, actionbar_1, button_1, iconLabels_1, listWidget_1, actions_1, arraysFind_1, async_1, color_1, event_1, lifecycle_1, strings_1, themables_1, types_1, markdownRenderer_1, nls_1, dropdownWithPrimaryActionViewItem_1, menuEntryActionViewItem_1, actions_2, commands_1, configuration_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, opener_1, progress_1, storage_1, telemetry_1, defaultStyles_1, colorRegistry_1, iconRegistry_1, themeService_1, uriIdentity_1, widgetNavigationCommands_1, viewPane_1, diffEditorInput_1, views_1, index_1, listProjection_1, testItemContextOverlay_1, testingObjectTree_1, treeProjection_1, icons, testExplorerActions_1, testingExplorerFilter_1, testingProgressUiService_1, configuration_2, constants_1, storedValue_1, testExplorerFilterState_1, testId_1, testProfileService_1, testResult_1, testResultService_1, testService_1, testingContextKeys_1, testingContinuousRunService_1, testingPeekOpener_1, testingStates_1, activity_1, editorService_1) {
    "use strict";
    var ErrorRenderer_1, TestItemRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$zLb = void 0;
    var LastFocusState;
    (function (LastFocusState) {
        LastFocusState[LastFocusState["Input"] = 0] = "Input";
        LastFocusState[LastFocusState["Tree"] = 1] = "Tree";
    })(LastFocusState || (LastFocusState = {}));
    let $zLb = class $zLb extends viewPane_1.$Ieb {
        get focusedTreeElements() {
            return this.viewModel.tree.getFocus().filter(types_1.$rf);
        }
        constructor(options, contextMenuService, keybindingService, configurationService, instantiationService, viewDescriptorService, contextKeyService, openerService, themeService, ac, telemetryService, bc, cc) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.ac = ac;
            this.bc = bc;
            this.cc = cc;
            this.f = this.B(new lifecycle_1.$lc());
            this.Wb = this.B(new lifecycle_1.$lc());
            this.Xb = this.B(new lifecycle_1.$lc());
            this.Yb = this.B(new lifecycle_1.$lc());
            this.Zb = { width: 0, height: 0 };
            this.$b = 0 /* LastFocusState.Input */;
            const relayout = this.B(new async_1.$Sg(() => this.W(), 1));
            this.B(this.onDidChangeViewWelcomeState(() => {
                if (!this.shouldShowWelcome()) {
                    relayout.schedule();
                }
            }));
            this.B(ac.collection.onBusyProvidersChange(busy => {
                this.hc(busy);
            }));
            this.B(bc.onDidChange(() => this.Ub()));
        }
        shouldShowWelcome() {
            return this.viewModel?.welcomeExperience === 1 /* WelcomeExperience.ForWorkspace */ ?? true;
        }
        focus() {
            super.focus();
            if (this.$b === 1 /* LastFocusState.Tree */) {
                this.viewModel.tree.domFocus();
            }
            else {
                this.Xb.value?.focus();
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
                if (!(element instanceof index_1.$rKb) || !this.viewModel.tree.hasElement(element)) {
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
                    && (!profile || (0, testProfileService_1.$0sb)(profile, element.test))
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
                const sel = this.viewModel.tree.getSelection().filter(types_1.$rf);
                if (sel.length) {
                    L: for (const node of sel) {
                        if (node instanceof index_1.$rKb) {
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
            for (const root of this.ac.collection.rootItems) {
                const element = projection.getElementByTestId(root.item.extId);
                if (!element) {
                    continue;
                }
                if (profile && !(0, testProfileService_1.$0sb)(profile, root)) {
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
            this.B((0, widgetNavigationCommands_1.$Cmb)({
                focusNotifiers: [this],
                focusNextWidget: () => {
                    if (!this.viewModel.tree.isDOMFocused()) {
                        this.viewModel.tree.domFocus();
                    }
                },
                focusPreviousWidget: () => {
                    if (this.viewModel.tree.isDOMFocused()) {
                        this.Xb.value?.focus();
                    }
                }
            }));
        }
        /**
         * @override
         */
        U(container) {
            super.U(container);
            this.j = dom.$0O(container, dom.$('.test-explorer'));
            this.m = dom.$0O(this.j, dom.$('.test-explorer-header'));
            this.f.value = this.gc();
            const messagesContainer = dom.$0O(this.m, dom.$('.result-summary-container'));
            this.B(this.Bb.createInstance(ResultSummaryView, messagesContainer));
            const listContainer = dom.$0O(this.j, dom.$('.test-explorer-tree'));
            this.viewModel = this.Bb.createInstance(TestingExplorerViewModel, listContainer, this.onDidChangeBodyVisibility);
            this.B(this.viewModel.tree.onDidFocus(() => this.$b = 1 /* LastFocusState.Tree */));
            this.B(this.viewModel.onChangeWelcomeVisibility(() => this.db.fire()));
            this.B(this.viewModel);
            this.db.fire();
        }
        /** @override  */
        getActionViewItem(action) {
            switch (action.id) {
                case "workbench.actions.treeView.testExplorer.filter" /* TestCommandId.FilterAction */:
                    this.Xb.value = this.Bb.createInstance(testingExplorerFilter_1.$vLb, action);
                    this.Yb.value = this.Xb.value.onDidFocus(() => this.$b = 0 /* LastFocusState.Input */);
                    return this.Xb.value;
                case "testing.runSelected" /* TestCommandId.RunSelectedAction */:
                    return this.fc(2 /* TestRunProfileBitset.Run */, action);
                case "testing.debugSelected" /* TestCommandId.DebugSelectedAction */:
                    return this.fc(4 /* TestRunProfileBitset.Debug */, action);
                default:
                    return super.getActionViewItem(action);
            }
        }
        /** @inheritdoc */
        ec(group) {
            const profileActions = [];
            let participatingGroups = 0;
            let hasConfigurable = false;
            const defaults = this.bc.getGroupDefaultProfiles(group);
            for (const { profiles, controller } of this.bc.all()) {
                let hasAdded = false;
                for (const profile of profiles) {
                    if (profile.group !== group) {
                        continue;
                    }
                    if (!hasAdded) {
                        hasAdded = true;
                        participatingGroups++;
                        profileActions.push(new actions_1.$gi(`${controller.id}.$root`, controller.label.value, undefined, false));
                    }
                    hasConfigurable = hasConfigurable || profile.hasConfigurationHandler;
                    profileActions.push(new actions_1.$gi(`${controller.id}.${profile.profileId}`, defaults.includes(profile) ? (0, nls_1.localize)(0, null, profile.label) : profile.label, undefined, undefined, () => {
                        const { include, exclude } = this.getTreeIncludeExclude(profile);
                        this.ac.runResolvedTests({
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
                postActions.push(new actions_1.$gi('selectDefaultTestConfigurations', (0, nls_1.localize)(1, null), undefined, undefined, () => this.cc.executeCommand("testing.selectDefaultTestProfiles" /* TestCommandId.SelectDefaultTestProfiles */, group)));
            }
            if (hasConfigurable) {
                postActions.push(new actions_1.$gi('configureTestProfiles', (0, nls_1.localize)(2, null), undefined, undefined, () => this.cc.executeCommand("testing.configureProfile" /* TestCommandId.ConfigureTestProfilesAction */, group)));
            }
            return actions_1.$ii.join(profileActions, postActions);
        }
        /**
         * @override
         */
        saveState() {
            this.Xb.value?.saveState();
            super.saveState();
        }
        fc(group, defaultAction) {
            const dropdownActions = this.ec(group);
            if (dropdownActions.length < 2) {
                return super.getActionViewItem(defaultAction);
            }
            const primaryAction = this.Bb.createInstance(actions_2.$Vu, {
                id: defaultAction.id,
                title: defaultAction.label,
                icon: group === 2 /* TestRunProfileBitset.Run */
                    ? icons.$3Jb
                    : icons.$4Jb,
            }, undefined, undefined, undefined);
            const dropdownAction = new actions_1.$gi('selectRunConfig', 'Select Configuration...', 'codicon-chevron-down', true);
            return this.Bb.createInstance(dropdownWithPrimaryActionViewItem_1.$Vqb, primaryAction, dropdownAction, dropdownActions, '', this.xb, {});
        }
        gc() {
            const bar = new actionbar_1.$1P(this.m, {
                actionViewItemProvider: action => this.getActionViewItem(action),
                triggerKeys: { keyDown: false, keys: [] },
            });
            bar.push(new actions_1.$gi("workbench.actions.treeView.testExplorer.filter" /* TestCommandId.FilterAction */));
            bar.getContainer().classList.add('testing-filter-action-bar');
            return bar;
        }
        hc(busy) {
            if (!busy && this.Wb) {
                this.Wb.clear();
            }
            else if (busy && !this.Wb.value) {
                this.Wb.value = this.Bb.createInstance(progress_1.$5u, { location: this.Qb() });
            }
        }
        /**
         * @override
         */
        W(height = this.Zb.height, width = this.Zb.width) {
            super.W(height, width);
            this.Zb.height = height;
            this.Zb.width = width;
            this.j.style.height = `${height}px`;
            this.viewModel?.layout(height - this.m.clientHeight, width);
            this.Xb.value?.layout(width);
        }
    };
    exports.$zLb = $zLb;
    exports.$zLb = $zLb = __decorate([
        __param(1, contextView_1.$WZ),
        __param(2, keybinding_1.$2D),
        __param(3, configuration_1.$8h),
        __param(4, instantiation_1.$Ah),
        __param(5, views_1.$_E),
        __param(6, contextkey_1.$3i),
        __param(7, opener_1.$NT),
        __param(8, themeService_1.$gv),
        __param(9, testService_1.$4sb),
        __param(10, telemetry_1.$9k),
        __param(11, testProfileService_1.$9sb),
        __param(12, commands_1.$Fr)
    ], $zLb);
    const SUMMARY_RENDER_INTERVAL = 200;
    let ResultSummaryView = class ResultSummaryView extends lifecycle_1.$kc {
        constructor(z, C, D, F, configurationService, instantiationService) {
            super();
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.f = false;
            this.u = this.B(new lifecycle_1.$lc());
            this.w = this.B(new async_1.$Sg(() => this.G(), SUMMARY_RENDER_INTERVAL));
            this.y = dom.h('div.result-summary', [
                dom.h('div@status'),
                dom.h('div@count'),
                dom.h('div@count'),
                dom.h('span'),
                dom.h('duration@duration'),
                dom.h('a@rerun'),
            ]);
            this.j = configurationService.getValue("testing.countBadge" /* TestingConfigKeys.CountBadge */);
            this.B(C.onResultsChanged(this.G, this));
            this.B(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("testing.countBadge" /* TestingConfigKeys.CountBadge */)) {
                    this.j = configurationService.getValue("testing.countBadge" /* TestingConfigKeys.CountBadge */);
                    this.G();
                }
            }));
            const ab = this.B(new actionbar_1.$1P(this.y.rerun, {
                actionViewItemProvider: action => (0, menuEntryActionViewItem_1.$F3)(instantiationService, action),
            }));
            ab.push(instantiationService.createInstance(actions_2.$Vu, { ...new testExplorerActions_1.$nLb().desc, icon: icons.$2Jb }, { ...new testExplorerActions_1.$oLb().desc, icon: icons.$5Jb }, {}, undefined), { icon: true, label: false });
            this.G();
        }
        G() {
            const { results } = this.C;
            const { count, root, status, duration, rerun } = this.y;
            if (!results.length) {
                this.z.innerText = (0, nls_1.localize)(3, null);
                if (this.f) {
                    this.z.removeChild(root);
                    this.f = false;
                }
                return;
            }
            const live = results.filter(r => !r.completedAt);
            let counts;
            if (live.length) {
                status.className = themables_1.ThemeIcon.asClassName(iconRegistry_1.$dv);
                counts = (0, testingProgressUiService_1.$xLb)(true, live);
                this.w.schedule();
                const last = live[live.length - 1];
                duration.textContent = formatDuration(Date.now() - last.startedAt);
                rerun.style.display = 'none';
            }
            else {
                const last = results[0];
                const dominantState = (0, arraysFind_1.$pb)(testingStates_1.$Usb, s => last.counts[s] > 0 ? s : undefined);
                status.className = themables_1.ThemeIcon.asClassName(icons.$eKb.get(dominantState ?? 0 /* TestResultState.Unset */));
                counts = (0, testingProgressUiService_1.$xLb)(false, [last]);
                duration.textContent = last instanceof testResult_1.$2sb ? formatDuration(last.completedAt - last.startedAt) : '';
                rerun.style.display = 'block';
            }
            count.textContent = `${counts.passed}/${counts.totalWillBeRun}`;
            count.title = (0, testingProgressUiService_1.$yLb)(counts);
            this.H(counts);
            if (!this.f) {
                dom.$lO(this.z);
                this.z.appendChild(root);
                this.f = true;
            }
        }
        H(countSummary) {
            if (countSummary && this.j !== "off" /* TestingCountBadge.Off */ && countSummary[this.j] !== 0) {
                if (this.m instanceof activity_1.$IV && this.m.number === countSummary[this.j]) {
                    return;
                }
                this.m = new activity_1.$IV(countSummary[this.j], num => this.I(this.j, num));
            }
            else if (this.F.isEnabled()) {
                if (this.m instanceof activity_1.$KV && this.m.icon === icons.$cKb) {
                    return;
                }
                this.m = new activity_1.$KV(icons.$cKb, () => (0, nls_1.localize)(4, null));
            }
            else {
                if (!this.m) {
                    return;
                }
                this.m = undefined;
            }
            this.u.value = this.m && this.D.showViewActivity("workbench.view.testing" /* Testing.ExplorerViewId */, { badge: this.m });
        }
        I(countBadgeType, count) {
            switch (countBadgeType) {
                case "passed" /* TestingCountBadge.Passed */:
                    return (0, nls_1.localize)(5, null, count);
                case "skipped" /* TestingCountBadge.Skipped */:
                    return (0, nls_1.localize)(6, null, count);
                default:
                    return (0, nls_1.localize)(7, null, count);
            }
        }
    };
    ResultSummaryView = __decorate([
        __param(1, testResultService_1.$ftb),
        __param(2, activity_1.$HV),
        __param(3, testingContinuousRunService_1.$QKb),
        __param(4, configuration_1.$8h),
        __param(5, instantiation_1.$Ah)
    ], ResultSummaryView);
    var WelcomeExperience;
    (function (WelcomeExperience) {
        WelcomeExperience[WelcomeExperience["None"] = 0] = "None";
        WelcomeExperience[WelcomeExperience["ForWorkspace"] = 1] = "ForWorkspace";
        WelcomeExperience[WelcomeExperience["ForDocument"] = 2] = "ForDocument";
    })(WelcomeExperience || (WelcomeExperience = {}));
    let TestingExplorerViewModel = class TestingExplorerViewModel extends lifecycle_1.$kc {
        get viewMode() {
            return this.m.get() ?? "true" /* TestExplorerViewMode.Tree */;
        }
        set viewMode(newMode) {
            if (newMode === this.m.get()) {
                return;
            }
            this.m.set(newMode);
            this.bb();
            this.M.store('testing.viewMode', newMode, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        get viewSorting() {
            return this.u.get() ?? "status" /* TestExplorerViewSorting.ByStatus */;
        }
        set viewSorting(newSorting) {
            if (newSorting === this.u.get()) {
                return;
            }
            this.u.set(newSorting);
            this.tree.resort(null);
            this.M.store('testing.viewSorting', newSorting, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        constructor(listContainer, onDidChangeVisibility, configurationService, editorService, F, G, H, I, J, M, N, O, P, Q, R, commandService) {
            super();
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.M = M;
            this.N = N;
            this.O = O;
            this.P = P;
            this.Q = Q;
            this.R = R;
            this.projection = this.B(new lifecycle_1.$lc());
            this.j = new lifecycle_1.$lc();
            this.m = testingContextKeys_1.TestingContextKeys.viewMode.bindTo(this.N);
            this.u = testingContextKeys_1.TestingContextKeys.viewSorting.bindTo(this.N);
            this.w = new event_1.$fd();
            this.y = new TestExplorerActionRunner(() => this.tree.getSelection().filter(types_1.$rf));
            this.z = this.B(new storedValue_1.$Gsb({
                key: 'testing.treeState',
                scope: 1 /* StorageScope.WORKSPACE */,
                target: 1 /* StorageTarget.MACHINE */,
            }, this.M));
            /**
             * Whether there's a reveal request which has not yet been delivered. This
             * can happen if the user asks to reveal before the test tree is loaded.
             * We check to see if the reveal request is present on each tree update,
             * and do it then if so.
             */
            this.D = false;
            /**
             * Fires when the visibility of the placeholder state changes.
             */
            this.onChangeWelcomeVisibility = this.w.event;
            /**
             * Gets whether the welcome should be visible.
             */
            this.welcomeExperience = 0 /* WelcomeExperience.None */;
            this.D = !!I.reveal.value;
            this.C = this.B(J.createInstance(NoTestsForDocumentWidget, listContainer));
            this.m.set(this.M.get('testing.viewMode', 1 /* StorageScope.WORKSPACE */, "true" /* TestExplorerViewMode.Tree */));
            this.u.set(this.M.get('testing.viewSorting', 1 /* StorageScope.WORKSPACE */, "location" /* TestExplorerViewSorting.ByLocation */));
            this.Y();
            this.f = this.J.createInstance(TestsFilter, H.collection);
            this.tree = J.createInstance(testingObjectTree_1.$xKb, 'Test Explorer List', listContainer, new ListDelegate(), [
                J.createInstance(TestItemRenderer, this.y),
                J.createInstance(ErrorRenderer),
            ], {
                identityProvider: J.createInstance(IdentityProvider),
                hideTwistiesOfChildlessElements: false,
                sorter: J.createInstance(TreeSorter, this),
                keyboardNavigationLabelProvider: J.createInstance(TreeKeyboardNavigationLabelProvider),
                accessibilityProvider: J.createInstance(ListAccessibilityProvider),
                filter: this.f,
                findWidgetEnabled: false,
                openOnSingleClick: false,
            });
            // saves the collapse state so that if items are removed or refreshed, they
            // retain the same state (#170169)
            const collapseStateSaver = this.B(new async_1.$Sg(() => {
                // reuse the last view state to avoid making a bunch of object garbage:
                const state = this.tree.getOptimizedViewState(this.z.get({}));
                const projection = this.projection.value;
                if (projection) {
                    projection.lastState = state;
                }
            }, 3000));
            this.B(this.tree.onDidChangeCollapseState(evt => {
                if (evt.node.element instanceof index_1.$rKb) {
                    if (!evt.node.collapsed) {
                        this.projection.value?.expandElement(evt.node.element, evt.deep ? Infinity : 0);
                    }
                    collapseStateSaver.schedule();
                }
            }));
            this.B(this.R.onDidChange(testId => {
                if (testId) {
                    // a continuous run test will sort to the top:
                    const elem = this.projection.value?.getElementByTestId(testId);
                    this.tree.resort(elem?.parent && this.tree.hasElement(elem.parent) ? elem.parent : null, false);
                }
            }));
            this.B(onDidChangeVisibility(visible => {
                if (visible) {
                    this.Z();
                }
            }));
            this.B(this.tree.onContextMenu(e => this.W(e)));
            this.B(event_1.Event.any(I.text.onDidChange, I.fuzzy.onDidChange, H.excluded.onTestExclusionsChanged)(this.tree.refilter, this.tree));
            this.B(this.tree.onDidOpen(e => {
                if (e.element instanceof index_1.$rKb && !e.element.children.size && e.element.test.item.uri) {
                    commandService.executeCommand('vscode.revealTest', e.element.test.item.extId);
                }
            }));
            this.B(this.tree);
            this.B(this.onChangeWelcomeVisibility(e => {
                this.C.setVisible(e === 2 /* WelcomeExperience.ForDocument */);
            }));
            this.B(dom.$oO(this.tree.getHTMLElement(), 'keydown', evt => {
                if (evt.equals(3 /* KeyCode.Enter */)) {
                    this.X(evt);
                }
                else if (listWidget_1.$qQ.mightProducePrintableCharacter(evt)) {
                    I.text.value = evt.browserEvent.key;
                    I.focusInput();
                }
            }));
            this.B(I.reveal.onDidChange(id => this.S(id, undefined, false)));
            this.B(onDidChangeVisibility(visible => {
                if (visible) {
                    I.focusInput();
                }
            }));
            this.B(this.tree.onDidChangeSelection(evt => {
                if (evt.browserEvent instanceof MouseEvent && (evt.browserEvent.altKey || evt.browserEvent.shiftKey)) {
                    return; // don't focus when alt-clicking to multi select
                }
                const selected = evt.elements[0];
                if (selected && evt.browserEvent && selected instanceof index_1.$rKb
                    && selected.children.size === 0 && selected.test.expand === 0 /* TestItemExpandState.NotExpandable */) {
                    this.U(selected);
                }
            }));
            let followRunningTests = (0, configuration_2.$hKb)(configurationService, "testing.followRunningTest" /* TestingConfigKeys.FollowRunningTest */);
            this.B(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("testing.followRunningTest" /* TestingConfigKeys.FollowRunningTest */)) {
                    followRunningTests = (0, configuration_2.$hKb)(configurationService, "testing.followRunningTest" /* TestingConfigKeys.FollowRunningTest */);
                }
            }));
            let alwaysRevealTestAfterStateChange = (0, configuration_2.$hKb)(configurationService, "testing.alwaysRevealTestOnStateChange" /* TestingConfigKeys.AlwaysRevealTestOnStateChange */);
            this.B(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("testing.alwaysRevealTestOnStateChange" /* TestingConfigKeys.AlwaysRevealTestOnStateChange */)) {
                    alwaysRevealTestAfterStateChange = (0, configuration_2.$hKb)(configurationService, "testing.alwaysRevealTestOnStateChange" /* TestingConfigKeys.AlwaysRevealTestOnStateChange */);
                }
            }));
            this.B(O.onTestChanged(evt => {
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
                if (evt.item.ownComputedState !== 2 /* TestResultState.Running */ && !(evt.previousState === 1 /* TestResultState.Queued */ && (0, testingStates_1.$Qsb)(evt.item.ownComputedState))) {
                    return;
                }
                this.S(evt.item.item.extId, alwaysRevealTestAfterStateChange, false);
            }));
            this.B(O.onResultsChanged(() => {
                this.tree.resort(null);
            }));
            this.B(this.Q.onDidChange(() => {
                this.tree.rerender();
            }));
            const onEditorChange = () => {
                if (editorService.activeEditor instanceof diffEditorInput_1.$3eb) {
                    this.f.filterToDocumentUri(editorService.activeEditor.primary.resource);
                }
                else {
                    this.f.filterToDocumentUri(editorService.activeEditor?.resource);
                }
                if (this.I.isFilteringFor("@doc" /* TestFilterTerm.CurrentDoc */)) {
                    this.tree.refilter();
                }
            };
            this.B(editorService.onDidActiveEditorChange(onEditorChange));
            this.B(this.M.onWillSaveState(({ reason, }) => {
                if (reason === storage_1.WillSaveStateReason.SHUTDOWN) {
                    this.z.store(this.tree.getOptimizedViewState());
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
        S(id, expand = true, focus = true) {
            if (!id) {
                this.D = false;
                return;
            }
            const projection = this.Z();
            // If the item itself is visible in the tree, show it. Otherwise, expand
            // its closest parent.
            let expandToLevel = 0;
            const idPath = [...testId_1.$PI.fromString(id).idsFromRoot()];
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
                for (let n = element; n instanceof index_1.$rKb; n = n.parent) {
                    if (n.test && this.H.excluded.contains(n.test)) {
                        this.I.toggleFilteringFor("@hidden" /* TestFilterTerm.Hidden */, true);
                        break;
                    }
                    if (!expand && (this.tree.hasElement(n) && this.tree.isCollapsed(n))) {
                        focusTarget = n;
                    }
                }
                this.I.reveal.value = undefined;
                this.D = false;
                if (focus) {
                    this.tree.domFocus();
                }
                if (this.tree.getRelativeTop(focusTarget) === null) {
                    this.tree.reveal(focusTarget, 0.5);
                }
                this.j.value = (0, async_1.$Ig)(() => {
                    this.tree.setFocus([focusTarget]);
                    this.tree.setSelection([focusTarget]);
                }, 1);
                return;
            }
            // If here, we've expanded all parents we can. Waiting on data to come
            // in to possibly show the revealed test.
            this.D = true;
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
        U(item) {
            const lookup = item.test && this.O.getStateById(item.test.item.extId);
            return lookup && lookup[1].tasks.some(s => (0, testingStates_1.$Psb)(s.state))
                ? this.P.tryPeekFirstError(lookup[0], lookup[1], { preserveFocus: true })
                : false;
        }
        W(evt) {
            const element = evt.element;
            if (!(element instanceof index_1.$rKb)) {
                return;
            }
            const { actions } = getActionableElementActions(this.N, this.F, this.H, this.R, this.Q, element);
            this.G.showContextMenu({
                getAnchor: () => evt.anchor,
                getActions: () => actions.secondary,
                getActionsContext: () => element,
                actionRunner: this.y,
            });
        }
        X(evt) {
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
                .filter((e) => e instanceof index_1.$rKb);
            if (toRun.length) {
                this.H.runTests({
                    group: 2 /* TestRunProfileBitset.Run */,
                    tests: toRun.map(t => t.test),
                });
            }
        }
        Y() {
            const shouldShowWelcome = this.H.collection.busyProviders === 0 && (0, testService_1.$5sb)(this.H.collection);
            const welcomeExperience = shouldShowWelcome
                ? (this.I.isFilteringFor("@doc" /* TestFilterTerm.CurrentDoc */) ? 2 /* WelcomeExperience.ForDocument */ : 1 /* WelcomeExperience.ForWorkspace */)
                : 0 /* WelcomeExperience.None */;
            if (welcomeExperience !== this.welcomeExperience) {
                this.welcomeExperience = welcomeExperience;
                this.w.fire(welcomeExperience);
            }
        }
        Z() {
            return this.projection.value ?? this.bb();
        }
        bb() {
            this.projection.clear();
            const lastState = this.z.get({});
            if (this.m.get() === "list" /* TestExplorerViewMode.List */) {
                this.projection.value = this.J.createInstance(listProjection_1.$wKb, lastState);
            }
            else {
                this.projection.value = this.J.createInstance(treeProjection_1.$yKb, lastState);
            }
            const scheduler = this.B(new async_1.$Sg(() => this.cb(), 200));
            this.projection.value.onUpdate(() => {
                if (!scheduler.isScheduled()) {
                    scheduler.schedule();
                }
            });
            this.cb();
            return this.projection.value;
        }
        cb() {
            this.Y();
            this.projection.value?.applyTo(this.tree);
            this.tree.refilter();
            if (this.D) {
                this.S(this.I.reveal.value);
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
        __param(2, configuration_1.$8h),
        __param(3, editorService_1.$9C),
        __param(4, actions_2.$Su),
        __param(5, contextView_1.$WZ),
        __param(6, testService_1.$4sb),
        __param(7, testExplorerFilterState_1.$EKb),
        __param(8, instantiation_1.$Ah),
        __param(9, storage_1.$Vo),
        __param(10, contextkey_1.$3i),
        __param(11, testResultService_1.$ftb),
        __param(12, testingPeekOpener_1.$kKb),
        __param(13, testProfileService_1.$9sb),
        __param(14, testingContinuousRunService_1.$QKb),
        __param(15, commands_1.$Fr)
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
        constructor(f, j, k, l) {
            this.f = f;
            this.j = j;
            this.k = k;
            this.l = l;
        }
        /**
         * @inheritdoc
         */
        filter(element) {
            if (element instanceof index_1.$sKb) {
                return 1 /* TreeVisibility.Visible */;
            }
            if (element.test
                && !this.j.isFilteringFor("@hidden" /* TestFilterTerm.Hidden */)
                && this.k.excluded.contains(element.test)) {
                return 0 /* TreeVisibility.Hidden */;
            }
            switch (Math.min(this.u(element), this.q(element), this.o(element), this.m(element))) {
                case 0 /* FilterResult.Exclude */:
                    return 0 /* TreeVisibility.Hidden */;
                case 2 /* FilterResult.Include */:
                    return 1 /* TreeVisibility.Visible */;
                default:
                    return 2 /* TreeVisibility.Recurse */;
            }
        }
        filterToDocumentUri(uri) {
            this.d = uri;
        }
        m(element) {
            if (!this.j.includeTags.size && !this.j.excludeTags.size) {
                return 2 /* FilterResult.Include */;
            }
            return (this.j.includeTags.size ?
                element.test.item.tags.some(t => this.j.includeTags.has(t)) :
                true) && element.test.item.tags.every(t => !this.j.excludeTags.has(t))
                ? 2 /* FilterResult.Include */
                : 1 /* FilterResult.Inherit */;
        }
        o(element) {
            if (this.j.isFilteringFor("@failed" /* TestFilterTerm.Failed */)) {
                return (0, testingStates_1.$Psb)(element.state) ? 2 /* FilterResult.Include */ : 1 /* FilterResult.Inherit */;
            }
            if (this.j.isFilteringFor("@executed" /* TestFilterTerm.Executed */)) {
                return element.state !== 0 /* TestResultState.Unset */ ? 2 /* FilterResult.Include */ : 1 /* FilterResult.Inherit */;
            }
            return 2 /* FilterResult.Include */;
        }
        q(element) {
            if (!this.d) {
                return 2 /* FilterResult.Include */;
            }
            if (!this.j.isFilteringFor("@doc" /* TestFilterTerm.CurrentDoc */) || !(element instanceof index_1.$rKb)) {
                return 2 /* FilterResult.Include */;
            }
            if (hasNodeInOrParentOfUri(this.f, this.l, this.d, element.test.item.extId)) {
                return 2 /* FilterResult.Include */;
            }
            return 1 /* FilterResult.Inherit */;
        }
        u(element) {
            if (this.j.globList.length === 0) {
                return 2 /* FilterResult.Include */;
            }
            const fuzzy = this.j.fuzzy.value;
            for (let e = element; e; e = e.parent) {
                // start as included if the first glob is a negation
                let included = this.j.globList[0].include === false ? 2 /* FilterResult.Include */ : 1 /* FilterResult.Inherit */;
                const data = e.test.item.label.toLowerCase();
                for (const { include, text } of this.j.globList) {
                    if (fuzzy ? (0, strings_1.$_e)(data, text) : data.includes(text)) {
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
        __param(1, testExplorerFilterState_1.$EKb),
        __param(2, testService_1.$4sb),
        __param(3, uriIdentity_1.$Ck)
    ], TestsFilter);
    class TreeSorter {
        constructor(d) {
            this.d = d;
        }
        compare(a, b) {
            if (a instanceof index_1.$sKb || b instanceof index_1.$sKb) {
                return (a instanceof index_1.$sKb ? -1 : 0) + (b instanceof index_1.$sKb ? 1 : 0);
            }
            const durationDelta = (b.duration || 0) - (a.duration || 0);
            if (this.d.viewSorting === "duration" /* TestExplorerViewSorting.ByDuration */ && durationDelta !== 0) {
                return durationDelta;
            }
            const stateDelta = (0, testingStates_1.$Ssb)(a.state, b.state);
            if (this.d.viewSorting === "status" /* TestExplorerViewSorting.ByStatus */ && stateDelta !== 0) {
                return stateDelta;
            }
            let inSameLocation = false;
            if (a instanceof index_1.$rKb && b instanceof index_1.$rKb && a.test.item.uri && b.test.item.uri && a.test.item.uri.toString() === b.test.item.uri.toString() && a.test.item.range && b.test.item.range) {
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
    let NoTestsForDocumentWidget = class NoTestsForDocumentWidget extends lifecycle_1.$kc {
        constructor(container, filterState) {
            super();
            const el = this.f = dom.$0O(container, dom.$('.testing-no-test-placeholder'));
            const emptyParagraph = dom.$0O(el, dom.$('p'));
            emptyParagraph.innerText = (0, nls_1.localize)(8, null);
            const buttonLabel = (0, nls_1.localize)(9, null);
            const button = this.B(new button_1.$7Q(el, { title: buttonLabel, ...defaultStyles_1.$i2 }));
            button.label = buttonLabel;
            this.B(button.onDidClick(() => filterState.toggleFilteringFor("@doc" /* TestFilterTerm.CurrentDoc */, false)));
        }
        setVisible(isVisible) {
            this.f.classList.toggle('visible', isVisible);
        }
    };
    NoTestsForDocumentWidget = __decorate([
        __param(1, testExplorerFilterState_1.$EKb)
    ], NoTestsForDocumentWidget);
    class TestExplorerActionRunner extends actions_1.$hi {
        constructor(j) {
            super();
            this.j = j;
        }
        async u(action, context) {
            if (!(action instanceof actions_2.$Vu)) {
                return super.u(action, context);
            }
            const selection = this.j();
            const contextIsSelected = selection.some(s => s === context);
            const actualContext = contextIsSelected ? selection : [context];
            const actionable = actualContext.filter((t) => t instanceof index_1.$rKb);
            await action.run(...actionable);
        }
    }
    const getLabelForTestTreeElement = (element) => {
        let label = (0, constants_1.$Lsb)(element.description || element.test.item.label, element.state);
        if (element instanceof index_1.$rKb) {
            if (element.duration !== undefined) {
                label = (0, nls_1.localize)(10, null, label, formatDuration(element.duration));



            }
            if (element.retired) {
                label = (0, nls_1.localize)(11, null, label);



            }
        }
        return label;
    };
    class ListAccessibilityProvider {
        getWidgetAriaLabel() {
            return (0, nls_1.localize)(12, null);
        }
        getAriaLabel(element) {
            return element instanceof index_1.$sKb
                ? element.description
                : getLabelForTestTreeElement(element);
        }
    }
    class TreeKeyboardNavigationLabelProvider {
        getKeyboardNavigationLabel(element) {
            return element instanceof index_1.$sKb ? element.message : element.test.item.label;
        }
    }
    class ListDelegate {
        getHeight(_element) {
            return 22;
        }
        getTemplateId(element) {
            if (element instanceof index_1.$sKb) {
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
            this.d = instantionService.createInstance(markdownRenderer_1.$K2, {});
        }
        get templateId() {
            return ErrorRenderer_1.ID;
        }
        renderTemplate(container) {
            const label = dom.$0O(container, dom.$('.error'));
            return { label };
        }
        renderElement({ element }, _, data) {
            if (typeof element.message === 'string') {
                data.label.innerText = element.message;
            }
            else {
                const result = this.d.render(element.message, { inline: true });
                data.label.appendChild(result.element);
            }
            data.label.title = element.description;
        }
        disposeTemplate() {
            // noop
        }
    };
    ErrorRenderer = ErrorRenderer_1 = __decorate([
        __param(0, instantiation_1.$Ah)
    ], ErrorRenderer);
    let TestItemRenderer = class TestItemRenderer extends lifecycle_1.$kc {
        static { TestItemRenderer_1 = this; }
        static { this.ID = 'testItem'; }
        constructor(f, j, m, u, w, y, z) {
            super();
            this.f = f;
            this.j = j;
            this.m = m;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            /**
             * @inheritdoc
             */
            this.templateId = TestItemRenderer_1.ID;
        }
        /**
         * @inheritdoc
         */
        renderTemplate(container) {
            const wrapper = dom.$0O(container, dom.$('.test-item'));
            const icon = dom.$0O(wrapper, dom.$('.computed-state'));
            const label = dom.$0O(wrapper, dom.$('.label'));
            const disposable = new lifecycle_1.$jc();
            dom.$0O(wrapper, dom.$(themables_1.ThemeIcon.asCSSSelector(icons.$8Jb)));
            const actionBar = disposable.add(new actionbar_1.$1P(wrapper, {
                actionRunner: this.f,
                actionViewItemProvider: action => action instanceof actions_2.$Vu
                    ? this.y.createInstance(menuEntryActionViewItem_1.$C3, action, undefined)
                    : undefined
            }));
            disposable.add(this.z.onDidChange(changed => {
                const id = templateData.current?.test.item.extId;
                if (id && (!changed || changed === id || testId_1.$PI.isChild(id, changed))) {
                    this.C(templateData.current, templateData);
                }
            }));
            const templateData = { wrapper, label, actionBar, icon, elementDisposable: new lifecycle_1.$jc(), templateDisposable: disposable };
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
        C(element, data) {
            const { actions, contextOverlay } = getActionableElementActions(this.w, this.j, this.m, this.z, this.u, element);
            const crSelf = !!contextOverlay.getContextKeyValue(testingContextKeys_1.TestingContextKeys.isContinuousModeOn.key);
            const crChild = !crSelf && this.z.isEnabledForAChildOf(element.test.item.extId);
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
            this.C(node.element, data);
            data.elementDisposable.add(node.element.onChange(() => this._renderElement(node, data)));
            this._renderElement(node, data);
        }
        _renderElement(node, data) {
            const testHidden = this.m.excluded.contains(node.element.test);
            data.wrapper.classList.toggle('test-is-hidden', testHidden);
            const icon = icons.$eKb.get(node.element.test.expand === 2 /* TestItemExpandState.BusyExpanding */ || node.element.test.item.busy
                ? 2 /* TestResultState.Running */
                : node.element.state);
            data.icon.className = 'computed-state ' + (icon ? themables_1.ThemeIcon.asClassName(icon) : '');
            if (node.element.retired) {
                data.icon.className += ' retired';
            }
            data.label.title = getLabelForTestTreeElement(node.element);
            if (node.element.test.item.label.trim()) {
                dom.$_O(data.label, ...(0, iconLabels_1.$xQ)(node.element.test.item.label));
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
                dom.$0O(data.label, dom.$('span.test-label-description', {}, description));
            }
        }
    };
    TestItemRenderer = TestItemRenderer_1 = __decorate([
        __param(1, actions_2.$Su),
        __param(2, testService_1.$4sb),
        __param(3, testProfileService_1.$9sb),
        __param(4, contextkey_1.$3i),
        __param(5, instantiation_1.$Ah),
        __param(6, testingContinuousRunService_1.$QKb)
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
        const test = element instanceof index_1.$rKb ? element.test : undefined;
        const contextKeys = (0, testItemContextOverlay_1.$fKb)(test, test ? profiles.capabilitiesForTest(test) : 0);
        contextKeys.push(['view', "workbench.view.testing" /* Testing.ExplorerViewId */]);
        if (test) {
            const ctrl = testService.getTestController(test.controllerId);
            const supportsCr = !!ctrl && profiles.getControllerProfiles(ctrl.id).some(p => p.supportsContinuousRun);
            contextKeys.push([
                testingContextKeys_1.TestingContextKeys.canRefreshTests.key,
                !!ctrl?.canRefresh.value && testId_1.$PI.isRoot(test.item.extId),
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
        const menu = menuService.createMenu(actions_2.$Ru.TestItem, contextOverlay);
        try {
            const primary = [];
            const secondary = [];
            const result = { primary, secondary };
            (0, menuEntryActionViewItem_1.$B3)(menu, {
                shouldForwardArgs: true,
            }, result, 'inline');
            return { actions: result, contextOverlay };
        }
        finally {
            menu.dispose();
        }
    };
    (0, themeService_1.$mv)((theme, collector) => {
        if (theme.type === 'dark') {
            const foregroundColor = theme.getColor(colorRegistry_1.$uv);
            if (foregroundColor) {
                const fgWithOpacity = new color_1.$Os(new color_1.$Ls(foregroundColor.rgba.r, foregroundColor.rgba.g, foregroundColor.rgba.b, 0.65));
                collector.addRule(`.test-explorer .test-explorer-messages { color: ${fgWithOpacity}; }`);
            }
        }
    });
});
//# sourceMappingURL=testingExplorerView.js.map