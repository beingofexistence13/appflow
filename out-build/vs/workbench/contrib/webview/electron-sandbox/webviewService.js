/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/webview/browser/webviewService", "vs/workbench/contrib/webview/electron-sandbox/webviewElement"], function (require, exports, webviewService_1, webviewElement_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Xac = void 0;
    class $Xac extends webviewService_1.$84b {
        createWebviewElement(initInfo) {
            const webview = this.b.createInstance(webviewElement_1.$Wac, initInfo, this.a);
            this.j(webview);
            return webview;
        }
    }
    exports.$Xac = $Xac;
});
//# sourceMappingURL=webviewService.js.map