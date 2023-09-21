/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event"], function (require, exports, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$3Vb = void 0;
    class $3Vb {
        constructor(a) {
            this.a = a;
            this.type = 1 /* TerminalCapability.NaiveCwdDetection */;
            this.b = '';
            this.c = new event_1.$fd();
            this.onDidChangeCwd = this.c.event;
        }
        async getCwd() {
            if (!this.a) {
                return Promise.resolve('');
            }
            const newCwd = await this.a.getCwd();
            if (newCwd !== this.b) {
                this.c.fire(newCwd);
            }
            this.b = newCwd;
            return this.b;
        }
    }
    exports.$3Vb = $3Vb;
});
//# sourceMappingURL=naiveCwdDetectionCapability.js.map