/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/editor/test/browser/testCodeEditor", "vs/editor/test/common/testTextModel", "vs/base/common/lifecycle"], function (require, exports, assert, testCodeEditor_1, testTextModel_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getEditOperation = exports.testCommand = void 0;
    function testCommand(lines, languageId, selection, commandFactory, expectedLines, expectedSelection, forceTokenization, prepare) {
        const disposables = new lifecycle_1.DisposableStore();
        const instantiationService = (0, testCodeEditor_1.createCodeEditorServices)(disposables);
        if (prepare) {
            instantiationService.invokeFunction(prepare, disposables);
        }
        const model = disposables.add((0, testTextModel_1.instantiateTextModel)(instantiationService, lines.join('\n'), languageId));
        const editor = disposables.add((0, testCodeEditor_1.instantiateTestCodeEditor)(instantiationService, model));
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
    exports.testCommand = testCommand;
    /**
     * Extract edit operations if command `command` were to execute on model `model`
     */
    function getEditOperation(model, command) {
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
    exports.getEditOperation = getEditOperation;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdENvbW1hbmQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvdGVzdC9icm93c2VyL3Rlc3RDb21tYW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWFoRyxTQUFnQixXQUFXLENBQzFCLEtBQWUsRUFDZixVQUF5QixFQUN6QixTQUFvQixFQUNwQixjQUE4RSxFQUM5RSxhQUF1QixFQUN2QixpQkFBNEIsRUFDNUIsaUJBQTJCLEVBQzNCLE9BQTRFO1FBRTVFLE1BQU0sV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1FBQzFDLE1BQU0sb0JBQW9CLEdBQUcsSUFBQSx5Q0FBd0IsRUFBQyxXQUFXLENBQUMsQ0FBQztRQUNuRSxJQUFJLE9BQU8sRUFBRTtZQUNaLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7U0FDMUQ7UUFDRCxNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUEsb0NBQW9CLEVBQUMsb0JBQW9CLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ3hHLE1BQU0sTUFBTSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBQSwwQ0FBeUIsRUFBQyxvQkFBb0IsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3ZGLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxZQUFZLEVBQUcsQ0FBQztRQUV6QyxJQUFJLGlCQUFpQixFQUFFO1lBQ3RCLEtBQUssQ0FBQyxZQUFZLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7U0FDM0Q7UUFFRCxTQUFTLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFFOUMsTUFBTSxPQUFPLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDdEgsU0FBUyxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFM0MsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFFL0QsTUFBTSxlQUFlLEdBQUcsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ2pELE1BQU0sQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxFQUFFLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFFakYsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3ZCLENBQUM7SUFsQ0Qsa0NBa0NDO0lBRUQ7O09BRUc7SUFDSCxTQUFnQixnQkFBZ0IsQ0FBQyxLQUFpQixFQUFFLE9BQWlCO1FBQ3BFLE1BQU0sVUFBVSxHQUEyQixFQUFFLENBQUM7UUFDOUMsTUFBTSxvQkFBb0IsR0FBMEI7WUFDbkQsZ0JBQWdCLEVBQUUsQ0FBQyxLQUFhLEVBQUUsSUFBWSxFQUFFLG1CQUE0QixLQUFLLEVBQUUsRUFBRTtnQkFDcEYsVUFBVSxDQUFDLElBQUksQ0FBQztvQkFDZixLQUFLLEVBQUUsS0FBSztvQkFDWixJQUFJLEVBQUUsSUFBSTtvQkFDVixnQkFBZ0IsRUFBRSxnQkFBZ0I7aUJBQ2xDLENBQUMsQ0FBQztZQUNKLENBQUM7WUFFRCx1QkFBdUIsRUFBRSxDQUFDLEtBQWEsRUFBRSxJQUFZLEVBQUUsbUJBQTRCLEtBQUssRUFBRSxFQUFFO2dCQUMzRixVQUFVLENBQUMsSUFBSSxDQUFDO29CQUNmLEtBQUssRUFBRSxLQUFLO29CQUNaLElBQUksRUFBRSxJQUFJO29CQUNWLGdCQUFnQixFQUFFLGdCQUFnQjtpQkFDbEMsQ0FBQyxDQUFDO1lBQ0osQ0FBQztZQUdELGNBQWMsRUFBRSxDQUFDLFNBQXFCLEVBQUUsRUFBRTtnQkFDekMsT0FBTyxFQUFFLENBQUM7WUFDWCxDQUFDO1NBQ0QsQ0FBQztRQUNGLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztRQUN2RCxPQUFPLFVBQVUsQ0FBQztJQUNuQixDQUFDO0lBMUJELDRDQTBCQyJ9