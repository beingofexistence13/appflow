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
    var $qrb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$srb = exports.$rrb = exports.$qrb = void 0;
    let $qrb = class $qrb extends lifecycle_1.$kc {
        static { $qrb_1 = this; }
        constructor(g) {
            super();
            this.g = g;
            this.a = this.B(new event_1.$fd());
            this.onHighlightRemoved = this.a.event;
            this.b = null;
            this.c = null;
            this.f = this.B(new lifecycle_1.$jc());
        }
        removeHighlightRange() {
            if (this.c && this.b) {
                const decorationId = this.b;
                this.c.changeDecorations((accessor) => {
                    accessor.removeDecoration(decorationId);
                });
                this.a.fire();
            }
            this.b = null;
        }
        highlightRange(range, editor) {
            editor = editor ?? this.j(range);
            if ((0, editorBrowser_1.$iV)(editor)) {
                this.h(editor, range);
            }
            else if ((0, editorBrowser_1.$kV)(editor) && (0, editorBrowser_1.$iV)(editor.activeCodeEditor)) {
                this.h(editor.activeCodeEditor, range);
            }
        }
        h(editor, selectionRange) {
            this.removeHighlightRange();
            editor.changeDecorations((changeAccessor) => {
                this.b = changeAccessor.addDecoration(selectionRange.range, this.s(selectionRange.isWholeLine));
            });
            this.m(editor);
        }
        j(resourceRange) {
            const resource = this.g.activeEditor?.resource;
            if (resource && (0, resources_1.$bg)(resource, resourceRange.resource) && (0, editorBrowser_1.$iV)(this.g.activeTextEditorControl)) {
                return this.g.activeTextEditorControl;
            }
            return undefined;
        }
        m(editor) {
            if (this.c !== editor) {
                this.f.clear();
                this.c = editor;
                this.f.add(this.c.onDidChangeCursorPosition((e) => {
                    if (e.reason === 0 /* CursorChangeReason.NotSet */
                        || e.reason === 3 /* CursorChangeReason.Explicit */
                        || e.reason === 5 /* CursorChangeReason.Undo */
                        || e.reason === 6 /* CursorChangeReason.Redo */) {
                        this.removeHighlightRange();
                    }
                }));
                this.f.add(this.c.onDidChangeModel(() => { this.removeHighlightRange(); }));
                this.f.add(this.c.onDidDispose(() => {
                    this.removeHighlightRange();
                    this.c = null;
                }));
            }
        }
        static { this.n = textModel_1.$RC.register({
            description: 'codeeditor-range-highlight-whole',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            className: 'rangeHighlight',
            isWholeLine: true
        }); }
        static { this.r = textModel_1.$RC.register({
            description: 'codeeditor-range-highlight',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            className: 'rangeHighlight'
        }); }
        s(isWholeLine = true) {
            return (isWholeLine ? $qrb_1.n : $qrb_1.r);
        }
        dispose() {
            super.dispose();
            if (this.c?.getModel()) {
                this.removeHighlightRange();
                this.c = null;
            }
        }
    };
    exports.$qrb = $qrb;
    exports.$qrb = $qrb = $qrb_1 = __decorate([
        __param(0, editorService_1.$9C)
    ], $qrb);
    let $rrb = class $rrb extends floatingMenu_1.$nrb {
        constructor(g, label, keyBindingAction, keybindingService) {
            super(keyBindingAction && keybindingService.lookupKeybinding(keyBindingAction)
                ? `${label} (${keybindingService.lookupKeybinding(keyBindingAction).getLabel()})`
                : label);
            this.g = g;
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
            this.g.addOverlayWidget(this);
        }
        dispose() {
            this.g.removeOverlayWidget(this);
            super.dispose();
        }
    };
    exports.$rrb = $rrb;
    exports.$rrb = $rrb = __decorate([
        __param(3, keybinding_1.$2D)
    ], $rrb);
    let $srb = class $srb extends floatingMenu_1.$orb {
        static { this.ID = 'editor.contrib.floatingClickMenu'; }
        constructor(m, n, menuService, contextKeyService) {
            super(actions_1.$Ru.EditorContent, menuService, contextKeyService);
            this.m = m;
            this.n = n;
            this.f();
        }
        g(action) {
            return this.n.createInstance($rrb, this.m, action.label, action.id);
        }
        j() {
            return !(this.m instanceof embeddedCodeEditorWidget_1.$w3) && this.m?.hasModel() && !this.m.getOption(61 /* EditorOption.inDiffEditor */);
        }
        h() {
            return this.m.getModel()?.uri;
        }
    };
    exports.$srb = $srb;
    exports.$srb = $srb = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, actions_1.$Su),
        __param(3, contextkey_1.$3i)
    ], $srb);
});
//# sourceMappingURL=codeeditor.js.map