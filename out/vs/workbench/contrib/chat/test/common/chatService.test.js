/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/serviceCollection", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/workspace/common/workspace", "vs/workbench/common/views", "vs/workbench/contrib/chat/common/chatAgents", "vs/workbench/contrib/chat/common/chatContributionService", "vs/workbench/contrib/chat/common/chatServiceImpl", "vs/workbench/contrib/chat/common/chatSlashCommands", "vs/workbench/contrib/chat/common/chatVariables", "vs/workbench/services/extensions/common/extensions", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert, cancellation_1, event_1, lifecycle_1, utils_1, contextkey_1, descriptors_1, serviceCollection_1, instantiationServiceMock_1, mockKeybindingService_1, log_1, storage_1, telemetry_1, telemetryUtils_1, workspace_1, views_1, chatAgents_1, chatContributionService_1, chatServiceImpl_1, chatSlashCommands_1, chatVariables_1, extensions_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SimpleTestProvider extends lifecycle_1.Disposable {
        static { this.sessionId = 0; }
        constructor(id) {
            super();
            this.id = id;
            this.lastInitialState = undefined;
            this.displayName = 'Test';
            this._onDidChangeState = this._register(new event_1.Emitter());
        }
        prepareSession(initialState) {
            this.lastInitialState = initialState;
            return Promise.resolve({
                id: SimpleTestProvider.sessionId++,
                username: 'test',
                responderUsername: 'test',
                requesterUsername: 'test',
                onDidChangeState: this._onDidChangeState.event
            });
        }
        changeState(state) {
            this._onDidChangeState.fire(state);
        }
        async provideReply(request) {
            return { session: request.session, followups: [] };
        }
    }
    suite('Chat', () => {
        const testDisposables = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        let storageService;
        let instantiationService;
        setup(async () => {
            instantiationService = testDisposables.add(new instantiationServiceMock_1.TestInstantiationService(new serviceCollection_1.ServiceCollection(
            // [IChatSlashCommandService, new SyncDescriptor<any>(ChatSlashCommandService)],
            [chatVariables_1.IChatVariablesService, new descriptors_1.SyncDescriptor(chatVariables_1.ChatVariablesService)])));
            instantiationService.stub(storage_1.IStorageService, storageService = testDisposables.add(new workbenchTestServices_1.TestStorageService()));
            instantiationService.stub(log_1.ILogService, new log_1.NullLogService());
            instantiationService.stub(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
            instantiationService.stub(extensions_1.IExtensionService, new workbenchTestServices_1.TestExtensionService());
            instantiationService.stub(contextkey_1.IContextKeyService, new mockKeybindingService_1.MockContextKeyService());
            instantiationService.stub(views_1.IViewsService, new workbenchTestServices_1.TestExtensionService());
            instantiationService.stub(chatContributionService_1.IChatContributionService, new workbenchTestServices_1.TestExtensionService());
            instantiationService.stub(workspace_1.IWorkspaceContextService, new workbenchTestServices_1.TestContextService());
            instantiationService.stub(chatSlashCommands_1.IChatSlashCommandService, testDisposables.add(instantiationService.createInstance(chatSlashCommands_1.ChatSlashCommandService)));
            instantiationService.stub(chatAgents_1.IChatAgentService, testDisposables.add(instantiationService.createInstance(chatAgents_1.ChatAgentService)));
        });
        test('retrieveSession', async () => {
            const testService = testDisposables.add(instantiationService.createInstance(chatServiceImpl_1.ChatService));
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
            const testService2 = testDisposables.add(instantiationService.createInstance(chatServiceImpl_1.ChatService));
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
            const testService = testDisposables.add(instantiationService.createInstance(chatServiceImpl_1.ChatService));
            const provider1 = getFailProvider('provider1');
            testDisposables.add(testService.registerProvider(provider1));
            const session1 = testDisposables.add(testService.startSession('provider1', cancellation_1.CancellationToken.None));
            await assert.rejects(() => session1.waitForInitialization());
        });
        test('Can\'t register same provider id twice', async () => {
            const testService = testDisposables.add(instantiationService.createInstance(chatServiceImpl_1.ChatService));
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
            const testService = testDisposables.add(instantiationService.createInstance(chatServiceImpl_1.ChatService));
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
            const testService = testDisposables.add(instantiationService.createInstance(chatServiceImpl_1.ChatService));
            testDisposables.add(testService.registerProvider(testDisposables.add(new SimpleTestProvider('testProvider'))));
            const model = testDisposables.add(testService.startSession('testProvider', cancellation_1.CancellationToken.None));
            assert.strictEqual(model.getRequests().length, 0);
            await testService.sendRequestToProvider(model.sessionId, { message: 'test request' });
            assert.strictEqual(model.getRequests().length, 1);
        });
        test('addCompleteRequest', async () => {
            const testService = testDisposables.add(instantiationService.createInstance(chatServiceImpl_1.ChatService));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFNlcnZpY2UudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NoYXQvdGVzdC9jb21tb24vY2hhdFNlcnZpY2UudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQTRCaEcsTUFBTSxrQkFBbUIsU0FBUSxzQkFBVTtpQkFDM0IsY0FBUyxHQUFHLENBQUMsQUFBSixDQUFLO1FBUTdCLFlBQXFCLEVBQVU7WUFDOUIsS0FBSyxFQUFFLENBQUM7WUFEWSxPQUFFLEdBQUYsRUFBRSxDQUFRO1lBTi9CLHFCQUFnQixHQUFHLFNBQVMsQ0FBQztZQUVwQixnQkFBVyxHQUFHLE1BQU0sQ0FBQztZQUV0QixzQkFBaUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFFLENBQUMsQ0FBQztRQUkxRCxDQUFDO1FBRUQsY0FBYyxDQUFDLFlBQWlCO1lBQy9CLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxZQUFZLENBQUM7WUFDckMsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFRO2dCQUM3QixFQUFFLEVBQUUsa0JBQWtCLENBQUMsU0FBUyxFQUFFO2dCQUNsQyxRQUFRLEVBQUUsTUFBTTtnQkFDaEIsaUJBQWlCLEVBQUUsTUFBTTtnQkFDekIsaUJBQWlCLEVBQUUsTUFBTTtnQkFDekIsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUs7YUFDOUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELFdBQVcsQ0FBQyxLQUFVO1lBQ3JCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEMsQ0FBQztRQUVELEtBQUssQ0FBQyxZQUFZLENBQUMsT0FBcUI7WUFDdkMsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxFQUFF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