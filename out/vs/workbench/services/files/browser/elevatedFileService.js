/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/workbench/services/files/common/elevatedFileService"], function (require, exports, extensions_1, elevatedFileService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrowserElevatedFileService = void 0;
    class BrowserElevatedFileService {
        isSupported(resource) {
            // Saving elevated is currently not supported in web for as
            // long as we have no generic support from the file service
            // (https://github.com/microsoft/vscode/issues/48659)
            return false;
        }
        async writeFileElevated(resource, value, options) {
            throw new Error('Unsupported');
        }
    }
    exports.BrowserElevatedFileService = BrowserElevatedFileService;
    (0, extensions_1.registerSingleton)(elevatedFileService_1.IElevatedFileService, BrowserElevatedFileService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxldmF0ZWRGaWxlU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9maWxlcy9icm93c2VyL2VsZXZhdGVkRmlsZVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLE1BQWEsMEJBQTBCO1FBSXRDLFdBQVcsQ0FBQyxRQUFhO1lBQ3hCLDJEQUEyRDtZQUMzRCwyREFBMkQ7WUFDM0QscURBQXFEO1lBQ3JELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVELEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxRQUFhLEVBQUUsS0FBMkQsRUFBRSxPQUEyQjtZQUM5SCxNQUFNLElBQUksS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2hDLENBQUM7S0FDRDtJQWRELGdFQWNDO0lBRUQsSUFBQSw4QkFBaUIsRUFBQywwQ0FBb0IsRUFBRSwwQkFBMEIsb0NBQTRCLENBQUMifQ==