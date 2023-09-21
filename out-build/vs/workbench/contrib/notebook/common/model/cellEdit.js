/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$LH = exports.$KH = exports.$JH = void 0;
    class $JH {
        constructor(resource, a, b, c, d, e, f) {
            this.resource = resource;
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
            this.type = 0 /* UndoRedoElementType.Resource */;
            this.label = 'Move Cell';
            this.code = 'undoredo.notebooks.moveCell';
        }
        undo() {
            if (!this.d.moveCell) {
                throw new Error('Notebook Move Cell not implemented for Undo/Redo');
            }
            this.d.moveCell(this.c, this.b, this.a, this.f, this.e);
        }
        redo() {
            if (!this.d.moveCell) {
                throw new Error('Notebook Move Cell not implemented for Undo/Redo');
            }
            this.d.moveCell(this.a, this.b, this.c, this.e, this.f);
        }
    }
    exports.$JH = $JH;
    class $KH {
        constructor(resource, a, b, c, d) {
            this.resource = resource;
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.type = 0 /* UndoRedoElementType.Resource */;
            this.label = 'Insert Cell';
            this.code = 'undoredo.notebooks.insertCell';
        }
        undo() {
            if (!this.b.replaceCell) {
                throw new Error('Notebook Replace Cell not implemented for Undo/Redo');
            }
            this.a.forEach(diff => {
                this.b.replaceCell(diff[0], diff[2].length, diff[1], this.c);
            });
        }
        redo() {
            if (!this.b.replaceCell) {
                throw new Error('Notebook Replace Cell not implemented for Undo/Redo');
            }
            this.a.reverse().forEach(diff => {
                this.b.replaceCell(diff[0], diff[1].length, diff[2], this.d);
            });
        }
    }
    exports.$KH = $KH;
    class $LH {
        constructor(resource, index, oldMetadata, newMetadata, a) {
            this.resource = resource;
            this.index = index;
            this.oldMetadata = oldMetadata;
            this.newMetadata = newMetadata;
            this.a = a;
            this.type = 0 /* UndoRedoElementType.Resource */;
            this.label = 'Update Cell Metadata';
            this.code = 'undoredo.notebooks.updateCellMetadata';
        }
        undo() {
            if (!this.a.updateCellMetadata) {
                return;
            }
            this.a.updateCellMetadata(this.index, this.oldMetadata);
        }
        redo() {
            if (!this.a.updateCellMetadata) {
                return;
            }
            this.a.updateCellMetadata(this.index, this.newMetadata);
        }
    }
    exports.$LH = $LH;
});
//# sourceMappingURL=cellEdit.js.map