/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/testing/common/testId"], function (require, exports, testId_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isCollapsedInSerializedTestTree = void 0;
    /**
     * Gets whether the given test ID is collapsed.
     */
    function isCollapsedInSerializedTestTree(serialized, id) {
        if (!(id instanceof testId_1.TestId)) {
            id = testId_1.TestId.fromString(id);
        }
        let node = serialized;
        for (const part of id.path) {
            if (!node.children?.hasOwnProperty(part)) {
                return undefined;
            }
            node = node.children[part];
        }
        return node.collapsed;
    }
    exports.isCollapsedInSerializedTestTree = isCollapsedInSerializedTestTree;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZ1ZpZXdTdGF0ZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlc3RpbmcvYnJvd3Nlci9leHBsb3JlclByb2plY3Rpb25zL3Rlc3RpbmdWaWV3U3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU2hHOztPQUVHO0lBQ0gsU0FBZ0IsK0JBQStCLENBQUMsVUFBNEMsRUFBRSxFQUFtQjtRQUNoSCxJQUFJLENBQUMsQ0FBQyxFQUFFLFlBQVksZUFBTSxDQUFDLEVBQUU7WUFDNUIsRUFBRSxHQUFHLGVBQU0sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDM0I7UUFFRCxJQUFJLElBQUksR0FBRyxVQUFVLENBQUM7UUFDdEIsS0FBSyxNQUFNLElBQUksSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFO1lBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDekMsT0FBTyxTQUFTLENBQUM7YUFDakI7WUFFRCxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUMzQjtRQUVELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUN2QixDQUFDO0lBZkQsMEVBZUMifQ==