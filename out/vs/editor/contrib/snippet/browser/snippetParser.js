/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SnippetParser = exports.TextmateSnippet = exports.Variable = exports.FormatString = exports.Transform = exports.Choice = exports.Placeholder = exports.TransformableMarker = exports.Text = exports.Marker = exports.Scanner = exports.TokenType = void 0;
    var TokenType;
    (function (TokenType) {
        TokenType[TokenType["Dollar"] = 0] = "Dollar";
        TokenType[TokenType["Colon"] = 1] = "Colon";
        TokenType[TokenType["Comma"] = 2] = "Comma";
        TokenType[TokenType["CurlyOpen"] = 3] = "CurlyOpen";
        TokenType[TokenType["CurlyClose"] = 4] = "CurlyClose";
        TokenType[TokenType["Backslash"] = 5] = "Backslash";
        TokenType[TokenType["Forwardslash"] = 6] = "Forwardslash";
        TokenType[TokenType["Pipe"] = 7] = "Pipe";
        TokenType[TokenType["Int"] = 8] = "Int";
        TokenType[TokenType["VariableName"] = 9] = "VariableName";
        TokenType[TokenType["Format"] = 10] = "Format";
        TokenType[TokenType["Plus"] = 11] = "Plus";
        TokenType[TokenType["Dash"] = 12] = "Dash";
        TokenType[TokenType["QuestionMark"] = 13] = "QuestionMark";
        TokenType[TokenType["EOF"] = 14] = "EOF";
    })(TokenType || (exports.TokenType = TokenType = {}));
    class Scanner {
        constructor() {
            this.value = '';
            this.pos = 0;
        }
        static { this._table = {
            [36 /* CharCode.DollarSign */]: 0 /* TokenType.Dollar */,
            [58 /* CharCode.Colon */]: 1 /* TokenType.Colon */,
            [44 /* CharCode.Comma */]: 2 /* TokenType.Comma */,
            [123 /* CharCode.OpenCurlyBrace */]: 3 /* TokenType.CurlyOpen */,
            [125 /* CharCode.CloseCurlyBrace */]: 4 /* TokenType.CurlyClose */,
            [92 /* CharCode.Backslash */]: 5 /* TokenType.Backslash */,
            [47 /* CharCode.Slash */]: 6 /* TokenType.Forwardslash */,
            [124 /* CharCode.Pipe */]: 7 /* TokenType.Pipe */,
            [43 /* CharCode.Plus */]: 11 /* TokenType.Plus */,
            [45 /* CharCode.Dash */]: 12 /* TokenType.Dash */,
            [63 /* CharCode.QuestionMark */]: 13 /* TokenType.QuestionMark */,
        }; }
        static isDigitCharacter(ch) {
            return ch >= 48 /* CharCode.Digit0 */ && ch <= 57 /* CharCode.Digit9 */;
        }
        static isVariableCharacter(ch) {
            return ch === 95 /* CharCode.Underline */
                || (ch >= 97 /* CharCode.a */ && ch <= 122 /* CharCode.z */)
                || (ch >= 65 /* CharCode.A */ && ch <= 90 /* CharCode.Z */);
        }
        text(value) {
            this.value = value;
            this.pos = 0;
        }
        tokenText(token) {
            return this.value.substr(token.pos, token.len);
        }
        next() {
            if (this.pos >= this.value.length) {
                return { type: 14 /* TokenType.EOF */, pos: this.pos, len: 0 };
            }
            const pos = this.pos;
            let len = 0;
            let ch = this.value.charCodeAt(pos);
            let type;
            // static types
            type = Scanner._table[ch];
            if (typeof type === 'number') {
                this.pos += 1;
                return { type, pos, len: 1 };
            }
            // number
            if (Scanner.isDigitCharacter(ch)) {
                type = 8 /* TokenType.Int */;
                do {
                    len += 1;
                    ch = this.value.charCodeAt(pos + len);
                } while (Scanner.isDigitCharacter(ch));
                this.pos += len;
                return { type, pos, len };
            }
            // variable name
            if (Scanner.isVariableCharacter(ch)) {
                type = 9 /* TokenType.VariableName */;
                do {
                    ch = this.value.charCodeAt(pos + (++len));
                } while (Scanner.isVariableCharacter(ch) || Scanner.isDigitCharacter(ch));
                this.pos += len;
                return { type, pos, len };
            }
            // format
            type = 10 /* TokenType.Format */;
            do {
                len += 1;
                ch = this.value.charCodeAt(pos + len);
            } while (!isNaN(ch)
                && typeof Scanner._table[ch] === 'undefined' // not static token
                && !Scanner.isDigitCharacter(ch) // not number
                && !Scanner.isVariableCharacter(ch) // not variable
            );
            this.pos += len;
            return { type, pos, len };
        }
    }
    exports.Scanner = Scanner;
    class Marker {
        constructor() {
            this._children = [];
        }
        appendChild(child) {
            if (child instanceof Text && this._children[this._children.length - 1] instanceof Text) {
                // this and previous child are text -> merge them
                this._children[this._children.length - 1].value += child.value;
            }
            else {
                // normal adoption of child
                child.parent = this;
                this._children.push(child);
            }
            return this;
        }
        replace(child, others) {
            const { parent } = child;
            const idx = parent.children.indexOf(child);
            const newChildren = parent.children.slice(0);
            newChildren.splice(idx, 1, ...others);
            parent._children = newChildren;
            (function _fixParent(children, parent) {
                for (const child of children) {
                    child.parent = parent;
                    _fixParent(child.children, child);
                }
            })(others, parent);
        }
        get children() {
            return this._children;
        }
        get rightMostDescendant() {
            if (this._children.length > 0) {
                return this._children[this._children.length - 1].rightMostDescendant;
            }
            return this;
        }
        get snippet() {
            let candidate = this;
            while (true) {
                if (!candidate) {
                    return undefined;
                }
                if (candidate instanceof TextmateSnippet) {
                    return candidate;
                }
                candidate = candidate.parent;
            }
        }
        toString() {
            return this.children.reduce((prev, cur) => prev + cur.toString(), '');
        }
        len() {
            return 0;
        }
    }
    exports.Marker = Marker;
    class Text extends Marker {
        static escape(value) {
            return value.replace(/\$|}|\\/g, '\\$&');
        }
        constructor(value) {
            super();
            this.value = value;
        }
        toString() {
            return this.value;
        }
        toTextmateString() {
            return Text.escape(this.value);
        }
        len() {
            return this.value.length;
        }
        clone() {
            return new Text(this.value);
        }
    }
    exports.Text = Text;
    class TransformableMarker extends Marker {
    }
    exports.TransformableMarker = TransformableMarker;
    class Placeholder extends TransformableMarker {
        static compareByIndex(a, b) {
            if (a.index === b.index) {
                return 0;
            }
            else if (a.isFinalTabstop) {
                return 1;
            }
            else if (b.isFinalTabstop) {
                return -1;
            }
            else if (a.index < b.index) {
                return -1;
            }
            else if (a.index > b.index) {
                return 1;
            }
            else {
                return 0;
            }
        }
        constructor(index) {
            super();
            this.index = index;
        }
        get isFinalTabstop() {
            return this.index === 0;
        }
        get choice() {
            return this._children.length === 1 && this._children[0] instanceof Choice
                ? this._children[0]
                : undefined;
        }
        toTextmateString() {
            let transformString = '';
            if (this.transform) {
                transformString = this.transform.toTextmateString();
            }
            if (this.children.length === 0 && !this.transform) {
                return `\$${this.index}`;
            }
            else if (this.children.length === 0) {
                return `\${${this.index}${transformString}}`;
            }
            else if (this.choice) {
                return `\${${this.index}|${this.choice.toTextmateString()}|${transformString}}`;
            }
            else {
                return `\${${this.index}:${this.children.map(child => child.toTextmateString()).join('')}${transformString}}`;
            }
        }
        clone() {
            const ret = new Placeholder(this.index);
            if (this.transform) {
                ret.transform = this.transform.clone();
            }
            ret._children = this.children.map(child => child.clone());
            return ret;
        }
    }
    exports.Placeholder = Placeholder;
    class Choice extends Marker {
        constructor() {
            super(...arguments);
            this.options = [];
        }
        appendChild(marker) {
            if (marker instanceof Text) {
                marker.parent = this;
                this.options.push(marker);
            }
            return this;
        }
        toString() {
            return this.options[0].value;
        }
        toTextmateString() {
            return this.options
                .map(option => option.value.replace(/\||,|\\/g, '\\$&'))
                .join(',');
        }
        len() {
            return this.options[0].len();
        }
        clone() {
            const ret = new Choice();
            this.options.forEach(ret.appendChild, ret);
            return ret;
        }
    }
    exports.Choice = Choice;
    class Transform extends Marker {
        constructor() {
            super(...arguments);
            this.regexp = new RegExp('');
        }
        resolve(value) {
            const _this = this;
            let didMatch = false;
            let ret = value.replace(this.regexp, function () {
                didMatch = true;
                return _this._replace(Array.prototype.slice.call(arguments, 0, -2));
            });
            // when the regex didn't match and when the transform has
            // else branches, then run those
            if (!didMatch && this._children.some(child => child instanceof FormatString && Boolean(child.elseValue))) {
                ret = this._replace([]);
            }
            return ret;
        }
        _replace(groups) {
            let ret = '';
            for (const marker of this._children) {
                if (marker instanceof FormatString) {
                    let value = groups[marker.index] || '';
                    value = marker.resolve(value);
                    ret += value;
                }
                else {
                    ret += marker.toString();
                }
            }
            return ret;
        }
        toString() {
            return '';
        }
        toTextmateString() {
            return `/${this.regexp.source}/${this.children.map(c => c.toTextmateString())}/${(this.regexp.ignoreCase ? 'i' : '') + (this.regexp.global ? 'g' : '')}`;
        }
        clone() {
            const ret = new Transform();
            ret.regexp = new RegExp(this.regexp.source, '' + (this.regexp.ignoreCase ? 'i' : '') + (this.regexp.global ? 'g' : ''));
            ret._children = this.children.map(child => child.clone());
            return ret;
        }
    }
    exports.Transform = Transform;
    class FormatString extends Marker {
        constructor(index, shorthandName, ifValue, elseValue) {
            super();
            this.index = index;
            this.shorthandName = shorthandName;
            this.ifValue = ifValue;
            this.elseValue = elseValue;
        }
        resolve(value) {
            if (this.shorthandName === 'upcase') {
                return !value ? '' : value.toLocaleUpperCase();
            }
            else if (this.shorthandName === 'downcase') {
                return !value ? '' : value.toLocaleLowerCase();
            }
            else if (this.shorthandName === 'capitalize') {
                return !value ? '' : (value[0].toLocaleUpperCase() + value.substr(1));
            }
            else if (this.shorthandName === 'pascalcase') {
                return !value ? '' : this._toPascalCase(value);
            }
            else if (this.shorthandName === 'camelcase') {
                return !value ? '' : this._toCamelCase(value);
            }
            else if (Boolean(value) && typeof this.ifValue === 'string') {
                return this.ifValue;
            }
            else if (!Boolean(value) && typeof this.elseValue === 'string') {
                return this.elseValue;
            }
            else {
                return value || '';
            }
        }
        _toPascalCase(value) {
            const match = value.match(/[a-z0-9]+/gi);
            if (!match) {
                return value;
            }
            return match.map(word => {
                return word.charAt(0).toUpperCase() + word.substr(1);
            })
                .join('');
        }
        _toCamelCase(value) {
            const match = value.match(/[a-z0-9]+/gi);
            if (!match) {
                return value;
            }
            return match.map((word, index) => {
                if (index === 0) {
                    return word.charAt(0).toLowerCase() + word.substr(1);
                }
                return word.charAt(0).toUpperCase() + word.substr(1);
            })
                .join('');
        }
        toTextmateString() {
            let value = '${';
            value += this.index;
            if (this.shorthandName) {
                value += `:/${this.shorthandName}`;
            }
            else if (this.ifValue && this.elseValue) {
                value += `:?${this.ifValue}:${this.elseValue}`;
            }
            else if (this.ifValue) {
                value += `:+${this.ifValue}`;
            }
            else if (this.elseValue) {
                value += `:-${this.elseValue}`;
            }
            value += '}';
            return value;
        }
        clone() {
            const ret = new FormatString(this.index, this.shorthandName, this.ifValue, this.elseValue);
            return ret;
        }
    }
    exports.FormatString = FormatString;
    class Variable extends TransformableMarker {
        constructor(name) {
            super();
            this.name = name;
        }
        resolve(resolver) {
            let value = resolver.resolve(this);
            if (this.transform) {
                value = this.transform.resolve(value || '');
            }
            if (value !== undefined) {
                this._children = [new Text(value)];
                return true;
            }
            return false;
        }
        toTextmateString() {
            let transformString = '';
            if (this.transform) {
                transformString = this.transform.toTextmateString();
            }
            if (this.children.length === 0) {
                return `\${${this.name}${transformString}}`;
            }
            else {
                return `\${${this.name}:${this.children.map(child => child.toTextmateString()).join('')}${transformString}}`;
            }
        }
        clone() {
            const ret = new Variable(this.name);
            if (this.transform) {
                ret.transform = this.transform.clone();
            }
            ret._children = this.children.map(child => child.clone());
            return ret;
        }
    }
    exports.Variable = Variable;
    function walk(marker, visitor) {
        const stack = [...marker];
        while (stack.length > 0) {
            const marker = stack.shift();
            const recurse = visitor(marker);
            if (!recurse) {
                break;
            }
            stack.unshift(...marker.children);
        }
    }
    class TextmateSnippet extends Marker {
        get placeholderInfo() {
            if (!this._placeholders) {
                // fill in placeholders
                const all = [];
                let last;
                this.walk(function (candidate) {
                    if (candidate instanceof Placeholder) {
                        all.push(candidate);
                        last = !last || last.index < candidate.index ? candidate : last;
                    }
                    return true;
                });
                this._placeholders = { all, last };
            }
            return this._placeholders;
        }
        get placeholders() {
            const { all } = this.placeholderInfo;
            return all;
        }
        offset(marker) {
            let pos = 0;
            let found = false;
            this.walk(candidate => {
                if (candidate === marker) {
                    found = true;
                    return false;
                }
                pos += candidate.len();
                return true;
            });
            if (!found) {
                return -1;
            }
            return pos;
        }
        fullLen(marker) {
            let ret = 0;
            walk([marker], marker => {
                ret += marker.len();
                return true;
            });
            return ret;
        }
        enclosingPlaceholders(placeholder) {
            const ret = [];
            let { parent } = placeholder;
            while (parent) {
                if (parent instanceof Placeholder) {
                    ret.push(parent);
                }
                parent = parent.parent;
            }
            return ret;
        }
        resolveVariables(resolver) {
            this.walk(candidate => {
                if (candidate instanceof Variable) {
                    if (candidate.resolve(resolver)) {
                        this._placeholders = undefined;
                    }
                }
                return true;
            });
            return this;
        }
        appendChild(child) {
            this._placeholders = undefined;
            return super.appendChild(child);
        }
        replace(child, others) {
            this._placeholders = undefined;
            return super.replace(child, others);
        }
        toTextmateString() {
            return this.children.reduce((prev, cur) => prev + cur.toTextmateString(), '');
        }
        clone() {
            const ret = new TextmateSnippet();
            this._children = this.children.map(child => child.clone());
            return ret;
        }
        walk(visitor) {
            walk(this.children, visitor);
        }
    }
    exports.TextmateSnippet = TextmateSnippet;
    class SnippetParser {
        constructor() {
            this._scanner = new Scanner();
            this._token = { type: 14 /* TokenType.EOF */, pos: 0, len: 0 };
        }
        static escape(value) {
            return value.replace(/\$|}|\\/g, '\\$&');
        }
        /**
         * Takes a snippet and returns the insertable string, e.g return the snippet-string
         * without any placeholder, tabstop, variables etc...
         */
        static asInsertText(value) {
            return new SnippetParser().parse(value).toString();
        }
        static guessNeedsClipboard(template) {
            return /\${?CLIPBOARD/.test(template);
        }
        parse(value, insertFinalTabstop, enforceFinalTabstop) {
            const snippet = new TextmateSnippet();
            this.parseFragment(value, snippet);
            this.ensureFinalTabstop(snippet, enforceFinalTabstop ?? false, insertFinalTabstop ?? false);
            return snippet;
        }
        parseFragment(value, snippet) {
            const offset = snippet.children.length;
            this._scanner.text(value);
            this._token = this._scanner.next();
            while (this._parse(snippet)) {
                // nothing
            }
            // fill in values for placeholders. the first placeholder of an index
            // that has a value defines the value for all placeholders with that index
            const placeholderDefaultValues = new Map();
            const incompletePlaceholders = [];
            snippet.walk(marker => {
                if (marker instanceof Placeholder) {
                    if (marker.isFinalTabstop) {
                        placeholderDefaultValues.set(0, undefined);
                    }
                    else if (!placeholderDefaultValues.has(marker.index) && marker.children.length > 0) {
                        placeholderDefaultValues.set(marker.index, marker.children);
                    }
                    else {
                        incompletePlaceholders.push(marker);
                    }
                }
                return true;
            });
            const fillInIncompletePlaceholder = (placeholder, stack) => {
                const defaultValues = placeholderDefaultValues.get(placeholder.index);
                if (!defaultValues) {
                    return;
                }
                const clone = new Placeholder(placeholder.index);
                clone.transform = placeholder.transform;
                for (const child of defaultValues) {
                    const newChild = child.clone();
                    clone.appendChild(newChild);
                    // "recurse" on children that are again placeholders
                    if (newChild instanceof Placeholder && placeholderDefaultValues.has(newChild.index) && !stack.has(newChild.index)) {
                        stack.add(newChild.index);
                        fillInIncompletePlaceholder(newChild, stack);
                        stack.delete(newChild.index);
                    }
                }
                snippet.replace(placeholder, [clone]);
            };
            const stack = new Set();
            for (const placeholder of incompletePlaceholders) {
                fillInIncompletePlaceholder(placeholder, stack);
            }
            return snippet.children.slice(offset);
        }
        ensureFinalTabstop(snippet, enforceFinalTabstop, insertFinalTabstop) {
            if (enforceFinalTabstop || insertFinalTabstop && snippet.placeholders.length > 0) {
                const finalTabstop = snippet.placeholders.find(p => p.index === 0);
                if (!finalTabstop) {
                    // the snippet uses placeholders but has no
                    // final tabstop defined -> insert at the end
                    snippet.appendChild(new Placeholder(0));
                }
            }
        }
        _accept(type, value) {
            if (type === undefined || this._token.type === type) {
                const ret = !value ? true : this._scanner.tokenText(this._token);
                this._token = this._scanner.next();
                return ret;
            }
            return false;
        }
        _backTo(token) {
            this._scanner.pos = token.pos + token.len;
            this._token = token;
            return false;
        }
        _until(type) {
            const start = this._token;
            while (this._token.type !== type) {
                if (this._token.type === 14 /* TokenType.EOF */) {
                    return false;
                }
                else if (this._token.type === 5 /* TokenType.Backslash */) {
                    const nextToken = this._scanner.next();
                    if (nextToken.type !== 0 /* TokenType.Dollar */
                        && nextToken.type !== 4 /* TokenType.CurlyClose */
                        && nextToken.type !== 5 /* TokenType.Backslash */) {
                        return false;
                    }
                }
                this._token = this._scanner.next();
            }
            const value = this._scanner.value.substring(start.pos, this._token.pos).replace(/\\(\$|}|\\)/g, '$1');
            this._token = this._scanner.next();
            return value;
        }
        _parse(marker) {
            return this._parseEscaped(marker)
                || this._parseTabstopOrVariableName(marker)
                || this._parseComplexPlaceholder(marker)
                || this._parseComplexVariable(marker)
                || this._parseAnything(marker);
        }
        // \$, \\, \} -> just text
        _parseEscaped(marker) {
            let value;
            if (value = this._accept(5 /* TokenType.Backslash */, true)) {
                // saw a backslash, append escaped token or that backslash
                value = this._accept(0 /* TokenType.Dollar */, true)
                    || this._accept(4 /* TokenType.CurlyClose */, true)
                    || this._accept(5 /* TokenType.Backslash */, true)
                    || value;
                marker.appendChild(new Text(value));
                return true;
            }
            return false;
        }
        // $foo -> variable, $1 -> tabstop
        _parseTabstopOrVariableName(parent) {
            let value;
            const token = this._token;
            const match = this._accept(0 /* TokenType.Dollar */)
                && (value = this._accept(9 /* TokenType.VariableName */, true) || this._accept(8 /* TokenType.Int */, true));
            if (!match) {
                return this._backTo(token);
            }
            parent.appendChild(/^\d+$/.test(value)
                ? new Placeholder(Number(value))
                : new Variable(value));
            return true;
        }
        // ${1:<children>}, ${1} -> placeholder
        _parseComplexPlaceholder(parent) {
            let index;
            const token = this._token;
            const match = this._accept(0 /* TokenType.Dollar */)
                && this._accept(3 /* TokenType.CurlyOpen */)
                && (index = this._accept(8 /* TokenType.Int */, true));
            if (!match) {
                return this._backTo(token);
            }
            const placeholder = new Placeholder(Number(index));
            if (this._accept(1 /* TokenType.Colon */)) {
                // ${1:<children>}
                while (true) {
                    // ...} -> done
                    if (this._accept(4 /* TokenType.CurlyClose */)) {
                        parent.appendChild(placeholder);
                        return true;
                    }
                    if (this._parse(placeholder)) {
                        continue;
                    }
                    // fallback
                    parent.appendChild(new Text('${' + index + ':'));
                    placeholder.children.forEach(parent.appendChild, parent);
                    return true;
                }
            }
            else if (placeholder.index > 0 && this._accept(7 /* TokenType.Pipe */)) {
                // ${1|one,two,three|}
                const choice = new Choice();
                while (true) {
                    if (this._parseChoiceElement(choice)) {
                        if (this._accept(2 /* TokenType.Comma */)) {
                            // opt, -> more
                            continue;
                        }
                        if (this._accept(7 /* TokenType.Pipe */)) {
                            placeholder.appendChild(choice);
                            if (this._accept(4 /* TokenType.CurlyClose */)) {
                                // ..|} -> done
                                parent.appendChild(placeholder);
                                return true;
                            }
                        }
                    }
                    this._backTo(token);
                    return false;
                }
            }
            else if (this._accept(6 /* TokenType.Forwardslash */)) {
                // ${1/<regex>/<format>/<options>}
                if (this._parseTransform(placeholder)) {
                    parent.appendChild(placeholder);
                    return true;
                }
                this._backTo(token);
                return false;
            }
            else if (this._accept(4 /* TokenType.CurlyClose */)) {
                // ${1}
                parent.appendChild(placeholder);
                return true;
            }
            else {
                // ${1 <- missing curly or colon
                return this._backTo(token);
            }
        }
        _parseChoiceElement(parent) {
            const token = this._token;
            const values = [];
            while (true) {
                if (this._token.type === 2 /* TokenType.Comma */ || this._token.type === 7 /* TokenType.Pipe */) {
                    break;
                }
                let value;
                if (value = this._accept(5 /* TokenType.Backslash */, true)) {
                    // \, \|, or \\
                    value = this._accept(2 /* TokenType.Comma */, true)
                        || this._accept(7 /* TokenType.Pipe */, true)
                        || this._accept(5 /* TokenType.Backslash */, true)
                        || value;
                }
                else {
                    value = this._accept(undefined, true);
                }
                if (!value) {
                    // EOF
                    this._backTo(token);
                    return false;
                }
                values.push(value);
            }
            if (values.length === 0) {
                this._backTo(token);
                return false;
            }
            parent.appendChild(new Text(values.join('')));
            return true;
        }
        // ${foo:<children>}, ${foo} -> variable
        _parseComplexVariable(parent) {
            let name;
            const token = this._token;
            const match = this._accept(0 /* TokenType.Dollar */)
                && this._accept(3 /* TokenType.CurlyOpen */)
                && (name = this._accept(9 /* TokenType.VariableName */, true));
            if (!match) {
                return this._backTo(token);
            }
            const variable = new Variable(name);
            if (this._accept(1 /* TokenType.Colon */)) {
                // ${foo:<children>}
                while (true) {
                    // ...} -> done
                    if (this._accept(4 /* TokenType.CurlyClose */)) {
                        parent.appendChild(variable);
                        return true;
                    }
                    if (this._parse(variable)) {
                        continue;
                    }
                    // fallback
                    parent.appendChild(new Text('${' + name + ':'));
                    variable.children.forEach(parent.appendChild, parent);
                    return true;
                }
            }
            else if (this._accept(6 /* TokenType.Forwardslash */)) {
                // ${foo/<regex>/<format>/<options>}
                if (this._parseTransform(variable)) {
                    parent.appendChild(variable);
                    return true;
                }
                this._backTo(token);
                return false;
            }
            else if (this._accept(4 /* TokenType.CurlyClose */)) {
                // ${foo}
                parent.appendChild(variable);
                return true;
            }
            else {
                // ${foo <- missing curly or colon
                return this._backTo(token);
            }
        }
        _parseTransform(parent) {
            // ...<regex>/<format>/<options>}
            const transform = new Transform();
            let regexValue = '';
            let regexOptions = '';
            // (1) /regex
            while (true) {
                if (this._accept(6 /* TokenType.Forwardslash */)) {
                    break;
                }
                let escaped;
                if (escaped = this._accept(5 /* TokenType.Backslash */, true)) {
                    escaped = this._accept(6 /* TokenType.Forwardslash */, true) || escaped;
                    regexValue += escaped;
                    continue;
                }
                if (this._token.type !== 14 /* TokenType.EOF */) {
                    regexValue += this._accept(undefined, true);
                    continue;
                }
                return false;
            }
            // (2) /format
            while (true) {
                if (this._accept(6 /* TokenType.Forwardslash */)) {
                    break;
                }
                let escaped;
                if (escaped = this._accept(5 /* TokenType.Backslash */, true)) {
                    escaped = this._accept(5 /* TokenType.Backslash */, true) || this._accept(6 /* TokenType.Forwardslash */, true) || escaped;
                    transform.appendChild(new Text(escaped));
                    continue;
                }
                if (this._parseFormatString(transform) || this._parseAnything(transform)) {
                    continue;
                }
                return false;
            }
            // (3) /option
            while (true) {
                if (this._accept(4 /* TokenType.CurlyClose */)) {
                    break;
                }
                if (this._token.type !== 14 /* TokenType.EOF */) {
                    regexOptions += this._accept(undefined, true);
                    continue;
                }
                return false;
            }
            try {
                transform.regexp = new RegExp(regexValue, regexOptions);
            }
            catch (e) {
                // invalid regexp
                return false;
            }
            parent.transform = transform;
            return true;
        }
        _parseFormatString(parent) {
            const token = this._token;
            if (!this._accept(0 /* TokenType.Dollar */)) {
                return false;
            }
            let complex = false;
            if (this._accept(3 /* TokenType.CurlyOpen */)) {
                complex = true;
            }
            const index = this._accept(8 /* TokenType.Int */, true);
            if (!index) {
                this._backTo(token);
                return false;
            }
            else if (!complex) {
                // $1
                parent.appendChild(new FormatString(Number(index)));
                return true;
            }
            else if (this._accept(4 /* TokenType.CurlyClose */)) {
                // ${1}
                parent.appendChild(new FormatString(Number(index)));
                return true;
            }
            else if (!this._accept(1 /* TokenType.Colon */)) {
                this._backTo(token);
                return false;
            }
            if (this._accept(6 /* TokenType.Forwardslash */)) {
                // ${1:/upcase}
                const shorthand = this._accept(9 /* TokenType.VariableName */, true);
                if (!shorthand || !this._accept(4 /* TokenType.CurlyClose */)) {
                    this._backTo(token);
                    return false;
                }
                else {
                    parent.appendChild(new FormatString(Number(index), shorthand));
                    return true;
                }
            }
            else if (this._accept(11 /* TokenType.Plus */)) {
                // ${1:+<if>}
                const ifValue = this._until(4 /* TokenType.CurlyClose */);
                if (ifValue) {
                    parent.appendChild(new FormatString(Number(index), undefined, ifValue, undefined));
                    return true;
                }
            }
            else if (this._accept(12 /* TokenType.Dash */)) {
                // ${2:-<else>}
                const elseValue = this._until(4 /* TokenType.CurlyClose */);
                if (elseValue) {
                    parent.appendChild(new FormatString(Number(index), undefined, undefined, elseValue));
                    return true;
                }
            }
            else if (this._accept(13 /* TokenType.QuestionMark */)) {
                // ${2:?<if>:<else>}
                const ifValue = this._until(1 /* TokenType.Colon */);
                if (ifValue) {
                    const elseValue = this._until(4 /* TokenType.CurlyClose */);
                    if (elseValue) {
                        parent.appendChild(new FormatString(Number(index), undefined, ifValue, elseValue));
                        return true;
                    }
                }
            }
            else {
                // ${1:<else>}
                const elseValue = this._until(4 /* TokenType.CurlyClose */);
                if (elseValue) {
                    parent.appendChild(new FormatString(Number(index), undefined, undefined, elseValue));
                    return true;
                }
            }
            this._backTo(token);
            return false;
        }
        _parseAnything(marker) {
            if (this._token.type !== 14 /* TokenType.EOF */) {
                marker.appendChild(new Text(this._scanner.tokenText(this._token)));
                this._accept(undefined);
                return true;
            }
            return false;
        }
    }
    exports.SnippetParser = SnippetParser;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25pcHBldFBhcnNlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL3NuaXBwZXQvYnJvd3Nlci9zbmlwcGV0UGFyc2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUloRyxJQUFrQixTQWdCakI7SUFoQkQsV0FBa0IsU0FBUztRQUMxQiw2Q0FBTSxDQUFBO1FBQ04sMkNBQUssQ0FBQTtRQUNMLDJDQUFLLENBQUE7UUFDTCxtREFBUyxDQUFBO1FBQ1QscURBQVUsQ0FBQTtRQUNWLG1EQUFTLENBQUE7UUFDVCx5REFBWSxDQUFBO1FBQ1oseUNBQUksQ0FBQTtRQUNKLHVDQUFHLENBQUE7UUFDSCx5REFBWSxDQUFBO1FBQ1osOENBQU0sQ0FBQTtRQUNOLDBDQUFJLENBQUE7UUFDSiwwQ0FBSSxDQUFBO1FBQ0osMERBQVksQ0FBQTtRQUNaLHdDQUFHLENBQUE7SUFDSixDQUFDLEVBaEJpQixTQUFTLHlCQUFULFNBQVMsUUFnQjFCO0lBU0QsTUFBYSxPQUFPO1FBQXBCO1lBMEJDLFVBQUssR0FBVyxFQUFFLENBQUM7WUFDbkIsUUFBRyxHQUFXLENBQUMsQ0FBQztRQW9FakIsQ0FBQztpQkE3RmUsV0FBTSxHQUFnQztZQUNwRCw4QkFBcUIsMEJBQWtCO1lBQ3ZDLHlCQUFnQix5QkFBaUI7WUFDakMseUJBQWdCLHlCQUFpQjtZQUNqQyxtQ0FBeUIsNkJBQXFCO1lBQzlDLG9DQUEwQiw4QkFBc0I7WUFDaEQsNkJBQW9CLDZCQUFxQjtZQUN6Qyx5QkFBZ0IsZ0NBQXdCO1lBQ3hDLHlCQUFlLHdCQUFnQjtZQUMvQix3QkFBZSx5QkFBZ0I7WUFDL0Isd0JBQWUseUJBQWdCO1lBQy9CLGdDQUF1QixpQ0FBd0I7U0FDL0MsQUFab0IsQ0FZbkI7UUFFRixNQUFNLENBQUMsZ0JBQWdCLENBQUMsRUFBVTtZQUNqQyxPQUFPLEVBQUUsNEJBQW1CLElBQUksRUFBRSw0QkFBbUIsQ0FBQztRQUN2RCxDQUFDO1FBRUQsTUFBTSxDQUFDLG1CQUFtQixDQUFDLEVBQVU7WUFDcEMsT0FBTyxFQUFFLGdDQUF1QjttQkFDNUIsQ0FBQyxFQUFFLHVCQUFjLElBQUksRUFBRSx3QkFBYyxDQUFDO21CQUN0QyxDQUFDLEVBQUUsdUJBQWMsSUFBSSxFQUFFLHVCQUFjLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBS0QsSUFBSSxDQUFDLEtBQWE7WUFDakIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDbkIsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFDZCxDQUFDO1FBRUQsU0FBUyxDQUFDLEtBQVk7WUFDckIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNoRCxDQUFDO1FBRUQsSUFBSTtZQUVILElBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRTtnQkFDbEMsT0FBTyxFQUFFLElBQUksd0JBQWUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7YUFDdEQ7WUFFRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO1lBQ3JCLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztZQUNaLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3BDLElBQUksSUFBZSxDQUFDO1lBRXBCLGVBQWU7WUFDZixJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUMxQixJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsRUFBRTtnQkFDN0IsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7Z0JBQ2QsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQzdCO1lBRUQsU0FBUztZQUNULElBQUksT0FBTyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUNqQyxJQUFJLHdCQUFnQixDQUFDO2dCQUNyQixHQUFHO29CQUNGLEdBQUcsSUFBSSxDQUFDLENBQUM7b0JBQ1QsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztpQkFDdEMsUUFBUSxPQUFPLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLEVBQUU7Z0JBRXZDLElBQUksQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDO2dCQUNoQixPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQzthQUMxQjtZQUVELGdCQUFnQjtZQUNoQixJQUFJLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsRUFBRTtnQkFDcEMsSUFBSSxpQ0FBeUIsQ0FBQztnQkFDOUIsR0FBRztvQkFDRixFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO2lCQUMxQyxRQUFRLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsSUFBSSxPQUFPLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLEVBQUU7Z0JBRTFFLElBQUksQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDO2dCQUNoQixPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQzthQUMxQjtZQUdELFNBQVM7WUFDVCxJQUFJLDRCQUFtQixDQUFDO1lBQ3hCLEdBQUc7Z0JBQ0YsR0FBRyxJQUFJLENBQUMsQ0FBQztnQkFDVCxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO2FBQ3RDLFFBQ0EsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO21CQUNQLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxXQUFXLENBQUMsbUJBQW1CO21CQUM3RCxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxhQUFhO21CQUMzQyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxlQUFlO2NBQ2xEO1lBRUYsSUFBSSxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUM7WUFDaEIsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDM0IsQ0FBQzs7SUE5RkYsMEJBK0ZDO0lBRUQsTUFBc0IsTUFBTTtRQUE1QjtZQUtXLGNBQVMsR0FBYSxFQUFFLENBQUM7UUFnRXBDLENBQUM7UUE5REEsV0FBVyxDQUFDLEtBQWE7WUFDeEIsSUFBSSxLQUFLLFlBQVksSUFBSSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLFlBQVksSUFBSSxFQUFFO2dCQUN2RixpREFBaUQ7Z0JBQzFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFFLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUM7YUFDdkU7aUJBQU07Z0JBQ04sMkJBQTJCO2dCQUMzQixLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztnQkFDcEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDM0I7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFRCxPQUFPLENBQUMsS0FBYSxFQUFFLE1BQWdCO1lBQ3RDLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUM7WUFDekIsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDM0MsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0MsV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUM7WUFDdEMsTUFBTSxDQUFDLFNBQVMsR0FBRyxXQUFXLENBQUM7WUFFL0IsQ0FBQyxTQUFTLFVBQVUsQ0FBQyxRQUFrQixFQUFFLE1BQWM7Z0JBQ3RELEtBQUssTUFBTSxLQUFLLElBQUksUUFBUSxFQUFFO29CQUM3QixLQUFLLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztvQkFDdEIsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7aUJBQ2xDO1lBQ0YsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3BCLENBQUM7UUFFRCxJQUFJLFFBQVE7WUFDWCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDdkIsQ0FBQztRQUVELElBQUksbUJBQW1CO1lBQ3RCLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUM5QixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUM7YUFDckU7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFRCxJQUFJLE9BQU87WUFDVixJQUFJLFNBQVMsR0FBVyxJQUFJLENBQUM7WUFDN0IsT0FBTyxJQUFJLEVBQUU7Z0JBQ1osSUFBSSxDQUFDLFNBQVMsRUFBRTtvQkFDZixPQUFPLFNBQVMsQ0FBQztpQkFDakI7Z0JBQ0QsSUFBSSxTQUFTLFlBQVksZUFBZSxFQUFFO29CQUN6QyxPQUFPLFNBQVMsQ0FBQztpQkFDakI7Z0JBQ0QsU0FBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7YUFDN0I7UUFDRixDQUFDO1FBRUQsUUFBUTtZQUNQLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZFLENBQUM7UUFJRCxHQUFHO1lBQ0YsT0FBTyxDQUFDLENBQUM7UUFDVixDQUFDO0tBR0Q7SUFyRUQsd0JBcUVDO0lBRUQsTUFBYSxJQUFLLFNBQVEsTUFBTTtRQUUvQixNQUFNLENBQUMsTUFBTSxDQUFDLEtBQWE7WUFDMUIsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUMxQyxDQUFDO1FBRUQsWUFBbUIsS0FBYTtZQUMvQixLQUFLLEVBQUUsQ0FBQztZQURVLFVBQUssR0FBTCxLQUFLLENBQVE7UUFFaEMsQ0FBQztRQUNRLFFBQVE7WUFDaEIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ25CLENBQUM7UUFDRCxnQkFBZ0I7WUFDZixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2hDLENBQUM7UUFDUSxHQUFHO1lBQ1gsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUMxQixDQUFDO1FBQ0QsS0FBSztZQUNKLE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzdCLENBQUM7S0FDRDtJQXJCRCxvQkFxQkM7SUFFRCxNQUFzQixtQkFBb0IsU0FBUSxNQUFNO0tBRXZEO0lBRkQsa0RBRUM7SUFFRCxNQUFhLFdBQVksU0FBUSxtQkFBbUI7UUFDbkQsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFjLEVBQUUsQ0FBYztZQUNuRCxJQUFJLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRTtnQkFDeEIsT0FBTyxDQUFDLENBQUM7YUFDVDtpQkFBTSxJQUFJLENBQUMsQ0FBQyxjQUFjLEVBQUU7Z0JBQzVCLE9BQU8sQ0FBQyxDQUFDO2FBQ1Q7aUJBQU0sSUFBSSxDQUFDLENBQUMsY0FBYyxFQUFFO2dCQUM1QixPQUFPLENBQUMsQ0FBQyxDQUFDO2FBQ1Y7aUJBQU0sSUFBSSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUU7Z0JBQzdCLE9BQU8sQ0FBQyxDQUFDLENBQUM7YUFDVjtpQkFBTSxJQUFJLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRTtnQkFDN0IsT0FBTyxDQUFDLENBQUM7YUFDVDtpQkFBTTtnQkFDTixPQUFPLENBQUMsQ0FBQzthQUNUO1FBQ0YsQ0FBQztRQUVELFlBQW1CLEtBQWE7WUFDL0IsS0FBSyxFQUFFLENBQUM7WUFEVSxVQUFLLEdBQUwsS0FBSyxDQUFRO1FBRWhDLENBQUM7UUFFRCxJQUFJLGNBQWM7WUFDakIsT0FBTyxJQUFJLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQztRQUN6QixDQUFDO1FBRUQsSUFBSSxNQUFNO1lBQ1QsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsWUFBWSxNQUFNO2dCQUN4RSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQVc7Z0JBQzdCLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDZCxDQUFDO1FBRUQsZ0JBQWdCO1lBQ2YsSUFBSSxlQUFlLEdBQUcsRUFBRSxDQUFDO1lBQ3pCLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDbkIsZUFBZSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQzthQUNwRDtZQUNELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDbEQsT0FBTyxLQUFLLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUN6QjtpQkFBTSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDdEMsT0FBTyxNQUFNLElBQUksQ0FBQyxLQUFLLEdBQUcsZUFBZSxHQUFHLENBQUM7YUFDN0M7aUJBQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUN2QixPQUFPLE1BQU0sSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLElBQUksZUFBZSxHQUFHLENBQUM7YUFDaEY7aUJBQU07Z0JBQ04sT0FBTyxNQUFNLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxlQUFlLEdBQUcsQ0FBQzthQUM5RztRQUNGLENBQUM7UUFFRCxLQUFLO1lBQ0osTUFBTSxHQUFHLEdBQUcsSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3hDLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDbkIsR0FBRyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQ3ZDO1lBQ0QsR0FBRyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQzFELE9BQU8sR0FBRyxDQUFDO1FBQ1osQ0FBQztLQUNEO0lBdkRELGtDQXVEQztJQUVELE1BQWEsTUFBTyxTQUFRLE1BQU07UUFBbEM7O1lBRVUsWUFBTyxHQUFXLEVBQUUsQ0FBQztRQTZCL0IsQ0FBQztRQTNCUyxXQUFXLENBQUMsTUFBYztZQUNsQyxJQUFJLE1BQU0sWUFBWSxJQUFJLEVBQUU7Z0JBQzNCLE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO2dCQUNyQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUMxQjtZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVRLFFBQVE7WUFDaEIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUM5QixDQUFDO1FBRUQsZ0JBQWdCO1lBQ2YsT0FBTyxJQUFJLENBQUMsT0FBTztpQkFDakIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2lCQUN2RCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDYixDQUFDO1FBRVEsR0FBRztZQUNYLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM5QixDQUFDO1FBRUQsS0FBSztZQUNKLE1BQU0sR0FBRyxHQUFHLElBQUksTUFBTSxFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUMzQyxPQUFPLEdBQUcsQ0FBQztRQUNaLENBQUM7S0FDRDtJQS9CRCx3QkErQkM7SUFFRCxNQUFhLFNBQVUsU0FBUSxNQUFNO1FBQXJDOztZQUVDLFdBQU0sR0FBVyxJQUFJLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQThDakMsQ0FBQztRQTVDQSxPQUFPLENBQUMsS0FBYTtZQUNwQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDbkIsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDO1lBQ3JCLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDcEMsUUFBUSxHQUFHLElBQUksQ0FBQztnQkFDaEIsT0FBTyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyRSxDQUFDLENBQUMsQ0FBQztZQUNILHlEQUF5RDtZQUN6RCxnQ0FBZ0M7WUFDaEMsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssWUFBWSxZQUFZLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFO2dCQUN6RyxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUN4QjtZQUNELE9BQU8sR0FBRyxDQUFDO1FBQ1osQ0FBQztRQUVPLFFBQVEsQ0FBQyxNQUFnQjtZQUNoQyxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7WUFDYixLQUFLLE1BQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ3BDLElBQUksTUFBTSxZQUFZLFlBQVksRUFBRTtvQkFDbkMsSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ3ZDLEtBQUssR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUM5QixHQUFHLElBQUksS0FBSyxDQUFDO2lCQUNiO3FCQUFNO29CQUNOLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7aUJBQ3pCO2FBQ0Q7WUFDRCxPQUFPLEdBQUcsQ0FBQztRQUNaLENBQUM7UUFFUSxRQUFRO1lBQ2hCLE9BQU8sRUFBRSxDQUFDO1FBQ1gsQ0FBQztRQUVELGdCQUFnQjtZQUNmLE9BQU8sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDMUosQ0FBQztRQUVELEtBQUs7WUFDSixNQUFNLEdBQUcsR0FBRyxJQUFJLFNBQVMsRUFBRSxDQUFDO1lBQzVCLEdBQUcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hILEdBQUcsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUMxRCxPQUFPLEdBQUcsQ0FBQztRQUNaLENBQUM7S0FFRDtJQWhERCw4QkFnREM7SUFFRCxNQUFhLFlBQWEsU0FBUSxNQUFNO1FBRXZDLFlBQ1UsS0FBYSxFQUNiLGFBQXNCLEVBQ3RCLE9BQWdCLEVBQ2hCLFNBQWtCO1lBRTNCLEtBQUssRUFBRSxDQUFDO1lBTEMsVUFBSyxHQUFMLEtBQUssQ0FBUTtZQUNiLGtCQUFhLEdBQWIsYUFBYSxDQUFTO1lBQ3RCLFlBQU8sR0FBUCxPQUFPLENBQVM7WUFDaEIsY0FBUyxHQUFULFNBQVMsQ0FBUztRQUc1QixDQUFDO1FBRUQsT0FBTyxDQUFDLEtBQWM7WUFDckIsSUFBSSxJQUFJLENBQUMsYUFBYSxLQUFLLFFBQVEsRUFBRTtnQkFDcEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsQ0FBQzthQUMvQztpQkFBTSxJQUFJLElBQUksQ0FBQyxhQUFhLEtBQUssVUFBVSxFQUFFO2dCQUM3QyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2FBQy9DO2lCQUFNLElBQUksSUFBSSxDQUFDLGFBQWEsS0FBSyxZQUFZLEVBQUU7Z0JBQy9DLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDdEU7aUJBQU0sSUFBSSxJQUFJLENBQUMsYUFBYSxLQUFLLFlBQVksRUFBRTtnQkFDL0MsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQy9DO2lCQUFNLElBQUksSUFBSSxDQUFDLGFBQWEsS0FBSyxXQUFXLEVBQUU7Z0JBQzlDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUM5QztpQkFBTSxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxPQUFPLElBQUksQ0FBQyxPQUFPLEtBQUssUUFBUSxFQUFFO2dCQUM5RCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7YUFDcEI7aUJBQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxPQUFPLElBQUksQ0FBQyxTQUFTLEtBQUssUUFBUSxFQUFFO2dCQUNqRSxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7YUFDdEI7aUJBQU07Z0JBQ04sT0FBTyxLQUFLLElBQUksRUFBRSxDQUFDO2FBQ25CO1FBQ0YsQ0FBQztRQUVPLGFBQWEsQ0FBQyxLQUFhO1lBQ2xDLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDWCxPQUFPLEtBQUssQ0FBQzthQUNiO1lBQ0QsT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUN2QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RCxDQUFDLENBQUM7aUJBQ0EsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1osQ0FBQztRQUVPLFlBQVksQ0FBQyxLQUFhO1lBQ2pDLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDWCxPQUFPLEtBQUssQ0FBQzthQUNiO1lBQ0QsT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUNoQyxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7b0JBQ2hCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNyRDtnQkFDRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RCxDQUFDLENBQUM7aUJBQ0EsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1osQ0FBQztRQUVELGdCQUFnQjtZQUNmLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztZQUNqQixLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQztZQUNwQixJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQ3ZCLEtBQUssSUFBSSxLQUFLLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQzthQUVuQztpQkFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDMUMsS0FBSyxJQUFJLEtBQUssSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7YUFDL0M7aUJBQU0sSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUN4QixLQUFLLElBQUksS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDN0I7aUJBQU0sSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUMxQixLQUFLLElBQUksS0FBSyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7YUFDL0I7WUFDRCxLQUFLLElBQUksR0FBRyxDQUFDO1lBQ2IsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRUQsS0FBSztZQUNKLE1BQU0sR0FBRyxHQUFHLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMzRixPQUFPLEdBQUcsQ0FBQztRQUNaLENBQUM7S0FDRDtJQTdFRCxvQ0E2RUM7SUFFRCxNQUFhLFFBQVMsU0FBUSxtQkFBbUI7UUFFaEQsWUFBbUIsSUFBWTtZQUM5QixLQUFLLEVBQUUsQ0FBQztZQURVLFNBQUksR0FBSixJQUFJLENBQVE7UUFFL0IsQ0FBQztRQUVELE9BQU8sQ0FBQyxRQUEwQjtZQUNqQyxJQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25DLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDbkIsS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUMsQ0FBQzthQUM1QztZQUNELElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRTtnQkFDeEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ25DLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFDRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFRCxnQkFBZ0I7WUFDZixJQUFJLGVBQWUsR0FBRyxFQUFFLENBQUM7WUFDekIsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNuQixlQUFlLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2FBQ3BEO1lBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQy9CLE9BQU8sTUFBTSxJQUFJLENBQUMsSUFBSSxHQUFHLGVBQWUsR0FBRyxDQUFDO2FBQzVDO2lCQUFNO2dCQUNOLE9BQU8sTUFBTSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsZUFBZSxHQUFHLENBQUM7YUFDN0c7UUFDRixDQUFDO1FBRUQsS0FBSztZQUNKLE1BQU0sR0FBRyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNwQyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ25CLEdBQUcsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUN2QztZQUNELEdBQUcsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUMxRCxPQUFPLEdBQUcsQ0FBQztRQUNaLENBQUM7S0FDRDtJQXRDRCw0QkFzQ0M7SUFNRCxTQUFTLElBQUksQ0FBQyxNQUFnQixFQUFFLE9BQW9DO1FBQ25FLE1BQU0sS0FBSyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQztRQUMxQixPQUFPLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ3hCLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUcsQ0FBQztZQUM5QixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDaEMsSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDYixNQUFNO2FBQ047WUFDRCxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ2xDO0lBQ0YsQ0FBQztJQUVELE1BQWEsZUFBZ0IsU0FBUSxNQUFNO1FBSTFDLElBQUksZUFBZTtZQUNsQixJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRTtnQkFDeEIsdUJBQXVCO2dCQUN2QixNQUFNLEdBQUcsR0FBa0IsRUFBRSxDQUFDO2dCQUM5QixJQUFJLElBQTZCLENBQUM7Z0JBQ2xDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxTQUFTO29CQUM1QixJQUFJLFNBQVMsWUFBWSxXQUFXLEVBQUU7d0JBQ3JDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7d0JBQ3BCLElBQUksR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO3FCQUNoRTtvQkFDRCxPQUFPLElBQUksQ0FBQztnQkFDYixDQUFDLENBQUMsQ0FBQztnQkFDSCxJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDO2FBQ25DO1lBQ0QsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQzNCLENBQUM7UUFFRCxJQUFJLFlBQVk7WUFDZixNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQztZQUNyQyxPQUFPLEdBQUcsQ0FBQztRQUNaLENBQUM7UUFFRCxNQUFNLENBQUMsTUFBYztZQUNwQixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDWixJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDbEIsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDckIsSUFBSSxTQUFTLEtBQUssTUFBTSxFQUFFO29CQUN6QixLQUFLLEdBQUcsSUFBSSxDQUFDO29CQUNiLE9BQU8sS0FBSyxDQUFDO2lCQUNiO2dCQUNELEdBQUcsSUFBSSxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ3ZCLE9BQU8sSUFBSSxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNYLE9BQU8sQ0FBQyxDQUFDLENBQUM7YUFDVjtZQUNELE9BQU8sR0FBRyxDQUFDO1FBQ1osQ0FBQztRQUVELE9BQU8sQ0FBQyxNQUFjO1lBQ3JCLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztZQUNaLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sQ0FBQyxFQUFFO2dCQUN2QixHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNwQixPQUFPLElBQUksQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxHQUFHLENBQUM7UUFDWixDQUFDO1FBRUQscUJBQXFCLENBQUMsV0FBd0I7WUFDN0MsTUFBTSxHQUFHLEdBQWtCLEVBQUUsQ0FBQztZQUM5QixJQUFJLEVBQUUsTUFBTSxFQUFFLEdBQUcsV0FBVyxDQUFDO1lBQzdCLE9BQU8sTUFBTSxFQUFFO2dCQUNkLElBQUksTUFBTSxZQUFZLFdBQVcsRUFBRTtvQkFDbEMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDakI7Z0JBQ0QsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7YUFDdkI7WUFDRCxPQUFPLEdBQUcsQ0FBQztRQUNaLENBQUM7UUFFRCxnQkFBZ0IsQ0FBQyxRQUEwQjtZQUMxQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUNyQixJQUFJLFNBQVMsWUFBWSxRQUFRLEVBQUU7b0JBQ2xDLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTt3QkFDaEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUM7cUJBQy9CO2lCQUNEO2dCQUNELE9BQU8sSUFBSSxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUM7WUFDSCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFUSxXQUFXLENBQUMsS0FBYTtZQUNqQyxJQUFJLENBQUMsYUFBYSxHQUFHLFNBQVMsQ0FBQztZQUMvQixPQUFPLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakMsQ0FBQztRQUVRLE9BQU8sQ0FBQyxLQUFhLEVBQUUsTUFBZ0I7WUFDL0MsSUFBSSxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUM7WUFDL0IsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBRUQsZ0JBQWdCO1lBQ2YsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMvRSxDQUFDO1FBRUQsS0FBSztZQUNKLE1BQU0sR0FBRyxHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7WUFDbEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQzNELE9BQU8sR0FBRyxDQUFDO1FBQ1osQ0FBQztRQUVELElBQUksQ0FBQyxPQUFvQztZQUN4QyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM5QixDQUFDO0tBQ0Q7SUFwR0QsMENBb0dDO0lBRUQsTUFBYSxhQUFhO1FBQTFCO1lBa0JTLGFBQVEsR0FBWSxJQUFJLE9BQU8sRUFBRSxDQUFDO1lBQ2xDLFdBQU0sR0FBVSxFQUFFLElBQUksd0JBQWUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQXVlakUsQ0FBQztRQXhmQSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQWE7WUFDMUIsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUMxQyxDQUFDO1FBRUQ7OztXQUdHO1FBQ0gsTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFhO1lBQ2hDLE9BQU8sSUFBSSxhQUFhLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDcEQsQ0FBQztRQUVELE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxRQUFnQjtZQUMxQyxPQUFPLGVBQWUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUtELEtBQUssQ0FBQyxLQUFhLEVBQUUsa0JBQTRCLEVBQUUsbUJBQTZCO1lBQy9FLE1BQU0sT0FBTyxHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7WUFDdEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDbkMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxtQkFBbUIsSUFBSSxLQUFLLEVBQUUsa0JBQWtCLElBQUksS0FBSyxDQUFDLENBQUM7WUFDNUYsT0FBTyxPQUFPLENBQUM7UUFDaEIsQ0FBQztRQUVELGFBQWEsQ0FBQyxLQUFhLEVBQUUsT0FBd0I7WUFFcEQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFDdkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ25DLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDNUIsVUFBVTthQUNWO1lBRUQscUVBQXFFO1lBQ3JFLDBFQUEwRTtZQUMxRSxNQUFNLHdCQUF3QixHQUFHLElBQUksR0FBRyxFQUFnQyxDQUFDO1lBQ3pFLE1BQU0sc0JBQXNCLEdBQWtCLEVBQUUsQ0FBQztZQUNqRCxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUNyQixJQUFJLE1BQU0sWUFBWSxXQUFXLEVBQUU7b0JBQ2xDLElBQUksTUFBTSxDQUFDLGNBQWMsRUFBRTt3QkFDMUIsd0JBQXdCLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztxQkFDM0M7eUJBQU0sSUFBSSxDQUFDLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO3dCQUNyRix3QkFBd0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7cUJBQzVEO3lCQUFNO3dCQUNOLHNCQUFzQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztxQkFDcEM7aUJBQ0Q7Z0JBQ0QsT0FBTyxJQUFJLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQztZQUVILE1BQU0sMkJBQTJCLEdBQUcsQ0FBQyxXQUF3QixFQUFFLEtBQWtCLEVBQUUsRUFBRTtnQkFDcEYsTUFBTSxhQUFhLEdBQUcsd0JBQXdCLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDdEUsSUFBSSxDQUFDLGFBQWEsRUFBRTtvQkFDbkIsT0FBTztpQkFDUDtnQkFDRCxNQUFNLEtBQUssR0FBRyxJQUFJLFdBQVcsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2pELEtBQUssQ0FBQyxTQUFTLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQztnQkFDeEMsS0FBSyxNQUFNLEtBQUssSUFBSSxhQUFhLEVBQUU7b0JBQ2xDLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDL0IsS0FBSyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFFNUIsb0RBQW9EO29CQUNwRCxJQUFJLFFBQVEsWUFBWSxXQUFXLElBQUksd0JBQXdCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO3dCQUNsSCxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDMUIsMkJBQTJCLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO3dCQUM3QyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztxQkFDN0I7aUJBQ0Q7Z0JBQ0QsT0FBTyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLENBQUMsQ0FBQztZQUVGLE1BQU0sS0FBSyxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7WUFDaEMsS0FBSyxNQUFNLFdBQVcsSUFBSSxzQkFBc0IsRUFBRTtnQkFDakQsMkJBQTJCLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ2hEO1lBRUQsT0FBTyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBRUQsa0JBQWtCLENBQUMsT0FBd0IsRUFBRSxtQkFBNEIsRUFBRSxrQkFBMkI7WUFFckcsSUFBSSxtQkFBbUIsSUFBSSxrQkFBa0IsSUFBSSxPQUFPLENBQUMsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ2pGLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDbkUsSUFBSSxDQUFDLFlBQVksRUFBRTtvQkFDbEIsMkNBQTJDO29CQUMzQyw2Q0FBNkM7b0JBQzdDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDeEM7YUFDRDtRQUVGLENBQUM7UUFJTyxPQUFPLENBQUMsSUFBZSxFQUFFLEtBQWU7WUFDL0MsSUFBSSxJQUFJLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRTtnQkFDcEQsTUFBTSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNqRSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ25DLE9BQU8sR0FBRyxDQUFDO2FBQ1g7WUFDRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFTyxPQUFPLENBQUMsS0FBWTtZQUMzQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7WUFDMUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7WUFDcEIsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRU8sTUFBTSxDQUFDLElBQWU7WUFDN0IsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUMxQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRTtnQkFDakMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksMkJBQWtCLEVBQUU7b0JBQ3ZDLE9BQU8sS0FBSyxDQUFDO2lCQUNiO3FCQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLGdDQUF3QixFQUFFO29CQUNwRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO29CQUN2QyxJQUFJLFNBQVMsQ0FBQyxJQUFJLDZCQUFxQjsyQkFDbkMsU0FBUyxDQUFDLElBQUksaUNBQXlCOzJCQUN2QyxTQUFTLENBQUMsSUFBSSxnQ0FBd0IsRUFBRTt3QkFDM0MsT0FBTyxLQUFLLENBQUM7cUJBQ2I7aUJBQ0Q7Z0JBQ0QsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO2FBQ25DO1lBQ0QsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3RHLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNuQyxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFTyxNQUFNLENBQUMsTUFBYztZQUM1QixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDO21CQUM3QixJQUFJLENBQUMsMkJBQTJCLENBQUMsTUFBTSxDQUFDO21CQUN4QyxJQUFJLENBQUMsd0JBQXdCLENBQUMsTUFBTSxDQUFDO21CQUNyQyxJQUFJLENBQUMscUJBQXFCLENBQUMsTUFBTSxDQUFDO21CQUNsQyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFFRCwwQkFBMEI7UUFDbEIsYUFBYSxDQUFDLE1BQWM7WUFDbkMsSUFBSSxLQUFhLENBQUM7WUFDbEIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sOEJBQXNCLElBQUksQ0FBQyxFQUFFO2dCQUNwRCwwREFBMEQ7Z0JBQzFELEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTywyQkFBbUIsSUFBSSxDQUFDO3VCQUN4QyxJQUFJLENBQUMsT0FBTywrQkFBdUIsSUFBSSxDQUFDO3VCQUN4QyxJQUFJLENBQUMsT0FBTyw4QkFBc0IsSUFBSSxDQUFDO3VCQUN2QyxLQUFLLENBQUM7Z0JBRVYsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNwQyxPQUFPLElBQUksQ0FBQzthQUNaO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRUQsa0NBQWtDO1FBQzFCLDJCQUEyQixDQUFDLE1BQWM7WUFDakQsSUFBSSxLQUFhLENBQUM7WUFDbEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUMxQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTywwQkFBa0I7bUJBQ3hDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLGlDQUF5QixJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyx3QkFBZ0IsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUU5RixJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNYLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUMzQjtZQUVELE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFNLENBQUM7Z0JBQ3RDLENBQUMsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBTSxDQUFDLENBQUM7Z0JBQ2pDLENBQUMsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxLQUFNLENBQUMsQ0FDdEIsQ0FBQztZQUNGLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVELHVDQUF1QztRQUMvQix3QkFBd0IsQ0FBQyxNQUFjO1lBQzlDLElBQUksS0FBYSxDQUFDO1lBQ2xCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDMUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sMEJBQWtCO21CQUN4QyxJQUFJLENBQUMsT0FBTyw2QkFBcUI7bUJBQ2pDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLHdCQUFnQixJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRWhELElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ1gsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzNCO1lBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxXQUFXLENBQUMsTUFBTSxDQUFDLEtBQU0sQ0FBQyxDQUFDLENBQUM7WUFFcEQsSUFBSSxJQUFJLENBQUMsT0FBTyx5QkFBaUIsRUFBRTtnQkFDbEMsa0JBQWtCO2dCQUNsQixPQUFPLElBQUksRUFBRTtvQkFFWixlQUFlO29CQUNmLElBQUksSUFBSSxDQUFDLE9BQU8sOEJBQXNCLEVBQUU7d0JBQ3ZDLE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7d0JBQ2hDLE9BQU8sSUFBSSxDQUFDO3FCQUNaO29CQUVELElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRTt3QkFDN0IsU0FBUztxQkFDVDtvQkFFRCxXQUFXO29CQUNYLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUNsRCxXQUFXLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO29CQUN6RCxPQUFPLElBQUksQ0FBQztpQkFDWjthQUNEO2lCQUFNLElBQUksV0FBVyxDQUFDLEtBQUssR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sd0JBQWdCLEVBQUU7Z0JBQ2pFLHNCQUFzQjtnQkFDdEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQztnQkFFNUIsT0FBTyxJQUFJLEVBQUU7b0JBQ1osSUFBSSxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBRXJDLElBQUksSUFBSSxDQUFDLE9BQU8seUJBQWlCLEVBQUU7NEJBQ2xDLGVBQWU7NEJBQ2YsU0FBUzt5QkFDVDt3QkFFRCxJQUFJLElBQUksQ0FBQyxPQUFPLHdCQUFnQixFQUFFOzRCQUNqQyxXQUFXLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDOzRCQUNoQyxJQUFJLElBQUksQ0FBQyxPQUFPLDhCQUFzQixFQUFFO2dDQUN2QyxlQUFlO2dDQUNmLE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7Z0NBQ2hDLE9BQU8sSUFBSSxDQUFDOzZCQUNaO3lCQUNEO3FCQUNEO29CQUVELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ3BCLE9BQU8sS0FBSyxDQUFDO2lCQUNiO2FBRUQ7aUJBQU0sSUFBSSxJQUFJLENBQUMsT0FBTyxnQ0FBd0IsRUFBRTtnQkFDaEQsa0NBQWtDO2dCQUNsQyxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLEVBQUU7b0JBQ3RDLE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBQ2hDLE9BQU8sSUFBSSxDQUFDO2lCQUNaO2dCQUVELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3BCLE9BQU8sS0FBSyxDQUFDO2FBRWI7aUJBQU0sSUFBSSxJQUFJLENBQUMsT0FBTyw4QkFBc0IsRUFBRTtnQkFDOUMsT0FBTztnQkFDUCxNQUFNLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUNoQyxPQUFPLElBQUksQ0FBQzthQUVaO2lCQUFNO2dCQUNOLGdDQUFnQztnQkFDaEMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzNCO1FBQ0YsQ0FBQztRQUVPLG1CQUFtQixDQUFDLE1BQWM7WUFDekMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUMxQixNQUFNLE1BQU0sR0FBYSxFQUFFLENBQUM7WUFFNUIsT0FBTyxJQUFJLEVBQUU7Z0JBQ1osSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksNEJBQW9CLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLDJCQUFtQixFQUFFO29CQUNoRixNQUFNO2lCQUNOO2dCQUNELElBQUksS0FBYSxDQUFDO2dCQUNsQixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyw4QkFBc0IsSUFBSSxDQUFDLEVBQUU7b0JBQ3BELGVBQWU7b0JBQ2YsS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLDBCQUFrQixJQUFJLENBQUM7MkJBQ3ZDLElBQUksQ0FBQyxPQUFPLHlCQUFpQixJQUFJLENBQUM7MkJBQ2xDLElBQUksQ0FBQyxPQUFPLDhCQUFzQixJQUFJLENBQUM7MkJBQ3ZDLEtBQUssQ0FBQztpQkFDVjtxQkFBTTtvQkFDTixLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7aUJBQ3RDO2dCQUNELElBQUksQ0FBQyxLQUFLLEVBQUU7b0JBQ1gsTUFBTTtvQkFDTixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNwQixPQUFPLEtBQUssQ0FBQztpQkFDYjtnQkFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ25CO1lBRUQsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDeEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDcEIsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUMsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRUQsd0NBQXdDO1FBQ2hDLHFCQUFxQixDQUFDLE1BQWM7WUFDM0MsSUFBSSxJQUFZLENBQUM7WUFDakIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUMxQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTywwQkFBa0I7bUJBQ3hDLElBQUksQ0FBQyxPQUFPLDZCQUFxQjttQkFDakMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8saUNBQXlCLElBQUksQ0FBQyxDQUFDLENBQUM7WUFFeEQsSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDWCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDM0I7WUFFRCxNQUFNLFFBQVEsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFLLENBQUMsQ0FBQztZQUVyQyxJQUFJLElBQUksQ0FBQyxPQUFPLHlCQUFpQixFQUFFO2dCQUNsQyxvQkFBb0I7Z0JBQ3BCLE9BQU8sSUFBSSxFQUFFO29CQUVaLGVBQWU7b0JBQ2YsSUFBSSxJQUFJLENBQUMsT0FBTyw4QkFBc0IsRUFBRTt3QkFDdkMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQzt3QkFDN0IsT0FBTyxJQUFJLENBQUM7cUJBQ1o7b0JBRUQsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFO3dCQUMxQixTQUFTO3FCQUNUO29CQUVELFdBQVc7b0JBQ1gsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ2pELFFBQVEsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7b0JBQ3RELE9BQU8sSUFBSSxDQUFDO2lCQUNaO2FBRUQ7aUJBQU0sSUFBSSxJQUFJLENBQUMsT0FBTyxnQ0FBd0IsRUFBRTtnQkFDaEQsb0NBQW9DO2dCQUNwQyxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLEVBQUU7b0JBQ25DLE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQzdCLE9BQU8sSUFBSSxDQUFDO2lCQUNaO2dCQUVELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3BCLE9BQU8sS0FBSyxDQUFDO2FBRWI7aUJBQU0sSUFBSSxJQUFJLENBQUMsT0FBTyw4QkFBc0IsRUFBRTtnQkFDOUMsU0FBUztnQkFDVCxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUM3QixPQUFPLElBQUksQ0FBQzthQUVaO2lCQUFNO2dCQUNOLGtDQUFrQztnQkFDbEMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzNCO1FBQ0YsQ0FBQztRQUVPLGVBQWUsQ0FBQyxNQUEyQjtZQUNsRCxpQ0FBaUM7WUFFakMsTUFBTSxTQUFTLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQztZQUNsQyxJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7WUFDcEIsSUFBSSxZQUFZLEdBQUcsRUFBRSxDQUFDO1lBRXRCLGFBQWE7WUFDYixPQUFPLElBQUksRUFBRTtnQkFDWixJQUFJLElBQUksQ0FBQyxPQUFPLGdDQUF3QixFQUFFO29CQUN6QyxNQUFNO2lCQUNOO2dCQUVELElBQUksT0FBZSxDQUFDO2dCQUNwQixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyw4QkFBc0IsSUFBSSxDQUFDLEVBQUU7b0JBQ3RELE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxpQ0FBeUIsSUFBSSxDQUFDLElBQUksT0FBTyxDQUFDO29CQUNoRSxVQUFVLElBQUksT0FBTyxDQUFDO29CQUN0QixTQUFTO2lCQUNUO2dCQUVELElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLDJCQUFrQixFQUFFO29CQUN2QyxVQUFVLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQzVDLFNBQVM7aUJBQ1Q7Z0JBQ0QsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELGNBQWM7WUFDZCxPQUFPLElBQUksRUFBRTtnQkFDWixJQUFJLElBQUksQ0FBQyxPQUFPLGdDQUF3QixFQUFFO29CQUN6QyxNQUFNO2lCQUNOO2dCQUVELElBQUksT0FBZSxDQUFDO2dCQUNwQixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyw4QkFBc0IsSUFBSSxDQUFDLEVBQUU7b0JBQ3RELE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyw4QkFBc0IsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8saUNBQXlCLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQztvQkFDM0csU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO29CQUN6QyxTQUFTO2lCQUNUO2dCQUVELElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLEVBQUU7b0JBQ3pFLFNBQVM7aUJBQ1Q7Z0JBQ0QsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELGNBQWM7WUFDZCxPQUFPLElBQUksRUFBRTtnQkFDWixJQUFJLElBQUksQ0FBQyxPQUFPLDhCQUFzQixFQUFFO29CQUN2QyxNQUFNO2lCQUNOO2dCQUNELElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLDJCQUFrQixFQUFFO29CQUN2QyxZQUFZLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQzlDLFNBQVM7aUJBQ1Q7Z0JBQ0QsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELElBQUk7Z0JBQ0gsU0FBUyxDQUFDLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUM7YUFDeEQ7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDWCxpQkFBaUI7Z0JBQ2pCLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFFRCxNQUFNLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztZQUM3QixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTyxrQkFBa0IsQ0FBQyxNQUFpQjtZQUUzQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTywwQkFBa0IsRUFBRTtnQkFDcEMsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQztZQUNwQixJQUFJLElBQUksQ0FBQyxPQUFPLDZCQUFxQixFQUFFO2dCQUN0QyxPQUFPLEdBQUcsSUFBSSxDQUFDO2FBQ2Y7WUFFRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyx3QkFBZ0IsSUFBSSxDQUFDLENBQUM7WUFFaEQsSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDWCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNwQixPQUFPLEtBQUssQ0FBQzthQUViO2lCQUFNLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ3BCLEtBQUs7Z0JBQ0wsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLFlBQVksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNwRCxPQUFPLElBQUksQ0FBQzthQUVaO2lCQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sOEJBQXNCLEVBQUU7Z0JBQzlDLE9BQU87Z0JBQ1AsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLFlBQVksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNwRCxPQUFPLElBQUksQ0FBQzthQUVaO2lCQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyx5QkFBaUIsRUFBRTtnQkFDMUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDcEIsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELElBQUksSUFBSSxDQUFDLE9BQU8sZ0NBQXdCLEVBQUU7Z0JBQ3pDLGVBQWU7Z0JBQ2YsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8saUNBQXlCLElBQUksQ0FBQyxDQUFDO2dCQUM3RCxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sOEJBQXNCLEVBQUU7b0JBQ3RELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ3BCLE9BQU8sS0FBSyxDQUFDO2lCQUNiO3FCQUFNO29CQUNOLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxZQUFZLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7b0JBQy9ELE9BQU8sSUFBSSxDQUFDO2lCQUNaO2FBRUQ7aUJBQU0sSUFBSSxJQUFJLENBQUMsT0FBTyx5QkFBZ0IsRUFBRTtnQkFDeEMsYUFBYTtnQkFDYixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSw4QkFBc0IsQ0FBQztnQkFDbEQsSUFBSSxPQUFPLEVBQUU7b0JBQ1osTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLFlBQVksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO29CQUNuRixPQUFPLElBQUksQ0FBQztpQkFDWjthQUVEO2lCQUFNLElBQUksSUFBSSxDQUFDLE9BQU8seUJBQWdCLEVBQUU7Z0JBQ3hDLGVBQWU7Z0JBQ2YsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sOEJBQXNCLENBQUM7Z0JBQ3BELElBQUksU0FBUyxFQUFFO29CQUNkLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxZQUFZLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFDckYsT0FBTyxJQUFJLENBQUM7aUJBQ1o7YUFFRDtpQkFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLGlDQUF3QixFQUFFO2dCQUNoRCxvQkFBb0I7Z0JBQ3BCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLHlCQUFpQixDQUFDO2dCQUM3QyxJQUFJLE9BQU8sRUFBRTtvQkFDWixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSw4QkFBc0IsQ0FBQztvQkFDcEQsSUFBSSxTQUFTLEVBQUU7d0JBQ2QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLFlBQVksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO3dCQUNuRixPQUFPLElBQUksQ0FBQztxQkFDWjtpQkFDRDthQUVEO2lCQUFNO2dCQUNOLGNBQWM7Z0JBQ2QsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sOEJBQXNCLENBQUM7Z0JBQ3BELElBQUksU0FBUyxFQUFFO29CQUNkLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxZQUFZLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFDckYsT0FBTyxJQUFJLENBQUM7aUJBQ1o7YUFDRDtZQUVELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDcEIsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRU8sY0FBYyxDQUFDLE1BQWM7WUFDcEMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksMkJBQWtCLEVBQUU7Z0JBQ3ZDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbkUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDeEIsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztLQUNEO0lBMWZELHNDQTBmQyJ9