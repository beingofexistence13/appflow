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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/hash", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/resources", "vs/base/common/types", "vs/base/common/uri", "vs/base/common/uuid", "vs/editor/common/core/range", "vs/nls!vs/workbench/contrib/debug/common/debugModel", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugSource", "vs/workbench/contrib/debug/common/disassemblyViewInput", "vs/workbench/services/textfile/common/textfiles", "vs/platform/log/common/log", "vs/base/common/observable", "vs/base/common/arraysFind"], function (require, exports, arrays_1, async_1, buffer_1, cancellation_1, hash_1, event_1, lifecycle_1, objects_1, resources, types_1, uri_1, uuid_1, range_1, nls, uriIdentity_1, debug_1, debugSource_1, disassemblyViewInput_1, textfiles_1, log_1, observable_1, arraysFind_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$YFb = exports.$XFb = exports.$WFb = exports.$VFb = exports.$UFb = exports.$TFb = exports.$SFb = exports.$RFb = exports.$QFb = exports.$PFb = exports.$OFb = exports.$NFb = exports.$MFb = exports.$LFb = exports.$KFb = exports.$JFb = exports.$IFb = exports.$HFb = void 0;
    class $HFb {
        static { this.allValues = new Map(); }
        // Use chunks to support variable paging #9537
        static { this.a = 100; }
        constructor(g, h, j, k, namedVariables = 0, indexedVariables = 0, memoryReference = undefined, l = 0, presentationHint = undefined) {
            this.g = g;
            this.h = h;
            this.j = j;
            this.k = k;
            this.namedVariables = namedVariables;
            this.indexedVariables = indexedVariables;
            this.memoryReference = memoryReference;
            this.l = l;
            this.presentationHint = presentationHint;
            this.valueChanged = false;
            this.b = '';
        }
        get reference() {
            return this.j;
        }
        set reference(value) {
            this.j = value;
            this.f = undefined; // invalidate children cache
        }
        async evaluateLazy() {
            if (typeof this.reference === 'undefined') {
                return;
            }
            const response = await this.g.variables(this.reference, this.h, undefined, undefined, undefined);
            if (!response || !response.body || !response.body.variables || response.body.variables.length !== 1) {
                return;
            }
            const dummyVar = response.body.variables[0];
            this.reference = dummyVar.variablesReference;
            this.b = dummyVar.value;
            this.namedVariables = dummyVar.namedVariables;
            this.indexedVariables = dummyVar.indexedVariables;
            this.memoryReference = dummyVar.memoryReference;
            this.presentationHint = dummyVar.presentationHint;
            // Also call overridden method to adopt subclass props
            this.m(dummyVar);
        }
        m(response) {
        }
        getChildren() {
            if (!this.f) {
                this.f = this.n();
            }
            return this.f;
        }
        async n() {
            if (!this.hasChildren) {
                return [];
            }
            if (!this.q) {
                return this.o(undefined, undefined, undefined);
            }
            // Check if object has named variables, fetch them independent from indexed variables #9670
            const children = this.namedVariables ? await this.o(undefined, undefined, 'named') : [];
            // Use a dynamic chunk size based on the number of elements #9774
            let chunkSize = $HFb.a;
            while (!!this.indexedVariables && this.indexedVariables > chunkSize * $HFb.a) {
                chunkSize *= $HFb.a;
            }
            if (!!this.indexedVariables && this.indexedVariables > chunkSize) {
                // There are a lot of children, create fake intermediate values that represent chunks #9537
                const numberOfChunks = Math.ceil(this.indexedVariables / chunkSize);
                for (let i = 0; i < numberOfChunks; i++) {
                    const start = (this.l || 0) + i * chunkSize;
                    const count = Math.min(chunkSize, this.indexedVariables - i * chunkSize);
                    children.push(new $JFb(this.g, this.h, this, this.reference, `[${start}..${start + count - 1}]`, '', '', undefined, count, undefined, { kind: 'virtual' }, undefined, undefined, true, start));
                }
                return children;
            }
            const variables = await this.o(this.l, this.indexedVariables, 'indexed');
            return children.concat(variables);
        }
        getId() {
            return this.k;
        }
        getSession() {
            return this.g;
        }
        get value() {
            return this.b;
        }
        get hasChildren() {
            // only variables with reference > 0 have children.
            return !!this.reference && this.reference > 0 && !this.presentationHint?.lazy;
        }
        async o(start, count, filter) {
            try {
                const response = await this.g.variables(this.reference || 0, this.h, filter, start, count);
                if (!response || !response.body || !response.body.variables) {
                    return [];
                }
                const nameCount = new Map();
                const vars = response.body.variables.filter(v => !!v).map((v) => {
                    if ((0, types_1.$jf)(v.value) && (0, types_1.$jf)(v.name) && typeof v.variablesReference === 'number') {
                        const count = nameCount.get(v.name) || 0;
                        const idDuplicationIndex = count > 0 ? count.toString() : '';
                        nameCount.set(v.name, count + 1);
                        return new $JFb(this.g, this.h, this, v.variablesReference, v.name, v.evaluateName, v.value, v.namedVariables, v.indexedVariables, v.memoryReference, v.presentationHint, v.type, v.__vscodeVariableMenuContext, true, 0, idDuplicationIndex);
                    }
                    return new $JFb(this.g, this.h, this, 0, '', undefined, nls.localize(0, null), 0, 0, undefined, { kind: 'virtual' }, undefined, undefined, false);
                });
                if (this.g.autoExpandLazyVariables) {
                    await Promise.all(vars.map(v => v.presentationHint?.lazy && v.evaluateLazy()));
                }
                return vars;
            }
            catch (e) {
                return [new $JFb(this.g, this.h, this, 0, '', undefined, e.message, 0, 0, undefined, { kind: 'virtual' }, undefined, undefined, false)];
            }
        }
        // The adapter explicitly sents the children count of an expression only if there are lots of children which should be chunked.
        get q() {
            return !!this.indexedVariables;
        }
        set value(value) {
            this.b = value;
            this.valueChanged = !!$HFb.allValues.get(this.getId()) &&
                $HFb.allValues.get(this.getId()) !== $IFb.DEFAULT_VALUE && $HFb.allValues.get(this.getId()) !== value;
            $HFb.allValues.set(this.getId(), value);
        }
        toString() {
            return this.value;
        }
        async evaluateExpression(expression, session, stackFrame, context, keepLazyVars = false) {
            if (!session || (!stackFrame && context !== 'repl')) {
                this.value = context === 'repl' ? nls.localize(1, null) : $IFb.DEFAULT_VALUE;
                this.reference = 0;
                return false;
            }
            this.g = session;
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
    exports.$HFb = $HFb;
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
    class $IFb extends $HFb {
        static { this.DEFAULT_VALUE = nls.localize(2, null); }
        constructor(name, id = (0, uuid_1.$4f)()) {
            super(undefined, undefined, 0, id);
            this.name = name;
            this.available = false;
            // name is not set if the expression is just being added
            // in that case do not set default value to prevent flashing #14499
            if (name) {
                this.value = $IFb.DEFAULT_VALUE;
            }
        }
        async evaluate(session, stackFrame, context, keepLazyVars) {
            this.available = await this.evaluateExpression(this.name, session, stackFrame, context, keepLazyVars);
        }
        toString() {
            return `${this.name}\n${this.value}`;
        }
        async setExpression(value, stackFrame) {
            if (!this.g) {
                return;
            }
            const response = await this.g.setExpression(stackFrame.frameId, this.name, value);
            handleSetResponse(this, response);
        }
    }
    exports.$IFb = $IFb;
    class $JFb extends $HFb {
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
            if (!this.g) {
                return;
            }
            try {
                // Send out a setExpression for debug extensions that do not support set variables https://github.com/microsoft/vscode/issues/124679#issuecomment-869844437
                if (this.g.capabilities.supportsSetExpression && !this.g.capabilities.supportsSetVariable && this.evaluateName) {
                    return this.setExpression(value, stackFrame);
                }
                const response = await this.g.setVariable(this.parent.reference, this.name, value);
                handleSetResponse(this, response);
            }
            catch (err) {
                this.errorMessage = err.message;
            }
        }
        async setExpression(value, stackFrame) {
            if (!this.g || !this.evaluateName) {
                return;
            }
            const response = await this.g.setExpression(stackFrame.frameId, this.evaluateName, value);
            handleSetResponse(this, response);
        }
        toString() {
            return this.name ? `${this.name}: ${this.value}` : this.value;
        }
        m(response) {
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
    exports.$JFb = $JFb;
    class $KFb extends $HFb {
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
    exports.$KFb = $KFb;
    class $LFb extends $KFb {
        constructor(stackFrame, index, message) {
            super(stackFrame, index, message, 0, false);
        }
        toString() {
            return this.name;
        }
    }
    exports.$LFb = $LFb;
    class $MFb {
        constructor(thread, frameId, source, name, presentationHint, range, b, canRestart, instructionPointerReference) {
            this.thread = thread;
            this.frameId = frameId;
            this.source = source;
            this.name = name;
            this.presentationHint = presentationHint;
            this.range = range;
            this.b = b;
            this.canRestart = canRestart;
            this.instructionPointerReference = instructionPointerReference;
        }
        getId() {
            return `stackframe:${this.thread.getId()}:${this.b}:${this.source.name}`;
        }
        getScopes() {
            if (!this.a) {
                this.a = this.thread.session.scopes(this.frameId, this.thread.threadId).then(response => {
                    if (!response || !response.body || !response.body.scopes) {
                        return [];
                    }
                    const usedIds = new Set();
                    return response.body.scopes.map(rs => {
                        // form the id based on the name and location so that it's the
                        // same across multiple pauses to retain expansion state
                        let id = 0;
                        do {
                            id = (0, hash_1.$si)(`${rs.name}:${rs.line}:${rs.column}`, id);
                        } while (usedIds.has(id));
                        usedIds.add(id);
                        return new $KFb(this, id, rs.name, rs.variablesReference, rs.expensive, rs.namedVariables, rs.indexedVariables, rs.line && rs.column && rs.endLine && rs.endColumn ? new range_1.$ks(rs.line, rs.column, rs.endLine, rs.endColumn) : undefined);
                    });
                }, err => [new $LFb(this, 0, err.message)]);
            }
            return this.a;
        }
        async getMostSpecificScopes(range) {
            const scopes = await this.getScopes();
            const nonExpensiveScopes = scopes.filter(s => !s.expensive);
            const haveRangeInfo = nonExpensiveScopes.some(s => !!s.range);
            if (!haveRangeInfo) {
                return nonExpensiveScopes;
            }
            const scopesContainingRange = nonExpensiveScopes.filter(scope => scope.range && range_1.$ks.containsRange(scope.range, range))
                .sort((first, second) => (first.range.endLineNumber - first.range.startLineNumber) - (second.range.endLineNumber - second.range.startLineNumber));
            return scopesContainingRange.length ? scopesContainingRange : nonExpensiveScopes;
        }
        restart() {
            return this.thread.session.restartFrame(this.frameId, this.thread.threadId);
        }
        forgetScopes() {
            this.a = undefined;
        }
        toString() {
            const lineNumberToString = typeof this.range.startLineNumber === 'number' ? `:${this.range.startLineNumber}` : '';
            const sourceToString = `${this.source.inMemory ? this.source.name : this.source.uri.fsPath}${lineNumberToString}`;
            return sourceToString === debugSource_1.$vF ? this.name : `${this.name} (${sourceToString})`;
        }
        async openInEditor(editorService, preserveFocus, sideBySide, pinned) {
            const threadStopReason = this.thread.stoppedDetails?.reason;
            if (this.instructionPointerReference &&
                (threadStopReason === 'instruction breakpoint' ||
                    (threadStopReason === 'step' && this.thread.lastSteppingGranularity === 'instruction') ||
                    editorService.activeEditor instanceof disassemblyViewInput_1.$GFb)) {
                return editorService.openEditor(disassemblyViewInput_1.$GFb.instance, { pinned: true, revealIfOpened: true });
            }
            if (this.source.available) {
                return this.source.openInEditor(editorService, this.range, preserveFocus, sideBySide, pinned);
            }
            return undefined;
        }
        equals(other) {
            return (this.name === other.name) && (other.thread === this.thread) && (this.frameId === other.frameId) && (other.source === this.source) && (range_1.$ks.equalsRange(this.range, other.range));
        }
    }
    exports.$MFb = $MFb;
    class $NFb {
        constructor(session, name, threadId) {
            this.session = session;
            this.name = name;
            this.threadId = threadId;
            this.f = [];
            this.reachedEndOfCallStack = false;
            this.a = [];
            this.b = [];
            this.stopped = false;
        }
        getId() {
            return `thread:${this.session.getId()}:${this.threadId}`;
        }
        clearCallStack() {
            if (this.a.length) {
                this.b = this.a;
            }
            this.a = [];
            this.f.forEach(c => c.dispose(true));
            this.f = [];
        }
        getCallStack() {
            return this.a;
        }
        getStaleCallStack() {
            return this.b;
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
                    (this.stoppedDetails.reason ? nls.localize(3, null, this.stoppedDetails.reason) : nls.localize(4, null));
            }
            return nls.localize(5, null);
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
                const start = this.a.length;
                const callStack = await this.g(start, levels);
                this.reachedEndOfCallStack = callStack.length < levels;
                if (start < this.a.length) {
                    // Set the stack frames for exact position we requested. To make sure no concurrent requests create duplicate stack frames #30660
                    this.a.splice(start, this.a.length - start);
                }
                this.a = this.a.concat(callStack || []);
                if (typeof this.stoppedDetails?.totalFrames === 'number' && this.stoppedDetails.totalFrames === this.a.length) {
                    this.reachedEndOfCallStack = true;
                }
            }
        }
        async g(startFrame, levels) {
            try {
                const tokenSource = new cancellation_1.$pd();
                this.f.push(tokenSource);
                const response = await this.session.stackTrace(this.threadId, startFrame, levels, tokenSource.token);
                if (!response || !response.body || tokenSource.token.isCancellationRequested) {
                    return [];
                }
                if (this.stoppedDetails) {
                    this.stoppedDetails.totalFrames = response.body.totalFrames;
                }
                return response.body.stackFrames.map((rsf, index) => {
                    const source = this.session.getSource(rsf.source);
                    return new $MFb(this, rsf.id, source, rsf.name, rsf.presentationHint, new range_1.$ks(rsf.line, rsf.column, rsf.endLine || rsf.line, rsf.endColumn || rsf.column), startFrame + index, typeof rsf.canRestart === 'boolean' ? rsf.canRestart : true, rsf.instructionPointerReference);
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
    exports.$NFb = $NFb;
    /**
     * Gets a URI to a memory in the given session ID.
     */
    const $OFb = (sessionId, memoryReference, range, displayName = 'memory') => {
        return uri_1.URI.from({
            scheme: debug_1.$mH,
            authority: sessionId,
            path: '/' + encodeURIComponent(memoryReference) + `/${encodeURIComponent(displayName)}.bin`,
            query: range ? `?range=${range.fromOffset}:${range.toOffset}` : undefined,
        });
    };
    exports.$OFb = $OFb;
    class $PFb extends lifecycle_1.$kc {
        constructor(b, f) {
            super();
            this.b = b;
            this.f = f;
            this.a = this.B(new event_1.$fd());
            /** @inheritdoc */
            this.onDidInvalidate = this.a.event;
            /** @inheritdoc */
            this.writable = !!this.f.capabilities.supportsWriteMemoryRequest;
            this.B(f.onDidInvalidateMemory(e => {
                if (e.body.memoryReference === b) {
                    this.g(e.body.offset, e.body.count - e.body.offset);
                }
            }));
        }
        async read(fromOffset, toOffset) {
            const length = toOffset - fromOffset;
            const offset = fromOffset;
            const result = await this.f.readMemory(this.b, offset, length);
            if (result === undefined || !result.body?.data) {
                return [{ type: 1 /* MemoryRangeType.Unreadable */, offset, length }];
            }
            let data;
            try {
                data = (0, buffer_1.$Yd)(result.body.data);
            }
            catch {
                return [{ type: 2 /* MemoryRangeType.Error */, offset, length, error: 'Invalid base64 data from debug adapter' }];
            }
            const unreadable = result.body.unreadableBytes || 0;
            const dataLength = length - unreadable;
            if (data.byteLength < dataLength) {
                const pad = buffer_1.$Fd.alloc(dataLength - data.byteLength);
                pad.buffer.fill(0);
                data = buffer_1.$Fd.concat([data, pad], dataLength);
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
            const result = await this.f.writeMemory(this.b, offset, (0, buffer_1.$Zd)(data), true);
            const written = result?.body?.bytesWritten ?? data.byteLength;
            this.g(offset, offset + written);
            return written;
        }
        dispose() {
            super.dispose();
        }
        g(fromOffset, toOffset) {
            this.a.fire({ fromOffset, toOffset });
        }
    }
    exports.$PFb = $PFb;
    class $QFb {
        constructor(enabled, a) {
            this.enabled = enabled;
            this.a = a;
        }
        getId() {
            return this.a;
        }
    }
    exports.$QFb = $QFb;
    function toBreakpointSessionData(data, capabilities) {
        return (0, objects_1.$Ym)({
            supportsConditionalBreakpoints: !!capabilities.supportsConditionalBreakpoints,
            supportsHitConditionalBreakpoints: !!capabilities.supportsHitConditionalBreakpoints,
            supportsLogPoints: !!capabilities.supportsLogPoints,
            supportsFunctionBreakpoints: !!capabilities.supportsFunctionBreakpoints,
            supportsDataBreakpoints: !!capabilities.supportsDataBreakpoints,
            supportsInstructionBreakpoints: !!capabilities.supportsInstructionBreakpoints
        }, data);
    }
    class $RFb extends $QFb {
        constructor(enabled, hitCondition, condition, logMessage, id) {
            super(enabled, id);
            this.hitCondition = hitCondition;
            this.condition = condition;
            this.logMessage = logMessage;
            this.b = new Map();
            if (enabled === undefined) {
                this.enabled = true;
            }
        }
        setSessionData(sessionId, data) {
            if (!data) {
                this.b.delete(sessionId);
            }
            else {
                data.sessionId = sessionId;
                this.b.set(sessionId, data);
            }
            const allData = Array.from(this.b.values());
            const verifiedData = (0, arrays_1.$Kb)(allData.filter(d => d.verified), d => `${d.line}:${d.column}`);
            if (verifiedData.length) {
                // In case multiple session verified the breakpoint and they provide different data show the intial data that the user set (corner case)
                this.f = verifiedData.length === 1 ? verifiedData[0] : undefined;
            }
            else {
                // No session verified the breakpoint
                this.f = allData.length ? allData[0] : undefined;
            }
        }
        get message() {
            if (!this.f) {
                return undefined;
            }
            return this.f.message;
        }
        get verified() {
            return this.f ? this.f.verified : true;
        }
        get sessionsThatVerified() {
            const sessionIds = [];
            for (const [sessionId, data] of this.b) {
                if (data.verified) {
                    sessionIds.push(sessionId);
                }
            }
            return sessionIds;
        }
        getIdFromAdapter(sessionId) {
            const data = this.b.get(sessionId);
            return data ? data.id : undefined;
        }
        getDebugProtocolBreakpoint(sessionId) {
            const data = this.b.get(sessionId);
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
    exports.$RFb = $RFb;
    class $SFb extends $RFb {
        constructor(g, h, j, enabled, condition, hitCondition, logMessage, k, l, m, n, id = (0, uuid_1.$4f)()) {
            super(enabled, hitCondition, condition, logMessage, id);
            this.g = g;
            this.h = h;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.n = n;
        }
        get originalUri() {
            return this.g;
        }
        get lineNumber() {
            return this.verified && this.f && typeof this.f.line === 'number' ? this.f.line : this.h;
        }
        get verified() {
            if (this.f) {
                return this.f.verified && !this.l.isDirty(this.g);
            }
            return true;
        }
        get uri() {
            return this.verified && this.f && this.f.source ? (0, debugSource_1.$xF)(this.f.source, this.f.source.path, this.f.sessionId, this.m, this.n) : this.g;
        }
        get column() {
            return this.verified && this.f && typeof this.f.column === 'number' ? this.f.column : this.j;
        }
        get message() {
            if (this.l.isDirty(this.uri)) {
                return nls.localize(6, null);
            }
            return super.message;
        }
        get adapterData() {
            return this.f && this.f.source && this.f.source.adapterData ? this.f.source.adapterData : this.k;
        }
        get endLineNumber() {
            return this.verified && this.f ? this.f.endLine : undefined;
        }
        get endColumn() {
            return this.verified && this.f ? this.f.endColumn : undefined;
        }
        get sessionAgnosticData() {
            return {
                lineNumber: this.h,
                column: this.j
            };
        }
        get supported() {
            if (!this.f) {
                return true;
            }
            if (this.logMessage && !this.f.supportsLogPoints) {
                return false;
            }
            if (this.condition && !this.f.supportsConditionalBreakpoints) {
                return false;
            }
            if (this.hitCondition && !this.f.supportsHitConditionalBreakpoints) {
                return false;
            }
            return true;
        }
        setSessionData(sessionId, data) {
            super.setSessionData(sessionId, data);
            if (!this.k) {
                this.k = this.adapterData;
            }
        }
        toJSON() {
            const result = super.toJSON();
            result.uri = this.g;
            result.lineNumber = this.h;
            result.column = this.j;
            result.adapterData = this.adapterData;
            return result;
        }
        toString() {
            return `${resources.$eg(this.uri)} ${this.lineNumber}`;
        }
        update(data) {
            if (!(0, types_1.$sf)(data.lineNumber)) {
                this.h = data.lineNumber;
            }
            if (!(0, types_1.$sf)(data.column)) {
                this.j = data.column;
            }
            if (!(0, types_1.$sf)(data.condition)) {
                this.condition = data.condition;
            }
            if (!(0, types_1.$sf)(data.hitCondition)) {
                this.hitCondition = data.hitCondition;
            }
            if (!(0, types_1.$sf)(data.logMessage)) {
                this.logMessage = data.logMessage;
            }
        }
    }
    exports.$SFb = $SFb;
    class $TFb extends $RFb {
        constructor(name, enabled, hitCondition, condition, logMessage, id = (0, uuid_1.$4f)()) {
            super(enabled, hitCondition, condition, logMessage, id);
            this.name = name;
        }
        toJSON() {
            const result = super.toJSON();
            result.name = this.name;
            return result;
        }
        get supported() {
            if (!this.f) {
                return true;
            }
            return this.f.supportsFunctionBreakpoints;
        }
        toString() {
            return this.name;
        }
    }
    exports.$TFb = $TFb;
    class $UFb extends $RFb {
        constructor(description, dataId, canPersist, enabled, hitCondition, condition, logMessage, accessTypes, accessType, id = (0, uuid_1.$4f)()) {
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
            if (!this.f) {
                return true;
            }
            return this.f.supportsDataBreakpoints;
        }
        toString() {
            return this.description;
        }
    }
    exports.$UFb = $UFb;
    class $VFb extends $RFb {
        constructor(filter, label, enabled, supportsCondition, condition, description, conditionDescription, h = false) {
            super(enabled, undefined, condition, undefined, (0, uuid_1.$4f)());
            this.filter = filter;
            this.label = label;
            this.supportsCondition = supportsCondition;
            this.description = description;
            this.conditionDescription = conditionDescription;
            this.h = h;
            this.g = new Set();
        }
        toJSON() {
            const result = Object.create(null);
            result.filter = this.filter;
            result.label = this.label;
            result.enabled = this.enabled;
            result.supportsCondition = this.supportsCondition;
            result.conditionDescription = this.conditionDescription;
            result.condition = this.condition;
            result.fallback = this.h;
            result.description = this.description;
            return result;
        }
        setSupportedSession(sessionId, supported) {
            if (supported) {
                this.g.add(sessionId);
            }
            else {
                this.g.delete(sessionId);
            }
        }
        /**
         * Used to specify which breakpoints to show when no session is specified.
         * Useful when no session is active and we want to show the exception breakpoints from the last session.
         */
        setFallback(isFallback) {
            this.h = isFallback;
        }
        get supported() {
            return true;
        }
        /**
         * Checks if the breakpoint is applicable for the specified session.
         * If sessionId is undefined, returns true if this breakpoint is a fallback breakpoint.
         */
        isSupportedSession(sessionId) {
            return sessionId ? this.g.has(sessionId) : this.h;
        }
        matches(filter) {
            return this.filter === filter.filter && this.label === filter.label && this.supportsCondition === !!filter.supportsCondition && this.conditionDescription === filter.conditionDescription && this.description === filter.description;
        }
        toString() {
            return this.label;
        }
    }
    exports.$VFb = $VFb;
    class $WFb extends $RFb {
        constructor(instructionReference, offset, canPersist, enabled, hitCondition, condition, logMessage, address, id = (0, uuid_1.$4f)()) {
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
            if (!this.f) {
                return true;
            }
            return this.f.supportsInstructionBreakpoints;
        }
        toString() {
            return this.instructionReference;
        }
    }
    exports.$WFb = $WFb;
    class $XFb {
        constructor(sessionId, threadId) {
            this.sessionId = sessionId;
            this.threadId = threadId;
        }
        getId() {
            return `${this.sessionId}:${this.threadId}`;
        }
    }
    exports.$XFb = $XFb;
    let $YFb = class $YFb extends lifecycle_1.$kc {
        constructor(debugStorage, y, z, C) {
            super();
            this.y = y;
            this.z = z;
            this.C = C;
            this.b = new Map();
            this.f = true;
            this.g = this.B(new event_1.$fd());
            this.h = this.B(new event_1.$fd());
            this.j = this.B(new event_1.$fd());
            this.B((0, observable_1.autorun)(reader => {
                this.m = debugStorage.breakpoints.read(reader);
                this.n = debugStorage.functionBreakpoints.read(reader);
                this.r = debugStorage.exceptionBreakpoints.read(reader);
                this.t = debugStorage.dataBreakpoints.read(reader);
                this.g.fire(undefined);
            }));
            this.B((0, observable_1.autorun)(reader => {
                this.u = debugStorage.watchExpressions.read(reader);
                this.j.fire(undefined);
            }));
            this.w = [];
            this.a = [];
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
            return this.a.filter(s => includeInactive || s.state !== 0 /* State.Inactive */);
        }
        addSession(session) {
            this.a = this.a.filter(s => {
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
            while (this.a.some(s => s.getLabel() === session.getLabel())) {
                session.setName(`${session.configuration.name} ${++i}`);
            }
            let index = -1;
            if (session.parentSession) {
                // Make sure that child sessions are placed after the parent session
                index = (0, arraysFind_1.$eb)(this.a, s => s.parentSession === session.parentSession || s === session.parentSession);
            }
            if (index >= 0) {
                this.a.splice(index + 1, 0, session);
            }
            else {
                this.a.push(session);
            }
            this.h.fire(undefined);
        }
        get onDidChangeBreakpoints() {
            return this.g.event;
        }
        get onDidChangeCallStack() {
            return this.h.event;
        }
        get onDidChangeWatchExpressions() {
            return this.j.event;
        }
        rawUpdate(data) {
            const session = this.a.find(p => p.getId() === data.sessionId);
            if (session) {
                session.rawUpdate(data);
                this.h.fire(undefined);
            }
        }
        clearThreads(id, removeThreads, reference = undefined) {
            const session = this.a.find(p => p.getId() === id);
            this.b.forEach(entry => {
                entry.scheduler.dispose();
                entry.completeDeferred.complete();
            });
            this.b.clear();
            if (session) {
                session.clearThreads(removeThreads, reference);
                this.h.fire(undefined);
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
                this.h.fire();
            }
            return;
        }
        refreshTopOfCallstack(thread) {
            if (thread.session.capabilities.supportsDelayedStackTraceLoading) {
                // For improved performance load the first stack frame and then load the rest async.
                let topCallStack = Promise.resolve();
                const wholeCallStack = new Promise((c, e) => {
                    topCallStack = thread.fetchCallStack(1).then(() => {
                        if (!this.b.has(thread.getId())) {
                            const deferred = new async_1.$2g();
                            this.b.set(thread.getId(), {
                                completeDeferred: deferred,
                                scheduler: new async_1.$Sg(() => {
                                    thread.fetchCallStack(19).then(() => {
                                        const stale = thread.getStaleCallStack();
                                        const current = thread.getCallStack();
                                        let bottomOfCallStackChanged = stale.length !== current.length;
                                        for (let i = 1; i < stale.length && !bottomOfCallStackChanged; i++) {
                                            bottomOfCallStackChanged = !stale[i].equals(current[i]);
                                        }
                                        if (bottomOfCallStackChanged) {
                                            this.h.fire();
                                        }
                                    }).finally(() => {
                                        deferred.complete();
                                        this.b.delete(thread.getId());
                                    });
                                }, 420)
                            });
                        }
                        const entry = this.b.get(thread.getId());
                        entry.scheduler.schedule();
                        entry.completeDeferred.p.then(c, e);
                        this.h.fire();
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
                return this.m.filter(bp => {
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
                    if (filter.enabledOnly && (!this.f || !bp.enabled)) {
                        return false;
                    }
                    return true;
                });
            }
            return this.m;
        }
        getFunctionBreakpoints() {
            return this.n;
        }
        getDataBreakpoints() {
            return this.t;
        }
        getExceptionBreakpoints() {
            return this.r;
        }
        getExceptionBreakpointsForSession(sessionId) {
            return this.r.filter(ebp => ebp.isSupportedSession(sessionId));
        }
        getInstructionBreakpoints() {
            return this.w;
        }
        setExceptionBreakpointsForSession(sessionId, data) {
            if (data) {
                let didChangeBreakpoints = false;
                data.forEach(d => {
                    let ebp = this.r.filter((exbp) => exbp.matches(d)).pop();
                    if (!ebp) {
                        didChangeBreakpoints = true;
                        ebp = new $VFb(d.filter, d.label, !!d.default, !!d.supportsCondition, undefined /* condition */, d.description, d.conditionDescription);
                        this.r.push(ebp);
                    }
                    ebp.setSupportedSession(sessionId, true);
                });
                if (didChangeBreakpoints) {
                    this.g.fire(undefined);
                }
            }
        }
        removeExceptionBreakpointsForSession(sessionId) {
            this.r.forEach(ebp => ebp.setSupportedSession(sessionId, false));
        }
        // Set last focused session as fallback session.
        // This is done to keep track of the exception breakpoints to show when no session is active.
        setExceptionBreakpointFallbackSession(sessionId) {
            this.r.forEach(ebp => ebp.setFallback(ebp.isSupportedSession(sessionId)));
        }
        setExceptionBreakpointCondition(exceptionBreakpoint, condition) {
            exceptionBreakpoint.condition = condition;
            this.g.fire(undefined);
        }
        areBreakpointsActivated() {
            return this.f;
        }
        setBreakpointsActivated(activated) {
            this.f = activated;
            this.g.fire(undefined);
        }
        addBreakpoints(uri, rawData, fireEvent = true) {
            const newBreakpoints = rawData.map(rawBp => new $SFb(uri, rawBp.lineNumber, rawBp.column, rawBp.enabled === false ? false : true, rawBp.condition, rawBp.hitCondition, rawBp.logMessage, undefined, this.y, this.z, this.C, rawBp.id));
            this.m = this.m.concat(newBreakpoints);
            this.f = true;
            this.D();
            if (fireEvent) {
                this.g.fire({ added: newBreakpoints, sessionOnly: false });
            }
            return newBreakpoints;
        }
        removeBreakpoints(toRemove) {
            this.m = this.m.filter(bp => !toRemove.some(toRemove => toRemove.getId() === bp.getId()));
            this.g.fire({ removed: toRemove, sessionOnly: false });
        }
        updateBreakpoints(data) {
            const updated = [];
            this.m.forEach(bp => {
                const bpData = data.get(bp.getId());
                if (bpData) {
                    bp.update(bpData);
                    updated.push(bp);
                }
            });
            this.D();
            this.g.fire({ changed: updated, sessionOnly: false });
        }
        setBreakpointSessionData(sessionId, capabilites, data) {
            this.m.forEach(bp => {
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
            this.n.forEach(fbp => {
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
            this.t.forEach(dbp => {
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
            this.r.forEach(ebp => {
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
            this.w.forEach(ibp => {
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
            this.g.fire({
                sessionOnly: true
            });
        }
        getDebugProtocolBreakpoint(breakpointId, sessionId) {
            const bp = this.m.find(bp => bp.getId() === breakpointId);
            if (bp) {
                return bp.getDebugProtocolBreakpoint(sessionId);
            }
            return undefined;
        }
        D() {
            this.m = this.m.sort((first, second) => {
                if (first.uri.toString() !== second.uri.toString()) {
                    return resources.$eg(first.uri).localeCompare(resources.$eg(second.uri));
                }
                if (first.lineNumber === second.lineNumber) {
                    if (first.column && second.column) {
                        return first.column - second.column;
                    }
                    return 1;
                }
                return first.lineNumber - second.lineNumber;
            });
            this.m = (0, arrays_1.$Kb)(this.m, bp => `${bp.uri.toString()}:${bp.lineNumber}:${bp.column}`);
        }
        setEnablement(element, enable) {
            if (element instanceof $SFb || element instanceof $TFb || element instanceof $VFb || element instanceof $UFb || element instanceof $WFb) {
                const changed = [];
                if (element.enabled !== enable && (element instanceof $SFb || element instanceof $TFb || element instanceof $UFb || element instanceof $WFb)) {
                    changed.push(element);
                }
                element.enabled = enable;
                if (enable) {
                    this.f = true;
                }
                this.g.fire({ changed: changed, sessionOnly: false });
            }
        }
        enableOrDisableAllBreakpoints(enable) {
            const changed = [];
            this.m.forEach(bp => {
                if (bp.enabled !== enable) {
                    changed.push(bp);
                }
                bp.enabled = enable;
            });
            this.n.forEach(fbp => {
                if (fbp.enabled !== enable) {
                    changed.push(fbp);
                }
                fbp.enabled = enable;
            });
            this.t.forEach(dbp => {
                if (dbp.enabled !== enable) {
                    changed.push(dbp);
                }
                dbp.enabled = enable;
            });
            this.w.forEach(ibp => {
                if (ibp.enabled !== enable) {
                    changed.push(ibp);
                }
                ibp.enabled = enable;
            });
            if (enable) {
                this.f = true;
            }
            this.g.fire({ changed: changed, sessionOnly: false });
        }
        addFunctionBreakpoint(functionName, id) {
            const newFunctionBreakpoint = new $TFb(functionName, true, undefined, undefined, undefined, id);
            this.n.push(newFunctionBreakpoint);
            this.g.fire({ added: [newFunctionBreakpoint], sessionOnly: false });
            return newFunctionBreakpoint;
        }
        updateFunctionBreakpoint(id, update) {
            const functionBreakpoint = this.n.find(fbp => fbp.getId() === id);
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
                this.g.fire({ changed: [functionBreakpoint], sessionOnly: false });
            }
        }
        removeFunctionBreakpoints(id) {
            let removed;
            if (id) {
                removed = this.n.filter(fbp => fbp.getId() === id);
                this.n = this.n.filter(fbp => fbp.getId() !== id);
            }
            else {
                removed = this.n;
                this.n = [];
            }
            this.g.fire({ removed, sessionOnly: false });
        }
        addDataBreakpoint(label, dataId, canPersist, accessTypes, accessType) {
            const newDataBreakpoint = new $UFb(label, dataId, canPersist, true, undefined, undefined, undefined, accessTypes, accessType);
            this.t.push(newDataBreakpoint);
            this.g.fire({ added: [newDataBreakpoint], sessionOnly: false });
        }
        removeDataBreakpoints(id) {
            let removed;
            if (id) {
                removed = this.t.filter(fbp => fbp.getId() === id);
                this.t = this.t.filter(fbp => fbp.getId() !== id);
            }
            else {
                removed = this.t;
                this.t = [];
            }
            this.g.fire({ removed, sessionOnly: false });
        }
        addInstructionBreakpoint(instructionReference, offset, address, condition, hitCondition) {
            const newInstructionBreakpoint = new $WFb(instructionReference, offset, false, true, hitCondition, condition, undefined, address);
            this.w.push(newInstructionBreakpoint);
            this.g.fire({ added: [newInstructionBreakpoint], sessionOnly: true });
        }
        removeInstructionBreakpoints(instructionReference, offset) {
            let removed = [];
            if (instructionReference) {
                for (let i = 0; i < this.w.length; i++) {
                    const ibp = this.w[i];
                    if (ibp.instructionReference === instructionReference && (offset === undefined || ibp.offset === offset)) {
                        removed.push(ibp);
                        this.w.splice(i--, 1);
                    }
                }
            }
            else {
                removed = this.w;
                this.w = [];
            }
            this.g.fire({ removed, sessionOnly: false });
        }
        getWatchExpressions() {
            return this.u;
        }
        addWatchExpression(name) {
            const we = new $IFb(name || '');
            this.u.push(we);
            this.j.fire(we);
            return we;
        }
        renameWatchExpression(id, newName) {
            const filtered = this.u.filter(we => we.getId() === id);
            if (filtered.length === 1) {
                filtered[0].name = newName;
                this.j.fire(filtered[0]);
            }
        }
        removeWatchExpressions(id = null) {
            this.u = id ? this.u.filter(we => we.getId() !== id) : [];
            this.j.fire(undefined);
        }
        moveWatchExpression(id, position) {
            const we = this.u.find(we => we.getId() === id);
            if (we) {
                this.u = this.u.filter(we => we.getId() !== id);
                this.u = this.u.slice(0, position).concat(we, this.u.slice(position));
                this.j.fire(undefined);
            }
        }
        sourceIsNotAvailable(uri) {
            this.a.forEach(s => {
                const source = s.getSourceForUri(uri);
                if (source) {
                    source.available = false;
                }
            });
            this.h.fire(undefined);
        }
    };
    exports.$YFb = $YFb;
    exports.$YFb = $YFb = __decorate([
        __param(1, textfiles_1.$JD),
        __param(2, uriIdentity_1.$Ck),
        __param(3, log_1.$5i)
    ], $YFb);
});
//# sourceMappingURL=debugModel.js.map