"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const jsdom_1 = require("jsdom");
const linkify_1 = require("../linkify");
const dom = new jsdom_1.JSDOM();
global.document = dom.window.document;
suite('Notebook builtin output link detection', () => {
    linkify_1.LinkDetector.injectedHtmlCreator = (value) => value;
    test('no links', () => {
        const htmlWithLinks = (0, linkify_1.linkify)('hello', true, undefined, true);
        assert.equal(htmlWithLinks.innerHTML, 'hello');
    });
    test('web link detection', () => {
        const htmlWithLinks = (0, linkify_1.linkify)('something www.example.com something', true, undefined, true);
        assert.equal(htmlWithLinks.innerHTML, 'something <a href="www.example.com">www.example.com</a> something');
        assert.equal(htmlWithLinks.textContent, 'something www.example.com something');
    });
    test('html link detection', () => {
        const htmlWithLinks = (0, linkify_1.linkify)('something <a href="www.example.com">link</a> something', true, undefined, true);
        assert.equal(htmlWithLinks.innerHTML, 'something <span><a href="www.example.com">link</a></span> something');
        assert.equal(htmlWithLinks.textContent, 'something link something');
    });
    test('html link without trust', () => {
        const trustHtml = false;
        const htmlWithLinks = (0, linkify_1.linkify)('something <a href="file.py">link</a> something', true, undefined, trustHtml);
        assert.equal(htmlWithLinks.innerHTML, 'something &lt;a href="file.py"&gt;link&lt;/a&gt; something');
        assert.equal(htmlWithLinks.textContent, 'something <a href="file.py">link</a> something');
    });
});
//# sourceMappingURL=linkify.test.js.map