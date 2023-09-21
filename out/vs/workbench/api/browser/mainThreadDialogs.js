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
    var MainThreadDialogs_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadDialogs = void 0;
    let MainThreadDialogs = MainThreadDialogs_1 = class MainThreadDialogs {
        constructor(context, _fileDialogService) {
            this._fileDialogService = _fileDialogService;
            //
        }
        dispose() {
            //
        }
        async $showOpenDialog(options) {
            const convertedOptions = MainThreadDialogs_1._convertOpenOptions(options);
            if (!convertedOptions.defaultUri) {
                convertedOptions.defaultUri = await this._fileDialogService.defaultFilePath();
            }
            return Promise.resolve(this._fileDialogService.showOpenDialog(convertedOptions));
        }
        async $showSaveDialog(options) {
            const convertedOptions = MainThreadDialogs_1._convertSaveOptions(options);
            if (!convertedOptions.defaultUri) {
                convertedOptions.defaultUri = await this._fileDialogService.defaultFilePath();
            }
            return Promise.resolve(this._fileDialogService.showSaveDialog(convertedOptions));
        }
        static _convertOpenOptions(options) {
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
        static _convertSaveOptions(options) {
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
    exports.MainThreadDialogs = MainThreadDialogs;
    exports.MainThreadDialogs = MainThreadDialogs = MainThreadDialogs_1 = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadDialogs),
        __param(1, dialogs_1.IFileDialogService)
    ], MainThreadDialogs);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZERpYWxvZ3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2Jyb3dzZXIvbWFpblRocmVhZERpYWxvZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQVN6RixJQUFNLGlCQUFpQix5QkFBdkIsTUFBTSxpQkFBaUI7UUFFN0IsWUFDQyxPQUF3QixFQUNhLGtCQUFzQztZQUF0Qyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBRTNFLEVBQUU7UUFDSCxDQUFDO1FBRUQsT0FBTztZQUNOLEVBQUU7UUFDSCxDQUFDO1FBRUQsS0FBSyxDQUFDLGVBQWUsQ0FBQyxPQUFxQztZQUMxRCxNQUFNLGdCQUFnQixHQUFHLG1CQUFpQixDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUU7Z0JBQ2pDLGdCQUFnQixDQUFDLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLEVBQUUsQ0FBQzthQUM5RTtZQUNELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztRQUNsRixDQUFDO1FBRUQsS0FBSyxDQUFDLGVBQWUsQ0FBQyxPQUFxQztZQUMxRCxNQUFNLGdCQUFnQixHQUFHLG1CQUFpQixDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUU7Z0JBQ2pDLGdCQUFnQixDQUFDLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLEVBQUUsQ0FBQzthQUM5RTtZQUNELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMs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