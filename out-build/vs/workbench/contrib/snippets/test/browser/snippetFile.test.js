/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/contrib/snippets/browser/snippetsFile", "vs/base/common/uri", "vs/editor/contrib/snippet/browser/snippetParser", "vs/base/common/uuid"], function (require, exports, assert, snippetsFile_1, uri_1, snippetParser_1, uuid_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Snippets', function () {
        class TestSnippetFile extends snippetsFile_1.$_lb {
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
                new snippetsFile_1.$$lb(false, ['foo'], 'FooSnippet1', 'foo', '', 'snippet', 'test', 1 /* SnippetSource.User */, (0, uuid_1.$4f)()),
                new snippetsFile_1.$$lb(false, ['foo'], 'FooSnippet2', 'foo', '', 'snippet', 'test', 1 /* SnippetSource.User */, (0, uuid_1.$4f)()),
                new snippetsFile_1.$$lb(false, ['bar'], 'BarSnippet1', 'foo', '', 'snippet', 'test', 1 /* SnippetSource.User */, (0, uuid_1.$4f)()),
                new snippetsFile_1.$$lb(false, ['bar.comment'], 'BarSnippet2', 'foo', '', 'snippet', 'test', 1 /* SnippetSource.User */, (0, uuid_1.$4f)()),
                new snippetsFile_1.$$lb(false, ['bar.strings'], 'BarSnippet2', 'foo', '', 'snippet', 'test', 1 /* SnippetSource.User */, (0, uuid_1.$4f)()),
                new snippetsFile_1.$$lb(false, ['bazz', 'bazz'], 'BazzSnippet1', 'foo', '', 'snippet', 'test', 1 /* SnippetSource.User */, (0, uuid_1.$4f)()),
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
                new snippetsFile_1.$$lb(false, [], 'AnySnippet1', 'foo', '', 'snippet', 'test', 1 /* SnippetSource.User */, (0, uuid_1.$4f)()),
                new snippetsFile_1.$$lb(false, ['foo'], 'FooSnippet1', 'foo', '', 'snippet', 'test', 1 /* SnippetSource.User */, (0, uuid_1.$4f)()),
            ]);
            const bucket = [];
            file.select('foo', bucket);
            assert.strictEqual(bucket.length, 2);
        });
        test('Snippet#needsClipboard', function () {
            function assertNeedsClipboard(body, expected) {
                const snippet = new snippetsFile_1.$$lb(false, ['foo'], 'FooSnippet1', 'foo', '', body, 'test', 1 /* SnippetSource.User */, (0, uuid_1.$4f)());
                assert.strictEqual(snippet.needsClipboard, expected);
                assert.strictEqual(snippetParser_1.$G5.guessNeedsClipboard(body), expected);
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
                const snippet = new snippetsFile_1.$$lb(false, ['foo'], 'FooSnippet1', 'foo', '', body, 'test', 1 /* SnippetSource.User */, (0, uuid_1.$4f)());
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
//# sourceMappingURL=snippetFile.test.js.map