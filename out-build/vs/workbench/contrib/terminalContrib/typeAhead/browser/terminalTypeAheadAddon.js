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
    exports.$iXb = exports.CharPredictState = exports.$hXb = exports.$gXb = void 0;
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
            return this.d;
        }
        get y() {
            return this.f;
        }
        get baseY() {
            return this.h;
        }
        get coordinate() {
            return { x: this.d, y: this.f, baseY: this.h };
        }
        constructor(rows, cols, j) {
            this.rows = rows;
            this.cols = cols;
            this.j = j;
            this.d = 0;
            this.f = 1;
            this.h = 1;
            this.d = j.cursorX;
            this.f = j.cursorY;
            this.h = j.baseY;
        }
        getLine() {
            return this.j.getLine(this.f + this.h);
        }
        getCell(loadInto) {
            return this.getLine()?.getCell(this.d, loadInto);
        }
        moveTo(coordinate) {
            this.d = coordinate.x;
            this.f = (coordinate.y + coordinate.baseY) - this.h;
            return this.moveInstruction();
        }
        clone() {
            const c = new Cursor(this.rows, this.cols, this.j);
            c.moveTo(this);
            return c;
        }
        move(x, y) {
            this.d = x;
            this.f = y;
            return this.moveInstruction();
        }
        shift(x = 0, y = 0) {
            this.d += x;
            this.f += y;
            return this.moveInstruction();
        }
        moveInstruction() {
            if (this.f >= this.rows) {
                this.h += this.f - (this.rows - 1);
                this.f = this.rows - 1;
            }
            else if (this.f < 0) {
                this.h -= this.f;
                this.f = 0;
            }
            return `${"\u001B[" /* VT.Csi */}${this.f + 1};${this.d + 1}H`;
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
            return this.d.length - this.index;
        }
        get eof() {
            return this.index === this.d.length;
        }
        get rest() {
            return this.d.slice(this.index);
        }
        constructor(d) {
            this.d = d;
            this.index = 0;
        }
        /**
         * Advances the reader and returns the character if it matches.
         */
        eatChar(char) {
            if (this.d[this.index] !== char) {
                return;
            }
            this.index++;
            return char;
        }
        /**
         * Advances the reader and returns the string if it matches.
         */
        eatStr(substr) {
            if (this.d.slice(this.index, substr.length) !== substr) {
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
            const match = re.exec(this.d.slice(this.index));
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
            const code = this.d.charCodeAt(this.index);
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
            this.d = cursor.clone();
            this.inner.apply(buffer, this.d);
            return '';
        }
        rollback(cursor) {
            this.inner.rollback(cursor.clone());
            return '';
        }
        rollForwards(cursor, withInput) {
            if (this.d) {
                cursor.moveTo(this.d);
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
        constructor(d, f) {
            this.d = d;
            this.f = f;
            this.affectsStyle = true;
        }
        apply(_, cursor) {
            const cell = cursor.getCell();
            this.appliedAt = cell
                ? { pos: cursor.coordinate, oldAttributes: attributesToSeq(cell), oldChar: cell.getChars() }
                : { pos: cursor.coordinate, oldAttributes: '', oldChar: '' };
            cursor.shift(1);
            return this.d.apply + this.f + this.d.undo;
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
            if (input.eatChar(this.f)) {
                return 0 /* MatchResult.Success */;
            }
            if (lookBehind instanceof CharacterPrediction) {
                // see #112842
                const sillyZshOutcome = input.eatGradually(`\b${lookBehind.f}${this.f}`);
                if (sillyZshOutcome !== 1 /* MatchResult.Failure */) {
                    return sillyZshOutcome;
                }
            }
            input.index = startIndex;
            return 1 /* MatchResult.Failure */;
        }
    }
    class BackspacePrediction {
        constructor(f) {
            this.f = f;
        }
        apply(_, cursor) {
            // at eol if everything to the right is whitespace (zsh will emit a "clear line" code in this case)
            // todo: can be optimized if `getTrimmedLength` is exposed from xterm
            const isLastChar = !cursor.getLine()?.translateToString(undefined, cursor.x).trim();
            const pos = cursor.coordinate;
            const move = cursor.shift(-1);
            const cell = cursor.getCell();
            this.d = cell
                ? { isLastChar, pos, oldAttributes: attributesToSeq(cell), oldChar: cell.getChars() }
                : { isLastChar, pos, oldAttributes: '', oldChar: '' };
            return move + "\u001B[X" /* VT.DeleteChar */;
        }
        rollback(cursor) {
            if (!this.d) {
                return ''; // not applied
            }
            const { oldAttributes, oldChar, pos } = this.d;
            if (!oldChar) {
                return cursor.moveTo(pos) + "\u001B[X" /* VT.DeleteChar */;
            }
            return oldAttributes + oldChar + cursor.moveTo(pos) + attributesToSeq(core(this.f)._inputHandler._curAttrData);
        }
        rollForwards() {
            return '';
        }
        matches(input) {
            if (this.d?.isLastChar) {
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
            this.d = cursor.coordinate;
            cursor.move(0, cursor.y + 1);
            return '\r\n';
        }
        rollback(cursor) {
            return this.d ? cursor.moveTo(this.d) : '';
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
            this.d = cursor.coordinate;
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
        constructor(f, h, j) {
            this.f = f;
            this.h = h;
            this.j = j;
        }
        apply(buffer, cursor) {
            const prevPosition = cursor.x;
            const currentCell = cursor.getCell();
            const prevAttrs = currentCell ? attributesToSeq(currentCell) : '';
            const { j: amount, f: direction, h: moveByWords } = this;
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
            this.d = {
                amount: Math.abs(cursor.x - target.x),
                prevPosition,
                prevAttrs,
                rollForward: cursor.moveTo(target),
            };
            return this.d.rollForward;
        }
        rollback(cursor) {
            if (!this.d) {
                return '';
            }
            return cursor.move(this.d.prevPosition, cursor.y) + this.d.prevAttrs;
        }
        rollForwards() {
            return ''; // does not need to rewrite
        }
        matches(input) {
            if (!this.d) {
                return 1 /* MatchResult.Failure */;
            }
            const direction = this.f;
            const { amount, rollForward } = this.d;
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
    class $gXb extends lifecycle_1.$kc {
        /**
         * Gets the percent (0-1) of predictions that were accurate.
         */
        get accuracy() {
            let correctCount = 0;
            for (const [, correct] of this.f) {
                if (correct) {
                    correctCount++;
                }
            }
            return correctCount / (this.f.length || 1);
        }
        /**
         * Gets the number of recorded stats.
         */
        get sampleSize() {
            return this.f.length;
        }
        /**
         * Gets latency stats of successful predictions.
         */
        get latency() {
            const latencies = this.f.filter(([, correct]) => correct).map(([s]) => s).sort();
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
            for (const [latency, correct] of this.f) {
                if (correct) {
                    max = Math.max(latency, max);
                }
            }
            return max;
        }
        constructor(timeline) {
            super();
            this.f = [];
            this.h = 0;
            this.j = new WeakMap();
            this.m = new event_1.$fd();
            this.onChange = this.m.event;
            this.B(timeline.onPredictionAdded(p => this.j.set(p, Date.now())));
            this.B(timeline.onPredictionSucceeded(this.t.bind(this, true)));
            this.B(timeline.onPredictionFailed(this.t.bind(this, false)));
        }
        t(correct, prediction) {
            const started = this.j.get(prediction);
            this.f[this.h] = [Date.now() - started, correct];
            this.h = (this.h + 1) % 24 /* StatsConstants.StatsBufferSize */;
            this.m.fire();
        }
    }
    exports.$gXb = $gXb;
    class $hXb {
        get u() {
            return this.d.filter(({ gen }) => gen === this.d[0].gen).map(({ p }) => p);
        }
        get isShowingPredictions() {
            return this.l;
        }
        get length() {
            return this.d.length;
        }
        constructor(terminal, w) {
            this.terminal = terminal;
            this.w = w;
            /**
             * Expected queue of events. Only predictions for the lowest are
             * written into the terminal.
             */
            this.d = [];
            /**
             * Current prediction generation.
             */
            this.f = 0;
            /**
             * Whether predictions are echoed to the terminal. If false, predictions
             * will still be computed internally for latency metrics, but input will
             * never be adjusted.
             */
            this.l = false;
            this.o = new event_1.$fd();
            this.onPredictionAdded = this.o.event;
            this.q = new event_1.$fd();
            this.onPredictionFailed = this.q.event;
            this.t = new event_1.$fd();
            this.onPredictionSucceeded = this.t.event;
        }
        setShowPredictions(show) {
            if (show === this.l) {
                return;
            }
            // console.log('set predictions:', show);
            this.l = show;
            const buffer = this.A();
            if (!buffer) {
                return;
            }
            const toApply = this.u;
            if (show) {
                this.clearCursor();
                this.w.expectIncomingStyle(toApply.reduce((count, p) => p.affectsStyle ? count + 1 : count, 0));
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
            const buffer = this.A();
            if (this.l && buffer) {
                this.terminal.write(this.u.reverse()
                    .map(p => p.rollback(this.physicalCursor(buffer))).join(''));
            }
            this.d = [];
        }
        /**
         * Should be called when input is incoming to the temrinal.
         */
        beforeServerInput(input) {
            const originalInput = input;
            if (this.k) {
                input = this.k + input;
                this.k = undefined;
            }
            if (!this.d.length) {
                this.z();
                return input;
            }
            const buffer = this.A();
            if (!buffer) {
                this.z();
                return input;
            }
            let output = '';
            const reader = new StringReader(input);
            const startingGen = this.d[0].gen;
            const emitPredictionOmitted = () => {
                const omit = reader.eatRe(PREDICTION_OMIT_RE);
                if (omit) {
                    output += omit[0];
                }
            };
            ReadLoop: while (this.d.length && reader.remaining > 0) {
                emitPredictionOmitted();
                const { p: prediction, gen } = this.d[0];
                const cursor = this.physicalCursor(buffer);
                const beforeTestReaderIndex = reader.index;
                switch (prediction.matches(reader, this.m)) {
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
                        this.t.fire(prediction);
                        this.m = prediction;
                        this.d.shift();
                        break;
                    }
                    case 2 /* MatchResult.Buffer */:
                        // on a buffer, store the remaining data and completely read data
                        // to be output as normal.
                        this.k = input.slice(beforeTestReaderIndex);
                        reader.index = input.length;
                        break ReadLoop;
                    case 1 /* MatchResult.Failure */: {
                        // on a failure, roll back all remaining items in this generation
                        // and clear predictions, since they are no longer valid
                        const rollback = this.d.filter(p => p.gen === startingGen).reverse();
                        output += rollback.map(({ p }) => p.rollback(this.physicalCursor(buffer))).join('');
                        if (rollback.some(r => r.p.affectsStyle)) {
                            // reading the current style should generally be safe, since predictions
                            // always restore the style if they modify it.
                            output += attributesToSeq(core(this.terminal)._inputHandler._curAttrData);
                        }
                        this.z();
                        this.q.fire(prediction);
                        break ReadLoop;
                    }
                }
            }
            emitPredictionOmitted();
            // Extra data (like the result of running a command) should cause us to
            // reset the cursor
            if (!reader.eof) {
                output += reader.rest;
                this.z();
            }
            // If we passed a generation boundary, apply the current generation's predictions
            if (this.d.length && startingGen !== this.d[0].gen) {
                for (const { p, gen } of this.d) {
                    if (gen !== this.d[0].gen) {
                        break;
                    }
                    if (p.affectsStyle) {
                        this.w.expectIncomingStyle();
                    }
                    output += p.apply(buffer, this.physicalCursor(buffer));
                }
            }
            if (!this.l) {
                return originalInput;
            }
            if (output.length === 0 || output === input) {
                return output;
            }
            if (this.h) {
                output += this.h.moveInstruction();
            }
            // prevent cursor flickering while typing
            output = "\u001B[?25l" /* VT.HideCursor */ + output + "\u001B[?25h" /* VT.ShowCursor */;
            return output;
        }
        /**
         * Clears any expected predictions and stored state. Should be called when
         * the pty gives us something we don't recognize.
         */
        z() {
            this.d = [];
            this.clearCursor();
            this.m = undefined;
        }
        /**
         * Appends a typeahead prediction.
         */
        addPrediction(buffer, prediction) {
            this.d.push({ gen: this.f, p: prediction });
            this.o.fire(prediction);
            if (this.f !== this.d[0].gen) {
                prediction.apply(buffer, this.tentativeCursor(buffer));
                return false;
            }
            const text = prediction.apply(buffer, this.physicalCursor(buffer));
            this.j = undefined; // next read will get or clone the physical cursor
            if (this.l && text) {
                if (prediction.affectsStyle) {
                    this.w.expectIncomingStyle();
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
            this.f++;
            return applied;
        }
        /**
         * Peeks the last prediction written.
         */
        peekEnd() {
            return this.d[this.d.length - 1]?.p;
        }
        /**
         * Peeks the first pending prediction.
         */
        peekStart() {
            return this.d[0]?.p;
        }
        /**
         * Current position of the cursor in the terminal.
         */
        physicalCursor(buffer) {
            if (!this.h) {
                if (this.l) {
                    flushOutput(this.terminal);
                }
                this.h = new Cursor(this.terminal.rows, this.terminal.cols, buffer);
            }
            return this.h;
        }
        /**
         * Cursor position if all predictions and boundaries that have been inserted
         * so far turn out to be successfully predicted.
         */
        tentativeCursor(buffer) {
            if (!this.j) {
                this.j = this.physicalCursor(buffer).clone();
            }
            return this.j;
        }
        clearCursor() {
            this.h = undefined;
            this.j = undefined;
        }
        A() {
            const buffer = this.terminal.buffer.active;
            return buffer.type === 'normal' ? buffer : undefined;
        }
    }
    exports.$hXb = $hXb;
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
        static d(args) {
            return `${"\u001B[" /* VT.Csi */}${args.join(';')}m`;
        }
        constructor(value, m) {
            this.m = m;
            /**
             * Number of typeahead style arguments we expect to read. If this is 0 and
             * we see a style coming in, we know that the PTY actually wanted to update.
             */
            this.f = 0;
            this.onUpdate(value);
        }
        /**
         * Signals that a style was written to the terminal and we should watch
         * for it coming in.
         */
        expectIncomingStyle(n = 1) {
            this.f += n * 2;
        }
        /**
         * Starts tracking for CSI changes in the terminal.
         */
        startTracking() {
            this.f = 0;
            this.q(attributesToArgs(core(this.m)._inputHandler._curAttrData));
            this.l = this.m.parser.registerCsiHandler({ final: 'm' }, args => {
                this.q(args);
                return false;
            });
        }
        /**
         * Stops tracking terminal CSI changes.
         */
        debounceStopTracking() {
            this.o();
        }
        /**
         * @inheritdoc
         */
        dispose() {
            this.o();
        }
        o() {
            this.l?.dispose();
            this.l = undefined;
        }
        q(args) {
            const originalUndo = this.k;
            for (let i = 0; i < args.length;) {
                const px = args[i];
                const p = typeof px === 'number' ? px : px[0];
                if (this.f) {
                    if (arrayHasPrefixAt(args, i, this.k)) {
                        this.f--;
                        i += this.k.length;
                        continue;
                    }
                    if (arrayHasPrefixAt(args, i, this.h)) {
                        this.f--;
                        i += this.h.length;
                        continue;
                    }
                }
                const width = p === 38 || p === 48 || p === 58 ? getColorWidth(args, i) : 1;
                switch (this.h[0]) {
                    case 1:
                        if (p === 2) {
                            this.k = [22, 2];
                        }
                        else if (p === 22 || p === 0) {
                            this.k = [22];
                        }
                        break;
                    case 2:
                        if (p === 1) {
                            this.k = [22, 1];
                        }
                        else if (p === 22 || p === 0) {
                            this.k = [22];
                        }
                        break;
                    case 38:
                        if (p === 0 || p === 39 || p === 100) {
                            this.k = [39];
                        }
                        else if ((p >= 30 && p <= 38) || (p >= 90 && p <= 97)) {
                            this.k = args.slice(i, i + width);
                        }
                        break;
                    default:
                        if (p === this.h[0]) {
                            this.k = this.h;
                        }
                        else if (p === 0) {
                            this.k = this.j;
                        }
                    // no-op
                }
                i += width;
            }
            if (originalUndo !== this.k) {
                this.undo = TypeAheadStyle.d(this.k);
            }
        }
        /**
         * Updates the current typeahead style.
         */
        onUpdate(style) {
            const { applyArgs, undoArgs } = this.t(style);
            this.h = applyArgs;
            this.k = this.j = undoArgs;
            this.apply = TypeAheadStyle.d(this.h);
            this.undo = TypeAheadStyle.d(this.k);
        }
        t(style) {
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
                        color = color_1.$Os.fromHex(style);
                    }
                    catch {
                        color = new color_1.$Os(new color_1.$Ls(255, 0, 0, 1));
                    }
                    const { r, g, b } = color.rgba;
                    return { applyArgs: [38, 2, r, g, b], undoArgs: [39] };
                }
            }
        }
    }
    __decorate([
        (0, decorators_1.$7g)(2000)
    ], TypeAheadStyle.prototype, "debounceStopTracking", null);
    const compileExcludeRegexp = (programs = terminal_1.$HM) => new RegExp(`\\b(${programs.map(strings_1.$qe).join('|')})\\b`, 'i');
    var CharPredictState;
    (function (CharPredictState) {
        /** No characters typed on this line yet */
        CharPredictState[CharPredictState["Unknown"] = 0] = "Unknown";
        /** Has a pending character prediction */
        CharPredictState[CharPredictState["HasPendingChar"] = 1] = "HasPendingChar";
        /** Character validated on this line */
        CharPredictState[CharPredictState["Validated"] = 2] = "Validated";
    })(CharPredictState || (exports.CharPredictState = CharPredictState = {}));
    let $iXb = class $iXb extends lifecycle_1.$kc {
        constructor(C, D, F) {
            super();
            this.C = C;
            this.D = D;
            this.F = F;
            this.h = this.D.getValue(terminal_1.$vM).localEchoLatencyThreshold;
            this.j = compileExcludeRegexp(this.D.getValue(terminal_1.$vM).localEchoExcludePrograms);
            this.w = '';
            this.B((0, lifecycle_1.$ic)(() => this.z?.dispose()));
        }
        activate(terminal) {
            const style = this.f = this.B(new TypeAheadStyle(this.D.getValue(terminal_1.$vM).localEchoStyle, terminal));
            const timeline = this.u = new $hXb(terminal, this.f);
            const stats = this.stats = this.B(new $gXb(this.u));
            timeline.setShowPredictions(this.h === 0);
            this.B(terminal.onData(e => this.L(e)));
            this.B(terminal.onTitleChange(title => {
                this.w = title;
                this.H(stats, timeline);
            }));
            this.B(terminal.onResize(() => {
                timeline.setShowPredictions(false);
                timeline.clearCursor();
                this.H(stats, timeline);
            }));
            this.B(this.D.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(terminal_1.$vM)) {
                    style.onUpdate(this.D.getValue(terminal_1.$vM).localEchoStyle);
                    this.h = this.D.getValue(terminal_1.$vM).localEchoLatencyThreshold;
                    this.j = compileExcludeRegexp(this.D.getValue(terminal_1.$vM).localEchoExcludePrograms);
                    this.H(stats, timeline);
                }
            }));
            this.B(this.u.onPredictionSucceeded(p => {
                if (this.m?.charState === 1 /* CharPredictState.HasPendingChar */ && isTenativeCharacterPrediction(p) && p.inner.appliedAt) {
                    if (p.inner.appliedAt.pos.y + p.inner.appliedAt.pos.baseY === this.m.y) {
                        this.m.charState = 2 /* CharPredictState.Validated */;
                    }
                }
            }));
            this.B(this.C.onBeforeProcessData(e => this.M(e)));
            let nextStatsSend;
            this.B(stats.onChange(() => {
                if (!nextStatsSend) {
                    nextStatsSend = setTimeout(() => {
                        this.J(stats);
                        nextStatsSend = undefined;
                    }, 300000 /* StatsConstants.StatsSendTelemetryEvery */);
                }
                if (timeline.length === 0) {
                    style.debounceStopTracking();
                }
                this.H(stats, timeline);
            }));
        }
        reset() {
            this.m = undefined;
        }
        G() {
            if (!this.stats || !this.u) {
                return;
            }
            this.z?.dispose();
            if (this.u.length === 0 || this.u.peekStart()?.clearAfterTimeout === false) {
                this.z = undefined;
                return;
            }
            this.z = (0, async_1.$Ig)(() => {
                this.u?.undoAllPredictions();
                if (this.m?.charState === 1 /* CharPredictState.HasPendingChar */) {
                    this.m.charState = 0 /* CharPredictState.Unknown */;
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
        H(stats, timeline) {
            this.I(stats, timeline);
        }
        I(stats, timeline) {
            if (this.j.test(this.w)) {
                timeline.setShowPredictions(false);
            }
            else if (this.h < 0) {
                timeline.setShowPredictions(false);
            }
            else if (this.h === 0) {
                timeline.setShowPredictions(true);
            }
            else if (stats.sampleSize > 5 /* StatsConstants.StatsMinSamplesToTurnOn */ && stats.accuracy > 0.3 /* StatsConstants.StatsMinAccuracyToTurnOn */) {
                const latency = stats.latency.median;
                if (latency >= this.h) {
                    timeline.setShowPredictions(true);
                }
                else if (latency < this.h / 0.5 /* StatsConstants.StatsToggleOffThreshold */) {
                    timeline.setShowPredictions(false);
                }
            }
        }
        J(stats) {
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
            this.F.publicLog('terminalLatencyStats', {
                ...stats.latency,
                predictionAccuracy: stats.accuracy,
            });
        }
        L(data) {
            if (this.u?.terminal.buffer.active.type !== 'normal') {
                return;
            }
            // console.log('user data:', JSON.stringify(data));
            const terminal = this.u.terminal;
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
            if (actualY !== this.m?.y) {
                this.m = { y: actualY, startingX: buffer.cursorX, endingX: buffer.cursorX, charState: 0 /* CharPredictState.Unknown */ };
            }
            else {
                this.m.startingX = Math.min(this.m.startingX, buffer.cursorX);
                this.m.endingX = Math.max(this.m.endingX, this.u.physicalCursor(buffer).x);
            }
            const addLeftNavigating = (p) => this.u.tentativeCursor(buffer).x <= this.m.startingX
                ? this.u.addBoundary(buffer, p)
                : this.u.addPrediction(buffer, p);
            const addRightNavigating = (p) => this.u.tentativeCursor(buffer).x >= this.m.endingX - 1
                ? this.u.addBoundary(buffer, p)
                : this.u.addPrediction(buffer, p);
            /** @see https://github.com/xtermjs/xterm.js/blob/1913e9512c048e3cf56bb5f5df51bfff6899c184/src/common/input/Keyboard.ts */
            const reader = new StringReader(data);
            while (reader.remaining > 0) {
                if (reader.eatCharCode(127)) { // backspace
                    const previous = this.u.peekEnd();
                    if (previous && previous instanceof CharacterPrediction) {
                        this.u.addBoundary();
                    }
                    // backspace must be able to read the previously-written character in
                    // the event that it needs to undo it
                    if (this.u.isShowingPredictions) {
                        flushOutput(this.u.terminal);
                    }
                    if (this.u.tentativeCursor(buffer).x <= this.m.startingX) {
                        this.u.addBoundary(buffer, new BackspacePrediction(this.u.terminal));
                    }
                    else {
                        // Backspace decrements our ability to go right.
                        this.m.endingX--;
                        this.u.addPrediction(buffer, new BackspacePrediction(this.u.terminal));
                    }
                    continue;
                }
                if (reader.eatCharCode(32, 126)) { // alphanum
                    const char = data[reader.index - 1];
                    const prediction = new CharacterPrediction(this.f, char);
                    if (this.m.charState === 0 /* CharPredictState.Unknown */) {
                        this.u.addBoundary(buffer, prediction);
                        this.m.charState = 1 /* CharPredictState.HasPendingChar */;
                    }
                    else {
                        this.u.addPrediction(buffer, prediction);
                    }
                    if (this.u.tentativeCursor(buffer).x >= terminal.cols) {
                        this.u.addBoundary(buffer, new LinewrapPrediction());
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
                    this.u.addPrediction(buffer, new NewlinePrediction());
                    continue;
                }
                // something else
                this.u.addBoundary(buffer, new HardBoundary());
                break;
            }
            if (this.u.length === 1) {
                this.G();
                this.f.startTracking();
            }
        }
        M(event) {
            if (!this.u) {
                return;
            }
            // console.log('incoming data:', JSON.stringify(event.data));
            event.data = this.u.beforeServerInput(event.data);
            // console.log('emitted data:', JSON.stringify(event.data));
            this.G();
        }
    };
    exports.$iXb = $iXb;
    __decorate([
        (0, decorators_1.$7g)(100)
    ], $iXb.prototype, "H", null);
    exports.$iXb = $iXb = __decorate([
        __param(1, configuration_1.$8h),
        __param(2, telemetry_1.$9k)
    ], $iXb);
});
//# sourceMappingURL=terminalTypeAheadAddon.js.map