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
define(["require", "exports", "electron", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/webview/electron-main/webviewProtocolProvider", "vs/platform/windows/electron-main/windows"], function (require, exports, electron_1, event_1, lifecycle_1, webviewProtocolProvider_1, windows_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebviewMainService = void 0;
    let WebviewMainService = class WebviewMainService extends lifecycle_1.Disposable {
        constructor(windowsMainService) {
            super();
            this.windowsMainService = windowsMainService;
            this._onFoundInFrame = this._register(new event_1.Emitter());
            this.onFoundInFrame = this._onFoundInFrame.event;
            this._register(new webviewProtocolProvider_1.WebviewProtocolProvider());
        }
        async setIgnoreMenuShortcuts(id, enabled) {
            let contents;
            if (typeof id.windowId === 'number') {
                const { windowId } = id;
                const window = this.windowsMainService.getWindowById(windowId);
                if (!window?.win) {
                    throw new Error(`Invalid windowId: ${windowId}`);
                }
                contents = window.win.webContents;
            }
            else {
                const { webContentsId } = id;
                contents = electron_1.webContents.fromId(webContentsId);
                if (!contents) {
                    throw new Error(`Invalid webContentsId: ${webContentsId}`);
                }
            }
            if (!contents.isDestroyed()) {
                contents.setIgnoreMenuShortcuts(enabled);
            }
        }
        async findInFrame(windowId, frameName, text, options) {
            const initialFrame = this.getFrameByName(windowId, frameName);
            const frame = initialFrame;
            if (typeof frame.findInFrame === 'function') {
                frame.findInFrame(text, {
                    findNext: options.findNext,
                    forward: options.forward,
                });
                const foundInFrameHandler = (_, result) => {
                    if (result.finalUpdate) {
                        this._onFoundInFrame.fire(result);
                        frame.removeListener('found-in-frame', foundInFrameHandler);
                    }
                };
                frame.on('found-in-frame', foundInFrameHandler);
            }
        }
        async stopFindInFrame(windowId, frameName, options) {
            const initialFrame = this.getFrameByName(windowId, frameName);
            const frame = initialFrame;
            if (typeof frame.stopFindInFrame === 'function') {
                frame.stopFindInFrame(options.keepSelection ? 'keepSelection' : 'clearSelection');
            }
        }
        getFrameByName(windowId, frameName) {
            const window = this.windowsMainService.getWindowById(windowId.windowId);
            if (!window?.win) {
                throw new Error(`Invalid windowId: ${windowId}`);
            }
            const frame = window.win.webContents.mainFrame.framesInSubtree.find(frame => {
                return frame.name === frameName;
            });
            if (!frame) {
                throw new Error(`Unknown frame: ${frameName}`);
            }
            return frame;
        }
    };
    exports.WebviewMainService = WebviewMainService;
    exports.WebviewMainService = WebviewMainService = __decorate([
        __param(0, windows_1.IWindowsMainService)
    ], WebviewMainService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vidmlld01haW5TZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vd2Vidmlldy9lbGVjdHJvbi1tYWluL3dlYnZpZXdNYWluU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFTekYsSUFBTSxrQkFBa0IsR0FBeEIsTUFBTSxrQkFBbUIsU0FBUSxzQkFBVTtRQU9qRCxZQUNzQixrQkFBd0Q7WUFFN0UsS0FBSyxFQUFFLENBQUM7WUFGOEIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUo3RCxvQkFBZSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQXNCLENBQUMsQ0FBQztZQUM5RSxtQkFBYyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDO1lBTWxELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxpREFBdUIsRUFBRSxDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUVNLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxFQUEwQyxFQUFFLE9BQWdCO1lBQy9GLElBQUksUUFBaUMsQ0FBQztZQUV0QyxJQUFJLE9BQVEsRUFBc0IsQ0FBQyxRQUFRLEtBQUssUUFBUSxFQUFFO2dCQUN6RCxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUksRUFBc0IsQ0FBQztnQkFDN0MsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDL0QsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUU7b0JBQ2pCLE1BQU0sSUFBSSxLQUFLLENBQUMscUJBQXFCLFFBQVEsRUFBRSxDQUFDLENBQUM7aUJBQ2pEO2dCQUNELFFBQVEsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQzthQUNsQztpQkFBTTtnQkFDTixNQUFNLEVBQUUs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