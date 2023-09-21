/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls"], function (require, exports, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toLocalISOString = exports.fromNow = void 0;
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
    function fromNow(date, appendAgoLabel, useFullTimeWords, disallowNow) {
        if (typeof date !== 'number') {
            date = date.getTime();
        }
        const seconds = Math.round((new Date().getTime() - date) / 1000);
        if (seconds < -30) {
            return (0, nls_1.localize)('date.fromNow.in', 'in {0}', fromNow(new Date().getTime() + seconds * 1000, false));
        }
        if (!disallowNow && seconds < 30) {
            return (0, nls_1.localize)('date.fromNow.now', 'now');
        }
        let value;
        if (seconds < minute) {
            value = seconds;
            if (appendAgoLabel) {
                if (value === 1) {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.seconds.singular.ago.fullWord', '{0} second ago', value)
                        : (0, nls_1.localize)('date.fromNow.seconds.singular.ago', '{0} sec ago', value);
                }
                else {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.seconds.plural.ago.fullWord', '{0} seconds ago', value)
                        : (0, nls_1.localize)('date.fromNow.seconds.plural.ago', '{0} secs ago', value);
                }
            }
            else {
                if (value === 1) {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.seconds.singular.fullWord', '{0} second', value)
                        : (0, nls_1.localize)('date.fromNow.seconds.singular', '{0} sec', value);
                }
                else {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.seconds.plural.fullWord', '{0} seconds', value)
                        : (0, nls_1.localize)('date.fromNow.seconds.plural', '{0} secs', value);
                }
            }
        }
        if (seconds < hour) {
            value = Math.floor(seconds / minute);
            if (appendAgoLabel) {
                if (value === 1) {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.minutes.singular.ago.fullWord', '{0} minute ago', value)
                        : (0, nls_1.localize)('date.fromNow.minutes.singular.ago', '{0} min ago', value);
                }
                else {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.minutes.plural.ago.fullWord', '{0} minutes ago', value)
                        : (0, nls_1.localize)('date.fromNow.minutes.plural.ago', '{0} mins ago', value);
                }
            }
            else {
                if (value === 1) {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.minutes.singular.fullWord', '{0} minute', value)
                        : (0, nls_1.localize)('date.fromNow.minutes.singular', '{0} min', value);
                }
                else {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.minutes.plural.fullWord', '{0} minutes', value)
                        : (0, nls_1.localize)('date.fromNow.minutes.plural', '{0} mins', value);
                }
            }
        }
        if (seconds < day) {
            value = Math.floor(seconds / hour);
            if (appendAgoLabel) {
                if (value === 1) {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.hours.singular.ago.fullWord', '{0} hour ago', value)
                        : (0, nls_1.localize)('date.fromNow.hours.singular.ago', '{0} hr ago', value);
                }
                else {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.hours.plural.ago.fullWord', '{0} hours ago', value)
                        : (0, nls_1.localize)('date.fromNow.hours.plural.ago', '{0} hrs ago', value);
                }
            }
            else {
                if (value === 1) {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.hours.singular.fullWord', '{0} hour', value)
                        : (0, nls_1.localize)('date.fromNow.hours.singular', '{0} hr', value);
                }
                else {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.hours.plural.fullWord', '{0} hours', value)
                        : (0, nls_1.localize)('date.fromNow.hours.plural', '{0} hrs', value);
                }
            }
        }
        if (seconds < week) {
            value = Math.floor(seconds / day);
            if (appendAgoLabel) {
                return value === 1
                    ? (0, nls_1.localize)('date.fromNow.days.singular.ago', '{0} day ago', value)
                    : (0, nls_1.localize)('date.fromNow.days.plural.ago', '{0} days ago', value);
            }
            else {
                return value === 1
                    ? (0, nls_1.localize)('date.fromNow.days.singular', '{0} day', value)
                    : (0, nls_1.localize)('date.fromNow.days.plural', '{0} days', value);
            }
        }
        if (seconds < month) {
            value = Math.floor(seconds / week);
            if (appendAgoLabel) {
                if (value === 1) {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.weeks.singular.ago.fullWord', '{0} week ago', value)
                        : (0, nls_1.localize)('date.fromNow.weeks.singular.ago', '{0} wk ago', value);
                }
                else {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.weeks.plural.ago.fullWord', '{0} weeks ago', value)
                        : (0, nls_1.localize)('date.fromNow.weeks.plural.ago', '{0} wks ago', value);
                }
            }
            else {
                if (value === 1) {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.weeks.singular.fullWord', '{0} week', value)
                        : (0, nls_1.localize)('date.fromNow.weeks.singular', '{0} wk', value);
                }
                else {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.weeks.plural.fullWord', '{0} weeks', value)
                        : (0, nls_1.localize)('date.fromNow.weeks.plural', '{0} wks', value);
                }
            }
        }
        if (seconds < year) {
            value = Math.floor(seconds / month);
            if (appendAgoLabel) {
                if (value === 1) {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.months.singular.ago.fullWord', '{0} month ago', value)
                        : (0, nls_1.localize)('date.fromNow.months.singular.ago', '{0} mo ago', value);
                }
                else {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.months.plural.ago.fullWord', '{0} months ago', value)
                        : (0, nls_1.localize)('date.fromNow.months.plural.ago', '{0} mos ago', value);
                }
            }
            else {
                if (value === 1) {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.months.singular.fullWord', '{0} month', value)
                        : (0, nls_1.localize)('date.fromNow.months.singular', '{0} mo', value);
                }
                else {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.months.plural.fullWord', '{0} months', value)
                        : (0, nls_1.localize)('date.fromNow.months.plural', '{0} mos', value);
                }
            }
        }
        value = Math.floor(seconds / year);
        if (appendAgoLabel) {
            if (value === 1) {
                return useFullTimeWords
                    ? (0, nls_1.localize)('date.fromNow.years.singular.ago.fullWord', '{0} year ago', value)
                    : (0, nls_1.localize)('date.fromNow.years.singular.ago', '{0} yr ago', value);
            }
            else {
                return useFullTimeWords
                    ? (0, nls_1.localize)('date.fromNow.years.plural.ago.fullWord', '{0} years ago', value)
                    : (0, nls_1.localize)('date.fromNow.years.plural.ago', '{0} yrs ago', value);
            }
        }
        else {
            if (value === 1) {
                return useFullTimeWords
                    ? (0, nls_1.localize)('date.fromNow.years.singular.fullWord', '{0} year', value)
                    : (0, nls_1.localize)('date.fromNow.years.singular', '{0} yr', value);
            }
            else {
                return useFullTimeWords
                    ? (0, nls_1.localize)('date.fromNow.years.plural.fullWord', '{0} years', value)
                    : (0, nls_1.localize)('date.fromNow.years.plural', '{0} yrs', value);
            }
        }
    }
    exports.fromNow = fromNow;
    function toLocalISOString(date) {
        return date.getFullYear() +
            '-' + String(date.getMonth() + 1).padStart(2, '0') +
            '-' + String(date.getDate()).padStart(2, '0') +
            'T' + String(date.getHours()).padStart(2, '0') +
            ':' + String(date.getMinutes()).padStart(2, '0') +
            ':' + String(date.getSeconds()).padStart(2, '0') +
            '.' + (date.getMilliseconds() / 1000).toFixed(3).slice(2, 5) +
            'Z';
    }
    exports.toLocalISOString = toLocalISOString;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL2RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBSWhHLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUNsQixNQUFNLElBQUksR0FBRyxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBQ3pCLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7SUFDdEIsTUFBTSxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztJQUNyQixNQUFNLEtBQUssR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFDO0lBQ3ZCLE1BQU0sSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFFdkI7Ozs7Ozs7O09BUUc7SUFDSCxTQUFnQixPQUFPLENBQUMsSUFBbUIsRUFBRSxjQUF3QixFQUFFLGdCQUEwQixFQUFFLFdBQXFCO1FBQ3ZILElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxFQUFFO1lBQzdCLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDdEI7UUFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNqRSxJQUFJLE9BQU8sR0FBRyxDQUFDLEVBQUUsRUFBRTtZQUNsQixPQUFPLElBQUEsY0FBUSxFQUFDLGlCQUFpQixFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxPQUFPLEdBQUcsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDcEc7UUFFRCxJQUFJLENBQUMsV0FBVyxJQUFJLE9BQU8sR0FBRyxFQUFFLEVBQUU7WUFDakMsT0FBTyxJQUFBLGNB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