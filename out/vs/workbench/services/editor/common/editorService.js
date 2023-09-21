/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/editor/common/editorGroupsService"], function (require, exports, instantiation_1, editorGroupsService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isPreferredGroup = exports.SIDE_GROUP = exports.ACTIVE_GROUP = exports.IEditorService = void 0;
    exports.IEditorService = (0, instantiation_1.createDecorator)('editorService');
    /**
     * Open an editor in the currently active group.
     */
    exports.ACTIVE_GROUP = -1;
    /**
     * Open an editor to the side of the active group.
     */
    exports.SIDE_GROUP = -2;
    function isPreferredGroup(obj) {
        const candidate = obj;
        return typeof obj === 'number' || (0, editorGroupsService_1.isEditorGroup)(candidate);
    }
    exports.isPreferredGroup = isPreferredGroup;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9lZGl0b3IvY29tbW9uL2VkaXRvclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBWW5GLFFBQUEsY0FBYyxHQUFHLElBQUEsK0JBQWUsRUFBaUIsZUFBZSxDQUFDLENBQUM7SUFFL0U7O09BRUc7SUFDVSxRQUFBLFlBQVksR0FBRyxDQUFDLENBQUMsQ0FBQztJQUcvQjs7T0FFRztJQUNVLFFBQUEsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBSzdCLFNBQWdCLGdCQUFnQixDQUFDLEdBQVk7UUFDNUMsTUFBTSxTQUFTLEdBQUcsR0FBaUMsQ0FBQztRQUVwRCxPQUFPLE9BQU8sR0FBRyxLQUFLLFFBQVEsSUFBSSxJQUFBLG1DQUFhLEVBQUMsU0FBUyxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUpELDRDQUlDIn0=