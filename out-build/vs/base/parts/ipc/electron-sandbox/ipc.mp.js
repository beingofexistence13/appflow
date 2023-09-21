/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/uuid", "vs/base/parts/sandbox/electron-sandbox/globals"], function (require, exports, event_1, uuid_1, globals_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$6S = void 0;
    async function $6S(requestChannel, responseChannel, nonce = (0, uuid_1.$4f)()) {
        // Get ready to acquire the message port from the
        // provided `responseChannel` via preload helper.
        globals_1.$N.acquire(responseChannel, nonce);
        // If a `requestChannel` is provided, we are in charge
        // to trigger acquisition of the message port from main
        if (typeof requestChannel === 'string') {
            globals_1.$M.send(requestChannel, nonce);
        }
        // Wait until the main side has returned the `MessagePort`
        // We need to filter by the `nonce` to ensure we listen
        // to the right response.
        const onMessageChannelResult = event_1.Event.fromDOMEventEmitter(window, 'message', (e) => ({ nonce: e.data, port: e.ports[0], source: e.source }));
        const { port } = await event_1.Event.toPromise(event_1.Event.once(event_1.Event.filter(onMessageChannelResult, e => e.nonce === nonce && e.source === window)));
        return port;
    }
    exports.$6S = $6S;
});
//# sourceMappingURL=ipc.mp.js.map