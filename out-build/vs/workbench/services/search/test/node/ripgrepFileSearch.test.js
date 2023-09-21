/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/platform", "vs/workbench/services/search/node/ripgrepFileSearch"], function (require, exports, assert, platform, ripgrepFileSearch_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('RipgrepFileSearch - etc', () => {
        function testGetAbsGlob(params) {
            const [folder, glob, expectedResult] = params;
            assert.strictEqual((0, ripgrepFileSearch_1.$wdc)((0, ripgrepFileSearch_1.$vdc)(folder, glob)), expectedResult, JSON.stringify(params));
        }
        (!platform.$i ? test.skip : test)('getAbsoluteGlob_win', () => {
            [
                ['C:/foo/bar', 'glob/**', '/foo\\bar\\glob\\**'],
                ['c:/', 'glob/**', '/glob\\**'],
                ['C:\\foo\\bar', 'glob\\**', '/foo\\bar\\glob\\**'],
                ['c:\\foo\\bar', 'glob\\**', '/foo\\bar\\glob\\**'],
                ['c:\\', 'glob\\**', '/glob\\**'],
                ['\\\\localhost\\c$\\foo\\bar', 'glob/**', '\\\\localhost\\c$\\foo\\bar\\glob\\**'],
                // absolute paths are not resolved further
                ['c:/foo/bar', '/path/something', '/path/something'],
                ['c:/foo/bar', 'c:\\project\\folder', '/project\\folder']
            ].forEach(testGetAbsGlob);
        });
        (platform.$i ? test.skip : test)('getAbsoluteGlob_posix', () => {
            [
                ['/foo/bar', 'glob/**', '/foo/bar/glob/**'],
                ['/', 'glob/**', '/glob/**'],
                // absolute paths are not resolved further
                ['/', '/project/folder', '/project/folder'],
            ].forEach(testGetAbsGlob);
        });
    });
});
//# sourceMappingURL=ripgrepFileSearch.test.js.map