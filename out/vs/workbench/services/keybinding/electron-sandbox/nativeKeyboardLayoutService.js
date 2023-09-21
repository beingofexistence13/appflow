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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/keyboardLayout/common/keyboardLayout", "vs/base/common/event", "vs/base/common/platform", "vs/platform/ipc/common/mainProcessService", "vs/base/parts/ipc/common/ipc", "vs/platform/instantiation/common/instantiation"], function (require, exports, lifecycle_1, keyboardLayout_1, event_1, platform_1, mainProcessService_1, ipc_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeKeyboardLayoutService = exports.INativeKeyboardLayoutService = void 0;
    exports.INativeKeyboardLayoutService = (0, instantiation_1.createDecorator)('nativeKeyboardLayoutService');
    let NativeKeyboardLayoutService = class NativeKeyboardLayoutService extends lifecycle_1.Disposable {
        constructor(mainProcessService) {
            super();
            this._onDidChangeKeyboardLayout = this._register(new event_1.Emitter());
            this.onDidChangeKeyboardLayout = this._onDidChangeKeyboardLayout.event;
            this._keyboardLayoutService = ipc_1.ProxyChannel.toService(mainProcessService.getChannel('keyboardLayout'));
            this._initPromise = null;
            this._keyboardMapping = null;
            this._keyboardLayoutInfo = null;
            this._register(this._keyboardLayoutService.onDidChangeKeyboardLayout(async ({ keyboardLayoutInfo, keyboardMapping }) => {
                await this.initialize();
                if (keyboardMappingEquals(this._keyboardMapping, keyboardMapping)) {
                    // the mappings are equal
                    return;
                }
                this._keyboardMapping = keyboardMapping;
                this._keyboardLayoutInfo = keyboardLayoutInfo;
                this._onDidChangeKeyboardLayout.fire();
            }));
        }
        initialize() {
            if (!this._initPromise) {
                this._initPromise = this._doInitialize();
            }
            return this._initPromise;
        }
        async _doInitialize() {
            const keyboardLayoutData = await this._keyboardLayoutService.getKeyboardLayoutData();
            const { keyboardLayoutInfo, keyboardMapping } = keyboardLayoutData;
            this._keyboardMapping = keyboardMapping;
            this._keyboardLayoutInfo = keyboardLayoutInfo;
        }
        getRawKeyboardMapping() {
            return this._keyboardMapping;
        }
        getCurrentKeyboardLayout() {
            return this._keyboardLayoutInfo;
        }
    };
    exports.NativeKeyboardLayoutService = NativeKeyboardLayoutService;
    exports.NativeKeyboardLayoutService = NativeKeyboardLayoutService = __decorate([
        __param(0, mainProcessService_1.IMainProcessService)
    ], NativeKeyboardLayoutService);
    function keyboardMappingEquals(a, b) {
        if (platform_1.OS === 1 /* OperatingSystem.Windows */) {
            return (0, keyboardLayout_1.windowsKeyboardMappingEquals)(a, b);
        }
        return (0, keyboardLayout_1.macLinuxKeyboardMappingEquals)(a, b);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF0aXZlS2V5Ym9hcmRMYXlvdXRTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2tleWJpbmRpbmcvZWxlY3Ryb24tc2FuZGJveC9uYXRpdmVLZXlib2FyZExheW91dFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBV25GLFFBQUEsNEJBQTRCLEdBQUcsSUFBQSwrQkFBZSxFQUErQiw2QkFBNkIsQ0FBQyxDQUFDO0lBU2xILElBQU0sMkJBQTJCLEdBQWpDLE1BQU0sMkJBQTRCLFNBQVEsc0JBQVU7UUFZMUQsWUFDc0Isa0JBQXVDO1lBRTVELEtBQUssRUFBRSxDQUFDO1lBWFEsK0JBQTBCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDekUsOEJBQXlCLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEtBQUssQ0FBQztZQVcxRSxJQUFJLENBQUMsc0JBQXNCLEdBQUcsa0JBQVksQ0FBQyxTQUFTLENBQW1DLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFDeEksSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7WUFDekIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztZQUM3QixJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO1lBRWhDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLHlCQUF5QixDQUFDLEtBQUssRUFBRSxFQUFFLGtCQUFrQixFQUFFLGVBQWUsRUFBRSxFQUFFLEVBQUU7Z0JBQ3RILE1BQU0sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUN4QixJQUFJLHFCQUFxQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLENBQUMsRUFBRTtvQkFDbEUseUJBQXlCO29CQUN6QixPQUFPO2lCQUNQO2dCQUVELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxlQUFlLENBQUM7Z0JBQ3hDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxrQkFBa0IsQ0FBQztnQkFDOUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3hDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRU0sVUFBVTtZQUNoQixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDdkIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7YUFDekM7WUFDRCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDMUIsQ0FBQztRQUVPLEtBQUssQ0FBQyxhQUFhO1lBQzFCLE1BQU0sa0JBQWtCLEdBQUcsTUFBTSxJQUFJLENBQUMsc0JBQXNCLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUNyRixNQUFNLEVBQUUsa0JBQWtCLEVBQUUsZUFBZSxFQUFFLEdBQUcsa0JBQWtCLENBQUM7WUFDbkUsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGVBQWUsQ0FBQztZQUN4QyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsa0JBQWtCLENBQUM7UUFDL0MsQ0FBQztRQUVNLHFCQUFxQjtZQUMzQixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztRQUM5QixDQUFDO1FBRU0sd0JBQXdCO1lBQzlCLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDO1FBQ2pDLENBQUM7S0FDRCxDQUFBO0lBdkRZLGtFQUEyQjswQ0FBM0IsMkJBQTJCO1FBYXJDLFdBQUEsd0NBQW1CLENBQUE7T0FiVCwyQkFBMkIsQ0F1RHZDO0lBRUQsU0FBUyxxQkFBcUIsQ0FBQyxDQUEwQixFQUFFLENBQTBCO1FBQ3BGLElBQUksYUFBRSxvQ0FBNEIsRUFBRTtZQUNuQyxPQUFPLElBQUEsNkNBQTRCLEVBQWlDLENBQUMsRUFBa0MsQ0FBQyxDQUFDLENBQUM7U0FDMUc7UUFFRCxPQUFPLElBQUEsOENBQTZCLEVBQWtDLENBQUMsRUFBbUMsQ0FBQyxDQUFDLENBQUM7SUFDOUcsQ0FBQyJ9