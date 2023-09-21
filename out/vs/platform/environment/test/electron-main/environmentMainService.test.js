/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/product/common/product", "vs/base/common/platform", "vs/base/test/common/utils"], function (require, exports, assert, environmentMainService_1, product_1, platform_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('EnvironmentMainService', () => {
        test('can unset and restore snap env variables', () => {
            const service = new environmentMainService_1.EnvironmentMainService({ '_': [] }, { '_serviceBrand': undefined, ...product_1.default });
            process.env['TEST_ARG1_VSCODE_SNAP_ORIG'] = 'original';
            process.env['TEST_ARG1'] = 'modified';
            process.env['TEST_ARG2_SNAP'] = 'test_arg2';
            process.env['TEST_ARG3_VSCODE_SNAP_ORIG'] = '';
            process.env['TEST_ARG3'] = 'test_arg3_non_empty';
            // Unset snap env variables
            service.unsetSnapExportedVariables();
            if (platform_1.isLinux) {
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
            if (platform_1.isLinux) {
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
            const service = new environmentMainService_1.EnvironmentMainService({ '_': [] }, { '_serviceBrand': undefined, ...product_1.default });
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
            if (platform_1.isLinux) {
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
            if (platform_1.isLinux) {
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
            if (platform_1.isLinux) {
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
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52aXJvbm1lbnRNYWluU2VydmljZS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZW52aXJvbm1lbnQvdGVzdC9lbGVjdHJvbi1tYWluL2Vudmlyb25tZW50TWFpblNlcnZpY2UudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVFoRyxLQUFLLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxFQUFFO1FBRXBDLElBQUksQ0FBQywwQ0FBMEMsRUFBRSxHQUFHLEVBQUU7WUFDckQsTUFBTSxPQUFPLEdBQUcsSUFBSSwrQ0FBc0IsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLGVBQWUsRUFBRSxTQUFTLEVBQUUsR0FBRyxpQkFBTyxFQUFFLENBQUMsQ0FBQztZQUVwRyxPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLEdBQUcsVUFBVSxDQUFDO1lBQ3ZELE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsVUFBVSxDQUFDO1lBQ3RDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxXQUFXLENBQUM7WUFDNUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUMvQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxHQUFHLHFCQUFxQixDQUFDO1lBRWpELDJCQUEyQjtZQUMzQixPQUFPLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztZQUNyQyxJQUFJLGtCQUFPLEVBQUU7Z0JBQ1osTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO2dCQUN6RCxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEVBQUUsU0FBUyxDQUFD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