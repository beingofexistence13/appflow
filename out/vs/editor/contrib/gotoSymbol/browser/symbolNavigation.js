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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/range", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/notification/common/notification"], function (require, exports, event_1, lifecycle_1, resources_1, editorExtensions_1, codeEditorService_1, range_1, nls_1, contextkey_1, extensions_1, instantiation_1, keybinding_1, keybindingsRegistry_1, notification_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ISymbolNavigationService = exports.ctxHasSymbols = void 0;
    exports.ctxHasSymbols = new contextkey_1.RawContextKey('hasSymbols', false, (0, nls_1.localize)('hasSymbols', "Whether there are symbol locations that can be navigated via keyboard-only."));
    exports.ISymbolNavigationService = (0, instantiation_1.createDecorator)('ISymbolNavigationService');
    let SymbolNavigationService = class SymbolNavigationService {
        constructor(contextKeyService, _editorService, _notificationService, _keybindingService) {
            this._editorService = _editorService;
            this._notificationService = _notificationService;
            this._keybindingService = _keybindingService;
            this._currentModel = undefined;
            this._currentIdx = -1;
            this._ignoreEditorChange = false;
            this._ctxHasSymbols = exports.ctxHasSymbols.bindTo(contextKeyService);
        }
        reset() {
            this._ctxHasSymbols.reset();
            this._currentState?.dispose();
            this._currentMessage?.dispose();
            this._currentModel = undefined;
            this._currentIdx = -1;
        }
        put(anchor) {
            const refModel = anchor.parent.parent;
            if (refModel.references.length <= 1) {
                this.reset();
                return;
            }
            this._currentModel = refModel;
            this._currentIdx = refModel.references.indexOf(anchor);
            this._ctxHasSymbols.set(true);
            this._showMessage();
            const editorState = new EditorState(this._editorService);
            const listener = editorState.onDidChange(_ => {
                if (this._ignoreEditorChange) {
                    return;
                }
                const editor = this._editorService.getActiveCodeEditor();
                if (!editor) {
                    return;
                }
                const model = editor.getModel();
                const position = editor.getPosition();
                if (!model || !position) {
                    return;
                }
                let seenUri = false;
                let seenPosition = false;
                for (const reference of refModel.references) {
                    if ((0, resources_1.isEqual)(reference.uri, model.uri)) {
                        seenUri = true;
                        seenPosition = seenPosition || range_1.Range.containsPosition(reference.range, position);
                    }
                    else if (seenUri) {
                        break;
                    }
                }
                if (!seenUri || !seenPosition) {
                    this.reset();
                }
            });
            this._currentState = (0, lifecycle_1.combinedDisposable)(editorState, listener);
        }
        revealNext(source) {
            if (!this._currentModel) {
                return Promise.resolve();
            }
            // get next result and advance
            this._currentIdx += 1;
            this._currentIdx %= this._currentModel.references.length;
            const reference = this._currentModel.references[this._currentIdx];
            // status
            this._showMessage();
            // open editor, ignore events while that happens
            this._ignoreEditorChange = true;
            return this._editorService.openCodeEditor({
                resource: reference.uri,
                options: {
                    selection: range_1.Range.collapseToStart(reference.range),
                    selectionRevealType: 3 /* TextEditorSelectionRevealType.NearTopIfOutsideViewport */
                }
            }, source).finally(() => {
                this._ignoreEditorChange = false;
            });
        }
        _showMessage() {
            this._currentMessage?.dispose();
            const kb = this._keybindingService.lookupKeybinding('editor.gotoNextSymbolFromResult');
            const message = kb
                ? (0, nls_1.localize)('location.kb', "Symbol {0} of {1}, {2} for next", this._currentIdx + 1, this._currentModel.references.length, kb.getLabel())
                : (0, nls_1.localize)('location', "Symbol {0} of {1}", this._currentIdx + 1, this._currentModel.references.length);
            this._currentMessage = this._notificationService.status(message);
        }
    };
    SymbolNavigationService = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, codeEditorService_1.ICodeEditorService),
        __param(2, notification_1.INotificationService),
        __param(3, keybinding_1.IKeybindingService)
    ], SymbolNavigationService);
    (0, extensions_1.registerSingleton)(exports.ISymbolNavigationService, SymbolNavigationService, 1 /* InstantiationType.Delayed */);
    (0, editorExtensions_1.registerEditorCommand)(new class extends editorExtensions_1.EditorCommand {
        constructor() {
            super({
                id: 'editor.gotoNextSymbolFromResult',
                precondition: exports.ctxHasSymbols,
                kbOpts: {
                    weight: 100 /* KeybindingWeight.EditorContrib */,
                    primary: 70 /* KeyCode.F12 */
                }
            });
        }
        runEditorCommand(accessor, editor) {
            return accessor.get(exports.ISymbolNavigationService).revealNext(editor);
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'editor.gotoNextSymbolFromResult.cancel',
        weight: 100 /* KeybindingWeight.EditorContrib */,
        when: exports.ctxHasSymbols,
        primary: 9 /* KeyCode.Escape */,
        handler(accessor) {
            accessor.get(exports.ISymbolNavigationService).reset();
        }
    });
    //
    let EditorState = class EditorState {
        constructor(editorService) {
            this._listener = new Map();
            this._disposables = new lifecycle_1.DisposableStore();
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._disposables.add(editorService.onCodeEditorRemove(this._onDidRemoveEditor, this));
            this._disposables.add(editorService.onCodeEditorAdd(this._onDidAddEditor, this));
            editorService.listCodeEditors().forEach(this._onDidAddEditor, this);
        }
        dispose() {
            this._disposables.dispose();
            this._onDidChange.dispose();
            (0, lifecycle_1.dispose)(this._listener.values());
        }
        _onDidAddEditor(editor) {
            this._listener.set(editor, (0, lifecycle_1.combinedDisposable)(editor.onDidChangeCursorPosition(_ => this._onDidChange.fire({ editor })), editor.onDidChangeModelContent(_ => this._onDidChange.fire({ editor }))));
        }
        _onDidRemoveEditor(editor) {
            this._listener.get(editor)?.dispose();
            this._listener.delete(editor);
        }
    };
    EditorState = __decorate([
        __param(0, codeEditorService_1.ICodeEditorService)
    ], EditorState);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ltYm9sTmF2aWdhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2dvdG9TeW1ib2wvYnJvd3Nlci9zeW1ib2xOYXZpZ2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQW9CbkYsUUFBQSxhQUFhLEdBQUcsSUFBSSwwQkFBYSxDQUFDLFlBQVksRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsWUFBWSxFQUFFLDZFQUE2RSxDQUFDLENBQUMsQ0FBQztJQUU5SixRQUFBLHdCQUF3QixHQUFHLElBQUEsK0JBQWUsRUFBMkIsMEJBQTBCLENBQUMsQ0FBQztJQVM5RyxJQUFNLHVCQUF1QixHQUE3QixNQUFNLHVCQUF1QjtRQVk1QixZQUNxQixpQkFBcUMsRUFDckMsY0FBbUQsRUFDakQsb0JBQTJELEVBQzdELGtCQUF1RDtZQUZ0QyxtQkFBYyxHQUFkLGNBQWMsQ0FBb0I7WUFDaEMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtZQUM1Qyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBVnBFLGtCQUFhLEdBQXFCLFNBQVMsQ0FBQztZQUM1QyxnQkFBVyxHQUFXLENBQUMsQ0FBQyxDQUFDO1lBR3pCLHdCQUFtQixHQUFZLEtBQUssQ0FBQztZQVE1QyxJQUFJLENBQUMsY0FBYyxHQUFHLHFCQUFhLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDL0QsQ0FBQztRQUVELEtBQUs7WUFDSixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQzVCLElBQUksQ0FBQyxhQUFhLEVBQUUsT0FBTyxFQUFFLENBQUM7WUFDOUIsSUFBSSxDQUFDLGVBQWUsRUFBRSxPQUFPLEVBQUUsQ0FBQztZQUNoQyxJQUFJLENBQUMsYUFBYSxHQUFHLFNBQVMsQ0FBQztZQUMvQixJQUFJLENB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