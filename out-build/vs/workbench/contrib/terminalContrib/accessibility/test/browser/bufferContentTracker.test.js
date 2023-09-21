/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/amdX", "vs/base/common/platform", "vs/base/test/common/utils", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextMenuService", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/log/common/log", "vs/platform/terminal/common/capabilities/terminalCapabilityStore", "vs/platform/terminal/common/terminal", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService", "vs/workbench/contrib/terminal/browser/terminalConfigHelper", "vs/workbench/contrib/terminal/browser/terminalTestHelpers", "vs/workbench/contrib/terminal/browser/xterm/xtermTerminal", "vs/workbench/contrib/terminalContrib/accessibility/browser/bufferContentTracker", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert, amdX_1, platform_1, utils_1, configuration_1, testConfigurationService_1, contextkey_1, contextMenuService_1, contextView_1, instantiationServiceMock_1, mockKeybindingService_1, log_1, terminalCapabilityStore_1, terminal_1, themeService_1, testThemeService_1, terminalConfigHelper_1, terminalTestHelpers_1, xtermTerminal_1, bufferContentTracker_1, lifecycle_1, workbenchTestServices_1, workbenchTestServices_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const defaultTerminalConfig = {
        fontFamily: 'monospace',
        fontWeight: 'normal',
        fontWeightBold: 'normal',
        gpuAcceleration: 'off',
        scrollback: 1000,
        fastScrollSensitivity: 2,
        mouseWheelScrollSensitivity: 1,
        unicodeVersion: '6'
    };
    suite('Buffer Content Tracker', () => {
        const store = (0, utils_1.$bT)();
        let instantiationService;
        let configurationService;
        let themeService;
        let xterm;
        let capabilities;
        let configHelper;
        let bufferTracker;
        const prompt = 'vscode-git:(prompt/more-tests)';
        const promptPlusData = 'vscode-git:(prompt/more-tests) ' + 'some data';
        setup(async () => {
            configurationService = new testConfigurationService_1.$G0b({ terminal: { integrated: defaultTerminalConfig } });
            instantiationService = store.add(new instantiationServiceMock_1.$L0b());
            themeService = new testThemeService_1.$K0b();
            instantiationService.stub(configuration_1.$8h, configurationService);
            instantiationService.stub(themeService_1.$gv, themeService);
            instantiationService.stub(terminal_1.$Zq, new log_1.$fj());
            instantiationService.stub(log_1.$6i, store.add(new workbenchTestServices_2.$4dc()));
            instantiationService.stub(contextView_1.$WZ, store.add(instantiationService.createInstance(contextMenuService_1.$B4b)));
            instantiationService.stub(lifecycle_1.$7y, store.add(new workbenchTestServices_1.$Kec()));
            instantiationService.stub(contextkey_1.$3i, store.add(new mockKeybindingService_1.$S0b()));
            configHelper = store.add(instantiationService.createInstance(terminalConfigHelper_1.$dib));
            capabilities = store.add(new terminalCapabilityStore_1.$eib());
            if (!platform_1.$i) {
                capabilities.add(1 /* TerminalCapability.NaiveCwdDetection */, null);
            }
            const TerminalCtor = (await (0, amdX_1.$aD)('xterm', 'lib/xterm.js')).Terminal;
            xterm = store.add(instantiationService.createInstance(xtermTerminal_1.$Kib, TerminalCtor, configHelper, 80, 30, { getBackgroundColor: () => undefined }, capabilities, '', new mockKeybindingService_1.$S0b().createKey('', true), true));
            const container = document.createElement('div');
            xterm.raw.open(container);
            configurationService = new testConfigurationService_1.$G0b({ terminal: { integrated: { tabs: { separator: ' - ', title: '${cwd}', description: '${cwd}' } } } });
            bufferTracker = store.add(instantiationService.createInstance(bufferContentTracker_1.$tWb, xterm));
        });
        test('should not clear the prompt line', async () => {
            assert.strictEqual(bufferTracker.lines.length, 0);
            await (0, terminalTestHelpers_1.$Wfc)(xterm.raw, prompt);
            xterm.clearBuffer();
            bufferTracker.update();
            assert.deepStrictEqual(bufferTracker.lines, [prompt]);
        });
        test('repeated updates should not change the content', async () => {
            assert.strictEqual(bufferTracker.lines.length, 0);
            await (0, terminalTestHelpers_1.$Wfc)(xterm.raw, prompt);
            bufferTracker.update();
            assert.deepStrictEqual(bufferTracker.lines, [prompt]);
            bufferTracker.update();
            assert.deepStrictEqual(bufferTracker.lines, [prompt]);
            bufferTracker.update();
            assert.deepStrictEqual(bufferTracker.lines, [prompt]);
        });
        test('should add lines in the viewport and scrollback', async () => {
            await writeAndAssertBufferState(promptPlusData, 38, xterm.raw, bufferTracker);
        });
        test('should add lines in the viewport and full scrollback', async () => {
            await writeAndAssertBufferState(promptPlusData, 1030, xterm.raw, bufferTracker);
        });
        test('should refresh viewport', async () => {
            await writeAndAssertBufferState(promptPlusData, 6, xterm.raw, bufferTracker);
            await (0, terminalTestHelpers_1.$Wfc)(xterm.raw, '\x1b[3Ainserteddata');
            bufferTracker.update();
            assert.deepStrictEqual(bufferTracker.lines, [promptPlusData, promptPlusData, `${promptPlusData}inserteddata`, promptPlusData, promptPlusData, promptPlusData]);
        });
        test('should refresh viewport with full scrollback', async () => {
            const content = `${prompt}\r\n`.repeat(1030).trimEnd();
            await (0, terminalTestHelpers_1.$Wfc)(xterm.raw, content);
            bufferTracker.update();
            await (0, terminalTestHelpers_1.$Wfc)(xterm.raw, '\x1b[4Ainsertion');
            bufferTracker.update();
            const expected = content.split('\r\n');
            expected[1025] = `${prompt}insertion`;
            assert.deepStrictEqual(bufferTracker.lines[1025], `${prompt}insertion`);
        });
        test('should cap the size of the cached lines, removing old lines in favor of new lines', async () => {
            const content = `${prompt}\r\n`.repeat(1036).trimEnd();
            await (0, terminalTestHelpers_1.$Wfc)(xterm.raw, content);
            bufferTracker.update();
            const expected = content.split('\r\n');
            // delete the 6 lines that should be trimmed
            for (let i = 0; i < 6; i++) {
                expected.pop();
            }
            // insert a new character
            await (0, terminalTestHelpers_1.$Wfc)(xterm.raw, '\x1b[2Ainsertion');
            bufferTracker.update();
            expected[1027] = `${prompt}insertion`;
            assert.strictEqual(bufferTracker.lines.length, expected.length);
            assert.deepStrictEqual(bufferTracker.lines, expected);
        });
    });
    async function writeAndAssertBufferState(data, rows, terminal, bufferTracker) {
        const content = `${data}\r\n`.repeat(rows).trimEnd();
        await (0, terminalTestHelpers_1.$Wfc)(terminal, content);
        bufferTracker.update();
        assert.strictEqual(bufferTracker.lines.length, rows);
        assert.deepStrictEqual(bufferTracker.lines, content.split('\r\n'));
    }
});
//# sourceMappingURL=bufferContentTracker.test.js.map