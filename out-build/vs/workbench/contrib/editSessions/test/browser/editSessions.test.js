/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/files/common/files", "vs/platform/files/common/fileService", "vs/base/common/network", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/log/common/log", "vs/workbench/contrib/editSessions/browser/editSessions.contribution", "vs/workbench/services/progress/browser/progressService", "vs/platform/progress/common/progress", "vs/workbench/contrib/scm/common/scm", "vs/workbench/contrib/scm/common/scmService", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/configuration/common/configuration", "vs/platform/workspace/common/workspace", "vs/base/test/common/mock", "sinon", "assert", "vs/workbench/contrib/editSessions/common/editSessions", "vs/base/common/uri", "vs/base/common/resources", "vs/platform/notification/common/notification", "vs/platform/notification/test/common/testNotificationService", "vs/workbench/test/browser/workbenchTestServices", "vs/platform/environment/common/environment", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/contextkey/common/contextkey", "vs/platform/theme/common/themeService", "vs/base/common/event", "vs/workbench/common/views", "vs/editor/common/services/resolverService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/editor/common/editorService", "vs/base/common/cancellation", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/extensions/common/extensions", "vs/platform/workspace/common/editSessions", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/product/common/productService", "vs/platform/storage/common/storage", "vs/workbench/test/common/workbenchTestServices", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/workbench/services/workspaces/common/workspaceIdentityService"], function (require, exports, lifecycle_1, files_1, fileService_1, network_1, inMemoryFilesystemProvider_1, instantiationServiceMock_1, log_1, editSessions_contribution_1, progressService_1, progress_1, scm_1, scmService_1, testConfigurationService_1, configuration_1, workspace_1, mock_1, sinon, assert, editSessions_1, uri_1, resources_1, notification_1, testNotificationService_1, workbenchTestServices_1, environment_1, mockKeybindingService_1, contextkey_1, themeService_1, event_1, views_1, resolverService_1, lifecycle_2, dialogs_1, editorService_1, cancellation_1, telemetry_1, telemetryUtils_1, remoteAgentService_1, extensions_1, editSessions_2, userDataProfile_1, productService_1, storage_1, workbenchTestServices_2, uriIdentity_1, uriIdentityService_1, workspaceIdentityService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const folderName = 'test-folder';
    const folderUri = uri_1.URI.file(`/${folderName}`);
    suite('Edit session sync', () => {
        let instantiationService;
        let editSessionsContribution;
        let fileService;
        let sandbox;
        const disposables = new lifecycle_1.$jc();
        suiteSetup(() => {
            sandbox = sinon.createSandbox();
            instantiationService = new instantiationServiceMock_1.$L0b();
            // Set up filesystem
            const logService = new log_1.$fj();
            fileService = disposables.add(new fileService_1.$Dp(logService));
            const fileSystemProvider = disposables.add(new inMemoryFilesystemProvider_1.$rAb());
            fileService.registerProvider(network_1.Schemas.file, fileSystemProvider);
            // Stub out all services
            instantiationService.stub(editSessions_1.$VZb, logService);
            instantiationService.stub(files_1.$6j, fileService);
            instantiationService.stub(lifecycle_2.$7y, new class extends (0, mock_1.$rT)() {
                constructor() {
                    super(...arguments);
                    this.onWillShutdown = event_1.Event.None;
                }
            });
            instantiationService.stub(notification_1.$Yu, new testNotificationService_1.$I0b());
            instantiationService.stub(productService_1.$kj, { 'editSessions.store': { url: 'https://test.com', canSwitch: true, authenticationProviders: {} } });
            instantiationService.stub(storage_1.$Vo, new workbenchTestServices_2.$7dc());
            instantiationService.stub(uriIdentity_1.$Ck, new uriIdentityService_1.$pr(fileService));
            instantiationService.stub(editSessions_1.$UZb, new class extends (0, mock_1.$rT)() {
                constructor() {
                    super(...arguments);
                    this.onDidSignIn = event_1.Event.None;
                    this.onDidSignOut = event_1.Event.None;
                }
            });
            instantiationService.stub(extensions_1.$MF, new class extends (0, mock_1.$rT)() {
                constructor() {
                    super(...arguments);
                    this.onDidChangeExtensions = event_1.Event.None;
                }
            });
            instantiationService.stub(progress_1.$2u, progressService_1.$uyb);
            instantiationService.stub(scm_1.$fI, scmService_1.$wPb);
            instantiationService.stub(environment_1.$Ih, workbenchTestServices_1.$qec);
            instantiationService.stub(telemetry_1.$9k, telemetryUtils_1.$bo);
            instantiationService.stub(dialogs_1.$oA, new class extends (0, mock_1.$rT)() {
                async prompt(prompt) {
                    const result = prompt.buttons?.[0].run({ checkboxChecked: false });
                    return { result };
                }
                async confirm() {
                    return { confirmed: false };
                }
            });
            instantiationService.stub(remoteAgentService_1.$jm, new class extends (0, mock_1.$rT)() {
                async getEnvironment() {
                    return null;
                }
            });
            instantiationService.stub(configuration_1.$8h, new testConfigurationService_1.$G0b({ workbench: { experimental: { editSessions: { enabled: true } } } }));
            instantiationService.stub(workspace_1.$Kh, new class extends (0, mock_1.$rT)() {
                getWorkspace() {
                    return {
                        id: 'workspace-id',
                        folders: [{
                                uri: folderUri,
                                name: folderName,
                                index: 0,
                                toResource: (relativePath) => (0, resources_1.$ig)(folderUri, relativePath)
                            }]
                    };
                }
                getWorkbenchState() {
                    return 2 /* WorkbenchState.FOLDER */;
                }
            });
            // Stub repositories
            instantiationService.stub(scm_1.$fI, '_repositories', new Map());
            instantiationService.stub(contextkey_1.$3i, new mockKeybindingService_1.$S0b());
            instantiationService.stub(themeService_1.$gv, new class extends (0, mock_1.$rT)() {
                constructor() {
                    super(...arguments);
                    this.onDidColorThemeChange = event_1.Event.None;
                    this.onDidFileIconThemeChange = event_1.Event.None;
                }
            });
            instantiationService.stub(views_1.$_E, {
                onDidChangeLocation: event_1.Event.None
            });
            instantiationService.stub(resolverService_1.$uA, new class extends (0, mock_1.$rT)() {
                constructor() {
                    super(...arguments);
                    this.registerTextModelContentProvider = () => ({ dispose: () => { } });
                }
            });
            instantiationService.stub(editorService_1.$9C, new class extends (0, mock_1.$rT)() {
                constructor() {
                    super(...arguments);
                    this.saveAll = async (_options) => { return { success: true, editors: [] }; };
                }
            });
            instantiationService.stub(editSessions_2.$8z, new class extends (0, mock_1.$rT)() {
                async getEditSessionIdentifier() {
                    return 'test-identity';
                }
            });
            instantiationService.set(workspaceIdentityService_1.$d1b, instantiationService.createInstance(workspaceIdentityService_1.$e1b));
            instantiationService.stub(userDataProfile_1.$Ek, new class extends (0, mock_1.$rT)() {
                constructor() {
                    super(...arguments);
                    this.defaultProfile = {
                        id: 'default',
                        name: 'Default',
                        isDefault: true,
                        location: uri_1.URI.file('location'),
                        globalStorageHome: uri_1.URI.file('globalStorageHome'),
                        settingsResource: uri_1.URI.file('settingsResource'),
                        keybindingsResource: uri_1.URI.file('keybindingsResource'),
                        tasksResource: uri_1.URI.file('tasksResource'),
                        snippetsHome: uri_1.URI.file('snippetsHome'),
                        extensionsResource: uri_1.URI.file('extensionsResource'),
                        cacheHome: uri_1.URI.file('cacheHome'),
                    };
                }
            });
            editSessionsContribution = instantiationService.createInstance(editSessions_contribution_1.$g1b);
        });
        teardown(() => {
            sinon.restore();
            disposables.clear();
        });
        test('Can apply edit session', async function () {
            const fileUri = (0, resources_1.$ig)(folderUri, 'dir1', 'README.md');
            const fileContents = '# readme';
            const editSession = {
                version: 1,
                folders: [
                    {
                        name: folderName,
                        workingChanges: [
                            {
                                relativeFilePath: 'dir1/README.md',
                                fileType: editSessions_1.FileType.File,
                                contents: fileContents,
                                type: editSessions_1.ChangeType.Addition
                            }
                        ]
                    }
                ]
            };
            // Stub sync service to return edit session data
            const readStub = sandbox.stub().returns({ content: JSON.stringify(editSession), ref: '0' });
            instantiationService.stub(editSessions_1.$UZb, 'read', readStub);
            // Create root folder
            await fileService.createFolder(folderUri);
            // Resume edit session
            await editSessionsContribution.resumeEditSession();
            // Verify edit session was correctly applied
            assert.equal((await fileService.readFile(fileUri)).value.toString(), fileContents);
        });
        test('Edit session not stored if there are no edits', async function () {
            const writeStub = sandbox.stub();
            instantiationService.stub(editSessions_1.$UZb, 'write', writeStub);
            // Create root folder
            await fileService.createFolder(folderUri);
            await editSessionsContribution.storeEditSession(true, new cancellation_1.$pd().token);
            // Verify that we did not attempt to write the edit session
            assert.equal(writeStub.called, false);
        });
    });
});
//# sourceMappingURL=editSessions.test.js.map