/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors"], function (require, exports, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$PQ = void 0;
    function $PQ(policyName, policyOptions) {
        const monacoEnvironment = globalThis.MonacoEnvironment;
        if (monacoEnvironment?.createTrustedTypesPolicy) {
            try {
                return monacoEnvironment.createTrustedTypesPolicy(policyName, policyOptions);
            }
            catch (err) {
                (0, errors_1.$Y)(err);
                return undefined;
            }
        }
        try {
            return window.trustedTypes?.createPolicy(policyName, policyOptions);
        }
        catch (err) {
            (0, errors_1.$Y)(err);
            return undefined;
        }
    }
    exports.$PQ = $PQ;
});
//# sourceMappingURL=trustedTypes.js.map