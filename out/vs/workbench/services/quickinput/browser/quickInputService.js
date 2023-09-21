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
define(["require", "exports", "vs/platform/layout/browser/layoutService", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybinding", "vs/platform/quickinput/browser/quickInputService", "vs/platform/instantiation/common/extensions", "vs/platform/quickinput/common/quickInput", "vs/workbench/browser/quickaccess", "vs/workbench/services/hover/browser/hover"], function (require, exports, layoutService_1, instantiation_1, themeService_1, configuration_1, contextkey_1, keybinding_1, quickInputService_1, extensions_1, quickInput_1, quickaccess_1, hover_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QuickInputService = void 0;
    let QuickInputService = class QuickInputService extends quickInputService_1.QuickInputService {
        constructor(configurationService, instantiationService, keybindingService, contextKeyService, themeService, layoutService, hoverService) {
            super(instantiationService, contextKeyService, themeService, layoutService);
            this.configurationService = configurationService;
            this.keybindingService = keybindingService;
            this.hoverService = hoverService;
            this.hoverDelegate = new QuickInputHoverDelegate(this.configurationService, this.hoverService);
            this.inQuickInputContext = quickaccess_1.InQuickPickContextKey.bindTo(this.contextKeyService);
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.onShow(() => this.inQuickInputContext.set(true)));
            this._register(this.onHide(() => this.inQuickInputContext.set(false)));
        }
        createController() {
            return super.createController(this.layoutService, {
                ignoreFocusOut: () => !this.configurationService.getValue('workbench.quickOpen.closeOnFocusLost'),
                backKeybindingLabel: () => this.keybindingService.lookupKeybinding('workbench.action.quickInputBack')?.getLabel() || undefined,
                hoverDelegate: this.hoverDelegate
            });
        }
    };
    exports.QuickInputService = QuickInputService;
    exports.QuickInputService = QuickInputService = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, keybinding_1.IKeybindingService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, themeService_1.IThemeService),
        __param(5, layoutService_1.ILayoutService),
        __param(6, hover_1.IHoverService)
    ], QuickInputService);
    class QuickInputHoverDelegate {
        get delay() {
            if (Date.now() - this.lastHoverHideTime < 200) {
                return 0; // show instantly when a hover was recently shown
            }
            return this.configurationService.getValue('workbench.hover.delay');
        }
        constructor(configurationService, hoverService) {
            this.configurationService = configurationService;
            this.hoverService = hoverService;
            this.lastHoverHideTime = 0;
            this.placement = 'element';
        }
        showHover(options, focus) {
            return this.hoverService.showHover({
                ...options,
                showHoverHint: true,
                hideOnKeyDown: false,
                skipFadeInAnimation: true,
            }, focus);
        }
        onDidHideHover() {
            this.lastHoverHideTime = Date.now();
        }
    }
    (0, extensions_1.registerSingleton)(quickInput_1.IQuickInputService, QuickInputService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpY2tJbnB1dFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvcXVpY2tpbnB1dC9icm93c2VyL3F1aWNrSW5wdXRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWdCekYsSUFBTSxpQkFBaUIsR0FBdkIsTUFBTSxpQkFBa0IsU0FBUSxxQ0FBcUI7UUFLM0QsWUFDd0Isb0JBQTRELEVBQzVELG9CQUEyQyxFQUM5QyxpQkFBc0QsRUFDdEQsaUJBQXFDLEVBQzFDLFlBQTJCLEVBQzFCLGFBQTZCLEVBQzlCLFlBQTRDO1lBRTNELEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxpQkFBaUIsRUFBRSxZQUFZLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFScEMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUU5QyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBSTFDLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBVjNDLGtCQUFhLEdBQUcsSUFBSSx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzFGLHdCQUFtQixHQUFHLG1DQUFxQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQWEzRixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBRU8saUJBQWlCO1lBQ3hCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEUsQ0FBQztRQUVrQixnQkFBZ0I7WUFDbEMsT0FBTyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRTtnQkFDakQsY0FBYyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQztnQkFDakcsbUJBQW1CLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLGlDQUFpQyxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksU0FBUztnQkFDOUgsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhO2FBQ2pDLENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRCxDQUFBO0lBL0JZLDhDQUFpQjtnQ0FBakIsaUJBQWlCO1FBTTNCLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLCtCQUFrQixDQUFBO1FBQ2xCLFdBQUEsK0JBQWtCLENBQUE7UUFDbEIsV0FBQSw0QkFBYSxDQUFBO1FBQ2IsV0FBQSw4QkFBYyxDQUFBO1FBQ2QsV0FBQSxxQkFBYSxDQUFBO09BWkgsaUJBQWlCLENBK0I3QjtJQUVELE1BQU0sdUJBQXVCO1FBSTVCLElBQUksS0FBSztZQUNSLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxHQUFHLEVBQUU7Z0JBQzlDLE9BQU8sQ0FBQyxDQUFDLENBQUMsaURBQWlEO2FBQzNEO1lBRUQsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFTLHVCQUF1QixDQUFDLENBQUM7UUFDNUUsQ0FBQztRQUVELFlBQ2tCLG9CQUEyQyxFQUMzQyxZQUEyQjtZQUQzQix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQzNDLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBYnJDLHNCQUFpQixHQUFHLENBQUMsQ0FBQztZQUNyQixjQUFTLEdBQUcsU0FBUyxDQUFDO1FBYTNCLENBQUM7UUFFTCxTQUFTLENBQUMsT0FBOEIsRUFBRSxLQUFlO1lBQ3hELE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUM7Z0JBQ2xDLEdBQUcsT0FBTztnQkFDVixhQUFhLEVBQUUsSUFBSTtnQkFDbkIsYUFBYSxFQUFFLEtBQUs7Z0JBQ3BCLG1CQUFtQixFQUFFLElBQUk7YUFDekIsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNYLENBQUM7UUFFRCxjQUFjO1lBQ2IsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNyQyxDQUFDO0tBQ0Q7SUFFRCxJQUFBLDhCQUFpQixFQUFDLCtCQUFrQixFQUFFLGlCQUFpQixvQ0FBNEIsQ0FBQyJ9