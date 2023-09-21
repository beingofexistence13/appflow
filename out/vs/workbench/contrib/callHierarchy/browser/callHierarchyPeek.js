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
define(["require", "exports", "vs/editor/contrib/peekView/browser/peekView", "vs/platform/instantiation/common/instantiation", "vs/platform/list/browser/listService", "vs/workbench/contrib/callHierarchy/browser/callHierarchyTree", "vs/nls", "vs/editor/common/core/range", "vs/base/browser/ui/splitview/splitview", "vs/base/browser/dom", "vs/base/common/event", "vs/workbench/services/editor/common/editorService", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/editor/common/services/resolverService", "vs/base/common/lifecycle", "vs/editor/common/model", "vs/platform/theme/common/themeService", "vs/platform/storage/common/storage", "vs/base/common/color", "vs/base/browser/ui/tree/tree", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/css!./media/callHierarchy"], function (require, exports, peekView, instantiation_1, listService_1, callHTree, nls_1, range_1, splitview_1, dom_1, event_1, editorService_1, embeddedCodeEditorWidget_1, resolverService_1, lifecycle_1, model_1, themeService_1, storage_1, color_1, tree_1, actions_1, contextkey_1, menuEntryActionViewItem_1) {
    "use strict";
    var CallHierarchyTreePeekWidget_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CallHierarchyTreePeekWidget = void 0;
    var State;
    (function (State) {
        State["Loading"] = "loading";
        State["Message"] = "message";
        State["Data"] = "data";
    })(State || (State = {}));
    class LayoutInfo {
        static store(info, storageService) {
            storageService.store('callHierarchyPeekLayout', JSON.stringify(info), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        }
        static retrieve(storageService) {
            const value = storageService.get('callHierarchyPeekLayout', 0 /* StorageScope.PROFILE */, '{}');
            const defaultInfo = { ratio: 0.7, height: 17 };
            try {
                return { ...defaultInfo, ...JSON.parse(value) };
            }
            catch {
                return defaultInfo;
            }
        }
        constructor(ratio, height) {
            this.ratio = ratio;
            this.height = height;
        }
    }
    class CallHierarchyTree extends listService_1.WorkbenchAsyncDataTree {
    }
    let CallHierarchyTreePeekWidget = class CallHierarchyTreePeekWidget extends peekView.PeekViewWidget {
        static { CallHierarchyTreePeekWidget_1 = this; }
        static { this.TitleMenu = new actions_1.MenuId('callhierarchy/title'); }
        constructor(editor, _where, _direction, themeService, _peekViewService, _editorService, _textModelService, _storageService, _menuService, _contextKeyService, _instantiationService) {
            super(editor, { showFrame: true, showArrow: true, isResizeable: true, isAccessible: true }, _instantiationService);
            this._where = _where;
            this._direction = _direction;
            this._peekViewService = _peekViewService;
            this._editorService = _editorService;
            this._textModelService = _textModelService;
            this._storageService = _storageService;
            this._menuService = _menuService;
            this._contextKeyService = _contextKeyService;
            this._instantiationService = _instantiationService;
            this._treeViewStates = new Map();
            this._previewDisposable = new lifecycle_1.DisposableStore();
            this.create();
            this._peekViewService.addExclusiveWidget(editor, this);
            this._applyTheme(themeService.getColorTheme());
            this._disposables.add(themeService.onDidColorThemeChange(this._applyTheme, this));
            this._disposables.add(this._previewDisposable);
        }
        dispose() {
            LayoutInfo.store(this._layoutInfo, this._storageService);
            this._splitView.dispose();
            this._tree.dispose();
            this._editor.dispose();
            super.dispose();
        }
        get direction() {
            return this._direction;
        }
        _applyTheme(theme) {
            const borderColor = theme.getColor(peekView.peekViewBorder) || color_1.Color.transparent;
            this.style({
                arrowColor: borderColor,
                frameColor: borderColor,
                headerBackgroundColor: theme.getColor(peekView.peekViewTitleBackground) || color_1.Color.transparent,
                primaryHeadingColor: theme.getColor(peekView.peekViewTitleForeground),
                secondaryHeadingColor: theme.getColor(peekView.peekViewTitleInfoForeground)
            });
        }
        _fillHead(container) {
            super._fillHead(container, true);
            const menu = this._menuService.createMenu(CallHierarchyTreePeekWidget_1.TitleMenu, this._contextKeyService);
            const updateToolbar = () => {
                const actions = [];
                (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, undefined, actions);
                this._actionbarWidget.clear();
                this._actionbarWidget.push(actions, { label: false, icon: true });
            };
            this._disposables.add(menu);
            this._disposables.add(menu.onDidChange(updateToolbar));
            updateToolbar();
        }
        _fillBody(parent) {
            this._layoutInfo = LayoutInfo.retrieve(this._storageService);
            this._dim = new dom_1.Dimension(0, 0);
            this._parent = parent;
            parent.classList.add('call-hierarchy');
            const message = document.createElement('div');
            message.classList.add('message');
            parent.appendChild(message);
            this._message = message;
            this._message.tabIndex = 0;
            const container = document.createElement('div');
            container.classList.add('results');
            parent.appendChild(container);
            this._splitView = new splitview_1.SplitView(container, { orientation: 1 /* Orientation.HORIZONTAL */ });
            // editor stuff
            const editorContainer = document.createElement('div');
            editorContainer.classList.add('editor');
            container.appendChild(editorContainer);
            const editorOptions = {
                scrollBeyondLastLine: false,
                scrollbar: {
                    verticalScrollbarSize: 14,
                    horizontal: 'auto',
                    useShadows: true,
                    verticalHasArrows: false,
                    horizontalHasArrows: false,
                    alwaysConsumeMouseWheel: false
                },
                overviewRulerLanes: 2,
                fixedOverflowWidgets: true,
                minimap: {
                    enabled: false
                }
            };
            this._editor = this._instantiationService.createInstance(embeddedCodeEditorWidget_1.EmbeddedCodeEditorWidget, editorContainer, editorOptions, {}, this.editor);
            // tree stuff
            const treeContainer = document.createElement('div');
            treeContainer.classList.add('tree');
            container.appendChild(treeContainer);
            const options = {
                sorter: new callHTree.Sorter(),
                accessibilityProvider: new callHTree.AccessibilityProvider(() => this._direction),
                identityProvider: new callHTree.IdentityProvider(() => this._direction),
                expandOnlyOnTwistieClick: true,
                overrideStyles: {
                    listBackground: peekView.peekViewResultsBackground
                }
            };
            this._tree = this._instantiationService.createInstance(CallHierarchyTree, 'CallHierarchyPeek', treeContainer, new callHTree.VirtualDelegate(), [this._instantiationService.createInstance(callHTree.CallRenderer)], this._instantiationService.createInstance(callHTree.DataSource, () => this._direction), options);
            // split stuff
            this._splitView.addView({
                onDidChange: event_1.Event.None,
                element: editorContainer,
                minimumSize: 200,
                maximumSize: Number.MAX_VALUE,
                layout: (width) => {
                    if (this._dim.height) {
                        this._editor.layout({ height: this._dim.height, width });
                    }
                }
            }, splitview_1.Sizing.Distribute);
            this._splitView.addView({
                onDidChange: event_1.Event.None,
                element: treeContainer,
                minimumSize: 100,
                maximumSize: Number.MAX_VALUE,
                layout: (width) => {
                    if (this._dim.height) {
                        this._tree.layout(this._dim.height, width);
                    }
                }
            }, splitview_1.Sizing.Distribute);
            this._disposables.add(this._splitView.onDidSashChange(() => {
                if (this._dim.width) {
                    this._layoutInfo.ratio = this._splitView.getViewSize(0) / this._dim.width;
                }
            }));
            // update editor
            this._disposables.add(this._tree.onDidChangeFocus(this._updatePreview, this));
            this._disposables.add(this._editor.onMouseDown(e => {
                const { event, target } = e;
                if (event.detail !== 2) {
                    return;
                }
                const [focus] = this._tree.getFocus();
                if (!focus) {
                    return;
                }
                this.dispose();
                this._editorService.openEditor({
                    resource: focus.item.uri,
                    options: { selection: target.range }
                });
            }));
            this._disposables.add(this._tree.onMouseDblClick(e => {
                if (e.target === tree_1.TreeMouseEventTarget.Twistie) {
                    return;
                }
                if (e.element) {
                    this.dispose();
                    this._editorService.openEditor({
                        resource: e.element.item.uri,
                        options: { selection: e.element.item.selectionRange, pinned: true }
                    });
                }
            }));
            this._disposables.add(this._tree.onDidChangeSelection(e => {
                const [element] = e.elements;
                // don't close on click
                if (element && e.browserEvent instanceof KeyboardEvent) {
                    this.dispose();
                    this._editorService.openEditor({
                        resource: element.item.uri,
                        options: { selection: element.item.selectionRange, pinned: true }
                    });
                }
            }));
        }
        async _updatePreview() {
            const [element] = this._tree.getFocus();
            if (!element) {
                return;
            }
            this._previewDisposable.clear();
            // update: editor and editor highlights
            const options = {
                description: 'call-hierarchy-decoration',
                stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
                className: 'call-decoration',
                overviewRuler: {
                    color: (0, themeService_1.themeColorFromId)(peekView.peekViewEditorMatchHighlight),
                    position: model_1.OverviewRulerLane.Center
                },
            };
            let previewUri;
            if (this._direction === "outgoingCalls" /* CallHierarchyDirection.CallsFrom */) {
                // outgoing calls: show caller and highlight focused calls
                previewUri = element.parent ? element.parent.item.uri : element.model.root.uri;
            }
            else {
                // incoming calls: show caller and highlight focused calls
                previewUri = element.item.uri;
            }
            const value = await this._textModelService.createModelReference(previewUri);
            this._editor.setModel(value.object.textEditorModel);
            // set decorations for caller ranges (if in the same file)
            const decorations = [];
            let fullRange;
            let locations = element.locations;
            if (!locations) {
                locations = [{ uri: element.item.uri, range: element.item.selectionRange }];
            }
            for (const loc of locations) {
                if (loc.uri.toString() === previewUri.toString()) {
                    decorations.push({ range: loc.range, options });
                    fullRange = !fullRange ? loc.range : range_1.Range.plusRange(loc.range, fullRange);
                }
            }
            if (fullRange) {
                this._editor.revealRangeInCenter(fullRange, 1 /* ScrollType.Immediate */);
                const decorationsCollection = this._editor.createDecorationsCollection(decorations);
                this._previewDisposable.add((0, lifecycle_1.toDisposable)(() => decorationsCollection.clear()));
            }
            this._previewDisposable.add(value);
            // update: title
            const title = this._direction === "outgoingCalls" /* CallHierarchyDirection.CallsFrom */
                ? (0, nls_1.localize)('callFrom', "Calls from '{0}'", element.model.root.name)
                : (0, nls_1.localize)('callsTo', "Callers of '{0}'", element.model.root.name);
            this.setTitle(title);
        }
        showLoading() {
            this._parent.dataset['state'] = "loading" /* State.Loading */;
            this.setTitle((0, nls_1.localize)('title.loading', "Loading..."));
            this._show();
        }
        showMessage(message) {
            this._parent.dataset['state'] = "message" /* State.Message */;
            this.setTitle('');
            this.setMetaTitle('');
            this._message.innerText = message;
            this._show();
            this._message.focus();
        }
        async showModel(model) {
            this._show();
            const viewState = this._treeViewStates.get(this._direction);
            await this._tree.setInput(model, viewState);
            const root = this._tree.getNode(model).children[0];
            await this._tree.expand(root.element);
            if (root.children.length === 0) {
                //
                this.showMessage(this._direction === "outgoingCalls" /* CallHierarchyDirection.CallsFrom */
                    ? (0, nls_1.localize)('empt.callsFrom', "No calls from '{0}'", model.root.name)
                    : (0, nls_1.localize)('empt.callsTo', "No callers of '{0}'", model.root.name));
            }
            else {
                this._parent.dataset['state'] = "data" /* State.Data */;
                if (!viewState || this._tree.getFocus().length === 0) {
                    this._tree.setFocus([root.children[0].element]);
                }
                this._tree.domFocus();
                this._updatePreview();
            }
        }
        getModel() {
            return this._tree.getInput();
        }
        getFocused() {
            return this._tree.getFocus()[0];
        }
        async updateDirection(newDirection) {
            const model = this._tree.getInput();
            if (model && newDirection !== this._direction) {
                this._treeViewStates.set(this._direction, this._tree.getViewState());
                this._direction = newDirection;
                await this.showModel(model);
            }
        }
        _show() {
            if (!this._isShowing) {
                this.editor.revealLineInCenterIfOutsideViewport(this._where.lineNumber, 0 /* ScrollType.Smooth */);
                super.show(range_1.Range.fromPositions(this._where), this._layoutInfo.height);
            }
        }
        _onWidth(width) {
            if (this._dim) {
                this._doLayoutBody(this._dim.height, width);
            }
        }
        _doLayoutBody(height, width) {
            if (this._dim.height !== height || this._dim.width !== width) {
                super._doLayoutBody(height, width);
                this._dim = new dom_1.Dimension(width, height);
                this._layoutInfo.height = this._viewZone ? this._viewZone.heightInLines : this._layoutInfo.height;
                this._splitView.layout(width);
                this._splitView.resizeView(0, width * this._layoutInfo.ratio);
            }
        }
    };
    exports.CallHierarchyTreePeekWidget = CallHierarchyTreePeekWidget;
    exports.CallHierarchyTreePeekWidget = CallHierarchyTreePeekWidget = CallHierarchyTreePeekWidget_1 = __decorate([
        __param(3, themeService_1.IThemeService),
        __param(4, peekView.IPeekViewService),
        __param(5, editorService_1.IEditorService),
        __param(6, resolverService_1.ITextModelService),
        __param(7, storage_1.IStorageService),
        __param(8, actions_1.IMenuService),
        __param(9, contextkey_1.IContextKeyService),
        __param(10, instantiation_1.IInstantiationService)
    ], CallHierarchyTreePeekWidget);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsbEhpZXJhcmNoeVBlZWsuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jYWxsSGllcmFyY2h5L2Jyb3dzZXIvY2FsbEhpZXJhcmNoeVBlZWsudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQWtDaEcsSUFBVyxLQUlWO0lBSkQsV0FBVyxLQUFLO1FBQ2YsNEJBQW1CLENBQUE7UUFDbkIsNEJBQW1CLENBQUE7UUFDbkIsc0JBQWEsQ0FBQTtJQUNkLENBQUMsRUFKVSxLQUFLLEtBQUwsS0FBSyxRQUlmO0lBRUQsTUFBTSxVQUFVO1FBRWYsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFnQixFQUFFLGNBQStCO1lBQzdELGNBQWMsQ0FBQyxLQUFLLENBQUMseUJBQXlCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsOERBQThDLENBQUM7UUFDcEgsQ0FBQztRQUVELE1BQU0sQ0FBQyxRQUFRLENBQUMsY0FBK0I7WUFDOUMsTUFBTSxLQUFLLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsZ0NBQXdCLElBQUksQ0FBQyxDQUFDO1lBQ3hGLE1BQU0sV0FBVyxHQUFlLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLENBQUM7WUFDM0QsSUFBSTtnQkFDSCxPQUFPLEVBQUUsR0FBRyxXQUFXLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7YUFDaEQ7WUFBQyxNQUFNO2dCQUNQLE9BQU8sV0FBVyxDQUFDO2FBQ25CO1FBQ0YsQ0FBQztRQUVELFlBQ1EsS0FBYSxFQUNiLE1BQWM7WUFEZCxVQUFLLEdBQUwsS0FBSyxDQUFRO1lBQ2IsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUNsQixDQUFDO0tBQ0w7SUFFRCxNQUFNLGlC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