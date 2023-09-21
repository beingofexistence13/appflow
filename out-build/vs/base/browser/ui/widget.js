/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/mouseEvent", "vs/base/browser/touch", "vs/base/common/lifecycle"], function (require, exports, dom, keyboardEvent_1, mouseEvent_1, touch_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$IP = void 0;
    class $IP extends lifecycle_1.$kc {
        f(domNode, listener) {
            this.B(dom.$nO(domNode, dom.$3O.CLICK, (e) => listener(new mouseEvent_1.$eO(e))));
        }
        j(domNode, listener) {
            this.B(dom.$nO(domNode, dom.$3O.MOUSE_DOWN, (e) => listener(new mouseEvent_1.$eO(e))));
        }
        m(domNode, listener) {
            this.B(dom.$nO(domNode, dom.$3O.MOUSE_OVER, (e) => listener(new mouseEvent_1.$eO(e))));
        }
        u(domNode, listener) {
            this.B(dom.$nO(domNode, dom.$3O.MOUSE_LEAVE, (e) => listener(new mouseEvent_1.$eO(e))));
        }
        z(domNode, listener) {
            this.B(dom.$nO(domNode, dom.$3O.KEY_DOWN, (e) => listener(new keyboardEvent_1.$jO(e))));
        }
        C(domNode, listener) {
            this.B(dom.$nO(domNode, dom.$3O.KEY_UP, (e) => listener(new keyboardEvent_1.$jO(e))));
        }
        D(domNode, listener) {
            this.B(dom.$nO(domNode, dom.$3O.INPUT, listener));
        }
        F(domNode, listener) {
            this.B(dom.$nO(domNode, dom.$3O.BLUR, listener));
        }
        G(domNode, listener) {
            this.B(dom.$nO(domNode, dom.$3O.FOCUS, listener));
        }
        H(domNode, listener) {
            this.B(dom.$nO(domNode, dom.$3O.CHANGE, listener));
        }
        I(domNode) {
            return touch_1.$EP.ignoreTarget(domNode);
        }
    }
    exports.$IP = $IP;
});
//# sourceMappingURL=widget.js.map