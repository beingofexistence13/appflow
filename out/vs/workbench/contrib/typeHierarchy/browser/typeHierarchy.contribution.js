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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/codicons", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/range", "vs/editor/contrib/peekView/browser/peekView", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/workbench/contrib/typeHierarchy/browser/typeHierarchyPeek", "vs/workbench/contrib/typeHierarchy/common/typeHierarchy"], function (require, exports, cancellation_1, codicons_1, errors_1, event_1, lifecycle_1, editorExtensions_1, codeEditorService_1, range_1, peekView_1, nls_1, actions_1, contextkey_1, instantiation_1, storage_1, typeHierarchyPeek_1, typeHierarchy_1) {
    "use strict";
    var TypeHierarchyController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    const _ctxHasTypeHierarchyProvider = new contextkey_1.RawContextKey('editorHasTypeHierarchyProvider', false, (0, nls_1.localize)('editorHasTypeHierarchyProvider', 'Whether a type hierarchy provider is available'));
    const _ctxTypeHierarchyVisible = new contextkey_1.RawContextKey('typeHierarchyVisible', false, (0, nls_1.localize)('typeHierarchyVisible', 'Whether type hierarchy peek is currently showing'));
    const _ctxTypeHierarchyDirection = new contextkey_1.RawContextKey('typeHierarchyDirection', undefined, { type: 'string', description: (0, nls_1.localize)('typeHierarchyDirection', 'whether type hierarchy shows super types or subtypes') });
    function sanitizedDirection(candidate) {
        return candidate === "subtypes" /* TypeHierarchyDirection.Subtypes */ || candidate === "supertypes" /* TypeHierarchyDirection.Supertypes */
            ? candidate
            : "subtypes" /* TypeHierarchyDirection.Subtypes */;
    }
    let TypeHierarchyController = class TypeHierarchyController {
        static { TypeHierarchyController_1 = this; }
        static { this.Id = 'typeHierarchy'; }
        static get(editor) {
            return editor.getContribution(TypeHierarchyController_1.Id);
        }
        static { this._storageDirectionKey = 'typeHierarchy/defaultDirection'; }
        constructor(_editor, _contextKeyService, _storageService, _editorService, _instantiationService) {
            this._editor = _editor;
            this._contextKeyService = _contextKeyService;
            this._storageService = _storageService;
            this._editorService = _editorService;
            this._instantiationService = _instantiationService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._sessionDisposables = new lifecycle_1.DisposableStore();
            this._ctxHasProvider = _ctxHasTypeHierarchyProvider.bindTo(this._contextKeyService);
            this._ctxIsVisible = _ctxTypeHierarchyVisible.bindTo(this._contextKeyService);
            this._ctxDirection = _ctxTypeHierarchyDirection.bindTo(this._contextKeyService);
            this._disposables.add(event_1.Event.any(_editor.onDidChangeModel, _editor.onDidChangeModelLanguage, typeHierarchy_1.TypeHierarchyProviderRegistry.onDidChange)(() => {
                this._ctxHasProvider.set(_editor.hasModel() && typeHierarchy_1.TypeHierarchyProviderRegistry.has(_editor.getModel()));
            }));
            this._disposables.add(this._sessionDisposables);
        }
        dispose() {
            this._disposables.dispose();
        }
        // Peek
        async startTypeHierarchyFromEditor() {
            this._sessionDisposables.clear();
            if (!this._editor.hasModel()) {
                return;
            }
            const document = this._editor.getModel();
            const position = this._editor.getPosition();
            if (!typeHierarchy_1.TypeHierarchyProviderRegistry.has(document)) {
                return;
            }
            const cts = new cancellation_1.CancellationTokenSource();
            const model = typeHierarchy_1.TypeHierarchyModel.create(document, position, cts.token);
            const direction = sanitizedDirection(this._storageService.get(TypeHierarchyController_1._storageDirectionKey, 0 /* StorageScope.PROFILE */, "subtypes" /* TypeHierarchyDirection.Subtypes */));
            this._showTypeHierarchyWidget(position, direction, model, cts);
        }
        _showTypeHierarchyWidget(position, direction, model, cts) {
            this._ctxIsVisible.set(true);
            this._ctxDirection.set(direction);
            event_1.Event.any(this._editor.onDidChangeModel, this._editor.onDidChangeModelLanguage)(this.endTypeHierarchy, this, this._sessionDisposables);
            this._widget = this._instantiationService.createInstance(typeHierarchyPeek_1.TypeHierarchyTreePeekWidget, this._editor, position, direction);
            this._widget.showLoading();
            this._sessionDisposables.add(this._widget.onDidClose(() => {
                this.endTypeHierarchy();
                this._storageService.store(TypeHierarchyController_1._storageDirectionKey, this._widget.direction, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            }));
            this._sessionDisposables.add({ dispose() { cts.dispose(true); } });
            this._sessionDisposables.add(this._widget);
            model.then(model => {
                if (cts.token.isCancellationRequested) {
                    return; // nothing
                }
                if (model) {
                    this._sessionDisposables.add(model);
                    this._widget.showModel(model);
                }
                else {
                    this._widget.showMessage((0, nls_1.localize)('no.item', "No results"));
                }
            }).catch(err => {
                if ((0, errors_1.isCancellationError)(err)) {
                    this.endTypeHierarchy();
                    return;
                }
                this._widget.showMessage((0, nls_1.localize)('error', "Failed to show type hierarchy"));
            });
        }
        async startTypeHierarchyFromTypeHierarchy() {
            if (!this._widget) {
                return;
            }
            const model = this._widget.getModel();
            const typeItem = this._widget.getFocused();
            if (!typeItem || !model) {
                return;
            }
            const newEditor = await this._editorService.openCodeEditor({ resource: typeItem.item.uri }, this._editor);
            if (!newEditor) {
                return;
            }
            const newModel = model.fork(typeItem.item);
            this._sessionDisposables.clear();
            TypeHierarchyController_1.get(newEditor)?._showTypeHierarchyWidget(range_1.Range.lift(newModel.root.selectionRange).getStartPosition(), this._widget.direction, Promise.resolve(newModel), new cancellation_1.CancellationTokenSource());
        }
        showSupertypes() {
            this._widget?.updateDirection("supertypes" /* TypeHierarchyDirection.Supertypes */);
            this._ctxDirection.set("supertypes" /* TypeHierarchyDirection.Supertypes */);
        }
        showSubtypes() {
            this._widget?.updateDirection("subtypes" /* TypeHierarchyDirection.Subtypes */);
            this._ctxDirection.set("subtypes" /* TypeHierarchyDirection.Subtypes */);
        }
        endTypeHierarchy() {
            this._sessionDisposables.clear();
            this._ctxIsVisible.set(false);
            this._editor.focus();
        }
    };
    TypeHierarchyController = TypeHierarchyController_1 = __decorate([
        __param(1, contextkey_1.IContextKeyService),
        __param(2, storage_1.IStorageService),
        __param(3, codeEditorService_1.ICodeEditorService),
        __param(4, instantiation_1.IInstantiationService)
    ], TypeHierarchyController);
    (0, editorExtensions_1.registerEditorContribution)(TypeHierarchyController.Id, TypeHierarchyController, 0 /* EditorContributionInstantiation.Eager */); // eager because it needs to define a context key
    // Peek
    (0, actions_1.registerAction2)(class PeekTypeHierarchyAction extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'editor.showTypeHierarchy',
                title: { value: (0, nls_1.localize)('title', "Peek Type Hierarchy"), original: 'Peek Type Hierarchy' },
                menu: {
                    id: actions_1.MenuId.EditorContextPeek,
                    group: 'navigation',
                    order: 1000,
                    when: contextkey_1.ContextKeyExpr.and(_ctxHasTypeHierarchyProvider, peekView_1.PeekContext.notInPeekEditor),
                },
                precondition: contextkey_1.ContextKeyExpr.and(_ctxHasTypeHierarchyProvider, peekView_1.PeekContext.notInPeekEditor),
                f1: true
            });
        }
        async runEditorCommand(_accessor, editor) {
            return TypeHierarchyController.get(editor)?.startTypeHierarchyFromEditor();
        }
    });
    // actions for peek widget
    (0, actions_1.registerAction2)(class extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'editor.showSupertypes',
                title: { value: (0, nls_1.localize)('title.supertypes', "Show Supertypes"), original: 'Show Supertypes' },
                icon: codicons_1.Codicon.typeHierarchySuper,
                precondition: contextkey_1.ContextKeyExpr.and(_ctxTypeHierarchyVisible, _ctxTypeHierarchyDirection.isEqualTo("subtypes" /* TypeHierarchyDirection.Subtypes */)),
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 1024 /* KeyMod.Shift */ + 512 /* KeyMod.Alt */ + 38 /* KeyCode.KeyH */,
                },
                menu: {
                    id: typeHierarchyPeek_1.TypeHierarchyTreePeekWidget.TitleMenu,
                    when: _ctxTypeHierarchyDirection.isEqualTo("subtypes" /* TypeHierarchyDirection.Subtypes */),
                    order: 1,
                }
            });
        }
        runEditorCommand(_accessor, editor) {
            return TypeHierarchyController.get(editor)?.showSupertypes();
        }
    });
    (0, actions_1.registerAction2)(class extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'editor.showSubtypes',
                title: { value: (0, nls_1.localize)('title.subtypes', "Show Subtypes"), original: 'Show Subtypes' },
                icon: codicons_1.Codicon.typeHierarchySub,
                precondition: contextkey_1.ContextKeyExpr.and(_ctxTypeHierarchyVisible, _ctxTypeHierarchyDirection.isEqualTo("supertypes" /* TypeHierarchyDirection.Supertypes */)),
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 1024 /* KeyMod.Shift */ + 512 /* KeyMod.Alt */ + 38 /* KeyCode.KeyH */,
                },
                menu: {
                    id: typeHierarchyPeek_1.TypeHierarchyTreePeekWidget.TitleMenu,
                    when: _ctxTypeHierarchyDirection.isEqualTo("supertypes" /* TypeHierarchyDirection.Supertypes */),
                    order: 1,
                }
            });
        }
        runEditorCommand(_accessor, editor) {
            return TypeHierarchyController.get(editor)?.showSubtypes();
        }
    });
    (0, actions_1.registerAction2)(class extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'editor.refocusTypeHierarchy',
                title: { value: (0, nls_1.localize)('title.refocusTypeHierarchy', "Refocus Type Hierarchy"), original: 'Refocus Type Hierarchy' },
                precondition: _ctxTypeHierarchyVisible,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 1024 /* KeyMod.Shift */ + 3 /* KeyCode.Enter */
                }
            });
        }
        async runEditorCommand(_accessor, editor) {
            return TypeHierarchyController.get(editor)?.startTypeHierarchyFromTypeHierarchy();
        }
    });
    (0, actions_1.registerAction2)(class extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'editor.closeTypeHierarchy',
                title: (0, nls_1.localize)('close', 'Close'),
                icon: codicons_1.Codicon.close,
                precondition: _ctxTypeHierarchyVisible,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 10,
                    primary: 9 /* KeyCode.Escape */,
                    when: contextkey_1.ContextKeyExpr.not('config.editor.stablePeek')
                },
                menu: {
                    id: typeHierarchyPeek_1.TypeHierarchyTreePeekWidget.TitleMenu,
                    order: 1000
                }
            });
        }
        runEditorCommand(_accessor, editor) {
            return TypeHierarchyController.get(editor)?.endTypeHierarchy();
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZUhpZXJhcmNoeS5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90eXBlSGllcmFyY2h5L2Jyb3dzZXIvdHlwZUhpZXJhcmNoeS5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBeUJoRyxNQUFNLDRCQUE0QixHQUFHLElBQUksMEJBQWEsQ0FBVSxnQ0FBZ0MsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsZ0NBQWdDLEVBQUUsZ0RBQWdELENBQUMsQ0FBQyxDQUFDO0lBQ3ZNLE1BQU0sd0JBQXdCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLHNCQUFzQixFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxzQkFBc0IsRUFBRSxrREFBa0QsQ0FBQyxDQUFDLENBQUM7SUFDakwsTUFBTSwwQkFBMEIsR0FBRyxJQUFJLDBCQUFhLENBQVMsd0JBQXdCLEVBQUUsU0FBUyxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsd0JBQXdCLEVBQUUsc0RBQXNELENBQUMsRUFBRSxDQUFDLENBQUM7SUFFL04sU0FBUyxrQkFBa0IsQ0FBQyxTQUFpQjtRQUM1QyxPQUFPLFNBQVMscURBQW9DLElBQUksU0FBUyx5REFBc0M7WUFDdEcsQ0FBQyxDQUFDLFNBQVM7WUFDWCxDQUFDLGlEQUFnQyxDQUFDO0lBQ3BDLENBQUM7SUFFRCxJQUFNLHVCQUF1QixHQUE3QixNQUFNLHVCQUF1Qjs7aUJBQ1osT0FBRSxHQUFHLGVBQWUsQUFBbEIsQ0FBbUI7UUFFckMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFtQjtZQUM3QixPQUFPLE1BQU0sQ0FBQyxlQUFlLENBQTBCLHlCQUF1QixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3BGLENBQUM7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