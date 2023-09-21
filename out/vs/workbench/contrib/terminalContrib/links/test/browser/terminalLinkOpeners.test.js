/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/network", "vs/base/common/uri", "vs/platform/files/common/files", "vs/platform/files/common/fileService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/log/common/log", "vs/platform/quickinput/common/quickInput", "vs/platform/workspace/common/workspace", "vs/platform/terminal/common/capabilities/commandDetectionCapability", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkOpeners", "vs/platform/terminal/common/capabilities/terminalCapabilityStore", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/test/common/workbenchTestServices", "vs/workbench/services/search/common/search", "vs/workbench/services/search/common/searchService", "vs/platform/terminal/common/terminal", "vs/amdX", "vs/base/test/common/utils"], function (require, exports, assert_1, network_1, uri_1, files_1, fileService_1, instantiationServiceMock_1, log_1, quickInput_1, workspace_1, commandDetectionCapability_1, terminalLinkOpeners_1, terminalCapabilityStore_1, editorService_1, environmentService_1, workbenchTestServices_1, search_1, searchService_1, terminal_1, amdX_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TestCommandDetectionCapability extends commandDetectionCapability_1.CommandDetectionCapability {
        setCommands(commands) {
            this._commands = commands;
        }
    }
    class TestFileService extends fileService_1.FileService {
        constructor() {
            super(...arguments);
            this._files = '*';
        }
        async stat(resource) {
            if (this._files === '*' || this._files.some(e => e.toString() === resource.toString())) {
                return { isFile: true, isDirectory: false, isSymbolicLink: false };
            }
            throw new Error('ENOENT');
        }
        setFiles(files) {
            this._files = files;
        }
    }
    class TestSearchService extends searchService_1.SearchService {
        async fileSearch(query) {
            return this._searchResult;
        }
        setSearchResult(result) {
            this._searchResult = result;
        }
    }
    class TestTerminalSearchLinkOpener extends terminalLinkOpeners_1.TerminalSearchLinkOpener {
        setFileQueryBuilder(value) {
            this._fileQueryBuilder = value;
        }
    }
    suite('Workbench - TerminalLinkOpeners', () => {
        const store = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        let instantiationService;
        let fileService;
        let searchService;
        let activationResult;
        let xterm;
        setup(async () => {
            instantiationService = store.add(new instantiationServiceMock_1.TestInstantiationService());
            fileService = store.add(new TestFileService(new log_1.NullLogService()));
            searchService = store.add(new TestSearchService(null, null, null, null, null, null, null));
            instantiationService.set(files_1.IFileService, fileService);
            instantiationService.set(log_1.ILogService, new log_1.NullLogService());
            instantiationService.set(search_1.ISearchService, searchService);
            instantiationService.set(workspace_1.IWorkspaceContextService, new workbenchTestServices_1.TestContextService());
            instantiationService.stub(terminal_1.ITerminalLogService, new log_1.NullLogService());
            instantiationService.stub(environmentService_1.IWorkbenchEnvironmentService, {
                remoteAuthority: undefined
            });
            // Allow intercepting link activations
            activationResult = undefined;
            instantiationService.stub(quickInput_1.IQuickInputService, {
                quickAccess: {
                    show(link) {
                        activationResult = { link, source: 'search' };
                    }
                }
            });
            instantiationService.stub(editorService_1.IEditorService, {
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
            const TerminalCtor = (await (0, amdX_1.importAMDNodeModule)('xterm', 'lib/xterm.js')).Terminal;
            xterm = store.add(new TerminalCtor({ allowProposedApi: true }));
        });
        suite('TerminalSearchLinkOpener', () => {
            let opener;
            let capabilities;
            let commandDetection;
            let localFileOpener;
            setup(() => {
                capabilities = store.add(new terminalCapabilityStore_1.TerminalCapabilityStore());
                commandDetection = store.add(instantiationService.createInstance(TestCommandDetectionCapability, xterm));
                capabilities.add(2 /* TerminalCapability.CommandDetection */, commandDetection);
            });
            test('should open single exact match against cwd when searching if it exists when command detection cwd is available', async () => {
                localFileOpener = instantiationService.createInstance(terminalLinkOpeners_1.TerminalLocalFileLinkOpener);
                const localFolderOpener = instantiationService.createInstance(terminalLinkOpeners_1.TerminalLocalFolderInWorkspaceLinkOpener);
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
                localFileOpener = instantiationService.createInstance(terminalLinkOpeners_1.TerminalLocalFileLinkOpener);
                const localFolderOpener = instantiationService.createInstance(terminalLinkOpeners_1.TerminalLocalFolderInWorkspaceLinkOpener);
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
                localFileOpener = instantiationService.createInstance(terminalLinkOpeners_1.TerminalLocalFileLinkOpener);
                const localFolderOpener = instantiationService.createInstance(terminalLinkOpeners_1.TerminalLocalFolderInWorkspaceLinkOpener);
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
                localFileOpener = instantiationService.createInstance(terminalLinkOpeners_1.TerminalLocalFileLinkOpener);
                const localFolderOpener = instantiationService.createInstance(terminalLinkOpeners_1.TerminalLocalFolderInWorkspaceLinkOpener);
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
                localFileOpener = instantiationService.createInstance(terminalLinkOpeners_1.TerminalLocalFileLinkOpener);
                const localFolderOpener = instantiationService.createInstance(terminalLinkOpeners_1.TerminalLocalFolderInWorkspaceLinkOpener);
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
                    localFileOpener = instantiationService.createInstance(terminalLinkOpeners_1.TerminalLocalFileLinkOpener);
                    const localFolderOpener = instantiationService.createInstance(terminalLinkOpeners_1.TerminalLocalFolderInWorkspaceLinkOpener);
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
                    localFileOpener = instantiationService.createInstance(terminalLinkOpeners_1.TerminalLocalFileLinkOpener);
                    const localFolderOpener = instantiationService.createInstance(terminalLinkOpeners_1.TerminalLocalFolderInWorkspaceLinkOpener);
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
                    localFileOpener = instantiationService.createInstance(terminalLinkOpeners_1.TerminalLocalFileLinkOpener);
                    const localFolderOpener = instantiationService.createInstance(terminalLinkOpeners_1.TerminalLocalFolderInWorkspaceLinkOpener);
                    opener = instantiationService.createInstance(TestTerminalSearchLinkOpener, capabilities, '', localFileOpener, localFolderOpener, () => 1 /* OperatingSystem.Windows */);
                });
                test('should apply the cwd to the link only when the file exists and cwdDetection is enabled', async () => {
                    localFileOpener = instantiationService.createInstance(terminalLinkOpeners_1.TerminalLocalFileLinkOpener);
                    const localFolderOpener = instantiationService.createInstance(terminalLinkOpeners_1.TerminalLocalFolderInWorkspaceLinkOpener);
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
                    localFileOpener = instantiationService.createInstance(terminalLinkOpeners_1.TerminalLocalFileLinkOpener);
                    const localFolderOpener = instantiationService.createInstance(terminalLinkOpeners_1.TerminalLocalFolderInWorkspaceLinkOpener);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxMaW5rT3BlbmVycy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWxDb250cmliL2xpbmtzL3Rlc3QvYnJvd3Nlci90ZXJtaW5hbExpbmtPcGVuZXJzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFrQ2hHLE1BQU0sOEJBQStCLFNBQVEsdURBQTBCO1FBQ3RFLFdBQVcsQ0FBQyxRQUE0QjtZQUN2QyxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztRQUMzQixDQUFDO0tBQ0Q7SUFFRCxNQUFNLGVBQWdCLFNBQVEseUJBQVc7UUFBekM7O1lBQ1MsV0FBTSxHQUFnQixHQUFHLENBQUM7UUFVbkMsQ0FBQztRQVRTLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBYTtZQUNoQyxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxLQUFLLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFO2dCQUN2RixPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQWtDLENBQUM7YUFDbkc7WUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzNCLENBQUM7UUFDRCxRQUFRLENBQUMsS0FBa0I7WUFDMUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDckIsQ0FBQztLQUNEO0lBRUQsTUFBTSxpQkFBa0IsU0FBUSw2QkFBYTtRQUVuQyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQWlCO1lBQzFDLE9BQU8sSUFBSSxDQUFDLGFBQWMsQ0FBQztRQUM1QixDQUFD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