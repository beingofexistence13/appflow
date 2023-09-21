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
define(["require", "exports", "vs/base/common/uri", "vs/platform/storage/common/storage", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/services/textfile/common/textfiles", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/log/common/log", "vs/base/common/observable", "vs/base/common/lifecycle"], function (require, exports, uri_1, storage_1, debugModel_1, textfiles_1, uriIdentity_1, log_1, observable_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$FFb = void 0;
    const DEBUG_BREAKPOINTS_KEY = 'debug.breakpoint';
    const DEBUG_FUNCTION_BREAKPOINTS_KEY = 'debug.functionbreakpoint';
    const DEBUG_DATA_BREAKPOINTS_KEY = 'debug.databreakpoint';
    const DEBUG_EXCEPTION_BREAKPOINTS_KEY = 'debug.exceptionbreakpoint';
    const DEBUG_WATCH_EXPRESSIONS_KEY = 'debug.watchexpressions';
    const DEBUG_CHOSEN_ENVIRONMENTS_KEY = 'debug.chosenenvironment';
    const DEBUG_UX_STATE_KEY = 'debug.uxstate';
    let $FFb = class $FFb extends lifecycle_1.$kc {
        constructor(a, b, c, f) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
            this.breakpoints = (0, observable_1.observableValue)(this, this.g());
            this.functionBreakpoints = (0, observable_1.observableValue)(this, this.h());
            this.exceptionBreakpoints = (0, observable_1.observableValue)(this, this.j());
            this.dataBreakpoints = (0, observable_1.observableValue)(this, this.m());
            this.watchExpressions = (0, observable_1.observableValue)(this, this.n());
            this.B(a.onDidChangeValue(1 /* StorageScope.WORKSPACE */, undefined, this.q)(e => {
                if (e.external) {
                    switch (e.key) {
                        case DEBUG_BREAKPOINTS_KEY:
                            return this.breakpoints.set(this.g(), undefined);
                        case DEBUG_FUNCTION_BREAKPOINTS_KEY:
                            return this.functionBreakpoints.set(this.h(), undefined);
                        case DEBUG_EXCEPTION_BREAKPOINTS_KEY:
                            return this.exceptionBreakpoints.set(this.j(), undefined);
                        case DEBUG_DATA_BREAKPOINTS_KEY:
                            return this.dataBreakpoints.set(this.m(), undefined);
                        case DEBUG_WATCH_EXPRESSIONS_KEY:
                            return this.watchExpressions.set(this.n(), undefined);
                    }
                }
            }));
        }
        loadDebugUxState() {
            return this.a.get(DEBUG_UX_STATE_KEY, 1 /* StorageScope.WORKSPACE */, 'default');
        }
        storeDebugUxState(value) {
            this.a.store(DEBUG_UX_STATE_KEY, value, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        g() {
            let result;
            try {
                result = JSON.parse(this.a.get(DEBUG_BREAKPOINTS_KEY, 1 /* StorageScope.WORKSPACE */, '[]')).map((breakpoint) => {
                    return new debugModel_1.$SFb(uri_1.URI.parse(breakpoint.uri.external || breakpoint.source.uri.external), breakpoint.lineNumber, breakpoint.column, breakpoint.enabled, breakpoint.condition, breakpoint.hitCondition, breakpoint.logMessage, breakpoint.adapterData, this.b, this.c, this.f, breakpoint.id);
                });
            }
            catch (e) { }
            return result || [];
        }
        h() {
            let result;
            try {
                result = JSON.parse(this.a.get(DEBUG_FUNCTION_BREAKPOINTS_KEY, 1 /* StorageScope.WORKSPACE */, '[]')).map((fb) => {
                    return new debugModel_1.$TFb(fb.name, fb.enabled, fb.hitCondition, fb.condition, fb.logMessage, fb.id);
                });
            }
            catch (e) { }
            return result || [];
        }
        j() {
            let result;
            try {
                result = JSON.parse(this.a.get(DEBUG_EXCEPTION_BREAKPOINTS_KEY, 1 /* StorageScope.WORKSPACE */, '[]')).map((exBreakpoint) => {
                    return new debugModel_1.$VFb(exBreakpoint.filter, exBreakpoint.label, exBreakpoint.enabled, exBreakpoint.supportsCondition, exBreakpoint.condition, exBreakpoint.description, exBreakpoint.conditionDescription, !!exBreakpoint.fallback);
                });
            }
            catch (e) { }
            return result || [];
        }
        m() {
            let result;
            try {
                result = JSON.parse(this.a.get(DEBUG_DATA_BREAKPOINTS_KEY, 1 /* StorageScope.WORKSPACE */, '[]')).map((dbp) => {
                    return new debugModel_1.$UFb(dbp.description, dbp.dataId, true, dbp.enabled, dbp.hitCondition, dbp.condition, dbp.logMessage, dbp.accessTypes, dbp.accessType, dbp.id);
                });
            }
            catch (e) { }
            return result || [];
        }
        n() {
            let result;
            try {
                result = JSON.parse(this.a.get(DEBUG_WATCH_EXPRESSIONS_KEY, 1 /* StorageScope.WORKSPACE */, '[]')).map((watchStoredData) => {
                    return new debugModel_1.$IFb(watchStoredData.name, watchStoredData.id);
                });
            }
            catch (e) { }
            return result || [];
        }
        loadChosenEnvironments() {
            return JSON.parse(this.a.get(DEBUG_CHOSEN_ENVIRONMENTS_KEY, 1 /* StorageScope.WORKSPACE */, '{}'));
        }
        storeChosenEnvironments(environments) {
            this.a.store(DEBUG_CHOSEN_ENVIRONMENTS_KEY, JSON.stringify(environments), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        storeWatchExpressions(watchExpressions) {
            if (watchExpressions.length) {
                this.a.store(DEBUG_WATCH_EXPRESSIONS_KEY, JSON.stringify(watchExpressions.map(we => ({ name: we.name, id: we.getId() }))), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.a.remove(DEBUG_WATCH_EXPRESSIONS_KEY, 1 /* StorageScope.WORKSPACE */);
            }
        }
        storeBreakpoints(debugModel) {
            const breakpoints = debugModel.getBreakpoints();
            if (breakpoints.length) {
                this.a.store(DEBUG_BREAKPOINTS_KEY, JSON.stringify(breakpoints), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.a.remove(DEBUG_BREAKPOINTS_KEY, 1 /* StorageScope.WORKSPACE */);
            }
            const functionBreakpoints = debugModel.getFunctionBreakpoints();
            if (functionBreakpoints.length) {
                this.a.store(DEBUG_FUNCTION_BREAKPOINTS_KEY, JSON.stringify(functionBreakpoints), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.a.remove(DEBUG_FUNCTION_BREAKPOINTS_KEY, 1 /* StorageScope.WORKSPACE */);
            }
            const dataBreakpoints = debugModel.getDataBreakpoints().filter(dbp => dbp.canPersist);
            if (dataBreakpoints.length) {
                this.a.store(DEBUG_DATA_BREAKPOINTS_KEY, JSON.stringify(dataBreakpoints), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.a.remove(DEBUG_DATA_BREAKPOINTS_KEY, 1 /* StorageScope.WORKSPACE */);
            }
            const exceptionBreakpoints = debugModel.getExceptionBreakpoints();
            if (exceptionBreakpoints.length) {
                this.a.store(DEBUG_EXCEPTION_BREAKPOINTS_KEY, JSON.stringify(exceptionBreakpoints), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.a.remove(DEBUG_EXCEPTION_BREAKPOINTS_KEY, 1 /* StorageScope.WORKSPACE */);
            }
        }
    };
    exports.$FFb = $FFb;
    exports.$FFb = $FFb = __decorate([
        __param(0, storage_1.$Vo),
        __param(1, textfiles_1.$JD),
        __param(2, uriIdentity_1.$Ck),
        __param(3, log_1.$5i)
    ], $FFb);
});
//# sourceMappingURL=debugStorage.js.map