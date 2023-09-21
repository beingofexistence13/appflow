/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/contrib/terminal/browser/terminalConfigHelper", "vs/editor/common/config/editorOptions", "vs/platform/configuration/test/common/testConfigurationService", "vs/base/test/common/utils", "vs/base/common/lifecycle"], function (require, exports, assert, terminalConfigHelper_1, editorOptions_1, testConfigurationService_1, utils_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TestTerminalConfigHelper extends terminalConfigHelper_1.$dib {
        set linuxDistro(distro) {
            this.c = distro;
        }
    }
    suite('Workbench - TerminalConfigHelper', function () {
        let store;
        let fixture;
        // This suite has retries setup because the font-related tests flake only on GitHub actions, not
        // ADO. It seems Electron hangs for some reason only on GH actions, so the two options are to
        // retry or remove the test outright (which would drop coverage).
        this.retries(3);
        setup(() => {
            store = new lifecycle_1.$jc();
            fixture = document.body;
        });
        teardown(() => store.dispose());
        (0, utils_1.$bT)();
        test('TerminalConfigHelper - getFont fontFamily', () => {
            const configurationService = new testConfigurationService_1.$G0b({
                editor: { fontFamily: 'foo' },
                terminal: { integrated: { fontFamily: 'bar' } }
            });
            const configHelper = store.add(new TestTerminalConfigHelper(configurationService, null, null, null, null));
            configHelper.panelContainer = fixture;
            assert.strictEqual(configHelper.getFont().fontFamily, 'bar, monospace', 'terminal.integrated.fontFamily should be selected over editor.fontFamily');
        });
        test('TerminalConfigHelper - getFont fontFamily (Linux Fedora)', () => {
            const configurationService = new testConfigurationService_1.$G0b({
                editor: { fontFamily: 'foo' },
                terminal: { integrated: { fontFamily: null } }
            });
            const configHelper = store.add(new TestTerminalConfigHelper(configurationService, null, null, null, null));
            configHelper.linuxDistro = 2 /* LinuxDistro.Fedora */;
            configHelper.panelContainer = fixture;
            assert.strictEqual(configHelper.getFont().fontFamily, '\'DejaVu Sans Mono\', monospace', 'Fedora should have its font overridden when terminal.integrated.fontFamily not set');
        });
        test('TerminalConfigHelper - getFont fontFamily (Linux Ubuntu)', () => {
            const configurationService = new testConfigurationService_1.$G0b({
                editor: { fontFamily: 'foo' },
                terminal: { integrated: { fontFamily: null } }
            });
            const configHelper = store.add(new TestTerminalConfigHelper(configurationService, null, null, null, null));
            configHelper.linuxDistro = 3 /* LinuxDistro.Ubuntu */;
            configHelper.panelContainer = fixture;
            assert.strictEqual(configHelper.getFont().fontFamily, '\'Ubuntu Mono\', monospace', 'Ubuntu should have its font overridden when terminal.integrated.fontFamily not set');
        });
        test('TerminalConfigHelper - getFont fontFamily (Linux Unknown)', () => {
            const configurationService = new testConfigurationService_1.$G0b({
                editor: { fontFamily: 'foo' },
                terminal: { integrated: { fontFamily: null } }
            });
            const configHelper = store.add(new TestTerminalConfigHelper(configurationService, null, null, null, null));
            configHelper.panelContainer = fixture;
            assert.strictEqual(configHelper.getFont().fontFamily, 'foo, monospace', 'editor.fontFamily should be the fallback when terminal.integrated.fontFamily not set');
        });
        test('TerminalConfigHelper - getFont fontSize 10', () => {
            const configurationService = new testConfigurationService_1.$G0b({
                editor: {
                    fontFamily: 'foo',
                    fontSize: 9
                },
                terminal: {
                    integrated: {
                        fontFamily: 'bar',
                        fontSize: 10
                    }
                }
            });
            const configHelper = store.add(new TestTerminalConfigHelper(configurationService, null, null, null, null));
            configHelper.panelContainer = fixture;
            assert.strictEqual(configHelper.getFont().fontSize, 10, 'terminal.integrated.fontSize should be selected over editor.fontSize');
        });
        test('TerminalConfigHelper - getFont fontSize 0', () => {
            const configurationService = new testConfigurationService_1.$G0b({
                editor: {
                    fontFamily: 'foo'
                },
                terminal: {
                    integrated: {
                        fontFamily: null,
                        fontSize: 0
                    }
                }
            });
            let configHelper = store.add(new TestTerminalConfigHelper(configurationService, null, null, null, null));
            configHelper.linuxDistro = 3 /* LinuxDistro.Ubuntu */;
            configHelper.panelContainer = fixture;
            assert.strictEqual(configHelper.getFont().fontSize, 8, 'The minimum terminal font size (with adjustment) should be used when terminal.integrated.fontSize less than it');
            configHelper = store.add(new TestTerminalConfigHelper(configurationService, null, null, null, null));
            configHelper.panelContainer = fixture;
            assert.strictEqual(configHelper.getFont().fontSize, 6, 'The minimum terminal font size should be used when terminal.integrated.fontSize less than it');
        });
        test('TerminalConfigHelper - getFont fontSize 1500', () => {
            const configurationService = new testConfigurationService_1.$G0b({
                editor: {
                    fontFamily: 'foo'
                },
                terminal: {
                    integrated: {
                        fontFamily: 0,
                        fontSize: 1500
                    }
                }
            });
            const configHelper = store.add(new TestTerminalConfigHelper(configurationService, null, null, null, null));
            configHelper.panelContainer = fixture;
            assert.strictEqual(configHelper.getFont().fontSize, 100, 'The maximum terminal font size should be used when terminal.integrated.fontSize more than it');
        });
        test('TerminalConfigHelper - getFont fontSize null', () => {
            const configurationService = new testConfigurationService_1.$G0b({
                editor: {
                    fontFamily: 'foo'
                },
                terminal: {
                    integrated: {
                        fontFamily: 0,
                        fontSize: null
                    }
                }
            });
            let configHelper = store.add(new TestTerminalConfigHelper(configurationService, null, null, null, null));
            configHelper.linuxDistro = 3 /* LinuxDistro.Ubuntu */;
            configHelper.panelContainer = fixture;
            assert.strictEqual(configHelper.getFont().fontSize, editorOptions_1.EDITOR_FONT_DEFAULTS.fontSize + 2, 'The default editor font size (with adjustment) should be used when terminal.integrated.fontSize is not set');
            configHelper = store.add(new TestTerminalConfigHelper(configurationService, null, null, null, null));
            configHelper.panelContainer = fixture;
            assert.strictEqual(configHelper.getFont().fontSize, editorOptions_1.EDITOR_FONT_DEFAULTS.fontSize, 'The default editor font size should be used when terminal.integrated.fontSize is not set');
        });
        test('TerminalConfigHelper - getFont lineHeight 2', () => {
            const configurationService = new testConfigurationService_1.$G0b({
                editor: {
                    fontFamily: 'foo',
                    lineHeight: 1
                },
                terminal: {
                    integrated: {
                        fontFamily: 0,
                        lineHeight: 2
                    }
                }
            });
            const configHelper = store.add(new TestTerminalConfigHelper(configurationService, null, null, null, null));
            configHelper.panelContainer = fixture;
            assert.strictEqual(configHelper.getFont().lineHeight, 2, 'terminal.integrated.lineHeight should be selected over editor.lineHeight');
        });
        test('TerminalConfigHelper - getFont lineHeight 0', () => {
            const configurationService = new testConfigurationService_1.$G0b({
                editor: {
                    fontFamily: 'foo',
                    lineHeight: 1
                },
                terminal: {
                    integrated: {
                        fontFamily: 0,
                        lineHeight: 0
                    }
                }
            });
            const configHelper = store.add(new TestTerminalConfigHelper(configurationService, null, null, null, null));
            configHelper.panelContainer = fixture;
            assert.strictEqual(configHelper.getFont().lineHeight, 1, 'editor.lineHeight should be 1 when terminal.integrated.lineHeight not set');
        });
        test('TerminalConfigHelper - isMonospace monospace', () => {
            const configurationService = new testConfigurationService_1.$G0b({
                terminal: {
                    integrated: {
                        fontFamily: 'monospace'
                    }
                }
            });
            const configHelper = store.add(new TestTerminalConfigHelper(configurationService, null, null, null, null));
            configHelper.panelContainer = fixture;
            assert.strictEqual(configHelper.configFontIsMonospace(), true, 'monospace is monospaced');
        });
        test('TerminalConfigHelper - isMonospace sans-serif', () => {
            const configurationService = new testConfigurationService_1.$G0b({
                terminal: {
                    integrated: {
                        fontFamily: 'sans-serif'
                    }
                }
            });
            const configHelper = store.add(new TestTerminalConfigHelper(configurationService, null, null, null, null));
            configHelper.panelContainer = fixture;
            assert.strictEqual(configHelper.configFontIsMonospace(), false, 'sans-serif is not monospaced');
        });
        test('TerminalConfigHelper - isMonospace serif', () => {
            const configurationService = new testConfigurationService_1.$G0b({
                terminal: {
                    integrated: {
                        fontFamily: 'serif'
                    }
                }
            });
            const configHelper = store.add(new TestTerminalConfigHelper(configurationService, null, null, null, null));
            configHelper.panelContainer = fixture;
            assert.strictEqual(configHelper.configFontIsMonospace(), false, 'serif is not monospaced');
        });
        test('TerminalConfigHelper - isMonospace monospace falls back to editor.fontFamily', () => {
            const configurationService = new testConfigurationService_1.$G0b({
                editor: {
                    fontFamily: 'monospace'
                },
                terminal: {
                    integrated: {
                        fontFamily: null
                    }
                }
            });
            const configHelper = store.add(new TestTerminalConfigHelper(configurationService, null, null, null, null));
            configHelper.panelContainer = fixture;
            assert.strictEqual(configHelper.configFontIsMonospace(), true, 'monospace is monospaced');
        });
        test('TerminalConfigHelper - isMonospace sans-serif falls back to editor.fontFamily', () => {
            const configurationService = new testConfigurationService_1.$G0b({
                editor: {
                    fontFamily: 'sans-serif'
                },
                terminal: {
                    integrated: {
                        fontFamily: null
                    }
                }
            });
            const configHelper = store.add(new TestTerminalConfigHelper(configurationService, null, null, null, null));
            configHelper.panelContainer = fixture;
            assert.strictEqual(configHelper.configFontIsMonospace(), false, 'sans-serif is not monospaced');
        });
        test('TerminalConfigHelper - isMonospace serif falls back to editor.fontFamily', () => {
            const configurationService = new testConfigurationService_1.$G0b({
                editor: {
                    fontFamily: 'serif'
                },
                terminal: {
                    integrated: {
                        fontFamily: null
                    }
                }
            });
            const configHelper = store.add(new TestTerminalConfigHelper(configurationService, null, null, null, null));
            configHelper.panelContainer = fixture;
            assert.strictEqual(configHelper.configFontIsMonospace(), false, 'serif is not monospaced');
        });
    });
});
//# sourceMappingURL=terminalConfigHelper.test.js.map