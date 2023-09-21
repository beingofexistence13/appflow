define(["require", "exports", "assert", "vs/base/common/strings"], function (require, exports, assert, strings) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Strings', () => {
        test('equalsIgnoreCase', () => {
            assert(strings.equalsIgnoreCase('', ''));
            assert(!strings.equalsIgnoreCase('', '1'));
            assert(!strings.equalsIgnoreCase('1', ''));
            assert(strings.equalsIgnoreCase('a', 'a'));
            assert(strings.equalsIgnoreCase('abc', 'Abc'));
            assert(strings.equalsIgnoreCase('abc', 'ABC'));
            assert(strings.equalsIgnoreCase('Höhenmeter', 'HÖhenmeter'));
            assert(strings.equalsIgnoreCase('ÖL', 'Öl'));
        });
        test('beginsWithIgnoreCase', () => {
            assert(strings.startsWithIgnoreCase('', ''));
            assert(!strings.startsWithIgnoreCase('', '1'));
            assert(strings.startsWithIgnoreCase('1', ''));
            assert(strings.startsWithIgnoreCase('a', 'a'));
            assert(strings.startsWithIgnoreCase('abc', 'Abc'));
            assert(strings.startsWithIgnoreCase('abc', 'ABC'));
            assert(strings.startsWithIgnoreCase('Höhenmeter', 'HÖhenmeter'));
            assert(strings.startsWithIgnoreCase('ÖL', 'Öl'));
            assert(strings.startsWithIgnoreCase('alles klar', 'a'));
            assert(strings.startsWithIgnoreCase('alles klar', 'A'));
            assert(strings.startsWithIgnoreCase('alles klar', 'alles k'));
            assert(strings.startsWithIgnoreCase('alles klar', 'alles K'));
            assert(strings.startsWithIgnoreCase('alles klar', 'ALLES K'));
            assert(strings.startsWithIgnoreCase('alles klar', 'alles klar'));
            assert(strings.startsWithIgnoreCase('alles klar', 'ALLES KLAR'));
            assert(!strings.startsWithIgnoreCase('alles klar', ' ALLES K'));
            assert(!strings.startsWithIgnoreCase('alles klar', 'ALLES K '));
            assert(!strings.startsWithIgnoreCase('alles klar', 'öALLES K '));
            assert(!strings.startsWithIgnoreCase('alles klar', ' '));
            assert(!strings.startsWithIgnoreCase('alles klar', 'ö'));
        });
        test('compareIgnoreCase', () => {
            function assertCompareIgnoreCase(a, b, recurse = true) {
                let actual = strings.compareIgnoreCase(a, b);
                actual = actual > 0 ? 1 : actual < 0 ? -1 : actual;
                let expected = strings.compare(a.toLowerCase(), b.toLowerCase());
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
                let actual = strings.compareSubstringIgnoreCase(a, b, aStart, aEnd, bStart, bEnd);
                actual = actual > 0 ? 1 : actual < 0 ? -1 : actual;
                let expected = strings.compare(a.toLowerCase().substring(aStart, aEnd), b.toLowerCase().substring(bStart, bEnd));
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
            assert.strictEqual(strings.format('Foo Bar'), 'Foo Bar');
            assert.strictEqual(strings.format('Foo {0} Bar'), 'Foo {0} Bar');
            assert.strictEqual(strings.format('Foo {0} Bar', 'yes'), 'Foo yes Bar');
            assert.strictEqual(strings.format('Foo {0} Bar {0}', 'yes'), 'Foo yes Bar yes');
            assert.strictEqual(strings.format('Foo {0} Bar {1}{2}', 'yes'), 'Foo yes Bar {1}{2}');
            assert.strictEqual(strings.format('Foo {0} Bar {1}{2}', 'yes', undefined), 'Foo yes Bar undefined{2}');
            assert.strictEqual(strings.format('Foo {0} Bar {1}{2}', 'yes', 5, false), 'Foo yes Bar 5false');
            assert.strictEqual(strings.format('Foo {0} Bar. {1}', '(foo)', '.test'), 'Foo (foo) Bar. .test');
        });
        test('format2', () => {
            assert.strictEqual(strings.format2('Foo Bar', {}), 'Foo Bar');
            assert.strictEqual(strings.format2('Foo {oops} Bar', {}), 'Foo {oops} Bar');
            assert.strictEqual(strings.format2('Foo {foo} Bar', { foo: 'bar' }), 'Foo bar Bar');
            assert.strictEqual(strings.format2('Foo {foo} Bar {foo}', { foo: 'bar' }), 'Foo bar Bar bar');
            assert.strictEqual(strings.format2('Foo {foo} Bar {bar}{boo}', { foo: 'bar' }), 'Foo bar Bar {bar}{boo}');
            assert.strictEqual(strings.format2('Foo {foo} Bar {bar}{boo}', { foo: 'bar', bar: 'undefined' }), 'Foo bar Bar undefined{boo}');
            assert.strictEqual(strings.format2('Foo {foo} Bar {bar}{boo}', { foo: 'bar', bar: '5', boo: false }), 'Foo bar Bar 5false');
            assert.strictEqual(strings.format2('Foo {foo} Bar. {bar}', { foo: '(foo)', bar: '.test' }), 'Foo (foo) Bar. .test');
        });
        test('lcut', () => {
            assert.strictEqual(strings.lcut('foo bar', 0), '');
            assert.strictEqual(strings.lcut('foo bar', 1), 'bar');
            assert.strictEqual(strings.lcut('foo bar', 3), 'bar');
            assert.strictEqual(strings.lcut('foo bar', 4), 'bar'); // Leading whitespace trimmed
            assert.strictEqual(strings.lcut('foo bar', 5), 'foo bar');
            assert.strictEqual(strings.lcut('test string 0.1.2.3', 3), '2.3');
            assert.strictEqual(strings.lcut('', 10), '');
            assert.strictEqual(strings.lcut('a', 10), 'a');
        });
        test('escape', () => {
            assert.strictEqual(strings.escape(''), '');
            assert.strictEqual(strings.escape('foo'), 'foo');
            assert.strictEqual(strings.escape('foo bar'), 'foo bar');
            assert.strictEqual(strings.escape('<foo bar>'), '&lt;foo bar&gt;');
            assert.strictEqual(strings.escape('<foo>Hello</foo>'), '&lt;foo&gt;Hello&lt;/foo&gt;');
        });
        test('ltrim', () => {
            assert.strictEqual(strings.ltrim('foo', 'f'), 'oo');
            assert.strictEqual(strings.ltrim('foo', 'o'), 'foo');
            assert.strictEqual(strings.ltrim('http://www.test.de', 'http://'), 'www.test.de');
            assert.strictEqual(strings.ltrim('/foo/', '/'), 'foo/');
            assert.strictEqual(strings.ltrim('//foo/', '/'), 'foo/');
            assert.strictEqual(strings.ltrim('/', ''), '/');
            assert.strictEqual(strings.ltrim('/', '/'), '');
            assert.strictEqual(strings.ltrim('///', '/'), '');
            assert.strictEqual(strings.ltrim('', ''), '');
            assert.strictEqual(strings.ltrim('', '/'), '');
        });
        test('rtrim', () => {
            assert.strictEqual(strings.rtrim('foo', 'o'), 'f');
            assert.strictEqual(strings.rtrim('foo', 'f'), 'foo');
            assert.strictEqual(strings.rtrim('http://www.test.de', '.de'), 'http://www.test');
            assert.strictEqual(strings.rtrim('/foo/', '/'), '/foo');
            assert.strictEqual(strings.rtrim('/foo//', '/'), '/foo');
            assert.strictEqual(strings.rtrim('/', ''), '/');
            assert.strictEqual(strings.rtrim('/', '/'), '');
            assert.strictEqual(strings.rtrim('///', '/'), '');
            assert.strictEqual(strings.rtrim('', ''), '');
            assert.strictEqual(strings.rtrim('', '/'), '');
        });
        test('trim', () => {
            assert.strictEqual(strings.trim(' foo '), 'foo');
            assert.strictEqual(strings.trim('  foo'), 'foo');
            assert.strictEqual(strings.trim('bar  '), 'bar');
            assert.strictEqual(strings.trim('   '), '');
            assert.strictEqual(strings.trim('foo bar', 'bar'), 'foo ');
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
            assert.strictEqual(strings.lastNonWhitespaceIndex('abc  \t \t '), 2);
            assert.strictEqual(strings.lastNonWhitespaceIndex('abc'), 2);
            assert.strictEqual(strings.lastNonWhitespaceIndex('abc\t'), 2);
            assert.strictEqual(strings.lastNonWhitespaceIndex('abc '), 2);
            assert.strictEqual(strings.lastNonWhitespaceIndex('abc  \t \t '), 2);
            assert.strictEqual(strings.lastNonWhitespaceIndex('abc  \t \t abc \t \t '), 11);
            assert.strictEqual(strings.lastNonWhitespaceIndex('abc  \t \t abc \t \t ', 8), 2);
            assert.strictEqual(strings.lastNonWhitespaceIndex('  \t \t '), -1);
        });
        test('containsRTL', () => {
            assert.strictEqual(strings.containsRTL('a'), false);
            assert.strictEqual(strings.containsRTL(''), false);
            assert.strictEqual(strings.containsRTL(strings.UTF8_BOM_CHARACTER + 'a'), false);
            assert.strictEqual(strings.containsRTL('hello world!'), false);
            assert.strictEqual(strings.containsRTL('a📚📚b'), false);
            assert.strictEqual(strings.containsRTL('هناك حقيقة مثبتة منذ زمن طويل'), true);
            assert.strictEqual(strings.containsRTL('זוהי עובדה מבוססת שדעתו'), true);
        });
        test('issue #115221: isEmojiImprecise misses ⭐', () => {
            const codePoint = strings.getNextCodePoint('⭐', '⭐'.length, 0);
            assert.strictEqual(strings.isEmojiImprecise(codePoint), true);
        });
        test('isBasicASCII', () => {
            function assertIsBasicASCII(str, expected) {
                assert.strictEqual(strings.isBasicASCII(str), expected, str + ` (${str.charCodeAt(0)})`);
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
            assert.throws(() => strings.createRegExp('', false));
            // Escapes appropriately
            assert.strictEqual(strings.createRegExp('abc', false).source, 'abc');
            assert.strictEqual(strings.createRegExp('([^ ,.]*)', false).source, '\\(\\[\\^ ,\\.\\]\\*\\)');
            assert.strictEqual(strings.createRegExp('([^ ,.]*)', true).source, '([^ ,.]*)');
            // Whole word
            assert.strictEqual(strings.createRegExp('abc', false, { wholeWord: true }).source, '\\babc\\b');
            assert.strictEqual(strings.createRegExp('abc', true, { wholeWord: true }).source, '\\babc\\b');
            assert.strictEqual(strings.createRegExp(' abc', true, { wholeWord: true }).source, ' abc\\b');
            assert.strictEqual(strings.createRegExp('abc ', true, { wholeWord: true }).source, '\\babc ');
            assert.strictEqual(strings.createRegExp(' abc ', true, { wholeWord: true }).source, ' abc ');
            const regExpWithoutFlags = strings.createRegExp('abc', true);
            assert(!regExpWithoutFlags.global);
            assert(regExpWithoutFlags.ignoreCase);
            assert(!regExpWithoutFlags.multiline);
            const regExpWithFlags = strings.createRegExp('abc', true, { global: true, matchCase: true, multiline: true });
            assert(regExpWithFlags.global);
            assert(!regExpWithFlags.ignoreCase);
            assert(regExpWithFlags.multiline);
        });
        test('getLeadingWhitespace', () => {
            assert.strictEqual(strings.getLeadingWhitespace('  foo'), '  ');
            assert.strictEqual(strings.getLeadingWhitespace('  foo', 2), '');
            assert.strictEqual(strings.getLeadingWhitespace('  foo', 1, 1), '');
            assert.strictEqual(strings.getLeadingWhitespace('  foo', 0, 1), ' ');
            assert.strictEqual(strings.getLeadingWhitespace('  '), '  ');
            assert.strictEqual(strings.getLeadingWhitespace('  ', 1), ' ');
            assert.strictEqual(strings.getLeadingWhitespace('  ', 0, 1), ' ');
            assert.strictEqual(strings.getLeadingWhitespace('\t\tfunction foo(){', 0, 1), '\t');
            assert.strictEqual(strings.getLeadingWhitespace('\t\tfunction foo(){', 0, 2), '\t\t');
        });
        test('fuzzyContains', () => {
            assert.ok(!strings.fuzzyContains((undefined), null));
            assert.ok(strings.fuzzyContains('hello world', 'h'));
            assert.ok(!strings.fuzzyContains('hello world', 'q'));
            assert.ok(strings.fuzzyContains('hello world', 'hw'));
            assert.ok(strings.fuzzyContains('hello world', 'horl'));
            assert.ok(strings.fuzzyContains('hello world', 'd'));
            assert.ok(!strings.fuzzyContains('hello world', 'wh'));
            assert.ok(!strings.fuzzyContains('d', 'dd'));
        });
        test('startsWithUTF8BOM', () => {
            assert(strings.startsWithUTF8BOM(strings.UTF8_BOM_CHARACTER));
            assert(strings.startsWithUTF8BOM(strings.UTF8_BOM_CHARACTER + 'a'));
            assert(strings.startsWithUTF8BOM(strings.UTF8_BOM_CHARACTER + 'aaaaaaaaaa'));
            assert(!strings.startsWithUTF8BOM(' ' + strings.UTF8_BOM_CHARACTER));
            assert(!strings.startsWithUTF8BOM('foo'));
            assert(!strings.startsWithUTF8BOM(''));
        });
        test('stripUTF8BOM', () => {
            assert.strictEqual(strings.stripUTF8BOM(strings.UTF8_BOM_CHARACTER), '');
            assert.strictEqual(strings.stripUTF8BOM(strings.UTF8_BOM_CHARACTER + 'foobar'), 'foobar');
            assert.strictEqual(strings.stripUTF8BOM('foobar' + strings.UTF8_BOM_CHARACTER), 'foobar' + strings.UTF8_BOM_CHARACTER);
            assert.strictEqual(strings.stripUTF8BOM('abc'), 'abc');
            assert.strictEqual(strings.stripUTF8BOM(''), '');
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
                assert.strictEqual(strings.containsUppercaseCharacter(str), result, `Wrong result for ${str}`);
            });
        });
        test('containsUppercaseCharacter (ignoreEscapedChars)', () => {
            [
                ['\\Woo', false],
                ['f\\S\\S', false],
                ['foo', false],
                ['Foo', true],
            ].forEach(([str, result]) => {
                assert.strictEqual(strings.containsUppercaseCharacter(str, true), result, `Wrong result for ${str}`);
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
                assert.strictEqual(strings.uppercaseFirstLetter(inStr), result, `Wrong result for ${inStr}`);
            });
        });
        test('getNLines', () => {
            assert.strictEqual(strings.getNLines('', 5), '');
            assert.strictEqual(strings.getNLines('foo', 5), 'foo');
            assert.strictEqual(strings.getNLines('foo\nbar', 5), 'foo\nbar');
            assert.strictEqual(strings.getNLines('foo\nbar', 2), 'foo\nbar');
            assert.strictEqual(strings.getNLines('foo\nbar', 1), 'foo');
            assert.strictEqual(strings.getNLines('foo\nbar'), 'foo');
            assert.strictEqual(strings.getNLines('foo\nbar\nsomething', 2), 'foo\nbar');
            assert.strictEqual(strings.getNLines('foo', 0), '');
        });
        test('getGraphemeBreakType', () => {
            assert.strictEqual(strings.getGraphemeBreakType(0xBC1), 7 /* strings.GraphemeBreakType.SpacingMark */);
        });
        test('truncate', () => {
            assert.strictEqual('hello world', strings.truncate('hello world', 100));
            assert.strictEqual('hello…', strings.truncate('hello world', 5));
        });
        test('replaceAsync', async () => {
            let i = 0;
            assert.strictEqual(await strings.replaceAsync('abcabcabcabc', /b(.)/g, async (match, after) => {
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
                assert.strictEqual(strings.removeAnsiEscapeCodes(`hello${sequence}world`), 'helloworld', `expect to remove ${JSON.stringify(sequence)}`);
            }
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyaW5ncy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS90ZXN0L2NvbW1vbi9zdHJpbmdzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBT0EsS0FBSyxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUU7UUFDckIsSUFBSSxDQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRTtZQUM3QixNQUFNLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMzQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFM0MsTUFBTSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMzQyxNQUFNLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDL0MsTUFBTSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzlDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHNCQUFzQixFQUFFLEdBQUcsRUFBRTtZQUNqQyxNQUFNLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLEVBQUUsRUFBRSxFQUFFLENB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QkFDWixHQUFHLEdBQUcsS0FBSztnQkFDWCxHQUFHLEdBQUcsTUFBTTtnQkFDWixHQUFHLEdBQUcsS0FBSztnQkFDWCxHQUFHLEdBQUcsS0FBSztnQkFDWCxHQUFHLEdBQUcsS0FBSztnQkFDWCxHQUFHLEdBQUcsSUFBSTtnQkFDVixHQUFHLEdBQUcsS0FBSztnQkFDWCxHQUFHLEdBQUcsSUFBSTtnQkFDVixHQUFHLEdBQUcsS0FBSztnQkFDWCxHQUFHLEdBQUcsSUFBSTtnQkFDVixHQUFHLEdBQUcsS0FBSztnQkFDWCxHQUFHLEdBQUcsU0FBUztnQkFDZixHQUFHLEdBQUcsS0FBSztnQkFDWCxHQUFHLEdBQUcsaUJBQWlCO2dCQUN2QixHQUFHLEdBQUcsS0FBSztnQkFDWCxHQUFHLEdBQUcsS0FBSztnQkFDWCxHQUFHLEdBQUcsS0FBSztnQkFDWCxHQUFHLEdBQUcsS0FBSztnQkFDWCxHQUFHLEdBQUcsTUFBTTtnQkFDWixHQUFHLEdBQUcsS0FBSztnQkFDWCxHQUFHLEdBQUcsS0FBSztnQkFDWCxHQUFHLEdBQUcsS0FBSztnQkFDWCxHQUFHLEdBQUcsTUFBTTtnQkFDWixHQUFHLEdBQUcsTUFBTTtnQkFDWixHQUFHLEdBQUcsS0FBSztnQkFDWCxHQUFHLEdBQUcsS0FBSztnQkFDWCxHQUFHLEdBQUcsUUFBUTtnQkFDZCxHQUFHLEdBQUcsS0FBSztnQkFDWCxHQUFHLEdBQUcsSUFBSTtnQkFDVixHQUFHLEdBQUcsS0FBSztnQkFDWCxHQUFHLEdBQUcsS0FBSztnQkFDWCxHQUFHLEdBQUcsTUFBTTtnQkFDWixHQUFHLEdBQUcsSUFBSTtnQkFDVixHQUFHLEdBQUcsS0FBSztnQkFDWCxHQUFHLEdBQUcsSUFBSTtnQkFDVixHQUFHLEdBQUcsT0FBTztnQkFDYixHQUFHLEdBQUcsS0FBSztnQkFDWCxHQUFHLEdBQUcsS0FBSztnQkFDWCxHQUFHLEdBQUcsS0FBSztnQkFDWCxHQUFHLEdBQUcsTUFBTTtnQkFDWixHQUFHLEdBQUcsTUFBTTtnQkFDWixHQUFHLEdBQUcsTUFBTTtnQkFDWixHQUFHLEdBQUcsSUFBSTtnQkFDVixHQUFHLEdBQUcsT0FBTztnQkFDYixHQUFHLEdBQUcsTUFBTTtnQkFDWixHQUFHLEdBQUcsT0FBTztnQkFDYixHQUFHLEdBQUcsSUFBSTtnQkFDVixHQUFHLEdBQUcsS0FBSztnQkFDWCxHQUFHLEdBQUcsTUFBTTtnQkFDWixHQUFHLEdBQUcsS0FBSztnQkFDWCxHQUFHLEdBQUcsTUFBTTtnQkFDWixHQUFHLEdBQUcsTUFBTTtnQkFDWixHQUFHLEdBQUcsSUFBSTtnQkFDVixHQUFHLEdBQUcsUUFBUTtnQkFDZCxHQUFHLEdBQUcsS0FBSztnQkFDWCxHQUFHLEdBQUcsYUFBYTtnQkFDbkIsR0FBRyxHQUFHLEdBQUc7Z0JBQ1QsR0FBRyxHQUFHLE1BQU07Z0JBQ1osR0FBRyxHQUFHLE1BQU07Z0JBQ1osR0FBRyxHQUFHLEtBQUs7Z0JBQ1gsR0FBRyxHQUFHLFdBQVc7Z0JBQ2pCLEdBQUcsR0FBRyxLQUFLO2dCQUNYLEdBQUcsR0FBRyxNQUFNO2dCQUNaLEdBQUcsR0FBRyxhQUFhO2dCQUNuQixHQUFHLEdBQUcsR0FBRztnQkFDVCxHQUFHLEdBQUcsTUFBTTtnQkFDWixHQUFHLEdBQUcsbUJBQW1CO2dCQUN6QixHQUFHLEdBQUcsTUFBTTtnQkFDWixHQUFHLEdBQUcsV0FBVztnQkFDakIsR0FBRyxHQUFHLEtBQUs7Z0JBQ1gsR0FBRyxHQUFHLE1BQU07Z0JBQ1osR0FBRyxHQUFHLGFBQWE7Z0JBQ25CLEdBQUcsR0FBRyxNQUFNO2dCQUNaLEdBQUcsR0FBRyxlQUFlO2dCQUNyQixHQUFHLEdBQUcsUUFBUTtnQkFDZCxHQUFHLEdBQUcsV0FBVztnQkFDakIsR0FBRyxHQUFHLEtBQUs7Z0JBQ1gsR0FBRyxHQUFHLElBQUk7Z0JBQ1YsR0FBRyxHQUFHLEtBQUs7Z0JBQ1gsR0FBRyxHQUFHLFlBQVk7Z0JBQ2xCLEdBQUcsR0FBRyxXQUFXO2dCQUNqQixHQUFHLEdBQUcsTUFBTTtnQkFDWixHQUFHLEdBQUcsTUFBTTtnQkFDWixHQUFHLEdBQUcsTUFBTTtnQkFDWixHQUFHLEdBQUcsSUFBSTtnQkFDVixHQUFHLEdBQUcsTUFBTTtnQkFDWixHQUFHLEdBQUcsTUFBTTtnQkFDWixHQUFHLEdBQUcsTUFBTTtnQkFDWixHQUFHLEdBQUcsTUFBTTtnQkFFWixvQkFBb0I7Z0JBQ3BCLEdBQUcsR0FBRyxPQUFPO2dCQUNiLEdBQUcsR0FBRyxNQUFNO2dCQUNaLEdBQUcsR0FBRyxXQUFXO2dCQUNqQixHQUFHLEdBQUcsV0FBVztnQkFDakIsR0FBRyxHQUFHLHFCQUFxQjtnQkFDM0IsR0FBRyxHQUFHLG1CQUFtQjtnQkFFekIsb0JBQW9CO2dCQUNwQix1QkFBdUI7Z0JBQ3ZCLHlCQUF5QjthQUN6QixDQUFDO1lBRUYsS0FBSyxNQUFNLFFBQVEsSUFBSSxTQUFTLEVBQUU7Z0JBQ2pDLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLFFBQVEsUUFBUSxPQUFPLENBQUMsRUFBRSxZQUFZLEVBQUUsb0JBQW9CLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQ3pJO1FBQ0YsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyJ9