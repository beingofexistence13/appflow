/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/labels", "vs/base/common/platform", "vs/base/common/uri", "vs/base/test/common/utils"], function (require, exports, assert, labels, platform_1, uri_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Labels', () => {
        (!platform_1.$i ? test.skip : test)('shorten - windows', () => {
            // nothing to shorten
            assert.deepStrictEqual(labels.$iA(['a']), ['a']);
            assert.deepStrictEqual(labels.$iA(['a', 'b']), ['a', 'b']);
            assert.deepStrictEqual(labels.$iA(['a', 'b', 'c']), ['a', 'b', 'c']);
            assert.deepStrictEqual(labels.$iA(['\\\\x\\a', '\\\\x\\a']), ['\\\\x\\a', '\\\\x\\a']);
            assert.deepStrictEqual(labels.$iA(['C:\\a', 'C:\\b']), ['C:\\a', 'C:\\b']);
            // completely different paths
            assert.deepStrictEqual(labels.$iA(['a\\b', 'c\\d', 'e\\f']), ['…\\b', '…\\d', '…\\f']);
            // same beginning
            assert.deepStrictEqual(labels.$iA(['a', 'a\\b']), ['a', '…\\b']);
            assert.deepStrictEqual(labels.$iA(['a\\b', 'a\\b\\c']), ['…\\b', '…\\c']);
            assert.deepStrictEqual(labels.$iA(['a', 'a\\b', 'a\\b\\c']), ['a', '…\\b', '…\\c']);
            assert.deepStrictEqual(labels.$iA(['x:\\a\\b', 'x:\\a\\c']), ['x:\\…\\b', 'x:\\…\\c']);
            assert.deepStrictEqual(labels.$iA(['\\\\a\\b', '\\\\a\\c']), ['\\\\a\\b', '\\\\a\\c']);
            // same ending
            assert.deepStrictEqual(labels.$iA(['a', 'b\\a']), ['a', 'b\\…']);
            assert.deepStrictEqual(labels.$iA(['a\\b\\c', 'd\\b\\c']), ['a\\…', 'd\\…']);
            assert.deepStrictEqual(labels.$iA(['a\\b\\c\\d', 'f\\b\\c\\d']), ['a\\…', 'f\\…']);
            assert.deepStrictEqual(labels.$iA(['d\\e\\a\\b\\c', 'd\\b\\c']), ['…\\a\\…', 'd\\b\\…']);
            assert.deepStrictEqual(labels.$iA(['a\\b\\c\\d', 'a\\f\\b\\c\\d']), ['a\\b\\…', '…\\f\\…']);
            assert.deepStrictEqual(labels.$iA(['a\\b\\a', 'b\\b\\a']), ['a\\b\\…', 'b\\b\\…']);
            assert.deepStrictEqual(labels.$iA(['d\\f\\a\\b\\c', 'h\\d\\b\\c']), ['…\\a\\…', 'h\\…']);
            assert.deepStrictEqual(labels.$iA(['a\\b\\c', 'x:\\0\\a\\b\\c']), ['a\\b\\c', 'x:\\0\\…']);
            assert.deepStrictEqual(labels.$iA(['x:\\a\\b\\c', 'x:\\0\\a\\b\\c']), ['x:\\a\\…', 'x:\\0\\…']);
            assert.deepStrictEqual(labels.$iA(['x:\\a\\b', 'y:\\a\\b']), ['x:\\…', 'y:\\…']);
            assert.deepStrictEqual(labels.$iA(['x:\\a', 'x:\\c']), ['x:\\a', 'x:\\c']);
            assert.deepStrictEqual(labels.$iA(['x:\\a\\b', 'y:\\x\\a\\b']), ['x:\\…', 'y:\\…']);
            assert.deepStrictEqual(labels.$iA(['\\\\x\\b', '\\\\y\\b']), ['\\\\x\\…', '\\\\y\\…']);
            assert.deepStrictEqual(labels.$iA(['\\\\x\\a', '\\\\x\\b']), ['\\\\x\\a', '\\\\x\\b']);
            // same name ending
            assert.deepStrictEqual(labels.$iA(['a\\b', 'a\\c', 'a\\e-b']), ['…\\b', '…\\c', '…\\e-b']);
            // same in the middle
            assert.deepStrictEqual(labels.$iA(['a\\b\\c', 'd\\b\\e']), ['…\\c', '…\\e']);
            // case-sensetive
            assert.deepStrictEqual(labels.$iA(['a\\b\\c', 'd\\b\\C']), ['…\\c', '…\\C']);
            // empty or null
            assert.deepStrictEqual(labels.$iA(['', null]), ['.\\', null]);
            assert.deepStrictEqual(labels.$iA(['a', 'a\\b', 'a\\b\\c', 'd\\b\\c', 'd\\b']), ['a', 'a\\b', 'a\\b\\c', 'd\\b\\c', 'd\\b']);
            assert.deepStrictEqual(labels.$iA(['a', 'a\\b', 'b']), ['a', 'a\\b', 'b']);
            assert.deepStrictEqual(labels.$iA(['', 'a', 'b', 'b\\c', 'a\\c']), ['.\\', 'a', 'b', 'b\\c', 'a\\c']);
            assert.deepStrictEqual(labels.$iA(['src\\vs\\workbench\\parts\\execution\\electron-sandbox', 'src\\vs\\workbench\\parts\\execution\\electron-sandbox\\something', 'src\\vs\\workbench\\parts\\terminal\\electron-sandbox']), ['…\\execution\\electron-sandbox', '…\\something', '…\\terminal\\…']);
        });
        (platform_1.$i ? test.skip : test)('shorten - not windows', () => {
            // nothing to shorten
            assert.deepStrictEqual(labels.$iA(['a']), ['a']);
            assert.deepStrictEqual(labels.$iA(['a', 'b']), ['a', 'b']);
            assert.deepStrictEqual(labels.$iA(['/a', '/b']), ['/a', '/b']);
            assert.deepStrictEqual(labels.$iA(['~/a/b/c', '~/a/b/c']), ['~/a/b/c', '~/a/b/c']);
            assert.deepStrictEqual(labels.$iA(['a', 'b', 'c']), ['a', 'b', 'c']);
            // completely different paths
            assert.deepStrictEqual(labels.$iA(['a/b', 'c/d', 'e/f']), ['…/b', '…/d', '…/f']);
            // same beginning
            assert.deepStrictEqual(labels.$iA(['a', 'a/b']), ['a', '…/b']);
            assert.deepStrictEqual(labels.$iA(['a/b', 'a/b/c']), ['…/b', '…/c']);
            assert.deepStrictEqual(labels.$iA(['a', 'a/b', 'a/b/c']), ['a', '…/b', '…/c']);
            assert.deepStrictEqual(labels.$iA(['/a/b', '/a/c']), ['/a/b', '/a/c']);
            // same ending
            assert.deepStrictEqual(labels.$iA(['a', 'b/a']), ['a', 'b/…']);
            assert.deepStrictEqual(labels.$iA(['a/b/c', 'd/b/c']), ['a/…', 'd/…']);
            assert.deepStrictEqual(labels.$iA(['a/b/c/d', 'f/b/c/d']), ['a/…', 'f/…']);
            assert.deepStrictEqual(labels.$iA(['d/e/a/b/c', 'd/b/c']), ['…/a/…', 'd/b/…']);
            assert.deepStrictEqual(labels.$iA(['a/b/c/d', 'a/f/b/c/d']), ['a/b/…', '…/f/…']);
            assert.deepStrictEqual(labels.$iA(['a/b/a', 'b/b/a']), ['a/b/…', 'b/b/…']);
            assert.deepStrictEqual(labels.$iA(['d/f/a/b/c', 'h/d/b/c']), ['…/a/…', 'h/…']);
            assert.deepStrictEqual(labels.$iA(['/x/b', '/y/b']), ['/x/…', '/y/…']);
            // same name ending
            assert.deepStrictEqual(labels.$iA(['a/b', 'a/c', 'a/e-b']), ['…/b', '…/c', '…/e-b']);
            // same in the middle
            assert.deepStrictEqual(labels.$iA(['a/b/c', 'd/b/e']), ['…/c', '…/e']);
            // case-sensitive
            assert.deepStrictEqual(labels.$iA(['a/b/c', 'd/b/C']), ['…/c', '…/C']);
            // empty or null
            assert.deepStrictEqual(labels.$iA(['', null]), ['./', null]);
            assert.deepStrictEqual(labels.$iA(['a', 'a/b', 'a/b/c', 'd/b/c', 'd/b']), ['a', 'a/b', 'a/b/c', 'd/b/c', 'd/b']);
            assert.deepStrictEqual(labels.$iA(['a', 'a/b', 'b']), ['a', 'a/b', 'b']);
            assert.deepStrictEqual(labels.$iA(['', 'a', 'b', 'b/c', 'a/c']), ['./', 'a', 'b', 'b/c', 'a/c']);
        });
        test('template', () => {
            // simple
            assert.strictEqual(labels.$jA('Foo Bar'), 'Foo Bar');
            assert.strictEqual(labels.$jA('Foo${}Bar'), 'FooBar');
            assert.strictEqual(labels.$jA('$FooBar'), '');
            assert.strictEqual(labels.$jA('}FooBar'), '}FooBar');
            assert.strictEqual(labels.$jA('Foo ${one} Bar', { one: 'value' }), 'Foo value Bar');
            assert.strictEqual(labels.$jA('Foo ${one} Bar ${two}', { one: 'value', two: 'other value' }), 'Foo value Bar other value');
            // conditional separator
            assert.strictEqual(labels.$jA('Foo${separator}Bar'), 'FooBar');
            assert.strictEqual(labels.$jA('Foo${separator}Bar', { separator: { label: ' - ' } }), 'Foo - Bar');
            assert.strictEqual(labels.$jA('${separator}Foo${separator}Bar', { value: 'something', separator: { label: ' - ' } }), 'Foo - Bar');
            assert.strictEqual(labels.$jA('${value} Foo${separator}Bar', { value: 'something', separator: { label: ' - ' } }), 'something Foo - Bar');
            // real world example (macOS)
            let t = '${activeEditorShort}${separator}${rootName}';
            assert.strictEqual(labels.$jA(t, { activeEditorShort: '', rootName: '', separator: { label: ' - ' } }), '');
            assert.strictEqual(labels.$jA(t, { activeEditorShort: '', rootName: 'root', separator: { label: ' - ' } }), 'root');
            assert.strictEqual(labels.$jA(t, { activeEditorShort: 'markdown.txt', rootName: 'root', separator: { label: ' - ' } }), 'markdown.txt - root');
            // real world example (other)
            t = '${dirty}${activeEditorShort}${separator}${rootName}${separator}${appName}';
            assert.strictEqual(labels.$jA(t, { dirty: '', activeEditorShort: '', rootName: '', appName: '', separator: { label: ' - ' } }), '');
            assert.strictEqual(labels.$jA(t, { dirty: '', activeEditorShort: '', rootName: '', appName: 'Visual Studio Code', separator: { label: ' - ' } }), 'Visual Studio Code');
            assert.strictEqual(labels.$jA(t, { dirty: '', activeEditorShort: 'Untitled-1', rootName: '', appName: 'Visual Studio Code', separator: { label: ' - ' } }), 'Untitled-1 - Visual Studio Code');
            assert.strictEqual(labels.$jA(t, { dirty: '', activeEditorShort: '', rootName: 'monaco', appName: 'Visual Studio Code', separator: { label: ' - ' } }), 'monaco - Visual Studio Code');
            assert.strictEqual(labels.$jA(t, { dirty: '', activeEditorShort: 'somefile.txt', rootName: 'monaco', appName: 'Visual Studio Code', separator: { label: ' - ' } }), 'somefile.txt - monaco - Visual Studio Code');
            assert.strictEqual(labels.$jA(t, { dirty: '* ', activeEditorShort: 'somefile.txt', rootName: 'monaco', appName: 'Visual Studio Code', separator: { label: ' - ' } }), '* somefile.txt - monaco - Visual Studio Code');
            // real world example (other)
            t = '${dirty}${activeEditorShort}${separator}${rootNameShort}${separator}${appName}';
            assert.strictEqual(labels.$jA(t, { dirty: '', activeEditorShort: '', rootName: 'monaco (Workspace)', rootNameShort: 'monaco', appName: 'Visual Studio Code', separator: { label: ' - ' } }), 'monaco - Visual Studio Code');
        });
        test('mnemonicButtonLabel', () => {
            assert.strictEqual(labels.$lA('Hello World'), 'Hello World');
            assert.strictEqual(labels.$lA(''), '');
            if (platform_1.$i) {
                assert.strictEqual(labels.$lA('Hello & World'), 'Hello && World');
                assert.strictEqual(labels.$lA('Do &&not Save & Continue'), 'Do &not Save && Continue');
            }
            else if (platform_1.$j) {
                assert.strictEqual(labels.$lA('Hello & World'), 'Hello & World');
                assert.strictEqual(labels.$lA('Do &&not Save & Continue'), 'Do not Save & Continue');
            }
            else {
                assert.strictEqual(labels.$lA('Hello & World'), 'Hello & World');
                assert.strictEqual(labels.$lA('Do &&not Save & Continue'), 'Do _not Save & Continue');
            }
        });
        test('getPathLabel', () => {
            const winFileUri = uri_1.URI.file('c:/some/folder/file.txt');
            const nixFileUri = uri_1.URI.file('/some/folder/file.txt');
            const uncFileUri = uri_1.URI.file('c:/some/folder/file.txt').with({ authority: 'auth' });
            const remoteFileUri = uri_1.URI.file('/some/folder/file.txt').with({ scheme: 'vscode-test', authority: 'auth' });
            // Basics
            assert.strictEqual(labels.$eA(winFileUri, { os: 1 /* OperatingSystem.Windows */ }), 'C:\\some\\folder\\file.txt');
            assert.strictEqual(labels.$eA(winFileUri, { os: 2 /* OperatingSystem.Macintosh */ }), 'c:/some/folder/file.txt');
            assert.strictEqual(labels.$eA(winFileUri, { os: 3 /* OperatingSystem.Linux */ }), 'c:/some/folder/file.txt');
            assert.strictEqual(labels.$eA(nixFileUri, { os: 1 /* OperatingSystem.Windows */ }), '\\some\\folder\\file.txt');
            assert.strictEqual(labels.$eA(nixFileUri, { os: 2 /* OperatingSystem.Macintosh */ }), '/some/folder/file.txt');
            assert.strictEqual(labels.$eA(nixFileUri, { os: 3 /* OperatingSystem.Linux */ }), '/some/folder/file.txt');
            assert.strictEqual(labels.$eA(uncFileUri, { os: 1 /* OperatingSystem.Windows */ }), '\\\\auth\\c:\\some\\folder\\file.txt');
            assert.strictEqual(labels.$eA(uncFileUri, { os: 2 /* OperatingSystem.Macintosh */ }), '/auth/c:/some/folder/file.txt');
            assert.strictEqual(labels.$eA(uncFileUri, { os: 3 /* OperatingSystem.Linux */ }), '/auth/c:/some/folder/file.txt');
            assert.strictEqual(labels.$eA(remoteFileUri, { os: 1 /* OperatingSystem.Windows */ }), '\\some\\folder\\file.txt');
            assert.strictEqual(labels.$eA(remoteFileUri, { os: 2 /* OperatingSystem.Macintosh */ }), '/some/folder/file.txt');
            assert.strictEqual(labels.$eA(remoteFileUri, { os: 3 /* OperatingSystem.Linux */ }), '/some/folder/file.txt');
            // Tildify
            const nixUserHome = uri_1.URI.file('/some');
            const remoteUserHome = uri_1.URI.file('/some').with({ scheme: 'vscode-test', authority: 'auth' });
            assert.strictEqual(labels.$eA(nixFileUri, { os: 1 /* OperatingSystem.Windows */, tildify: { userHome: nixUserHome } }), '\\some\\folder\\file.txt');
            assert.strictEqual(labels.$eA(nixFileUri, { os: 2 /* OperatingSystem.Macintosh */, tildify: { userHome: nixUserHome } }), '~/folder/file.txt');
            assert.strictEqual(labels.$eA(nixFileUri, { os: 3 /* OperatingSystem.Linux */, tildify: { userHome: nixUserHome } }), '~/folder/file.txt');
            assert.strictEqual(labels.$eA(nixFileUri, { os: 1 /* OperatingSystem.Windows */, tildify: { userHome: remoteUserHome } }), '\\some\\folder\\file.txt');
            assert.strictEqual(labels.$eA(nixFileUri, { os: 2 /* OperatingSystem.Macintosh */, tildify: { userHome: remoteUserHome } }), '~/folder/file.txt');
            assert.strictEqual(labels.$eA(nixFileUri, { os: 3 /* OperatingSystem.Linux */, tildify: { userHome: remoteUserHome } }), '~/folder/file.txt');
            const nixUntitledUri = uri_1.URI.file('/some/folder/file.txt').with({ scheme: 'untitled' });
            assert.strictEqual(labels.$eA(nixUntitledUri, { os: 1 /* OperatingSystem.Windows */, tildify: { userHome: nixUserHome } }), '\\some\\folder\\file.txt');
            assert.strictEqual(labels.$eA(nixUntitledUri, { os: 2 /* OperatingSystem.Macintosh */, tildify: { userHome: nixUserHome } }), '~/folder/file.txt');
            assert.strictEqual(labels.$eA(nixUntitledUri, { os: 3 /* OperatingSystem.Linux */, tildify: { userHome: nixUserHome } }), '~/folder/file.txt');
            assert.strictEqual(labels.$eA(nixUntitledUri, { os: 1 /* OperatingSystem.Windows */, tildify: { userHome: remoteUserHome } }), '\\some\\folder\\file.txt');
            assert.strictEqual(labels.$eA(nixUntitledUri, { os: 2 /* OperatingSystem.Macintosh */, tildify: { userHome: remoteUserHome } }), '~/folder/file.txt');
            assert.strictEqual(labels.$eA(nixUntitledUri, { os: 3 /* OperatingSystem.Linux */, tildify: { userHome: remoteUserHome } }), '~/folder/file.txt');
            // Relative
            const winFolder = uri_1.URI.file('c:/some');
            const winRelativePathProvider = {
                getWorkspace() { return { folders: [{ uri: winFolder }] }; },
                getWorkspaceFolder(resource) { return { uri: winFolder }; }
            };
            assert.strictEqual(labels.$eA(winFileUri, { os: 1 /* OperatingSystem.Windows */, relative: winRelativePathProvider }), 'folder\\file.txt');
            assert.strictEqual(labels.$eA(winFileUri, { os: 2 /* OperatingSystem.Macintosh */, relative: winRelativePathProvider }), 'folder/file.txt');
            assert.strictEqual(labels.$eA(winFileUri, { os: 3 /* OperatingSystem.Linux */, relative: winRelativePathProvider }), 'folder/file.txt');
            const nixFolder = uri_1.URI.file('/some');
            const nixRelativePathProvider = {
                getWorkspace() { return { folders: [{ uri: nixFolder }] }; },
                getWorkspaceFolder(resource) { return { uri: nixFolder }; }
            };
            assert.strictEqual(labels.$eA(nixFileUri, { os: 1 /* OperatingSystem.Windows */, relative: nixRelativePathProvider }), 'folder\\file.txt');
            assert.strictEqual(labels.$eA(nixFileUri, { os: 2 /* OperatingSystem.Macintosh */, relative: nixRelativePathProvider }), 'folder/file.txt');
            assert.strictEqual(labels.$eA(nixFileUri, { os: 3 /* OperatingSystem.Linux */, relative: nixRelativePathProvider }), 'folder/file.txt');
            assert.strictEqual(labels.$eA(nixUntitledUri, { os: 1 /* OperatingSystem.Windows */, relative: nixRelativePathProvider }), 'folder\\file.txt');
            assert.strictEqual(labels.$eA(nixUntitledUri, { os: 2 /* OperatingSystem.Macintosh */, relative: nixRelativePathProvider }), 'folder/file.txt');
            assert.strictEqual(labels.$eA(nixUntitledUri, { os: 3 /* OperatingSystem.Linux */, relative: nixRelativePathProvider }), 'folder/file.txt');
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=labels.test.js.map