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
define(["require", "exports", "vs/workbench/contrib/files/browser/editors/fileEditorInput", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/workbench/common/editor/editorInput", "vs/workbench/common/editor", "vs/base/common/event", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/platform/configuration/common/configuration", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/services/textmodelResolver/common/textModelResolverService", "vs/editor/common/services/resolverService", "vs/workbench/services/untitled/common/untitledTextEditorService", "vs/platform/workspace/common/workspace", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/instantiation/common/serviceCollection", "vs/platform/files/common/files", "vs/editor/common/services/model", "vs/editor/common/services/languageService", "vs/editor/common/services/modelService", "vs/workbench/services/textfile/common/textfiles", "vs/editor/common/languages/language", "vs/workbench/services/history/common/history", "vs/platform/instantiation/common/instantiation", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/workspace/test/common/testWorkspace", "vs/platform/environment/common/environment", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService", "vs/editor/common/services/textResourceConfiguration", "vs/editor/common/core/position", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/editor/common/core/range", "vs/platform/dialogs/common/dialogs", "vs/platform/notification/common/notification", "vs/platform/notification/test/common/testNotificationService", "vs/workbench/services/extensions/common/extensions", "vs/platform/keybinding/common/keybinding", "vs/workbench/services/decorations/common/decorations", "vs/base/common/lifecycle", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/editor/browser/services/codeEditorService", "vs/workbench/browser/editor", "vs/base/browser/dom", "vs/platform/log/common/log", "vs/platform/label/common/label", "vs/base/common/async", "vs/platform/storage/common/storage", "vs/base/common/platform", "vs/workbench/services/label/common/labelService", "vs/base/common/buffer", "vs/base/common/network", "vs/platform/product/common/product", "vs/workbench/services/host/browser/host", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/platform/accessibility/common/accessibility", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/services/textfile/browser/browserTextFileService", "vs/workbench/services/environment/common/environmentService", "vs/editor/common/model/textModel", "vs/workbench/services/path/common/pathService", "vs/platform/progress/common/progress", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/platform/undoRedo/common/undoRedoService", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/services/textfile/common/textFileEditorModel", "vs/platform/registry/common/platform", "vs/workbench/browser/parts/editor/editorPane", "vs/base/common/cancellation", "vs/platform/instantiation/common/descriptors", "vs/platform/dialogs/test/common/testDialogService", "vs/workbench/services/editor/browser/codeEditorService", "vs/workbench/browser/parts/editor/editorPart", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/quickinput/browser/quickInputService", "vs/platform/list/browser/listService", "vs/base/common/path", "vs/workbench/test/common/workbenchTestServices", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/base/common/stream", "vs/workbench/services/textfile/browser/textFileService", "vs/workbench/services/textfile/common/encoding", "vs/platform/theme/common/theme", "vs/base/common/iterator", "vs/workbench/services/workingCopy/common/workingCopyBackupService", "vs/workbench/services/workingCopy/browser/workingCopyBackupService", "vs/platform/files/common/fileService", "vs/workbench/browser/parts/editor/textResourceEditor", "vs/editor/test/browser/testCodeEditor", "vs/workbench/contrib/files/browser/editors/textFileEditor", "vs/workbench/common/editor/textResourceEditorInput", "vs/workbench/services/untitled/common/untitledTextEditorInput", "vs/workbench/browser/parts/editor/sideBySideEditor", "vs/platform/workspaces/common/workspaces", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/contrib/terminal/browser/terminal", "vs/base/common/types", "vs/workbench/services/editor/browser/editorResolverService", "vs/workbench/contrib/files/common/files", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/services/workingCopy/common/workingCopyEditorService", "vs/workbench/services/files/common/elevatedFileService", "vs/workbench/services/files/browser/elevatedFileService", "vs/editor/common/services/editorWorker", "vs/base/common/map", "vs/workbench/common/editor/sideBySideEditorInput", "vs/workbench/services/textfile/common/textEditorService", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/test/common/modes/testLanguageConfigurationService", "vs/base/common/process", "vs/base/common/extpath", "vs/platform/accessibility/test/common/testAccessibilityService", "vs/editor/common/services/languageFeatureDebounce", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/languageFeaturesService", "vs/workbench/browser/parts/editor/textEditor", "vs/editor/common/core/selection", "vs/editor/test/common/services/testEditorWorkerService", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/languageDetection/common/languageDetectionWorkerService", "vs/platform/userDataProfile/common/userDataProfile", "vs/workbench/services/userDataProfile/common/userDataProfileService", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/base/common/codicons", "vs/workbench/services/hover/browser/hover", "vs/platform/remote/common/remoteSocketFactoryService"], function (require, exports, fileEditorInput_1, instantiationServiceMock_1, resources_1, uri_1, telemetry_1, telemetryUtils_1, editorInput_1, editor_1, event_1, workingCopyBackup_1, configuration_1, layoutService_1, textModelResolverService_1, resolverService_1, untitledTextEditorService_1, workspace_1, lifecycle_1, serviceCollection_1, files_1, model_1, languageService_1, modelService_1, textfiles_1, language_1, history_1, instantiation_1, testConfigurationService_1, testWorkspace_1, environment_1, themeService_1, testThemeService_1, textResourceConfiguration_1, position_1, actions_1, contextkey_1, mockKeybindingService_1, range_1, dialogs_1, notification_1, testNotificationService_1, extensions_1, keybinding_1, decorations_1, lifecycle_2, editorGroupsService_1, editorService_1, codeEditorService_1, editor_2, dom_1, log_1, label_1, async_1, storage_1, platform_1, labelService_1, buffer_1, network_1, product_1, host_1, workingCopyService_1, filesConfigurationService_1, accessibility_1, environmentService_1, browserTextFileService_1, environmentService_2, textModel_1, pathService_1, progress_1, workingCopyFileService_1, undoRedoService_1, undoRedo_1, textFileEditorModel_1, platform_2, editorPane_1, cancellation_1, descriptors_1, testDialogService_1, codeEditorService_2, editorPart_1, quickInput_1, quickInputService_1, listService_1, path_1, workbenchTestServices_1, uriIdentity_1, uriIdentityService_1, inMemoryFilesystemProvider_1, stream_1, textFileService_1, encoding_1, theme_1, iterator_1, workingCopyBackupService_1, workingCopyBackupService_2, fileService_1, textResourceEditor_1, testCodeEditor_1, textFileEditor_1, textResourceEditorInput_1, untitledTextEditorInput_1, sideBySideEditor_1, workspaces_1, workspaceTrust_1, terminal_1, types_1, editorResolverService_1, files_2, editorResolverService_2, workingCopyEditorService_1, elevatedFileService_1, elevatedFileService_2, editorWorker_1, map_1, sideBySideEditorInput_1, textEditorService_1, panecomposite_1, languageConfigurationRegistry_1, testLanguageConfigurationService_1, process_1, extpath_1, testAccessibilityService_1, languageFeatureDebounce_1, languageFeatures_1, languageFeaturesService_1, textEditor_1, selection_1, testEditorWorkerService_1, remoteAgentService_1, languageDetectionWorkerService_1, userDataProfile_1, userDataProfileService_1, userDataProfile_2, codicons_1, hover_1, remoteSocketFactoryService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$hfc = exports.$gfc = exports.$ffc = exports.$efc = exports.$dfc = exports.$cfc = exports.$bfc = exports.$afc = exports.$_ec = exports.$$ec = exports.$0ec = exports.$9ec = exports.$8ec = exports.$7ec = exports.$6ec = exports.$5ec = exports.$4ec = exports.$3ec = exports.$2ec = exports.$1ec = exports.$Zec = exports.$Yec = exports.$Xec = exports.$Wec = exports.$Vec = exports.$Uec = exports.$Tec = exports.$Sec = exports.$Rec = exports.$Qec = exports.$Pec = exports.$Oec = exports.$Nec = exports.$Mec = exports.$Lec = exports.$Kec = exports.$Jec = exports.$Iec = exports.$Hec = exports.$Gec = exports.$Fec = exports.$Eec = exports.$Dec = exports.$Cec = exports.$Bec = exports.$Aec = exports.$zec = exports.$yec = exports.$xec = exports.$wec = exports.$vec = exports.$uec = exports.$tec = exports.$sec = exports.$rec = exports.$qec = exports.$pec = exports.$oec = exports.$nec = exports.$mec = exports.$lec = exports.$kec = exports.$jec = exports.$iec = exports.$hec = void 0;
    function $hec(instantiationService, resource) {
        return instantiationService.createInstance(fileEditorInput_1.$ULb, resource, undefined, undefined, undefined, undefined, undefined, undefined);
    }
    exports.$hec = $hec;
    platform_2.$8m.as(editor_1.$GE.EditorFactory).registerFileEditorFactory({
        typeId: files_2.$8db,
        createFileEditor: (resource, preferredResource, preferredName, preferredDescription, preferredEncoding, preferredLanguageId, preferredContents, instantiationService) => {
            return instantiationService.createInstance(fileEditorInput_1.$ULb, resource, preferredResource, preferredName, preferredDescription, preferredEncoding, preferredLanguageId, preferredContents);
        },
        isFileEditor: (obj) => {
            return obj instanceof fileEditorInput_1.$ULb;
        }
    });
    class $iec extends textResourceEditor_1.$Evb {
        Lb(parent, configuration) {
            this.a = this.B(this.m.createInstance(testCodeEditor_1.$W0b, parent, configuration, {}));
        }
    }
    exports.$iec = $iec;
    class $jec extends textFileEditor_1.$aMb {
        Lb(parent, configuration) {
            this.a = this.B(this.m.createInstance(testCodeEditor_1.$W0b, parent, configuration, { contributions: [] }));
        }
        setSelection(selection, reason) {
            this.Y = selection ? { selection } : undefined;
            this.sb.fire({ reason });
        }
        getSelection() {
            const options = this.options;
            if (!options) {
                return undefined;
            }
            const textSelection = options.selection;
            if (!textSelection) {
                return undefined;
            }
            return new textEditor_1.$peb(new selection_1.$ms(textSelection.startLineNumber, textSelection.startColumn, textSelection.endLineNumber ?? textSelection.startLineNumber, textSelection.endColumn ?? textSelection.startColumn));
        }
    }
    exports.$jec = $jec;
    class $kec extends workingCopyService_1.$UC {
        testUnregisterWorkingCopy(workingCopy) {
            return super.r(workingCopy);
        }
    }
    exports.$kec = $kec;
    function $lec(overrides, disposables = new lifecycle_2.$jc()) {
        const instantiationService = disposables.add(new instantiationServiceMock_1.$L0b(new serviceCollection_1.$zh([lifecycle_1.$7y, disposables.add(new $Kec())])));
        instantiationService.stub(editorWorker_1.$4Y, new testEditorWorkerService_1.$E0b());
        instantiationService.stub(workingCopyService_1.$TC, disposables.add(new $kec()));
        const environmentService = overrides?.environmentService ? overrides.environmentService(instantiationService) : exports.$qec;
        instantiationService.stub(environment_1.$Ih, environmentService);
        instantiationService.stub(environmentService_2.$hJ, environmentService);
        const contextKeyService = overrides?.contextKeyService ? overrides.contextKeyService(instantiationService) : instantiationService.createInstance(mockKeybindingService_1.$S0b);
        instantiationService.stub(contextkey_1.$3i, contextKeyService);
        instantiationService.stub(progress_1.$2u, new $rec());
        const workspaceContextService = new workbenchTestServices_1.$6dc(testWorkspace_1.$$0b);
        instantiationService.stub(workspace_1.$Kh, workspaceContextService);
        const configService = overrides?.configurationService ? overrides.configurationService(instantiationService) : new testConfigurationService_1.$G0b({
            files: {
                participants: {
                    timeout: 60000
                }
            }
        });
        instantiationService.stub(configuration_1.$8h, configService);
        instantiationService.stub(textResourceConfiguration_1.$FA, new $Nec(configService));
        instantiationService.stub(untitledTextEditorService_1.$tD, disposables.add(instantiationService.createInstance(untitledTextEditorService_1.$uD)));
        instantiationService.stub(storage_1.$Vo, disposables.add(new workbenchTestServices_1.$7dc()));
        instantiationService.stub(remoteAgentService_1.$jm, new $bfc());
        instantiationService.stub(languageDetectionWorkerService_1.$zA, new TestLanguageDetectionService());
        instantiationService.stub(pathService_1.$yJ, overrides?.pathService ? overrides.pathService(instantiationService) : new $5ec());
        const layoutService = new $wec();
        instantiationService.stub(layoutService_1.$Meb, layoutService);
        instantiationService.stub(dialogs_1.$oA, new testDialogService_1.$H0b());
        const accessibilityService = new testAccessibilityService_1.$y0b();
        instantiationService.stub(accessibility_1.$1r, accessibilityService);
        instantiationService.stub(dialogs_1.$qA, instantiationService.createInstance($vec));
        instantiationService.stub(language_1.$ct, disposables.add(instantiationService.createInstance(languageService_1.$jmb)));
        instantiationService.stub(languageFeatures_1.$hF, new languageFeaturesService_1.$oBb());
        instantiationService.stub(languageFeatureDebounce_1.$52, instantiationService.createInstance(languageFeatureDebounce_1.$62));
        instantiationService.stub(history_1.$SM, new $uec());
        instantiationService.stub(textResourceConfiguration_1.$GA, new workbenchTestServices_1.$5dc(configService));
        instantiationService.stub(undoRedo_1.$wu, instantiationService.createInstance(undoRedoService_1.$myb));
        const themeService = new testThemeService_1.$K0b();
        instantiationService.stub(themeService_1.$gv, themeService);
        instantiationService.stub(languageConfigurationRegistry_1.$2t, disposables.add(new testLanguageConfigurationService_1.$D0b()));
        instantiationService.stub(model_1.$yA, disposables.add(instantiationService.createInstance(modelService_1.$4yb)));
        const fileService = overrides?.fileService ? overrides.fileService(instantiationService) : disposables.add(new $Fec());
        instantiationService.stub(files_1.$6j, fileService);
        const uriIdentityService = new uriIdentityService_1.$pr(fileService);
        disposables.add(uriIdentityService);
        instantiationService.stub(filesConfigurationService_1.$yD, disposables.add(new $Sec(contextKeyService, configService, workspaceContextService, environmentService, uriIdentityService, fileService)));
        instantiationService.stub(uriIdentity_1.$Ck, disposables.add(uriIdentityService));
        const userDataProfilesService = instantiationService.stub(userDataProfile_1.$Ek, disposables.add(new userDataProfile_1.$Hk(environmentService, fileService, uriIdentityService, new log_1.$fj())));
        instantiationService.stub(userDataProfile_2.$CJ, disposables.add(new userDataProfileService_1.$I2b(userDataProfilesService.defaultProfile)));
        instantiationService.stub(workingCopyBackup_1.$EA, overrides?.workingCopyBackupService ? overrides?.workingCopyBackupService(instantiationService) : disposables.add(new $Gec()));
        instantiationService.stub(telemetry_1.$9k, telemetryUtils_1.$bo);
        instantiationService.stub(notification_1.$Yu, new testNotificationService_1.$I0b());
        instantiationService.stub(untitledTextEditorService_1.$tD, disposables.add(instantiationService.createInstance(untitledTextEditorService_1.$uD)));
        instantiationService.stub(actions_1.$Su, new $tec());
        const keybindingService = new mockKeybindingService_1.$U0b();
        instantiationService.stub(keybinding_1.$2D, keybindingService);
        instantiationService.stub(decorations_1.$Gcb, new $sec());
        instantiationService.stub(extensions_1.$MF, new workbenchTestServices_1.$aec());
        instantiationService.stub(workingCopyFileService_1.$HD, disposables.add(instantiationService.createInstance(workingCopyFileService_1.$ID)));
        instantiationService.stub(textfiles_1.$JD, overrides?.textFileService ? overrides.textFileService(instantiationService) : disposables.add(instantiationService.createInstance($nec)));
        instantiationService.stub(host_1.$VT, instantiationService.createInstance($Rec));
        instantiationService.stub(resolverService_1.$uA, disposables.add(instantiationService.createInstance(textModelResolverService_1.$Jyb)));
        instantiationService.stub(log_1.$6i, disposables.add(new workbenchTestServices_1.$4dc(exports.$qec.logsHome)));
        instantiationService.stub(log_1.$5i, new log_1.$fj());
        const editorGroupService = new $Bec([new $Cec(0)]);
        instantiationService.stub(editorGroupsService_1.$5C, editorGroupService);
        instantiationService.stub(label_1.$Vz, disposables.add(instantiationService.createInstance(labelService_1.$Bzb)));
        const editorService = overrides?.editorService ? overrides.editorService(instantiationService) : new $Eec(editorGroupService);
        instantiationService.stub(editorService_1.$9C, editorService);
        instantiationService.stub(workingCopyEditorService_1.$AD, disposables.add(instantiationService.createInstance(workingCopyEditorService_1.$BD)));
        instantiationService.stub(editorResolverService_2.$pbb, disposables.add(instantiationService.createInstance(editorResolverService_1.$Myb)));
        const textEditorService = overrides?.textEditorService ? overrides.textEditorService(instantiationService) : disposables.add(instantiationService.createInstance(textEditorService_1.$txb));
        instantiationService.stub(textEditorService_1.$sxb, textEditorService);
        instantiationService.stub(codeEditorService_1.$nV, disposables.add(new codeEditorService_2.$zyb(editorService, themeService, configService)));
        instantiationService.stub(panecomposite_1.$Yeb, disposables.add(new $xec()));
        instantiationService.stub(listService_1.$03, new $4ec());
        const hoverService = instantiationService.stub(hover_1.$zib, instantiationService.createInstance(TestHoverService));
        instantiationService.stub(quickInput_1.$Gq, disposables.add(new quickInputService_1.$JAb(configService, instantiationService, keybindingService, contextKeyService, themeService, layoutService, hoverService)));
        instantiationService.stub(workspaces_1.$fU, new $7ec());
        instantiationService.stub(workspaceTrust_1.$$z, disposables.add(new workbenchTestServices_1.$fec()));
        instantiationService.stub(workspaceTrust_1.$_z, disposables.add(new workbenchTestServices_1.$gec(false)));
        instantiationService.stub(terminal_1.$Pib, new $8ec());
        instantiationService.stub(elevatedFileService_1.$CD, new elevatedFileService_2.$o4b());
        instantiationService.stub(remoteSocketFactoryService_1.$Tk, new remoteSocketFactoryService_1.$Uk());
        return instantiationService;
    }
    exports.$lec = $lec;
    let $mec = class $mec {
        constructor(lifecycleService, textFileService, textEditorService, workingCopyFileService, filesConfigurationService, contextService, modelService, fileService, fileDialogService, dialogService, workingCopyService, editorService, environmentService, pathService, editorGroupService, editorResolverService, languageService, textModelResolverService, untitledTextEditorService, testConfigurationService, workingCopyBackupService, hostService, quickInputService, labelService, logService, uriIdentityService, instantitionService, notificationService, workingCopyEditorService, instantiationService, elevatedFileService, workspaceTrustRequestService, decorationsService) {
            this.lifecycleService = lifecycleService;
            this.textFileService = textFileService;
            this.textEditorService = textEditorService;
            this.workingCopyFileService = workingCopyFileService;
            this.filesConfigurationService = filesConfigurationService;
            this.contextService = contextService;
            this.modelService = modelService;
            this.fileService = fileService;
            this.fileDialogService = fileDialogService;
            this.dialogService = dialogService;
            this.workingCopyService = workingCopyService;
            this.editorService = editorService;
            this.environmentService = environmentService;
            this.pathService = pathService;
            this.editorGroupService = editorGroupService;
            this.editorResolverService = editorResolverService;
            this.languageService = languageService;
            this.textModelResolverService = textModelResolverService;
            this.untitledTextEditorService = untitledTextEditorService;
            this.testConfigurationService = testConfigurationService;
            this.workingCopyBackupService = workingCopyBackupService;
            this.hostService = hostService;
            this.quickInputService = quickInputService;
            this.labelService = labelService;
            this.logService = logService;
            this.uriIdentityService = uriIdentityService;
            this.instantitionService = instantitionService;
            this.notificationService = notificationService;
            this.workingCopyEditorService = workingCopyEditorService;
            this.instantiationService = instantiationService;
            this.elevatedFileService = elevatedFileService;
            this.workspaceTrustRequestService = workspaceTrustRequestService;
            this.decorationsService = decorationsService;
        }
    };
    exports.$mec = $mec;
    exports.$mec = $mec = __decorate([
        __param(0, lifecycle_1.$7y),
        __param(1, textfiles_1.$JD),
        __param(2, textEditorService_1.$sxb),
        __param(3, workingCopyFileService_1.$HD),
        __param(4, filesConfigurationService_1.$yD),
        __param(5, workspace_1.$Kh),
        __param(6, model_1.$yA),
        __param(7, files_1.$6j),
        __param(8, dialogs_1.$qA),
        __param(9, dialogs_1.$oA),
        __param(10, workingCopyService_1.$TC),
        __param(11, editorService_1.$9C),
        __param(12, environmentService_2.$hJ),
        __param(13, pathService_1.$yJ),
        __param(14, editorGroupsService_1.$5C),
        __param(15, editorResolverService_2.$pbb),
        __param(16, language_1.$ct),
        __param(17, resolverService_1.$uA),
        __param(18, untitledTextEditorService_1.$tD),
        __param(19, configuration_1.$8h),
        __param(20, workingCopyBackup_1.$EA),
        __param(21, host_1.$VT),
        __param(22, quickInput_1.$Gq),
        __param(23, label_1.$Vz),
        __param(24, log_1.$5i),
        __param(25, uriIdentity_1.$Ck),
        __param(26, instantiation_1.$Ah),
        __param(27, notification_1.$Yu),
        __param(28, workingCopyEditorService_1.$AD),
        __param(29, instantiation_1.$Ah),
        __param(30, elevatedFileService_1.$CD),
        __param(31, workspaceTrust_1.$_z),
        __param(32, decorations_1.$Gcb)
    ], $mec);
    let $nec = class $nec extends browserTextFileService_1.$k3b {
        constructor(fileService, untitledTextEditorService, lifecycleService, instantiationService, modelService, environmentService, dialogService, fileDialogService, textResourceConfigurationService, filesConfigurationService, codeEditorService, pathService, workingCopyFileService, uriIdentityService, languageService, logService, elevatedFileService, decorationsService) {
            super(fileService, untitledTextEditorService, lifecycleService, instantiationService, modelService, environmentService, dialogService, fileDialogService, textResourceConfigurationService, filesConfigurationService, codeEditorService, pathService, workingCopyFileService, uriIdentityService, languageService, elevatedFileService, logService, decorationsService);
            this.U = undefined;
            this.W = undefined;
        }
        setReadStreamErrorOnce(error) {
            this.U = error;
        }
        async readStream(resource, options) {
            if (this.U) {
                const error = this.U;
                this.U = undefined;
                throw error;
            }
            const content = await this.f.readFileStream(resource, options);
            return {
                resource: content.resource,
                name: content.name,
                mtime: content.mtime,
                ctime: content.ctime,
                etag: content.etag,
                encoding: 'utf8',
                value: await (0, textModel_1.$JC)(content.value),
                size: 10,
                readonly: false,
                locked: false
            };
        }
        setWriteErrorOnce(error) {
            this.W = error;
        }
        async write(resource, value, options) {
            if (this.W) {
                const error = this.W;
                this.W = undefined;
                throw error;
            }
            return super.write(resource, value, options);
        }
    };
    exports.$nec = $nec;
    exports.$nec = $nec = __decorate([
        __param(0, files_1.$6j),
        __param(1, untitledTextEditorService_1.$tD),
        __param(2, lifecycle_1.$7y),
        __param(3, instantiation_1.$Ah),
        __param(4, model_1.$yA),
        __param(5, environmentService_2.$hJ),
        __param(6, dialogs_1.$oA),
        __param(7, dialogs_1.$qA),
        __param(8, textResourceConfiguration_1.$FA),
        __param(9, filesConfigurationService_1.$yD),
        __param(10, codeEditorService_1.$nV),
        __param(11, pathService_1.$yJ),
        __param(12, workingCopyFileService_1.$HD),
        __param(13, uriIdentity_1.$Ck),
        __param(14, language_1.$ct),
        __param(15, log_1.$5i),
        __param(16, elevatedFileService_1.$CD),
        __param(17, decorations_1.$Gcb)
    ], $nec);
    class $oec extends browserTextFileService_1.$k3b {
        get encoding() {
            if (!this.U) {
                this.U = this.B(this.j.createInstance($pec));
            }
            return this.U;
        }
    }
    exports.$oec = $oec;
    class $pec extends textFileService_1.$j3b {
        get b() {
            return [
                { extension: 'utf16le', encoding: encoding_1.$eD },
                { extension: 'utf16be', encoding: encoding_1.$dD },
                { extension: 'utf8bom', encoding: encoding_1.$cD }
            ];
        }
        set b(overrides) { }
    }
    exports.$pec = $pec;
    class TestEnvironmentServiceWithArgs extends environmentService_1.$MT {
        constructor() {
            super(...arguments);
            this.args = [];
        }
    }
    exports.$qec = new TestEnvironmentServiceWithArgs('', uri_1.URI.file('tests').with({ scheme: 'vscode-tests' }), Object.create(null), workbenchTestServices_1.$bec);
    class $rec {
        withProgress(options, task, onDidCancel) {
            return task(progress_1.$4u.None);
        }
    }
    exports.$rec = $rec;
    class $sec {
        constructor() {
            this.onDidChangeDecorations = event_1.Event.None;
        }
        registerDecorationsProvider(_provider) { return lifecycle_2.$kc.None; }
        getDecoration(_uri, _includeChildren, _overwrite) { return undefined; }
    }
    exports.$sec = $sec;
    class $tec {
        createMenu(_id, _scopedKeybindingService) {
            return {
                onDidChange: event_1.Event.None,
                dispose: () => undefined,
                getActions: () => []
            };
        }
        resetHiddenStates() {
            // nothing
        }
    }
    exports.$tec = $tec;
    class $uec {
        constructor(a) {
            this.a = a;
        }
        async reopenLastClosedEditor() { }
        async goForward() { }
        async goBack() { }
        async goPrevious() { }
        async goLast() { }
        removeFromHistory(_input) { }
        clear() { }
        clearRecentlyOpened() { }
        getHistory() { return []; }
        async openNextRecentlyUsedEditor(group) { }
        async openPreviouslyUsedEditor(group) { }
        getLastActiveWorkspaceRoot(_schemeFilter) { return this.a; }
        getLastActiveFile(_schemeFilter) { return undefined; }
    }
    exports.$uec = $uec;
    let $vec = class $vec {
        constructor(b) {
            this.b = b;
        }
        async defaultFilePath(_schemeFilter) { return this.b.userHome(); }
        async defaultFolderPath(_schemeFilter) { return this.b.userHome(); }
        async defaultWorkspacePath(_schemeFilter) { return this.b.userHome(); }
        async preferredHome(_schemeFilter) { return this.b.userHome(); }
        pickFileFolderAndOpen(_options) { return Promise.resolve(0); }
        pickFileAndOpen(_options) { return Promise.resolve(0); }
        pickFolderAndOpen(_options) { return Promise.resolve(0); }
        pickWorkspaceAndOpen(_options) { return Promise.resolve(0); }
        setPickFileToSave(path) { this.d = path; }
        pickFileToSave(defaultUri, availableFileSystems) { return Promise.resolve(this.d); }
        showSaveDialog(_options) { return Promise.resolve(undefined); }
        showOpenDialog(_options) { return Promise.resolve(undefined); }
        setConfirmResult(result) { this.a = result; }
        showSaveConfirm(fileNamesOrResources) { return Promise.resolve(this.a); }
    };
    exports.$vec = $vec;
    exports.$vec = $vec = __decorate([
        __param(0, pathService_1.$yJ)
    ], $vec);
    class $wec {
        constructor() {
            this.openedDefaultEditors = false;
            this.dimension = { width: 800, height: 600 };
            this.offset = { top: 0, quickPickTop: 0 };
            this.hasContainer = true;
            this.container = window.document.body;
            this.onDidChangeZenMode = event_1.Event.None;
            this.onDidChangeCenteredLayout = event_1.Event.None;
            this.onDidChangeFullscreen = event_1.Event.None;
            this.onDidChangeWindowMaximized = event_1.Event.None;
            this.onDidChangePanelPosition = event_1.Event.None;
            this.onDidChangePanelAlignment = event_1.Event.None;
            this.onDidChangePartVisibility = event_1.Event.None;
            this.onDidLayout = event_1.Event.None;
            this.onDidChangeNotificationsVisibility = event_1.Event.None;
            this.whenReady = Promise.resolve(undefined);
            this.whenRestored = Promise.resolve(undefined);
        }
        layout() { }
        isRestored() { return true; }
        hasFocus(_part) { return false; }
        focusPart(_part) { }
        hasWindowBorder() { return false; }
        getWindowBorderWidth() { return 0; }
        getWindowBorderRadius() { return undefined; }
        isVisible(_part) { return true; }
        getDimension(_part) { return new dom_1.$BO(0, 0); }
        getContainer(_part) { return null; }
        isTitleBarHidden() { return false; }
        isStatusBarHidden() { return false; }
        isActivityBarHidden() { return false; }
        setActivityBarHidden(_hidden) { }
        setBannerHidden(_hidden) { }
        isSideBarHidden() { return false; }
        async setEditorHidden(_hidden) { }
        async setSideBarHidden(_hidden) { }
        async setAuxiliaryBarHidden(_hidden) { }
        async setPartHidden(_hidden, part) { }
        isPanelHidden() { return false; }
        async setPanelHidden(_hidden) { }
        toggleMaximizedPanel() { }
        isPanelMaximized() { return false; }
        getMenubarVisibility() { throw new Error('not implemented'); }
        toggleMenuBar() { }
        getSideBarPosition() { return 0; }
        getPanelPosition() { return 0; }
        getPanelAlignment() { return 'center'; }
        async setPanelPosition(_position) { }
        async setPanelAlignment(_alignment) { }
        addClass(_clazz) { }
        removeClass(_clazz) { }
        getMaximumEditorDimensions() { throw new Error('not implemented'); }
        toggleZenMode() { }
        isEditorLayoutCentered() { return false; }
        centerEditorLayout(_active) { }
        resizePart(_part, _sizeChangeWidth, _sizeChangeHeight) { }
        registerPart(part) { }
        isWindowMaximized() { return false; }
        updateWindowMaximizedState(maximized) { }
        getVisibleNeighborPart(part, direction) { return undefined; }
        focus() { }
    }
    exports.$wec = $wec;
    const activeViewlet = {};
    class $xec extends lifecycle_2.$kc {
        constructor() {
            super();
            this.a = new Map();
            this.a.set(1 /* ViewContainerLocation.Panel */, new $zec());
            this.a.set(0 /* ViewContainerLocation.Sidebar */, new $yec());
            this.onDidPaneCompositeOpen = event_1.Event.any(...([1 /* ViewContainerLocation.Panel */, 0 /* ViewContainerLocation.Sidebar */].map(loc => event_1.Event.map(this.a.get(loc).onDidPaneCompositeOpen, composite => { return { composite, viewContainerLocation: loc }; }))));
            this.onDidPaneCompositeClose = event_1.Event.any(...([1 /* ViewContainerLocation.Panel */, 0 /* ViewContainerLocation.Sidebar */].map(loc => event_1.Event.map(this.a.get(loc).onDidPaneCompositeClose, composite => { return { composite, viewContainerLocation: loc }; }))));
        }
        openPaneComposite(id, viewContainerLocation, focus) {
            return this.getPartByLocation(viewContainerLocation).openPaneComposite(id, focus);
        }
        getActivePaneComposite(viewContainerLocation) {
            return this.getPartByLocation(viewContainerLocation).getActivePaneComposite();
        }
        getPaneComposite(id, viewContainerLocation) {
            return this.getPartByLocation(viewContainerLocation).getPaneComposite(id);
        }
        getPaneComposites(viewContainerLocation) {
            return this.getPartByLocation(viewContainerLocation).getPaneComposites();
        }
        getProgressIndicator(id, viewContainerLocation) {
            return this.getPartByLocation(viewContainerLocation).getProgressIndicator(id);
        }
        hideActivePaneComposite(viewContainerLocation) {
            this.getPartByLocation(viewContainerLocation).hideActivePaneComposite();
        }
        getLastActivePaneCompositeId(viewContainerLocation) {
            return this.getPartByLocation(viewContainerLocation).getLastActivePaneCompositeId();
        }
        getPinnedPaneCompositeIds(viewContainerLocation) {
            throw new Error('Method not implemented.');
        }
        getVisiblePaneCompositeIds(viewContainerLocation) {
            throw new Error('Method not implemented.');
        }
        showActivity(id, viewContainerLocation, badge, clazz, priority) {
            throw new Error('Method not implemented.');
        }
        getPartByLocation(viewContainerLocation) {
            return (0, types_1.$uf)(this.a.get(viewContainerLocation));
        }
    }
    exports.$xec = $xec;
    class $yec {
        constructor() {
            this.onDidViewletRegisterEmitter = new event_1.$fd();
            this.onDidViewletDeregisterEmitter = new event_1.$fd();
            this.onDidViewletOpenEmitter = new event_1.$fd();
            this.onDidViewletCloseEmitter = new event_1.$fd();
            this.element = undefined;
            this.minimumWidth = 0;
            this.maximumWidth = 0;
            this.minimumHeight = 0;
            this.maximumHeight = 0;
            this.onDidChange = event_1.Event.None;
            this.onDidPaneCompositeOpen = this.onDidViewletOpenEmitter.event;
            this.onDidPaneCompositeClose = this.onDidViewletCloseEmitter.event;
        }
        openPaneComposite(id, focus) { return Promise.resolve(undefined); }
        getPaneComposites() { return []; }
        getAllViewlets() { return []; }
        getActivePaneComposite() { return activeViewlet; }
        getDefaultViewletId() { return 'workbench.view.explorer'; }
        getPaneComposite(id) { return undefined; }
        getProgressIndicator(id) { return undefined; }
        hideActivePaneComposite() { }
        getLastActivePaneCompositeId() { return undefined; }
        dispose() { }
        layout(width, height, top, left) { }
    }
    exports.$yec = $yec;
    class TestHoverService {
        showHover(options, focus) {
            this.a = new class {
                constructor() {
                    this.a = false;
                }
                get isDisposed() { return this.a; }
                dispose() {
                    this.a = true;
                }
            };
            return this.a;
        }
        showAndFocusLastHover() { }
        hideHover() {
            this.a?.dispose();
        }
    }
    class $zec {
        constructor() {
            this.element = undefined;
            this.minimumWidth = 0;
            this.maximumWidth = 0;
            this.minimumHeight = 0;
            this.maximumHeight = 0;
            this.onDidChange = event_1.Event.None;
            this.onDidPaneCompositeOpen = new event_1.$fd().event;
            this.onDidPaneCompositeClose = new event_1.$fd().event;
        }
        async openPaneComposite(id, focus) { return undefined; }
        getPaneComposite(id) { return activeViewlet; }
        getPaneComposites() { return []; }
        getPinnedPaneCompositeIds() { return []; }
        getVisiblePaneCompositeIds() { return []; }
        getActivePaneComposite() { return activeViewlet; }
        setPanelEnablement(id, enabled) { }
        dispose() { }
        showActivity(panelId, badge, clazz) { throw new Error('Method not implemented.'); }
        getProgressIndicator(id) { return null; }
        hideActivePaneComposite() { }
        getLastActivePaneCompositeId() { return undefined; }
        layout(width, height, top, left) { }
    }
    exports.$zec = $zec;
    class $Aec {
        constructor() {
            this.onDidChangeViewContainerVisibility = new event_1.$fd().event;
            this.onDidChangeViewVisibilityEmitter = new event_1.$fd();
            this.onDidChangeViewVisibility = this.onDidChangeViewVisibilityEmitter.event;
            this.onDidChangeFocusedViewEmitter = new event_1.$fd();
            this.onDidChangeFocusedView = this.onDidChangeFocusedViewEmitter.event;
        }
        isViewContainerVisible(id) { return true; }
        getVisibleViewContainer() { return null; }
        openViewContainer(id, focus) { return Promise.resolve(null); }
        closeViewContainer(id) { }
        isViewVisible(id) { return true; }
        getActiveViewWithId(id) { return null; }
        getViewWithId(id) { return null; }
        openView(id, focus) { return Promise.resolve(null); }
        closeView(id) { }
        getViewProgressIndicator(id) { return null; }
        getActiveViewPaneContainerWithId(id) { return null; }
        getFocusedViewName() { return ''; }
    }
    exports.$Aec = $Aec;
    class $Bec {
        constructor(groups = []) {
            this.groups = groups;
            this.onDidChangeActiveGroup = event_1.Event.None;
            this.onDidActivateGroup = event_1.Event.None;
            this.onDidAddGroup = event_1.Event.None;
            this.onDidRemoveGroup = event_1.Event.None;
            this.onDidMoveGroup = event_1.Event.None;
            this.onDidChangeGroupIndex = event_1.Event.None;
            this.onDidChangeGroupLocked = event_1.Event.None;
            this.onDidLayout = event_1.Event.None;
            this.onDidChangeEditorPartOptions = event_1.Event.None;
            this.onDidScroll = event_1.Event.None;
            this.orientation = 0 /* GroupOrientation.HORIZONTAL */;
            this.isReady = true;
            this.whenReady = Promise.resolve(undefined);
            this.whenRestored = Promise.resolve(undefined);
            this.hasRestorableState = false;
            this.contentDimension = { width: 800, height: 600 };
        }
        get activeGroup() { return this.groups[0]; }
        get sideGroup() { return this.groups[0]; }
        get count() { return this.groups.length; }
        getGroups(_order) { return this.groups; }
        getGroup(identifier) { return this.groups.find(group => group.id === identifier); }
        getLabel(_identifier) { return 'Group 1'; }
        findGroup(_scope, _source, _wrap) { throw new Error('not implemented'); }
        activateGroup(_group) { throw new Error('not implemented'); }
        restoreGroup(_group) { throw new Error('not implemented'); }
        getSize(_group) { return { width: 100, height: 100 }; }
        setSize(_group, _size) { }
        arrangeGroups(_arrangement) { }
        applyLayout(_layout) { }
        getLayout() { throw new Error('not implemented'); }
        setGroupOrientation(_orientation) { }
        addGroup(_location, _direction) { throw new Error('not implemented'); }
        removeGroup(_group) { }
        moveGroup(_group, _location, _direction) { throw new Error('not implemented'); }
        mergeGroup(_group, _target, _options) { throw new Error('not implemented'); }
        mergeAllGroups() { throw new Error('not implemented'); }
        copyGroup(_group, _location, _direction) { throw new Error('not implemented'); }
        centerLayout(active) { }
        isLayoutCentered() { return false; }
        enforcePartOptions(options) { return lifecycle_2.$kc.None; }
    }
    exports.$Bec = $Bec;
    class $Cec {
        constructor(id) {
            this.id = id;
            this.editors = [];
            this.whenRestored = Promise.resolve(undefined);
            this.isEmpty = true;
            this.onWillDispose = event_1.Event.None;
            this.onDidModelChange = event_1.Event.None;
            this.onWillCloseEditor = event_1.Event.None;
            this.onDidCloseEditor = event_1.Event.None;
            this.onDidOpenEditorFail = event_1.Event.None;
            this.onDidFocus = event_1.Event.None;
            this.onDidChange = event_1.Event.None;
            this.onWillMoveEditor = event_1.Event.None;
            this.onWillOpenEditor = event_1.Event.None;
            this.onDidActiveEditorChange = event_1.Event.None;
        }
        getEditors(_order) { return []; }
        findEditors(_resource) { return []; }
        getEditorByIndex(_index) { throw new Error('not implemented'); }
        getIndexOfEditor(_editor) { return -1; }
        isFirst(editor) { return false; }
        isLast(editor) { return false; }
        openEditor(_editor, _options) { throw new Error('not implemented'); }
        openEditors(_editors) { throw new Error('not implemented'); }
        isPinned(_editor) { return false; }
        isSticky(_editor) { return false; }
        isActive(_editor) { return false; }
        contains(candidate) { return false; }
        moveEditor(_editor, _target, _options) { }
        moveEditors(_editors, _target) { }
        copyEditor(_editor, _target, _options) { }
        copyEditors(_editors, _target) { }
        async closeEditor(_editor, options) { return true; }
        async closeEditors(_editors, options) { return true; }
        async closeAllEditors(options) { return true; }
        async replaceEditors(_editors) { }
        pinEditor(_editor) { }
        stickEditor(editor) { }
        unstickEditor(editor) { }
        lock(locked) { }
        focus() { }
        get scopedContextKeyService() { throw new Error('not implemented'); }
        setActive(_isActive) { }
        notifyIndexChanged(_index) { }
        dispose() { }
        toJSON() { return Object.create(null); }
        layout(_width, _height) { }
        relayout() { }
    }
    exports.$Cec = $Cec;
    class $Dec {
        constructor() {
            this.groups = [];
            this.partOptions = {};
            this.onDidChangeEditorPartOptions = event_1.Event.None;
            this.onDidVisibilityChange = event_1.Event.None;
        }
        getGroup(identifier) { throw new Error('Method not implemented.'); }
        getGroups(order) { throw new Error('Method not implemented.'); }
        activateGroup(identifier) { throw new Error('Method not implemented.'); }
        restoreGroup(identifier) { throw new Error('Method not implemented.'); }
        addGroup(location, direction) { throw new Error('Method not implemented.'); }
        mergeGroup(group, target, options) { throw new Error('Method not implemented.'); }
        moveGroup(group, location, direction) { throw new Error('Method not implemented.'); }
        copyGroup(group, location, direction) { throw new Error('Method not implemented.'); }
        removeGroup(group) { throw new Error('Method not implemented.'); }
        arrangeGroups(arrangement, target) { throw new Error('Method not implemented.'); }
    }
    exports.$Dec = $Dec;
    class $Eec {
        get activeTextEditorControl() { return this.a; }
        set activeTextEditorControl(value) { this.a = value; }
        get activeEditor() { return this.b; }
        set activeEditor(value) { this.b = value; }
        constructor(d) {
            this.d = d;
            this.onDidActiveEditorChange = event_1.Event.None;
            this.onDidVisibleEditorsChange = event_1.Event.None;
            this.onDidEditorsChange = event_1.Event.None;
            this.onDidCloseEditor = event_1.Event.None;
            this.onDidOpenEditorFail = event_1.Event.None;
            this.onDidMostRecentlyActiveEditorsChange = event_1.Event.None;
            this.editors = [];
            this.mostRecentlyActiveEditors = [];
            this.visibleEditorPanes = [];
            this.visibleTextEditorControls = [];
            this.visibleEditors = [];
            this.count = this.editors.length;
        }
        getEditors() { return []; }
        findEditors() { return []; }
        async openEditor(editor, optionsOrGroup, group) {
            return undefined;
        }
        async closeEditor(editor, options) { }
        async closeEditors(editors, options) { }
        doResolveEditorOpenRequest(editor) {
            if (!this.d) {
                return undefined;
            }
            return [this.d.activeGroup, editor, undefined];
        }
        openEditors(_editors, _group) { throw new Error('not implemented'); }
        isOpened(_editor) { return false; }
        isVisible(_editor) { return false; }
        replaceEditors(_editors, _group) { return Promise.resolve(undefined); }
        save(editors, options) { throw new Error('Method not implemented.'); }
        saveAll(options) { throw new Error('Method not implemented.'); }
        revert(editors, options) { throw new Error('Method not implemented.'); }
        revertAll(options) { throw new Error('Method not implemented.'); }
    }
    exports.$Eec = $Eec;
    class $Fec {
        constructor() {
            this.a = new event_1.$fd();
            this.b = new event_1.$fd();
            this.d = new event_1.$fd();
            this.onWillActivateFileSystemProvider = event_1.Event.None;
            this.onDidWatchError = event_1.Event.None;
            this.e = 'Hello Html';
            this.readonly = false;
            this.notExistsSet = new map_1.$zi();
            this.readShouldThrowError = undefined;
            this.writeShouldThrowError = undefined;
            this.onDidChangeFileSystemProviderRegistrations = event_1.Event.None;
            this.g = new Map();
            this.watches = [];
        }
        get onDidFilesChange() { return this.a.event; }
        fireFileChanges(event) { this.a.fire(event); }
        get onDidRunOperation() { return this.b.event; }
        fireAfterOperation(event) { this.b.fire(event); }
        get onDidChangeFileSystemProviderCapabilities() { return this.d.event; }
        fireFileSystemProviderCapabilitiesChangeEvent(event) { this.d.fire(event); }
        setContent(content) { this.e = content; }
        getContent() { return this.e; }
        getLastReadFileUri() { return this.f; }
        async resolve(resource, _options) {
            return (0, workbenchTestServices_1.$0dc)(resource, this.readonly);
        }
        stat(resource) {
            return this.resolve(resource, { resolveMetadata: true });
        }
        async resolveAll(toResolve) {
            const stats = await Promise.all(toResolve.map(resourceAndOption => this.resolve(resourceAndOption.resource, resourceAndOption.options)));
            return stats.map(stat => ({ stat, success: true }));
        }
        async exists(_resource) { return !this.notExistsSet.has(_resource); }
        async readFile(resource, options) {
            if (this.readShouldThrowError) {
                throw this.readShouldThrowError;
            }
            this.f = resource;
            return {
                ...(0, workbenchTestServices_1.$0dc)(resource, this.readonly),
                value: buffer_1.$Fd.fromString(this.e)
            };
        }
        async readFileStream(resource, options) {
            if (this.readShouldThrowError) {
                throw this.readShouldThrowError;
            }
            this.f = resource;
            return {
                ...(0, workbenchTestServices_1.$0dc)(resource, this.readonly),
                value: (0, buffer_1.$Td)(buffer_1.$Fd.fromString(this.e))
            };
        }
        async writeFile(resource, bufferOrReadable, options) {
            await (0, async_1.$Hg)(0);
            if (this.writeShouldThrowError) {
                throw this.writeShouldThrowError;
            }
            return (0, workbenchTestServices_1.$0dc)(resource, this.readonly);
        }
        move(_source, _target, _overwrite) { return Promise.resolve(null); }
        copy(_source, _target, _overwrite) { return Promise.resolve(null); }
        async cloneFile(_source, _target) { }
        createFile(_resource, _content, _options) { return Promise.resolve(null); }
        createFolder(_resource) { return Promise.resolve(null); }
        registerProvider(scheme, provider) {
            this.g.set(scheme, provider);
            return (0, lifecycle_2.$ic)(() => this.g.delete(scheme));
        }
        getProvider(scheme) {
            return this.g.get(scheme);
        }
        async activateProvider(_scheme) { return; }
        async canHandleResource(resource) { return this.hasProvider(resource); }
        hasProvider(resource) { return resource.scheme === network_1.Schemas.file || this.g.has(resource.scheme); }
        listCapabilities() {
            return [
                { scheme: network_1.Schemas.file, capabilities: 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */ },
                ...iterator_1.Iterable.map(this.g, ([scheme, p]) => { return { scheme, capabilities: p.capabilities }; })
            ];
        }
        hasCapability(resource, capability) {
            if (capability === 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */ && platform_1.$k) {
                return true;
            }
            const provider = this.getProvider(resource.scheme);
            return !!(provider && (provider.capabilities & capability));
        }
        async del(_resource, _options) { }
        watch(_resource) {
            this.watches.push(_resource);
            return (0, lifecycle_2.$ic)(() => this.watches.splice(this.watches.indexOf(_resource), 1));
        }
        getWriteEncoding(_resource) { return { encoding: 'utf8', hasBOM: false }; }
        dispose() { }
        async canCreateFile(source, options) { return true; }
        async canMove(source, target, overwrite) { return true; }
        async canCopy(source, target, overwrite) { return true; }
        async canDelete(resource, options) { return true; }
    }
    exports.$Fec = $Fec;
    class $Gec extends workingCopyBackupService_1.$i4b {
        constructor() {
            super();
            this.resolved = new Set();
        }
        parseBackupContent(textBufferFactory) {
            const textBuffer = textBufferFactory.create(1 /* DefaultEndOfLine.LF */).textBuffer;
            const lineCount = textBuffer.getLineCount();
            const range = new range_1.$ks(1, 1, lineCount, textBuffer.getLineLength(lineCount) + 1);
            return textBuffer.getValueInRange(range, 0 /* EndOfLinePreference.TextDefined */);
        }
        async resolve(identifier) {
            this.resolved.add(identifier);
            return super.resolve(identifier);
        }
    }
    exports.$Gec = $Gec;
    function $Hec(resource) {
        return $Iec(resource, '');
    }
    exports.$Hec = $Hec;
    function $Iec(resource, typeId = 'testBackupTypeId') {
        return { typeId, resource };
    }
    exports.$Iec = $Iec;
    class $Jec extends workingCopyBackupService_2.$m4b {
        constructor() {
            const disposables = new lifecycle_2.$jc();
            const environmentService = exports.$qec;
            const logService = new log_1.$fj();
            const fileService = disposables.add(new fileService_1.$Dp(logService));
            disposables.add(fileService.registerProvider(network_1.Schemas.file, disposables.add(new inMemoryFilesystemProvider_1.$rAb())));
            disposables.add(fileService.registerProvider(network_1.Schemas.vscodeUserData, disposables.add(new inMemoryFilesystemProvider_1.$rAb())));
            super(new workbenchTestServices_1.$6dc(testWorkspace_1.$$0b), environmentService, fileService, logService);
            this.f = [];
            this.j = [];
            this.discardedBackups = [];
            this.B(disposables);
        }
        testGetFileService() {
            return this.b;
        }
        joinBackupResource() {
            return new Promise(resolve => this.f.push(resolve));
        }
        joinDiscardBackup() {
            return new Promise(resolve => this.j.push(resolve));
        }
        async backup(identifier, content, versionId, meta, token) {
            await super.backup(identifier, content, versionId, meta, token);
            while (this.f.length) {
                this.f.pop()();
            }
        }
        async discardBackup(identifier) {
            await super.discardBackup(identifier);
            this.discardedBackups.push(identifier);
            while (this.j.length) {
                this.j.pop()();
            }
        }
        async getBackupContents(identifier) {
            const backupResource = this.toBackupResource(identifier);
            const fileContents = await this.b.readFile(backupResource);
            return fileContents.value.toString();
        }
    }
    exports.$Jec = $Jec;
    class $Kec extends lifecycle_2.$kc {
        constructor() {
            super(...arguments);
            this.a = this.B(new event_1.$fd());
            this.b = this.B(new event_1.$fd());
            this.f = this.B(new event_1.$fd());
            this.g = this.B(new event_1.$fd());
            this.h = this.B(new event_1.$fd());
            this.shutdownJoiners = [];
        }
        get onBeforeShutdown() { return this.a.event; }
        get onBeforeShutdownError() { return this.b.event; }
        get onShutdownVeto() { return this.f.event; }
        get onWillShutdown() { return this.g.event; }
        get onDidShutdown() { return this.h.event; }
        async when() { }
        fireShutdown(reason = 2 /* ShutdownReason.QUIT */) {
            this.shutdownJoiners = [];
            this.g.fire({
                join: p => {
                    this.shutdownJoiners.push(p);
                },
                joiners: () => [],
                force: () => { },
                token: cancellation_1.CancellationToken.None,
                reason
            });
        }
        fireBeforeShutdown(event) { this.a.fire(event); }
        fireWillShutdown(event) { this.g.fire(event); }
        async shutdown() {
            this.fireShutdown();
        }
    }
    exports.$Kec = $Kec;
    class $Lec {
        constructor() {
            this.reason = 1 /* ShutdownReason.CLOSE */;
        }
        veto(value) {
            this.value = value;
        }
        finalVeto(vetoFn) {
            this.value = vetoFn();
            this.finalValue = vetoFn;
        }
    }
    exports.$Lec = $Lec;
    class $Mec {
        constructor() {
            this.value = [];
            this.joiners = () => [];
            this.reason = 1 /* ShutdownReason.CLOSE */;
            this.token = cancellation_1.CancellationToken.None;
        }
        join(promise, joiner) {
            this.value.push(promise);
        }
        force() { }
    }
    exports.$Mec = $Mec;
    class $Nec {
        constructor(a = new testConfigurationService_1.$G0b()) {
            this.a = a;
        }
        onDidChangeConfiguration() {
            return { dispose() { } };
        }
        getValue(resource, arg2, arg3) {
            const position = position_1.$js.isIPosition(arg2) ? arg2 : null;
            const section = position ? (typeof arg3 === 'string' ? arg3 : undefined) : (typeof arg2 === 'string' ? arg2 : undefined);
            return this.a.getValue(section, { resource });
        }
        inspect(resource, position, section) {
            return this.a.inspect(section, { resource });
        }
        updateValue(resource, key, value, configurationTarget) {
            return this.a.updateValue(key, value);
        }
    }
    exports.$Nec = $Nec;
    class $Oec {
        constructor(a, b) {
            this.a = a;
            this.b = b;
            this.capabilities = this.a.capabilities;
            this.onDidChangeCapabilities = this.a.onDidChangeCapabilities;
            this.onDidChangeFile = event_1.Event.map(this.a.onDidChangeFile, changes => changes.map((c) => {
                return {
                    type: c.type,
                    resource: c.resource.with({ scheme: network_1.Schemas.vscodeRemote, authority: this.b }),
                };
            }));
        }
        watch(resource, opts) { return this.a.watch(this.d(resource), opts); }
        stat(resource) { return this.a.stat(this.d(resource)); }
        mkdir(resource) { return this.a.mkdir(this.d(resource)); }
        readdir(resource) { return this.a.readdir(this.d(resource)); }
        delete(resource, opts) { return this.a.delete(this.d(resource), opts); }
        rename(from, to, opts) { return this.a.rename(this.d(from), this.d(to), opts); }
        copy(from, to, opts) { return this.a.copy(this.d(from), this.d(to), opts); }
        readFile(resource) { return this.a.readFile(this.d(resource)); }
        writeFile(resource, content, opts) { return this.a.writeFile(this.d(resource), content, opts); }
        open(resource, opts) { return this.a.open(this.d(resource), opts); }
        close(fd) { return this.a.close(fd); }
        read(fd, pos, data, offset, length) { return this.a.read(fd, pos, data, offset, length); }
        write(fd, pos, data, offset, length) { return this.a.write(fd, pos, data, offset, length); }
        readFileStream(resource, opts, token) { return this.a.readFileStream(this.d(resource), opts, token); }
        d(resource) { return resource.with({ scheme: network_1.Schemas.file, authority: '' }); }
    }
    exports.$Oec = $Oec;
    class $Pec extends inMemoryFilesystemProvider_1.$rAb {
        get capabilities() {
            return 2 /* FileSystemProviderCapabilities.FileReadWrite */
                | 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */
                | 16 /* FileSystemProviderCapabilities.FileReadStream */;
        }
        readFileStream(resource) {
            const BUFFER_SIZE = 64 * 1024;
            const stream = (0, stream_1.$td)(data => buffer_1.$Fd.concat(data.map(data => buffer_1.$Fd.wrap(data))).buffer);
            (async () => {
                try {
                    const data = await this.readFile(resource);
                    let offset = 0;
                    while (offset < data.length) {
                        await (0, async_1.$Hg)(0);
                        await stream.write(data.subarray(offset, offset + BUFFER_SIZE));
                        offset += BUFFER_SIZE;
                    }
                    await (0, async_1.$Hg)(0);
                    stream.end();
                }
                catch (error) {
                    stream.end(error);
                }
            })();
            return stream;
        }
    }
    exports.$Pec = $Pec;
    exports.$Qec = { _serviceBrand: undefined, ...product_1.default };
    class $Rec {
        constructor() {
            this.a = true;
            this.b = new event_1.$fd();
            this.onDidChangeFocus = this.b.event;
            this.colorScheme = theme_1.ColorScheme.DARK;
            this.onDidChangeColorScheme = event_1.Event.None;
        }
        get hasFocus() { return this.a; }
        async hadLastFocus() { return this.a; }
        setFocus(focus) {
            this.a = focus;
            this.b.fire(this.a);
        }
        async restart() { }
        async reload() { }
        async close() { }
        async withExpectedShutdown(expectedShutdownTask) {
            return await expectedShutdownTask();
        }
        async focus(options) { }
        async openWindow(arg1, arg2) { }
        async toggleFullScreen() { }
    }
    exports.$Rec = $Rec;
    class $Sec extends filesConfigurationService_1.$zD {
        testOnFilesConfigurationChange(configuration) {
            super.L(configuration);
        }
    }
    exports.$Sec = $Sec;
    class $Tec extends textFileEditorModel_1.$Hyb {
        isReadonly() {
            return true;
        }
    }
    exports.$Tec = $Tec;
    class $Uec extends editorInput_1.$tA {
        constructor(resource, j) {
            super();
            this.resource = resource;
            this.j = j;
        }
        get typeId() {
            return this.j;
        }
        get editorId() {
            return this.j;
        }
        resolve() {
            return Promise.resolve(null);
        }
    }
    exports.$Uec = $Uec;
    function $Vec(id, inputs, serializerInputId) {
        const disposables = new lifecycle_2.$jc();
        class TestEditor extends editorPane_1.$0T {
            constructor() {
                super(id, telemetryUtils_1.$bo, new testThemeService_1.$K0b(), disposables.add(new workbenchTestServices_1.$7dc()));
                this.a = new mockKeybindingService_1.$S0b();
            }
            async setInput(input, options, context, token) {
                super.setInput(input, options, context, token);
                await input.resolve();
            }
            getId() { return id; }
            layout() { }
            ab() { }
            get scopedContextKeyService() {
                return this.a;
            }
        }
        disposables.add(platform_2.$8m.as(editor_1.$GE.EditorPane).registerEditorPane(editor_2.$_T.create(TestEditor, id, 'Test Editor Control'), inputs));
        if (serializerInputId) {
            class EditorsObserverTestEditorInputSerializer {
                canSerialize(editorInput) {
                    return true;
                }
                serialize(editorInput) {
                    const testEditorInput = editorInput;
                    const testInput = {
                        resource: testEditorInput.resource.toString()
                    };
                    return JSON.stringify(testInput);
                }
                deserialize(instantiationService, serializedEditorInput) {
                    const testInput = JSON.parse(serializedEditorInput);
                    return new $Zec(uri_1.URI.parse(testInput.resource), serializerInputId);
                }
            }
            disposables.add(platform_2.$8m.as(editor_1.$GE.EditorFactory).registerEditorSerializer(serializerInputId, EditorsObserverTestEditorInputSerializer));
        }
        return disposables;
    }
    exports.$Vec = $Vec;
    function $Wec() {
        const disposables = new lifecycle_2.$jc();
        disposables.add(platform_2.$8m.as(editor_1.$GE.EditorPane).registerEditorPane(editor_2.$_T.create($jec, $jec.ID, 'Text File Editor'), [new descriptors_1.$yh(fileEditorInput_1.$ULb)]));
        return disposables;
    }
    exports.$Wec = $Wec;
    function $Xec() {
        const disposables = new lifecycle_2.$jc();
        disposables.add(platform_2.$8m.as(editor_1.$GE.EditorPane).registerEditorPane(editor_2.$_T.create($iec, $iec.ID, 'Text Editor'), [
            new descriptors_1.$yh(untitledTextEditorInput_1.$Bvb),
            new descriptors_1.$yh(textResourceEditorInput_1.$7eb)
        ]));
        return disposables;
    }
    exports.$Xec = $Xec;
    function $Yec() {
        const disposables = new lifecycle_2.$jc();
        disposables.add(platform_2.$8m.as(editor_1.$GE.EditorPane).registerEditorPane(editor_2.$_T.create(sideBySideEditor_1.$dub, sideBySideEditor_1.$dub.ID, 'Text Editor'), [
            new descriptors_1.$yh(sideBySideEditorInput_1.$VC)
        ]));
        return disposables;
    }
    exports.$Yec = $Yec;
    class $Zec extends editorInput_1.$tA {
        constructor(resource, m) {
            super();
            this.resource = resource;
            this.m = m;
            this.preferredResource = this.resource;
            this.gotDisposed = false;
            this.gotSaved = false;
            this.gotSavedAs = false;
            this.gotReverted = false;
            this.dirty = false;
            this.j = false;
            this.disableToUntyped = false;
            this.n = 0 /* EditorInputCapabilities.None */;
            this.movedEditor = undefined;
        }
        get typeId() { return this.m; }
        get editorId() { return this.m; }
        get capabilities() { return this.n; }
        set capabilities(capabilities) {
            if (this.n !== capabilities) {
                this.n = capabilities;
                this.f.fire();
            }
        }
        resolve() { return !this.j ? Promise.resolve(null) : Promise.reject(new Error('fails')); }
        matches(other) {
            if (super.matches(other)) {
                return true;
            }
            if (other instanceof editorInput_1.$tA) {
                return !!(other?.resource && this.resource.toString() === other.resource.toString() && other instanceof $Zec && other.typeId === this.typeId);
            }
            return (0, resources_1.$bg)(this.resource, other.resource) && (this.editorId === other.options?.override || other.options?.override === undefined);
        }
        setPreferredResource(resource) { }
        async setEncoding(encoding) { }
        getEncoding() { return undefined; }
        setPreferredName(name) { }
        setPreferredDescription(description) { }
        setPreferredEncoding(encoding) { }
        setPreferredContents(contents) { }
        setLanguageId(languageId, source) { }
        setPreferredLanguageId(languageId) { }
        setForceOpenAsBinary() { }
        setFailToOpen() {
            this.j = true;
        }
        async save(groupId, options) {
            this.gotSaved = true;
            this.dirty = false;
            return this;
        }
        async saveAs(groupId, options) {
            this.gotSavedAs = true;
            return this;
        }
        async revert(group, options) {
            this.gotReverted = true;
            this.gotSaved = false;
            this.gotSavedAs = false;
            this.dirty = false;
        }
        toUntyped() {
            if (this.disableToUntyped) {
                return undefined;
            }
            return { resource: this.resource };
        }
        setModified() { this.modified = true; }
        isModified() {
            return this.modified === undefined ? this.dirty : this.modified;
        }
        setDirty() { this.dirty = true; }
        isDirty() {
            return this.dirty;
        }
        isResolved() { return false; }
        dispose() {
            super.dispose();
            this.gotDisposed = true;
        }
        async rename() { return this.movedEditor; }
    }
    exports.$Zec = $Zec;
    class $1ec extends $Zec {
        get capabilities() { return 8 /* EditorInputCapabilities.Singleton */; }
    }
    exports.$1ec = $1ec;
    class $2ec extends editorPart_1.$Sxb {
        testSaveState() {
            return super.G();
        }
        clearState() {
            const workspaceMemento = this.F(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            for (const key of Object.keys(workspaceMemento)) {
                delete workspaceMemento[key];
            }
            const profileMemento = this.F(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            for (const key of Object.keys(profileMemento)) {
                delete profileMemento[key];
            }
        }
    }
    exports.$2ec = $2ec;
    async function $3ec(instantiationService, disposables) {
        const part = disposables.add(instantiationService.createInstance($2ec));
        part.create(document.createElement('div'));
        part.layout(1080, 800, 0, 0);
        await part.whenReady;
        return part;
    }
    exports.$3ec = $3ec;
    class $4ec {
        constructor() {
            this.lastFocusedList = undefined;
        }
        register() {
            return lifecycle_2.$kc.None;
        }
    }
    exports.$4ec = $4ec;
    class $5ec {
        constructor(a = uri_1.URI.from({ scheme: network_1.Schemas.file, path: '/' }), defaultUriScheme = network_1.Schemas.file) {
            this.a = a;
            this.defaultUriScheme = defaultUriScheme;
        }
        hasValidBasename(resource, arg2, name) {
            if (typeof arg2 === 'string' || typeof arg2 === 'undefined') {
                return (0, extpath_1.$Gf)(arg2 ?? (0, resources_1.$fg)(resource));
            }
            return (0, extpath_1.$Gf)(name ?? (0, resources_1.$fg)(resource));
        }
        get path() { return Promise.resolve(platform_1.$i ? path_1.$5d : path_1.$6d); }
        userHome(options) {
            return options?.preferLocal ? this.a : Promise.resolve(this.a);
        }
        get resolvedUserHome() { return this.a; }
        async fileURI(path) {
            return uri_1.URI.file(path);
        }
    }
    exports.$5ec = $5ec;
    function $6ec(model) {
        const candidate = model;
        return candidate?.lastResolvedFileStat;
    }
    exports.$6ec = $6ec;
    class $7ec {
        constructor() {
            this.onDidChangeRecentlyOpened = event_1.Event.None;
        }
        async createUntitledWorkspace(folders, remoteAuthority) { throw new Error('Method not implemented.'); }
        async deleteUntitledWorkspace(workspace) { }
        async addRecentlyOpened(recents) { }
        async removeRecentlyOpened(workspaces) { }
        async clearRecentlyOpened() { }
        async getRecentlyOpened() { return { files: [], workspaces: [] }; }
        async getDirtyWorkspaces() { return []; }
        async enterWorkspace(path) { throw new Error('Method not implemented.'); }
        async getWorkspaceIdentifier(workspacePath) { throw new Error('Method not implemented.'); }
    }
    exports.$7ec = $7ec;
    class $8ec {
        constructor() {
            this.onDidCreateInstance = event_1.Event.None;
        }
        convertProfileToShellLaunchConfig(shellLaunchConfigOrProfile, cwd) { throw new Error('Method not implemented.'); }
        preparePathForTerminalAsync(path, executable, title, shellType, remoteAuthority) { throw new Error('Method not implemented.'); }
        createInstance(options, target) { throw new Error('Method not implemented.'); }
        async getBackend(remoteAuthority) { throw new Error('Method not implemented.'); }
        didRegisterBackend(remoteAuthority) { throw new Error('Method not implemented.'); }
        getRegisteredBackends() { throw new Error('Method not implemented.'); }
    }
    exports.$8ec = $8ec;
    class $9ec {
        constructor() {
            this.instances = [];
            this.onDidDisposeInstance = event_1.Event.None;
            this.onDidFocusInstance = event_1.Event.None;
            this.onDidChangeInstanceCapability = event_1.Event.None;
            this.onDidChangeActiveInstance = event_1.Event.None;
            this.onDidChangeInstances = event_1.Event.None;
        }
        openEditor(instance, editorOptions) { throw new Error('Method not implemented.'); }
        detachInstance(instance) { throw new Error('Method not implemented.'); }
        splitInstance(instanceToSplit, shellLaunchConfig) { throw new Error('Method not implemented.'); }
        revealActiveEditor(preserveFocus) { throw new Error('Method not implemented.'); }
        resolveResource(instance) { throw new Error('Method not implemented.'); }
        reviveInput(deserializedInput) { throw new Error('Method not implemented.'); }
        getInputFromResource(resource) { throw new Error('Method not implemented.'); }
        setActiveInstance(instance) { throw new Error('Method not implemented.'); }
        focusActiveInstance() { throw new Error('Method not implemented.'); }
        getInstanceFromResource(resource) { throw new Error('Method not implemented.'); }
        focusFindWidget() { throw new Error('Method not implemented.'); }
        hideFindWidget() { throw new Error('Method not implemented.'); }
        findNext() { throw new Error('Method not implemented.'); }
        findPrevious() { throw new Error('Method not implemented.'); }
    }
    exports.$9ec = $9ec;
    class $0ec {
        constructor() {
            this.instances = [];
            this.groups = [];
            this.activeGroupIndex = 0;
            this.lastAccessedMenu = 'inline-tab';
            this.onDidChangeActiveGroup = event_1.Event.None;
            this.onDidDisposeGroup = event_1.Event.None;
            this.onDidShow = event_1.Event.None;
            this.onDidChangeGroups = event_1.Event.None;
            this.onDidChangePanelOrientation = event_1.Event.None;
            this.onDidDisposeInstance = event_1.Event.None;
            this.onDidFocusInstance = event_1.Event.None;
            this.onDidChangeInstanceCapability = event_1.Event.None;
            this.onDidChangeActiveInstance = event_1.Event.None;
            this.onDidChangeInstances = event_1.Event.None;
        }
        createGroup(instance) { throw new Error('Method not implemented.'); }
        getGroupForInstance(instance) { throw new Error('Method not implemented.'); }
        moveGroup(source, target) { throw new Error('Method not implemented.'); }
        moveGroupToEnd(source) { throw new Error('Method not implemented.'); }
        moveInstance(source, target, side) { throw new Error('Method not implemented.'); }
        unsplitInstance(instance) { throw new Error('Method not implemented.'); }
        joinInstances(instances) { throw new Error('Method not implemented.'); }
        instanceIsSplit(instance) { throw new Error('Method not implemented.'); }
        getGroupLabels() { throw new Error('Method not implemented.'); }
        setActiveGroupByIndex(index) { throw new Error('Method not implemented.'); }
        setActiveGroupToNext() { throw new Error('Method not implemented.'); }
        setActiveGroupToPrevious() { throw new Error('Method not implemented.'); }
        setActiveInstanceByIndex(terminalIndex) { throw new Error('Method not implemented.'); }
        setContainer(container) { throw new Error('Method not implemented.'); }
        showPanel(focus) { throw new Error('Method not implemented.'); }
        hidePanel() { throw new Error('Method not implemented.'); }
        focusTabs() { throw new Error('Method not implemented.'); }
        focusHover() { throw new Error('Method not implemented.'); }
        setActiveInstance(instance) { throw new Error('Method not implemented.'); }
        focusActiveInstance() { throw new Error('Method not implemented.'); }
        getInstanceFromResource(resource) { throw new Error('Method not implemented.'); }
        focusFindWidget() { throw new Error('Method not implemented.'); }
        hideFindWidget() { throw new Error('Method not implemented.'); }
        findNext() { throw new Error('Method not implemented.'); }
        findPrevious() { throw new Error('Method not implemented.'); }
        updateVisibility() { throw new Error('Method not implemented.'); }
    }
    exports.$0ec = $0ec;
    class $$ec {
        constructor() {
            this.availableProfiles = [];
            this.contributedProfiles = [];
            this.profilesReady = Promise.resolve();
            this.onDidChangeAvailableProfiles = event_1.Event.None;
        }
        getPlatformKey() { throw new Error('Method not implemented.'); }
        refreshAvailableProfiles() { throw new Error('Method not implemented.'); }
        getDefaultProfileName() { throw new Error('Method not implemented.'); }
        getDefaultProfile() { throw new Error('Method not implemented.'); }
        getContributedDefaultProfile(shellLaunchConfig) { throw new Error('Method not implemented.'); }
        registerContributedProfile(args) { throw new Error('Method not implemented.'); }
        getContributedProfileProvider(extensionIdentifier, id) { throw new Error('Method not implemented.'); }
        registerTerminalProfileProvider(extensionIdentifier, id, profileProvider) { throw new Error('Method not implemented.'); }
    }
    exports.$$ec = $$ec;
    class $_ec {
        constructor() {
            this.defaultProfileName = '';
        }
        resolveIcon(shellLaunchConfig) { }
        async resolveShellLaunchConfig(shellLaunchConfig, options) { }
        async getDefaultProfile(options) { return { path: '/default', profileName: 'Default', isDefault: true }; }
        async getDefaultShell(options) { return '/default'; }
        async getDefaultShellArgs(options) { return []; }
        getDefaultIcon() { return codicons_1.$Pj.terminal; }
        async getEnvironment() { return process_1.env; }
        getSafeConfigValue(key, os) { return undefined; }
        getSafeConfigValueFullKey(key) { return undefined; }
        createProfileFromShellAndShellArgs(shell, shellArgs) { throw new Error('Method not implemented.'); }
    }
    exports.$_ec = $_ec;
    class $afc {
        constructor() {
            this.onShow = event_1.Event.None;
            this.onHide = event_1.Event.None;
            this.quickAccess = undefined;
        }
        async pick(picks, options, token) {
            if (Array.isArray(picks)) {
                return { label: 'selectedPick', description: 'pick description', value: 'selectedPick' };
            }
            else {
                return undefined;
            }
        }
        async input(options, token) { return options ? 'resolved' + options.prompt : 'resolved'; }
        createQuickPick() { throw new Error('not implemented.'); }
        createInputBox() { throw new Error('not implemented.'); }
        createQuickWidget() { throw new Error('Method not implemented.'); }
        focus() { throw new Error('not implemented.'); }
        toggle() { throw new Error('not implemented.'); }
        navigate(next, quickNavigate) { throw new Error('not implemented.'); }
        accept() { throw new Error('not implemented.'); }
        back() { throw new Error('not implemented.'); }
        cancel() { throw new Error('not implemented.'); }
    }
    exports.$afc = $afc;
    class TestLanguageDetectionService {
        isEnabledForLanguage(languageId) { return false; }
        async detectLanguage(resource, supportedLangs) { return undefined; }
    }
    class $bfc {
        getConnection() { return null; }
        async getEnvironment() { return null; }
        async getRawEnvironment() { return null; }
        async getExtensionHostExitInfo(reconnectionToken) { return null; }
        async getDiagnosticInfo(options) { return undefined; }
        async updateTelemetryLevel(telemetryLevel) { }
        async logTelemetry(eventName, data) { }
        async flushTelemetry() { }
        async getRoundTripTime() { return undefined; }
    }
    exports.$bfc = $bfc;
    class $cfc {
        async whenExtensionsReady() { }
        scanExtensions() { throw new Error('Method not implemented.'); }
        scanSingleExtension() { throw new Error('Method not implemented.'); }
    }
    exports.$cfc = $cfc;
    class $dfc {
        constructor() {
            this.onEnablementChanged = event_1.Event.None;
        }
        getEnablementState(extension) { return 8 /* EnablementState.EnabledGlobally */; }
        getEnablementStates(extensions, workspaceTypeOverrides) { return []; }
        getDependenciesEnablementStates(extension) { return []; }
        canChangeEnablement(extension) { return true; }
        canChangeWorkspaceEnablement(extension) { return true; }
        isEnabled(extension) { return true; }
        isEnabledEnablementState(enablementState) { return true; }
        isDisabledGlobally(extension) { return false; }
        async setEnablement(extensions, state) { return []; }
        async updateExtensionsEnablementsWhenWorkspaceTrustChanges() { }
    }
    exports.$dfc = $dfc;
    class $efc {
        constructor() {
            this.onInstallExtension = event_1.Event.None;
            this.onDidInstallExtensions = event_1.Event.None;
            this.onUninstallExtension = event_1.Event.None;
            this.onDidUninstallExtension = event_1.Event.None;
            this.onDidUpdateExtensionMetadata = event_1.Event.None;
            this.onProfileAwareInstallExtension = event_1.Event.None;
            this.onProfileAwareDidInstallExtensions = event_1.Event.None;
            this.onProfileAwareUninstallExtension = event_1.Event.None;
            this.onProfileAwareDidUninstallExtension = event_1.Event.None;
            this.onDidChangeProfile = event_1.Event.None;
        }
        installVSIX(location, manifest, installOptions) {
            throw new Error('Method not implemented.');
        }
        installFromLocation(location) {
            throw new Error('Method not implemented.');
        }
        installGalleryExtensions(extensions) {
            throw new Error('Method not implemented.');
        }
        async updateFromGallery(gallery, extension, installOptions) { return extension; }
        zip(extension) {
            throw new Error('Method not implemented.');
        }
        unzip(zipLocation) {
            throw new Error('Method not implemented.');
        }
        getManifest(vsix) {
            throw new Error('Method not implemented.');
        }
        install(vsix, options) {
            throw new Error('Method not implemented.');
        }
        async canInstall(extension) { return false; }
        installFromGallery(extension, options) {
            throw new Error('Method not implemented.');
        }
        uninstall(extension, options) {
            throw new Error('Method not implemented.');
        }
        async reinstallFromGallery(extension) {
            throw new Error('Method not implemented.');
        }
        async getInstalled(type) { return []; }
        getExtensionsControlManifest() {
            throw new Error('Method not implemented.');
        }
        async updateMetadata(local, metadata) { return local; }
        registerParticipant(pariticipant) { }
        async getTargetPlatform() { return "undefined" /* TargetPlatform.UNDEFINED */; }
        async cleanUp() { }
        download() {
            throw new Error('Method not implemented.');
        }
        copyExtensions() { throw new Error('Not Supported'); }
        toggleAppliationScope() { throw new Error('Not Supported'); }
        installExtensionsFromProfile() { throw new Error('Not Supported'); }
        whenProfileChanged(from, to) { throw new Error('Not Supported'); }
    }
    exports.$efc = $efc;
    class $ffc {
        constructor() {
            this.onDidChangeCurrentProfile = event_1.Event.None;
            this.currentProfile = (0, userDataProfile_1.$Gk)('test', 'test', uri_1.URI.file('tests').with({ scheme: 'vscode-tests' }), uri_1.URI.file('tests').with({ scheme: 'vscode-tests' }));
        }
        async updateCurrentProfile() { }
        getShortName(profile) { return profile.shortName ?? profile.name; }
    }
    exports.$ffc = $ffc;
    class $gfc {
        constructor() {
            this.onDidChangeProfile = event_1.Event.None;
        }
        async scanSystemExtensions() { return []; }
        async scanUserExtensions() { return []; }
        async scanExtensionsUnderDevelopment() { return []; }
        async copyExtensions() {
            throw new Error('Method not implemented.');
        }
        scanExistingExtension(extensionLocation, extensionType) {
            throw new Error('Method not implemented.');
        }
        addExtension(location, metadata) {
            throw new Error('Method not implemented.');
        }
        addExtensionFromGallery(galleryExtension, metadata) {
            throw new Error('Method not implemented.');
        }
        removeExtension() {
            throw new Error('Method not implemented.');
        }
        updateMetadata(extension, metaData, profileLocation) {
            throw new Error('Method not implemented.');
        }
        scanExtensionManifest(extensionLocation) {
            throw new Error('Method not implemented.');
        }
    }
    exports.$gfc = $gfc;
    async function $hfc(instantiationService) {
        return instantiationService.invokeFunction(async (accessor) => {
            const workingCopyService = accessor.get(workingCopyService_1.$TC);
            const editorGroupService = accessor.get(editorGroupsService_1.$5C);
            for (const workingCopy of workingCopyService.workingCopies) {
                await workingCopy.revert();
            }
            for (const group of editorGroupService.groups) {
                await group.closeAllEditors();
            }
            for (const group of editorGroupService.groups) {
                editorGroupService.removeGroup(group);
            }
        });
    }
    exports.$hfc = $hfc;
});
//# sourceMappingURL=workbenchTestServices.js.map