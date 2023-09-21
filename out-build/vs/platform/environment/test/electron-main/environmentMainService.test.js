/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/product/common/product", "vs/base/common/platform", "vs/base/test/common/utils"], function (require, exports, assert, environmentMainService_1, product_1, platform_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('EnvironmentMainService', () => {
        test('can unset and restore snap env variables', () => {
            const service = new environmentMainService_1.$o5b({ '_': [] }, { '_serviceBrand': undefined, ...product_1.default });
            process.env['TEST_ARG1_VSCODE_SNAP_ORIG'] = 'original';
            process.env['TEST_ARG1'] = 'modified';
            process.env['TEST_ARG2_SNAP'] = 'test_arg2';
            process.env['TEST_ARG3_VSCODE_SNAP_ORIG'] = '';
            process.env['TEST_ARG3'] = 'test_arg3_non_empty';
            // Unset snap env variables
            service.unsetSnapExportedVariables();
            if (platform_1.$k) {
                assert.strictEqual(process.env['TEST_ARG1'], 'original');
                assert.strictEqual(process.env['TEST_ARG2'], undefined);
                assert.strictEqual(process.env['TEST_ARG1_VSCODE_SNAP_ORIG'], 'original');
                assert.strictEqual(process.env['TEST_ARG2_SNAP'], 'test_arg2');
                assert.strictEqual(process.env['TEST_ARG3_VSCODE_SNAP_ORIG'], '');
                assert.strictEqual(process.env['TEST_ARG3'], undefined);
            }
            else {
                assert.strictEqual(process.env['TEST_ARG1'], 'modified');
                assert.strictEqual(process.env['TEST_ARG2'], undefined);
                assert.strictEqual(process.env['TEST_ARG1_VSCODE_SNAP_ORIG'], 'original');
                assert.strictEqual(process.env['TEST_ARG2_SNAP'], 'test_arg2');
                assert.strictEqual(process.env['TEST_ARG3_VSCODE_SNAP_ORIG'], '');
                assert.strictEqual(process.env['TEST_ARG3'], 'test_arg3_non_empty');
            }
            // Restore snap env variables
            service.restoreSnapExportedVariables();
            if (platform_1.$k) {
                assert.strictEqual(process.env['TEST_ARG1'], 'modified');
                assert.strictEqual(process.env['TEST_ARG1_VSCODE_SNAP_ORIG'], 'original');
                assert.strictEqual(process.env['TEST_ARG2_SNAP'], 'test_arg2');
                assert.strictEqual(process.env['TEST_ARG2'], undefined);
                assert.strictEqual(process.env['TEST_ARG3_VSCODE_SNAP_ORIG'], '');
                assert.strictEqual(process.env['TEST_ARG3'], 'test_arg3_non_empty');
            }
            else {
                assert.strictEqual(process.env['TEST_ARG1'], 'modified');
                assert.strictEqual(process.env['TEST_ARG1_VSCODE_SNAP_ORIG'], 'original');
                assert.strictEqual(process.env['TEST_ARG2_SNAP'], 'test_arg2');
                assert.strictEqual(process.env['TEST_ARG2'], undefined);
                assert.strictEqual(process.env['TEST_ARG3_VSCODE_SNAP_ORIG'], '');
                assert.strictEqual(process.env['TEST_ARG3'], 'test_arg3_non_empty');
            }
        });
        test('can invoke unsetSnapExportedVariables and restoreSnapExportedVariables multiple times', () => {
            const service = new environmentMainService_1.$o5b({ '_': [] }, { '_serviceBrand': undefined, ...product_1.default });
            // Mock snap environment
            process.env['SNAP'] = '1';
            process.env['SNAP_REVISION'] = 'test_revision';
            process.env['TEST_ARG1_VSCODE_SNAP_ORIG'] = 'original';
            process.env['TEST_ARG1'] = 'modified';
            process.env['TEST_ARG2_SNAP'] = 'test_arg2';
            process.env['TEST_ARG3_VSCODE_SNAP_ORIG'] = '';
            process.env['TEST_ARG3'] = 'test_arg3_non_empty';
            // Unset snap env variables
            service.unsetSnapExportedVariables();
            service.unsetSnapExportedVariables();
            service.unsetSnapExportedVariables();
            if (platform_1.$k) {
                assert.strictEqual(process.env['TEST_ARG1'], 'original');
                assert.strictEqual(process.env['TEST_ARG2'], undefined);
                assert.strictEqual(process.env['TEST_ARG1_VSCODE_SNAP_ORIG'], 'original');
                assert.strictEqual(process.env['TEST_ARG2_SNAP'], 'test_arg2');
                assert.strictEqual(process.env['TEST_ARG3_VSCODE_SNAP_ORIG'], '');
                assert.strictEqual(process.env['TEST_ARG3'], undefined);
            }
            else {
                assert.strictEqual(process.env['TEST_ARG1'], 'modified');
                assert.strictEqual(process.env['TEST_ARG2'], undefined);
                assert.strictEqual(process.env['TEST_ARG1_VSCODE_SNAP_ORIG'], 'original');
                assert.strictEqual(process.env['TEST_ARG2_SNAP'], 'test_arg2');
                assert.strictEqual(process.env['TEST_ARG3_VSCODE_SNAP_ORIG'], '');
                assert.strictEqual(process.env['TEST_ARG3'], 'test_arg3_non_empty');
            }
            // Restore snap env variables
            service.restoreSnapExportedVariables();
            service.restoreSnapExportedVariables();
            if (platform_1.$k) {
                assert.strictEqual(process.env['TEST_ARG1'], 'modified');
                assert.strictEqual(process.env['TEST_ARG1_VSCODE_SNAP_ORIG'], 'original');
                assert.strictEqual(process.env['TEST_ARG2_SNAP'], 'test_arg2');
                assert.strictEqual(process.env['TEST_ARG2'], undefined);
                assert.strictEqual(process.env['TEST_ARG3_VSCODE_SNAP_ORIG'], '');
                assert.strictEqual(process.env['TEST_ARG3'], 'test_arg3_non_empty');
            }
            else {
                assert.strictEqual(process.env['TEST_ARG1'], 'modified');
                assert.strictEqual(process.env['TEST_ARG1_VSCODE_SNAP_ORIG'], 'original');
                assert.strictEqual(process.env['TEST_ARG2_SNAP'], 'test_arg2');
                assert.strictEqual(process.env['TEST_ARG2'], undefined);
                assert.strictEqual(process.env['TEST_ARG3_VSCODE_SNAP_ORIG'], '');
                assert.strictEqual(process.env['TEST_ARG3'], 'test_arg3_non_empty');
            }
            // Unset snap env variables
            service.unsetSnapExportedVariables();
            if (platform_1.$k) {
                assert.strictEqual(process.env['TEST_ARG1'], 'original');
                assert.strictEqual(process.env['TEST_ARG2'], undefined);
                assert.strictEqual(process.env['TEST_ARG1_VSCODE_SNAP_ORIG'], 'original');
                assert.strictEqual(process.env['TEST_ARG2_SNAP'], 'test_arg2');
                assert.strictEqual(process.env['TEST_ARG3_VSCODE_SNAP_ORIG'], '');
                assert.strictEqual(process.env['TEST_ARG3'], undefined);
            }
            else {
                assert.strictEqual(process.env['TEST_ARG1'], 'modified');
                assert.strictEqual(process.env['TEST_ARG2'], undefined);
                assert.strictEqual(process.env['TEST_ARG1_VSCODE_SNAP_ORIG'], 'original');
                assert.strictEqual(process.env['TEST_ARG2_SNAP'], 'test_arg2');
                assert.strictEqual(process.env['TEST_ARG3_VSCODE_SNAP_ORIG'], '');
                assert.strictEqual(process.env['TEST_ARG3'], 'test_arg3_non_empty');
            }
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=environmentMainService.test.js.map