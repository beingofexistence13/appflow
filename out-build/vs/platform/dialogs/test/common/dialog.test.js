/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/platform", "vs/platform/dialogs/common/dialogs", "vs/platform/product/common/product"], function (require, exports, assert_1, platform_1, dialogs_1, product_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Dialog', () => {
        function assertOptions({ options, buttonIndeces }, buttons, defaultId, cancelId, indeces) {
            (0, assert_1.deepEqual)(options.buttons, buttons);
            (0, assert_1.deepEqual)(options.defaultId, defaultId);
            (0, assert_1.deepEqual)(options.cancelId, cancelId);
            (0, assert_1.deepEqual)(buttonIndeces, indeces);
        }
        test('massageMessageBoxOptions', () => {
            const testProductService = {
                _serviceBrand: undefined,
                ...product_1.default,
                nameLong: 'Test'
            };
            // All platforms
            const allPlatformsMassagedOptions = (0, dialogs_1.$sA)({ buttons: ['1'], message: 'message' }, testProductService);
            (0, assert_1.deepEqual)(allPlatformsMassagedOptions.options.title, 'Test');
            (0, assert_1.deepEqual)(allPlatformsMassagedOptions.options.message, 'message');
            (0, assert_1.deepEqual)(allPlatformsMassagedOptions.options.noLink, true);
            // Specific cases
            const oneButtonNoCancel = (0, dialogs_1.$sA)({ buttons: ['1'], cancelId: undefined, message: 'message' }, testProductService);
            const oneButtonCancel_0 = (0, dialogs_1.$sA)({ buttons: ['1'], cancelId: 0, message: 'message' }, testProductService);
            const oneButtonCancel_1 = (0, dialogs_1.$sA)({ buttons: ['1'], cancelId: 1, message: 'message' }, testProductService);
            const oneButtonNegativeCancel = (0, dialogs_1.$sA)({ buttons: ['1'], cancelId: -1, message: 'message' }, testProductService);
            const twoButtonNoCancel = (0, dialogs_1.$sA)({ buttons: ['1', '2'], cancelId: undefined, message: 'message' }, testProductService);
            const twoButtonCancel_0 = (0, dialogs_1.$sA)({ buttons: ['1', '2'], cancelId: 0, message: 'message' }, testProductService);
            const twoButtonCancel_1 = (0, dialogs_1.$sA)({ buttons: ['1', '2'], cancelId: 1, message: 'message' }, testProductService);
            const twoButtonCancel_2 = (0, dialogs_1.$sA)({ buttons: ['1', '2'], cancelId: 2, message: 'message' }, testProductService);
            const twoButtonNegativeCancel = (0, dialogs_1.$sA)({ buttons: ['1', '2'], cancelId: -1, message: 'message' }, testProductService);
            const threeButtonNoCancel = (0, dialogs_1.$sA)({ buttons: ['1', '2', '3'], cancelId: undefined, message: 'message' }, testProductService);
            const threeButtonCancel_0 = (0, dialogs_1.$sA)({ buttons: ['1', '2', '3'], cancelId: 0, message: 'message' }, testProductService);
            const threeButtonCancel_1 = (0, dialogs_1.$sA)({ buttons: ['1', '2', '3'], cancelId: 1, message: 'message' }, testProductService);
            const threeButtonCancel_2 = (0, dialogs_1.$sA)({ buttons: ['1', '2', '3'], cancelId: 2, message: 'message' }, testProductService);
            const threeButtonCancel_3 = (0, dialogs_1.$sA)({ buttons: ['1', '2', '3'], cancelId: 3, message: 'message' }, testProductService);
            const threeButtonNegativeCancel = (0, dialogs_1.$sA)({ buttons: ['1', '2', '3'], cancelId: -1, message: 'message' }, testProductService);
            const fourButtonNoCancel = (0, dialogs_1.$sA)({ buttons: ['1', '2', '3', '4'], cancelId: undefined, message: 'message' }, testProductService);
            const fourButtonCancel_0 = (0, dialogs_1.$sA)({ buttons: ['1', '2', '3', '4'], cancelId: 0, message: 'message' }, testProductService);
            const fourButtonCancel_1 = (0, dialogs_1.$sA)({ buttons: ['1', '2', '3', '4'], cancelId: 1, message: 'message' }, testProductService);
            const fourButtonCancel_2 = (0, dialogs_1.$sA)({ buttons: ['1', '2', '3', '4'], cancelId: 2, message: 'message' }, testProductService);
            const fourButtonCancel_3 = (0, dialogs_1.$sA)({ buttons: ['1', '2', '3', '4'], cancelId: 3, message: 'message' }, testProductService);
            const fourButtonCancel_4 = (0, dialogs_1.$sA)({ buttons: ['1', '2', '3', '4'], cancelId: 4, message: 'message' }, testProductService);
            const fourButtonNegativeCancel = (0, dialogs_1.$sA)({ buttons: ['1', '2', '3', '4'], cancelId: -1, message: 'message' }, testProductService);
            if (platform_1.$i) {
                assertOptions(oneButtonNoCancel, ['1'], 0, 0, [0]);
                assertOptions(oneButtonCancel_0, ['1'], 0, 0, [0]);
                assertOptions(oneButtonCancel_1, ['1'], 0, 1, [0]);
                assertOptions(oneButtonNegativeCancel, ['1'], 0, -1, [0]);
                assertOptions(twoButtonNoCancel, ['1', '2'], 0, 1, [0, 1]);
                assertOptions(twoButtonCancel_0, ['2', '1'], 0, 1, [1, 0]);
                assertOptions(twoButtonCancel_1, ['1', '2'], 0, 1, [0, 1]);
                assertOptions(twoButtonCancel_2, ['1', '2'], 0, 2, [0, 1]);
                assertOptions(twoButtonNegativeCancel, ['1', '2'], 0, -1, [0, 1]);
                assertOptions(threeButtonNoCancel, ['1', '2', '3'], 0, 2, [0, 1, 2]);
                assertOptions(threeButtonCancel_0, ['2', '3', '1'], 0, 2, [1, 2, 0]);
                assertOptions(threeButtonCancel_1, ['1', '3', '2'], 0, 2, [0, 2, 1]);
                assertOptions(threeButtonCancel_2, ['1', '2', '3'], 0, 2, [0, 1, 2]);
                assertOptions(threeButtonCancel_3, ['1', '2', '3'], 0, 3, [0, 1, 2]);
                assertOptions(threeButtonNegativeCancel, ['1', '2', '3'], 0, -1, [0, 1, 2]);
                assertOptions(fourButtonNoCancel, ['1', '2', '3', '4'], 0, 3, [0, 1, 2, 3]);
                assertOptions(fourButtonCancel_0, ['2', '3', '4', '1'], 0, 3, [1, 2, 3, 0]);
                assertOptions(fourButtonCancel_1, ['1', '3', '4', '2'], 0, 3, [0, 2, 3, 1]);
                assertOptions(fourButtonCancel_2, ['1', '2', '4', '3'], 0, 3, [0, 1, 3, 2]);
                assertOptions(fourButtonCancel_3, ['1', '2', '3', '4'], 0, 3, [0, 1, 2, 3]);
                assertOptions(fourButtonCancel_4, ['1', '2', '3', '4'], 0, 4, [0, 1, 2, 3]);
                assertOptions(fourButtonNegativeCancel, ['1', '2', '3', '4'], 0, -1, [0, 1, 2, 3]);
            }
            else if (platform_1.$j) {
                assertOptions(oneButtonNoCancel, ['1'], 0, 0, [0]);
                assertOptions(oneButtonCancel_0, ['1'], 0, 0, [0]);
                assertOptions(oneButtonCancel_1, ['1'], 0, 1, [0]);
                assertOptions(oneButtonNegativeCancel, ['1'], 0, -1, [0]);
                assertOptions(twoButtonNoCancel, ['1', '2'], 0, 1, [0, 1]);
                assertOptions(twoButtonCancel_0, ['2', '1'], 0, 1, [1, 0]);
                assertOptions(twoButtonCancel_1, ['1', '2'], 0, 1, [0, 1]);
                assertOptions(twoButtonCancel_2, ['1', '2'], 0, 2, [0, 1]);
                assertOptions(twoButtonNegativeCancel, ['1', '2'], 0, -1, [0, 1]);
                assertOptions(threeButtonNoCancel, ['1', '3', '2'], 0, 1, [0, 2, 1]);
                assertOptions(threeButtonCancel_0, ['2', '1', '3'], 0, 1, [1, 0, 2]);
                assertOptions(threeButtonCancel_1, ['1', '2', '3'], 0, 1, [0, 1, 2]);
                assertOptions(threeButtonCancel_2, ['1', '3', '2'], 0, 1, [0, 2, 1]);
                assertOptions(threeButtonCancel_3, ['1', '2', '3'], 0, 3, [0, 1, 2]);
                assertOptions(threeButtonNegativeCancel, ['1', '2', '3'], 0, -1, [0, 1, 2]);
                assertOptions(fourButtonNoCancel, ['1', '4', '2', '3'], 0, 1, [0, 3, 1, 2]);
                assertOptions(fourButtonCancel_0, ['2', '1', '3', '4'], 0, 1, [1, 0, 2, 3]);
                assertOptions(fourButtonCancel_1, ['1', '2', '3', '4'], 0, 1, [0, 1, 2, 3]);
                assertOptions(fourButtonCancel_2, ['1', '3', '2', '4'], 0, 1, [0, 2, 1, 3]);
                assertOptions(fourButtonCancel_3, ['1', '4', '2', '3'], 0, 1, [0, 3, 1, 2]);
                assertOptions(fourButtonCancel_4, ['1', '2', '3', '4'], 0, 4, [0, 1, 2, 3]);
                assertOptions(fourButtonNegativeCancel, ['1', '2', '3', '4'], 0, -1, [0, 1, 2, 3]);
            }
            else if (platform_1.$k) {
                assertOptions(oneButtonNoCancel, ['1'], 0, 0, [0]);
                assertOptions(oneButtonCancel_0, ['1'], 0, 0, [0]);
                assertOptions(oneButtonCancel_1, ['1'], 0, 1, [0]);
                assertOptions(oneButtonNegativeCancel, ['1'], 0, -1, [0]);
                assertOptions(twoButtonNoCancel, ['2', '1'], 1, 0, [1, 0]);
                assertOptions(twoButtonCancel_0, ['1', '2'], 1, 0, [0, 1]);
                assertOptions(twoButtonCancel_1, ['2', '1'], 1, 0, [1, 0]);
                assertOptions(twoButtonCancel_2, ['2', '1'], 1, 2, [1, 0]);
                assertOptions(twoButtonNegativeCancel, ['2', '1'], 1, -1, [1, 0]);
                assertOptions(threeButtonNoCancel, ['2', '3', '1'], 2, 1, [1, 2, 0]);
                assertOptions(threeButtonCancel_0, ['3', '1', '2'], 2, 1, [2, 0, 1]);
                assertOptions(threeButtonCancel_1, ['3', '2', '1'], 2, 1, [2, 1, 0]);
                assertOptions(threeButtonCancel_2, ['2', '3', '1'], 2, 1, [1, 2, 0]);
                assertOptions(threeButtonCancel_3, ['3', '2', '1'], 2, 3, [2, 1, 0]);
                assertOptions(threeButtonNegativeCancel, ['3', '2', '1'], 2, -1, [2, 1, 0]);
                assertOptions(fourButtonNoCancel, ['3', '2', '4', '1'], 3, 2, [2, 1, 3, 0]);
                assertOptions(fourButtonCancel_0, ['4', '3', '1', '2'], 3, 2, [3, 2, 0, 1]);
                assertOptions(fourButtonCancel_1, ['4', '3', '2', '1'], 3, 2, [3, 2, 1, 0]);
                assertOptions(fourButtonCancel_2, ['4', '2', '3', '1'], 3, 2, [3, 1, 2, 0]);
                assertOptions(fourButtonCancel_3, ['3', '2', '4', '1'], 3, 2, [2, 1, 3, 0]);
                assertOptions(fourButtonCancel_4, ['4', '3', '2', '1'], 3, 4, [3, 2, 1, 0]);
                assertOptions(fourButtonNegativeCancel, ['4', '3', '2', '1'], 3, -1, [3, 2, 1, 0]);
            }
        });
    });
});
//# sourceMappingURL=dialog.test.js.map