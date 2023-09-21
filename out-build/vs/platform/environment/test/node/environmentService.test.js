/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/platform/environment/common/environmentService", "vs/platform/environment/node/argv", "vs/platform/environment/node/environmentService", "vs/platform/product/common/product"], function (require, exports, assert, utils_1, environmentService_1, argv_1, environmentService_2, product_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('EnvironmentService', () => {
        test('parseExtensionHostPort when built', () => {
            const parse = (a) => (0, environmentService_1.$0l)((0, argv_1.$zl)(a, argv_1.$yl), true);
            assert.deepStrictEqual(parse([]), { port: null, break: false, env: undefined, debugId: undefined });
            assert.deepStrictEqual(parse(['--debugPluginHost']), { port: null, break: false, env: undefined, debugId: undefined });
            assert.deepStrictEqual(parse(['--debugPluginHost=1234']), { port: 1234, break: false, env: undefined, debugId: undefined });
            assert.deepStrictEqual(parse(['--debugBrkPluginHost']), { port: null, break: false, env: undefined, debugId: undefined });
            assert.deepStrictEqual(parse(['--debugBrkPluginHost=5678']), { port: 5678, break: true, env: undefined, debugId: undefined });
            assert.deepStrictEqual(parse(['--debugPluginHost=1234', '--debugBrkPluginHost=5678', '--debugId=7']), { port: 5678, break: true, env: undefined, debugId: '7' });
            assert.deepStrictEqual(parse(['--inspect-extensions']), { port: null, break: false, env: undefined, debugId: undefined });
            assert.deepStrictEqual(parse(['--inspect-extensions=1234']), { port: 1234, break: false, env: undefined, debugId: undefined });
            assert.deepStrictEqual(parse(['--inspect-brk-extensions']), { port: null, break: false, env: undefined, debugId: undefined });
            assert.deepStrictEqual(parse(['--inspect-brk-extensions=5678']), { port: 5678, break: true, env: undefined, debugId: undefined });
            assert.deepStrictEqual(parse(['--inspect-extensions=1234', '--inspect-brk-extensions=5678', '--debugId=7']), { port: 5678, break: true, env: undefined, debugId: '7' });
            assert.deepStrictEqual(parse(['--inspect-extensions=1234', '--inspect-brk-extensions=5678', '--extensionEnvironment={"COOL":"1"}']), { port: 5678, break: true, env: { COOL: '1' }, debugId: undefined });
        });
        test('parseExtensionHostPort when unbuilt', () => {
            const parse = (a) => (0, environmentService_1.$0l)((0, argv_1.$zl)(a, argv_1.$yl), false);
            assert.deepStrictEqual(parse([]), { port: 5870, break: false, env: undefined, debugId: undefined });
            assert.deepStrictEqual(parse(['--debugPluginHost']), { port: 5870, break: false, env: undefined, debugId: undefined });
            assert.deepStrictEqual(parse(['--debugPluginHost=1234']), { port: 1234, break: false, env: undefined, debugId: undefined });
            assert.deepStrictEqual(parse(['--debugBrkPluginHost']), { port: 5870, break: false, env: undefined, debugId: undefined });
            assert.deepStrictEqual(parse(['--debugBrkPluginHost=5678']), { port: 5678, break: true, env: undefined, debugId: undefined });
            assert.deepStrictEqual(parse(['--debugPluginHost=1234', '--debugBrkPluginHost=5678', '--debugId=7']), { port: 5678, break: true, env: undefined, debugId: '7' });
            assert.deepStrictEqual(parse(['--inspect-extensions']), { port: 5870, break: false, env: undefined, debugId: undefined });
            assert.deepStrictEqual(parse(['--inspect-extensions=1234']), { port: 1234, break: false, env: undefined, debugId: undefined });
            assert.deepStrictEqual(parse(['--inspect-brk-extensions']), { port: 5870, break: false, env: undefined, debugId: undefined });
            assert.deepStrictEqual(parse(['--inspect-brk-extensions=5678']), { port: 5678, break: true, env: undefined, debugId: undefined });
            assert.deepStrictEqual(parse(['--inspect-extensions=1234', '--inspect-brk-extensions=5678', '--debugId=7']), { port: 5678, break: true, env: undefined, debugId: '7' });
        });
        // https://github.com/microsoft/vscode/issues/78440
        test('careful with boolean file names', function () {
            let actual = (0, argv_1.$zl)(['-r', 'arg.txt'], argv_1.$yl);
            assert(actual['reuse-window']);
            assert.deepStrictEqual(actual._, ['arg.txt']);
            actual = (0, argv_1.$zl)(['-r', 'true.txt'], argv_1.$yl);
            assert(actual['reuse-window']);
            assert.deepStrictEqual(actual._, ['true.txt']);
        });
        test('userDataDir', () => {
            const service1 = new environmentService_2.$_l((0, argv_1.$zl)(process.argv, argv_1.$yl), { _serviceBrand: undefined, ...product_1.default });
            assert.ok(service1.userDataPath.length > 0);
            const args = (0, argv_1.$zl)(process.argv, argv_1.$yl);
            args['user-data-dir'] = '/userDataDir/folder';
            const service2 = new environmentService_2.$_l(args, { _serviceBrand: undefined, ...product_1.default });
            assert.notStrictEqual(service1.userDataPath, service2.userDataPath);
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=environmentService.test.js.map