/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UndoRedoSource = exports.UndoRedoGroup = exports.ResourceEditStackSnapshot = exports.UndoRedoElementType = exports.IUndoRedoService = void 0;
    exports.IUndoRedoService = (0, instantiation_1.createDecorator)('undoRedoService');
    var UndoRedoElementType;
    (function (UndoRedoElementType) {
        UndoRedoElementType[UndoRedoElementType["Resource"] = 0] = "Resource";
        UndoRedoElementType[UndoRedoElementType["Workspace"] = 1] = "Workspace";
    })(UndoRedoElementType || (exports.UndoRedoElementType = UndoRedoElementType = {}));
    class ResourceEditStackSnapshot {
        constructor(resource, elements) {
            this.resource = resource;
            this.elements = elements;
        }
    }
    exports.ResourceEditStackSnapshot = ResourceEditStackSnapshot;
    class UndoRedoGroup {
        static { this._ID = 0; }
        constructor() {
            this.id = UndoRedoGroup._ID++;
            this.order = 1;
        }
        nextOrder() {
            if (this.id === 0) {
                return 0;
            }
            return this.order++;
        }
        static { this.None = new UndoRedoGroup(); }
    }
    exports.UndoRedoGroup = UndoRedoGroup;
    class UndoRedoSource {
        static { this._ID = 0; }
        constructor() {
            this.id = UndoRedoSource._ID++;
            this.order = 1;
        }
        nextOrder() {
            if (this.id === 0) {
                return 0;
            }
            return this.order++;
        }
        static { this.None = new UndoRedoSource(); }
    }
    exports.UndoRedoSource = UndoRedoSource;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5kb1JlZG8uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS91bmRvUmVkby9jb21tb24vdW5kb1JlZG8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTW5GLFFBQUEsZ0JBQWdCLEdBQUcsSUFBQSwrQkFBZSxFQUFtQixpQkFBaUIsQ0FBQyxDQUFDO0lBRXJGLElBQWtCLG1CQUdqQjtJQUhELFdBQWtCLG1CQUFtQjtRQUNwQyxxRUFBUSxDQUFBO1FBQ1IsdUVBQVMsQ0FBQTtJQUNWLENBQUMsRUFIaUIsbUJBQW1CLG1DQUFuQixtQkFBbUIsUUFHcEM7SUFxRUQsTUFBYSx5QkFBeUI7UUFDckMsWUFDaUIsUUFBYSxFQUNiLFFBQWtCO1lBRGxCLGFBQVEsR0FBUixRQUFRLENBQUs7WUFDYixhQUFRLEdBQVIsUUFBUSxDQUFVO1FBQy9CLENBQUM7S0FDTDtJQUxELDhEQUtDO0lBRUQsTUFBYSxhQUFhO2lCQUNWLFFBQUcsR0FBRyxDQUFDLENBQUM7UUFLdkI7WUFDQyxJQUFJLENBQUMsRUFBRSxHQUFHLGFBQWEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUM5QixJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNoQixDQUFDO1FBRU0sU0FBUztZQUNmLElBQUksSUFBSSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQUU7Z0JBQ2xCLE9BQU8sQ0FBQyxDQUFDO2FBQ1Q7WUFDRCxPQUFPLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNyQixDQUFDO2lCQUVhLFNBQUksR0FBRyxJQUFJLGFBQWEsRUFBRSxDQUFDOztJQWxCMUMsc0NBbUJDO0lBRUQsTUFBYSxjQUFjO2lCQUNYLFFBQUcsR0FBRyxDQUFDLENBQUM7UUFLdkI7WUFDQyxJQUFJLENBQUMsRUFBRSxHQUFHLGNBQWMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUMvQixJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNoQixDQUFDO1FBRU0sU0FBUztZQUNmLElBQUksSUFBSSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQUU7Z0JBQ2xCLE9BQU8sQ0FBQyxDQUFDO2FBQ1Q7WUFDRCxPQUFPLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNyQixDQUFDO2lCQUVhLFNBQUksR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDOztJQWxCM0Msd0NBbUJDIn0=