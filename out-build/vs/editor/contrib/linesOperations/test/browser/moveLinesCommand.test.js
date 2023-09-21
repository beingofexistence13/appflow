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
        const disposables = new lifecycle_1.$jc();
        if (!languageConfigurationService) {
            languageConfigurationService = disposables.add(new testLanguageConfigurationService_1.$D0b());
        }
        (0, testCommand_1.$30b)(lines, null, selection, (accessor, sel) => new moveLinesCommand_1.$y9(sel, true, 3 /* EditorAutoIndentStrategy.Advanced */, languageConfigurationService), expectedLines, expectedSelection);
        disposables.dispose();
    }
    function testMoveLinesUpCommand(lines, selection, expectedLines, expectedSelection, languageConfigurationService) {
        const disposables = new lifecycle_1.$jc();
        if (!languageConfigurationService) {
            languageConfigurationService = disposables.add(new testLanguageConfigurationService_1.$D0b());
        }
        (0, testCommand_1.$30b)(lines, null, selection, (accessor, sel) => new moveLinesCommand_1.$y9(sel, false, 3 /* EditorAutoIndentStrategy.Advanced */, languageConfigurationService), expectedLines, expectedSelection);
        disposables.dispose();
    }
    function testMoveLinesDownWithIndentCommand(languageId, lines, selection, expectedLines, expectedSelection, languageConfigurationService) {
        const disposables = new lifecycle_1.$jc();
        if (!languageConfigurationService) {
            languageConfigurationService = disposables.add(new testLanguageConfigurationService_1.$D0b());
        }
        (0, testCommand_1.$30b)(lines, languageId, selection, (accessor, sel) => new moveLinesCommand_1.$y9(sel, true, 4 /* EditorAutoIndentStrategy.Full */, languageConfigurationService), expectedLines, expectedSelection);
        disposables.dispose();
    }
    function testMoveLinesUpWithIndentCommand(languageId, lines, selection, expectedLines, expectedSelection, languageConfigurationService) {
        const disposables = new lifecycle_1.$jc();
        if (!languageConfigurationService) {
            languageConfigurationService = disposables.add(new testLanguageConfigurationService_1.$D0b());
        }
        (0, testCommand_1.$30b)(lines, languageId, selection, (accessor, sel) => new moveLinesCommand_1.$y9(sel, false, 4 /* EditorAutoIndentStrategy.Full */, languageConfigurationService), expectedLines, expectedSelection);
        disposables.dispose();
    }
    suite('Editor Contrib - Move Lines Command', () => {
        (0, utils_1.$bT)();
        test('move first up / last down disabled', function () {
            testMoveLinesUpCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 1, 1, 1), [
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 1, 1, 1));
            testMoveLinesDownCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(5, 1, 5, 1), [
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(5, 1, 5, 1));
        });
        test('move first line down', function () {
            testMoveLinesDownCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 4, 1, 1), [
                'second line',
                'first',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(2, 4, 2, 1));
        });
        test('move 2nd line up', function () {
            testMoveLinesUpCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(2, 1, 2, 1), [
                'second line',
                'first',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 1, 1, 1));
        });
        test('issue #1322a: move 2nd line up', function () {
            testMoveLinesUpCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(2, 12, 2, 12), [
                'second line',
                'first',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(1, 12, 1, 12));
        });
        test('issue #1322b: move last line up', function () {
            testMoveLinesUpCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(5, 6, 5, 6), [
                'first',
                'second line',
                'third line',
                'fifth',
                'fourth line'
            ], new selection_1.$ms(4, 6, 4, 6));
        });
        test('issue #1322c: move last line selected up', function () {
            testMoveLinesUpCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(5, 6, 5, 1), [
                'first',
                'second line',
                'third line',
                'fifth',
                'fourth line'
            ], new selection_1.$ms(4, 6, 4, 1));
        });
        test('move last line up', function () {
            testMoveLinesUpCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(5, 1, 5, 1), [
                'first',
                'second line',
                'third line',
                'fifth',
                'fourth line'
            ], new selection_1.$ms(4, 1, 4, 1));
        });
        test('move 4th line down', function () {
            testMoveLinesDownCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(4, 1, 4, 1), [
                'first',
                'second line',
                'third line',
                'fifth',
                'fourth line'
            ], new selection_1.$ms(5, 1, 5, 1));
        });
        test('move multiple lines down', function () {
            testMoveLinesDownCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(4, 4, 2, 2), [
                'first',
                'fifth',
                'second line',
                'third line',
                'fourth line'
            ], new selection_1.$ms(5, 4, 3, 2));
        });
        test('invisible selection is ignored', function () {
            testMoveLinesDownCommand([
                'first',
                'second line',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(2, 1, 1, 1), [
                'second line',
                'first',
                'third line',
                'fourth line',
                'fifth'
            ], new selection_1.$ms(3, 1, 2, 1));
        });
    });
    let IndentRulesMode = class IndentRulesMode extends lifecycle_1.$kc {
        constructor(indentationRules, languageService, languageConfigurationService) {
            super();
            this.languageId = 'moveLinesIndentMode';
            this.B(languageService.registerLanguage({ id: this.languageId }));
            this.B(languageConfigurationService.register(this.languageId, {
                indentationRules: indentationRules
            }));
        }
    };
    IndentRulesMode = __decorate([
        __param(1, language_1.$ct),
        __param(2, languageConfigurationRegistry_1.$2t)
    ], IndentRulesMode);
    suite('Editor contrib - Move Lines Command honors Indentation Rules', () => {
        (0, utils_1.$bT)();
        const indentRules = {
            decreaseIndentPattern: /^\s*((?!\S.*\/[*]).*[*]\/\s*)?[})\]]|^\s*(case\b.*|default):\s*(\/\/.*|\/[*].*[*]\/\s*)?$/,
            increaseIndentPattern: /(\{[^}"'`]*|\([^)"']*|\[[^\]"']*|^\s*(\{\}|\(\)|\[\]|(case\b.*|default):))\s*(\/\/.*|\/[*].*[*]\/\s*)?$/,
            indentNextLinePattern: /^\s*(for|while|if|else)\b(?!.*[;{}]\s*(\/\/.*|\/[*].*[*]\/\s*)?$)/,
            unIndentedLinePattern: /^(?!.*([;{}]|\S:)\s*(\/\/.*|\/[*].*[*]\/\s*)?$)(?!.*(\{[^}"']*|\([^)"']*|\[[^\]"']*|^\s*(\{\}|\(\)|\[\]|(case\b.*|default):))\s*(\/\/.*|\/[*].*[*]\/\s*)?$)(?!^\s*((?!\S.*\/[*]).*[*]\/\s*)?[})\]]|^\s*(case\b.*|default):\s*(\/\/.*|\/[*].*[*]\/\s*)?$)(?!^\s*(for|while|if|else)\b(?!.*[;{}]\s*(\/\/.*|\/[*].*[*]\/\s*)?$))/
        };
        // https://github.com/microsoft/vscode/issues/28552#issuecomment-307862797
        test('first line indentation adjust to 0', () => {
            const languageService = new languageService_1.$jmb();
            const languageConfigurationService = new testLanguageConfigurationService_1.$D0b();
            const mode = new IndentRulesMode(indentRules, languageService, languageConfigurationService);
            testMoveLinesUpWithIndentCommand(mode.languageId, [
                'class X {',
                '\tz = 2',
                '}'
            ], new selection_1.$ms(2, 1, 2, 1), [
                'z = 2',
                'class X {',
                '}'
            ], new selection_1.$ms(1, 1, 1, 1), languageConfigurationService);
            mode.dispose();
            languageService.dispose();
            languageConfigurationService.dispose();
        });
        // https://github.com/microsoft/vscode/issues/28552#issuecomment-307867717
        test('move lines across block', () => {
            const languageService = new languageService_1.$jmb();
            const languageConfigurationService = new testLanguageConfigurationService_1.$D0b();
            const mode = new IndentRulesMode(indentRules, languageService, languageConfigurationService);
            testMoveLinesDownWithIndentCommand(mode.languageId, [
                'const value = 2;',
                'const standardLanguageDescriptions = [',
                '    {',
                '        diagnosticSource: \'js\',',
                '    }',
                '];'
            ], new selection_1.$ms(1, 1, 1, 1), [
                'const standardLanguageDescriptions = [',
                '    const value = 2;',
                '    {',
                '        diagnosticSource: \'js\',',
                '    }',
                '];'
            ], new selection_1.$ms(2, 5, 2, 5), languageConfigurationService);
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
            ], new selection_1.$ms(3, 1, 3, 1), [
                'if (true) {',
                '        var work = 1234;',
                '    var task = new Task(() => {',
                '    });',
                '}'
            ], new selection_1.$ms(2, 1, 2, 1));
        });
    });
    let EnterRulesMode = class EnterRulesMode extends lifecycle_1.$kc {
        constructor(languageService, languageConfigurationService) {
            super();
            this.languageId = 'moveLinesEnterMode';
            this.B(languageService.registerLanguage({ id: this.languageId }));
            this.B(languageConfigurationService.register(this.languageId, {
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
        __param(0, language_1.$ct),
        __param(1, languageConfigurationRegistry_1.$2t)
    ], EnterRulesMode);
    suite('Editor - contrib - Move Lines Command honors onEnter Rules', () => {
        (0, utils_1.$bT)();
        test('issue #54829. move block across block', () => {
            const languageService = new languageService_1.$jmb();
            const languageConfigurationService = new testLanguageConfigurationService_1.$D0b();
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
            ], new selection_1.$ms(3, 9, 5, 10), [
                'if (true) {',
                '    if (false) {',
                '        console.log(\'a\');',
                '        if (1) {',
                '            console.log(\'b\');',
                '        }',
                '    }',
                '}'
            ], new selection_1.$ms(4, 9, 6, 10), languageConfigurationService);
            mode.dispose();
            languageService.dispose();
            languageConfigurationService.dispose();
        });
    });
});
//# sourceMappingURL=moveLinesCommand.test.js.map