/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/characterClassifier"], function (require, exports, characterClassifier_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.computeLinks = exports.LinkComputer = exports.StateMachine = exports.State = void 0;
    var State;
    (function (State) {
        State[State["Invalid"] = 0] = "Invalid";
        State[State["Start"] = 1] = "Start";
        State[State["H"] = 2] = "H";
        State[State["HT"] = 3] = "HT";
        State[State["HTT"] = 4] = "HTT";
        State[State["HTTP"] = 5] = "HTTP";
        State[State["F"] = 6] = "F";
        State[State["FI"] = 7] = "FI";
        State[State["FIL"] = 8] = "FIL";
        State[State["BeforeColon"] = 9] = "BeforeColon";
        State[State["AfterColon"] = 10] = "AfterColon";
        State[State["AlmostThere"] = 11] = "AlmostThere";
        State[State["End"] = 12] = "End";
        State[State["Accept"] = 13] = "Accept";
        State[State["LastKnownState"] = 14] = "LastKnownState"; // marker, custom states may follow
    })(State || (exports.State = State = {}));
    class Uint8Matrix {
        constructor(rows, cols, defaultValue) {
            const data = new Uint8Array(rows * cols);
            for (let i = 0, len = rows * cols; i < len; i++) {
                data[i] = defaultValue;
            }
            this._data = data;
            this.rows = rows;
            this.cols = cols;
        }
        get(row, col) {
            return this._data[row * this.cols + col];
        }
        set(row, col, value) {
            this._data[row * this.cols + col] = value;
        }
    }
    class StateMachine {
        constructor(edges) {
            let maxCharCode = 0;
            let maxState = 0 /* State.Invalid */;
            for (let i = 0, len = edges.length; i < len; i++) {
                const [from, chCode, to] = edges[i];
                if (chCode > maxCharCode) {
                    maxCharCode = chCode;
                }
                if (from > maxState) {
                    maxState = from;
                }
                if (to > maxState) {
                    maxState = to;
                }
            }
            maxCharCode++;
            maxState++;
            const states = new Uint8Matrix(maxState, maxCharCode, 0 /* State.Invalid */);
            for (let i = 0, len = edges.length; i < len; i++) {
                const [from, chCode, to] = edges[i];
                states.set(from, chCode, to);
            }
            this._states = states;
            this._maxCharCode = maxCharCode;
        }
        nextState(currentState, chCode) {
            if (chCode < 0 || chCode >= this._maxCharCode) {
                return 0 /* State.Invalid */;
            }
            return this._states.get(currentState, chCode);
        }
    }
    exports.StateMachine = StateMachine;
    // State machine for http:// or https:// or file://
    let _stateMachine = null;
    function getStateMachine() {
        if (_stateMachine === null) {
            _stateMachine = new StateMachine([
                [1 /* State.Start */, 104 /* CharCode.h */, 2 /* State.H */],
                [1 /* State.Start */, 72 /* CharCode.H */, 2 /* State.H */],
                [1 /* State.Start */, 102 /* CharCode.f */, 6 /* State.F */],
                [1 /* State.Start */, 70 /* CharCode.F */, 6 /* State.F */],
                [2 /* State.H */, 116 /* CharCode.t */, 3 /* State.HT */],
                [2 /* State.H */, 84 /* CharCode.T */, 3 /* State.HT */],
                [3 /* State.HT */, 116 /* CharCode.t */, 4 /* State.HTT */],
                [3 /* State.HT */, 84 /* CharCode.T */, 4 /* State.HTT */],
                [4 /* State.HTT */, 112 /* CharCode.p */, 5 /* State.HTTP */],
                [4 /* State.HTT */, 80 /* CharCode.P */, 5 /* State.HTTP */],
                [5 /* State.HTTP */, 115 /* CharCode.s */, 9 /* State.BeforeColon */],
                [5 /* State.HTTP */, 83 /* CharCode.S */, 9 /* State.BeforeColon */],
                [5 /* State.HTTP */, 58 /* CharCode.Colon */, 10 /* State.AfterColon */],
                [6 /* State.F */, 105 /* CharCode.i */, 7 /* State.FI */],
                [6 /* State.F */, 73 /* CharCode.I */, 7 /* State.FI */],
                [7 /* State.FI */, 108 /* CharCode.l */, 8 /* State.FIL */],
                [7 /* State.FI */, 76 /* CharCode.L */, 8 /* State.FIL */],
                [8 /* State.FIL */, 101 /* CharCode.e */, 9 /* State.BeforeColon */],
                [8 /* State.FIL */, 69 /* CharCode.E */, 9 /* State.BeforeColon */],
                [9 /* State.BeforeColon */, 58 /* CharCode.Colon */, 10 /* State.AfterColon */],
                [10 /* State.AfterColon */, 47 /* CharCode.Slash */, 11 /* State.AlmostThere */],
                [11 /* State.AlmostThere */, 47 /* CharCode.Slash */, 12 /* State.End */],
            ]);
        }
        return _stateMachine;
    }
    var CharacterClass;
    (function (CharacterClass) {
        CharacterClass[CharacterClass["None"] = 0] = "None";
        CharacterClass[CharacterClass["ForceTermination"] = 1] = "ForceTermination";
        CharacterClass[CharacterClass["CannotEndIn"] = 2] = "CannotEndIn";
    })(CharacterClass || (CharacterClass = {}));
    let _classifier = null;
    function getClassifier() {
        if (_classifier === null) {
            _classifier = new characterClassifier_1.CharacterClassifier(0 /* CharacterClass.None */);
            // allow-any-unicode-next-line
            const FORCE_TERMINATION_CHARACTERS = ' \t<>\'\"、。｡､，．：；‘〈「『〔（［｛｢｣｝］）〕』」〉’｀～…';
            for (let i = 0; i < FORCE_TERMINATION_CHARACTERS.length; i++) {
                _classifier.set(FORCE_TERMINATION_CHARACTERS.charCodeAt(i), 1 /* CharacterClass.ForceTermination */);
            }
            const CANNOT_END_WITH_CHARACTERS = '.,;:';
            for (let i = 0; i < CANNOT_END_WITH_CHARACTERS.length; i++) {
                _classifier.set(CANNOT_END_WITH_CHARACTERS.charCodeAt(i), 2 /* CharacterClass.CannotEndIn */);
            }
        }
        return _classifier;
    }
    class LinkComputer {
        static _createLink(classifier, line, lineNumber, linkBeginIndex, linkEndIndex) {
            // Do not allow to end link in certain characters...
            let lastIncludedCharIndex = linkEndIndex - 1;
            do {
                const chCode = line.charCodeAt(lastIncludedCharIndex);
                const chClass = classifier.get(chCode);
                if (chClass !== 2 /* CharacterClass.CannotEndIn */) {
                    break;
                }
                lastIncludedCharIndex--;
            } while (lastIncludedCharIndex > linkBeginIndex);
            // Handle links enclosed in parens, square brackets and curlys.
            if (linkBeginIndex > 0) {
                const charCodeBeforeLink = line.charCodeAt(linkBeginIndex - 1);
                const lastCharCodeInLink = line.charCodeAt(lastIncludedCharIndex);
                if ((charCodeBeforeLink === 40 /* CharCode.OpenParen */ && lastCharCodeInLink === 41 /* CharCode.CloseParen */)
                    || (charCodeBeforeLink === 91 /* CharCode.OpenSquareBracket */ && lastCharCodeInLink === 93 /* CharCode.CloseSquareBracket */)
                    || (charCodeBeforeLink === 123 /* CharCode.OpenCurlyBrace */ && lastCharCodeInLink === 125 /* CharCode.CloseCurlyBrace */)) {
                    // Do not end in ) if ( is before the link start
                    // Do not end in ] if [ is before the link start
                    // Do not end in } if { is before the link start
                    lastIncludedCharIndex--;
                }
            }
            return {
                range: {
                    startLineNumber: lineNumber,
                    startColumn: linkBeginIndex + 1,
                    endLineNumber: lineNumber,
                    endColumn: lastIncludedCharIndex + 2
                },
                url: line.substring(linkBeginIndex, lastIncludedCharIndex + 1)
            };
        }
        static computeLinks(model, stateMachine = getStateMachine()) {
            const classifier = getClassifier();
            const result = [];
            for (let i = 1, lineCount = model.getLineCount(); i <= lineCount; i++) {
                const line = model.getLineContent(i);
                const len = line.length;
                let j = 0;
                let linkBeginIndex = 0;
                let linkBeginChCode = 0;
                let state = 1 /* State.Start */;
                let hasOpenParens = false;
                let hasOpenSquareBracket = false;
                let inSquareBrackets = false;
                let hasOpenCurlyBracket = false;
                while (j < len) {
                    let resetStateMachine = false;
                    const chCode = line.charCodeAt(j);
                    if (state === 13 /* State.Accept */) {
                        let chClass;
                        switch (chCode) {
                            case 40 /* CharCode.OpenParen */:
                                hasOpenParens = true;
                                chClass = 0 /* CharacterClass.None */;
                                break;
                            case 41 /* CharCode.CloseParen */:
                                chClass = (hasOpenParens ? 0 /* CharacterClass.None */ : 1 /* CharacterClass.ForceTermination */);
                                break;
                            case 91 /* CharCode.OpenSquareBracket */:
                                inSquareBrackets = true;
                                hasOpenSquareBracket = true;
                                chClass = 0 /* CharacterClass.None */;
                                break;
                            case 93 /* CharCode.CloseSquareBracket */:
                                inSquareBrackets = false;
                                chClass = (hasOpenSquareBracket ? 0 /* CharacterClass.None */ : 1 /* CharacterClass.ForceTermination */);
                                break;
                            case 123 /* CharCode.OpenCurlyBrace */:
                                hasOpenCurlyBracket = true;
                                chClass = 0 /* CharacterClass.None */;
                                break;
                            case 125 /* CharCode.CloseCurlyBrace */:
                                chClass = (hasOpenCurlyBracket ? 0 /* CharacterClass.None */ : 1 /* CharacterClass.ForceTermination */);
                                break;
                            // The following three rules make it that ' or " or ` are allowed inside links
                            // only if the link is wrapped by some other quote character
                            case 39 /* CharCode.SingleQuote */:
                            case 34 /* CharCode.DoubleQuote */:
                            case 96 /* CharCode.BackTick */:
                                if (linkBeginChCode === chCode) {
                                    chClass = 1 /* CharacterClass.ForceTermination */;
                                }
                                else if (linkBeginChCode === 39 /* CharCode.SingleQuote */ || linkBeginChCode === 34 /* CharCode.DoubleQuote */ || linkBeginChCode === 96 /* CharCode.BackTick */) {
                                    chClass = 0 /* CharacterClass.None */;
                                }
                                else {
                                    chClass = 1 /* CharacterClass.ForceTermination */;
                                }
                                break;
                            case 42 /* CharCode.Asterisk */:
                                // `*` terminates a link if the link began with `*`
                                chClass = (linkBeginChCode === 42 /* CharCode.Asterisk */) ? 1 /* CharacterClass.ForceTermination */ : 0 /* CharacterClass.None */;
                                break;
                            case 124 /* CharCode.Pipe */:
                                // `|` terminates a link if the link began with `|`
                                chClass = (linkBeginChCode === 124 /* CharCode.Pipe */) ? 1 /* CharacterClass.ForceTermination */ : 0 /* CharacterClass.None */;
                                break;
                            case 32 /* CharCode.Space */:
                                // ` ` allow space in between [ and ]
                                chClass = (inSquareBrackets ? 0 /* CharacterClass.None */ : 1 /* CharacterClass.ForceTermination */);
                                break;
                            default:
                                chClass = classifier.get(chCode);
                        }
                        // Check if character terminates link
                        if (chClass === 1 /* CharacterClass.ForceTermination */) {
                            result.push(LinkComputer._createLink(classifier, line, i, linkBeginIndex, j));
                            resetStateMachine = true;
                        }
                    }
                    else if (state === 12 /* State.End */) {
                        let chClass;
                        if (chCode === 91 /* CharCode.OpenSquareBracket */) {
                            // Allow for the authority part to contain ipv6 addresses which contain [ and ]
                            hasOpenSquareBracket = true;
                            chClass = 0 /* CharacterClass.None */;
                        }
                        else {
                            chClass = classifier.get(chCode);
                        }
                        // Check if character terminates link
                        if (chClass === 1 /* CharacterClass.ForceTermination */) {
                            resetStateMachine = true;
                        }
                        else {
                            state = 13 /* State.Accept */;
                        }
                    }
                    else {
                        state = stateMachine.nextState(state, chCode);
                        if (state === 0 /* State.Invalid */) {
                            resetStateMachine = true;
                        }
                    }
                    if (resetStateMachine) {
                        state = 1 /* State.Start */;
                        hasOpenParens = false;
                        hasOpenSquareBracket = false;
                        hasOpenCurlyBracket = false;
                        // Record where the link started
                        linkBeginIndex = j + 1;
                        linkBeginChCode = chCode;
                    }
                    j++;
                }
                if (state === 13 /* State.Accept */) {
                    result.push(LinkComputer._createLink(classifier, line, i, linkBeginIndex, len));
                }
            }
            return result;
        }
    }
    exports.LinkComputer = LinkComputer;
    /**
     * Returns an array of all links contains in the provided
     * document. *Note* that this operation is computational
     * expensive and should not run in the UI thread.
     */
    function computeLinks(model) {
        if (!model || typeof model.getLineCount !== 'function' || typeof model.getLineContent !== 'function') {
            // Unknown caller!
            return [];
        }
        return LinkComputer.computeLinks(model);
    }
    exports.computeLinks = computeLinks;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlua0NvbXB1dGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9sYW5ndWFnZXMvbGlua0NvbXB1dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVdoRyxJQUFrQixLQWdCakI7SUFoQkQsV0FBa0IsS0FBSztRQUN0Qix1Q0FBVyxDQUFBO1FBQ1gsbUNBQVMsQ0FBQTtRQUNULDJCQUFLLENBQUE7UUFDTCw2QkFBTSxDQUFBO1FBQ04sK0JBQU8sQ0FBQTtRQUNQLGlDQUFRLENBQUE7UUFDUiwyQkFBSyxDQUFBO1FBQ0wsNkJBQU0sQ0FBQTtRQUNOLCtCQUFPLENBQUE7UUFDUCwrQ0FBZSxDQUFBO1FBQ2YsOENBQWUsQ0FBQTtRQUNmLGdEQUFnQixDQUFBO1FBQ2hCLGdDQUFRLENBQUE7UUFDUixzQ0FBVyxDQUFBO1FBQ1gsc0RBQW1CLENBQUEsQ0FBQyxtQ0FBbUM7SUFDeEQsQ0FBQyxFQWhCaUIsS0FBSyxxQkFBTCxLQUFLLFFBZ0J0QjtJQUlELE1BQU0sV0FBVztRQU1oQixZQUFZLElBQVksRUFBRSxJQUFZLEVBQUUsWUFBb0I7WUFDM0QsTUFBTSxJQUFJLEdBQUcsSUFBSSxVQUFVLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDO1lBQ3pDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxJQUFJLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2hELElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUM7YUFDdkI7WUFFRCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztZQUNsQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztZQUNqQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNsQixDQUFDO1FBRU0s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