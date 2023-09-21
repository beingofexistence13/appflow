/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/network", "vs/base/common/uri", "vs/platform/files/common/files", "vs/platform/files/common/fileService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/log/common/log", "vs/platform/quickinput/common/quickInput", "vs/platform/workspace/common/workspace", "vs/platform/terminal/common/capabilities/commandDetectionCapability", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkOpeners", "vs/platform/terminal/common/capabilities/terminalCapabilityStore", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/test/common/workbenchTestServices", "vs/workbench/services/search/common/search", "vs/workbench/services/search/common/searchService", "vs/platform/terminal/common/terminal", "vs/amdX", "vs/base/test/common/utils"], function (require, exports, assert_1, network_1, uri_1, files_1, fileService_1, instantiationServiceMock_1, log_1, quickInput_1, workspace_1, commandDetectionCapability_1, terminalLinkOpeners_1, terminalCapabilityStore_1, editorService_1, environmentService_1, workbenchTestServices_1, search_1, searchService_1, terminal_1, amdX_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TestCommandDetectionCapability extends commandDetectionCapability_1.$Tq {
        setCommands(commands) {
            this.f = commands;
        }
    }
    class TestFileService extends fileService_1.$Dp {
        constructor() {
            super(...arguments);
            this.sb = '*';
        }
        async stat(resource) {
            if (this.sb === '*' || this.sb.some(e => e.toString() === resource.toString())) {
                return { isFile: true, isDirectory: false, isSymbolicLink: false };
            }
            throw new Error('ENOENT');
        }
        setFiles(files) {
            this.sb = files;
        }
    }
    class TestSearchService extends searchService_1.$d3b {
        async fileSearch(query) {
            return this.J;
        }
        setSearchResult(result) {
            this.J = result;
        }
    }
    class TestTerminalSearchLinkOpener extends terminalLinkOpeners_1.$OWb {
        setFileQueryBuilder(value) {
            this.a = value;
        }
    }
    suite('Workbench - TerminalLinkOpeners', () => {
        const store = (0, utils_1.$bT)();
        let instantiationService;
        let fileService;
        let searchService;
        let activationResult;
        let xterm;
        setup(async () => {
            instantiationService = store.add(new instantiationServiceMock_1.$L0b());
            fileService = store.add(new TestFileService(new log_1.$fj()));
            searchService = store.add(new TestSearchService(null, null, null, null, null, null, null));
            instantiationService.set(files_1.$6j, fileService);
            instantiationService.set(log_1.$5i, new log_1.$fj());
            instantiationService.set(search_1.$oI, searchService);
            instantiationService.set(workspace_1.$Kh, new workbenchTestServices_1.$6dc());
            instantiationService.stub(terminal_1.$Zq, new log_1.$fj());
            instantiationService.stub(environmentService_1.$hJ, {
                remoteAuthority: undefined
            });
            // Allow intercepting link activations
            activationResult = undefined;
            instantiationService.stub(quickInput_1.$Gq, {
                quickAccess: {
                    show(link) {
                        activationResult = { link, source: 'search' };
                    }
                }
            });
            instantiationService.stub(editorService_1.$9C, {
                async openEditor(editor) {
                    activationResult = {
                        source: 'editor',
                        link: editor.resource?.toString()
                    };
                    // Only assert on selection if it's not the default value
                    if (editor.options?.selection && (editor.options.selection.startColumn !== 1 || editor.options.selection.startLineNumber !== 1)) {
                        activationResult.selection = editor.options.selection;
                    }
                }
            });
            const TerminalCtor = (await (0, amdX_1.$aD)('xterm', 'lib/xterm.js')).Terminal;
            xterm = store.add(new TerminalCtor({ allowProposedApi: true }));
        });
        suite('TerminalSearchLinkOpener', () => {
            let opener;
            let capabilities;
            let commandDetection;
            let localFileOpener;
            setup(() => {
                capabilities = store.add(new terminalCapabilityStore_1.$eib());
                commandDetection = store.add(instantiationService.createInstance(TestCommandDetectionCapability, xterm));
                capabilities.add(2 /* TerminalCapability.CommandDetection */, commandDetection);
            });
            test('should open single exact match against cwd when searching if it exists when command detection cwd is available', async () => {
                localFileOpener = instantiationService.createInstance(terminalLinkOpeners_1.$LWb);
                const localFolderOpener = instantiationService.createInstance(terminalLinkOpeners_1.$MWb);
                opener = instantiationService.createInstance(TestTerminalSearchLinkOpener, capabilities, '/initial/cwd', localFileOpener, localFolderOpener, () => 3 /* OperatingSystem.Linux */);
                // Set a fake detected command starting as line 0 to establish the cwd
                commandDetection.setCommands([{
                        command: '',
                        exitCode: 0,
                        commandStartLineContent: '',
                        markProperties: {},
                        isTrusted: true,
                        cwd: '/initial/cwd',
                        timestamp: 0,
                        getOutput() { return undefined; },
                        getOutputMatch(outputMatcher) { return undefined; },
                        marker: {
                            line: 0
                        },
                        hasOutput() { return true; }
                    }]);
                fileService.setFiles([
                    uri_1.URI.from({ scheme: network_1.Schemas.file, path: '/initial/cwd/foo/bar.txt' }),
                    uri_1.URI.from({ scheme: network_1.Schemas.file, path: '/initial/cwd/foo2/bar.txt' })
                ]);
                await opener.open({
                    text: 'foo/bar.txt',
                    bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
                    type: "Search" /* TerminalBuiltinLinkType.Search */
                });
                (0, assert_1.deepStrictEqual)(activationResult, {
                    link: 'file:///initial/cwd/foo/bar.txt',
                    source: 'editor'
                });
            });
            test('should open single exact match against cwd for paths containing a separator when searching if it exists, even when command detection isn\'t available', async () => {
                localFileOpener = instantiationService.createInstance(terminalLinkOpeners_1.$LWb);
                const localFolderOpener = instantiationService.createInstance(terminalLinkOpeners_1.$MWb);
                opener = instantiationService.createInstance(TestTerminalSearchLinkOpener, capabilities, '/initial/cwd', localFileOpener, localFolderOpener, () => 3 /* OperatingSystem.Linux */);
                fileService.setFiles([
                    uri_1.URI.from({ scheme: network_1.Schemas.file, path: '/initial/cwd/foo/bar.txt' }),
                    uri_1.URI.from({ scheme: network_1.Schemas.file, path: '/initial/cwd/foo2/bar.txt' })
                ]);
                await opener.open({
                    text: 'foo/bar.txt',
                    bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
                    type: "Search" /* TerminalBuiltinLinkType.Search */
                });
                (0, assert_1.deepStrictEqual)(activationResult, {
                    link: 'file:///initial/cwd/foo/bar.txt',
                    source: 'editor'
                });
            });
            test('should open single exact match against any folder for paths not containing a separator when there is a single search result, even when command detection isn\'t available', async () => {
                localFileOpener = instantiationService.createInstance(terminalLinkOpeners_1.$LWb);
                const localFolderOpener = instantiationService.createInstance(terminalLinkOpeners_1.$MWb);
                opener = instantiationService.createInstance(TestTerminalSearchLinkOpener, capabilities, '/initial/cwd', localFileOpener, localFolderOpener, () => 3 /* OperatingSystem.Linux */);
                capabilities.remove(2 /* TerminalCapability.CommandDetection */);
                opener.setFileQueryBuilder({ file: () => null });
                fileService.setFiles([
                    uri_1.URI.from({ scheme: network_1.Schemas.file, path: '/initial/cwd/foo/bar.txt' }),
                    uri_1.URI.from({ scheme: network_1.Schemas.file, path: '/initial/cwd/foo2/baz.txt' })
                ]);
                searchService.setSearchResult({
                    messages: [],
                    results: [
                        { resource: uri_1.URI.from({ scheme: network_1.Schemas.file, path: '/initial/cwd/foo/bar.txt' }) }
                    ]
                });
                await opener.open({
                    text: 'bar.txt',
                    bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
                    type: "Search" /* TerminalBuiltinLinkType.Search */
                });
                (0, assert_1.deepStrictEqual)(activationResult, {
                    link: 'file:///initial/cwd/foo/bar.txt',
                    source: 'editor'
                });
            });
            test('should open single exact match against any folder for paths not containing a separator when there are multiple search results, even when command detection isn\'t available', async () => {
                localFileOpener = instantiationService.createInstance(terminalLinkOpeners_1.$LWb);
                const localFolderOpener = instantiationService.createInstance(terminalLinkOpeners_1.$MWb);
                opener = instantiationService.createInstance(TestTerminalSearchLinkOpener, capabilities, '/initial/cwd', localFileOpener, localFolderOpener, () => 3 /* OperatingSystem.Linux */);
                capabilities.remove(2 /* TerminalCapability.CommandDetection */);
                opener.setFileQueryBuilder({ file: () => null });
                fileService.setFiles([
                    uri_1.URI.from({ scheme: network_1.Schemas.file, path: '/initial/cwd/foo/bar.txt' }),
                    uri_1.URI.from({ scheme: network_1.Schemas.file, path: '/initial/cwd/foo/bar.test.txt' }),
                    uri_1.URI.from({ scheme: network_1.Schemas.file, path: '/initial/cwd/foo2/bar.test.txt' })
                ]);
                searchService.setSearchResult({
                    messages: [],
                    results: [
                        { resource: uri_1.URI.from({ scheme: network_1.Schemas.file, path: '/initial/cwd/foo/bar.txt' }) },
                        { resource: uri_1.URI.from({ scheme: network_1.Schemas.file, path: '/initial/cwd/foo/bar.test.txt' }) },
                        { resource: uri_1.URI.from({ scheme: network_1.Schemas.file, path: '/initial/cwd/foo2/bar.test.txt' }) }
                    ]
                });
                await opener.open({
                    text: 'bar.txt',
                    bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
                    type: "Search" /* TerminalBuiltinLinkType.Search */
                });
                (0, assert_1.deepStrictEqual)(activationResult, {
                    link: 'file:///initial/cwd/foo/bar.txt',
                    source: 'editor'
                });
            });
            test('should not open single exact match for paths not containing a when command detection isn\'t available', async () => {
                localFileOpener = instantiationService.createInstance(terminalLinkOpeners_1.$LWb);
                const localFolderOpener = instantiationService.createInstance(terminalLinkOpeners_1.$MWb);
                opener = instantiationService.createInstance(TestTerminalSearchLinkOpener, capabilities, '/initial/cwd', localFileOpener, localFolderOpener, () => 3 /* OperatingSystem.Linux */);
                fileService.setFiles([
                    uri_1.URI.from({ scheme: network_1.Schemas.file, path: '/initial/cwd/foo/bar.txt' }),
                    uri_1.URI.from({ scheme: network_1.Schemas.file, path: '/initial/cwd/foo2/bar.txt' })
                ]);
                await opener.open({
                    text: 'bar.txt',
                    bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
                    type: "Search" /* TerminalBuiltinLinkType.Search */
                });
                (0, assert_1.deepStrictEqual)(activationResult, {
                    link: 'bar.txt',
                    source: 'search'
                });
            });
            suite('macOS/Linux', () => {
                setup(() => {
                    localFileOpener = instantiationService.createInstance(terminalLinkOpeners_1.$LWb);
                    const localFolderOpener = instantiationService.createInstance(terminalLinkOpeners_1.$MWb);
                    opener = instantiationService.createInstance(TestTerminalSearchLinkOpener, capabilities, '', localFileOpener, localFolderOpener, () => 3 /* OperatingSystem.Linux */);
                });
                test('should apply the cwd to the link only when the file exists and cwdDetection is enabled', async () => {
                    const cwd = '/Users/home/folder';
                    const absoluteFile = '/Users/home/folder/file.txt';
                    fileService.setFiles([
                        uri_1.URI.from({ scheme: network_1.Schemas.file, path: absoluteFile }),
                        uri_1.URI.from({ scheme: network_1.Schemas.file, path: '/Users/home/folder/other/file.txt' })
                    ]);
                    // Set a fake detected command starting as line 0 to establish the cwd
                    commandDetection.setCommands([{
                            command: '',
                            isTrusted: true,
                            cwd,
                            timestamp: 0,
                            getOutput() { return undefined; },
                            getOutputMatch(outputMatcher) { return undefined; },
                            marker: {
                                line: 0
                            },
                            hasOutput() { return true; },
                            exitCode: 0,
                            commandStartLineContent: '',
                            markProperties: {}
                        }]);
                    await opener.open({
                        text: 'file.txt',
                        bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
                        type: "Search" /* TerminalBuiltinLinkType.Search */
                    });
                    (0, assert_1.deepStrictEqual)(activationResult, {
                        link: 'file:///Users/home/folder/file.txt',
                        source: 'editor'
                    });
                    // Clear detected commands and ensure the same request results in a search since there are 2 matches
                    commandDetection.setCommands([]);
                    opener.setFileQueryBuilder({ file: () => null });
                    searchService.setSearchResult({
                        messages: [],
                        results: [
                            { resource: uri_1.URI.from({ scheme: network_1.Schemas.file, path: 'file:///Users/home/folder/file.txt' }) },
                            { resource: uri_1.URI.from({ scheme: network_1.Schemas.file, path: 'file:///Users/home/folder/other/file.txt' }) }
                        ]
                    });
                    await opener.open({
                        text: 'file.txt',
                        bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
                        type: "Search" /* TerminalBuiltinLinkType.Search */
                    });
                    (0, assert_1.deepStrictEqual)(activationResult, {
                        link: 'file.txt',
                        source: 'search'
                    });
                });
                test('should extract line and column from links in a workspace containing spaces', async () => {
                    localFileOpener = instantiationService.createInstance(terminalLinkOpeners_1.$LWb);
                    const localFolderOpener = instantiationService.createInstance(terminalLinkOpeners_1.$MWb);
                    opener = instantiationService.createInstance(TestTerminalSearchLinkOpener, capabilities, '/space folder', localFileOpener, localFolderOpener, () => 3 /* OperatingSystem.Linux */);
                    fileService.setFiles([
                        uri_1.URI.from({ scheme: network_1.Schemas.file, path: '/space folder/foo/bar.txt' })
                    ]);
                    await opener.open({
                        text: './foo/bar.txt:10:5',
                        bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
                        type: "Search" /* TerminalBuiltinLinkType.Search */
                    });
                    (0, assert_1.deepStrictEqual)(activationResult, {
                        link: 'file:///space%20folder/foo/bar.txt',
                        source: 'editor',
                        selection: {
                            startColumn: 5,
                            startLineNumber: 10,
                            endColumn: undefined,
                            endLineNumber: undefined
                        },
                    });
                });
            });
            suite('Windows', () => {
                setup(() => {
                    localFileOpener = instantiationService.createInstance(terminalLinkOpeners_1.$LWb);
                    const localFolderOpener = instantiationService.createInstance(terminalLinkOpeners_1.$MWb);
                    opener = instantiationService.createInstance(TestTerminalSearchLinkOpener, capabilities, '', localFileOpener, localFolderOpener, () => 1 /* OperatingSystem.Windows */);
                });
                test('should apply the cwd to the link only when the file exists and cwdDetection is enabled', async () => {
                    localFileOpener = instantiationService.createInstance(terminalLinkOpeners_1.$LWb);
                    const localFolderOpener = instantiationService.createInstance(terminalLinkOpeners_1.$MWb);
                    opener = instantiationService.createInstance(TestTerminalSearchLinkOpener, capabilities, 'c:\\Users', localFileOpener, localFolderOpener, () => 1 /* OperatingSystem.Windows */);
                    const cwd = 'c:\\Users\\home\\folder';
                    const absoluteFile = 'c:\\Users\\home\\folder\\file.txt';
                    fileService.setFiles([
                        uri_1.URI.file('/c:/Users/home/folder/file.txt')
                    ]);
                    // Set a fake detected command starting as line 0 to establish the cwd
                    commandDetection.setCommands([{
                            exitCode: 0,
                            commandStartLineContent: '',
                            markProperties: {},
                            command: '',
                            isTrusted: true,
                            cwd,
                            timestamp: 0,
                            getOutput() { return undefined; },
                            getOutputMatch(outputMatcher) { return undefined; },
                            marker: {
                                line: 0
                            },
                            hasOutput() { return true; }
                        }]);
                    await opener.open({
                        text: 'file.txt',
                        bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
                        type: "Search" /* TerminalBuiltinLinkType.Search */
                    });
                    (0, assert_1.deepStrictEqual)(activationResult, {
                        link: 'file:///c%3A/Users/home/folder/file.txt',
                        source: 'editor'
                    });
                    // Clear detected commands and ensure the same request results in a search
                    commandDetection.setCommands([]);
                    opener.setFileQueryBuilder({ file: () => null });
                    searchService.setSearchResult({
                        messages: [],
                        results: [
                            { resource: uri_1.URI.file(absoluteFile) },
                            { resource: uri_1.URI.file('/c:/Users/home/folder/other/file.txt') }
                        ]
                    });
                    await opener.open({
                        text: 'file.txt',
                        bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
                        type: "Search" /* TerminalBuiltinLinkType.Search */
                    });
                    (0, assert_1.deepStrictEqual)(activationResult, {
                        link: 'file.txt',
                        source: 'search'
                    });
                });
                test('should extract line and column from links in a workspace containing spaces', async () => {
                    localFileOpener = instantiationService.createInstance(terminalLinkOpeners_1.$LWb);
                    const localFolderOpener = instantiationService.createInstance(terminalLinkOpeners_1.$MWb);
                    opener = instantiationService.createInstance(TestTerminalSearchLinkOpener, capabilities, 'c:/space folder', localFileOpener, localFolderOpener, () => 1 /* OperatingSystem.Windows */);
                    fileService.setFiles([
                        uri_1.URI.from({ scheme: network_1.Schemas.file, path: 'c:/space folder/foo/bar.txt' })
                    ]);
                    await opener.open({
                        text: './foo/bar.txt:10:5',
                        bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
                        type: "Search" /* TerminalBuiltinLinkType.Search */
                    });
                    (0, assert_1.deepStrictEqual)(activationResult, {
                        link: 'file:///c%3A/space%20folder/foo/bar.txt',
                        source: 'editor',
                        selection: {
                            startColumn: 5,
                            startLineNumber: 10,
                            endColumn: undefined,
                            endLineNumber: undefined
                        },
                    });
                    await opener.open({
                        text: '.\\foo\\bar.txt:10:5',
                        bufferRange: { start: { x: 1, y: 1 }, end: { x: 8, y: 1 } },
                        type: "Search" /* TerminalBuiltinLinkType.Search */
                    });
                    (0, assert_1.deepStrictEqual)(activationResult, {
                        link: 'file:///c%3A/space%20folder/foo/bar.txt',
                        source: 'editor',
                        selection: {
                            startColumn: 5,
                            startLineNumber: 10,
                            endColumn: undefined,
                            endLineNumber: undefined
                        },
                    });
                });
            });
        });
    });
});
//# sourceMappingURL=terminalLinkOpeners.test.js.map