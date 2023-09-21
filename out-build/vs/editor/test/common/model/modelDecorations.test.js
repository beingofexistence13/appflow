/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/test/common/testTextModel"], function (require, exports, assert, utils_1, editOperation_1, position_1, range_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function modelHasDecorations(model, decorations) {
        const modelDecorations = [];
        const actualDecorations = model.getAllDecorations();
        for (let i = 0, len = actualDecorations.length; i < len; i++) {
            modelDecorations.push({
                range: actualDecorations[i].range,
                className: actualDecorations[i].options.className
            });
        }
        modelDecorations.sort((a, b) => range_1.$ks.compareRangesUsingStarts(a.range, b.range));
        assert.deepStrictEqual(modelDecorations, decorations);
    }
    function modelHasDecoration(model, startLineNumber, startColumn, endLineNumber, endColumn, className) {
        modelHasDecorations(model, [{
                range: new range_1.$ks(startLineNumber, startColumn, endLineNumber, endColumn),
                className: className
            }]);
    }
    function modelHasNoDecorations(model) {
        assert.strictEqual(model.getAllDecorations().length, 0, 'Model has no decoration');
    }
    function addDecoration(model, startLineNumber, startColumn, endLineNumber, endColumn, className) {
        return model.changeDecorations((changeAccessor) => {
            return changeAccessor.addDecoration(new range_1.$ks(startLineNumber, startColumn, endLineNumber, endColumn), {
                description: 'test',
                className: className
            });
        });
    }
    function lineHasDecorations(model, lineNumber, decorations) {
        const lineDecorations = [];
        const decs = model.getLineDecorations(lineNumber);
        for (let i = 0, len = decs.length; i < len; i++) {
            lineDecorations.push({
                start: decs[i].range.startColumn,
                end: decs[i].range.endColumn,
                className: decs[i].options.className
            });
        }
        assert.deepStrictEqual(lineDecorations, decorations, 'Line decorations');
    }
    function lineHasNoDecorations(model, lineNumber) {
        lineHasDecorations(model, lineNumber, []);
    }
    function lineHasDecoration(model, lineNumber, start, end, className) {
        lineHasDecorations(model, lineNumber, [{
                start: start,
                end: end,
                className: className
            }]);
    }
    suite('Editor Model - Model Decorations', () => {
        const LINE1 = 'My First Line';
        const LINE2 = '\t\tMy Second Line';
        const LINE3 = '    Third Line';
        const LINE4 = '';
        const LINE5 = '1';
        // --------- Model Decorations
        let thisModel;
        setup(() => {
            const text = LINE1 + '\r\n' +
                LINE2 + '\n' +
                LINE3 + '\n' +
                LINE4 + '\r\n' +
                LINE5;
            thisModel = (0, testTextModel_1.$O0b)(text);
        });
        teardown(() => {
            thisModel.dispose();
        });
        (0, utils_1.$bT)();
        test('single character decoration', () => {
            addDecoration(thisModel, 1, 1, 1, 2, 'myType');
            lineHasDecoration(thisModel, 1, 1, 2, 'myType');
            lineHasNoDecorations(thisModel, 2);
            lineHasNoDecorations(thisModel, 3);
            lineHasNoDecorations(thisModel, 4);
            lineHasNoDecorations(thisModel, 5);
        });
        test('line decoration', () => {
            addDecoration(thisModel, 1, 1, 1, 14, 'myType');
            lineHasDecoration(thisModel, 1, 1, 14, 'myType');
            lineHasNoDecorations(thisModel, 2);
            lineHasNoDecorations(thisModel, 3);
            lineHasNoDecorations(thisModel, 4);
            lineHasNoDecorations(thisModel, 5);
        });
        test('full line decoration', () => {
            addDecoration(thisModel, 1, 1, 2, 1, 'myType');
            const line1Decorations = thisModel.getLineDecorations(1);
            assert.strictEqual(line1Decorations.length, 1);
            assert.strictEqual(line1Decorations[0].options.className, 'myType');
            const line2Decorations = thisModel.getLineDecorations(1);
            assert.strictEqual(line2Decorations.length, 1);
            assert.strictEqual(line2Decorations[0].options.className, 'myType');
            lineHasNoDecorations(thisModel, 3);
            lineHasNoDecorations(thisModel, 4);
            lineHasNoDecorations(thisModel, 5);
        });
        test('multiple line decoration', () => {
            addDecoration(thisModel, 1, 2, 3, 2, 'myType');
            const line1Decorations = thisModel.getLineDecorations(1);
            assert.strictEqual(line1Decorations.length, 1);
            assert.strictEqual(line1Decorations[0].options.className, 'myType');
            const line2Decorations = thisModel.getLineDecorations(1);
            assert.strictEqual(line2Decorations.length, 1);
            assert.strictEqual(line2Decorations[0].options.className, 'myType');
            const line3Decorations = thisModel.getLineDecorations(1);
            assert.strictEqual(line3Decorations.length, 1);
            assert.strictEqual(line3Decorations[0].options.className, 'myType');
            lineHasNoDecorations(thisModel, 4);
            lineHasNoDecorations(thisModel, 5);
        });
        // --------- removing, changing decorations
        test('decoration gets removed', () => {
            const decId = addDecoration(thisModel, 1, 2, 3, 2, 'myType');
            modelHasDecoration(thisModel, 1, 2, 3, 2, 'myType');
            thisModel.changeDecorations((changeAccessor) => {
                changeAccessor.removeDecoration(decId);
            });
            modelHasNoDecorations(thisModel);
        });
        test('decorations get removed', () => {
            const decId1 = addDecoration(thisModel, 1, 2, 3, 2, 'myType1');
            const decId2 = addDecoration(thisModel, 1, 2, 3, 1, 'myType2');
            modelHasDecorations(thisModel, [
                {
                    range: new range_1.$ks(1, 2, 3, 1),
                    className: 'myType2'
                },
                {
                    range: new range_1.$ks(1, 2, 3, 2),
                    className: 'myType1'
                }
            ]);
            thisModel.changeDecorations((changeAccessor) => {
                changeAccessor.removeDecoration(decId1);
            });
            modelHasDecorations(thisModel, [
                {
                    range: new range_1.$ks(1, 2, 3, 1),
                    className: 'myType2'
                }
            ]);
            thisModel.changeDecorations((changeAccessor) => {
                changeAccessor.removeDecoration(decId2);
            });
            modelHasNoDecorations(thisModel);
        });
        test('decoration range can be changed', () => {
            const decId = addDecoration(thisModel, 1, 2, 3, 2, 'myType');
            modelHasDecoration(thisModel, 1, 2, 3, 2, 'myType');
            thisModel.changeDecorations((changeAccessor) => {
                changeAccessor.changeDecoration(decId, new range_1.$ks(1, 1, 1, 2));
            });
            modelHasDecoration(thisModel, 1, 1, 1, 2, 'myType');
        });
        // --------- eventing
        test('decorations emit event on add', () => {
            let listenerCalled = 0;
            const disposable = thisModel.onDidChangeDecorations((e) => {
                listenerCalled++;
            });
            addDecoration(thisModel, 1, 2, 3, 2, 'myType');
            assert.strictEqual(listenerCalled, 1, 'listener called');
            disposable.dispose();
        });
        test('decorations emit event on change', () => {
            let listenerCalled = 0;
            const decId = addDecoration(thisModel, 1, 2, 3, 2, 'myType');
            const disposable = thisModel.onDidChangeDecorations((e) => {
                listenerCalled++;
            });
            thisModel.changeDecorations((changeAccessor) => {
                changeAccessor.changeDecoration(decId, new range_1.$ks(1, 1, 1, 2));
            });
            assert.strictEqual(listenerCalled, 1, 'listener called');
            disposable.dispose();
        });
        test('decorations emit event on remove', () => {
            let listenerCalled = 0;
            const decId = addDecoration(thisModel, 1, 2, 3, 2, 'myType');
            const disposable = thisModel.onDidChangeDecorations((e) => {
                listenerCalled++;
            });
            thisModel.changeDecorations((changeAccessor) => {
                changeAccessor.removeDecoration(decId);
            });
            assert.strictEqual(listenerCalled, 1, 'listener called');
            disposable.dispose();
        });
        test('decorations emit event when inserting one line text before it', () => {
            let listenerCalled = 0;
            addDecoration(thisModel, 1, 2, 3, 2, 'myType');
            const disposable = thisModel.onDidChangeDecorations((e) => {
                listenerCalled++;
            });
            thisModel.applyEdits([editOperation_1.$ls.insert(new position_1.$js(1, 1), 'Hallo ')]);
            assert.strictEqual(listenerCalled, 1, 'listener called');
            disposable.dispose();
        });
        test('decorations do not emit event on no-op deltaDecorations', () => {
            let listenerCalled = 0;
            const disposable = thisModel.onDidChangeDecorations((e) => {
                listenerCalled++;
            });
            thisModel.deltaDecorations([], []);
            thisModel.changeDecorations((accessor) => {
                accessor.deltaDecorations([], []);
            });
            assert.strictEqual(listenerCalled, 0, 'listener not called');
            disposable.dispose();
        });
        // --------- editing text & effects on decorations
        test('decorations are updated when inserting one line text before it', () => {
            addDecoration(thisModel, 1, 2, 3, 2, 'myType');
            modelHasDecoration(thisModel, 1, 2, 3, 2, 'myType');
            thisModel.applyEdits([editOperation_1.$ls.insert(new position_1.$js(1, 1), 'Hallo ')]);
            modelHasDecoration(thisModel, 1, 8, 3, 2, 'myType');
        });
        test('decorations are updated when inserting one line text before it 2', () => {
            addDecoration(thisModel, 1, 1, 3, 2, 'myType');
            modelHasDecoration(thisModel, 1, 1, 3, 2, 'myType');
            thisModel.applyEdits([editOperation_1.$ls.replace(new range_1.$ks(1, 1, 1, 1), 'Hallo ')]);
            modelHasDecoration(thisModel, 1, 1, 3, 2, 'myType');
        });
        test('decorations are updated when inserting multiple lines text before it', () => {
            addDecoration(thisModel, 1, 2, 3, 2, 'myType');
            modelHasDecoration(thisModel, 1, 2, 3, 2, 'myType');
            thisModel.applyEdits([editOperation_1.$ls.insert(new position_1.$js(1, 1), 'Hallo\nI\'m inserting multiple\nlines')]);
            modelHasDecoration(thisModel, 3, 7, 5, 2, 'myType');
        });
        test('decorations change when inserting text after them', () => {
            addDecoration(thisModel, 1, 2, 3, 2, 'myType');
            modelHasDecoration(thisModel, 1, 2, 3, 2, 'myType');
            thisModel.applyEdits([editOperation_1.$ls.insert(new position_1.$js(3, 2), 'Hallo')]);
            modelHasDecoration(thisModel, 1, 2, 3, 7, 'myType');
        });
        test('decorations are updated when inserting text inside', () => {
            addDecoration(thisModel, 1, 2, 3, 2, 'myType');
            modelHasDecoration(thisModel, 1, 2, 3, 2, 'myType');
            thisModel.applyEdits([editOperation_1.$ls.insert(new position_1.$js(1, 3), 'Hallo ')]);
            modelHasDecoration(thisModel, 1, 2, 3, 2, 'myType');
        });
        test('decorations are updated when inserting text inside 2', () => {
            addDecoration(thisModel, 1, 2, 3, 2, 'myType');
            modelHasDecoration(thisModel, 1, 2, 3, 2, 'myType');
            thisModel.applyEdits([editOperation_1.$ls.insert(new position_1.$js(3, 1), 'Hallo ')]);
            modelHasDecoration(thisModel, 1, 2, 3, 8, 'myType');
        });
        test('decorations are updated when inserting text inside 3', () => {
            addDecoration(thisModel, 1, 1, 2, 16, 'myType');
            modelHasDecoration(thisModel, 1, 1, 2, 16, 'myType');
            thisModel.applyEdits([editOperation_1.$ls.insert(new position_1.$js(2, 2), '\n')]);
            modelHasDecoration(thisModel, 1, 1, 3, 15, 'myType');
        });
        test('decorations are updated when inserting multiple lines text inside', () => {
            addDecoration(thisModel, 1, 2, 3, 2, 'myType');
            modelHasDecoration(thisModel, 1, 2, 3, 2, 'myType');
            thisModel.applyEdits([editOperation_1.$ls.insert(new position_1.$js(1, 3), 'Hallo\nI\'m inserting multiple\nlines')]);
            modelHasDecoration(thisModel, 1, 2, 5, 2, 'myType');
        });
        test('decorations are updated when deleting one line text before it', () => {
            addDecoration(thisModel, 1, 2, 3, 2, 'myType');
            modelHasDecoration(thisModel, 1, 2, 3, 2, 'myType');
            thisModel.applyEdits([editOperation_1.$ls.delete(new range_1.$ks(1, 1, 1, 2))]);
            modelHasDecoration(thisModel, 1, 1, 3, 2, 'myType');
        });
        test('decorations are updated when deleting multiple lines text before it', () => {
            addDecoration(thisModel, 2, 2, 3, 2, 'myType');
            modelHasDecoration(thisModel, 2, 2, 3, 2, 'myType');
            thisModel.applyEdits([editOperation_1.$ls.delete(new range_1.$ks(1, 1, 2, 1))]);
            modelHasDecoration(thisModel, 1, 2, 2, 2, 'myType');
        });
        test('decorations are updated when deleting multiple lines text before it 2', () => {
            addDecoration(thisModel, 2, 3, 3, 2, 'myType');
            modelHasDecoration(thisModel, 2, 3, 3, 2, 'myType');
            thisModel.applyEdits([editOperation_1.$ls.delete(new range_1.$ks(1, 1, 2, 2))]);
            modelHasDecoration(thisModel, 1, 2, 2, 2, 'myType');
        });
        test('decorations are updated when deleting text inside', () => {
            addDecoration(thisModel, 1, 2, 4, 1, 'myType');
            modelHasDecoration(thisModel, 1, 2, 4, 1, 'myType');
            thisModel.applyEdits([editOperation_1.$ls.delete(new range_1.$ks(1, 3, 2, 1))]);
            modelHasDecoration(thisModel, 1, 2, 3, 1, 'myType');
        });
        test('decorations are updated when deleting text inside 2', () => {
            addDecoration(thisModel, 1, 2, 4, 1, 'myType');
            modelHasDecoration(thisModel, 1, 2, 4, 1, 'myType');
            thisModel.applyEdits([
                editOperation_1.$ls.delete(new range_1.$ks(1, 1, 1, 2)),
                editOperation_1.$ls.delete(new range_1.$ks(4, 1, 4, 1))
            ]);
            modelHasDecoration(thisModel, 1, 1, 4, 1, 'myType');
        });
        test('decorations are updated when deleting multiple lines text', () => {
            addDecoration(thisModel, 1, 2, 4, 1, 'myType');
            modelHasDecoration(thisModel, 1, 2, 4, 1, 'myType');
            thisModel.applyEdits([editOperation_1.$ls.delete(new range_1.$ks(1, 1, 3, 1))]);
            modelHasDecoration(thisModel, 1, 1, 2, 1, 'myType');
        });
        test('decorations are updated when changing EOL', () => {
            addDecoration(thisModel, 1, 2, 4, 1, 'myType1');
            addDecoration(thisModel, 1, 3, 4, 1, 'myType2');
            addDecoration(thisModel, 1, 4, 4, 1, 'myType3');
            addDecoration(thisModel, 1, 5, 4, 1, 'myType4');
            addDecoration(thisModel, 1, 6, 4, 1, 'myType5');
            addDecoration(thisModel, 1, 7, 4, 1, 'myType6');
            addDecoration(thisModel, 1, 8, 4, 1, 'myType7');
            addDecoration(thisModel, 1, 9, 4, 1, 'myType8');
            addDecoration(thisModel, 1, 10, 4, 1, 'myType9');
            thisModel.applyEdits([editOperation_1.$ls.insert(new position_1.$js(1, 1), 'x')]);
            thisModel.setEOL(1 /* EndOfLineSequence.CRLF */);
            thisModel.applyEdits([editOperation_1.$ls.insert(new position_1.$js(1, 1), 'x')]);
            modelHasDecorations(thisModel, [
                { range: new range_1.$ks(1, 4, 4, 1), className: 'myType1' },
                { range: new range_1.$ks(1, 5, 4, 1), className: 'myType2' },
                { range: new range_1.$ks(1, 6, 4, 1), className: 'myType3' },
                { range: new range_1.$ks(1, 7, 4, 1), className: 'myType4' },
                { range: new range_1.$ks(1, 8, 4, 1), className: 'myType5' },
                { range: new range_1.$ks(1, 9, 4, 1), className: 'myType6' },
                { range: new range_1.$ks(1, 10, 4, 1), className: 'myType7' },
                { range: new range_1.$ks(1, 11, 4, 1), className: 'myType8' },
                { range: new range_1.$ks(1, 12, 4, 1), className: 'myType9' },
            ]);
        });
        test('an apparently simple edit', () => {
            addDecoration(thisModel, 1, 2, 4, 1, 'myType1');
            thisModel.applyEdits([editOperation_1.$ls.replace(new range_1.$ks(1, 14, 2, 1), 'x')]);
            modelHasDecorations(thisModel, [
                { range: new range_1.$ks(1, 2, 3, 1), className: 'myType1' },
            ]);
        });
        test('removeAllDecorationsWithOwnerId can be called after model dispose', () => {
            const model = (0, testTextModel_1.$O0b)('asd');
            model.dispose();
            model.removeAllDecorationsWithOwnerId(1);
        });
        test('removeAllDecorationsWithOwnerId works', () => {
            thisModel.deltaDecorations([], [{ range: new range_1.$ks(1, 2, 4, 1), options: { description: 'test', className: 'myType1' } }], 1);
            thisModel.removeAllDecorationsWithOwnerId(1);
            modelHasNoDecorations(thisModel);
        });
    });
    suite('Decorations and editing', () => {
        (0, utils_1.$bT)();
        function _runTest(decRange, stickiness, editRange, editText, editForceMoveMarkers, expectedDecRange, msg) {
            const model = (0, testTextModel_1.$O0b)([
                'My First Line',
                'My Second Line',
                'Third Line'
            ].join('\n'));
            const id = model.deltaDecorations([], [{ range: decRange, options: { description: 'test', stickiness: stickiness } }])[0];
            model.applyEdits([{
                    range: editRange,
                    text: editText,
                    forceMoveMarkers: editForceMoveMarkers
                }]);
            const actual = model.getDecorationRange(id);
            assert.deepStrictEqual(actual, expectedDecRange, msg);
            model.dispose();
        }
        function runTest(decRange, editRange, editText, expectedDecRange) {
            _runTest(decRange, 0, editRange, editText, false, expectedDecRange[0][0], 'no-0-AlwaysGrowsWhenTypingAtEdges');
            _runTest(decRange, 1, editRange, editText, false, expectedDecRange[0][1], 'no-1-NeverGrowsWhenTypingAtEdges');
            _runTest(decRange, 2, editRange, editText, false, expectedDecRange[0][2], 'no-2-GrowsOnlyWhenTypingBefore');
            _runTest(decRange, 3, editRange, editText, false, expectedDecRange[0][3], 'no-3-GrowsOnlyWhenTypingAfter');
            _runTest(decRange, 0, editRange, editText, true, expectedDecRange[1][0], 'force-0-AlwaysGrowsWhenTypingAtEdges');
            _runTest(decRange, 1, editRange, editText, true, expectedDecRange[1][1], 'force-1-NeverGrowsWhenTypingAtEdges');
            _runTest(decRange, 2, editRange, editText, true, expectedDecRange[1][2], 'force-2-GrowsOnlyWhenTypingBefore');
            _runTest(decRange, 3, editRange, editText, true, expectedDecRange[1][3], 'force-3-GrowsOnlyWhenTypingAfter');
        }
        suite('insert', () => {
            suite('collapsed dec', () => {
                test('before', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 3, 1, 3), 'xx', [
                        [new range_1.$ks(1, 6, 1, 6), new range_1.$ks(1, 6, 1, 6), new range_1.$ks(1, 6, 1, 6), new range_1.$ks(1, 6, 1, 6)],
                        [new range_1.$ks(1, 6, 1, 6), new range_1.$ks(1, 6, 1, 6), new range_1.$ks(1, 6, 1, 6), new range_1.$ks(1, 6, 1, 6)],
                    ]);
                });
                test('equal', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), 'xx', [
                        [new range_1.$ks(1, 4, 1, 6), new range_1.$ks(1, 6, 1, 6), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 6, 1, 6)],
                        [new range_1.$ks(1, 6, 1, 6), new range_1.$ks(1, 6, 1, 6), new range_1.$ks(1, 6, 1, 6), new range_1.$ks(1, 6, 1, 6)],
                    ]);
                });
                test('after', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 5, 1, 5), 'xx', [
                        [new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4)],
                        [new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4)],
                    ]);
                });
            });
            suite('non-collapsed dec', () => {
                test('before', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 3, 1, 3), 'xx', [
                        [new range_1.$ks(1, 6, 1, 11), new range_1.$ks(1, 6, 1, 11), new range_1.$ks(1, 6, 1, 11), new range_1.$ks(1, 6, 1, 11)],
                        [new range_1.$ks(1, 6, 1, 11), new range_1.$ks(1, 6, 1, 11), new range_1.$ks(1, 6, 1, 11), new range_1.$ks(1, 6, 1, 11)],
                    ]);
                });
                test('start', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 4), 'xx', [
                        [new range_1.$ks(1, 4, 1, 11), new range_1.$ks(1, 6, 1, 11), new range_1.$ks(1, 4, 1, 11), new range_1.$ks(1, 6, 1, 11)],
                        [new range_1.$ks(1, 6, 1, 11), new range_1.$ks(1, 6, 1, 11), new range_1.$ks(1, 6, 1, 11), new range_1.$ks(1, 6, 1, 11)],
                    ]);
                });
                test('inside', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 5, 1, 5), 'xx', [
                        [new range_1.$ks(1, 4, 1, 11), new range_1.$ks(1, 4, 1, 11), new range_1.$ks(1, 4, 1, 11), new range_1.$ks(1, 4, 1, 11)],
                        [new range_1.$ks(1, 4, 1, 11), new range_1.$ks(1, 4, 1, 11), new range_1.$ks(1, 4, 1, 11), new range_1.$ks(1, 4, 1, 11)],
                    ]);
                });
                test('end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 9, 1, 9), 'xx', [
                        [new range_1.$ks(1, 4, 1, 11), new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 11)],
                        [new range_1.$ks(1, 4, 1, 11), new range_1.$ks(1, 4, 1, 11), new range_1.$ks(1, 4, 1, 11), new range_1.$ks(1, 4, 1, 11)],
                    ]);
                });
                test('after', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 10, 1, 10), 'xx', [
                        [new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9)],
                        [new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9)],
                    ]);
                });
            });
        });
        suite('delete', () => {
            suite('collapsed dec', () => {
                test('edit.end < range.start', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 1, 1, 3), '', [
                        [new range_1.$ks(1, 2, 1, 2), new range_1.$ks(1, 2, 1, 2), new range_1.$ks(1, 2, 1, 2), new range_1.$ks(1, 2, 1, 2)],
                        [new range_1.$ks(1, 2, 1, 2), new range_1.$ks(1, 2, 1, 2), new range_1.$ks(1, 2, 1, 2), new range_1.$ks(1, 2, 1, 2)],
                    ]);
                });
                test('edit.end <= range.start', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 2, 1, 4), '', [
                        [new range_1.$ks(1, 2, 1, 2), new range_1.$ks(1, 2, 1, 2), new range_1.$ks(1, 2, 1, 2), new range_1.$ks(1, 2, 1, 2)],
                        [new range_1.$ks(1, 2, 1, 2), new range_1.$ks(1, 2, 1, 2), new range_1.$ks(1, 2, 1, 2), new range_1.$ks(1, 2, 1, 2)],
                    ]);
                });
                test('edit.start < range.start && edit.end > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 3, 1, 5), '', [
                        [new range_1.$ks(1, 3, 1, 3), new range_1.$ks(1, 3, 1, 3), new range_1.$ks(1, 3, 1, 3), new range_1.$ks(1, 3, 1, 3)],
                        [new range_1.$ks(1, 3, 1, 3), new range_1.$ks(1, 3, 1, 3), new range_1.$ks(1, 3, 1, 3), new range_1.$ks(1, 3, 1, 3)],
                    ]);
                });
                test('edit.start >= range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 6), '', [
                        [new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4)],
                        [new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4)],
                    ]);
                });
                test('edit.start > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 5, 1, 7), '', [
                        [new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4)],
                        [new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4)],
                    ]);
                });
            });
            suite('non-collapsed dec', () => {
                test('edit.end < range.start', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 1, 1, 3), '', [
                        [new range_1.$ks(1, 2, 1, 7), new range_1.$ks(1, 2, 1, 7), new range_1.$ks(1, 2, 1, 7), new range_1.$ks(1, 2, 1, 7)],
                        [new range_1.$ks(1, 2, 1, 7), new range_1.$ks(1, 2, 1, 7), new range_1.$ks(1, 2, 1, 7), new range_1.$ks(1, 2, 1, 7)],
                    ]);
                });
                test('edit.end <= range.start', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 2, 1, 4), '', [
                        [new range_1.$ks(1, 2, 1, 7), new range_1.$ks(1, 2, 1, 7), new range_1.$ks(1, 2, 1, 7), new range_1.$ks(1, 2, 1, 7)],
                        [new range_1.$ks(1, 2, 1, 7), new range_1.$ks(1, 2, 1, 7), new range_1.$ks(1, 2, 1, 7), new range_1.$ks(1, 2, 1, 7)],
                    ]);
                });
                test('edit.start < range.start && edit.end < range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 3, 1, 5), '', [
                        [new range_1.$ks(1, 3, 1, 7), new range_1.$ks(1, 3, 1, 7), new range_1.$ks(1, 3, 1, 7), new range_1.$ks(1, 3, 1, 7)],
                        [new range_1.$ks(1, 3, 1, 7), new range_1.$ks(1, 3, 1, 7), new range_1.$ks(1, 3, 1, 7), new range_1.$ks(1, 3, 1, 7)],
                    ]);
                });
                test('edit.start < range.start && edit.end == range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 3, 1, 9), '', [
                        [new range_1.$ks(1, 3, 1, 3), new range_1.$ks(1, 3, 1, 3), new range_1.$ks(1, 3, 1, 3), new range_1.$ks(1, 3, 1, 3)],
                        [new range_1.$ks(1, 3, 1, 3), new range_1.$ks(1, 3, 1, 3), new range_1.$ks(1, 3, 1, 3), new range_1.$ks(1, 3, 1, 3)],
                    ]);
                });
                test('edit.start < range.start && edit.end > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 3, 1, 10), '', [
                        [new range_1.$ks(1, 3, 1, 3), new range_1.$ks(1, 3, 1, 3), new range_1.$ks(1, 3, 1, 3), new range_1.$ks(1, 3, 1, 3)],
                        [new range_1.$ks(1, 3, 1, 3), new range_1.$ks(1, 3, 1, 3), new range_1.$ks(1, 3, 1, 3), new range_1.$ks(1, 3, 1, 3)],
                    ]);
                });
                test('edit.start == range.start && edit.end < range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 6), '', [
                        [new range_1.$ks(1, 4, 1, 7), new range_1.$ks(1, 4, 1, 7), new range_1.$ks(1, 4, 1, 7), new range_1.$ks(1, 4, 1, 7)],
                        [new range_1.$ks(1, 4, 1, 7), new range_1.$ks(1, 4, 1, 7), new range_1.$ks(1, 4, 1, 7), new range_1.$ks(1, 4, 1, 7)],
                    ]);
                });
                test('edit.start == range.start && edit.end == range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), '', [
                        [new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4)],
                        [new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4)],
                    ]);
                });
                test('edit.start == range.start && edit.end > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 10), '', [
                        [new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4)],
                        [new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4)],
                    ]);
                });
                test('edit.start > range.start && edit.start < range.end && edit.end < range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 5, 1, 7), '', [
                        [new range_1.$ks(1, 4, 1, 7), new range_1.$ks(1, 4, 1, 7), new range_1.$ks(1, 4, 1, 7), new range_1.$ks(1, 4, 1, 7)],
                        [new range_1.$ks(1, 4, 1, 7), new range_1.$ks(1, 4, 1, 7), new range_1.$ks(1, 4, 1, 7), new range_1.$ks(1, 4, 1, 7)],
                    ]);
                });
                test('edit.start > range.start && edit.start < range.end && edit.end == range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 5, 1, 9), '', [
                        [new range_1.$ks(1, 4, 1, 5), new range_1.$ks(1, 4, 1, 5), new range_1.$ks(1, 4, 1, 5), new range_1.$ks(1, 4, 1, 5)],
                        [new range_1.$ks(1, 4, 1, 5), new range_1.$ks(1, 4, 1, 5), new range_1.$ks(1, 4, 1, 5), new range_1.$ks(1, 4, 1, 5)],
                    ]);
                });
                test('edit.start > range.start && edit.start < range.end && edit.end > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 5, 1, 10), '', [
                        [new range_1.$ks(1, 4, 1, 5), new range_1.$ks(1, 4, 1, 5), new range_1.$ks(1, 4, 1, 5), new range_1.$ks(1, 4, 1, 5)],
                        [new range_1.$ks(1, 4, 1, 5), new range_1.$ks(1, 4, 1, 5), new range_1.$ks(1, 4, 1, 5), new range_1.$ks(1, 4, 1, 5)],
                    ]);
                });
                test('edit.start == range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 9, 1, 11), '', [
                        [new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9)],
                        [new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9)],
                    ]);
                });
                test('edit.start > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 10, 1, 11), '', [
                        [new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9)],
                        [new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9)],
                    ]);
                });
            });
        });
        suite('replace short', () => {
            suite('collapsed dec', () => {
                test('edit.end < range.start', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 1, 1, 3), 'c', [
                        [new range_1.$ks(1, 3, 1, 3), new range_1.$ks(1, 3, 1, 3), new range_1.$ks(1, 3, 1, 3), new range_1.$ks(1, 3, 1, 3)],
                        [new range_1.$ks(1, 3, 1, 3), new range_1.$ks(1, 3, 1, 3), new range_1.$ks(1, 3, 1, 3), new range_1.$ks(1, 3, 1, 3)],
                    ]);
                });
                test('edit.end <= range.start', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 2, 1, 4), 'c', [
                        [new range_1.$ks(1, 3, 1, 3), new range_1.$ks(1, 3, 1, 3), new range_1.$ks(1, 3, 1, 3), new range_1.$ks(1, 3, 1, 3)],
                        [new range_1.$ks(1, 3, 1, 3), new range_1.$ks(1, 3, 1, 3), new range_1.$ks(1, 3, 1, 3), new range_1.$ks(1, 3, 1, 3)],
                    ]);
                });
                test('edit.start < range.start && edit.end > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 3, 1, 5), 'c', [
                        [new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4)],
                        [new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4)],
                    ]);
                });
                test('edit.start >= range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 6), 'c', [
                        [new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4)],
                        [new range_1.$ks(1, 5, 1, 5), new range_1.$ks(1, 5, 1, 5), new range_1.$ks(1, 5, 1, 5), new range_1.$ks(1, 5, 1, 5)],
                    ]);
                });
                test('edit.start > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 5, 1, 7), 'c', [
                        [new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4)],
                        [new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4)],
                    ]);
                });
            });
            suite('non-collapsed dec', () => {
                test('edit.end < range.start', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 1, 1, 3), 'c', [
                        [new range_1.$ks(1, 3, 1, 8), new range_1.$ks(1, 3, 1, 8), new range_1.$ks(1, 3, 1, 8), new range_1.$ks(1, 3, 1, 8)],
                        [new range_1.$ks(1, 3, 1, 8), new range_1.$ks(1, 3, 1, 8), new range_1.$ks(1, 3, 1, 8), new range_1.$ks(1, 3, 1, 8)],
                    ]);
                });
                test('edit.end <= range.start', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 2, 1, 4), 'c', [
                        [new range_1.$ks(1, 3, 1, 8), new range_1.$ks(1, 3, 1, 8), new range_1.$ks(1, 3, 1, 8), new range_1.$ks(1, 3, 1, 8)],
                        [new range_1.$ks(1, 3, 1, 8), new range_1.$ks(1, 3, 1, 8), new range_1.$ks(1, 3, 1, 8), new range_1.$ks(1, 3, 1, 8)],
                    ]);
                });
                test('edit.start < range.start && edit.end < range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 3, 1, 5), 'c', [
                        [new range_1.$ks(1, 4, 1, 8), new range_1.$ks(1, 4, 1, 8), new range_1.$ks(1, 4, 1, 8), new range_1.$ks(1, 4, 1, 8)],
                        [new range_1.$ks(1, 4, 1, 8), new range_1.$ks(1, 4, 1, 8), new range_1.$ks(1, 4, 1, 8), new range_1.$ks(1, 4, 1, 8)],
                    ]);
                });
                test('edit.start < range.start && edit.end == range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 3, 1, 9), 'c', [
                        [new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4)],
                        [new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4)],
                    ]);
                });
                test('edit.start < range.start && edit.end > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 3, 1, 10), 'c', [
                        [new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4)],
                        [new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4)],
                    ]);
                });
                test('edit.start == range.start && edit.end < range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 6), 'c', [
                        [new range_1.$ks(1, 4, 1, 8), new range_1.$ks(1, 4, 1, 8), new range_1.$ks(1, 4, 1, 8), new range_1.$ks(1, 4, 1, 8)],
                        [new range_1.$ks(1, 5, 1, 8), new range_1.$ks(1, 5, 1, 8), new range_1.$ks(1, 5, 1, 8), new range_1.$ks(1, 5, 1, 8)],
                    ]);
                });
                test('edit.start == range.start && edit.end == range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), 'c', [
                        [new range_1.$ks(1, 4, 1, 5), new range_1.$ks(1, 4, 1, 5), new range_1.$ks(1, 4, 1, 5), new range_1.$ks(1, 4, 1, 5)],
                        [new range_1.$ks(1, 5, 1, 5), new range_1.$ks(1, 5, 1, 5), new range_1.$ks(1, 5, 1, 5), new range_1.$ks(1, 5, 1, 5)],
                    ]);
                });
                test('edit.start == range.start && edit.end > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 10), 'c', [
                        [new range_1.$ks(1, 4, 1, 5), new range_1.$ks(1, 4, 1, 5), new range_1.$ks(1, 4, 1, 5), new range_1.$ks(1, 4, 1, 5)],
                        [new range_1.$ks(1, 5, 1, 5), new range_1.$ks(1, 5, 1, 5), new range_1.$ks(1, 5, 1, 5), new range_1.$ks(1, 5, 1, 5)],
                    ]);
                });
                test('edit.start > range.start && edit.start < range.end && edit.end < range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 5, 1, 7), 'c', [
                        [new range_1.$ks(1, 4, 1, 8), new range_1.$ks(1, 4, 1, 8), new range_1.$ks(1, 4, 1, 8), new range_1.$ks(1, 4, 1, 8)],
                        [new range_1.$ks(1, 4, 1, 8), new range_1.$ks(1, 4, 1, 8), new range_1.$ks(1, 4, 1, 8), new range_1.$ks(1, 4, 1, 8)],
                    ]);
                });
                test('edit.start > range.start && edit.start < range.end && edit.end == range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 5, 1, 9), 'c', [
                        [new range_1.$ks(1, 4, 1, 6), new range_1.$ks(1, 4, 1, 6), new range_1.$ks(1, 4, 1, 6), new range_1.$ks(1, 4, 1, 6)],
                        [new range_1.$ks(1, 4, 1, 6), new range_1.$ks(1, 4, 1, 6), new range_1.$ks(1, 4, 1, 6), new range_1.$ks(1, 4, 1, 6)],
                    ]);
                });
                test('edit.start > range.start && edit.start < range.end && edit.end > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 5, 1, 10), 'c', [
                        [new range_1.$ks(1, 4, 1, 6), new range_1.$ks(1, 4, 1, 6), new range_1.$ks(1, 4, 1, 6), new range_1.$ks(1, 4, 1, 6)],
                        [new range_1.$ks(1, 4, 1, 6), new range_1.$ks(1, 4, 1, 6), new range_1.$ks(1, 4, 1, 6), new range_1.$ks(1, 4, 1, 6)],
                    ]);
                });
                test('edit.start == range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 9, 1, 11), 'c', [
                        [new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9)],
                        [new range_1.$ks(1, 4, 1, 10), new range_1.$ks(1, 4, 1, 10), new range_1.$ks(1, 4, 1, 10), new range_1.$ks(1, 4, 1, 10)],
                    ]);
                });
                test('edit.start > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 10, 1, 11), 'c', [
                        [new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9)],
                        [new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9)],
                    ]);
                });
            });
        });
        suite('replace long', () => {
            suite('collapsed dec', () => {
                test('edit.end < range.start', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 1, 1, 3), 'cccc', [
                        [new range_1.$ks(1, 6, 1, 6), new range_1.$ks(1, 6, 1, 6), new range_1.$ks(1, 6, 1, 6), new range_1.$ks(1, 6, 1, 6)],
                        [new range_1.$ks(1, 6, 1, 6), new range_1.$ks(1, 6, 1, 6), new range_1.$ks(1, 6, 1, 6), new range_1.$ks(1, 6, 1, 6)],
                    ]);
                });
                test('edit.end <= range.start', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 2, 1, 4), 'cccc', [
                        [new range_1.$ks(1, 4, 1, 6), new range_1.$ks(1, 6, 1, 6), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 6, 1, 6)],
                        [new range_1.$ks(1, 6, 1, 6), new range_1.$ks(1, 6, 1, 6), new range_1.$ks(1, 6, 1, 6), new range_1.$ks(1, 6, 1, 6)],
                    ]);
                });
                test('edit.start < range.start && edit.end > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 3, 1, 5), 'cccc', [
                        [new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4)],
                        [new range_1.$ks(1, 7, 1, 7), new range_1.$ks(1, 7, 1, 7), new range_1.$ks(1, 7, 1, 7), new range_1.$ks(1, 7, 1, 7)],
                    ]);
                });
                test('edit.start >= range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 6), 'cccc', [
                        [new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4)],
                        [new range_1.$ks(1, 8, 1, 8), new range_1.$ks(1, 8, 1, 8), new range_1.$ks(1, 8, 1, 8), new range_1.$ks(1, 8, 1, 8)],
                    ]);
                });
                test('edit.start > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 5, 1, 7), 'cccc', [
                        [new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4)],
                        [new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4), new range_1.$ks(1, 4, 1, 4)],
                    ]);
                });
            });
            suite('non-collapsed dec', () => {
                test('edit.end < range.start', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 1, 1, 3), 'cccc', [
                        [new range_1.$ks(1, 6, 1, 11), new range_1.$ks(1, 6, 1, 11), new range_1.$ks(1, 6, 1, 11), new range_1.$ks(1, 6, 1, 11)],
                        [new range_1.$ks(1, 6, 1, 11), new range_1.$ks(1, 6, 1, 11), new range_1.$ks(1, 6, 1, 11), new range_1.$ks(1, 6, 1, 11)],
                    ]);
                });
                test('edit.end <= range.start', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 2, 1, 4), 'cccc', [
                        [new range_1.$ks(1, 4, 1, 11), new range_1.$ks(1, 6, 1, 11), new range_1.$ks(1, 4, 1, 11), new range_1.$ks(1, 6, 1, 11)],
                        [new range_1.$ks(1, 6, 1, 11), new range_1.$ks(1, 6, 1, 11), new range_1.$ks(1, 6, 1, 11), new range_1.$ks(1, 6, 1, 11)],
                    ]);
                });
                test('edit.start < range.start && edit.end < range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 3, 1, 5), 'cccc', [
                        [new range_1.$ks(1, 4, 1, 11), new range_1.$ks(1, 4, 1, 11), new range_1.$ks(1, 4, 1, 11), new range_1.$ks(1, 4, 1, 11)],
                        [new range_1.$ks(1, 7, 1, 11), new range_1.$ks(1, 7, 1, 11), new range_1.$ks(1, 7, 1, 11), new range_1.$ks(1, 7, 1, 11)],
                    ]);
                });
                test('edit.start < range.start && edit.end == range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 3, 1, 9), 'cccc', [
                        [new range_1.$ks(1, 4, 1, 7), new range_1.$ks(1, 4, 1, 7), new range_1.$ks(1, 4, 1, 7), new range_1.$ks(1, 4, 1, 7)],
                        [new range_1.$ks(1, 7, 1, 7), new range_1.$ks(1, 7, 1, 7), new range_1.$ks(1, 7, 1, 7), new range_1.$ks(1, 7, 1, 7)],
                    ]);
                });
                test('edit.start < range.start && edit.end > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 3, 1, 10), 'cccc', [
                        [new range_1.$ks(1, 4, 1, 7), new range_1.$ks(1, 4, 1, 7), new range_1.$ks(1, 4, 1, 7), new range_1.$ks(1, 4, 1, 7)],
                        [new range_1.$ks(1, 7, 1, 7), new range_1.$ks(1, 7, 1, 7), new range_1.$ks(1, 7, 1, 7), new range_1.$ks(1, 7, 1, 7)],
                    ]);
                });
                test('edit.start == range.start && edit.end < range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 6), 'cccc', [
                        [new range_1.$ks(1, 4, 1, 11), new range_1.$ks(1, 4, 1, 11), new range_1.$ks(1, 4, 1, 11), new range_1.$ks(1, 4, 1, 11)],
                        [new range_1.$ks(1, 8, 1, 11), new range_1.$ks(1, 8, 1, 11), new range_1.$ks(1, 8, 1, 11), new range_1.$ks(1, 8, 1, 11)],
                    ]);
                });
                test('edit.start == range.start && edit.end == range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), 'cccc', [
                        [new range_1.$ks(1, 4, 1, 8), new range_1.$ks(1, 4, 1, 8), new range_1.$ks(1, 4, 1, 8), new range_1.$ks(1, 4, 1, 8)],
                        [new range_1.$ks(1, 8, 1, 8), new range_1.$ks(1, 8, 1, 8), new range_1.$ks(1, 8, 1, 8), new range_1.$ks(1, 8, 1, 8)],
                    ]);
                });
                test('edit.start == range.start && edit.end > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 10), 'cccc', [
                        [new range_1.$ks(1, 4, 1, 8), new range_1.$ks(1, 4, 1, 8), new range_1.$ks(1, 4, 1, 8), new range_1.$ks(1, 4, 1, 8)],
                        [new range_1.$ks(1, 8, 1, 8), new range_1.$ks(1, 8, 1, 8), new range_1.$ks(1, 8, 1, 8), new range_1.$ks(1, 8, 1, 8)],
                    ]);
                });
                test('edit.start > range.start && edit.start < range.end && edit.end < range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 5, 1, 7), 'cccc', [
                        [new range_1.$ks(1, 4, 1, 11), new range_1.$ks(1, 4, 1, 11), new range_1.$ks(1, 4, 1, 11), new range_1.$ks(1, 4, 1, 11)],
                        [new range_1.$ks(1, 4, 1, 11), new range_1.$ks(1, 4, 1, 11), new range_1.$ks(1, 4, 1, 11), new range_1.$ks(1, 4, 1, 11)],
                    ]);
                });
                test('edit.start > range.start && edit.start < range.end && edit.end == range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 5, 1, 9), 'cccc', [
                        [new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9)],
                        [new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9)],
                    ]);
                });
                test('edit.start > range.start && edit.start < range.end && edit.end > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 5, 1, 10), 'cccc', [
                        [new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9)],
                        [new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9)],
                    ]);
                });
                test('edit.start == range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 9, 1, 11), 'cccc', [
                        [new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9)],
                        [new range_1.$ks(1, 4, 1, 13), new range_1.$ks(1, 4, 1, 13), new range_1.$ks(1, 4, 1, 13), new range_1.$ks(1, 4, 1, 13)],
                    ]);
                });
                test('edit.start > range.end', () => {
                    runTest(new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 10, 1, 11), 'cccc', [
                        [new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9)],
                        [new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9), new range_1.$ks(1, 4, 1, 9)],
                    ]);
                });
            });
        });
    });
    suite('deltaDecorations', () => {
        (0, utils_1.$bT)();
        function decoration(id, startLineNumber, startColumn, endLineNumber, endColum) {
            return {
                id: id,
                range: new range_1.$ks(startLineNumber, startColumn, endLineNumber, endColum)
            };
        }
        function toModelDeltaDecoration(dec) {
            return {
                range: dec.range,
                options: {
                    description: 'test',
                    className: dec.id
                }
            };
        }
        function strcmp(a, b) {
            if (a === b) {
                return 0;
            }
            if (a < b) {
                return -1;
            }
            return 1;
        }
        function readModelDecorations(model, ids) {
            return ids.map((id) => {
                return {
                    range: model.getDecorationRange(id),
                    id: model.getDecorationOptions(id).className
                };
            });
        }
        function testDeltaDecorations(text, decorations, newDecorations) {
            const model = (0, testTextModel_1.$O0b)(text.join('\n'));
            // Add initial decorations & assert they are added
            const initialIds = model.deltaDecorations([], decorations.map(toModelDeltaDecoration));
            const actualDecorations = readModelDecorations(model, initialIds);
            assert.strictEqual(initialIds.length, decorations.length, 'returns expected cnt of ids');
            assert.strictEqual(initialIds.length, model.getAllDecorations().length, 'does not leak decorations');
            actualDecorations.sort((a, b) => strcmp(a.id, b.id));
            decorations.sort((a, b) => strcmp(a.id, b.id));
            assert.deepStrictEqual(actualDecorations, decorations);
            const newIds = model.deltaDecorations(initialIds, newDecorations.map(toModelDeltaDecoration));
            const actualNewDecorations = readModelDecorations(model, newIds);
            assert.strictEqual(newIds.length, newDecorations.length, 'returns expected cnt of ids');
            assert.strictEqual(newIds.length, model.getAllDecorations().length, 'does not leak decorations');
            actualNewDecorations.sort((a, b) => strcmp(a.id, b.id));
            newDecorations.sort((a, b) => strcmp(a.id, b.id));
            assert.deepStrictEqual(actualDecorations, decorations);
            model.dispose();
        }
        function range(startLineNumber, startColumn, endLineNumber, endColumn) {
            return new range_1.$ks(startLineNumber, startColumn, endLineNumber, endColumn);
        }
        test('result respects input', () => {
            const model = (0, testTextModel_1.$O0b)([
                'Hello world,',
                'How are you?'
            ].join('\n'));
            const ids = model.deltaDecorations([], [
                toModelDeltaDecoration(decoration('a', 1, 1, 1, 12)),
                toModelDeltaDecoration(decoration('b', 2, 1, 2, 13))
            ]);
            assert.deepStrictEqual(model.getDecorationRange(ids[0]), range(1, 1, 1, 12));
            assert.deepStrictEqual(model.getDecorationRange(ids[1]), range(2, 1, 2, 13));
            model.dispose();
        });
        test('deltaDecorations 1', () => {
            testDeltaDecorations([
                'This is a text',
                'That has multiple lines',
                'And is very friendly',
                'Towards testing'
            ], [
                decoration('a', 1, 1, 1, 2),
                decoration('b', 1, 1, 1, 15),
                decoration('c', 1, 1, 2, 1),
                decoration('d', 1, 1, 2, 24),
                decoration('e', 2, 1, 2, 24),
                decoration('f', 2, 1, 4, 16)
            ], [
                decoration('x', 1, 1, 1, 2),
                decoration('b', 1, 1, 1, 15),
                decoration('c', 1, 1, 2, 1),
                decoration('d', 1, 1, 2, 24),
                decoration('e', 2, 1, 2, 21),
                decoration('f', 2, 17, 4, 16)
            ]);
        });
        test('deltaDecorations 2', () => {
            testDeltaDecorations([
                'This is a text',
                'That has multiple lines',
                'And is very friendly',
                'Towards testing'
            ], [
                decoration('a', 1, 1, 1, 2),
                decoration('b', 1, 2, 1, 3),
                decoration('c', 1, 3, 1, 4),
                decoration('d', 1, 4, 1, 5),
                decoration('e', 1, 5, 1, 6)
            ], [
                decoration('a', 1, 2, 1, 3),
                decoration('b', 1, 3, 1, 4),
                decoration('c', 1, 4, 1, 5),
                decoration('d', 1, 5, 1, 6)
            ]);
        });
        test('deltaDecorations 3', () => {
            testDeltaDecorations([
                'This is a text',
                'That has multiple lines',
                'And is very friendly',
                'Towards testing'
            ], [
                decoration('a', 1, 1, 1, 2),
                decoration('b', 1, 2, 1, 3),
                decoration('c', 1, 3, 1, 4),
                decoration('d', 1, 4, 1, 5),
                decoration('e', 1, 5, 1, 6)
            ], []);
        });
        test('issue #4317: editor.setDecorations doesn\'t update the hover message', () => {
            const model = (0, testTextModel_1.$O0b)('Hello world!');
            let ids = model.deltaDecorations([], [{
                    range: {
                        startLineNumber: 1,
                        startColumn: 1,
                        endLineNumber: 100,
                        endColumn: 1
                    },
                    options: {
                        description: 'test',
                        hoverMessage: { value: 'hello1' }
                    }
                }]);
            ids = model.deltaDecorations(ids, [{
                    range: {
                        startLineNumber: 1,
                        startColumn: 1,
                        endLineNumber: 100,
                        endColumn: 1
                    },
                    options: {
                        description: 'test',
                        hoverMessage: { value: 'hello2' }
                    }
                }]);
            const actualDecoration = model.getDecorationOptions(ids[0]);
            assert.deepStrictEqual(actualDecoration.hoverMessage, { value: 'hello2' });
            model.dispose();
        });
        test('model doesn\'t get confused with individual tracked ranges', () => {
            const model = (0, testTextModel_1.$O0b)([
                'Hello world,',
                'How are you?'
            ].join('\n'));
            const trackedRangeId = model.changeDecorations((changeAcessor) => {
                return changeAcessor.addDecoration({
                    startLineNumber: 1,
                    startColumn: 1,
                    endLineNumber: 1,
                    endColumn: 1
                }, {
                    description: 'test',
                    stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */
                });
            });
            model.changeDecorations((changeAccessor) => {
                changeAccessor.removeDecoration(trackedRangeId);
            });
            let ids = model.deltaDecorations([], [
                toModelDeltaDecoration(decoration('a', 1, 1, 1, 12)),
                toModelDeltaDecoration(decoration('b', 2, 1, 2, 13))
            ]);
            assert.deepStrictEqual(model.getDecorationRange(ids[0]), range(1, 1, 1, 12));
            assert.deepStrictEqual(model.getDecorationRange(ids[1]), range(2, 1, 2, 13));
            ids = model.deltaDecorations(ids, [
                toModelDeltaDecoration(decoration('a', 1, 1, 1, 12)),
                toModelDeltaDecoration(decoration('b', 2, 1, 2, 13))
            ]);
            assert.deepStrictEqual(model.getDecorationRange(ids[0]), range(1, 1, 1, 12));
            assert.deepStrictEqual(model.getDecorationRange(ids[1]), range(2, 1, 2, 13));
            model.dispose();
        });
        test('issue #16922: Clicking on link doesn\'t seem to do anything', () => {
            const model = (0, testTextModel_1.$O0b)([
                'Hello world,',
                'How are you?',
                'Fine.',
                'Good.',
            ].join('\n'));
            model.deltaDecorations([], [
                { range: new range_1.$ks(1, 1, 1, 1), options: { description: 'test', className: '1' } },
                { range: new range_1.$ks(1, 13, 1, 13), options: { description: 'test', className: '2' } },
                { range: new range_1.$ks(2, 1, 2, 1), options: { description: 'test', className: '3' } },
                { range: new range_1.$ks(2, 1, 2, 4), options: { description: 'test', className: '4' } },
                { range: new range_1.$ks(2, 8, 2, 13), options: { description: 'test', className: '5' } },
                { range: new range_1.$ks(3, 1, 4, 6), options: { description: 'test', className: '6' } },
                { range: new range_1.$ks(1, 1, 3, 6), options: { description: 'test', className: 'x1' } },
                { range: new range_1.$ks(2, 5, 2, 8), options: { description: 'test', className: 'x2' } },
                { range: new range_1.$ks(1, 1, 2, 8), options: { description: 'test', className: 'x3' } },
                { range: new range_1.$ks(2, 5, 3, 1), options: { description: 'test', className: 'x4' } },
            ]);
            const inRange = model.getDecorationsInRange(new range_1.$ks(2, 6, 2, 6));
            const inRangeClassNames = inRange.map(d => d.options.className);
            inRangeClassNames.sort();
            assert.deepStrictEqual(inRangeClassNames, ['x1', 'x2', 'x3', 'x4']);
            model.dispose();
        });
        test('issue #41492: URL highlighting persists after pasting over url', () => {
            const model = (0, testTextModel_1.$O0b)([
                'My First Line'
            ].join('\n'));
            const id = model.deltaDecorations([], [{ range: new range_1.$ks(1, 2, 1, 14), options: { description: 'test', stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */, collapseOnReplaceEdit: true } }])[0];
            model.applyEdits([{
                    range: new range_1.$ks(1, 1, 1, 14),
                    text: 'Some new text that is longer than the previous one',
                    forceMoveMarkers: false
                }]);
            const actual = model.getDecorationRange(id);
            assert.deepStrictEqual(actual, new range_1.$ks(1, 1, 1, 1));
            model.dispose();
        });
    });
});
//# sourceMappingURL=modelDecorations.test.js.map