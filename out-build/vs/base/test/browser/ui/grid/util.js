/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/browser/ui/grid/gridview", "vs/base/common/event"], function (require, exports, assert, gridview_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$qT = exports.$pT = void 0;
    class $pT {
        get minimumWidth() { return this.n; }
        set minimumWidth(size) { this.n = size; this.e.fire(undefined); }
        get maximumWidth() { return this.o; }
        set maximumWidth(size) { this.o = size; this.e.fire(undefined); }
        get minimumHeight() { return this.p; }
        set minimumHeight(size) { this.p = size; this.e.fire(undefined); }
        get maximumHeight() { return this.q; }
        set maximumHeight(size) { this.q = size; this.e.fire(undefined); }
        get element() { this.g.fire(); return this.f; }
        get width() { return this.h; }
        get height() { return this.i; }
        get top() { return this.j; }
        get left() { return this.k; }
        get size() { return [this.width, this.height]; }
        constructor(n, o, p, q) {
            this.n = n;
            this.o = o;
            this.p = p;
            this.q = q;
            this.e = new event_1.$fd();
            this.onDidChange = this.e.event;
            this.f = document.createElement('div');
            this.g = new event_1.$fd();
            this.onDidGetElement = this.g.event;
            this.h = 0;
            this.i = 0;
            this.j = 0;
            this.k = 0;
            this.l = new event_1.$fd();
            this.onDidLayout = this.l.event;
            this.m = new event_1.$fd();
            this.onDidFocus = this.m.event;
            assert(n <= o, 'gridview view minimum width must be <= maximum width');
            assert(p <= q, 'gridview view minimum height must be <= maximum height');
        }
        layout(width, height, top, left) {
            this.h = width;
            this.i = height;
            this.j = top;
            this.k = left;
            this.l.fire({ width, height, top, left });
        }
        focus() {
            this.m.fire();
        }
        dispose() {
            this.e.dispose();
            this.g.dispose();
            this.l.dispose();
            this.m.dispose();
        }
    }
    exports.$pT = $pT;
    function $qT(node) {
        if ((0, gridview_1.$dR)(node)) {
            return node.children.map($qT);
        }
        else {
            return node.view;
        }
    }
    exports.$qT = $qT;
});
//# sourceMappingURL=util.js.map