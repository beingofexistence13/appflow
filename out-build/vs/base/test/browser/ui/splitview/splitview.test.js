/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/browser/ui/splitview/splitview", "vs/base/common/event", "vs/base/test/common/utils"], function (require, exports, assert, splitview_1, event_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TestView {
        get minimumSize() { return this.h; }
        set minimumSize(size) { this.h = size; this.a.fire(undefined); }
        get maximumSize() { return this.j; }
        set maximumSize(size) { this.j = size; this.a.fire(undefined); }
        get element() { this.c.fire(); return this.b; }
        get size() { return this.d; }
        get orthogonalSize() { return this.e; }
        constructor(h, j, priority = 0 /* LayoutPriority.Normal */) {
            this.h = h;
            this.j = j;
            this.priority = priority;
            this.a = new event_1.$fd();
            this.onDidChange = this.a.event;
            this.b = document.createElement('div');
            this.c = new event_1.$fd();
            this.onDidGetElement = this.c.event;
            this.d = 0;
            this.e = 0;
            this.f = new event_1.$fd();
            this.onDidLayout = this.f.event;
            this.g = new event_1.$fd();
            this.onDidFocus = this.g.event;
            assert(h <= j, 'splitview view minimum size must be <= maximum size');
        }
        layout(size, _offset, orthogonalSize) {
            this.d = size;
            this.e = orthogonalSize;
            this.f.fire({ size, orthogonalSize });
        }
        focus() {
            this.g.fire();
        }
        dispose() {
            this.a.dispose();
            this.c.dispose();
            this.f.dispose();
            this.g.dispose();
        }
    }
    function getSashes(splitview) {
        return splitview.sashItems.map((i) => i.sash);
    }
    suite('Splitview', () => {
        const store = (0, utils_1.$bT)();
        let container;
        setup(() => {
            container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.width = `${200}px`;
            container.style.height = `${200}px`;
        });
        test('empty splitview has empty DOM', () => {
            store.add(new splitview_1.$bR(container));
            assert.strictEqual(container.firstElementChild.firstElementChild.childElementCount, 0, 'split view should be empty');
        });
        test('has views and sashes as children', () => {
            const view1 = store.add(new TestView(20, 20));
            const view2 = store.add(new TestView(20, 20));
            const view3 = store.add(new TestView(20, 20));
            const splitview = store.add(new splitview_1.$bR(container));
            splitview.addView(view1, 20);
            splitview.addView(view2, 20);
            splitview.addView(view3, 20);
            let viewQuery = container.querySelectorAll('.monaco-split-view2 > .monaco-scrollable-element > .split-view-container > .split-view-view');
            assert.strictEqual(viewQuery.length, 3, 'split view should have 3 views');
            let sashQuery = container.querySelectorAll('.monaco-split-view2 > .sash-container > .monaco-sash');
            assert.strictEqual(sashQuery.length, 2, 'split view should have 2 sashes');
            splitview.removeView(2);
            viewQuery = container.querySelectorAll('.monaco-split-view2 > .monaco-scrollable-element > .split-view-container > .split-view-view');
            assert.strictEqual(viewQuery.length, 2, 'split view should have 2 views');
            sashQuery = container.querySelectorAll('.monaco-split-view2 > .sash-container > .monaco-sash');
            assert.strictEqual(sashQuery.length, 1, 'split view should have 1 sash');
            splitview.removeView(0);
            viewQuery = container.querySelectorAll('.monaco-split-view2 > .monaco-scrollable-element > .split-view-container > .split-view-view');
            assert.strictEqual(viewQuery.length, 1, 'split view should have 1 view');
            sashQuery = container.querySelectorAll('.monaco-split-view2 > .sash-container > .monaco-sash');
            assert.strictEqual(sashQuery.length, 0, 'split view should have no sashes');
            splitview.removeView(0);
            viewQuery = container.querySelectorAll('.monaco-split-view2 > .monaco-scrollable-element > .split-view-container > .split-view-view');
            assert.strictEqual(viewQuery.length, 0, 'split view should have no views');
            sashQuery = container.querySelectorAll('.monaco-split-view2 > .sash-container > .monaco-sash');
            assert.strictEqual(sashQuery.length, 0, 'split view should have no sashes');
        });
        test('calls view methods on addView and removeView', () => {
            const view = store.add(new TestView(20, 20));
            const splitview = store.add(new splitview_1.$bR(container));
            let didLayout = false;
            store.add(view.onDidLayout(() => didLayout = true));
            store.add(view.onDidGetElement(() => undefined));
            splitview.addView(view, 20);
            assert.strictEqual(view.size, 20, 'view has right size');
            assert(didLayout, 'layout is called');
            assert(didLayout, 'render is called');
        });
        test('stretches view to viewport', () => {
            const view = store.add(new TestView(20, Number.POSITIVE_INFINITY));
            const splitview = store.add(new splitview_1.$bR(container));
            splitview.layout(200);
            splitview.addView(view, 20);
            assert.strictEqual(view.size, 200, 'view is stretched');
            splitview.layout(200);
            assert.strictEqual(view.size, 200, 'view stayed the same');
            splitview.layout(100);
            assert.strictEqual(view.size, 100, 'view is collapsed');
            splitview.layout(20);
            assert.strictEqual(view.size, 20, 'view is collapsed');
            splitview.layout(10);
            assert.strictEqual(view.size, 20, 'view is clamped');
            splitview.layout(200);
            assert.strictEqual(view.size, 200, 'view is stretched');
        });
        test('can resize views', () => {
            const view1 = store.add(new TestView(20, Number.POSITIVE_INFINITY));
            const view2 = store.add(new TestView(20, Number.POSITIVE_INFINITY));
            const view3 = store.add(new TestView(20, Number.POSITIVE_INFINITY));
            const splitview = store.add(new splitview_1.$bR(container));
            splitview.layout(200);
            splitview.addView(view1, 20);
            splitview.addView(view2, 20);
            splitview.addView(view3, 20);
            assert.strictEqual(view1.size, 160, 'view1 is stretched');
            assert.strictEqual(view2.size, 20, 'view2 size is 20');
            assert.strictEqual(view3.size, 20, 'view3 size is 20');
            splitview.resizeView(1, 40);
            assert.strictEqual(view1.size, 140, 'view1 is collapsed');
            assert.strictEqual(view2.size, 40, 'view2 is stretched');
            assert.strictEqual(view3.size, 20, 'view3 stays the same');
            splitview.resizeView(0, 70);
            assert.strictEqual(view1.size, 70, 'view1 is collapsed');
            assert.strictEqual(view2.size, 40, 'view2 stays the same');
            assert.strictEqual(view3.size, 90, 'view3 is stretched');
            splitview.resizeView(2, 40);
            assert.strictEqual(view1.size, 70, 'view1 stays the same');
            assert.strictEqual(view2.size, 90, 'view2 is collapsed');
            assert.strictEqual(view3.size, 40, 'view3 is stretched');
        });
        test('reacts to view changes', () => {
            const view1 = store.add(new TestView(20, Number.POSITIVE_INFINITY));
            const view2 = store.add(new TestView(20, Number.POSITIVE_INFINITY));
            const view3 = store.add(new TestView(20, Number.POSITIVE_INFINITY));
            const splitview = store.add(new splitview_1.$bR(container));
            splitview.layout(200);
            splitview.addView(view1, 20);
            splitview.addView(view2, 20);
            splitview.addView(view3, 20);
            assert.strictEqual(view1.size, 160, 'view1 is stretched');
            assert.strictEqual(view2.size, 20, 'view2 size is 20');
            assert.strictEqual(view3.size, 20, 'view3 size is 20');
            view1.maximumSize = 20;
            assert.strictEqual(view1.size, 20, 'view1 is collapsed');
            assert.strictEqual(view2.size, 20, 'view2 stays the same');
            assert.strictEqual(view3.size, 160, 'view3 is stretched');
            view3.maximumSize = 40;
            assert.strictEqual(view1.size, 20, 'view1 stays the same');
            assert.strictEqual(view2.size, 140, 'view2 is stretched');
            assert.strictEqual(view3.size, 40, 'view3 is collapsed');
            view2.maximumSize = 200;
            assert.strictEqual(view1.size, 20, 'view1 stays the same');
            assert.strictEqual(view2.size, 140, 'view2 stays the same');
            assert.strictEqual(view3.size, 40, 'view3 stays the same');
            view3.maximumSize = Number.POSITIVE_INFINITY;
            view3.minimumSize = 100;
            assert.strictEqual(view1.size, 20, 'view1 is collapsed');
            assert.strictEqual(view2.size, 80, 'view2 is collapsed');
            assert.strictEqual(view3.size, 100, 'view3 is stretched');
        });
        test('sashes are properly enabled/disabled', () => {
            const view1 = store.add(new TestView(20, Number.POSITIVE_INFINITY));
            const view2 = store.add(new TestView(20, Number.POSITIVE_INFINITY));
            const view3 = store.add(new TestView(20, Number.POSITIVE_INFINITY));
            const splitview = store.add(new splitview_1.$bR(container));
            splitview.layout(200);
            splitview.addView(view1, splitview_1.Sizing.Distribute);
            splitview.addView(view2, splitview_1.Sizing.Distribute);
            splitview.addView(view3, splitview_1.Sizing.Distribute);
            const sashes = getSashes(splitview);
            assert.strictEqual(sashes.length, 2, 'there are two sashes');
            assert.strictEqual(sashes[0].state, 3 /* SashState.Enabled */, 'first sash is enabled');
            assert.strictEqual(sashes[1].state, 3 /* SashState.Enabled */, 'second sash is enabled');
            splitview.layout(60);
            assert.strictEqual(sashes[0].state, 0 /* SashState.Disabled */, 'first sash is disabled');
            assert.strictEqual(sashes[1].state, 0 /* SashState.Disabled */, 'second sash is disabled');
            splitview.layout(20);
            assert.strictEqual(sashes[0].state, 0 /* SashState.Disabled */, 'first sash is disabled');
            assert.strictEqual(sashes[1].state, 0 /* SashState.Disabled */, 'second sash is disabled');
            splitview.layout(200);
            assert.strictEqual(sashes[0].state, 3 /* SashState.Enabled */, 'first sash is enabled');
            assert.strictEqual(sashes[1].state, 3 /* SashState.Enabled */, 'second sash is enabled');
            view1.maximumSize = 20;
            assert.strictEqual(sashes[0].state, 0 /* SashState.Disabled */, 'first sash is disabled');
            assert.strictEqual(sashes[1].state, 3 /* SashState.Enabled */, 'second sash is enabled');
            view2.maximumSize = 20;
            assert.strictEqual(sashes[0].state, 0 /* SashState.Disabled */, 'first sash is disabled');
            assert.strictEqual(sashes[1].state, 0 /* SashState.Disabled */, 'second sash is disabled');
            view1.maximumSize = 300;
            assert.strictEqual(sashes[0].state, 1 /* SashState.AtMinimum */, 'first sash is enabled');
            assert.strictEqual(sashes[1].state, 1 /* SashState.AtMinimum */, 'second sash is enabled');
            view2.maximumSize = 200;
            assert.strictEqual(sashes[0].state, 1 /* SashState.AtMinimum */, 'first sash is enabled');
            assert.strictEqual(sashes[1].state, 1 /* SashState.AtMinimum */, 'second sash is enabled');
            splitview.resizeView(0, 40);
            assert.strictEqual(sashes[0].state, 3 /* SashState.Enabled */, 'first sash is enabled');
            assert.strictEqual(sashes[1].state, 3 /* SashState.Enabled */, 'second sash is enabled');
        });
        test('issue #35497', () => {
            const view1 = store.add(new TestView(160, Number.POSITIVE_INFINITY));
            const view2 = store.add(new TestView(66, 66));
            const splitview = store.add(new splitview_1.$bR(container));
            splitview.layout(986);
            splitview.addView(view1, 142, 0);
            assert.strictEqual(view1.size, 986, 'first view is stretched');
            store.add(view2.onDidGetElement(() => {
                assert.throws(() => splitview.resizeView(1, 922));
                assert.throws(() => splitview.resizeView(1, 922));
            }));
            splitview.addView(view2, 66, 0);
            assert.strictEqual(view2.size, 66, 'second view is fixed');
            assert.strictEqual(view1.size, 986 - 66, 'first view is collapsed');
            const viewContainers = container.querySelectorAll('.split-view-view');
            assert.strictEqual(viewContainers.length, 2, 'there are two view containers');
            assert.strictEqual(viewContainers.item(0).style.height, '66px', 'second view container is 66px');
            assert.strictEqual(viewContainers.item(1).style.height, `${986 - 66}px`, 'first view container is 66px');
        });
        test('automatic size distribution', () => {
            const view1 = store.add(new TestView(20, Number.POSITIVE_INFINITY));
            const view2 = store.add(new TestView(20, Number.POSITIVE_INFINITY));
            const view3 = store.add(new TestView(20, Number.POSITIVE_INFINITY));
            const splitview = store.add(new splitview_1.$bR(container));
            splitview.layout(200);
            splitview.addView(view1, splitview_1.Sizing.Distribute);
            assert.strictEqual(view1.size, 200);
            splitview.addView(view2, 50);
            assert.deepStrictEqual([view1.size, view2.size], [150, 50]);
            splitview.addView(view3, splitview_1.Sizing.Distribute);
            assert.deepStrictEqual([view1.size, view2.size, view3.size], [66, 66, 68]);
            splitview.removeView(1, splitview_1.Sizing.Distribute);
            assert.deepStrictEqual([view1.size, view3.size], [100, 100]);
        });
        test('add views before layout', () => {
            const view1 = store.add(new TestView(20, Number.POSITIVE_INFINITY));
            const view2 = store.add(new TestView(20, Number.POSITIVE_INFINITY));
            const view3 = store.add(new TestView(20, Number.POSITIVE_INFINITY));
            const splitview = store.add(new splitview_1.$bR(container));
            splitview.addView(view1, 100);
            splitview.addView(view2, 75);
            splitview.addView(view3, 25);
            splitview.layout(200);
            assert.deepStrictEqual([view1.size, view2.size, view3.size], [67, 67, 66]);
        });
        test('split sizing', () => {
            const view1 = store.add(new TestView(20, Number.POSITIVE_INFINITY));
            const view2 = store.add(new TestView(20, Number.POSITIVE_INFINITY));
            const view3 = store.add(new TestView(20, Number.POSITIVE_INFINITY));
            const splitview = store.add(new splitview_1.$bR(container));
            splitview.layout(200);
            splitview.addView(view1, splitview_1.Sizing.Distribute);
            assert.strictEqual(view1.size, 200);
            splitview.addView(view2, splitview_1.Sizing.Split(0));
            assert.deepStrictEqual([view1.size, view2.size], [100, 100]);
            splitview.addView(view3, splitview_1.Sizing.Split(1));
            assert.deepStrictEqual([view1.size, view2.size, view3.size], [100, 50, 50]);
        });
        test('split sizing 2', () => {
            const view1 = store.add(new TestView(20, Number.POSITIVE_INFINITY));
            const view2 = store.add(new TestView(20, Number.POSITIVE_INFINITY));
            const view3 = store.add(new TestView(20, Number.POSITIVE_INFINITY));
            const splitview = store.add(new splitview_1.$bR(container));
            splitview.layout(200);
            splitview.addView(view1, splitview_1.Sizing.Distribute);
            assert.strictEqual(view1.size, 200);
            splitview.addView(view2, splitview_1.Sizing.Split(0));
            assert.deepStrictEqual([view1.size, view2.size], [100, 100]);
            splitview.addView(view3, splitview_1.Sizing.Split(0));
            assert.deepStrictEqual([view1.size, view2.size, view3.size], [50, 100, 50]);
        });
        test('proportional layout', () => {
            const view1 = store.add(new TestView(20, Number.POSITIVE_INFINITY));
            const view2 = store.add(new TestView(20, Number.POSITIVE_INFINITY));
            const splitview = store.add(new splitview_1.$bR(container));
            splitview.layout(200);
            splitview.addView(view1, splitview_1.Sizing.Distribute);
            splitview.addView(view2, splitview_1.Sizing.Distribute);
            assert.deepStrictEqual([view1.size, view2.size], [100, 100]);
            splitview.layout(100);
            assert.deepStrictEqual([view1.size, view2.size], [50, 50]);
        });
        test('disable proportional layout', () => {
            const view1 = store.add(new TestView(20, Number.POSITIVE_INFINITY));
            const view2 = store.add(new TestView(20, Number.POSITIVE_INFINITY));
            const splitview = store.add(new splitview_1.$bR(container, { proportionalLayout: false }));
            splitview.layout(200);
            splitview.addView(view1, splitview_1.Sizing.Distribute);
            splitview.addView(view2, splitview_1.Sizing.Distribute);
            assert.deepStrictEqual([view1.size, view2.size], [100, 100]);
            splitview.layout(100);
            assert.deepStrictEqual([view1.size, view2.size], [80, 20]);
        });
        test('high layout priority', () => {
            const view1 = store.add(new TestView(20, Number.POSITIVE_INFINITY));
            const view2 = store.add(new TestView(20, Number.POSITIVE_INFINITY, 2 /* LayoutPriority.High */));
            const view3 = store.add(new TestView(20, Number.POSITIVE_INFINITY));
            const splitview = store.add(new splitview_1.$bR(container, { proportionalLayout: false }));
            splitview.layout(200);
            splitview.addView(view1, splitview_1.Sizing.Distribute);
            splitview.addView(view2, splitview_1.Sizing.Distribute);
            splitview.addView(view3, splitview_1.Sizing.Distribute);
            assert.deepStrictEqual([view1.size, view2.size, view3.size], [66, 68, 66]);
            splitview.layout(180);
            assert.deepStrictEqual([view1.size, view2.size, view3.size], [66, 48, 66]);
            splitview.layout(124);
            assert.deepStrictEqual([view1.size, view2.size, view3.size], [66, 20, 38]);
            splitview.layout(60);
            assert.deepStrictEqual([view1.size, view2.size, view3.size], [20, 20, 20]);
            splitview.layout(200);
            assert.deepStrictEqual([view1.size, view2.size, view3.size], [20, 160, 20]);
        });
        test('low layout priority', () => {
            const view1 = store.add(new TestView(20, Number.POSITIVE_INFINITY));
            const view2 = store.add(new TestView(20, Number.POSITIVE_INFINITY));
            const view3 = store.add(new TestView(20, Number.POSITIVE_INFINITY, 1 /* LayoutPriority.Low */));
            const splitview = store.add(new splitview_1.$bR(container, { proportionalLayout: false }));
            splitview.layout(200);
            splitview.addView(view1, splitview_1.Sizing.Distribute);
            splitview.addView(view2, splitview_1.Sizing.Distribute);
            splitview.addView(view3, splitview_1.Sizing.Distribute);
            assert.deepStrictEqual([view1.size, view2.size, view3.size], [66, 68, 66]);
            splitview.layout(180);
            assert.deepStrictEqual([view1.size, view2.size, view3.size], [66, 48, 66]);
            splitview.layout(132);
            assert.deepStrictEqual([view1.size, view2.size, view3.size], [46, 20, 66]);
            splitview.layout(60);
            assert.deepStrictEqual([view1.size, view2.size, view3.size], [20, 20, 20]);
            splitview.layout(200);
            assert.deepStrictEqual([view1.size, view2.size, view3.size], [20, 160, 20]);
        });
        test('context propagates to views', () => {
            const view1 = store.add(new TestView(20, Number.POSITIVE_INFINITY));
            const view2 = store.add(new TestView(20, Number.POSITIVE_INFINITY));
            const view3 = store.add(new TestView(20, Number.POSITIVE_INFINITY, 1 /* LayoutPriority.Low */));
            const splitview = store.add(new splitview_1.$bR(container, { proportionalLayout: false }));
            splitview.layout(200);
            splitview.addView(view1, splitview_1.Sizing.Distribute);
            splitview.addView(view2, splitview_1.Sizing.Distribute);
            splitview.addView(view3, splitview_1.Sizing.Distribute);
            splitview.layout(200, 100);
            assert.deepStrictEqual([view1.orthogonalSize, view2.orthogonalSize, view3.orthogonalSize], [100, 100, 100]);
        });
    });
});
//# sourceMappingURL=splitview.test.js.map