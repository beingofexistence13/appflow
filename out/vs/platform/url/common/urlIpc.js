/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri"], function (require, exports, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.URLHandlerRouter = exports.URLHandlerChannelClient = exports.URLHandlerChannel = void 0;
    class URLHandlerChannel {
        constructor(handler) {
            this.handler = handler;
        }
        listen(_, event) {
            throw new Error(`Event not found: ${event}`);
        }
        call(_, command, arg) {
            switch (command) {
                case 'handleURL': return this.handler.handleURL(uri_1.URI.revive(arg[0]), arg[1]);
            }
            throw new Error(`Call not found: ${command}`);
        }
    }
    exports.URLHandlerChannel = URLHandlerChannel;
    class URLHandlerChannelClient {
        constructor(channel) {
            this.channel = channel;
        }
        handleURL(uri, options) {
            return this.channel.call('handleURL', [uri.toJSON(), options]);
        }
    }
    exports.URLHandlerChannelClient = URLHandlerChannelClient;
    class URLHandlerRouter {
        constructor(next, logService) {
            this.next = next;
            this.logService = logService;
        }
        async routeCall(hub, command, arg, cancellationToken) {
            if (command !== 'handleURL') {
                throw new Error(`Call not found: ${command}`);
            }
            if (Array.isArray(arg) && arg.length > 0) {
                const uri = uri_1.URI.revive(arg[0]);
                this.logService.trace('URLHandlerRouter#routeCall() with URI argument', uri.toString(true));
                if (uri.query) {
                    const match = /\bwindowId=(\d+)/.exec(uri.query);
                    if (match) {
                        const windowId = match[1];
                        this.logService.trace(`URLHandlerRouter#routeCall(): found windowId query parameter with value "${windowId}"`, uri.toString(true));
                        const regex = new RegExp(`window:${windowId}`);
                        const connection = hub.connections.find(c => {
                            this.logService.trace('URLHandlerRouter#routeCall(): testing connection', c.ctx);
                            return regex.test(c.ctx);
                        });
                        if (connection) {
                            this.logService.trace('URLHandlerRouter#routeCall(): found a connection to route', uri.toString(true));
                            return connection;
                        }
                        else {
                            this.logService.trace('URLHandlerRouter#routeCall(): did not find a connection to route', uri.toString(true));
                        }
                    }
                    else {
                        this.logService.trace('URLHandlerRouter#routeCall(): did not find windowId query parameter', uri.toString(true));
                    }
                }
            }
            else {
                this.logService.trace('URLHandlerRouter#routeCall() without URI argument');
            }
            return this.next.routeCall(hub, command, arg, cancellationToken);
        }
        routeEvent(_, event) {
            throw new Error(`Event not found: ${event}`);
        }
    }
    exports.URLHandlerRouter = URLHandlerRouter;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJsSXBjLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdXJsL2NvbW1vbi91cmxJcGMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU2hHLE1BQWEsaUJBQWlCO1FBRTdCLFlBQW9CLE9BQW9CO1lBQXBCLFlBQU8sR0FBUCxPQUFPLENBQWE7UUFBSSxDQUFDO1FBRTdDLE1BQU0sQ0FBSSxDQUFVLEVBQUUsS0FBYTtZQUNsQyxNQUFNLElBQUksS0FBSyxDQUFDLG9CQUFvQixLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLENBQUM7UUFFRCxJQUFJLENBQUMsQ0FBVSxFQUFFLE9BQWUsRUFBRSxHQUFTO1lBQzFDLFFBQVEsT0FBTyxFQUFFO2dCQUNoQixLQUFLLFdBQVcsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsU0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUM1RTtZQUVELE1BQU0sSUFBSSxLQUFLLENBQUMsbUJBQW1CLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDL0MsQ0FBQztLQUNEO0lBZkQsOENBZUM7SUFFRCxNQUFhLHVCQUF1QjtRQUVuQyxZQUFvQixPQUFpQjtZQUFqQixZQUFPLEdBQVAsT0FBTyxDQUFVO1FBQUksQ0FBQztRQUUxQyxTQUFTLENBQUMsR0FBUSxFQUFFLE9BQXlCO1lBQzVDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDaEUsQ0FBQztLQUNEO0lBUEQsMERBT0M7SUFFRCxNQUFhLGdCQUFnQjtRQUU1QixZQUNTLElBQTJCLEVBQ2xCLFVBQXVCO1lB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