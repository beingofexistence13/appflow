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
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/common/languages/language", "vs/platform/theme/common/themeService", "vs/platform/log/common/log", "vs/editor/common/services/semanticTokensProviderStyling", "vs/editor/common/services/semanticTokensStyling", "vs/platform/instantiation/common/extensions"], function (require, exports, lifecycle_1, language_1, themeService_1, log_1, semanticTokensProviderStyling_1, semanticTokensStyling_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SemanticTokensStylingService = void 0;
    let SemanticTokensStylingService = class SemanticTokensStylingService extends lifecycle_1.Disposable {
        constructor(_themeService, _logService, _languageService) {
            super();
            this._themeService = _themeService;
            this._logService = _logService;
            this._languageService = _languageService;
            this._caches = new WeakMap();
            this._register(this._themeService.onDidColorThemeChange(() => {
                this._caches = new WeakMap();
            }));
        }
        getStyling(provider) {
            if (!this._caches.has(provider)) {
                this._caches.set(provider, new semanticTokensProviderStyling_1.SemanticTokensProviderStyling(provider.getLegend(), this._themeService, this._languageService, this._logService));
            }
            return this._caches.get(provider);
        }
    };
    exports.SemanticTokensStylingService = SemanticTokensStylingService;
    exports.SemanticTokensStylingService = SemanticTokensStylingService = __decorate([
        __param(0, themeService_1.IThemeService),
        __param(1, log_1.ILogService),
        __param(2, language_1.ILanguageService)
    ], SemanticTokensStylingService);
    (0, extensions_1.registerSingleton)(semanticTokensStyling_1.ISemanticTokensStylingService, SemanticTokensStylingService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VtYW50aWNUb2tlbnNTdHlsaW5nU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vc2VydmljZXMvc2VtYW50aWNUb2tlbnNTdHlsaW5nU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFXekYsSUFBTSw0QkFBNEIsR0FBbEMsTUFBTSw0QkFBNkIsU0FBUSxzQkFBVTtRQU0zRCxZQUNpQyxhQUE0QixFQUM5QixXQUF3QixFQUNuQixnQkFBa0M7WUFFckUsS0FBSyxFQUFFLENBQUM7WUFKd0Isa0JBQWEsR0FBYixhQUFhLENBQWU7WUFDOUIsZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFDbkIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtZQUdyRSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksT0FBTyxFQUF5RCxDQUFDO1lBQ3BGLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLEVBQUU7Z0JBQzVELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxPQUFPLEVBQXlELENBQUM7WUFDckYsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFTSxVQUFVLENBQUMsUUFBZ0M7WUFDakQsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUNoQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsSUFBSSw2REFBNkIsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7YUFDako7WUFDRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBRSxDQUFDO1FBQ3BDLENBQUM7S0FDRCxDQUFBO0lBeEJZLG9FQUE0QjsyQ0FBNUIsNEJBQTRCO1FBT3RDLFdBQUEsNEJBQWEsQ0FBQTtRQUNiLFdBQUEsaUJBQVcsQ0FBQTtRQUNYLFdBQUEsMkJBQWdCLENBQUE7T0FUTiw0QkFBNEIsQ0F3QnhDO0lBRUQsSUFBQSw4QkFBaUIsRUFBQyxxREFBNkIsRUFBRSw0QkFBNEIsb0NBQTRCLENBQUMifQ==