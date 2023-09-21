/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/collections", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/types", "vs/workbench/contrib/notebook/common/notebookRange"], function (require, exports, collections_1, event_1, lifecycle_1, types_1, notebookRange_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$wFb = void 0;
    class $wFb extends lifecycle_1.$kc {
        get visibleCells() {
            return this.c;
        }
        constructor(f) {
            super();
            this.f = f;
            this.a = this.B(new event_1.$fd());
            this.onDidChangeVisibleCells = this.a.event;
            this.b = this.B(new lifecycle_1.$jc());
            this.c = [];
            this.B(this.f.onDidChangeVisibleRanges(this.j, this));
            this.B(this.f.onDidChangeModel(this.g, this));
            this.j();
        }
        g() {
            this.b.clear();
            if (this.f.hasModel()) {
                this.b.add(this.f.onDidChangeViewCells(() => this.h()));
            }
            this.h();
        }
        h() {
            this.a.fire({ added: [], removed: Array.from(this.c) });
            this.c = [];
            this.j();
        }
        j() {
            if (!this.f.hasModel()) {
                return;
            }
            const newVisibleCells = (0, notebookRange_1.$PH)(this.f.visibleRanges)
                .map(index => this.f.cellAt(index))
                .filter(types_1.$rf);
            const newVisibleHandles = new Set(newVisibleCells.map(cell => cell.handle));
            const oldVisibleHandles = new Set(this.c.map(cell => cell.handle));
            const diff = (0, collections_1.$J)(oldVisibleHandles, newVisibleHandles);
            const added = diff.added
                .map(handle => this.f.getCellByHandle(handle))
                .filter(types_1.$rf);
            const removed = diff.removed
                .map(handle => this.f.getCellByHandle(handle))
                .filter(types_1.$rf);
            this.c = newVisibleCells;
            this.a.fire({
                added,
                removed
            });
        }
    }
    exports.$wFb = $wFb;
});
//# sourceMappingURL=notebookVisibleCellObserver.js.map