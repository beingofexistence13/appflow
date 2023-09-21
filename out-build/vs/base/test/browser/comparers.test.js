/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/comparers"], function (require, exports, assert, comparers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const compareLocale = (a, b) => a.localeCompare(b);
    const compareLocaleNumeric = (a, b) => a.localeCompare(b, undefined, { numeric: true });
    suite('Comparers', () => {
        test('compareFileNames', () => {
            //
            // Comparisons with the same results as compareFileNamesDefault
            //
            // name-only comparisons
            assert((0, comparers_1.$0p)(null, null) === 0, 'null should be equal');
            assert((0, comparers_1.$0p)(null, 'abc') < 0, 'null should be come before real values');
            assert((0, comparers_1.$0p)('', '') === 0, 'empty should be equal');
            assert((0, comparers_1.$0p)('abc', 'abc') === 0, 'equal names should be equal');
            assert((0, comparers_1.$0p)('z', 'A') > 0, 'z comes after A');
            assert((0, comparers_1.$0p)('Z', 'a') > 0, 'Z comes after a');
            // name plus extension comparisons
            assert((0, comparers_1.$0p)('bbb.aaa', 'aaa.bbb') > 0, 'compares the whole name all at once by locale');
            assert((0, comparers_1.$0p)('aggregate.go', 'aggregate_repo.go') > 0, 'compares the whole name all at once by locale');
            // dotfile comparisons
            assert((0, comparers_1.$0p)('.abc', '.abc') === 0, 'equal dotfile names should be equal');
            assert((0, comparers_1.$0p)('.env.', '.gitattributes') < 0, 'filenames starting with dots and with extensions should still sort properly');
            assert((0, comparers_1.$0p)('.env', '.aaa.env') > 0, 'dotfiles sort alphabetically when they contain multiple dots');
            assert((0, comparers_1.$0p)('.env', '.env.aaa') < 0, 'dotfiles with the same root sort shortest first');
            assert((0, comparers_1.$0p)('.aaa_env', '.aaa.env') < 0, 'an underscore in a dotfile name will sort before a dot');
            // dotfile vs non-dotfile comparisons
            assert((0, comparers_1.$0p)(null, '.abc') < 0, 'null should come before dotfiles');
            assert((0, comparers_1.$0p)('.env', 'aaa') < 0, 'dotfiles come before filenames without extensions');
            assert((0, comparers_1.$0p)('.env', 'aaa.env') < 0, 'dotfiles come before filenames with extensions');
            assert((0, comparers_1.$0p)('.md', 'A.MD') < 0, 'dotfiles sort before uppercase files');
            assert((0, comparers_1.$0p)('.MD', 'a.md') < 0, 'dotfiles sort before lowercase files');
            // numeric comparisons
            assert((0, comparers_1.$0p)('1', '1') === 0, 'numerically equal full names should be equal');
            assert((0, comparers_1.$0p)('abc1.txt', 'abc1.txt') === 0, 'equal filenames with numbers should be equal');
            assert((0, comparers_1.$0p)('abc1.txt', 'abc2.txt') < 0, 'filenames with numbers should be in numerical order, not alphabetical order');
            assert((0, comparers_1.$0p)('abc2.txt', 'abc10.txt') < 0, 'filenames with numbers should be in numerical order even when they are multiple digits long');
            assert((0, comparers_1.$0p)('abc02.txt', 'abc010.txt') < 0, 'filenames with numbers that have leading zeros sort numerically');
            assert((0, comparers_1.$0p)('abc1.10.txt', 'abc1.2.txt') > 0, 'numbers with dots between them are treated as two separate numbers, not one decimal number');
            assert((0, comparers_1.$0p)('a.ext1', 'b.Ext1') < 0, 'if names are different and extensions with numbers are equal except for case, filenames are sorted in name order');
            assert.deepStrictEqual(['a10.txt', 'A2.txt', 'A100.txt', 'a20.txt'].sort(comparers_1.$0p), ['A2.txt', 'a10.txt', 'a20.txt', 'A100.txt'], 'filenames with number and case differences compare numerically');
            //
            // Comparisons with different results than compareFileNamesDefault
            //
            // name-only comparisons
            assert((0, comparers_1.$0p)('a', 'A') !== compareLocale('a', 'A'), 'the same letter sorts in unicode order, not by locale');
            assert((0, comparers_1.$0p)('â', 'Â') !== compareLocale('â', 'Â'), 'the same accented letter sorts in unicode order, not by locale');
            assert.notDeepStrictEqual(['artichoke', 'Artichoke', 'art', 'Art'].sort(comparers_1.$0p), ['artichoke', 'Artichoke', 'art', 'Art'].sort(compareLocale), 'words with the same root and different cases do not sort in locale order');
            assert.notDeepStrictEqual(['email', 'Email', 'émail', 'Émail'].sort(comparers_1.$0p), ['email', 'Email', 'émail', 'Émail'].sort(compareLocale), 'the same base characters with different case or accents do not sort in locale order');
            // numeric comparisons
            assert((0, comparers_1.$0p)('abc02.txt', 'abc002.txt') > 0, 'filenames with equivalent numbers and leading zeros sort in unicode order');
            assert((0, comparers_1.$0p)('abc.txt1', 'abc.txt01') > 0, 'same name plus extensions with equal numbers sort in unicode order');
            assert((0, comparers_1.$0p)('art01', 'Art01') !== 'art01'.localeCompare('Art01', undefined, { numeric: true }), 'a numerically equivalent word of a different case does not compare numerically based on locale');
            assert((0, comparers_1.$0p)('a.ext1', 'a.Ext1') > 0, 'if names are equal and extensions with numbers are equal except for case, filenames are sorted in full filename unicode order');
        });
        test('compareFileExtensions', () => {
            //
            // Comparisons with the same results as compareFileExtensionsDefault
            //
            // name-only comparisons
            assert((0, comparers_1.$cq)(null, null) === 0, 'null should be equal');
            assert((0, comparers_1.$cq)(null, 'abc') < 0, 'null should come before real files without extension');
            assert((0, comparers_1.$cq)('', '') === 0, 'empty should be equal');
            assert((0, comparers_1.$cq)('abc', 'abc') === 0, 'equal names should be equal');
            assert((0, comparers_1.$cq)('z', 'A') > 0, 'z comes after A');
            assert((0, comparers_1.$cq)('Z', 'a') > 0, 'Z comes after a');
            // name plus extension comparisons
            assert((0, comparers_1.$cq)('file.ext', 'file.ext') === 0, 'equal full names should be equal');
            assert((0, comparers_1.$cq)('a.ext', 'b.ext') < 0, 'if equal extensions, filenames should be compared');
            assert((0, comparers_1.$cq)('file.aaa', 'file.bbb') < 0, 'files with equal names should be compared by extensions');
            assert((0, comparers_1.$cq)('bbb.aaa', 'aaa.bbb') < 0, 'files should be compared by extensions even if filenames compare differently');
            // dotfile comparisons
            assert((0, comparers_1.$cq)('.abc', '.abc') === 0, 'equal dotfiles should be equal');
            assert((0, comparers_1.$cq)('.md', '.Gitattributes') > 0, 'dotfiles sort alphabetically regardless of case');
            // dotfile vs non-dotfile comparisons
            assert((0, comparers_1.$cq)(null, '.abc') < 0, 'null should come before dotfiles');
            assert((0, comparers_1.$cq)('.env', 'aaa.env') < 0, 'if equal extensions, filenames should be compared, empty filename should come before others');
            assert((0, comparers_1.$cq)('.MD', 'a.md') < 0, 'if extensions differ in case, files sort by extension in unicode order');
            // numeric comparisons
            assert((0, comparers_1.$cq)('1', '1') === 0, 'numerically equal full names should be equal');
            assert((0, comparers_1.$cq)('abc1.txt', 'abc1.txt') === 0, 'equal filenames with numbers should be equal');
            assert((0, comparers_1.$cq)('abc1.txt', 'abc2.txt') < 0, 'filenames with numbers should be in numerical order, not alphabetical order');
            assert((0, comparers_1.$cq)('abc2.txt', 'abc10.txt') < 0, 'filenames with numbers should be in numerical order even when they are multiple digits long');
            assert((0, comparers_1.$cq)('abc02.txt', 'abc010.txt') < 0, 'filenames with numbers that have leading zeros sort numerically');
            assert((0, comparers_1.$cq)('abc1.10.txt', 'abc1.2.txt') > 0, 'numbers with dots between them are treated as two separate numbers, not one decimal number');
            assert((0, comparers_1.$cq)('abc2.txt2', 'abc1.txt10') < 0, 'extensions with numbers should be in numerical order, not alphabetical order');
            assert((0, comparers_1.$cq)('txt.abc1', 'txt.abc1') === 0, 'equal extensions with numbers should be equal');
            assert((0, comparers_1.$cq)('txt.abc1', 'txt.abc2') < 0, 'extensions with numbers should be in numerical order, not alphabetical order');
            assert((0, comparers_1.$cq)('txt.abc2', 'txt.abc10') < 0, 'extensions with numbers should be in numerical order even when they are multiple digits long');
            assert((0, comparers_1.$cq)('a.ext1', 'b.ext1') < 0, 'if equal extensions with numbers, names should be compared');
            assert.deepStrictEqual(['a10.txt', 'A2.txt', 'A100.txt', 'a20.txt'].sort(comparers_1.$cq), ['A2.txt', 'a10.txt', 'a20.txt', 'A100.txt'], 'filenames with number and case differences compare numerically');
            //
            // Comparisons with different results from compareFileExtensionsDefault
            //
            // name-only comparisions
            assert((0, comparers_1.$cq)('a', 'A') !== compareLocale('a', 'A'), 'the same letter of different case does not sort by locale');
            assert((0, comparers_1.$cq)('â', 'Â') !== compareLocale('â', 'Â'), 'the same accented letter of different case does not sort by locale');
            assert.notDeepStrictEqual(['artichoke', 'Artichoke', 'art', 'Art'].sort(comparers_1.$cq), ['artichoke', 'Artichoke', 'art', 'Art'].sort(compareLocale), 'words with the same root and different cases do not sort in locale order');
            assert.notDeepStrictEqual(['email', 'Email', 'émail', 'Émail'].sort(comparers_1.$cq), ['email', 'Email', 'émail', 'Émail'].sort((a, b) => a.localeCompare(b)), 'the same base characters with different case or accents do not sort in locale order');
            // name plus extension comparisons
            assert((0, comparers_1.$cq)('a.MD', 'a.md') < 0, 'case differences in extensions sort in unicode order');
            assert((0, comparers_1.$cq)('a.md', 'A.md') > 0, 'case differences in names sort in unicode order');
            assert((0, comparers_1.$cq)('a.md', 'b.MD') > 0, 'when extensions are the same except for case, the files sort by extension');
            assert((0, comparers_1.$cq)('aggregate.go', 'aggregate_repo.go') < 0, 'when extensions are equal, names sort in dictionary order');
            // dotfile comparisons
            assert((0, comparers_1.$cq)('.env', '.aaa.env') < 0, 'a dotfile with an extension is treated as a name plus an extension - equal extensions');
            assert((0, comparers_1.$cq)('.env', '.env.aaa') > 0, 'a dotfile with an extension is treated as a name plus an extension - unequal extensions');
            // dotfile vs non-dotfile comparisons
            assert((0, comparers_1.$cq)('.env', 'aaa') > 0, 'filenames without extensions come before dotfiles');
            assert((0, comparers_1.$cq)('.md', 'A.MD') > 0, 'a file with an uppercase extension sorts before a dotfile of the same lowercase extension');
            // numeric comparisons
            assert((0, comparers_1.$cq)('abc.txt01', 'abc.txt1') < 0, 'extensions with equal numbers sort in unicode order');
            assert((0, comparers_1.$cq)('art01', 'Art01') !== compareLocaleNumeric('art01', 'Art01'), 'a numerically equivalent word of a different case does not compare by locale');
            assert((0, comparers_1.$cq)('abc02.txt', 'abc002.txt') > 0, 'filenames with equivalent numbers and leading zeros sort in unicode order');
            assert((0, comparers_1.$cq)('txt.abc01', 'txt.abc1') < 0, 'extensions with equivalent numbers sort in unicode order');
            assert((0, comparers_1.$cq)('a.ext1', 'b.Ext1') > 0, 'if names are different and extensions with numbers are equal except for case, filenames are sorted in extension unicode order');
            assert((0, comparers_1.$cq)('a.ext1', 'a.Ext1') > 0, 'if names are equal and extensions with numbers are equal except for case, filenames are sorted in extension unicode order');
        });
        test('compareFileNamesDefault', () => {
            //
            // Comparisons with the same results as compareFileNames
            //
            // name-only comparisons
            assert((0, comparers_1.$$p)(null, null) === 0, 'null should be equal');
            assert((0, comparers_1.$$p)(null, 'abc') < 0, 'null should be come before real values');
            assert((0, comparers_1.$$p)('', '') === 0, 'empty should be equal');
            assert((0, comparers_1.$$p)('abc', 'abc') === 0, 'equal names should be equal');
            assert((0, comparers_1.$$p)('z', 'A') > 0, 'z comes after A');
            assert((0, comparers_1.$$p)('Z', 'a') > 0, 'Z comes after a');
            // name plus extension comparisons
            assert((0, comparers_1.$$p)('file.ext', 'file.ext') === 0, 'equal full names should be equal');
            assert((0, comparers_1.$$p)('a.ext', 'b.ext') < 0, 'if equal extensions, filenames should be compared');
            assert((0, comparers_1.$$p)('file.aaa', 'file.bbb') < 0, 'files with equal names should be compared by extensions');
            assert((0, comparers_1.$$p)('bbb.aaa', 'aaa.bbb') > 0, 'files should be compared by names even if extensions compare differently');
            assert((0, comparers_1.$$p)('aggregate.go', 'aggregate_repo.go') > 0, 'compares the whole filename in locale order');
            // dotfile comparisons
            assert((0, comparers_1.$$p)('.abc', '.abc') === 0, 'equal dotfile names should be equal');
            assert((0, comparers_1.$$p)('.env.', '.gitattributes') < 0, 'filenames starting with dots and with extensions should still sort properly');
            assert((0, comparers_1.$$p)('.env', '.aaa.env') > 0, 'dotfiles sort alphabetically when they contain multiple dots');
            assert((0, comparers_1.$$p)('.env', '.env.aaa') < 0, 'dotfiles with the same root sort shortest first');
            assert((0, comparers_1.$$p)('.aaa_env', '.aaa.env') < 0, 'an underscore in a dotfile name will sort before a dot');
            // dotfile vs non-dotfile comparisons
            assert((0, comparers_1.$$p)(null, '.abc') < 0, 'null should come before dotfiles');
            assert((0, comparers_1.$$p)('.env', 'aaa') < 0, 'dotfiles come before filenames without extensions');
            assert((0, comparers_1.$$p)('.env', 'aaa.env') < 0, 'dotfiles come before filenames with extensions');
            assert((0, comparers_1.$$p)('.md', 'A.MD') < 0, 'dotfiles sort before uppercase files');
            assert((0, comparers_1.$$p)('.MD', 'a.md') < 0, 'dotfiles sort before lowercase files');
            // numeric comparisons
            assert((0, comparers_1.$$p)('1', '1') === 0, 'numerically equal full names should be equal');
            assert((0, comparers_1.$$p)('abc1.txt', 'abc1.txt') === 0, 'equal filenames with numbers should be equal');
            assert((0, comparers_1.$$p)('abc1.txt', 'abc2.txt') < 0, 'filenames with numbers should be in numerical order, not alphabetical order');
            assert((0, comparers_1.$$p)('abc2.txt', 'abc10.txt') < 0, 'filenames with numbers should be in numerical order even when they are multiple digits long');
            assert((0, comparers_1.$$p)('abc02.txt', 'abc010.txt') < 0, 'filenames with numbers that have leading zeros sort numerically');
            assert((0, comparers_1.$$p)('abc1.10.txt', 'abc1.2.txt') > 0, 'numbers with dots between them are treated as two separate numbers, not one decimal number');
            assert((0, comparers_1.$$p)('a.ext1', 'b.Ext1') < 0, 'if names are different and extensions with numbers are equal except for case, filenames are compared by full filename');
            assert.deepStrictEqual(['a10.txt', 'A2.txt', 'A100.txt', 'a20.txt'].sort(comparers_1.$$p), ['A2.txt', 'a10.txt', 'a20.txt', 'A100.txt'], 'filenames with number and case differences compare numerically');
            //
            // Comparisons with different results than compareFileNames
            //
            // name-only comparisons
            assert((0, comparers_1.$$p)('a', 'A') === compareLocale('a', 'A'), 'the same letter sorts by locale');
            assert((0, comparers_1.$$p)('â', 'Â') === compareLocale('â', 'Â'), 'the same accented letter sorts by locale');
            assert.deepStrictEqual(['email', 'Email', 'émail', 'Émail'].sort(comparers_1.$$p), ['email', 'Email', 'émail', 'Émail'].sort(compareLocale), 'the same base characters with different case or accents sort in locale order');
            // numeric comparisons
            assert((0, comparers_1.$$p)('abc02.txt', 'abc002.txt') < 0, 'filenames with equivalent numbers and leading zeros sort shortest number first');
            assert((0, comparers_1.$$p)('abc.txt1', 'abc.txt01') < 0, 'same name plus extensions with equal numbers sort shortest number first');
            assert((0, comparers_1.$$p)('art01', 'Art01') === compareLocaleNumeric('art01', 'Art01'), 'a numerically equivalent word of a different case compares numerically based on locale');
            assert((0, comparers_1.$$p)('a.ext1', 'a.Ext1') === compareLocale('ext1', 'Ext1'), 'if names are equal and extensions with numbers are equal except for case, filenames are sorted in extension locale order');
        });
        test('compareFileExtensionsDefault', () => {
            //
            // Comparisons with the same result as compareFileExtensions
            //
            // name-only comparisons
            assert((0, comparers_1.$dq)(null, null) === 0, 'null should be equal');
            assert((0, comparers_1.$dq)(null, 'abc') < 0, 'null should come before real files without extensions');
            assert((0, comparers_1.$dq)('', '') === 0, 'empty should be equal');
            assert((0, comparers_1.$dq)('abc', 'abc') === 0, 'equal names should be equal');
            assert((0, comparers_1.$dq)('z', 'A') > 0, 'z comes after A');
            assert((0, comparers_1.$dq)('Z', 'a') > 0, 'Z comes after a');
            // name plus extension comparisons
            assert((0, comparers_1.$dq)('file.ext', 'file.ext') === 0, 'equal full filenames should be equal');
            assert((0, comparers_1.$dq)('a.ext', 'b.ext') < 0, 'if equal extensions, filenames should be compared');
            assert((0, comparers_1.$dq)('file.aaa', 'file.bbb') < 0, 'files with equal names should be compared by extensions');
            assert((0, comparers_1.$dq)('bbb.aaa', 'aaa.bbb') < 0, 'files should be compared by extension first');
            // dotfile comparisons
            assert((0, comparers_1.$dq)('.abc', '.abc') === 0, 'equal dotfiles should be equal');
            assert((0, comparers_1.$dq)('.md', '.Gitattributes') > 0, 'dotfiles sort alphabetically regardless of case');
            // dotfile vs non-dotfile comparisons
            assert((0, comparers_1.$dq)(null, '.abc') < 0, 'null should come before dotfiles');
            assert((0, comparers_1.$dq)('.env', 'aaa.env') < 0, 'dotfiles come before filenames with extensions');
            assert((0, comparers_1.$dq)('.MD', 'a.md') < 0, 'dotfiles sort before lowercase files');
            // numeric comparisons
            assert((0, comparers_1.$dq)('1', '1') === 0, 'numerically equal full names should be equal');
            assert((0, comparers_1.$dq)('abc1.txt', 'abc1.txt') === 0, 'equal filenames with numbers should be equal');
            assert((0, comparers_1.$dq)('abc1.txt', 'abc2.txt') < 0, 'filenames with numbers should be in numerical order, not alphabetical order');
            assert((0, comparers_1.$dq)('abc2.txt', 'abc10.txt') < 0, 'filenames with numbers should be in numerical order');
            assert((0, comparers_1.$dq)('abc02.txt', 'abc010.txt') < 0, 'filenames with numbers that have leading zeros sort numerically');
            assert((0, comparers_1.$dq)('abc1.10.txt', 'abc1.2.txt') > 0, 'numbers with dots between them are treated as two separate numbers, not one decimal number');
            assert((0, comparers_1.$dq)('abc2.txt2', 'abc1.txt10') < 0, 'extensions with numbers should be in numerical order, not alphabetical order');
            assert((0, comparers_1.$dq)('txt.abc1', 'txt.abc1') === 0, 'equal extensions with numbers should be equal');
            assert((0, comparers_1.$dq)('txt.abc1', 'txt.abc2') < 0, 'extensions with numbers should be in numerical order, not alphabetical order');
            assert((0, comparers_1.$dq)('txt.abc2', 'txt.abc10') < 0, 'extensions with numbers should be in numerical order even when they are multiple digits long');
            assert((0, comparers_1.$dq)('a.ext1', 'b.ext1') < 0, 'if equal extensions with numbers, full filenames should be compared');
            assert.deepStrictEqual(['a10.txt', 'A2.txt', 'A100.txt', 'a20.txt'].sort(comparers_1.$dq), ['A2.txt', 'a10.txt', 'a20.txt', 'A100.txt'], 'filenames with number and case differences compare numerically');
            //
            // Comparisons with different results than compareFileExtensions
            //
            // name-only comparisons
            assert((0, comparers_1.$dq)('a', 'A') === compareLocale('a', 'A'), 'the same letter of different case sorts by locale');
            assert((0, comparers_1.$dq)('â', 'Â') === compareLocale('â', 'Â'), 'the same accented letter of different case sorts by locale');
            assert.deepStrictEqual(['email', 'Email', 'émail', 'Émail'].sort(comparers_1.$dq), ['email', 'Email', 'émail', 'Émail'].sort((a, b) => a.localeCompare(b)), 'the same base characters with different case or accents sort in locale order');
            // name plus extension comparisons
            assert((0, comparers_1.$dq)('a.MD', 'a.md') === compareLocale('MD', 'md'), 'case differences in extensions sort by locale');
            assert((0, comparers_1.$dq)('a.md', 'A.md') === compareLocale('a', 'A'), 'case differences in names sort by locale');
            assert((0, comparers_1.$dq)('a.md', 'b.MD') < 0, 'when extensions are the same except for case, the files sort by name');
            assert((0, comparers_1.$dq)('aggregate.go', 'aggregate_repo.go') > 0, 'names with the same extension sort in full filename locale order');
            // dotfile comparisons
            assert((0, comparers_1.$dq)('.env', '.aaa.env') > 0, 'dotfiles sort alphabetically when they contain multiple dots');
            assert((0, comparers_1.$dq)('.env', '.env.aaa') < 0, 'dotfiles with the same root sort shortest first');
            // dotfile vs non-dotfile comparisons
            assert((0, comparers_1.$dq)('.env', 'aaa') < 0, 'dotfiles come before filenames without extensions');
            assert((0, comparers_1.$dq)('.md', 'A.MD') < 0, 'dotfiles sort before uppercase files');
            // numeric comparisons
            assert((0, comparers_1.$dq)('abc.txt01', 'abc.txt1') > 0, 'extensions with equal numbers should be in shortest-first order');
            assert((0, comparers_1.$dq)('art01', 'Art01') === compareLocaleNumeric('art01', 'Art01'), 'a numerically equivalent word of a different case compares numerically based on locale');
            assert((0, comparers_1.$dq)('abc02.txt', 'abc002.txt') < 0, 'filenames with equivalent numbers and leading zeros sort shortest string first');
            assert((0, comparers_1.$dq)('txt.abc01', 'txt.abc1') > 0, 'extensions with equivalent numbers sort shortest extension first');
            assert((0, comparers_1.$dq)('a.ext1', 'b.Ext1') < 0, 'if extensions with numbers are equal except for case, full filenames should be compared');
            assert((0, comparers_1.$dq)('a.ext1', 'a.Ext1') === compareLocale('a.ext1', 'a.Ext1'), 'if extensions with numbers are equal except for case, full filenames are compared in locale order');
        });
        test('compareFileNamesUpper', () => {
            //
            // Comparisons with the same results as compareFileNamesDefault
            //
            // name-only comparisons
            assert((0, comparers_1.$_p)(null, null) === 0, 'null should be equal');
            assert((0, comparers_1.$_p)(null, 'abc') < 0, 'null should be come before real values');
            assert((0, comparers_1.$_p)('', '') === 0, 'empty should be equal');
            assert((0, comparers_1.$_p)('abc', 'abc') === 0, 'equal names should be equal');
            assert((0, comparers_1.$_p)('z', 'A') > 0, 'z comes after A');
            // name plus extension comparisons
            assert((0, comparers_1.$_p)('file.ext', 'file.ext') === 0, 'equal full names should be equal');
            assert((0, comparers_1.$_p)('a.ext', 'b.ext') < 0, 'if equal extensions, filenames should be compared');
            assert((0, comparers_1.$_p)('file.aaa', 'file.bbb') < 0, 'files with equal names should be compared by extensions');
            assert((0, comparers_1.$_p)('bbb.aaa', 'aaa.bbb') > 0, 'files should be compared by names even if extensions compare differently');
            assert((0, comparers_1.$_p)('aggregate.go', 'aggregate_repo.go') > 0, 'compares the full filename in locale order');
            // dotfile comparisons
            assert((0, comparers_1.$_p)('.abc', '.abc') === 0, 'equal dotfile names should be equal');
            assert((0, comparers_1.$_p)('.env.', '.gitattributes') < 0, 'filenames starting with dots and with extensions should still sort properly');
            assert((0, comparers_1.$_p)('.env', '.aaa.env') > 0, 'dotfiles sort alphabetically when they contain multiple dots');
            assert((0, comparers_1.$_p)('.env', '.env.aaa') < 0, 'dotfiles with the same root sort shortest first');
            assert((0, comparers_1.$_p)('.aaa_env', '.aaa.env') < 0, 'an underscore in a dotfile name will sort before a dot');
            // dotfile vs non-dotfile comparisons
            assert((0, comparers_1.$_p)(null, '.abc') < 0, 'null should come before dotfiles');
            assert((0, comparers_1.$_p)('.env', 'aaa') < 0, 'dotfiles come before filenames without extensions');
            assert((0, comparers_1.$_p)('.env', 'aaa.env') < 0, 'dotfiles come before filenames with extensions');
            assert((0, comparers_1.$_p)('.md', 'A.MD') < 0, 'dotfiles sort before uppercase files');
            assert((0, comparers_1.$_p)('.MD', 'a.md') < 0, 'dotfiles sort before lowercase files');
            // numeric comparisons
            assert((0, comparers_1.$_p)('1', '1') === 0, 'numerically equal full names should be equal');
            assert((0, comparers_1.$_p)('abc1.txt', 'abc1.txt') === 0, 'equal filenames with numbers should be equal');
            assert((0, comparers_1.$_p)('abc1.txt', 'abc2.txt') < 0, 'filenames with numbers should be in numerical order, not alphabetical order');
            assert((0, comparers_1.$_p)('abc2.txt', 'abc10.txt') < 0, 'filenames with numbers should be in numerical order even when they are multiple digits long');
            assert((0, comparers_1.$_p)('abc02.txt', 'abc010.txt') < 0, 'filenames with numbers that have leading zeros sort numerically');
            assert((0, comparers_1.$_p)('abc1.10.txt', 'abc1.2.txt') > 0, 'numbers with dots between them are treated as two separate numbers, not one decimal number');
            assert((0, comparers_1.$_p)('abc02.txt', 'abc002.txt') < 0, 'filenames with equivalent numbers and leading zeros sort shortest number first');
            assert((0, comparers_1.$_p)('abc.txt1', 'abc.txt01') < 0, 'same name plus extensions with equal numbers sort shortest number first');
            assert((0, comparers_1.$_p)('a.ext1', 'b.Ext1') < 0, 'different names with the equal extensions except for case are sorted by full filename');
            assert((0, comparers_1.$_p)('a.ext1', 'a.Ext1') === compareLocale('a.ext1', 'a.Ext1'), 'same names with equal and extensions except for case are sorted in full filename locale order');
            //
            // Comparisons with different results than compareFileNamesDefault
            //
            // name-only comparisons
            assert((0, comparers_1.$_p)('Z', 'a') < 0, 'Z comes before a');
            assert((0, comparers_1.$_p)('a', 'A') > 0, 'the same letter sorts uppercase first');
            assert((0, comparers_1.$_p)('â', 'Â') > 0, 'the same accented letter sorts uppercase first');
            assert.deepStrictEqual(['artichoke', 'Artichoke', 'art', 'Art'].sort(comparers_1.$_p), ['Art', 'Artichoke', 'art', 'artichoke'], 'names with the same root and different cases sort uppercase first');
            assert.deepStrictEqual(['email', 'Email', 'émail', 'Émail'].sort(comparers_1.$_p), ['Email', 'Émail', 'email', 'émail'], 'the same base characters with different case or accents sort uppercase first');
            // numeric comparisons
            assert((0, comparers_1.$_p)('art01', 'Art01') > 0, 'a numerically equivalent name of a different case compares uppercase first');
            assert.deepStrictEqual(['a10.txt', 'A2.txt', 'A100.txt', 'a20.txt'].sort(comparers_1.$_p), ['A2.txt', 'A100.txt', 'a10.txt', 'a20.txt'], 'filenames with number and case differences group by case then compare by number');
        });
        test('compareFileExtensionsUpper', () => {
            //
            // Comparisons with the same result as compareFileExtensionsDefault
            //
            // name-only comparisons
            assert((0, comparers_1.$eq)(null, null) === 0, 'null should be equal');
            assert((0, comparers_1.$eq)(null, 'abc') < 0, 'null should come before real files without extensions');
            assert((0, comparers_1.$eq)('', '') === 0, 'empty should be equal');
            assert((0, comparers_1.$eq)('abc', 'abc') === 0, 'equal names should be equal');
            assert((0, comparers_1.$eq)('z', 'A') > 0, 'z comes after A');
            // name plus extension comparisons
            assert((0, comparers_1.$eq)('file.ext', 'file.ext') === 0, 'equal full filenames should be equal');
            assert((0, comparers_1.$eq)('a.ext', 'b.ext') < 0, 'if equal extensions, filenames should be compared');
            assert((0, comparers_1.$eq)('file.aaa', 'file.bbb') < 0, 'files with equal names should be compared by extensions');
            assert((0, comparers_1.$eq)('bbb.aaa', 'aaa.bbb') < 0, 'files should be compared by extension first');
            assert((0, comparers_1.$eq)('a.md', 'b.MD') < 0, 'when extensions are the same except for case, the files sort by name');
            assert((0, comparers_1.$eq)('a.MD', 'a.md') === compareLocale('MD', 'md'), 'case differences in extensions sort by locale');
            assert((0, comparers_1.$eq)('aggregate.go', 'aggregate_repo.go') > 0, 'when extensions are equal, compares the full filename');
            // dotfile comparisons
            assert((0, comparers_1.$eq)('.abc', '.abc') === 0, 'equal dotfiles should be equal');
            assert((0, comparers_1.$eq)('.md', '.Gitattributes') > 0, 'dotfiles sort alphabetically regardless of case');
            assert((0, comparers_1.$eq)('.env', '.aaa.env') > 0, 'dotfiles sort alphabetically when they contain multiple dots');
            assert((0, comparers_1.$eq)('.env', '.env.aaa') < 0, 'dotfiles with the same root sort shortest first');
            // dotfile vs non-dotfile comparisons
            assert((0, comparers_1.$eq)(null, '.abc') < 0, 'null should come before dotfiles');
            assert((0, comparers_1.$eq)('.env', 'aaa.env') < 0, 'dotfiles come before filenames with extensions');
            assert((0, comparers_1.$eq)('.MD', 'a.md') < 0, 'dotfiles sort before lowercase files');
            assert((0, comparers_1.$eq)('.env', 'aaa') < 0, 'dotfiles come before filenames without extensions');
            assert((0, comparers_1.$eq)('.md', 'A.MD') < 0, 'dotfiles sort before uppercase files');
            // numeric comparisons
            assert((0, comparers_1.$eq)('1', '1') === 0, 'numerically equal full names should be equal');
            assert((0, comparers_1.$eq)('abc1.txt', 'abc1.txt') === 0, 'equal filenames with numbers should be equal');
            assert((0, comparers_1.$eq)('abc1.txt', 'abc2.txt') < 0, 'filenames with numbers should be in numerical order, not alphabetical order');
            assert((0, comparers_1.$eq)('abc2.txt', 'abc10.txt') < 0, 'filenames with numbers should be in numerical order');
            assert((0, comparers_1.$eq)('abc02.txt', 'abc010.txt') < 0, 'filenames with numbers that have leading zeros sort numerically');
            assert((0, comparers_1.$eq)('abc1.10.txt', 'abc1.2.txt') > 0, 'numbers with dots between them are treated as two separate numbers, not one decimal number');
            assert((0, comparers_1.$eq)('abc2.txt2', 'abc1.txt10') < 0, 'extensions with numbers should be in numerical order, not alphabetical order');
            assert((0, comparers_1.$eq)('txt.abc1', 'txt.abc1') === 0, 'equal extensions with numbers should be equal');
            assert((0, comparers_1.$eq)('txt.abc1', 'txt.abc2') < 0, 'extensions with numbers should be in numerical order, not alphabetical order');
            assert((0, comparers_1.$eq)('txt.abc2', 'txt.abc10') < 0, 'extensions with numbers should be in numerical order even when they are multiple digits long');
            assert((0, comparers_1.$eq)('a.ext1', 'b.ext1') < 0, 'if equal extensions with numbers, full filenames should be compared');
            assert((0, comparers_1.$eq)('abc.txt01', 'abc.txt1') > 0, 'extensions with equal numbers should be in shortest-first order');
            assert((0, comparers_1.$eq)('abc02.txt', 'abc002.txt') < 0, 'filenames with equivalent numbers and leading zeros sort shortest string first');
            assert((0, comparers_1.$eq)('txt.abc01', 'txt.abc1') > 0, 'extensions with equivalent numbers sort shortest extension first');
            assert((0, comparers_1.$eq)('a.ext1', 'b.Ext1') < 0, 'different names and extensions that are equal except for case are sorted in full filename order');
            assert((0, comparers_1.$eq)('a.ext1', 'a.Ext1') === compareLocale('a.ext1', 'b.Ext1'), 'same names and extensions that are equal except for case are sorted in full filename locale order');
            //
            // Comparisons with different results than compareFileExtensionsDefault
            //
            // name-only comparisons
            assert((0, comparers_1.$eq)('Z', 'a') < 0, 'Z comes before a');
            assert((0, comparers_1.$eq)('a', 'A') > 0, 'the same letter sorts uppercase first');
            assert((0, comparers_1.$eq)('â', 'Â') > 0, 'the same accented letter sorts uppercase first');
            assert.deepStrictEqual(['artichoke', 'Artichoke', 'art', 'Art'].sort(comparers_1.$eq), ['Art', 'Artichoke', 'art', 'artichoke'], 'names with the same root and different cases sort uppercase names first');
            assert.deepStrictEqual(['email', 'Email', 'émail', 'Émail'].sort(comparers_1.$eq), ['Email', 'Émail', 'email', 'émail'], 'the same base characters with different case or accents sort uppercase names first');
            // name plus extension comparisons
            assert((0, comparers_1.$eq)('a.md', 'A.md') > 0, 'case differences in names sort uppercase first');
            assert((0, comparers_1.$eq)('art01', 'Art01') > 0, 'a numerically equivalent word of a different case sorts uppercase first');
            assert.deepStrictEqual(['a10.txt', 'A2.txt', 'A100.txt', 'a20.txt'].sort(comparers_1.$eq), ['A2.txt', 'A100.txt', 'a10.txt', 'a20.txt',], 'filenames with number and case differences group by case then sort by number');
        });
        test('compareFileNamesLower', () => {
            //
            // Comparisons with the same results as compareFileNamesDefault
            //
            // name-only comparisons
            assert((0, comparers_1.$aq)(null, null) === 0, 'null should be equal');
            assert((0, comparers_1.$aq)(null, 'abc') < 0, 'null should be come before real values');
            assert((0, comparers_1.$aq)('', '') === 0, 'empty should be equal');
            assert((0, comparers_1.$aq)('abc', 'abc') === 0, 'equal names should be equal');
            assert((0, comparers_1.$aq)('Z', 'a') > 0, 'Z comes after a');
            // name plus extension comparisons
            assert((0, comparers_1.$aq)('file.ext', 'file.ext') === 0, 'equal full names should be equal');
            assert((0, comparers_1.$aq)('a.ext', 'b.ext') < 0, 'if equal extensions, filenames should be compared');
            assert((0, comparers_1.$aq)('file.aaa', 'file.bbb') < 0, 'files with equal names should be compared by extensions');
            assert((0, comparers_1.$aq)('bbb.aaa', 'aaa.bbb') > 0, 'files should be compared by names even if extensions compare differently');
            assert((0, comparers_1.$aq)('aggregate.go', 'aggregate_repo.go') > 0, 'compares full filenames');
            // dotfile comparisons
            assert((0, comparers_1.$aq)('.abc', '.abc') === 0, 'equal dotfile names should be equal');
            assert((0, comparers_1.$aq)('.env.', '.gitattributes') < 0, 'filenames starting with dots and with extensions should still sort properly');
            assert((0, comparers_1.$aq)('.env', '.aaa.env') > 0, 'dotfiles sort alphabetically when they contain multiple dots');
            assert((0, comparers_1.$aq)('.env', '.env.aaa') < 0, 'dotfiles with the same root sort shortest first');
            assert((0, comparers_1.$aq)('.aaa_env', '.aaa.env') < 0, 'an underscore in a dotfile name will sort before a dot');
            // dotfile vs non-dotfile comparisons
            assert((0, comparers_1.$aq)(null, '.abc') < 0, 'null should come before dotfiles');
            assert((0, comparers_1.$aq)('.env', 'aaa') < 0, 'dotfiles come before filenames without extensions');
            assert((0, comparers_1.$aq)('.env', 'aaa.env') < 0, 'dotfiles come before filenames with extensions');
            assert((0, comparers_1.$aq)('.md', 'A.MD') < 0, 'dotfiles sort before uppercase files');
            assert((0, comparers_1.$aq)('.MD', 'a.md') < 0, 'dotfiles sort before lowercase files');
            // numeric comparisons
            assert((0, comparers_1.$aq)('1', '1') === 0, 'numerically equal full names should be equal');
            assert((0, comparers_1.$aq)('abc1.txt', 'abc1.txt') === 0, 'equal filenames with numbers should be equal');
            assert((0, comparers_1.$aq)('abc1.txt', 'abc2.txt') < 0, 'filenames with numbers should be in numerical order, not alphabetical order');
            assert((0, comparers_1.$aq)('abc2.txt', 'abc10.txt') < 0, 'filenames with numbers should be in numerical order even when they are multiple digits long');
            assert((0, comparers_1.$aq)('abc02.txt', 'abc010.txt') < 0, 'filenames with numbers that have leading zeros sort numerically');
            assert((0, comparers_1.$aq)('abc1.10.txt', 'abc1.2.txt') > 0, 'numbers with dots between them are treated as two separate numbers, not one decimal number');
            assert((0, comparers_1.$aq)('abc02.txt', 'abc002.txt') < 0, 'filenames with equivalent numbers and leading zeros sort shortest number first');
            assert((0, comparers_1.$aq)('abc.txt1', 'abc.txt01') < 0, 'same name plus extensions with equal numbers sort shortest number first');
            assert((0, comparers_1.$aq)('a.ext1', 'b.Ext1') < 0, 'different names and extensions that are equal except for case are sorted in full filename order');
            assert((0, comparers_1.$aq)('a.ext1', 'a.Ext1') === compareLocale('a.ext1', 'b.Ext1'), 'same names and extensions that are equal except for case are sorted in full filename locale order');
            //
            // Comparisons with different results than compareFileNamesDefault
            //
            // name-only comparisons
            assert((0, comparers_1.$aq)('z', 'A') < 0, 'z comes before A');
            assert((0, comparers_1.$aq)('a', 'A') < 0, 'the same letter sorts lowercase first');
            assert((0, comparers_1.$aq)('â', 'Â') < 0, 'the same accented letter sorts lowercase first');
            assert.deepStrictEqual(['artichoke', 'Artichoke', 'art', 'Art'].sort(comparers_1.$aq), ['art', 'artichoke', 'Art', 'Artichoke'], 'names with the same root and different cases sort lowercase first');
            assert.deepStrictEqual(['email', 'Email', 'émail', 'Émail'].sort(comparers_1.$aq), ['email', 'émail', 'Email', 'Émail'], 'the same base characters with different case or accents sort lowercase first');
            // numeric comparisons
            assert((0, comparers_1.$aq)('art01', 'Art01') < 0, 'a numerically equivalent name of a different case compares lowercase first');
            assert.deepStrictEqual(['a10.txt', 'A2.txt', 'A100.txt', 'a20.txt'].sort(comparers_1.$aq), ['a10.txt', 'a20.txt', 'A2.txt', 'A100.txt'], 'filenames with number and case differences group by case then compare by number');
        });
        test('compareFileExtensionsLower', () => {
            //
            // Comparisons with the same result as compareFileExtensionsDefault
            //
            // name-only comparisons
            assert((0, comparers_1.$fq)(null, null) === 0, 'null should be equal');
            assert((0, comparers_1.$fq)(null, 'abc') < 0, 'null should come before real files without extensions');
            assert((0, comparers_1.$fq)('', '') === 0, 'empty should be equal');
            assert((0, comparers_1.$fq)('abc', 'abc') === 0, 'equal names should be equal');
            assert((0, comparers_1.$fq)('Z', 'a') > 0, 'Z comes after a');
            // name plus extension comparisons
            assert((0, comparers_1.$fq)('file.ext', 'file.ext') === 0, 'equal full filenames should be equal');
            assert((0, comparers_1.$fq)('a.ext', 'b.ext') < 0, 'if equal extensions, filenames should be compared');
            assert((0, comparers_1.$fq)('file.aaa', 'file.bbb') < 0, 'files with equal names should be compared by extensions');
            assert((0, comparers_1.$fq)('bbb.aaa', 'aaa.bbb') < 0, 'files should be compared by extension first');
            assert((0, comparers_1.$fq)('a.md', 'b.MD') < 0, 'when extensions are the same except for case, the files sort by name');
            assert((0, comparers_1.$fq)('a.MD', 'a.md') === compareLocale('MD', 'md'), 'case differences in extensions sort by locale');
            // dotfile comparisons
            assert((0, comparers_1.$fq)('.abc', '.abc') === 0, 'equal dotfiles should be equal');
            assert((0, comparers_1.$fq)('.md', '.Gitattributes') > 0, 'dotfiles sort alphabetically regardless of case');
            assert((0, comparers_1.$fq)('.env', '.aaa.env') > 0, 'dotfiles sort alphabetically when they contain multiple dots');
            assert((0, comparers_1.$fq)('.env', '.env.aaa') < 0, 'dotfiles with the same root sort shortest first');
            // dotfile vs non-dotfile comparisons
            assert((0, comparers_1.$fq)(null, '.abc') < 0, 'null should come before dotfiles');
            assert((0, comparers_1.$fq)('.env', 'aaa.env') < 0, 'dotfiles come before filenames with extensions');
            assert((0, comparers_1.$fq)('.MD', 'a.md') < 0, 'dotfiles sort before lowercase files');
            assert((0, comparers_1.$fq)('.env', 'aaa') < 0, 'dotfiles come before filenames without extensions');
            assert((0, comparers_1.$fq)('.md', 'A.MD') < 0, 'dotfiles sort before uppercase files');
            // numeric comparisons
            assert((0, comparers_1.$fq)('1', '1') === 0, 'numerically equal full names should be equal');
            assert((0, comparers_1.$fq)('abc1.txt', 'abc1.txt') === 0, 'equal filenames with numbers should be equal');
            assert((0, comparers_1.$fq)('abc1.txt', 'abc2.txt') < 0, 'filenames with numbers should be in numerical order, not alphabetical order');
            assert((0, comparers_1.$fq)('abc2.txt', 'abc10.txt') < 0, 'filenames with numbers should be in numerical order');
            assert((0, comparers_1.$fq)('abc02.txt', 'abc010.txt') < 0, 'filenames with numbers that have leading zeros sort numerically');
            assert((0, comparers_1.$fq)('abc1.10.txt', 'abc1.2.txt') > 0, 'numbers with dots between them are treated as two separate numbers, not one decimal number');
            assert((0, comparers_1.$fq)('abc2.txt2', 'abc1.txt10') < 0, 'extensions with numbers should be in numerical order, not alphabetical order');
            assert((0, comparers_1.$fq)('txt.abc1', 'txt.abc1') === 0, 'equal extensions with numbers should be equal');
            assert((0, comparers_1.$fq)('txt.abc1', 'txt.abc2') < 0, 'extensions with numbers should be in numerical order, not alphabetical order');
            assert((0, comparers_1.$fq)('txt.abc2', 'txt.abc10') < 0, 'extensions with numbers should be in numerical order even when they are multiple digits long');
            assert((0, comparers_1.$fq)('a.ext1', 'b.ext1') < 0, 'if equal extensions with numbers, full filenames should be compared');
            assert((0, comparers_1.$fq)('abc.txt01', 'abc.txt1') > 0, 'extensions with equal numbers should be in shortest-first order');
            assert((0, comparers_1.$fq)('abc02.txt', 'abc002.txt') < 0, 'filenames with equivalent numbers and leading zeros sort shortest string first');
            assert((0, comparers_1.$fq)('txt.abc01', 'txt.abc1') > 0, 'extensions with equivalent numbers sort shortest extension first');
            assert((0, comparers_1.$fq)('a.ext1', 'b.Ext1') < 0, 'if extensions with numbers are equal except for case, full filenames should be compared');
            assert((0, comparers_1.$fq)('a.ext1', 'a.Ext1') === compareLocale('a.ext1', 'a.Ext1'), 'if extensions with numbers are equal except for case, filenames are sorted in locale order');
            //
            // Comparisons with different results than compareFileExtensionsDefault
            //
            // name-only comparisons
            assert((0, comparers_1.$fq)('z', 'A') < 0, 'z comes before A');
            assert((0, comparers_1.$fq)('a', 'A') < 0, 'the same letter sorts lowercase first');
            assert((0, comparers_1.$fq)('â', 'Â') < 0, 'the same accented letter sorts lowercase first');
            assert.deepStrictEqual(['artichoke', 'Artichoke', 'art', 'Art'].sort(comparers_1.$fq), ['art', 'artichoke', 'Art', 'Artichoke'], 'names with the same root and different cases sort lowercase names first');
            assert.deepStrictEqual(['email', 'Email', 'émail', 'Émail'].sort(comparers_1.$fq), ['email', 'émail', 'Email', 'Émail'], 'the same base characters with different case or accents sort lowercase names first');
            // name plus extension comparisons
            assert((0, comparers_1.$fq)('a.md', 'A.md') < 0, 'case differences in names sort lowercase first');
            assert((0, comparers_1.$fq)('art01', 'Art01') < 0, 'a numerically equivalent word of a different case sorts lowercase first');
            assert.deepStrictEqual(['a10.txt', 'A2.txt', 'A100.txt', 'a20.txt'].sort(comparers_1.$fq), ['a10.txt', 'a20.txt', 'A2.txt', 'A100.txt'], 'filenames with number and case differences group by case then sort by number');
            assert((0, comparers_1.$fq)('aggregate.go', 'aggregate_repo.go') > 0, 'when extensions are equal, compares full filenames');
        });
        test('compareFileNamesUnicode', () => {
            //
            // Comparisons with the same results as compareFileNamesDefault
            //
            // name-only comparisons
            assert((0, comparers_1.$bq)(null, null) === 0, 'null should be equal');
            assert((0, comparers_1.$bq)(null, 'abc') < 0, 'null should be come before real values');
            assert((0, comparers_1.$bq)('', '') === 0, 'empty should be equal');
            assert((0, comparers_1.$bq)('abc', 'abc') === 0, 'equal names should be equal');
            assert((0, comparers_1.$bq)('z', 'A') > 0, 'z comes after A');
            // name plus extension comparisons
            assert((0, comparers_1.$bq)('file.ext', 'file.ext') === 0, 'equal full names should be equal');
            assert((0, comparers_1.$bq)('a.ext', 'b.ext') < 0, 'if equal extensions, filenames should be compared');
            assert((0, comparers_1.$bq)('file.aaa', 'file.bbb') < 0, 'files with equal names should be compared by extensions');
            assert((0, comparers_1.$bq)('bbb.aaa', 'aaa.bbb') > 0, 'files should be compared by names even if extensions compare differently');
            // dotfile comparisons
            assert((0, comparers_1.$bq)('.abc', '.abc') === 0, 'equal dotfile names should be equal');
            assert((0, comparers_1.$bq)('.env.', '.gitattributes') < 0, 'filenames starting with dots and with extensions should still sort properly');
            assert((0, comparers_1.$bq)('.env', '.aaa.env') > 0, 'dotfiles sort alphabetically when they contain multiple dots');
            assert((0, comparers_1.$bq)('.env', '.env.aaa') < 0, 'dotfiles with the same root sort shortest first');
            // dotfile vs non-dotfile comparisons
            assert((0, comparers_1.$bq)(null, '.abc') < 0, 'null should come before dotfiles');
            assert((0, comparers_1.$bq)('.env', 'aaa') < 0, 'dotfiles come before filenames without extensions');
            assert((0, comparers_1.$bq)('.env', 'aaa.env') < 0, 'dotfiles come before filenames with extensions');
            assert((0, comparers_1.$bq)('.md', 'A.MD') < 0, 'dotfiles sort before uppercase files');
            assert((0, comparers_1.$bq)('.MD', 'a.md') < 0, 'dotfiles sort before lowercase files');
            // numeric comparisons
            assert((0, comparers_1.$bq)('1', '1') === 0, 'numerically equal full names should be equal');
            assert((0, comparers_1.$bq)('abc1.txt', 'abc1.txt') === 0, 'equal filenames with numbers should be equal');
            assert((0, comparers_1.$bq)('abc1.txt', 'abc2.txt') < 0, 'filenames with numbers should be in numerical order, not alphabetical order');
            assert((0, comparers_1.$bq)('a.ext1', 'b.Ext1') < 0, 'if names are different and extensions with numbers are equal except for case, filenames are sorted by unicode full filename');
            assert((0, comparers_1.$bq)('a.ext1', 'a.Ext1') > 0, 'if names are equal and extensions with numbers are equal except for case, filenames are sorted by unicode full filename');
            //
            // Comparisons with different results than compareFileNamesDefault
            //
            // name-only comparisons
            assert((0, comparers_1.$bq)('Z', 'a') < 0, 'Z comes before a');
            assert((0, comparers_1.$bq)('a', 'A') > 0, 'the same letter sorts uppercase first');
            assert((0, comparers_1.$bq)('â', 'Â') > 0, 'the same accented letter sorts uppercase first');
            assert.deepStrictEqual(['artichoke', 'Artichoke', 'art', 'Art'].sort(comparers_1.$bq), ['Art', 'Artichoke', 'art', 'artichoke'], 'names with the same root and different cases sort uppercase first');
            assert.deepStrictEqual(['email', 'Email', 'émail', 'Émail'].sort(comparers_1.$bq), ['Email', 'email', 'Émail', 'émail'], 'the same base characters with different case or accents sort in unicode order');
            // name plus extension comparisons
            assert((0, comparers_1.$bq)('aggregate.go', 'aggregate_repo.go') < 0, 'compares the whole name in unicode order, but dot comes before underscore');
            // dotfile comparisons
            assert((0, comparers_1.$bq)('.aaa_env', '.aaa.env') > 0, 'an underscore in a dotfile name will sort after a dot');
            // numeric comparisons
            assert((0, comparers_1.$bq)('abc2.txt', 'abc10.txt') > 0, 'filenames with numbers should be in unicode order even when they are multiple digits long');
            assert((0, comparers_1.$bq)('abc02.txt', 'abc010.txt') > 0, 'filenames with numbers that have leading zeros sort in unicode order');
            assert((0, comparers_1.$bq)('abc1.10.txt', 'abc1.2.txt') < 0, 'numbers with dots between them are sorted in unicode order');
            assert((0, comparers_1.$bq)('abc02.txt', 'abc002.txt') > 0, 'filenames with equivalent numbers and leading zeros sort in unicode order');
            assert((0, comparers_1.$bq)('abc.txt1', 'abc.txt01') > 0, 'same name plus extensions with equal numbers sort in unicode order');
            assert((0, comparers_1.$bq)('art01', 'Art01') > 0, 'a numerically equivalent name of a different case compares uppercase first');
            assert.deepStrictEqual(['a10.txt', 'A2.txt', 'A100.txt', 'a20.txt'].sort(comparers_1.$bq), ['A100.txt', 'A2.txt', 'a10.txt', 'a20.txt'], 'filenames with number and case differences sort in unicode order');
        });
        test('compareFileExtensionsUnicode', () => {
            //
            // Comparisons with the same result as compareFileExtensionsDefault
            //
            // name-only comparisons
            assert((0, comparers_1.$gq)(null, null) === 0, 'null should be equal');
            assert((0, comparers_1.$gq)(null, 'abc') < 0, 'null should come before real files without extensions');
            assert((0, comparers_1.$gq)('', '') === 0, 'empty should be equal');
            assert((0, comparers_1.$gq)('abc', 'abc') === 0, 'equal names should be equal');
            assert((0, comparers_1.$gq)('z', 'A') > 0, 'z comes after A');
            // name plus extension comparisons
            assert((0, comparers_1.$gq)('file.ext', 'file.ext') === 0, 'equal full filenames should be equal');
            assert((0, comparers_1.$gq)('a.ext', 'b.ext') < 0, 'if equal extensions, filenames should be compared');
            assert((0, comparers_1.$gq)('file.aaa', 'file.bbb') < 0, 'files with equal names should be compared by extensions');
            assert((0, comparers_1.$gq)('bbb.aaa', 'aaa.bbb') < 0, 'files should be compared by extension first');
            assert((0, comparers_1.$gq)('a.md', 'b.MD') < 0, 'when extensions are the same except for case, the files sort by name');
            assert((0, comparers_1.$gq)('a.MD', 'a.md') < 0, 'case differences in extensions sort in unicode order');
            // dotfile comparisons
            assert((0, comparers_1.$gq)('.abc', '.abc') === 0, 'equal dotfiles should be equal');
            assert((0, comparers_1.$gq)('.md', '.Gitattributes') > 0, 'dotfiles sort alphabetically regardless of case');
            assert((0, comparers_1.$gq)('.env', '.aaa.env') > 0, 'dotfiles sort alphabetically when they contain multiple dots');
            assert((0, comparers_1.$gq)('.env', '.env.aaa') < 0, 'dotfiles with the same root sort shortest first');
            // dotfile vs non-dotfile comparisons
            assert((0, comparers_1.$gq)(null, '.abc') < 0, 'null should come before dotfiles');
            assert((0, comparers_1.$gq)('.env', 'aaa.env') < 0, 'dotfiles come before filenames with extensions');
            assert((0, comparers_1.$gq)('.MD', 'a.md') < 0, 'dotfiles sort before lowercase files');
            assert((0, comparers_1.$gq)('.env', 'aaa') < 0, 'dotfiles come before filenames without extensions');
            assert((0, comparers_1.$gq)('.md', 'A.MD') < 0, 'dotfiles sort before uppercase files');
            // numeric comparisons
            assert((0, comparers_1.$gq)('1', '1') === 0, 'numerically equal full names should be equal');
            assert((0, comparers_1.$gq)('abc1.txt', 'abc1.txt') === 0, 'equal filenames with numbers should be equal');
            assert((0, comparers_1.$gq)('abc1.txt', 'abc2.txt') < 0, 'filenames with numbers should be in numerical order, not alphabetical order');
            assert((0, comparers_1.$gq)('txt.abc1', 'txt.abc1') === 0, 'equal extensions with numbers should be equal');
            assert((0, comparers_1.$gq)('txt.abc1', 'txt.abc2') < 0, 'extensions with numbers should be in numerical order, not alphabetical order');
            assert((0, comparers_1.$gq)('a.ext1', 'b.ext1') < 0, 'if equal extensions with numbers, full filenames should be compared');
            //
            // Comparisons with different results than compareFileExtensionsDefault
            //
            // name-only comparisons
            assert((0, comparers_1.$gq)('Z', 'a') < 0, 'Z comes before a');
            assert((0, comparers_1.$gq)('a', 'A') > 0, 'the same letter sorts uppercase first');
            assert((0, comparers_1.$gq)('â', 'Â') > 0, 'the same accented letter sorts uppercase first');
            assert.deepStrictEqual(['artichoke', 'Artichoke', 'art', 'Art'].sort(comparers_1.$gq), ['Art', 'Artichoke', 'art', 'artichoke'], 'names with the same root and different cases sort uppercase names first');
            assert.deepStrictEqual(['email', 'Email', 'émail', 'Émail'].sort(comparers_1.$gq), ['Email', 'email', 'Émail', 'émail'], 'the same base characters with different case or accents sort in unicode order');
            // name plus extension comparisons
            assert((0, comparers_1.$gq)('a.MD', 'a.md') < 0, 'case differences in extensions sort by uppercase extension first');
            assert((0, comparers_1.$gq)('a.md', 'A.md') > 0, 'case differences in names sort uppercase first');
            assert((0, comparers_1.$gq)('art01', 'Art01') > 0, 'a numerically equivalent name of a different case sorts uppercase first');
            assert.deepStrictEqual(['a10.txt', 'A2.txt', 'A100.txt', 'a20.txt'].sort(comparers_1.$gq), ['A100.txt', 'A2.txt', 'a10.txt', 'a20.txt'], 'filenames with number and case differences sort in unicode order');
            assert((0, comparers_1.$gq)('aggregate.go', 'aggregate_repo.go') < 0, 'when extensions are equal, compares full filenames in unicode order');
            // numeric comparisons
            assert((0, comparers_1.$gq)('abc2.txt', 'abc10.txt') > 0, 'filenames with numbers should be in unicode order');
            assert((0, comparers_1.$gq)('abc02.txt', 'abc010.txt') > 0, 'filenames with numbers that have leading zeros sort in unicode order');
            assert((0, comparers_1.$gq)('abc1.10.txt', 'abc1.2.txt') < 0, 'numbers with dots between them sort in unicode order');
            assert((0, comparers_1.$gq)('abc2.txt2', 'abc1.txt10') > 0, 'extensions with numbers should be in unicode order');
            assert((0, comparers_1.$gq)('txt.abc2', 'txt.abc10') > 0, 'extensions with numbers should be in unicode order even when they are multiple digits long');
            assert((0, comparers_1.$gq)('abc.txt01', 'abc.txt1') < 0, 'extensions with equal numbers should be in unicode order');
            assert((0, comparers_1.$gq)('abc02.txt', 'abc002.txt') > 0, 'filenames with equivalent numbers and leading zeros sort in unicode order');
            assert((0, comparers_1.$gq)('txt.abc01', 'txt.abc1') < 0, 'extensions with equivalent numbers sort in unicode order');
            assert((0, comparers_1.$gq)('a.ext1', 'b.Ext1') < 0, 'if extensions with numbers are equal except for case, unicode full filenames should be compared');
            assert((0, comparers_1.$gq)('a.ext1', 'a.Ext1') > 0, 'if extensions with numbers are equal except for case, unicode full filenames should be compared');
        });
    });
});
//# sourceMappingURL=comparers.test.js.map