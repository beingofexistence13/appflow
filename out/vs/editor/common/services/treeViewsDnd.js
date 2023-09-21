/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DraggedTreeItemsIdentifier = exports.TreeViewsDnDService = void 0;
    class TreeViewsDnDService {
        constructor() {
            this._dragOperations = new Map();
        }
        removeDragOperationTransfer(uuid) {
            if ((uuid && this._dragOperations.has(uuid))) {
                const operation = this._dragOperations.get(uuid);
                this._dragOperations.delete(uuid);
                return operation;
            }
            return undefined;
        }
        addDragOperationTransfer(uuid, transferPromise) {
            this._dragOperations.set(uuid, transferPromise);
        }
    }
    exports.TreeViewsDnDService = TreeViewsDnDService;
    class DraggedTreeItemsIdentifier {
        constructor(identifier) {
            this.identifier = identifier;
        }
    }
    exports.DraggedTreeItemsIdentifier = DraggedTreeItemsIdentifier;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZVZpZXdzRG5kLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9zZXJ2aWNlcy90cmVlVmlld3NEbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU2hHLE1BQWEsbUJBQW1CO1FBQWhDO1lBRVMsb0JBQWUsR0FBd0MsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQWMxRSxDQUFDO1FBWkEsMkJBQTJCLENBQUMsSUFBd0I7WUFDbkQsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFO2dCQUM3QyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDakQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2xDLE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1lBQ0QsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUVELHdCQUF3QixDQUFDLElBQVksRUFBRSxlQUF1QztZQUM3RSxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFDakQsQ0FBQztLQUNEO0lBaEJELGtEQWdCQztJQUdELE1BQWEsMEJBQTBCO1FBRXRDLFlBQXFCLFVBQWtCO1lBQWxCLGVBQVUsR0FBVixVQUFVLENBQVE7UUFBSSxDQUFDO0tBQzVDO0lBSEQsZ0VBR0MifQ==