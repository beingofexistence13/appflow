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
    exports.NotebookBreakpointDecorations = exports.PausedCellDecorationContribution = void 0;
    let PausedCellDecorationContribution = class PausedCellDecorationContribution extends lifecycle_1.Disposable {
        static { this.id = 'workbench.notebook.debug.pausedCellDecorations'; }
        constructor(_notebookEditor, _debugService, _notebookExecutionStateService) {
            super();
            this._notebookEditor = _notebookEditor;
            this._debugService = _debugService;
            this._notebookExecutionStateService = _notebookExecutionStateService;
            this._currentTopDecorations = [];
            this._currentOtherDecorations = [];
            this._executingCellDecorations = [];
            this._register(_debugService.getModel().onDidChangeCallStack(() => this.updateExecutionDecorations()));
            this._register(_debugService.getViewModel().onDidFocusStackFrame(() => this.updateExecutionDecorations()));
            this._register(_notebookExecutionStateService.onDidChangeExecution(e => {
                if (e.type === notebookExecutionStateService_1.NotebookExecutionType.cell && this._notebookEditor.textModel && e.affectsNotebook(this._notebookEditor.textModel.uri)) {
                    this.updateExecutionDecorations();
                }
            }));
        }
        updateExecutionDecorations() {
            const exes = this._notebookEditor.textModel ?
                this._notebookExecutionStateService.getCellExecutionsByHandleForNotebook(this._notebookEditor.textModel.uri)
                : undefined;
            const topFrameCellsAndRanges = [];
            let focusedFrameCellAndRange = undefined;
            const getNotebookCellAndRange = (sf) => {
                const parsed = notebookCommon_1.CellUri.parse(sf.source.uri);
                if (parsed && parsed.notebook.toString() === this._notebookEditor.textModel?.uri.toString()) {
                    return { handle: parsed.handle, range: sf.range };
                }
                return undefined;
            };
            for (const session of this._debugService.getModel().getSessions()) {
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
            const focusedFrame = this._debugService.getViewModel().focusedStackFrame;
            if (focusedFrame && focusedFrame.thread.stopped) {
                const thisFocusedFrameCellAndRange = getNotebookCellAndRange(focusedFrame);
                if (thisFocusedFrameCellAndRange &&
                    !topFrameCellsAndRanges.some(topFrame => topFrame.handle === thisFocusedFrameCellAndRange?.handle && range_1.Range.equalsRange(topFrame.range, thisFocusedFrameCellAndRange?.range))) {
                    focusedFrameCellAndRange = thisFocusedFrameCellAndRange;
                    exes?.delete(focusedFrameCellAndRange.handle);
                }
            }
            this.setTopFrameDecoration(topFrameCellsAndRanges);
            this.setFocusedFrameDecoration(focusedFrameCellAndRange);
            const exeHandles = exes ?
                Array.from(exes.entries())
                    .filter(([_, exe]) => exe.state === notebookCommon_1.NotebookCellExecutionState.Executing)
                    .map(([handle]) => handle)
                : [];
            this.setExecutingCellDecorations(exeHandles);
        }
        setTopFrameDecoration(handlesAndRanges) {
            const newDecorations = handlesAndRanges.map(({ handle, range }) => {
                const options = {
                    overviewRuler: {
                        color: callStackEditorContribution_1.topStackFrameColor,
                        includeOutput: false,
                        modelRanges: [range],
                        position: notebookBrowser_1.NotebookOverviewRulerLane.Full
                    }
                };
                return { handle, options };
            });
            this._currentTopDecorations = this._notebookEditor.deltaCellDecorations(this._currentTopDecorations, newDecorations);
        }
        setFocusedFrameDecoration(focusedFrameCellAndRange) {
            let newDecorations = [];
            if (focusedFrameCellAndRange) {
                const options = {
                    overviewRuler: {
                        color: callStackEditorContribution_1.focusedStackFrameColor,
                        includeOutput: false,
                        modelRanges: [focusedFrameCellAndRange.range],
                        position: notebookBrowser_1.NotebookOverviewRulerLane.Full
                    }
                };
                newDecorations = [{ handle: focusedFrameCellAndRange.handle, options }];
            }
            this._currentOtherDecorations = this._notebookEditor.deltaCellDecorations(this._currentOtherDecorations, newDecorations);
        }
        setExecutingCellDecorations(handles) {
            const newDecorations = handles.map(handle => {
                const options = {
                    overviewRuler: {
                        color: notebookEditorWidget_1.runningCellRulerDecorationColor,
                        includeOutput: false,
                        modelRanges: [new range_1.Range(0, 0, 0, 0)],
                        position: notebookBrowser_1.NotebookOverviewRulerLane.Left
                    }
                };
                return { handle, options };
            });
            this._executingCellDecorations = this._notebookEditor.deltaCellDecorations(this._executingCellDecorations, newDecorations);
        }
    };
    exports.PausedCellDecorationContribution = PausedCellDecorationContribution;
    exports.PausedCellDecorationContribution = PausedCellDecorationContribution = __decorate([
        __param(1, debug_1.IDebugService),
        __param(2, notebookExecutionStateService_1.INotebookExecutionStateService)
    ], PausedCellDecorationContribution);
    (0, notebookEditorExtensions_1.registerNotebookContribution)(PausedCellDecorationContribution.id, PausedCellDecorationContribution);
    let NotebookBreakpointDecorations = class NotebookBreakpointDecorations extends lifecycle_1.Disposable {
        static { this.id = 'workbench.notebook.debug.notebookBreakpointDecorations'; }
        constructor(_notebookEditor, _debugService, _configService) {
            super();
            this._notebookEditor = _notebookEditor;
            this._debugService = _debugService;
            this._configService = _configService;
            this._currentDecorations = [];
            this._register(_debugService.getModel().onDidChangeBreakpoints(() => this.updateDecorations()));
            this._register(_configService.onDidChangeConfiguration(e => e.affectsConfiguration('debug.showBreakpointsInOverviewRuler') && this.updateDecorations()));
        }
        updateDecorations() {
            const enabled = this._configService.getValue('debug.showBreakpointsInOverviewRuler');
            const newDecorations = enabled ?
                this._debugService.getModel().getBreakpoints().map(breakpoint => {
                    const parsed = notebookCommon_1.CellUri.parse(breakpoint.uri);
                    if (!parsed || parsed.notebook.toString() !== this._notebookEditor.textModel.uri.toString()) {
                        return null;
                    }
                    const options = {
                        overviewRuler: {
                            color: breakpointEditorContribution_1.debugIconBreakpointForeground,
                            includeOutput: false,
                            modelRanges: [new range_1.Range(breakpoint.lineNumber, 0, breakpoint.lineNumber, 0)],
                            position: notebookBrowser_1.NotebookOverviewRulerLane.Left
                        }
                    };
                    return { handle: parsed.handle, options };
                }).filter(x => !!x)
                : [];
            this._currentDecorations = this._notebookEditor.deltaCellDecorations(this._currentDecorations, newDecorations);
        }
    };
    exports.NotebookBreakpointDecorations = NotebookBreakpointDecorations;
    exports.NotebookBreakpointDecorations = NotebookBreakpointDecorations = __decorate([
        __param(1, debug_1.IDebugService),
        __param(2, configuration_1.IConfigurationService)
    ], NotebookBreakpointDecorations);
    (0, notebookEditorExtensions_1.registerNotebookContribution)(NotebookBreakpointDecorations.id, NotebookBreakpointDecorations);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tEZWJ1Z0RlY29yYXRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci9jb250cmliL2RlYnVnL25vdGVib29rRGVidWdEZWNvcmF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFtQnpGLElBQU0sZ0NBQWdDLEdBQXRDLE1BQU0sZ0NBQWlDLFNBQVEsc0JBQVU7aUJBQ3hELE9BQUUsR0FBVyxnREFBZ0QsQUFBM0QsQ0FBNEQ7UUFNckUsWUFDa0IsZUFBZ0MsRUFDbEMsYUFBNkMsRUFDNUIsOEJBQStFO1lBRS9HLEtBQUssRUFBRSxDQUFDO1lBSlMsb0JBQWUsR0FBZixlQUFlLENBQWlCO1lBQ2pCLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1lBQ1gsbUNBQThCLEdBQTlCLDhCQUE4QixDQUFnQztZQVB4RywyQkFBc0IsR0FBYSxFQUFFLENBQUM7WUFDdEMsNkJBQXdCLEdBQWEsRUFBRSxDQUFDO1lBQ3hDLDhCQUF5QixHQUFhLEVBQUUsQ0FBQztZQVNoRCxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdkcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLENBQUMsb0JBQW9CLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzNHLElBQUksQ0FBQyxTQUFTLENBQUMsOEJBQThCLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3RFLElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxxREFBcUIsQ0FBQyxJQUFJ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