/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/remote/common/remoteHosts"], function (require, exports, assert, remoteHosts_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('remoteHosts', () => {
        test('parseAuthority hostname', () => {
            assert.deepStrictEqual((0, remoteHosts_1.$Rk)('localhost:8080'), { host: 'localhost', port: 8080 });
        });
        test('parseAuthority ipv4', () => {
            assert.deepStrictEqual((0, remoteHosts_1.$Rk)('127.0.0.1:8080'), { host: '127.0.0.1', port: 8080 });
        });
        test('parseAuthority ipv6', () => {
            assert.deepStrictEqual((0, remoteHosts_1.$Rk)('[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:8080'), { host: '[2001:0db8:85a3:0000:0000:8a2e:0370:7334]', port: 8080 });
        });
        test('parseAuthorityWithOptionalPort hostname', () => {
            assert.deepStrictEqual((0, remoteHosts_1.$Sk)('localhost:8080', 123), { host: 'localhost', port: 8080 });
            assert.deepStrictEqual((0, remoteHosts_1.$Sk)('localhost', 123), { host: 'localhost', port: 123 });
        });
        test('parseAuthorityWithOptionalPort ipv4', () => {
            assert.deepStrictEqual((0, remoteHosts_1.$Sk)('127.0.0.1:8080', 123), { host: '127.0.0.1', port: 8080 });
            assert.deepStrictEqual((0, remoteHosts_1.$Sk)('127.0.0.1', 123), { host: '127.0.0.1', port: 123 });
        });
        test('parseAuthorityWithOptionalPort ipv6', () => {
            assert.deepStrictEqual((0, remoteHosts_1.$Sk)('[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:8080', 123), { host: '[2001:0db8:85a3:0000:0000:8a2e:0370:7334]', port: 8080 });
            assert.deepStrictEqual((0, remoteHosts_1.$Sk)('[2001:0db8:85a3:0000:0000:8a2e:0370:7334]', 123), { host: '[2001:0db8:85a3:0000:0000:8a2e:0370:7334]', port: 123 });
        });
        test('issue #151748: Error: Remote authorities containing \'+\' need to be resolved!', () => {
            assert.deepStrictEqual((0, remoteHosts_1.$Sk)('codespaces+aaaaa-aaaaa-aaaa-aaaaa-a111aa111', 123), { host: 'codespaces+aaaaa-aaaaa-aaaa-aaaaa-a111aa111', port: 123 });
        });
    });
});
//# sourceMappingURL=remoteHosts.test.js.map