/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/browser/notebookBrowser"], function (require, exports, notebookCommon_1, notebookBrowser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ffc = void 0;
    class $Ffc {
        constructor(resource, b, c, d, e, f, g, h, i) {
            this.resource = resource;
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.type = 0 /* UndoRedoElementType.Resource */;
            this.label = 'Join Cell';
            this.code = 'undoredo.notebooks.joinCell';
            this.a = this.h.model;
        }
        async undo() {
            if (!this.i.insertCell || !this.i.createCellViewModel) {
                throw new Error('Notebook Insert Cell not implemented for Undo/Redo');
            }
            await this.d.resolveTextModel();
            this.d.textModel?.applyEdits([
                { range: this.f, text: '' }
            ]);
            this.d.setSelections(this.e);
            const cell = this.i.createCellViewModel(this.a);
            if (this.c === 'above') {
                this.i.insertCell(this.b, this.a, { kind: notebookCommon_1.SelectionStateType.Handle, primary: cell.handle, selections: [cell.handle] });
                cell.focusMode = notebookBrowser_1.CellFocusMode.Editor;
            }
            else {
                this.i.insertCell(this.b, cell.model, { kind: notebookCommon_1.SelectionStateType.Handle, primary: this.d.handle, selections: [this.d.handle] });
                this.d.focusMode = notebookBrowser_1.CellFocusMode.Editor;
            }
        }
        async redo() {
            if (!this.i.deleteCell) {
                throw new Error('Notebook Delete Cell not implemented for Undo/Redo');
            }
            await this.d.resolveTextModel();
            this.d.textModel?.applyEdits([
                { range: this.f, text: this.g }
            ]);
            this.i.deleteCell(this.b, { kind: notebookCommon_1.SelectionStateType.Handle, primary: this.d.handle, selections: [this.d.handle] });
            this.d.focusMode = notebookBrowser_1.CellFocusMode.Editor;
        }
    }
    exports.$Ffc = $Ffc;
});
//# sourceMappingURL=cellEdit.js.map