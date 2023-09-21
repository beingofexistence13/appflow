/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/platform", "vs/base/test/common/utils", "vs/platform/terminal/common/terminalEnvironment"], function (require, exports, assert_1, platform_1, utils_1, terminalEnvironment_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('terminalEnvironment', () => {
        (0, utils_1.$bT)();
        suite('collapseTildePath', () => {
            test('should return empty string for a falsy path', () => {
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$QM)('', '/foo', '/'), '');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$QM)(undefined, '/foo', '/'), '');
            });
            test('should return path for a falsy user home', () => {
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$QM)('/foo', '', '/'), '/foo');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$QM)('/foo', undefined, '/'), '/foo');
            });
            test('should not collapse when user home isn\'t present', () => {
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$QM)('/foo', '/bar', '/'), '/foo');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$QM)('C:\\foo', 'C:\\bar', '\\'), 'C:\\foo');
            });
            test('should collapse with Windows separators', () => {
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$QM)('C:\\foo\\bar', 'C:\\foo', '\\'), '~\\bar');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$QM)('C:\\foo\\bar', 'C:\\foo\\', '\\'), '~\\bar');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$QM)('C:\\foo\\bar\\baz', 'C:\\foo\\', '\\'), '~\\bar\\baz');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$QM)('C:\\foo\\bar\\baz', 'C:\\foo', '\\'), '~\\bar\\baz');
            });
            test('should collapse mixed case with Windows separators', () => {
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$QM)('c:\\foo\\bar', 'C:\\foo', '\\'), '~\\bar');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$QM)('C:\\foo\\bar\\baz', 'c:\\foo', '\\'), '~\\bar\\baz');
            });
            test('should collapse with Posix separators', () => {
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$QM)('/foo/bar', '/foo', '/'), '~/bar');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$QM)('/foo/bar', '/foo/', '/'), '~/bar');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$QM)('/foo/bar/baz', '/foo', '/'), '~/bar/baz');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$QM)('/foo/bar/baz', '/foo/', '/'), '~/bar/baz');
            });
        });
        suite('sanitizeCwd', () => {
            if (platform_1.OS === 1 /* OperatingSystem.Windows */) {
                test('should make the Windows drive letter uppercase', () => {
                    (0, assert_1.strictEqual)((0, terminalEnvironment_1.$RM)('c:\\foo\\bar'), 'C:\\foo\\bar');
                });
            }
            test('should remove any wrapping quotes', () => {
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$RM)('\'/foo/bar\''), '/foo/bar');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$RM)('"/foo/bar"'), '/foo/bar');
            });
        });
    });
});
//# sourceMappingURL=terminalEnvironment.test.js.map