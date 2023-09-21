/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/async", "vs/base/common/color", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/platform/configuration/common/configuration", "vs/platform/telemetry/common/telemetry", "vs/workbench/contrib/terminal/common/terminal"], function (require, exports, async_1, color_1, decorators_1, event_1, lifecycle_1, strings_1, configuration_1, telemetry_1, terminal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TypeAheadAddon = exports.CharPredictState = exports.PredictionTimeline = exports.PredictionStats = void 0;
    var VT;
    (function (VT) {
        VT["Esc"] = "\u001B";
        VT["Csi"] = "\u001B[";
        VT["ShowCursor"] = "\u001B[?25h";
        VT["HideCursor"] = "\u001B[?25l";
        VT["DeleteChar"] = "\u001B[X";
        VT["DeleteRestOfLine"] = "\u001B[K";
    })(VT || (VT = {}));
    const CSI_STYLE_RE = /^\x1b\[[0-9;]*m/;
    const CSI_MOVE_RE = /^\x1b\[?([0-9]*)(;[35])?O?([DC])/;
    const NOT_WORD_RE = /[^a-z0-9]/i;
    var StatsConstants;
    (function (StatsConstants) {
        StatsConstants[StatsConstants["StatsBufferSize"] = 24] = "StatsBufferSize";
        StatsConstants[StatsConstants["StatsSendTelemetryEvery"] = 300000] = "StatsSendTelemetryEvery";
        StatsConstants[StatsConstants["StatsMinSamplesToTurnOn"] = 5] = "StatsMinSamplesToTurnOn";
        StatsConstants[StatsConstants["StatsMinAccuracyToTurnOn"] = 0.3] = "StatsMinAccuracyToTurnOn";
        StatsConstants[StatsConstants["StatsToggleOffThreshold"] = 0.5] = "StatsToggleOffThreshold";
    })(StatsConstants || (StatsConstants = {}));
    /**
     * Codes that should be omitted from sending to the prediction engine and instead omitted directly:
     * - Hide cursor (DECTCEM): We wrap the local echo sequence in hide and show
     *   CSI ? 2 5 l
     * - Show cursor (DECTCEM): We wrap the local echo sequence in hide and show
     *   CSI ? 2 5 h
     * - Device Status Report (DSR): These sequence fire report events from xterm which could cause
     *   double reporting and potentially a stack overflow (#119472)
     *   CSI Ps n
     *   CSI ? Ps n
     */
    const PREDICTION_OMIT_RE = /^(\x1b\[(\??25[hl]|\??[0-9;]+n))+/;
    const core = (terminal) => terminal._core;
    const flushOutput = (terminal) => {
        // TODO: Flushing output is not possible anymore without async
    };
    var CursorMoveDirection;
    (function (CursorMoveDirection) {
        CursorMoveDirection["Back"] = "D";
        CursorMoveDirection["Forwards"] = "C";
    })(CursorMoveDirection || (CursorMoveDirection = {}));
    class Cursor {
        get x() {
            return this._x;
        }
        get y() {
            return this._y;
        }
        get baseY() {
            return this._baseY;
        }
        get coordinate() {
            return { x: this._x, y: this._y, baseY: this._baseY };
        }
        constructor(rows, cols, _buffer) {
            this.rows = rows;
            this.cols = cols;
            this._buffer = _buffer;
            this._x = 0;
            this._y = 1;
            this._baseY = 1;
            this._x = _buffer.cursorX;
            this._y = _buffer.cursorY;
            this._baseY = _buffer.baseY;
        }
        getLine() {
            return this._buffer.getLine(this._y + this._baseY);
        }
        getCell(loadInto) {
            return this.getLine()?.getCell(this._x, loadInto);
        }
        moveTo(coordinate) {
            this._x = coordinate.x;
            this._y = (coordinate.y + coordinate.baseY) - this._baseY;
            return this.moveInstruction();
        }
        clone() {
            const c = new Cursor(this.rows, this.cols, this._buffer);
            c.moveTo(this);
            return c;
        }
        move(x, y) {
            this._x = x;
            this._y = y;
            return this.moveInstruction();
        }
        shift(x = 0, y = 0) {
            this._x += x;
            this._y += y;
            return this.moveInstruction();
        }
        moveInstruction() {
            if (this._y >= this.rows) {
                this._baseY += this._y - (this.rows - 1);
                this._y = this.rows - 1;
            }
            else if (this._y < 0) {
                this._baseY -= this._y;
                this._y = 0;
            }
            return `${"\u001B[" /* VT.Csi */}${this._y + 1};${this._x + 1}H`;
        }
    }
    const moveToWordBoundary = (b, cursor, direction) => {
        let ateLeadingWhitespace = false;
        if (direction < 0) {
            cursor.shift(-1);
        }
        let cell;
        while (cursor.x >= 0) {
            cell = cursor.getCell(cell);
            if (!cell?.getCode()) {
                return;
            }
            const chars = cell.getChars();
            if (NOT_WORD_RE.test(chars)) {
                if (ateLeadingWhitespace) {
                    break;
                }
            }
            else {
                ateLeadingWhitespace = true;
            }
            cursor.shift(direction);
        }
        if (direction < 0) {
            cursor.shift(1); // we want to place the cursor after the whitespace starting the word
        }
    };
    var MatchResult;
    (function (MatchResult) {
        /** matched successfully */
        MatchResult[MatchResult["Success"] = 0] = "Success";
        /** failed to match */
        MatchResult[MatchResult["Failure"] = 1] = "Failure";
        /** buffer data, it might match in the future one more data comes in */
        MatchResult[MatchResult["Buffer"] = 2] = "Buffer";
    })(MatchResult || (MatchResult = {}));
    class StringReader {
        get remaining() {
            return this._input.length - this.index;
        }
        get eof() {
            return this.index === this._input.length;
        }
        get rest() {
            return this._input.slice(this.index);
        }
        constructor(_input) {
            this._input = _input;
            this.index = 0;
        }
        /**
         * Advances the reader and returns the character if it matches.
         */
        eatChar(char) {
            if (this._input[this.index] !== char) {
                return;
            }
            this.index++;
            return char;
        }
        /**
         * Advances the reader and returns the string if it matches.
         */
        eatStr(substr) {
            if (this._input.slice(this.index, substr.length) !== substr) {
                return;
            }
            this.index += substr.length;
            return substr;
        }
        /**
         * Matches and eats the substring character-by-character. If EOF is reached
         * before the substring is consumed, it will buffer. Index is not moved
         * if it's not a match.
         */
        eatGradually(substr) {
            const prevIndex = this.index;
            for (let i = 0; i < substr.length; i++) {
                if (i > 0 && this.eof) {
                    return 2 /* MatchResult.Buffer */;
                }
                if (!this.eatChar(substr[i])) {
                    this.index = prevIndex;
                    return 1 /* MatchResult.Failure */;
                }
            }
            return 0 /* MatchResult.Success */;
        }
        /**
         * Advances the reader and returns the regex if it matches.
         */
        eatRe(re) {
            const match = re.exec(this._input.slice(this.index));
            if (!match) {
                return;
            }
            this.index += match[0].length;
            return match;
        }
        /**
         * Advances the reader and returns the character if the code matches.
         */
        eatCharCode(min = 0, max = min + 1) {
            const code = this._input.charCodeAt(this.index);
            if (code < min || code >= max) {
                return undefined;
            }
            this.index++;
            return code;
        }
    }
    /**
     * Preidction which never tests true. Will always discard predictions made
     * after it.
     */
    class HardBoundary {
        constructor() {
            this.clearAfterTimeout = false;
        }
        apply() {
            return '';
        }
        rollback() {
            return '';
        }
        rollForwards() {
            return '';
        }
        matches() {
            return 1 /* MatchResult.Failure */;
        }
    }
    /**
     * Wraps another prediction. Does not apply the prediction, but will pass
     * through its `matches` request.
     */
    class TentativeBoundary {
        constructor(inner) {
            this.inner = inner;
        }
        apply(buffer, cursor) {
            this._appliedCursor = cursor.clone();
            this.inner.apply(buffer, this._appliedCursor);
            return '';
        }
        rollback(cursor) {
            this.inner.rollback(cursor.clone());
            return '';
        }
        rollForwards(cursor, withInput) {
            if (this._appliedCursor) {
                cursor.moveTo(this._appliedCursor);
            }
            return withInput;
        }
        matches(input) {
            return this.inner.matches(input);
        }
    }
    const isTenativeCharacterPrediction = (p) => p instanceof TentativeBoundary && p.inner instanceof CharacterPrediction;
    /**
     * Prediction for a single alphanumeric character.
     */
    class CharacterPrediction {
        constructor(_style, _char) {
            this._style = _style;
            this._char = _char;
            this.affectsStyle = true;
        }
        apply(_, cursor) {
            const cell = cursor.getCell();
            this.appliedAt = cell
                ? { pos: cursor.coordinate, oldAttributes: attributesToSeq(cell), oldChar: cell.getChars() }
                : { pos: cursor.coordinate, oldAttributes: '', oldChar: '' };
            cursor.shift(1);
            return this._style.apply + this._char + this._style.undo;
        }
        rollback(cursor) {
            if (!this.appliedAt) {
                return ''; // not applied
            }
            const { oldAttributes, oldChar, pos } = this.appliedAt;
            const r = cursor.moveTo(pos) + (oldChar ? `${oldAttributes}${oldChar}${cursor.moveTo(pos)}` : "\u001B[X" /* VT.DeleteChar */);
            return r;
        }
        rollForwards(cursor, input) {
            if (!this.appliedAt) {
                return ''; // not applied
            }
            return cursor.clone().moveTo(this.appliedAt.pos) + input;
        }
        matches(input, lookBehind) {
            const startIndex = input.index;
            // remove any styling CSI before checking the char
            while (input.eatRe(CSI_STYLE_RE)) { }
            if (input.eof) {
                return 2 /* MatchResult.Buffer */;
            }
            if (input.eatChar(this._char)) {
                return 0 /* MatchResult.Success */;
            }
            if (lookBehind instanceof CharacterPrediction) {
                // see #112842
                const sillyZshOutcome = input.eatGradually(`\b${lookBehind._char}${this._char}`);
                if (sillyZshOutcome !== 1 /* MatchResult.Failure */) {
                    return sillyZshOutcome;
                }
            }
            input.index = startIndex;
            return 1 /* MatchResult.Failure */;
        }
    }
    class BackspacePrediction {
        constructor(_terminal) {
            this._terminal = _terminal;
        }
        apply(_, cursor) {
            // at eol if everything to the right is whitespace (zsh will emit a "clear line" code in this case)
            // todo: can be optimized if `getTrimmedLength` is exposed from xterm
            const isLastChar = !cursor.getLine()?.translateToString(undefined, cursor.x).trim();
            const pos = cursor.coordinate;
            const move = cursor.shift(-1);
            const cell = cursor.getCell();
            this._appliedAt = cell
                ? { isLastChar, pos, oldAttributes: attributesToSeq(cell), oldChar: cell.getChars() }
                : { isLastChar, pos, oldAttributes: '', oldChar: '' };
            return move + "\u001B[X" /* VT.DeleteChar */;
        }
        rollback(cursor) {
            if (!this._appliedAt) {
                return ''; // not applied
            }
            const { oldAttributes, oldChar, pos } = this._appliedAt;
            if (!oldChar) {
                return cursor.moveTo(pos) + "\u001B[X" /* VT.DeleteChar */;
            }
            return oldAttributes + oldChar + cursor.moveTo(pos) + attributesToSeq(core(this._terminal)._inputHandler._curAttrData);
        }
        rollForwards() {
            return '';
        }
        matches(input) {
            if (this._appliedAt?.isLastChar) {
                const r1 = input.eatGradually(`\b${"\u001B[" /* VT.Csi */}K`);
                if (r1 !== 1 /* MatchResult.Failure */) {
                    return r1;
                }
                const r2 = input.eatGradually(`\b \b`);
                if (r2 !== 1 /* MatchResult.Failure */) {
                    return r2;
                }
            }
            return 1 /* MatchResult.Failure */;
        }
    }
    class NewlinePrediction {
        apply(_, cursor) {
            this._prevPosition = cursor.coordinate;
            cursor.move(0, cursor.y + 1);
            return '\r\n';
        }
        rollback(cursor) {
            return this._prevPosition ? cursor.moveTo(this._prevPosition) : '';
        }
        rollForwards() {
            return ''; // does not need to rewrite
        }
        matches(input) {
            return input.eatGradually('\r\n');
        }
    }
    /**
     * Prediction when the cursor reaches the end of the line. Similar to newline
     * prediction, but shells handle it slightly differently.
     */
    class LinewrapPrediction extends NewlinePrediction {
        apply(_, cursor) {
            this._prevPosition = cursor.coordinate;
            cursor.move(0, cursor.y + 1);
            return ' \r';
        }
        matches(input) {
            // bash and zshell add a space which wraps in the terminal, then a CR
            const r = input.eatGradually(' \r');
            if (r !== 1 /* MatchResult.Failure */) {
                // zshell additionally adds a clear line after wrapping to be safe -- eat it
                const r2 = input.eatGradually("\u001B[K" /* VT.DeleteRestOfLine */);
                return r2 === 2 /* MatchResult.Buffer */ ? 2 /* MatchResult.Buffer */ : r;
            }
            return input.eatGradually('\r\n');
        }
    }
    class CursorMovePrediction {
        constructor(_direction, _moveByWords, _amount) {
            this._direction = _direction;
            this._moveByWords = _moveByWords;
            this._amount = _amount;
        }
        apply(buffer, cursor) {
            const prevPosition = cursor.x;
            const currentCell = cursor.getCell();
            const prevAttrs = currentCell ? attributesToSeq(currentCell) : '';
            const { _amount: amount, _direction: direction, _moveByWords: moveByWords } = this;
            const delta = direction === "D" /* CursorMoveDirection.Back */ ? -1 : 1;
            const target = cursor.clone();
            if (moveByWords) {
                for (let i = 0; i < amount; i++) {
                    moveToWordBoundary(buffer, target, delta);
                }
            }
            else {
                target.shift(delta * amount);
            }
            this._applied = {
                amount: Math.abs(cursor.x - target.x),
                prevPosition,
                prevAttrs,
                rollForward: cursor.moveTo(target),
            };
            return this._applied.rollForward;
        }
        rollback(cursor) {
            if (!this._applied) {
                return '';
            }
            return cursor.move(this._applied.prevPosition, cursor.y) + this._applied.prevAttrs;
        }
        rollForwards() {
            return ''; // does not need to rewrite
        }
        matches(input) {
            if (!this._applied) {
                return 1 /* MatchResult.Failure */;
            }
            const direction = this._direction;
            const { amount, rollForward } = this._applied;
            // arg can be omitted to move one character. We don't eatGradually() here
            // or below moves that don't go as far as the cursor would be buffered
            // indefinitely
            if (input.eatStr(`${"\u001B[" /* VT.Csi */}${direction}`.repeat(amount))) {
                return 0 /* MatchResult.Success */;
            }
            // \b is the equivalent to moving one character back
            if (direction === "D" /* CursorMoveDirection.Back */) {
                if (input.eatStr(`\b`.repeat(amount))) {
                    return 0 /* MatchResult.Success */;
                }
            }
            // check if the cursor position is set absolutely
            if (rollForward) {
                const r = input.eatGradually(rollForward);
                if (r !== 1 /* MatchResult.Failure */) {
                    return r;
                }
            }
            // check for a relative move in the direction
            return input.eatGradually(`${"\u001B[" /* VT.Csi */}${amount}${direction}`);
        }
    }
    class PredictionStats extends lifecycle_1.Disposable {
        /**
         * Gets the percent (0-1) of predictions that were accurate.
         */
        get accuracy() {
            let correctCount = 0;
            for (const [, correct] of this._stats) {
                if (correct) {
                    correctCount++;
                }
            }
            return correctCount / (this._stats.length || 1);
        }
        /**
         * Gets the number of recorded stats.
         */
        get sampleSize() {
            return this._stats.length;
        }
        /**
         * Gets latency stats of successful predictions.
         */
        get latency() {
            const latencies = this._stats.filter(([, correct]) => correct).map(([s]) => s).sort();
            return {
                count: latencies.length,
                min: latencies[0],
                median: latencies[Math.floor(latencies.length / 2)],
                max: latencies[latencies.length - 1],
            };
        }
        /**
         * Gets the maximum observed latency.
         */
        get maxLatency() {
            let max = -Infinity;
            for (const [latency, correct] of this._stats) {
                if (correct) {
                    max = Math.max(latency, max);
                }
            }
            return max;
        }
        constructor(timeline) {
            super();
            this._stats = [];
            this._index = 0;
            this._addedAtTime = new WeakMap();
            this._changeEmitter = new event_1.Emitter();
            this.onChange = this._changeEmitter.event;
            this._register(timeline.onPredictionAdded(p => this._addedAtTime.set(p, Date.now())));
            this._register(timeline.onPredictionSucceeded(this._pushStat.bind(this, true)));
            this._register(timeline.onPredictionFailed(this._pushStat.bind(this, false)));
        }
        _pushStat(correct, prediction) {
            const started = this._addedAtTime.get(prediction);
            this._stats[this._index] = [Date.now() - started, correct];
            this._index = (this._index + 1) % 24 /* StatsConstants.StatsBufferSize */;
            this._changeEmitter.fire();
        }
    }
    exports.PredictionStats = PredictionStats;
    class PredictionTimeline {
        get _currentGenerationPredictions() {
            return this._expected.filter(({ gen }) => gen === this._expected[0].gen).map(({ p }) => p);
        }
        get isShowingPredictions() {
            return this._showPredictions;
        }
        get length() {
            return this._expected.length;
        }
        constructor(terminal, _style) {
            this.terminal = terminal;
            this._style = _style;
            /**
             * Expected queue of events. Only predictions for the lowest are
             * written into the terminal.
             */
            this._expected = [];
            /**
             * Current prediction generation.
             */
            this._currentGen = 0;
            /**
             * Whether predictions are echoed to the terminal. If false, predictions
             * will still be computed internally for latency metrics, but input will
             * never be adjusted.
             */
            this._showPredictions = false;
            this._addedEmitter = new event_1.Emitter();
            this.onPredictionAdded = this._addedEmitter.event;
            this._failedEmitter = new event_1.Emitter();
            this.onPredictionFailed = this._failedEmitter.event;
            this._succeededEmitter = new event_1.Emitter();
            this.onPredictionSucceeded = this._succeededEmitter.event;
        }
        setShowPredictions(show) {
            if (show === this._showPredictions) {
                return;
            }
            // console.log('set predictions:', show);
            this._showPredictions = show;
            const buffer = this._getActiveBuffer();
            if (!buffer) {
                return;
            }
            const toApply = this._currentGenerationPredictions;
            if (show) {
                this.clearCursor();
                this._style.expectIncomingStyle(toApply.reduce((count, p) => p.affectsStyle ? count + 1 : count, 0));
                this.terminal.write(toApply.map(p => p.apply(buffer, this.physicalCursor(buffer))).join(''));
            }
            else {
                this.terminal.write(toApply.reverse().map(p => p.rollback(this.physicalCursor(buffer))).join(''));
            }
        }
        /**
         * Undoes any predictions written and resets expectations.
         */
        undoAllPredictions() {
            const buffer = this._getActiveBuffer();
            if (this._showPredictions && buffer) {
                this.terminal.write(this._currentGenerationPredictions.reverse()
                    .map(p => p.rollback(this.physicalCursor(buffer))).join(''));
            }
            this._expected = [];
        }
        /**
         * Should be called when input is incoming to the temrinal.
         */
        beforeServerInput(input) {
            const originalInput = input;
            if (this._inputBuffer) {
                input = this._inputBuffer + input;
                this._inputBuffer = undefined;
            }
            if (!this._expected.length) {
                this._clearPredictionState();
                return input;
            }
            const buffer = this._getActiveBuffer();
            if (!buffer) {
                this._clearPredictionState();
                return input;
            }
            let output = '';
            const reader = new StringReader(input);
            const startingGen = this._expected[0].gen;
            const emitPredictionOmitted = () => {
                const omit = reader.eatRe(PREDICTION_OMIT_RE);
                if (omit) {
                    output += omit[0];
                }
            };
            ReadLoop: while (this._expected.length && reader.remaining > 0) {
                emitPredictionOmitted();
                const { p: prediction, gen } = this._expected[0];
                const cursor = this.physicalCursor(buffer);
                const beforeTestReaderIndex = reader.index;
                switch (prediction.matches(reader, this._lookBehind)) {
                    case 0 /* MatchResult.Success */: {
                        // if the input character matches what the next prediction expected, undo
                        // the prediction and write the real character out.
                        const eaten = input.slice(beforeTestReaderIndex, reader.index);
                        if (gen === startingGen) {
                            output += prediction.rollForwards?.(cursor, eaten);
                        }
                        else {
                            prediction.apply(buffer, this.physicalCursor(buffer)); // move cursor for additional apply
                            output += eaten;
                        }
                        this._succeededEmitter.fire(prediction);
                        this._lookBehind = prediction;
                        this._expected.shift();
                        break;
                    }
                    case 2 /* MatchResult.Buffer */:
                        // on a buffer, store the remaining data and completely read data
                        // to be output as normal.
                        this._inputBuffer = input.slice(beforeTestReaderIndex);
                        reader.index = input.length;
                        break ReadLoop;
                    case 1 /* MatchResult.Failure */: {
                        // on a failure, roll back all remaining items in this generation
                        // and clear predictions, since they are no longer valid
                        const rollback = this._expected.filter(p => p.gen === startingGen).reverse();
                        output += rollback.map(({ p }) => p.rollback(this.physicalCursor(buffer))).join('');
                        if (rollback.some(r => r.p.affectsStyle)) {
                            // reading the current style should generally be safe, since predictions
                            // always restore the style if they modify it.
                            output += attributesToSeq(core(this.terminal)._inputHandler._curAttrData);
                        }
                        this._clearPredictionState();
                        this._failedEmitter.fire(prediction);
                        break ReadLoop;
                    }
                }
            }
            emitPredictionOmitted();
            // Extra data (like the result of running a command) should cause us to
            // reset the cursor
            if (!reader.eof) {
                output += reader.rest;
                this._clearPredictionState();
            }
            // If we passed a generation boundary, apply the current generation's predictions
            if (this._expected.length && startingGen !== this._expected[0].gen) {
                for (const { p, gen } of this._expected) {
                    if (gen !== this._expected[0].gen) {
                        break;
                    }
                    if (p.affectsStyle) {
                        this._style.expectIncomingStyle();
                    }
                    output += p.apply(buffer, this.physicalCursor(buffer));
                }
            }
            if (!this._showPredictions) {
                return originalInput;
            }
            if (output.length === 0 || output === input) {
                return output;
            }
            if (this._physicalCursor) {
                output += this._physicalCursor.moveInstruction();
            }
            // prevent cursor flickering while typing
            output = "\u001B[?25l" /* VT.HideCursor */ + output + "\u001B[?25h" /* VT.ShowCursor */;
            return output;
        }
        /**
         * Clears any expected predictions and stored state. Should be called when
         * the pty gives us something we don't recognize.
         */
        _clearPredictionState() {
            this._expected = [];
            this.clearCursor();
            this._lookBehind = undefined;
        }
        /**
         * Appends a typeahead prediction.
         */
        addPrediction(buffer, prediction) {
            this._expected.push({ gen: this._currentGen, p: prediction });
            this._addedEmitter.fire(prediction);
            if (this._currentGen !== this._expected[0].gen) {
                prediction.apply(buffer, this.tentativeCursor(buffer));
                return false;
            }
            const text = prediction.apply(buffer, this.physicalCursor(buffer));
            this._tenativeCursor = undefined; // next read will get or clone the physical cursor
            if (this._showPredictions && text) {
                if (prediction.affectsStyle) {
                    this._style.expectIncomingStyle();
                }
                // console.log('predict:', JSON.stringify(text));
                this.terminal.write(text);
            }
            return true;
        }
        addBoundary(buffer, prediction) {
            let applied = false;
            if (buffer && prediction) {
                // We apply the prediction so that it's matched against, but wrapped
                // in a tentativeboundary so that it doesn't affect the physical cursor.
                // Then we apply it specifically to the tentative cursor.
                applied = this.addPrediction(buffer, new TentativeBoundary(prediction));
                prediction.apply(buffer, this.tentativeCursor(buffer));
            }
            this._currentGen++;
            return applied;
        }
        /**
         * Peeks the last prediction written.
         */
        peekEnd() {
            return this._expected[this._expected.length - 1]?.p;
        }
        /**
         * Peeks the first pending prediction.
         */
        peekStart() {
            return this._expected[0]?.p;
        }
        /**
         * Current position of the cursor in the terminal.
         */
        physicalCursor(buffer) {
            if (!this._physicalCursor) {
                if (this._showPredictions) {
                    flushOutput(this.terminal);
                }
                this._physicalCursor = new Cursor(this.terminal.rows, this.terminal.cols, buffer);
            }
            return this._physicalCursor;
        }
        /**
         * Cursor position if all predictions and boundaries that have been inserted
         * so far turn out to be successfully predicted.
         */
        tentativeCursor(buffer) {
            if (!this._tenativeCursor) {
                this._tenativeCursor = this.physicalCursor(buffer).clone();
            }
            return this._tenativeCursor;
        }
        clearCursor() {
            this._physicalCursor = undefined;
            this._tenativeCursor = undefined;
        }
        _getActiveBuffer() {
            const buffer = this.terminal.buffer.active;
            return buffer.type === 'normal' ? buffer : undefined;
        }
    }
    exports.PredictionTimeline = PredictionTimeline;
    /**
     * Gets the escape sequence args to restore state/appearance in the cell.
     */
    const attributesToArgs = (cell) => {
        if (cell.isAttributeDefault()) {
            return [0];
        }
        const args = [];
        if (cell.isBold()) {
            args.push(1);
        }
        if (cell.isDim()) {
            args.push(2);
        }
        if (cell.isItalic()) {
            args.push(3);
        }
        if (cell.isUnderline()) {
            args.push(4);
        }
        if (cell.isBlink()) {
            args.push(5);
        }
        if (cell.isInverse()) {
            args.push(7);
        }
        if (cell.isInvisible()) {
            args.push(8);
        }
        if (cell.isFgRGB()) {
            args.push(38, 2, cell.getFgColor() >>> 24, (cell.getFgColor() >>> 16) & 0xFF, cell.getFgColor() & 0xFF);
        }
        if (cell.isFgPalette()) {
            args.push(38, 5, cell.getFgColor());
        }
        if (cell.isFgDefault()) {
            args.push(39);
        }
        if (cell.isBgRGB()) {
            args.push(48, 2, cell.getBgColor() >>> 24, (cell.getBgColor() >>> 16) & 0xFF, cell.getBgColor() & 0xFF);
        }
        if (cell.isBgPalette()) {
            args.push(48, 5, cell.getBgColor());
        }
        if (cell.isBgDefault()) {
            args.push(49);
        }
        return args;
    };
    /**
     * Gets the escape sequence to restore state/appearance in the cell.
     */
    const attributesToSeq = (cell) => `${"\u001B[" /* VT.Csi */}${attributesToArgs(cell).join(';')}m`;
    const arrayHasPrefixAt = (a, ai, b) => {
        if (a.length - ai > b.length) {
            return false;
        }
        for (let bi = 0; bi < b.length; bi++, ai++) {
            if (b[ai] !== a[ai]) {
                return false;
            }
        }
        return true;
    };
    /**
     * @see https://github.com/xtermjs/xterm.js/blob/065eb13a9d3145bea687239680ec9696d9112b8e/src/common/InputHandler.ts#L2127
     */
    const getColorWidth = (params, pos) => {
        const accu = [0, 0, -1, 0, 0, 0];
        let cSpace = 0;
        let advance = 0;
        do {
            const v = params[pos + advance];
            accu[advance + cSpace] = typeof v === 'number' ? v : v[0];
            if (typeof v !== 'number') {
                let i = 0;
                do {
                    if (accu[1] === 5) {
                        cSpace = 1;
                    }
                    accu[advance + i + 1 + cSpace] = v[i];
                } while (++i < v.length && i + advance + 1 + cSpace < accu.length);
                break;
            }
            // exit early if can decide color mode with semicolons
            if ((accu[1] === 5 && advance + cSpace >= 2)
                || (accu[1] === 2 && advance + cSpace >= 5)) {
                break;
            }
            // offset colorSpace slot for semicolon mode
            if (accu[1]) {
                cSpace = 1;
            }
        } while (++advance + pos < params.length && advance + cSpace < accu.length);
        return advance;
    };
    class TypeAheadStyle {
        static _compileArgs(args) {
            return `${"\u001B[" /* VT.Csi */}${args.join(';')}m`;
        }
        constructor(value, _terminal) {
            this._terminal = _terminal;
            /**
             * Number of typeahead style arguments we expect to read. If this is 0 and
             * we see a style coming in, we know that the PTY actually wanted to update.
             */
            this._expectedIncomingStyles = 0;
            this.onUpdate(value);
        }
        /**
         * Signals that a style was written to the terminal and we should watch
         * for it coming in.
         */
        expectIncomingStyle(n = 1) {
            this._expectedIncomingStyles += n * 2;
        }
        /**
         * Starts tracking for CSI changes in the terminal.
         */
        startTracking() {
            this._expectedIncomingStyles = 0;
            this._onDidWriteSGR(attributesToArgs(core(this._terminal)._inputHandler._curAttrData));
            this._csiHandler = this._terminal.parser.registerCsiHandler({ final: 'm' }, args => {
                this._onDidWriteSGR(args);
                return false;
            });
        }
        /**
         * Stops tracking terminal CSI changes.
         */
        debounceStopTracking() {
            this._stopTracking();
        }
        /**
         * @inheritdoc
         */
        dispose() {
            this._stopTracking();
        }
        _stopTracking() {
            this._csiHandler?.dispose();
            this._csiHandler = undefined;
        }
        _onDidWriteSGR(args) {
            const originalUndo = this._undoArgs;
            for (let i = 0; i < args.length;) {
                const px = args[i];
                const p = typeof px === 'number' ? px : px[0];
                if (this._expectedIncomingStyles) {
                    if (arrayHasPrefixAt(args, i, this._undoArgs)) {
                        this._expectedIncomingStyles--;
                        i += this._undoArgs.length;
                        continue;
                    }
                    if (arrayHasPrefixAt(args, i, this._applyArgs)) {
                        this._expectedIncomingStyles--;
                        i += this._applyArgs.length;
                        continue;
                    }
                }
                const width = p === 38 || p === 48 || p === 58 ? getColorWidth(args, i) : 1;
                switch (this._applyArgs[0]) {
                    case 1:
                        if (p === 2) {
                            this._undoArgs = [22, 2];
                        }
                        else if (p === 22 || p === 0) {
                            this._undoArgs = [22];
                        }
                        break;
                    case 2:
                        if (p === 1) {
                            this._undoArgs = [22, 1];
                        }
                        else if (p === 22 || p === 0) {
                            this._undoArgs = [22];
                        }
                        break;
                    case 38:
                        if (p === 0 || p === 39 || p === 100) {
                            this._undoArgs = [39];
                        }
                        else if ((p >= 30 && p <= 38) || (p >= 90 && p <= 97)) {
                            this._undoArgs = args.slice(i, i + width);
                        }
                        break;
                    default:
                        if (p === this._applyArgs[0]) {
                            this._undoArgs = this._applyArgs;
                        }
                        else if (p === 0) {
                            this._undoArgs = this._originalUndoArgs;
                        }
                    // no-op
                }
                i += width;
            }
            if (originalUndo !== this._undoArgs) {
                this.undo = TypeAheadStyle._compileArgs(this._undoArgs);
            }
        }
        /**
         * Updates the current typeahead style.
         */
        onUpdate(style) {
            const { applyArgs, undoArgs } = this._getArgs(style);
            this._applyArgs = applyArgs;
            this._undoArgs = this._originalUndoArgs = undoArgs;
            this.apply = TypeAheadStyle._compileArgs(this._applyArgs);
            this.undo = TypeAheadStyle._compileArgs(this._undoArgs);
        }
        _getArgs(style) {
            switch (style) {
                case 'bold':
                    return { applyArgs: [1], undoArgs: [22] };
                case 'dim':
                    return { applyArgs: [2], undoArgs: [22] };
                case 'italic':
                    return { applyArgs: [3], undoArgs: [23] };
                case 'underlined':
                    return { applyArgs: [4], undoArgs: [24] };
                case 'inverted':
                    return { applyArgs: [7], undoArgs: [27] };
                default: {
                    let color;
                    try {
                        color = color_1.Color.fromHex(style);
                    }
                    catch {
                        color = new color_1.Color(new color_1.RGBA(255, 0, 0, 1));
                    }
                    const { r, g, b } = color.rgba;
                    return { applyArgs: [38, 2, r, g, b], undoArgs: [39] };
                }
            }
        }
    }
    __decorate([
        (0, decorators_1.debounce)(2000)
    ], TypeAheadStyle.prototype, "debounceStopTracking", null);
    const compileExcludeRegexp = (programs = terminal_1.DEFAULT_LOCAL_ECHO_EXCLUDE) => new RegExp(`\\b(${programs.map(strings_1.escapeRegExpCharacters).join('|')})\\b`, 'i');
    var CharPredictState;
    (function (CharPredictState) {
        /** No characters typed on this line yet */
        CharPredictState[CharPredictState["Unknown"] = 0] = "Unknown";
        /** Has a pending character prediction */
        CharPredictState[CharPredictState["HasPendingChar"] = 1] = "HasPendingChar";
        /** Character validated on this line */
        CharPredictState[CharPredictState["Validated"] = 2] = "Validated";
    })(CharPredictState || (exports.CharPredictState = CharPredictState = {}));
    let TypeAheadAddon = class TypeAheadAddon extends lifecycle_1.Disposable {
        constructor(_processManager, _configurationService, _telemetryService) {
            super();
            this._processManager = _processManager;
            this._configurationService = _configurationService;
            this._telemetryService = _telemetryService;
            this._typeaheadThreshold = this._configurationService.getValue(terminal_1.TERMINAL_CONFIG_SECTION).localEchoLatencyThreshold;
            this._excludeProgramRe = compileExcludeRegexp(this._configurationService.getValue(terminal_1.TERMINAL_CONFIG_SECTION).localEchoExcludePrograms);
            this._terminalTitle = '';
            this._register((0, lifecycle_1.toDisposable)(() => this._clearPredictionDebounce?.dispose()));
        }
        activate(terminal) {
            const style = this._typeaheadStyle = this._register(new TypeAheadStyle(this._configurationService.getValue(terminal_1.TERMINAL_CONFIG_SECTION).localEchoStyle, terminal));
            const timeline = this._timeline = new PredictionTimeline(terminal, this._typeaheadStyle);
            const stats = this.stats = this._register(new PredictionStats(this._timeline));
            timeline.setShowPredictions(this._typeaheadThreshold === 0);
            this._register(terminal.onData(e => this._onUserData(e)));
            this._register(terminal.onTitleChange(title => {
                this._terminalTitle = title;
                this._reevaluatePredictorState(stats, timeline);
            }));
            this._register(terminal.onResize(() => {
                timeline.setShowPredictions(false);
                timeline.clearCursor();
                this._reevaluatePredictorState(stats, timeline);
            }));
            this._register(this._configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(terminal_1.TERMINAL_CONFIG_SECTION)) {
                    style.onUpdate(this._configurationService.getValue(terminal_1.TERMINAL_CONFIG_SECTION).localEchoStyle);
                    this._typeaheadThreshold = this._configurationService.getValue(terminal_1.TERMINAL_CONFIG_SECTION).localEchoLatencyThreshold;
                    this._excludeProgramRe = compileExcludeRegexp(this._configurationService.getValue(terminal_1.TERMINAL_CONFIG_SECTION).localEchoExcludePrograms);
                    this._reevaluatePredictorState(stats, timeline);
                }
            }));
            this._register(this._timeline.onPredictionSucceeded(p => {
                if (this._lastRow?.charState === 1 /* CharPredictState.HasPendingChar */ && isTenativeCharacterPrediction(p) && p.inner.appliedAt) {
                    if (p.inner.appliedAt.pos.y + p.inner.appliedAt.pos.baseY === this._lastRow.y) {
                        this._lastRow.charState = 2 /* CharPredictState.Validated */;
                    }
                }
            }));
            this._register(this._processManager.onBeforeProcessData(e => this._onBeforeProcessData(e)));
            let nextStatsSend;
            this._register(stats.onChange(() => {
                if (!nextStatsSend) {
                    nextStatsSend = setTimeout(() => {
                        this._sendLatencyStats(stats);
                        nextStatsSend = undefined;
                    }, 300000 /* StatsConstants.StatsSendTelemetryEvery */);
                }
                if (timeline.length === 0) {
                    style.debounceStopTracking();
                }
                this._reevaluatePredictorState(stats, timeline);
            }));
        }
        reset() {
            this._lastRow = undefined;
        }
        _deferClearingPredictions() {
            if (!this.stats || !this._timeline) {
                return;
            }
            this._clearPredictionDebounce?.dispose();
            if (this._timeline.length === 0 || this._timeline.peekStart()?.clearAfterTimeout === false) {
                this._clearPredictionDebounce = undefined;
                return;
            }
            this._clearPredictionDebounce = (0, async_1.disposableTimeout)(() => {
                this._timeline?.undoAllPredictions();
                if (this._lastRow?.charState === 1 /* CharPredictState.HasPendingChar */) {
                    this._lastRow.charState = 0 /* CharPredictState.Unknown */;
                }
            }, Math.max(500, this.stats.maxLatency * 3 / 2));
        }
        /**
         * Note on debounce:
         *
         * We want to toggle the state only when the user has a pause in their
         * typing. Otherwise, we could turn this on when the PTY sent data but the
         * terminal cursor is not updated, causes issues.
         */
        _reevaluatePredictorState(stats, timeline) {
            this._reevaluatePredictorStateNow(stats, timeline);
        }
        _reevaluatePredictorStateNow(stats, timeline) {
            if (this._excludeProgramRe.test(this._terminalTitle)) {
                timeline.setShowPredictions(false);
            }
            else if (this._typeaheadThreshold < 0) {
                timeline.setShowPredictions(false);
            }
            else if (this._typeaheadThreshold === 0) {
                timeline.setShowPredictions(true);
            }
            else if (stats.sampleSize > 5 /* StatsConstants.StatsMinSamplesToTurnOn */ && stats.accuracy > 0.3 /* StatsConstants.StatsMinAccuracyToTurnOn */) {
                const latency = stats.latency.median;
                if (latency >= this._typeaheadThreshold) {
                    timeline.setShowPredictions(true);
                }
                else if (latency < this._typeaheadThreshold / 0.5 /* StatsConstants.StatsToggleOffThreshold */) {
                    timeline.setShowPredictions(false);
                }
            }
        }
        _sendLatencyStats(stats) {
            /* __GDPR__
                "terminalLatencyStats" : {
                    "owner": "Tyriar",
                    "min" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true },
                    "max" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true },
                    "median" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true },
                    "count" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true },
                    "predictionAccuracy" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true }
                }
             */
            this._telemetryService.publicLog('terminalLatencyStats', {
                ...stats.latency,
                predictionAccuracy: stats.accuracy,
            });
        }
        _onUserData(data) {
            if (this._timeline?.terminal.buffer.active.type !== 'normal') {
                return;
            }
            // console.log('user data:', JSON.stringify(data));
            const terminal = this._timeline.terminal;
            const buffer = terminal.buffer.active;
            // Detect programs like git log/less that use the normal buffer but don't
            // take input by deafult (fixes #109541)
            if (buffer.cursorX === 1 && buffer.cursorY === terminal.rows - 1) {
                if (buffer.getLine(buffer.cursorY + buffer.baseY)?.getCell(0)?.getChars() === ':') {
                    return;
                }
            }
            // the following code guards the terminal prompt to avoid being able to
            // arrow or backspace-into the prompt. Record the lowest X value at which
            // the user gave input, and mark all additions before that as tentative.
            const actualY = buffer.baseY + buffer.cursorY;
            if (actualY !== this._lastRow?.y) {
                this._lastRow = { y: actualY, startingX: buffer.cursorX, endingX: buffer.cursorX, charState: 0 /* CharPredictState.Unknown */ };
            }
            else {
                this._lastRow.startingX = Math.min(this._lastRow.startingX, buffer.cursorX);
                this._lastRow.endingX = Math.max(this._lastRow.endingX, this._timeline.physicalCursor(buffer).x);
            }
            const addLeftNavigating = (p) => this._timeline.tentativeCursor(buffer).x <= this._lastRow.startingX
                ? this._timeline.addBoundary(buffer, p)
                : this._timeline.addPrediction(buffer, p);
            const addRightNavigating = (p) => this._timeline.tentativeCursor(buffer).x >= this._lastRow.endingX - 1
                ? this._timeline.addBoundary(buffer, p)
                : this._timeline.addPrediction(buffer, p);
            /** @see https://github.com/xtermjs/xterm.js/blob/1913e9512c048e3cf56bb5f5df51bfff6899c184/src/common/input/Keyboard.ts */
            const reader = new StringReader(data);
            while (reader.remaining > 0) {
                if (reader.eatCharCode(127)) { // backspace
                    const previous = this._timeline.peekEnd();
                    if (previous && previous instanceof CharacterPrediction) {
                        this._timeline.addBoundary();
                    }
                    // backspace must be able to read the previously-written character in
                    // the event that it needs to undo it
                    if (this._timeline.isShowingPredictions) {
                        flushOutput(this._timeline.terminal);
                    }
                    if (this._timeline.tentativeCursor(buffer).x <= this._lastRow.startingX) {
                        this._timeline.addBoundary(buffer, new BackspacePrediction(this._timeline.terminal));
                    }
                    else {
                        // Backspace decrements our ability to go right.
                        this._lastRow.endingX--;
                        this._timeline.addPrediction(buffer, new BackspacePrediction(this._timeline.terminal));
                    }
                    continue;
                }
                if (reader.eatCharCode(32, 126)) { // alphanum
                    const char = data[reader.index - 1];
                    const prediction = new CharacterPrediction(this._typeaheadStyle, char);
                    if (this._lastRow.charState === 0 /* CharPredictState.Unknown */) {
                        this._timeline.addBoundary(buffer, prediction);
                        this._lastRow.charState = 1 /* CharPredictState.HasPendingChar */;
                    }
                    else {
                        this._timeline.addPrediction(buffer, prediction);
                    }
                    if (this._timeline.tentativeCursor(buffer).x >= terminal.cols) {
                        this._timeline.addBoundary(buffer, new LinewrapPrediction());
                    }
                    continue;
                }
                const cursorMv = reader.eatRe(CSI_MOVE_RE);
                if (cursorMv) {
                    const direction = cursorMv[3];
                    const p = new CursorMovePrediction(direction, !!cursorMv[2], Number(cursorMv[1]) || 1);
                    if (direction === "D" /* CursorMoveDirection.Back */) {
                        addLeftNavigating(p);
                    }
                    else {
                        addRightNavigating(p);
                    }
                    continue;
                }
                if (reader.eatStr(`${"\u001B" /* VT.Esc */}f`)) {
                    addRightNavigating(new CursorMovePrediction("C" /* CursorMoveDirection.Forwards */, true, 1));
                    continue;
                }
                if (reader.eatStr(`${"\u001B" /* VT.Esc */}b`)) {
                    addLeftNavigating(new CursorMovePrediction("D" /* CursorMoveDirection.Back */, true, 1));
                    continue;
                }
                if (reader.eatChar('\r') && buffer.cursorY < terminal.rows - 1) {
                    this._timeline.addPrediction(buffer, new NewlinePrediction());
                    continue;
                }
                // something else
                this._timeline.addBoundary(buffer, new HardBoundary());
                break;
            }
            if (this._timeline.length === 1) {
                this._deferClearingPredictions();
                this._typeaheadStyle.startTracking();
            }
        }
        _onBeforeProcessData(event) {
            if (!this._timeline) {
                return;
            }
            // console.log('incoming data:', JSON.stringify(event.data));
            event.data = this._timeline.beforeServerInput(event.data);
            // console.log('emitted data:', JSON.stringify(event.data));
            this._deferClearingPredictions();
        }
    };
    exports.TypeAheadAddon = TypeAheadAddon;
    __decorate([
        (0, decorators_1.debounce)(100)
    ], TypeAheadAddon.prototype, "_reevaluatePredictorState", null);
    exports.TypeAheadAddon = TypeAheadAddon = __decorate([
        __param(1, configuration_1.IConfigurationService),
        __param(2, telemetry_1.ITelemetryService)
    ], TypeAheadAddon);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxUeXBlQWhlYWRBZGRvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsQ29udHJpYi90eXBlQWhlYWQvYnJvd3Nlci90ZXJtaW5hbFR5cGVBaGVhZEFkZG9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWNoRyxJQUFXLEVBT1Y7SUFQRCxXQUFXLEVBQUU7UUFDWixvQkFBWSxDQUFBO1FBQ1oscUJBQWEsQ0FBQTtRQUNiLGdDQUF3QixDQUFBO1FBQ3hCLGdDQUF3QixDQUFBO1FBQ3hCLDZCQUFxQixDQUFBO1FBQ3JCLG1DQUEyQixDQUFBO0lBQzVCLENBQUMsRUFQVSxFQUFFLEtBQUYsRUFBRSxRQU9aO0lBRUQsTUFBTSxZQUFZLEdBQUcsaUJBQWlCLENBQUM7SUFDdkMsTUFBTSxXQUFXLEdBQUcsa0NBQWtDLENBQUM7SUFDdkQsTUFBTSxXQUFXLEdBQUcsWUFBWSxDQUFDO0lBRWpDLElBQVcsY0FNVjtJQU5ELFdBQVcsY0FBYztRQUN4QiwwRUFBb0IsQ0FBQTtRQUNwQiw4RkFBdUMsQ0FBQTtRQUN2Qyx5RkFBMkIsQ0FBQTtRQUMzQiw2RkFBOEIsQ0FBQTtRQUM5QiwyRkFBNkIsQ0FBQTtJQUM5QixDQUFDLEVBTlUsY0FBYyxLQUFkLGNBQWMsUUFNeEI7SUFFRDs7Ozs7Ozs7OztPQVVHO0lBQ0gsTUFBTSxrQkFBa0IsR0FBRyxtQ0FBbUMsQ0FBQztJQUUvRCxNQUFNLElBQUksR0FBRyxDQUFDLFFBQWtCLEVBQWMsRUFBRSxDQUFFLFFBQWdCLENBQUMsS0FBSyxDQUFDO0lBQ3pFLE1BQU0sV0FBVyxHQUFHLENBQUMsUUFBa0IsRUFBRSxFQUFFO1FBQzFDLDhEQUE4RDtJQUMvRCxDQUFDLENBQUM7SUFFRixJQUFXLG1CQUdWO0lBSEQsV0FBVyxtQkFBbUI7UUFDN0IsaUNBQVUs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LEVBQUUsRUFBRTtZQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FBRTtRQUNwQyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FBRTtRQUNuQyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRTtZQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FBRTtRQUN0QyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRTtZQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FBRTtRQUN6QyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FBRTtRQUNyQyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRTtZQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FBRTtRQUN2QyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRTtZQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FBRTtRQUV6QyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7U0FBRTtRQUNoSSxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRTtZQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztTQUFFO1FBQ2hFLElBQUksSUFBSSxDQUFDLFdBQVcs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