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
define(["require", "exports", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookExecutionService", "vs/workbench/contrib/notebook/common/notebookExecutionStateService"], function (require, exports, async_1, lifecycle_1, uri_1, platform_1, contributions_1, debug_1, notebookCommon_1, notebookExecutionService_1, notebookExecutionStateService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let NotebookCellPausing = class NotebookCellPausing extends lifecycle_1.$kc {
        constructor(c, f) {
            super();
            this.c = c;
            this.f = f;
            this.a = new Set();
            this.B(c.getModel().onDidChangeCallStack(() => {
                // First update using the stale callstack if the real callstack is empty, to reduce blinking while stepping.
                // After not pausing for 2s, update again with the latest callstack.
                this.g(true);
                this.b.schedule();
            }));
            this.b = this.B(new async_1.$Sg(() => this.g(false), 2000));
        }
        async g(fallBackOnStaleCallstack) {
            const newPausedCells = new Set();
            for (const session of this.c.getModel().getSessions()) {
                for (const thread of session.getAllThreads()) {
                    let callStack = thread.getCallStack();
                    if (fallBackOnStaleCallstack && !callStack.length) {
                        callStack = thread.getStaleCallStack();
                    }
                    callStack.forEach(sf => {
                        const parsed = notebookCommon_1.CellUri.parse(sf.source.uri);
                        if (parsed) {
                            newPausedCells.add(sf.source.uri.toString());
                            this.h(sf.source.uri, true);
                        }
                    });
                }
            }
            for (const uri of this.a) {
                if (!newPausedCells.has(uri)) {
                    this.h(uri_1.URI.parse(uri), false);
                    this.a.delete(uri);
                }
            }
            newPausedCells.forEach(cell => this.a.add(cell));
        }
        h(cellUri, isPaused) {
            const parsed = notebookCommon_1.CellUri.parse(cellUri);
            if (parsed) {
                const exeState = this.f.getCellExecution(cellUri);
                if (exeState && (exeState.isPaused !== isPaused || !exeState.didPause)) {
                    exeState.update([{
                            editType: notebookExecutionService_1.CellExecutionUpdateType.ExecutionState,
                            didPause: true,
                            isPaused
                        }]);
                }
            }
        }
    };
    NotebookCellPausing = __decorate([
        __param(0, debug_1.$nH),
        __param(1, notebookExecutionStateService_1.$_H)
    ], NotebookCellPausing);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(NotebookCellPausing, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=notebookCellPausing.js.map