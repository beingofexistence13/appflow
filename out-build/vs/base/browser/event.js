/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event"], function (require, exports, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$9P = void 0;
    class $9P {
        get event() {
            return this.a.event;
        }
        constructor(element, type, useCapture) {
            const fn = (e) => this.a.fire(e);
            this.a = new event_1.$fd({
                onWillAddFirstListener: () => element.addEventListener(type, fn, useCapture),
                onDidRemoveLastListener: () => element.removeEventListener(type, fn, useCapture)
            });
        }
        dispose() {
            this.a.dispose();
        }
    }
    exports.$9P = $9P;
});
//# sourceMappingURL=event.js.map