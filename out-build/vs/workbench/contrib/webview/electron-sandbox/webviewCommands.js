/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/webview/electron-sandbox/webviewCommands", "vs/platform/actions/common/actions", "vs/platform/native/common/native", "vs/platform/action/common/actionCommonCategories"], function (require, exports, nls, actions_1, native_1, actionCommonCategories_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Uac = void 0;
    class $Uac extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.webview.openDeveloperTools',
                title: { value: nls.localize(0, null), original: 'Open Webview Developer Tools' },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true
            });
        }
        async run(accessor) {
            const nativeHostService = accessor.get(native_1.$05b);
            const iframeWebviewElements = document.querySelectorAll('iframe.webview.ready');
            if (iframeWebviewElements.length) {
                console.info(nls.localize(1, null));
                nativeHostService.openDevTools();
            }
        }
    }
    exports.$Uac = $Uac;
});
//# sourceMappingURL=webviewCommands.js.map