define(["require", "exports", "assert", "vs/editor/contrib/snippet/browser/snippetParser"], function (require, exports, assert, snippetParser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('SnippetParser', () => {
        test('Scanner', () => {
            const scanner = new snippetParser_1.$w5();
            assert.strictEqual(scanner.next().type, 14 /* TokenType.EOF */);
            scanner.text('abc');
            assert.strictEqual(scanner.next().type, 9 /* TokenType.VariableName */);
            assert.strictEqual(scanner.next().type, 14 /* TokenType.EOF */);
            scanner.text('{{abc}}');
            assert.strictEqual(scanner.next().type, 3 /* TokenType.CurlyOpen */);
            assert.strictEqual(scanner.next().type, 3 /* TokenType.CurlyOpen */);
            assert.strictEqual(scanner.next().type, 9 /* TokenType.VariableName */);
            assert.strictEqual(scanner.next().type, 4 /* TokenType.CurlyClose */);
            assert.strictEqual(scanner.next().type, 4 /* TokenType.CurlyClose */);
            assert.strictEqual(scanner.next().type, 14 /* TokenType.EOF */);
            scanner.text('abc() ');
            assert.strictEqual(scanner.next().type, 9 /* TokenType.VariableName */);
            assert.strictEqual(scanner.next().type, 10 /* TokenType.Format */);
            assert.strictEqual(scanner.next().type, 14 /* TokenType.EOF */);
            scanner.text('abc 123');
            assert.strictEqual(scanner.next().type, 9 /* TokenType.VariableName */);
            assert.strictEqual(scanner.next().type, 10 /* TokenType.Format */);
            assert.strictEqual(scanner.next().type, 8 /* TokenType.Int */);
            assert.strictEqual(scanner.next().type, 14 /* TokenType.EOF */);
            scanner.text('$foo');
            assert.strictEqual(scanner.next().type, 0 /* TokenType.Dollar */);
            assert.strictEqual(scanner.next().type, 9 /* TokenType.VariableName */);
            assert.strictEqual(scanner.next().type, 14 /* TokenType.EOF */);
            scanner.text('$foo_bar');
            assert.strictEqual(scanner.next().type, 0 /* TokenType.Dollar */);
            assert.strictEqual(scanner.next().type, 9 /* TokenType.VariableName */);
            assert.strictEqual(scanner.next().type, 14 /* TokenType.EOF */);
            scanner.text('$foo-bar');
            assert.strictEqual(scanner.next().type, 0 /* TokenType.Dollar */);
            assert.strictEqual(scanner.next().type, 9 /* TokenType.VariableName */);
            assert.strictEqual(scanner.next().type, 12 /* TokenType.Dash */);
            assert.strictEqual(scanner.next().type, 9 /* TokenType.VariableName */);
            assert.strictEqual(scanner.next().type, 14 /* TokenType.EOF */);
            scanner.text('${foo}');
            assert.strictEqual(scanner.next().type, 0 /* TokenType.Dollar */);
            assert.strictEqual(scanner.next().type, 3 /* TokenType.CurlyOpen */);
            assert.strictEqual(scanner.next().type, 9 /* TokenType.VariableName */);
            assert.strictEqual(scanner.next().type, 4 /* TokenType.CurlyClose */);
            assert.strictEqual(scanner.next().type, 14 /* TokenType.EOF */);
            scanner.text('${1223:foo}');
            assert.strictEqual(scanner.next().type, 0 /* TokenType.Dollar */);
            assert.strictEqual(scanner.next().type, 3 /* TokenType.CurlyOpen */);
            assert.strictEqual(scanner.next().type, 8 /* TokenType.Int */);
            assert.strictEqual(scanner.next().type, 1 /* TokenType.Colon */);
            assert.strictEqual(scanner.next().type, 9 /* TokenType.VariableName */);
            assert.strictEqual(scanner.next().type, 4 /* TokenType.CurlyClose */);
            assert.strictEqual(scanner.next().type, 14 /* TokenType.EOF */);
            scanner.text('\\${}');
            assert.strictEqual(scanner.next().type, 5 /* TokenType.Backslash */);
            assert.strictEqual(scanner.next().type, 0 /* TokenType.Dollar */);
            assert.strictEqual(scanner.next().type, 3 /* TokenType.CurlyOpen */);
            assert.strictEqual(scanner.next().type, 4 /* TokenType.CurlyClose */);
            scanner.text('${foo/regex/format/option}');
            assert.strictEqual(scanner.next().type, 0 /* TokenType.Dollar */);
            assert.strictEqual(scanner.next().type, 3 /* TokenType.CurlyOpen */);
            assert.strictEqual(scanner.next().type, 9 /* TokenType.VariableName */);
            assert.strictEqual(scanner.next().type, 6 /* TokenType.Forwardslash */);
            assert.strictEqual(scanner.next().type, 9 /* TokenType.VariableName */);
            assert.strictEqual(scanner.next().type, 6 /* TokenType.Forwardslash */);
            assert.strictEqual(scanner.next().type, 9 /* TokenType.VariableName */);
            assert.strictEqual(scanner.next().type, 6 /* TokenType.Forwardslash */);
            assert.strictEqual(scanner.next().type, 9 /* TokenType.VariableName */);
            assert.strictEqual(scanner.next().type, 4 /* TokenType.CurlyClose */);
            assert.strictEqual(scanner.next().type, 14 /* TokenType.EOF */);
        });
        function assertText(value, expected) {
            const actual = snippetParser_1.$G5.asInsertText(value);
            assert.strictEqual(actual, expected);
        }
        function assertMarker(input, ...ctors) {
            let marker;
            if (input instanceof snippetParser_1.$F5) {
                marker = [...input.children];
            }
            else if (typeof input === 'string') {
                const p = new snippetParser_1.$G5();
                marker = p.parse(input).children;
            }
            else {
                marker = [...input];
            }
            while (marker.length > 0) {
                const m = marker.pop();
                const ctor = ctors.pop();
                assert.ok(m instanceof ctor);
            }
            assert.strictEqual(marker.length, ctors.length);
            assert.strictEqual(marker.length, 0);
        }
        function assertTextAndMarker(value, escaped, ...ctors) {
            assertText(value, escaped);
            assertMarker(value, ...ctors);
        }
        function assertEscaped(value, expected) {
            const actual = snippetParser_1.$G5.escape(value);
            assert.strictEqual(actual, expected);
        }
        test('Parser, escaped', function () {
            assertEscaped('foo$0', 'foo\\$0');
            assertEscaped('foo\\$0', 'foo\\\\\\$0');
            assertEscaped('f$1oo$0', 'f\\$1oo\\$0');
            assertEscaped('${1:foo}$0', '\\${1:foo\\}\\$0');
            assertEscaped('$', '\\$');
        });
        test('Parser, text', () => {
            assertText('$', '$');
            assertText('\\\\$', '\\$');
            assertText('{', '{');
            assertText('\\}', '}');
            assertText('\\abc', '\\abc');
            assertText('foo${f:\\}}bar', 'foo}bar');
            assertText('\\{', '\\{');
            assertText('I need \\\\\\$', 'I need \\$');
            assertText('\\', '\\');
            assertText('\\{{', '\\{{');
            assertText('{{', '{{');
            assertText('{{dd', '{{dd');
            assertText('}}', '}}');
            assertText('ff}}', 'ff}}');
            assertText('farboo', 'farboo');
            assertText('far{{}}boo', 'far{{}}boo');
            assertText('far{{123}}boo', 'far{{123}}boo');
            assertText('far\\{{123}}boo', 'far\\{{123}}boo');
            assertText('far{{id:bern}}boo', 'far{{id:bern}}boo');
            assertText('far{{id:bern {{basel}}}}boo', 'far{{id:bern {{basel}}}}boo');
            assertText('far{{id:bern {{id:basel}}}}boo', 'far{{id:bern {{id:basel}}}}boo');
            assertText('far{{id:bern {{id2:basel}}}}boo', 'far{{id:bern {{id2:basel}}}}boo');
        });
        test('Parser, TM text', () => {
            assertTextAndMarker('foo${1:bar}}', 'foobar}', snippetParser_1.$y5, snippetParser_1.$A5, snippetParser_1.$y5);
            assertTextAndMarker('foo${1:bar}${2:foo}}', 'foobarfoo}', snippetParser_1.$y5, snippetParser_1.$A5, snippetParser_1.$A5, snippetParser_1.$y5);
            assertTextAndMarker('foo${1:bar\\}${2:foo}}', 'foobar}foo', snippetParser_1.$y5, snippetParser_1.$A5);
            const [, placeholder] = new snippetParser_1.$G5().parse('foo${1:bar\\}${2:foo}}').children;
            const { children } = placeholder;
            assert.strictEqual(placeholder.index, 1);
            assert.ok(children[0] instanceof snippetParser_1.$y5);
            assert.strictEqual(children[0].toString(), 'bar}');
            assert.ok(children[1] instanceof snippetParser_1.$A5);
            assert.strictEqual(children[1].toString(), 'foo');
        });
        test('Parser, placeholder', () => {
            assertTextAndMarker('farboo', 'farboo', snippetParser_1.$y5);
            assertTextAndMarker('far{{}}boo', 'far{{}}boo', snippetParser_1.$y5);
            assertTextAndMarker('far{{123}}boo', 'far{{123}}boo', snippetParser_1.$y5);
            assertTextAndMarker('far\\{{123}}boo', 'far\\{{123}}boo', snippetParser_1.$y5);
        });
        test('Parser, literal code', () => {
            assertTextAndMarker('far`123`boo', 'far`123`boo', snippetParser_1.$y5);
            assertTextAndMarker('far\\`123\\`boo', 'far\\`123\\`boo', snippetParser_1.$y5);
        });
        test('Parser, variables/tabstop', () => {
            assertTextAndMarker('$far-boo', '-boo', snippetParser_1.$E5, snippetParser_1.$y5);
            assertTextAndMarker('\\$far-boo', '$far-boo', snippetParser_1.$y5);
            assertTextAndMarker('far$farboo', 'far', snippetParser_1.$y5, snippetParser_1.$E5);
            assertTextAndMarker('far${farboo}', 'far', snippetParser_1.$y5, snippetParser_1.$E5);
            assertTextAndMarker('$123', '', snippetParser_1.$A5);
            assertTextAndMarker('$farboo', '', snippetParser_1.$E5);
            assertTextAndMarker('$far12boo', '', snippetParser_1.$E5);
            assertTextAndMarker('000_${far}_000', '000__000', snippetParser_1.$y5, snippetParser_1.$E5, snippetParser_1.$y5);
            assertTextAndMarker('FFF_${TM_SELECTED_TEXT}_FFF$0', 'FFF__FFF', snippetParser_1.$y5, snippetParser_1.$E5, snippetParser_1.$y5, snippetParser_1.$A5);
        });
        test('Parser, variables/placeholder with defaults', () => {
            assertTextAndMarker('${name:value}', 'value', snippetParser_1.$E5);
            assertTextAndMarker('${1:value}', 'value', snippetParser_1.$A5);
            assertTextAndMarker('${1:bar${2:foo}bar}', 'barfoobar', snippetParser_1.$A5);
            assertTextAndMarker('${name:value', '${name:value', snippetParser_1.$y5);
            assertTextAndMarker('${1:bar${2:foobar}', '${1:barfoobar', snippetParser_1.$y5, snippetParser_1.$A5);
        });
        test('Parser, variable transforms', function () {
            assertTextAndMarker('${foo///}', '', snippetParser_1.$E5);
            assertTextAndMarker('${foo/regex/format/gmi}', '', snippetParser_1.$E5);
            assertTextAndMarker('${foo/([A-Z][a-z])/format/}', '', snippetParser_1.$E5);
            // invalid regex
            assertTextAndMarker('${foo/([A-Z][a-z])/format/GMI}', '${foo/([A-Z][a-z])/format/GMI}', snippetParser_1.$y5);
            assertTextAndMarker('${foo/([A-Z][a-z])/format/funky}', '${foo/([A-Z][a-z])/format/funky}', snippetParser_1.$y5);
            assertTextAndMarker('${foo/([A-Z][a-z]/format/}', '${foo/([A-Z][a-z]/format/}', snippetParser_1.$y5);
            // tricky regex
            assertTextAndMarker('${foo/m\\/atch/$1/i}', '', snippetParser_1.$E5);
            assertMarker('${foo/regex\/format/options}', snippetParser_1.$y5);
            // incomplete
            assertTextAndMarker('${foo///', '${foo///', snippetParser_1.$y5);
            assertTextAndMarker('${foo/regex/format/options', '${foo/regex/format/options', snippetParser_1.$y5);
            // format string
            assertMarker('${foo/.*/${0:fooo}/i}', snippetParser_1.$E5);
            assertMarker('${foo/.*/${1}/i}', snippetParser_1.$E5);
            assertMarker('${foo/.*/$1/i}', snippetParser_1.$E5);
            assertMarker('${foo/.*/This-$1-encloses/i}', snippetParser_1.$E5);
            assertMarker('${foo/.*/complex${1:else}/i}', snippetParser_1.$E5);
            assertMarker('${foo/.*/complex${1:-else}/i}', snippetParser_1.$E5);
            assertMarker('${foo/.*/complex${1:+if}/i}', snippetParser_1.$E5);
            assertMarker('${foo/.*/complex${1:?if:else}/i}', snippetParser_1.$E5);
            assertMarker('${foo/.*/complex${1:/upcase}/i}', snippetParser_1.$E5);
        });
        test('Parser, placeholder transforms', function () {
            assertTextAndMarker('${1///}', '', snippetParser_1.$A5);
            assertTextAndMarker('${1/regex/format/gmi}', '', snippetParser_1.$A5);
            assertTextAndMarker('${1/([A-Z][a-z])/format/}', '', snippetParser_1.$A5);
            // tricky regex
            assertTextAndMarker('${1/m\\/atch/$1/i}', '', snippetParser_1.$A5);
            assertMarker('${1/regex\/format/options}', snippetParser_1.$y5);
            // incomplete
            assertTextAndMarker('${1///', '${1///', snippetParser_1.$y5);
            assertTextAndMarker('${1/regex/format/options', '${1/regex/format/options', snippetParser_1.$y5);
        });
        test('No way to escape forward slash in snippet regex #36715', function () {
            assertMarker('${TM_DIRECTORY/src\\//$1/}', snippetParser_1.$E5);
        });
        test('No way to escape forward slash in snippet format section #37562', function () {
            assertMarker('${TM_SELECTED_TEXT/a/\\/$1/g}', snippetParser_1.$E5);
            assertMarker('${TM_SELECTED_TEXT/a/in\\/$1ner/g}', snippetParser_1.$E5);
            assertMarker('${TM_SELECTED_TEXT/a/end\\//g}', snippetParser_1.$E5);
        });
        test('Parser, placeholder with choice', () => {
            assertTextAndMarker('${1|one,two,three|}', 'one', snippetParser_1.$A5);
            assertTextAndMarker('${1|one|}', 'one', snippetParser_1.$A5);
            assertTextAndMarker('${1|one1,two2|}', 'one1', snippetParser_1.$A5);
            assertTextAndMarker('${1|one1\\,two2|}', 'one1,two2', snippetParser_1.$A5);
            assertTextAndMarker('${1|one1\\|two2|}', 'one1|two2', snippetParser_1.$A5);
            assertTextAndMarker('${1|one1\\atwo2|}', 'one1\\atwo2', snippetParser_1.$A5);
            assertTextAndMarker('${1|one,two,three,|}', '${1|one,two,three,|}', snippetParser_1.$y5);
            assertTextAndMarker('${1|one,', '${1|one,', snippetParser_1.$y5);
            const snippet = new snippetParser_1.$G5().parse('${1|one,two,three|}');
            const expected = [
                m => m instanceof snippetParser_1.$A5,
                m => m instanceof snippetParser_1.$B5 && m.options.length === 3 && m.options.every(x => x instanceof snippetParser_1.$y5),
            ];
            snippet.walk(marker => {
                assert.ok(expected.shift()(marker));
                return true;
            });
        });
        test('Snippet choices: unable to escape comma and pipe, #31521', function () {
            assertTextAndMarker('console.log(${1|not\\, not, five, 5, 1   23|});', 'console.log(not, not);', snippetParser_1.$y5, snippetParser_1.$A5, snippetParser_1.$y5);
        });
        test('Marker, toTextmateString()', function () {
            function assertTextsnippetString(input, expected) {
                const snippet = new snippetParser_1.$G5().parse(input);
                const actual = snippet.toTextmateString();
                assert.strictEqual(actual, expected);
            }
            assertTextsnippetString('$1', '$1');
            assertTextsnippetString('\\$1', '\\$1');
            assertTextsnippetString('console.log(${1|not\\, not, five, 5, 1   23|});', 'console.log(${1|not\\, not, five, 5, 1   23|});');
            assertTextsnippetString('console.log(${1|not\\, not, \\| five, 5, 1   23|});', 'console.log(${1|not\\, not, \\| five, 5, 1   23|});');
            assertTextsnippetString('${1|cho\\,ices,wi\\|th,esc\\\\aping,chall\\\\\\,enges|}', '${1|cho\\,ices,wi\\|th,esc\\\\aping,chall\\\\\\,enges|}');
            assertTextsnippetString('this is text', 'this is text');
            assertTextsnippetString('this ${1:is ${2:nested with $var}}', 'this ${1:is ${2:nested with ${var}}}');
            assertTextsnippetString('this ${1:is ${2:nested with $var}}}', 'this ${1:is ${2:nested with ${var}}}\\}');
        });
        test('Marker, toTextmateString() <-> identity', function () {
            function assertIdent(input) {
                // full loop: (1) parse input, (2) generate textmate string, (3) parse, (4) ensure both trees are equal
                const snippet = new snippetParser_1.$G5().parse(input);
                const input2 = snippet.toTextmateString();
                const snippet2 = new snippetParser_1.$G5().parse(input2);
                function checkCheckChildren(marker1, marker2) {
                    assert.ok(marker1 instanceof Object.getPrototypeOf(marker2).constructor);
                    assert.ok(marker2 instanceof Object.getPrototypeOf(marker1).constructor);
                    assert.strictEqual(marker1.children.length, marker2.children.length);
                    assert.strictEqual(marker1.toString(), marker2.toString());
                    for (let i = 0; i < marker1.children.length; i++) {
                        checkCheckChildren(marker1.children[i], marker2.children[i]);
                    }
                }
                checkCheckChildren(snippet, snippet2);
            }
            assertIdent('$1');
            assertIdent('\\$1');
            assertIdent('console.log(${1|not\\, not, five, 5, 1   23|});');
            assertIdent('console.log(${1|not\\, not, \\| five, 5, 1   23|});');
            assertIdent('this is text');
            assertIdent('this ${1:is ${2:nested with $var}}');
            assertIdent('this ${1:is ${2:nested with $var}}}');
            assertIdent('this ${1:is ${2:nested with $var}} and repeating $1');
        });
        test('Parser, choise marker', () => {
            const { placeholders } = new snippetParser_1.$G5().parse('${1|one,two,three|}');
            assert.strictEqual(placeholders.length, 1);
            assert.ok(placeholders[0].choice instanceof snippetParser_1.$B5);
            assert.ok(placeholders[0].children[0] instanceof snippetParser_1.$B5);
            assert.strictEqual(placeholders[0].children[0].options.length, 3);
            assertText('${1|one,two,three|}', 'one');
            assertText('\\${1|one,two,three|}', '${1|one,two,three|}');
            assertText('${1\\|one,two,three|}', '${1\\|one,two,three|}');
            assertText('${1||}', '${1||}');
        });
        test('Backslash character escape in choice tabstop doesn\'t work #58494', function () {
            const { placeholders } = new snippetParser_1.$G5().parse('${1|\\,,},$,\\|,\\\\|}');
            assert.strictEqual(placeholders.length, 1);
            assert.ok(placeholders[0].choice instanceof snippetParser_1.$B5);
        });
        test('Parser, only textmate', () => {
            const p = new snippetParser_1.$G5();
            assertMarker(p.parse('far{{}}boo'), snippetParser_1.$y5);
            assertMarker(p.parse('far{{123}}boo'), snippetParser_1.$y5);
            assertMarker(p.parse('far\\{{123}}boo'), snippetParser_1.$y5);
            assertMarker(p.parse('far$0boo'), snippetParser_1.$y5, snippetParser_1.$A5, snippetParser_1.$y5);
            assertMarker(p.parse('far${123}boo'), snippetParser_1.$y5, snippetParser_1.$A5, snippetParser_1.$y5);
            assertMarker(p.parse('far\\${123}boo'), snippetParser_1.$y5);
        });
        test('Parser, real world', () => {
            let marker = new snippetParser_1.$G5().parse('console.warn(${1: $TM_SELECTED_TEXT })').children;
            assert.strictEqual(marker[0].toString(), 'console.warn(');
            assert.ok(marker[1] instanceof snippetParser_1.$A5);
            assert.strictEqual(marker[2].toString(), ')');
            const placeholder = marker[1];
            assert.strictEqual(placeholder.index, 1);
            assert.strictEqual(placeholder.children.length, 3);
            assert.ok(placeholder.children[0] instanceof snippetParser_1.$y5);
            assert.ok(placeholder.children[1] instanceof snippetParser_1.$E5);
            assert.ok(placeholder.children[2] instanceof snippetParser_1.$y5);
            assert.strictEqual(placeholder.children[0].toString(), ' ');
            assert.strictEqual(placeholder.children[1].toString(), '');
            assert.strictEqual(placeholder.children[2].toString(), ' ');
            const nestedVariable = placeholder.children[1];
            assert.strictEqual(nestedVariable.name, 'TM_SELECTED_TEXT');
            assert.strictEqual(nestedVariable.children.length, 0);
            marker = new snippetParser_1.$G5().parse('$TM_SELECTED_TEXT').children;
            assert.strictEqual(marker.length, 1);
            assert.ok(marker[0] instanceof snippetParser_1.$E5);
        });
        test('Parser, transform example', () => {
            const { children } = new snippetParser_1.$G5().parse('${1:name} : ${2:type}${3/\\s:=(.*)/${1:+ :=}${1}/};\n$0');
            //${1:name}
            assert.ok(children[0] instanceof snippetParser_1.$A5);
            assert.strictEqual(children[0].children.length, 1);
            assert.strictEqual(children[0].children[0].toString(), 'name');
            assert.strictEqual(children[0].transform, undefined);
            // :
            assert.ok(children[1] instanceof snippetParser_1.$y5);
            assert.strictEqual(children[1].toString(), ' : ');
            //${2:type}
            assert.ok(children[2] instanceof snippetParser_1.$A5);
            assert.strictEqual(children[2].children.length, 1);
            assert.strictEqual(children[2].children[0].toString(), 'type');
            //${3/\\s:=(.*)/${1:+ :=}${1}/}
            assert.ok(children[3] instanceof snippetParser_1.$A5);
            assert.strictEqual(children[3].children.length, 0);
            assert.notStrictEqual(children[3].transform, undefined);
            const transform = children[3].transform;
            assert.deepStrictEqual(transform.regexp, /\s:=(.*)/);
            assert.strictEqual(transform.children.length, 2);
            assert.ok(transform.children[0] instanceof snippetParser_1.$D5);
            assert.strictEqual(transform.children[0].index, 1);
            assert.strictEqual(transform.children[0].ifValue, ' :=');
            assert.ok(transform.children[1] instanceof snippetParser_1.$D5);
            assert.strictEqual(transform.children[1].index, 1);
            assert.ok(children[4] instanceof snippetParser_1.$y5);
            assert.strictEqual(children[4].toString(), ';\n');
        });
        // TODO @jrieken making this strictEqul causes circular json conversion errors
        test('Parser, default placeholder values', () => {
            assertMarker('errorContext: `${1:err}`, error: $1', snippetParser_1.$y5, snippetParser_1.$A5, snippetParser_1.$y5, snippetParser_1.$A5);
            const [, p1, , p2] = new snippetParser_1.$G5().parse('errorContext: `${1:err}`, error:$1').children;
            assert.strictEqual(p1.index, 1);
            assert.strictEqual(p1.children.length, 1);
            assert.strictEqual(p1.children[0].toString(), 'err');
            assert.strictEqual(p2.index, 1);
            assert.strictEqual(p2.children.length, 1);
            assert.strictEqual(p2.children[0].toString(), 'err');
        });
        // TODO @jrieken making this strictEqul causes circular json conversion errors
        test('Parser, default placeholder values and one transform', () => {
            assertMarker('errorContext: `${1:err}`, error: ${1/err/ok/}', snippetParser_1.$y5, snippetParser_1.$A5, snippetParser_1.$y5, snippetParser_1.$A5);
            const [, p3, , p4] = new snippetParser_1.$G5().parse('errorContext: `${1:err}`, error:${1/err/ok/}').children;
            assert.strictEqual(p3.index, 1);
            assert.strictEqual(p3.children.length, 1);
            assert.strictEqual(p3.children[0].toString(), 'err');
            assert.strictEqual(p3.transform, undefined);
            assert.strictEqual(p4.index, 1);
            assert.strictEqual(p4.children.length, 1);
            assert.strictEqual(p4.children[0].toString(), 'err');
            assert.notStrictEqual(p4.transform, undefined);
        });
        test('Repeated snippet placeholder should always inherit, #31040', function () {
            assertText('${1:foo}-abc-$1', 'foo-abc-foo');
            assertText('${1:foo}-abc-${1}', 'foo-abc-foo');
            assertText('${1:foo}-abc-${1:bar}', 'foo-abc-foo');
            assertText('${1}-abc-${1:foo}', 'foo-abc-foo');
        });
        test('backspace esapce in TM only, #16212', () => {
            const actual = snippetParser_1.$G5.asInsertText('Foo \\\\${abc}bar');
            assert.strictEqual(actual, 'Foo \\bar');
        });
        test('colon as variable/placeholder value, #16717', () => {
            let actual = snippetParser_1.$G5.asInsertText('${TM_SELECTED_TEXT:foo:bar}');
            assert.strictEqual(actual, 'foo:bar');
            actual = snippetParser_1.$G5.asInsertText('${1:foo:bar}');
            assert.strictEqual(actual, 'foo:bar');
        });
        test('incomplete placeholder', () => {
            assertTextAndMarker('${1:}', '', snippetParser_1.$A5);
        });
        test('marker#len', () => {
            function assertLen(template, ...lengths) {
                const snippet = new snippetParser_1.$G5().parse(template, true);
                snippet.walk(m => {
                    const expected = lengths.shift();
                    assert.strictEqual(m.len(), expected);
                    return true;
                });
                assert.strictEqual(lengths.length, 0);
            }
            assertLen('text$0', 4, 0);
            assertLen('$1text$0', 0, 4, 0);
            assertLen('te$1xt$0', 2, 0, 2, 0);
            assertLen('errorContext: `${1:err}`, error: $0', 15, 0, 3, 10, 0);
            assertLen('errorContext: `${1:err}`, error: $1$0', 15, 0, 3, 10, 0, 3, 0);
            assertLen('$TM_SELECTED_TEXT$0', 0, 0);
            assertLen('${TM_SELECTED_TEXT:def}$0', 0, 3, 0);
        });
        test('parser, parent node', function () {
            let snippet = new snippetParser_1.$G5().parse('This ${1:is ${2:nested}}$0', true);
            assert.strictEqual(snippet.placeholders.length, 3);
            let [first, second] = snippet.placeholders;
            assert.strictEqual(first.index, 1);
            assert.strictEqual(second.index, 2);
            assert.ok(second.parent === first);
            assert.ok(first.parent === snippet);
            snippet = new snippetParser_1.$G5().parse('${VAR:default${1:value}}$0', true);
            assert.strictEqual(snippet.placeholders.length, 2);
            [first] = snippet.placeholders;
            assert.strictEqual(first.index, 1);
            assert.ok(snippet.children[0] instanceof snippetParser_1.$E5);
            assert.ok(first.parent === snippet.children[0]);
        });
        test('TextmateSnippet#enclosingPlaceholders', () => {
            const snippet = new snippetParser_1.$G5().parse('This ${1:is ${2:nested}}$0', true);
            const [first, second] = snippet.placeholders;
            assert.deepStrictEqual(snippet.enclosingPlaceholders(first), []);
            assert.deepStrictEqual(snippet.enclosingPlaceholders(second), [first]);
        });
        test('TextmateSnippet#offset', () => {
            let snippet = new snippetParser_1.$G5().parse('te$1xt', true);
            assert.strictEqual(snippet.offset(snippet.children[0]), 0);
            assert.strictEqual(snippet.offset(snippet.children[1]), 2);
            assert.strictEqual(snippet.offset(snippet.children[2]), 2);
            snippet = new snippetParser_1.$G5().parse('${TM_SELECTED_TEXT:def}', true);
            assert.strictEqual(snippet.offset(snippet.children[0]), 0);
            assert.strictEqual(snippet.offset(snippet.children[0].children[0]), 0);
            // forgein marker
            assert.strictEqual(snippet.offset(new snippetParser_1.$y5('foo')), -1);
        });
        test('TextmateSnippet#placeholder', () => {
            let snippet = new snippetParser_1.$G5().parse('te$1xt$0', true);
            let placeholders = snippet.placeholders;
            assert.strictEqual(placeholders.length, 2);
            snippet = new snippetParser_1.$G5().parse('te$1xt$1$0', true);
            placeholders = snippet.placeholders;
            assert.strictEqual(placeholders.length, 3);
            snippet = new snippetParser_1.$G5().parse('te$1xt$2$0', true);
            placeholders = snippet.placeholders;
            assert.strictEqual(placeholders.length, 3);
            snippet = new snippetParser_1.$G5().parse('${1:bar${2:foo}bar}$0', true);
            placeholders = snippet.placeholders;
            assert.strictEqual(placeholders.length, 3);
        });
        test('TextmateSnippet#replace 1/2', function () {
            const snippet = new snippetParser_1.$G5().parse('aaa${1:bbb${2:ccc}}$0', true);
            assert.strictEqual(snippet.placeholders.length, 3);
            const [, second] = snippet.placeholders;
            assert.strictEqual(second.index, 2);
            const enclosing = snippet.enclosingPlaceholders(second);
            assert.strictEqual(enclosing.length, 1);
            assert.strictEqual(enclosing[0].index, 1);
            const nested = new snippetParser_1.$G5().parse('ddd$1eee$0', true);
            snippet.replace(second, nested.children);
            assert.strictEqual(snippet.toString(), 'aaabbbdddeee');
            assert.strictEqual(snippet.placeholders.length, 4);
            assert.strictEqual(snippet.placeholders[0].index, 1);
            assert.strictEqual(snippet.placeholders[1].index, 1);
            assert.strictEqual(snippet.placeholders[2].index, 0);
            assert.strictEqual(snippet.placeholders[3].index, 0);
            const newEnclosing = snippet.enclosingPlaceholders(snippet.placeholders[1]);
            assert.ok(newEnclosing[0] === snippet.placeholders[0]);
            assert.strictEqual(newEnclosing.length, 1);
            assert.strictEqual(newEnclosing[0].index, 1);
        });
        test('TextmateSnippet#replace 2/2', function () {
            const snippet = new snippetParser_1.$G5().parse('aaa${1:bbb${2:ccc}}$0', true);
            assert.strictEqual(snippet.placeholders.length, 3);
            const [, second] = snippet.placeholders;
            assert.strictEqual(second.index, 2);
            const nested = new snippetParser_1.$G5().parse('dddeee$0', true);
            snippet.replace(second, nested.children);
            assert.strictEqual(snippet.toString(), 'aaabbbdddeee');
            assert.strictEqual(snippet.placeholders.length, 3);
        });
        test('Snippet order for placeholders, #28185', function () {
            const _10 = new snippetParser_1.$A5(10);
            const _2 = new snippetParser_1.$A5(2);
            assert.strictEqual(snippetParser_1.$A5.compareByIndex(_10, _2), 1);
        });
        test('Maximum call stack size exceeded, #28983', function () {
            new snippetParser_1.$G5().parse('${1:${foo:${1}}}');
        });
        test('Snippet can freeze the editor, #30407', function () {
            const seen = new Set();
            seen.clear();
            new snippetParser_1.$G5().parse('class ${1:${TM_FILENAME/(?:\\A|_)([A-Za-z0-9]+)(?:\\.rb)?/(?2::\\u$1)/g}} < ${2:Application}Controller\n  $3\nend').walk(marker => {
                assert.ok(!seen.has(marker));
                seen.add(marker);
                return true;
            });
            seen.clear();
            new snippetParser_1.$G5().parse('${1:${FOO:abc$1def}}').walk(marker => {
                assert.ok(!seen.has(marker));
                seen.add(marker);
                return true;
            });
        });
        test('Snippets: make parser ignore `${0|choice|}`, #31599', function () {
            assertTextAndMarker('${0|foo,bar|}', '${0|foo,bar|}', snippetParser_1.$y5);
            assertTextAndMarker('${1|foo,bar|}', 'foo', snippetParser_1.$A5);
        });
        test('Transform -> FormatString#resolve', function () {
            // shorthand functions
            assert.strictEqual(new snippetParser_1.$D5(1, 'upcase').resolve('foo'), 'FOO');
            assert.strictEqual(new snippetParser_1.$D5(1, 'downcase').resolve('FOO'), 'foo');
            assert.strictEqual(new snippetParser_1.$D5(1, 'capitalize').resolve('bar'), 'Bar');
            assert.strictEqual(new snippetParser_1.$D5(1, 'capitalize').resolve('bar no repeat'), 'Bar no repeat');
            assert.strictEqual(new snippetParser_1.$D5(1, 'pascalcase').resolve('bar-foo'), 'BarFoo');
            assert.strictEqual(new snippetParser_1.$D5(1, 'pascalcase').resolve('bar-42-foo'), 'Bar42Foo');
            assert.strictEqual(new snippetParser_1.$D5(1, 'pascalcase').resolve('snake_AndPascalCase'), 'SnakeAndPascalCase');
            assert.strictEqual(new snippetParser_1.$D5(1, 'pascalcase').resolve('kebab-AndPascalCase'), 'KebabAndPascalCase');
            assert.strictEqual(new snippetParser_1.$D5(1, 'pascalcase').resolve('_justPascalCase'), 'JustPascalCase');
            assert.strictEqual(new snippetParser_1.$D5(1, 'camelcase').resolve('bar-foo'), 'barFoo');
            assert.strictEqual(new snippetParser_1.$D5(1, 'camelcase').resolve('bar-42-foo'), 'bar42Foo');
            assert.strictEqual(new snippetParser_1.$D5(1, 'camelcase').resolve('snake_AndCamelCase'), 'snakeAndCamelCase');
            assert.strictEqual(new snippetParser_1.$D5(1, 'camelcase').resolve('kebab-AndCamelCase'), 'kebabAndCamelCase');
            assert.strictEqual(new snippetParser_1.$D5(1, 'camelcase').resolve('_JustCamelCase'), 'justCamelCase');
            assert.strictEqual(new snippetParser_1.$D5(1, 'notKnown').resolve('input'), 'input');
            // if
            assert.strictEqual(new snippetParser_1.$D5(1, undefined, 'foo', undefined).resolve(undefined), '');
            assert.strictEqual(new snippetParser_1.$D5(1, undefined, 'foo', undefined).resolve(''), '');
            assert.strictEqual(new snippetParser_1.$D5(1, undefined, 'foo', undefined).resolve('bar'), 'foo');
            // else
            assert.strictEqual(new snippetParser_1.$D5(1, undefined, undefined, 'foo').resolve(undefined), 'foo');
            assert.strictEqual(new snippetParser_1.$D5(1, undefined, undefined, 'foo').resolve(''), 'foo');
            assert.strictEqual(new snippetParser_1.$D5(1, undefined, undefined, 'foo').resolve('bar'), 'bar');
            // if-else
            assert.strictEqual(new snippetParser_1.$D5(1, undefined, 'bar', 'foo').resolve(undefined), 'foo');
            assert.strictEqual(new snippetParser_1.$D5(1, undefined, 'bar', 'foo').resolve(''), 'foo');
            assert.strictEqual(new snippetParser_1.$D5(1, undefined, 'bar', 'foo').resolve('baz'), 'bar');
        });
        test('Snippet variable transformation doesn\'t work if regex is complicated and snippet body contains \'$$\' #55627', function () {
            const snippet = new snippetParser_1.$G5().parse('const fileName = "${TM_FILENAME/(.*)\\..+$/$1/}"');
            assert.strictEqual(snippet.toTextmateString(), 'const fileName = "${TM_FILENAME/(.*)\\..+$/${1}/}"');
        });
        test('[BUG] HTML attribute suggestions: Snippet session does not have end-position set, #33147', function () {
            const { placeholders } = new snippetParser_1.$G5().parse('src="$1"', true);
            const [first, second] = placeholders;
            assert.strictEqual(placeholders.length, 2);
            assert.strictEqual(first.index, 1);
            assert.strictEqual(second.index, 0);
        });
        test('Snippet optional transforms are not applied correctly when reusing the same variable, #37702', function () {
            const transform = new snippetParser_1.$C5();
            transform.appendChild(new snippetParser_1.$D5(1, 'upcase'));
            transform.appendChild(new snippetParser_1.$D5(2, 'upcase'));
            transform.regexp = /^(.)|-(.)/g;
            assert.strictEqual(transform.resolve('my-file-name'), 'MyFileName');
            const clone = transform.clone();
            assert.strictEqual(clone.resolve('my-file-name'), 'MyFileName');
        });
        test('problem with snippets regex #40570', function () {
            const snippet = new snippetParser_1.$G5().parse('${TM_DIRECTORY/.*src[\\/](.*)/$1/}');
            assertMarker(snippet, snippetParser_1.$E5);
        });
        test('Variable transformation doesn\'t work if undefined variables are used in the same snippet #51769', function () {
            const transform = new snippetParser_1.$C5();
            transform.appendChild(new snippetParser_1.$y5('bar'));
            transform.regexp = new RegExp('foo', 'gi');
            assert.strictEqual(transform.toTextmateString(), '/foo/bar/ig');
        });
        test('Snippet parser freeze #53144', function () {
            const snippet = new snippetParser_1.$G5().parse('${1/(void$)|(.+)/${1:?-\treturn nil;}/}');
            assertMarker(snippet, snippetParser_1.$A5);
        });
        test('snippets variable not resolved in JSON proposal #52931', function () {
            assertTextAndMarker('FOO${1:/bin/bash}', 'FOO/bin/bash', snippetParser_1.$y5, snippetParser_1.$A5);
        });
        test('Mirroring sequence of nested placeholders not selected properly on backjumping #58736', function () {
            const snippet = new snippetParser_1.$G5().parse('${3:nest1 ${1:nest2 ${2:nest3}}} $3');
            assert.strictEqual(snippet.children.length, 3);
            assert.ok(snippet.children[0] instanceof snippetParser_1.$A5);
            assert.ok(snippet.children[1] instanceof snippetParser_1.$y5);
            assert.ok(snippet.children[2] instanceof snippetParser_1.$A5);
            function assertParent(marker) {
                marker.children.forEach(assertParent);
                if (!(marker instanceof snippetParser_1.$A5)) {
                    return;
                }
                let found = false;
                let m = marker;
                while (m && !found) {
                    if (m.parent === snippet) {
                        found = true;
                    }
                    m = m.parent;
                }
                assert.ok(found);
            }
            const [, , clone] = snippet.children;
            assertParent(clone);
        });
        test('Backspace can\'t be escaped in snippet variable transforms #65412', function () {
            const snippet = new snippetParser_1.$G5().parse('namespace ${TM_DIRECTORY/[\\/]/\\\\/g};');
            assertMarker(snippet, snippetParser_1.$y5, snippetParser_1.$E5, snippetParser_1.$y5);
        });
        test('Snippet cannot escape closing bracket inside conditional insertion variable replacement #78883', function () {
            const snippet = new snippetParser_1.$G5().parse('${TM_DIRECTORY/(.+)/${1:+import { hello \\} from world}/}');
            const variable = snippet.children[0];
            assert.strictEqual(snippet.children.length, 1);
            assert.ok(variable instanceof snippetParser_1.$E5);
            assert.ok(variable.transform);
            assert.strictEqual(variable.transform.children.length, 1);
            assert.ok(variable.transform.children[0] instanceof snippetParser_1.$D5);
            assert.strictEqual(variable.transform.children[0].ifValue, 'import { hello } from world');
            assert.strictEqual(variable.transform.children[0].elseValue, undefined);
        });
        test('Snippet escape backslashes inside conditional insertion variable replacement #80394', function () {
            const snippet = new snippetParser_1.$G5().parse('${CURRENT_YEAR/(.+)/${1:+\\\\}/}');
            const variable = snippet.children[0];
            assert.strictEqual(snippet.children.length, 1);
            assert.ok(variable instanceof snippetParser_1.$E5);
            assert.ok(variable.transform);
            assert.strictEqual(variable.transform.children.length, 1);
            assert.ok(variable.transform.children[0] instanceof snippetParser_1.$D5);
            assert.strictEqual(variable.transform.children[0].ifValue, '\\');
            assert.strictEqual(variable.transform.children[0].elseValue, undefined);
        });
        test('Snippet placeholder empty right after expansion #152553', function () {
            const snippet = new snippetParser_1.$G5().parse('${1:prog}: ${2:$1.cc} - $2');
            const actual = snippet.toString();
            assert.strictEqual(actual, 'prog: prog.cc - prog.cc');
            const snippet2 = new snippetParser_1.$G5().parse('${1:prog}: ${3:${2:$1.cc}.33} - $2 $3');
            const actual2 = snippet2.toString();
            assert.strictEqual(actual2, 'prog: prog.cc.33 - prog.cc prog.cc.33');
            // cyclic references of placeholders
            const snippet3 = new snippetParser_1.$G5().parse('${1:$2.one} <> ${2:$1.two}');
            const actual3 = snippet3.toString();
            assert.strictEqual(actual3, '.two.one.two.one <> .one.two.one.two');
        });
    });
});
//# sourceMappingURL=snippetParser.test.js.map