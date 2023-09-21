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
define(["require", "exports", "vs/editor/browser/services/codeEditorService", "vs/editor/common/languageSelector", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/platform/label/common/label", "vs/platform/quickinput/common/quickInput", "vs/platform/telemetry/common/telemetry"], function (require, exports, codeEditorService_1, languageSelector_1, nls_1, contextkey_1, label_1, quickInput_1, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ShareService = exports.ShareProviderCountContext = void 0;
    exports.ShareProviderCountContext = new contextkey_1.RawContextKey('shareProviderCount', 0, (0, nls_1.localize)('shareProviderCount', "The number of available share providers"));
    let ShareService = class ShareService {
        constructor(contextKeyService, labelService, quickInputService, codeEditorService, telemetryService) {
            this.contextKeyService = contextKeyService;
            this.labelService = labelService;
            this.quickInputService = quickInputService;
            this.codeEditorService = codeEditorService;
            this.telemetryService = telemetryService;
            this._providers = new Set();
            this.providerCount = exports.ShareProviderCountContext.bindTo(this.contextKeyService);
        }
        registerShareProvider(provider) {
            this._providers.add(provider);
            this.providerCount.set(this._providers.size);
            return {
                dispose: () => {
                    this._providers.delete(provider);
                    this.providerCount.set(this._providers.size);
                }
            };
        }
        getShareActions() {
            // todo@joyceerhl return share actions
            return [];
        }
        async provideShare(item, token) {
            const language = this.codeEditorService.getActiveCodeEditor()?.getModel()?.getLanguageId() ?? '';
            const providers = [...this._providers.values()]
                .filter((p) => (0, languageSelector_1.score)(p.selector, item.resourceUri, language, true, undefined, undefined) > 0)
                .sort((a, b) => a.priority - b.priority);
            if (providers.length === 0) {
                return undefined;
            }
            if (providers.length === 1) {
                this.telemetryService.publicLog2('shareService.share', { providerId: providers[0].id });
                return providers[0].provideShare(item, token);
            }
            const items = providers.map((p) => ({ label: p.label, provider: p }));
            const selected = await this.quickInputService.pick(items, { canPickMany: false, placeHolder: (0, nls_1.localize)('type to filter', 'Choose how to share {0}', this.labelService.getUriLabel(item.resourceUri)) }, token);
            if (selected !== undefined) {
                this.telemetryService.publicLog2('shareService.share', { providerId: selected.provider.id });
                return selected.provider.provideShare(item, token);
            }
            return;
        }
    };
    exports.ShareService = ShareService;
    exports.ShareService = ShareService = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, label_1.ILabelService),
        __param(2, quickInput_1.IQuickInputService),
        __param(3, codeEditorService_1.ICodeEditorService),
        __param(4, telemetry_1.ITelemetryService)
    ], ShareService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc2hhcmUvYnJvd3Nlci9zaGFyZVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBZW5GLFFBQUEseUJBQXlCLEdBQUcsSUFBSSwwQkFBYSxDQUFTLG9CQUFvQixFQUFFLENBQUMsRUFBRSxJQUFBLGNBQVEsRUFBQyxvQkFBb0IsRUFBRSx5Q0FBeUMsQ0FBQyxDQUFDLENBQUM7SUFVaEssSUFBTSxZQUFZLEdBQWxCLE1BQU0sWUFBWTtRQU14QixZQUNxQixpQkFBNkMsRUFDbEQsWUFBNEMsRUFDdkMsaUJBQTZDLEVBQzdDLGlCQUFzRCxFQUN2RCxnQkFBb0Q7WUFKM0Msc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUNqQyxpQkFBWSxHQUFaLFlBQVksQ0FBZTtZQUMvQixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBQzVCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDdEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQVB2RCxlQUFVLEdBQUcsSUFBSSxHQUFHLEVBQWtCLENBQUM7WUFTdkQsSUFBSSxDQUFDLGFBQWEsR0FBRyxpQ0FBeUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDL0UsQ0FBQztRQUVELHFCQUFxQixDQUFDLFFBQXdCO1lBQzdDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzlCLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0MsT0FBTztnQkFDTixPQUFPLEVBQUUsR0FBRyxFQUFFO29CQUNiLElBQUksQ0FBQyxVQUFVLENBQUMsTUFB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