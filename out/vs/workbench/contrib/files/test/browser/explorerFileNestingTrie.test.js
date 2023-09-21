define(["require", "exports", "vs/workbench/contrib/files/common/explorerFileNestingTrie", "assert"], function (require, exports, explorerFileNestingTrie_1, assert) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const fakeFilenameAttributes = { dirname: 'mydir', basename: '', extname: '' };
    suite('SufTrie', () => {
        test('exactMatches', () => {
            const t = new explorerFileNestingTrie_1.SufTrie();
            t.add('.npmrc', 'MyKey');
            assert.deepStrictEqual(t.get('.npmrc', fakeFilenameAttributes), ['MyKey']);
            assert.deepStrictEqual(t.get('.npmrcs', fakeFilenameAttributes), []);
            assert.deepStrictEqual(t.get('a.npmrc', fakeFilenameAttributes), []);
        });
        test('starMatches', () => {
            const t = new explorerFileNestingTrie_1.SufTrie();
            t.add('*.npmrc', 'MyKey');
            assert.deepStrictEqual(t.get('.npmrc', fakeFilenameAttributes), ['MyKey']);
            assert.deepStrictEqual(t.get('npmrc', fakeFilenameAttributes), []);
            assert.deepStrictEqual(t.get('.npmrcs', fakeFilenameAttributes), []);
            assert.deepStrictEqual(t.get('a.npmrc', fakeFilenameAttributes), ['MyKey']);
            assert.deepStrictEqual(t.get('a.b.c.d.npmrc', fakeFilenameAttributes), ['MyKey']);
        });
        test('starSubstitutes', () => {
            const t = new explorerFileNestingTrie_1.SufTrie();
            t.add('*.npmrc', '${capture}.json');
            assert.deepStrictEqual(t.get('.npmrc', fakeFilenameAttributes), ['.json']);
            assert.deepStrictEqual(t.get('npmrc', fakeFilenameAttributes), []);
            assert.deepStrictEqual(t.get('.npmrcs', fakeFilenameAttributes), []);
            assert.deepStrictEqual(t.get('a.npmrc', fakeFilenameAttributes), ['a.json']);
            assert.deepStrictEqual(t.get('a.b.c.d.npmrc', fakeFilenameAttributes), ['a.b.c.d.json']);
        });
        test('multiMatches', () => {
            const t = new explorerFileNestingTrie_1.SufTrie();
            t.add('*.npmrc', 'Key1');
            t.add('*.json', 'Key2');
            t.add('*d.npmrc', 'Key3');
            assert.deepStrictEqual(t.get('.npmrc', fakeFilenameAttributes), ['Key1']);
            assert.deepStrictEqual(t.get('npmrc', fakeFilenameAttributes), []);
            assert.deepStrictEqual(t.get('.npmrcs', fakeFilenameAttributes), []);
            assert.deepStrictEqual(t.get('.json', fakeFilenameAttributes), ['Key2']);
            assert.deepStrictEqual(t.get('a.json', fakeFilenameAttributes), ['Key2']);
            assert.deepStrictEqual(t.get('a.npmrc', fakeFilenameAttributes), ['Key1']);
            assert.deepStrictEqual(t.get('a.b.c.d.npmrc', fakeFilenameAttributes), ['Key1', 'Key3']);
        });
        test('multiSubstitutes', () => {
            const t = new explorerFileNestingTrie_1.SufTrie();
            t.add('*.npmrc', 'Key1.${capture}.js');
            t.add('*.json', 'Key2.${capture}.js');
            t.add('*d.npmrc', 'Key3.${capture}.js');
            assert.deepStrictEqual(t.get('.npmrc', fakeFilenameAttributes), ['Key1..js']);
            assert.deepStrictEqual(t.get('npmrc', fakeFilenameAttributes), []);
            assert.deepStrictEqual(t.get('.npmrcs', fakeFilenameAttributes), []);
            assert.deepStrictEqual(t.get('.json', fakeFilenameAttributes), ['Key2..js']);
            assert.deepStrictEqual(t.get('a.json', fakeFilenameAttributes), ['Key2.a.js']);
            assert.deepStrictEqual(t.get('a.npmrc', fakeFilenameAttributes), ['Key1.a.js']);
            assert.deepStrictEqual(t.get('a.b.cd.npmrc', fakeFilenameAttributes), ['Key1.a.b.cd.js', 'Key3.a.b.c.js']);
            assert.deepStrictEqual(t.get('a.b.c.d.npmrc', fakeFilenameAttributes), ['Key1.a.b.c.d.js', 'Key3.a.b.c..js']);
        });
    });
    suite('PreTrie', () => {
        test('exactMatches', () => {
            const t = new explorerFileNestingTrie_1.PreTrie();
            t.add('.npmrc', 'MyKey');
            assert.deepStrictEqual(t.get('.npmrc', fakeFilenameAttributes), ['MyKey']);
            assert.deepStrictEqual(t.get('.npmrcs', fakeFilenameAttributes), []);
            assert.deepStrictEqual(t.get('a.npmrc', fakeFilenameAttributes), []);
        });
        test('starMatches', () => {
            const t = new explorerFileNestingTrie_1.PreTrie();
            t.add('*.npmrc', 'MyKey');
            assert.deepStrictEqual(t.get('.npmrc', fakeFilenameAttributes), ['MyKey']);
            assert.deepStrictEqual(t.get('npmrc', fakeFilenameAttributes), []);
            assert.deepStrictEqual(t.get('.npmrcs', fakeFilenameAttributes), []);
            assert.deepStrictEqual(t.get('a.npmrc', fakeFilenameAttributes), ['MyKey']);
            assert.deepStrictEqual(t.get('a.b.c.d.npmrc', fakeFilenameAttributes), ['MyKey']);
        });
        test('starSubstitutes', () => {
            const t = new explorerFileNestingTrie_1.PreTrie();
            t.add('*.npmrc', '${capture}.json');
            assert.deepStrictEqual(t.get('.npmrc', fakeFilenameAttributes), ['.json']);
            assert.deepStrictEqual(t.get('npmrc', fakeFilenameAttributes), []);
            assert.deepStrictEqual(t.get('.npmrcs', fakeFilenameAttributes), []);
            assert.deepStrictEqual(t.get('a.npmrc', fakeFilenameAttributes), ['a.json']);
            assert.deepStrictEqual(t.get('a.b.c.d.npmrc', fakeFilenameAttributes), ['a.b.c.d.json']);
        });
        test('multiMatches', () => {
            const t = new explorerFileNestingTrie_1.PreTrie();
            t.add('*.npmrc', 'Key1');
            t.add('*.json', 'Key2');
            t.add('*d.npmrc', 'Key3');
            assert.deepStrictEqual(t.get('.npmrc', fakeFilenameAttributes), ['Key1']);
            assert.deepStrictEqual(t.get('npmrc', fakeFilenameAttributes), []);
            assert.deepStrictEqual(t.get('.npmrcs', fakeFilenameAttributes), []);
            assert.deepStrictEqual(t.get('.json', fakeFilenameAttributes), ['Key2']);
            assert.deepStrictEqual(t.get('a.json', fakeFilenameAttributes), ['Key2']);
            assert.deepStrictEqual(t.get('a.npmrc', fakeFilenameAttributes), ['Key1']);
            assert.deepStrictEqual(t.get('a.b.c.d.npmrc', fakeFilenameAttributes), ['Key1', 'Key3']);
        });
        test('multiSubstitutes', () => {
            const t = new explorerFileNestingTrie_1.PreTrie();
            t.add('*.npmrc', 'Key1.${capture}.js');
            t.add('*.json', 'Key2.${capture}.js');
            t.add('*d.npmrc', 'Key3.${capture}.js');
            assert.deepStrictEqual(t.get('.npmrc', fakeFilenameAttributes), ['Key1..js']);
            assert.deepStrictEqual(t.get('npmrc', fakeFilenameAttributes), []);
            assert.deepStrictEqual(t.get('.npmrcs', fakeFilenameAttributes), []);
            assert.deepStrictEqual(t.get('.json', fakeFilenameAttributes), ['Key2..js']);
            assert.deepStrictEqual(t.get('a.json', fakeFilenameAttributes), ['Key2.a.js']);
            assert.deepStrictEqual(t.get('a.npmrc', fakeFilenameAttributes), ['Key1.a.js']);
            assert.deepStrictEqual(t.get('a.b.cd.npmrc', fakeFilenameAttributes), ['Key1.a.b.cd.js', 'Key3.a.b.c.js']);
            assert.deepStrictEqual(t.get('a.b.c.d.npmrc', fakeFilenameAttributes), ['Key1.a.b.c.d.js', 'Key3.a.b.c..js']);
        });
        test('emptyMatches', () => {
            const t = new explorerFileNestingTrie_1.PreTrie();
            t.add('package*json', 'package');
            assert.deepStrictEqual(t.get('package.json', fakeFilenameAttributes), ['package']);
            assert.deepStrictEqual(t.get('packagejson', fakeFilenameAttributes), ['package']);
            assert.deepStrictEqual(t.get('package-lock.json', fakeFilenameAttributes), ['package']);
        });
    });
    suite('StarTrie', () => {
        const assertMapEquals = (actual, expected) => {
            const actualStr = [...actual.entries()].map(e => `${e[0]} => [${[...e[1].keys()].join()}]`);
            const expectedStr = Object.entries(expected).map(e => `${e[0]}: [${[e[1]].join()}]`);
            const bigMsg = actualStr + '===' + expectedStr;
            assert.strictEqual(actual.size, Object.keys(expected).length, bigMsg);
            for (const parent of actual.keys()) {
                const act = actual.get(parent);
                const exp = expected[parent];
                const str = [...act.keys()].join() + '===' + exp.join();
                const msg = bigMsg + '\n' + str;
                assert(act.size === exp.length, msg);
                for (const child of exp) {
                    assert(act.has(child), msg);
                }
            }
        };
        test('does added extension nesting', () => {
            const t = new explorerFileNestingTrie_1.ExplorerFileNestingTrie([
                ['*', ['${capture}.*']],
            ]);
            const nesting = t.nest([
                'file',
                'file.json',
                'boop.test',
                'boop.test1',
                'boop.test.1',
                'beep',
                'beep.test1',
                'beep.boop.test1',
                'beep.boop.test2',
                'beep.boop.a',
            ], 'mydir');
            assertMapEquals(nesting, {
                'file': ['file.json'],
                'boop.test': ['boop.test.1'],
                'boop.test1': [],
                'beep': ['beep.test1', 'beep.boop.test1', 'beep.boop.test2', 'beep.boop.a']
            });
        });
        test('does ext specific nesting', () => {
            const t = new explorerFileNestingTrie_1.ExplorerFileNestingTrie([
                ['*.ts', ['${capture}.js']],
                ['*.js', ['${capture}.map']],
            ]);
            const nesting = t.nest([
                'a.ts',
                'a.js',
                'a.jss',
                'ab.js',
                'b.js',
                'b.map',
                'c.ts',
                'c.js',
                'c.map',
                'd.ts',
                'd.map',
            ], 'mydir');
            assertMapEquals(nesting, {
                'a.ts': ['a.js'],
                'ab.js': [],
                'a.jss': [],
                'b.js': ['b.map'],
                'c.ts': ['c.js', 'c.map'],
                'd.ts': [],
                'd.map': [],
            });
        });
        test('handles loops', () => {
            const t = new explorerFileNestingTrie_1.ExplorerFileNestingTrie([
                ['*.a', ['${capture}.b', '${capture}.c']],
                ['*.b', ['${capture}.a']],
                ['*.c', ['${capture}.d']],
                ['*.aa', ['${capture}.bb']],
                ['*.bb', ['${capture}.cc', '${capture}.dd']],
                ['*.cc', ['${capture}.aa']],
                ['*.dd', ['${capture}.ee']],
            ]);
            const nesting = t.nest([
                '.a', '.b', '.c', '.d',
                'a.a', 'a.b', 'a.d',
                'a.aa', 'a.bb', 'a.cc',
                'b.aa', 'b.bb',
                'c.bb', 'c.cc',
                'd.aa', 'd.cc',
                'e.aa', 'e.bb', 'e.dd', 'e.ee',
                'f.aa', 'f.bb', 'f.cc', 'f.dd', 'f.ee',
            ], 'mydir');
            assertMapEquals(nesting, {
                '.a': [], '.b': [], '.c': [], '.d': [],
                'a.a': [], 'a.b': [], 'a.d': [],
                'a.aa': [], 'a.bb': [], 'a.cc': [],
                'b.aa': ['b.bb'],
                'c.bb': ['c.cc'],
                'd.cc': ['d.aa'],
                'e.aa': ['e.bb', 'e.dd', 'e.ee'],
                'f.aa': [], 'f.bb': [], 'f.cc': [], 'f.dd': [], 'f.ee': []
            });
        });
        test('does general bidirectional suffix matching', () => {
            const t = new explorerFileNestingTrie_1.ExplorerFileNestingTrie([
                ['*-vsdoc.js', ['${capture}.js']],
                ['*.js', ['${capture}-vscdoc.js']],
            ]);
            const nesting = t.nest([
                'a-vsdoc.js',
                'a.js',
                'b.js',
                'b-vscdoc.js',
            ], 'mydir');
            assertMapEquals(nesting, {
                'a-vsdoc.js': ['a.js'],
                'b.js': ['b-vscdoc.js'],
            });
        });
        test('does general bidirectional prefix matching', () => {
            const t = new explorerFileNestingTrie_1.ExplorerFileNestingTrie([
                ['vsdoc-*.js', ['${capture}.js']],
                ['*.js', ['vscdoc-${capture}.js']],
            ]);
            const nesting = t.nest([
                'vsdoc-a.js',
                'a.js',
                'b.js',
                'vscdoc-b.js',
            ], 'mydir');
            assertMapEquals(nesting, {
                'vsdoc-a.js': ['a.js'],
                'b.js': ['vscdoc-b.js'],
            });
        });
        test('does general bidirectional general matching', () => {
            const t = new explorerFileNestingTrie_1.ExplorerFileNestingTrie([
                ['foo-*-bar.js', ['${capture}.js']],
                ['*.js', ['bib-${capture}-bap.js']],
            ]);
            const nesting = t.nest([
                'foo-a-bar.js',
                'a.js',
                'b.js',
                'bib-b-bap.js',
            ], 'mydir');
            assertMapEquals(nesting, {
                'foo-a-bar.js': ['a.js'],
                'b.js': ['bib-b-bap.js'],
            });
        });
        test('does extension specific path segment matching', () => {
            const t = new explorerFileNestingTrie_1.ExplorerFileNestingTrie([
                ['*.js', ['${capture}.*.js']],
            ]);
            const nesting = t.nest([
                'foo.js',
                'foo.test.js',
                'fooTest.js',
                'bar.js.js',
            ], 'mydir');
            assertMapEquals(nesting, {
                'foo.js': ['foo.test.js'],
                'fooTest.js': [],
                'bar.js.js': [],
            });
        });
        test('does exact match nesting', () => {
            const t = new explorerFileNestingTrie_1.ExplorerFileNestingTrie([
                ['package.json', ['.npmrc', 'npm-shrinkwrap.json', 'yarn.lock', '.yarnclean', '.yarnignore', '.yarn-integrity', '.yarnrc']],
                ['bower.json', ['.bowerrc']],
            ]);
            const nesting = t.nest([
                'package.json',
                '.npmrc', 'npm-shrinkwrap.json', 'yarn.lock',
                '.bowerrc',
            ], 'mydir');
            assertMapEquals(nesting, {
                'package.json': [
                    '.npmrc', 'npm-shrinkwrap.json', 'yarn.lock'
                ],
                '.bowerrc': [],
            });
        });
        test('eslint test', () => {
            const t = new explorerFileNestingTrie_1.ExplorerFileNestingTrie([
                ['.eslintrc*', ['.eslint*']],
            ]);
            const nesting1 = t.nest([
                '.eslintrc.json',
                '.eslintignore',
            ], 'mydir');
            assertMapEquals(nesting1, {
                '.eslintrc.json': ['.eslintignore'],
            });
            const nesting2 = t.nest([
                '.eslintrc',
                '.eslintignore',
            ], 'mydir');
            assertMapEquals(nesting2, {
                '.eslintrc': ['.eslintignore'],
            });
        });
        test('basename expansion', () => {
            const t = new explorerFileNestingTrie_1.ExplorerFileNestingTrie([
                ['*-vsdoc.js', ['${basename}.doc']],
            ]);
            const nesting1 = t.nest([
                'boop-vsdoc.js',
                'boop-vsdoc.doc',
                'boop.doc',
            ], 'mydir');
            assertMapEquals(nesting1, {
                'boop-vsdoc.js': ['boop-vsdoc.doc'],
                'boop.doc': [],
            });
        });
        test('extname expansion', () => {
            const t = new explorerFileNestingTrie_1.ExplorerFileNestingTrie([
                ['*-vsdoc.js', ['${extname}.doc']],
            ]);
            const nesting1 = t.nest([
                'boop-vsdoc.js',
                'js.doc',
                'boop.doc',
            ], 'mydir');
            assertMapEquals(nesting1, {
                'boop-vsdoc.js': ['js.doc'],
                'boop.doc': [],
            });
        });
        test('added segment matcher', () => {
            const t = new explorerFileNestingTrie_1.ExplorerFileNestingTrie([
                ['*', ['${basename}.*.${extname}']],
            ]);
            const nesting1 = t.nest([
                'some.file',
                'some.html.file',
                'some.html.nested.file',
                'other.file',
                'some.thing',
                'some.thing.else',
            ], 'mydir');
            assertMapEquals(nesting1, {
                'some.file': ['some.html.file', 'some.html.nested.file'],
                'other.file': [],
                'some.thing': [],
                'some.thing.else': [],
            });
        });
        test('added segment matcher (old format)', () => {
            const t = new explorerFileNestingTrie_1.ExplorerFileNestingTrie([
                ['*', ['$(basename).*.$(extname)']],
            ]);
            const nesting1 = t.nest([
                'some.file',
                'some.html.file',
                'some.html.nested.file',
                'other.file',
                'some.thing',
                'some.thing.else',
            ], 'mydir');
            assertMapEquals(nesting1, {
                'some.file': ['some.html.file', 'some.html.nested.file'],
                'other.file': [],
                'some.thing': [],
                'some.thing.else': [],
            });
        });
        test('dirname matching', () => {
            const t = new explorerFileNestingTrie_1.ExplorerFileNestingTrie([
                ['index.ts', ['${dirname}.ts']],
            ]);
            const nesting1 = t.nest([
                'otherFile.ts',
                'MyComponent.ts',
                'index.ts',
            ], 'MyComponent');
            assertMapEquals(nesting1, {
                'index.ts': ['MyComponent.ts'],
                'otherFile.ts': [],
            });
        });
        test.skip('is fast', () => {
            const bigNester = new explorerFileNestingTrie_1.ExplorerFileNestingTrie([
                ['*', ['${capture}.*']],
                ['*.js', ['${capture}.*.js', '${capture}.map']],
                ['*.jsx', ['${capture}.js']],
                ['*.ts', ['${capture}.js', '${capture}.*.ts']],
                ['*.tsx', ['${capture}.js']],
                ['*.css', ['${capture}.*.css', '${capture}.map']],
                ['*.html', ['${capture}.*.html']],
                ['*.htm', ['${capture}.*.htm']],
                ['*.less', ['${capture}.*.less', '${capture}.css']],
                ['*.scss', ['${capture}.*.scss', '${capture}.css']],
                ['*.sass', ['${capture}.css']],
                ['*.styl', ['${capture}.css']],
                ['*.coffee', ['${capture}.*.coffee', '${capture}.js']],
                ['*.iced', ['${capture}.*.iced', '${capture}.js']],
                ['*.config', ['${capture}.*.config']],
                ['*.cs', ['${capture}.*.cs', '${capture}.cs.d.ts']],
                ['*.vb', ['${capture}.*.vb']],
                ['*.json', ['${capture}.*.json']],
                ['*.md', ['${capture}.html']],
                ['*.mdown', ['${capture}.html']],
                ['*.markdown', ['${capture}.html']],
                ['*.mdwn', ['${capture}.html']],
                ['*.svg', ['${capture}.svgz']],
                ['*.a', ['${capture}.b']],
                ['*.b', ['${capture}.a']],
                ['*.resx', ['${capture}.designer.cs']],
                ['package.json', ['.npmrc', 'npm-shrinkwrap.json', 'yarn.lock', '.yarnclean', '.yarnignore', '.yarn-integrity', '.yarnrc']],
                ['bower.json', ['.bowerrc']],
                ['*-vsdoc.js', ['${capture}.js']],
                ['*.tt', ['${capture}.*']]
            ]);
            const bigFiles = Array.from({ length: 50000 / 6 }).map((_, i) => [
                'file' + i + '.js',
                'file' + i + '.map',
                'file' + i + '.css',
                'file' + i + '.ts',
                'file' + i + '.d.ts',
                'file' + i + '.jsx',
            ]).flat();
            const start = performance.now();
            // const _bigResult =
            bigNester.nest(bigFiles, 'mydir');
            const end = performance.now();
            assert(end - start < 1000, 'too slow...' + (end - start));
            // console.log(bigResult)
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwbG9yZXJGaWxlTmVzdGluZ1RyaWUudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2ZpbGVzL3Rlc3QvYnJvd3Nlci9leHBsb3JlckZpbGVOZXN0aW5nVHJpZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQU9BLE1BQU0sc0JBQXNCLEdBQUcsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxDQUFDO0lBRS9FLEtBQUssQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFO1FBQ3JCLElBQUksQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFO1lBQ3pCLE1BQU0sQ0FBQyxHQUFHLElBQUksaUNBQU8sRUFBRSxDQUFDO1lBQ3hCLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3pCLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsc0JBQXNCLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDM0UsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxzQkFBc0IsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3JFLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsc0JBQXNCLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN0RSxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxhQUFhLEVBQUUsR0FBRyxFQUFFO1lBQ3hCLE1BQU0sQ0FBQyxHQUFHLElBQUksaUNBQU8sRUFBRSxDQUFDO1lBQ3hCLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzFCLE1B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