/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/glob", "vs/base/common/objects", "vs/base/common/extpath", "vs/base/common/strings", "vs/platform/instantiation/common/instantiation", "vs/base/common/path", "vs/base/common/errors", "vs/workbench/services/search/common/searchExtTypes", "vs/base/common/async"], function (require, exports, arrays_1, glob, objects, extpath, strings_1, instantiation_1, paths, errors_1, searchExtTypes_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.hasSiblingFn = exports.hasSiblingPromiseFn = exports.QueryGlobTester = exports.resolvePatternsForProvider = exports.SerializableFileMatch = exports.isFilePatternMatch = exports.isSerializedFileMatch = exports.isSerializedSearchSuccess = exports.isSerializedSearchComplete = exports.serializeSearchError = exports.deserializeSearchError = exports.SearchError = exports.SearchErrorCode = exports.pathIncludedInQuery = exports.getExcludes = exports.SearchSortOrder = exports.ViewMode = exports.OneLineRange = exports.SearchRange = exports.TextSearchMatch = exports.FileMatch = exports.SearchCompletionExitCode = exports.isProgressMessage = exports.isFileMatch = exports.resultIsMatch = exports.QueryType = exports.SearchProviderType = exports.ISearchService = exports.SEARCH_EXCLUDE_CONFIG = exports.SEARCH_RESULT_LANGUAGE_ID = exports.VIEW_ID = exports.PANEL_ID = exports.VIEWLET_ID = exports.TextSearchCompleteMessageType = void 0;
    Object.defineProperty(exports, "TextSearchCompleteMessageType", { enumerable: true, get: function () { return searchExtTypes_1.TextSearchCompleteMessageType; } });
    exports.VIEWLET_ID = 'workbench.view.search';
    exports.PANEL_ID = 'workbench.panel.search';
    exports.VIEW_ID = 'workbench.view.search';
    exports.SEARCH_RESULT_LANGUAGE_ID = 'search-result';
    exports.SEARCH_EXCLUDE_CONFIG = 'search.exclude';
    // Warning: this pattern is used in the search editor to detect offsets. If you
    // change this, also change the search-result built-in extension
    const SEARCH_ELIDED_PREFIX = '⟪ ';
    const SEARCH_ELIDED_SUFFIX = ' characters skipped ⟫';
    const SEARCH_ELIDED_MIN_LEN = (SEARCH_ELIDED_PREFIX.length + SEARCH_ELIDED_SUFFIX.length + 5) * 2;
    exports.ISearchService = (0, instantiation_1.createDecorator)('searchService');
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
    function resultIsMatch(result) {
        return !!result.preview;
    }
    exports.resultIsMatch = resultIsMatch;
    function isFileMatch(p) {
        return !!p.resource;
    }
    exports.isFileMatch = isFileMatch;
    function isProgressMessage(p) {
        return !!p.message;
    }
    exports.isProgressMessage = isProgressMessage;
    var SearchCompletionExitCode;
    (function (SearchCompletionExitCode) {
        SearchCompletionExitCode[SearchCompletionExitCode["Normal"] = 0] = "Normal";
        SearchCompletionExitCode[SearchCompletionExitCode["NewSearchStarted"] = 1] = "NewSearchStarted";
    })(SearchCompletionExitCode || (exports.SearchCompletionExitCode = SearchCompletionExitCode = {}));
    class FileMatch {
        constructor(resource) {
            this.resource = resource;
            this.results = [];
            // empty
        }
    }
    exports.FileMatch = FileMatch;
    class TextSearchMatch {
        constructor(text, range, previewOptions, webviewIndex) {
            this.ranges = range;
            this.webviewIndex = webviewIndex;
            // Trim preview if this is one match and a single-line match with a preview requested.
            // Otherwise send the full text, like for replace or for showing multiple previews.
            // TODO this is fishy.
            const ranges = Array.isArray(range) ? range : [range];
            if (previewOptions && previewOptions.matchLines === 1 && isSingleLineRangeList(ranges)) {
                // 1 line preview requested
                text = (0, strings_1.getNLines)(text, previewOptions.matchLines);
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
                    matches.push(new OneLineRange(0, range.startColumn - shift, range.endColumn - shift));
                    lastEnd = previewEnd;
                }
                this.preview = { text: result, matches: Array.isArray(this.ranges) ? matches : matches[0] };
            }
            else {
                const firstMatchLine = Array.isArray(range) ? range[0].startLineNumber : range.startLineNumber;
                this.preview = {
                    text,
                    matches: (0, arrays_1.mapArrayOrNot)(range, r => new SearchRange(r.startLineNumber - firstMatchLine, r.startColumn, r.endLineNumber - firstMatchLine, r.endColumn))
                };
            }
        }
    }
    exports.TextSearchMatch = TextSearchMatch;
    function isSingleLineRangeList(ranges) {
        const line = ranges[0].startLineNumber;
        for (const r of ranges) {
            if (r.startLineNumber !== line || r.endLineNumber !== line) {
                return false;
            }
        }
        return true;
    }
    class SearchRange {
        constructor(startLineNumber, startColumn, endLineNumber, endColumn) {
            this.startLineNumber = startLineNumber;
            this.startColumn = startColumn;
            this.endLineNumber = endLineNumber;
            this.endColumn = endColumn;
        }
    }
    exports.SearchRange = SearchRange;
    class OneLineRange extends SearchRange {
        constructor(lineNumber, startColumn, endColumn) {
            super(lineNumber, startColumn, lineNumber, endColumn);
        }
    }
    exports.OneLineRange = OneLineRange;
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
    function getExcludes(configuration, includeSearchExcludes = true) {
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
        allExcludes = objects.mixin(allExcludes, objects.deepClone(fileExcludes));
        allExcludes = objects.mixin(allExcludes, objects.deepClone(searchExcludes), true);
        return allExcludes;
    }
    exports.getExcludes = getExcludes;
    function pathIncludedInQuery(queryProps, fsPath) {
        if (queryProps.excludePattern && glob.match(queryProps.excludePattern, fsPath)) {
            return false;
        }
        if (queryProps.includePattern || queryProps.usingSearchPaths) {
            if (queryProps.includePattern && glob.match(queryProps.includePattern, fsPath)) {
                return true;
            }
            // If searchPaths are being used, the extra file must be in a subfolder and match the pattern, if present
            if (queryProps.usingSearchPaths) {
                return !!queryProps.folderQueries && queryProps.folderQueries.some(fq => {
                    const searchPath = fq.folder.fsPath;
                    if (extpath.isEqualOrParent(fsPath, searchPath)) {
                        const relPath = paths.relative(searchPath, fsPath);
                        return !fq.includePattern || !!glob.match(fq.includePattern, relPath);
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
    exports.pathIncludedInQuery = pathIncludedInQuery;
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
    class SearchError extends Error {
        constructor(message, code) {
            super(message);
            this.code = code;
        }
    }
    exports.SearchError = SearchError;
    function deserializeSearchError(error) {
        const errorMsg = error.message;
        if ((0, errors_1.isCancellationError)(error)) {
            return new SearchError(errorMsg, SearchErrorCode.canceled);
        }
        try {
            const details = JSON.parse(errorMsg);
            return new SearchError(details.message, details.code);
        }
        catch (e) {
            return new SearchError(errorMsg, SearchErrorCode.other);
        }
    }
    exports.deserializeSearchError = deserializeSearchError;
    function serializeSearchError(searchError) {
        const details = { message: searchError.message, code: searchError.code };
        return new Error(JSON.stringify(details));
    }
    exports.serializeSearchError = serializeSearchError;
    function isSerializedSearchComplete(arg) {
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
    exports.isSerializedSearchComplete = isSerializedSearchComplete;
    function isSerializedSearchSuccess(arg) {
        return arg.type === 'success';
    }
    exports.isSerializedSearchSuccess = isSerializedSearchSuccess;
    function isSerializedFileMatch(arg) {
        return !!arg.path;
    }
    exports.isSerializedFileMatch = isSerializedFileMatch;
    function isFilePatternMatch(candidate, normalizedFilePatternLowercase) {
        const pathToMatch = candidate.searchPath ? candidate.searchPath : candidate.relativePath;
        return (0, strings_1.fuzzyContains)(pathToMatch, normalizedFilePatternLowercase);
    }
    exports.isFilePatternMatch = isFilePatternMatch;
    class SerializableFileMatch {
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
    exports.SerializableFileMatch = SerializableFileMatch;
    /**
     *  Computes the patterns that the provider handles. Discards sibling clauses and 'false' patterns
     */
    function resolvePatternsForProvider(globalPattern, folderPattern) {
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
    exports.resolvePatternsForProvider = resolvePatternsForProvider;
    class QueryGlobTester {
        constructor(config, folderQuery) {
            this._parsedIncludeExpression = null;
            this._excludeExpression = {
                ...(config.excludePattern || {}),
                ...(folderQuery.excludePattern || {})
            };
            this._parsedExcludeExpression = glob.parse(this._excludeExpression);
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
                this._parsedIncludeExpression = glob.parse(includeExpression);
            }
        }
        matchesExcludesSync(testPath, basename, hasSibling) {
            if (this._parsedExcludeExpression && this._parsedExcludeExpression(testPath, basename, hasSibling)) {
                return true;
            }
            return false;
        }
        /**
         * Guaranteed sync - siblingsFn should not return a promise.
         */
        includedInQuerySync(testPath, basename, hasSibling) {
            if (this._parsedExcludeExpression && this._parsedExcludeExpression(testPath, basename, hasSibling)) {
                return false;
            }
            if (this._parsedIncludeExpression && !this._parsedIncludeExpression(testPath, basename, hasSibling)) {
                return false;
            }
            return true;
        }
        /**
         * Evaluating the exclude expression is only async if it includes sibling clauses. As an optimization, avoid doing anything with Promises
         * unless the expression is async.
         */
        includedInQuery(testPath, basename, hasSibling) {
            const excluded = this._parsedExcludeExpression(testPath, basename, hasSibling);
            const isIncluded = () => {
                return this._parsedIncludeExpression ?
                    !!(this._parsedIncludeExpression(testPath, basename, hasSibling)) :
                    true;
            };
            if ((0, async_1.isThenable)(excluded)) {
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
            return hasSiblingClauses(this._excludeExpression);
        }
    }
    exports.QueryGlobTester = QueryGlobTester;
    function hasSiblingClauses(pattern) {
        for (const key in pattern) {
            if (typeof pattern[key] !== 'boolean') {
                return true;
            }
        }
        return false;
    }
    function hasSiblingPromiseFn(siblingsFn) {
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
    exports.hasSiblingPromiseFn = hasSiblingPromiseFn;
    function hasSiblingFn(siblingsFn) {
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
    exports.hasSiblingFn = hasSiblingFn;
    function listToMap(list) {
        const map = {};
        for (const key of list) {
            map[key] = true;
        }
        return map;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3NlYXJjaC9jb21tb24vc2VhcmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQW9CdkYsOEdBSkEsOENBQTZCLE9BSUE7SUFFekIsUUFBQSxVQUFVLEdBQUcsdUJBQXVCLENBQUM7SUFDckMsUUFBQSxRQUFRLEdBQUcsd0JBQXdCLENBQUM7SUFDcEMsUUFBQSxPQUFPLEdBQUcsdUJBQXVCLENBQUM7SUFDbEMsUUFBQSx5QkFBeUIsR0FBRyxlQUFlLENBQUM7SUFFNUMsUUFBQSxxQkFBcUIsR0FBRyxnQkFBZ0IsQ0FBQztJQUV0RCwrRUFBK0U7SUFDL0UsZ0VBQWdFO0lBQ2hFLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDO0lBQ2xDLE1BQU0sb0JBQW9CLEdBQUcsdUJBQXVCLENBQUM7SUFDckQsTUFBTSxxQkFBcUIsR0FBRyxDQUFDLG9CQUFvQixDQUFDLE1BQU0sR0FBRyxvQkFBb0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRXJGLFFBQUEsY0FBYyxHQUFHLElBQUEsK0JBQWUsRUFBaUIsZUFBZSxDQUFDLENBQUM7SUFjL0U7O09BRUc7SUFDSCxJQUFrQixrQkFHakI7SUFIRCxXQUFrQixrQkFBa0I7UUFDbkMsMkRBQUksQ0FBQTtRQUNKLDJEQUFJLENBQUE7SUFDTCxDQUFDLEVBSGlCLGtCQUFrQixrQ0FBbEIsa0JBQWtCLFFBR25DO0lBcUVELElBQWtCLFNBR2pCO0lBSEQsV0FBa0IsU0FBUztRQUMxQix5Q0FBUSxDQUFBO1FBQ1IseUNBQVEsQ0FBQTtJQUNULENBQUMsRUFIaUIsU0FBUyx5QkFBVCxTQUFTLFFBRzFCO0lBMEVELFNBQWdCLGFBQWEsQ0FBQyxNQUF5QjtRQUN0RCxPQUFPLENBQUMsQ0FBb0IsTUFBTyxD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