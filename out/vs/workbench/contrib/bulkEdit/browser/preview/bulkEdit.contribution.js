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
define(["require", "exports", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/editor/browser/services/bulkEditService", "vs/workbench/contrib/bulkEdit/browser/preview/bulkEditPane", "vs/workbench/common/views", "vs/workbench/common/contextkeys", "vs/nls", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/contrib/bulkEdit/browser/preview/bulkEditPreview", "vs/platform/list/browser/listService", "vs/platform/instantiation/common/descriptors", "vs/platform/actions/common/actions", "vs/workbench/common/editor", "vs/base/common/cancellation", "vs/platform/dialogs/common/dialogs", "vs/base/common/severity", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/workbench/services/panecomposite/browser/panecomposite"], function (require, exports, platform_1, contributions_1, bulkEditService_1, bulkEditPane_1, views_1, contextkeys_1, nls_1, viewPaneContainer_1, contextkey_1, editorGroupsService_1, bulkEditPreview_1, listService_1, descriptors_1, actions_1, editor_1, cancellation_1, dialogs_1, severity_1, codicons_1, iconRegistry_1, panecomposite_1) {
    "use strict";
    var BulkEditPreviewContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    async function getBulkEditPane(viewsService) {
        const view = await viewsService.openView(bulkEditPane_1.BulkEditPane.ID, true);
        if (view instanceof bulkEditPane_1.BulkEditPane) {
            return view;
        }
        return undefined;
    }
    let UXState = class UXState {
        constructor(_paneCompositeService, _editorGroupsService) {
            this._paneCompositeService = _paneCompositeService;
            this._editorGroupsService = _editorGroupsService;
            this._activePanel = _paneCompositeService.getActivePaneComposite(1 /* ViewContainerLocation.Panel */)?.getId();
        }
        async restore(panels, editors) {
            // (1) restore previous panel
            if (panels) {
                if (typeof this._activePanel === 'string') {
                    await this._paneCompositeService.openPaneComposite(this._activePanel, 1 /* ViewContainerLocation.Panel */);
                }
                else {
                    this._paneCompositeService.hideActivePaneComposite(1 /* ViewContainerLocation.Panel */);
                }
            }
            // (2) close preview editors
            if (editors) {
                for (const group of this._editorGroupsService.groups) {
                    const previewEditors = [];
                    for (const input of group.editors) {
                        const resource = editor_1.EditorResourceAccessor.getCanonicalUri(input, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
                        if (resource?.scheme === bulkEditPreview_1.BulkEditPreviewProvider.Schema) {
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
        __param(0, panecomposite_1.IPaneCompositePartService),
        __param(1, editorGroupsService_1.IEditorGroupsService)
    ], UXState);
    class PreviewSession {
        constructor(uxState, cts = new cancellation_1.CancellationTokenSource()) {
            this.uxState = uxState;
            this.cts = cts;
        }
    }
    let BulkEditPreviewContribution = class BulkEditPreviewContribution {
        static { BulkEditPreviewContribution_1 = this; }
        static { this.ctxEnabled = new contextkey_1.RawContextKey('refactorPreview.enabled', false); }
        constructor(_paneCompositeService, _viewsService, _editorGroupsService, _dialogService, bulkEditService, contextKeyService) {
            this._paneCompositeService = _paneCompositeService;
            this._viewsService = _viewsService;
            this._editorGroupsService = _editorGroupsService;
            this._dialogService = _dialogService;
            bulkEditService.setPreviewHandler(edits => this._previewEdit(edits));
            this._ctxEnabled = BulkEditPreviewContribution_1.ctxEnabled.bindTo(contextKeyService);
        }
        async _previewEdit(edits) {
            this._ctxEnabled.set(true);
            const uxState = this._activeSession?.uxState ?? new UXState(this._paneCompositeService, this._editorGroupsService);
            const view = await getBulkEditPane(this._viewsService);
            if (!view) {
                this._ctxEnabled.set(false);
                return edits;
            }
            // check for active preview session and let the user decide
            if (view.hasInput()) {
                const { confirmed } = await this._dialogService.confirm({
                    type: severity_1.default.Info,
                    message: (0, nls_1.localize)('overlap', "Another refactoring is being previewed."),
                    detail: (0, nls_1.localize)('detail', "Press 'Continue' to discard the previous refactoring and continue with the current refactoring."),
                    primaryButton: (0, nls_1.localize)({ key: 'continue', comment: ['&& denotes a mnemonic'] }, "&&Continue")
                });
                if (!confirmed) {
                    return [];
                }
            }
            // session
            let session;
            if (this._activeSession) {
                await this._activeSession.uxState.restore(false, true);
                this._activeSession.cts.dispose(true);
                session = new PreviewSession(uxState);
            }
            else {
                session = new PreviewSession(uxState);
            }
            this._activeSession = session;
            // the actual work...
            try {
                return await view.setInput(edits, session.cts.token) ?? [];
            }
            finally {
                // restore UX state
                if (this._activeSession === session) {
                    await this._activeSession.uxState.restore(true, true);
                    this._activeSession.cts.dispose();
                    this._ctxEnabled.set(false);
                    this._activeSession = undefined;
                }
            }
        }
    };
    BulkEditPreviewContribution = BulkEditPreviewContribution_1 = __decorate([
        __param(0, panecomposite_1.IPaneCompositePartService),
        __param(1, views_1.IViewsService),
        __param(2, editorGroupsService_1.IEditorGroupsService),
        __param(3, dialogs_1.IDialogService),
        __param(4, bulkEditService_1.IBulkEditService),
        __param(5, contextkey_1.IContextKeyService)
    ], BulkEditPreviewContribution);
    // CMD: accept
    (0, actions_1.registerAction2)(class ApplyAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'refactorPreview.apply',
                title: { value: (0, nls_1.localize)('apply', "Apply Refactoring"), original: 'Apply Refactoring' },
                category: { value: (0, nls_1.localize)('cat', "Refactor Preview"), original: 'Refactor Preview' },
                icon: codicons_1.Codicon.check,
                precondition: contextkey_1.ContextKeyExpr.and(BulkEditPreviewContribution.ctxEnabled, bulkEditPane_1.BulkEditPane.ctxHasCheckedChanges),
                menu: [{
                        id: actions_1.MenuId.BulkEditContext,
                        order: 1
                    }],
                keybinding: {
                    weight: 100 /* KeybindingWeight.EditorContrib */ - 10,
                    when: contextkey_1.ContextKeyExpr.and(BulkEditPreviewContribution.ctxEnabled, contextkeys_1.FocusedViewContext.isEqualTo(bulkEditPane_1.BulkEditPane.ID)),
                    primary: 1024 /* KeyMod.Shift */ + 3 /* KeyCode.Enter */,
                }
            });
        }
        async run(accessor) {
            const viewsService = accessor.get(views_1.IViewsService);
            const view = await getBulkEditPane(viewsService);
            view?.accept();
        }
    });
    // CMD: discard
    (0, actions_1.registerAction2)(class DiscardAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'refactorPreview.discard',
                title: { value: (0, nls_1.localize)('Discard', "Discard Refactoring"), original: 'Discard Refactoring' },
                category: { value: (0, nls_1.localize)('cat', "Refactor Preview"), original: 'Refactor Preview' },
                icon: codicons_1.Codicon.clearAll,
                precondition: BulkEditPreviewContribution.ctxEnabled,
                menu: [{
                        id: actions_1.MenuId.BulkEditContext,
                        order: 2
                    }]
            });
        }
        async run(accessor) {
            const viewsService = accessor.get(views_1.IViewsService);
            const view = await getBulkEditPane(viewsService);
            view?.discard();
        }
    });
    // CMD: toggle change
    (0, actions_1.registerAction2)(class ToggleAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'refactorPreview.toggleCheckedState',
                title: { value: (0, nls_1.localize)('toogleSelection', "Toggle Change"), original: 'Toggle Change' },
                category: { value: (0, nls_1.localize)('cat', "Refactor Preview"), original: 'Refactor Preview' },
                precondition: BulkEditPreviewContribution.ctxEnabled,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: listService_1.WorkbenchListFocusContextKey,
                    primary: 10 /* KeyCode.Space */,
                },
                menu: {
                    id: actions_1.MenuId.BulkEditContext,
                    group: 'navigation'
                }
            });
        }
        async run(accessor) {
            const viewsService = accessor.get(views_1.IViewsService);
            const view = await getBulkEditPane(viewsService);
            view?.toggleChecked();
        }
    });
    // CMD: toggle category
    (0, actions_1.registerAction2)(class GroupByFile extends actions_1.Action2 {
        constructor() {
            super({
                id: 'refactorPreview.groupByFile',
                title: { value: (0, nls_1.localize)('groupByFile', "Group Changes By File"), original: 'Group Changes By File' },
                category: { value: (0, nls_1.localize)('cat', "Refactor Preview"), original: 'Refactor Preview' },
                icon: codicons_1.Codicon.ungroupByRefType,
                precondition: contextkey_1.ContextKeyExpr.and(bulkEditPane_1.BulkEditPane.ctxHasCategories, bulkEditPane_1.BulkEditPane.ctxGroupByFile.negate(), BulkEditPreviewContribution.ctxEnabled),
                menu: [{
                        id: actions_1.MenuId.BulkEditTitle,
                        when: contextkey_1.ContextKeyExpr.and(bulkEditPane_1.BulkEditPane.ctxHasCategories, bulkEditPane_1.BulkEditPane.ctxGroupByFile.negate()),
                        group: 'navigation',
                        order: 3,
                    }]
            });
        }
        async run(accessor) {
            const viewsService = accessor.get(views_1.IViewsService);
            const view = await getBulkEditPane(viewsService);
            view?.groupByFile();
        }
    });
    (0, actions_1.registerAction2)(class GroupByType extends actions_1.Action2 {
        constructor() {
            super({
                id: 'refactorPreview.groupByType',
                title: { value: (0, nls_1.localize)('groupByType', "Group Changes By Type"), original: 'Group Changes By Type' },
                category: { value: (0, nls_1.localize)('cat', "Refactor Preview"), original: 'Refactor Preview' },
                icon: codicons_1.Codicon.groupByRefType,
                precondition: contextkey_1.ContextKeyExpr.and(bulkEditPane_1.BulkEditPane.ctxHasCategories, bulkEditPane_1.BulkEditPane.ctxGroupByFile, BulkEditPreviewContribution.ctxEnabled),
                menu: [{
                        id: actions_1.MenuId.BulkEditTitle,
                        when: contextkey_1.ContextKeyExpr.and(bulkEditPane_1.BulkEditPane.ctxHasCategories, bulkEditPane_1.BulkEditPane.ctxGroupByFile),
                        group: 'navigation',
                        order: 3
                    }]
            });
        }
        async run(accessor) {
            const viewsService = accessor.get(views_1.IViewsService);
            const view = await getBulkEditPane(viewsService);
            view?.groupByType();
        }
    });
    (0, actions_1.registerAction2)(class ToggleGrouping extends actions_1.Action2 {
        constructor() {
            super({
                id: 'refactorPreview.toggleGrouping',
                title: { value: (0, nls_1.localize)('groupByType', "Group Changes By Type"), original: 'Group Changes By Type' },
                category: { value: (0, nls_1.localize)('cat', "Refactor Preview"), original: 'Refactor Preview' },
                icon: codicons_1.Codicon.listTree,
                toggled: bulkEditPane_1.BulkEditPane.ctxGroupByFile.negate(),
                precondition: contextkey_1.ContextKeyExpr.and(bulkEditPane_1.BulkEditPane.ctxHasCategories, BulkEditPreviewContribution.ctxEnabled),
                menu: [{
                        id: actions_1.MenuId.BulkEditContext,
                        order: 3
                    }]
            });
        }
        async run(accessor) {
            const viewsService = accessor.get(views_1.IViewsService);
            const view = await getBulkEditPane(viewsService);
            view?.toggleGrouping();
        }
    });
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(BulkEditPreviewContribution, 2 /* LifecyclePhase.Ready */);
    const refactorPreviewViewIcon = (0, iconRegistry_1.registerIcon)('refactor-preview-view-icon', codicons_1.Codicon.lightbulb, (0, nls_1.localize)('refactorPreviewViewIcon', 'View icon of the refactor preview view.'));
    const container = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: bulkEditPane_1.BulkEditPane.ID,
        title: { value: (0, nls_1.localize)('panel', "Refactor Preview"), original: 'Refactor Preview' },
        hideIfEmpty: true,
        ctorDescriptor: new descriptors_1.SyncDescriptor(viewPaneContainer_1.ViewPaneContainer, [bulkEditPane_1.BulkEditPane.ID, { mergeViewWithContainerWhenSingleView: true }]),
        icon: refactorPreviewViewIcon,
        storageId: bulkEditPane_1.BulkEditPane.ID
    }, 1 /* ViewContainerLocation.Panel */);
    platform_1.Registry.as(views_1.Extensions.ViewsRegistry).registerViews([{
            id: bulkEditPane_1.BulkEditPane.ID,
            name: (0, nls_1.localize)('panel', "Refactor Preview"),
            when: BulkEditPreviewContribution.ctxEnabled,
            ctorDescriptor: new descriptors_1.SyncDescriptor(bulkEditPane_1.BulkEditPane),
            containerIcon: refactorPreviewViewIcon,
        }], container);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVsa0VkaXQuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvYnVsa0VkaXQvYnJvd3Nlci9wcmV2aWV3L2J1bGtFZGl0LmNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUE2QmhHLEtBQUssVUFBVSxlQUFlLENBQUMsWUFBMkI7UUFDekQsTUFBTSxJQUFJLEdBQUcsTUFBTSxZQUFZLENBQUMsUUFBUSxDQUFDLDJCQUFZLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2hFLElBQUksSUFBSSxZQUFZLDJCQUFZLEVBQUU7WUFDakMsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUNELE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUFFRCxJQUFNLE9BQU8sR0FBYixNQUFNLE9BQU87UUFJWixZQUM2QyxxQkFBZ0QsRUFDckQsb0JBQTBDO1lBRHJDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBMkI7WUFDckQseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtZQUVqRixJQUFJLENBQUMsWUFBWSxHQUFHLHFCQUFxQixDQUFDLHNCQUFzQixxQ0FBNkIsRUFBRSxLQUFLLEVBQUUsQ0FBQztRQUN4RyxDQUFDO1FBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFlLEVBQUUsT0FBZ0I7WUFFOUMsNkJBQTZCO1lBQzdCLElBQUksTUFBTSxFQUFFO2dCQUNYLElBQUksT0FBTyxJQUFJLENBQUMsWUFBWSxLQUFLLFFBQVEsRUFBRTtvQkFDMUMsTUFBTSxJQUFJLENBQUMscUJBQXFCLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFlBQVksc0NBQThCLENBQUM7aUJBQ25HO3FCQUFNO29CQUNOLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyx1QkFBdUIscUNBQTZCLENBQUM7aUJBQ2hGO2FBQ0Q7WUFFRCw0QkFBNEI7WUFDNUIsSUFBSSxPQUFPLEVBQUU7Z0JBQ1osS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxFQUFFO29CQUNyRCxNQUFNLGNBQWMsR0FBa0IsRUFBRSxDQUFDO29CQUN6QyxLQUFLLE1BQU0sS0FBSyxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUU7d0JBRWxDLE1BQU0sUUFBUSxHQUFHLCtCQUFzQixDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSx5QkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO3dCQUNoSCxJQUFJLFFBQVEsRUFBRSxNQUFNLEtBQUsseUNBQXVCLENBQUMsTUFBTSxFQUFFOzRCQUN4RCxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO3lCQUMzQjtxQkFDRDtvQkFFRCxJQUFJLGNBQWMsQ0FBQyxNQUFNLEVBQUU7d0JBQzFCLEtBQUssQ0FBQyxZQUFZLENBQUMsY0FBYyxFQUFFLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7cUJBQzVEO2lCQUNEO2FBQ0Q7UUFDRixDQUFDO0tBQ0QsQ0FBQTtJQXhDSyxPQUFPO1FBS1YsV0FBQSx5Q0FBeUIsQ0FBQTtRQUN6QixXQUFBLDBDQUFvQixDQUFBO09BTmpCLE9BQU8sQ0F3Q1o7SUFFRCxNQUFNLGNBQWM7UUFDbkIsWUFDVSxPQUFnQixFQUNoQixNQUErQixJQUFJLHNDQUF1QixFQUFFO1lBRDVELFlBQU8sR0FBUCxPQUFPLENBQVM7WUFDaEIsUUFBRyxHQUFILEdBQUcsQ0FBeUQ7UUFDbEUsQ0FBQztLQUNMO0lBRUQsSUFBTSwyQkFBMkIsR0FBakMsTUFBTSwyQkFBMkI7O2lCQUVoQixlQUFVLEdBQUcsSUFBSSwwQkFBYSxDQUFDLHlCQUF5QixFQUFFLEtBQUssQ0FBQyxBQUF0RCxDQUF1RDtRQU1qRixZQUM2QyxxQkFBZ0QsRUFDNUQsYUFBNEIsRUFDckIsb0JBQTBDLEVBQ2hELGNBQThCLEVBQzdDLGVBQWlDLEVBQy9CLGlCQUFxQztZQUxiLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBMkI7WUFDNUQsa0JBQWEsR0FBYixhQUFhLENBQWU7WUFDckIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtZQUNoRCxtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7WUFJL0QsZUFBZSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ3JFLElBQUksQ0FBQyxXQUFXLEdBQUcsNkJBQTJCLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3JGLENBQUM7UUFFTyxLQUFLLENBQUMsWUFBWSxDQUFDLEtBQXFCO1lBQy9DLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTNCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsT0FBTyxJQUFJLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUNuSCxNQUFNLElBQUksR0FBRyxNQUFNLGVBQWUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDdkQsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDVixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDNUIsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELDJEQUEyRDtZQUMzRCxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDcEIsTUFBTSxFQUFFLFNBQVMsRUFBRSxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUM7b0JBQ3ZELElBQUksRUFBRSxrQkFBUSxDQUFDLElBQUk7b0JBQ25CLE9BQU8sRUFBRSxJQUFBLGNBQVEsRUFBQyxTQUFTLEVBQUUseUNBQXlDLENBQUM7b0JBQ3ZFLE1BQU0sRUFBRSxJQUFBLGNBQVEsRUFBQyxRQUFRLEVBQUUsaUdBQWlHLENBQUM7b0JBQzdILGFBQWEsRUFBRSxJQUFBLGNBQVEsRUFBQyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLFlBQVksQ0FBQztpQkFDOUYsQ0FBQyxDQUFDO2dCQUVILElBQUksQ0FBQyxTQUFTLEVBQUU7b0JBQ2YsT0FBTyxFQUFFLENBQUM7aUJBQ1Y7YUFDRDtZQUVELFVBQVU7WUFDVixJQUFJLE9BQXVCLENBQUM7WUFDNUIsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO2dCQUN4QixNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3ZELElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDdEMsT0FBTyxHQUFHLElBQUksY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ3RDO2lCQUFNO2dCQUNOLE9BQU8sR0FBRyxJQUFJLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUN0QztZQUNELElBQUksQ0FBQyxjQUFjLEdBQUcsT0FBTyxDQUFDO1lBRTlCLHFCQUFxQjtZQUNyQixJQUFJO2dCQUVILE9BQU8sTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQzthQUUzRDtvQkFBUztnQkFDVCxtQkFBbUI7Z0JBQ25CLElBQUksSUFBSSxDQUFDLGNBQWMsS0FBSyxPQUFPLEVBQUU7b0JBQ3BDLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDdEQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ2xDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUM1QixJQUFJLENBQUMsY0FBYyxHQUFHLFNBQVMsQ0FBQztpQkFDaEM7YUFDRDtRQUNGLENBQUM7O0lBckVJLDJCQUEyQjtRQVM5QixXQUFBLHlDQUF5QixDQUFBO1FBQ3pCLFdBQUEscUJBQWEsQ0FBQTtRQUNiLFdBQUEsMENBQW9CLENBQUE7UUFDcEIsV0FBQSx3QkFBYyxDQUFBO1FBQ2QsV0FBQSxrQ0FBZ0IsQ0FBQTtRQUNoQixXQUFBLCtCQUFrQixDQUFBO09BZGYsMkJBQTJCLENBc0VoQztJQUdELGNBQWM7SUFDZCxJQUFBLHlCQUFlLEVBQUMsTUFBTSxXQUFZLFNBQVEsaUJBQU87UUFFaEQ7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLHVCQUF1QjtnQkFDM0IsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLE9BQU8sRUFBRSxtQkFBbUIsQ0FBQyxFQUFFLFFBQVEsRUFBRSxtQkFBbUIsRUFBRTtnQkFDdkYsUUFBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLEtBQUssRUFBRSxrQkFBa0IsQ0FBQyxFQUFFLFFBQVEsRUFBRSxrQkFBa0IsRUFBRTtnQkFDdEYsSUFBSSxFQUFFLGtCQUFPLENBQUMsS0FBSztnQkFDbkIsWUFBWSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLFVBQVUsRUFBRSwyQkFBWSxDQUFDLG9CQUFvQixDQUFDO2dCQUMzRyxJQUFJLEVBQUUsQ0FBQzt3QkFDTixFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxlQUFlO3dCQUMxQixLQUFLLEVBQUUsQ0FBQztxQkFDUixDQUFDO2dCQUNGLFVBQVUsRUFBRTtvQkFDWCxNQUFNLEVBQUUsMkNBQWlDLEVBQUU7b0JBQzNDLElBQUksRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxVQUFVLEVBQUUsZ0NBQWtCLENBQUMsU0FBUyxDQUFDLDJCQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQy9HLE9BQU8sRUFBRSwrQ0FBNEI7aUJBQ3JDO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEI7WUFDbkMsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQkFBYSxDQUFDLENBQUM7WUFDakQsTUFBTSxJQUFJLEdBQUcsTUFBTSxlQUFlLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDakQsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDO1FBQ2hCLENBQUM7S0FDRCxDQUFDLENBQUM7SUFFSCxlQUFlO0lBQ2YsSUFBQSx5QkFBZSxFQUFDLE1BQU0sYUFBYyxTQUFRLGlCQUFPO1FBRWxEO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSx5QkFBeUI7Z0JBQzdCLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxTQUFTLEVBQUUscUJBQXFCLENBQUMsRUFBRSxRQUFRLEVBQUUscUJBQXFCLEVBQUU7Z0JBQzdGLFFBQVEsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxLQUFLLEVBQUUsa0JBQWtCLENBQUMsRUFBRSxRQUFRLEVBQUUsa0JBQWtCLEVBQUU7Z0JBQ3RGLElBQUksRUFBRSxrQkFBTyxDQUFDLFFBQVE7Z0JBQ3RCLFlBQVksRUFBRSwyQkFBMkIsQ0FBQyxVQUFVO2dCQUNwRCxJQUFJLEVBQUUsQ0FBQzt3QkFDTixFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxlQUFlO3dCQUMxQixLQUFLLEVBQUUsQ0FBQztxQkFDUixDQUFDO2FBQ0YsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEI7WUFDbkMsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQkFBYSxDQUFDLENBQUM7WUFDakQsTUFBTSxJQUFJLEdBQUcsTUFBTSxlQUFlLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDakQsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUM7S0FDRCxDQUFDLENBQUM7SUFHSCxxQkFBcUI7SUFDckIsSUFBQSx5QkFBZSxFQUFDLE1BQU0sWUFBYSxTQUFRLGlCQUFPO1FBRWpEO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxvQ0FBb0M7Z0JBQ3hDLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxpQkFBaUIsRUFBRSxlQUFlLENBQUMsRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFO2dCQUN6RixRQUFRLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsS0FBSyxFQUFFLGtCQUFrQixDQUFDLEVBQUUsUUFBUSxFQUFFLGtCQUFrQixFQUFFO2dCQUN0RixZQUFZLEVBQUUsMkJBQTJCLENBQUMsVUFBVTtnQkFDcEQsVUFBVSxFQUFFO29CQUNYLE1BQU0sNkNBQW1DO29CQUN6QyxJQUFJLEVBQUUsMENBQTRCO29CQUNsQyxPQUFPLHdCQUFlO2lCQUN0QjtnQkFDRCxJQUFJLEVBQUU7b0JBQ0wsRUFBRSxFQUFFLGdCQUFNLENBQUMsZUFBZTtvQkFDMUIsS0FBSyxFQUFFLFlBQVk7aUJBQ25CO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEI7WUFDbkMsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQkFBYSxDQUFDLENBQUM7WUFDakQsTUFBTSxJQUFJLEdBQUcsTUFBTSxlQUFlLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDakQsSUFBSSxFQUFFLGFBQWEsRUFBRSxDQUFDO1FBQ3ZCLENBQUM7S0FDRCxDQUFDLENBQUM7SUFHSCx1QkFBdUI7SUFDdkIsSUFBQSx5QkFBZSxFQUFDLE1BQU0sV0FBWSxTQUFRLGlCQUFPO1FBRWhEO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSw2QkFBNkI7Z0JBQ2pDLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxhQUFhLEVBQUUsdUJBQXVCLENBQUMsRUFBRSxRQUFRLEVBQUUsdUJBQXVCLEVBQUU7Z0JBQ3JHLFFBQVEsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxLQUFLLEVBQUUsa0JBQWtCLENBQUMsRUFBRSxRQUFRLEVBQUUsa0JBQWtCLEVBQUU7Z0JBQ3RGLElBQUksRUFBRSxrQkFBTyxDQUFDLGdCQUFnQjtnQkFDOUIsWUFBWSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLDJCQUFZLENBQUMsZ0JBQWdCLEVBQUUsMkJBQVksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLEVBQUUsMkJBQTJCLENBQUMsVUFBVSxDQUFDO2dCQUM3SSxJQUFJLEVBQUUsQ0FBQzt3QkFDTixFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxhQUFhO3dCQUN4QixJQUFJLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQUMsMkJBQVksQ0FBQyxnQkFBZ0IsRUFBRSwyQkFBWSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQzt3QkFDN0YsS0FBSyxFQUFFLFlBQVk7d0JBQ25CLEtBQUssRUFBRSxDQUFDO3FCQUNSLENBQUM7YUFDRixDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQjtZQUNuQyxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFCQUFhLENBQUMsQ0FBQztZQUNqRCxNQUFNLElBQUksR0FBRyxNQUFNLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNqRCxJQUFJLEVBQUUsV0FBVyxFQUFFLENBQUM7UUFDckIsQ0FBQztLQUNELENBQUMsQ0FBQztJQUVILElBQUEseUJBQWUsRUFBQyxNQUFNLFdBQVksU0FBUSxpQkFBTztRQUVoRDtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsNkJBQTZCO2dCQUNqQyxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsYUFBYSxFQUFFLHVCQUF1QixDQUFDLEVBQUUsUUFBUSxFQUFFLHVCQUF1QixFQUFFO2dCQUNyRyxRQUFRLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsS0FBSyxFQUFFLGtCQUFrQixDQUFDLEVBQUUsUUFBUSxFQUFFLGtCQUFrQixFQUFFO2dCQUN0RixJQUFJLEVBQUUsa0JBQU8sQ0FBQyxjQUFjO2dCQUM1QixZQUFZLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQUMsMkJBQVksQ0FBQyxnQkFBZ0IsRUFBRSwyQkFBWSxDQUFDLGNBQWMsRUFBRSwyQkFBMkIsQ0FBQyxVQUFVLENBQUM7Z0JBQ3BJLElBQUksRUFBRSxDQUFDO3dCQUNOLEVBQUUsRUFBRSxnQkFBTSxDQUFDLGFBQWE7d0JBQ3hCLElBQUksRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FBQywyQkFBWSxDQUFDLGdCQUFnQixFQUFFLDJCQUFZLENBQUMsY0FBYyxDQUFDO3dCQUNwRixLQUFLLEVBQUUsWUFBWTt3QkFDbkIsS0FBSyxFQUFFLENBQUM7cUJBQ1IsQ0FBQzthQUNGLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQTBCO1lBQ25DLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMscUJBQWEsQ0FBQyxDQUFDO1lBQ2pELE1BQU0sSUFBSSxHQUFHLE1BQU0sZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ2pELElBQUksRUFBRSxXQUFXLEVBQUUsQ0FBQztRQUNyQixDQUFDO0tBQ0QsQ0FBQyxDQUFDO0lBRUgsSUFBQSx5QkFBZSxFQUFDLE1BQU0sY0FBZSxTQUFRLGlCQUFPO1FBRW5EO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxnQ0FBZ0M7Z0JBQ3BDLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxhQUFhLEVBQUUsdUJBQXVCLENBQUMsRUFBRSxRQUFRLEVBQUUsdUJBQXVCLEVBQUU7Z0JBQ3JHLFFBQVEsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxLQUFLLEVBQUUsa0JBQWtCLENBQUMsRUFBRSxRQUFRLEVBQUUsa0JBQWtCLEVBQUU7Z0JBQ3RGLElBQUksRUFBRSxrQkFBTyxDQUFDLFFBQVE7Z0JBQ3RCLE9BQU8sRUFBRSwyQkFBWSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUU7Z0JBQzdDLFlBQVksRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FBQywyQkFBWSxDQUFDLGdCQUFnQixFQUFFLDJCQUEyQixDQUFDLFVBQVUsQ0FBQztnQkFDdkcsSUFBSSxFQUFFLENBQUM7d0JBQ04sRUFBRSxFQUFFLGdCQUFNLENBQUMsZUFBZTt3QkFDMUIsS0FBSyxFQUFFLENBQUM7cUJBQ1IsQ0FBQzthQUNGLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQTBCO1lBQ25DLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMscUJBQWEsQ0FBQyxDQUFDO1lBQ2pELE1BQU0sSUFBSSxHQUFHLE1BQU0sZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ2pELElBQUksRUFBRSxjQUFjLEVBQUUsQ0FBQztRQUN4QixDQUFDO0tBQ0QsQ0FBQyxDQUFDO0lBRUgsbUJBQVEsQ0FBQyxFQUFFLENBQWtDLDBCQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDLDZCQUE2QixDQUN4RywyQkFBMkIsK0JBQzNCLENBQUM7SUFFRixNQUFNLHVCQUF1QixHQUFHLElBQUEsMkJBQVksRUFBQyw0QkFBNEIsRUFBRSxrQkFBTyxDQUFDLFNBQVMsRUFBRSxJQUFBLGNBQVEsRUFBQyx5QkFBeUIsRUFBRSx5Q0FBeUMsQ0FBQyxDQUFDLENBQUM7SUFFOUssTUFBTSxTQUFTLEdBQUcsbUJBQVEsQ0FBQyxFQUFFLENBQTBCLGtCQUF1QixDQUFDLHNCQUFzQixDQUFDLENBQUMscUJBQXFCLENBQUM7UUFDNUgsRUFBRSxFQUFFLDJCQUFZLENBQUMsRUFBRTtRQUNuQixLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsT0FBTyxFQUFFLGtCQUFrQixDQUFDLEVBQUUsUUFBUSxFQUFFLGtCQUFrQixFQUFFO1FBQ3JGLFdBQVcsRUFBRSxJQUFJO1FBQ2pCLGNBQWMsRUFBRSxJQUFJLDRCQUFjLENBQ2pDLHFDQUFpQixFQUNqQixDQUFDLDJCQUFZLENBQUMsRUFBRSxFQUFFLEVBQUUsb0NBQW9DLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FDakU7UUFDRCxJQUFJLEVBQUUsdUJBQXVCO1FBQzdCLFNBQVMsRUFBRSwyQkFBWSxDQUFDLEVBQUU7S0FDMUIsc0NBQThCLENBQUM7SUFFaEMsbUJBQVEsQ0FBQyxFQUFFLENBQWlCLGtCQUF1QixDQUFDLGFBQWEsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ2pGLEVBQUUsRUFBRSwyQkFBWSxDQUFDLEVBQUU7WUFDbkIsSUFBSSxFQUFFLElBQUEsY0FBUSxFQUFDLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQztZQUMzQyxJQUFJLEVBQUUsMkJBQTJCLENBQUMsVUFBVTtZQUM1QyxjQUFjLEVBQUUsSUFBSSw0QkFBYyxDQUFDLDJCQUFZLENBQUM7WUFDaEQsYUFBYSxFQUFFLHVCQUF1QjtTQUN0QyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMifQ==