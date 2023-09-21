/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/contrib/terminal/browser/terminalActions"], function (require, exports, assert_1, uri_1, terminalActions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function makeFakeFolder(name, uri) {
        return {
            name,
            uri,
            index: 0,
            toResource: () => uri,
        };
    }
    function makePair(folder, cwd, isAbsolute) {
        return {
            folder,
            cwd: !cwd ? folder.uri : (cwd instanceof uri_1.URI ? cwd : cwd.uri),
            isAbsolute: !!isAbsolute,
            isOverridden: !!cwd && cwd.toString() !== folder.uri.toString(),
        };
    }
    suite('terminalActions', () => {
        const root = uri_1.URI.file('/some-root');
        const a = makeFakeFolder('a', uri_1.URI.joinPath(root, 'a'));
        const b = makeFakeFolder('b', uri_1.URI.joinPath(root, 'b'));
        const c = makeFakeFolder('c', uri_1.URI.joinPath(root, 'c'));
        const d = makeFakeFolder('d', uri_1.URI.joinPath(root, 'd'));
        suite('shrinkWorkspaceFolderCwdPairs', () => {
            test('should return empty when given array is empty', () => {
                (0, assert_1.deepStrictEqual)((0, terminalActions_1.$NVb)([]), []);
            });
            test('should return the only single pair when given argument is a single element array', () => {
                const pairs = [makePair(a)];
                (0, assert_1.deepStrictEqual)((0, terminalActions_1.$NVb)(pairs), pairs);
            });
            test('should return all pairs when no repeated cwds', () => {
                const pairs = [makePair(a), makePair(b), makePair(c)];
                (0, assert_1.deepStrictEqual)((0, terminalActions_1.$NVb)(pairs), pairs);
            });
            suite('should select the pair that has the same URI when repeated cwds exist', () => {
                test('all repeated', () => {
                    const pairA = makePair(a);
                    const pairB = makePair(b, a); // CWD points to A
                    const pairC = makePair(c, a); // CWD points to A
                    (0, assert_1.deepStrictEqual)((0, terminalActions_1.$NVb)([pairA, pairB, pairC]), [pairA]);
                });
                test('two repeated + one different', () => {
                    const pairA = makePair(a);
                    const pairB = makePair(b, a); // CWD points to A
                    const pairC = makePair(c);
                    (0, assert_1.deepStrictEqual)((0, terminalActions_1.$NVb)([pairA, pairB, pairC]), [pairA, pairC]);
                });
                test('two repeated + two repeated', () => {
                    const pairA = makePair(a);
                    const pairB = makePair(b, a); // CWD points to A
                    const pairC = makePair(c);
                    const pairD = makePair(d, c);
                    (0, assert_1.deepStrictEqual)((0, terminalActions_1.$NVb)([pairA, pairB, pairC, pairD]), [pairA, pairC]);
                });
                test('two repeated + two repeated (reverse order)', () => {
                    const pairB = makePair(b, a); // CWD points to A
                    const pairA = makePair(a);
                    const pairD = makePair(d, c);
                    const pairC = makePair(c);
                    (0, assert_1.deepStrictEqual)((0, terminalActions_1.$NVb)([pairA, pairB, pairC, pairD]), [pairA, pairC]);
                });
            });
        });
    });
});
//# sourceMappingURL=terminalActions.test.js.map