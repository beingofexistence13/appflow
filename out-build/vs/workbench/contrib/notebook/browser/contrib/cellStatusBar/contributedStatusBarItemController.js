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
define(["require", "exports", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/notebookVisibleCellObserver", "vs/workbench/contrib/notebook/browser/notebookEditorExtensions", "vs/workbench/contrib/notebook/common/notebookCellStatusBarService"], function (require, exports, async_1, cancellation_1, lifecycle_1, notebookVisibleCellObserver_1, notebookEditorExtensions_1, notebookCellStatusBarService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$xFb = void 0;
    let $xFb = class $xFb extends lifecycle_1.$kc {
        static { this.id = 'workbench.notebook.statusBar.contributed'; }
        constructor(c, f) {
            super();
            this.c = c;
            this.f = f;
            this.a = new Map();
            this.b = this.B(new notebookVisibleCellObserver_1.$wFb(this.c));
            this.B(this.b.onDidChangeVisibleCells(this.h, this));
            this.g();
            this.B(this.f.onDidChangeProviders(this.g, this));
            this.B(this.f.onDidChangeItems(this.g, this));
        }
        g() {
            const newCells = this.b.visibleCells.filter(cell => !this.a.has(cell.handle));
            const visibleCellHandles = new Set(this.b.visibleCells.map(item => item.handle));
            const currentCellHandles = Array.from(this.a.keys());
            const removedCells = currentCellHandles.filter(handle => !visibleCellHandles.has(handle));
            const itemsToUpdate = currentCellHandles.filter(handle => visibleCellHandles.has(handle));
            this.h({ added: newCells, removed: removedCells.map(handle => ({ handle })) });
            itemsToUpdate.forEach(handle => this.a.get(handle)?.update());
        }
        h(e) {
            const vm = this.c.getViewModel();
            if (!vm) {
                return;
            }
            for (const newCell of e.added) {
                const helper = new CellStatusBarHelper(vm, newCell, this.f);
                this.a.set(newCell.handle, helper);
            }
            for (const oldCell of e.removed) {
                this.a.get(oldCell.handle)?.dispose();
                this.a.delete(oldCell.handle);
            }
        }
        dispose() {
            super.dispose();
            this.a.forEach(cell => cell.dispose());
            this.a.clear();
        }
    };
    exports.$xFb = $xFb;
    exports.$xFb = $xFb = __decorate([
        __param(1, notebookCellStatusBarService_1.$Qmb)
    ], $xFb);
    class CellStatusBarHelper extends lifecycle_1.$kc {
        constructor(g, h, j) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.a = [];
            this.b = [];
            this.f = this.B(new async_1.$Ag());
            this.B((0, lifecycle_1.$ic)(() => this.c?.dispose(true)));
            this.m();
            this.B(this.h.model.onDidChangeContent(() => this.m()));
            this.B(this.h.model.onDidChangeLanguage(() => this.m()));
            this.B(this.h.model.onDidChangeMetadata(() => this.m()));
            this.B(this.h.model.onDidChangeInternalMetadata(() => this.m()));
            this.B(this.h.model.onDidChangeOutputs(() => this.m()));
        }
        update() {
            this.m();
        }
        m() {
            // Wait a tick to make sure that the event is fired to the EH before triggering status bar providers
            this.B((0, async_1.$Ig)(() => {
                this.f.queue(() => this.n());
            }, 0));
        }
        async n() {
            const cellIndex = this.g.getCellIndex(this.h);
            const docUri = this.g.notebookDocument.uri;
            const viewType = this.g.notebookDocument.viewType;
            this.c?.dispose(true);
            const tokenSource = this.c = new cancellation_1.$pd();
            const itemLists = await this.j.getStatusBarItemsForCell(docUri, cellIndex, viewType, tokenSource.token);
            if (tokenSource.token.isCancellationRequested) {
                itemLists.forEach(itemList => itemList.dispose && itemList.dispose());
                return;
            }
            const items = itemLists.map(itemList => itemList.items).flat();
            const newIds = this.g.deltaCellStatusBarItems(this.a, [{ handle: this.h.handle, items }]);
            this.b.forEach(itemList => itemList.dispose && itemList.dispose());
            this.b = itemLists;
            this.a = newIds;
        }
        dispose() {
            super.dispose();
            this.c?.dispose(true);
            this.g.deltaCellStatusBarItems(this.a, [{ handle: this.h.handle, items: [] }]);
            this.b.forEach(itemList => itemList.dispose && itemList.dispose());
        }
    }
    (0, notebookEditorExtensions_1.$Fnb)($xFb.id, $xFb);
});
//# sourceMappingURL=contributedStatusBarItemController.js.map