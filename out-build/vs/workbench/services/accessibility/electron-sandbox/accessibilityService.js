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
define(["require", "exports", "vs/platform/accessibility/common/accessibility", "vs/base/common/platform", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/platform/contextkey/common/contextkey", "vs/platform/configuration/common/configuration", "vs/platform/registry/common/platform", "vs/platform/accessibility/browser/accessibilityService", "vs/platform/instantiation/common/extensions", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/configuration/common/jsonEditing", "vs/workbench/common/contributions", "vs/platform/native/common/native", "vs/platform/layout/browser/layoutService"], function (require, exports, accessibility_1, platform_1, environmentService_1, contextkey_1, configuration_1, platform_2, accessibilityService_1, extensions_1, telemetry_1, jsonEditing_1, contributions_1, native_1, layoutService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$N_b = void 0;
    let $N_b = class $N_b extends accessibilityService_1.$M4b {
        constructor(environmentService, contextKeyService, configurationService, _layoutService, u, w) {
            super(contextKeyService, _layoutService, configurationService);
            this.u = u;
            this.w = w;
            this.s = false;
            this.t = undefined;
            this.setAccessibilitySupport(environmentService.window.accessibilitySupport ? 2 /* AccessibilitySupport.Enabled */ : 1 /* AccessibilitySupport.Disabled */);
        }
        async alwaysUnderlineAccessKeys() {
            if (!platform_1.$i) {
                return false;
            }
            if (typeof this.t !== 'boolean') {
                const windowsKeyboardAccessibility = await this.w.windowsGetStringRegKey('HKEY_CURRENT_USER', 'Control Panel\\Accessibility\\Keyboard Preference', 'On');
                this.t = (windowsKeyboardAccessibility === '1');
            }
            return this.t;
        }
        setAccessibilitySupport(accessibilitySupport) {
            super.setAccessibilitySupport(accessibilitySupport);
            if (!this.s && accessibilitySupport === 2 /* AccessibilitySupport.Enabled */) {
                this.u.publicLog2('accessibility', { enabled: true });
                this.s = true;
            }
        }
    };
    exports.$N_b = $N_b;
    exports.$N_b = $N_b = __decorate([
        __param(0, environmentService_1.$1$b),
        __param(1, contextkey_1.$3i),
        __param(2, configuration_1.$8h),
        __param(3, layoutService_1.$XT),
        __param(4, telemetry_1.$9k),
        __param(5, native_1.$05b)
    ], $N_b);
    (0, extensions_1.$mr)(accessibility_1.$1r, $N_b, 1 /* InstantiationType.Delayed */);
    // On linux we do not automatically detect that a screen reader is detected, thus we have to implicitly notify the renderer to enable accessibility when user configures it in settings
    let LinuxAccessibilityContribution = class LinuxAccessibilityContribution {
        constructor(jsonEditingService, accessibilityService, environmentService) {
            const forceRendererAccessibility = () => {
                if (accessibilityService.isScreenReaderOptimized()) {
                    jsonEditingService.write(environmentService.argvResource, [{ path: ['force-renderer-accessibility'], value: true }], true);
                }
            };
            forceRendererAccessibility();
            accessibilityService.onDidChangeScreenReaderOptimized(forceRendererAccessibility);
        }
    };
    LinuxAccessibilityContribution = __decorate([
        __param(0, jsonEditing_1.$$fb),
        __param(1, accessibility_1.$1r),
        __param(2, environmentService_1.$1$b)
    ], LinuxAccessibilityContribution);
    if (platform_1.$k) {
        platform_2.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(LinuxAccessibilityContribution, 2 /* LifecyclePhase.Ready */);
    }
});
//# sourceMappingURL=accessibilityService.js.map