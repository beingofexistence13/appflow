/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/severity", "vs/base/common/types", "vs/base/common/uuid", "vs/nls", "vs/workbench/contrib/debug/common/debugModel"], function (require, exports, event_1, severity_1, types_1, uuid_1, nls, debugModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReplModel = exports.ReplGroup = exports.ReplEvaluationResult = exports.ReplEvaluationInput = exports.RawObjectReplElement = exports.ReplVariableElement = exports.ReplOutputElement = void 0;
    const MAX_REPL_LENGTH = 10000;
    let topReplElementCounter = 0;
    const getUniqueId = () => `topReplElement:${topReplElementCounter++}`;
    /**
     * General case of data from DAP the `output` event. {@link ReplVariableElement}
     * is used instead only if there is a `variablesReference` with no `output` text.
     */
    class ReplOutputElement {
        constructor(session, id, value, severity, sourceData, expression) {
            this.session = session;
            this.id = id;
            this.value = value;
            this.severity = severity;
            this.sourceData = sourceData;
            this.expression = expression;
            this._count = 1;
            this._onDidChangeCount = new event_1.Emitter();
        }
        toString(includeSource = false) {
            let valueRespectCount = this.value;
            for (let i = 1; i < this.count; i++) {
                valueRespectCount += (valueRespectCount.endsWith('\n') ? '' : '\n') + this.value;
            }
            const sourceStr = (this.sourceData && includeSource) ? ` ${this.sourceData.source.name}` : '';
            return valueRespectCount + sourceStr;
        }
        getId() {
            return this.id;
        }
        getChildren() {
            return this.expression?.getChildren() || Promise.resolve([]);
        }
        set count(value) {
            this._count = value;
            this._onDidChangeCount.fire();
        }
        get count() {
            return this._count;
        }
        get onDidChangeCount() {
            return this._onDidChangeCount.event;
        }
        get hasChildren() {
            return !!this.expression?.hasChildren;
        }
    }
    exports.ReplOutputElement = ReplOutputElement;
    /** Top-level variable logged via DAP output when there's no `output` string */
    class ReplVariableElement {
        constructor(expression, severity, sourceData) {
            this.expression = expression;
            this.severity = severity;
            this.sourceData = sourceData;
            this.id = (0, uuid_1.generateUuid)();
            this.hasChildren = expression.hasChildren;
        }
        getChildren() {
            return this.expression.getChildren();
        }
        toString() {
            return this.expression.toString();
        }
        getId() {
            return this.id;
        }
    }
    exports.ReplVariableElement = ReplVariableElement;
    class RawObjectReplElement {
        static { this.MAX_CHILDREN = 1000; } // upper bound of children per value
        constructor(id, name, valueObj, sourceData, annotation) {
            this.id = id;
            this.name = name;
            this.valueObj = valueObj;
            this.sourceData = sourceData;
            this.annotation = annotation;
        }
        getId() {
            return this.id;
        }
        get value() {
            if (this.valueObj === null) {
                return 'null';
            }
            else if (Array.isArray(this.valueObj)) {
                return `Array[${this.valueObj.length}]`;
            }
            else if ((0, types_1.isObject)(this.valueObj)) {
                return 'Object';
            }
            else if ((0, types_1.isString)(this.valueObj)) {
                return `"${this.valueObj}"`;
            }
            return String(this.valueObj) || '';
        }
        get hasChildren() {
            return (Array.isArray(this.valueObj) && this.valueObj.length > 0) || ((0, types_1.isObject)(this.valueObj) && Object.getOwnPropertyNames(this.valueObj).length > 0);
        }
        evaluateLazy() {
            throw new Error('Method not implemented.');
        }
        getChildren() {
            let result = [];
            if (Array.isArray(this.valueObj)) {
                result = this.valueObj.slice(0, RawObjectReplElement.MAX_CHILDREN)
                    .map((v, index) => new RawObjectReplElement(`${this.id}:${index}`, String(index), v));
            }
            else if ((0, types_1.isObject)(this.valueObj)) {
                result = Object.getOwnPropertyNames(this.valueObj).slice(0, RawObjectReplElement.MAX_CHILDREN)
                    .map((key, index) => new RawObjectReplElement(`${this.id}:${index}`, key, this.valueObj[key]));
            }
            return Promise.resolve(result);
        }
        toString() {
            return `${this.name}\n${this.value}`;
        }
    }
    exports.RawObjectReplElement = RawObjectReplElement;
    class ReplEvaluationInput {
        constructor(value) {
            this.value = value;
            this.id = (0, uuid_1.generateUuid)();
        }
        toString() {
            return this.value;
        }
        getId() {
            return this.id;
        }
    }
    exports.ReplEvaluationInput = ReplEvaluationInput;
    class ReplEvaluationResult extends debugModel_1.ExpressionContainer {
        get available() {
            return this._available;
        }
        constructor(originalExpression) {
            super(undefined, undefined, 0, (0, uuid_1.generateUuid)());
            this.originalExpression = originalExpression;
            this._available = true;
        }
        async evaluateExpression(expression, session, stackFrame, context) {
            const result = await super.evaluateExpression(expression, session, stackFrame, context);
            this._available = result;
            return result;
        }
        toString() {
            return `${this.value}`;
        }
    }
    exports.ReplEvaluationResult = ReplEvaluationResult;
    class ReplGroup {
        static { this.COUNTER = 0; }
        constructor(name, autoExpand, sourceData) {
            this.name = name;
            this.autoExpand = autoExpand;
            this.sourceData = sourceData;
            this.children = [];
            this.ended = false;
            this.id = `replGroup:${ReplGroup.COUNTER++}`;
        }
        get hasChildren() {
            return true;
        }
        getId() {
            return this.id;
        }
        toString(includeSource = false) {
            const sourceStr = (includeSource && this.sourceData) ? ` ${this.sourceData.source.name}` : '';
            return this.name + sourceStr;
        }
        addChild(child) {
            const lastElement = this.children.length ? this.children[this.children.length - 1] : undefined;
            if (lastElement instanceof ReplGroup && !lastElement.hasEnded) {
                lastElement.addChild(child);
            }
            else {
                this.children.push(child);
            }
        }
        getChildren() {
            return this.children;
        }
        end() {
            const lastElement = this.children.length ? this.children[this.children.length - 1] : undefined;
            if (lastElement instanceof ReplGroup && !lastElement.hasEnded) {
                lastElement.end();
            }
            else {
                this.ended = true;
            }
        }
        get hasEnded() {
            return this.ended;
        }
    }
    exports.ReplGroup = ReplGroup;
    function areSourcesEqual(first, second) {
        if (!first && !second) {
            return true;
        }
        if (first && second) {
            return first.column === second.column && first.lineNumber === second.lineNumber && first.source.uri.toString() === second.source.uri.toString();
        }
        return false;
    }
    class ReplModel {
        constructor(configurationService) {
            this.configurationService = configurationService;
            this.replElements = [];
            this._onDidChangeElements = new event_1.Emitter();
            this.onDidChangeElements = this._onDidChangeElements.event;
        }
        getReplElements() {
            return this.replElements;
        }
        async addReplExpression(session, stackFrame, name) {
            this.addReplElement(new ReplEvaluationInput(name));
            const result = new ReplEvaluationResult(name);
            await result.evaluateExpression(name, session, stackFrame, 'repl');
            this.addReplElement(result);
        }
        appendToRepl(session, { output, expression, sev, source }) {
            const clearAnsiSequence = '\u001b[2J';
            const clearAnsiIndex = output.lastIndexOf(clearAnsiSequence);
            if (clearAnsiIndex !== -1) {
                // [2J is the ansi escape sequence for clearing the display http://ascii-table.com/ansi-escape-sequences.php
                this.removeReplExpressions();
                this.appendToRepl(session, { output: nls.localize('consoleCleared', "Console was cleared"), sev: severity_1.default.Ignore });
                output = output.substring(clearAnsiIndex + clearAnsiSequence.length);
            }
            if (expression) {
                // if there is an output string, prefer to show that, since the DA could
                // have formatted it nicely e.g. with ANSI color codes.
                this.addReplElement(output
                    ? new ReplOutputElement(session, getUniqueId(), output, sev, source, expression)
                    : new ReplVariableElement(expression, sev, source));
                return;
            }
            const previousElement = this.replElements.length ? this.replElements[this.replElements.length - 1] : undefined;
            if (previousElement instanceof ReplOutputElement && previousElement.severity === sev) {
                const config = this.configurationService.getValue('debug');
                if (previousElement.value === output && areSourcesEqual(previousElement.sourceData, source) && config.console.collapseIdenticalLines) {
                    previousElement.count++;
                    // No need to fire an event, just the count updates and badge will adjust automatically
                    return;
                }
                if (!previousElement.value.endsWith('\n') && !previousElement.value.endsWith('\r\n') && previousElement.count === 1) {
                    this.replElements[this.replElements.length - 1] = new ReplOutputElement(session, getUniqueId(), previousElement.value + output, sev, source);
                    this._onDidChangeElements.fire();
                    return;
                }
            }
            const element = new ReplOutputElement(session, getUniqueId(), output, sev, source);
            this.addReplElement(element);
        }
        startGroup(name, autoExpand, sourceData) {
            const group = new ReplGroup(name, autoExpand, sourceData);
            this.addReplElement(group);
        }
        endGroup() {
            const lastElement = this.replElements[this.replElements.length - 1];
            if (lastElement instanceof ReplGroup) {
                lastElement.end();
            }
        }
        addReplElement(newElement) {
            const lastElement = this.replElements.length ? this.replElements[this.replElements.length - 1] : undefined;
            if (lastElement instanceof ReplGroup && !lastElement.hasEnded) {
                lastElement.addChild(newElement);
            }
            else {
                this.replElements.push(newElement);
                if (this.replElements.length > MAX_REPL_LENGTH) {
                    this.replElements.splice(0, this.replElements.length - MAX_REPL_LENGTH);
                }
            }
            this._onDidChangeElements.fire();
        }
        removeReplExpressions() {
            if (this.replElements.length > 0) {
                this.replElements = [];
                this._onDidChangeElements.fire();
            }
        }
        /** Returns a new REPL model that's a copy of this one. */
        clone() {
            const newRepl = new ReplModel(this.configurationService);
            newRepl.replElements = this.replElements.slice();
            return newRepl;
        }
    }
    exports.ReplModel = ReplModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwbE1vZGVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvY29tbW9uL3JlcGxNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFXaEcsTUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDO0lBQzlCLElBQUkscUJBQXFCLEdBQUcsQ0FBQyxDQUFDO0lBQzlCLE1BQU0sV0FBVyxHQUFHLEdBQUcsRUFBRSxDQUFDLGtCQUFrQixxQkFBcUIsRUFBRSxFQUFFLENBQUM7SUFFdEU7OztPQUdHO0lBQ0gsTUFBYSxpQkFBaUI7UUFLN0IsWUFDUSxPQUFzQixFQUNyQixFQUFVLEVBQ1gsS0FBYSxFQUNiLFFBQWtCLEVBQ2xCLFVBQStCLEVBQ3RCLFVBQXdCO1lBTGpDLFlBQU8sR0FBUCxPQUFPLENBQWU7WUFDckIsT0FBRSxHQUFGLEVBQUUsQ0FBUTtZQUNYLFVBQUssR0FBTCxLQUFLLENBQVE7WUFDYixhQUFRLEdBQVIsUUFBUSxDQUFVO1lBQ2xCLGVBQVUsR0FBVixVQUFVLENBQXFCO1lBQ3RCLGVBQVUsR0FBVixVQUFVLENBQWM7WUFUakMsV0FBTSxHQUFHLENBQUMsQ0FBQztZQUNYLHNCQUFpQixHQUFHLElBQUksZUFBTyxFQUFRLENBQUM7UUFVaEQsQ0FBQztRQUVELFFBQVEsQ0FBQyxhQUFhLEdBQUcsS0FBSztZQUM3QixJQUFJLGlCQUFpQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDbkMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3BDLGlCQUFpQixJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxH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