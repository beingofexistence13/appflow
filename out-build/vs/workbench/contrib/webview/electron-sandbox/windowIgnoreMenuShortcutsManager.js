/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/base/parts/ipc/common/ipc"], function (require, exports, platform_1, ipc_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Vac = void 0;
    class $Vac {
        constructor(configurationService, mainProcessService, c) {
            this.c = c;
            this.a = configurationService.getValue('window.titleBarStyle') === 'native';
            this.b = ipc_1.ProxyChannel.toService(mainProcessService.getChannel('webview'));
        }
        didFocus() {
            this.e(true);
        }
        didBlur() {
            this.e(false);
        }
        get d() {
            return platform_1.$j || this.a;
        }
        e(value) {
            if (this.d) {
                this.b.setIgnoreMenuShortcuts({ windowId: this.c.windowId }, value);
            }
        }
    }
    exports.$Vac = $Vac;
});
//# sourceMappingURL=windowIgnoreMenuShortcutsManager.js.map