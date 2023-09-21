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
define(["require", "exports", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/editor/browser/services/bulkEditService", "vs/workbench/contrib/bulkEdit/browser/preview/bulkEditPane", "vs/workbench/common/views", "vs/workbench/common/contextkeys", "vs/nls!vs/workbench/contrib/bulkEdit/browser/preview/bulkEdit.contribution", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/contrib/bulkEdit/browser/preview/bulkEditPreview", "vs/platform/list/browser/listService", "vs/platform/instantiation/common/descriptors", "vs/platform/actions/common/actions", "vs/workbench/common/editor", "vs/base/common/cancellation", "vs/platform/dialogs/common/dialogs", "vs/base/common/severity", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/workbench/services/panecomposite/browser/panecomposite"], function (require, exports, platform_1, contributions_1, bulkEditService_1, bulkEditPane_1, views_1, contextkeys_1, nls_1, viewPaneContainer_1, contextkey_1, editorGroupsService_1, bulkEditPreview_1, listService_1, descriptors_1, actions_1, editor_1, cancellation_1, dialogs_1, severity_1, codicons_1, iconRegistry_1, panecomposite_1) {
    "use strict";
    var BulkEditPreviewContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    async function getBulkEditPane(viewsService) {
        const view = await viewsService.openView(bulkEditPane_1.$xMb.ID, true);
        if (view instanceof bulkEditPane_1.$xMb) {
            return view;
        }
        return undefined;
    }
    let UXState = class UXState {
        constructor(b, c) {
            this.b = b;
            this.c = c;
            this.a = b.getActivePaneComposite(1 /* ViewContainerLocation.Panel */)?.getId();
        }
        async restore(panels, editors) {
            // (1) restore previous panel
            if (panels) {
                if (typeof this.a === 'string') {
                    await this.b.openPaneComposite(this.a, 1 /* ViewContainerLocation.Panel */);
                }
                else {
                    this.b.hideActivePaneComposite(1 /* ViewContainerLocation.Panel */);
                }
            }
            // (2) close preview editors
            if (editors) {
                for (const group of this.c.groups) {
                    const previewEditors = [];
                    for (const input of group.editors) {
                        const resource = editor_1.$3E.getCanonicalUri(input, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
                        if (resource?.scheme === bulkEditPreview_1.$kMb.Schema) {
                            previewEditors.push(input);
                        }
                    }
                    if (previewEditors.length) {
                        group.closeEditors(previewEditors, { preserveFocus: true });
                    }
                }
            }
        }
    };
    UXState = __decorate([
        __param(0, panecomposite_1.$Yeb),
        __param(1, editorGroupsService_1.$5C)
    ], UXState);
    class PreviewSession {
        constructor(uxState, cts = new cancellation_1.$pd()) {
            this.uxState = uxState;
            this.cts = cts;
        }
    }
    let BulkEditPreviewContribution = class BulkEditPreviewContribution {
        static { BulkEditPreviewContribution_1 = this; }
        static { this.ctxEnabled = new contextkey_1.$2i('refactorPreview.enabled', false); }
        constructor(c, d, e, f, bulkEditService, contextKeyService) {
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
            bulkEditService.setPreviewHandler(edits => this.g(edits));
            this.a = BulkEditPreviewContribution_1.ctxEnabled.bindTo(contextKeyService);
        }
        async g(edits) {
            this.a.set(true);
            const uxState = this.b?.uxState ?? new UXState(this.c, this.e);
            const view = await getBulkEditPane(this.d);
            if (!view) {
                this.a.set(false);
                return edits;
            }
            // check for active preview session and let the user decide
            if (view.hasInput()) {
                const { confirmed } = await this.f.confirm({
                    type: severity_1.default.Info,
                    message: (0, nls_1.localize)(0, null),
                    detail: (0, nls_1.localize)(1, null),
                    primaryButton: (0, nls_1.localize)(2, null)
                });
                if (!confirmed) {
                    return [];
                }
            }
            // session
            let session;
            if (this.b) {
                await this.b.uxState.restore(false, true);
                this.b.cts.dispose(true);
                session = new PreviewSession(uxState);
            }
            else {
                session = new PreviewSession(uxState);
            }
            this.b = session;
            // the actual work...
            try {
                return await view.setInput(edits, session.cts.token) ?? [];
            }
            finally {
                // restore UX state
                if (this.b === session) {
                    await this.b.uxState.restore(true, true);
                    this.b.cts.dispose();
                    this.a.set(false);
                    this.b = undefined;
                }
            }
        }
    };
    BulkEditPreviewContribution = BulkEditPreviewContribution_1 = __decorate([
        __param(0, panecomposite_1.$Yeb),
        __param(1, views_1.$$E),
        __param(2, editorGroupsService_1.$5C),
        __param(3, dialogs_1.$oA),
        __param(4, bulkEditService_1.$n1),
        __param(5, contextkey_1.$3i)
    ], BulkEditPreviewContribution);
    // CMD: accept
    (0, actions_1.$Xu)(class ApplyAction extends actions_1.$Wu {
        constructor() {
            super({
                id: 'refactorPreview.apply',
                title: { value: (0, nls_1.localize)(3, null), original: 'Apply Refactoring' },
                category: { value: (0, nls_1.localize)(4, null), original: 'Refactor Preview' },
                icon: codicons_1.$Pj.check,
                precondition: contextkey_1.$Ii.and(BulkEditPreviewContribution.ctxEnabled, bulkEditPane_1.$xMb.ctxHasCheckedChanges),
                menu: [{
                        id: actions_1.$Ru.BulkEditContext,
                        order: 1
                    }],
                keybinding: {
                    weight: 100 /* KeybindingWeight.EditorContrib */ - 10,
                    when: contextkey_1.$Ii.and(BulkEditPreviewContribution.ctxEnabled, contextkeys_1.$Hdb.isEqualTo(bulkEditPane_1.$xMb.ID)),
                    primary: 1024 /* KeyMod.Shift */ + 3 /* KeyCode.Enter */,
                }
            });
        }
        async run(accessor) {
            const viewsService = accessor.get(views_1.$$E);
            const view = await getBulkEditPane(viewsService);
            view?.accept();
        }
    });
    // CMD: discard
    (0, actions_1.$Xu)(class DiscardAction extends actions_1.$Wu {
        constructor() {
            super({
                id: 'refactorPreview.discard',
                title: { value: (0, nls_1.localize)(5, null), original: 'Discard Refactoring' },
                category: { value: (0, nls_1.localize)(6, null), original: 'Refactor Preview' },
                icon: codicons_1.$Pj.clearAll,
                precondition: BulkEditPreviewContribution.ctxEnabled,
                menu: [{
                        id: actions_1.$Ru.BulkEditContext,
                        order: 2
                    }]
            });
        }
        async run(accessor) {
            const viewsService = accessor.get(views_1.$$E);
            const view = await getBulkEditPane(viewsService);
            view?.discard();
        }
    });
    // CMD: toggle change
    (0, actions_1.$Xu)(class ToggleAction extends actions_1.$Wu {
        constructor() {
            super({
                id: 'refactorPreview.toggleCheckedState',
                title: { value: (0, nls_1.localize)(7, null), original: 'Toggle Change' },
                category: { value: (0, nls_1.localize)(8, null), original: 'Refactor Preview' },
                precondition: BulkEditPreviewContribution.ctxEnabled,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: listService_1.$e4,
                    primary: 10 /* KeyCode.Space */,
                },
                menu: {
                    id: actions_1.$Ru.BulkEditContext,
                    group: 'navigation'
                }
            });
        }
        async run(accessor) {
            const viewsService = accessor.get(views_1.$$E);
            const view = await getBulkEditPane(viewsService);
            view?.toggleChecked();
        }
    });
    // CMD: toggle category
    (0, actions_1.$Xu)(class GroupByFile extends actions_1.$Wu {
        constructor() {
            super({
                id: 'refactorPreview.groupByFile',
                title: { value: (0, nls_1.localize)(9, null), original: 'Group Changes By File' },
                category: { value: (0, nls_1.localize)(10, null), original: 'Refactor Preview' },
                icon: codicons_1.$Pj.ungroupByRefType,
                precondition: contextkey_1.$Ii.and(bulkEditPane_1.$xMb.ctxHasCategories, bulkEditPane_1.$xMb.ctxGroupByFile.negate(), BulkEditPreviewContribution.ctxEnabled),
                menu: [{
                        id: actions_1.$Ru.BulkEditTitle,
                        when: contextkey_1.$Ii.and(bulkEditPane_1.$xMb.ctxHasCategories, bulkEditPane_1.$xMb.ctxGroupByFile.negate()),
                        group: 'navigation',
                        order: 3,
                    }]
            });
        }
        async run(accessor) {
            const viewsService = accessor.get(views_1.$$E);
            const view = await getBulkEditPane(viewsService);
            view?.groupByFile();
        }
    });
    (0, actions_1.$Xu)(class GroupByType extends actions_1.$Wu {
        constructor() {
            super({
                id: 'refactorPreview.groupByType',
                title: { value: (0, nls_1.localize)(11, null), original: 'Group Changes By Type' },
                category: { value: (0, nls_1.localize)(12, null), original: 'Refactor Preview' },
                icon: codicons_1.$Pj.groupByRefType,
                precondition: contextkey_1.$Ii.and(bulkEditPane_1.$xMb.ctxHasCategories, bulkEditPane_1.$xMb.ctxGroupByFile, BulkEditPreviewContribution.ctxEnabled),
                menu: [{
                        id: actions_1.$Ru.BulkEditTitle,
                        when: contextkey_1.$Ii.and(bulkEditPane_1.$xMb.ctxHasCategories, bulkEditPane_1.$xMb.ctxGroupByFile),
                        group: 'navigation',
                        order: 3
                    }]
            });
        }
        async run(accessor) {
            const viewsService = accessor.get(views_1.$$E);
            const view = await getBulkEditPane(viewsService);
            view?.groupByType();
        }
    });
    (0, actions_1.$Xu)(class ToggleGrouping extends actions_1.$Wu {
        constructor() {
            super({
                id: 'refactorPreview.toggleGrouping',
                title: { value: (0, nls_1.localize)(13, null), original: 'Group Changes By Type' },
                category: { value: (0, nls_1.localize)(14, null), original: 'Refactor Preview' },
                icon: codicons_1.$Pj.listTree,
                toggled: bulkEditPane_1.$xMb.ctxGroupByFile.negate(),
                precondition: contextkey_1.$Ii.and(bulkEditPane_1.$xMb.ctxHasCategories, BulkEditPreviewContribution.ctxEnabled),
                menu: [{
                        id: actions_1.$Ru.BulkEditContext,
                        order: 3
                    }]
            });
        }
        async run(accessor) {
            const viewsService = accessor.get(views_1.$$E);
            const view = await getBulkEditPane(viewsService);
            view?.toggleGrouping();
        }
    });
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(BulkEditPreviewContribution, 2 /* LifecyclePhase.Ready */);
    const refactorPreviewViewIcon = (0, iconRegistry_1.$9u)('refactor-preview-view-icon', codicons_1.$Pj.lightbulb, (0, nls_1.localize)(15, null));
    const container = platform_1.$8m.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: bulkEditPane_1.$xMb.ID,
        title: { value: (0, nls_1.localize)(16, null), original: 'Refactor Preview' },
        hideIfEmpty: true,
        ctorDescriptor: new descriptors_1.$yh(viewPaneContainer_1.$Seb, [bulkEditPane_1.$xMb.ID, { mergeViewWithContainerWhenSingleView: true }]),
        icon: refactorPreviewViewIcon,
        storageId: bulkEditPane_1.$xMb.ID
    }, 1 /* ViewContainerLocation.Panel */);
    platform_1.$8m.as(views_1.Extensions.ViewsRegistry).registerViews([{
            id: bulkEditPane_1.$xMb.ID,
            name: (0, nls_1.localize)(17, null),
            when: BulkEditPreviewContribution.ctxEnabled,
            ctorDescriptor: new descriptors_1.$yh(bulkEditPane_1.$xMb),
            containerIcon: refactorPreviewViewIcon,
        }], container);
});
//# sourceMappingURL=bulkEdit.contribution.js.map