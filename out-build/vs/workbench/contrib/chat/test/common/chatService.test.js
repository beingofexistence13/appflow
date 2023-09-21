/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/serviceCollection", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/workspace/common/workspace", "vs/workbench/common/views", "vs/workbench/contrib/chat/common/chatAgents", "vs/workbench/contrib/chat/common/chatContributionService", "vs/workbench/contrib/chat/common/chatServiceImpl", "vs/workbench/contrib/chat/common/chatSlashCommands", "vs/workbench/contrib/chat/common/chatVariables", "vs/workbench/services/extensions/common/extensions", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert, cancellation_1, event_1, lifecycle_1, utils_1, contextkey_1, descriptors_1, serviceCollection_1, instantiationServiceMock_1, mockKeybindingService_1, log_1, storage_1, telemetry_1, telemetryUtils_1, workspace_1, views_1, chatAgents_1, chatContributionService_1, chatServiceImpl_1, chatSlashCommands_1, chatVariables_1, extensions_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SimpleTestProvider extends lifecycle_1.$kc {
        static { this.a = 0; }
        constructor(id) {
            super();
            this.id = id;
            this.lastInitialState = undefined;
            this.displayName = 'Test';
            this.b = this.B(new event_1.$fd());
        }
        prepareSession(initialState) {
            this.lastInitialState = initialState;
            return Promise.resolve({
                id: SimpleTestProvider.a++,
                username: 'test',
                responderUsername: 'test',
                requesterUsername: 'test',
                onDidChangeState: this.b.event
            });
        }
        changeState(state) {
            this.b.fire(state);
        }
        async provideReply(request) {
            return { session: request.session, followups: [] };
        }
    }
    suite('Chat', () => {
        const testDisposables = (0, utils_1.$bT)();
        let storageService;
        let instantiationService;
        setup(async () => {
            instantiationService = testDisposables.add(new instantiationServiceMock_1.$L0b(new serviceCollection_1.$zh(
            // [IChatSlashCommandService, new SyncDescriptor<any>(ChatSlashCommandService)],
            [chatVariables_1.$DH, new descriptors_1.$yh(chatVariables_1.$EH)])));
            instantiationService.stub(storage_1.$Vo, storageService = testDisposables.add(new workbenchTestServices_1.$7dc()));
            instantiationService.stub(log_1.$5i, new log_1.$fj());
            instantiationService.stub(telemetry_1.$9k, telemetryUtils_1.$bo);
            instantiationService.stub(extensions_1.$MF, new workbenchTestServices_1.$aec());
            instantiationService.stub(contextkey_1.$3i, new mockKeybindingService_1.$S0b());
            instantiationService.stub(views_1.$$E, new workbenchTestServices_1.$aec());
            instantiationService.stub(chatContributionService_1.$fsb, new workbenchTestServices_1.$aec());
            instantiationService.stub(workspace_1.$Kh, new workbenchTestServices_1.$6dc());
            instantiationService.stub(chatSlashCommands_1.$WJ, testDisposables.add(instantiationService.createInstance(chatSlashCommands_1.$XJ)));
            instantiationService.stub(chatAgents_1.$rH, testDisposables.add(instantiationService.createInstance(chatAgents_1.$sH)));
        });
        test('retrieveSession', async () => {
            const testService = testDisposables.add(instantiationService.createInstance(chatServiceImpl_1.$YIb));
            const provider1 = testDisposables.add(new SimpleTestProvider('provider1'));
            const provider2 = testDisposables.add(new SimpleTestProvider('provider2'));
            testDisposables.add(testService.registerProvider(provider1));
            testDisposables.add(testService.registerProvider(provider2));
            const session1 = testDisposables.add(testService.startSession('provider1', cancellation_1.CancellationToken.None));
            await session1.waitForInitialization();
            session1.addRequest('request 1');
            const session2 = testDisposables.add(testService.startSession('provider2', cancellation_1.CancellationToken.None));
            await session2.waitForInitialization();
            session2.addRequest('request 2');
            assert.strictEqual(provider1.lastInitialState, undefined);
            assert.strictEqual(provider2.lastInitialState, undefined);
            provider1.changeState({ state: 'provider1_state' });
            provider2.changeState({ state: 'provider2_state' });
            storageService.flush();
            const testService2 = testDisposables.add(instantiationService.createInstance(chatServiceImpl_1.$YIb));
            testDisposables.add(testService2.registerProvider(provider1));
            testDisposables.add(testService2.registerProvider(provider2));
            const retrieved1 = testDisposables.add(testService2.getOrRestoreSession(session1.sessionId));
            await retrieved1.waitForInitialization();
            const retrieved2 = testDisposables.add(testService2.getOrRestoreSession(session2.sessionId));
            await retrieved2.waitForInitialization();
            assert.deepStrictEqual(provider1.lastInitialState, { state: 'provider1_state' });
            assert.deepStrictEqual(provider2.lastInitialState, { state: 'provider2_state' });
        });
        test('Handles failed session startup', async () => {
            function getFailProvider(providerId) {
                return new class {
                    constructor() {
                        this.id = providerId;
                        this.displayName = 'Test';
                        this.lastInitialState = undefined;
                    }
                    prepareSession(initialState) {
                        throw new Error('Failed to start session');
                    }
                    async provideReply(request) {
                        return { session: request.session, followups: [] };
                    }
                };
            }
            const testService = testDisposables.add(instantiationService.createInstance(chatServiceImpl_1.$YIb));
            const provider1 = getFailProvider('provider1');
            testDisposables.add(testService.registerProvider(provider1));
            const session1 = testDisposables.add(testService.startSession('provider1', cancellation_1.CancellationToken.None));
            await assert.rejects(() => session1.waitForInitialization());
        });
        test('Can\'t register same provider id twice', async () => {
            const testService = testDisposables.add(instantiationService.createInstance(chatServiceImpl_1.$YIb));
            const id = 'testProvider';
            testDisposables.add(testService.registerProvider({
                id,
                displayName: 'Test',
                prepareSession: function (initialState, token) {
                    throw new Error('Function not implemented.');
                },
                provideReply: function (request, progress, token) {
                    throw new Error('Function not implemented.');
                }
            }));
            assert.throws(() => {
                testDisposables.add(testService.registerProvider({
                    id,
                    displayName: 'Test',
                    prepareSession: function (initialState, token) {
                        throw new Error('Function not implemented.');
                    },
                    provideReply: function (request, progress, token) {
                        throw new Error('Function not implemented.');
                    }
                }));
            }, 'Expected to throw for dupe provider');
        });
        test('getSlashCommands', async () => {
            const testService = testDisposables.add(instantiationService.createInstance(chatServiceImpl_1.$YIb));
            const provider = testDisposables.add(new class extends SimpleTestProvider {
                constructor() {
                    super('testProvider');
                }
                provideSlashCommands() {
                    return [
                        {
                            command: 'command',
                            detail: 'detail',
                            sortText: 'sortText',
                        }
                    ];
                }
            });
            testDisposables.add(testService.registerProvider(provider));
            const model = testDisposables.add(testService.startSession('testProvider', cancellation_1.CancellationToken.None));
            const commands = await testService.getSlashCommands(model.sessionId, cancellation_1.CancellationToken.None);
            assert.strictEqual(commands?.length, 1);
            assert.strictEqual(commands?.[0].command, 'command');
            assert.strictEqual(commands?.[0].detail, 'detail');
            assert.strictEqual(commands?.[0].sortText, 'sortText');
        });
        test('sendRequestToProvider', async () => {
            const testService = testDisposables.add(instantiationService.createInstance(chatServiceImpl_1.$YIb));
            testDisposables.add(testService.registerProvider(testDisposables.add(new SimpleTestProvider('testProvider'))));
            const model = testDisposables.add(testService.startSession('testProvider', cancellation_1.CancellationToken.None));
            assert.strictEqual(model.getRequests().length, 0);
            await testService.sendRequestToProvider(model.sessionId, { message: 'test request' });
            assert.strictEqual(model.getRequests().length, 1);
        });
        test('addCompleteRequest', async () => {
            const testService = testDisposables.add(instantiationService.createInstance(chatServiceImpl_1.$YIb));
            testDisposables.add(testService.registerProvider(testDisposables.add(new SimpleTestProvider('testProvider'))));
            const model = testDisposables.add(testService.startSession('testProvider', cancellation_1.CancellationToken.None));
            assert.strictEqual(model.getRequests().length, 0);
            await testService.addCompleteRequest(model.sessionId, 'test request', { message: 'test response' });
            assert.strictEqual(model.getRequests().length, 1);
            assert.ok(model.getRequests()[0].response);
            assert.strictEqual(model.getRequests()[0].response?.response.asString(), 'test response');
        });
    });
});
//# sourceMappingURL=chatService.test.js.map