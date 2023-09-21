/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugUtils"], function (require, exports, event_1, debug_1, debugUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$VRb = void 0;
    class $VRb {
        constructor(y) {
            this.y = y;
            this.firstSessionStart = true;
            this.e = new event_1.$fd();
            this.f = new event_1.$fd();
            this.g = new event_1.$fd();
            this.h = new event_1.$fd();
            this.i = new event_1.$fd();
            this.j = new event_1.$fd();
            y.bufferChangeEvents(() => {
                this.k = debug_1.$GG.bindTo(y);
                this.l = debug_1.$QG.bindTo(y);
                this.m = debug_1.$TG.bindTo(y);
                this.n = debug_1.$SG.bindTo(y);
                this.o = debug_1.$UG.bindTo(y);
                this.p = debug_1.$XG.bindTo(y);
                this.q = debug_1.$WG.bindTo(y);
                this.r = debug_1.$3G.bindTo(y);
                this.s = debug_1.$4G.bindTo(y);
                this.t = debug_1.$bH.bindTo(y);
                this.u = debug_1.$8G.bindTo(y);
                this.v = debug_1.$9G.bindTo(y);
                this.w = debug_1.$cH.bindTo(y);
                this.x = debug_1.$fH.bindTo(y);
            });
        }
        getId() {
            return 'root';
        }
        get focusedSession() {
            return this.b;
        }
        get focusedThread() {
            return this.c;
        }
        get focusedStackFrame() {
            return this.a;
        }
        setFocus(stackFrame, thread, session, explicit) {
            const shouldEmitForStackFrame = this.a !== stackFrame;
            const shouldEmitForSession = this.b !== session;
            const shouldEmitForThread = this.c !== thread;
            this.a = stackFrame;
            this.c = thread;
            this.b = session;
            this.y.bufferChangeEvents(() => {
                this.l.set(session ? !!session.capabilities.supportsLoadedSourcesRequest : false);
                this.m.set(session ? !!session.capabilities.supportsStepBack : false);
                this.o.set(session ? !!session.capabilities.supportsRestartFrame : false);
                this.p.set(session ? !!session.capabilities.supportsStepInTargetsRequest : false);
                this.q.set(session ? !!session.capabilities.supportsGotoTargetsRequest : false);
                this.r.set(session ? !!session.capabilities.supportsSetVariable : false);
                this.s.set(session ? !!session.capabilities.supportsSetExpression : false);
                this.u.set(session ? !!session.capabilities.supportTerminateDebuggee : false);
                this.v.set(session ? !!session.capabilities.supportSuspendDebuggee : false);
                this.w.set(!!session?.capabilities.supportsDisassembleRequest);
                this.x.set(!!stackFrame?.instructionPointerReference);
                const attach = !!session && (0, debugUtils_1.$kF)(session);
                this.n.set(attach);
            });
            if (shouldEmitForSession) {
                this.e.fire(session);
            }
            // should not call onDidFocusThread if onDidFocusStackFrame is called.
            if (shouldEmitForStackFrame) {
                this.g.fire({ stackFrame, explicit, session });
            }
            else if (shouldEmitForThread) {
                this.f.fire({ thread, explicit, session });
            }
        }
        get onDidFocusSession() {
            return this.e.event;
        }
        get onDidFocusThread() {
            return this.f.event;
        }
        get onDidFocusStackFrame() {
            return this.g.event;
        }
        getSelectedExpression() {
            return this.d;
        }
        setSelectedExpression(expression, settingWatch) {
            this.d = expression ? { expression, settingWatch: settingWatch } : undefined;
            this.k.set(!!expression);
            this.h.fire(this.d);
        }
        get onDidSelectExpression() {
            return this.h.event;
        }
        get onDidEvaluateLazyExpression() {
            return this.i.event;
        }
        updateViews() {
            this.j.fire();
        }
        get onWillUpdateViews() {
            return this.j.event;
        }
        isMultiSessionView() {
            return !!this.t.get();
        }
        setMultiSessionView(isMultiSessionView) {
            this.t.set(isMultiSessionView);
        }
        async evaluateLazyExpression(expression) {
            await expression.evaluateLazy();
            this.i.fire(expression);
        }
    }
    exports.$VRb = $VRb;
});
//# sourceMappingURL=debugViewModel.js.map