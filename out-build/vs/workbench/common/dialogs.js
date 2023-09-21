/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, async_1, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$syb = void 0;
    class $syb extends lifecycle_1.$kc {
        constructor() {
            super(...arguments);
            this.dialogs = [];
            this.a = this.B(new event_1.$fd());
            this.onWillShowDialog = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onDidShowDialog = this.b.event;
        }
        show(dialog) {
            const promise = new async_1.$2g();
            const item = {
                args: dialog,
                close: result => {
                    this.dialogs.splice(0, 1);
                    promise.complete(result);
                    this.b.fire();
                }
            };
            this.dialogs.push(item);
            this.a.fire();
            return {
                item,
                result: promise.p
            };
        }
    }
    exports.$syb = $syb;
});
//# sourceMappingURL=dialogs.js.map