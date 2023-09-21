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
                const result = (0, markdownRenderer_1.$zQ)(markdown).element;
                assert.strictEqual(result.innerHTML, '<p><img alt="image"></p>');
            });
        });
        suite('Images', () => {
            test('image rendering conforms to default', () => {
                const markdown = { value: `![image](http://example.com/cat.gif 'caption')` };
                const result = (0, markdownRenderer_1.$zQ)(markdown).element;
                assertNodeEquals(result, '<div><p><img title="caption" alt="image" src="http://example.com/cat.gif"></p></div>');
            });
            test('image rendering conforms to default without title', () => {
                const markdown = { value: `![image](http://example.com/cat.gif)` };
                const result = (0, markdownRenderer_1.$zQ)(markdown).element;
                assertNodeEquals(result, '<div><p><img alt="image" src="http://example.com/cat.gif"></p></div>');
            });
            test('image width from title params', () => {
                const result = (0, markdownRenderer_1.$zQ)({ value: `![image](http://example.com/cat.gif|width=100px 'caption')` }).element;
                assertNodeEquals(result, `<div><p><img width="100" title="caption" alt="image" src="http://example.com/cat.gif"></p></div>`);
            });
            test('image height from title params', () => {
                const result = (0, markdownRenderer_1.$zQ)({ value: `![image](http://example.com/cat.gif|height=100 'caption')` }).element;
                assertNodeEquals(result, `<div><p><img height="100" title="caption" alt="image" src="http://example.com/cat.gif"></p></div>`);
            });
            test('image width and height from title params', () => {
                const result = (0, markdownRenderer_1.$zQ)({ value: `![image](http://example.com/cat.gif|height=200,width=100 'caption')` }).element;
                assertNodeEquals(result, `<div><p><img height="200" width="100" title="caption" alt="image" src="http://example.com/cat.gif"></p></div>`);
            });
            test('image with file uri should render as same origin uri', () => {
                if (platform_1.$o) {
                    return;
                }
                const result = (0, markdownRenderer_1.$zQ)({ value: `![image](file:///images/cat.gif)` }).element;
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
                    (0, markdownRenderer_1.$zQ)(markdown, {
                        asyncRenderCallback: resolve,
                        codeBlockRenderer: simpleCodeBlockRenderer
                    });
                });
            });
            test('asyncRenderCallback should not be invoked if result is immediately disposed', () => {
                const markdown = { value: '```js\n1 + 1;\n```' };
                return new Promise((resolve, reject) => {
                    const result = (0, markdownRenderer_1.$zQ)(markdown, {
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
                    const result = (0, markdownRenderer_1.$zQ)(markdown, {
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
                    (0, markdownRenderer_1.$zQ)(markdown, {
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
                const mds = new htmlContent_1.$Xj(undefined, { supportThemeIcons: true });
                mds.appendText('$(zap) $(not a theme icon) $(add)');
                const result = (0, markdownRenderer_1.$zQ)(mds).element;
                assert.strictEqual(result.innerHTML, `<p>$(zap)&nbsp;$(not&nbsp;a&nbsp;theme&nbsp;icon)&nbsp;$(add)</p>`);
            });
            test('render appendMarkdown', () => {
                const mds = new htmlContent_1.$Xj(undefined, { supportThemeIcons: true });
                mds.appendMarkdown('$(zap) $(not a theme icon) $(add)');
                const result = (0, markdownRenderer_1.$zQ)(mds).element;
                assert.strictEqual(result.innerHTML, `<p><span class="codicon codicon-zap"></span> $(not a theme icon) <span class="codicon codicon-add"></span></p>`);
            });
            test('render appendMarkdown with escaped icon', () => {
                const mds = new htmlContent_1.$Xj(undefined, { supportThemeIcons: true });
                mds.appendMarkdown('\\$(zap) $(not a theme icon) $(add)');
                const result = (0, markdownRenderer_1.$zQ)(mds).element;
                assert.strictEqual(result.innerHTML, `<p>$(zap) $(not a theme icon) <span class="codicon codicon-add"></span></p>`);
            });
            test('render icon in link', () => {
                const mds = new htmlContent_1.$Xj(undefined, { supportThemeIcons: true });
                mds.appendMarkdown(`[$(zap)-link](#link)`);
                const result = (0, markdownRenderer_1.$zQ)(mds).element;
                assert.strictEqual(result.innerHTML, `<p><a data-href="#link" href="" title="#link"><span class="codicon codicon-zap"></span>-link</a></p>`);
            });
            test('render icon in table', () => {
                const mds = new htmlContent_1.$Xj(undefined, { supportThemeIcons: true });
                mds.appendMarkdown(`
| text   | text                 |
|--------|----------------------|
| $(zap) | [$(zap)-link](#link) |`);
                const result = (0, markdownRenderer_1.$zQ)(mds).element;
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
                const mds = new htmlContent_1.$Xj(undefined, { supportThemeIcons: true, supportHtml: true });
                mds.appendMarkdown(`<a>$(sync)</a>`);
                const result = (0, markdownRenderer_1.$zQ)(mds).element;
                assert.strictEqual(result.innerHTML, `<p><span class="codicon codicon-sync"></span></p>`);
            });
        });
        suite('ThemeIcons Support Off', () => {
            test('render appendText', () => {
                const mds = new htmlContent_1.$Xj(undefined, { supportThemeIcons: false });
                mds.appendText('$(zap) $(not a theme icon) $(add)');
                const result = (0, markdownRenderer_1.$zQ)(mds).element;
                assert.strictEqual(result.innerHTML, `<p>$(zap)&nbsp;$(not&nbsp;a&nbsp;theme&nbsp;icon)&nbsp;$(add)</p>`);
            });
            test('render appendMarkdown with escaped icon', () => {
                const mds = new htmlContent_1.$Xj(undefined, { supportThemeIcons: false });
                mds.appendMarkdown('\\$(zap) $(not a theme icon) $(add)');
                const result = (0, markdownRenderer_1.$zQ)(mds).element;
                assert.strictEqual(result.innerHTML, `<p>$(zap) $(not a theme icon) $(add)</p>`);
            });
        });
        test('npm Hover Run Script not working #90855', function () {
            const md = JSON.parse('{"value":"[Run Script](command:npm.runScriptFromHover?%7B%22documentUri%22%3A%7B%22%24mid%22%3A1%2C%22fsPath%22%3A%22c%3A%5C%5CUsers%5C%5Cjrieken%5C%5CCode%5C%5C_sample%5C%5Cfoo%5C%5Cpackage.json%22%2C%22_sep%22%3A1%2C%22external%22%3A%22file%3A%2F%2F%2Fc%253A%2FUsers%2Fjrieken%2FCode%2F_sample%2Ffoo%2Fpackage.json%22%2C%22path%22%3A%22%2Fc%3A%2FUsers%2Fjrieken%2FCode%2F_sample%2Ffoo%2Fpackage.json%22%2C%22scheme%22%3A%22file%22%7D%2C%22script%22%3A%22echo%22%7D \\"Run the script as a task\\")","supportThemeIcons":false,"isTrusted":true,"uris":{"__uri_e49443":{"$mid":1,"fsPath":"c:\\\\Users\\\\jrieken\\\\Code\\\\_sample\\\\foo\\\\package.json","_sep":1,"external":"file:///c%3A/Users/jrieken/Code/_sample/foo/package.json","path":"/c:/Users/jrieken/Code/_sample/foo/package.json","scheme":"file"},"command:npm.runScriptFromHover?%7B%22documentUri%22%3A%7B%22%24mid%22%3A1%2C%22fsPath%22%3A%22c%3A%5C%5CUsers%5C%5Cjrieken%5C%5CCode%5C%5C_sample%5C%5Cfoo%5C%5Cpackage.json%22%2C%22_sep%22%3A1%2C%22external%22%3A%22file%3A%2F%2F%2Fc%253A%2FUsers%2Fjrieken%2FCode%2F_sample%2Ffoo%2Fpackage.json%22%2C%22path%22%3A%22%2Fc%3A%2FUsers%2Fjrieken%2FCode%2F_sample%2Ffoo%2Fpackage.json%22%2C%22scheme%22%3A%22file%22%7D%2C%22script%22%3A%22echo%22%7D":{"$mid":1,"path":"npm.runScriptFromHover","scheme":"command","query":"{\\"documentUri\\":\\"__uri_e49443\\",\\"script\\":\\"echo\\"}"}}}');
            const element = (0, markdownRenderer_1.$zQ)(md).element;
            const anchor = element.querySelector('a');
            assert.ok(anchor);
            assert.ok(anchor.dataset['href']);
            const uri = uri_1.URI.parse(anchor.dataset['href']);
            const data = (0, marshalling_1.$0g)(decodeURIComponent(uri.query));
            assert.ok(data);
            assert.strictEqual(data.script, 'echo');
            assert.ok(data.documentUri.toString().startsWith('file:///c%3A/'));
        });
        test('Should not render command links by default', () => {
            const md = new htmlContent_1.$Xj(`[command1](command:doFoo) <a href="command:doFoo">command2</a>`, {
                supportHtml: true
            });
            const result = (0, markdownRenderer_1.$zQ)(md).element;
            assert.strictEqual(result.innerHTML, `<p>command1 command2</p>`);
        });
        test('Should render command links in trusted strings', () => {
            const md = new htmlContent_1.$Xj(`[command1](command:doFoo) <a href="command:doFoo">command2</a>`, {
                isTrusted: true,
                supportHtml: true,
            });
            const result = (0, markdownRenderer_1.$zQ)(md).element;
            assert.strictEqual(result.innerHTML, `<p><a data-href="command:doFoo" href="" title="command:doFoo">command1</a> <a data-href="command:doFoo" href="">command2</a></p>`);
        });
        suite('PlaintextMarkdownRender', () => {
            test('test code, blockquote, heading, list, listitem, paragraph, table, tablerow, tablecell, strong, em, br, del, text are rendered plaintext', () => {
                const markdown = { value: '`code`\n>quote\n# heading\n- list\n\n\ntable | table2\n--- | --- \none | two\n\n\nbo**ld**\n_italic_\n~~del~~\nsome text' };
                const expected = 'code\nquote\nheading\nlist\ntable table2 one two \nbold\nitalic\ndel\nsome text\n';
                const result = (0, markdownRenderer_1.$CQ)(markdown);
                assert.strictEqual(result, expected);
            });
            test('test html, hr, image, link are rendered plaintext', () => {
                const markdown = { value: '<div>html</div>\n\n---\n![image](imageLink)\n[text](textLink)' };
                const expected = '\ntext\n';
                const result = (0, markdownRenderer_1.$CQ)(markdown);
                assert.strictEqual(result, expected);
            });
        });
        suite('supportHtml', () => {
            test('supportHtml is disabled by default', () => {
                const mds = new htmlContent_1.$Xj(undefined, {});
                mds.appendMarkdown('a<b>b</b>c');
                const result = (0, markdownRenderer_1.$zQ)(mds).element;
                assert.strictEqual(result.innerHTML, `<p>abc</p>`);
            });
            test('Renders html when supportHtml=true', () => {
                const mds = new htmlContent_1.$Xj(undefined, { supportHtml: true });
                mds.appendMarkdown('a<b>b</b>c');
                const result = (0, markdownRenderer_1.$zQ)(mds).element;
                assert.strictEqual(result.innerHTML, `<p>a<b>b</b>c</p>`);
            });
            test('Should not include scripts even when supportHtml=true', () => {
                const mds = new htmlContent_1.$Xj(undefined, { supportHtml: true });
                mds.appendMarkdown('a<b onclick="alert(1)">b</b><script>alert(2)</script>c');
                const result = (0, markdownRenderer_1.$zQ)(mds).element;
                assert.strictEqual(result.innerHTML, `<p>a<b>b</b>c</p>`);
            });
            test('Should not render html appended as text', () => {
                const mds = new htmlContent_1.$Xj(undefined, { supportHtml: true });
                mds.appendText('a<b>b</b>c');
                const result = (0, markdownRenderer_1.$zQ)(mds).element;
                assert.strictEqual(result.innerHTML, `<p>a&lt;b&gt;b&lt;/b&gt;c</p>`);
            });
            test('Should render html images', () => {
                if (platform_1.$o) {
                    return;
                }
                const mds = new htmlContent_1.$Xj(undefined, { supportHtml: true });
                mds.appendMarkdown(`<img src="http://example.com/cat.gif">`);
                const result = (0, markdownRenderer_1.$zQ)(mds).element;
                assert.strictEqual(result.innerHTML, `<img src="http://example.com/cat.gif">`);
            });
            test('Should render html images with file uri as same origin uri', () => {
                if (platform_1.$o) {
                    return;
                }
                const mds = new htmlContent_1.$Xj(undefined, { supportHtml: true });
                mds.appendMarkdown(`<img src="file:///images/cat.gif">`);
                const result = (0, markdownRenderer_1.$zQ)(mds).element;
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
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    assert.equal(newTokens, tokens);
                });
                test('full header only', () => {
                    const incompleteTable = '| a | b |';
                    const tokens = marked_1.marked.lexer(incompleteTable);
                    const completeTableTokens = marked_1.marked.lexer(completeTable);
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    assert.deepStrictEqual(newTokens, completeTableTokens);
                });
                test('full header only with trailing space', () => {
                    const incompleteTable = '| a | b | ';
                    const tokens = marked_1.marked.lexer(incompleteTable);
                    const completeTableTokens = marked_1.marked.lexer(completeTable);
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    ignoreRaw(newTokens, completeTableTokens);
                    assert.deepStrictEqual(newTokens, completeTableTokens);
                });
                test('incomplete header', () => {
                    const incompleteTable = '| a | b';
                    const tokens = marked_1.marked.lexer(incompleteTable);
                    const completeTableTokens = marked_1.marked.lexer(completeTable);
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    ignoreRaw(newTokens, completeTableTokens);
                    assert.deepStrictEqual(newTokens, completeTableTokens);
                });
                test('incomplete header one column', () => {
                    const incompleteTable = '| a ';
                    const tokens = marked_1.marked.lexer(incompleteTable);
                    const completeTableTokens = marked_1.marked.lexer(incompleteTable + '|\n| --- |');
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    ignoreRaw(newTokens, completeTableTokens);
                    assert.deepStrictEqual(newTokens, completeTableTokens);
                });
                test('full header with extras', () => {
                    const incompleteTable = '| a **bold** | b _italics_ |';
                    const tokens = marked_1.marked.lexer(incompleteTable);
                    const completeTableTokens = marked_1.marked.lexer(incompleteTable + '\n| --- | --- |');
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    assert.deepStrictEqual(newTokens, completeTableTokens);
                });
                test('full header with leading text', () => {
                    // Parsing this gives one token and one 'text' subtoken
                    const incompleteTable = 'here is a table\n| a | b |';
                    const tokens = marked_1.marked.lexer(incompleteTable);
                    const completeTableTokens = marked_1.marked.lexer(incompleteTable + '\n| --- | --- |');
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    assert.deepStrictEqual(newTokens, completeTableTokens);
                });
                test('full header with leading other stuff', () => {
                    // Parsing this gives one token and one 'text' subtoken
                    const incompleteTable = '```js\nconst xyz = 123;\n```\n| a | b |';
                    const tokens = marked_1.marked.lexer(incompleteTable);
                    const completeTableTokens = marked_1.marked.lexer(incompleteTable + '\n| --- | --- |');
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    assert.deepStrictEqual(newTokens, completeTableTokens);
                });
                test('full header with incomplete separator', () => {
                    const incompleteTable = '| a | b |\n| ---';
                    const tokens = marked_1.marked.lexer(incompleteTable);
                    const completeTableTokens = marked_1.marked.lexer(completeTable);
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    assert.deepStrictEqual(newTokens, completeTableTokens);
                });
                test('full header with incomplete separator 2', () => {
                    const incompleteTable = '| a | b |\n| --- |';
                    const tokens = marked_1.marked.lexer(incompleteTable);
                    const completeTableTokens = marked_1.marked.lexer(completeTable);
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    assert.deepStrictEqual(newTokens, completeTableTokens);
                });
                test('full header with incomplete separator 3', () => {
                    const incompleteTable = '| a | b |\n|';
                    const tokens = marked_1.marked.lexer(incompleteTable);
                    const completeTableTokens = marked_1.marked.lexer(completeTable);
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    assert.deepStrictEqual(newTokens, completeTableTokens);
                });
                test('not a table', () => {
                    const incompleteTable = '| a | b |\nsome text';
                    const tokens = marked_1.marked.lexer(incompleteTable);
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    assert.deepStrictEqual(newTokens, tokens);
                });
                test('not a table 2', () => {
                    const incompleteTable = '| a | b |\n| --- |\nsome text';
                    const tokens = marked_1.marked.lexer(incompleteTable);
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    assert.deepStrictEqual(newTokens, tokens);
                });
            });
            suite('codeblock', () => {
                test('complete code block', () => {
                    const completeCodeblock = '```js\nconst xyz = 123;\n```';
                    const tokens = marked_1.marked.lexer(completeCodeblock);
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    assert.equal(newTokens, tokens);
                });
                test('code block header only', () => {
                    const incompleteCodeblock = '```js';
                    const tokens = marked_1.marked.lexer(incompleteCodeblock);
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    const completeCodeblockTokens = marked_1.marked.lexer(incompleteCodeblock + '\n```');
                    assert.deepStrictEqual(newTokens, completeCodeblockTokens);
                });
                test('code block header no lang', () => {
                    const incompleteCodeblock = '```';
                    const tokens = marked_1.marked.lexer(incompleteCodeblock);
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    const completeCodeblockTokens = marked_1.marked.lexer(incompleteCodeblock + '\n```');
                    assert.deepStrictEqual(newTokens, completeCodeblockTokens);
                });
                test('code block header and some code', () => {
                    const incompleteCodeblock = '```js\nconst';
                    const tokens = marked_1.marked.lexer(incompleteCodeblock);
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    const completeCodeblockTokens = marked_1.marked.lexer(incompleteCodeblock + '\n```');
                    assert.deepStrictEqual(newTokens, completeCodeblockTokens);
                });
                test('code block header with leading text', () => {
                    const incompleteCodeblock = 'some text\n```js';
                    const tokens = marked_1.marked.lexer(incompleteCodeblock);
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    const completeCodeblockTokens = marked_1.marked.lexer(incompleteCodeblock + '\n```');
                    assert.deepStrictEqual(newTokens, completeCodeblockTokens);
                });
                test('code block header with leading text and some code', () => {
                    const incompleteCodeblock = 'some text\n```js\nconst';
                    const tokens = marked_1.marked.lexer(incompleteCodeblock);
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    const completeCodeblockTokens = marked_1.marked.lexer(incompleteCodeblock + '\n```');
                    assert.deepStrictEqual(newTokens, completeCodeblockTokens);
                });
            });
            function simpleMarkdownTestSuite(name, delimiter) {
                test(`incomplete ${name}`, () => {
                    const incomplete = `${delimiter}code`;
                    const tokens = marked_1.marked.lexer(incomplete);
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    const completeTokens = marked_1.marked.lexer(incomplete + delimiter);
                    assert.deepStrictEqual(newTokens, completeTokens);
                });
                test(`complete ${name}`, () => {
                    const text = `leading text ${delimiter}code${delimiter} trailing text`;
                    const tokens = marked_1.marked.lexer(text);
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    assert.deepStrictEqual(newTokens, tokens);
                });
                test(`${name} with leading text`, () => {
                    const incomplete = `some text and ${delimiter}some code`;
                    const tokens = marked_1.marked.lexer(incomplete);
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    const completeTokens = marked_1.marked.lexer(incomplete + delimiter);
                    assert.deepStrictEqual(newTokens, completeTokens);
                });
                test(`single loose "${delimiter}"`, () => {
                    const text = `some text and ${delimiter}by itself\nmore text here`;
                    const tokens = marked_1.marked.lexer(text);
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    assert.deepStrictEqual(newTokens, tokens);
                });
                test(`incomplete ${name} after newline`, () => {
                    const text = `some text\nmore text here and ${delimiter}text`;
                    const tokens = marked_1.marked.lexer(text);
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    const completeTokens = marked_1.marked.lexer(text + delimiter);
                    assert.deepStrictEqual(newTokens, completeTokens);
                });
                test(`incomplete after complete ${name}`, () => {
                    const text = `leading text ${delimiter}code${delimiter} trailing text and ${delimiter}another`;
                    const tokens = marked_1.marked.lexer(text);
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    const completeTokens = marked_1.marked.lexer(text + delimiter);
                    assert.deepStrictEqual(newTokens, completeTokens);
                });
                test.skip(`incomplete ${name} in list`, () => {
                    const text = `- list item one\n- list item two and ${delimiter}text`;
                    const tokens = marked_1.marked.lexer(text);
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    const completeTokens = marked_1.marked.lexer(text + delimiter);
                    assert.deepStrictEqual(newTokens, completeTokens);
                });
            }
            suite('codespan', () => {
                simpleMarkdownTestSuite('codespan', '`');
                test(`backtick between letters`, () => {
                    const text = 'a`b';
                    const tokens = marked_1.marked.lexer(text);
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    const completeCodespanTokens = marked_1.marked.lexer(text + '`');
                    assert.deepStrictEqual(newTokens, completeCodespanTokens);
                });
                test(`nested pattern`, () => {
                    const text = 'sldkfjsd `abc __def__ ghi';
                    const tokens = marked_1.marked.lexer(text);
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    const completeTokens = marked_1.marked.lexer(text + '`');
                    assert.deepStrictEqual(newTokens, completeTokens);
                });
            });
            suite('star', () => {
                simpleMarkdownTestSuite('star', '*');
                test(`star between letters`, () => {
                    const text = 'sldkfjsd a*b';
                    const tokens = marked_1.marked.lexer(text);
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    const completeTokens = marked_1.marked.lexer(text + '*');
                    assert.deepStrictEqual(newTokens, completeTokens);
                });
                test(`nested pattern`, () => {
                    const text = 'sldkfjsd *abc __def__ ghi';
                    const tokens = marked_1.marked.lexer(text);
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    const completeTokens = marked_1.marked.lexer(text + '*');
                    assert.deepStrictEqual(newTokens, completeTokens);
                });
            });
            suite('double star', () => {
                simpleMarkdownTestSuite('double star', '**');
                test(`double star between letters`, () => {
                    const text = 'a**b';
                    const tokens = marked_1.marked.lexer(text);
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    const completeTokens = marked_1.marked.lexer(text + '**');
                    assert.deepStrictEqual(newTokens, completeTokens);
                });
            });
            suite('underscore', () => {
                simpleMarkdownTestSuite('underscore', '_');
                test(`underscore between letters`, () => {
                    const text = `this_not_italics`;
                    const tokens = marked_1.marked.lexer(text);
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    assert.deepStrictEqual(newTokens, tokens);
                });
            });
            suite('double underscore', () => {
                simpleMarkdownTestSuite('double underscore', '__');
                test(`double underscore between letters`, () => {
                    const text = `this__not__bold`;
                    const tokens = marked_1.marked.lexer(text);
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    assert.deepStrictEqual(newTokens, tokens);
                });
            });
            suite('link', () => {
                test('incomplete link text', () => {
                    const incomplete = 'abc [text';
                    const tokens = marked_1.marked.lexer(incomplete);
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    const completeTokens = marked_1.marked.lexer(incomplete + '](about:blank)');
                    assert.deepStrictEqual(newTokens, completeTokens);
                });
                test('incomplete link target', () => {
                    const incomplete = 'foo [text](http://microsoft';
                    const tokens = marked_1.marked.lexer(incomplete);
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    const completeTokens = marked_1.marked.lexer(incomplete + ')');
                    assert.deepStrictEqual(newTokens, completeTokens);
                });
                test.skip('incomplete link in list', () => {
                    const incomplete = '- [text';
                    const tokens = marked_1.marked.lexer(incomplete);
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    const completeTokens = marked_1.marked.lexer(incomplete + '](about:blank)');
                    assert.deepStrictEqual(newTokens, completeTokens);
                });
                test('square brace between letters', () => {
                    const incomplete = 'a[b';
                    const tokens = marked_1.marked.lexer(incomplete);
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    assert.deepStrictEqual(newTokens, tokens);
                });
                test('square brace on previous line', () => {
                    const incomplete = 'text[\nmore text';
                    const tokens = marked_1.marked.lexer(incomplete);
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    assert.deepStrictEqual(newTokens, tokens);
                });
                test('complete link', () => {
                    const incomplete = 'text [link](http://microsoft.com)';
                    const tokens = marked_1.marked.lexer(incomplete);
                    const newTokens = (0, markdownRenderer_1.$DQ)(tokens);
                    assert.deepStrictEqual(newTokens, tokens);
                });
            });
        });
    });
});
//# sourceMappingURL=markdownRenderer.test.js.map