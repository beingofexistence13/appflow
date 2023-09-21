/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/severity", "vs/base/common/types", "vs/base/common/uuid", "vs/nls!vs/workbench/contrib/debug/common/replModel", "vs/workbench/contrib/debug/common/debugModel"], function (require, exports, event_1, severity_1, types_1, uuid_1, nls, debugModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$9Pb = exports.$8Pb = exports.$7Pb = exports.$6Pb = exports.$5Pb = exports.$4Pb = exports.$3Pb = void 0;
    const MAX_REPL_LENGTH = 10000;
    let topReplElementCounter = 0;
    const getUniqueId = () => `topReplElement:${topReplElementCounter++}`;
    /**
     * General case of data from DAP the `output` event. {@link $4Pb}
     * is used instead only if there is a `variablesReference` with no `output` text.
     */
    class $3Pb {
        constructor(session, c, value, severity, sourceData, expression) {
            this.session = session;
            this.c = c;
            this.value = value;
            this.severity = severity;
            this.sourceData = sourceData;
            this.expression = expression;
            this.a = 1;
            this.b = new event_1.$fd();
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
            return this.c;
        }
        getChildren() {
            return this.expression?.getChildren() || Promise.resolve([]);
        }
        set count(value) {
            this.a = value;
            this.b.fire();
        }
        get count() {
            return this.a;
        }
        get onDidChangeCount() {
            return this.b.event;
        }
        get hasChildren() {
            return !!this.expression?.hasChildren;
        }
    }
    exports.$3Pb = $3Pb;
    /** Top-level variable logged via DAP output when there's no `output` string */
    class $4Pb {
        constructor(expression, severity, sourceData) {
            this.expression = expression;
            this.severity = severity;
            this.sourceData = sourceData;
            this.a = (0, uuid_1.$4f)();
            this.hasChildren = expression.hasChildren;
        }
        getChildren() {
            return this.expression.getChildren();
        }
        toString() {
            return this.expression.toString();
        }
        getId() {
            return this.a;
        }
    }
    exports.$4Pb = $4Pb;
    class $5Pb {
        static { this.a = 1000; } // upper bound of children per value
        constructor(b, name, valueObj, sourceData, annotation) {
            this.b = b;
            this.name = name;
            this.valueObj = valueObj;
            this.sourceData = sourceData;
            this.annotation = annotation;
        }
        getId() {
            return this.b;
        }
        get value() {
            if (this.valueObj === null) {
                return 'null';
            }
            else if (Array.isArray(this.valueObj)) {
                return `Array[${this.valueObj.length}]`;
            }
            else if ((0, types_1.$lf)(this.valueObj)) {
                return 'Object';
            }
            else if ((0, types_1.$jf)(this.valueObj)) {
                return `"${this.valueObj}"`;
            }
            return String(this.valueObj) || '';
        }
        get hasChildren() {
            return (Array.isArray(this.valueObj) && this.valueObj.length > 0) || ((0, types_1.$lf)(this.valueObj) && Object.getOwnPropertyNames(this.valueObj).length > 0);
        }
        evaluateLazy() {
            throw new Error('Method not implemented.');
        }
        getChildren() {
            let result = [];
            if (Array.isArray(this.valueObj)) {
                result = this.valueObj.slice(0, $5Pb.a)
                    .map((v, index) => new $5Pb(`${this.b}:${index}`, String(index), v));
            }
            else if ((0, types_1.$lf)(this.valueObj)) {
                result = Object.getOwnPropertyNames(this.valueObj).slice(0, $5Pb.a)
                    .map((key, index) => new $5Pb(`${this.b}:${index}`, key, this.valueObj[key]));
            }
            return Promise.resolve(result);
        }
        toString() {
            return `${this.name}\n${this.value}`;
        }
    }
    exports.$5Pb = $5Pb;
    class $6Pb {
        constructor(value) {
            this.value = value;
            this.a = (0, uuid_1.$4f)();
        }
        toString() {
            return this.value;
        }
        getId() {
            return this.a;
        }
    }
    exports.$6Pb = $6Pb;
    class $7Pb extends debugModel_1.$HFb {
        get available() {
            return this.r;
        }
        constructor(originalExpression) {
            super(undefined, undefined, 0, (0, uuid_1.$4f)());
            this.originalExpression = originalExpression;
            this.r = true;
        }
        async evaluateExpression(expression, session, stackFrame, context) {
            const result = await super.evaluateExpression(expression, session, stackFrame, context);
            this.r = result;
            return result;
        }
        toString() {
            return `${this.value}`;
        }
    }
    exports.$7Pb = $7Pb;
    class $8Pb {
        static { this.COUNTER = 0; }
        constructor(name, autoExpand, sourceData) {
            this.name = name;
            this.autoExpand = autoExpand;
            this.sourceData = sourceData;
            this.a = [];
            this.c = false;
            this.b = `replGroup:${$8Pb.COUNTER++}`;
        }
        get hasChildren() {
            return true;
        }
        getId() {
            return this.b;
        }
        toString(includeSource = false) {
            const sourceStr = (includeSource && this.sourceData) ? ` ${this.sourceData.source.name}` : '';
            return this.name + sourceStr;
        }
        addChild(child) {
            const lastElement = this.a.length ? this.a[this.a.length - 1] : undefined;
            if (lastElement instanceof $8Pb && !lastElement.hasEnded) {
                lastElement.addChild(child);
            }
            else {
                this.a.push(child);
            }
        }
        getChildren() {
            return this.a;
        }
        end() {
            const lastElement = this.a.length ? this.a[this.a.length - 1] : undefined;
            if (lastElement instanceof $8Pb && !lastElement.hasEnded) {
                lastElement.end();
            }
            else {
                this.c = true;
            }
        }
        get hasEnded() {
            return this.c;
        }
    }
    exports.$8Pb = $8Pb;
    function areSourcesEqual(first, second) {
        if (!first && !second) {
            return true;
        }
        if (first && second) {
            return first.column === second.column && first.lineNumber === second.lineNumber && first.source.uri.toString() === second.source.uri.toString();
        }
        return false;
    }
    class $9Pb {
        constructor(c) {
            this.c = c;
            this.a = [];
            this.b = new event_1.$fd();
            this.onDidChangeElements = this.b.event;
        }
        getReplElements() {
            return this.a;
        }
        async addReplExpression(session, stackFrame, name) {
            this.d(new $6Pb(name));
            const result = new $7Pb(name);
            await result.evaluateExpression(name, session, stackFrame, 'repl');
            this.d(result);
        }
        appendToRepl(session, { output, expression, sev, source }) {
            const clearAnsiSequence = '\u001b[2J';
            const clearAnsiIndex = output.lastIndexOf(clearAnsiSequence);
            if (clearAnsiIndex !== -1) {
                // [2J is the ansi escape sequence for clearing the display http://ascii-table.com/ansi-escape-sequences.php
                this.removeReplExpressions();
                this.appendToRepl(session, { output: nls.localize(0, null), sev: severity_1.default.Ignore });
                output = output.substring(clearAnsiIndex + clearAnsiSequence.length);
            }
            if (expression) {
                // if there is an output string, prefer to show that, since the DA could
                // have formatted it nicely e.g. with ANSI color codes.
                this.d(output
                    ? new $3Pb(session, getUniqueId(), output, sev, source, expression)
                    : new $4Pb(expression, sev, source));
                return;
            }
            const previousElement = this.a.length ? this.a[this.a.length - 1] : undefined;
            if (previousElement instanceof $3Pb && previousElement.severity === sev) {
                const config = this.c.getValue('debug');
                if (previousElement.value === output && areSourcesEqual(previousElement.sourceData, source) && config.console.collapseIdenticalLines) {
                    previousElement.count++;
                    // No need to fire an event, just the count updates and badge will adjust automatically
                    return;
                }
                if (!previousElement.value.endsWith('\n') && !previousElement.value.endsWith('\r\n') && previousElement.count === 1) {
                    this.a[this.a.length - 1] = new $3Pb(session, getUniqueId(), previousElement.value + output, sev, source);
                    this.b.fire();
                    return;
                }
            }
            const element = new $3Pb(session, getUniqueId(), output, sev, source);
            this.d(element);
        }
        startGroup(name, autoExpand, sourceData) {
            const group = new $8Pb(name, autoExpand, sourceData);
            this.d(group);
        }
        endGroup() {
            const lastElement = this.a[this.a.length - 1];
            if (lastElement instanceof $8Pb) {
                lastElement.end();
            }
        }
        d(newElement) {
            const lastElement = this.a.length ? this.a[this.a.length - 1] : undefined;
            if (lastElement instanceof $8Pb && !lastElement.hasEnded) {
                lastElement.addChild(newElement);
            }
            else {
                this.a.push(newElement);
                if (this.a.length > MAX_REPL_LENGTH) {
                    this.a.splice(0, this.a.length - MAX_REPL_LENGTH);
                }
            }
            this.b.fire();
        }
        removeReplExpressions() {
            if (this.a.length > 0) {
                this.a = [];
                this.b.fire();
            }
        }
        /** Returns a new REPL model that's a copy of this one. */
        clone() {
            const newRepl = new $9Pb(this.c);
            newRepl.a = this.a.slice();
            return newRepl;
        }
    }
    exports.$9Pb = $9Pb;
});
//# sourceMappingURL=replModel.js.map