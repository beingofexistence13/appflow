/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/base/common/types", "vs/editor/common/diff/linesDiffComputers", "vs/editor/test/common/testTextModel", "vs/platform/telemetry/common/telemetryUtils", "vs/workbench/contrib/mergeEditor/browser/model/diffComputer", "vs/workbench/contrib/mergeEditor/browser/model/mapping", "vs/workbench/contrib/mergeEditor/browser/model/mergeEditorModel", "vs/workbench/contrib/mergeEditor/browser/telemetry"], function (require, exports, assert, lifecycle_1, observable_1, types_1, linesDiffComputers_1, testTextModel_1, telemetryUtils_1, diffComputer_1, mapping_1, mergeEditorModel_1, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('merge editor model', () => {
        // todo: renable when failing case is found https://github.com/microsoft/vscode/pull/190444#issuecomment-1678151428
        // ensureNoDisposablesAreLeakedInTestSuite();
        test('prepend line', async () => {
            await testMergeModel({
                "languageId": "plaintext",
                "base": "line1\nline2",
                "input1": "0\nline1\nline2",
                "input2": "0\nline1\nline2",
                "result": ""
            }, model => {
                assert.deepStrictEqual(model.getProjections(), {
                    base: ['⟦⟧₀line1', 'line2'],
                    input1: ['⟦0', '⟧₀line1', 'line2'],
                    input2: ['⟦0', '⟧₀line1', 'line2'],
                    result: ['⟦⟧{unrecognized}₀'],
                });
                model.toggleConflict(0, 1);
                assert.deepStrictEqual({ result: model.getResult() }, { result: '0\nline1\nline2' });
                model.toggleConflict(0, 2);
                assert.deepStrictEqual({ result: model.getResult() }, ({ result: "0\n0\nline1\nline2" }));
            });
        });
        test('empty base', async () => {
            await testMergeModel({
                "languageId": "plaintext",
                "base": "",
                "input1": "input1",
                "input2": "input2",
                "result": ""
            }, model => {
                assert.deepStrictEqual(model.getProjections(), {
                    base: ['⟦⟧₀'],
                    input1: ['⟦input1⟧₀'],
                    input2: ['⟦input2⟧₀'],
                    result: ['⟦⟧{base}₀'],
                });
                model.toggleConflict(0, 1);
                assert.deepStrictEqual({ result: model.getResult() }, ({ result: "input1" }));
                model.toggleConflict(0, 2);
                assert.deepStrictEqual({ result: model.getResult() }, ({ result: "input2" }));
            });
        });
        test('can merge word changes', async () => {
            await testMergeModel({
                "languageId": "plaintext",
                "base": "hello",
                "input1": "hallo",
                "input2": "helloworld",
                "result": ""
            }, model => {
                assert.deepStrictEqual(model.getProjections(), {
                    base: ['⟦hello⟧₀'],
                    input1: ['⟦hallo⟧₀'],
                    input2: ['⟦helloworld⟧₀'],
                    result: ['⟦⟧{unrecognized}₀'],
                });
                model.toggleConflict(0, 1);
                model.toggleConflict(0, 2);
                assert.deepStrictEqual({ result: model.getResult() }, { result: 'halloworld' });
            });
        });
        test('can combine insertions at end of document', async () => {
            await testMergeModel({
                "languageId": "plaintext",
                "base": "Zürich\nBern\nBasel\nChur\nGenf\nThun",
                "input1": "Zürich\nBern\nChur\nDavos\nGenf\nThun\nfunction f(b:boolean) {}",
                "input2": "Zürich\nBern\nBasel (FCB)\nChur\nGenf\nThun\nfunction f(a:number) {}",
                "result": "Zürich\nBern\nBasel\nChur\nDavos\nGenf\nThun"
            }, model => {
                assert.deepStrictEqual(model.getProjections(), {
                    base: ['Zürich', 'Bern', '⟦Basel', '⟧₀Chur', '⟦⟧₁Genf', 'Thun⟦⟧₂'],
                    input1: [
                        'Zürich',
                        'Bern',
                        '⟦⟧₀Chur',
                        '⟦Davos',
                        '⟧₁Genf',
                        'Thun',
                        '⟦function f(b:boolean) {}⟧₂',
                    ],
                    input2: [
                        'Zürich',
                        'Bern',
                        '⟦Basel (FCB)',
                        '⟧₀Chur',
                        '⟦⟧₁Genf',
                        'Thun',
                        '⟦function f(a:number) {}⟧₂',
                    ],
                    result: [
                        'Zürich',
                        'Bern',
                        '⟦Basel',
                        '⟧{base}₀Chur',
                        '⟦Davos',
                        '⟧{1✓}₁Genf',
                        'Thun⟦⟧{base}₂',
                    ],
                });
                model.toggleConflict(2, 1);
                model.toggleConflict(2, 2);
                assert.deepStrictEqual({ result: model.getResult() }, {
                    result: 'Zürich\nBern\nBasel\nChur\nDavos\nGenf\nThun\nfunction f(b:boolean) {}\nfunction f(a:number) {}',
                });
            });
        });
        test('conflicts are reset', async () => {
            await testMergeModel({
                "languageId": "typescript",
                "base": "import { h } from 'vs/base/browser/dom';\nimport { Disposable, IDisposable } from 'vs/base/common/lifecycle';\nimport { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';\nimport { EditorOption } from 'vs/editor/common/config/editorOptions';\nimport { autorun, IReader, observableFromEvent, ObservableValue } from 'vs/workbench/contrib/audioCues/browser/observable';\nimport { LineRange } from 'vs/workbench/contrib/mergeEditor/browser/model/lineRange';\n",
                "input1": "import { h } from 'vs/base/browser/dom';\nimport { Disposable, IDisposable } from 'vs/base/common/lifecycle';\nimport { observableSignalFromEvent } from 'vs/base/common/observable';\nimport { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';\nimport { autorun, IReader, observableFromEvent } from 'vs/workbench/contrib/audioCues/browser/observable';\nimport { LineRange } from 'vs/workbench/contrib/mergeEditor/browser/model/lineRange';\n",
                "input2": "import { h } from 'vs/base/browser/dom';\nimport { Disposable, IDisposable } from 'vs/base/common/lifecycle';\nimport { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';\nimport { autorun, IReader, observableFromEvent, ObservableValue } from 'vs/workbench/contrib/audioCues/browser/observable';\nimport { LineRange } from 'vs/workbench/contrib/mergeEditor/browser/model/lineRange';\n",
                "result": "import { h } from 'vs/base/browser/dom';\r\nimport { Disposable, IDisposable } from 'vs/base/common/lifecycle';\r\nimport { observableSignalFromEvent } from 'vs/base/common/observable';\r\nimport { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';\r\n<<<<<<< Updated upstream\r\nimport { autorun, IReader, observableFromEvent, ObservableValue } from 'vs/workbench/contrib/audioCues/browser/observable';\r\n=======\r\nimport { autorun, IReader, observableFromEvent } from 'vs/workbench/contrib/audioCues/browser/observable';\r\n>>>>>>> Stashed changes\r\nimport { LineRange } from 'vs/workbench/contrib/mergeEditor/browser/model/lineRange';\r\n"
            }, model => {
                assert.deepStrictEqual(model.getProjections(), {
                    base: [
                        "import { h } from 'vs/base/browser/dom';",
                        "import { Disposable, IDisposable } from 'vs/base/common/lifecycle';",
                        "⟦⟧₀import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';",
                        "⟦import { EditorOption } from 'vs/editor/common/config/editorOptions';",
                        "import { autorun, IReader, observableFromEvent, ObservableValue } from 'vs/workbench/contrib/audioCues/browser/observable';",
                        "⟧₁import { LineRange } from 'vs/workbench/contrib/mergeEditor/browser/model/lineRange';",
                        '',
                    ],
                    input1: [
                        "import { h } from 'vs/base/browser/dom';",
                        "import { Disposable, IDisposable } from 'vs/base/common/lifecycle';",
                        "⟦import { observableSignalFromEvent } from 'vs/base/common/observable';",
                        "⟧₀import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';",
                        "⟦import { autorun, IReader, observableFromEvent } from 'vs/workbench/contrib/audioCues/browser/observable';",
                        "⟧₁import { LineRange } from 'vs/workbench/contrib/mergeEditor/browser/model/lineRange';",
                        '',
                    ],
                    input2: [
                        "import { h } from 'vs/base/browser/dom';",
                        "import { Disposable, IDisposable } from 'vs/base/common/lifecycle';",
                        "⟦⟧₀import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';",
                        "⟦import { autorun, IReader, observableFromEvent, ObservableValue } from 'vs/workbench/contrib/audioCues/browser/observable';",
                        "⟧₁import { LineRange } from 'vs/workbench/contrib/mergeEditor/browser/model/lineRange';",
                        '',
                    ],
                    result: [
                        "import { h } from 'vs/base/browser/dom';",
                        "import { Disposable, IDisposable } from 'vs/base/common/lifecycle';",
                        "⟦import { observableSignalFromEvent } from 'vs/base/common/observable';",
                        "⟧{1✓}₀import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';",
                        '⟦<<<<<<< Updated upstream',
                        "import { autorun, IReader, observableFromEvent, ObservableValue } from 'vs/workbench/contrib/audioCues/browser/observable';",
                        '=======',
                        "import { autorun, IReader, observableFromEvent } from 'vs/workbench/contrib/audioCues/browser/observable';",
                        '>>>>>>> Stashed changes',
                        "⟧{unrecognized}₁import { LineRange } from 'vs/workbench/contrib/mergeEditor/browser/model/lineRange';",
                        '',
                    ],
                });
            });
        });
        test('auto-solve equal edits', async () => {
            await testMergeModel({
                "languageId": "javascript",
                "base": "const { readFileSync } = require('fs');\n\nlet paths = process.argv.slice(2);\nmain(paths);\n\nfunction main(paths) {\n    // print the welcome message\n    printMessage();\n\n    let data = getLineCountInfo(paths);\n    console.log(\"Lines: \" + data.totalLineCount);\n}\n\n/**\n * Prints the welcome message\n*/\nfunction printMessage() {\n    console.log(\"Welcome To Line Counter\");\n}\n\n/**\n * @param {string[]} paths\n*/\nfunction getLineCountInfo(paths) {\n    let lineCounts = paths.map(path => ({ path, count: getLinesLength(readFileSync(path, 'utf8')) }));\n    return {\n        totalLineCount: lineCounts.reduce((acc, { count }) => acc + count, 0),\n        lineCounts,\n    };\n}\n\n/**\n * @param {string} str\n */\nfunction getLinesLength(str) {\n    return str.split('\\n').length;\n}\n",
                "input1": "const { readFileSync } = require('fs');\n\nlet paths = process.argv.slice(2);\nmain(paths);\n\nfunction main(paths) {\n    // print the welcome message\n    printMessage();\n\n    const data = getLineCountInfo(paths);\n    console.log(\"Lines: \" + data.totalLineCount);\n}\n\nfunction printMessage() {\n    console.log(\"Welcome To Line Counter\");\n}\n\n/**\n * @param {string[]} paths\n*/\nfunction getLineCountInfo(paths) {\n    let lineCounts = paths.map(path => ({ path, count: getLinesLength(readFileSync(path, 'utf8')) }));\n    return {\n        totalLineCount: lineCounts.reduce((acc, { count }) => acc + count, 0),\n        lineCounts,\n    };\n}\n\n/**\n * @param {string} str\n */\nfunction getLinesLength(str) {\n    return str.split('\\n').length;\n}\n",
                "input2": "const { readFileSync } = require('fs');\n\nlet paths = process.argv.slice(2);\nrun(paths);\n\nfunction run(paths) {\n    // print the welcome message\n    printMessage();\n\n    const data = getLineCountInfo(paths);\n    console.log(\"Lines: \" + data.totalLineCount);\n}\n\nfunction printMessage() {\n    console.log(\"Welcome To Line Counter\");\n}\n\n/**\n * @param {string[]} paths\n*/\nfunction getLineCountInfo(paths) {\n    let lineCounts = paths.map(path => ({ path, count: getLinesLength(readFileSync(path, 'utf8')) }));\n    return {\n        totalLineCount: lineCounts.reduce((acc, { count }) => acc + count, 0),\n        lineCounts,\n    };\n}\n\n/**\n * @param {string} str\n */\nfunction getLinesLength(str) {\n    return str.split('\\n').length;\n}\n",
                "result": "<<<<<<< uiae\n>>>>>>> Stashed changes",
                resetResult: true,
            }, async (model) => {
                await model.mergeModel.reset();
                assert.deepStrictEqual(model.getResult(), `const { readFileSync } = require('fs');\n\nlet paths = process.argv.slice(2);\nrun(paths);\n\nfunction run(paths) {\n    // print the welcome message\n    printMessage();\n\n    const data = getLineCountInfo(paths);\n    console.log("Lines: " + data.totalLineCount);\n}\n\nfunction printMessage() {\n    console.log("Welcome To Line Counter");\n}\n\n/**\n * @param {string[]} paths\n*/\nfunction getLineCountInfo(paths) {\n    let lineCounts = paths.map(path => ({ path, count: getLinesLength(readFileSync(path, 'utf8')) }));\n    return {\n        totalLineCount: lineCounts.reduce((acc, { count }) => acc + count, 0),\n        lineCounts,\n    };\n}\n\n/**\n * @param {string} str\n */\nfunction getLinesLength(str) {\n    return str.split('\\n').length;\n}\n`);
            });
        });
    });
    async function testMergeModel(options, fn) {
        const disposables = new lifecycle_1.$jc();
        const modelInterface = disposables.add(new MergeModelInterface(options, (0, testTextModel_1.$Q0b)(disposables)));
        await modelInterface.mergeModel.onInitialized;
        await fn(modelInterface);
        disposables.dispose();
    }
    function toSmallNumbersDec(value) {
        const smallNumbers = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
        return value.toString().split('').map(c => smallNumbers[parseInt(c)]).join('');
    }
    class MergeModelInterface extends lifecycle_1.$kc {
        constructor(options, instantiationService) {
            super();
            const input1TextModel = this.B((0, testTextModel_1.$O0b)(options.input1, options.languageId));
            const input2TextModel = this.B((0, testTextModel_1.$O0b)(options.input2, options.languageId));
            const baseTextModel = this.B((0, testTextModel_1.$O0b)(options.base, options.languageId));
            const resultTextModel = this.B((0, testTextModel_1.$O0b)(options.result, options.languageId));
            const diffComputer = {
                async computeDiff(textModel1, textModel2, reader) {
                    const result = await linesDiffComputers_1.$ZY.getLegacy().computeDiff(textModel1.getLinesContent(), textModel2.getLinesContent(), { ignoreTrimWhitespace: false, maxComputationTimeMs: 10000, computeMoves: false });
                    const changes = result.changes.map(c => new mapping_1.$rjb((0, diffComputer_1.$vjb)(c.original), textModel1, (0, diffComputer_1.$vjb)(c.modified), textModel2, c.innerChanges?.map(ic => (0, diffComputer_1.$wjb)(ic)).filter(types_1.$rf)));
                    return {
                        diffs: changes
                    };
                }
            };
            this.mergeModel = this.B(instantiationService.createInstance(mergeEditorModel_1.$Hjb, baseTextModel, {
                textModel: input1TextModel,
                description: '',
                detail: '',
                title: '',
            }, {
                textModel: input2TextModel,
                description: '',
                detail: '',
                title: '',
            }, resultTextModel, diffComputer, {
                resetResult: options.resetResult || false
            }, new telemetry_1.$Gjb(telemetryUtils_1.$bo)));
        }
        getProjections() {
            function applyRanges(textModel, ranges) {
                textModel.applyEdits(ranges.map(({ range, label }) => ({
                    range: range,
                    text: `⟦${textModel.getValueInRange(range)}⟧${label}`,
                })));
            }
            const baseRanges = this.mergeModel.modifiedBaseRanges.get();
            const baseTextModel = (0, testTextModel_1.$O0b)(this.mergeModel.base.getValue());
            applyRanges(baseTextModel, baseRanges.map((r, idx) => ({
                range: r.baseRange.toRange(),
                label: toSmallNumbersDec(idx),
            })));
            const input1TextModel = (0, testTextModel_1.$O0b)(this.mergeModel.input1.textModel.getValue());
            applyRanges(input1TextModel, baseRanges.map((r, idx) => ({
                range: r.input1Range.toRange(),
                label: toSmallNumbersDec(idx),
            })));
            const input2TextModel = (0, testTextModel_1.$O0b)(this.mergeModel.input2.textModel.getValue());
            applyRanges(input2TextModel, baseRanges.map((r, idx) => ({
                range: r.input2Range.toRange(),
                label: toSmallNumbersDec(idx),
            })));
            const resultTextModel = (0, testTextModel_1.$O0b)(this.mergeModel.resultTextModel.getValue());
            applyRanges(resultTextModel, baseRanges.map((r, idx) => ({
                range: this.mergeModel.getLineRangeInResult(r.baseRange).toRange(),
                label: `{${this.mergeModel.getState(r).get()}}${toSmallNumbersDec(idx)}`,
            })));
            const result = {
                base: baseTextModel.getValue(1 /* EndOfLinePreference.LF */).split('\n'),
                input1: input1TextModel.getValue(1 /* EndOfLinePreference.LF */).split('\n'),
                input2: input2TextModel.getValue(1 /* EndOfLinePreference.LF */).split('\n'),
                result: resultTextModel.getValue(1 /* EndOfLinePreference.LF */).split('\n'),
            };
            baseTextModel.dispose();
            input1TextModel.dispose();
            input2TextModel.dispose();
            resultTextModel.dispose();
            return result;
        }
        toggleConflict(conflictIdx, inputNumber) {
            const baseRange = this.mergeModel.modifiedBaseRanges.get()[conflictIdx];
            if (!baseRange) {
                throw new Error();
            }
            const state = this.mergeModel.getState(baseRange).get();
            (0, observable_1.transaction)(tx => {
                this.mergeModel.setState(baseRange, state.toggle(inputNumber), true, tx);
            });
        }
        getResult() {
            return this.mergeModel.resultTextModel.getValue();
        }
    }
});
//# sourceMappingURL=model.test.js.map