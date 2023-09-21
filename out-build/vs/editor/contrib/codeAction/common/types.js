/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors"], function (require, exports, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$z1 = exports.$y1 = exports.$x1 = exports.$w1 = exports.CodeActionTriggerSource = exports.CodeActionAutoApply = exports.$v1 = void 0;
    class $v1 {
        static { this.a = '.'; }
        static { this.None = new $v1('@@none@@'); } // Special code action that contains nothing
        static { this.Empty = new $v1(''); }
        static { this.QuickFix = new $v1('quickfix'); }
        static { this.Refactor = new $v1('refactor'); }
        static { this.RefactorExtract = $v1.Refactor.append('extract'); }
        static { this.RefactorInline = $v1.Refactor.append('inline'); }
        static { this.RefactorMove = $v1.Refactor.append('move'); }
        static { this.RefactorRewrite = $v1.Refactor.append('rewrite'); }
        static { this.Notebook = new $v1('notebook'); }
        static { this.Source = new $v1('source'); }
        static { this.SourceOrganizeImports = $v1.Source.append('organizeImports'); }
        static { this.SourceFixAll = $v1.Source.append('fixAll'); }
        static { this.SurroundWith = $v1.Refactor.append('surround'); }
        constructor(value) {
            this.value = value;
        }
        equals(other) {
            return this.value === other.value;
        }
        contains(other) {
            return this.equals(other) || this.value === '' || other.value.startsWith(this.value + $v1.a);
        }
        intersects(other) {
            return this.contains(other) || other.contains(this);
        }
        append(part) {
            return new $v1(this.value + $v1.a + part);
        }
    }
    exports.$v1 = $v1;
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
    function $w1(filter, providedKind) {
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
        if (!filter.includeSourceActions && $v1.Source.contains(providedKind)) {
            return false;
        }
        return true;
    }
    exports.$w1 = $w1;
    function $x1(filter, action) {
        const actionKind = action.kind ? new $v1(action.kind) : undefined;
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
            if (actionKind && $v1.Source.contains(actionKind)) {
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
    exports.$x1 = $x1;
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
    class $y1 {
        static fromUser(arg, defaults) {
            if (!arg || typeof arg !== 'object') {
                return new $y1(defaults.kind, defaults.apply, false);
            }
            return new $y1($y1.b(arg, defaults.kind), $y1.a(arg, defaults.apply), $y1.c(arg));
        }
        static a(arg, defaultAutoApply) {
            switch (typeof arg.apply === 'string' ? arg.apply.toLowerCase() : '') {
                case 'first': return "first" /* CodeActionAutoApply.First */;
                case 'never': return "never" /* CodeActionAutoApply.Never */;
                case 'ifsingle': return "ifSingle" /* CodeActionAutoApply.IfSingle */;
                default: return defaultAutoApply;
            }
        }
        static b(arg, defaultKind) {
            return typeof arg.kind === 'string'
                ? new $v1(arg.kind)
                : defaultKind;
        }
        static c(arg) {
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
    exports.$y1 = $y1;
    class $z1 {
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
                    (0, errors_1.$Z)(err);
                }
                if (action) {
                    this.action.edit = action.edit;
                }
            }
            return this;
        }
    }
    exports.$z1 = $z1;
});
//# sourceMappingURL=types.js.map