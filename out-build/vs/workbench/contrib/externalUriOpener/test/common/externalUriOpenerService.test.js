/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/base/test/common/utils", "vs/editor/common/languages", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/opener/common/opener", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/externalUriOpener/common/externalUriOpenerService"], function (require, exports, assert, cancellation_1, lifecycle_1, uri_1, utils_1, languages_1, configuration_1, testConfigurationService_1, instantiationServiceMock_1, opener_1, quickInput_1, externalUriOpenerService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MockQuickInputService {
        constructor(a) {
            this.a = a;
        }
        async pick(picks, options, token) {
            const resolvedPicks = await picks;
            const item = resolvedPicks[this.a];
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
            disposables = new lifecycle_1.$jc();
            instantiationService = disposables.add(new instantiationServiceMock_1.$L0b());
            instantiationService.stub(configuration_1.$8h, new testConfigurationService_1.$G0b());
            instantiationService.stub(opener_1.$NT, {
                registerExternalOpener: () => { return lifecycle_1.$kc.None; }
            });
        });
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.$bT)();
        test('Should not open if there are no openers', async () => {
            const externalUriOpenerService = disposables.add(instantiationService.createInstance(externalUriOpenerService_1.$glb));
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
            instantiationService.stub(quickInput_1.$Gq, new MockQuickInputService(0));
            const externalUriOpenerService = disposables.add(instantiationService.createInstance(externalUriOpenerService_1.$glb));
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
            const externalUriOpenerService = disposables.add(instantiationService.createInstance(externalUriOpenerService_1.$glb));
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
//# sourceMappingURL=externalUriOpenerService.test.js.map