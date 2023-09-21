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
    exports.DebugStorage = void 0;
    const DEBUG_BREAKPOINTS_KEY = 'debug.breakpoint';
    const DEBUG_FUNCTION_BREAKPOINTS_KEY = 'debug.functionbreakpoint';
    const DEBUG_DATA_BREAKPOINTS_KEY = 'debug.databreakpoint';
    const DEBUG_EXCEPTION_BREAKPOINTS_KEY = 'debug.exceptionbreakpoint';
    const DEBUG_WATCH_EXPRESSIONS_KEY = 'debug.watchexpressions';
    const DEBUG_CHOSEN_ENVIRONMENTS_KEY = 'debug.chosenenvironment';
    const DEBUG_UX_STATE_KEY = 'debug.uxstate';
    let DebugStorage = class DebugStorage extends lifecycle_1.Disposable {
        constructor(storageService, textFileService, uriIdentityService, logService) {
            super();
            this.storageService = storageService;
            this.textFileService = textFileService;
            this.uriIdentityService = uriIdentityService;
            this.logService = logService;
            this.breakpoints = (0, observable_1.observableValue)(this, this.loadBreakpoints());
            this.functionBreakpoints = (0, observable_1.observableValue)(this, this.loadFunctionBreakpoints());
            this.exceptionBreakpoints = (0, observable_1.observableValue)(this, this.loadExceptionBreakpoints());
            this.dataBreakpoints = (0, observable_1.observableValue)(this, this.loadDataBreakpoints());
            this.watchExpressions = (0, observable_1.observableValue)(this, this.loadWatchExpressions());
            this._register(storageService.onDidChangeValue(1 /* StorageScope.WORKSPACE */, undefined, this._store)(e => {
                if (e.external) {
                    switch (e.key) {
                        case DEBUG_BREAKPOINTS_KEY:
                            return this.breakpoints.set(this.loadBreakpoints(), undefined);
                        case DEBUG_FUNCTION_BREAKPOINTS_KEY:
                            return this.functionBreakpoints.set(this.loadFunctionBreakpoints(), undefined);
                        case DEBUG_EXCEPTION_BREAKPOINTS_KEY:
                            return this.exceptionBreakpoints.set(this.loadExceptionBreakpoints(), undefined);
                        case DEBUG_DATA_BREAKPOINTS_KEY:
                            return this.dataBreakpoints.set(this.loadDataBreakpoints(), undefined);
                        case DEBUG_WATCH_EXPRESSIONS_KEY:
                            return this.watchExpressions.set(this.loadWatchExpressions(), undefined);
                    }
                }
            }));
        }
        loadDebugUxState() {
            return this.storageService.get(DEBUG_UX_STATE_KEY, 1 /* StorageScope.WORKSPACE */, 'default');
        }
        storeDebugUxState(value) {
            this.storageService.store(DEBUG_UX_STATE_KEY, value, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        loadBreakpoints() {
            let result;
            try {
                result = JSON.parse(this.storageService.get(DEBUG_BREAKPOINTS_KEY, 1 /* StorageScope.WORKSPACE */, '[]')).map((breakpoint) => {
                    return new debugModel_1.Breakpoint(uri_1.URI.parse(breakpoint.uri.external || breakpoint.source.uri.external), breakpoint.lineNumber, breakpoint.column, breakpoint.enabled, breakpoint.condition, breakpoint.hitCondition, breakpoint.logMessage, breakpoint.adapterData, this.textFileService, this.uriIdentityService, this.logService, breakpoint.id);
                });
            }
            catch (e) { }
            return result || [];
        }
        loadFunctionBreakpoints() {
            let result;
            try {
                result = JSON.parse(this.storageService.get(DEBUG_FUNCTION_BREAKPOINTS_KEY, 1 /* StorageScope.WORKSPACE */, '[]')).map((fb) => {
                    return new debugModel_1.FunctionBreakpoint(fb.name, fb.enabled, fb.hitCondition, fb.condition, fb.logMessage, fb.id);
                });
            }
            catch (e) { }
            return result || [];
        }
        loadExceptionBreakpoints() {
            let result;
            try {
                result = JSON.parse(this.storageService.get(DEBUG_EXCEPTION_BREAKPOINTS_KEY, 1 /* StorageScope.WORKSPACE */, '[]')).map((exBreakpoint) => {
                    return new debugModel_1.ExceptionBreakpoint(exBreakpoint.filter, exBreakpoint.label, exBreakpoint.enabled, exBreakpoint.supportsCondition, exBreakpoint.condition, exBreakpoint.description, exBreakpoint.conditionDescription, !!exBreakpoint.fallback);
                });
            }
            catch (e) { }
            return result || [];
        }
        loadDataBreakpoints() {
            let result;
            try {
                result = JSON.parse(this.storageService.get(DEBUG_DATA_BREAKPOINTS_KEY, 1 /* StorageScope.WORKSPACE */, '[]')).map((dbp) => {
                    return new debugModel_1.DataBreakpoint(dbp.description, dbp.dataId, true, dbp.enabled, dbp.hitCondition, dbp.condition, dbp.logMessage, dbp.accessTypes, dbp.accessType, dbp.id);
                });
            }
            catch (e) { }
            return result || [];
        }
        loadWatchExpressions() {
            let result;
            try {
                result = JSON.parse(this.storageService.get(DEBUG_WATCH_EXPRESSIONS_KEY, 1 /* StorageScope.WORKSPACE */, '[]')).map((watchStoredData) => {
                    return new debugModel_1.Expression(watchStoredData.name, watchStoredData.id);
                });
            }
            catch (e) { }
            return result || [];
        }
        loadChosenEnvironments() {
            return JSON.parse(this.storageService.get(DEBUG_CHOSEN_ENVIRONMENTS_KEY, 1 /* StorageScope.WORKSPACE */, '{}'));
        }
        storeChosenEnvironments(environments) {
            this.storageService.store(DEBUG_CHOSEN_ENVIRONMENTS_KEY, JSON.stringify(environments), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        storeWatchExpressions(watchExpressions) {
            if (watchExpressions.length) {
                this.storageService.store(DEBUG_WATCH_EXPRESSIONS_KEY, JSON.stringify(watchExpressions.map(we => ({ name: we.name, id: we.getId() }))), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.storageService.remove(DEBUG_WATCH_EXPRESSIONS_KEY, 1 /* StorageScope.WORKSPACE */);
            }
        }
        storeBreakpoints(debugModel) {
            const breakpoints = debugModel.getBreakpoints();
            if (breakpoints.length) {
                this.storageService.store(DEBUG_BREAKPOINTS_KEY, JSON.stringify(breakpoints), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.storageService.remove(DEBUG_BREAKPOINTS_KEY, 1 /* StorageScope.WORKSPACE */);
            }
            const functionBreakpoints = debugModel.getFunctionBreakpoints();
            if (functionBreakpoints.length) {
                this.storageService.store(DEBUG_FUNCTION_BREAKPOINTS_KEY, JSON.stringify(functionBreakpoints), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.storageService.remove(DEBUG_FUNCTION_BREAKPOINTS_KEY, 1 /* StorageScope.WORKSPACE */);
            }
            const dataBreakpoints = debugModel.getDataBreakpoints().filter(dbp => dbp.canPersist);
            if (dataBreakpoints.length) {
                this.storageService.store(DEBUG_DATA_BREAKPOINTS_KEY, JSON.stringify(dataBreakpoints), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.storageService.remove(DEBUG_DATA_BREAKPOINTS_KEY, 1 /* StorageScope.WORKSPACE */);
            }
            const exceptionBreakpoints = debugModel.getExceptionBreakpoints();
            if (exceptionBreakpoints.length) {
                this.storageService.store(DEBUG_EXCEPTION_BREAKPOINTS_KEY, JSON.stringify(exceptionBreakpoints), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            else {
                this.storageService.remove(DEBUG_EXCEPTION_BREAKPOINTS_KEY, 1 /* StorageScope.WORKSPACE */);
            }
        }
    };
    exports.DebugStorage = DebugStorage;
    exports.DebugStorage = DebugStorage = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, textfiles_1.ITextFileService),
        __param(2, uriIdentity_1.IUriIdentityService),
        __param(3, log_1.ILogService)
    ], DebugStorage);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdTdG9yYWdlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvY29tbW9uL2RlYnVnU3RvcmFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFZaEcsTUFBTSxxQkFBcUIsR0FBRyxrQkFBa0IsQ0FBQztJQUNqRCxNQUFNLDhCQUE4QixHQUFHLDBCQUEwQixDQUFDO0lBQ2xFLE1BQU0sMEJBQTBCLEdBQUcsc0JBQXNCLENBQUM7SUFDMUQsTUFBTSwrQkFBK0IsR0FBRywyQkFBMkIsQ0FBQztJQUNwRSxNQUFNLDJCQUEyQixHQUFHLHdCQUF3QixDQUFDO0lBQzdELE1BQU0sNkJBQTZCLEdBQUcseUJBQXlCLENBQUM7SUFDaEUsTUFBTSxrQkFBa0IsR0FBRyxlQUFlLENBQUM7SUFFcEMsSUFBTSxZQUFZLEdBQWxCLE1BQU0sWUFBYSxTQUFRLHNCQUFVO1FBTzNDLFlBQ2tCLGNBQWdELEVBQy9DLGVBQWtELEVBQy9DLGtCQUF3RCxFQUNoRSxVQUF3QztZQUVyRCxLQUFLLEVBQUUsQ0FBQztZQUwwQixtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDOUIsb0JBQWUsR0FBZixlQUFlLENBQWtCO1lBQzlCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFDL0MsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQVZ0QyxnQkFBVyxHQUFHLElBQUEsNEJBQWUsRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUM7WUFDNUQsd0JBQW1CLEdBQUcsSUFBQSw0QkFBZSxFQUFDLElBQUksRUFBRSxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDO1lBQzVFLHlCQUFvQixHQUFHLElBQUEsNEJBQWUsRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUMsQ0FBQztZ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