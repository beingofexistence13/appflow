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
        const disposables = new lifecycle_1.DisposableStore();
        const modelInterface = disposables.add(new MergeModelInterface(options, (0, testTextModel_1.createModelServices)(disposables)));
        await modelInterface.mergeModel.onInitialized;
        await fn(modelInterface);
        disposables.dispose();
    }
    function toSmallNumbersDec(value) {
        const smallNumbers = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
        return value.toString().split('').map(c => smallNumbers[parseInt(c)]).join('');
    }
    class MergeModelInterface extends lifecycle_1.Disposable {
        constructor(options, instantiationService) {
            super();
            const input1TextModel = this._register((0, testTextModel_1.createTextModel)(options.input1, options.languageId));
            const input2TextModel = this._register((0, testTextModel_1.createTextModel)(options.input2, options.languageId));
            const baseTextModel = this._register((0, testTextModel_1.createTextModel)(options.base, options.languageId));
            const resultTextModel = this._register((0, testTextModel_1.createTextModel)(options.result, options.languageId));
            const diffComputer = {
                async computeDiff(textModel1, textModel2, reader) {
                    const result = await linesDiffComputers_1.linesDiffComputers.getLegacy().computeDiff(textModel1.getLinesContent(), textModel2.getLinesContent(), { ignoreTrimWhitespace: false, maxComputationTimeMs: 10000, computeMoves: false });
                    const changes = result.changes.map(c => new mapping_1.DetailedLineRangeMapping((0, diffComputer_1.toLineRange)(c.original), textModel1, (0, diffComputer_1.toLineRange)(c.modified), textModel2, c.innerChanges?.map(ic => (0, diffComputer_1.toRangeMapping)(ic)).filter(types_1.isDefined)));
                    return {
                        diffs: changes
                    };
                }
            };
            this.mergeModel = this._register(instantiationService.createInstance(mergeEditorModel_1.MergeEditorModel, baseTextModel, {
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
            }, new telemetry_1.MergeEditorTelemetry(telemetryUtils_1.NullTelemetryService)));
        }
        getProjections() {
            function applyRanges(textModel, ranges) {
                textModel.applyEdits(ranges.map(({ range, label }) => ({
                    range: range,
                    text: `⟦${textModel.getValueInRange(range)}⟧${label}`,
                })));
            }
            const baseRanges = this.mergeModel.modifiedBaseRanges.get();
            const baseTextModel = (0, testTextModel_1.createTextModel)(this.mergeModel.base.getValue());
            applyRanges(baseTextModel, baseRanges.map((r, idx) => ({
                range: r.baseRange.toRange(),
                label: toSmallNumbersDec(idx),
            })));
            const input1TextModel = (0, testTextModel_1.createTextModel)(this.mergeModel.input1.textModel.getValue());
            applyRanges(input1TextModel, baseRanges.map((r, idx) => ({
                range: r.input1Range.toRange(),
                label: toSmallNumbersDec(idx),
            })));
            const input2TextModel = (0, testTextModel_1.createTextModel)(this.mergeModel.input2.textModel.getValue());
            applyRanges(input2TextModel, baseRanges.map((r, idx) => ({
                range: r.input2Range.toRange(),
                label: toSmallNumbersDec(idx),
            })));
            const resultTextModel = (0, testTextModel_1.createTextModel)(this.mergeModel.resultTextModel.getValue());
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWwudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL21lcmdlRWRpdG9yL3Rlc3QvYnJvd3Nlci9tb2RlbC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBaUJoRyxLQUFLLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxFQUFFO1FBQ2hDLG1IQUFtSDtRQUNuSCw2Q0FBNkM7UUFFN0MsSUFBSSxDQUFDLGNBQWMsRUFBRSxLQUFLLElBQUksRUFBRTtZQUMvQixNQUFNLGNBQWMsQ0FDbkI7Z0JBQ0MsWUFBWSxFQUFFLFdBQVc7Z0JBQ3pCLE1BQU0sRUFBRSxjQUFjO2dCQUN0QixRQUFRLEVBQUUsaUJBQWlCO2dCQUMzQixRQUFRLEVBQUUsaUJBQWlCO2dCQUMzQixRQUFRLEVBQUUsRUFBRTthQUNaLEVBQ0QsS0FBSyxDQUFDLEVBQUU7Z0JBQ1AsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLEVBQUU7b0JBQzlDLElBQUksRUFBRSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUM7b0JBQzNCLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDO29CQUNsQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQztvQkFDbEMsTUFBTSxFQUFFLENBQUMsbUJBQW1CLENBQUM7aUJBQzdCLENBQUMsQ0FBQztnQkFFSCxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDM0IsTUFBTSxDQUFDLGVBQWUsQ0FDckIsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLFNBQVMsRUFBRSxFQUFFLEVBQzdCLEVBQUUsTUFBTSxFQUFFLGlCQUFpQixFQUFFLENBQzdCLENBQUM7Z0JBRUYsS0FBSyxDQUFDLGNBQWMsQ0FBQyxD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