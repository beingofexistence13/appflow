/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/editor/test/browser/testCodeEditor", "vs/editor/test/common/testTextModel", "vs/base/common/lifecycle"], function (require, exports, assert, testCodeEditor_1, testTextModel_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$40b = exports.$30b = void 0;
    function $30b(lines, languageId, selection, commandFactory, expectedLines, expectedSelection, forceTokenization, prepare) {
        const disposables = new lifecycle_1.$jc();
        const instantiationService = (0, testCodeEditor_1.$Z0b)(disposables);
        if (prepare) {
            instantiationService.invokeFunction(prepare, disposables);
        }
        const model = disposables.add((0, testTextModel_1.$P0b)(instantiationService, lines.join('\n'), languageId));
        const editor = disposables.add((0, testCodeEditor_1.$20b)(instantiationService, model));
        const viewModel = editor.getViewModel();
        if (forceTokenization) {
            model.tokenization.forceTokenization(model.getLineCount());
        }
        viewModel.setSelections('tests', [selection]);
        const command = instantiationService.invokeFunction((accessor) => commandFactory(accessor, viewModel.getSelection()));
        viewModel.executeCommand(command, 'tests');
        assert.deepStrictEqual(model.getLinesContent(), expectedLines);
        const actualSelection = viewModel.getSelection();
        assert.deepStrictEqual(actualSelection.toString(), expectedSelection.toString());
        disposables.dispose();
    }
    exports.$30b = $30b;
    /**
     * Extract edit operations if command `command` were to execute on model `model`
     */
    function $40b(model, command) {
        const operations = [];
        const editOperationBuilder = {
            addEditOperation: (range, text, forceMoveMarkers = false) => {
                operations.push({
                    range: range,
                    text: text,
                    forceMoveMarkers: forceMoveMarkers
                });
            },
            addTrackedEditOperation: (range, text, forceMoveMarkers = false) => {
                operations.push({
                    range: range,
                    text: text,
                    forceMoveMarkers: forceMoveMarkers
                });
            },
            trackSelection: (selection) => {
                return '';
            }
        };
        command.getEditOperations(model, editOperationBuilder);
        return operations;
    }
    exports.$40b = $40b;
});
//# sourceMappingURL=testCommand.js.map