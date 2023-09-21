/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri"], function (require, exports, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Fn = exports.$En = void 0;
    class $En {
        constructor(a) {
            this.a = a;
        }
        listen(_, event, arg) {
            throw new Error('Invalid listen');
        }
        call(context, command, args) {
            switch (command) {
                case 'download': return this.a.download(uri_1.URI.revive(args[0]), uri_1.URI.revive(args[1]));
            }
            throw new Error('Invalid call');
        }
    }
    exports.$En = $En;
    class $Fn {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        async download(from, to) {
            const uriTransfomer = this.b();
            if (uriTransfomer) {
                from = uriTransfomer.transformOutgoingURI(from);
                to = uriTransfomer.transformOutgoingURI(to);
            }
            await this.a.call('download', [from, to]);
        }
    }
    exports.$Fn = $Fn;
});
//# sourceMappingURL=downloadIpc.js.map