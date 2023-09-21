/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/uri", "../common/extHost.protocol", "vs/workbench/services/extensions/common/extHostCustomers", "vs/platform/dialogs/common/dialogs", "vs/base/common/network"], function (require, exports, uri_1, extHost_protocol_1, extHostCustomers_1, dialogs_1, network_1) {
    "use strict";
    var $Jcb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Jcb = void 0;
    let $Jcb = $Jcb_1 = class $Jcb {
        constructor(context, a) {
            this.a = a;
            //
        }
        dispose() {
            //
        }
        async $showOpenDialog(options) {
            const convertedOptions = $Jcb_1.b(options);
            if (!convertedOptions.defaultUri) {
                convertedOptions.defaultUri = await this.a.defaultFilePath();
            }
            return Promise.resolve(this.a.showOpenDialog(convertedOptions));
        }
        async $showSaveDialog(options) {
            const convertedOptions = $Jcb_1.c(options);
            if (!convertedOptions.defaultUri) {
                convertedOptions.defaultUri = await this.a.defaultFilePath();
            }
            return Promise.resolve(this.a.showSaveDialog(convertedOptions));
        }
        static b(options) {
            const result = {
                openLabel: options?.openLabel || undefined,
                canSelectFiles: options?.canSelectFiles || (!options?.canSelectFiles && !options?.canSelectFolders),
                canSelectFolders: options?.canSelectFolders,
                canSelectMany: options?.canSelectMany,
                defaultUri: options?.defaultUri ? uri_1.URI.revive(options.defaultUri) : undefined,
                title: options?.title || undefined,
                availableFileSystems: options?.allowUIResources ? [network_1.Schemas.vscodeRemote, network_1.Schemas.file] : []
            };
            if (options?.filters) {
                result.filters = [];
                for (const [key, value] of Object.entries(options.filters)) {
                    result.filters.push({ name: key, extensions: value });
                }
            }
            return result;
        }
        static c(options) {
            const result = {
                defaultUri: options?.defaultUri ? uri_1.URI.revive(options.defaultUri) : undefined,
                saveLabel: options?.saveLabel || undefined,
                title: options?.title || undefined
            };
            if (options?.filters) {
                result.filters = [];
                for (const [key, value] of Object.entries(options.filters)) {
                    result.filters.push({ name: key, extensions: value });
                }
            }
            return result;
        }
    };
    exports.$Jcb = $Jcb;
    exports.$Jcb = $Jcb = $Jcb_1 = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadDialogs),
        __param(1, dialogs_1.$qA)
    ], $Jcb);
});
//# sourceMappingURL=mainThreadDialogs.js.map