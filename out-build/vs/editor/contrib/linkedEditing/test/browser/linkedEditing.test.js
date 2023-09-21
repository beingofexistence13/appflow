/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/base/test/common/timeTravelScheduler", "vs/base/test/common/utils", "vs/editor/browser/coreCommands", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/wordHelper", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/linesOperations/browser/linesOperations", "vs/editor/contrib/linkedEditing/browser/linkedEditing", "vs/editor/contrib/wordOperations/browser/wordOperations", "vs/editor/test/browser/testCodeEditor", "vs/editor/test/common/testTextModel"], function (require, exports, assert, lifecycle_1, uri_1, timeTravelScheduler_1, utils_1, coreCommands_1, position_1, range_1, wordHelper_1, languageConfigurationRegistry_1, languageFeatures_1, linesOperations_1, linkedEditing_1, wordOperations_1, testCodeEditor_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const mockFile = uri_1.URI.parse('test:somefile.ttt');
    const mockFileSelector = { scheme: 'test' };
    const timeout = 30;
    const languageId = 'linkedEditingTestLangage';
    suite('linked editing', () => {
        let disposables;
        let instantiationService;
        let languageFeaturesService;
        let languageConfigurationService;
        setup(() => {
            disposables = new lifecycle_1.$jc();
            instantiationService = (0, testCodeEditor_1.$Z0b)(disposables);
            languageFeaturesService = instantiationService.get(languageFeatures_1.$hF);
            languageConfigurationService = instantiationService.get(languageConfigurationRegistry_1.$2t);
            disposables.add(languageConfigurationService.register(languageId, {
                wordPattern: /[a-zA-Z]+/
            }));
        });
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.$bT)();
        function createMockEditor(text) {
            const model = disposables.add((0, testTextModel_1.$P0b)(instantiationService, typeof text === 'string' ? text : text.join('\n'), languageId, undefined, mockFile));
            const editor = disposables.add((0, testCodeEditor_1.$20b)(instantiationService, model));
            return editor;
        }
        function testCase(name, initialState, operations, expectedEndText) {
            test(name, async () => {
                await (0, timeTravelScheduler_1.$kT)({}, async () => {
                    disposables.add(languageFeaturesService.linkedEditingRangeProvider.register(mockFileSelector, {
                        provideLinkedEditingRanges(model, pos) {
                            const wordAtPos = model.getWordAtPosition(pos);
                            if (wordAtPos) {
                                const matches = model.findMatches(wordAtPos.word, false, false, true, wordHelper_1.$Vr, false);
                                return { ranges: matches.map(m => m.range), wordPattern: initialState.responseWordPattern };
                            }
                            return { ranges: [], wordPattern: initialState.responseWordPattern };
                        }
                    }));
                    const editor = createMockEditor(initialState.text);
                    editor.updateOptions({ linkedEditing: true });
                    const linkedEditingContribution = disposables.add(editor.registerAndInstantiateContribution(linkedEditing_1.$X9.ID, linkedEditing_1.$X9));
                    linkedEditingContribution.setDebounceDuration(0);
                    const testEditor = {
                        setPosition(pos) {
                            editor.setPosition(pos);
                            return linkedEditingContribution.currentUpdateTriggerPromise;
                        },
                        setSelection(sel) {
                            editor.setSelection(sel);
                            return linkedEditingContribution.currentUpdateTriggerPromise;
                        },
                        trigger(source, handlerId, payload) {
                            if (handlerId === "type" /* Handler.Type */ || handlerId === "paste" /* Handler.Paste */) {
                                editor.trigger(source, handlerId, payload);
                            }
                            else if (handlerId === 'deleteLeft') {
                                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, payload);
                            }
                            else if (handlerId === 'deleteWordLeft') {
                                instantiationService.invokeFunction((accessor) => (new wordOperations_1.$E$()).runEditorCommand(accessor, editor, payload));
                            }
                            else if (handlerId === 'deleteAllLeft') {
                                instantiationService.invokeFunction((accessor) => (new linesOperations_1.$L9()).runEditorCommand(accessor, editor, payload));
                            }
                            else {
                                throw new Error(`Unknown handler ${handlerId}!`);
                            }
                            return linkedEditingContribution.currentSyncTriggerPromise;
                        },
                        undo() {
                            coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                        },
                        redo() {
                            coreCommands_1.CoreEditingCommands.Redo.runEditorCommand(null, editor, null);
                        }
                    };
                    await operations(testEditor);
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            if (typeof expectedEndText === 'string') {
                                assert.strictEqual(editor.getModel().getValue(), expectedEndText);
                            }
                            else {
                                assert.strictEqual(editor.getModel().getValue(), expectedEndText.join('\n'));
                            }
                            resolve();
                        }, timeout);
                    });
                });
            });
        }
        const state = {
            text: '<ooo></ooo>'
        };
        /**
         * Simple insertion
         */
        testCase('Simple insert - initial', state, async (editor) => {
            const pos = new position_1.$js(1, 2);
            await editor.setPosition(pos);
            await editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'i' });
        }, '<iooo></iooo>');
        testCase('Simple insert - middle', state, async (editor) => {
            const pos = new position_1.$js(1, 3);
            await editor.setPosition(pos);
            await editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'i' });
        }, '<oioo></oioo>');
        testCase('Simple insert - end', state, async (editor) => {
            const pos = new position_1.$js(1, 5);
            await editor.setPosition(pos);
            await editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'i' });
        }, '<oooi></oooi>');
        /**
         * Simple insertion - end
         */
        testCase('Simple insert end - initial', state, async (editor) => {
            const pos = new position_1.$js(1, 8);
            await editor.setPosition(pos);
            await editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'i' });
        }, '<iooo></iooo>');
        testCase('Simple insert end - middle', state, async (editor) => {
            const pos = new position_1.$js(1, 9);
            await editor.setPosition(pos);
            await editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'i' });
        }, '<oioo></oioo>');
        testCase('Simple insert end - end', state, async (editor) => {
            const pos = new position_1.$js(1, 11);
            await editor.setPosition(pos);
            await editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'i' });
        }, '<oooi></oooi>');
        /**
         * Boundary insertion
         */
        testCase('Simple insert - out of boundary', state, async (editor) => {
            const pos = new position_1.$js(1, 1);
            await editor.setPosition(pos);
            await editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'i' });
        }, 'i<ooo></ooo>');
        testCase('Simple insert - out of boundary 2', state, async (editor) => {
            const pos = new position_1.$js(1, 6);
            await editor.setPosition(pos);
            await editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'i' });
        }, '<ooo>i</ooo>');
        testCase('Simple insert - out of boundary 3', state, async (editor) => {
            const pos = new position_1.$js(1, 7);
            await editor.setPosition(pos);
            await editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'i' });
        }, '<ooo><i/ooo>');
        testCase('Simple insert - out of boundary 4', state, async (editor) => {
            const pos = new position_1.$js(1, 12);
            await editor.setPosition(pos);
            await editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'i' });
        }, '<ooo></ooo>i');
        /**
         * Insert + Move
         */
        testCase('Continuous insert', state, async (editor) => {
            const pos = new position_1.$js(1, 2);
            await editor.setPosition(pos);
            await editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'i' });
            await editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'i' });
        }, '<iiooo></iiooo>');
        testCase('Insert - move - insert', state, async (editor) => {
            const pos = new position_1.$js(1, 2);
            await editor.setPosition(pos);
            await editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'i' });
            await editor.setPosition(new position_1.$js(1, 4));
            await editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'i' });
        }, '<ioioo></ioioo>');
        testCase('Insert - move - insert outside region', state, async (editor) => {
            const pos = new position_1.$js(1, 2);
            await editor.setPosition(pos);
            await editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'i' });
            await editor.setPosition(new position_1.$js(1, 7));
            await editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'i' });
        }, '<iooo>i</iooo>');
        /**
         * Selection insert
         */
        testCase('Selection insert - simple', state, async (editor) => {
            const pos = new position_1.$js(1, 2);
            await editor.setPosition(pos);
            await editor.setSelection(new range_1.$ks(1, 2, 1, 3));
            await editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'i' });
        }, '<ioo></ioo>');
        testCase('Selection insert - whole', state, async (editor) => {
            const pos = new position_1.$js(1, 2);
            await editor.setPosition(pos);
            await editor.setSelection(new range_1.$ks(1, 2, 1, 5));
            await editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'i' });
        }, '<i></i>');
        testCase('Selection insert - across boundary', state, async (editor) => {
            const pos = new position_1.$js(1, 2);
            await editor.setPosition(pos);
            await editor.setSelection(new range_1.$ks(1, 1, 1, 3));
            await editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'i' });
        }, 'ioo></oo>');
        /**
         * @todo
         * Undefined behavior
         */
        // testCase('Selection insert - across two boundary', state, async (editor) => {
        // 	const pos = new Position(1, 2);
        // 	await editor.setPosition(pos);
        // 	await linkedEditingContribution.updateLinkedUI(pos);
        // 	await editor.setSelection(new Range(1, 4, 1, 9));
        // 	await editor.trigger('keyboard', Handler.Type, { text: 'i' });
        // }, '<ooioo>');
        /**
         * Break out behavior
         */
        testCase('Breakout - type space', state, async (editor) => {
            const pos = new position_1.$js(1, 5);
            await editor.setPosition(pos);
            await editor.trigger('keyboard', "type" /* Handler.Type */, { text: ' ' });
        }, '<ooo ></ooo>');
        testCase('Breakout - type space then undo', state, async (editor) => {
            const pos = new position_1.$js(1, 5);
            await editor.setPosition(pos);
            await editor.trigger('keyboard', "type" /* Handler.Type */, { text: ' ' });
            editor.undo();
        }, '<ooo></ooo>');
        testCase('Breakout - type space in middle', state, async (editor) => {
            const pos = new position_1.$js(1, 4);
            await editor.setPosition(pos);
            await editor.trigger('keyboard', "type" /* Handler.Type */, { text: ' ' });
        }, '<oo o></ooo>');
        testCase('Breakout - paste content starting with space', state, async (editor) => {
            const pos = new position_1.$js(1, 5);
            await editor.setPosition(pos);
            await editor.trigger('keyboard', "paste" /* Handler.Paste */, { text: ' i="i"' });
        }, '<ooo i="i"></ooo>');
        testCase('Breakout - paste content starting with space then undo', state, async (editor) => {
            const pos = new position_1.$js(1, 5);
            await editor.setPosition(pos);
            await editor.trigger('keyboard', "paste" /* Handler.Paste */, { text: ' i="i"' });
            editor.undo();
        }, '<ooo></ooo>');
        testCase('Breakout - paste content starting with space in middle', state, async (editor) => {
            const pos = new position_1.$js(1, 4);
            await editor.setPosition(pos);
            await editor.trigger('keyboard', "paste" /* Handler.Paste */, { text: ' i' });
        }, '<oo io></ooo>');
        /**
         * Break out with custom provider wordPattern
         */
        const state3 = {
            ...state,
            responseWordPattern: /[a-yA-Y]+/
        };
        testCase('Breakout with stop pattern - insert', state3, async (editor) => {
            const pos = new position_1.$js(1, 2);
            await editor.setPosition(pos);
            await editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'i' });
        }, '<iooo></iooo>');
        testCase('Breakout with stop pattern - insert stop char', state3, async (editor) => {
            const pos = new position_1.$js(1, 2);
            await editor.setPosition(pos);
            await editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'z' });
        }, '<zooo></ooo>');
        testCase('Breakout with stop pattern - paste char', state3, async (editor) => {
            const pos = new position_1.$js(1, 2);
            await editor.setPosition(pos);
            await editor.trigger('keyboard', "paste" /* Handler.Paste */, { text: 'z' });
        }, '<zooo></ooo>');
        testCase('Breakout with stop pattern - paste string', state3, async (editor) => {
            const pos = new position_1.$js(1, 2);
            await editor.setPosition(pos);
            await editor.trigger('keyboard', "paste" /* Handler.Paste */, { text: 'zo' });
        }, '<zoooo></ooo>');
        testCase('Breakout with stop pattern - insert at end', state3, async (editor) => {
            const pos = new position_1.$js(1, 5);
            await editor.setPosition(pos);
            await editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'z' });
        }, '<oooz></ooo>');
        const state4 = {
            ...state,
            responseWordPattern: /[a-eA-E]+/
        };
        testCase('Breakout with stop pattern - insert stop char, respos', state4, async (editor) => {
            const pos = new position_1.$js(1, 2);
            await editor.setPosition(pos);
            await editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'i' });
        }, '<iooo></ooo>');
        /**
         * Delete
         */
        testCase('Delete - left char', state, async (editor) => {
            const pos = new position_1.$js(1, 5);
            await editor.setPosition(pos);
            await editor.trigger('keyboard', 'deleteLeft', {});
        }, '<oo></oo>');
        testCase('Delete - left char then undo', state, async (editor) => {
            const pos = new position_1.$js(1, 5);
            await editor.setPosition(pos);
            await editor.trigger('keyboard', 'deleteLeft', {});
            editor.undo();
        }, '<ooo></ooo>');
        testCase('Delete - left word', state, async (editor) => {
            const pos = new position_1.$js(1, 5);
            await editor.setPosition(pos);
            await editor.trigger('keyboard', 'deleteWordLeft', {});
        }, '<></>');
        testCase('Delete - left word then undo', state, async (editor) => {
            const pos = new position_1.$js(1, 5);
            await editor.setPosition(pos);
            await editor.trigger('keyboard', 'deleteWordLeft', {});
            editor.undo();
            editor.undo();
        }, '<ooo></ooo>');
        /**
         * Todo: Fix test
         */
        // testCase('Delete - left all', state, async (editor) => {
        // 	const pos = new Position(1, 3);
        // 	await editor.setPosition(pos);
        // 	await linkedEditingContribution.updateLinkedUI(pos);
        // 	await editor.trigger('keyboard', 'deleteAllLeft', {});
        // }, '></>');
        /**
         * Todo: Fix test
         */
        // testCase('Delete - left all then undo', state, async (editor) => {
        // 	const pos = new Position(1, 5);
        // 	await editor.setPosition(pos);
        // 	await linkedEditingContribution.updateLinkedUI(pos);
        // 	await editor.trigger('keyboard', 'deleteAllLeft', {});
        // 	editor.undo();
        // }, '></ooo>');
        testCase('Delete - left all then undo twice', state, async (editor) => {
            const pos = new position_1.$js(1, 5);
            await editor.setPosition(pos);
            await editor.trigger('keyboard', 'deleteAllLeft', {});
            editor.undo();
            editor.undo();
        }, '<ooo></ooo>');
        testCase('Delete - selection', state, async (editor) => {
            const pos = new position_1.$js(1, 5);
            await editor.setPosition(pos);
            await editor.setSelection(new range_1.$ks(1, 2, 1, 3));
            await editor.trigger('keyboard', 'deleteLeft', {});
        }, '<oo></oo>');
        testCase('Delete - selection across boundary', state, async (editor) => {
            const pos = new position_1.$js(1, 3);
            await editor.setPosition(pos);
            await editor.setSelection(new range_1.$ks(1, 1, 1, 3));
            await editor.trigger('keyboard', 'deleteLeft', {});
        }, 'oo></oo>');
        /**
         * Undo / redo
         */
        testCase('Undo/redo - simple undo', state, async (editor) => {
            const pos = new position_1.$js(1, 2);
            await editor.setPosition(pos);
            await editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'i' });
            editor.undo();
            editor.undo();
        }, '<ooo></ooo>');
        testCase('Undo/redo - simple undo/redo', state, async (editor) => {
            const pos = new position_1.$js(1, 2);
            await editor.setPosition(pos);
            await editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'i' });
            editor.undo();
            editor.redo();
        }, '<iooo></iooo>');
        /**
         * Multi line
         */
        const state2 = {
            text: [
                '<ooo>',
                '</ooo>'
            ]
        };
        testCase('Multiline insert', state2, async (editor) => {
            const pos = new position_1.$js(1, 2);
            await editor.setPosition(pos);
            await editor.trigger('keyboard', "type" /* Handler.Type */, { text: 'i' });
        }, [
            '<iooo>',
            '</iooo>'
        ]);
    });
});
//# sourceMappingURL=linkedEditing.test.js.map