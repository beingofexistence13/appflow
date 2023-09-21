define(["require", "exports", "assert", "vs/base/common/filters"], function (require, exports, assert, filters_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function filterOk(filter, word, wordToMatchAgainst, highlights) {
        const r = filter(word, wordToMatchAgainst);
        assert(r, `${word} didn't match ${wordToMatchAgainst}`);
        if (highlights) {
            assert.deepStrictEqual(r, highlights);
        }
    }
    function filterNotOk(filter, word, wordToMatchAgainst) {
        assert(!filter(word, wordToMatchAgainst), `${word} matched ${wordToMatchAgainst}`);
    }
    suite('Filters', () => {
        test('or', () => {
            let filter;
            let counters;
            const newFilter = function (i, r) {
                return function () { counters[i]++; return r; };
            };
            counters = [0, 0];
            filter = (0, filters_1.or)(newFilter(0, false), newFilter(1, false));
            filterNotOk(filter, 'anything', 'anything');
            assert.deepStrictEqual(counters, [1, 1]);
            counters = [0, 0];
            filter = (0, filters_1.or)(newFilter(0, true), newFilter(1, false));
            filterOk(filter, 'anything', 'anything');
            assert.deepStrictEqual(counters, [1, 0]);
            counters = [0, 0];
            filter = (0, filters_1.or)(newFilter(0, true), newFilter(1, true));
            filterOk(filter, 'anything', 'anything');
            assert.deepStrictEqual(counters, [1, 0]);
            counters = [0, 0];
            filter = (0, filters_1.or)(newFilter(0, false), newFilter(1, true));
            filterOk(filter, 'anything', 'anything');
            assert.deepStrictEqual(counters, [1, 1]);
        });
        test('PrefixFilter - case sensitive', function () {
            filterNotOk(filters_1.matchesStrictPrefix, '', '');
            filterOk(filters_1.matchesStrictPrefix, '', 'anything', []);
            filterOk(filters_1.matchesStrictPrefix, 'alpha', 'alpha', [{ start: 0, end: 5 }]);
            filterOk(filters_1.matchesStrictPrefix, 'alpha', 'alphasomething', [{ start: 0, end: 5 }]);
            filterNotOk(filters_1.matchesStrictPrefix, 'alpha', 'alp');
            filterOk(filters_1.matchesStrictPrefix, 'a', 'alpha', [{ start: 0, end: 1 }]);
            filterNotOk(filters_1.matchesStrictPrefix, 'x', 'alpha');
            filterNotOk(filters_1.matchesStrictPrefix, 'A', 'alpha');
            filterNotOk(filters_1.matchesStrictPrefix, 'AlPh', 'alPHA');
        });
        test('PrefixFilter - ignore case', function () {
            filterOk(filters_1.matchesPrefix, 'alpha', 'alpha', [{ start: 0, end: 5 }]);
            filterOk(filters_1.matchesPrefix, 'alpha', 'alphasomething', [{ start: 0, end: 5 }]);
            filterNotOk(filters_1.matchesPrefix, 'alpha', 'alp');
            filterOk(filters_1.matchesPrefix, 'a', 'alpha', [{ start: 0, end: 1 }]);
            filterOk(filters_1.matchesPrefix, 'ä', 'Älpha', [{ start: 0, end: 1 }]);
            filterNotOk(filters_1.matchesPrefix, 'x', 'alpha');
            filterOk(filters_1.matchesPrefix, 'A', 'alpha', [{ start: 0, end: 1 }]);
            filterOk(filters_1.matchesPrefix, 'AlPh', 'alPHA', [{ start: 0, end: 4 }]);
            filterNotOk(filters_1.matchesPrefix, 'T', '4'); // see https://github.com/microsoft/vscode/issues/22401
        });
        test('CamelCaseFilter', () => {
            filterNotOk(filters_1.matchesCamelCase, '', '');
            filterOk(filters_1.matchesCamelCase, '', 'anything', []);
            filterOk(filters_1.matchesCamelCase, 'alpha', 'alpha', [{ start: 0, end: 5 }]);
            filterOk(filters_1.matchesCamelCase, 'AlPhA', 'alpha', [{ start: 0, end: 5 }]);
            filterOk(filters_1.matchesCamelCase, 'alpha', 'alphasomething', [{ start: 0, end: 5 }]);
            filterNotOk(filters_1.matchesCamelCase, 'alpha', 'alp');
            filterOk(filters_1.matchesCamelCase, 'c', 'CamelCaseRocks', [
                { start: 0, end: 1 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'cc', 'CamelCaseRocks', [
                { start: 0, end: 1 },
                { start: 5, end: 6 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'ccr', 'CamelCaseRocks', [
                { start: 0, end: 1 },
                { start: 5, end: 6 },
                { start: 9, end: 10 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'cacr', 'CamelCaseRocks', [
                { start: 0, end: 2 },
                { start: 5, end: 6 },
                { start: 9, end: 10 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'cacar', 'CamelCaseRocks', [
                { start: 0, end: 2 },
                { start: 5, end: 7 },
                { start: 9, end: 10 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'ccarocks', 'CamelCaseRocks', [
                { start: 0, end: 1 },
                { start: 5, end: 7 },
                { start: 9, end: 14 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'cr', 'CamelCaseRocks', [
                { start: 0, end: 1 },
                { start: 9, end: 10 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'fba', 'FooBarAbe', [
                { start: 0, end: 1 },
                { start: 3, end: 5 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'fbar', 'FooBarAbe', [
                { start: 0, end: 1 },
                { start: 3, end: 6 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'fbara', 'FooBarAbe', [
                { start: 0, end: 1 },
                { start: 3, end: 7 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'fbaa', 'FooBarAbe', [
                { start: 0, end: 1 },
                { start: 3, end: 5 },
                { start: 6, end: 7 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'fbaab', 'FooBarAbe', [
                { start: 0, end: 1 },
                { start: 3, end: 5 },
                { start: 6, end: 8 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'c2d', 'canvasCreation2D', [
                { start: 0, end: 1 },
                { start: 14, end: 16 }
            ]);
            filterOk(filters_1.matchesCamelCase, 'cce', '_canvasCreationEvent', [
                { start: 1, end: 2 },
                { start: 7, end: 8 },
                { start: 15, end: 16 }
            ]);
        });
        test('CamelCaseFilter - #19256', function () {
            assert((0, filters_1.matchesCamelCase)('Debug Console', 'Open: Debug Console'));
            assert((0, filters_1.matchesCamelCase)('Debug console', 'Open: Debug Console'));
            assert((0, filters_1.matchesCamelCase)('debug console', 'Open: Debug Console'));
        });
        test('matchesContiguousSubString', () => {
            filterOk(filters_1.matchesContiguousSubString, 'cela', 'cancelAnimationFrame()', [
                { start: 3, end: 7 }
            ]);
        });
        test('matchesSubString', () => {
            filterOk(filters_1.matchesSubString, 'cmm', 'cancelAnimationFrame()', [
                { start: 0, end: 1 },
                { start: 9, end: 10 },
                { start: 18, end: 19 }
            ]);
            filterOk(filters_1.matchesSubString, 'abc', 'abcabc', [
                { start: 0, end: 3 },
            ]);
            filterOk(filters_1.matchesSubString, 'abc', 'aaabbbccc', [
                { start: 0, end: 1 },
                { start: 3, end: 4 },
                { start: 6, end: 7 },
            ]);
        });
        test('matchesSubString performance (#35346)', function () {
            filterNotOk(filters_1.matchesSubString, 'aaaaaaaaaaaaaaaaaaaax', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
        });
        test('WordFilter', () => {
            filterOk(filters_1.matchesWords, 'alpha', 'alpha', [{ start: 0, end: 5 }]);
            filterOk(filters_1.matchesWords, 'alpha', 'alphasomething', [{ start: 0, end: 5 }]);
            filterNotOk(filters_1.matchesWords, 'alpha', 'alp');
            filterOk(filters_1.matchesWords, 'a', 'alpha', [{ start: 0, end: 1 }]);
            filterNotOk(filters_1.matchesWords, 'x', 'alpha');
            filterOk(filters_1.matchesWords, 'A', 'alpha', [{ start: 0, end: 1 }]);
            filterOk(filters_1.matchesWords, 'AlPh', 'alPHA', [{ start: 0, end: 4 }]);
            assert((0, filters_1.matchesWords)('Debug Console', 'Open: Debug Console'));
            filterOk(filters_1.matchesWords, 'gp', 'Git: Pull', [{ start: 0, end: 1 }, { start: 5, end: 6 }]);
            filterOk(filters_1.matchesWords, 'g p', 'Git: Pull', [{ start: 0, end: 1 }, { start: 5, end: 6 }]);
            filterOk(filters_1.matchesWords, 'gipu', 'Git: Pull', [{ start: 0, end: 2 }, { start: 5, end: 7 }]);
            filterOk(filters_1.matchesWords, 'gp', 'Category: Git: Pull', [{ start: 10, end: 11 }, { start: 15, end: 16 }]);
            filterOk(filters_1.matchesWords, 'g p', 'Category: Git: Pull', [{ start: 10, end: 11 }, { start: 15, end: 16 }]);
            filterOk(filters_1.matchesWords, 'gipu', 'Category: Git: Pull', [{ start: 10, end: 12 }, { start: 15, end: 17 }]);
            filterNotOk(filters_1.matchesWords, 'it', 'Git: Pull');
            filterNotOk(filters_1.matchesWords, 'll', 'Git: Pull');
            filterOk(filters_1.matchesWords, 'git: プル', 'git: プル', [{ start: 0, end: 7 }]);
            filterOk(filters_1.matchesWords, 'git プル', 'git: プル', [{ start: 0, end: 3 }, { start: 5, end: 7 }]);
            filterOk(filters_1.matchesWords, 'öäk', 'Öhm: Älles Klar', [{ start: 0, end: 1 }, { start: 5, end: 6 }, { start: 11, end: 12 }]);
            // Handles issue #123915
            filterOk(filters_1.matchesWords, 'C++', 'C/C++: command', [{ start: 2, end: 5 }]);
            // Handles issue #154533
            filterOk(filters_1.matchesWords, '.', ':', []);
            filterOk(filters_1.matchesWords, '.', '.', [{ start: 0, end: 1 }]);
            // assert.ok(matchesWords('gipu', 'Category: Git: Pull', true) === null);
            // assert.deepStrictEqual(matchesWords('pu', 'Category: Git: Pull', true), [{ start: 15, end: 17 }]);
            filterOk(filters_1.matchesWords, 'bar', 'foo-bar');
            filterOk(filters_1.matchesWords, 'bar test', 'foo-bar test');
            filterOk(filters_1.matchesWords, 'fbt', 'foo-bar test');
            filterOk(filters_1.matchesWords, 'bar test', 'foo-bar (test)');
            filterOk(filters_1.matchesWords, 'foo bar', 'foo (bar)');
            filterNotOk(filters_1.matchesWords, 'bar est', 'foo-bar test');
            filterNotOk(filters_1.matchesWords, 'fo ar', 'foo-bar test');
            filterNotOk(filters_1.matchesWords, 'for', 'foo-bar test');
            filterOk(filters_1.matchesWords, 'foo bar', 'foo-bar');
            filterOk(filters_1.matchesWords, 'foo bar', '123 foo-bar 456');
            filterOk(filters_1.matchesWords, 'foo-bar', 'foo bar');
            filterOk(filters_1.matchesWords, 'foo:bar', 'foo:bar');
        });
        function assertMatches(pattern, word, decoratedWord, filter, opts = {}) {
            const r = filter(pattern, pattern.toLowerCase(), opts.patternPos || 0, word, word.toLowerCase(), opts.wordPos || 0, { firstMatchCanBeWeak: opts.firstMatchCanBeWeak ?? false, boostFullMatch: true });
            assert.ok(!decoratedWord === !r);
            if (r) {
                const matches = (0, filters_1.createMatches)(r);
                let actualWord = '';
                let pos = 0;
                for (const match of matches) {
                    actualWord += word.substring(pos, match.start);
                    actualWord += '^' + word.substring(match.start, match.end).split('').join('^');
                    pos = match.end;
                }
                actualWord += word.substring(pos);
                assert.strictEqual(actualWord, decoratedWord);
            }
        }
        test('fuzzyScore, #23215', function () {
            assertMatches('tit', 'win.tit', 'win.^t^i^t', filters_1.fuzzyScore);
            assertMatches('title', 'win.title', 'win.^t^i^t^l^e', filters_1.fuzzyScore);
            assertMatches('WordCla', 'WordCharacterClassifier', '^W^o^r^dCharacter^C^l^assifier', filters_1.fuzzyScore);
            assertMatches('WordCCla', 'WordCharacterClassifier', '^W^o^r^d^Character^C^l^assifier', filters_1.fuzzyScore);
        });
        test('fuzzyScore, #23332', function () {
            assertMatches('dete', '"editor.quickSuggestionsDelay"', undefined, filters_1.fuzzyScore);
        });
        test('fuzzyScore, #23190', function () {
            assertMatches('c:\\do', '& \'C:\\Documents and Settings\'', '& \'^C^:^\\^D^ocuments and Settings\'', filters_1.fuzzyScore);
            assertMatches('c:\\do', '& \'c:\\Documents and Settings\'', '& \'^c^:^\\^D^ocuments and Settings\'', filters_1.fuzzyScore);
        });
        test('fuzzyScore, #23581', function () {
            assertMatches('close', 'css.lint.importStatement', '^css.^lint.imp^ort^Stat^ement', filters_1.fuzzyScore);
            assertMatches('close', 'css.colorDecorators.enable', '^css.co^l^orDecorator^s.^enable', filters_1.fuzzyScore);
            assertMatches('close', 'workbench.quickOpen.closeOnFocusOut', 'workbench.quickOpen.^c^l^o^s^eOnFocusOut', filters_1.fuzzyScore);
            assertTopScore(filters_1.fuzzyScore, 'close', 2, 'css.lint.importStatement', 'css.colorDecorators.enable', 'workbench.quickOpen.closeOnFocusOut');
        });
        test('fuzzyScore, #23458', function () {
            assertMatches('highlight', 'editorHoverHighlight', 'editorHover^H^i^g^h^l^i^g^h^t', filters_1.fuzzyScore);
            assertMatches('hhighlight', 'editorHoverHighlight', 'editor^Hover^H^i^g^h^l^i^g^h^t', filters_1.fuzzyScore);
            assertMatches('dhhighlight', 'editorHoverHighlight', undefined, filters_1.fuzzyScore);
        });
        test('fuzzyScore, #23746', function () {
            assertMatches('-moz', '-moz-foo', '^-^m^o^z-foo', filters_1.fuzzyScore);
            assertMatches('moz', '-moz-foo', '-^m^o^z-foo', filters_1.fuzzyScore);
            assertMatches('moz', '-moz-animation', '-^m^o^z-animation', filters_1.fuzzyScore);
            assertMatches('moza', '-moz-animation', '-^m^o^z-^animation', filters_1.fuzzyScore);
        });
        test('fuzzyScore', () => {
            assertMatches('ab', 'abA', '^a^bA', filters_1.fuzzyScore);
            assertMatches('ccm', 'cacmelCase', '^ca^c^melCase', filters_1.fuzzyScore);
            assertMatches('bti', 'the_black_knight', undefined, filters_1.fuzzyScore);
            assertMatches('ccm', 'camelCase', undefined, filters_1.fuzzyScore);
            assertMatches('cmcm', 'camelCase', undefined, filters_1.fuzzyScore);
            assertMatches('BK', 'the_black_knight', 'the_^black_^knight', filters_1.fuzzyScore);
            assertMatches('KeyboardLayout=', 'KeyboardLayout', undefined, filters_1.fuzzyScore);
            assertMatches('LLL', 'SVisualLoggerLogsList', 'SVisual^Logger^Logs^List', filters_1.fuzzyScore);
            assertMatches('LLLL', 'SVilLoLosLi', undefined, filters_1.fuzzyScore);
            assertMatches('LLLL', 'SVisualLoggerLogsList', undefined, filters_1.fuzzyScore);
            assertMatches('TEdit', 'TextEdit', '^Text^E^d^i^t', filters_1.fuzzyScore);
            assertMatches('TEdit', 'TextEditor', '^Text^E^d^i^tor', filters_1.fuzzyScore);
            assertMatches('TEdit', 'Textedit', '^Text^e^d^i^t', filters_1.fuzzyScore);
            assertMatches('TEdit', 'text_edit', '^text_^e^d^i^t', filters_1.fuzzyScore);
            assertMatches('TEditDit', 'TextEditorDecorationType', '^Text^E^d^i^tor^Decorat^ion^Type', filters_1.fuzzyScore);
            assertMatches('TEdit', 'TextEditorDecorationType', '^Text^E^d^i^torDecorationType', filters_1.fuzzyScore);
            assertMatches('Tedit', 'TextEdit', '^Text^E^d^i^t', filters_1.fuzzyScore);
            assertMatches('ba', '?AB?', undefined, filters_1.fuzzyScore);
            assertMatches('bkn', 'the_black_knight', 'the_^black_^k^night', filters_1.fuzzyScore);
            assertMatches('bt', 'the_black_knight', 'the_^black_knigh^t', filters_1.fuzzyScore);
            assertMatches('ccm', 'camelCasecm', '^camel^Casec^m', filters_1.fuzzyScore);
            assertMatches('fdm', 'findModel', '^fin^d^Model', filters_1.fuzzyScore);
            assertMatches('fob', 'foobar', '^f^oo^bar', filters_1.fuzzyScore);
            assertMatches('fobz', 'foobar', undefined, filters_1.fuzzyScore);
            assertMatches('foobar', 'foobar', '^f^o^o^b^a^r', filters_1.fuzzyScore);
            assertMatches('form', 'editor.formatOnSave', 'editor.^f^o^r^matOnSave', filters_1.fuzzyScore);
            assertMatches('g p', 'Git: Pull', '^Git:^ ^Pull', filters_1.fuzzyScore);
            assertMatches('g p', 'Git: Pull', '^Git:^ ^Pull', filters_1.fuzzyScore);
            assertMatches('gip', 'Git: Pull', '^G^it: ^Pull', filters_1.fuzzyScore);
            assertMatches('gip', 'Git: Pull', '^G^it: ^Pull', filters_1.fuzzyScore);
            assertMatches('gp', 'Git: Pull', '^Git: ^Pull', filters_1.fuzzyScore);
            assertMatches('gp', 'Git_Git_Pull', '^Git_Git_^Pull', filters_1.fuzzyScore);
            assertMatches('is', 'ImportStatement', '^Import^Statement', filters_1.fuzzyScore);
            assertMatches('is', 'isValid', '^i^sValid', filters_1.fuzzyScore);
            assertMatches('lowrd', 'lowWord', '^l^o^wWo^r^d', filters_1.fuzzyScore);
            assertMatches('myvable', 'myvariable', '^m^y^v^aria^b^l^e', filters_1.fuzzyScore);
            assertMatches('no', '', undefined, filters_1.fuzzyScore);
            assertMatches('no', 'match', undefined, filters_1.fuzzyScore);
            assertMatches('ob', 'foobar', undefined, filters_1.fuzzyScore);
            assertMatches('sl', 'SVisualLoggerLogsList', '^SVisual^LoggerLogsList', filters_1.fuzzyScore);
            assertMatches('sllll', 'SVisualLoggerLogsList', '^SVisua^l^Logger^Logs^List', filters_1.fuzzyScore);
            assertMatches('Three', 'HTMLHRElement', undefined, filters_1.fuzzyScore);
            assertMatches('Three', 'Three', '^T^h^r^e^e', filters_1.fuzzyScore);
            assertMatches('fo', 'barfoo', undefined, filters_1.fuzzyScore);
            assertMatches('fo', 'bar_foo', 'bar_^f^oo', filters_1.fuzzyScore);
            assertMatches('fo', 'bar_Foo', 'bar_^F^oo', filters_1.fuzzyScore);
            assertMatches('fo', 'bar foo', 'bar ^f^oo', filters_1.fuzzyScore);
            assertMatches('fo', 'bar.foo', 'bar.^f^oo', filters_1.fuzzyScore);
            assertMatches('fo', 'bar/foo', 'bar/^f^oo', filters_1.fuzzyScore);
            assertMatches('fo', 'bar\\foo', 'bar\\^f^oo', filters_1.fuzzyScore);
        });
        test('fuzzyScore (first match can be weak)', function () {
            assertMatches('Three', 'HTMLHRElement', 'H^TML^H^R^El^ement', filters_1.fuzzyScore, { firstMatchCanBeWeak: true });
            assertMatches('tor', 'constructor', 'construc^t^o^r', filters_1.fuzzyScore, { firstMatchCanBeWeak: true });
            assertMatches('ur', 'constructor', 'constr^ucto^r', filters_1.fuzzyScore, { firstMatchCanBeWeak: true });
            assertTopScore(filters_1.fuzzyScore, 'tor', 2, 'constructor', 'Thor', 'cTor');
        });
        test('fuzzyScore, many matches', function () {
            assertMatches('aaaaaa', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', '^a^a^a^a^a^aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', filters_1.fuzzyScore);
        });
        test('Freeze when fjfj -> jfjf, https://github.com/microsoft/vscode/issues/91807', function () {
            assertMatches('jfjfj', 'fjfjfjfjfjfjfjfjfjfjfj', undefined, filters_1.fuzzyScore);
            assertMatches('jfjfjfjfjfjfjfjfjfj', 'fjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfj', undefined, filters_1.fuzzyScore);
            assertMatches('jfjfjfjfjfjfjfjfjfjjfjfjfjfjfjfjfjfjfjjfjfjfjfjfjfjfjfjfjjfjfjfjfjfjfjfjfjfjjfjfjfjfjfjfjfjfjfjjfjfjfjfjfjfjfjfjfj', 'fjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfj', undefined, filters_1.fuzzyScore);
            assertMatches('jfjfjfjfjfjfjfjfjfj', 'fJfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfj', 'f^J^f^j^f^j^f^j^f^j^f^j^f^j^f^j^f^j^f^jfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfj', // strong match
            filters_1.fuzzyScore);
            assertMatches('jfjfjfjfjfjfjfjfjfj', 'fjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfj', 'f^j^f^j^f^j^f^j^f^j^f^j^f^j^f^j^f^j^f^jfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfj', // any match
            filters_1.fuzzyScore, { firstMatchCanBeWeak: true });
        });
        test('fuzzyScore, issue #26423', function () {
            assertMatches('baba', 'abababab', undefined, filters_1.fuzzyScore);
            assertMatches('fsfsfs', 'dsafdsafdsafdsafdsafdsafdsafasdfdsa', undefined, filters_1.fuzzyScore);
            assertMatches('fsfsfsfsfsfsfsf', 'dsafdsafdsafdsafdsafdsafdsafasdfdsafdsafdsafdsafdsfdsafdsfdfdfasdnfdsajfndsjnafjndsajlknfdsa', undefined, filters_1.fuzzyScore);
        });
        test('Fuzzy IntelliSense matching vs Haxe metadata completion, #26995', function () {
            assertMatches('f', ':Foo', ':^Foo', filters_1.fuzzyScore);
            assertMatches('f', ':foo', ':^foo', filters_1.fuzzyScore);
        });
        test('Separator only match should not be weak #79558', function () {
            assertMatches('.', 'foo.bar', 'foo^.bar', filters_1.fuzzyScore);
        });
        test('Cannot set property \'1\' of undefined, #26511', function () {
            const word = new Array(123).join('a');
            const pattern = new Array(120).join('a');
            (0, filters_1.fuzzyScore)(pattern, pattern.toLowerCase(), 0, word, word.toLowerCase(), 0);
            assert.ok(true); // must not explode
        });
        test('Vscode 1.12 no longer obeys \'sortText\' in completion items (from language server), #26096', function () {
            assertMatches('  ', '  group', undefined, filters_1.fuzzyScore, { patternPos: 2 });
            assertMatches('  g', '  group', '  ^group', filters_1.fuzzyScore, { patternPos: 2 });
            assertMatches('g', '  group', '  ^group', filters_1.fuzzyScore);
            assertMatches('g g', '  groupGroup', undefined, filters_1.fuzzyScore);
            assertMatches('g g', '  group Group', '  ^group^ ^Group', filters_1.fuzzyScore);
            assertMatches(' g g', '  group Group', '  ^group^ ^Group', filters_1.fuzzyScore, { patternPos: 1 });
            assertMatches('zz', 'zzGroup', '^z^zGroup', filters_1.fuzzyScore);
            assertMatches('zzg', 'zzGroup', '^z^z^Group', filters_1.fuzzyScore);
            assertMatches('g', 'zzGroup', 'zz^Group', filters_1.fuzzyScore);
        });
        test('patternPos isn\'t working correctly #79815', function () {
            assertMatches(':p'.substr(1), 'prop', '^prop', filters_1.fuzzyScore, { patternPos: 0 });
            assertMatches(':p', 'prop', '^prop', filters_1.fuzzyScore, { patternPos: 1 });
            assertMatches(':p', 'prop', undefined, filters_1.fuzzyScore, { patternPos: 2 });
            assertMatches(':p', 'proP', 'pro^P', filters_1.fuzzyScore, { patternPos: 1, wordPos: 1 });
            assertMatches(':p', 'aprop', 'a^prop', filters_1.fuzzyScore, { patternPos: 1, firstMatchCanBeWeak: true });
            assertMatches(':p', 'aprop', undefined, filters_1.fuzzyScore, { patternPos: 1, firstMatchCanBeWeak: false });
        });
        function assertTopScore(filter, pattern, expected, ...words) {
            let topScore = -(100 * 10);
            let topIdx = 0;
            for (let i = 0; i < words.length; i++) {
                const word = words[i];
                const m = filter(pattern, pattern.toLowerCase(), 0, word, word.toLowerCase(), 0);
                if (m) {
                    const [score] = m;
                    if (score > topScore) {
                        topScore = score;
                        topIdx = i;
                    }
                }
            }
            assert.strictEqual(topIdx, expected, `${pattern} -> actual=${words[topIdx]} <> expected=${words[expected]}`);
        }
        test('topScore - fuzzyScore', function () {
            assertTopScore(filters_1.fuzzyScore, 'cons', 2, 'ArrayBufferConstructor', 'Console', 'console');
            assertTopScore(filters_1.fuzzyScore, 'Foo', 1, 'foo', 'Foo', 'foo');
            // #24904
            assertTopScore(filters_1.fuzzyScore, 'onMess', 1, 'onmessage', 'onMessage', 'onThisMegaEscape');
            assertTopScore(filters_1.fuzzyScore, 'CC', 1, 'camelCase', 'CamelCase');
            assertTopScore(filters_1.fuzzyScore, 'cC', 0, 'camelCase', 'CamelCase');
            // assertTopScore(fuzzyScore, 'cC', 1, 'ccfoo', 'camelCase');
            // assertTopScore(fuzzyScore, 'cC', 1, 'ccfoo', 'camelCase', 'foo-cC-bar');
            // issue #17836
            // assertTopScore(fuzzyScore, 'TEdit', 1, 'TextEditorDecorationType', 'TextEdit', 'TextEditor');
            assertTopScore(filters_1.fuzzyScore, 'p', 4, 'parse', 'posix', 'pafdsa', 'path', 'p');
            assertTopScore(filters_1.fuzzyScore, 'pa', 0, 'parse', 'pafdsa', 'path');
            // issue #14583
            assertTopScore(filters_1.fuzzyScore, 'log', 3, 'HTMLOptGroupElement', 'ScrollLogicalPosition', 'SVGFEMorphologyElement', 'log', 'logger');
            assertTopScore(filters_1.fuzzyScore, 'e', 2, 'AbstractWorker', 'ActiveXObject', 'else');
            // issue #14446
            assertTopScore(filters_1.fuzzyScore, 'workbench.sideb', 1, 'workbench.editor.defaultSideBySideLayout', 'workbench.sideBar.location');
            // issue #11423
            assertTopScore(filters_1.fuzzyScore, 'editor.r', 2, 'diffEditor.renderSideBySide', 'editor.overviewRulerlanes', 'editor.renderControlCharacter', 'editor.renderWhitespace');
            // assertTopScore(fuzzyScore, 'editor.R', 1, 'diffEditor.renderSideBySide', 'editor.overviewRulerlanes', 'editor.renderControlCharacter', 'editor.renderWhitespace');
            // assertTopScore(fuzzyScore, 'Editor.r', 0, 'diffEditor.renderSideBySide', 'editor.overviewRulerlanes', 'editor.renderControlCharacter', 'editor.renderWhitespace');
            assertTopScore(filters_1.fuzzyScore, '-mo', 1, '-ms-ime-mode', '-moz-columns');
            // dupe, issue #14861
            assertTopScore(filters_1.fuzzyScore, 'convertModelPosition', 0, 'convertModelPositionToViewPosition', 'convertViewToModelPosition');
            // dupe, issue #14942
            assertTopScore(filters_1.fuzzyScore, 'is', 0, 'isValidViewletId', 'import statement');
            assertTopScore(filters_1.fuzzyScore, 'title', 1, 'files.trimTrailingWhitespace', 'window.title');
            assertTopScore(filters_1.fuzzyScore, 'const', 1, 'constructor', 'const', 'cuOnstrul');
        });
        test('Unexpected suggestion scoring, #28791', function () {
            assertTopScore(filters_1.fuzzyScore, '_lines', 1, '_lineStarts', '_lines');
            assertTopScore(filters_1.fuzzyScore, '_lines', 1, '_lineS', '_lines');
            assertTopScore(filters_1.fuzzyScore, '_lineS', 0, '_lineS', '_lines');
        });
        test('HTML closing tag proposal filtered out #38880', function () {
            assertMatches('\t\t<', '\t\t</body>', '^\t^\t^</body>', filters_1.fuzzyScore, { patternPos: 0 });
            assertMatches('\t\t<', '\t\t</body>', '\t\t^</body>', filters_1.fuzzyScore, { patternPos: 2 });
            assertMatches('\t<', '\t</body>', '\t^</body>', filters_1.fuzzyScore, { patternPos: 1 });
        });
        test('fuzzyScoreGraceful', () => {
            assertMatches('rlut', 'result', undefined, filters_1.fuzzyScore);
            assertMatches('rlut', 'result', '^res^u^l^t', filters_1.fuzzyScoreGraceful);
            assertMatches('cno', 'console', '^co^ns^ole', filters_1.fuzzyScore);
            assertMatches('cno', 'console', '^co^ns^ole', filters_1.fuzzyScoreGraceful);
            assertMatches('cno', 'console', '^c^o^nsole', filters_1.fuzzyScoreGracefulAggressive);
            assertMatches('cno', 'co_new', '^c^o_^new', filters_1.fuzzyScoreGraceful);
            assertMatches('cno', 'co_new', '^c^o_^new', filters_1.fuzzyScoreGracefulAggressive);
        });
        test('List highlight filter: Not all characters from match are highlighterd #66923', () => {
            assertMatches('foo', 'barbarbarbarbarbarbarbarbarbarbarbarbarbarbarbar_foo', 'barbarbarbarbarbarbarbarbarbarbarbarbarbarbarbar_^f^o^o', filters_1.fuzzyScore);
        });
        test('Autocompletion is matched against truncated filterText to 54 characters #74133', () => {
            assertMatches('foo', 'ffffffffffffffffffffffffffffbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbar_foo', 'ffffffffffffffffffffffffffffbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbar_^f^o^o', filters_1.fuzzyScore);
            assertMatches('Aoo', 'Affffffffffffffffffffffffffffbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbar_foo', '^Affffffffffffffffffffffffffffbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbar_f^o^o', filters_1.fuzzyScore);
            assertMatches('foo', 'Gffffffffffffffffffffffffffffbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbar_foo', undefined, filters_1.fuzzyScore);
        });
        test('"Go to Symbol" with the exact method name doesn\'t work as expected #84787', function () {
            const match = (0, filters_1.fuzzyScore)(':get', ':get', 1, 'get', 'get', 0, { firstMatchCanBeWeak: true, boostFullMatch: true });
            assert.ok(Boolean(match));
        });
        test('Wrong highlight after emoji #113404', function () {
            assertMatches('di', '✨div classname=""></div>', '✨^d^iv classname=""></div>', filters_1.fuzzyScore);
            assertMatches('di', 'adiv classname=""></div>', 'adiv classname=""></^d^iv>', filters_1.fuzzyScore);
        });
        test('Suggestion is not highlighted #85826', function () {
            assertMatches('SemanticTokens', 'SemanticTokensEdits', '^S^e^m^a^n^t^i^c^T^o^k^e^n^sEdits', filters_1.fuzzyScore);
            assertMatches('SemanticTokens', 'SemanticTokensEdits', '^S^e^m^a^n^t^i^c^T^o^k^e^n^sEdits', filters_1.fuzzyScoreGracefulAggressive);
        });
        test('IntelliSense completion not correctly highlighting text in front of cursor #115250', function () {
            assertMatches('lo', 'log', '^l^og', filters_1.fuzzyScore);
            assertMatches('.lo', 'log', '^l^og', filters_1.anyScore);
            assertMatches('.', 'log', 'log', filters_1.anyScore);
        });
        test('anyScore should not require a strong first match', function () {
            assertMatches('bar', 'foobAr', 'foo^b^A^r', filters_1.anyScore);
            assertMatches('bar', 'foobar', 'foo^b^a^r', filters_1.anyScore);
        });
        test('configurable full match boost', function () {
            const prefix = 'create';
            const a = 'createModelServices';
            const b = 'create';
            const aBoost = (0, filters_1.fuzzyScore)(prefix, prefix, 0, a, a.toLowerCase(), 0, { boostFullMatch: true, firstMatchCanBeWeak: true });
            const bBoost = (0, filters_1.fuzzyScore)(prefix, prefix, 0, b, b.toLowerCase(), 0, { boostFullMatch: true, firstMatchCanBeWeak: true });
            assert.ok(aBoost);
            assert.ok(bBoost);
            assert.ok(aBoost[0] < bBoost[0]);
            const aScore = (0, filters_1.fuzzyScore)(prefix, prefix, 0, a, a.toLowerCase(), 0, { boostFullMatch: false, firstMatchCanBeWeak: true });
            const bScore = (0, filters_1.fuzzyScore)(prefix, prefix, 0, b, b.toLowerCase(), 0, { boostFullMatch: false, firstMatchCanBeWeak: true });
            assert.ok(aScore);
            assert.ok(bScore);
            assert.ok(aScore[0] === bScore[0]);
        });
        test('Unexpected suggest highlighting ignores whole word match in favor of matching first letter#147423', function () {
            assertMatches('i', 'machine/{id}', 'machine/{^id}', filters_1.fuzzyScore);
            assertMatches('ok', 'obobobf{ok}/user', '^obobobf{o^k}/user', filters_1.fuzzyScore);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVycy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS90ZXN0L2NvbW1vbi9maWx0ZXJzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBT0EsU0FBUyxRQUFRLENBQUMsTUFBZSxFQUFFLElBQVksRUFBRSxrQkFBMEIsRUFBRSxVQUE2QztRQUN6SCxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFDM0MsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksaUJBQWlCLGtCQUFrQixFQUFFLENBQUMsQ0FBQztRQUN4RCxJQUFJLFVBQVUsRUFBRTtZQUNmLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1NBQ3RDO0lBQ0YsQ0FBQztJQUVELFNBQVMsV0FBVyxDQUFDLE1BQWUsRUFBRSxJQUFZLEVBQUUsa0JBQTBCO1FBQzdFLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLENBQUMsRUFBRSxHQUFHLElBQUksWUFBWSxrQkFBa0IsRUFBRSxDQUFDLENBQUM7SUFDcEYsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFO1FBQ3JCLElBQUksQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFO1lBQ2YsSUFBSSxNQUFlLENBQUM7WUFDcEIsSUFBSSxRQUFrQixDQUFDO1lBQ3ZCLE1BQU0sU0FBUyxHQUFHLFVBQVUsQ0FBUyxFQUFFLENBQVU7Z0JBQ2hELE9BQU8sY0FBd0IsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsRSxDQUFDLENBQUM7WUFFRixRQUFRLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEIsTUFBTSxHQUFHLElBQUEs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QUUsQ0FBQyxDQUFDLENBQUM7WUFDekYsUUFBUSxDQUFDLHNCQUFZLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFMUYsUUFBUSxDQUFDLHNCQUFZLEVBQUUsSUFBSSxFQUFFLHFCQUFxQixFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN0RyxRQUFRLENBQUMsc0JBQVksRUFBRSxLQUFLLEVBQUUscUJBQXFCLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZHLFFBQVEsQ0FBQyxzQkFBWSxFQUFFLE1BQU0sRUFBRSxxQkFBcUIsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFeEcsV0FBVyxDQUFDLHNCQUFZLEVBQUUsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQzdDLFdBQVcsQ0FBQyxzQkFBWSxFQUFFLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztZQUU3QyxRQUFRLENBQUMsc0JBQVksRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDckUsUUFBUSxD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