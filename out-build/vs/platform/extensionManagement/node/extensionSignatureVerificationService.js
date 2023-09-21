/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$8o = exports.$7o = void 0;
    exports.$7o = (0, instantiation_1.$Bh)('IExtensionSignatureVerificationService');
    class $8o {
        b() {
            if (!this.a) {
                this.a = new Promise((resolve, reject) => require(['node-vsce-sign'], async (obj) => {
                    const instance = obj;
                    return resolve(instance);
                }, reject));
            }
            return this.a;
        }
        async verify(vsixFilePath, signatureArchiveFilePath, verbose) {
            let module;
            try {
                module = await this.b();
            }
            catch (error) {
                return false;
            }
            return module.verify(vsixFilePath, signatureArchiveFilePath, verbose);
        }
    }
    exports.$8o = $8o;
});
//# sourceMappingURL=extensionSignatureVerificationService.js.map