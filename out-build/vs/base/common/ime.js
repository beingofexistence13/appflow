/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event"], function (require, exports, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IME = exports.$vS = void 0;
    class $vS {
        constructor() {
            this.a = new event_1.$fd();
            this.onDidChange = this.a.event;
            this.b = true;
        }
        get enabled() {
            return this.b;
        }
        /**
         * Enable IME
         */
        enable() {
            this.b = true;
            this.a.fire();
        }
        /**
         * Disable IME
         */
        disable() {
            this.b = false;
            this.a.fire();
        }
    }
    exports.$vS = $vS;
    exports.IME = new $vS();
});
//# sourceMappingURL=ime.js.map