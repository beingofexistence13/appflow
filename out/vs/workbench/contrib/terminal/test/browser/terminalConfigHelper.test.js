/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/contrib/terminal/browser/terminalConfigHelper", "vs/editor/common/config/editorOptions", "vs/platform/configuration/test/common/testConfigurationService", "vs/base/test/common/utils", "vs/base/common/lifecycle"], function (require, exports, assert, terminalConfigHelper_1, editorOptions_1, testConfigurationService_1, utils_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TestTerminalConfigHelper extends terminalConfigHelper_1.TerminalConfigHelper {
        set linuxDistro(distro) {
            this._linuxDistro = distro;
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
            store = new lifecycle_1.DisposableStore();
            fixture = document.body;
        });
        teardown(() => store.dispose());
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('TerminalConfigHelper - getFont fontFamily', () => {
            const configurationService = new testConfigurationService_1.TestConfigurationService({
                editor: { fontFamily: 'foo' },
                terminal: { integrated: { fontFamily: 'bar' } }
            });
            const configHelper = store.add(new TestTerminalConfigHelper(configurationService, null, null, null, null));
            configHelper.panelContainer = fixture;
            assert.strictEqual(configHelper.getFont().fontFamily, 'bar, monospace', 'terminal.integrated.fontFamily should be selected over editor.fontFamily');
        });
        test('TerminalConfigHelper - getFont fontFamily (Linux Fedora)', () => {
            const configurationService = new testConfigurationService_1.TestConfigurationService({
                editor: { fontFamily: 'foo' },
                terminal: { integrated: { fontFamily: null } }
            });
            const configHelper = store.add(new TestTerminalConfigHelper(configurationService, null, null, null, null));
            configHelper.linuxDistro = 2 /* LinuxDistro.Fedora */;
            configHelper.panelContainer = fixture;
            assert.strictEqual(configHelper.getFont().fontFamily, '\'DejaVu Sans Mono\', monospace', 'Fedora should have its font overridden when terminal.integrated.fontFamily not set');
        });
        test('TerminalConfigHelper - getFont fontFamily (Linux Ubuntu)', () => {
            const configurationService = new testConfigurationService_1.TestConfigurationService({
                editor: { fontFamily: 'foo' },
                terminal: { integrated: { fontFamily: null } }
            });
            const configHelper = store.add(new TestTerminalConfigHelper(configurationService, null, null, null, null));
            configHelper.linuxDistro = 3 /* LinuxDistro.Ubuntu */;
            configHelper.panelContainer = fixture;
            assert.strictEqual(configHelper.getFont().fontFamily, '\'Ubuntu Mono\', monospace', 'Ubuntu should have its font overridden when terminal.integrated.fontFamily not set');
        });
        test('TerminalConfigHelper - getFont fontFamily (Linux Unknown)', () => {
            const configurationService = new testConfigurationService_1.TestConfigurationService({
                editor: { fontFamily: 'foo' },
                terminal: { integrated: { fontFamily: null } }
            });
            const configHelper = store.add(new TestTerminalConfigHelper(configurationService, null, null, null, null));
            configHelper.panelContainer = fixture;
            assert.strictEqual(configHelper.getFont().fontFamily, 'foo, monospace', 'editor.fontFamily should be the fallback when terminal.integrated.fontFamily not set');
        });
        test('TerminalConfigHelper - getFont fontSize 10', () => {
            const configurationService = new testConfigurationService_1.TestConfigurationService({
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
            const configurationService = new testConfigurationService_1.TestConfigurationService({
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
            const configurationService = new testConfigurationService_1.TestConfigurationService({
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
            const configurationService = new testConfigurationService_1.TestConfigurationService({
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
            const configurationService = new testConfigurationService_1.TestConfigurationService({
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
            const configurationService = new testConfigurationService_1.TestConfigurationService({
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
            const configurationService = new testConfigurationService_1.TestConfigurationService({
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
            const configurationService = new testConfigurationService_1.TestConfigurationService({
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
            const configurationService = new testConfigurationService_1.TestConfigurationService({
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
            const configurationService = new testConfigurationService_1.TestConfigurationService({
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
            const configurationService = new testConfigurationService_1.TestConfigurationService({
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
            const configurationService = new testConfigurationService_1.TestConfigurationService({
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxDb25maWdIZWxwZXIudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsL3Rlc3QvYnJvd3Nlci90ZXJtaW5hbENvbmZpZ0hlbHBlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBVWhHLE1BQU0sd0JBQXlCLFNBQVEsMkNBQW9CO1FBQzFELElBQUksV0FBVyxDQUFDLE1BQW1CO1lBQ2xDLElBQUksQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDO1FBQzVCLENBQUM7S0FDRDtJQUVELEtBQUssQ0FBQyxrQ0FBa0MsRUFBRTtRQUN6QyxJQUFJLEtBQXNCLENBQUM7UUFDM0IsSUFBSSxPQUFvQixDQUFDO1FBRXpCLGdHQUFnRztRQUNoRyw2RkFBNkY7UUFDN0YsaUVBQWlFO1FBQ2pFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFaEIsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLEtBQUssR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUM5QixPQUFPLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQztRQUN6QixDQUFDLENBQUMsQ0FBQztRQUNILFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUVoQyxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsSUFBSSxDQUFDLDJDQUEyQyxFQUFFLEdBQUcsRUFBRTtZQUN0RCxNQUFNLG9CQUFvQixHQUFHLElBQUksbURBQXdCLENBQUM7Z0JBQ3pELE1BQU0sRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUU7Z0JBQzdCLFFBQVEsRUFBRSxFQUFFLFVBQVUsRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsRUFBRTthQUMvQyxDQUFDLENBQUM7WUFDSCxNQUFNLFlB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