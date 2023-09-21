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
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/common/core/range", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/debug/browser/breakpointEditorContribution", "vs/workbench/contrib/debug/browser/callStackEditorContribution", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookEditorExtensions", "vs/workbench/contrib/notebook/browser/notebookEditorWidget", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookExecutionStateService"], function (require, exports, lifecycle_1, range_1, configuration_1, breakpointEditorContribution_1, callStackEditorContribution_1, debug_1, notebookBrowser_1, notebookEditorExtensions_1, notebookEditorWidget_1, notebookCommon_1, notebookExecutionStateService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$fGb = exports.$eGb = void 0;
    let $eGb = class $eGb extends lifecycle_1.$kc {
        static { this.id = 'workbench.notebook.debug.pausedCellDecorations'; }
        constructor(f, g, h) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.a = [];
            this.b = [];
            this.c = [];
            this.B(g.getModel().onDidChangeCallStack(() => this.j()));
            this.B(g.getViewModel().onDidFocusStackFrame(() => this.j()));
            this.B(h.onDidChangeExecution(e => {
                if (e.type === notebookExecutionStateService_1.NotebookExecutionType.cell && this.f.textModel && e.affectsNotebook(this.f.textModel.uri)) {
                    this.j();
                }
            }));
        }
        j() {
            const exes = this.f.textModel ?
                this.h.getCellExecutionsByHandleForNotebook(this.f.textModel.uri)
                : undefined;
            const topFrameCellsAndRanges = [];
            let focusedFrameCellAndRange = undefined;
            const getNotebookCellAndRange = (sf) => {
                const parsed = notebookCommon_1.CellUri.parse(sf.source.uri);
                if (parsed && parsed.notebook.toString() === this.f.textModel?.uri.toString()) {
                    return { handle: parsed.handle, range: sf.range };
                }
                return undefined;
            };
            for (const session of this.g.getModel().getSessions()) {
                for (const thread of session.getAllThreads()) {
                    const topFrame = thread.getTopStackFrame();
                    if (topFrame) {
                        const notebookCellAndRange = getNotebookCellAndRange(topFrame);
                        if (notebookCellAndRange) {
                            topFrameCellsAndRanges.push(notebookCellAndRange);
                            exes?.delete(notebookCellAndRange.handle);
                        }
                    }
                }
            }
            const focusedFrame = this.g.getViewModel().focusedStackFrame;
            if (focusedFrame && focusedFrame.thread.stopped) {
                const thisFocusedFrameCellAndRange = getNotebookCellAndRange(focusedFrame);
                if (thisFocusedFrameCellAndRange &&
                    !topFrameCellsAndRanges.some(topFrame => topFrame.handle === thisFocusedFrameCellAndRange?.handle && range_1.$ks.equalsRange(topFrame.range, thisFocusedFrameCellAndRange?.range))) {
                    focusedFrameCellAndRange = thisFocusedFrameCellAndRange;
                    exes?.delete(focusedFrameCellAndRange.handle);
                }
            }
            this.m(topFrameCellsAndRanges);
            this.n(focusedFrameCellAndRange);
            const exeHandles = exes ?
                Array.from(exes.entries())
                    .filter(([_, exe]) => exe.state === notebookCommon_1.NotebookCellExecutionState.Executing)
                    .map(([handle]) => handle)
                : [];
            this.r(exeHandles);
        }
        m(handlesAndRanges) {
            const newDecorations = handlesAndRanges.map(({ handle, range }) => {
                const options = {
                    overviewRuler: {
                        color: callStackEditorContribution_1.$3Fb,
                        includeOutput: false,
                        modelRanges: [range],
                        position: notebookBrowser_1.NotebookOverviewRulerLane.Full
                    }
                };
                return { handle, options };
            });
            this.a = this.f.deltaCellDecorations(this.a, newDecorations);
        }
        n(focusedFrameCellAndRange) {
            let newDecorations = [];
            if (focusedFrameCellAndRange) {
                const options = {
                    overviewRuler: {
                        color: callStackEditorContribution_1.$4Fb,
                        includeOutput: false,
                        modelRanges: [focusedFrameCellAndRange.range],
                        position: notebookBrowser_1.NotebookOverviewRulerLane.Full
                    }
                };
                newDecorations = [{ handle: focusedFrameCellAndRange.handle, options }];
            }
            this.b = this.f.deltaCellDecorations(this.b, newDecorations);
        }
        r(handles) {
            const newDecorations = handles.map(handle => {
                const options = {
                    overviewRuler: {
                        color: notebookEditorWidget_1.$Grb,
                        includeOutput: false,
                        modelRanges: [new range_1.$ks(0, 0, 0, 0)],
                        position: notebookBrowser_1.NotebookOverviewRulerLane.Left
                    }
                };
                return { handle, options };
            });
            this.c = this.f.deltaCellDecorations(this.c, newDecorations);
        }
    };
    exports.$eGb = $eGb;
    exports.$eGb = $eGb = __decorate([
        __param(1, debug_1.$nH),
        __param(2, notebookExecutionStateService_1.$_H)
    ], $eGb);
    (0, notebookEditorExtensions_1.$Fnb)($eGb.id, $eGb);
    let $fGb = class $fGb extends lifecycle_1.$kc {
        static { this.id = 'workbench.notebook.debug.notebookBreakpointDecorations'; }
        constructor(b, c, f) {
            super();
            this.b = b;
            this.c = c;
            this.f = f;
            this.a = [];
            this.B(c.getModel().onDidChangeBreakpoints(() => this.g()));
            this.B(f.onDidChangeConfiguration(e => e.affectsConfiguration('debug.showBreakpointsInOverviewRuler') && this.g()));
        }
        g() {
            const enabled = this.f.getValue('debug.showBreakpointsInOverviewRuler');
            const newDecorations = enabled ?
                this.c.getModel().getBreakpoints().map(breakpoint => {
                    const parsed = notebookCommon_1.CellUri.parse(breakpoint.uri);
                    if (!parsed || parsed.notebook.toString() !== this.b.textModel.uri.toString()) {
                        return null;
                    }
                    const options = {
                        overviewRuler: {
                            color: breakpointEditorContribution_1.$dGb,
                            includeOutput: false,
                            modelRanges: [new range_1.$ks(breakpoint.lineNumber, 0, breakpoint.lineNumber, 0)],
                            position: notebookBrowser_1.NotebookOverviewRulerLane.Left
                        }
                    };
                    return { handle: parsed.handle, options };
                }).filter(x => !!x)
                : [];
            this.a = this.b.deltaCellDecorations(this.a, newDecorations);
        }
    };
    exports.$fGb = $fGb;
    exports.$fGb = $fGb = __decorate([
        __param(1, debug_1.$nH),
        __param(2, configuration_1.$8h)
    ], $fGb);
    (0, notebookEditorExtensions_1.$Fnb)($fGb.id, $fGb);
});
//# sourceMappingURL=notebookDebugDecorations.js.map