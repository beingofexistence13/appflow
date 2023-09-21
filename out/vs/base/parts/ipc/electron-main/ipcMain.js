/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "electron", "vs/base/common/errors"], function (require, exports, electron_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validatedIpcMain = void 0;
    class ValidatedIpcMain {
        constructor() {
            // We need to keep a map of original listener to the wrapped variant in order
            // to properly implement `removeListener`. We use a `WeakMap` because we do
            // not want to prevent the `key` of the map to get garbage collected.
            this.mapListenerToWrapper = new WeakMap();
        }
        /**
         * Listens to `channel`, when a new message arrives `listener` would be called with
         * `listener(event, args...)`.
         */
        on(channel, listener) {
            // Remember the wrapped listener so that later we can
            // properly implement `removeListener`.
            const wrappedListener = (event, ...args) => {
                if (this.validateEvent(channel, event)) {
                    listener(event, ...args);
                }
            };
            this.mapListenerToWrapper.set(listener, wrappedListener);
            electron_1.ipcMain.on(channel, wrappedListener);
            return this;
        }
        /**
         * Adds a one time `listener` function for the event. This `listener` is invoked
         * only the next time a message is sent to `channel`, after which it is removed.
         */
        once(channel, listener) {
            electron_1.ipcMain.once(channel, (event, ...args) => {
                if (this.validateEvent(channel, event)) {
                    listener(event, ...args);
                }
            });
            return this;
        }
        /**
         * Adds a handler for an `invoke`able IPC. This handler will be called whenever a
         * renderer calls `ipcRenderer.invoke(channel, ...args)`.
         *
         * If `listener` returns a Promise, the eventual result of the promise will be
         * returned as a reply to the remote caller. Otherwise, the return value of the
         * listener will be used as the value of the reply.
         *
         * The `event` that is passed as the first argument to the handler is the same as
         * that passed to a regular event listener. It includes information about which
         * WebContents is the source of the invoke request.
         *
         * Errors thrown through `handle` in the main process are not transparent as they
         * are serialized and only the `message` property from the original error is
         * provided to the renderer process. Please refer to #24427 for details.
         */
        handle(channel, listener) {
            electron_1.ipcMain.handle(channel, (event, ...args) => {
                if (this.validateEvent(channel, event)) {
                    return listener(event, ...args);
                }
                return Promise.reject(`Invalid channel '${channel}' or sender for ipcMain.handle() usage.`);
            });
            return this;
        }
        /**
         * Removes any handler for `channel`, if present.
         */
        removeHandler(channel) {
            electron_1.ipcMain.removeHandler(channel);
            return this;
        }
        /**
         * Removes the specified `listener` from the listener array for the specified
         * `channel`.
         */
        removeListener(channel, listener) {
            const wrappedListener = this.mapListenerToWrapper.get(listener);
            if (wrappedListener) {
                electron_1.ipcMain.removeListener(channel, wrappedListener);
                this.mapListenerToWrapper.delete(listener);
            }
            return this;
        }
        validateEvent(channel, event) {
            if (!channel || !channel.startsWith('vscode:')) {
                (0, errors_1.onUnexpectedError)(`Refused to handle ipcMain event for channel '${channel}' because the channel is unknown.`);
                return false; // unexpected channel
            }
            const sender = event.senderFrame;
            const url = sender.url;
            // `url` can be `undefined` when running tests from playwright https://github.com/microsoft/vscode/issues/147301
            // and `url` can be `about:blank` when reloading the window
            // from performance tab of devtools https://github.com/electron/electron/issues/39427.
            // It is fine to skip the checks in these cases.
            if (!url || url === 'about:blank') {
                return true;
            }
            let host = 'unknown';
            try {
                host = new URL(url).host;
            }
            catch (error) {
                (0, errors_1.onUnexpectedError)(`Refused to handle ipcMain event for channel '${channel}' because of a malformed URL '${url}'.`);
                return false; // unexpected URL
            }
            if (host !== 'vscode-app') {
                (0, errors_1.onUnexpectedError)(`Refused to handle ipcMain event for channel '${channel}' because of a bad origin of '${host}'.`);
                return false; // unexpected sender
            }
            if (sender.parent !== null) {
                (0, errors_1.onUnexpectedError)(`Refused to handle ipcMain event for channel '${channel}' because sender of origin '${host}' is not a main frame.`);
                return false; // unexpected frame
            }
            return true;
        }
    }
    /**
     * A drop-in replacement of `ipcMain` that validates the sender of a message
     * according to https://github.com/electron/electron/blob/main/docs/tutorial/security.md
     *
     * @deprecated direct use of Electron IPC is not encouraged. We have utilities in place
     * to create services on top of IPC, see `ProxyChannel` for more information.
     */
    exports.validatedIpcMain = new ValidatedIpcMain();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXBjTWFpbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvcGFydHMvaXBjL2VsZWN0cm9uLW1haW4vaXBjTWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRaEcsTUFBTSxnQkFBZ0I7UUFBdEI7WUFFQyw2RUFBNkU7WUFDN0UsMkVBQTJFO1lBQzNFLHFFQUFxRTtZQUNwRCx5QkFBb0IsR0FBRyxJQUFJLE9BQU8sRUFBb0MsQ0FBQztRQTZIekYsQ0FBQztRQTNIQTs7O1dBR0c7UUFDSCxFQUFFLENBQUMsT0FBZSxFQUFFLFFBQXlCO1lBRTVDLHFEQUFxRDtZQUNyRCx1Q0FBdUM7WUFDdkMsTUFBTSxlQUFlLEdBQUcsQ0FBQyxLQUFtQixFQUFFLEdBQUcsSUFBVyxFQUFFLEVBQUU7Z0JBQy9ELElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLEVBQUU7b0JBQ3ZDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztpQkFDekI7WUFDRixDQUFDLENBQUM7WUFFRixJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxlQUFlLENBQUMsQ0FBQztZQUV6RCxrQkFBYSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFFM0MsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRUQ7OztXQUdHO1FBQ0gsSUFBSSxDQUFDLE9BQWUsRUFBRSxRQUF5QjtZQUM5QyxrQkFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxLQUFtQixFQUFFLEdBQUcsSUFBVyxFQUFFLEVBQUU7Z0JBQ25FLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLEVBQUU7b0JBQ3ZDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsR0FBRyxJQUFJLENB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