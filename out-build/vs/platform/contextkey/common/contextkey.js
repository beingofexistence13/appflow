/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/base/common/strings", "vs/platform/contextkey/common/scanner", "vs/platform/instantiation/common/instantiation", "vs/nls!vs/platform/contextkey/common/contextkey", "vs/base/common/errors"], function (require, exports, platform_1, strings_1, scanner_1, instantiation_1, nls_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$4i = exports.$3i = exports.$2i = exports.$1i = exports.$Zi = exports.$Yi = exports.$Xi = exports.$Wi = exports.$Vi = exports.$Ui = exports.$Ti = exports.$Si = exports.$Ri = exports.$Qi = exports.$Pi = exports.$Oi = exports.$Ni = exports.$Mi = exports.$Li = exports.$Ki = exports.$Ji = exports.$Ii = exports.$Hi = exports.ContextKeyExprType = exports.$Gi = void 0;
    const CONSTANT_VALUES = new Map();
    CONSTANT_VALUES.set('false', false);
    CONSTANT_VALUES.set('true', true);
    CONSTANT_VALUES.set('isMac', platform_1.$j);
    CONSTANT_VALUES.set('isLinux', platform_1.$k);
    CONSTANT_VALUES.set('isWindows', platform_1.$i);
    CONSTANT_VALUES.set('isWeb', platform_1.$o);
    CONSTANT_VALUES.set('isMacNative', platform_1.$j && !platform_1.$o);
    CONSTANT_VALUES.set('isEdge', platform_1.$G);
    CONSTANT_VALUES.set('isFirefox', platform_1.$E);
    CONSTANT_VALUES.set('isChrome', platform_1.$D);
    CONSTANT_VALUES.set('isSafari', platform_1.$F);
    /** allow register constant context keys that are known only after startup; requires running `substituteConstants` on the context key - https://github.com/microsoft/vscode/issues/174218#issuecomment-1437972127 */
    function $Gi(key, value) {
        if (CONSTANT_VALUES.get(key) !== undefined) {
            throw (0, errors_1.$5)('contextkey.setConstant(k, v) invoked with already set constant `k`');
        }
        CONSTANT_VALUES.set(key, value);
    }
    exports.$Gi = $Gi;
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    var ContextKeyExprType;
    (function (ContextKeyExprType) {
        ContextKeyExprType[ContextKeyExprType["False"] = 0] = "False";
        ContextKeyExprType[ContextKeyExprType["True"] = 1] = "True";
        ContextKeyExprType[ContextKeyExprType["Defined"] = 2] = "Defined";
        ContextKeyExprType[ContextKeyExprType["Not"] = 3] = "Not";
        ContextKeyExprType[ContextKeyExprType["Equals"] = 4] = "Equals";
        ContextKeyExprType[ContextKeyExprType["NotEquals"] = 5] = "NotEquals";
        ContextKeyExprType[ContextKeyExprType["And"] = 6] = "And";
        ContextKeyExprType[ContextKeyExprType["Regex"] = 7] = "Regex";
        ContextKeyExprType[ContextKeyExprType["NotRegex"] = 8] = "NotRegex";
        ContextKeyExprType[ContextKeyExprType["Or"] = 9] = "Or";
        ContextKeyExprType[ContextKeyExprType["In"] = 10] = "In";
        ContextKeyExprType[ContextKeyExprType["NotIn"] = 11] = "NotIn";
        ContextKeyExprType[ContextKeyExprType["Greater"] = 12] = "Greater";
        ContextKeyExprType[ContextKeyExprType["GreaterEquals"] = 13] = "GreaterEquals";
        ContextKeyExprType[ContextKeyExprType["Smaller"] = 14] = "Smaller";
        ContextKeyExprType[ContextKeyExprType["SmallerEquals"] = 15] = "SmallerEquals";
    })(ContextKeyExprType || (exports.ContextKeyExprType = ContextKeyExprType = {}));
    const defaultConfig = {
        regexParsingWithErrorRecovery: true
    };
    const errorEmptyString = (0, nls_1.localize)(0, null);
    const hintEmptyString = (0, nls_1.localize)(1, null);
    const errorNoInAfterNot = (0, nls_1.localize)(2, null);
    const errorClosingParenthesis = (0, nls_1.localize)(3, null);
    const errorUnexpectedToken = (0, nls_1.localize)(4, null);
    const hintUnexpectedToken = (0, nls_1.localize)(5, null);
    const errorUnexpectedEOF = (0, nls_1.localize)(6, null);
    const hintUnexpectedEOF = (0, nls_1.localize)(7, null);
    /**
     * A parser for context key expressions.
     *
     * Example:
     * ```ts
     * const parser = new Parser();
     * const expr = parser.parse('foo == "bar" && baz == true');
     *
     * if (expr === undefined) {
     * 	// there were lexing or parsing errors
     * 	// process lexing errors with `parser.lexingErrors`
     *  // process parsing errors with `parser.parsingErrors`
     * } else {
     * 	// expr is a valid expression
     * }
     * ```
     */
    class $Hi {
        // Note: this doesn't produce an exact syntax tree but a normalized one
        // ContextKeyExpression's that we use as AST nodes do not expose constructors that do not normalize
        static { this.c = new Error(); }
        get lexingErrors() {
            return this.d.errors;
        }
        get parsingErrors() {
            return this.h;
        }
        constructor(k = defaultConfig) {
            this.k = k;
            // lifetime note: `_scanner` lives as long as the parser does, i.e., is not reset between calls to `parse`
            this.d = new scanner_1.$Fi();
            // lifetime note: `_tokens`, `_current`, and `_parsingErrors` must be reset between calls to `parse`
            this.f = [];
            this.g = 0; // invariant: 0 <= this._current < this._tokens.length ; any incrementation of this value must first call `_isAtEnd`
            this.h = [];
            this.v = /g|y/g;
        }
        /**
         * Parse a context key expression.
         *
         * @param input the expression to parse
         * @returns the parsed expression or `undefined` if there's an error - call `lexingErrors` and `parsingErrors` to see the errors
         */
        parse(input) {
            if (input === '') {
                this.h.push({ message: errorEmptyString, offset: 0, lexeme: '', additionalInfo: hintEmptyString });
                return undefined;
            }
            this.f = this.d.reset(input).scan();
            // @ulugbekna: we do not stop parsing if there are lexing errors to be able to reconstruct regexes with unescaped slashes; TODO@ulugbekna: make this respect config option for recovery
            this.g = 0;
            this.h = [];
            try {
                const expr = this.l();
                if (!this.E()) {
                    const peek = this.D();
                    const additionalInfo = peek.type === 17 /* TokenType.Str */ ? hintUnexpectedToken : undefined;
                    this.h.push({ message: errorUnexpectedToken, offset: peek.offset, lexeme: scanner_1.$Fi.getLexeme(peek), additionalInfo });
                    throw $Hi.c;
                }
                return expr;
            }
            catch (e) {
                if (!(e === $Hi.c)) {
                    throw e;
                }
                return undefined;
            }
        }
        l() {
            return this.m();
        }
        m() {
            const expr = [this.o()];
            while (this.y(16 /* TokenType.Or */)) {
                const right = this.o();
                expr.push(right);
            }
            return expr.length === 1 ? expr[0] : $Ii.or(...expr);
        }
        o() {
            const expr = [this.s()];
            while (this.y(15 /* TokenType.And */)) {
                const right = this.s();
                expr.push(right);
            }
            return expr.length === 1 ? expr[0] : $Ii.and(...expr);
        }
        s() {
            if (this.y(2 /* TokenType.Neg */)) {
                const peek = this.D();
                switch (peek.type) {
                    case 11 /* TokenType.True */:
                        this.z();
                        return $Li.INSTANCE;
                    case 12 /* TokenType.False */:
                        this.z();
                        return $Mi.INSTANCE;
                    case 0 /* TokenType.LParen */: {
                        this.z();
                        const expr = this.l();
                        this.A(1 /* TokenType.RParen */, errorClosingParenthesis);
                        return expr?.negate();
                    }
                    case 17 /* TokenType.Str */:
                        this.z();
                        return $Si.create(peek.lexeme);
                    default:
                        throw this.B(`KEY | true | false | '(' expression ')'`, peek);
                }
            }
            return this.t();
        }
        t() {
            const peek = this.D();
            switch (peek.type) {
                case 11 /* TokenType.True */:
                    this.z();
                    return $Ii.true();
                case 12 /* TokenType.False */:
                    this.z();
                    return $Ii.false();
                case 0 /* TokenType.LParen */: {
                    this.z();
                    const expr = this.l();
                    this.A(1 /* TokenType.RParen */, errorClosingParenthesis);
                    return expr;
                }
                case 17 /* TokenType.Str */: {
                    // KEY
                    const key = peek.lexeme;
                    this.z();
                    // =~ regex
                    if (this.y(9 /* TokenType.RegexOp */)) {
                        // @ulugbekna: we need to reconstruct the regex from the tokens because some extensions use unescaped slashes in regexes
                        const expr = this.D();
                        if (!this.k.regexParsingWithErrorRecovery) {
                            this.z();
                            if (expr.type !== 10 /* TokenType.RegexStr */) {
                                throw this.B(`REGEX`, expr);
                            }
                            const regexLexeme = expr.lexeme;
                            const closingSlashIndex = regexLexeme.lastIndexOf('/');
                            const flags = closingSlashIndex === regexLexeme.length - 1 ? undefined : this.w(regexLexeme.substring(closingSlashIndex + 1));
                            let regexp;
                            try {
                                regexp = new RegExp(regexLexeme.substring(1, closingSlashIndex), flags);
                            }
                            catch (e) {
                                throw this.B(`REGEX`, expr);
                            }
                            return $Xi.create(key, regexp);
                        }
                        switch (expr.type) {
                            case 10 /* TokenType.RegexStr */:
                            case 19 /* TokenType.Error */: { // also handle an ErrorToken in case of smth such as /(/file)/
                                const lexemeReconstruction = [expr.lexeme]; // /REGEX/ or /REGEX/FLAGS
                                this.z();
                                let followingToken = this.D();
                                let parenBalance = 0;
                                for (let i = 0; i < expr.lexeme.length; i++) {
                                    if (expr.lexeme.charCodeAt(i) === 40 /* CharCode.OpenParen */) {
                                        parenBalance++;
                                    }
                                    else if (expr.lexeme.charCodeAt(i) === 41 /* CharCode.CloseParen */) {
                                        parenBalance--;
                                    }
                                }
                                while (!this.E() && followingToken.type !== 15 /* TokenType.And */ && followingToken.type !== 16 /* TokenType.Or */) {
                                    switch (followingToken.type) {
                                        case 0 /* TokenType.LParen */:
                                            parenBalance++;
                                            break;
                                        case 1 /* TokenType.RParen */:
                                            parenBalance--;
                                            break;
                                        case 10 /* TokenType.RegexStr */:
                                        case 18 /* TokenType.QuotedStr */:
                                            for (let i = 0; i < followingToken.lexeme.length; i++) {
                                                if (followingToken.lexeme.charCodeAt(i) === 40 /* CharCode.OpenParen */) {
                                                    parenBalance++;
                                                }
                                                else if (expr.lexeme.charCodeAt(i) === 41 /* CharCode.CloseParen */) {
                                                    parenBalance--;
                                                }
                                            }
                                    }
                                    if (parenBalance < 0) {
                                        break;
                                    }
                                    lexemeReconstruction.push(scanner_1.$Fi.getLexeme(followingToken));
                                    this.z();
                                    followingToken = this.D();
                                }
                                const regexLexeme = lexemeReconstruction.join('');
                                const closingSlashIndex = regexLexeme.lastIndexOf('/');
                                const flags = closingSlashIndex === regexLexeme.length - 1 ? undefined : this.w(regexLexeme.substring(closingSlashIndex + 1));
                                let regexp;
                                try {
                                    regexp = new RegExp(regexLexeme.substring(1, closingSlashIndex), flags);
                                }
                                catch (e) {
                                    throw this.B(`REGEX`, expr);
                                }
                                return $Ii.regex(key, regexp);
                            }
                            case 18 /* TokenType.QuotedStr */: {
                                const serializedValue = expr.lexeme;
                                this.z();
                                // replicate old regex parsing behavior
                                let regex = null;
                                if (!(0, strings_1.$me)(serializedValue)) {
                                    const start = serializedValue.indexOf('/');
                                    const end = serializedValue.lastIndexOf('/');
                                    if (start !== end && start >= 0) {
                                        const value = serializedValue.slice(start + 1, end);
                                        const caseIgnoreFlag = serializedValue[end + 1] === 'i' ? 'i' : '';
                                        try {
                                            regex = new RegExp(value, caseIgnoreFlag);
                                        }
                                        catch (_e) {
                                            throw this.B(`REGEX`, expr);
                                        }
                                    }
                                }
                                if (regex === null) {
                                    throw this.B('REGEX', expr);
                                }
                                return $Xi.create(key, regex);
                            }
                            default:
                                throw this.B('REGEX', this.D());
                        }
                    }
                    // [ 'not' 'in' value ]
                    if (this.y(14 /* TokenType.Not */)) {
                        this.A(13 /* TokenType.In */, errorNoInAfterNot);
                        const right = this.u();
                        return $Ii.notIn(key, right);
                    }
                    // [ ('==' | '!=' | '<' | '<=' | '>' | '>=' | 'in') value ]
                    const maybeOp = this.D().type;
                    switch (maybeOp) {
                        case 3 /* TokenType.Eq */: {
                            this.z();
                            const right = this.u();
                            if (this.x().type === 18 /* TokenType.QuotedStr */) { // to preserve old parser behavior: "foo == 'true'" is preserved as "foo == 'true'", but "foo == true" is optimized as "foo"
                                return $Ii.equals(key, right);
                            }
                            switch (right) {
                                case 'true':
                                    return $Ii.has(key);
                                case 'false':
                                    return $Ii.not(key);
                                default:
                                    return $Ii.equals(key, right);
                            }
                        }
                        case 4 /* TokenType.NotEq */: {
                            this.z();
                            const right = this.u();
                            if (this.x().type === 18 /* TokenType.QuotedStr */) { // same as above with "foo != 'true'"
                                return $Ii.notEquals(key, right);
                            }
                            switch (right) {
                                case 'true':
                                    return $Ii.not(key);
                                case 'false':
                                    return $Ii.has(key);
                                default:
                                    return $Ii.notEquals(key, right);
                            }
                        }
                        // TODO: ContextKeyExpr.smaller(key, right) accepts only `number` as `right` AND during eval of this node, we just eval to `false` if `right` is not a number
                        // consequently, package.json linter should _warn_ the user if they're passing undesired things to ops
                        case 5 /* TokenType.Lt */:
                            this.z();
                            return $Vi.create(key, this.u());
                        case 6 /* TokenType.LtEq */:
                            this.z();
                            return $Wi.create(key, this.u());
                        case 7 /* TokenType.Gt */:
                            this.z();
                            return $Ti.create(key, this.u());
                        case 8 /* TokenType.GtEq */:
                            this.z();
                            return $Ui.create(key, this.u());
                        case 13 /* TokenType.In */:
                            this.z();
                            return $Ii.in(key, this.u());
                        default:
                            return $Ii.has(key);
                    }
                }
                case 20 /* TokenType.EOF */:
                    this.h.push({ message: errorUnexpectedEOF, offset: peek.offset, lexeme: '', additionalInfo: hintUnexpectedEOF });
                    throw $Hi.c;
                default:
                    throw this.B(`true | false | KEY \n\t| KEY '=~' REGEX \n\t| KEY ('==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not' 'in') value`, this.D());
            }
        }
        u() {
            const token = this.D();
            switch (token.type) {
                case 17 /* TokenType.Str */:
                case 18 /* TokenType.QuotedStr */:
                    this.z();
                    return token.lexeme;
                case 11 /* TokenType.True */:
                    this.z();
                    return 'true';
                case 12 /* TokenType.False */:
                    this.z();
                    return 'false';
                case 13 /* TokenType.In */: // we support `in` as a value, e.g., "when": "languageId == in" - exists in existing extensions
                    this.z();
                    return 'in';
                default:
                    // this allows "when": "foo == " which's used by existing extensions
                    // we do not call `_advance` on purpose - we don't want to eat unintended tokens
                    return '';
            }
        }
        w(flags) {
            return flags.replaceAll(this.v, '');
        }
        // careful: this can throw if current token is the initial one (ie index = 0)
        x() {
            return this.f[this.g - 1];
        }
        y(token) {
            if (this.C(token)) {
                this.z();
                return true;
            }
            return false;
        }
        z() {
            if (!this.E()) {
                this.g++;
            }
            return this.x();
        }
        A(type, message) {
            if (this.C(type)) {
                return this.z();
            }
            throw this.B(message, this.D());
        }
        B(expected, got, additionalInfo) {
            const message = (0, nls_1.localize)(8, null, expected, scanner_1.$Fi.getLexeme(got));
            const offset = got.offset;
            const lexeme = scanner_1.$Fi.getLexeme(got);
            this.h.push({ message, offset, lexeme, additionalInfo });
            return $Hi.c;
        }
        C(type) {
            return this.D().type === type;
        }
        D() {
            return this.f[this.g];
        }
        E() {
            return this.D().type === 20 /* TokenType.EOF */;
        }
    }
    exports.$Hi = $Hi;
    class $Ii {
        static false() {
            return $Li.INSTANCE;
        }
        static true() {
            return $Mi.INSTANCE;
        }
        static has(key) {
            return $Ni.create(key);
        }
        static equals(key, value) {
            return $Oi.create(key, value);
        }
        static notEquals(key, value) {
            return $Ri.create(key, value);
        }
        static regex(key, value) {
            return $Xi.create(key, value);
        }
        static in(key, value) {
            return $Pi.create(key, value);
        }
        static notIn(key, value) {
            return $Qi.create(key, value);
        }
        static not(key) {
            return $Si.create(key);
        }
        static and(...expr) {
            return $Zi.create(expr, null, true);
        }
        static or(...expr) {
            return $1i.create(expr, null, true);
        }
        static greater(key, value) {
            return $Ti.create(key, value);
        }
        static greaterEquals(key, value) {
            return $Ui.create(key, value);
        }
        static smaller(key, value) {
            return $Vi.create(key, value);
        }
        static smallerEquals(key, value) {
            return $Wi.create(key, value);
        }
        static { this.c = new $Hi({ regexParsingWithErrorRecovery: false }); }
        static deserialize(serialized) {
            if (serialized === undefined || serialized === null) { // an empty string needs to be handled by the parser to get a corresponding parsing error reported
                return undefined;
            }
            const expr = this.c.parse(serialized);
            return expr;
        }
    }
    exports.$Ii = $Ii;
    function $Ji(whenClauses) {
        const parser = new $Hi({ regexParsingWithErrorRecovery: false }); // we run with no recovery to guide users to use correct regexes
        return whenClauses.map(whenClause => {
            parser.parse(whenClause);
            if (parser.lexingErrors.length > 0) {
                return parser.lexingErrors.map((se) => ({
                    errorMessage: se.additionalInfo ?
                        (0, nls_1.localize)(9, null, se.additionalInfo) :
                        (0, nls_1.localize)(10, null),
                    offset: se.offset,
                    length: se.lexeme.length,
                }));
            }
            else if (parser.parsingErrors.length > 0) {
                return parser.parsingErrors.map((pe) => ({
                    errorMessage: pe.additionalInfo ? `${pe.message}. ${pe.additionalInfo}` : pe.message,
                    offset: pe.offset,
                    length: pe.lexeme.length,
                }));
            }
            else {
                return [];
            }
        });
    }
    exports.$Ji = $Ji;
    function $Ki(a, b) {
        const aExpr = a ? a.substituteConstants() : undefined;
        const bExpr = b ? b.substituteConstants() : undefined;
        if (!aExpr && !bExpr) {
            return true;
        }
        if (!aExpr || !bExpr) {
            return false;
        }
        return aExpr.equals(bExpr);
    }
    exports.$Ki = $Ki;
    function cmp(a, b) {
        return a.cmp(b);
    }
    class $Li {
        static { this.INSTANCE = new $Li(); }
        constructor() {
            this.type = 0 /* ContextKeyExprType.False */;
        }
        cmp(other) {
            return this.type - other.type;
        }
        equals(other) {
            return (other.type === this.type);
        }
        substituteConstants() {
            return this;
        }
        evaluate(context) {
            return false;
        }
        serialize() {
            return 'false';
        }
        keys() {
            return [];
        }
        map(mapFnc) {
            return this;
        }
        negate() {
            return $Mi.INSTANCE;
        }
    }
    exports.$Li = $Li;
    class $Mi {
        static { this.INSTANCE = new $Mi(); }
        constructor() {
            this.type = 1 /* ContextKeyExprType.True */;
        }
        cmp(other) {
            return this.type - other.type;
        }
        equals(other) {
            return (other.type === this.type);
        }
        substituteConstants() {
            return this;
        }
        evaluate(context) {
            return true;
        }
        serialize() {
            return 'true';
        }
        keys() {
            return [];
        }
        map(mapFnc) {
            return this;
        }
        negate() {
            return $Li.INSTANCE;
        }
    }
    exports.$Mi = $Mi;
    class $Ni {
        static create(key, negated = null) {
            const constantValue = CONSTANT_VALUES.get(key);
            if (typeof constantValue === 'boolean') {
                return constantValue ? $Mi.INSTANCE : $Li.INSTANCE;
            }
            return new $Ni(key, negated);
        }
        constructor(key, c) {
            this.key = key;
            this.c = c;
            this.type = 2 /* ContextKeyExprType.Defined */;
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            return cmp1(this.key, other.key);
        }
        equals(other) {
            if (other.type === this.type) {
                return (this.key === other.key);
            }
            return false;
        }
        substituteConstants() {
            const constantValue = CONSTANT_VALUES.get(this.key);
            if (typeof constantValue === 'boolean') {
                return constantValue ? $Mi.INSTANCE : $Li.INSTANCE;
            }
            return this;
        }
        evaluate(context) {
            return (!!context.getValue(this.key));
        }
        serialize() {
            return this.key;
        }
        keys() {
            return [this.key];
        }
        map(mapFnc) {
            return mapFnc.mapDefined(this.key);
        }
        negate() {
            if (!this.c) {
                this.c = $Si.create(this.key, this);
            }
            return this.c;
        }
    }
    exports.$Ni = $Ni;
    class $Oi {
        static create(key, value, negated = null) {
            if (typeof value === 'boolean') {
                return (value ? $Ni.create(key, negated) : $Si.create(key, negated));
            }
            const constantValue = CONSTANT_VALUES.get(key);
            if (typeof constantValue === 'boolean') {
                const trueValue = constantValue ? 'true' : 'false';
                return (value === trueValue ? $Mi.INSTANCE : $Li.INSTANCE);
            }
            return new $Oi(key, value, negated);
        }
        constructor(c, d, f) {
            this.c = c;
            this.d = d;
            this.f = f;
            this.type = 4 /* ContextKeyExprType.Equals */;
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            return cmp2(this.c, this.d, other.c, other.d);
        }
        equals(other) {
            if (other.type === this.type) {
                return (this.c === other.c && this.d === other.d);
            }
            return false;
        }
        substituteConstants() {
            const constantValue = CONSTANT_VALUES.get(this.c);
            if (typeof constantValue === 'boolean') {
                const trueValue = constantValue ? 'true' : 'false';
                return (this.d === trueValue ? $Mi.INSTANCE : $Li.INSTANCE);
            }
            return this;
        }
        evaluate(context) {
            // Intentional ==
            // eslint-disable-next-line eqeqeq
            return (context.getValue(this.c) == this.d);
        }
        serialize() {
            return `${this.c} == '${this.d}'`;
        }
        keys() {
            return [this.c];
        }
        map(mapFnc) {
            return mapFnc.mapEquals(this.c, this.d);
        }
        negate() {
            if (!this.f) {
                this.f = $Ri.create(this.c, this.d, this);
            }
            return this.f;
        }
    }
    exports.$Oi = $Oi;
    class $Pi {
        static create(key, valueKey) {
            return new $Pi(key, valueKey);
        }
        constructor(d, f) {
            this.d = d;
            this.f = f;
            this.type = 10 /* ContextKeyExprType.In */;
            this.c = null;
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            return cmp2(this.d, this.f, other.d, other.f);
        }
        equals(other) {
            if (other.type === this.type) {
                return (this.d === other.d && this.f === other.f);
            }
            return false;
        }
        substituteConstants() {
            return this;
        }
        evaluate(context) {
            const source = context.getValue(this.f);
            const item = context.getValue(this.d);
            if (Array.isArray(source)) {
                return source.includes(item);
            }
            if (typeof item === 'string' && typeof source === 'object' && source !== null) {
                return hasOwnProperty.call(source, item);
            }
            return false;
        }
        serialize() {
            return `${this.d} in '${this.f}'`;
        }
        keys() {
            return [this.d, this.f];
        }
        map(mapFnc) {
            return mapFnc.mapIn(this.d, this.f);
        }
        negate() {
            if (!this.c) {
                this.c = $Qi.create(this.d, this.f);
            }
            return this.c;
        }
    }
    exports.$Pi = $Pi;
    class $Qi {
        static create(key, valueKey) {
            return new $Qi(key, valueKey);
        }
        constructor(d, f) {
            this.d = d;
            this.f = f;
            this.type = 11 /* ContextKeyExprType.NotIn */;
            this.c = $Pi.create(d, f);
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            return this.c.cmp(other.c);
        }
        equals(other) {
            if (other.type === this.type) {
                return this.c.equals(other.c);
            }
            return false;
        }
        substituteConstants() {
            return this;
        }
        evaluate(context) {
            return !this.c.evaluate(context);
        }
        serialize() {
            return `${this.d} not in '${this.f}'`;
        }
        keys() {
            return this.c.keys();
        }
        map(mapFnc) {
            return mapFnc.mapNotIn(this.d, this.f);
        }
        negate() {
            return this.c;
        }
    }
    exports.$Qi = $Qi;
    class $Ri {
        static create(key, value, negated = null) {
            if (typeof value === 'boolean') {
                if (value) {
                    return $Si.create(key, negated);
                }
                return $Ni.create(key, negated);
            }
            const constantValue = CONSTANT_VALUES.get(key);
            if (typeof constantValue === 'boolean') {
                const falseValue = constantValue ? 'true' : 'false';
                return (value === falseValue ? $Li.INSTANCE : $Mi.INSTANCE);
            }
            return new $Ri(key, value, negated);
        }
        constructor(c, d, f) {
            this.c = c;
            this.d = d;
            this.f = f;
            this.type = 5 /* ContextKeyExprType.NotEquals */;
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            return cmp2(this.c, this.d, other.c, other.d);
        }
        equals(other) {
            if (other.type === this.type) {
                return (this.c === other.c && this.d === other.d);
            }
            return false;
        }
        substituteConstants() {
            const constantValue = CONSTANT_VALUES.get(this.c);
            if (typeof constantValue === 'boolean') {
                const falseValue = constantValue ? 'true' : 'false';
                return (this.d === falseValue ? $Li.INSTANCE : $Mi.INSTANCE);
            }
            return this;
        }
        evaluate(context) {
            // Intentional !=
            // eslint-disable-next-line eqeqeq
            return (context.getValue(this.c) != this.d);
        }
        serialize() {
            return `${this.c} != '${this.d}'`;
        }
        keys() {
            return [this.c];
        }
        map(mapFnc) {
            return mapFnc.mapNotEquals(this.c, this.d);
        }
        negate() {
            if (!this.f) {
                this.f = $Oi.create(this.c, this.d, this);
            }
            return this.f;
        }
    }
    exports.$Ri = $Ri;
    class $Si {
        static create(key, negated = null) {
            const constantValue = CONSTANT_VALUES.get(key);
            if (typeof constantValue === 'boolean') {
                return (constantValue ? $Li.INSTANCE : $Mi.INSTANCE);
            }
            return new $Si(key, negated);
        }
        constructor(c, d) {
            this.c = c;
            this.d = d;
            this.type = 3 /* ContextKeyExprType.Not */;
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            return cmp1(this.c, other.c);
        }
        equals(other) {
            if (other.type === this.type) {
                return (this.c === other.c);
            }
            return false;
        }
        substituteConstants() {
            const constantValue = CONSTANT_VALUES.get(this.c);
            if (typeof constantValue === 'boolean') {
                return (constantValue ? $Li.INSTANCE : $Mi.INSTANCE);
            }
            return this;
        }
        evaluate(context) {
            return (!context.getValue(this.c));
        }
        serialize() {
            return `!${this.c}`;
        }
        keys() {
            return [this.c];
        }
        map(mapFnc) {
            return mapFnc.mapNot(this.c);
        }
        negate() {
            if (!this.d) {
                this.d = $Ni.create(this.c, this);
            }
            return this.d;
        }
    }
    exports.$Si = $Si;
    function withFloatOrStr(value, callback) {
        if (typeof value === 'string') {
            const n = parseFloat(value);
            if (!isNaN(n)) {
                value = n;
            }
        }
        if (typeof value === 'string' || typeof value === 'number') {
            return callback(value);
        }
        return $Li.INSTANCE;
    }
    class $Ti {
        static create(key, _value, negated = null) {
            return withFloatOrStr(_value, (value) => new $Ti(key, value, negated));
        }
        constructor(c, d, f) {
            this.c = c;
            this.d = d;
            this.f = f;
            this.type = 12 /* ContextKeyExprType.Greater */;
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            return cmp2(this.c, this.d, other.c, other.d);
        }
        equals(other) {
            if (other.type === this.type) {
                return (this.c === other.c && this.d === other.d);
            }
            return false;
        }
        substituteConstants() {
            return this;
        }
        evaluate(context) {
            if (typeof this.d === 'string') {
                return false;
            }
            return (parseFloat(context.getValue(this.c)) > this.d);
        }
        serialize() {
            return `${this.c} > ${this.d}`;
        }
        keys() {
            return [this.c];
        }
        map(mapFnc) {
            return mapFnc.mapGreater(this.c, this.d);
        }
        negate() {
            if (!this.f) {
                this.f = $Wi.create(this.c, this.d, this);
            }
            return this.f;
        }
    }
    exports.$Ti = $Ti;
    class $Ui {
        static create(key, _value, negated = null) {
            return withFloatOrStr(_value, (value) => new $Ui(key, value, negated));
        }
        constructor(c, d, f) {
            this.c = c;
            this.d = d;
            this.f = f;
            this.type = 13 /* ContextKeyExprType.GreaterEquals */;
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            return cmp2(this.c, this.d, other.c, other.d);
        }
        equals(other) {
            if (other.type === this.type) {
                return (this.c === other.c && this.d === other.d);
            }
            return false;
        }
        substituteConstants() {
            return this;
        }
        evaluate(context) {
            if (typeof this.d === 'string') {
                return false;
            }
            return (parseFloat(context.getValue(this.c)) >= this.d);
        }
        serialize() {
            return `${this.c} >= ${this.d}`;
        }
        keys() {
            return [this.c];
        }
        map(mapFnc) {
            return mapFnc.mapGreaterEquals(this.c, this.d);
        }
        negate() {
            if (!this.f) {
                this.f = $Vi.create(this.c, this.d, this);
            }
            return this.f;
        }
    }
    exports.$Ui = $Ui;
    class $Vi {
        static create(key, _value, negated = null) {
            return withFloatOrStr(_value, (value) => new $Vi(key, value, negated));
        }
        constructor(c, d, f) {
            this.c = c;
            this.d = d;
            this.f = f;
            this.type = 14 /* ContextKeyExprType.Smaller */;
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            return cmp2(this.c, this.d, other.c, other.d);
        }
        equals(other) {
            if (other.type === this.type) {
                return (this.c === other.c && this.d === other.d);
            }
            return false;
        }
        substituteConstants() {
            return this;
        }
        evaluate(context) {
            if (typeof this.d === 'string') {
                return false;
            }
            return (parseFloat(context.getValue(this.c)) < this.d);
        }
        serialize() {
            return `${this.c} < ${this.d}`;
        }
        keys() {
            return [this.c];
        }
        map(mapFnc) {
            return mapFnc.mapSmaller(this.c, this.d);
        }
        negate() {
            if (!this.f) {
                this.f = $Ui.create(this.c, this.d, this);
            }
            return this.f;
        }
    }
    exports.$Vi = $Vi;
    class $Wi {
        static create(key, _value, negated = null) {
            return withFloatOrStr(_value, (value) => new $Wi(key, value, negated));
        }
        constructor(c, d, f) {
            this.c = c;
            this.d = d;
            this.f = f;
            this.type = 15 /* ContextKeyExprType.SmallerEquals */;
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            return cmp2(this.c, this.d, other.c, other.d);
        }
        equals(other) {
            if (other.type === this.type) {
                return (this.c === other.c && this.d === other.d);
            }
            return false;
        }
        substituteConstants() {
            return this;
        }
        evaluate(context) {
            if (typeof this.d === 'string') {
                return false;
            }
            return (parseFloat(context.getValue(this.c)) <= this.d);
        }
        serialize() {
            return `${this.c} <= ${this.d}`;
        }
        keys() {
            return [this.c];
        }
        map(mapFnc) {
            return mapFnc.mapSmallerEquals(this.c, this.d);
        }
        negate() {
            if (!this.f) {
                this.f = $Ti.create(this.c, this.d, this);
            }
            return this.f;
        }
    }
    exports.$Wi = $Wi;
    class $Xi {
        static create(key, regexp) {
            return new $Xi(key, regexp);
        }
        constructor(d, f) {
            this.d = d;
            this.f = f;
            this.type = 7 /* ContextKeyExprType.Regex */;
            this.c = null;
            //
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            if (this.d < other.d) {
                return -1;
            }
            if (this.d > other.d) {
                return 1;
            }
            const thisSource = this.f ? this.f.source : '';
            const otherSource = other.f ? other.f.source : '';
            if (thisSource < otherSource) {
                return -1;
            }
            if (thisSource > otherSource) {
                return 1;
            }
            return 0;
        }
        equals(other) {
            if (other.type === this.type) {
                const thisSource = this.f ? this.f.source : '';
                const otherSource = other.f ? other.f.source : '';
                return (this.d === other.d && thisSource === otherSource);
            }
            return false;
        }
        substituteConstants() {
            return this;
        }
        evaluate(context) {
            const value = context.getValue(this.d);
            return this.f ? this.f.test(value) : false;
        }
        serialize() {
            const value = this.f
                ? `/${this.f.source}/${this.f.flags}`
                : '/invalid/';
            return `${this.d} =~ ${value}`;
        }
        keys() {
            return [this.d];
        }
        map(mapFnc) {
            return mapFnc.mapRegex(this.d, this.f);
        }
        negate() {
            if (!this.c) {
                this.c = $Yi.create(this);
            }
            return this.c;
        }
    }
    exports.$Xi = $Xi;
    class $Yi {
        static create(actual) {
            return new $Yi(actual);
        }
        constructor(c) {
            this.c = c;
            this.type = 8 /* ContextKeyExprType.NotRegex */;
            //
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            return this.c.cmp(other.c);
        }
        equals(other) {
            if (other.type === this.type) {
                return this.c.equals(other.c);
            }
            return false;
        }
        substituteConstants() {
            return this;
        }
        evaluate(context) {
            return !this.c.evaluate(context);
        }
        serialize() {
            return `!(${this.c.serialize()})`;
        }
        keys() {
            return this.c.keys();
        }
        map(mapFnc) {
            return new $Yi(this.c.map(mapFnc));
        }
        negate() {
            return this.c;
        }
    }
    exports.$Yi = $Yi;
    /**
     * @returns the same instance if nothing changed.
     */
    function eliminateConstantsInArray(arr) {
        // Allocate array only if there is a difference
        let newArr = null;
        for (let i = 0, len = arr.length; i < len; i++) {
            const newExpr = arr[i].substituteConstants();
            if (arr[i] !== newExpr) {
                // something has changed!
                // allocate array on first difference
                if (newArr === null) {
                    newArr = [];
                    for (let j = 0; j < i; j++) {
                        newArr[j] = arr[j];
                    }
                }
            }
            if (newArr !== null) {
                newArr[i] = newExpr;
            }
        }
        if (newArr === null) {
            return arr;
        }
        return newArr;
    }
    class $Zi {
        static create(_expr, negated, extraRedundantCheck) {
            return $Zi.d(_expr, negated, extraRedundantCheck);
        }
        constructor(expr, c) {
            this.expr = expr;
            this.c = c;
            this.type = 6 /* ContextKeyExprType.And */;
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            if (this.expr.length < other.expr.length) {
                return -1;
            }
            if (this.expr.length > other.expr.length) {
                return 1;
            }
            for (let i = 0, len = this.expr.length; i < len; i++) {
                const r = cmp(this.expr[i], other.expr[i]);
                if (r !== 0) {
                    return r;
                }
            }
            return 0;
        }
        equals(other) {
            if (other.type === this.type) {
                if (this.expr.length !== other.expr.length) {
                    return false;
                }
                for (let i = 0, len = this.expr.length; i < len; i++) {
                    if (!this.expr[i].equals(other.expr[i])) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }
        substituteConstants() {
            const exprArr = eliminateConstantsInArray(this.expr);
            if (exprArr === this.expr) {
                // no change
                return this;
            }
            return $Zi.create(exprArr, this.c, false);
        }
        evaluate(context) {
            for (let i = 0, len = this.expr.length; i < len; i++) {
                if (!this.expr[i].evaluate(context)) {
                    return false;
                }
            }
            return true;
        }
        static d(arr, negated, extraRedundantCheck) {
            const expr = [];
            let hasTrue = false;
            for (const e of arr) {
                if (!e) {
                    continue;
                }
                if (e.type === 1 /* ContextKeyExprType.True */) {
                    // anything && true ==> anything
                    hasTrue = true;
                    continue;
                }
                if (e.type === 0 /* ContextKeyExprType.False */) {
                    // anything && false ==> false
                    return $Li.INSTANCE;
                }
                if (e.type === 6 /* ContextKeyExprType.And */) {
                    expr.push(...e.expr);
                    continue;
                }
                expr.push(e);
            }
            if (expr.length === 0 && hasTrue) {
                return $Mi.INSTANCE;
            }
            if (expr.length === 0) {
                return undefined;
            }
            if (expr.length === 1) {
                return expr[0];
            }
            expr.sort(cmp);
            // eliminate duplicate terms
            for (let i = 1; i < expr.length; i++) {
                if (expr[i - 1].equals(expr[i])) {
                    expr.splice(i, 1);
                    i--;
                }
            }
            if (expr.length === 1) {
                return expr[0];
            }
            // We must distribute any OR expression because we don't support parens
            // OR extensions will be at the end (due to sorting rules)
            while (expr.length > 1) {
                const lastElement = expr[expr.length - 1];
                if (lastElement.type !== 9 /* ContextKeyExprType.Or */) {
                    break;
                }
                // pop the last element
                expr.pop();
                // pop the second to last element
                const secondToLastElement = expr.pop();
                const isFinished = (expr.length === 0);
                // distribute `lastElement` over `secondToLastElement`
                const resultElement = $1i.create(lastElement.expr.map(el => $Zi.create([el, secondToLastElement], null, extraRedundantCheck)), null, isFinished);
                if (resultElement) {
                    expr.push(resultElement);
                    expr.sort(cmp);
                }
            }
            if (expr.length === 1) {
                return expr[0];
            }
            // resolve false AND expressions
            if (extraRedundantCheck) {
                for (let i = 0; i < expr.length; i++) {
                    for (let j = i + 1; j < expr.length; j++) {
                        if (expr[i].negate().equals(expr[j])) {
                            // A && !A case
                            return $Li.INSTANCE;
                        }
                    }
                }
                if (expr.length === 1) {
                    return expr[0];
                }
            }
            return new $Zi(expr, negated);
        }
        serialize() {
            return this.expr.map(e => e.serialize()).join(' && ');
        }
        keys() {
            const result = [];
            for (const expr of this.expr) {
                result.push(...expr.keys());
            }
            return result;
        }
        map(mapFnc) {
            return new $Zi(this.expr.map(expr => expr.map(mapFnc)), null);
        }
        negate() {
            if (!this.c) {
                const result = [];
                for (const expr of this.expr) {
                    result.push(expr.negate());
                }
                this.c = $1i.create(result, this, true);
            }
            return this.c;
        }
    }
    exports.$Zi = $Zi;
    class $1i {
        static create(_expr, negated, extraRedundantCheck) {
            return $1i.d(_expr, negated, extraRedundantCheck);
        }
        constructor(expr, c) {
            this.expr = expr;
            this.c = c;
            this.type = 9 /* ContextKeyExprType.Or */;
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            if (this.expr.length < other.expr.length) {
                return -1;
            }
            if (this.expr.length > other.expr.length) {
                return 1;
            }
            for (let i = 0, len = this.expr.length; i < len; i++) {
                const r = cmp(this.expr[i], other.expr[i]);
                if (r !== 0) {
                    return r;
                }
            }
            return 0;
        }
        equals(other) {
            if (other.type === this.type) {
                if (this.expr.length !== other.expr.length) {
                    return false;
                }
                for (let i = 0, len = this.expr.length; i < len; i++) {
                    if (!this.expr[i].equals(other.expr[i])) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }
        substituteConstants() {
            const exprArr = eliminateConstantsInArray(this.expr);
            if (exprArr === this.expr) {
                // no change
                return this;
            }
            return $1i.create(exprArr, this.c, false);
        }
        evaluate(context) {
            for (let i = 0, len = this.expr.length; i < len; i++) {
                if (this.expr[i].evaluate(context)) {
                    return true;
                }
            }
            return false;
        }
        static d(arr, negated, extraRedundantCheck) {
            let expr = [];
            let hasFalse = false;
            if (arr) {
                for (let i = 0, len = arr.length; i < len; i++) {
                    const e = arr[i];
                    if (!e) {
                        continue;
                    }
                    if (e.type === 0 /* ContextKeyExprType.False */) {
                        // anything || false ==> anything
                        hasFalse = true;
                        continue;
                    }
                    if (e.type === 1 /* ContextKeyExprType.True */) {
                        // anything || true ==> true
                        return $Mi.INSTANCE;
                    }
                    if (e.type === 9 /* ContextKeyExprType.Or */) {
                        expr = expr.concat(e.expr);
                        continue;
                    }
                    expr.push(e);
                }
                if (expr.length === 0 && hasFalse) {
                    return $Li.INSTANCE;
                }
                expr.sort(cmp);
            }
            if (expr.length === 0) {
                return undefined;
            }
            if (expr.length === 1) {
                return expr[0];
            }
            // eliminate duplicate terms
            for (let i = 1; i < expr.length; i++) {
                if (expr[i - 1].equals(expr[i])) {
                    expr.splice(i, 1);
                    i--;
                }
            }
            if (expr.length === 1) {
                return expr[0];
            }
            // resolve true OR expressions
            if (extraRedundantCheck) {
                for (let i = 0; i < expr.length; i++) {
                    for (let j = i + 1; j < expr.length; j++) {
                        if (expr[i].negate().equals(expr[j])) {
                            // A || !A case
                            return $Mi.INSTANCE;
                        }
                    }
                }
                if (expr.length === 1) {
                    return expr[0];
                }
            }
            return new $1i(expr, negated);
        }
        serialize() {
            return this.expr.map(e => e.serialize()).join(' || ');
        }
        keys() {
            const result = [];
            for (const expr of this.expr) {
                result.push(...expr.keys());
            }
            return result;
        }
        map(mapFnc) {
            return new $1i(this.expr.map(expr => expr.map(mapFnc)), null);
        }
        negate() {
            if (!this.c) {
                const result = [];
                for (const expr of this.expr) {
                    result.push(expr.negate());
                }
                // We don't support parens, so here we distribute the AND over the OR terminals
                // We always take the first 2 AND pairs and distribute them
                while (result.length > 1) {
                    const LEFT = result.shift();
                    const RIGHT = result.shift();
                    const all = [];
                    for (const left of getTerminals(LEFT)) {
                        for (const right of getTerminals(RIGHT)) {
                            all.push($Zi.create([left, right], null, false));
                        }
                    }
                    result.unshift($1i.create(all, null, false));
                }
                this.c = $1i.create(result, this, true);
            }
            return this.c;
        }
    }
    exports.$1i = $1i;
    class $2i extends $Ni {
        static { this.d = []; }
        static all() {
            return $2i.d.values();
        }
        constructor(key, defaultValue, metaOrHide) {
            super(key, null);
            this.f = defaultValue;
            // collect all context keys into a central place
            if (typeof metaOrHide === 'object') {
                $2i.d.push({ ...metaOrHide, key });
            }
            else if (metaOrHide !== true) {
                $2i.d.push({ key, description: metaOrHide, type: defaultValue !== null && defaultValue !== undefined ? typeof defaultValue : undefined });
            }
        }
        bindTo(target) {
            return target.createKey(this.key, this.f);
        }
        getValue(target) {
            return target.getContextKeyValue(this.key);
        }
        toNegated() {
            return this.negate();
        }
        isEqualTo(value) {
            return $Oi.create(this.key, value);
        }
        notEqualsTo(value) {
            return $Ri.create(this.key, value);
        }
    }
    exports.$2i = $2i;
    exports.$3i = (0, instantiation_1.$Bh)('contextKeyService');
    function cmp1(key1, key2) {
        if (key1 < key2) {
            return -1;
        }
        if (key1 > key2) {
            return 1;
        }
        return 0;
    }
    function cmp2(key1, value1, key2, value2) {
        if (key1 < key2) {
            return -1;
        }
        if (key1 > key2) {
            return 1;
        }
        if (value1 < value2) {
            return -1;
        }
        if (value1 > value2) {
            return 1;
        }
        return 0;
    }
    /**
     * Returns true if it is provable `p` implies `q`.
     */
    function $4i(p, q) {
        if (p.type === 0 /* ContextKeyExprType.False */ || q.type === 1 /* ContextKeyExprType.True */) {
            // false implies anything
            // anything implies true
            return true;
        }
        if (p.type === 9 /* ContextKeyExprType.Or */) {
            if (q.type === 9 /* ContextKeyExprType.Or */) {
                // `a || b || c` can only imply something like `a || b || c || d`
                return allElementsIncluded(p.expr, q.expr);
            }
            return false;
        }
        if (q.type === 9 /* ContextKeyExprType.Or */) {
            for (const element of q.expr) {
                if ($4i(p, element)) {
                    return true;
                }
            }
            return false;
        }
        if (p.type === 6 /* ContextKeyExprType.And */) {
            if (q.type === 6 /* ContextKeyExprType.And */) {
                // `a && b && c` implies `a && c`
                return allElementsIncluded(q.expr, p.expr);
            }
            for (const element of p.expr) {
                if ($4i(element, q)) {
                    return true;
                }
            }
            return false;
        }
        return p.equals(q);
    }
    exports.$4i = $4i;
    /**
     * Returns true if all elements in `p` are also present in `q`.
     * The two arrays are assumed to be sorted
     */
    function allElementsIncluded(p, q) {
        let pIndex = 0;
        let qIndex = 0;
        while (pIndex < p.length && qIndex < q.length) {
            const cmp = p[pIndex].cmp(q[qIndex]);
            if (cmp < 0) {
                // an element from `p` is missing from `q`
                return false;
            }
            else if (cmp === 0) {
                pIndex++;
                qIndex++;
            }
            else {
                qIndex++;
            }
        }
        return (pIndex === p.length);
    }
    function getTerminals(node) {
        if (node.type === 9 /* ContextKeyExprType.Or */) {
            return node.expr;
        }
        return [node];
    }
});
//# sourceMappingURL=contextkey.js.map