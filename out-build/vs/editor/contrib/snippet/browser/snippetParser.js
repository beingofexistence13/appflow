/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$G5 = exports.$F5 = exports.$E5 = exports.$D5 = exports.$C5 = exports.$B5 = exports.$A5 = exports.$z5 = exports.$y5 = exports.$x5 = exports.$w5 = exports.TokenType = void 0;
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
    class $w5 {
        constructor() {
            this.value = '';
            this.pos = 0;
        }
        static { this.d = {
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
            type = $w5.d[ch];
            if (typeof type === 'number') {
                this.pos += 1;
                return { type, pos, len: 1 };
            }
            // number
            if ($w5.isDigitCharacter(ch)) {
                type = 8 /* TokenType.Int */;
                do {
                    len += 1;
                    ch = this.value.charCodeAt(pos + len);
                } while ($w5.isDigitCharacter(ch));
                this.pos += len;
                return { type, pos, len };
            }
            // variable name
            if ($w5.isVariableCharacter(ch)) {
                type = 9 /* TokenType.VariableName */;
                do {
                    ch = this.value.charCodeAt(pos + (++len));
                } while ($w5.isVariableCharacter(ch) || $w5.isDigitCharacter(ch));
                this.pos += len;
                return { type, pos, len };
            }
            // format
            type = 10 /* TokenType.Format */;
            do {
                len += 1;
                ch = this.value.charCodeAt(pos + len);
            } while (!isNaN(ch)
                && typeof $w5.d[ch] === 'undefined' // not static token
                && !$w5.isDigitCharacter(ch) // not number
                && !$w5.isVariableCharacter(ch) // not variable
            );
            this.pos += len;
            return { type, pos, len };
        }
    }
    exports.$w5 = $w5;
    class $x5 {
        constructor() {
            this.d = [];
        }
        appendChild(child) {
            if (child instanceof $y5 && this.d[this.d.length - 1] instanceof $y5) {
                // this and previous child are text -> merge them
                this.d[this.d.length - 1].value += child.value;
            }
            else {
                // normal adoption of child
                child.parent = this;
                this.d.push(child);
            }
            return this;
        }
        replace(child, others) {
            const { parent } = child;
            const idx = parent.children.indexOf(child);
            const newChildren = parent.children.slice(0);
            newChildren.splice(idx, 1, ...others);
            parent.d = newChildren;
            (function _fixParent(children, parent) {
                for (const child of children) {
                    child.parent = parent;
                    _fixParent(child.children, child);
                }
            })(others, parent);
        }
        get children() {
            return this.d;
        }
        get rightMostDescendant() {
            if (this.d.length > 0) {
                return this.d[this.d.length - 1].rightMostDescendant;
            }
            return this;
        }
        get snippet() {
            let candidate = this;
            while (true) {
                if (!candidate) {
                    return undefined;
                }
                if (candidate instanceof $F5) {
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
    exports.$x5 = $x5;
    class $y5 extends $x5 {
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
            return $y5.escape(this.value);
        }
        len() {
            return this.value.length;
        }
        clone() {
            return new $y5(this.value);
        }
    }
    exports.$y5 = $y5;
    class $z5 extends $x5 {
    }
    exports.$z5 = $z5;
    class $A5 extends $z5 {
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
            return this.d.length === 1 && this.d[0] instanceof $B5
                ? this.d[0]
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
            const ret = new $A5(this.index);
            if (this.transform) {
                ret.transform = this.transform.clone();
            }
            ret.d = this.children.map(child => child.clone());
            return ret;
        }
    }
    exports.$A5 = $A5;
    class $B5 extends $x5 {
        constructor() {
            super(...arguments);
            this.options = [];
        }
        appendChild(marker) {
            if (marker instanceof $y5) {
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
            const ret = new $B5();
            this.options.forEach(ret.appendChild, ret);
            return ret;
        }
    }
    exports.$B5 = $B5;
    class $C5 extends $x5 {
        constructor() {
            super(...arguments);
            this.regexp = new RegExp('');
        }
        resolve(value) {
            const _this = this;
            let didMatch = false;
            let ret = value.replace(this.regexp, function () {
                didMatch = true;
                return _this.f(Array.prototype.slice.call(arguments, 0, -2));
            });
            // when the regex didn't match and when the transform has
            // else branches, then run those
            if (!didMatch && this.d.some(child => child instanceof $D5 && Boolean(child.elseValue))) {
                ret = this.f([]);
            }
            return ret;
        }
        f(groups) {
            let ret = '';
            for (const marker of this.d) {
                if (marker instanceof $D5) {
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
            const ret = new $C5();
            ret.regexp = new RegExp(this.regexp.source, '' + (this.regexp.ignoreCase ? 'i' : '') + (this.regexp.global ? 'g' : ''));
            ret.d = this.children.map(child => child.clone());
            return ret;
        }
    }
    exports.$C5 = $C5;
    class $D5 extends $x5 {
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
                return !value ? '' : this.f(value);
            }
            else if (this.shorthandName === 'camelcase') {
                return !value ? '' : this.g(value);
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
        f(value) {
            const match = value.match(/[a-z0-9]+/gi);
            if (!match) {
                return value;
            }
            return match.map(word => {
                return word.charAt(0).toUpperCase() + word.substr(1);
            })
                .join('');
        }
        g(value) {
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
            const ret = new $D5(this.index, this.shorthandName, this.ifValue, this.elseValue);
            return ret;
        }
    }
    exports.$D5 = $D5;
    class $E5 extends $z5 {
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
                this.d = [new $y5(value)];
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
            const ret = new $E5(this.name);
            if (this.transform) {
                ret.transform = this.transform.clone();
            }
            ret.d = this.children.map(child => child.clone());
            return ret;
        }
    }
    exports.$E5 = $E5;
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
    class $F5 extends $x5 {
        get placeholderInfo() {
            if (!this.f) {
                // fill in placeholders
                const all = [];
                let last;
                this.walk(function (candidate) {
                    if (candidate instanceof $A5) {
                        all.push(candidate);
                        last = !last || last.index < candidate.index ? candidate : last;
                    }
                    return true;
                });
                this.f = { all, last };
            }
            return this.f;
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
                if (parent instanceof $A5) {
                    ret.push(parent);
                }
                parent = parent.parent;
            }
            return ret;
        }
        resolveVariables(resolver) {
            this.walk(candidate => {
                if (candidate instanceof $E5) {
                    if (candidate.resolve(resolver)) {
                        this.f = undefined;
                    }
                }
                return true;
            });
            return this;
        }
        appendChild(child) {
            this.f = undefined;
            return super.appendChild(child);
        }
        replace(child, others) {
            this.f = undefined;
            return super.replace(child, others);
        }
        toTextmateString() {
            return this.children.reduce((prev, cur) => prev + cur.toTextmateString(), '');
        }
        clone() {
            const ret = new $F5();
            this.d = this.children.map(child => child.clone());
            return ret;
        }
        walk(visitor) {
            walk(this.children, visitor);
        }
    }
    exports.$F5 = $F5;
    class $G5 {
        constructor() {
            this.d = new $w5();
            this.f = { type: 14 /* TokenType.EOF */, pos: 0, len: 0 };
        }
        static escape(value) {
            return value.replace(/\$|}|\\/g, '\\$&');
        }
        /**
         * Takes a snippet and returns the insertable string, e.g return the snippet-string
         * without any placeholder, tabstop, variables etc...
         */
        static asInsertText(value) {
            return new $G5().parse(value).toString();
        }
        static guessNeedsClipboard(template) {
            return /\${?CLIPBOARD/.test(template);
        }
        parse(value, insertFinalTabstop, enforceFinalTabstop) {
            const snippet = new $F5();
            this.parseFragment(value, snippet);
            this.ensureFinalTabstop(snippet, enforceFinalTabstop ?? false, insertFinalTabstop ?? false);
            return snippet;
        }
        parseFragment(value, snippet) {
            const offset = snippet.children.length;
            this.d.text(value);
            this.f = this.d.next();
            while (this.j(snippet)) {
                // nothing
            }
            // fill in values for placeholders. the first placeholder of an index
            // that has a value defines the value for all placeholders with that index
            const placeholderDefaultValues = new Map();
            const incompletePlaceholders = [];
            snippet.walk(marker => {
                if (marker instanceof $A5) {
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
                const clone = new $A5(placeholder.index);
                clone.transform = placeholder.transform;
                for (const child of defaultValues) {
                    const newChild = child.clone();
                    clone.appendChild(newChild);
                    // "recurse" on children that are again placeholders
                    if (newChild instanceof $A5 && placeholderDefaultValues.has(newChild.index) && !stack.has(newChild.index)) {
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
                    snippet.appendChild(new $A5(0));
                }
            }
        }
        g(type, value) {
            if (type === undefined || this.f.type === type) {
                const ret = !value ? true : this.d.tokenText(this.f);
                this.f = this.d.next();
                return ret;
            }
            return false;
        }
        h(token) {
            this.d.pos = token.pos + token.len;
            this.f = token;
            return false;
        }
        i(type) {
            const start = this.f;
            while (this.f.type !== type) {
                if (this.f.type === 14 /* TokenType.EOF */) {
                    return false;
                }
                else if (this.f.type === 5 /* TokenType.Backslash */) {
                    const nextToken = this.d.next();
                    if (nextToken.type !== 0 /* TokenType.Dollar */
                        && nextToken.type !== 4 /* TokenType.CurlyClose */
                        && nextToken.type !== 5 /* TokenType.Backslash */) {
                        return false;
                    }
                }
                this.f = this.d.next();
            }
            const value = this.d.value.substring(start.pos, this.f.pos).replace(/\\(\$|}|\\)/g, '$1');
            this.f = this.d.next();
            return value;
        }
        j(marker) {
            return this.k(marker)
                || this.l(marker)
                || this.m(marker)
                || this.o(marker)
                || this.s(marker);
        }
        // \$, \\, \} -> just text
        k(marker) {
            let value;
            if (value = this.g(5 /* TokenType.Backslash */, true)) {
                // saw a backslash, append escaped token or that backslash
                value = this.g(0 /* TokenType.Dollar */, true)
                    || this.g(4 /* TokenType.CurlyClose */, true)
                    || this.g(5 /* TokenType.Backslash */, true)
                    || value;
                marker.appendChild(new $y5(value));
                return true;
            }
            return false;
        }
        // $foo -> variable, $1 -> tabstop
        l(parent) {
            let value;
            const token = this.f;
            const match = this.g(0 /* TokenType.Dollar */)
                && (value = this.g(9 /* TokenType.VariableName */, true) || this.g(8 /* TokenType.Int */, true));
            if (!match) {
                return this.h(token);
            }
            parent.appendChild(/^\d+$/.test(value)
                ? new $A5(Number(value))
                : new $E5(value));
            return true;
        }
        // ${1:<children>}, ${1} -> placeholder
        m(parent) {
            let index;
            const token = this.f;
            const match = this.g(0 /* TokenType.Dollar */)
                && this.g(3 /* TokenType.CurlyOpen */)
                && (index = this.g(8 /* TokenType.Int */, true));
            if (!match) {
                return this.h(token);
            }
            const placeholder = new $A5(Number(index));
            if (this.g(1 /* TokenType.Colon */)) {
                // ${1:<children>}
                while (true) {
                    // ...} -> done
                    if (this.g(4 /* TokenType.CurlyClose */)) {
                        parent.appendChild(placeholder);
                        return true;
                    }
                    if (this.j(placeholder)) {
                        continue;
                    }
                    // fallback
                    parent.appendChild(new $y5('${' + index + ':'));
                    placeholder.children.forEach(parent.appendChild, parent);
                    return true;
                }
            }
            else if (placeholder.index > 0 && this.g(7 /* TokenType.Pipe */)) {
                // ${1|one,two,three|}
                const choice = new $B5();
                while (true) {
                    if (this.n(choice)) {
                        if (this.g(2 /* TokenType.Comma */)) {
                            // opt, -> more
                            continue;
                        }
                        if (this.g(7 /* TokenType.Pipe */)) {
                            placeholder.appendChild(choice);
                            if (this.g(4 /* TokenType.CurlyClose */)) {
                                // ..|} -> done
                                parent.appendChild(placeholder);
                                return true;
                            }
                        }
                    }
                    this.h(token);
                    return false;
                }
            }
            else if (this.g(6 /* TokenType.Forwardslash */)) {
                // ${1/<regex>/<format>/<options>}
                if (this.q(placeholder)) {
                    parent.appendChild(placeholder);
                    return true;
                }
                this.h(token);
                return false;
            }
            else if (this.g(4 /* TokenType.CurlyClose */)) {
                // ${1}
                parent.appendChild(placeholder);
                return true;
            }
            else {
                // ${1 <- missing curly or colon
                return this.h(token);
            }
        }
        n(parent) {
            const token = this.f;
            const values = [];
            while (true) {
                if (this.f.type === 2 /* TokenType.Comma */ || this.f.type === 7 /* TokenType.Pipe */) {
                    break;
                }
                let value;
                if (value = this.g(5 /* TokenType.Backslash */, true)) {
                    // \, \|, or \\
                    value = this.g(2 /* TokenType.Comma */, true)
                        || this.g(7 /* TokenType.Pipe */, true)
                        || this.g(5 /* TokenType.Backslash */, true)
                        || value;
                }
                else {
                    value = this.g(undefined, true);
                }
                if (!value) {
                    // EOF
                    this.h(token);
                    return false;
                }
                values.push(value);
            }
            if (values.length === 0) {
                this.h(token);
                return false;
            }
            parent.appendChild(new $y5(values.join('')));
            return true;
        }
        // ${foo:<children>}, ${foo} -> variable
        o(parent) {
            let name;
            const token = this.f;
            const match = this.g(0 /* TokenType.Dollar */)
                && this.g(3 /* TokenType.CurlyOpen */)
                && (name = this.g(9 /* TokenType.VariableName */, true));
            if (!match) {
                return this.h(token);
            }
            const variable = new $E5(name);
            if (this.g(1 /* TokenType.Colon */)) {
                // ${foo:<children>}
                while (true) {
                    // ...} -> done
                    if (this.g(4 /* TokenType.CurlyClose */)) {
                        parent.appendChild(variable);
                        return true;
                    }
                    if (this.j(variable)) {
                        continue;
                    }
                    // fallback
                    parent.appendChild(new $y5('${' + name + ':'));
                    variable.children.forEach(parent.appendChild, parent);
                    return true;
                }
            }
            else if (this.g(6 /* TokenType.Forwardslash */)) {
                // ${foo/<regex>/<format>/<options>}
                if (this.q(variable)) {
                    parent.appendChild(variable);
                    return true;
                }
                this.h(token);
                return false;
            }
            else if (this.g(4 /* TokenType.CurlyClose */)) {
                // ${foo}
                parent.appendChild(variable);
                return true;
            }
            else {
                // ${foo <- missing curly or colon
                return this.h(token);
            }
        }
        q(parent) {
            // ...<regex>/<format>/<options>}
            const transform = new $C5();
            let regexValue = '';
            let regexOptions = '';
            // (1) /regex
            while (true) {
                if (this.g(6 /* TokenType.Forwardslash */)) {
                    break;
                }
                let escaped;
                if (escaped = this.g(5 /* TokenType.Backslash */, true)) {
                    escaped = this.g(6 /* TokenType.Forwardslash */, true) || escaped;
                    regexValue += escaped;
                    continue;
                }
                if (this.f.type !== 14 /* TokenType.EOF */) {
                    regexValue += this.g(undefined, true);
                    continue;
                }
                return false;
            }
            // (2) /format
            while (true) {
                if (this.g(6 /* TokenType.Forwardslash */)) {
                    break;
                }
                let escaped;
                if (escaped = this.g(5 /* TokenType.Backslash */, true)) {
                    escaped = this.g(5 /* TokenType.Backslash */, true) || this.g(6 /* TokenType.Forwardslash */, true) || escaped;
                    transform.appendChild(new $y5(escaped));
                    continue;
                }
                if (this.r(transform) || this.s(transform)) {
                    continue;
                }
                return false;
            }
            // (3) /option
            while (true) {
                if (this.g(4 /* TokenType.CurlyClose */)) {
                    break;
                }
                if (this.f.type !== 14 /* TokenType.EOF */) {
                    regexOptions += this.g(undefined, true);
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
        r(parent) {
            const token = this.f;
            if (!this.g(0 /* TokenType.Dollar */)) {
                return false;
            }
            let complex = false;
            if (this.g(3 /* TokenType.CurlyOpen */)) {
                complex = true;
            }
            const index = this.g(8 /* TokenType.Int */, true);
            if (!index) {
                this.h(token);
                return false;
            }
            else if (!complex) {
                // $1
                parent.appendChild(new $D5(Number(index)));
                return true;
            }
            else if (this.g(4 /* TokenType.CurlyClose */)) {
                // ${1}
                parent.appendChild(new $D5(Number(index)));
                return true;
            }
            else if (!this.g(1 /* TokenType.Colon */)) {
                this.h(token);
                return false;
            }
            if (this.g(6 /* TokenType.Forwardslash */)) {
                // ${1:/upcase}
                const shorthand = this.g(9 /* TokenType.VariableName */, true);
                if (!shorthand || !this.g(4 /* TokenType.CurlyClose */)) {
                    this.h(token);
                    return false;
                }
                else {
                    parent.appendChild(new $D5(Number(index), shorthand));
                    return true;
                }
            }
            else if (this.g(11 /* TokenType.Plus */)) {
                // ${1:+<if>}
                const ifValue = this.i(4 /* TokenType.CurlyClose */);
                if (ifValue) {
                    parent.appendChild(new $D5(Number(index), undefined, ifValue, undefined));
                    return true;
                }
            }
            else if (this.g(12 /* TokenType.Dash */)) {
                // ${2:-<else>}
                const elseValue = this.i(4 /* TokenType.CurlyClose */);
                if (elseValue) {
                    parent.appendChild(new $D5(Number(index), undefined, undefined, elseValue));
                    return true;
                }
            }
            else if (this.g(13 /* TokenType.QuestionMark */)) {
                // ${2:?<if>:<else>}
                const ifValue = this.i(1 /* TokenType.Colon */);
                if (ifValue) {
                    const elseValue = this.i(4 /* TokenType.CurlyClose */);
                    if (elseValue) {
                        parent.appendChild(new $D5(Number(index), undefined, ifValue, elseValue));
                        return true;
                    }
                }
            }
            else {
                // ${1:<else>}
                const elseValue = this.i(4 /* TokenType.CurlyClose */);
                if (elseValue) {
                    parent.appendChild(new $D5(Number(index), undefined, undefined, elseValue));
                    return true;
                }
            }
            this.h(token);
            return false;
        }
        s(marker) {
            if (this.f.type !== 14 /* TokenType.EOF */) {
                marker.appendChild(new $y5(this.d.tokenText(this.f)));
                this.g(undefined);
                return true;
            }
            return false;
        }
    }
    exports.$G5 = $G5;
});
//# sourceMappingURL=snippetParser.js.map