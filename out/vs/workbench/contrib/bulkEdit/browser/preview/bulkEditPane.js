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
define(["require", "exports", "vs/platform/list/browser/listService", "vs/workbench/contrib/bulkEdit/browser/preview/bulkEditTree", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/nls", "vs/base/common/lifecycle", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/bulkEdit/browser/preview/bulkEditPreview", "vs/platform/label/common/label", "vs/editor/common/services/resolverService", "vs/workbench/browser/parts/views/viewPane", "vs/platform/keybinding/common/keybinding", "vs/platform/contextview/browser/contextView", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/workbench/browser/labels", "vs/platform/dialogs/common/dialogs", "vs/base/common/resources", "vs/platform/actions/common/actions", "vs/platform/storage/common/storage", "vs/workbench/common/views", "vs/platform/opener/common/opener", "vs/platform/telemetry/common/telemetry", "vs/base/browser/ui/button/button", "vs/platform/theme/browser/defaultStyles", "vs/css!./bulkEdit"], function (require, exports, listService_1, bulkEditTree_1, instantiation_1, themeService_1, nls_1, lifecycle_1, editorService_1, bulkEditPreview_1, label_1, resolverService_1, viewPane_1, keybinding_1, contextView_1, configuration_1, contextkey_1, labels_1, dialogs_1, resources_1, actions_1, storage_1, views_1, opener_1, telemetry_1, button_1, defaultStyles_1) {
    "use strict";
    var BulkEditPane_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BulkEditPane = void 0;
    var State;
    (function (State) {
        State["Data"] = "data";
        State["Message"] = "message";
    })(State || (State = {}));
    let BulkEditPane = class BulkEditPane extends viewPane_1.ViewPane {
        static { BulkEditPane_1 = this; }
        static { this.ID = 'refactorPreview'; }
        static { this.ctxHasCategories = new contextkey_1.RawContextKey('refactorPreview.hasCategories', false); }
        static { this.ctxGroupByFile = new contextkey_1.RawContextKey('refactorPreview.groupByFile', true); }
        static { this.ctxHasCheckedChanges = new contextkey_1.RawContextKey('refactorPreview.hasCheckedChanges', true); }
        static { this._memGroupByFile = `${BulkEditPane_1.ID}.groupByFile`; }
        constructor(options, _instaService, _editorService, _labelService, _textModelService, _dialogService, _contextMenuService, _storageService, contextKeyService, viewDescriptorService, keybindingService, contextMenuService, configurationService, openerService, themeService, telemetryService) {
            super({ ...options, titleMenuId: actions_1.MenuId.BulkEditTitle }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, _instaService, openerService, themeService, telemetryService);
            this._instaService = _instaService;
            this._editorService = _editorService;
            this._labelService = _labelService;
            this._textModelService = _textModelService;
            this._dialogService = _dialogService;
            this._contextMenuService = _contextMenuService;
            this._storageService = _storageService;
            this._treeViewStates = new Map();
            this._disposables = new lifecycle_1.DisposableStore();
            this._sessionDisposables = new lifecycle_1.DisposableStore();
            this.element.classList.add('bulk-edit-panel', 'show-file-icons');
            this._ctxHasCategories = BulkEditPane_1.ctxHasCategories.bindTo(contextKeyService);
            this._ctxGroupByFile = BulkEditPane_1.ctxGroupByFile.bindTo(contextKeyService);
            this._ctxHasCheckedChanges = BulkEditPane_1.ctxHasCheckedChanges.bindTo(contextKeyService);
        }
        dispose() {
            this._tree.dispose();
            this._disposables.dispose();
        }
        renderBody(parent) {
            super.renderBody(parent);
            const resourceLabels = this._instaService.createInstance(labels_1.ResourceLabels, { onDidChangeVisibility: this.onDidChangeBodyVisibility });
            this._disposables.add(resourceLabels);
            const contentContainer = document.createElement('div');
            contentContainer.className = 'content';
            parent.appendChild(contentContainer);
            // tree
            const treeContainer = document.createElement('div');
            contentContainer.appendChild(treeContainer);
            this._treeDataSource = this._instaService.createInstance(bulkEditTree_1.BulkEditDataSource);
            this._treeDataSource.groupByFile = this._storageService.getBoolean(BulkEditPane_1._memGroupByFile, 0 /* StorageScope.PROFILE */, true);
            this._ctxGroupByFile.set(this._treeDataSource.groupByFile);
            this._tree = this._instaService.createInstance(listService_1.WorkbenchAsyncDataTree, this.id, treeContainer, new bulkEditTree_1.BulkEditDelegate(), [this._instaService.createInstance(bulkEditTree_1.TextEditElementRenderer), this._instaService.createInstance(bulkEditTree_1.FileElementRenderer, resourceLabels), this._instaService.createInstance(bulkEditTree_1.CategoryElementRenderer)], this._treeDataSource, {
                accessibilityProvider: this._instaService.createInstance(bulkEditTree_1.BulkEditAccessibilityProvider),
                identityProvider: new bulkEditTree_1.BulkEditIdentityProvider(),
                expandOnlyOnTwistieClick: true,
                multipleSelectionSupport: false,
                keyboardNavigationLabelProvider: new bulkEditTree_1.BulkEditNaviLabelProvider(),
                sorter: new bulkEditTree_1.BulkEditSorter(),
                selectionNavigation: true
            });
            this._disposables.add(this._tree.onContextMenu(this._onContextMenu, this));
            this._disposables.add(this._tree.onDidOpen(e => this._openElementAsEditor(e)));
            // buttons
            const buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'buttons';
            contentContainer.appendChild(buttonsContainer);
            const buttonBar = new button_1.ButtonBar(buttonsContainer);
            this._disposables.add(buttonBar);
            const btnConfirm = buttonBar.addButton({ supportIcons: true, ...defaultStyles_1.defaultButtonStyles });
            btnConfirm.label = (0, nls_1.localize)('ok', 'Apply');
            btnConfirm.onDidClick(() => this.accept(), this, this._disposables);
            const btnCancel = buttonBar.addButton({ ...defaultStyles_1.defaultButtonStyles, secondary: true });
            btnCancel.label = (0, nls_1.localize)('cancel', 'Discard');
            btnCancel.onDidClick(() => this.discard(), this, this._disposables);
            // message
            this._message = document.createElement('span');
            this._message.className = 'message';
            this._message.innerText = (0, nls_1.localize)('empty.msg', "Invoke a code action, like rename, to see a preview of its changes here.");
            parent.appendChild(this._message);
            //
            this._setState("message" /* State.Message */);
        }
        layoutBody(height, width) {
            super.layoutBody(height, width);
            const treeHeight = height - 50;
            this._tree.getHTMLElement().parentElement.style.height = `${treeHeight}px`;
            this._tree.layout(treeHeight, width);
        }
        _setState(state) {
            this.element.dataset['state'] = state;
        }
        async setInput(edit, token) {
            this._setState("data" /* State.Data */);
            this._sessionDisposables.clear();
            this._treeViewStates.clear();
            if (this._currentResolve) {
                this._currentResolve(undefined);
                this._currentResolve = undefined;
            }
            const input = await this._instaService.invokeFunction(bulkEditPreview_1.BulkFileOperations.create, edit);
            this._currentProvider = this._instaService.createInstance(bulkEditPreview_1.BulkEditPreviewProvider, input);
            this._sessionDisposables.add(this._currentProvider);
            this._sessionDisposables.add(input);
            //
            const hasCategories = input.categories.length > 1;
            this._ctxHasCategories.set(hasCategories);
            this._treeDataSource.groupByFile = !hasCategories || this._treeDataSource.groupByFile;
            this._ctxHasCheckedChanges.set(input.checked.checkedCount > 0);
            this._currentInput = input;
            return new Promise(resolve => {
                token.onCancellationRequested(() => resolve(undefined));
                this._currentResolve = resolve;
                this._setTreeInput(input);
                // refresh when check state changes
                this._sessionDisposables.add(input.checked.onDidChange(() => {
                    this._tree.updateChildren();
                    this._ctxHasCheckedChanges.set(input.checked.checkedCount > 0);
                }));
            });
        }
        hasInput() {
            return Boolean(this._currentInput);
        }
        async _setTreeInput(input) {
            const viewState = this._treeViewStates.get(this._treeDataSource.groupByFile);
            await this._tree.setInput(input, viewState);
            this._tree.domFocus();
            if (viewState) {
                return;
            }
            // async expandAll (max=10) is the default when no view state is given
            const expand = [...this._tree.getNode(input).children].slice(0, 10);
            while (expand.length > 0) {
                const { element } = expand.shift();
                if (element instanceof bulkEditTree_1.FileElement) {
                    await this._tree.expand(element, true);
                }
                if (element instanceof bulkEditTree_1.CategoryElement) {
                    await this._tree.expand(element, true);
                    expand.push(...this._tree.getNode(element).children);
                }
            }
        }
        accept() {
            const conflicts = this._currentInput?.conflicts.list();
            if (!conflicts || conflicts.length === 0) {
                this._done(true);
                return;
            }
            let message;
            if (conflicts.length === 1) {
                message = (0, nls_1.localize)('conflict.1', "Cannot apply refactoring because '{0}' has changed in the meantime.", this._labelService.getUriLabel(conflicts[0], { relative: true }));
            }
            else {
                message = (0, nls_1.localize)('conflict.N', "Cannot apply refactoring because {0} other files have changed in the meantime.", conflicts.length);
            }
            this._dialogService.warn(message).finally(() => this._done(false));
        }
        discard() {
            this._done(false);
        }
        _done(accept) {
            this._currentResolve?.(accept ? this._currentInput?.getWorkspaceEdit() : undefined);
            this._currentInput = undefined;
            this._setState("message" /* State.Message */);
            this._sessionDisposables.clear();
        }
        toggleChecked() {
            const [first] = this._tree.getFocus();
            if ((first instanceof bulkEditTree_1.FileElement || first instanceof bulkEditTree_1.TextEditElement) && !first.isDisabled()) {
                first.setChecked(!first.isChecked());
            }
            else if (first instanceof bulkEditTree_1.CategoryElement) {
                first.setChecked(!first.isChecked());
            }
        }
        groupByFile() {
            if (!this._treeDataSource.groupByFile) {
                this.toggleGrouping();
            }
        }
        groupByType() {
            if (this._treeDataSource.groupByFile) {
                this.toggleGrouping();
            }
        }
        toggleGrouping() {
            const input = this._tree.getInput();
            if (input) {
                // (1) capture view state
                const oldViewState = this._tree.getViewState();
                this._treeViewStates.set(this._treeDataSource.groupByFile, oldViewState);
                // (2) toggle and update
                this._treeDataSource.groupByFile = !this._treeDataSource.groupByFile;
                this._setTreeInput(input);
                // (3) remember preference
                this._storageService.store(BulkEditPane_1._memGroupByFile, this._treeDataSource.groupByFile, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
                this._ctxGroupByFile.set(this._treeDataSource.groupByFile);
            }
        }
        async _openElementAsEditor(e) {
            const options = { ...e.editorOptions };
            let fileElement;
            if (e.element instanceof bulkEditTree_1.TextEditElement) {
                fileElement = e.element.parent;
                options.selection = e.element.edit.textEdit.textEdit.range;
            }
            else if (e.element instanceof bulkEditTree_1.FileElement) {
                fileElement = e.element;
                options.selection = e.element.edit.textEdits[0]?.textEdit.textEdit.range;
            }
            else {
                // invalid event
                return;
            }
            const previewUri = this._currentProvider.asPreviewUri(fileElement.edit.uri);
            if (fileElement.edit.type & 4 /* BulkFileOperationType.Delete */) {
                // delete -> show single editor
                this._editorService.openEditor({
                    label: (0, nls_1.localize)('edt.title.del', "{0} (delete, refactor preview)", (0, resources_1.basename)(fileElement.edit.uri)),
                    resource: previewUri,
                    options
                });
            }
            else {
                // rename, create, edits -> show diff editr
                let leftResource;
                try {
                    (await this._textModelService.createModelReference(fileElement.edit.uri)).dispose();
                    leftResource = fileElement.edit.uri;
                }
                catch {
                    leftResource = bulkEditPreview_1.BulkEditPreviewProvider.emptyPreview;
                }
                let typeLabel;
                if (fileElement.edit.type & 8 /* BulkFileOperationType.Rename */) {
                    typeLabel = (0, nls_1.localize)('rename', "rename");
                }
                else if (fileElement.edit.type & 2 /* BulkFileOperationType.Create */) {
                    typeLabel = (0, nls_1.localize)('create', "create");
                }
                let label;
                if (typeLabel) {
                    label = (0, nls_1.localize)('edt.title.2', "{0} ({1}, refactor preview)", (0, resources_1.basename)(fileElement.edit.uri), typeLabel);
                }
                else {
                    label = (0, nls_1.localize)('edt.title.1', "{0} (refactor preview)", (0, resources_1.basename)(fileElement.edit.uri));
                }
                this._editorService.openEditor({
                    original: { resource: leftResource },
                    modified: { resource: previewUri },
                    label,
                    description: this._labelService.getUriLabel((0, resources_1.dirname)(leftResource), { relative: true }),
                    options
                }, e.sideBySide ? editorService_1.SIDE_GROUP : editorService_1.ACTIVE_GROUP);
            }
        }
        _onContextMenu(e) {
            this._contextMenuService.showContextMenu({
                menuId: actions_1.MenuId.BulkEditContext,
                contextKeyService: this.contextKeyService,
                getAnchor: () => e.anchor
            });
        }
    };
    exports.BulkEditPane = BulkEditPane;
    exports.BulkEditPane = BulkEditPane = BulkEditPane_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, editorService_1.IEditorService),
        __param(3, label_1.ILabelService),
        __param(4, resolverService_1.ITextModelService),
        __param(5, dialogs_1.IDialogService),
        __param(6, contextView_1.IContextMenuService),
        __param(7, storage_1.IStorageService),
        __param(8, contextkey_1.IContextKeyService),
        __param(9, views_1.IViewDescriptorService),
        __param(10, keybinding_1.IKeybindingService),
        __param(11, contextView_1.IContextMenuService),
        __param(12, configuration_1.IConfigurationService),
        __param(13, opener_1.IOpenerService),
        __param(14, themeService_1.IThemeService),
        __param(15, telemetry_1.ITelemetryService)
    ], BulkEditPane);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVsa0VkaXRQYW5lLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvYnVsa0VkaXQvYnJvd3Nlci9wcmV2aWV3L2J1bGtFZGl0UGFuZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBc0NoRyxJQUFXLEtBR1Y7SUFIRCxXQUFXLEtBQUs7UUFDZixzQkFBYSxDQUFBO1FBQ2IsNEJBQW1CLENBQUE7SUFDcEIsQ0FBQyxFQUhVLEtBQUssS0FBTCxLQUFLLFFBR2Y7SUFFTSxJQUFNLFlBQVksR0FBbEIsTUFBTSxZQUFhLFNBQVEsbUJBQVE7O2lCQUV6QixPQUFFLEdBQUcsaUJBQWlCLEFBQXBCLENBQXFCO2lCQUV2QixxQkFBZ0IsR0FBRyxJQUFJLDBCQUFhLENBQUMsK0JBQStCLEVBQUUsS0FBSyxDQUFDLEFBQTVELENBQTZEO2lCQUM3RSxtQkFBYyxHQUFHLElBQUksMEJBQWEsQ0FBQyw2QkFBNkIsRUFBRSxJQUFJLENBQUMsQUFBekQsQ0FBMEQ7aUJBQ3hFLHlCQUFvQixHQUFHLElBQUksMEJBQWEsQ0FBQyxtQ0FBbUMsRUFBRSxJQUFJLENBQUMsQUFBL0QsQ0FBZ0U7aUJBRTVFLG9CQUFlLEdBQUcsR0FBRyxjQUFZLENBQUMsRUFBRSxjQUFjLEFBQW5DLENBQW9DO1FBa0IzRSxZQUNDLE9BQTRCLEVBQ0wsYUFBcUQsRUFDNUQsY0FBK0MsRUFDaEQsYUFBNkMsRUFDekMsaUJBQXFELEVBQ3hELGNBQStDLEVBQzFDLG1CQUF5RCxFQUM3RCxlQUFpRCxFQUM5QyxpQkFBcUMsRUFDakMscUJBQTZDLEVBQ2pELGlCQUFxQyxFQUNwQyxrQkFBdUMsRUFDckMsb0JBQTJDLEVBQ2xELGFBQTZCLEVBQzlCLFlBQTJCLEVBQ3ZCLGdCQUFtQztZQUV0RCxLQUFLLENBQ0osRUFBRSxHQUFHLE9BQU8sRUFBRSxXQUFXLEVBQUUsZ0JBQU0sQ0FBQyxhQUFhLEVBQUUsRUFDakQsaUJBQWlCLEVBQUUsa0JBQWtCLEVBQUUsb0JBQW9CLEVBQUUsaUJBQWlCLEVBQUUscUJBQXFCLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsZ0JBQWdCLENBQ25LLENBQUM7WUFuQnNDLGtCQUFhLEdBQWIsYUFBYSxDQUF1QjtZQUMzQyxtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7WUFDL0Isa0JBQWEsR0FBYixhQUFhLENBQWU7WUFDeEIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtZQUN2QyxtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7WUFDekIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtZQUM1QyxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUF0QjNELG9CQUFlLEdBQUcsSUFBSSxHQUFHLEVBQW9DLENBQUM7WUFPckQsaUJBQVksR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUNyQyx3QkFBbUIsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQTZCNUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLGlCQUFpQixDQUFDLENBQUM7WUFDakUsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGNBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNqRixJQUFJLENBQUMsZUFBZSxHQUFHLGNBQVksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDN0UsSUFBSSxDQUFDLHFCQUFxQixHQUFHLGNBQVksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUMxRixDQUFDO1FBRVEsT0FBTztZQUNmLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDckIsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM3QixDQUFDO1FBRWtCLFVBQVUsQ0FBQyxNQUFtQjtZQUNoRCxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXpCLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUN2RCx1QkFBYyxFQUNZLEVBQUUscUJBQXFCLEVBQUUsSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQ25GLENBQUM7WUFDRixJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUV0QyxNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdkQsZ0JBQWdCLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztZQUN2QyxNQUFNLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFFckMsT0FBTztZQUNQLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDcEQsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRTVDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsaUNBQWtCLENBQUMsQ0FBQztZQUM3RSxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxjQUFZLENBQUMsZUFBZSxnQ0FBd0IsSUFBSSxDQUFDLENBQUM7WUFDN0gsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUUzRCxJQUFJLENBQUMsS0FBSyxHQUE0RSxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FDdEgsb0NBQXNCLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxhQUFhLEVBQzlDLElBQUksK0JBQWdCLEVBQUUsRUFDdEIsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxzQ0FBdUIsQ0FBQyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLGtDQUFtQixFQUFFLGNBQWMsQ0FBQyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLHNDQUF1QixDQUFDLENBQUMsRUFDaE0sSUFBSSxDQUFDLGVBQWUsRUFDcEI7Z0JBQ0MscUJBQXFCLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsNENBQTZCLENBQUM7Z0JBQ3ZGLGdCQUFnQixFQUFFLElBQUksdUNBQXdCLEVBQUU7Z0JBQ2hELHdCQUF3QixFQUFFLElBQUk7Z0JBQzlCLHdCQUF3QixFQUFFLEtBQUs7Z0JBQy9CLCtCQUErQixFQUFFLElBQUksd0NBQXlCLEVBQUU7Z0JBQ2hFLE1BQU0sRUFBRSxJQUFJLDZCQUFjLEVBQUU7Z0JBQzVCLG1CQUFtQixFQUFFLElBQUk7YUFDekIsQ0FDRCxDQUFDO1lBRUYsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzNFLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUUvRSxVQUFVO1lBQ1YsTUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3ZELGdCQUFnQixDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7WUFDdkMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDL0MsTUFBTSxTQUFTLEdBQUcsSUFBSSxrQkFBUyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDbEQsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFakMsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsR0FBRyxtQ0FBbUIsRUFBRSxDQUFDLENBQUM7WUFDdkYsVUFBVSxDQUFDLEtBQUssR0FBRyxJQUFBLGNBQVEsRUFBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDM0MsVUFBVSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUVwRSxNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBRyxtQ0FBbUIsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUNuRixTQUFTLENBQUMsS0FBSyxHQUFHLElBQUEsY0FBUSxFQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNoRCxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRXBFLFVBQVU7WUFDVixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDL0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxHQUFHLElBQUEsY0FBUSxFQUFDLFdBQVcsRUFBRSwwRUFBMEUsQ0FBQyxDQUFDO1lBQzVILE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRWxDLEVBQUU7WUFDRixJQUFJLENBQUMsU0FBUywrQkFBZSxDQUFDO1FBQy9CLENBQUM7UUFFa0IsVUFBVSxDQUFDLE1BQWMsRUFBRSxLQUFhO1lBQzFELEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sVUFBVSxHQUFHLE1BQU0sR0FBRyxFQUFFLENBQUM7WUFDL0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQyxhQUFjLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxHQUFHLFVBQVUsSUFBSSxDQUFDO1lBQzVFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBRU8sU0FBUyxDQUFDLEtBQVk7WUFDN0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQ3ZDLENBQUM7UUFFRCxLQUFLLENBQUMsUUFBUSxDQUFDLElBQW9CLEVBQUUsS0FBd0I7WUFDNUQsSUFBSSxDQUFDLFNBQVMseUJBQVksQ0FBQztZQUMzQixJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDakMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUU3QixJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUU7Z0JBQ3pCLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ2hDLElBQUksQ0FBQyxlQUFlLEdBQUcsU0FBUyxDQUFDO2FBQ2pDO1lBRUQsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxvQ0FBa0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDdkYsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLHlDQUF1QixFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzFGLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDcEQsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVwQyxFQUFFO1lBQ0YsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1lBQ2xELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDMUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUM7WUFDdEYsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsQ0FBQztZQUUvRCxJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztZQUUzQixPQUFPLElBQUksT0FBTyxDQUE2QixPQUFPLENBQUMsRUFBRTtnQkFFeEQsS0FBSyxDQUFDLHVCQUF1QixDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUV4RCxJQUFJLENBQUMsZUFBZSxHQUFHLE9BQU8sQ0FBQztnQkFDL0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFMUIsbUNBQW1DO2dCQUNuQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRTtvQkFDM0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztvQkFDNUIsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDaEUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELFFBQVE7WUFDUCxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDcEMsQ0FBQztRQUVPLEtBQUssQ0FBQyxhQUFhLENBQUMsS0FBeUI7WUFFcEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUM3RSxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztZQUM1QyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRXRCLElBQUksU0FBUyxFQUFFO2dCQUNkLE9BQU87YUFDUDtZQUVELHNFQUFzRTtZQUN0RSxNQUFNLE1BQU0sR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNwRSxPQUFPLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUN6QixNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFBRyxDQUFDO2dCQUNwQyxJQUFJLE9BQU8sWUFBWSwwQkFBVyxFQUFFO29CQUNuQyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztpQkFDdkM7Z0JBQ0QsSUFBSSxPQUFPLFlBQVksOEJBQWUsRUFBRTtvQkFDdkMsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQ3ZDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDckQ7YUFDRDtRQUNGLENBQUM7UUFFRCxNQUFNO1lBRUwsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFdkQsSUFBSSxDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDekMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDakIsT0FBTzthQUNQO1lBRUQsSUFBSSxPQUFlLENBQUM7WUFDcEIsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDM0IsT0FBTyxHQUFHLElBQUEsY0FBUSxFQUFDLFlBQVksRUFBRSxxRUFBcUUsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQzFLO2lCQUFNO2dCQUNOLE9BQU8sR0FBRyxJQUFBLGNBQVEsRUFBQyxZQUFZLEVBQUUsZ0ZBQWdGLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ3JJO1lBRUQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNwRSxDQUFDO1FBRUQsT0FBTztZQUNOLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkIsQ0FBQztRQUVPLEtBQUssQ0FBQyxNQUFlO1lBQzVCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDcEYsSUFBSSxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUM7WUFDL0IsSUFBSSxDQUFDLFNBQVMsK0JBQWUsQ0FBQztZQUM5QixJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDbEMsQ0FBQztRQUVELGFBQWE7WUFDWixNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN0QyxJQUFJLENBQUMsS0FBSyxZQUFZLDBCQUFXLElBQUksS0FBSyxZQUFZLDhCQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsRUFBRTtnQkFDOUYsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO2FBQ3JDO2lCQUFNLElBQUksS0FBSyxZQUFZLDhCQUFlLEVBQUU7Z0JBQzVDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQzthQUNyQztRQUNGLENBQUM7UUFFRCxXQUFXO1lBQ1YsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFO2dCQUN0QyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7YUFDdEI7UUFDRixDQUFDO1FBRUQsV0FBVztZQUNWLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUU7Z0JBQ3JDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQzthQUN0QjtRQUNGLENBQUM7UUFFRCxjQUFjO1lBQ2IsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNwQyxJQUFJLEtBQUssRUFBRTtnQkFFVix5QkFBeUI7Z0JBQ3pCLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQy9DLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDO2dCQUV6RSx3QkFBd0I7Z0JBQ3hCLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxHQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUM7Z0JBQ3JFLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBRTFCLDBCQUEwQjtnQkFDMUIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsY0FBWSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsMkRBQTJDLENBQUM7Z0JBQ3JJLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLENBQUM7YUFDM0Q7UUFDRixDQUFDO1FBRU8sS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQTBDO1lBRTVFLE1BQU0sT0FBTyxHQUFnQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3BFLElBQUksV0FBd0IsQ0FBQztZQUM3QixJQUFJLENBQUMsQ0FBQyxPQUFPLFlBQVksOEJBQWUsRUFBRTtnQkFDekMsV0FBVyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO2dCQUMvQixPQUFPLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO2FBRTNEO2lCQUFNLElBQUksQ0FBQyxDQUFDLE9BQU8sWUFBWSwwQkFBVyxFQUFFO2dCQUM1QyxXQUFXLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQztnQkFDeEIsT0FBTyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7YUFFekU7aUJBQU07Z0JBQ04sZ0JBQWdCO2dCQUNoQixPQUFPO2FBQ1A7WUFFRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsZ0JBQWlCLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFN0UsSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksdUNBQStCLEVBQUU7Z0JBQ3pELCtCQUErQjtnQkFDL0IsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUM7b0JBQzlCLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxlQUFlLEVBQUUsZ0NBQWdDLEVBQUUsSUFBQSxvQkFBUSxFQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ2xHLFFBQVEsRUFBRSxVQUFVO29CQUNwQixPQUFPO2lCQUNQLENBQUMsQ0FBQzthQUVIO2lCQUFNO2dCQUNOLDJDQUEyQztnQkFDM0MsSUFBSSxZQUE2QixDQUFDO2dCQUNsQyxJQUFJO29CQUNILENBQUMsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUNwRixZQUFZLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7aUJBQ3BDO2dCQUFDLE1BQU07b0JBQ1AsWUFBWSxHQUFHLHlDQUF1QixDQUFDLFlBQVksQ0FBQztpQkFDcEQ7Z0JBRUQsSUFBSSxTQUE2QixDQUFDO2dCQUNsQyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSx1Q0FBK0IsRUFBRTtvQkFDekQsU0FBUyxHQUFHLElBQUEsY0FBUSxFQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztpQkFDekM7cUJBQU0sSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksdUNBQStCLEVBQUU7b0JBQ2hFLFNBQVMsR0FBRyxJQUFBLGNBQVEsRUFBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7aUJBQ3pDO2dCQUVELElBQUksS0FBYSxDQUFDO2dCQUNsQixJQUFJLFNBQVMsRUFBRTtvQkFDZCxLQUFLLEdBQUcsSUFBQSxjQUFRLEVBQUMsYUFBYSxFQUFFLDZCQUE2QixFQUFFLElBQUEsb0JBQVEsRUFBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2lCQUMxRztxQkFBTTtvQkFDTixLQUFLLEdBQUcsSUFBQSxjQUFRLEVBQUMsYUFBYSxFQUFFLHdCQUF3QixFQUFFLElBQUEsb0JBQVEsRUFBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7aUJBQzFGO2dCQUVELElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDO29CQUM5QixRQUFRLEVBQUUsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFO29CQUNwQyxRQUFRLEVBQUUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFO29CQUNsQyxLQUFLO29CQUNMLFdBQVcsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxJQUFBLG1CQUFPLEVBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUM7b0JBQ3RGLE9BQU87aUJBQ1AsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQywwQkFBVSxDQUFDLENBQUMsQ0FBQyw0QkFBWSxDQUFDLENBQUM7YUFDN0M7UUFDRixDQUFDO1FBRU8sY0FBYyxDQUFDLENBQTZCO1lBRW5ELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLENBQUM7Z0JBQ3hDLE1BQU0sRUFBRSxnQkFBTSxDQUFDLGVBQWU7Z0JBQzlCLGlCQUFpQixFQUFFLElBQUksQ0FBQyxpQkFBaUI7Z0JBQ3pDLFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTTthQUN6QixDQUFDLENBQUM7UUFDSixDQUFDOztJQW5WVyxvQ0FBWTsyQkFBWixZQUFZO1FBNEJ0QixXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEsOEJBQWMsQ0FBQTtRQUNkLFdBQUEscUJBQWEsQ0FBQTtRQUNiLFdBQUEsbUNBQWlCLENBQUE7UUFDakIsV0FBQSx3QkFBYyxDQUFBO1FBQ2QsV0FBQSxpQ0FBbUIsQ0FBQTtRQUNuQixXQUFBLHlCQUFlLENBQUE7UUFDZixXQUFBLCtCQUFrQixDQUFBO1FBQ2xCLFdBQUEsOEJBQXNCLENBQUE7UUFDdEIsWUFBQSwrQkFBa0IsQ0FBQTtRQUNsQixZQUFBLGlDQUFtQixDQUFBO1FBQ25CLFlBQUEscUNBQXFCLENBQUE7UUFDckIsWUFBQSx1QkFBYyxDQUFBO1FBQ2QsWUFBQSw0QkFBYSxDQUFBO1FBQ2IsWUFBQSw2QkFBaUIsQ0FBQTtPQTFDUCxZQUFZLENBb1Z4QiJ9