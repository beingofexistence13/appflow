/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/date", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/workbench/contrib/comments/common/commentsConfiguration"], function (require, exports, dom, date_1, lifecycle_1, platform_1, commentsConfiguration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Nlb = void 0;
    class $Nlb extends lifecycle_1.$kc {
        constructor(f, container, timeStamp) {
            super();
            this.f = f;
            this.a = dom.$0O(container, dom.$('span.timestamp'));
            this.a.style.display = 'none';
            this.c = this.g;
            this.setTimestamp(timeStamp);
        }
        get g() {
            return this.f.getValue(commentsConfiguration_1.$Hlb).useRelativeTime;
        }
        async setTimestamp(timestamp) {
            if ((timestamp !== this.b) || (this.g !== this.c)) {
                this.h(timestamp);
            }
            this.b = timestamp;
            this.c = this.g;
        }
        h(timestamp) {
            if (!timestamp) {
                this.a.textContent = '';
                this.a.style.display = 'none';
            }
            else if ((timestamp !== this.b)
                || (this.g !== this.c)) {
                this.a.style.display = '';
                let textContent;
                let tooltip;
                if (this.g) {
                    textContent = this.j(timestamp);
                    tooltip = this.m(timestamp);
                }
                else {
                    textContent = this.m(timestamp);
                }
                this.a.textContent = textContent;
                if (tooltip) {
                    this.a.title = tooltip;
                }
            }
        }
        j(date) {
            return (0, date_1.$6l)(date, true, true);
        }
        m(date) {
            return date.toLocaleString(platform_1.$v);
        }
    }
    exports.$Nlb = $Nlb;
});
//# sourceMappingURL=timestamp.js.map