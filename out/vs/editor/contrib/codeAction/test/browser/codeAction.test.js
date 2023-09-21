define(["require", "exports", "assert", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/base/test/common/utils", "vs/editor/common/core/range", "vs/editor/common/languageFeatureRegistry", "vs/editor/contrib/codeAction/browser/codeAction", "vs/editor/contrib/codeAction/common/types", "vs/editor/test/common/testTextModel", "vs/platform/markers/common/markers", "vs/platform/progress/common/progress"], function (require, exports, assert, cancellation_1, lifecycle_1, uri_1, utils_1, range_1, languageFeatureRegistry_1, codeAction_1, types_1, testTextModel_1, markers_1, progress_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function staticCodeActionProvider(...actions) {
        return new class {
            provideCodeActions() {
                return {
                    actions: actions,
                    dispose: () => { }
                };
            }
        };
    }
    suite('CodeAction', () => {
        const langId = 'fooLang';
        const uri = uri_1.URI.parse('untitled:path');
        let model;
        let registry;
        const disposables = new lifecycle_1.DisposableStore();
        const testData = {
            diagnostics: {
                abc: {
                    title: 'bTitle',
                    diagnostics: [{
                            startLineNumber: 1,
                            startColumn: 1,
                            endLineNumber: 2,
                            endColumn: 1,
                            severity: markers_1.MarkerSeverity.Error,
                            message: 'abc'
                        }]
                },
                bcd: {
                    title: 'aTitle',
                    diagnostics: [{
                            startLineNumber: 1,
                            startColumn: 1,
                            endLineNumber: 2,
                            endColumn: 1,
                            severity: markers_1.MarkerSeverity.Error,
                            message: 'bcd'
                        }]
                }
            },
            command: {
                abc: {
                    command: new class {
                    },
                    title: 'Extract to inner function in function "test"'
                }
            },
            spelling: {
                bcd: {
                    diagnostics: [],
                    edit: new class {
                    },
                    title: 'abc'
                }
            },
            tsLint: {
                abc: {
                    $ident: 'funny' + 57,
                    arguments: [],
                    id: '_internal_command_delegation',
                    title: 'abc'
                },
                bcd: {
                    $ident: 'funny' + 47,
                    arguments: [],
                    id: '_internal_command_delegation',
                    title: 'bcd'
                }
            }
        };
        setup(() => {
            registry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
            disposables.clear();
            model = (0, testTextModel_1.createTextModel)('test1\ntest2\ntest3', langId, undefined, uri);
            disposables.add(model);
        });
        teardown(() => {
            disposables.clear();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('CodeActions are sorted by type, #38623', async () => {
            const provider = staticCodeActionProvider(testData.command.abc, testData.diagnostics.bcd, testData.spelling.bcd, testData.tsLint.bcd, testData.tsLint.abc, testData.diagnostics.abc);
            disposables.add(registry.register('fooLang', provider));
            const expected = [
                // CodeActions with a diagnostics array are shown first without further sorting
                new types_1.CodeActionItem(testData.diagnostics.bcd, provider),
                new types_1.CodeActionItem(testData.diagnostics.abc, provider),
                // CodeActions without diagnostics are shown in the given order without any further sorting
                new types_1.CodeActionItem(testData.command.abc, provider),
                new types_1.CodeActionItem(testData.spelling.bcd, provider),
                new types_1.CodeActionItem(testData.tsLint.bcd, provider),
                new types_1.CodeActionItem(testData.tsLint.abc, provider)
            ];
            const { validActions: actions } = disposables.add(await (0, codeAction_1.getCodeActions)(registry, model, new range_1.Range(1, 1, 2, 1), { type: 1 /* languages.CodeActionTriggerType.Invoke */, triggerAction: types_1.CodeActionTriggerSource.Default }, progress_1.Progress.None, cancellation_1.CancellationToken.None));
            assert.strictEqual(actions.length, 6);
            assert.deepStrictEqual(actions, expected);
        });
        test('getCodeActions should filter by scope', async () => {
            const provider = staticCodeActionProvider({ title: 'a', kind: 'a' }, { title: 'b', kind: 'b' }, { title: 'a.b', kind: 'a.b' });
            disposables.add(registry.register('fooLang', provider));
            {
                const { validActions: actions } = disposables.add(await (0, codeAction_1.getCodeActions)(registry, model, new range_1.Range(1, 1, 2, 1), { type: 2 /* languages.CodeActionTriggerType.Auto */, triggerAction: types_1.CodeActionTriggerSource.Default, filter: { include: new types_1.CodeActionKind('a') } }, progress_1.Progress.None, cancellation_1.CancellationToken.None));
                assert.strictEqual(actions.length, 2);
                assert.strictEqual(actions[0].action.title, 'a');
                assert.strictEqual(actions[1].action.title, 'a.b');
            }
            {
                const { validActions: actions } = disposables.add(await (0, codeAction_1.getCodeActions)(registry, model, new range_1.Range(1, 1, 2, 1), { type: 2 /* languages.CodeActionTriggerType.Auto */, triggerAction: types_1.CodeActionTriggerSource.Default, filter: { include: new types_1.CodeActionKind('a.b') } }, progress_1.Progress.None, cancellation_1.CancellationToken.None));
                assert.strictEqual(actions.length, 1);
                assert.strictEqual(actions[0].action.title, 'a.b');
            }
            {
                const { validActions: actions } = disposables.add(await (0, codeAction_1.getCodeActions)(registry, model, new range_1.Range(1, 1, 2, 1), { type: 2 /* languages.CodeActionTriggerType.Auto */, triggerAction: types_1.CodeActionTriggerSource.Default, filter: { include: new types_1.CodeActionKind('a.b.c') } }, progress_1.Progress.None, cancellation_1.CancellationToken.None));
                assert.strictEqual(actions.length, 0);
            }
        });
        test('getCodeActions should forward requested scope to providers', async () => {
            const provider = new class {
                provideCodeActions(_model, _range, context, _token) {
                    return {
                        actions: [
                            { title: context.only || '', kind: context.only }
                        ],
                        dispose: () => { }
                    };
                }
            };
            disposables.add(registry.register('fooLang', provider));
            const { validActions: actions } = disposables.add(await (0, codeAction_1.getCodeActions)(registry, model, new range_1.Range(1, 1, 2, 1), { type: 2 /* languages.CodeActionTriggerType.Auto */, triggerAction: types_1.CodeActionTriggerSource.Default, filter: { include: new types_1.CodeActionKind('a') } }, progress_1.Progress.None, cancellation_1.CancellationToken.None));
            assert.strictEqual(actions.length, 1);
            assert.strictEqual(actions[0].action.title, 'a');
        });
        test('getCodeActions should not return source code action by default', async () => {
            const provider = staticCodeActionProvider({ title: 'a', kind: types_1.CodeActionKind.Source.value }, { title: 'b', kind: 'b' });
            disposables.add(registry.register('fooLang', provider));
            {
                const { validActions: actions } = disposables.add(await (0, codeAction_1.getCodeActions)(registry, model, new range_1.Range(1, 1, 2, 1), { type: 2 /* languages.CodeActionTriggerType.Auto */, triggerAction: types_1.CodeActionTriggerSource.SourceAction }, progress_1.Progress.None, cancellation_1.CancellationToken.None));
                assert.strictEqual(actions.length, 1);
                assert.strictEqual(actions[0].action.title, 'b');
            }
            {
                const { validActions: actions } = disposables.add(await (0, codeAction_1.getCodeActions)(registry, model, new range_1.Range(1, 1, 2, 1), { type: 2 /* languages.CodeActionTriggerType.Auto */, triggerAction: types_1.CodeActionTriggerSource.Default, filter: { include: types_1.CodeActionKind.Source, includeSourceActions: true } }, progress_1.Progress.None, cancellation_1.CancellationToken.None));
                assert.strictEqual(actions.length, 1);
                assert.strictEqual(actions[0].action.title, 'a');
            }
        });
        test('getCodeActions should support filtering out some requested source code actions #84602', async () => {
            const provider = staticCodeActionProvider({ title: 'a', kind: types_1.CodeActionKind.Source.value }, { title: 'b', kind: types_1.CodeActionKind.Source.append('test').value }, { title: 'c', kind: 'c' });
            disposables.add(registry.register('fooLang', provider));
            {
                const { validActions: actions } = disposables.add(await (0, codeAction_1.getCodeActions)(registry, model, new range_1.Range(1, 1, 2, 1), {
                    type: 2 /* languages.CodeActionTriggerType.Auto */, triggerAction: types_1.CodeActionTriggerSource.SourceAction, filter: {
                        include: types_1.CodeActionKind.Source.append('test'),
                        excludes: [types_1.CodeActionKind.Source],
                        includeSourceActions: true,
                    }
                }, progress_1.Progress.None, cancellation_1.CancellationToken.None));
                assert.strictEqual(actions.length, 1);
                assert.strictEqual(actions[0].action.title, 'b');
            }
        });
        test('getCodeActions no invoke a provider that has been excluded #84602', async () => {
            const baseType = types_1.CodeActionKind.Refactor;
            const subType = types_1.CodeActionKind.Refactor.append('sub');
            disposables.add(registry.register('fooLang', staticCodeActionProvider({ title: 'a', kind: baseType.value })));
            let didInvoke = false;
            disposables.add(registry.register('fooLang', new class {
                constructor() {
                    this.providedCodeActionKinds = [subType.value];
                }
                provideCodeActions() {
                    didInvoke = true;
                    return {
                        actions: [
                            { title: 'x', kind: subType.value }
                        ],
                        dispose: () => { }
                    };
                }
            }));
            {
                const { validActions: actions } = disposables.add(await (0, codeAction_1.getCodeActions)(registry, model, new range_1.Range(1, 1, 2, 1), {
                    type: 2 /* languages.CodeActionTriggerType.Auto */, triggerAction: types_1.CodeActionTriggerSource.Refactor, filter: {
                        include: baseType,
                        excludes: [subType],
                    }
                }, progress_1.Progress.None, cancellation_1.CancellationToken.None));
                assert.strictEqual(didInvoke, false);
                assert.strictEqual(actions.length, 1);
                assert.strictEqual(actions[0].action.title, 'a');
            }
        });
        test('getCodeActions should not invoke code action providers filtered out by providedCodeActionKinds', async () => {
            let wasInvoked = false;
            const provider = new class {
                constructor() {
                    this.providedCodeActionKinds = [types_1.CodeActionKind.Refactor.value];
                }
                provideCodeActions() {
                    wasInvoked = true;
                    return { actions: [], dispose: () => { } };
                }
            };
            disposables.add(registry.register('fooLang', provider));
            const { validActions: actions } = disposables.add(await (0, codeAction_1.getCodeActions)(registry, model, new range_1.Range(1, 1, 2, 1), {
                type: 2 /* languages.CodeActionTriggerType.Auto */, triggerAction: types_1.CodeActionTriggerSource.Refactor,
                filter: {
                    include: types_1.CodeActionKind.QuickFix
                }
            }, progress_1.Progress.None, cancellation_1.CancellationToken.None));
            assert.strictEqual(actions.length, 0);
            assert.strictEqual(wasInvoked, false);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUFjdGlvbi50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvY29kZUFjdGlvbi90ZXN0L2Jyb3dzZXIvY29kZUFjdGlvbi50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQW1CQSxTQUFTLHdCQUF3QixDQUFDLEdBQUcsT0FBK0I7UUFDbkUsT0FBTyxJQUFJO1lBQ1Ysa0JBQWtCO2dCQUNqQixPQUFPO29CQUNOLE9BQU8sRUFBRSxPQUFPO29CQUNoQixPQUFPLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztpQkFDbEIsQ0FBQztZQUNILENBQUM7U0FDRCxDQUFDO0lBQ0gsQ0FBQztJQUdELEtBQUssQ0FBQyxZQUFZLEVBQUUsR0FBRyxFQUFFO1FBRXhCLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQztRQUN6QixNQUFNLEdBQUcsR0FBRyxTQUFHLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3ZDLElBQUksS0FBZ0IsQ0FBQztRQUNyQixJQUFJLFFBQStELENBQUM7UUFDcEUsTUFBTSxXQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7UUFDMUMsTUFBTSxRQUFRLEdBQUc7WUFDaEIsV0FBVyxFQUFFO2dCQUNaLEdBQUcsRUFBRTtvQkFDSixLQUFLLEVBQUUsUUFBUTtvQkFDZixXQUFXLEVBQUUsQ0FBQzs0QkFDYixlQUFlLEVBQUUsQ0FBQzs0QkFDbEIsV0FBVyxFQUFFLENBQUM7NEJBQ2QsYUFBYSxFQUFFLENBQUM7NEJBQ2hCLFNBQVMsRUFBRSxDQUFDOzRCQUNaLFFBQVEsRUFBRSx3QkFBYyxDQUFDLEtBQUs7NEJBQzlCLE9BQU8sRUFBRSxLQUFLO3lCQUNkLENBQUM7aUJBQ0Y7Z0JBQ0QsR0FBRyxFQUFFO29CQUNKLEtBQUssRUFBRSxRQUFRO29CQUNmLFdBQVcsRUFBRSxDQUFDOzRCQUNiLGVBQWUsRUFBRSxDQUFD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