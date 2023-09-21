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
    (0, testUtils_1.flakySuite)('Native Modules (all platforms)', () => {
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
    (!platform_1.isWindows ? suite.skip : suite)('Native Modules (Windows)', () => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF0aXZlTW9kdWxlcy5pbnRlZ3JhdGlvblRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9lbnZpcm9ubWVudC90ZXN0L25vZGUvbmF0aXZlTW9kdWxlcy5pbnRlZ3JhdGlvblRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFNaEcsU0FBUyxnQkFBZ0IsQ0FBQyxNQUFjO1FBQ3ZDLE9BQU8sbUJBQW1CLE1BQU0sb0hBQW9ILENBQUM7SUFDdEosQ0FBQztJQUVELElBQUEsc0JBQVUsRUFBQyxnQ0FBZ0MsRUFBRSxHQUFHLEVBQUU7UUFFakQsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLElBQUksRUFBRTtZQUMzQixNQUFNLFFBQVEsR0FBRyxzREFBYSxVQUFVLDJCQUFDLENBQUM7WUFDMUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLFFBQVEsQ0FBQyxnQkFBZ0IsS0FBSyxVQUFVLEVBQUUsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUMxRixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxvQkFBb0IsRUFBRSxLQUFLLElBQUksRUFBRTtZQUNyQyxNQUFNLFVBQVUsR0FBRyxzREFBYSxvQkFBb0IsMkJBQUMsQ0FBQztZQUN0RCxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sVUFBVSxLQUFLLFVBQVUsRUFBRSxnQkFBZ0IsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7WUFFckYsTUFBTSxNQUFNLEdBQUcsVUFBVSxFQUFFLENBQUM7WUFDNUIsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLE1BQU0sS0FBSyxTQUFTLEVBQUUsZ0JBQWdCLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO1FBQ2hGLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGVBQWUsRUFBRSxLQUFLLElBQUksRUFBRTtZQUNoQyxN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