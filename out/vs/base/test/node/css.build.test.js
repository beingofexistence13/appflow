/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/css.build"], function (require, exports, assert, css_build_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('CSSPlugin', () => {
        test('Utilities.pathOf', () => {
            assert.strictEqual(css_build_1.CSSPluginUtilities.pathOf(''), '');
            assert.strictEqual(css_build_1.CSSPluginUtilities.pathOf('/a'), '/');
            assert.strictEqual(css_build_1.CSSPluginUtilities.pathOf('a/b/c.css'), 'a/b/');
            assert.strictEqual(css_build_1.CSSPluginUtilities.pathOf('a'), '');
            assert.strictEqual(css_build_1.CSSPluginUtilities.pathOf('a.com/a.css'), 'a.com/');
            assert.strictEqual(css_build_1.CSSPluginUtilities.pathOf('http://a.com/a.css'), 'http://a.com/');
            assert.strictEqual(css_build_1.CSSPluginUtilities.pathOf('https://a.com/a.css'), 'https://a.com/');
            assert.strictEqual(css_build_1.CSSPluginUtilities.pathOf('http://a.com/a/b/c.css'), 'http://a.com/a/b/');
            assert.strictEqual(css_build_1.CSSPluginUtilities.pathOf('https://a.com/a/b/c.css'), 'https://a.com/a/b/');
            assert.strictEqual(css_build_1.CSSPluginUtilities.pathOf('/a.css'), '/');
            assert.strictEqual(css_build_1.CSSPluginUtilities.pathOf('/a/b/c.css'), '/a/b/');
        });
        test('Utilities.joinPaths', () => {
            function mytest(a, b, expected) {
                assert.strictEqual(css_build_1.CSSPluginUtilities.joinPaths(a, b), expected, '<' + a + '> + <' + b + '> = <' + expected + '>');
            }
            mytest('', 'a.css', 'a.css');
            mytest('', './a.css', 'a.css');
            mytest('', '././././a.css', 'a.css');
            mytest('', './../a.css', '../a.css');
            mytest('', '../../a.css', '../../a.css');
            mytest('', '../../a/b/c.css', '../../a/b/c.css');
            mytest('/', 'a.css', '/a.css');
            mytest('/', './a.css', '/a.css');
            mytest('/', '././././a.css', '/a.css');
            mytest('/', './../a.css', '/a.css');
            mytest('/', '../../a.css', '/a.css');
            mytest('/', '../../a/b/c.css', '/a/b/c.css');
            mytest('x/y/z/', 'a.css', 'x/y/z/a.css');
            mytest('x/y/z/', './a.css', 'x/y/z/a.css');
            mytest('x/y/z/', '././././a.css', 'x/y/z/a.css');
            mytest('x/y/z/', './../a.css', 'x/y/a.css');
            mytest('x/y/z/', '../../a.css', 'x/a.css');
            mytest('x/y/z/', '../../a/b/c.css', 'x/a/b/c.css');
            mytest('//a.com/', 'a.css', '//a.com/a.css');
            mytest('//a.com/', './a.css', '//a.com/a.css');
            mytest('//a.com/', '././././a.css', '//a.com/a.css');
            mytest('//a.com/', './../a.css', '//a.com/a.css');
            mytest('//a.com/', '../../a.css', '//a.com/a.css');
            mytest('//a.com/', '../../a/b/c.css', '//a.com/a/b/c.css');
            mytest('//a.com/x/y/z/', 'a.css', '//a.com/x/y/z/a.css');
            mytest('//a.com/x/y/z/', './a.css', '//a.com/x/y/z/a.css');
            mytest('//a.com/x/y/z/', '././././a.css', '//a.com/x/y/z/a.css');
            mytest('//a.com/x/y/z/', './../a.css', '//a.com/x/y/a.css');
            mytest('//a.com/x/y/z/', '../../a.css', '//a.com/x/a.css');
            mytest('//a.com/x/y/z/', '../../a/b/c.css', '//a.com/x/a/b/c.css');
            mytest('http://a.com/', 'a.css', 'http://a.com/a.css');
            mytest('http://a.com/', './a.css', 'http://a.com/a.css');
            mytest('http://a.com/', '././././a.css', 'http://a.com/a.css');
            mytest('http://a.com/', './../a.css', 'http://a.com/a.css');
            mytest('http://a.com/', '../../a.css', 'http://a.com/a.css');
            mytest('http://a.com/', '../../a/b/c.css', 'http://a.com/a/b/c.css');
            mytest('http://a.com/x/y/z/', 'a.css', 'http://a.com/x/y/z/a.css');
            mytest('http://a.com/x/y/z/', './a.css', 'http://a.com/x/y/z/a.css');
            mytest('http://a.com/x/y/z/', '././././a.css', 'http://a.com/x/y/z/a.css');
            mytest('http://a.com/x/y/z/', './../a.css', 'http://a.com/x/y/a.css');
            mytest('http://a.com/x/y/z/', '../../a.css', 'http://a.com/x/a.css');
            mytest('http://a.com/x/y/z/', '../../a/b/c.css', 'http://a.com/x/a/b/c.css');
            mytest('https://a.com/', 'a.css', 'https://a.com/a.css');
            mytest('https://a.com/', './a.css', 'https://a.com/a.css');
            mytest('https://a.com/', '././././a.css', 'https://a.com/a.css');
            mytest('https://a.com/', './../a.css', 'https://a.com/a.css');
            mytest('https://a.com/', '../../a.css', 'https://a.com/a.css');
            mytest('https://a.com/', '../../a/b/c.css', 'https://a.com/a/b/c.css');
            mytest('https://a.com/x/y/z/', 'a.css', 'https://a.com/x/y/z/a.css');
            mytest('https://a.com/x/y/z/', './a.css', 'https://a.com/x/y/z/a.css');
            mytest('https://a.com/x/y/z/', '././././a.css', 'https://a.com/x/y/z/a.css');
            mytest('https://a.com/x/y/z/', './../a.css', 'https://a.com/x/y/a.css');
            mytest('https://a.com/x/y/z/', '../../a.css', 'https://a.com/x/a.css');
            mytest('https://a.com/x/y/z/', '../../a/b/c.css', 'https://a.com/x/a/b/c.css');
        });
        test('Utilities.commonPrefix', () => {
            function mytest(a, b, expected) {
                assert.strictEqual(css_build_1.CSSPluginUtilities.commonPrefix(a, b), expected, 'prefix(<' + a + '>, <' + b + '>) = <' + expected + '>');
                assert.strictEqual(css_build_1.CSSPluginUtilities.commonPrefix(b, a), expected, 'prefix(<' + b + '>, <' + a + '>) = <' + expected + '>');
            }
            mytest('', '', '');
            mytest('x', '', '');
            mytest('x', 'x', 'x');
            mytest('aaaa', 'aaaa', 'aaaa');
            mytest('aaaaxyz', 'aaaa', 'aaaa');
            mytest('aaaaxyz', 'aaaatuv', 'aaaa');
        });
        test('Utilities.commonFolderPrefix', () => {
            function mytest(a, b, expected) {
                assert.strictEqual(css_build_1.CSSPluginUtilities.commonFolderPrefix(a, b), expected, 'folderPrefix(<' + a + '>, <' + b + '>) = <' + expected + '>');
                assert.strictEqual(css_build_1.CSSPluginUtilities.commonFolderPrefix(b, a), expected, 'folderPrefix(<' + b + '>, <' + a + '>) = <' + expected + '>');
            }
            mytest('', '', '');
            mytest('x', '', '');
            mytest('x', 'x', '');
            mytest('aaaa', 'aaaa', '');
            mytest('aaaaxyz', 'aaaa', '');
            mytest('aaaaxyz', 'aaaatuv', '');
            mytest('/', '/', '/');
            mytest('x/', '', '');
            mytest('x/', 'x/', 'x/');
            mytest('aaaa/', 'aaaa/', 'aaaa/');
            mytest('aaaa/axyz', 'aaaa/a', 'aaaa/');
            mytest('aaaa/axyz', 'aaaa/atuv', 'aaaa/');
        });
        test('Utilities.relativePath', () => {
            function mytest(a, b, expected) {
                assert.strictEqual(css_build_1.CSSPluginUtilities.relativePath(a, b), expected, 'relativePath(<' + a + '>, <' + b + '>) = <' + expected + '>');
            }
            mytest('', '', '');
            mytest('x', '', '');
            mytest('x', 'x', 'x');
            mytest('aaaa', 'aaaa', 'aaaa');
            mytest('aaaaxyz', 'aaaa', 'aaaa');
            mytest('aaaaxyz', 'aaaatuv', 'aaaatuv');
            mytest('x/y/aaaaxyz', 'x/aaaatuv', '../aaaatuv');
            mytest('x/y/aaaaxyz', 'x/y/aaaatuv', 'aaaatuv');
            mytest('z/t/aaaaxyz', 'x/y/aaaatuv', '../../x/y/aaaatuv');
            mytest('aaaaxyz', 'x/y/aaaatuv', 'x/y/aaaatuv');
            mytest('a', '/a', '/a');
            mytest('/', '/a', '/a');
            mytest('/a/b/c', '/a/b/c', '/a/b/c');
            mytest('/a/b', '/a/b/c/d', '/a/b/c/d');
            mytest('a', 'http://a', 'http://a');
            mytest('/', 'http://a', 'http://a');
            mytest('/a/b/c', 'http://a/b/c', 'http://a/b/c');
            mytest('/a/b', 'http://a/b/c/d', 'http://a/b/c/d');
            mytest('a', 'https://a', 'https://a');
            mytest('/', 'https://a', 'https://a');
            mytest('/a/b/c', 'https://a/b/c', 'https://a/b/c');
            mytest('/a/b', 'https://a/b/c/d', 'https://a/b/c/d');
            mytest('x/', '', '../');
            mytest('x/', '', '../');
            mytest('x/', 'x/', '');
            mytest('x/a', 'x/a', 'a');
        });
        test('Utilities.rewriteUrls', () => {
            function mytest(originalFile, newFile, url, expected) {
                assert.strictEqual((0, css_build_1.rewriteUrls)(originalFile, newFile, 'sel { background:url(\'' + url + '\'); }'), 'sel { background:url(' + expected + '); }');
                assert.strictEqual((0, css_build_1.rewriteUrls)(originalFile, newFile, 'sel { background:url(\"' + url + '\"); }'), 'sel { background:url(' + expected + '); }');
                assert.strictEqual((0, css_build_1.rewriteUrls)(originalFile, newFile, 'sel { background:url(' + url + '); }'), 'sel { background:url(' + expected + '); }');
            }
            // img/img.png
            mytest('a.css', 'b.css', 'img/img.png', 'img/img.png');
            mytest('a.css', 't/b.css', 'img/img.png', '../img/img.png');
            mytest('a.css', 'x/y/b.css', 'img/img.png', '../../img/img.png');
            mytest('x/a.css', 'b.css', 'img/img.png', 'x/img/img.png');
            mytest('x/y/a.css', 'b.css', 'img/img.png', 'x/y/img/img.png');
            mytest('x/y/a.css', 't/u/b.css', 'img/img.png', '../../x/y/img/img.png');
            mytest('x/y/a.css', 'x/u/b.css', 'img/img.png', '../y/img/img.png');
            mytest('x/y/a.css', 'x/y/b.css', 'img/img.png', 'img/img.png');
            mytest('/a.css', 'b.css', 'img/img.png', '/img/img.png');
            mytest('/a.css', 'x/b.css', 'img/img.png', '/img/img.png');
            mytest('/a.css', 'x/y/b.css', 'img/img.png', '/img/img.png');
            mytest('/x/a.css', 'b.css', 'img/img.png', '/x/img/img.png');
            mytest('/x/a.css', 'x/b.css', 'img/img.png', '/x/img/img.png');
            mytest('/x/a.css', 'x/y/b.css', 'img/img.png', '/x/img/img.png');
            mytest('/x/y/a.css', 'b.css', 'img/img.png', '/x/y/img/img.png');
            mytest('/x/y/a.css', 'x/b.css', 'img/img.png', '/x/y/img/img.png');
            mytest('/x/y/a.css', 'x/y/b.css', 'img/img.png', '/x/y/img/img.png');
            mytest('/a.css', '/b.css', 'img/img.png', '/img/img.png');
            mytest('/a.css', '/b.css', 'img/img.png', '/img/img.png');
            mytest('/x/a.css', '/b.css', 'img/img.png', '/x/img/img.png');
            mytest('/x/a.css', '/x/b.css', 'img/img.png', '/x/img/img.png');
            mytest('http://www.example.com/x/y/a.css', 'b.css', 'img/img.png', 'http://www.example.com/x/y/img/img.png');
            mytest('http://www.example.com/x/y/a.css', 'http://www.example2.com/b.css', 'img/img.png', 'http://www.example.com/x/y/img/img.png');
            mytest('https://www.example.com/x/y/a.css', 'b.css', 'img/img.png', 'https://www.example.com/x/y/img/img.png');
            // ../img/img.png
            mytest('a.css', 'b.css', '../img/img.png', '../img/img.png');
            mytest('a.css', 't/b.css', '../img/img.png', '../../img/img.png');
            mytest('a.css', 'x/y/b.css', '../img/img.png', '../../../img/img.png');
            mytest('x/a.css', 'b.css', '../img/img.png', 'img/img.png');
            mytest('x/y/a.css', 'b.css', '../img/img.png', 'x/img/img.png');
            mytest('x/y/a.css', 't/u/b.css', '../img/img.png', '../../x/img/img.png');
            mytest('x/y/a.css', 'x/u/b.css', '../img/img.png', '../img/img.png');
            mytest('x/y/a.css', 'x/y/b.css', '../img/img.png', '../img/img.png');
            mytest('/a.css', 'b.css', '../img/img.png', '/img/img.png');
            mytest('/a.css', 'x/b.css', '../img/img.png', '/img/img.png');
            mytest('/a.css', 'x/y/b.css', '../img/img.png', '/img/img.png');
            mytest('/x/a.css', 'b.css', '../img/img.png', '/img/img.png');
            mytest('/x/a.css', 'x/b.css', '../img/img.png', '/img/img.png');
            mytest('/x/a.css', 'x/y/b.css', '../img/img.png', '/img/img.png');
            mytest('/x/y/a.css', 'b.css', '../img/img.png', '/x/img/img.png');
            mytest('/x/y/a.css', 'x/b.css', '../img/img.png', '/x/img/img.png');
            mytest('/x/y/a.css', 'x/y/b.css', '../img/img.png', '/x/img/img.png');
            mytest('/a.css', '/b.css', '../img/img.png', '/img/img.png');
            mytest('/a.css', '/b.css', '../img/img.png', '/img/img.png');
            mytest('/x/a.css', '/b.css', '../img/img.png', '/img/img.png');
            mytest('/x/a.css', '/x/b.css', '../img/img.png', '/img/img.png');
            mytest('http://www.example.com/x/y/a.css', 'b.css', '../img/img.png', 'http://www.example.com/x/img/img.png');
            mytest('http://www.example.com/x/y/a.css', 'http://www.example2.com/b.css', '../img/img.png', 'http://www.example.com/x/img/img.png');
            mytest('https://www.example.com/x/y/a.css', 'b.css', '../img/img.png', 'https://www.example.com/x/img/img.png');
            // /img/img.png
            mytest('a.css', 'b.css', '/img/img.png', '/img/img.png');
            mytest('a.css', 't/b.css', '/img/img.png', '/img/img.png');
            mytest('a.css', 'x/y/b.css', '/img/img.png', '/img/img.png');
            mytest('x/a.css', 'b.css', '/img/img.png', '/img/img.png');
            mytest('x/y/a.css', 'b.css', '/img/img.png', '/img/img.png');
            mytest('x/y/a.css', 't/u/b.css', '/img/img.png', '/img/img.png');
            mytest('x/y/a.css', 'x/u/b.css', '/img/img.png', '/img/img.png');
            mytest('x/y/a.css', 'x/y/b.css', '/img/img.png', '/img/img.png');
            mytest('/a.css', 'b.css', '/img/img.png', '/img/img.png');
            mytest('/a.css', 'x/b.css', '/img/img.png', '/img/img.png');
            mytest('/a.css', 'x/y/b.css', '/img/img.png', '/img/img.png');
            mytest('/x/a.css', 'b.css', '/img/img.png', '/img/img.png');
            mytest('/x/a.css', 'x/b.css', '/img/img.png', '/img/img.png');
            mytest('/x/a.css', 'x/y/b.css', '/img/img.png', '/img/img.png');
            mytest('/x/y/a.css', 'b.css', '/img/img.png', '/img/img.png');
            mytest('/x/y/a.css', 'x/b.css', '/img/img.png', '/img/img.png');
            mytest('/x/y/a.css', 'x/y/b.css', '/img/img.png', '/img/img.png');
            mytest('/a.css', '/b.css', '/img/img.png', '/img/img.png');
            mytest('/a.css', '/b.css', '/img/img.png', '/img/img.png');
            mytest('/x/a.css', '/b.css', '/img/img.png', '/img/img.png');
            mytest('/x/a.css', '/x/b.css', '/img/img.png', '/img/img.png');
            mytest('http://www.example.com/x/y/a.css', 'b.css', '/img/img.png', 'http://www.example.com/img/img.png');
            mytest('http://www.example.com/x/y/a.css', 'http://www.example.com/x/y/b.css', '/img/img.png', 'http://www.example.com/img/img.png');
            mytest('https://www.example.com/x/y/a.css', 'b.css', '/img/img.png', 'https://www.example.com/img/img.png');
            // http://example.com/img/img.png
            mytest('a.css', 'b.css', 'http://example.com/img/img.png', 'http://example.com/img/img.png');
            mytest('a.css', 't/b.css', 'http://example.com/img/img.png', 'http://example.com/img/img.png');
            mytest('a.css', 'x/y/b.css', 'http://example.com/img/img.png', 'http://example.com/img/img.png');
            mytest('x/a.css', 'b.css', 'http://example.com/img/img.png', 'http://example.com/img/img.png');
            mytest('x/y/a.css', 'b.css', 'http://example.com/img/img.png', 'http://example.com/img/img.png');
            mytest('x/y/a.css', 't/u/b.css', 'http://example.com/img/img.png', 'http://example.com/img/img.png');
            mytest('x/y/a.css', 'x/u/b.css', 'http://example.com/img/img.png', 'http://example.com/img/img.png');
            mytest('x/y/a.css', 'x/y/b.css', 'http://example.com/img/img.png', 'http://example.com/img/img.png');
            mytest('/a.css', 'b.css', 'http://example.com/img/img.png', 'http://example.com/img/img.png');
            mytest('/a.css', 'x/b.css', 'http://example.com/img/img.png', 'http://example.com/img/img.png');
            mytest('/a.css', 'x/y/b.css', 'http://example.com/img/img.png', 'http://example.com/img/img.png');
            mytest('/x/a.css', 'b.css', 'http://example.com/img/img.png', 'http://example.com/img/img.png');
            mytest('/x/a.css', 'x/b.css', 'http://example.com/img/img.png', 'http://example.com/img/img.png');
            mytest('/x/a.css', 'x/y/b.css', 'http://example.com/img/img.png', 'http://example.com/img/img.png');
            mytest('/x/y/a.css', 'b.css', 'http://example.com/img/img.png', 'http://example.com/img/img.png');
            mytest('/x/y/a.css', 'x/b.css', 'http://example.com/img/img.png', 'http://example.com/img/img.png');
            mytest('/x/y/a.css', 'x/y/b.css', 'http://example.com/img/img.png', 'http://example.com/img/img.png');
            mytest('/a.css', '/b.css', 'http://example.com/img/img.png', 'http://example.com/img/img.png');
            mytest('/a.css', '/b.css', 'http://example.com/img/img.png', 'http://example.com/img/img.png');
            mytest('/x/a.css', '/b.css', 'http://example.com/img/img.png', 'http://example.com/img/img.png');
            mytest('/x/a.css', '/x/b.css', 'http://example.com/img/img.png', 'http://example.com/img/img.png');
            mytest('http://www.example.com/x/y/a.css', 'b.css', 'http://example.com/img/img.png', 'http://example.com/img/img.png');
            mytest('http://www.example.com/x/y/a.css', 'http://www.example.com/x/y/b.css', 'http://example.com/img/img.png', 'http://example.com/img/img.png');
            mytest('https://www.example.com/x/y/a.css', 'b.css', 'http://example.com/img/img.png', 'http://example.com/img/img.png');
        });
        test('Utilities.rewriteUrls - quotes and spaces', () => {
            assert.strictEqual((0, css_build_1.rewriteUrls)('x/y/a.css', 't/u/b.css', 'sel { background:url(\'../img/img.png\'); }'), 'sel { background:url(../../x/img/img.png); }');
            assert.strictEqual((0, css_build_1.rewriteUrls)('x/y/a.css', 't/u/b.css', 'sel { background:url(\t\'../img/img.png\'); }'), 'sel { background:url(../../x/img/img.png); }');
            assert.strictEqual((0, css_build_1.rewriteUrls)('x/y/a.css', 't/u/b.css', 'sel { background:url( \'../img/img.png\'); }'), 'sel { background:url(../../x/img/img.png); }');
            assert.strictEqual((0, css_build_1.rewriteUrls)('x/y/a.css', 't/u/b.css', 'sel { background:url(\'../img/img.png\'\t); }'), 'sel { background:url(../../x/img/img.png); }');
            assert.strictEqual((0, css_build_1.rewriteUrls)('x/y/a.css', 't/u/b.css', 'sel { background:url(\'../img/img.png\' ); }'), 'sel { background:url(../../x/img/img.png); }');
            assert.strictEqual((0, css_build_1.rewriteUrls)('x/y/a.css', 't/u/b.css', 'sel { background:url(   \t   \'../img/img.png\'     \t); }'), 'sel { background:url(../../x/img/img.png); }');
        });
        test('Bug 9601 - css should ignore data urls', () => {
            const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAACHmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNC40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iPgogICAgICAgICA8ZGM6c3ViamVjdD4KICAgICAgICAgICAgPHJkZjpCYWcvPgogICAgICAgICA8L2RjOnN1YmplY3Q+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iPgogICAgICAgICA8eG1wOkNyZWF0b3JUb29sPkFkb2JlIEltYWdlUmVhZHk8L3htcDpDcmVhdG9yVG9vbD4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+ClC8oVQAAAGnSURBVDiNrZMxTxNxGMZ///9dZWns9a4dTHSABFiuCU5dGt2d9BsQls6GD2LCd2AiQQfixKIJE0ObdKIUSvDa5uLZihP0Sh+HOw3ipOUZ3zzvL2+e932NJBaRe7/Q8Uw5eMRrzXllDU8A5mJkLB+/TflQ+67JXb+5O0FUNS9deLckns/tn2A7hxtDawZvn37Vp78AX8rmxZLDewf89HGJ+fgKCrkrBeuXKPy44hbGN7e8eTbRZwALcFE2nuOy48j6zmaTYP8Qtxaia9A1uLWQYP8QZ7OJI+s7LjsXZeMBIIlLn61xgEbLnqadtiQp7Z0orq8rrq8r7Z1IkqadtkbLnsYBuvTZkpQBhgF7SRVFJRQ3QqW9bgY5P1V6fpoDu4oboaISSqpoGLD3GzAIOEqqaFBBURHF9TWlZxlEktKzruL6mqJi5kmqaBBwJIl7Wf+7LICBIYBSKGyE+LsHuCurzPo9Zv0e7soq/u4BhY0Qpfn68p6HCbHv4Q0qtBPfarLd1LR1nAVWzDNphJq2jjXZbirxrQYV2n0PT9Lih/Rwp/xLCz3T/+gnd2VVRJs/vngAAAAASUVORK5CYII=';
            function mytest(originalFile, newFile) {
                assert.strictEqual((0, css_build_1.rewriteUrls)(originalFile, newFile, 'sel { background:url(' + dataUrl + '); }'), 'sel { background:url(' + dataUrl + '); }');
                assert.strictEqual((0, css_build_1.rewriteUrls)(originalFile, newFile, 'sel { background:url( \t' + dataUrl + '\t ); }'), 'sel { background:url(' + dataUrl + '); }');
            }
            mytest('a.css', 'b.css');
            mytest('a.css', 't/b.css');
            mytest('a.css', 'x/y/b.css');
            mytest('x/a.css', 'b.css');
            mytest('x/y/a.css', 'b.css');
            mytest('x/y/a.css', 't/u/b.css');
            mytest('x/y/a.css', 'x/u/b.css');
            mytest('x/y/a.css', 'x/y/b.css');
            mytest('/a.css', 'b.css');
            mytest('/a.css', 'x/b.css');
            mytest('/a.css', 'x/y/b.css');
            mytest('/x/a.css', 'b.css');
            mytest('/x/a.css', 'x/b.css');
            mytest('/x/a.css', 'x/y/b.css');
            mytest('/x/y/a.css', 'b.css');
            mytest('/x/y/a.css', 'x/b.css');
            mytest('/x/y/a.css', 'x/y/b.css');
            mytest('/a.css', '/b.css');
            mytest('/a.css', '/b.css');
            mytest('/x/a.css', '/b.css');
            mytest('/x/a.css', '/x/b.css');
            mytest('http://www.example.com/x/y/a.css', 'b.css');
            mytest('http://www.example.com/x/y/a.css', 'http://www.example.com/x/y/b.css');
            mytest('https://www.example.com/x/y/a.css', 'b.css');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3NzLmJ1aWxkLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL3Rlc3Qvbm9kZS9jc3MuYnVpbGQudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQUtoRyxLQUFLLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRTtRQUV2QixJQUFJLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxFQUFFO1lBQzdCLE1BQU0sQ0FBQyxXQUFXLENBQUMsOEJBQWtCLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3RELE1BQU0sQ0FBQyxXQUFXLENBQUMsOEJBQWtCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3pELE1BQU0sQ0FBQyxXQUFXLENBQUMsOEJBQWtCLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ25FLE1BQU0sQ0FBQyxXQUFXLENBQUMsOEJBQWtCLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZELE1BQU0sQ0FBQyxXQUFXLENBQUMsOEJBQWtCLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZFLE1BQU0sQ0FBQyxXQUFXLENBQUMsOEJBQWtCLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDckYsTUFBTSxDQUFDLFdBQVcsQ0FBQyw4QkFBa0IsQ0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUMsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ3ZGLE1BQU0sQ0FBQyxXQUFXLENBQUMsOEJBQWtCLENBQUMsTUFBTSxDQUFDLHdCQUF3QixDQUFDLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztZQUM3RixNQUFNLENBQUMsV0FBVyxDQUFDLDhCQUFrQixDQUFDLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFDL0YsTUFBTSxDQUFDLFdBQVcsQ0FBQyw4QkFBa0IsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyw4QkFBa0IsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDdEUsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMscUJBQXFCLEVBQUUsR0FBRyxFQUFFO1lBQ2hDLFNBQVMsTUFBTSxDQUFDLENBQVMsRUFBRSxDQUFTLEVBQUUsUUFBZ0I7Z0JBQ3JELE1BQU0sQ0FBQyxXQUFXLENBQUMsOEJBQWtCLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsR0FBRyxHQUFHLENBQUMsR0FBRyxPQUFPLEdBQUcsQ0FBQyxHQUFHLE9BQU8sR0FBRyxRQUFRLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDcEgsQ0FBQztZQUNELE1BQU0sQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxFQUFFLEVBQUUsZUFBZSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsYUFBYSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsaUJBQWlCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztZQUNqRCxNQUFNLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztZQUMvQixNQUFNLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNqQyxNQUFNLENBQUMsR0FBRyxFQUFFLGVBQWUsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNwQyxNQUFNLENBQUMsR0FBRyxFQUFFLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNyQyxNQUFNLENBQUMsR0FBRyxFQUFFLGlCQUFpQixFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQzdDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQzNDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsZUFBZSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQ2pELE1BQU0sQ0FBQyxRQUFRLEVBQUUsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQzVDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQzNDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsaUJBQWlCLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFFbkQsTUFBTSxDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDN0MsTUFBTSxDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDL0MsTUFBTSxDQUFDLFVBQVUsRUFBRSxlQUFlLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDckQsTUFBTSxDQUFDLFVBQVUsRUFBRSxZQUFZLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDbEQsTUFBTSxDQUFDLFVBQVUsRUFBRSxhQUFhLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDbkQsTUFBTSxDQUFDLFVBQVUsRUFBRSxpQkFBaUIsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1lBQzNELE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLEVBQUUscUJBQXFCLENBQUMsQ0FBQztZQUN6RCxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsU0FBUyxFQUFFLHFCQUFxQixDQUFDLENBQUM7WUFDM0QsTUFBTSxDQUFDLGdCQUFnQixFQUFFLGVBQWUsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxZQUFZLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztZQUM1RCxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLGlCQUFpQixDQUFDLENBQUM7WUFDM0QsTUFBTSxDQUFDLGdCQUFnQixFQUFFLGlCQUFpQixFQUFFLHFCQUFxQixDQUFDLENBQUM7WUFFbkUsTUFBTSxDQUFDLGVBQWUsRUFBRSxPQUFPLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUN2RCxNQUFNLENBQUMsZUFBZSxFQUFFLFNBQVMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQ3pELE1BQU0sQ0FBQyxlQUFlLEVBQUUsZUFBZSxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFDL0QsTUFBTSxDQUFDLGVBQWUsRUFBRSxZQUFZLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUM1RCxNQUFNLENBQUMsZUFBZSxFQUFFLGFBQWEsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxlQUFlLEVBQUUsaUJBQWlCLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztZQUNyRSxNQUFNLENBQUMscUJBQXFCLEVBQUUsT0FBTyxFQUFFLDBCQUEwQixDQUFDLENBQUM7WUFDbkUsTUFBTSxDQUFDLHFCQUFxQixFQUFFLFNBQVMsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO1lBQ3JFLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxlQUFlLEVBQUUsMEJBQTBCLENBQUMsQ0FBQztZQUMzRSxNQUFNLENBQUMscUJBQXFCLEVBQUUsWUFBWSxFQUFFLHdCQUF3QixDQUFDLENBQUM7WUFDdEUsTUFBTSxDQUFDLHFCQUFxQixFQUFFLGFBQWEsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO1lBQ3JFLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxpQkFBaUIsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO1lBRTdFLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLEVBQUUscUJBQXFCLENBQUMsQ0FBQztZQUN6RCxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsU0FBUyxFQUFFLHFCQUFxQixDQUFDLENBQUM7WUFDM0QsTUFBTSxDQUFDLGdCQUFnQixFQUFFLGVBQWUsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxZQUFZLEVBQUUscUJBQXFCLENBQUMsQ0FBQztZQUM5RCxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLHFCQUFxQixDQUFDLENBQUM7WUFDL0QsTUFBTSxDQUFDLGdCQUFnQixFQUFFLGlCQUFpQixFQUFFLHlCQUF5QixDQUFDLENBQUM7WUFDdkUsTUFBTSxDQUFDLHNCQUFzQixFQUFFLE9BQU8sRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO1lBQ3JFLE1BQU0sQ0FBQyxzQkFBc0IsRUFBRSxTQUFTLEVBQUUsMkJBQTJCLENBQUMsQ0FBQztZQUN2RSxNQUFNLENBQUMsc0JBQXNCLEVBQUUsZUFBZSxFQUFFLDJCQUEyQixDQUFDLENBQUM7WUFDN0UsTUFBTSxDQUFDLHNCQUFzQixFQUFFLFlBQVksRUFBRSx5QkFBeUIsQ0FBQyxDQUFDO1lBQ3hFLE1BQU0sQ0FBQyxzQkFBc0IsRUFBRSxhQUFhLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztZQUN2RSxNQUFNLENBQUMsc0JBQXNCLEVBQUUsaUJBQWlCLEVBQUUsMkJBQTJCLENBQUMsQ0FBQztRQUNoRixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyx3QkFBd0IsRUFBRSxHQUFHLEVBQUU7WUFDbkMsU0FBUyxNQUFNLENBQUMsQ0FBUyxFQUFFLENBQVMsRUFBRSxRQUFnQjtnQkFDckQsTUFBTSxDQUFDLFdBQVcsQ0FBQyw4QkFBa0IsQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxVQUFVLEdBQUcsQ0FBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLEdBQUcsUUFBUSxHQUFHLFFBQVEsR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDN0gsTUFBTSxDQUFDLFdBQVcsQ0FBQyw4QkFBa0IsQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxVQUFVLEdBQUcsQ0FBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLEdBQUcsUUFBUSxHQUFHLFFBQVEsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUM5SCxDQUFDO1lBQ0QsTUFBTSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDbkIsTUFBTSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDcEIsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDdEIsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDL0IsTUFBTSxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDbEMsTUFBTSxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDdEMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsOEJBQThCLEVBQUUsR0FBRyxFQUFFO1lBQ3pDLFNBQVMsTUFBTSxDQUFDLENBQVMsRUFBRSxDQUFTLEVBQUUsUUFBZ0I7Z0JBQ3JELE1BQU0sQ0FBQyxXQUFXLENBQUMsOEJBQWtCLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsR0FBRyxDQUFDLEdBQUcsTUFBTSxHQUFHLENBQUMsR0FBRyxRQUFRLEdBQUcsUUFBUSxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUN6SSxNQUFNLENBQUMsV0FBVyxDQUFDLDhCQUFrQixDQUFDLGtCQUFrQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLEdBQUcsQ0FBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLEdBQUcsUUFBUSxHQUFHLFFBQVEsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUMxSSxDQUFDO1lBQ0QsTUFBTSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDbkIsTUFBTSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDcEIsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDckIsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDM0IsTUFBTSxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDOUIsTUFBTSxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDakMsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDdEIsTUFBTSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDckIsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDekIsTUFBTSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDbEMsTUFBTSxDQUFDLFdBQVcsRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDdkMsTUFBTSxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDM0MsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxFQUFFO1lBQ25DLFNBQVMsTUFBTSxDQUFDLENBQVMsRUFBRSxDQUFTLEVBQUUsUUFBZ0I7Z0JBQ3JELE1BQU0sQ0FBQyxXQUFXLENBQUMsOEJBQWtCLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLEdBQUcsQ0FBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLEdBQUcsUUFBUSxHQUFHLFFBQVEsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUNwSSxDQUFDO1lBQ0QsTUFBTSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDbkIsTUFBTSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDcEIsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDdEIsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDL0IsTUFBTSxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDbEMsTUFBTSxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFFeEMsTUFBTSxDQUFDLGFBQWEsRUFBRSxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDakQsTUFBTSxDQUFDLGFBQWEsRUFBRSxhQUFhLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDaEQsTUFBTSxDQUFDLGFBQWEsRUFBRSxhQUFhLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztZQUMxRCxNQUFNLENBQUMsU0FBUyxFQUFFLGFBQWEsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUVoRCxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN4QixNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN4QixNQUFNLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNyQyxNQUFNLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUV2QyxNQUFNLENBQUMsR0FBRyxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUNwQyxNQUFNLENBQUMsR0FBRyxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUNwQyxNQUFNLENBQUMsUUFBUSxFQUFFLGNBQWMsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUNqRCxNQUFNLENBQUMsTUFBTSxFQUFFLGdCQUFnQixFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFFbkQsTUFBTSxDQUFDLEdBQUcsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDdEMsTUFBTSxDQUFDLEdBQUcsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDdEMsTUFBTSxDQUFDLFFBQVEsRUFBRSxlQUFlLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDbkQsTUFBTSxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBRXJELE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3hCLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3hCLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzNCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHVCQUF1QixFQUFFLEdBQUcsRUFBRTtZQUNsQyxTQUFTLE1BQU0sQ0FBQyxZQUFvQixFQUFFLE9BQWUsRUFBRSxHQUFXLEVBQUUsUUFBZ0I7Z0JBQ25GLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBQSx1QkFBVyxFQUFDLFlBQVksRUFBRSxPQUFPLEVBQUUseUJBQXlCLEdBQUcsR0FBRyxHQUFHLFFBQVEsQ0FBQyxFQUFFLHVCQUF1QixHQUFHLFFBQVEsR0FBRyxNQUFNLENBQUMsQ0FBQztnQkFDaEosTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLHVCQUFXLEVBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSx5QkFBeUIsR0FBRyxHQUFHLEdBQUcsUUFBUSxDQUFDLEVBQUUsdUJBQXVCLEdBQUcsUUFBUSxHQUFHLE1BQU0sQ0FBQyxDQUFDO2dCQUNoSixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsdUJBQVcsRUFBQyxZQUFZLEVBQUUsT0FBTyxFQUFFLHVCQUF1QixHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUMsRUFBRSx1QkFBdUIsR0FBRyxRQUFRLEdBQUcsTUFBTSxDQUFDLENBQUM7WUFDN0ksQ0FBQztZQUVELGNBQWM7WUFDZCxNQUFNLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDdkQsTUFBTSxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFDNUQsTUFBTSxDQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFFLG1CQUFtQixDQUFDLENBQUM7WUFDakUsTUFBTSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1lBQzNELE1BQU0sQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBQy9ELE1BQU0sQ0FBQyxXQUFXLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO1lBQ3pFLE1BQU0sQ0FBQyxXQUFXLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1lBQ3BFLE1BQU0sQ0FBQyxXQUFXLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUMvRCxNQUFNLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDekQsTUFBTSxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQzNELE1BQU0sQ0FBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUMvRCxNQUFNLENBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUNqRSxNQUFNLENBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQUNqRSxNQUFNLENBQUMsWUFBWSxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQUNuRSxNQUFNLENBQUMsWUFBWSxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQUNyRSxNQUFNLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDMUQsTUFBTSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQzFELE1BQU0sQ0FBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBQzlELE1BQU0sQ0FBQyxVQUFVLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ2hFLE1BQU0sQ0FBQyxrQ0FBa0MsRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFFLHdDQUF3QyxDQUFDLENBQUM7WUFDN0csTUFBTSxDQUFDLGtDQUFrQyxFQUFFLCtCQUErQixFQUFFLGFBQWEsRUFBRSx3Q0FBd0MsQ0FBQyxDQUFDO1lBQ3JJLE1BQU0sQ0FBQyxtQ0FBbUMsRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFFLHlDQUF5QyxDQUFDLENBQUM7WUFFL0csaUJBQWlCO1lBQ2pCLE1BQU0sQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztZQUNsRSxNQUFNLENBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO1lBQ3ZFLE1BQU0sQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQzVELE1BQU0sQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLGVBQWUsQ0FBQyxDQUFDO1lBQ2hFLE1BQU0sQ0FBQyxXQUFXLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFFLHFCQUFxQixDQUFDLENBQUM7WUFDMUUsTUFBTSxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsZ0JBQWdCLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUNyRSxNQUFNLENBQUMsV0FBVyxFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ3JFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQzVELE1BQU0sQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQzlELE1BQU0sQ0FBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ2hFLE1BQU0sQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQzlELE1BQU0sQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ2hFLE1BQU0sQ0FBQyxVQUFVLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ2xFLE1BQU0sQ0FBQyxZQUFZLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFDbEUsTUFBTSxDQUFDLFlBQVksRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUNwRSxNQUFNLENBQUMsWUFBWSxFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ3RFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQy9ELE1BQU0sQ0FBQyxVQUFVLEVBQUUsVUFBVSxFQUFFLGdCQUFnQixFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sQ0FBQyxrQ0FBa0MsRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsc0NBQXNDLENBQUMsQ0FBQztZQUM5RyxNQUFNLENBQUMsa0NBQWtDLEVBQUUsK0JBQStCLEVBQUUsZ0JBQWdCLEVBQUUsc0NBQXNDLENBQUMsQ0FBQztZQUN0SSxNQUFNLENBQUMsbUNBQW1DLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLHVDQUF1QyxDQUFDLENBQUM7WUFFaEgsZUFBZTtZQUNmLE1BQU0sQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUN6RCxNQUFNLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxjQUFjLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDM0QsTUFBTSxDQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsY0FBYyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUMzRCxNQUFNLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsY0FBYyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sQ0FBQyxXQUFXLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUNqRSxNQUFNLENBQUMsV0FBVyxFQUFFLFdBQVcsRUFBRSxjQUFjLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDakUsTUFBTSxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQzFELE1BQU0sQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUM1RCxNQUFNLENBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRSxjQUFjLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDOUQsTUFBTSxDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQzVELE1BQU0sQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUM5RCxNQUFNLENBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxjQUFjLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDaEUsTUFBTSxDQUFDLFlBQVksRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQzlELE1BQU0sQ0FBQyxZQUFZLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUNoRSxNQUFNLENBQUMsWUFBWSxFQUFFLFdBQVcsRUFBRSxjQUFjLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDbEUsTUFBTSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQzNELE1BQU0sQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUMzRCxNQUFNLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQy9ELE1BQU0sQ0FBQyxrQ0FBa0MsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLG9DQUFvQyxDQUFDLENBQUM7WUFDMUcsTUFBTSxDQUFDLGtDQUFrQyxFQUFFLGtDQUFrQyxFQUFFLGNBQWMsRUFBRSxvQ0FBb0MsQ0FBQyxDQUFDO1lBQ3JJLE1BQU0sQ0FBQyxtQ0FBbUMsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLHFDQUFxQyxDQUFDLENBQUM7WUFFNUcsaUNBQWlDO1lBQ2pDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLGdDQUFnQyxFQUFFLGdDQUFnQyxDQUFDLENBQUM7WUFDN0YsTUFBTSxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsZ0NBQWdDLEVBQUUsZ0NBQWdDLENBQUMsQ0FBQztZQUMvRixNQUFNLENBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxnQ0FBZ0MsRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFDO1lBQ2pHLE1BQU0sQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLGdDQUFnQyxFQUFFLGdDQUFnQyxDQUFDLENBQUM7WUFDL0YsTUFBTSxDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUUsZ0NBQWdDLEVBQUUsZ0NBQWdDLENBQUMsQ0FBQztZQUNqRyxNQUFNLENBQUMsV0FBVyxFQUFFLFdBQVcsRUFBRSxnQ0FBZ0MsRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFDO1lBQ3JHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsV0FBVyxFQUFFLGdDQUFnQyxFQUFFLGdDQUFnQyxDQUFDLENBQUM7WUFDckcsTUFBTSxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsZ0NBQWdDLEVBQUUsZ0NBQWdDLENBQUMsQ0FBQztZQUNyRyxNQUFNLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxnQ0FBZ0MsRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFDO1lBQzlGLE1BQU0sQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLGdDQUFnQyxFQUFFLGdDQUFnQyxDQUFDLENBQUM7WUFDaEcsTUFBTSxDQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUUsZ0NBQWdDLEVBQUUsZ0NBQWdDLENBQUMsQ0FBQztZQUNsRyxNQUFNLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxnQ0FBZ0MsRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFDO1lBQ2hHLE1BQU0sQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLGdDQUFnQyxFQUFFLGdDQUFnQyxDQUFDLENBQUM7WUFDbEcsTUFBTSxDQUFDLFVBQVUsRUFBRSxXQUFXLEVBQUUsZ0NBQWdDLEVBQUUsZ0NBQWdDLENBQUMsQ0FBQztZQUNwRyxNQUFNLENBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxnQ0FBZ0MsRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFDO1lBQ2xHLE1BQU0sQ0FBQyxZQUFZLEVBQUUsU0FBUyxFQUFFLGdDQUFnQyxFQUFFLGdDQUFnQyxDQUFDLENBQUM7WUFDcEcsTUFBTSxDQUFDLFlBQVksRUFBRSxXQUFXLEVBQUUsZ0NBQWdDLEVBQUUsZ0NBQWdDLENBQUMsQ0FBQztZQUN0RyxNQUFNLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxnQ0FBZ0MsRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFDO1lBQy9GLE1BQU0sQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLGdDQUFnQyxFQUFFLGdDQUFnQyxDQUFDLENBQUM7WUFDL0YsTUFBTSxDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsZ0NBQWdDLEVBQUUsZ0NBQWdDLENBQUMsQ0FBQztZQUNqRyxNQUFNLENBQUMsVUFBVSxFQUFFLFVBQVUsRUFBRSxnQ0FBZ0MsRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFDO1lBQ25HLE1BQU0sQ0FBQyxrQ0FBa0MsRUFBRSxPQUFPLEVBQUUsZ0NBQWdDLEVBQUUsZ0NBQWdDLENBQUMsQ0FBQztZQUN4SCxNQUFNLENBQUMsa0NBQWtDLEVBQUUsa0NBQWtDLEVBQUUsZ0NBQWdDLEVBQUUsZ0NBQWdDLENBQUMsQ0FBQztZQUNuSixNQUFNLENBQUMsbUNBQW1DLEVBQUUsT0FBTyxFQUFFLGdDQUFnQyxFQUFFLGdDQUFnQyxDQUFDLENBQUM7UUFHMUgsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsMkNBQTJDLEVBQUUsR0FBRyxFQUFFO1lBQ3RELE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBQSx1QkFBVyxFQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsNkNBQTZDLENBQUMsRUFBRSw4Q0FBOEMsQ0FBQyxDQUFDO1lBQ3pKLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBQSx1QkFBVyxFQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsK0NBQStDLENBQUMsRUFBRSw4Q0FBOEMsQ0FBQyxDQUFDO1lBQzNKLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBQSx1QkFBVyxFQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsOENBQThDLENBQUMsRUFBRSw4Q0FBOEMsQ0FBQyxDQUFDO1lBQzFKLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBQSx1QkFBVyxFQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsK0NBQStDLENBQUMsRUFBRSw4Q0FBOEMsQ0FBQyxDQUFDO1lBQzNKLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBQSx1QkFBVyxFQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsOENBQThDLENBQUMsRUFBRSw4Q0FBOEMsQ0FBQyxDQUFDO1lBQzFKLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBQSx1QkFBVyxFQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsNERBQTRELENBQUMsRUFBRSw4Q0FBOEMsQ0FBQyxDQUFDO1FBQ3pLLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHdDQUF3QyxFQUFFLEdBQUcsRUFBRTtZQUNuRCxNQUFNLE9BQU8sR0FBRyx3NUNBQXc1QyxDQUFDO1lBRXo2QyxTQUFTLE1BQU0sQ0FBQyxZQUFvQixFQUFFLE9BQWU7Z0JBQ3BELE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBQSx1QkFBVyxFQUFDLFlBQVksRUFBRSxPQUFPLEVBQUUsdUJBQXVCLEdBQUcsT0FBTyxHQUFHLE1BQU0sQ0FBQyxFQUFFLHVCQUF1QixHQUFHLE9BQU8sR0FBRyxNQUFNLENBQUMsQ0FBQztnQkFDL0ksTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLHVCQUFXLEVBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSwwQkFBMEIsR0FBRyxPQUFPLEdBQUcsU0FBUyxDQUFDLEVBQUUsdUJBQXVCLEdBQUcsT0FBTyxHQUFHLE1BQU0sQ0FBQyxDQUFDO1lBQ3RKLENBQUM7WUFFRCxNQUFNLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3pCLE1BQU0sQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDM0IsTUFBTSxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQztZQUM3QixNQUFNLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzNCLE1BQU0sQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDN0IsTUFBTSxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUNqQyxNQUFNLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ2pDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDakMsTUFBTSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMxQixNQUFNLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQzVCLE1BQU0sQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDOUIsTUFBTSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUM1QixNQUFNLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQzlCLE1BQU0sQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDaEMsTUFBTSxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztZQUM5QixNQUFNLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDbEMsTUFBTSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUMzQixNQUFNLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzNCLE1BQU0sQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDN0IsTUFBTSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUMvQixNQUFNLENBQUMsa0NBQWtDLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDcEQsTUFBTSxDQUFDLGtDQUFrQyxFQUFFLGtDQUFrQyxDQUFDLENBQUM7WUFDL0UsTUFBTSxDQUFDLG1DQUFtQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3RELENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUMifQ==