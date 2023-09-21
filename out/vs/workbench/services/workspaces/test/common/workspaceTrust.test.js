/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/base/test/common/mock", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/files/common/fileService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/log/common/log", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/storage/common/storage", "vs/platform/workspace/common/workspace", "vs/platform/workspace/common/workspaceTrust", "vs/platform/workspace/test/common/testWorkspace", "vs/workbench/common/memento", "vs/workbench/services/environment/common/environmentService", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/workbench/services/workspaces/common/workspaceTrust", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert, uri_1, mock_1, configuration_1, testConfigurationService_1, fileService_1, instantiationServiceMock_1, log_1, remoteAuthorityResolver_1, storage_1, workspace_1, workspaceTrust_1, testWorkspace_1, memento_1, environmentService_1, uriIdentity_1, uriIdentityService_1, workspaceTrust_2, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Workspace Trust', () => {
        let instantiationService;
        let configurationService;
        let environmentService;
        setup(async () => {
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            configurationService = new testConfigurationService_1.TestConfigurationService();
            instantiationService.stub(configuration_1.IConfigurationService, configurationService);
            environmentService = {};
            instantiationService.stub(environmentService_1.IWorkbenchEnvironmentService, environmentService);
            instantiationService.stub(uriIdentity_1.IUriIdentityService, new uriIdentityService_1.UriIdentityService(new fileService_1.FileService(new log_1.NullLogService())));
            instantiationService.stub(remoteAuthorityResolver_1.IRemoteAuthorityResolverService, new class extends (0, mock_1.mock)() {
            });
        });
        teardown(() => {
            instantiationService.dispose();
        });
        suite('Enablement', () => {
            let testObject;
            teardown(() => testObject.dispose());
            test('workspace trust enabled', async () => {
                await configurationService.setUserConfiguration('security', getUserSettings(true, true));
                testObject = instantiationService.createInstance(workspaceTrust_2.WorkspaceTrustEnablementService);
                assert.strictEqual(testObject.isWorkspaceTrustEnabled(), true);
            });
            test('workspace trust disabled (user setting)', async () => {
                await configurationService.setUserConfiguration('security', getUserSettings(false, true));
                testObject = instantiationService.createInstance(workspaceTrust_2.WorkspaceTrustEnablementService);
                assert.strictEqual(testObject.isWorkspaceTrustEnabled(), false);
            });
            test('workspace trust disabled (--disable-workspace-trust)', () => {
                instantiationService.stub(environmentService_1.IWorkbenchEnvironmentService, { ...environmentService, disableWorkspaceTrust: true });
                testObject = instantiationService.createInstance(workspaceTrust_2.WorkspaceTrustEnablementService);
                assert.strictEqual(testObject.isWorkspaceTrustEnabled(), false);
            });
        });
        suite('Management', () => {
            let testObject;
            let storageService;
            let workspaceService;
            setup(() => {
                storageService = new workbenchTestServices_1.TestStorageService();
                instantiationService.stub(storage_1.IStorageService, storageService);
                workspaceService = new workbenchTestServices_1.TestContextService();
                instantiationService.stub(workspace_1.IWorkspaceContextService, workspaceService);
                instantiationService.stub(workspaceTrust_1.IWorkspaceTrustEnablementService, new workbenchTestServices_1.TestWorkspaceTrustEnablementService());
            });
            teardown(() => {
                testObject.dispose();
                memento_1.Memento.clear(1 /* StorageScope.WORKSPACE */);
            });
            test('empty workspace - trusted', async () => {
                await configurationService.setUserConfiguration('security', getUserSettings(true, true));
                workspaceService.setWorkspace(new testWorkspace_1.Workspace('empty-workspace'));
                testObject = await initializeTestObject();
                assert.strictEqual(true, testObject.isWorkspaceTrusted());
            });
            test('empty workspace - untrusted', async () => {
                await configurationService.setUserConfiguration('security', getUserSettings(true, false));
                workspaceService.setWorkspace(new testWorkspace_1.Workspace('empty-workspace'));
                testObject = await initializeTestObject();
                assert.strictEqual(false, testObject.isWorkspaceTrusted());
            });
            test('empty workspace - trusted, open trusted file', async () => {
                await configurationService.setUserConfiguration('security', getUserSettings(true, true));
                const trustInfo = { uriTrustInfo: [{ uri: uri_1.URI.parse('file:///Folder'), trusted: true }] };
                storageService.store(workspaceTrust_2.WORKSPACE_TRUST_STORAGE_KEY, JSON.stringify(trustInfo), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                environmentService.filesToOpenOrCreate = [{ fileUri: uri_1.URI.parse('file:///Folder/file.txt') }];
                instantiationService.stub(environmentService_1.IWorkbenchEnvironmentService, { ...environmentService });
                workspaceService.setWorkspace(new testWorkspace_1.Workspace('empty-workspace'));
                testObject = await initializeTestObject();
                assert.strictEqual(true, testObject.isWorkspaceTrusted());
            });
            test('empty workspace - trusted, open untrusted file', async () => {
                await configurationService.setUserConfiguration('security', getUserSettings(true, true));
                environmentService.filesToOpenOrCreate = [{ fileUri: uri_1.URI.parse('file:///Folder/foo.txt') }];
                instantiationService.stub(environmentService_1.IWorkbenchEnvironmentService, { ...environmentService });
                workspaceService.setWorkspace(new testWorkspace_1.Workspace('empty-workspace'));
                testObject = await initializeTestObject();
                assert.strictEqual(false, testObject.isWorkspaceTrusted());
            });
            async function initializeTestObject() {
                const workspaceTrustManagementService = instantiationService.createInstance(workspaceTrust_2.WorkspaceTrustManagementService);
                await workspaceTrustManagementService.workspaceTrustInitialized;
                return workspaceTrustManagementService;
            }
        });
        function getUserSettings(enabled, emptyWindow) {
            return { workspace: { trust: { emptyWindow, enabled } } };
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlVHJ1c3QudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy93b3Jrc3BhY2VzL3Rlc3QvY29tbW9uL3dvcmtzcGFjZVRydXN0LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFzQmhHLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUU7UUFDN0IsSUFBSSxvQkFBOEMsQ0FBQztRQUNuRCxJQUFJLG9CQUE4QyxDQUFDO1FBQ25ELElBQUksa0JBQWdELENBQUM7UUFFckQsS0FBSyxDQUFDLEtBQUssSUFBSSxFQUFFO1lBQ2hCLG9CQUFvQixHQUFHLElBQUksbURBQXdCLEVBQUUsQ0FBQztZQUV0RCxvQkFBb0IsR0FBRyxJQUFJLG1EQUF3QixFQUFFLENBQUM7WUFDdEQsb0JBQW9CLENBQUMsSUFBSSxDQUFDLHFDQUFxQixFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFFdkUsa0JBQWtCLEdBQUcsRUFBa0MsQ0FBQztZQUN4RCxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsaURBQTRCLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQUU1RSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsaUNBQW1CLEVBQUUsSUFBSSx1Q0FBa0IsQ0FBQyxJQUFJLHlCQUFXLENBQUMsSUFBSSxvQkFBYyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUcsb0JBQW9CLENBQUMsSUFBSSxDQUFDLHlEQUErQixFQUFFLElBQUksS0FBTSxTQUFRLElBQUEsV0FBSSxHQUFtQzthQUFJLENBQUMsQ0FBQztRQUMzSCxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxHQUFHLEVBQUU7WUFDYixvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNoQyxDQUFDLENBQUMsQ0FBQztRQUVILEtBQUssQ0FBQyxZQUFZLEVBQUUsR0FBRyxF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