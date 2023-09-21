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
    exports.NativeAccessibilityService = void 0;
    let NativeAccessibilityService = class NativeAccessibilityService extends accessibilityService_1.AccessibilityService {
        constructor(environmentService, contextKeyService, configurationService, _layoutService, _telemetryService, nativeHostService) {
            super(contextKeyService, _layoutService, configurationService);
            this._telemetryService = _telemetryService;
            this.nativeHostService = nativeHostService;
            this.didSendTelemetry = false;
            this.shouldAlwaysUnderlineAccessKeys = undefined;
            this.setAccessibilitySupport(environmentService.window.accessibilitySupport ? 2 /* AccessibilitySupport.Enabled */ : 1 /* AccessibilitySupport.Disabled */);
        }
        async alwaysUnderlineAccessKeys() {
            if (!platform_1.isWindows) {
                return false;
            }
            if (typeof this.shouldAlwaysUnderlineAccessKeys !== 'boolean') {
                const windowsKeyboardAccessibility = await this.nativeHostService.windowsGetStringRegKey('HKEY_CURRENT_USER', 'Control Panel\\Accessibility\\Keyboard Preference', 'On');
                this.shouldAlwaysUnderlineAccessKeys = (windowsKeyboardAccessibility === '1');
            }
            return this.shouldAlwaysUnderlineAccessKeys;
        }
        setAccessibilitySupport(accessibilitySupport) {
            super.setAccessibilitySupport(accessibilitySupport);
            if (!this.didSendTelemetry && accessibilitySupport === 2 /* AccessibilitySupport.Enabled */) {
                this._telemetryService.publicLog2('accessibility', { enabled: true });
                this.didSendTelemetry = true;
            }
        }
    };
    exports.NativeAccessibilityService = NativeAccessibilityService;
    exports.NativeAccessibilityService = NativeAccessibilityService = __decorate([
        __param(0, environmentService_1.INativeWorkbenchEnvironmentService),
        __param(1, contextkey_1.IContextKeyService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, layoutService_1.ILayoutService),
        __param(4, telemetry_1.ITelemetryService),
        __param(5, native_1.INativeHostService)
    ], NativeAccessibilityService);
    (0, extensions_1.registerSingleton)(accessibility_1.IAccessibilityService, NativeAccessibilityService, 1 /* InstantiationType.Delayed */);
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
        __param(0, jsonEditing_1.IJSONEditingService),
        __param(1, accessibility_1.IAccessibilityService),
        __param(2, environmentService_1.INativeWorkbenchEnvironmentService)
    ], LinuxAccessibilityContribution);
    if (platform_1.isLinux) {
        platform_2.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(LinuxAccessibilityContribution, 2 /* LifecyclePhase.Ready */);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjZXNzaWJpbGl0eVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvYWNjZXNzaWJpbGl0eS9lbGVjdHJvbi1zYW5kYm94L2FjY2Vzc2liaWxpdHlTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTBCekYsSUFBTSwwQkFBMEIsR0FBaEMsTUFBTSwwQkFBMkIsU0FBUSwyQ0FBb0I7UUFLbkUsWUFDcUMsa0JBQXNELEVBQ3RFLGlCQUFxQyxFQUNsQyxvQkFBMkMsRUFDbEQsY0FBOEIsRUFDM0IsaUJBQXFELEVBQ3BELGlCQUFzRDtZQUUxRSxLQUFLLENBQUMsaUJBQWlCLEVBQUUsY0FBYyxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFIM0Isc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtZQUNuQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBVG5FLHFCQUFnQixHQUFHLEtBQUssQ0FBQztZQUN6QixvQ0FBK0IsR0FBd0IsU0FBUyxDQUFDO1lBV3hFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxzQ0FBOEIsQ0FBQyxzQ0FBOEIsQ0FBQyxDQUFDO1FBQzdJLENBQUM7UUFFUSxLQUFLLENBQUMseUJBQXlCO1lBQ3ZDLElBQUksQ0FBQyxvQkFBUyxFQUFFO2dCQUNmLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFFRCxJQUFJLE9BQU8sSUFBSSxDQUFDLCtCQUErQixLQUFLLFNBQVMsRUFBRTtnQkFDOUQsTUFBTSw0QkFBNEIsR0FBRyxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxzQkFBc0IsQ0FBQyxtQkFBbUIsRUFBRSxtREFBbUQsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDekssSUFBSSxDQUFDLCtCQUErQixHQUFHLENBQUMsNEJBQTRCLEtBQUssR0FBRyxDQUFDLENBQUM7YUFDOUU7WUFFRCxPQUFPLElBQUksQ0FBQywrQkFBK0IsQ0FBQztRQUM3QyxDQUFDO1FBRVEsdUJBQXVCLENBQUMsb0JBQTBDO1lBQzFFLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBRXBELElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLElBQUksb0JBQW9CLHlDQUFpQyxFQUFFO2dCQUNwRixJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUEyRCxlQUFlLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDaEksSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQzthQUM3QjtRQUNGLENBQUM7S0FDRCxDQUFBO0lBdENZLGdFQUEwQjt5Q0FBMUIsMEJBQTBCO1FBTXBDLFdBQUEsdURBQWtDLENBQUE7UUFDbEMsV0FBQSwrQkFBa0IsQ0FBQTtRQUNsQixXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEsOEJBQWMsQ0FBQTtRQUNkLFdBQUEsNkJBQWlCLENBQUE7UUFDakIsV0FBQSwyQkFBa0IsQ0FBQTtPQVhSLDBCQUEwQixDQXNDdEM7SUFFRCxJQUFBLDhCQUFpQixFQUFDLHFDQUFxQixFQUFFLDBCQUEwQixvQ0FBNEIsQ0FBQztJQUVoRyx1TEFBdUw7SUFDdkwsSUFBTSw4QkFBOEIsR0FBcEMsTUFBTSw4QkFBOEI7UUFDbkMsWUFDc0Isa0JBQXVDLEVBQ3JDLG9CQUEyQyxFQUM5QixrQkFBc0Q7WUFFMUYsTUFBTSwwQkFBMEIsR0FBRyxHQUFHLEVBQUU7Z0JBQ3ZDLElBQUksb0JBQW9CLENBQUMsdUJBQXVCLEVBQUUsRUFBRTtvQkFDbkQsa0JBQWtCLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsOEJBQThCLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztpQkFDM0g7WUFDRixDQUFDLENBQUM7WUFDRiwwQkFBMEIsRUFBRSxDQUFDO1lBQzdCLG9CQUFvQixDQUFDLGdDQUFnQyxDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFDbkYsQ0FBQztLQUNELENBQUE7SUFkSyw4QkFBOEI7UUFFakMsV0FBQSxpQ0FBbUIsQ0FBQTtRQUNuQixXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEsdURBQWtDLENBQUE7T0FKL0IsOEJBQThCLENBY25DO0lBRUQsSUFBSSxrQkFBTyxFQUFFO1FBQ1osbUJBQVEsQ0FBQyxFQUFFLENBQWtDLDBCQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDLDZCQUE2QixDQUFDLDhCQUE4QiwrQkFBdUIsQ0FBQztLQUNoSyJ9