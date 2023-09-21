/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/globalPointerMoveMonitor", "vs/base/browser/ui/widget", "vs/base/common/async", "vs/base/common/themables", "vs/base/browser/dom"], function (require, exports, globalPointerMoveMonitor_1, widget_1, async_1, themables_1, dom) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$KP = exports.$JP = void 0;
    /**
     * The arrow image size.
     */
    exports.$JP = 11;
    class $KP extends widget_1.$IP {
        constructor(opts) {
            super();
            this.a = opts.onActivate;
            this.bgDomNode = document.createElement('div');
            this.bgDomNode.className = 'arrow-background';
            this.bgDomNode.style.position = 'absolute';
            this.bgDomNode.style.width = opts.bgWidth + 'px';
            this.bgDomNode.style.height = opts.bgHeight + 'px';
            if (typeof opts.top !== 'undefined') {
                this.bgDomNode.style.top = '0px';
            }
            if (typeof opts.left !== 'undefined') {
                this.bgDomNode.style.left = '0px';
            }
            if (typeof opts.bottom !== 'undefined') {
                this.bgDomNode.style.bottom = '0px';
            }
            if (typeof opts.right !== 'undefined') {
                this.bgDomNode.style.right = '0px';
            }
            this.domNode = document.createElement('div');
            this.domNode.className = opts.className;
            this.domNode.classList.add(...themables_1.ThemeIcon.asClassNameArray(opts.icon));
            this.domNode.style.position = 'absolute';
            this.domNode.style.width = exports.$JP + 'px';
            this.domNode.style.height = exports.$JP + 'px';
            if (typeof opts.top !== 'undefined') {
                this.domNode.style.top = opts.top + 'px';
            }
            if (typeof opts.left !== 'undefined') {
                this.domNode.style.left = opts.left + 'px';
            }
            if (typeof opts.bottom !== 'undefined') {
                this.domNode.style.bottom = opts.bottom + 'px';
            }
            if (typeof opts.right !== 'undefined') {
                this.domNode.style.right = opts.right + 'px';
            }
            this.g = this.B(new globalPointerMoveMonitor_1.$HP());
            this.B(dom.$oO(this.bgDomNode, dom.$3O.POINTER_DOWN, (e) => this.h(e)));
            this.B(dom.$oO(this.domNode, dom.$3O.POINTER_DOWN, (e) => this.h(e)));
            this.b = this.B(new async_1.$Rg());
            this.c = this.B(new async_1.$Qg());
        }
        h(e) {
            if (!e.target || !(e.target instanceof Element)) {
                return;
            }
            const scheduleRepeater = () => {
                this.b.cancelAndSet(() => this.a(), 1000 / 24);
            };
            this.a();
            this.b.cancel();
            this.c.cancelAndSet(scheduleRepeater, 200);
            this.g.startMonitoring(e.target, e.pointerId, e.buttons, (pointerMoveData) => { }, () => {
                this.b.cancel();
                this.c.cancel();
            });
            e.preventDefault();
        }
    }
    exports.$KP = $KP;
});
//# sourceMappingURL=scrollbarArrow.js.map