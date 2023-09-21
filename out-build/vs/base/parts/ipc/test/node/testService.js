/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/event"], function (require, exports, async_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$gT = exports.$fT = exports.$eT = void 0;
    class $eT {
        constructor() {
            this.a = new event_1.$fd();
            this.onMarco = this.a.event;
        }
        marco() {
            this.a.fire({ answer: 'polo' });
            return Promise.resolve('polo');
        }
        pong(ping) {
            return Promise.resolve({ incoming: ping, outgoing: 'pong' });
        }
        cancelMe() {
            return Promise.resolve((0, async_1.$Hg)(100)).then(() => true);
        }
    }
    exports.$eT = $eT;
    class $fT {
        constructor(a) {
            this.a = a;
        }
        listen(_, event) {
            switch (event) {
                case 'marco': return this.a.onMarco;
            }
            throw new Error('Event not found');
        }
        call(_, command, ...args) {
            switch (command) {
                case 'pong': return this.a.pong(args[0]);
                case 'cancelMe': return this.a.cancelMe();
                case 'marco': return this.a.marco();
                default: return Promise.reject(new Error(`command not found: ${command}`));
            }
        }
    }
    exports.$fT = $fT;
    class $gT {
        get onMarco() { return this.a.listen('marco'); }
        constructor(a) {
            this.a = a;
        }
        marco() {
            return this.a.call('marco');
        }
        pong(ping) {
            return this.a.call('pong', ping);
        }
        cancelMe() {
            return this.a.call('cancelMe');
        }
    }
    exports.$gT = $gT;
});
//# sourceMappingURL=testService.js.map