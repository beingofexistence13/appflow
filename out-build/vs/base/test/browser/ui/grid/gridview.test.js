/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/browser/dom", "vs/base/browser/ui/grid/gridview", "./util", "vs/base/test/common/utils"], function (require, exports, assert, dom_1, gridview_1, util_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Gridview', function () {
        const store = (0, utils_1.$bT)();
        function createGridView() {
            const gridview = store.add(new gridview_1.$eR());
            const container = (0, dom_1.$)('.container');
            container.style.position = 'absolute';
            container.style.width = `${200}px`;
            container.style.height = `${200}px`;
            container.appendChild(gridview.element);
            return gridview;
        }
        test('empty gridview is empty', function () {
            const gridview = createGridView();
            assert.deepStrictEqual((0, util_1.$qT)(gridview.getView()), []);
        });
        test('gridview addView', function () {
            const gridview = createGridView();
            const view = store.add(new util_1.$pT(20, 20, 20, 20));
            assert.throws(() => gridview.addView(view, 200, []), 'empty location');
            assert.throws(() => gridview.addView(view, 200, [1]), 'index overflow');
            assert.throws(() => gridview.addView(view, 200, [0, 0]), 'hierarchy overflow');
            const views = [
                store.add(new util_1.$pT(20, 20, 20, 20)),
                store.add(new util_1.$pT(20, 20, 20, 20)),
                store.add(new util_1.$pT(20, 20, 20, 20))
            ];
            gridview.addView(views[0], 200, [0]);
            gridview.addView(views[1], 200, [1]);
            gridview.addView(views[2], 200, [2]);
            assert.deepStrictEqual((0, util_1.$qT)(gridview.getView()), views);
        });
        test('gridview addView nested', function () {
            const gridview = createGridView();
            const views = [
                store.add(new util_1.$pT(20, 20, 20, 20)),
                [
                    store.add(new util_1.$pT(20, 20, 20, 20)),
                    store.add(new util_1.$pT(20, 20, 20, 20))
                ]
            ];
            gridview.addView(views[0], 200, [0]);
            gridview.addView(views[1][0], 200, [1]);
            gridview.addView(views[1][1], 200, [1, 1]);
            assert.deepStrictEqual((0, util_1.$qT)(gridview.getView()), views);
        });
        test('gridview addView deep nested', function () {
            const gridview = createGridView();
            const view1 = store.add(new util_1.$pT(20, 20, 20, 20));
            gridview.addView(view1, 200, [0]);
            assert.deepStrictEqual((0, util_1.$qT)(gridview.getView()), [view1]);
            const view2 = store.add(new util_1.$pT(20, 20, 20, 20));
            gridview.addView(view2, 200, [1]);
            assert.deepStrictEqual((0, util_1.$qT)(gridview.getView()), [view1, view2]);
            const view3 = store.add(new util_1.$pT(20, 20, 20, 20));
            gridview.addView(view3, 200, [1, 0]);
            assert.deepStrictEqual((0, util_1.$qT)(gridview.getView()), [view1, [view3, view2]]);
            const view4 = store.add(new util_1.$pT(20, 20, 20, 20));
            gridview.addView(view4, 200, [1, 0, 0]);
            assert.deepStrictEqual((0, util_1.$qT)(gridview.getView()), [view1, [[view4, view3], view2]]);
            const view5 = store.add(new util_1.$pT(20, 20, 20, 20));
            gridview.addView(view5, 200, [1, 0]);
            assert.deepStrictEqual((0, util_1.$qT)(gridview.getView()), [view1, [view5, [view4, view3], view2]]);
            const view6 = store.add(new util_1.$pT(20, 20, 20, 20));
            gridview.addView(view6, 200, [2]);
            assert.deepStrictEqual((0, util_1.$qT)(gridview.getView()), [view1, [view5, [view4, view3], view2], view6]);
            const view7 = store.add(new util_1.$pT(20, 20, 20, 20));
            gridview.addView(view7, 200, [1, 1]);
            assert.deepStrictEqual((0, util_1.$qT)(gridview.getView()), [view1, [view5, view7, [view4, view3], view2], view6]);
            const view8 = store.add(new util_1.$pT(20, 20, 20, 20));
            gridview.addView(view8, 200, [1, 1, 0]);
            assert.deepStrictEqual((0, util_1.$qT)(gridview.getView()), [view1, [view5, [view8, view7], [view4, view3], view2], view6]);
        });
        test('simple layout', function () {
            const gridview = createGridView();
            gridview.layout(800, 600);
            const view1 = store.add(new util_1.$pT(50, Number.POSITIVE_INFINITY, 50, Number.POSITIVE_INFINITY));
            gridview.addView(view1, 200, [0]);
            assert.deepStrictEqual(view1.size, [800, 600]);
            assert.deepStrictEqual(gridview.getViewSize([0]), { width: 800, height: 600 });
            const view2 = store.add(new util_1.$pT(50, Number.POSITIVE_INFINITY, 50, Number.POSITIVE_INFINITY));
            gridview.addView(view2, 200, [0]);
            assert.deepStrictEqual(view1.size, [800, 400]);
            assert.deepStrictEqual(gridview.getViewSize([1]), { width: 800, height: 400 });
            assert.deepStrictEqual(view2.size, [800, 200]);
            assert.deepStrictEqual(gridview.getViewSize([0]), { width: 800, height: 200 });
            const view3 = store.add(new util_1.$pT(50, Number.POSITIVE_INFINITY, 50, Number.POSITIVE_INFINITY));
            gridview.addView(view3, 200, [1, 1]);
            assert.deepStrictEqual(view1.size, [600, 400]);
            assert.deepStrictEqual(gridview.getViewSize([1, 0]), { width: 600, height: 400 });
            assert.deepStrictEqual(view2.size, [800, 200]);
            assert.deepStrictEqual(gridview.getViewSize([0]), { width: 800, height: 200 });
            assert.deepStrictEqual(view3.size, [200, 400]);
            assert.deepStrictEqual(gridview.getViewSize([1, 1]), { width: 200, height: 400 });
            const view4 = store.add(new util_1.$pT(50, Number.POSITIVE_INFINITY, 50, Number.POSITIVE_INFINITY));
            gridview.addView(view4, 200, [0, 0]);
            assert.deepStrictEqual(view1.size, [600, 400]);
            assert.deepStrictEqual(gridview.getViewSize([1, 0]), { width: 600, height: 400 });
            assert.deepStrictEqual(view2.size, [600, 200]);
            assert.deepStrictEqual(gridview.getViewSize([0, 1]), { width: 600, height: 200 });
            assert.deepStrictEqual(view3.size, [200, 400]);
            assert.deepStrictEqual(gridview.getViewSize([1, 1]), { width: 200, height: 400 });
            assert.deepStrictEqual(view4.size, [200, 200]);
            assert.deepStrictEqual(gridview.getViewSize([0, 0]), { width: 200, height: 200 });
            const view5 = store.add(new util_1.$pT(50, Number.POSITIVE_INFINITY, 50, Number.POSITIVE_INFINITY));
            gridview.addView(view5, 100, [1, 0, 1]);
            assert.deepStrictEqual(view1.size, [600, 300]);
            assert.deepStrictEqual(gridview.getViewSize([1, 0, 0]), { width: 600, height: 300 });
            assert.deepStrictEqual(view2.size, [600, 200]);
            assert.deepStrictEqual(gridview.getViewSize([0, 1]), { width: 600, height: 200 });
            assert.deepStrictEqual(view3.size, [200, 400]);
            assert.deepStrictEqual(gridview.getViewSize([1, 1]), { width: 200, height: 400 });
            assert.deepStrictEqual(view4.size, [200, 200]);
            assert.deepStrictEqual(gridview.getViewSize([0, 0]), { width: 200, height: 200 });
            assert.deepStrictEqual(view5.size, [600, 100]);
            assert.deepStrictEqual(gridview.getViewSize([1, 0, 1]), { width: 600, height: 100 });
        });
        test('simple layout with automatic size distribution', function () {
            const gridview = createGridView();
            gridview.layout(800, 600);
            const view1 = store.add(new util_1.$pT(50, Number.POSITIVE_INFINITY, 50, Number.POSITIVE_INFINITY));
            gridview.addView(view1, gridview_1.Sizing.Distribute, [0]);
            assert.deepStrictEqual(view1.size, [800, 600]);
            assert.deepStrictEqual(gridview.getViewSize([0]), { width: 800, height: 600 });
            const view2 = store.add(new util_1.$pT(50, Number.POSITIVE_INFINITY, 50, Number.POSITIVE_INFINITY));
            gridview.addView(view2, gridview_1.Sizing.Distribute, [0]);
            assert.deepStrictEqual(view1.size, [800, 300]);
            assert.deepStrictEqual(view2.size, [800, 300]);
            const view3 = store.add(new util_1.$pT(50, Number.POSITIVE_INFINITY, 50, Number.POSITIVE_INFINITY));
            gridview.addView(view3, gridview_1.Sizing.Distribute, [1, 1]);
            assert.deepStrictEqual(view1.size, [400, 300]);
            assert.deepStrictEqual(view2.size, [800, 300]);
            assert.deepStrictEqual(view3.size, [400, 300]);
            const view4 = store.add(new util_1.$pT(50, Number.POSITIVE_INFINITY, 50, Number.POSITIVE_INFINITY));
            gridview.addView(view4, gridview_1.Sizing.Distribute, [0, 0]);
            assert.deepStrictEqual(view1.size, [400, 300]);
            assert.deepStrictEqual(view2.size, [400, 300]);
            assert.deepStrictEqual(view3.size, [400, 300]);
            assert.deepStrictEqual(view4.size, [400, 300]);
            const view5 = store.add(new util_1.$pT(50, Number.POSITIVE_INFINITY, 50, Number.POSITIVE_INFINITY));
            gridview.addView(view5, gridview_1.Sizing.Distribute, [1, 0, 1]);
            assert.deepStrictEqual(view1.size, [400, 150]);
            assert.deepStrictEqual(view2.size, [400, 300]);
            assert.deepStrictEqual(view3.size, [400, 300]);
            assert.deepStrictEqual(view4.size, [400, 300]);
            assert.deepStrictEqual(view5.size, [400, 150]);
        });
        test('addviews before layout call 1', function () {
            const gridview = createGridView();
            const view1 = store.add(new util_1.$pT(50, Number.POSITIVE_INFINITY, 50, Number.POSITIVE_INFINITY));
            gridview.addView(view1, 200, [0]);
            const view2 = store.add(new util_1.$pT(50, Number.POSITIVE_INFINITY, 50, Number.POSITIVE_INFINITY));
            gridview.addView(view2, 200, [0]);
            const view3 = store.add(new util_1.$pT(50, Number.POSITIVE_INFINITY, 50, Number.POSITIVE_INFINITY));
            gridview.addView(view3, 200, [1, 1]);
            gridview.layout(800, 600);
            assert.deepStrictEqual(view1.size, [400, 300]);
            assert.deepStrictEqual(view2.size, [800, 300]);
            assert.deepStrictEqual(view3.size, [400, 300]);
        });
        test('addviews before layout call 2', function () {
            const gridview = createGridView();
            const view1 = store.add(new util_1.$pT(50, Number.POSITIVE_INFINITY, 50, Number.POSITIVE_INFINITY));
            gridview.addView(view1, 200, [0]);
            const view2 = store.add(new util_1.$pT(50, Number.POSITIVE_INFINITY, 50, Number.POSITIVE_INFINITY));
            gridview.addView(view2, 200, [0]);
            const view3 = store.add(new util_1.$pT(50, Number.POSITIVE_INFINITY, 50, Number.POSITIVE_INFINITY));
            gridview.addView(view3, 200, [0, 0]);
            gridview.layout(800, 600);
            assert.deepStrictEqual(view1.size, [800, 300]);
            assert.deepStrictEqual(view2.size, [400, 300]);
            assert.deepStrictEqual(view3.size, [400, 300]);
        });
        test('flipping orientation should preserve absolute offsets', function () {
            const gridview = createGridView();
            const view1 = store.add(new util_1.$pT(50, Number.POSITIVE_INFINITY, 50, Number.POSITIVE_INFINITY));
            gridview.addView(view1, 200, [0]);
            const view2 = store.add(new util_1.$pT(50, Number.POSITIVE_INFINITY, 50, Number.POSITIVE_INFINITY));
            gridview.addView(view2, 200, [1]);
            gridview.layout(800, 600, 100, 200);
            assert.deepStrictEqual([view1.top, view1.left], [100, 200]);
            assert.deepStrictEqual([view2.top, view2.left], [100 + 300, 200]);
            gridview.orientation = 1 /* Orientation.HORIZONTAL */;
            assert.deepStrictEqual([view1.top, view1.left], [100, 200]);
            assert.deepStrictEqual([view2.top, view2.left], [100, 200 + 400]);
        });
    });
});
//# sourceMappingURL=gridview.test.js.map