/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/browser/ui/grid/grid", "vs/base/common/event", "vs/base/common/objects", "./util", "vs/base/test/common/utils"], function (require, exports, assert, grid_1, event_1, objects_1, util_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Simple example:
    //
    //  +-----+---------------+
    //  |  4  |      2        |
    //  +-----+---------+-----+
    //  |        1      |     |
    //  +---------------+  3  |
    //  |        5      |     |
    //  +---------------+-----+
    //
    //  V
    //  +-H
    //  | +-4
    //  | +-2
    //  +-H
    //    +-V
    //    | +-1
    //    | +-5
    //    +-3
    suite('Grid', function () {
        const store = (0, utils_1.$bT)();
        let container;
        setup(function () {
            container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.width = `${800}px`;
            container.style.height = `${600}px`;
        });
        test('getRelativeLocation', () => {
            assert.deepStrictEqual((0, grid_1.$gR)(0 /* Orientation.VERTICAL */, [0], 0 /* Direction.Up */), [0]);
            assert.deepStrictEqual((0, grid_1.$gR)(0 /* Orientation.VERTICAL */, [0], 1 /* Direction.Down */), [1]);
            assert.deepStrictEqual((0, grid_1.$gR)(0 /* Orientation.VERTICAL */, [0], 2 /* Direction.Left */), [0, 0]);
            assert.deepStrictEqual((0, grid_1.$gR)(0 /* Orientation.VERTICAL */, [0], 3 /* Direction.Right */), [0, 1]);
            assert.deepStrictEqual((0, grid_1.$gR)(1 /* Orientation.HORIZONTAL */, [0], 0 /* Direction.Up */), [0, 0]);
            assert.deepStrictEqual((0, grid_1.$gR)(1 /* Orientation.HORIZONTAL */, [0], 1 /* Direction.Down */), [0, 1]);
            assert.deepStrictEqual((0, grid_1.$gR)(1 /* Orientation.HORIZONTAL */, [0], 2 /* Direction.Left */), [0]);
            assert.deepStrictEqual((0, grid_1.$gR)(1 /* Orientation.HORIZONTAL */, [0], 3 /* Direction.Right */), [1]);
            assert.deepStrictEqual((0, grid_1.$gR)(0 /* Orientation.VERTICAL */, [4], 0 /* Direction.Up */), [4]);
            assert.deepStrictEqual((0, grid_1.$gR)(0 /* Orientation.VERTICAL */, [4], 1 /* Direction.Down */), [5]);
            assert.deepStrictEqual((0, grid_1.$gR)(0 /* Orientation.VERTICAL */, [4], 2 /* Direction.Left */), [4, 0]);
            assert.deepStrictEqual((0, grid_1.$gR)(0 /* Orientation.VERTICAL */, [4], 3 /* Direction.Right */), [4, 1]);
            assert.deepStrictEqual((0, grid_1.$gR)(0 /* Orientation.VERTICAL */, [0, 0], 0 /* Direction.Up */), [0, 0, 0]);
            assert.deepStrictEqual((0, grid_1.$gR)(0 /* Orientation.VERTICAL */, [0, 0], 1 /* Direction.Down */), [0, 0, 1]);
            assert.deepStrictEqual((0, grid_1.$gR)(0 /* Orientation.VERTICAL */, [0, 0], 2 /* Direction.Left */), [0, 0]);
            assert.deepStrictEqual((0, grid_1.$gR)(0 /* Orientation.VERTICAL */, [0, 0], 3 /* Direction.Right */), [0, 1]);
            assert.deepStrictEqual((0, grid_1.$gR)(0 /* Orientation.VERTICAL */, [1, 2], 0 /* Direction.Up */), [1, 2, 0]);
            assert.deepStrictEqual((0, grid_1.$gR)(0 /* Orientation.VERTICAL */, [1, 2], 1 /* Direction.Down */), [1, 2, 1]);
            assert.deepStrictEqual((0, grid_1.$gR)(0 /* Orientation.VERTICAL */, [1, 2], 2 /* Direction.Left */), [1, 2]);
            assert.deepStrictEqual((0, grid_1.$gR)(0 /* Orientation.VERTICAL */, [1, 2], 3 /* Direction.Right */), [1, 3]);
            assert.deepStrictEqual((0, grid_1.$gR)(0 /* Orientation.VERTICAL */, [1, 2, 3], 0 /* Direction.Up */), [1, 2, 3]);
            assert.deepStrictEqual((0, grid_1.$gR)(0 /* Orientation.VERTICAL */, [1, 2, 3], 1 /* Direction.Down */), [1, 2, 4]);
            assert.deepStrictEqual((0, grid_1.$gR)(0 /* Orientation.VERTICAL */, [1, 2, 3], 2 /* Direction.Left */), [1, 2, 3, 0]);
            assert.deepStrictEqual((0, grid_1.$gR)(0 /* Orientation.VERTICAL */, [1, 2, 3], 3 /* Direction.Right */), [1, 2, 3, 1]);
        });
        test('empty', () => {
            const view1 = store.add(new util_1.$pT(100, Number.MAX_VALUE, 100, Number.MAX_VALUE));
            const gridview = store.add(new grid_1.$hR(view1));
            container.appendChild(gridview.element);
            gridview.layout(800, 600);
            assert.deepStrictEqual(view1.size, [800, 600]);
        });
        test('two views vertically', function () {
            const view1 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.$hR(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            assert.deepStrictEqual(view1.size, [800, 600]);
            const view2 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view2, 200, view1, 0 /* Direction.Up */);
            assert.deepStrictEqual(view1.size, [800, 400]);
            assert.deepStrictEqual(view2.size, [800, 200]);
        });
        test('two views horizontally', function () {
            const view1 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.$hR(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            assert.deepStrictEqual(view1.size, [800, 600]);
            const view2 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view2, 300, view1, 3 /* Direction.Right */);
            assert.deepStrictEqual(view1.size, [500, 600]);
            assert.deepStrictEqual(view2.size, [300, 600]);
        });
        test('simple layout', function () {
            const view1 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.$hR(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            assert.deepStrictEqual(view1.size, [800, 600]);
            const view2 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view2, 200, view1, 0 /* Direction.Up */);
            assert.deepStrictEqual(view1.size, [800, 400]);
            assert.deepStrictEqual(view2.size, [800, 200]);
            const view3 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view3, 200, view1, 3 /* Direction.Right */);
            assert.deepStrictEqual(view1.size, [600, 400]);
            assert.deepStrictEqual(view2.size, [800, 200]);
            assert.deepStrictEqual(view3.size, [200, 400]);
            const view4 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view4, 200, view2, 2 /* Direction.Left */);
            assert.deepStrictEqual(view1.size, [600, 400]);
            assert.deepStrictEqual(view2.size, [600, 200]);
            assert.deepStrictEqual(view3.size, [200, 400]);
            assert.deepStrictEqual(view4.size, [200, 200]);
            const view5 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view5, 100, view1, 1 /* Direction.Down */);
            assert.deepStrictEqual(view1.size, [600, 300]);
            assert.deepStrictEqual(view2.size, [600, 200]);
            assert.deepStrictEqual(view3.size, [200, 400]);
            assert.deepStrictEqual(view4.size, [200, 200]);
            assert.deepStrictEqual(view5.size, [600, 100]);
        });
        test('another simple layout with automatic size distribution', function () {
            const view1 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.$hR(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            assert.deepStrictEqual(view1.size, [800, 600]);
            const view2 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view2, grid_1.Sizing.Distribute, view1, 2 /* Direction.Left */);
            assert.deepStrictEqual(view1.size, [400, 600]);
            assert.deepStrictEqual(view2.size, [400, 600]);
            const view3 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view3, grid_1.Sizing.Distribute, view1, 3 /* Direction.Right */);
            assert.deepStrictEqual(view1.size, [266, 600]);
            assert.deepStrictEqual(view2.size, [266, 600]);
            assert.deepStrictEqual(view3.size, [268, 600]);
            const view4 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view4, grid_1.Sizing.Distribute, view2, 1 /* Direction.Down */);
            assert.deepStrictEqual(view1.size, [266, 600]);
            assert.deepStrictEqual(view2.size, [266, 300]);
            assert.deepStrictEqual(view3.size, [268, 600]);
            assert.deepStrictEqual(view4.size, [266, 300]);
            const view5 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view5, grid_1.Sizing.Distribute, view3, 0 /* Direction.Up */);
            assert.deepStrictEqual(view1.size, [266, 600]);
            assert.deepStrictEqual(view2.size, [266, 300]);
            assert.deepStrictEqual(view3.size, [268, 300]);
            assert.deepStrictEqual(view4.size, [266, 300]);
            assert.deepStrictEqual(view5.size, [268, 300]);
            const view6 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view6, grid_1.Sizing.Distribute, view3, 1 /* Direction.Down */);
            assert.deepStrictEqual(view1.size, [266, 600]);
            assert.deepStrictEqual(view2.size, [266, 300]);
            assert.deepStrictEqual(view3.size, [268, 200]);
            assert.deepStrictEqual(view4.size, [266, 300]);
            assert.deepStrictEqual(view5.size, [268, 200]);
            assert.deepStrictEqual(view6.size, [268, 200]);
        });
        test('another simple layout with split size distribution', function () {
            const view1 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.$hR(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            assert.deepStrictEqual(view1.size, [800, 600]);
            const view2 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view2, grid_1.Sizing.Split, view1, 2 /* Direction.Left */);
            assert.deepStrictEqual(view1.size, [400, 600]);
            assert.deepStrictEqual(view2.size, [400, 600]);
            const view3 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view3, grid_1.Sizing.Split, view1, 3 /* Direction.Right */);
            assert.deepStrictEqual(view1.size, [200, 600]);
            assert.deepStrictEqual(view2.size, [400, 600]);
            assert.deepStrictEqual(view3.size, [200, 600]);
            const view4 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view4, grid_1.Sizing.Split, view2, 1 /* Direction.Down */);
            assert.deepStrictEqual(view1.size, [200, 600]);
            assert.deepStrictEqual(view2.size, [400, 300]);
            assert.deepStrictEqual(view3.size, [200, 600]);
            assert.deepStrictEqual(view4.size, [400, 300]);
            const view5 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view5, grid_1.Sizing.Split, view3, 0 /* Direction.Up */);
            assert.deepStrictEqual(view1.size, [200, 600]);
            assert.deepStrictEqual(view2.size, [400, 300]);
            assert.deepStrictEqual(view3.size, [200, 300]);
            assert.deepStrictEqual(view4.size, [400, 300]);
            assert.deepStrictEqual(view5.size, [200, 300]);
            const view6 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view6, grid_1.Sizing.Split, view3, 1 /* Direction.Down */);
            assert.deepStrictEqual(view1.size, [200, 600]);
            assert.deepStrictEqual(view2.size, [400, 300]);
            assert.deepStrictEqual(view3.size, [200, 150]);
            assert.deepStrictEqual(view4.size, [400, 300]);
            assert.deepStrictEqual(view5.size, [200, 300]);
            assert.deepStrictEqual(view6.size, [200, 150]);
        });
        test('3/2 layout with split', function () {
            const view1 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.$hR(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            assert.deepStrictEqual(view1.size, [800, 600]);
            const view2 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view2, grid_1.Sizing.Split, view1, 1 /* Direction.Down */);
            assert.deepStrictEqual(view1.size, [800, 300]);
            assert.deepStrictEqual(view2.size, [800, 300]);
            const view3 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view3, grid_1.Sizing.Split, view2, 3 /* Direction.Right */);
            assert.deepStrictEqual(view1.size, [800, 300]);
            assert.deepStrictEqual(view2.size, [400, 300]);
            assert.deepStrictEqual(view3.size, [400, 300]);
            const view4 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view4, grid_1.Sizing.Split, view1, 3 /* Direction.Right */);
            assert.deepStrictEqual(view1.size, [400, 300]);
            assert.deepStrictEqual(view2.size, [400, 300]);
            assert.deepStrictEqual(view3.size, [400, 300]);
            assert.deepStrictEqual(view4.size, [400, 300]);
            const view5 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view5, grid_1.Sizing.Split, view1, 3 /* Direction.Right */);
            assert.deepStrictEqual(view1.size, [200, 300]);
            assert.deepStrictEqual(view2.size, [400, 300]);
            assert.deepStrictEqual(view3.size, [400, 300]);
            assert.deepStrictEqual(view4.size, [400, 300]);
            assert.deepStrictEqual(view5.size, [200, 300]);
        });
        test('sizing should be correct after branch demotion #50564', function () {
            const view1 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.$hR(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            const view2 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view2, grid_1.Sizing.Split, view1, 3 /* Direction.Right */);
            const view3 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view3, grid_1.Sizing.Split, view2, 1 /* Direction.Down */);
            const view4 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view4, grid_1.Sizing.Split, view2, 3 /* Direction.Right */);
            assert.deepStrictEqual(view1.size, [400, 600]);
            assert.deepStrictEqual(view2.size, [200, 300]);
            assert.deepStrictEqual(view3.size, [400, 300]);
            assert.deepStrictEqual(view4.size, [200, 300]);
            grid.removeView(view3);
            assert.deepStrictEqual(view1.size, [400, 600]);
            assert.deepStrictEqual(view2.size, [200, 600]);
            assert.deepStrictEqual(view4.size, [200, 600]);
        });
        test('sizing should be correct after branch demotion #50675', function () {
            const view1 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.$hR(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            const view2 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view2, grid_1.Sizing.Distribute, view1, 1 /* Direction.Down */);
            const view3 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view3, grid_1.Sizing.Distribute, view2, 1 /* Direction.Down */);
            const view4 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view4, grid_1.Sizing.Distribute, view3, 3 /* Direction.Right */);
            assert.deepStrictEqual(view1.size, [800, 200]);
            assert.deepStrictEqual(view2.size, [800, 200]);
            assert.deepStrictEqual(view3.size, [400, 200]);
            assert.deepStrictEqual(view4.size, [400, 200]);
            grid.removeView(view3, grid_1.Sizing.Distribute);
            assert.deepStrictEqual(view1.size, [800, 200]);
            assert.deepStrictEqual(view2.size, [800, 200]);
            assert.deepStrictEqual(view4.size, [800, 200]);
        });
        test('getNeighborViews should work on single view layout', function () {
            const view1 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.$hR(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            assert.deepStrictEqual(grid.getNeighborViews(view1, 0 /* Direction.Up */), []);
            assert.deepStrictEqual(grid.getNeighborViews(view1, 3 /* Direction.Right */), []);
            assert.deepStrictEqual(grid.getNeighborViews(view1, 1 /* Direction.Down */), []);
            assert.deepStrictEqual(grid.getNeighborViews(view1, 2 /* Direction.Left */), []);
            assert.deepStrictEqual(grid.getNeighborViews(view1, 0 /* Direction.Up */, true), [view1]);
            assert.deepStrictEqual(grid.getNeighborViews(view1, 3 /* Direction.Right */, true), [view1]);
            assert.deepStrictEqual(grid.getNeighborViews(view1, 1 /* Direction.Down */, true), [view1]);
            assert.deepStrictEqual(grid.getNeighborViews(view1, 2 /* Direction.Left */, true), [view1]);
        });
        test('getNeighborViews should work on simple layout', function () {
            const view1 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.$hR(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            const view2 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view2, grid_1.Sizing.Distribute, view1, 1 /* Direction.Down */);
            const view3 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view3, grid_1.Sizing.Distribute, view2, 1 /* Direction.Down */);
            assert.deepStrictEqual(grid.getNeighborViews(view1, 0 /* Direction.Up */), []);
            assert.deepStrictEqual(grid.getNeighborViews(view1, 3 /* Direction.Right */), []);
            assert.deepStrictEqual(grid.getNeighborViews(view1, 1 /* Direction.Down */), [view2]);
            assert.deepStrictEqual(grid.getNeighborViews(view1, 2 /* Direction.Left */), []);
            assert.deepStrictEqual(grid.getNeighborViews(view1, 0 /* Direction.Up */, true), [view3]);
            assert.deepStrictEqual(grid.getNeighborViews(view1, 3 /* Direction.Right */, true), [view1]);
            assert.deepStrictEqual(grid.getNeighborViews(view1, 1 /* Direction.Down */, true), [view2]);
            assert.deepStrictEqual(grid.getNeighborViews(view1, 2 /* Direction.Left */, true), [view1]);
            assert.deepStrictEqual(grid.getNeighborViews(view2, 0 /* Direction.Up */), [view1]);
            assert.deepStrictEqual(grid.getNeighborViews(view2, 3 /* Direction.Right */), []);
            assert.deepStrictEqual(grid.getNeighborViews(view2, 1 /* Direction.Down */), [view3]);
            assert.deepStrictEqual(grid.getNeighborViews(view2, 2 /* Direction.Left */), []);
            assert.deepStrictEqual(grid.getNeighborViews(view2, 0 /* Direction.Up */, true), [view1]);
            assert.deepStrictEqual(grid.getNeighborViews(view2, 3 /* Direction.Right */, true), [view2]);
            assert.deepStrictEqual(grid.getNeighborViews(view2, 1 /* Direction.Down */, true), [view3]);
            assert.deepStrictEqual(grid.getNeighborViews(view2, 2 /* Direction.Left */, true), [view2]);
            assert.deepStrictEqual(grid.getNeighborViews(view3, 0 /* Direction.Up */), [view2]);
            assert.deepStrictEqual(grid.getNeighborViews(view3, 3 /* Direction.Right */), []);
            assert.deepStrictEqual(grid.getNeighborViews(view3, 1 /* Direction.Down */), []);
            assert.deepStrictEqual(grid.getNeighborViews(view3, 2 /* Direction.Left */), []);
            assert.deepStrictEqual(grid.getNeighborViews(view3, 0 /* Direction.Up */, true), [view2]);
            assert.deepStrictEqual(grid.getNeighborViews(view3, 3 /* Direction.Right */, true), [view3]);
            assert.deepStrictEqual(grid.getNeighborViews(view3, 1 /* Direction.Down */, true), [view1]);
            assert.deepStrictEqual(grid.getNeighborViews(view3, 2 /* Direction.Left */, true), [view3]);
        });
        test('getNeighborViews should work on a complex layout', function () {
            const view1 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.$hR(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            const view2 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view2, grid_1.Sizing.Distribute, view1, 1 /* Direction.Down */);
            const view3 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view3, grid_1.Sizing.Distribute, view2, 1 /* Direction.Down */);
            const view4 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view4, grid_1.Sizing.Distribute, view2, 3 /* Direction.Right */);
            const view5 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view5, grid_1.Sizing.Distribute, view4, 1 /* Direction.Down */);
            assert.deepStrictEqual(grid.getNeighborViews(view1, 0 /* Direction.Up */), []);
            assert.deepStrictEqual(grid.getNeighborViews(view1, 3 /* Direction.Right */), []);
            assert.deepStrictEqual(grid.getNeighborViews(view1, 1 /* Direction.Down */), [view2, view4]);
            assert.deepStrictEqual(grid.getNeighborViews(view1, 2 /* Direction.Left */), []);
            assert.deepStrictEqual(grid.getNeighborViews(view2, 0 /* Direction.Up */), [view1]);
            assert.deepStrictEqual(grid.getNeighborViews(view2, 3 /* Direction.Right */), [view4, view5]);
            assert.deepStrictEqual(grid.getNeighborViews(view2, 1 /* Direction.Down */), [view3]);
            assert.deepStrictEqual(grid.getNeighborViews(view2, 2 /* Direction.Left */), []);
            assert.deepStrictEqual(grid.getNeighborViews(view4, 0 /* Direction.Up */), [view1]);
            assert.deepStrictEqual(grid.getNeighborViews(view4, 3 /* Direction.Right */), []);
            assert.deepStrictEqual(grid.getNeighborViews(view4, 1 /* Direction.Down */), [view5]);
            assert.deepStrictEqual(grid.getNeighborViews(view4, 2 /* Direction.Left */), [view2]);
            assert.deepStrictEqual(grid.getNeighborViews(view5, 0 /* Direction.Up */), [view4]);
            assert.deepStrictEqual(grid.getNeighborViews(view5, 3 /* Direction.Right */), []);
            assert.deepStrictEqual(grid.getNeighborViews(view5, 1 /* Direction.Down */), [view3]);
            assert.deepStrictEqual(grid.getNeighborViews(view5, 2 /* Direction.Left */), [view2]);
            assert.deepStrictEqual(grid.getNeighborViews(view3, 0 /* Direction.Up */), [view2, view5]);
            assert.deepStrictEqual(grid.getNeighborViews(view3, 3 /* Direction.Right */), []);
            assert.deepStrictEqual(grid.getNeighborViews(view3, 1 /* Direction.Down */), []);
            assert.deepStrictEqual(grid.getNeighborViews(view3, 2 /* Direction.Left */), []);
        });
        test('getNeighborViews should work on another simple layout', function () {
            const view1 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.$hR(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            const view2 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view2, grid_1.Sizing.Distribute, view1, 3 /* Direction.Right */);
            const view3 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view3, grid_1.Sizing.Distribute, view2, 1 /* Direction.Down */);
            const view4 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view4, grid_1.Sizing.Distribute, view2, 3 /* Direction.Right */);
            assert.deepStrictEqual(grid.getNeighborViews(view4, 0 /* Direction.Up */), []);
            assert.deepStrictEqual(grid.getNeighborViews(view4, 3 /* Direction.Right */), []);
            assert.deepStrictEqual(grid.getNeighborViews(view4, 1 /* Direction.Down */), [view3]);
            assert.deepStrictEqual(grid.getNeighborViews(view4, 2 /* Direction.Left */), [view2]);
        });
        test('getNeighborViews should only return immediate neighbors', function () {
            const view1 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.$hR(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            const view2 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view2, grid_1.Sizing.Distribute, view1, 3 /* Direction.Right */);
            const view3 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view3, grid_1.Sizing.Distribute, view2, 1 /* Direction.Down */);
            const view4 = store.add(new util_1.$pT(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view4, grid_1.Sizing.Distribute, view2, 3 /* Direction.Right */);
            assert.deepStrictEqual(grid.getNeighborViews(view1, 3 /* Direction.Right */), [view2, view3]);
        });
    });
    class TestSerializableView extends util_1.$pT {
        constructor(name, minimumWidth, maximumWidth, minimumHeight, maximumHeight) {
            super(minimumWidth, maximumWidth, minimumHeight, maximumHeight);
            this.name = name;
        }
        toJSON() {
            return { name: this.name };
        }
    }
    class TestViewDeserializer {
        constructor(f) {
            this.f = f;
            this.e = new Map();
        }
        fromJSON(json) {
            const view = this.f.add(new TestSerializableView(json.name, 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            this.e.set(json.name, view);
            return view;
        }
        getView(id) {
            const view = this.e.get(id);
            if (!view) {
                throw new Error('Unknown view');
            }
            return view;
        }
    }
    function nodesToNames(node) {
        if ((0, grid_1.$fR)(node)) {
            return node.children.map(nodesToNames);
        }
        else {
            return node.view.name;
        }
    }
    suite('SerializableGrid', function () {
        const store = (0, utils_1.$bT)();
        let container;
        setup(function () {
            container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.width = `${800}px`;
            container.style.height = `${600}px`;
        });
        test('serialize empty', function () {
            const view1 = store.add(new TestSerializableView('view1', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.$iR(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            const actual = grid.serialize();
            assert.deepStrictEqual(actual, {
                orientation: 0,
                width: 800,
                height: 600,
                root: {
                    type: 'branch',
                    data: [
                        {
                            type: 'leaf',
                            data: {
                                name: 'view1',
                            },
                            size: 600
                        }
                    ],
                    size: 800
                }
            });
        });
        test('serialize simple layout', function () {
            const view1 = store.add(new TestSerializableView('view1', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.$iR(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            const view2 = store.add(new TestSerializableView('view2', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view2, 200, view1, 0 /* Direction.Up */);
            const view3 = store.add(new TestSerializableView('view3', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view3, 200, view1, 3 /* Direction.Right */);
            const view4 = store.add(new TestSerializableView('view4', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view4, 200, view2, 2 /* Direction.Left */);
            const view5 = store.add(new TestSerializableView('view5', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view5, 100, view1, 1 /* Direction.Down */);
            assert.deepStrictEqual(grid.serialize(), {
                orientation: 0,
                width: 800,
                height: 600,
                root: {
                    type: 'branch',
                    data: [
                        {
                            type: 'branch',
                            data: [
                                { type: 'leaf', data: { name: 'view4' }, size: 200 },
                                { type: 'leaf', data: { name: 'view2' }, size: 600 }
                            ],
                            size: 200
                        },
                        {
                            type: 'branch',
                            data: [
                                {
                                    type: 'branch',
                                    data: [
                                        { type: 'leaf', data: { name: 'view1' }, size: 300 },
                                        { type: 'leaf', data: { name: 'view5' }, size: 100 }
                                    ],
                                    size: 600
                                },
                                { type: 'leaf', data: { name: 'view3' }, size: 200 }
                            ],
                            size: 400
                        }
                    ],
                    size: 800
                }
            });
        });
        test('deserialize empty', function () {
            const view1 = store.add(new TestSerializableView('view1', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.$iR(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            const json = grid.serialize();
            grid.dispose();
            const deserializer = new TestViewDeserializer(store);
            const grid2 = store.add(grid_1.$iR.deserialize(json, deserializer));
            grid2.layout(800, 600);
            assert.deepStrictEqual(nodesToNames(grid2.getViews()), ['view1']);
        });
        test('deserialize simple layout', function () {
            const view1 = store.add(new TestSerializableView('view1', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.$iR(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            const view2 = store.add(new TestSerializableView('view2', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view2, 200, view1, 0 /* Direction.Up */);
            const view3 = store.add(new TestSerializableView('view3', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view3, 200, view1, 3 /* Direction.Right */);
            const view4 = store.add(new TestSerializableView('view4', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view4, 200, view2, 2 /* Direction.Left */);
            const view5 = store.add(new TestSerializableView('view5', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view5, 100, view1, 1 /* Direction.Down */);
            const json = grid.serialize();
            grid.dispose();
            const deserializer = new TestViewDeserializer(store);
            const grid2 = store.add(grid_1.$iR.deserialize(json, deserializer));
            const view1Copy = deserializer.getView('view1');
            const view2Copy = deserializer.getView('view2');
            const view3Copy = deserializer.getView('view3');
            const view4Copy = deserializer.getView('view4');
            const view5Copy = deserializer.getView('view5');
            assert.deepStrictEqual((0, util_1.$qT)(grid2.getViews()), [[view4Copy, view2Copy], [[view1Copy, view5Copy], view3Copy]]);
            grid2.layout(800, 600);
            assert.deepStrictEqual(view1Copy.size, [600, 300]);
            assert.deepStrictEqual(view2Copy.size, [600, 200]);
            assert.deepStrictEqual(view3Copy.size, [200, 400]);
            assert.deepStrictEqual(view4Copy.size, [200, 200]);
            assert.deepStrictEqual(view5Copy.size, [600, 100]);
        });
        test('deserialize simple layout with scaling', function () {
            const view1 = store.add(new TestSerializableView('view1', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.$iR(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            const view2 = store.add(new TestSerializableView('view2', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view2, 200, view1, 0 /* Direction.Up */);
            const view3 = store.add(new TestSerializableView('view3', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view3, 200, view1, 3 /* Direction.Right */);
            const view4 = store.add(new TestSerializableView('view4', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view4, 200, view2, 2 /* Direction.Left */);
            const view5 = store.add(new TestSerializableView('view5', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view5, 100, view1, 1 /* Direction.Down */);
            const json = grid.serialize();
            grid.dispose();
            const deserializer = new TestViewDeserializer(store);
            const grid2 = store.add(grid_1.$iR.deserialize(json, deserializer));
            const view1Copy = deserializer.getView('view1');
            const view2Copy = deserializer.getView('view2');
            const view3Copy = deserializer.getView('view3');
            const view4Copy = deserializer.getView('view4');
            const view5Copy = deserializer.getView('view5');
            grid2.layout(400, 800); // [/2, *4/3]
            assert.deepStrictEqual(view1Copy.size, [300, 400]);
            assert.deepStrictEqual(view2Copy.size, [300, 267]);
            assert.deepStrictEqual(view3Copy.size, [100, 533]);
            assert.deepStrictEqual(view4Copy.size, [100, 267]);
            assert.deepStrictEqual(view5Copy.size, [300, 133]);
        });
        test('deserialize 4 view layout (ben issue #2)', function () {
            const view1 = store.add(new TestSerializableView('view1', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.$iR(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            const view2 = store.add(new TestSerializableView('view2', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view2, grid_1.Sizing.Split, view1, 1 /* Direction.Down */);
            const view3 = store.add(new TestSerializableView('view3', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view3, grid_1.Sizing.Split, view2, 1 /* Direction.Down */);
            const view4 = store.add(new TestSerializableView('view4', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view4, grid_1.Sizing.Split, view3, 3 /* Direction.Right */);
            const json = grid.serialize();
            grid.dispose();
            const deserializer = new TestViewDeserializer(store);
            const grid2 = store.add(grid_1.$iR.deserialize(json, deserializer));
            const view1Copy = deserializer.getView('view1');
            const view2Copy = deserializer.getView('view2');
            const view3Copy = deserializer.getView('view3');
            const view4Copy = deserializer.getView('view4');
            grid2.layout(800, 600);
            assert.deepStrictEqual(view1Copy.size, [800, 300]);
            assert.deepStrictEqual(view2Copy.size, [800, 150]);
            assert.deepStrictEqual(view3Copy.size, [400, 150]);
            assert.deepStrictEqual(view4Copy.size, [400, 150]);
        });
        test('deserialize 2 view layout (ben issue #3)', function () {
            const view1 = store.add(new TestSerializableView('view1', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.$iR(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            const view2 = store.add(new TestSerializableView('view2', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view2, grid_1.Sizing.Split, view1, 3 /* Direction.Right */);
            const json = grid.serialize();
            grid.dispose();
            const deserializer = new TestViewDeserializer(store);
            const grid2 = store.add(grid_1.$iR.deserialize(json, deserializer));
            const view1Copy = deserializer.getView('view1');
            const view2Copy = deserializer.getView('view2');
            grid2.layout(800, 600);
            assert.deepStrictEqual(view1Copy.size, [400, 600]);
            assert.deepStrictEqual(view2Copy.size, [400, 600]);
        });
        test('deserialize simple view layout #50609', function () {
            const view1 = store.add(new TestSerializableView('view1', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.$iR(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            const view2 = store.add(new TestSerializableView('view2', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view2, grid_1.Sizing.Split, view1, 3 /* Direction.Right */);
            const view3 = store.add(new TestSerializableView('view3', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view3, grid_1.Sizing.Split, view2, 1 /* Direction.Down */);
            grid.removeView(view1, grid_1.Sizing.Split);
            const json = grid.serialize();
            grid.dispose();
            const deserializer = new TestViewDeserializer(store);
            const grid2 = store.add(grid_1.$iR.deserialize(json, deserializer));
            const view2Copy = deserializer.getView('view2');
            const view3Copy = deserializer.getView('view3');
            grid2.layout(800, 600);
            assert.deepStrictEqual(view2Copy.size, [800, 300]);
            assert.deepStrictEqual(view3Copy.size, [800, 300]);
        });
        test('sanitizeGridNodeDescriptor', () => {
            const nodeDescriptor = { groups: [{ size: 0.2 }, { size: 0.2 }, { size: 0.6, groups: [{}, {}] }] };
            const nodeDescriptorCopy = (0, objects_1.$Vm)(nodeDescriptor);
            (0, grid_1.$jR)(nodeDescriptorCopy, true);
            assert.deepStrictEqual(nodeDescriptorCopy, { groups: [{ size: 0.2 }, { size: 0.2 }, { size: 0.6, groups: [{ size: 0.5 }, { size: 0.5 }] }] });
        });
        test('createSerializedGrid', () => {
            const gridDescriptor = { orientation: 0 /* Orientation.VERTICAL */, groups: [{ size: 0.2, data: 'a' }, { size: 0.2, data: 'b' }, { size: 0.6, groups: [{ data: 'c' }, { data: 'd' }] }] };
            const serializedGrid = (0, grid_1.$kR)(gridDescriptor);
            assert.deepStrictEqual(serializedGrid, {
                root: {
                    type: 'branch',
                    size: undefined,
                    data: [
                        { type: 'leaf', size: 0.2, data: 'a' },
                        { type: 'leaf', size: 0.2, data: 'b' },
                        {
                            type: 'branch', size: 0.6, data: [
                                { type: 'leaf', size: 0.5, data: 'c' },
                                { type: 'leaf', size: 0.5, data: 'd' }
                            ]
                        }
                    ]
                },
                orientation: 0 /* Orientation.VERTICAL */,
                width: 1,
                height: 1
            });
        });
        test('createSerializedGrid - issue #85601, should not allow single children groups', () => {
            const serializedGrid = (0, grid_1.$kR)({ orientation: 1 /* Orientation.HORIZONTAL */, groups: [{ groups: [{}, {}], size: 0.5 }, { groups: [{}], size: 0.5 }] });
            const views = [];
            const deserializer = new class {
                fromJSON() {
                    const view = {
                        element: document.createElement('div'),
                        layout: () => null,
                        minimumWidth: 0,
                        maximumWidth: Number.POSITIVE_INFINITY,
                        minimumHeight: 0,
                        maximumHeight: Number.POSITIVE_INFINITY,
                        onDidChange: event_1.Event.None,
                        toJSON: () => ({})
                    };
                    views.push(view);
                    return view;
                }
            };
            const grid = store.add(grid_1.$iR.deserialize(serializedGrid, deserializer));
            assert.strictEqual(views.length, 3);
            // should not throw
            grid.removeView(views[2]);
        });
        test('from', () => {
            const createView = () => ({
                element: document.createElement('div'),
                layout: () => null,
                minimumWidth: 0,
                maximumWidth: Number.POSITIVE_INFINITY,
                minimumHeight: 0,
                maximumHeight: Number.POSITIVE_INFINITY,
                onDidChange: event_1.Event.None,
                toJSON: () => ({})
            });
            const a = createView();
            const b = createView();
            const c = createView();
            const d = createView();
            const gridDescriptor = { orientation: 0 /* Orientation.VERTICAL */, groups: [{ size: 0.2, data: a }, { size: 0.2, data: b }, { size: 0.6, groups: [{ data: c }, { data: d }] }] };
            const grid = grid_1.$iR.from(gridDescriptor);
            assert.deepStrictEqual((0, util_1.$qT)(grid.getViews()), [a, b, [c, d]]);
            grid.dispose();
        });
        test('serialize should store visibility and previous size', function () {
            const view1 = store.add(new TestSerializableView('view1', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.$iR(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            const view2 = store.add(new TestSerializableView('view2', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view2, 200, view1, 0 /* Direction.Up */);
            const view3 = store.add(new TestSerializableView('view3', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view3, 200, view1, 3 /* Direction.Right */);
            const view4 = store.add(new TestSerializableView('view4', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view4, 200, view2, 2 /* Direction.Left */);
            const view5 = store.add(new TestSerializableView('view5', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view5, 100, view1, 1 /* Direction.Down */);
            assert.deepStrictEqual(view1.size, [600, 300]);
            assert.deepStrictEqual(view2.size, [600, 200]);
            assert.deepStrictEqual(view3.size, [200, 400]);
            assert.deepStrictEqual(view4.size, [200, 200]);
            assert.deepStrictEqual(view5.size, [600, 100]);
            grid.setViewVisible(view5, false);
            assert.deepStrictEqual(view1.size, [600, 400]);
            assert.deepStrictEqual(view2.size, [600, 200]);
            assert.deepStrictEqual(view3.size, [200, 400]);
            assert.deepStrictEqual(view4.size, [200, 200]);
            assert.deepStrictEqual(view5.size, [600, 0]);
            grid.setViewVisible(view5, true);
            assert.deepStrictEqual(view1.size, [600, 300]);
            assert.deepStrictEqual(view2.size, [600, 200]);
            assert.deepStrictEqual(view3.size, [200, 400]);
            assert.deepStrictEqual(view4.size, [200, 200]);
            assert.deepStrictEqual(view5.size, [600, 100]);
            grid.setViewVisible(view5, false);
            assert.deepStrictEqual(view1.size, [600, 400]);
            assert.deepStrictEqual(view2.size, [600, 200]);
            assert.deepStrictEqual(view3.size, [200, 400]);
            assert.deepStrictEqual(view4.size, [200, 200]);
            assert.deepStrictEqual(view5.size, [600, 0]);
            grid.setViewVisible(view5, false);
            const json = grid.serialize();
            assert.deepStrictEqual(json, {
                orientation: 0,
                width: 800,
                height: 600,
                root: {
                    type: 'branch',
                    data: [
                        {
                            type: 'branch',
                            data: [
                                { type: 'leaf', data: { name: 'view4' }, size: 200 },
                                { type: 'leaf', data: { name: 'view2' }, size: 600 }
                            ],
                            size: 200
                        },
                        {
                            type: 'branch',
                            data: [
                                {
                                    type: 'branch',
                                    data: [
                                        { type: 'leaf', data: { name: 'view1' }, size: 400 },
                                        { type: 'leaf', data: { name: 'view5' }, size: 100, visible: false }
                                    ],
                                    size: 600
                                },
                                { type: 'leaf', data: { name: 'view3' }, size: 200 }
                            ],
                            size: 400
                        }
                    ],
                    size: 800
                }
            });
            grid.dispose();
            const deserializer = new TestViewDeserializer(store);
            const grid2 = store.add(grid_1.$iR.deserialize(json, deserializer));
            const view1Copy = deserializer.getView('view1');
            const view2Copy = deserializer.getView('view2');
            const view3Copy = deserializer.getView('view3');
            const view4Copy = deserializer.getView('view4');
            const view5Copy = deserializer.getView('view5');
            assert.deepStrictEqual((0, util_1.$qT)(grid2.getViews()), [[view4Copy, view2Copy], [[view1Copy, view5Copy], view3Copy]]);
            grid2.layout(800, 600);
            assert.deepStrictEqual(view1Copy.size, [600, 400]);
            assert.deepStrictEqual(view2Copy.size, [600, 200]);
            assert.deepStrictEqual(view3Copy.size, [200, 400]);
            assert.deepStrictEqual(view4Copy.size, [200, 200]);
            assert.deepStrictEqual(view5Copy.size, [600, 0]);
            assert.deepStrictEqual(grid2.isViewVisible(view1Copy), true);
            assert.deepStrictEqual(grid2.isViewVisible(view2Copy), true);
            assert.deepStrictEqual(grid2.isViewVisible(view3Copy), true);
            assert.deepStrictEqual(grid2.isViewVisible(view4Copy), true);
            assert.deepStrictEqual(grid2.isViewVisible(view5Copy), false);
            grid2.setViewVisible(view5Copy, true);
            assert.deepStrictEqual(view1Copy.size, [600, 300]);
            assert.deepStrictEqual(view2Copy.size, [600, 200]);
            assert.deepStrictEqual(view3Copy.size, [200, 400]);
            assert.deepStrictEqual(view4Copy.size, [200, 200]);
            assert.deepStrictEqual(view5Copy.size, [600, 100]);
            assert.deepStrictEqual(grid2.isViewVisible(view1Copy), true);
            assert.deepStrictEqual(grid2.isViewVisible(view2Copy), true);
            assert.deepStrictEqual(grid2.isViewVisible(view3Copy), true);
            assert.deepStrictEqual(grid2.isViewVisible(view4Copy), true);
            assert.deepStrictEqual(grid2.isViewVisible(view5Copy), true);
        });
        test('serialize should store visibility and previous size even for first leaf', function () {
            const view1 = store.add(new TestSerializableView('view1', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.$iR(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            const view2 = store.add(new TestSerializableView('view2', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view2, 200, view1, 0 /* Direction.Up */);
            const view3 = store.add(new TestSerializableView('view3', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view3, 200, view1, 3 /* Direction.Right */);
            const view4 = store.add(new TestSerializableView('view4', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view4, 200, view2, 2 /* Direction.Left */);
            const view5 = store.add(new TestSerializableView('view5', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view5, 100, view1, 1 /* Direction.Down */);
            assert.deepStrictEqual(view1.size, [600, 300]);
            assert.deepStrictEqual(view2.size, [600, 200]);
            assert.deepStrictEqual(view3.size, [200, 400]);
            assert.deepStrictEqual(view4.size, [200, 200]);
            assert.deepStrictEqual(view5.size, [600, 100]);
            grid.setViewVisible(view4, false);
            assert.deepStrictEqual(view1.size, [600, 300]);
            assert.deepStrictEqual(view2.size, [800, 200]);
            assert.deepStrictEqual(view3.size, [200, 400]);
            assert.deepStrictEqual(view4.size, [0, 200]);
            assert.deepStrictEqual(view5.size, [600, 100]);
            const json = grid.serialize();
            assert.deepStrictEqual(json, {
                orientation: 0,
                width: 800,
                height: 600,
                root: {
                    type: 'branch',
                    data: [
                        {
                            type: 'branch',
                            data: [
                                { type: 'leaf', data: { name: 'view4' }, size: 200, visible: false },
                                { type: 'leaf', data: { name: 'view2' }, size: 800 }
                            ],
                            size: 200
                        },
                        {
                            type: 'branch',
                            data: [
                                {
                                    type: 'branch',
                                    data: [
                                        { type: 'leaf', data: { name: 'view1' }, size: 300 },
                                        { type: 'leaf', data: { name: 'view5' }, size: 100 }
                                    ],
                                    size: 600
                                },
                                { type: 'leaf', data: { name: 'view3' }, size: 200 }
                            ],
                            size: 400
                        }
                    ],
                    size: 800
                }
            });
            grid.dispose();
            const deserializer = new TestViewDeserializer(store);
            const grid2 = store.add(grid_1.$iR.deserialize(json, deserializer));
            const view1Copy = deserializer.getView('view1');
            const view2Copy = deserializer.getView('view2');
            const view3Copy = deserializer.getView('view3');
            const view4Copy = deserializer.getView('view4');
            const view5Copy = deserializer.getView('view5');
            assert.deepStrictEqual((0, util_1.$qT)(grid2.getViews()), [[view4Copy, view2Copy], [[view1Copy, view5Copy], view3Copy]]);
            grid2.layout(800, 600);
            assert.deepStrictEqual(view1Copy.size, [600, 300]);
            assert.deepStrictEqual(view2Copy.size, [800, 200]);
            assert.deepStrictEqual(view3Copy.size, [200, 400]);
            assert.deepStrictEqual(view4Copy.size, [0, 200]);
            assert.deepStrictEqual(view5Copy.size, [600, 100]);
            assert.deepStrictEqual(grid2.isViewVisible(view1Copy), true);
            assert.deepStrictEqual(grid2.isViewVisible(view2Copy), true);
            assert.deepStrictEqual(grid2.isViewVisible(view3Copy), true);
            assert.deepStrictEqual(grid2.isViewVisible(view4Copy), false);
            assert.deepStrictEqual(grid2.isViewVisible(view5Copy), true);
            grid2.setViewVisible(view4Copy, true);
            assert.deepStrictEqual(view1Copy.size, [600, 300]);
            assert.deepStrictEqual(view2Copy.size, [600, 200]);
            assert.deepStrictEqual(view3Copy.size, [200, 400]);
            assert.deepStrictEqual(view4Copy.size, [200, 200]);
            assert.deepStrictEqual(view5Copy.size, [600, 100]);
            assert.deepStrictEqual(grid2.isViewVisible(view1Copy), true);
            assert.deepStrictEqual(grid2.isViewVisible(view2Copy), true);
            assert.deepStrictEqual(grid2.isViewVisible(view3Copy), true);
            assert.deepStrictEqual(grid2.isViewVisible(view4Copy), true);
            assert.deepStrictEqual(grid2.isViewVisible(view5Copy), true);
        });
    });
});
//# sourceMappingURL=grid.test.js.map