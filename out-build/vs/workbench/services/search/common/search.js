/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/glob", "vs/base/common/objects", "vs/base/common/extpath", "vs/base/common/strings", "vs/platform/instantiation/common/instantiation", "vs/base/common/path", "vs/base/common/errors", "vs/workbench/services/search/common/searchExtTypes", "vs/base/common/async"], function (require, exports, arrays_1, glob, objects, extpath, strings_1, instantiation_1, paths, errors_1, searchExtTypes_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$JI = exports.$II = exports.$HI = exports.$GI = exports.$FI = exports.$EI = exports.$DI = exports.$CI = exports.$BI = exports.$AI = exports.$zI = exports.$yI = exports.SearchErrorCode = exports.$xI = exports.$wI = exports.SearchSortOrder = exports.ViewMode = exports.$vI = exports.$uI = exports.$tI = exports.$sI = exports.SearchCompletionExitCode = exports.$rI = exports.$qI = exports.$pI = exports.QueryType = exports.SearchProviderType = exports.$oI = exports.$nI = exports.$mI = exports.$lI = exports.$kI = exports.$jI = exports.TextSearchCompleteMessageType = void 0;
    Object.defineProperty(exports, "TextSearchCompleteMessageType", { enumerable: true, get: function () { return searchExtTypes_1.TextSearchCompleteMessageType; } });
    exports.$jI = 'workbench.view.search';
    exports.$kI = 'workbench.panel.search';
    exports.$lI = 'workbench.view.search';
    exports.$mI = 'search-result';
    exports.$nI = 'search.exclude';
    // Warning: this pattern is used in the search editor to detect offsets. If you
    // change this, also change the search-result built-in extension
    const SEARCH_ELIDED_PREFIX = '⟪ ';
    const SEARCH_ELIDED_SUFFIX = ' characters skipped ⟫';
    const SEARCH_ELIDED_MIN_LEN = (SEARCH_ELIDED_PREFIX.length + SEARCH_ELIDED_SUFFIX.length + 5) * 2;
    exports.$oI = (0, instantiation_1.$Bh)('searchService');
    /**
     * TODO@roblou - split text from file search entirely, or share code in a more natural way.
     */
    var SearchProviderType;
    (function (SearchProviderType) {
        SearchProviderType[SearchProviderType["file"] = 0] = "file";
        SearchProviderType[SearchProviderType["text"] = 1] = "text";
    })(SearchProviderType || (exports.SearchProviderType = SearchProviderType = {}));
    var QueryType;
    (function (QueryType) {
        QueryType[QueryType["File"] = 1] = "File";
        QueryType[QueryType["Text"] = 2] = "Text";
    })(QueryType || (exports.QueryType = QueryType = {}));
    function $pI(result) {
        return !!result.preview;
    }
    exports.$pI = $pI;
    function $qI(p) {
        return !!p.resource;
    }
    exports.$qI = $qI;
    function $rI(p) {
        return !!p.message;
    }
    exports.$rI = $rI;
    var SearchCompletionExitCode;
    (function (SearchCompletionExitCode) {
        SearchCompletionExitCode[SearchCompletionExitCode["Normal"] = 0] = "Normal";
        SearchCompletionExitCode[SearchCompletionExitCode["NewSearchStarted"] = 1] = "NewSearchStarted";
    })(SearchCompletionExitCode || (exports.SearchCompletionExitCode = SearchCompletionExitCode = {}));
    class $sI {
        constructor(resource) {
            this.resource = resource;
            this.results = [];
            // empty
        }
    }
    exports.$sI = $sI;
    class $tI {
        constructor(text, range, previewOptions, webviewIndex) {
            this.ranges = range;
            this.webviewIndex = webviewIndex;
            // Trim preview if this is one match and a single-line match with a preview requested.
            // Otherwise send the full text, like for replace or for showing multiple previews.
            // TODO this is fishy.
            const ranges = Array.isArray(range) ? range : [range];
            if (previewOptions && previewOptions.matchLines === 1 && isSingleLineRangeList(ranges)) {
                // 1 line preview requested
                text = (0, strings_1.$cf)(text, previewOptions.matchLines);
                let result = '';
                let shift = 0;
                let lastEnd = 0;
                const leadingChars = Math.floor(previewOptions.charsPerLine / 5);
                const matches = [];
                for (const range of ranges) {
                    const previewStart = Math.max(range.startColumn - leadingChars, 0);
                    const previewEnd = range.startColumn + previewOptions.charsPerLine;
                    if (previewStart > lastEnd + leadingChars + SEARCH_ELIDED_MIN_LEN) {
                        const elision = SEARCH_ELIDED_PREFIX + (previewStart - lastEnd) + SEARCH_ELIDED_SUFFIX;
                        result += elision + text.slice(previewStart, previewEnd);
                        shift += previewStart - (lastEnd + elision.length);
                    }
                    else {
                        result += text.slice(lastEnd, previewEnd);
                    }
                    matches.push(new $vI(0, range.startColumn - shift, range.endColumn - shift));
                    lastEnd = previewEnd;
                }
                this.preview = { text: result, matches: Array.isArray(this.ranges) ? matches : matches[0] };
            }
            else {
                const firstMatchLine = Array.isArray(range) ? range[0].startLineNumber : range.startLineNumber;
                this.preview = {
                    text,
                    matches: (0, arrays_1.$Zb)(range, r => new $uI(r.startLineNumber - firstMatchLine, r.startColumn, r.endLineNumber - firstMatchLine, r.endColumn))
                };
            }
        }
    }
    exports.$tI = $tI;
    function isSingleLineRangeList(ranges) {
        const line = ranges[0].startLineNumber;
        for (const r of ranges) {
            if (r.startLineNumber !== line || r.endLineNumber !== line) {
                return false;
            }
        }
        return true;
    }
    class $uI {
        constructor(startLineNumber, startColumn, endLineNumber, endColumn) {
            this.startLineNumber = startLineNumber;
            this.startColumn = startColumn;
            this.endLineNumber = endLineNumber;
            this.endColumn = endColumn;
        }
    }
    exports.$uI = $uI;
    class $vI extends $uI {
        constructor(lineNumber, startColumn, endColumn) {
            super(lineNumber, startColumn, lineNumber, endColumn);
        }
    }
    exports.$vI = $vI;
    var ViewMode;
    (function (ViewMode) {
        ViewMode["List"] = "list";
        ViewMode["Tree"] = "tree";
    })(ViewMode || (exports.ViewMode = ViewMode = {}));
    var SearchSortOrder;
    (function (SearchSortOrder) {
        SearchSortOrder["Default"] = "default";
        SearchSortOrder["FileNames"] = "fileNames";
        SearchSortOrder["Type"] = "type";
        SearchSortOrder["Modified"] = "modified";
        SearchSortOrder["CountDescending"] = "countDescending";
        SearchSortOrder["CountAscending"] = "countAscending";
    })(SearchSortOrder || (exports.SearchSortOrder = SearchSortOrder = {}));
    function $wI(configuration, includeSearchExcludes = true) {
        const fileExcludes = configuration && configuration.files && configuration.files.exclude;
        const searchExcludes = includeSearchExcludes && configuration && configuration.search && configuration.search.exclude;
        if (!fileExcludes && !searchExcludes) {
            return undefined;
        }
        if (!fileExcludes || !searchExcludes) {
            return fileExcludes || searchExcludes;
        }
        let allExcludes = Object.create(null);
        // clone the config as it could be frozen
        allExcludes = objects.$Ym(allExcludes, objects.$Vm(fileExcludes));
        allExcludes = objects.$Ym(allExcludes, objects.$Vm(searchExcludes), true);
        return allExcludes;
    }
    exports.$wI = $wI;
    function $xI(queryProps, fsPath) {
        if (queryProps.excludePattern && glob.$qj(queryProps.excludePattern, fsPath)) {
            return false;
        }
        if (queryProps.includePattern || queryProps.usingSearchPaths) {
            if (queryProps.includePattern && glob.$qj(queryProps.includePattern, fsPath)) {
                return true;
            }
            // If searchPaths are being used, the extra file must be in a subfolder and match the pattern, if present
            if (queryProps.usingSearchPaths) {
                return !!queryProps.folderQueries && queryProps.folderQueries.some(fq => {
                    const searchPath = fq.folder.fsPath;
                    if (extpath.$If(fsPath, searchPath)) {
                        const relPath = paths.$$d(searchPath, fsPath);
                        return !fq.includePattern || !!glob.$qj(fq.includePattern, relPath);
                    }
                    else {
                        return false;
                    }
                });
            }
            return false;
        }
        return true;
    }
    exports.$xI = $xI;
    var SearchErrorCode;
    (function (SearchErrorCode) {
        SearchErrorCode[SearchErrorCode["unknownEncoding"] = 1] = "unknownEncoding";
        SearchErrorCode[SearchErrorCode["regexParseError"] = 2] = "regexParseError";
        SearchErrorCode[SearchErrorCode["globParseError"] = 3] = "globParseError";
        SearchErrorCode[SearchErrorCode["invalidLiteral"] = 4] = "invalidLiteral";
        SearchErrorCode[SearchErrorCode["rgProcessError"] = 5] = "rgProcessError";
        SearchErrorCode[SearchErrorCode["other"] = 6] = "other";
        SearchErrorCode[SearchErrorCode["canceled"] = 7] = "canceled";
    })(SearchErrorCode || (exports.SearchErrorCode = SearchErrorCode = {}));
    class $yI extends Error {
        constructor(message, code) {
            super(message);
            this.code = code;
        }
    }
    exports.$yI = $yI;
    function $zI(error) {
        const errorMsg = error.message;
        if ((0, errors_1.$2)(error)) {
            return new $yI(errorMsg, SearchErrorCode.canceled);
        }
        try {
            const details = JSON.parse(errorMsg);
            return new $yI(details.message, details.code);
        }
        catch (e) {
            return new $yI(errorMsg, SearchErrorCode.other);
        }
    }
    exports.$zI = $zI;
    function $AI(searchError) {
        const details = { message: searchError.message, code: searchError.code };
        return new Error(JSON.stringify(details));
    }
    exports.$AI = $AI;
    function $BI(arg) {
        if (arg.type === 'error') {
            return true;
        }
        else if (arg.type === 'success') {
            return true;
        }
        else {
            return false;
        }
    }
    exports.$BI = $BI;
    function $CI(arg) {
        return arg.type === 'success';
    }
    exports.$CI = $CI;
    function $DI(arg) {
        return !!arg.path;
    }
    exports.$DI = $DI;
    function $EI(candidate, normalizedFilePatternLowercase) {
        const pathToMatch = candidate.searchPath ? candidate.searchPath : candidate.relativePath;
        return (0, strings_1.$_e)(pathToMatch, normalizedFilePatternLowercase);
    }
    exports.$EI = $EI;
    class $FI {
        constructor(path) {
            this.path = path;
            this.results = [];
        }
        addMatch(match) {
            this.results.push(match);
        }
        serialize() {
            return {
                path: this.path,
                results: this.results,
                numMatches: this.results.length
            };
        }
    }
    exports.$FI = $FI;
    /**
     *  Computes the patterns that the provider handles. Discards sibling clauses and 'false' patterns
     */
    function $GI(globalPattern, folderPattern) {
        const merged = {
            ...(globalPattern || {}),
            ...(folderPattern || {})
        };
        return Object.keys(merged)
            .filter(key => {
            const value = merged[key];
            return typeof value === 'boolean' && value;
        });
    }
    exports.$GI = $GI;
    class $HI {
        constructor(config, folderQuery) {
            this.c = null;
            this.a = {
                ...(config.excludePattern || {}),
                ...(folderQuery.excludePattern || {})
            };
            this.b = glob.$rj(this.a);
            // Empty includeExpression means include nothing, so no {} shortcuts
            let includeExpression = config.includePattern;
            if (folderQuery.includePattern) {
                if (includeExpression) {
                    includeExpression = {
                        ...includeExpression,
                        ...folderQuery.includePattern
                    };
                }
                else {
                    includeExpression = folderQuery.includePattern;
                }
            }
            if (includeExpression) {
                this.c = glob.$rj(includeExpression);
            }
        }
        matchesExcludesSync(testPath, basename, hasSibling) {
            if (this.b && this.b(testPath, basename, hasSibling)) {
                return true;
            }
            return false;
        }
        /**
         * Guaranteed sync - siblingsFn should not return a promise.
         */
        includedInQuerySync(testPath, basename, hasSibling) {
            if (this.b && this.b(testPath, basename, hasSibling)) {
                return false;
            }
            if (this.c && !this.c(testPath, basename, hasSibling)) {
                return false;
            }
            return true;
        }
        /**
         * Evaluating the exclude expression is only async if it includes sibling clauses. As an optimization, avoid doing anything with Promises
         * unless the expression is async.
         */
        includedInQuery(testPath, basename, hasSibling) {
            const excluded = this.b(testPath, basename, hasSibling);
            const isIncluded = () => {
                return this.c ?
                    !!(this.c(testPath, basename, hasSibling)) :
                    true;
            };
            if ((0, async_1.$tg)(excluded)) {
                return excluded.then(excluded => {
                    if (excluded) {
                        return false;
                    }
                    return isIncluded();
                });
            }
            return isIncluded();
        }
        hasSiblingExcludeClauses() {
            return hasSiblingClauses(this.a);
        }
    }
    exports.$HI = $HI;
    function hasSiblingClauses(pattern) {
        for (const key in pattern) {
            if (typeof pattern[key] !== 'boolean') {
                return true;
            }
        }
        return false;
    }
    function $II(siblingsFn) {
        if (!siblingsFn) {
            return undefined;
        }
        let siblings;
        return (name) => {
            if (!siblings) {
                siblings = (siblingsFn() || Promise.resolve([]))
                    .then(list => list ? listToMap(list) : {});
            }
            return siblings.then(map => !!map[name]);
        };
    }
    exports.$II = $II;
    function $JI(siblingsFn) {
        if (!siblingsFn) {
            return undefined;
        }
        let siblings;
        return (name) => {
            if (!siblings) {
                const list = siblingsFn();
                siblings = list ? listToMap(list) : {};
            }
            return !!siblings[name];
        };
    }
    exports.$JI = $JI;
    function listToMap(list) {
        const map = {};
        for (const key of list) {
            map[key] = true;
        }
        return map;
    }
});
//# sourceMappingURL=search.js.map