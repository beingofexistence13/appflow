/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SufTrie = exports.PreTrie = exports.ExplorerFileNestingTrie = void 0;
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
    class ExplorerFileNestingTrie {
        constructor(config) {
            this.root = new PreTrie();
            for (const [parentPattern, childPatterns] of config) {
                for (const childPattern of childPatterns) {
                    this.root.add(parentPattern, childPattern);
                }
            }
        }
        toString() {
            return this.root.toString();
        }
        getAttributes(filename, dirname) {
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
            const parentFinder = new PreTrie();
            for (const potentialParent of files) {
                const attributes = this.getAttributes(potentialParent, dirname);
                const children = this.root.get(potentialParent, attributes);
                for (const child of children) {
                    parentFinder.add(child, potentialParent);
                }
            }
            const findAllRootAncestors = (file, seen = new Set()) => {
                if (seen.has(file)) {
                    return [];
                }
                seen.add(file);
                const attributes = this.getAttributes(file, dirname);
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
    exports.ExplorerFileNestingTrie = ExplorerFileNestingTrie;
    /** Export for test only. */
    class PreTrie {
        constructor() {
            this.value = new SufTrie();
            this.map = new Map();
        }
        add(key, value) {
            if (key === '') {
                this.value.add(key, value);
            }
            else if (key[0] === '*') {
                this.value.add(key, value);
            }
            else {
                const head = key[0];
                const rest = key.slice(1);
                let existing = this.map.get(head);
                if (!existing) {
                    this.map.set(head, existing = new PreTrie());
                }
                existing.add(rest, value);
            }
        }
        get(key, attributes) {
            const results = [];
            results.push(...this.value.get(key, attributes));
            const head = key[0];
            const rest = key.slice(1);
            const existing = this.map.get(head);
            if (existing) {
                results.push(...existing.get(rest, attributes));
            }
            return results;
        }
        toString(indentation = '') {
            const lines = [];
            if (this.value.hasItems) {
                lines.push('* => \n' + this.value.toString(indentation + '  '));
            }
            [...this.map.entries()].map(([key, trie]) => lines.push('^' + key + ' => \n' + trie.toString(indentation + '  ')));
            return lines.map(l => indentation + l).join('\n');
        }
    }
    exports.PreTrie = PreTrie;
    /** Export for test only. */
    class SufTrie {
        constructor() {
            this.star = [];
            this.epsilon = [];
            this.map = new Map();
            this.hasItems = false;
        }
        add(key, value) {
            this.hasItems = true;
            if (key === '*') {
                this.star.push(new SubstitutionString(value));
            }
            else if (key === '') {
                this.epsilon.push(new SubstitutionString(value));
            }
            else {
                const tail = key[key.length - 1];
                const rest = key.slice(0, key.length - 1);
                if (tail === '*') {
                    throw Error('Unexpected star in SufTrie key: ' + key);
                }
                else {
                    let existing = this.map.get(tail);
                    if (!existing) {
                        this.map.set(tail, existing = new SufTrie());
                    }
                    existing.add(rest, value);
                }
            }
        }
        get(key, attributes) {
            const results = [];
            if (key === '') {
                results.push(...this.epsilon.map(ss => ss.substitute(attributes)));
            }
            if (this.star.length) {
                results.push(...this.star.map(ss => ss.substitute(attributes, key)));
            }
            const tail = key[key.length - 1];
            const rest = key.slice(0, key.length - 1);
            const existing = this.map.get(tail);
            if (existing) {
                results.push(...existing.get(rest, attributes));
            }
            return results;
        }
        toString(indentation = '') {
            const lines = [];
            if (this.star.length) {
                lines.push('* => ' + this.star.join('; '));
            }
            if (this.epsilon.length) {
                // allow-any-unicode-next-line
                lines.push('ε => ' + this.epsilon.join('; '));
            }
            [...this.map.entries()].map(([key, trie]) => lines.push(key + '$' + ' => \n' + trie.toString(indentation + '  ')));
            return lines.map(l => indentation + l).join('\n');
        }
    }
    exports.SufTrie = SufTrie;
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
            this.tokens = [];
            substitutionStringTokenizer.lastIndex = 0;
            let token;
            let lastIndex = 0;
            while (token = substitutionStringTokenizer.exec(pattern)) {
                const prefix = pattern.slice(lastIndex, token.index);
                this.tokens.push(prefix);
                const type = token[1];
                switch (type) {
                    case "basename" /* SubstitutionType.basename */:
                    case "dirname" /* SubstitutionType.dirname */:
                    case "extname" /* SubstitutionType.extname */:
                    case "capture" /* SubstitutionType.capture */:
                        this.tokens.push({ capture: type });
                        break;
                    default: throw Error('unknown substitution type: ' + type);
                }
                lastIndex = token.index + token[0].length;
            }
            if (lastIndex !== pattern.length) {
                const suffix = pattern.slice(lastIndex, pattern.length);
                this.tokens.push(suffix);
            }
        }
        substitute(attributes, capture) {
            return this.tokens.map(t => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwbG9yZXJGaWxlTmVzdGluZ1RyaWUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9maWxlcy9jb21tb24vZXhwbG9yZXJGaWxlTmVzdGluZ1RyaWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBV2hHOzs7Ozs7Ozs7Ozs7Ozs7O09BZ0JHO0lBQ0gsTUFBYSx1QkFBdUI7UUFHbkMsWUFBWSxNQUE0QjtZQUZoQyxTQUFJLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUc1QixLQUFLLE1BQU0sQ0FBQyxhQUFhLEVBQUUsYUFBYSxDQUFDLElBQUksTUFBTSxFQUFFO2dCQUNwRCxLQUFLLE1BQU0sWUFBWSxJQUFJLGFBQWEsRUFBRTtvQkFDekMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLFlBQVksQ0FBQyxDQUFDO2lCQUMzQzthQUNEO1FBQ0YsQ0FBQztRQUVELFFBQVE7WUFDUCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDN0IsQ0FBQztRQUVPLGFBQWEsQ0FBQyxRQUFnQixFQUFFLE9BQWU7WUFDdEQsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMxQyxJQUFJLE9BQU8sR0FBRyxDQUFDLEVBQUU7Z0JBQ2hCLE9BQU87b0JBQ04sT0FBTztvQkFDUCxRQUFRLEVBQUUsUUFBUTtvQkFDbEIsT0FBTyxFQUFFLEVBQUU7aUJBQ1gsQ0FBQzthQUNGO2lCQUFNO2dCQUNOLE9BQU87b0JBQ04sT0FBTztvQkFDUCxRQUFRLEVBQUUsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDO29CQUN4QyxPQUFPLEVBQUUsUUFBUSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO2lCQUN4QyxD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