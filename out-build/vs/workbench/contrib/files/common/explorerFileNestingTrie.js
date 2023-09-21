/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$tHb = exports.$sHb = exports.$rHb = void 0;
    /**
     * A sort of double-ended trie, used to efficiently query for matches to "star" patterns, where
     * a given key represents a parent and may contain a capturing group ("*"), which can then be
     * referenced via the token "$(capture)" in associated child patterns.
     *
     * The generated tree will have at most two levels, as subtrees are flattened rather than nested.
     *
     * Example:
     * The config: [
     * [ *.ts , [ $(capture).*.ts ; $(capture).js ] ]
     * [ *.js , [ $(capture).min.js ] ] ]
     * Nests the files: [ a.ts ; a.d.ts ; a.js ; a.min.js ; b.ts ; b.min.js ]
     * As:
     * - a.ts => [ a.d.ts ; a.js ; a.min.js ]
     * - b.ts => [ ]
     * - b.min.ts => [ ]
     */
    class $rHb {
        constructor(config) {
            this.b = new $sHb();
            for (const [parentPattern, childPatterns] of config) {
                for (const childPattern of childPatterns) {
                    this.b.add(parentPattern, childPattern);
                }
            }
        }
        toString() {
            return this.b.toString();
        }
        c(filename, dirname) {
            const lastDot = filename.lastIndexOf('.');
            if (lastDot < 1) {
                return {
                    dirname,
                    basename: filename,
                    extname: ''
                };
            }
            else {
                return {
                    dirname,
                    basename: filename.substring(0, lastDot),
                    extname: filename.substring(lastDot + 1)
                };
            }
        }
        nest(files, dirname) {
            const parentFinder = new $sHb();
            for (const potentialParent of files) {
                const attributes = this.c(potentialParent, dirname);
                const children = this.b.get(potentialParent, attributes);
                for (const child of children) {
                    parentFinder.add(child, potentialParent);
                }
            }
            const findAllRootAncestors = (file, seen = new Set()) => {
                if (seen.has(file)) {
                    return [];
                }
                seen.add(file);
                const attributes = this.c(file, dirname);
                const ancestors = parentFinder.get(file, attributes);
                if (ancestors.length === 0) {
                    return [file];
                }
                if (ancestors.length === 1 && ancestors[0] === file) {
                    return [file];
                }
                return ancestors.flatMap(a => findAllRootAncestors(a, seen));
            };
            const result = new Map();
            for (const file of files) {
                let ancestors = findAllRootAncestors(file);
                if (ancestors.length === 0) {
                    ancestors = [file];
                }
                for (const ancestor of ancestors) {
                    let existing = result.get(ancestor);
                    if (!existing) {
                        result.set(ancestor, existing = new Set());
                    }
                    if (file !== ancestor) {
                        existing.add(file);
                    }
                }
            }
            return result;
        }
    }
    exports.$rHb = $rHb;
    /** Export for test only. */
    class $sHb {
        constructor() {
            this.b = new $tHb();
            this.c = new Map();
        }
        add(key, value) {
            if (key === '') {
                this.b.add(key, value);
            }
            else if (key[0] === '*') {
                this.b.add(key, value);
            }
            else {
                const head = key[0];
                const rest = key.slice(1);
                let existing = this.c.get(head);
                if (!existing) {
                    this.c.set(head, existing = new $sHb());
                }
                existing.add(rest, value);
            }
        }
        get(key, attributes) {
            const results = [];
            results.push(...this.b.get(key, attributes));
            const head = key[0];
            const rest = key.slice(1);
            const existing = this.c.get(head);
            if (existing) {
                results.push(...existing.get(rest, attributes));
            }
            return results;
        }
        toString(indentation = '') {
            const lines = [];
            if (this.b.hasItems) {
                lines.push('* => \n' + this.b.toString(indentation + '  '));
            }
            [...this.c.entries()].map(([key, trie]) => lines.push('^' + key + ' => \n' + trie.toString(indentation + '  ')));
            return lines.map(l => indentation + l).join('\n');
        }
    }
    exports.$sHb = $sHb;
    /** Export for test only. */
    class $tHb {
        constructor() {
            this.b = [];
            this.c = [];
            this.d = new Map();
            this.hasItems = false;
        }
        add(key, value) {
            this.hasItems = true;
            if (key === '*') {
                this.b.push(new SubstitutionString(value));
            }
            else if (key === '') {
                this.c.push(new SubstitutionString(value));
            }
            else {
                const tail = key[key.length - 1];
                const rest = key.slice(0, key.length - 1);
                if (tail === '*') {
                    throw Error('Unexpected star in SufTrie key: ' + key);
                }
                else {
                    let existing = this.d.get(tail);
                    if (!existing) {
                        this.d.set(tail, existing = new $tHb());
                    }
                    existing.add(rest, value);
                }
            }
        }
        get(key, attributes) {
            const results = [];
            if (key === '') {
                results.push(...this.c.map(ss => ss.substitute(attributes)));
            }
            if (this.b.length) {
                results.push(...this.b.map(ss => ss.substitute(attributes, key)));
            }
            const tail = key[key.length - 1];
            const rest = key.slice(0, key.length - 1);
            const existing = this.d.get(tail);
            if (existing) {
                results.push(...existing.get(rest, attributes));
            }
            return results;
        }
        toString(indentation = '') {
            const lines = [];
            if (this.b.length) {
                lines.push('* => ' + this.b.join('; '));
            }
            if (this.c.length) {
                // allow-any-unicode-next-line
                lines.push('ε => ' + this.c.join('; '));
            }
            [...this.d.entries()].map(([key, trie]) => lines.push(key + '$' + ' => \n' + trie.toString(indentation + '  ')));
            return lines.map(l => indentation + l).join('\n');
        }
    }
    exports.$tHb = $tHb;
    var SubstitutionType;
    (function (SubstitutionType) {
        SubstitutionType["capture"] = "capture";
        SubstitutionType["basename"] = "basename";
        SubstitutionType["dirname"] = "dirname";
        SubstitutionType["extname"] = "extname";
    })(SubstitutionType || (SubstitutionType = {}));
    const substitutionStringTokenizer = /\$[({](capture|basename|dirname|extname)[)}]/g;
    class SubstitutionString {
        constructor(pattern) {
            this.b = [];
            substitutionStringTokenizer.lastIndex = 0;
            let token;
            let lastIndex = 0;
            while (token = substitutionStringTokenizer.exec(pattern)) {
                const prefix = pattern.slice(lastIndex, token.index);
                this.b.push(prefix);
                const type = token[1];
                switch (type) {
                    case "basename" /* SubstitutionType.basename */:
                    case "dirname" /* SubstitutionType.dirname */:
                    case "extname" /* SubstitutionType.extname */:
                    case "capture" /* SubstitutionType.capture */:
                        this.b.push({ capture: type });
                        break;
                    default: throw Error('unknown substitution type: ' + type);
                }
                lastIndex = token.index + token[0].length;
            }
            if (lastIndex !== pattern.length) {
                const suffix = pattern.slice(lastIndex, pattern.length);
                this.b.push(suffix);
            }
        }
        substitute(attributes, capture) {
            return this.b.map(t => {
                if (typeof t === 'string') {
                    return t;
                }
                switch (t.capture) {
                    case "basename" /* SubstitutionType.basename */: return attributes.basename;
                    case "dirname" /* SubstitutionType.dirname */: return attributes.dirname;
                    case "extname" /* SubstitutionType.extname */: return attributes.extname;
                    case "capture" /* SubstitutionType.capture */: return capture || '';
                }
            }).join('');
        }
    }
});
//# sourceMappingURL=explorerFileNestingTrie.js.map