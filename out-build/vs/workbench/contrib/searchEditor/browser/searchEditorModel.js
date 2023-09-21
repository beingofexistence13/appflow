/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/searchEditor/browser/searchEditorSerialization", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/base/common/types", "vs/editor/common/model/textModel", "vs/workbench/contrib/searchEditor/browser/constants", "vs/base/common/event", "vs/base/common/map", "vs/workbench/services/search/common/search"], function (require, exports, model_1, language_1, instantiation_1, searchEditorSerialization_1, workingCopyBackup_1, types_1, textModel_1, constants_1, event_1, map_1, search_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$YOb = exports.$XOb = exports.$WOb = void 0;
    class $WOb {
        constructor(config) {
            this.config = config;
            this.a = new event_1.$fd();
            this.onConfigDidUpdate = this.a.event;
        }
        updateConfig(config) { this.config = config; this.a.fire(config); }
    }
    exports.$WOb = $WOb;
    class $XOb {
        constructor(a) {
            this.a = a;
        }
        async resolve() {
            return (0, types_1.$uf)(exports.$YOb.models.get(this.a)).resolve();
        }
    }
    exports.$XOb = $XOb;
    class SearchEditorModelFactory {
        constructor() {
            this.models = new map_1.$zi();
        }
        initializeModelFromExistingModel(accessor, resource, config) {
            if (this.models.has(resource)) {
                throw Error('Unable to contruct model for resource that already exists');
            }
            const languageService = accessor.get(language_1.$ct);
            const modelService = accessor.get(model_1.$yA);
            const instantiationService = accessor.get(instantiation_1.$Ah);
            const workingCopyBackupService = accessor.get(workingCopyBackup_1.$EA);
            let ongoingResolve;
            this.models.set(resource, {
                resolve: () => {
                    if (!ongoingResolve) {
                        ongoingResolve = (async () => {
                            const backup = await this.a(resource, languageService, modelService, workingCopyBackupService, instantiationService);
                            if (backup) {
                                return backup;
                            }
                            return Promise.resolve({
                                resultsModel: modelService.getModel(resource) ?? modelService.createModel('', languageService.createById(search_1.$mI), resource),
                                configurationModel: new $WOb(config)
                            });
                        })();
                    }
                    return ongoingResolve;
                }
            });
        }
        initializeModelFromRawData(accessor, resource, config, contents) {
            if (this.models.has(resource)) {
                throw Error('Unable to contruct model for resource that already exists');
            }
            const languageService = accessor.get(language_1.$ct);
            const modelService = accessor.get(model_1.$yA);
            const instantiationService = accessor.get(instantiation_1.$Ah);
            const workingCopyBackupService = accessor.get(workingCopyBackup_1.$EA);
            let ongoingResolve;
            this.models.set(resource, {
                resolve: () => {
                    if (!ongoingResolve) {
                        ongoingResolve = (async () => {
                            const backup = await this.a(resource, languageService, modelService, workingCopyBackupService, instantiationService);
                            if (backup) {
                                return backup;
                            }
                            return Promise.resolve({
                                resultsModel: modelService.createModel(contents ?? '', languageService.createById(search_1.$mI), resource),
                                configurationModel: new $WOb(config)
                            });
                        })();
                    }
                    return ongoingResolve;
                }
            });
        }
        initializeModelFromExistingFile(accessor, resource, existingFile) {
            if (this.models.has(resource)) {
                throw Error('Unable to contruct model for resource that already exists');
            }
            const languageService = accessor.get(language_1.$ct);
            const modelService = accessor.get(model_1.$yA);
            const instantiationService = accessor.get(instantiation_1.$Ah);
            const workingCopyBackupService = accessor.get(workingCopyBackup_1.$EA);
            let ongoingResolve;
            this.models.set(resource, {
                resolve: async () => {
                    if (!ongoingResolve) {
                        ongoingResolve = (async () => {
                            const backup = await this.a(resource, languageService, modelService, workingCopyBackupService, instantiationService);
                            if (backup) {
                                return backup;
                            }
                            const { text, config } = await instantiationService.invokeFunction(searchEditorSerialization_1.$UOb, existingFile);
                            return ({
                                resultsModel: modelService.createModel(text ?? '', languageService.createById(search_1.$mI), resource),
                                configurationModel: new $WOb(config)
                            });
                        })();
                    }
                    return ongoingResolve;
                }
            });
        }
        async a(resource, languageService, modelService, workingCopyBackupService, instantiationService) {
            const backup = await workingCopyBackupService.resolve({ resource, typeId: constants_1.$FOb });
            let model = modelService.getModel(resource);
            if (!model && backup) {
                const factory = await (0, textModel_1.$JC)(backup.value);
                model = modelService.createModel(factory, languageService.createById(search_1.$mI), resource);
            }
            if (model) {
                const existingFile = model.getValue();
                const { text, config } = (0, searchEditorSerialization_1.$VOb)(existingFile);
                modelService.destroyModel(resource);
                return ({
                    resultsModel: modelService.createModel(text ?? '', languageService.createById(search_1.$mI), resource),
                    configurationModel: new $WOb(config)
                });
            }
            else {
                return undefined;
            }
        }
    }
    exports.$YOb = new SearchEditorModelFactory();
});
//# sourceMappingURL=searchEditorModel.js.map