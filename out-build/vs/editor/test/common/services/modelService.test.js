/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/platform", "vs/base/common/uri", "vs/editor/common/core/editOperation", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/core/stringBuilder", "vs/editor/common/model/textModel", "vs/editor/common/services/modelService", "vs/platform/configuration/test/common/testConfigurationService", "vs/editor/test/common/testTextModel", "vs/base/common/lifecycle", "vs/editor/common/services/model", "vs/platform/configuration/common/configuration", "vs/base/test/common/utils"], function (require, exports, assert, platform, uri_1, editOperation_1, range_1, selection_1, stringBuilder_1, textModel_1, modelService_1, testConfigurationService_1, testTextModel_1, lifecycle_1, model_1, configuration_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const GENERATE_TESTS = false;
    suite('ModelService', () => {
        let disposables;
        let modelService;
        let instantiationService;
        setup(() => {
            disposables = new lifecycle_1.$jc();
            const configService = new testConfigurationService_1.$G0b();
            configService.setUserConfiguration('files', { 'eol': '\n' });
            configService.setUserConfiguration('files', { 'eol': '\r\n' }, uri_1.URI.file(platform.$i ? 'c:\\myroot' : '/myroot'));
            instantiationService = (0, testTextModel_1.$Q0b)(disposables, [
                [configuration_1.$8h, configService]
            ]);
            modelService = instantiationService.get(model_1.$yA);
        });
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.$bT)();
        test('EOL setting respected depending on root', () => {
            const model1 = modelService.createModel('farboo', null);
            const model2 = modelService.createModel('farboo', null, uri_1.URI.file(platform.$i ? 'c:\\myroot\\myfile.txt' : '/myroot/myfile.txt'));
            const model3 = modelService.createModel('farboo', null, uri_1.URI.file(platform.$i ? 'c:\\other\\myfile.txt' : '/other/myfile.txt'));
            assert.strictEqual(model1.getOptions().defaultEOL, 1 /* DefaultEndOfLine.LF */);
            assert.strictEqual(model2.getOptions().defaultEOL, 2 /* DefaultEndOfLine.CRLF */);
            assert.strictEqual(model3.getOptions().defaultEOL, 1 /* DefaultEndOfLine.LF */);
            model1.dispose();
            model2.dispose();
            model3.dispose();
        });
        test('_computeEdits no change', function () {
            const model = disposables.add((0, testTextModel_1.$O0b)([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.', //29
            ].join('\n')));
            const textBuffer = createAndRegisterTextBuffer(disposables, [
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.', //29
            ].join('\n'), 1 /* DefaultEndOfLine.LF */);
            const actual = modelService_1.$4yb._computeEdits(model, textBuffer);
            assert.deepStrictEqual(actual, []);
        });
        test('_computeEdits first line changed', function () {
            const model = disposables.add((0, testTextModel_1.$O0b)([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.', //29
            ].join('\n')));
            const textBuffer = createAndRegisterTextBuffer(disposables, [
                'This is line One',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.', //29
            ].join('\n'), 1 /* DefaultEndOfLine.LF */);
            const actual = modelService_1.$4yb._computeEdits(model, textBuffer);
            assert.deepStrictEqual(actual, [
                editOperation_1.$ls.replaceMove(new range_1.$ks(1, 1, 2, 1), 'This is line One\n')
            ]);
        });
        test('_computeEdits EOL changed', function () {
            const model = disposables.add((0, testTextModel_1.$O0b)([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.', //29
            ].join('\n')));
            const textBuffer = createAndRegisterTextBuffer(disposables, [
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.', //29
            ].join('\r\n'), 1 /* DefaultEndOfLine.LF */);
            const actual = modelService_1.$4yb._computeEdits(model, textBuffer);
            assert.deepStrictEqual(actual, []);
        });
        test('_computeEdits EOL and other change 1', function () {
            const model = disposables.add((0, testTextModel_1.$O0b)([
                'This is line one',
                'and this is line number two',
                'it is followed by #3',
                'and finished with the fourth.', //29
            ].join('\n')));
            const textBuffer = createAndRegisterTextBuffer(disposables, [
                'This is line One',
                'and this is line number two',
                'It is followed by #3',
                'and finished with the fourth.', //29
            ].join('\r\n'), 1 /* DefaultEndOfLine.LF */);
            const actual = modelService_1.$4yb._computeEdits(model, textBuffer);
            assert.deepStrictEqual(actual, [
                editOperation_1.$ls.replaceMove(new range_1.$ks(1, 1, 4, 1), [
                    'This is line One',
                    'and this is line number two',
                    'It is followed by #3',
                    ''
                ].join('\r\n'))
            ]);
        });
        test('_computeEdits EOL and other change 2', function () {
            const model = disposables.add((0, testTextModel_1.$O0b)([
                'package main',
                'func foo() {',
                '}' // 3
            ].join('\n')));
            const textBuffer = createAndRegisterTextBuffer(disposables, [
                'package main',
                'func foo() {',
                '}',
                ''
            ].join('\r\n'), 1 /* DefaultEndOfLine.LF */);
            const actual = modelService_1.$4yb._computeEdits(model, textBuffer);
            assert.deepStrictEqual(actual, [
                editOperation_1.$ls.replaceMove(new range_1.$ks(3, 2, 3, 2), '\r\n')
            ]);
        });
        test('generated1', () => {
            const file1 = ['pram', 'okctibad', 'pjuwtemued', 'knnnm', 'u', ''];
            const file2 = ['tcnr', 'rxwlicro', 'vnzy', '', '', 'pjzcogzur', 'ptmxyp', 'dfyshia', 'pee', 'ygg'];
            assertComputeEdits(file1, file2);
        });
        test('generated2', () => {
            const file1 = ['', 'itls', 'hrilyhesv', ''];
            const file2 = ['vdl', '', 'tchgz', 'bhx', 'nyl'];
            assertComputeEdits(file1, file2);
        });
        test('generated3', () => {
            const file1 = ['ubrbrcv', 'wv', 'xodspybszt', 's', 'wednjxm', 'fklajt', 'fyfc', 'lvejgge', 'rtpjlodmmk', 'arivtgmjdm'];
            const file2 = ['s', 'qj', 'tu', 'ur', 'qerhjjhyvx', 't'];
            assertComputeEdits(file1, file2);
        });
        test('generated4', () => {
            const file1 = ['ig', 'kh', 'hxegci', 'smvker', 'pkdmjjdqnv', 'vgkkqqx', '', 'jrzeb'];
            const file2 = ['yk', ''];
            assertComputeEdits(file1, file2);
        });
        test('does insertions in the middle of the document', () => {
            const file1 = [
                'line 1',
                'line 2',
                'line 3'
            ];
            const file2 = [
                'line 1',
                'line 2',
                'line 5',
                'line 3'
            ];
            assertComputeEdits(file1, file2);
        });
        test('does insertions at the end of the document', () => {
            const file1 = [
                'line 1',
                'line 2',
                'line 3'
            ];
            const file2 = [
                'line 1',
                'line 2',
                'line 3',
                'line 4'
            ];
            assertComputeEdits(file1, file2);
        });
        test('does insertions at the beginning of the document', () => {
            const file1 = [
                'line 1',
                'line 2',
                'line 3'
            ];
            const file2 = [
                'line 0',
                'line 1',
                'line 2',
                'line 3'
            ];
            assertComputeEdits(file1, file2);
        });
        test('does replacements', () => {
            const file1 = [
                'line 1',
                'line 2',
                'line 3'
            ];
            const file2 = [
                'line 1',
                'line 7',
                'line 3'
            ];
            assertComputeEdits(file1, file2);
        });
        test('does deletions', () => {
            const file1 = [
                'line 1',
                'line 2',
                'line 3'
            ];
            const file2 = [
                'line 1',
                'line 3'
            ];
            assertComputeEdits(file1, file2);
        });
        test('does insert, replace, and delete', () => {
            const file1 = [
                'line 1',
                'line 2',
                'line 3',
                'line 4',
                'line 5',
            ];
            const file2 = [
                'line 0',
                'line 1',
                'replace line 2',
                'line 3',
                // delete line 4
                'line 5',
            ];
            assertComputeEdits(file1, file2);
        });
        test('maintains undo for same resource and same content', () => {
            const resource = uri_1.URI.parse('file://test.txt');
            // create a model
            const model1 = modelService.createModel('text', null, resource);
            // make an edit
            model1.pushEditOperations(null, [{ range: new range_1.$ks(1, 5, 1, 5), text: '1' }], () => [new selection_1.$ms(1, 5, 1, 5)]);
            assert.strictEqual(model1.getValue(), 'text1');
            // dispose it
            modelService.destroyModel(resource);
            // create a new model with the same content
            const model2 = modelService.createModel('text1', null, resource);
            // undo
            model2.undo();
            assert.strictEqual(model2.getValue(), 'text');
            // dispose it
            modelService.destroyModel(resource);
        });
        test('maintains version id and alternative version id for same resource and same content', () => {
            const resource = uri_1.URI.parse('file://test.txt');
            // create a model
            const model1 = modelService.createModel('text', null, resource);
            // make an edit
            model1.pushEditOperations(null, [{ range: new range_1.$ks(1, 5, 1, 5), text: '1' }], () => [new selection_1.$ms(1, 5, 1, 5)]);
            assert.strictEqual(model1.getValue(), 'text1');
            const versionId = model1.getVersionId();
            const alternativeVersionId = model1.getAlternativeVersionId();
            // dispose it
            modelService.destroyModel(resource);
            // create a new model with the same content
            const model2 = modelService.createModel('text1', null, resource);
            assert.strictEqual(model2.getVersionId(), versionId);
            assert.strictEqual(model2.getAlternativeVersionId(), alternativeVersionId);
            // dispose it
            modelService.destroyModel(resource);
        });
        test('does not maintain undo for same resource and different content', () => {
            const resource = uri_1.URI.parse('file://test.txt');
            // create a model
            const model1 = modelService.createModel('text', null, resource);
            // make an edit
            model1.pushEditOperations(null, [{ range: new range_1.$ks(1, 5, 1, 5), text: '1' }], () => [new selection_1.$ms(1, 5, 1, 5)]);
            assert.strictEqual(model1.getValue(), 'text1');
            // dispose it
            modelService.destroyModel(resource);
            // create a new model with the same content
            const model2 = modelService.createModel('text2', null, resource);
            // undo
            model2.undo();
            assert.strictEqual(model2.getValue(), 'text2');
            // dispose it
            modelService.destroyModel(resource);
        });
        test('setValue should clear undo stack', () => {
            const resource = uri_1.URI.parse('file://test.txt');
            const model = modelService.createModel('text', null, resource);
            model.pushEditOperations(null, [{ range: new range_1.$ks(1, 5, 1, 5), text: '1' }], () => [new selection_1.$ms(1, 5, 1, 5)]);
            assert.strictEqual(model.getValue(), 'text1');
            model.setValue('text2');
            model.undo();
            assert.strictEqual(model.getValue(), 'text2');
            // dispose it
            modelService.destroyModel(resource);
        });
    });
    function assertComputeEdits(lines1, lines2) {
        const model = (0, testTextModel_1.$O0b)(lines1.join('\n'));
        const { disposable, textBuffer } = (0, textModel_1.$LC)(lines2.join('\n'), 1 /* DefaultEndOfLine.LF */);
        // compute required edits
        // let start = Date.now();
        const edits = modelService_1.$4yb._computeEdits(model, textBuffer);
        // console.log(`took ${Date.now() - start} ms.`);
        // apply edits
        model.pushEditOperations([], edits, null);
        assert.strictEqual(model.getValue(), lines2.join('\n'));
        disposable.dispose();
        model.dispose();
    }
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    function getRandomString(minLength, maxLength) {
        const length = getRandomInt(minLength, maxLength);
        const t = new stringBuilder_1.$Es(length);
        for (let i = 0; i < length; i++) {
            t.appendASCIICharCode(getRandomInt(97 /* CharCode.a */, 122 /* CharCode.z */));
        }
        return t.build();
    }
    function generateFile(small) {
        const lineCount = getRandomInt(1, small ? 3 : 10000);
        const lines = [];
        for (let i = 0; i < lineCount; i++) {
            lines.push(getRandomString(0, small ? 3 : 10000));
        }
        return lines;
    }
    if (GENERATE_TESTS) {
        let number = 1;
        while (true) {
            console.log('------TEST: ' + number++);
            const file1 = generateFile(true);
            const file2 = generateFile(true);
            console.log('------TEST GENERATED');
            try {
                assertComputeEdits(file1, file2);
            }
            catch (err) {
                console.log(err);
                console.log(`
const file1 = ${JSON.stringify(file1).replace(/"/g, '\'')};
const file2 = ${JSON.stringify(file2).replace(/"/g, '\'')};
assertComputeEdits(file1, file2);
`);
                break;
            }
        }
    }
    function createAndRegisterTextBuffer(store, value, defaultEOL) {
        const { disposable, textBuffer } = (0, textModel_1.$LC)(value, defaultEOL);
        store.add(disposable);
        return textBuffer;
    }
});
//# sourceMappingURL=modelService.test.js.map