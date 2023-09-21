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
        const store = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        let container;
        setup(function () {
            container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.width = `${800}px`;
            container.style.height = `${600}px`;
        });
        test('getRelativeLocation', () => {
            assert.deepStrictEqual((0, grid_1.getRelativeLocation)(0 /* Orientation.VERTICAL */, [0], 0 /* Direction.Up */), [0]);
            assert.deepStrictEqual((0, grid_1.getRelativeLocation)(0 /* Orientation.VERTICAL */, [0], 1 /* Direction.Down */), [1]);
            assert.deepStrictEqual((0, grid_1.getRelativeLocation)(0 /* Orientation.VERTICAL */, [0], 2 /* Direction.Left */), [0, 0]);
            assert.deepStrictEqual((0, grid_1.getRelativeLocation)(0 /* Orientation.VERTICAL */, [0], 3 /* Direction.Right */), [0, 1]);
            assert.deepStrictEqual((0, grid_1.getRelativeLocation)(1 /* Orientation.HORIZONTAL */, [0], 0 /* Direction.Up */), [0, 0]);
            assert.deepStrictEqual((0, grid_1.getRelativeLocation)(1 /* Orientation.HORIZONTAL */, [0], 1 /* Direction.Down */), [0, 1]);
            assert.deepStrictEqual((0, grid_1.getRelativeLocation)(1 /* Orientation.HORIZONTAL */, [0], 2 /* Direction.Left */), [0]);
            assert.deepStrictEqual((0, grid_1.getRelativeLocation)(1 /* Orientation.HORIZONTAL */, [0], 3 /* Direction.Right */), [1]);
            assert.deepStrictEqual((0, grid_1.getRelativeLocation)(0 /* Orientation.VERTICAL */, [4], 0 /* Direction.Up */), [4]);
            assert.deepStrictEqual((0, grid_1.getRelativeLocation)(0 /* Orientation.VERTICAL */, [4], 1 /* Direction.Down */), [5]);
            assert.deepStrictEqual((0, grid_1.getRelativeLocation)(0 /* Orientation.VERTICAL */, [4], 2 /* Direction.Left */), [4, 0]);
            assert.deepStrictEqual((0, grid_1.getRelativeLocation)(0 /* Orientation.VERTICAL */, [4], 3 /* Direction.Right */), [4, 1]);
            assert.deepStrictEqual((0, grid_1.getRelativeLocation)(0 /* Orientation.VERTICAL */, [0, 0], 0 /* Direction.Up */), [0, 0, 0]);
            assert.deepStrictEqual((0, grid_1.getRelativeLocation)(0 /* Orientation.VERTICAL */, [0, 0], 1 /* Direction.Down */), [0, 0, 1]);
            assert.deepStrictEqual((0, grid_1.getRelativeLocation)(0 /* Orientation.VERTICAL */, [0, 0], 2 /* Direction.Left */), [0, 0]);
            assert.deepStrictEqual((0, grid_1.getRelativeLocation)(0 /* Orientation.VERTICAL */, [0, 0], 3 /* Direction.Right */), [0, 1]);
            assert.deepStrictEqual((0, grid_1.getRelativeLocation)(0 /* Orientation.VERTICAL */, [1, 2], 0 /* Direction.Up */), [1, 2, 0]);
            assert.deepStrictEqual((0, grid_1.getRelativeLocation)(0 /* Orientation.VERTICAL */, [1, 2], 1 /* Direction.Down */), [1, 2, 1]);
            assert.deepStrictEqual((0, grid_1.getRelativeLocation)(0 /* Orientation.VERTICAL */, [1, 2], 2 /* Direction.Left */), [1, 2]);
            assert.deepStrictEqual((0, grid_1.getRelativeLocation)(0 /* Orientation.VERTICAL */, [1, 2], 3 /* Direction.Right */), [1, 3]);
            assert.deepStrictEqual((0, grid_1.getRelativeLocation)(0 /* Orientation.VERTICAL */, [1, 2, 3], 0 /* Direction.Up */), [1, 2, 3]);
            assert.deepStrictEqual((0, grid_1.getRelativeLocation)(0 /* Orientation.VERTICAL */, [1, 2, 3], 1 /* Direction.Down */), [1, 2, 4]);
            assert.deepStrictEqual((0, grid_1.getRelativeLocation)(0 /* Orientation.VERTICAL */, [1, 2, 3], 2 /* Direction.Left */), [1, 2, 3, 0]);
            assert.deepStrictEqual((0, grid_1.getRelativeLocation)(0 /* Orientation.VERTICAL */, [1, 2, 3], 3 /* Direction.Right */), [1, 2, 3, 1]);
        });
        test('empty', () => {
            const view1 = store.add(new util_1.TestView(100, Number.MAX_VALUE, 100, Number.MAX_VALUE));
            const gridview = store.add(new grid_1.Grid(view1));
            container.appendChild(gridview.element);
            gridview.layout(800, 600);
            assert.deepStrictEqual(view1.size, [800, 600]);
        });
        test('two views vertically', function () {
            const view1 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.Grid(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            assert.deepStrictEqual(view1.size, [800, 600]);
            const view2 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view2, 200, view1, 0 /* Direction.Up */);
            assert.deepStrictEqual(view1.size, [800, 400]);
            assert.deepStrictEqual(view2.size, [800, 200]);
        });
        test('two views horizontally', function () {
            const view1 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.Grid(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            assert.deepStrictEqual(view1.size, [800, 600]);
            const view2 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view2, 300, view1, 3 /* Direction.Right */);
            assert.deepStrictEqual(view1.size, [500, 600]);
            assert.deepStrictEqual(view2.size, [300, 600]);
        });
        test('simple layout', function () {
            const view1 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.Grid(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            assert.deepStrictEqual(view1.size, [800, 600]);
            const view2 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view2, 200, view1, 0 /* Direction.Up */);
            assert.deepStrictEqual(view1.size, [800, 400]);
            assert.deepStrictEqual(view2.size, [800, 200]);
            const view3 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view3, 200, view1, 3 /* Direction.Right */);
            assert.deepStrictEqual(view1.size, [600, 400]);
            assert.deepStrictEqual(view2.size, [800, 200]);
            assert.deepStrictEqual(view3.size, [200, 400]);
            const view4 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view4, 200, view2, 2 /* Direction.Left */);
            assert.deepStrictEqual(view1.size, [600, 400]);
            assert.deepStrictEqual(view2.size, [600, 200]);
            assert.deepStrictEqual(view3.size, [200, 400]);
            assert.deepStrictEqual(view4.size, [200, 200]);
            const view5 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view5, 100, view1, 1 /* Direction.Down */);
            assert.deepStrictEqual(view1.size, [600, 300]);
            assert.deepStrictEqual(view2.size, [600, 200]);
            assert.deepStrictEqual(view3.size, [200, 400]);
            assert.deepStrictEqual(view4.size, [200, 200]);
            assert.deepStrictEqual(view5.size, [600, 100]);
        });
        test('another simple layout with automatic size distribution', function () {
            const view1 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.Grid(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            assert.deepStrictEqual(view1.size, [800, 600]);
            const view2 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view2, grid_1.Sizing.Distribute, view1, 2 /* Direction.Left */);
            assert.deepStrictEqual(view1.size, [400, 600]);
            assert.deepStrictEqual(view2.size, [400, 600]);
            const view3 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view3, grid_1.Sizing.Distribute, view1, 3 /* Direction.Right */);
            assert.deepStrictEqual(view1.size, [266, 600]);
            assert.deepStrictEqual(view2.size, [266, 600]);
            assert.deepStrictEqual(view3.size, [268, 600]);
            const view4 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view4, grid_1.Sizing.Distribute, view2, 1 /* Direction.Down */);
            assert.deepStrictEqual(view1.size, [266, 600]);
            assert.deepStrictEqual(view2.size, [266, 300]);
            assert.deepStrictEqual(view3.size, [268, 600]);
            assert.deepStrictEqual(view4.size, [266, 300]);
            const view5 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view5, grid_1.Sizing.Distribute, view3, 0 /* Direction.Up */);
            assert.deepStrictEqual(view1.size, [266, 600]);
            assert.deepStrictEqual(view2.size, [266, 300]);
            assert.deepStrictEqual(view3.size, [268, 300]);
            assert.deepStrictEqual(view4.size, [266, 300]);
            assert.deepStrictEqual(view5.size, [268, 300]);
            const view6 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view6, grid_1.Sizing.Distribute, view3, 1 /* Direction.Down */);
            assert.deepStrictEqual(view1.size, [266, 600]);
            assert.deepStrictEqual(view2.size, [266, 300]);
            assert.deepStrictEqual(view3.size, [268, 200]);
            assert.deepStrictEqual(view4.size, [266, 300]);
            assert.deepStrictEqual(view5.size, [268, 200]);
            assert.deepStrictEqual(view6.size, [268, 200]);
        });
        test('another simple layout with split size distribution', function () {
            const view1 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.Grid(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            assert.deepStrictEqual(view1.size, [800, 600]);
            const view2 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view2, grid_1.Sizing.Split, view1, 2 /* Direction.Left */);
            assert.deepStrictEqual(view1.size, [400, 600]);
            assert.deepStrictEqual(view2.size, [400, 600]);
            const view3 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view3, grid_1.Sizing.Split, view1, 3 /* Direction.Right */);
            assert.deepStrictEqual(view1.size, [200, 600]);
            assert.deepStrictEqual(view2.size, [400, 600]);
            assert.deepStrictEqual(view3.size, [200, 600]);
            const view4 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view4, grid_1.Sizing.Split, view2, 1 /* Direction.Down */);
            assert.deepStrictEqual(view1.size, [200, 600]);
            assert.deepStrictEqual(view2.size, [400, 300]);
            assert.deepStrictEqual(view3.size, [200, 600]);
            assert.deepStrictEqual(view4.size, [400, 300]);
            const view5 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view5, grid_1.Sizing.Split, view3, 0 /* Direction.Up */);
            assert.deepStrictEqual(view1.size, [200, 600]);
            assert.deepStrictEqual(view2.size, [400, 300]);
            assert.deepStrictEqual(view3.size, [200, 300]);
            assert.deepStrictEqual(view4.size, [400, 300]);
            assert.deepStrictEqual(view5.size, [200, 300]);
            const view6 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view6, grid_1.Sizing.Split, view3, 1 /* Direction.Down */);
            assert.deepStrictEqual(view1.size, [200, 600]);
            assert.deepStrictEqual(view2.size, [400, 300]);
            assert.deepStrictEqual(view3.size, [200, 150]);
            assert.deepStrictEqual(view4.size, [400, 300]);
            assert.deepStrictEqual(view5.size, [200, 300]);
            assert.deepStrictEqual(view6.size, [200, 150]);
        });
        test('3/2 layout with split', function () {
            const view1 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.Grid(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            assert.deepStrictEqual(view1.size, [800, 600]);
            const view2 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view2, grid_1.Sizing.Split, view1, 1 /* Direction.Down */);
            assert.deepStrictEqual(view1.size, [800, 300]);
            assert.deepStrictEqual(view2.size, [800, 300]);
            const view3 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view3, grid_1.Sizing.Split, view2, 3 /* Direction.Right */);
            assert.deepStrictEqual(view1.size, [800, 300]);
            assert.deepStrictEqual(view2.size, [400, 300]);
            assert.deepStrictEqual(view3.size, [400, 300]);
            const view4 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view4, grid_1.Sizing.Split, view1, 3 /* Direction.Right */);
            assert.deepStrictEqual(view1.size, [400, 300]);
            assert.deepStrictEqual(view2.size, [400, 300]);
            assert.deepStrictEqual(view3.size, [400, 300]);
            assert.deepStrictEqual(view4.size, [400, 300]);
            const view5 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view5, grid_1.Sizing.Split, view1, 3 /* Direction.Right */);
            assert.deepStrictEqual(view1.size, [200, 300]);
            assert.deepStrictEqual(view2.size, [400, 300]);
            assert.deepStrictEqual(view3.size, [400, 300]);
            assert.deepStrictEqual(view4.size, [400, 300]);
            assert.deepStrictEqual(view5.size, [200, 300]);
        });
        test('sizing should be correct after branch demotion #50564', function () {
            const view1 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.Grid(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            const view2 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view2, grid_1.Sizing.Split, view1, 3 /* Direction.Right */);
            const view3 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view3, grid_1.Sizing.Split, view2, 1 /* Direction.Down */);
            const view4 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
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
            const view1 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.Grid(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            const view2 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view2, grid_1.Sizing.Distribute, view1, 1 /* Direction.Down */);
            const view3 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view3, grid_1.Sizing.Distribute, view2, 1 /* Direction.Down */);
            const view4 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
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
            const view1 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.Grid(view1));
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
            const view1 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.Grid(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            const view2 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view2, grid_1.Sizing.Distribute, view1, 1 /* Direction.Down */);
            const view3 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
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
            const view1 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.Grid(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            const view2 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view2, grid_1.Sizing.Distribute, view1, 1 /* Direction.Down */);
            const view3 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view3, grid_1.Sizing.Distribute, view2, 1 /* Direction.Down */);
            const view4 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view4, grid_1.Sizing.Distribute, view2, 3 /* Direction.Right */);
            const view5 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
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
            const view1 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.Grid(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            const view2 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view2, grid_1.Sizing.Distribute, view1, 3 /* Direction.Right */);
            const view3 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view3, grid_1.Sizing.Distribute, view2, 1 /* Direction.Down */);
            const view4 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view4, grid_1.Sizing.Distribute, view2, 3 /* Direction.Right */);
            assert.deepStrictEqual(grid.getNeighborViews(view4, 0 /* Direction.Up */), []);
            assert.deepStrictEqual(grid.getNeighborViews(view4, 3 /* Direction.Right */), []);
            assert.deepStrictEqual(grid.getNeighborViews(view4, 1 /* Direction.Down */), [view3]);
            assert.deepStrictEqual(grid.getNeighborViews(view4, 2 /* Direction.Left */), [view2]);
        });
        test('getNeighborViews should only return immediate neighbors', function () {
            const view1 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.Grid(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            const view2 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view2, grid_1.Sizing.Distribute, view1, 3 /* Direction.Right */);
            const view3 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view3, grid_1.Sizing.Distribute, view2, 1 /* Direction.Down */);
            const view4 = store.add(new util_1.TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view4, grid_1.Sizing.Distribute, view2, 3 /* Direction.Right */);
            assert.deepStrictEqual(grid.getNeighborViews(view1, 3 /* Direction.Right */), [view2, view3]);
        });
    });
    class TestSerializableView extends util_1.TestView {
        constructor(name, minimumWidth, maximumWidth, minimumHeight, maximumHeight) {
            super(minimumWidth, maximumWidth, minimumHeight, maximumHeight);
            this.name = name;
        }
        toJSON() {
            return { name: this.name };
        }
    }
    class TestViewDeserializer {
        constructor(store) {
            this.store = store;
            this.views = new Map();
        }
        fromJSON(json) {
            const view = this.store.add(new TestSerializableView(json.name, 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            this.views.set(json.name, view);
            return view;
        }
        getView(id) {
            const view = this.views.get(id);
            if (!view) {
                throw new Error('Unknown view');
            }
            return view;
        }
    }
    function nodesToNames(node) {
        if ((0, grid_1.isGridBranchNode)(node)) {
            return node.children.map(nodesToNames);
        }
        else {
            return node.view.name;
        }
    }
    suite('SerializableGrid', function () {
        const store = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        let container;
        setup(function () {
            container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.width = `${800}px`;
            container.style.height = `${600}px`;
        });
        test('serialize empty', function () {
            const view1 = store.add(new TestSerializableView('view1', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.SerializableGrid(view1));
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
            const grid = store.add(new grid_1.SerializableGrid(view1));
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
            const grid = store.add(new grid_1.SerializableGrid(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            const json = grid.serialize();
            grid.dispose();
            const deserializer = new TestViewDeserializer(store);
            const grid2 = store.add(grid_1.SerializableGrid.deserialize(json, deserializer));
            grid2.layout(800, 600);
            assert.deepStrictEqual(nodesToNames(grid2.getViews()), ['view1']);
        });
        test('deserialize simple layout', function () {
            const view1 = store.add(new TestSerializableView('view1', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.SerializableGrid(view1));
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
            const grid2 = store.add(grid_1.SerializableGrid.deserialize(json, deserializer));
            const view1Copy = deserializer.getView('view1');
            const view2Copy = deserializer.getView('view2');
            const view3Copy = deserializer.getView('view3');
            const view4Copy = deserializer.getView('view4');
            const view5Copy = deserializer.getView('view5');
            assert.deepStrictEqual((0, util_1.nodesToArrays)(grid2.getViews()), [[view4Copy, view2Copy], [[view1Copy, view5Copy], view3Copy]]);
            grid2.layout(800, 600);
            assert.deepStrictEqual(view1Copy.size, [600, 300]);
            assert.deepStrictEqual(view2Copy.size, [600, 200]);
            assert.deepStrictEqual(view3Copy.size, [200, 400]);
            assert.deepStrictEqual(view4Copy.size, [200, 200]);
            assert.deepStrictEqual(view5Copy.size, [600, 100]);
        });
        test('deserialize simple layout with scaling', function () {
            const view1 = store.add(new TestSerializableView('view1', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.SerializableGrid(view1));
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
            const grid2 = store.add(grid_1.SerializableGrid.deserialize(json, deserializer));
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
            const grid = store.add(new grid_1.SerializableGrid(view1));
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
            const grid2 = store.add(grid_1.SerializableGrid.deserialize(json, deserializer));
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
            const grid = store.add(new grid_1.SerializableGrid(view1));
            container.appendChild(grid.element);
            grid.layout(800, 600);
            const view2 = store.add(new TestSerializableView('view2', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            grid.addView(view2, grid_1.Sizing.Split, view1, 3 /* Direction.Right */);
            const json = grid.serialize();
            grid.dispose();
            const deserializer = new TestViewDeserializer(store);
            const grid2 = store.add(grid_1.SerializableGrid.deserialize(json, deserializer));
            const view1Copy = deserializer.getView('view1');
            const view2Copy = deserializer.getView('view2');
            grid2.layout(800, 600);
            assert.deepStrictEqual(view1Copy.size, [400, 600]);
            assert.deepStrictEqual(view2Copy.size, [400, 600]);
        });
        test('deserialize simple view layout #50609', function () {
            const view1 = store.add(new TestSerializableView('view1', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.SerializableGrid(view1));
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
            const grid2 = store.add(grid_1.SerializableGrid.deserialize(json, deserializer));
            const view2Copy = deserializer.getView('view2');
            const view3Copy = deserializer.getView('view3');
            grid2.layout(800, 600);
            assert.deepStrictEqual(view2Copy.size, [800, 300]);
            assert.deepStrictEqual(view3Copy.size, [800, 300]);
        });
        test('sanitizeGridNodeDescriptor', () => {
            const nodeDescriptor = { groups: [{ size: 0.2 }, { size: 0.2 }, { size: 0.6, groups: [{}, {}] }] };
            const nodeDescriptorCopy = (0, objects_1.deepClone)(nodeDescriptor);
            (0, grid_1.sanitizeGridNodeDescriptor)(nodeDescriptorCopy, true);
            assert.deepStrictEqual(nodeDescriptorCopy, { groups: [{ size: 0.2 }, { size: 0.2 }, { size: 0.6, groups: [{ size: 0.5 }, { size: 0.5 }] }] });
        });
        test('createSerializedGrid', () => {
            const gridDescriptor = { orientation: 0 /* Orientation.VERTICAL */, groups: [{ size: 0.2, data: 'a' }, { size: 0.2, data: 'b' }, { size: 0.6, groups: [{ data: 'c' }, { data: 'd' }] }] };
            const serializedGrid = (0, grid_1.createSerializedGrid)(gridDescriptor);
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
            const serializedGrid = (0, grid_1.createSerializedGrid)({ orientation: 1 /* Orientation.HORIZONTAL */, groups: [{ groups: [{}, {}], size: 0.5 }, { groups: [{}], size: 0.5 }] });
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
            const grid = store.add(grid_1.SerializableGrid.deserialize(serializedGrid, deserializer));
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
            const grid = grid_1.SerializableGrid.from(gridDescriptor);
            assert.deepStrictEqual((0, util_1.nodesToArrays)(grid.getViews()), [a, b, [c, d]]);
            grid.dispose();
        });
        test('serialize should store visibility and previous size', function () {
            const view1 = store.add(new TestSerializableView('view1', 50, Number.MAX_VALUE, 50, Number.MAX_VALUE));
            const grid = store.add(new grid_1.SerializableGrid(view1));
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
            const grid2 = store.add(grid_1.SerializableGrid.deserialize(json, deserializer));
            const view1Copy = deserializer.getView('view1');
            const view2Copy = deserializer.getView('view2');
            const view3Copy = deserializer.getView('view3');
            const view4Copy = deserializer.getView('view4');
            const view5Copy = deserializer.getView('view5');
            assert.deepStrictEqual((0, util_1.nodesToArrays)(grid2.getViews()), [[view4Copy, view2Copy], [[view1Copy, view5Copy], view3Copy]]);
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
            const grid = store.add(new grid_1.SerializableGrid(view1));
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
            const grid2 = store.add(grid_1.SerializableGrid.deserialize(json, deserializer));
            const view1Copy = deserializer.getView('view1');
            const view2Copy = deserializer.getView('view2');
            const view3Copy = deserializer.getView('view3');
            const view4Copy = deserializer.getView('view4');
            const view5Copy = deserializer.getView('view5');
            assert.deepStrictEqual((0, util_1.nodesToArrays)(grid2.getViews()), [[view4Copy, view2Copy], [[view1Copy, view5Copy], view3Copy]]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JpZC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS90ZXN0L2Jyb3dzZXIvdWkvZ3JpZC9ncmlkLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFVaEcsa0JBQWtCO0lBQ2xCLEVBQUU7SUFDRiwyQkFBMkI7SUFDM0IsMkJBQTJCO0lBQzNCLDJCQUEyQjtJQUMzQiwyQkFBMkI7SUFDM0IsMkJBQTJCO0lBQzNCLDJCQUEyQjtJQUMzQiwyQkFBMkI7SUFDM0IsRUFBRTtJQUNGLEtBQUs7SUFDTCxPQUFPO0lBQ1AsU0FBUztJQUNULFNBQVM7SUFDVCxPQUFPO0lBQ1AsU0FBUztJQUNULFdBQVc7SUFDWCxXQUFXO0lBQ1gsU0FBUztJQUVULEtBQUssQ0FBQyxNQUFNLEVBQUU7UUFFYixNQUFNLEtBQUssR0FBRyxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFDeEQsSUFBSSxTQUFzQixDQUFDO1FBRTNCLEtBQUssQ0FBQztZQUNMLFNBQVMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQztZQUN0QyxTQUFTLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDO1lBQ25DLFNBQVMsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUM7UUFDckMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMscUJBQXFCLEVBQUUsR0FBRyxFQUFFO1lBQ2hDLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBQSwwQkFBbUIsZ0NBQXVCLENBQUMsQ0FBQyxDQUFDLHVCQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFGLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBQSwwQkFBbUIsZ0NB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QUFDLENBQUMsQ0FBQztZQUUvQyxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksZUFBUSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUUsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNsRixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsS0FBSywwQkFBa0IsQ0FBQztZQUNqRCxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQyxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQyxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUUvQyxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksZUFBUSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUUsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNsRixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsS0FBSyx5QkFBaUIsQ0FBQztZQUNoRCxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQyxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQyxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQyxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUUvQyxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksZUFBUSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUUsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNsRixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsS0FBSyx5QkFBaUIsQ0FBQztZQUNoRCxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQyxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQyxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQyxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQyxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNoRCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyx3REFBd0QsRUFBRTtZQUM5RCxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksZUFBUSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUUsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNsRixNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksV0FBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDeEMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDdEIsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFFL0MsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLGVBQVEsQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDbEYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsYUFBTSxDQUFDLFVBQVUsRUFBRSxLQUFLLHlCQUFpQixDQUFDO1lBQzlELE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRS9DLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxlQUFRLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxTQUFTLEVBQUUsRUFBRSxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ2xGLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLGFBQU0sQ0FBQyxVQUFVLEVBQUUsS0FBSywwQkFBa0IsQ0FBQztZQUMvRCxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQyxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQyxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUUvQyxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksZUFBUSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUUsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNsRixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxhQUFNLENBQUMsVUFBVSxFQUFFLEtBQUsseUJBQWlCLENBQUM7WUFDOUQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0MsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0MsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0MsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFFL0MsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLGVBQVEsQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDbEYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsYUFBTSxDQUFDLFVBQVUsRUFBRSxLQUFLLHVCQUFlLENBQUM7WUFDNUQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0MsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0MsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0MsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0MsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFFL0MsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLGVBQVEsQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDbEYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsYUFBTSxDQUFDLFVBQVUsRUFBRSxLQUFLLHlCQUFpQixDQUFDO1lBQzlELE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxH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QUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUUvQyxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksZUFBUSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUUsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNsRixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxhQUFNLENBQUMsS0FBSyxFQUFFLEtBQUssdUJBQWUsQ0FBQztZQUN2RCxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQyxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQyxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQyxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQyxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUUvQyxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksZUFBUSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUUsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNsRixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxhQUFNLENBQUMsS0FBSyxFQUFFLEtBQUsseUJBQWlCLENBQUM7WUFDekQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0MsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0MsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0MsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0MsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0MsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDaEQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsdUJBQXVCLEVBQUU7WUFDN0IsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLGVBQVEsQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDbEYsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLFdBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRXBDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3RCLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRS9DLE1BQU0sS0FBSyxHQUFH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LElBQUksZUFBUSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUUsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNsRixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxhQUFNLENBQUMsS0FBSyxFQUFFLEtBQUssMEJBQWtCLENBQUM7WUFDMUQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0MsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0MsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0MsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFFL0MsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN2QixNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQyxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQyxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNoRCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyx1REFBdUQsRUFBRTtZQUM3RCxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksZUFBUSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsU0FBUyxFQUFF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O1lBQ3ZHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxLQUFLLHlCQUFpQixDQUFDO1lBRWhELE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sQ0FBQyxTQUFTLEVBQUUsRUFBRSxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3ZHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxLQUFLLHlCQUFpQixDQUFDO1lBRWhELE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRS9DLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRWxDLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRTdDLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRWpDLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRS9DLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRWxDLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQy9D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LEVBQUUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFdkgsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDdkIsTUFBTSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDbkQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDbkQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDbkQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDbkQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFakQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUU5RCxLQUFLLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUV0QyxNQUFNLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNuRCxNQUFNLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNuRCxNQUFNLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNuRCxNQUFNLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNuRCxNQUFNLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUVuRCxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzlELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHlFQUF5RSxFQUFFO1lBQy9FLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sQ0FBQyxTQUFTLEVBQUUsRUFBRSxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3ZHLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSx1QkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ3BELFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBRXRCLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sQ0FBQyxTQUFTLEVBQUUsRUFBRSxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3ZHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxLQUFLLHVCQUFlLENBQUM7WUFFOUMsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDdkcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUssMEJBQWtCLENBQUM7WUFFakQsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDdkcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUsseUJBQWlCLENBQUM7WUFFaEQsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDdkcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUsseUJBQWlCLENBQUM7WUFFaEQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0MsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0MsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0MsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0MsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFFL0MsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFbEMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0MsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0MsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFD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QUMsQ0FBQyxDQUFDO1lBQ25ELE1BQU0sQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ25ELE1BQU0sQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ25ELE1BQU0sQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ25ELE1BQU0sQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRW5ELE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDOUQsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyJ9