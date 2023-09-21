/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/common/uri", "vs/base/test/common/mock", "vs/base/test/common/utils", "vs/platform/configuration/test/common/testConfigurationService", "vs/workbench/contrib/notebook/browser/services/notebookServiceImpl", "vs/workbench/contrib/notebook/common/notebookProvider", "vs/workbench/services/editor/browser/editorResolverService", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/test/browser/workbenchTestServices"], function (require, exports, assert, event_1, uri_1, mock_1, utils_1, testConfigurationService_1, notebookServiceImpl_1, notebookProvider_1, editorResolverService_1, editorResolverService_2, extensions_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('NotebookProviderInfoStore', function () {
        const disposables = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('Can\'t open untitled notebooks in test #119363', function () {
            const instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables);
            const store = new notebookServiceImpl_1.NotebookProviderInfoStore(new class extends (0, mock_1.mock)() {
                get() { return ''; }
                store() { }
            }, new class extends (0, mock_1.mock)() {
                constructor() {
                    super(...arguments);
                    this.onDidRegisterExtensions = event_1.Event.None;
                }
            }, disposables.add(instantiationService.createInstance(editorResolverService_1.EditorResolverService)), new testConfigurationService_1.TestConfigurationService(), new class extends (0, mock_1.mock)() {
                constructor() {
                    super(...arguments);
                    this.onDidChangeScreenReaderOptimized = event_1.Event.None;
                }
            }, instantiationService, new class extends (0, mock_1.mock)() {
                hasProvider() { return true; }
            }, new class extends (0, mock_1.mock)() {
            });
            disposables.add(store);
            const fooInfo = new notebookProvider_1.NotebookProviderInfo({
                extension: extensions_1.nullExtensionDescription.identifier,
                id: 'foo',
                displayName: 'foo',
                selectors: [{ filenamePattern: '*.foo' }],
                priority: editorResolverService_2.RegisteredEditorPriority.default,
                exclusive: false,
                providerDisplayName: 'foo',
            });
            const barInfo = new notebookProvider_1.NotebookProviderInfo({
                extension: extensions_1.nullExtensionDescription.identifier,
                id: 'bar',
                displayName: 'bar',
                selectors: [{ filenamePattern: '*.bar' }],
                priority: editorResolverService_2.RegisteredEditorPriority.default,
                exclusive: false,
                providerDisplayName: 'bar',
            });
            store.add(fooInfo);
            store.add(barInfo);
            assert.ok(store.get('foo'));
            assert.ok(store.get('bar'));
            assert.ok(!store.get('barfoo'));
            let providers = store.getContributedNotebook(uri_1.URI.parse('file:///test/nb.foo'));
            assert.strictEqual(providers.length, 1);
            assert.strictEqual(providers[0] === fooInfo, true);
            providers = store.getContributedNotebook(uri_1.URI.parse('file:///test/nb.bar'));
            assert.strictEqual(providers.length, 1);
            assert.strictEqual(providers[0] === barInfo, true);
            providers = store.getContributedNotebook(uri_1.URI.parse('untitled:///Untitled-1'));
            assert.strictEqual(providers.length, 2);
            assert.strictEqual(providers[0] === fooInfo, true);
            assert.strictEqual(providers[1] === barInfo, true);
            providers = store.getContributedNotebook(uri_1.URI.parse('untitled:///test/nb.bar'));
            assert.strictEqual(providers.length, 1);
            assert.strictEqual(providers[0] === barInfo, true);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tTZXJ2aWNlSW1wbC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svdGVzdC9icm93c2VyL25vdGVib29rU2VydmljZUltcGwudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQW9CaEcsS0FBSyxDQUFDLDJCQUEyQixFQUFFO1FBQ2xDLE1BQU0sV0FBVyxHQUFHLElBQUEsK0NBQXVDLEdBQWtDLENBQUM7UUFFOUYsSUFBSSxDQUFDLGdEQUFnRCxFQUFFO1lBQ3RELE1BQU0sb0JBQW9CLEdBQUcsSUFBQSxxREFBNkIsRUFBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDbkYsTUFBTSxLQUFLLEdBQUcsSUFBSSwrQ0FBeUIsQ0FDMUMsSUFBSSxLQUFNLFNBQVEsSUFBQSxXQUFJLEdBQW1CO2dCQUMvQixHQUFHLEtBQUssT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNwQixLQUFLLEtBQUssQ0FBQzthQUNwQixFQUNELElBQUksS0FBTSxTQUFRLElBQUEsV0FBSSxHQUFxQjtnQkFBdkM7O29CQUNNLDRCQUF1QixHQUFHLGFBQUssQ0FBQyxJQUFJLENBQUM7Z0JBQy9DLENBQUM7YUFBQSxFQUNELFdBQVcsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLDZDQUFxQixDQUFDLENBQUMsRUFDM0UsSUFBSSxtREFBd0IsRUFBRSxFQUM5QixJQUFJLEtBQU0sU0FBUSxJQUFBLFdBQUksR0FBeUI7Z0JBQTNDOztvQkFDTSxxQ0FBZ0MsR0FBZ0IsYUFBSyxDQUFDLElBQUksQ0FBQztnQkFDckUsQ0FBQzthQUFBLEVBQ0Qsb0JBQW9CLEVBQ3BCLElBQUksS0FBTSxTQUFRLElBQUEsV0FBSSxHQUFnQjtnQkFDNUIsV0FBVyxLQUFLLE9BQU8sSUFBSSxDQUFDLENBQUMs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