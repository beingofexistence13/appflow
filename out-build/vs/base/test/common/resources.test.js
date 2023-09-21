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
            let distinct = (0, resources_1.$rg)(resources, r => r);
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
            distinct = (0, resources_1.$rg)(resources, r => r);
            assert.strictEqual(distinct.length, 3);
            assert.strictEqual(distinct[0].toString(), resources[0].toString());
            assert.strictEqual(distinct[1].toString(), resources[3].toString());
            assert.strictEqual(distinct[2].toString(), resources[4].toString());
        });
        test('dirname', () => {
            if (platform_1.$i) {
                assert.strictEqual((0, resources_1.$hg)(uri_1.URI.file('c:\\some\\file\\test.txt')).toString(), 'file:///c%3A/some/file');
                assert.strictEqual((0, resources_1.$hg)(uri_1.URI.file('c:\\some\\file')).toString(), 'file:///c%3A/some');
                assert.strictEqual((0, resources_1.$hg)(uri_1.URI.file('c:\\some\\file\\')).toString(), 'file:///c%3A/some');
                assert.strictEqual((0, resources_1.$hg)(uri_1.URI.file('c:\\some')).toString(), 'file:///c%3A/');
                assert.strictEqual((0, resources_1.$hg)(uri_1.URI.file('C:\\some')).toString(), 'file:///c%3A/');
                assert.strictEqual((0, resources_1.$hg)(uri_1.URI.file('c:\\')).toString(), 'file:///c%3A/');
            }
            else {
                assert.strictEqual((0, resources_1.$hg)(uri_1.URI.file('/some/file/test.txt')).toString(), 'file:///some/file');
                assert.strictEqual((0, resources_1.$hg)(uri_1.URI.file('/some/file/')).toString(), 'file:///some');
                assert.strictEqual((0, resources_1.$hg)(uri_1.URI.file('/some/file')).toString(), 'file:///some');
            }
            assert.strictEqual((0, resources_1.$hg)(uri_1.URI.parse('foo://a/some/file/test.txt')).toString(), 'foo://a/some/file');
            assert.strictEqual((0, resources_1.$hg)(uri_1.URI.parse('foo://a/some/file/')).toString(), 'foo://a/some');
            assert.strictEqual((0, resources_1.$hg)(uri_1.URI.parse('foo://a/some/file')).toString(), 'foo://a/some');
            assert.strictEqual((0, resources_1.$hg)(uri_1.URI.parse('foo://a/some')).toString(), 'foo://a/');
            assert.strictEqual((0, resources_1.$hg)(uri_1.URI.parse('foo://a/')).toString(), 'foo://a/');
            assert.strictEqual((0, resources_1.$hg)(uri_1.URI.parse('foo://a')).toString(), 'foo://a');
            // does not explode (https://github.com/microsoft/vscode/issues/41987)
            (0, resources_1.$hg)(uri_1.URI.from({ scheme: 'file', authority: '/users/someone/portal.h' }));
            assert.strictEqual((0, resources_1.$hg)(uri_1.URI.parse('foo://a/b/c?q')).toString(), 'foo://a/b?q');
        });
        test('basename', () => {
            if (platform_1.$i) {
                assert.strictEqual((0, resources_1.$fg)(uri_1.URI.file('c:\\some\\file\\test.txt')), 'test.txt');
                assert.strictEqual((0, resources_1.$fg)(uri_1.URI.file('c:\\some\\file')), 'file');
                assert.strictEqual((0, resources_1.$fg)(uri_1.URI.file('c:\\some\\file\\')), 'file');
                assert.strictEqual((0, resources_1.$fg)(uri_1.URI.file('C:\\some\\file\\')), 'file');
            }
            else {
                assert.strictEqual((0, resources_1.$fg)(uri_1.URI.file('/some/file/test.txt')), 'test.txt');
                assert.strictEqual((0, resources_1.$fg)(uri_1.URI.file('/some/file/')), 'file');
                assert.strictEqual((0, resources_1.$fg)(uri_1.URI.file('/some/file')), 'file');
                assert.strictEqual((0, resources_1.$fg)(uri_1.URI.file('/some')), 'some');
            }
            assert.strictEqual((0, resources_1.$fg)(uri_1.URI.parse('foo://a/some/file/test.txt')), 'test.txt');
            assert.strictEqual((0, resources_1.$fg)(uri_1.URI.parse('foo://a/some/file/')), 'file');
            assert.strictEqual((0, resources_1.$fg)(uri_1.URI.parse('foo://a/some/file')), 'file');
            assert.strictEqual((0, resources_1.$fg)(uri_1.URI.parse('foo://a/some')), 'some');
            assert.strictEqual((0, resources_1.$fg)(uri_1.URI.parse('foo://a/')), '');
            assert.strictEqual((0, resources_1.$fg)(uri_1.URI.parse('foo://a')), '');
        });
        test('joinPath', () => {
            if (platform_1.$i) {
                assert.strictEqual((0, resources_1.$ig)(uri_1.URI.file('c:\\foo\\bar'), '/file.js').toString(), 'file:///c%3A/foo/bar/file.js');
                assert.strictEqual((0, resources_1.$ig)(uri_1.URI.file('c:\\foo\\bar\\'), 'file.js').toString(), 'file:///c%3A/foo/bar/file.js');
                assert.strictEqual((0, resources_1.$ig)(uri_1.URI.file('c:\\foo\\bar\\'), '/file.js').toString(), 'file:///c%3A/foo/bar/file.js');
                assert.strictEqual((0, resources_1.$ig)(uri_1.URI.file('c:\\'), '/file.js').toString(), 'file:///c%3A/file.js');
                assert.strictEqual((0, resources_1.$ig)(uri_1.URI.file('c:\\'), 'bar/file.js').toString(), 'file:///c%3A/bar/file.js');
                assert.strictEqual((0, resources_1.$ig)(uri_1.URI.file('c:\\foo'), './file.js').toString(), 'file:///c%3A/foo/file.js');
                assert.strictEqual((0, resources_1.$ig)(uri_1.URI.file('c:\\foo'), '/./file.js').toString(), 'file:///c%3A/foo/file.js');
                assert.strictEqual((0, resources_1.$ig)(uri_1.URI.file('C:\\foo'), '../file.js').toString(), 'file:///c%3A/file.js');
                assert.strictEqual((0, resources_1.$ig)(uri_1.URI.file('C:\\foo\\.'), '../file.js').toString(), 'file:///c%3A/file.js');
            }
            else {
                assert.strictEqual((0, resources_1.$ig)(uri_1.URI.file('/foo/bar'), '/file.js').toString(), 'file:///foo/bar/file.js');
                assert.strictEqual((0, resources_1.$ig)(uri_1.URI.file('/foo/bar'), 'file.js').toString(), 'file:///foo/bar/file.js');
                assert.strictEqual((0, resources_1.$ig)(uri_1.URI.file('/foo/bar/'), '/file.js').toString(), 'file:///foo/bar/file.js');
                assert.strictEqual((0, resources_1.$ig)(uri_1.URI.file('/'), '/file.js').toString(), 'file:///file.js');
                assert.strictEqual((0, resources_1.$ig)(uri_1.URI.file('/foo/bar'), './file.js').toString(), 'file:///foo/bar/file.js');
                assert.strictEqual((0, resources_1.$ig)(uri_1.URI.file('/foo/bar'), '/./file.js').toString(), 'file:///foo/bar/file.js');
                assert.strictEqual((0, resources_1.$ig)(uri_1.URI.file('/foo/bar'), '../file.js').toString(), 'file:///foo/file.js');
            }
            assert.strictEqual((0, resources_1.$ig)(uri_1.URI.parse('foo://a/foo/bar')).toString(), 'foo://a/foo/bar');
            assert.strictEqual((0, resources_1.$ig)(uri_1.URI.parse('foo://a/foo/bar'), '/file.js').toString(), 'foo://a/foo/bar/file.js');
            assert.strictEqual((0, resources_1.$ig)(uri_1.URI.parse('foo://a/foo/bar'), 'file.js').toString(), 'foo://a/foo/bar/file.js');
            assert.strictEqual((0, resources_1.$ig)(uri_1.URI.parse('foo://a/foo/bar/'), '/file.js').toString(), 'foo://a/foo/bar/file.js');
            assert.strictEqual((0, resources_1.$ig)(uri_1.URI.parse('foo://a/'), '/file.js').toString(), 'foo://a/file.js');
            assert.strictEqual((0, resources_1.$ig)(uri_1.URI.parse('foo://a/foo/bar/'), './file.js').toString(), 'foo://a/foo/bar/file.js');
            assert.strictEqual((0, resources_1.$ig)(uri_1.URI.parse('foo://a/foo/bar/'), '/./file.js').toString(), 'foo://a/foo/bar/file.js');
            assert.strictEqual((0, resources_1.$ig)(uri_1.URI.parse('foo://a/foo/bar/'), '../file.js').toString(), 'foo://a/foo/file.js');
            assert.strictEqual((0, resources_1.$ig)(uri_1.URI.from({ scheme: 'myScheme', authority: 'authority', path: '/path', query: 'query', fragment: 'fragment' }), '/file.js').toString(), 'myScheme://authority/path/file.js?query#fragment');
        });
        test('normalizePath', () => {
            if (platform_1.$i) {
                assert.strictEqual((0, resources_1.$jg)(uri_1.URI.file('c:\\foo\\.\\bar')).toString(), 'file:///c%3A/foo/bar');
                assert.strictEqual((0, resources_1.$jg)(uri_1.URI.file('c:\\foo\\.')).toString(), 'file:///c%3A/foo');
                assert.strictEqual((0, resources_1.$jg)(uri_1.URI.file('c:\\foo\\.\\')).toString(), 'file:///c%3A/foo/');
                assert.strictEqual((0, resources_1.$jg)(uri_1.URI.file('c:\\foo\\..')).toString(), 'file:///c%3A/');
                assert.strictEqual((0, resources_1.$jg)(uri_1.URI.file('c:\\foo\\..\\bar')).toString(), 'file:///c%3A/bar');
                assert.strictEqual((0, resources_1.$jg)(uri_1.URI.file('c:\\foo\\..\\..\\bar')).toString(), 'file:///c%3A/bar');
                assert.strictEqual((0, resources_1.$jg)(uri_1.URI.file('c:\\foo\\foo\\..\\..\\bar')).toString(), 'file:///c%3A/bar');
                assert.strictEqual((0, resources_1.$jg)(uri_1.URI.file('C:\\foo\\foo\\.\\..\\..\\bar')).toString(), 'file:///c%3A/bar');
                assert.strictEqual((0, resources_1.$jg)(uri_1.URI.file('C:\\foo\\foo\\.\\..\\some\\..\\bar')).toString(), 'file:///c%3A/foo/bar');
            }
            else {
                assert.strictEqual((0, resources_1.$jg)(uri_1.URI.file('/foo/./bar')).toString(), 'file:///foo/bar');
                assert.strictEqual((0, resources_1.$jg)(uri_1.URI.file('/foo/.')).toString(), 'file:///foo');
                assert.strictEqual((0, resources_1.$jg)(uri_1.URI.file('/foo/./')).toString(), 'file:///foo/');
                assert.strictEqual((0, resources_1.$jg)(uri_1.URI.file('/foo/..')).toString(), 'file:///');
                assert.strictEqual((0, resources_1.$jg)(uri_1.URI.file('/foo/../bar')).toString(), 'file:///bar');
                assert.strictEqual((0, resources_1.$jg)(uri_1.URI.file('/foo/../../bar')).toString(), 'file:///bar');
                assert.strictEqual((0, resources_1.$jg)(uri_1.URI.file('/foo/foo/../../bar')).toString(), 'file:///bar');
                assert.strictEqual((0, resources_1.$jg)(uri_1.URI.file('/foo/foo/./../../bar')).toString(), 'file:///bar');
                assert.strictEqual((0, resources_1.$jg)(uri_1.URI.file('/foo/foo/./../some/../bar')).toString(), 'file:///foo/bar');
                assert.strictEqual((0, resources_1.$jg)(uri_1.URI.file('/f')).toString(), 'file:///f');
            }
            assert.strictEqual((0, resources_1.$jg)(uri_1.URI.parse('foo://a/foo/./bar')).toString(), 'foo://a/foo/bar');
            assert.strictEqual((0, resources_1.$jg)(uri_1.URI.parse('foo://a/foo/.')).toString(), 'foo://a/foo');
            assert.strictEqual((0, resources_1.$jg)(uri_1.URI.parse('foo://a/foo/./')).toString(), 'foo://a/foo/');
            assert.strictEqual((0, resources_1.$jg)(uri_1.URI.parse('foo://a/foo/..')).toString(), 'foo://a/');
            assert.strictEqual((0, resources_1.$jg)(uri_1.URI.parse('foo://a/foo/../bar')).toString(), 'foo://a/bar');
            assert.strictEqual((0, resources_1.$jg)(uri_1.URI.parse('foo://a/foo/../../bar')).toString(), 'foo://a/bar');
            assert.strictEqual((0, resources_1.$jg)(uri_1.URI.parse('foo://a/foo/foo/../../bar')).toString(), 'foo://a/bar');
            assert.strictEqual((0, resources_1.$jg)(uri_1.URI.parse('foo://a/foo/foo/./../../bar')).toString(), 'foo://a/bar');
            assert.strictEqual((0, resources_1.$jg)(uri_1.URI.parse('foo://a/foo/foo/./../some/../bar')).toString(), 'foo://a/foo/bar');
            assert.strictEqual((0, resources_1.$jg)(uri_1.URI.parse('foo://a')).toString(), 'foo://a');
            assert.strictEqual((0, resources_1.$jg)(uri_1.URI.parse('foo://a/')).toString(), 'foo://a/');
            assert.strictEqual((0, resources_1.$jg)(uri_1.URI.parse('foo://a/foo/./bar?q=1')).toString(), uri_1.URI.parse('foo://a/foo/bar?q%3D1').toString());
        });
        test('isAbsolute', () => {
            if (platform_1.$i) {
                assert.strictEqual((0, resources_1.$mg)(uri_1.URI.file('c:\\foo\\')), true);
                assert.strictEqual((0, resources_1.$mg)(uri_1.URI.file('C:\\foo\\')), true);
                assert.strictEqual((0, resources_1.$mg)(uri_1.URI.file('bar')), true); // URI normalizes all file URIs to be absolute
            }
            else {
                assert.strictEqual((0, resources_1.$mg)(uri_1.URI.file('/foo/bar')), true);
                assert.strictEqual((0, resources_1.$mg)(uri_1.URI.file('bar')), true); // URI normalizes all file URIs to be absolute
            }
            assert.strictEqual((0, resources_1.$mg)(uri_1.URI.parse('foo:foo')), false);
            assert.strictEqual((0, resources_1.$mg)(uri_1.URI.parse('foo://a/foo/.')), true);
        });
        function assertTrailingSeparator(u1, expected) {
            assert.strictEqual((0, resources_1.$og)(u1), expected, u1.toString());
        }
        function assertRemoveTrailingSeparator(u1, expected) {
            assertEqualURI((0, resources_1.$pg)(u1), expected, u1.toString());
        }
        function assertAddTrailingSeparator(u1, expected) {
            assertEqualURI((0, resources_1.$qg)(u1), expected, u1.toString());
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
            if (platform_1.$i) {
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
            const util = ignoreCase ? resources_1.$ag : resources_1.$$f;
            if (!util.isEqual(expected, actual)) {
                assert.strictEqual(actual.toString(), expected.toString(), message);
            }
        }
        function assertRelativePath(u1, u2, expectedPath, ignoreJoin, ignoreCase) {
            const util = ignoreCase ? resources_1.$ag : resources_1.$$f;
            assert.strictEqual(util.relativePath(u1, u2), expectedPath, `from ${u1.toString()} to ${u2.toString()}`);
            if (expectedPath !== undefined && !ignoreJoin) {
                assertEqualURI((0, resources_1.$pg)((0, resources_1.$ig)(u1, expectedPath)), (0, resources_1.$pg)(u2), 'joinPath on relativePath should be equal', ignoreCase);
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
            if (platform_1.$i) {
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
            const actual = (0, resources_1.$lg)(u1, path);
            assertEqualURI(actual, expected, `from ${u1.toString()} and ${path}`);
            const p = path.indexOf('/') !== -1 ? path_1.$6d : path_1.$5d;
            if (!p.isAbsolute(path)) {
                let expectedPath = platform_1.$i ? (0, extpath_1.$Cf)(path) : path;
                expectedPath = expectedPath.startsWith('./') ? expectedPath.substr(2) : expectedPath;
                assert.strictEqual((0, resources_1.$kg)(u1, actual), expectedPath, `relativePath (${u1.toString()}) on actual (${actual.toString()}) should be to path (${expectedPath})`);
            }
        }
        test('resolve', () => {
            if (platform_1.$i) {
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
            const util = ignoreCase ? resources_1.$ag : resources_1.$$f;
            assert.strictEqual(util.isEqual(u1, u2), expected, `${u1.toString()}${expected ? '===' : '!=='}${u2.toString()}`);
            assert.strictEqual(util.compare(u1, u2) === 0, expected);
            assert.strictEqual(util.getComparisonKey(u1) === util.getComparisonKey(u2), expected, `comparison keys ${u1.toString()}, ${u2.toString()}`);
            assert.strictEqual(util.isEqualOrParent(u1, u2), expected, `isEqualOrParent ${u1.toString()}, ${u2.toString()}`);
            if (!ignoreCase) {
                assert.strictEqual(u1.toString() === u2.toString(), expected);
            }
        }
        test('isEqual', () => {
            const fileURI = platform_1.$i ? uri_1.URI.file('c:\\foo\\bar') : uri_1.URI.file('/foo/bar');
            const fileURI2 = platform_1.$i ? uri_1.URI.file('C:\\foo\\Bar') : uri_1.URI.file('/foo/Bar');
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
            const fileURI = platform_1.$i ? uri_1.URI.file('c:\\foo\\bar') : uri_1.URI.file('/foo/bar');
            const fileURI2 = platform_1.$i ? uri_1.URI.file('c:\\foo') : uri_1.URI.file('/foo');
            const fileURI2b = platform_1.$i ? uri_1.URI.file('C:\\Foo\\') : uri_1.URI.file('/Foo/');
            assert.strictEqual(resources_1.$ag.isEqualOrParent(fileURI, fileURI), true, '1');
            assert.strictEqual(resources_1.$$f.isEqualOrParent(fileURI, fileURI), true, '2');
            assert.strictEqual(resources_1.$ag.isEqualOrParent(fileURI, fileURI2), true, '3');
            assert.strictEqual(resources_1.$$f.isEqualOrParent(fileURI, fileURI2), true, '4');
            assert.strictEqual(resources_1.$ag.isEqualOrParent(fileURI, fileURI2b), true, '5');
            assert.strictEqual(resources_1.$$f.isEqualOrParent(fileURI, fileURI2b), false, '6');
            assert.strictEqual(resources_1.$$f.isEqualOrParent(fileURI2, fileURI), false, '7');
            assert.strictEqual(resources_1.$ag.isEqualOrParent(fileURI2b, fileURI2), true, '8');
            const fileURI3 = uri_1.URI.parse('foo://server:453/foo/bar/goo');
            const fileURI4 = uri_1.URI.parse('foo://server:453/foo/');
            const fileURI5 = uri_1.URI.parse('foo://server:453/foo');
            assert.strictEqual(resources_1.$ag.isEqualOrParent(fileURI3, fileURI3, true), true, '11');
            assert.strictEqual(resources_1.$$f.isEqualOrParent(fileURI3, fileURI3), true, '12');
            assert.strictEqual(resources_1.$ag.isEqualOrParent(fileURI3, fileURI4, true), true, '13');
            assert.strictEqual(resources_1.$$f.isEqualOrParent(fileURI3, fileURI4), true, '14');
            assert.strictEqual(resources_1.$ag.isEqualOrParent(fileURI3, fileURI, true), false, '15');
            assert.strictEqual(resources_1.$ag.isEqualOrParent(fileURI5, fileURI5, true), true, '16');
            const fileURI6 = uri_1.URI.parse('foo://server:453/foo?q=1');
            const fileURI7 = uri_1.URI.parse('foo://server:453/foo/bar?q=1');
            assert.strictEqual(resources_1.$ag.isEqualOrParent(fileURI6, fileURI5), false, '17');
            assert.strictEqual(resources_1.$ag.isEqualOrParent(fileURI6, fileURI6), true, '18');
            assert.strictEqual(resources_1.$ag.isEqualOrParent(fileURI7, fileURI6), true, '19');
            assert.strictEqual(resources_1.$ag.isEqualOrParent(fileURI7, fileURI5), false, '20');
        });
    });
});
//# sourceMappingURL=resources.test.js.map