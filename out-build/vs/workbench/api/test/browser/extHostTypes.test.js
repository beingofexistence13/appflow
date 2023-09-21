/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/api/common/extHostTypes", "vs/base/common/platform", "vs/base/common/types", "vs/base/common/mime", "vs/base/common/errors"], function (require, exports, assert, uri_1, types, platform_1, types_1, mime_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function assertToJSON(a, expected) {
        const raw = JSON.stringify(a);
        const actual = JSON.parse(raw);
        assert.deepStrictEqual(actual, expected);
    }
    suite('ExtHostTypes', function () {
        test('URI, toJSON', function () {
            const uri = uri_1.URI.parse('file:///path/test.file');
            assert.deepStrictEqual(uri.toJSON(), {
                $mid: 1 /* MarshalledId.Uri */,
                scheme: 'file',
                path: '/path/test.file'
            });
            assert.ok(uri.fsPath);
            assert.deepStrictEqual(uri.toJSON(), {
                $mid: 1 /* MarshalledId.Uri */,
                scheme: 'file',
                path: '/path/test.file',
                fsPath: '/path/test.file'.replace(/\//g, platform_1.$i ? '\\' : '/'),
                _sep: platform_1.$i ? 1 : undefined,
            });
            assert.ok(uri.toString());
            assert.deepStrictEqual(uri.toJSON(), {
                $mid: 1 /* MarshalledId.Uri */,
                scheme: 'file',
                path: '/path/test.file',
                fsPath: '/path/test.file'.replace(/\//g, platform_1.$i ? '\\' : '/'),
                _sep: platform_1.$i ? 1 : undefined,
                external: 'file:///path/test.file'
            });
        });
        test('Disposable', () => {
            let count = 0;
            const d = new types.$3J(() => {
                count += 1;
                return 12;
            });
            d.dispose();
            assert.strictEqual(count, 1);
            d.dispose();
            assert.strictEqual(count, 1);
            types.$3J.from(undefined, { dispose() { count += 1; } }).dispose();
            assert.strictEqual(count, 2);
            assert.throws(() => {
                new types.$3J(() => {
                    throw new Error();
                }).dispose();
            });
            new types.$3J(undefined).dispose();
        });
        test('Position', () => {
            assert.throws(() => new types.$4J(-1, 0));
            assert.throws(() => new types.$4J(0, -1));
            const pos = new types.$4J(0, 0);
            assert.throws(() => pos.line = -1);
            assert.throws(() => pos.character = -1);
            assert.throws(() => pos.line = 12);
            const { line, character } = pos.toJSON();
            assert.strictEqual(line, 0);
            assert.strictEqual(character, 0);
        });
        test('Position, toJSON', function () {
            const pos = new types.$4J(4, 2);
            assertToJSON(pos, { line: 4, character: 2 });
        });
        test('Position, isBefore(OrEqual)?', function () {
            const p1 = new types.$4J(1, 3);
            const p2 = new types.$4J(1, 2);
            const p3 = new types.$4J(0, 4);
            assert.ok(p1.isBeforeOrEqual(p1));
            assert.ok(!p1.isBefore(p1));
            assert.ok(p2.isBefore(p1));
            assert.ok(p3.isBefore(p2));
        });
        test('Position, isAfter(OrEqual)?', function () {
            const p1 = new types.$4J(1, 3);
            const p2 = new types.$4J(1, 2);
            const p3 = new types.$4J(0, 4);
            assert.ok(p1.isAfterOrEqual(p1));
            assert.ok(!p1.isAfter(p1));
            assert.ok(p1.isAfter(p2));
            assert.ok(p2.isAfter(p3));
            assert.ok(p1.isAfter(p3));
        });
        test('Position, compareTo', function () {
            const p1 = new types.$4J(1, 3);
            const p2 = new types.$4J(1, 2);
            const p3 = new types.$4J(0, 4);
            assert.strictEqual(p1.compareTo(p1), 0);
            assert.strictEqual(p2.compareTo(p1), -1);
            assert.strictEqual(p1.compareTo(p2), 1);
            assert.strictEqual(p2.compareTo(p3), 1);
            assert.strictEqual(p1.compareTo(p3), 1);
        });
        test('Position, translate', function () {
            const p1 = new types.$4J(1, 3);
            assert.ok(p1.translate() === p1);
            assert.ok(p1.translate({}) === p1);
            assert.ok(p1.translate(0, 0) === p1);
            assert.ok(p1.translate(0) === p1);
            assert.ok(p1.translate(undefined, 0) === p1);
            assert.ok(p1.translate(undefined) === p1);
            let res = p1.translate(-1);
            assert.strictEqual(res.line, 0);
            assert.strictEqual(res.character, 3);
            res = p1.translate({ lineDelta: -1 });
            assert.strictEqual(res.line, 0);
            assert.strictEqual(res.character, 3);
            res = p1.translate(undefined, -1);
            assert.strictEqual(res.line, 1);
            assert.strictEqual(res.character, 2);
            res = p1.translate({ characterDelta: -1 });
            assert.strictEqual(res.line, 1);
            assert.strictEqual(res.character, 2);
            res = p1.translate(11);
            assert.strictEqual(res.line, 12);
            assert.strictEqual(res.character, 3);
            assert.throws(() => p1.translate(null));
            assert.throws(() => p1.translate(null, null));
            assert.throws(() => p1.translate(-2));
            assert.throws(() => p1.translate({ lineDelta: -2 }));
            assert.throws(() => p1.translate(-2, null));
            assert.throws(() => p1.translate(0, -4));
        });
        test('Position, with', function () {
            const p1 = new types.$4J(1, 3);
            assert.ok(p1.with() === p1);
            assert.ok(p1.with(1) === p1);
            assert.ok(p1.with(undefined, 3) === p1);
            assert.ok(p1.with(1, 3) === p1);
            assert.ok(p1.with(undefined) === p1);
            assert.ok(p1.with({ line: 1 }) === p1);
            assert.ok(p1.with({ character: 3 }) === p1);
            assert.ok(p1.with({ line: 1, character: 3 }) === p1);
            const p2 = p1.with({ line: 0, character: 11 });
            assert.strictEqual(p2.line, 0);
            assert.strictEqual(p2.character, 11);
            assert.throws(() => p1.with(null));
            assert.throws(() => p1.with(-9));
            assert.throws(() => p1.with(0, -9));
            assert.throws(() => p1.with({ line: -1 }));
            assert.throws(() => p1.with({ character: -1 }));
        });
        test('Range', () => {
            assert.throws(() => new types.$5J(-1, 0, 0, 0));
            assert.throws(() => new types.$5J(0, -1, 0, 0));
            assert.throws(() => new types.$5J(new types.$4J(0, 0), undefined));
            assert.throws(() => new types.$5J(new types.$4J(0, 0), null));
            assert.throws(() => new types.$5J(undefined, new types.$4J(0, 0)));
            assert.throws(() => new types.$5J(null, new types.$4J(0, 0)));
            const range = new types.$5J(1, 0, 0, 0);
            assert.throws(() => { range.start = null; });
            assert.throws(() => { range.start = new types.$4J(0, 3); });
        });
        test('Range, toJSON', function () {
            const range = new types.$5J(1, 2, 3, 4);
            assertToJSON(range, [{ line: 1, character: 2 }, { line: 3, character: 4 }]);
        });
        test('Range, sorting', function () {
            // sorts start/end
            let range = new types.$5J(1, 0, 0, 0);
            assert.strictEqual(range.start.line, 0);
            assert.strictEqual(range.end.line, 1);
            range = new types.$5J(0, 0, 1, 0);
            assert.strictEqual(range.start.line, 0);
            assert.strictEqual(range.end.line, 1);
        });
        test('Range, isEmpty|isSingleLine', function () {
            let range = new types.$5J(1, 0, 0, 0);
            assert.ok(!range.isEmpty);
            assert.ok(!range.isSingleLine);
            range = new types.$5J(1, 1, 1, 1);
            assert.ok(range.isEmpty);
            assert.ok(range.isSingleLine);
            range = new types.$5J(0, 1, 0, 11);
            assert.ok(!range.isEmpty);
            assert.ok(range.isSingleLine);
            range = new types.$5J(0, 0, 1, 1);
            assert.ok(!range.isEmpty);
            assert.ok(!range.isSingleLine);
        });
        test('Range, contains', function () {
            const range = new types.$5J(1, 1, 2, 11);
            assert.ok(range.contains(range.start));
            assert.ok(range.contains(range.end));
            assert.ok(range.contains(range));
            assert.ok(!range.contains(new types.$5J(1, 0, 2, 11)));
            assert.ok(!range.contains(new types.$5J(0, 1, 2, 11)));
            assert.ok(!range.contains(new types.$5J(1, 1, 2, 12)));
            assert.ok(!range.contains(new types.$5J(1, 1, 3, 11)));
        });
        test('Range, contains (no instanceof)', function () {
            const range = new types.$5J(1, 1, 2, 11);
            const startLike = { line: range.start.line, character: range.start.character };
            const endLike = { line: range.end.line, character: range.end.character };
            const rangeLike = { start: startLike, end: endLike };
            assert.ok(range.contains(startLike));
            assert.ok(range.contains(endLike));
            assert.ok(range.contains(rangeLike));
        });
        test('Range, intersection', function () {
            const range = new types.$5J(1, 1, 2, 11);
            let res;
            res = range.intersection(range);
            assert.strictEqual(res.start.line, 1);
            assert.strictEqual(res.start.character, 1);
            assert.strictEqual(res.end.line, 2);
            assert.strictEqual(res.end.character, 11);
            res = range.intersection(new types.$5J(2, 12, 4, 0));
            assert.strictEqual(res, undefined);
            res = range.intersection(new types.$5J(0, 0, 1, 0));
            assert.strictEqual(res, undefined);
            res = range.intersection(new types.$5J(0, 0, 1, 1));
            assert.ok(res.isEmpty);
            assert.strictEqual(res.start.line, 1);
            assert.strictEqual(res.start.character, 1);
            res = range.intersection(new types.$5J(2, 11, 61, 1));
            assert.ok(res.isEmpty);
            assert.strictEqual(res.start.line, 2);
            assert.strictEqual(res.start.character, 11);
            assert.throws(() => range.intersection(null));
            assert.throws(() => range.intersection(undefined));
        });
        test('Range, union', function () {
            let ran1 = new types.$5J(0, 0, 5, 5);
            assert.ok(ran1.union(new types.$5J(0, 0, 1, 1)) === ran1);
            let res;
            res = ran1.union(new types.$5J(2, 2, 9, 9));
            assert.ok(res.start === ran1.start);
            assert.strictEqual(res.end.line, 9);
            assert.strictEqual(res.end.character, 9);
            ran1 = new types.$5J(2, 1, 5, 3);
            res = ran1.union(new types.$5J(1, 0, 4, 2));
            assert.ok(res.end === ran1.end);
            assert.strictEqual(res.start.line, 1);
            assert.strictEqual(res.start.character, 0);
        });
        test('Range, with', function () {
            const range = new types.$5J(1, 1, 2, 11);
            assert.ok(range.with(range.start) === range);
            assert.ok(range.with(undefined, range.end) === range);
            assert.ok(range.with(range.start, range.end) === range);
            assert.ok(range.with(new types.$4J(1, 1)) === range);
            assert.ok(range.with(undefined, new types.$4J(2, 11)) === range);
            assert.ok(range.with() === range);
            assert.ok(range.with({ start: range.start }) === range);
            assert.ok(range.with({ start: new types.$4J(1, 1) }) === range);
            assert.ok(range.with({ end: range.end }) === range);
            assert.ok(range.with({ end: new types.$4J(2, 11) }) === range);
            let res = range.with(undefined, new types.$4J(9, 8));
            assert.strictEqual(res.end.line, 9);
            assert.strictEqual(res.end.character, 8);
            assert.strictEqual(res.start.line, 1);
            assert.strictEqual(res.start.character, 1);
            res = range.with({ end: new types.$4J(9, 8) });
            assert.strictEqual(res.end.line, 9);
            assert.strictEqual(res.end.character, 8);
            assert.strictEqual(res.start.line, 1);
            assert.strictEqual(res.start.character, 1);
            res = range.with({ end: new types.$4J(9, 8), start: new types.$4J(2, 3) });
            assert.strictEqual(res.end.line, 9);
            assert.strictEqual(res.end.character, 8);
            assert.strictEqual(res.start.line, 2);
            assert.strictEqual(res.start.character, 3);
            assert.throws(() => range.with(null));
            assert.throws(() => range.with(undefined, null));
        });
        test('TextEdit', () => {
            const range = new types.$5J(1, 1, 2, 11);
            let edit = new types.$0J(range, undefined);
            assert.strictEqual(edit.newText, '');
            assertToJSON(edit, { range: [{ line: 1, character: 1 }, { line: 2, character: 11 }], newText: '' });
            edit = new types.$0J(range, null);
            assert.strictEqual(edit.newText, '');
            edit = new types.$0J(range, '');
            assert.strictEqual(edit.newText, '');
        });
        test('WorkspaceEdit', () => {
            const a = uri_1.URI.file('a.ts');
            const b = uri_1.URI.file('b.ts');
            const edit = new types.$aK();
            assert.ok(!edit.has(a));
            edit.set(a, [types.$0J.insert(new types.$4J(0, 0), 'fff')]);
            assert.ok(edit.has(a));
            assert.strictEqual(edit.size, 1);
            assertToJSON(edit, [[a.toJSON(), [{ range: [{ line: 0, character: 0 }, { line: 0, character: 0 }], newText: 'fff' }]]]);
            edit.insert(b, new types.$4J(1, 1), 'fff');
            edit.delete(b, new types.$5J(0, 0, 0, 0));
            assert.ok(edit.has(b));
            assert.strictEqual(edit.size, 2);
            assertToJSON(edit, [
                [a.toJSON(), [{ range: [{ line: 0, character: 0 }, { line: 0, character: 0 }], newText: 'fff' }]],
                [b.toJSON(), [{ range: [{ line: 1, character: 1 }, { line: 1, character: 1 }], newText: 'fff' }, { range: [{ line: 0, character: 0 }, { line: 0, character: 0 }], newText: '' }]]
            ]);
            edit.set(b, undefined);
            assert.ok(!edit.has(b));
            assert.strictEqual(edit.size, 1);
            edit.set(b, [types.$0J.insert(new types.$4J(0, 0), 'ffff')]);
            assert.strictEqual(edit.get(b).length, 1);
        });
        test('WorkspaceEdit - keep order of text and file changes', function () {
            const edit = new types.$aK();
            edit.replace(uri_1.URI.parse('foo:a'), new types.$5J(1, 1, 1, 1), 'foo');
            edit.renameFile(uri_1.URI.parse('foo:a'), uri_1.URI.parse('foo:b'));
            edit.replace(uri_1.URI.parse('foo:a'), new types.$5J(2, 1, 2, 1), 'bar');
            edit.replace(uri_1.URI.parse('foo:b'), new types.$5J(3, 1, 3, 1), 'bazz');
            const all = edit._allEntries();
            assert.strictEqual(all.length, 4);
            const [first, second, third, fourth] = all;
            (0, types_1.$tf)(first._type === 2 /* types.FileEditType.Text */);
            assert.strictEqual(first.uri.toString(), 'foo:a');
            (0, types_1.$tf)(second._type === 1 /* types.FileEditType.File */);
            assert.strictEqual(second.from.toString(), 'foo:a');
            assert.strictEqual(second.to.toString(), 'foo:b');
            (0, types_1.$tf)(third._type === 2 /* types.FileEditType.Text */);
            assert.strictEqual(third.uri.toString(), 'foo:a');
            (0, types_1.$tf)(fourth._type === 2 /* types.FileEditType.Text */);
            assert.strictEqual(fourth.uri.toString(), 'foo:b');
        });
        test('WorkspaceEdit - two edits for one resource', function () {
            const edit = new types.$aK();
            const uri = uri_1.URI.parse('foo:bar');
            edit.insert(uri, new types.$4J(0, 0), 'Hello');
            edit.insert(uri, new types.$4J(0, 0), 'Foo');
            assert.strictEqual(edit._allEntries().length, 2);
            const [first, second] = edit._allEntries();
            (0, types_1.$tf)(first._type === 2 /* types.FileEditType.Text */);
            (0, types_1.$tf)(second._type === 2 /* types.FileEditType.Text */);
            assert.strictEqual(first.edit.newText, 'Hello');
            assert.strictEqual(second.edit.newText, 'Foo');
        });
        test('DocumentLink', () => {
            assert.throws(() => new types.$BK(null, null));
            assert.throws(() => new types.$BK(new types.$5J(1, 1, 1, 1), null));
        });
        test('toJSON & stringify', function () {
            assertToJSON(new types.$6J(3, 4, 2, 1), { start: { line: 2, character: 1 }, end: { line: 3, character: 4 }, anchor: { line: 3, character: 4 }, active: { line: 2, character: 1 } });
            assertToJSON(new types.$cK(uri_1.URI.file('u.ts'), new types.$4J(3, 4)), { uri: uri_1.URI.parse('file:///u.ts').toJSON(), range: [{ line: 3, character: 4 }, { line: 3, character: 4 }] });
            assertToJSON(new types.$cK(uri_1.URI.file('u.ts'), new types.$5J(1, 2, 3, 4)), { uri: uri_1.URI.parse('file:///u.ts').toJSON(), range: [{ line: 1, character: 2 }, { line: 3, character: 4 }] });
            const diag = new types.$eK(new types.$5J(0, 1, 2, 3), 'hello');
            assertToJSON(diag, { severity: 'Error', message: 'hello', range: [{ line: 0, character: 1 }, { line: 2, character: 3 }] });
            diag.source = 'me';
            assertToJSON(diag, { severity: 'Error', message: 'hello', range: [{ line: 0, character: 1 }, { line: 2, character: 3 }], source: 'me' });
            assertToJSON(new types.$gK(new types.$5J(2, 3, 4, 5)), { range: [{ line: 2, character: 3 }, { line: 4, character: 5 }], kind: 'Text' });
            assertToJSON(new types.$gK(new types.$5J(2, 3, 4, 5), types.DocumentHighlightKind.Read), { range: [{ line: 2, character: 3 }, { line: 4, character: 5 }], kind: 'Read' });
            assertToJSON(new types.$hK('test', types.SymbolKind.Boolean, new types.$5J(0, 1, 2, 3)), {
                name: 'test',
                kind: 'Boolean',
                location: {
                    range: [{ line: 0, character: 1 }, { line: 2, character: 3 }]
                }
            });
            assertToJSON(new types.$pK(new types.$5J(7, 8, 9, 10)), { range: [{ line: 7, character: 8 }, { line: 9, character: 10 }] });
            assertToJSON(new types.$pK(new types.$5J(7, 8, 9, 10), { command: 'id', title: 'title' }), {
                range: [{ line: 7, character: 8 }, { line: 9, character: 10 }],
                command: { command: 'id', title: 'title' }
            });
            assertToJSON(new types.$wK('complete'), { label: 'complete' });
            const item = new types.$wK('complete');
            item.kind = types.CompletionItemKind.Interface;
            assertToJSON(item, { label: 'complete', kind: 'Interface' });
        });
        test('SymbolInformation, old ctor', function () {
            const info = new types.$hK('foo', types.SymbolKind.Array, new types.$5J(1, 1, 2, 3));
            assert.ok(info.location instanceof types.$cK);
            assert.strictEqual(info.location.uri, undefined);
        });
        test('SnippetString, builder-methods', function () {
            let string;
            string = new types.$bK();
            assert.strictEqual(string.appendText('I need $ and $').value, 'I need \\$ and \\$');
            string = new types.$bK();
            assert.strictEqual(string.appendText('I need \\$').value, 'I need \\\\\\$');
            string = new types.$bK();
            string.appendPlaceholder('fo$o}');
            assert.strictEqual(string.value, '${1:fo\\$o\\}}');
            string = new types.$bK();
            string.appendText('foo').appendTabstop(0).appendText('bar');
            assert.strictEqual(string.value, 'foo$0bar');
            string = new types.$bK();
            string.appendText('foo').appendTabstop().appendText('bar');
            assert.strictEqual(string.value, 'foo$1bar');
            string = new types.$bK();
            string.appendText('foo').appendTabstop(42).appendText('bar');
            assert.strictEqual(string.value, 'foo$42bar');
            string = new types.$bK();
            string.appendText('foo').appendPlaceholder('farboo').appendText('bar');
            assert.strictEqual(string.value, 'foo${1:farboo}bar');
            string = new types.$bK();
            string.appendText('foo').appendPlaceholder('far$boo').appendText('bar');
            assert.strictEqual(string.value, 'foo${1:far\\$boo}bar');
            string = new types.$bK();
            string.appendText('foo').appendPlaceholder(b => b.appendText('abc').appendPlaceholder('nested')).appendText('bar');
            assert.strictEqual(string.value, 'foo${1:abc${2:nested}}bar');
            string = new types.$bK();
            string.appendVariable('foo');
            assert.strictEqual(string.value, '${foo}');
            string = new types.$bK();
            string.appendText('foo').appendVariable('TM_SELECTED_TEXT').appendText('bar');
            assert.strictEqual(string.value, 'foo${TM_SELECTED_TEXT}bar');
            string = new types.$bK();
            string.appendVariable('BAR', b => b.appendPlaceholder('ops'));
            assert.strictEqual(string.value, '${BAR:${1:ops}}');
            string = new types.$bK();
            string.appendVariable('BAR', b => { });
            assert.strictEqual(string.value, '${BAR}');
            string = new types.$bK();
            string.appendChoice(['b', 'a', 'r']);
            assert.strictEqual(string.value, '${1|b,a,r|}');
            string = new types.$bK();
            string.appendChoice(['b,1', 'a,2', 'r,3']);
            assert.strictEqual(string.value, '${1|b\\,1,a\\,2,r\\,3|}');
            string = new types.$bK();
            string.appendChoice(['b', 'a', 'r'], 0);
            assert.strictEqual(string.value, '${0|b,a,r|}');
            string = new types.$bK();
            string.appendText('foo').appendChoice(['far', 'boo']).appendText('bar');
            assert.strictEqual(string.value, 'foo${1|far,boo|}bar');
            string = new types.$bK();
            string.appendText('foo').appendChoice(['far', '$boo']).appendText('bar');
            assert.strictEqual(string.value, 'foo${1|far,\\$boo|}bar');
            string = new types.$bK();
            string.appendText('foo').appendPlaceholder('farboo').appendChoice(['far', 'boo']).appendText('bar');
            assert.strictEqual(string.value, 'foo${1:farboo}${2|far,boo|}bar');
        });
        test('instanceof doesn\'t work for FileSystemError #49386', function () {
            const error = types.$dL.Unavailable('foo');
            assert.ok(error instanceof Error);
            assert.ok(error instanceof types.$dL);
        });
        test('CancellationError', function () {
            // The CancellationError-type is used internally and exported as API. Make sure that at
            // its name and message are `Canceled`
            const err = new errors_1.$3();
            assert.strictEqual(err.name, 'Canceled');
            assert.strictEqual(err.message, 'Canceled');
        });
        test('CodeActionKind contains', () => {
            assert.ok(types.$kK.RefactorExtract.contains(types.$kK.RefactorExtract));
            assert.ok(types.$kK.RefactorExtract.contains(types.$kK.RefactorExtract.append('other')));
            assert.ok(!types.$kK.RefactorExtract.contains(types.$kK.Refactor));
            assert.ok(!types.$kK.RefactorExtract.contains(types.$kK.Refactor.append('other')));
            assert.ok(!types.$kK.RefactorExtract.contains(types.$kK.Empty.append('other').append('refactor')));
            assert.ok(!types.$kK.RefactorExtract.contains(types.$kK.Empty.append('refactory')));
        });
        test('CodeActionKind intersects', () => {
            assert.ok(types.$kK.RefactorExtract.intersects(types.$kK.RefactorExtract));
            assert.ok(types.$kK.RefactorExtract.intersects(types.$kK.Refactor));
            assert.ok(types.$kK.RefactorExtract.intersects(types.$kK.RefactorExtract.append('other')));
            assert.ok(!types.$kK.RefactorExtract.intersects(types.$kK.Refactor.append('other')));
            assert.ok(!types.$kK.RefactorExtract.intersects(types.$kK.Empty.append('other').append('refactor')));
            assert.ok(!types.$kK.RefactorExtract.intersects(types.$kK.Empty.append('refactory')));
        });
        function toArr(uint32Arr) {
            const r = [];
            for (let i = 0, len = uint32Arr.length; i < len; i++) {
                r[i] = uint32Arr[i];
            }
            return r;
        }
        test('SemanticTokensBuilder simple', () => {
            const builder = new types.$gL();
            builder.push(1, 0, 5, 1, 1);
            builder.push(1, 10, 4, 2, 2);
            builder.push(2, 2, 3, 2, 2);
            assert.deepStrictEqual(toArr(builder.build().data), [
                1, 0, 5, 1, 1,
                0, 10, 4, 2, 2,
                1, 2, 3, 2, 2
            ]);
        });
        test('SemanticTokensBuilder no modifier', () => {
            const builder = new types.$gL();
            builder.push(1, 0, 5, 1);
            builder.push(1, 10, 4, 2);
            builder.push(2, 2, 3, 2);
            assert.deepStrictEqual(toArr(builder.build().data), [
                1, 0, 5, 1, 0,
                0, 10, 4, 2, 0,
                1, 2, 3, 2, 0
            ]);
        });
        test('SemanticTokensBuilder out of order 1', () => {
            const builder = new types.$gL();
            builder.push(2, 0, 5, 1, 1);
            builder.push(2, 10, 1, 2, 2);
            builder.push(2, 15, 2, 3, 3);
            builder.push(1, 0, 4, 4, 4);
            assert.deepStrictEqual(toArr(builder.build().data), [
                1, 0, 4, 4, 4,
                1, 0, 5, 1, 1,
                0, 10, 1, 2, 2,
                0, 5, 2, 3, 3
            ]);
        });
        test('SemanticTokensBuilder out of order 2', () => {
            const builder = new types.$gL();
            builder.push(2, 10, 5, 1, 1);
            builder.push(2, 2, 4, 2, 2);
            assert.deepStrictEqual(toArr(builder.build().data), [
                2, 2, 4, 2, 2,
                0, 8, 5, 1, 1
            ]);
        });
        test('SemanticTokensBuilder with legend', () => {
            const legend = new types.$fL(['aType', 'bType', 'cType', 'dType'], ['mod0', 'mod1', 'mod2', 'mod3', 'mod4', 'mod5']);
            const builder = new types.$gL(legend);
            builder.push(new types.$5J(1, 0, 1, 5), 'bType');
            builder.push(new types.$5J(2, 0, 2, 4), 'cType', ['mod0', 'mod5']);
            builder.push(new types.$5J(3, 0, 3, 3), 'dType', ['mod2', 'mod4']);
            assert.deepStrictEqual(toArr(builder.build().data), [
                1, 0, 5, 1, 0,
                1, 0, 4, 2, 1 | (1 << 5),
                1, 0, 3, 3, (1 << 2) | (1 << 4)
            ]);
        });
        test('Markdown codeblock rendering is swapped #111604', function () {
            const md = new types.$qK().appendCodeblock('<img src=0 onerror="alert(1)">', 'html');
            assert.deepStrictEqual(md.value, '\n```html\n<img src=0 onerror="alert(1)">\n```\n');
        });
        test('NotebookCellOutputItem - factories', function () {
            assert.throws(() => {
                // invalid mime type
                new types.$qL(new Uint8Array(), 'invalid');
            });
            // --- err
            let item = types.$qL.error(new Error());
            assert.strictEqual(item.mime, 'application/vnd.code.notebook.error');
            item = types.$qL.error({ name: 'Hello' });
            assert.strictEqual(item.mime, 'application/vnd.code.notebook.error');
            // --- JSON
            item = types.$qL.json(1);
            assert.strictEqual(item.mime, 'text/x-json');
            assert.deepStrictEqual(item.data, new TextEncoder().encode(JSON.stringify(1)));
            item = types.$qL.json(1, 'foo/bar');
            assert.strictEqual(item.mime, 'foo/bar');
            assert.deepStrictEqual(item.data, new TextEncoder().encode(JSON.stringify(1)));
            item = types.$qL.json(true);
            assert.strictEqual(item.mime, 'text/x-json');
            assert.deepStrictEqual(item.data, new TextEncoder().encode(JSON.stringify(true)));
            item = types.$qL.json([true, 1, 'ddd']);
            assert.strictEqual(item.mime, 'text/x-json');
            assert.deepStrictEqual(item.data, new TextEncoder().encode(JSON.stringify([true, 1, 'ddd'], undefined, '\t')));
            // --- text
            item = types.$qL.text('Hęłlö');
            assert.strictEqual(item.mime, mime_1.$Hr.text);
            assert.deepStrictEqual(item.data, new TextEncoder().encode('Hęłlö'));
            item = types.$qL.text('Hęłlö', 'foo/bar');
            assert.strictEqual(item.mime, 'foo/bar');
            assert.deepStrictEqual(item.data, new TextEncoder().encode('Hęłlö'));
        });
        test('FileDecoration#validate', function () {
            assert.ok(types.$lL.validate({ badge: 'u' }));
            assert.ok(types.$lL.validate({ badge: 'ü' }));
            assert.ok(types.$lL.validate({ badge: '1' }));
            assert.ok(types.$lL.validate({ badge: 'ãã' }));
            assert.ok(types.$lL.validate({ badge: '👋' }));
            assert.ok(types.$lL.validate({ badge: '👋👋' }));
            assert.ok(types.$lL.validate({ badge: '👩‍👩‍👧‍👧' }));
            assert.ok(types.$lL.validate({ badge: 'போ' }));
            assert.throws(() => types.$lL.validate({ badge: 'hel' }));
            assert.throws(() => types.$lL.validate({ badge: '👋👋👋' }));
            assert.throws(() => types.$lL.validate({ badge: 'புன்சிரிப்போடு' }));
            assert.throws(() => types.$lL.validate({ badge: 'ããã' }));
        });
    });
});
//# sourceMappingURL=extHostTypes.test.js.map