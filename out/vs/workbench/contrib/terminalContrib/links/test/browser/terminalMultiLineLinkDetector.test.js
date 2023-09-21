/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/base/common/strings", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/workbench/contrib/terminalContrib/links/test/browser/linkTestUtils", "vs/base/common/async", "assert", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkResolver", "vs/platform/files/common/files", "vs/workbench/test/common/workbenchTestServices", "vs/base/common/uri", "vs/platform/log/common/log", "vs/platform/terminal/common/terminal", "vs/workbench/contrib/terminalContrib/links/browser/terminalMultiLineLinkDetector", "vs/amdX", "vs/base/test/common/utils"], function (require, exports, platform_1, strings_1, configuration_1, testConfigurationService_1, instantiationServiceMock_1, linkTestUtils_1, async_1, assert_1, terminalLinkResolver_1, files_1, workbenchTestServices_1, uri_1, log_1, terminal_1, terminalMultiLineLinkDetector_1, amdX_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const unixLinks = [
        // Absolute
        '/foo',
        '/foo/bar',
        '/foo/[bar]',
        '/foo/[bar].baz',
        '/foo/[bar]/baz',
        '/foo/bar+more',
        // User home
        { link: '~/foo', resource: uri_1.URI.file('/home/foo') },
        // Relative
        { link: './foo', resource: uri_1.URI.file('/parent/cwd/foo') },
        { link: './$foo', resource: uri_1.URI.file('/parent/cwd/$foo') },
        { link: '../foo', resource: uri_1.URI.file('/parent/foo') },
        { link: 'foo/bar', resource: uri_1.URI.file('/parent/cwd/foo/bar') },
        { link: 'foo/bar+more', resource: uri_1.URI.file('/parent/cwd/foo/bar+more') },
    ];
    const windowsLinks = [
        // Absolute
        'c:\\foo',
        { link: '\\\\?\\C:\\foo', resource: uri_1.URI.file('C:\\foo') },
        'c:/foo',
        'c:/foo/bar',
        'c:\\foo\\bar',
        'c:\\foo\\bar+more',
        'c:\\foo/bar\\baz',
        // User home
        { link: '~\\foo', resource: uri_1.URI.file('C:\\Home\\foo') },
        { link: '~/foo', resource: uri_1.URI.file('C:\\Home\\foo') },
        // Relative
        { link: '.\\foo', resource: uri_1.URI.file('C:\\Parent\\Cwd\\foo') },
        { link: './foo', resource: uri_1.URI.file('C:\\Parent\\Cwd\\foo') },
        { link: './$foo', resource: uri_1.URI.file('C:\\Parent\\Cwd\\$foo') },
        { link: '..\\foo', resource: uri_1.URI.file('C:\\Parent\\foo') },
        { link: 'foo/bar', resource: uri_1.URI.file('C:\\Parent\\Cwd\\foo\\bar') },
        { link: 'foo/bar', resource: uri_1.URI.file('C:\\Parent\\Cwd\\foo\\bar') },
        { link: 'foo/[bar]', resource: uri_1.URI.file('C:\\Parent\\Cwd\\foo\\[bar]') },
        { link: 'foo/[bar].baz', resource: uri_1.URI.file('C:\\Parent\\Cwd\\foo\\[bar].baz') },
        { link: 'foo/[bar]/baz', resource: uri_1.URI.file('C:\\Parent\\Cwd\\foo\\[bar]/baz') },
        { link: 'foo\\bar', resource: uri_1.URI.file('C:\\Parent\\Cwd\\foo\\bar') },
        { link: 'foo\\[bar].baz', resource: uri_1.URI.file('C:\\Parent\\Cwd\\foo\\[bar].baz') },
        { link: 'foo\\[bar]\\baz', resource: uri_1.URI.file('C:\\Parent\\Cwd\\foo\\[bar]\\baz') },
        { link: 'foo\\bar+more', resource: uri_1.URI.file('C:\\Parent\\Cwd\\foo\\bar+more') },
    ];
    const supportedLinkFormats = [
        // 5: file content...                         [#181837]
        //   5:3  error                               [#181837]
        { urlFormat: '{0}\r\n{1}:foo', line: '5' },
        { urlFormat: '{0}\r\n{1}: foo', line: '5' },
        { urlFormat: '{0}\r\n5:another link\r\n{1}:{2} foo', line: '5', column: '3' },
        { urlFormat: '{0}\r\n  {1}:{2} foo', line: '5', column: '3' },
        { urlFormat: '{0}\r\n  5:6  error  another one\r\n  {1}:{2}  error', line: '5', column: '3' },
        { urlFormat: `{0}\r\n  5:6  error  ${'a'.repeat(80)}\r\n  {1}:{2}  error`, line: '5', column: '3' },
        // @@ ... <to-file-range> @@ content...       [#182878]   (tests check the entire line, so they don't include the line content at the end of the last @@)
        { urlFormat: '+++ b/{0}\r\n@@ -7,6 +{1},7 @@', line: '5' },
        { urlFormat: '+++ b/{0}\r\n@@ -1,1 +1,1 @@\r\nfoo\r\nbar\r\n@@ -7,6 +{1},7 @@', line: '5' },
    ];
    suite('Workbench - TerminalMultiLineLinkDetector', () => {
        const store = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        let instantiationService;
        let configurationService;
        let detector;
        let resolver;
        let xterm;
        let validResources;
        async function assertLinks(type, text, expected) {
            let to;
            const race = await Promise.race([
                (0, linkTestUtils_1.assertLinkHelper)(text, expected, detector, type).then(() => 'success'),
                (to = (0, async_1.timeout)(2)).then(() => 'timeout')
            ]);
            (0, assert_1.strictEqual)(race, 'success', `Awaiting link assertion for "${text}" timed out`);
            to.cancel();
        }
        async function assertLinksMain(link, resource) {
            const uri = resource ?? uri_1.URI.file(link);
            const lines = link.split('\r\n');
            const lastLine = lines.at(-1);
            // Count lines, accounting for wrapping
            let lineCount = 0;
            for (const line of lines) {
                lineCount += Math.max(Math.ceil(line.length / 80), 1);
            }
            await assertLinks("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, link, [{ uri, range: [[1, lineCount], [lastLine.length, lineCount]] }]);
        }
        setup(async () => {
            instantiationService = store.add(new instantiationServiceMock_1.TestInstantiationService());
            configurationService = new testConfigurationService_1.TestConfigurationService();
            instantiationService.stub(configuration_1.IConfigurationService, configurationService);
            instantiationService.stub(files_1.IFileService, {
                async stat(resource) {
                    if (!validResources.map(e => e.path).includes(resource.path)) {
                        throw new Error('Doesn\'t exist');
                    }
                    return (0, workbenchTestServices_1.createFileStat)(resource);
                }
            });
            instantiationService.stub(terminal_1.ITerminalLogService, new log_1.NullLogService());
            resolver = instantiationService.createInstance(terminalLinkResolver_1.TerminalLinkResolver);
            validResources = [];
            const TerminalCtor = (await (0, amdX_1.importAMDNodeModule)('xterm', 'lib/xterm.js')).Terminal;
            xterm = new TerminalCtor({ allowProposedApi: true, cols: 80, rows: 30 });
        });
        suite('macOS/Linux', () => {
            setup(() => {
                detector = instantiationService.createInstance(terminalMultiLineLinkDetector_1.TerminalMultiLineLinkDetector, xterm, {
                    initialCwd: '/parent/cwd',
                    os: 3 /* OperatingSystem.Linux */,
                    remoteAuthority: undefined,
                    userHome: '/home',
                    backend: undefined
                }, resolver);
            });
            for (const l of unixLinks) {
                const baseLink = typeof l === 'string' ? l : l.link;
                const resource = typeof l === 'string' ? uri_1.URI.file(l) : l.resource;
                suite(`Link: ${baseLink}`, () => {
                    for (let i = 0; i < supportedLinkFormats.length; i++) {
                        const linkFormat = supportedLinkFormats[i];
                        const formattedLink = (0, strings_1.format)(linkFormat.urlFormat, baseLink, linkFormat.line, linkFormat.column);
                        test(`should detect in "${escapeMultilineTestName(formattedLink)}"`, async () => {
                            validResources = [resource];
                            await assertLinksMain(formattedLink, resource);
                        });
                    }
                });
            }
        });
        // Only test these when on Windows because there is special behavior around replacing separators
        // in URI that cannot be changed
        if (platform_1.isWindows) {
            suite('Windows', () => {
                setup(() => {
                    detector = instantiationService.createInstance(terminalMultiLineLinkDetector_1.TerminalMultiLineLinkDetector, xterm, {
                        initialCwd: 'C:\\Parent\\Cwd',
                        os: 1 /* OperatingSystem.Windows */,
                        remoteAuthority: undefined,
                        userHome: 'C:\\Home',
                    }, resolver);
                });
                for (const l of windowsLinks) {
                    const baseLink = typeof l === 'string' ? l : l.link;
                    const resource = typeof l === 'string' ? uri_1.URI.file(l) : l.resource;
                    suite(`Link "${baseLink}"`, () => {
                        for (let i = 0; i < supportedLinkFormats.length; i++) {
                            const linkFormat = supportedLinkFormats[i];
                            const formattedLink = (0, strings_1.format)(linkFormat.urlFormat, baseLink, linkFormat.line, linkFormat.column);
                            test(`should detect in "${escapeMultilineTestName(formattedLink)}"`, async () => {
                                validResources = [resource];
                                await assertLinksMain(formattedLink, resource);
                            });
                        }
                    });
                }
            });
        }
    });
    function escapeMultilineTestName(text) {
        return text.replaceAll('\r\n', '\\r\\n');
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxNdWx0aUxpbmVMaW5rRGV0ZWN0b3IudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsQ29udHJpYi9saW5rcy90ZXN0L2Jyb3dzZXIvdGVybWluYWxNdWx0aUxpbmVMaW5rRGV0ZWN0b3IudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQXNCaEcsTUFBTSxTQUFTLEdBQWlEO1FBQy9ELFdBQVc7UUFDWCxNQUFNO1FBQ04sVUFBVTtRQUNWLFlBQVk7UUFDWixnQkFBZ0I7UUFDaEIsZ0JBQWdCO1FBQ2hCLGVBQWU7UUFDZixZQUFZO1FBQ1osRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1FBQ2xELFdBQVc7UUFDWCxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsRUFBRTtRQUN4RCxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRTtRQUMxRCxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUU7UUFDckQsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxTQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEVBQUU7UUFDOUQsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxTQUFHLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEVBQUU7S0FDeEUsQ0FBQztJQUVGLE1BQU0sWUFBWSxHQUFpRDtRQUNsRSxXQUFXO1FBQ1gsU0FBUztRQUNULEVBQUUs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