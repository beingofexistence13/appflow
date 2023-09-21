/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/test/browser/workbenchTestServices", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/editor/common/services/languageService", "vs/workbench/browser/codeeditor", "vs/editor/test/browser/testCodeEditor", "vs/editor/common/core/range", "vs/editor/common/core/position", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/editor/common/services/modelService", "vs/editor/browser/coreCommands", "vs/workbench/services/editor/common/editorService", "vs/editor/test/common/testTextModel", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService", "vs/base/common/lifecycle", "vs/base/test/common/utils"], function (require, exports, assert, uri_1, workbenchTestServices_1, model_1, language_1, languageService_1, codeeditor_1, testCodeEditor_1, range_1, position_1, configuration_1, testConfigurationService_1, modelService_1, coreCommands_1, editorService_1, testTextModel_1, themeService_1, testThemeService_1, lifecycle_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Editor - Range decorations', () => {
        let disposables;
        let instantiationService;
        let codeEditor;
        let model;
        let text;
        let testObject;
        const modelsToDispose = [];
        setup(() => {
            disposables = new lifecycle_1.$jc();
            instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            instantiationService.stub(editorService_1.$9C, new workbenchTestServices_1.$Eec());
            instantiationService.stub(language_1.$ct, languageService_1.$jmb);
            instantiationService.stub(model_1.$yA, stubModelService(instantiationService));
            text = 'LINE1' + '\n' + 'LINE2' + '\n' + 'LINE3' + '\n' + 'LINE4' + '\r\n' + 'LINE5';
            model = disposables.add(aModel(uri_1.URI.file('some_file')));
            codeEditor = disposables.add((0, testCodeEditor_1.$10b)(model));
            instantiationService.stub(editorService_1.$9C, 'activeEditor', { get resource() { return codeEditor.getModel().uri; } });
            instantiationService.stub(editorService_1.$9C, 'activeTextEditorControl', codeEditor);
            testObject = disposables.add(instantiationService.createInstance(codeeditor_1.$qrb));
        });
        teardown(() => {
            codeEditor.dispose();
            modelsToDispose.forEach(model => model.dispose());
            disposables.dispose();
        });
        (0, utils_1.$bT)();
        test('highlight range for the resource if it is an active editor', function () {
            const range = new range_1.$ks(1, 1, 1, 1);
            testObject.highlightRange({ resource: model.uri, range });
            const actuals = rangeHighlightDecorations(model);
            assert.deepStrictEqual(actuals, [range]);
        });
        test('remove highlight range', function () {
            testObject.highlightRange({ resource: model.uri, range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 } });
            testObject.removeHighlightRange();
            const actuals = rangeHighlightDecorations(model);
            assert.deepStrictEqual(actuals, []);
        });
        test('highlight range for the resource removes previous highlight', function () {
            testObject.highlightRange({ resource: model.uri, range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 } });
            const range = new range_1.$ks(2, 2, 4, 3);
            testObject.highlightRange({ resource: model.uri, range });
            const actuals = rangeHighlightDecorations(model);
            assert.deepStrictEqual(actuals, [range]);
        });
        test('highlight range for a new resource removes highlight of previous resource', function () {
            testObject.highlightRange({ resource: model.uri, range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 } });
            const anotherModel = prepareActiveEditor('anotherModel');
            const range = new range_1.$ks(2, 2, 4, 3);
            testObject.highlightRange({ resource: anotherModel.uri, range });
            let actuals = rangeHighlightDecorations(model);
            assert.deepStrictEqual(actuals, []);
            actuals = rangeHighlightDecorations(anotherModel);
            assert.deepStrictEqual(actuals, [range]);
        });
        test('highlight is removed on model change', function () {
            testObject.highlightRange({ resource: model.uri, range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 } });
            prepareActiveEditor('anotherModel');
            const actuals = rangeHighlightDecorations(model);
            assert.deepStrictEqual(actuals, []);
        });
        test('highlight is removed on cursor position change', function () {
            testObject.highlightRange({ resource: model.uri, range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 } });
            codeEditor.trigger('mouse', coreCommands_1.CoreNavigationCommands.MoveTo.id, {
                position: new position_1.$js(2, 1)
            });
            const actuals = rangeHighlightDecorations(model);
            assert.deepStrictEqual(actuals, []);
        });
        test('range is not highlight if not active editor', function () {
            const model = aModel(uri_1.URI.file('some model'));
            testObject.highlightRange({ resource: model.uri, range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 } });
            const actuals = rangeHighlightDecorations(model);
            assert.deepStrictEqual(actuals, []);
        });
        test('previous highlight is not removed if not active editor', function () {
            const range = new range_1.$ks(1, 1, 1, 1);
            testObject.highlightRange({ resource: model.uri, range });
            const model1 = aModel(uri_1.URI.file('some model'));
            testObject.highlightRange({ resource: model1.uri, range: { startLineNumber: 2, startColumn: 1, endLineNumber: 2, endColumn: 1 } });
            const actuals = rangeHighlightDecorations(model);
            assert.deepStrictEqual(actuals, [range]);
        });
        function prepareActiveEditor(resource) {
            const model = aModel(uri_1.URI.file(resource));
            codeEditor.setModel(model);
            return model;
        }
        function aModel(resource, content = text) {
            const model = (0, testTextModel_1.$O0b)(content, undefined, undefined, resource);
            modelsToDispose.push(model);
            return model;
        }
        function rangeHighlightDecorations(m) {
            const rangeHighlights = [];
            for (const dec of m.getAllDecorations()) {
                if (dec.options.className === 'rangeHighlight') {
                    rangeHighlights.push(dec.range);
                }
            }
            rangeHighlights.sort(range_1.$ks.compareRangesUsingStarts);
            return rangeHighlights;
        }
        function stubModelService(instantiationService) {
            instantiationService.stub(configuration_1.$8h, new testConfigurationService_1.$G0b());
            instantiationService.stub(themeService_1.$gv, new testThemeService_1.$K0b());
            return instantiationService.createInstance(modelService_1.$4yb);
        }
    });
});
//# sourceMappingURL=codeeditor.test.js.map