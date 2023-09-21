define(["require", "exports", "assert", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil"], function (require, exports, assert, extensionManagement_1, extensionManagementUtil_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Extension Identifier Pattern', () => {
        test('extension identifier pattern', () => {
            const regEx = new RegExp(extensionManagement_1.$Mn);
            assert.strictEqual(true, regEx.test('publisher.name'));
            assert.strictEqual(true, regEx.test('publiSher.name'));
            assert.strictEqual(true, regEx.test('publisher.Name'));
            assert.strictEqual(true, regEx.test('PUBLISHER.NAME'));
            assert.strictEqual(true, regEx.test('PUBLISHEr.NAMe'));
            assert.strictEqual(true, regEx.test('PUBLISHEr.N-AMe'));
            assert.strictEqual(true, regEx.test('PUB-LISHEr.NAMe'));
            assert.strictEqual(true, regEx.test('PUB-LISHEr.N-AMe'));
            assert.strictEqual(true, regEx.test('PUBLISH12Er90.N-A54Me123'));
            assert.strictEqual(true, regEx.test('111PUBLISH12Er90.N-1111A54Me123'));
            assert.strictEqual(false, regEx.test('publishername'));
            assert.strictEqual(false, regEx.test('-publisher.name'));
            assert.strictEqual(false, regEx.test('publisher.-name'));
            assert.strictEqual(false, regEx.test('-publisher.-name'));
            assert.strictEqual(false, regEx.test('publ_isher.name'));
            assert.strictEqual(false, regEx.test('publisher._name'));
        });
        test('extension key', () => {
            assert.strictEqual(new extensionManagementUtil_1.$qo({ id: 'pub.extension-name' }, '1.0.1').toString(), 'pub.extension-name-1.0.1');
            assert.strictEqual(new extensionManagementUtil_1.$qo({ id: 'pub.extension-name' }, '1.0.1', "undefined" /* TargetPlatform.UNDEFINED */).toString(), 'pub.extension-name-1.0.1');
            assert.strictEqual(new extensionManagementUtil_1.$qo({ id: 'pub.extension-name' }, '1.0.1', "win32-ia32" /* TargetPlatform.WIN32_IA32 */).toString(), `pub.extension-name-1.0.1-${"win32-ia32" /* TargetPlatform.WIN32_IA32 */}`);
        });
        test('extension key parsing', () => {
            assert.strictEqual(extensionManagementUtil_1.$qo.parse('pub.extension-name'), null);
            assert.strictEqual(extensionManagementUtil_1.$qo.parse('pub.extension-name@1.2.3'), null);
            assert.strictEqual(extensionManagementUtil_1.$qo.parse('pub.extension-name-1.0.1')?.toString(), 'pub.extension-name-1.0.1');
            assert.strictEqual(extensionManagementUtil_1.$qo.parse('pub.extension-name-1.0.1-win32-ia32')?.toString(), 'pub.extension-name-1.0.1-win32-ia32');
        });
    });
});
//# sourceMappingURL=extensionManagement.test.js.map