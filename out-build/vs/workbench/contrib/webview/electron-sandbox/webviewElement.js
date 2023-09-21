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
define(["require", "exports", "vs/base/common/async", "vs/base/common/network", "vs/base/common/stream", "vs/base/parts/ipc/common/ipc", "vs/platform/accessibility/common/accessibility", "vs/platform/configuration/common/configuration", "vs/platform/contextview/browser/contextView", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/ipc/common/mainProcessService", "vs/platform/log/common/log", "vs/platform/native/common/native", "vs/platform/notification/common/notification", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/telemetry/common/telemetry", "vs/platform/tunnel/common/tunnel", "vs/workbench/contrib/webview/browser/webviewElement", "vs/workbench/contrib/webview/electron-sandbox/windowIgnoreMenuShortcutsManager", "vs/workbench/services/environment/common/environmentService"], function (require, exports, async_1, network_1, stream_1, ipc_1, accessibility_1, configuration_1, contextView_1, files_1, instantiation_1, mainProcessService_1, log_1, native_1, notification_1, remoteAuthorityResolver_1, telemetry_1, tunnel_1, webviewElement_1, windowIgnoreMenuShortcutsManager_1, environmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Wac = void 0;
    /**
     * Webview backed by an iframe but that uses Electron APIs to power the webview.
     */
    let $Wac = class $Wac extends webviewElement_1.$64b {
        get f() { return 'electron'; }
        constructor(initInfo, webviewThemeDataProvider, contextMenuService, tunnelService, fileService, telemetryService, environmentService, remoteAuthorityResolverService, logService, configurationService, mainProcessService, notificationService, Ib, instantiationService, accessibilityService) {
            super(initInfo, webviewThemeDataProvider, configurationService, contextMenuService, notificationService, environmentService, fileService, logService, remoteAuthorityResolverService, telemetryService, tunnelService, instantiationService, accessibilityService);
            this.Ib = Ib;
            this.Db = false;
            this.Gb = this.B(new async_1.$Dg(200));
            this.Cb = new windowIgnoreMenuShortcutsManager_1.$Vac(configurationService, mainProcessService, Ib);
            this.Fb = ipc_1.ProxyChannel.toService(mainProcessService.getChannel('webview'));
            if (initInfo.options.enableFindWidget) {
                this.B(this.F((newContent) => {
                    if (this.Db && this.Eb !== newContent) {
                        this.stopFind(false);
                        this.Eb = newContent;
                    }
                }));
                this.B(this.Fb.onFoundInFrame((result) => {
                    this.Ab.fire(result.matches > 0);
                }));
            }
        }
        dispose() {
            // Make sure keyboard handler knows it closed (#71800)
            this.Cb.didBlur();
            super.dispose();
        }
        lb(iframeId) {
            return `${network_1.Schemas.vscodeWebview}://${iframeId}`;
        }
        xb(stream) {
            // Join buffers from stream without using the Node.js backing pool.
            // This lets us transfer the resulting buffer to the webview.
            return (0, stream_1.$wd)(stream, (buffers) => {
                const totalLength = buffers.reduce((prev, curr) => prev + curr.byteLength, 0);
                const ret = new ArrayBuffer(totalLength);
                const view = new Uint8Array(ret);
                let offset = 0;
                for (const element of buffers) {
                    view.set(element.buffer, offset);
                    offset += element.byteLength;
                }
                return ret;
            });
        }
        /**
         * Webviews expose a stateful find API.
         * Successive calls to find will move forward or backward through onFindResults
         * depending on the supplied options.
         *
         * @param value The string to search for. Empty strings are ignored.
         */
        find(value, previous) {
            if (!this.j) {
                return;
            }
            if (!this.Db) {
                this.updateFind(value);
            }
            else {
                // continuing the find, so set findNext to false
                const options = { forward: !previous, findNext: false, matchCase: false };
                this.Fb.findInFrame({ windowId: this.Ib.windowId }, this.a, value, options);
            }
        }
        updateFind(value) {
            if (!value || !this.j) {
                return;
            }
            // FindNext must be true for a first request
            const options = {
                forward: true,
                findNext: true,
                matchCase: false
            };
            this.Gb.trigger(() => {
                this.Db = true;
                this.Fb.findInFrame({ windowId: this.Ib.windowId }, this.a, value, options);
            });
        }
        stopFind(keepSelection) {
            if (!this.j) {
                return;
            }
            this.Gb.cancel();
            this.Db = false;
            this.Fb.stopFindInFrame({ windowId: this.Ib.windowId }, this.a, {
                keepSelection
            });
            this.Bb.fire();
        }
        tb(isFocused) {
            super.tb(isFocused);
            if (isFocused) {
                this.Cb.didFocus();
            }
            else {
                this.Cb.didBlur();
            }
        }
    };
    exports.$Wac = $Wac;
    exports.$Wac = $Wac = __decorate([
        __param(2, contextView_1.$WZ),
        __param(3, tunnel_1.$Wz),
        __param(4, files_1.$6j),
        __param(5, telemetry_1.$9k),
        __param(6, environmentService_1.$hJ),
        __param(7, remoteAuthorityResolver_1.$Jk),
        __param(8, log_1.$5i),
        __param(9, configuration_1.$8h),
        __param(10, mainProcessService_1.$o7b),
        __param(11, notification_1.$Yu),
        __param(12, native_1.$05b),
        __param(13, instantiation_1.$Ah),
        __param(14, accessibility_1.$1r)
    ], $Wac);
});
//# sourceMappingURL=webviewElement.js.map