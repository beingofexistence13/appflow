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
            filterNotOk(filters_1.$xj, '', '');
            filterOk(filters_1.$xj, '', 'anything', []);
            filterOk(filters_1.$xj, 'alpha', 'alpha', [{ start: 0, end: 5 }]);
            filterOk(filters_1.$xj, 'alpha', 'alphasomething', [{ start: 0, end: 5 }]);
            filterNotOk(filters_1.$xj, 'alpha', 'alp');
            filterOk(filters_1.$xj, 'a', 'alpha', [{ start: 0, end: 1 }]);
            filterNotOk(filters_1.$xj, 'x', 'alpha');
            filterNotOk(filters_1.$xj, 'A', 'alpha');
            filterNotOk(filters_1.$xj, 'AlPh', 'alPHA');
        });
        test('PrefixFilter - ignore case', function () {
            filterOk(filters_1.$yj, 'alpha', 'alpha', [{ start: 0, end: 5 }]);
            filterOk(filters_1.$yj, 'alpha', 'alphasomething', [{ start: 0, end: 5 }]);
            filterNotOk(filters_1.$yj, 'alpha', 'alp');
            filterOk(filters_1.$yj, 'a', 'alpha', [{ start: 0, end: 1 }]);
            filterOk(filters_1.$yj, 'ä', 'Älpha', [{ start: 0, end: 1 }]);
            filterNotOk(filters_1.$yj, 'x', 'alpha');
            filterOk(filters_1.$yj, 'A', 'alpha', [{ start: 0, end: 1 }]);
            filterOk(filters_1.$yj, 'AlPh', 'alPHA', [{ start: 0, end: 4 }]);
            filterNotOk(filters_1.$yj, 'T', '4'); // see https://github.com/microsoft/vscode/issues/22401
        });
        test('CamelCaseFilter', () => {
            filterNotOk(filters_1.$Cj, '', '');
            filterOk(filters_1.$Cj, '', 'anything', []);
            filterOk(filters_1.$Cj, 'alpha', 'alpha', [{ start: 0, end: 5 }]);
            filterOk(filters_1.$Cj, 'AlPhA', 'alpha', [{ start: 0, end: 5 }]);
            filterOk(filters_1.$Cj, 'alpha', 'alphasomething', [{ start: 0, end: 5 }]);
            filterNotOk(filters_1.$Cj, 'alpha', 'alp');
            filterOk(filters_1.$Cj, 'c', 'CamelCaseRocks', [
                { start: 0, end: 1 }
            ]);
            filterOk(filters_1.$Cj, 'cc', 'CamelCaseRocks', [
                { start: 0, end: 1 },
                { start: 5, end: 6 }
            ]);
            filterOk(filters_1.$Cj, 'ccr', 'CamelCaseRocks', [
                { start: 0, end: 1 },
                { start: 5, end: 6 },
                { start: 9, end: 10 }
            ]);
            filterOk(filters_1.$Cj, 'cacr', 'CamelCaseRocks', [
                { start: 0, end: 2 },
                { start: 5, end: 6 },
                { start: 9, end: 10 }
            ]);
            filterOk(filters_1.$Cj, 'cacar', 'CamelCaseRocks', [
                { start: 0, end: 2 },
                { start: 5, end: 7 },
                { start: 9, end: 10 }
            ]);
            filterOk(filters_1.$Cj, 'ccarocks', 'CamelCaseRocks', [
                { start: 0, end: 1 },
                { start: 5, end: 7 },
                { start: 9, end: 14 }
            ]);
            filterOk(filters_1.$Cj, 'cr', 'CamelCaseRocks', [
                { start: 0, end: 1 },
                { start: 9, end: 10 }
            ]);
            filterOk(filters_1.$Cj, 'fba', 'FooBarAbe', [
                { start: 0, end: 1 },
                { start: 3, end: 5 }
            ]);
            filterOk(filters_1.$Cj, 'fbar', 'FooBarAbe', [
                { start: 0, end: 1 },
                { start: 3, end: 6 }
            ]);
            filterOk(filters_1.$Cj, 'fbara', 'FooBarAbe', [
                { start: 0, end: 1 },
                { start: 3, end: 7 }
            ]);
            filterOk(filters_1.$Cj, 'fbaa', 'FooBarAbe', [
                { start: 0, end: 1 },
                { start: 3, end: 5 },
                { start: 6, end: 7 }
            ]);
            filterOk(filters_1.$Cj, 'fbaab', 'FooBarAbe', [
                { start: 0, end: 1 },
                { start: 3, end: 5 },
                { start: 6, end: 8 }
            ]);
            filterOk(filters_1.$Cj, 'c2d', 'canvasCreation2D', [
                { start: 0, end: 1 },
                { start: 14, end: 16 }
            ]);
            filterOk(filters_1.$Cj, 'cce', '_canvasCreationEvent', [
                { start: 1, end: 2 },
                { start: 7, end: 8 },
                { start: 15, end: 16 }
            ]);
        });
        test('CamelCaseFilter - #19256', function () {
            assert((0, filters_1.$Cj)('Debug Console', 'Open: Debug Console'));
            assert((0, filters_1.$Cj)('Debug console', 'Open: Debug Console'));
            assert((0, filters_1.$Cj)('debug console', 'Open: Debug Console'));
        });
        test('matchesContiguousSubString', () => {
            filterOk(filters_1.$zj, 'cela', 'cancelAnimationFrame()', [
                { start: 3, end: 7 }
            ]);
        });
        test('matchesSubString', () => {
            filterOk(filters_1.$Aj, 'cmm', 'cancelAnimationFrame()', [
                { start: 0, end: 1 },
                { start: 9, end: 10 },
                { start: 18, end: 19 }
            ]);
            filterOk(filters_1.$Aj, 'abc', 'abcabc', [
                { start: 0, end: 3 },
            ]);
            filterOk(filters_1.$Aj, 'abc', 'aaabbbccc', [
                { start: 0, end: 1 },
                { start: 3, end: 4 },
                { start: 6, end: 7 },
            ]);
        });
        test('matchesSubString performance (#35346)', function () {
            filterNotOk(filters_1.$Aj, 'aaaaaaaaaaaaaaaaaaaax', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
        });
        test('WordFilter', () => {
            filterOk(filters_1.$Dj, 'alpha', 'alpha', [{ start: 0, end: 5 }]);
            filterOk(filters_1.$Dj, 'alpha', 'alphasomething', [{ start: 0, end: 5 }]);
            filterNotOk(filters_1.$Dj, 'alpha', 'alp');
            filterOk(filters_1.$Dj, 'a', 'alpha', [{ start: 0, end: 1 }]);
            filterNotOk(filters_1.$Dj, 'x', 'alpha');
            filterOk(filters_1.$Dj, 'A', 'alpha', [{ start: 0, end: 1 }]);
            filterOk(filters_1.$Dj, 'AlPh', 'alPHA', [{ start: 0, end: 4 }]);
            assert((0, filters_1.$Dj)('Debug Console', 'Open: Debug Console'));
            filterOk(filters_1.$Dj, 'gp', 'Git: Pull', [{ start: 0, end: 1 }, { start: 5, end: 6 }]);
            filterOk(filters_1.$Dj, 'g p', 'Git: Pull', [{ start: 0, end: 1 }, { start: 5, end: 6 }]);
            filterOk(filters_1.$Dj, 'gipu', 'Git: Pull', [{ start: 0, end: 2 }, { start: 5, end: 7 }]);
            filterOk(filters_1.$Dj, 'gp', 'Category: Git: Pull', [{ start: 10, end: 11 }, { start: 15, end: 16 }]);
            filterOk(filters_1.$Dj, 'g p', 'Category: Git: Pull', [{ start: 10, end: 11 }, { start: 15, end: 16 }]);
            filterOk(filters_1.$Dj, 'gipu', 'Category: Git: Pull', [{ start: 10, end: 12 }, { start: 15, end: 17 }]);
            filterNotOk(filters_1.$Dj, 'it', 'Git: Pull');
            filterNotOk(filters_1.$Dj, 'll', 'Git: Pull');
            filterOk(filters_1.$Dj, 'git: プル', 'git: プル', [{ start: 0, end: 7 }]);
            filterOk(filters_1.$Dj, 'git プル', 'git: プル', [{ start: 0, end: 3 }, { start: 5, end: 7 }]);
            filterOk(filters_1.$Dj, 'öäk', 'Öhm: Älles Klar', [{ start: 0, end: 1 }, { start: 5, end: 6 }, { start: 11, end: 12 }]);
            // Handles issue #123915
            filterOk(filters_1.$Dj, 'C++', 'C/C++: command', [{ start: 2, end: 5 }]);
            // Handles issue #154533
            filterOk(filters_1.$Dj, '.', ':', []);
            filterOk(filters_1.$Dj, '.', '.', [{ start: 0, end: 1 }]);
            // assert.ok(matchesWords('gipu', 'Category: Git: Pull', true) === null);
            // assert.deepStrictEqual(matchesWords('pu', 'Category: Git: Pull', true), [{ start: 15, end: 17 }]);
            filterOk(filters_1.$Dj, 'bar', 'foo-bar');
            filterOk(filters_1.$Dj, 'bar test', 'foo-bar test');
            filterOk(filters_1.$Dj, 'fbt', 'foo-bar test');
            filterOk(filters_1.$Dj, 'bar test', 'foo-bar (test)');
            filterOk(filters_1.$Dj, 'foo bar', 'foo (bar)');
            filterNotOk(filters_1.$Dj, 'bar est', 'foo-bar test');
            filterNotOk(filters_1.$Dj, 'fo ar', 'foo-bar test');
            filterNotOk(filters_1.$Dj, 'for', 'foo-bar test');
            filterOk(filters_1.$Dj, 'foo bar', 'foo-bar');
            filterOk(filters_1.$Dj, 'foo bar', '123 foo-bar 456');
            filterOk(filters_1.$Dj, 'foo-bar', 'foo bar');
            filterOk(filters_1.$Dj, 'foo:bar', 'foo:bar');
        });
        function assertMatches(pattern, word, decoratedWord, filter, opts = {}) {
            const r = filter(pattern, pattern.toLowerCase(), opts.patternPos || 0, word, word.toLowerCase(), opts.wordPos || 0, { firstMatchCanBeWeak: opts.firstMatchCanBeWeak ?? false, boostFullMatch: true });
            assert.ok(!decoratedWord === !r);
            if (r) {
                const matches = (0, filters_1.$Hj)(r);
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
            assertMatches('tit', 'win.tit', 'win.^t^i^t', filters_1.$Kj);
            assertMatches('title', 'win.title', 'win.^t^i^t^l^e', filters_1.$Kj);
            assertMatches('WordCla', 'WordCharacterClassifier', '^W^o^r^dCharacter^C^l^assifier', filters_1.$Kj);
            assertMatches('WordCCla', 'WordCharacterClassifier', '^W^o^r^d^Character^C^l^assifier', filters_1.$Kj);
        });
        test('fuzzyScore, #23332', function () {
            assertMatches('dete', '"editor.quickSuggestionsDelay"', undefined, filters_1.$Kj);
        });
        test('fuzzyScore, #23190', function () {
            assertMatches('c:\\do', '& \'C:\\Documents and Settings\'', '& \'^C^:^\\^D^ocuments and Settings\'', filters_1.$Kj);
            assertMatches('c:\\do', '& \'c:\\Documents and Settings\'', '& \'^c^:^\\^D^ocuments and Settings\'', filters_1.$Kj);
        });
        test('fuzzyScore, #23581', function () {
            assertMatches('close', 'css.lint.importStatement', '^css.^lint.imp^ort^Stat^ement', filters_1.$Kj);
            assertMatches('close', 'css.colorDecorators.enable', '^css.co^l^orDecorator^s.^enable', filters_1.$Kj);
            assertMatches('close', 'workbench.quickOpen.closeOnFocusOut', 'workbench.quickOpen.^c^l^o^s^eOnFocusOut', filters_1.$Kj);
            assertTopScore(filters_1.$Kj, 'close', 2, 'css.lint.importStatement', 'css.colorDecorators.enable', 'workbench.quickOpen.closeOnFocusOut');
        });
        test('fuzzyScore, #23458', function () {
            assertMatches('highlight', 'editorHoverHighlight', 'editorHover^H^i^g^h^l^i^g^h^t', filters_1.$Kj);
            assertMatches('hhighlight', 'editorHoverHighlight', 'editor^Hover^H^i^g^h^l^i^g^h^t', filters_1.$Kj);
            assertMatches('dhhighlight', 'editorHoverHighlight', undefined, filters_1.$Kj);
        });
        test('fuzzyScore, #23746', function () {
            assertMatches('-moz', '-moz-foo', '^-^m^o^z-foo', filters_1.$Kj);
            assertMatches('moz', '-moz-foo', '-^m^o^z-foo', filters_1.$Kj);
            assertMatches('moz', '-moz-animation', '-^m^o^z-animation', filters_1.$Kj);
            assertMatches('moza', '-moz-animation', '-^m^o^z-^animation', filters_1.$Kj);
        });
        test('fuzzyScore', () => {
            assertMatches('ab', 'abA', '^a^bA', filters_1.$Kj);
            assertMatches('ccm', 'cacmelCase', '^ca^c^melCase', filters_1.$Kj);
            assertMatches('bti', 'the_black_knight', undefined, filters_1.$Kj);
            assertMatches('ccm', 'camelCase', undefined, filters_1.$Kj);
            assertMatches('cmcm', 'camelCase', undefined, filters_1.$Kj);
            assertMatches('BK', 'the_black_knight', 'the_^black_^knight', filters_1.$Kj);
            assertMatches('KeyboardLayout=', 'KeyboardLayout', undefined, filters_1.$Kj);
            assertMatches('LLL', 'SVisualLoggerLogsList', 'SVisual^Logger^Logs^List', filters_1.$Kj);
            assertMatches('LLLL', 'SVilLoLosLi', undefined, filters_1.$Kj);
            assertMatches('LLLL', 'SVisualLoggerLogsList', undefined, filters_1.$Kj);
            assertMatches('TEdit', 'TextEdit', '^Text^E^d^i^t', filters_1.$Kj);
            assertMatches('TEdit', 'TextEditor', '^Text^E^d^i^tor', filters_1.$Kj);
            assertMatches('TEdit', 'Textedit', '^Text^e^d^i^t', filters_1.$Kj);
            assertMatches('TEdit', 'text_edit', '^text_^e^d^i^t', filters_1.$Kj);
            assertMatches('TEditDit', 'TextEditorDecorationType', '^Text^E^d^i^tor^Decorat^ion^Type', filters_1.$Kj);
            assertMatches('TEdit', 'TextEditorDecorationType', '^Text^E^d^i^torDecorationType', filters_1.$Kj);
            assertMatches('Tedit', 'TextEdit', '^Text^E^d^i^t', filters_1.$Kj);
            assertMatches('ba', '?AB?', undefined, filters_1.$Kj);
            assertMatches('bkn', 'the_black_knight', 'the_^black_^k^night', filters_1.$Kj);
            assertMatches('bt', 'the_black_knight', 'the_^black_knigh^t', filters_1.$Kj);
            assertMatches('ccm', 'camelCasecm', '^camel^Casec^m', filters_1.$Kj);
            assertMatches('fdm', 'findModel', '^fin^d^Model', filters_1.$Kj);
            assertMatches('fob', 'foobar', '^f^oo^bar', filters_1.$Kj);
            assertMatches('fobz', 'foobar', undefined, filters_1.$Kj);
            assertMatches('foobar', 'foobar', '^f^o^o^b^a^r', filters_1.$Kj);
            assertMatches('form', 'editor.formatOnSave', 'editor.^f^o^r^matOnSave', filters_1.$Kj);
            assertMatches('g p', 'Git: Pull', '^Git:^ ^Pull', filters_1.$Kj);
            assertMatches('g p', 'Git: Pull', '^Git:^ ^Pull', filters_1.$Kj);
            assertMatches('gip', 'Git: Pull', '^G^it: ^Pull', filters_1.$Kj);
            assertMatches('gip', 'Git: Pull', '^G^it: ^Pull', filters_1.$Kj);
            assertMatches('gp', 'Git: Pull', '^Git: ^Pull', filters_1.$Kj);
            assertMatches('gp', 'Git_Git_Pull', '^Git_Git_^Pull', filters_1.$Kj);
            assertMatches('is', 'ImportStatement', '^Import^Statement', filters_1.$Kj);
            assertMatches('is', 'isValid', '^i^sValid', filters_1.$Kj);
            assertMatches('lowrd', 'lowWord', '^l^o^wWo^r^d', filters_1.$Kj);
            assertMatches('myvable', 'myvariable', '^m^y^v^aria^b^l^e', filters_1.$Kj);
            assertMatches('no', '', undefined, filters_1.$Kj);
            assertMatches('no', 'match', undefined, filters_1.$Kj);
            assertMatches('ob', 'foobar', undefined, filters_1.$Kj);
            assertMatches('sl', 'SVisualLoggerLogsList', '^SVisual^LoggerLogsList', filters_1.$Kj);
            assertMatches('sllll', 'SVisualLoggerLogsList', '^SVisua^l^Logger^Logs^List', filters_1.$Kj);
            assertMatches('Three', 'HTMLHRElement', undefined, filters_1.$Kj);
            assertMatches('Three', 'Three', '^T^h^r^e^e', filters_1.$Kj);
            assertMatches('fo', 'barfoo', undefined, filters_1.$Kj);
            assertMatches('fo', 'bar_foo', 'bar_^f^oo', filters_1.$Kj);
            assertMatches('fo', 'bar_Foo', 'bar_^F^oo', filters_1.$Kj);
            assertMatches('fo', 'bar foo', 'bar ^f^oo', filters_1.$Kj);
            assertMatches('fo', 'bar.foo', 'bar.^f^oo', filters_1.$Kj);
            assertMatches('fo', 'bar/foo', 'bar/^f^oo', filters_1.$Kj);
            assertMatches('fo', 'bar\\foo', 'bar\\^f^oo', filters_1.$Kj);
        });
        test('fuzzyScore (first match can be weak)', function () {
            assertMatches('Three', 'HTMLHRElement', 'H^TML^H^R^El^ement', filters_1.$Kj, { firstMatchCanBeWeak: true });
            assertMatches('tor', 'constructor', 'construc^t^o^r', filters_1.$Kj, { firstMatchCanBeWeak: true });
            assertMatches('ur', 'constructor', 'constr^ucto^r', filters_1.$Kj, { firstMatchCanBeWeak: true });
            assertTopScore(filters_1.$Kj, 'tor', 2, 'constructor', 'Thor', 'cTor');
        });
        test('fuzzyScore, many matches', function () {
            assertMatches('aaaaaa', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', '^a^a^a^a^a^aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', filters_1.$Kj);
        });
        test('Freeze when fjfj -> jfjf, https://github.com/microsoft/vscode/issues/91807', function () {
            assertMatches('jfjfj', 'fjfjfjfjfjfjfjfjfjfjfj', undefined, filters_1.$Kj);
            assertMatches('jfjfjfjfjfjfjfjfjfj', 'fjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfj', undefined, filters_1.$Kj);
            assertMatches('jfjfjfjfjfjfjfjfjfjjfjfjfjfjfjfjfjfjfjjfjfjfjfjfjfjfjfjfjjfjfjfjfjfjfjfjfjfjjfjfjfjfjfjfjfjfjfjjfjfjfjfjfjfjfjfjfj', 'fjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfj', undefined, filters_1.$Kj);
            assertMatches('jfjfjfjfjfjfjfjfjfj', 'fJfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfj', 'f^J^f^j^f^j^f^j^f^j^f^j^f^j^f^j^f^j^f^jfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfj', // strong match
            filters_1.$Kj);
            assertMatches('jfjfjfjfjfjfjfjfjfj', 'fjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfj', 'f^j^f^j^f^j^f^j^f^j^f^j^f^j^f^j^f^j^f^jfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfj', // any match
            filters_1.$Kj, { firstMatchCanBeWeak: true });
        });
        test('fuzzyScore, issue #26423', function () {
            assertMatches('baba', 'abababab', undefined, filters_1.$Kj);
            assertMatches('fsfsfs', 'dsafdsafdsafdsafdsafdsafdsafasdfdsa', undefined, filters_1.$Kj);
            assertMatches('fsfsfsfsfsfsfsf', 'dsafdsafdsafdsafdsafdsafdsafasdfdsafdsafdsafdsafdsfdsafdsfdfdfasdnfdsajfndsjnafjndsajlknfdsa', undefined, filters_1.$Kj);
        });
        test('Fuzzy IntelliSense matching vs Haxe metadata completion, #26995', function () {
            assertMatches('f', ':Foo', ':^Foo', filters_1.$Kj);
            assertMatches('f', ':foo', ':^foo', filters_1.$Kj);
        });
        test('Separator only match should not be weak #79558', function () {
            assertMatches('.', 'foo.bar', 'foo^.bar', filters_1.$Kj);
        });
        test('Cannot set property \'1\' of undefined, #26511', function () {
            const word = new Array(123).join('a');
            const pattern = new Array(120).join('a');
            (0, filters_1.$Kj)(pattern, pattern.toLowerCase(), 0, word, word.toLowerCase(), 0);
            assert.ok(true); // must not explode
        });
        test('Vscode 1.12 no longer obeys \'sortText\' in completion items (from language server), #26096', function () {
            assertMatches('  ', '  group', undefined, filters_1.$Kj, { patternPos: 2 });
            assertMatches('  g', '  group', '  ^group', filters_1.$Kj, { patternPos: 2 });
            assertMatches('g', '  group', '  ^group', filters_1.$Kj);
            assertMatches('g g', '  groupGroup', undefined, filters_1.$Kj);
            assertMatches('g g', '  group Group', '  ^group^ ^Group', filters_1.$Kj);
            assertMatches(' g g', '  group Group', '  ^group^ ^Group', filters_1.$Kj, { patternPos: 1 });
            assertMatches('zz', 'zzGroup', '^z^zGroup', filters_1.$Kj);
            assertMatches('zzg', 'zzGroup', '^z^z^Group', filters_1.$Kj);
            assertMatches('g', 'zzGroup', 'zz^Group', filters_1.$Kj);
        });
        test('patternPos isn\'t working correctly #79815', function () {
            assertMatches(':p'.substr(1), 'prop', '^prop', filters_1.$Kj, { patternPos: 0 });
            assertMatches(':p', 'prop', '^prop', filters_1.$Kj, { patternPos: 1 });
            assertMatches(':p', 'prop', undefined, filters_1.$Kj, { patternPos: 2 });
            assertMatches(':p', 'proP', 'pro^P', filters_1.$Kj, { patternPos: 1, wordPos: 1 });
            assertMatches(':p', 'aprop', 'a^prop', filters_1.$Kj, { patternPos: 1, firstMatchCanBeWeak: true });
            assertMatches(':p', 'aprop', undefined, filters_1.$Kj, { patternPos: 1, firstMatchCanBeWeak: false });
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
            assertTopScore(filters_1.$Kj, 'cons', 2, 'ArrayBufferConstructor', 'Console', 'console');
            assertTopScore(filters_1.$Kj, 'Foo', 1, 'foo', 'Foo', 'foo');
            // #24904
            assertTopScore(filters_1.$Kj, 'onMess', 1, 'onmessage', 'onMessage', 'onThisMegaEscape');
            assertTopScore(filters_1.$Kj, 'CC', 1, 'camelCase', 'CamelCase');
            assertTopScore(filters_1.$Kj, 'cC', 0, 'camelCase', 'CamelCase');
            // assertTopScore(fuzzyScore, 'cC', 1, 'ccfoo', 'camelCase');
            // assertTopScore(fuzzyScore, 'cC', 1, 'ccfoo', 'camelCase', 'foo-cC-bar');
            // issue #17836
            // assertTopScore(fuzzyScore, 'TEdit', 1, 'TextEditorDecorationType', 'TextEdit', 'TextEditor');
            assertTopScore(filters_1.$Kj, 'p', 4, 'parse', 'posix', 'pafdsa', 'path', 'p');
            assertTopScore(filters_1.$Kj, 'pa', 0, 'parse', 'pafdsa', 'path');
            // issue #14583
            assertTopScore(filters_1.$Kj, 'log', 3, 'HTMLOptGroupElement', 'ScrollLogicalPosition', 'SVGFEMorphologyElement', 'log', 'logger');
            assertTopScore(filters_1.$Kj, 'e', 2, 'AbstractWorker', 'ActiveXObject', 'else');
            // issue #14446
            assertTopScore(filters_1.$Kj, 'workbench.sideb', 1, 'workbench.editor.defaultSideBySideLayout', 'workbench.sideBar.location');
            // issue #11423
            assertTopScore(filters_1.$Kj, 'editor.r', 2, 'diffEditor.renderSideBySide', 'editor.overviewRulerlanes', 'editor.renderControlCharacter', 'editor.renderWhitespace');
            // assertTopScore(fuzzyScore, 'editor.R', 1, 'diffEditor.renderSideBySide', 'editor.overviewRulerlanes', 'editor.renderControlCharacter', 'editor.renderWhitespace');
            // assertTopScore(fuzzyScore, 'Editor.r', 0, 'diffEditor.renderSideBySide', 'editor.overviewRulerlanes', 'editor.renderControlCharacter', 'editor.renderWhitespace');
            assertTopScore(filters_1.$Kj, '-mo', 1, '-ms-ime-mode', '-moz-columns');
            // dupe, issue #14861
            assertTopScore(filters_1.$Kj, 'convertModelPosition', 0, 'convertModelPositionToViewPosition', 'convertViewToModelPosition');
            // dupe, issue #14942
            assertTopScore(filters_1.$Kj, 'is', 0, 'isValidViewletId', 'import statement');
            assertTopScore(filters_1.$Kj, 'title', 1, 'files.trimTrailingWhitespace', 'window.title');
            assertTopScore(filters_1.$Kj, 'const', 1, 'constructor', 'const', 'cuOnstrul');
        });
        test('Unexpected suggestion scoring, #28791', function () {
            assertTopScore(filters_1.$Kj, '_lines', 1, '_lineStarts', '_lines');
            assertTopScore(filters_1.$Kj, '_lines', 1, '_lineS', '_lines');
            assertTopScore(filters_1.$Kj, '_lineS', 0, '_lineS', '_lines');
        });
        test('HTML closing tag proposal filtered out #38880', function () {
            assertMatches('\t\t<', '\t\t</body>', '^\t^\t^</body>', filters_1.$Kj, { patternPos: 0 });
            assertMatches('\t\t<', '\t\t</body>', '\t\t^</body>', filters_1.$Kj, { patternPos: 2 });
            assertMatches('\t<', '\t</body>', '\t^</body>', filters_1.$Kj, { patternPos: 1 });
        });
        test('fuzzyScoreGraceful', () => {
            assertMatches('rlut', 'result', undefined, filters_1.$Kj);
            assertMatches('rlut', 'result', '^res^u^l^t', filters_1.$Mj);
            assertMatches('cno', 'console', '^co^ns^ole', filters_1.$Kj);
            assertMatches('cno', 'console', '^co^ns^ole', filters_1.$Mj);
            assertMatches('cno', 'console', '^c^o^nsole', filters_1.$Lj);
            assertMatches('cno', 'co_new', '^c^o_^new', filters_1.$Mj);
            assertMatches('cno', 'co_new', '^c^o_^new', filters_1.$Lj);
        });
        test('List highlight filter: Not all characters from match are highlighterd #66923', () => {
            assertMatches('foo', 'barbarbarbarbarbarbarbarbarbarbarbarbarbarbarbar_foo', 'barbarbarbarbarbarbarbarbarbarbarbarbarbarbarbar_^f^o^o', filters_1.$Kj);
        });
        test('Autocompletion is matched against truncated filterText to 54 characters #74133', () => {
            assertMatches('foo', 'ffffffffffffffffffffffffffffbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbar_foo', 'ffffffffffffffffffffffffffffbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbar_^f^o^o', filters_1.$Kj);
            assertMatches('Aoo', 'Affffffffffffffffffffffffffffbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbar_foo', '^Affffffffffffffffffffffffffffbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbar_f^o^o', filters_1.$Kj);
            assertMatches('foo', 'Gffffffffffffffffffffffffffffbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbarbar_foo', undefined, filters_1.$Kj);
        });
        test('"Go to Symbol" with the exact method name doesn\'t work as expected #84787', function () {
            const match = (0, filters_1.$Kj)(':get', ':get', 1, 'get', 'get', 0, { firstMatchCanBeWeak: true, boostFullMatch: true });
            assert.ok(Boolean(match));
        });
        test('Wrong highlight after emoji #113404', function () {
            assertMatches('di', '✨div classname=""></div>', '✨^d^iv classname=""></div>', filters_1.$Kj);
            assertMatches('di', 'adiv classname=""></div>', 'adiv classname=""></^d^iv>', filters_1.$Kj);
        });
        test('Suggestion is not highlighted #85826', function () {
            assertMatches('SemanticTokens', 'SemanticTokensEdits', '^S^e^m^a^n^t^i^c^T^o^k^e^n^sEdits', filters_1.$Kj);
            assertMatches('SemanticTokens', 'SemanticTokensEdits', '^S^e^m^a^n^t^i^c^T^o^k^e^n^sEdits', filters_1.$Lj);
        });
        test('IntelliSense completion not correctly highlighting text in front of cursor #115250', function () {
            assertMatches('lo', 'log', '^l^og', filters_1.$Kj);
            assertMatches('.lo', 'log', '^l^og', filters_1.$Gj);
            assertMatches('.', 'log', 'log', filters_1.$Gj);
        });
        test('anyScore should not require a strong first match', function () {
            assertMatches('bar', 'foobAr', 'foo^b^A^r', filters_1.$Gj);
            assertMatches('bar', 'foobar', 'foo^b^a^r', filters_1.$Gj);
        });
        test('configurable full match boost', function () {
            const prefix = 'create';
            const a = 'createModelServices';
            const b = 'create';
            const aBoost = (0, filters_1.$Kj)(prefix, prefix, 0, a, a.toLowerCase(), 0, { boostFullMatch: true, firstMatchCanBeWeak: true });
            const bBoost = (0, filters_1.$Kj)(prefix, prefix, 0, b, b.toLowerCase(), 0, { boostFullMatch: true, firstMatchCanBeWeak: true });
            assert.ok(aBoost);
            assert.ok(bBoost);
            assert.ok(aBoost[0] < bBoost[0]);
            const aScore = (0, filters_1.$Kj)(prefix, prefix, 0, a, a.toLowerCase(), 0, { boostFullMatch: false, firstMatchCanBeWeak: true });
            const bScore = (0, filters_1.$Kj)(prefix, prefix, 0, b, b.toLowerCase(), 0, { boostFullMatch: false, firstMatchCanBeWeak: true });
            assert.ok(aScore);
            assert.ok(bScore);
            assert.ok(aScore[0] === bScore[0]);
        });
        test('Unexpected suggest highlighting ignores whole word match in favor of matching first letter#147423', function () {
            assertMatches('i', 'machine/{id}', 'machine/{^id}', filters_1.$Kj);
            assertMatches('ok', 'obobobf{ok}/user', '^obobobf{o^k}/user', filters_1.$Kj);
        });
    });
});
//# sourceMappingURL=filters.test.js.map