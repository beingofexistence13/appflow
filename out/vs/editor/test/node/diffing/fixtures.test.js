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
        const fixturesOutDir = network_1.FileAccess.asFileUri('vs/editor/test/node/diffing/fixtures').fsPath;
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
            const diffingAlgo = diffingAlgoName === 'legacy' ? new legacyLinesDiffComputer_1.LegacyLinesDiffComputer() : new defaultLinesDiffComputer_1.DefaultLinesDiffComputer();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZml4dHVyZXMudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci90ZXN0L25vZGUvZGlmZmluZy9maXh0dXJlcy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBV2hHLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUU7UUFDOUIsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLElBQUEsa0NBQXlCLEVBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQzdCLE1BQU0sQ0FBQyxDQUFDO1lBQ1QsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUdILE1BQU0sY0FBYyxHQUFHLG9CQUFVLENBQUMsU0FBUyxDQUFDLHNDQUFzQyxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQzNGLDhJQUE4STtRQUM5SSxrREFBa0Q7UUFDbEQsTUFBTSxjQUFjLEdBQUcsSUFBQSxjQUFPLEVBQUMsY0FBYyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUNuSCxNQUFNLE9BQU8sR0FBRyxJQUFBLGdCQUFXLEVBQUMsY0FBYyxDQUFDLENBQUM7UUFFNUMsU0FBUyxPQUFPLENBQUMsTUFBYyxFQUFFLGVBQXNDO1lBQ3RFLE1BQU0sVUFBVSxHQUFHLElBQUEsV0FBSSxFQUFDLGNBQWMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNoRCxNQUFNLEtBQUssR0FBRyxJQUFBLGdCQUFXLEVBQUMsVUFBVSxDQUFDLENBQUM7WUFFdEMsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUUsQ0FBQztZQUMzRCxNQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMs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