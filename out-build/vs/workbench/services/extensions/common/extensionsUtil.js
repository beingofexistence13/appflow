/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/extensions/common/extensions", "vs/nls!vs/workbench/services/extensions/common/extensionsUtil", "vs/base/common/semver/semver"], function (require, exports, extensions_1, nls_1, semver) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$nN = void 0;
    // TODO: @sandy081 merge this with deduping in extensionsScannerService.ts
    function $nN(system, user, development, logService) {
        const result = new extensions_1.$Xl();
        system.forEach((systemExtension) => {
            const extension = result.get(systemExtension.identifier);
            if (extension) {
                logService.warn((0, nls_1.localize)(0, null, extension.extensionLocation.fsPath, systemExtension.extensionLocation.fsPath));
            }
            result.set(systemExtension.identifier, systemExtension);
        });
        user.forEach((userExtension) => {
            const extension = result.get(userExtension.identifier);
            if (extension) {
                if (extension.isBuiltin) {
                    if (semver.gte(extension.version, userExtension.version)) {
                        logService.warn(`Skipping extension ${userExtension.extensionLocation.path} in favour of the builtin extension ${extension.extensionLocation.path}.`);
                        return;
                    }
                    // Overwriting a builtin extension inherits the `isBuiltin` property and it doesn't show a warning
                    userExtension.isBuiltin = true;
                }
                else {
                    logService.warn((0, nls_1.localize)(1, null, extension.extensionLocation.fsPath, userExtension.extensionLocation.fsPath));
                }
            }
            else if (userExtension.isBuiltin) {
                logService.warn(`Skipping obsolete builtin extension ${userExtension.extensionLocation.path}`);
                return;
            }
            result.set(userExtension.identifier, userExtension);
        });
        development.forEach(developedExtension => {
            logService.info((0, nls_1.localize)(2, null, developedExtension.extensionLocation.fsPath));
            const extension = result.get(developedExtension.identifier);
            if (extension) {
                if (extension.isBuiltin) {
                    // Overwriting a builtin extension inherits the `isBuiltin` property
                    developedExtension.isBuiltin = true;
                }
            }
            result.set(developedExtension.identifier, developedExtension);
        });
        return Array.from(result.values());
    }
    exports.$nN = $nN;
});
//# sourceMappingURL=extensionsUtil.js.map