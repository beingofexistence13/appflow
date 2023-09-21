/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WrappingIndent = exports.TrackedRangeStickiness = exports.TextEditorCursorStyle = exports.TextEditorCursorBlinkingStyle = exports.SymbolTag = exports.SymbolKind = exports.SignatureHelpTriggerKind = exports.SelectionDirection = exports.ScrollbarVisibility = exports.ScrollType = exports.RenderMinimap = exports.RenderLineNumbersType = exports.PositionAffinity = exports.OverviewRulerLane = exports.OverlayWidgetPositionPreference = exports.MouseTargetType = exports.MinimapPosition = exports.MarkerTag = exports.MarkerSeverity = exports.KeyCode = exports.InlineCompletionTriggerKind = exports.InlayHintKind = exports.InjectedTextCursorStops = exports.IndentAction = exports.GlyphMarginLane = exports.EndOfLineSequence = exports.EndOfLinePreference = exports.EditorOption = exports.EditorAutoIndentStrategy = exports.DocumentHighlightKind = exports.DefaultEndOfLine = exports.CursorChangeReason = exports.ContentWidgetPositionPreference = exports.CompletionTriggerKind = exports.CompletionItemTag = exports.CompletionItemKind = exports.CompletionItemInsertTextRule = exports.CodeActionTriggerType = exports.AccessibilitySupport = void 0;
    // THIS IS A GENERATED FILE. DO NOT EDIT DIRECTLY.
    var AccessibilitySupport;
    (function (AccessibilitySupport) {
        /**
         * This should be the browser case where it is not known if a screen reader is attached or no.
         */
        AccessibilitySupport[AccessibilitySupport["Unknown"] = 0] = "Unknown";
        AccessibilitySupport[AccessibilitySupport["Disabled"] = 1] = "Disabled";
        AccessibilitySupport[AccessibilitySupport["Enabled"] = 2] = "Enabled";
    })(AccessibilitySupport || (exports.AccessibilitySupport = AccessibilitySupport = {}));
    var CodeActionTriggerType;
    (function (CodeActionTriggerType) {
        CodeActionTriggerType[CodeActionTriggerType["Invoke"] = 1] = "Invoke";
        CodeActionTriggerType[CodeActionTriggerType["Auto"] = 2] = "Auto";
    })(CodeActionTriggerType || (exports.CodeActionTriggerType = CodeActionTriggerType = {}));
    var CompletionItemInsertTextRule;
    (function (CompletionItemInsertTextRule) {
        CompletionItemInsertTextRule[CompletionItemInsertTextRule["None"] = 0] = "None";
        /**
         * Adjust whitespace/indentation of multiline insert texts to
         * match the current line indentation.
         */
        CompletionItemInsertTextRule[CompletionItemInsertTextRule["KeepWhitespace"] = 1] = "KeepWhitespace";
        /**
         * `insertText` is a snippet.
         */
        CompletionItemInsertTextRule[CompletionItemInsertTextRule["InsertAsSnippet"] = 4] = "InsertAsSnippet";
    })(CompletionItemInsertTextRule || (exports.CompletionItemInsertTextRule = CompletionItemInsertTextRule = {}));
    var CompletionItemKind;
    (function (CompletionItemKind) {
        CompletionItemKind[CompletionItemKind["Method"] = 0] = "Method";
        CompletionItemKind[CompletionItemKind["Function"] = 1] = "Function";
        CompletionItemKind[CompletionItemKind["Constructor"] = 2] = "Constructor";
        CompletionItemKind[CompletionItemKind["Field"] = 3] = "Field";
        CompletionItemKind[CompletionItemKind["Variable"] = 4] = "Variable";
        CompletionItemKind[CompletionItemKind["Class"] = 5] = "Class";
        CompletionItemKind[CompletionItemKind["Struct"] = 6] = "Struct";
        CompletionItemKind[CompletionItemKind["Interface"] = 7] = "Interface";
        CompletionItemKind[CompletionItemKind["Module"] = 8] = "Module";
        CompletionItemKind[CompletionItemKind["Property"] = 9] = "Property";
        CompletionItemKind[CompletionItemKind["Event"] = 10] = "Event";
        CompletionItemKind[CompletionItemKind["Operator"] = 11] = "Operator";
        CompletionItemKind[CompletionItemKind["Unit"] = 12] = "Unit";
        CompletionItemKind[CompletionItemKind["Value"] = 13] = "Value";
        CompletionItemKind[CompletionItemKind["Constant"] = 14] = "Constant";
        CompletionItemKind[CompletionItemKind["Enum"] = 15] = "Enum";
        CompletionItemKind[CompletionItemKind["EnumMember"] = 16] = "EnumMember";
        CompletionItemKind[CompletionItemKind["Keyword"] = 17] = "Keyword";
        CompletionItemKind[CompletionItemKind["Text"] = 18] = "Text";
        CompletionItemKind[CompletionItemKind["Color"] = 19] = "Color";
        CompletionItemKind[CompletionItemKind["File"] = 20] = "File";
        CompletionItemKind[CompletionItemKind["Reference"] = 21] = "Reference";
        CompletionItemKind[CompletionItemKind["Customcolor"] = 22] = "Customcolor";
        CompletionItemKind[CompletionItemKind["Folder"] = 23] = "Folder";
        CompletionItemKind[CompletionItemKind["TypeParameter"] = 24] = "TypeParameter";
        CompletionItemKind[CompletionItemKind["User"] = 25] = "User";
        CompletionItemKind[CompletionItemKind["Issue"] = 26] = "Issue";
        CompletionItemKind[CompletionItemKind["Snippet"] = 27] = "Snippet";
    })(CompletionItemKind || (exports.CompletionItemKind = CompletionItemKind = {}));
    var CompletionItemTag;
    (function (CompletionItemTag) {
        CompletionItemTag[CompletionItemTag["Deprecated"] = 1] = "Deprecated";
    })(CompletionItemTag || (exports.CompletionItemTag = CompletionItemTag = {}));
    /**
     * How a suggest provider was triggered.
     */
    var CompletionTriggerKind;
    (function (CompletionTriggerKind) {
        CompletionTriggerKind[CompletionTriggerKind["Invoke"] = 0] = "Invoke";
        CompletionTriggerKind[CompletionTriggerKind["TriggerCharacter"] = 1] = "TriggerCharacter";
        CompletionTriggerKind[CompletionTriggerKind["TriggerForIncompleteCompletions"] = 2] = "TriggerForIncompleteCompletions";
    })(CompletionTriggerKind || (exports.CompletionTriggerKind = CompletionTriggerKind = {}));
    /**
     * A positioning preference for rendering content widgets.
     */
    var ContentWidgetPositionPreference;
    (function (ContentWidgetPositionPreference) {
        /**
         * Place the content widget exactly at a position
         */
        ContentWidgetPositionPreference[ContentWidgetPositionPreference["EXACT"] = 0] = "EXACT";
        /**
         * Place the content widget above a position
         */
        ContentWidgetPositionPreference[ContentWidgetPositionPreference["ABOVE"] = 1] = "ABOVE";
        /**
         * Place the content widget below a position
         */
        ContentWidgetPositionPreference[ContentWidgetPositionPreference["BELOW"] = 2] = "BELOW";
    })(ContentWidgetPositionPreference || (exports.ContentWidgetPositionPreference = ContentWidgetPositionPreference = {}));
    /**
     * Describes the reason the cursor has changed its position.
     */
    var CursorChangeReason;
    (function (CursorChangeReason) {
        /**
         * Unknown or not set.
         */
        CursorChangeReason[CursorChangeReason["NotSet"] = 0] = "NotSet";
        /**
         * A `model.setValue()` was called.
         */
        CursorChangeReason[CursorChangeReason["ContentFlush"] = 1] = "ContentFlush";
        /**
         * The `model` has been changed outside of this cursor and the cursor recovers its position from associated markers.
         */
        CursorChangeReason[CursorChangeReason["RecoverFromMarkers"] = 2] = "RecoverFromMarkers";
        /**
         * There was an explicit user gesture.
         */
        CursorChangeReason[CursorChangeReason["Explicit"] = 3] = "Explicit";
        /**
         * There was a Paste.
         */
        CursorChangeReason[CursorChangeReason["Paste"] = 4] = "Paste";
        /**
         * There was an Undo.
         */
        CursorChangeReason[CursorChangeReason["Undo"] = 5] = "Undo";
        /**
         * There was a Redo.
         */
        CursorChangeReason[CursorChangeReason["Redo"] = 6] = "Redo";
    })(CursorChangeReason || (exports.CursorChangeReason = CursorChangeReason = {}));
    /**
     * The default end of line to use when instantiating models.
     */
    var DefaultEndOfLine;
    (function (DefaultEndOfLine) {
        /**
         * Use line feed (\n) as the end of line character.
         */
        DefaultEndOfLine[DefaultEndOfLine["LF"] = 1] = "LF";
        /**
         * Use carriage return and line feed (\r\n) as the end of line character.
         */
        DefaultEndOfLine[DefaultEndOfLine["CRLF"] = 2] = "CRLF";
    })(DefaultEndOfLine || (exports.DefaultEndOfLine = DefaultEndOfLine = {}));
    /**
     * A document highlight kind.
     */
    var DocumentHighlightKind;
    (function (DocumentHighlightKind) {
        /**
         * A textual occurrence.
         */
        DocumentHighlightKind[DocumentHighlightKind["Text"] = 0] = "Text";
        /**
         * Read-access of a symbol, like reading a variable.
         */
        DocumentHighlightKind[DocumentHighlightKind["Read"] = 1] = "Read";
        /**
         * Write-access of a symbol, like writing to a variable.
         */
        DocumentHighlightKind[DocumentHighlightKind["Write"] = 2] = "Write";
    })(DocumentHighlightKind || (exports.DocumentHighlightKind = DocumentHighlightKind = {}));
    /**
     * Configuration options for auto indentation in the editor
     */
    var EditorAutoIndentStrategy;
    (function (EditorAutoIndentStrategy) {
        EditorAutoIndentStrategy[EditorAutoIndentStrategy["None"] = 0] = "None";
        EditorAutoIndentStrategy[EditorAutoIndentStrategy["Keep"] = 1] = "Keep";
        EditorAutoIndentStrategy[EditorAutoIndentStrategy["Brackets"] = 2] = "Brackets";
        EditorAutoIndentStrategy[EditorAutoIndentStrategy["Advanced"] = 3] = "Advanced";
        EditorAutoIndentStrategy[EditorAutoIndentStrategy["Full"] = 4] = "Full";
    })(EditorAutoIndentStrategy || (exports.EditorAutoIndentStrategy = EditorAutoIndentStrategy = {}));
    var EditorOption;
    (function (EditorOption) {
        EditorOption[EditorOption["acceptSuggestionOnCommitCharacter"] = 0] = "acceptSuggestionOnCommitCharacter";
        EditorOption[EditorOption["acceptSuggestionOnEnter"] = 1] = "acceptSuggestionOnEnter";
        EditorOption[EditorOption["accessibilitySupport"] = 2] = "accessibilitySupport";
        EditorOption[EditorOption["accessibilityPageSize"] = 3] = "accessibilityPageSize";
        EditorOption[EditorOption["ariaLabel"] = 4] = "ariaLabel";
        EditorOption[EditorOption["ariaRequired"] = 5] = "ariaRequired";
        EditorOption[EditorOption["autoClosingBrackets"] = 6] = "autoClosingBrackets";
        EditorOption[EditorOption["autoClosingComments"] = 7] = "autoClosingComments";
        EditorOption[EditorOption["screenReaderAnnounceInlineSuggestion"] = 8] = "screenReaderAnnounceInlineSuggestion";
        EditorOption[EditorOption["autoClosingDelete"] = 9] = "autoClosingDelete";
        EditorOption[EditorOption["autoClosingOvertype"] = 10] = "autoClosingOvertype";
        EditorOption[EditorOption["autoClosingQuotes"] = 11] = "autoClosingQuotes";
        EditorOption[EditorOption["autoIndent"] = 12] = "autoIndent";
        EditorOption[EditorOption["automaticLayout"] = 13] = "automaticLayout";
        EditorOption[EditorOption["autoSurround"] = 14] = "autoSurround";
        EditorOption[EditorOption["bracketPairColorization"] = 15] = "bracketPairColorization";
        EditorOption[EditorOption["guides"] = 16] = "guides";
        EditorOption[EditorOption["codeLens"] = 17] = "codeLens";
        EditorOption[EditorOption["codeLensFontFamily"] = 18] = "codeLensFontFamily";
        EditorOption[EditorOption["codeLensFontSize"] = 19] = "codeLensFontSize";
        EditorOption[EditorOption["colorDecorators"] = 20] = "colorDecorators";
        EditorOption[EditorOption["colorDecoratorsLimit"] = 21] = "colorDecoratorsLimit";
        EditorOption[EditorOption["columnSelection"] = 22] = "columnSelection";
        EditorOption[EditorOption["comments"] = 23] = "comments";
        EditorOption[EditorOption["contextmenu"] = 24] = "contextmenu";
        EditorOption[EditorOption["copyWithSyntaxHighlighting"] = 25] = "copyWithSyntaxHighlighting";
        EditorOption[EditorOption["cursorBlinking"] = 26] = "cursorBlinking";
        EditorOption[EditorOption["cursorSmoothCaretAnimation"] = 27] = "cursorSmoothCaretAnimation";
        EditorOption[EditorOption["cursorStyle"] = 28] = "cursorStyle";
        EditorOption[EditorOption["cursorSurroundingLines"] = 29] = "cursorSurroundingLines";
        EditorOption[EditorOption["cursorSurroundingLinesStyle"] = 30] = "cursorSurroundingLinesStyle";
        EditorOption[EditorOption["cursorWidth"] = 31] = "cursorWidth";
        EditorOption[EditorOption["disableLayerHinting"] = 32] = "disableLayerHinting";
        EditorOption[EditorOption["disableMonospaceOptimizations"] = 33] = "disableMonospaceOptimizations";
        EditorOption[EditorOption["domReadOnly"] = 34] = "domReadOnly";
        EditorOption[EditorOption["dragAndDrop"] = 35] = "dragAndDrop";
        EditorOption[EditorOption["dropIntoEditor"] = 36] = "dropIntoEditor";
        EditorOption[EditorOption["emptySelectionClipboard"] = 37] = "emptySelectionClipboard";
        EditorOption[EditorOption["experimentalWhitespaceRendering"] = 38] = "experimentalWhitespaceRendering";
        EditorOption[EditorOption["extraEditorClassName"] = 39] = "extraEditorClassName";
        EditorOption[EditorOption["fastScrollSensitivity"] = 40] = "fastScrollSensitivity";
        EditorOption[EditorOption["find"] = 41] = "find";
        EditorOption[EditorOption["fixedOverflowWidgets"] = 42] = "fixedOverflowWidgets";
        EditorOption[EditorOption["folding"] = 43] = "folding";
        EditorOption[EditorOption["foldingStrategy"] = 44] = "foldingStrategy";
        EditorOption[EditorOption["foldingHighlight"] = 45] = "foldingHighlight";
        EditorOption[EditorOption["foldingImportsByDefault"] = 46] = "foldingImportsByDefault";
        EditorOption[EditorOption["foldingMaximumRegions"] = 47] = "foldingMaximumRegions";
        EditorOption[EditorOption["unfoldOnClickAfterEndOfLine"] = 48] = "unfoldOnClickAfterEndOfLine";
        EditorOption[EditorOption["fontFamily"] = 49] = "fontFamily";
        EditorOption[EditorOption["fontInfo"] = 50] = "fontInfo";
        EditorOption[EditorOption["fontLigatures"] = 51] = "fontLigatures";
        EditorOption[EditorOption["fontSize"] = 52] = "fontSize";
        EditorOption[EditorOption["fontWeight"] = 53] = "fontWeight";
        EditorOption[EditorOption["fontVariations"] = 54] = "fontVariations";
        EditorOption[EditorOption["formatOnPaste"] = 55] = "formatOnPaste";
        EditorOption[EditorOption["formatOnType"] = 56] = "formatOnType";
        EditorOption[EditorOption["glyphMargin"] = 57] = "glyphMargin";
        EditorOption[EditorOption["gotoLocation"] = 58] = "gotoLocation";
        EditorOption[EditorOption["hideCursorInOverviewRuler"] = 59] = "hideCursorInOverviewRuler";
        EditorOption[EditorOption["hover"] = 60] = "hover";
        EditorOption[EditorOption["inDiffEditor"] = 61] = "inDiffEditor";
        EditorOption[EditorOption["inlineSuggest"] = 62] = "inlineSuggest";
        EditorOption[EditorOption["letterSpacing"] = 63] = "letterSpacing";
        EditorOption[EditorOption["lightbulb"] = 64] = "lightbulb";
        EditorOption[EditorOption["lineDecorationsWidth"] = 65] = "lineDecorationsWidth";
        EditorOption[EditorOption["lineHeight"] = 66] = "lineHeight";
        EditorOption[EditorOption["lineNumbers"] = 67] = "lineNumbers";
        EditorOption[EditorOption["lineNumbersMinChars"] = 68] = "lineNumbersMinChars";
        EditorOption[EditorOption["linkedEditing"] = 69] = "linkedEditing";
        EditorOption[EditorOption["links"] = 70] = "links";
        EditorOption[EditorOption["matchBrackets"] = 71] = "matchBrackets";
        EditorOption[EditorOption["minimap"] = 72] = "minimap";
        EditorOption[EditorOption["mouseStyle"] = 73] = "mouseStyle";
        EditorOption[EditorOption["mouseWheelScrollSensitivity"] = 74] = "mouseWheelScrollSensitivity";
        EditorOption[EditorOption["mouseWheelZoom"] = 75] = "mouseWheelZoom";
        EditorOption[EditorOption["multiCursorMergeOverlapping"] = 76] = "multiCursorMergeOverlapping";
        EditorOption[EditorOption["multiCursorModifier"] = 77] = "multiCursorModifier";
        EditorOption[EditorOption["multiCursorPaste"] = 78] = "multiCursorPaste";
        EditorOption[EditorOption["multiCursorLimit"] = 79] = "multiCursorLimit";
        EditorOption[EditorOption["occurrencesHighlight"] = 80] = "occurrencesHighlight";
        EditorOption[EditorOption["overviewRulerBorder"] = 81] = "overviewRulerBorder";
        EditorOption[EditorOption["overviewRulerLanes"] = 82] = "overviewRulerLanes";
        EditorOption[EditorOption["padding"] = 83] = "padding";
        EditorOption[EditorOption["pasteAs"] = 84] = "pasteAs";
        EditorOption[EditorOption["parameterHints"] = 85] = "parameterHints";
        EditorOption[EditorOption["peekWidgetDefaultFocus"] = 86] = "peekWidgetDefaultFocus";
        EditorOption[EditorOption["definitionLinkOpensInPeek"] = 87] = "definitionLinkOpensInPeek";
        EditorOption[EditorOption["quickSuggestions"] = 88] = "quickSuggestions";
        EditorOption[EditorOption["quickSuggestionsDelay"] = 89] = "quickSuggestionsDelay";
        EditorOption[EditorOption["readOnly"] = 90] = "readOnly";
        EditorOption[EditorOption["readOnlyMessage"] = 91] = "readOnlyMessage";
        EditorOption[EditorOption["renameOnType"] = 92] = "renameOnType";
        EditorOption[EditorOption["renderControlCharacters"] = 93] = "renderControlCharacters";
        EditorOption[EditorOption["renderFinalNewline"] = 94] = "renderFinalNewline";
        EditorOption[EditorOption["renderLineHighlight"] = 95] = "renderLineHighlight";
        EditorOption[EditorOption["renderLineHighlightOnlyWhenFocus"] = 96] = "renderLineHighlightOnlyWhenFocus";
        EditorOption[EditorOption["renderValidationDecorations"] = 97] = "renderValidationDecorations";
        EditorOption[EditorOption["renderWhitespace"] = 98] = "renderWhitespace";
        EditorOption[EditorOption["revealHorizontalRightPadding"] = 99] = "revealHorizontalRightPadding";
        EditorOption[EditorOption["roundedSelection"] = 100] = "roundedSelection";
        EditorOption[EditorOption["rulers"] = 101] = "rulers";
        EditorOption[EditorOption["scrollbar"] = 102] = "scrollbar";
        EditorOption[EditorOption["scrollBeyondLastColumn"] = 103] = "scrollBeyondLastColumn";
        EditorOption[EditorOption["scrollBeyondLastLine"] = 104] = "scrollBeyondLastLine";
        EditorOption[EditorOption["scrollPredominantAxis"] = 105] = "scrollPredominantAxis";
        EditorOption[EditorOption["selectionClipboard"] = 106] = "selectionClipboard";
        EditorOption[EditorOption["selectionHighlight"] = 107] = "selectionHighlight";
        EditorOption[EditorOption["selectOnLineNumbers"] = 108] = "selectOnLineNumbers";
        EditorOption[EditorOption["showFoldingControls"] = 109] = "showFoldingControls";
        EditorOption[EditorOption["showUnused"] = 110] = "showUnused";
        EditorOption[EditorOption["snippetSuggestions"] = 111] = "snippetSuggestions";
        EditorOption[EditorOption["smartSelect"] = 112] = "smartSelect";
        EditorOption[EditorOption["smoothScrolling"] = 113] = "smoothScrolling";
        EditorOption[EditorOption["stickyScroll"] = 114] = "stickyScroll";
        EditorOption[EditorOption["stickyTabStops"] = 115] = "stickyTabStops";
        EditorOption[EditorOption["stopRenderingLineAfter"] = 116] = "stopRenderingLineAfter";
        EditorOption[EditorOption["suggest"] = 117] = "suggest";
        EditorOption[EditorOption["suggestFontSize"] = 118] = "suggestFontSize";
        EditorOption[EditorOption["suggestLineHeight"] = 119] = "suggestLineHeight";
        EditorOption[EditorOption["suggestOnTriggerCharacters"] = 120] = "suggestOnTriggerCharacters";
        EditorOption[EditorOption["suggestSelection"] = 121] = "suggestSelection";
        EditorOption[EditorOption["tabCompletion"] = 122] = "tabCompletion";
        EditorOption[EditorOption["tabIndex"] = 123] = "tabIndex";
        EditorOption[EditorOption["unicodeHighlighting"] = 124] = "unicodeHighlighting";
        EditorOption[EditorOption["unusualLineTerminators"] = 125] = "unusualLineTerminators";
        EditorOption[EditorOption["useShadowDOM"] = 126] = "useShadowDOM";
        EditorOption[EditorOption["useTabStops"] = 127] = "useTabStops";
        EditorOption[EditorOption["wordBreak"] = 128] = "wordBreak";
        EditorOption[EditorOption["wordSeparators"] = 129] = "wordSeparators";
        EditorOption[EditorOption["wordWrap"] = 130] = "wordWrap";
        EditorOption[EditorOption["wordWrapBreakAfterCharacters"] = 131] = "wordWrapBreakAfterCharacters";
        EditorOption[EditorOption["wordWrapBreakBeforeCharacters"] = 132] = "wordWrapBreakBeforeCharacters";
        EditorOption[EditorOption["wordWrapColumn"] = 133] = "wordWrapColumn";
        EditorOption[EditorOption["wordWrapOverride1"] = 134] = "wordWrapOverride1";
        EditorOption[EditorOption["wordWrapOverride2"] = 135] = "wordWrapOverride2";
        EditorOption[EditorOption["wrappingIndent"] = 136] = "wrappingIndent";
        EditorOption[EditorOption["wrappingStrategy"] = 137] = "wrappingStrategy";
        EditorOption[EditorOption["showDeprecated"] = 138] = "showDeprecated";
        EditorOption[EditorOption["inlayHints"] = 139] = "inlayHints";
        EditorOption[EditorOption["editorClassName"] = 140] = "editorClassName";
        EditorOption[EditorOption["pixelRatio"] = 141] = "pixelRatio";
        EditorOption[EditorOption["tabFocusMode"] = 142] = "tabFocusMode";
        EditorOption[EditorOption["layoutInfo"] = 143] = "layoutInfo";
        EditorOption[EditorOption["wrappingInfo"] = 144] = "wrappingInfo";
        EditorOption[EditorOption["defaultColorDecorators"] = 145] = "defaultColorDecorators";
        EditorOption[EditorOption["colorDecoratorsActivatedOn"] = 146] = "colorDecoratorsActivatedOn";
        EditorOption[EditorOption["inlineCompletionsAccessibilityVerbose"] = 147] = "inlineCompletionsAccessibilityVerbose";
    })(EditorOption || (exports.EditorOption = EditorOption = {}));
    /**
     * End of line character preference.
     */
    var EndOfLinePreference;
    (function (EndOfLinePreference) {
        /**
         * Use the end of line character identified in the text buffer.
         */
        EndOfLinePreference[EndOfLinePreference["TextDefined"] = 0] = "TextDefined";
        /**
         * Use line feed (\n) as the end of line character.
         */
        EndOfLinePreference[EndOfLinePreference["LF"] = 1] = "LF";
        /**
         * Use carriage return and line feed (\r\n) as the end of line character.
         */
        EndOfLinePreference[EndOfLinePreference["CRLF"] = 2] = "CRLF";
    })(EndOfLinePreference || (exports.EndOfLinePreference = EndOfLinePreference = {}));
    /**
     * End of line character preference.
     */
    var EndOfLineSequence;
    (function (EndOfLineSequence) {
        /**
         * Use line feed (\n) as the end of line character.
         */
        EndOfLineSequence[EndOfLineSequence["LF"] = 0] = "LF";
        /**
         * Use carriage return and line feed (\r\n) as the end of line character.
         */
        EndOfLineSequence[EndOfLineSequence["CRLF"] = 1] = "CRLF";
    })(EndOfLineSequence || (exports.EndOfLineSequence = EndOfLineSequence = {}));
    /**
     * Vertical Lane in the glyph margin of the editor.
     */
    var GlyphMarginLane;
    (function (GlyphMarginLane) {
        GlyphMarginLane[GlyphMarginLane["Left"] = 1] = "Left";
        GlyphMarginLane[GlyphMarginLane["Right"] = 2] = "Right";
    })(GlyphMarginLane || (exports.GlyphMarginLane = GlyphMarginLane = {}));
    /**
     * Describes what to do with the indentation when pressing Enter.
     */
    var IndentAction;
    (function (IndentAction) {
        /**
         * Insert new line and copy the previous line's indentation.
         */
        IndentAction[IndentAction["None"] = 0] = "None";
        /**
         * Insert new line and indent once (relative to the previous line's indentation).
         */
        IndentAction[IndentAction["Indent"] = 1] = "Indent";
        /**
         * Insert two new lines:
         *  - the first one indented which will hold the cursor
         *  - the second one at the same indentation level
         */
        IndentAction[IndentAction["IndentOutdent"] = 2] = "IndentOutdent";
        /**
         * Insert new line and outdent once (relative to the previous line's indentation).
         */
        IndentAction[IndentAction["Outdent"] = 3] = "Outdent";
    })(IndentAction || (exports.IndentAction = IndentAction = {}));
    var InjectedTextCursorStops;
    (function (InjectedTextCursorStops) {
        InjectedTextCursorStops[InjectedTextCursorStops["Both"] = 0] = "Both";
        InjectedTextCursorStops[InjectedTextCursorStops["Right"] = 1] = "Right";
        InjectedTextCursorStops[InjectedTextCursorStops["Left"] = 2] = "Left";
        InjectedTextCursorStops[InjectedTextCursorStops["None"] = 3] = "None";
    })(InjectedTextCursorStops || (exports.InjectedTextCursorStops = InjectedTextCursorStops = {}));
    var InlayHintKind;
    (function (InlayHintKind) {
        InlayHintKind[InlayHintKind["Type"] = 1] = "Type";
        InlayHintKind[InlayHintKind["Parameter"] = 2] = "Parameter";
    })(InlayHintKind || (exports.InlayHintKind = InlayHintKind = {}));
    /**
     * How an {@link InlineCompletionsProvider inline completion provider} was triggered.
     */
    var InlineCompletionTriggerKind;
    (function (InlineCompletionTriggerKind) {
        /**
         * Completion was triggered automatically while editing.
         * It is sufficient to return a single completion item in this case.
         */
        InlineCompletionTriggerKind[InlineCompletionTriggerKind["Automatic"] = 0] = "Automatic";
        /**
         * Completion was triggered explicitly by a user gesture.
         * Return multiple completion items to enable cycling through them.
         */
        InlineCompletionTriggerKind[InlineCompletionTriggerKind["Explicit"] = 1] = "Explicit";
    })(InlineCompletionTriggerKind || (exports.InlineCompletionTriggerKind = InlineCompletionTriggerKind = {}));
    /**
     * Virtual Key Codes, the value does not hold any inherent meaning.
     * Inspired somewhat from https://msdn.microsoft.com/en-us/library/windows/desktop/dd375731(v=vs.85).aspx
     * But these are "more general", as they should work across browsers & OS`s.
     */
    var KeyCode;
    (function (KeyCode) {
        KeyCode[KeyCode["DependsOnKbLayout"] = -1] = "DependsOnKbLayout";
        /**
         * Placed first to cover the 0 value of the enum.
         */
        KeyCode[KeyCode["Unknown"] = 0] = "Unknown";
        KeyCode[KeyCode["Backspace"] = 1] = "Backspace";
        KeyCode[KeyCode["Tab"] = 2] = "Tab";
        KeyCode[KeyCode["Enter"] = 3] = "Enter";
        KeyCode[KeyCode["Shift"] = 4] = "Shift";
        KeyCode[KeyCode["Ctrl"] = 5] = "Ctrl";
        KeyCode[KeyCode["Alt"] = 6] = "Alt";
        KeyCode[KeyCode["PauseBreak"] = 7] = "PauseBreak";
        KeyCode[KeyCode["CapsLock"] = 8] = "CapsLock";
        KeyCode[KeyCode["Escape"] = 9] = "Escape";
        KeyCode[KeyCode["Space"] = 10] = "Space";
        KeyCode[KeyCode["PageUp"] = 11] = "PageUp";
        KeyCode[KeyCode["PageDown"] = 12] = "PageDown";
        KeyCode[KeyCode["End"] = 13] = "End";
        KeyCode[KeyCode["Home"] = 14] = "Home";
        KeyCode[KeyCode["LeftArrow"] = 15] = "LeftArrow";
        KeyCode[KeyCode["UpArrow"] = 16] = "UpArrow";
        KeyCode[KeyCode["RightArrow"] = 17] = "RightArrow";
        KeyCode[KeyCode["DownArrow"] = 18] = "DownArrow";
        KeyCode[KeyCode["Insert"] = 19] = "Insert";
        KeyCode[KeyCode["Delete"] = 20] = "Delete";
        KeyCode[KeyCode["Digit0"] = 21] = "Digit0";
        KeyCode[KeyCode["Digit1"] = 22] = "Digit1";
        KeyCode[KeyCode["Digit2"] = 23] = "Digit2";
        KeyCode[KeyCode["Digit3"] = 24] = "Digit3";
        KeyCode[KeyCode["Digit4"] = 25] = "Digit4";
        KeyCode[KeyCode["Digit5"] = 26] = "Digit5";
        KeyCode[KeyCode["Digit6"] = 27] = "Digit6";
        KeyCode[KeyCode["Digit7"] = 28] = "Digit7";
        KeyCode[KeyCode["Digit8"] = 29] = "Digit8";
        KeyCode[KeyCode["Digit9"] = 30] = "Digit9";
        KeyCode[KeyCode["KeyA"] = 31] = "KeyA";
        KeyCode[KeyCode["KeyB"] = 32] = "KeyB";
        KeyCode[KeyCode["KeyC"] = 33] = "KeyC";
        KeyCode[KeyCode["KeyD"] = 34] = "KeyD";
        KeyCode[KeyCode["KeyE"] = 35] = "KeyE";
        KeyCode[KeyCode["KeyF"] = 36] = "KeyF";
        KeyCode[KeyCode["KeyG"] = 37] = "KeyG";
        KeyCode[KeyCode["KeyH"] = 38] = "KeyH";
        KeyCode[KeyCode["KeyI"] = 39] = "KeyI";
        KeyCode[KeyCode["KeyJ"] = 40] = "KeyJ";
        KeyCode[KeyCode["KeyK"] = 41] = "KeyK";
        KeyCode[KeyCode["KeyL"] = 42] = "KeyL";
        KeyCode[KeyCode["KeyM"] = 43] = "KeyM";
        KeyCode[KeyCode["KeyN"] = 44] = "KeyN";
        KeyCode[KeyCode["KeyO"] = 45] = "KeyO";
        KeyCode[KeyCode["KeyP"] = 46] = "KeyP";
        KeyCode[KeyCode["KeyQ"] = 47] = "KeyQ";
        KeyCode[KeyCode["KeyR"] = 48] = "KeyR";
        KeyCode[KeyCode["KeyS"] = 49] = "KeyS";
        KeyCode[KeyCode["KeyT"] = 50] = "KeyT";
        KeyCode[KeyCode["KeyU"] = 51] = "KeyU";
        KeyCode[KeyCode["KeyV"] = 52] = "KeyV";
        KeyCode[KeyCode["KeyW"] = 53] = "KeyW";
        KeyCode[KeyCode["KeyX"] = 54] = "KeyX";
        KeyCode[KeyCode["KeyY"] = 55] = "KeyY";
        KeyCode[KeyCode["KeyZ"] = 56] = "KeyZ";
        KeyCode[KeyCode["Meta"] = 57] = "Meta";
        KeyCode[KeyCode["ContextMenu"] = 58] = "ContextMenu";
        KeyCode[KeyCode["F1"] = 59] = "F1";
        KeyCode[KeyCode["F2"] = 60] = "F2";
        KeyCode[KeyCode["F3"] = 61] = "F3";
        KeyCode[KeyCode["F4"] = 62] = "F4";
        KeyCode[KeyCode["F5"] = 63] = "F5";
        KeyCode[KeyCode["F6"] = 64] = "F6";
        KeyCode[KeyCode["F7"] = 65] = "F7";
        KeyCode[KeyCode["F8"] = 66] = "F8";
        KeyCode[KeyCode["F9"] = 67] = "F9";
        KeyCode[KeyCode["F10"] = 68] = "F10";
        KeyCode[KeyCode["F11"] = 69] = "F11";
        KeyCode[KeyCode["F12"] = 70] = "F12";
        KeyCode[KeyCode["F13"] = 71] = "F13";
        KeyCode[KeyCode["F14"] = 72] = "F14";
        KeyCode[KeyCode["F15"] = 73] = "F15";
        KeyCode[KeyCode["F16"] = 74] = "F16";
        KeyCode[KeyCode["F17"] = 75] = "F17";
        KeyCode[KeyCode["F18"] = 76] = "F18";
        KeyCode[KeyCode["F19"] = 77] = "F19";
        KeyCode[KeyCode["F20"] = 78] = "F20";
        KeyCode[KeyCode["F21"] = 79] = "F21";
        KeyCode[KeyCode["F22"] = 80] = "F22";
        KeyCode[KeyCode["F23"] = 81] = "F23";
        KeyCode[KeyCode["F24"] = 82] = "F24";
        KeyCode[KeyCode["NumLock"] = 83] = "NumLock";
        KeyCode[KeyCode["ScrollLock"] = 84] = "ScrollLock";
        /**
         * Used for miscellaneous characters; it can vary by keyboard.
         * For the US standard keyboard, the ';:' key
         */
        KeyCode[KeyCode["Semicolon"] = 85] = "Semicolon";
        /**
         * For any country/region, the '+' key
         * For the US standard keyboard, the '=+' key
         */
        KeyCode[KeyCode["Equal"] = 86] = "Equal";
        /**
         * For any country/region, the ',' key
         * For the US standard keyboard, the ',<' key
         */
        KeyCode[KeyCode["Comma"] = 87] = "Comma";
        /**
         * For any country/region, the '-' key
         * For the US standard keyboard, the '-_' key
         */
        KeyCode[KeyCode["Minus"] = 88] = "Minus";
        /**
         * For any country/region, the '.' key
         * For the US standard keyboard, the '.>' key
         */
        KeyCode[KeyCode["Period"] = 89] = "Period";
        /**
         * Used for miscellaneous characters; it can vary by keyboard.
         * For the US standard keyboard, the '/?' key
         */
        KeyCode[KeyCode["Slash"] = 90] = "Slash";
        /**
         * Used for miscellaneous characters; it can vary by keyboard.
         * For the US standard keyboard, the '`~' key
         */
        KeyCode[KeyCode["Backquote"] = 91] = "Backquote";
        /**
         * Used for miscellaneous characters; it can vary by keyboard.
         * For the US standard keyboard, the '[{' key
         */
        KeyCode[KeyCode["BracketLeft"] = 92] = "BracketLeft";
        /**
         * Used for miscellaneous characters; it can vary by keyboard.
         * For the US standard keyboard, the '\|' key
         */
        KeyCode[KeyCode["Backslash"] = 93] = "Backslash";
        /**
         * Used for miscellaneous characters; it can vary by keyboard.
         * For the US standard keyboard, the ']}' key
         */
        KeyCode[KeyCode["BracketRight"] = 94] = "BracketRight";
        /**
         * Used for miscellaneous characters; it can vary by keyboard.
         * For the US standard keyboard, the ''"' key
         */
        KeyCode[KeyCode["Quote"] = 95] = "Quote";
        /**
         * Used for miscellaneous characters; it can vary by keyboard.
         */
        KeyCode[KeyCode["OEM_8"] = 96] = "OEM_8";
        /**
         * Either the angle bracket key or the backslash key on the RT 102-key keyboard.
         */
        KeyCode[KeyCode["IntlBackslash"] = 97] = "IntlBackslash";
        KeyCode[KeyCode["Numpad0"] = 98] = "Numpad0";
        KeyCode[KeyCode["Numpad1"] = 99] = "Numpad1";
        KeyCode[KeyCode["Numpad2"] = 100] = "Numpad2";
        KeyCode[KeyCode["Numpad3"] = 101] = "Numpad3";
        KeyCode[KeyCode["Numpad4"] = 102] = "Numpad4";
        KeyCode[KeyCode["Numpad5"] = 103] = "Numpad5";
        KeyCode[KeyCode["Numpad6"] = 104] = "Numpad6";
        KeyCode[KeyCode["Numpad7"] = 105] = "Numpad7";
        KeyCode[KeyCode["Numpad8"] = 106] = "Numpad8";
        KeyCode[KeyCode["Numpad9"] = 107] = "Numpad9";
        KeyCode[KeyCode["NumpadMultiply"] = 108] = "NumpadMultiply";
        KeyCode[KeyCode["NumpadAdd"] = 109] = "NumpadAdd";
        KeyCode[KeyCode["NUMPAD_SEPARATOR"] = 110] = "NUMPAD_SEPARATOR";
        KeyCode[KeyCode["NumpadSubtract"] = 111] = "NumpadSubtract";
        KeyCode[KeyCode["NumpadDecimal"] = 112] = "NumpadDecimal";
        KeyCode[KeyCode["NumpadDivide"] = 113] = "NumpadDivide";
        /**
         * Cover all key codes when IME is processing input.
         */
        KeyCode[KeyCode["KEY_IN_COMPOSITION"] = 114] = "KEY_IN_COMPOSITION";
        KeyCode[KeyCode["ABNT_C1"] = 115] = "ABNT_C1";
        KeyCode[KeyCode["ABNT_C2"] = 116] = "ABNT_C2";
        KeyCode[KeyCode["AudioVolumeMute"] = 117] = "AudioVolumeMute";
        KeyCode[KeyCode["AudioVolumeUp"] = 118] = "AudioVolumeUp";
        KeyCode[KeyCode["AudioVolumeDown"] = 119] = "AudioVolumeDown";
        KeyCode[KeyCode["BrowserSearch"] = 120] = "BrowserSearch";
        KeyCode[KeyCode["BrowserHome"] = 121] = "BrowserHome";
        KeyCode[KeyCode["BrowserBack"] = 122] = "BrowserBack";
        KeyCode[KeyCode["BrowserForward"] = 123] = "BrowserForward";
        KeyCode[KeyCode["MediaTrackNext"] = 124] = "MediaTrackNext";
        KeyCode[KeyCode["MediaTrackPrevious"] = 125] = "MediaTrackPrevious";
        KeyCode[KeyCode["MediaStop"] = 126] = "MediaStop";
        KeyCode[KeyCode["MediaPlayPause"] = 127] = "MediaPlayPause";
        KeyCode[KeyCode["LaunchMediaPlayer"] = 128] = "LaunchMediaPlayer";
        KeyCode[KeyCode["LaunchMail"] = 129] = "LaunchMail";
        KeyCode[KeyCode["LaunchApp2"] = 130] = "LaunchApp2";
        /**
         * VK_CLEAR, 0x0C, CLEAR key
         */
        KeyCode[KeyCode["Clear"] = 131] = "Clear";
        /**
         * Placed last to cover the length of the enum.
         * Please do not depend on this value!
         */
        KeyCode[KeyCode["MAX_VALUE"] = 132] = "MAX_VALUE";
    })(KeyCode || (exports.KeyCode = KeyCode = {}));
    var MarkerSeverity;
    (function (MarkerSeverity) {
        MarkerSeverity[MarkerSeverity["Hint"] = 1] = "Hint";
        MarkerSeverity[MarkerSeverity["Info"] = 2] = "Info";
        MarkerSeverity[MarkerSeverity["Warning"] = 4] = "Warning";
        MarkerSeverity[MarkerSeverity["Error"] = 8] = "Error";
    })(MarkerSeverity || (exports.MarkerSeverity = MarkerSeverity = {}));
    var MarkerTag;
    (function (MarkerTag) {
        MarkerTag[MarkerTag["Unnecessary"] = 1] = "Unnecessary";
        MarkerTag[MarkerTag["Deprecated"] = 2] = "Deprecated";
    })(MarkerTag || (exports.MarkerTag = MarkerTag = {}));
    /**
     * Position in the minimap to render the decoration.
     */
    var MinimapPosition;
    (function (MinimapPosition) {
        MinimapPosition[MinimapPosition["Inline"] = 1] = "Inline";
        MinimapPosition[MinimapPosition["Gutter"] = 2] = "Gutter";
    })(MinimapPosition || (exports.MinimapPosition = MinimapPosition = {}));
    /**
     * Type of hit element with the mouse in the editor.
     */
    var MouseTargetType;
    (function (MouseTargetType) {
        /**
         * Mouse is on top of an unknown element.
         */
        MouseTargetType[MouseTargetType["UNKNOWN"] = 0] = "UNKNOWN";
        /**
         * Mouse is on top of the textarea used for input.
         */
        MouseTargetType[MouseTargetType["TEXTAREA"] = 1] = "TEXTAREA";
        /**
         * Mouse is on top of the glyph margin
         */
        MouseTargetType[MouseTargetType["GUTTER_GLYPH_MARGIN"] = 2] = "GUTTER_GLYPH_MARGIN";
        /**
         * Mouse is on top of the line numbers
         */
        MouseTargetType[MouseTargetType["GUTTER_LINE_NUMBERS"] = 3] = "GUTTER_LINE_NUMBERS";
        /**
         * Mouse is on top of the line decorations
         */
        MouseTargetType[MouseTargetType["GUTTER_LINE_DECORATIONS"] = 4] = "GUTTER_LINE_DECORATIONS";
        /**
         * Mouse is on top of the whitespace left in the gutter by a view zone.
         */
        MouseTargetType[MouseTargetType["GUTTER_VIEW_ZONE"] = 5] = "GUTTER_VIEW_ZONE";
        /**
         * Mouse is on top of text in the content.
         */
        MouseTargetType[MouseTargetType["CONTENT_TEXT"] = 6] = "CONTENT_TEXT";
        /**
         * Mouse is on top of empty space in the content (e.g. after line text or below last line)
         */
        MouseTargetType[MouseTargetType["CONTENT_EMPTY"] = 7] = "CONTENT_EMPTY";
        /**
         * Mouse is on top of a view zone in the content.
         */
        MouseTargetType[MouseTargetType["CONTENT_VIEW_ZONE"] = 8] = "CONTENT_VIEW_ZONE";
        /**
         * Mouse is on top of a content widget.
         */
        MouseTargetType[MouseTargetType["CONTENT_WIDGET"] = 9] = "CONTENT_WIDGET";
        /**
         * Mouse is on top of the decorations overview ruler.
         */
        MouseTargetType[MouseTargetType["OVERVIEW_RULER"] = 10] = "OVERVIEW_RULER";
        /**
         * Mouse is on top of a scrollbar.
         */
        MouseTargetType[MouseTargetType["SCROLLBAR"] = 11] = "SCROLLBAR";
        /**
         * Mouse is on top of an overlay widget.
         */
        MouseTargetType[MouseTargetType["OVERLAY_WIDGET"] = 12] = "OVERLAY_WIDGET";
        /**
         * Mouse is outside of the editor.
         */
        MouseTargetType[MouseTargetType["OUTSIDE_EDITOR"] = 13] = "OUTSIDE_EDITOR";
    })(MouseTargetType || (exports.MouseTargetType = MouseTargetType = {}));
    /**
     * A positioning preference for rendering overlay widgets.
     */
    var OverlayWidgetPositionPreference;
    (function (OverlayWidgetPositionPreference) {
        /**
         * Position the overlay widget in the top right corner
         */
        OverlayWidgetPositionPreference[OverlayWidgetPositionPreference["TOP_RIGHT_CORNER"] = 0] = "TOP_RIGHT_CORNER";
        /**
         * Position the overlay widget in the bottom right corner
         */
        OverlayWidgetPositionPreference[OverlayWidgetPositionPreference["BOTTOM_RIGHT_CORNER"] = 1] = "BOTTOM_RIGHT_CORNER";
        /**
         * Position the overlay widget in the top center
         */
        OverlayWidgetPositionPreference[OverlayWidgetPositionPreference["TOP_CENTER"] = 2] = "TOP_CENTER";
    })(OverlayWidgetPositionPreference || (exports.OverlayWidgetPositionPreference = OverlayWidgetPositionPreference = {}));
    /**
     * Vertical Lane in the overview ruler of the editor.
     */
    var OverviewRulerLane;
    (function (OverviewRulerLane) {
        OverviewRulerLane[OverviewRulerLane["Left"] = 1] = "Left";
        OverviewRulerLane[OverviewRulerLane["Center"] = 2] = "Center";
        OverviewRulerLane[OverviewRulerLane["Right"] = 4] = "Right";
        OverviewRulerLane[OverviewRulerLane["Full"] = 7] = "Full";
    })(OverviewRulerLane || (exports.OverviewRulerLane = OverviewRulerLane = {}));
    var PositionAffinity;
    (function (PositionAffinity) {
        /**
         * Prefers the left most position.
        */
        PositionAffinity[PositionAffinity["Left"] = 0] = "Left";
        /**
         * Prefers the right most position.
        */
        PositionAffinity[PositionAffinity["Right"] = 1] = "Right";
        /**
         * No preference.
        */
        PositionAffinity[PositionAffinity["None"] = 2] = "None";
        /**
         * If the given position is on injected text, prefers the position left of it.
        */
        PositionAffinity[PositionAffinity["LeftOfInjectedText"] = 3] = "LeftOfInjectedText";
        /**
         * If the given position is on injected text, prefers the position right of it.
        */
        PositionAffinity[PositionAffinity["RightOfInjectedText"] = 4] = "RightOfInjectedText";
    })(PositionAffinity || (exports.PositionAffinity = PositionAffinity = {}));
    var RenderLineNumbersType;
    (function (RenderLineNumbersType) {
        RenderLineNumbersType[RenderLineNumbersType["Off"] = 0] = "Off";
        RenderLineNumbersType[RenderLineNumbersType["On"] = 1] = "On";
        RenderLineNumbersType[RenderLineNumbersType["Relative"] = 2] = "Relative";
        RenderLineNumbersType[RenderLineNumbersType["Interval"] = 3] = "Interval";
        RenderLineNumbersType[RenderLineNumbersType["Custom"] = 4] = "Custom";
    })(RenderLineNumbersType || (exports.RenderLineNumbersType = RenderLineNumbersType = {}));
    var RenderMinimap;
    (function (RenderMinimap) {
        RenderMinimap[RenderMinimap["None"] = 0] = "None";
        RenderMinimap[RenderMinimap["Text"] = 1] = "Text";
        RenderMinimap[RenderMinimap["Blocks"] = 2] = "Blocks";
    })(RenderMinimap || (exports.RenderMinimap = RenderMinimap = {}));
    var ScrollType;
    (function (ScrollType) {
        ScrollType[ScrollType["Smooth"] = 0] = "Smooth";
        ScrollType[ScrollType["Immediate"] = 1] = "Immediate";
    })(ScrollType || (exports.ScrollType = ScrollType = {}));
    var ScrollbarVisibility;
    (function (ScrollbarVisibility) {
        ScrollbarVisibility[ScrollbarVisibility["Auto"] = 1] = "Auto";
        ScrollbarVisibility[ScrollbarVisibility["Hidden"] = 2] = "Hidden";
        ScrollbarVisibility[ScrollbarVisibility["Visible"] = 3] = "Visible";
    })(ScrollbarVisibility || (exports.ScrollbarVisibility = ScrollbarVisibility = {}));
    /**
     * The direction of a selection.
     */
    var SelectionDirection;
    (function (SelectionDirection) {
        /**
         * The selection starts above where it ends.
         */
        SelectionDirection[SelectionDirection["LTR"] = 0] = "LTR";
        /**
         * The selection starts below where it ends.
         */
        SelectionDirection[SelectionDirection["RTL"] = 1] = "RTL";
    })(SelectionDirection || (exports.SelectionDirection = SelectionDirection = {}));
    var SignatureHelpTriggerKind;
    (function (SignatureHelpTriggerKind) {
        SignatureHelpTriggerKind[SignatureHelpTriggerKind["Invoke"] = 1] = "Invoke";
        SignatureHelpTriggerKind[SignatureHelpTriggerKind["TriggerCharacter"] = 2] = "TriggerCharacter";
        SignatureHelpTriggerKind[SignatureHelpTriggerKind["ContentChange"] = 3] = "ContentChange";
    })(SignatureHelpTriggerKind || (exports.SignatureHelpTriggerKind = SignatureHelpTriggerKind = {}));
    /**
     * A symbol kind.
     */
    var SymbolKind;
    (function (SymbolKind) {
        SymbolKind[SymbolKind["File"] = 0] = "File";
        SymbolKind[SymbolKind["Module"] = 1] = "Module";
        SymbolKind[SymbolKind["Namespace"] = 2] = "Namespace";
        SymbolKind[SymbolKind["Package"] = 3] = "Package";
        SymbolKind[SymbolKind["Class"] = 4] = "Class";
        SymbolKind[SymbolKind["Method"] = 5] = "Method";
        SymbolKind[SymbolKind["Property"] = 6] = "Property";
        SymbolKind[SymbolKind["Field"] = 7] = "Field";
        SymbolKind[SymbolKind["Constructor"] = 8] = "Constructor";
        SymbolKind[SymbolKind["Enum"] = 9] = "Enum";
        SymbolKind[SymbolKind["Interface"] = 10] = "Interface";
        SymbolKind[SymbolKind["Function"] = 11] = "Function";
        SymbolKind[SymbolKind["Variable"] = 12] = "Variable";
        SymbolKind[SymbolKind["Constant"] = 13] = "Constant";
        SymbolKind[SymbolKind["String"] = 14] = "String";
        SymbolKind[SymbolKind["Number"] = 15] = "Number";
        SymbolKind[SymbolKind["Boolean"] = 16] = "Boolean";
        SymbolKind[SymbolKind["Array"] = 17] = "Array";
        SymbolKind[SymbolKind["Object"] = 18] = "Object";
        SymbolKind[SymbolKind["Key"] = 19] = "Key";
        SymbolKind[SymbolKind["Null"] = 20] = "Null";
        SymbolKind[SymbolKind["EnumMember"] = 21] = "EnumMember";
        SymbolKind[SymbolKind["Struct"] = 22] = "Struct";
        SymbolKind[SymbolKind["Event"] = 23] = "Event";
        SymbolKind[SymbolKind["Operator"] = 24] = "Operator";
        SymbolKind[SymbolKind["TypeParameter"] = 25] = "TypeParameter";
    })(SymbolKind || (exports.SymbolKind = SymbolKind = {}));
    var SymbolTag;
    (function (SymbolTag) {
        SymbolTag[SymbolTag["Deprecated"] = 1] = "Deprecated";
    })(SymbolTag || (exports.SymbolTag = SymbolTag = {}));
    /**
     * The kind of animation in which the editor's cursor should be rendered.
     */
    var TextEditorCursorBlinkingStyle;
    (function (TextEditorCursorBlinkingStyle) {
        /**
         * Hidden
         */
        TextEditorCursorBlinkingStyle[TextEditorCursorBlinkingStyle["Hidden"] = 0] = "Hidden";
        /**
         * Blinking
         */
        TextEditorCursorBlinkingStyle[TextEditorCursorBlinkingStyle["Blink"] = 1] = "Blink";
        /**
         * Blinking with smooth fading
         */
        TextEditorCursorBlinkingStyle[TextEditorCursorBlinkingStyle["Smooth"] = 2] = "Smooth";
        /**
         * Blinking with prolonged filled state and smooth fading
         */
        TextEditorCursorBlinkingStyle[TextEditorCursorBlinkingStyle["Phase"] = 3] = "Phase";
        /**
         * Expand collapse animation on the y axis
         */
        TextEditorCursorBlinkingStyle[TextEditorCursorBlinkingStyle["Expand"] = 4] = "Expand";
        /**
         * No-Blinking
         */
        TextEditorCursorBlinkingStyle[TextEditorCursorBlinkingStyle["Solid"] = 5] = "Solid";
    })(TextEditorCursorBlinkingStyle || (exports.TextEditorCursorBlinkingStyle = TextEditorCursorBlinkingStyle = {}));
    /**
     * The style in which the editor's cursor should be rendered.
     */
    var TextEditorCursorStyle;
    (function (TextEditorCursorStyle) {
        /**
         * As a vertical line (sitting between two characters).
         */
        TextEditorCursorStyle[TextEditorCursorStyle["Line"] = 1] = "Line";
        /**
         * As a block (sitting on top of a character).
         */
        TextEditorCursorStyle[TextEditorCursorStyle["Block"] = 2] = "Block";
        /**
         * As a horizontal line (sitting under a character).
         */
        TextEditorCursorStyle[TextEditorCursorStyle["Underline"] = 3] = "Underline";
        /**
         * As a thin vertical line (sitting between two characters).
         */
        TextEditorCursorStyle[TextEditorCursorStyle["LineThin"] = 4] = "LineThin";
        /**
         * As an outlined block (sitting on top of a character).
         */
        TextEditorCursorStyle[TextEditorCursorStyle["BlockOutline"] = 5] = "BlockOutline";
        /**
         * As a thin horizontal line (sitting under a character).
         */
        TextEditorCursorStyle[TextEditorCursorStyle["UnderlineThin"] = 6] = "UnderlineThin";
    })(TextEditorCursorStyle || (exports.TextEditorCursorStyle = TextEditorCursorStyle = {}));
    /**
     * Describes the behavior of decorations when typing/editing near their edges.
     * Note: Please do not edit the values, as they very carefully match `DecorationRangeBehavior`
     */
    var TrackedRangeStickiness;
    (function (TrackedRangeStickiness) {
        TrackedRangeStickiness[TrackedRangeStickiness["AlwaysGrowsWhenTypingAtEdges"] = 0] = "AlwaysGrowsWhenTypingAtEdges";
        TrackedRangeStickiness[TrackedRangeStickiness["NeverGrowsWhenTypingAtEdges"] = 1] = "NeverGrowsWhenTypingAtEdges";
        TrackedRangeStickiness[TrackedRangeStickiness["GrowsOnlyWhenTypingBefore"] = 2] = "GrowsOnlyWhenTypingBefore";
        TrackedRangeStickiness[TrackedRangeStickiness["GrowsOnlyWhenTypingAfter"] = 3] = "GrowsOnlyWhenTypingAfter";
    })(TrackedRangeStickiness || (exports.TrackedRangeStickiness = TrackedRangeStickiness = {}));
    /**
     * Describes how to indent wrapped lines.
     */
    var WrappingIndent;
    (function (WrappingIndent) {
        /**
         * No indentation => wrapped lines begin at column 1.
         */
        WrappingIndent[WrappingIndent["None"] = 0] = "None";
        /**
         * Same => wrapped lines get the same indentation as the parent.
         */
        WrappingIndent[WrappingIndent["Same"] = 1] = "Same";
        /**
         * Indent => wrapped lines get +1 indentation toward the parent.
         */
        WrappingIndent[WrappingIndent["Indent"] = 2] = "Indent";
        /**
         * DeepIndent => wrapped lines get +2 indentation toward the parent.
         */
        WrappingIndent[WrappingIndent["DeepIndent"] = 3] = "DeepIndent";
    })(WrappingIndent || (exports.WrappingIndent = WrappingIndent = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhbmRhbG9uZUVudW1zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9zdGFuZGFsb25lL3N0YW5kYWxvbmVFbnVtcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFFaEcsa0RBQWtEO0lBR2xELElBQVksb0JBT1g7SUFQRCxXQUFZLG9CQUFvQjtRQUMvQjs7V0FFRztRQUNILHFFQUFXLENBQUE7UUFDWCx1RUFBWSxDQUFBO1FBQ1oscUVBQVcsQ0FBQTtJQUNaLENBQUMsRUFQVyxvQkFBb0Isb0NBQXBCLG9CQUFvQixRQU8vQjtJQUVELElBQVkscUJBR1g7SUFIRCxXQUFZLHFCQUFxQjtRQUNoQyxxRUFBVSxDQUFBO1FBQ1YsaUVBQVEsQ0FBQTtJQUNULENBQUMsRUFIVyxxQkFBcUIscUNBQXJCLHFCQUFxQixRQUdoQztJQUVELElBQVksNEJBV1g7SUFYRCxXQUFZLDRCQUE0QjtRQUN2QywrRUFBUSxDQUFBO1FBQ1I7OztXQUdHO1FBQ0gsbUdBQWtCLENBQUE7UUFDbEI7O1dBRUc7UUFDSCxxR0FBbUIsQ0FBQTtJQUNwQixDQUFDLEVBWFcsNEJBQTRCLDRDQUE1Qiw0QkFBNEIsUUFXdkM7SUFFRCxJQUFZLGtCQTZCWDtJQTdCRCxXQUFZLGtCQUFrQjtRQUM3QiwrREFBVSxDQUFBO1FBQ1YsbUVBQVksQ0FBQTtRQUNaLHlFQUFlLENBQUE7UUFDZiw2REFBUyxDQUFBO1FBQ1QsbUVBQVksQ0FBQTtRQUNaLDZEQUFTLENBQUE7UUFDVCwrREFBVSxDQUFBO1FBQ1YscUVBQWEsQ0FBQTtRQUNiLCtEQUFVLENBQUE7UUFDVixtRUFBWSxDQUFBO1FBQ1osOERBQVUsQ0FBQTtRQUNWLG9FQUFhLENBQUE7UUFDYiw0REFBUyxDQUFBO1FBQ1QsOERBQVUsQ0FBQTtRQUNWLG9FQUFhLENBQUE7UUFDYiw0REFBUyxDQUFBO1FBQ1Qsd0VBQWUs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