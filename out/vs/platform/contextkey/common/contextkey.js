/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/base/common/strings", "vs/platform/contextkey/common/scanner", "vs/platform/instantiation/common/instantiation", "vs/nls", "vs/base/common/errors"], function (require, exports, platform_1, strings_1, scanner_1, instantiation_1, nls_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.implies = exports.IContextKeyService = exports.RawContextKey = exports.ContextKeyOrExpr = exports.ContextKeyAndExpr = exports.ContextKeyNotRegexExpr = exports.ContextKeyRegexExpr = exports.ContextKeySmallerEqualsExpr = exports.ContextKeySmallerExpr = exports.ContextKeyGreaterEqualsExpr = exports.ContextKeyGreaterExpr = exports.ContextKeyNotExpr = exports.ContextKeyNotEqualsExpr = exports.ContextKeyNotInExpr = exports.ContextKeyInExpr = exports.ContextKeyEqualsExpr = exports.ContextKeyDefinedExpr = exports.ContextKeyTrueExpr = exports.ContextKeyFalseExpr = exports.expressionsAreEqualWithConstantSubstitution = exports.validateWhenClauses = exports.ContextKeyExpr = exports.Parser = exports.ContextKeyExprType = exports.setConstant = void 0;
    const CONSTANT_VALUES = new Map();
    CONSTANT_VALUES.set('false', false);
    CONSTANT_VALUES.set('true', true);
    CONSTANT_VALUES.set('isMac', platform_1.isMacintosh);
    CONSTANT_VALUES.set('isLinux', platform_1.isLinux);
    CONSTANT_VALUES.set('isWindows', platform_1.isWindows);
    CONSTANT_VALUES.set('isWeb', platform_1.isWeb);
    CONSTANT_VALUES.set('isMacNative', platform_1.isMacintosh && !platform_1.isWeb);
    CONSTANT_VALUES.set('isEdge', platform_1.isEdge);
    CONSTANT_VALUES.set('isFirefox', platform_1.isFirefox);
    CONSTANT_VALUES.set('isChrome', platform_1.isChrome);
    CONSTANT_VALUES.set('isSafari', platform_1.isSafari);
    /** allow register constant context keys that are known only after startup; requires running `substituteConstants` on the context key - https://github.com/microsoft/vscode/issues/174218#issuecomment-1437972127 */
    function setConstant(key, value) {
        if (CONSTANT_VALUES.get(key) !== undefined) {
            throw (0, errors_1.illegalArgument)('contextkey.setConstant(k, v) invoked with already set constant `k`');
        }
        CONSTANT_VALUES.set(key, value);
    }
    exports.setConstant = setConstant;
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
    const errorEmptyString = (0, nls_1.localize)('contextkey.parser.error.emptyString', "Empty context key expression");
    const hintEmptyString = (0, nls_1.localize)('contextkey.parser.error.emptyString.hint', "Did you forget to write an expression? You can also put 'false' or 'true' to always evaluate to false or true, respectively.");
    const errorNoInAfterNot = (0, nls_1.localize)('contextkey.parser.error.noInAfterNot', "'in' after 'not'.");
    const errorClosingParenthesis = (0, nls_1.localize)('contextkey.parser.error.closingParenthesis', "closing parenthesis ')'");
    const errorUnexpectedToken = (0, nls_1.localize)('contextkey.parser.error.unexpectedToken', "Unexpected token");
    const hintUnexpectedToken = (0, nls_1.localize)('contextkey.parser.error.unexpectedToken.hint', "Did you forget to put && or || before the token?");
    const errorUnexpectedEOF = (0, nls_1.localize)('contextkey.parser.error.unexpectedEOF', "Unexpected end of expression");
    const hintUnexpectedEOF = (0, nls_1.localize)('contextkey.parser.error.unexpectedEOF.hint', "Did you forget to put a context key?");
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
    class Parser {
        // Note: this doesn't produce an exact syntax tree but a normalized one
        // ContextKeyExpression's that we use as AST nodes do not expose constructors that do not normalize
        static { this._parseError = new Error(); }
        get lexingErrors() {
            return this._scanner.errors;
        }
        get parsingErrors() {
            return this._parsingErrors;
        }
        constructor(_config = defaultConfig) {
            this._config = _config;
            // lifetime note: `_scanner` lives as long as the parser does, i.e., is not reset between calls to `parse`
            this._scanner = new scanner_1.Scanner();
            // lifetime note: `_tokens`, `_current`, and `_parsingErrors` must be reset between calls to `parse`
            this._tokens = [];
            this._current = 0; // invariant: 0 <= this._current < this._tokens.length ; any incrementation of this value must first call `_isAtEnd`
            this._parsingErrors = [];
            this._flagsGYRe = /g|y/g;
        }
        /**
         * Parse a context key expression.
         *
         * @param input the expression to parse
         * @returns the parsed expression or `undefined` if there's an error - call `lexingErrors` and `parsingErrors` to see the errors
         */
        parse(input) {
            if (input === '') {
                this._parsingErrors.push({ message: errorEmptyString, offset: 0, lexeme: '', additionalInfo: hintEmptyString });
                return undefined;
            }
            this._tokens = this._scanner.reset(input).scan();
            // @ulugbekna: we do not stop parsing if there are lexing errors to be able to reconstruct regexes with unescaped slashes; TODO@ulugbekna: make this respect config option for recovery
            this._current = 0;
            this._parsingErrors = [];
            try {
                const expr = this._expr();
                if (!this._isAtEnd()) {
                    const peek = this._peek();
                    const additionalInfo = peek.type === 17 /* TokenType.Str */ ? hintUnexpectedToken : undefined;
                    this._parsingErrors.push({ message: errorUnexpectedToken, offset: peek.offset, lexeme: scanner_1.Scanner.getLexeme(peek), additionalInfo });
                    throw Parser._parseError;
                }
                return expr;
            }
            catch (e) {
                if (!(e === Parser._parseError)) {
                    throw e;
                }
                return undefined;
            }
        }
        _expr() {
            return this._or();
        }
        _or() {
            const expr = [this._and()];
            while (this._matchOne(16 /* TokenType.Or */)) {
                const right = this._and();
                expr.push(right);
            }
            return expr.length === 1 ? expr[0] : ContextKeyExpr.or(...expr);
        }
        _and() {
            const expr = [this._term()];
            while (this._matchOne(15 /* TokenType.And */)) {
                const right = this._term();
                expr.push(right);
            }
            return expr.length === 1 ? expr[0] : ContextKeyExpr.and(...expr);
        }
        _term() {
            if (this._matchOne(2 /* TokenType.Neg */)) {
                const peek = this._peek();
                switch (peek.type) {
                    case 11 /* TokenType.True */:
                        this._advance();
                        return ContextKeyFalseExpr.INSTANCE;
                    case 12 /* TokenType.False */:
                        this._advance();
                        return ContextKeyTrueExpr.INSTANCE;
                    case 0 /* TokenType.LParen */: {
                        this._advance();
                        const expr = this._expr();
                        this._consume(1 /* TokenType.RParen */, errorClosingParenthesis);
                        return expr?.negate();
                    }
                    case 17 /* TokenType.Str */:
                        this._advance();
                        return ContextKeyNotExpr.create(peek.lexeme);
                    default:
                        throw this._errExpectedButGot(`KEY | true | false | '(' expression ')'`, peek);
                }
            }
            return this._primary();
        }
        _primary() {
            const peek = this._peek();
            switch (peek.type) {
                case 11 /* TokenType.True */:
                    this._advance();
                    return ContextKeyExpr.true();
                case 12 /* TokenType.False */:
                    this._advance();
                    return ContextKeyExpr.false();
                case 0 /* TokenType.LParen */: {
                    this._advance();
                    const expr = this._expr();
                    this._consume(1 /* TokenType.RParen */, errorClosingParenthesis);
                    return expr;
                }
                case 17 /* TokenType.Str */: {
                    // KEY
                    const key = peek.lexeme;
                    this._advance();
                    // =~ regex
                    if (this._matchOne(9 /* TokenType.RegexOp */)) {
                        // @ulugbekna: we need to reconstruct the regex from the tokens because some extensions use unescaped slashes in regexes
                        const expr = this._peek();
                        if (!this._config.regexParsingWithErrorRecovery) {
                            this._advance();
                            if (expr.type !== 10 /* TokenType.RegexStr */) {
                                throw this._errExpectedButGot(`REGEX`, expr);
                            }
                            const regexLexeme = expr.lexeme;
                            const closingSlashIndex = regexLexeme.lastIndexOf('/');
                            const flags = closingSlashIndex === regexLexeme.length - 1 ? undefined : this._removeFlagsGY(regexLexeme.substring(closingSlashIndex + 1));
                            let regexp;
                            try {
                                regexp = new RegExp(regexLexeme.substring(1, closingSlashIndex), flags);
                            }
                            catch (e) {
                                throw this._errExpectedButGot(`REGEX`, expr);
                            }
                            return ContextKeyRegexExpr.create(key, regexp);
                        }
                        switch (expr.type) {
                            case 10 /* TokenType.RegexStr */:
                            case 19 /* TokenType.Error */: { // also handle an ErrorToken in case of smth such as /(/file)/
                                const lexemeReconstruction = [expr.lexeme]; // /REGEX/ or /REGEX/FLAGS
                                this._advance();
                                let followingToken = this._peek();
                                let parenBalance = 0;
                                for (let i = 0; i < expr.lexeme.length; i++) {
                                    if (expr.lexeme.charCodeAt(i) === 40 /* CharCode.OpenParen */) {
                                        parenBalance++;
                                    }
                                    else if (expr.lexeme.charCodeAt(i) === 41 /* CharCode.CloseParen */) {
                                        parenBalance--;
                                    }
                                }
                                while (!this._isAtEnd() && followingToken.type !== 15 /* TokenType.And */ && followingToken.type !== 16 /* TokenType.Or */) {
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
                                    lexemeReconstruction.push(scanner_1.Scanner.getLexeme(followingToken));
                                    this._advance();
                                    followingToken = this._peek();
                                }
                                const regexLexeme = lexemeReconstruction.join('');
                                const closingSlashIndex = regexLexeme.lastIndexOf('/');
                                const flags = closingSlashIndex === regexLexeme.length - 1 ? undefined : this._removeFlagsGY(regexLexeme.substring(closingSlashIndex + 1));
                                let regexp;
                                try {
                                    regexp = new RegExp(regexLexeme.substring(1, closingSlashIndex), flags);
                                }
                                catch (e) {
                                    throw this._errExpectedButGot(`REGEX`, expr);
                                }
                                return ContextKeyExpr.regex(key, regexp);
                            }
                            case 18 /* TokenType.QuotedStr */: {
                                const serializedValue = expr.lexeme;
                                this._advance();
                                // replicate old regex parsing behavior
                                let regex = null;
                                if (!(0, strings_1.isFalsyOrWhitespace)(serializedValue)) {
                                    const start = serializedValue.indexOf('/');
                                    const end = serializedValue.lastIndexOf('/');
                                    if (start !== end && start >= 0) {
                                        const value = serializedValue.slice(start + 1, end);
                                        const caseIgnoreFlag = serializedValue[end + 1] === 'i' ? 'i' : '';
                                        try {
                                            regex = new RegExp(value, caseIgnoreFlag);
                                        }
                                        catch (_e) {
                                            throw this._errExpectedButGot(`REGEX`, expr);
                                        }
                                    }
                                }
                                if (regex === null) {
                                    throw this._errExpectedButGot('REGEX', expr);
                                }
                                return ContextKeyRegexExpr.create(key, regex);
                            }
                            default:
                                throw this._errExpectedButGot('REGEX', this._peek());
                        }
                    }
                    // [ 'not' 'in' value ]
                    if (this._matchOne(14 /* TokenType.Not */)) {
                        this._consume(13 /* TokenType.In */, errorNoInAfterNot);
                        const right = this._value();
                        return ContextKeyExpr.notIn(key, right);
                    }
                    // [ ('==' | '!=' | '<' | '<=' | '>' | '>=' | 'in') value ]
                    const maybeOp = this._peek().type;
                    switch (maybeOp) {
                        case 3 /* TokenType.Eq */: {
                            this._advance();
                            const right = this._value();
                            if (this._previous().type === 18 /* TokenType.QuotedStr */) { // to preserve old parser behavior: "foo == 'true'" is preserved as "foo == 'true'", but "foo == true" is optimized as "foo"
                                return ContextKeyExpr.equals(key, right);
                            }
                            switch (right) {
                                case 'true':
                                    return ContextKeyExpr.has(key);
                                case 'false':
                                    return ContextKeyExpr.not(key);
                                default:
                                    return ContextKeyExpr.equals(key, right);
                            }
                        }
                        case 4 /* TokenType.NotEq */: {
                            this._advance();
                            const right = this._value();
                            if (this._previous().type === 18 /* TokenType.QuotedStr */) { // same as above with "foo != 'true'"
                                return ContextKeyExpr.notEquals(key, right);
                            }
                            switch (right) {
                                case 'true':
                                    return ContextKeyExpr.not(key);
                                case 'false':
                                    return ContextKeyExpr.has(key);
                                default:
                                    return ContextKeyExpr.notEquals(key, right);
                            }
                        }
                        // TODO: ContextKeyExpr.smaller(key, right) accepts only `number` as `right` AND during eval of this node, we just eval to `false` if `right` is not a number
                        // consequently, package.json linter should _warn_ the user if they're passing undesired things to ops
                        case 5 /* TokenType.Lt */:
                            this._advance();
                            return ContextKeySmallerExpr.create(key, this._value());
                        case 6 /* TokenType.LtEq */:
                            this._advance();
                            return ContextKeySmallerEqualsExpr.create(key, this._value());
                        case 7 /* TokenType.Gt */:
                            this._advance();
                            return ContextKeyGreaterExpr.create(key, this._value());
                        case 8 /* TokenType.GtEq */:
                            this._advance();
                            return ContextKeyGreaterEqualsExpr.create(key, this._value());
                        case 13 /* TokenType.In */:
                            this._advance();
                            return ContextKeyExpr.in(key, this._value());
                        default:
                            return ContextKeyExpr.has(key);
                    }
                }
                case 20 /* TokenType.EOF */:
                    this._parsingErrors.push({ message: errorUnexpectedEOF, offset: peek.offset, lexeme: '', additionalInfo: hintUnexpectedEOF });
                    throw Parser._parseError;
                default:
                    throw this._errExpectedButGot(`true | false | KEY \n\t| KEY '=~' REGEX \n\t| KEY ('==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not' 'in') value`, this._peek());
            }
        }
        _value() {
            const token = this._peek();
            switch (token.type) {
                case 17 /* TokenType.Str */:
                case 18 /* TokenType.QuotedStr */:
                    this._advance();
                    return token.lexeme;
                case 11 /* TokenType.True */:
                    this._advance();
                    return 'true';
                case 12 /* TokenType.False */:
                    this._advance();
                    return 'false';
                case 13 /* TokenType.In */: // we support `in` as a value, e.g., "when": "languageId == in" - exists in existing extensions
                    this._advance();
                    return 'in';
                default:
                    // this allows "when": "foo == " which's used by existing extensions
                    // we do not call `_advance` on purpose - we don't want to eat unintended tokens
                    return '';
            }
        }
        _removeFlagsGY(flags) {
            return flags.replaceAll(this._flagsGYRe, '');
        }
        // careful: this can throw if current token is the initial one (ie index = 0)
        _previous() {
            return this._tokens[this._current - 1];
        }
        _matchOne(token) {
            if (this._check(token)) {
                this._advance();
                return true;
            }
            return false;
        }
        _advance() {
            if (!this._isAtEnd()) {
                this._current++;
            }
            return this._previous();
        }
        _consume(type, message) {
            if (this._check(type)) {
                return this._advance();
            }
            throw this._errExpectedButGot(message, this._peek());
        }
        _errExpectedButGot(expected, got, additionalInfo) {
            const message = (0, nls_1.localize)('contextkey.parser.error.expectedButGot', "Expected: {0}\nReceived: '{1}'.", expected, scanner_1.Scanner.getLexeme(got));
            const offset = got.offset;
            const lexeme = scanner_1.Scanner.getLexeme(got);
            this._parsingErrors.push({ message, offset, lexeme, additionalInfo });
            return Parser._parseError;
        }
        _check(type) {
            return this._peek().type === type;
        }
        _peek() {
            return this._tokens[this._current];
        }
        _isAtEnd() {
            return this._peek().type === 20 /* TokenType.EOF */;
        }
    }
    exports.Parser = Parser;
    class ContextKeyExpr {
        static false() {
            return ContextKeyFalseExpr.INSTANCE;
        }
        static true() {
            return ContextKeyTrueExpr.INSTANCE;
        }
        static has(key) {
            return ContextKeyDefinedExpr.create(key);
        }
        static equals(key, value) {
            return ContextKeyEqualsExpr.create(key, value);
        }
        static notEquals(key, value) {
            return ContextKeyNotEqualsExpr.create(key, value);
        }
        static regex(key, value) {
            return ContextKeyRegexExpr.create(key, value);
        }
        static in(key, value) {
            return ContextKeyInExpr.create(key, value);
        }
        static notIn(key, value) {
            return ContextKeyNotInExpr.create(key, value);
        }
        static not(key) {
            return ContextKeyNotExpr.create(key);
        }
        static and(...expr) {
            return ContextKeyAndExpr.create(expr, null, true);
        }
        static or(...expr) {
            return ContextKeyOrExpr.create(expr, null, true);
        }
        static greater(key, value) {
            return ContextKeyGreaterExpr.create(key, value);
        }
        static greaterEquals(key, value) {
            return ContextKeyGreaterEqualsExpr.create(key, value);
        }
        static smaller(key, value) {
            return ContextKeySmallerExpr.create(key, value);
        }
        static smallerEquals(key, value) {
            return ContextKeySmallerEqualsExpr.create(key, value);
        }
        static { this._parser = new Parser({ regexParsingWithErrorRecovery: false }); }
        static deserialize(serialized) {
            if (serialized === undefined || serialized === null) { // an empty string needs to be handled by the parser to get a corresponding parsing error reported
                return undefined;
            }
            const expr = this._parser.parse(serialized);
            return expr;
        }
    }
    exports.ContextKeyExpr = ContextKeyExpr;
    function validateWhenClauses(whenClauses) {
        const parser = new Parser({ regexParsingWithErrorRecovery: false }); // we run with no recovery to guide users to use correct regexes
        return whenClauses.map(whenClause => {
            parser.parse(whenClause);
            if (parser.lexingErrors.length > 0) {
                return parser.lexingErrors.map((se) => ({
                    errorMessage: se.additionalInfo ?
                        (0, nls_1.localize)('contextkey.scanner.errorForLinterWithHint', "Unexpected token. Hint: {0}", se.additionalInfo) :
                        (0, nls_1.localize)('contextkey.scanner.errorForLinter', "Unexpected token."),
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
    exports.validateWhenClauses = validateWhenClauses;
    function expressionsAreEqualWithConstantSubstitution(a, b) {
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
    exports.expressionsAreEqualWithConstantSubstitution = expressionsAreEqualWithConstantSubstitution;
    function cmp(a, b) {
        return a.cmp(b);
    }
    class ContextKeyFalseExpr {
        static { this.INSTANCE = new ContextKeyFalseExpr(); }
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
            return ContextKeyTrueExpr.INSTANCE;
        }
    }
    exports.ContextKeyFalseExpr = ContextKeyFalseExpr;
    class ContextKeyTrueExpr {
        static { this.INSTANCE = new ContextKeyTrueExpr(); }
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
            return ContextKeyFalseExpr.INSTANCE;
        }
    }
    exports.ContextKeyTrueExpr = ContextKeyTrueExpr;
    class ContextKeyDefinedExpr {
        static create(key, negated = null) {
            const constantValue = CONSTANT_VALUES.get(key);
            if (typeof constantValue === 'boolean') {
                return constantValue ? ContextKeyTrueExpr.INSTANCE : ContextKeyFalseExpr.INSTANCE;
            }
            return new ContextKeyDefinedExpr(key, negated);
        }
        constructor(key, negated) {
            this.key = key;
            this.negated = negated;
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
                return constantValue ? ContextKeyTrueExpr.INSTANCE : ContextKeyFalseExpr.INSTANCE;
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
            if (!this.negated) {
                this.negated = ContextKeyNotExpr.create(this.key, this);
            }
            return this.negated;
        }
    }
    exports.ContextKeyDefinedExpr = ContextKeyDefinedExpr;
    class ContextKeyEqualsExpr {
        static create(key, value, negated = null) {
            if (typeof value === 'boolean') {
                return (value ? ContextKeyDefinedExpr.create(key, negated) : ContextKeyNotExpr.create(key, negated));
            }
            const constantValue = CONSTANT_VALUES.get(key);
            if (typeof constantValue === 'boolean') {
                const trueValue = constantValue ? 'true' : 'false';
                return (value === trueValue ? ContextKeyTrueExpr.INSTANCE : ContextKeyFalseExpr.INSTANCE);
            }
            return new ContextKeyEqualsExpr(key, value, negated);
        }
        constructor(key, value, negated) {
            this.key = key;
            this.value = value;
            this.negated = negated;
            this.type = 4 /* ContextKeyExprType.Equals */;
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            return cmp2(this.key, this.value, other.key, other.value);
        }
        equals(other) {
            if (other.type === this.type) {
                return (this.key === other.key && this.value === other.value);
            }
            return false;
        }
        substituteConstants() {
            const constantValue = CONSTANT_VALUES.get(this.key);
            if (typeof constantValue === 'boolean') {
                const trueValue = constantValue ? 'true' : 'false';
                return (this.value === trueValue ? ContextKeyTrueExpr.INSTANCE : ContextKeyFalseExpr.INSTANCE);
            }
            return this;
        }
        evaluate(context) {
            // Intentional ==
            // eslint-disable-next-line eqeqeq
            return (context.getValue(this.key) == this.value);
        }
        serialize() {
            return `${this.key} == '${this.value}'`;
        }
        keys() {
            return [this.key];
        }
        map(mapFnc) {
            return mapFnc.mapEquals(this.key, this.value);
        }
        negate() {
            if (!this.negated) {
                this.negated = ContextKeyNotEqualsExpr.create(this.key, this.value, this);
            }
            return this.negated;
        }
    }
    exports.ContextKeyEqualsExpr = ContextKeyEqualsExpr;
    class ContextKeyInExpr {
        static create(key, valueKey) {
            return new ContextKeyInExpr(key, valueKey);
        }
        constructor(key, valueKey) {
            this.key = key;
            this.valueKey = valueKey;
            this.type = 10 /* ContextKeyExprType.In */;
            this.negated = null;
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            return cmp2(this.key, this.valueKey, other.key, other.valueKey);
        }
        equals(other) {
            if (other.type === this.type) {
                return (this.key === other.key && this.valueKey === other.valueKey);
            }
            return false;
        }
        substituteConstants() {
            return this;
        }
        evaluate(context) {
            const source = context.getValue(this.valueKey);
            const item = context.getValue(this.key);
            if (Array.isArray(source)) {
                return source.includes(item);
            }
            if (typeof item === 'string' && typeof source === 'object' && source !== null) {
                return hasOwnProperty.call(source, item);
            }
            return false;
        }
        serialize() {
            return `${this.key} in '${this.valueKey}'`;
        }
        keys() {
            return [this.key, this.valueKey];
        }
        map(mapFnc) {
            return mapFnc.mapIn(this.key, this.valueKey);
        }
        negate() {
            if (!this.negated) {
                this.negated = ContextKeyNotInExpr.create(this.key, this.valueKey);
            }
            return this.negated;
        }
    }
    exports.ContextKeyInExpr = ContextKeyInExpr;
    class ContextKeyNotInExpr {
        static create(key, valueKey) {
            return new ContextKeyNotInExpr(key, valueKey);
        }
        constructor(key, valueKey) {
            this.key = key;
            this.valueKey = valueKey;
            this.type = 11 /* ContextKeyExprType.NotIn */;
            this._negated = ContextKeyInExpr.create(key, valueKey);
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            return this._negated.cmp(other._negated);
        }
        equals(other) {
            if (other.type === this.type) {
                return this._negated.equals(other._negated);
            }
            return false;
        }
        substituteConstants() {
            return this;
        }
        evaluate(context) {
            return !this._negated.evaluate(context);
        }
        serialize() {
            return `${this.key} not in '${this.valueKey}'`;
        }
        keys() {
            return this._negated.keys();
        }
        map(mapFnc) {
            return mapFnc.mapNotIn(this.key, this.valueKey);
        }
        negate() {
            return this._negated;
        }
    }
    exports.ContextKeyNotInExpr = ContextKeyNotInExpr;
    class ContextKeyNotEqualsExpr {
        static create(key, value, negated = null) {
            if (typeof value === 'boolean') {
                if (value) {
                    return ContextKeyNotExpr.create(key, negated);
                }
                return ContextKeyDefinedExpr.create(key, negated);
            }
            const constantValue = CONSTANT_VALUES.get(key);
            if (typeof constantValue === 'boolean') {
                const falseValue = constantValue ? 'true' : 'false';
                return (value === falseValue ? ContextKeyFalseExpr.INSTANCE : ContextKeyTrueExpr.INSTANCE);
            }
            return new ContextKeyNotEqualsExpr(key, value, negated);
        }
        constructor(key, value, negated) {
            this.key = key;
            this.value = value;
            this.negated = negated;
            this.type = 5 /* ContextKeyExprType.NotEquals */;
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            return cmp2(this.key, this.value, other.key, other.value);
        }
        equals(other) {
            if (other.type === this.type) {
                return (this.key === other.key && this.value === other.value);
            }
            return false;
        }
        substituteConstants() {
            const constantValue = CONSTANT_VALUES.get(this.key);
            if (typeof constantValue === 'boolean') {
                const falseValue = constantValue ? 'true' : 'false';
                return (this.value === falseValue ? ContextKeyFalseExpr.INSTANCE : ContextKeyTrueExpr.INSTANCE);
            }
            return this;
        }
        evaluate(context) {
            // Intentional !=
            // eslint-disable-next-line eqeqeq
            return (context.getValue(this.key) != this.value);
        }
        serialize() {
            return `${this.key} != '${this.value}'`;
        }
        keys() {
            return [this.key];
        }
        map(mapFnc) {
            return mapFnc.mapNotEquals(this.key, this.value);
        }
        negate() {
            if (!this.negated) {
                this.negated = ContextKeyEqualsExpr.create(this.key, this.value, this);
            }
            return this.negated;
        }
    }
    exports.ContextKeyNotEqualsExpr = ContextKeyNotEqualsExpr;
    class ContextKeyNotExpr {
        static create(key, negated = null) {
            const constantValue = CONSTANT_VALUES.get(key);
            if (typeof constantValue === 'boolean') {
                return (constantValue ? ContextKeyFalseExpr.INSTANCE : ContextKeyTrueExpr.INSTANCE);
            }
            return new ContextKeyNotExpr(key, negated);
        }
        constructor(key, negated) {
            this.key = key;
            this.negated = negated;
            this.type = 3 /* ContextKeyExprType.Not */;
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
                return (constantValue ? ContextKeyFalseExpr.INSTANCE : ContextKeyTrueExpr.INSTANCE);
            }
            return this;
        }
        evaluate(context) {
            return (!context.getValue(this.key));
        }
        serialize() {
            return `!${this.key}`;
        }
        keys() {
            return [this.key];
        }
        map(mapFnc) {
            return mapFnc.mapNot(this.key);
        }
        negate() {
            if (!this.negated) {
                this.negated = ContextKeyDefinedExpr.create(this.key, this);
            }
            return this.negated;
        }
    }
    exports.ContextKeyNotExpr = ContextKeyNotExpr;
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
        return ContextKeyFalseExpr.INSTANCE;
    }
    class ContextKeyGreaterExpr {
        static create(key, _value, negated = null) {
            return withFloatOrStr(_value, (value) => new ContextKeyGreaterExpr(key, value, negated));
        }
        constructor(key, value, negated) {
            this.key = key;
            this.value = value;
            this.negated = negated;
            this.type = 12 /* ContextKeyExprType.Greater */;
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            return cmp2(this.key, this.value, other.key, other.value);
        }
        equals(other) {
            if (other.type === this.type) {
                return (this.key === other.key && this.value === other.value);
            }
            return false;
        }
        substituteConstants() {
            return this;
        }
        evaluate(context) {
            if (typeof this.value === 'string') {
                return false;
            }
            return (parseFloat(context.getValue(this.key)) > this.value);
        }
        serialize() {
            return `${this.key} > ${this.value}`;
        }
        keys() {
            return [this.key];
        }
        map(mapFnc) {
            return mapFnc.mapGreater(this.key, this.value);
        }
        negate() {
            if (!this.negated) {
                this.negated = ContextKeySmallerEqualsExpr.create(this.key, this.value, this);
            }
            return this.negated;
        }
    }
    exports.ContextKeyGreaterExpr = ContextKeyGreaterExpr;
    class ContextKeyGreaterEqualsExpr {
        static create(key, _value, negated = null) {
            return withFloatOrStr(_value, (value) => new ContextKeyGreaterEqualsExpr(key, value, negated));
        }
        constructor(key, value, negated) {
            this.key = key;
            this.value = value;
            this.negated = negated;
            this.type = 13 /* ContextKeyExprType.GreaterEquals */;
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            return cmp2(this.key, this.value, other.key, other.value);
        }
        equals(other) {
            if (other.type === this.type) {
                return (this.key === other.key && this.value === other.value);
            }
            return false;
        }
        substituteConstants() {
            return this;
        }
        evaluate(context) {
            if (typeof this.value === 'string') {
                return false;
            }
            return (parseFloat(context.getValue(this.key)) >= this.value);
        }
        serialize() {
            return `${this.key} >= ${this.value}`;
        }
        keys() {
            return [this.key];
        }
        map(mapFnc) {
            return mapFnc.mapGreaterEquals(this.key, this.value);
        }
        negate() {
            if (!this.negated) {
                this.negated = ContextKeySmallerExpr.create(this.key, this.value, this);
            }
            return this.negated;
        }
    }
    exports.ContextKeyGreaterEqualsExpr = ContextKeyGreaterEqualsExpr;
    class ContextKeySmallerExpr {
        static create(key, _value, negated = null) {
            return withFloatOrStr(_value, (value) => new ContextKeySmallerExpr(key, value, negated));
        }
        constructor(key, value, negated) {
            this.key = key;
            this.value = value;
            this.negated = negated;
            this.type = 14 /* ContextKeyExprType.Smaller */;
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            return cmp2(this.key, this.value, other.key, other.value);
        }
        equals(other) {
            if (other.type === this.type) {
                return (this.key === other.key && this.value === other.value);
            }
            return false;
        }
        substituteConstants() {
            return this;
        }
        evaluate(context) {
            if (typeof this.value === 'string') {
                return false;
            }
            return (parseFloat(context.getValue(this.key)) < this.value);
        }
        serialize() {
            return `${this.key} < ${this.value}`;
        }
        keys() {
            return [this.key];
        }
        map(mapFnc) {
            return mapFnc.mapSmaller(this.key, this.value);
        }
        negate() {
            if (!this.negated) {
                this.negated = ContextKeyGreaterEqualsExpr.create(this.key, this.value, this);
            }
            return this.negated;
        }
    }
    exports.ContextKeySmallerExpr = ContextKeySmallerExpr;
    class ContextKeySmallerEqualsExpr {
        static create(key, _value, negated = null) {
            return withFloatOrStr(_value, (value) => new ContextKeySmallerEqualsExpr(key, value, negated));
        }
        constructor(key, value, negated) {
            this.key = key;
            this.value = value;
            this.negated = negated;
            this.type = 15 /* ContextKeyExprType.SmallerEquals */;
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            return cmp2(this.key, this.value, other.key, other.value);
        }
        equals(other) {
            if (other.type === this.type) {
                return (this.key === other.key && this.value === other.value);
            }
            return false;
        }
        substituteConstants() {
            return this;
        }
        evaluate(context) {
            if (typeof this.value === 'string') {
                return false;
            }
            return (parseFloat(context.getValue(this.key)) <= this.value);
        }
        serialize() {
            return `${this.key} <= ${this.value}`;
        }
        keys() {
            return [this.key];
        }
        map(mapFnc) {
            return mapFnc.mapSmallerEquals(this.key, this.value);
        }
        negate() {
            if (!this.negated) {
                this.negated = ContextKeyGreaterExpr.create(this.key, this.value, this);
            }
            return this.negated;
        }
    }
    exports.ContextKeySmallerEqualsExpr = ContextKeySmallerEqualsExpr;
    class ContextKeyRegexExpr {
        static create(key, regexp) {
            return new ContextKeyRegexExpr(key, regexp);
        }
        constructor(key, regexp) {
            this.key = key;
            this.regexp = regexp;
            this.type = 7 /* ContextKeyExprType.Regex */;
            this.negated = null;
            //
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            if (this.key < other.key) {
                return -1;
            }
            if (this.key > other.key) {
                return 1;
            }
            const thisSource = this.regexp ? this.regexp.source : '';
            const otherSource = other.regexp ? other.regexp.source : '';
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
                const thisSource = this.regexp ? this.regexp.source : '';
                const otherSource = other.regexp ? other.regexp.source : '';
                return (this.key === other.key && thisSource === otherSource);
            }
            return false;
        }
        substituteConstants() {
            return this;
        }
        evaluate(context) {
            const value = context.getValue(this.key);
            return this.regexp ? this.regexp.test(value) : false;
        }
        serialize() {
            const value = this.regexp
                ? `/${this.regexp.source}/${this.regexp.flags}`
                : '/invalid/';
            return `${this.key} =~ ${value}`;
        }
        keys() {
            return [this.key];
        }
        map(mapFnc) {
            return mapFnc.mapRegex(this.key, this.regexp);
        }
        negate() {
            if (!this.negated) {
                this.negated = ContextKeyNotRegexExpr.create(this);
            }
            return this.negated;
        }
    }
    exports.ContextKeyRegexExpr = ContextKeyRegexExpr;
    class ContextKeyNotRegexExpr {
        static create(actual) {
            return new ContextKeyNotRegexExpr(actual);
        }
        constructor(_actual) {
            this._actual = _actual;
            this.type = 8 /* ContextKeyExprType.NotRegex */;
            //
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            return this._actual.cmp(other._actual);
        }
        equals(other) {
            if (other.type === this.type) {
                return this._actual.equals(other._actual);
            }
            return false;
        }
        substituteConstants() {
            return this;
        }
        evaluate(context) {
            return !this._actual.evaluate(context);
        }
        serialize() {
            return `!(${this._actual.serialize()})`;
        }
        keys() {
            return this._actual.keys();
        }
        map(mapFnc) {
            return new ContextKeyNotRegexExpr(this._actual.map(mapFnc));
        }
        negate() {
            return this._actual;
        }
    }
    exports.ContextKeyNotRegexExpr = ContextKeyNotRegexExpr;
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
    class ContextKeyAndExpr {
        static create(_expr, negated, extraRedundantCheck) {
            return ContextKeyAndExpr._normalizeArr(_expr, negated, extraRedundantCheck);
        }
        constructor(expr, negated) {
            this.expr = expr;
            this.negated = negated;
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
            return ContextKeyAndExpr.create(exprArr, this.negated, false);
        }
        evaluate(context) {
            for (let i = 0, len = this.expr.length; i < len; i++) {
                if (!this.expr[i].evaluate(context)) {
                    return false;
                }
            }
            return true;
        }
        static _normalizeArr(arr, negated, extraRedundantCheck) {
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
                    return ContextKeyFalseExpr.INSTANCE;
                }
                if (e.type === 6 /* ContextKeyExprType.And */) {
                    expr.push(...e.expr);
                    continue;
                }
                expr.push(e);
            }
            if (expr.length === 0 && hasTrue) {
                return ContextKeyTrueExpr.INSTANCE;
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
                const resultElement = ContextKeyOrExpr.create(lastElement.expr.map(el => ContextKeyAndExpr.create([el, secondToLastElement], null, extraRedundantCheck)), null, isFinished);
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
                            return ContextKeyFalseExpr.INSTANCE;
                        }
                    }
                }
                if (expr.length === 1) {
                    return expr[0];
                }
            }
            return new ContextKeyAndExpr(expr, negated);
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
            return new ContextKeyAndExpr(this.expr.map(expr => expr.map(mapFnc)), null);
        }
        negate() {
            if (!this.negated) {
                const result = [];
                for (const expr of this.expr) {
                    result.push(expr.negate());
                }
                this.negated = ContextKeyOrExpr.create(result, this, true);
            }
            return this.negated;
        }
    }
    exports.ContextKeyAndExpr = ContextKeyAndExpr;
    class ContextKeyOrExpr {
        static create(_expr, negated, extraRedundantCheck) {
            return ContextKeyOrExpr._normalizeArr(_expr, negated, extraRedundantCheck);
        }
        constructor(expr, negated) {
            this.expr = expr;
            this.negated = negated;
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
            return ContextKeyOrExpr.create(exprArr, this.negated, false);
        }
        evaluate(context) {
            for (let i = 0, len = this.expr.length; i < len; i++) {
                if (this.expr[i].evaluate(context)) {
                    return true;
                }
            }
            return false;
        }
        static _normalizeArr(arr, negated, extraRedundantCheck) {
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
                        return ContextKeyTrueExpr.INSTANCE;
                    }
                    if (e.type === 9 /* ContextKeyExprType.Or */) {
                        expr = expr.concat(e.expr);
                        continue;
                    }
                    expr.push(e);
                }
                if (expr.length === 0 && hasFalse) {
                    return ContextKeyFalseExpr.INSTANCE;
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
                            return ContextKeyTrueExpr.INSTANCE;
                        }
                    }
                }
                if (expr.length === 1) {
                    return expr[0];
                }
            }
            return new ContextKeyOrExpr(expr, negated);
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
            return new ContextKeyOrExpr(this.expr.map(expr => expr.map(mapFnc)), null);
        }
        negate() {
            if (!this.negated) {
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
                            all.push(ContextKeyAndExpr.create([left, right], null, false));
                        }
                    }
                    result.unshift(ContextKeyOrExpr.create(all, null, false));
                }
                this.negated = ContextKeyOrExpr.create(result, this, true);
            }
            return this.negated;
        }
    }
    exports.ContextKeyOrExpr = ContextKeyOrExpr;
    class RawContextKey extends ContextKeyDefinedExpr {
        static { this._info = []; }
        static all() {
            return RawContextKey._info.values();
        }
        constructor(key, defaultValue, metaOrHide) {
            super(key, null);
            this._defaultValue = defaultValue;
            // collect all context keys into a central place
            if (typeof metaOrHide === 'object') {
                RawContextKey._info.push({ ...metaOrHide, key });
            }
            else if (metaOrHide !== true) {
                RawContextKey._info.push({ key, description: metaOrHide, type: defaultValue !== null && defaultValue !== undefined ? typeof defaultValue : undefined });
            }
        }
        bindTo(target) {
            return target.createKey(this.key, this._defaultValue);
        }
        getValue(target) {
            return target.getContextKeyValue(this.key);
        }
        toNegated() {
            return this.negate();
        }
        isEqualTo(value) {
            return ContextKeyEqualsExpr.create(this.key, value);
        }
        notEqualsTo(value) {
            return ContextKeyNotEqualsExpr.create(this.key, value);
        }
    }
    exports.RawContextKey = RawContextKey;
    exports.IContextKeyService = (0, instantiation_1.createDecorator)('contextKeyService');
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
    function implies(p, q) {
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
                if (implies(p, element)) {
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
                if (implies(element, q)) {
                    return true;
                }
            }
            return false;
        }
        return p.equals(q);
    }
    exports.implies = implies;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dGtleS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2NvbnRleHRrZXkvY29tbW9uL2NvbnRleHRrZXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBWWhHLE1BQU0sZUFBZSxHQUFHLElBQUksR0FBRyxFQUFtQixDQUFDO0lBQ25ELGVBQWUsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3BDLGVBQWUsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2xDLGVBQWUsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLHNCQUFXLENBQUMsQ0FBQztJQUMxQyxlQUFlLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxrQkFBTyxDQUFDLENBQUM7SUFDeEMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsb0JBQVMsQ0FBQyxDQUFDO0lBQzVDLGVBQWUsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLGdCQUFLLENBQUMsQ0FBQztJQUNwQyxlQUFlLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxzQkFBVyxJQUFJLENBQUMsZ0JBQUssQ0FBQyxDQUFDO0lBQzFELGVBQWUsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLGlCQUFNLENBQUMsQ0FBQztJQUN0QyxlQUFlLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxvQkFBUyxDQUFDLENBQUM7SUFDNUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsbUJBQVEsQ0FBQyxDQUFDO0lBQzFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLG1CQUFRLENBQUMsQ0FBQztJQUUxQyxvTkFBb047SUFDcE4sU0FBZ0IsV0FBVyxDQUFDLEdBQVcsRUFBRSxLQUFjO1FBQ3RELElBQUksZUFBZSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMs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