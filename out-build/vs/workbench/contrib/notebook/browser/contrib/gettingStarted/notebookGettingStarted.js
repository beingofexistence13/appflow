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
define(["require", "exports", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/notebook/browser/contrib/gettingStarted/notebookGettingStarted", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/registry/common/platform", "vs/platform/storage/common/storage", "vs/platform/action/common/actionCommonCategories", "vs/workbench/common/contributions", "vs/workbench/common/memento", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookEditorInput", "vs/workbench/services/editor/common/editorService"], function (require, exports, lifecycle_1, nls_1, actions_1, commands_1, configuration_1, contextkey_1, platform_1, storage_1, actionCommonCategories_1, contributions_1, memento_1, notebookContextKeys_1, notebookCommon_1, notebookEditorInput_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$qFb = void 0;
    const hasOpenedNotebookKey = 'hasOpenedNotebook';
    const hasShownGettingStartedKey = 'hasShownNotebookGettingStarted';
    /**
     * Sets a context key when a notebook has ever been opened by the user
     */
    let $qFb = class $qFb extends lifecycle_1.$kc {
        constructor(_editorService, _storageService, _contextKeyService, _commandService, _configurationService) {
            super();
            const hasOpenedNotebook = notebookContextKeys_1.$Tnb.bindTo(_contextKeyService);
            const memento = new memento_1.$YT('notebookGettingStarted2', _storageService);
            const storedValue = memento.getMemento(0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            if (storedValue[hasOpenedNotebookKey]) {
                hasOpenedNotebook.set(true);
            }
            const needToShowGettingStarted = _configurationService.getValue(notebookCommon_1.$7H.openGettingStarted) && !storedValue[hasShownGettingStartedKey];
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
                if (_editorService.activeEditor?.typeId === notebookEditorInput_1.$zbb.ID) {
                    // active editor is notebook
                    onDidOpenNotebook();
                    return;
                }
                const listener = this.B(_editorService.onDidActiveEditorChange(() => {
                    if (_editorService.activeEditor?.typeId === notebookEditorInput_1.$zbb.ID) {
                        listener.dispose();
                        onDidOpenNotebook();
                    }
                }));
            }
        }
    };
    exports.$qFb = $qFb;
    exports.$qFb = $qFb = __decorate([
        __param(0, editorService_1.$9C),
        __param(1, storage_1.$Vo),
        __param(2, contextkey_1.$3i),
        __param(3, commands_1.$Fr),
        __param(4, configuration_1.$8h)
    ], $qFb);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution($qFb, 3 /* LifecyclePhase.Restored */);
    (0, actions_1.$Xu)(class NotebookClearNotebookLayoutAction extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.notebook.layout.gettingStarted',
                title: {
                    value: (0, nls_1.localize)(0, null),
                    original: 'Reset notebook getting started'
                },
                f1: true,
                precondition: contextkey_1.$Ii.equals(`config.${notebookCommon_1.$7H.openGettingStarted}`, true),
                category: actionCommonCategories_1.$Nl.Developer,
            });
        }
        run(accessor) {
            const storageService = accessor.get(storage_1.$Vo);
            const memento = new memento_1.$YT('notebookGettingStarted', storageService);
            const storedValue = memento.getMemento(0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            storedValue[hasOpenedNotebookKey] = undefined;
            memento.saveMemento();
        }
    });
});
//# sourceMappingURL=notebookGettingStarted.js.map