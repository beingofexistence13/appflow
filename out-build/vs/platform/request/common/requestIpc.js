/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/cancellation"], function (require, exports, buffer_1, cancellation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Mq = exports.$Lq = void 0;
    class $Lq {
        constructor(a) {
            this.a = a;
        }
        listen(context, event) {
            throw new Error('Invalid listen');
        }
        call(context, command, args, token = cancellation_1.CancellationToken.None) {
            switch (command) {
                case 'request': return this.a.request(args[0], token)
                    .then(async ({ res, stream }) => {
                    const buffer = await (0, buffer_1.$Rd)(stream);
                    return [{ statusCode: res.statusCode, headers: res.headers }, buffer];
                });
                case 'resolveProxy': return this.a.resolveProxy(args[0]);
            }
            throw new Error('Invalid call');
        }
    }
    exports.$Lq = $Lq;
    class $Mq {
        constructor(a) {
            this.a = a;
        }
        async request(options, token) {
            const [res, buffer] = await this.a.call('request', [options], token);
            return { res, stream: (0, buffer_1.$Td)(buffer) };
        }
        async resolveProxy(url) {
            return this.a.call('resolveProxy', [url]);
        }
    }
    exports.$Mq = $Mq;
});
//# sourceMappingURL=requestIpc.js.map