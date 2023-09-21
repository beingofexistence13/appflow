/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/contrib/snippets/browser/snippetsFile", "vs/base/common/uri", "vs/editor/contrib/snippet/browser/snippetParser", "vs/base/common/uuid"], function (require, exports, assert, snippetsFile_1, uri_1, snippetParser_1, uuid_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Snippets', function () {
        class TestSnippetFile extends snippetsFile_1.SnippetFile {
            constructor(filepath, snippets) {
                super(3 /* SnippetSource.Extension */, filepath, undefined, undefined, undefined, undefined);
                this.data.push(...snippets);
            }
        }
        test('SnippetFile#select', () => {
            let file = new TestSnippetFile(uri_1.URI.file('somepath/foo.code-snippets'), []);
            let bucket = [];
            file.select('', bucket);
            assert.strictEqual(bucket.length, 0);
            file = new TestSnippetFile(uri_1.URI.file('somepath/foo.code-snippets'), [
                new snippetsFile_1.Snippet(false, ['foo'], 'FooSnippet1', 'foo', '', 'snippet', 'test', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()),
                new snippetsFile_1.Snippet(false, ['foo'], 'FooSnippet2', 'foo', '', 'snippet', 'test', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()),
                new snippetsFile_1.Snippet(false, ['bar'], 'BarSnippet1', 'foo', '', 'snippet', 'test', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()),
                new snippetsFile_1.Snippet(false, ['bar.comment'], 'BarSnippet2', 'foo', '', 'snippet', 'test', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()),
                new snippetsFile_1.Snippet(false, ['bar.strings'], 'BarSnippet2', 'foo', '', 'snippet', 'test', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()),
                new snippetsFile_1.Snippet(false, ['bazz', 'bazz'], 'BazzSnippet1', 'foo', '', 'snippet', 'test', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()),
            ]);
            bucket = [];
            file.select('foo', bucket);
            assert.strictEqual(bucket.length, 2);
            bucket = [];
            file.select('fo', bucket);
            assert.strictEqual(bucket.length, 0);
            bucket = [];
            file.select('bar', bucket);
            assert.strictEqual(bucket.length, 1);
            bucket = [];
            file.select('bar.comment', bucket);
            assert.strictEqual(bucket.length, 2);
            bucket = [];
            file.select('bazz', bucket);
            assert.strictEqual(bucket.length, 1);
        });
        test('SnippetFile#select - any scope', function () {
            const file = new TestSnippetFile(uri_1.URI.file('somepath/foo.code-snippets'), [
                new snippetsFile_1.Snippet(false, [], 'AnySnippet1', 'foo', '', 'snippet', 'test', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()),
                new snippetsFile_1.Snippet(false, ['foo'], 'FooSnippet1', 'foo', '', 'snippet', 'test', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()),
            ]);
            const bucket = [];
            file.select('foo', bucket);
            assert.strictEqual(bucket.length, 2);
        });
        test('Snippet#needsClipboard', function () {
            function assertNeedsClipboard(body, expected) {
                const snippet = new snippetsFile_1.Snippet(false, ['foo'], 'FooSnippet1', 'foo', '', body, 'test', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)());
                assert.strictEqual(snippet.needsClipboard, expected);
                assert.strictEqual(snippetParser_1.SnippetParser.guessNeedsClipboard(body), expected);
            }
            assertNeedsClipboard('foo$CLIPBOARD', true);
            assertNeedsClipboard('${CLIPBOARD}', true);
            assertNeedsClipboard('foo${CLIPBOARD}bar', true);
            assertNeedsClipboard('foo$clipboard', false);
            assertNeedsClipboard('foo${clipboard}', false);
            assertNeedsClipboard('baba', false);
        });
        test('Snippet#isTrivial', function () {
            function assertIsTrivial(body, expected) {
                const snippet = new snippetsFile_1.Snippet(false, ['foo'], 'FooSnippet1', 'foo', '', body, 'test', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)());
                assert.strictEqual(snippet.isTrivial, expected);
            }
            assertIsTrivial('foo', true);
            assertIsTrivial('foo$0', true);
            assertIsTrivial('foo$0bar', false);
            assertIsTrivial('foo$1', false);
            assertIsTrivial('foo$1$0', false);
            assertIsTrivial('${1:foo}', false);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25pcHBldEZpbGUudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3NuaXBwZXRzL3Rlc3QvYnJvd3Nlci9zbmlwcGV0RmlsZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBUWhHLEtBQUssQ0FBQyxVQUFVLEVBQUU7UUFFakIsTUFBTSxlQUFnQixTQUFRLDBCQUFXO1lBQ3hDLFlBQVksUUFBYSxFQUFFLFFBQW1CO2dCQUM3QyxLQUFLLGtDQUEwQixRQUFRLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFVLEVBQUUsU0FBVSxDQUFDLENBQUM7Z0JBQ3ZGLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUM7WUFDN0IsQ0FBQztTQUNEO1FBRUQsSUFBSSxDQUFDLG9CQUFvQixFQUFFLEdBQUcsRUFBRTtZQUMvQixJQUFJLElBQUksR0FBRyxJQUFJLGVBQWUsQ0FBQyxTQUFHLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDM0UsSUFBSSxNQUFNLEdBQWMsRUFBRSxDQUFDO1lBQzNCLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3hCLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVyQyxJQUFJLEdBQUcsSUFBSSxlQUFlLENBQUMsU0FBRyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxFQUFFO2dCQUNsRSxJQUFJLHNCQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLE1BQU0sOEJBQXNCLElBQUEsbUJBQVksR0FBRSxDQUFDO2dCQUM1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