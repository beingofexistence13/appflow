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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/event", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/layout/browser/layoutService", "vs/platform/list/browser/listService", "vs/platform/opener/common/opener", "vs/platform/quickinput/browser/quickAccess", "vs/platform/theme/browser/defaultStyles", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/platform/quickinput/browser/quickInputController"], function (require, exports, cancellation_1, event_1, contextkey_1, instantiation_1, layoutService_1, listService_1, opener_1, quickAccess_1, defaultStyles_1, colorRegistry_1, themeService_1, quickInputController_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QuickInputService = void 0;
    let QuickInputService = class QuickInputService extends themeService_1.Themable {
        get backButton() { return this.controller.backButton; }
        get controller() {
            if (!this._controller) {
                this._controller = this._register(this.createController());
            }
            return this._controller;
        }
        get hasController() { return !!this._controller; }
        get quickAccess() {
            if (!this._quickAccess) {
                this._quickAccess = this._register(this.instantiationService.createInstance(quickAccess_1.QuickAccessController));
            }
            return this._quickAccess;
        }
        constructor(instantiationService, contextKeyService, themeService, layoutService) {
            super(themeService);
            this.instantiationService = instantiationService;
            this.contextKeyService = contextKeyService;
            this.layoutService = layoutService;
            this._onShow = this._register(new event_1.Emitter());
            this.onShow = this._onShow.event;
            this._onHide = this._register(new event_1.Emitter());
            this.onHide = this._onHide.event;
            this.contexts = new Map();
        }
        createController(host = this.layoutService, options) {
            const defaultOptions = {
                idPrefix: 'quickInput_',
                container: host.container,
                ignoreFocusOut: () => false,
                backKeybindingLabel: () => undefined,
                setContextKey: (id) => this.setContextKey(id),
                linkOpenerDelegate: (content) => {
                    // HACK: https://github.com/microsoft/vscode/issues/173691
                    this.instantiationService.invokeFunction(accessor => {
                        const openerService = accessor.get(opener_1.IOpenerService);
                        openerService.open(content, { allowCommands: true, fromUserGesture: true });
                    });
                },
                returnFocus: () => host.focus(),
                createList: (user, container, delegate, renderers, options) => this.instantiationService.createInstance(listService_1.WorkbenchList, user, container, delegate, renderers, options),
                styles: this.computeStyles()
            };
            const controller = this._register(new quickInputController_1.QuickInputController({
                ...defaultOptions,
                ...options
            }, this.themeService));
            controller.layout(host.dimension, host.offset.quickPickTop);
            // Layout changes
            this._register(host.onDidLayout(dimension => controller.layout(dimension, host.offset.quickPickTop)));
            // Context keys
            this._register(controller.onShow(() => {
                this.resetContextKeys();
                this._onShow.fire();
            }));
            this._register(controller.onHide(() => {
                this.resetContextKeys();
                this._onHide.fire();
            }));
            return controller;
        }
        setContextKey(id) {
            let key;
            if (id) {
                key = this.contexts.get(id);
                if (!key) {
                    key = new contextkey_1.RawContextKey(id, false)
                        .bindTo(this.contextKeyService);
                    this.contexts.set(id, key);
                }
            }
            if (key && key.get()) {
                return; // already active context
            }
            this.resetContextKeys();
            key?.set(true);
        }
        resetContextKeys() {
            this.contexts.forEach(context => {
                if (context.get()) {
                    context.reset();
                }
            });
        }
        pick(picks, options = {}, token = cancellation_1.CancellationToken.None) {
            return this.controller.pick(picks, options, token);
        }
        input(options = {}, token = cancellation_1.CancellationToken.None) {
            return this.controller.input(options, token);
        }
        createQuickPick() {
            return this.controller.createQuickPick();
        }
        createInputBox() {
            return this.controller.createInputBox();
        }
        createQuickWidget() {
            return this.controller.createQuickWidget();
        }
        focus() {
            this.controller.focus();
        }
        toggle() {
            this.controller.toggle();
        }
        navigate(next, quickNavigate) {
            this.controller.navigate(next, quickNavigate);
        }
        accept(keyMods) {
            return this.controller.accept(keyMods);
        }
        back() {
            return this.controller.back();
        }
        cancel() {
            return this.controller.cancel();
        }
        updateStyles() {
            if (this.hasController) {
                this.controller.applyStyles(this.computeStyles());
            }
        }
        computeStyles() {
            return {
                widget: {
                    quickInputBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.quickInputBackground),
                    quickInputForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.quickInputForeground),
                    quickInputTitleBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.quickInputTitleBackground),
                    widgetBorder: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.widgetBorder),
                    widgetShadow: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.widgetShadow),
                },
                inputBox: defaultStyles_1.defaultInputBoxStyles,
                toggle: defaultStyles_1.defaultToggleStyles,
                countBadge: defaultStyles_1.defaultCountBadgeStyles,
                button: defaultStyles_1.defaultButtonStyles,
                progressBar: defaultStyles_1.defaultProgressBarStyles,
                keybindingLabel: defaultStyles_1.defaultKeybindingLabelStyles,
                list: (0, defaultStyles_1.getListStyles)({
                    listBackground: colorRegistry_1.quickInputBackground,
                    listFocusBackground: colorRegistry_1.quickInputListFocusBackground,
                    listFocusForeground: colorRegistry_1.quickInputListFocusForeground,
                    // Look like focused when inactive.
                    listInactiveFocusForeground: colorRegistry_1.quickInputListFocusForeground,
                    listInactiveSelectionIconForeground: colorRegistry_1.quickInputListFocusIconForeground,
                    listInactiveFocusBackground: colorRegistry_1.quickInputListFocusBackground,
                    listFocusOutline: colorRegistry_1.activeContrastBorder,
                    listInactiveFocusOutline: colorRegistry_1.activeContrastBorder,
                }),
                pickerGroup: {
                    pickerGroupBorder: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.pickerGroupBorder),
                    pickerGroupForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.pickerGroupForeground),
                }
            };
        }
    };
    exports.QuickInputService = QuickInputService;
    exports.QuickInputService = QuickInputService = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, contextkey_1.IContextKeyService),
        __param(2, themeService_1.IThemeService),
        __param(3, layoutService_1.ILayoutService)
    ], QuickInputService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpY2tJbnB1dFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9xdWlja2lucHV0L2Jyb3dzZXIvcXVpY2tJbnB1dFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBb0J6RixJQUFNLGlCQUFpQixHQUF2QixNQUFNLGlCQUFrQixTQUFRLHVCQUFRO1FBSTlDLElBQUksVUFBVSxLQUF3QixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQVMxRSxJQUFZLFVBQVU7WUFDckIsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ3RCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO2FBQzNEO1lBRUQsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ3pCLENBQUM7UUFFRCxJQUFZLGFBQWEsS0FBSyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUcxRCxJQUFJLFdBQVc7WUFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDdkIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsbUNBQXFCLENBQUMsQ0FBQyxDQUFDO2FBQ3BHO1lBRUQsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBQzFCLENBQUM7UUFJRCxZQUN3QixvQkFBNEQsRUFDL0QsaUJBQXdELEVBQzdELFlBQTJCLEVBQzFCLGFBQWdEO1lBRWhFLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUxvQix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQzVDLHNCQUFpQixHQUFqQixp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