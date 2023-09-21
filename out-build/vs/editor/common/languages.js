/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/uri", "vs/editor/common/core/editOperation", "vs/editor/common/core/range", "vs/editor/common/tokenizationRegistry", "vs/nls!vs/editor/common/languages"], function (require, exports, codicons_1, uri_1, editOperation_1, range_1, tokenizationRegistry_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExternalUriOpenerPriority = exports.$bt = exports.$at = exports.InlayHintKind = exports.CommentState = exports.CommentMode = exports.CommentThreadState = exports.CommentThreadCollapsibleState = exports.Command = exports.$_s = exports.$$s = exports.SymbolKinds = exports.SymbolTag = exports.$0s = exports.$9s = exports.SymbolKind = exports.$8s = exports.DocumentHighlightKind = exports.SignatureHelpTriggerKind = exports.CodeActionTriggerType = exports.$7s = exports.InlineCompletionTriggerKind = exports.CompletionTriggerKind = exports.CompletionItemInsertTextRule = exports.CompletionItemTag = exports.CompletionItemKinds = exports.CompletionItemKind = exports.$6s = exports.$5s = exports.$4s = void 0;
    class $4s {
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
    exports.$4s = $4s;
    /**
     * @internal
     */
    class $5s {
        constructor(tokens, endState) {
            this.tokens = tokens;
            this.endState = endState;
            this._tokenizationResultBrand = undefined;
        }
    }
    exports.$5s = $5s;
    /**
     * @internal
     */
    class $6s {
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
    exports.$6s = $6s;
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
        byKind.set(0 /* CompletionItemKind.Method */, codicons_1.$Pj.symbolMethod);
        byKind.set(1 /* CompletionItemKind.Function */, codicons_1.$Pj.symbolFunction);
        byKind.set(2 /* CompletionItemKind.Constructor */, codicons_1.$Pj.symbolConstructor);
        byKind.set(3 /* CompletionItemKind.Field */, codicons_1.$Pj.symbolField);
        byKind.set(4 /* CompletionItemKind.Variable */, codicons_1.$Pj.symbolVariable);
        byKind.set(5 /* CompletionItemKind.Class */, codicons_1.$Pj.symbolClass);
        byKind.set(6 /* CompletionItemKind.Struct */, codicons_1.$Pj.symbolStruct);
        byKind.set(7 /* CompletionItemKind.Interface */, codicons_1.$Pj.symbolInterface);
        byKind.set(8 /* CompletionItemKind.Module */, codicons_1.$Pj.symbolModule);
        byKind.set(9 /* CompletionItemKind.Property */, codicons_1.$Pj.symbolProperty);
        byKind.set(10 /* CompletionItemKind.Event */, codicons_1.$Pj.symbolEvent);
        byKind.set(11 /* CompletionItemKind.Operator */, codicons_1.$Pj.symbolOperator);
        byKind.set(12 /* CompletionItemKind.Unit */, codicons_1.$Pj.symbolUnit);
        byKind.set(13 /* CompletionItemKind.Value */, codicons_1.$Pj.symbolValue);
        byKind.set(15 /* CompletionItemKind.Enum */, codicons_1.$Pj.symbolEnum);
        byKind.set(14 /* CompletionItemKind.Constant */, codicons_1.$Pj.symbolConstant);
        byKind.set(15 /* CompletionItemKind.Enum */, codicons_1.$Pj.symbolEnum);
        byKind.set(16 /* CompletionItemKind.EnumMember */, codicons_1.$Pj.symbolEnumMember);
        byKind.set(17 /* CompletionItemKind.Keyword */, codicons_1.$Pj.symbolKeyword);
        byKind.set(27 /* CompletionItemKind.Snippet */, codicons_1.$Pj.symbolSnippet);
        byKind.set(18 /* CompletionItemKind.Text */, codicons_1.$Pj.symbolText);
        byKind.set(19 /* CompletionItemKind.Color */, codicons_1.$Pj.symbolColor);
        byKind.set(20 /* CompletionItemKind.File */, codicons_1.$Pj.symbolFile);
        byKind.set(21 /* CompletionItemKind.Reference */, codicons_1.$Pj.symbolReference);
        byKind.set(22 /* CompletionItemKind.Customcolor */, codicons_1.$Pj.symbolCustomColor);
        byKind.set(23 /* CompletionItemKind.Folder */, codicons_1.$Pj.symbolFolder);
        byKind.set(24 /* CompletionItemKind.TypeParameter */, codicons_1.$Pj.symbolTypeParameter);
        byKind.set(25 /* CompletionItemKind.User */, codicons_1.$Pj.account);
        byKind.set(26 /* CompletionItemKind.Issue */, codicons_1.$Pj.issues);
        /**
         * @internal
         */
        function toIcon(kind) {
            let codicon = byKind.get(kind);
            if (!codicon) {
                console.info('No codicon found for CompletionItemKind ' + kind);
                codicon = codicons_1.$Pj.symbolProperty;
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
    class $7s {
        constructor(range, text, completionKind, isSnippetText) {
            this.range = range;
            this.text = text;
            this.completionKind = completionKind;
            this.isSnippetText = isSnippetText;
        }
        equals(other) {
            return range_1.$ks.lift(this.range).equalsRange(other.range)
                && this.text === other.text
                && this.completionKind === other.completionKind
                && this.isSnippetText === other.isSnippetText;
        }
    }
    exports.$7s = $7s;
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
    function $8s(thing) {
        return thing
            && uri_1.URI.isUri(thing.uri)
            && range_1.$ks.isIRange(thing.range)
            && (range_1.$ks.isIRange(thing.originSelectionRange) || range_1.$ks.isIRange(thing.targetSelectionRange));
    }
    exports.$8s = $8s;
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
    exports.$9s = {
        [17 /* SymbolKind.Array */]: (0, nls_1.localize)(0, null),
        [16 /* SymbolKind.Boolean */]: (0, nls_1.localize)(1, null),
        [4 /* SymbolKind.Class */]: (0, nls_1.localize)(2, null),
        [13 /* SymbolKind.Constant */]: (0, nls_1.localize)(3, null),
        [8 /* SymbolKind.Constructor */]: (0, nls_1.localize)(4, null),
        [9 /* SymbolKind.Enum */]: (0, nls_1.localize)(5, null),
        [21 /* SymbolKind.EnumMember */]: (0, nls_1.localize)(6, null),
        [23 /* SymbolKind.Event */]: (0, nls_1.localize)(7, null),
        [7 /* SymbolKind.Field */]: (0, nls_1.localize)(8, null),
        [0 /* SymbolKind.File */]: (0, nls_1.localize)(9, null),
        [11 /* SymbolKind.Function */]: (0, nls_1.localize)(10, null),
        [10 /* SymbolKind.Interface */]: (0, nls_1.localize)(11, null),
        [19 /* SymbolKind.Key */]: (0, nls_1.localize)(12, null),
        [5 /* SymbolKind.Method */]: (0, nls_1.localize)(13, null),
        [1 /* SymbolKind.Module */]: (0, nls_1.localize)(14, null),
        [2 /* SymbolKind.Namespace */]: (0, nls_1.localize)(15, null),
        [20 /* SymbolKind.Null */]: (0, nls_1.localize)(16, null),
        [15 /* SymbolKind.Number */]: (0, nls_1.localize)(17, null),
        [18 /* SymbolKind.Object */]: (0, nls_1.localize)(18, null),
        [24 /* SymbolKind.Operator */]: (0, nls_1.localize)(19, null),
        [3 /* SymbolKind.Package */]: (0, nls_1.localize)(20, null),
        [6 /* SymbolKind.Property */]: (0, nls_1.localize)(21, null),
        [14 /* SymbolKind.String */]: (0, nls_1.localize)(22, null),
        [22 /* SymbolKind.Struct */]: (0, nls_1.localize)(23, null),
        [25 /* SymbolKind.TypeParameter */]: (0, nls_1.localize)(24, null),
        [12 /* SymbolKind.Variable */]: (0, nls_1.localize)(25, null),
    };
    /**
     * @internal
     */
    function $0s(symbolName, kind) {
        return (0, nls_1.localize)(26, null, symbolName, exports.$9s[kind]);
    }
    exports.$0s = $0s;
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
        byKind.set(0 /* SymbolKind.File */, codicons_1.$Pj.symbolFile);
        byKind.set(1 /* SymbolKind.Module */, codicons_1.$Pj.symbolModule);
        byKind.set(2 /* SymbolKind.Namespace */, codicons_1.$Pj.symbolNamespace);
        byKind.set(3 /* SymbolKind.Package */, codicons_1.$Pj.symbolPackage);
        byKind.set(4 /* SymbolKind.Class */, codicons_1.$Pj.symbolClass);
        byKind.set(5 /* SymbolKind.Method */, codicons_1.$Pj.symbolMethod);
        byKind.set(6 /* SymbolKind.Property */, codicons_1.$Pj.symbolProperty);
        byKind.set(7 /* SymbolKind.Field */, codicons_1.$Pj.symbolField);
        byKind.set(8 /* SymbolKind.Constructor */, codicons_1.$Pj.symbolConstructor);
        byKind.set(9 /* SymbolKind.Enum */, codicons_1.$Pj.symbolEnum);
        byKind.set(10 /* SymbolKind.Interface */, codicons_1.$Pj.symbolInterface);
        byKind.set(11 /* SymbolKind.Function */, codicons_1.$Pj.symbolFunction);
        byKind.set(12 /* SymbolKind.Variable */, codicons_1.$Pj.symbolVariable);
        byKind.set(13 /* SymbolKind.Constant */, codicons_1.$Pj.symbolConstant);
        byKind.set(14 /* SymbolKind.String */, codicons_1.$Pj.symbolString);
        byKind.set(15 /* SymbolKind.Number */, codicons_1.$Pj.symbolNumber);
        byKind.set(16 /* SymbolKind.Boolean */, codicons_1.$Pj.symbolBoolean);
        byKind.set(17 /* SymbolKind.Array */, codicons_1.$Pj.symbolArray);
        byKind.set(18 /* SymbolKind.Object */, codicons_1.$Pj.symbolObject);
        byKind.set(19 /* SymbolKind.Key */, codicons_1.$Pj.symbolKey);
        byKind.set(20 /* SymbolKind.Null */, codicons_1.$Pj.symbolNull);
        byKind.set(21 /* SymbolKind.EnumMember */, codicons_1.$Pj.symbolEnumMember);
        byKind.set(22 /* SymbolKind.Struct */, codicons_1.$Pj.symbolStruct);
        byKind.set(23 /* SymbolKind.Event */, codicons_1.$Pj.symbolEvent);
        byKind.set(24 /* SymbolKind.Operator */, codicons_1.$Pj.symbolOperator);
        byKind.set(25 /* SymbolKind.TypeParameter */, codicons_1.$Pj.symbolTypeParameter);
        /**
         * @internal
         */
        function toIcon(kind) {
            let icon = byKind.get(kind);
            if (!icon) {
                console.info('No codicon found for SymbolKind ' + kind);
                icon = codicons_1.$Pj.symbolProperty;
            }
            return icon;
        }
        SymbolKinds.toIcon = toIcon;
    })(SymbolKinds || (exports.SymbolKinds = SymbolKinds = {}));
    /** @internal */
    class $$s {
        static asEditOperation(edit) {
            return editOperation_1.$ls.replace(range_1.$ks.lift(edit.range), edit.text);
        }
    }
    exports.$$s = $$s;
    class $_s {
        /**
         * Kind for folding range representing a comment. The value of the kind is 'comment'.
         */
        static { this.Comment = new $_s('comment'); }
        /**
         * Kind for folding range representing a import. The value of the kind is 'imports'.
         */
        static { this.Imports = new $_s('imports'); }
        /**
         * Kind for folding range representing regions (for example marked by `#region`, `#endregion`).
         * The value of the kind is 'region'.
         */
        static { this.Region = new $_s('region'); }
        /**
         * Returns a {@link $_s} for the given value.
         *
         * @param value of the kind.
         */
        static fromValue(value) {
            switch (value) {
                case 'comment': return $_s.Comment;
                case 'imports': return $_s.Imports;
                case 'region': return $_s.Region;
            }
            return new $_s(value);
        }
        /**
         * Creates a new {@link $_s}.
         *
         * @param value of the kind.
         */
        constructor(value) {
            this.value = value;
        }
    }
    exports.$_s = $_s;
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
    class $at {
        constructor(b) {
            this.b = b;
            this.a = null;
        }
        dispose() {
            if (this.a) {
                this.a.then((support) => {
                    if (support) {
                        support.dispose();
                    }
                });
            }
        }
        get tokenizationSupport() {
            if (!this.a) {
                this.a = this.b();
            }
            return this.a;
        }
    }
    exports.$at = $at;
    /**
     * @internal
     */
    exports.$bt = new tokenizationRegistry_1.$Vs();
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
//# sourceMappingURL=languages.js.map