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
    exports.MainThreadLocalization = void 0;
    let MainThreadLocalization = class MainThreadLocalization extends lifecycle_1.Disposable {
        constructor(extHostContext, fileService, languagePackService) {
            super();
            this.fileService = fileService;
            this.languagePackService = languagePackService;
        }
        async $fetchBuiltInBundleUri(id, language) {
            try {
                const uri = await this.languagePackService.getBuiltInExtensionTranslationsUri(id, language);
                return uri;
            }
            catch (e) {
                return undefined;
            }
        }
        async $fetchBundleContents(uriComponents) {
            const contents = await this.fileService.readFile(uri_1.URI.revive(uriComponents));
            return contents.value.toString();
        }
    };
    exports.MainThreadLocalization = MainThreadLocalization;
    exports.MainThreadLocalization = MainThreadLocalization = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadLocalization),
        __param(1, files_1.IFileService),
        __param(2, languagePacks_1.ILanguagePackService)
    ], MainThreadLocalization);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZExvY2FsaXphdGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvYnJvd3Nlci9tYWluVGhyZWFkTG9jYWxpemF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVV6RixJQUFNLHNCQUFzQixHQUE1QixNQUFNLHNCQUF1QixTQUFRLHNCQUFVO1FBRXJELFlBQ0MsY0FBK0IsRUFDQSxXQUF5QixFQUNqQixtQkFBeUM7WUFFaEYsS0FBSyxFQUFFLENBQUM7WUFIdUIsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDakIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFzQjtRQUdqRixDQUFDO1FBRUQsS0FBSyxDQUFDLHNCQUFzQixDQUFDLEVBQVUsRUFBRSxRQUFnQjtZQUN4RCxJQUFJO2dCQUNILE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLGtDQUFrQyxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDNUYsT0FBTyxHQUFHLENBQUM7YUFDWDtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNYLE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1FBQ0YsQ0FBQztRQUVELEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxhQUE0QjtZQUN0RCxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLFNBQUcsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUM1RSxPQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDbEMsQ0FBQztLQUNELENBQUE7SUF2Qlksd0RBQXNCO3FDQUF0QixzQkFBc0I7UUFEbEMsSUFBQSx1Q0FBb0IsRUFBQyw4QkFBVyxDQUFDLHNCQUFzQixDQUFDO1FBS3RELFdBQUEsb0JBQVksQ0FBQTtRQUNaLFdBQUEsb0NBQW9CLENBQUE7T0FMVixzQkFBc0IsQ0F1QmxDIn0=