define(["require", "exports", "assert", "vs/editor/common/core/position", "vs/editor/common/core/selection", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/contrib/bracketMatching/browser/bracketMatching", "vs/editor/test/browser/testCodeEditor", "vs/editor/test/common/testTextModel", "vs/base/common/lifecycle", "vs/editor/common/languages/language", "vs/base/test/common/utils"], function (require, exports, assert, position_1, selection_1, languageConfigurationRegistry_1, bracketMatching_1, testCodeEditor_1, testTextModel_1, lifecycle_1, language_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('bracket matching', () => {
        let disposables;
        let instantiationService;
        let languageConfigurationService;
        let languageService;
        setup(() => {
            disposables = new lifecycle_1.DisposableStore();
            instantiationService = (0, testCodeEditor_1.createCodeEditorServices)(disposables);
            languageConfigurationService = instantiationService.get(languageConfigurationRegistry_1.ILanguageConfigurationService);
            languageService = instantiationService.get(language_1.ILanguageService);
        });
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        function createTextModelWithBrackets(text) {
            const languageId = 'bracketMode';
            disposables.add(languageService.registerLanguage({ id: languageId }));
            disposables.add(languageConfigurationService.register(languageId, {
                brackets: [
                    ['{', '}'],
                    ['[', ']'],
                    ['(', ')'],
                ]
            }));
            return disposables.add((0, testTextModel_1.instantiateTextModel)(instantiationService, text, languageId));
        }
        function createCodeEditorWithBrackets(text) {
            return disposables.add((0, testCodeEditor_1.instantiateTestCodeEditor)(instantiationService, createTextModelWithBrackets(text)));
        }
        test('issue #183: jump to matching bracket position', () => {
            const editor = createCodeEditorWithBrackets('var x = (3 + (5-7)) + ((5+3)+5);');
            const bracketMatchingController = disposables.add(editor.registerAndInstantiateContribution(bracketMatching_1.BracketMatchingController.ID, bracketMatching_1.BracketMatchingController));
            // start on closing bracket
            editor.setPosition(new position_1.Position(1, 20));
            bracketMatchingController.jumpToBracket();
            assert.deepStrictEqual(editor.getPosition(), new position_1.Position(1, 9));
            bracketMatchingController.jumpToBracket();
            assert.deepStrictEqual(editor.getPosition(), new position_1.Position(1, 19));
            bracketMatchingController.jumpToBracket();
            assert.deepStrictEqual(editor.getPosition(), new position_1.Position(1, 9));
            // start on opening bracket
            editor.setPosition(new position_1.Position(1, 23));
            bracketMatchingController.jumpToBracket();
            assert.deepStrictEqual(editor.getPosition(), new position_1.Position(1, 31));
            bracketMatchingController.jumpToBracket();
            assert.deepStrictEqual(editor.getPosition(), new position_1.Position(1, 23));
            bracketMatchingController.jumpToBracket();
            assert.deepStrictEqual(editor.getPosition(), new position_1.Position(1, 31));
        });
        test('Jump to next bracket', () => {
            const editor = createCodeEditorWithBrackets('var x = (3 + (5-7)); y();');
            const bracketMatchingController = disposables.add(editor.registerAndInstantiateContribution(bracketMatching_1.BracketMatchingController.ID, bracketMatching_1.BracketMatchingController));
            // start position between brackets
            editor.setPosition(new position_1.Position(1, 16));
            bracketMatchingController.jumpToBracket();
            assert.deepStrictEqual(editor.getPosition(), new position_1.Position(1, 18));
            bracketMatchingController.jumpToBracket();
            assert.deepStrictEqual(editor.getPosition(), new position_1.Position(1, 14));
            bracketMatchingController.jumpToBracket();
            assert.deepStrictEqual(editor.getPosition(), new position_1.Position(1, 18));
            // skip brackets in comments
            editor.setPosition(new position_1.Position(1, 21));
            bracketMatchingController.jumpToBracket();
            assert.deepStrictEqual(editor.getPosition(), new position_1.Position(1, 23));
            bracketMatchingController.jumpToBracket();
            assert.deepStrictEqual(editor.getPosition(), new position_1.Position(1, 24));
            bracketMatchingController.jumpToBracket();
            assert.deepStrictEqual(editor.getPosition(), new position_1.Position(1, 23));
            // do not break if no brackets are available
            editor.setPosition(new position_1.Position(1, 26));
            bracketMatchingController.jumpToBracket();
            assert.deepStrictEqual(editor.getPosition(), new position_1.Position(1, 26));
        });
        test('Select to next bracket', () => {
            const editor = createCodeEditorWithBrackets('var x = (3 + (5-7)); y();');
            const bracketMatchingController = disposables.add(editor.registerAndInstantiateContribution(bracketMatching_1.BracketMatchingController.ID, bracketMatching_1.BracketMatchingController));
            // start position in open brackets
            editor.setPosition(new position_1.Position(1, 9));
            bracketMatchingController.selectToBracket(true);
            assert.deepStrictEqual(editor.getPosition(), new position_1.Position(1, 20));
            assert.deepStrictEqual(editor.getSelection(), new selection_1.Selection(1, 9, 1, 20));
            // start position in close brackets (should select backwards)
            editor.setPosition(new position_1.Position(1, 20));
            bracketMatchingController.selectToBracket(true);
            assert.deepStrictEqual(editor.getPosition(), new position_1.Position(1, 9));
            assert.deepStrictEqual(editor.getSelection(), new selection_1.Selection(1, 20, 1, 9));
            // start position between brackets
            editor.setPosition(new position_1.Position(1, 16));
            bracketMatchingController.selectToBracket(true);
            assert.deepStrictEqual(editor.getPosition(), new position_1.Position(1, 19));
            assert.deepStrictEqual(editor.getSelection(), new selection_1.Selection(1, 14, 1, 19));
            // start position outside brackets
            editor.setPosition(new position_1.Position(1, 21));
            bracketMatchingController.selectToBracket(true);
            assert.deepStrictEqual(editor.getPosition(), new position_1.Position(1, 25));
            assert.deepStrictEqual(editor.getSelection(), new selection_1.Selection(1, 23, 1, 25));
            // do not break if no brackets are available
            editor.setPosition(new position_1.Position(1, 26));
            bracketMatchingController.selectToBracket(true);
            assert.deepStrictEqual(editor.getPosition(), new position_1.Position(1, 26));
            assert.deepStrictEqual(editor.getSelection(), new selection_1.Selection(1, 26, 1, 26));
        });
        test('issue #1772: jump to enclosing brackets', () => {
            const text = [
                'const x = {',
                '    something: [0, 1, 2],',
                '    another: true,',
                '    somethingmore: [0, 2, 4]',
                '};',
            ].join('\n');
            const editor = createCodeEditorWithBrackets(text);
            const bracketMatchingController = disposables.add(editor.registerAndInstantiateContribution(bracketMatching_1.BracketMatchingController.ID, bracketMatching_1.BracketMatchingController));
            editor.setPosition(new position_1.Position(3, 5));
            bracketMatchingController.jumpToBracket();
            assert.deepStrictEqual(editor.getSelection(), new selection_1.Selection(5, 1, 5, 1));
        });
        test('issue #43371: argument to not select brackets', () => {
            const text = [
                'const x = {',
                '    something: [0, 1, 2],',
                '    another: true,',
                '    somethingmore: [0, 2, 4]',
                '};',
            ].join('\n');
            const editor = createCodeEditorWithBrackets(text);
            const bracketMatchingController = disposables.add(editor.registerAndInstantiateContribution(bracketMatching_1.BracketMatchingController.ID, bracketMatching_1.BracketMatchingController));
            editor.setPosition(new position_1.Position(3, 5));
            bracketMatchingController.selectToBracket(false);
            assert.deepStrictEqual(editor.getSelection(), new selection_1.Selection(1, 12, 5, 1));
        });
        test('issue #45369: Select to Bracket with multicursor', () => {
            const editor = createCodeEditorWithBrackets('{  }   {   }   { }');
            const bracketMatchingController = disposables.add(editor.registerAndInstantiateContribution(bracketMatching_1.BracketMatchingController.ID, bracketMatching_1.BracketMatchingController));
            // cursors inside brackets become selections of the entire bracket contents
            editor.setSelections([
                new selection_1.Selection(1, 3, 1, 3),
                new selection_1.Selection(1, 10, 1, 10),
                new selection_1.Selection(1, 17, 1, 17)
            ]);
            bracketMatchingController.selectToBracket(true);
            assert.deepStrictEqual(editor.getSelections(), [
                new selection_1.Selection(1, 1, 1, 5),
                new selection_1.Selection(1, 8, 1, 13),
                new selection_1.Selection(1, 16, 1, 19)
            ]);
            // cursors to the left of bracket pairs become selections of the entire pair
            editor.setSelections([
                new selection_1.Selection(1, 1, 1, 1),
                new selection_1.Selection(1, 6, 1, 6),
                new selection_1.Selection(1, 14, 1, 14)
            ]);
            bracketMatchingController.selectToBracket(true);
            assert.deepStrictEqual(editor.getSelections(), [
                new selection_1.Selection(1, 1, 1, 5),
                new selection_1.Selection(1, 8, 1, 13),
                new selection_1.Selection(1, 16, 1, 19)
            ]);
            // cursors just right of a bracket pair become selections of the entire pair
            editor.setSelections([
                new selection_1.Selection(1, 5, 1, 5),
                new selection_1.Selection(1, 13, 1, 13),
                new selection_1.Selection(1, 19, 1, 19)
            ]);
            bracketMatchingController.selectToBracket(true);
            assert.deepStrictEqual(editor.getSelections(), [
                new selection_1.Selection(1, 5, 1, 1),
                new selection_1.Selection(1, 13, 1, 8),
                new selection_1.Selection(1, 19, 1, 16)
            ]);
        });
        test('Removes brackets', () => {
            const editor = createCodeEditorWithBrackets('var x = (3 + (5-7)); y();');
            const bracketMatchingController = disposables.add(editor.registerAndInstantiateContribution(bracketMatching_1.BracketMatchingController.ID, bracketMatching_1.BracketMatchingController));
            function removeBrackets() {
                bracketMatchingController.removeBrackets();
            }
            // position before the bracket
            editor.setPosition(new position_1.Position(1, 9));
            removeBrackets();
            assert.deepStrictEqual(editor.getModel().getValue(), 'var x = 3 + (5-7); y();');
            editor.getModel().setValue('var x = (3 + (5-7)); y();');
            // position between brackets
            editor.setPosition(new position_1.Position(1, 16));
            removeBrackets();
            assert.deepStrictEqual(editor.getModel().getValue(), 'var x = (3 + 5-7); y();');
            removeBrackets();
            assert.deepStrictEqual(editor.getModel().getValue(), 'var x = 3 + 5-7; y();');
            removeBrackets();
            assert.deepStrictEqual(editor.getModel().getValue(), 'var x = 3 + 5-7; y();');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJhY2tldE1hdGNoaW5nLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9icmFja2V0TWF0Y2hpbmcvdGVzdC9icm93c2VyL2JyYWNrZXRNYXRjaGluZy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWdCQSxLQUFLLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxFQUFFO1FBQzlCLElBQUksV0FBNEIsQ0FBQztRQUNqQyxJQUFJLG9CQUE4QyxDQUFDO1FBQ25ELElBQUksNEJBQTJELENBQUM7UUFDaEUsSUFBSSxlQUFpQyxDQUFDO1FBRXRDLEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDVixXQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFDcEMsb0JBQW9CLEdBQUcsSUFBQSx5Q0FBd0IsRUFBQyxXQUFXLENBQUMsQ0FBQztZQUM3RCw0QkFBNEIsR0FBRyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsNkRBQTZCLENBQUMsQ0FBQztZQUN2RixlQUFlLEdBQUcsb0JBQW9CLENBQUMsR0FBRyxDQUFDLDJCQUFnQixDQUFDLENBQUM7UUFDOUQsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsR0FBRyxFQUFFO1lBQ2IsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLFNBQVMsMkJBQTJCLENBQUMsSUFBWTtZQUNoRCxNQUFNLFVBQVUsR0FBRyxhQUFhLENBQUM7WUFDakMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RFLFdBQVcsQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRTtnQkFDakUsUUFBUSxFQUFF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LENBQUMsV0FBVyxFQUFFLEVBQUUsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRTFFLGtDQUFrQztZQUNsQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4Qyx5QkFBeUIsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUUsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2xFLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRTNFLGtDQUFrQztZQUNsQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4Qyx5QkFBeUIsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUUsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2xFLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxFQUFFLElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRTNFLDRDQUE0QztZQUM1QyxNQUFNLENBQUMsV0FB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