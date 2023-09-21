define(["require", "exports", "assert", "vs/editor/common/core/position", "vs/editor/common/core/selection", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/contrib/bracketMatching/browser/bracketMatching", "vs/editor/test/browser/testCodeEditor", "vs/editor/test/common/testTextModel", "vs/base/common/lifecycle", "vs/editor/common/languages/language", "vs/base/test/common/utils"], function (require, exports, assert, position_1, selection_1, languageConfigurationRegistry_1, bracketMatching_1, testCodeEditor_1, testTextModel_1, lifecycle_1, language_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('bracket matching', () => {
        let disposables;
        let instantiationService;
        let languageConfigurationService;
        let languageService;
        setup(() => {
            disposables = new lifecycle_1.$jc();
            instantiationService = (0, testCodeEditor_1.$Z0b)(disposables);
            languageConfigurationService = instantiationService.get(languageConfigurationRegistry_1.$2t);
            languageService = instantiationService.get(language_1.$ct);
        });
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.$bT)();
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
            return disposables.add((0, testTextModel_1.$P0b)(instantiationService, text, languageId));
        }
        function createCodeEditorWithBrackets(text) {
            return disposables.add((0, testCodeEditor_1.$20b)(instantiationService, createTextModelWithBrackets(text)));
        }
        test('issue #183: jump to matching bracket position', () => {
            const editor = createCodeEditorWithBrackets('var x = (3 + (5-7)) + ((5+3)+5);');
            const bracketMatchingController = disposables.add(editor.registerAndInstantiateContribution(bracketMatching_1.$f1.ID, bracketMatching_1.$f1));
            // start on closing bracket
            editor.setPosition(new position_1.$js(1, 20));
            bracketMatchingController.jumpToBracket();
            assert.deepStrictEqual(editor.getPosition(), new position_1.$js(1, 9));
            bracketMatchingController.jumpToBracket();
            assert.deepStrictEqual(editor.getPosition(), new position_1.$js(1, 19));
            bracketMatchingController.jumpToBracket();
            assert.deepStrictEqual(editor.getPosition(), new position_1.$js(1, 9));
            // start on opening bracket
            editor.setPosition(new position_1.$js(1, 23));
            bracketMatchingController.jumpToBracket();
            assert.deepStrictEqual(editor.getPosition(), new position_1.$js(1, 31));
            bracketMatchingController.jumpToBracket();
            assert.deepStrictEqual(editor.getPosition(), new position_1.$js(1, 23));
            bracketMatchingController.jumpToBracket();
            assert.deepStrictEqual(editor.getPosition(), new position_1.$js(1, 31));
        });
        test('Jump to next bracket', () => {
            const editor = createCodeEditorWithBrackets('var x = (3 + (5-7)); y();');
            const bracketMatchingController = disposables.add(editor.registerAndInstantiateContribution(bracketMatching_1.$f1.ID, bracketMatching_1.$f1));
            // start position between brackets
            editor.setPosition(new position_1.$js(1, 16));
            bracketMatchingController.jumpToBracket();
            assert.deepStrictEqual(editor.getPosition(), new position_1.$js(1, 18));
            bracketMatchingController.jumpToBracket();
            assert.deepStrictEqual(editor.getPosition(), new position_1.$js(1, 14));
            bracketMatchingController.jumpToBracket();
            assert.deepStrictEqual(editor.getPosition(), new position_1.$js(1, 18));
            // skip brackets in comments
            editor.setPosition(new position_1.$js(1, 21));
            bracketMatchingController.jumpToBracket();
            assert.deepStrictEqual(editor.getPosition(), new position_1.$js(1, 23));
            bracketMatchingController.jumpToBracket();
            assert.deepStrictEqual(editor.getPosition(), new position_1.$js(1, 24));
            bracketMatchingController.jumpToBracket();
            assert.deepStrictEqual(editor.getPosition(), new position_1.$js(1, 23));
            // do not break if no brackets are available
            editor.setPosition(new position_1.$js(1, 26));
            bracketMatchingController.jumpToBracket();
            assert.deepStrictEqual(editor.getPosition(), new position_1.$js(1, 26));
        });
        test('Select to next bracket', () => {
            const editor = createCodeEditorWithBrackets('var x = (3 + (5-7)); y();');
            const bracketMatchingController = disposables.add(editor.registerAndInstantiateContribution(bracketMatching_1.$f1.ID, bracketMatching_1.$f1));
            // start position in open brackets
            editor.setPosition(new position_1.$js(1, 9));
            bracketMatchingController.selectToBracket(true);
            assert.deepStrictEqual(editor.getPosition(), new position_1.$js(1, 20));
            assert.deepStrictEqual(editor.getSelection(), new selection_1.$ms(1, 9, 1, 20));
            // start position in close brackets (should select backwards)
            editor.setPosition(new position_1.$js(1, 20));
            bracketMatchingController.selectToBracket(true);
            assert.deepStrictEqual(editor.getPosition(), new position_1.$js(1, 9));
            assert.deepStrictEqual(editor.getSelection(), new selection_1.$ms(1, 20, 1, 9));
            // start position between brackets
            editor.setPosition(new position_1.$js(1, 16));
            bracketMatchingController.selectToBracket(true);
            assert.deepStrictEqual(editor.getPosition(), new position_1.$js(1, 19));
            assert.deepStrictEqual(editor.getSelection(), new selection_1.$ms(1, 14, 1, 19));
            // start position outside brackets
            editor.setPosition(new position_1.$js(1, 21));
            bracketMatchingController.selectToBracket(true);
            assert.deepStrictEqual(editor.getPosition(), new position_1.$js(1, 25));
            assert.deepStrictEqual(editor.getSelection(), new selection_1.$ms(1, 23, 1, 25));
            // do not break if no brackets are available
            editor.setPosition(new position_1.$js(1, 26));
            bracketMatchingController.selectToBracket(true);
            assert.deepStrictEqual(editor.getPosition(), new position_1.$js(1, 26));
            assert.deepStrictEqual(editor.getSelection(), new selection_1.$ms(1, 26, 1, 26));
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
            const bracketMatchingController = disposables.add(editor.registerAndInstantiateContribution(bracketMatching_1.$f1.ID, bracketMatching_1.$f1));
            editor.setPosition(new position_1.$js(3, 5));
            bracketMatchingController.jumpToBracket();
            assert.deepStrictEqual(editor.getSelection(), new selection_1.$ms(5, 1, 5, 1));
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
            const bracketMatchingController = disposables.add(editor.registerAndInstantiateContribution(bracketMatching_1.$f1.ID, bracketMatching_1.$f1));
            editor.setPosition(new position_1.$js(3, 5));
            bracketMatchingController.selectToBracket(false);
            assert.deepStrictEqual(editor.getSelection(), new selection_1.$ms(1, 12, 5, 1));
        });
        test('issue #45369: Select to Bracket with multicursor', () => {
            const editor = createCodeEditorWithBrackets('{  }   {   }   { }');
            const bracketMatchingController = disposables.add(editor.registerAndInstantiateContribution(bracketMatching_1.$f1.ID, bracketMatching_1.$f1));
            // cursors inside brackets become selections of the entire bracket contents
            editor.setSelections([
                new selection_1.$ms(1, 3, 1, 3),
                new selection_1.$ms(1, 10, 1, 10),
                new selection_1.$ms(1, 17, 1, 17)
            ]);
            bracketMatchingController.selectToBracket(true);
            assert.deepStrictEqual(editor.getSelections(), [
                new selection_1.$ms(1, 1, 1, 5),
                new selection_1.$ms(1, 8, 1, 13),
                new selection_1.$ms(1, 16, 1, 19)
            ]);
            // cursors to the left of bracket pairs become selections of the entire pair
            editor.setSelections([
                new selection_1.$ms(1, 1, 1, 1),
                new selection_1.$ms(1, 6, 1, 6),
                new selection_1.$ms(1, 14, 1, 14)
            ]);
            bracketMatchingController.selectToBracket(true);
            assert.deepStrictEqual(editor.getSelections(), [
                new selection_1.$ms(1, 1, 1, 5),
                new selection_1.$ms(1, 8, 1, 13),
                new selection_1.$ms(1, 16, 1, 19)
            ]);
            // cursors just right of a bracket pair become selections of the entire pair
            editor.setSelections([
                new selection_1.$ms(1, 5, 1, 5),
                new selection_1.$ms(1, 13, 1, 13),
                new selection_1.$ms(1, 19, 1, 19)
            ]);
            bracketMatchingController.selectToBracket(true);
            assert.deepStrictEqual(editor.getSelections(), [
                new selection_1.$ms(1, 5, 1, 1),
                new selection_1.$ms(1, 13, 1, 8),
                new selection_1.$ms(1, 19, 1, 16)
            ]);
        });
        test('Removes brackets', () => {
            const editor = createCodeEditorWithBrackets('var x = (3 + (5-7)); y();');
            const bracketMatchingController = disposables.add(editor.registerAndInstantiateContribution(bracketMatching_1.$f1.ID, bracketMatching_1.$f1));
            function removeBrackets() {
                bracketMatchingController.removeBrackets();
            }
            // position before the bracket
            editor.setPosition(new position_1.$js(1, 9));
            removeBrackets();
            assert.deepStrictEqual(editor.getModel().getValue(), 'var x = 3 + (5-7); y();');
            editor.getModel().setValue('var x = (3 + (5-7)); y();');
            // position between brackets
            editor.setPosition(new position_1.$js(1, 16));
            removeBrackets();
            assert.deepStrictEqual(editor.getModel().getValue(), 'var x = (3 + 5-7); y();');
            removeBrackets();
            assert.deepStrictEqual(editor.getModel().getValue(), 'var x = 3 + 5-7; y();');
            removeBrackets();
            assert.deepStrictEqual(editor.getModel().getValue(), 'var x = 3 + 5-7; y();');
        });
    });
});
//# sourceMappingURL=bracketMatching.test.js.map