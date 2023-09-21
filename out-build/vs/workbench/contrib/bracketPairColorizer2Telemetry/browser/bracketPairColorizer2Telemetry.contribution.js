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
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d().catch(errors_1.$Y);
        }
        async d() {
            const bracketPairColorizerId = 'coenraads.bracket-pair-colorizer-2';
            await this.b.queryLocal();
            const extension = this.b.installed.find(e => e.identifier.id === bracketPairColorizerId);
            if (!extension ||
                ((extension.enablementState !== 8 /* EnablementState.EnabledGlobally */) &&
                    (extension.enablementState !== 9 /* EnablementState.EnabledWorkspace */))) {
                return;
            }
            const nativeBracketPairColorizationEnabledKey = 'editor.bracketPairColorization.enabled';
            const nativeColorizationEnabled = !!this.a.getValue(nativeBracketPairColorizationEnabledKey);
            this.c.publicLog2('bracketPairColorizerTwoUsage', {
                nativeColorizationEnabled
            });
        }
    };
    BracketPairColorizer2TelemetryContribution = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, extensions_1.$Pfb),
        __param(2, telemetry_1.$9k)
    ], BracketPairColorizer2TelemetryContribution);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(BracketPairColorizer2TelemetryContribution, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=bracketPairColorizer2Telemetry.contribution.js.map