define(["require", "exports", "assert", "sinon", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uri", "vs/base/test/common/mock", "vs/editor/common/core/selection", "vs/editor/contrib/snippet/browser/snippetParser", "vs/editor/contrib/snippet/browser/snippetVariables", "vs/editor/test/common/testTextModel", "vs/platform/workspace/common/workspace", "vs/platform/workspace/test/common/testWorkspace", "vs/platform/workspaces/common/workspaces"], function (require, exports, assert, sinon, lifecycle_1, path_1, platform_1, resources_1, uri_1, mock_1, selection_1, snippetParser_1, snippetVariables_1, testTextModel_1, workspace_1, testWorkspace_1, workspaces_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Snippet Variables Resolver', function () {
        const labelService = new class extends (0, mock_1.mock)() {
            getUriLabel(uri) {
                return uri.fsPath;
            }
        };
        let model;
        let resolver;
        setup(function () {
            model = (0, testTextModel_1.createTextModel)([
                'this is line one',
                'this is line two',
                '    this is line three'
            ].join('\n'), undefined, undefined, uri_1.URI.parse('file:///foo/files/text.txt'));
            resolver = new snippetVariables_1.CompositeSnippetVariableResolver([
                new snippetVariables_1.ModelBasedVariableResolver(labelService, model),
                new snippetVariables_1.SelectionBasedVariableResolver(model, new selection_1.Selection(1, 1, 1, 1), 0, undefined),
            ]);
        });
        teardown(function () {
            model.dispose();
        });
        function assertVariableResolve(resolver, varName, expected) {
            const snippet = new snippetParser_1.SnippetParser().parse(`$${varName}`);
            const variable = snippet.children[0];
            variable.resolve(resolver);
            if (variable.children.length === 0) {
                assert.strictEqual(undefined, expected);
            }
            else {
                assert.strictEqual(variable.toString(), expected);
            }
        }
        test('editor variables, basics', function () {
            assertVariableResolve(resolver, 'TM_FILENAME', 'text.txt');
            assertVariableResolve(resolver, 'something', undefined);
        });
        test('editor variables, file/dir', function () {
            const disposables = new lifecycle_1.DisposableStore();
            assertVariableResolve(resolver, 'TM_FILENAME', 'text.txt');
            if (!platform_1.isWindows) {
                assertVariableResolve(resolver, 'TM_DIRECTORY', '/foo/files');
                assertVariableResolve(resolver, 'TM_FILEPATH', '/foo/files/text.txt');
            }
            resolver = new snippetVariables_1.ModelBasedVariableResolver(labelService, disposables.add((0, testTextModel_1.createTextModel)('', undefined, undefined, uri_1.URI.parse('http://www.pb.o/abc/def/ghi'))));
            assertVariableResolve(resolver, 'TM_FILENAME', 'ghi');
            if (!platform_1.isWindows) {
                assertVariableResolve(resolver, 'TM_DIRECTORY', '/abc/def');
                assertVariableResolve(resolver, 'TM_FILEPATH', '/abc/def/ghi');
            }
            resolver = new snippetVariables_1.ModelBasedVariableResolver(labelService, disposables.add((0, testTextModel_1.createTextModel)('', undefined, undefined, uri_1.URI.parse('mem:fff.ts'))));
            assertVariableResolve(resolver, 'TM_DIRECTORY', '');
            assertVariableResolve(resolver, 'TM_FILEPATH', 'fff.ts');
            disposables.dispose();
        });
        test('Path delimiters in code snippet variables aren\'t specific to remote OS #76840', function () {
            const labelService = new class extends (0, mock_1.mock)() {
                getUriLabel(uri) {
                    return uri.fsPath.replace(/\/|\\/g, '|');
                }
            };
            const model = (0, testTextModel_1.createTextModel)([].join('\n'), undefined, undefined, uri_1.URI.parse('foo:///foo/files/text.txt'));
            const resolver = new snippetVariables_1.CompositeSnippetVariableResolver([new snippetVariables_1.ModelBasedVariableResolver(labelService, model)]);
            assertVariableResolve(resolver, 'TM_FILEPATH', '|foo|files|text.txt');
            model.dispose();
        });
        test('editor variables, selection', function () {
            resolver = new snippetVariables_1.SelectionBasedVariableResolver(model, new selection_1.Selection(1, 2, 2, 3), 0, undefined);
            assertVariableResolve(resolver, 'TM_SELECTED_TEXT', 'his is line one\nth');
            assertVariableResolve(resolver, 'TM_CURRENT_LINE', 'this is line two');
            assertVariableResolve(resolver, 'TM_LINE_INDEX', '1');
            assertVariableResolve(resolver, 'TM_LINE_NUMBER', '2');
            assertVariableResolve(resolver, 'CURSOR_INDEX', '0');
            assertVariableResolve(resolver, 'CURSOR_NUMBER', '1');
            resolver = new snippetVariables_1.SelectionBasedVariableResolver(model, new selection_1.Selection(1, 2, 2, 3), 4, undefined);
            assertVariableResolve(resolver, 'CURSOR_INDEX', '4');
            assertVariableResolve(resolver, 'CURSOR_NUMBER', '5');
            resolver = new snippetVariables_1.SelectionBasedVariableResolver(model, new selection_1.Selection(2, 3, 1, 2), 0, undefined);
            assertVariableResolve(resolver, 'TM_SELECTED_TEXT', 'his is line one\nth');
            assertVariableResolve(resolver, 'TM_CURRENT_LINE', 'this is line one');
            assertVariableResolve(resolver, 'TM_LINE_INDEX', '0');
            assertVariableResolve(resolver, 'TM_LINE_NUMBER', '1');
            resolver = new snippetVariables_1.SelectionBasedVariableResolver(model, new selection_1.Selection(1, 2, 1, 2), 0, undefined);
            assertVariableResolve(resolver, 'TM_SELECTED_TEXT', undefined);
            assertVariableResolve(resolver, 'TM_CURRENT_WORD', 'this');
            resolver = new snippetVariables_1.SelectionBasedVariableResolver(model, new selection_1.Selection(3, 1, 3, 1), 0, undefined);
            assertVariableResolve(resolver, 'TM_CURRENT_WORD', undefined);
        });
        test('TextmateSnippet, resolve variable', function () {
            const snippet = new snippetParser_1.SnippetParser().parse('"$TM_CURRENT_WORD"', true);
            assert.strictEqual(snippet.toString(), '""');
            snippet.resolveVariables(resolver);
            assert.strictEqual(snippet.toString(), '"this"');
        });
        test('TextmateSnippet, resolve variable with default', function () {
            const snippet = new snippetParser_1.SnippetParser().parse('"${TM_CURRENT_WORD:foo}"', true);
            assert.strictEqual(snippet.toString(), '"foo"');
            snippet.resolveVariables(resolver);
            assert.strictEqual(snippet.toString(), '"this"');
        });
        test('More useful environment variables for snippets, #32737', function () {
            const disposables = new lifecycle_1.DisposableStore();
            assertVariableResolve(resolver, 'TM_FILENAME_BASE', 'text');
            resolver = new snippetVariables_1.ModelBasedVariableResolver(labelService, disposables.add((0, testTextModel_1.createTextModel)('', undefined, undefined, uri_1.URI.parse('http://www.pb.o/abc/def/ghi'))));
            assertVariableResolve(resolver, 'TM_FILENAME_BASE', 'ghi');
            resolver = new snippetVariables_1.ModelBasedVariableResolver(labelService, disposables.add((0, testTextModel_1.createTextModel)('', undefined, undefined, uri_1.URI.parse('mem:.git'))));
            assertVariableResolve(resolver, 'TM_FILENAME_BASE', '.git');
            resolver = new snippetVariables_1.ModelBasedVariableResolver(labelService, disposables.add((0, testTextModel_1.createTextModel)('', undefined, undefined, uri_1.URI.parse('mem:foo.'))));
            assertVariableResolve(resolver, 'TM_FILENAME_BASE', 'foo');
            disposables.dispose();
        });
        function assertVariableResolve2(input, expected, varValue) {
            const snippet = new snippetParser_1.SnippetParser().parse(input)
                .resolveVariables({ resolve(variable) { return varValue || variable.name; } });
            const actual = snippet.toString();
            assert.strictEqual(actual, expected);
        }
        test('Variable Snippet Transform', function () {
            const snippet = new snippetParser_1.SnippetParser().parse('name=${TM_FILENAME/(.*)\\..+$/$1/}', true);
            snippet.resolveVariables(resolver);
            assert.strictEqual(snippet.toString(), 'name=text');
            assertVariableResolve2('${ThisIsAVar/([A-Z]).*(Var)/$2/}', 'Var');
            assertVariableResolve2('${ThisIsAVar/([A-Z]).*(Var)/$2-${1:/downcase}/}', 'Var-t');
            assertVariableResolve2('${Foo/(.*)/${1:+Bar}/img}', 'Bar');
            //https://github.com/microsoft/vscode/issues/33162
            assertVariableResolve2('export default class ${TM_FILENAME/(\\w+)\\.js/$1/g}', 'export default class FooFile', 'FooFile.js');
            assertVariableResolve2('${foobarfoobar/(foo)/${1:+FAR}/g}', 'FARbarFARbar'); // global
            assertVariableResolve2('${foobarfoobar/(foo)/${1:+FAR}/}', 'FARbarfoobar'); // first match
            assertVariableResolve2('${foobarfoobar/(bazz)/${1:+FAR}/g}', 'foobarfoobar'); // no match, no else
            // assertVariableResolve2('${foobarfoobar/(bazz)/${1:+FAR}/g}', ''); // no match
            assertVariableResolve2('${foobarfoobar/(foo)/${2:+FAR}/g}', 'barbar'); // bad group reference
        });
        test('Snippet transforms do not handle regex with alternatives or optional matches, #36089', function () {
            assertVariableResolve2('${TM_FILENAME/^(.)|(?:-(.))|(\\.js)/${1:/upcase}${2:/upcase}/g}', 'MyClass', 'my-class.js');
            // no hyphens
            assertVariableResolve2('${TM_FILENAME/^(.)|(?:-(.))|(\\.js)/${1:/upcase}${2:/upcase}/g}', 'Myclass', 'myclass.js');
            // none matching suffix
            assertVariableResolve2('${TM_FILENAME/^(.)|(?:-(.))|(\\.js)/${1:/upcase}${2:/upcase}/g}', 'Myclass.foo', 'myclass.foo');
            // more than one hyphen
            assertVariableResolve2('${TM_FILENAME/^(.)|(?:-(.))|(\\.js)/${1:/upcase}${2:/upcase}/g}', 'ThisIsAFile', 'this-is-a-file.js');
            // KEBAB CASE
            assertVariableResolve2('${TM_FILENAME_BASE/([A-Z][a-z]+)([A-Z][a-z]+$)?/${1:/downcase}-${2:/downcase}/g}', 'capital-case', 'CapitalCase');
            assertVariableResolve2('${TM_FILENAME_BASE/([A-Z][a-z]+)([A-Z][a-z]+$)?/${1:/downcase}-${2:/downcase}/g}', 'capital-case-more', 'CapitalCaseMore');
        });
        test('Add variable to insert value from clipboard to a snippet #40153', function () {
            assertVariableResolve(new snippetVariables_1.ClipboardBasedVariableResolver(() => undefined, 1, 0, true), 'CLIPBOARD', undefined);
            assertVariableResolve(new snippetVariables_1.ClipboardBasedVariableResolver(() => null, 1, 0, true), 'CLIPBOARD', undefined);
            assertVariableResolve(new snippetVariables_1.ClipboardBasedVariableResolver(() => '', 1, 0, true), 'CLIPBOARD', undefined);
            assertVariableResolve(new snippetVariables_1.ClipboardBasedVariableResolver(() => 'foo', 1, 0, true), 'CLIPBOARD', 'foo');
            assertVariableResolve(new snippetVariables_1.ClipboardBasedVariableResolver(() => 'foo', 1, 0, true), 'foo', undefined);
            assertVariableResolve(new snippetVariables_1.ClipboardBasedVariableResolver(() => 'foo', 1, 0, true), 'cLIPBOARD', undefined);
        });
        test('Add variable to insert value from clipboard to a snippet #40153', function () {
            assertVariableResolve(new snippetVariables_1.ClipboardBasedVariableResolver(() => 'line1', 1, 2, true), 'CLIPBOARD', 'line1');
            assertVariableResolve(new snippetVariables_1.ClipboardBasedVariableResolver(() => 'line1\nline2\nline3', 1, 2, true), 'CLIPBOARD', 'line1\nline2\nline3');
            assertVariableResolve(new snippetVariables_1.ClipboardBasedVariableResolver(() => 'line1\nline2', 1, 2, true), 'CLIPBOARD', 'line2');
            resolver = new snippetVariables_1.ClipboardBasedVariableResolver(() => 'line1\nline2', 0, 2, true);
            assertVariableResolve(new snippetVariables_1.ClipboardBasedVariableResolver(() => 'line1\nline2', 0, 2, true), 'CLIPBOARD', 'line1');
            assertVariableResolve(new snippetVariables_1.ClipboardBasedVariableResolver(() => 'line1\nline2', 0, 2, false), 'CLIPBOARD', 'line1\nline2');
        });
        function assertVariableResolve3(resolver, varName) {
            const snippet = new snippetParser_1.SnippetParser().parse(`$${varName}`);
            const variable = snippet.children[0];
            assert.strictEqual(variable.resolve(resolver), true, `${varName} failed to resolve`);
        }
        test('Add time variables for snippets #41631, #43140', function () {
            const resolver = new snippetVariables_1.TimeBasedVariableResolver;
            assertVariableResolve3(resolver, 'CURRENT_YEAR');
            assertVariableResolve3(resolver, 'CURRENT_YEAR_SHORT');
            assertVariableResolve3(resolver, 'CURRENT_MONTH');
            assertVariableResolve3(resolver, 'CURRENT_DATE');
            assertVariableResolve3(resolver, 'CURRENT_HOUR');
            assertVariableResolve3(resolver, 'CURRENT_MINUTE');
            assertVariableResolve3(resolver, 'CURRENT_SECOND');
            assertVariableResolve3(resolver, 'CURRENT_DAY_NAME');
            assertVariableResolve3(resolver, 'CURRENT_DAY_NAME_SHORT');
            assertVariableResolve3(resolver, 'CURRENT_MONTH_NAME');
            assertVariableResolve3(resolver, 'CURRENT_MONTH_NAME_SHORT');
            assertVariableResolve3(resolver, 'CURRENT_SECONDS_UNIX');
            assertVariableResolve3(resolver, 'CURRENT_TIMEZONE_OFFSET');
        });
        test('Time-based snippet variables resolve to the same values even as time progresses', async function () {
            const snippetText = `
			$CURRENT_YEAR
			$CURRENT_YEAR_SHORT
			$CURRENT_MONTH
			$CURRENT_DATE
			$CURRENT_HOUR
			$CURRENT_MINUTE
			$CURRENT_SECOND
			$CURRENT_DAY_NAME
			$CURRENT_DAY_NAME_SHORT
			$CURRENT_MONTH_NAME
			$CURRENT_MONTH_NAME_SHORT
			$CURRENT_SECONDS_UNIX
			$CURRENT_TIMEZONE_OFFSET
		`;
            const clock = sinon.useFakeTimers();
            try {
                const resolver = new snippetVariables_1.TimeBasedVariableResolver;
                const firstResolve = new snippetParser_1.SnippetParser().parse(snippetText).resolveVariables(resolver);
                clock.tick((365 * 24 * 3600 * 1000) + (24 * 3600 * 1000) + (3661 * 1000)); // 1 year + 1 day + 1 hour + 1 minute + 1 second
                const secondResolve = new snippetParser_1.SnippetParser().parse(snippetText).resolveVariables(resolver);
                assert.strictEqual(firstResolve.toString(), secondResolve.toString(), `Time-based snippet variables resolved differently`);
            }
            finally {
                clock.restore();
            }
        });
        test('creating snippet - format-condition doesn\'t work #53617', function () {
            const snippet = new snippetParser_1.SnippetParser().parse('${TM_LINE_NUMBER/(10)/${1:?It is:It is not}/} line 10', true);
            snippet.resolveVariables({ resolve() { return '10'; } });
            assert.strictEqual(snippet.toString(), 'It is line 10');
            snippet.resolveVariables({ resolve() { return '11'; } });
            assert.strictEqual(snippet.toString(), 'It is not line 10');
        });
        test('Add workspace name and folder variables for snippets #68261', function () {
            let workspace;
            const workspaceService = new class {
                constructor() {
                    this._throw = () => { throw new Error(); };
                    this.onDidChangeWorkbenchState = this._throw;
                    this.onDidChangeWorkspaceName = this._throw;
                    this.onWillChangeWorkspaceFolders = this._throw;
                    this.onDidChangeWorkspaceFolders = this._throw;
                    this.getCompleteWorkspace = this._throw;
                    this.getWorkbenchState = this._throw;
                    this.getWorkspaceFolder = this._throw;
                    this.isCurrentWorkspace = this._throw;
                    this.isInsideWorkspace = this._throw;
                }
                getWorkspace() { return workspace; }
            };
            const resolver = new snippetVariables_1.WorkspaceBasedVariableResolver(workspaceService);
            // empty workspace
            workspace = new testWorkspace_1.Workspace('');
            assertVariableResolve(resolver, 'WORKSPACE_NAME', undefined);
            assertVariableResolve(resolver, 'WORKSPACE_FOLDER', undefined);
            // single folder workspace without config
            workspace = new testWorkspace_1.Workspace('', [(0, workspace_1.toWorkspaceFolder)(uri_1.URI.file('/folderName'))]);
            assertVariableResolve(resolver, 'WORKSPACE_NAME', 'folderName');
            if (!platform_1.isWindows) {
                assertVariableResolve(resolver, 'WORKSPACE_FOLDER', '/folderName');
            }
            // workspace with config
            const workspaceConfigPath = uri_1.URI.file('testWorkspace.code-workspace');
            workspace = new testWorkspace_1.Workspace('', (0, workspaces_1.toWorkspaceFolders)([{ path: 'folderName' }], workspaceConfigPath, resources_1.extUriBiasedIgnorePathCase), workspaceConfigPath);
            assertVariableResolve(resolver, 'WORKSPACE_NAME', 'testWorkspace');
            if (!platform_1.isWindows) {
                assertVariableResolve(resolver, 'WORKSPACE_FOLDER', '/');
            }
        });
        test('Add RELATIVE_FILEPATH snippet variable #114208', function () {
            let resolver;
            // Mock a label service (only coded for file uris)
            const workspaceLabelService = ((rootPath) => {
                const labelService = new class extends (0, mock_1.mock)() {
                    getUriLabel(uri, options = {}) {
                        const rootFsPath = uri_1.URI.file(rootPath).fsPath + path_1.sep;
                        const fsPath = uri.fsPath;
                        if (options.relative && rootPath && fsPath.startsWith(rootFsPath)) {
                            return fsPath.substring(rootFsPath.length);
                        }
                        return fsPath;
                    }
                };
                return labelService;
            });
            const model = (0, testTextModel_1.createTextModel)('', undefined, undefined, uri_1.URI.parse('file:///foo/files/text.txt'));
            // empty workspace
            resolver = new snippetVariables_1.ModelBasedVariableResolver(workspaceLabelService(''), model);
            if (!platform_1.isWindows) {
                assertVariableResolve(resolver, 'RELATIVE_FILEPATH', '/foo/files/text.txt');
            }
            else {
                assertVariableResolve(resolver, 'RELATIVE_FILEPATH', '\\foo\\files\\text.txt');
            }
            // single folder workspace
            resolver = new snippetVariables_1.ModelBasedVariableResolver(workspaceLabelService('/foo'), model);
            if (!platform_1.isWindows) {
                assertVariableResolve(resolver, 'RELATIVE_FILEPATH', 'files/text.txt');
            }
            else {
                assertVariableResolve(resolver, 'RELATIVE_FILEPATH', 'files\\text.txt');
            }
            model.dispose();
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25pcHBldFZhcmlhYmxlcy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvc25pcHBldC90ZXN0L2Jyb3dzZXIvc25pcHBldFZhcmlhYmxlcy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQXNCQSxLQUFLLENBQUMsNEJBQTRCLEVBQUU7UUFFbkMsTUFBTSxZQUFZLEdBQUcsSUFBSSxLQUFNLFNBQVEsSUFBQSxXQUFJLEdBQWlCO1lBQ2xELFdBQVcsQ0FBQyxHQUFRO2dCQUM1QixPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUM7WUFDbkIsQ0FBQztTQUNELENBQUM7UUFFRixJQUFJLEtBQWdCLENBQUM7UUFDckIsSUFBSSxRQUEwQixDQUFDO1FBRS9CLEtBQUssQ0FBQztZQUNMLEtBQUssR0FBRyxJQUFBLCtCQUFlLEVBQUM7Z0JBQ3ZCLGtCQUFrQjtnQkFDbEIsa0JBQWtCO2dCQUNsQix3QkFBd0I7YUFDeEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFHLENBQUMsS0FBSyxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQztZQUU3RSxRQUFRLEdBQUcsSUFBSSxtREFBZ0MsQ0FBQztnQkFDL0MsSUFBSSw2Q0FBMEIsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDO2dCQUNuRCxJQUFJLGlEQUE4QixDQUFDLEtBQUssRUFBRSxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQzthQUNsRixDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQztZQUNSLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNqQixDQUFDLENBQUMsQ0FBQztRQUVILFNBQVMscUJBQXFCLENBQUMsUUFB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