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
define(["require", "exports", "vs/nls", "vs/workbench/contrib/callHierarchy/common/callHierarchy", "vs/base/common/cancellation", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/callHierarchy/browser/callHierarchyPeek", "vs/base/common/event", "vs/editor/browser/editorExtensions", "vs/platform/contextkey/common/contextkey", "vs/base/common/lifecycle", "vs/editor/common/editorContextKeys", "vs/editor/contrib/peekView/browser/peekView", "vs/platform/storage/common/storage", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/range", "vs/platform/actions/common/actions", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/base/common/errors"], function (require, exports, nls_1, callHierarchy_1, cancellation_1, instantiation_1, callHierarchyPeek_1, event_1, editorExtensions_1, contextkey_1, lifecycle_1, editorContextKeys_1, peekView_1, storage_1, codeEditorService_1, range_1, actions_1, codicons_1, iconRegistry_1, errors_1) {
    "use strict";
    var CallHierarchyController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    const _ctxHasCallHierarchyProvider = new contextkey_1.RawContextKey('editorHasCallHierarchyProvider', false, (0, nls_1.localize)('editorHasCallHierarchyProvider', 'Whether a call hierarchy provider is available'));
    const _ctxCallHierarchyVisible = new contextkey_1.RawContextKey('callHierarchyVisible', false, (0, nls_1.localize)('callHierarchyVisible', 'Whether call hierarchy peek is currently showing'));
    const _ctxCallHierarchyDirection = new contextkey_1.RawContextKey('callHierarchyDirection', undefined, { type: 'string', description: (0, nls_1.localize)('callHierarchyDirection', 'Whether call hierarchy shows incoming or outgoing calls') });
    function sanitizedDirection(candidate) {
        return candidate === "outgoingCalls" /* CallHierarchyDirection.CallsFrom */ || candidate === "incomingCalls" /* CallHierarchyDirection.CallsTo */
            ? candidate
            : "incomingCalls" /* CallHierarchyDirection.CallsTo */;
    }
    let CallHierarchyController = class CallHierarchyController {
        static { CallHierarchyController_1 = this; }
        static { this.Id = 'callHierarchy'; }
        static get(editor) {
            return editor.getContribution(CallHierarchyController_1.Id);
        }
        static { this._StorageDirection = 'callHierarchy/defaultDirection'; }
        constructor(_editor, _contextKeyService, _storageService, _editorService, _instantiationService) {
            this._editor = _editor;
            this._contextKeyService = _contextKeyService;
            this._storageService = _storageService;
            this._editorService = _editorService;
            this._instantiationService = _instantiationService;
            this._dispoables = new lifecycle_1.DisposableStore();
            this._sessionDisposables = new lifecycle_1.DisposableStore();
            this._ctxIsVisible = _ctxCallHierarchyVisible.bindTo(this._contextKeyService);
            this._ctxHasProvider = _ctxHasCallHierarchyProvider.bindTo(this._contextKeyService);
            this._ctxDirection = _ctxCallHierarchyDirection.bindTo(this._contextKeyService);
            this._dispoables.add(event_1.Event.any(_editor.onDidChangeModel, _editor.onDidChangeModelLanguage, callHierarchy_1.CallHierarchyProviderRegistry.onDidChange)(() => {
                this._ctxHasProvider.set(_editor.hasModel() && callHierarchy_1.CallHierarchyProviderRegistry.has(_editor.getModel()));
            }));
            this._dispoables.add(this._sessionDisposables);
        }
        dispose() {
            this._ctxHasProvider.reset();
            this._ctxIsVisible.reset();
            this._dispoables.dispose();
        }
        async startCallHierarchyFromEditor() {
            this._sessionDisposables.clear();
            if (!this._editor.hasModel()) {
                return;
            }
            const document = this._editor.getModel();
            const position = this._editor.getPosition();
            if (!callHierarchy_1.CallHierarchyProviderRegistry.has(document)) {
                return;
            }
            const cts = new cancellation_1.CancellationTokenSource();
            const model = callHierarchy_1.CallHierarchyModel.create(document, position, cts.token);
            const direction = sanitizedDirection(this._storageService.get(CallHierarchyController_1._StorageDirection, 0 /* StorageScope.PROFILE */, "incomingCalls" /* CallHierarchyDirection.CallsTo */));
            this._showCallHierarchyWidget(position, direction, model, cts);
        }
        async startCallHierarchyFromCallHierarchy() {
            if (!this._widget) {
                return;
            }
            const model = this._widget.getModel();
            const call = this._widget.getFocused();
            if (!call || !model) {
                return;
            }
            const newEditor = await this._editorService.openCodeEditor({ resource: call.item.uri }, this._editor);
            if (!newEditor) {
                return;
            }
            const newModel = model.fork(call.item);
            this._sessionDisposables.clear();
            CallHierarchyController_1.get(newEditor)?._showCallHierarchyWidget(range_1.Range.lift(newModel.root.selectionRange).getStartPosition(), this._widget.direction, Promise.resolve(newModel), new cancellation_1.CancellationTokenSource());
        }
        _showCallHierarchyWidget(position, direction, model, cts) {
            this._ctxIsVisible.set(true);
            this._ctxDirection.set(direction);
            event_1.Event.any(this._editor.onDidChangeModel, this._editor.onDidChangeModelLanguage)(this.endCallHierarchy, this, this._sessionDisposables);
            this._widget = this._instantiationService.createInstance(callHierarchyPeek_1.CallHierarchyTreePeekWidget, this._editor, position, direction);
            this._widget.showLoading();
            this._sessionDisposables.add(this._widget.onDidClose(() => {
                this.endCallHierarchy();
                this._storageService.store(CallHierarchyController_1._StorageDirection, this._widget.direction, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
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
                    this.endCallHierarchy();
                    return;
                }
                this._widget.showMessage((0, nls_1.localize)('error', "Failed to show call hierarchy"));
            });
        }
        showOutgoingCalls() {
            this._widget?.updateDirection("outgoingCalls" /* CallHierarchyDirection.CallsFrom */);
            this._ctxDirection.set("outgoingCalls" /* CallHierarchyDirection.CallsFrom */);
        }
        showIncomingCalls() {
            this._widget?.updateDirection("incomingCalls" /* CallHierarchyDirection.CallsTo */);
            this._ctxDirection.set("incomingCalls" /* CallHierarchyDirection.CallsTo */);
        }
        endCallHierarchy() {
            this._sessionDisposables.clear();
            this._ctxIsVisible.set(false);
            this._editor.focus();
        }
    };
    CallHierarchyController = CallHierarchyController_1 = __decorate([
        __param(1, contextkey_1.IContextKeyService),
        __param(2, storage_1.IStorageService),
        __param(3, codeEditorService_1.ICodeEditorService),
        __param(4, instantiation_1.IInstantiationService)
    ], CallHierarchyController);
    (0, editorExtensions_1.registerEditorContribution)(CallHierarchyController.Id, CallHierarchyController, 0 /* EditorContributionInstantiation.Eager */); // eager because it needs to define a context key
    (0, actions_1.registerAction2)(class PeekCallHierarchyAction extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'editor.showCallHierarchy',
                title: { value: (0, nls_1.localize)('title', "Peek Call Hierarchy"), original: 'Peek Call Hierarchy' },
                menu: {
                    id: actions_1.MenuId.EditorContextPeek,
                    group: 'navigation',
                    order: 1000,
                    when: contextkey_1.ContextKeyExpr.and(_ctxHasCallHierarchyProvider, peekView_1.PeekContext.notInPeekEditor),
                },
                keybinding: {
                    when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 1024 /* KeyMod.Shift */ + 512 /* KeyMod.Alt */ + 38 /* KeyCode.KeyH */
                },
                precondition: contextkey_1.ContextKeyExpr.and(_ctxHasCallHierarchyProvider, peekView_1.PeekContext.notInPeekEditor),
                f1: true
            });
        }
        async runEditorCommand(_accessor, editor) {
            return CallHierarchyController.get(editor)?.startCallHierarchyFromEditor();
        }
    });
    (0, actions_1.registerAction2)(class extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'editor.showIncomingCalls',
                title: { value: (0, nls_1.localize)('title.incoming', "Show Incoming Calls"), original: 'Show Incoming Calls' },
                icon: (0, iconRegistry_1.registerIcon)('callhierarchy-incoming', codicons_1.Codicon.callIncoming, (0, nls_1.localize)('showIncomingCallsIcons', 'Icon for incoming calls in the call hierarchy view.')),
                precondition: contextkey_1.ContextKeyExpr.and(_ctxCallHierarchyVisible, _ctxCallHierarchyDirection.isEqualTo("outgoingCalls" /* CallHierarchyDirection.CallsFrom */)),
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 1024 /* KeyMod.Shift */ + 512 /* KeyMod.Alt */ + 38 /* KeyCode.KeyH */,
                },
                menu: {
                    id: callHierarchyPeek_1.CallHierarchyTreePeekWidget.TitleMenu,
                    when: _ctxCallHierarchyDirection.isEqualTo("outgoingCalls" /* CallHierarchyDirection.CallsFrom */),
                    order: 1,
                }
            });
        }
        runEditorCommand(_accessor, editor) {
            return CallHierarchyController.get(editor)?.showIncomingCalls();
        }
    });
    (0, actions_1.registerAction2)(class extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'editor.showOutgoingCalls',
                title: { value: (0, nls_1.localize)('title.outgoing', "Show Outgoing Calls"), original: 'Show Outgoing Calls' },
                icon: (0, iconRegistry_1.registerIcon)('callhierarchy-outgoing', codicons_1.Codicon.callOutgoing, (0, nls_1.localize)('showOutgoingCallsIcon', 'Icon for outgoing calls in the call hierarchy view.')),
                precondition: contextkey_1.ContextKeyExpr.and(_ctxCallHierarchyVisible, _ctxCallHierarchyDirection.isEqualTo("incomingCalls" /* CallHierarchyDirection.CallsTo */)),
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 1024 /* KeyMod.Shift */ + 512 /* KeyMod.Alt */ + 38 /* KeyCode.KeyH */,
                },
                menu: {
                    id: callHierarchyPeek_1.CallHierarchyTreePeekWidget.TitleMenu,
                    when: _ctxCallHierarchyDirection.isEqualTo("incomingCalls" /* CallHierarchyDirection.CallsTo */),
                    order: 1
                }
            });
        }
        runEditorCommand(_accessor, editor) {
            return CallHierarchyController.get(editor)?.showOutgoingCalls();
        }
    });
    (0, actions_1.registerAction2)(class extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'editor.refocusCallHierarchy',
                title: { value: (0, nls_1.localize)('title.refocus', "Refocus Call Hierarchy"), original: 'Refocus Call Hierarchy' },
                precondition: _ctxCallHierarchyVisible,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 1024 /* KeyMod.Shift */ + 3 /* KeyCode.Enter */
                }
            });
        }
        async runEditorCommand(_accessor, editor) {
            return CallHierarchyController.get(editor)?.startCallHierarchyFromCallHierarchy();
        }
    });
    (0, actions_1.registerAction2)(class extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'editor.closeCallHierarchy',
                title: (0, nls_1.localize)('close', 'Close'),
                icon: codicons_1.Codicon.close,
                precondition: _ctxCallHierarchyVisible,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 10,
                    primary: 9 /* KeyCode.Escape */,
                    when: contextkey_1.ContextKeyExpr.not('config.editor.stablePeek')
                },
                menu: {
                    id: callHierarchyPeek_1.CallHierarchyTreePeekWidget.TitleMenu,
                    order: 1000
                }
            });
        }
        runEditorCommand(_accessor, editor) {
            return CallHierarchyController.get(editor)?.endCallHierarchy();
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsbEhpZXJhcmNoeS5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jYWxsSGllcmFyY2h5L2Jyb3dzZXIvY2FsbEhpZXJhcmNoeS5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBMEJoRyxNQUFNLDRCQUE0QixHQUFHLElBQUksMEJBQWEsQ0FBVSxnQ0FBZ0MsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsZ0NBQWdDLEVBQUUsZ0RBQWdELENBQUMsQ0FBQyxDQUFDO0lBQ3ZNLE1BQU0sd0JBQXdCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLHNCQUFzQixFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxzQkFBc0IsRUFBRSxrREFBa0QsQ0FBQyxDQUFDLENBQUM7SUFDakwsTUFBTSwwQkFBMEIsR0FBRyxJQUFJLDBCQUFhLENBQVMsd0JBQXdCLEVBQUUsU0FBUyxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsd0JBQXdCLEVBQUUseURBQXlELENBQUMsRUFBRSxDQUFDLENBQUM7SUFFbE8sU0FBUyxrQkFBa0IsQ0FBQyxTQUFpQjtRQUM1QyxPQUFPLFNBQVMsMkRBQXFDLElBQUksU0FBUyx5REFBbUM7WUFDcEcsQ0FBQyxDQUFDLFNBQVM7WUFDWCxDQUFDLHFEQUErQixDQUFDO0lBQ25DLENBQUM7SUFFRCxJQUFNLHVCQUF1QixHQUE3QixNQUFNLHVCQUF1Qjs7aUJBRVosT0FBRSxHQUFHLGVBQWUsQUFBbEIsQ0FBbUI7UUFFckMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFtQjtZQUM3QixPQUFPLE1BQU0sQ0FBQyxlQUFlLENBQTBCLHlCQUF1QixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3BGLENBQUM7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