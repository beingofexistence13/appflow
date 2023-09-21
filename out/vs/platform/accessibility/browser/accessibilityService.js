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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/aria/aria", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/accessibility/common/accessibility", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/layout/browser/layoutService"], function (require, exports, dom_1, aria_1, event_1, lifecycle_1, accessibility_1, configuration_1, contextkey_1, layoutService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AccessibilityService = void 0;
    let AccessibilityService = class AccessibilityService extends lifecycle_1.Disposable {
        constructor(_contextKeyService, _layoutService, _configurationService) {
            super();
            this._contextKeyService = _contextKeyService;
            this._layoutService = _layoutService;
            this._configurationService = _configurationService;
            this._accessibilitySupport = 0 /* AccessibilitySupport.Unknown */;
            this._onDidChangeScreenReaderOptimized = new event_1.Emitter();
            this._onDidChangeReducedMotion = new event_1.Emitter();
            this._accessibilityModeEnabledContext = accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.bindTo(this._contextKeyService);
            const updateContextKey = () => this._accessibilityModeEnabledContext.set(this.isScreenReaderOptimized());
            this._register(this._configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('editor.accessibilitySupport')) {
                    updateContextKey();
                    this._onDidChangeScreenReaderOptimized.fire();
                }
                if (e.affectsConfiguration('workbench.reduceMotion')) {
                    this._configMotionReduced = this._configurationService.getValue('workbench.reduceMotion');
                    this._onDidChangeReducedMotion.fire();
                }
            }));
            updateContextKey();
            this._register(this.onDidChangeScreenReaderOptimized(() => updateContextKey()));
            const reduceMotionMatcher = window.matchMedia(`(prefers-reduced-motion: reduce)`);
            this._systemMotionReduced = reduceMotionMatcher.matches;
            this._configMotionReduced = this._configurationService.getValue('workbench.reduceMotion');
            this.initReducedMotionListeners(reduceMotionMatcher);
        }
        initReducedMotionListeners(reduceMotionMatcher) {
            if (!this._layoutService.hasContainer) {
                // we can't use `ILayoutService.container` because the application
                // doesn't have a single container
                return;
            }
            this._register((0, dom_1.addDisposableListener)(reduceMotionMatcher, 'change', () => {
                this._systemMotionReduced = reduceMotionMatcher.matches;
                if (this._configMotionReduced === 'auto') {
                    this._onDidChangeReducedMotion.fire();
                }
            }));
            const updateRootClasses = () => {
                const reduce = this.isMotionReduced();
                this._layoutService.container.classList.toggle('reduce-motion', reduce);
                this._layoutService.container.classList.toggle('enable-motion', !reduce);
            };
            updateRootClasses();
            this._register(this.onDidChangeReducedMotion(() => updateRootClasses()));
        }
        get onDidChangeScreenReaderOptimized() {
            return this._onDidChangeScreenReaderOptimized.event;
        }
        isScreenReaderOptimized() {
            const config = this._configurationService.getValue('editor.accessibilitySupport');
            return config === 'on' || (config === 'auto' && this._accessibilitySupport === 2 /* AccessibilitySupport.Enabled */);
        }
        get onDidChangeReducedMotion() {
            return this._onDidChangeReducedMotion.event;
        }
        isMotionReduced() {
            const config = this._configMotionReduced;
            return config === 'on' || (config === 'auto' && this._systemMotionReduced);
        }
        alwaysUnderlineAccessKeys() {
            return Promise.resolve(false);
        }
        getAccessibilitySupport() {
            return this._accessibilitySupport;
        }
        setAccessibilitySupport(accessibilitySupport) {
            if (this._accessibilitySupport === accessibilitySupport) {
                return;
            }
            this._accessibilitySupport = accessibilitySupport;
            this._onDidChangeScreenReaderOptimized.fire();
        }
        alert(message) {
            (0, aria_1.alert)(message);
        }
    };
    exports.AccessibilityService = AccessibilityService;
    exports.AccessibilityService = AccessibilityService = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, layoutService_1.ILayoutService),
        __param(2, configuration_1.IConfigurationService)
    ], AccessibilityService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjZXNzaWJpbGl0eVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9hY2Nlc3NpYmlsaXR5L2Jyb3dzZXIvYWNjZXNzaWJpbGl0eVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBV3pGLElBQU0sb0JBQW9CLEdBQTFCLE1BQU0sb0JBQXFCLFNBQVEsc0JBQVU7UUFXbkQsWUFDcUIsa0JBQXVELEVBQzNELGNBQStDLEVBQ3hDLHFCQUErRDtZQUV0RixLQUFLLEVBQUUsQ0FBQztZQUo2Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBQzFDLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtZQUNyQiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBVjdFLDBCQUFxQix3Q0FBZ0M7WUFDNUMsc0NBQWlDLEdBQUcsSUFBSSxlQUFPLEVBQVEsQ0FBQztZQUl4RCw4QkFBeUIsR0FBRyxJQUFJLGVBQU8sRUFBUSxDQUFDO1lBUWxFLElBQUksQ0FBQyxnQ0FBZ0MsR0FBRyxrREFBa0MsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFFM0csTUFBTSxnQkFBZ0IsR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLENBQUM7WUFDekcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3RFLElBQUksQ0FBQyxDQUFDLG9CQUFvQixDQUFDLDZCQUE2QixDQUFDLEVBQUU7b0JBQzFELGdCQUFnQixFQUFFLENBQUM7b0JBQ25CLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztpQkFDOUM7Z0JBQ0Qs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