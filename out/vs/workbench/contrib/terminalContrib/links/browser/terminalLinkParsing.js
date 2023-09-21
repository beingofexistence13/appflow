/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lazy"], function (require, exports, lazy_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.winDrivePrefix = exports.detectLinks = exports.toLinkSuffix = exports.getLinkSuffix = exports.detectLinkSuffixes = exports.removeLinkQueryString = exports.removeLinkSuffix = void 0;
    /**
     * A regex that extracts the link suffix which contains line and column information. The link suffix
     * must terminate at the end of line.
     */
    const linkSuffixRegexEol = new lazy_1.Lazy(() => generateLinkSuffixRegex(true));
    /**
     * A regex that extracts the link suffix which contains line and column information.
     */
    const linkSuffixRegex = new lazy_1.Lazy(() => generateLinkSuffixRegex(false));
    function generateLinkSuffixRegex(eolOnly) {
        let ri = 0;
        let ci = 0;
        let rei = 0;
        let cei = 0;
        function r() {
            return `(?<row${ri++}>\\d+)`;
        }
        function c() {
            return `(?<col${ci++}>\\d+)`;
        }
        function re() {
            return `(?<rowEnd${rei++}>\\d+)`;
        }
        function ce() {
            return `(?<colEnd${cei++}>\\d+)`;
        }
        const eolSuffix = eolOnly ? '$' : '';
        // The comments in the regex below use real strings/numbers for better readability, here's
        // the legend:
        // - Path    = foo
        // - Row     = 339
        // - Col     = 12
        // - RowEnd  = 341
        // - ColEnd  = 14
        //
        // These all support single quote ' in the place of " and [] in the place of ()
        const lineAndColumnRegexClauses = [
            // foo:339
            // foo:339:12
            // foo:339.12
            // foo 339
            // foo 339:12                             [#140780]
            // foo 339.12
            // "foo",339
            // "foo",339:12
            // "foo",339.12
            // "foo",339.12-14
            // "foo",339.12-341.14
            `(?::| |['"],)${r()}([:.]${c()}(?:-(?:${re()}\.)?${ce()})?)?` + eolSuffix,
            // The quotes below are optional          [#171652]
            // "foo", line 339                        [#40468]
            // "foo", line 339, col 12
            // "foo", line 339, column 12
            // "foo":line 339
            // "foo":line 339, col 12
            // "foo":line 339, column 12
            // "foo": line 339
            // "foo": line 339, col 12
            // "foo": line 339, column 12
            // "foo" on line 339
            // "foo" on line 339, col 12
            // "foo" on line 339, column 12
            // "foo" line 339 column 12
            // "foo", line 339, character 12          [#171880]
            // "foo", line 339, characters 12-14      [#171880]
            // "foo", lines 339-341                   [#171880]
            // "foo", lines 339-341, characters 12-14 [#178287]
            `['"]?(?:,? |: ?| on )lines? ${r()}(?:-${re()})?(?:,? (?:col(?:umn)?|characters?) ${c()}(?:-${ce()})?)?` + eolSuffix,
            // foo(339)
            // foo(339,12)
            // foo(339, 12)
            // foo (339)
            //   ...
            // foo: (339)
            //   ...
            `:? ?[\\[\\(]${r()}(?:, ?${c()})?[\\]\\)]` + eolSuffix,
        ];
        const suffixClause = lineAndColumnRegexClauses
            // Join all clauses together
            .join('|')
            // Convert spaces to allow the non-breaking space char (ascii 160)
            .replace(/ /g, `[${'\u00A0'} ]`);
        return new RegExp(`(${suffixClause})`, eolOnly ? undefined : 'g');
    }
    /**
     * Removes the optional link suffix which contains line and column information.
     * @param link The link to use.
     */
    function removeLinkSuffix(link) {
        const suffix = getLinkSuffix(link)?.suffix;
        if (!suffix) {
            return link;
        }
        return link.substring(0, suffix.index);
    }
    exports.removeLinkSuffix = removeLinkSuffix;
    /**
     * Removes any query string from the link.
     * @param link The link to use.
     */
    function removeLinkQueryString(link) {
        // Skip ? in UNC paths
        const start = link.startsWith('\\\\?\\') ? 4 : 0;
        const index = link.indexOf('?', start);
        if (index === -1) {
            return link;
        }
        return link.substring(0, index);
    }
    exports.removeLinkQueryString = removeLinkQueryString;
    function detectLinkSuffixes(line) {
        // Find all suffixes on the line. Since the regex global flag is used, lastIndex will be updated
        // in place such that there are no overlapping matches.
        let match;
        const results = [];
        linkSuffixRegex.value.lastIndex = 0;
        while ((match = linkSuffixRegex.value.exec(line)) !== null) {
            const suffix = toLinkSuffix(match);
            if (suffix === null) {
                break;
            }
            results.push(suffix);
        }
        return results;
    }
    exports.detectLinkSuffixes = detectLinkSuffixes;
    /**
     * Returns the optional link suffix which contains line and column information.
     * @param link The link to parse.
     */
    function getLinkSuffix(link) {
        return toLinkSuffix(linkSuffixRegexEol.value.exec(link));
    }
    exports.getLinkSuffix = getLinkSuffix;
    function toLinkSuffix(match) {
        const groups = match?.groups;
        if (!groups || match.length < 1) {
            return null;
        }
        return {
            row: parseIntOptional(groups.row0 || groups.row1 || groups.row2),
            col: parseIntOptional(groups.col0 || groups.col1 || groups.col2),
            rowEnd: parseIntOptional(groups.rowEnd0 || groups.rowEnd1 || groups.rowEnd2),
            colEnd: parseIntOptional(groups.colEnd0 || groups.colEnd1 || groups.colEnd2),
            suffix: { index: match.index, text: match[0] }
        };
    }
    exports.toLinkSuffix = toLinkSuffix;
    function parseIntOptional(value) {
        if (value === undefined) {
            return value;
        }
        return parseInt(value);
    }
    // This defines valid path characters for a link with a suffix, the first `[]` of the regex includes
    // characters the path is not allowed to _start_ with, the second `[]` includes characters not
    // allowed at all in the path. If the characters show up in both regexes the link will stop at that
    // character, otherwise it will stop at a space character.
    const linkWithSuffixPathCharacters = /(?<path>[^\s\|<>\[\({][^\s\|<>]*)$/;
    function detectLinks(line, os) {
        // 1: Detect all links on line via suffixes first
        const results = detectLinksViaSuffix(line);
        // 2: Detect all links without suffixes and merge non-conflicting ranges into the results
        const noSuffixPaths = detectPathsNoSuffix(line, os);
        binaryInsertList(results, noSuffixPaths);
        return results;
    }
    exports.detectLinks = detectLinks;
    function binaryInsertList(list, newItems) {
        if (list.length === 0) {
            list.push(...newItems);
        }
        for (const item of newItems) {
            binaryInsert(list, item, 0, list.length);
        }
    }
    function binaryInsert(list, newItem, low, high) {
        if (list.length === 0) {
            list.push(newItem);
            return;
        }
        if (low > high) {
            return;
        }
        // Find the index where the newItem would be inserted
        const mid = Math.floor((low + high) / 2);
        if (mid >= list.length ||
            (newItem.path.index < list[mid].path.index && (mid === 0 || newItem.path.index > list[mid - 1].path.index))) {
            // Check if it conflicts with an existing link before adding
            if (mid >= list.length ||
                (newItem.path.index + newItem.path.text.length < list[mid].path.index && (mid === 0 || newItem.path.index > list[mid - 1].path.index + list[mid - 1].path.text.length))) {
                list.splice(mid, 0, newItem);
            }
            return;
        }
        if (newItem.path.index > list[mid].path.index) {
            binaryInsert(list, newItem, mid + 1, high);
        }
        else {
            binaryInsert(list, newItem, low, mid - 1);
        }
    }
    function detectLinksViaSuffix(line) {
        const results = [];
        // 1: Detect link suffixes on the line
        const suffixes = detectLinkSuffixes(line);
        for (const suffix of suffixes) {
            const beforeSuffix = line.substring(0, suffix.suffix.index);
            const possiblePathMatch = beforeSuffix.match(linkWithSuffixPathCharacters);
            if (possiblePathMatch && possiblePathMatch.index !== undefined && possiblePathMatch.groups?.path) {
                let linkStartIndex = possiblePathMatch.index;
                let path = possiblePathMatch.groups.path;
                // Extract a path prefix if it exists (not part of the path, but part of the underlined
                // section)
                let prefix = undefined;
                const prefixMatch = path.match(/^(?<prefix>['"]+)/);
                if (prefixMatch?.groups?.prefix) {
                    prefix = {
                        index: linkStartIndex,
                        text: prefixMatch.groups.prefix
                    };
                    path = path.substring(prefix.text.length);
                    // If there are multiple characters in the prefix, trim the prefix if the _first_
                    // suffix character is the same as the last prefix character. For example, for the
                    // text `echo "'foo' on line 1"`:
                    //
                    // - Prefix='
                    // - Path=foo
                    // - Suffix=' on line 1
                    //
                    // If this fails on a multi-character prefix, just keep the original.
                    if (prefixMatch.groups.prefix.length > 1) {
                        if (suffix.suffix.text[0].match(/['"]/) && prefixMatch.groups.prefix[prefixMatch.groups.prefix.length - 1] === suffix.suffix.text[0]) {
                            const trimPrefixAmount = prefixMatch.groups.prefix.length - 1;
                            prefix.index += trimPrefixAmount;
                            prefix.text = prefixMatch.groups.prefix[prefixMatch.groups.prefix.length - 1];
                            linkStartIndex += trimPrefixAmount;
                        }
                    }
                }
                results.push({
                    path: {
                        index: linkStartIndex + (prefix?.text.length || 0),
                        text: path
                    },
                    prefix,
                    suffix
                });
            }
        }
        return results;
    }
    var RegexPathConstants;
    (function (RegexPathConstants) {
        RegexPathConstants["PathPrefix"] = "(?:\\.\\.?|\\~)";
        RegexPathConstants["PathSeparatorClause"] = "\\/";
        // '":; are allowed in paths but they are often separators so ignore them
        // Also disallow \\ to prevent a catastropic backtracking case #24795
        RegexPathConstants["ExcludedPathCharactersClause"] = "[^\\0<>\\?\\s!`&*()'\":;\\\\]";
        RegexPathConstants["ExcludedStartPathCharactersClause"] = "[^\\0<>\\s!`&*()\\[\\]'\":;\\\\]";
        RegexPathConstants["WinOtherPathPrefix"] = "\\.\\.?|\\~";
        RegexPathConstants["WinPathSeparatorClause"] = "(?:\\\\|\\/)";
        RegexPathConstants["WinExcludedPathCharactersClause"] = "[^\\0<>\\?\\|\\/\\s!`&*()'\":;]";
        RegexPathConstants["WinExcludedStartPathCharactersClause"] = "[^\\0<>\\?\\|\\/\\s!`&*()\\[\\]'\":;]";
    })(RegexPathConstants || (RegexPathConstants = {}));
    /**
     * A regex that matches non-Windows paths, such as `/foo`, `~/foo`, `./foo`, `../foo` and
     * `foo/bar`.
     */
    const unixLocalLinkClause = '(?:(?:' + RegexPathConstants.PathPrefix + '|(?:' + RegexPathConstants.ExcludedStartPathCharactersClause + RegexPathConstants.ExcludedPathCharactersClause + '*))?(?:' + RegexPathConstants.PathSeparatorClause + '(?:' + RegexPathConstants.ExcludedPathCharactersClause + ')+)+)';
    /**
     * A regex clause that matches the start of an absolute path on Windows, such as: `C:`, `c:` and
     * `\\?\C` (UNC path).
     */
    exports.winDrivePrefix = '(?:\\\\\\\\\\?\\\\)?[a-zA-Z]:';
    /**
     * A regex that matches Windows paths, such as `\\?\c:\foo`, `c:\foo`, `~\foo`, `.\foo`, `..\foo`
     * and `foo\bar`.
     */
    const winLocalLinkClause = '(?:(?:' + `(?:${exports.winDrivePrefix}|${RegexPathConstants.WinOtherPathPrefix})` + '|(?:' + RegexPathConstants.WinExcludedStartPathCharactersClause + RegexPathConstants.WinExcludedPathCharactersClause + '*))?(?:' + RegexPathConstants.WinPathSeparatorClause + '(?:' + RegexPathConstants.WinExcludedPathCharactersClause + ')+)+)';
    function detectPathsNoSuffix(line, os) {
        const results = [];
        const regex = new RegExp(os === 1 /* OperatingSystem.Windows */ ? winLocalLinkClause : unixLocalLinkClause, 'g');
        let match;
        while ((match = regex.exec(line)) !== null) {
            let text = match[0];
            let index = match.index;
            if (!text) {
                // Something matched but does not comply with the given match index, since this would
                // most likely a bug the regex itself we simply do nothing here
                break;
            }
            // Adjust the link range to exclude a/ and b/ if it looks like a git diff
            if (
            // --- a/foo/bar
            // +++ b/foo/bar
            ((line.startsWith('--- a/') || line.startsWith('+++ b/')) && index === 4) ||
                // diff --git a/foo/bar b/foo/bar
                (line.startsWith('diff --git') && (text.startsWith('a/') || text.startsWith('b/')))) {
                text = text.substring(2);
                index += 2;
            }
            results.push({
                path: {
                    index,
                    text
                },
                prefix: undefined,
                suffix: undefined
            });
        }
        return results;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxMaW5rUGFyc2luZy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsQ29udHJpYi9saW5rcy9icm93c2VyL3Rlcm1pbmFsTGlua1BhcnNpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBOEJoRzs7O09BR0c7SUFDSCxNQUFNLGtCQUFrQixHQUFHLElBQUksV0FBSSxDQUFTLEdBQUcsRUFBRSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDakY7O09BRUc7SUFDSCxNQUFNLGVBQWUsR0FBRyxJQUFJLFdBQUksQ0FBUyxHQUFHLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBRS9FLFNBQVMsdUJBQXVCLENBQUMsT0FBZ0I7UUFDaEQsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQ1osSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQ1osU0FBUyxDQUFDO1lBQ1QsT0FBTyxTQUFTLEVBQUUsRUFBRSxRQUFRLENBQUM7UUFDOUIsQ0FBQztRQUNELFNBQVMsQ0FBQztZQUNULE9BQU8sU0FBUyxFQUFFLEVBQUUsUUFBUSxDQUFDO1FBQzlCLENBQUM7UUFDRCxTQUFTLEVBQUU7WUFDVixPQUFPLFlBQVksR0FBRyxFQUFFLFFBQVEsQ0FBQztRQUNsQyxDQUFDO1FBQ0QsU0FBUyxFQUFFO1lBQ1YsT0FBTyxZQUFZLEdBQUcsRUFBRSxRQUFRLENBQUM7UUFDbEMsQ0FBQztRQUVELE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFFckMsMEZBQTBGO1FBQzFGLGNBQWM7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