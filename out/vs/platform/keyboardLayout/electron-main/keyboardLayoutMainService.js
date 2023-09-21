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
define(["require", "exports", "vs/base/common/platform", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/platform/lifecycle/electron-main/lifecycleMainService"], function (require, exports, platform, event_1, lifecycle_1, instantiation_1, lifecycleMainService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.KeyboardLayoutMainService = exports.IKeyboardLayoutMainService = void 0;
    exports.IKeyboardLayoutMainService = (0, instantiation_1.createDecorator)('keyboardLayoutMainService');
    let KeyboardLayoutMainService = class KeyboardLayoutMainService extends lifecycle_1.Disposable {
        constructor(lifecycleMainService) {
            super();
            this._onDidChangeKeyboardLayout = this._register(new event_1.Emitter());
            this.onDidChangeKeyboardLayout = this._onDidChangeKeyboardLayout.event;
            this._initPromise = null;
            this._keyboardLayoutData = null;
            // perf: automatically trigger initialize after windows
            // have opened so that we can do this work in parallel
            // to the window load.
            lifecycleMainService.when(3 /* LifecycleMainPhase.AfterWindowOpen */).then(() => this._initialize());
        }
        _initialize() {
            if (!this._initPromise) {
                this._initPromise = this._doInitialize();
            }
            return this._initPromise;
        }
        async _doInitialize() {
            const nativeKeymapMod = await new Promise((resolve_1, reject_1) => { require(['native-keymap'], resolve_1, reject_1); });
            this._keyboardLayoutData = readKeyboardLayoutData(nativeKeymapMod);
            if (!platform.isCI) {
                // See https://github.com/microsoft/vscode/issues/152840
                // Do not register the keyboard layout change listener in CI because it doesn't work
                // on the build machines and it just adds noise to the build logs.
                nativeKeymapMod.onDidChangeKeyboardLayout(() => {
                    this._keyboardLayoutData = readKeyboardLayoutData(nativeKeymapMod);
                    this._onDidChangeKeyboardLayout.fire(this._keyboardLayoutData);
                });
            }
        }
        async getKeyboardLayoutData() {
            await this._initialize();
            return this._keyboardLayoutData;
        }
    };
    exports.KeyboardLayoutMainService = KeyboardLayoutMainService;
    exports.KeyboardLayoutMainService = KeyboardLayoutMainService = __decorate([
        __param(0, lifecycleMainService_1.ILifecycleMainService)
    ], KeyboardLayoutMainService);
    function readKeyboardLayoutData(nativeKeymapMod) {
        const keyboardMapping = nativeKeymapMod.getKeyMap();
        const keyboardLayoutInfo = nativeKeymapMod.getCurrentKeyboardLayout();
        return { keyboardMapping, keyboardLayoutInfo };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5Ym9hcmRMYXlvdXRNYWluU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2tleWJvYXJkTGF5b3V0L2VsZWN0cm9uLW1haW4va2V5Ym9hcmRMYXlvdXRNYWluU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFVbkYsUUFBQSwwQkFBMEIsR0FBRyxJQUFBLCtCQUFlLEVBQTZCLDJCQUEyQixDQUFDLENBQUM7SUFJNUcsSUFBTSx5QkFBeUIsR0FBL0IsTUFBTSx5QkFBMEIsU0FBUSxzQkFBVTtRQVV4RCxZQUN3QixvQkFBMkM7WUFFbEUsS0FBSyxFQUFFLENBQUM7WUFUUSwrQkFBMEIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUF1QixDQUFDLENBQUM7WUFDeEYsOEJBQXlCLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEtBQUssQ0FBQztZQVMxRSxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztZQUN6QixJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO1lBRWhDLHVEQUF1RDtZQUN2RCxzREFBc0Q7WUFDdEQsc0JBQXNCO1lBQ3RCLG9CQUFvQixDQUFDLElBQUksNENBQW9DLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBQzlGLENBQUM7UUFFTyxXQUFXO1lBQ2xCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUN2QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQzthQUN6QztZQUNELE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztRQUMxQixDQUFDO1FBRU8sS0FBSyxDQUFDLGFBQWE7WUFDMUIsTUFBTSxlQUFlLEdBQUcsc0RBQWEsZUFBZSwyQkFBQyxDQUFDO1lBRXRELElBQUksQ0FBQyxtQkFBbUIsR0FBRyxzQkFBc0IsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNuRSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRTtnQkFDbkIsd0RBQXdEO2dCQUN4RCxvRkFBb0Y7Z0JBQ3BGLGtFQUFrRTtnQkFDbEUsZUFBZSxDQUFDLHlCQUF5QixDQUFDLEdBQUcsRUFBRTtvQkFDOUMsSUFBSSxDQUFDLG1CQUFtQixHQUFHLHNCQUFzQixDQUFDLGVBQWUsQ0FBQyxDQUFDO29CQUNuRSxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO2dCQUNoRSxDQUFDLENBQUMsQ0FBQzthQUNIO1FBQ0YsQ0FBQztRQUVNLEtBQUssQ0FBQyxxQkFBcUI7WUFDakMsTUFBTSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDekIsT0FBTyxJQUFJLENBQUMsbUJBQW9CLENBQUM7UUFDbEMsQ0FBQztLQUNELENBQUE7SUFqRFksOERBQXlCO3dDQUF6Qix5QkFBeUI7UUFXbkMsV0FBQSw0Q0FBcUIsQ0FBQTtPQVhYLHlCQUF5QixDQWlEckM7SUFFRCxTQUFTLHNCQUFzQixDQUFDLGVBQW9DO1FBQ25FLE1BQU0sZUFBZSxHQUFHLGVBQWUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNwRCxNQUFNLGtCQUFrQixHQUFHLGVBQWUsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1FBQ3RFLE9BQU8sRUFBRSxlQUFlLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQztJQUNoRCxDQUFDIn0=