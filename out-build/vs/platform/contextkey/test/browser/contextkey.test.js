/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/async", "vs/base/common/uri", "vs/base/test/common/mock", "vs/base/test/common/utils", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/contextkey/browser/contextKeyService", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/serviceCollection", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/telemetry/common/telemetry"], function (require, exports, assert, async_1, uri_1, mock_1, utils_1, configuration_1, testConfigurationService_1, contextKeyService_1, contextkey_1, serviceCollection_1, instantiationServiceMock_1, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ContextKeyService', () => {
        const testDisposables = (0, utils_1.$bT)();
        test('updateParent', () => {
            const root = testDisposables.add(new contextKeyService_1.$xtb(new testConfigurationService_1.$G0b()));
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
            const root = testDisposables.add(new contextKeyService_1.$xtb(new testConfigurationService_1.$G0b()));
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
            const configurationService = new testConfigurationService_1.$G0b();
            const contextKeyService = testDisposables.add(new contextKeyService_1.$xtb(configurationService));
            const instantiationService = testDisposables.add(new instantiationServiceMock_1.$L0b(new serviceCollection_1.$zh([configuration_1.$8h, configurationService], [contextkey_1.$3i, contextKeyService], [telemetry_1.$9k, new class extends (0, mock_1.$rT)() {
                    async publicLog2() {
                        //
                    }
                }])));
            const uri = uri_1.URI.parse('test://abc');
            contextKeyService.createKey('notebookCellResource', undefined).set(uri.toString());
            instantiationService.invokeFunction(contextKeyService_1.$ytb, 'jupyter.runByLineCells', JSON.parse(JSON.stringify([uri])));
            const expr = contextkey_1.$Ii.in('notebookCellResource', 'jupyter.runByLineCells');
            assert.deepStrictEqual(contextKeyService.contextMatchesRules(expr), true);
        });
        test('suppress update event from parent when one key is overridden by child', () => {
            const root = testDisposables.add(new contextKeyService_1.$xtb(new testConfigurationService_1.$G0b()));
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
            const root = testDisposables.add(new contextKeyService_1.$xtb(new testConfigurationService_1.$G0b()));
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
            const root = testDisposables.add(new contextKeyService_1.$xtb(new testConfigurationService_1.$G0b()));
            const child = testDisposables.add(root.createScoped(document.createElement('div')));
            root.createKey('testA', 1);
            root.createKey('testB', 2);
            root.createKey('testC', 3);
            child.createKey('testA', 4);
            child.createKey('testB', 5);
            child.createKey('testD', 6);
            const def = new async_1.$2g();
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
//# sourceMappingURL=contextkey.test.js.map