/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/editor/common/editorContextKeys", "vs/platform/contextkey/common/contextkey"], function (require, exports, nls, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorContextKeys = void 0;
    var EditorContextKeys;
    (function (EditorContextKeys) {
        EditorContextKeys.editorSimpleInput = new contextkey_1.$2i('editorSimpleInput', false, true);
        /**
         * A context key that is set when the editor's text has focus (cursor is blinking).
         * Is false when focus is in simple editor widgets (repl input, scm commit input).
         */
        EditorContextKeys.editorTextFocus = new contextkey_1.$2i('editorTextFocus', false, nls.localize(0, null));
        /**
         * A context key that is set when the editor's text or an editor's widget has focus.
         */
        EditorContextKeys.focus = new contextkey_1.$2i('editorFocus', false, nls.localize(1, null));
        /**
         * A context key that is set when any editor input has focus (regular editor, repl input...).
         */
        EditorContextKeys.textInputFocus = new contextkey_1.$2i('textInputFocus', false, nls.localize(2, null));
        EditorContextKeys.readOnly = new contextkey_1.$2i('editorReadonly', false, nls.localize(3, null));
        EditorContextKeys.inDiffEditor = new contextkey_1.$2i('inDiffEditor', false, nls.localize(4, null));
        EditorContextKeys.isEmbeddedDiffEditor = new contextkey_1.$2i('isEmbeddedDiffEditor', false, nls.localize(5, null));
        EditorContextKeys.comparingMovedCode = new contextkey_1.$2i('comparingMovedCode', false, nls.localize(6, null));
        EditorContextKeys.accessibleDiffViewerVisible = new contextkey_1.$2i('accessibleDiffViewerVisible', false, nls.localize(7, null));
        EditorContextKeys.diffEditorRenderSideBySideInlineBreakpointReached = new contextkey_1.$2i('diffEditorRenderSideBySideInlineBreakpointReached', false, nls.localize(8, null));
        EditorContextKeys.columnSelection = new contextkey_1.$2i('editorColumnSelection', false, nls.localize(9, null));
        EditorContextKeys.writable = EditorContextKeys.readOnly.toNegated();
        EditorContextKeys.hasNonEmptySelection = new contextkey_1.$2i('editorHasSelection', false, nls.localize(10, null));
        EditorContextKeys.hasOnlyEmptySelection = EditorContextKeys.hasNonEmptySelection.toNegated();
        EditorContextKeys.hasMultipleSelections = new contextkey_1.$2i('editorHasMultipleSelections', false, nls.localize(11, null));
        EditorContextKeys.hasSingleSelection = EditorContextKeys.hasMultipleSelections.toNegated();
        EditorContextKeys.tabMovesFocus = new contextkey_1.$2i('editorTabMovesFocus', false, nls.localize(12, null));
        EditorContextKeys.tabDoesNotMoveFocus = EditorContextKeys.tabMovesFocus.toNegated();
        EditorContextKeys.isInWalkThroughSnippet = new contextkey_1.$2i('isInEmbeddedEditor', false, true);
        EditorContextKeys.canUndo = new contextkey_1.$2i('canUndo', false, true);
        EditorContextKeys.canRedo = new contextkey_1.$2i('canRedo', false, true);
        EditorContextKeys.hoverVisible = new contextkey_1.$2i('editorHoverVisible', false, nls.localize(13, null));
        EditorContextKeys.hoverFocused = new contextkey_1.$2i('editorHoverFocused', false, nls.localize(14, null));
        EditorContextKeys.stickyScrollFocused = new contextkey_1.$2i('stickyScrollFocused', false, nls.localize(15, null));
        EditorContextKeys.stickyScrollVisible = new contextkey_1.$2i('stickyScrollVisible', false, nls.localize(16, null));
        EditorContextKeys.standaloneColorPickerVisible = new contextkey_1.$2i('standaloneColorPickerVisible', false, nls.localize(17, null));
        EditorContextKeys.standaloneColorPickerFocused = new contextkey_1.$2i('standaloneColorPickerFocused', false, nls.localize(18, null));
        /**
         * A context key that is set when an editor is part of a larger editor, like notebooks or
         * (future) a diff editor
         */
        EditorContextKeys.inCompositeEditor = new contextkey_1.$2i('inCompositeEditor', undefined, nls.localize(19, null));
        EditorContextKeys.notInCompositeEditor = EditorContextKeys.inCompositeEditor.toNegated();
        // -- mode context keys
        EditorContextKeys.languageId = new contextkey_1.$2i('editorLangId', '', nls.localize(20, null));
        EditorContextKeys.hasCompletionItemProvider = new contextkey_1.$2i('editorHasCompletionItemProvider', false, nls.localize(21, null));
        EditorContextKeys.hasCodeActionsProvider = new contextkey_1.$2i('editorHasCodeActionsProvider', false, nls.localize(22, null));
        EditorContextKeys.hasCodeLensProvider = new contextkey_1.$2i('editorHasCodeLensProvider', false, nls.localize(23, null));
        EditorContextKeys.hasDefinitionProvider = new contextkey_1.$2i('editorHasDefinitionProvider', false, nls.localize(24, null));
        EditorContextKeys.hasDeclarationProvider = new contextkey_1.$2i('editorHasDeclarationProvider', false, nls.localize(25, null));
        EditorContextKeys.hasImplementationProvider = new contextkey_1.$2i('editorHasImplementationProvider', false, nls.localize(26, null));
        EditorContextKeys.hasTypeDefinitionProvider = new contextkey_1.$2i('editorHasTypeDefinitionProvider', false, nls.localize(27, null));
        EditorContextKeys.hasHoverProvider = new contextkey_1.$2i('editorHasHoverProvider', false, nls.localize(28, null));
        EditorContextKeys.hasDocumentHighlightProvider = new contextkey_1.$2i('editorHasDocumentHighlightProvider', false, nls.localize(29, null));
        EditorContextKeys.hasDocumentSymbolProvider = new contextkey_1.$2i('editorHasDocumentSymbolProvider', false, nls.localize(30, null));
        EditorContextKeys.hasReferenceProvider = new contextkey_1.$2i('editorHasReferenceProvider', false, nls.localize(31, null));
        EditorContextKeys.hasRenameProvider = new contextkey_1.$2i('editorHasRenameProvider', false, nls.localize(32, null));
        EditorContextKeys.hasSignatureHelpProvider = new contextkey_1.$2i('editorHasSignatureHelpProvider', false, nls.localize(33, null));
        EditorContextKeys.hasInlayHintsProvider = new contextkey_1.$2i('editorHasInlayHintsProvider', false, nls.localize(34, null));
        // -- mode context keys: formatting
        EditorContextKeys.hasDocumentFormattingProvider = new contextkey_1.$2i('editorHasDocumentFormattingProvider', false, nls.localize(35, null));
        EditorContextKeys.hasDocumentSelectionFormattingProvider = new contextkey_1.$2i('editorHasDocumentSelectionFormattingProvider', false, nls.localize(36, null));
        EditorContextKeys.hasMultipleDocumentFormattingProvider = new contextkey_1.$2i('editorHasMultipleDocumentFormattingProvider', false, nls.localize(37, null));
        EditorContextKeys.hasMultipleDocumentSelectionFormattingProvider = new contextkey_1.$2i('editorHasMultipleDocumentSelectionFormattingProvider', false, nls.localize(38, null));
    })(EditorContextKeys || (exports.EditorContextKeys = EditorContextKeys = {}));
});
//# sourceMappingURL=editorContextKeys.js.map