/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "vs/workbench/api/common/extHostVariableResolverService"], function (require, exports, os_1, extHostVariableResolverService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NodeExtHostVariableResolverProviderService = void 0;
    class NodeExtHostVariableResolverProviderService extends extHostVariableResolverService_1.ExtHostVariableResolverProviderService {
        homeDir() {
            return (0, os_1.homedir)();
        }
    }
    exports.NodeExtHostVariableResolverProviderService = NodeExtHostVariableResolverProviderService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFZhcmlhYmxlUmVzb2x2ZXJTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9ub2RlL2V4dEhvc3RWYXJpYWJsZVJlc29sdmVyU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFLaEcsTUFBYSwwQ0FBMkMsU0FBUSx1RUFBc0M7UUFDbEYsT0FBTztZQUN6QixPQUFPLElBQUEsWUFBTyxHQUFFLENBQUM7UUFDbEIsQ0FBQztLQUNEO0lBSkQsZ0dBSUMifQ==