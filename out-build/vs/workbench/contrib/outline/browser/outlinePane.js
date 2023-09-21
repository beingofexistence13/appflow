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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/progressbar/progressbar", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/map", "vs/nls!vs/workbench/contrib/outline/browser/outlinePane", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/list/browser/listService", "vs/platform/storage/common/storage", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/services/editor/common/editorService", "vs/base/common/resources", "vs/workbench/common/views", "vs/platform/opener/common/opener", "vs/platform/telemetry/common/telemetry", "./outlineViewState", "vs/workbench/services/outline/browser/outline", "vs/workbench/common/editor", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/browser/ui/tree/abstractTree", "vs/workbench/contrib/outline/browser/outline", "vs/platform/theme/browser/defaultStyles", "vs/css!./outlinePane"], function (require, exports, dom, progressbar_1, async_1, lifecycle_1, map_1, nls_1, configuration_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, listService_1, storage_1, themeService_1, viewPane_1, editorService_1, resources_1, views_1, opener_1, telemetry_1, outlineViewState_1, outline_1, editor_1, cancellation_1, event_1, abstractTree_1, outline_2, defaultStyles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$FZb = void 0;
    class OutlineTreeSorter {
        constructor(c, order) {
            this.c = c;
            this.order = order;
        }
        compare(a, b) {
            if (this.order === 2 /* OutlineSortOrder.ByKind */) {
                return this.c.compareByType(a, b);
            }
            else if (this.order === 1 /* OutlineSortOrder.ByName */) {
                return this.c.compareByName(a, b);
            }
            else {
                return this.c.compareByPosition(a, b);
            }
        }
    }
    let $FZb = class $FZb extends viewPane_1.$Ieb {
        static { this.Id = 'outline'; }
        constructor(options, Zb, $b, viewDescriptorService, ac, bc, configurationService, keybindingService, contextKeyService, contextMenuService, openerService, themeService, telemetryService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, $b, openerService, themeService, telemetryService);
            this.Zb = Zb;
            this.$b = $b;
            this.ac = ac;
            this.bc = bc;
            this.c = new lifecycle_1.$jc();
            this.f = new lifecycle_1.$jc();
            this.g = new lifecycle_1.$jc();
            this.h = new outlineViewState_1.$EZb();
            this.j = new lifecycle_1.$lc();
            this.ab = new map_1.$Ci(10);
            this.h.restore(this.ac);
            this.c.add(this.h);
            contextKeyService.bufferChangeEvents(() => {
                this.sb = outline_2.$AZb.bindTo(contextKeyService);
                this.Wb = outline_2.$BZb.bindTo(contextKeyService);
                this.Xb = outline_2.$CZb.bindTo(contextKeyService);
                this.Yb = outline_2.$DZb.bindTo(contextKeyService);
            });
            const updateContext = () => {
                this.sb.set(this.h.followCursor);
                this.Wb.set(this.h.filterOnType);
                this.Xb.set(this.h.sortBy);
            };
            updateContext();
            this.c.add(this.h.onDidChange(updateContext));
        }
        dispose() {
            this.c.dispose();
            this.g.dispose();
            this.f.dispose();
            this.j.dispose();
            super.dispose();
        }
        focus() {
            this.t?.domFocus();
        }
        U(container) {
            super.U(container);
            this.m = container;
            container.classList.add('outline-pane');
            const progressContainer = dom.$('.outline-progress');
            this.n = dom.$('.outline-message');
            this.r = new progressbar_1.$YR(progressContainer, defaultStyles_1.$k2);
            this.s = dom.$('.outline-tree');
            dom.$0O(container, progressContainer, this.n, this.s);
            this.c.add(this.onDidChangeBodyVisibility(visible => {
                if (!visible) {
                    // stop everything when not visible
                    this.j.clear();
                    this.g.clear();
                    this.f.clear();
                }
                else if (!this.j.value) {
                    const event = event_1.Event.any(this.bc.onDidActiveEditorChange, this.Zb.onDidChange);
                    this.j.value = event(() => this.gc(this.bc.activeEditorPane));
                    this.gc(this.bc.activeEditorPane);
                }
            }));
        }
        W(height, width) {
            super.W(height, width);
            this.t?.layout(height, width);
            this.L = new dom.$BO(width, height);
        }
        collapseAll() {
            this.t?.collapseAll();
        }
        expandAll() {
            this.t?.expandAll();
        }
        get outlineViewState() {
            return this.h;
        }
        ec(message) {
            this.m.classList.add('message');
            this.r.stop().hide();
            this.n.innerText = message;
        }
        fc(uri) {
            if (this.t) {
                const oldOutline = this.t.getInput();
                if (!uri) {
                    uri = oldOutline?.uri;
                }
                if (oldOutline && uri) {
                    this.ab.set(`${oldOutline.outlineKind}/${uri}`, this.t.getViewState());
                    return true;
                }
            }
            return false;
        }
        gc(pane) {
            this.g.clear();
            if (pane) {
                // react to control changes from within pane (https://github.com/microsoft/vscode/issues/134008)
                this.g.add(pane.onDidChangeControl(() => {
                    this.hc(pane);
                }));
            }
            this.hc(pane);
        }
        async hc(pane) {
            // persist state
            const resource = editor_1.$3E.getOriginalUri(pane?.input);
            const didCapture = this.fc();
            this.f.clear();
            if (!pane || !this.Zb.canCreateOutline(pane) || !resource) {
                return this.ec((0, nls_1.localize)(0, null));
            }
            let loadingMessage;
            if (!didCapture) {
                loadingMessage = new async_1.$Qg(() => {
                    this.ec((0, nls_1.localize)(1, null, (0, resources_1.$fg)(resource)));
                }, 100);
            }
            this.r.infinite().show(500);
            const cts = new cancellation_1.$pd();
            this.f.add((0, lifecycle_1.$ic)(() => cts.dispose(true)));
            const newOutline = await this.Zb.createOutline(pane, 1 /* OutlineTarget.OutlinePane */, cts.token);
            loadingMessage?.dispose();
            if (!newOutline) {
                return;
            }
            if (cts.token.isCancellationRequested) {
                newOutline?.dispose();
                return;
            }
            this.f.add(newOutline);
            this.r.stop().hide();
            const sorter = new OutlineTreeSorter(newOutline.config.comparator, this.h.sortBy);
            const tree = this.$b.createInstance(listService_1.$v4, 'OutlinePane', this.s, newOutline.config.delegate, newOutline.config.renderers, newOutline.config.treeDataSource, {
                ...newOutline.config.options,
                sorter,
                expandOnDoubleClick: false,
                expandOnlyOnTwistieClick: true,
                multipleSelectionSupport: false,
                hideTwistiesOfChildlessElements: true,
                defaultFindMode: this.h.filterOnType ? abstractTree_1.TreeFindMode.Filter : abstractTree_1.TreeFindMode.Highlight,
                overrideStyles: { listBackground: this.Rb() }
            });
            // update tree, listen to changes
            const updateTree = () => {
                if (newOutline.isEmpty) {
                    // no more elements
                    this.ec((0, nls_1.localize)(2, null, (0, resources_1.$fg)(resource)));
                    this.fc(resource);
                    tree.setInput(undefined);
                }
                else if (!tree.getInput()) {
                    // first: init tree
                    this.m.classList.remove('message');
                    const state = this.ab.get(`${newOutline.outlineKind}/${newOutline.uri}`);
                    tree.setInput(newOutline, state && abstractTree_1.$cS.lift(state));
                }
                else {
                    // update: refresh tree
                    this.m.classList.remove('message');
                    tree.updateChildren();
                }
            };
            updateTree();
            this.f.add(newOutline.onDidChange(updateTree));
            tree.findMode = this.h.filterOnType ? abstractTree_1.TreeFindMode.Filter : abstractTree_1.TreeFindMode.Highlight;
            // feature: apply panel background to tree
            this.f.add(this.Ab.onDidChangeLocation(({ views }) => {
                if (views.some(v => v.id === this.id)) {
                    tree.updateOptions({ overrideStyles: { listBackground: this.Rb() } });
                }
            }));
            // feature: filter on type - keep tree and menu in sync
            this.f.add(tree.onDidChangeFindMode(mode => this.h.filterOnType = mode === abstractTree_1.TreeFindMode.Filter));
            // feature: reveal outline selection in editor
            // on change -> reveal/select defining range
            this.f.add(tree.onDidOpen(e => newOutline.reveal(e.element, e.editorOptions, e.sideBySide)));
            // feature: reveal editor selection in outline
            const revealActiveElement = () => {
                if (!this.h.followCursor || !newOutline.activeElement) {
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
            this.f.add(newOutline.onDidChange(revealActiveElement));
            // feature: update view when user state changes
            this.f.add(this.h.onDidChange((e) => {
                this.h.persist(this.ac);
                if (e.filterOnType) {
                    tree.findMode = this.h.filterOnType ? abstractTree_1.TreeFindMode.Filter : abstractTree_1.TreeFindMode.Highlight;
                }
                if (e.followCursor) {
                    revealActiveElement();
                }
                if (e.sortBy) {
                    sorter.order = this.h.sortBy;
                    tree.resort();
                }
            }));
            // feature: expand all nodes when filtering (not when finding)
            let viewState;
            this.f.add(tree.onDidChangeFindPattern(pattern => {
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
                this.Yb.set(tree.getNode(null).children.every(node => !node.collapsible || node.collapsed));
            };
            this.f.add(tree.onDidChangeCollapseState(updateAllCollapsedCtx));
            this.f.add(tree.onDidChangeModel(updateAllCollapsedCtx));
            updateAllCollapsedCtx();
            // last: set tree property and wire it up to one of our context keys
            tree.layout(this.L?.height, this.L?.width);
            this.t = tree;
            this.f.add((0, lifecycle_1.$ic)(() => {
                tree.dispose();
                this.t = undefined;
            }));
        }
    };
    exports.$FZb = $FZb;
    exports.$FZb = $FZb = __decorate([
        __param(1, outline_1.$trb),
        __param(2, instantiation_1.$Ah),
        __param(3, views_1.$_E),
        __param(4, storage_1.$Vo),
        __param(5, editorService_1.$9C),
        __param(6, configuration_1.$8h),
        __param(7, keybinding_1.$2D),
        __param(8, contextkey_1.$3i),
        __param(9, contextView_1.$WZ),
        __param(10, opener_1.$NT),
        __param(11, themeService_1.$gv),
        __param(12, telemetry_1.$9k)
    ], $FZb);
});
//# sourceMappingURL=outlinePane.js.map