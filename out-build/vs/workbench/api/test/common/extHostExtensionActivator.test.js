/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/async", "vs/base/common/uri", "vs/platform/extensions/common/extensions", "vs/platform/log/common/log", "vs/workbench/api/common/extHostExtensionActivator", "vs/workbench/services/extensions/common/extensionDescriptionRegistry"], function (require, exports, assert, async_1, uri_1, extensions_1, log_1, extHostExtensionActivator_1, extensionDescriptionRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtensionsActivator', () => {
        const idA = new extensions_1.$Vl(`a`);
        const idB = new extensions_1.$Vl(`b`);
        const idC = new extensions_1.$Vl(`c`);
        test('calls activate only once with sequential activations', async () => {
            const host = new SimpleExtensionsActivatorHost();
            const activator = createActivator(host, [
                desc(idA)
            ]);
            await activator.activateByEvent('*', false);
            assert.deepStrictEqual(host.activateCalls, [idA]);
            await activator.activateByEvent('*', false);
            assert.deepStrictEqual(host.activateCalls, [idA]);
        });
        test('calls activate only once with parallel activations', async () => {
            const extActivation = new ExtensionActivationPromiseSource();
            const host = new PromiseExtensionsActivatorHost([
                [idA, extActivation]
            ]);
            const activator = createActivator(host, [
                desc(idA, [], ['evt1', 'evt2'])
            ]);
            const activate1 = activator.activateByEvent('evt1', false);
            const activate2 = activator.activateByEvent('evt2', false);
            extActivation.resolve();
            await activate1;
            await activate2;
            assert.deepStrictEqual(host.activateCalls, [idA]);
        });
        test('activates dependencies first', async () => {
            const extActivationA = new ExtensionActivationPromiseSource();
            const extActivationB = new ExtensionActivationPromiseSource();
            const host = new PromiseExtensionsActivatorHost([
                [idA, extActivationA],
                [idB, extActivationB]
            ]);
            const activator = createActivator(host, [
                desc(idA, [idB], ['evt1']),
                desc(idB, [], ['evt1']),
            ]);
            const activate = activator.activateByEvent('evt1', false);
            await (0, async_1.$Hg)(0);
            assert.deepStrictEqual(host.activateCalls, [idB]);
            extActivationB.resolve();
            await (0, async_1.$Hg)(0);
            assert.deepStrictEqual(host.activateCalls, [idB, idA]);
            extActivationA.resolve();
            await (0, async_1.$Hg)(0);
            await activate;
            assert.deepStrictEqual(host.activateCalls, [idB, idA]);
        });
        test('Supports having resolved extensions', async () => {
            const host = new SimpleExtensionsActivatorHost();
            const bExt = desc(idB);
            delete bExt.main;
            delete bExt.browser;
            const activator = createActivator(host, [
                desc(idA, [idB])
            ], [bExt]);
            await activator.activateByEvent('*', false);
            assert.deepStrictEqual(host.activateCalls, [idA]);
        });
        test('Supports having external extensions', async () => {
            const extActivationA = new ExtensionActivationPromiseSource();
            const extActivationB = new ExtensionActivationPromiseSource();
            const host = new PromiseExtensionsActivatorHost([
                [idA, extActivationA],
                [idB, extActivationB]
            ]);
            const bExt = desc(idB);
            bExt.api = 'none';
            const activator = createActivator(host, [
                desc(idA, [idB])
            ], [bExt]);
            const activate = activator.activateByEvent('*', false);
            await (0, async_1.$Hg)(0);
            assert.deepStrictEqual(host.activateCalls, [idB]);
            extActivationB.resolve();
            await (0, async_1.$Hg)(0);
            assert.deepStrictEqual(host.activateCalls, [idB, idA]);
            extActivationA.resolve();
            await activate;
            assert.deepStrictEqual(host.activateCalls, [idB, idA]);
        });
        test('Error: activateById with missing extension', async () => {
            const host = new SimpleExtensionsActivatorHost();
            const activator = createActivator(host, [
                desc(idA),
                desc(idB),
            ]);
            let error = undefined;
            try {
                await activator.activateById(idC, { startup: false, extensionId: idC, activationEvent: 'none' });
            }
            catch (err) {
                error = err;
            }
            assert.strictEqual(typeof error === 'undefined', false);
        });
        test('Error: dependency missing', async () => {
            const host = new SimpleExtensionsActivatorHost();
            const activator = createActivator(host, [
                desc(idA, [idB]),
            ]);
            await activator.activateByEvent('*', false);
            assert.deepStrictEqual(host.errors.length, 1);
            assert.deepStrictEqual(host.errors[0][0], idA);
        });
        test('Error: dependency activation failed', async () => {
            const extActivationA = new ExtensionActivationPromiseSource();
            const extActivationB = new ExtensionActivationPromiseSource();
            const host = new PromiseExtensionsActivatorHost([
                [idA, extActivationA],
                [idB, extActivationB]
            ]);
            const activator = createActivator(host, [
                desc(idA, [idB]),
                desc(idB)
            ]);
            const activate = activator.activateByEvent('*', false);
            extActivationB.reject(new Error(`b fails!`));
            await activate;
            assert.deepStrictEqual(host.errors.length, 2);
            assert.deepStrictEqual(host.errors[0][0], idB);
            assert.deepStrictEqual(host.errors[1][0], idA);
        });
        test('issue #144518: Problem with git extension and vscode-icons', async () => {
            const extActivationA = new ExtensionActivationPromiseSource();
            const extActivationB = new ExtensionActivationPromiseSource();
            const extActivationC = new ExtensionActivationPromiseSource();
            const host = new PromiseExtensionsActivatorHost([
                [idA, extActivationA],
                [idB, extActivationB],
                [idC, extActivationC]
            ]);
            const activator = createActivator(host, [
                desc(idA, [idB]),
                desc(idB),
                desc(idC),
            ]);
            activator.activateByEvent('*', false);
            assert.deepStrictEqual(host.activateCalls, [idB, idC]);
            extActivationB.resolve();
            await (0, async_1.$Hg)(0);
            assert.deepStrictEqual(host.activateCalls, [idB, idC, idA]);
            extActivationA.resolve();
        });
        class SimpleExtensionsActivatorHost {
            constructor() {
                this.activateCalls = [];
                this.errors = [];
            }
            onExtensionActivationError(extensionId, error, missingExtensionDependency) {
                this.errors.push([extensionId, error, missingExtensionDependency]);
            }
            actualActivateExtension(extensionId, reason) {
                this.activateCalls.push(extensionId);
                return Promise.resolve(new extHostExtensionActivator_1.$tbc(extHostExtensionActivator_1.$qbc.NONE));
            }
        }
        class PromiseExtensionsActivatorHost extends SimpleExtensionsActivatorHost {
            constructor(a) {
                super();
                this.a = a;
            }
            actualActivateExtension(extensionId, reason) {
                this.activateCalls.push(extensionId);
                for (const [id, promiseSource] of this.a) {
                    if (id.value === extensionId.value) {
                        return promiseSource.promise;
                    }
                }
                throw new Error(`Unexpected!`);
            }
        }
        class ExtensionActivationPromiseSource {
            constructor() {
                this.promise = new Promise((resolve, reject) => {
                    this.a = resolve;
                    this.b = reject;
                });
            }
            resolve() {
                this.a(new extHostExtensionActivator_1.$tbc(extHostExtensionActivator_1.$qbc.NONE));
            }
            reject(err) {
                this.b(err);
            }
        }
        function createActivator(host, extensionDescriptions, otherHostExtensionDescriptions = []) {
            const registry = new extensionDescriptionRegistry_1.$y3b(extensionDescriptionRegistry_1.$A3b, extensionDescriptions);
            const globalRegistry = new extensionDescriptionRegistry_1.$y3b(extensionDescriptionRegistry_1.$A3b, extensionDescriptions.concat(otherHostExtensionDescriptions));
            return new extHostExtensionActivator_1.$vbc(registry, globalRegistry, host, new log_1.$fj());
        }
        function desc(id, deps = [], activationEvents = ['*']) {
            return {
                name: id.value,
                publisher: 'test',
                version: '0.0.0',
                engines: { vscode: '^1.0.0' },
                identifier: id,
                extensionLocation: uri_1.URI.parse(`nothing://nowhere`),
                isBuiltin: false,
                isUnderDevelopment: false,
                isUserBuiltin: false,
                activationEvents,
                main: 'index.js',
                targetPlatform: "undefined" /* TargetPlatform.UNDEFINED */,
                extensionDependencies: deps.map(d => d.value)
            };
        }
    });
});
//# sourceMappingURL=extHostExtensionActivator.test.js.map