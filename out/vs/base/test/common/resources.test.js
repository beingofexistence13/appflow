define(["require", "exports", "assert", "vs/base/common/extpath", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uri"], function (require, exports, assert, extpath_1, path_1, platform_1, resources_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Resources', () => {
        test('distinctParents', () => {
            // Basic
            let resources = [
                uri_1.URI.file('/some/folderA/file.txt'),
                uri_1.URI.file('/some/folderB/file.txt'),
                uri_1.URI.file('/some/folderC/file.txt')
            ];
            let distinct = (0, resources_1.distinctParents)(resources, r => r);
            assert.strictEqual(distinct.length, 3);
            assert.strictEqual(distinct[0].toString(), resources[0].toString());
            assert.strictEqual(distinct[1].toString(), resources[1].toString());
            assert.strictEqual(distinct[2].toString(), resources[2].toString());
            // Parent / Child
            resources = [
                uri_1.URI.file('/some/folderA'),
                uri_1.URI.file('/some/folderA/file.txt'),
                uri_1.URI.file('/some/folderA/child/file.txt'),
                uri_1.URI.file('/some/folderA2/file.txt'),
                uri_1.URI.file('/some/file.txt')
            ];
            distinct = (0, resources_1.distinctParents)(resources, r => r);
            assert.strictEqual(distinct.length, 3);
            assert.strictEqual(distinct[0].toString(), resources[0].toString());
            assert.strictEqual(distinct[1].toString(), resources[3].toString());
            assert.strictEqual(distinct[2].toString(), resources[4].toString());
        });
        test('dirname', () => {
            if (platform_1.isWindows) {
                assert.strictEqual((0, resources_1.dirname)(uri_1.URI.file('c:\\some\\file\\test.txt')).toString(), 'file:///c%3A/some/file');
                assert.strictEqual((0, resources_1.dirname)(uri_1.URI.file('c:\\some\\file')).toString(), 'file:///c%3A/some');
                assert.strictEqual((0, resources_1.dirname)(uri_1.URI.file('c:\\some\\file\\')).toString(), 'file:///c%3A/some');
                assert.strictEqual((0, resources_1.dirname)(uri_1.URI.file('c:\\some')).toString(), 'file:///c%3A/');
                assert.strictEqual((0, resources_1.dirname)(uri_1.URI.file('C:\\some')).toString(), 'file:///c%3A/');
                assert.strictEqual((0, resources_1.dirname)(uri_1.URI.file('c:\\')).toString(), 'file:///c%3A/');
            }
            else {
                assert.strictEqual((0, resources_1.dirname)(uri_1.URI.file('/some/file/test.txt')).toString(), 'file:///some/file');
                assert.strictEqual((0, resources_1.dirname)(uri_1.URI.file('/some/file/')).toString(), 'file:///some');
                assert.strictEqual((0, resources_1.dirname)(uri_1.URI.file('/some/file')).toString(), 'file:///some');
            }
            assert.strictEqual((0, resources_1.dirname)(uri_1.URI.parse('foo://a/some/file/test.txt')).toString(), 'foo://a/some/file');
            assert.strictEqual((0, resources_1.dirname)(uri_1.URI.parse('foo://a/some/file/')).toString(), 'foo://a/some');
            assert.strictEqual((0, resources_1.dirname)(uri_1.URI.parse('foo://a/some/file')).toString(), 'foo://a/some');
            assert.strictEqual((0, resources_1.dirname)(uri_1.URI.parse('foo://a/some')).toString(), 'foo://a/');
            assert.strictEqual((0, resources_1.dirname)(uri_1.URI.parse('foo://a/')).toString(), 'foo://a/');
            assert.strictEqual((0, resources_1.dirname)(uri_1.URI.parse('foo://a')).toString(), 'foo://a');
            // does not explode (https://github.com/microsoft/vscode/issues/41987)
            (0, resources_1.dirname)(uri_1.URI.from({ scheme: 'file', authority: '/users/someone/portal.h' }));
            assert.strictEqual((0, resources_1.dirname)(uri_1.URI.parse('foo://a/b/c?q')).toString(), 'foo://a/b?q');
        });
        test('basename', () => {
            if (platform_1.isWindows) {
                assert.strictEqual((0, resources_1.basename)(uri_1.URI.file('c:\\some\\file\\test.txt')), 'test.txt');
                assert.strictEqual((0, resources_1.basename)(uri_1.URI.file('c:\\some\\file')), 'file');
                assert.strictEqual((0, resources_1.basename)(uri_1.URI.file('c:\\some\\file\\')), 'file');
                assert.strictEqual((0, resources_1.basename)(uri_1.URI.file('C:\\some\\file\\')), 'file');
            }
            else {
                assert.strictEqual((0, resources_1.basename)(uri_1.URI.file('/some/file/test.txt')), 'test.txt');
                assert.strictEqual((0, resources_1.basename)(uri_1.URI.file('/some/file/')), 'file');
                assert.strictEqual((0, resources_1.basename)(uri_1.URI.file('/some/file')), 'file');
                assert.strictEqual((0, resources_1.basename)(uri_1.URI.file('/some')), 'some');
            }
            assert.strictEqual((0, resources_1.basename)(uri_1.URI.parse('foo://a/some/file/test.txt')), 'test.txt');
            assert.strictEqual((0, resources_1.basename)(uri_1.URI.parse('foo://a/some/file/')), 'file');
            assert.strictEqual((0, resources_1.basename)(uri_1.URI.parse('foo://a/some/file')), 'file');
            assert.strictEqual((0, resources_1.basename)(uri_1.URI.parse('foo://a/some')), 'some');
            assert.strictEqual((0, resources_1.basename)(uri_1.URI.parse('foo://a/')), '');
            assert.strictEqual((0, resources_1.basename)(uri_1.URI.parse('foo://a')), '');
        });
        test('joinPath', () => {
            if (platform_1.isWindows) {
                assert.strictEqual((0, resources_1.joinPath)(uri_1.URI.file('c:\\foo\\bar'), '/file.js').toString(), 'file:///c%3A/foo/bar/file.js');
                assert.strictEqual((0, resources_1.joinPath)(uri_1.URI.file('c:\\foo\\bar\\'), 'file.js').toString(), 'file:///c%3A/foo/bar/file.js');
                assert.strictEqual((0, resources_1.joinPath)(uri_1.URI.file('c:\\foo\\bar\\'), '/file.js').toString(), 'file:///c%3A/foo/bar/file.js');
                assert.strictEqual((0, resources_1.joinPath)(uri_1.URI.file('c:\\'), '/file.js').toString(), 'file:///c%3A/file.js');
                assert.strictEqual((0, resources_1.joinPath)(uri_1.URI.file('c:\\'), 'bar/file.js').toString(), 'file:///c%3A/bar/file.js');
                assert.strictEqual((0, resources_1.joinPath)(uri_1.URI.file('c:\\foo'), './file.js').toString(), 'file:///c%3A/foo/file.js');
                assert.strictEqual((0, resources_1.joinPath)(uri_1.URI.file('c:\\foo'), '/./file.js').toString(), 'file:///c%3A/foo/file.js');
                assert.strictEqual((0, resources_1.joinPath)(uri_1.URI.file('C:\\foo'), '../file.js').toString(), 'file:///c%3A/file.js');
                assert.strictEqual((0, resources_1.joinPath)(uri_1.URI.file('C:\\foo\\.'), '../file.js').toString(), 'file:///c%3A/file.js');
            }
            else {
                assert.strictEqual((0, resources_1.joinPath)(uri_1.URI.file('/foo/bar'), '/file.js').toString(), 'file:///foo/bar/file.js');
                assert.strictEqual((0, resources_1.joinPath)(uri_1.URI.file('/foo/bar'), 'file.js').toString(), 'file:///foo/bar/file.js');
                assert.strictEqual((0, resources_1.joinPath)(uri_1.URI.file('/foo/bar/'), '/file.js').toString(), 'file:///foo/bar/file.js');
                assert.strictEqual((0, resources_1.joinPath)(uri_1.URI.file('/'), '/file.js').toString(), 'file:///file.js');
                assert.strictEqual((0, resources_1.joinPath)(uri_1.URI.file('/foo/bar'), './file.js').toString(), 'file:///foo/bar/file.js');
                assert.strictEqual((0, resources_1.joinPath)(uri_1.URI.file('/foo/bar'), '/./file.js').toString(), 'file:///foo/bar/file.js');
                assert.strictEqual((0, resources_1.joinPath)(uri_1.URI.file('/foo/bar'), '../file.js').toString(), 'file:///foo/file.js');
            }
            assert.strictEqual((0, resources_1.joinPath)(uri_1.URI.parse('foo://a/foo/bar')).toString(), 'foo://a/foo/bar');
            assert.strictEqual((0, resources_1.joinPath)(uri_1.URI.parse('foo://a/foo/bar'), '/file.js').toString(), 'foo://a/foo/bar/file.js');
            assert.strictEqual((0, resources_1.joinPath)(uri_1.URI.parse('foo://a/foo/bar'), 'file.js').toString(), 'foo://a/foo/bar/file.js');
            assert.strictEqual((0, resources_1.joinPath)(uri_1.URI.parse('foo://a/foo/bar/'), '/file.js').toString(), 'foo://a/foo/bar/file.js');
            assert.strictEqual((0, resources_1.joinPath)(uri_1.URI.parse('foo://a/'), '/file.js').toString(), 'foo://a/file.js');
            assert.strictEqual((0, resources_1.joinPath)(uri_1.URI.parse('foo://a/foo/bar/'), './file.js').toString(), 'foo://a/foo/bar/file.js');
            assert.strictEqual((0, resources_1.joinPath)(uri_1.URI.parse('foo://a/foo/bar/'), '/./file.js').toString(), 'foo://a/foo/bar/file.js');
            assert.strictEqual((0, resources_1.joinPath)(uri_1.URI.parse('foo://a/foo/bar/'), '../file.js').toString(), 'foo://a/foo/file.js');
            assert.strictEqual((0, resources_1.joinPath)(uri_1.URI.from({ scheme: 'myScheme', authority: 'authority', path: '/path', query: 'query', fragment: 'fragment' }), '/file.js').toString(), 'myScheme://authority/path/file.js?query#fragment');
        });
        test('normalizePath', () => {
            if (platform_1.isWindows) {
                assert.strictEqual((0, resources_1.normalizePath)(uri_1.URI.file('c:\\foo\\.\\bar')).toString(), 'file:///c%3A/foo/bar');
                assert.strictEqual((0, resources_1.normalizePath)(uri_1.URI.file('c:\\foo\\.')).toString(), 'file:///c%3A/foo');
                assert.strictEqual((0, resources_1.normalizePath)(uri_1.URI.file('c:\\foo\\.\\')).toString(), 'file:///c%3A/foo/');
                assert.strictEqual((0, resources_1.normalizePath)(uri_1.URI.file('c:\\foo\\..')).toString(), 'file:///c%3A/');
                assert.strictEqual((0, resources_1.normalizePath)(uri_1.URI.file('c:\\foo\\..\\bar')).toString(), 'file:///c%3A/bar');
                assert.strictEqual((0, resources_1.normalizePath)(uri_1.URI.file('c:\\foo\\..\\..\\bar')).toString(), 'file:///c%3A/bar');
                assert.strictEqual((0, resources_1.normalizePath)(uri_1.URI.file('c:\\foo\\foo\\..\\..\\bar')).toString(), 'file:///c%3A/bar');
                assert.strictEqual((0, resources_1.normalizePath)(uri_1.URI.file('C:\\foo\\foo\\.\\..\\..\\bar')).toString(), 'file:///c%3A/bar');
                assert.strictEqual((0, resources_1.normalizePath)(uri_1.URI.file('C:\\foo\\foo\\.\\..\\some\\..\\bar')).toString(), 'file:///c%3A/foo/bar');
            }
            else {
                assert.strictEqual((0, resources_1.normalizePath)(uri_1.URI.file('/foo/./bar')).toString(), 'file:///foo/bar');
                assert.strictEqual((0, resources_1.normalizePath)(uri_1.URI.file('/foo/.')).toString(), 'file:///foo');
                assert.strictEqual((0, resources_1.normalizePath)(uri_1.URI.file('/foo/./')).toString(), 'file:///foo/');
                assert.strictEqual((0, resources_1.normalizePath)(uri_1.URI.file('/foo/..')).toString(), 'file:///');
                assert.strictEqual((0, resources_1.normalizePath)(uri_1.URI.file('/foo/../bar')).toString(), 'file:///bar');
                assert.strictEqual((0, resources_1.normalizePath)(uri_1.URI.file('/foo/../../bar')).toString(), 'file:///bar');
                assert.strictEqual((0, resources_1.normalizePath)(uri_1.URI.file('/foo/foo/../../bar')).toString(), 'file:///bar');
                assert.strictEqual((0, resources_1.normalizePath)(uri_1.URI.file('/foo/foo/./../../bar')).toString(), 'file:///bar');
                assert.strictEqual((0, resources_1.normalizePath)(uri_1.URI.file('/foo/foo/./../some/../bar')).toString(), 'file:///foo/bar');
                assert.strictEqual((0, resources_1.normalizePath)(uri_1.URI.file('/f')).toString(), 'file:///f');
            }
            assert.strictEqual((0, resources_1.normalizePath)(uri_1.URI.parse('foo://a/foo/./bar')).toString(), 'foo://a/foo/bar');
            assert.strictEqual((0, resources_1.normalizePath)(uri_1.URI.parse('foo://a/foo/.')).toString(), 'foo://a/foo');
            assert.strictEqual((0, resources_1.normalizePath)(uri_1.URI.parse('foo://a/foo/./')).toString(), 'foo://a/foo/');
            assert.strictEqual((0, resources_1.normalizePath)(uri_1.URI.parse('foo://a/foo/..')).toString(), 'foo://a/');
            assert.strictEqual((0, resources_1.normalizePath)(uri_1.URI.parse('foo://a/foo/../bar')).toString(), 'foo://a/bar');
            assert.strictEqual((0, resources_1.normalizePath)(uri_1.URI.parse('foo://a/foo/../../bar')).toString(), 'foo://a/bar');
            assert.strictEqual((0, resources_1.normalizePath)(uri_1.URI.parse('foo://a/foo/foo/../../bar')).toString(), 'foo://a/bar');
            assert.strictEqual((0, resources_1.normalizePath)(uri_1.URI.parse('foo://a/foo/foo/./../../bar')).toString(), 'foo://a/bar');
            assert.strictEqual((0, resources_1.normalizePath)(uri_1.URI.parse('foo://a/foo/foo/./../some/../bar')).toString(), 'foo://a/foo/bar');
            assert.strictEqual((0, resources_1.normalizePath)(uri_1.URI.parse('foo://a')).toString(), 'foo://a');
            assert.strictEqual((0, resources_1.normalizePath)(uri_1.URI.parse('foo://a/')).toString(), 'foo://a/');
            assert.strictEqual((0, resources_1.normalizePath)(uri_1.URI.parse('foo://a/foo/./bar?q=1')).toString(), uri_1.URI.parse('foo://a/foo/bar?q%3D1').toString());
        });
        test('isAbsolute', () => {
            if (platform_1.isWindows) {
                assert.strictEqual((0, resources_1.isAbsolutePath)(uri_1.URI.file('c:\\foo\\')), true);
                assert.strictEqual((0, resources_1.isAbsolutePath)(uri_1.URI.file('C:\\foo\\')), true);
                assert.strictEqual((0, resources_1.isAbsolutePath)(uri_1.URI.file('bar')), true); // URI normalizes all file URIs to be absolute
            }
            else {
                assert.strictEqual((0, resources_1.isAbsolutePath)(uri_1.URI.file('/foo/bar')), true);
                assert.strictEqual((0, resources_1.isAbsolutePath)(uri_1.URI.file('bar')), true); // URI normalizes all file URIs to be absolute
            }
            assert.strictEqual((0, resources_1.isAbsolutePath)(uri_1.URI.parse('foo:foo')), false);
            assert.strictEqual((0, resources_1.isAbsolutePath)(uri_1.URI.parse('foo://a/foo/.')), true);
        });
        function assertTrailingSeparator(u1, expected) {
            assert.strictEqual((0, resources_1.hasTrailingPathSeparator)(u1), expected, u1.toString());
        }
        function assertRemoveTrailingSeparator(u1, expected) {
            assertEqualURI((0, resources_1.removeTrailingPathSeparator)(u1), expected, u1.toString());
        }
        function assertAddTrailingSeparator(u1, expected) {
            assertEqualURI((0, resources_1.addTrailingPathSeparator)(u1), expected, u1.toString());
        }
        test('trailingPathSeparator', () => {
            assertTrailingSeparator(uri_1.URI.parse('foo://a/foo'), false);
            assertTrailingSeparator(uri_1.URI.parse('foo://a/foo/'), true);
            assertTrailingSeparator(uri_1.URI.parse('foo://a/'), false);
            assertTrailingSeparator(uri_1.URI.parse('foo://a'), false);
            assertRemoveTrailingSeparator(uri_1.URI.parse('foo://a/foo'), uri_1.URI.parse('foo://a/foo'));
            assertRemoveTrailingSeparator(uri_1.URI.parse('foo://a/foo/'), uri_1.URI.parse('foo://a/foo'));
            assertRemoveTrailingSeparator(uri_1.URI.parse('foo://a/'), uri_1.URI.parse('foo://a/'));
            assertRemoveTrailingSeparator(uri_1.URI.parse('foo://a'), uri_1.URI.parse('foo://a'));
            assertAddTrailingSeparator(uri_1.URI.parse('foo://a/foo'), uri_1.URI.parse('foo://a/foo/'));
            assertAddTrailingSeparator(uri_1.URI.parse('foo://a/foo/'), uri_1.URI.parse('foo://a/foo/'));
            assertAddTrailingSeparator(uri_1.URI.parse('foo://a/'), uri_1.URI.parse('foo://a/'));
            assertAddTrailingSeparator(uri_1.URI.parse('foo://a'), uri_1.URI.parse('foo://a/'));
            if (platform_1.isWindows) {
                assertTrailingSeparator(uri_1.URI.file('c:\\a\\foo'), false);
                assertTrailingSeparator(uri_1.URI.file('c:\\a\\foo\\'), true);
                assertTrailingSeparator(uri_1.URI.file('c:\\'), false);
                assertTrailingSeparator(uri_1.URI.file('\\\\server\\share\\some\\'), true);
                assertTrailingSeparator(uri_1.URI.file('\\\\server\\share\\'), false);
                assertRemoveTrailingSeparator(uri_1.URI.file('c:\\a\\foo'), uri_1.URI.file('c:\\a\\foo'));
                assertRemoveTrailingSeparator(uri_1.URI.file('c:\\a\\foo\\'), uri_1.URI.file('c:\\a\\foo'));
                assertRemoveTrailingSeparator(uri_1.URI.file('c:\\'), uri_1.URI.file('c:\\'));
                assertRemoveTrailingSeparator(uri_1.URI.file('\\\\server\\share\\some\\'), uri_1.URI.file('\\\\server\\share\\some'));
                assertRemoveTrailingSeparator(uri_1.URI.file('\\\\server\\share\\'), uri_1.URI.file('\\\\server\\share\\'));
                assertAddTrailingSeparator(uri_1.URI.file('c:\\a\\foo'), uri_1.URI.file('c:\\a\\foo\\'));
                assertAddTrailingSeparator(uri_1.URI.file('c:\\a\\foo\\'), uri_1.URI.file('c:\\a\\foo\\'));
                assertAddTrailingSeparator(uri_1.URI.file('c:\\'), uri_1.URI.file('c:\\'));
                assertAddTrailingSeparator(uri_1.URI.file('\\\\server\\share\\some'), uri_1.URI.file('\\\\server\\share\\some\\'));
                assertAddTrailingSeparator(uri_1.URI.file('\\\\server\\share\\some\\'), uri_1.URI.file('\\\\server\\share\\some\\'));
            }
            else {
                assertTrailingSeparator(uri_1.URI.file('/foo/bar'), false);
                assertTrailingSeparator(uri_1.URI.file('/foo/bar/'), true);
                assertTrailingSeparator(uri_1.URI.file('/'), false);
                assertRemoveTrailingSeparator(uri_1.URI.file('/foo/bar'), uri_1.URI.file('/foo/bar'));
                assertRemoveTrailingSeparator(uri_1.URI.file('/foo/bar/'), uri_1.URI.file('/foo/bar'));
                assertRemoveTrailingSeparator(uri_1.URI.file('/'), uri_1.URI.file('/'));
                assertAddTrailingSeparator(uri_1.URI.file('/foo/bar'), uri_1.URI.file('/foo/bar/'));
                assertAddTrailingSeparator(uri_1.URI.file('/foo/bar/'), uri_1.URI.file('/foo/bar/'));
                assertAddTrailingSeparator(uri_1.URI.file('/'), uri_1.URI.file('/'));
            }
        });
        function assertEqualURI(actual, expected, message, ignoreCase) {
            const util = ignoreCase ? resources_1.extUriIgnorePathCase : resources_1.extUri;
            if (!util.isEqual(expected, actual)) {
                assert.strictEqual(actual.toString(), expected.toString(), message);
            }
        }
        function assertRelativePath(u1, u2, expectedPath, ignoreJoin, ignoreCase) {
            const util = ignoreCase ? resources_1.extUriIgnorePathCase : resources_1.extUri;
            assert.strictEqual(util.relativePath(u1, u2), expectedPath, `from ${u1.toString()} to ${u2.toString()}`);
            if (expectedPath !== undefined && !ignoreJoin) {
                assertEqualURI((0, resources_1.removeTrailingPathSeparator)((0, resources_1.joinPath)(u1, expectedPath)), (0, resources_1.removeTrailingPathSeparator)(u2), 'joinPath on relativePath should be equal', ignoreCase);
            }
        }
        test('relativePath', () => {
            assertRelativePath(uri_1.URI.parse('foo://a/foo'), uri_1.URI.parse('foo://a/foo/bar'), 'bar');
            assertRelativePath(uri_1.URI.parse('foo://a/foo'), uri_1.URI.parse('foo://a/foo/bar/'), 'bar');
            assertRelativePath(uri_1.URI.parse('foo://a/foo'), uri_1.URI.parse('foo://a/foo/bar/goo'), 'bar/goo');
            assertRelativePath(uri_1.URI.parse('foo://a/'), uri_1.URI.parse('foo://a/foo/bar/goo'), 'foo/bar/goo');
            assertRelativePath(uri_1.URI.parse('foo://a/foo/xoo'), uri_1.URI.parse('foo://a/foo/bar'), '../bar');
            assertRelativePath(uri_1.URI.parse('foo://a/foo/xoo/yoo'), uri_1.URI.parse('foo://a'), '../../..', true);
            assertRelativePath(uri_1.URI.parse('foo://a/foo'), uri_1.URI.parse('foo://a/foo/'), '');
            assertRelativePath(uri_1.URI.parse('foo://a/foo/'), uri_1.URI.parse('foo://a/foo'), '');
            assertRelativePath(uri_1.URI.parse('foo://a/foo/'), uri_1.URI.parse('foo://a/foo/'), '');
            assertRelativePath(uri_1.URI.parse('foo://a/foo'), uri_1.URI.parse('foo://a/foo'), '');
            assertRelativePath(uri_1.URI.parse('foo://a'), uri_1.URI.parse('foo://a'), '', true);
            assertRelativePath(uri_1.URI.parse('foo://a/'), uri_1.URI.parse('foo://a/'), '');
            assertRelativePath(uri_1.URI.parse('foo://a/'), uri_1.URI.parse('foo://a'), '', true);
            assertRelativePath(uri_1.URI.parse('foo://a/foo?q'), uri_1.URI.parse('foo://a/foo/bar#h'), 'bar', true);
            assertRelativePath(uri_1.URI.parse('foo://'), uri_1.URI.parse('foo://a/b'), undefined);
            assertRelativePath(uri_1.URI.parse('foo://a2/b'), uri_1.URI.parse('foo://a/b'), undefined);
            assertRelativePath(uri_1.URI.parse('goo://a/b'), uri_1.URI.parse('foo://a/b'), undefined);
            assertRelativePath(uri_1.URI.parse('foo://a/foo'), uri_1.URI.parse('foo://A/FOO/bar/goo'), 'bar/goo', false, true);
            assertRelativePath(uri_1.URI.parse('foo://a/foo'), uri_1.URI.parse('foo://A/FOO/BAR/GOO'), 'BAR/GOO', false, true);
            assertRelativePath(uri_1.URI.parse('foo://a/foo/xoo'), uri_1.URI.parse('foo://A/FOO/BAR/GOO'), '../BAR/GOO', false, true);
            assertRelativePath(uri_1.URI.parse('foo:///c:/a/foo'), uri_1.URI.parse('foo:///C:/a/foo/xoo/'), 'xoo', false, true);
            if (platform_1.isWindows) {
                assertRelativePath(uri_1.URI.file('c:\\foo\\bar'), uri_1.URI.file('c:\\foo\\bar'), '');
                assertRelativePath(uri_1.URI.file('c:\\foo\\bar\\huu'), uri_1.URI.file('c:\\foo\\bar'), '..');
                assertRelativePath(uri_1.URI.file('c:\\foo\\bar\\a1\\a2'), uri_1.URI.file('c:\\foo\\bar'), '../..');
                assertRelativePath(uri_1.URI.file('c:\\foo\\bar\\'), uri_1.URI.file('c:\\foo\\bar\\a1\\a2'), 'a1/a2');
                assertRelativePath(uri_1.URI.file('c:\\foo\\bar\\'), uri_1.URI.file('c:\\foo\\bar\\a1\\a2\\'), 'a1/a2');
                assertRelativePath(uri_1.URI.file('c:\\'), uri_1.URI.file('c:\\foo\\bar'), 'foo/bar');
                assertRelativePath(uri_1.URI.file('\\\\server\\share\\some\\'), uri_1.URI.file('\\\\server\\share\\some\\path'), 'path');
                assertRelativePath(uri_1.URI.file('\\\\server\\share\\some\\'), uri_1.URI.file('\\\\server\\share2\\some\\path'), '../../share2/some/path', true); // ignore joinPath assert: path.join is not root aware
            }
            else {
                assertRelativePath(uri_1.URI.file('/a/foo'), uri_1.URI.file('/a/foo/bar'), 'bar');
                assertRelativePath(uri_1.URI.file('/a/foo'), uri_1.URI.file('/a/foo/bar/'), 'bar');
                assertRelativePath(uri_1.URI.file('/a/foo'), uri_1.URI.file('/a/foo/bar/goo'), 'bar/goo');
                assertRelativePath(uri_1.URI.file('/a/'), uri_1.URI.file('/a/foo/bar/goo'), 'foo/bar/goo');
                assertRelativePath(uri_1.URI.file('/'), uri_1.URI.file('/a/foo/bar/goo'), 'a/foo/bar/goo');
                assertRelativePath(uri_1.URI.file('/a/foo/xoo'), uri_1.URI.file('/a/foo/bar'), '../bar');
                assertRelativePath(uri_1.URI.file('/a/foo/xoo/yoo'), uri_1.URI.file('/a'), '../../..');
                assertRelativePath(uri_1.URI.file('/a/foo'), uri_1.URI.file('/a/foo/'), '');
                assertRelativePath(uri_1.URI.file('/a/foo'), uri_1.URI.file('/b/foo/'), '../../b/foo');
            }
        });
        function assertResolve(u1, path, expected) {
            const actual = (0, resources_1.resolvePath)(u1, path);
            assertEqualURI(actual, expected, `from ${u1.toString()} and ${path}`);
            const p = path.indexOf('/') !== -1 ? path_1.posix : path_1.win32;
            if (!p.isAbsolute(path)) {
                let expectedPath = platform_1.isWindows ? (0, extpath_1.toSlashes)(path) : path;
                expectedPath = expectedPath.startsWith('./') ? expectedPath.substr(2) : expectedPath;
                assert.strictEqual((0, resources_1.relativePath)(u1, actual), expectedPath, `relativePath (${u1.toString()}) on actual (${actual.toString()}) should be to path (${expectedPath})`);
            }
        }
        test('resolve', () => {
            if (platform_1.isWindows) {
                assertResolve(uri_1.URI.file('c:\\foo\\bar'), 'file.js', uri_1.URI.file('c:\\foo\\bar\\file.js'));
                assertResolve(uri_1.URI.file('c:\\foo\\bar'), 't\\file.js', uri_1.URI.file('c:\\foo\\bar\\t\\file.js'));
                assertResolve(uri_1.URI.file('c:\\foo\\bar'), '.\\t\\file.js', uri_1.URI.file('c:\\foo\\bar\\t\\file.js'));
                assertResolve(uri_1.URI.file('c:\\foo\\bar'), 'a1/file.js', uri_1.URI.file('c:\\foo\\bar\\a1\\file.js'));
                assertResolve(uri_1.URI.file('c:\\foo\\bar'), './a1/file.js', uri_1.URI.file('c:\\foo\\bar\\a1\\file.js'));
                assertResolve(uri_1.URI.file('c:\\foo\\bar'), '\\b1\\file.js', uri_1.URI.file('c:\\b1\\file.js'));
                assertResolve(uri_1.URI.file('c:\\foo\\bar'), '/b1/file.js', uri_1.URI.file('c:\\b1\\file.js'));
                assertResolve(uri_1.URI.file('c:\\foo\\bar\\'), 'file.js', uri_1.URI.file('c:\\foo\\bar\\file.js'));
                assertResolve(uri_1.URI.file('c:\\'), 'file.js', uri_1.URI.file('c:\\file.js'));
                assertResolve(uri_1.URI.file('c:\\'), '\\b1\\file.js', uri_1.URI.file('c:\\b1\\file.js'));
                assertResolve(uri_1.URI.file('c:\\'), '/b1/file.js', uri_1.URI.file('c:\\b1\\file.js'));
                assertResolve(uri_1.URI.file('c:\\'), 'd:\\foo\\bar.txt', uri_1.URI.file('d:\\foo\\bar.txt'));
                assertResolve(uri_1.URI.file('\\\\server\\share\\some\\'), 'b1\\file.js', uri_1.URI.file('\\\\server\\share\\some\\b1\\file.js'));
                assertResolve(uri_1.URI.file('\\\\server\\share\\some\\'), '\\file.js', uri_1.URI.file('\\\\server\\share\\file.js'));
                assertResolve(uri_1.URI.file('c:\\'), '\\\\server\\share\\some\\', uri_1.URI.file('\\\\server\\share\\some'));
                assertResolve(uri_1.URI.file('\\\\server\\share\\some\\'), 'c:\\', uri_1.URI.file('c:\\'));
            }
            else {
                assertResolve(uri_1.URI.file('/foo/bar'), 'file.js', uri_1.URI.file('/foo/bar/file.js'));
                assertResolve(uri_1.URI.file('/foo/bar'), './file.js', uri_1.URI.file('/foo/bar/file.js'));
                assertResolve(uri_1.URI.file('/foo/bar'), '/file.js', uri_1.URI.file('/file.js'));
                assertResolve(uri_1.URI.file('/foo/bar/'), 'file.js', uri_1.URI.file('/foo/bar/file.js'));
                assertResolve(uri_1.URI.file('/'), 'file.js', uri_1.URI.file('/file.js'));
                assertResolve(uri_1.URI.file(''), './file.js', uri_1.URI.file('/file.js'));
                assertResolve(uri_1.URI.file(''), '/file.js', uri_1.URI.file('/file.js'));
            }
            assertResolve(uri_1.URI.parse('foo://server/foo/bar'), 'file.js', uri_1.URI.parse('foo://server/foo/bar/file.js'));
            assertResolve(uri_1.URI.parse('foo://server/foo/bar'), './file.js', uri_1.URI.parse('foo://server/foo/bar/file.js'));
            assertResolve(uri_1.URI.parse('foo://server/foo/bar'), './file.js', uri_1.URI.parse('foo://server/foo/bar/file.js'));
            assertResolve(uri_1.URI.parse('foo://server/foo/bar'), 'c:\\a1\\b1', uri_1.URI.parse('foo://server/c:/a1/b1'));
            assertResolve(uri_1.URI.parse('foo://server/foo/bar'), 'c:\\', uri_1.URI.parse('foo://server/c:'));
        });
        function assertIsEqual(u1, u2, ignoreCase, expected) {
            const util = ignoreCase ? resources_1.extUriIgnorePathCase : resources_1.extUri;
            assert.strictEqual(util.isEqual(u1, u2), expected, `${u1.toString()}${expected ? '===' : '!=='}${u2.toString()}`);
            assert.strictEqual(util.compare(u1, u2) === 0, expected);
            assert.strictEqual(util.getComparisonKey(u1) === util.getComparisonKey(u2), expected, `comparison keys ${u1.toString()}, ${u2.toString()}`);
            assert.strictEqual(util.isEqualOrParent(u1, u2), expected, `isEqualOrParent ${u1.toString()}, ${u2.toString()}`);
            if (!ignoreCase) {
                assert.strictEqual(u1.toString() === u2.toString(), expected);
            }
        }
        test('isEqual', () => {
            const fileURI = platform_1.isWindows ? uri_1.URI.file('c:\\foo\\bar') : uri_1.URI.file('/foo/bar');
            const fileURI2 = platform_1.isWindows ? uri_1.URI.file('C:\\foo\\Bar') : uri_1.URI.file('/foo/Bar');
            assertIsEqual(fileURI, fileURI, true, true);
            assertIsEqual(fileURI, fileURI, false, true);
            assertIsEqual(fileURI, fileURI, undefined, true);
            assertIsEqual(fileURI, fileURI2, true, true);
            assertIsEqual(fileURI, fileURI2, false, false);
            const fileURI3 = uri_1.URI.parse('foo://server:453/foo/bar');
            const fileURI4 = uri_1.URI.parse('foo://server:453/foo/Bar');
            assertIsEqual(fileURI3, fileURI3, true, true);
            assertIsEqual(fileURI3, fileURI3, false, true);
            assertIsEqual(fileURI3, fileURI3, undefined, true);
            assertIsEqual(fileURI3, fileURI4, true, true);
            assertIsEqual(fileURI3, fileURI4, false, false);
            assertIsEqual(fileURI, fileURI3, true, false);
            assertIsEqual(uri_1.URI.parse('file://server'), uri_1.URI.parse('file://server/'), true, true);
            assertIsEqual(uri_1.URI.parse('http://server'), uri_1.URI.parse('http://server/'), true, true);
            assertIsEqual(uri_1.URI.parse('foo://server'), uri_1.URI.parse('foo://server/'), true, false); // only selected scheme have / as the default path
            assertIsEqual(uri_1.URI.parse('foo://server/foo'), uri_1.URI.parse('foo://server/foo/'), true, false);
            assertIsEqual(uri_1.URI.parse('foo://server/foo'), uri_1.URI.parse('foo://server/foo?'), true, true);
            const fileURI5 = uri_1.URI.parse('foo://server:453/foo/bar?q=1');
            const fileURI6 = uri_1.URI.parse('foo://server:453/foo/bar#xy');
            assertIsEqual(fileURI5, fileURI5, true, true);
            assertIsEqual(fileURI5, fileURI3, true, false);
            assertIsEqual(fileURI6, fileURI6, true, true);
            assertIsEqual(fileURI6, fileURI5, true, false);
            assertIsEqual(fileURI6, fileURI3, true, false);
        });
        test('isEqualOrParent', () => {
            const fileURI = platform_1.isWindows ? uri_1.URI.file('c:\\foo\\bar') : uri_1.URI.file('/foo/bar');
            const fileURI2 = platform_1.isWindows ? uri_1.URI.file('c:\\foo') : uri_1.URI.file('/foo');
            const fileURI2b = platform_1.isWindows ? uri_1.URI.file('C:\\Foo\\') : uri_1.URI.file('/Foo/');
            assert.strictEqual(resources_1.extUriIgnorePathCase.isEqualOrParent(fileURI, fileURI), true, '1');
            assert.strictEqual(resources_1.extUri.isEqualOrParent(fileURI, fileURI), true, '2');
            assert.strictEqual(resources_1.extUriIgnorePathCase.isEqualOrParent(fileURI, fileURI2), true, '3');
            assert.strictEqual(resources_1.extUri.isEqualOrParent(fileURI, fileURI2), true, '4');
            assert.strictEqual(resources_1.extUriIgnorePathCase.isEqualOrParent(fileURI, fileURI2b), true, '5');
            assert.strictEqual(resources_1.extUri.isEqualOrParent(fileURI, fileURI2b), false, '6');
            assert.strictEqual(resources_1.extUri.isEqualOrParent(fileURI2, fileURI), false, '7');
            assert.strictEqual(resources_1.extUriIgnorePathCase.isEqualOrParent(fileURI2b, fileURI2), true, '8');
            const fileURI3 = uri_1.URI.parse('foo://server:453/foo/bar/goo');
            const fileURI4 = uri_1.URI.parse('foo://server:453/foo/');
            const fileURI5 = uri_1.URI.parse('foo://server:453/foo');
            assert.strictEqual(resources_1.extUriIgnorePathCase.isEqualOrParent(fileURI3, fileURI3, true), true, '11');
            assert.strictEqual(resources_1.extUri.isEqualOrParent(fileURI3, fileURI3), true, '12');
            assert.strictEqual(resources_1.extUriIgnorePathCase.isEqualOrParent(fileURI3, fileURI4, true), true, '13');
            assert.strictEqual(resources_1.extUri.isEqualOrParent(fileURI3, fileURI4), true, '14');
            assert.strictEqual(resources_1.extUriIgnorePathCase.isEqualOrParent(fileURI3, fileURI, true), false, '15');
            assert.strictEqual(resources_1.extUriIgnorePathCase.isEqualOrParent(fileURI5, fileURI5, true), true, '16');
            const fileURI6 = uri_1.URI.parse('foo://server:453/foo?q=1');
            const fileURI7 = uri_1.URI.parse('foo://server:453/foo/bar?q=1');
            assert.strictEqual(resources_1.extUriIgnorePathCase.isEqualOrParent(fileURI6, fileURI5), false, '17');
            assert.strictEqual(resources_1.extUriIgnorePathCase.isEqualOrParent(fileURI6, fileURI6), true, '18');
            assert.strictEqual(resources_1.extUriIgnorePathCase.isEqualOrParent(fileURI7, fileURI6), true, '19');
            assert.strictEqual(resources_1.extUriIgnorePathCase.isEqualOrParent(fileURI7, fileURI5), false, '20');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2VzLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL3Rlc3QvY29tbW9uL3Jlc291cmNlcy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVlBLEtBQUssQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFO1FBRXZCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUU7WUFFNUIsUUFBUTtZQUNSLElBQUksU0FBUyxHQUFHO2dCQUNmLFNBQUcsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUM7Z0JBQ2xDLFNBQUcsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUM7Z0JBQ2xDLFNBQUcsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUM7YUFDbEMsQ0FBQztZQUVGLElBQUksUUFBUSxHQUFHLElBQUEsMkJBQWUsRUFBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsRCxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdkMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDcEUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDcEUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFFcEUsaUJBQWlCO1lBQ2pCLFNBQVMsR0FBRztn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QUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsRUFBRSxTQUFHLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzVFLGtCQUFrQixDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLEVBQUUsU0FBRyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUM1RSxrQkFBa0IsQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxFQUFFLFNBQUcsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDN0Usa0JBQWtCLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsRUFBRSxTQUFHLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzNFLGtCQUFrQixDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEVBQUUsU0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDekUsa0JBQWtCLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRSxTQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3JFLGtCQUFrQixDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQUUsU0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDMUUsa0JBQWtCLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsRUFBRSxTQUFHLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzVGLGtCQUFrQixDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsU0FBRyxD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