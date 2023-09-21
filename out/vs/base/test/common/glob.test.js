/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/glob", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/uri", "vs/base/test/common/utils"], function (require, exports, assert, glob, path_1, platform_1, uri_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Glob', () => {
        // test('perf', () => {
        // 	let patterns = [
        // 		'{**/*.cs,**/*.json,**/*.csproj,**/*.sln}',
        // 		'{**/*.cs,**/*.csproj,**/*.sln}',
        // 		'{**/*.ts,**/*.tsx,**/*.js,**/*.jsx,**/*.es6,**/*.mjs,**/*.cjs}',
        // 		'**/*.go',
        // 		'{**/*.ps,**/*.ps1}',
        // 		'{**/*.c,**/*.cpp,**/*.h}',
        // 		'{**/*.fsx,**/*.fsi,**/*.fs,**/*.ml,**/*.mli}',
        // 		'{**/*.js,**/*.jsx,**/*.es6,**/*.mjs,**/*.cjs}',
        // 		'{**/*.ts,**/*.tsx}',
        // 		'{**/*.php}',
        // 		'{**/*.php}',
        // 		'{**/*.php}',
        // 		'{**/*.php}',
        // 		'{**/*.py}',
        // 		'{**/*.py}',
        // 		'{**/*.py}',
        // 		'{**/*.rs,**/*.rslib}',
        // 		'{**/*.cpp,**/*.cc,**/*.h}',
        // 		'{**/*.md}',
        // 		'{**/*.md}',
        // 		'{**/*.md}'
        // 	];
        // 	let paths = [
        // 		'/DNXConsoleApp/Program.cs',
        // 		'C:\\DNXConsoleApp\\foo\\Program.cs',
        // 		'test/qunit',
        // 		'test/test.txt',
        // 		'test/node_modules',
        // 		'.hidden.txt',
        // 		'/node_module/test/foo.js'
        // 	];
        // 	let results = 0;
        // 	let c = 1000;
        // 	console.profile('glob.match');
        // 	while (c-- > 0) {
        // 		for (let path of paths) {
        // 			for (let pattern of patterns) {
        // 				let r = glob.match(pattern, path);
        // 				if (r) {
        // 					results += 42;
        // 				}
        // 			}
        // 		}
        // 	}
        // 	console.profileEnd();
        // });
        function assertGlobMatch(pattern, input) {
            assert(glob.match(pattern, input), `${JSON.stringify(pattern)} should match ${input}`);
            assert(glob.match(pattern, nativeSep(input)), `${pattern} should match ${nativeSep(input)}`);
        }
        function assertNoGlobMatch(pattern, input) {
            assert(!glob.match(pattern, input), `${pattern} should not match ${input}`);
            assert(!glob.match(pattern, nativeSep(input)), `${pattern} should not match ${nativeSep(input)}`);
        }
        test('simple', () => {
            let p = 'node_modules';
            assertGlobMatch(p, 'node_modules');
            assertNoGlobMatch(p, 'node_module');
            assertNoGlobMatch(p, '/node_modules');
            assertNoGlobMatch(p, 'test/node_modules');
            p = 'test.txt';
            assertGlobMatch(p, 'test.txt');
            assertNoGlobMatch(p, 'test?txt');
            assertNoGlobMatch(p, '/text.txt');
            assertNoGlobMatch(p, 'test/test.txt');
            p = 'test(.txt';
            assertGlobMatch(p, 'test(.txt');
            assertNoGlobMatch(p, 'test?txt');
            p = 'qunit';
            assertGlobMatch(p, 'qunit');
            assertNoGlobMatch(p, 'qunit.css');
            assertNoGlobMatch(p, 'test/qunit');
            // Absolute
            p = '/DNXConsoleApp/**/*.cs';
            assertGlobMatch(p, '/DNXConsoleApp/Program.cs');
            assertGlobMatch(p, '/DNXConsoleApp/foo/Program.cs');
            p = 'C:/DNXConsoleApp/**/*.cs';
            assertGlobMatch(p, 'C:\\DNXConsoleApp\\Program.cs');
            assertGlobMatch(p, 'C:\\DNXConsoleApp\\foo\\Program.cs');
            p = '*';
            assertGlobMatch(p, '');
        });
        test('dot hidden', function () {
            let p = '.*';
            assertGlobMatch(p, '.git');
            assertGlobMatch(p, '.hidden.txt');
            assertNoGlobMatch(p, 'git');
            assertNoGlobMatch(p, 'hidden.txt');
            assertNoGlobMatch(p, 'path/.git');
            assertNoGlobMatch(p, 'path/.hidden.txt');
            p = '**/.*';
            assertGlobMatch(p, '.git');
            assertGlobMatch(p, '/.git');
            assertGlobMatch(p, '.hidden.txt');
            assertNoGlobMatch(p, 'git');
            assertNoGlobMatch(p, 'hidden.txt');
            assertGlobMatch(p, 'path/.git');
            assertGlobMatch(p, 'path/.hidden.txt');
            assertGlobMatch(p, '/path/.git');
            assertGlobMatch(p, '/path/.hidden.txt');
            assertNoGlobMatch(p, 'path/git');
            assertNoGlobMatch(p, 'pat.h/hidden.txt');
            p = '._*';
            assertGlobMatch(p, '._git');
            assertGlobMatch(p, '._hidden.txt');
            assertNoGlobMatch(p, 'git');
            assertNoGlobMatch(p, 'hidden.txt');
            assertNoGlobMatch(p, 'path/._git');
            assertNoGlobMatch(p, 'path/._hidden.txt');
            p = '**/._*';
            assertGlobMatch(p, '._git');
            assertGlobMatch(p, '._hidden.txt');
            assertNoGlobMatch(p, 'git');
            assertNoGlobMatch(p, 'hidden._txt');
            assertGlobMatch(p, 'path/._git');
            assertGlobMatch(p, 'path/._hidden.txt');
            assertGlobMatch(p, '/path/._git');
            assertGlobMatch(p, '/path/._hidden.txt');
            assertNoGlobMatch(p, 'path/git');
            assertNoGlobMatch(p, 'pat.h/hidden._txt');
        });
        test('file pattern', function () {
            let p = '*.js';
            assertGlobMatch(p, 'foo.js');
            assertNoGlobMatch(p, 'folder/foo.js');
            assertNoGlobMatch(p, '/node_modules/foo.js');
            assertNoGlobMatch(p, 'foo.jss');
            assertNoGlobMatch(p, 'some.js/test');
            p = 'html.*';
            assertGlobMatch(p, 'html.js');
            assertGlobMatch(p, 'html.txt');
            assertNoGlobMatch(p, 'htm.txt');
            p = '*.*';
            assertGlobMatch(p, 'html.js');
            assertGlobMatch(p, 'html.txt');
            assertGlobMatch(p, 'htm.txt');
            assertNoGlobMatch(p, 'folder/foo.js');
            assertNoGlobMatch(p, '/node_modules/foo.js');
            p = 'node_modules/test/*.js';
            assertGlobMatch(p, 'node_modules/test/foo.js');
            assertNoGlobMatch(p, 'folder/foo.js');
            assertNoGlobMatch(p, '/node_module/test/foo.js');
            assertNoGlobMatch(p, 'foo.jss');
            assertNoGlobMatch(p, 'some.js/test');
        });
        test('star', () => {
            let p = 'node*modules';
            assertGlobMatch(p, 'node_modules');
            assertGlobMatch(p, 'node_super_modules');
            assertNoGlobMatch(p, 'node_module');
            assertNoGlobMatch(p, '/node_modules');
            assertNoGlobMatch(p, 'test/node_modules');
            p = '*';
            assertGlobMatch(p, 'html.js');
            assertGlobMatch(p, 'html.txt');
            assertGlobMatch(p, 'htm.txt');
            assertNoGlobMatch(p, 'folder/foo.js');
            assertNoGlobMatch(p, '/node_modules/foo.js');
        });
        test('file / folder match', function () {
            const p = '**/node_modules/**';
            assertGlobMatch(p, 'node_modules');
            assertGlobMatch(p, 'node_modules/');
            assertGlobMatch(p, 'a/node_modules');
            assertGlobMatch(p, 'a/node_modules/');
            assertGlobMatch(p, 'node_modules/foo');
            assertGlobMatch(p, 'foo/node_modules/foo/bar');
            assertGlobMatch(p, '/node_modules');
            assertGlobMatch(p, '/node_modules/');
            assertGlobMatch(p, '/a/node_modules');
            assertGlobMatch(p, '/a/node_modules/');
            assertGlobMatch(p, '/node_modules/foo');
            assertGlobMatch(p, '/foo/node_modules/foo/bar');
        });
        test('questionmark', () => {
            let p = 'node?modules';
            assertGlobMatch(p, 'node_modules');
            assertNoGlobMatch(p, 'node_super_modules');
            assertNoGlobMatch(p, 'node_module');
            assertNoGlobMatch(p, '/node_modules');
            assertNoGlobMatch(p, 'test/node_modules');
            p = '?';
            assertGlobMatch(p, 'h');
            assertNoGlobMatch(p, 'html.txt');
            assertNoGlobMatch(p, 'htm.txt');
            assertNoGlobMatch(p, 'folder/foo.js');
            assertNoGlobMatch(p, '/node_modules/foo.js');
        });
        test('globstar', () => {
            let p = '**/*.js';
            assertGlobMatch(p, 'foo.js');
            assertGlobMatch(p, '/foo.js');
            assertGlobMatch(p, 'folder/foo.js');
            assertGlobMatch(p, '/node_modules/foo.js');
            assertNoGlobMatch(p, 'foo.jss');
            assertNoGlobMatch(p, 'some.js/test');
            assertNoGlobMatch(p, '/some.js/test');
            assertNoGlobMatch(p, '\\some.js\\test');
            p = '**/project.json';
            assertGlobMatch(p, 'project.json');
            assertGlobMatch(p, '/project.json');
            assertGlobMatch(p, 'some/folder/project.json');
            assertGlobMatch(p, '/some/folder/project.json');
            assertNoGlobMatch(p, 'some/folder/file_project.json');
            assertNoGlobMatch(p, 'some/folder/fileproject.json');
            assertNoGlobMatch(p, 'some/rrproject.json');
            assertNoGlobMatch(p, 'some\\rrproject.json');
            p = 'test/**';
            assertGlobMatch(p, 'test');
            assertGlobMatch(p, 'test/foo');
            assertGlobMatch(p, 'test/foo/');
            assertGlobMatch(p, 'test/foo.js');
            assertGlobMatch(p, 'test/other/foo.js');
            assertNoGlobMatch(p, 'est/other/foo.js');
            p = '**';
            assertGlobMatch(p, '/');
            assertGlobMatch(p, 'foo.js');
            assertGlobMatch(p, 'folder/foo.js');
            assertGlobMatch(p, 'folder/foo/');
            assertGlobMatch(p, '/node_modules/foo.js');
            assertGlobMatch(p, 'foo.jss');
            assertGlobMatch(p, 'some.js/test');
            p = 'test/**/*.js';
            assertGlobMatch(p, 'test/foo.js');
            assertGlobMatch(p, 'test/other/foo.js');
            assertGlobMatch(p, 'test/other/more/foo.js');
            assertNoGlobMatch(p, 'test/foo.ts');
            assertNoGlobMatch(p, 'test/other/foo.ts');
            assertNoGlobMatch(p, 'test/other/more/foo.ts');
            p = '**/**/*.js';
            assertGlobMatch(p, 'foo.js');
            assertGlobMatch(p, '/foo.js');
            assertGlobMatch(p, 'folder/foo.js');
            assertGlobMatch(p, '/node_modules/foo.js');
            assertNoGlobMatch(p, 'foo.jss');
            assertNoGlobMatch(p, 'some.js/test');
            p = '**/node_modules/**/*.js';
            assertNoGlobMatch(p, 'foo.js');
            assertNoGlobMatch(p, 'folder/foo.js');
            assertGlobMatch(p, 'node_modules/foo.js');
            assertGlobMatch(p, '/node_modules/foo.js');
            assertGlobMatch(p, 'node_modules/some/folder/foo.js');
            assertGlobMatch(p, '/node_modules/some/folder/foo.js');
            assertNoGlobMatch(p, 'node_modules/some/folder/foo.ts');
            assertNoGlobMatch(p, 'foo.jss');
            assertNoGlobMatch(p, 'some.js/test');
            p = '{**/node_modules/**,**/.git/**,**/bower_components/**}';
            assertGlobMatch(p, 'node_modules');
            assertGlobMatch(p, '/node_modules');
            assertGlobMatch(p, '/node_modules/more');
            assertGlobMatch(p, 'some/test/node_modules');
            assertGlobMatch(p, 'some\\test\\node_modules');
            assertGlobMatch(p, '/some/test/node_modules');
            assertGlobMatch(p, '\\some\\test\\node_modules');
            assertGlobMatch(p, 'C:\\\\some\\test\\node_modules');
            assertGlobMatch(p, 'C:\\\\some\\test\\node_modules\\more');
            assertGlobMatch(p, 'bower_components');
            assertGlobMatch(p, 'bower_components/more');
            assertGlobMatch(p, '/bower_components');
            assertGlobMatch(p, 'some/test/bower_components');
            assertGlobMatch(p, 'some\\test\\bower_components');
            assertGlobMatch(p, '/some/test/bower_components');
            assertGlobMatch(p, '\\some\\test\\bower_components');
            assertGlobMatch(p, 'C:\\\\some\\test\\bower_components');
            assertGlobMatch(p, 'C:\\\\some\\test\\bower_components\\more');
            assertGlobMatch(p, '.git');
            assertGlobMatch(p, '/.git');
            assertGlobMatch(p, 'some/test/.git');
            assertGlobMatch(p, 'some\\test\\.git');
            assertGlobMatch(p, '/some/test/.git');
            assertGlobMatch(p, '\\some\\test\\.git');
            assertGlobMatch(p, 'C:\\\\some\\test\\.git');
            assertNoGlobMatch(p, 'tempting');
            assertNoGlobMatch(p, '/tempting');
            assertNoGlobMatch(p, 'some/test/tempting');
            assertNoGlobMatch(p, 'some\\test\\tempting');
            assertNoGlobMatch(p, '/some/test/tempting');
            assertNoGlobMatch(p, '\\some\\test\\tempting');
            assertNoGlobMatch(p, 'C:\\\\some\\test\\tempting');
            p = '{**/package.json,**/project.json}';
            assertGlobMatch(p, 'package.json');
            assertGlobMatch(p, '/package.json');
            assertNoGlobMatch(p, 'xpackage.json');
            assertNoGlobMatch(p, '/xpackage.json');
        });
        test('issue 41724', function () {
            let p = 'some/**/*.js';
            assertGlobMatch(p, 'some/foo.js');
            assertGlobMatch(p, 'some/folder/foo.js');
            assertNoGlobMatch(p, 'something/foo.js');
            assertNoGlobMatch(p, 'something/folder/foo.js');
            p = 'some/**/*';
            assertGlobMatch(p, 'some/foo.js');
            assertGlobMatch(p, 'some/folder/foo.js');
            assertNoGlobMatch(p, 'something/foo.js');
            assertNoGlobMatch(p, 'something/folder/foo.js');
        });
        test('brace expansion', function () {
            let p = '*.{html,js}';
            assertGlobMatch(p, 'foo.js');
            assertGlobMatch(p, 'foo.html');
            assertNoGlobMatch(p, 'folder/foo.js');
            assertNoGlobMatch(p, '/node_modules/foo.js');
            assertNoGlobMatch(p, 'foo.jss');
            assertNoGlobMatch(p, 'some.js/test');
            p = '*.{html}';
            assertGlobMatch(p, 'foo.html');
            assertNoGlobMatch(p, 'foo.js');
            assertNoGlobMatch(p, 'folder/foo.js');
            assertNoGlobMatch(p, '/node_modules/foo.js');
            assertNoGlobMatch(p, 'foo.jss');
            assertNoGlobMatch(p, 'some.js/test');
            p = '{node_modules,testing}';
            assertGlobMatch(p, 'node_modules');
            assertGlobMatch(p, 'testing');
            assertNoGlobMatch(p, 'node_module');
            assertNoGlobMatch(p, 'dtesting');
            p = '**/{foo,bar}';
            assertGlobMatch(p, 'foo');
            assertGlobMatch(p, 'bar');
            assertGlobMatch(p, 'test/foo');
            assertGlobMatch(p, 'test/bar');
            assertGlobMatch(p, 'other/more/foo');
            assertGlobMatch(p, 'other/more/bar');
            assertGlobMatch(p, '/foo');
            assertGlobMatch(p, '/bar');
            assertGlobMatch(p, '/test/foo');
            assertGlobMatch(p, '/test/bar');
            assertGlobMatch(p, '/other/more/foo');
            assertGlobMatch(p, '/other/more/bar');
            p = '{foo,bar}/**';
            assertGlobMatch(p, 'foo');
            assertGlobMatch(p, 'bar');
            assertGlobMatch(p, 'bar/');
            assertGlobMatch(p, 'foo/test');
            assertGlobMatch(p, 'bar/test');
            assertGlobMatch(p, 'bar/test/');
            assertGlobMatch(p, 'foo/other/more');
            assertGlobMatch(p, 'bar/other/more');
            assertGlobMatch(p, 'bar/other/more/');
            p = '{**/*.d.ts,**/*.js}';
            assertGlobMatch(p, 'foo.js');
            assertGlobMatch(p, 'testing/foo.js');
            assertGlobMatch(p, 'testing\\foo.js');
            assertGlobMatch(p, '/testing/foo.js');
            assertGlobMatch(p, '\\testing\\foo.js');
            assertGlobMatch(p, 'C:\\testing\\foo.js');
            assertGlobMatch(p, 'foo.d.ts');
            assertGlobMatch(p, 'testing/foo.d.ts');
            assertGlobMatch(p, 'testing\\foo.d.ts');
            assertGlobMatch(p, '/testing/foo.d.ts');
            assertGlobMatch(p, '\\testing\\foo.d.ts');
            assertGlobMatch(p, 'C:\\testing\\foo.d.ts');
            assertNoGlobMatch(p, 'foo.d');
            assertNoGlobMatch(p, 'testing/foo.d');
            assertNoGlobMatch(p, 'testing\\foo.d');
            assertNoGlobMatch(p, '/testing/foo.d');
            assertNoGlobMatch(p, '\\testing\\foo.d');
            assertNoGlobMatch(p, 'C:\\testing\\foo.d');
            p = '{**/*.d.ts,**/*.js,path/simple.jgs}';
            assertGlobMatch(p, 'foo.js');
            assertGlobMatch(p, 'testing/foo.js');
            assertGlobMatch(p, 'testing\\foo.js');
            assertGlobMatch(p, '/testing/foo.js');
            assertGlobMatch(p, 'path/simple.jgs');
            assertNoGlobMatch(p, '/path/simple.jgs');
            assertGlobMatch(p, '\\testing\\foo.js');
            assertGlobMatch(p, 'C:\\testing\\foo.js');
            p = '{**/*.d.ts,**/*.js,foo.[0-9]}';
            assertGlobMatch(p, 'foo.5');
            assertGlobMatch(p, 'foo.8');
            assertNoGlobMatch(p, 'bar.5');
            assertNoGlobMatch(p, 'foo.f');
            assertGlobMatch(p, 'foo.js');
            p = 'prefix/{**/*.d.ts,**/*.js,foo.[0-9]}';
            assertGlobMatch(p, 'prefix/foo.5');
            assertGlobMatch(p, 'prefix/foo.8');
            assertNoGlobMatch(p, 'prefix/bar.5');
            assertNoGlobMatch(p, 'prefix/foo.f');
            assertGlobMatch(p, 'prefix/foo.js');
        });
        test('expression support (single)', function () {
            const siblings = ['test.html', 'test.txt', 'test.ts', 'test.js'];
            const hasSibling = (name) => siblings.indexOf(name) !== -1;
            // { "**/*.js": { "when": "$(basename).ts" } }
            let expression = {
                '**/*.js': {
                    when: '$(basename).ts'
                }
            };
            assert.strictEqual('**/*.js', glob.match(expression, 'test.js', hasSibling));
            assert.strictEqual(glob.match(expression, 'test.js', () => false), null);
            assert.strictEqual(glob.match(expression, 'test.js', name => name === 'te.ts'), null);
            assert.strictEqual(glob.match(expression, 'test.js'), null);
            expression = {
                '**/*.js': {
                    when: ''
                }
            };
            assert.strictEqual(glob.match(expression, 'test.js', hasSibling), null);
            expression = {
                '**/*.js': {}
            };
            assert.strictEqual('**/*.js', glob.match(expression, 'test.js', hasSibling));
            expression = {};
            assert.strictEqual(glob.match(expression, 'test.js', hasSibling), null);
        });
        test('expression support (multiple)', function () {
            const siblings = ['test.html', 'test.txt', 'test.ts', 'test.js'];
            const hasSibling = (name) => siblings.indexOf(name) !== -1;
            // { "**/*.js": { "when": "$(basename).ts" } }
            const expression = {
                '**/*.js': { when: '$(basename).ts' },
                '**/*.as': true,
                '**/*.foo': false,
                '**/*.bananas': { bananas: true }
            };
            assert.strictEqual('**/*.js', glob.match(expression, 'test.js', hasSibling));
            assert.strictEqual('**/*.as', glob.match(expression, 'test.as', hasSibling));
            assert.strictEqual('**/*.bananas', glob.match(expression, 'test.bananas', hasSibling));
            assert.strictEqual('**/*.bananas', glob.match(expression, 'test.bananas'));
            assert.strictEqual(glob.match(expression, 'test.foo', hasSibling), null);
        });
        test('brackets', () => {
            let p = 'foo.[0-9]';
            assertGlobMatch(p, 'foo.5');
            assertGlobMatch(p, 'foo.8');
            assertNoGlobMatch(p, 'bar.5');
            assertNoGlobMatch(p, 'foo.f');
            p = 'foo.[^0-9]';
            assertNoGlobMatch(p, 'foo.5');
            assertNoGlobMatch(p, 'foo.8');
            assertNoGlobMatch(p, 'bar.5');
            assertGlobMatch(p, 'foo.f');
            p = 'foo.[!0-9]';
            assertNoGlobMatch(p, 'foo.5');
            assertNoGlobMatch(p, 'foo.8');
            assertNoGlobMatch(p, 'bar.5');
            assertGlobMatch(p, 'foo.f');
            p = 'foo.[0!^*?]';
            assertNoGlobMatch(p, 'foo.5');
            assertNoGlobMatch(p, 'foo.8');
            assertGlobMatch(p, 'foo.0');
            assertGlobMatch(p, 'foo.!');
            assertGlobMatch(p, 'foo.^');
            assertGlobMatch(p, 'foo.*');
            assertGlobMatch(p, 'foo.?');
            p = 'foo[/]bar';
            assertNoGlobMatch(p, 'foo/bar');
            p = 'foo.[[]';
            assertGlobMatch(p, 'foo.[');
            p = 'foo.[]]';
            assertGlobMatch(p, 'foo.]');
            p = 'foo.[][!]';
            assertGlobMatch(p, 'foo.]');
            assertGlobMatch(p, 'foo.[');
            assertGlobMatch(p, 'foo.!');
            p = 'foo.[]-]';
            assertGlobMatch(p, 'foo.]');
            assertGlobMatch(p, 'foo.-');
        });
        test('full path', function () {
            assertGlobMatch('testing/this/foo.txt', 'testing/this/foo.txt');
        });
        test('ending path', function () {
            assertGlobMatch('**/testing/this/foo.txt', 'some/path/testing/this/foo.txt');
        });
        test('prefix agnostic', function () {
            let p = '**/*.js';
            assertGlobMatch(p, 'foo.js');
            assertGlobMatch(p, '/foo.js');
            assertGlobMatch(p, '\\foo.js');
            assertGlobMatch(p, 'testing/foo.js');
            assertGlobMatch(p, 'testing\\foo.js');
            assertGlobMatch(p, '/testing/foo.js');
            assertGlobMatch(p, '\\testing\\foo.js');
            assertGlobMatch(p, 'C:\\testing\\foo.js');
            assertNoGlobMatch(p, 'foo.ts');
            assertNoGlobMatch(p, 'testing/foo.ts');
            assertNoGlobMatch(p, 'testing\\foo.ts');
            assertNoGlobMatch(p, '/testing/foo.ts');
            assertNoGlobMatch(p, '\\testing\\foo.ts');
            assertNoGlobMatch(p, 'C:\\testing\\foo.ts');
            assertNoGlobMatch(p, 'foo.js.txt');
            assertNoGlobMatch(p, 'testing/foo.js.txt');
            assertNoGlobMatch(p, 'testing\\foo.js.txt');
            assertNoGlobMatch(p, '/testing/foo.js.txt');
            assertNoGlobMatch(p, '\\testing\\foo.js.txt');
            assertNoGlobMatch(p, 'C:\\testing\\foo.js.txt');
            assertNoGlobMatch(p, 'testing.js/foo');
            assertNoGlobMatch(p, 'testing.js\\foo');
            assertNoGlobMatch(p, '/testing.js/foo');
            assertNoGlobMatch(p, '\\testing.js\\foo');
            assertNoGlobMatch(p, 'C:\\testing.js\\foo');
            p = '**/foo.js';
            assertGlobMatch(p, 'foo.js');
            assertGlobMatch(p, '/foo.js');
            assertGlobMatch(p, '\\foo.js');
            assertGlobMatch(p, 'testing/foo.js');
            assertGlobMatch(p, 'testing\\foo.js');
            assertGlobMatch(p, '/testing/foo.js');
            assertGlobMatch(p, '\\testing\\foo.js');
            assertGlobMatch(p, 'C:\\testing\\foo.js');
        });
        test('cached properly', function () {
            const p = '**/*.js';
            assertGlobMatch(p, 'foo.js');
            assertGlobMatch(p, 'testing/foo.js');
            assertGlobMatch(p, 'testing\\foo.js');
            assertGlobMatch(p, '/testing/foo.js');
            assertGlobMatch(p, '\\testing\\foo.js');
            assertGlobMatch(p, 'C:\\testing\\foo.js');
            assertNoGlobMatch(p, 'foo.ts');
            assertNoGlobMatch(p, 'testing/foo.ts');
            assertNoGlobMatch(p, 'testing\\foo.ts');
            assertNoGlobMatch(p, '/testing/foo.ts');
            assertNoGlobMatch(p, '\\testing\\foo.ts');
            assertNoGlobMatch(p, 'C:\\testing\\foo.ts');
            assertNoGlobMatch(p, 'foo.js.txt');
            assertNoGlobMatch(p, 'testing/foo.js.txt');
            assertNoGlobMatch(p, 'testing\\foo.js.txt');
            assertNoGlobMatch(p, '/testing/foo.js.txt');
            assertNoGlobMatch(p, '\\testing\\foo.js.txt');
            assertNoGlobMatch(p, 'C:\\testing\\foo.js.txt');
            assertNoGlobMatch(p, 'testing.js/foo');
            assertNoGlobMatch(p, 'testing.js\\foo');
            assertNoGlobMatch(p, '/testing.js/foo');
            assertNoGlobMatch(p, '\\testing.js\\foo');
            assertNoGlobMatch(p, 'C:\\testing.js\\foo');
            // Run again and make sure the regex are properly reused
            assertGlobMatch(p, 'foo.js');
            assertGlobMatch(p, 'testing/foo.js');
            assertGlobMatch(p, 'testing\\foo.js');
            assertGlobMatch(p, '/testing/foo.js');
            assertGlobMatch(p, '\\testing\\foo.js');
            assertGlobMatch(p, 'C:\\testing\\foo.js');
            assertNoGlobMatch(p, 'foo.ts');
            assertNoGlobMatch(p, 'testing/foo.ts');
            assertNoGlobMatch(p, 'testing\\foo.ts');
            assertNoGlobMatch(p, '/testing/foo.ts');
            assertNoGlobMatch(p, '\\testing\\foo.ts');
            assertNoGlobMatch(p, 'C:\\testing\\foo.ts');
            assertNoGlobMatch(p, 'foo.js.txt');
            assertNoGlobMatch(p, 'testing/foo.js.txt');
            assertNoGlobMatch(p, 'testing\\foo.js.txt');
            assertNoGlobMatch(p, '/testing/foo.js.txt');
            assertNoGlobMatch(p, '\\testing\\foo.js.txt');
            assertNoGlobMatch(p, 'C:\\testing\\foo.js.txt');
            assertNoGlobMatch(p, 'testing.js/foo');
            assertNoGlobMatch(p, 'testing.js\\foo');
            assertNoGlobMatch(p, '/testing.js/foo');
            assertNoGlobMatch(p, '\\testing.js\\foo');
            assertNoGlobMatch(p, 'C:\\testing.js\\foo');
        });
        test('invalid glob', function () {
            const p = '**/*(.js';
            assertNoGlobMatch(p, 'foo.js');
        });
        test('split glob aware', function () {
            assert.deepStrictEqual(glob.splitGlobAware('foo,bar', ','), ['foo', 'bar']);
            assert.deepStrictEqual(glob.splitGlobAware('foo', ','), ['foo']);
            assert.deepStrictEqual(glob.splitGlobAware('{foo,bar}', ','), ['{foo,bar}']);
            assert.deepStrictEqual(glob.splitGlobAware('foo,bar,{foo,bar}', ','), ['foo', 'bar', '{foo,bar}']);
            assert.deepStrictEqual(glob.splitGlobAware('{foo,bar},foo,bar,{foo,bar}', ','), ['{foo,bar}', 'foo', 'bar', '{foo,bar}']);
            assert.deepStrictEqual(glob.splitGlobAware('[foo,bar]', ','), ['[foo,bar]']);
            assert.deepStrictEqual(glob.splitGlobAware('foo,bar,[foo,bar]', ','), ['foo', 'bar', '[foo,bar]']);
            assert.deepStrictEqual(glob.splitGlobAware('[foo,bar],foo,bar,[foo,bar]', ','), ['[foo,bar]', 'foo', 'bar', '[foo,bar]']);
        });
        test('expression with disabled glob', function () {
            const expr = { '**/*.js': false };
            assert.strictEqual(glob.match(expr, 'foo.js'), null);
        });
        test('expression with two non-trivia globs', function () {
            const expr = {
                '**/*.j?': true,
                '**/*.t?': true
            };
            assert.strictEqual(glob.match(expr, 'foo.js'), '**/*.j?');
            assert.strictEqual(glob.match(expr, 'foo.as'), null);
        });
        test('expression with non-trivia glob (issue 144458)', function () {
            const pattern = '**/p*';
            assert.strictEqual(glob.match(pattern, 'foo/barp'), false);
            assert.strictEqual(glob.match(pattern, 'foo/bar/ap'), false);
            assert.strictEqual(glob.match(pattern, 'ap'), false);
            assert.strictEqual(glob.match(pattern, 'foo/barp1'), false);
            assert.strictEqual(glob.match(pattern, 'foo/bar/ap1'), false);
            assert.strictEqual(glob.match(pattern, 'ap1'), false);
            assert.strictEqual(glob.match(pattern, '/foo/barp'), false);
            assert.strictEqual(glob.match(pattern, '/foo/bar/ap'), false);
            assert.strictEqual(glob.match(pattern, '/ap'), false);
            assert.strictEqual(glob.match(pattern, '/foo/barp1'), false);
            assert.strictEqual(glob.match(pattern, '/foo/bar/ap1'), false);
            assert.strictEqual(glob.match(pattern, '/ap1'), false);
            assert.strictEqual(glob.match(pattern, 'foo/pbar'), true);
            assert.strictEqual(glob.match(pattern, '/foo/pbar'), true);
            assert.strictEqual(glob.match(pattern, 'foo/bar/pa'), true);
            assert.strictEqual(glob.match(pattern, '/p'), true);
        });
        test('expression with empty glob', function () {
            const expr = { '': true };
            assert.strictEqual(glob.match(expr, 'foo.js'), null);
        });
        test('expression with other falsy value', function () {
            const expr = { '**/*.js': 0 };
            assert.strictEqual(glob.match(expr, 'foo.js'), '**/*.js');
        });
        test('expression with two basename globs', function () {
            const expr = {
                '**/bar': true,
                '**/baz': true
            };
            assert.strictEqual(glob.match(expr, 'bar'), '**/bar');
            assert.strictEqual(glob.match(expr, 'foo'), null);
            assert.strictEqual(glob.match(expr, 'foo/bar'), '**/bar');
            assert.strictEqual(glob.match(expr, 'foo\\bar'), '**/bar');
            assert.strictEqual(glob.match(expr, 'foo/foo'), null);
        });
        test('expression with two basename globs and a siblings expression', function () {
            const expr = {
                '**/bar': true,
                '**/baz': true,
                '**/*.js': { when: '$(basename).ts' }
            };
            const siblings = ['foo.ts', 'foo.js', 'foo', 'bar'];
            const hasSibling = (name) => siblings.indexOf(name) !== -1;
            assert.strictEqual(glob.match(expr, 'bar', hasSibling), '**/bar');
            assert.strictEqual(glob.match(expr, 'foo', hasSibling), null);
            assert.strictEqual(glob.match(expr, 'foo/bar', hasSibling), '**/bar');
            if (platform_1.isWindows) {
                // backslash is a valid file name character on posix
                assert.strictEqual(glob.match(expr, 'foo\\bar', hasSibling), '**/bar');
            }
            assert.strictEqual(glob.match(expr, 'foo/foo', hasSibling), null);
            assert.strictEqual(glob.match(expr, 'foo.js', hasSibling), '**/*.js');
            assert.strictEqual(glob.match(expr, 'bar.js', hasSibling), null);
        });
        test('expression with multipe basename globs', function () {
            const expr = {
                '**/bar': true,
                '{**/baz,**/foo}': true
            };
            assert.strictEqual(glob.match(expr, 'bar'), '**/bar');
            assert.strictEqual(glob.match(expr, 'foo'), '{**/baz,**/foo}');
            assert.strictEqual(glob.match(expr, 'baz'), '{**/baz,**/foo}');
            assert.strictEqual(glob.match(expr, 'abc'), null);
        });
        test('falsy expression/pattern', function () {
            assert.strictEqual(glob.match(null, 'foo'), false);
            assert.strictEqual(glob.match('', 'foo'), false);
            assert.strictEqual(glob.parse(null)('foo'), false);
            assert.strictEqual(glob.parse('')('foo'), false);
        });
        test('falsy path', function () {
            assert.strictEqual(glob.parse('foo')(null), false);
            assert.strictEqual(glob.parse('foo')(''), false);
            assert.strictEqual(glob.parse('**/*.j?')(null), false);
            assert.strictEqual(glob.parse('**/*.j?')(''), false);
            assert.strictEqual(glob.parse('**/*.foo')(null), false);
            assert.strictEqual(glob.parse('**/*.foo')(''), false);
            assert.strictEqual(glob.parse('**/foo')(null), false);
            assert.strictEqual(glob.parse('**/foo')(''), false);
            assert.strictEqual(glob.parse('{**/baz,**/foo}')(null), false);
            assert.strictEqual(glob.parse('{**/baz,**/foo}')(''), false);
            assert.strictEqual(glob.parse('{**/*.baz,**/*.foo}')(null), false);
            assert.strictEqual(glob.parse('{**/*.baz,**/*.foo}')(''), false);
        });
        test('expression/pattern basename', function () {
            assert.strictEqual(glob.parse('**/foo')('bar/baz', 'baz'), false);
            assert.strictEqual(glob.parse('**/foo')('bar/foo', 'foo'), true);
            assert.strictEqual(glob.parse('{**/baz,**/foo}')('baz/bar', 'bar'), false);
            assert.strictEqual(glob.parse('{**/baz,**/foo}')('baz/foo', 'foo'), true);
            const expr = { '**/*.js': { when: '$(basename).ts' } };
            const siblings = ['foo.ts', 'foo.js'];
            const hasSibling = (name) => siblings.indexOf(name) !== -1;
            assert.strictEqual(glob.parse(expr)('bar/baz.js', 'baz.js', hasSibling), null);
            assert.strictEqual(glob.parse(expr)('bar/foo.js', 'foo.js', hasSibling), '**/*.js');
        });
        test('expression/pattern basename terms', function () {
            assert.deepStrictEqual(glob.getBasenameTerms(glob.parse('**/*.foo')), []);
            assert.deepStrictEqual(glob.getBasenameTerms(glob.parse('**/foo')), ['foo']);
            assert.deepStrictEqual(glob.getBasenameTerms(glob.parse('**/foo/')), ['foo']);
            assert.deepStrictEqual(glob.getBasenameTerms(glob.parse('{**/baz,**/foo}')), ['baz', 'foo']);
            assert.deepStrictEqual(glob.getBasenameTerms(glob.parse('{**/baz/,**/foo/}')), ['baz', 'foo']);
            assert.deepStrictEqual(glob.getBasenameTerms(glob.parse({
                '**/foo': true,
                '{**/bar,**/baz}': true,
                '{**/bar2/,**/baz2/}': true,
                '**/bulb': false
            })), ['foo', 'bar', 'baz', 'bar2', 'baz2']);
            assert.deepStrictEqual(glob.getBasenameTerms(glob.parse({
                '**/foo': { when: '$(basename).zip' },
                '**/bar': true
            })), ['bar']);
        });
        test('expression/pattern optimization for basenames', function () {
            assert.deepStrictEqual(glob.getBasenameTerms(glob.parse('**/foo/**')), []);
            assert.deepStrictEqual(glob.getBasenameTerms(glob.parse('**/foo/**', { trimForExclusions: true })), ['foo']);
            testOptimizationForBasenames('**/*.foo/**', [], [['baz/bar.foo/bar/baz', true]]);
            testOptimizationForBasenames('**/foo/**', ['foo'], [['bar/foo', true], ['bar/foo/baz', false]]);
            testOptimizationForBasenames('{**/baz/**,**/foo/**}', ['baz', 'foo'], [['bar/baz', true], ['bar/foo', true]]);
            testOptimizationForBasenames({
                '**/foo/**': true,
                '{**/bar/**,**/baz/**}': true,
                '**/bulb/**': false
            }, ['foo', 'bar', 'baz'], [
                ['bar/foo', '**/foo/**'],
                ['foo/bar', '{**/bar/**,**/baz/**}'],
                ['bar/nope', null]
            ]);
            const siblings = ['baz', 'baz.zip', 'nope'];
            const hasSibling = (name) => siblings.indexOf(name) !== -1;
            testOptimizationForBasenames({
                '**/foo/**': { when: '$(basename).zip' },
                '**/bar/**': true
            }, ['bar'], [
                ['bar/foo', null],
                ['bar/foo/baz', null],
                ['bar/foo/nope', null],
                ['foo/bar', '**/bar/**'],
            ], [
                null,
                hasSibling,
                hasSibling
            ]);
        });
        function testOptimizationForBasenames(pattern, basenameTerms, matches, siblingsFns = []) {
            const parsed = glob.parse(pattern, { trimForExclusions: true });
            assert.deepStrictEqual(glob.getBasenameTerms(parsed), basenameTerms);
            matches.forEach(([text, result], i) => {
                assert.strictEqual(parsed(text, null, siblingsFns[i]), result);
            });
        }
        test('trailing slash', function () {
            // Testing existing (more or less intuitive) behavior
            assert.strictEqual(glob.parse('**/foo/')('bar/baz', 'baz'), false);
            assert.strictEqual(glob.parse('**/foo/')('bar/foo', 'foo'), true);
            assert.strictEqual(glob.parse('**/*.foo/')('bar/file.baz', 'file.baz'), false);
            assert.strictEqual(glob.parse('**/*.foo/')('bar/file.foo', 'file.foo'), true);
            assert.strictEqual(glob.parse('{**/foo/,**/abc/}')('bar/baz', 'baz'), false);
            assert.strictEqual(glob.parse('{**/foo/,**/abc/}')('bar/foo', 'foo'), true);
            assert.strictEqual(glob.parse('{**/foo/,**/abc/}')('bar/abc', 'abc'), true);
            assert.strictEqual(glob.parse('{**/foo/,**/abc/}', { trimForExclusions: true })('bar/baz', 'baz'), false);
            assert.strictEqual(glob.parse('{**/foo/,**/abc/}', { trimForExclusions: true })('bar/foo', 'foo'), true);
            assert.strictEqual(glob.parse('{**/foo/,**/abc/}', { trimForExclusions: true })('bar/abc', 'abc'), true);
        });
        test('expression/pattern path', function () {
            assert.strictEqual(glob.parse('**/foo/bar')(nativeSep('foo/baz'), 'baz'), false);
            assert.strictEqual(glob.parse('**/foo/bar')(nativeSep('foo/bar'), 'bar'), true);
            assert.strictEqual(glob.parse('**/foo/bar')(nativeSep('bar/foo/bar'), 'bar'), true);
            assert.strictEqual(glob.parse('**/foo/bar/**')(nativeSep('bar/foo/bar'), 'bar'), true);
            assert.strictEqual(glob.parse('**/foo/bar/**')(nativeSep('bar/foo/bar/baz'), 'baz'), true);
            assert.strictEqual(glob.parse('**/foo/bar/**', { trimForExclusions: true })(nativeSep('bar/foo/bar'), 'bar'), true);
            assert.strictEqual(glob.parse('**/foo/bar/**', { trimForExclusions: true })(nativeSep('bar/foo/bar/baz'), 'baz'), false);
            assert.strictEqual(glob.parse('foo/bar')(nativeSep('foo/baz'), 'baz'), false);
            assert.strictEqual(glob.parse('foo/bar')(nativeSep('foo/bar'), 'bar'), true);
            assert.strictEqual(glob.parse('foo/bar/baz')(nativeSep('foo/bar/baz'), 'baz'), true); // #15424
            assert.strictEqual(glob.parse('foo/bar')(nativeSep('bar/foo/bar'), 'bar'), false);
            assert.strictEqual(glob.parse('foo/bar/**')(nativeSep('foo/bar/baz'), 'baz'), true);
            assert.strictEqual(glob.parse('foo/bar/**', { trimForExclusions: true })(nativeSep('foo/bar'), 'bar'), true);
            assert.strictEqual(glob.parse('foo/bar/**', { trimForExclusions: true })(nativeSep('foo/bar/baz'), 'baz'), false);
        });
        test('expression/pattern paths', function () {
            assert.deepStrictEqual(glob.getPathTerms(glob.parse('**/*.foo')), []);
            assert.deepStrictEqual(glob.getPathTerms(glob.parse('**/foo')), []);
            assert.deepStrictEqual(glob.getPathTerms(glob.parse('**/foo/bar')), ['*/foo/bar']);
            assert.deepStrictEqual(glob.getPathTerms(glob.parse('**/foo/bar/')), ['*/foo/bar']);
            // Not supported
            // assert.deepStrictEqual(glob.getPathTerms(glob.parse('{**/baz/bar,**/foo/bar,**/bar}')), ['*/baz/bar', '*/foo/bar']);
            // assert.deepStrictEqual(glob.getPathTerms(glob.parse('{**/baz/bar/,**/foo/bar/,**/bar/}')), ['*/baz/bar', '*/foo/bar']);
            const parsed = glob.parse({
                '**/foo/bar': true,
                '**/foo2/bar2': true,
                // Not supported
                // '{**/bar/foo,**/baz/foo}': true,
                // '{**/bar2/foo/,**/baz2/foo/}': true,
                '**/bulb': true,
                '**/bulb2': true,
                '**/bulb/foo': false
            });
            assert.deepStrictEqual(glob.getPathTerms(parsed), ['*/foo/bar', '*/foo2/bar2']);
            assert.deepStrictEqual(glob.getBasenameTerms(parsed), ['bulb', 'bulb2']);
            assert.deepStrictEqual(glob.getPathTerms(glob.parse({
                '**/foo/bar': { when: '$(basename).zip' },
                '**/bar/foo': true,
                '**/bar2/foo2': true
            })), ['*/bar/foo', '*/bar2/foo2']);
        });
        test('expression/pattern optimization for paths', function () {
            assert.deepStrictEqual(glob.getPathTerms(glob.parse('**/foo/bar/**')), []);
            assert.deepStrictEqual(glob.getPathTerms(glob.parse('**/foo/bar/**', { trimForExclusions: true })), ['*/foo/bar']);
            testOptimizationForPaths('**/*.foo/bar/**', [], [[nativeSep('baz/bar.foo/bar/baz'), true]]);
            testOptimizationForPaths('**/foo/bar/**', ['*/foo/bar'], [[nativeSep('bar/foo/bar'), true], [nativeSep('bar/foo/bar/baz'), false]]);
            // Not supported
            // testOptimizationForPaths('{**/baz/bar/**,**/foo/bar/**}', ['*/baz/bar', '*/foo/bar'], [[nativeSep('bar/baz/bar'), true], [nativeSep('bar/foo/bar'), true]]);
            testOptimizationForPaths({
                '**/foo/bar/**': true,
                // Not supported
                // '{**/bar/bar/**,**/baz/bar/**}': true,
                '**/bulb/bar/**': false
            }, ['*/foo/bar'], [
                [nativeSep('bar/foo/bar'), '**/foo/bar/**'],
                // Not supported
                // [nativeSep('foo/bar/bar'), '{**/bar/bar/**,**/baz/bar/**}'],
                [nativeSep('/foo/bar/nope'), null]
            ]);
            const siblings = ['baz', 'baz.zip', 'nope'];
            const hasSibling = (name) => siblings.indexOf(name) !== -1;
            testOptimizationForPaths({
                '**/foo/123/**': { when: '$(basename).zip' },
                '**/bar/123/**': true
            }, ['*/bar/123'], [
                [nativeSep('bar/foo/123'), null],
                [nativeSep('bar/foo/123/baz'), null],
                [nativeSep('bar/foo/123/nope'), null],
                [nativeSep('foo/bar/123'), '**/bar/123/**'],
            ], [
                null,
                hasSibling,
                hasSibling
            ]);
        });
        function testOptimizationForPaths(pattern, pathTerms, matches, siblingsFns = []) {
            const parsed = glob.parse(pattern, { trimForExclusions: true });
            assert.deepStrictEqual(glob.getPathTerms(parsed), pathTerms);
            matches.forEach(([text, result], i) => {
                assert.strictEqual(parsed(text, null, siblingsFns[i]), result);
            });
        }
        function nativeSep(slashPath) {
            return slashPath.replace(/\//g, path_1.sep);
        }
        test('relative pattern - glob star', function () {
            if (platform_1.isWindows) {
                const p = { base: 'C:\\DNXConsoleApp\\foo', pattern: '**/*.cs' };
                assertGlobMatch(p, 'C:\\DNXConsoleApp\\foo\\Program.cs');
                assertGlobMatch(p, 'C:\\DNXConsoleApp\\foo\\bar\\Program.cs');
                assertNoGlobMatch(p, 'C:\\DNXConsoleApp\\foo\\Program.ts');
                assertNoGlobMatch(p, 'C:\\DNXConsoleApp\\Program.cs');
                assertNoGlobMatch(p, 'C:\\other\\DNXConsoleApp\\foo\\Program.ts');
            }
            else {
                const p = { base: '/DNXConsoleApp/foo', pattern: '**/*.cs' };
                assertGlobMatch(p, '/DNXConsoleApp/foo/Program.cs');
                assertGlobMatch(p, '/DNXConsoleApp/foo/bar/Program.cs');
                assertNoGlobMatch(p, '/DNXConsoleApp/foo/Program.ts');
                assertNoGlobMatch(p, '/DNXConsoleApp/Program.cs');
                assertNoGlobMatch(p, '/other/DNXConsoleApp/foo/Program.ts');
            }
        });
        test('relative pattern - single star', function () {
            if (platform_1.isWindows) {
                const p = { base: 'C:\\DNXConsoleApp\\foo', pattern: '*.cs' };
                assertGlobMatch(p, 'C:\\DNXConsoleApp\\foo\\Program.cs');
                assertNoGlobMatch(p, 'C:\\DNXConsoleApp\\foo\\bar\\Program.cs');
                assertNoGlobMatch(p, 'C:\\DNXConsoleApp\\foo\\Program.ts');
                assertNoGlobMatch(p, 'C:\\DNXConsoleApp\\Program.cs');
                assertNoGlobMatch(p, 'C:\\other\\DNXConsoleApp\\foo\\Program.ts');
            }
            else {
                const p = { base: '/DNXConsoleApp/foo', pattern: '*.cs' };
                assertGlobMatch(p, '/DNXConsoleApp/foo/Program.cs');
                assertNoGlobMatch(p, '/DNXConsoleApp/foo/bar/Program.cs');
                assertNoGlobMatch(p, '/DNXConsoleApp/foo/Program.ts');
                assertNoGlobMatch(p, '/DNXConsoleApp/Program.cs');
                assertNoGlobMatch(p, '/other/DNXConsoleApp/foo/Program.ts');
            }
        });
        test('relative pattern - single star with path', function () {
            if (platform_1.isWindows) {
                const p = { base: 'C:\\DNXConsoleApp\\foo', pattern: 'something/*.cs' };
                assertGlobMatch(p, 'C:\\DNXConsoleApp\\foo\\something\\Program.cs');
                assertNoGlobMatch(p, 'C:\\DNXConsoleApp\\foo\\Program.cs');
            }
            else {
                const p = { base: '/DNXConsoleApp/foo', pattern: 'something/*.cs' };
                assertGlobMatch(p, '/DNXConsoleApp/foo/something/Program.cs');
                assertNoGlobMatch(p, '/DNXConsoleApp/foo/Program.cs');
            }
        });
        test('relative pattern - single star alone', function () {
            if (platform_1.isWindows) {
                const p = { base: 'C:\\DNXConsoleApp\\foo\\something\\Program.cs', pattern: '*' };
                assertGlobMatch(p, 'C:\\DNXConsoleApp\\foo\\something\\Program.cs');
                assertNoGlobMatch(p, 'C:\\DNXConsoleApp\\foo\\Program.cs');
            }
            else {
                const p = { base: '/DNXConsoleApp/foo/something/Program.cs', pattern: '*' };
                assertGlobMatch(p, '/DNXConsoleApp/foo/something/Program.cs');
                assertNoGlobMatch(p, '/DNXConsoleApp/foo/Program.cs');
            }
        });
        test('relative pattern - ignores case on macOS/Windows', function () {
            if (platform_1.isWindows) {
                const p = { base: 'C:\\DNXConsoleApp\\foo', pattern: 'something/*.cs' };
                assertGlobMatch(p, 'C:\\DNXConsoleApp\\foo\\something\\Program.cs'.toLowerCase());
            }
            else if (platform_1.isMacintosh) {
                const p = { base: '/DNXConsoleApp/foo', pattern: 'something/*.cs' };
                assertGlobMatch(p, '/DNXConsoleApp/foo/something/Program.cs'.toLowerCase());
            }
            else if (platform_1.isLinux) {
                const p = { base: '/DNXConsoleApp/foo', pattern: 'something/*.cs' };
                assertNoGlobMatch(p, '/DNXConsoleApp/foo/something/Program.cs'.toLowerCase());
            }
        });
        test('relative pattern - trailing slash / backslash (#162498)', function () {
            if (platform_1.isWindows) {
                let p = { base: 'C:\\', pattern: 'foo.cs' };
                assertGlobMatch(p, 'C:\\foo.cs');
                p = { base: 'C:\\bar\\', pattern: 'foo.cs' };
                assertGlobMatch(p, 'C:\\bar\\foo.cs');
            }
            else {
                let p = { base: '/', pattern: 'foo.cs' };
                assertGlobMatch(p, '/foo.cs');
                p = { base: '/bar/', pattern: 'foo.cs' };
                assertGlobMatch(p, '/bar/foo.cs');
            }
        });
        test('pattern with "base" does not explode - #36081', function () {
            assert.ok(glob.match({ 'base': true }, 'base'));
        });
        test('relative pattern - #57475', function () {
            if (platform_1.isWindows) {
                const p = { base: 'C:\\DNXConsoleApp\\foo', pattern: 'styles/style.css' };
                assertGlobMatch(p, 'C:\\DNXConsoleApp\\foo\\styles\\style.css');
                assertNoGlobMatch(p, 'C:\\DNXConsoleApp\\foo\\Program.cs');
            }
            else {
                const p = { base: '/DNXConsoleApp/foo', pattern: 'styles/style.css' };
                assertGlobMatch(p, '/DNXConsoleApp/foo/styles/style.css');
                assertNoGlobMatch(p, '/DNXConsoleApp/foo/Program.cs');
            }
        });
        test('URI match', () => {
            const p = 'scheme:/**/*.md';
            assertGlobMatch(p, uri_1.URI.file('super/duper/long/some/file.md').with({ scheme: 'scheme' }).toString());
        });
        test('expression fails when siblings use promises (https://github.com/microsoft/vscode/issues/146294)', async function () {
            const siblings = ['test.html', 'test.txt', 'test.ts'];
            const hasSibling = (name) => Promise.resolve(siblings.indexOf(name) !== -1);
            // { "**/*.js": { "when": "$(basename).ts" } }
            const expression = {
                '**/test.js': { when: '$(basename).js' },
                '**/*.js': { when: '$(basename).ts' }
            };
            const parsedExpression = glob.parse(expression);
            assert.strictEqual('**/*.js', await parsedExpression('test.js', undefined, hasSibling));
        });
        test('patternsEquals', () => {
            assert.ok(glob.patternsEquals(['a'], ['a']));
            assert.ok(!glob.patternsEquals(['a'], ['b']));
            assert.ok(glob.patternsEquals(['a', 'b', 'c'], ['a', 'b', 'c']));
            assert.ok(!glob.patternsEquals(['1', '2'], ['1', '3']));
            assert.ok(glob.patternsEquals([{ base: 'a', pattern: '*' }, 'b', 'c'], [{ base: 'a', pattern: '*' }, 'b', 'c']));
            assert.ok(glob.patternsEquals(undefined, undefined));
            assert.ok(!glob.patternsEquals(undefined, ['b']));
            assert.ok(!glob.patternsEquals(['a'], undefined));
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYi50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS90ZXN0L2NvbW1vbi9nbG9iLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFTaEcsS0FBSyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUU7UUFFbEIsdUJBQXVCO1FBRXZCLG9CQUFvQjtRQUNwQixnREFBZ0Q7UUFDaEQsc0NBQXNDO1FBQ3RDLHNFQUFzRTtRQUN0RSxlQUFlO1FBQ2YsMEJBQTBCO1FBQzFCLGdDQUFnQztRQUNoQyxvREFBb0Q7UUFDcEQscURBQXFEO1FBQ3JELDBCQUEwQjtRQUMxQixrQkFBa0I7UUFDbEIsa0JBQWtCO1FBQ2xCLGtCQUFrQjtRQUNsQixrQkFBa0I7UUFDbEIsaUJBQWlCO1FBQ2pCLGlCQUFpQjtRQUNqQixpQkFBaUI7UUFDakIsNEJBQTRCO1FBQzVCLGlDQUFpQztRQUNqQyxpQkFBaUI7UUFDakIsaUJBQWlCO1FBQ2pCLGdCQUFnQjtRQUNoQixNQUFNO1FBRU4saUJBQWlCO1FBQ2pCLGlDQUFpQztRQUNqQywwQ0FBMEM7UUFDMUMsa0JBQWtCO1FBQ2xCLHFCQUFxQjtRQUNyQix5QkFBeUI7UUFDekIsbUJBQW1CO1FBQ25CLCtCQUErQjtRQUMvQixNQUFNO1FBRU4sb0JBQW9CO1FBQ3BCLGlCQUFpQjtRQUNqQixrQ0FBa0M7UUFDbEMscUJBQXFCO1FBQ3JCLDhCQUE4QjtRQUM5QixxQ0FBcUM7UUFDckMseUNBQXlDO1FBQ3pDLGVBQWU7UUFDZixzQkFBc0I7UUFDdEIsUUFBUTtRQUNSLE9BQU87UUFDUCxNQUFNO1FBQ04sS0FBSztRQUNMLHlCQUF5QjtRQUN6QixNQUFNO1FBRU4sU0FBUyxlQUFlLENBQUMsT0FBdUMsRUFBRSxLQUFhO1lBQzlFLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsRUFBRSxH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QUFFLEtBQUssQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFckQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM1RCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzlELE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFdEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM1RCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzlELE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFdEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQy9ELE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFdkQsTUFBTSxDQUFDLFdBQVcs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