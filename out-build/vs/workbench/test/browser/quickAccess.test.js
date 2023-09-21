/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "assert", "vs/platform/registry/common/platform", "vs/platform/quickinput/common/quickAccess", "vs/platform/quickinput/common/quickInput", "vs/workbench/test/browser/workbenchTestServices", "vs/base/common/lifecycle", "vs/base/common/async", "vs/platform/quickinput/browser/pickerQuickAccess"], function (require, exports, assert, platform_1, quickAccess_1, quickInput_1, workbenchTestServices_1, lifecycle_1, async_1, pickerQuickAccess_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('QuickAccess', () => {
        let disposables;
        let instantiationService;
        let accessor;
        let providerDefaultCalled = false;
        let providerDefaultCanceled = false;
        let providerDefaultDisposed = false;
        let provider1Called = false;
        let provider1Canceled = false;
        let provider1Disposed = false;
        let provider2Called = false;
        let provider2Canceled = false;
        let provider2Disposed = false;
        let provider3Called = false;
        let provider3Canceled = false;
        let provider3Disposed = false;
        let TestProviderDefault = class TestProviderDefault {
            constructor(a, disposables) {
                this.a = a;
            }
            provide(picker, token) {
                assert.ok(picker);
                providerDefaultCalled = true;
                token.onCancellationRequested(() => providerDefaultCanceled = true);
                // bring up provider #3
                setTimeout(() => this.a.quickAccess.show(providerDescriptor3.prefix));
                return (0, lifecycle_1.$ic)(() => providerDefaultDisposed = true);
            }
        };
        TestProviderDefault = __decorate([
            __param(0, quickInput_1.$Gq)
        ], TestProviderDefault);
        class TestProvider1 {
            provide(picker, token) {
                assert.ok(picker);
                provider1Called = true;
                token.onCancellationRequested(() => provider1Canceled = true);
                return (0, lifecycle_1.$ic)(() => provider1Disposed = true);
            }
        }
        class TestProvider2 {
            provide(picker, token) {
                assert.ok(picker);
                provider2Called = true;
                token.onCancellationRequested(() => provider2Canceled = true);
                return (0, lifecycle_1.$ic)(() => provider2Disposed = true);
            }
        }
        class TestProvider3 {
            provide(picker, token) {
                assert.ok(picker);
                provider3Called = true;
                token.onCancellationRequested(() => provider3Canceled = true);
                // hide without picking
                setTimeout(() => picker.hide());
                return (0, lifecycle_1.$ic)(() => provider3Disposed = true);
            }
        }
        const providerDescriptorDefault = { ctor: TestProviderDefault, prefix: '', helpEntries: [] };
        const providerDescriptor1 = { ctor: TestProvider1, prefix: 'test', helpEntries: [] };
        const providerDescriptor2 = { ctor: TestProvider2, prefix: 'test something', helpEntries: [] };
        const providerDescriptor3 = { ctor: TestProvider3, prefix: 'changed', helpEntries: [] };
        setup(() => {
            disposables = new lifecycle_1.$jc();
            instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            accessor = instantiationService.createInstance(workbenchTestServices_1.$mec);
        });
        teardown(() => {
            disposables.dispose();
        });
        test('registry', () => {
            const registry = (platform_1.$8m.as(quickAccess_1.$8p.Quickaccess));
            const restore = registry.clear();
            assert.ok(!registry.getQuickAccessProvider('test'));
            const disposables = new lifecycle_1.$jc();
            disposables.add(registry.registerQuickAccessProvider(providerDescriptorDefault));
            assert(registry.getQuickAccessProvider('') === providerDescriptorDefault);
            assert(registry.getQuickAccessProvider('test') === providerDescriptorDefault);
            const disposable = disposables.add(registry.registerQuickAccessProvider(providerDescriptor1));
            assert(registry.getQuickAccessProvider('test') === providerDescriptor1);
            const providers = registry.getQuickAccessProviders();
            assert(providers.some(provider => provider.prefix === 'test'));
            disposable.dispose();
            assert(registry.getQuickAccessProvider('test') === providerDescriptorDefault);
            disposables.dispose();
            assert.ok(!registry.getQuickAccessProvider('test'));
            restore();
        });
        test('provider', async () => {
            const registry = (platform_1.$8m.as(quickAccess_1.$8p.Quickaccess));
            const restore = registry.clear();
            const disposables = new lifecycle_1.$jc();
            disposables.add(registry.registerQuickAccessProvider(providerDescriptorDefault));
            disposables.add(registry.registerQuickAccessProvider(providerDescriptor1));
            disposables.add(registry.registerQuickAccessProvider(providerDescriptor2));
            disposables.add(registry.registerQuickAccessProvider(providerDescriptor3));
            accessor.quickInputService.quickAccess.show('test');
            assert.strictEqual(providerDefaultCalled, false);
            assert.strictEqual(provider1Called, true);
            assert.strictEqual(provider2Called, false);
            assert.strictEqual(provider3Called, false);
            assert.strictEqual(providerDefaultCanceled, false);
            assert.strictEqual(provider1Canceled, false);
            assert.strictEqual(provider2Canceled, false);
            assert.strictEqual(provider3Canceled, false);
            assert.strictEqual(providerDefaultDisposed, false);
            assert.strictEqual(provider1Disposed, false);
            assert.strictEqual(provider2Disposed, false);
            assert.strictEqual(provider3Disposed, false);
            provider1Called = false;
            accessor.quickInputService.quickAccess.show('test something');
            assert.strictEqual(providerDefaultCalled, false);
            assert.strictEqual(provider1Called, false);
            assert.strictEqual(provider2Called, true);
            assert.strictEqual(provider3Called, false);
            assert.strictEqual(providerDefaultCanceled, false);
            assert.strictEqual(provider1Canceled, true);
            assert.strictEqual(provider2Canceled, false);
            assert.strictEqual(provider3Canceled, false);
            assert.strictEqual(providerDefaultDisposed, false);
            assert.strictEqual(provider1Disposed, true);
            assert.strictEqual(provider2Disposed, false);
            assert.strictEqual(provider3Disposed, false);
            provider2Called = false;
            provider1Canceled = false;
            provider1Disposed = false;
            accessor.quickInputService.quickAccess.show('usedefault');
            assert.strictEqual(providerDefaultCalled, true);
            assert.strictEqual(provider1Called, false);
            assert.strictEqual(provider2Called, false);
            assert.strictEqual(provider3Called, false);
            assert.strictEqual(providerDefaultCanceled, false);
            assert.strictEqual(provider1Canceled, false);
            assert.strictEqual(provider2Canceled, true);
            assert.strictEqual(provider3Canceled, false);
            assert.strictEqual(providerDefaultDisposed, false);
            assert.strictEqual(provider1Disposed, false);
            assert.strictEqual(provider2Disposed, true);
            assert.strictEqual(provider3Disposed, false);
            await (0, async_1.$Hg)(1);
            assert.strictEqual(providerDefaultCanceled, true);
            assert.strictEqual(providerDefaultDisposed, true);
            assert.strictEqual(provider3Called, true);
            await (0, async_1.$Hg)(1);
            assert.strictEqual(provider3Canceled, true);
            assert.strictEqual(provider3Disposed, true);
            disposables.dispose();
            restore();
        });
        let fastProviderCalled = false;
        let slowProviderCalled = false;
        let fastAndSlowProviderCalled = false;
        let slowProviderCanceled = false;
        let fastAndSlowProviderCanceled = false;
        class FastTestQuickPickProvider extends pickerQuickAccess_1.$sqb {
            constructor() {
                super('fast');
            }
            g(filter, disposables, token) {
                fastProviderCalled = true;
                return [{ label: 'Fast Pick' }];
            }
        }
        class SlowTestQuickPickProvider extends pickerQuickAccess_1.$sqb {
            constructor() {
                super('slow');
            }
            async g(filter, disposables, token) {
                slowProviderCalled = true;
                await (0, async_1.$Hg)(1);
                if (token.isCancellationRequested) {
                    slowProviderCanceled = true;
                }
                return [{ label: 'Slow Pick' }];
            }
        }
        class FastAndSlowTestQuickPickProvider extends pickerQuickAccess_1.$sqb {
            constructor() {
                super('bothFastAndSlow');
            }
            g(filter, disposables, token) {
                fastAndSlowProviderCalled = true;
                return {
                    picks: [{ label: 'Fast Pick' }],
                    additionalPicks: (async () => {
                        await (0, async_1.$Hg)(1);
                        if (token.isCancellationRequested) {
                            fastAndSlowProviderCanceled = true;
                        }
                        return [{ label: 'Slow Pick' }];
                    })()
                };
            }
        }
        const fastProviderDescriptor = { ctor: FastTestQuickPickProvider, prefix: 'fast', helpEntries: [] };
        const slowProviderDescriptor = { ctor: SlowTestQuickPickProvider, prefix: 'slow', helpEntries: [] };
        const fastAndSlowProviderDescriptor = { ctor: FastAndSlowTestQuickPickProvider, prefix: 'bothFastAndSlow', helpEntries: [] };
        test('quick pick access - show()', async () => {
            const registry = (platform_1.$8m.as(quickAccess_1.$8p.Quickaccess));
            const restore = registry.clear();
            const disposables = new lifecycle_1.$jc();
            disposables.add(registry.registerQuickAccessProvider(fastProviderDescriptor));
            disposables.add(registry.registerQuickAccessProvider(slowProviderDescriptor));
            disposables.add(registry.registerQuickAccessProvider(fastAndSlowProviderDescriptor));
            accessor.quickInputService.quickAccess.show('fast');
            assert.strictEqual(fastProviderCalled, true);
            assert.strictEqual(slowProviderCalled, false);
            assert.strictEqual(fastAndSlowProviderCalled, false);
            fastProviderCalled = false;
            accessor.quickInputService.quickAccess.show('slow');
            await (0, async_1.$Hg)(2);
            assert.strictEqual(fastProviderCalled, false);
            assert.strictEqual(slowProviderCalled, true);
            assert.strictEqual(slowProviderCanceled, false);
            assert.strictEqual(fastAndSlowProviderCalled, false);
            slowProviderCalled = false;
            accessor.quickInputService.quickAccess.show('bothFastAndSlow');
            await (0, async_1.$Hg)(2);
            assert.strictEqual(fastProviderCalled, false);
            assert.strictEqual(slowProviderCalled, false);
            assert.strictEqual(fastAndSlowProviderCalled, true);
            assert.strictEqual(fastAndSlowProviderCanceled, false);
            fastAndSlowProviderCalled = false;
            accessor.quickInputService.quickAccess.show('slow');
            accessor.quickInputService.quickAccess.show('bothFastAndSlow');
            accessor.quickInputService.quickAccess.show('fast');
            assert.strictEqual(fastProviderCalled, true);
            assert.strictEqual(slowProviderCalled, true);
            assert.strictEqual(fastAndSlowProviderCalled, true);
            await (0, async_1.$Hg)(2);
            assert.strictEqual(slowProviderCanceled, true);
            assert.strictEqual(fastAndSlowProviderCanceled, true);
            disposables.dispose();
            restore();
        });
        test('quick pick access - pick()', async () => {
            const registry = (platform_1.$8m.as(quickAccess_1.$8p.Quickaccess));
            const restore = registry.clear();
            const disposables = new lifecycle_1.$jc();
            disposables.add(registry.registerQuickAccessProvider(fastProviderDescriptor));
            const result = accessor.quickInputService.quickAccess.pick('fast');
            assert.strictEqual(fastProviderCalled, true);
            assert.ok(result instanceof Promise);
            disposables.dispose();
            restore();
        });
    });
});
//# sourceMappingURL=quickAccess.test.js.map