var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/browser/widget/diffEditor/overviewRulerPart", "vs/editor/common/config/editorOptions", "vs/nls!vs/editor/browser/widget/diffEditor/diffEditorEditors", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding"], function (require, exports, event_1, lifecycle_1, observable_1, overviewRulerPart_1, editorOptions_1, nls_1, instantiation_1, keybinding_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$rZ = void 0;
    let $rZ = class $rZ extends lifecycle_1.$kc {
        get onDidContentSizeChange() { return this.a.event; }
        constructor(b, c, f, codeEditorWidgetOptions, g, h, j) {
            super();
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.a = this.B(new event_1.$fd());
            this.original = this.B(this.m(f.editorOptions.get(), codeEditorWidgetOptions.originalEditor || {}));
            this.modified = this.B(this.n(f.editorOptions.get(), codeEditorWidgetOptions.modifiedEditor || {}));
            this.modifiedModel = (0, observable_1.observableFromEvent)(this.modified.onDidChangeModel, () => this.modified.getModel());
            this.B((0, observable_1.autorunHandleChanges)({
                createEmptyChangeSummary: () => ({}),
                handleChange: (ctx, changeSummary) => {
                    if (ctx.didChange(f.editorOptions)) {
                        Object.assign(changeSummary, ctx.change.changedOptions);
                    }
                    return true;
                }
            }, (reader, changeSummary) => {
                /** @description update editor options */
                f.editorOptions.read(reader);
                this.f.renderSideBySide.read(reader);
                this.modified.updateOptions(this.t(reader, changeSummary));
                this.original.updateOptions(this.s(reader, changeSummary));
            }));
        }
        m(options, codeEditorWidgetOptions) {
            const leftHandSideOptions = this.s(undefined, options);
            const editor = this.r(this.h, this.b, leftHandSideOptions, codeEditorWidgetOptions);
            editor.setContextValue('isInDiffLeftEditor', true);
            return editor;
        }
        n(options, codeEditorWidgetOptions) {
            const rightHandSideOptions = this.t(undefined, options);
            const editor = this.r(this.h, this.c, rightHandSideOptions, codeEditorWidgetOptions);
            editor.setContextValue('isInDiffRightEditor', true);
            return editor;
        }
        r(instantiationService, container, options, editorWidgetOptions) {
            const editor = this.g(instantiationService, container, options, editorWidgetOptions);
            this.B(editor.onDidContentSizeChange(e => {
                const width = this.original.getContentWidth() + this.modified.getContentWidth() + overviewRulerPart_1.$qZ.ENTIRE_DIFF_OVERVIEW_WIDTH;
                const height = Math.max(this.modified.getContentHeight(), this.original.getContentHeight());
                this.a.fire({
                    contentHeight: height,
                    contentWidth: width,
                    contentHeightChanged: e.contentHeightChanged,
                    contentWidthChanged: e.contentWidthChanged
                });
            }));
            return editor;
        }
        s(_reader, changedOptions) {
            const result = this.u(changedOptions);
            if (!this.f.renderSideBySide.get()) {
                // never wrap hidden editor
                result.wordWrapOverride1 = 'off';
                result.wordWrapOverride2 = 'off';
                result.stickyScroll = { enabled: false };
                // Disable unicode highlighting for the original side in inline mode, as they are not shown anyway.
                result.unicodeHighlight = { nonBasicASCII: false, ambiguousCharacters: false, invisibleCharacters: false };
            }
            else {
                result.unicodeHighlight = this.f.editorOptions.get().unicodeHighlight || {};
                result.wordWrapOverride1 = this.f.diffWordWrap.get();
            }
            if (changedOptions.originalAriaLabel) {
                result.ariaLabel = changedOptions.originalAriaLabel;
            }
            result.ariaLabel = this.w(result.ariaLabel);
            result.readOnly = !this.f.originalEditable.get();
            result.dropIntoEditor = { enabled: !result.readOnly };
            result.extraEditorClassName = 'original-in-monaco-diff-editor';
            return result;
        }
        t(reader, changedOptions) {
            const result = this.u(changedOptions);
            if (changedOptions.modifiedAriaLabel) {
                result.ariaLabel = changedOptions.modifiedAriaLabel;
            }
            result.ariaLabel = this.w(result.ariaLabel);
            result.wordWrapOverride1 = this.f.diffWordWrap.get();
            result.revealHorizontalRightPadding = editorOptions_1.EditorOptions.revealHorizontalRightPadding.defaultValue + overviewRulerPart_1.$qZ.ENTIRE_DIFF_OVERVIEW_WIDTH;
            result.scrollbar.verticalHasArrows = false;
            result.extraEditorClassName = 'modified-in-monaco-diff-editor';
            return result;
        }
        u(options) {
            const clonedOptions = {
                ...options,
                dimension: {
                    height: 0,
                    width: 0
                },
            };
            clonedOptions.inDiffEditor = true;
            clonedOptions.automaticLayout = false;
            // Clone scrollbar options before changing them
            clonedOptions.scrollbar = { ...(clonedOptions.scrollbar || {}) };
            clonedOptions.scrollbar.vertical = 'visible';
            clonedOptions.folding = false;
            clonedOptions.codeLens = this.f.diffCodeLens.get();
            clonedOptions.fixedOverflowWidgets = true;
            // Clone minimap options before changing them
            clonedOptions.minimap = { ...(clonedOptions.minimap || {}) };
            clonedOptions.minimap.enabled = false;
            if (this.f.hideUnchangedRegions.get()) {
                clonedOptions.stickyScroll = { enabled: false };
            }
            else {
                clonedOptions.stickyScroll = this.f.editorOptions.get().stickyScroll;
            }
            return clonedOptions;
        }
        w(ariaLabel) {
            if (!ariaLabel) {
                ariaLabel = '';
            }
            const ariaNavigationTip = (0, nls_1.localize)(0, null, this.j.lookupKeybinding('editor.action.accessibilityHelp')?.getAriaLabel());
            if (this.f.accessibilityVerbose.get()) {
                return ariaLabel + ariaNavigationTip;
            }
            else if (ariaLabel) {
                return ariaLabel.replaceAll(ariaNavigationTip, '');
            }
            return '';
        }
    };
    exports.$rZ = $rZ;
    exports.$rZ = $rZ = __decorate([
        __param(5, instantiation_1.$Ah),
        __param(6, keybinding_1.$2D)
    ], $rZ);
});
//# sourceMappingURL=diffEditorEditors.js.map