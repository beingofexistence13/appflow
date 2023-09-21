/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/remote/common/remoteHosts"], function (require, exports, assert, remoteHosts_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('remoteHosts', () => {
        test('parseAuthority hostname', () => {
            assert.deepStrictEqual((0, remoteHosts_1.parseAuthorityWithPort)('localhost:8080'), { host: 'localhost', port: 8080 });
        });
        test('parseAuthority ipv4', () => {
            assert.deepStrictEqual((0, remoteHosts_1.parseAuthorityWithPort)('127.0.0.1:8080'), { host: '127.0.0.1', port: 8080 });
        });
        test('parseAuthority ipv6', () => {
            assert.deepStrictEqual((0, remoteHosts_1.parseAuthorityWithPort)('[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:8080'), { host: '[2001:0db8:85a3:0000:0000:8a2e:0370:7334]', port: 8080 });
        });
        test('parseAuthorityWithOptionalPort hostname', () => {
            assert.deepStrictEqual((0, remoteHosts_1.parseAuthorityWithOptionalPort)('localhost:8080', 123), { host: 'localhost', port: 8080 });
            assert.deepStrictEqual((0, remoteHosts_1.parseAuthorityWithOptionalPort)('localhost', 123), { host: 'localhost', port: 123 });
        });
        test('parseAuthorityWithOptionalPort ipv4', () => {
            assert.deepStrictEqual((0, remoteHosts_1.parseAuthorityWithOptionalPort)('127.0.0.1:8080', 123), { host: '127.0.0.1', port: 8080 });
            assert.deepStrictEqual((0, remoteHosts_1.parseAuthorityWithOptionalPort)('127.0.0.1', 123), { host: '127.0.0.1', port: 123 });
        });
        test('parseAuthorityWithOptionalPort ipv6', () => {
            assert.deepStrictEqual((0, remoteHosts_1.parseAuthorityWithOptionalPort)('[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:8080', 123), { host: '[2001:0db8:85a3:0000:0000:8a2e:0370:7334]', port: 8080 });
            assert.deepStrictEqual((0, remoteHosts_1.parseAuthorityWithOptionalPort)('[2001:0db8:85a3:0000:0000:8a2e:0370:7334]', 123), { host: '[2001:0db8:85a3:0000:0000:8a2e:0370:7334]', port: 123 });
        });
        test('issue #151748: Error: Remote authorities containing \'+\' need to be resolved!', () => {
            assert.deepStrictEqual((0, remoteHosts_1.parseAuthorityWithOptionalPort)('codespaces+aaaaa-aaaaa-aaaa-aaaaa-a111aa111', 123), { host: 'codespaces+aaaaa-aaaaa-aaaa-aaaaa-a111aa111', port: 123 });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlSG9zdHMudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3JlbW90ZS90ZXN0L2NvbW1vbi9yZW1vdGVIb3N0cy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBS2hHLEtBQUssQ0FBQyxhQUFhLEVBQUUsR0FBRyxFQUFFO1FBRXpCLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUU7WUFDcEMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFBLG9DQUFzQixFQUFDLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3JHLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHFCQUFxQixFQUFFLEdBQUcsRUFBRTtZQUNoQyxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUEsb0NBQXNCLEVBQUMsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDckcsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMscUJBQXFCLEVBQUUsR0FBRyxFQUFFO1lBQ2hDLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBQSxvQ0FBc0IsRUFBQyxnREFBZ0QsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLDJDQUEyQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3JLLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHlDQUF5QyxFQUFFLEdBQUcsRUFBRTtZQUNwRCxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUEsNENBQThCLEVBQUMsZ0JBQWdCLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ2pILE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBQSw0Q0FBOEIsRUFBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQzVHLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHFDQUFxQyxFQUFFLEdBQUcsRUFBRTtZQUNoRCxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUEsNENBQThCLEVBQUMsZ0JBQWdCLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ2pILE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBQSw0Q0FBOEIsRUFBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQzVHLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHFDQUFxQyxFQUFFLEdBQUcsRUFBRTtZQUNoRCxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUEsNENBQThCLEVBQUMsZ0RBQWdELEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsMkNBQTJDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFDakwsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFBLDRDQUE4QixFQUFDLDJDQUEyQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLDJDQUEyQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQzVLLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGdGQUFnRixFQUFFLEdBQUcsRUFBRTtZQUMzRixNQUFNLENBQUMsZUFBZSxDQUFDLElBQUEsNENBQThCLEVBQUMsNkNBQTZDLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsNkNBQTZDLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDaEwsQ0FBQyxDQUFDLENBQUM7SUFFSixDQUFDLENBQUMsQ0FBQyJ9