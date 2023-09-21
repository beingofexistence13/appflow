/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionHostDebugChannelClient = exports.ExtensionHostDebugBroadcastChannel = void 0;
    class ExtensionHostDebugBroadcastChannel {
        constructor() {
            this._onCloseEmitter = new event_1.Emitter();
            this._onReloadEmitter = new event_1.Emitter();
            this._onTerminateEmitter = new event_1.Emitter();
            this._onAttachEmitter = new event_1.Emitter();
        }
        static { this.ChannelName = 'extensionhostdebugservice'; }
        call(ctx, command, arg) {
            switch (command) {
                case 'close':
                    return Promise.resolve(this._onCloseEmitter.fire({ sessionId: arg[0] }));
                case 'reload':
                    return Promise.resolve(this._onReloadEmitter.fire({ sessionId: arg[0] }));
                case 'terminate':
                    return Promise.resolve(this._onTerminateEmitter.fire({ sessionId: arg[0] }));
                case 'attach':
                    return Promise.resolve(this._onAttachEmitter.fire({ sessionId: arg[0], port: arg[1], subId: arg[2] }));
            }
            throw new Error('Method not implemented.');
        }
        listen(ctx, event, arg) {
            switch (event) {
                case 'close':
                    return this._onCloseEmitter.event;
                case 'reload':
                    return this._onReloadEmitter.event;
                case 'terminate':
                    return this._onTerminateEmitter.event;
                case 'attach':
                    return this._onAttachEmitter.event;
            }
            throw new Error('Method not implemented.');
        }
    }
    exports.ExtensionHostDebugBroadcastChannel = ExtensionHostDebugBroadcastChannel;
    class ExtensionHostDebugChannelClient extends lifecycle_1.Disposable {
        constructor(channel) {
            super();
            this.channel = channel;
        }
        reload(sessionId) {
            this.channel.call('reload', [sessionId]);
        }
        get onReload() {
            return this.channel.listen('reload');
        }
        close(sessionId) {
            this.channel.call('close', [sessionId]);
        }
        get onClose() {
            return this.channel.listen('close');
        }
        attachSession(sessionId, port, subId) {
            this.channel.call('attach', [sessionId, port, subId]);
        }
        get onAttachSession() {
            return this.channel.listen('attach');
        }
        terminateSession(sessionId, subId) {
            this.channel.call('terminate', [sessionId, subId]);
        }
        get onTerminateSession() {
            return this.channel.listen('terminate');
        }
        openExtensionDevelopmentHostWindow(args, debugRenderer) {
            return this.channel.call('openExtensionDevelopmentHostWindow', [args, debugRenderer]);
        }
    }
    exports.ExtensionHostDebugChannelClient = ExtensionHostDebugChannelClient;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uSG9zdERlYnVnSXBjLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZGVidWcvY29tbW9uL2V4dGVuc2lvbkhvc3REZWJ1Z0lwYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFPaEcsTUFBYSxrQ0FBa0M7UUFBL0M7WUFJa0Isb0JBQWUsR0FBRyxJQUFJLGVBQU8sRUFBc0IsQ0FBQztZQUNwRCxxQkFBZ0IsR0FBRyxJQUFJLGVBQU8sRUFBdUIsQ0FBQztZQUN0RCx3QkFBbUIsR0FBRyxJQUFJLGVBQU8sRUFBMEIsQ0FBQztZQUM1RCxxQkFBZ0IsR0FBRyxJQUFJLGVBQU8sRUFBdUIsQ0FBQztRQTZCeEUsQ0FBQztpQkFsQ2dCLGdCQUFXLEdBQUcsMkJBQTJCLEFBQTlCLENBQStCO1FBTzFELElBQUksQ0FBQyxHQUFhLEVBQUUsT0FBZSxFQUFFLEdBQVM7WUFDN0MsUUFBUSxPQUFPLEVBQUU7Z0JBQ2hCLEtBQUssT0FBTztvQkFDWCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMxRSxLQUFLLFFBQVE7b0JBQ1osT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMzRSxLQUFLLFdBQVc7b0JBQ2YsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUM5RSxL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