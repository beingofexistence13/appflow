/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/base/test/common/utils", "vs/editor/common/languages", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/opener/common/opener", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/externalUriOpener/common/externalUriOpenerService"], function (require, exports, assert, cancellation_1, lifecycle_1, uri_1, utils_1, languages_1, configuration_1, testConfigurationService_1, instantiationServiceMock_1, opener_1, quickInput_1, externalUriOpenerService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MockQuickInputService {
        constructor(pickIndex) {
            this.pickIndex = pickIndex;
        }
        async pick(picks, options, token) {
            const resolvedPicks = await picks;
            const item = resolvedPicks[this.pickIndex];
            if (item.type === 'separator') {
                return undefined;
            }
            return item;
        }
    }
    suite('ExternalUriOpenerService', () => {
        let disposables;
        let instantiationService;
        setup(() => {
            disposables = new lifecycle_1.DisposableStore();
            instantiationService = disposables.add(new instantiationServiceMock_1.TestInstantiationService());
            instantiationService.stub(configuration_1.IConfigurationService, new testConfigurationService_1.TestConfigurationService());
            instantiationService.stub(opener_1.IOpenerService, {
                registerExternalOpener: () => { return lifecycle_1.Disposable.None; }
            });
        });
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('Should not open if there are no openers', async () => {
            const externalUriOpenerService = disposables.add(instantiationService.createInstance(externalUriOpenerService_1.ExternalUriOpenerService));
            externalUriOpenerService.registerExternalOpenerProvider(new class {
                async *getOpeners(_targetUri) {
                    // noop
                }
            });
            const uri = uri_1.URI.parse('http://contoso.com');
            const didOpen = await externalUriOpenerService.openExternal(uri.toString(), { sourceUri: uri }, cancellation_1.CancellationToken.None);
            assert.strictEqual(didOpen, false);
        });
        test('Should prompt if there is at least one enabled opener', async () => {
            instantiationService.stub(quickInput_1.IQuickInputService, new MockQuickInputService(0));
            const externalUriOpenerService = disposables.add(instantiationService.createInstance(externalUriOpenerService_1.ExternalUriOpenerService));
            let openedWithEnabled = false;
            externalUriOpenerService.registerExternalOpenerProvider(new class {
                async *getOpeners(_targetUri) {
                    yield {
                        id: 'disabled-id',
                        label: 'disabled',
                        canOpen: async () => languages_1.ExternalUriOpenerPriority.None,
                        openExternalUri: async () => true,
                    };
                    yield {
                        id: 'enabled-id',
                        label: 'enabled',
                        canOpen: async () => languages_1.ExternalUriOpenerPriority.Default,
                        openExternalUri: async () => {
                            openedWithEnabled = true;
                            return true;
                        }
                    };
                }
            });
            const uri = uri_1.URI.parse('http://contoso.com');
            const didOpen = await externalUriOpenerService.openExternal(uri.toString(), { sourceUri: uri }, cancellation_1.CancellationToken.None);
            assert.strictEqual(didOpen, true);
            assert.strictEqual(openedWithEnabled, true);
        });
        test('Should automatically pick single preferred opener without prompt', async () => {
            const externalUriOpenerService = disposables.add(instantiationService.createInstance(externalUriOpenerService_1.ExternalUriOpenerService));
            let openedWithPreferred = false;
            externalUriOpenerService.registerExternalOpenerProvider(new class {
                async *getOpeners(_targetUri) {
                    yield {
                        id: 'other-id',
                        label: 'other',
                        canOpen: async () => languages_1.ExternalUriOpenerPriority.Default,
                        openExternalUri: async () => {
                            return true;
                        }
                    };
                    yield {
                        id: 'preferred-id',
                        label: 'preferred',
                        canOpen: async () => languages_1.ExternalUriOpenerPriority.Preferred,
                        openExternalUri: async () => {
                            openedWithPreferred = true;
                            return true;
                        }
                    };
                }
            });
            const uri = uri_1.URI.parse('http://contoso.com');
            const didOpen = await externalUriOpenerService.openExternal(uri.toString(), { sourceUri: uri }, cancellation_1.CancellationToken.None);
            assert.strictEqual(didOpen, true);
            assert.strictEqual(openedWithPreferred, true);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWxVcmlPcGVuZXJTZXJ2aWNlLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9leHRlcm5hbFVyaU9wZW5lci90ZXN0L2NvbW1vbi9leHRlcm5hbFVyaU9wZW5lclNlcnZpY2UudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQWdCaEcsTUFBTSxxQkFBcUI7UUFFMUIsWUFDa0IsU0FBaUI7WUFBakIsY0FBUyxHQUFULFNBQVMsQ0FBUTtRQUMvQixDQUFDO1FBSUUsS0FBSyxDQUFDLElBQUksQ0FBMkIsS0FBeUQsRUFBRSxPQUE4QyxFQUFFLEtBQXlCO1lBQy9LLE1BQU0sYUFBYSxHQUFHLE1BQU0sS0FBSyxDQUFDO1lBQ2xDLE1BQU0sSUFBSSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDM0MsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFdBQVcsRUFBRTtnQkFDOUIsT0FBTyxTQUFTLENBQUM7YUFDakI7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7S0FFRDtJQUVELEtBQUssQ0FBQywwQkFBMEIsRUFBRSxHQUFHLEVBQUU7UUFDdEMsSUFBSSxXQUE0QixDQUFDO1FBQ2pDLElBQUksb0JBQThDLENBQUM7UUFFbkQsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUNwQyxvQkFBb0IsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksbURBQXdCLEVBQUUsQ0FBQyxDQUFDO1lBRXZFLG9CQUFvQixDQUFDLElBQUksQ0FBQyxxQ0FBcUIsRUFBRSxJQUFJLG1EQUF3QixFQUFFLENBQUMsQ0FBQztZQUNqRixvQkFBb0IsQ0FBQyxJQUFJLENBQUMsdUJBQWMsRUFBRTtnQkFDekMsc0JBQXNCLEVBQUUsR0FB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