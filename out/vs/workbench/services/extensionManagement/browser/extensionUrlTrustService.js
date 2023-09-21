/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/extensionManagement/common/extensionUrlTrust", "vs/platform/instantiation/common/extensions"], function (require, exports, extensionUrlTrust_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ExtensionUrlTrustService {
        async isExtensionUrlTrusted() {
            return false;
        }
    }
    (0, extensions_1.registerSingleton)(extensionUrlTrust_1.IExtensionUrlTrustService, ExtensionUrlTrustService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uVXJsVHJ1c3RTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2V4dGVuc2lvbk1hbmFnZW1lbnQvYnJvd3Nlci9leHRlbnNpb25VcmxUcnVzdFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFLaEcsTUFBTSx3QkFBd0I7UUFJN0IsS0FBSyxDQUFDLHFCQUFxQjtZQUMxQixPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7S0FDRDtJQUVELElBQUEsOEJBQWlCLEVBQUMsNkNBQXlCLEVBQUUsd0JBQXdCLG9DQUE0QixDQUFDIn0=