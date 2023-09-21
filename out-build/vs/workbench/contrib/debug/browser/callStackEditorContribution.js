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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/core/range", "vs/editor/common/model", "vs/nls!vs/workbench/contrib/debug/browser/callStackEditorContribution", "vs/platform/log/common/log", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/contrib/debug/browser/debugIcons", "vs/workbench/contrib/debug/common/debug", "vs/css!./media/callStackEditorContribution"], function (require, exports, arrays_1, event_1, lifecycle_1, range_1, model_1, nls_1, log_1, colorRegistry_1, themeService_1, themables_1, uriIdentity_1, debugIcons_1, debug_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$6Fb = exports.$5Fb = exports.$4Fb = exports.$3Fb = void 0;
    exports.$3Fb = (0, colorRegistry_1.$sv)('editor.stackFrameHighlightBackground', { dark: '#ffff0033', light: '#ffff6673', hcDark: '#ffff0033', hcLight: '#ffff6673' }, (0, nls_1.localize)(0, null));
    exports.$4Fb = (0, colorRegistry_1.$sv)('editor.focusedStackFrameHighlightBackground', { dark: '#7abd7a4d', light: '#cee7ce73', hcDark: '#7abd7a4d', hcLight: '#cee7ce73' }, (0, nls_1.localize)(1, null));
    const stickiness = 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */;
    // we need a separate decoration for glyph margin, since we do not want it on each line of a multi line statement.
    const TOP_STACK_FRAME_MARGIN = {
        description: 'top-stack-frame-margin',
        glyphMarginClassName: themables_1.ThemeIcon.asClassName(debugIcons_1.$9mb),
        glyphMargin: { position: model_1.GlyphMarginLane.Right },
        zIndex: 9999,
        stickiness,
        overviewRuler: {
            position: model_1.OverviewRulerLane.Full,
            color: (0, themeService_1.$hv)(exports.$3Fb)
        }
    };
    const FOCUSED_STACK_FRAME_MARGIN = {
        description: 'focused-stack-frame-margin',
        glyphMarginClassName: themables_1.ThemeIcon.asClassName(debugIcons_1.$0mb),
        glyphMargin: { position: model_1.GlyphMarginLane.Right },
        zIndex: 9999,
        stickiness,
        overviewRuler: {
            position: model_1.OverviewRulerLane.Full,
            color: (0, themeService_1.$hv)(exports.$4Fb)
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
    function $5Fb(stackFrame, isFocusedSession, noCharactersBefore) {
        // only show decorations for the currently focused thread.
        const result = [];
        const columnUntilEOLRange = new range_1.$ks(stackFrame.range.startLineNumber, stackFrame.range.startColumn, stackFrame.range.startLineNumber, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */);
        const range = new range_1.$ks(stackFrame.range.startLineNumber, stackFrame.range.startColumn, stackFrame.range.startLineNumber, stackFrame.range.startColumn + 1);
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
    exports.$5Fb = $5Fb;
    let $6Fb = class $6Fb extends lifecycle_1.$kc {
        constructor(b, c, f, g) {
            super();
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.a = this.b.createDecorationsCollection();
            const setDecorations = () => this.a.set(this.h());
            this.B(event_1.Event.any(this.c.getViewModel().onDidFocusStackFrame, this.c.getModel().onDidChangeCallStack)(() => {
                setDecorations();
            }));
            this.B(this.b.onDidChangeModel(e => {
                if (e.newModelUrl) {
                    setDecorations();
                }
            }));
            setDecorations();
        }
        h() {
            const editor = this.b;
            if (!editor.hasModel()) {
                return [];
            }
            const focusedStackFrame = this.c.getViewModel().focusedStackFrame;
            const decorations = [];
            this.c.getModel().getSessions().forEach(s => {
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
                            if (candidateStackFrame && this.f.extUri.isEqual(candidateStackFrame.source.uri, editor.getModel()?.uri)) {
                                if (candidateStackFrame.range.startLineNumber > editor.getModel()?.getLineCount() || candidateStackFrame.range.startLineNumber < 1) {
                                    this.g.warn(`CallStackEditorContribution: invalid stack frame line number: ${candidateStackFrame.range.startLineNumber}`);
                                    return;
                                }
                                const noCharactersBefore = editor.getModel().getLineFirstNonWhitespaceColumn(candidateStackFrame.range.startLineNumber) >= candidateStackFrame.range.startColumn;
                                decorations.push(...$5Fb(candidateStackFrame, isSessionFocused, noCharactersBefore));
                            }
                        });
                    }
                });
            });
            // Deduplicate same decorations so colors do not stack #109045
            return (0, arrays_1.$Kb)(decorations, d => `${d.options.className} ${d.options.glyphMarginClassName} ${d.range.startLineNumber} ${d.range.startColumn}`);
        }
        dispose() {
            super.dispose();
            this.a.clear();
        }
    };
    exports.$6Fb = $6Fb;
    exports.$6Fb = $6Fb = __decorate([
        __param(1, debug_1.$nH),
        __param(2, uriIdentity_1.$Ck),
        __param(3, log_1.$5i)
    ], $6Fb);
});
//# sourceMappingURL=callStackEditorContribution.js.map