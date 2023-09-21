/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/base/common/date"], function (require, exports, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$7l = exports.$6l = void 0;
    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
    const month = day * 30;
    const year = day * 365;
    /**
     * Create a localized difference of the time between now and the specified date.
     * @param date The date to generate the difference from.
     * @param appendAgoLabel Whether to append the " ago" to the end.
     * @param useFullTimeWords Whether to use full words (eg. seconds) instead of
     * shortened (eg. secs).
     * @param disallowNow Whether to disallow the string "now" when the difference
     * is less than 30 seconds.
     */
    function $6l(date, appendAgoLabel, useFullTimeWords, disallowNow) {
        if (typeof date !== 'number') {
            date = date.getTime();
        }
        const seconds = Math.round((new Date().getTime() - date) / 1000);
        if (seconds < -30) {
            return (0, nls_1.localize)(0, null, $6l(new Date().getTime() + seconds * 1000, false));
        }
        if (!disallowNow && seconds < 30) {
            return (0, nls_1.localize)(1, null);
        }
        let value;
        if (seconds < minute) {
            value = seconds;
            if (appendAgoLabel) {
                if (value === 1) {
                    return useFullTimeWords
                        ? (0, nls_1.localize)(2, null, value)
                        : (0, nls_1.localize)(3, null, value);
                }
                else {
                    return useFullTimeWords
                        ? (0, nls_1.localize)(4, null, value)
                        : (0, nls_1.localize)(5, null, value);
                }
            }
            else {
                if (value === 1) {
                    return useFullTimeWords
                        ? (0, nls_1.localize)(6, null, value)
                        : (0, nls_1.localize)(7, null, value);
                }
                else {
                    return useFullTimeWords
                        ? (0, nls_1.localize)(8, null, value)
                        : (0, nls_1.localize)(9, null, value);
                }
            }
        }
        if (seconds < hour) {
            value = Math.floor(seconds / minute);
            if (appendAgoLabel) {
                if (value === 1) {
                    return useFullTimeWords
                        ? (0, nls_1.localize)(10, null, value)
                        : (0, nls_1.localize)(11, null, value);
                }
                else {
                    return useFullTimeWords
                        ? (0, nls_1.localize)(12, null, value)
                        : (0, nls_1.localize)(13, null, value);
                }
            }
            else {
                if (value === 1) {
                    return useFullTimeWords
                        ? (0, nls_1.localize)(14, null, value)
                        : (0, nls_1.localize)(15, null, value);
                }
                else {
                    return useFullTimeWords
                        ? (0, nls_1.localize)(16, null, value)
                        : (0, nls_1.localize)(17, null, value);
                }
            }
        }
        if (seconds < day) {
            value = Math.floor(seconds / hour);
            if (appendAgoLabel) {
                if (value === 1) {
                    return useFullTimeWords
                        ? (0, nls_1.localize)(18, null, value)
                        : (0, nls_1.localize)(19, null, value);
                }
                else {
                    return useFullTimeWords
                        ? (0, nls_1.localize)(20, null, value)
                        : (0, nls_1.localize)(21, null, value);
                }
            }
            else {
                if (value === 1) {
                    return useFullTimeWords
                        ? (0, nls_1.localize)(22, null, value)
                        : (0, nls_1.localize)(23, null, value);
                }
                else {
                    return useFullTimeWords
                        ? (0, nls_1.localize)(24, null, value)
                        : (0, nls_1.localize)(25, null, value);
                }
            }
        }
        if (seconds < week) {
            value = Math.floor(seconds / day);
            if (appendAgoLabel) {
                return value === 1
                    ? (0, nls_1.localize)(26, null, value)
                    : (0, nls_1.localize)(27, null, value);
            }
            else {
                return value === 1
                    ? (0, nls_1.localize)(28, null, value)
                    : (0, nls_1.localize)(29, null, value);
            }
        }
        if (seconds < month) {
            value = Math.floor(seconds / week);
            if (appendAgoLabel) {
                if (value === 1) {
                    return useFullTimeWords
                        ? (0, nls_1.localize)(30, null, value)
                        : (0, nls_1.localize)(31, null, value);
                }
                else {
                    return useFullTimeWords
                        ? (0, nls_1.localize)(32, null, value)
                        : (0, nls_1.localize)(33, null, value);
                }
            }
            else {
                if (value === 1) {
                    return useFullTimeWords
                        ? (0, nls_1.localize)(34, null, value)
                        : (0, nls_1.localize)(35, null, value);
                }
                else {
                    return useFullTimeWords
                        ? (0, nls_1.localize)(36, null, value)
                        : (0, nls_1.localize)(37, null, value);
                }
            }
        }
        if (seconds < year) {
            value = Math.floor(seconds / month);
            if (appendAgoLabel) {
                if (value === 1) {
                    return useFullTimeWords
                        ? (0, nls_1.localize)(38, null, value)
                        : (0, nls_1.localize)(39, null, value);
                }
                else {
                    return useFullTimeWords
                        ? (0, nls_1.localize)(40, null, value)
                        : (0, nls_1.localize)(41, null, value);
                }
            }
            else {
                if (value === 1) {
                    return useFullTimeWords
                        ? (0, nls_1.localize)(42, null, value)
                        : (0, nls_1.localize)(43, null, value);
                }
                else {
                    return useFullTimeWords
                        ? (0, nls_1.localize)(44, null, value)
                        : (0, nls_1.localize)(45, null, value);
                }
            }
        }
        value = Math.floor(seconds / year);
        if (appendAgoLabel) {
            if (value === 1) {
                return useFullTimeWords
                    ? (0, nls_1.localize)(46, null, value)
                    : (0, nls_1.localize)(47, null, value);
            }
            else {
                return useFullTimeWords
                    ? (0, nls_1.localize)(48, null, value)
                    : (0, nls_1.localize)(49, null, value);
            }
        }
        else {
            if (value === 1) {
                return useFullTimeWords
                    ? (0, nls_1.localize)(50, null, value)
                    : (0, nls_1.localize)(51, null, value);
            }
            else {
                return useFullTimeWords
                    ? (0, nls_1.localize)(52, null, value)
                    : (0, nls_1.localize)(53, null, value);
            }
        }
    }
    exports.$6l = $6l;
    function $7l(date) {
        return date.getFullYear() +
            '-' + String(date.getMonth() + 1).padStart(2, '0') +
            '-' + String(date.getDate()).padStart(2, '0') +
            'T' + String(date.getHours()).padStart(2, '0') +
            ':' + String(date.getMinutes()).padStart(2, '0') +
            ':' + String(date.getSeconds()).padStart(2, '0') +
            '.' + (date.getMilliseconds() / 1000).toFixed(3).slice(2, 5) +
            'Z';
    }
    exports.$7l = $7l;
});
//# sourceMappingURL=date.js.map