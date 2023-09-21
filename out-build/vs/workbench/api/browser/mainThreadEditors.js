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
    var $meb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$meb = void 0;
    let $meb = class $meb {
        static { $meb_1 = this; }
        static { this.a = 0; }
        constructor(i, extHostContext, j, k, l, m) {
            this.i = i;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.e = new lifecycle_1.$jc();
            this.b = String(++$meb_1.a);
            this.c = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostEditors);
            this.f = Object.create(null);
            this.g = null;
            this.e.add(this.k.onDidVisibleEditorsChange(() => this.n()));
            this.e.add(this.l.onDidRemoveGroup(() => this.n()));
            this.e.add(this.l.onDidMoveGroup(() => this.n()));
            this.h = Object.create(null);
        }
        dispose() {
            Object.keys(this.f).forEach((editorId) => {
                (0, lifecycle_1.$fc)(this.f[editorId]);
            });
            this.f = Object.create(null);
            this.e.dispose();
            for (const decorationType in this.h) {
                this.j.removeDecorationType(decorationType);
            }
            this.h = Object.create(null);
        }
        handleTextEditorAdded(textEditor) {
            const id = textEditor.getId();
            const toDispose = [];
            toDispose.push(textEditor.onPropertiesChanged((data) => {
                this.c.$acceptEditorPropertiesChanged(id, data);
            }));
            this.f[id] = toDispose;
        }
        handleTextEditorRemoved(id) {
            (0, lifecycle_1.$fc)(this.f[id]);
            delete this.f[id];
        }
        n() {
            // editor columns
            const editorPositionData = this.o();
            if (!(0, objects_1.$Zm)(this.g, editorPositionData)) {
                this.g = editorPositionData;
                this.c.$acceptEditorPositionData(this.g);
            }
        }
        o() {
            const result = Object.create(null);
            for (const editorPane of this.k.visibleEditorPanes) {
                const id = this.i.findTextEditorIdFor(editorPane);
                if (id) {
                    result[id] = (0, editorGroupColumn_1.$5I)(this.l, editorPane.group);
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
            const editor = await this.k.openEditor(input, (0, editorGroupColumn_1.$4I)(this.l, this.m, options.position));
            if (!editor) {
                return undefined;
            }
            // Composite editors are made up of many editors so we return the active one at the time of opening
            const editorControl = editor.getControl();
            const codeEditor = (0, editorBrowser_1.$lV)(editorControl);
            return codeEditor ? this.i.getIdOfCodeEditor(codeEditor) : undefined;
        }
        async $tryShowEditor(id, position) {
            const mainThreadEditor = this.i.getEditor(id);
            if (mainThreadEditor) {
                const model = mainThreadEditor.getModel();
                await this.k.openEditor({
                    resource: model.uri,
                    options: { preserveFocus: false }
                }, (0, editorGroupColumn_1.$4I)(this.l, this.m, position));
                return;
            }
        }
        async $tryHideEditor(id) {
            const mainThreadEditor = this.i.getEditor(id);
            if (mainThreadEditor) {
                const editorPanes = this.k.visibleEditorPanes;
                for (const editorPane of editorPanes) {
                    if (mainThreadEditor.matches(editorPane)) {
                        await editorPane.group.closeEditor(editorPane.input);
                        return;
                    }
                }
            }
        }
        $trySetSelections(id, selections) {
            const editor = this.i.getEditor(id);
            if (!editor) {
                return Promise.reject((0, errors_1.$5)(`TextEditor(${id})`));
            }
            editor.setSelections(selections);
            return Promise.resolve(undefined);
        }
        $trySetDecorations(id, key, ranges) {
            key = `${this.b}-${key}`;
            const editor = this.i.getEditor(id);
            if (!editor) {
                return Promise.reject((0, errors_1.$5)(`TextEditor(${id})`));
            }
            editor.setDecorations(key, ranges);
            return Promise.resolve(undefined);
        }
        $trySetDecorationsFast(id, key, ranges) {
            key = `${this.b}-${key}`;
            const editor = this.i.getEditor(id);
            if (!editor) {
                return Promise.reject((0, errors_1.$5)(`TextEditor(${id})`));
            }
            editor.setDecorationsFast(key, ranges);
            return Promise.resolve(undefined);
        }
        $tryRevealRange(id, range, revealType) {
            const editor = this.i.getEditor(id);
            if (!editor) {
                return Promise.reject((0, errors_1.$5)(`TextEditor(${id})`));
            }
            editor.revealRange(range, revealType);
            return Promise.resolve();
        }
        $trySetOptions(id, options) {
            const editor = this.i.getEditor(id);
            if (!editor) {
                return Promise.reject((0, errors_1.$5)(`TextEditor(${id})`));
            }
            editor.setConfiguration(options);
            return Promise.resolve(undefined);
        }
        $tryApplyEdits(id, modelVersionId, edits, opts) {
            const editor = this.i.getEditor(id);
            if (!editor) {
                return Promise.reject((0, errors_1.$5)(`TextEditor(${id})`));
            }
            return Promise.resolve(editor.applyEdits(modelVersionId, edits, opts));
        }
        $tryInsertSnippet(id, modelVersionId, template, ranges, opts) {
            const editor = this.i.getEditor(id);
            if (!editor) {
                return Promise.reject((0, errors_1.$5)(`TextEditor(${id})`));
            }
            return Promise.resolve(editor.insertSnippet(modelVersionId, template, ranges, opts));
        }
        $registerTextEditorDecorationType(extensionId, key, options) {
            key = `${this.b}-${key}`;
            this.h[key] = true;
            this.j.registerDecorationType(`exthost-api-${extensionId}`, key, options);
        }
        $removeTextEditorDecorationType(key) {
            key = `${this.b}-${key}`;
            delete this.h[key];
            this.j.removeDecorationType(key);
        }
        $getDiffInformation(id) {
            const editor = this.i.getEditor(id);
            if (!editor) {
                return Promise.reject(new Error('No such TextEditor'));
            }
            const codeEditor = editor.getCodeEditor();
            if (!codeEditor) {
                return Promise.reject(new Error('No such CodeEditor'));
            }
            const codeEditorId = codeEditor.getId();
            const diffEditors = this.j.listDiffEditors();
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
    exports.$meb = $meb;
    exports.$meb = $meb = $meb_1 = __decorate([
        __param(2, codeEditorService_1.$nV),
        __param(3, editorService_1.$9C),
        __param(4, editorGroupsService_1.$5C),
        __param(5, configuration_1.$8h)
    ], $meb);
    // --- commands
    commands_1.$Gr.registerCommand('_workbench.revertAllDirty', async function (accessor) {
        const environmentService = accessor.get(environment_1.$Ih);
        if (!environmentService.extensionTestsLocationURI) {
            throw new Error('Command is only available when running extension tests.');
        }
        const workingCopyService = accessor.get(workingCopyService_1.$TC);
        for (const workingCopy of workingCopyService.dirtyWorkingCopies) {
            await workingCopy.revert({ soft: true });
        }
    });
});
//# sourceMappingURL=mainThreadEditors.js.map