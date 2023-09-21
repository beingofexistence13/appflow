/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$zu = exports.$yu = exports.$xu = exports.UndoRedoElementType = exports.$wu = void 0;
    exports.$wu = (0, instantiation_1.$Bh)('undoRedoService');
    var UndoRedoElementType;
    (function (UndoRedoElementType) {
        UndoRedoElementType[UndoRedoElementType["Resource"] = 0] = "Resource";
        UndoRedoElementType[UndoRedoElementType["Workspace"] = 1] = "Workspace";
    })(UndoRedoElementType || (exports.UndoRedoElementType = UndoRedoElementType = {}));
    class $xu {
        constructor(resource, elements) {
            this.resource = resource;
            this.elements = elements;
        }
    }
    exports.$xu = $xu;
    class $yu {
        static { this.a = 0; }
        constructor() {
            this.id = $yu.a++;
            this.b = 1;
        }
        nextOrder() {
            if (this.id === 0) {
                return 0;
            }
            return this.b++;
        }
        static { this.None = new $yu(); }
    }
    exports.$yu = $yu;
    class $zu {
        static { this.a = 0; }
        constructor() {
            this.id = $zu.a++;
            this.b = 1;
        }
        nextOrder() {
            if (this.id === 0) {
                return 0;
            }
            return this.b++;
        }
        static { this.None = new $zu(); }
    }
    exports.$zu = $zu;
});
//# sourceMappingURL=undoRedo.js.map