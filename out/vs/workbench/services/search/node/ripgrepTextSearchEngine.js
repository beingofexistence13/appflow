/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "child_process", "events", "string_decoder", "vs/base/common/arrays", "vs/base/common/collections", "vs/base/common/glob", "vs/base/common/path", "vs/base/common/strings", "vs/base/common/uri", "vs/workbench/services/search/common/search", "vs/workbench/services/search/common/searchExtTypes", "vscode-regexpp", "@vscode/ripgrep", "./ripgrepSearchUtils"], function (require, exports, cp, events_1, string_decoder_1, arrays_1, collections_1, glob_1, path, strings_1, uri_1, search_1, searchExtTypes_1, vscode_regexpp_1, ripgrep_1, ripgrepSearchUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.performBraceExpansionForRipgrep = exports.fixNewline = exports.fixRegexNewline = exports.unicodeEscapesToPCRE2 = exports.getRgArgs = exports.RipgrepParser = exports.RipgrepTextSearchEngine = void 0;
    // If @vscode/ripgrep is in an .asar file, then the binary is unpacked.
    const rgDiskPath = ripgrep_1.rgPath.replace(/\bnode_modules\.asar\b/, 'node_modules.asar.unpacked');
    class RipgrepTextSearchEngine {
        constructor(outputChannel) {
            this.outputChannel = outputChannel;
        }
        provideTextSearchResults(query, options, progress, token) {
            this.outputChannel.appendLine(`provideTextSearchResults ${query.pattern}, ${JSON.stringify({
                ...options,
                ...{
                    folder: options.folder.toString()
                }
            })}`);
            return new Promise((resolve, reject) => {
                token.onCancellationRequested(() => cancel());
                const rgArgs = getRgArgs(query, options);
                const cwd = options.folder.fsPath;
                const escapedArgs = rgArgs
                    .map(arg => arg.match(/^-/) ? arg : `'${arg}'`)
                    .join(' ');
                this.outputChannel.appendLine(`${rgDiskPath} ${escapedArgs}\n - cwd: ${cwd}`);
                let rgProc = cp.spawn(rgDiskPath, rgArgs, { cwd });
                rgProc.on('error', e => {
                    console.error(e);
                    this.outputChannel.appendLine('Error: ' + (e && e.message));
                    reject((0, search_1.serializeSearchError)(new search_1.SearchError(e && e.message, search_1.SearchErrorCode.rgProcessError)));
                });
                let gotResult = false;
                const ripgrepParser = new RipgrepParser(options.maxResults, cwd, options.previewOptions);
                ripgrepParser.on('result', (match) => {
                    gotResult = true;
                    dataWithoutResult = '';
                    progress.report(match);
                });
                let isDone = false;
                const cancel = () => {
                    isDone = true;
                    rgProc?.kill();
                    ripgrepParser?.cancel();
                };
                let limitHit = false;
                ripgrepParser.on('hitLimit', () => {
                    limitHit = true;
                    cancel();
                });
                let dataWithoutResult = '';
                rgProc.stdout.on('data', data => {
                    ripgrepParser.handleData(data);
                    if (!gotResult) {
                        dataWithoutResult += data;
                    }
                });
                let gotData = false;
                rgProc.stdout.once('data', () => gotData = true);
                let stderr = '';
                rgProc.stderr.on('data', data => {
                    const message = data.toString();
                    this.outputChannel.appendLine(message);
                    if (stderr.length + message.length < 1e6) {
                        stderr += message;
                    }
                });
                rgProc.on('close', () => {
                    this.outputChannel.appendLine(gotData ? 'Got data from stdout' : 'No data from stdout');
                    this.outputChannel.appendLine(gotResult ? 'Got result from parser' : 'No result from parser');
                    if (dataWithoutResult) {
                        this.outputChannel.appendLine(`Got data without result: ${dataWithoutResult}`);
                    }
                    this.outputChannel.appendLine('');
                    if (isDone) {
                        resolve({ limitHit });
                    }
                    else {
                        // Trigger last result
                        ripgrepParser.flush();
                        rgProc = null;
                        let searchError;
                        if (stderr && !gotData && (searchError = rgErrorMsgForDisplay(stderr))) {
                            reject((0, search_1.serializeSearchError)(new search_1.SearchError(searchError.message, searchError.code)));
                        }
                        else {
                            resolve({ limitHit });
                        }
                    }
                });
            });
        }
    }
    exports.RipgrepTextSearchEngine = RipgrepTextSearchEngine;
    /**
     * Read the first line of stderr and return an error for display or undefined, based on a list of
     * allowed properties.
     * Ripgrep produces stderr output which is not from a fatal error, and we only want the search to be
     * "failed" when a fatal error was produced.
     */
    function rgErrorMsgForDisplay(msg) {
        const lines = msg.split('\n');
        const firstLine = lines[0].trim();
        if (lines.some(l => l.startsWith('regex parse error'))) {
            return new search_1.SearchError(buildRegexParseError(lines), search_1.SearchErrorCode.regexParseError);
        }
        const match = firstLine.match(/grep config error: unknown encoding: (.*)/);
        if (match) {
            return new search_1.SearchError(`Unknown encoding: ${match[1]}`, search_1.SearchErrorCode.unknownEncoding);
        }
        if (firstLine.startsWith('error parsing glob')) {
            // Uppercase first letter
            return new search_1.SearchError(firstLine.charAt(0).toUpperCase() + firstLine.substr(1), search_1.SearchErrorCode.globParseError);
        }
        if (firstLine.startsWith('the literal')) {
            // Uppercase first letter
            return new search_1.SearchError(firstLine.charAt(0).toUpperCase() + firstLine.substr(1), search_1.SearchErrorCode.invalidLiteral);
        }
        if (firstLine.startsWith('PCRE2: error compiling pattern')) {
            return new search_1.SearchError(firstLine, search_1.SearchErrorCode.regexParseError);
        }
        return undefined;
    }
    function buildRegexParseError(lines) {
        const errorMessage = ['Regex parse error'];
        const pcre2ErrorLine = lines.filter(l => (l.startsWith('PCRE2:')));
        if (pcre2ErrorLine.length >= 1) {
            const pcre2ErrorMessage = pcre2ErrorLine[0].replace('PCRE2:', '');
            if (pcre2ErrorMessage.indexOf(':') !== -1 && pcre2ErrorMessage.split(':').length >= 2) {
                const pcre2ActualErrorMessage = pcre2ErrorMessage.split(':')[1];
                errorMessage.push(':' + pcre2ActualErrorMessage);
            }
        }
        return errorMessage.join('');
    }
    class RipgrepParser extends events_1.EventEmitter {
        constructor(maxResults, rootFolder, previewOptions) {
            super();
            this.maxResults = maxResults;
            this.rootFolder = rootFolder;
            this.previewOptions = previewOptions;
            this.remainder = '';
            this.isDone = false;
            this.hitLimit = false;
            this.numResults = 0;
            this.stringDecoder = new string_decoder_1.StringDecoder();
        }
        cancel() {
            this.isDone = true;
        }
        flush() {
            this.handleDecodedData(this.stringDecoder.end());
        }
        on(event, listener) {
            super.on(event, listener);
            return this;
        }
        handleData(data) {
            if (this.isDone) {
                return;
            }
            const dataStr = typeof data === 'string' ? data : this.stringDecoder.write(data);
            this.handleDecodedData(dataStr);
        }
        handleDecodedData(decodedData) {
            // check for newline before appending to remainder
            let newlineIdx = decodedData.indexOf('\n');
            // If the previous data chunk didn't end in a newline, prepend it to this chunk
            const dataStr = this.remainder + decodedData;
            if (newlineIdx >= 0) {
                newlineIdx += this.remainder.length;
            }
            else {
                // Shortcut
                this.remainder = dataStr;
                return;
            }
            let prevIdx = 0;
            while (newlineIdx >= 0) {
                this.handleLine(dataStr.substring(prevIdx, newlineIdx).trim());
                prevIdx = newlineIdx + 1;
                newlineIdx = dataStr.indexOf('\n', prevIdx);
            }
            this.remainder = dataStr.substring(prevIdx);
        }
        handleLine(outputLine) {
            if (this.isDone || !outputLine) {
                return;
            }
            let parsedLine;
            try {
                parsedLine = JSON.parse(outputLine);
            }
            catch (e) {
                throw new Error(`malformed line from rg: ${outputLine}`);
            }
            if (parsedLine.type === 'match') {
                const matchPath = bytesOrTextToString(parsedLine.data.path);
                const uri = uri_1.URI.file(path.join(this.rootFolder, matchPath));
                const result = this.createTextSearchMatch(parsedLine.data, uri);
                this.onResult(result);
                if (this.hitLimit) {
                    this.cancel();
                    this.emit('hitLimit');
                }
            }
            else if (parsedLine.type === 'context') {
                const contextPath = bytesOrTextToString(parsedLine.data.path);
                const uri = uri_1.URI.file(path.join(this.rootFolder, contextPath));
                const result = this.createTextSearchContext(parsedLine.data, uri);
                result.forEach(r => this.onResult(r));
            }
        }
        createTextSearchMatch(data, uri) {
            const lineNumber = data.line_number - 1;
            const fullText = bytesOrTextToString(data.lines);
            const fullTextBytes = Buffer.from(fullText);
            let prevMatchEnd = 0;
            let prevMatchEndCol = 0;
            let prevMatchEndLine = lineNumber;
            // it looks like certain regexes can match a line, but cause rg to not
            // emit any specific submatches for that line.
            // https://github.com/microsoft/vscode/issues/100569#issuecomment-738496991
            if (data.submatches.length === 0) {
                data.submatches.push(fullText.length
                    ? { start: 0, end: 1, match: { text: fullText[0] } }
                    : { start: 0, end: 0, match: { text: '' } });
            }
            const ranges = (0, arrays_1.coalesce)(data.submatches.map((match, i) => {
                if (this.hitLimit) {
                    return null;
                }
                this.numResults++;
                if (this.numResults >= this.maxResults) {
                    // Finish the line, then report the result below
                    this.hitLimit = true;
                }
                const matchText = bytesOrTextToString(match.match);
                const inBetweenText = fullTextBytes.slice(prevMatchEnd, match.start).toString();
                const inBetweenStats = getNumLinesAndLastNewlineLength(inBetweenText);
                const startCol = inBetweenStats.numLines > 0 ?
                    inBetweenStats.lastLineLength :
                    inBetweenStats.lastLineLength + prevMatchEndCol;
                const stats = getNumLinesAndLastNewlineLength(matchText);
                const startLineNumber = inBetweenStats.numLines + prevMatchEndLine;
                const endLineNumber = stats.numLines + startLineNumber;
                const endCol = stats.numLines > 0 ?
                    stats.lastLineLength :
                    stats.lastLineLength + startCol;
                prevMatchEnd = match.end;
                prevMatchEndCol = endCol;
                prevMatchEndLine = endLineNumber;
                return new searchExtTypes_1.Range(startLineNumber, startCol, endLineNumber, endCol);
            }));
            return (0, ripgrepSearchUtils_1.createTextSearchResult)(uri, fullText, ranges, this.previewOptions);
        }
        createTextSearchContext(data, uri) {
            const text = bytesOrTextToString(data.lines);
            const startLine = data.line_number;
            return text
                .replace(/\r?\n$/, '')
                .split('\n')
                .map((line, i) => {
                return {
                    text: line,
                    uri,
                    lineNumber: startLine + i
                };
            });
        }
        onResult(match) {
            this.emit('result', match);
        }
    }
    exports.RipgrepParser = RipgrepParser;
    function bytesOrTextToString(obj) {
        return obj.bytes ?
            Buffer.from(obj.bytes, 'base64').toString() :
            obj.text;
    }
    function getNumLinesAndLastNewlineLength(text) {
        const re = /\n/g;
        let numLines = 0;
        let lastNewlineIdx = -1;
        let match;
        while (match = re.exec(text)) {
            numLines++;
            lastNewlineIdx = match.index;
        }
        const lastLineLength = lastNewlineIdx >= 0 ?
            text.length - lastNewlineIdx - 1 :
            text.length;
        return { numLines, lastLineLength };
    }
    // exported for testing
    function getRgArgs(query, options) {
        const args = ['--hidden', '--no-require-git'];
        args.push(query.isCaseSensitive ? '--case-sensitive' : '--ignore-case');
        const { doubleStarIncludes, otherIncludes } = (0, collections_1.groupBy)(options.includes, (include) => include.startsWith('**') ? 'doubleStarIncludes' : 'otherIncludes');
        if (otherIncludes && otherIncludes.length) {
            const uniqueOthers = new Set();
            otherIncludes.forEach(other => { uniqueOthers.add(other); });
            args.push('-g', '!*');
            uniqueOthers
                .forEach(otherIncude => {
                spreadGlobComponents(otherIncude)
                    .map(ripgrepSearchUtils_1.anchorGlob)
                    .forEach(globArg => {
                    args.push('-g', globArg);
                });
            });
        }
        if (doubleStarIncludes && doubleStarIncludes.length) {
            doubleStarIncludes.forEach(globArg => {
                args.push('-g', globArg);
            });
        }
        options.excludes
            .map(ripgrepSearchUtils_1.anchorGlob)
            .forEach(rgGlob => args.push('-g', `!${rgGlob}`));
        if (options.maxFileSize) {
            args.push('--max-filesize', options.maxFileSize + '');
        }
        if (options.useIgnoreFiles) {
            if (!options.useParentIgnoreFiles) {
                args.push('--no-ignore-parent');
            }
        }
        else {
            // Don't use .gitignore or .ignore
            args.push('--no-ignore');
        }
        if (options.followSymlinks) {
            args.push('--follow');
        }
        if (options.encoding && options.encoding !== 'utf8') {
            args.push('--encoding', options.encoding);
        }
        // Ripgrep handles -- as a -- arg separator. Only --.
        // - is ok, --- is ok, --some-flag is also ok. Need to special case.
        if (query.pattern === '--') {
            query.isRegExp = true;
            query.pattern = '\\-\\-';
        }
        if (query.isMultiline && !query.isRegExp) {
            query.pattern = (0, strings_1.escapeRegExpCharacters)(query.pattern);
            query.isRegExp = true;
        }
        if (options.usePCRE2) {
            args.push('--pcre2');
        }
        // Allow $ to match /r/n
        args.push('--crlf');
        if (query.isRegExp) {
            query.pattern = unicodeEscapesToPCRE2(query.pattern);
            args.push('--engine', 'auto');
        }
        let searchPatternAfterDoubleDashes;
        if (query.isWordMatch) {
            const regexp = (0, strings_1.createRegExp)(query.pattern, !!query.isRegExp, { wholeWord: query.isWordMatch });
            const regexpStr = regexp.source.replace(/\\\//g, '/'); // RegExp.source arbitrarily returns escaped slashes. Search and destroy.
            args.push('--regexp', regexpStr);
        }
        else if (query.isRegExp) {
            let fixedRegexpQuery = fixRegexNewline(query.pattern);
            fixedRegexpQuery = fixNewline(fixedRegexpQuery);
            args.push('--regexp', fixedRegexpQuery);
        }
        else {
            searchPatternAfterDoubleDashes = query.pattern;
            args.push('--fixed-strings');
        }
        args.push('--no-config');
        if (!options.useGlobalIgnoreFiles) {
            args.push('--no-ignore-global');
        }
        args.push('--json');
        if (query.isMultiline) {
            args.push('--multiline');
        }
        if (options.beforeContext) {
            args.push('--before-context', options.beforeContext + '');
        }
        if (options.afterContext) {
            args.push('--after-context', options.afterContext + '');
        }
        // Folder to search
        args.push('--');
        if (searchPatternAfterDoubleDashes) {
            // Put the query after --, in case the query starts with a dash
            args.push(searchPatternAfterDoubleDashes);
        }
        args.push('.');
        return args;
    }
    exports.getRgArgs = getRgArgs;
    /**
     * `"foo/*bar/something"` -> `["foo", "foo/*bar", "foo/*bar/something", "foo/*bar/something/**"]`
     */
    function spreadGlobComponents(globComponent) {
        const globComponentWithBraceExpansion = performBraceExpansionForRipgrep(globComponent);
        return globComponentWithBraceExpansion.flatMap((globArg) => {
            const components = (0, glob_1.splitGlobAware)(globArg, '/');
            return components.map((_, i) => components.slice(0, i + 1).join('/'));
        });
    }
    function unicodeEscapesToPCRE2(pattern) {
        // Match \u1234
        const unicodePattern = /((?:[^\\]|^)(?:\\\\)*)\\u([a-z0-9]{4})/gi;
        while (pattern.match(unicodePattern)) {
            pattern = pattern.replace(unicodePattern, `$1\\x{$2}`);
        }
        // Match \u{1234}
        // \u with 5-6 characters will be left alone because \x only takes 4 characters.
        const unicodePatternWithBraces = /((?:[^\\]|^)(?:\\\\)*)\\u\{([a-z0-9]{4})\}/gi;
        while (pattern.match(unicodePatternWithBraces)) {
            pattern = pattern.replace(unicodePatternWithBraces, `$1\\x{$2}`);
        }
        return pattern;
    }
    exports.unicodeEscapesToPCRE2 = unicodeEscapesToPCRE2;
    const isLookBehind = (node) => node.type === 'Assertion' && node.kind === 'lookbehind';
    function fixRegexNewline(pattern) {
        // we parse the pattern anew each tiem
        let re;
        try {
            re = new vscode_regexpp_1.RegExpParser().parsePattern(pattern);
        }
        catch {
            return pattern;
        }
        let output = '';
        let lastEmittedIndex = 0;
        const replace = (start, end, text) => {
            output += pattern.slice(lastEmittedIndex, start) + text;
            lastEmittedIndex = end;
        };
        const context = [];
        const visitor = new vscode_regexpp_1.RegExpVisitor({
            onCharacterEnter(char) {
                if (char.raw !== '\\n') {
                    return;
                }
                const parent = context[0];
                if (!parent) {
                    // simple char, \n -> \r?\n
                    replace(char.start, char.end, '\\r?\\n');
                }
                else if (context.some(isLookBehind)) {
                    // no-op in a lookbehind, see #100569
                }
                else if (parent.type === 'CharacterClass') {
                    if (parent.negate) {
                        // negative bracket expr, [^a-z\n] -> (?![a-z]|\r?\n)
                        const otherContent = pattern.slice(parent.start + 2, char.start) + pattern.slice(char.end, parent.end - 1);
                        if (parent.parent?.type === 'Quantifier') {
                            // If quantified, we can't use a negative lookahead in a quantifier.
                            // But `.` already doesn't match new lines, so we can just use that
                            // (with any other negations) instead.
                            replace(parent.start, parent.end, otherContent ? `[^${otherContent}]` : '.');
                        }
                        else {
                            replace(parent.start, parent.end, '(?!\\r?\\n' + (otherContent ? `|[${otherContent}]` : '') + ')');
                        }
                    }
                    else {
                        // positive bracket expr, [a-z\n] -> (?:[a-z]|\r?\n)
                        const otherContent = pattern.slice(parent.start + 1, char.start) + pattern.slice(char.end, parent.end - 1);
                        replace(parent.start, parent.end, otherContent === '' ? '\\r?\\n' : `(?:[${otherContent}]|\\r?\\n)`);
                    }
                }
                else if (parent.type === 'Quantifier') {
                    replace(char.start, char.end, '(?:\\r?\\n)');
                }
            },
            onQuantifierEnter(node) {
                context.unshift(node);
            },
            onQuantifierLeave() {
                context.shift();
            },
            onCharacterClassRangeEnter(node) {
                context.unshift(node);
            },
            onCharacterClassRangeLeave() {
                context.shift();
            },
            onCharacterClassEnter(node) {
                context.unshift(node);
            },
            onCharacterClassLeave() {
                context.shift();
            },
            onAssertionEnter(node) {
                if (isLookBehind(node)) {
                    context.push(node);
                }
            },
            onAssertionLeave(node) {
                if (context[0] === node) {
                    context.shift();
                }
            },
        });
        visitor.visit(re);
        output += pattern.slice(lastEmittedIndex);
        return output;
    }
    exports.fixRegexNewline = fixRegexNewline;
    function fixNewline(pattern) {
        return pattern.replace(/\n/g, '\\r?\\n');
    }
    exports.fixNewline = fixNewline;
    // brace expansion for ripgrep
    /**
     * Split string given first opportunity for brace expansion in the string.
     * - If the brace is prepended by a \ character, then it is escaped.
     * - Does not process escapes that are within the sub-glob.
     * - If two unescaped `{` occur before `}`, then ripgrep will return an error for brace nesting, so don't split on those.
     */
    function getEscapeAwareSplitStringForRipgrep(pattern) {
        let inBraces = false;
        let escaped = false;
        let fixedStart = '';
        let strInBraces = '';
        for (let i = 0; i < pattern.length; i++) {
            const char = pattern[i];
            switch (char) {
                case '\\':
                    if (escaped) {
                        // If we're already escaped, then just leave the escaped slash and the preceeding slash that escapes it.
                        // The two escaped slashes will result in a single slash and whatever processes the glob later will properly process the escape
                        if (inBraces) {
                            strInBraces += '\\' + char;
                        }
                        else {
                            fixedStart += '\\' + char;
                        }
                        escaped = false;
                    }
                    else {
                        escaped = true;
                    }
                    break;
                case '{':
                    if (escaped) {
                        // if we escaped this opening bracket, then it is to be taken literally. Remove the `\` because we've acknowleged it and add the `{` to the appropriate string
                        if (inBraces) {
                            strInBraces += char;
                        }
                        else {
                            fixedStart += char;
                        }
                        escaped = false;
                    }
                    else {
                        if (inBraces) {
                            // ripgrep treats this as attempting to do a nested alternate group, which is invalid. Return with pattern including changes from escaped braces.
                            return { strInBraces: fixedStart + '{' + strInBraces + '{' + pattern.substring(i + 1) };
                        }
                        else {
                            inBraces = true;
                        }
                    }
                    break;
                case '}':
                    if (escaped) {
                        // same as `}`, but for closing bracket
                        if (inBraces) {
                            strInBraces += char;
                        }
                        else {
                            fixedStart += char;
                        }
                        escaped = false;
                    }
                    else if (inBraces) {
                        // we found an end bracket to a valid opening bracket. Return the appropriate strings.
                        return { fixedStart, strInBraces, fixedEnd: pattern.substring(i + 1) };
                    }
                    else {
                        // if we're not in braces and not escaped, then this is a literal `}` character and we're still adding to fixedStart.
                        fixedStart += char;
                    }
                    break;
                default:
                    // similar to the `\\` case, we didn't do anything with the escape, so we should re-insert it into the appropriate string
                    // to be consumed later when individual parts of the glob are processed
                    if (inBraces) {
                        strInBraces += (escaped ? '\\' : '') + char;
                    }
                    else {
                        fixedStart += (escaped ? '\\' : '') + char;
                    }
                    escaped = false;
                    break;
            }
        }
        // we are haven't hit the last brace, so no splitting should occur. Return with pattern including changes from escaped braces.
        return { strInBraces: fixedStart + (inBraces ? ('{' + strInBraces) : '') };
    }
    /**
     * Parses out curly braces and returns equivalent globs. Only supports one level of nesting.
     * Exported for testing.
     */
    function performBraceExpansionForRipgrep(pattern) {
        const { fixedStart, strInBraces, fixedEnd } = getEscapeAwareSplitStringForRipgrep(pattern);
        if (fixedStart === undefined || fixedEnd === undefined) {
            return [strInBraces];
        }
        let arr = (0, glob_1.splitGlobAware)(strInBraces, ',');
        if (!arr.length) {
            // occurs if the braces are empty.
            arr = [''];
        }
        const ends = performBraceExpansionForRipgrep(fixedEnd);
        return arr.flatMap((elem) => {
            const start = fixedStart + elem;
            return ends.map((end) => {
                return start + end;
            });
        });
    }
    exports.performBraceExpansionForRipgrep = performBraceExpansionForRipgrep;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmlwZ3JlcFRleHRTZWFyY2hFbmdpbmUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvc2VhcmNoL25vZGUvcmlwZ3JlcFRleHRTZWFyY2hFbmdpbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBbUJoRyx1RUFBdUU7SUFDdkUsTUFBTSxVQUFVLEdBQUcsZ0JBQU0sQ0FBQyxPQUFPLENBQUMsd0JBQXdCLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztJQUUxRixNQUFhLHVCQUF1QjtRQUVuQyxZQUFvQixhQUE2QjtZQUE3QixrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7UUFBSSxDQUFDO1FBRXRELHdCQUF3QixDQUFDLEtBQXNCLEVBQUUsT0FBMEIsRUFBRSxRQUFvQyxFQUFFLEtBQXdCO1lBQzFJLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLDRCQUE0QixLQUFLLENBQUMsT0FBTyxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQzFGLEdBQUcsT0FBTztnQkFDVixHQUFHO29CQUNGLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtpQkFDakM7YUFDRCxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRU4sT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtnQkFDdEMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7Z0JBRTlDLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBRXpDLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO2dCQUVsQyxNQUFNLFdBQVcsR0FBRyxNQUFNO3FCQUN4QixHQUFHLENBQUMsR0FBRyxDQUFDLEVB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