"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
require("mocha");
const vscode = require("vscode");
const inMemoryDocument_1 = require("../client/inMemoryDocument");
const engine_1 = require("./engine");
const testFileName = vscode.Uri.file('test.md');
suite('markdown.engine', () => {
    suite('rendering', () => {
        const input = '# hello\n\nworld!';
        const output = '<h1 data-line="0" class="code-line" dir="auto" id="hello">hello</h1>\n'
            + '<p data-line="2" class="code-line" dir="auto">world!</p>\n';
        test('Renders a document', async () => {
            const doc = new inMemoryDocument_1.InMemoryDocument(testFileName, input);
            const engine = (0, engine_1.createNewMarkdownEngine)();
            assert.strictEqual((await engine.render(doc)).html, output);
        });
        test('Renders a string', async () => {
            const engine = (0, engine_1.createNewMarkdownEngine)();
            assert.strictEqual((await engine.render(input)).html, output);
        });
    });
    suite('image-caching', () => {
        const input = '![](img.png) [](no-img.png) ![](http://example.org/img.png) ![](img.png) ![](./img2.png)';
        test('Extracts all images', async () => {
            const engine = (0, engine_1.createNewMarkdownEngine)();
            const result = await engine.render(input);
            assert.deepStrictEqual(result.html, '<p data-line="0" class="code-line" dir="auto">'
                + '<img src="img.png" alt="" data-src="img.png"> '
                + '<a href="no-img.png" data-href="no-img.png"></a> '
                + '<img src="http://example.org/img.png" alt="" data-src="http://example.org/img.png"> '
                + '<img src="img.png" alt="" data-src="img.png"> '
                + '<img src="./img2.png" alt="" data-src="./img2.png">'
                + '</p>\n');
            assert.deepStrictEqual([...result.containingImages], ['img.png', 'http://example.org/img.png', './img2.png']);
        });
    });
});
//# sourceMappingURL=engine.test.js.map