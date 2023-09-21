/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "fs", "path", "vs/base/common/errors", "vs/base/common/network", "vs/editor/common/diff/legacyLinesDiffComputer", "vs/editor/common/diff/defaultLinesDiffComputer/defaultLinesDiffComputer"], function (require, exports, assert, fs_1, path_1, errors_1, network_1, legacyLinesDiffComputer_1, defaultLinesDiffComputer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('diffing fixtures', () => {
        setup(() => {
            (0, errors_1.setUnexpectedErrorHandler)(e => {
                throw e;
            });
        });
        const fixturesOutDir = network_1.$2f.asFileUri('vs/editor/test/node/diffing/fixtures').fsPath;
        // We want the dir in src, so we can directly update the source files if they disagree and create invalid files to capture the previous state.
        // This makes it very easy to update the fixtures.
        const fixturesSrcDir = (0, path_1.resolve)(fixturesOutDir).replaceAll('\\', '/').replace('/out/vs/editor/', '/src/vs/editor/');
        const folders = (0, fs_1.readdirSync)(fixturesSrcDir);
        function runTest(folder, diffingAlgoName) {
            const folderPath = (0, path_1.join)(fixturesSrcDir, folder);
            const files = (0, fs_1.readdirSync)(folderPath);
            const firstFileName = files.find(f => f.startsWith('1.'));
            const secondFileName = files.find(f => f.startsWith('2.'));
            const firstContent = (0, fs_1.readFileSync)((0, path_1.join)(folderPath, firstFileName), 'utf8').replaceAll('\r\n', '\n').replaceAll('\r', '\n');
            const firstContentLines = firstContent.split(/\n/);
            const secondContent = (0, fs_1.readFileSync)((0, path_1.join)(folderPath, secondFileName), 'utf8').replaceAll('\r\n', '\n').replaceAll('\r', '\n');
            const secondContentLines = secondContent.split(/\n/);
            const diffingAlgo = diffingAlgoName === 'legacy' ? new legacyLinesDiffComputer_1.$As() : new defaultLinesDiffComputer_1.$WY();
            const ignoreTrimWhitespace = folder.indexOf('trimws') >= 0;
            const diff = diffingAlgo.computeDiff(firstContentLines, secondContentLines, { ignoreTrimWhitespace, maxComputationTimeMs: Number.MAX_SAFE_INTEGER, computeMoves: false });
            function getDiffs(changes) {
                return changes.map(c => ({
                    originalRange: c.original.toString(),
                    modifiedRange: c.modified.toString(),
                    innerChanges: c.innerChanges?.map(c => ({
                        originalRange: c.originalRange.toString(),
                        modifiedRange: c.modifiedRange.toString(),
                    })) || null
                }));
            }
            const actualDiffingResult = {
                original: { content: firstContent, fileName: `./${firstFileName}` },
                modified: { content: secondContent, fileName: `./${secondFileName}` },
                diffs: getDiffs(diff.changes),
                moves: diff.moves.map(v => ({
                    originalRange: v.lineRangeMapping.original.toString(),
                    modifiedRange: v.lineRangeMapping.modified.toString(),
                    changes: getDiffs(v.changes),
                }))
            };
            if (actualDiffingResult.moves?.length === 0) {
                delete actualDiffingResult.moves;
            }
            const expectedFilePath = (0, path_1.join)(folderPath, `${diffingAlgoName}.expected.diff.json`);
            const invalidFilePath = (0, path_1.join)(folderPath, `${diffingAlgoName}.invalid.diff.json`);
            const actualJsonStr = JSON.stringify(actualDiffingResult, null, '\t');
            if (!(0, fs_1.existsSync)(expectedFilePath)) {
                // New test, create expected file
                (0, fs_1.writeFileSync)(expectedFilePath, actualJsonStr);
                // Create invalid file so that this test fails on a re-run
                (0, fs_1.writeFileSync)(invalidFilePath, '');
                throw new Error('No expected file! Expected and invalid files were written. Delete the invalid file to make the test pass.');
            }
            if ((0, fs_1.existsSync)(invalidFilePath)) {
                const invalidJsonStr = (0, fs_1.readFileSync)(invalidFilePath, 'utf8');
                if (invalidJsonStr === '') {
                    // Update expected file
                    (0, fs_1.writeFileSync)(expectedFilePath, actualJsonStr);
                    throw new Error(`Delete the invalid ${invalidFilePath} file to make the test pass.`);
                }
                else {
                    const expectedFileDiffResult = JSON.parse(invalidJsonStr);
                    try {
                        assert.deepStrictEqual(actualDiffingResult, expectedFileDiffResult);
                    }
                    catch (e) {
                        (0, fs_1.writeFileSync)(expectedFilePath, actualJsonStr);
                        throw e;
                    }
                    // Test succeeded with the invalid file, restore expected file from invalid
                    (0, fs_1.writeFileSync)(expectedFilePath, invalidJsonStr);
                    (0, fs_1.rmSync)(invalidFilePath);
                }
            }
            else {
                const expectedJsonStr = (0, fs_1.readFileSync)(expectedFilePath, 'utf8');
                const expectedFileDiffResult = JSON.parse(expectedJsonStr);
                try {
                    assert.deepStrictEqual(actualDiffingResult, expectedFileDiffResult);
                }
                catch (e) {
                    // Backup expected file
                    (0, fs_1.writeFileSync)(invalidFilePath, expectedJsonStr);
                    // Update expected file
                    (0, fs_1.writeFileSync)(expectedFilePath, actualJsonStr);
                    throw e;
                }
            }
        }
        test(`test`, () => {
            runTest('invalid-diff-trimws', 'advanced');
        });
        for (const folder of folders) {
            for (const diffingAlgoName of ['legacy', 'advanced']) {
                test(`${folder}-${diffingAlgoName}`, () => {
                    runTest(folder, diffingAlgoName);
                });
            }
        }
    });
});
//# sourceMappingURL=fixtures.test.js.map