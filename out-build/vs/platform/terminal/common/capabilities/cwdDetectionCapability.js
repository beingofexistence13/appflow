/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$gib = void 0;
    class $gib extends lifecycle_1.$kc {
        constructor() {
            super(...arguments);
            this.type = 0 /* TerminalCapability.CwdDetection */;
            this.a = '';
            this.b = new Map();
            this.c = this.B(new event_1.$fd());
            this.onDidChangeCwd = this.c.event;
        }
        /**
         * Gets the list of cwds seen in this session in order of last accessed.
         */
        get cwds() {
            return Array.from(this.b.keys());
        }
        getCwd() {
            return this.a;
        }
        updateCwd(cwd) {
            const didChange = this.a !== cwd;
            this.a = cwd;
            const count = this.b.get(this.a) || 0;
            this.b.delete(this.a); // Delete to put it at the bottom of the iterable
            this.b.set(this.a, count + 1);
            if (didChange) {
                this.c.fire(cwd);
            }
        }
    }
    exports.$gib = $gib;
});
//# sourceMappingURL=cwdDetectionCapability.js.map