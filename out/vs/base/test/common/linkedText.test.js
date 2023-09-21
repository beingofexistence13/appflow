/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/linkedText"], function (require, exports, assert, linkedText_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('LinkedText', () => {
        test('parses correctly', () => {
            assert.deepStrictEqual((0, linkedText_1.parseLinkedText)('').nodes, []);
            assert.deepStrictEqual((0, linkedText_1.parseLinkedText)('hello').nodes, ['hello']);
            assert.deepStrictEqual((0, linkedText_1.parseLinkedText)('hello there').nodes, ['hello there']);
            assert.deepStrictEqual((0, linkedText_1.parseLinkedText)('Some message with [link text](http://link.href).').nodes, [
                'Some message with ',
                { label: 'link text', href: 'http://link.href' },
                '.'
            ]);
            assert.deepStrictEqual((0, linkedText_1.parseLinkedText)('Some message with [link text](http://link.href "and a title").').nodes, [
                'Some message with ',
                { label: 'link text', href: 'http://link.href', title: 'and a title' },
                '.'
            ]);
            assert.deepStrictEqual((0, linkedText_1.parseLinkedText)('Some message with [link text](http://link.href \'and a title\').').nodes, [
                'Some message with ',
                { label: 'link text', href: 'http://link.href', title: 'and a title' },
                '.'
            ]);
            assert.deepStrictEqual((0, linkedText_1.parseLinkedText)('Some message with [link text](http://link.href "and a \'title\'").').nodes, [
                'Some message with ',
                { label: 'link text', href: 'http://link.href', title: 'and a \'title\'' },
                '.'
            ]);
            assert.deepStrictEqual((0, linkedText_1.parseLinkedText)('Some message with [link text](http://link.href \'and a "title"\').').nodes, [
                'Some message with ',
                { label: 'link text', href: 'http://link.href', title: 'and a "title"' },
                '.'
            ]);
            assert.deepStrictEqual((0, linkedText_1.parseLinkedText)('Some message with [link text](random stuff).').nodes, [
                'Some message with [link text](random stuff).'
            ]);
            assert.deepStrictEqual((0, linkedText_1.parseLinkedText)('Some message with [https link](https://link.href).').nodes, [
                'Some message with ',
                { label: 'https link', href: 'https://link.href' },
                '.'
            ]);
            assert.deepStrictEqual((0, linkedText_1.parseLinkedText)('Some message with [https link](https:).').nodes, [
                'Some message with [https link](https:).'
            ]);
            assert.deepStrictEqual((0, linkedText_1.parseLinkedText)('Some message with [a command](command:foobar).').nodes, [
                'Some message with ',
                { label: 'a command', href: 'command:foobar' },
                '.'
            ]);
            assert.deepStrictEqual((0, linkedText_1.parseLinkedText)('Some message with [a command](command:).').nodes, [
                'Some message with [a command](command:).'
            ]);
            assert.deepStrictEqual((0, linkedText_1.parseLinkedText)('link [one](command:foo "nice") and link [two](http://foo)...').nodes, [
                'link ',
                { label: 'one', href: 'command:foo', title: 'nice' },
                ' and link ',
                { label: 'two', href: 'http://foo' },
                '...'
            ]);
            assert.deepStrictEqual((0, linkedText_1.parseLinkedText)('link\n[one](command:foo "nice")\nand link [two](http://foo)...').nodes, [
                'link\n',
                { label: 'one', href: 'command:foo', title: 'nice' },
                '\nand link ',
                { label: 'two', href: 'http://foo' },
                '...'
            ]);
        });
        test('Should match non-greedily', () => {
            assert.deepStrictEqual((0, linkedText_1.parseLinkedText)('a [link text 1](http://link.href "title1") b [link text 2](http://link.href "title2") c').nodes, [
                'a ',
                { label: 'link text 1', href: 'http://link.href', title: 'title1' },
                ' b ',
                { label: 'link text 2', href: 'http://link.href', title: 'title2' },
                ' c',
            ]);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlua2VkVGV4dC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS90ZXN0L2NvbW1vbi9saW5rZWRUZXh0LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFLaEcsS0FBSyxDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUU7UUFDeEIsSUFBSSxDQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRTtZQUM3QixNQUFNLENBQUMsZUFBZSxDQUFDLElBQUEsNEJBQWUsRUFBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDdEQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFBLDRCQUFlLEVBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNsRSxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUEsNEJBQWUsRUFBQyxhQUFhLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQzlFLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBQSw0QkFBZSxFQUFDLGtEQUFrRCxDQUFDLENBQUMsS0FBSyxFQUFFO2dCQUNqRyxvQkFBb0I7Z0JBQ3BCLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsa0JBQWtCLEVBQUU7Z0JBQ2hELEdBQUc7YUFDSCxDQUFDLENBQUM7WUFDSCxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUEsNEJBQWUsRUFBQyxnRUFBZ0UsQ0FBQyxDQUFDLEtBQUssRUFBRTtnQkFDL0csb0JBQW9CO2dCQUNwQixFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLGtCQUFrQixFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUU7Z0JBQ3RFLEdBQUc7YUFDSCxDQUFDLENBQUM7WUFDSCxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUEsNEJB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