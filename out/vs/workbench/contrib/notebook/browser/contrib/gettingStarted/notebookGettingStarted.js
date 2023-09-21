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
define(["require", "exports", "vs/base/common/lifecycle", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/registry/common/platform", "vs/platform/storage/common/storage", "vs/platform/action/common/actionCommonCategories", "vs/workbench/common/contributions", "vs/workbench/common/memento", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookEditorInput", "vs/workbench/services/editor/common/editorService"], function (require, exports, lifecycle_1, nls_1, actions_1, commands_1, configuration_1, contextkey_1, platform_1, storage_1, actionCommonCategories_1, contributions_1, memento_1, notebookContextKeys_1, notebookCommon_1, notebookEditorInput_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookGettingStarted = void 0;
    const hasOpenedNotebookKey = 'hasOpenedNotebook';
    const hasShownGettingStartedKey = 'hasShownNotebookGettingStarted';
    /**
     * Sets a context key when a notebook has ever been opened by the user
     */
    let NotebookGettingStarted = class NotebookGettingStarted extends lifecycle_1.Disposable {
        constructor(_editorService, _storageService, _contextKeyService, _commandService, _configurationService) {
            super();
            const hasOpenedNotebook = notebookContextKeys_1.HAS_OPENED_NOTEBOOK.bindTo(_contextKeyService);
            const memento = new memento_1.Memento('notebookGettingStarted2', _storageService);
            const storedValue = memento.getMemento(0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            if (storedValue[hasOpenedNotebookKey]) {
                hasOpenedNotebook.set(true);
            }
            const needToShowGettingStarted = _configurationService.getValue(notebookCommon_1.NotebookSetting.openGettingStarted) && !storedValue[hasShownGettingStartedKey];
            if (!storedValue[hasOpenedNotebookKey] || needToShowGettingStarted) {
                const onDidOpenNotebook = () => {
                    hasOpenedNotebook.set(true);
                    storedValue[hasOpenedNotebookKey] = true;
                    if (needToShowGettingStarted) {
                        _commandService.executeCommand('workbench.action.openWalkthrough', { category: 'notebooks', step: 'notebookProfile' }, true);
                        storedValue[hasShownGettingStartedKey] = true;
                    }
                    memento.saveMemento();
                };
                if (_editorService.activeEditor?.typeId === notebookEditorInput_1.NotebookEditorInput.ID) {
                    // active editor is notebook
                    onDidOpenNotebook();
                    return;
                }
                const listener = this._register(_editorService.onDidActiveEditorChange(() => {
                    if (_editorService.activeEditor?.typeId === notebookEditorInput_1.NotebookEditorInput.ID) {
                        listener.dispose();
                        onDidOpenNotebook();
                    }
                }));
            }
        }
    };
    exports.NotebookGettingStarted = NotebookGettingStarted;
    exports.NotebookGettingStarted = NotebookGettingStarted = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, storage_1.IStorageService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, commands_1.ICommandService),
        __param(4, configuration_1.IConfigurationService)
    ], NotebookGettingStarted);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(NotebookGettingStarted, 3 /* LifecyclePhase.Restored */);
    (0, actions_1.registerAction2)(class NotebookClearNotebookLayoutAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.notebook.layout.gettingStarted',
                title: {
                    value: (0, nls_1.localize)('workbench.notebook.layout.gettingStarted.label', "Reset notebook getting started"),
                    original: 'Reset notebook getting started'
                },
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.equals(`config.${notebookCommon_1.NotebookSetting.openGettingStarted}`, true),
                category: actionCommonCategories_1.Categories.Developer,
            });
        }
        run(accessor) {
            const storageService = accessor.get(storage_1.IStorageService);
            const memento = new memento_1.Memento('notebookGettingStarted', storageService);
            const storedValue = memento.getMemento(0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            storedValue[hasOpenedNotebookKey] = undefined;
            memento.saveMemento();
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tHZXR0aW5nU3RhcnRlZC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvY29udHJpYi9nZXR0aW5nU3RhcnRlZC9ub3RlYm9va0dldHRpbmdTdGFydGVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQW9CaEcsTUFBTSxvQkFBb0IsR0FBRyxtQkFBbUIsQ0FBQztJQUNqRCxNQUFNLHlCQUF5QixHQUFHLGdDQUFnQyxDQUFDO0lBRW5FOztPQUVHO0lBQ0ksSUFBTSxzQkFBc0IsR0FBNUIsTUFBTSxzQkFBdUIsU0FBUSxzQkFBVTtRQUVyRCxZQUNpQixjQUE4QixFQUM3QixlQUFnQyxFQUM3QixrQkFBc0MsRUFDekMsZUFBZ0MsRUFDMUIscUJBQTRDO1lBRW5FLEtBQUssRUFBRSxDQUFDO1lBRVIsTUFBTSxpQkFBaUIsR0FBRyx5Q0FBbUIsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUN6RSxNQUFNLE9BQU8sR0FBRyxJQUFJLGlCQUFPLENBQUMseUJBQXlCLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDeEUsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLFVBQVUsMERBQTBDLENBQUM7WUFDakYsSUFBSSxXQUFXLENBQUMsb0JBQW9CLENBQUMsRUFBRTtnQkFDdEMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQzVCO1lBRUQsTUFBTSx3QkFBd0IsR0FBRyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsZ0NBQWUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLHlCQUF5QixDQUFDLENBQUM7WUFDL0ksSUFBSSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLHdCQUF3QixFQUFFO2dCQUNuRSxNQUFNLGlCQUFp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