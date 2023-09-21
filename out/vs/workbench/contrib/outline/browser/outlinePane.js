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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/progressbar/progressbar", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/map", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/list/browser/listService", "vs/platform/storage/common/storage", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/services/editor/common/editorService", "vs/base/common/resources", "vs/workbench/common/views", "vs/platform/opener/common/opener", "vs/platform/telemetry/common/telemetry", "./outlineViewState", "vs/workbench/services/outline/browser/outline", "vs/workbench/common/editor", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/browser/ui/tree/abstractTree", "vs/workbench/contrib/outline/browser/outline", "vs/platform/theme/browser/defaultStyles", "vs/css!./outlinePane"], function (require, exports, dom, progressbar_1, async_1, lifecycle_1, map_1, nls_1, configuration_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, listService_1, storage_1, themeService_1, viewPane_1, editorService_1, resources_1, views_1, opener_1, telemetry_1, outlineViewState_1, outline_1, editor_1, cancellation_1, event_1, abstractTree_1, outline_2, defaultStyles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OutlinePane = void 0;
    class OutlineTreeSorter {
        constructor(_comparator, order) {
            this._comparator = _comparator;
            this.order = order;
        }
        compare(a, b) {
            if (this.order === 2 /* OutlineSortOrder.ByKind */) {
                return this._comparator.compareByType(a, b);
            }
            else if (this.order === 1 /* OutlineSortOrder.ByName */) {
                return this._comparator.compareByName(a, b);
            }
            else {
                return this._comparator.compareByPosition(a, b);
            }
        }
    }
    let OutlinePane = class OutlinePane extends viewPane_1.ViewPane {
        static { this.Id = 'outline'; }
        constructor(options, _outlineService, _instantiationService, viewDescriptorService, _storageService, _editorService, configurationService, keybindingService, contextKeyService, contextMenuService, openerService, themeService, telemetryService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, _instantiationService, openerService, themeService, telemetryService);
            this._outlineService = _outlineService;
            this._instantiationService = _instantiationService;
            this._storageService = _storageService;
            this._editorService = _editorService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._editorControlDisposables = new lifecycle_1.DisposableStore();
            this._editorPaneDisposables = new lifecycle_1.DisposableStore();
            this._outlineViewState = new outlineViewState_1.OutlineViewState();
            this._editorListener = new lifecycle_1.MutableDisposable();
            this._treeStates = new map_1.LRUCache(10);
            this._outlineViewState.restore(this._storageService);
            this._disposables.add(this._outlineViewState);
            contextKeyService.bufferChangeEvents(() => {
                this._ctxFollowsCursor = outline_2.ctxFollowsCursor.bindTo(contextKeyService);
                this._ctxFilterOnType = outline_2.ctxFilterOnType.bindTo(contextKeyService);
                this._ctxSortMode = outline_2.ctxSortMode.bindTo(contextKeyService);
                this._ctxAllCollapsed = outline_2.ctxAllCollapsed.bindTo(contextKeyService);
            });
            const updateContext = () => {
                this._ctxFollowsCursor.set(this._outlineViewState.followCursor);
                this._ctxFilterOnType.set(this._outlineViewState.filterOnType);
                this._ctxSortMode.set(this._outlineViewState.sortBy);
            };
            updateContext();
            this._disposables.add(this._outlineViewState.onDidChange(updateContext));
        }
        dispose() {
            this._disposables.dispose();
            this._editorPaneDisposables.dispose();
            this._editorControlDisposables.dispose();
            this._editorListener.dispose();
            super.dispose();
        }
        focus() {
            this._tree?.domFocus();
        }
        renderBody(container) {
            super.renderBody(container);
            this._domNode = container;
            container.classList.add('outline-pane');
            const progressContainer = dom.$('.outline-progress');
            this._message = dom.$('.outline-message');
            this._progressBar = new progressbar_1.ProgressBar(progressContainer, defaultStyles_1.defaultProgressBarStyles);
            this._treeContainer = dom.$('.outline-tree');
            dom.append(container, progressContainer, this._message, this._treeContainer);
            this._disposables.add(this.onDidChangeBodyVisibility(visible => {
                if (!visible) {
                    // stop everything when not visible
                    this._editorListener.clear();
                    this._editorPaneDisposables.clear();
                    this._editorControlDisposables.clear();
                }
                else if (!this._editorListener.value) {
                    const event = event_1.Event.any(this._editorService.onDidActiveEditorChange, this._outlineService.onDidChange);
                    this._editorListener.value = event(() => this._handleEditorChanged(this._editorService.activeEditorPane));
                    this._handleEditorChanged(this._editorService.activeEditorPane);
                }
            }));
        }
        layoutBody(height, width) {
            super.layoutBody(height, width);
            this._tree?.layout(height, width);
            this._treeDimensions = new dom.Dimension(width, height);
        }
        collapseAll() {
            this._tree?.collapseAll();
        }
        expandAll() {
            this._tree?.expandAll();
        }
        get outlineViewState() {
            return this._outlineViewState;
        }
        _showMessage(message) {
            this._domNode.classList.add('message');
            this._progressBar.stop().hide();
            this._message.innerText = message;
        }
        _captureViewState(uri) {
            if (this._tree) {
                const oldOutline = this._tree.getInput();
                if (!uri) {
                    uri = oldOutline?.uri;
                }
                if (oldOutline && uri) {
                    this._treeStates.set(`${oldOutline.outlineKind}/${uri}`, this._tree.getViewState());
                    return true;
                }
            }
            return false;
        }
        _handleEditorChanged(pane) {
            this._editorPaneDisposables.clear();
            if (pane) {
                // react to control changes from within pane (https://github.com/microsoft/vscode/issues/134008)
                this._editorPaneDisposables.add(pane.onDidChangeControl(() => {
                    this._handleEditorControlChanged(pane);
                }));
            }
            this._handleEditorControlChanged(pane);
        }
        async _handleEditorControlChanged(pane) {
            // persist state
            const resource = editor_1.EditorResourceAccessor.getOriginalUri(pane?.input);
            const didCapture = this._captureViewState();
            this._editorControlDisposables.clear();
            if (!pane || !this._outlineService.canCreateOutline(pane) || !resource) {
                return this._showMessage((0, nls_1.localize)('no-editor', "The active editor cannot provide outline information."));
            }
            let loadingMessage;
            if (!didCapture) {
                loadingMessage = new async_1.TimeoutTimer(() => {
                    this._showMessage((0, nls_1.localize)('loading', "Loading document symbols for '{0}'...", (0, resources_1.basename)(resource)));
                }, 100);
            }
            this._progressBar.infinite().show(500);
            const cts = new cancellation_1.CancellationTokenSource();
            this._editorControlDisposables.add((0, lifecycle_1.toDisposable)(() => cts.dispose(true)));
            const newOutline = await this._outlineService.createOutline(pane, 1 /* OutlineTarget.OutlinePane */, cts.token);
            loadingMessage?.dispose();
            if (!newOutline) {
                return;
            }
            if (cts.token.isCancellationRequested) {
                newOutline?.dispose();
                return;
            }
            this._editorControlDisposables.add(newOutline);
            this._progressBar.stop().hide();
            const sorter = new OutlineTreeSorter(newOutline.config.comparator, this._outlineViewState.sortBy);
            const tree = this._instantiationService.createInstance(listService_1.WorkbenchDataTree, 'OutlinePane', this._treeContainer, newOutline.config.delegate, newOutline.config.renderers, newOutline.config.treeDataSource, {
                ...newOutline.config.options,
                sorter,
                expandOnDoubleClick: false,
                expandOnlyOnTwistieClick: true,
                multipleSelectionSupport: false,
                hideTwistiesOfChildlessElements: true,
                defaultFindMode: this._outlineViewState.filterOnType ? abstractTree_1.TreeFindMode.Filter : abstractTree_1.TreeFindMode.Highlight,
                overrideStyles: { listBackground: this.getBackgroundColor() }
            });
            // update tree, listen to changes
            const updateTree = () => {
                if (newOutline.isEmpty) {
                    // no more elements
                    this._showMessage((0, nls_1.localize)('no-symbols', "No symbols found in document '{0}'", (0, resources_1.basename)(resource)));
                    this._captureViewState(resource);
                    tree.setInput(undefined);
                }
                else if (!tree.getInput()) {
                    // first: init tree
                    this._domNode.classList.remove('message');
                    const state = this._treeStates.get(`${newOutline.outlineKind}/${newOutline.uri}`);
                    tree.setInput(newOutline, state && abstractTree_1.AbstractTreeViewState.lift(state));
                }
                else {
                    // update: refresh tree
                    this._domNode.classList.remove('message');
                    tree.updateChildren();
                }
            };
            updateTree();
            this._editorControlDisposables.add(newOutline.onDidChange(updateTree));
            tree.findMode = this._outlineViewState.filterOnType ? abstractTree_1.TreeFindMode.Filter : abstractTree_1.TreeFindMode.Highlight;
            // feature: apply panel background to tree
            this._editorControlDisposables.add(this.viewDescriptorService.onDidChangeLocation(({ views }) => {
                if (views.some(v => v.id === this.id)) {
                    tree.updateOptions({ overrideStyles: { listBackground: this.getBackgroundColor() } });
                }
            }));
            // feature: filter on type - keep tree and menu in sync
            this._editorControlDisposables.add(tree.onDidChangeFindMode(mode => this._outlineViewState.filterOnType = mode === abstractTree_1.TreeFindMode.Filter));
            // feature: reveal outline selection in editor
            // on change -> reveal/select defining range
            this._editorControlDisposables.add(tree.onDidOpen(e => newOutline.reveal(e.element, e.editorOptions, e.sideBySide)));
            // feature: reveal editor selection in outline
            const revealActiveElement = () => {
                if (!this._outlineViewState.followCursor || !newOutline.activeElement) {
                    return;
                }
                let item = newOutline.activeElement;
                while (item) {
                    const top = tree.getRelativeTop(item);
                    if (top === null) {
                        // not visible -> reveal
                        tree.reveal(item, 0.5);
                    }
                    if (tree.getRelativeTop(item) !== null) {
                        tree.setFocus([item]);
                        tree.setSelection([item]);
                        break;
                    }
                    // STILL not visible -> try parent
                    item = tree.getParentElement(item);
                }
            };
            revealActiveElement();
            this._editorControlDisposables.add(newOutline.onDidChange(revealActiveElement));
            // feature: update view when user state changes
            this._editorControlDisposables.add(this._outlineViewState.onDidChange((e) => {
                this._outlineViewState.persist(this._storageService);
                if (e.filterOnType) {
                    tree.findMode = this._outlineViewState.filterOnType ? abstractTree_1.TreeFindMode.Filter : abstractTree_1.TreeFindMode.Highlight;
                }
                if (e.followCursor) {
                    revealActiveElement();
                }
                if (e.sortBy) {
                    sorter.order = this._outlineViewState.sortBy;
                    tree.resort();
                }
            }));
            // feature: expand all nodes when filtering (not when finding)
            let viewState;
            this._editorControlDisposables.add(tree.onDidChangeFindPattern(pattern => {
                if (tree.findMode === abstractTree_1.TreeFindMode.Highlight) {
                    return;
                }
                if (!viewState && pattern) {
                    viewState = tree.getViewState();
                    tree.expandAll();
                }
                else if (!pattern && viewState) {
                    tree.setInput(tree.getInput(), viewState);
                    viewState = undefined;
                }
            }));
            // feature: update all-collapsed context key
            const updateAllCollapsedCtx = () => {
                this._ctxAllCollapsed.set(tree.getNode(null).children.every(node => !node.collapsible || node.collapsed));
            };
            this._editorControlDisposables.add(tree.onDidChangeCollapseState(updateAllCollapsedCtx));
            this._editorControlDisposables.add(tree.onDidChangeModel(updateAllCollapsedCtx));
            updateAllCollapsedCtx();
            // last: set tree property and wire it up to one of our context keys
            tree.layout(this._treeDimensions?.height, this._treeDimensions?.width);
            this._tree = tree;
            this._editorControlDisposables.add((0, lifecycle_1.toDisposable)(() => {
                tree.dispose();
                this._tree = undefined;
            }));
        }
    };
    exports.OutlinePane = OutlinePane;
    exports.OutlinePane = OutlinePane = __decorate([
        __param(1, outline_1.IOutlineService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, views_1.IViewDescriptorService),
        __param(4, storage_1.IStorageService),
        __param(5, editorService_1.IEditorService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, keybinding_1.IKeybindingService),
        __param(8, contextkey_1.IContextKeyService),
        __param(9, contextView_1.IContextMenuService),
        __param(10, opener_1.IOpenerService),
        __param(11, themeService_1.IThemeService),
        __param(12, telemetry_1.ITelemetryService)
    ], OutlinePane);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0bGluZVBhbmUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9vdXRsaW5lL2Jyb3dzZXIvb3V0bGluZVBhbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBb0NoRyxNQUFNLGlCQUFpQjtRQUV0QixZQUNTLFdBQWtDLEVBQ25DLEtBQXVCO1lBRHRCLGdCQUFXLEdBQVgsV0FBVyxDQUF1QjtZQUNuQyxVQUFLLEdBQUwsS0FBSyxDQUFrQjtRQUMzQixDQUFDO1FBRUwsT0FBTyxDQUFDLENBQUksRUFBRSxDQUFJO1lBQ2pCLElBQUksSUFBSSxDQUFDLEtBQUssb0NBQTRCLEVBQUU7Z0JBQzNDLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQzVDO2lCQUFNLElBQUksSUFBSSxDQUFDLEtBQUssb0NBQTRCLEVBQUU7Z0JBQ2xELE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQzVDO2lCQUFNO2dCQUNOLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDaEQ7UUFDRixDQUFDO0tBQ0Q7SUFFTSxJQUFNLFdBQVcsR0FBakIsTUFBTSxXQUFZLFNBQVEsbUJBQVE7aUJBRXhCLE9BQUUsR0FBRyxTQUFTLEFBQVosQ0FBYTtRQXVCL0IsWUFDQyxPQUE0QixFQUNYLGVBQWlELEVBQzNDLHFCQUE2RCxFQUM1RCxxQkFBNkMsRUFDcEQsZUFBaUQsRUFDbEQsY0FBK0MsRUFDeEMsb0JBQTJDLEVBQzlDLGlCQUFxQyxFQUNyQyxpQkFBcUMsRUFDcEMsa0JBQXVDLEVBQzVDLGFBQTZCLEVBQzlCLFlBQTJCLEVBQ3ZCLGdCQUFt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