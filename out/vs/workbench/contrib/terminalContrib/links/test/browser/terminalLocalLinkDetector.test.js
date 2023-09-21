/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/base/common/strings", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/workbench/contrib/terminalContrib/links/browser/terminalLocalLinkDetector", "vs/platform/terminal/common/capabilities/terminalCapabilityStore", "vs/workbench/contrib/terminalContrib/links/test/browser/linkTestUtils", "vs/base/common/async", "assert", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkResolver", "vs/platform/files/common/files", "vs/workbench/test/common/workbenchTestServices", "vs/base/common/uri", "vs/platform/log/common/log", "vs/platform/terminal/common/terminal", "vs/amdX", "vs/base/test/common/utils"], function (require, exports, platform_1, strings_1, configuration_1, testConfigurationService_1, instantiationServiceMock_1, terminalLocalLinkDetector_1, terminalCapabilityStore_1, linkTestUtils_1, async_1, assert_1, terminalLinkResolver_1, files_1, workbenchTestServices_1, uri_1, log_1, terminal_1, amdX_1, utils_1) {
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
        { urlFormat: '{0}' },
        { urlFormat: '{0}" on line {1}', line: '5' },
        { urlFormat: '{0}" on line {1}, column {2}', line: '5', column: '3' },
        { urlFormat: '{0}":line {1}', line: '5' },
        { urlFormat: '{0}":line {1}, column {2}', line: '5', column: '3' },
        { urlFormat: '{0}": line {1}', line: '5' },
        { urlFormat: '{0}": line {1}, col {2}', line: '5', column: '3' },
        { urlFormat: '{0}({1})', line: '5' },
        { urlFormat: '{0} ({1})', line: '5' },
        { urlFormat: '{0}({1},{2})', line: '5', column: '3' },
        { urlFormat: '{0} ({1},{2})', line: '5', column: '3' },
        { urlFormat: '{0}: ({1},{2})', line: '5', column: '3' },
        { urlFormat: '{0}({1}, {2})', line: '5', column: '3' },
        { urlFormat: '{0} ({1}, {2})', line: '5', column: '3' },
        { urlFormat: '{0}: ({1}, {2})', line: '5', column: '3' },
        { urlFormat: '{0}:{1}', line: '5' },
        { urlFormat: '{0}:{1}:{2}', line: '5', column: '3' },
        { urlFormat: '{0} {1}:{2}', line: '5', column: '3' },
        { urlFormat: '{0}[{1}]', line: '5' },
        { urlFormat: '{0} [{1}]', line: '5' },
        { urlFormat: '{0}[{1},{2}]', line: '5', column: '3' },
        { urlFormat: '{0} [{1},{2}]', line: '5', column: '3' },
        { urlFormat: '{0}: [{1},{2}]', line: '5', column: '3' },
        { urlFormat: '{0}[{1}, {2}]', line: '5', column: '3' },
        { urlFormat: '{0} [{1}, {2}]', line: '5', column: '3' },
        { urlFormat: '{0}: [{1}, {2}]', line: '5', column: '3' },
        { urlFormat: '{0}",{1}', line: '5' },
        { urlFormat: '{0}\',{1}', line: '5' }
    ];
    const windowsFallbackLinks = [
        'C:\\foo bar',
        'C:\\foo bar\\baz',
        'C:\\foo\\bar baz',
        'C:\\foo/bar baz'
    ];
    const supportedFallbackLinkFormats = [
        // Python style error: File "<path>", line <line>
        { urlFormat: 'File "{0}"', linkCellStartOffset: 5 },
        { urlFormat: 'File "{0}", line {1}', line: '5', linkCellStartOffset: 5 },
        // Some C++ compile error formats
        { urlFormat: '{0}({1}) :', line: '5', linkCellEndOffset: -2 },
        { urlFormat: '{0}({1},{2}) :', line: '5', column: '3', linkCellEndOffset: -2 },
        { urlFormat: '{0}({1}, {2}) :', line: '5', column: '3', linkCellEndOffset: -2 },
        { urlFormat: '{0}({1}):', line: '5', linkCellEndOffset: -1 },
        { urlFormat: '{0}({1},{2}):', line: '5', column: '3', linkCellEndOffset: -1 },
        { urlFormat: '{0}({1}, {2}):', line: '5', column: '3', linkCellEndOffset: -1 },
        { urlFormat: '{0}:{1} :', line: '5', linkCellEndOffset: -2 },
        { urlFormat: '{0}:{1}:{2} :', line: '5', column: '3', linkCellEndOffset: -2 },
        { urlFormat: '{0}:{1}:', line: '5', linkCellEndOffset: -1 },
        { urlFormat: '{0}:{1}:{2}:', line: '5', column: '3', linkCellEndOffset: -1 },
        // Cmd prompt
        { urlFormat: '{0}>', linkCellEndOffset: -1 },
        // The whole line is the path
        { urlFormat: '{0}' },
    ];
    suite('Workbench - TerminalLocalLinkDetector', () => {
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
        async function assertLinksWithWrapped(link, resource) {
            const uri = resource ?? uri_1.URI.file(link);
            await assertLinks("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, link, [{ uri, range: [[1, 1], [link.length, 1]] }]);
            await assertLinks("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, ` ${link} `, [{ uri, range: [[2, 1], [link.length + 1, 1]] }]);
            await assertLinks("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, `(${link})`, [{ uri, range: [[2, 1], [link.length + 1, 1]] }]);
            await assertLinks("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, `[${link}]`, [{ uri, range: [[2, 1], [link.length + 1, 1]] }]);
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
        suite('platform independent', () => {
            setup(() => {
                detector = instantiationService.createInstance(terminalLocalLinkDetector_1.TerminalLocalLinkDetector, xterm, store.add(new terminalCapabilityStore_1.TerminalCapabilityStore()), {
                    initialCwd: '/parent/cwd',
                    os: 3 /* OperatingSystem.Linux */,
                    remoteAuthority: undefined,
                    userHome: '/home',
                    backend: undefined
                }, resolver);
            });
            test('should support multiple link results', async () => {
                validResources = [
                    uri_1.URI.file('/parent/cwd/foo'),
                    uri_1.URI.file('/parent/cwd/bar')
                ];
                await assertLinks("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, './foo ./bar', [
                    { range: [[1, 1], [5, 1]], uri: uri_1.URI.file('/parent/cwd/foo') },
                    { range: [[7, 1], [11, 1]], uri: uri_1.URI.file('/parent/cwd/bar') }
                ]);
            });
            test('should support trimming extra quotes', async () => {
                validResources = [uri_1.URI.file('/parent/cwd/foo')];
                await assertLinks("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, '"foo"" on line 5', [
                    { range: [[1, 1], [16, 1]], uri: uri_1.URI.file('/parent/cwd/foo') }
                ]);
            });
            test('should support trimming extra square brackets', async () => {
                validResources = [uri_1.URI.file('/parent/cwd/foo')];
                await assertLinks("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, '"foo]" on line 5', [
                    { range: [[1, 1], [16, 1]], uri: uri_1.URI.file('/parent/cwd/foo') }
                ]);
            });
        });
        suite('macOS/Linux', () => {
            setup(() => {
                detector = instantiationService.createInstance(terminalLocalLinkDetector_1.TerminalLocalLinkDetector, xterm, store.add(new terminalCapabilityStore_1.TerminalCapabilityStore()), {
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
                        test(`should detect in "${formattedLink}"`, async () => {
                            validResources = [resource];
                            await assertLinksWithWrapped(formattedLink, resource);
                        });
                    }
                });
            }
            test('Git diff links', async () => {
                validResources = [uri_1.URI.file('/parent/cwd/foo/bar')];
                await assertLinks("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, `diff --git a/foo/bar b/foo/bar`, [
                    { uri: validResources[0], range: [[14, 1], [20, 1]] },
                    { uri: validResources[0], range: [[24, 1], [30, 1]] }
                ]);
                await assertLinks("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, `--- a/foo/bar`, [{ uri: validResources[0], range: [[7, 1], [13, 1]] }]);
                await assertLinks("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, `+++ b/foo/bar`, [{ uri: validResources[0], range: [[7, 1], [13, 1]] }]);
            });
        });
        // Only test these when on Windows because there is special behavior around replacing separators
        // in URI that cannot be changed
        if (platform_1.isWindows) {
            suite('Windows', () => {
                const wslUnixToWindowsPathMap = new Map();
                setup(() => {
                    detector = instantiationService.createInstance(terminalLocalLinkDetector_1.TerminalLocalLinkDetector, xterm, store.add(new terminalCapabilityStore_1.TerminalCapabilityStore()), {
                        initialCwd: 'C:\\Parent\\Cwd',
                        os: 1 /* OperatingSystem.Windows */,
                        remoteAuthority: undefined,
                        userHome: 'C:\\Home',
                        backend: {
                            async getWslPath(original, direction) {
                                if (direction === 'unix-to-win') {
                                    return wslUnixToWindowsPathMap.get(original) ?? original;
                                }
                                return original;
                            },
                        }
                    }, resolver);
                    wslUnixToWindowsPathMap.clear();
                });
                for (const l of windowsLinks) {
                    const baseLink = typeof l === 'string' ? l : l.link;
                    const resource = typeof l === 'string' ? uri_1.URI.file(l) : l.resource;
                    suite(`Link "${baseLink}"`, () => {
                        for (let i = 0; i < supportedLinkFormats.length; i++) {
                            const linkFormat = supportedLinkFormats[i];
                            const formattedLink = (0, strings_1.format)(linkFormat.urlFormat, baseLink, linkFormat.line, linkFormat.column);
                            test(`should detect in "${formattedLink}"`, async () => {
                                validResources = [resource];
                                await assertLinksWithWrapped(formattedLink, resource);
                            });
                        }
                    });
                }
                for (const l of windowsFallbackLinks) {
                    const baseLink = typeof l === 'string' ? l : l.link;
                    const resource = typeof l === 'string' ? uri_1.URI.file(l) : l.resource;
                    suite(`Fallback link "${baseLink}"`, () => {
                        for (let i = 0; i < supportedFallbackLinkFormats.length; i++) {
                            const linkFormat = supportedFallbackLinkFormats[i];
                            const formattedLink = (0, strings_1.format)(linkFormat.urlFormat, baseLink, linkFormat.line, linkFormat.column);
                            const linkCellStartOffset = linkFormat.linkCellStartOffset ?? 0;
                            const linkCellEndOffset = linkFormat.linkCellEndOffset ?? 0;
                            test(`should detect in "${formattedLink}"`, async () => {
                                validResources = [resource];
                                await assertLinks("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, formattedLink, [{ uri: resource, range: [[1 + linkCellStartOffset, 1], [formattedLink.length + linkCellEndOffset, 1]] }]);
                            });
                        }
                    });
                }
                test('Git diff links', async () => {
                    const resource = uri_1.URI.file('C:\\Parent\\Cwd\\foo\\bar');
                    validResources = [resource];
                    await assertLinks("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, `diff --git a/foo/bar b/foo/bar`, [
                        { uri: resource, range: [[14, 1], [20, 1]] },
                        { uri: resource, range: [[24, 1], [30, 1]] }
                    ]);
                    await assertLinks("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, `--- a/foo/bar`, [{ uri: resource, range: [[7, 1], [13, 1]] }]);
                    await assertLinks("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, `+++ b/foo/bar`, [{ uri: resource, range: [[7, 1], [13, 1]] }]);
                });
                suite('WSL', () => {
                    test('Unix -> Windows /mnt/ style links', async () => {
                        wslUnixToWindowsPathMap.set('/mnt/c/foo/bar', 'C:\\foo\\bar');
                        validResources = [uri_1.URI.file('C:\\foo\\bar')];
                        await assertLinksWithWrapped('/mnt/c/foo/bar', validResources[0]);
                    });
                    test('Windows -> Unix \\\\wsl$\\ style links', async () => {
                        validResources = [uri_1.URI.file('\\\\wsl$\\Debian\\home\\foo\\bar')];
                        await assertLinksWithWrapped('\\\\wsl$\\Debian\\home\\foo\\bar');
                    });
                    test('Windows -> Unix \\\\wsl.localhost\\ style links', async () => {
                        validResources = [uri_1.URI.file('\\\\wsl.localhost\\Debian\\home\\foo\\bar')];
                        await assertLinksWithWrapped('\\\\wsl.localhost\\Debian\\home\\foo\\bar');
                    });
                });
            });
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxMb2NhbExpbmtEZXRlY3Rvci50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWxDb250cmliL2xpbmtzL3Rlc3QvYnJvd3Nlci90ZXJtaW5hbExvY2FsTGlua0RldGVjdG9yLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUF1QmhHLE1BQU0sU0FBUyxHQUFpRDtRQUMvRCxXQUFXO1FBQ1gsTUFBTTtRQUNOLFVBQVU7UUFDVixZQUFZO1FBQ1osZ0JBQWdCO1FBQ2hCLGdCQUFnQjtRQUNoQixlQUFlO1FBQ2YsWUFBWTtRQUNaLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsU0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRTtRQUNsRCxXQUFXO1FBQ1gsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFHLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEVBQUU7UUFDeEQsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxTQUFHLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUU7UUFDMUQsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxTQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFO1FBQ3JELEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsU0FBRyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFO1FBQzlELEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsU0FBRyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxFQUFFO0tBQ3hFLENBQUM7SUFFRixNQUFNLFlBQVksR0FBaUQ7UUFDbEUsV0FBVztRQUNYLFNBQVM7UUFDVCxFQUFFLElBQUksRUFB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