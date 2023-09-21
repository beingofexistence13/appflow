/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$JW = void 0;
    class $JW {
        get didDomLayout() {
            return this.a;
        }
        e() {
            if (!this.d) {
                this.d = true;
                const rect = this.f.getBoundingClientRect();
                this.markDidDomLayout();
                this.b = rect.left;
                this.c = rect.width / this.f.offsetWidth;
            }
        }
        get clientRectDeltaLeft() {
            if (!this.d) {
                this.e();
            }
            return this.b;
        }
        get clientRectScale() {
            if (!this.d) {
                this.e();
            }
            return this.c;
        }
        constructor(f, endNode) {
            this.f = f;
            this.endNode = endNode;
            this.a = false;
            this.b = 0;
            this.c = 1;
            this.d = false;
        }
        markDidDomLayout() {
            this.a = true;
        }
    }
    exports.$JW = $JW;
});
//# sourceMappingURL=domReadingContext.js.map