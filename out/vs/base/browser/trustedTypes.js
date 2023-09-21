/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors"], function (require, exports, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createTrustedTypesPolicy = void 0;
    function createTrustedTypesPolicy(policyName, policyOptions) {
        const monacoEnvironment = globalThis.MonacoEnvironment;
        if (monacoEnvironment?.createTrustedTypesPolicy) {
            try {
                return monacoEnvironment.createTrustedTypesPolicy(policyName, policyOptions);
            }
            catch (err) {
                (0, errors_1.onUnexpectedError)(err);
                return undefined;
            }
        }
        try {
            return window.trustedTypes?.createPolicy(policyName, policyOptions);
        }
        catch (err) {
            (0, errors_1.onUnexpectedError)(err);
            return undefined;
        }
    }
    exports.createTrustedTypesPolicy = createTrustedTypesPolicy;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJ1c3RlZFR5cGVzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL3RydXN0ZWRUeXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFJaEcsU0FBZ0Isd0JBQXdCLENBQ3ZDLFVBQWtCLEVBQ2xCLGFBQXVCO1FBU3ZCLE1BQU0saUJBQWlCLEdBQW9DLFVBQWtCLENBQUMsaUJBQWlCLENBQUM7UUFFaEcsSUFBSSxpQkFBaUIsRUFBRSx3QkFBd0IsRUFBRTtZQUNoRCxJQUFJO2dCQUNILE9BQU8saUJBQWlCLENBQUMsd0JBQXdCLENBQUMsVUFBVSxFQUFFLGFBQWEsQ0FBQyxDQUFDO2FBQzdFO1lBQUMsT0FBTyxHQUFHLEVBQUU7Z0JBQ2IsSUFBQSwwQkFBaUIsRUFBQyxHQUFHLENBQUMsQ0FBQztnQkFDdkIsT0FBTyxTQUFTLENBQUM7YUFDakI7U0FDRDtRQUNELElBQUk7WUFDSCxPQUFPLE1BQU0sQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLFVBQVUsRUFBRSxhQUFhLENBQUMsQ0FBQztTQUNwRTtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ2IsSUFBQSwwQkFBaUIsRUFBQyxHQUFHLENBQUMsQ0FBQztZQUN2QixPQUFPLFNBQVMsQ0FBQztTQUNqQjtJQUNGLENBQUM7SUEzQkQsNERBMkJDIn0=