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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/hash", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/resources", "vs/base/common/types", "vs/base/common/uri", "vs/base/common/uuid", "vs/editor/common/core/range", "vs/nls", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugSource", "vs/workbench/contrib/debug/common/disassemblyViewInput", "vs/workbench/services/textfile/common/textfiles", "vs/platform/log/common/log", "vs/base/common/observable", "vs/base/common/arraysFind"], function (require, exports, arrays_1, async_1, buffer_1, cancellation_1, hash_1, event_1, lifecycle_1, objects_1, resources, types_1, uri_1, uuid_1, range_1, nls, uriIdentity_1, debug_1, debugSource_1, disassemblyViewInput_1, textfiles_1, log_1, observable_1, arraysFind_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DebugModel = exports.ThreadAndSessionIds = exports.InstructionBreakpoint = exports.ExceptionBreakpoint = exports.DataBreakpoint = exports.FunctionBreakpoint = exports.Breakpoint = exports.BaseBreakpoint = exports.Enablement = exports.MemoryRegion = exports.getUriForDebugMemory = exports.Thread = exports.StackFrame = exports.ErrorScope = exports.Scope = exports.Variable = exports.Expression = exports.ExpressionContainer = void 0;
    class ExpressionContainer {
        static { this.allValues = new Map(); }
        // Use chunks to support variable paging #9537
        static { this.BASE_CHUNK_SIZE = 100; }
        constructor(session, threadId, _reference, id, namedVariables = 0, indexedVariables = 0, memoryReference = undefined, startOfVariables = 0, presentationHint = undefined) {
            this.session = session;
            this.threadId = threadId;
            this._reference = _reference;
            this.id = id;
            this.namedVariables = namedVariables;
            this.indexedVariables = indexedVariables;
            this.memoryReference = memoryReference;
            this.startOfVariables = startOfVariables;
            this.presentationHint = presentationHint;
            this.valueChanged = false;
            this._value = '';
        }
        get reference() {
            return this._reference;
        }
        set reference(value) {
            this._reference = value;
            this.children = undefined; // invalidate children cache
        }
        async evaluateLazy() {
            if (typeof this.reference === 'undefined') {
                return;
            }
            const response = await this.session.variables(this.reference, this.threadId, undefined, undefined, undefined);
            if (!response || !response.body || !response.body.variables || response.body.variables.length !== 1) {
                return;
            }
            const dummyVar = response.body.variables[0];
            this.reference = dummyVar.variablesReference;
            this._value = dummyVar.value;
            this.namedVariables = dummyVar.namedVariables;
            this.indexedVariables = dummyVar.indexedVariables;
            this.memoryReference = dummyVar.memoryReference;
            this.presentationHint = dummyVar.presentationHint;
            // Also call overridden method to adopt subclass props
            this.adoptLazyResponse(dummyVar);
        }
        adoptLazyResponse(response) {
        }
        getChildren() {
            if (!this.children) {
                this.children = this.doGetChildren();
            }
            return this.children;
        }
        async doGetChildren() {
            if (!this.hasChildren) {
                return [];
            }
            if (!this.getChildrenInChunks) {
                return this.fetchVariables(undefined, undefined, undefined);
            }
            // Check if object has named variables, fetch them independent from indexed variables #9670
            const children = this.namedVariables ? await this.fetchVariables(undefined, undefined, 'named') : [];
            // Use a dynamic chunk size based on the number of elements #9774
            let chunkSize = ExpressionContainer.BASE_CHUNK_SIZE;
            while (!!this.indexedVariables && this.indexedVariables > chunkSize * ExpressionContainer.BASE_CHUNK_SIZE) {
                chunkSize *= ExpressionContainer.BASE_CHUNK_SIZE;
            }
            if (!!this.indexedVariables && this.indexedVariables > chunkSize) {
                // There are a lot of children, create fake intermediate values that represent chunks #9537
                const numberOfChunks = Math.ceil(this.indexedVariables / chunkSize);
                for (let i = 0; i < numberOfChunks; i++) {
                    const start = (this.startOfVariables || 0) + i * chunkSize;
                    const count = Math.min(chunkSize, this.indexedVariables - i * chunkSize);
                    children.push(new Variable(this.session, this.threadId, this, this.reference, `[${start}..${start + count - 1}]`, '', '', undefined, count, undefined, { kind: 'virtual' }, undefined, undefined, true, start));
                }
                return children;
            }
            const variables = await this.fetchVariables(this.startOfVariables, this.indexedVariables, 'indexed');
            return children.concat(variables);
        }
        getId() {
            return this.id;
        }
        getSession() {
            return this.session;
        }
        get value() {
            return this._value;
        }
        get hasChildren() {
            // only variables with reference > 0 have children.
            return !!this.reference && this.reference > 0 && !this.presentationHint?.lazy;
        }
        async fetchVariables(start, count, filter) {
            try {
                const response = await this.session.variables(this.reference || 0, this.threadId, filter, start, count);
                if (!response || !response.body || !response.body.variables) {
                    return [];
                }
                const nameCount = new Map();
                const vars = response.body.variables.filter(v => !!v).map((v) => {
                    if ((0, types_1.isString)(v.value) && (0, types_1.isString)(v.name) && typeof v.variablesReference === 'number') {
                        const count = nameCount.get(v.name) || 0;
                        const idDuplicationIndex = count > 0 ? count.toString() : '';
                        nameCount.set(v.name, count + 1);
                        return new Variable(this.session, this.threadId, this, v.variablesReference, v.name, v.evaluateName, v.value, v.namedVariables, v.indexedVariables, v.memoryReference, v.presentationHint, v.type, v.__vscodeVariableMenuContext, true, 0, idDuplicationIndex);
                    }
                    return new Variable(this.session, this.threadId, this, 0, '', undefined, nls.localize('invalidVariableAttributes', "Invalid variable attributes"), 0, 0, undefined, { kind: 'virtual' }, undefined, undefined, false);
                });
                if (this.session.autoExpandLazyVariables) {
                    await Promise.all(vars.map(v => v.presentationHint?.lazy && v.evaluateLazy()));
                }
                return vars;
            }
            catch (e) {
                return [new Variable(this.session, this.threadId, this, 0, '', undefined, e.message, 0, 0, undefined, { kind: 'virtual' }, undefined, undefined, false)];
            }
        }
        // The adapter explicitly sents the children count of an expression only if there are lots of children which should be chunked.
        get getChildrenInChunks() {
            return !!this.indexedVariables;
        }
        set value(value) {
            this._value = value;
            this.valueChanged = !!ExpressionContainer.allValues.get(this.getId()) &&
                ExpressionContainer.allValues.get(this.getId()) !== Expression.DEFAULT_VALUE && ExpressionContainer.allValues.get(this.getId()) !== value;
            ExpressionContainer.allValues.set(this.getId(), value);
        }
        toString() {
            return this.value;
        }
        async evaluateExpression(expression, session, stackFrame, context, keepLazyVars = false) {
            if (!session || (!stackFrame && context !== 'repl')) {
                this.value = context === 'repl' ? nls.localize('startDebugFirst', "Please start a debug session to evaluate expressions") : Expression.DEFAULT_VALUE;
                this.reference = 0;
                return false;
            }
            this.session = session;
            try {
                const response = await session.evaluate(expression, stackFrame ? stackFrame.frameId : undefined, context);
                if (response && response.body) {
                    this.value = response.body.result || '';
                    this.reference = response.body.variablesReference;
                    this.namedVariables = response.body.namedVariables;
                    this.indexedVariables = response.body.indexedVariables;
                    this.memoryReference = response.body.memoryReference;
                    this.type = response.body.type || this.type;
                    this.presentationHint = response.body.presentationHint;
                    if (!keepLazyVars && response.body.presentationHint?.lazy) {
                        await this.evaluateLazy();
                    }
                    return true;
                }
                return false;
            }
            catch (e) {
                this.value = e.message || '';
                this.reference = 0;
                return false;
            }
        }
    }
    exports.ExpressionContainer = ExpressionContainer;
    function handleSetResponse(expression, response) {
        if (response && response.body) {
            expression.value = response.body.value || '';
            expression.type = response.body.type || expression.type;
            expression.reference = response.body.variablesReference;
            expression.namedVariables = response.body.namedVariables;
            expression.indexedVariables = response.body.indexedVariables;
            // todo @weinand: the set responses contain most properties, but not memory references. Should they?
        }
    }
    class Expression extends ExpressionContainer {
        static { this.DEFAULT_VALUE = nls.localize('notAvailable', "not available"); }
        constructor(name, id = (0, uuid_1.generateUuid)()) {
            super(undefined, undefined, 0, id);
            this.name = name;
            this.available = false;
            // name is not set if the expression is just being added
            // in that case do not set default value to prevent flashing #14499
            if (name) {
                this.value = Expression.DEFAULT_VALUE;
            }
        }
        async evaluate(session, stackFrame, context, keepLazyVars) {
            this.available = await this.evaluateExpression(this.name, session, stackFrame, context, keepLazyVars);
        }
        toString() {
            return `${this.name}\n${this.value}`;
        }
        async setExpression(value, stackFrame) {
            if (!this.session) {
                return;
            }
            const response = await this.session.setExpression(stackFrame.frameId, this.name, value);
            handleSetResponse(this, response);
        }
    }
    exports.Expression = Expression;
    class Variable extends ExpressionContainer {
        constructor(session, threadId, parent, reference, name, evaluateName, value, namedVariables, indexedVariables, memoryReference, presentationHint, type = undefined, variableMenuContext = undefined, available = true, startOfVariables = 0, idDuplicationIndex = '') {
            super(session, threadId, reference, `variable:${parent.getId()}:${name}:${idDuplicationIndex}`, namedVariables, indexedVariables, memoryReference, startOfVariables, presentationHint);
            this.parent = parent;
            this.name = name;
            this.evaluateName = evaluateName;
            this.variableMenuContext = variableMenuContext;
            this.available = available;
            this.value = value || '';
            this.type = type;
        }
        async setVariable(value, stackFrame) {
            if (!this.session) {
                return;
            }
            try {
                // Send out a setExpression for debug extensions that do not support set variables https://github.com/microsoft/vscode/issues/124679#issuecomment-869844437
                if (this.session.capabilities.supportsSetExpression && !this.session.capabilities.supportsSetVariable && this.evaluateName) {
                    return this.setExpression(value, stackFrame);
                }
                const response = await this.session.setVariable(this.parent.reference, this.name, value);
                handleSetResponse(this, response);
            }
            catch (err) {
                this.errorMessage = err.message;
            }
        }
        async setExpression(value, stackFrame) {
            if (!this.session || !this.evaluateName) {
                return;
            }
            const response = await this.session.setExpression(stackFrame.frameId, this.evaluateName, value);
            handleSetResponse(this, response);
        }
        toString() {
            return this.name ? `${this.name}: ${this.value}` : this.value;
        }
        adoptLazyResponse(response) {
            this.evaluateName = response.evaluateName;
        }
        toDebugProtocolObject() {
            return {
                name: this.name,
                variablesReference: this.reference || 0,
                memoryReference: this.memoryReference,
                value: this.value,
                evaluateName: this.evaluateName
            };
        }
    }
    exports.Variable = Variable;
    class Scope extends ExpressionContainer {
        constructor(stackFrame, id, name, reference, expensive, namedVariables, indexedVariables, range) {
            super(stackFrame.thread.session, stackFrame.thread.threadId, reference, `scope:${name}:${id}`, namedVariables, indexedVariables);
            this.name = name;
            this.expensive = expensive;
            this.range = range;
        }
        toString() {
            return this.name;
        }
        toDebugProtocolObject() {
            return {
                name: this.name,
                variablesReference: this.reference || 0,
                expensive: this.expensive
            };
        }
    }
    exports.Scope = Scope;
    class ErrorScope extends Scope {
        constructor(stackFrame, index, message) {
            super(stackFrame, index, message, 0, false);
        }
        toString() {
            return this.name;
        }
    }
    exports.ErrorScope = ErrorScope;
    class StackFrame {
        constructor(thread, frameId, source, name, presentationHint, range, index, canRestart, instructionPointerReference) {
            this.thread = thread;
            this.frameId = frameId;
            this.source = source;
            this.name = name;
            this.presentationHint = presentationHint;
            this.range = range;
            this.index = index;
            this.canRestart = canRestart;
            this.instructionPointerReference = instructionPointerReference;
        }
        getId() {
            return `stackframe:${this.thread.getId()}:${this.index}:${this.source.name}`;
        }
        getScopes() {
            if (!this.scopes) {
                this.scopes = this.thread.session.scopes(this.frameId, this.thread.threadId).then(response => {
                    if (!response || !response.body || !response.body.scopes) {
                        return [];
                    }
                    const usedIds = new Set();
                    return response.body.scopes.map(rs => {
                        // form the id based on the name and location so that it's the
                        // same across multiple pauses to retain expansion state
                        let id = 0;
                        do {
                            id = (0, hash_1.stringHash)(`${rs.name}:${rs.line}:${rs.column}`, id);
                        } while (usedIds.has(id));
                        usedIds.add(id);
                        return new Scope(this, id, rs.name, rs.variablesReference, rs.expensive, rs.namedVariables, rs.indexedVariables, rs.line && rs.column && rs.endLine && rs.endColumn ? new range_1.Range(rs.line, rs.column, rs.endLine, rs.endColumn) : undefined);
                    });
                }, err => [new ErrorScope(this, 0, err.message)]);
            }
            return this.scopes;
        }
        async getMostSpecificScopes(range) {
            const scopes = await this.getScopes();
            const nonExpensiveScopes = scopes.filter(s => !s.expensive);
            const haveRangeInfo = nonExpensiveScopes.some(s => !!s.range);
            if (!haveRangeInfo) {
                return nonExpensiveScopes;
            }
            const scopesContainingRange = nonExpensiveScopes.filter(scope => scope.range && range_1.Range.containsRange(scope.range, range))
                .sort((first, second) => (first.range.endLineNumber - first.range.startLineNumber) - (second.range.endLineNumber - second.range.startLineNumber));
            return scopesContainingRange.length ? scopesContainingRange : nonExpensiveScopes;
        }
        restart() {
            return this.thread.session.restartFrame(this.frameId, this.thread.threadId);
        }
        forgetScopes() {
            this.scopes = undefined;
        }
        toString() {
            const lineNumberToString = typeof this.range.startLineNumber === 'number' ? `:${this.range.startLineNumber}` : '';
            const sourceToString = `${this.source.inMemory ? this.source.name : this.source.uri.fsPath}${lineNumberToString}`;
            return sourceToString === debugSource_1.UNKNOWN_SOURCE_LABEL ? this.name : `${this.name} (${sourceToString})`;
        }
        async openInEditor(editorService, preserveFocus, sideBySide, pinned) {
            const threadStopReason = this.thread.stoppedDetails?.reason;
            if (this.instructionPointerReference &&
                (threadStopReason === 'instruction breakpoint' ||
                    (threadStopReason === 'step' && this.thread.lastSteppingGranularity === 'instruction') ||
                    editorService.activeEditor instanceof disassemblyViewInput_1.DisassemblyViewInput)) {
                return editorService.openEditor(disassemblyViewInput_1.DisassemblyViewInput.instance, { pinned: true, revealIfOpened: true });
            }
            if (this.source.available) {
                return this.source.openInEditor(editorService, this.range, preserveFocus, sideBySide, pinned);
            }
            return undefined;
        }
        equals(other) {
            return (this.name === other.name) && (other.thread === this.thread) && (this.frameId === other.frameId) && (other.source === this.source) && (range_1.Range.equalsRange(this.range, other.range));
        }
    }
    exports.StackFrame = StackFrame;
    class Thread {
        constructor(session, name, threadId) {
            this.session = session;
            this.name = name;
            this.threadId = threadId;
            this.callStackCancellationTokens = [];
            this.reachedEndOfCallStack = false;
            this.callStack = [];
            this.staleCallStack = [];
            this.stopped = false;
        }
        getId() {
            return `thread:${this.session.getId()}:${this.threadId}`;
        }
        clearCallStack() {
            if (this.callStack.length) {
                this.staleCallStack = this.callStack;
            }
            this.callStack = [];
            this.callStackCancellationTokens.forEach(c => c.dispose(true));
            this.callStackCancellationTokens = [];
        }
        getCallStack() {
            return this.callStack;
        }
        getStaleCallStack() {
            return this.staleCallStack;
        }
        getTopStackFrame() {
            const callStack = this.getCallStack();
            // Allow stack frame without source and with instructionReferencePointer as top stack frame when using disassembly view.
            const firstAvailableStackFrame = callStack.find(sf => !!(sf &&
                ((this.stoppedDetails?.reason === 'instruction breakpoint' || (this.stoppedDetails?.reason === 'step' && this.lastSteppingGranularity === 'instruction')) && sf.instructionPointerReference) ||
                (sf.source && sf.source.available && sf.source.presentationHint !== 'deemphasize')));
            return firstAvailableStackFrame;
        }
        get stateLabel() {
            if (this.stoppedDetails) {
                return this.stoppedDetails.description ||
                    (this.stoppedDetails.reason ? nls.localize({ key: 'pausedOn', comment: ['indicates reason for program being paused'] }, "Paused on {0}", this.stoppedDetails.reason) : nls.localize('paused', "Paused"));
            }
            return nls.localize({ key: 'running', comment: ['indicates state'] }, "Running");
        }
        /**
         * Queries the debug adapter for the callstack and returns a promise
         * which completes once the call stack has been retrieved.
         * If the thread is not stopped, it returns a promise to an empty array.
         * Only fetches the first stack frame for performance reasons. Calling this method consecutive times
         * gets the remainder of the call stack.
         */
        async fetchCallStack(levels = 20) {
            if (this.stopped) {
                const start = this.callStack.length;
                const callStack = await this.getCallStackImpl(start, levels);
                this.reachedEndOfCallStack = callStack.length < levels;
                if (start < this.callStack.length) {
                    // Set the stack frames for exact position we requested. To make sure no concurrent requests create duplicate stack frames #30660
                    this.callStack.splice(start, this.callStack.length - start);
                }
                this.callStack = this.callStack.concat(callStack || []);
                if (typeof this.stoppedDetails?.totalFrames === 'number' && this.stoppedDetails.totalFrames === this.callStack.length) {
                    this.reachedEndOfCallStack = true;
                }
            }
        }
        async getCallStackImpl(startFrame, levels) {
            try {
                const tokenSource = new cancellation_1.CancellationTokenSource();
                this.callStackCancellationTokens.push(tokenSource);
                const response = await this.session.stackTrace(this.threadId, startFrame, levels, tokenSource.token);
                if (!response || !response.body || tokenSource.token.isCancellationRequested) {
                    return [];
                }
                if (this.stoppedDetails) {
                    this.stoppedDetails.totalFrames = response.body.totalFrames;
                }
                return response.body.stackFrames.map((rsf, index) => {
                    const source = this.session.getSource(rsf.source);
                    return new StackFrame(this, rsf.id, source, rsf.name, rsf.presentationHint, new range_1.Range(rsf.line, rsf.column, rsf.endLine || rsf.line, rsf.endColumn || rsf.column), startFrame + index, typeof rsf.canRestart === 'boolean' ? rsf.canRestart : true, rsf.instructionPointerReference);
                });
            }
            catch (err) {
                if (this.stoppedDetails) {
                    this.stoppedDetails.framesErrorMessage = err.message;
                }
                return [];
            }
        }
        /**
         * Returns exception info promise if the exception was thrown, otherwise undefined
         */
        get exceptionInfo() {
            if (this.stoppedDetails && this.stoppedDetails.reason === 'exception') {
                if (this.session.capabilities.supportsExceptionInfoRequest) {
                    return this.session.exceptionInfo(this.threadId);
                }
                return Promise.resolve({
                    description: this.stoppedDetails.text,
                    breakMode: null
                });
            }
            return Promise.resolve(undefined);
        }
        next(granularity) {
            return this.session.next(this.threadId, granularity);
        }
        stepIn(granularity) {
            return this.session.stepIn(this.threadId, undefined, granularity);
        }
        stepOut(granularity) {
            return this.session.stepOut(this.threadId, granularity);
        }
        stepBack(granularity) {
            return this.session.stepBack(this.threadId, granularity);
        }
        continue() {
            return this.session.continue(this.threadId);
        }
        pause() {
            return this.session.pause(this.threadId);
        }
        terminate() {
            return this.session.terminateThreads([this.threadId]);
        }
        reverseContinue() {
            return this.session.reverseContinue(this.threadId);
        }
    }
    exports.Thread = Thread;
    /**
     * Gets a URI to a memory in the given session ID.
     */
    const getUriForDebugMemory = (sessionId, memoryReference, range, displayName = 'memory') => {
        return uri_1.URI.from({
            scheme: debug_1.DEBUG_MEMORY_SCHEME,
            authority: sessionId,
            path: '/' + encodeURIComponent(memoryReference) + `/${encodeURIComponent(displayName)}.bin`,
            query: range ? `?range=${range.fromOffset}:${range.toOffset}` : undefined,
        });
    };
    exports.getUriForDebugMemory = getUriForDebugMemory;
    class MemoryRegion extends lifecycle_1.Disposable {
        constructor(memoryReference, session) {
            super();
            this.memoryReference = memoryReference;
            this.session = session;
            this.invalidateEmitter = this._register(new event_1.Emitter());
            /** @inheritdoc */
            this.onDidInvalidate = this.invalidateEmitter.event;
            /** @inheritdoc */
            this.writable = !!this.session.capabilities.supportsWriteMemoryRequest;
            this._register(session.onDidInvalidateMemory(e => {
                if (e.body.memoryReference === memoryReference) {
                    this.invalidate(e.body.offset, e.body.count - e.body.offset);
                }
            }));
        }
        async read(fromOffset, toOffset) {
            const length = toOffset - fromOffset;
            const offset = fromOffset;
            const result = await this.session.readMemory(this.memoryReference, offset, length);
            if (result === undefined || !result.body?.data) {
                return [{ type: 1 /* MemoryRangeType.Unreadable */, offset, length }];
            }
            let data;
            try {
                data = (0, buffer_1.decodeBase64)(result.body.data);
            }
            catch {
                return [{ type: 2 /* MemoryRangeType.Error */, offset, length, error: 'Invalid base64 data from debug adapter' }];
            }
            const unreadable = result.body.unreadableBytes || 0;
            const dataLength = length - unreadable;
            if (data.byteLength < dataLength) {
                const pad = buffer_1.VSBuffer.alloc(dataLength - data.byteLength);
                pad.buffer.fill(0);
                data = buffer_1.VSBuffer.concat([data, pad], dataLength);
            }
            else if (data.byteLength > dataLength) {
                data = data.slice(0, dataLength);
            }
            if (!unreadable) {
                return [{ type: 0 /* MemoryRangeType.Valid */, offset, length, data }];
            }
            return [
                { type: 0 /* MemoryRangeType.Valid */, offset, length: dataLength, data },
                { type: 1 /* MemoryRangeType.Unreadable */, offset: offset + dataLength, length: unreadable },
            ];
        }
        async write(offset, data) {
            const result = await this.session.writeMemory(this.memoryReference, offset, (0, buffer_1.encodeBase64)(data), true);
            const written = result?.body?.bytesWritten ?? data.byteLength;
            this.invalidate(offset, offset + written);
            return written;
        }
        dispose() {
            super.dispose();
        }
        invalidate(fromOffset, toOffset) {
            this.invalidateEmitter.fire({ fromOffset, toOffset });
        }
    }
    exports.MemoryRegion = MemoryRegion;
    class Enablement {
        constructor(enabled, id) {
            this.enabled = enabled;
            this.id = id;
        }
        getId() {
            return this.id;
        }
    }
    exports.Enablement = Enablement;
    function toBreakpointSessionData(data, capabilities) {
        return (0, objects_1.mixin)({
            supportsConditionalBreakpoints: !!capabilities.supportsConditionalBreakpoints,
            supportsHitConditionalBreakpoints: !!capabilities.supportsHitConditionalBreakpoints,
            supportsLogPoints: !!capabilities.supportsLogPoints,
            supportsFunctionBreakpoints: !!capabilities.supportsFunctionBreakpoints,
            supportsDataBreakpoints: !!capabilities.supportsDataBreakpoints,
            supportsInstructionBreakpoints: !!capabilities.supportsInstructionBreakpoints
        }, data);
    }
    class BaseBreakpoint extends Enablement {
        constructor(enabled, hitCondition, condition, logMessage, id) {
            super(enabled, id);
            this.hitCondition = hitCondition;
            this.condition = condition;
            this.logMessage = logMessage;
            this.sessionData = new Map();
            if (enabled === undefined) {
                this.enabled = true;
            }
        }
        setSessionData(sessionId, data) {
            if (!data) {
                this.sessionData.delete(sessionId);
            }
            else {
                data.sessionId = sessionId;
                this.sessionData.set(sessionId, data);
            }
            const allData = Array.from(this.sessionData.values());
            const verifiedData = (0, arrays_1.distinct)(allData.filter(d => d.verified), d => `${d.line}:${d.column}`);
            if (verifiedData.length) {
                // In case multiple session verified the breakpoint and they provide different data show the intial data that the user set (corner case)
                this.data = verifiedData.length === 1 ? verifiedData[0] : undefined;
            }
            else {
                // No session verified the breakpoint
                this.data = allData.length ? allData[0] : undefined;
            }
        }
        get message() {
            if (!this.data) {
                return undefined;
            }
            return this.data.message;
        }
        get verified() {
            return this.data ? this.data.verified : true;
        }
        get sessionsThatVerified() {
            const sessionIds = [];
            for (const [sessionId, data] of this.sessionData) {
                if (data.verified) {
                    sessionIds.push(sessionId);
                }
            }
            return sessionIds;
        }
        getIdFromAdapter(sessionId) {
            const data = this.sessionData.get(sessionId);
            return data ? data.id : undefined;
        }
        getDebugProtocolBreakpoint(sessionId) {
            const data = this.sessionData.get(sessionId);
            if (data) {
                const bp = {
                    id: data.id,
                    verified: data.verified,
                    message: data.message,
                    source: data.source,
                    line: data.line,
                    column: data.column,
                    endLine: data.endLine,
                    endColumn: data.endColumn,
                    instructionReference: data.instructionReference,
                    offset: data.offset
                };
                return bp;
            }
            return undefined;
        }
        toJSON() {
            const result = Object.create(null);
            result.id = this.getId();
            result.enabled = this.enabled;
            result.condition = this.condition;
            result.hitCondition = this.hitCondition;
            result.logMessage = this.logMessage;
            return result;
        }
    }
    exports.BaseBreakpoint = BaseBreakpoint;
    class Breakpoint extends BaseBreakpoint {
        constructor(_uri, _lineNumber, _column, enabled, condition, hitCondition, logMessage, _adapterData, textFileService, uriIdentityService, logService, id = (0, uuid_1.generateUuid)()) {
            super(enabled, hitCondition, condition, logMessage, id);
            this._uri = _uri;
            this._lineNumber = _lineNumber;
            this._column = _column;
            this._adapterData = _adapterData;
            this.textFileService = textFileService;
            this.uriIdentityService = uriIdentityService;
            this.logService = logService;
        }
        get originalUri() {
            return this._uri;
        }
        get lineNumber() {
            return this.verified && this.data && typeof this.data.line === 'number' ? this.data.line : this._lineNumber;
        }
        get verified() {
            if (this.data) {
                return this.data.verified && !this.textFileService.isDirty(this._uri);
            }
            return true;
        }
        get uri() {
            return this.verified && this.data && this.data.source ? (0, debugSource_1.getUriFromSource)(this.data.source, this.data.source.path, this.data.sessionId, this.uriIdentityService, this.logService) : this._uri;
        }
        get column() {
            return this.verified && this.data && typeof this.data.column === 'number' ? this.data.column : this._column;
        }
        get message() {
            if (this.textFileService.isDirty(this.uri)) {
                return nls.localize('breakpointDirtydHover', "Unverified breakpoint. File is modified, please restart debug session.");
            }
            return super.message;
        }
        get adapterData() {
            return this.data && this.data.source && this.data.source.adapterData ? this.data.source.adapterData : this._adapterData;
        }
        get endLineNumber() {
            return this.verified && this.data ? this.data.endLine : undefined;
        }
        get endColumn() {
            return this.verified && this.data ? this.data.endColumn : undefined;
        }
        get sessionAgnosticData() {
            return {
                lineNumber: this._lineNumber,
                column: this._column
            };
        }
        get supported() {
            if (!this.data) {
                return true;
            }
            if (this.logMessage && !this.data.supportsLogPoints) {
                return false;
            }
            if (this.condition && !this.data.supportsConditionalBreakpoints) {
                return false;
            }
            if (this.hitCondition && !this.data.supportsHitConditionalBreakpoints) {
                return false;
            }
            return true;
        }
        setSessionData(sessionId, data) {
            super.setSessionData(sessionId, data);
            if (!this._adapterData) {
                this._adapterData = this.adapterData;
            }
        }
        toJSON() {
            const result = super.toJSON();
            result.uri = this._uri;
            result.lineNumber = this._lineNumber;
            result.column = this._column;
            result.adapterData = this.adapterData;
            return result;
        }
        toString() {
            return `${resources.basenameOrAuthority(this.uri)} ${this.lineNumber}`;
        }
        update(data) {
            if (!(0, types_1.isUndefinedOrNull)(data.lineNumber)) {
                this._lineNumber = data.lineNumber;
            }
            if (!(0, types_1.isUndefinedOrNull)(data.column)) {
                this._column = data.column;
            }
            if (!(0, types_1.isUndefinedOrNull)(data.condition)) {
                this.condition = data.condition;
            }
            if (!(0, types_1.isUndefinedOrNull)(data.hitCondition)) {
                this.hitCondition = data.hitCondition;
            }
            if (!(0, types_1.isUndefinedOrNull)(data.logMessage)) {
                this.logMessage = data.logMessage;
            }
        }
    }
    exports.Breakpoint = Breakpoint;
    class FunctionBreakpoint extends BaseBreakpoint {
        constructor(name, enabled, hitCondition, condition, logMessage, id = (0, uuid_1.generateUuid)()) {
            super(enabled, hitCondition, condition, logMessage, id);
            this.name = name;
        }
        toJSON() {
            const result = super.toJSON();
            result.name = this.name;
            return result;
        }
        get supported() {
            if (!this.data) {
                return true;
            }
            return this.data.supportsFunctionBreakpoints;
        }
        toString() {
            return this.name;
        }
    }
    exports.FunctionBreakpoint = FunctionBreakpoint;
    class DataBreakpoint extends BaseBreakpoint {
        constructor(description, dataId, canPersist, enabled, hitCondition, condition, logMessage, accessTypes, accessType, id = (0, uuid_1.generateUuid)()) {
            super(enabled, hitCondition, condition, logMessage, id);
            this.description = description;
            this.dataId = dataId;
            this.canPersist = canPersist;
            this.accessTypes = accessTypes;
            this.accessType = accessType;
        }
        toJSON() {
            const result = super.toJSON();
            result.description = this.description;
            result.dataId = this.dataId;
            result.accessTypes = this.accessTypes;
            result.accessType = this.accessType;
            return result;
        }
        get supported() {
            if (!this.data) {
                return true;
            }
            return this.data.supportsDataBreakpoints;
        }
        toString() {
            return this.description;
        }
    }
    exports.DataBreakpoint = DataBreakpoint;
    class ExceptionBreakpoint extends BaseBreakpoint {
        constructor(filter, label, enabled, supportsCondition, condition, description, conditionDescription, fallback = false) {
            super(enabled, undefined, condition, undefined, (0, uuid_1.generateUuid)());
            this.filter = filter;
            this.label = label;
            this.supportsCondition = supportsCondition;
            this.description = description;
            this.conditionDescription = conditionDescription;
            this.fallback = fallback;
            this.supportedSessions = new Set();
        }
        toJSON() {
            const result = Object.create(null);
            result.filter = this.filter;
            result.label = this.label;
            result.enabled = this.enabled;
            result.supportsCondition = this.supportsCondition;
            result.conditionDescription = this.conditionDescription;
            result.condition = this.condition;
            result.fallback = this.fallback;
            result.description = this.description;
            return result;
        }
        setSupportedSession(sessionId, supported) {
            if (supported) {
                this.supportedSessions.add(sessionId);
            }
            else {
                this.supportedSessions.delete(sessionId);
            }
        }
        /**
         * Used to specify which breakpoints to show when no session is specified.
         * Useful when no session is active and we want to show the exception breakpoints from the last session.
         */
        setFallback(isFallback) {
            this.fallback = isFallback;
        }
        get supported() {
            return true;
        }
        /**
         * Checks if the breakpoint is applicable for the specified session.
         * If sessionId is undefined, returns true if this breakpoint is a fallback breakpoint.
         */
        isSupportedSession(sessionId) {
            return sessionId ? this.supportedSessions.has(sessionId) : this.fallback;
        }
        matches(filter) {
            return this.filter === filter.filter && this.label === filter.label && this.supportsCondition === !!filter.supportsCondition && this.conditionDescription === filter.conditionDescription && this.description === filter.description;
        }
        toString() {
            return this.label;
        }
    }
    exports.ExceptionBreakpoint = ExceptionBreakpoint;
    class InstructionBreakpoint extends BaseBreakpoint {
        constructor(instructionReference, offset, canPersist, enabled, hitCondition, condition, logMessage, address, id = (0, uuid_1.generateUuid)()) {
            super(enabled, hitCondition, condition, logMessage, id);
            this.instructionReference = instructionReference;
            this.offset = offset;
            this.canPersist = canPersist;
            this.address = address;
        }
        toJSON() {
            const result = super.toJSON();
            result.instructionReference = this.instructionReference;
            result.offset = this.offset;
            return result;
        }
        get supported() {
            if (!this.data) {
                return true;
            }
            return this.data.supportsInstructionBreakpoints;
        }
        toString() {
            return this.instructionReference;
        }
    }
    exports.InstructionBreakpoint = InstructionBreakpoint;
    class ThreadAndSessionIds {
        constructor(sessionId, threadId) {
            this.sessionId = sessionId;
            this.threadId = threadId;
        }
        getId() {
            return `${this.sessionId}:${this.threadId}`;
        }
    }
    exports.ThreadAndSessionIds = ThreadAndSessionIds;
    let DebugModel = class DebugModel extends lifecycle_1.Disposable {
        constructor(debugStorage, textFileService, uriIdentityService, logService) {
            super();
            this.textFileService = textFileService;
            this.uriIdentityService = uriIdentityService;
            this.logService = logService;
            this.schedulers = new Map();
            this.breakpointsActivated = true;
            this._onDidChangeBreakpoints = this._register(new event_1.Emitter());
            this._onDidChangeCallStack = this._register(new event_1.Emitter());
            this._onDidChangeWatchExpressions = this._register(new event_1.Emitter());
            this._register((0, observable_1.autorun)(reader => {
                this.breakpoints = debugStorage.breakpoints.read(reader);
                this.functionBreakpoints = debugStorage.functionBreakpoints.read(reader);
                this.exceptionBreakpoints = debugStorage.exceptionBreakpoints.read(reader);
                this.dataBreakpoints = debugStorage.dataBreakpoints.read(reader);
                this._onDidChangeBreakpoints.fire(undefined);
            }));
            this._register((0, observable_1.autorun)(reader => {
                this.watchExpressions = debugStorage.watchExpressions.read(reader);
                this._onDidChangeWatchExpressions.fire(undefined);
            }));
            this.instructionBreakpoints = [];
            this.sessions = [];
        }
        getId() {
            return 'root';
        }
        getSession(sessionId, includeInactive = false) {
            if (sessionId) {
                return this.getSessions(includeInactive).find(s => s.getId() === sessionId);
            }
            return undefined;
        }
        getSessions(includeInactive = false) {
            // By default do not return inactive sessions.
            // However we are still holding onto inactive sessions due to repl and debug service session revival (eh scenario)
            return this.sessions.filter(s => includeInactive || s.state !== 0 /* State.Inactive */);
        }
        addSession(session) {
            this.sessions = this.sessions.filter(s => {
                if (s.getId() === session.getId()) {
                    // Make sure to de-dupe if a session is re-initialized. In case of EH debugging we are adding a session again after an attach.
                    return false;
                }
                if (s.state === 0 /* State.Inactive */ && s.configuration.name === session.configuration.name) {
                    // Make sure to remove all inactive sessions that are using the same configuration as the new session
                    return false;
                }
                return true;
            });
            let i = 1;
            while (this.sessions.some(s => s.getLabel() === session.getLabel())) {
                session.setName(`${session.configuration.name} ${++i}`);
            }
            let index = -1;
            if (session.parentSession) {
                // Make sure that child sessions are placed after the parent session
                index = (0, arraysFind_1.findLastIdx)(this.sessions, s => s.parentSession === session.parentSession || s === session.parentSession);
            }
            if (index >= 0) {
                this.sessions.splice(index + 1, 0, session);
            }
            else {
                this.sessions.push(session);
            }
            this._onDidChangeCallStack.fire(undefined);
        }
        get onDidChangeBreakpoints() {
            return this._onDidChangeBreakpoints.event;
        }
        get onDidChangeCallStack() {
            return this._onDidChangeCallStack.event;
        }
        get onDidChangeWatchExpressions() {
            return this._onDidChangeWatchExpressions.event;
        }
        rawUpdate(data) {
            const session = this.sessions.find(p => p.getId() === data.sessionId);
            if (session) {
                session.rawUpdate(data);
                this._onDidChangeCallStack.fire(undefined);
            }
        }
        clearThreads(id, removeThreads, reference = undefined) {
            const session = this.sessions.find(p => p.getId() === id);
            this.schedulers.forEach(entry => {
                entry.scheduler.dispose();
                entry.completeDeferred.complete();
            });
            this.schedulers.clear();
            if (session) {
                session.clearThreads(removeThreads, reference);
                this._onDidChangeCallStack.fire(undefined);
            }
        }
        /**
         * Update the call stack and notify the call stack view that changes have occurred.
         */
        async fetchCallstack(thread, levels) {
            if (thread.reachedEndOfCallStack) {
                return;
            }
            const totalFrames = thread.stoppedDetails?.totalFrames;
            const remainingFrames = (typeof totalFrames === 'number') ? (totalFrames - thread.getCallStack().length) : undefined;
            if (!levels || (remainingFrames && levels > remainingFrames)) {
                levels = remainingFrames;
            }
            if (levels && levels > 0) {
                await thread.fetchCallStack(levels);
                this._onDidChangeCallStack.fire();
            }
            return;
        }
        refreshTopOfCallstack(thread) {
            if (thread.session.capabilities.supportsDelayedStackTraceLoading) {
                // For improved performance load the first stack frame and then load the rest async.
                let topCallStack = Promise.resolve();
                const wholeCallStack = new Promise((c, e) => {
                    topCallStack = thread.fetchCallStack(1).then(() => {
                        if (!this.schedulers.has(thread.getId())) {
                            const deferred = new async_1.DeferredPromise();
                            this.schedulers.set(thread.getId(), {
                                completeDeferred: deferred,
                                scheduler: new async_1.RunOnceScheduler(() => {
                                    thread.fetchCallStack(19).then(() => {
                                        const stale = thread.getStaleCallStack();
                                        const current = thread.getCallStack();
                                        let bottomOfCallStackChanged = stale.length !== current.length;
                                        for (let i = 1; i < stale.length && !bottomOfCallStackChanged; i++) {
                                            bottomOfCallStackChanged = !stale[i].equals(current[i]);
                                        }
                                        if (bottomOfCallStackChanged) {
                                            this._onDidChangeCallStack.fire();
                                        }
                                    }).finally(() => {
                                        deferred.complete();
                                        this.schedulers.delete(thread.getId());
                                    });
                                }, 420)
                            });
                        }
                        const entry = this.schedulers.get(thread.getId());
                        entry.scheduler.schedule();
                        entry.completeDeferred.p.then(c, e);
                        this._onDidChangeCallStack.fire();
                    });
                });
                return { topCallStack, wholeCallStack };
            }
            const wholeCallStack = thread.fetchCallStack();
            return { wholeCallStack, topCallStack: wholeCallStack };
        }
        getBreakpoints(filter) {
            if (filter) {
                const uriStr = filter.uri?.toString();
                const originalUriStr = filter.originalUri?.toString();
                return this.breakpoints.filter(bp => {
                    if (uriStr && bp.uri.toString() !== uriStr) {
                        return false;
                    }
                    if (originalUriStr && bp.originalUri.toString() !== originalUriStr) {
                        return false;
                    }
                    if (filter.lineNumber && bp.lineNumber !== filter.lineNumber) {
                        return false;
                    }
                    if (filter.column && bp.column !== filter.column) {
                        return false;
                    }
                    if (filter.enabledOnly && (!this.breakpointsActivated || !bp.enabled)) {
                        return false;
                    }
                    return true;
                });
            }
            return this.breakpoints;
        }
        getFunctionBreakpoints() {
            return this.functionBreakpoints;
        }
        getDataBreakpoints() {
            return this.dataBreakpoints;
        }
        getExceptionBreakpoints() {
            return this.exceptionBreakpoints;
        }
        getExceptionBreakpointsForSession(sessionId) {
            return this.exceptionBreakpoints.filter(ebp => ebp.isSupportedSession(sessionId));
        }
        getInstructionBreakpoints() {
            return this.instructionBreakpoints;
        }
        setExceptionBreakpointsForSession(sessionId, data) {
            if (data) {
                let didChangeBreakpoints = false;
                data.forEach(d => {
                    let ebp = this.exceptionBreakpoints.filter((exbp) => exbp.matches(d)).pop();
                    if (!ebp) {
                        didChangeBreakpoints = true;
                        ebp = new ExceptionBreakpoint(d.filter, d.label, !!d.default, !!d.supportsCondition, undefined /* condition */, d.description, d.conditionDescription);
                        this.exceptionBreakpoints.push(ebp);
                    }
                    ebp.setSupportedSession(sessionId, true);
                });
                if (didChangeBreakpoints) {
                    this._onDidChangeBreakpoints.fire(undefined);
                }
            }
        }
        removeExceptionBreakpointsForSession(sessionId) {
            this.exceptionBreakpoints.forEach(ebp => ebp.setSupportedSession(sessionId, false));
        }
        // Set last focused session as fallback session.
        // This is done to keep track of the exception breakpoints to show when no session is active.
        setExceptionBreakpointFallbackSession(sessionId) {
            this.exceptionBreakpoints.forEach(ebp => ebp.setFallback(ebp.isSupportedSession(sessionId)));
        }
        setExceptionBreakpointCondition(exceptionBreakpoint, condition) {
            exceptionBreakpoint.condition = condition;
            this._onDidChangeBreakpoints.fire(undefined);
        }
        areBreakpointsActivated() {
            return this.breakpointsActivated;
        }
        setBreakpointsActivated(activated) {
            this.breakpointsActivated = activated;
            this._onDidChangeBreakpoints.fire(undefined);
        }
        addBreakpoints(uri, rawData, fireEvent = true) {
            const newBreakpoints = rawData.map(rawBp => new Breakpoint(uri, rawBp.lineNumber, rawBp.column, rawBp.enabled === false ? false : true, rawBp.condition, rawBp.hitCondition, rawBp.logMessage, undefined, this.textFileService, this.uriIdentityService, this.logService, rawBp.id));
            this.breakpoints = this.breakpoints.concat(newBreakpoints);
            this.breakpointsActivated = true;
            this.sortAndDeDup();
            if (fireEvent) {
                this._onDidChangeBreakpoints.fire({ added: newBreakpoints, sessionOnly: false });
            }
            return newBreakpoints;
        }
        removeBreakpoints(toRemove) {
            this.breakpoints = this.breakpoints.filter(bp => !toRemove.some(toRemove => toRemove.getId() === bp.getId()));
            this._onDidChangeBreakpoints.fire({ removed: toRemove, sessionOnly: false });
        }
        updateBreakpoints(data) {
            const updated = [];
            this.breakpoints.forEach(bp => {
                const bpData = data.get(bp.getId());
                if (bpData) {
                    bp.update(bpData);
                    updated.push(bp);
                }
            });
            this.sortAndDeDup();
            this._onDidChangeBreakpoints.fire({ changed: updated, sessionOnly: false });
        }
        setBreakpointSessionData(sessionId, capabilites, data) {
            this.breakpoints.forEach(bp => {
                if (!data) {
                    bp.setSessionData(sessionId, undefined);
                }
                else {
                    const bpData = data.get(bp.getId());
                    if (bpData) {
                        bp.setSessionData(sessionId, toBreakpointSessionData(bpData, capabilites));
                    }
                }
            });
            this.functionBreakpoints.forEach(fbp => {
                if (!data) {
                    fbp.setSessionData(sessionId, undefined);
                }
                else {
                    const fbpData = data.get(fbp.getId());
                    if (fbpData) {
                        fbp.setSessionData(sessionId, toBreakpointSessionData(fbpData, capabilites));
                    }
                }
            });
            this.dataBreakpoints.forEach(dbp => {
                if (!data) {
                    dbp.setSessionData(sessionId, undefined);
                }
                else {
                    const dbpData = data.get(dbp.getId());
                    if (dbpData) {
                        dbp.setSessionData(sessionId, toBreakpointSessionData(dbpData, capabilites));
                    }
                }
            });
            this.exceptionBreakpoints.forEach(ebp => {
                if (!data) {
                    ebp.setSessionData(sessionId, undefined);
                }
                else {
                    const ebpData = data.get(ebp.getId());
                    if (ebpData) {
                        ebp.setSessionData(sessionId, toBreakpointSessionData(ebpData, capabilites));
                    }
                }
            });
            this.instructionBreakpoints.forEach(ibp => {
                if (!data) {
                    ibp.setSessionData(sessionId, undefined);
                }
                else {
                    const ibpData = data.get(ibp.getId());
                    if (ibpData) {
                        ibp.setSessionData(sessionId, toBreakpointSessionData(ibpData, capabilites));
                    }
                }
            });
            this._onDidChangeBreakpoints.fire({
                sessionOnly: true
            });
        }
        getDebugProtocolBreakpoint(breakpointId, sessionId) {
            const bp = this.breakpoints.find(bp => bp.getId() === breakpointId);
            if (bp) {
                return bp.getDebugProtocolBreakpoint(sessionId);
            }
            return undefined;
        }
        sortAndDeDup() {
            this.breakpoints = this.breakpoints.sort((first, second) => {
                if (first.uri.toString() !== second.uri.toString()) {
                    return resources.basenameOrAuthority(first.uri).localeCompare(resources.basenameOrAuthority(second.uri));
                }
                if (first.lineNumber === second.lineNumber) {
                    if (first.column && second.column) {
                        return first.column - second.column;
                    }
                    return 1;
                }
                return first.lineNumber - second.lineNumber;
            });
            this.breakpoints = (0, arrays_1.distinct)(this.breakpoints, bp => `${bp.uri.toString()}:${bp.lineNumber}:${bp.column}`);
        }
        setEnablement(element, enable) {
            if (element instanceof Breakpoint || element instanceof FunctionBreakpoint || element instanceof ExceptionBreakpoint || element instanceof DataBreakpoint || element instanceof InstructionBreakpoint) {
                const changed = [];
                if (element.enabled !== enable && (element instanceof Breakpoint || element instanceof FunctionBreakpoint || element instanceof DataBreakpoint || element instanceof InstructionBreakpoint)) {
                    changed.push(element);
                }
                element.enabled = enable;
                if (enable) {
                    this.breakpointsActivated = true;
                }
                this._onDidChangeBreakpoints.fire({ changed: changed, sessionOnly: false });
            }
        }
        enableOrDisableAllBreakpoints(enable) {
            const changed = [];
            this.breakpoints.forEach(bp => {
                if (bp.enabled !== enable) {
                    changed.push(bp);
                }
                bp.enabled = enable;
            });
            this.functionBreakpoints.forEach(fbp => {
                if (fbp.enabled !== enable) {
                    changed.push(fbp);
                }
                fbp.enabled = enable;
            });
            this.dataBreakpoints.forEach(dbp => {
                if (dbp.enabled !== enable) {
                    changed.push(dbp);
                }
                dbp.enabled = enable;
            });
            this.instructionBreakpoints.forEach(ibp => {
                if (ibp.enabled !== enable) {
                    changed.push(ibp);
                }
                ibp.enabled = enable;
            });
            if (enable) {
                this.breakpointsActivated = true;
            }
            this._onDidChangeBreakpoints.fire({ changed: changed, sessionOnly: false });
        }
        addFunctionBreakpoint(functionName, id) {
            const newFunctionBreakpoint = new FunctionBreakpoint(functionName, true, undefined, undefined, undefined, id);
            this.functionBreakpoints.push(newFunctionBreakpoint);
            this._onDidChangeBreakpoints.fire({ added: [newFunctionBreakpoint], sessionOnly: false });
            return newFunctionBreakpoint;
        }
        updateFunctionBreakpoint(id, update) {
            const functionBreakpoint = this.functionBreakpoints.find(fbp => fbp.getId() === id);
            if (functionBreakpoint) {
                if (typeof update.name === 'string') {
                    functionBreakpoint.name = update.name;
                }
                if (typeof update.condition === 'string') {
                    functionBreakpoint.condition = update.condition;
                }
                if (typeof update.hitCondition === 'string') {
                    functionBreakpoint.hitCondition = update.hitCondition;
                }
                this._onDidChangeBreakpoints.fire({ changed: [functionBreakpoint], sessionOnly: false });
            }
        }
        removeFunctionBreakpoints(id) {
            let removed;
            if (id) {
                removed = this.functionBreakpoints.filter(fbp => fbp.getId() === id);
                this.functionBreakpoints = this.functionBreakpoints.filter(fbp => fbp.getId() !== id);
            }
            else {
                removed = this.functionBreakpoints;
                this.functionBreakpoints = [];
            }
            this._onDidChangeBreakpoints.fire({ removed, sessionOnly: false });
        }
        addDataBreakpoint(label, dataId, canPersist, accessTypes, accessType) {
            const newDataBreakpoint = new DataBreakpoint(label, dataId, canPersist, true, undefined, undefined, undefined, accessTypes, accessType);
            this.dataBreakpoints.push(newDataBreakpoint);
            this._onDidChangeBreakpoints.fire({ added: [newDataBreakpoint], sessionOnly: false });
        }
        removeDataBreakpoints(id) {
            let removed;
            if (id) {
                removed = this.dataBreakpoints.filter(fbp => fbp.getId() === id);
                this.dataBreakpoints = this.dataBreakpoints.filter(fbp => fbp.getId() !== id);
            }
            else {
                removed = this.dataBreakpoints;
                this.dataBreakpoints = [];
            }
            this._onDidChangeBreakpoints.fire({ removed, sessionOnly: false });
        }
        addInstructionBreakpoint(instructionReference, offset, address, condition, hitCondition) {
            const newInstructionBreakpoint = new InstructionBreakpoint(instructionReference, offset, false, true, hitCondition, condition, undefined, address);
            this.instructionBreakpoints.push(newInstructionBreakpoint);
            this._onDidChangeBreakpoints.fire({ added: [newInstructionBreakpoint], sessionOnly: true });
        }
        removeInstructionBreakpoints(instructionReference, offset) {
            let removed = [];
            if (instructionReference) {
                for (let i = 0; i < this.instructionBreakpoints.length; i++) {
                    const ibp = this.instructionBreakpoints[i];
                    if (ibp.instructionReference === instructionReference && (offset === undefined || ibp.offset === offset)) {
                        removed.push(ibp);
                        this.instructionBreakpoints.splice(i--, 1);
                    }
                }
            }
            else {
                removed = this.instructionBreakpoints;
                this.instructionBreakpoints = [];
            }
            this._onDidChangeBreakpoints.fire({ removed, sessionOnly: false });
        }
        getWatchExpressions() {
            return this.watchExpressions;
        }
        addWatchExpression(name) {
            const we = new Expression(name || '');
            this.watchExpressions.push(we);
            this._onDidChangeWatchExpressions.fire(we);
            return we;
        }
        renameWatchExpression(id, newName) {
            const filtered = this.watchExpressions.filter(we => we.getId() === id);
            if (filtered.length === 1) {
                filtered[0].name = newName;
                this._onDidChangeWatchExpressions.fire(filtered[0]);
            }
        }
        removeWatchExpressions(id = null) {
            this.watchExpressions = id ? this.watchExpressions.filter(we => we.getId() !== id) : [];
            this._onDidChangeWatchExpressions.fire(undefined);
        }
        moveWatchExpression(id, position) {
            const we = this.watchExpressions.find(we => we.getId() === id);
            if (we) {
                this.watchExpressions = this.watchExpressions.filter(we => we.getId() !== id);
                this.watchExpressions = this.watchExpressions.slice(0, position).concat(we, this.watchExpressions.slice(position));
                this._onDidChangeWatchExpressions.fire(undefined);
            }
        }
        sourceIsNotAvailable(uri) {
            this.sessions.forEach(s => {
                const source = s.getSourceForUri(uri);
                if (source) {
                    source.available = false;
                }
            });
            this._onDidChangeCallStack.fire(undefined);
        }
    };
    exports.DebugModel = DebugModel;
    exports.DebugModel = DebugModel = __decorate([
        __param(1, textfiles_1.ITextFileService),
        __param(2, uriIdentity_1.IUriIdentityService),
        __param(3, log_1.ILogService)
    ], DebugModel);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2RlYnVnL2NvbW1vbi9kZWJ1Z01vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWdDaEcsTUFBYSxtQkFBbUI7aUJBRVIsY0FBUyxHQUFHLElBQUksR0FBRyxFQUFrQixBQUE1QixDQUE2QjtRQUM3RCw4Q0FBOEM7aUJBQ3RCLG9CQUFlLEdBQUcsR0FBRyxBQUFOLENBQU87UUFPOUMsWUFDVyxPQUFrQyxFQUN6QixRQUE0QixFQUN2QyxVQUE4QixFQUNyQixFQUFVLEVBQ3BCLGlCQUFxQyxDQUFDLEVBQ3RDLG1CQUF1QyxDQUFDLEVBQ3hDLGtCQUFzQyxTQUFTLEVBQzlDLG1CQUF1QyxDQUFDLEVBQ3pDLG1CQUF1RSxTQUFTO1lBUjdFLFlBQU8sR0FBUCxPQUFPLENBQTJCO1lBQ3pCLGFBQVEsR0FBUixRQUFRLENBQW9CO1lBQ3ZDLGVBQVUsR0FBVixVQUFVLENBQW9CO1lBQ3JCLE9BQUUsR0FBRixFQUFFLENBQVE7WUFDcEIsbUJBQWMsR0FBZCxjQUFjLENBQXdCO1lBQ3RDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBd0I7WUFDeEMsb0JBQWUsR0FBZixlQUFlLENBQWdDO1lBQzlDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBd0I7WUFDekMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFnRTtZQWJqRixpQkFBWSxHQUFHLEtBQUssQ0FBQztZQUNwQixXQUFNLEdBQVcsRUFBRSxDQUFDO1FBYXhCLENBQUM7UUFFTCxJQUFJLFNBQVM7WUFDWixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDeEIsQ0FBQztRQUVELElBQUksU0FBUyxDQUFDLEtBQXlCO1lBQ3RDLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1lBQ3hCLElBQUksQ0FB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