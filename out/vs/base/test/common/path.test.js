/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/process"], function (require, exports, assert, path, platform_1, process) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Paths (Node Implementation)', () => {
        const __filename = 'path.test.js';
        test('join', () => {
            const failures = [];
            const backslashRE = /\\/g;
            const joinTests = [
                [[path.posix.join, path.win32.join],
                    // arguments                     result
                    [[['.', 'x/b', '..', '/b/c.js'], 'x/b/c.js'],
                        [[], '.'],
                        [['/.', 'x/b', '..', '/b/c.js'], '/x/b/c.js'],
                        [['/foo', '../../../bar'], '/bar'],
                        [['foo', '../../../bar'], '../../bar'],
                        [['foo/', '../../../bar'], '../../bar'],
                        [['foo/x', '../../../bar'], '../bar'],
                        [['foo/x', './bar'], 'foo/x/bar'],
                        [['foo/x/', './bar'], 'foo/x/bar'],
                        [['foo/x/', '.', 'bar'], 'foo/x/bar'],
                        [['./'], './'],
                        [['.', './'], './'],
                        [['.', '.', '.'], '.'],
                        [['.', './', '.'], '.'],
                        [['.', '/./', '.'], '.'],
                        [['.', '/////./', '.'], '.'],
                        [['.'], '.'],
                        [['', '.'], '.'],
                        [['', 'foo'], 'foo'],
                        [['foo', '/bar'], 'foo/bar'],
                        [['', '/foo'], '/foo'],
                        [['', '', '/foo'], '/foo'],
                        [['', '', 'foo'], 'foo'],
                        [['foo', ''], 'foo'],
                        [['foo/', ''], 'foo/'],
                        [['foo', '', '/bar'], 'foo/bar'],
                        [['./', '..', '/foo'], '../foo'],
                        [['./', '..', '..', '/foo'], '../../foo'],
                        [['.', '..', '..', '/foo'], '../../foo'],
                        [['', '..', '..', '/foo'], '../../foo'],
                        [['/'], '/'],
                        [['/', '.'], '/'],
                        [['/', '..'], '/'],
                        [['/', '..', '..'], '/'],
                        [[''], '.'],
                        [['', ''], '.'],
                        [[' /foo'], ' /foo'],
                        [[' ', 'foo'], ' /foo'],
                        [[' ', '.'], ' '],
                        [[' ', '/'], ' /'],
                        [[' ', ''], ' '],
                        [['/', 'foo'], '/foo'],
                        [['/', '/foo'], '/foo'],
                        [['/', '//foo'], '/foo'],
                        [['/', '', '/foo'], '/foo'],
                        [['', '/', 'foo'], '/foo'],
                        [['', '/', '/foo'], '/foo']
                    ]
                ]
            ];
            // Windows-specific join tests
            joinTests.push([
                path.win32.join,
                joinTests[0][1].slice(0).concat([
                    // UNC path expected
                    [['//foo/bar'], '\\\\foo\\bar\\'],
                    [['\\/foo/bar'], '\\\\foo\\bar\\'],
                    [['\\\\foo/bar'], '\\\\foo\\bar\\'],
                    // UNC path expected - server and share separate
                    [['//foo', 'bar'], '\\\\foo\\bar\\'],
                    [['//foo/', 'bar'], '\\\\foo\\bar\\'],
                    [['//foo', '/bar'], '\\\\foo\\bar\\'],
                    // UNC path expected - questionable
                    [['//foo', '', 'bar'], '\\\\foo\\bar\\'],
                    [['//foo/', '', 'bar'], '\\\\foo\\bar\\'],
                    [['//foo/', '', '/bar'], '\\\\foo\\bar\\'],
                    // UNC path expected - even more questionable
                    [['', '//foo', 'bar'], '\\\\foo\\bar\\'],
                    [['', '//foo/', 'bar'], '\\\\foo\\bar\\'],
                    [['', '//foo/', '/bar'], '\\\\foo\\bar\\'],
                    // No UNC path expected (no double slash in first component)
                    [['\\', 'foo/bar'], '\\foo\\bar'],
                    [['\\', '/foo/bar'], '\\foo\\bar'],
                    [['', '/', '/foo/bar'], '\\foo\\bar'],
                    // No UNC path expected (no non-slashes in first component -
                    // questionable)
                    [['//', 'foo/bar'], '\\foo\\bar'],
                    [['//', '/foo/bar'], '\\foo\\bar'],
                    [['\\\\', '/', '/foo/bar'], '\\foo\\bar'],
                    [['//'], '\\'],
                    // No UNC path expected (share name missing - questionable).
                    [['//foo'], '\\foo'],
                    [['//foo/'], '\\foo\\'],
                    [['//foo', '/'], '\\foo\\'],
                    [['//foo', '', '/'], '\\foo\\'],
                    // No UNC path expected (too many leading slashes - questionable)
                    [['///foo/bar'], '\\foo\\bar'],
                    [['////foo', 'bar'], '\\foo\\bar'],
                    [['\\\\\\/foo/bar'], '\\foo\\bar'],
                    // Drive-relative vs drive-absolute paths. This merely describes the
                    // status quo, rather than being obviously right
                    [['c:'], 'c:.'],
                    [['c:.'], 'c:.'],
                    [['c:', ''], 'c:.'],
                    [['', 'c:'], 'c:.'],
                    [['c:.', '/'], 'c:.\\'],
                    [['c:.', 'file'], 'c:file'],
                    [['c:', '/'], 'c:\\'],
                    [['c:', 'file'], 'c:\\file']
                ])
            ]);
            joinTests.forEach((test) => {
                if (!Array.isArray(test[0])) {
                    test[0] = [test[0]];
                }
                test[0].forEach((join) => {
                    test[1].forEach((test) => {
                        const actual = join.apply(null, test[0]);
                        const expected = test[1];
                        // For non-Windows specific tests with the Windows join(), we need to try
                        // replacing the slashes since the non-Windows specific tests' `expected`
                        // use forward slashes
                        let actualAlt;
                        let os;
                        if (join === path.win32.join) {
                            actualAlt = actual.replace(backslashRE, '/');
                            os = 'win32';
                        }
                        else {
                            os = 'posix';
                        }
                        const message = `path.${os}.join(${test[0].map(JSON.stringify).join(',')})\n  expect=${JSON.stringify(expected)}\n  actual=${JSON.stringify(actual)}`;
                        if (actual !== expected && actualAlt !== expected) {
                            failures.push(`\n${message}`);
                        }
                    });
                });
            });
            assert.strictEqual(failures.length, 0, failures.join(''));
        });
        test('dirname', () => {
            assert.strictEqual(path.posix.dirname('/a/b/'), '/a');
            assert.strictEqual(path.posix.dirname('/a/b'), '/a');
            assert.strictEqual(path.posix.dirname('/a'), '/');
            assert.strictEqual(path.posix.dirname(''), '.');
            assert.strictEqual(path.posix.dirname('/'), '/');
            assert.strictEqual(path.posix.dirname('////'), '/');
            assert.strictEqual(path.posix.dirname('//a'), '//');
            assert.strictEqual(path.posix.dirname('foo'), '.');
            assert.strictEqual(path.win32.dirname('c:\\'), 'c:\\');
            assert.strictEqual(path.win32.dirname('c:\\foo'), 'c:\\');
            assert.strictEqual(path.win32.dirname('c:\\foo\\'), 'c:\\');
            assert.strictEqual(path.win32.dirname('c:\\foo\\bar'), 'c:\\foo');
            assert.strictEqual(path.win32.dirname('c:\\foo\\bar\\'), 'c:\\foo');
            assert.strictEqual(path.win32.dirname('c:\\foo\\bar\\baz'), 'c:\\foo\\bar');
            assert.strictEqual(path.win32.dirname('\\'), '\\');
            assert.strictEqual(path.win32.dirname('\\foo'), '\\');
            assert.strictEqual(path.win32.dirname('\\foo\\'), '\\');
            assert.strictEqual(path.win32.dirname('\\foo\\bar'), '\\foo');
            assert.strictEqual(path.win32.dirname('\\foo\\bar\\'), '\\foo');
            assert.strictEqual(path.win32.dirname('\\foo\\bar\\baz'), '\\foo\\bar');
            assert.strictEqual(path.win32.dirname('c:'), 'c:');
            assert.strictEqual(path.win32.dirname('c:foo'), 'c:');
            assert.strictEqual(path.win32.dirname('c:foo\\'), 'c:');
            assert.strictEqual(path.win32.dirname('c:foo\\bar'), 'c:foo');
            assert.strictEqual(path.win32.dirname('c:foo\\bar\\'), 'c:foo');
            assert.strictEqual(path.win32.dirname('c:foo\\bar\\baz'), 'c:foo\\bar');
            assert.strictEqual(path.win32.dirname('file:stream'), '.');
            assert.strictEqual(path.win32.dirname('dir\\file:stream'), 'dir');
            assert.strictEqual(path.win32.dirname('\\\\unc\\share'), '\\\\unc\\share');
            assert.strictEqual(path.win32.dirname('\\\\unc\\share\\foo'), '\\\\unc\\share\\');
            assert.strictEqual(path.win32.dirname('\\\\unc\\share\\foo\\'), '\\\\unc\\share\\');
            assert.strictEqual(path.win32.dirname('\\\\unc\\share\\foo\\bar'), '\\\\unc\\share\\foo');
            assert.strictEqual(path.win32.dirname('\\\\unc\\share\\foo\\bar\\'), '\\\\unc\\share\\foo');
            assert.strictEqual(path.win32.dirname('\\\\unc\\share\\foo\\bar\\baz'), '\\\\unc\\share\\foo\\bar');
            assert.strictEqual(path.win32.dirname('/a/b/'), '/a');
            assert.strictEqual(path.win32.dirname('/a/b'), '/a');
            assert.strictEqual(path.win32.dirname('/a'), '/');
            assert.strictEqual(path.win32.dirname(''), '.');
            assert.strictEqual(path.win32.dirname('/'), '/');
            assert.strictEqual(path.win32.dirname('////'), '/');
            assert.strictEqual(path.win32.dirname('foo'), '.');
            // Tests from VSCode
            function assertDirname(p, expected, win = false) {
                const actual = win ? path.win32.dirname(p) : path.posix.dirname(p);
                if (actual !== expected) {
                    assert.fail(`${p}: expected: ${expected}, ours: ${actual}`);
                }
            }
            assertDirname('foo/bar', 'foo');
            assertDirname('foo\\bar', 'foo', true);
            assertDirname('/foo/bar', '/foo');
            assertDirname('\\foo\\bar', '\\foo', true);
            assertDirname('/foo', '/');
            assertDirname('\\foo', '\\', true);
            assertDirname('/', '/');
            assertDirname('\\', '\\', true);
            assertDirname('foo', '.');
            assertDirname('f', '.');
            assertDirname('f/', '.');
            assertDirname('/folder/', '/');
            assertDirname('c:\\some\\file.txt', 'c:\\some', true);
            assertDirname('c:\\some', 'c:\\', true);
            assertDirname('c:\\', 'c:\\', true);
            assertDirname('c:', 'c:', true);
            assertDirname('\\\\server\\share\\some\\path', '\\\\server\\share\\some', true);
            assertDirname('\\\\server\\share\\some', '\\\\server\\share\\', true);
            assertDirname('\\\\server\\share\\', '\\\\server\\share\\', true);
        });
        test('extname', () => {
            const failures = [];
            const slashRE = /\//g;
            [
                [__filename, '.js'],
                ['', ''],
                ['/path/to/file', ''],
                ['/path/to/file.ext', '.ext'],
                ['/path.to/file.ext', '.ext'],
                ['/path.to/file', ''],
                ['/path.to/.file', ''],
                ['/path.to/.file.ext', '.ext'],
                ['/path/to/f.ext', '.ext'],
                ['/path/to/..ext', '.ext'],
                ['/path/to/..', ''],
                ['file', ''],
                ['file.ext', '.ext'],
                ['.file', ''],
                ['.file.ext', '.ext'],
                ['/file', ''],
                ['/file.ext', '.ext'],
                ['/.file', ''],
                ['/.file.ext', '.ext'],
                ['.path/file.ext', '.ext'],
                ['file.ext.ext', '.ext'],
                ['file.', '.'],
                ['.', ''],
                ['./', ''],
                ['.file.ext', '.ext'],
                ['.file', ''],
                ['.file.', '.'],
                ['.file..', '.'],
                ['..', ''],
                ['../', ''],
                ['..file.ext', '.ext'],
                ['..file', '.file'],
                ['..file.', '.'],
                ['..file..', '.'],
                ['...', '.'],
                ['...ext', '.ext'],
                ['....', '.'],
                ['file.ext/', '.ext'],
                ['file.ext//', '.ext'],
                ['file/', ''],
                ['file//', ''],
                ['file./', '.'],
                ['file.//', '.'],
            ].forEach((test) => {
                const expected = test[1];
                [path.posix.extname, path.win32.extname].forEach((extname) => {
                    let input = test[0];
                    let os;
                    if (extname === path.win32.extname) {
                        input = input.replace(slashRE, '\\');
                        os = 'win32';
                    }
                    else {
                        os = 'posix';
                    }
                    const actual = extname(input);
                    const message = `path.${os}.extname(${JSON.stringify(input)})\n  expect=${JSON.stringify(expected)}\n  actual=${JSON.stringify(actual)}`;
                    if (actual !== expected) {
                        failures.push(`\n${message}`);
                    }
                });
                {
                    const input = `C:${test[0].replace(slashRE, '\\')}`;
                    const actual = path.win32.extname(input);
                    const message = `path.win32.extname(${JSON.stringify(input)})\n  expect=${JSON.stringify(expected)}\n  actual=${JSON.stringify(actual)}`;
                    if (actual !== expected) {
                        failures.push(`\n${message}`);
                    }
                }
            });
            assert.strictEqual(failures.length, 0, failures.join(''));
            // On Windows, backslash is a path separator.
            assert.strictEqual(path.win32.extname('.\\'), '');
            assert.strictEqual(path.win32.extname('..\\'), '');
            assert.strictEqual(path.win32.extname('file.ext\\'), '.ext');
            assert.strictEqual(path.win32.extname('file.ext\\\\'), '.ext');
            assert.strictEqual(path.win32.extname('file\\'), '');
            assert.strictEqual(path.win32.extname('file\\\\'), '');
            assert.strictEqual(path.win32.extname('file.\\'), '.');
            assert.strictEqual(path.win32.extname('file.\\\\'), '.');
            // On *nix, backslash is a valid name component like any other character.
            assert.strictEqual(path.posix.extname('.\\'), '');
            assert.strictEqual(path.posix.extname('..\\'), '.\\');
            assert.strictEqual(path.posix.extname('file.ext\\'), '.ext\\');
            assert.strictEqual(path.posix.extname('file.ext\\\\'), '.ext\\\\');
            assert.strictEqual(path.posix.extname('file\\'), '');
            assert.strictEqual(path.posix.extname('file\\\\'), '');
            assert.strictEqual(path.posix.extname('file.\\'), '.\\');
            assert.strictEqual(path.posix.extname('file.\\\\'), '.\\\\');
            // Tests from VSCode
            assert.strictEqual(path.extname('far.boo'), '.boo');
            assert.strictEqual(path.extname('far.b'), '.b');
            assert.strictEqual(path.extname('far.'), '.');
            assert.strictEqual(path.extname('far.boo/boo.far'), '.far');
            assert.strictEqual(path.extname('far.boo/boo'), '');
        });
        test('resolve', () => {
            const failures = [];
            const slashRE = /\//g;
            const backslashRE = /\\/g;
            const resolveTests = [
                [path.win32.resolve,
                    // arguments                               result
                    [[['c:/blah\\blah', 'd:/games', 'c:../a'], 'c:\\blah\\a'],
                        [['c:/ignore', 'd:\\a/b\\c/d', '\\e.exe'], 'd:\\e.exe'],
                        [['c:/ignore', 'c:/some/file'], 'c:\\some\\file'],
                        [['d:/ignore', 'd:some/dir//'], 'd:\\ignore\\some\\dir'],
                        [['//server/share', '..', 'relative\\'], '\\\\server\\share\\relative'],
                        [['c:/', '//'], 'c:\\'],
                        [['c:/', '//dir'], 'c:\\dir'],
                        [['c:/', '//server/share'], '\\\\server\\share\\'],
                        [['c:/', '//server//share'], '\\\\server\\share\\'],
                        [['c:/', '///some//dir'], 'c:\\some\\dir'],
                        [['C:\\foo\\tmp.3\\', '..\\tmp.3\\cycles\\root.js'],
                            'C:\\foo\\tmp.3\\cycles\\root.js']
                    ]
                ],
                [path.posix.resolve,
                    // arguments                    result
                    [[['/var/lib', '../', 'file/'], '/var/file'],
                        [['/var/lib', '/../', 'file/'], '/file'],
                        [['/some/dir', '.', '/absolute/'], '/absolute'],
                        [['/foo/tmp.3/', '../tmp.3/cycles/root.js'], '/foo/tmp.3/cycles/root.js']
                    ]
                ],
                [(platform_1.isWeb ? path.posix.resolve : path.resolve),
                    // arguments						result
                    [[['.'], process.cwd()],
                        [['a/b/c', '../../..'], process.cwd()]
                    ]
                ],
            ];
            resolveTests.forEach((test) => {
                const resolve = test[0];
                //@ts-expect-error
                test[1].forEach((test) => {
                    //@ts-expect-error
                    const actual = resolve.apply(null, test[0]);
                    let actualAlt;
                    const os = resolve === path.win32.resolve ? 'win32' : 'posix';
                    if (resolve === path.win32.resolve && !platform_1.isWindows) {
                        actualAlt = actual.replace(backslashRE, '/');
                    }
                    else if (resolve !== path.win32.resolve && platform_1.isWindows) {
                        actualAlt = actual.replace(slashRE, '\\');
                    }
                    const expected = test[1];
                    const message = `path.${os}.resolve(${test[0].map(JSON.stringify).join(',')})\n  expect=${JSON.stringify(expected)}\n  actual=${JSON.stringify(actual)}`;
                    if (actual !== expected && actualAlt !== expected) {
                        failures.push(`\n${message}`);
                    }
                });
            });
            assert.strictEqual(failures.length, 0, failures.join(''));
            // if (isWindows) {
            // 	// Test resolving the current Windows drive letter from a spawned process.
            // 	// See https://github.com/nodejs/node/issues/7215
            // 	const currentDriveLetter = path.parse(process.cwd()).root.substring(0, 2);
            // 	const resolveFixture = fixtures.path('path-resolve.js');
            // 	const spawnResult = child.spawnSync(
            // 		process.argv[0], [resolveFixture, currentDriveLetter]);
            // 	const resolvedPath = spawnResult.stdout.toString().trim();
            // 	assert.strictEqual(resolvedPath.toLowerCase(), process.cwd().toLowerCase());
            // }
        });
        test('basename', () => {
            assert.strictEqual(path.basename(__filename), 'path.test.js');
            assert.strictEqual(path.basename(__filename, '.js'), 'path.test');
            assert.strictEqual(path.basename('.js', '.js'), '');
            assert.strictEqual(path.basename(''), '');
            assert.strictEqual(path.basename('/dir/basename.ext'), 'basename.ext');
            assert.strictEqual(path.basename('/basename.ext'), 'basename.ext');
            assert.strictEqual(path.basename('basename.ext'), 'basename.ext');
            assert.strictEqual(path.basename('basename.ext/'), 'basename.ext');
            assert.strictEqual(path.basename('basename.ext//'), 'basename.ext');
            assert.strictEqual(path.basename('aaa/bbb', '/bbb'), 'bbb');
            assert.strictEqual(path.basename('aaa/bbb', 'a/bbb'), 'bbb');
            assert.strictEqual(path.basename('aaa/bbb', 'bbb'), 'bbb');
            assert.strictEqual(path.basename('aaa/bbb//', 'bbb'), 'bbb');
            assert.strictEqual(path.basename('aaa/bbb', 'bb'), 'b');
            assert.strictEqual(path.basename('aaa/bbb', 'b'), 'bb');
            assert.strictEqual(path.basename('/aaa/bbb', '/bbb'), 'bbb');
            assert.strictEqual(path.basename('/aaa/bbb', 'a/bbb'), 'bbb');
            assert.strictEqual(path.basename('/aaa/bbb', 'bbb'), 'bbb');
            assert.strictEqual(path.basename('/aaa/bbb//', 'bbb'), 'bbb');
            assert.strictEqual(path.basename('/aaa/bbb', 'bb'), 'b');
            assert.strictEqual(path.basename('/aaa/bbb', 'b'), 'bb');
            assert.strictEqual(path.basename('/aaa/bbb'), 'bbb');
            assert.strictEqual(path.basename('/aaa/'), 'aaa');
            assert.strictEqual(path.basename('/aaa/b'), 'b');
            assert.strictEqual(path.basename('/a/b'), 'b');
            assert.strictEqual(path.basename('//a'), 'a');
            assert.strictEqual(path.basename('a', 'a'), '');
            // On Windows a backslash acts as a path separator.
            assert.strictEqual(path.win32.basename('\\dir\\basename.ext'), 'basename.ext');
            assert.strictEqual(path.win32.basename('\\basename.ext'), 'basename.ext');
            assert.strictEqual(path.win32.basename('basename.ext'), 'basename.ext');
            assert.strictEqual(path.win32.basename('basename.ext\\'), 'basename.ext');
            assert.strictEqual(path.win32.basename('basename.ext\\\\'), 'basename.ext');
            assert.strictEqual(path.win32.basename('foo'), 'foo');
            assert.strictEqual(path.win32.basename('aaa\\bbb', '\\bbb'), 'bbb');
            assert.strictEqual(path.win32.basename('aaa\\bbb', 'a\\bbb'), 'bbb');
            assert.strictEqual(path.win32.basename('aaa\\bbb', 'bbb'), 'bbb');
            assert.strictEqual(path.win32.basename('aaa\\bbb\\\\\\\\', 'bbb'), 'bbb');
            assert.strictEqual(path.win32.basename('aaa\\bbb', 'bb'), 'b');
            assert.strictEqual(path.win32.basename('aaa\\bbb', 'b'), 'bb');
            assert.strictEqual(path.win32.basename('C:'), '');
            assert.strictEqual(path.win32.basename('C:.'), '.');
            assert.strictEqual(path.win32.basename('C:\\'), '');
            assert.strictEqual(path.win32.basename('C:\\dir\\base.ext'), 'base.ext');
            assert.strictEqual(path.win32.basename('C:\\basename.ext'), 'basename.ext');
            assert.strictEqual(path.win32.basename('C:basename.ext'), 'basename.ext');
            assert.strictEqual(path.win32.basename('C:basename.ext\\'), 'basename.ext');
            assert.strictEqual(path.win32.basename('C:basename.ext\\\\'), 'basename.ext');
            assert.strictEqual(path.win32.basename('C:foo'), 'foo');
            assert.strictEqual(path.win32.basename('file:stream'), 'file:stream');
            assert.strictEqual(path.win32.basename('a', 'a'), '');
            // On unix a backslash is just treated as any other character.
            assert.strictEqual(path.posix.basename('\\dir\\basename.ext'), '\\dir\\basename.ext');
            assert.strictEqual(path.posix.basename('\\basename.ext'), '\\basename.ext');
            assert.strictEqual(path.posix.basename('basename.ext'), 'basename.ext');
            assert.strictEqual(path.posix.basename('basename.ext\\'), 'basename.ext\\');
            assert.strictEqual(path.posix.basename('basename.ext\\\\'), 'basename.ext\\\\');
            assert.strictEqual(path.posix.basename('foo'), 'foo');
            // POSIX filenames may include control characters
            // c.f. http://www.dwheeler.com/essays/fixing-unix-linux-filenames.html
            const controlCharFilename = `Icon${String.fromCharCode(13)}`;
            assert.strictEqual(path.posix.basename(`/a/b/${controlCharFilename}`), controlCharFilename);
            // Tests from VSCode
            assert.strictEqual(path.basename('foo/bar'), 'bar');
            assert.strictEqual(path.posix.basename('foo\\bar'), 'foo\\bar');
            assert.strictEqual(path.win32.basename('foo\\bar'), 'bar');
            assert.strictEqual(path.basename('/foo/bar'), 'bar');
            assert.strictEqual(path.posix.basename('\\foo\\bar'), '\\foo\\bar');
            assert.strictEqual(path.win32.basename('\\foo\\bar'), 'bar');
            assert.strictEqual(path.basename('./bar'), 'bar');
            assert.strictEqual(path.posix.basename('.\\bar'), '.\\bar');
            assert.strictEqual(path.win32.basename('.\\bar'), 'bar');
            assert.strictEqual(path.basename('/bar'), 'bar');
            assert.strictEqual(path.posix.basename('\\bar'), '\\bar');
            assert.strictEqual(path.win32.basename('\\bar'), 'bar');
            assert.strictEqual(path.basename('bar/'), 'bar');
            assert.strictEqual(path.posix.basename('bar\\'), 'bar\\');
            assert.strictEqual(path.win32.basename('bar\\'), 'bar');
            assert.strictEqual(path.basename('bar'), 'bar');
            assert.strictEqual(path.basename('////////'), '');
            assert.strictEqual(path.posix.basename('\\\\\\\\'), '\\\\\\\\');
            assert.strictEqual(path.win32.basename('\\\\\\\\'), '');
        });
        test('relative', () => {
            const failures = [];
            const relativeTests = [
                [path.win32.relative,
                    // arguments                     result
                    [['c:/blah\\blah', 'd:/games', 'd:\\games'],
                        ['c:/aaaa/bbbb', 'c:/aaaa', '..'],
                        ['c:/aaaa/bbbb', 'c:/cccc', '..\\..\\cccc'],
                        ['c:/aaaa/bbbb', 'c:/aaaa/bbbb', ''],
                        ['c:/aaaa/bbbb', 'c:/aaaa/cccc', '..\\cccc'],
                        ['c:/aaaa/', 'c:/aaaa/cccc', 'cccc'],
                        ['c:/', 'c:\\aaaa\\bbbb', 'aaaa\\bbbb'],
                        ['c:/aaaa/bbbb', 'd:\\', 'd:\\'],
                        ['c:/AaAa/bbbb', 'c:/aaaa/bbbb', ''],
                        ['c:/aaaaa/', 'c:/aaaa/cccc', '..\\aaaa\\cccc'],
                        ['C:\\foo\\bar\\baz\\quux', 'C:\\', '..\\..\\..\\..'],
                        ['C:\\foo\\test', 'C:\\foo\\test\\bar\\package.json', 'bar\\package.json'],
                        ['C:\\foo\\bar\\baz-quux', 'C:\\foo\\bar\\baz', '..\\baz'],
                        ['C:\\foo\\bar\\baz', 'C:\\foo\\bar\\baz-quux', '..\\baz-quux'],
                        ['\\\\foo\\bar', '\\\\foo\\bar\\baz', 'baz'],
                        ['\\\\foo\\bar\\baz', '\\\\foo\\bar', '..'],
                        ['\\\\foo\\bar\\baz-quux', '\\\\foo\\bar\\baz', '..\\baz'],
                        ['\\\\foo\\bar\\baz', '\\\\foo\\bar\\baz-quux', '..\\baz-quux'],
                        ['C:\\baz-quux', 'C:\\baz', '..\\baz'],
                        ['C:\\baz', 'C:\\baz-quux', '..\\baz-quux'],
                        ['\\\\foo\\baz-quux', '\\\\foo\\baz', '..\\baz'],
                        ['\\\\foo\\baz', '\\\\foo\\baz-quux', '..\\baz-quux'],
                        ['C:\\baz', '\\\\foo\\bar\\baz', '\\\\foo\\bar\\baz'],
                        ['\\\\foo\\bar\\baz', 'C:\\baz', 'C:\\baz']
                    ]
                ],
                [path.posix.relative,
                    // arguments          result
                    [['/var/lib', '/var', '..'],
                        ['/var/lib', '/bin', '../../bin'],
                        ['/var/lib', '/var/lib', ''],
                        ['/var/lib', '/var/apache', '../apache'],
                        ['/var/', '/var/lib', 'lib'],
                        ['/', '/var/lib', 'var/lib'],
                        ['/foo/test', '/foo/test/bar/package.json', 'bar/package.json'],
                        ['/Users/a/web/b/test/mails', '/Users/a/web/b', '../..'],
                        ['/foo/bar/baz-quux', '/foo/bar/baz', '../baz'],
                        ['/foo/bar/baz', '/foo/bar/baz-quux', '../baz-quux'],
                        ['/baz-quux', '/baz', '../baz'],
                        ['/baz', '/baz-quux', '../baz-quux']
                    ]
                ]
            ];
            relativeTests.forEach((test) => {
                const relative = test[0];
                //@ts-expect-error
                test[1].forEach((test) => {
                    //@ts-expect-error
                    const actual = relative(test[0], test[1]);
                    const expected = test[2];
                    const os = relative === path.win32.relative ? 'win32' : 'posix';
                    const message = `path.${os}.relative(${test.slice(0, 2).map(JSON.stringify).join(',')})\n  expect=${JSON.stringify(expected)}\n  actual=${JSON.stringify(actual)}`;
                    if (actual !== expected) {
                        failures.push(`\n${message}`);
                    }
                });
            });
            assert.strictEqual(failures.length, 0, failures.join(''));
        });
        test('normalize', () => {
            assert.strictEqual(path.win32.normalize('./fixtures///b/../b/c.js'), 'fixtures\\b\\c.js');
            assert.strictEqual(path.win32.normalize('/foo/../../../bar'), '\\bar');
            assert.strictEqual(path.win32.normalize('a//b//../b'), 'a\\b');
            assert.strictEqual(path.win32.normalize('a//b//./c'), 'a\\b\\c');
            assert.strictEqual(path.win32.normalize('a//b//.'), 'a\\b');
            assert.strictEqual(path.win32.normalize('//server/share/dir/file.ext'), '\\\\server\\share\\dir\\file.ext');
            assert.strictEqual(path.win32.normalize('/a/b/c/../../../x/y/z'), '\\x\\y\\z');
            assert.strictEqual(path.win32.normalize('C:'), 'C:.');
            assert.strictEqual(path.win32.normalize('C:..\\abc'), 'C:..\\abc');
            assert.strictEqual(path.win32.normalize('C:..\\..\\abc\\..\\def'), 'C:..\\..\\def');
            assert.strictEqual(path.win32.normalize('C:\\.'), 'C:\\');
            assert.strictEqual(path.win32.normalize('file:stream'), 'file:stream');
            assert.strictEqual(path.win32.normalize('bar\\foo..\\..\\'), 'bar\\');
            assert.strictEqual(path.win32.normalize('bar\\foo..\\..'), 'bar');
            assert.strictEqual(path.win32.normalize('bar\\foo..\\..\\baz'), 'bar\\baz');
            assert.strictEqual(path.win32.normalize('bar\\foo..\\'), 'bar\\foo..\\');
            assert.strictEqual(path.win32.normalize('bar\\foo..'), 'bar\\foo..');
            assert.strictEqual(path.win32.normalize('..\\foo..\\..\\..\\bar'), '..\\..\\bar');
            assert.strictEqual(path.win32.normalize('..\\...\\..\\.\\...\\..\\..\\bar'), '..\\..\\bar');
            assert.strictEqual(path.win32.normalize('../../../foo/../../../bar'), '..\\..\\..\\..\\..\\bar');
            assert.strictEqual(path.win32.normalize('../../../foo/../../../bar/../../'), '..\\..\\..\\..\\..\\..\\');
            assert.strictEqual(path.win32.normalize('../foobar/barfoo/foo/../../../bar/../../'), '..\\..\\');
            assert.strictEqual(path.win32.normalize('../.../../foobar/../../../bar/../../baz'), '..\\..\\..\\..\\baz');
            assert.strictEqual(path.win32.normalize('foo/bar\\baz'), 'foo\\bar\\baz');
            assert.strictEqual(path.posix.normalize('./fixtures///b/../b/c.js'), 'fixtures/b/c.js');
            assert.strictEqual(path.posix.normalize('/foo/../../../bar'), '/bar');
            assert.strictEqual(path.posix.normalize('a//b//../b'), 'a/b');
            assert.strictEqual(path.posix.normalize('a//b//./c'), 'a/b/c');
            assert.strictEqual(path.posix.normalize('a//b//.'), 'a/b');
            assert.strictEqual(path.posix.normalize('/a/b/c/../../../x/y/z'), '/x/y/z');
            assert.strictEqual(path.posix.normalize('///..//./foo/.//bar'), '/foo/bar');
            assert.strictEqual(path.posix.normalize('bar/foo../../'), 'bar/');
            assert.strictEqual(path.posix.normalize('bar/foo../..'), 'bar');
            assert.strictEqual(path.posix.normalize('bar/foo../../baz'), 'bar/baz');
            assert.strictEqual(path.posix.normalize('bar/foo../'), 'bar/foo../');
            assert.strictEqual(path.posix.normalize('bar/foo..'), 'bar/foo..');
            assert.strictEqual(path.posix.normalize('../foo../../../bar'), '../../bar');
            assert.strictEqual(path.posix.normalize('../.../.././.../../../bar'), '../../bar');
            assert.strictEqual(path.posix.normalize('../../../foo/../../../bar'), '../../../../../bar');
            assert.strictEqual(path.posix.normalize('../../../foo/../../../bar/../../'), '../../../../../../');
            assert.strictEqual(path.posix.normalize('../foobar/barfoo/foo/../../../bar/../../'), '../../');
            assert.strictEqual(path.posix.normalize('../.../../foobar/../../../bar/../../baz'), '../../../../baz');
            assert.strictEqual(path.posix.normalize('foo/bar\\baz'), 'foo/bar\\baz');
        });
        test('isAbsolute', () => {
            assert.strictEqual(path.win32.isAbsolute('/'), true);
            assert.strictEqual(path.win32.isAbsolute('//'), true);
            assert.strictEqual(path.win32.isAbsolute('//server'), true);
            assert.strictEqual(path.win32.isAbsolute('//server/file'), true);
            assert.strictEqual(path.win32.isAbsolute('\\\\server\\file'), true);
            assert.strictEqual(path.win32.isAbsolute('\\\\server'), true);
            assert.strictEqual(path.win32.isAbsolute('\\\\'), true);
            assert.strictEqual(path.win32.isAbsolute('c'), false);
            assert.strictEqual(path.win32.isAbsolute('c:'), false);
            assert.strictEqual(path.win32.isAbsolute('c:\\'), true);
            assert.strictEqual(path.win32.isAbsolute('c:/'), true);
            assert.strictEqual(path.win32.isAbsolute('c://'), true);
            assert.strictEqual(path.win32.isAbsolute('C:/Users/'), true);
            assert.strictEqual(path.win32.isAbsolute('C:\\Users\\'), true);
            assert.strictEqual(path.win32.isAbsolute('C:cwd/another'), false);
            assert.strictEqual(path.win32.isAbsolute('C:cwd\\another'), false);
            assert.strictEqual(path.win32.isAbsolute('directory/directory'), false);
            assert.strictEqual(path.win32.isAbsolute('directory\\directory'), false);
            assert.strictEqual(path.posix.isAbsolute('/home/foo'), true);
            assert.strictEqual(path.posix.isAbsolute('/home/foo/..'), true);
            assert.strictEqual(path.posix.isAbsolute('bar/'), false);
            assert.strictEqual(path.posix.isAbsolute('./baz'), false);
            // Tests from VSCode:
            // Absolute Paths
            [
                'C:/',
                'C:\\',
                'C:/foo',
                'C:\\foo',
                'z:/foo/bar.txt',
                'z:\\foo\\bar.txt',
                '\\\\localhost\\c$\\foo',
                '/',
                '/foo'
            ].forEach(absolutePath => {
                assert.ok(path.win32.isAbsolute(absolutePath), absolutePath);
            });
            [
                '/',
                '/foo',
                '/foo/bar.txt'
            ].forEach(absolutePath => {
                assert.ok(path.posix.isAbsolute(absolutePath), absolutePath);
            });
            // Relative Paths
            [
                '',
                'foo',
                'foo/bar',
                './foo',
                'http://foo.com/bar'
            ].forEach(nonAbsolutePath => {
                assert.ok(!path.win32.isAbsolute(nonAbsolutePath), nonAbsolutePath);
            });
            [
                '',
                'foo',
                'foo/bar',
                './foo',
                'http://foo.com/bar',
                'z:/foo/bar.txt',
            ].forEach(nonAbsolutePath => {
                assert.ok(!path.posix.isAbsolute(nonAbsolutePath), nonAbsolutePath);
            });
        });
        test('path', () => {
            // path.sep tests
            // windows
            assert.strictEqual(path.win32.sep, '\\');
            // posix
            assert.strictEqual(path.posix.sep, '/');
            // path.delimiter tests
            // windows
            assert.strictEqual(path.win32.delimiter, ';');
            // posix
            assert.strictEqual(path.posix.delimiter, ':');
            // if (isWindows) {
            // 	assert.strictEqual(path, path.win32);
            // } else {
            // 	assert.strictEqual(path, path.posix);
            // }
        });
        // test('perf', () => {
        // 	const folderNames = [
        // 		'abc',
        // 		'Users',
        // 		'reallylongfoldername',
        // 		's',
        // 		'reallyreallyreallylongfoldername',
        // 		'home'
        // 	];
        // 	const basePaths = [
        // 		'C:',
        // 		'',
        // 	];
        // 	const separators = [
        // 		'\\',
        // 		'/'
        // 	];
        // 	function randomInt(ciel: number): number {
        // 		return Math.floor(Math.random() * ciel);
        // 	}
        // 	let pathsToNormalize = [];
        // 	let pathsToJoin = [];
        // 	let i;
        // 	for (i = 0; i < 1000000; i++) {
        // 		const basePath = basePaths[randomInt(basePaths.length)];
        // 		let lengthOfPath = randomInt(10) + 2;
        // 		let pathToNormalize = basePath + separators[randomInt(separators.length)];
        // 		while (lengthOfPath-- > 0) {
        // 			pathToNormalize = pathToNormalize + folderNames[randomInt(folderNames.length)] + separators[randomInt(separators.length)];
        // 		}
        // 		pathsToNormalize.push(pathToNormalize);
        // 		let pathToJoin = '';
        // 		lengthOfPath = randomInt(10) + 2;
        // 		while (lengthOfPath-- > 0) {
        // 			pathToJoin = pathToJoin + folderNames[randomInt(folderNames.length)] + separators[randomInt(separators.length)];
        // 		}
        // 		pathsToJoin.push(pathToJoin + '.ts');
        // 	}
        // 	let newTime = 0;
        // 	let j;
        // 	for(j = 0; j < pathsToJoin.length; j++) {
        // 		const path1 = pathsToNormalize[j];
        // 		const path2 = pathsToNormalize[j];
        // 		const newStart = performance.now();
        // 		path.join(path1, path2);
        // 		newTime += performance.now() - newStart;
        // 	}
        // 	assert.ok(false, `Time: ${newTime}ms.`);
        // });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS90ZXN0L2NvbW1vbi9wYXRoLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUErQmhHLEtBQUssQ0FBQyw2QkFBNkIsRUFBRSxHQUFHLEVBQUU7UUFDekMsTUFBTSxVQUFVLEdBQUcsY0FBYyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFO1lBQ2pCLE1BQU0sUUFBUSxHQUFHLEVBQWMsQ0FBQztZQUNoQyxNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUM7WUFFMUIsTUFBTSxTQUFTLEdBQVE7Z0JBQ3RCLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztvQkFDbkMsdUNBQXVDO29CQUN2QyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsRUFBRSxVQUFVLENBQUM7d0JBQzVDLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQzt3QkFDVCxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLEVBQUUsV0FBVyxDQUFDO3dCQUM3QyxDQUFDLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxFQUFFLE1BQU0sQ0FBQzt3QkFDbEMsQ0FBQyxDQUFDLEtBQUssRUFBRSxjQUFjLENBQUMsRUFBRSxXQUFXLENBQUM7d0JBQ3RDLENBQUMsQ0FBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLEVBQUUsV0FBVyxDQUFDO3dCQUN2QyxDQUFDLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxFQUFFLFFBQVEsQ0FBQzt3QkFDckMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsRUFBRSxXQUFXLENBQUM7d0JBQ2pDLENBQUMsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLEVBQUUsV0FBVyxDQUFDO3dCQUNsQyxDQUFDLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUM7d0JBQ3JDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUM7d0JBQ2QsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUM7d0JBQ25CLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQzt3QkFDdEIsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDO3dCQUN2QixDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUM7d0JBQ3hCLENBQUMsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQzt3QkFDNUIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQzt3QkFDWixDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQzt3QkFDaEIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUM7d0JBQ3BCLENBQUMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEVBQUUsU0FBUyxDQUFDO3dCQUM1QixDQUFDLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxFQUFFLE1BQU0sQ0FBQzt3QkFDdEIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDO3dCQUMxQixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUM7d0JBQ3hCLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDO3dCQUNwQixDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUs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QyxRQUFRLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDOUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM1RCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzlELE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDekQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN6RCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDckQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2xELE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNqRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDL0MsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQzlDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFB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