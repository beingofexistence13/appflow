var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/editor/common/core/selection", "vs/editor/common/languages/language", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/languageService", "vs/editor/contrib/linesOperations/browser/moveLinesCommand", "vs/editor/test/browser/testCommand", "vs/editor/test/common/modes/testLanguageConfigurationService"], function (require, exports, lifecycle_1, utils_1, selection_1, language_1, languageConfigurationRegistry_1, languageService_1, moveLinesCommand_1, testCommand_1, testLanguageConfigurationService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function testMoveLinesDownCommand(lines, selection, expectedLines, expectedSelection, languageConfigurationService) {
        const disposables = new lifecycle_1.DisposableStore();
        if (!languageConfigurationService) {
            languageConfigurationService = disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService());
        }
        (0, testCommand_1.testCommand)(lines, null, selection, (accessor, sel) => new moveLinesCommand_1.MoveLinesCommand(sel, true, 3 /* EditorAutoIndentStrategy.Advanced */, languageConfigurationService), expectedLines, expectedSelection);
        disposables.dispose();
    }
    function testMoveLinesUpCommand(lines, selection, expectedLines, expectedSelection, languageConfigurationService) {
        const disposables = new lifecycle_1.DisposableStore();
        if (!languageConfigurationService) {
            languageConfigurationService = disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService());
        }
        (0, testCommand_1.testCommand)(lines, null, selection, (accessor, sel) => new moveLinesCommand_1.MoveLinesCommand(sel, false, 3 /* EditorAutoIndentStrategy.Advanced */, languageConfigurationService), expectedLines, expectedSelection);
        disposables.dispose();
    }
    function testMoveLinesDownWithIndentCommand(languageId, lines, selection, expectedLines, expectedSelection, languageConfigurationService) {
        const disposables = new lifecycle_1.DisposableStore();
        if (!languageConfigurationService) {
            languageConfigurationService = disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService());
        }
        (0, testCommand_1.testCommand)(lines, languageId, selection, (accessor, sel) => new moveLinesCommand_1.MoveLinesCommand(sel, true, 4 /* EditorAutoIndentStrategy.Full */, languageConfigurationService), expectedLines, expectedSelection);
        disposables.dispose();
    }
    function testMoveLinesUpWithIndentCommand(languageId, lines, selection, expectedLines, expectedSelection, languageConfigurationService) {
        const disposables = new lifecycle_1.DisposableStore();
        if (!languageConfigurationService) {
            languageConfigurationService = disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService());
        }
        (0, testCommand_1.testCommand)(lines, languageId, selection, (accessor, sel) => new moveLinesCommand_1.MoveLinesCommand(sel, false, 4 /* EditorAutoIndentStrategy.Full */, languageConfigurationService), expectedLines, expectedSelection);
        disposables.dispose();
    }
    suite('Editor Contrib - Move Lines Command', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('move first up / last down disabled', function () {
            testMoveLinesUpCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 1, 1, 1), [
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 1, 1, 1));
            testMoveLinesDownCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(5, 1, 5, 1), [
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(5, 1, 5, 1));
        });
        test('move first line down', function () {
            testMoveLinesDownCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 4, 1, 1), [
                'second line',
                'first',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 4, 2, 1));
        });
        test('move 2nd line up', function () {
            testMoveLinesUpCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 1, 2, 1), [
                'second line',
                'first',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 1, 1, 1));
        });
        test('issue #1322a: move 2nd line up', function () {
            testMoveLinesUpCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 12, 2, 12), [
                'second line',
                'first',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 12, 1, 12));
        });
        test('issue #1322b: move last line up', function () {
            testMoveLinesUpCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(5, 6, 5, 6), [
                'first',
                'second line',
                'third line',
                'fifth',
                'fourth line'
            ], new selection_1.Selection(4, 6, 4, 6));
        });
        test('issue #1322c: move last line selected up', function () {
            testMoveLinesUpCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(5, 6, 5, 1), [
                'first',
                'second line',
                'third line',
                'fifth',
                'fourth line'
            ], new selection_1.Selection(4, 6, 4, 1));
        });
        test('move last line up', function () {
            testMoveLinesUpCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(5, 1, 5, 1), [
                'first',
                'second line',
                'third line',
                'fifth',
                'fourth line'
            ], new selection_1.Selection(4, 1, 4, 1));
        });
        test('move 4th line down', function () {
            testMoveLinesDownCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(4, 1, 4, 1), [
                'first',
                'second line',
                'third line',
                'fifth',
                'fourth line'
            ], new selection_1.Selection(5, 1, 5, 1));
        });
        test('move multiple lines down', function () {
            testMoveLinesDownCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(4, 4, 2, 2), [
                'first',
                'fifth',
                'second line',
                'third line',
                'fourth line'
            ], new selection_1.Selection(5, 4, 3, 2));
        });
        test('invisible selection is ignored', function () {
            testMoveLinesDownCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 1, 1, 1), [
                'second line',
                'first',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(3, 1, 2, 1));
        });
    });
    let IndentRulesMode = class IndentRulesMode extends lifecycle_1.Disposable {
        constructor(indentationRules, languageService, languageConfigurationService) {
            super();
            this.languageId = 'moveLinesIndentMode';
            this._register(languageService.registerLanguage({ id: this.languageId }));
            this._register(languageConfigurationService.register(this.languageId, {
                indentationRules: indentationRules
            }));
        }
    };
    IndentRulesMode = __decorate([
        __param(1, language_1.ILanguageService),
        __param(2, languageConfigurationRegistry_1.ILanguageConfigurationService)
    ], IndentRulesMode);
    suite('Editor contrib - Move Lines Command honors Indentation Rules', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        const indentRules = {
            decreaseIndentPattern: /^\s*((?!\S.*\/[*]).*[*]\/\s*)?[})\]]|^\s*(case\b.*|default):\s*(\/\/.*|\/[*].*[*]\/\s*)?$/,
            increaseIndentPattern: /(\{[^}"'`]*|\([^)"']*|\[[^\]"']*|^\s*(\{\}|\(\)|\[\]|(case\b.*|default):))\s*(\/\/.*|\/[*].*[*]\/\s*)?$/,
            indentNextLinePattern: /^\s*(for|while|if|else)\b(?!.*[;{}]\s*(\/\/.*|\/[*].*[*]\/\s*)?$)/,
            unIndentedLinePattern: /^(?!.*([;{}]|\S:)\s*(\/\/.*|\/[*].*[*]\/\s*)?$)(?!.*(\{[^}"']*|\([^)"']*|\[[^\]"']*|^\s*(\{\}|\(\)|\[\]|(case\b.*|default):))\s*(\/\/.*|\/[*].*[*]\/\s*)?$)(?!^\s*((?!\S.*\/[*]).*[*]\/\s*)?[})\]]|^\s*(case\b.*|default):\s*(\/\/.*|\/[*].*[*]\/\s*)?$)(?!^\s*(for|while|if|else)\b(?!.*[;{}]\s*(\/\/.*|\/[*].*[*]\/\s*)?$))/
        };
        // https://github.com/microsoft/vscode/issues/28552#issuecomment-307862797
        test('first line indentation adjust to 0', () => {
            const languageService = new languageService_1.LanguageService();
            const languageConfigurationService = new testLanguageConfigurationService_1.TestLanguageConfigurationService();
            const mode = new IndentRulesMode(indentRules, languageService, languageConfigurationService);
            testMoveLinesUpWithIndentCommand(mode.languageId, [
                'class X {',
                '\tz = 2',
                '}'
            ], new selection_1.Selection(2, 1, 2, 1), [
                'z = 2',
                'class X {',
                '}'
            ], new selection_1.Selection(1, 1, 1, 1), languageConfigurationService);
            mode.dispose();
            languageService.dispose();
            languageConfigurationService.dispose();
        });
        // https://github.com/microsoft/vscode/issues/28552#issuecomment-307867717
        test('move lines across block', () => {
            const languageService = new languageService_1.LanguageService();
            const languageConfigurationService = new testLanguageConfigurationService_1.TestLanguageConfigurationService();
            const mode = new IndentRulesMode(indentRules, languageService, languageConfigurationService);
            testMoveLinesDownWithIndentCommand(mode.languageId, [
                'const value = 2;',
                'const standardLanguageDescriptions = [',
                '    {',
                '        diagnosticSource: \'js\',',
                '    }',
                '];'
            ], new selection_1.Selection(1, 1, 1, 1), [
                'const standardLanguageDescriptions = [',
                '    const value = 2;',
                '    {',
                '        diagnosticSource: \'js\',',
                '    }',
                '];'
            ], new selection_1.Selection(2, 5, 2, 5), languageConfigurationService);
            mode.dispose();
            languageService.dispose();
            languageConfigurationService.dispose();
        });
        test('move line should still work as before if there is no indentation rules', () => {
            testMoveLinesUpWithIndentCommand(null, [
                'if (true) {',
                '    var task = new Task(() => {',
                '        var work = 1234;',
                '    });',
                '}'
            ], new selection_1.Selection(3, 1, 3, 1), [
                'if (true) {',
                '        var work = 1234;',
                '    var task = new Task(() => {',
                '    });',
                '}'
            ], new selection_1.Selection(2, 1, 2, 1));
        });
    });
    let EnterRulesMode = class EnterRulesMode extends lifecycle_1.Disposable {
        constructor(languageService, languageConfigurationService) {
            super();
            this.languageId = 'moveLinesEnterMode';
            this._register(languageService.registerLanguage({ id: this.languageId }));
            this._register(languageConfigurationService.register(this.languageId, {
                indentationRules: {
                    decreaseIndentPattern: /^\s*\[$/,
                    increaseIndentPattern: /^\s*\]$/,
                },
                brackets: [
                    ['{', '}']
                ]
            }));
        }
    };
    EnterRulesMode = __decorate([
        __param(0, language_1.ILanguageService),
        __param(1, languageConfigurationRegistry_1.ILanguageConfigurationService)
    ], EnterRulesMode);
    suite('Editor - contrib - Move Lines Command honors onEnter Rules', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('issue #54829. move block across block', () => {
            const languageService = new languageService_1.LanguageService();
            const languageConfigurationService = new testLanguageConfigurationService_1.TestLanguageConfigurationService();
            const mode = new EnterRulesMode(languageService, languageConfigurationService);
            testMoveLinesDownWithIndentCommand(mode.languageId, [
                'if (true) {',
                '    if (false) {',
                '        if (1) {',
                '            console.log(\'b\');',
                '        }',
                '        console.log(\'a\');',
                '    }',
                '}'
            ], new selection_1.Selection(3, 9, 5, 10), [
                'if (true) {',
                '    if (false) {',
                '        console.log(\'a\');',
                '        if (1) {',
                '            console.log(\'b\');',
                '        }',
                '    }',
                '}'
            ], new selection_1.Selection(4, 9, 6, 10), languageConfigurationService);
            mode.dispose();
            languageService.dispose();
            languageConfigurationService.dispose();
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW92ZUxpbmVzQ29tbWFuZC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvbGluZXNPcGVyYXRpb25zL3Rlc3QvYnJvd3Nlci9tb3ZlTGluZXNDb21tYW5kLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBZ0JBLFNBQVMsd0JBQXdCLENBQUMsS0FBZSxFQUFFLFNBQW9CLEVBQUUsYUFBdUIsRUFBRSxpQkFBNEIsRUFBRSw0QkFBNEQ7UUFDM0wsTUFBTSxXQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7UUFDMUMsSUFBSSxDQUFDLDRCQUE0QixFQUFFO1lBQ2xDLDRCQUE0QixHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxtRUFBZ0MsRUFBRSxDQUFDLENBQUM7U0FDdkY7UUFDRCxJQUFBLHlCQUFXLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLG1DQUFnQixDQUFDLEdBQUcsRUFBRSxJQUFJLDZDQUFxQyw0QkFBNkIsQ0FBQyxFQUFFLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQzVMLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRUQsU0FBUyxzQkFBc0IsQ0FBQyxLQUFlLEVBQUUsU0FBb0IsRUFBRSxhQUF1QixFQUFFLGlCQUE0QixFQUFFLDRCQUE0RDtRQUN6TCxNQUFNLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztRQUMxQyxJQUFJLENBQUMsNEJBQTRCLEVBQUU7WUFDbEMsNEJBQTRCLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLG1FQUFnQyxFQUFFLENBQUMsQ0FBQztTQUN2RjtRQUNELElBQUEseUJBQVcsRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLElBQUksbUNBQWdCLENBQUMsR0FBRyxFQUFFLEtBQUssNkNBQXFDLDRCQUE2QixDQUFDLEVBQUUsYUFBYSxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFDN0wsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxTQUFTLGtDQUFrQyxDQUFDLFVBQWtCLEVBQUUsS0FBZSxFQUFFLFNBQW9CLEVBQUUsYUFBdUIsRUFBRSxpQkFBNEIsRUFBRSw0QkFBNEQ7UUFDek4sTUFBTSxXQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7UUFDMUMsSUFBSSxDQUFDLDRCQUE0QixFQUFFO1lBQ2xDLDRCQUE0QixHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxtRUFBZ0MsRUFBRSxDQUFDLENBQUM7U0FDdkY7UUFDRCxJQUFBLHlCQUFXLEVBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLG1DQUFnQixDQUFDLEdBQUcsRUFBRSxJQUFJLHlDQUFpQyw0QkFBNkIsQ0FBQyxFQUFFLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQzlMLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRUQsU0FBUyxnQ0FBZ0MsQ0FBQyxVQUFrQixFQUFFLEtBQWUsRUFBRSxTQUFvQixFQUFFLGFBQXVCLEVBQUUsaUJBQTRCLEVBQUUsNEJBQTREO1FBQ3ZOLE1BQU0sV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1FBQzFDLElBQUksQ0FBQyw0QkFBNEIsRUFBRTtZQUNsQyw0QkFBNEIsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksbUVBQWdDLEVBQUUsQ0FBQyxDQUFDO1NBQ3ZGO1FBQ0QsSUFBQSx5QkFBVyxFQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsSUFBSSxtQ0FBZ0IsQ0FBQyxHQUFHLEVBQUUsS0FBSyx5Q0FBaUMsNEJBQTZCLENBQUMsRUFBRSxhQUFhLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUMvTCxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUVELEtBQUssQ0FBQyxxQ0FBcUMsRUFBRSxHQUFHLEVBQUU7UUFFakQsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLElBQUksQ0FBQyxvQ0FBb0MsRUFBRTtZQUMxQyxzQkFBc0IsQ0FDckI7Z0JBQ0MsT0FBTztnQkFDUCxhQUFhO2dCQUNiLFlBQVk7Z0JBQ1osYUFBYTtnQkFDYixPQUFPO2FBQ1AsRUFDRCxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3pCO2dCQUNDLE9BQU87Z0JBQ1AsYUFBYTtnQkFDYixZQUFZO2dCQUNaLGFBQWE7Z0JBQ2IsT0FBTzthQUNQLEVBQ0QsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUN6QixDQUFDO1lBRUYsd0JBQXdCLENBQ3ZCO2dCQUNDLE9BQU87Z0JBQ1AsYUFBYTtnQkFDYixZQUFZO2dCQUNaLGFBQWE7Z0JBQ2IsT0FBTzthQUNQLEVBQ0QsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN6QjtnQkFDQyxPQUFPO2dCQUNQLGFBQWE7Z0JBQ2IsWUFBWTtnQkFDWixhQUFhO2dCQUNiLE9BQU87YUFDUCxFQUNELElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FDekIsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHNCQUFzQixFQUFFO1lBQzVCLHdCQUF3QixDQUN2QjtnQkFDQyxPQUFPO2dCQUNQLGFBQWE7Z0JBQ2IsWUFBWTtnQkFDWixhQUFhO2dCQUNiLE9BQU87YUFDUCxFQUNELElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDekI7Z0JBQ0MsYUFBYTtnQkFDYixPQUFPO2dCQUNQLFlBQVk7Z0JBQ1osYUFBYTtnQkFDYixPQUFPO2FBQ1AsRUFDRCxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQ3pCLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxrQkFBa0IsRUFBRTtZQUN4QixzQkFBc0IsQ0FDckI7Z0JBQ0MsT0FBTztnQkFDUCxhQUFhO2dCQUNiLFlBQVk7Z0JBQ1osYUFBYTtnQkFDYixPQUFPO2FBQ1AsRUFDRCxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3pCO2dCQUNDLGFBQWE7Z0JBQ2IsT0FBTztnQkFDUCxZQUFZO2dCQUNaLGFBQWE7Z0JBQ2IsT0FBTzthQUNQLEVBQ0QsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUN6QixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsZ0NBQWdDLEVBQUU7WUFDdEMsc0JBQXNCLENBQ3JCO2dCQUNDLE9BQU87Z0JBQ1AsYUFBYTtnQkFDYixZQUFZO2dCQUNaLGFBQWE7Z0JBQ2IsT0FBTzthQUNQLEVBQ0QsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUMzQjtnQkFDQyxhQUFhO2dCQUNiLE9BQU87Z0JBQ1AsWUFBWTtnQkFDWixhQUFhO2dCQUNiLE9BQU87YUFDUCxFQUNELElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FDM0IsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGlDQUFpQyxFQUFFO1lBQ3ZDLHNCQUFzQixDQUNyQjtnQkFDQyxPQUFPO2dCQUNQLGFBQWE7Z0JBQ2IsWUFBWTtnQkFDWixhQUFhO2dCQUNiLE9BQU87YUFDUCxFQUNELElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDekI7Z0JBQ0MsT0FBTztnQkFDUCxhQUFhO2dCQUNiLFlBQVk7Z0JBQ1osT0FBTztnQkFDUCxhQUFhO2FBQ2IsRUFDRCxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQ3pCLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQywwQ0FBMEMsRUFBRTtZQUNoRCxzQkFBc0IsQ0FDckI7Z0JBQ0MsT0FBTztnQkFDUCxhQUFhO2dCQUNiLFlBQVk7Z0JBQ1osYUFBYTtnQkFDYixPQUFPO2FBQ1AsRUFDRCxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3pCO2dCQUNDLE9BQU87Z0JBQ1AsYUFBYTtnQkFDYixZQUFZO2dCQUNaLE9BQU87Z0JBQ1AsYUFBYTthQUNiLEVBQ0QsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUN6QixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsbUJBQW1CLEVBQUU7WUFDekIsc0JBQXNCLENBQ3JCO2dCQUNDLE9BQU87Z0JBQ1AsYUFBYTtnQkFDYixZQUFZO2dCQUNaLGFBQWE7Z0JBQ2IsT0FBTzthQUNQLEVBQ0QsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN6QjtnQkFDQyxPQUFPO2dCQUNQLGFBQWE7Z0JBQ2IsWUFBWTtnQkFDWixPQUFPO2dCQUNQLGFBQWE7YUFDYixFQUNELElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FDekIsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLG9CQUFvQixFQUFFO1lBQzFCLHdCQUF3QixDQUN2QjtnQkFDQyxPQUFPO2dCQUNQLGFBQWE7Z0JBQ2IsWUFBWTtnQkFDWixhQUFhO2dCQUNiLE9BQU87YUFDUCxFQUNELElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDekI7Z0JBQ0MsT0FBTztnQkFDUCxhQUFhO2dCQUNiLFlBQVk7Z0JBQ1osT0FBTztnQkFDUCxhQUFhO2FBQ2IsRUFDRCxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQ3pCLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQywwQkFBMEIsRUFBRTtZQUNoQyx3QkFBd0IsQ0FDdkI7Z0JBQ0MsT0FBTztnQkFDUCxhQUFhO2dCQUNiLFlBQVk7Z0JBQ1osYUFBYTtnQkFDYixPQUFPO2FBQ1AsRUFDRCxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3pCO2dCQUNDLE9BQU87Z0JBQ1AsT0FBTztnQkFDUCxhQUFhO2dCQUNiLFlBQVk7Z0JBQ1osYUFBYTthQUNiLEVBQ0QsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUN6QixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsZ0NBQWdDLEVBQUU7WUFDdEMsd0JBQXdCLENBQ3ZCO2dCQUNDLE9BQU87Z0JBQ1AsYUFBYTtnQkFDYixZQUFZO2dCQUNaLGFBQWE7Z0JBQ2IsT0FBTzthQUNQLEVBQ0QsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN6QjtnQkFDQyxhQUFhO2dCQUNiLE9BQU87Z0JBQ1AsWUFBWTtnQkFDWixhQUFhO2dCQUNiLE9BQU87YUFDUCxFQUNELElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FDekIsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUM7SUFFSCxJQUFNLGVBQWUsR0FBckIsTUFBTSxlQUFnQixTQUFRLHNCQUFVO1FBRXZDLFlBQ0MsZ0JBQWlDLEVBQ2YsZUFBaUMsRUFDcEIsNEJBQTJEO1lBRTFGLEtBQUssRUFBRSxDQUFDO1lBTk8sZUFBVSxHQUFHLHFCQUFxQixDQUFDO1lBT2xELElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyw0QkFBNEIsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDckUsZ0JBQWdCLEVBQUUsZ0JBQWdCO2FBQ2xDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztLQUNELENBQUE7SUFiSyxlQUFlO1FBSWxCLFdBQUEsMkJBQWdCLENBQUE7UUFDaEIsV0FBQSw2REFBNkIsQ0FBQTtPQUwxQixlQUFlLENBYXBCO0lBRUQsS0FBSyxDQUFDLDhEQUE4RCxFQUFFLEdBQUcsRUFBRTtRQUUxRSxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsTUFBTSxXQUFXLEdBQUc7WUFDbkIscUJBQXFCLEVBQUUsMkZBQTJGO1lBQ2xILHFCQUFxQixFQUFFLHlHQUF5RztZQUNoSSxxQkFBcUIsRUFBRSxtRUFBbUU7WUFDMUYscUJBQXFCLEVBQUUsK1RBQStUO1NBQ3RWLENBQUM7UUFFRiwwRUFBMEU7UUFDMUUsSUFBSSxDQUFDLG9DQUFvQyxFQUFFLEdBQUcsRUFBRTtZQUMvQyxNQUFNLGVBQWUsR0FBRyxJQUFJLGlDQUFlLEVBQUUsQ0FBQztZQUM5QyxNQUFNLDRCQUE0QixHQUFHLElBQUksbUVBQWdDLEVBQUUsQ0FBQztZQUM1RSxNQUFNLElBQUksR0FBRyxJQUFJLGVBQWUsQ0FBQyxXQUFXLEVBQUUsZUFBZSxFQUFFLDRCQUE0QixDQUFDLENBQUM7WUFFN0YsZ0NBQWdDLENBQy9CLElBQUksQ0FBQyxVQUFVLEVBQ2Y7Z0JBQ0MsV0FBVztnQkFDWCxTQUFTO2dCQUNULEdBQUc7YUFDSCxFQUNELElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDekI7Z0JBQ0MsT0FBTztnQkFDUCxXQUFXO2dCQUNYLEdBQUc7YUFDSCxFQUNELElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDekIsNEJBQTRCLENBQzVCLENBQUM7WUFFRixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDZixlQUFlLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDMUIsNEJBQTRCLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDeEMsQ0FBQyxDQUFDLENBQUM7UUFFSCwwRUFBMEU7UUFDMUUsSUFBSSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtZQUNwQyxNQUFNLGVBQWUsR0FBRyxJQUFJLGlDQUFlLEVBQUUsQ0FBQztZQUM5QyxNQUFNLDRCQUE0QixHQUFHLElBQUksbUVBQWdDLEVBQUUsQ0FBQztZQUM1RSxNQUFNLElBQUksR0FBRyxJQUFJLGVBQWUsQ0FBQyxXQUFXLEVBQUUsZUFBZSxFQUFFLDRCQUE0QixDQUFDLENBQUM7WUFFN0Ysa0NBQWtDLENBQ2pDLElBQUksQ0FBQyxVQUFVLEVBQ2Y7Z0JBQ0Msa0JBQWtCO2dCQUNsQix3Q0FBd0M7Z0JBQ3hDLE9BQU87Z0JBQ1AsbUNBQW1DO2dCQUNuQyxPQUFPO2dCQUNQLElBQUk7YUFDSixFQUNELElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDekI7Z0JBQ0Msd0NBQXdDO2dCQUN4QyxzQkFBc0I7Z0JBQ3RCLE9BQU87Z0JBQ1AsbUNBQW1DO2dCQUNuQyxPQUFPO2dCQUNQLElBQUk7YUFDSixFQUNELElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDekIsNEJBQTRCLENBQzVCLENBQUM7WUFFRixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDZixlQUFlLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDMUIsNEJBQTRCLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDeEMsQ0FBQyxDQUFDLENBQUM7UUFHSCxJQUFJLENBQUMsd0VBQXdFLEVBQUUsR0FBRyxFQUFFO1lBQ25GLGdDQUFnQyxDQUMvQixJQUFLLEVBQ0w7Z0JBQ0MsYUFBYTtnQkFDYixpQ0FBaUM7Z0JBQ2pDLDBCQUEwQjtnQkFDMUIsU0FBUztnQkFDVCxHQUFHO2FBQ0gsRUFDRCxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3pCO2dCQUNDLGFBQWE7Z0JBQ2IsMEJBQTBCO2dCQUMxQixpQ0FBaUM7Z0JBQ2pDLFNBQVM7Z0JBQ1QsR0FBRzthQUNILEVBQ0QsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUN6QixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztJQUVILElBQU0sY0FBYyxHQUFwQixNQUFNLGNBQWUsU0FBUSxzQkFBVTtRQUV0QyxZQUNtQixlQUFpQyxFQUNwQiw0QkFBMkQ7WUFFMUYsS0FBSyxFQUFFLENBQUM7WUFMTyxlQUFVLEdBQUcsb0JBQW9CLENBQUM7WUFNakQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxRSxJQUFJLENBQUMsU0FBUyxDQUFDLDRCQUE0QixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUNyRSxnQkFBZ0IsRUFBRTtvQkFDakIscUJBQXFCLEVBQUUsU0FBUztvQkFDaEMscUJBQXFCLEVBQUUsU0FBUztpQkFDaEM7Z0JBQ0QsUUFBUSxFQUFFO29CQUNULENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztpQkFDVjthQUNELENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztLQUNELENBQUE7SUFsQkssY0FBYztRQUdqQixXQUFBLDJCQUFnQixDQUFBO1FBQ2hCLFdBQUEsNkRBQTZCLENBQUE7T0FKMUIsY0FBYyxDQWtCbkI7SUFFRCxLQUFLLENBQUMsNERBQTRELEVBQUUsR0FBRyxFQUFFO1FBRXhFLElBQUEsK0NBQXVDLEdBQUUsQ0FBQztRQUUxQyxJQUFJLENBQUMsdUNBQXVDLEVBQUUsR0FBRyxFQUFFO1lBQ2xELE1BQU0sZUFBZSxHQUFHLElBQUksaUNBQWUsRUFBRSxDQUFDO1lBQzlDLE1BQU0sNEJBQTRCLEdBQUcsSUFBSSxtRUFBZ0MsRUFBRSxDQUFDO1lBQzVFLE1BQU0sSUFBSSxHQUFHLElBQUksY0FBYyxDQUFDLGVBQWUsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO1lBRS9FLGtDQUFrQyxDQUNqQyxJQUFJLENBQUMsVUFBVSxFQUVmO2dCQUNDLGFBQWE7Z0JBQ2Isa0JBQWtCO2dCQUNsQixrQkFBa0I7Z0JBQ2xCLGlDQUFpQztnQkFDakMsV0FBVztnQkFDWCw2QkFBNkI7Z0JBQzdCLE9BQU87Z0JBQ1AsR0FBRzthQUNILEVBQ0QsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUMxQjtnQkFDQyxhQUFhO2dCQUNiLGtCQUFrQjtnQkFDbEIsNkJBQTZCO2dCQUM3QixrQkFBa0I7Z0JBQ2xCLGlDQUFpQztnQkFDakMsV0FBVztnQkFDWCxPQUFPO2dCQUNQLEdBQUc7YUFDSCxFQUNELElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFDMUIsNEJBQTRCLENBQzVCLENBQUM7WUFFRixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDZixlQUFlLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDMUIsNEJBQTRCLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDeEMsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyJ9