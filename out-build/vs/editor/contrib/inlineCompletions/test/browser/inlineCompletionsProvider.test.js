/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/test/common/timeTravelScheduler", "vs/base/test/common/utils", "vs/editor/common/core/range", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/languageFeaturesService", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionsController", "vs/editor/contrib/inlineCompletions/browser/singleTextEdit", "vs/editor/contrib/inlineCompletions/test/browser/utils", "vs/editor/test/browser/testCodeEditor", "vs/editor/test/common/testTextModel", "vs/platform/audioCues/browser/audioCueService", "vs/platform/instantiation/common/serviceCollection"], function (require, exports, assert, async_1, lifecycle_1, timeTravelScheduler_1, utils_1, range_1, languageFeatures_1, languageFeaturesService_1, inlineCompletionsController_1, singleTextEdit_1, utils_2, testCodeEditor_1, testTextModel_1, audioCueService_1, serviceCollection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Inline Completions', () => {
        (0, utils_1.$bT)();
        suite('inlineCompletionToGhostText', () => {
            function getOutput(text, suggestion) {
                const rangeStartOffset = text.indexOf('[');
                const rangeEndOffset = text.indexOf(']') - 1;
                const cleanedText = text.replace('[', '').replace(']', '');
                const tempModel = (0, testTextModel_1.$O0b)(cleanedText);
                const range = range_1.$ks.fromPositions(tempModel.getPositionAt(rangeStartOffset), tempModel.getPositionAt(rangeEndOffset));
                const options = ['prefix', 'subword'];
                const result = {};
                for (const option of options) {
                    result[option] = new singleTextEdit_1.$v5(range, suggestion).computeGhostText(tempModel, option)?.render(cleanedText, true);
                }
                tempModel.dispose();
                if (new Set(Object.values(result)).size === 1) {
                    return Object.values(result)[0];
                }
                return result;
            }
            test('Basic', () => {
                assert.deepStrictEqual(getOutput('[foo]baz', 'foobar'), 'foo[bar]baz');
                assert.deepStrictEqual(getOutput('[aaa]aaa', 'aaaaaa'), 'aaa[aaa]aaa');
                assert.deepStrictEqual(getOutput('[foo]baz', 'boobar'), undefined);
                assert.deepStrictEqual(getOutput('[foo]foo', 'foofoo'), 'foo[foo]foo');
                assert.deepStrictEqual(getOutput('foo[]', 'bar\nhello'), 'foo[bar\nhello]');
            });
            test('Empty ghost text', () => {
                assert.deepStrictEqual(getOutput('[foo]', 'foo'), 'foo');
            });
            test('Whitespace (indentation)', () => {
                assert.deepStrictEqual(getOutput('[ foo]', 'foobar'), ' foo[bar]');
                assert.deepStrictEqual(getOutput('[\tfoo]', 'foobar'), '\tfoo[bar]');
                assert.deepStrictEqual(getOutput('[\t foo]', '\tfoobar'), '	 foo[bar]');
                assert.deepStrictEqual(getOutput('[\tfoo]', '\t\tfoobar'), { prefix: undefined, subword: '\t[\t]foo[bar]' });
                assert.deepStrictEqual(getOutput('[\t]', '\t\tfoobar'), '\t[\tfoobar]');
                assert.deepStrictEqual(getOutput('\t[]', '\t'), '\t[\t]');
                assert.deepStrictEqual(getOutput('\t[\t]', ''), '\t\t');
                assert.deepStrictEqual(getOutput('[ ]', 'return 1'), ' [return 1]');
            });
            test('Whitespace (outside of indentation)', () => {
                assert.deepStrictEqual(getOutput('bar[ foo]', 'foobar'), undefined);
                assert.deepStrictEqual(getOutput('bar[\tfoo]', 'foobar'), undefined);
            });
            test('Unsupported Case', () => {
                assert.deepStrictEqual(getOutput('fo[o\n]', 'x\nbar'), undefined);
            });
            test('New Line', () => {
                assert.deepStrictEqual(getOutput('fo[o\n]', 'o\nbar'), 'foo\n[bar]');
            });
            test('Multi Part Diffing', () => {
                assert.deepStrictEqual(getOutput('foo[()]', '(x);'), { prefix: undefined, subword: 'foo([x])[;]' });
                assert.deepStrictEqual(getOutput('[\tfoo]', '\t\tfoobar'), { prefix: undefined, subword: '\t[\t]foo[bar]' });
                assert.deepStrictEqual(getOutput('[(y ===)]', '(y === 1) { f(); }'), { prefix: undefined, subword: '(y ===[ 1])[ { f(); }]' });
                assert.deepStrictEqual(getOutput('[(y ==)]', '(y === 1) { f(); }'), { prefix: undefined, subword: '(y ==[= 1])[ { f(); }]' });
                assert.deepStrictEqual(getOutput('[(y ==)]', '(y === 1) { f(); }'), { prefix: undefined, subword: '(y ==[= 1])[ { f(); }]' });
            });
            test('Multi Part Diffing 1', () => {
                assert.deepStrictEqual(getOutput('[if () ()]', 'if (1 == f()) ()'), { prefix: undefined, subword: 'if ([1 == f()]) ()' });
            });
            test('Multi Part Diffing 2', () => {
                assert.deepStrictEqual(getOutput('[)]', '())'), ({ prefix: undefined, subword: "[(])[)]" }));
                assert.deepStrictEqual(getOutput('[))]', '(())'), ({ prefix: undefined, subword: "[((]))" }));
            });
            test('Parenthesis Matching', () => {
                assert.deepStrictEqual(getOutput('[console.log()]', 'console.log({ label: "(" })'), {
                    prefix: undefined,
                    subword: 'console.log([{ label: "(" }])'
                });
            });
        });
        test('Does not trigger automatically if disabled', async function () {
            const provider = new utils_2.$80b();
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider, inlineSuggest: { enabled: false } }, async ({ editor, editorViewModel, model, context }) => {
                context.keyboardType('foo');
                await (0, async_1.$Hg)(1000);
                // Provider is not called, no ghost text is shown.
                assert.deepStrictEqual(provider.getAndClearCallHistory(), []);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['']);
            });
        });
        test('Ghost text is shown after trigger', async function () {
            const provider = new utils_2.$80b();
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider }, async ({ editor, editorViewModel, model, context }) => {
                context.keyboardType('foo');
                provider.setReturnValue({ insertText: 'foobar', range: new range_1.$ks(1, 1, 1, 4) });
                model.triggerExplicitly();
                await (0, async_1.$Hg)(1000);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), [
                    { position: '(1,4)', text: 'foo', triggerKind: 1, }
                ]);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['', 'foo[bar]']);
            });
        });
        test('Ghost text is shown automatically when configured', async function () {
            const provider = new utils_2.$80b();
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider, inlineSuggest: { enabled: true } }, async ({ editor, editorViewModel, model, context }) => {
                context.keyboardType('foo');
                provider.setReturnValue({ insertText: 'foobar', range: new range_1.$ks(1, 1, 1, 4) });
                await (0, async_1.$Hg)(1000);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), [
                    { position: '(1,4)', text: 'foo', triggerKind: 0, }
                ]);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['', 'foo[bar]']);
            });
        });
        test('Ghost text is updated automatically', async function () {
            const provider = new utils_2.$80b();
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider }, async ({ editor, editorViewModel, model, context }) => {
                provider.setReturnValue({ insertText: 'foobar', range: new range_1.$ks(1, 1, 1, 4) });
                context.keyboardType('foo');
                model.triggerExplicitly();
                await (0, async_1.$Hg)(1000);
                provider.setReturnValue({ insertText: 'foobizz', range: new range_1.$ks(1, 1, 1, 6) });
                context.keyboardType('b');
                context.keyboardType('i');
                await (0, async_1.$Hg)(1000);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), [
                    { position: '(1,4)', text: 'foo', triggerKind: 1, },
                    { position: '(1,6)', text: 'foobi', triggerKind: 0, }
                ]);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['', 'foo[bar]', 'foob[ar]', 'foobi', 'foobi[zz]']);
            });
        });
        test('Unindent whitespace', async function () {
            const provider = new utils_2.$80b();
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider }, async ({ editor, editorViewModel, model, context }) => {
                context.keyboardType('  ');
                provider.setReturnValue({ insertText: 'foo', range: new range_1.$ks(1, 2, 1, 3) });
                model.triggerExplicitly();
                await (0, async_1.$Hg)(1000);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['', '  [foo]']);
                model.accept(editor);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), [
                    { position: '(1,3)', text: '  ', triggerKind: 1, },
                ]);
                assert.deepStrictEqual(context.getAndClearViewStates(), [' foo']);
            });
        });
        test('Unindent tab', async function () {
            const provider = new utils_2.$80b();
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider }, async ({ editor, editorViewModel, model, context }) => {
                context.keyboardType('\t\t');
                provider.setReturnValue({ insertText: 'foo', range: new range_1.$ks(1, 2, 1, 3) });
                model.triggerExplicitly();
                await (0, async_1.$Hg)(1000);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['', '\t\t[foo]']);
                model.accept(editor);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), [
                    { position: '(1,3)', text: '\t\t', triggerKind: 1, },
                ]);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['\tfoo']);
            });
        });
        test('No unindent after indentation', async function () {
            const provider = new utils_2.$80b();
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider }, async ({ editor, editorViewModel, model, context }) => {
                context.keyboardType('buzz  ');
                provider.setReturnValue({ insertText: 'foo', range: new range_1.$ks(1, 6, 1, 7) });
                model.triggerExplicitly();
                await (0, async_1.$Hg)(1000);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['']);
                model.accept(editor);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), [
                    { position: '(1,7)', text: 'buzz  ', triggerKind: 1, },
                ]);
                assert.deepStrictEqual(context.getAndClearViewStates(), []);
            });
        });
        test('Next/previous', async function () {
            const provider = new utils_2.$80b();
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider }, async ({ editor, editorViewModel, model, context }) => {
                context.keyboardType('foo');
                provider.setReturnValue({ insertText: 'foobar1', range: new range_1.$ks(1, 1, 1, 4) });
                model.trigger();
                await (0, async_1.$Hg)(1000);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['', 'foo[bar1]']);
                provider.setReturnValues([
                    { insertText: 'foobar1', range: new range_1.$ks(1, 1, 1, 4) },
                    { insertText: 'foobizz2', range: new range_1.$ks(1, 1, 1, 4) },
                    { insertText: 'foobuzz3', range: new range_1.$ks(1, 1, 1, 4) }
                ]);
                model.next();
                await (0, async_1.$Hg)(1000);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['foo[bizz2]']);
                model.next();
                await (0, async_1.$Hg)(1000);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['foo[buzz3]']);
                model.next();
                await (0, async_1.$Hg)(1000);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['foo[bar1]']);
                model.previous();
                await (0, async_1.$Hg)(1000);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['foo[buzz3]']);
                model.previous();
                await (0, async_1.$Hg)(1000);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['foo[bizz2]']);
                model.previous();
                await (0, async_1.$Hg)(1000);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['foo[bar1]']);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), [
                    { position: '(1,4)', text: 'foo', triggerKind: 0, },
                    { position: '(1,4)', text: 'foo', triggerKind: 1, },
                ]);
            });
        });
        test('Calling the provider is debounced', async function () {
            const provider = new utils_2.$80b();
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider }, async ({ editor, editorViewModel, model, context }) => {
                model.trigger();
                context.keyboardType('f');
                await (0, async_1.$Hg)(40);
                context.keyboardType('o');
                await (0, async_1.$Hg)(40);
                context.keyboardType('o');
                await (0, async_1.$Hg)(40);
                // The provider is not called
                assert.deepStrictEqual(provider.getAndClearCallHistory(), []);
                await (0, async_1.$Hg)(400);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), [
                    { position: '(1,4)', text: 'foo', triggerKind: 0, }
                ]);
                provider.assertNotCalledTwiceWithin50ms();
            });
        });
        test('Backspace is debounced', async function () {
            const provider = new utils_2.$80b();
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider, inlineSuggest: { enabled: true } }, async ({ editor, editorViewModel, model, context }) => {
                context.keyboardType('foo');
                provider.setReturnValue({ insertText: 'foobar', range: new range_1.$ks(1, 1, 1, 4) });
                await (0, async_1.$Hg)(1000);
                for (let j = 0; j < 2; j++) {
                    for (let i = 0; i < 3; i++) {
                        context.leftDelete();
                        await (0, async_1.$Hg)(5);
                    }
                    context.keyboardType('bar');
                }
                await (0, async_1.$Hg)(400);
                provider.assertNotCalledTwiceWithin50ms();
            });
        });
        test('Forward stability', async function () {
            // The user types the text as suggested and the provider is forward-stable
            const provider = new utils_2.$80b();
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider }, async ({ editor, editorViewModel, model, context }) => {
                provider.setReturnValue({ insertText: 'foobar', range: new range_1.$ks(1, 1, 1, 4) });
                context.keyboardType('foo');
                model.trigger();
                await (0, async_1.$Hg)(1000);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), [
                    { position: '(1,4)', text: 'foo', triggerKind: 0, }
                ]);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['', 'foo[bar]']);
                provider.setReturnValue({ insertText: 'foobar', range: new range_1.$ks(1, 1, 1, 5) });
                context.keyboardType('b');
                assert.deepStrictEqual(context.currentPrettyViewState, 'foob[ar]');
                await (0, async_1.$Hg)(1000);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), [
                    { position: '(1,5)', text: 'foob', triggerKind: 0, }
                ]);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['foob[ar]']);
                provider.setReturnValue({ insertText: 'foobar', range: new range_1.$ks(1, 1, 1, 6) });
                context.keyboardType('a');
                assert.deepStrictEqual(context.currentPrettyViewState, 'fooba[r]');
                await (0, async_1.$Hg)(1000);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), [
                    { position: '(1,6)', text: 'fooba', triggerKind: 0, }
                ]);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['fooba[r]']);
            });
        });
        test('Support forward instability', async function () {
            // The user types the text as suggested and the provider reports a different suggestion.
            const provider = new utils_2.$80b();
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider }, async ({ editor, editorViewModel, model, context }) => {
                provider.setReturnValue({ insertText: 'foobar', range: new range_1.$ks(1, 1, 1, 4) });
                context.keyboardType('foo');
                model.triggerExplicitly();
                await (0, async_1.$Hg)(100);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), [
                    { position: '(1,4)', text: 'foo', triggerKind: 1, }
                ]);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['', 'foo[bar]']);
                provider.setReturnValue({ insertText: 'foobaz', range: new range_1.$ks(1, 1, 1, 5) });
                context.keyboardType('b');
                assert.deepStrictEqual(context.currentPrettyViewState, 'foob[ar]');
                await (0, async_1.$Hg)(100);
                // This behavior might change!
                assert.deepStrictEqual(provider.getAndClearCallHistory(), [
                    { position: '(1,5)', text: 'foob', triggerKind: 0, }
                ]);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['foob[ar]', 'foob[az]']);
            });
        });
        test('Support backward instability', async function () {
            // The user deletes text and the suggestion changes
            const provider = new utils_2.$80b();
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider }, async ({ editor, editorViewModel, model, context }) => {
                context.keyboardType('fooba');
                provider.setReturnValue({ insertText: 'foobar', range: new range_1.$ks(1, 1, 1, 6) });
                model.triggerExplicitly();
                await (0, async_1.$Hg)(1000);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), [
                    { position: '(1,6)', text: 'fooba', triggerKind: 1, }
                ]);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['', 'fooba[r]']);
                provider.setReturnValue({ insertText: 'foobaz', range: new range_1.$ks(1, 1, 1, 5) });
                context.leftDelete();
                await (0, async_1.$Hg)(1000);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), [
                    { position: '(1,5)', text: 'foob', triggerKind: 0, }
                ]);
                assert.deepStrictEqual(context.getAndClearViewStates(), [
                    'foob[ar]',
                    'foob[az]'
                ]);
            });
        });
        test('No race conditions', async function () {
            const provider = new utils_2.$80b();
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider, }, async ({ editor, editorViewModel, model, context }) => {
                context.keyboardType('h');
                provider.setReturnValue({ insertText: 'helloworld', range: new range_1.$ks(1, 1, 1, 2) }, 1000);
                model.triggerExplicitly();
                await (0, async_1.$Hg)(1030);
                context.keyboardType('ello');
                provider.setReturnValue({ insertText: 'helloworld', range: new range_1.$ks(1, 1, 1, 6) }, 1000);
                // after 20ms: Inline completion provider answers back
                // after 50ms: Debounce is triggered
                await (0, async_1.$Hg)(2000);
                assert.deepStrictEqual(context.getAndClearViewStates(), [
                    '',
                    'hello[world]',
                ]);
            });
        });
        test('Do not reuse cache from previous session (#132516)', async function () {
            const provider = new utils_2.$80b();
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider, inlineSuggest: { enabled: true } }, async ({ editor, editorViewModel, model, context }) => {
                context.keyboardType('hello\n');
                context.cursorLeft();
                context.keyboardType('x');
                context.leftDelete();
                provider.setReturnValue({ insertText: 'helloworld', range: new range_1.$ks(1, 1, 1, 6) }, 1000);
                await (0, async_1.$Hg)(2000);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), [
                    {
                        position: '(1,6)',
                        text: 'hello\n',
                        triggerKind: 0,
                    }
                ]);
                provider.setReturnValue({ insertText: 'helloworld', range: new range_1.$ks(2, 1, 2, 6) }, 1000);
                context.cursorDown();
                context.keyboardType('hello');
                await (0, async_1.$Hg)(40);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), []);
                // Update ghost text
                context.keyboardType('w');
                context.leftDelete();
                await (0, async_1.$Hg)(2000);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), [
                    { position: '(2,6)', triggerKind: 0, text: 'hello\nhello' },
                ]);
                assert.deepStrictEqual(context.getAndClearViewStates(), [
                    '',
                    'hello[world]\n',
                    'hello\n',
                    'hello\nhello[world]',
                ]);
            });
        });
        test('Additional Text Edits', async function () {
            const provider = new utils_2.$80b();
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider }, async ({ editor, editorViewModel, model, context }) => {
                context.keyboardType('buzz\nbaz');
                provider.setReturnValue({
                    insertText: 'bazz',
                    range: new range_1.$ks(2, 1, 2, 4),
                    additionalTextEdits: [{
                            range: new range_1.$ks(1, 1, 1, 5),
                            text: 'bla'
                        }],
                });
                model.triggerExplicitly();
                await (0, async_1.$Hg)(1000);
                model.accept(editor);
                assert.deepStrictEqual(provider.getAndClearCallHistory(), ([{ position: "(2,4)", triggerKind: 1, text: "buzz\nbaz" }]));
                assert.deepStrictEqual(context.getAndClearViewStates(), [
                    '',
                    'buzz\nbaz[z]',
                    'bla\nbazz',
                ]);
            });
        });
    });
    async function withAsyncTestCodeEditorAndInlineCompletionsModel(text, options, callback) {
        return await (0, timeTravelScheduler_1.$kT)({
            useFakeTimers: options.fakeClock,
        }, async () => {
            const disposableStore = new lifecycle_1.$jc();
            try {
                if (options.provider) {
                    const languageFeaturesService = new languageFeaturesService_1.$oBb();
                    if (!options.serviceCollection) {
                        options.serviceCollection = new serviceCollection_1.$zh();
                    }
                    options.serviceCollection.set(languageFeatures_1.$hF, languageFeaturesService);
                    options.serviceCollection.set(audioCueService_1.$sZ, {
                        playAudioCue: async () => { },
                        isEnabled(cue) { return false; },
                    });
                    const d = languageFeaturesService.inlineCompletionsProvider.register({ pattern: '**' }, options.provider);
                    disposableStore.add(d);
                }
                let result;
                await (0, testCodeEditor_1.$Y0b)(text, options, async (editor, editorViewModel, instantiationService) => {
                    const controller = instantiationService.createInstance(inlineCompletionsController_1.$V8, editor);
                    const model = controller.model.get();
                    const context = new utils_2.$90b(model, editor);
                    try {
                        result = await callback({ editor, editorViewModel, model, context });
                    }
                    finally {
                        context.dispose();
                        model.dispose();
                        controller.dispose();
                    }
                });
                if (options.provider instanceof utils_2.$80b) {
                    options.provider.assertNotCalledTwiceWithin50ms();
                }
                return result;
            }
            finally {
                disposableStore.dispose();
            }
        });
    }
});
//# sourceMappingURL=inlineCompletionsProvider.test.js.map