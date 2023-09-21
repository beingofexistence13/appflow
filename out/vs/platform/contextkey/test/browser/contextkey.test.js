/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/async", "vs/base/common/uri", "vs/base/test/common/mock", "vs/base/test/common/utils", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/contextkey/browser/contextKeyService", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/serviceCollection", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/telemetry/common/telemetry"], function (require, exports, assert, async_1, uri_1, mock_1, utils_1, configuration_1, testConfigurationService_1, contextKeyService_1, contextkey_1, serviceCollection_1, instantiationServiceMock_1, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ContextKeyService', () => {
        const testDisposables = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('updateParent', () => {
            const root = testDisposables.add(new contextKeyService_1.ContextKeyService(new testConfigurationService_1.TestConfigurationService()));
            const parent1 = testDisposables.add(root.createScoped(document.createElement('div')));
            const parent2 = testDisposables.add(root.createScoped(document.createElement('div')));
            const child = testDisposables.add(parent1.createScoped(document.createElement('div')));
            parent1.createKey('testA', 1);
            parent1.createKey('testB', 2);
            parent1.createKey('testD', 0);
            parent2.createKey('testA', 3);
            parent2.createKey('testC', 4);
            parent2.createKey('testD', 0);
            let complete;
            let reject;
            const p = new Promise((_complete, _reject) => {
                complete = _complete;
                reject = _reject;
            });
            testDisposables.add(child.onDidChangeContext(e => {
                try {
                    assert.ok(e.affectsSome(new Set(['testA'])), 'testA changed');
                    assert.ok(e.affectsSome(new Set(['testB'])), 'testB changed');
                    assert.ok(e.affectsSome(new Set(['testC'])), 'testC changed');
                    assert.ok(!e.affectsSome(new Set(['testD'])), 'testD did not change');
                    assert.strictEqual(child.getContextKeyValue('testA'), 3);
                    assert.strictEqual(child.getContextKeyValue('testB'), undefined);
                    assert.strictEqual(child.getContextKeyValue('testC'), 4);
                    assert.strictEqual(child.getContextKeyValue('testD'), 0);
                }
                catch (err) {
                    reject(err);
                    return;
                }
                complete();
            }));
            child.updateParent(parent2);
            return p;
        });
        test('updateParent to same service', () => {
            const root = testDisposables.add(new contextKeyService_1.ContextKeyService(new testConfigurationService_1.TestConfigurationService()));
            const parent1 = testDisposables.add(root.createScoped(document.createElement('div')));
            const child = testDisposables.add(parent1.createScoped(document.createElement('div')));
            parent1.createKey('testA', 1);
            parent1.createKey('testB', 2);
            parent1.createKey('testD', 0);
            let eventFired = false;
            testDisposables.add(child.onDidChangeContext(e => {
                eventFired = true;
            }));
            child.updateParent(parent1);
            assert.strictEqual(eventFired, false);
        });
        test('issue #147732: URIs as context values', () => {
            const configurationService = new testConfigurationService_1.TestConfigurationService();
            const contextKeyService = testDisposables.add(new contextKeyService_1.ContextKeyService(configurationService));
            const instantiationService = testDisposables.add(new instantiationServiceMock_1.TestInstantiationService(new serviceCollection_1.ServiceCollection([configuration_1.IConfigurationService, configurationService], [contextkey_1.IContextKeyService, contextKeyService], [telemetry_1.ITelemetryService, new class extends (0, mock_1.mock)() {
                    async publicLog2() {
                        //
                    }
                }])));
            const uri = uri_1.URI.parse('test://abc');
            contextKeyService.createKey('notebookCellResource', undefined).set(uri.toString());
            instantiationService.invokeFunction(contextKeyService_1.setContext, 'jupyter.runByLineCells', JSON.parse(JSON.stringify([uri])));
            const expr = contextkey_1.ContextKeyExpr.in('notebookCellResource', 'jupyter.runByLineCells');
            assert.deepStrictEqual(contextKeyService.contextMatchesRules(expr), true);
        });
        test('suppress update event from parent when one key is overridden by child', () => {
            const root = testDisposables.add(new contextKeyService_1.ContextKeyService(new testConfigurationService_1.TestConfigurationService()));
            const child = testDisposables.add(root.createScoped(document.createElement('div')));
            root.createKey('testA', 1);
            child.createKey('testA', 4);
            let fired = false;
            const event = testDisposables.add(child.onDidChangeContext(e => fired = true));
            root.setContext('testA', 10);
            assert.strictEqual(fired, false, 'Should not fire event when overridden key is updated in parent');
            event.dispose();
        });
        test('suppress update event from parent when all keys are overridden by child', () => {
            const root = testDisposables.add(new contextKeyService_1.ContextKeyService(new testConfigurationService_1.TestConfigurationService()));
            const child = testDisposables.add(root.createScoped(document.createElement('div')));
            root.createKey('testA', 1);
            root.createKey('testB', 2);
            root.createKey('testC', 3);
            child.createKey('testA', 4);
            child.createKey('testB', 5);
            child.createKey('testD', 6);
            let fired = false;
            const event = testDisposables.add(child.onDidChangeContext(e => fired = true));
            root.bufferChangeEvents(() => {
                root.setContext('testA', 10);
                root.setContext('testB', 20);
                root.setContext('testD', 30);
            });
            assert.strictEqual(fired, false, 'Should not fire event when overridden key is updated in parent');
            event.dispose();
        });
        test('pass through update event from parent when one key is not overridden by child', () => {
            const root = testDisposables.add(new contextKeyService_1.ContextKeyService(new testConfigurationService_1.TestConfigurationService()));
            const child = testDisposables.add(root.createScoped(document.createElement('div')));
            root.createKey('testA', 1);
            root.createKey('testB', 2);
            root.createKey('testC', 3);
            child.createKey('testA', 4);
            child.createKey('testB', 5);
            child.createKey('testD', 6);
            const def = new async_1.DeferredPromise();
            testDisposables.add(child.onDidChangeContext(e => {
                try {
                    assert.ok(e.affectsSome(new Set(['testA'])), 'testA changed');
                    assert.ok(e.affectsSome(new Set(['testB'])), 'testB changed');
                    assert.ok(e.affectsSome(new Set(['testC'])), 'testC changed');
                }
                catch (err) {
                    def.error(err);
                    return;
                }
                def.complete(undefined);
            }));
            root.bufferChangeEvents(() => {
                root.setContext('testA', 10);
                root.setContext('testB', 20);
                root.setContext('testC', 30);
            });
            return def.p;
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dGtleS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vY29udGV4dGtleS90ZXN0L2Jyb3dzZXIvY29udGV4dGtleS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBZWhHLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLEVBQUU7UUFDL0IsTUFBTSxlQUFlLEdBQUcsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRWxFLElBQUksQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFO1lBQ3pCLE1BQU0sSUFBSSxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxxQ0FBaUIsQ0FBQyxJQUFJLG1EQUF3QixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLE1BQU0sT0FBTyxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RixNQUFNLE9BQU8sR0FBRyxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFdEYsTUFBTSxLQUFLLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZGLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzlCLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzlCLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRTlCLE9BQU8sQ0FBQyxTQUFTLENBQUMs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