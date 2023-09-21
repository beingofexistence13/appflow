/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parse = void 0;
    var ChCode;
    (function (ChCode) {
        ChCode[ChCode["BOM"] = 65279] = "BOM";
        ChCode[ChCode["SPACE"] = 32] = "SPACE";
        ChCode[ChCode["TAB"] = 9] = "TAB";
        ChCode[ChCode["CARRIAGE_RETURN"] = 13] = "CARRIAGE_RETURN";
        ChCode[ChCode["LINE_FEED"] = 10] = "LINE_FEED";
        ChCode[ChCode["SLASH"] = 47] = "SLASH";
        ChCode[ChCode["LESS_THAN"] = 60] = "LESS_THAN";
        ChCode[ChCode["QUESTION_MARK"] = 63] = "QUESTION_MARK";
        ChCode[ChCode["EXCLAMATION_MARK"] = 33] = "EXCLAMATION_MARK";
    })(ChCode || (ChCode = {}));
    var State;
    (function (State) {
        State[State["ROOT_STATE"] = 0] = "ROOT_STATE";
        State[State["DICT_STATE"] = 1] = "DICT_STATE";
        State[State["ARR_STATE"] = 2] = "ARR_STATE";
    })(State || (State = {}));
    /**
     * A very fast plist parser
     */
    function parse(content) {
        return _parse(content, null, null);
    }
    exports.parse = parse;
    function _parse(content, filename, locationKeyName) {
        const len = content.length;
        let pos = 0;
        let line = 1;
        let char = 0;
        // Skip UTF8 BOM
        if (len > 0 && content.charCodeAt(0) === 65279 /* ChCode.BOM */) {
            pos = 1;
        }
        function advancePosBy(by) {
            if (locationKeyName === null) {
                pos = pos + by;
            }
            else {
                while (by > 0) {
                    const chCode = content.charCodeAt(pos);
                    if (chCode === 10 /* ChCode.LINE_FEED */) {
                        pos++;
                        line++;
                        char = 0;
                    }
                    else {
                        pos++;
                        char++;
                    }
                    by--;
                }
            }
        }
        function advancePosTo(to) {
            if (locationKeyName === null) {
                pos = to;
            }
            else {
                advancePosBy(to - pos);
            }
        }
        function skipWhitespace() {
            while (pos < len) {
                const chCode = content.charCodeAt(pos);
                if (chCode !== 32 /* ChCode.SPACE */ && chCode !== 9 /* ChCode.TAB */ && chCode !== 13 /* ChCode.CARRIAGE_RETURN */ && chCode !== 10 /* ChCode.LINE_FEED */) {
                    break;
                }
                advancePosBy(1);
            }
        }
        function advanceIfStartsWith(str) {
            if (content.substr(pos, str.length) === str) {
                advancePosBy(str.length);
                return true;
            }
            return false;
        }
        function advanceUntil(str) {
            const nextOccurence = content.indexOf(str, pos);
            if (nextOccurence !== -1) {
                advancePosTo(nextOccurence + str.length);
            }
            else {
                // EOF
                advancePosTo(len);
            }
        }
        function captureUntil(str) {
            const nextOccurence = content.indexOf(str, pos);
            if (nextOccurence !== -1) {
                const r = content.substring(pos, nextOccurence);
                advancePosTo(nextOccurence + str.length);
                return r;
            }
            else {
                // EOF
                const r = content.substr(pos);
                advancePosTo(len);
                return r;
            }
        }
        let state = 0 /* State.ROOT_STATE */;
        let cur = null;
        const stateStack = [];
        const objStack = [];
        let curKey = null;
        function pushState(newState, newCur) {
            stateStack.push(state);
            objStack.push(cur);
            state = newState;
            cur = newCur;
        }
        function popState() {
            if (stateStack.length === 0) {
                return fail('illegal state stack');
            }
            state = stateStack.pop();
            cur = objStack.pop();
        }
        function fail(msg) {
            throw new Error('Near offset ' + pos + ': ' + msg + ' ~~~' + content.substr(pos, 50) + '~~~');
        }
        const dictState = {
            enterDict: function () {
                if (curKey === null) {
                    return fail('missing <key>');
                }
                const newDict = {};
                if (locationKeyName !== null) {
                    newDict[locationKeyName] = {
                        filename: filename,
                        line: line,
                        char: char
                    };
                }
                cur[curKey] = newDict;
                curKey = null;
                pushState(1 /* State.DICT_STATE */, newDict);
            },
            enterArray: function () {
                if (curKey === null) {
                    return fail('missing <key>');
                }
                const newArr = [];
                cur[curKey] = newArr;
                curKey = null;
                pushState(2 /* State.ARR_STATE */, newArr);
            }
        };
        const arrState = {
            enterDict: function () {
                const newDict = {};
                if (locationKeyName !== null) {
                    newDict[locationKeyName] = {
                        filename: filename,
                        line: line,
                        char: char
                    };
                }
                cur.push(newDict);
                pushState(1 /* State.DICT_STATE */, newDict);
            },
            enterArray: function () {
                const newArr = [];
                cur.push(newArr);
                pushState(2 /* State.ARR_STATE */, newArr);
            }
        };
        function enterDict() {
            if (state === 1 /* State.DICT_STATE */) {
                dictState.enterDict();
            }
            else if (state === 2 /* State.ARR_STATE */) {
                arrState.enterDict();
            }
            else { // ROOT_STATE
                cur = {};
                if (locationKeyName !== null) {
                    cur[locationKeyName] = {
                        filename: filename,
                        line: line,
                        char: char
                    };
                }
                pushState(1 /* State.DICT_STATE */, cur);
            }
        }
        function leaveDict() {
            if (state === 1 /* State.DICT_STATE */) {
                popState();
            }
            else if (state === 2 /* State.ARR_STATE */) {
                return fail('unexpected </dict>');
            }
            else { // ROOT_STATE
                return fail('unexpected </dict>');
            }
        }
        function enterArray() {
            if (state === 1 /* State.DICT_STATE */) {
                dictState.enterArray();
            }
            else if (state === 2 /* State.ARR_STATE */) {
                arrState.enterArray();
            }
            else { // ROOT_STATE
                cur = [];
                pushState(2 /* State.ARR_STATE */, cur);
            }
        }
        function leaveArray() {
            if (state === 1 /* State.DICT_STATE */) {
                return fail('unexpected </array>');
            }
            else if (state === 2 /* State.ARR_STATE */) {
                popState();
            }
            else { // ROOT_STATE
                return fail('unexpected </array>');
            }
        }
        function acceptKey(val) {
            if (state === 1 /* State.DICT_STATE */) {
                if (curKey !== null) {
                    return fail('too many <key>');
                }
                curKey = val;
            }
            else if (state === 2 /* State.ARR_STATE */) {
                return fail('unexpected <key>');
            }
            else { // ROOT_STATE
                return fail('unexpected <key>');
            }
        }
        function acceptString(val) {
            if (state === 1 /* State.DICT_STATE */) {
                if (curKey === null) {
                    return fail('missing <key>');
                }
                cur[curKey] = val;
                curKey = null;
            }
            else if (state === 2 /* State.ARR_STATE */) {
                cur.push(val);
            }
            else { // ROOT_STATE
                cur = val;
            }
        }
        function acceptReal(val) {
            if (isNaN(val)) {
                return fail('cannot parse float');
            }
            if (state === 1 /* State.DICT_STATE */) {
                if (curKey === null) {
                    return fail('missing <key>');
                }
                cur[curKey] = val;
                curKey = null;
            }
            else if (state === 2 /* State.ARR_STATE */) {
                cur.push(val);
            }
            else { // ROOT_STATE
                cur = val;
            }
        }
        function acceptInteger(val) {
            if (isNaN(val)) {
                return fail('cannot parse integer');
            }
            if (state === 1 /* State.DICT_STATE */) {
                if (curKey === null) {
                    return fail('missing <key>');
                }
                cur[curKey] = val;
                curKey = null;
            }
            else if (state === 2 /* State.ARR_STATE */) {
                cur.push(val);
            }
            else { // ROOT_STATE
                cur = val;
            }
        }
        function acceptDate(val) {
            if (state === 1 /* State.DICT_STATE */) {
                if (curKey === null) {
                    return fail('missing <key>');
                }
                cur[curKey] = val;
                curKey = null;
            }
            else if (state === 2 /* State.ARR_STATE */) {
                cur.push(val);
            }
            else { // ROOT_STATE
                cur = val;
            }
        }
        function acceptData(val) {
            if (state === 1 /* State.DICT_STATE */) {
                if (curKey === null) {
                    return fail('missing <key>');
                }
                cur[curKey] = val;
                curKey = null;
            }
            else if (state === 2 /* State.ARR_STATE */) {
                cur.push(val);
            }
            else { // ROOT_STATE
                cur = val;
            }
        }
        function acceptBool(val) {
            if (state === 1 /* State.DICT_STATE */) {
                if (curKey === null) {
                    return fail('missing <key>');
                }
                cur[curKey] = val;
                curKey = null;
            }
            else if (state === 2 /* State.ARR_STATE */) {
                cur.push(val);
            }
            else { // ROOT_STATE
                cur = val;
            }
        }
        function escapeVal(str) {
            return str.replace(/&#([0-9]+);/g, function (_, m0) {
                return String.fromCodePoint(parseInt(m0, 10));
            }).replace(/&#x([0-9a-f]+);/g, function (_, m0) {
                return String.fromCodePoint(parseInt(m0, 16));
            }).replace(/&amp;|&lt;|&gt;|&quot;|&apos;/g, function (_) {
                switch (_) {
                    case '&amp;': return '&';
                    case '&lt;': return '<';
                    case '&gt;': return '>';
                    case '&quot;': return '"';
                    case '&apos;': return '\'';
                }
                return _;
            });
        }
        function parseOpenTag() {
            let r = captureUntil('>');
            let isClosed = false;
            if (r.charCodeAt(r.length - 1) === 47 /* ChCode.SLASH */) {
                isClosed = true;
                r = r.substring(0, r.length - 1);
            }
            return {
                name: r.trim(),
                isClosed: isClosed
            };
        }
        function parseTagValue(tag) {
            if (tag.isClosed) {
                return '';
            }
            const val = captureUntil('</');
            advanceUntil('>');
            return escapeVal(val);
        }
        while (pos < len) {
            skipWhitespace();
            if (pos >= len) {
                break;
            }
            const chCode = content.charCodeAt(pos);
            advancePosBy(1);
            if (chCode !== 60 /* ChCode.LESS_THAN */) {
                return fail('expected <');
            }
            if (pos >= len) {
                return fail('unexpected end of input');
            }
            const peekChCode = content.charCodeAt(pos);
            if (peekChCode === 63 /* ChCode.QUESTION_MARK */) {
                advancePosBy(1);
                advanceUntil('?>');
                continue;
            }
            if (peekChCode === 33 /* ChCode.EXCLAMATION_MARK */) {
                advancePosBy(1);
                if (advanceIfStartsWith('--')) {
                    advanceUntil('-->');
                    continue;
                }
                advanceUntil('>');
                continue;
            }
            if (peekChCode === 47 /* ChCode.SLASH */) {
                advancePosBy(1);
                skipWhitespace();
                if (advanceIfStartsWith('plist')) {
                    advanceUntil('>');
                    continue;
                }
                if (advanceIfStartsWith('dict')) {
                    advanceUntil('>');
                    leaveDict();
                    continue;
                }
                if (advanceIfStartsWith('array')) {
                    advanceUntil('>');
                    leaveArray();
                    continue;
                }
                return fail('unexpected closed tag');
            }
            const tag = parseOpenTag();
            switch (tag.name) {
                case 'dict':
                    enterDict();
                    if (tag.isClosed) {
                        leaveDict();
                    }
                    continue;
                case 'array':
                    enterArray();
                    if (tag.isClosed) {
                        leaveArray();
                    }
                    continue;
                case 'key':
                    acceptKey(parseTagValue(tag));
                    continue;
                case 'string':
                    acceptString(parseTagValue(tag));
                    continue;
                case 'real':
                    acceptReal(parseFloat(parseTagValue(tag)));
                    continue;
                case 'integer':
                    acceptInteger(parseInt(parseTagValue(tag), 10));
                    continue;
                case 'date':
                    acceptDate(new Date(parseTagValue(tag)));
                    continue;
                case 'data':
                    acceptData(parseTagValue(tag));
                    continue;
                case 'true':
                    parseTagValue(tag);
                    acceptBool(true);
                    continue;
                case 'false':
                    parseTagValue(tag);
                    acceptBool(false);
                    continue;
            }
            if (/^plist/.test(tag.name)) {
                continue;
            }
            return fail('unexpected opened tag ' + tag.name);
        }
        return cur;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxpc3RQYXJzZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdGhlbWVzL2NvbW1vbi9wbGlzdFBhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFFaEcsSUFBVyxNQWFWO0lBYkQsV0FBVyxNQUFNO1FBQ2hCLHFDQUFXLENBQUE7UUFFWCxzQ0FBVSxDQUFBO1FBQ1YsaUNBQU8sQ0FBQTtRQUNQLDBEQUFvQixDQUFBO1FBQ3BCLDhDQUFjLENBQUE7UUFFZCxzQ0FBVSxDQUFBO1FBRVYsOENBQWMsQ0FBQTtRQUNkLHNEQUFrQixDQUFBO1FBQ2xCLDREQUFxQixDQUFBO0lBQ3RCLENBQUMsRUFiVSxNQUFNLEtBQU4sTUFBTSxRQWFoQjtJQUVELElBQVcsS0FJVjtJQUpELFdBQVcsS0FBSztRQUNmLDZDQUFjLENBQUE7UUFDZCw2Q0FBYyxDQUFBO1FBQ2QsMkNBQWEsQ0FBQTtJQUNkLENBQUMsRUFKVSxLQUFLLEtBQUwsS0FBSyxRQUlmO0lBQ0Q7O09BRUc7SUFDSCxTQUFnQixLQUFLLENBQUMsT0FBZTtRQUNwQyxPQUFPLE1BQU0sQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFGRCxzQkFFQztJQUVELFNBQVMsTUFBTSxDQUFDLE9BQWUsRUFBRSxRQUF1QixFQUFFLGVBQThCO1FBQ3ZGLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFFM0IsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQ1osSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ2IsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBRWIsZ0JBQWdCO1FBQ2hCLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQywyQkFBZSxFQUFFO1lB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