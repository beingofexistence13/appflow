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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/editor/browser/editorBrowser", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/editor/common/model/textModel", "vs/platform/actions/browser/floatingMenu", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/workbench/services/editor/common/editorService"], function (require, exports, event_1, lifecycle_1, resources_1, editorBrowser_1, embeddedCodeEditorWidget_1, textModel_1, floatingMenu_1, actions_1, contextkey_1, instantiation_1, keybinding_1, editorService_1) {
    "use strict";
    var RangeHighlightDecorations_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FloatingEditorClickMenu = exports.FloatingEditorClickWidget = exports.RangeHighlightDecorations = void 0;
    let RangeHighlightDecorations = class RangeHighlightDecorations extends lifecycle_1.Disposable {
        static { RangeHighlightDecorations_1 = this; }
        constructor(editorService) {
            super();
            this.editorService = editorService;
            this._onHighlightRemoved = this._register(new event_1.Emitter());
            this.onHighlightRemoved = this._onHighlightRemoved.event;
            this.rangeHighlightDecorationId = null;
            this.editor = null;
            this.editorDisposables = this._register(new lifecycle_1.DisposableStore());
        }
        removeHighlightRange() {
            if (this.editor && this.rangeHighlightDecorationId) {
                const decorationId = this.rangeHighlightDecorationId;
                this.editor.changeDecorations((accessor) => {
                    accessor.removeDecoration(decorationId);
                });
                this._onHighlightRemoved.fire();
            }
            this.rangeHighlightDecorationId = null;
        }
        highlightRange(range, editor) {
            editor = editor ?? this.getEditor(range);
            if ((0, editorBrowser_1.isCodeEditor)(editor)) {
                this.doHighlightRange(editor, range);
            }
            else if ((0, editorBrowser_1.isCompositeEditor)(editor) && (0, editorBrowser_1.isCodeEditor)(editor.activeCodeEditor)) {
                this.doHighlightRange(editor.activeCodeEditor, range);
            }
        }
        doHighlightRange(editor, selectionRange) {
            this.removeHighlightRange();
            editor.changeDecorations((changeAccessor) => {
                this.rangeHighlightDecorationId = changeAccessor.addDecoration(selectionRange.range, this.createRangeHighlightDecoration(selectionRange.isWholeLine));
            });
            this.setEditor(editor);
        }
        getEditor(resourceRange) {
            const resource = this.editorService.activeEditor?.resource;
            if (resource && (0, resources_1.isEqual)(resource, resourceRange.resource) && (0, editorBrowser_1.isCodeEditor)(this.editorService.activeTextEditorControl)) {
                return this.editorService.activeTextEditorControl;
            }
            return undefined;
        }
        setEditor(editor) {
            if (this.editor !== editor) {
                this.editorDisposables.clear();
                this.editor = editor;
                this.editorDisposables.add(this.editor.onDidChangeCursorPosition((e) => {
                    if (e.reason === 0 /* CursorChangeReason.NotSet */
                        || e.reason === 3 /* CursorChangeReason.Explicit */
                        || e.reason === 5 /* CursorChangeReason.Undo */
                        || e.reason === 6 /* CursorChangeReason.Redo */) {
                        this.removeHighlightRange();
                    }
                }));
                this.editorDisposables.add(this.editor.onDidChangeModel(() => { this.removeHighlightRange(); }));
                this.editorDisposables.add(this.editor.onDidDispose(() => {
                    this.removeHighlightRange();
                    this.editor = null;
                }));
            }
        }
        static { this._WHOLE_LINE_RANGE_HIGHLIGHT = textModel_1.ModelDecorationOptions.register({
            description: 'codeeditor-range-highlight-whole',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            className: 'rangeHighlight',
            isWholeLine: true
        }); }
        static { this._RANGE_HIGHLIGHT = textModel_1.ModelDecorationOptions.register({
            description: 'codeeditor-range-highlight',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            className: 'rangeHighlight'
        }); }
        createRangeHighlightDecoration(isWholeLine = true) {
            return (isWholeLine ? RangeHighlightDecorations_1._WHOLE_LINE_RANGE_HIGHLIGHT : RangeHighlightDecorations_1._RANGE_HIGHLIGHT);
        }
        dispose() {
            super.dispose();
            if (this.editor?.getModel()) {
                this.removeHighlightRange();
                this.editor = null;
            }
        }
    };
    exports.RangeHighlightDecorations = RangeHighlightDecorations;
    exports.RangeHighlightDecorations = RangeHighlightDecorations = RangeHighlightDecorations_1 = __decorate([
        __param(0, editorService_1.IEditorService)
    ], RangeHighlightDecorations);
    let FloatingEditorClickWidget = class FloatingEditorClickWidget extends floatingMenu_1.FloatingClickWidget {
        constructor(editor, label, keyBindingAction, keybindingService) {
            super(keyBindingAction && keybindingService.lookupKeybinding(keyBindingAction)
                ? `${label} (${keybindingService.lookupKeybinding(keyBindingAction).getLabel()})`
                : label);
            this.editor = editor;
        }
        getId() {
            return 'editor.overlayWidget.floatingClickWidget';
        }
        getPosition() {
            return {
                preference: 1 /* OverlayWidgetPositionPreference.BOTTOM_RIGHT_CORNER */
            };
        }
        render() {
            super.render();
            this.editor.addOverlayWidget(this);
        }
        dispose() {
            this.editor.removeOverlayWidget(this);
            super.dispose();
        }
    };
    exports.FloatingEditorClickWidget = FloatingEditorClickWidget;
    exports.FloatingEditorClickWidget = FloatingEditorClickWidget = __decorate([
        __param(3, keybinding_1.IKeybindingService)
    ], FloatingEditorClickWidget);
    let FloatingEditorClickMenu = class FloatingEditorClickMenu extends floatingMenu_1.AbstractFloatingClickMenu {
        static { this.ID = 'editor.contrib.floatingClickMenu'; }
        constructor(editor, instantiationService, menuService, contextKeyService) {
            super(actions_1.MenuId.EditorContent, menuService, contextKeyService);
            this.editor = editor;
            this.instantiationService = instantiationService;
            this.render();
        }
        createWidget(action) {
            return this.instantiationService.createInstance(FloatingEditorClickWidget, this.editor, action.label, action.id);
        }
        isVisible() {
            return !(this.editor instanceof embeddedCodeEditorWidget_1.EmbeddedCodeEditorWidget) && this.editor?.hasModel() && !this.editor.getOption(61 /* EditorOption.inDiffEditor */);
        }
        getActionArg() {
            return this.editor.getModel()?.uri;
        }
    };
    exports.FloatingEditorClickMenu = FloatingEditorClickMenu;
    exports.FloatingEditorClickMenu = FloatingEditorClickMenu = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, actions_1.IMenuService),
        __param(3, contextkey_1.IContextKeyService)
    ], FloatingEditorClickMenu);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZWVkaXRvci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL2NvZGVlZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQTRCekYsSUFBTSx5QkFBeUIsR0FBL0IsTUFBTSx5QkFBMEIsU0FBUSxzQkFBVTs7UUFTeEQsWUFBNEIsYUFBOEM7WUFDekUsS0FBSyxFQUFFLENBQUM7WUFEb0Msa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBUHpELHdCQUFtQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQ2xFLHVCQUFrQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUM7WUFFckQsK0JBQTBCLEdBQWtCLElBQUksQ0FBQztZQUNqRCxXQUFNLEdBQXVCLElBQUksQ0FBQztZQUN6QixzQkFBaUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMkJBQWUsRUFBRSxDQUFDLENBQUM7UUFJM0UsQ0FBQztRQUVELG9CQUFvQjtZQUNuQixJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLDBCQUEwQixFQUFFO2dCQUNuRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUM7Z0JBQ3JELElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtvQkFDMUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUN6QyxDQUFDLENBQUMsQ0FBQztnQkFDSCxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLENBQUM7YUFDaEM7WUFFRCxJQUFJLENBQUMsMEJBQTBCLEdBQUcsSUFBSSxDQUFDO1FBQ3hDLENBQUM7UUFFRCxjQUFjLENBQUMsS0FBZ0MsRUFBRSxN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