/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/views/common/treeViewsService"], function (require, exports, extensions_1, instantiation_1, treeViewsService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ITreeViewsService = void 0;
    exports.ITreeViewsService = (0, instantiation_1.createDecorator)('treeViewsService');
    (0, extensions_1.registerSingleton)(exports.ITreeViewsService, treeViewsService_1.TreeviewsService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZVZpZXdzU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy92aWV3cy9icm93c2VyL3RyZWVWaWV3c1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUW5GLFFBQUEsaUJBQWlCLEdBQUcsSUFBQSwrQkFBZSxFQUFvQixrQkFBa0IsQ0FBQyxDQUFDO0lBQ3hGLElBQUEsOEJBQWlCLEVBQUMseUJBQWlCLEVBQUUsbUNBQWdCLG9DQUE0QixDQUFDIn0=