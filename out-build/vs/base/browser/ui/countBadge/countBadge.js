/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/strings", "vs/css!./countBadge"], function (require, exports, dom_1, strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$nR = exports.$mR = void 0;
    exports.$mR = {
        badgeBackground: '#4D4D4D',
        badgeForeground: '#FFFFFF',
        badgeBorder: undefined
    };
    class $nR {
        constructor(container, e, f) {
            this.e = e;
            this.f = f;
            this.b = 0;
            this.a = (0, dom_1.$0O)(container, (0, dom_1.$)('.monaco-count-badge'));
            this.c = this.e.countFormat || '{0}';
            this.d = this.e.titleFormat || '';
            this.setCount(this.e.count || 0);
        }
        setCount(count) {
            this.b = count;
            this.g();
        }
        setCountFormat(countFormat) {
            this.c = countFormat;
            this.g();
        }
        setTitleFormat(titleFormat) {
            this.d = titleFormat;
            this.g();
        }
        g() {
            this.a.textContent = (0, strings_1.$ne)(this.c, this.b);
            this.a.title = (0, strings_1.$ne)(this.d, this.b);
            this.a.style.backgroundColor = this.f.badgeBackground ?? '';
            this.a.style.color = this.f.badgeForeground ?? '';
            if (this.f.badgeBorder) {
                this.a.style.border = `1px solid ${this.f.badgeBorder}`;
            }
        }
    }
    exports.$nR = $nR;
});
//# sourceMappingURL=countBadge.js.map