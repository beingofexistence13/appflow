"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const vscode = require("vscode");
const assert = require("assert");
require("mocha");
const shared_1 = require("../languageFeatures/copyFiles/shared");
suite('createEditAddingLinksForUriList', () => {
    test('Markdown Link Pasting should occur for a valid link (end to end)', async () => {
        // createEditAddingLinksForUriList -> checkSmartPaste -> tryGetUriListSnippet -> createUriListSnippet -> createLinkSnippet
        const skinnyDocument = {
            uri: vscode.Uri.parse('file:///path/to/your/file'),
            offsetAt: function () { return 0; },
            getText: function () { return 'hello world!'; },
        };
        const result = await (0, shared_1.createEditAddingLinksForUriList)(skinnyDocument, [new vscode.Range(0, 0, 0, 12)], 'https://www.microsoft.com/', true, true, new vscode.CancellationTokenSource().token);
        // need to check the actual result -> snippet value
        assert.strictEqual(result?.label, 'Insert Markdown Link');
    });
    suite('validateLink', () => {
        test('Markdown pasting should occur for a valid link.', () => {
            const isLink = (0, shared_1.validateLink)('https://www.microsoft.com/').isValid;
            assert.strictEqual(isLink, true);
        });
        test('Markdown pasting should occur for a valid link preceded by a new line.', () => {
            const isLink = (0, shared_1.validateLink)('\r\nhttps://www.microsoft.com/').isValid;
            assert.strictEqual(isLink, true);
        });
        test('Markdown pasting should occur for a valid link followed by a new line.', () => {
            const isLink = (0, shared_1.validateLink)('https://www.microsoft.com/\r\n').isValid;
            assert.strictEqual(isLink, true);
        });
        test('Markdown pasting should not occur for a valid hostname and invalid protool.', () => {
            const isLink = (0, shared_1.validateLink)('invalid:www.microsoft.com').isValid;
            assert.strictEqual(isLink, false);
        });
        test('Markdown pasting should not occur for plain text.', () => {
            const isLink = (0, shared_1.validateLink)('hello world!').isValid;
            assert.strictEqual(isLink, false);
        });
        test('Markdown pasting should not occur for plain text including a colon.', () => {
            const isLink = (0, shared_1.validateLink)('hello: world!').isValid;
            assert.strictEqual(isLink, false);
        });
        test('Markdown pasting should not occur for plain text including a slashes.', () => {
            const isLink = (0, shared_1.validateLink)('helloworld!').isValid;
            assert.strictEqual(isLink, false);
        });
        test('Markdown pasting should not occur for a link followed by text.', () => {
            const isLink = (0, shared_1.validateLink)('https://www.microsoft.com/ hello world!').isValid;
            assert.strictEqual(isLink, false);
        });
        test('Markdown pasting should occur for a link preceded or followed by spaces.', () => {
            const isLink = (0, shared_1.validateLink)('     https://www.microsoft.com/     ').isValid;
            assert.strictEqual(isLink, true);
        });
        test('Markdown pasting should not occur for a link with an invalid scheme.', () => {
            const isLink = (0, shared_1.validateLink)('hello:www.microsoft.com').isValid;
            assert.strictEqual(isLink, false);
        });
        test('Markdown pasting should not occur for multiple links being pasted.', () => {
            const isLink = (0, shared_1.validateLink)('https://www.microsoft.com/\r\nhttps://www.microsoft.com/\r\nhttps://www.microsoft.com/\r\nhttps://www.microsoft.com/').isValid;
            assert.strictEqual(isLink, false);
        });
        test('Markdown pasting should not occur for multiple links with spaces being pasted.', () => {
            const isLink = (0, shared_1.validateLink)('https://www.microsoft.com/    \r\nhttps://www.microsoft.com/\r\nhttps://www.microsoft.com/\r\n hello \r\nhttps://www.microsoft.com/').isValid;
            assert.strictEqual(isLink, false);
        });
        test('Markdown pasting should not occur for just a valid uri scheme', () => {
            const isLink = (0, shared_1.validateLink)('https://').isValid;
            assert.strictEqual(isLink, false);
        });
    });
    suite('appendToLinkSnippet', () => {
        test('Should create snippet with < > when pasted link has an mismatched parentheses', () => {
            const uriString = 'https://www.mic(rosoft.com';
            const snippet = (0, shared_1.appendToLinkSnippet)(new vscode.SnippetString(''), 'abc', uriString, 0, true);
            assert.strictEqual(snippet?.value, '[${0:abc}](<https://www.mic(rosoft.com>)');
        });
        test('Should create Markdown link snippet when pasteAsMarkdownLink is true', () => {
            const uriString = 'https://www.microsoft.com';
            const snippet = (0, shared_1.appendToLinkSnippet)(new vscode.SnippetString(''), '', uriString, 0, true);
            assert.strictEqual(snippet?.value, '[${0:Title}](https://www.microsoft.com)');
        });
        test('Should use an unencoded URI string in Markdown link when passing in an external browser link', () => {
            const uriString = 'https://www.microsoft.com';
            const snippet = (0, shared_1.appendToLinkSnippet)(new vscode.SnippetString(''), '', uriString, 0, true);
            assert.strictEqual(snippet?.value, '[${0:Title}](https://www.microsoft.com)');
        });
        test('Should not decode an encoded URI string when passing in an external browser link', () => {
            const uriString = 'https://www.microsoft.com/%20';
            const snippet = (0, shared_1.appendToLinkSnippet)(new vscode.SnippetString(''), '', uriString, 0, true);
            assert.strictEqual(snippet?.value, '[${0:Title}](https://www.microsoft.com/%20)');
        });
        test('Should not encode an unencoded URI string when passing in an external browser link', () => {
            const uriString = 'https://www.example.com/path?query=value&another=value#fragment';
            const snippet = (0, shared_1.appendToLinkSnippet)(new vscode.SnippetString(''), '', uriString, 0, true);
            assert.strictEqual(snippet?.value, '[${0:Title}](https://www.example.com/path?query=value&another=value#fragment)');
        });
    });
    suite('checkSmartPaste', () => {
        const skinnyDocument = {
            uri: vscode.Uri.file('/path/to/your/file'),
            offsetAt: function () { return 0; },
            getText: function () { return 'hello world!'; },
        };
        test('Should evaluate pasteAsMarkdownLink as true for selected plain text', () => {
            const pasteAsMarkdownLink = (0, shared_1.checkSmartPaste)(skinnyDocument, new vscode.Range(0, 0, 0, 12), new vscode.Range(0, 0, 0, 12));
            assert.strictEqual(pasteAsMarkdownLink, true);
        });
        test('Should evaluate pasteAsMarkdownLink as false for a valid selected link', () => {
            skinnyDocument.getText = function () { return 'https://www.microsoft.com'; };
            const pasteAsMarkdownLink = (0, shared_1.checkSmartPaste)(skinnyDocument, new vscode.Range(0, 0, 0, 25), new vscode.Range(0, 0, 0, 25));
            assert.strictEqual(pasteAsMarkdownLink, false);
        });
        test('Should evaluate pasteAsMarkdownLink as false for a valid selected link with trailing whitespace', () => {
            skinnyDocument.getText = function () { return '   https://www.microsoft.com  '; };
            const pasteAsMarkdownLink = (0, shared_1.checkSmartPaste)(skinnyDocument, new vscode.Range(0, 0, 0, 30), new vscode.Range(0, 0, 0, 30));
            assert.strictEqual(pasteAsMarkdownLink, false);
        });
        test('Should evaluate pasteAsMarkdownLink as true for a link pasted in square brackets', () => {
            skinnyDocument.getText = function () { return '[abc]'; };
            const pasteAsMarkdownLink = (0, shared_1.checkSmartPaste)(skinnyDocument, new vscode.Range(0, 1, 0, 4), new vscode.Range(0, 1, 0, 4));
            assert.strictEqual(pasteAsMarkdownLink, true);
        });
        test('Should evaluate pasteAsMarkdownLink as false for no selection', () => {
            const pasteAsMarkdownLink = (0, shared_1.checkSmartPaste)(skinnyDocument, new vscode.Range(0, 0, 0, 0), new vscode.Range(0, 0, 0, 0));
            assert.strictEqual(pasteAsMarkdownLink, false);
        });
        test('Should evaluate pasteAsMarkdownLink as false for selected whitespace and new lines', () => {
            skinnyDocument.getText = function () { return '   \r\n\r\n'; };
            const pasteAsMarkdownLink = (0, shared_1.checkSmartPaste)(skinnyDocument, new vscode.Range(0, 0, 0, 7), new vscode.Range(0, 0, 0, 7));
            assert.strictEqual(pasteAsMarkdownLink, false);
        });
        test('Should evaluate pasteAsMarkdownLink as false for pasting within a backtick code block', () => {
            skinnyDocument.getText = function () { return '```\r\n\r\n```'; };
            const pasteAsMarkdownLink = (0, shared_1.checkSmartPaste)(skinnyDocument, new vscode.Range(0, 5, 0, 5), new vscode.Range(0, 5, 0, 5));
            assert.strictEqual(pasteAsMarkdownLink, false);
        });
        test('Should evaluate pasteAsMarkdownLink as false for pasting within a tilde code block', () => {
            skinnyDocument.getText = function () { return '~~~\r\n\r\n~~~'; };
            const pasteAsMarkdownLink = (0, shared_1.checkSmartPaste)(skinnyDocument, new vscode.Range(0, 5, 0, 5), new vscode.Range(0, 5, 0, 5));
            assert.strictEqual(pasteAsMarkdownLink, false);
        });
        test('Should evaluate pasteAsMarkdownLink as false for pasting within a math block', () => {
            skinnyDocument.getText = function () { return '$$$\r\n\r\n$$$'; };
            const pasteAsMarkdownLink = (0, shared_1.checkSmartPaste)(skinnyDocument, new vscode.Range(0, 5, 0, 5), new vscode.Range(0, 5, 0, 5));
            assert.strictEqual(pasteAsMarkdownLink, false);
        });
        const linkSkinnyDoc = {
            uri: vscode.Uri.file('/path/to/your/file'),
            offsetAt: function () { return 0; },
            getText: function () { return '[a](bcdef)'; },
        };
        test('Should evaluate pasteAsMarkdownLink as false for pasting within a Markdown link', () => {
            const pasteAsMarkdownLink = (0, shared_1.checkSmartPaste)(linkSkinnyDoc, new vscode.Range(0, 4, 0, 6), new vscode.Range(0, 4, 0, 6));
            assert.strictEqual(pasteAsMarkdownLink, false);
        });
        const imageLinkSkinnyDoc = {
            uri: vscode.Uri.file('/path/to/your/file'),
            offsetAt: function () { return 0; },
            getText: function () { return '![a](bcdef)'; },
        };
        test('Should evaluate pasteAsMarkdownLink as false for pasting within a Markdown image link', () => {
            const pasteAsMarkdownLink = (0, shared_1.checkSmartPaste)(imageLinkSkinnyDoc, new vscode.Range(0, 5, 0, 10), new vscode.Range(0, 5, 0, 10));
            assert.strictEqual(pasteAsMarkdownLink, false);
        });
        const inlineCodeSkinnyCode = {
            uri: vscode.Uri.file('/path/to/your/file'),
            offsetAt: function () { return 0; },
            getText: function () { return '``'; },
        };
        test('Should evaluate pasteAsMarkdownLink as false for pasting within inline code', () => {
            const pasteAsMarkdownLink = (0, shared_1.checkSmartPaste)(inlineCodeSkinnyCode, new vscode.Range(0, 1, 0, 1), new vscode.Range(0, 1, 0, 1));
            assert.strictEqual(pasteAsMarkdownLink, false);
        });
        const inlineMathSkinnyDoc = {
            uri: vscode.Uri.file('/path/to/your/file'),
            offsetAt: function () { return 0; },
            getText: function () { return '$$'; },
        };
        test('Should evaluate pasteAsMarkdownLink as false for pasting within inline math', () => {
            const pasteAsMarkdownLink = (0, shared_1.checkSmartPaste)(inlineMathSkinnyDoc, new vscode.Range(0, 1, 0, 1), new vscode.Range(0, 1, 0, 1));
            assert.strictEqual(pasteAsMarkdownLink, false);
        });
    });
});
//# sourceMappingURL=markdownLink.test.js.map