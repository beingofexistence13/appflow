/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lazy", "vs/base/common/path"], function (require, exports, lazy_1, path_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.compareByPrefix = exports.compareAnything = exports.comparePaths = exports.compareFileExtensionsUnicode = exports.compareFileExtensionsLower = exports.compareFileExtensionsUpper = exports.compareFileExtensionsDefault = exports.compareFileExtensions = exports.compareFileNamesUnicode = exports.compareFileNamesLower = exports.compareFileNamesUpper = exports.compareFileNamesDefault = exports.compareFileNames = void 0;
    // When comparing large numbers of strings it's better for performance to create an
    // Intl.Collator object and use the function provided by its compare property
    // than it is to use String.prototype.localeCompare()
    // A collator with numeric sorting enabled, and no sensitivity to case, accents or diacritics.
    const intlFileNameCollatorBaseNumeric = new lazy_1.Lazy(() => {
        const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        return {
            collator,
            collatorIsNumeric: collator.resolvedOptions().numeric
        };
    });
    // A collator with numeric sorting enabled.
    const intlFileNameCollatorNumeric = new lazy_1.Lazy(() => {
        const collator = new Intl.Collator(undefined, { numeric: true });
        return {
            collator
        };
    });
    // A collator with numeric sorting enabled, and sensitivity to accents and diacritics but not case.
    const intlFileNameCollatorNumericCaseInsensitive = new lazy_1.Lazy(() => {
        const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'accent' });
        return {
            collator
        };
    });
    /** Compares filenames without distinguishing the name from the extension. Disambiguates by unicode comparison. */
    function compareFileNames(one, other, caseSensitive = false) {
        const a = one || '';
        const b = other || '';
        const result = intlFileNameCollatorBaseNumeric.value.collator.compare(a, b);
        // Using the numeric option will make compare(`foo1`, `foo01`) === 0. Disambiguate.
        if (intlFileNameCollatorBaseNumeric.value.collatorIsNumeric && result === 0 && a !== b) {
            return a < b ? -1 : 1;
        }
        return result;
    }
    exports.compareFileNames = compareFileNames;
    /** Compares full filenames without grouping by case. */
    function compareFileNamesDefault(one, other) {
        const collatorNumeric = intlFileNameCollatorNumeric.value.collator;
        one = one || '';
        other = other || '';
        return compareAndDisambiguateByLength(collatorNumeric, one, other);
    }
    exports.compareFileNamesDefault = compareFileNamesDefault;
    /** Compares full filenames grouping uppercase names before lowercase. */
    function compareFileNamesUpper(one, other) {
        const collatorNumeric = intlFileNameCollatorNumeric.value.collator;
        one = one || '';
        other = other || '';
        return compareCaseUpperFirst(one, other) || compareAndDisambiguateByLength(collatorNumeric, one, other);
    }
    exports.compareFileNamesUpper = compareFileNamesUpper;
    /** Compares full filenames grouping lowercase names before uppercase. */
    function compareFileNamesLower(one, other) {
        const collatorNumeric = intlFileNameCollatorNumeric.value.collator;
        one = one || '';
        other = other || '';
        return compareCaseLowerFirst(one, other) || compareAndDisambiguateByLength(collatorNumeric, one, other);
    }
    exports.compareFileNamesLower = compareFileNamesLower;
    /** Compares full filenames by unicode value. */
    function compareFileNamesUnicode(one, other) {
        one = one || '';
        other = other || '';
        if (one === other) {
            return 0;
        }
        return one < other ? -1 : 1;
    }
    exports.compareFileNamesUnicode = compareFileNamesUnicode;
    /** Compares filenames by extension, then by name. Disambiguates by unicode comparison. */
    function compareFileExtensions(one, other) {
        const [oneName, oneExtension] = extractNameAndExtension(one);
        const [otherName, otherExtension] = extractNameAndExtension(other);
        let result = intlFileNameCollatorBaseNumeric.value.collator.compare(oneExtension, otherExtension);
        if (result === 0) {
            // Using the numeric option will  make compare(`foo1`, `foo01`) === 0. Disambiguate.
            if (intlFileNameCollatorBaseNumeric.value.collatorIsNumeric && oneExtension !== otherExtension) {
                return oneExtension < otherExtension ? -1 : 1;
            }
            // Extensions are equal, compare filenames
            result = intlFileNameCollatorBaseNumeric.value.collator.compare(oneName, otherName);
            if (intlFileNameCollatorBaseNumeric.value.collatorIsNumeric && result === 0 && oneName !== otherName) {
                return oneName < otherName ? -1 : 1;
            }
        }
        return result;
    }
    exports.compareFileExtensions = compareFileExtensions;
    /** Compares filenames by extension, then by full filename. Mixes uppercase and lowercase names together. */
    function compareFileExtensionsDefault(one, other) {
        one = one || '';
        other = other || '';
        const oneExtension = extractExtension(one);
        const otherExtension = extractExtension(other);
        const collatorNumeric = intlFileNameCollatorNumeric.value.collator;
        const collatorNumericCaseInsensitive = intlFileNameCollatorNumericCaseInsensitive.value.collator;
        return compareAndDisambiguateByLength(collatorNumericCaseInsensitive, oneExtension, otherExtension) ||
            compareAndDisambiguateByLength(collatorNumeric, one, other);
    }
    exports.compareFileExtensionsDefault = compareFileExtensionsDefault;
    /** Compares filenames by extension, then case, then full filename. Groups uppercase names before lowercase. */
    function compareFileExtensionsUpper(one, other) {
        one = one || '';
        other = other || '';
        const oneExtension = extractExtension(one);
        const otherExtension = extractExtension(other);
        const collatorNumeric = intlFileNameCollatorNumeric.value.collator;
        const collatorNumericCaseInsensitive = intlFileNameCollatorNumericCaseInsensitive.value.collator;
        return compareAndDisambiguateByLength(collatorNumericCaseInsensitive, oneExtension, otherExtension) ||
            compareCaseUpperFirst(one, other) ||
            compareAndDisambiguateByLength(collatorNumeric, one, other);
    }
    exports.compareFileExtensionsUpper = compareFileExtensionsUpper;
    /** Compares filenames by extension, then case, then full filename. Groups lowercase names before uppercase. */
    function compareFileExtensionsLower(one, other) {
        one = one || '';
        other = other || '';
        const oneExtension = extractExtension(one);
        const otherExtension = extractExtension(other);
        const collatorNumeric = intlFileNameCollatorNumeric.value.collator;
        const collatorNumericCaseInsensitive = intlFileNameCollatorNumericCaseInsensitive.value.collator;
        return compareAndDisambiguateByLength(collatorNumericCaseInsensitive, oneExtension, otherExtension) ||
            compareCaseLowerFirst(one, other) ||
            compareAndDisambiguateByLength(collatorNumeric, one, other);
    }
    exports.compareFileExtensionsLower = compareFileExtensionsLower;
    /** Compares filenames by case-insensitive extension unicode value, then by full filename unicode value. */
    function compareFileExtensionsUnicode(one, other) {
        one = one || '';
        other = other || '';
        const oneExtension = extractExtension(one).toLowerCase();
        const otherExtension = extractExtension(other).toLowerCase();
        // Check for extension differences
        if (oneExtension !== otherExtension) {
            return oneExtension < otherExtension ? -1 : 1;
        }
        // Check for full filename differences.
        if (one !== other) {
            return one < other ? -1 : 1;
        }
        return 0;
    }
    exports.compareFileExtensionsUnicode = compareFileExtensionsUnicode;
    const FileNameMatch = /^(.*?)(\.([^.]*))?$/;
    /** Extracts the name and extension from a full filename, with optional special handling for dotfiles */
    function extractNameAndExtension(str, dotfilesAsNames = false) {
        const match = str ? FileNameMatch.exec(str) : [];
        let result = [(match && match[1]) || '', (match && match[3]) || ''];
        // if the dotfilesAsNames option is selected, treat an empty filename with an extension
        // or a filename that starts with a dot, as a dotfile name
        if (dotfilesAsNames && (!result[0] && result[1] || result[0] && result[0].charAt(0) === '.')) {
            result = [result[0] + '.' + result[1], ''];
        }
        return result;
    }
    /** Extracts the extension from a full filename. Treats dotfiles as names, not extensions. */
    function extractExtension(str) {
        const match = str ? FileNameMatch.exec(str) : [];
        return (match && match[1] && match[1].charAt(0) !== '.' && match[3]) || '';
    }
    function compareAndDisambiguateByLength(collator, one, other) {
        // Check for differences
        const result = collator.compare(one, other);
        if (result !== 0) {
            return result;
        }
        // In a numeric comparison, `foo1` and `foo01` will compare as equivalent.
        // Disambiguate by sorting the shorter string first.
        if (one.length !== other.length) {
            return one.length < other.length ? -1 : 1;
        }
        return 0;
    }
    /** @returns `true` if the string is starts with a lowercase letter. Otherwise, `false`. */
    function startsWithLower(string) {
        const character = string.charAt(0);
        return (character.toLocaleUpperCase() !== character) ? true : false;
    }
    /** @returns `true` if the string starts with an uppercase letter. Otherwise, `false`. */
    function startsWithUpper(string) {
        const character = string.charAt(0);
        return (character.toLocaleLowerCase() !== character) ? true : false;
    }
    /**
     * Compares the case of the provided strings - lowercase before uppercase
     *
     * @returns
     * ```text
     *   -1 if one is lowercase and other is uppercase
     *    1 if one is uppercase and other is lowercase
     *    0 otherwise
     * ```
     */
    function compareCaseLowerFirst(one, other) {
        if (startsWithLower(one) && startsWithUpper(other)) {
            return -1;
        }
        return (startsWithUpper(one) && startsWithLower(other)) ? 1 : 0;
    }
    /**
     * Compares the case of the provided strings - uppercase before lowercase
     *
     * @returns
     * ```text
     *   -1 if one is uppercase and other is lowercase
     *    1 if one is lowercase and other is uppercase
     *    0 otherwise
     * ```
     */
    function compareCaseUpperFirst(one, other) {
        if (startsWithUpper(one) && startsWithLower(other)) {
            return -1;
        }
        return (startsWithLower(one) && startsWithUpper(other)) ? 1 : 0;
    }
    function comparePathComponents(one, other, caseSensitive = false) {
        if (!caseSensitive) {
            one = one && one.toLowerCase();
            other = other && other.toLowerCase();
        }
        if (one === other) {
            return 0;
        }
        return one < other ? -1 : 1;
    }
    function comparePaths(one, other, caseSensitive = false) {
        const oneParts = one.split(path_1.sep);
        const otherParts = other.split(path_1.sep);
        const lastOne = oneParts.length - 1;
        const lastOther = otherParts.length - 1;
        let endOne, endOther;
        for (let i = 0;; i++) {
            endOne = lastOne === i;
            endOther = lastOther === i;
            if (endOne && endOther) {
                return compareFileNames(oneParts[i], otherParts[i], caseSensitive);
            }
            else if (endOne) {
                return -1;
            }
            else if (endOther) {
                return 1;
            }
            const result = comparePathComponents(oneParts[i], otherParts[i], caseSensitive);
            if (result !== 0) {
                return result;
            }
        }
    }
    exports.comparePaths = comparePaths;
    function compareAnything(one, other, lookFor) {
        const elementAName = one.toLowerCase();
        const elementBName = other.toLowerCase();
        // Sort prefix matches over non prefix matches
        const prefixCompare = compareByPrefix(one, other, lookFor);
        if (prefixCompare) {
            return prefixCompare;
        }
        // Sort suffix matches over non suffix matches
        const elementASuffixMatch = elementAName.endsWith(lookFor);
        const elementBSuffixMatch = elementBName.endsWith(lookFor);
        if (elementASuffixMatch !== elementBSuffixMatch) {
            return elementASuffixMatch ? -1 : 1;
        }
        // Understand file names
        const r = compareFileNames(elementAName, elementBName);
        if (r !== 0) {
            return r;
        }
        // Compare by name
        return elementAName.localeCompare(elementBName);
    }
    exports.compareAnything = compareAnything;
    function compareByPrefix(one, other, lookFor) {
        const elementAName = one.toLowerCase();
        const elementBName = other.toLowerCase();
        // Sort prefix matches over non prefix matches
        const elementAPrefixMatch = elementAName.startsWith(lookFor);
        const elementBPrefixMatch = elementBName.startsWith(lookFor);
        if (elementAPrefixMatch !== elementBPrefixMatch) {
            return elementAPrefixMatch ? -1 : 1;
        }
        // Same prefix: Sort shorter matches to the top to have those on top that match more precisely
        else if (elementAPrefixMatch && elementBPrefixMatch) {
            if (elementAName.length < elementBName.length) {
                return -1;
            }
            if (elementAName.length > elementBName.length) {
                return 1;
            }
        }
        return 0;
    }
    exports.compareByPrefix = compareByPrefix;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGFyZXJzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9jb21tb24vY29tcGFyZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUtoRyxtRkFBbUY7SUFDbkYsNkVBQTZFO0lBQzdFLHFEQUFxRDtJQUVyRCw4RkFBOEY7SUFDOUYsTUFBTSwrQkFBK0IsR0FBa0UsSUFBSSxXQUFJLENBQUMsR0FBRyxFQUFFO1FBQ3BILE1BQU0sUUFBUSxHQUFHLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ3RGLE9BQU87WUFDTixRQUFRO1lBQ1IsaUJBQWlCLEVBQUUsUUFBUSxDQUFDLGVBQWUsRUFBRSxDQUFDLE9BQU87U0FDckQsQ0FBQztJQUNILENBQUMsQ0FBQyxDQUFDO0lBRUgsMkNBQTJDO0lBQzNDLE1BQU0sMkJBQTJCLEdBQXNDLElBQUksV0FBSSxDQUFDLEdBQUcsRUFBRTtRQUNwRixNQUFNLFFBQVEsR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDakUsT0FBTztZQUNOLFFBQVE7U0FDUixDQUFDO0lBQ0gsQ0FBQyxDQUFDLENBQUM7SUFFSCxtR0FBbUc7SUFDbkcsTUFBTSwwQ0FBMEMsR0FBc0MsSUFBSSxXQUFJLENBQUMsR0FBRyxFQUFFO1FBQ25HLE1BQU0sUUFBUSxHQUFHLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ3hGLE9BQU87WUFDTixRQUFRO1NBQ1IsQ0FBQztJQUNILENBQUMsQ0FBQyxDQUFD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