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
        const store = (0, utils_1.$bT)();
        let instantiationService;
        let configurationService;
        let detector;
        let resolver;
        let xterm;
        let validResources;
        async function assertLinks(type, text, expected) {
            let to;
            const race = await Promise.race([
                (0, linkTestUtils_1.$7fc)(text, expected, detector, type).then(() => 'success'),
                (to = (0, async_1.$Hg)(2)).then(() => 'timeout')
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
            instantiationService.stub(terminal_1.$Zq, new log_1.$fj());
            resolver = instantiationService.createInstance(terminalLinkResolver_1.$YWb);
            validResources = [];
            const TerminalCtor = (await (0, amdX_1.$aD)('xterm', 'lib/xterm.js')).Terminal;
            xterm = new TerminalCtor({ allowProposedApi: true, cols: 80, rows: 30 });
        });
        suite('platform independent', () => {
            setup(() => {
                detector = instantiationService.createInstance(terminalLocalLinkDetector_1.$QWb, xterm, store.add(new terminalCapabilityStore_1.$eib()), {
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
                detector = instantiationService.createInstance(terminalLocalLinkDetector_1.$QWb, xterm, store.add(new terminalCapabilityStore_1.$eib()), {
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
                        const formattedLink = (0, strings_1.$ne)(linkFormat.urlFormat, baseLink, linkFormat.line, linkFormat.column);
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
        if (platform_1.$i) {
            suite('Windows', () => {
                const wslUnixToWindowsPathMap = new Map();
                setup(() => {
                    detector = instantiationService.createInstance(terminalLocalLinkDetector_1.$QWb, xterm, store.add(new terminalCapabilityStore_1.$eib()), {
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
                            const formattedLink = (0, strings_1.$ne)(linkFormat.urlFormat, baseLink, linkFormat.line, linkFormat.column);
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
                            const formattedLink = (0, strings_1.$ne)(linkFormat.urlFormat, baseLink, linkFormat.line, linkFormat.column);
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
//# sourceMappingURL=terminalLocalLinkDetector.test.js.map