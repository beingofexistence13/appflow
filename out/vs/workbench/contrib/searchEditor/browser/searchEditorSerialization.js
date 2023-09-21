/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/editor/common/core/range", "vs/nls", "vs/workbench/contrib/search/browser/searchModel", "vs/workbench/services/textfile/common/textfiles", "vs/css!./media/searchEditor"], function (require, exports, arrays_1, range_1, nls_1, searchModel_1, textfiles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseSerializedSearchEditor = exports.parseSavedSearchEditor = exports.serializeSearchResultForEditor = exports.extractSearchQueryFromLines = exports.defaultSearchConfig = exports.extractSearchQueryFromModel = exports.serializeSearchConfiguration = void 0;
    // Using \r\n on Windows inserts an extra newline between results.
    const lineDelimiter = '\n';
    const translateRangeLines = (n) => (range) => new range_1.Range(range.startLineNumber + n, range.startColumn, range.endLineNumber + n, range.endColumn);
    const matchToSearchResultFormat = (match, longestLineNumber) => {
        const getLinePrefix = (i) => `${match.range().startLineNumber + i}`;
        const fullMatchLines = match.fullPreviewLines();
        const results = [];
        fullMatchLines
            .forEach((sourceLine, i) => {
            const lineNumber = getLinePrefix(i);
            const paddingStr = ' '.repeat(longestLineNumber - lineNumber.length);
            const prefix = `  ${paddingStr}${lineNumber}: `;
            const prefixOffset = prefix.length;
            // split instead of replace to avoid creating a new string object
            const line = prefix + (sourceLine.split(/\r?\n?$/, 1)[0] || '');
            const rangeOnThisLine = ({ start, end }) => new range_1.Range(1, (start ?? 1) + prefixOffset, 1, (end ?? sourceLine.length + 1) + prefixOffset);
            const matchRange = match.rangeInPreview();
            const matchIsSingleLine = matchRange.startLineNumber === matchRange.endLineNumber;
            let lineRange;
            if (matchIsSingleLine) {
                lineRange = (rangeOnThisLine({ start: matchRange.startColumn, end: matchRange.endColumn }));
            }
            else if (i === 0) {
                lineRange = (rangeOnThisLine({ start: matchRange.startColumn }));
            }
            else if (i === fullMatchLines.length - 1) {
                lineRange = (rangeOnThisLine({ end: matchRange.endColumn }));
            }
            else {
                lineRange = (rangeOnThisLine({}));
            }
            results.push({ lineNumber: lineNumber, line, ranges: [lineRange] });
        });
        return results;
    };
    function fileMatchToSearchResultFormat(fileMatch, labelFormatter) {
        const textSerializations = fileMatch.textMatches().length > 0 ? matchesToSearchResultFormat(fileMatch.resource, fileMatch.textMatches().sort(searchModel_1.searchMatchComparer), fileMatch.context, labelFormatter) : undefined;
        const cellSerializations = fileMatch.cellMatches().sort((a, b) => a.cellIndex - b.cellIndex).sort().filter(cellMatch => cellMatch.contentMatches.length > 0).map((cellMatch, index) => cellMatchToSearchResultFormat(cellMatch, labelFormatter, index === 0));
        return [textSerializations, ...cellSerializations].filter(x => !!x);
    }
    function matchesToSearchResultFormat(resource, sortedMatches, matchContext, labelFormatter, shouldUseHeader = true) {
        const longestLineNumber = sortedMatches[sortedMatches.length - 1].range().endLineNumber.toString().length;
        const text = shouldUseHeader ? [`${labelFormatter(resource)}:`] : [];
        const matchRanges = [];
        const targetLineNumberToOffset = {};
        const context = [];
        matchContext.forEach((line, lineNumber) => context.push({ line, lineNumber }));
        context.sort((a, b) => a.lineNumber - b.lineNumber);
        let lastLine = undefined;
        const seenLines = new Set();
        sortedMatches.forEach(match => {
            matchToSearchResultFormat(match, longestLineNumber).forEach(match => {
                if (!seenLines.has(match.lineNumber)) {
                    while (context.length && context[0].lineNumber < +match.lineNumber) {
                        const { line, lineNumber } = context.shift();
                        if (lastLine !== undefined && lineNumber !== lastLine + 1) {
                            text.push('');
                        }
                        text.push(`  ${' '.repeat(longestLineNumber - `${lineNumber}`.length)}${lineNumber}  ${line}`);
                        lastLine = lineNumber;
                    }
                    targetLineNumberToOffset[match.lineNumber] = text.length;
                    seenLines.add(match.lineNumber);
                    text.push(match.line);
                    lastLine = +match.lineNumber;
                }
                matchRanges.push(...match.ranges.map(translateRangeLines(targetLineNumberToOffset[match.lineNumber])));
            });
        });
        while (context.length) {
            const { line, lineNumber } = context.shift();
            text.push(`  ${lineNumber}  ${line}`);
        }
        return { text, matchRanges };
    }
    function cellMatchToSearchResultFormat(cellMatch, labelFormatter, shouldUseHeader) {
        return matchesToSearchResultFormat(cellMatch.cell.uri, cellMatch.contentMatches.sort(searchModel_1.searchMatchComparer), cellMatch.context, labelFormatter, shouldUseHeader);
    }
    const contentPatternToSearchConfiguration = (pattern, includes, excludes, contextLines) => {
        return {
            query: pattern.contentPattern.pattern,
            isRegexp: !!pattern.contentPattern.isRegExp,
            isCaseSensitive: !!pattern.contentPattern.isCaseSensitive,
            matchWholeWord: !!pattern.contentPattern.isWordMatch,
            filesToExclude: excludes, filesToInclude: includes,
            showIncludesExcludes: !!(includes || excludes || pattern?.userDisabledExcludesAndIgnoreFiles),
            useExcludeSettingsAndIgnoreFiles: (pattern?.userDisabledExcludesAndIgnoreFiles === undefined ? true : !pattern.userDisabledExcludesAndIgnoreFiles),
            contextLines,
            onlyOpenEditors: !!pattern.onlyOpenEditors,
            notebookSearchConfig: {
                includeMarkupInput: !!pattern.contentPattern.notebookInfo?.isInNotebookMarkdownInput,
                includeMarkupPreview: !!pattern.contentPattern.notebookInfo?.isInNotebookMarkdownPreview,
                includeCodeInput: !!pattern.contentPattern.notebookInfo?.isInNotebookCellInput,
                includeOutput: !!pattern.contentPattern.notebookInfo?.isInNotebookCellOutput,
            }
        };
    };
    const serializeSearchConfiguration = (config) => {
        const removeNullFalseAndUndefined = (a) => a.filter(a => a !== false && a !== null && a !== undefined);
        const escapeNewlines = (str) => str.replace(/\\/g, '\\\\').replace(/\n/g, '\\n');
        return removeNullFalseAndUndefined([
            `# Query: ${escapeNewlines(config.query ?? '')}`,
            (config.isCaseSensitive || config.matchWholeWord || config.isRegexp || config.useExcludeSettingsAndIgnoreFiles === false)
                && `# Flags: ${(0, arrays_1.coalesce)([
                    config.isCaseSensitive && 'CaseSensitive',
                    config.matchWholeWord && 'WordMatch',
                    config.isRegexp && 'RegExp',
                    config.onlyOpenEditors && 'OpenEditors',
                    (config.useExcludeSettingsAndIgnoreFiles === false) && 'IgnoreExcludeSettings'
                ]).join(' ')}`,
            config.filesToInclude ? `# Including: ${config.filesToInclude}` : undefined,
            config.filesToExclude ? `# Excluding: ${config.filesToExclude}` : undefined,
            config.contextLines ? `# ContextLines: ${config.contextLines}` : undefined,
            ''
        ]).join(lineDelimiter);
    };
    exports.serializeSearchConfiguration = serializeSearchConfiguration;
    const extractSearchQueryFromModel = (model) => (0, exports.extractSearchQueryFromLines)(model.getValueInRange(new range_1.Range(1, 1, 6, 1)).split(lineDelimiter));
    exports.extractSearchQueryFromModel = extractSearchQueryFromModel;
    const defaultSearchConfig = () => ({
        query: '',
        filesToInclude: '',
        filesToExclude: '',
        isRegexp: false,
        isCaseSensitive: false,
        useExcludeSettingsAndIgnoreFiles: true,
        matchWholeWord: false,
        contextLines: 0,
        showIncludesExcludes: false,
        onlyOpenEditors: false,
        notebookSearchConfig: {
            includeMarkupInput: true,
            includeMarkupPreview: false,
            includeCodeInput: true,
            includeOutput: true,
        }
    });
    exports.defaultSearchConfig = defaultSearchConfig;
    const extractSearchQueryFromLines = (lines) => {
        const query = (0, exports.defaultSearchConfig)();
        const unescapeNewlines = (str) => {
            let out = '';
            for (let i = 0; i < str.length; i++) {
                if (str[i] === '\\') {
                    i++;
                    const escaped = str[i];
                    if (escaped === 'n') {
                        out += '\n';
                    }
                    else if (escaped === '\\') {
                        out += '\\';
                    }
                    else {
                        throw Error((0, nls_1.localize)('invalidQueryStringError', "All backslashes in Query string must be escaped (\\\\)"));
                    }
                }
                else {
                    out += str[i];
                }
            }
            return out;
        };
        const parseYML = /^# ([^:]*): (.*)$/;
        for (const line of lines) {
            const parsed = parseYML.exec(line);
            if (!parsed) {
                continue;
            }
            const [, key, value] = parsed;
            switch (key) {
                case 'Query':
                    query.query = unescapeNewlines(value);
                    break;
                case 'Including':
                    query.filesToInclude = value;
                    break;
                case 'Excluding':
                    query.filesToExclude = value;
                    break;
                case 'ContextLines':
                    query.contextLines = +value;
                    break;
                case 'Flags': {
                    query.isRegexp = value.indexOf('RegExp') !== -1;
                    query.isCaseSensitive = value.indexOf('CaseSensitive') !== -1;
                    query.useExcludeSettingsAndIgnoreFiles = value.indexOf('IgnoreExcludeSettings') === -1;
                    query.matchWholeWord = value.indexOf('WordMatch') !== -1;
                    query.onlyOpenEditors = value.indexOf('OpenEditors') !== -1;
                }
            }
        }
        query.showIncludesExcludes = !!(query.filesToInclude || query.filesToExclude || !query.useExcludeSettingsAndIgnoreFiles);
        return query;
    };
    exports.extractSearchQueryFromLines = extractSearchQueryFromLines;
    const serializeSearchResultForEditor = (searchResult, rawIncludePattern, rawExcludePattern, contextLines, labelFormatter, sortOrder, limitHit) => {
        if (!searchResult.query) {
            throw Error('Internal Error: Expected query, got null');
        }
        const config = contentPatternToSearchConfiguration(searchResult.query, rawIncludePattern, rawExcludePattern, contextLines);
        const filecount = searchResult.fileCount() > 1 ? (0, nls_1.localize)('numFiles', "{0} files", searchResult.fileCount()) : (0, nls_1.localize)('oneFile', "1 file");
        const resultcount = searchResult.count() > 1 ? (0, nls_1.localize)('numResults', "{0} results", searchResult.count()) : (0, nls_1.localize)('oneResult', "1 result");
        const info = [
            searchResult.count()
                ? `${resultcount} - ${filecount}`
                : (0, nls_1.localize)('noResults', "No Results"),
        ];
        if (limitHit) {
            info.push((0, nls_1.localize)('searchMaxResultsWarning', "The result set only contains a subset of all matches. Be more specific in your search to narrow down the results."));
        }
        info.push('');
        const matchComparer = (a, b) => (0, searchModel_1.searchMatchComparer)(a, b, sortOrder);
        const allResults = flattenSearchResultSerializations((0, arrays_1.flatten)(searchResult.folderMatches().sort(matchComparer)
            .map(folderMatch => folderMatch.allDownstreamFileMatches().sort(matchComparer)
            .flatMap(fileMatch => fileMatchToSearchResultFormat(fileMatch, labelFormatter)))));
        return {
            matchRanges: allResults.matchRanges.map(translateRangeLines(info.length)),
            text: info.concat(allResults.text).join(lineDelimiter),
            config
        };
    };
    exports.serializeSearchResultForEditor = serializeSearchResultForEditor;
    const flattenSearchResultSerializations = (serializations) => {
        const text = [];
        const matchRanges = [];
        serializations.forEach(serialized => {
            serialized.matchRanges.map(translateRangeLines(text.length)).forEach(range => matchRanges.push(range));
            serialized.text.forEach(line => text.push(line));
            text.push(''); // new line
        });
        return { text, matchRanges };
    };
    const parseSavedSearchEditor = async (accessor, resource) => {
        const textFileService = accessor.get(textfiles_1.ITextFileService);
        const text = (await textFileService.read(resource)).value;
        return (0, exports.parseSerializedSearchEditor)(text);
    };
    exports.parseSavedSearchEditor = parseSavedSearchEditor;
    const parseSerializedSearchEditor = (text) => {
        const headerlines = [];
        const bodylines = [];
        let inHeader = true;
        for (const line of text.split(/\r?\n/g)) {
            if (inHeader) {
                headerlines.push(line);
                if (line === '') {
                    inHeader = false;
                }
            }
            else {
                bodylines.push(line);
            }
        }
        return { config: (0, exports.extractSearchQueryFromLines)(headerlines), text: bodylines.join('\n') };
    };
    exports.parseSerializedSearchEditor = parseSerializedSearchEditor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoRWRpdG9yU2VyaWFsaXphdGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3NlYXJjaEVkaXRvci9icm93c2VyL3NlYXJjaEVkaXRvclNlcmlhbGl6YXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBY2hHLGtFQUFrRTtJQUNsRSxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUM7SUFFM0IsTUFBTSxtQkFBbUIsR0FDeEIsQ0FBQyxDQUFTLEVBQUUsRUFBRSxDQUNiLENBQUMsS0FBWSxFQUFFLEVBQUUsQ0FDaEIsSUFBSSxhQUFLLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsYUFBYSxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFckcsTUFBTSx5QkFBeUIsR0FBRyxDQUFDLEtBQVksRUFBRSxpQkFBeUIsRUFBMkQsRUFBRTtRQUN0SSxNQUFNLGFBQWEsR0FBRyxDQUFDLENBQVMsRUFBRSxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsZUFBZSxHQUFHLENBQUMsRUFBRSxDQUFDO1FBRTVFLE1BQU0sY0FBYyxHQUFHLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBR2hELE1BQU0sT0FBTyxHQUE0RCxFQUFFLENBQUM7UUFFNUUsY0FBYzthQUNaLE9BQU8sQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUMxQixNQUFNLFVBQVUsR0FBRyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEMsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDckUsTUFBTSxNQUFNLEdBQUcs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