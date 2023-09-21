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
    exports.$6Eb = void 0;
    let $6Eb = class $6Eb {
        constructor(editorGroupService, editorService, contextKeyService) {
            this.a = 1;
            this.b = new lifecycle_1.$jc();
            this.c = new Map();
            this.d = new event_1.$fd();
            this.f = new event_1.$fd();
            this.onDidAddNotebookEditor = this.d.event;
            this.onDidRemoveNotebookEditor = this.f.event;
            this.g = new Map();
            const groupListener = new Map();
            const onNewGroup = (group) => {
                const { id } = group;
                const listeners = [];
                listeners.push(group.onDidCloseEditor(e => {
                    const widgets = this.g.get(group.id);
                    if (!widgets) {
                        return;
                    }
                    const inputs = e.editor instanceof notebookEditorInput_1.$zbb ? [e.editor] : ((0, notebookEditorInput_1.$Abb)(e.editor) ? e.editor.editorInputs : []);
                    inputs.forEach(input => {
                        const value = widgets.get(input.resource);
                        if (!value) {
                            return;
                        }
                        value.token = undefined;
                        this.h(value.widget);
                        widgets.delete(input.resource);
                        value.widget = undefined; // unset the widget so that others that still hold a reference don't harm us
                    });
                }));
                listeners.push(group.onWillMoveEditor(e => {
                    if (e.editor instanceof notebookEditorInput_1.$zbb) {
                        this.i(e.editor, e.groupId, e.target);
                    }
                    if ((0, notebookEditorInput_1.$Abb)(e.editor)) {
                        e.editor.editorInputs.forEach(input => {
                            this.i(input, e.groupId, e.target);
                        });
                    }
                }));
                groupListener.set(id, listeners);
            };
            this.b.add(editorGroupService.onDidAddGroup(onNewGroup));
            editorGroupService.whenReady.then(() => editorGroupService.groups.forEach(onNewGroup));
            // group removed -> clean up listeners, clean up widgets
            this.b.add(editorGroupService.onDidRemoveGroup(group => {
                const listeners = groupListener.get(group.id);
                if (listeners) {
                    listeners.forEach(listener => listener.dispose());
                    groupListener.delete(group.id);
                }
                const widgets = this.g.get(group.id);
                this.g.delete(group.id);
                if (widgets) {
                    for (const value of widgets.values()) {
                        value.token = undefined;
                        this.h(value.widget);
                    }
                }
            }));
            const interactiveWindowOpen = notebookContextKeys_1.$Vnb.bindTo(contextKeyService);
            this.b.add(editorService.onDidEditorsChange(e => {
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
            this.b.dispose();
            this.d.dispose();
            this.f.dispose();
        }
        // --- group-based editor borrowing...
        h(widget) {
            widget.onWillHide();
            const domNode = widget.getDomNode();
            widget.dispose();
            domNode.remove();
        }
        i(input, sourceID, targetID) {
            const targetWidget = this.g.get(targetID)?.get(input.resource);
            if (targetWidget) {
                // not needed
                return;
            }
            const widget = this.g.get(sourceID)?.get(input.resource);
            if (!widget) {
                throw new Error('no widget at source group');
            }
            // don't allow the widget to be retrieved at its previous location any more
            this.g.get(sourceID)?.delete(input.resource);
            // allow the widget to be retrieved at its new location
            let targetMap = this.g.get(targetID);
            if (!targetMap) {
                targetMap = new map_1.$zi();
                this.g.set(targetID, targetMap);
            }
            targetMap.set(input.resource, widget);
        }
        retrieveExistingWidgetFromURI(resource) {
            for (const widgetInfo of this.g.values()) {
                const widget = widgetInfo.get(resource);
                if (widget) {
                    return this.j(widget.token, widget);
                }
            }
            return undefined;
        }
        retrieveAllExistingWidgets() {
            const ret = [];
            for (const widgetInfo of this.g.values()) {
                for (const widget of widgetInfo.values()) {
                    ret.push(this.j(widget.token, widget));
                }
            }
            return ret;
        }
        retrieveWidget(accessor, group, input, creationOptions, initialDimension) {
            let value = this.g.get(group.id)?.get(input.resource);
            if (!value) {
                // NEW widget
                const instantiationService = accessor.get(instantiation_1.$Ah);
                const widget = instantiationService.createInstance(notebookEditorWidget_1.$Crb, creationOptions ?? (0, notebookEditorWidget_1.$Brb)(), initialDimension);
                const token = this.a++;
                value = { widget, token };
                let map = this.g.get(group.id);
                if (!map) {
                    map = new map_1.$zi();
                    this.g.set(group.id, map);
                }
                map.set(input.resource, value);
            }
            else {
                // reuse a widget which was either free'ed before or which
                // is simply being reused...
                value.token = this.a++;
            }
            return this.j(value.token, value);
        }
        j(myToken, widget) {
            return {
                get value() {
                    return widget.token === myToken ? widget.widget : undefined;
                }
            };
        }
        // --- editor management
        addNotebookEditor(editor) {
            this.c.set(editor.getId(), editor);
            this.d.fire(editor);
        }
        removeNotebookEditor(editor) {
            if (this.c.has(editor.getId())) {
                this.c.delete(editor.getId());
                this.f.fire(editor);
            }
        }
        getNotebookEditor(editorId) {
            return this.c.get(editorId);
        }
        listNotebookEditors() {
            return [...this.c].map(e => e[1]);
        }
    };
    exports.$6Eb = $6Eb;
    exports.$6Eb = $6Eb = __decorate([
        __param(0, editorGroupsService_1.$5C),
        __param(1, editorService_1.$9C),
        __param(2, contextkey_1.$3i)
    ], $6Eb);
});
//# sourceMappingURL=notebookEditorServiceImpl.js.map