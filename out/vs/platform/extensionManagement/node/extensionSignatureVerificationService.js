/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionSignatureVerificationService = exports.IExtensionSignatureVerificationService = void 0;
    exports.IExtensionSignatureVerificationService = (0, instantiation_1.createDecorator)('IExtensionSignatureVerificationService');
    class ExtensionSignatureVerificationService {
        vsceSign() {
            if (!this.moduleLoadingPromise) {
                this.moduleLoadingPromise = new Promise((resolve, reject) => require(['node-vsce-sign'], async (obj) => {
                    const instance = obj;
                    return resolve(instance);
                }, reject));
            }
            return this.moduleLoadingPromise;
        }
        async verify(vsixFilePath, signatureArchiveFilePath, verbose) {
            let module;
            try {
                module = await this.vsceSign();
            }
            catch (error) {
                return false;
            }
            return module.verify(vsixFilePath, signatureArchiveFilePath, verbose);
        }
    }
    exports.ExtensionSignatureVerificationService = ExtensionSignatureVerificationService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uU2lnbmF0dXJlVmVyaWZpY2F0aW9uU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2V4dGVuc2lvbk1hbmFnZW1lbnQvbm9kZS9leHRlbnNpb25TaWduYXR1cmVWZXJpZmljYXRpb25TZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUluRixRQUFBLHNDQUFzQyxHQUFHLElBQUEsK0JBQWUsRUFBeUMsd0NBQXdDLENBQUMsQ0FBQztJQWtDeEosTUFBYSxxQ0FBcUM7UUFLekMsUUFBUTtZQUNmLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUU7Z0JBQy9CLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLE9BQU8sQ0FDdEMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQzNCLENBQUMsZ0JBQWdCLENBQUMsRUFDbEIsS0FBSyxFQUFFLEdBQUcsRUFBRSxFQUFFO29CQUNiLE1BQU0sUUFBUSxHQUFvQixHQUFHLENBQUM7b0JBRXRDLE9BQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUMxQixDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQzthQUNkO1lBRUQsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUM7UUFDbEMsQ0FBQztRQUVNLEtBQUssQ0FBQyxNQUFNLENBQUMsWUFBb0IsRUFBRSx3QkFBZ0MsRUFBRSxPQUFnQjtZQUMzRixJQUFJLE1BQXVCLENBQUM7WUFFNUIsSUFBSTtnQkFDSCxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDL0I7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDZixPQUFPLEtBQUssQ0FBQzthQUNiO1lBRUQsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSx3QkFBd0IsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN2RSxDQUFDO0tBQ0Q7SUEvQkQsc0ZBK0JDIn0=