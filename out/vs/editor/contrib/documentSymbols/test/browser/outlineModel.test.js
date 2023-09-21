/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/editor/common/core/range", "vs/editor/common/services/languageFeatureDebounce", "vs/editor/common/services/languageFeaturesService", "vs/editor/common/services/model", "vs/editor/test/common/testTextModel", "vs/platform/log/common/log", "vs/platform/markers/common/markers", "../../browser/outlineModel", "vs/base/test/common/mock", "vs/base/test/common/utils"], function (require, exports, assert, cancellation_1, lifecycle_1, uri_1, range_1, languageFeatureDebounce_1, languageFeaturesService_1, model_1, testTextModel_1, log_1, markers_1, outlineModel_1, mock_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('OutlineModel', function () {
        const disposables = new lifecycle_1.DisposableStore();
        const languageFeaturesService = new languageFeaturesService_1.LanguageFeaturesService();
        teardown(function () {
            disposables.clear();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('OutlineModel#create, cached', async function () {
            const insta = (0, testTextModel_1.createModelServices)(disposables);
            const modelService = insta.get(model_1.IModelService);
            const envService = new class extends (0, mock_1.mock)() {
                constructor() {
                    super(...arguments);
                    this.isBuilt = true;
                    this.isExtensionDevelopment = false;
                }
            };
            const service = new outlineModel_1.OutlineModelService(languageFeaturesService, new languageFeatureDebounce_1.LanguageFeatureDebounceService(new log_1.NullLogService(), envService), modelService);
            const model = (0, testTextModel_1.createTextModel)('foo', undefined, undefined, uri_1.URI.file('/fome/path.foo'));
            let count = 0;
            const reg = languageFeaturesService.documentSymbolProvider.register({ pattern: '**/path.foo' }, {
                provideDocumentSymbols() {
                    count += 1;
                    return [];
                }
            });
            await service.getOrCreate(model, cancellation_1.CancellationToken.None);
            assert.strictEqual(count, 1);
            // cached
            await service.getOrCreate(model, cancellation_1.CancellationToken.None);
            assert.strictEqual(count, 1);
            // new version
            model.applyEdits([{ text: 'XXX', range: new range_1.Range(1, 1, 1, 1) }]);
            await service.getOrCreate(model, cancellation_1.CancellationToken.None);
            assert.strictEqual(count, 2);
            reg.dispose();
            model.dispose();
            service.dispose();
        });
        test('OutlineModel#create, cached/cancel', async function () {
            const insta = (0, testTextModel_1.createModelServices)(disposables);
            const modelService = insta.get(model_1.IModelService);
            const envService = new class extends (0, mock_1.mock)() {
                constructor() {
                    super(...arguments);
                    this.isBuilt = true;
                    this.isExtensionDevelopment = false;
                }
            };
            const service = new outlineModel_1.OutlineModelService(languageFeaturesService, new languageFeatureDebounce_1.LanguageFeatureDebounceService(new log_1.NullLogService(), envService), modelService);
            const model = (0, testTextModel_1.createTextModel)('foo', undefined, undefined, uri_1.URI.file('/fome/path.foo'));
            let isCancelled = false;
            const reg = languageFeaturesService.documentSymbolProvider.register({ pattern: '**/path.foo' }, {
                provideDocumentSymbols(d, token) {
                    return new Promise(resolve => {
                        const l = token.onCancellationRequested(_ => {
                            isCancelled = true;
                            resolve(null);
                            l.dispose();
                        });
                    });
                }
            });
            assert.strictEqual(isCancelled, false);
            const s1 = new cancellation_1.CancellationTokenSource();
            service.getOrCreate(model, s1.token);
            const s2 = new cancellation_1.CancellationTokenSource();
            service.getOrCreate(model, s2.token);
            s1.cancel();
            assert.strictEqual(isCancelled, false);
            s2.cancel();
            assert.strictEqual(isCancelled, true);
            reg.dispose();
            model.dispose();
            service.dispose();
        });
        function fakeSymbolInformation(range, name = 'foo') {
            return {
                name,
                detail: 'fake',
                kind: 16 /* SymbolKind.Boolean */,
                tags: [],
                selectionRange: range,
                range: range
            };
        }
        function fakeMarker(range) {
            return { ...range, owner: 'ffff', message: 'test', severity: markers_1.MarkerSeverity.Error, resource: null };
        }
        test('OutlineElement - updateMarker', function () {
            const e0 = new outlineModel_1.OutlineElement('foo1', null, fakeSymbolInformation(new range_1.Range(1, 1, 1, 10)));
            const e1 = new outlineModel_1.OutlineElement('foo2', null, fakeSymbolInformation(new range_1.Range(2, 1, 5, 1)));
            const e2 = new outlineModel_1.OutlineElement('foo3', null, fakeSymbolInformation(new range_1.Range(6, 1, 10, 10)));
            const group = new outlineModel_1.OutlineGroup('group', null, null, 1);
            group.children.set(e0.id, e0);
            group.children.set(e1.id, e1);
            group.children.set(e2.id, e2);
            const data = [fakeMarker(new range_1.Range(6, 1, 6, 7)), fakeMarker(new range_1.Range(1, 1, 1, 4)), fakeMarker(new range_1.Range(10, 2, 14, 1))];
            data.sort(range_1.Range.compareRangesUsingStarts); // model does this
            group.updateMarker(data);
            assert.strictEqual(data.length, 0); // all 'stolen'
            assert.strictEqual(e0.marker.count, 1);
            assert.strictEqual(e1.marker, undefined);
            assert.strictEqual(e2.marker.count, 2);
            group.updateMarker([]);
            assert.strictEqual(e0.marker, undefined);
            assert.strictEqual(e1.marker, undefined);
            assert.strictEqual(e2.marker, undefined);
        });
        test('OutlineElement - updateMarker, 2', function () {
            const p = new outlineModel_1.OutlineElement('A', null, fakeSymbolInformation(new range_1.Range(1, 1, 11, 1)));
            const c1 = new outlineModel_1.OutlineElement('A/B', null, fakeSymbolInformation(new range_1.Range(2, 4, 5, 4)));
            const c2 = new outlineModel_1.OutlineElement('A/C', null, fakeSymbolInformation(new range_1.Range(6, 4, 9, 4)));
            const group = new outlineModel_1.OutlineGroup('group', null, null, 1);
            group.children.set(p.id, p);
            p.children.set(c1.id, c1);
            p.children.set(c2.id, c2);
            let data = [
                fakeMarker(new range_1.Range(2, 4, 5, 4))
            ];
            group.updateMarker(data);
            assert.strictEqual(p.marker.count, 0);
            assert.strictEqual(c1.marker.count, 1);
            assert.strictEqual(c2.marker, undefined);
            data = [
                fakeMarker(new range_1.Range(2, 4, 5, 4)),
                fakeMarker(new range_1.Range(2, 6, 2, 8)),
                fakeMarker(new range_1.Range(7, 6, 7, 8)),
            ];
            group.updateMarker(data);
            assert.strictEqual(p.marker.count, 0);
            assert.strictEqual(c1.marker.count, 2);
            assert.strictEqual(c2.marker.count, 1);
            data = [
                fakeMarker(new range_1.Range(1, 4, 1, 11)),
                fakeMarker(new range_1.Range(7, 6, 7, 8)),
            ];
            group.updateMarker(data);
            assert.strictEqual(p.marker.count, 1);
            assert.strictEqual(c1.marker, undefined);
            assert.strictEqual(c2.marker.count, 1);
        });
        test('OutlineElement - updateMarker/multiple groups', function () {
            const model = new class extends outlineModel_1.OutlineModel {
                constructor() {
                    super(null);
                }
                readyForTesting() {
                    this._groups = this.children;
                }
            };
            model.children.set('g1', new outlineModel_1.OutlineGroup('g1', model, null, 1));
            model.children.get('g1').children.set('c1', new outlineModel_1.OutlineElement('c1', model.children.get('g1'), fakeSymbolInformation(new range_1.Range(1, 1, 11, 1))));
            model.children.set('g2', new outlineModel_1.OutlineGroup('g2', model, null, 1));
            model.children.get('g2').children.set('c2', new outlineModel_1.OutlineElement('c2', model.children.get('g2'), fakeSymbolInformation(new range_1.Range(1, 1, 7, 1))));
            model.children.get('g2').children.get('c2').children.set('c2.1', new outlineModel_1.OutlineElement('c2.1', model.children.get('g2').children.get('c2'), fakeSymbolInformation(new range_1.Range(1, 3, 2, 19))));
            model.children.get('g2').children.get('c2').children.set('c2.2', new outlineModel_1.OutlineElement('c2.2', model.children.get('g2').children.get('c2'), fakeSymbolInformation(new range_1.Range(4, 1, 6, 10))));
            model.readyForTesting();
            const data = [
                fakeMarker(new range_1.Range(1, 1, 2, 8)),
                fakeMarker(new range_1.Range(6, 1, 6, 98)),
            ];
            model.updateMarker(data);
            assert.strictEqual(model.children.get('g1').children.get('c1').marker.count, 2);
            assert.strictEqual(model.children.get('g2').children.get('c2').children.get('c2.1').marker.count, 1);
            assert.strictEqual(model.children.get('g2').children.get('c2').children.get('c2.2').marker.count, 1);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0bGluZU1vZGVsLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9kb2N1bWVudFN5bWJvbHMvdGVzdC9icm93c2VyL291dGxpbmVNb2RlbC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBbUJoRyxLQUFLLENBQUMsY0FBYyxFQUFFO1FBRXJCLE1BQU0sV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1FBQzFDLE1BQU0sdUJBQXVCLEdBQUcsSUFBSSxpREFBdUIsRUFBRSxDQUFDO1FBRTlELFFBQVEsQ0FBQztZQUNSLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNyQixDQUFDLENBQUMsQ0FBQztRQUVILElBQUEsK0NBQXVDLEdBQUUsQ0FBQztRQUUxQyxJQUFJLENBQUMsNkJBQTZCLEVBQUUsS0FBSztZQUV4QyxNQUFNLEtBQUssR0FBRyxJQUFBLG1DQUFtQixFQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMscUJBQWEsQ0FBQyxDQUFDO1lBQzlDLE1BQU0sVUFBVSxHQUFHLElBQUksS0FBTSxTQUFRLElBQUEsV0FBSSxHQUF1QjtnQkFBekM7O29CQUNiLFlBQU8sR0FBWSxJQUFJLENBQUM7b0JBQ3hCLDJCQUFzQixHQUFZLEtBQUssQ0FBQztnQkFDbEQsQ0FBQzthQUFBLENBQUM7WUFDRixNQUFNLE9BQU8sR0FBRyxJQUFJLGtDQUFtQixDQUFDLHVCQUF1QixFQUFFLElBQUksd0RBQThCLENBQUMsSUFBSSxvQkFBYyxFQUFFLEVBQUUsVUFBVSxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFFckosTUFBTSxLQUFLLEdBQUcsSUFBQSwrQkFBZSxFQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQUcsQ0FBQyxJQUFJLENB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