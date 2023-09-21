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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/core/range", "vs/editor/common/model", "vs/nls", "vs/platform/log/common/log", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/contrib/debug/browser/debugIcons", "vs/workbench/contrib/debug/common/debug", "vs/css!./media/callStackEditorContribution"], function (require, exports, arrays_1, event_1, lifecycle_1, range_1, model_1, nls_1, log_1, colorRegistry_1, themeService_1, themables_1, uriIdentity_1, debugIcons_1, debug_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CallStackEditorContribution = exports.createDecorationsForStackFrame = exports.focusedStackFrameColor = exports.topStackFrameColor = void 0;
    exports.topStackFrameColor = (0, colorRegistry_1.registerColor)('editor.stackFrameHighlightBackground', { dark: '#ffff0033', light: '#ffff6673', hcDark: '#ffff0033', hcLight: '#ffff6673' }, (0, nls_1.localize)('topStackFrameLineHighlight', 'Background color for the highlight of line at the top stack frame position.'));
    exports.focusedStackFrameColor = (0, colorRegistry_1.registerColor)('editor.focusedStackFrameHighlightBackground', { dark: '#7abd7a4d', light: '#cee7ce73', hcDark: '#7abd7a4d', hcLight: '#cee7ce73' }, (0, nls_1.localize)('focusedStackFrameLineHighlight', 'Background color for the highlight of line at focused stack frame position.'));
    const stickiness = 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */;
    // we need a separate decoration for glyph margin, since we do not want it on each line of a multi line statement.
    const TOP_STACK_FRAME_MARGIN = {
        description: 'top-stack-frame-margin',
        glyphMarginClassName: themables_1.ThemeIcon.asClassName(debugIcons_1.debugStackframe),
        glyphMargin: { position: model_1.GlyphMarginLane.Right },
        zIndex: 9999,
        stickiness,
        overviewRuler: {
            position: model_1.OverviewRulerLane.Full,
            color: (0, themeService_1.themeColorFromId)(exports.topStackFrameColor)
        }
    };
    const FOCUSED_STACK_FRAME_MARGIN = {
        description: 'focused-stack-frame-margin',
        glyphMarginClassName: themables_1.ThemeIcon.asClassName(debugIcons_1.debugStackframeFocused),
        glyphMargin: { position: model_1.GlyphMarginLane.Right },
        zIndex: 9999,
        stickiness,
        overviewRuler: {
            position: model_1.OverviewRulerLane.Full,
            color: (0, themeService_1.themeColorFromId)(exports.focusedStackFrameColor)
        }
    };
    const TOP_STACK_FRAME_DECORATION = {
        description: 'top-stack-frame-decoration',
        isWholeLine: true,
        className: 'debug-top-stack-frame-line',
        stickiness
    };
    const FOCUSED_STACK_FRAME_DECORATION = {
        description: 'focused-stack-frame-decoration',
        isWholeLine: true,
        className: 'debug-focused-stack-frame-line',
        stickiness
    };
    function createDecorationsForStackFrame(stackFrame, isFocusedSession, noCharactersBefore) {
        // only show decorations for the currently focused thread.
        const result = [];
        const columnUntilEOLRange = new range_1.Range(stackFrame.range.startLineNumber, stackFrame.range.startColumn, stackFrame.range.startLineNumber, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */);
        const range = new range_1.Range(stackFrame.range.startLineNumber, stackFrame.range.startColumn, stackFrame.range.startLineNumber, stackFrame.range.startColumn + 1);
        // compute how to decorate the editor. Different decorations are used if this is a top stack frame, focused stack frame,
        // an exception or a stack frame that did not change the line number (we only decorate the columns, not the whole line).
        const topStackFrame = stackFrame.thread.getTopStackFrame();
        if (stackFrame.getId() === topStackFrame?.getId()) {
            if (isFocusedSession) {
                result.push({
                    options: TOP_STACK_FRAME_MARGIN,
                    range
                });
            }
            result.push({
                options: TOP_STACK_FRAME_DECORATION,
                range: columnUntilEOLRange
            });
            if (stackFrame.range.startColumn > 1) {
                result.push({
                    options: {
                        description: 'top-stack-frame-inline-decoration',
                        before: {
                            content: '\uEB8B',
                            inlineClassName: noCharactersBefore ? 'debug-top-stack-frame-column start-of-line' : 'debug-top-stack-frame-column',
                            inlineClassNameAffectsLetterSpacing: true
                        },
                    },
                    range: columnUntilEOLRange
                });
            }
        }
        else {
            if (isFocusedSession) {
                result.push({
                    options: FOCUSED_STACK_FRAME_MARGIN,
                    range
                });
            }
            result.push({
                options: FOCUSED_STACK_FRAME_DECORATION,
                range: columnUntilEOLRange
            });
        }
        return result;
    }
    exports.createDecorationsForStackFrame = createDecorationsForStackFrame;
    let CallStackEditorContribution = class CallStackEditorContribution extends lifecycle_1.Disposable {
        constructor(editor, debugService, uriIdentityService, logService) {
            super();
            this.editor = editor;
            this.debugService = debugService;
            this.uriIdentityService = uriIdentityService;
            this.logService = logService;
            this.decorations = this.editor.createDecorationsCollection();
            const setDecorations = () => this.decorations.set(this.createCallStackDecorations());
            this._register(event_1.Event.any(this.debugService.getViewModel().onDidFocusStackFrame, this.debugService.getModel().onDidChangeCallStack)(() => {
                setDecorations();
            }));
            this._register(this.editor.onDidChangeModel(e => {
                if (e.newModelUrl) {
                    setDecorations();
                }
            }));
            setDecorations();
        }
        createCallStackDecorations() {
            const editor = this.editor;
            if (!editor.hasModel()) {
                return [];
            }
            const focusedStackFrame = this.debugService.getViewModel().focusedStackFrame;
            const decorations = [];
            this.debugService.getModel().getSessions().forEach(s => {
                const isSessionFocused = s === focusedStackFrame?.thread.session;
                s.getAllThreads().forEach(t => {
                    if (t.stopped) {
                        const callStack = t.getCallStack();
                        const stackFrames = [];
                        if (callStack.length > 0) {
                            // Always decorate top stack frame, and decorate focused stack frame if it is not the top stack frame
                            if (focusedStackFrame && !focusedStackFrame.equals(callStack[0])) {
                                stackFrames.push(focusedStackFrame);
                            }
                            stackFrames.push(callStack[0]);
                        }
                        stackFrames.forEach(candidateStackFrame => {
                            if (candidateStackFrame && this.uriIdentityService.extUri.isEqual(candidateStackFrame.source.uri, editor.getModel()?.uri)) {
                                if (candidateStackFrame.range.startLineNumber > editor.getModel()?.getLineCount() || candidateStackFrame.range.startLineNumber < 1) {
                                    this.logService.warn(`CallStackEditorContribution: invalid stack frame line number: ${candidateStackFrame.range.startLineNumber}`);
                                    return;
                                }
                                const noCharactersBefore = editor.getModel().getLineFirstNonWhitespaceColumn(candidateStackFrame.range.startLineNumber) >= candidateStackFrame.range.startColumn;
                                decorations.push(...createDecorationsForStackFrame(candidateStackFrame, isSessionFocused, noCharactersBefore));
                            }
                        });
                    }
                });
            });
            // Deduplicate same decorations so colors do not stack #109045
            return (0, arrays_1.distinct)(decorations, d => `${d.options.className} ${d.options.glyphMarginClassName} ${d.range.startLineNumber} ${d.range.startColumn}`);
        }
        dispose() {
            super.dispose();
            this.decorations.clear();
        }
    };
    exports.CallStackEditorContribution = CallStackEditorContribution;
    exports.CallStackEditorContribution = CallStackEditorContribution = __decorate([
        __param(1, debug_1.IDebugService),
        __param(2, uriIdentity_1.IUriIdentityService),
        __param(3, log_1.ILogService)
    ], CallStackEditorContribution);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsbFN0YWNrRWRpdG9yQ29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvYnJvd3Nlci9jYWxsU3RhY2tFZGl0b3JDb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBb0JuRixRQUFBLGtCQUFrQixHQUFHLElBQUEsNkJBQWEsRUFBQyxzQ0FBc0MsRUFBRSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsRUFBRSxJQUFBLGNBQVEsRUFBQyw0QkFBNEIsRUFBRSw2RUFBNkUsQ0FBQyxDQUFDLENBQUM7SUFDeFIsUUFBQSxzQkFBc0IsR0FBRyxJQUFBLDZCQUFhLEVBQUMsNkNBQTZDLEVBQUUsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLEVBQUUsSUFBQSxjQUFRLEVBQUMsZ0NBQWdDLEVBQUUsNkVBQTZFLENBQUMsQ0FBQyxDQUFDO0lBQ3BULE1BQU0sVUFBVSw2REFBcUQsQ0FBQztJQUV0RSxrSEFBa0g7SUFDbEgsTUFBTSxzQkFBc0IsR0FBNEI7UUFDdkQsV0FBVyxFQUFFLHdCQUF3QjtRQUNyQyxvQkFBb0IsRUFBRSxxQkFBUyxDQUFDLFdBQVcsQ0FBQyw0QkFBZSxDQUFDO1FBQzVELFdBQVcsRUFBRSxFQUFFLFFBQVEsRUFBRSx1QkFBZSxDQUFDLEtBQUssRUFBRTtRQUNoRCxNQUFNLEVBQUUsSUFBSTtRQUNaLFVBQVU7UUFDVixhQUFhLEVBQUU7WUFDZCxRQUFRLEVBQUUseUJBQWlCLENBQUMsSUFBSTtZQUNoQyxLQUFLLEVBQUUsSUFBQSwr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