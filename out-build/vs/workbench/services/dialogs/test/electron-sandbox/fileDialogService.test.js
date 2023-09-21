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
    let TestFileDialogService = class TestFileDialogService extends fileDialogService_1.$y_b {
        constructor(O, hostService, contextService, historyService, environmentService, instantiationService, configurationService, fileService, openerService, nativeHostService, dialogService, languageService, workspacesService, labelService, pathService, commandService, editorService, codeEditorService, logService) {
            super(hostService, contextService, historyService, environmentService, instantiationService, configurationService, fileService, openerService, nativeHostService, dialogService, languageService, workspacesService, labelService, pathService, commandService, editorService, codeEditorService, logService);
            this.O = O;
        }
        D() {
            if (this.O) {
                return this.O;
            }
            else {
                return super.D();
            }
        }
    };
    TestFileDialogService = __decorate([
        __param(1, host_1.$VT),
        __param(2, workspace_1.$Kh),
        __param(3, history_1.$SM),
        __param(4, environmentService_1.$hJ),
        __param(5, instantiation_1.$Ah),
        __param(6, configuration_1.$8h),
        __param(7, files_1.$6j),
        __param(8, opener_1.$NT),
        __param(9, native_1.$05b),
        __param(10, dialogs_1.$oA),
        __param(11, language_1.$ct),
        __param(12, workspaces_1.$fU),
        __param(13, label_1.$Vz),
        __param(14, pathService_1.$yJ),
        __param(15, commands_1.$Fr),
        __param(16, editorService_1.$9C),
        __param(17, codeEditorService_1.$nV),
        __param(18, log_1.$5i)
    ], TestFileDialogService);
    suite('FileDialogService', function () {
        let disposables;
        let instantiationService;
        const testFile = uri_1.URI.file('/test/file');
        setup(async function () {
            disposables = new lifecycle_1.$jc();
            disposables.add(instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables));
            const configurationService = new testConfigurationService_1.$G0b();
            await configurationService.setUserConfiguration('files', { simpleDialog: { enable: true } });
            instantiationService.stub(configuration_1.$8h, configurationService);
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
            instantiationService.set(dialogs_1.$qA, dialogService);
            const workspaceService = instantiationService.createInstance(workspaceEditingService_1.$93b);
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
            instantiationService.stub(pathService_1.$yJ, new class {
                constructor() {
                    this.defaultUriScheme = 'vscode-virtual-test';
                    this.userHome = async () => uri_1.URI.file('/user/home');
                }
            });
            const dialogService = instantiationService.createInstance(TestFileDialogService, new TestSimpleFileDialog());
            instantiationService.set(dialogs_1.$qA, dialogService);
            const workspaceService = instantiationService.createInstance(workspaceEditingService_1.$93b);
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
            instantiationService.set(environmentService_1.$hJ, new class extends (0, mock_1.$rT)() {
                get remoteAuthority() {
                    return 'testRemote';
                }
            });
            instantiationService.stub(pathService_1.$yJ, new class {
                constructor() {
                    this.defaultUriScheme = network_1.Schemas.vscodeRemote;
                    this.userHome = async () => uri_1.URI.file('/user/home');
                }
            });
            const dialogService = instantiationService.createInstance(TestFileDialogService, new TestSimpleFileDialog());
            instantiationService.set(dialogs_1.$qA, dialogService);
            const workspaceService = instantiationService.createInstance(workspaceEditingService_1.$93b);
            assert.strictEqual((await workspaceService.pickNewWorkspacePath())?.path.startsWith(testFile.path), true);
            assert.strictEqual(await dialogService.pickWorkspaceAndOpen({}), undefined);
        });
    });
});
//# sourceMappingURL=fileDialogService.test.js.map