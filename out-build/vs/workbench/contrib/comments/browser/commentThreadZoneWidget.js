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
define(["require", "exports", "vs/base/common/color", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/core/range", "vs/editor/common/languages", "vs/editor/contrib/zoneWidget/browser/zoneWidget", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/workbench/contrib/comments/browser/commentGlyphWidget", "vs/workbench/contrib/comments/browser/commentService", "vs/editor/common/config/editorOptions", "vs/platform/instantiation/common/serviceCollection", "vs/workbench/contrib/comments/browser/commentThreadWidget", "vs/workbench/contrib/comments/browser/commentColors", "vs/editor/contrib/peekView/browser/peekView", "vs/platform/configuration/common/configuration"], function (require, exports, color_1, event_1, lifecycle_1, range_1, languages, zoneWidget_1, contextkey_1, instantiation_1, themeService_1, commentGlyphWidget_1, commentService_1, editorOptions_1, serviceCollection_1, commentThreadWidget_1, commentColors_1, peekView_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Imb = exports.$Hmb = exports.$Gmb = exports.$Fmb = void 0;
    function getCommentThreadWidgetStateColor(thread, theme) {
        return (0, commentColors_1.$Tlb)(thread, theme) ?? theme.getColor(peekView_1.$M3);
    }
    function $Fmb(e) {
        const range = e.target.range;
        if (!range) {
            return null;
        }
        if (!e.event.leftButton) {
            return null;
        }
        if (e.target.type !== 4 /* MouseTargetType.GUTTER_LINE_DECORATIONS */) {
            return null;
        }
        const data = e.target.detail;
        const gutterOffsetX = data.offsetX - data.glyphMarginWidth - data.lineNumbersWidth - data.glyphMarginLeft;
        // don't collide with folding and git decorations
        if (gutterOffsetX > 20) {
            return null;
        }
        return { lineNumber: range.startLineNumber };
    }
    exports.$Fmb = $Fmb;
    function $Gmb(mouseDownInfo, e) {
        if (!mouseDownInfo) {
            return null;
        }
        const { lineNumber } = mouseDownInfo;
        const range = e.target.range;
        if (!range) {
            return null;
        }
        return lineNumber;
    }
    exports.$Gmb = $Gmb;
    function $Hmb(mouseDownInfo, e) {
        if (!mouseDownInfo) {
            return null;
        }
        const { lineNumber } = mouseDownInfo;
        const range = e.target.range;
        if (!range || range.startLineNumber !== lineNumber) {
            return null;
        }
        if (e.target.type !== 4 /* MouseTargetType.GUTTER_LINE_DECORATIONS */) {
            return null;
        }
        return lineNumber;
    }
    exports.$Hmb = $Hmb;
    let $Imb = class $Imb extends zoneWidget_1.$z3 {
        get owner() {
            return this.t;
        }
        get commentThread() {
            return this.v;
        }
        get expanded() {
            return this.d;
        }
        constructor(editor, t, v, J, K, instantiationService, L, M, contextKeyService, N) {
            super(editor, { keepEditorSelection: true, isAccessible: true });
            this.t = t;
            this.v = v;
            this.J = J;
            this.K = K;
            this.L = L;
            this.M = M;
            this.N = N;
            this.b = new event_1.$fd();
            this.c = new event_1.$fd();
            this.l = new lifecycle_1.$jc();
            this.m = [];
            this.p = contextKeyService.createScoped(this.domNode);
            this.r = instantiationService.createChild(new serviceCollection_1.$zh([contextkey_1.$3i, this.p]));
            const controller = this.M.getCommentController(this.t);
            if (controller) {
                this.s = controller.options;
            }
            this.h = v.m;
            this.d = v.m === languages.CommentThreadCollapsibleState.Expanded;
            this.m = [];
            this.create();
            this.l.add(this.L.onDidColorThemeChange(this.V, this));
            this.l.add(this.editor.onDidChangeConfiguration(e => {
                if (e.hasChanged(50 /* EditorOption.fontInfo */)) {
                    this.V(this.L.getColorTheme());
                }
            }));
            this.V(this.L.getColorTheme());
        }
        get onDidClose() {
            return this.b.event;
        }
        get onDidCreateThread() {
            return this.c.event;
        }
        getPosition() {
            if (this.position) {
                return this.position;
            }
            if (this.i) {
                return this.i.getPosition().position ?? undefined;
            }
            return undefined;
        }
        C() {
            // we don't do anything here as we always do the reveal ourselves.
        }
        reveal(commentUniqueId, focus = false) {
            if (!this.d) {
                this.show(this.Q(this.v.range), 2);
            }
            if (commentUniqueId !== undefined) {
                const height = this.editor.getLayoutInfo().height;
                const coords = this.a.getCommentCoords(commentUniqueId);
                if (coords) {
                    let scrollTop = 1;
                    if (this.v.range) {
                        const commentThreadCoords = coords.thread;
                        const commentCoords = coords.comment;
                        scrollTop = this.editor.getTopForLineNumber(this.v.range.startLineNumber) - height / 2 + commentCoords.top - commentThreadCoords.top;
                    }
                    this.editor.setScrollTop(scrollTop);
                    if (focus) {
                        this.a.focus();
                    }
                    return;
                }
            }
            this.editor.revealRangeInCenter(this.v.range ?? new range_1.$ks(1, 1, 1, 1));
            if (focus) {
                this.a.focus();
            }
        }
        getPendingComments() {
            return {
                newComment: this.a.getPendingComment(),
                edits: this.a.getPendingEdits()
            };
        }
        E(container) {
            this.D('review-widget');
            this.a = this.r.createInstance(commentThreadWidget_1.$Emb, container, this.t, this.editor.getModel().uri, this.p, this.r, this.v, this.J, this.K, { editor: this.editor, codeBlockFontSize: '', codeBlockFontFamily: this.N.getValue('editor').fontFamily || editorOptions_1.EDITOR_FONT_DEFAULTS.fontFamily }, this.s, {
                actionRunner: () => {
                    if (!this.v.comments || !this.v.comments.length) {
                        const newPosition = this.getPosition();
                        if (newPosition) {
                            const originalRange = this.v.range;
                            if (!originalRange) {
                                return;
                            }
                            let range;
                            if (newPosition.lineNumber !== originalRange.endLineNumber) {
                                // The widget could have moved as a result of editor changes.
                                // We need to try to calculate the new, more correct, range for the comment.
                                const distance = newPosition.lineNumber - originalRange.endLineNumber;
                                range = new range_1.$ks(originalRange.startLineNumber + distance, originalRange.startColumn, originalRange.endLineNumber + distance, originalRange.endColumn);
                            }
                            else {
                                range = new range_1.$ks(originalRange.startLineNumber, originalRange.startColumn, originalRange.endLineNumber, originalRange.endColumn);
                            }
                            this.M.updateCommentThreadTemplate(this.owner, this.v.commentThreadHandle, range);
                        }
                    }
                },
                collapse: () => {
                    this.collapse();
                }
            });
            this.o.add(this.a);
        }
        Q(range) {
            if (!range) {
                return undefined;
            }
            // Arrow on top edge of zone widget will be at the start of the line if range is multi-line, else at midpoint of range (rounding rightwards)
            return { lineNumber: range.endLineNumber, column: range.endLineNumber === range.startLineNumber ? (range.startColumn + range.endColumn + 1) / 2 : 1 };
        }
        R() {
            this.dispose();
            this.M.disposeCommentThread(this.owner, this.v.threadId);
        }
        collapse() {
            this.v.collapsibleState = languages.CommentThreadCollapsibleState.Collapsed;
        }
        expand() {
            this.v.collapsibleState = languages.CommentThreadCollapsibleState.Expanded;
        }
        getGlyphPosition() {
            if (this.i) {
                return this.i.getPosition().position.lineNumber;
            }
            return 0;
        }
        toggleExpand() {
            if (this.d) {
                this.v.collapsibleState = languages.CommentThreadCollapsibleState.Collapsed;
            }
            else {
                this.v.collapsibleState = languages.CommentThreadCollapsibleState.Expanded;
            }
        }
        async update(commentThread) {
            if (this.v !== commentThread) {
                this.m.forEach(disposable => disposable.dispose());
                this.v = commentThread;
                this.m = [];
                this.U();
            }
            this.a.updateCommentThread(commentThread);
            // Move comment glyph widget and show position if the line has changed.
            const lineNumber = this.v.range?.endLineNumber ?? 1;
            let shouldMoveWidget = false;
            if (this.i) {
                this.i.setThreadState(commentThread.state);
                if (this.i.getPosition().position.lineNumber !== lineNumber) {
                    shouldMoveWidget = true;
                    this.i.setLineNumber(lineNumber);
                }
            }
            if (shouldMoveWidget && this.d) {
                this.show(this.Q(this.v.range), 2);
            }
            if (this.v.collapsibleState === languages.CommentThreadCollapsibleState.Expanded) {
                this.show(this.Q(this.v.range), 2);
            }
            else {
                this.hide();
            }
        }
        F(widthInPixel) {
            this.a.layout(widthInPixel);
        }
        G(heightInPixel, widthInPixel) {
            this.a.layout(widthInPixel);
        }
        display(range) {
            if (range) {
                this.i = new commentGlyphWidget_1.$8lb(this.editor, range?.endLineNumber ?? -1);
                this.i.setThreadState(this.v.state);
            }
            this.a.display(this.editor.getOption(66 /* EditorOption.lineHeight */));
            this.o.add(this.a.onDidResize(dimension => {
                this._refresh(dimension);
            }));
            if ((this.v.collapsibleState === languages.CommentThreadCollapsibleState.Expanded) || (range === undefined)) {
                this.show(this.Q(range), 2);
            }
            // If this is a new comment thread awaiting user input then we need to reveal it.
            if (this.v.canReply && this.v.isTemplate && (!this.v.comments || (this.v.comments.length === 0))) {
                this.reveal();
            }
            this.U();
        }
        U() {
            this.m.push(this.v.onDidChangeComments(async (_) => {
                await this.update(this.v);
            }));
            this.m.push(this.v.onDidChangeRange(range => {
                // Move comment glyph widget and show position if the line has changed.
                const lineNumber = this.v.range?.startLineNumber ?? 1;
                let shouldMoveWidget = false;
                if (this.i) {
                    if (this.i.getPosition().position.lineNumber !== lineNumber) {
                        shouldMoveWidget = true;
                        this.i.setLineNumber(lineNumber);
                    }
                }
                if (shouldMoveWidget && this.d) {
                    this.show(this.Q(this.v.range), 2);
                }
            }));
            this.m.push(this.v.onDidChangeCollapsibleState(state => {
                if (state === languages.CommentThreadCollapsibleState.Expanded && !this.d) {
                    this.show(this.Q(this.v.range), 2);
                    return;
                }
                if (state === languages.CommentThreadCollapsibleState.Collapsed && this.d) {
                    this.hide();
                    return;
                }
            }));
            if (this.h === undefined) {
                const onDidChangeInitialCollapsibleState = this.v.onDidChangeInitialCollapsibleState(state => {
                    // File comments always start expanded
                    this.h = this.v.range ? state : languages.CommentThreadCollapsibleState.Expanded;
                    this.v.collapsibleState = this.h;
                    onDidChangeInitialCollapsibleState.dispose();
                });
                this.m.push(onDidChangeInitialCollapsibleState);
            }
            this.m.push(this.v.onDidChangeState(() => {
                const borderColor = getCommentThreadWidgetStateColor(this.v.state, this.L.getColorTheme()) || color_1.$Os.transparent;
                this.style({
                    frameColor: borderColor,
                    arrowColor: borderColor,
                });
                this.container?.style.setProperty(commentColors_1.$Qlb, `${borderColor}`);
                this.container?.style.setProperty(commentColors_1.$Slb, `${borderColor.transparent(.1)}`);
            }));
        }
        async submitComment() {
            return this.a.submitComment();
        }
        _refresh(dimensions) {
            if (dimensions.height === 0 && dimensions.width === 0) {
                this.commentThread.collapsibleState = languages.CommentThreadCollapsibleState.Collapsed;
                return;
            }
            if (this.d) {
                this.a.layout();
                const headHeight = Math.ceil(this.editor.getOption(66 /* EditorOption.lineHeight */) * 1.2);
                const lineHeight = this.editor.getOption(66 /* EditorOption.lineHeight */);
                const arrowHeight = Math.round(lineHeight / 3);
                const frameThickness = Math.round(lineHeight / 9) * 2;
                const computedLinesNumber = Math.ceil((headHeight + dimensions.height + arrowHeight + frameThickness + 8 /** margin bottom to avoid margin collapse */) / lineHeight);
                if (this.n?.heightInLines === computedLinesNumber) {
                    return;
                }
                const currentPosition = this.getPosition();
                if (this.n && currentPosition && currentPosition.lineNumber !== this.n.afterLineNumber && this.n.afterLineNumber !== 0) {
                    this.n.afterLineNumber = currentPosition.lineNumber;
                }
                if (!this.v.comments || !this.v.comments.length) {
                    this.a.focusCommentEditor();
                }
                this.H(computedLinesNumber);
            }
        }
        V(theme) {
            const borderColor = getCommentThreadWidgetStateColor(this.v.state, this.L.getColorTheme()) || color_1.$Os.transparent;
            this.style({
                arrowColor: borderColor,
                frameColor: borderColor
            });
            const fontInfo = this.editor.getOption(50 /* EditorOption.fontInfo */);
            // Editor decorations should also be responsive to theme changes
            this.a.applyTheme(theme, fontInfo);
        }
        show(rangeOrPos, heightInLines) {
            this.d = true;
            super.show(rangeOrPos ?? new range_1.$ks(0, 0, 0, 0), heightInLines);
            this.v.collapsibleState = languages.CommentThreadCollapsibleState.Expanded;
            this._refresh(this.a.getDimensions());
        }
        hide() {
            if (this.d) {
                this.d = false;
                // Focus the container so that the comment editor will be blurred before it is hidden
                if (this.editor.hasWidgetFocus()) {
                    this.editor.focus();
                }
                if (!this.v.comments || !this.v.comments.length) {
                    this.R();
                }
            }
            super.hide();
        }
        dispose() {
            super.dispose();
            if (this.i) {
                this.i.dispose();
                this.i = undefined;
            }
            this.l.dispose();
            this.m.forEach(global => global.dispose());
            this.b.fire(undefined);
        }
    };
    exports.$Imb = $Imb;
    exports.$Imb = $Imb = __decorate([
        __param(5, instantiation_1.$Ah),
        __param(6, themeService_1.$gv),
        __param(7, commentService_1.$Ilb),
        __param(8, contextkey_1.$3i),
        __param(9, configuration_1.$8h)
    ], $Imb);
});
//# sourceMappingURL=commentThreadZoneWidget.js.map