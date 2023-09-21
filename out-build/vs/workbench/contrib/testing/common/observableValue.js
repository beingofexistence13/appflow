/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Isb = exports.$Hsb = void 0;
    const $Hsb = (value) => ({
        onDidChange: event_1.Event.None,
        value,
    });
    exports.$Hsb = $Hsb;
    class $Isb extends lifecycle_1.$kc {
        get value() {
            return this.b;
        }
        set value(v) {
            if (v !== this.b) {
                this.b = v;
                this.a.fire(v);
            }
        }
        static stored(stored, defaultValue) {
            const o = new $Isb(stored.get(defaultValue));
            o.B(stored);
            o.B(o.onDidChange(value => stored.store(value)));
            return o;
        }
        constructor(b) {
            super();
            this.b = b;
            this.a = this.B(new event_1.$fd());
            this.onDidChange = this.a.event;
        }
    }
    exports.$Isb = $Isb;
});
//# sourceMappingURL=observableValue.js.map