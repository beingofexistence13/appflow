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
define(["require", "exports", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/extensions/common/extHostCustomers", "vs/base/common/uri", "vs/platform/files/common/files", "vs/base/common/lifecycle", "vs/platform/languagePacks/common/languagePacks"], function (require, exports, extHost_protocol_1, extHostCustomers_1, uri_1, files_1, lifecycle_1, languagePacks_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$lbb = void 0;
    let $lbb = class $lbb extends lifecycle_1.$kc {
        constructor(extHostContext, a, b) {
            super();
            this.a = a;
            this.b = b;
        }
        async $fetchBuiltInBundleUri(id, language) {
            try {
                const uri = await this.b.getBuiltInExtensionTranslationsUri(id, language);
                return uri;
            }
            catch (e) {
                return undefined;
            }
        }
        async $fetchBundleContents(uriComponents) {
            const contents = await this.a.readFile(uri_1.URI.revive(uriComponents));
            return contents.value.toString();
        }
    };
    exports.$lbb = $lbb;
    exports.$lbb = $lbb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadLocalization),
        __param(1, files_1.$6j),
        __param(2, languagePacks_1.$Iq)
    ], $lbb);
});
//# sourceMappingURL=mainThreadLocalization.js.map