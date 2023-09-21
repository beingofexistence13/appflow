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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/preferences/browser/preferencesRenderers", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/preferences/common/preferencesModels"], function (require, exports, lifecycle_1, instantiation_1, workspace_1, preferencesRenderers_1, preferences_1, preferencesModels_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SettingsEditorContribution = void 0;
    let SettingsEditorContribution = class SettingsEditorContribution extends lifecycle_1.Disposable {
        static { this.ID = 'editor.contrib.settings'; }
        constructor(editor, instantiationService, preferencesService, workspaceContextService) {
            super();
            this.editor = editor;
            this.instantiationService = instantiationService;
            this.preferencesService = preferencesService;
            this.workspaceContextService = workspaceContextService;
            this.disposables = this._register(new lifecycle_1.DisposableStore());
            this._createPreferencesRenderer();
            this._register(this.editor.onDidChangeModel(e => this._createPreferencesRenderer()));
            this._register(this.workspaceContextService.onDidChangeWorkbenchState(() => this._createPreferencesRenderer()));
        }
        async _createPreferencesRenderer() {
            this.disposables.clear();
            this.currentRenderer = undefined;
            const model = this.editor.getModel();
            if (model && /\.(json|code-workspace)$/.test(model.uri.path)) {
                // Fast check: the preferences renderer can only appear
                // in settings files or workspace files
                const settingsModel = await this.preferencesService.createPreferencesEditorModel(model.uri);
                if (settingsModel instanceof preferencesModels_1.SettingsEditorModel && this.editor.getModel()) {
                    this.disposables.add(settingsModel);
                    switch (settingsModel.configurationTarget) {
                        case 5 /* ConfigurationTarget.WORKSPACE */:
                            this.currentRenderer = this.disposables.add(this.instantiationService.createInstance(preferencesRenderers_1.WorkspaceSettingsRenderer, this.editor, settingsModel));
                            break;
                        default:
                            this.currentRenderer = this.disposables.add(this.instantiationService.createInstance(preferencesRenderers_1.UserSettingsRenderer, this.editor, settingsModel));
                            break;
                    }
                }
                this.currentRenderer?.render();
            }
        }
    };
    exports.SettingsEditorContribution = SettingsEditorContribution;
    exports.SettingsEditorContribution = SettingsEditorContribution = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, preferences_1.IPreferencesService),
        __param(3, workspace_1.IWorkspaceContextService)
    ], SettingsEditorContribution);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmVyZW5jZXNFZGl0b3IuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9wcmVmZXJlbmNlcy9icm93c2VyL3ByZWZlcmVuY2VzRWRpdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVd6RixJQUFNLDBCQUEwQixHQUFoQyxNQUFNLDBCQUEyQixTQUFRLHNCQUFVO2lCQUN6QyxPQUFFLEdBQVcseUJBQXlCLEFBQXBDLENBQXFDO1FBS3ZELFlBQ2tCLE1BQW1CLEVBQ2Isb0JBQTRELEVBQzlELGtCQUF3RCxFQUNuRCx1QkFBa0U7WUFFNUYsS0FBSyxFQUFFLENBQUM7WUFMUyxXQUFNLEdBQU4sTUFBTSxDQUFhO1lBQ0kseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUM3Qyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQ2xDLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBMEI7WUFONUUsZ0JBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMkJBQWUsRUFBRSxDQUFDLENBQUM7WUFTcEUsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUM7WUFDbEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3JGLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLHlCQUF5QixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqSCxDQUFDO1FBRU8sS0FBSyxDQUFDLDBCQUEwQjtZQUN2QyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxlQUFlLEdBQUcsU0FBUyxDQUFDO1lBRWpDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDckMsSUFBSSxLQUFLLElBQUksMEJBQTBCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzdELHVEQUF1RDtnQkFDdkQsdUNBQXVDO2dCQUN2QyxNQUFNLGFBQWEsR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyw0QkFBNEIsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzVGLElBQUksYUFBYSxZQUFZLHVDQUFtQixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUU7b0JBQzNFLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO29CQUNwQyxRQUFRLGFBQWEsQ0FBQyxtQkFBbUIsRUFBRTt3QkFDMUM7NEJBQ0MsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLGdEQUF5QixFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQzs0QkFDN0ksTUFBTTt3QkFDUDs0QkFDQyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsMkNBQW9CLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDOzRCQUN4SSxNQUFNO3FCQUNQO2lCQUNEO2dCQUVELElBQUksQ0FBQyxlQUFlLEVBQUUsTUFBTSxFQUFFLENBQUM7YUFDL0I7UUFDRixDQUFDOztJQXpDVyxnRUFBMEI7eUNBQTFCLDBCQUEwQjtRQVFwQyxXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEsaUNBQW1CLENBQUE7UUFDbkIsV0FBQSxvQ0FBd0IsQ0FBQTtPQVZkLDBCQUEwQixDQTBDdEMifQ==