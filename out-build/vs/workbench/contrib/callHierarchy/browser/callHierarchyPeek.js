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
define(["require", "exports", "vs/editor/contrib/peekView/browser/peekView", "vs/platform/instantiation/common/instantiation", "vs/platform/list/browser/listService", "vs/workbench/contrib/callHierarchy/browser/callHierarchyTree", "vs/nls!vs/workbench/contrib/callHierarchy/browser/callHierarchyPeek", "vs/editor/common/core/range", "vs/base/browser/ui/splitview/splitview", "vs/base/browser/dom", "vs/base/common/event", "vs/workbench/services/editor/common/editorService", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/editor/common/services/resolverService", "vs/base/common/lifecycle", "vs/editor/common/model", "vs/platform/theme/common/themeService", "vs/platform/storage/common/storage", "vs/base/common/color", "vs/base/browser/ui/tree/tree", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/css!./media/callHierarchy"], function (require, exports, peekView, instantiation_1, listService_1, callHTree, nls_1, range_1, splitview_1, dom_1, event_1, editorService_1, embeddedCodeEditorWidget_1, resolverService_1, lifecycle_1, model_1, themeService_1, storage_1, color_1, tree_1, actions_1, contextkey_1, menuEntryActionViewItem_1) {
    "use strict";
    var $jZb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$jZb = void 0;
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
    class CallHierarchyTree extends listService_1.$w4 {
    }
    let $jZb = class $jZb extends peekView.$I3 {
        static { $jZb_1 = this; }
        static { this.TitleMenu = new actions_1.$Ru('callhierarchy/title'); }
        constructor(editor, t, v, themeService, T, cb, db, eb, fb, gb, hb) {
            super(editor, { showFrame: true, showArrow: true, isResizeable: true, isAccessible: true }, hb);
            this.t = t;
            this.v = v;
            this.T = T;
            this.cb = cb;
            this.db = db;
            this.eb = eb;
            this.fb = fb;
            this.gb = gb;
            this.hb = hb;
            this.i = new Map();
            this.r = new lifecycle_1.$jc();
            this.create();
            this.T.addExclusiveWidget(editor, this);
            this.ib(themeService.getColorTheme());
            this.o.add(themeService.onDidColorThemeChange(this.ib, this));
            this.o.add(this.r);
        }
        dispose() {
            LayoutInfo.store(this.p, this.eb);
            this.c.dispose();
            this.d.dispose();
            this.l.dispose();
            super.dispose();
        }
        get direction() {
            return this.v;
        }
        ib(theme) {
            const borderColor = theme.getColor(peekView.$M3) || color_1.$Os.transparent;
            this.style({
                arrowColor: borderColor,
                frameColor: borderColor,
                headerBackgroundColor: theme.getColor(peekView.$J3) || color_1.$Os.transparent,
                primaryHeadingColor: theme.getColor(peekView.$K3),
                secondaryHeadingColor: theme.getColor(peekView.$L3)
            });
        }
        U(container) {
            super.U(container, true);
            const menu = this.fb.createMenu($jZb_1.TitleMenu, this.gb);
            const updateToolbar = () => {
                const actions = [];
                (0, menuEntryActionViewItem_1.$B3)(menu, undefined, actions);
                this.O.clear();
                this.O.push(actions, { label: false, icon: true });
            };
            this.o.add(menu);
            this.o.add(menu.onDidChange(updateToolbar));
            updateToolbar();
        }
        Y(parent) {
            this.p = LayoutInfo.retrieve(this.eb);
            this.m = new dom_1.$BO(0, 0);
            this.a = parent;
            parent.classList.add('call-hierarchy');
            const message = document.createElement('div');
            message.classList.add('message');
            parent.appendChild(message);
            this.b = message;
            this.b.tabIndex = 0;
            const container = document.createElement('div');
            container.classList.add('results');
            parent.appendChild(container);
            this.c = new splitview_1.$bR(container, { orientation: 1 /* Orientation.HORIZONTAL */ });
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
            this.l = this.hb.createInstance(embeddedCodeEditorWidget_1.$w3, editorContainer, editorOptions, {}, this.editor);
            // tree stuff
            const treeContainer = document.createElement('div');
            treeContainer.classList.add('tree');
            container.appendChild(treeContainer);
            const options = {
                sorter: new callHTree.$eZb(),
                accessibilityProvider: new callHTree.$iZb(() => this.v),
                identityProvider: new callHTree.$fZb(() => this.v),
                expandOnlyOnTwistieClick: true,
                overrideStyles: {
                    listBackground: peekView.$N3
                }
            };
            this.d = this.hb.createInstance(CallHierarchyTree, 'CallHierarchyPeek', treeContainer, new callHTree.$hZb(), [this.hb.createInstance(callHTree.$gZb)], this.hb.createInstance(callHTree.$dZb, () => this.v), options);
            // split stuff
            this.c.addView({
                onDidChange: event_1.Event.None,
                element: editorContainer,
                minimumSize: 200,
                maximumSize: Number.MAX_VALUE,
                layout: (width) => {
                    if (this.m.height) {
                        this.l.layout({ height: this.m.height, width });
                    }
                }
            }, splitview_1.Sizing.Distribute);
            this.c.addView({
                onDidChange: event_1.Event.None,
                element: treeContainer,
                minimumSize: 100,
                maximumSize: Number.MAX_VALUE,
                layout: (width) => {
                    if (this.m.height) {
                        this.d.layout(this.m.height, width);
                    }
                }
            }, splitview_1.Sizing.Distribute);
            this.o.add(this.c.onDidSashChange(() => {
                if (this.m.width) {
                    this.p.ratio = this.c.getViewSize(0) / this.m.width;
                }
            }));
            // update editor
            this.o.add(this.d.onDidChangeFocus(this.lb, this));
            this.o.add(this.l.onMouseDown(e => {
                const { event, target } = e;
                if (event.detail !== 2) {
                    return;
                }
                const [focus] = this.d.getFocus();
                if (!focus) {
                    return;
                }
                this.dispose();
                this.cb.openEditor({
                    resource: focus.item.uri,
                    options: { selection: target.range }
                });
            }));
            this.o.add(this.d.onMouseDblClick(e => {
                if (e.target === tree_1.TreeMouseEventTarget.Twistie) {
                    return;
                }
                if (e.element) {
                    this.dispose();
                    this.cb.openEditor({
                        resource: e.element.item.uri,
                        options: { selection: e.element.item.selectionRange, pinned: true }
                    });
                }
            }));
            this.o.add(this.d.onDidChangeSelection(e => {
                const [element] = e.elements;
                // don't close on click
                if (element && e.browserEvent instanceof KeyboardEvent) {
                    this.dispose();
                    this.cb.openEditor({
                        resource: element.item.uri,
                        options: { selection: element.item.selectionRange, pinned: true }
                    });
                }
            }));
        }
        async lb() {
            const [element] = this.d.getFocus();
            if (!element) {
                return;
            }
            this.r.clear();
            // update: editor and editor highlights
            const options = {
                description: 'call-hierarchy-decoration',
                stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
                className: 'call-decoration',
                overviewRuler: {
                    color: (0, themeService_1.$hv)(peekView.$W3),
                    position: model_1.OverviewRulerLane.Center
                },
            };
            let previewUri;
            if (this.v === "outgoingCalls" /* CallHierarchyDirection.CallsFrom */) {
                // outgoing calls: show caller and highlight focused calls
                previewUri = element.parent ? element.parent.item.uri : element.model.root.uri;
            }
            else {
                // incoming calls: show caller and highlight focused calls
                previewUri = element.item.uri;
            }
            const value = await this.db.createModelReference(previewUri);
            this.l.setModel(value.object.textEditorModel);
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
                    fullRange = !fullRange ? loc.range : range_1.$ks.plusRange(loc.range, fullRange);
                }
            }
            if (fullRange) {
                this.l.revealRangeInCenter(fullRange, 1 /* ScrollType.Immediate */);
                const decorationsCollection = this.l.createDecorationsCollection(decorations);
                this.r.add((0, lifecycle_1.$ic)(() => decorationsCollection.clear()));
            }
            this.r.add(value);
            // update: title
            const title = this.v === "outgoingCalls" /* CallHierarchyDirection.CallsFrom */
                ? (0, nls_1.localize)(0, null, element.model.root.name)
                : (0, nls_1.localize)(1, null, element.model.root.name);
            this.setTitle(title);
        }
        showLoading() {
            this.a.dataset['state'] = "loading" /* State.Loading */;
            this.setTitle((0, nls_1.localize)(2, null));
            this.mb();
        }
        showMessage(message) {
            this.a.dataset['state'] = "message" /* State.Message */;
            this.setTitle('');
            this.setMetaTitle('');
            this.b.innerText = message;
            this.mb();
            this.b.focus();
        }
        async showModel(model) {
            this.mb();
            const viewState = this.i.get(this.v);
            await this.d.setInput(model, viewState);
            const root = this.d.getNode(model).children[0];
            await this.d.expand(root.element);
            if (root.children.length === 0) {
                //
                this.showMessage(this.v === "outgoingCalls" /* CallHierarchyDirection.CallsFrom */
                    ? (0, nls_1.localize)(3, null, model.root.name)
                    : (0, nls_1.localize)(4, null, model.root.name));
            }
            else {
                this.a.dataset['state'] = "data" /* State.Data */;
                if (!viewState || this.d.getFocus().length === 0) {
                    this.d.setFocus([root.children[0].element]);
                }
                this.d.domFocus();
                this.lb();
            }
        }
        getModel() {
            return this.d.getInput();
        }
        getFocused() {
            return this.d.getFocus()[0];
        }
        async updateDirection(newDirection) {
            const model = this.d.getInput();
            if (model && newDirection !== this.v) {
                this.i.set(this.v, this.d.getViewState());
                this.v = newDirection;
                await this.showModel(model);
            }
        }
        mb() {
            if (!this.z) {
                this.editor.revealLineInCenterIfOutsideViewport(this.t.lineNumber, 0 /* ScrollType.Smooth */);
                super.show(range_1.$ks.fromPositions(this.t), this.p.height);
            }
        }
        F(width) {
            if (this.m) {
                this.bb(this.m.height, width);
            }
        }
        bb(height, width) {
            if (this.m.height !== height || this.m.width !== width) {
                super.bb(height, width);
                this.m = new dom_1.$BO(width, height);
                this.p.height = this.n ? this.n.heightInLines : this.p.height;
                this.c.layout(width);
                this.c.resizeView(0, width * this.p.ratio);
            }
        }
    };
    exports.$jZb = $jZb;
    exports.$jZb = $jZb = $jZb_1 = __decorate([
        __param(3, themeService_1.$gv),
        __param(4, peekView.$G3),
        __param(5, editorService_1.$9C),
        __param(6, resolverService_1.$uA),
        __param(7, storage_1.$Vo),
        __param(8, actions_1.$Su),
        __param(9, contextkey_1.$3i),
        __param(10, instantiation_1.$Ah)
    ], $jZb);
});
//# sourceMappingURL=callHierarchyPeek.js.map