/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/editor/common/services/treeViewsDnd"], function (require, exports, extensions_1, instantiation_1, treeViewsDnd_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ITreeViewsDnDService = void 0;
    exports.ITreeViewsDnDService = (0, instantiation_1.createDecorator)('treeViewsDndService');
    (0, extensions_1.registerSingleton)(exports.ITreeViewsDnDService, treeViewsDnd_1.TreeViewsDnDService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZVZpZXdzRG5kU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vc2VydmljZXMvdHJlZVZpZXdzRG5kU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRbkYsUUFBQSxvQkFBb0IsR0FBRyxJQUFBLCtCQUFlLEVBQXVCLHFCQUFxQixDQUFDLENBQUM7SUFDakcsSUFBQSw4QkFBaUIsRUFBQyw0QkFBb0IsRUFBRSxrQ0FBbUIsb0NBQTRCLENBQUMifQ==