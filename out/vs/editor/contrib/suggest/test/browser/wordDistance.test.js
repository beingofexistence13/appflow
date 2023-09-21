/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/base/test/common/mock", "vs/editor/common/core/wordHelper", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/editorSimpleWorker", "vs/editor/browser/services/editorWorkerService", "vs/editor/contrib/suggest/browser/suggest", "vs/editor/contrib/suggest/browser/wordDistance", "vs/editor/test/browser/testCodeEditor", "vs/editor/test/common/testTextModel", "vs/editor/test/common/modes/testLanguageConfigurationService", "vs/platform/log/common/log", "vs/editor/common/services/languageFeaturesService", "vs/editor/common/languages/language", "vs/base/test/common/utils"], function (require, exports, assert, event_1, lifecycle_1, uri_1, mock_1, wordHelper_1, languageConfigurationRegistry_1, editorSimpleWorker_1, editorWorkerService_1, suggest_1, wordDistance_1, testCodeEditor_1, testTextModel_1, testLanguageConfigurationService_1, log_1, languageFeaturesService_1, language_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('suggest, word distance', function () {
        let distance;
        const disposables = new lifecycle_1.DisposableStore();
        setup(async function () {
            const languageId = 'bracketMode';
            disposables.clear();
            const instantiationService = (0, testCodeEditor_1.createCodeEditorServices)(disposables);
            const languageConfigurationService = instantiationService.get(languageConfigurationRegistry_1.ILanguageConfigurationService);
            const languageService = instantiationService.get(language_1.ILanguageService);
            disposables.add(languageService.registerLanguage({ id: languageId }));
            disposables.add(languageConfigurationService.register(languageId, {
                brackets: [
                    ['{', '}'],
                    ['[', ']'],
                    ['(', ')'],
                ]
            }));
            const model = disposables.add((0, testTextModel_1.instantiateTextModel)(instantiationService, 'function abc(aa, ab){\na\n}', languageId, undefined, uri_1.URI.parse('test:///some.path')));
            const editor = disposables.add((0, testCodeEditor_1.instantiateTestCodeEditor)(instantiationService, model));
            editor.updateOptions({ suggest: { localityBonus: true } });
            editor.setPosition({ lineNumber: 2, column: 2 });
            const modelService = new class extends (0, mock_1.mock)() {
                constructor() {
                    super(...arguments);
                    this.onModelRemoved = event_1.Event.None;
                }
                getModel(uri) {
                    return uri.toString() === model.uri.toString() ? model : null;
                }
            };
            const service = new class extends editorWorkerService_1.EditorWorkerService {
                constructor() {
                    super(modelService, new class extends (0, mock_1.mock)() {
                    }, new log_1.NullLogService(), new testLanguageConfigurationService_1.TestLanguageConfigurationService(), new languageFeaturesService_1.LanguageFeaturesService());
                    this._worker = new editorSimpleWorker_1.EditorSimpleWorker(new class extends (0, mock_1.mock)() {
                    }, null);
                    this._worker.acceptNewModel({
                        url: model.uri.toString(),
                        lines: model.getLinesContent(),
                        EOL: model.getEOL(),
                        versionId: model.getVersionId()
                    });
                    model.onDidChangeContent(e => this._worker.acceptModelChanged(model.uri.toString(), e));
                }
                computeWordRanges(resource, range) {
                    return this._worker.computeWordRanges(resource.toString(), range, wordHelper_1.DEFAULT_WORD_REGEXP.source, wordHelper_1.DEFAULT_WORD_REGEXP.flags);
                }
            };
            distance = await wordDistance_1.WordDistance.create(service, editor);
            disposables.add(service);
        });
        teardown(function () {
            disposables.clear();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        function createSuggestItem(label, overwriteBefore, position) {
            const suggestion = {
                label,
                range: { startLineNumber: position.lineNumber, startColumn: position.column - overwriteBefore, endLineNumber: position.lineNumber, endColumn: position.column },
                insertText: label,
                kind: 0
            };
            const container = {
                suggestions: [suggestion]
            };
            const provider = {
                _debugDisplayName: 'test',
                provideCompletionItems() {
                    return;
                }
            };
            return new suggest_1.CompletionItem(position, suggestion, container, provider);
        }
        test('Suggest locality bonus can boost current word #90515', function () {
            const pos = { lineNumber: 2, column: 2 };
            const d1 = distance.distance(pos, createSuggestItem('a', 1, pos).completion);
            const d2 = distance.distance(pos, createSuggestItem('aa', 1, pos).completion);
            const d3 = distance.distance(pos, createSuggestItem('ab', 1, pos).completion);
            assert.ok(d1 > d2);
            assert.ok(d2 === d3);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29yZERpc3RhbmNlLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9zdWdnZXN0L3Rlc3QvYnJvd3Nlci93b3JkRGlzdGFuY2UudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQTJCaEcsS0FBSyxDQUFDLHdCQUF3QixFQUFFO1FBRS9CLElBQUksUUFBc0IsQ0FBQztRQUMzQixNQUFNLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztRQUUxQyxLQUFLLENBQUMsS0FBSztZQUNWLE1BQU0sVUFBVSxHQUFHLGFBQWEsQ0FBQztZQUVqQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDcEIsTUFBTSxvQkFBb0IsR0FBRyxJQUFBLHlDQUF3QixFQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ25FLE1BQU0sNEJBQTRCLEdBQUcsb0JBQW9CLENBQUMsR0FBRyxDQUFDLDZEQUE2QixDQUFDLENBQUM7WUFDN0YsTUFBTSxlQUFlLEdBQUcsb0JBQW9CLENBQUMsR0FBRyxDQUFDLDJCQUFnQixDQUFDLENBQUM7WUFDbkUsV0FBVyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RFLFdBQVcsQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRTtnQkFDakUsUUFBUSxFQUFFO29CQUNULENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztvQkFDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7b0JBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO2lCQUNWO2FBQ0QsQ0FBQyxDQUFDLENBQUM7WUFFSixNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUEsb0NBQW9CLEVBQUMsb0JBQW9C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