/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/terminal/browser/xterm/xtermTerminal", "vs/workbench/contrib/terminal/browser/terminalConfigHelper", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/workbench/contrib/terminal/common/terminal", "assert", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/theme/test/common/testThemeService", "vs/platform/theme/common/themeService", "vs/workbench/common/views", "vs/base/common/event", "vs/workbench/contrib/terminal/common/terminalColorRegistry", "vs/workbench/common/theme", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/workbench/test/common/workbenchTestServices", "vs/base/browser/browser", "vs/platform/terminal/common/capabilities/terminalCapabilityStore", "vs/platform/contextview/browser/contextView", "vs/platform/contextview/browser/contextMenuService", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/services/lifecycle/common/lifecycle", "vs/amdX", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/base/common/color", "vs/platform/contextkey/common/contextkey", "vs/platform/terminal/common/terminal", "vs/base/test/common/utils"], function (require, exports, xtermTerminal_1, terminalConfigHelper_1, instantiationServiceMock_1, terminal_1, assert_1, configuration_1, testConfigurationService_1, testThemeService_1, themeService_1, views_1, event_1, terminalColorRegistry_1, theme_1, log_1, storage_1, workbenchTestServices_1, browser_1, terminalCapabilityStore_1, contextView_1, contextMenuService_1, workbenchTestServices_2, lifecycle_1, amdX_1, mockKeybindingService_1, color_1, contextkey_1, terminal_2, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$6fc = void 0;
    class TestWebglAddon {
        constructor() {
            this.onChangeTextureAtlas = new event_1.$fd().event;
            this.onAddTextureAtlasCanvas = new event_1.$fd().event;
            this.onContextLoss = new event_1.$fd().event;
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
    class TestXtermTerminal extends xtermTerminal_1.$Kib {
        constructor() {
            super(...arguments);
            this.webglAddonPromise = Promise.resolve(TestWebglAddon);
        }
        // Force synchronous to avoid async when activating the addon
        yb() {
            return this.webglAddonPromise;
        }
    }
    class $6fc {
        constructor() {
            this.a = 1 /* ViewContainerLocation.Panel */;
            this.b = new event_1.$fd();
            this.onDidChangeLocation = this.b.event;
        }
        getViewLocationById(id) {
            return this.a;
        }
        moveTerminalToLocation(to) {
            const oldLocation = this.a;
            this.a = to;
            this.b.fire({
                views: [
                    { id: terminal_1.$tM }
                ],
                from: oldLocation,
                to
            });
        }
    }
    exports.$6fc = $6fc;
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
        const store = (0, utils_1.$bT)();
        let instantiationService;
        let configurationService;
        let themeService;
        let viewDescriptorService;
        let xterm;
        let configHelper;
        let XTermBaseCtor;
        setup(async () => {
            configurationService = new testConfigurationService_1.$G0b({
                editor: {
                    fastScrollSensitivity: 2,
                    mouseWheelScrollSensitivity: 1
                },
                terminal: {
                    integrated: defaultTerminalConfig
                }
            });
            themeService = new testThemeService_1.$K0b();
            viewDescriptorService = new $6fc();
            instantiationService = store.add(new instantiationServiceMock_1.$L0b());
            instantiationService.stub(configuration_1.$8h, configurationService);
            instantiationService.stub(terminal_2.$Zq, new log_1.$fj());
            instantiationService.stub(storage_1.$Vo, store.add(new workbenchTestServices_1.$7dc()));
            instantiationService.stub(themeService_1.$gv, themeService);
            instantiationService.stub(views_1.$_E, viewDescriptorService);
            instantiationService.stub(contextView_1.$WZ, store.add(instantiationService.createInstance(contextMenuService_1.$B4b)));
            instantiationService.stub(lifecycle_1.$7y, store.add(new workbenchTestServices_2.$Kec()));
            instantiationService.stub(contextkey_1.$3i, new mockKeybindingService_1.$S0b());
            configHelper = store.add(instantiationService.createInstance(terminalConfigHelper_1.$dib));
            XTermBaseCtor = (await (0, amdX_1.$aD)('xterm', 'lib/xterm.js')).Terminal;
            const capabilityStore = store.add(new terminalCapabilityStore_1.$eib());
            xterm = store.add(instantiationService.createInstance(TestXtermTerminal, XTermBaseCtor, configHelper, 80, 30, { getBackgroundColor: () => undefined }, capabilityStore, '', new mockKeybindingService_1.$S0b().createKey('', true), true));
            TestWebglAddon.shouldThrow = false;
            TestWebglAddon.isEnabled = false;
        });
        test('should use fallback dimensions of 80x30', () => {
            (0, assert_1.strictEqual)(xterm.raw.cols, 80);
            (0, assert_1.strictEqual)(xterm.raw.rows, 30);
        });
        suite('theme', () => {
            test('should apply correct background color based on getBackgroundColor', () => {
                themeService.setTheme(new testThemeService_1.$J0b({
                    [theme_1.$L_]: '#ff0000',
                    [theme_1.$Iab]: '#00ff00'
                }));
                xterm = store.add(instantiationService.createInstance(xtermTerminal_1.$Kib, XTermBaseCtor, configHelper, 80, 30, { getBackgroundColor: () => new color_1.$Os(new color_1.$Ls(255, 0, 0)) }, store.add(new terminalCapabilityStore_1.$eib()), '', new mockKeybindingService_1.$S0b().createKey('', true), true));
                (0, assert_1.strictEqual)(xterm.raw.options.theme?.background, '#ff0000');
            });
            test('should react to and apply theme changes', () => {
                themeService.setTheme(new testThemeService_1.$J0b({
                    [terminalColorRegistry_1.$ofb]: '#000100',
                    [terminalColorRegistry_1.$pfb]: '#000200',
                    [terminalColorRegistry_1.$qfb]: '#000300',
                    [terminalColorRegistry_1.$rfb]: '#000400',
                    [terminalColorRegistry_1.$sfb]: '#000500',
                    [terminalColorRegistry_1.$tfb]: '#000600',
                    [terminalColorRegistry_1.$ufb]: undefined,
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
                xterm = store.add(instantiationService.createInstance(xtermTerminal_1.$Kib, XTermBaseCtor, configHelper, 80, 30, { getBackgroundColor: () => undefined }, store.add(new terminalCapabilityStore_1.$eib()), '', new mockKeybindingService_1.$S0b().createKey('', true), true));
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
                themeService.setTheme(new testThemeService_1.$J0b({
                    [terminalColorRegistry_1.$ofb]: '#00010f',
                    [terminalColorRegistry_1.$pfb]: '#00020f',
                    [terminalColorRegistry_1.$qfb]: '#00030f',
                    [terminalColorRegistry_1.$rfb]: '#00040f',
                    [terminalColorRegistry_1.$sfb]: '#00050f',
                    [terminalColorRegistry_1.$tfb]: '#00060f',
                    [terminalColorRegistry_1.$ufb]: '#00070f',
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
                if (browser_1.$8N) {
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
//# sourceMappingURL=xtermTerminal.test.js.map