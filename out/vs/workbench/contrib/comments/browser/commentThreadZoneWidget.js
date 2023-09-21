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
    exports.ReviewZoneWidget = exports.isMouseUpEventMatchMouseDown = exports.isMouseUpEventDragFromMouseDown = exports.parseMouseDownInfoFromEvent = void 0;
    function getCommentThreadWidgetStateColor(thread, theme) {
        return (0, commentColors_1.getCommentThreadStateBorderColor)(thread, theme) ?? theme.getColor(peekView_1.peekViewBorder);
    }
    function parseMouseDownInfoFromEvent(e) {
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
    exports.parseMouseDownInfoFromEvent = parseMouseDownInfoFromEvent;
    function isMouseUpEventDragFromMouseDown(mouseDownInfo, e) {
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
    exports.isMouseUpEventDragFromMouseDown = isMouseUpEventDragFromMouseDown;
    function isMouseUpEventMatchMouseDown(mouseDownInfo, e) {
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
    exports.isMouseUpEventMatchMouseDown = isMouseUpEventMatchMouseDown;
    let ReviewZoneWidget = class ReviewZoneWidget extends zoneWidget_1.ZoneWidget {
        get owner() {
            return this._owner;
        }
        get commentThread() {
            return this._commentThread;
        }
        get expanded() {
            return this._isExpanded;
        }
        constructor(editor, _owner, _commentThread, _pendingComment, _pendingEdits, instantiationService, themeService, commentService, contextKeyService, configurationService) {
            super(editor, { keepEditorSelection: true, isAccessible: true });
            this._owner = _owner;
            this._commentThread = _commentThread;
            this._pendingComment = _pendingComment;
            this._pendingEdits = _pendingEdits;
            this.themeService = themeService;
            this.commentService = commentService;
            this.configurationService = configurationService;
            this._onDidClose = new event_1.Emitter();
            this._onDidCreateThread = new event_1.Emitter();
            this._globalToDispose = new lifecycle_1.DisposableStore();
            this._commentThreadDisposables = [];
            this._contextKeyService = contextKeyService.createScoped(this.domNode);
            this._scopedInstantiationService = instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this._contextKeyService]));
            const controller = this.commentService.getCommentController(this._owner);
            if (controller) {
                this._commentOptions = controller.options;
            }
            this._initialCollapsibleState = _commentThread.initialCollapsibleState;
            this._isExpanded = _commentThread.initialCollapsibleState === languages.CommentThreadCollapsibleState.Expanded;
            this._commentThreadDisposables = [];
            this.create();
            this._globalToDispose.add(this.themeService.onDidColorThemeChange(this._applyTheme, this));
            this._globalToDispose.add(this.editor.onDidChangeConfiguration(e => {
                if (e.hasChanged(50 /* EditorOption.fontInfo */)) {
                    this._applyTheme(this.themeService.getColorTheme());
                }
            }));
            this._applyTheme(this.themeService.getColorTheme());
        }
        get onDidClose() {
            return this._onDidClose.event;
        }
        get onDidCreateThread() {
            return this._onDidCreateThread.event;
        }
        getPosition() {
            if (this.position) {
                return this.position;
            }
            if (this._commentGlyph) {
                return this._commentGlyph.getPosition().position ?? undefined;
            }
            return undefined;
        }
        revealRange() {
            // we don't do anything here as we always do the reveal ourselves.
        }
        reveal(commentUniqueId, focus = false) {
            if (!this._isExpanded) {
                this.show(this.arrowPosition(this._commentThread.range), 2);
            }
            if (commentUniqueId !== undefined) {
                const height = this.editor.getLayoutInfo().height;
                const coords = this._commentThreadWidget.getCommentCoords(commentUniqueId);
                if (coords) {
                    let scrollTop = 1;
                    if (this._commentThread.range) {
                        const commentThreadCoords = coords.thread;
                        const commentCoords = coords.comment;
                        scrollTop = this.editor.getTopForLineNumber(this._commentThread.range.startLineNumber) - height / 2 + commentCoords.top - commentThreadCoords.top;
                    }
                    this.editor.setScrollTop(scrollTop);
                    if (focus) {
                        this._commentThreadWidget.focus();
                    }
                    return;
                }
            }
            this.editor.revealRangeInCenter(this._commentThread.range ?? new range_1.Range(1, 1, 1, 1));
            if (focus) {
                this._commentThreadWidget.focus();
            }
        }
        getPendingComments() {
            return {
                newComment: this._commentThreadWidget.getPendingComment(),
                edits: this._commentThreadWidget.getPendingEdits()
            };
        }
        _fillContainer(container) {
            this.setCssClass('review-widget');
            this._commentThreadWidget = this._scopedInstantiationService.createInstance(commentThreadWidget_1.CommentThreadWidget, container, this._owner, this.editor.getModel().uri, this._contextKeyService, this._scopedInstantiationService, this._commentThread, this._pendingComment, this._pendingEdits, { editor: this.editor, codeBlockFontSize: '', codeBlockFontFamily: this.configurationService.getValue('editor').fontFamily || editorOptions_1.EDITOR_FONT_DEFAULTS.fontFamily }, this._commentOptions, {
                actionRunner: () => {
                    if (!this._commentThread.comments || !this._commentThread.comments.length) {
                        const newPosition = this.getPosition();
                        if (newPosition) {
                            const originalRange = this._commentThread.range;
                            if (!originalRange) {
                                return;
                            }
                            let range;
                            if (newPosition.lineNumber !== originalRange.endLineNumber) {
                                // The widget could have moved as a result of editor changes.
                                // We need to try to calculate the new, more correct, range for the comment.
                                const distance = newPosition.lineNumber - originalRange.endLineNumber;
                                range = new range_1.Range(originalRange.startLineNumber + distance, originalRange.startColumn, originalRange.endLineNumber + distance, originalRange.endColumn);
                            }
                            else {
                                range = new range_1.Range(originalRange.startLineNumber, originalRange.startColumn, originalRange.endLineNumber, originalRange.endColumn);
                            }
                            this.commentService.updateCommentThreadTemplate(this.owner, this._commentThread.commentThreadHandle, range);
                        }
                    }
                },
                collapse: () => {
                    this.collapse();
                }
            });
            this._disposables.add(this._commentThreadWidget);
        }
        arrowPosition(range) {
            if (!range) {
                return undefined;
            }
            // Arrow on top edge of zone widget will be at the start of the line if range is multi-line, else at midpoint of range (rounding rightwards)
            return { lineNumber: range.endLineNumber, column: range.endLineNumber === range.startLineNumber ? (range.startColumn + range.endColumn + 1) / 2 : 1 };
        }
        deleteCommentThread() {
            this.dispose();
            this.commentService.disposeCommentThread(this.owner, this._commentThread.threadId);
        }
        collapse() {
            this._commentThread.collapsibleState = languages.CommentThreadCollapsibleState.Collapsed;
        }
        expand() {
            this._commentThread.collapsibleState = languages.CommentThreadCollapsibleState.Expanded;
        }
        getGlyphPosition() {
            if (this._commentGlyph) {
                return this._commentGlyph.getPosition().position.lineNumber;
            }
            return 0;
        }
        toggleExpand() {
            if (this._isExpanded) {
                this._commentThread.collapsibleState = languages.CommentThreadCollapsibleState.Collapsed;
            }
            else {
                this._commentThread.collapsibleState = languages.CommentThreadCollapsibleState.Expanded;
            }
        }
        async update(commentThread) {
            if (this._commentThread !== commentThread) {
                this._commentThreadDisposables.forEach(disposable => disposable.dispose());
                this._commentThread = commentThread;
                this._commentThreadDisposables = [];
                this.bindCommentThreadListeners();
            }
            this._commentThreadWidget.updateCommentThread(commentThread);
            // Move comment glyph widget and show position if the line has changed.
            const lineNumber = this._commentThread.range?.endLineNumber ?? 1;
            let shouldMoveWidget = false;
            if (this._commentGlyph) {
                this._commentGlyph.setThreadState(commentThread.state);
                if (this._commentGlyph.getPosition().position.lineNumber !== lineNumber) {
                    shouldMoveWidget = true;
                    this._commentGlyph.setLineNumber(lineNumber);
                }
            }
            if (shouldMoveWidget && this._isExpanded) {
                this.show(this.arrowPosition(this._commentThread.range), 2);
            }
            if (this._commentThread.collapsibleState === languages.CommentThreadCollapsibleState.Expanded) {
                this.show(this.arrowPosition(this._commentThread.range), 2);
            }
            else {
                this.hide();
            }
        }
        _onWidth(widthInPixel) {
            this._commentThreadWidget.layout(widthInPixel);
        }
        _doLayout(heightInPixel, widthInPixel) {
            this._commentThreadWidget.layout(widthInPixel);
        }
        display(range) {
            if (range) {
                this._commentGlyph = new commentGlyphWidget_1.CommentGlyphWidget(this.editor, range?.endLineNumber ?? -1);
                this._commentGlyph.setThreadState(this._commentThread.state);
            }
            this._commentThreadWidget.display(this.editor.getOption(66 /* EditorOption.lineHeight */));
            this._disposables.add(this._commentThreadWidget.onDidResize(dimension => {
                this._refresh(dimension);
            }));
            if ((this._commentThread.collapsibleState === languages.CommentThreadCollapsibleState.Expanded) || (range === undefined)) {
                this.show(this.arrowPosition(range), 2);
            }
            // If this is a new comment thread awaiting user input then we need to reveal it.
            if (this._commentThread.canReply && this._commentThread.isTemplate && (!this._commentThread.comments || (this._commentThread.comments.length === 0))) {
                this.reveal();
            }
            this.bindCommentThreadListeners();
        }
        bindCommentThreadListeners() {
            this._commentThreadDisposables.push(this._commentThread.onDidChangeComments(async (_) => {
                await this.update(this._commentThread);
            }));
            this._commentThreadDisposables.push(this._commentThread.onDidChangeRange(range => {
                // Move comment glyph widget and show position if the line has changed.
                const lineNumber = this._commentThread.range?.startLineNumber ?? 1;
                let shouldMoveWidget = false;
                if (this._commentGlyph) {
                    if (this._commentGlyph.getPosition().position.lineNumber !== lineNumber) {
                        shouldMoveWidget = true;
                        this._commentGlyph.setLineNumber(lineNumber);
                    }
                }
                if (shouldMoveWidget && this._isExpanded) {
                    this.show(this.arrowPosition(this._commentThread.range), 2);
                }
            }));
            this._commentThreadDisposables.push(this._commentThread.onDidChangeCollapsibleState(state => {
                if (state === languages.CommentThreadCollapsibleState.Expanded && !this._isExpanded) {
                    this.show(this.arrowPosition(this._commentThread.range), 2);
                    return;
                }
                if (state === languages.CommentThreadCollapsibleState.Collapsed && this._isExpanded) {
                    this.hide();
                    return;
                }
            }));
            if (this._initialCollapsibleState === undefined) {
                const onDidChangeInitialCollapsibleState = this._commentThread.onDidChangeInitialCollapsibleState(state => {
                    // File comments always start expanded
                    this._initialCollapsibleState = this._commentThread.range ? state : languages.CommentThreadCollapsibleState.Expanded;
                    this._commentThread.collapsibleState = this._initialCollapsibleState;
                    onDidChangeInitialCollapsibleState.dispose();
                });
                this._commentThreadDisposables.push(onDidChangeInitialCollapsibleState);
            }
            this._commentThreadDisposables.push(this._commentThread.onDidChangeState(() => {
                const borderColor = getCommentThreadWidgetStateColor(this._commentThread.state, this.themeService.getColorTheme()) || color_1.Color.transparent;
                this.style({
                    frameColor: borderColor,
                    arrowColor: borderColor,
                });
                this.container?.style.setProperty(commentColors_1.commentThreadStateColorVar, `${borderColor}`);
                this.container?.style.setProperty(commentColors_1.commentThreadStateBackgroundColorVar, `${borderColor.transparent(.1)}`);
            }));
        }
        async submitComment() {
            return this._commentThreadWidget.submitComment();
        }
        _refresh(dimensions) {
            if (dimensions.height === 0 && dimensions.width === 0) {
                this.commentThread.collapsibleState = languages.CommentThreadCollapsibleState.Collapsed;
                return;
            }
            if (this._isExpanded) {
                this._commentThreadWidget.layout();
                const headHeight = Math.ceil(this.editor.getOption(66 /* EditorOption.lineHeight */) * 1.2);
                const lineHeight = this.editor.getOption(66 /* EditorOption.lineHeight */);
                const arrowHeight = Math.round(lineHeight / 3);
                const frameThickness = Math.round(lineHeight / 9) * 2;
                const computedLinesNumber = Math.ceil((headHeight + dimensions.height + arrowHeight + frameThickness + 8 /** margin bottom to avoid margin collapse */) / lineHeight);
                if (this._viewZone?.heightInLines === computedLinesNumber) {
                    return;
                }
                const currentPosition = this.getPosition();
                if (this._viewZone && currentPosition && currentPosition.lineNumber !== this._viewZone.afterLineNumber && this._viewZone.afterLineNumber !== 0) {
                    this._viewZone.afterLineNumber = currentPosition.lineNumber;
                }
                if (!this._commentThread.comments || !this._commentThread.comments.length) {
                    this._commentThreadWidget.focusCommentEditor();
                }
                this._relayout(computedLinesNumber);
            }
        }
        _applyTheme(theme) {
            const borderColor = getCommentThreadWidgetStateColor(this._commentThread.state, this.themeService.getColorTheme()) || color_1.Color.transparent;
            this.style({
                arrowColor: borderColor,
                frameColor: borderColor
            });
            const fontInfo = this.editor.getOption(50 /* EditorOption.fontInfo */);
            // Editor decorations should also be responsive to theme changes
            this._commentThreadWidget.applyTheme(theme, fontInfo);
        }
        show(rangeOrPos, heightInLines) {
            this._isExpanded = true;
            super.show(rangeOrPos ?? new range_1.Range(0, 0, 0, 0), heightInLines);
            this._commentThread.collapsibleState = languages.CommentThreadCollapsibleState.Expanded;
            this._refresh(this._commentThreadWidget.getDimensions());
        }
        hide() {
            if (this._isExpanded) {
                this._isExpanded = false;
                // Focus the container so that the comment editor will be blurred before it is hidden
                if (this.editor.hasWidgetFocus()) {
                    this.editor.focus();
                }
                if (!this._commentThread.comments || !this._commentThread.comments.length) {
                    this.deleteCommentThread();
                }
            }
            super.hide();
        }
        dispose() {
            super.dispose();
            if (this._commentGlyph) {
                this._commentGlyph.dispose();
                this._commentGlyph = undefined;
            }
            this._globalToDispose.dispose();
            this._commentThreadDisposables.forEach(global => global.dispose());
            this._onDidClose.fire(undefined);
        }
    };
    exports.ReviewZoneWidget = ReviewZoneWidget;
    exports.ReviewZoneWidget = ReviewZoneWidget = __decorate([
        __param(5, instantiation_1.IInstantiationService),
        __param(6, themeService_1.IThemeService),
        __param(7, commentService_1.ICommentService),
        __param(8, contextkey_1.IContextKeyService),
        __param(9, configuration_1.IConfigurationService)
    ], ReviewZoneWidget);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudFRocmVhZFpvbmVXaWRnZXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jb21tZW50cy9icm93c2VyL2NvbW1lbnRUaHJlYWRab25lV2lkZ2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXlCaEcsU0FBUyxnQ0FBZ0MsQ0FBQyxNQUFnRCxFQUFFLEtBQWtCO1FBQzdHLE9BQU8sSUFBQSxnREFBZ0MsRUFBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyx5QkFBYyxDQUFDLENBQUM7SUFDMUYsQ0FBQztJQUVELFNBQWdCLDJCQUEyQixDQUFDLENBQW9CO1FBQy9ELE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBRTdCLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDWCxPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFO1lBQ3hCLE9BQU8sSUFBSSxDQUFDO1NBQ1o7UUFFRCxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxvREFBNEMsRUFBRTtZQUM5RCxPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDN0IsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxlQUFlLENBQUM7UUFFMUcsaURBQWlEO1FBQ2pELElBQUksYUFBYSxHQUFHLEVBQUUsRUFBRTtZQUN2QixPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsT0FBTyxFQUFFLFVBQVUsRUFBRSxLQUFLLENBQUMs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