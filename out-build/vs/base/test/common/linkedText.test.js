/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/linkedText"], function (require, exports, assert, linkedText_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('LinkedText', () => {
        test('parses correctly', () => {
            assert.deepStrictEqual((0, linkedText_1.$IS)('').nodes, []);
            assert.deepStrictEqual((0, linkedText_1.$IS)('hello').nodes, ['hello']);
            assert.deepStrictEqual((0, linkedText_1.$IS)('hello there').nodes, ['hello there']);
            assert.deepStrictEqual((0, linkedText_1.$IS)('Some message with [link text](http://link.href).').nodes, [
                'Some message with ',
                { label: 'link text', href: 'http://link.href' },
                '.'
            ]);
            assert.deepStrictEqual((0, linkedText_1.$IS)('Some message with [link text](http://link.href "and a title").').nodes, [
                'Some message with ',
                { label: 'link text', href: 'http://link.href', title: 'and a title' },
                '.'
            ]);
            assert.deepStrictEqual((0, linkedText_1.$IS)('Some message with [link text](http://link.href \'and a title\').').nodes, [
                'Some message with ',
                { label: 'link text', href: 'http://link.href', title: 'and a title' },
                '.'
            ]);
            assert.deepStrictEqual((0, linkedText_1.$IS)('Some message with [link text](http://link.href "and a \'title\'").').nodes, [
                'Some message with ',
                { label: 'link text', href: 'http://link.href', title: 'and a \'title\'' },
                '.'
            ]);
            assert.deepStrictEqual((0, linkedText_1.$IS)('Some message with [link text](http://link.href \'and a "title"\').').nodes, [
                'Some message with ',
                { label: 'link text', href: 'http://link.href', title: 'and a "title"' },
                '.'
            ]);
            assert.deepStrictEqual((0, linkedText_1.$IS)('Some message with [link text](random stuff).').nodes, [
                'Some message with [link text](random stuff).'
            ]);
            assert.deepStrictEqual((0, linkedText_1.$IS)('Some message with [https link](https://link.href).').nodes, [
                'Some message with ',
                { label: 'https link', href: 'https://link.href' },
                '.'
            ]);
            assert.deepStrictEqual((0, linkedText_1.$IS)('Some message with [https link](https:).').nodes, [
                'Some message with [https link](https:).'
            ]);
            assert.deepStrictEqual((0, linkedText_1.$IS)('Some message with [a command](command:foobar).').nodes, [
                'Some message with ',
                { label: 'a command', href: 'command:foobar' },
                '.'
            ]);
            assert.deepStrictEqual((0, linkedText_1.$IS)('Some message with [a command](command:).').nodes, [
                'Some message with [a command](command:).'
            ]);
            assert.deepStrictEqual((0, linkedText_1.$IS)('link [one](command:foo "nice") and link [two](http://foo)...').nodes, [
                'link ',
                { label: 'one', href: 'command:foo', title: 'nice' },
                ' and link ',
                { label: 'two', href: 'http://foo' },
                '...'
            ]);
            assert.deepStrictEqual((0, linkedText_1.$IS)('link\n[one](command:foo "nice")\nand link [two](http://foo)...').nodes, [
                'link\n',
                { label: 'one', href: 'command:foo', title: 'nice' },
                '\nand link ',
                { label: 'two', href: 'http://foo' },
                '...'
            ]);
        });
        test('Should match non-greedily', () => {
            assert.deepStrictEqual((0, linkedText_1.$IS)('a [link text 1](http://link.href "title1") b [link text 2](http://link.href "title2") c').nodes, [
                'a ',
                { label: 'link text 1', href: 'http://link.href', title: 'title1' },
                ' b ',
                { label: 'link text 2', href: 'http://link.href', title: 'title2' },
                ' c',
            ]);
        });
    });
});
//# sourceMappingURL=linkedText.test.js.map