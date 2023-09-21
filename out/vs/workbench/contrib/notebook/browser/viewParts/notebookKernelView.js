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
define(["require", "exports", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/common/actions", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/extensions/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/base/common/themables", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/workbench/contrib/notebook/browser/viewParts/notebookKernelQuickPickStrategy", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/workbench/services/editor/common/editorService"], function (require, exports, actionViewItems_1, actions_1, nls_1, actions_2, contextkey_1, extensions_1, instantiation_1, themables_1, coreActions_1, notebookBrowser_1, notebookIcons_1, notebookKernelQuickPickStrategy_1, notebookContextKeys_1, notebookKernelService_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebooKernelActionViewItem = void 0;
    function getEditorFromContext(editorService, context) {
        let editor;
        if (context !== undefined && 'notebookEditorId' in context) {
            const editorId = context.notebookEditorId;
            const matchingEditor = editorService.visibleEditorPanes.find((editorPane) => {
                const notebookEditor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(editorPane);
                return notebookEditor?.getId() === editorId;
            });
            editor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(matchingEditor);
        }
        else if (context !== undefined && 'notebookEditor' in context) {
            editor = context?.notebookEditor;
        }
        else {
            editor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(editorService.activeEditorPane);
        }
        return editor;
    }
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: coreActions_1.SELECT_KERNEL_ID,
                category: coreActions_1.NOTEBOOK_ACTIONS_CATEGORY,
                title: { value: (0, nls_1.localize)('notebookActions.selectKernel', "Select Notebook Kernel"), original: 'Select Notebook Kernel' },
                icon: notebookIcons_1.selectKernelIcon,
                f1: true,
                precondition: notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR,
                menu: [{
                        id: actions_2.MenuId.EditorTitle,
                        when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR, contextkey_1.ContextKeyExpr.notEquals('config.notebook.globalToolbar', true)),
                        group: 'navigation',
                        order: -10
                    }, {
                        id: actions_2.MenuId.NotebookToolbar,
                        when: contextkey_1.ContextKeyExpr.equals('config.notebook.globalToolbar', true),
                        group: 'status',
                        order: -10
                    }, {
                        id: actions_2.MenuId.InteractiveToolbar,
                        when: notebookContextKeys_1.NOTEBOOK_KERNEL_COUNT.notEqualsTo(0),
                        group: 'status',
                        order: -10
                    }],
                description: {
                    description: (0, nls_1.localize)('notebookActions.selectKernel.args', "Notebook Kernel Args"),
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
            const instantiationService = accessor.get(instantiation_1.IInstantiationService);
            const editorService = accessor.get(editorService_1.IEditorService);
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
            const notebookKernelService = accessor.get(notebookKernelService_1.INotebookKernelService);
            const matchResult = notebookKernelService.getMatchingKernel(notebook);
            const { selected } = matchResult;
            if (selected && controllerId && selected.id === controllerId && extensions_1.ExtensionIdentifier.equals(selected.extension, extensionId)) {
                // current kernel is wanted kernel -> done
                return true;
            }
            const wantedKernelId = controllerId ? `${extensionId}/${controllerId}` : undefined;
            const strategy = instantiationService.createInstance(notebookKernelQuickPickStrategy_1.KernelPickerMRUStrategy);
            return strategy.showQuickPick(editor, wantedKernelId);
        }
    });
    let NotebooKernelActionViewItem = class NotebooKernelActionViewItem extends actionViewItems_1.ActionViewItem {
        constructor(actualAction, _editor, _notebookKernelService, _notebookKernelHistoryService) {
            super(undefined, new actions_1.Action('fakeAction', undefined, themables_1.ThemeIcon.asClassName(notebookIcons_1.selectKernelIcon), true, (event) => actualAction.run(event)), { label: false, icon: true });
            this._editor = _editor;
            this._notebookKernelService = _notebookKernelService;
            this._notebookKernelHistoryService = _notebookKernelHistoryService;
            this._register(_editor.onDidChangeModel(this._update, this));
            this._register(_notebookKernelService.onDidAddKernel(this._update, this));
            this._register(_notebookKernelService.onDidRemoveKernel(this._update, this));
            this._register(_notebookKernelService.onDidChangeNotebookAffinity(this._update, this));
            this._register(_notebookKernelService.onDidChangeSelectedNotebooks(this._update, this));
            this._register(_notebookKernelService.onDidChangeSourceActions(this._update, this));
            this._register(_notebookKernelService.onDidChangeKernelDetectionTasks(this._update, this));
        }
        render(container) {
            this._update();
            super.render(container);
            container.classList.add('kernel-action-view-item');
            this._kernelLabel = document.createElement('a');
            container.appendChild(this._kernelLabel);
            this.updateLabel();
        }
        updateLabel() {
            if (this._kernelLabel) {
                this._kernelLabel.classList.add('kernel-label');
                this._kernelLabel.innerText = this._action.label;
                this._kernelLabel.title = this._action.tooltip;
            }
        }
        _update() {
            const notebook = this._editor.textModel;
            if (!notebook) {
                this._resetAction();
                return;
            }
            notebookKernelQuickPickStrategy_1.KernelPickerMRUStrategy.updateKernelStatusAction(notebook, this._action, this._notebookKernelService, this._notebookKernelHistoryService);
            this.updateClass();
        }
        _resetAction() {
            this._action.enabled = false;
            this._action.label = '';
            this._action.class = '';
        }
    };
    exports.NotebooKernelActionViewItem = NotebooKernelActionViewItem;
    exports.NotebooKernelActionViewItem = NotebooKernelActionViewItem = __decorate([
        __param(2, notebookKernelService_1.INotebookKernelService),
        __param(3, notebookKernelService_1.INotebookKernelHistoryService)
    ], NotebooKernelActionViewItem);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tLZXJuZWxWaWV3LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci92aWV3UGFydHMvbm90ZWJvb2tLZXJuZWxWaWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQW9CaEcsU0FBUyxvQkFBb0IsQ0FBQyxhQUE2QixFQUFFLE9BQWdDO1FBQzVGLElBQUksTUFBbUMsQ0FBQztRQUN4QyxJQUFJLE9BQU8sS0FBSyxTQUFTLElBQUksa0JBQWtCLElBQUksT0FBTyxFQUFFO1lBQzNELE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztZQUMxQyxNQUFNLGNBQWMsR0FBRyxhQUFhLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxFQUFFLEVBQUU7Z0JBQzNFLE1BQU0sY0FBYyxHQUFHLElBQUEsaURBQStCLEVBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ25FLE9BQU8sY0FBYyxFQUFFLEtBQUssRUFBRSxLQUFLLFFBQVEsQ0FBQztZQUM3QyxDQUFDLENBQUMsQ0FBQztZQUNILE1BQU0sR0FBRyxJQUFBLGlEQUErQixFQUFDLGNBQWMsQ0FBQyxDQUFDO1NBQ3pEO2FBQU0sSUFBSSxPQUFPLEtBQUssU0FBUyxJQUFJLGdCQUFnQixJQUFJLE9BQU8sRUFBRTtZQUNoRSxNQUFNLEdBQUcsT0FBTyxFQUFFLGNBQWMsQ0FBQztTQUNqQzthQUFNO1lBQ04sTUFBTSxHQUFHLElBQUEsaURBQStCLEVBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQUM7U0FDekU7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7SUFFRCxJQUFBLHlCQUFlLEVBQUMsS0FBTSxTQUFRLGlCQUFPO1FBQ3BDO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSw4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