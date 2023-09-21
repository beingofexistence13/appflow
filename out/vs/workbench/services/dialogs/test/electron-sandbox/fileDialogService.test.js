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
define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/test/browser/workbenchTestServices", "vs/platform/dialogs/common/dialogs", "vs/base/common/network", "vs/workbench/services/workspaces/browser/workspaceEditingService", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/configuration/common/configuration", "vs/workbench/services/path/common/pathService", "vs/workbench/services/dialogs/electron-sandbox/fileDialogService", "vs/workbench/services/environment/common/environmentService", "vs/base/test/common/mock", "vs/editor/common/languages/language", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/platform/native/common/native", "vs/platform/opener/common/opener", "vs/platform/workspace/common/workspace", "vs/platform/workspaces/common/workspaces", "vs/workbench/services/history/common/history", "vs/workbench/services/host/browser/host", "vs/platform/commands/common/commands", "vs/editor/browser/services/codeEditorService", "vs/workbench/services/editor/common/editorService", "vs/base/common/lifecycle", "vs/platform/log/common/log"], function (require, exports, assert, uri_1, workbenchTestServices_1, dialogs_1, network_1, workspaceEditingService_1, testConfigurationService_1, configuration_1, pathService_1, fileDialogService_1, environmentService_1, mock_1, language_1, files_1, instantiation_1, label_1, native_1, opener_1, workspace_1, workspaces_1, history_1, host_1, commands_1, codeEditorService_1, editorService_1, lifecycle_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let TestFileDialogService = class TestFileDialogService extends fileDialogService_1.FileDialogService {
        constructor(simple, hostService, contextService, historyService, environmentService, instantiationService, configurationService, fileService, openerService, nativeHostService, dialogService, languageService, workspacesService, labelService, pathService, commandService, editorService, codeEditorService, logService) {
            super(hostService, contextService, historyService, environmentService, instantiationService, configurationService, fileService, openerService, nativeHostService, dialogService, languageService, workspacesService, labelService, pathService, commandService, editorService, codeEditorService, logService);
            this.simple = simple;
        }
        getSimpleFileDialog() {
            if (this.simple) {
                return this.simple;
            }
            else {
                return super.getSimpleFileDialog();
            }
        }
    };
    TestFileDialogService = __decorate([
        __param(1, host_1.IHostService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, history_1.IHistoryService),
        __param(4, environmentService_1.IWorkbenchEnvironmentService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, files_1.IFileService),
        __param(8, opener_1.IOpenerService),
        __param(9, native_1.INativeHostService),
        __param(10, dialogs_1.IDialogService),
        __param(11, language_1.ILanguageService),
        __param(12, workspaces_1.IWorkspacesService),
        __param(13, label_1.ILabelService),
        __param(14, pathService_1.IPathService),
        __param(15, commands_1.ICommandService),
        __param(16, editorService_1.IEditorService),
        __param(17, codeEditorService_1.ICodeEditorService),
        __param(18, log_1.ILogService)
    ], TestFileDialogService);
    suite('FileDialogService', function () {
        let disposables;
        let instantiationService;
        const testFile = uri_1.URI.file('/test/file');
        setup(async function () {
            disposables = new lifecycle_1.DisposableStore();
            disposables.add(instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables));
            const configurationService = new testConfigurationService_1.TestConfigurationService();
            await configurationService.setUserConfiguration('files', { simpleDialog: { enable: true } });
            instantiationService.stub(configuration_1.IConfigurationService, configurationService);
        });
        teardown(() => {
            disposables.dispose();
        });
        test('Local - open/save workspaces availableFilesystems', async function () {
            class TestSimpleFileDialog {
                async showOpenDialog(options) {
                    assert.strictEqual(options.availableFileSystems?.length, 1);
                    assert.strictEqual(options.availableFileSystems[0], network_1.Schemas.file);
                    return testFile;
                }
                async showSaveDialog(options) {
                    assert.strictEqual(options.availableFileSystems?.length, 1);
                    assert.strictEqual(options.availableFileSystems[0], network_1.Schemas.file);
                    return testFile;
                }
            }
            const dialogService = instantiationService.createInstance(TestFileDialogService, new TestSimpleFileDialog());
            instantiationService.set(dialogs_1.IFileDialogService, dialogService);
            const workspaceService = instantiationService.createInstance(workspaceEditingService_1.BrowserWorkspaceEditingService);
            assert.strictEqual((await workspaceService.pickNewWorkspacePath())?.path.startsWith(testFile.path), true);
            assert.strictEqual(await dialogService.pickWorkspaceAndOpen({}), undefined);
        });
        test('Virtual - open/save workspaces availableFilesystems', async function () {
            class TestSimpleFileDialog {
                async showOpenDialog(options) {
                    assert.strictEqual(options.availableFileSystems?.length, 1);
                    assert.strictEqual(options.availableFileSystems[0], network_1.Schemas.file);
                    return testFile;
                }
                async showSaveDialog(options) {
                    assert.strictEqual(options.availableFileSystems?.length, 1);
                    assert.strictEqual(options.availableFileSystems[0], network_1.Schemas.file);
                    return testFile;
                }
            }
            instantiationService.stub(pathService_1.IPathService, new class {
                constructor() {
                    this.defaultUriScheme = 'vscode-virtual-test';
                    this.userHome = async () => uri_1.URI.file('/user/home');
                }
            });
            const dialogService = instantiationService.createInstance(TestFileDialogService, new TestSimpleFileDialog());
            instantiationService.set(dialogs_1.IFileDialogService, dialogService);
            const workspaceService = instantiationService.createInstance(workspaceEditingService_1.BrowserWorkspaceEditingService);
            assert.strictEqual((await workspaceService.pickNewWorkspacePath())?.path.startsWith(testFile.path), true);
            assert.strictEqual(await dialogService.pickWorkspaceAndOpen({}), undefined);
        });
        test('Remote - open/save workspaces availableFilesystems', async function () {
            class TestSimpleFileDialog {
                async showOpenDialog(options) {
                    assert.strictEqual(options.availableFileSystems?.length, 2);
                    assert.strictEqual(options.availableFileSystems[0], network_1.Schemas.vscodeRemote);
                    assert.strictEqual(options.availableFileSystems[1], network_1.Schemas.file);
                    return testFile;
                }
                async showSaveDialog(options) {
                    assert.strictEqual(options.availableFileSystems?.length, 2);
                    assert.strictEqual(options.availableFileSystems[0], network_1.Schemas.vscodeRemote);
                    assert.strictEqual(options.availableFileSystems[1], network_1.Schemas.file);
                    return testFile;
                }
            }
            instantiationService.set(environmentService_1.IWorkbenchEnvironmentService, new class extends (0, mock_1.mock)() {
                get remoteAuthority() {
                    return 'testRemote';
                }
            });
            instantiationService.stub(pathService_1.IPathService, new class {
                constructor() {
                    this.defaultUriScheme = network_1.Schemas.vscodeRemote;
                    this.userHome = async () => uri_1.URI.file('/user/home');
                }
            });
            const dialogService = instantiationService.createInstance(TestFileDialogService, new TestSimpleFileDialog());
            instantiationService.set(dialogs_1.IFileDialogService, dialogService);
            const workspaceService = instantiationService.createInstance(workspaceEditingService_1.BrowserWorkspaceEditingService);
            assert.strictEqual((await workspaceService.pickNewWorkspacePath())?.path.startsWith(testFile.path), true);
            assert.strictEqual(await dialogService.pickWorkspaceAndOpen({}), undefined);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZURpYWxvZ1NlcnZpY2UudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9kaWFsb2dzL3Rlc3QvZWxlY3Ryb24tc2FuZGJveC9maWxlRGlhbG9nU2VydmljZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7O0lBa0NoRyxJQUFNLHFCQUFxQixHQUEzQixNQUFNLHFCQUFzQixTQUFRLHFDQUFpQjtRQUNwRCxZQUNTLE1BQXlCLEVBQ25CLFdBQXlCLEVBQ2IsY0FBd0MsRUFDakQsY0FBK0IsRUFDbEIsa0JBQWdELEVBQ3ZELG9CQUEyQyxFQUMzQyxvQkFBMkMsRUFDcEQsV0FBeUIsRUFDdkIsYUFBNkIsRUFDekIsaUJBQXFDLEVBQ3pDLGFBQTZCLEVBQzNCLGVBQWlDLEVBQy9CLGlCQUFxQyxFQUMxQyxZQUEyQixFQUM1QixXQUF5QixFQUN0QixjQUErQixFQUNoQyxhQUE2QixFQUN6QixpQkFBcUMsRUFDNUMsVUFBdUI7WUFFcEMsS0FBSyxDQUFDLFdBQVcsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLGtCQUFrQixFQUFFLG9CQUFvQixFQUFFLG9CQUFvQixFQUFFLFdBQVcsRUFDN0gsYUFBYSxFQUFFLGlCQUFpQixFQUFFLGFBQWEsRUFBRSxlQUFlLEVBQUUsaUJBQWlCLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxjQUFjLEVBQUUsYUFBYSxFQUFFLGlCQUFpQixFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBckJ2SyxXQUFNLEdBQU4sTUFBTSxDQUFtQjtRQXNCbEMsQ0FBQztRQUVrQixtQkFBbUI7WUFDckMsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNoQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7YUFDbkI7aUJBQU07Z0JBQ04sT0FBTyxLQUFLLENBQUMsbUJBQW1CLEVBQUUsQ0FB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