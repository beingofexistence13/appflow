/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/lifecycle"], function (require, exports, async_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$MP = void 0;
    class $MP extends lifecycle_1.$kc {
        constructor(visibility, visibleClassName, invisibleClassName) {
            super();
            this.a = visibility;
            this.b = visibleClassName;
            this.c = invisibleClassName;
            this.f = null;
            this.m = false;
            this.j = false;
            this.g = false;
            this.h = false;
            this.n = this.B(new async_1.$Qg());
        }
        setVisibility(visibility) {
            if (this.a !== visibility) {
                this.a = visibility;
                this.s();
            }
        }
        // ----------------- Hide / Reveal
        setShouldBeVisible(rawShouldBeVisible) {
            this.g = rawShouldBeVisible;
            this.s();
        }
        r() {
            if (this.a === 2 /* ScrollbarVisibility.Hidden */) {
                return false;
            }
            if (this.a === 3 /* ScrollbarVisibility.Visible */) {
                return true;
            }
            return this.g;
        }
        s() {
            const shouldBeVisible = this.r();
            if (this.h !== shouldBeVisible) {
                this.h = shouldBeVisible;
                this.ensureVisibility();
            }
        }
        setIsNeeded(isNeeded) {
            if (this.j !== isNeeded) {
                this.j = isNeeded;
                this.ensureVisibility();
            }
        }
        setDomNode(domNode) {
            this.f = domNode;
            this.f.setClassName(this.c);
            // Now that the flags & the dom node are in a consistent state, ensure the Hidden/Visible configuration
            this.setShouldBeVisible(false);
        }
        ensureVisibility() {
            if (!this.j) {
                // Nothing to be rendered
                this.u(false);
                return;
            }
            if (this.h) {
                this.t();
            }
            else {
                this.u(true);
            }
        }
        t() {
            if (this.m) {
                return;
            }
            this.m = true;
            // The CSS animation doesn't play otherwise
            this.n.setIfNotSet(() => {
                this.f?.setClassName(this.b);
            }, 0);
        }
        u(withFadeAway) {
            this.n.cancel();
            if (!this.m) {
                return;
            }
            this.m = false;
            this.f?.setClassName(this.c + (withFadeAway ? ' fade' : ''));
        }
    }
    exports.$MP = $MP;
});
//# sourceMappingURL=scrollbarVisibilityController.js.map