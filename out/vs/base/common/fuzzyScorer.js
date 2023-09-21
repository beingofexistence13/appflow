/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/comparers", "vs/base/common/filters", "vs/base/common/hash", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/strings"], function (require, exports, comparers_1, filters_1, hash_1, path_1, platform_1, strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.pieceToQuery = exports.prepareQuery = exports.compareItemsByFuzzyScore = exports.scoreItemFuzzy = exports.scoreFuzzy2 = exports.scoreFuzzy = void 0;
    const NO_MATCH = 0;
    const NO_SCORE = [NO_MATCH, []];
    // const DEBUG = true;
    // const DEBUG_MATRIX = false;
    function scoreFuzzy(target, query, queryLower, allowNonContiguousMatches) {
        if (!target || !query) {
            return NO_SCORE; // return early if target or query are undefined
        }
        const targetLength = target.length;
        const queryLength = query.length;
        if (targetLength < queryLength) {
            return NO_SCORE; // impossible for query to be contained in target
        }
        // if (DEBUG) {
        // 	console.group(`Target: ${target}, Query: ${query}`);
        // }
        const targetLower = target.toLowerCase();
        const res = doScoreFuzzy(query, queryLower, queryLength, target, targetLower, targetLength, allowNonContiguousMatches);
        // if (DEBUG) {
        // 	console.log(`%cFinal Score: ${res[0]}`, 'font-weight: bold');
        // 	console.groupEnd();
        // }
        return res;
    }
    exports.scoreFuzzy = scoreFuzzy;
    function doScoreFuzzy(query, queryLower, queryLength, target, targetLower, targetLength, allowNonContiguousMatches) {
        const scores = [];
        const matches = [];
        //
        // Build Scorer Matrix:
        //
        // The matrix is composed of query q and target t. For each index we score
        // q[i] with t[i] and compare that with the previous score. If the score is
        // equal or larger, we keep the match. In addition to the score, we also keep
        // the length of the consecutive matches to use as boost for the score.
        //
        //      t   a   r   g   e   t
        //  q
        //  u
        //  e
        //  r
        //  y
        //
        for (let queryIndex = 0; queryIndex < queryLength; queryIndex++) {
            const queryIndexOffset = queryIndex * targetLength;
            const queryIndexPreviousOffset = queryIndexOffset - targetLength;
            const queryIndexGtNull = queryIndex > 0;
            const queryCharAtIndex = query[queryIndex];
            const queryLowerCharAtIndex = queryLower[queryIndex];
            for (let targetIndex = 0; targetIndex < targetLength; targetIndex++) {
                const targetIndexGtNull = targetIndex > 0;
                const currentIndex = queryIndexOffset + targetIndex;
                const leftIndex = currentIndex - 1;
                const diagIndex = queryIndexPreviousOffset + targetIndex - 1;
                const leftScore = targetIndexGtNull ? scores[leftIndex] : 0;
                const diagScore = queryIndexGtNull && targetIndexGtNull ? scores[diagIndex] : 0;
                const matchesSequenceLength = queryIndexGtNull && targetIndexGtNull ? matches[diagIndex] : 0;
                // If we are not matching on the first query character any more, we only produce a
                // score if we had a score previously for the last query index (by looking at the diagScore).
                // This makes sure that the query always matches in sequence on the target. For example
                // given a target of "ede" and a query of "de", we would otherwise produce a wrong high score
                // for query[1] ("e") matching on target[0] ("e") because of the "beginning of word" boost.
                let score;
                if (!diagScore && queryIndexGtNull) {
                    score = 0;
                }
                else {
                    score = computeCharScore(queryCharAtIndex, queryLowerCharAtIndex, target, targetLower, targetIndex, matchesSequenceLength);
                }
                // We have a score and its equal or larger than the left score
                // Match: sequence continues growing from previous diag value
                // Score: increases by diag score value
                const isValidScore = score && diagScore + score >= leftScore;
                if (isValidScore && (
                // We don't need to check if it's contiguous if we allow non-contiguous matches
                allowNonContiguousMatches ||
                    // We must be looking for a contiguous match.
                    // Looking at an index higher than 0 in the query means we must have already
                    // found out this is contiguous otherwise there wouldn't have been a score
                    queryIndexGtNull ||
                    // lastly check if the query is completely contiguous at this index in the target
                    targetLower.startsWith(queryLower, targetIndex))) {
                    matches[currentIndex] = matchesSequenceLength + 1;
                    scores[currentIndex] = diagScore + score;
                }
                // We either have no score or the score is lower than the left score
                // Match: reset to 0
                // Score: pick up from left hand side
                else {
                    matches[currentIndex] = NO_MATCH;
                    scores[currentIndex] = leftScore;
                }
            }
        }
        // Restore Positions (starting from bottom right of matrix)
        const positions = [];
        let queryIndex = queryLength - 1;
        let targetIndex = targetLength - 1;
        while (queryIndex >= 0 && targetIndex >= 0) {
            const currentIndex = queryIndex * targetLength + targetIndex;
            const match = matches[currentIndex];
            if (match === NO_MATCH) {
                targetIndex--; // go left
            }
            else {
                positions.push(targetIndex);
                // go up and left
                queryIndex--;
                targetIndex--;
            }
        }
        // Print matrix
        // if (DEBUG_MATRIX) {
        // 	printMatrix(query, target, matches, scores);
        // }
        return [scores[queryLength * targetLength - 1], positions.reverse()];
    }
    function computeCharScore(queryCharAtIndex, queryLowerCharAtIndex, target, targetLower, targetIndex, matchesSequenceLength) {
        let score = 0;
        if (!considerAsEqual(queryLowerCharAtIndex, targetLower[targetIndex])) {
            return score; // no match of characters
        }
        // if (DEBUG) {
        // 	console.groupCollapsed(`%cFound a match of char: ${queryLowerCharAtIndex} at index ${targetIndex}`, 'font-weight: normal');
        // }
        // Character match bonus
        score += 1;
        // if (DEBUG) {
        // 	console.log(`%cCharacter match bonus: +1`, 'font-weight: normal');
        // }
        // Consecutive match bonus
        if (matchesSequenceLength > 0) {
            score += (matchesSequenceLength * 5);
            // if (DEBUG) {
            // 	console.log(`Consecutive match bonus: +${matchesSequenceLength * 5}`);
            // }
        }
        // Same case bonus
        if (queryCharAtIndex === target[targetIndex]) {
            score += 1;
            // if (DEBUG) {
            // 	console.log('Same case bonus: +1');
            // }
        }
        // Start of word bonus
        if (targetIndex === 0) {
            score += 8;
            // if (DEBUG) {
            // 	console.log('Start of word bonus: +8');
            // }
        }
        else {
            // After separator bonus
            const separatorBonus = scoreSeparatorAtPos(target.charCodeAt(targetIndex - 1));
            if (separatorBonus) {
                score += separatorBonus;
                // if (DEBUG) {
                // 	console.log(`After separator bonus: +${separatorBonus}`);
                // }
            }
            // Inside word upper case bonus (camel case). We only give this bonus if we're not in a contiguous sequence.
            // For example:
            // NPE => NullPointerException = boost
            // HTTP => HTTP = not boost
            else if ((0, filters_1.isUpper)(target.charCodeAt(targetIndex)) && matchesSequenceLength === 0) {
                score += 2;
                // if (DEBUG) {
                // 	console.log('Inside word upper case bonus: +2');
                // }
            }
        }
        // if (DEBUG) {
        // 	console.log(`Total score: ${score}`);
        // 	console.groupEnd();
        // }
        return score;
    }
    function considerAsEqual(a, b) {
        if (a === b) {
            return true;
        }
        // Special case path separators: ignore platform differences
        if (a === '/' || a === '\\') {
            return b === '/' || b === '\\';
        }
        return false;
    }
    function scoreSeparatorAtPos(charCode) {
        switch (charCode) {
            case 47 /* CharCode.Slash */:
            case 92 /* CharCode.Backslash */:
                return 5; // prefer path separators...
            case 95 /* CharCode.Underline */:
            case 45 /* CharCode.Dash */:
            case 46 /* CharCode.Period */:
            case 32 /* CharCode.Space */:
            case 39 /* CharCode.SingleQuote */:
            case 34 /* CharCode.DoubleQuote */:
            case 58 /* CharCode.Colon */:
                return 4; // ...over other separators
            default:
                return 0;
        }
    }
    const NO_SCORE2 = [undefined, []];
    function scoreFuzzy2(target, query, patternStart = 0, wordStart = 0) {
        // Score: multiple inputs
        const preparedQuery = query;
        if (preparedQuery.values && preparedQuery.values.length > 1) {
            return doScoreFuzzy2Multiple(target, preparedQuery.values, patternStart, wordStart);
        }
        // Score: single input
        return doScoreFuzzy2Single(target, query, patternStart, wordStart);
    }
    exports.scoreFuzzy2 = scoreFuzzy2;
    function doScoreFuzzy2Multiple(target, query, patternStart, wordStart) {
        let totalScore = 0;
        const totalMatches = [];
        for (const queryPiece of query) {
            const [score, matches] = doScoreFuzzy2Single(target, queryPiece, patternStart, wordStart);
            if (typeof score !== 'number') {
                // if a single query value does not match, return with
                // no score entirely, we require all queries to match
                return NO_SCORE2;
            }
            totalScore += score;
            totalMatches.push(...matches);
        }
        // if we have a score, ensure that the positions are
        // sorted in ascending order and distinct
        return [totalScore, normalizeMatches(totalMatches)];
    }
    function doScoreFuzzy2Single(target, query, patternStart, wordStart) {
        const score = (0, filters_1.fuzzyScore)(query.original, query.originalLowercase, patternStart, target, target.toLowerCase(), wordStart, { firstMatchCanBeWeak: true, boostFullMatch: true });
        if (!score) {
            return NO_SCORE2;
        }
        return [score[0], (0, filters_1.createMatches)(score)];
    }
    const NO_ITEM_SCORE = Object.freeze({ score: 0 });
    const PATH_IDENTITY_SCORE = 1 << 18;
    const LABEL_PREFIX_SCORE_THRESHOLD = 1 << 17;
    const LABEL_SCORE_THRESHOLD = 1 << 16;
    function getCacheHash(label, description, allowNonContiguousMatches, query) {
        const values = query.values ? query.values : [query];
        const cacheHash = (0, hash_1.hash)({
            [query.normalized]: {
                values: values.map(v => ({ value: v.normalized, expectContiguousMatch: v.expectContiguousMatch })),
                label,
                description,
                allowNonContiguousMatches
            }
        });
        return cacheHash;
    }
    function scoreItemFuzzy(item, query, allowNonContiguousMatches, accessor, cache) {
        if (!item || !query.normalized) {
            return NO_ITEM_SCORE; // we need an item and query to score on at least
        }
        const label = accessor.getItemLabel(item);
        if (!label) {
            return NO_ITEM_SCORE; // we need a label at least
        }
        const description = accessor.getItemDescription(item);
        // in order to speed up scoring, we cache the score with a unique hash based on:
        // - label
        // - description (if provided)
        // - whether non-contiguous matching is enabled or not
        // - hash of the query (normalized) values
        const cacheHash = getCacheHash(label, description, allowNonContiguousMatches, query);
        const cached = cache[cacheHash];
        if (cached) {
            return cached;
        }
        const itemScore = doScoreItemFuzzy(label, description, accessor.getItemPath(item), query, allowNonContiguousMatches);
        cache[cacheHash] = itemScore;
        return itemScore;
    }
    exports.scoreItemFuzzy = scoreItemFuzzy;
    function doScoreItemFuzzy(label, description, path, query, allowNonContiguousMatches) {
        const preferLabelMatches = !path || !query.containsPathSeparator;
        // Treat identity matches on full path highest
        if (path && (platform_1.isLinux ? query.pathNormalized === path : (0, strings_1.equalsIgnoreCase)(query.pathNormalized, path))) {
            return { score: PATH_IDENTITY_SCORE, labelMatch: [{ start: 0, end: label.length }], descriptionMatch: description ? [{ start: 0, end: description.length }] : undefined };
        }
        // Score: multiple inputs
        if (query.values && query.values.length > 1) {
            return doScoreItemFuzzyMultiple(label, description, path, query.values, preferLabelMatches, allowNonContiguousMatches);
        }
        // Score: single input
        return doScoreItemFuzzySingle(label, description, path, query, preferLabelMatches, allowNonContiguousMatches);
    }
    function doScoreItemFuzzyMultiple(label, description, path, query, preferLabelMatches, allowNonContiguousMatches) {
        let totalScore = 0;
        const totalLabelMatches = [];
        const totalDescriptionMatches = [];
        for (const queryPiece of query) {
            const { score, labelMatch, descriptionMatch } = doScoreItemFuzzySingle(label, description, path, queryPiece, preferLabelMatches, allowNonContiguousMatches);
            if (score === NO_MATCH) {
                // if a single query value does not match, return with
                // no score entirely, we require all queries to match
                return NO_ITEM_SCORE;
            }
            totalScore += score;
            if (labelMatch) {
                totalLabelMatches.push(...labelMatch);
            }
            if (descriptionMatch) {
                totalDescriptionMatches.push(...descriptionMatch);
            }
        }
        // if we have a score, ensure that the positions are
        // sorted in ascending order and distinct
        return {
            score: totalScore,
            labelMatch: normalizeMatches(totalLabelMatches),
            descriptionMatch: normalizeMatches(totalDescriptionMatches)
        };
    }
    function doScoreItemFuzzySingle(label, description, path, query, preferLabelMatches, allowNonContiguousMatches) {
        // Prefer label matches if told so or we have no description
        if (preferLabelMatches || !description) {
            const [labelScore, labelPositions] = scoreFuzzy(label, query.normalized, query.normalizedLowercase, allowNonContiguousMatches && !query.expectContiguousMatch);
            if (labelScore) {
                // If we have a prefix match on the label, we give a much
                // higher baseScore to elevate these matches over others
                // This ensures that typing a file name wins over results
                // that are present somewhere in the label, but not the
                // beginning.
                const labelPrefixMatch = (0, filters_1.matchesPrefix)(query.normalized, label);
                let baseScore;
                if (labelPrefixMatch) {
                    baseScore = LABEL_PREFIX_SCORE_THRESHOLD;
                    // We give another boost to labels that are short, e.g. given
                    // files "window.ts" and "windowActions.ts" and a query of
                    // "window", we want "window.ts" to receive a higher score.
                    // As such we compute the percentage the query has within the
                    // label and add that to the baseScore.
                    const prefixLengthBoost = Math.round((query.normalized.length / label.length) * 100);
                    baseScore += prefixLengthBoost;
                }
                else {
                    baseScore = LABEL_SCORE_THRESHOLD;
                }
                return { score: baseScore + labelScore, labelMatch: labelPrefixMatch || createMatches(labelPositions) };
            }
        }
        // Finally compute description + label scores if we have a description
        if (description) {
            let descriptionPrefix = description;
            if (!!path) {
                descriptionPrefix = `${description}${path_1.sep}`; // assume this is a file path
            }
            const descriptionPrefixLength = descriptionPrefix.length;
            const descriptionAndLabel = `${descriptionPrefix}${label}`;
            const [labelDescriptionScore, labelDescriptionPositions] = scoreFuzzy(descriptionAndLabel, query.normalized, query.normalizedLowercase, allowNonContiguousMatches && !query.expectContiguousMatch);
            if (labelDescriptionScore) {
                const labelDescriptionMatches = createMatches(labelDescriptionPositions);
                const labelMatch = [];
                const descriptionMatch = [];
                // We have to split the matches back onto the label and description portions
                labelDescriptionMatches.forEach(h => {
                    // Match overlaps label and description part, we need to split it up
                    if (h.start < descriptionPrefixLength && h.end > descriptionPrefixLength) {
                        labelMatch.push({ start: 0, end: h.end - descriptionPrefixLength });
                        descriptionMatch.push({ start: h.start, end: descriptionPrefixLength });
                    }
                    // Match on label part
                    else if (h.start >= descriptionPrefixLength) {
                        labelMatch.push({ start: h.start - descriptionPrefixLength, end: h.end - descriptionPrefixLength });
                    }
                    // Match on description part
                    else {
                        descriptionMatch.push(h);
                    }
                });
                return { score: labelDescriptionScore, labelMatch, descriptionMatch };
            }
        }
        return NO_ITEM_SCORE;
    }
    function createMatches(offsets) {
        const ret = [];
        if (!offsets) {
            return ret;
        }
        let last;
        for (const pos of offsets) {
            if (last && last.end === pos) {
                last.end += 1;
            }
            else {
                last = { start: pos, end: pos + 1 };
                ret.push(last);
            }
        }
        return ret;
    }
    function normalizeMatches(matches) {
        // sort matches by start to be able to normalize
        const sortedMatches = matches.sort((matchA, matchB) => {
            return matchA.start - matchB.start;
        });
        // merge matches that overlap
        const normalizedMatches = [];
        let currentMatch = undefined;
        for (const match of sortedMatches) {
            // if we have no current match or the matches
            // do not overlap, we take it as is and remember
            // it for future merging
            if (!currentMatch || !matchOverlaps(currentMatch, match)) {
                currentMatch = match;
                normalizedMatches.push(match);
            }
            // otherwise we merge the matches
            else {
                currentMatch.start = Math.min(currentMatch.start, match.start);
                currentMatch.end = Math.max(currentMatch.end, match.end);
            }
        }
        return normalizedMatches;
    }
    function matchOverlaps(matchA, matchB) {
        if (matchA.end < matchB.start) {
            return false; // A ends before B starts
        }
        if (matchB.end < matchA.start) {
            return false; // B ends before A starts
        }
        return true;
    }
    //#endregion
    //#region Comparers
    function compareItemsByFuzzyScore(itemA, itemB, query, allowNonContiguousMatches, accessor, cache) {
        const itemScoreA = scoreItemFuzzy(itemA, query, allowNonContiguousMatches, accessor, cache);
        const itemScoreB = scoreItemFuzzy(itemB, query, allowNonContiguousMatches, accessor, cache);
        const scoreA = itemScoreA.score;
        const scoreB = itemScoreB.score;
        // 1.) identity matches have highest score
        if (scoreA === PATH_IDENTITY_SCORE || scoreB === PATH_IDENTITY_SCORE) {
            if (scoreA !== scoreB) {
                return scoreA === PATH_IDENTITY_SCORE ? -1 : 1;
            }
        }
        // 2.) matches on label are considered higher compared to label+description matches
        if (scoreA > LABEL_SCORE_THRESHOLD || scoreB > LABEL_SCORE_THRESHOLD) {
            if (scoreA !== scoreB) {
                return scoreA > scoreB ? -1 : 1;
            }
            // prefer more compact matches over longer in label (unless this is a prefix match where
            // longer prefix matches are actually preferred)
            if (scoreA < LABEL_PREFIX_SCORE_THRESHOLD && scoreB < LABEL_PREFIX_SCORE_THRESHOLD) {
                const comparedByMatchLength = compareByMatchLength(itemScoreA.labelMatch, itemScoreB.labelMatch);
                if (comparedByMatchLength !== 0) {
                    return comparedByMatchLength;
                }
            }
            // prefer shorter labels over longer labels
            const labelA = accessor.getItemLabel(itemA) || '';
            const labelB = accessor.getItemLabel(itemB) || '';
            if (labelA.length !== labelB.length) {
                return labelA.length - labelB.length;
            }
        }
        // 3.) compare by score in label+description
        if (scoreA !== scoreB) {
            return scoreA > scoreB ? -1 : 1;
        }
        // 4.) scores are identical: prefer matches in label over non-label matches
        const itemAHasLabelMatches = Array.isArray(itemScoreA.labelMatch) && itemScoreA.labelMatch.length > 0;
        const itemBHasLabelMatches = Array.isArray(itemScoreB.labelMatch) && itemScoreB.labelMatch.length > 0;
        if (itemAHasLabelMatches && !itemBHasLabelMatches) {
            return -1;
        }
        else if (itemBHasLabelMatches && !itemAHasLabelMatches) {
            return 1;
        }
        // 5.) scores are identical: prefer more compact matches (label and description)
        const itemAMatchDistance = computeLabelAndDescriptionMatchDistance(itemA, itemScoreA, accessor);
        const itemBMatchDistance = computeLabelAndDescriptionMatchDistance(itemB, itemScoreB, accessor);
        if (itemAMatchDistance && itemBMatchDistance && itemAMatchDistance !== itemBMatchDistance) {
            return itemBMatchDistance > itemAMatchDistance ? -1 : 1;
        }
        // 6.) scores are identical: start to use the fallback compare
        return fallbackCompare(itemA, itemB, query, accessor);
    }
    exports.compareItemsByFuzzyScore = compareItemsByFuzzyScore;
    function computeLabelAndDescriptionMatchDistance(item, score, accessor) {
        let matchStart = -1;
        let matchEnd = -1;
        // If we have description matches, the start is first of description match
        if (score.descriptionMatch && score.descriptionMatch.length) {
            matchStart = score.descriptionMatch[0].start;
        }
        // Otherwise, the start is the first label match
        else if (score.labelMatch && score.labelMatch.length) {
            matchStart = score.labelMatch[0].start;
        }
        // If we have label match, the end is the last label match
        // If we had a description match, we add the length of the description
        // as offset to the end to indicate this.
        if (score.labelMatch && score.labelMatch.length) {
            matchEnd = score.labelMatch[score.labelMatch.length - 1].end;
            if (score.descriptionMatch && score.descriptionMatch.length) {
                const itemDescription = accessor.getItemDescription(item);
                if (itemDescription) {
                    matchEnd += itemDescription.length;
                }
            }
        }
        // If we have just a description match, the end is the last description match
        else if (score.descriptionMatch && score.descriptionMatch.length) {
            matchEnd = score.descriptionMatch[score.descriptionMatch.length - 1].end;
        }
        return matchEnd - matchStart;
    }
    function compareByMatchLength(matchesA, matchesB) {
        if ((!matchesA && !matchesB) || ((!matchesA || !matchesA.length) && (!matchesB || !matchesB.length))) {
            return 0; // make sure to not cause bad comparing when matches are not provided
        }
        if (!matchesB || !matchesB.length) {
            return -1;
        }
        if (!matchesA || !matchesA.length) {
            return 1;
        }
        // Compute match length of A (first to last match)
        const matchStartA = matchesA[0].start;
        const matchEndA = matchesA[matchesA.length - 1].end;
        const matchLengthA = matchEndA - matchStartA;
        // Compute match length of B (first to last match)
        const matchStartB = matchesB[0].start;
        const matchEndB = matchesB[matchesB.length - 1].end;
        const matchLengthB = matchEndB - matchStartB;
        // Prefer shorter match length
        return matchLengthA === matchLengthB ? 0 : matchLengthB < matchLengthA ? 1 : -1;
    }
    function fallbackCompare(itemA, itemB, query, accessor) {
        // check for label + description length and prefer shorter
        const labelA = accessor.getItemLabel(itemA) || '';
        const labelB = accessor.getItemLabel(itemB) || '';
        const descriptionA = accessor.getItemDescription(itemA);
        const descriptionB = accessor.getItemDescription(itemB);
        const labelDescriptionALength = labelA.length + (descriptionA ? descriptionA.length : 0);
        const labelDescriptionBLength = labelB.length + (descriptionB ? descriptionB.length : 0);
        if (labelDescriptionALength !== labelDescriptionBLength) {
            return labelDescriptionALength - labelDescriptionBLength;
        }
        // check for path length and prefer shorter
        const pathA = accessor.getItemPath(itemA);
        const pathB = accessor.getItemPath(itemB);
        if (pathA && pathB && pathA.length !== pathB.length) {
            return pathA.length - pathB.length;
        }
        // 7.) finally we have equal scores and equal length, we fallback to comparer
        // compare by label
        if (labelA !== labelB) {
            return (0, comparers_1.compareAnything)(labelA, labelB, query.normalized);
        }
        // compare by description
        if (descriptionA && descriptionB && descriptionA !== descriptionB) {
            return (0, comparers_1.compareAnything)(descriptionA, descriptionB, query.normalized);
        }
        // compare by path
        if (pathA && pathB && pathA !== pathB) {
            return (0, comparers_1.compareAnything)(pathA, pathB, query.normalized);
        }
        // equal
        return 0;
    }
    /*
     * If a query is wrapped in quotes, the user does not want to
     * use fuzzy search for this query.
     */
    function queryExpectsExactMatch(query) {
        return query.startsWith('"') && query.endsWith('"');
    }
    /**
     * Helper function to prepare a search value for scoring by removing unwanted characters
     * and allowing to score on multiple pieces separated by whitespace character.
     */
    const MULTIPLE_QUERY_VALUES_SEPARATOR = ' ';
    function prepareQuery(original) {
        if (typeof original !== 'string') {
            original = '';
        }
        const originalLowercase = original.toLowerCase();
        const { pathNormalized, normalized, normalizedLowercase } = normalizeQuery(original);
        const containsPathSeparator = pathNormalized.indexOf(path_1.sep) >= 0;
        const expectExactMatch = queryExpectsExactMatch(original);
        let values = undefined;
        const originalSplit = original.split(MULTIPLE_QUERY_VALUES_SEPARATOR);
        if (originalSplit.length > 1) {
            for (const originalPiece of originalSplit) {
                const expectExactMatchPiece = queryExpectsExactMatch(originalPiece);
                const { pathNormalized: pathNormalizedPiece, normalized: normalizedPiece, normalizedLowercase: normalizedLowercasePiece } = normalizeQuery(originalPiece);
                if (normalizedPiece) {
                    if (!values) {
                        values = [];
                    }
                    values.push({
                        original: originalPiece,
                        originalLowercase: originalPiece.toLowerCase(),
                        pathNormalized: pathNormalizedPiece,
                        normalized: normalizedPiece,
                        normalizedLowercase: normalizedLowercasePiece,
                        expectContiguousMatch: expectExactMatchPiece
                    });
                }
            }
        }
        return { original, originalLowercase, pathNormalized, normalized, normalizedLowercase, values, containsPathSeparator, expectContiguousMatch: expectExactMatch };
    }
    exports.prepareQuery = prepareQuery;
    function normalizeQuery(original) {
        let pathNormalized;
        if (platform_1.isWindows) {
            pathNormalized = original.replace(/\//g, path_1.sep); // Help Windows users to search for paths when using slash
        }
        else {
            pathNormalized = original.replace(/\\/g, path_1.sep); // Help macOS/Linux users to search for paths when using backslash
        }
        // we remove quotes here because quotes are used for exact match search
        const normalized = (0, strings_1.stripWildcards)(pathNormalized).replace(/\s|"/g, '');
        return {
            pathNormalized,
            normalized,
            normalizedLowercase: normalized.toLowerCase()
        };
    }
    function pieceToQuery(arg1) {
        if (Array.isArray(arg1)) {
            return prepareQuery(arg1.map(piece => piece.original).join(MULTIPLE_QUERY_VALUES_SEPARATOR));
        }
        return prepareQuery(arg1.original);
    }
    exports.pieceToQuery = pieceToQuery;
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnV6enlTY29yZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2NvbW1vbi9mdXp6eVNjb3Jlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFlaEcsTUFBTSxRQUFRLEdBQUcsQ0FBQyxDQUFDO0lBQ25CLE1BQU0sUUFBUSxHQUFlLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRTVDLHNCQUFzQjtJQUN0Qiw4QkFBOEI7SUFFOUIsU0FBZ0IsVUFBVSxDQUFDLE1BQWMsRUFBRSxLQUFhLEVBQUUsVUFBa0IsRUFBRSx5QkFBa0M7UUFDL0csSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLEtBQUssRUFBRTtZQUN0QixPQUFPLFFBQVEsQ0FBQyxDQUFDLGdEQUFnRDtTQUNqRTtRQUVELE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDbkMsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUVqQyxJQUFJLFlBQVksR0FBRyxXQUFXLEVBQUU7WUFDL0IsT0FBTyxRQUFRLENBQUMsQ0FBQyxpREFBaUQ7U0FDbEU7UUFFRCxlQUFlO1FBQ2Ysd0RBQXdEO1FBQ3hELElBQUk7UUFFSixNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDekMsTUFBTSxHQUFHLEdBQUcsWUFBWSxDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLHlCQUF5QixDQUFDLENBQUM7UUFFdkgsZUFBZTtRQUNmLGlFQUFpRTtRQUNqRSx1QkFBdUI7UUFDdkIsSUFBSTtRQUVKLE9BQU8sR0FBRyxDQUFDO0lBQ1osQ0FBQztJQXpCRCxnQ0F5QkM7SUFFRCxTQUFTLFlBQVksQ0FBQyxLQUFhLEVBQUUsVUFBa0IsRUFBRSxXQUFtQixFQUFFLE1BQWMs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