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
                [[path.$6d.join, path.$5d.join],
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
                path.$5d.join,
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
                        if (join === path.$5d.join) {
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
            assert.strictEqual(path.$6d.dirname('/a/b/'), '/a');
            assert.strictEqual(path.$6d.dirname('/a/b'), '/a');
            assert.strictEqual(path.$6d.dirname('/a'), '/');
            assert.strictEqual(path.$6d.dirname(''), '.');
            assert.strictEqual(path.$6d.dirname('/'), '/');
            assert.strictEqual(path.$6d.dirname('////'), '/');
            assert.strictEqual(path.$6d.dirname('//a'), '//');
            assert.strictEqual(path.$6d.dirname('foo'), '.');
            assert.strictEqual(path.$5d.dirname('c:\\'), 'c:\\');
            assert.strictEqual(path.$5d.dirname('c:\\foo'), 'c:\\');
            assert.strictEqual(path.$5d.dirname('c:\\foo\\'), 'c:\\');
            assert.strictEqual(path.$5d.dirname('c:\\foo\\bar'), 'c:\\foo');
            assert.strictEqual(path.$5d.dirname('c:\\foo\\bar\\'), 'c:\\foo');
            assert.strictEqual(path.$5d.dirname('c:\\foo\\bar\\baz'), 'c:\\foo\\bar');
            assert.strictEqual(path.$5d.dirname('\\'), '\\');
            assert.strictEqual(path.$5d.dirname('\\foo'), '\\');
            assert.strictEqual(path.$5d.dirname('\\foo\\'), '\\');
            assert.strictEqual(path.$5d.dirname('\\foo\\bar'), '\\foo');
            assert.strictEqual(path.$5d.dirname('\\foo\\bar\\'), '\\foo');
            assert.strictEqual(path.$5d.dirname('\\foo\\bar\\baz'), '\\foo\\bar');
            assert.strictEqual(path.$5d.dirname('c:'), 'c:');
            assert.strictEqual(path.$5d.dirname('c:foo'), 'c:');
            assert.strictEqual(path.$5d.dirname('c:foo\\'), 'c:');
            assert.strictEqual(path.$5d.dirname('c:foo\\bar'), 'c:foo');
            assert.strictEqual(path.$5d.dirname('c:foo\\bar\\'), 'c:foo');
            assert.strictEqual(path.$5d.dirname('c:foo\\bar\\baz'), 'c:foo\\bar');
            assert.strictEqual(path.$5d.dirname('file:stream'), '.');
            assert.strictEqual(path.$5d.dirname('dir\\file:stream'), 'dir');
            assert.strictEqual(path.$5d.dirname('\\\\unc\\share'), '\\\\unc\\share');
            assert.strictEqual(path.$5d.dirname('\\\\unc\\share\\foo'), '\\\\unc\\share\\');
            assert.strictEqual(path.$5d.dirname('\\\\unc\\share\\foo\\'), '\\\\unc\\share\\');
            assert.strictEqual(path.$5d.dirname('\\\\unc\\share\\foo\\bar'), '\\\\unc\\share\\foo');
            assert.strictEqual(path.$5d.dirname('\\\\unc\\share\\foo\\bar\\'), '\\\\unc\\share\\foo');
            assert.strictEqual(path.$5d.dirname('\\\\unc\\share\\foo\\bar\\baz'), '\\\\unc\\share\\foo\\bar');
            assert.strictEqual(path.$5d.dirname('/a/b/'), '/a');
            assert.strictEqual(path.$5d.dirname('/a/b'), '/a');
            assert.strictEqual(path.$5d.dirname('/a'), '/');
            assert.strictEqual(path.$5d.dirname(''), '.');
            assert.strictEqual(path.$5d.dirname('/'), '/');
            assert.strictEqual(path.$5d.dirname('////'), '/');
            assert.strictEqual(path.$5d.dirname('foo'), '.');
            // Tests from VSCode
            function assertDirname(p, expected, win = false) {
                const actual = win ? path.$5d.dirname(p) : path.$6d.dirname(p);
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
                [path.$6d.extname, path.$5d.extname].forEach((extname) => {
                    let input = test[0];
                    let os;
                    if (extname === path.$5d.extname) {
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
                    const actual = path.$5d.extname(input);
                    const message = `path.win32.extname(${JSON.stringify(input)})\n  expect=${JSON.stringify(expected)}\n  actual=${JSON.stringify(actual)}`;
                    if (actual !== expected) {
                        failures.push(`\n${message}`);
                    }
                }
            });
            assert.strictEqual(failures.length, 0, failures.join(''));
            // On Windows, backslash is a path separator.
            assert.strictEqual(path.$5d.extname('.\\'), '');
            assert.strictEqual(path.$5d.extname('..\\'), '');
            assert.strictEqual(path.$5d.extname('file.ext\\'), '.ext');
            assert.strictEqual(path.$5d.extname('file.ext\\\\'), '.ext');
            assert.strictEqual(path.$5d.extname('file\\'), '');
            assert.strictEqual(path.$5d.extname('file\\\\'), '');
            assert.strictEqual(path.$5d.extname('file.\\'), '.');
            assert.strictEqual(path.$5d.extname('file.\\\\'), '.');
            // On *nix, backslash is a valid name component like any other character.
            assert.strictEqual(path.$6d.extname('.\\'), '');
            assert.strictEqual(path.$6d.extname('..\\'), '.\\');
            assert.strictEqual(path.$6d.extname('file.ext\\'), '.ext\\');
            assert.strictEqual(path.$6d.extname('file.ext\\\\'), '.ext\\\\');
            assert.strictEqual(path.$6d.extname('file\\'), '');
            assert.strictEqual(path.$6d.extname('file\\\\'), '');
            assert.strictEqual(path.$6d.extname('file.\\'), '.\\');
            assert.strictEqual(path.$6d.extname('file.\\\\'), '.\\\\');
            // Tests from VSCode
            assert.strictEqual(path.$be('far.boo'), '.boo');
            assert.strictEqual(path.$be('far.b'), '.b');
            assert.strictEqual(path.$be('far.'), '.');
            assert.strictEqual(path.$be('far.boo/boo.far'), '.far');
            assert.strictEqual(path.$be('far.boo/boo'), '');
        });
        test('resolve', () => {
            const failures = [];
            const slashRE = /\//g;
            const backslashRE = /\\/g;
            const resolveTests = [
                [path.$5d.resolve,
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
                [path.$6d.resolve,
                    // arguments                    result
                    [[['/var/lib', '../', 'file/'], '/var/file'],
                        [['/var/lib', '/../', 'file/'], '/file'],
                        [['/some/dir', '.', '/absolute/'], '/absolute'],
                        [['/foo/tmp.3/', '../tmp.3/cycles/root.js'], '/foo/tmp.3/cycles/root.js']
                    ]
                ],
                [(platform_1.$o ? path.$6d.resolve : path.$0d),
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
                    const os = resolve === path.$5d.resolve ? 'win32' : 'posix';
                    if (resolve === path.$5d.resolve && !platform_1.$i) {
                        actualAlt = actual.replace(backslashRE, '/');
                    }
                    else if (resolve !== path.$5d.resolve && platform_1.$i) {
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
            assert.strictEqual(path.$ae(__filename), 'path.test.js');
            assert.strictEqual(path.$ae(__filename, '.js'), 'path.test');
            assert.strictEqual(path.$ae('.js', '.js'), '');
            assert.strictEqual(path.$ae(''), '');
            assert.strictEqual(path.$ae('/dir/basename.ext'), 'basename.ext');
            assert.strictEqual(path.$ae('/basename.ext'), 'basename.ext');
            assert.strictEqual(path.$ae('basename.ext'), 'basename.ext');
            assert.strictEqual(path.$ae('basename.ext/'), 'basename.ext');
            assert.strictEqual(path.$ae('basename.ext//'), 'basename.ext');
            assert.strictEqual(path.$ae('aaa/bbb', '/bbb'), 'bbb');
            assert.strictEqual(path.$ae('aaa/bbb', 'a/bbb'), 'bbb');
            assert.strictEqual(path.$ae('aaa/bbb', 'bbb'), 'bbb');
            assert.strictEqual(path.$ae('aaa/bbb//', 'bbb'), 'bbb');
            assert.strictEqual(path.$ae('aaa/bbb', 'bb'), 'b');
            assert.strictEqual(path.$ae('aaa/bbb', 'b'), 'bb');
            assert.strictEqual(path.$ae('/aaa/bbb', '/bbb'), 'bbb');
            assert.strictEqual(path.$ae('/aaa/bbb', 'a/bbb'), 'bbb');
            assert.strictEqual(path.$ae('/aaa/bbb', 'bbb'), 'bbb');
            assert.strictEqual(path.$ae('/aaa/bbb//', 'bbb'), 'bbb');
            assert.strictEqual(path.$ae('/aaa/bbb', 'bb'), 'b');
            assert.strictEqual(path.$ae('/aaa/bbb', 'b'), 'bb');
            assert.strictEqual(path.$ae('/aaa/bbb'), 'bbb');
            assert.strictEqual(path.$ae('/aaa/'), 'aaa');
            assert.strictEqual(path.$ae('/aaa/b'), 'b');
            assert.strictEqual(path.$ae('/a/b'), 'b');
            assert.strictEqual(path.$ae('//a'), 'a');
            assert.strictEqual(path.$ae('a', 'a'), '');
            // On Windows a backslash acts as a path separator.
            assert.strictEqual(path.$5d.basename('\\dir\\basename.ext'), 'basename.ext');
            assert.strictEqual(path.$5d.basename('\\basename.ext'), 'basename.ext');
            assert.strictEqual(path.$5d.basename('basename.ext'), 'basename.ext');
            assert.strictEqual(path.$5d.basename('basename.ext\\'), 'basename.ext');
            assert.strictEqual(path.$5d.basename('basename.ext\\\\'), 'basename.ext');
            assert.strictEqual(path.$5d.basename('foo'), 'foo');
            assert.strictEqual(path.$5d.basename('aaa\\bbb', '\\bbb'), 'bbb');
            assert.strictEqual(path.$5d.basename('aaa\\bbb', 'a\\bbb'), 'bbb');
            assert.strictEqual(path.$5d.basename('aaa\\bbb', 'bbb'), 'bbb');
            assert.strictEqual(path.$5d.basename('aaa\\bbb\\\\\\\\', 'bbb'), 'bbb');
            assert.strictEqual(path.$5d.basename('aaa\\bbb', 'bb'), 'b');
            assert.strictEqual(path.$5d.basename('aaa\\bbb', 'b'), 'bb');
            assert.strictEqual(path.$5d.basename('C:'), '');
            assert.strictEqual(path.$5d.basename('C:.'), '.');
            assert.strictEqual(path.$5d.basename('C:\\'), '');
            assert.strictEqual(path.$5d.basename('C:\\dir\\base.ext'), 'base.ext');
            assert.strictEqual(path.$5d.basename('C:\\basename.ext'), 'basename.ext');
            assert.strictEqual(path.$5d.basename('C:basename.ext'), 'basename.ext');
            assert.strictEqual(path.$5d.basename('C:basename.ext\\'), 'basename.ext');
            assert.strictEqual(path.$5d.basename('C:basename.ext\\\\'), 'basename.ext');
            assert.strictEqual(path.$5d.basename('C:foo'), 'foo');
            assert.strictEqual(path.$5d.basename('file:stream'), 'file:stream');
            assert.strictEqual(path.$5d.basename('a', 'a'), '');
            // On unix a backslash is just treated as any other character.
            assert.strictEqual(path.$6d.basename('\\dir\\basename.ext'), '\\dir\\basename.ext');
            assert.strictEqual(path.$6d.basename('\\basename.ext'), '\\basename.ext');
            assert.strictEqual(path.$6d.basename('basename.ext'), 'basename.ext');
            assert.strictEqual(path.$6d.basename('basename.ext\\'), 'basename.ext\\');
            assert.strictEqual(path.$6d.basename('basename.ext\\\\'), 'basename.ext\\\\');
            assert.strictEqual(path.$6d.basename('foo'), 'foo');
            // POSIX filenames may include control characters
            // c.f. http://www.dwheeler.com/essays/fixing-unix-linux-filenames.html
            const controlCharFilename = `Icon${String.fromCharCode(13)}`;
            assert.strictEqual(path.$6d.basename(`/a/b/${controlCharFilename}`), controlCharFilename);
            // Tests from VSCode
            assert.strictEqual(path.$ae('foo/bar'), 'bar');
            assert.strictEqual(path.$6d.basename('foo\\bar'), 'foo\\bar');
            assert.strictEqual(path.$5d.basename('foo\\bar'), 'bar');
            assert.strictEqual(path.$ae('/foo/bar'), 'bar');
            assert.strictEqual(path.$6d.basename('\\foo\\bar'), '\\foo\\bar');
            assert.strictEqual(path.$5d.basename('\\foo\\bar'), 'bar');
            assert.strictEqual(path.$ae('./bar'), 'bar');
            assert.strictEqual(path.$6d.basename('.\\bar'), '.\\bar');
            assert.strictEqual(path.$5d.basename('.\\bar'), 'bar');
            assert.strictEqual(path.$ae('/bar'), 'bar');
            assert.strictEqual(path.$6d.basename('\\bar'), '\\bar');
            assert.strictEqual(path.$5d.basename('\\bar'), 'bar');
            assert.strictEqual(path.$ae('bar/'), 'bar');
            assert.strictEqual(path.$6d.basename('bar\\'), 'bar\\');
            assert.strictEqual(path.$5d.basename('bar\\'), 'bar');
            assert.strictEqual(path.$ae('bar'), 'bar');
            assert.strictEqual(path.$ae('////////'), '');
            assert.strictEqual(path.$6d.basename('\\\\\\\\'), '\\\\\\\\');
            assert.strictEqual(path.$5d.basename('\\\\\\\\'), '');
        });
        test('relative', () => {
            const failures = [];
            const relativeTests = [
                [path.$5d.relative,
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
                [path.$6d.relative,
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
                    const os = relative === path.$5d.relative ? 'win32' : 'posix';
                    const message = `path.${os}.relative(${test.slice(0, 2).map(JSON.stringify).join(',')})\n  expect=${JSON.stringify(expected)}\n  actual=${JSON.stringify(actual)}`;
                    if (actual !== expected) {
                        failures.push(`\n${message}`);
                    }
                });
            });
            assert.strictEqual(failures.length, 0, failures.join(''));
        });
        test('normalize', () => {
            assert.strictEqual(path.$5d.normalize('./fixtures///b/../b/c.js'), 'fixtures\\b\\c.js');
            assert.strictEqual(path.$5d.normalize('/foo/../../../bar'), '\\bar');
            assert.strictEqual(path.$5d.normalize('a//b//../b'), 'a\\b');
            assert.strictEqual(path.$5d.normalize('a//b//./c'), 'a\\b\\c');
            assert.strictEqual(path.$5d.normalize('a//b//.'), 'a\\b');
            assert.strictEqual(path.$5d.normalize('//server/share/dir/file.ext'), '\\\\server\\share\\dir\\file.ext');
            assert.strictEqual(path.$5d.normalize('/a/b/c/../../../x/y/z'), '\\x\\y\\z');
            assert.strictEqual(path.$5d.normalize('C:'), 'C:.');
            assert.strictEqual(path.$5d.normalize('C:..\\abc'), 'C:..\\abc');
            assert.strictEqual(path.$5d.normalize('C:..\\..\\abc\\..\\def'), 'C:..\\..\\def');
            assert.strictEqual(path.$5d.normalize('C:\\.'), 'C:\\');
            assert.strictEqual(path.$5d.normalize('file:stream'), 'file:stream');
            assert.strictEqual(path.$5d.normalize('bar\\foo..\\..\\'), 'bar\\');
            assert.strictEqual(path.$5d.normalize('bar\\foo..\\..'), 'bar');
            assert.strictEqual(path.$5d.normalize('bar\\foo..\\..\\baz'), 'bar\\baz');
            assert.strictEqual(path.$5d.normalize('bar\\foo..\\'), 'bar\\foo..\\');
            assert.strictEqual(path.$5d.normalize('bar\\foo..'), 'bar\\foo..');
            assert.strictEqual(path.$5d.normalize('..\\foo..\\..\\..\\bar'), '..\\..\\bar');
            assert.strictEqual(path.$5d.normalize('..\\...\\..\\.\\...\\..\\..\\bar'), '..\\..\\bar');
            assert.strictEqual(path.$5d.normalize('../../../foo/../../../bar'), '..\\..\\..\\..\\..\\bar');
            assert.strictEqual(path.$5d.normalize('../../../foo/../../../bar/../../'), '..\\..\\..\\..\\..\\..\\');
            assert.strictEqual(path.$5d.normalize('../foobar/barfoo/foo/../../../bar/../../'), '..\\..\\');
            assert.strictEqual(path.$5d.normalize('../.../../foobar/../../../bar/../../baz'), '..\\..\\..\\..\\baz');
            assert.strictEqual(path.$5d.normalize('foo/bar\\baz'), 'foo\\bar\\baz');
            assert.strictEqual(path.$6d.normalize('./fixtures///b/../b/c.js'), 'fixtures/b/c.js');
            assert.strictEqual(path.$6d.normalize('/foo/../../../bar'), '/bar');
            assert.strictEqual(path.$6d.normalize('a//b//../b'), 'a/b');
            assert.strictEqual(path.$6d.normalize('a//b//./c'), 'a/b/c');
            assert.strictEqual(path.$6d.normalize('a//b//.'), 'a/b');
            assert.strictEqual(path.$6d.normalize('/a/b/c/../../../x/y/z'), '/x/y/z');
            assert.strictEqual(path.$6d.normalize('///..//./foo/.//bar'), '/foo/bar');
            assert.strictEqual(path.$6d.normalize('bar/foo../../'), 'bar/');
            assert.strictEqual(path.$6d.normalize('bar/foo../..'), 'bar');
            assert.strictEqual(path.$6d.normalize('bar/foo../../baz'), 'bar/baz');
            assert.strictEqual(path.$6d.normalize('bar/foo../'), 'bar/foo../');
            assert.strictEqual(path.$6d.normalize('bar/foo..'), 'bar/foo..');
            assert.strictEqual(path.$6d.normalize('../foo../../../bar'), '../../bar');
            assert.strictEqual(path.$6d.normalize('../.../.././.../../../bar'), '../../bar');
            assert.strictEqual(path.$6d.normalize('../../../foo/../../../bar'), '../../../../../bar');
            assert.strictEqual(path.$6d.normalize('../../../foo/../../../bar/../../'), '../../../../../../');
            assert.strictEqual(path.$6d.normalize('../foobar/barfoo/foo/../../../bar/../../'), '../../');
            assert.strictEqual(path.$6d.normalize('../.../../foobar/../../../bar/../../baz'), '../../../../baz');
            assert.strictEqual(path.$6d.normalize('foo/bar\\baz'), 'foo/bar\\baz');
        });
        test('isAbsolute', () => {
            assert.strictEqual(path.$5d.isAbsolute('/'), true);
            assert.strictEqual(path.$5d.isAbsolute('//'), true);
            assert.strictEqual(path.$5d.isAbsolute('//server'), true);
            assert.strictEqual(path.$5d.isAbsolute('//server/file'), true);
            assert.strictEqual(path.$5d.isAbsolute('\\\\server\\file'), true);
            assert.strictEqual(path.$5d.isAbsolute('\\\\server'), true);
            assert.strictEqual(path.$5d.isAbsolute('\\\\'), true);
            assert.strictEqual(path.$5d.isAbsolute('c'), false);
            assert.strictEqual(path.$5d.isAbsolute('c:'), false);
            assert.strictEqual(path.$5d.isAbsolute('c:\\'), true);
            assert.strictEqual(path.$5d.isAbsolute('c:/'), true);
            assert.strictEqual(path.$5d.isAbsolute('c://'), true);
            assert.strictEqual(path.$5d.isAbsolute('C:/Users/'), true);
            assert.strictEqual(path.$5d.isAbsolute('C:\\Users\\'), true);
            assert.strictEqual(path.$5d.isAbsolute('C:cwd/another'), false);
            assert.strictEqual(path.$5d.isAbsolute('C:cwd\\another'), false);
            assert.strictEqual(path.$5d.isAbsolute('directory/directory'), false);
            assert.strictEqual(path.$5d.isAbsolute('directory\\directory'), false);
            assert.strictEqual(path.$6d.isAbsolute('/home/foo'), true);
            assert.strictEqual(path.$6d.isAbsolute('/home/foo/..'), true);
            assert.strictEqual(path.$6d.isAbsolute('bar/'), false);
            assert.strictEqual(path.$6d.isAbsolute('./baz'), false);
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
                assert.ok(path.$5d.isAbsolute(absolutePath), absolutePath);
            });
            [
                '/',
                '/foo',
                '/foo/bar.txt'
            ].forEach(absolutePath => {
                assert.ok(path.$6d.isAbsolute(absolutePath), absolutePath);
            });
            // Relative Paths
            [
                '',
                'foo',
                'foo/bar',
                './foo',
                'http://foo.com/bar'
            ].forEach(nonAbsolutePath => {
                assert.ok(!path.$5d.isAbsolute(nonAbsolutePath), nonAbsolutePath);
            });
            [
                '',
                'foo',
                'foo/bar',
                './foo',
                'http://foo.com/bar',
                'z:/foo/bar.txt',
            ].forEach(nonAbsolutePath => {
                assert.ok(!path.$6d.isAbsolute(nonAbsolutePath), nonAbsolutePath);
            });
        });
        test('path', () => {
            // path.sep tests
            // windows
            assert.strictEqual(path.$5d.sep, '\\');
            // posix
            assert.strictEqual(path.$6d.sep, '/');
            // path.delimiter tests
            // windows
            assert.strictEqual(path.$5d.delimiter, ';');
            // posix
            assert.strictEqual(path.$6d.delimiter, ':');
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
//# sourceMappingURL=path.test.js.map