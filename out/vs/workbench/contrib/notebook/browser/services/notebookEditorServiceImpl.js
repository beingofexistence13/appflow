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
define(["require", "exports", "vs/base/common/map", "vs/workbench/contrib/notebook/browser/notebookEditorWidget", "vs/base/common/lifecycle", "vs/workbench/services/editor/common/editorGroupsService", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/notebook/common/notebookEditorInput", "vs/base/common/event", "vs/workbench/services/editor/common/editorService", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/notebook/common/notebookContextKeys"], function (require, exports, map_1, notebookEditorWidget_1, lifecycle_1, editorGroupsService_1, instantiation_1, notebookEditorInput_1, event_1, editorService_1, contextkey_1, notebookContextKeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookEditorWidgetService = void 0;
    let NotebookEditorWidgetService = class NotebookEditorWidgetService {
        constructor(editorGroupService, editorService, contextKeyService) {
            this._tokenPool = 1;
            this._disposables = new lifecycle_1.DisposableStore();
            this._notebookEditors = new Map();
            this._onNotebookEditorAdd = new event_1.Emitter();
            this._onNotebookEditorsRemove = new event_1.Emitter();
            this.onDidAddNotebookEditor = this._onNotebookEditorAdd.event;
            this.onDidRemoveNotebookEditor = this._onNotebookEditorsRemove.event;
            this._borrowableEditors = new Map();
            const groupListener = new Map();
            const onNewGroup = (group) => {
                const { id } = group;
                const listeners = [];
                listeners.push(group.onDidCloseEditor(e => {
                    const widgets = this._borrowableEditors.get(group.id);
                    if (!widgets) {
                        return;
                    }
                    const inputs = e.editor instanceof notebookEditorInput_1.NotebookEditorInput ? [e.editor] : ((0, notebookEditorInput_1.isCompositeNotebookEditorInput)(e.editor) ? e.editor.editorInputs : []);
                    inputs.forEach(input => {
                        const value = widgets.get(input.resource);
                        if (!value) {
                            return;
                        }
                        value.token = undefined;
                        this._disposeWidget(value.widget);
                        widgets.delete(input.resource);
                        value.widget = undefined; // unset the widget so that others that still hold a reference don't harm us
                    });
                }));
                listeners.push(group.onWillMoveEditor(e => {
                    if (e.editor instanceof notebookEditorInput_1.NotebookEditorInput) {
                        this._allowWidgetMove(e.editor, e.groupId, e.target);
                    }
                    if ((0, notebookEditorInput_1.isCompositeNotebookEditorInput)(e.editor)) {
                        e.editor.editorInputs.forEach(input => {
                            this._allowWidgetMove(input, e.groupId, e.target);
                        });
                    }
                }));
                groupListener.set(id, listeners);
            };
            this._disposables.add(editorGroupService.onDidAddGroup(onNewGroup));
            editorGroupService.whenReady.then(() => editorGroupService.groups.forEach(onNewGroup));
            // group removed -> clean up listeners, clean up widgets
            this._disposables.add(editorGroupService.onDidRemoveGroup(group => {
                const listeners = groupListener.get(group.id);
                if (listeners) {
                    listeners.forEach(listener => listener.dispose());
                    groupListener.delete(group.id);
                }
                const widgets = this._borrowableEditors.get(group.id);
                this._borrowableEditors.delete(group.id);
                if (widgets) {
                    for (const value of widgets.values()) {
                        value.token = undefined;
                        this._disposeWidget(value.widget);
                    }
                }
            }));
            const interactiveWindowOpen = notebookContextKeys_1.InteractiveWindowOpen.bindTo(contextKeyService);
            this._disposables.add(editorService.onDidEditorsChange(e => {
                if (e.event.kind === 3 /* GroupModelChangeKind.EDITOR_OPEN */ && !interactiveWindowOpen.get()) {
                    if (editorService.editors.find(editor => editor.editorId === 'interactive')) {
                        interactiveWindowOpen.set(true);
                    }
                }
                else if (e.event.kind === 4 /* GroupModelChangeKind.EDITOR_CLOSE */ && interactiveWindowOpen.get()) {
                    if (!editorService.editors.find(editor => editor.editorId === 'interactive')) {
                        interactiveWindowOpen.set(false);
                    }
                }
            }));
        }
        dispose() {
            this._disposables.dispose();
            this._onNotebookEditorAdd.dispose();
            this._onNotebookEditorsRemove.dispose();
        }
        // --- group-based editor borrowing...
        _disposeWidget(widget) {
            widget.onWillHide();
            const domNode = widget.getDomNode();
            widget.dispose();
            domNode.remove();
        }
        _allowWidgetMove(input, sourceID, targetID) {
            const targetWidget = this._borrowableEditors.get(targetID)?.get(input.resource);
            if (targetWidget) {
                // not needed
                return;
            }
            const widget = this._borrowableEditors.get(sourceID)?.get(input.resource);
            if (!widget) {
                throw new Error('no widget at source group');
            }
            // don't allow the widget to be retrieved at its previous location any more
            this._borrowableEditors.get(sourceID)?.delete(input.resource);
            // allow the widget to be retrieved at its new location
            let targetMap = this._borrowableEditors.get(targetID);
            if (!targetMap) {
                targetMap = new map_1.ResourceMap();
                this._borrowableEditors.set(targetID, targetMap);
            }
            targetMap.set(input.resource, widget);
        }
        retrieveExistingWidgetFromURI(resource) {
            for (const widgetInfo of this._borrowableEditors.values()) {
                const widget = widgetInfo.get(resource);
                if (widget) {
                    return this._createBorrowValue(widget.token, widget);
                }
            }
            return undefined;
        }
        retrieveAllExistingWidgets() {
            const ret = [];
            for (const widgetInfo of this._borrowableEditors.values()) {
                for (const widget of widgetInfo.values()) {
                    ret.push(this._createBorrowValue(widget.token, widget));
                }
            }
            return ret;
        }
        retrieveWidget(accessor, group, input, creationOptions, initialDimension) {
            let value = this._borrowableEditors.get(group.id)?.get(input.resource);
            if (!value) {
                // NEW widget
                const instantiationService = accessor.get(instantiation_1.IInstantiationService);
                const widget = instantiationService.createInstance(notebookEditorWidget_1.NotebookEditorWidget, creationOptions ?? (0, notebookEditorWidget_1.getDefaultNotebookCreationOptions)(), initialDimension);
                const token = this._tokenPool++;
                value = { widget, token };
                let map = this._borrowableEditors.get(group.id);
                if (!map) {
                    map = new map_1.ResourceMap();
                    this._borrowableEditors.set(group.id, map);
                }
                map.set(input.resource, value);
            }
            else {
                // reuse a widget which was either free'ed before or which
                // is simply being reused...
                value.token = this._tokenPool++;
            }
            return this._createBorrowValue(value.token, value);
        }
        _createBorrowValue(myToken, widget) {
            return {
                get value() {
                    return widget.token === myToken ? widget.widget : undefined;
                }
            };
        }
        // --- editor management
        addNotebookEditor(editor) {
            this._notebookEditors.set(editor.getId(), editor);
            this._onNotebookEditorAdd.fire(editor);
        }
        removeNotebookEditor(editor) {
            if (this._notebookEditors.has(editor.getId())) {
                this._notebookEditors.delete(editor.getId());
                this._onNotebookEditorsRemove.fire(editor);
            }
        }
        getNotebookEditor(editorId) {
            return this._notebookEditors.get(editorId);
        }
        listNotebookEditors() {
            return [...this._notebookEditors].map(e => e[1]);
        }
    };
    exports.NotebookEditorWidgetService = NotebookEditorWidgetService;
    exports.NotebookEditorWidgetService = NotebookEditorWidgetService = __decorate([
        __param(0, editorGroupsService_1.IEditorGroupsService),
        __param(1, editorService_1.IEditorService),
        __param(2, contextkey_1.IContextKeyService)
    ], NotebookEditorWidgetService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tFZGl0b3JTZXJ2aWNlSW1wbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvc2VydmljZXMvbm90ZWJvb2tFZGl0b3JTZXJ2aWNlSW1wbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFrQnpGLElBQU0sMkJBQTJCLEdBQWpDLE1BQU0sMkJBQTJCO1FBZ0J2QyxZQUN1QixrQkFBd0MsRUFDOUMsYUFBNkIsRUFDekIsaUJBQXFDO1lBZmxELGVBQVUsR0FBRyxDQUFDLENBQUM7WUFFTixpQkFBWSxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBQ3JDLHFCQUFnQixHQUFHLElBQUksR0FBRyxFQUEyQixDQUFDO1lBRXRELHlCQUFvQixHQUFHLElBQUksZUFBTyxFQUFtQixDQUFDO1lBQ3RELDZCQUF3QixHQUFHLElBQUksZUFBTyxFQUFtQixDQUFDO1lBQ2xFLDJCQUFzQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUM7WUFDekQsOEJBQXlCLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssQ0FBQztZQUV4RCx1QkFBa0IsR0FBRyxJQUFJLEdBQUcsRUFBb0YsQ0FBQztZQVFqSSxNQUFNLGFBQWEsR0FBRyxJQUFJLEdBQUcsRUFBeUIsQ0FBQztZQUN2RCxNQUFNLFVBQVUsR0FBRyxDQUFDLEtBQW1CLEVBQUUsRUFBRTtnQkFDMUMsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLEtBQUssQ0FBQztnQkFDckIsTUFBTSxTQUFTLEdBQWtCLEVBQUUsQ0FBQztnQkFDcEMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQ3pDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxrQkFBa0Is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