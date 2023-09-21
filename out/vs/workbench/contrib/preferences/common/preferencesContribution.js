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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/editor/common/services/resolverService", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/registry/common/platform", "vs/platform/workspace/common/workspace", "vs/workbench/common/configuration", "vs/workbench/common/editor/sideBySideEditorInput", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/services/textfile/common/textEditorService", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, lifecycle_1, resources_1, model_1, language_1, resolverService_1, nls, configuration_1, configurationRegistry_1, JSONContributionRegistry, platform_1, workspace_1, configuration_2, sideBySideEditorInput_1, editorResolverService_1, textEditorService_1, preferences_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PreferencesContribution = void 0;
    const schemaRegistry = platform_1.Registry.as(JSONContributionRegistry.Extensions.JSONContribution);
    let PreferencesContribution = class PreferencesContribution {
        constructor(modelService, textModelResolverService, preferencesService, languageService, userDataProfileService, workspaceService, configurationService, editorResolverService, textEditorService) {
            this.modelService = modelService;
            this.textModelResolverService = textModelResolverService;
            this.preferencesService = preferencesService;
            this.languageService = languageService;
            this.userDataProfileService = userDataProfileService;
            this.workspaceService = workspaceService;
            this.configurationService = configurationService;
            this.editorResolverService = editorResolverService;
            this.textEditorService = textEditorService;
            this.settingsListener = this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(preferences_1.USE_SPLIT_JSON_SETTING) || e.affectsConfiguration(preferences_1.DEFAULT_SETTINGS_EDITOR_SETTING)) {
                    this.handleSettingsEditorRegistration();
                }
            });
            this.handleSettingsEditorRegistration();
            this.start();
        }
        handleSettingsEditorRegistration() {
            // dispose any old listener we had
            (0, lifecycle_1.dispose)(this.editorOpeningListener);
            // install editor opening listener unless user has disabled this
            if (!!this.configurationService.getValue(preferences_1.USE_SPLIT_JSON_SETTING) || !!this.configurationService.getValue(preferences_1.DEFAULT_SETTINGS_EDITOR_SETTING)) {
                this.editorOpeningListener = this.editorResolverService.registerEditor('**/settings.json', {
                    id: sideBySideEditorInput_1.SideBySideEditorInput.ID,
                    label: nls.localize('splitSettingsEditorLabel', "Split Settings Editor"),
                    priority: editorResolverService_1.RegisteredEditorPriority.builtin,
                }, {}, {
                    createEditorInput: ({ resource, options }) => {
                        // Global User Settings File
                        if ((0, resources_1.isEqual)(resource, this.userDataProfileService.currentProfile.settingsResource)) {
                            return { editor: this.preferencesService.createSplitJsonEditorInput(3 /* ConfigurationTarget.USER_LOCAL */, resource), options };
                        }
                        // Single Folder Workspace Settings File
                        const state = this.workspaceService.getWorkbenchState();
                        if (state === 2 /* WorkbenchState.FOLDER */) {
                            const folders = this.workspaceService.getWorkspace().folders;
                            if ((0, resources_1.isEqual)(resource, folders[0].toResource(preferences_1.FOLDER_SETTINGS_PATH))) {
                                return { editor: this.preferencesService.createSplitJsonEditorInput(5 /* ConfigurationTarget.WORKSPACE */, resource), options };
                            }
                        }
                        // Multi Folder Workspace Settings File
                        else if (state === 3 /* WorkbenchState.WORKSPACE */) {
                            const folders = this.workspaceService.getWorkspace().folders;
                            for (const folder of folders) {
                                if ((0, resources_1.isEqual)(resource, folder.toResource(preferences_1.FOLDER_SETTINGS_PATH))) {
                                    return { editor: this.preferencesService.createSplitJsonEditorInput(6 /* ConfigurationTarget.WORKSPACE_FOLDER */, resource), options };
                                }
                            }
                        }
                        return { editor: this.textEditorService.createTextEditor({ resource }), options };
                    }
                });
            }
        }
        start() {
            this.textModelResolverService.registerTextModelContentProvider('vscode', {
                provideTextContent: async (uri) => {
                    if (uri.scheme !== 'vscode') {
                        return null;
                    }
                    if (uri.authority === 'schemas') {
                        return this.getSchemaModel(uri);
                    }
                    return this.preferencesService.resolveModel(uri);
                }
            });
        }
        getSchemaModel(uri) {
            let schema = schemaRegistry.getSchemaContributions().schemas[uri.toString()] ?? {} /* Use empty schema if not yet registered */;
            const modelContent = JSON.stringify(schema);
            const languageSelection = this.languageService.createById('jsonc');
            const model = this.modelService.createModel(modelContent, languageSelection, uri);
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add(schemaRegistry.onDidChangeSchema(schemaUri => {
                if (schemaUri === uri.toString()) {
                    schema = schemaRegistry.getSchemaContributions().schemas[uri.toString()];
                    model.setValue(JSON.stringify(schema));
                }
            }));
            disposables.add(model.onWillDispose(() => disposables.dispose()));
            return model;
        }
        dispose() {
            (0, lifecycle_1.dispose)(this.editorOpeningListener);
            (0, lifecycle_1.dispose)(this.settingsListener);
        }
    };
    exports.PreferencesContribution = PreferencesContribution;
    exports.PreferencesContribution = PreferencesContribution = __decorate([
        __param(0, model_1.IModelService),
        __param(1, resolverService_1.ITextModelService),
        __param(2, preferences_1.IPreferencesService),
        __param(3, language_1.ILanguageService),
        __param(4, userDataProfile_1.IUserDataProfileService),
        __param(5, workspace_1.IWorkspaceContextService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, editorResolverService_1.IEditorResolverService),
        __param(8, textEditorService_1.ITextEditorService)
    ], PreferencesContribution);
    const registry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    registry.registerConfiguration({
        ...configuration_2.workbenchConfigurationNodeBase,
        'properties': {
            'workbench.settings.enableNaturalLanguageSearch': {
                'type': 'boolean',
                'description': nls.localize('enableNaturalLanguageSettingsSearch', "Controls whether to enable the natural language search mode for settings. The natural language search is provided by a Microsoft online service."),
                'default': true,
                'scope': 3 /* ConfigurationScope.WINDOW */,
                'tags': ['usesOnlineServices']
            },
            'workbench.settings.settingsSearchTocBehavior': {
                'type': 'string',
                'enum': ['hide', 'filter'],
                'enumDescriptions': [
                    nls.localize('settingsSearchTocBehavior.hide', "Hide the Table of Contents while searching."),
                    nls.localize('settingsSearchTocBehavior.filter', "Filter the Table of Contents to just categories that have matching settings. Clicking a category will filter the results to that category."),
                ],
                'description': nls.localize('settingsSearchTocBehavior', "Controls the behavior of the settings editor Table of Contents while searching."),
                'default': 'filter',
                'scope': 3 /* ConfigurationScope.WINDOW */
            },
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmVyZW5jZXNDb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9wcmVmZXJlbmNlcy9jb21tb24vcHJlZmVyZW5jZXNDb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBd0JoRyxNQUFNLGNBQWMsR0FBRyxtQkFBUSxDQUFDLEVBQUUsQ0FBcUQsd0JBQXdCLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFFdEksSUFBTSx1QkFBdUIsR0FBN0IsTUFBTSx1QkFBdUI7UUFJbkMsWUFDaUMsWUFBMkIsRUFDdkIsd0JBQTJDLEVBQ3pDLGtCQUF1QyxFQUMxQyxlQUFpQyxFQUMxQixzQkFBK0MsRUFDOUMsZ0JBQTBDLEVBQzdDLG9CQUEyQyxFQUMxQyxxQkFBNkMsRUFDakQsaUJBQXFDO1lBUjFDLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQ3ZCLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBbUI7WUFDekMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUMxQyxvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7WUFDMUIsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF5QjtZQUM5QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQTBCO1lBQzdDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDMUMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF3QjtZQUNqRCxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBRTFFLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQzlFLElBQUksQ0FBQyxDQUFDLG9CQUFvQixDQUFDLG9DQUFzQixDQUFDLElBQUksQ0FBQyxDQUFDLG9CQUFvQixDQUFDLDZDQUEr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