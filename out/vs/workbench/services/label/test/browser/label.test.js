/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/resources", "assert", "vs/workbench/test/browser/workbenchTestServices", "vs/base/common/uri", "vs/workbench/services/label/common/labelService", "vs/workbench/test/common/workbenchTestServices", "vs/platform/workspace/common/workspace", "vs/platform/workspace/test/common/testWorkspace", "vs/base/common/platform", "vs/workbench/common/memento", "vs/base/common/path", "vs/base/test/common/utils", "vs/base/common/lifecycle"], function (require, exports, resources, assert, workbenchTestServices_1, uri_1, labelService_1, workbenchTestServices_2, workspace_1, testWorkspace_1, platform_1, memento_1, path_1, utils_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('URI Label', () => {
        let labelService;
        let storageService;
        setup(() => {
            storageService = new workbenchTestServices_2.TestStorageService();
            labelService = new labelService_1.LabelService(workbenchTestServices_1.TestEnvironmentService, new workbenchTestServices_2.TestContextService(), new workbenchTestServices_1.TestPathService(uri_1.URI.file('/foobar')), new workbenchTestServices_1.TestRemoteAgentService(), storageService, new workbenchTestServices_1.TestLifecycleService());
        });
        test('custom scheme', function () {
            labelService.registerFormatter({
                scheme: 'vscode',
                formatting: {
                    label: 'LABEL/${path}/${authority}/END',
                    separator: '/',
                    tildify: true,
                    normalizeDriveLetter: true
                }
            });
            const uri1 = uri_1.URI.parse('vscode://microsoft.com/1/2/3/4/5');
            assert.strictEqual(labelService.getUriLabel(uri1, { relative: false }), 'LABEL//1/2/3/4/5/microsoft.com/END');
            assert.strictEqual(labelService.getUriBasenameLabel(uri1), 'END');
        });
        test('file scheme', function () {
            labelService.registerFormatter({
                scheme: 'file',
                formatting: {
                    label: '${path}',
                    separator: path_1.sep,
                    tildify: !platform_1.isWindows,
                    normalizeDriveLetter: platform_1.isWindows
                }
            });
            const uri1 = testWorkspace_1.TestWorkspace.folders[0].uri.with({ path: testWorkspace_1.TestWorkspace.folders[0].uri.path.concat('/a/b/c/d') });
            assert.strictEqual(labelService.getUriLabel(uri1, { relative: true }), platform_1.isWindows ? 'a\\b\\c\\d' : 'a/b/c/d');
            assert.strictEqual(labelService.getUriLabel(uri1, { relative: false }), platform_1.isWindows ? 'C:\\testWorkspace\\a\\b\\c\\d' : '/testWorkspace/a/b/c/d');
            assert.strictEqual(labelService.getUriBasenameLabel(uri1), 'd');
            const uri2 = uri_1.URI.file('c:\\1/2/3');
            assert.strictEqual(labelService.getUriLabel(uri2, { relative: false }), platform_1.isWindows ? 'C:\\1\\2\\3' : '/c:\\1/2/3');
            assert.strictEqual(labelService.getUriBasenameLabel(uri2), '3');
        });
        test('separator', function () {
            labelService.registerFormatter({
                scheme: 'vscode',
                formatting: {
                    label: 'LABEL\\${path}\\${authority}\\END',
                    separator: '\\',
                    tildify: true,
                    normalizeDriveLetter: true
                }
            });
            const uri1 = uri_1.URI.parse('vscode://microsoft.com/1/2/3/4/5');
            assert.strictEqual(labelService.getUriLabel(uri1, { relative: false }), 'LABEL\\\\1\\2\\3\\4\\5\\microsoft.com\\END');
            assert.strictEqual(labelService.getUriBasenameLabel(uri1), 'END');
        });
        test('custom authority', function () {
            labelService.registerFormatter({
                scheme: 'vscode',
                authority: 'micro*',
                formatting: {
                    label: 'LABEL/${path}/${authority}/END',
                    separator: '/'
                }
            });
            const uri1 = uri_1.URI.parse('vscode://microsoft.com/1/2/3/4/5');
            assert.strictEqual(labelService.getUriLabel(uri1, { relative: false }), 'LABEL//1/2/3/4/5/microsoft.com/END');
            assert.strictEqual(labelService.getUriBasenameLabel(uri1), 'END');
        });
        test('mulitple authority', function () {
            labelService.registerFormatter({
                scheme: 'vscode',
                authority: 'not_matching_but_long',
                formatting: {
                    label: 'first',
                    separator: '/'
                }
            });
            labelService.registerFormatter({
                scheme: 'vscode',
                authority: 'microsof*',
                formatting: {
                    label: 'second',
                    separator: '/'
                }
            });
            labelService.registerFormatter({
                scheme: 'vscode',
                authority: 'mi*',
                formatting: {
                    label: 'third',
                    separator: '/'
                }
            });
            // Make sure the most specific authority is picked
            const uri1 = uri_1.URI.parse('vscode://microsoft.com/1/2/3/4/5');
            assert.strictEqual(labelService.getUriLabel(uri1, { relative: false }), 'second');
            assert.strictEqual(labelService.getUriBasenameLabel(uri1), 'second');
        });
        test('custom query', function () {
            labelService.registerFormatter({
                scheme: 'vscode',
                formatting: {
                    label: 'LABEL${query.prefix}: ${query.path}/END',
                    separator: '/',
                    tildify: true,
                    normalizeDriveLetter: true
                }
            });
            const uri1 = uri_1.URI.parse(`vscode://microsoft.com/1/2/3/4/5?${encodeURIComponent(JSON.stringify({ prefix: 'prefix', path: 'path' }))}`);
            assert.strictEqual(labelService.getUriLabel(uri1, { relative: false }), 'LABELprefix: path/END');
        });
        test('custom query without value', function () {
            labelService.registerFormatter({
                scheme: 'vscode',
                formatting: {
                    label: 'LABEL${query.prefix}: ${query.path}/END',
                    separator: '/',
                    tildify: true,
                    normalizeDriveLetter: true
                }
            });
            const uri1 = uri_1.URI.parse(`vscode://microsoft.com/1/2/3/4/5?${encodeURIComponent(JSON.stringify({ path: 'path' }))}`);
            assert.strictEqual(labelService.getUriLabel(uri1, { relative: false }), 'LABEL: path/END');
        });
        test('custom query without query json', function () {
            labelService.registerFormatter({
                scheme: 'vscode',
                formatting: {
                    label: 'LABEL${query.prefix}: ${query.path}/END',
                    separator: '/',
                    tildify: true,
                    normalizeDriveLetter: true
                }
            });
            const uri1 = uri_1.URI.parse('vscode://microsoft.com/1/2/3/4/5?path=foo');
            assert.strictEqual(labelService.getUriLabel(uri1, { relative: false }), 'LABEL: /END');
        });
        test('custom query without query', function () {
            labelService.registerFormatter({
                scheme: 'vscode',
                formatting: {
                    label: 'LABEL${query.prefix}: ${query.path}/END',
                    separator: '/',
                    tildify: true,
                    normalizeDriveLetter: true
                }
            });
            const uri1 = uri_1.URI.parse('vscode://microsoft.com/1/2/3/4/5');
            assert.strictEqual(labelService.getUriLabel(uri1, { relative: false }), 'LABEL: /END');
        });
        test('label caching', () => {
            const m = new memento_1.Memento('cachedResourceLabelFormatters2', storageService).getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            const makeFormatter = (scheme) => ({ formatting: { label: `\${path} (${scheme})`, separator: '/' }, scheme });
            assert.deepStrictEqual(m, {});
            // registers a new formatter:
            labelService.registerCachedFormatter(makeFormatter('a'));
            assert.deepStrictEqual(m, { formatters: [makeFormatter('a')] });
            // registers a 2nd formatter:
            labelService.registerCachedFormatter(makeFormatter('b'));
            assert.deepStrictEqual(m, { formatters: [makeFormatter('b'), makeFormatter('a')] });
            // promotes a formatter on re-register:
            labelService.registerCachedFormatter(makeFormatter('a'));
            assert.deepStrictEqual(m, { formatters: [makeFormatter('a'), makeFormatter('b')] });
            // no-ops if already in first place:
            labelService.registerCachedFormatter(makeFormatter('a'));
            assert.deepStrictEqual(m, { formatters: [makeFormatter('a'), makeFormatter('b')] });
            // limits the cache:
            for (let i = 0; i < 100; i++) {
                labelService.registerCachedFormatter(makeFormatter(`i${i}`));
            }
            const expected = [];
            for (let i = 50; i < 100; i++) {
                expected.unshift(makeFormatter(`i${i}`));
            }
            assert.deepStrictEqual(m, { formatters: expected });
            delete m.formatters;
        });
    });
    suite('multi-root workspace', () => {
        let labelService;
        const disposables = new lifecycle_1.DisposableStore();
        setup(() => {
            const sources = uri_1.URI.file('folder1/src');
            const tests = uri_1.URI.file('folder1/test');
            const other = uri_1.URI.file('folder2');
            labelService = disposables.add(new labelService_1.LabelService(workbenchTestServices_1.TestEnvironmentService, new workbenchTestServices_2.TestContextService(new testWorkspace_1.Workspace('test-workspace', [
                new workspace_1.WorkspaceFolder({ uri: sources, index: 0, name: 'Sources' }),
                new workspace_1.WorkspaceFolder({ uri: tests, index: 1, name: 'Tests' }),
                new workspace_1.WorkspaceFolder({ uri: other, index: 2, name: resources.basename(other) }),
            ])), new workbenchTestServices_1.TestPathService(), new workbenchTestServices_1.TestRemoteAgentService(), disposables.add(new workbenchTestServices_2.TestStorageService()), disposables.add(new workbenchTestServices_1.TestLifecycleService())));
        });
        teardown(() => {
            disposables.clear();
        });
        test('labels of files in multiroot workspaces are the foldername followed by offset from the folder', () => {
            labelService.registerFormatter({
                scheme: 'file',
                formatting: {
                    label: '${authority}${path}',
                    separator: '/',
                    tildify: false,
                    normalizeDriveLetter: false,
                    authorityPrefix: '//',
                    workspaceSuffix: ''
                }
            });
            const tests = {
                'folder1/src/file': 'Sources • file',
                'folder1/src/folder/file': 'Sources • folder/file',
                'folder1/src': 'Sources',
                'folder1/other': '/folder1/other',
                'folder2/other': 'folder2 • other',
            };
            Object.entries(tests).forEach(([path, label]) => {
                const generated = labelService.getUriLabel(uri_1.URI.file(path), { relative: true });
                assert.strictEqual(generated, label);
            });
        });
        test('labels with context after path', () => {
            labelService.registerFormatter({
                scheme: 'file',
                formatting: {
                    label: '${path} (${scheme})',
                    separator: '/',
                }
            });
            const tests = {
                'folder1/src/file': 'Sources • file (file)',
                'folder1/src/folder/file': 'Sources • folder/file (file)',
                'folder1/src': 'Sources',
                'folder1/other': '/folder1/other (file)',
                'folder2/other': 'folder2 • other (file)',
            };
            Object.entries(tests).forEach(([path, label]) => {
                const generated = labelService.getUriLabel(uri_1.URI.file(path), { relative: true });
                assert.strictEqual(generated, label, path);
            });
        });
        test('stripPathStartingSeparator', () => {
            labelService.registerFormatter({
                scheme: 'file',
                formatting: {
                    label: '${path}',
                    separator: '/',
                    stripPathStartingSeparator: true
                }
            });
            const tests = {
                'folder1/src/file': 'Sources • file',
                'other/blah': 'other/blah',
            };
            Object.entries(tests).forEach(([path, label]) => {
                const generated = labelService.getUriLabel(uri_1.URI.file(path), { relative: true });
                assert.strictEqual(generated, label, path);
            });
        });
        test('relative label without formatter', () => {
            const rootFolder = uri_1.URI.parse('myscheme://myauthority/');
            labelService = disposables.add(new labelService_1.LabelService(workbenchTestServices_1.TestEnvironmentService, new workbenchTestServices_2.TestContextService(new testWorkspace_1.Workspace('test-workspace', [
                new workspace_1.WorkspaceFolder({ uri: rootFolder, index: 0, name: 'FSProotFolder' }),
            ])), new workbenchTestServices_1.TestPathService(undefined, rootFolder.scheme), new workbenchTestServices_1.TestRemoteAgentService(), disposables.add(new workbenchTestServices_2.TestStorageService()), disposables.add(new workbenchTestServices_1.TestLifecycleService())));
            const generated = labelService.getUriLabel(uri_1.URI.parse('myscheme://myauthority/some/folder/test.txt'), { relative: true });
            if (platform_1.isWindows) {
                assert.strictEqual(generated, 'some\\folder\\test.txt');
            }
            else {
                assert.strictEqual(generated, 'some/folder/test.txt');
            }
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
    suite('workspace at FSP root', () => {
        let labelService;
        setup(() => {
            const rootFolder = uri_1.URI.parse('myscheme://myauthority/');
            labelService = new labelService_1.LabelService(workbenchTestServices_1.TestEnvironmentService, new workbenchTestServices_2.TestContextService(new testWorkspace_1.Workspace('test-workspace', [
                new workspace_1.WorkspaceFolder({ uri: rootFolder, index: 0, name: 'FSProotFolder' }),
            ])), new workbenchTestServices_1.TestPathService(), new workbenchTestServices_1.TestRemoteAgentService(), new workbenchTestServices_2.TestStorageService(), new workbenchTestServices_1.TestLifecycleService());
            labelService.registerFormatter({
                scheme: 'myscheme',
                formatting: {
                    label: '${scheme}://${authority}${path}',
                    separator: '/',
                    tildify: false,
                    normalizeDriveLetter: false,
                    workspaceSuffix: '',
                    authorityPrefix: '',
                    stripPathStartingSeparator: false
                }
            });
        });
        test('non-relative label', () => {
            const tests = {
                'myscheme://myauthority/myFile1.txt': 'myscheme://myauthority/myFile1.txt',
                'myscheme://myauthority/folder/myFile2.txt': 'myscheme://myauthority/folder/myFile2.txt',
            };
            Object.entries(tests).forEach(([uriString, label]) => {
                const generated = labelService.getUriLabel(uri_1.URI.parse(uriString), { relative: false });
                assert.strictEqual(generated, label);
            });
        });
        test('relative label', () => {
            const tests = {
                'myscheme://myauthority/myFile1.txt': 'myFile1.txt',
                'myscheme://myauthority/folder/myFile2.txt': 'folder/myFile2.txt',
            };
            Object.entries(tests).forEach(([uriString, label]) => {
                const generated = labelService.getUriLabel(uri_1.URI.parse(uriString), { relative: true });
                assert.strictEqual(generated, label);
            });
        });
        test('relative label with explicit path separator', () => {
            let generated = labelService.getUriLabel(uri_1.URI.parse('myscheme://myauthority/some/folder/test.txt'), { relative: true, separator: '/' });
            assert.strictEqual(generated, 'some/folder/test.txt');
            generated = labelService.getUriLabel(uri_1.URI.parse('myscheme://myauthority/some/folder/test.txt'), { relative: true, separator: '\\' });
            assert.strictEqual(generated, 'some\\folder\\test.txt');
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFiZWwudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9sYWJlbC90ZXN0L2Jyb3dzZXIvbGFiZWwudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQWtCaEcsS0FBSyxDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUU7UUFDdkIsSUFBSSxZQUEwQixDQUFDO1FBQy9CLElBQUksY0FBa0MsQ0FBQztRQUV2QyxLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1YsY0FBYyxHQUFHLElBQUksMENBQWtCLEVBQUUsQ0FBQztZQUMxQyxZQUFZLEdBQUcsSUFBSSwyQkFBWSxDQUFDLDhDQUFzQixFQUFFLElBQUksMENBQWtCLEVBQUUsRUFBRSxJQUFJLHVDQUFlLENBQUMsU0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksOENBQXNCLEVBQUUsRUFBRSxjQUFjLEVBQUUsSUFBSSw0Q0FBb0IsRUFBRSxDQUFDLENBQUM7UUFDdk0sQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ3JCLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQztnQkFDOUIsTUFBTSxFQUFFLFFBQVE7Z0JBQ2hCLFVBQVUsRUFBRTtvQkFDWCxLQUFLLEVBQUUsZ0NBQWdDO29CQUN2QyxTQUFTLEVBQUUsR0FBRztvQkFDZCxPQUFPLEVBQUUsSUFBSTtvQkFDYixvQkFBb0IsRUFBRSxJQUFJO2lCQUMxQjthQUNELENBQUMsQ0FBQztZQUVILE1BQU0sSUFBSSxHQUFHLFNBQUcsQ0FBQyxLQUFLLENBQUMsa0NBQWtDLENBQUMsQ0FBQztZQUMzRCxNQUFNLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsb0NBQW9DLENBQUMs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