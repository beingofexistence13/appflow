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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/editor/common/services/resolverService", "vs/nls!vs/workbench/contrib/preferences/common/preferencesContribution", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/registry/common/platform", "vs/platform/workspace/common/workspace", "vs/workbench/common/configuration", "vs/workbench/common/editor/sideBySideEditorInput", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/services/textfile/common/textEditorService", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, lifecycle_1, resources_1, model_1, language_1, resolverService_1, nls, configuration_1, configurationRegistry_1, JSONContributionRegistry, platform_1, workspace_1, configuration_2, sideBySideEditorInput_1, editorResolverService_1, textEditorService_1, preferences_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$9Db = void 0;
    const schemaRegistry = platform_1.$8m.as(JSONContributionRegistry.$9m.JSONContribution);
    let $9Db = class $9Db {
        constructor(c, d, f, g, h, i, j, k, l) {
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.l = l;
            this.b = this.j.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(preferences_1.$FE) || e.affectsConfiguration(preferences_1.$EE)) {
                    this.m();
                }
            });
            this.m();
            this.n();
        }
        m() {
            // dispose any old listener we had
            (0, lifecycle_1.$fc)(this.a);
            // install editor opening listener unless user has disabled this
            if (!!this.j.getValue(preferences_1.$FE) || !!this.j.getValue(preferences_1.$EE)) {
                this.a = this.k.registerEditor('**/settings.json', {
                    id: sideBySideEditorInput_1.$VC.ID,
                    label: nls.localize(0, null),
                    priority: editorResolverService_1.RegisteredEditorPriority.builtin,
                }, {}, {
                    createEditorInput: ({ resource, options }) => {
                        // Global User Settings File
                        if ((0, resources_1.$bg)(resource, this.h.currentProfile.settingsResource)) {
                            return { editor: this.f.createSplitJsonEditorInput(3 /* ConfigurationTarget.USER_LOCAL */, resource), options };
                        }
                        // Single Folder Workspace Settings File
                        const state = this.i.getWorkbenchState();
                        if (state === 2 /* WorkbenchState.FOLDER */) {
                            const folders = this.i.getWorkspace().folders;
                            if ((0, resources_1.$bg)(resource, folders[0].toResource(preferences_1.$DE))) {
                                return { editor: this.f.createSplitJsonEditorInput(5 /* ConfigurationTarget.WORKSPACE */, resource), options };
                            }
                        }
                        // Multi Folder Workspace Settings File
                        else if (state === 3 /* WorkbenchState.WORKSPACE */) {
                            const folders = this.i.getWorkspace().folders;
                            for (const folder of folders) {
                                if ((0, resources_1.$bg)(resource, folder.toResource(preferences_1.$DE))) {
                                    return { editor: this.f.createSplitJsonEditorInput(6 /* ConfigurationTarget.WORKSPACE_FOLDER */, resource), options };
                                }
                            }
                        }
                        return { editor: this.l.createTextEditor({ resource }), options };
                    }
                });
            }
        }
        n() {
            this.d.registerTextModelContentProvider('vscode', {
                provideTextContent: async (uri) => {
                    if (uri.scheme !== 'vscode') {
                        return null;
                    }
                    if (uri.authority === 'schemas') {
                        return this.o(uri);
                    }
                    return this.f.resolveModel(uri);
                }
            });
        }
        o(uri) {
            let schema = schemaRegistry.getSchemaContributions().schemas[uri.toString()] ?? {} /* Use empty schema if not yet registered */;
            const modelContent = JSON.stringify(schema);
            const languageSelection = this.g.createById('jsonc');
            const model = this.c.createModel(modelContent, languageSelection, uri);
            const disposables = new lifecycle_1.$jc();
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
            (0, lifecycle_1.$fc)(this.a);
            (0, lifecycle_1.$fc)(this.b);
        }
    };
    exports.$9Db = $9Db;
    exports.$9Db = $9Db = __decorate([
        __param(0, model_1.$yA),
        __param(1, resolverService_1.$uA),
        __param(2, preferences_1.$BE),
        __param(3, language_1.$ct),
        __param(4, userDataProfile_1.$CJ),
        __param(5, workspace_1.$Kh),
        __param(6, configuration_1.$8h),
        __param(7, editorResolverService_1.$pbb),
        __param(8, textEditorService_1.$sxb)
    ], $9Db);
    const registry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
    registry.registerConfiguration({
        ...configuration_2.$$y,
        'properties': {
            'workbench.settings.enableNaturalLanguageSearch': {
                'type': 'boolean',
                'description': nls.localize(1, null),
                'default': true,
                'scope': 3 /* ConfigurationScope.WINDOW */,
                'tags': ['usesOnlineServices']
            },
            'workbench.settings.settingsSearchTocBehavior': {
                'type': 'string',
                'enum': ['hide', 'filter'],
                'enumDescriptions': [
                    nls.localize(2, null),
                    nls.localize(3, null),
                ],
                'description': nls.localize(4, null),
                'default': 'filter',
                'scope': 3 /* ConfigurationScope.WINDOW */
            },
        }
    });
});
//# sourceMappingURL=preferencesContribution.js.map