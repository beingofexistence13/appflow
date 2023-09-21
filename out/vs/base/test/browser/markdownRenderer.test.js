/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/browser/markdownRenderer", "vs/base/common/htmlContent", "vs/base/common/marked/marked", "vs/base/common/marshalling", "vs/base/common/platform", "vs/base/common/uri"], function (require, exports, assert, markdownRenderer_1, htmlContent_1, marked_1, marshalling_1, platform_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function strToNode(str) {
        return new DOMParser().parseFromString(str, 'text/html').body.firstChild;
    }
    function assertNodeEquals(actualNode, expectedHtml) {
        const expectedNode = strToNode(expectedHtml);
        assert.ok(actualNode.isEqualNode(expectedNode), `Expected: ${expectedNode.outerHTML}\nActual: ${actualNode.outerHTML}`);
    }
    suite('MarkdownRenderer', () => {
        suite('Sanitization', () => {
            test('Should not render images with unknown schemes', () => {
                const markdown = { value: `![image](no-such://example.com/cat.gif)` };
                const result = (0, markdownRenderer_1.renderMarkdown)(markdown).element;
                assert.strictEqual(result.innerHTML, '<p><img alt="image"></p>');
            });
        });
        suite('Images', () => {
            test('image rendering conforms to default', () => {
                const markdown = { value: `![image](http://example.com/cat.gif 'caption')` };
                const result = (0, markdownRenderer_1.renderMarkdown)(markdown).element;
                assertNodeEquals(result, '<div><p><img title="caption" alt="image" src="http://example.com/cat.gif"></p></div>');
            });
            test('image rendering conforms to default without title', () => {
                const markdown = { value: `![image](http://example.com/cat.gif)` };
                const result = (0, markdownRenderer_1.renderMarkdown)(markdown).element;
                assertNodeEquals(result, '<div><p><img alt="image" src="http://example.com/cat.gif"></p></div>');
            });
            test('image width from title params', () => {
                const result = (0, markdownRenderer_1.renderMarkdown)({ value: `![image](http://example.com/cat.gif|width=100px 'caption')` }).element;
                assertNodeEquals(result, `<div><p><img width="100" title="caption" alt="image" src="http://example.com/cat.gif"></p></div>`);
            });
            test('image height from title params', () => {
                const result = (0, markdownRenderer_1.renderMarkdown)({ value: `![image](http://example.com/cat.gif|height=100 'caption')` }).element;
                assertNodeEquals(result, `<div><p><img height="100" title="caption" alt="image" src="http://example.com/cat.gif"></p></div>`);
            });
            test('image width and height from title params', () => {
                const result = (0, markdownRenderer_1.renderMarkdown)({ value: `![image](http://example.com/cat.gif|height=200,width=100 'caption')` }).element;
                assertNodeEquals(result, `<div><p><img height="200" width="100" title="caption" alt="image" src="http://example.com/cat.gif"></p></div>`);
            });
            test('image with file uri should render as same origin uri', () => {
                if (platform_1.isWeb) {
                    return;
                }
                const result = (0, markdownRenderer_1.renderMarkdown)({ value: `![image](file:///images/cat.gif)` }).element;
                assertNodeEquals(result, '<div><p><img src="vscode-file://vscode-app/images/cat.gif" alt="image"></p></div>');
            });
        });
        suite('Code block renderer', () => {
            const simpleCodeBlockRenderer = (lang, code) => {
                const element = document.createElement('code');
                element.textContent = code;
                return Promise.resolve(element);
            };
            test('asyncRenderCallback should be invoked for code blocks', () => {
                const markdown = { value: '```js\n1 + 1;\n```' };
                return new Promise(resolve => {
                    (0, markdownRenderer_1.renderMarkdown)(markdown, {
                        asyncRenderCallback: resolve,
                        codeBlockRenderer: simpleCodeBlockRenderer
                    });
                });
            });
            test('asyncRenderCallback should not be invoked if result is immediately disposed', () => {
                const markdown = { value: '```js\n1 + 1;\n```' };
                return new Promise((resolve, reject) => {
                    const result = (0, markdownRenderer_1.renderMarkdown)(markdown, {
                        asyncRenderCallback: reject,
                        codeBlockRenderer: simpleCodeBlockRenderer
                    });
                    result.dispose();
                    setTimeout(resolve, 50);
                });
            });
            test('asyncRenderCallback should not be invoked if dispose is called before code block is rendered', () => {
                const markdown = { value: '```js\n1 + 1;\n```' };
                return new Promise((resolve, reject) => {
                    let resolveCodeBlockRendering;
                    const result = (0, markdownRenderer_1.renderMarkdown)(markdown, {
                        asyncRenderCallback: reject,
                        codeBlockRenderer: () => {
                            return new Promise(resolve => {
                                resolveCodeBlockRendering = resolve;
                            });
                        }
                    });
                    setTimeout(() => {
                        result.dispose();
                        resolveCodeBlockRendering(document.createElement('code'));
                        setTimeout(resolve, 50);
                    }, 50);
                });
            });
            test('Code blocks should use leading language id (#157793)', async () => {
                const markdown = { value: '```js some other stuff\n1 + 1;\n```' };
                const lang = await new Promise(resolve => {
                    (0, markdownRenderer_1.renderMarkdown)(markdown, {
                        codeBlockRenderer: async (lang, value) => {
                            resolve(lang);
                            return simpleCodeBlockRenderer(lang, value);
                        }
                    });
                });
                assert.strictEqual(lang, 'js');
            });
        });
        suite('ThemeIcons Support On', () => {
            test('render appendText', () => {
                const mds = new htmlContent_1.MarkdownString(undefined, { supportThemeIcons: true });
                mds.appendText('$(zap) $(not a theme icon) $(add)');
                const result = (0, markdownRenderer_1.renderMarkdown)(mds).element;
                assert.strictEqual(result.innerHTML, `<p>$(zap)&nbsp;$(not&nbsp;a&nbsp;theme&nbsp;icon)&nbsp;$(add)</p>`);
            });
            test('render appendMarkdown', () => {
                const mds = new htmlContent_1.MarkdownString(undefined, { supportThemeIcons: true });
                mds.appendMarkdown('$(zap) $(not a theme icon) $(add)');
                const result = (0, markdownRenderer_1.renderMarkdown)(mds).element;
                assert.strictEqual(result.innerHTML, `<p><span class="codicon codicon-zap"></span> $(not a theme icon) <span class="codicon codicon-add"></span></p>`);
            });
            test('render appendMarkdown with escaped icon', () => {
                const mds = new htmlContent_1.MarkdownString(undefined, { supportThemeIcons: true });
                mds.appendMarkdown('\\$(zap) $(not a theme icon) $(add)');
                const result = (0, markdownRenderer_1.renderMarkdown)(mds).element;
                assert.strictEqual(result.innerHTML, `<p>$(zap) $(not a theme icon) <span class="codicon codicon-add"></span></p>`);
            });
            test('render icon in link', () => {
                const mds = new htmlContent_1.MarkdownString(undefined, { supportThemeIcons: true });
                mds.appendMarkdown(`[$(zap)-link](#link)`);
                const result = (0, markdownRenderer_1.renderMarkdown)(mds).element;
                assert.strictEqual(result.innerHTML, `<p><a data-href="#link" href="" title="#link"><span class="codicon codicon-zap"></span>-link</a></p>`);
            });
            test('render icon in table', () => {
                const mds = new htmlContent_1.MarkdownString(undefined, { supportThemeIcons: true });
                mds.appendMarkdown(`
| text   | text                 |
|--------|----------------------|
| $(zap) | [$(zap)-link](#link) |`);
                const result = (0, markdownRenderer_1.renderMarkdown)(mds).element;
                assert.strictEqual(result.innerHTML, `<table>
<thead>
<tr>
<th>text</th>
<th>text</th>
</tr>
</thead>
<tbody><tr>
<td><span class="codicon codicon-zap"></span></td>
<td><a data-href="#link" href="" title="#link"><span class="codicon codicon-zap"></span>-link</a></td>
</tr>
</tbody></table>
`);
            });
            test('render icon in <a> without href (#152170)', () => {
                const mds = new htmlContent_1.MarkdownString(undefined, { supportThemeIcons: true, supportHtml: true });
                mds.appendMarkdown(`<a>$(sync)</a>`);
                const result = (0, markdownRenderer_1.renderMarkdown)(mds).element;
                assert.strictEqual(result.innerHTML, `<p><span class="codicon codicon-sync"></span></p>`);
            });
        });
        suite('ThemeIcons Support Off', () => {
            test('render appendText', () => {
                const mds = new htmlContent_1.MarkdownString(undefined, { supportThemeIcons: false });
                mds.appendText('$(zap) $(not a theme icon) $(add)');
                const result = (0, markdownRenderer_1.renderMarkdown)(mds).element;
                assert.strictEqual(result.innerHTML, `<p>$(zap)&nbsp;$(not&nbsp;a&nbsp;theme&nbsp;icon)&nbsp;$(add)</p>`);
            });
            test('render appendMarkdown with escaped icon', () => {
                const mds = new htmlContent_1.MarkdownString(undefined, { supportThemeIcons: false });
                mds.appendMarkdown('\\$(zap) $(not a theme icon) $(add)');
                const result = (0, markdownRenderer_1.renderMarkdown)(mds).element;
                assert.strictEqual(result.innerHTML, `<p>$(zap) $(not a theme icon) $(add)</p>`);
            });
        });
        test('npm Hover Run Script not working #90855', function () {
            const md = JSON.parse('{"value":"[Run Script](command:npm.runScriptFromHover?%7B%22documentUri%22%3A%7B%22%24mid%22%3A1%2C%22fsPath%22%3A%22c%3A%5C%5CUsers%5C%5Cjrieken%5C%5CCode%5C%5C_sample%5C%5Cfoo%5C%5Cpackage.json%22%2C%22_sep%22%3A1%2C%22external%22%3A%22file%3A%2F%2F%2Fc%253A%2FUsers%2Fjrieken%2FCode%2F_sample%2Ffoo%2Fpackage.json%22%2C%22path%22%3A%22%2Fc%3A%2FUsers%2Fjrieken%2FCode%2F_sample%2Ffoo%2Fpackage.json%22%2C%22scheme%22%3A%22file%22%7D%2C%22script%22%3A%22echo%22%7D \\"Run the script as a task\\")","supportThemeIcons":false,"isTrusted":true,"uris":{"__uri_e49443":{"$mid":1,"fsPath":"c:\\\\Users\\\\jrieken\\\\Code\\\\_sample\\\\foo\\\\package.json","_sep":1,"external":"file:///c%3A/Users/jrieken/Code/_sample/foo/package.json","path":"/c:/Users/jrieken/Code/_sample/foo/package.json","scheme":"file"},"command:npm.runScriptFromHover?%7B%22documentUri%22%3A%7B%22%24mid%22%3A1%2C%22fsPath%22%3A%22c%3A%5C%5CUsers%5C%5Cjrieken%5C%5CCode%5C%5C_sample%5C%5Cfoo%5C%5Cpackage.json%22%2C%22_sep%22%3A1%2C%22external%22%3A%22file%3A%2F%2F%2Fc%253A%2FUsers%2Fjrieken%2FCode%2F_sample%2Ffoo%2Fpackage.json%22%2C%22path%22%3A%22%2Fc%3A%2FUsers%2Fjrieken%2FCode%2F_sample%2Ffoo%2Fpackage.json%22%2C%22scheme%22%3A%22file%22%7D%2C%22script%22%3A%22echo%22%7D":{"$mid":1,"path":"npm.runScriptFromHover","scheme":"command","query":"{\\"documentUri\\":\\"__uri_e49443\\",\\"script\\":\\"echo\\"}"}}}');
            const element = (0, markdownRenderer_1.renderMarkdown)(md).element;
            const anchor = element.querySelector('a');
            assert.ok(anchor);
            assert.ok(anchor.dataset['href']);
            const uri = uri_1.URI.parse(anchor.dataset['href']);
            const data = (0, marshalling_1.parse)(decodeURIComponent(uri.query));
            assert.ok(data);
            assert.strictEqual(data.script, 'echo');
            assert.ok(data.documentUri.toString().startsWith('file:///c%3A/'));
        });
        test('Should not render command links by default', () => {
            const md = new htmlContent_1.MarkdownString(`[command1](command:doFoo) <a href="command:doFoo">command2</a>`, {
                supportHtml: true
            });
            const result = (0, markdownRenderer_1.renderMarkdown)(md).element;
            assert.strictEqual(result.innerHTML, `<p>command1 command2</p>`);
        });
        test('Should render command links in trusted strings', () => {
            const md = new htmlContent_1.MarkdownString(`[command1](command:doFoo) <a href="command:doFoo">command2</a>`, {
                isTrusted: true,
                supportHtml: true,
            });
            const result = (0, markdownRenderer_1.renderMarkdown)(md).element;
            assert.strictEqual(result.innerHTML, `<p><a data-href="command:doFoo" href="" title="command:doFoo">command1</a> <a data-href="command:doFoo" href="">command2</a></p>`);
        });
        suite('PlaintextMarkdownRender', () => {
            test('test code, blockquote, heading, list, listitem, paragraph, table, tablerow, tablecell, strong, em, br, del, text are rendered plaintext', () => {
                const markdown = { value: '`code`\n>quote\n# heading\n- list\n\n\ntable | table2\n--- | --- \none | two\n\n\nbo**ld**\n_italic_\n~~del~~\nsome text' };
                const expected = 'code\nquote\nheading\nlist\ntable table2 one two \nbold\nitalic\ndel\nsome text\n';
                const result = (0, markdownRenderer_1.renderMarkdownAsPlaintext)(markdown);
                assert.strictEqual(result, expected);
            });
            test('test html, hr, image, link are rendered plaintext', () => {
                const markdown = { value: '<div>html</div>\n\n---\n![image](imageLink)\n[text](textLink)' };
                const expected = '\ntext\n';
                const result = (0, markdownRenderer_1.renderMarkdownAsPlaintext)(markdown);
                assert.strictEqual(result, expected);
            });
        });
        suite('supportHtml', () => {
            test('supportHtml is disabled by default', () => {
                const mds = new htmlContent_1.MarkdownString(undefined, {});
                mds.appendMarkdown('a<b>b</b>c');
                const result = (0, markdownRenderer_1.renderMarkdown)(mds).element;
                assert.strictEqual(result.innerHTML, `<p>abc</p>`);
            });
            test('Renders html when supportHtml=true', () => {
                const mds = new htmlContent_1.MarkdownString(undefined, { supportHtml: true });
                mds.appendMarkdown('a<b>b</b>c');
                const result = (0, markdownRenderer_1.renderMarkdown)(mds).element;
                assert.strictEqual(result.innerHTML, `<p>a<b>b</b>c</p>`);
            });
            test('Should not include scripts even when supportHtml=true', () => {
                const mds = new htmlContent_1.MarkdownString(undefined, { supportHtml: true });
                mds.appendMarkdown('a<b onclick="alert(1)">b</b><script>alert(2)</script>c');
                const result = (0, markdownRenderer_1.renderMarkdown)(mds).element;
                assert.strictEqual(result.innerHTML, `<p>a<b>b</b>c</p>`);
            });
            test('Should not render html appended as text', () => {
                const mds = new htmlContent_1.MarkdownString(undefined, { supportHtml: true });
                mds.appendText('a<b>b</b>c');
                const result = (0, markdownRenderer_1.renderMarkdown)(mds).element;
                assert.strictEqual(result.innerHTML, `<p>a&lt;b&gt;b&lt;/b&gt;c</p>`);
            });
            test('Should render html images', () => {
                if (platform_1.isWeb) {
                    return;
                }
                const mds = new htmlContent_1.MarkdownString(undefined, { supportHtml: true });
                mds.appendMarkdown(`<img src="http://example.com/cat.gif">`);
                const result = (0, markdownRenderer_1.renderMarkdown)(mds).element;
                assert.strictEqual(result.innerHTML, `<img src="http://example.com/cat.gif">`);
            });
            test('Should render html images with file uri as same origin uri', () => {
                if (platform_1.isWeb) {
                    return;
                }
                const mds = new htmlContent_1.MarkdownString(undefined, { supportHtml: true });
                mds.appendMarkdown(`<img src="file:///images/cat.gif">`);
                const result = (0, markdownRenderer_1.renderMarkdown)(mds).element;
                assert.strictEqual(result.innerHTML, `<img src="vscode-file://vscode-app/images/cat.gif">`);
            });
        });
        suite('fillInIncompleteTokens', () => {
            function ignoreRaw(...tokenLists) {
                tokenLists.forEach(tokens => {
                    tokens.forEach(t => t.raw = '');
                });
            }
            const completeTable = '| a | b |\n| --- | --- |';
            suite('table', () => {
                test('complete table', () => {
                    const tokens = marked_1.marked.lexer(completeTable);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    assert.equal(newTokens, tokens);
                });
                test('full header only', () => {
                    const incompleteTable = '| a | b |';
                    const tokens = marked_1.marked.lexer(incompleteTable);
                    const completeTableTokens = marked_1.marked.lexer(completeTable);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    assert.deepStrictEqual(newTokens, completeTableTokens);
                });
                test('full header only with trailing space', () => {
                    const incompleteTable = '| a | b | ';
                    const tokens = marked_1.marked.lexer(incompleteTable);
                    const completeTableTokens = marked_1.marked.lexer(completeTable);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    ignoreRaw(newTokens, completeTableTokens);
                    assert.deepStrictEqual(newTokens, completeTableTokens);
                });
                test('incomplete header', () => {
                    const incompleteTable = '| a | b';
                    const tokens = marked_1.marked.lexer(incompleteTable);
                    const completeTableTokens = marked_1.marked.lexer(completeTable);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    ignoreRaw(newTokens, completeTableTokens);
                    assert.deepStrictEqual(newTokens, completeTableTokens);
                });
                test('incomplete header one column', () => {
                    const incompleteTable = '| a ';
                    const tokens = marked_1.marked.lexer(incompleteTable);
                    const completeTableTokens = marked_1.marked.lexer(incompleteTable + '|\n| --- |');
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    ignoreRaw(newTokens, completeTableTokens);
                    assert.deepStrictEqual(newTokens, completeTableTokens);
                });
                test('full header with extras', () => {
                    const incompleteTable = '| a **bold** | b _italics_ |';
                    const tokens = marked_1.marked.lexer(incompleteTable);
                    const completeTableTokens = marked_1.marked.lexer(incompleteTable + '\n| --- | --- |');
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    assert.deepStrictEqual(newTokens, completeTableTokens);
                });
                test('full header with leading text', () => {
                    // Parsing this gives one token and one 'text' subtoken
                    const incompleteTable = 'here is a table\n| a | b |';
                    const tokens = marked_1.marked.lexer(incompleteTable);
                    const completeTableTokens = marked_1.marked.lexer(incompleteTable + '\n| --- | --- |');
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    assert.deepStrictEqual(newTokens, completeTableTokens);
                });
                test('full header with leading other stuff', () => {
                    // Parsing this gives one token and one 'text' subtoken
                    const incompleteTable = '```js\nconst xyz = 123;\n```\n| a | b |';
                    const tokens = marked_1.marked.lexer(incompleteTable);
                    const completeTableTokens = marked_1.marked.lexer(incompleteTable + '\n| --- | --- |');
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    assert.deepStrictEqual(newTokens, completeTableTokens);
                });
                test('full header with incomplete separator', () => {
                    const incompleteTable = '| a | b |\n| ---';
                    const tokens = marked_1.marked.lexer(incompleteTable);
                    const completeTableTokens = marked_1.marked.lexer(completeTable);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    assert.deepStrictEqual(newTokens, completeTableTokens);
                });
                test('full header with incomplete separator 2', () => {
                    const incompleteTable = '| a | b |\n| --- |';
                    const tokens = marked_1.marked.lexer(incompleteTable);
                    const completeTableTokens = marked_1.marked.lexer(completeTable);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    assert.deepStrictEqual(newTokens, completeTableTokens);
                });
                test('full header with incomplete separator 3', () => {
                    const incompleteTable = '| a | b |\n|';
                    const tokens = marked_1.marked.lexer(incompleteTable);
                    const completeTableTokens = marked_1.marked.lexer(completeTable);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    assert.deepStrictEqual(newTokens, completeTableTokens);
                });
                test('not a table', () => {
                    const incompleteTable = '| a | b |\nsome text';
                    const tokens = marked_1.marked.lexer(incompleteTable);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    assert.deepStrictEqual(newTokens, tokens);
                });
                test('not a table 2', () => {
                    const incompleteTable = '| a | b |\n| --- |\nsome text';
                    const tokens = marked_1.marked.lexer(incompleteTable);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    assert.deepStrictEqual(newTokens, tokens);
                });
            });
            suite('codeblock', () => {
                test('complete code block', () => {
                    const completeCodeblock = '```js\nconst xyz = 123;\n```';
                    const tokens = marked_1.marked.lexer(completeCodeblock);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    assert.equal(newTokens, tokens);
                });
                test('code block header only', () => {
                    const incompleteCodeblock = '```js';
                    const tokens = marked_1.marked.lexer(incompleteCodeblock);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    const completeCodeblockTokens = marked_1.marked.lexer(incompleteCodeblock + '\n```');
                    assert.deepStrictEqual(newTokens, completeCodeblockTokens);
                });
                test('code block header no lang', () => {
                    const incompleteCodeblock = '```';
                    const tokens = marked_1.marked.lexer(incompleteCodeblock);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    const completeCodeblockTokens = marked_1.marked.lexer(incompleteCodeblock + '\n```');
                    assert.deepStrictEqual(newTokens, completeCodeblockTokens);
                });
                test('code block header and some code', () => {
                    const incompleteCodeblock = '```js\nconst';
                    const tokens = marked_1.marked.lexer(incompleteCodeblock);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    const completeCodeblockTokens = marked_1.marked.lexer(incompleteCodeblock + '\n```');
                    assert.deepStrictEqual(newTokens, completeCodeblockTokens);
                });
                test('code block header with leading text', () => {
                    const incompleteCodeblock = 'some text\n```js';
                    const tokens = marked_1.marked.lexer(incompleteCodeblock);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    const completeCodeblockTokens = marked_1.marked.lexer(incompleteCodeblock + '\n```');
                    assert.deepStrictEqual(newTokens, completeCodeblockTokens);
                });
                test('code block header with leading text and some code', () => {
                    const incompleteCodeblock = 'some text\n```js\nconst';
                    const tokens = marked_1.marked.lexer(incompleteCodeblock);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    const completeCodeblockTokens = marked_1.marked.lexer(incompleteCodeblock + '\n```');
                    assert.deepStrictEqual(newTokens, completeCodeblockTokens);
                });
            });
            function simpleMarkdownTestSuite(name, delimiter) {
                test(`incomplete ${name}`, () => {
                    const incomplete = `${delimiter}code`;
                    const tokens = marked_1.marked.lexer(incomplete);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    const completeTokens = marked_1.marked.lexer(incomplete + delimiter);
                    assert.deepStrictEqual(newTokens, completeTokens);
                });
                test(`complete ${name}`, () => {
                    const text = `leading text ${delimiter}code${delimiter} trailing text`;
                    const tokens = marked_1.marked.lexer(text);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    assert.deepStrictEqual(newTokens, tokens);
                });
                test(`${name} with leading text`, () => {
                    const incomplete = `some text and ${delimiter}some code`;
                    const tokens = marked_1.marked.lexer(incomplete);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    const completeTokens = marked_1.marked.lexer(incomplete + delimiter);
                    assert.deepStrictEqual(newTokens, completeTokens);
                });
                test(`single loose "${delimiter}"`, () => {
                    const text = `some text and ${delimiter}by itself\nmore text here`;
                    const tokens = marked_1.marked.lexer(text);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    assert.deepStrictEqual(newTokens, tokens);
                });
                test(`incomplete ${name} after newline`, () => {
                    const text = `some text\nmore text here and ${delimiter}text`;
                    const tokens = marked_1.marked.lexer(text);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    const completeTokens = marked_1.marked.lexer(text + delimiter);
                    assert.deepStrictEqual(newTokens, completeTokens);
                });
                test(`incomplete after complete ${name}`, () => {
                    const text = `leading text ${delimiter}code${delimiter} trailing text and ${delimiter}another`;
                    const tokens = marked_1.marked.lexer(text);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    const completeTokens = marked_1.marked.lexer(text + delimiter);
                    assert.deepStrictEqual(newTokens, completeTokens);
                });
                test.skip(`incomplete ${name} in list`, () => {
                    const text = `- list item one\n- list item two and ${delimiter}text`;
                    const tokens = marked_1.marked.lexer(text);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    const completeTokens = marked_1.marked.lexer(text + delimiter);
                    assert.deepStrictEqual(newTokens, completeTokens);
                });
            }
            suite('codespan', () => {
                simpleMarkdownTestSuite('codespan', '`');
                test(`backtick between letters`, () => {
                    const text = 'a`b';
                    const tokens = marked_1.marked.lexer(text);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    const completeCodespanTokens = marked_1.marked.lexer(text + '`');
                    assert.deepStrictEqual(newTokens, completeCodespanTokens);
                });
                test(`nested pattern`, () => {
                    const text = 'sldkfjsd `abc __def__ ghi';
                    const tokens = marked_1.marked.lexer(text);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    const completeTokens = marked_1.marked.lexer(text + '`');
                    assert.deepStrictEqual(newTokens, completeTokens);
                });
            });
            suite('star', () => {
                simpleMarkdownTestSuite('star', '*');
                test(`star between letters`, () => {
                    const text = 'sldkfjsd a*b';
                    const tokens = marked_1.marked.lexer(text);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    const completeTokens = marked_1.marked.lexer(text + '*');
                    assert.deepStrictEqual(newTokens, completeTokens);
                });
                test(`nested pattern`, () => {
                    const text = 'sldkfjsd *abc __def__ ghi';
                    const tokens = marked_1.marked.lexer(text);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    const completeTokens = marked_1.marked.lexer(text + '*');
                    assert.deepStrictEqual(newTokens, completeTokens);
                });
            });
            suite('double star', () => {
                simpleMarkdownTestSuite('double star', '**');
                test(`double star between letters`, () => {
                    const text = 'a**b';
                    const tokens = marked_1.marked.lexer(text);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    const completeTokens = marked_1.marked.lexer(text + '**');
                    assert.deepStrictEqual(newTokens, completeTokens);
                });
            });
            suite('underscore', () => {
                simpleMarkdownTestSuite('underscore', '_');
                test(`underscore between letters`, () => {
                    const text = `this_not_italics`;
                    const tokens = marked_1.marked.lexer(text);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    assert.deepStrictEqual(newTokens, tokens);
                });
            });
            suite('double underscore', () => {
                simpleMarkdownTestSuite('double underscore', '__');
                test(`double underscore between letters`, () => {
                    const text = `this__not__bold`;
                    const tokens = marked_1.marked.lexer(text);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    assert.deepStrictEqual(newTokens, tokens);
                });
            });
            suite('link', () => {
                test('incomplete link text', () => {
                    const incomplete = 'abc [text';
                    const tokens = marked_1.marked.lexer(incomplete);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    const completeTokens = marked_1.marked.lexer(incomplete + '](about:blank)');
                    assert.deepStrictEqual(newTokens, completeTokens);
                });
                test('incomplete link target', () => {
                    const incomplete = 'foo [text](http://microsoft';
                    const tokens = marked_1.marked.lexer(incomplete);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    const completeTokens = marked_1.marked.lexer(incomplete + ')');
                    assert.deepStrictEqual(newTokens, completeTokens);
                });
                test.skip('incomplete link in list', () => {
                    const incomplete = '- [text';
                    const tokens = marked_1.marked.lexer(incomplete);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    const completeTokens = marked_1.marked.lexer(incomplete + '](about:blank)');
                    assert.deepStrictEqual(newTokens, completeTokens);
                });
                test('square brace between letters', () => {
                    const incomplete = 'a[b';
                    const tokens = marked_1.marked.lexer(incomplete);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    assert.deepStrictEqual(newTokens, tokens);
                });
                test('square brace on previous line', () => {
                    const incomplete = 'text[\nmore text';
                    const tokens = marked_1.marked.lexer(incomplete);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    assert.deepStrictEqual(newTokens, tokens);
                });
                test('complete link', () => {
                    const incomplete = 'text [link](http://microsoft.com)';
                    const tokens = marked_1.marked.lexer(incomplete);
                    const newTokens = (0, markdownRenderer_1.fillInIncompleteTokens)(tokens);
                    assert.deepStrictEqual(newTokens, tokens);
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd25SZW5kZXJlci50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS90ZXN0L2Jyb3dzZXIvbWFya2Rvd25SZW5kZXJlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBVWhHLFNBQVMsU0FBUyxDQUFDLEdBQVc7UUFDN0IsT0FBTyxJQUFJLFNBQVMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQXlCLENBQUM7SUFDekYsQ0FBQztJQUVELFNBQVMsZ0JBQWdCLENBQUMsVUFBdUIsRUFBRSxZQUFvQjtRQUN0RSxNQUFNLFlBQVksR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDN0MsTUFBTSxDQUFDLEVBQUUsQ0FDUixVQUFVLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxFQUNwQyxhQUFhLFlBQVksQ0FBQyxTQUFTLGFBQWEsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7SUFDMUUsQ0FBQztJQUVELEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUU7UUFDOUIsS0FBSyxDQUFDLGNBQWMsRUFBRSxHQUFHLEVBQUU7WUFDMUIsSUFBSSxDQUFDLCtDQUErQyxFQUFFLEdBQUcsRUFBRTtnQkFDMUQsTUFBTSxRQUFRLEdBQUcsRUFBRSxLQUFLLEVBQUUseUNBQXlDLEVBQUUsQ0FBQztnQkFDdEUsTUFBTSxNQUFNLEdBQWdCLElBQUEsaUNBQWMsRUFBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUM7Z0JBQzdELE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO1lBQ2xFLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSCxLQUFLLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRTtZ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