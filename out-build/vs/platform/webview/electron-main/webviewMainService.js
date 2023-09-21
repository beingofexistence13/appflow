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
    exports.$R6b = void 0;
    let $R6b = class $R6b extends lifecycle_1.$kc {
        constructor(b) {
            super();
            this.b = b;
            this.a = this.B(new event_1.$fd());
            this.onFoundInFrame = this.a.event;
            this.B(new webviewProtocolProvider_1.$Q6b());
        }
        async setIgnoreMenuShortcuts(id, enabled) {
            let contents;
            if (typeof id.windowId === 'number') {
                const { windowId } = id;
                const window = this.b.getWindowById(windowId);
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
            const initialFrame = this.c(windowId, frameName);
            const frame = initialFrame;
            if (typeof frame.findInFrame === 'function') {
                frame.findInFrame(text, {
                    findNext: options.findNext,
                    forward: options.forward,
                });
                const foundInFrameHandler = (_, result) => {
                    if (result.finalUpdate) {
                        this.a.fire(result);
                        frame.removeListener('found-in-frame', foundInFrameHandler);
                    }
                };
                frame.on('found-in-frame', foundInFrameHandler);
            }
        }
        async stopFindInFrame(windowId, frameName, options) {
            const initialFrame = this.c(windowId, frameName);
            const frame = initialFrame;
            if (typeof frame.stopFindInFrame === 'function') {
                frame.stopFindInFrame(options.keepSelection ? 'keepSelection' : 'clearSelection');
            }
        }
        c(windowId, frameName) {
            const window = this.b.getWindowById(windowId.windowId);
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
    exports.$R6b = $R6b;
    exports.$R6b = $R6b = __decorate([
        __param(0, windows_1.$B5b)
    ], $R6b);
});
//# sourceMappingURL=webviewMainService.js.map