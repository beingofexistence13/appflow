/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors"], function (require, exports, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeActionItem = exports.CodeActionCommandArgs = exports.filtersAction = exports.mayIncludeActionsOfKind = exports.CodeActionTriggerSource = exports.CodeActionAutoApply = exports.CodeActionKind = void 0;
    class CodeActionKind {
        static { this.sep = '.'; }
        static { this.None = new CodeActionKind('@@none@@'); } // Special code action that contains nothing
        static { this.Empty = new CodeActionKind(''); }
        static { this.QuickFix = new CodeActionKind('quickfix'); }
        static { this.Refactor = new CodeActionKind('refactor'); }
        static { this.RefactorExtract = CodeActionKind.Refactor.append('extract'); }
        static { this.RefactorInline = CodeActionKind.Refactor.append('inline'); }
        static { this.RefactorMove = CodeActionKind.Refactor.append('move'); }
        static { this.RefactorRewrite = CodeActionKind.Refactor.append('rewrite'); }
        static { this.Notebook = new CodeActionKind('notebook'); }
        static { this.Source = new CodeActionKind('source'); }
        static { this.SourceOrganizeImports = CodeActionKind.Source.append('organizeImports'); }
        static { this.SourceFixAll = CodeActionKind.Source.append('fixAll'); }
        static { this.SurroundWith = CodeActionKind.Refactor.append('surround'); }
        constructor(value) {
            this.value = value;
        }
        equals(other) {
            return this.value === other.value;
        }
        contains(other) {
            return this.equals(other) || this.value === '' || other.value.startsWith(this.value + CodeActionKind.sep);
        }
        intersects(other) {
            return this.contains(other) || other.contains(this);
        }
        append(part) {
            return new CodeActionKind(this.value + CodeActionKind.sep + part);
        }
    }
    exports.CodeActionKind = CodeActionKind;
    var CodeActionAutoApply;
    (function (CodeActionAutoApply) {
        CodeActionAutoApply["IfSingle"] = "ifSingle";
        CodeActionAutoApply["First"] = "first";
        CodeActionAutoApply["Never"] = "never";
    })(CodeActionAutoApply || (exports.CodeActionAutoApply = CodeActionAutoApply = {}));
    var CodeActionTriggerSource;
    (function (CodeActionTriggerSource) {
        CodeActionTriggerSource["Refactor"] = "refactor";
        CodeActionTriggerSource["RefactorPreview"] = "refactor preview";
        CodeActionTriggerSource["Lightbulb"] = "lightbulb";
        CodeActionTriggerSource["Default"] = "other (default)";
        CodeActionTriggerSource["SourceAction"] = "source action";
        CodeActionTriggerSource["QuickFix"] = "quick fix action";
        CodeActionTriggerSource["FixAll"] = "fix all";
        CodeActionTriggerSource["OrganizeImports"] = "organize imports";
        CodeActionTriggerSource["AutoFix"] = "auto fix";
        CodeActionTriggerSource["QuickFixHover"] = "quick fix hover window";
        CodeActionTriggerSource["OnSave"] = "save participants";
        CodeActionTriggerSource["ProblemsView"] = "problems view";
    })(CodeActionTriggerSource || (exports.CodeActionTriggerSource = CodeActionTriggerSource = {}));
    function mayIncludeActionsOfKind(filter, providedKind) {
        // A provided kind may be a subset or superset of our filtered kind.
        if (filter.include && !filter.include.intersects(providedKind)) {
            return false;
        }
        if (filter.excludes) {
            if (filter.excludes.some(exclude => excludesAction(providedKind, exclude, filter.include))) {
                return false;
            }
        }
        // Don't return source actions unless they are explicitly requested
        if (!filter.includeSourceActions && CodeActionKind.Source.contains(providedKind)) {
            return false;
        }
        return true;
    }
    exports.mayIncludeActionsOfKind = mayIncludeActionsOfKind;
    function filtersAction(filter, action) {
        const actionKind = action.kind ? new CodeActionKind(action.kind) : undefined;
        // Filter out actions by kind
        if (filter.include) {
            if (!actionKind || !filter.include.contains(actionKind)) {
                return false;
            }
        }
        if (filter.excludes) {
            if (actionKind && filter.excludes.some(exclude => excludesAction(actionKind, exclude, filter.include))) {
                return false;
            }
        }
        // Don't return source actions unless they are explicitly requested
        if (!filter.includeSourceActions) {
            if (actionKind && CodeActionKind.Source.contains(actionKind)) {
                return false;
            }
        }
        if (filter.onlyIncludePreferredActions) {
            if (!action.isPreferred) {
                return false;
            }
        }
        return true;
    }
    exports.filtersAction = filtersAction;
    function excludesAction(providedKind, exclude, include) {
        if (!exclude.contains(providedKind)) {
            return false;
        }
        if (include && exclude.contains(include)) {
            // The include is more specific, don't filter out
            return false;
        }
        return true;
    }
    class CodeActionCommandArgs {
        static fromUser(arg, defaults) {
            if (!arg || typeof arg !== 'object') {
                return new CodeActionCommandArgs(defaults.kind, defaults.apply, false);
            }
            return new CodeActionCommandArgs(CodeActionCommandArgs.getKindFromUser(arg, defaults.kind), CodeActionCommandArgs.getApplyFromUser(arg, defaults.apply), CodeActionCommandArgs.getPreferredUser(arg));
        }
        static getApplyFromUser(arg, defaultAutoApply) {
            switch (typeof arg.apply === 'string' ? arg.apply.toLowerCase() : '') {
                case 'first': return "first" /* CodeActionAutoApply.First */;
                case 'never': return "never" /* CodeActionAutoApply.Never */;
                case 'ifsingle': return "ifSingle" /* CodeActionAutoApply.IfSingle */;
                default: return defaultAutoApply;
            }
        }
        static getKindFromUser(arg, defaultKind) {
            return typeof arg.kind === 'string'
                ? new CodeActionKind(arg.kind)
                : defaultKind;
        }
        static getPreferredUser(arg) {
            return typeof arg.preferred === 'boolean'
                ? arg.preferred
                : false;
        }
        constructor(kind, apply, preferred) {
            this.kind = kind;
            this.apply = apply;
            this.preferred = preferred;
        }
    }
    exports.CodeActionCommandArgs = CodeActionCommandArgs;
    class CodeActionItem {
        constructor(action, provider) {
            this.action = action;
            this.provider = provider;
        }
        async resolve(token) {
            if (this.provider?.resolveCodeAction && !this.action.edit) {
                let action;
                try {
                    action = await this.provider.resolveCodeAction(this.action, token);
                }
                catch (err) {
                    (0, errors_1.onUnexpectedExternalError)(err);
                }
                if (action) {
                    this.action.edit = action.edit;
                }
            }
            return this;
        }
    }
    exports.CodeActionItem = CodeActionItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9jb2RlQWN0aW9uL2NvbW1vbi90eXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRaEcsTUFBYSxjQUFjO2lCQUNGLFFBQUcsR0FBRyxHQUFHLENBQUM7aUJBRVgsU0FBSSxHQUFHLElBQUksY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUMsNENBQTRDO2lCQUNuRixVQUFLLEdBQUcsSUFBSSxjQUFjLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQy9CLGFBQVEsR0FBRyxJQUFJLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztpQkFDMUMsYUFBUSxHQUFHLElBQUksY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUMxQyxvQkFBZSxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2lCQUM1RCxtQkFBYyxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUMxRCxpQkFBWSxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUN0RCxvQkFBZSxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2lCQUM1RCxhQUFRLEdBQUcsSUFBSSxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7aUJBQzFDLFdBQU0sR0FBRyxJQUFJLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDdEMsMEJBQXFCLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztpQkFDeEUsaUJBQVksR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDdEQs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