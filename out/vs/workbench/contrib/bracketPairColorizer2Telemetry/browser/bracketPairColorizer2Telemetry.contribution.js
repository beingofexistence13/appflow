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
define(["require", "exports", "vs/base/common/errors", "vs/platform/configuration/common/configuration", "vs/platform/registry/common/platform", "vs/platform/telemetry/common/telemetry", "vs/workbench/common/contributions", "vs/workbench/contrib/extensions/common/extensions"], function (require, exports, errors_1, configuration_1, platform_1, telemetry_1, contributions_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let BracketPairColorizer2TelemetryContribution = class BracketPairColorizer2TelemetryContribution {
        constructor(configurationService, extensionsWorkbenchService, telemetryService) {
            this.configurationService = configurationService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.telemetryService = telemetryService;
            this.init().catch(errors_1.onUnexpectedError);
        }
        async init() {
            const bracketPairColorizerId = 'coenraads.bracket-pair-colorizer-2';
            await this.extensionsWorkbenchService.queryLocal();
            const extension = this.extensionsWorkbenchService.installed.find(e => e.identifier.id === bracketPairColorizerId);
            if (!extension ||
                ((extension.enablementState !== 8 /* EnablementState.EnabledGlobally */) &&
                    (extension.enablementState !== 9 /* EnablementState.EnabledWorkspace */))) {
                return;
            }
            const nativeBracketPairColorizationEnabledKey = 'editor.bracketPairColorization.enabled';
            const nativeColorizationEnabled = !!this.configurationService.getValue(nativeBracketPairColorizationEnabledKey);
            this.telemetryService.publicLog2('bracketPairColorizerTwoUsage', {
                nativeColorizationEnabled
            });
        }
    };
    BracketPairColorizer2TelemetryContribution = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, extensions_1.IExtensionsWorkbenchService),
        __param(2, telemetry_1.ITelemetryService)
    ], BracketPairColorizer2TelemetryContribution);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(BracketPairColorizer2TelemetryContribution, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJhY2tldFBhaXJDb2xvcml6ZXIyVGVsZW1ldHJ5LmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2JyYWNrZXRQYWlyQ29sb3JpemVyMlRlbGVtZXRyeS9icm93c2VyL2JyYWNrZXRQYWlyQ29sb3JpemVyMlRlbGVtZXRyeS5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7SUFXaEcsSUFBTSwwQ0FBMEMsR0FBaEQsTUFBTSwwQ0FBMEM7UUFDL0MsWUFDeUMsb0JBQTJDLEVBQ3JDLDBCQUF1RCxFQUNqRSxnQkFBbUM7WUFGL0IseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUNyQywrQkFBMEIsR0FBMUIsMEJBQTBCLENBQTZCO1lBQ2pFLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFFdkUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQywwQkFBaUIsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFFTyxLQUFLLENBQUMsSUFBSTtZQUNqQixNQUFNLHNCQUFzQixHQUFHLG9DQUFvQyxDQUFDO1lBRXBFLE1BQU0sSUFBSSxDQUFDLDBCQUEwQixDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ25ELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssc0JBQXNCLENBQUMsQ0FBQztZQUNsSCxJQUNDLENBQUMsU0FBUztnQkFDVixDQUFDLENBQUMsU0FBUyxDQUFDLGVBQWUsNENBQW9DLENBQUM7b0JBQy9ELENBQUMsU0FBUyxDQUFDLGVBQWUsNkNBQXFDLENBQUMsQ0FBQyxFQUNqRTtnQkFDRCxPQUFPO2FBQ1A7WUFFRCxNQUFNLHVDQUF1QyxHQUFHLHdDQUF3QyxDQUFDO1lBQ3pGLE1BQU0seUJBQXlCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsdUNBQXVDLENBQUMsQ0FBQztZQVVoSCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUEyRSw4QkFBOEIsRUFBRTtnQkFDMUkseUJBQXlCO2FBQ3pCLENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRCxDQUFBO0lBckNLLDBDQUEwQztRQUU3QyxXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEsd0NBQTJCLENBQUE7UUFDM0IsV0FBQSw2QkFBaUIsQ0FBQTtPQUpkLDBDQUEwQyxDQXFDL0M7SUFFRCxtQkFBUSxDQUFDLEVBQUUsQ0FBa0MsMEJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUMsNkJBQTZCLENBQUMsMENBQTBDLGtDQUEwQixDQUFDIn0=