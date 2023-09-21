/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/base/test/common/mock", "vs/base/test/common/utils", "vs/editor/browser/services/bulkEditService", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/services/editorWorker", "vs/editor/common/services/languageService", "vs/editor/common/services/model", "vs/editor/common/services/modelService", "vs/editor/common/services/resolverService", "vs/editor/test/browser/editorTestServices", "vs/editor/test/common/modes/testLanguageConfigurationService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/dialogs/common/dialogs", "vs/platform/dialogs/test/common/testDialogService", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiationService", "vs/platform/instantiation/common/serviceCollection", "vs/platform/label/common/label", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/notification/test/common/testNotificationService", "vs/platform/theme/test/common/testThemeService", "vs/platform/undoRedo/common/undoRedo", "vs/platform/undoRedo/common/undoRedoService", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/platform/workspace/common/workspace", "vs/workbench/api/browser/mainThreadBulkEdits", "vs/workbench/api/test/common/testRPCProtocol", "vs/workbench/contrib/bulkEdit/browser/bulkEditService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/label/common/labelService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert, event_1, lifecycle_1, uri_1, mock_1, utils_1, bulkEditService_1, codeEditorService_1, editOperation_1, position_1, range_1, editorWorker_1, languageService_1, model_1, modelService_1, resolverService_1, editorTestServices_1, testLanguageConfigurationService_1, configuration_1, testConfigurationService_1, dialogs_1, testDialogService_1, environment_1, files_1, descriptors_1, instantiationService_1, serviceCollection_1, label_1, log_1, notification_1, testNotificationService_1, testThemeService_1, undoRedo_1, undoRedoService_1, uriIdentity_1, uriIdentityService_1, workspace_1, mainThreadBulkEdits_1, testRPCProtocol_1, bulkEditService_2, editorGroupsService_1, editorService_1, environmentService_1, labelService_1, lifecycle_2, panecomposite_1, textfiles_1, workingCopyFileService_1, workingCopyService_1, workbenchTestServices_1, workbenchTestServices_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('MainThreadEditors', () => {
        let disposables;
        const resource = uri_1.URI.parse('foo:bar');
        let modelService;
        let bulkEdits;
        const movedResources = new Map();
        const copiedResources = new Map();
        const createdResources = new Set();
        const deletedResources = new Set();
        setup(() => {
            disposables = new lifecycle_1.$jc();
            movedResources.clear();
            copiedResources.clear();
            createdResources.clear();
            deletedResources.clear();
            const configService = new testConfigurationService_1.$G0b();
            const dialogService = new testDialogService_1.$H0b();
            const notificationService = new testNotificationService_1.$I0b();
            const undoRedoService = new undoRedoService_1.$myb(dialogService, notificationService);
            const themeService = new testThemeService_1.$K0b();
            modelService = new modelService_1.$4yb(configService, new workbenchTestServices_2.$5dc(configService), undoRedoService, disposables.add(new languageService_1.$jmb()), new testLanguageConfigurationService_1.$D0b());
            const services = new serviceCollection_1.$zh();
            services.set(bulkEditService_1.$n1, new descriptors_1.$yh(bulkEditService_2.$dMb));
            services.set(label_1.$Vz, new descriptors_1.$yh(labelService_1.$Bzb));
            services.set(log_1.$5i, new log_1.$fj());
            services.set(workspace_1.$Kh, new workbenchTestServices_2.$6dc());
            services.set(environment_1.$Ih, workbenchTestServices_1.$qec);
            services.set(environmentService_1.$hJ, workbenchTestServices_1.$qec);
            services.set(configuration_1.$8h, configService);
            services.set(dialogs_1.$oA, dialogService);
            services.set(notification_1.$Yu, notificationService);
            services.set(undoRedo_1.$wu, undoRedoService);
            services.set(model_1.$yA, modelService);
            services.set(codeEditorService_1.$nV, new editorTestServices_1.$A0b(themeService));
            services.set(files_1.$6j, new workbenchTestServices_1.$Fec());
            services.set(uriIdentity_1.$Ck, new descriptors_1.$yh(uriIdentityService_1.$pr));
            services.set(editorService_1.$9C, new workbenchTestServices_1.$Eec());
            services.set(lifecycle_2.$7y, new workbenchTestServices_1.$Kec());
            services.set(workingCopyService_1.$TC, new workbenchTestServices_1.$kec());
            services.set(editorGroupsService_1.$5C, new workbenchTestServices_1.$Bec());
            services.set(textfiles_1.$JD, new class extends (0, mock_1.$rT)() {
                constructor() {
                    super(...arguments);
                    this.files = {
                        onDidSave: event_1.Event.None,
                        onDidRevert: event_1.Event.None,
                        onDidChangeDirty: event_1.Event.None
                    };
                }
                isDirty() { return false; }
                create(operations) {
                    for (const o of operations) {
                        createdResources.add(o.resource);
                    }
                    return Promise.resolve(Object.create(null));
                }
                async getEncodedReadable(resource, value) {
                    return undefined;
                }
            });
            services.set(workingCopyFileService_1.$HD, new class extends (0, mock_1.$rT)() {
                constructor() {
                    super(...arguments);
                    this.onDidRunWorkingCopyFileOperation = event_1.Event.None;
                }
                createFolder(operations) {
                    this.create(operations);
                }
                create(operations) {
                    for (const operation of operations) {
                        createdResources.add(operation.resource);
                    }
                    return Promise.resolve(Object.create(null));
                }
                move(operations) {
                    const { source, target } = operations[0].file;
                    movedResources.set(source, target);
                    return Promise.resolve(Object.create(null));
                }
                copy(operations) {
                    const { source, target } = operations[0].file;
                    copiedResources.set(source, target);
                    return Promise.resolve(Object.create(null));
                }
                delete(operations) {
                    for (const operation of operations) {
                        deletedResources.add(operation.resource);
                    }
                    return Promise.resolve(undefined);
                }
            });
            services.set(resolverService_1.$uA, new class extends (0, mock_1.$rT)() {
                createModelReference(resource) {
                    const textEditorModel = new class extends (0, mock_1.$rT)() {
                        constructor() {
                            super(...arguments);
                            this.textEditorModel = modelService.getModel(resource);
                        }
                    };
                    textEditorModel.isReadonly = () => false;
                    return Promise.resolve(new lifecycle_1.$qc(textEditorModel));
                }
            });
            services.set(editorWorker_1.$4Y, new class extends (0, mock_1.$rT)() {
            });
            services.set(panecomposite_1.$Yeb, new class extends (0, mock_1.$rT)() {
                constructor() {
                    super(...arguments);
                    this.onDidPaneCompositeOpen = event_1.Event.None;
                    this.onDidPaneCompositeClose = event_1.Event.None;
                }
                getActivePaneComposite() {
                    return undefined;
                }
            });
            const instaService = new instantiationService_1.$6p(services);
            bulkEdits = instaService.createInstance(mainThreadBulkEdits_1.$5bb, (0, testRPCProtocol_1.$2dc)(null));
        });
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.$bT)();
        test(`applyWorkspaceEdit returns false if model is changed by user`, () => {
            const model = disposables.add(modelService.createModel('something', null, resource));
            const workspaceResourceEdit = {
                resource: resource,
                versionId: model.getVersionId(),
                textEdit: {
                    text: 'asdfg',
                    range: new range_1.$ks(1, 1, 1, 1)
                }
            };
            // Act as if the user edited the model
            model.applyEdits([editOperation_1.$ls.insert(new position_1.$js(0, 0), 'something')]);
            return bulkEdits.$tryApplyWorkspaceEdit({ edits: [workspaceResourceEdit] }).then((result) => {
                assert.strictEqual(result, false);
            });
        });
        test(`issue #54773: applyWorkspaceEdit checks model version in race situation`, () => {
            const model = disposables.add(modelService.createModel('something', null, resource));
            const workspaceResourceEdit1 = {
                resource: resource,
                versionId: model.getVersionId(),
                textEdit: {
                    text: 'asdfg',
                    range: new range_1.$ks(1, 1, 1, 1)
                }
            };
            const workspaceResourceEdit2 = {
                resource: resource,
                versionId: model.getVersionId(),
                textEdit: {
                    text: 'asdfg',
                    range: new range_1.$ks(1, 1, 1, 1)
                }
            };
            const p1 = bulkEdits.$tryApplyWorkspaceEdit({ edits: [workspaceResourceEdit1] }).then((result) => {
                // first edit request succeeds
                assert.strictEqual(result, true);
            });
            const p2 = bulkEdits.$tryApplyWorkspaceEdit({ edits: [workspaceResourceEdit2] }).then((result) => {
                // second edit request fails
                assert.strictEqual(result, false);
            });
            return Promise.all([p1, p2]);
        });
        test(`applyWorkspaceEdit with only resource edit`, () => {
            return bulkEdits.$tryApplyWorkspaceEdit({
                edits: [
                    { oldResource: resource, newResource: resource, options: undefined },
                    { oldResource: undefined, newResource: resource, options: undefined },
                    { oldResource: resource, newResource: undefined, options: undefined }
                ]
            }).then((result) => {
                assert.strictEqual(result, true);
                assert.strictEqual(movedResources.get(resource), resource);
                assert.strictEqual(createdResources.has(resource), true);
                assert.strictEqual(deletedResources.has(resource), true);
            });
        });
    });
});
//# sourceMappingURL=mainThreadEditors.test.js.map