/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/extpath", "vs/base/common/map", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/strings"], function (require, exports, arrays_1, async_1, extpath_1, map_1, path_1, platform_1, strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.patternsEquals = exports.getPathTerms = exports.getBasenameTerms = exports.isRelativePattern = exports.parse = exports.match = exports.splitGlobAware = exports.GLOB_SPLIT = exports.GLOBSTAR = exports.getEmptyExpression = void 0;
    function getEmptyExpression() {
        return Object.create(null);
    }
    exports.getEmptyExpression = getEmptyExpression;
    exports.GLOBSTAR = '**';
    exports.GLOB_SPLIT = '/';
    const PATH_REGEX = '[/\\\\]'; // any slash or backslash
    const NO_PATH_REGEX = '[^/\\\\]'; // any non-slash and non-backslash
    const ALL_FORWARD_SLASHES = /\//g;
    function starsToRegExp(starCount, isLastPattern) {
        switch (starCount) {
            case 0:
                return '';
            case 1:
                return `${NO_PATH_REGEX}*?`; // 1 star matches any number of characters except path separator (/ and \) - non greedy (?)
            default:
                // Matches:  (Path Sep OR Path Val followed by Path Sep) 0-many times except when it's the last pattern
                //           in which case also matches (Path Sep followed by Path Val)
                // Group is non capturing because we don't need to capture at all (?:...)
                // Overall we use non-greedy matching because it could be that we match too much
                return `(?:${PATH_REGEX}|${NO_PATH_REGEX}+${PATH_REGEX}${isLastPattern ? `|${PATH_REGEX}${NO_PATH_REGEX}+` : ''})*?`;
        }
    }
    function splitGlobAware(pattern, splitChar) {
        if (!pattern) {
            return [];
        }
        const segments = [];
        let inBraces = false;
        let inBrackets = false;
        let curVal = '';
        for (const char of pattern) {
            switch (char) {
                case splitChar:
                    if (!inBraces && !inBrackets) {
                        segments.push(curVal);
                        curVal = '';
                        continue;
                    }
                    break;
                case '{':
                    inBraces = true;
                    break;
                case '}':
                    inBraces = false;
                    break;
                case '[':
                    inBrackets = true;
                    break;
                case ']':
                    inBrackets = false;
                    break;
            }
            curVal += char;
        }
        // Tail
        if (curVal) {
            segments.push(curVal);
        }
        return segments;
    }
    exports.splitGlobAware = splitGlobAware;
    function parseRegExp(pattern) {
        if (!pattern) {
            return '';
        }
        let regEx = '';
        // Split up into segments for each slash found
        const segments = splitGlobAware(pattern, exports.GLOB_SPLIT);
        // Special case where we only have globstars
        if (segments.every(segment => segment === exports.GLOBSTAR)) {
            regEx = '.*';
        }
        // Build regex over segments
        else {
            let previousSegmentWasGlobStar = false;
            segments.forEach((segment, index) => {
                // Treat globstar specially
                if (segment === exports.GLOBSTAR) {
                    // if we have more than one globstar after another, just ignore it
                    if (previousSegmentWasGlobStar) {
                        return;
                    }
                    regEx += starsToRegExp(2, index === segments.length - 1);
                }
                // Anything else, not globstar
                else {
                    // States
                    let inBraces = false;
                    let braceVal = '';
                    let inBrackets = false;
                    let bracketVal = '';
                    for (const char of segment) {
                        // Support brace expansion
                        if (char !== '}' && inBraces) {
                            braceVal += char;
                            continue;
                        }
                        // Support brackets
                        if (inBrackets && (char !== ']' || !bracketVal) /* ] is literally only allowed as first character in brackets to match it */) {
                            let res;
                            // range operator
                            if (char === '-') {
                                res = char;
                            }
                            // negation operator (only valid on first index in bracket)
                            else if ((char === '^' || char === '!') && !bracketVal) {
                                res = '^';
                            }
                            // glob split matching is not allowed within character ranges
                            // see http://man7.org/linux/man-pages/man7/glob.7.html
                            else if (char === exports.GLOB_SPLIT) {
                                res = '';
                            }
                            // anything else gets escaped
                            else {
                                res = (0, strings_1.escapeRegExpCharacters)(char);
                            }
                            bracketVal += res;
                            continue;
                        }
                        switch (char) {
                            case '{':
                                inBraces = true;
                                continue;
                            case '[':
                                inBrackets = true;
                                continue;
                            case '}': {
                                const choices = splitGlobAware(braceVal, ',');
                                // Converts {foo,bar} => [foo|bar]
                                const braceRegExp = `(?:${choices.map(choice => parseRegExp(choice)).join('|')})`;
                                regEx += braceRegExp;
                                inBraces = false;
                                braceVal = '';
                                break;
                            }
                            case ']': {
                                regEx += ('[' + bracketVal + ']');
                                inBrackets = false;
                                bracketVal = '';
                                break;
                            }
                            case '?':
                                regEx += NO_PATH_REGEX; // 1 ? matches any single character except path separator (/ and \)
                                continue;
                            case '*':
                                regEx += starsToRegExp(1);
                                continue;
                            default:
                                regEx += (0, strings_1.escapeRegExpCharacters)(char);
                        }
                    }
                    // Tail: Add the slash we had split on if there is more to
                    // come and the remaining pattern is not a globstar
                    // For example if pattern: some/**/*.js we want the "/" after
                    // some to be included in the RegEx to prevent a folder called
                    // "something" to match as well.
                    if (index < segments.length - 1 && // more segments to come after this
                        (segments[index + 1] !== exports.GLOBSTAR || // next segment is not **, or...
                            index + 2 < segments.length // ...next segment is ** but there is more segments after that
                        )) {
                        regEx += PATH_REGEX;
                    }
                }
                // update globstar state
                previousSegmentWasGlobStar = (segment === exports.GLOBSTAR);
            });
        }
        return regEx;
    }
    // regexes to check for trivial glob patterns that just check for String#endsWith
    const T1 = /^\*\*\/\*\.[\w\.-]+$/; // **/*.something
    const T2 = /^\*\*\/([\w\.-]+)\/?$/; // **/something
    const T3 = /^{\*\*\/\*?[\w\.-]+\/?(,\*\*\/\*?[\w\.-]+\/?)*}$/; // {**/*.something,**/*.else} or {**/package.json,**/project.json}
    const T3_2 = /^{\*\*\/\*?[\w\.-]+(\/(\*\*)?)?(,\*\*\/\*?[\w\.-]+(\/(\*\*)?)?)*}$/; // Like T3, with optional trailing /**
    const T4 = /^\*\*((\/[\w\.-]+)+)\/?$/; // **/something/else
    const T5 = /^([\w\.-]+(\/[\w\.-]+)*)\/?$/; // something/else
    const CACHE = new map_1.LRUCache(10000); // bounded to 10000 elements
    const FALSE = function () {
        return false;
    };
    const NULL = function () {
        return null;
    };
    function parsePattern(arg1, options) {
        if (!arg1) {
            return NULL;
        }
        // Handle relative patterns
        let pattern;
        if (typeof arg1 !== 'string') {
            pattern = arg1.pattern;
        }
        else {
            pattern = arg1;
        }
        // Whitespace trimming
        pattern = pattern.trim();
        // Check cache
        const patternKey = `${pattern}_${!!options.trimForExclusions}`;
        let parsedPattern = CACHE.get(patternKey);
        if (parsedPattern) {
            return wrapRelativePattern(parsedPattern, arg1);
        }
        // Check for Trivials
        let match;
        if (T1.test(pattern)) {
            parsedPattern = trivia1(pattern.substr(4), pattern); // common pattern: **/*.txt just need endsWith check
        }
        else if (match = T2.exec(trimForExclusions(pattern, options))) { // common pattern: **/some.txt just need basename check
            parsedPattern = trivia2(match[1], pattern);
        }
        else if ((options.trimForExclusions ? T3_2 : T3).test(pattern)) { // repetition of common patterns (see above) {**/*.txt,**/*.png}
            parsedPattern = trivia3(pattern, options);
        }
        else if (match = T4.exec(trimForExclusions(pattern, options))) { // common pattern: **/something/else just need endsWith check
            parsedPattern = trivia4and5(match[1].substr(1), pattern, true);
        }
        else if (match = T5.exec(trimForExclusions(pattern, options))) { // common pattern: something/else just need equals check
            parsedPattern = trivia4and5(match[1], pattern, false);
        }
        // Otherwise convert to pattern
        else {
            parsedPattern = toRegExp(pattern);
        }
        // Cache
        CACHE.set(patternKey, parsedPattern);
        return wrapRelativePattern(parsedPattern, arg1);
    }
    function wrapRelativePattern(parsedPattern, arg2) {
        if (typeof arg2 === 'string') {
            return parsedPattern;
        }
        const wrappedPattern = function (path, basename) {
            if (!(0, extpath_1.isEqualOrParent)(path, arg2.base, !platform_1.isLinux)) {
                // skip glob matching if `base` is not a parent of `path`
                return null;
            }
            // Given we have checked `base` being a parent of `path`,
            // we can now remove the `base` portion of the `path`
            // and only match on the remaining path components
            // For that we try to extract the portion of the `path`
            // that comes after the `base` portion. We have to account
            // for the fact that `base` might end in a path separator
            // (https://github.com/microsoft/vscode/issues/162498)
            return parsedPattern((0, strings_1.ltrim)(path.substr(arg2.base.length), path_1.sep), basename);
        };
        // Make sure to preserve associated metadata
        wrappedPattern.allBasenames = parsedPattern.allBasenames;
        wrappedPattern.allPaths = parsedPattern.allPaths;
        wrappedPattern.basenames = parsedPattern.basenames;
        wrappedPattern.patterns = parsedPattern.patterns;
        return wrappedPattern;
    }
    function trimForExclusions(pattern, options) {
        return options.trimForExclusions && pattern.endsWith('/**') ? pattern.substr(0, pattern.length - 2) : pattern; // dropping **, tailing / is dropped later
    }
    // common pattern: **/*.txt just need endsWith check
    function trivia1(base, pattern) {
        return function (path, basename) {
            return typeof path === 'string' && path.endsWith(base) ? pattern : null;
        };
    }
    // common pattern: **/some.txt just need basename check
    function trivia2(base, pattern) {
        const slashBase = `/${base}`;
        const backslashBase = `\\${base}`;
        const parsedPattern = function (path, basename) {
            if (typeof path !== 'string') {
                return null;
            }
            if (basename) {
                return basename === base ? pattern : null;
            }
            return path === base || path.endsWith(slashBase) || path.endsWith(backslashBase) ? pattern : null;
        };
        const basenames = [base];
        parsedPattern.basenames = basenames;
        parsedPattern.patterns = [pattern];
        parsedPattern.allBasenames = basenames;
        return parsedPattern;
    }
    // repetition of common patterns (see above) {**/*.txt,**/*.png}
    function trivia3(pattern, options) {
        const parsedPatterns = aggregateBasenameMatches(pattern.slice(1, -1)
            .split(',')
            .map(pattern => parsePattern(pattern, options))
            .filter(pattern => pattern !== NULL), pattern);
        const patternsLength = parsedPatterns.length;
        if (!patternsLength) {
            return NULL;
        }
        if (patternsLength === 1) {
            return parsedPatterns[0];
        }
        const parsedPattern = function (path, basename) {
            for (let i = 0, n = parsedPatterns.length; i < n; i++) {
                if (parsedPatterns[i](path, basename)) {
                    return pattern;
                }
            }
            return null;
        };
        const withBasenames = parsedPatterns.find(pattern => !!pattern.allBasenames);
        if (withBasenames) {
            parsedPattern.allBasenames = withBasenames.allBasenames;
        }
        const allPaths = parsedPatterns.reduce((all, current) => current.allPaths ? all.concat(current.allPaths) : all, []);
        if (allPaths.length) {
            parsedPattern.allPaths = allPaths;
        }
        return parsedPattern;
    }
    // common patterns: **/something/else just need endsWith check, something/else just needs and equals check
    function trivia4and5(targetPath, pattern, matchPathEnds) {
        const usingPosixSep = path_1.sep === path_1.posix.sep;
        const nativePath = usingPosixSep ? targetPath : targetPath.replace(ALL_FORWARD_SLASHES, path_1.sep);
        const nativePathEnd = path_1.sep + nativePath;
        const targetPathEnd = path_1.posix.sep + targetPath;
        let parsedPattern;
        if (matchPathEnds) {
            parsedPattern = function (path, basename) {
                return typeof path === 'string' && ((path === nativePath || path.endsWith(nativePathEnd)) || !usingPosixSep && (path === targetPath || path.endsWith(targetPathEnd))) ? pattern : null;
            };
        }
        else {
            parsedPattern = function (path, basename) {
                return typeof path === 'string' && (path === nativePath || (!usingPosixSep && path === targetPath)) ? pattern : null;
            };
        }
        parsedPattern.allPaths = [(matchPathEnds ? '*/' : './') + targetPath];
        return parsedPattern;
    }
    function toRegExp(pattern) {
        try {
            const regExp = new RegExp(`^${parseRegExp(pattern)}$`);
            return function (path) {
                regExp.lastIndex = 0; // reset RegExp to its initial state to reuse it!
                return typeof path === 'string' && regExp.test(path) ? pattern : null;
            };
        }
        catch (error) {
            return NULL;
        }
    }
    function match(arg1, path, hasSibling) {
        if (!arg1 || typeof path !== 'string') {
            return false;
        }
        return parse(arg1)(path, undefined, hasSibling);
    }
    exports.match = match;
    function parse(arg1, options = {}) {
        if (!arg1) {
            return FALSE;
        }
        // Glob with String
        if (typeof arg1 === 'string' || isRelativePattern(arg1)) {
            const parsedPattern = parsePattern(arg1, options);
            if (parsedPattern === NULL) {
                return FALSE;
            }
            const resultPattern = function (path, basename) {
                return !!parsedPattern(path, basename);
            };
            if (parsedPattern.allBasenames) {
                resultPattern.allBasenames = parsedPattern.allBasenames;
            }
            if (parsedPattern.allPaths) {
                resultPattern.allPaths = parsedPattern.allPaths;
            }
            return resultPattern;
        }
        // Glob with Expression
        return parsedExpression(arg1, options);
    }
    exports.parse = parse;
    function isRelativePattern(obj) {
        const rp = obj;
        if (!rp) {
            return false;
        }
        return typeof rp.base === 'string' && typeof rp.pattern === 'string';
    }
    exports.isRelativePattern = isRelativePattern;
    function getBasenameTerms(patternOrExpression) {
        return patternOrExpression.allBasenames || [];
    }
    exports.getBasenameTerms = getBasenameTerms;
    function getPathTerms(patternOrExpression) {
        return patternOrExpression.allPaths || [];
    }
    exports.getPathTerms = getPathTerms;
    function parsedExpression(expression, options) {
        const parsedPatterns = aggregateBasenameMatches(Object.getOwnPropertyNames(expression)
            .map(pattern => parseExpressionPattern(pattern, expression[pattern], options))
            .filter(pattern => pattern !== NULL));
        const patternsLength = parsedPatterns.length;
        if (!patternsLength) {
            return NULL;
        }
        if (!parsedPatterns.some(parsedPattern => !!parsedPattern.requiresSiblings)) {
            if (patternsLength === 1) {
                return parsedPatterns[0];
            }
            const resultExpression = function (path, basename) {
                let resultPromises = undefined;
                for (let i = 0, n = parsedPatterns.length; i < n; i++) {
                    const result = parsedPatterns[i](path, basename);
                    if (typeof result === 'string') {
                        return result; // immediately return as soon as the first expression matches
                    }
                    // If the result is a promise, we have to keep it for
                    // later processing and await the result properly.
                    if ((0, async_1.isThenable)(result)) {
                        if (!resultPromises) {
                            resultPromises = [];
                        }
                        resultPromises.push(result);
                    }
                }
                // With result promises, we have to loop over each and
                // await the result before we can return any result.
                if (resultPromises) {
                    return (async () => {
                        for (const resultPromise of resultPromises) {
                            const result = await resultPromise;
                            if (typeof result === 'string') {
                                return result;
                            }
                        }
                        return null;
                    })();
                }
                return null;
            };
            const withBasenames = parsedPatterns.find(pattern => !!pattern.allBasenames);
            if (withBasenames) {
                resultExpression.allBasenames = withBasenames.allBasenames;
            }
            const allPaths = parsedPatterns.reduce((all, current) => current.allPaths ? all.concat(current.allPaths) : all, []);
            if (allPaths.length) {
                resultExpression.allPaths = allPaths;
            }
            return resultExpression;
        }
        const resultExpression = function (path, base, hasSibling) {
            let name = undefined;
            let resultPromises = undefined;
            for (let i = 0, n = parsedPatterns.length; i < n; i++) {
                // Pattern matches path
                const parsedPattern = parsedPatterns[i];
                if (parsedPattern.requiresSiblings && hasSibling) {
                    if (!base) {
                        base = (0, path_1.basename)(path);
                    }
                    if (!name) {
                        name = base.substr(0, base.length - (0, path_1.extname)(path).length);
                    }
                }
                const result = parsedPattern(path, base, name, hasSibling);
                if (typeof result === 'string') {
                    return result; // immediately return as soon as the first expression matches
                }
                // If the result is a promise, we have to keep it for
                // later processing and await the result properly.
                if ((0, async_1.isThenable)(result)) {
                    if (!resultPromises) {
                        resultPromises = [];
                    }
                    resultPromises.push(result);
                }
            }
            // With result promises, we have to loop over each and
            // await the result before we can return any result.
            if (resultPromises) {
                return (async () => {
                    for (const resultPromise of resultPromises) {
                        const result = await resultPromise;
                        if (typeof result === 'string') {
                            return result;
                        }
                    }
                    return null;
                })();
            }
            return null;
        };
        const withBasenames = parsedPatterns.find(pattern => !!pattern.allBasenames);
        if (withBasenames) {
            resultExpression.allBasenames = withBasenames.allBasenames;
        }
        const allPaths = parsedPatterns.reduce((all, current) => current.allPaths ? all.concat(current.allPaths) : all, []);
        if (allPaths.length) {
            resultExpression.allPaths = allPaths;
        }
        return resultExpression;
    }
    function parseExpressionPattern(pattern, value, options) {
        if (value === false) {
            return NULL; // pattern is disabled
        }
        const parsedPattern = parsePattern(pattern, options);
        if (parsedPattern === NULL) {
            return NULL;
        }
        // Expression Pattern is <boolean>
        if (typeof value === 'boolean') {
            return parsedPattern;
        }
        // Expression Pattern is <SiblingClause>
        if (value) {
            const when = value.when;
            if (typeof when === 'string') {
                const result = (path, basename, name, hasSibling) => {
                    if (!hasSibling || !parsedPattern(path, basename)) {
                        return null;
                    }
                    const clausePattern = when.replace('$(basename)', () => name);
                    const matched = hasSibling(clausePattern);
                    return (0, async_1.isThenable)(matched) ?
                        matched.then(match => match ? pattern : null) :
                        matched ? pattern : null;
                };
                result.requiresSiblings = true;
                return result;
            }
        }
        // Expression is anything
        return parsedPattern;
    }
    function aggregateBasenameMatches(parsedPatterns, result) {
        const basenamePatterns = parsedPatterns.filter(parsedPattern => !!parsedPattern.basenames);
        if (basenamePatterns.length < 2) {
            return parsedPatterns;
        }
        const basenames = basenamePatterns.reduce((all, current) => {
            const basenames = current.basenames;
            return basenames ? all.concat(basenames) : all;
        }, []);
        let patterns;
        if (result) {
            patterns = [];
            for (let i = 0, n = basenames.length; i < n; i++) {
                patterns.push(result);
            }
        }
        else {
            patterns = basenamePatterns.reduce((all, current) => {
                const patterns = current.patterns;
                return patterns ? all.concat(patterns) : all;
            }, []);
        }
        const aggregate = function (path, basename) {
            if (typeof path !== 'string') {
                return null;
            }
            if (!basename) {
                let i;
                for (i = path.length; i > 0; i--) {
                    const ch = path.charCodeAt(i - 1);
                    if (ch === 47 /* CharCode.Slash */ || ch === 92 /* CharCode.Backslash */) {
                        break;
                    }
                }
                basename = path.substr(i);
            }
            const index = basenames.indexOf(basename);
            return index !== -1 ? patterns[index] : null;
        };
        aggregate.basenames = basenames;
        aggregate.patterns = patterns;
        aggregate.allBasenames = basenames;
        const aggregatedPatterns = parsedPatterns.filter(parsedPattern => !parsedPattern.basenames);
        aggregatedPatterns.push(aggregate);
        return aggregatedPatterns;
    }
    function patternsEquals(patternsA, patternsB) {
        return (0, arrays_1.equals)(patternsA, patternsB, (a, b) => {
            if (typeof a === 'string' && typeof b === 'string') {
                return a === b;
            }
            if (typeof a !== 'string' && typeof b !== 'string') {
                return a.base === b.base && a.pattern === b.pattern;
            }
            return false;
        });
    }
    exports.patternsEquals = patternsEquals;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL2dsb2IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZ0NoRyxTQUFnQixrQkFBa0I7UUFDakMsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFGRCxnREFFQztJQU1ZLFFBQUEsUUFBUSxHQUFHLElBQUksQ0FBQztJQUNoQixRQUFBLFVBQVUsR0FBRyxHQUFHLENBQUM7SUFFOUIsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLENBQUUseUJBQXlCO0lBQ3hELE1BQU0sYUFBYSxHQUFHLFVBQVUsQ0FBQyxDQUFDLGtDQUFrQztJQUNwRSxNQUFNLG1CQUFtQixHQUFHLEtBQUssQ0FBQztJQUVsQyxTQUFTLGFBQWEsQ0FBQyxTQUFpQixFQUFFLGFBQXVCO1FBQ2hFLFFBQVEsU0FBUyxFQUFFO1lBQ2xCLEtBQUssQ0FBQztnQkFDTCxPQUFPLEVBQUUsQ0FBQztZQUNYLEtBQUssQ0FBQztnQkFDTCxPQUFPLEdBQUcsYUFBYSxJQUFJLENBQUMsQ0FBQywyRkFBMkY7WUFDekg7Z0JBQ0MsdUdBQXVHO2dCQUN2Ryx1RUFBdUU7Z0JBQ3ZFLHlFQUF5RTtnQkFDekUsZ0ZBQWdGO2dCQUNoRixPQUFPLE1BQU0sVUFBVSxJQUFJLGFBQWEsSUFBSSxVQUFVLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyxJQUFJLFVBQVUsR0FBRyxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUM7U0FDdEg7SUFDRixDQUFDO0lBRUQsU0FBZ0IsY0FBYyxDQUFDLE9BQWUsRUFBRSxTQUFpQjtRQUNoRSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2IsT0FBTyxFQUFFLENBQUM7U0FDVjtRQUVELE1BQU0sUUFBUSxHQUFhLEVBQUUsQ0FBQztRQUU5QixJ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