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
        const store = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
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
            configurationService = new testConfigurationService_1.TestConfigurationService({ terminal: { integrated: defaultTerminalConfig } });
            instantiationService = store.add(new instantiationServiceMock_1.TestInstantiationService());
            themeService = new testThemeService_1.TestThemeService();
            instantiationService.stub(configuration_1.IConfigurationService, configurationService);
            instantiationService.stub(themeService_1.IThemeService, themeService);
            instantiationService.stub(terminal_1.ITerminalLogService, new log_1.NullLogService());
            instantiationService.stub(log_1.ILoggerService, store.add(new workbenchTestServices_2.TestLoggerService()));
            instantiationService.stub(contextView_1.IContextMenuService, store.add(instantiationService.createInstance(contextMenuService_1.ContextMenuService)));
            instantiationService.stub(lifecycle_1.ILifecycleService, store.add(new workbenchTestServices_1.TestLifecycleService()));
            instantiationService.stub(contextkey_1.IContextKeyService, store.add(new mockKeybindingService_1.MockContextKeyService()));
            configHelper = store.add(instantiationService.createInstance(terminalConfigHelper_1.TerminalConfigHelper));
            capabilities = store.add(new terminalCapabilityStore_1.TerminalCapabilityStore());
            if (!platform_1.isWindows) {
                capabilities.add(1 /* TerminalCapability.NaiveCwdDetection */, null);
            }
            const TerminalCtor = (await (0, amdX_1.importAMDNodeModule)('xterm', 'lib/xterm.js')).Terminal;
            xterm = store.add(instantiationService.createInstance(xtermTerminal_1.XtermTerminal, TerminalCtor, configHelper, 80, 30, { getBackgroundColor: () => undefined }, capabilities, '', new mockKeybindingService_1.MockContextKeyService().createKey('', true), true));
            const container = document.createElement('div');
            xterm.raw.open(container);
            configurationService = new testConfigurationService_1.TestConfigurationService({ terminal: { integrated: { tabs: { separator: ' - ', title: '${cwd}', description: '${cwd}' } } } });
            bufferTracker = store.add(instantiationService.createInstance(bufferContentTracker_1.BufferContentTracker, xterm));
        });
        test('should not clear the prompt line', async () => {
            assert.strictEqual(bufferTracker.lines.length, 0);
            await (0, terminalTestHelpers_1.writeP)(xterm.raw, prompt);
            xterm.clearBuffer();
            bufferTracker.update();
            assert.deepStrictEqual(bufferTracker.lines, [prompt]);
        });
        test('repeated updates should not change the content', async () => {
            assert.strictEqual(bufferTracker.lines.length, 0);
            await (0, terminalTestHelpers_1.writeP)(xterm.raw, prompt);
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
            await (0, terminalTestHelpers_1.writeP)(xterm.raw, '\x1b[3Ainserteddata');
            bufferTracker.update();
            assert.deepStrictEqual(bufferTracker.lines, [promptPlusData, promptPlusData, `${promptPlusData}inserteddata`, promptPlusData, promptPlusData, promptPlusData]);
        });
        test('should refresh viewport with full scrollback', async () => {
            const content = `${prompt}\r\n`.repeat(1030).trimEnd();
            await (0, terminalTestHelpers_1.writeP)(xterm.raw, content);
            bufferTracker.update();
            await (0, terminalTestHelpers_1.writeP)(xterm.raw, '\x1b[4Ainsertion');
            bufferTracker.update();
            const expected = content.split('\r\n');
            expected[1025] = `${prompt}insertion`;
            assert.deepStrictEqual(bufferTracker.lines[1025], `${prompt}insertion`);
        });
        test('should cap the size of the cached lines, removing old lines in favor of new lines', async () => {
            const content = `${prompt}\r\n`.repeat(1036).trimEnd();
            await (0, terminalTestHelpers_1.writeP)(xterm.raw, content);
            bufferTracker.update();
            const expected = content.split('\r\n');
            // delete the 6 lines that should be trimmed
            for (let i = 0; i < 6; i++) {
                expected.pop();
            }
            // insert a new character
            await (0, terminalTestHelpers_1.writeP)(xterm.raw, '\x1b[2Ainsertion');
            bufferTracker.update();
            expected[1027] = `${prompt}insertion`;
            assert.strictEqual(bufferTracker.lines.length, expected.length);
            assert.deepStrictEqual(bufferTracker.lines, expected);
        });
    });
    async function writeAndAssertBufferState(data, rows, terminal, bufferTracker) {
        const content = `${data}\r\n`.repeat(rows).trimEnd();
        await (0, terminalTestHelpers_1.writeP)(terminal, content);
        bufferTracker.update();
        assert.strictEqual(bufferTracker.lines.length, rows);
        assert.deepStrictEqual(bufferTracker.lines, content.split('\r\n'));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVmZmVyQ29udGVudFRyYWNrZXIudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsQ29udHJpYi9hY2Nlc3NpYmlsaXR5L3Rlc3QvYnJvd3Nlci9idWZmZXJDb250ZW50VHJhY2tlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBNkJoRyxNQUFNLHFCQUFxQixHQUFvQztRQUM5RCxVQUFVLEVBQUUsV0FBVztRQUN2QixVQUFVLEVBQUUsUUFBUTtRQUNwQixjQUFjLEVBQUUsUUFBUTtRQUN4QixlQUFlLEVBQUUsS0FBSztRQUN0QixVQUFVLEVBQUUsSUFBSTtRQUNoQixxQkFBcUIsRUFBRSxDQUFDO1FBQ3hCLDJCQUEyQixFQUFFLENBQUM7UUFDOUIsY0FBYyxFQUFFLEdBQUc7S0FDbkIsQ0FBQztJQUVGLEtBQUssQ0FBQyx3QkFBd0IsRUFBRSxHQUFHLEVBQUU7UUFDcEMsTUFBTSxLQUFLLEdBQUcsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRXhELElBQUksb0JBQThDLENBQUM7UUFDbkQsSUFBSSxvQkFBOEMsQ0FBQztRQUNuRCxJQUFJLFlBQThCLENBQUM7UUFDbkMsSUFBSSxLQUFvQixDQUFDO1FBQ3pCLElBQUksWUFBcUMsQ0FBQztRQUMxQyxJQUFJLFlBQWtDLENBQUM7UUFDdkMsSUFBSSxhQUFtQyxDQUFDO1FBQ3hDLE1BQU0sTUFBTSxHQUFHLGdDQUFnQyxDQUFDO1FBQ2hELE1BQU0sY0FBYyxHQUFHLGlDQUFpQyxHQUFHLFdBQVcsQ0FBQztRQUV2RSxLQUFLLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDaEIsb0JBQW9CLEdBQUcsSUFBSSxtREFBd0IsQ0FBQyxFQUFFLFFBQVEsRUFBRSxFQUFFLFVBQVUsRUFBRSxxQkFBcUIsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN6RyxvQkFBb0Is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