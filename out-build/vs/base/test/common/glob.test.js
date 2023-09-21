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
            assert(glob.$qj(pattern, input), `${JSON.stringify(pattern)} should match ${input}`);
            assert(glob.$qj(pattern, nativeSep(input)), `${pattern} should match ${nativeSep(input)}`);
        }
        function assertNoGlobMatch(pattern, input) {
            assert(!glob.$qj(pattern, input), `${pattern} should not match ${input}`);
            assert(!glob.$qj(pattern, nativeSep(input)), `${pattern} should not match ${nativeSep(input)}`);
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
            assert.strictEqual('**/*.js', glob.$qj(expression, 'test.js', hasSibling));
            assert.strictEqual(glob.$qj(expression, 'test.js', () => false), null);
            assert.strictEqual(glob.$qj(expression, 'test.js', name => name === 'te.ts'), null);
            assert.strictEqual(glob.$qj(expression, 'test.js'), null);
            expression = {
                '**/*.js': {
                    when: ''
                }
            };
            assert.strictEqual(glob.$qj(expression, 'test.js', hasSibling), null);
            expression = {
                '**/*.js': {}
            };
            assert.strictEqual('**/*.js', glob.$qj(expression, 'test.js', hasSibling));
            expression = {};
            assert.strictEqual(glob.$qj(expression, 'test.js', hasSibling), null);
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
            assert.strictEqual('**/*.js', glob.$qj(expression, 'test.js', hasSibling));
            assert.strictEqual('**/*.as', glob.$qj(expression, 'test.as', hasSibling));
            assert.strictEqual('**/*.bananas', glob.$qj(expression, 'test.bananas', hasSibling));
            assert.strictEqual('**/*.bananas', glob.$qj(expression, 'test.bananas'));
            assert.strictEqual(glob.$qj(expression, 'test.foo', hasSibling), null);
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
            assert.deepStrictEqual(glob.$pj('foo,bar', ','), ['foo', 'bar']);
            assert.deepStrictEqual(glob.$pj('foo', ','), ['foo']);
            assert.deepStrictEqual(glob.$pj('{foo,bar}', ','), ['{foo,bar}']);
            assert.deepStrictEqual(glob.$pj('foo,bar,{foo,bar}', ','), ['foo', 'bar', '{foo,bar}']);
            assert.deepStrictEqual(glob.$pj('{foo,bar},foo,bar,{foo,bar}', ','), ['{foo,bar}', 'foo', 'bar', '{foo,bar}']);
            assert.deepStrictEqual(glob.$pj('[foo,bar]', ','), ['[foo,bar]']);
            assert.deepStrictEqual(glob.$pj('foo,bar,[foo,bar]', ','), ['foo', 'bar', '[foo,bar]']);
            assert.deepStrictEqual(glob.$pj('[foo,bar],foo,bar,[foo,bar]', ','), ['[foo,bar]', 'foo', 'bar', '[foo,bar]']);
        });
        test('expression with disabled glob', function () {
            const expr = { '**/*.js': false };
            assert.strictEqual(glob.$qj(expr, 'foo.js'), null);
        });
        test('expression with two non-trivia globs', function () {
            const expr = {
                '**/*.j?': true,
                '**/*.t?': true
            };
            assert.strictEqual(glob.$qj(expr, 'foo.js'), '**/*.j?');
            assert.strictEqual(glob.$qj(expr, 'foo.as'), null);
        });
        test('expression with non-trivia glob (issue 144458)', function () {
            const pattern = '**/p*';
            assert.strictEqual(glob.$qj(pattern, 'foo/barp'), false);
            assert.strictEqual(glob.$qj(pattern, 'foo/bar/ap'), false);
            assert.strictEqual(glob.$qj(pattern, 'ap'), false);
            assert.strictEqual(glob.$qj(pattern, 'foo/barp1'), false);
            assert.strictEqual(glob.$qj(pattern, 'foo/bar/ap1'), false);
            assert.strictEqual(glob.$qj(pattern, 'ap1'), false);
            assert.strictEqual(glob.$qj(pattern, '/foo/barp'), false);
            assert.strictEqual(glob.$qj(pattern, '/foo/bar/ap'), false);
            assert.strictEqual(glob.$qj(pattern, '/ap'), false);
            assert.strictEqual(glob.$qj(pattern, '/foo/barp1'), false);
            assert.strictEqual(glob.$qj(pattern, '/foo/bar/ap1'), false);
            assert.strictEqual(glob.$qj(pattern, '/ap1'), false);
            assert.strictEqual(glob.$qj(pattern, 'foo/pbar'), true);
            assert.strictEqual(glob.$qj(pattern, '/foo/pbar'), true);
            assert.strictEqual(glob.$qj(pattern, 'foo/bar/pa'), true);
            assert.strictEqual(glob.$qj(pattern, '/p'), true);
        });
        test('expression with empty glob', function () {
            const expr = { '': true };
            assert.strictEqual(glob.$qj(expr, 'foo.js'), null);
        });
        test('expression with other falsy value', function () {
            const expr = { '**/*.js': 0 };
            assert.strictEqual(glob.$qj(expr, 'foo.js'), '**/*.js');
        });
        test('expression with two basename globs', function () {
            const expr = {
                '**/bar': true,
                '**/baz': true
            };
            assert.strictEqual(glob.$qj(expr, 'bar'), '**/bar');
            assert.strictEqual(glob.$qj(expr, 'foo'), null);
            assert.strictEqual(glob.$qj(expr, 'foo/bar'), '**/bar');
            assert.strictEqual(glob.$qj(expr, 'foo\\bar'), '**/bar');
            assert.strictEqual(glob.$qj(expr, 'foo/foo'), null);
        });
        test('expression with two basename globs and a siblings expression', function () {
            const expr = {
                '**/bar': true,
                '**/baz': true,
                '**/*.js': { when: '$(basename).ts' }
            };
            const siblings = ['foo.ts', 'foo.js', 'foo', 'bar'];
            const hasSibling = (name) => siblings.indexOf(name) !== -1;
            assert.strictEqual(glob.$qj(expr, 'bar', hasSibling), '**/bar');
            assert.strictEqual(glob.$qj(expr, 'foo', hasSibling), null);
            assert.strictEqual(glob.$qj(expr, 'foo/bar', hasSibling), '**/bar');
            if (platform_1.$i) {
                // backslash is a valid file name character on posix
                assert.strictEqual(glob.$qj(expr, 'foo\\bar', hasSibling), '**/bar');
            }
            assert.strictEqual(glob.$qj(expr, 'foo/foo', hasSibling), null);
            assert.strictEqual(glob.$qj(expr, 'foo.js', hasSibling), '**/*.js');
            assert.strictEqual(glob.$qj(expr, 'bar.js', hasSibling), null);
        });
        test('expression with multipe basename globs', function () {
            const expr = {
                '**/bar': true,
                '{**/baz,**/foo}': true
            };
            assert.strictEqual(glob.$qj(expr, 'bar'), '**/bar');
            assert.strictEqual(glob.$qj(expr, 'foo'), '{**/baz,**/foo}');
            assert.strictEqual(glob.$qj(expr, 'baz'), '{**/baz,**/foo}');
            assert.strictEqual(glob.$qj(expr, 'abc'), null);
        });
        test('falsy expression/pattern', function () {
            assert.strictEqual(glob.$qj(null, 'foo'), false);
            assert.strictEqual(glob.$qj('', 'foo'), false);
            assert.strictEqual(glob.$rj(null)('foo'), false);
            assert.strictEqual(glob.$rj('')('foo'), false);
        });
        test('falsy path', function () {
            assert.strictEqual(glob.$rj('foo')(null), false);
            assert.strictEqual(glob.$rj('foo')(''), false);
            assert.strictEqual(glob.$rj('**/*.j?')(null), false);
            assert.strictEqual(glob.$rj('**/*.j?')(''), false);
            assert.strictEqual(glob.$rj('**/*.foo')(null), false);
            assert.strictEqual(glob.$rj('**/*.foo')(''), false);
            assert.strictEqual(glob.$rj('**/foo')(null), false);
            assert.strictEqual(glob.$rj('**/foo')(''), false);
            assert.strictEqual(glob.$rj('{**/baz,**/foo}')(null), false);
            assert.strictEqual(glob.$rj('{**/baz,**/foo}')(''), false);
            assert.strictEqual(glob.$rj('{**/*.baz,**/*.foo}')(null), false);
            assert.strictEqual(glob.$rj('{**/*.baz,**/*.foo}')(''), false);
        });
        test('expression/pattern basename', function () {
            assert.strictEqual(glob.$rj('**/foo')('bar/baz', 'baz'), false);
            assert.strictEqual(glob.$rj('**/foo')('bar/foo', 'foo'), true);
            assert.strictEqual(glob.$rj('{**/baz,**/foo}')('baz/bar', 'bar'), false);
            assert.strictEqual(glob.$rj('{**/baz,**/foo}')('baz/foo', 'foo'), true);
            const expr = { '**/*.js': { when: '$(basename).ts' } };
            const siblings = ['foo.ts', 'foo.js'];
            const hasSibling = (name) => siblings.indexOf(name) !== -1;
            assert.strictEqual(glob.$rj(expr)('bar/baz.js', 'baz.js', hasSibling), null);
            assert.strictEqual(glob.$rj(expr)('bar/foo.js', 'foo.js', hasSibling), '**/*.js');
        });
        test('expression/pattern basename terms', function () {
            assert.deepStrictEqual(glob.$tj(glob.$rj('**/*.foo')), []);
            assert.deepStrictEqual(glob.$tj(glob.$rj('**/foo')), ['foo']);
            assert.deepStrictEqual(glob.$tj(glob.$rj('**/foo/')), ['foo']);
            assert.deepStrictEqual(glob.$tj(glob.$rj('{**/baz,**/foo}')), ['baz', 'foo']);
            assert.deepStrictEqual(glob.$tj(glob.$rj('{**/baz/,**/foo/}')), ['baz', 'foo']);
            assert.deepStrictEqual(glob.$tj(glob.$rj({
                '**/foo': true,
                '{**/bar,**/baz}': true,
                '{**/bar2/,**/baz2/}': true,
                '**/bulb': false
            })), ['foo', 'bar', 'baz', 'bar2', 'baz2']);
            assert.deepStrictEqual(glob.$tj(glob.$rj({
                '**/foo': { when: '$(basename).zip' },
                '**/bar': true
            })), ['bar']);
        });
        test('expression/pattern optimization for basenames', function () {
            assert.deepStrictEqual(glob.$tj(glob.$rj('**/foo/**')), []);
            assert.deepStrictEqual(glob.$tj(glob.$rj('**/foo/**', { trimForExclusions: true })), ['foo']);
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
            const parsed = glob.$rj(pattern, { trimForExclusions: true });
            assert.deepStrictEqual(glob.$tj(parsed), basenameTerms);
            matches.forEach(([text, result], i) => {
                assert.strictEqual(parsed(text, null, siblingsFns[i]), result);
            });
        }
        test('trailing slash', function () {
            // Testing existing (more or less intuitive) behavior
            assert.strictEqual(glob.$rj('**/foo/')('bar/baz', 'baz'), false);
            assert.strictEqual(glob.$rj('**/foo/')('bar/foo', 'foo'), true);
            assert.strictEqual(glob.$rj('**/*.foo/')('bar/file.baz', 'file.baz'), false);
            assert.strictEqual(glob.$rj('**/*.foo/')('bar/file.foo', 'file.foo'), true);
            assert.strictEqual(glob.$rj('{**/foo/,**/abc/}')('bar/baz', 'baz'), false);
            assert.strictEqual(glob.$rj('{**/foo/,**/abc/}')('bar/foo', 'foo'), true);
            assert.strictEqual(glob.$rj('{**/foo/,**/abc/}')('bar/abc', 'abc'), true);
            assert.strictEqual(glob.$rj('{**/foo/,**/abc/}', { trimForExclusions: true })('bar/baz', 'baz'), false);
            assert.strictEqual(glob.$rj('{**/foo/,**/abc/}', { trimForExclusions: true })('bar/foo', 'foo'), true);
            assert.strictEqual(glob.$rj('{**/foo/,**/abc/}', { trimForExclusions: true })('bar/abc', 'abc'), true);
        });
        test('expression/pattern path', function () {
            assert.strictEqual(glob.$rj('**/foo/bar')(nativeSep('foo/baz'), 'baz'), false);
            assert.strictEqual(glob.$rj('**/foo/bar')(nativeSep('foo/bar'), 'bar'), true);
            assert.strictEqual(glob.$rj('**/foo/bar')(nativeSep('bar/foo/bar'), 'bar'), true);
            assert.strictEqual(glob.$rj('**/foo/bar/**')(nativeSep('bar/foo/bar'), 'bar'), true);
            assert.strictEqual(glob.$rj('**/foo/bar/**')(nativeSep('bar/foo/bar/baz'), 'baz'), true);
            assert.strictEqual(glob.$rj('**/foo/bar/**', { trimForExclusions: true })(nativeSep('bar/foo/bar'), 'bar'), true);
            assert.strictEqual(glob.$rj('**/foo/bar/**', { trimForExclusions: true })(nativeSep('bar/foo/bar/baz'), 'baz'), false);
            assert.strictEqual(glob.$rj('foo/bar')(nativeSep('foo/baz'), 'baz'), false);
            assert.strictEqual(glob.$rj('foo/bar')(nativeSep('foo/bar'), 'bar'), true);
            assert.strictEqual(glob.$rj('foo/bar/baz')(nativeSep('foo/bar/baz'), 'baz'), true); // #15424
            assert.strictEqual(glob.$rj('foo/bar')(nativeSep('bar/foo/bar'), 'bar'), false);
            assert.strictEqual(glob.$rj('foo/bar/**')(nativeSep('foo/bar/baz'), 'baz'), true);
            assert.strictEqual(glob.$rj('foo/bar/**', { trimForExclusions: true })(nativeSep('foo/bar'), 'bar'), true);
            assert.strictEqual(glob.$rj('foo/bar/**', { trimForExclusions: true })(nativeSep('foo/bar/baz'), 'baz'), false);
        });
        test('expression/pattern paths', function () {
            assert.deepStrictEqual(glob.$uj(glob.$rj('**/*.foo')), []);
            assert.deepStrictEqual(glob.$uj(glob.$rj('**/foo')), []);
            assert.deepStrictEqual(glob.$uj(glob.$rj('**/foo/bar')), ['*/foo/bar']);
            assert.deepStrictEqual(glob.$uj(glob.$rj('**/foo/bar/')), ['*/foo/bar']);
            // Not supported
            // assert.deepStrictEqual(glob.getPathTerms(glob.parse('{**/baz/bar,**/foo/bar,**/bar}')), ['*/baz/bar', '*/foo/bar']);
            // assert.deepStrictEqual(glob.getPathTerms(glob.parse('{**/baz/bar/,**/foo/bar/,**/bar/}')), ['*/baz/bar', '*/foo/bar']);
            const parsed = glob.$rj({
                '**/foo/bar': true,
                '**/foo2/bar2': true,
                // Not supported
                // '{**/bar/foo,**/baz/foo}': true,
                // '{**/bar2/foo/,**/baz2/foo/}': true,
                '**/bulb': true,
                '**/bulb2': true,
                '**/bulb/foo': false
            });
            assert.deepStrictEqual(glob.$uj(parsed), ['*/foo/bar', '*/foo2/bar2']);
            assert.deepStrictEqual(glob.$tj(parsed), ['bulb', 'bulb2']);
            assert.deepStrictEqual(glob.$uj(glob.$rj({
                '**/foo/bar': { when: '$(basename).zip' },
                '**/bar/foo': true,
                '**/bar2/foo2': true
            })), ['*/bar/foo', '*/bar2/foo2']);
        });
        test('expression/pattern optimization for paths', function () {
            assert.deepStrictEqual(glob.$uj(glob.$rj('**/foo/bar/**')), []);
            assert.deepStrictEqual(glob.$uj(glob.$rj('**/foo/bar/**', { trimForExclusions: true })), ['*/foo/bar']);
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
            const parsed = glob.$rj(pattern, { trimForExclusions: true });
            assert.deepStrictEqual(glob.$uj(parsed), pathTerms);
            matches.forEach(([text, result], i) => {
                assert.strictEqual(parsed(text, null, siblingsFns[i]), result);
            });
        }
        function nativeSep(slashPath) {
            return slashPath.replace(/\//g, path_1.sep);
        }
        test('relative pattern - glob star', function () {
            if (platform_1.$i) {
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
            if (platform_1.$i) {
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
            if (platform_1.$i) {
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
            if (platform_1.$i) {
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
            if (platform_1.$i) {
                const p = { base: 'C:\\DNXConsoleApp\\foo', pattern: 'something/*.cs' };
                assertGlobMatch(p, 'C:\\DNXConsoleApp\\foo\\something\\Program.cs'.toLowerCase());
            }
            else if (platform_1.$j) {
                const p = { base: '/DNXConsoleApp/foo', pattern: 'something/*.cs' };
                assertGlobMatch(p, '/DNXConsoleApp/foo/something/Program.cs'.toLowerCase());
            }
            else if (platform_1.$k) {
                const p = { base: '/DNXConsoleApp/foo', pattern: 'something/*.cs' };
                assertNoGlobMatch(p, '/DNXConsoleApp/foo/something/Program.cs'.toLowerCase());
            }
        });
        test('relative pattern - trailing slash / backslash (#162498)', function () {
            if (platform_1.$i) {
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
            assert.ok(glob.$qj({ 'base': true }, 'base'));
        });
        test('relative pattern - #57475', function () {
            if (platform_1.$i) {
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
            const parsedExpression = glob.$rj(expression);
            assert.strictEqual('**/*.js', await parsedExpression('test.js', undefined, hasSibling));
        });
        test('patternsEquals', () => {
            assert.ok(glob.$vj(['a'], ['a']));
            assert.ok(!glob.$vj(['a'], ['b']));
            assert.ok(glob.$vj(['a', 'b', 'c'], ['a', 'b', 'c']));
            assert.ok(!glob.$vj(['1', '2'], ['1', '3']));
            assert.ok(glob.$vj([{ base: 'a', pattern: '*' }, 'b', 'c'], [{ base: 'a', pattern: '*' }, 'b', 'c']));
            assert.ok(glob.$vj(undefined, undefined));
            assert.ok(!glob.$vj(undefined, ['b']));
            assert.ok(!glob.$vj(['a'], undefined));
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=glob.test.js.map