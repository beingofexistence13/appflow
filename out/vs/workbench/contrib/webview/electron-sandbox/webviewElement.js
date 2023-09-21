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
    exports.ElectronWebviewElement = void 0;
    /**
     * Webview backed by an iframe but that uses Electron APIs to power the webview.
     */
    let ElectronWebviewElement = class ElectronWebviewElement extends webviewElement_1.WebviewElement {
        get platform() { return 'electron'; }
        constructor(initInfo, webviewThemeDataProvider, contextMenuService, tunnelService, fileService, telemetryService, environmentService, remoteAuthorityResolverService, logService, configurationService, mainProcessService, notificationService, _nativeHostService, instantiationService, accessibilityService) {
            super(initInfo, webviewThemeDataProvider, configurationService, contextMenuService, notificationService, environmentService, fileService, logService, remoteAuthorityResolverService, telemetryService, tunnelService, instantiationService, accessibilityService);
            this._nativeHostService = _nativeHostService;
            this._findStarted = false;
            this._iframeDelayer = this._register(new async_1.Delayer(200));
            this._webviewKeyboardHandler = new windowIgnoreMenuShortcutsManager_1.WindowIgnoreMenuShortcutsManager(configurationService, mainProcessService, _nativeHostService);
            this._webviewMainService = ipc_1.ProxyChannel.toService(mainProcessService.getChannel('webview'));
            if (initInfo.options.enableFindWidget) {
                this._register(this.onDidHtmlChange((newContent) => {
                    if (this._findStarted && this._cachedHtmlContent !== newContent) {
                        this.stopFind(false);
                        this._cachedHtmlContent = newContent;
                    }
                }));
                this._register(this._webviewMainService.onFoundInFrame((result) => {
                    this._hasFindResult.fire(result.matches > 0);
                }));
            }
        }
        dispose() {
            // Make sure keyboard handler knows it closed (#71800)
            this._webviewKeyboardHandler.didBlur();
            super.dispose();
        }
        webviewContentEndpoint(iframeId) {
            return `${network_1.Schemas.vscodeWebview}://${iframeId}`;
        }
        streamToBuffer(stream) {
            // Join buffers from stream without using the Node.js backing pool.
            // This lets us transfer the resulting buffer to the webview.
            return (0, stream_1.consumeStream)(stream, (buffers) => {
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
            if (!this.element) {
                return;
            }
            if (!this._findStarted) {
                this.updateFind(value);
            }
            else {
                // continuing the find, so set findNext to false
                const options = { forward: !previous, findNext: false, matchCase: false };
                this._webviewMainService.findInFrame({ windowId: this._nativeHostService.windowId }, this.id, value, options);
            }
        }
        updateFind(value) {
            if (!value || !this.element) {
                return;
            }
            // FindNext must be true for a first request
            const options = {
                forward: true,
                findNext: true,
                matchCase: false
            };
            this._iframeDelayer.trigger(() => {
                this._findStarted = true;
                this._webviewMainService.findInFrame({ windowId: this._nativeHostService.windowId }, this.id, value, options);
            });
        }
        stopFind(keepSelection) {
            if (!this.element) {
                return;
            }
            this._iframeDelayer.cancel();
            this._findStarted = false;
            this._webviewMainService.stopFindInFrame({ windowId: this._nativeHostService.windowId }, this.id, {
                keepSelection
            });
            this._onDidStopFind.fire();
        }
        handleFocusChange(isFocused) {
            super.handleFocusChange(isFocused);
            if (isFocused) {
                this._webviewKeyboardHandler.didFocus();
            }
            else {
                this._webviewKeyboardHandler.didBlur();
            }
        }
    };
    exports.ElectronWebviewElement = ElectronWebviewElement;
    exports.ElectronWebviewElement = ElectronWebviewElement = __decorate([
        __param(2, contextView_1.IContextMenuService),
        __param(3, tunnel_1.ITunnelService),
        __param(4, files_1.IFileService),
        __param(5, telemetry_1.ITelemetryService),
        __param(6, environmentService_1.IWorkbenchEnvironmentService),
        __param(7, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(8, log_1.ILogService),
        __param(9, configuration_1.IConfigurationService),
        __param(10, mainProcessService_1.IMainProcessService),
        __param(11, notification_1.INotificationService),
        __param(12, native_1.INativeHostService),
        __param(13, instantiation_1.IInstantiationService),
        __param(14, accessibility_1.IAccessibilityService)
    ], ElectronWebviewElement);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vidmlld0VsZW1lbnQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi93ZWJ2aWV3L2VsZWN0cm9uLXNhbmRib3gvd2Vidmlld0VsZW1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBMEJoRzs7T0FFRztJQUNJLElBQU0sc0JBQXNCLEdBQTVCLE1BQU0sc0JBQXVCLFNBQVEsK0JBQWM7UUFVekQsSUFBdUIsUUFBUSxLQUFLLE9BQU8sVUFBVSxDQUFDLENBQUMsQ0FBQztRQUV4RCxZQUNDLFFBQXlCLEVBQ3pCLHdCQUFrRCxFQUM3QixrQkFBdUMsRUFDNUMsYUFBNkIsRUFDL0IsV0FBeUIsRUFDcEIsZ0JBQW1DLEVBQ3hCLGtCQUFnRCxFQUM3Qyw4QkFBK0QsRUFDbkYsVUFBdUIsRUFDYixvQkFBMkMsRUFDN0Msa0JBQXVDLEVBQ3RDLG1CQUF5QyxFQUMzQyxrQkFBdUQsRUFDcEQsb0JBQTJDLEVBQzNDLG9CQUEyQztZQUVsRSxLQUFLLENBQUMsUUFBUSxFQUFFLHdCQUF3QixFQUN2QyxvQkFBb0IsRUFBRSxrQkFBa0IsRUFBRSxtQkFBbUIsRUFBRSxrQkFBa0IsRUFDakYsV0FBVyxFQUFFLFVBQVUsRUFBRSw4QkFBOEIsRUFBRSxnQkFBZ0IsRUFBRSxhQUFhLEVBQUUsb0JBQW9CLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQU5sRyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBckJwRSxpQkFBWSxHQUFZLEtBQUssQ0FBQztZQUlyQixtQkFBYyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLENBQU8sR0FBRyxDQUFDLENBQUMsQ0FBQztZQXlCeEUsSUFBSSxDQUFDLHVCQUF1QixHQUFHLElBQUksbUVBQWdDLENBQUMsb0JBQW9CLEVBQUUsa0JBQWtCLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQUVsSSxJQUFJLENBQUMsbUJBQW1CLEdBQUcsa0JBQVksQ0FBQyxTQUFTLENBQXlCLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBRXBILElBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRTtnQkFDdEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsVUFBVSxFQUFFLEVBQUU7b0JBQ2xELElBQUksSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsa0JBQWtCLEtBQUssVUFBVSxFQUFFO3dCQUNoRSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUNyQixJQUFJLENBQUMsa0JBQWtCLEdBQUcsVUFBVSxDQUFDO3FCQUNyQztnQkFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUVKLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGNBQWMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO29CQUNqRSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUM5QyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ0o7UUFDRixDQUFDO1FBRVEsT0FBTztZQUNmLHNEQUFzRDtZQUN0RCxJQUFJLENBQUMsdUJBQXVCLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFdkMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUM7UUFFa0Isc0JBQXNCLENBQUMsUUFBZ0I7WUFDekQsT0FBTyxHQUFHLGlCQUFPLENBQUMsYUFBYSxNQUFNLFFBQVEsRUFBRSxDQUFDO1FBQ2pELENBQUM7UUFFa0IsY0FBYyxDQUFDLE1BQThCO1lBQy9ELG1FQUFtRTtZQUNuRSw2REFBNkQ7WUFDN0QsT0FBTyxJQUFBLHNCQUFhLEVBQTRCLE1BQU0sRUFBRSxDQUFDLE9BQTRCLEVBQUUsRUFBRTtnQkFDeEYsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUM5RSxNQUFNLEdBQUcsR0FBRyxJQUFJLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDekMsTUFBTSxJQUFJLEdBQUcsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2pDLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztnQkFDZixLQUFLLE1BQU0sT0FBTyxJQUFJLE9BQU8sRUFBRTtvQkFDOUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO29CQUNqQyxNQUFNLElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQztpQkFDN0I7Z0JBQ0QsT0FBTyxHQUFHLENBQUM7WUFDWixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRDs7Ozs7O1dBTUc7UUFDYSxJQUFJLENBQUMsS0FBYSxFQUFFLFFBQWlCO1lBQ3BELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNsQixPQUFPO2FBQ1A7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDdkIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUN2QjtpQkFBTTtnQkFDTixnREFBZ0Q7Z0JBQ2hELE1BQU0sT0FBTyxHQUF1QixFQUFFLE9BQU8sRUFBRSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsQ0FBQztnQkFDOUYsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7YUFDOUc7UUFDRixDQUFDO1FBRWUsVUFBVSxDQUFDLEtBQWE7WUFDdkMsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQzVCLE9BQU87YUFDUDtZQUVELDRDQUE0QztZQUM1QyxNQUFNLE9BQU8sR0FBdUI7Z0JBQ25DLE9BQU8sRUFBRSxJQUFJO2dCQUNiLFFBQVEsRUFBRSxJQUFJO2dCQUNkLFNBQVMsRUFBRSxLQUFLO2FBQ2hCLENBQUM7WUFFRixJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUU7Z0JBQ2hDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO2dCQUN6QixJQUFJLENBQUMsbUJBQW1CLENBQUMsV0FBVyxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMvRyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFZSxRQUFRLENBQUMsYUFBdUI7WUFDL0MsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2xCLE9BQU87YUFDUDtZQUNELElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDN0IsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7WUFDMUIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGVBQWUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRTtnQkFDakcsYUFBYTthQUNiLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDNUIsQ0FBQztRQUVrQixpQkFBaUIsQ0FBQyxTQUFrQjtZQUN0RCxLQUFLLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbkMsSUFBSSxTQUFTLEVBQUU7Z0JBQ2QsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQ3hDO2lCQUFNO2dCQUNOLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUN2QztRQUNGLENBQUM7S0FDRCxDQUFBO0lBeklZLHdEQUFzQjtxQ0FBdEIsc0JBQXNCO1FBZWhDLFdBQUEsaUNBQW1CLENBQUE7UUFDbkIsV0FBQSx1QkFBYyxDQUFBO1FBQ2QsV0FBQSxvQkFBWSxDQUFBO1FBQ1osV0FBQSw2QkFBaUIsQ0FBQTtRQUNqQixXQUFBLGlEQUE0QixDQUFBO1FBQzVCLFdBQUEseURBQStCLENBQUE7UUFDL0IsV0FBQSxpQkFBVyxDQUFBO1FBQ1gsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixZQUFBLHdDQUFtQixDQUFBO1FBQ25CLFlBQUEsbUNBQW9CLENBQUE7UUFDcEIsWUFBQSwyQkFBa0IsQ0FBQTtRQUNsQixZQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFlBQUEscUNBQXFCLENBQUE7T0EzQlgsc0JBQXNCLENBeUlsQyJ9