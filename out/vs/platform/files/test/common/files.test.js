/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/extpath", "vs/base/common/platform", "vs/base/common/uri", "vs/base/test/common/utils", "vs/platform/files/common/files"], function (require, exports, assert, extpath_1, platform_1, uri_1, utils_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Files', () => {
        test('FileChangesEvent - basics', function () {
            const changes = [
                { resource: utils_1.toResource.call(this, '/foo/updated.txt'), type: 0 /* FileChangeType.UPDATED */ },
                { resource: utils_1.toResource.call(this, '/foo/otherupdated.txt'), type: 0 /* FileChangeType.UPDATED */ },
                { resource: utils_1.toResource.call(this, '/added.txt'), type: 1 /* FileChangeType.ADDED */ },
                { resource: utils_1.toResource.call(this, '/bar/deleted.txt'), type: 2 /* FileChangeType.DELETED */ },
                { resource: utils_1.toResource.call(this, '/bar/folder'), type: 2 /* FileChangeType.DELETED */ },
                { resource: utils_1.toResource.call(this, '/BAR/FOLDER'), type: 2 /* FileChangeType.DELETED */ }
            ];
            for (const ignorePathCasing of [false, true]) {
                const event = new files_1.FileChangesEvent(changes, ignorePathCasing);
                assert(!event.contains(utils_1.toResource.call(this, '/foo'), 0 /* FileChangeType.UPDATED */));
                assert(event.affects(utils_1.toResource.call(this, '/foo'), 0 /* FileChangeType.UPDATED */));
                assert(event.contains(utils_1.toResource.call(this, '/foo/updated.txt'), 0 /* FileChangeType.UPDATED */));
                assert(event.affects(utils_1.toResource.call(this, '/foo/updated.txt'), 0 /* FileChangeType.UPDATED */));
                assert(event.contains(utils_1.toResource.call(this, '/foo/updated.txt'), 0 /* FileChangeType.UPDATED */, 1 /* FileChangeType.ADDED */));
                assert(event.affects(utils_1.toResource.call(this, '/foo/updated.txt'), 0 /* FileChangeType.UPDATED */, 1 /* FileChangeType.ADDED */));
                assert(event.contains(utils_1.toResource.call(this, '/foo/updated.txt'), 0 /* FileChangeType.UPDATED */, 1 /* FileChangeType.ADDED */, 2 /* FileChangeType.DELETED */));
                assert(!event.contains(utils_1.toResource.call(this, '/foo/updated.txt'), 1 /* FileChangeType.ADDED */, 2 /* FileChangeType.DELETED */));
                assert(!event.contains(utils_1.toResource.call(this, '/foo/updated.txt'), 1 /* FileChangeType.ADDED */));
                assert(!event.contains(utils_1.toResource.call(this, '/foo/updated.txt'), 2 /* FileChangeType.DELETED */));
                assert(!event.affects(utils_1.toResource.call(this, '/foo/updated.txt'), 2 /* FileChangeType.DELETED */));
                assert(event.contains(utils_1.toResource.call(this, '/bar/folder'), 2 /* FileChangeType.DELETED */));
                assert(event.contains(utils_1.toResource.call(this, '/BAR/FOLDER'), 2 /* FileChangeType.DELETED */));
                assert(event.affects(utils_1.toResource.call(this, '/BAR'), 2 /* FileChangeType.DELETED */));
                if (ignorePathCasing) {
                    assert(event.contains(utils_1.toResource.call(this, '/BAR/folder'), 2 /* FileChangeType.DELETED */));
                    assert(event.affects(utils_1.toResource.call(this, '/bar'), 2 /* FileChangeType.DELETED */));
                }
                else {
                    assert(!event.contains(utils_1.toResource.call(this, '/BAR/folder'), 2 /* FileChangeType.DELETED */));
                    assert(event.affects(utils_1.toResource.call(this, '/bar'), 2 /* FileChangeType.DELETED */));
                }
                assert(event.contains(utils_1.toResource.call(this, '/bar/folder/somefile'), 2 /* FileChangeType.DELETED */));
                assert(event.contains(utils_1.toResource.call(this, '/bar/folder/somefile/test.txt'), 2 /* FileChangeType.DELETED */));
                assert(event.contains(utils_1.toResource.call(this, '/BAR/FOLDER/somefile/test.txt'), 2 /* FileChangeType.DELETED */));
                if (ignorePathCasing) {
                    assert(event.contains(utils_1.toResource.call(this, '/BAR/folder/somefile/test.txt'), 2 /* FileChangeType.DELETED */));
                }
                else {
                    assert(!event.contains(utils_1.toResource.call(this, '/BAR/folder/somefile/test.txt'), 2 /* FileChangeType.DELETED */));
                }
                assert(!event.contains(utils_1.toResource.call(this, '/bar/folder2/somefile'), 2 /* FileChangeType.DELETED */));
                assert.strictEqual(1, event.rawAdded.length);
                assert.strictEqual(2, event.rawUpdated.length);
                assert.strictEqual(3, event.rawDeleted.length);
                assert.strictEqual(true, event.gotAdded());
                assert.strictEqual(true, event.gotUpdated());
                assert.strictEqual(true, event.gotDeleted());
            }
        });
        test('FileChangesEvent - supports multiple changes on file tree', function () {
            for (const type of [1 /* FileChangeType.ADDED */, 0 /* FileChangeType.UPDATED */, 2 /* FileChangeType.DELETED */]) {
                const changes = [
                    { resource: utils_1.toResource.call(this, '/foo/bar/updated.txt'), type },
                    { resource: utils_1.toResource.call(this, '/foo/bar/otherupdated.txt'), type },
                    { resource: utils_1.toResource.call(this, '/foo/bar'), type },
                    { resource: utils_1.toResource.call(this, '/foo'), type },
                    { resource: utils_1.toResource.call(this, '/bar'), type },
                    { resource: utils_1.toResource.call(this, '/bar/foo'), type },
                    { resource: utils_1.toResource.call(this, '/bar/foo/updated.txt'), type },
                    { resource: utils_1.toResource.call(this, '/bar/foo/otherupdated.txt'), type }
                ];
                for (const ignorePathCasing of [false, true]) {
                    const event = new files_1.FileChangesEvent(changes, ignorePathCasing);
                    for (const change of changes) {
                        assert(event.contains(change.resource, type));
                        assert(event.affects(change.resource, type));
                    }
                    assert(event.affects(utils_1.toResource.call(this, '/foo'), type));
                    assert(event.affects(utils_1.toResource.call(this, '/bar'), type));
                    assert(event.affects(utils_1.toResource.call(this, '/'), type));
                    assert(!event.affects(utils_1.toResource.call(this, '/foobar'), type));
                    assert(!event.contains(utils_1.toResource.call(this, '/some/foo/bar'), type));
                    assert(!event.affects(utils_1.toResource.call(this, '/some/foo/bar'), type));
                    assert(!event.contains(utils_1.toResource.call(this, '/some/bar'), type));
                    assert(!event.affects(utils_1.toResource.call(this, '/some/bar'), type));
                    switch (type) {
                        case 1 /* FileChangeType.ADDED */:
                            assert.strictEqual(8, event.rawAdded.length);
                            break;
                        case 2 /* FileChangeType.DELETED */:
                            assert.strictEqual(8, event.rawDeleted.length);
                            break;
                    }
                }
            }
        });
        function testIsEqual(testMethod) {
            // corner cases
            assert(testMethod('', '', true));
            assert(!testMethod(null, '', true));
            assert(!testMethod(undefined, '', true));
            // basics (string)
            assert(testMethod('/', '/', true));
            assert(testMethod('/some', '/some', true));
            assert(testMethod('/some/path', '/some/path', true));
            assert(testMethod('c:\\', 'c:\\', true));
            assert(testMethod('c:\\some', 'c:\\some', true));
            assert(testMethod('c:\\some\\path', 'c:\\some\\path', true));
            assert(testMethod('/someöäü/path', '/someöäü/path', true));
            assert(testMethod('c:\\someöäü\\path', 'c:\\someöäü\\path', true));
            assert(!testMethod('/some/path', '/some/other/path', true));
            assert(!testMethod('c:\\some\\path', 'c:\\some\\other\\path', true));
            assert(!testMethod('c:\\some\\path', 'd:\\some\\path', true));
            assert(testMethod('/some/path', '/some/PATH', true));
            assert(testMethod('/someöäü/path', '/someÖÄÜ/PATH', true));
            assert(testMethod('c:\\some\\path', 'c:\\some\\PATH', true));
            assert(testMethod('c:\\someöäü\\path', 'c:\\someÖÄÜ\\PATH', true));
            assert(testMethod('c:\\some\\path', 'C:\\some\\PATH', true));
        }
        test('isEqual (ignoreCase)', function () {
            testIsEqual(extpath_1.isEqual);
            // basics (uris)
            assert((0, extpath_1.isEqual)(uri_1.URI.file('/some/path').fsPath, uri_1.URI.file('/some/path').fsPath, true));
            assert((0, extpath_1.isEqual)(uri_1.URI.file('c:\\some\\path').fsPath, uri_1.URI.file('c:\\some\\path').fsPath, true));
            assert((0, extpath_1.isEqual)(uri_1.URI.file('/someöäü/path').fsPath, uri_1.URI.file('/someöäü/path').fsPath, true));
            assert((0, extpath_1.isEqual)(uri_1.URI.file('c:\\someöäü\\path').fsPath, uri_1.URI.file('c:\\someöäü\\path').fsPath, true));
            assert(!(0, extpath_1.isEqual)(uri_1.URI.file('/some/path').fsPath, uri_1.URI.file('/some/other/path').fsPath, true));
            assert(!(0, extpath_1.isEqual)(uri_1.URI.file('c:\\some\\path').fsPath, uri_1.URI.file('c:\\some\\other\\path').fsPath, true));
            assert((0, extpath_1.isEqual)(uri_1.URI.file('/some/path').fsPath, uri_1.URI.file('/some/PATH').fsPath, true));
            assert((0, extpath_1.isEqual)(uri_1.URI.file('/someöäü/path').fsPath, uri_1.URI.file('/someÖÄÜ/PATH').fsPath, true));
            assert((0, extpath_1.isEqual)(uri_1.URI.file('c:\\some\\path').fsPath, uri_1.URI.file('c:\\some\\PATH').fsPath, true));
            assert((0, extpath_1.isEqual)(uri_1.URI.file('c:\\someöäü\\path').fsPath, uri_1.URI.file('c:\\someÖÄÜ\\PATH').fsPath, true));
            assert((0, extpath_1.isEqual)(uri_1.URI.file('c:\\some\\path').fsPath, uri_1.URI.file('C:\\some\\PATH').fsPath, true));
        });
        test('isParent (ignorecase)', function () {
            if (platform_1.isWindows) {
                assert((0, files_1.isParent)('c:\\some\\path', 'c:\\', true));
                assert((0, files_1.isParent)('c:\\some\\path', 'c:\\some', true));
                assert((0, files_1.isParent)('c:\\some\\path', 'c:\\some\\', true));
                assert((0, files_1.isParent)('c:\\someöäü\\path', 'c:\\someöäü', true));
                assert((0, files_1.isParent)('c:\\someöäü\\path', 'c:\\someöäü\\', true));
                assert((0, files_1.isParent)('c:\\foo\\bar\\test.ts', 'c:\\foo\\bar', true));
                assert((0, files_1.isParent)('c:\\foo\\bar\\test.ts', 'c:\\foo\\bar\\', true));
                assert((0, files_1.isParent)('c:\\some\\path', 'C:\\', true));
                assert((0, files_1.isParent)('c:\\some\\path', 'c:\\SOME', true));
                assert((0, files_1.isParent)('c:\\some\\path', 'c:\\SOME\\', true));
                assert(!(0, files_1.isParent)('c:\\some\\path', 'd:\\', true));
                assert(!(0, files_1.isParent)('c:\\some\\path', 'c:\\some\\path', true));
                assert(!(0, files_1.isParent)('c:\\some\\path', 'd:\\some\\path', true));
                assert(!(0, files_1.isParent)('c:\\foo\\bar\\test.ts', 'c:\\foo\\barr', true));
                assert(!(0, files_1.isParent)('c:\\foo\\bar\\test.ts', 'c:\\foo\\bar\\test', true));
            }
            if (platform_1.isMacintosh || platform_1.isLinux) {
                assert((0, files_1.isParent)('/some/path', '/', true));
                assert((0, files_1.isParent)('/some/path', '/some', true));
                assert((0, files_1.isParent)('/some/path', '/some/', true));
                assert((0, files_1.isParent)('/someöäü/path', '/someöäü', true));
                assert((0, files_1.isParent)('/someöäü/path', '/someöäü/', true));
                assert((0, files_1.isParent)('/foo/bar/test.ts', '/foo/bar', true));
                assert((0, files_1.isParent)('/foo/bar/test.ts', '/foo/bar/', true));
                assert((0, files_1.isParent)('/some/path', '/SOME', true));
                assert((0, files_1.isParent)('/some/path', '/SOME/', true));
                assert((0, files_1.isParent)('/someöäü/path', '/SOMEÖÄÜ', true));
                assert((0, files_1.isParent)('/someöäü/path', '/SOMEÖÄÜ/', true));
                assert(!(0, files_1.isParent)('/some/path', '/some/path', true));
                assert(!(0, files_1.isParent)('/foo/bar/test.ts', '/foo/barr', true));
                assert(!(0, files_1.isParent)('/foo/bar/test.ts', '/foo/bar/test', true));
            }
        });
        test('isEqualOrParent (ignorecase)', function () {
            // same assertions apply as with isEqual()
            testIsEqual(extpath_1.isEqualOrParent); //
            if (platform_1.isWindows) {
                assert((0, extpath_1.isEqualOrParent)('c:\\some\\path', 'c:\\', true));
                assert((0, extpath_1.isEqualOrParent)('c:\\some\\path', 'c:\\some', true));
                assert((0, extpath_1.isEqualOrParent)('c:\\some\\path', 'c:\\some\\', true));
                assert((0, extpath_1.isEqualOrParent)('c:\\someöäü\\path', 'c:\\someöäü', true));
                assert((0, extpath_1.isEqualOrParent)('c:\\someöäü\\path', 'c:\\someöäü\\', true));
                assert((0, extpath_1.isEqualOrParent)('c:\\foo\\bar\\test.ts', 'c:\\foo\\bar', true));
                assert((0, extpath_1.isEqualOrParent)('c:\\foo\\bar\\test.ts', 'c:\\foo\\bar\\', true));
                assert((0, extpath_1.isEqualOrParent)('c:\\some\\path', 'c:\\some\\path', true));
                assert((0, extpath_1.isEqualOrParent)('c:\\foo\\bar\\test.ts', 'c:\\foo\\bar\\test.ts', true));
                assert((0, extpath_1.isEqualOrParent)('c:\\some\\path', 'C:\\', true));
                assert((0, extpath_1.isEqualOrParent)('c:\\some\\path', 'c:\\SOME', true));
                assert((0, extpath_1.isEqualOrParent)('c:\\some\\path', 'c:\\SOME\\', true));
                assert(!(0, extpath_1.isEqualOrParent)('c:\\some\\path', 'd:\\', true));
                assert(!(0, extpath_1.isEqualOrParent)('c:\\some\\path', 'd:\\some\\path', true));
                assert(!(0, extpath_1.isEqualOrParent)('c:\\foo\\bar\\test.ts', 'c:\\foo\\barr', true));
                assert(!(0, extpath_1.isEqualOrParent)('c:\\foo\\bar\\test.ts', 'c:\\foo\\bar\\test', true));
                assert(!(0, extpath_1.isEqualOrParent)('c:\\foo\\bar\\test.ts', 'c:\\foo\\bar\\test.', true));
                assert(!(0, extpath_1.isEqualOrParent)('c:\\foo\\bar\\test.ts', 'c:\\foo\\BAR\\test.', true));
            }
            if (platform_1.isMacintosh || platform_1.isLinux) {
                assert((0, extpath_1.isEqualOrParent)('/some/path', '/', true));
                assert((0, extpath_1.isEqualOrParent)('/some/path', '/some', true));
                assert((0, extpath_1.isEqualOrParent)('/some/path', '/some/', true));
                assert((0, extpath_1.isEqualOrParent)('/someöäü/path', '/someöäü', true));
                assert((0, extpath_1.isEqualOrParent)('/someöäü/path', '/someöäü/', true));
                assert((0, extpath_1.isEqualOrParent)('/foo/bar/test.ts', '/foo/bar', true));
                assert((0, extpath_1.isEqualOrParent)('/foo/bar/test.ts', '/foo/bar/', true));
                assert((0, extpath_1.isEqualOrParent)('/some/path', '/some/path', true));
                assert((0, extpath_1.isEqualOrParent)('/some/path', '/SOME', true));
                assert((0, extpath_1.isEqualOrParent)('/some/path', '/SOME/', true));
                assert((0, extpath_1.isEqualOrParent)('/someöäü/path', '/SOMEÖÄÜ', true));
                assert((0, extpath_1.isEqualOrParent)('/someöäü/path', '/SOMEÖÄÜ/', true));
                assert(!(0, extpath_1.isEqualOrParent)('/foo/bar/test.ts', '/foo/barr', true));
                assert(!(0, extpath_1.isEqualOrParent)('/foo/bar/test.ts', '/foo/bar/test', true));
                assert(!(0, extpath_1.isEqualOrParent)('foo/bar/test.ts', 'foo/bar/test.', true));
                assert(!(0, extpath_1.isEqualOrParent)('foo/bar/test.ts', 'foo/BAR/test.', true));
            }
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZXMudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2ZpbGVzL3Rlc3QvY29tbW9uL2ZpbGVzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFTaEcsS0FBSyxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7UUFFbkIsSUFBSSxDQUFDLDJCQUEyQixFQUFFO1lBQ2pDLE1BQU0sT0FBTyxHQUFHO2dCQUNmLEVBQUUsUUFBUSxFQUFFLGtCQUFVLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxrQkFBa0IsQ0FBQyxFQUFFLElBQUksZ0NBQXdCLEVBQUU7Z0JBQ3JGLEVBQUUsUUFBUSxFQUFFLGtCQUFVLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSx1QkFBdUIsQ0FBQyxFQUFFLElBQUksZ0NBQXdCLEVBQUU7Z0JBQzFGLEVBQUUsUUFBUSxFQUFFLGtCQUFVLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsRUFBRSxJQUFJLDhCQUFzQixFQUFFO2dCQUM3RSxFQUFFLFFBQVEsRUFBRSxrQkFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLENBQUMsRUFBRSxJQUFJLGdDQUF3QixFQUFFO2dCQUNyRixFQUFFLFFBQVEsRUFBRSxrQkFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLEVBQUUsSUFBSSxnQ0FBd0IsRUFBRTtnQkFDaEYsRUFBRSxRQUFRLEVBQUUsa0JBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxFQUFFLElBQUksZ0NBQXdCLEVBQUU7YUFDaEYsQ0FBQztZQUVGLEtBQUssTUFBTSxnQkFBZ0IsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDN0MsTUFBTSxLQUFLLEdBQUcsSUFBSSx3QkFBZ0IsQ0FBQyxPQUFPLEVBQUUsZ0JB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SSxDQUFDLENBQUMsQ0FBQztZQUMzQyxNQUFNLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUVyRCxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN6QyxNQUFNLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNqRCxNQUFNLENBQUMsVUFBVSxDQUFDLGdCQUFnQixFQUFFLGdCQUFnQixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFFN0QsTUFBTSxDQUFDLFVBQVUsQ0FBQyxlQUFlLEVBQUUsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDM0QsTUFBTSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsRUFBRSxtQkFBbUIsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRW5FLE1BQU0sQ0FBQyxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUM1RCxNQUFNLENBQUMsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLEVBQUUsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNyRSxNQUFNLENBQUMsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUU5RCxNQUFNLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNyRCxNQUFNLENBQUMsVUFBVSxDQUFDLGVBQWUsRUFBRSxlQUFlLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUMzRCxNQUFNLENBQUMsVUFBVSxDQUFDLGdCQUFnQixFQUFFLGdCQUFnQixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsRUFBRSxtQkFBbUIsRUFBRSxJQUFJ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