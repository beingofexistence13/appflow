define(["require", "exports", "assert", "vs/platform/contextkey/common/contextkey"], function (require, exports, assert, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function parseToStr(input) {
        const parser = new contextkey_1.Parser();
        const prints = [];
        const print = (...ss) => { ss.forEach(s => prints.push(s)); };
        const expr = parser.parse(input);
        if (expr === undefined) {
            if (parser.lexingErrors.length > 0) {
                print('Lexing errors:', '\n\n');
                parser.lexingErrors.forEach(lexingError => print(`Unexpected token '${lexingError.lexeme}' at offset ${lexingError.offset}. ${lexingError.additionalInfo}`, '\n'));
            }
            if (parser.parsingErrors.length > 0) {
                if (parser.lexingErrors.length > 0) {
                    print('\n --- \n');
                }
                print('Parsing errors:', '\n\n');
                parser.parsingErrors.forEach(parsingError => print(`Unexpected '${parsingError.lexeme}' at offset ${parsingError.offset}.`, '\n'));
            }
        }
        else {
            print(expr.serialize());
        }
        return prints.join('');
    }
    suite('Context Key Parser', () => {
        test(' foo', () => {
            const input = ' foo';
            assert.deepStrictEqual(parseToStr(input), "foo");
        });
        test('!foo', () => {
            const input = '!foo';
            assert.deepStrictEqual(parseToStr(input), "!foo");
        });
        test('foo =~ /bar/', () => {
            const input = 'foo =~ /bar/';
            assert.deepStrictEqual(parseToStr(input), "foo =~ /bar/");
        });
        test(`foo || (foo =~ /bar/ && baz)`, () => {
            const input = `foo || (foo =~ /bar/ && baz)`;
            assert.deepStrictEqual(parseToStr(input), "foo || baz && foo =~ /bar/");
        });
        test('foo || (foo =~ /bar/ || baz)', () => {
            const input = 'foo || (foo =~ /bar/ || baz)';
            assert.deepStrictEqual(parseToStr(input), "baz || foo || foo =~ /bar/");
        });
        test(`(foo || bar) && (jee || jar)`, () => {
            const input = `(foo || bar) && (jee || jar)`;
            assert.deepStrictEqual(parseToStr(input), "bar && jar || bar && jee || foo && jar || foo && jee");
        });
        test('foo && foo =~ /zee/i', () => {
            const input = 'foo && foo =~ /zee/i';
            assert.deepStrictEqual(parseToStr(input), "foo && foo =~ /zee/i");
        });
        test('foo.bar==enabled', () => {
            const input = 'foo.bar==enabled';
            assert.deepStrictEqual(parseToStr(input), "foo.bar == 'enabled'");
        });
        test(`foo.bar == 'enabled'`, () => {
            const input = `foo.bar == 'enabled'`;
            assert.deepStrictEqual(parseToStr(input), `foo.bar == 'enabled'`);
        });
        test('foo.bar:zed==completed - equality with no space', () => {
            const input = 'foo.bar:zed==completed';
            assert.deepStrictEqual(parseToStr(input), "foo.bar:zed == 'completed'");
        });
        test('a && b || c', () => {
            const input = 'a && b || c';
            assert.deepStrictEqual(parseToStr(input), "c || a && b");
        });
        test('fooBar && baz.jar && fee.bee<K-loo+1>', () => {
            const input = 'fooBar && baz.jar && fee.bee<K-loo+1>';
            assert.deepStrictEqual(parseToStr(input), "baz.jar && fee.bee<K-loo+1> && fooBar");
        });
        test('foo.barBaz<C-r> < 2', () => {
            const input = 'foo.barBaz<C-r> < 2';
            assert.deepStrictEqual(parseToStr(input), `foo.barBaz<C-r> < 2`);
        });
        test('foo.bar >= -1', () => {
            const input = 'foo.bar >= -1';
            assert.deepStrictEqual(parseToStr(input), "foo.bar >= -1");
        });
        test(`key contains &nbsp: view == vsc-packages-activitybar-folders && vsc-packages-folders-loaded`, () => {
            const input = `view == vsc-packages-activitybar-folders && vsc-packages-folders-loaded`;
            assert.deepStrictEqual(parseToStr(input), "vsc-packages-folders-loaded && view == 'vsc-packages-activitybar-folders'");
        });
        test('foo.bar <= -1', () => {
            const input = 'foo.bar <= -1';
            assert.deepStrictEqual(parseToStr(input), `foo.bar <= -1`);
        });
        test('!cmake:hideBuildCommand \u0026\u0026 cmake:enableFullFeatureSet', () => {
            const input = '!cmake:hideBuildCommand \u0026\u0026 cmake:enableFullFeatureSet';
            assert.deepStrictEqual(parseToStr(input), "cmake:enableFullFeatureSet && !cmake:hideBuildCommand");
        });
        test('!(foo && bar)', () => {
            const input = '!(foo && bar)';
            assert.deepStrictEqual(parseToStr(input), "!bar || !foo");
        });
        test('!(foo && bar || boar) || deer', () => {
            const input = '!(foo && bar || boar) || deer';
            assert.deepStrictEqual(parseToStr(input), "deer || !bar && !boar || !boar && !foo");
        });
        test(`!(!foo)`, () => {
            const input = `!(!foo)`;
            assert.deepStrictEqual(parseToStr(input), "foo");
        });
        suite('controversial', () => {
            /*
                new parser KEEPS old one's behavior:
    
                old parser output: { key: 'debugState', op: '==', value: '"stopped"' }
                new parser output: { key: 'debugState', op: '==', value: '"stopped"' }
    
                TODO@ulugbekna: we should consider breaking old parser's behavior, and not take double quotes as part of the `value` because that's not what user expects.
            */
            test(`debugState == "stopped"`, () => {
                const input = `debugState == "stopped"`;
                assert.deepStrictEqual(parseToStr(input), "debugState == '\"stopped\"'");
            });
            /*
                new parser BREAKS old one's behavior:
    
                old parser output: { key: 'viewItem', op: '==', value: 'VSCode WorkSpace' }
                new parser output: { key: 'viewItem', op: '==', value: 'VSCode' }
    
                TODO@ulugbekna: since this's breaking, we can have hacky code that tries detecting such cases and replicate old parser's behavior.
            */
            test(` viewItem == VSCode WorkSpace`, () => {
                const input = ` viewItem == VSCode WorkSpace`;
                assert.deepStrictEqual(parseToStr(input), "Parsing errors:\n\nUnexpected 'WorkSpace' at offset 20.\n");
            });
        });
        suite('regex', () => {
            test(`resource =~ //foo/(barr|door/(Foo-Bar%20Templates|Soo%20Looo)|Web%20Site%Jjj%20Llll)(/.*)*$/`, () => {
                const input = `resource =~ //foo/(barr|door/(Foo-Bar%20Templates|Soo%20Looo)|Web%20Site%Jjj%20Llll)(/.*)*$/`;
                assert.deepStrictEqual(parseToStr(input), "resource =~ /\\/foo\\/(barr|door\\/(Foo-Bar%20Templates|Soo%20Looo)|Web%20Site%Jjj%20Llll)(\\/.*)*$/");
            });
            test(`resource =~ /((/scratch/(?!update)(.*)/)|((/src/).*/)).*$/`, () => {
                const input = `resource =~ /((/scratch/(?!update)(.*)/)|((/src/).*/)).*$/`;
                assert.deepStrictEqual(parseToStr(input), "resource =~ /((\\/scratch\\/(?!update)(.*)\\/)|((\\/src\\/).*\\/)).*$/");
            });
            test(`resourcePath =~ /\.md(\.yml|\.txt)*$/giym`, () => {
                const input = `resourcePath =~ /\.md(\.yml|\.txt)*$/giym`;
                assert.deepStrictEqual(parseToStr(input), "resourcePath =~ /.md(.yml|.txt)*$/im");
            });
        });
        suite('error handling', () => {
            test(`/foo`, () => {
                const input = `/foo`;
                assert.deepStrictEqual(parseToStr(input), "Lexing errors:\n\nUnexpected token '/foo' at offset 0. Did you forget to escape the '/' (slash) character? Put two backslashes before it to escape, e.g., '\\\\/'.\n\n --- \nParsing errors:\n\nUnexpected '/foo' at offset 0.\n");
            });
            test(`!b == 'true'`, () => {
                const input = `!b == 'true'`;
                assert.deepStrictEqual(parseToStr(input), "Parsing errors:\n\nUnexpected '==' at offset 3.\n");
            });
            test('!foo &&  in bar', () => {
                const input = '!foo &&  in bar';
                assert.deepStrictEqual(parseToStr(input), "Parsing errors:\n\nUnexpected 'in' at offset 9.\n");
            });
            test('vim<c-r> == 1 && vim<2<=3', () => {
                const input = 'vim<c-r> == 1 && vim<2<=3';
                assert.deepStrictEqual(parseToStr(input), "Lexing errors:\n\nUnexpected token '=' at offset 23. Did you mean == or =~?\n\n --- \nParsing errors:\n\nUnexpected '=' at offset 23.\n"); // FIXME
            });
            test(`foo && 'bar`, () => {
                const input = `foo && 'bar`;
                assert.deepStrictEqual(parseToStr(input), "Lexing errors:\n\nUnexpected token ''bar' at offset 7. Did you forget to open or close the quote?\n\n --- \nParsing errors:\n\nUnexpected ''bar' at offset 7.\n");
            });
            test(`config.foo &&  &&bar =~ /^foo$|^bar-foo$|^joo$|^jar$/ && !foo`, () => {
                const input = `config.foo &&  &&bar =~ /^foo$|^bar-foo$|^joo$|^jar$/ && !foo`;
                assert.deepStrictEqual(parseToStr(input), "Parsing errors:\n\nUnexpected '&&' at offset 15.\n");
            });
            test(`!foo == 'test'`, () => {
                const input = `!foo == 'test'`;
                assert.deepStrictEqual(parseToStr(input), "Parsing errors:\n\nUnexpected '==' at offset 5.\n");
            });
            test(`!!foo`, function () {
                const input = `!!foo`;
                assert.deepStrictEqual(parseToStr(input), "Parsing errors:\n\nUnexpected '!' at offset 1.\n");
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9jb250ZXh0a2V5L3Rlc3QvY29tbW9uL3BhcnNlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQU9BLFNBQVMsVUFBVSxDQUFDLEtBQWE7UUFDaEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxtQkFBTSxFQUFFLENBQUM7UUFFNUIsTUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFDO1FBRTVCLE1BQU0sS0FBSyxHQUFHLENBQUMsR0FBRyxFQUFZLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFeEUsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqQyxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7WUFDdkIsSUFBSSxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ25DLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDaEMsTUFBTSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMscUJBQXFCLFdBQVcsQ0FBQyxNQUFNLGVBQWUsV0FBVyxDQUFDLE1BQU0sS0FBSyxXQUFXLENBQUMsY0FBYyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUNuSztZQUVELElBQUksTUFBTSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUNwQyxJQUFJLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFBRSxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7aUJB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