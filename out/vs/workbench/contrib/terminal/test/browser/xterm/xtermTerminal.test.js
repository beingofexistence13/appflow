/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/terminal/browser/xterm/xtermTerminal", "vs/workbench/contrib/terminal/browser/terminalConfigHelper", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/workbench/contrib/terminal/common/terminal", "assert", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/theme/test/common/testThemeService", "vs/platform/theme/common/themeService", "vs/workbench/common/views", "vs/base/common/event", "vs/workbench/contrib/terminal/common/terminalColorRegistry", "vs/workbench/common/theme", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/workbench/test/common/workbenchTestServices", "vs/base/browser/browser", "vs/platform/terminal/common/capabilities/terminalCapabilityStore", "vs/platform/contextview/browser/contextView", "vs/platform/contextview/browser/contextMenuService", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/services/lifecycle/common/lifecycle", "vs/amdX", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/base/common/color", "vs/platform/contextkey/common/contextkey", "vs/platform/terminal/common/terminal", "vs/base/test/common/utils"], function (require, exports, xtermTerminal_1, terminalConfigHelper_1, instantiationServiceMock_1, terminal_1, assert_1, configuration_1, testConfigurationService_1, testThemeService_1, themeService_1, views_1, event_1, terminalColorRegistry_1, theme_1, log_1, storage_1, workbenchTestServices_1, browser_1, terminalCapabilityStore_1, contextView_1, contextMenuService_1, workbenchTestServices_2, lifecycle_1, amdX_1, mockKeybindingService_1, color_1, contextkey_1, terminal_2, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestViewDescriptorService = void 0;
    class TestWebglAddon {
        constructor() {
            this.onChangeTextureAtlas = new event_1.Emitter().event;
            this.onAddTextureAtlasCanvas = new event_1.Emitter().event;
            this.onContextLoss = new event_1.Emitter().event;
        }
        static { this.shouldThrow = false; }
        static { this.isEnabled = false; }
        activate() {
            TestWebglAddon.isEnabled = !TestWebglAddon.shouldThrow;
            if (TestWebglAddon.shouldThrow) {
                throw new Error('Test webgl set to throw');
            }
        }
        dispose() {
            TestWebglAddon.isEnabled = false;
        }
        clearTextureAtlas() { }
    }
    class TestXtermTerminal extends xtermTerminal_1.XtermTerminal {
        constructor() {
            super(...arguments);
            this.webglAddonPromise = Promise.resolve(TestWebglAddon);
        }
        // Force synchronous to avoid async when activating the addon
        _getWebglAddonConstructor() {
            return this.webglAddonPromise;
        }
    }
    class TestViewDescriptorService {
        constructor() {
            this._location = 1 /* ViewContainerLocation.Panel */;
            this._onDidChangeLocation = new event_1.Emitter();
            this.onDidChangeLocation = this._onDidChangeLocation.event;
        }
        getViewLocationById(id) {
            return this._location;
        }
        moveTerminalToLocation(to) {
            const oldLocation = this._location;
            this._location = to;
            this._onDidChangeLocation.fire({
                views: [
                    { id: terminal_1.TERMINAL_VIEW_ID }
                ],
                from: oldLocation,
                to
            });
        }
    }
    exports.TestViewDescriptorService = TestViewDescriptorService;
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
    suite('XtermTerminal', () => {
        const store = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        let instantiationService;
        let configurationService;
        let themeService;
        let viewDescriptorService;
        let xterm;
        let configHelper;
        let XTermBaseCtor;
        setup(async () => {
            configurationService = new testConfigurationService_1.TestConfigurationService({
                editor: {
                    fastScrollSensitivity: 2,
                    mouseWheelScrollSensitivity: 1
                },
                terminal: {
                    integrated: defaultTerminalConfig
                }
            });
            themeService = new testThemeService_1.TestThemeService();
            viewDescriptorService = new TestViewDescriptorService();
            instantiationService = store.add(new instantiationServiceMock_1.TestInstantiationService());
            instantiationService.stub(configuration_1.IConfigurationService, configurationService);
            instantiationService.stub(terminal_2.ITerminalLogService, new log_1.NullLogService());
            instantiationService.stub(storage_1.IStorageService, store.add(new workbenchTestServices_1.TestStorageService()));
            instantiationService.stub(themeService_1.IThemeService, themeService);
            instantiationService.stub(views_1.IViewDescriptorService, viewDescriptorService);
            instantiationService.stub(contextView_1.IContextMenuService, store.add(instantiationService.createInstance(contextMenuService_1.ContextMenuService)));
            instantiationService.stub(lifecycle_1.ILifecycleService, store.add(new workbenchTestServices_2.TestLifecycleService()));
            instantiationService.stub(contextkey_1.IContextKeyService, new mockKeybindingService_1.MockContextKeyService());
            configHelper = store.add(instantiationService.createInstance(terminalConfigHelper_1.TerminalConfigHelper));
            XTermBaseCtor = (await (0, amdX_1.importAMDNodeModule)('xterm', 'lib/xterm.js')).Terminal;
            const capabilityStore = store.add(new terminalCapabilityStore_1.TerminalCapabilityStore());
            xterm = store.add(instantiationService.createInstance(TestXtermTerminal, XTermBaseCtor, configHelper, 80, 30, { getBackgroundColor: () => undefined }, capabilityStore, '', new mockKeybindingService_1.MockContextKeyService().createKey('', true), true));
            TestWebglAddon.shouldThrow = false;
            TestWebglAddon.isEnabled = false;
        });
        test('should use fallback dimensions of 80x30', () => {
            (0, assert_1.strictEqual)(xterm.raw.cols, 80);
            (0, assert_1.strictEqual)(xterm.raw.rows, 30);
        });
        suite('theme', () => {
            test('should apply correct background color based on getBackgroundColor', () => {
                themeService.setTheme(new testThemeService_1.TestColorTheme({
                    [theme_1.PANEL_BACKGROUND]: '#ff0000',
                    [theme_1.SIDE_BAR_BACKGROUND]: '#00ff00'
                }));
                xterm = store.add(instantiationService.createInstance(xtermTerminal_1.XtermTerminal, XTermBaseCtor, configHelper, 80, 30, { getBackgroundColor: () => new color_1.Color(new color_1.RGBA(255, 0, 0)) }, store.add(new terminalCapabilityStore_1.TerminalCapabilityStore()), '', new mockKeybindingService_1.MockContextKeyService().createKey('', true), true));
                (0, assert_1.strictEqual)(xterm.raw.options.theme?.background, '#ff0000');
            });
            test('should react to and apply theme changes', () => {
                themeService.setTheme(new testThemeService_1.TestColorTheme({
                    [terminalColorRegistry_1.TERMINAL_BACKGROUND_COLOR]: '#000100',
                    [terminalColorRegistry_1.TERMINAL_FOREGROUND_COLOR]: '#000200',
                    [terminalColorRegistry_1.TERMINAL_CURSOR_FOREGROUND_COLOR]: '#000300',
                    [terminalColorRegistry_1.TERMINAL_CURSOR_BACKGROUND_COLOR]: '#000400',
                    [terminalColorRegistry_1.TERMINAL_SELECTION_BACKGROUND_COLOR]: '#000500',
                    [terminalColorRegistry_1.TERMINAL_INACTIVE_SELECTION_BACKGROUND_COLOR]: '#000600',
                    [terminalColorRegistry_1.TERMINAL_SELECTION_FOREGROUND_COLOR]: undefined,
                    'terminal.ansiBlack': '#010000',
                    'terminal.ansiRed': '#020000',
                    'terminal.ansiGreen': '#030000',
                    'terminal.ansiYellow': '#040000',
                    'terminal.ansiBlue': '#050000',
                    'terminal.ansiMagenta': '#060000',
                    'terminal.ansiCyan': '#070000',
                    'terminal.ansiWhite': '#080000',
                    'terminal.ansiBrightBlack': '#090000',
                    'terminal.ansiBrightRed': '#100000',
                    'terminal.ansiBrightGreen': '#110000',
                    'terminal.ansiBrightYellow': '#120000',
                    'terminal.ansiBrightBlue': '#130000',
                    'terminal.ansiBrightMagenta': '#140000',
                    'terminal.ansiBrightCyan': '#150000',
                    'terminal.ansiBrightWhite': '#160000',
                }));
                xterm = store.add(instantiationService.createInstance(xtermTerminal_1.XtermTerminal, XTermBaseCtor, configHelper, 80, 30, { getBackgroundColor: () => undefined }, store.add(new terminalCapabilityStore_1.TerminalCapabilityStore()), '', new mockKeybindingService_1.MockContextKeyService().createKey('', true), true));
                (0, assert_1.deepStrictEqual)(xterm.raw.options.theme, {
                    background: undefined,
                    foreground: '#000200',
                    cursor: '#000300',
                    cursorAccent: '#000400',
                    selectionBackground: '#000500',
                    selectionInactiveBackground: '#000600',
                    selectionForeground: undefined,
                    black: '#010000',
                    green: '#030000',
                    red: '#020000',
                    yellow: '#040000',
                    blue: '#050000',
                    magenta: '#060000',
                    cyan: '#070000',
                    white: '#080000',
                    brightBlack: '#090000',
                    brightRed: '#100000',
                    brightGreen: '#110000',
                    brightYellow: '#120000',
                    brightBlue: '#130000',
                    brightMagenta: '#140000',
                    brightCyan: '#150000',
                    brightWhite: '#160000',
                });
                themeService.setTheme(new testThemeService_1.TestColorTheme({
                    [terminalColorRegistry_1.TERMINAL_BACKGROUND_COLOR]: '#00010f',
                    [terminalColorRegistry_1.TERMINAL_FOREGROUND_COLOR]: '#00020f',
                    [terminalColorRegistry_1.TERMINAL_CURSOR_FOREGROUND_COLOR]: '#00030f',
                    [terminalColorRegistry_1.TERMINAL_CURSOR_BACKGROUND_COLOR]: '#00040f',
                    [terminalColorRegistry_1.TERMINAL_SELECTION_BACKGROUND_COLOR]: '#00050f',
                    [terminalColorRegistry_1.TERMINAL_INACTIVE_SELECTION_BACKGROUND_COLOR]: '#00060f',
                    [terminalColorRegistry_1.TERMINAL_SELECTION_FOREGROUND_COLOR]: '#00070f',
                    'terminal.ansiBlack': '#01000f',
                    'terminal.ansiRed': '#02000f',
                    'terminal.ansiGreen': '#03000f',
                    'terminal.ansiYellow': '#04000f',
                    'terminal.ansiBlue': '#05000f',
                    'terminal.ansiMagenta': '#06000f',
                    'terminal.ansiCyan': '#07000f',
                    'terminal.ansiWhite': '#08000f',
                    'terminal.ansiBrightBlack': '#09000f',
                    'terminal.ansiBrightRed': '#10000f',
                    'terminal.ansiBrightGreen': '#11000f',
                    'terminal.ansiBrightYellow': '#12000f',
                    'terminal.ansiBrightBlue': '#13000f',
                    'terminal.ansiBrightMagenta': '#14000f',
                    'terminal.ansiBrightCyan': '#15000f',
                    'terminal.ansiBrightWhite': '#16000f',
                }));
                (0, assert_1.deepStrictEqual)(xterm.raw.options.theme, {
                    background: undefined,
                    foreground: '#00020f',
                    cursor: '#00030f',
                    cursorAccent: '#00040f',
                    selectionBackground: '#00050f',
                    selectionInactiveBackground: '#00060f',
                    selectionForeground: '#00070f',
                    black: '#01000f',
                    green: '#03000f',
                    red: '#02000f',
                    yellow: '#04000f',
                    blue: '#05000f',
                    magenta: '#06000f',
                    cyan: '#07000f',
                    white: '#08000f',
                    brightBlack: '#09000f',
                    brightRed: '#10000f',
                    brightGreen: '#11000f',
                    brightYellow: '#12000f',
                    brightBlue: '#13000f',
                    brightMagenta: '#14000f',
                    brightCyan: '#15000f',
                    brightWhite: '#16000f',
                });
            });
        });
        suite('renderers', () => {
            // This is skipped until the webgl renderer bug is fixed in Chromium
            // https://bugs.chromium.org/p/chromium/issues/detail?id=1476475
            test.skip('should re-evaluate gpu acceleration auto when the setting is changed', async () => {
                // Check initial state
                (0, assert_1.strictEqual)(TestWebglAddon.isEnabled, false);
                // Open xterm as otherwise the webgl addon won't activate
                const container = document.createElement('div');
                xterm.attachToElement(container);
                // Auto should activate the webgl addon
                await configurationService.setUserConfiguration('terminal', { integrated: { ...defaultTerminalConfig, gpuAcceleration: 'auto' } });
                configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: () => true });
                await xterm.webglAddonPromise; // await addon activate
                if (browser_1.isSafari) {
                    (0, assert_1.strictEqual)(TestWebglAddon.isEnabled, false, 'The webgl renderer is always disabled on Safari');
                }
                else {
                    (0, assert_1.strictEqual)(TestWebglAddon.isEnabled, true);
                }
                // Turn off to reset state
                await configurationService.setUserConfiguration('terminal', { integrated: { ...defaultTerminalConfig, gpuAcceleration: 'off' } });
                configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: () => true });
                await xterm.webglAddonPromise; // await addon activate
                (0, assert_1.strictEqual)(TestWebglAddon.isEnabled, false);
                // Set to auto again but throw when activating the webgl addon
                TestWebglAddon.shouldThrow = true;
                await configurationService.setUserConfiguration('terminal', { integrated: { ...defaultTerminalConfig, gpuAcceleration: 'auto' } });
                configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: () => true });
                await xterm.webglAddonPromise; // await addon activate
                (0, assert_1.strictEqual)(TestWebglAddon.isEnabled, false);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieHRlcm1UZXJtaW5hbC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvdGVzdC9icm93c2VyL3h0ZXJtL3h0ZXJtVGVybWluYWwudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFrQ2hHLE1BQU0sY0FBYztRQUFwQjtZQUdVLHlCQUFvQixHQUFHLElBQUksZUFBTyxFQUFFLENBQUMsS0FBa0MsQ0FBQztZQUN4RSw0QkFBdUIsR0FBRyxJQUFJLGVBQU8sRUFBRSxDQUFDLEtBQWtDLENBQUM7WUFDM0Usa0JBQWEsR0FBRyxJQUFJLGVBQU8sRUFBRSxDQUFDLEtBQXFCLENBQUM7UUFXOUQsQ0FBQztpQkFmTyxnQkFBVyxHQUFHLEtBQUssQUFBUixDQUFTO2lCQUNwQixjQUFTLEdBQUcsS0FBSyxBQUFSLENBQVM7UUFJekIsUUFBUTtZQUNQLGNBQWMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDO1lBQ3ZELElBQUksY0FBYyxDQUFDLFdBQVcsRUFBRTtnQkFDL0IsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO2FBQzNDO1FBQ0YsQ0FBQztRQUNELE9BQU87WUFDTixjQUFjLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztRQUNsQyxDQUFDO1FBQ0QsaUJBQWlCLEtBQUssQ0FBQzs7SUFHeEIsTUFBTSxpQkFBa0IsU0FBUSw2QkFBYTtRQUE3Qzs7WUFDQyxzQkFBaUIsR0FBK0IsT0FBTyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUtqRixDQUFDO1FBSkEsNkRBQTZEO1FBQzFDLHlCQUF5QjtZQUMzQyxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztRQUMvQixDQUFDO0tBQ0Q7SUFFRCxNQUFhLHlCQUF5QjtRQUF0QztZQUNTLGNBQVMsdUNBQStCO1lBQ3hDLHlCQUFvQixHQUFHLElBQUksZUFBTyxFQUF3RixDQUFDO1lBQ25JLHdCQUFtQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUM7UUFldkQsQ0FBQztRQWRBLG1CQUFtQixDQUFDLEVBQVU7WUFDN0IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ3ZCLENBQUM7UUFDRCxzQkFBc0IsQ0FBQyxFQUF5QjtZQUMvQyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQ25DLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUM7Z0JBQzlCLEtBQUssRUFBRTtvQkFDTixFQUFFLEVBQUUsRUFBRSwyQkFBZ0IsRUFBUztpQkFDL0I7Z0JBQ0QsSUFBSSxFQUFFLFdBQVc7Z0JBQ2pCLEVBQUU7YUFDRixDQUFDLENBQUM7UUFDSixDQUFDO0tBQ0Q7SUFsQkQsOERBa0JDO0lBRUQsTUFBTSxxQkFBcUIsR0FBb0M7UUFDOUQsVUFBVSxFQUFFLFdBQVc7UUFDdkIsVUFBVSxFQUFFLFFBQVE7UUFDcEIsY0FBYyxFQUFFLFFBQVE7UUFDeEIsZUFBZSxFQUFFLEtBQUs7UUFDdEIsVUFBVSxFQUFFLElBQUk7UUFDaEIscUJBQXFCLEVBQUUsQ0FBQztRQUN4QiwyQkFBMkIsRUFBRSxDQUFDO1FBQzlCLGNBQWMsRUFBRSxHQUFHO0tBQ25CLENBQUM7SUFFRixLQUFLLENBQUMsZUFBZSxFQUFFLEdBQUcsRUFBRTtRQUMzQixNQUFNLEtBQUssR0FBRyxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFeEQsSUFBSSxvQkFBOEMsQ0FBQztRQUNuRCxJQUFJLG9CQUE4QyxDQUFDO1FBQ25ELElBQUksWUFBOEIsQ0FBQztRQUNuQyxJQUFJLHFCQUFnRCxDQUFDO1FBQ3JELElBQUksS0FBd0IsQ0FBQztRQUM3QixJQUFJLFlBQWtDLENBQUM7UUFDdkMsSUFBSSxhQUE4QixDQUFDO1FBRW5DLEtBQUssQ0FBQyxLQUFLLElBQUksRUFBRTtZQUNoQixvQkFBb0IsR0FBRyxJQUFJLG1EQUF3QixDQUFDO2dCQUNuRCxNQUFNLEVBQUU7b0JBQ1AscUJBQXFCLEVBQUUsQ0FBQztvQkFDeEIsMkJBQTJCLEVBQUUsQ0FBQztpQkFDSDtnQkFDNUIsUUFBUSxFQUFFO29CQUNULFVBQVUsRUFBRSxxQkFBcUI7aUJBQ2pDO2FBQ0QsQ0FBQyxDQUFDO1lBQ0gsWUFBWSxHQUFHLElBQUksbUNBQWdCLEVBQUUsQ0FBQztZQUN0QyxxQkFBcUIsR0FBRyxJQUFJLHlCQUF5QixFQUFFLENBQUM7WUFFeEQsb0JBQW9CLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLG1EQUF3QixFQUFFLENBQUMsQ0FBQztZQUNqRSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMscUNBQXFCLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUN2RSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsOEJBQW1CLEVBQUUsSUFBSSxvQkFBYyxFQUFFLENBQUMsQ0FBQztZQUNyRSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMseUJBQWUsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksMENBQWtCLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDaEYsb0JBQW9CLENBQUMsSUFBSSxDQUFDLDRCQUFhLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDdkQsb0JBQW9CLENBQUMsSUFBSSxDQUFDLDhCQUFzQixFQUFFLHFCQUFxQixDQUFDLENBQUM7WUFDekUsb0JBQW9CLENBQUMsSUFBSSxDQUFDLGlDQUFtQixFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLHVDQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25ILG9CQUFvQixDQUFDLElBQUksQ0FBQyw2QkFBaUIsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksNENBQW9CLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDcEYsb0JBQW9CLENBQUMsSUFBSSxDQUFDLCtCQUFrQixFQUFFLElBQUksNkNBQXFCLEVBQUUsQ0FBQyxDQUFDO1lBRTNFLFlBQVksR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQywyQ0FBb0IsQ0FBQyxDQUFDLENBQUM7WUFDcEYsYUFBYSxHQUFHLENBQUMsTUFBTSxJQUFBLDBCQUFtQixFQUF5QixPQUFPLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7WUFFdEcsTUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLGlEQUF1QixFQUFFLENBQUMsQ0FBQztZQUNqRSxLQUFLLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsaUJBQWlCLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsa0JBQWtCLEVBQUUsR0FBRyxFQUFFLENBQUMsU0FBUyxFQUFFLEVBQUUsZUFBZSxFQUFFLEVBQUUsRUFBRSxJQUFJLDZDQUFxQixFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRXJPLGNBQWMsQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1lBQ25DLGNBQWMsQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ2xDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHlDQUF5QyxFQUFFLEdBQUcsRUFBRTtZQUNwRCxJQUFBLG9CQUFXLEVBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDaEMsSUFBQSxvQkFBVyxFQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2pDLENBQUMsQ0FBQyxDQUFDO1FBRUgsS0FBSyxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7WUFDbkIsSUFBSSxDQUFDLG1FQUFtRSxFQUFFLEdBQUcsRUFBRTtnQkFDOUUsWUFBWSxDQUFDLFFBQVEsQ0FBQyxJQUFJLGlDQUFjLENBQUM7b0JBQ3hDLENBQUMsd0JBQWdCLENBQUMsRUFBRSxTQUFTO29CQUM3QixDQUFDLDJCQUFtQixDQUFDLEVBQUUsU0FBUztpQkFDaEMsQ0FBQyxDQUFDLENBQUM7Z0JBQ0osS0FBSyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLDZCQUFhLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsa0JBQWtCLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxhQUFLLENBQUMsSUFBSSxZQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLGlEQUF1QixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSw2Q0FBcUIsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDL1EsSUFBQSxvQkFBVyxFQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDN0QsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMseUNBQXlDLEVBQUUsR0FBRyxFQUFFO2dCQUNwRCxZQUFZLENBQUMsUUFBUSxDQUFDLElBQUksaUNBQWMsQ0FBQztvQkFDeEMsQ0FBQyxpREFBeUIsQ0FBQyxFQUFFLFNBQVM7b0JBQ3RDLENBQUMsaURBQXlCLENBQUMsRUFBRSxTQUFTO29CQUN0QyxDQUFDLHdEQUFnQyxDQUFDLEVBQUUsU0FBUztvQkFDN0MsQ0FBQyx3REFBZ0MsQ0FBQyxFQUFFLFNBQVM7b0JBQzdDLENBQUMsMkRBQW1DLENBQUMsRUFBRSxTQUFTO29CQUNoRCxDQUFDLG9FQUE0QyxDQUFDLEVBQUUsU0FBUztvQkFDekQsQ0FBQywyREFBbUMsQ0FBQyxFQUFFLFNBQVM7b0JBQ2hELG9CQUFvQixFQUFFLFNBQVM7b0JBQy9CLGtCQUFrQixFQUFFLFNBQVM7b0JBQzdCLG9CQUFvQixFQUFFLFNBQVM7b0JBQy9CLHFCQUFxQixFQUFFLFNBQVM7b0JBQ2hDLG1CQUFtQixFQUFFLFNBQVM7b0JBQzlCLHNCQUFzQixFQUFFLFNBQVM7b0JBQ2pDLG1CQUFtQixFQUFFLFNBQVM7b0JBQzlCLG9CQUFvQixFQUFFLFNBQVM7b0JBQy9CLDBCQUEwQixFQUFFLFNBQVM7b0JBQ3JDLHdCQUF3QixFQUFFLFNBQVM7b0JBQ25DLDBCQUEwQixFQUFFLFNBQVM7b0JBQ3JDLDJCQUEyQixFQUFFLFNBQVM7b0JBQ3RDLHlCQUF5QixFQUFFLFNBQVM7b0JBQ3BDLDRCQUE0QixFQUFFLFNBQVM7b0JBQ3ZDLHlCQUF5QixFQUFFLFNBQVM7b0JBQ3BDLDBCQUEwQixFQUFFLFNBQVM7aUJBQ3JDLENBQUMsQ0FBQyxDQUFDO2dCQUNKLEtBQUssR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyw2QkFBYSxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLGtCQUFrQixFQUFFLEdBQUcsRUFBRSxDQUFDLFNBQVMsRUFBRSxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxpREFBdUIsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksNkNBQXFCLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQzFQLElBQUEsd0JBQWUsRUFBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUU7b0JBQ3hDLFVBQVUsRUFBRSxTQUFTO29CQUNyQixVQUFVLEVBQUUsU0FBUztvQkFDckIsTUFBTSxFQUFFLFNBQVM7b0JBQ2pCLFlBQVksRUFBRSxTQUFTO29CQUN2QixtQkFBbUIsRUFBRSxTQUFTO29CQUM5QiwyQkFBMkIsRUFBRSxTQUFTO29CQUN0QyxtQkFBbUIsRUFBRSxTQUFTO29CQUM5QixLQUFLLEVBQUUsU0FBUztvQkFDaEIsS0FBSyxFQUFFLFNBQVM7b0JBQ2hCLEdBQUcsRUFBRSxTQUFTO29CQUNkLE1BQU0sRUFBRSxTQUFTO29CQUNqQixJQUFJLEVBQUUsU0FBUztvQkFDZixPQUFPLEVBQUUsU0FBUztvQkFDbEIsSUFBSSxFQUFFLFNBQVM7b0JBQ2YsS0FBSyxFQUFFLFNBQVM7b0JBQ2hCLFdBQVcsRUFBRSxTQUFTO29CQUN0QixTQUFTLEVBQUUsU0FBUztvQkFDcEIsV0FBVyxFQUFFLFNBQVM7b0JBQ3RCLFlBQVksRUFBRSxTQUFTO29CQUN2QixVQUFVLEVBQUUsU0FBUztvQkFDckIsYUFBYSxFQUFFLFNBQVM7b0JBQ3hCLFVBQVUsRUFBRSxTQUFTO29CQUNyQixXQUFXLEVBQUUsU0FBUztpQkFDdEIsQ0FBQyxDQUFDO2dCQUNILFlBQVksQ0FBQyxRQUFRLENBQUMsSUFBSSxpQ0FBYyxDQUFDO29CQUN4QyxDQUFDLGlEQUF5QixDQUFDLEVBQUUsU0FBUztvQkFDdEMsQ0FBQyxpREFBeUIsQ0FBQyxFQUFFLFNBQVM7b0JBQ3RDLENBQUMsd0RBQWdDLENBQUMsRUFBRSxTQUFTO29CQUM3QyxDQUFDLHdEQUFnQyxDQUFDLEVBQUUsU0FBUztvQkFDN0MsQ0FBQywyREFBbUMsQ0FBQyxFQUFFLFNBQVM7b0JBQ2hELENBQUMsb0VBQTRDLENBQUMsRUFBRSxTQUFTO29CQUN6RCxDQUFDLDJEQUFtQyxDQUFDLEVBQUUsU0FBUztvQkFDaEQsb0JBQW9CLEVBQUUsU0FBUztvQkFDL0Isa0JBQWtCLEVBQUUsU0FBUztvQkFDN0Isb0JBQW9CLEVBQUUsU0FBUztvQkFDL0IscUJBQXFCLEVBQUUsU0FBUztvQkFDaEMsbUJBQW1CLEVBQUUsU0FBUztvQkFDOUIsc0JBQXNCLEVBQUUsU0FBUztvQkFDakMsbUJBQW1CLEVBQUUsU0FBUztvQkFDOUIsb0JBQW9CLEVBQUUsU0FBUztvQkFDL0IsMEJBQTBCLEVBQUUsU0FBUztvQkFDckMsd0JBQXdCLEVBQUUsU0FBUztvQkFDbkMsMEJBQTBCLEVBQUUsU0FBUztvQkFDckMsMkJBQTJCLEVBQUUsU0FBUztvQkFDdEMseUJBQXlCLEVBQUUsU0FBUztvQkFDcEMsNEJBQTRCLEVBQUUsU0FBUztvQkFDdkMseUJBQXlCLEVBQUUsU0FBUztvQkFDcEMsMEJBQTBCLEVBQUUsU0FBUztpQkFDckMsQ0FBQyxDQUFDLENBQUM7Z0JBQ0osSUFBQSx3QkFBZSxFQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRTtvQkFDeEMsVUFBVSxFQUFFLFNBQVM7b0JBQ3JCLFVBQVUsRUFBRSxTQUFTO29CQUNyQixNQUFNLEVBQUUsU0FBUztvQkFDakIsWUFBWSxFQUFFLFNBQVM7b0JBQ3ZCLG1CQUFtQixFQUFFLFNBQVM7b0JBQzlCLDJCQUEyQixFQUFFLFNBQVM7b0JBQ3RDLG1CQUFtQixFQUFFLFNBQVM7b0JBQzlCLEtBQUssRUFBRSxTQUFTO29CQUNoQixLQUFLLEVBQUUsU0FBUztvQkFDaEIsR0FBRyxFQUFFLFNBQVM7b0JBQ2QsTUFBTSxFQUFFLFNBQVM7b0JBQ2pCLElBQUksRUFBRSxTQUFTO29CQUNmLE9BQU8sRUFBRSxTQUFTO29CQUNsQixJQUFJLEVBQUUsU0FBUztvQkFDZixLQUFLLEVBQUUsU0FBUztvQkFDaEIsV0FBVyxFQUFFLFNBQVM7b0JBQ3RCLFNBQVMsRUFBRSxTQUFTO29CQUNwQixXQUFXLEVBQUUsU0FBUztvQkFDdEIsWUFBWSxFQUFFLFNBQVM7b0JBQ3ZCLFVBQVUsRUFBRSxTQUFTO29CQUNyQixhQUFhLEVBQUUsU0FBUztvQkFDeEIsVUFBVSxFQUFFLFNBQVM7b0JBQ3JCLFdBQVcsRUFBRSxTQUFTO2lCQUN0QixDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUgsS0FBSyxDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUU7WUFDdkIsb0VBQW9FO1lBQ3BFLGdFQUFnRTtZQUNoRSxJQUFJLENBQUMsSUFBSSxDQUFDLHNFQUFzRSxFQUFFLEtBQUssSUFBSSxFQUFFO2dCQUM1RixzQkFBc0I7Z0JBQ3RCLElBQUEsb0JBQVcsRUFBQyxjQUFjLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUU3Qyx5REFBeUQ7Z0JBQ3pELE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2hELEtBQUssQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRWpDLHVDQUF1QztnQkFDdkMsTUFBTSxvQkFBb0IsQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLEVBQUUsRUFBRSxVQUFVLEVBQUUsRUFBRSxHQUFHLHFCQUFxQixFQUFFLGVBQWUsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQ25JLG9CQUFvQixDQUFDLCtCQUErQixDQUFDLElBQUksQ0FBQyxFQUFFLG9CQUFvQixFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBUyxDQUFDLENBQUM7Z0JBQ3ZHLE1BQU0sS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUMsdUJBQXVCO2dCQUN0RCxJQUFJLGtCQUFRLEVBQUU7b0JBQ2IsSUFBQSxvQkFBVyxFQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLGlEQUFpRCxDQUFDLENBQUM7aUJBQ2hHO3FCQUFNO29CQUNOLElBQUEsb0JBQVcsRUFBQyxjQUFjLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO2lCQUM1QztnQkFFRCwwQkFBMEI7Z0JBQzFCLE1BQU0sb0JBQW9CLENBQUMsb0JBQW9CLENBQUMsVUFBVSxFQUFFLEVBQUUsVUFBVSxFQUFFLEVBQUUsR0FBRyxxQkFBcUIsRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUNsSSxvQkFBb0IsQ0FBQywrQkFBK0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxvQkFBb0IsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQVMsQ0FBQyxDQUFDO2dCQUN2RyxNQUFNLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLHVCQUF1QjtnQkFDdEQsSUFBQSxvQkFBVyxFQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBRTdDLDhEQUE4RDtnQkFDOUQsY0FBYyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7Z0JBQ2xDLE1BQU0sb0JBQW9CLENBQUMsb0JBQW9CLENBQUMsVUFBVSxFQUFFLEVBQUUsVUFBVSxFQUFFLEVBQUUsR0FBRyxxQkFBcUIsRUFBRSxlQUFlLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUNuSSxvQkFBb0IsQ0FBQywrQkFBK0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxvQkFBb0IsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQVMsQ0FBQyxDQUFDO2dCQUN2RyxNQUFNLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLHVCQUF1QjtnQkFDdEQsSUFBQSxvQkFBVyxFQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDOUMsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDIn0=