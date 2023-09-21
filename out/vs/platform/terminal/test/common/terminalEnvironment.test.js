/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/platform", "vs/base/test/common/utils", "vs/platform/terminal/common/terminalEnvironment"], function (require, exports, assert_1, platform_1, utils_1, terminalEnvironment_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('terminalEnvironment', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        suite('collapseTildePath', () => {
            test('should return empty string for a falsy path', () => {
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.collapseTildePath)('', '/foo', '/'), '');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.collapseTildePath)(undefined, '/foo', '/'), '');
            });
            test('should return path for a falsy user home', () => {
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.collapseTildePath)('/foo', '', '/'), '/foo');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.collapseTildePath)('/foo', undefined, '/'), '/foo');
            });
            test('should not collapse when user home isn\'t present', () => {
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.collapseTildePath)('/foo', '/bar', '/'), '/foo');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.collapseTildePath)('C:\\foo', 'C:\\bar', '\\'), 'C:\\foo');
            });
            test('should collapse with Windows separators', () => {
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.collapseTildePath)('C:\\foo\\bar', 'C:\\foo', '\\'), '~\\bar');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.collapseTildePath)('C:\\foo\\bar', 'C:\\foo\\', '\\'), '~\\bar');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.collapseTildePath)('C:\\foo\\bar\\baz', 'C:\\foo\\', '\\'), '~\\bar\\baz');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.collapseTildePath)('C:\\foo\\bar\\baz', 'C:\\foo', '\\'), '~\\bar\\baz');
            });
            test('should collapse mixed case with Windows separators', () => {
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.collapseTildePath)('c:\\foo\\bar', 'C:\\foo', '\\'), '~\\bar');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.collapseTildePath)('C:\\foo\\bar\\baz', 'c:\\foo', '\\'), '~\\bar\\baz');
            });
            test('should collapse with Posix separators', () => {
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.collapseTildePath)('/foo/bar', '/foo', '/'), '~/bar');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.collapseTildePath)('/foo/bar', '/foo/', '/'), '~/bar');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.collapseTildePath)('/foo/bar/baz', '/foo', '/'), '~/bar/baz');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.collapseTildePath)('/foo/bar/baz', '/foo/', '/'), '~/bar/baz');
            });
        });
        suite('sanitizeCwd', () => {
            if (platform_1.OS === 1 /* OperatingSystem.Windows */) {
                test('should make the Windows drive letter uppercase', () => {
                    (0, assert_1.strictEqual)((0, terminalEnvironment_1.sanitizeCwd)('c:\\foo\\bar'), 'C:\\foo\\bar');
                });
            }
            test('should remove any wrapping quotes', () => {
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.sanitizeCwd)('\'/foo/bar\''), '/foo/bar');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.sanitizeCwd)('"/foo/bar"'), '/foo/bar');
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxFbnZpcm9ubWVudC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdGVybWluYWwvdGVzdC9jb21tb24vdGVybWluYWxFbnZpcm9ubWVudC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBT2hHLEtBQUssQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLEVBQUU7UUFDakMsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLEVBQUU7WUFDL0IsSUFBSSxDQUFDLDZDQUE2QyxFQUFFLEdBQUcsRUFBRTtnQkFDeEQsSUFBQSxvQkFBVyxFQUFDLElBQUEsdUNBQWlCLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDcEQsSUFBQSxvQkFBVyxFQUFDLElBQUEsdUNBQWlCLEVBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUM1RCxDQUFDLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQywwQ0FBMEMsRUFBRSxHQUFHLEVBQUU7Z0JBQ3JELElBQUEsb0JBQVcsRUFBQyxJQUFBLHVDQUFpQixFQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ3hELElBQUEsb0JBQVcsRUFBQyxJQUFBLHVDQUFpQixFQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FBRyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDaEUsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsbURBQW1ELEVBQUUsR0FBRyxFQUFFO2dCQUM5RCxJQUFBLG9CQUFXLEVBQUMsSUFBQSx1Q0FBaUIsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxF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