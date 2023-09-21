/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/base/parts/ipc/common/ipc"], function (require, exports, platform_1, ipc_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WindowIgnoreMenuShortcutsManager = void 0;
    class WindowIgnoreMenuShortcutsManager {
        constructor(configurationService, mainProcessService, _nativeHostService) {
            this._nativeHostService = _nativeHostService;
            this._isUsingNativeTitleBars = configurationService.getValue('window.titleBarStyle') === 'native';
            this._webviewMainService = ipc_1.ProxyChannel.toService(mainProcessService.getChannel('webview'));
        }
        didFocus() {
            this.setIgnoreMenuShortcuts(true);
        }
        didBlur() {
            this.setIgnoreMenuShortcuts(false);
        }
        get _shouldToggleMenuShortcutsEnablement() {
            return platform_1.isMacintosh || this._isUsingNativeTitleBars;
        }
        setIgnoreMenuShortcuts(value) {
            if (this._shouldToggleMenuShortcutsEnablement) {
                this._webviewMainService.setIgnoreMenuShortcuts({ windowId: this._nativeHostService.windowId }, value);
            }
        }
    }
    exports.WindowIgnoreMenuShortcutsManager = WindowIgnoreMenuShortcutsManager;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93SWdub3JlTWVudVNob3J0Y3V0c01hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi93ZWJ2aWV3L2VsZWN0cm9uLXNhbmRib3gvd2luZG93SWdub3JlTWVudVNob3J0Y3V0c01hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU2hHLE1BQWEsZ0NBQWdDO1FBTTVDLFlBQ0Msb0JBQTJDLEVBQzNDLGtCQUF1QyxFQUN0QixrQkFBc0M7WUFBdEMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtZQUV2RCxJQUFJLENBQUMsdUJBQXVCLEdBQUcsb0JBQW9CLENBQUMsUUFBUSxDQUFTLHNCQUFzQixDQUFDLEtBQUssUUFBUSxDQUFDO1lBRTFHLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxrQkFBWSxDQUFDLFNBQVMsQ0FBeUIsa0JBQWtCLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDckgsQ0FBQztRQUVNLFFBQVE7WUFDZCxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkMsQ0FBQztRQUVNLE9BQU87WUFDYixJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEMsQ0FBQztRQUVELElBQVksb0NBQW9DO1lBQy9DLE9BQU8sc0JBQVcsSUFBSSxJQUFJLENBQUMsdUJBQXVCLENBQUM7UUFDcEQsQ0FBQztRQUVTLHNCQUFzQixDQUFDLEtBQWM7WUFDOUMsSUFBSSxJQUFJLENBQUMsb0NBQW9DLEVBQUU7Z0JBQzlDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDdkc7UUFDRixDQUFDO0tBQ0Q7SUFqQ0QsNEVBaUNDIn0=