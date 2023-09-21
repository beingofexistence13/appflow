/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/editor/common/core/range", "vs/editor/common/services/languageFeatureDebounce", "vs/editor/common/services/languageFeaturesService", "vs/editor/common/services/model", "vs/editor/test/common/testTextModel", "vs/platform/log/common/log", "vs/platform/markers/common/markers", "../../browser/outlineModel", "vs/base/test/common/mock", "vs/base/test/common/utils"], function (require, exports, assert, cancellation_1, lifecycle_1, uri_1, range_1, languageFeatureDebounce_1, languageFeaturesService_1, model_1, testTextModel_1, log_1, markers_1, outlineModel_1, mock_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('OutlineModel', function () {
        const disposables = new lifecycle_1.$jc();
        const languageFeaturesService = new languageFeaturesService_1.$oBb();
        teardown(function () {
            disposables.clear();
        });
        (0, utils_1.$bT)();
        test('OutlineModel#create, cached', async function () {
            const insta = (0, testTextModel_1.$Q0b)(disposables);
            const modelService = insta.get(model_1.$yA);
            const envService = new class extends (0, mock_1.$rT)() {
                constructor() {
                    super(...arguments);
                    this.isBuilt = true;
                    this.isExtensionDevelopment = false;
                }
            };
            const service = new outlineModel_1.$S8(languageFeaturesService, new languageFeatureDebounce_1.$62(new log_1.$fj(), envService), modelService);
            const model = (0, testTextModel_1.$O0b)('foo', undefined, undefined, uri_1.URI.file('/fome/path.foo'));
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
            model.applyEdits([{ text: 'XXX', range: new range_1.$ks(1, 1, 1, 1) }]);
            await service.getOrCreate(model, cancellation_1.CancellationToken.None);
            assert.strictEqual(count, 2);
            reg.dispose();
            model.dispose();
            service.dispose();
        });
        test('OutlineModel#create, cached/cancel', async function () {
            const insta = (0, testTextModel_1.$Q0b)(disposables);
            const modelService = insta.get(model_1.$yA);
            const envService = new class extends (0, mock_1.$rT)() {
                constructor() {
                    super(...arguments);
                    this.isBuilt = true;
                    this.isExtensionDevelopment = false;
                }
            };
            const service = new outlineModel_1.$S8(languageFeaturesService, new languageFeatureDebounce_1.$62(new log_1.$fj(), envService), modelService);
            const model = (0, testTextModel_1.$O0b)('foo', undefined, undefined, uri_1.URI.file('/fome/path.foo'));
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
            const s1 = new cancellation_1.$pd();
            service.getOrCreate(model, s1.token);
            const s2 = new cancellation_1.$pd();
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
            const e0 = new outlineModel_1.$O8('foo1', null, fakeSymbolInformation(new range_1.$ks(1, 1, 1, 10)));
            const e1 = new outlineModel_1.$O8('foo2', null, fakeSymbolInformation(new range_1.$ks(2, 1, 5, 1)));
            const e2 = new outlineModel_1.$O8('foo3', null, fakeSymbolInformation(new range_1.$ks(6, 1, 10, 10)));
            const group = new outlineModel_1.$P8('group', null, null, 1);
            group.children.set(e0.id, e0);
            group.children.set(e1.id, e1);
            group.children.set(e2.id, e2);
            const data = [fakeMarker(new range_1.$ks(6, 1, 6, 7)), fakeMarker(new range_1.$ks(1, 1, 1, 4)), fakeMarker(new range_1.$ks(10, 2, 14, 1))];
            data.sort(range_1.$ks.compareRangesUsingStarts); // model does this
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
            const p = new outlineModel_1.$O8('A', null, fakeSymbolInformation(new range_1.$ks(1, 1, 11, 1)));
            const c1 = new outlineModel_1.$O8('A/B', null, fakeSymbolInformation(new range_1.$ks(2, 4, 5, 4)));
            const c2 = new outlineModel_1.$O8('A/C', null, fakeSymbolInformation(new range_1.$ks(6, 4, 9, 4)));
            const group = new outlineModel_1.$P8('group', null, null, 1);
            group.children.set(p.id, p);
            p.children.set(c1.id, c1);
            p.children.set(c2.id, c2);
            let data = [
                fakeMarker(new range_1.$ks(2, 4, 5, 4))
            ];
            group.updateMarker(data);
            assert.strictEqual(p.marker.count, 0);
            assert.strictEqual(c1.marker.count, 1);
            assert.strictEqual(c2.marker, undefined);
            data = [
                fakeMarker(new range_1.$ks(2, 4, 5, 4)),
                fakeMarker(new range_1.$ks(2, 6, 2, 8)),
                fakeMarker(new range_1.$ks(7, 6, 7, 8)),
            ];
            group.updateMarker(data);
            assert.strictEqual(p.marker.count, 0);
            assert.strictEqual(c1.marker.count, 2);
            assert.strictEqual(c2.marker.count, 1);
            data = [
                fakeMarker(new range_1.$ks(1, 4, 1, 11)),
                fakeMarker(new range_1.$ks(7, 6, 7, 8)),
            ];
            group.updateMarker(data);
            assert.strictEqual(p.marker.count, 1);
            assert.strictEqual(c1.marker, undefined);
            assert.strictEqual(c2.marker.count, 1);
        });
        test('OutlineElement - updateMarker/multiple groups', function () {
            const model = new class extends outlineModel_1.$Q8 {
                constructor() {
                    super(null);
                }
                readyForTesting() {
                    this.e = this.children;
                }
            };
            model.children.set('g1', new outlineModel_1.$P8('g1', model, null, 1));
            model.children.get('g1').children.set('c1', new outlineModel_1.$O8('c1', model.children.get('g1'), fakeSymbolInformation(new range_1.$ks(1, 1, 11, 1))));
            model.children.set('g2', new outlineModel_1.$P8('g2', model, null, 1));
            model.children.get('g2').children.set('c2', new outlineModel_1.$O8('c2', model.children.get('g2'), fakeSymbolInformation(new range_1.$ks(1, 1, 7, 1))));
            model.children.get('g2').children.get('c2').children.set('c2.1', new outlineModel_1.$O8('c2.1', model.children.get('g2').children.get('c2'), fakeSymbolInformation(new range_1.$ks(1, 3, 2, 19))));
            model.children.get('g2').children.get('c2').children.set('c2.2', new outlineModel_1.$O8('c2.2', model.children.get('g2').children.get('c2'), fakeSymbolInformation(new range_1.$ks(4, 1, 6, 10))));
            model.readyForTesting();
            const data = [
                fakeMarker(new range_1.$ks(1, 1, 2, 8)),
                fakeMarker(new range_1.$ks(6, 1, 6, 98)),
            ];
            model.updateMarker(data);
            assert.strictEqual(model.children.get('g1').children.get('c1').marker.count, 2);
            assert.strictEqual(model.children.get('g2').children.get('c2').children.get('c2.1').marker.count, 1);
            assert.strictEqual(model.children.get('g2').children.get('c2').children.get('c2.2').marker.count, 1);
        });
    });
});
//# sourceMappingURL=outlineModel.test.js.map