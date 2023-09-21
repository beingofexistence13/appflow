/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/platform", "vs/base/test/common/testUtils"], function (require, exports, assert, platform_1, testUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function testErrorMessage(module) {
        return `Unable to load "${module}" dependency. It was probably not compiled for the right operating system architecture or had missing build tools.`;
    }
    (0, testUtils_1.$hT)('Native Modules (all platforms)', () => {
        test('kerberos', async () => {
            const kerberos = await new Promise((resolve_1, reject_1) => { require(['kerberos'], resolve_1, reject_1); });
            assert.ok(typeof kerberos.initializeClient === 'function', testErrorMessage('kerberos'));
        });
        test('native-is-elevated', async () => {
            const isElevated = await new Promise((resolve_2, reject_2) => { require(['native-is-elevated'], resolve_2, reject_2); });
            assert.ok(typeof isElevated === 'function', testErrorMessage('native-is-elevated '));
            const result = isElevated();
            assert.ok(typeof result === 'boolean', testErrorMessage('native-is-elevated'));
        });
        test('native-keymap', async () => {
            const keyMap = await new Promise((resolve_3, reject_3) => { require(['native-keymap'], resolve_3, reject_3); });
            assert.ok(typeof keyMap.getCurrentKeyboardLayout === 'function', testErrorMessage('native-keymap'));
            const result = keyMap.getCurrentKeyboardLayout();
            assert.ok(result, testErrorMessage('native-keymap'));
        });
        test('native-watchdog', async () => {
            const watchDog = await new Promise((resolve_4, reject_4) => { require(['native-watchdog'], resolve_4, reject_4); });
            assert.ok(typeof watchDog.start === 'function', testErrorMessage('native-watchdog'));
        });
        (process.type === 'renderer' ? test.skip /* TODO@electron module is not context aware yet and thus cannot load in Electron renderer used by tests */ : test)('node-pty', async () => {
            const nodePty = await new Promise((resolve_5, reject_5) => { require(['node-pty'], resolve_5, reject_5); });
            assert.ok(typeof nodePty.spawn === 'function', testErrorMessage('node-pty'));
        });
        (process.type === 'renderer' ? test.skip /* TODO@electron module is not context aware yet and thus cannot load in Electron renderer used by tests */ : test)('@vscode/spdlog', async () => {
            const spdlog = await new Promise((resolve_6, reject_6) => { require(['@vscode/spdlog'], resolve_6, reject_6); });
            assert.ok(typeof spdlog.createRotatingLogger === 'function', testErrorMessage('@vscode/spdlog'));
            assert.ok(typeof spdlog.version === 'number', testErrorMessage('@vscode/spdlog'));
        });
        test('@parcel/watcher', async () => {
            const parcelWatcher = await new Promise((resolve_7, reject_7) => { require(['@parcel/watcher'], resolve_7, reject_7); });
            assert.ok(typeof parcelWatcher.subscribe === 'function', testErrorMessage('@parcel/watcher'));
        });
        test('@vscode/sqlite3', async () => {
            const sqlite3 = await new Promise((resolve_8, reject_8) => { require(['@vscode/sqlite3'], resolve_8, reject_8); });
            assert.ok(typeof sqlite3.Database === 'function', testErrorMessage('@vscode/sqlite3'));
        });
        test('vsda', async () => {
            try {
                const vsda = globalThis._VSCODE_NODE_MODULES['vsda'];
                const signer = new vsda.signer();
                const signed = await signer.sign('value');
                assert.ok(typeof signed === 'string', testErrorMessage('vsda'));
            }
            catch (error) {
                if (error.code !== 'MODULE_NOT_FOUND') {
                    throw error;
                }
            }
        });
    });
    (!platform_1.$i ? suite.skip : suite)('Native Modules (Windows)', () => {
        (process.type === 'renderer' ? test.skip /* TODO@electron module is not context aware yet and thus cannot load in Electron renderer used by tests */ : test)('@vscode/windows-mutex', async () => {
            const mutex = await new Promise((resolve_9, reject_9) => { require(['@vscode/windows-mutex'], resolve_9, reject_9); });
            assert.ok(mutex && typeof mutex.isActive === 'function', testErrorMessage('@vscode/windows-mutex'));
            assert.ok(typeof mutex.isActive === 'function', testErrorMessage('@vscode/windows-mutex'));
        });
        test('windows-foreground-love', async () => {
            const foregroundLove = await new Promise((resolve_10, reject_10) => { require(['windows-foreground-love'], resolve_10, reject_10); });
            assert.ok(typeof foregroundLove.allowSetForegroundWindow === 'function', testErrorMessage('windows-foreground-love'));
            const result = foregroundLove.allowSetForegroundWindow(process.pid);
            assert.ok(typeof result === 'boolean', testErrorMessage('windows-foreground-love'));
        });
        test('@vscode/windows-process-tree', async () => {
            const processTree = await new Promise((resolve_11, reject_11) => { require(['@vscode/windows-process-tree'], resolve_11, reject_11); });
            assert.ok(typeof processTree.getProcessTree === 'function', testErrorMessage('@vscode/windows-process-tree'));
            return new Promise((resolve, reject) => {
                processTree.getProcessTree(process.pid, tree => {
                    if (tree) {
                        resolve();
                    }
                    else {
                        reject(new Error(testErrorMessage('@vscode/windows-process-tree')));
                    }
                });
            });
        });
        test('@vscode/windows-registry', async () => {
            const windowsRegistry = await new Promise((resolve_12, reject_12) => { require(['@vscode/windows-registry'], resolve_12, reject_12); });
            assert.ok(typeof windowsRegistry.GetStringRegKey === 'function', testErrorMessage('@vscode/windows-registry'));
            const result = windowsRegistry.GetStringRegKey('HKEY_LOCAL_MACHINE', 'SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion', 'EditionID');
            assert.ok(typeof result === 'string' || typeof result === 'undefined', testErrorMessage('@vscode/windows-registry'));
        });
        test('@vscode/windows-ca-certs', async () => {
            // @ts-ignore we do not directly depend on this module anymore
            // but indirectly from our dependency to `@vscode/proxy-agent`
            // we still want to ensure this module can work properly.
            const windowsCerts = await new Promise((resolve_13, reject_13) => { require(['@vscode/windows-ca-certs'], resolve_13, reject_13); });
            const store = new windowsCerts.Crypt32();
            assert.ok(windowsCerts, testErrorMessage('@vscode/windows-ca-certs'));
            let certCount = 0;
            try {
                while (store.next()) {
                    certCount++;
                }
            }
            finally {
                store.done();
            }
            assert(certCount > 0);
        });
    });
});
//# sourceMappingURL=nativeModules.integrationTest.js.map