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
define(["require", "exports", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/common/actions", "vs/nls!vs/workbench/contrib/notebook/browser/viewParts/notebookKernelView", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/extensions/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/base/common/themables", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/workbench/contrib/notebook/browser/viewParts/notebookKernelQuickPickStrategy", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/workbench/services/editor/common/editorService"], function (require, exports, actionViewItems_1, actions_1, nls_1, actions_2, contextkey_1, extensions_1, instantiation_1, themables_1, coreActions_1, notebookBrowser_1, notebookIcons_1, notebookKernelQuickPickStrategy_1, notebookContextKeys_1, notebookKernelService_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$$qb = void 0;
    function getEditorFromContext(editorService, context) {
        let editor;
        if (context !== undefined && 'notebookEditorId' in context) {
            const editorId = context.notebookEditorId;
            const matchingEditor = editorService.visibleEditorPanes.find((editorPane) => {
                const notebookEditor = (0, notebookBrowser_1.$Zbb)(editorPane);
                return notebookEditor?.getId() === editorId;
            });
            editor = (0, notebookBrowser_1.$Zbb)(matchingEditor);
        }
        else if (context !== undefined && 'notebookEditor' in context) {
            editor = context?.notebookEditor;
        }
        else {
            editor = (0, notebookBrowser_1.$Zbb)(editorService.activeEditorPane);
        }
        return editor;
    }
    (0, actions_2.$Xu)(class extends actions_2.$Wu {
        constructor() {
            super({
                id: coreActions_1.$6ob,
                category: coreActions_1.$7ob,
                title: { value: (0, nls_1.localize)(0, null), original: 'Select Notebook Kernel' },
                icon: notebookIcons_1.$tpb,
                f1: true,
                precondition: notebookContextKeys_1.$Wnb,
                menu: [{
                        id: actions_2.$Ru.EditorTitle,
                        when: contextkey_1.$Ii.and(notebookContextKeys_1.$Wnb, contextkey_1.$Ii.notEquals('config.notebook.globalToolbar', true)),
                        group: 'navigation',
                        order: -10
                    }, {
                        id: actions_2.$Ru.NotebookToolbar,
                        when: contextkey_1.$Ii.equals('config.notebook.globalToolbar', true),
                        group: 'status',
                        order: -10
                    }, {
                        id: actions_2.$Ru.InteractiveToolbar,
                        when: notebookContextKeys_1.$mob.notEqualsTo(0),
                        group: 'status',
                        order: -10
                    }],
                description: {
                    description: (0, nls_1.localize)(1, null),
                    args: [
                        {
                            name: 'kernelInfo',
                            description: 'The kernel info',
                            schema: {
                                'type': 'object',
                                'required': ['id', 'extension'],
                                'properties': {
                                    'id': {
                                        'type': 'string'
                                    },
                                    'extension': {
                                        'type': 'string'
                                    },
                                    'notebookEditorId': {
                                        'type': 'string'
                                    }
                                }
                            }
                        }
                    ]
                },
            });
        }
        async run(accessor, context) {
            const instantiationService = accessor.get(instantiation_1.$Ah);
            const editorService = accessor.get(editorService_1.$9C);
            const editor = getEditorFromContext(editorService, context);
            if (!editor || !editor.hasModel()) {
                return false;
            }
            let controllerId = context && 'id' in context ? context.id : undefined;
            let extensionId = context && 'extension' in context ? context.extension : undefined;
            if (controllerId && (typeof controllerId !== 'string' || typeof extensionId !== 'string')) {
                // validate context: id & extension MUST be strings
                controllerId = undefined;
                extensionId = undefined;
            }
            const notebook = editor.textModel;
            const notebookKernelService = accessor.get(notebookKernelService_1.$Bbb);
            const matchResult = notebookKernelService.getMatchingKernel(notebook);
            const { selected } = matchResult;
            if (selected && controllerId && selected.id === controllerId && extensions_1.$Vl.equals(selected.extension, extensionId)) {
                // current kernel is wanted kernel -> done
                return true;
            }
            const wantedKernelId = controllerId ? `${extensionId}/${controllerId}` : undefined;
            const strategy = instantiationService.createInstance(notebookKernelQuickPickStrategy_1.$0qb);
            return strategy.showQuickPick(editor, wantedKernelId);
        }
    });
    let $$qb = class $$qb extends actionViewItems_1.$NQ {
        constructor(actualAction, b, c, g) {
            super(undefined, new actions_1.$gi('fakeAction', undefined, themables_1.ThemeIcon.asClassName(notebookIcons_1.$tpb), true, (event) => actualAction.run(event)), { label: false, icon: true });
            this.b = b;
            this.c = c;
            this.g = g;
            this.B(b.onDidChangeModel(this.n, this));
            this.B(c.onDidAddKernel(this.n, this));
            this.B(c.onDidRemoveKernel(this.n, this));
            this.B(c.onDidChangeNotebookAffinity(this.n, this));
            this.B(c.onDidChangeSelectedNotebooks(this.n, this));
            this.B(c.onDidChangeSourceActions(this.n, this));
            this.B(c.onDidChangeKernelDetectionTasks(this.n, this));
        }
        render(container) {
            this.n();
            super.render(container);
            container.classList.add('kernel-action-view-item');
            this.a = document.createElement('a');
            container.appendChild(this.a);
            this.w();
        }
        w() {
            if (this.a) {
                this.a.classList.add('kernel-label');
                this.a.innerText = this._action.label;
                this.a.title = this._action.tooltip;
            }
        }
        n() {
            const notebook = this.b.textModel;
            if (!notebook) {
                this.r();
                return;
            }
            notebookKernelQuickPickStrategy_1.$0qb.updateKernelStatusAction(notebook, this._action, this.c, this.g);
            this.F();
        }
        r() {
            this._action.enabled = false;
            this._action.label = '';
            this._action.class = '';
        }
    };
    exports.$$qb = $$qb;
    exports.$$qb = $$qb = __decorate([
        __param(2, notebookKernelService_1.$Bbb),
        __param(3, notebookKernelService_1.$Cbb)
    ], $$qb);
});
//# sourceMappingURL=notebookKernelView.js.map