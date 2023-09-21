/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/arrays", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/contextview/browser/contextMenuService", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService", "vs/workbench/common/views", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkManager", "vs/workbench/contrib/terminal/test/browser/xterm/xtermTerminal.test", "vs/workbench/test/common/workbenchTestServices", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkResolver", "vs/amdX", "vs/base/test/common/utils"], function (require, exports, assert_1, arrays_1, configuration_1, testConfigurationService_1, contextMenuService_1, contextView_1, instantiationServiceMock_1, log_1, storage_1, themeService_1, testThemeService_1, views_1, terminalLinkManager_1, xtermTerminal_test_1, workbenchTestServices_1, terminalLinkResolver_1, amdX_1, utils_1) {
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
        unicodeVersion: '11',
        wordSeparators: ' ()[]{}\',"`─‘’'
    };
    class TestLinkManager extends terminalLinkManager_1.$VWb {
        async D(y, type) {
            switch (type) {
                case 'word':
                    return this.M?.wordLinks?.[y] ? [this.M?.wordLinks?.[y]] : undefined;
                case 'url':
                    return this.M?.webLinks?.[y] ? [this.M?.webLinks?.[y]] : undefined;
                case 'localFile':
                    return this.M?.fileLinks?.[y] ? [this.M?.fileLinks?.[y]] : undefined;
            }
        }
        setLinks(links) {
            this.M = links;
        }
    }
    suite('TerminalLinkManager', () => {
        const store = (0, utils_1.$bT)();
        let instantiationService;
        let configurationService;
        let themeService;
        let viewDescriptorService;
        let xterm;
        let linkManager;
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
            viewDescriptorService = new xtermTerminal_test_1.$6fc();
            instantiationService = store.add(new instantiationServiceMock_1.$L0b());
            instantiationService.stub(contextView_1.$WZ, store.add(instantiationService.createInstance(contextMenuService_1.$B4b)));
            instantiationService.stub(configuration_1.$8h, configurationService);
            instantiationService.stub(log_1.$5i, new log_1.$fj());
            instantiationService.stub(storage_1.$Vo, store.add(new workbenchTestServices_1.$7dc()));
            instantiationService.stub(themeService_1.$gv, themeService);
            instantiationService.stub(views_1.$_E, viewDescriptorService);
            const TerminalCtor = (await (0, amdX_1.$aD)('xterm', 'lib/xterm.js')).Terminal;
            xterm = store.add(new TerminalCtor({ allowProposedApi: true, cols: 80, rows: 30 }));
            linkManager = store.add(instantiationService.createInstance(TestLinkManager, xterm, upcastPartial({
                get initialCwd() {
                    return '';
                }
            }), {
                get(capability) {
                    return undefined;
                }
            }, instantiationService.createInstance(terminalLinkResolver_1.$YWb)));
        });
        suite('getLinks and open recent link', () => {
            test('should return no links', async () => {
                const links = await linkManager.getLinks();
                (0, arrays_1.$sb)(links.viewport.webLinks, []);
                (0, arrays_1.$sb)(links.viewport.wordLinks, []);
                (0, arrays_1.$sb)(links.viewport.fileLinks, []);
                const webLink = await linkManager.openRecentLink('url');
                (0, assert_1.strictEqual)(webLink, undefined);
                const fileLink = await linkManager.openRecentLink('localFile');
                (0, assert_1.strictEqual)(fileLink, undefined);
            });
            test('should return word links in order', async () => {
                const link1 = {
                    range: {
                        start: { x: 1, y: 1 }, end: { x: 14, y: 1 }
                    },
                    text: '1_我是学生.txt',
                    activate: () => Promise.resolve('')
                };
                const link2 = {
                    range: {
                        start: { x: 1, y: 1 }, end: { x: 14, y: 1 }
                    },
                    text: '2_我是学生.txt',
                    activate: () => Promise.resolve('')
                };
                linkManager.setLinks({ wordLinks: [link1, link2] });
                const links = await linkManager.getLinks();
                (0, assert_1.deepStrictEqual)(links.viewport.wordLinks?.[0].text, link2.text);
                (0, assert_1.deepStrictEqual)(links.viewport.wordLinks?.[1].text, link1.text);
                const webLink = await linkManager.openRecentLink('url');
                (0, assert_1.strictEqual)(webLink, undefined);
                const fileLink = await linkManager.openRecentLink('localFile');
                (0, assert_1.strictEqual)(fileLink, undefined);
            });
            test('should return web links in order', async () => {
                const link1 = {
                    range: { start: { x: 5, y: 1 }, end: { x: 40, y: 1 } },
                    text: 'https://foo.bar/[this is foo site 1]',
                    activate: () => Promise.resolve('')
                };
                const link2 = {
                    range: { start: { x: 5, y: 2 }, end: { x: 40, y: 2 } },
                    text: 'https://foo.bar/[this is foo site 2]',
                    activate: () => Promise.resolve('')
                };
                linkManager.setLinks({ webLinks: [link1, link2] });
                const links = await linkManager.getLinks();
                (0, assert_1.deepStrictEqual)(links.viewport.webLinks?.[0].text, link2.text);
                (0, assert_1.deepStrictEqual)(links.viewport.webLinks?.[1].text, link1.text);
                const webLink = await linkManager.openRecentLink('url');
                (0, assert_1.strictEqual)(webLink, link2);
                const fileLink = await linkManager.openRecentLink('localFile');
                (0, assert_1.strictEqual)(fileLink, undefined);
            });
            test('should return file links in order', async () => {
                const link1 = {
                    range: { start: { x: 1, y: 1 }, end: { x: 32, y: 1 } },
                    text: 'file:///C:/users/test/file_1.txt',
                    activate: () => Promise.resolve('')
                };
                const link2 = {
                    range: { start: { x: 1, y: 2 }, end: { x: 32, y: 2 } },
                    text: 'file:///C:/users/test/file_2.txt',
                    activate: () => Promise.resolve('')
                };
                linkManager.setLinks({ fileLinks: [link1, link2] });
                const links = await linkManager.getLinks();
                (0, assert_1.deepStrictEqual)(links.viewport.fileLinks?.[0].text, link2.text);
                (0, assert_1.deepStrictEqual)(links.viewport.fileLinks?.[1].text, link1.text);
                const webLink = await linkManager.openRecentLink('url');
                (0, assert_1.strictEqual)(webLink, undefined);
                linkManager.setLinks({ fileLinks: [link2] });
                const fileLink = await linkManager.openRecentLink('localFile');
                (0, assert_1.strictEqual)(fileLink, link2);
            });
        });
    });
    function upcastPartial(v) {
        return v;
    }
});
//# sourceMappingURL=terminalLinkManager.test.js.map