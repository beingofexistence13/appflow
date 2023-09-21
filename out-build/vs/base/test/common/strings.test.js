define(["require", "exports", "assert", "vs/base/common/strings"], function (require, exports, assert, strings) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Strings', () => {
        test('equalsIgnoreCase', () => {
            assert(strings.$Me('', ''));
            assert(!strings.$Me('', '1'));
            assert(!strings.$Me('1', ''));
            assert(strings.$Me('a', 'a'));
            assert(strings.$Me('abc', 'Abc'));
            assert(strings.$Me('abc', 'ABC'));
            assert(strings.$Me('Höhenmeter', 'HÖhenmeter'));
            assert(strings.$Me('ÖL', 'Öl'));
        });
        test('beginsWithIgnoreCase', () => {
            assert(strings.$Ne('', ''));
            assert(!strings.$Ne('', '1'));
            assert(strings.$Ne('1', ''));
            assert(strings.$Ne('a', 'a'));
            assert(strings.$Ne('abc', 'Abc'));
            assert(strings.$Ne('abc', 'ABC'));
            assert(strings.$Ne('Höhenmeter', 'HÖhenmeter'));
            assert(strings.$Ne('ÖL', 'Öl'));
            assert(strings.$Ne('alles klar', 'a'));
            assert(strings.$Ne('alles klar', 'A'));
            assert(strings.$Ne('alles klar', 'alles k'));
            assert(strings.$Ne('alles klar', 'alles K'));
            assert(strings.$Ne('alles klar', 'ALLES K'));
            assert(strings.$Ne('alles klar', 'alles klar'));
            assert(strings.$Ne('alles klar', 'ALLES KLAR'));
            assert(!strings.$Ne('alles klar', ' ALLES K'));
            assert(!strings.$Ne('alles klar', 'ALLES K '));
            assert(!strings.$Ne('alles klar', 'öALLES K '));
            assert(!strings.$Ne('alles klar', ' '));
            assert(!strings.$Ne('alles klar', 'ö'));
        });
        test('compareIgnoreCase', () => {
            function assertCompareIgnoreCase(a, b, recurse = true) {
                let actual = strings.$He(a, b);
                actual = actual > 0 ? 1 : actual < 0 ? -1 : actual;
                let expected = strings.$Fe(a.toLowerCase(), b.toLowerCase());
                expected = expected > 0 ? 1 : expected < 0 ? -1 : expected;
                assert.strictEqual(actual, expected, `${a} <> ${b}`);
                if (recurse) {
                    assertCompareIgnoreCase(b, a, false);
                }
            }
            assertCompareIgnoreCase('', '');
            assertCompareIgnoreCase('abc', 'ABC');
            assertCompareIgnoreCase('abc', 'ABc');
            assertCompareIgnoreCase('abc', 'ABcd');
            assertCompareIgnoreCase('abc', 'abcd');
            assertCompareIgnoreCase('foo', 'föo');
            assertCompareIgnoreCase('Code', 'code');
            assertCompareIgnoreCase('Code', 'cöde');
            assertCompareIgnoreCase('B', 'a');
            assertCompareIgnoreCase('a', 'B');
            assertCompareIgnoreCase('b', 'a');
            assertCompareIgnoreCase('a', 'b');
            assertCompareIgnoreCase('aa', 'ab');
            assertCompareIgnoreCase('aa', 'aB');
            assertCompareIgnoreCase('aa', 'aA');
            assertCompareIgnoreCase('a', 'aa');
            assertCompareIgnoreCase('ab', 'aA');
            assertCompareIgnoreCase('O', '/');
        });
        test('compareIgnoreCase (substring)', () => {
            function assertCompareIgnoreCase(a, b, aStart, aEnd, bStart, bEnd, recurse = true) {
                let actual = strings.$Ie(a, b, aStart, aEnd, bStart, bEnd);
                actual = actual > 0 ? 1 : actual < 0 ? -1 : actual;
                let expected = strings.$Fe(a.toLowerCase().substring(aStart, aEnd), b.toLowerCase().substring(bStart, bEnd));
                expected = expected > 0 ? 1 : expected < 0 ? -1 : expected;
                assert.strictEqual(actual, expected, `${a} <> ${b}`);
                if (recurse) {
                    assertCompareIgnoreCase(b, a, bStart, bEnd, aStart, aEnd, false);
                }
            }
            assertCompareIgnoreCase('', '', 0, 0, 0, 0);
            assertCompareIgnoreCase('abc', 'ABC', 0, 1, 0, 1);
            assertCompareIgnoreCase('abc', 'Aabc', 0, 3, 1, 4);
            assertCompareIgnoreCase('abcABc', 'ABcd', 3, 6, 0, 4);
        });
        test('format', () => {
            assert.strictEqual(strings.$ne('Foo Bar'), 'Foo Bar');
            assert.strictEqual(strings.$ne('Foo {0} Bar'), 'Foo {0} Bar');
            assert.strictEqual(strings.$ne('Foo {0} Bar', 'yes'), 'Foo yes Bar');
            assert.strictEqual(strings.$ne('Foo {0} Bar {0}', 'yes'), 'Foo yes Bar yes');
            assert.strictEqual(strings.$ne('Foo {0} Bar {1}{2}', 'yes'), 'Foo yes Bar {1}{2}');
            assert.strictEqual(strings.$ne('Foo {0} Bar {1}{2}', 'yes', undefined), 'Foo yes Bar undefined{2}');
            assert.strictEqual(strings.$ne('Foo {0} Bar {1}{2}', 'yes', 5, false), 'Foo yes Bar 5false');
            assert.strictEqual(strings.$ne('Foo {0} Bar. {1}', '(foo)', '.test'), 'Foo (foo) Bar. .test');
        });
        test('format2', () => {
            assert.strictEqual(strings.$oe('Foo Bar', {}), 'Foo Bar');
            assert.strictEqual(strings.$oe('Foo {oops} Bar', {}), 'Foo {oops} Bar');
            assert.strictEqual(strings.$oe('Foo {foo} Bar', { foo: 'bar' }), 'Foo bar Bar');
            assert.strictEqual(strings.$oe('Foo {foo} Bar {foo}', { foo: 'bar' }), 'Foo bar Bar bar');
            assert.strictEqual(strings.$oe('Foo {foo} Bar {bar}{boo}', { foo: 'bar' }), 'Foo bar Bar {bar}{boo}');
            assert.strictEqual(strings.$oe('Foo {foo} Bar {bar}{boo}', { foo: 'bar', bar: 'undefined' }), 'Foo bar Bar undefined{boo}');
            assert.strictEqual(strings.$oe('Foo {foo} Bar {bar}{boo}', { foo: 'bar', bar: '5', boo: false }), 'Foo bar Bar 5false');
            assert.strictEqual(strings.$oe('Foo {foo} Bar. {bar}', { foo: '(foo)', bar: '.test' }), 'Foo (foo) Bar. .test');
        });
        test('lcut', () => {
            assert.strictEqual(strings.$7e('foo bar', 0), '');
            assert.strictEqual(strings.$7e('foo bar', 1), 'bar');
            assert.strictEqual(strings.$7e('foo bar', 3), 'bar');
            assert.strictEqual(strings.$7e('foo bar', 4), 'bar'); // Leading whitespace trimmed
            assert.strictEqual(strings.$7e('foo bar', 5), 'foo bar');
            assert.strictEqual(strings.$7e('test string 0.1.2.3', 3), '2.3');
            assert.strictEqual(strings.$7e('', 10), '');
            assert.strictEqual(strings.$7e('a', 10), 'a');
        });
        test('escape', () => {
            assert.strictEqual(strings.$pe(''), '');
            assert.strictEqual(strings.$pe('foo'), 'foo');
            assert.strictEqual(strings.$pe('foo bar'), 'foo bar');
            assert.strictEqual(strings.$pe('<foo bar>'), '&lt;foo bar&gt;');
            assert.strictEqual(strings.$pe('<foo>Hello</foo>'), '&lt;foo&gt;Hello&lt;/foo&gt;');
        });
        test('ltrim', () => {
            assert.strictEqual(strings.$ue('foo', 'f'), 'oo');
            assert.strictEqual(strings.$ue('foo', 'o'), 'foo');
            assert.strictEqual(strings.$ue('http://www.test.de', 'http://'), 'www.test.de');
            assert.strictEqual(strings.$ue('/foo/', '/'), 'foo/');
            assert.strictEqual(strings.$ue('//foo/', '/'), 'foo/');
            assert.strictEqual(strings.$ue('/', ''), '/');
            assert.strictEqual(strings.$ue('/', '/'), '');
            assert.strictEqual(strings.$ue('///', '/'), '');
            assert.strictEqual(strings.$ue('', ''), '');
            assert.strictEqual(strings.$ue('', '/'), '');
        });
        test('rtrim', () => {
            assert.strictEqual(strings.$ve('foo', 'o'), 'f');
            assert.strictEqual(strings.$ve('foo', 'f'), 'foo');
            assert.strictEqual(strings.$ve('http://www.test.de', '.de'), 'http://www.test');
            assert.strictEqual(strings.$ve('/foo/', '/'), '/foo');
            assert.strictEqual(strings.$ve('/foo//', '/'), '/foo');
            assert.strictEqual(strings.$ve('/', ''), '/');
            assert.strictEqual(strings.$ve('/', '/'), '');
            assert.strictEqual(strings.$ve('///', '/'), '');
            assert.strictEqual(strings.$ve('', ''), '');
            assert.strictEqual(strings.$ve('', '/'), '');
        });
        test('trim', () => {
            assert.strictEqual(strings.$te(' foo '), 'foo');
            assert.strictEqual(strings.$te('  foo'), 'foo');
            assert.strictEqual(strings.$te('bar  '), 'bar');
            assert.strictEqual(strings.$te('   '), '');
            assert.strictEqual(strings.$te('foo bar', 'bar'), 'foo ');
        });
        test('trimWhitespace', () => {
            assert.strictEqual(' foo '.trim(), 'foo');
            assert.strictEqual('	 foo	'.trim(), 'foo');
            assert.strictEqual('  foo'.trim(), 'foo');
            assert.strictEqual('bar  '.trim(), 'bar');
            assert.strictEqual('   '.trim(), '');
            assert.strictEqual(' 	  '.trim(), '');
        });
        test('lastNonWhitespaceIndex', () => {
            assert.strictEqual(strings.$De('abc  \t \t '), 2);
            assert.strictEqual(strings.$De('abc'), 2);
            assert.strictEqual(strings.$De('abc\t'), 2);
            assert.strictEqual(strings.$De('abc '), 2);
            assert.strictEqual(strings.$De('abc  \t \t '), 2);
            assert.strictEqual(strings.$De('abc  \t \t abc \t \t '), 11);
            assert.strictEqual(strings.$De('abc  \t \t abc \t \t ', 8), 2);
            assert.strictEqual(strings.$De('  \t \t '), -1);
        });
        test('containsRTL', () => {
            assert.strictEqual(strings.$1e('a'), false);
            assert.strictEqual(strings.$1e(''), false);
            assert.strictEqual(strings.$1e(strings.$9e + 'a'), false);
            assert.strictEqual(strings.$1e('hello world!'), false);
            assert.strictEqual(strings.$1e('a📚📚b'), false);
            assert.strictEqual(strings.$1e('هناك حقيقة مثبتة منذ زمن طويل'), true);
            assert.strictEqual(strings.$1e('זוהי עובדה מבוססת שדעתו'), true);
        });
        test('issue #115221: isEmojiImprecise misses ⭐', () => {
            const codePoint = strings.$Te('⭐', '⭐'.length, 0);
            assert.strictEqual(strings.$6e(codePoint), true);
        });
        test('isBasicASCII', () => {
            function assertIsBasicASCII(str, expected) {
                assert.strictEqual(strings.$2e(str), expected, str + ` (${str.charCodeAt(0)})`);
            }
            assertIsBasicASCII('abcdefghijklmnopqrstuvwxyz', true);
            assertIsBasicASCII('ABCDEFGHIJKLMNOPQRSTUVWXYZ', true);
            assertIsBasicASCII('1234567890', true);
            assertIsBasicASCII('`~!@#$%^&*()-_=+[{]}\\|;:\'",<.>/?', true);
            assertIsBasicASCII(' ', true);
            assertIsBasicASCII('\t', true);
            assertIsBasicASCII('\n', true);
            assertIsBasicASCII('\r', true);
            let ALL = '\r\t\n';
            for (let i = 32; i < 127; i++) {
                ALL += String.fromCharCode(i);
            }
            assertIsBasicASCII(ALL, true);
            assertIsBasicASCII(String.fromCharCode(31), false);
            assertIsBasicASCII(String.fromCharCode(127), false);
            assertIsBasicASCII('ü', false);
            assertIsBasicASCII('a📚📚b', false);
        });
        test('createRegExp', () => {
            // Empty
            assert.throws(() => strings.$ye('', false));
            // Escapes appropriately
            assert.strictEqual(strings.$ye('abc', false).source, 'abc');
            assert.strictEqual(strings.$ye('([^ ,.]*)', false).source, '\\(\\[\\^ ,\\.\\]\\*\\)');
            assert.strictEqual(strings.$ye('([^ ,.]*)', true).source, '([^ ,.]*)');
            // Whole word
            assert.strictEqual(strings.$ye('abc', false, { wholeWord: true }).source, '\\babc\\b');
            assert.strictEqual(strings.$ye('abc', true, { wholeWord: true }).source, '\\babc\\b');
            assert.strictEqual(strings.$ye(' abc', true, { wholeWord: true }).source, ' abc\\b');
            assert.strictEqual(strings.$ye('abc ', true, { wholeWord: true }).source, '\\babc ');
            assert.strictEqual(strings.$ye(' abc ', true, { wholeWord: true }).source, ' abc ');
            const regExpWithoutFlags = strings.$ye('abc', true);
            assert(!regExpWithoutFlags.global);
            assert(regExpWithoutFlags.ignoreCase);
            assert(!regExpWithoutFlags.multiline);
            const regExpWithFlags = strings.$ye('abc', true, { global: true, matchCase: true, multiline: true });
            assert(regExpWithFlags.global);
            assert(!regExpWithFlags.ignoreCase);
            assert(regExpWithFlags.multiline);
        });
        test('getLeadingWhitespace', () => {
            assert.strictEqual(strings.$Ce('  foo'), '  ');
            assert.strictEqual(strings.$Ce('  foo', 2), '');
            assert.strictEqual(strings.$Ce('  foo', 1, 1), '');
            assert.strictEqual(strings.$Ce('  foo', 0, 1), ' ');
            assert.strictEqual(strings.$Ce('  '), '  ');
            assert.strictEqual(strings.$Ce('  ', 1), ' ');
            assert.strictEqual(strings.$Ce('  ', 0, 1), ' ');
            assert.strictEqual(strings.$Ce('\t\tfunction foo(){', 0, 1), '\t');
            assert.strictEqual(strings.$Ce('\t\tfunction foo(){', 0, 2), '\t\t');
        });
        test('fuzzyContains', () => {
            assert.ok(!strings.$_e((undefined), null));
            assert.ok(strings.$_e('hello world', 'h'));
            assert.ok(!strings.$_e('hello world', 'q'));
            assert.ok(strings.$_e('hello world', 'hw'));
            assert.ok(strings.$_e('hello world', 'horl'));
            assert.ok(strings.$_e('hello world', 'd'));
            assert.ok(!strings.$_e('hello world', 'wh'));
            assert.ok(!strings.$_e('d', 'dd'));
        });
        test('startsWithUTF8BOM', () => {
            assert(strings.$0e(strings.$9e));
            assert(strings.$0e(strings.$9e + 'a'));
            assert(strings.$0e(strings.$9e + 'aaaaaaaaaa'));
            assert(!strings.$0e(' ' + strings.$9e));
            assert(!strings.$0e('foo'));
            assert(!strings.$0e(''));
        });
        test('stripUTF8BOM', () => {
            assert.strictEqual(strings.$$e(strings.$9e), '');
            assert.strictEqual(strings.$$e(strings.$9e + 'foobar'), 'foobar');
            assert.strictEqual(strings.$$e('foobar' + strings.$9e), 'foobar' + strings.$9e);
            assert.strictEqual(strings.$$e('abc'), 'abc');
            assert.strictEqual(strings.$$e(''), '');
        });
        test('containsUppercaseCharacter', () => {
            [
                [null, false],
                ['', false],
                ['foo', false],
                ['föö', false],
                ['ناك', false],
                ['מבוססת', false],
                ['😀', false],
                ['(#@()*&%()@*#&09827340982374}{:">?></\'\\~`', false],
                ['Foo', true],
                ['FOO', true],
                ['FöÖ', true],
                ['FöÖ', true],
                ['\\Foo', true],
            ].forEach(([str, result]) => {
                assert.strictEqual(strings.$af(str), result, `Wrong result for ${str}`);
            });
        });
        test('containsUppercaseCharacter (ignoreEscapedChars)', () => {
            [
                ['\\Woo', false],
                ['f\\S\\S', false],
                ['foo', false],
                ['Foo', true],
            ].forEach(([str, result]) => {
                assert.strictEqual(strings.$af(str, true), result, `Wrong result for ${str}`);
            });
        });
        test('uppercaseFirstLetter', () => {
            [
                ['', ''],
                ['foo', 'Foo'],
                ['f', 'F'],
                ['123', '123'],
                ['.a', '.a'],
            ].forEach(([inStr, result]) => {
                assert.strictEqual(strings.$bf(inStr), result, `Wrong result for ${inStr}`);
            });
        });
        test('getNLines', () => {
            assert.strictEqual(strings.$cf('', 5), '');
            assert.strictEqual(strings.$cf('foo', 5), 'foo');
            assert.strictEqual(strings.$cf('foo\nbar', 5), 'foo\nbar');
            assert.strictEqual(strings.$cf('foo\nbar', 2), 'foo\nbar');
            assert.strictEqual(strings.$cf('foo\nbar', 1), 'foo');
            assert.strictEqual(strings.$cf('foo\nbar'), 'foo');
            assert.strictEqual(strings.$cf('foo\nbar\nsomething', 2), 'foo\nbar');
            assert.strictEqual(strings.$cf('foo', 0), '');
        });
        test('getGraphemeBreakType', () => {
            assert.strictEqual(strings.$ef(0xBC1), 7 /* strings.GraphemeBreakType.SpacingMark */);
        });
        test('truncate', () => {
            assert.strictEqual('hello world', strings.$se('hello world', 100));
            assert.strictEqual('hello…', strings.$se('hello world', 5));
        });
        test('replaceAsync', async () => {
            let i = 0;
            assert.strictEqual(await strings.$Ee('abcabcabcabc', /b(.)/g, async (match, after) => {
                assert.strictEqual(match, 'bc');
                assert.strictEqual(after, 'c');
                return `${i++}${after}`;
            }), 'a0ca1ca2ca3c');
        });
        test('removeAnsiEscapeCodes', () => {
            const CSI = '\x1b\[';
            const sequences = [
                // Base cases from https://invisible-island.net/xterm/ctlseqs/ctlseqs.html#h3-Functions-using-CSI-_-ordered-by-the-final-character_s_
                `${CSI}42@`,
                `${CSI}42 @`,
                `${CSI}42A`,
                `${CSI}42 A`,
                `${CSI}42B`,
                `${CSI}42C`,
                `${CSI}42D`,
                `${CSI}42E`,
                `${CSI}42F`,
                `${CSI}42G`,
                `${CSI}42;42H`,
                `${CSI}42I`,
                `${CSI}42J`,
                `${CSI}?42J`,
                `${CSI}42K`,
                `${CSI}?42K`,
                `${CSI}42L`,
                `${CSI}42M`,
                `${CSI}42P`,
                `${CSI}#P`,
                `${CSI}3#P`,
                `${CSI}#Q`,
                `${CSI}3#Q`,
                `${CSI}#R`,
                `${CSI}42S`,
                `${CSI}?1;2;3S`,
                `${CSI}42T`,
                `${CSI}42;42;42;42;42T`,
                `${CSI}>3T`,
                `${CSI}42X`,
                `${CSI}42Z`,
                `${CSI}42^`,
                `${CSI}42\``,
                `${CSI}42a`,
                `${CSI}42b`,
                `${CSI}42c`,
                `${CSI}=42c`,
                `${CSI}>42c`,
                `${CSI}42d`,
                `${CSI}42e`,
                `${CSI}42;42f`,
                `${CSI}42g`,
                `${CSI}3h`,
                `${CSI}?3h`,
                `${CSI}42i`,
                `${CSI}?42i`,
                `${CSI}3l`,
                `${CSI}?3l`,
                `${CSI}3m`,
                `${CSI}>0;0m`,
                `${CSI}>0m`,
                `${CSI}?0m`,
                `${CSI}42n`,
                `${CSI}>42n`,
                `${CSI}?42n`,
                `${CSI}>42p`,
                `${CSI}!p`,
                `${CSI}0;0"p`,
                `${CSI}42$p`,
                `${CSI}?42$p`,
                `${CSI}#p`,
                `${CSI}3#p`,
                `${CSI}>42q`,
                `${CSI}42q`,
                `${CSI}42 q`,
                `${CSI}42"q`,
                `${CSI}#q`,
                `${CSI}42;42r`,
                `${CSI}?3r`,
                `${CSI}0;0;0;0;3$r`,
                `${CSI}s`,
                `${CSI}0;0s`,
                `${CSI}>42s`,
                `${CSI}?3s`,
                `${CSI}42;42;42t`,
                `${CSI}>3t`,
                `${CSI}42 t`,
                `${CSI}0;0;0;0;3$t`,
                `${CSI}u`,
                `${CSI}42 u`,
                `${CSI}0;0;0;0;0;0;0;0$v`,
                `${CSI}42$w`,
                `${CSI}0;0;0;0'w`,
                `${CSI}42x`,
                `${CSI}42*x`,
                `${CSI}0;0;0;0;0$x`,
                `${CSI}42#y`,
                `${CSI}0;0;0;0;0;0*y`,
                `${CSI}42;0'z`,
                `${CSI}0;1;2;4$z`,
                `${CSI}3'{`,
                `${CSI}#{`,
                `${CSI}3#{`,
                `${CSI}0;0;0;0\${`,
                `${CSI}0;0;0;0#|`,
                `${CSI}42$|`,
                `${CSI}42'|`,
                `${CSI}42*|`,
                `${CSI}#}`,
                `${CSI}42'}`,
                `${CSI}42$}`,
                `${CSI}42'~`,
                `${CSI}42$~`,
                // Common SGR cases:
                `${CSI}1;31m`,
                `${CSI}105m`,
                `${CSI}48:5:128m`,
                `${CSI}48;5;128m`,
                `${CSI}38:2:0:255:255:255m`,
                `${CSI}38;2;255;255;255m`,
                // Custom sequences:
                '\x1b]633;SetMark;\x07',
                '\x1b]633;P;Cwd=/foo\x07',
            ];
            for (const sequence of sequences) {
                assert.strictEqual(strings.$8e(`hello${sequence}world`), 'helloworld', `expect to remove ${JSON.stringify(sequence)}`);
            }
        });
    });
});
//# sourceMappingURL=strings.test.js.map