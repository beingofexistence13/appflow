/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/base/common/process"], function (require, exports, platform_1, process_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @deprecated You MUST use `IProductService` if possible.
     */
    let product;
    // Native sandbox environment
    if (typeof platform_1.$g.vscode !== 'undefined' && typeof platform_1.$g.vscode.context !== 'undefined') {
        const configuration = platform_1.$g.vscode.context.configuration();
        if (configuration) {
            product = configuration.product;
        }
        else {
            throw new Error('Sandbox: unable to resolve product configuration from preload script.');
        }
    }
    // _VSCODE environment
    else if (globalThis._VSCODE_PRODUCT_JSON && globalThis._VSCODE_PACKAGE_JSON) {
        // Obtain values from product.json and package.json-data
        product = globalThis._VSCODE_PRODUCT_JSON;
        // Running out of sources
        if (process_1.env['VSCODE_DEV']) {
            Object.assign(product, {
                nameShort: `${product.nameShort} Dev`,
                nameLong: `${product.nameLong} Dev`,
                dataFolderName: `${product.dataFolderName}-dev`,
                serverDataFolderName: product.serverDataFolderName ? `${product.serverDataFolderName}-dev` : undefined
            });
        }
        // Version is added during built time, but we still
        // want to have it running out of sources so we
        // read it from package.json only when we need it.
        if (!product.version) {
            const pkg = globalThis._VSCODE_PACKAGE_JSON;
            Object.assign(product, {
                version: pkg.version
            });
        }
    }
    // Web environment or unknown
    else {
        // Built time configuration (do NOT modify)
        product = { /*BUILD->INSERT_PRODUCT_CONFIGURATION*/};
        // Running out of sources
        if (Object.keys(product).length === 0) {
            Object.assign(product, {
                version: '1.82.0-dev',
                nameShort: 'Code - OSS Dev',
                nameLong: 'Code - OSS Dev',
                applicationName: 'code-oss',
                dataFolderName: '.vscode-oss',
                urlProtocol: 'code-oss',
                reportIssueUrl: 'https://github.com/microsoft/vscode/issues/new',
                licenseName: 'MIT',
                licenseUrl: 'https://github.com/microsoft/vscode/blob/main/LICENSE.txt',
                serverLicenseUrl: 'https://github.com/microsoft/vscode/blob/main/LICENSE.txt'
            });
        }
    }
    /**
     * @deprecated You MUST use `IProductService` if possible.
     */
    exports.default = product;
});
//# sourceMappingURL=product.js.map