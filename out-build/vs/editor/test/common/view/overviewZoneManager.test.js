/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/viewModel/overviewZoneManager"], function (require, exports, assert, utils_1, overviewZoneManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Editor View - OverviewZoneManager', () => {
        (0, utils_1.$bT)();
        test('pixel ratio 1, dom height 600', () => {
            const LINE_COUNT = 50;
            const LINE_HEIGHT = 20;
            const manager = new overviewZoneManager_1.$hV((lineNumber) => LINE_HEIGHT * lineNumber);
            manager.setDOMWidth(30);
            manager.setDOMHeight(600);
            manager.setOuterHeight(LINE_COUNT * LINE_HEIGHT);
            manager.setLineHeight(LINE_HEIGHT);
            manager.setPixelRatio(1);
            manager.setZones([
                new overviewZoneManager_1.$gV(1, 1, 0, '1'),
                new overviewZoneManager_1.$gV(10, 10, 0, '2'),
                new overviewZoneManager_1.$gV(30, 31, 0, '3'),
                new overviewZoneManager_1.$gV(50, 50, 0, '4'),
            ]);
            // one line = 12, but cap is at 6
            assert.deepStrictEqual(manager.resolveColorZones(), [
                new overviewZoneManager_1.$fV(12, 24, 1),
                new overviewZoneManager_1.$fV(120, 132, 2),
                new overviewZoneManager_1.$fV(360, 384, 3),
                new overviewZoneManager_1.$fV(588, 600, 4), // 588 -> 600
            ]);
        });
        test('pixel ratio 1, dom height 300', () => {
            const LINE_COUNT = 50;
            const LINE_HEIGHT = 20;
            const manager = new overviewZoneManager_1.$hV((lineNumber) => LINE_HEIGHT * lineNumber);
            manager.setDOMWidth(30);
            manager.setDOMHeight(300);
            manager.setOuterHeight(LINE_COUNT * LINE_HEIGHT);
            manager.setLineHeight(LINE_HEIGHT);
            manager.setPixelRatio(1);
            manager.setZones([
                new overviewZoneManager_1.$gV(1, 1, 0, '1'),
                new overviewZoneManager_1.$gV(10, 10, 0, '2'),
                new overviewZoneManager_1.$gV(30, 31, 0, '3'),
                new overviewZoneManager_1.$gV(50, 50, 0, '4'),
            ]);
            // one line = 6, cap is at 6
            assert.deepStrictEqual(manager.resolveColorZones(), [
                new overviewZoneManager_1.$fV(6, 12, 1),
                new overviewZoneManager_1.$fV(60, 66, 2),
                new overviewZoneManager_1.$fV(180, 192, 3),
                new overviewZoneManager_1.$fV(294, 300, 4), // 294 -> 300
            ]);
        });
        test('pixel ratio 2, dom height 300', () => {
            const LINE_COUNT = 50;
            const LINE_HEIGHT = 20;
            const manager = new overviewZoneManager_1.$hV((lineNumber) => LINE_HEIGHT * lineNumber);
            manager.setDOMWidth(30);
            manager.setDOMHeight(300);
            manager.setOuterHeight(LINE_COUNT * LINE_HEIGHT);
            manager.setLineHeight(LINE_HEIGHT);
            manager.setPixelRatio(2);
            manager.setZones([
                new overviewZoneManager_1.$gV(1, 1, 0, '1'),
                new overviewZoneManager_1.$gV(10, 10, 0, '2'),
                new overviewZoneManager_1.$gV(30, 31, 0, '3'),
                new overviewZoneManager_1.$gV(50, 50, 0, '4'),
            ]);
            // one line = 6, cap is at 12
            assert.deepStrictEqual(manager.resolveColorZones(), [
                new overviewZoneManager_1.$fV(12, 24, 1),
                new overviewZoneManager_1.$fV(120, 132, 2),
                new overviewZoneManager_1.$fV(360, 384, 3),
                new overviewZoneManager_1.$fV(588, 600, 4), // 588 -> 600
            ]);
        });
    });
});
//# sourceMappingURL=overviewZoneManager.test.js.map