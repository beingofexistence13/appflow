/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/range", "vs/editor/common/model/textModelSearch", "vs/base/common/strings", "vs/base/common/assert", "vs/editor/common/core/wordHelper"], function (require, exports, range_1, textModelSearch_1, strings, assert_1, wordHelper_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UnicodeHighlighterReasonKind = exports.UnicodeTextModelHighlighter = void 0;
    class UnicodeTextModelHighlighter {
        static computeUnicodeHighlights(model, options, range) {
            const startLine = range ? range.startLineNumber : 1;
            const endLine = range ? range.endLineNumber : model.getLineCount();
            const codePointHighlighter = new CodePointHighlighter(options);
            const candidates = codePointHighlighter.getCandidateCodePoints();
            let regex;
            if (candidates === 'allNonBasicAscii') {
                regex = new RegExp('[^\\t\\n\\r\\x20-\\x7E]', 'g');
            }
            else {
                regex = new RegExp(`${buildRegExpCharClassExpr(Array.from(candidates))}`, 'g');
            }
            const searcher = new textModelSearch_1.Searcher(null, regex);
            const ranges = [];
            let hasMore = false;
            let m;
            let ambiguousCharacterCount = 0;
            let invisibleCharacterCount = 0;
            let nonBasicAsciiCharacterCount = 0;
            forLoop: for (let lineNumber = startLine, lineCount = endLine; lineNumber <= lineCount; lineNumber++) {
                const lineContent = model.getLineContent(lineNumber);
                const lineLength = lineContent.length;
                // Reset regex to search from the beginning
                searcher.reset(0);
                do {
                    m = searcher.next(lineContent);
                    if (m) {
                        let startIndex = m.index;
                        let endIndex = m.index + m[0].length;
                        // Extend range to entire code point
                        if (startIndex > 0) {
                            const charCodeBefore = lineContent.charCodeAt(startIndex - 1);
                            if (strings.isHighSurrogate(charCodeBefore)) {
                                startIndex--;
                            }
                        }
                        if (endIndex + 1 < lineLength) {
                            const charCodeBefore = lineContent.charCodeAt(endIndex - 1);
                            if (strings.isHighSurrogate(charCodeBefore)) {
                                endIndex++;
                            }
                        }
                        const str = lineContent.substring(startIndex, endIndex);
                        let word = (0, wordHelper_1.getWordAtText)(startIndex + 1, wordHelper_1.DEFAULT_WORD_REGEXP, lineContent, 0);
                        if (word && word.endColumn <= startIndex + 1) {
                            // The word does not include the problematic character, ignore the word
                            word = null;
                        }
                        const highlightReason = codePointHighlighter.shouldHighlightNonBasicASCII(str, word ? word.word : null);
                        if (highlightReason !== 0 /* SimpleHighlightReason.None */) {
                            if (highlightReason === 3 /* SimpleHighlightReason.Ambiguous */) {
                                ambiguousCharacterCount++;
                            }
                            else if (highlightReason === 2 /* SimpleHighlightReason.Invisible */) {
                                invisibleCharacterCount++;
                            }
                            else if (highlightReason === 1 /* SimpleHighlightReason.NonBasicASCII */) {
                                nonBasicAsciiCharacterCount++;
                            }
                            else {
                                (0, assert_1.assertNever)(highlightReason);
                            }
                            const MAX_RESULT_LENGTH = 1000;
                            if (ranges.length >= MAX_RESULT_LENGTH) {
                                hasMore = true;
                                break forLoop;
                            }
                            ranges.push(new range_1.Range(lineNumber, startIndex + 1, lineNumber, endIndex + 1));
                        }
                    }
                } while (m);
            }
            return {
                ranges,
                hasMore,
                ambiguousCharacterCount,
                invisibleCharacterCount,
                nonBasicAsciiCharacterCount
            };
        }
        static computeUnicodeHighlightReason(char, options) {
            const codePointHighlighter = new CodePointHighlighter(options);
            const reason = codePointHighlighter.shouldHighlightNonBasicASCII(char, null);
            switch (reason) {
                case 0 /* SimpleHighlightReason.None */:
                    return null;
                case 2 /* SimpleHighlightReason.Invisible */:
                    return { kind: 1 /* UnicodeHighlighterReasonKind.Invisible */ };
                case 3 /* SimpleHighlightReason.Ambiguous */: {
                    const codePoint = char.codePointAt(0);
                    const primaryConfusable = codePointHighlighter.ambiguousCharacters.getPrimaryConfusable(codePoint);
                    const notAmbiguousInLocales = strings.AmbiguousCharacters.getLocales().filter((l) => !strings.AmbiguousCharacters.getInstance(new Set([...options.allowedLocales, l])).isAmbiguous(codePoint));
                    return { kind: 0 /* UnicodeHighlighterReasonKind.Ambiguous */, confusableWith: String.fromCodePoint(primaryConfusable), notAmbiguousInLocales };
                }
                case 1 /* SimpleHighlightReason.NonBasicASCII */:
                    return { kind: 2 /* UnicodeHighlighterReasonKind.NonBasicAscii */ };
            }
        }
    }
    exports.UnicodeTextModelHighlighter = UnicodeTextModelHighlighter;
    function buildRegExpCharClassExpr(codePoints, flags) {
        const src = `[${strings.escapeRegExpCharacters(codePoints.map((i) => String.fromCodePoint(i)).join(''))}]`;
        return src;
    }
    var UnicodeHighlighterReasonKind;
    (function (UnicodeHighlighterReasonKind) {
        UnicodeHighlighterReasonKind[UnicodeHighlighterReasonKind["Ambiguous"] = 0] = "Ambiguous";
        UnicodeHighlighterReasonKind[UnicodeHighlighterReasonKind["Invisible"] = 1] = "Invisible";
        UnicodeHighlighterReasonKind[UnicodeHighlighterReasonKind["NonBasicAscii"] = 2] = "NonBasicAscii";
    })(UnicodeHighlighterReasonKind || (exports.UnicodeHighlighterReasonKind = UnicodeHighlighterReasonKind = {}));
    class CodePointHighlighter {
        constructor(options) {
            this.options = options;
            this.allowedCodePoints = new Set(options.allowedCodePoints);
            this.ambiguousCharacters = strings.AmbiguousCharacters.getInstance(new Set(options.allowedLocales));
        }
        getCandidateCodePoints() {
            if (this.options.nonBasicASCII) {
                return 'allNonBasicAscii';
            }
            const set = new Set();
            if (this.options.invisibleCharacters) {
                for (const cp of strings.InvisibleCharacters.codePoints) {
                    if (!isAllowedInvisibleCharacter(String.fromCodePoint(cp))) {
                        set.add(cp);
                    }
                }
            }
            if (this.options.ambiguousCharacters) {
                for (const cp of this.ambiguousCharacters.getConfusableCodePoints()) {
                    set.add(cp);
                }
            }
            for (const cp of this.allowedCodePoints) {
                set.delete(cp);
            }
            return set;
        }
        shouldHighlightNonBasicASCII(character, wordContext) {
            const codePoint = character.codePointAt(0);
            if (this.allowedCodePoints.has(codePoint)) {
                return 0 /* SimpleHighlightReason.None */;
            }
            if (this.options.nonBasicASCII) {
                return 1 /* SimpleHighlightReason.NonBasicASCII */;
            }
            let hasBasicASCIICharacters = false;
            let hasNonConfusableNonBasicAsciiCharacter = false;
            if (wordContext) {
                for (const char of wordContext) {
                    const codePoint = char.codePointAt(0);
                    const isBasicASCII = strings.isBasicASCII(char);
                    hasBasicASCIICharacters = hasBasicASCIICharacters || isBasicASCII;
                    if (!isBasicASCII &&
                        !this.ambiguousCharacters.isAmbiguous(codePoint) &&
                        !strings.InvisibleCharacters.isInvisibleCharacter(codePoint)) {
                        hasNonConfusableNonBasicAsciiCharacter = true;
                    }
                }
            }
            if (
            /* Don't allow mixing weird looking characters with ASCII */ !hasBasicASCIICharacters &&
                /* Is there an obviously weird looking character? */ hasNonConfusableNonBasicAsciiCharacter) {
                return 0 /* SimpleHighlightReason.None */;
            }
            if (this.options.invisibleCharacters) {
                // TODO check for emojis
                if (!isAllowedInvisibleCharacter(character) && strings.InvisibleCharacters.isInvisibleCharacter(codePoint)) {
                    return 2 /* SimpleHighlightReason.Invisible */;
                }
            }
            if (this.options.ambiguousCharacters) {
                if (this.ambiguousCharacters.isAmbiguous(codePoint)) {
                    return 3 /* SimpleHighlightReason.Ambiguous */;
                }
            }
            return 0 /* SimpleHighlightReason.None */;
        }
    }
    function isAllowedInvisibleCharacter(character) {
        return character === ' ' || character === '\n' || character === '\t';
    }
    var SimpleHighlightReason;
    (function (SimpleHighlightReason) {
        SimpleHighlightReason[SimpleHighlightReason["None"] = 0] = "None";
        SimpleHighlightReason[SimpleHighlightReason["NonBasicASCII"] = 1] = "NonBasicASCII";
        SimpleHighlightReason[SimpleHighlightReason["Invisible"] = 2] = "Invisible";
        SimpleHighlightReason[SimpleHighlightReason["Ambiguous"] = 3] = "Ambiguous";
    })(SimpleHighlightReason || (SimpleHighlightReason = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5pY29kZVRleHRNb2RlbEhpZ2hsaWdodGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9zZXJ2aWNlcy91bmljb2RlVGV4dE1vZGVsSGlnaGxpZ2h0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU2hHLE1BQWEsMkJBQTJCO1FBQ2hDLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxLQUFzQyxFQUFFLE9BQWtDLEVBQUUsS0FBYztZQUNoSSxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwRCxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUVuRSxNQUFNLG9CQUFvQixHQUFHLElBQUksb0JBQW9CLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFL0QsTUFBTSxVQUFVLEdBQUcsb0JBQW9CLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztZQUNqRSxJQUFJLEtBQWEsQ0FBQztZQUNsQixJQUFJLFVBQVUsS0FBSyxrQkFBa0IsRUFBRTtnQkFDdEMsS0FBSyxHQUFHLElBQUksTUFBTSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQ25EO2lCQUFNO2dCQUNOLEtBQUssR0FBRyxJQUFJLE1BQU0sQ0FBQyxHQUFHLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQy9FO1lBRUQsTUFBTSxRQUFRLEdBQUcsSUFBSSwwQkFBUSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztZQUMzQyxNQUFNLE1BQU0sR0FBWSxFQUFFLENBQUM7WUFD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