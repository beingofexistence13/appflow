/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/uri", "vs/editor/common/core/editOperation", "vs/editor/common/core/range", "vs/editor/common/tokenizationRegistry", "vs/nls"], function (require, exports, codicons_1, uri_1, editOperation_1, range_1, tokenizationRegistry_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExternalUriOpenerPriority = exports.TokenizationRegistry = exports.LazyTokenizationSupport = exports.InlayHintKind = exports.CommentState = exports.CommentMode = exports.CommentThreadState = exports.CommentThreadCollapsibleState = exports.Command = exports.FoldingRangeKind = exports.TextEdit = exports.SymbolKinds = exports.SymbolTag = exports.getAriaLabelForSymbol = exports.symbolKindNames = exports.SymbolKind = exports.isLocationLink = exports.DocumentHighlightKind = exports.SignatureHelpTriggerKind = exports.CodeActionTriggerType = exports.SelectedSuggestionInfo = exports.InlineCompletionTriggerKind = exports.CompletionTriggerKind = exports.CompletionItemInsertTextRule = exports.CompletionItemTag = exports.CompletionItemKinds = exports.CompletionItemKind = exports.EncodedTokenizationResult = exports.TokenizationResult = exports.Token = void 0;
    class Token {
        constructor(offset, type, language) {
            this.offset = offset;
            this.type = type;
            this.language = language;
            this._tokenBrand = undefined;
        }
        toString() {
            return '(' + this.offset + ', ' + this.type + ')';
        }
    }
    exports.Token = Token;
    /**
     * @internal
     */
    class TokenizationResult {
        constructor(tokens, endState) {
            this.tokens = tokens;
            this.endState = endState;
            this._tokenizationResultBrand = undefined;
        }
    }
    exports.TokenizationResult = TokenizationResult;
    /**
     * @internal
     */
    class EncodedTokenizationResult {
        constructor(
        /**
         * The tokens in binary format. Each token occupies two array indices. For token i:
         *  - at offset 2*i => startIndex
         *  - at offset 2*i + 1 => metadata
         *
         */
        tokens, endState) {
            this.tokens = tokens;
            this.endState = endState;
            this._encodedTokenizationResultBrand = undefined;
        }
    }
    exports.EncodedTokenizationResult = EncodedTokenizationResult;
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
    /**
     * @internal
     */
    var CompletionItemKinds;
    (function (CompletionItemKinds) {
        const byKind = new Map();
        byKind.set(0 /* CompletionItemKind.Method */, codicons_1.Codicon.symbolMethod);
        byKind.set(1 /* CompletionItemKind.Function */, codicons_1.Codicon.symbolFunction);
        byKind.set(2 /* CompletionItemKind.Constructor */, codicons_1.Codicon.symbolConstructor);
        byKind.set(3 /* CompletionItemKind.Field */, codicons_1.Codicon.symbolField);
        byKind.set(4 /* CompletionItemKind.Variable */, codicons_1.Codicon.symbolVariable);
        byKind.set(5 /* CompletionItemKind.Class */, codicons_1.Codicon.symbolClass);
        byKind.set(6 /* CompletionItemKind.Struct */, codicons_1.Codicon.symbolStruct);
        byKind.set(7 /* CompletionItemKind.Interface */, codicons_1.Codicon.symbolInterface);
        byKind.set(8 /* CompletionItemKind.Module */, codicons_1.Codicon.symbolModule);
        byKind.set(9 /* CompletionItemKind.Property */, codicons_1.Codicon.symbolProperty);
        byKind.set(10 /* CompletionItemKind.Event */, codicons_1.Codicon.symbolEvent);
        byKind.set(11 /* CompletionItemKind.Operator */, codicons_1.Codicon.symbolOperator);
        byKind.set(12 /* CompletionItemKind.Unit */, codicons_1.Codicon.symbolUnit);
        byKind.set(13 /* CompletionItemKind.Value */, codicons_1.Codicon.symbolValue);
        byKind.set(15 /* CompletionItemKind.Enum */, codicons_1.Codicon.symbolEnum);
        byKind.set(14 /* CompletionItemKind.Constant */, codicons_1.Codicon.symbolConstant);
        byKind.set(15 /* CompletionItemKind.Enum */, codicons_1.Codicon.symbolEnum);
        byKind.set(16 /* CompletionItemKind.EnumMember */, codicons_1.Codicon.symbolEnumMember);
        byKind.set(17 /* CompletionItemKind.Keyword */, codicons_1.Codicon.symbolKeyword);
        byKind.set(27 /* CompletionItemKind.Snippet */, codicons_1.Codicon.symbolSnippet);
        byKind.set(18 /* CompletionItemKind.Text */, codicons_1.Codicon.symbolText);
        byKind.set(19 /* CompletionItemKind.Color */, codicons_1.Codicon.symbolColor);
        byKind.set(20 /* CompletionItemKind.File */, codicons_1.Codicon.symbolFile);
        byKind.set(21 /* CompletionItemKind.Reference */, codicons_1.Codicon.symbolReference);
        byKind.set(22 /* CompletionItemKind.Customcolor */, codicons_1.Codicon.symbolCustomColor);
        byKind.set(23 /* CompletionItemKind.Folder */, codicons_1.Codicon.symbolFolder);
        byKind.set(24 /* CompletionItemKind.TypeParameter */, codicons_1.Codicon.symbolTypeParameter);
        byKind.set(25 /* CompletionItemKind.User */, codicons_1.Codicon.account);
        byKind.set(26 /* CompletionItemKind.Issue */, codicons_1.Codicon.issues);
        /**
         * @internal
         */
        function toIcon(kind) {
            let codicon = byKind.get(kind);
            if (!codicon) {
                console.info('No codicon found for CompletionItemKind ' + kind);
                codicon = codicons_1.Codicon.symbolProperty;
            }
            return codicon;
        }
        CompletionItemKinds.toIcon = toIcon;
        const data = new Map();
        data.set('method', 0 /* CompletionItemKind.Method */);
        data.set('function', 1 /* CompletionItemKind.Function */);
        data.set('constructor', 2 /* CompletionItemKind.Constructor */);
        data.set('field', 3 /* CompletionItemKind.Field */);
        data.set('variable', 4 /* CompletionItemKind.Variable */);
        data.set('class', 5 /* CompletionItemKind.Class */);
        data.set('struct', 6 /* CompletionItemKind.Struct */);
        data.set('interface', 7 /* CompletionItemKind.Interface */);
        data.set('module', 8 /* CompletionItemKind.Module */);
        data.set('property', 9 /* CompletionItemKind.Property */);
        data.set('event', 10 /* CompletionItemKind.Event */);
        data.set('operator', 11 /* CompletionItemKind.Operator */);
        data.set('unit', 12 /* CompletionItemKind.Unit */);
        data.set('value', 13 /* CompletionItemKind.Value */);
        data.set('constant', 14 /* CompletionItemKind.Constant */);
        data.set('enum', 15 /* CompletionItemKind.Enum */);
        data.set('enum-member', 16 /* CompletionItemKind.EnumMember */);
        data.set('enumMember', 16 /* CompletionItemKind.EnumMember */);
        data.set('keyword', 17 /* CompletionItemKind.Keyword */);
        data.set('snippet', 27 /* CompletionItemKind.Snippet */);
        data.set('text', 18 /* CompletionItemKind.Text */);
        data.set('color', 19 /* CompletionItemKind.Color */);
        data.set('file', 20 /* CompletionItemKind.File */);
        data.set('reference', 21 /* CompletionItemKind.Reference */);
        data.set('customcolor', 22 /* CompletionItemKind.Customcolor */);
        data.set('folder', 23 /* CompletionItemKind.Folder */);
        data.set('type-parameter', 24 /* CompletionItemKind.TypeParameter */);
        data.set('typeParameter', 24 /* CompletionItemKind.TypeParameter */);
        data.set('account', 25 /* CompletionItemKind.User */);
        data.set('issue', 26 /* CompletionItemKind.Issue */);
        /**
         * @internal
         */
        function fromString(value, strict) {
            let res = data.get(value);
            if (typeof res === 'undefined' && !strict) {
                res = 9 /* CompletionItemKind.Property */;
            }
            return res;
        }
        CompletionItemKinds.fromString = fromString;
    })(CompletionItemKinds || (exports.CompletionItemKinds = CompletionItemKinds = {}));
    var CompletionItemTag;
    (function (CompletionItemTag) {
        CompletionItemTag[CompletionItemTag["Deprecated"] = 1] = "Deprecated";
    })(CompletionItemTag || (exports.CompletionItemTag = CompletionItemTag = {}));
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
    class SelectedSuggestionInfo {
        constructor(range, text, completionKind, isSnippetText) {
            this.range = range;
            this.text = text;
            this.completionKind = completionKind;
            this.isSnippetText = isSnippetText;
        }
        equals(other) {
            return range_1.Range.lift(this.range).equalsRange(other.range)
                && this.text === other.text
                && this.completionKind === other.completionKind
                && this.isSnippetText === other.isSnippetText;
        }
    }
    exports.SelectedSuggestionInfo = SelectedSuggestionInfo;
    var CodeActionTriggerType;
    (function (CodeActionTriggerType) {
        CodeActionTriggerType[CodeActionTriggerType["Invoke"] = 1] = "Invoke";
        CodeActionTriggerType[CodeActionTriggerType["Auto"] = 2] = "Auto";
    })(CodeActionTriggerType || (exports.CodeActionTriggerType = CodeActionTriggerType = {}));
    var SignatureHelpTriggerKind;
    (function (SignatureHelpTriggerKind) {
        SignatureHelpTriggerKind[SignatureHelpTriggerKind["Invoke"] = 1] = "Invoke";
        SignatureHelpTriggerKind[SignatureHelpTriggerKind["TriggerCharacter"] = 2] = "TriggerCharacter";
        SignatureHelpTriggerKind[SignatureHelpTriggerKind["ContentChange"] = 3] = "ContentChange";
    })(SignatureHelpTriggerKind || (exports.SignatureHelpTriggerKind = SignatureHelpTriggerKind = {}));
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
     * @internal
     */
    function isLocationLink(thing) {
        return thing
            && uri_1.URI.isUri(thing.uri)
            && range_1.Range.isIRange(thing.range)
            && (range_1.Range.isIRange(thing.originSelectionRange) || range_1.Range.isIRange(thing.targetSelectionRange));
    }
    exports.isLocationLink = isLocationLink;
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
    /**
     * @internal
     */
    exports.symbolKindNames = {
        [17 /* SymbolKind.Array */]: (0, nls_1.localize)('Array', "array"),
        [16 /* SymbolKind.Boolean */]: (0, nls_1.localize)('Boolean', "boolean"),
        [4 /* SymbolKind.Class */]: (0, nls_1.localize)('Class', "class"),
        [13 /* SymbolKind.Constant */]: (0, nls_1.localize)('Constant', "constant"),
        [8 /* SymbolKind.Constructor */]: (0, nls_1.localize)('Constructor', "constructor"),
        [9 /* SymbolKind.Enum */]: (0, nls_1.localize)('Enum', "enumeration"),
        [21 /* SymbolKind.EnumMember */]: (0, nls_1.localize)('EnumMember', "enumeration member"),
        [23 /* SymbolKind.Event */]: (0, nls_1.localize)('Event', "event"),
        [7 /* SymbolKind.Field */]: (0, nls_1.localize)('Field', "field"),
        [0 /* SymbolKind.File */]: (0, nls_1.localize)('File', "file"),
        [11 /* SymbolKind.Function */]: (0, nls_1.localize)('Function', "function"),
        [10 /* SymbolKind.Interface */]: (0, nls_1.localize)('Interface', "interface"),
        [19 /* SymbolKind.Key */]: (0, nls_1.localize)('Key', "key"),
        [5 /* SymbolKind.Method */]: (0, nls_1.localize)('Method', "method"),
        [1 /* SymbolKind.Module */]: (0, nls_1.localize)('Module', "module"),
        [2 /* SymbolKind.Namespace */]: (0, nls_1.localize)('Namespace', "namespace"),
        [20 /* SymbolKind.Null */]: (0, nls_1.localize)('Null', "null"),
        [15 /* SymbolKind.Number */]: (0, nls_1.localize)('Number', "number"),
        [18 /* SymbolKind.Object */]: (0, nls_1.localize)('Object', "object"),
        [24 /* SymbolKind.Operator */]: (0, nls_1.localize)('Operator', "operator"),
        [3 /* SymbolKind.Package */]: (0, nls_1.localize)('Package', "package"),
        [6 /* SymbolKind.Property */]: (0, nls_1.localize)('Property', "property"),
        [14 /* SymbolKind.String */]: (0, nls_1.localize)('String', "string"),
        [22 /* SymbolKind.Struct */]: (0, nls_1.localize)('Struct', "struct"),
        [25 /* SymbolKind.TypeParameter */]: (0, nls_1.localize)('TypeParameter', "type parameter"),
        [12 /* SymbolKind.Variable */]: (0, nls_1.localize)('Variable', "variable"),
    };
    /**
     * @internal
     */
    function getAriaLabelForSymbol(symbolName, kind) {
        return (0, nls_1.localize)('symbolAriaLabel', '{0} ({1})', symbolName, exports.symbolKindNames[kind]);
    }
    exports.getAriaLabelForSymbol = getAriaLabelForSymbol;
    var SymbolTag;
    (function (SymbolTag) {
        SymbolTag[SymbolTag["Deprecated"] = 1] = "Deprecated";
    })(SymbolTag || (exports.SymbolTag = SymbolTag = {}));
    /**
     * @internal
     */
    var SymbolKinds;
    (function (SymbolKinds) {
        const byKind = new Map();
        byKind.set(0 /* SymbolKind.File */, codicons_1.Codicon.symbolFile);
        byKind.set(1 /* SymbolKind.Module */, codicons_1.Codicon.symbolModule);
        byKind.set(2 /* SymbolKind.Namespace */, codicons_1.Codicon.symbolNamespace);
        byKind.set(3 /* SymbolKind.Package */, codicons_1.Codicon.symbolPackage);
        byKind.set(4 /* SymbolKind.Class */, codicons_1.Codicon.symbolClass);
        byKind.set(5 /* SymbolKind.Method */, codicons_1.Codicon.symbolMethod);
        byKind.set(6 /* SymbolKind.Property */, codicons_1.Codicon.symbolProperty);
        byKind.set(7 /* SymbolKind.Field */, codicons_1.Codicon.symbolField);
        byKind.set(8 /* SymbolKind.Constructor */, codicons_1.Codicon.symbolConstructor);
        byKind.set(9 /* SymbolKind.Enum */, codicons_1.Codicon.symbolEnum);
        byKind.set(10 /* SymbolKind.Interface */, codicons_1.Codicon.symbolInterface);
        byKind.set(11 /* SymbolKind.Function */, codicons_1.Codicon.symbolFunction);
        byKind.set(12 /* SymbolKind.Variable */, codicons_1.Codicon.symbolVariable);
        byKind.set(13 /* SymbolKind.Constant */, codicons_1.Codicon.symbolConstant);
        byKind.set(14 /* SymbolKind.String */, codicons_1.Codicon.symbolString);
        byKind.set(15 /* SymbolKind.Number */, codicons_1.Codicon.symbolNumber);
        byKind.set(16 /* SymbolKind.Boolean */, codicons_1.Codicon.symbolBoolean);
        byKind.set(17 /* SymbolKind.Array */, codicons_1.Codicon.symbolArray);
        byKind.set(18 /* SymbolKind.Object */, codicons_1.Codicon.symbolObject);
        byKind.set(19 /* SymbolKind.Key */, codicons_1.Codicon.symbolKey);
        byKind.set(20 /* SymbolKind.Null */, codicons_1.Codicon.symbolNull);
        byKind.set(21 /* SymbolKind.EnumMember */, codicons_1.Codicon.symbolEnumMember);
        byKind.set(22 /* SymbolKind.Struct */, codicons_1.Codicon.symbolStruct);
        byKind.set(23 /* SymbolKind.Event */, codicons_1.Codicon.symbolEvent);
        byKind.set(24 /* SymbolKind.Operator */, codicons_1.Codicon.symbolOperator);
        byKind.set(25 /* SymbolKind.TypeParameter */, codicons_1.Codicon.symbolTypeParameter);
        /**
         * @internal
         */
        function toIcon(kind) {
            let icon = byKind.get(kind);
            if (!icon) {
                console.info('No codicon found for SymbolKind ' + kind);
                icon = codicons_1.Codicon.symbolProperty;
            }
            return icon;
        }
        SymbolKinds.toIcon = toIcon;
    })(SymbolKinds || (exports.SymbolKinds = SymbolKinds = {}));
    /** @internal */
    class TextEdit {
        static asEditOperation(edit) {
            return editOperation_1.EditOperation.replace(range_1.Range.lift(edit.range), edit.text);
        }
    }
    exports.TextEdit = TextEdit;
    class FoldingRangeKind {
        /**
         * Kind for folding range representing a comment. The value of the kind is 'comment'.
         */
        static { this.Comment = new FoldingRangeKind('comment'); }
        /**
         * Kind for folding range representing a import. The value of the kind is 'imports'.
         */
        static { this.Imports = new FoldingRangeKind('imports'); }
        /**
         * Kind for folding range representing regions (for example marked by `#region`, `#endregion`).
         * The value of the kind is 'region'.
         */
        static { this.Region = new FoldingRangeKind('region'); }
        /**
         * Returns a {@link FoldingRangeKind} for the given value.
         *
         * @param value of the kind.
         */
        static fromValue(value) {
            switch (value) {
                case 'comment': return FoldingRangeKind.Comment;
                case 'imports': return FoldingRangeKind.Imports;
                case 'region': return FoldingRangeKind.Region;
            }
            return new FoldingRangeKind(value);
        }
        /**
         * Creates a new {@link FoldingRangeKind}.
         *
         * @param value of the kind.
         */
        constructor(value) {
            this.value = value;
        }
    }
    exports.FoldingRangeKind = FoldingRangeKind;
    /**
     * @internal
     */
    var Command;
    (function (Command) {
        /**
         * @internal
         */
        function is(obj) {
            if (!obj || typeof obj !== 'object') {
                return false;
            }
            return typeof obj.id === 'string' &&
                typeof obj.title === 'string';
        }
        Command.is = is;
    })(Command || (exports.Command = Command = {}));
    /**
     * @internal
     */
    var CommentThreadCollapsibleState;
    (function (CommentThreadCollapsibleState) {
        /**
         * Determines an item is collapsed
         */
        CommentThreadCollapsibleState[CommentThreadCollapsibleState["Collapsed"] = 0] = "Collapsed";
        /**
         * Determines an item is expanded
         */
        CommentThreadCollapsibleState[CommentThreadCollapsibleState["Expanded"] = 1] = "Expanded";
    })(CommentThreadCollapsibleState || (exports.CommentThreadCollapsibleState = CommentThreadCollapsibleState = {}));
    /**
     * @internal
     */
    var CommentThreadState;
    (function (CommentThreadState) {
        CommentThreadState[CommentThreadState["Unresolved"] = 0] = "Unresolved";
        CommentThreadState[CommentThreadState["Resolved"] = 1] = "Resolved";
    })(CommentThreadState || (exports.CommentThreadState = CommentThreadState = {}));
    /**
     * @internal
     */
    var CommentMode;
    (function (CommentMode) {
        CommentMode[CommentMode["Editing"] = 0] = "Editing";
        CommentMode[CommentMode["Preview"] = 1] = "Preview";
    })(CommentMode || (exports.CommentMode = CommentMode = {}));
    /**
     * @internal
     */
    var CommentState;
    (function (CommentState) {
        CommentState[CommentState["Published"] = 0] = "Published";
        CommentState[CommentState["Draft"] = 1] = "Draft";
    })(CommentState || (exports.CommentState = CommentState = {}));
    var InlayHintKind;
    (function (InlayHintKind) {
        InlayHintKind[InlayHintKind["Type"] = 1] = "Type";
        InlayHintKind[InlayHintKind["Parameter"] = 2] = "Parameter";
    })(InlayHintKind || (exports.InlayHintKind = InlayHintKind = {}));
    /**
     * @internal
     */
    class LazyTokenizationSupport {
        constructor(createSupport) {
            this.createSupport = createSupport;
            this._tokenizationSupport = null;
        }
        dispose() {
            if (this._tokenizationSupport) {
                this._tokenizationSupport.then((support) => {
                    if (support) {
                        support.dispose();
                    }
                });
            }
        }
        get tokenizationSupport() {
            if (!this._tokenizationSupport) {
                this._tokenizationSupport = this.createSupport();
            }
            return this._tokenizationSupport;
        }
    }
    exports.LazyTokenizationSupport = LazyTokenizationSupport;
    /**
     * @internal
     */
    exports.TokenizationRegistry = new tokenizationRegistry_1.TokenizationRegistry();
    /**
     * @internal
     */
    var ExternalUriOpenerPriority;
    (function (ExternalUriOpenerPriority) {
        ExternalUriOpenerPriority[ExternalUriOpenerPriority["None"] = 0] = "None";
        ExternalUriOpenerPriority[ExternalUriOpenerPriority["Option"] = 1] = "Option";
        ExternalUriOpenerPriority[ExternalUriOpenerPriority["Default"] = 2] = "Default";
        ExternalUriOpenerPriority[ExternalUriOpenerPriority["Preferred"] = 3] = "Preferred";
    })(ExternalUriOpenerPriority || (exports.ExternalUriOpenerPriority = ExternalUriOpenerPriority = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9sYW5ndWFnZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZ0NoRyxNQUFhLEtBQUs7UUFHakIsWUFDaUIsTUFBYyxFQUNkLElBQVksRUFDWixRQUFnQjtZQUZoQixXQUFNLEdBQU4sTUFBTSxDQUFRO1lBQ2QsU0FBSSxHQUFKLElBQUksQ0FBUTtZQUNaLGFBQVEsR0FBUixRQUFRLENBQVE7WUFMakMsZ0JBQVcsR0FBUyxTQUFTLENBQUM7UUFPOUIsQ0FBQztRQUVNLFFBQVE7WUFDZCxPQUFPLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztRQUNuRCxDQUFDO0tBQ0Q7SUFiRCxzQkFhQztJQUVEOztPQUVHO0lBQ0gsTUFBYSxrQkFBa0I7UUFHOUIsWUFDaUIsTUFBZSxFQUNmLFFBQWdCO1lBRGhCLFdBQU0sR0FBTixNQUFNLENBQVM7WUFDZixhQUFRLEdBQVIsUUFBUSxDQUFRO1lBSmpDLDZCQUF3QixHQUFTLFNBQVMsQ0FBQztRQU0zQyxDQUFDO0tBQ0Q7SUFSRCxnREFRQztJQUVEOztPQUVHO0lBQ0gsTUFBYSx5QkFBeUI7UUFHckM7UUFDQzs7Ozs7V0FLRztRQUNhLE1BQW1CLEVBQ25CLFFBQWdCO1lBRGhCLFdBQU0sR0FBTixNQUFNLENBQWE7WUFDbkIsYUFBUSxHQUFSLFFBQVEsQ0FBUTtZQVZqQyxvQ0FBK0IsR0FBUyxTQUFTLENBQUM7UUFZbEQsQ0FBQztLQUNEO0lBZEQsOERBY0M7SUF5TUQsSUFBa0Isa0JBNkJqQjtJQTdCRCxXQUFrQixrQkFBa0I7UUFDbkMsK0RBQU0sQ0FBQTtRQUNOLG1FQUFRLENBQUE7UUFDUix5RUFBVyxDQUFBO1FBQ1gsNkRBQUssQ0FBQTtRQUNM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