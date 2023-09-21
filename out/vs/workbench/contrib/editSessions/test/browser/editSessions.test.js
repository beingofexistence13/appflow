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
        const disposables = new lifecycle_1.DisposableStore();
        suiteSetup(() => {
            sandbox = sinon.createSandbox();
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            // Set up filesystem
            const logService = new log_1.NullLogService();
            fileService = disposables.add(new fileService_1.FileService(logService));
            const fileSystemProvider = disposables.add(new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider());
            fileService.registerProvider(network_1.Schemas.file, fileSystemProvider);
            // Stub out all services
            instantiationService.stub(editSessions_1.IEditSessionsLogService, logService);
            instantiationService.stub(files_1.IFileService, fileService);
            instantiationService.stub(lifecycle_2.ILifecycleService, new class extends (0, mock_1.mock)() {
                constructor() {
                    super(...arguments);
                    this.onWillShutdown = event_1.Event.None;
                }
            });
            instantiationService.stub(notification_1.INotificationService, new testNotificationService_1.TestNotificationService());
            instantiationService.stub(productService_1.IProductService, { 'editSessions.store': { url: 'https://test.com', canSwitch: true, authenticationProviders: {} } });
            instantiationService.stub(storage_1.IStorageService, new workbenchTestServices_2.TestStorageService());
            instantiationService.stub(uriIdentity_1.IUriIdentityService, new uriIdentityService_1.UriIdentityService(fileService));
            instantiationService.stub(editSessions_1.IEditSessionsStorageService, new class extends (0, mock_1.mock)() {
                constructor() {
                    super(...arguments);
                    this.onDidSignIn = event_1.Event.None;
                    this.onDidSignOut = event_1.Event.None;
                }
            });
            instantiationService.stub(extensions_1.IExtensionService, new class extends (0, mock_1.mock)() {
                constructor() {
                    super(...arguments);
                    this.onDidChangeExtensions = event_1.Event.None;
                }
            });
            instantiationService.stub(progress_1.IProgressService, progressService_1.ProgressService);
            instantiationService.stub(scm_1.ISCMService, scmService_1.SCMService);
            instantiationService.stub(environment_1.IEnvironmentService, workbenchTestServices_1.TestEnvironmentService);
            instantiationService.stub(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
            instantiationService.stub(dialogs_1.IDialogService, new class extends (0, mock_1.mock)() {
                async prompt(prompt) {
                    const result = prompt.buttons?.[0].run({ checkboxChecked: false });
                    return { result };
                }
                async confirm() {
                    return { confirmed: false };
                }
            });
            instantiationService.stub(remoteAgentService_1.IRemoteAgentService, new class extends (0, mock_1.mock)() {
                async getEnvironment() {
                    return null;
                }
            });
            instantiationService.stub(configuration_1.IConfigurationService, new testConfigurationService_1.TestConfigurationService({ workbench: { experimental: { editSessions: { enabled: true } } } }));
            instantiationService.stub(workspace_1.IWorkspaceContextService, new class extends (0, mock_1.mock)() {
                getWorkspace() {
                    return {
                        id: 'workspace-id',
                        folders: [{
                                uri: folderUri,
                                name: folderName,
                                index: 0,
                                toResource: (relativePath) => (0, resources_1.joinPath)(folderUri, relativePath)
                            }]
                    };
                }
                getWorkbenchState() {
                    return 2 /* WorkbenchState.FOLDER */;
                }
            });
            // Stub repositories
            instantiationService.stub(scm_1.ISCMService, '_repositories', new Map());
            instantiationService.stub(contextkey_1.IContextKeyService, new mockKeybindingService_1.MockContextKeyService());
            instantiationService.stub(themeService_1.IThemeService, new class extends (0, mock_1.mock)() {
                constructor() {
                    super(...arguments);
                    this.onDidColorThemeChange = event_1.Event.None;
                    this.onDidFileIconThemeChange = event_1.Event.None;
                }
            });
            instantiationService.stub(views_1.IViewDescriptorService, {
                onDidChangeLocation: event_1.Event.None
            });
            instantiationService.stub(resolverService_1.ITextModelService, new class extends (0, mock_1.mock)() {
                constructor() {
                    super(...arguments);
                    this.registerTextModelContentProvider = () => ({ dispose: () => { } });
                }
            });
            instantiationService.stub(editorService_1.IEditorService, new class extends (0, mock_1.mock)() {
                constructor() {
                    super(...arguments);
                    this.saveAll = async (_options) => { return { success: true, editors: [] }; };
                }
            });
            instantiationService.stub(editSessions_2.IEditSessionIdentityService, new class extends (0, mock_1.mock)() {
                async getEditSessionIdentifier() {
                    return 'test-identity';
                }
            });
            instantiationService.set(workspaceIdentityService_1.IWorkspaceIdentityService, instantiationService.createInstance(workspaceIdentityService_1.WorkspaceIdentityService));
            instantiationService.stub(userDataProfile_1.IUserDataProfilesService, new class extends (0, mock_1.mock)() {
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
            editSessionsContribution = instantiationService.createInstance(editSessions_contribution_1.EditSessionsContribution);
        });
        teardown(() => {
            sinon.restore();
            disposables.clear();
        });
        test('Can apply edit session', async function () {
            const fileUri = (0, resources_1.joinPath)(folderUri, 'dir1', 'README.md');
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
            instantiationService.stub(editSessions_1.IEditSessionsStorageService, 'read', readStub);
            // Create root folder
            await fileService.createFolder(folderUri);
            // Resume edit session
            await editSessionsContribution.resumeEditSession();
            // Verify edit session was correctly applied
            assert.equal((await fileService.readFile(fileUri)).value.toString(), fileContents);
        });
        test('Edit session not stored if there are no edits', async function () {
            const writeStub = sandbox.stub();
            instantiationService.stub(editSessions_1.IEditSessionsStorageService, 'write', writeStub);
            // Create root folder
            await fileService.createFolder(folderUri);
            await editSessionsContribution.storeEditSession(true, new cancellation_1.CancellationTokenSource().token);
            // Verify that we did not attempt to write the edit session
            assert.equal(writeStub.called, false);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdFNlc3Npb25zLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9lZGl0U2Vzc2lvbnMvdGVzdC9icm93c2VyL2VkaXRTZXNzaW9ucy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBa0RoRyxNQUFNLFVBQVUsR0FBRyxhQUFhLENBQUM7SUFDakMsTUFBTSxTQUFTLEdBQUcsU0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLFVBQVUsRUFBRSxDQUFDLENBQUM7SUFFN0MsS0FBSyxDQUFDLG1CQUFtQixFQUFFLEdBQUcsRUFBRTtRQUMvQixJQUFJLG9CQUE4QyxDQUFDO1FBQ25ELElBQUksd0JBQWtELENBQUM7UUFDdkQsSUFBSSxXQUF3QixDQUFDO1FBQzdCLElBQUksT0FBMkIsQ0FBQztRQUVoQyxNQUFNLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztRQUUxQyxVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ2YsT0FBTyxHQUFHLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUVoQyxvQkFBb0IsR0FBRyxJQUFJLG1EQUF3QixFQUFFLENBQUM7WUFFdEQsb0JBQW9CO1lBQ3BCLE1BQU0sVUFBVSxHQUFHLElBQUksb0JBQWMsRUFBRSxDQUFDO1lBQ3hDLFdBQVcsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUkseUJBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQzNELE1BQU0sa0JBQWtCLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLHVEQUEwQixFQUFFLENBQUMsQ0FBQztZQUM3RSxXQUFXLENBQUMsZ0JBQWdCLENBQUMsaUJBQU8sQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQUUvRCx3QkFBd0I7WUFDeEIsb0JBQW9CLENBQUMsSUFBSSxDQUFDLHNDQUF1QixFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQy9ELG9CQUFvQixDQUFDLElBQUksQ0FBQyxvQkFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3JELG9CQUFvQixDQUFDLElBQUksQ0FBQyw2QkFBaUIsRUFBRSxJQUFJLEtBQU0sU0FBUSxJQUFBLFdBQUksR0FBcUI7Z0JBQXZDOztvQkFDdkMsbUJBQWMsR0FBRyxhQUFLLENBQUMsSUFBSSxDQUFDO2dCQUN0QyxDQUFDO2FBQUEsQ0FBQyxDQUFDO1lBQ0gsb0JBQW9CLENBQUMsSUFBSSxDQUFDLG1DQUFvQixFQUFFLElBQUksaURBQXVCLEVBQUUsQ0FBQyxDQUFDO1lBQy9FLG9CQUFvQixDQUFDLElBQUksQ0FBQyxnQ0FBZSxFQUE0QixFQUFFLG9CQUFvQixFQUFFLEVBQUUsR0FBRyxFQUFFLGtCQUFrQixFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsdUJBQXVCLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzFLLG9CQUFvQixDQUFDLElBQUksQ0FBQyx5QkFBZSxFQUFFLElBQUksMENBQWtCLEVBQUUsQ0FBQyxDQUFDO1lBQ3JFLG9CQUFvQixDQUFDLElBQUksQ0FBQyxpQ0FBbUIsRUFBRSxJQUFJLHVDQUFrQixDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDcEYsb0JBQW9CLENBQUMsSUFBSSxDQUFDLDBDQUEyQixFQUFFLElBQUksS0FBTSxTQUFRLElBQUEsV0FBSSxHQUErQjtnQkFBakQ7O29CQUNqRCxnQkFBVyxHQUFHLGFBQUssQ0FBQyxJQUFJLENBQUM7b0JBQ3pCLGlCQUFZLEdBQUcsYUFBSyxDQUFDLElBQUksQ0FBQztnQkFDcEMsQ0FBQzthQUFBLENBQUMsQ0FBQztZQUNILG9CQUFvQixDQUFDLElBQUksQ0FBQyw4QkFBaUIsRUFBRSxJQUFJLEtBQU0sU0FBUSxJQUFBLFdBQUksR0FBcUI7Z0JBQXZDOztvQkFDdkMsMEJBQXFCLEdBQUcsYUFBSyxDQUFDLElBQUksQ0FBQztnQkFDN0MsQ0FBQzthQUFBLENBQUMsQ0FBQztZQUNILG9CQUFvQixDQUFDLElBQUksQ0FBQywyQkFBZ0IsRUFBRSxpQ0FBZSxDQUFDLENBQUM7WUFDN0Qsb0JBQW9CLENBQUMsSUFBSSxDQUFDLGlCQUFXLEVBQUUsdUJBQVUsQ0FBQyxDQUFDO1lBQ25ELG9CQUFvQixDQUFDLElBQUksQ0FBQyxpQ0FBbUIsRUFBRSw4Q0FBc0IsQ0FBQyxDQUFDO1lBQ3ZFLG9CQUFvQixDQUFDLElBQUksQ0FBQyw2QkFBaUIsRUFBRSxxQ0FBb0IsQ0FBQyxDQUFDO1lBQ25FLG9CQUFvQixDQUFDLElBQUksQ0FBQyx3QkFBYyxFQUFFLElBQUksS0FBTSxTQUFRLElBQUEsV0FBSSxHQUFrQjtnQkFDeEUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFvQjtvQkFDekMsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLGVBQWUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO29CQUNuRSxPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUM7Z0JBQ25CLENBQUM7Z0JBQ1EsS0FBSyxDQUFDLE9BQU87b0JBQ3JCLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLENBQUM7Z0JBQzdCLENBQUM7YUFDRCxDQUFDLENBQUM7WUFDSCxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsd0NBQW1CLEVBQUUsSUFBSSxLQUFNLFNBQVEsSUFBQSxXQUFJLEdBQXVCO2dCQUNsRixLQUFLLENBQUMsY0FBYztvQkFDNUIsT0FBTyxJQUFJLENBQUM7Z0JBQ2IsQ0FBQzthQUNELENBQUMsQ0FBQztZQUNILG9CQUFvQixDQUFDLElBQUksQ0FBQyxxQ0FBcUIsRUFBRSxJQUFJLG1EQUF3QixDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsWUFBWSxFQUFFLEVBQUUsWUFBWSxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNySixvQkFBb0IsQ0FBQyxJQUFJLENBQUMsb0NBQXdCLEVBQUUsSUFBSSxLQUFNLFNBQVEsSUFBQSxXQUFJLEdBQTRCO2dCQUM1RixZQUFZO29CQUNwQixPQUFPO3dCQUNOLEVBQUUsRUFBRSxjQUFjO3dCQUNsQixPQUFPLEVBQUUsQ0FBQztnQ0FDVCxHQUFHLEVBQUUsU0FBUztnQ0FDZCxJQUFJLEVBQUUsVUFBVTtnQ0FDaEIsS0FBSyxFQUFFLENBQUM7Z0NBQ1IsVUFBVSxFQUFFLENBQUMsWUFBb0IsRUFBRSxFQUFFLENBQUMsSUFBQSxvQkFBUSxFQUFDLFNBQVMsRUFBRSxZQUFZLENBQUM7NkJBQ3ZFLENBQUM7cUJBQ0YsQ0FBQztnQkFDSCxDQUFDO2dCQUNRLGlCQUFpQjtvQkFDekIscUNBQTZCO2dCQUM5QixDQUFDO2FBQ0QsQ0FBQyxDQUFDO1lBRUgsb0JBQW9CO1lBQ3BCLG9CQUFvQixDQUFDLElBQUksQ0FBQyxpQkFBVyxFQUFFLGVBQWUsRUFBRSxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDbkUsb0JBQW9CLENBQUMsSUFBSSxDQUFDLCtCQUFrQixFQUFFLElBQUksNkNBQXFCLEVBQUUsQ0FBQyxDQUFDO1lBQzNFLG9CQUFvQixDQUFDLElBQUksQ0FBQyw0QkFBYSxFQUFFLElBQUksS0FBTSxTQUFRLElBQUEsV0FBSSxHQUFpQjtnQkFBbkM7O29CQUNuQywwQkFBcUIsR0FBRyxhQUFLLENBQUMsSUFBSSxDQUFDO29CQUNuQyw2QkFBd0IsR0FBRyxhQUFLLENBQUMsSUFBSSxDQUFDO2dCQUNoRCxDQUFDO2FBQUEsQ0FBQyxDQUFDO1lBQ0gsb0JBQW9CLENBQUMsSUFBSSxDQUFDLDhCQUFzQixFQUFFO2dCQUNqRCxtQkFBbUIsRUFBRSxhQUFLLENBQUMsSUFBSTthQUMvQixDQUFDLENBQUM7WUFDSCxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsbUNBQWlCLEVBQUUsSUFBSSxLQUFNLFNBQVEsSUFBQSxXQUFJLEdBQXFCO2dCQUF2Qzs7b0JBQ3ZDLHFDQUFnQyxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDNUUsQ0FBQzthQUFBLENBQUMsQ0FBQztZQUNILG9CQUFvQixDQUFDLElBQUksQ0FBQyw4QkFBYyxFQUFFLElBQUksS0FBTSxTQUFRLElBQUEsV0FBSSxHQUFrQjtnQkFBcEM7O29CQUNwQyxZQUFPLEdBQUcsS0FBSyxFQUFFLFFBQWdDLEVBQUUsRUFBRSxHQUFHLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDM0csQ0FBQzthQUFBLENBQUMsQ0FBQztZQUNILG9CQUFvQixDQUFDLElBQUksQ0FBQywwQ0FBMkIsRUFBRSxJQUFJLEtBQU0sU0FBUSxJQUFBLFdBQUksR0FBK0I7Z0JBQ2xHLEtBQUssQ0FBQyx3QkFBd0I7b0JBQ3RDLE9BQU8sZUFBZSxDQUFDO2dCQUN4QixDQUFDO2FBQ0QsQ0FBQyxDQUFDO1lBQ0gsb0JBQW9CLENBQUMsR0FBRyxDQUFDLG9EQUF5QixFQUFFLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxtREFBd0IsQ0FBQyxDQUFDLENBQUM7WUFDbkgsb0JBQW9CLENBQUMsSUFBSSxDQUFDLDBDQUF3QixFQUFFLElBQUksS0FBTSxTQUFRLElBQUEsV0FBSSxHQUE0QjtnQkFBOUM7O29CQUM5QyxtQkFBYyxHQUFHO3dCQUN6QixFQUFFLEVBQUUsU0FBUzt3QkFDYixJQUFJLEVBQUUsU0FBUzt3QkFDZixTQUFTLEVBQUUsSUFBSTt3QkFDZixRQUFRLEVBQUUsU0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7d0JBQzlCLGlCQUFpQixFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUM7d0JBQ2hELGdCQUFnQixFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUM7d0JBQzlDLG1CQUFtQixFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUM7d0JBQ3BELGFBQWEsRUFBRSxTQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQzt3QkFDeEMsWUFBWSxFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDO3dCQUN0QyxrQkFBa0IsRUFBRSxTQUFHLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDO3dCQUNsRCxTQUFTLEVBQUUsU0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUM7cUJBQ2hDLENBQUM7Z0JBQ0gsQ0FBQzthQUFBLENBQUMsQ0FBQztZQUVILHdCQUF3QixHQUFHLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxvREFBd0IsQ0FBQyxDQUFDO1FBQzFGLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUNiLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNoQixXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDckIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsd0JBQXdCLEVBQUUsS0FBSztZQUNuQyxNQUFNLE9BQU8sR0FBRyxJQUFBLG9CQUFRLEVBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztZQUN6RCxNQUFNLFlBQVksR0FBRyxVQUFVLENBQUM7WUFDaEMsTUFBTSxXQUFXLEdBQUc7Z0JBQ25CLE9BQU8sRUFBRSxDQUFDO2dCQUNWLE9BQU8sRUFBRTtvQkFDUjt3QkFDQyxJQUFJLEVBQUUsVUFBVTt3QkFDaEIsY0FBYyxFQUFFOzRCQUNmO2dDQUNDLGdCQUFnQixFQUFFLGdCQUFnQjtnQ0FDbEMsUUFBUSxFQUFFLHVCQUFRLENBQUMsSUFBSTtnQ0FDdkIsUUFBUSxFQUFFLFlBQVk7Z0NBQ3RCLElBQUksRUFBRSx5QkFBVSxDQUFDLFFBQVE7NkJBQ3pCO3lCQUNEO3FCQUNEO2lCQUNEO2FBQ0QsQ0FBQztZQUVGLGdEQUFnRDtZQUNoRCxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDNUYsb0JBQW9CLENBQUMsSUFBSSxDQUFDLDBDQUEyQixFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztZQUV6RSxxQkFBcUI7WUFDckIsTUFBTSxXQUFXLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRTFDLHNCQUFzQjtZQUN0QixNQUFNLHdCQUF3QixDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFFbkQsNENBQTRDO1lBQzVDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLFdBQVcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDcEYsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsK0NBQStDLEVBQUUsS0FBSztZQUMxRCxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDakMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLDBDQUEyQixFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztZQUUzRSxxQkFBcUI7WUFDckIsTUFBTSxXQUFXLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRTFDLE1BQU0sd0JBQXdCLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLElBQUksc0NBQXVCLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUUzRiwyREFBMkQ7WUFDM0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3ZDLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUMifQ==