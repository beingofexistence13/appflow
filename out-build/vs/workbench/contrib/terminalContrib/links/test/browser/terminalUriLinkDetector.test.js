/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/files/common/files", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkResolver", "vs/workbench/contrib/terminalContrib/links/browser/terminalUriLinkDetector", "vs/workbench/contrib/terminalContrib/links/test/browser/linkTestUtils", "vs/workbench/test/common/workbenchTestServices", "vs/base/common/uri", "vs/amdX", "vs/base/test/common/utils"], function (require, exports, configuration_1, testConfigurationService_1, files_1, instantiationServiceMock_1, terminalLinkResolver_1, terminalUriLinkDetector_1, linkTestUtils_1, workbenchTestServices_1, uri_1, amdX_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Workbench - TerminalUriLinkDetector', () => {
        const store = (0, utils_1.$bT)();
        let configurationService;
        let detector;
        let xterm;
        let validResources = [];
        let instantiationService;
        setup(async () => {
            instantiationService = store.add(new instantiationServiceMock_1.$L0b());
            configurationService = new testConfigurationService_1.$G0b();
            instantiationService.stub(configuration_1.$8h, configurationService);
            instantiationService.stub(files_1.$6j, {
                async stat(resource) {
                    if (!validResources.map(e => e.path).includes(resource.path)) {
                        throw new Error('Doesn\'t exist');
                    }
                    return (0, workbenchTestServices_1.$0dc)(resource);
                }
            });
            validResources = [];
            const TerminalCtor = (await (0, amdX_1.$aD)('xterm', 'lib/xterm.js')).Terminal;
            xterm = new TerminalCtor({ allowProposedApi: true, cols: 80, rows: 30 });
            detector = instantiationService.createInstance(terminalUriLinkDetector_1.$RWb, xterm, {
                initialCwd: '/parent/cwd',
                os: 3 /* OperatingSystem.Linux */,
                remoteAuthority: undefined,
                userHome: '/home',
                backend: undefined
            }, instantiationService.createInstance(terminalLinkResolver_1.$YWb));
        });
        teardown(() => {
            instantiationService.dispose();
        });
        async function assertLink(type, text, expected) {
            await (0, linkTestUtils_1.$7fc)(text, expected, detector, type);
        }
        const linkComputerCases = [
            ["Url" /* TerminalBuiltinLinkType.Url */, 'x = "http://foo.bar";', [{ range: [[6, 1], [19, 1]], uri: uri_1.URI.parse('http://foo.bar') }]],
            ["Url" /* TerminalBuiltinLinkType.Url */, 'x = (http://foo.bar);', [{ range: [[6, 1], [19, 1]], uri: uri_1.URI.parse('http://foo.bar') }]],
            ["Url" /* TerminalBuiltinLinkType.Url */, 'x = \'http://foo.bar\';', [{ range: [[6, 1], [19, 1]], uri: uri_1.URI.parse('http://foo.bar') }]],
            ["Url" /* TerminalBuiltinLinkType.Url */, 'x =  http://foo.bar ;', [{ range: [[6, 1], [19, 1]], uri: uri_1.URI.parse('http://foo.bar') }]],
            ["Url" /* TerminalBuiltinLinkType.Url */, 'x = <http://foo.bar>;', [{ range: [[6, 1], [19, 1]], uri: uri_1.URI.parse('http://foo.bar') }]],
            ["Url" /* TerminalBuiltinLinkType.Url */, 'x = {http://foo.bar};', [{ range: [[6, 1], [19, 1]], uri: uri_1.URI.parse('http://foo.bar') }]],
            ["Url" /* TerminalBuiltinLinkType.Url */, '(see http://foo.bar)', [{ range: [[6, 1], [19, 1]], uri: uri_1.URI.parse('http://foo.bar') }]],
            ["Url" /* TerminalBuiltinLinkType.Url */, '[see http://foo.bar]', [{ range: [[6, 1], [19, 1]], uri: uri_1.URI.parse('http://foo.bar') }]],
            ["Url" /* TerminalBuiltinLinkType.Url */, '{see http://foo.bar}', [{ range: [[6, 1], [19, 1]], uri: uri_1.URI.parse('http://foo.bar') }]],
            ["Url" /* TerminalBuiltinLinkType.Url */, '<see http://foo.bar>', [{ range: [[6, 1], [19, 1]], uri: uri_1.URI.parse('http://foo.bar') }]],
            ["Url" /* TerminalBuiltinLinkType.Url */, '<url>http://foo.bar</url>', [{ range: [[6, 1], [19, 1]], uri: uri_1.URI.parse('http://foo.bar') }]],
            ["Url" /* TerminalBuiltinLinkType.Url */, '// Click here to learn more. https://go.microsoft.com/fwlink/?LinkID=513275&clcid=0x409', [{ range: [[30, 1], [7, 2]], uri: uri_1.URI.parse('https://go.microsoft.com/fwlink/?LinkID=513275&clcid=0x409') }]],
            ["Url" /* TerminalBuiltinLinkType.Url */, '// Click here to learn more. https://msdn.microsoft.com/en-us/library/windows/desktop/aa365247(v=vs.85).aspx', [{ range: [[30, 1], [28, 2]], uri: uri_1.URI.parse('https://msdn.microsoft.com/en-us/library/windows/desktop/aa365247(v=vs.85).aspx') }]],
            ["Url" /* TerminalBuiltinLinkType.Url */, '// https://github.com/projectkudu/kudu/blob/master/Kudu.Core/Scripts/selectNodeVersion.js', [{ range: [[4, 1], [9, 2]], uri: uri_1.URI.parse('https://github.com/projectkudu/kudu/blob/master/Kudu.Core/Scripts/selectNodeVersion.js') }]],
            ["Url" /* TerminalBuiltinLinkType.Url */, '<!-- !!! Do not remove !!!   WebContentRef(link:https://go.microsoft.com/fwlink/?LinkId=166007, area:Admin, updated:2015, nextUpdate:2016, tags:SqlServer)   !!! Do not remove !!! -->', [{ range: [[49, 1], [14, 2]], uri: uri_1.URI.parse('https://go.microsoft.com/fwlink/?LinkId=166007') }]],
            ["Url" /* TerminalBuiltinLinkType.Url */, 'For instructions, see https://go.microsoft.com/fwlink/?LinkId=166007.</value>', [{ range: [[23, 1], [68, 1]], uri: uri_1.URI.parse('https://go.microsoft.com/fwlink/?LinkId=166007') }]],
            ["Url" /* TerminalBuiltinLinkType.Url */, 'For instructions, see https://msdn.microsoft.com/en-us/library/windows/desktop/aa365247(v=vs.85).aspx.</value>', [{ range: [[23, 1], [21, 2]], uri: uri_1.URI.parse('https://msdn.microsoft.com/en-us/library/windows/desktop/aa365247(v=vs.85).aspx') }]],
            ["Url" /* TerminalBuiltinLinkType.Url */, 'x = "https://en.wikipedia.org/wiki/Zürich";', [{ range: [[6, 1], [41, 1]], uri: uri_1.URI.parse('https://en.wikipedia.org/wiki/Zürich') }]],
            ["Url" /* TerminalBuiltinLinkType.Url */, '請參閱 http://go.microsoft.com/fwlink/?LinkId=761051。', [{ range: [[8, 1], [53, 1]], uri: uri_1.URI.parse('http://go.microsoft.com/fwlink/?LinkId=761051') }]],
            ["Url" /* TerminalBuiltinLinkType.Url */, '（請參閱 http://go.microsoft.com/fwlink/?LinkId=761051）', [{ range: [[10, 1], [55, 1]], uri: uri_1.URI.parse('http://go.microsoft.com/fwlink/?LinkId=761051') }]],
            ["LocalFile" /* TerminalBuiltinLinkType.LocalFile */, 'x = "file:///foo.bar";', [{ range: [[6, 1], [20, 1]], uri: uri_1.URI.parse('file:///foo.bar') }], uri_1.URI.parse('file:///foo.bar')],
            ["LocalFile" /* TerminalBuiltinLinkType.LocalFile */, 'x = "file://c:/foo.bar";', [{ range: [[6, 1], [22, 1]], uri: uri_1.URI.parse('file://c:/foo.bar') }], uri_1.URI.parse('file://c:/foo.bar')],
            ["LocalFile" /* TerminalBuiltinLinkType.LocalFile */, 'x = "file://shares/foo.bar";', [{ range: [[6, 1], [26, 1]], uri: uri_1.URI.parse('file://shares/foo.bar') }], uri_1.URI.parse('file://shares/foo.bar')],
            ["LocalFile" /* TerminalBuiltinLinkType.LocalFile */, 'x = "file://shäres/foo.bar";', [{ range: [[6, 1], [26, 1]], uri: uri_1.URI.parse('file://shäres/foo.bar') }], uri_1.URI.parse('file://shäres/foo.bar')],
            ["Url" /* TerminalBuiltinLinkType.Url */, 'Some text, then http://www.bing.com.', [{ range: [[17, 1], [35, 1]], uri: uri_1.URI.parse('http://www.bing.com') }]],
            ["Url" /* TerminalBuiltinLinkType.Url */, 'let url = `http://***/_api/web/lists/GetByTitle(\'Teambuildingaanvragen\')/items`;', [{ range: [[12, 1], [78, 1]], uri: uri_1.URI.parse('http://***/_api/web/lists/GetByTitle(\'Teambuildingaanvragen\')/items') }]],
            ["Url" /* TerminalBuiltinLinkType.Url */, '7. At this point, ServiceMain has been called.  There is no functionality presently in ServiceMain, but you can consult the [MSDN documentation](https://msdn.microsoft.com/en-us/library/windows/desktop/ms687414(v=vs.85).aspx) to add functionality as desired!', [{ range: [[66, 2], [64, 3]], uri: uri_1.URI.parse('https://msdn.microsoft.com/en-us/library/windows/desktop/ms687414(v=vs.85).aspx') }]],
            ["Url" /* TerminalBuiltinLinkType.Url */, 'let x = "http://[::1]:5000/connect/token"', [{ range: [[10, 1], [40, 1]], uri: uri_1.URI.parse('http://[::1]:5000/connect/token') }]],
            ["Url" /* TerminalBuiltinLinkType.Url */, '2. Navigate to **https://portal.azure.com**', [{ range: [[18, 1], [41, 1]], uri: uri_1.URI.parse('https://portal.azure.com') }]],
            ["Url" /* TerminalBuiltinLinkType.Url */, 'POST|https://portal.azure.com|2019-12-05|', [{ range: [[6, 1], [29, 1]], uri: uri_1.URI.parse('https://portal.azure.com') }]],
            ["Url" /* TerminalBuiltinLinkType.Url */, 'aa  https://foo.bar/[this is foo site]  aa', [{ range: [[5, 1], [38, 1]], uri: uri_1.URI.parse('https://foo.bar/[this is foo site]') }]]
        ];
        for (const c of linkComputerCases) {
            test('link computer case: `' + c[1] + '`', async () => {
                validResources = c[3] ? [c[3]] : [];
                await assertLink(c[0], c[1], c[2]);
            });
        }
        test('should support multiple link results', async () => {
            await assertLink("Url" /* TerminalBuiltinLinkType.Url */, 'http://foo.bar http://bar.foo', [
                { range: [[1, 1], [14, 1]], uri: uri_1.URI.parse('http://foo.bar') },
                { range: [[16, 1], [29, 1]], uri: uri_1.URI.parse('http://bar.foo') }
            ]);
        });
        test('should detect file:// links with :line suffix', async () => {
            validResources = [uri_1.URI.file('c:/folder/file')];
            await assertLink("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, 'file:///c:/folder/file:23', [
                { range: [[1, 1], [25, 1]], uri: uri_1.URI.parse('file:///c:/folder/file') }
            ]);
        });
        test('should detect file:// links with :line:col suffix', async () => {
            validResources = [uri_1.URI.file('c:/folder/file')];
            await assertLink("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, 'file:///c:/folder/file:23:10', [
                { range: [[1, 1], [28, 1]], uri: uri_1.URI.parse('file:///c:/folder/file') }
            ]);
        });
        test('should filter out https:// link that exceed 4096 characters', async () => {
            // 8 + 200 * 10 = 2008 characters
            await assertLink("Url" /* TerminalBuiltinLinkType.Url */, `https://${'foobarbaz/'.repeat(200)}`, [{
                    range: [[1, 1], [8, 26]],
                    uri: uri_1.URI.parse(`https://${'foobarbaz/'.repeat(200)}`)
                }]);
            // 8 + 450 * 10 = 4508 characters
            await assertLink("Url" /* TerminalBuiltinLinkType.Url */, `https://${'foobarbaz/'.repeat(450)}`, []);
        });
        test('should filter out file:// links that exceed 4096 characters', async () => {
            // 8 + 200 * 10 = 2008 characters
            validResources = [uri_1.URI.file(`/${'foobarbaz/'.repeat(200)}`)];
            await assertLink("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, `file:///${'foobarbaz/'.repeat(200)}`, [{
                    uri: uri_1.URI.parse(`file:///${'foobarbaz/'.repeat(200)}`),
                    range: [[1, 1], [8, 26]]
                }]);
            // 8 + 450 * 10 = 4508 characters
            validResources = [uri_1.URI.file(`/${'foobarbaz/'.repeat(450)}`)];
            await assertLink("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, `file:///${'foobarbaz/'.repeat(450)}`, []);
        });
    });
});
//# sourceMappingURL=terminalUriLinkDetector.test.js.map