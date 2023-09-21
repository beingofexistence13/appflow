/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/searchEditor/browser/searchEditorSerialization", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/base/common/types", "vs/editor/common/model/textModel", "vs/workbench/contrib/searchEditor/browser/constants", "vs/base/common/event", "vs/base/common/map", "vs/workbench/services/search/common/search"], function (require, exports, model_1, language_1, instantiation_1, searchEditorSerialization_1, workingCopyBackup_1, types_1, textModel_1, constants_1, event_1, map_1, search_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.searchEditorModelFactory = exports.SearchEditorModel = exports.SearchConfigurationModel = void 0;
    class SearchConfigurationModel {
        constructor(config) {
            this.config = config;
            this._onConfigDidUpdate = new event_1.Emitter();
            this.onConfigDidUpdate = this._onConfigDidUpdate.event;
        }
        updateConfig(config) { this.config = config; this._onConfigDidUpdate.fire(config); }
    }
    exports.SearchConfigurationModel = SearchConfigurationModel;
    class SearchEditorModel {
        constructor(resource) {
            this.resource = resource;
        }
        async resolve() {
            return (0, types_1.assertIsDefined)(exports.searchEditorModelFactory.models.get(this.resource)).resolve();
        }
    }
    exports.SearchEditorModel = SearchEditorModel;
    class SearchEditorModelFactory {
        constructor() {
            this.models = new map_1.ResourceMap();
        }
        initializeModelFromExistingModel(accessor, resource, config) {
            if (this.models.has(resource)) {
                throw Error('Unable to contruct model for resource that already exists');
            }
            const languageService = accessor.get(language_1.ILanguageService);
            const modelService = accessor.get(model_1.IModelService);
            const instantiationService = accessor.get(instantiation_1.IInstantiationService);
            const workingCopyBackupService = accessor.get(workingCopyBackup_1.IWorkingCopyBackupService);
            let ongoingResolve;
            this.models.set(resource, {
                resolve: () => {
                    if (!ongoingResolve) {
                        ongoingResolve = (async () => {
                            const backup = await this.tryFetchModelFromBackupService(resource, languageService, modelService, workingCopyBackupService, instantiationService);
                            if (backup) {
                                return backup;
                            }
                            return Promise.resolve({
                                resultsModel: modelService.getModel(resource) ?? modelService.createModel('', languageService.createById(search_1.SEARCH_RESULT_LANGUAGE_ID), resource),
                                configurationModel: new SearchConfigurationModel(config)
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
            const languageService = accessor.get(language_1.ILanguageService);
            const modelService = accessor.get(model_1.IModelService);
            const instantiationService = accessor.get(instantiation_1.IInstantiationService);
            const workingCopyBackupService = accessor.get(workingCopyBackup_1.IWorkingCopyBackupService);
            let ongoingResolve;
            this.models.set(resource, {
                resolve: () => {
                    if (!ongoingResolve) {
                        ongoingResolve = (async () => {
                            const backup = await this.tryFetchModelFromBackupService(resource, languageService, modelService, workingCopyBackupService, instantiationService);
                            if (backup) {
                                return backup;
                            }
                            return Promise.resolve({
                                resultsModel: modelService.createModel(contents ?? '', languageService.createById(search_1.SEARCH_RESULT_LANGUAGE_ID), resource),
                                configurationModel: new SearchConfigurationModel(config)
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
            const languageService = accessor.get(language_1.ILanguageService);
            const modelService = accessor.get(model_1.IModelService);
            const instantiationService = accessor.get(instantiation_1.IInstantiationService);
            const workingCopyBackupService = accessor.get(workingCopyBackup_1.IWorkingCopyBackupService);
            let ongoingResolve;
            this.models.set(resource, {
                resolve: async () => {
                    if (!ongoingResolve) {
                        ongoingResolve = (async () => {
                            const backup = await this.tryFetchModelFromBackupService(resource, languageService, modelService, workingCopyBackupService, instantiationService);
                            if (backup) {
                                return backup;
                            }
                            const { text, config } = await instantiationService.invokeFunction(searchEditorSerialization_1.parseSavedSearchEditor, existingFile);
                            return ({
                                resultsModel: modelService.createModel(text ?? '', languageService.createById(search_1.SEARCH_RESULT_LANGUAGE_ID), resource),
                                configurationModel: new SearchConfigurationModel(config)
                            });
                        })();
                    }
                    return ongoingResolve;
                }
            });
        }
        async tryFetchModelFromBackupService(resource, languageService, modelService, workingCopyBackupService, instantiationService) {
            const backup = await workingCopyBackupService.resolve({ resource, typeId: constants_1.SearchEditorWorkingCopyTypeId });
            let model = modelService.getModel(resource);
            if (!model && backup) {
                const factory = await (0, textModel_1.createTextBufferFactoryFromStream)(backup.value);
                model = modelService.createModel(factory, languageService.createById(search_1.SEARCH_RESULT_LANGUAGE_ID), resource);
            }
            if (model) {
                const existingFile = model.getValue();
                const { text, config } = (0, searchEditorSerialization_1.parseSerializedSearchEditor)(existingFile);
                modelService.destroyModel(resource);
                return ({
                    resultsModel: modelService.createModel(text ?? '', languageService.createById(search_1.SEARCH_RESULT_LANGUAGE_ID), resource),
                    configurationModel: new SearchConfigurationModel(config)
                });
            }
            else {
                return undefined;
            }
        }
    }
    exports.searchEditorModelFactory = new SearchEditorModelFactory();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoRWRpdG9yTW9kZWwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zZWFyY2hFZGl0b3IvYnJvd3Nlci9zZWFyY2hFZGl0b3JNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFtQmhHLE1BQWEsd0JBQXdCO1FBSXBDLFlBQW1CLE1BQXFDO1lBQXJDLFdBQU0sR0FBTixNQUFNLENBQStCO1lBSGhELHVCQUFrQixHQUFHLElBQUksZUFBTyxFQUF1QixDQUFDO1lBQ2hELHNCQUFpQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUM7UUFFTixDQUFDO1FBQzdELFlBQVksQ0FBQyxNQUEyQixJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDekc7SUFORCw0REFNQztJQUVELE1BQWEsaUJBQWlCO1FBQzdCLFlBQ1MsUUFBYTtZQUFiLGFBQVEsR0FBUixRQUFRLENBQUs7UUFDbEIsQ0FBQztRQUVMLEtBQUssQ0FBQyxPQUFPO1lBQ1osT0FBTyxJQUFBLHVCQUFlLEVBQUMsZ0NBQXdCLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN0RixDQUFDO0tBQ0Q7SUFSRCw4Q0FRQztJQUVELE1BQU0sd0JBQXdCO1FBRzdCO1lBRkEsV0FBTSxHQUFHLElBQUksaUJBQVcsRUFBZ0QsQ0FBQztRQUV6RCxDQUFDO1FBRWpCLGdDQUFnQyxDQUFDLFFBQTBCLEVBQUUsUUFBYSxFQUFFLE1BQTJCO1lBQ3RHLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JB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