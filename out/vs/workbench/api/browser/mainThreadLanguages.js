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
define(["require", "exports", "vs/base/common/uri", "vs/editor/common/languages/language", "vs/editor/common/services/model", "../common/extHost.protocol", "vs/workbench/services/extensions/common/extHostCustomers", "vs/editor/common/core/range", "vs/editor/common/services/resolverService", "vs/workbench/services/languageStatus/common/languageStatusService", "vs/base/common/lifecycle"], function (require, exports, uri_1, language_1, model_1, extHost_protocol_1, extHostCustomers_1, range_1, resolverService_1, languageStatusService_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadLanguages = void 0;
    let MainThreadLanguages = class MainThreadLanguages {
        constructor(_extHostContext, _languageService, _modelService, _resolverService, _languageStatusService) {
            this._languageService = _languageService;
            this._modelService = _modelService;
            this._resolverService = _resolverService;
            this._languageStatusService = _languageStatusService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._status = new lifecycle_1.DisposableMap();
            this._proxy = _extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostLanguages);
            this._proxy.$acceptLanguageIds(_languageService.getRegisteredLanguageIds());
            this._disposables.add(_languageService.onDidChange(_ => {
                this._proxy.$acceptLanguageIds(_languageService.getRegisteredLanguageIds());
            }));
        }
        dispose() {
            this._disposables.dispose();
            this._status.dispose();
        }
        async $changeLanguage(resource, languageId) {
            if (!this._languageService.isRegisteredLanguageId(languageId)) {
                return Promise.reject(new Error(`Unknown language id: ${languageId}`));
            }
            const uri = uri_1.URI.revive(resource);
            const ref = await this._resolverService.createModelReference(uri);
            try {
                ref.object.textEditorModel.setLanguage(this._languageService.createById(languageId));
            }
            finally {
                ref.dispose();
            }
        }
        async $tokensAtPosition(resource, position) {
            const uri = uri_1.URI.revive(resource);
            const model = this._modelService.getModel(uri);
            if (!model) {
                return undefined;
            }
            model.tokenization.tokenizeIfCheap(position.lineNumber);
            const tokens = model.tokenization.getLineTokens(position.lineNumber);
            const idx = tokens.findTokenIndexAtOffset(position.column - 1);
            return {
                type: tokens.getStandardTokenType(idx),
                range: new range_1.Range(position.lineNumber, 1 + tokens.getStartOffset(idx), position.lineNumber, 1 + tokens.getEndOffset(idx))
            };
        }
        // --- language status
        $setLanguageStatus(handle, status) {
            this._status.get(handle)?.dispose();
            this._status.set(handle, this._languageStatusService.addStatus(status));
        }
        $removeLanguageStatus(handle) {
            this._status.get(handle)?.dispose();
        }
    };
    exports.MainThreadLanguages = MainThreadLanguages;
    exports.MainThreadLanguages = MainThreadLanguages = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadLanguages),
        __param(1, language_1.ILanguageService),
        __param(2, model_1.IModelService),
        __param(3, resolverService_1.ITextModelService),
        __param(4, languageStatusService_1.ILanguageStatusService)
    ], MainThreadLanguages);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZExhbmd1YWdlcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvYnJvd3Nlci9tYWluVGhyZWFkTGFuZ3VhZ2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWV6RixJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFtQjtRQU8vQixZQUNDLGVBQWdDLEVBQ2QsZ0JBQW1ELEVBQ3RELGFBQTZDLEVBQ3pDLGdCQUEyQyxFQUN0QyxzQkFBK0Q7WUFIcEQscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtZQUNyQyxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtZQUNqQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQ3JCLDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBd0I7WUFWdkUsaUJBQVksR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUdyQyxZQUFPLEdBQUcsSUFBSSx5QkFBYSxFQUFVLENBQUM7WUFTdEQsSUFBSSxDQUFDLE1BQU0sR0FBRyxlQUFlLENBQUMsUUFBUSxDQUFDLGlDQUFjLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUV4RSxJQUFJLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLGdCQUFnQixDQUFDLHdCQUF3QixFQUFFLENBQUMsQ0FBQztZQUM1RSxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3RELElBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsZ0JBQWdCLENBQUMsd0JBQXdCLEVBQUUsQ0FBQyxDQUFDO1lBQzdFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRUQsT0FBTztZQUNOLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDNUIsSUFBSSxDQUFDLE9B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