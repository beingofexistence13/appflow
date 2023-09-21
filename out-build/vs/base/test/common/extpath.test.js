/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/extpath", "vs/base/common/platform", "vs/base/test/common/utils"], function (require, exports, assert, extpath, platform_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Paths', () => {
        test('toForwardSlashes', () => {
            assert.strictEqual(extpath.$Cf('\\\\server\\share\\some\\path'), '//server/share/some/path');
            assert.strictEqual(extpath.$Cf('c:\\test'), 'c:/test');
            assert.strictEqual(extpath.$Cf('foo\\bar'), 'foo/bar');
            assert.strictEqual(extpath.$Cf('/user/far'), '/user/far');
        });
        test('getRoot', () => {
            assert.strictEqual(extpath.$Ef('/user/far'), '/');
            assert.strictEqual(extpath.$Ef('\\\\server\\share\\some\\path'), '//server/share/');
            assert.strictEqual(extpath.$Ef('//server/share/some/path'), '//server/share/');
            assert.strictEqual(extpath.$Ef('//server/share'), '/');
            assert.strictEqual(extpath.$Ef('//server'), '/');
            assert.strictEqual(extpath.$Ef('//server//'), '/');
            assert.strictEqual(extpath.$Ef('c:/user/far'), 'c:/');
            assert.strictEqual(extpath.$Ef('c:user/far'), 'c:');
            assert.strictEqual(extpath.$Ef('http://www'), '');
            assert.strictEqual(extpath.$Ef('http://www/'), 'http://www/');
            assert.strictEqual(extpath.$Ef('file:///foo'), 'file:///');
            assert.strictEqual(extpath.$Ef('file://foo'), '');
        });
        (!platform_1.$i ? test.skip : test)('isUNC', () => {
            assert.ok(!extpath.$Ff('foo'));
            assert.ok(!extpath.$Ff('/foo'));
            assert.ok(!extpath.$Ff('\\foo'));
            assert.ok(!extpath.$Ff('\\\\foo'));
            assert.ok(extpath.$Ff('\\\\a\\b'));
            assert.ok(!extpath.$Ff('//a/b'));
            assert.ok(extpath.$Ff('\\\\server\\share'));
            assert.ok(extpath.$Ff('\\\\server\\share\\'));
            assert.ok(extpath.$Ff('\\\\server\\share\\path'));
        });
        test('isValidBasename', () => {
            assert.ok(!extpath.$Gf(null));
            assert.ok(!extpath.$Gf(''));
            assert.ok(extpath.$Gf('test.txt'));
            assert.ok(!extpath.$Gf('/test.txt'));
            assert.ok(!extpath.$Gf('\\test.txt'));
            if (platform_1.$i) {
                assert.ok(!extpath.$Gf('aux'));
                assert.ok(!extpath.$Gf('Aux'));
                assert.ok(!extpath.$Gf('LPT0'));
                assert.ok(!extpath.$Gf('aux.txt'));
                assert.ok(!extpath.$Gf('com0.abc'));
                assert.ok(extpath.$Gf('LPT00'));
                assert.ok(extpath.$Gf('aux1'));
                assert.ok(extpath.$Gf('aux1.txt'));
                assert.ok(extpath.$Gf('aux1.aux.txt'));
                assert.ok(!extpath.$Gf('test.txt.'));
                assert.ok(!extpath.$Gf('test.txt..'));
                assert.ok(!extpath.$Gf('test.txt '));
                assert.ok(!extpath.$Gf('test.txt\t'));
                assert.ok(!extpath.$Gf('tes:t.txt'));
                assert.ok(!extpath.$Gf('tes"t.txt'));
            }
        });
        test('sanitizeFilePath', () => {
            if (platform_1.$i) {
                assert.strictEqual(extpath.$Kf('.', 'C:\\the\\cwd'), 'C:\\the\\cwd');
                assert.strictEqual(extpath.$Kf('', 'C:\\the\\cwd'), 'C:\\the\\cwd');
                assert.strictEqual(extpath.$Kf('C:', 'C:\\the\\cwd'), 'C:\\');
                assert.strictEqual(extpath.$Kf('C:\\', 'C:\\the\\cwd'), 'C:\\');
                assert.strictEqual(extpath.$Kf('C:\\\\', 'C:\\the\\cwd'), 'C:\\');
                assert.strictEqual(extpath.$Kf('C:\\folder\\my.txt', 'C:\\the\\cwd'), 'C:\\folder\\my.txt');
                assert.strictEqual(extpath.$Kf('C:\\folder\\my', 'C:\\the\\cwd'), 'C:\\folder\\my');
                assert.strictEqual(extpath.$Kf('C:\\folder\\..\\my', 'C:\\the\\cwd'), 'C:\\my');
                assert.strictEqual(extpath.$Kf('C:\\folder\\my\\', 'C:\\the\\cwd'), 'C:\\folder\\my');
                assert.strictEqual(extpath.$Kf('C:\\folder\\my\\\\\\', 'C:\\the\\cwd'), 'C:\\folder\\my');
                assert.strictEqual(extpath.$Kf('my.txt', 'C:\\the\\cwd'), 'C:\\the\\cwd\\my.txt');
                assert.strictEqual(extpath.$Kf('my.txt\\', 'C:\\the\\cwd'), 'C:\\the\\cwd\\my.txt');
                assert.strictEqual(extpath.$Kf('\\\\localhost\\folder\\my', 'C:\\the\\cwd'), '\\\\localhost\\folder\\my');
                assert.strictEqual(extpath.$Kf('\\\\localhost\\folder\\my\\', 'C:\\the\\cwd'), '\\\\localhost\\folder\\my');
            }
            else {
                assert.strictEqual(extpath.$Kf('.', '/the/cwd'), '/the/cwd');
                assert.strictEqual(extpath.$Kf('', '/the/cwd'), '/the/cwd');
                assert.strictEqual(extpath.$Kf('/', '/the/cwd'), '/');
                assert.strictEqual(extpath.$Kf('/folder/my.txt', '/the/cwd'), '/folder/my.txt');
                assert.strictEqual(extpath.$Kf('/folder/my', '/the/cwd'), '/folder/my');
                assert.strictEqual(extpath.$Kf('/folder/../my', '/the/cwd'), '/my');
                assert.strictEqual(extpath.$Kf('/folder/my/', '/the/cwd'), '/folder/my');
                assert.strictEqual(extpath.$Kf('/folder/my///', '/the/cwd'), '/folder/my');
                assert.strictEqual(extpath.$Kf('my.txt', '/the/cwd'), '/the/cwd/my.txt');
                assert.strictEqual(extpath.$Kf('my.txt/', '/the/cwd'), '/the/cwd/my.txt');
            }
        });
        test('isRootOrDriveLetter', () => {
            if (platform_1.$i) {
                assert.ok(extpath.$Lf('c:'));
                assert.ok(extpath.$Lf('D:'));
                assert.ok(extpath.$Lf('D:/'));
                assert.ok(extpath.$Lf('D:\\'));
                assert.ok(!extpath.$Lf('D:\\path'));
                assert.ok(!extpath.$Lf('D:/path'));
            }
            else {
                assert.ok(extpath.$Lf('/'));
                assert.ok(!extpath.$Lf('/path'));
            }
        });
        test('hasDriveLetter', () => {
            if (platform_1.$i) {
                assert.ok(extpath.$Mf('c:'));
                assert.ok(extpath.$Mf('D:'));
                assert.ok(extpath.$Mf('D:/'));
                assert.ok(extpath.$Mf('D:\\'));
                assert.ok(extpath.$Mf('D:\\path'));
                assert.ok(extpath.$Mf('D:/path'));
            }
            else {
                assert.ok(!extpath.$Mf('/'));
                assert.ok(!extpath.$Mf('/path'));
            }
        });
        test('getDriveLetter', () => {
            if (platform_1.$i) {
                assert.strictEqual(extpath.$Nf('c:'), 'c');
                assert.strictEqual(extpath.$Nf('D:'), 'D');
                assert.strictEqual(extpath.$Nf('D:/'), 'D');
                assert.strictEqual(extpath.$Nf('D:\\'), 'D');
                assert.strictEqual(extpath.$Nf('D:\\path'), 'D');
                assert.strictEqual(extpath.$Nf('D:/path'), 'D');
            }
            else {
                assert.ok(!extpath.$Nf('/'));
                assert.ok(!extpath.$Nf('/path'));
            }
        });
        test('isWindowsDriveLetter', () => {
            assert.ok(!extpath.$Jf(0));
            assert.ok(!extpath.$Jf(-1));
            assert.ok(extpath.$Jf(65 /* CharCode.A */));
            assert.ok(extpath.$Jf(122 /* CharCode.z */));
        });
        test('indexOfPath', () => {
            assert.strictEqual(extpath.$Of('/foo', '/bar', true), -1);
            assert.strictEqual(extpath.$Of('/foo', '/FOO', false), -1);
            assert.strictEqual(extpath.$Of('/foo', '/FOO', true), 0);
            assert.strictEqual(extpath.$Of('/some/long/path', '/some/long', false), 0);
            assert.strictEqual(extpath.$Of('/some/long/path', '/PATH', true), 10);
        });
        test('parseLineAndColumnAware', () => {
            let res = extpath.$Pf('/foo/bar');
            assert.strictEqual(res.path, '/foo/bar');
            assert.strictEqual(res.line, undefined);
            assert.strictEqual(res.column, undefined);
            res = extpath.$Pf('/foo/bar:33');
            assert.strictEqual(res.path, '/foo/bar');
            assert.strictEqual(res.line, 33);
            assert.strictEqual(res.column, 1);
            res = extpath.$Pf('/foo/bar:33:34');
            assert.strictEqual(res.path, '/foo/bar');
            assert.strictEqual(res.line, 33);
            assert.strictEqual(res.column, 34);
            res = extpath.$Pf('C:\\foo\\bar');
            assert.strictEqual(res.path, 'C:\\foo\\bar');
            assert.strictEqual(res.line, undefined);
            assert.strictEqual(res.column, undefined);
            res = extpath.$Pf('C:\\foo\\bar:33');
            assert.strictEqual(res.path, 'C:\\foo\\bar');
            assert.strictEqual(res.line, 33);
            assert.strictEqual(res.column, 1);
            res = extpath.$Pf('C:\\foo\\bar:33:34');
            assert.strictEqual(res.path, 'C:\\foo\\bar');
            assert.strictEqual(res.line, 33);
            assert.strictEqual(res.column, 34);
            res = extpath.$Pf('/foo/bar:abb');
            assert.strictEqual(res.path, '/foo/bar:abb');
            assert.strictEqual(res.line, undefined);
            assert.strictEqual(res.column, undefined);
        });
        test('randomPath', () => {
            let res = extpath.$Qf('/foo/bar');
            assert.ok(res);
            res = extpath.$Qf('/foo/bar', 'prefix-');
            assert.ok(res.indexOf('prefix-'));
            const r1 = extpath.$Qf('/foo/bar');
            const r2 = extpath.$Qf('/foo/bar');
            assert.notStrictEqual(r1, r2);
            const r3 = extpath.$Qf('', '', 3);
            assert.strictEqual(r3.length, 3);
            const r4 = extpath.$Qf();
            assert.ok(r4);
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=extpath.test.js.map