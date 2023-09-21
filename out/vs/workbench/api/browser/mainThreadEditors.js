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
define(["require", "exports", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/uri", "vs/editor/browser/services/codeEditorService", "vs/platform/commands/common/commands", "vs/platform/editor/common/editor", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/editor/common/editorGroupColumn", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/platform/environment/common/environment", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/editor/browser/editorBrowser", "vs/platform/configuration/common/configuration"], function (require, exports, errors_1, lifecycle_1, objects_1, uri_1, codeEditorService_1, commands_1, editor_1, extHost_protocol_1, editorGroupColumn_1, editorService_1, editorGroupsService_1, environment_1, workingCopyService_1, editorBrowser_1, configuration_1) {
    "use strict";
    var MainThreadTextEditors_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadTextEditors = void 0;
    let MainThreadTextEditors = class MainThreadTextEditors {
        static { MainThreadTextEditors_1 = this; }
        static { this.INSTANCE_COUNT = 0; }
        constructor(_editorLocator, extHostContext, _codeEditorService, _editorService, _editorGroupService, _configurationService) {
            this._editorLocator = _editorLocator;
            this._codeEditorService = _codeEditorService;
            this._editorService = _editorService;
            this._editorGroupService = _editorGroupService;
            this._configurationService = _configurationService;
            this._toDispose = new lifecycle_1.DisposableStore();
            this._instanceId = String(++MainThreadTextEditors_1.INSTANCE_COUNT);
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostEditors);
            this._textEditorsListenersMap = Object.create(null);
            this._editorPositionData = null;
            this._toDispose.add(this._editorService.onDidVisibleEditorsChange(() => this._updateActiveAndVisibleTextEditors()));
            this._toDispose.add(this._editorGroupService.onDidRemoveGroup(() => this._updateActiveAndVisibleTextEditors()));
            this._toDispose.add(this._editorGroupService.onDidMoveGroup(() => this._updateActiveAndVisibleTextEditors()));
            this._registeredDecorationTypes = Object.create(null);
        }
        dispose() {
            Object.keys(this._textEditorsListenersMap).forEach((editorId) => {
                (0, lifecycle_1.dispose)(this._textEditorsListenersMap[editorId]);
            });
            this._textEditorsListenersMap = Object.create(null);
            this._toDispose.dispose();
            for (const decorationType in this._registeredDecorationTypes) {
                this._codeEditorService.removeDecorationType(decorationType);
            }
            this._registeredDecorationTypes = Object.create(null);
        }
        handleTextEditorAdded(textEditor) {
            const id = textEditor.getId();
            const toDispose = [];
            toDispose.push(textEditor.onPropertiesChanged((data) => {
                this._proxy.$acceptEditorPropertiesChanged(id, data);
            }));
            this._textEditorsListenersMap[id] = toDispose;
        }
        handleTextEditorRemoved(id) {
            (0, lifecycle_1.dispose)(this._textEditorsListenersMap[id]);
            delete this._textEditorsListenersMap[id];
        }
        _updateActiveAndVisibleTextEditors() {
            // editor columns
            const editorPositionData = this._getTextEditorPositionData();
            if (!(0, objects_1.equals)(this._editorPositionData, editorPositionData)) {
                this._editorPositionData = editorPositionData;
                this._proxy.$acceptEditorPositionData(this._editorPositionData);
            }
        }
        _getTextEditorPositionData() {
            const result = Object.create(null);
            for (const editorPane of this._editorService.visibleEditorPanes) {
                const id = this._editorLocator.findTextEditorIdFor(editorPane);
                if (id) {
                    result[id] = (0, editorGroupColumn_1.editorGroupToColumn)(this._editorGroupService, editorPane.group);
                }
            }
            return result;
        }
        // --- from extension host process
        async $tryShowTextDocument(resource, options) {
            const uri = uri_1.URI.revive(resource);
            const editorOptions = {
                preserveFocus: options.preserveFocus,
                pinned: options.pinned,
                selection: options.selection,
                // preserve pre 1.38 behaviour to not make group active when preserveFocus: true
                // but make sure to restore the editor to fix https://github.com/microsoft/vscode/issues/79633
                activation: options.preserveFocus ? editor_1.EditorActivation.RESTORE : undefined,
                override: editor_1.EditorResolution.EXCLUSIVE_ONLY
            };
            const input = {
                resource: uri,
                options: editorOptions
            };
            const editor = await this._editorService.openEditor(input, (0, editorGroupColumn_1.columnToEditorGroup)(this._editorGroupService, this._configurationService, options.position));
            if (!editor) {
                return undefined;
            }
            // Composite editors are made up of many editors so we return the active one at the time of opening
            const editorControl = editor.getControl();
            const codeEditor = (0, editorBrowser_1.getCodeEditor)(editorControl);
            return codeEditor ? this._editorLocator.getIdOfCodeEditor(codeEditor) : undefined;
        }
        async $tryShowEditor(id, position) {
            const mainThreadEditor = this._editorLocator.getEditor(id);
            if (mainThreadEditor) {
                const model = mainThreadEditor.getModel();
                await this._editorService.openEditor({
                    resource: model.uri,
                    options: { preserveFocus: false }
                }, (0, editorGroupColumn_1.columnToEditorGroup)(this._editorGroupService, this._configurationService, position));
                return;
            }
        }
        async $tryHideEditor(id) {
            const mainThreadEditor = this._editorLocator.getEditor(id);
            if (mainThreadEditor) {
                const editorPanes = this._editorService.visibleEditorPanes;
                for (const editorPane of editorPanes) {
                    if (mainThreadEditor.matches(editorPane)) {
                        await editorPane.group.closeEditor(editorPane.input);
                        return;
                    }
                }
            }
        }
        $trySetSelections(id, selections) {
            const editor = this._editorLocator.getEditor(id);
            if (!editor) {
                return Promise.reject((0, errors_1.illegalArgument)(`TextEditor(${id})`));
            }
            editor.setSelections(selections);
            return Promise.resolve(undefined);
        }
        $trySetDecorations(id, key, ranges) {
            key = `${this._instanceId}-${key}`;
            const editor = this._editorLocator.getEditor(id);
            if (!editor) {
                return Promise.reject((0, errors_1.illegalArgument)(`TextEditor(${id})`));
            }
            editor.setDecorations(key, ranges);
            return Promise.resolve(undefined);
        }
        $trySetDecorationsFast(id, key, ranges) {
            key = `${this._instanceId}-${key}`;
            const editor = this._editorLocator.getEditor(id);
            if (!editor) {
                return Promise.reject((0, errors_1.illegalArgument)(`TextEditor(${id})`));
            }
            editor.setDecorationsFast(key, ranges);
            return Promise.resolve(undefined);
        }
        $tryRevealRange(id, range, revealType) {
            const editor = this._editorLocator.getEditor(id);
            if (!editor) {
                return Promise.reject((0, errors_1.illegalArgument)(`TextEditor(${id})`));
            }
            editor.revealRange(range, revealType);
            return Promise.resolve();
        }
        $trySetOptions(id, options) {
            const editor = this._editorLocator.getEditor(id);
            if (!editor) {
                return Promise.reject((0, errors_1.illegalArgument)(`TextEditor(${id})`));
            }
            editor.setConfiguration(options);
            return Promise.resolve(undefined);
        }
        $tryApplyEdits(id, modelVersionId, edits, opts) {
            const editor = this._editorLocator.getEditor(id);
            if (!editor) {
                return Promise.reject((0, errors_1.illegalArgument)(`TextEditor(${id})`));
            }
            return Promise.resolve(editor.applyEdits(modelVersionId, edits, opts));
        }
        $tryInsertSnippet(id, modelVersionId, template, ranges, opts) {
            const editor = this._editorLocator.getEditor(id);
            if (!editor) {
                return Promise.reject((0, errors_1.illegalArgument)(`TextEditor(${id})`));
            }
            return Promise.resolve(editor.insertSnippet(modelVersionId, template, ranges, opts));
        }
        $registerTextEditorDecorationType(extensionId, key, options) {
            key = `${this._instanceId}-${key}`;
            this._registeredDecorationTypes[key] = true;
            this._codeEditorService.registerDecorationType(`exthost-api-${extensionId}`, key, options);
        }
        $removeTextEditorDecorationType(key) {
            key = `${this._instanceId}-${key}`;
            delete this._registeredDecorationTypes[key];
            this._codeEditorService.removeDecorationType(key);
        }
        $getDiffInformation(id) {
            const editor = this._editorLocator.getEditor(id);
            if (!editor) {
                return Promise.reject(new Error('No such TextEditor'));
            }
            const codeEditor = editor.getCodeEditor();
            if (!codeEditor) {
                return Promise.reject(new Error('No such CodeEditor'));
            }
            const codeEditorId = codeEditor.getId();
            const diffEditors = this._codeEditorService.listDiffEditors();
            const [diffEditor] = diffEditors.filter(d => d.getOriginalEditor().getId() === codeEditorId || d.getModifiedEditor().getId() === codeEditorId);
            if (diffEditor) {
                return Promise.resolve(diffEditor.getLineChanges() || []);
            }
            const dirtyDiffContribution = codeEditor.getContribution('editor.contrib.dirtydiff');
            if (dirtyDiffContribution) {
                return Promise.resolve(dirtyDiffContribution.getChanges());
            }
            return Promise.resolve([]);
        }
    };
    exports.MainThreadTextEditors = MainThreadTextEditors;
    exports.MainThreadTextEditors = MainThreadTextEditors = MainThreadTextEditors_1 = __decorate([
        __param(2, codeEditorService_1.ICodeEditorService),
        __param(3, editorService_1.IEditorService),
        __param(4, editorGroupsService_1.IEditorGroupsService),
        __param(5, configuration_1.IConfigurationService)
    ], MainThreadTextEditors);
    // --- commands
    commands_1.CommandsRegistry.registerCommand('_workbench.revertAllDirty', async function (accessor) {
        const environmentService = accessor.get(environment_1.IEnvironmentService);
        if (!environmentService.extensionTestsLocationURI) {
            throw new Error('Command is only available when running extension tests.');
        }
        const workingCopyService = accessor.get(workingCopyService_1.IWorkingCopyService);
        for (const workingCopy of workingCopyService.dirtyWorkingCopies) {
            await workingCopy.revert({ soft: true });
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZEVkaXRvcnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2Jyb3dzZXIvbWFpblRocmVhZEVkaXRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQW1DekYsSUFBTSxxQkFBcUIsR0FBM0IsTUFBTSxxQkFBcUI7O2lCQUVsQixtQkFBYyxHQUFXLENBQUMsQUFBWixDQUFhO1FBUzFDLFlBQ2tCLGNBQXdDLEVBQ3pELGNBQStCLEVBQ1gsa0JBQXVELEVBQzNELGNBQStDLEVBQ3pDLG1CQUEwRCxFQUN6RCxxQkFBNkQ7WUFMbkUsbUJBQWMsR0FBZCxjQUFjLENBQTBCO1lBRXBCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7WUFDMUMsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBQ3hCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFDeEMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQVhwRSxlQUFVLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFhbkQsSUFBSSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsRUFBRSx1QkFBcUIsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNsRSxJQUFJLENBQUMsTUFBTSxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsaUNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUVyRSxJQUFJLENBQUMsd0JBQXdCLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNwRCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO1lBRWhDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMseUJBQXlCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxFQUFFLENBQUMsQ0FBQyxDQUFD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