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
define(["require", "exports", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/arraysFind", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/range", "vs/editor/common/editorCommon", "vs/editor/common/model/textModel", "vs/editor/common/languages", "vs/nls", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/comments/browser/commentGlyphWidget", "vs/workbench/contrib/comments/browser/commentService", "vs/workbench/contrib/comments/browser/commentThreadZoneWidget", "vs/workbench/services/editor/common/editorService", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/workbench/common/views", "vs/workbench/contrib/comments/browser/commentsTreeViewer", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/comments/common/commentsConfiguration", "vs/workbench/contrib/comments/browser/commentReply", "vs/base/common/event", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/comments/browser/commentThreadRangeDecorator", "vs/base/browser/ui/aria/aria", "vs/workbench/contrib/comments/common/commentContextKeys", "vs/css!./media/review"], function (require, exports, actions_1, arrays_1, arraysFind_1, async_1, errors_1, lifecycle_1, codeEditorService_1, range_1, editorCommon_1, textModel_1, languages, nls, contextView_1, instantiation_1, quickInput_1, commentGlyphWidget_1, commentService_1, commentThreadZoneWidget_1, editorService_1, embeddedCodeEditorWidget_1, views_1, commentsTreeViewer_1, configuration_1, commentsConfiguration_1, commentReply_1, event_1, contextkey_1, commentThreadRangeDecorator_1, aria_1, commentContextKeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CommentController = exports.ID = void 0;
    exports.ID = 'editor.contrib.review';
    class CommentingRangeDecoration {
        get id() {
            return this._decorationId;
        }
        set id(id) {
            this._decorationId = id;
        }
        get range() {
            return {
                startLineNumber: this._startLineNumber, startColumn: 1,
                endLineNumber: this._endLineNumber, endColumn: 1
            };
        }
        constructor(_editor, _ownerId, _extensionId, _label, _range, options, commentingRangesInfo, isHover = false) {
            this._editor = _editor;
            this._ownerId = _ownerId;
            this._extensionId = _extensionId;
            this._label = _label;
            this._range = _range;
            this.options = options;
            this.commentingRangesInfo = commentingRangesInfo;
            this.isHover = isHover;
            this._startLineNumber = _range.startLineNumber;
            this._endLineNumber = _range.endLineNumber;
        }
        getCommentAction() {
            return {
                extensionId: this._extensionId,
                label: this._label,
                ownerId: this._ownerId,
                commentingRangesInfo: this.commentingRangesInfo
            };
        }
        getOriginalRange() {
            return this._range;
        }
        getActiveRange() {
            return this.id ? this._editor.getModel().getDecorationRange(this.id) : undefined;
        }
    }
    class CommentingRangeDecorator {
        static { this.description = 'commenting-range-decorator'; }
        constructor() {
            this.commentingRangeDecorations = [];
            this.decorationIds = [];
            this._lastHover = -1;
            this._onDidChangeDecorationsCount = new event_1.Emitter();
            this.onDidChangeDecorationsCount = this._onDidChangeDecorationsCount.event;
            const decorationOptions = {
                description: CommentingRangeDecorator.description,
                isWholeLine: true,
                linesDecorationsClassName: 'comment-range-glyph comment-diff-added'
            };
            this.decorationOptions = textModel_1.ModelDecorationOptions.createDynamic(decorationOptions);
            const hoverDecorationOptions = {
                description: CommentingRangeDecorator.description,
                isWholeLine: true,
                linesDecorationsClassName: `comment-range-glyph line-hover`
            };
            this.hoverDecorationOptions = textModel_1.ModelDecorationOptions.createDynamic(hoverDecorationOptions);
            const multilineDecorationOptions = {
                description: CommentingRangeDecorator.description,
                isWholeLine: true,
                linesDecorationsClassName: `comment-range-glyph multiline-add`
            };
            this.multilineDecorationOptions = textModel_1.ModelDecorationOptions.createDynamic(multilineDecorationOptions);
        }
        updateHover(hoverLine) {
            if (this._editor && this._infos && (hoverLine !== this._lastHover)) {
                this._doUpdate(this._editor, this._infos, hoverLine);
            }
            this._lastHover = hoverLine ?? -1;
        }
        updateSelection(cursorLine, range = new range_1.Range(0, 0, 0, 0)) {
            this._lastSelection = range.isEmpty() ? undefined : range;
            this._lastSelectionCursor = range.isEmpty() ? undefined : cursorLine;
            // Some scenarios:
            // Selection is made. Emphasis should show on the drag/selection end location.
            // Selection is made, then user clicks elsewhere. We should still show the decoration.
            if (this._editor && this._infos) {
                this._doUpdate(this._editor, this._infos, cursorLine, range);
            }
        }
        update(editor, commentInfos, cursorLine, range) {
            if (editor) {
                this._editor = editor;
                this._infos = commentInfos;
                this._doUpdate(editor, commentInfos, cursorLine, range);
            }
        }
        _lineHasThread(editor, lineRange) {
            return editor.getDecorationsInRange(lineRange)?.find(decoration => decoration.options.description === commentGlyphWidget_1.CommentGlyphWidget.description);
        }
        _doUpdate(editor, commentInfos, emphasisLine = -1, selectionRange = this._lastSelection) {
            const model = editor.getModel();
            if (!model) {
                return;
            }
            // If there's still a selection, use that.
            emphasisLine = this._lastSelectionCursor ?? emphasisLine;
            const commentingRangeDecorations = [];
            for (const info of commentInfos) {
                info.commentingRanges.ranges.forEach(range => {
                    const rangeObject = new range_1.Range(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn);
                    let intersectingSelectionRange = selectionRange ? rangeObject.intersectRanges(selectionRange) : undefined;
                    if ((selectionRange && (emphasisLine >= 0) && intersectingSelectionRange)
                        // If there's only one selection line, then just drop into the else if and show an emphasis line.
                        && !((intersectingSelectionRange.startLineNumber === intersectingSelectionRange.endLineNumber)
                            && (emphasisLine === intersectingSelectionRange.startLineNumber))) {
                        // The emphasisLine should be within the commenting range, even if the selection range stretches
                        // outside of the commenting range.
                        // Clip the emphasis and selection ranges to the commenting range
                        let intersectingEmphasisRange;
                        if (emphasisLine <= intersectingSelectionRange.startLineNumber) {
                            intersectingEmphasisRange = intersectingSelectionRange.collapseToStart();
                            intersectingSelectionRange = new range_1.Range(intersectingSelectionRange.startLineNumber + 1, 1, intersectingSelectionRange.endLineNumber, 1);
                        }
                        else {
                            intersectingEmphasisRange = new range_1.Range(intersectingSelectionRange.endLineNumber, 1, intersectingSelectionRange.endLineNumber, 1);
                            intersectingSelectionRange = new range_1.Range(intersectingSelectionRange.startLineNumber, 1, intersectingSelectionRange.endLineNumber - 1, 1);
                        }
                        commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.owner, info.extensionId, info.label, intersectingSelectionRange, this.multilineDecorationOptions, info.commentingRanges, true));
                        if (!this._lineHasThread(editor, intersectingEmphasisRange)) {
                            commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.owner, info.extensionId, info.label, intersectingEmphasisRange, this.hoverDecorationOptions, info.commentingRanges, true));
                        }
                        const beforeRangeEndLine = Math.min(intersectingEmphasisRange.startLineNumber, intersectingSelectionRange.startLineNumber) - 1;
                        const hasBeforeRange = rangeObject.startLineNumber <= beforeRangeEndLine;
                        const afterRangeStartLine = Math.max(intersectingEmphasisRange.endLineNumber, intersectingSelectionRange.endLineNumber) + 1;
                        const hasAfterRange = rangeObject.endLineNumber >= afterRangeStartLine;
                        if (hasBeforeRange) {
                            const beforeRange = new range_1.Range(range.startLineNumber, 1, beforeRangeEndLine, 1);
                            commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.owner, info.extensionId, info.label, beforeRange, this.decorationOptions, info.commentingRanges, true));
                        }
                        if (hasAfterRange) {
                            const afterRange = new range_1.Range(afterRangeStartLine, 1, range.endLineNumber, 1);
                            commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.owner, info.extensionId, info.label, afterRange, this.decorationOptions, info.commentingRanges, true));
                        }
                    }
                    else if ((rangeObject.startLineNumber <= emphasisLine) && (emphasisLine <= rangeObject.endLineNumber)) {
                        if (rangeObject.startLineNumber < emphasisLine) {
                            const beforeRange = new range_1.Range(range.startLineNumber, 1, emphasisLine - 1, 1);
                            commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.owner, info.extensionId, info.label, beforeRange, this.decorationOptions, info.commentingRanges, true));
                        }
                        const emphasisRange = new range_1.Range(emphasisLine, 1, emphasisLine, 1);
                        if (!this._lineHasThread(editor, emphasisRange)) {
                            commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.owner, info.extensionId, info.label, emphasisRange, this.hoverDecorationOptions, info.commentingRanges, true));
                        }
                        if (emphasisLine < rangeObject.endLineNumber) {
                            const afterRange = new range_1.Range(emphasisLine + 1, 1, range.endLineNumber, 1);
                            commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.owner, info.extensionId, info.label, afterRange, this.decorationOptions, info.commentingRanges, true));
                        }
                    }
                    else {
                        commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.owner, info.extensionId, info.label, range, this.decorationOptions, info.commentingRanges));
                    }
                });
            }
            editor.changeDecorations((accessor) => {
                this.decorationIds = accessor.deltaDecorations(this.decorationIds, commentingRangeDecorations);
                commentingRangeDecorations.forEach((decoration, index) => decoration.id = this.decorationIds[index]);
            });
            const rangesDifference = this.commentingRangeDecorations.length - commentingRangeDecorations.length;
            this.commentingRangeDecorations = commentingRangeDecorations;
            if (rangesDifference) {
                this._onDidChangeDecorationsCount.fire(this.commentingRangeDecorations.length);
            }
        }
        areRangesIntersectingOrTouchingByLine(a, b) {
            // Check if `a` is before `b`
            if (a.endLineNumber < (b.startLineNumber - 1)) {
                return false;
            }
            // Check if `b` is before `a`
            if ((b.endLineNumber + 1) < a.startLineNumber) {
                return false;
            }
            // These ranges must intersect
            return true;
        }
        getMatchedCommentAction(commentRange) {
            if (commentRange === undefined) {
                const foundInfos = this._infos?.filter(info => info.commentingRanges.fileComments);
                if (foundInfos) {
                    return foundInfos.map(foundInfo => {
                        return {
                            ownerId: foundInfo.owner,
                            extensionId: foundInfo.extensionId,
                            label: foundInfo.label,
                            commentingRangesInfo: foundInfo.commentingRanges
                        };
                    });
                }
                return [];
            }
            // keys is ownerId
            const foundHoverActions = new Map();
            for (const decoration of this.commentingRangeDecorations) {
                const range = decoration.getActiveRange();
                if (range && this.areRangesIntersectingOrTouchingByLine(range, commentRange)) {
                    // We can have several commenting ranges that match from the same owner because of how
                    // the line hover and selection decoration is done.
                    // The ranges must be merged so that we can see if the new commentRange fits within them.
                    const action = decoration.getCommentAction();
                    const alreadyFoundInfo = foundHoverActions.get(action.ownerId);
                    if (alreadyFoundInfo?.action.commentingRangesInfo === action.commentingRangesInfo) {
                        // Merge ranges.
                        const newRange = new range_1.Range(range.startLineNumber < alreadyFoundInfo.range.startLineNumber ? range.startLineNumber : alreadyFoundInfo.range.startLineNumber, range.startColumn < alreadyFoundInfo.range.startColumn ? range.startColumn : alreadyFoundInfo.range.startColumn, range.endLineNumber > alreadyFoundInfo.range.endLineNumber ? range.endLineNumber : alreadyFoundInfo.range.endLineNumber, range.endColumn > alreadyFoundInfo.range.endColumn ? range.endColumn : alreadyFoundInfo.range.endColumn);
                        foundHoverActions.set(action.ownerId, { range: newRange, action });
                    }
                    else {
                        foundHoverActions.set(action.ownerId, { range, action });
                    }
                }
            }
            return Array.from(foundHoverActions.values()).filter(action => {
                return (action.range.startLineNumber <= commentRange.startLineNumber) && (commentRange.endLineNumber <= action.range.endLineNumber);
            }).map(actions => actions.action);
        }
        getNearestCommentingRange(findPosition, reverse) {
            let findPositionContainedWithin;
            let decorations;
            if (reverse) {
                decorations = [];
                for (let i = this.commentingRangeDecorations.length - 1; i >= 0; i--) {
                    decorations.push(this.commentingRangeDecorations[i]);
                }
            }
            else {
                decorations = this.commentingRangeDecorations;
            }
            for (const decoration of decorations) {
                const range = decoration.getActiveRange();
                if (!range) {
                    continue;
                }
                if (findPositionContainedWithin && this.areRangesIntersectingOrTouchingByLine(range, findPositionContainedWithin)) {
                    findPositionContainedWithin = range_1.Range.plusRange(findPositionContainedWithin, range);
                    continue;
                }
                if (range.startLineNumber <= findPosition.lineNumber && findPosition.lineNumber <= range.endLineNumber) {
                    findPositionContainedWithin = new range_1.Range(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn);
                    continue;
                }
                if (!reverse && range.endLineNumber < findPosition.lineNumber) {
                    continue;
                }
                if (reverse && range.startLineNumber > findPosition.lineNumber) {
                    continue;
                }
                return range;
            }
            return decorations[0].getActiveRange() ?? undefined;
        }
        dispose() {
            this.commentingRangeDecorations = [];
        }
    }
    let CommentController = class CommentController {
        constructor(editor, commentService, instantiationService, codeEditorService, contextMenuService, quickInputService, viewsService, configurationService, contextKeyService, editorService) {
            this.commentService = commentService;
            this.instantiationService = instantiationService;
            this.codeEditorService = codeEditorService;
            this.contextMenuService = contextMenuService;
            this.quickInputService = quickInputService;
            this.viewsService = viewsService;
            this.configurationService = configurationService;
            this.editorService = editorService;
            this.globalToDispose = new lifecycle_1.DisposableStore();
            this.localToDispose = new lifecycle_1.DisposableStore();
            this.mouseDownInfo = null;
            this._commentingRangeSpaceReserved = false;
            this._emptyThreadsToAddQueue = [];
            this._editorDisposables = [];
            this._hasRespondedToEditorChange = false;
            this._commentInfos = [];
            this._commentWidgets = [];
            this._pendingNewCommentCache = {};
            this._pendingEditsCache = {};
            this._computePromise = null;
            this._activeCursorHasCommentingRange = commentContextKeys_1.CommentContextKeys.activeCursorHasCommentingRange.bindTo(contextKeyService);
            this._activeEditorHasCommentingRange = commentContextKeys_1.CommentContextKeys.activeEditorHasCommentingRange.bindTo(contextKeyService);
            if (editor instanceof embeddedCodeEditorWidget_1.EmbeddedCodeEditorWidget) {
                return;
            }
            this.editor = editor;
            this._commentingRangeDecorator = new CommentingRangeDecorator();
            this.globalToDispose.add(this._commentingRangeDecorator.onDidChangeDecorationsCount(count => {
                if (count === 0) {
                    this.clearEditorListeners();
                }
                else if (this._editorDisposables.length === 0) {
                    this.registerEditorListeners();
                }
            }));
            this.globalToDispose.add(this._commentThreadRangeDecorator = new commentThreadRangeDecorator_1.CommentThreadRangeDecorator(this.commentService));
            this.globalToDispose.add(this.commentService.onDidDeleteDataProvider(ownerId => {
                if (ownerId) {
                    delete this._pendingNewCommentCache[ownerId];
                    delete this._pendingEditsCache[ownerId];
                }
                else {
                    this._pendingNewCommentCache = {};
                    this._pendingEditsCache = {};
                }
                this.beginCompute();
            }));
            this.globalToDispose.add(this.commentService.onDidSetDataProvider(_ => this.beginComputeAndHandleEditorChange()));
            this.globalToDispose.add(this.commentService.onDidUpdateCommentingRanges(_ => this.beginComputeAndHandleEditorChange()));
            this.globalToDispose.add(this.commentService.onDidSetResourceCommentInfos(e => {
                const editorURI = this.editor && this.editor.hasModel() && this.editor.getModel().uri;
                if (editorURI && editorURI.toString() === e.resource.toString()) {
                    this.setComments(e.commentInfos.filter(commentInfo => commentInfo !== null));
                }
            }));
            this.globalToDispose.add(this.commentService.onDidChangeCommentingEnabled(e => {
                if (e) {
                    this.registerEditorListeners();
                    this.beginCompute();
                }
                else {
                    this.tryUpdateReservedSpace();
                    this.clearEditorListeners();
                    this._commentingRangeDecorator.update(this.editor, []);
                    this._commentThreadRangeDecorator.update(this.editor, []);
                    (0, lifecycle_1.dispose)(this._commentWidgets);
                    this._commentWidgets = [];
                }
            }));
            this.globalToDispose.add(this.editor.onDidChangeModel(_ => this.onModelChanged()));
            this.globalToDispose.add(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('diffEditor.renderSideBySide')) {
                    this.beginCompute();
                }
            }));
            this.onModelChanged();
            this.codeEditorService.registerDecorationType('comment-controller', commentReply_1.COMMENTEDITOR_DECORATION_KEY, {});
            this.commentService.registerContinueOnCommentProvider({
                provideContinueOnComments: () => {
                    const pendingComments = [];
                    if (this._commentWidgets) {
                        for (const zone of this._commentWidgets) {
                            const zonePendingComments = zone.getPendingComments();
                            const pendingNewComment = zonePendingComments.newComment;
                            if (!pendingNewComment || !zone.commentThread.range) {
                                continue;
                            }
                            let lastCommentBody;
                            if (zone.commentThread.comments && zone.commentThread.comments.length) {
                                const lastComment = zone.commentThread.comments[zone.commentThread.comments.length - 1];
                                if (typeof lastComment.body === 'string') {
                                    lastCommentBody = lastComment.body;
                                }
                                else {
                                    lastCommentBody = lastComment.body.value;
                                }
                            }
                            if (pendingNewComment !== lastCommentBody) {
                                pendingComments.push({
                                    owner: zone.owner,
                                    uri: zone.editor.getModel().uri,
                                    range: zone.commentThread.range,
                                    body: pendingNewComment
                                });
                            }
                        }
                    }
                    return pendingComments;
                }
            });
        }
        registerEditorListeners() {
            this._editorDisposables = [];
            if (!this.editor) {
                return;
            }
            this._editorDisposables.push(this.editor.onMouseMove(e => this.onEditorMouseMove(e)));
            this._editorDisposables.push(this.editor.onDidChangeCursorPosition(e => this.onEditorChangeCursorPosition(e.position)));
            this._editorDisposables.push(this.editor.onDidFocusEditorWidget(() => this.onEditorChangeCursorPosition(this.editor?.getPosition() ?? null)));
            this._editorDisposables.push(this.editor.onDidChangeCursorSelection(e => this.onEditorChangeCursorSelection(e)));
            this._editorDisposables.push(this.editor.onDidBlurEditorWidget(() => this.onEditorChangeCursorSelection()));
        }
        clearEditorListeners() {
            (0, lifecycle_1.dispose)(this._editorDisposables);
            this._editorDisposables = [];
        }
        onEditorMouseMove(e) {
            const position = e.target.position?.lineNumber;
            if (e.event.leftButton.valueOf() && position && this.mouseDownInfo) {
                this._commentingRangeDecorator.updateSelection(position, new range_1.Range(this.mouseDownInfo.lineNumber, 1, position, 1));
            }
            else {
                this._commentingRangeDecorator.updateHover(position);
            }
        }
        onEditorChangeCursorSelection(e) {
            const position = this.editor?.getPosition()?.lineNumber;
            if (position) {
                this._commentingRangeDecorator.updateSelection(position, e?.selection);
            }
        }
        onEditorChangeCursorPosition(e) {
            const decorations = e ? this.editor?.getDecorationsInRange(range_1.Range.fromPositions(e, { column: -1, lineNumber: e.lineNumber })) : undefined;
            let hasCommentingRange = false;
            if (decorations) {
                for (const decoration of decorations) {
                    if (decoration.options.description === commentGlyphWidget_1.CommentGlyphWidget.description) {
                        // We don't allow multiple comments on the same line.
                        hasCommentingRange = false;
                        break;
                    }
                    else if (decoration.options.description === CommentingRangeDecorator.description) {
                        hasCommentingRange = true;
                    }
                }
            }
            this._activeCursorHasCommentingRange.set(hasCommentingRange);
        }
        isEditorInlineOriginal(testEditor) {
            if (this.configurationService.getValue('diffEditor.renderSideBySide')) {
                return false;
            }
            const foundEditor = this.editorService.visibleTextEditorControls.find(editor => {
                if (editor.getEditorType() === editorCommon_1.EditorType.IDiffEditor) {
                    const diffEditor = editor;
                    return diffEditor.getOriginalEditor() === testEditor;
                }
                return false;
            });
            return !!foundEditor;
        }
        beginCompute() {
            this._computePromise = (0, async_1.createCancelablePromise)(token => {
                const editorURI = this.editor && this.editor.hasModel() && this.editor.getModel().uri;
                if (editorURI) {
                    return this.commentService.getDocumentComments(editorURI);
                }
                return Promise.resolve([]);
            });
            return this._computePromise.then(commentInfos => {
                this.setComments((0, arrays_1.coalesce)(commentInfos));
                this._computePromise = null;
            }, error => console.log(error));
        }
        beginComputeCommentingRanges() {
            if (this._computeCommentingRangeScheduler) {
                if (this._computeCommentingRangePromise) {
                    this._computeCommentingRangePromise.cancel();
                    this._computeCommentingRangePromise = null;
                }
                this._computeCommentingRangeScheduler.trigger(() => {
                    const editorURI = this.editor && this.editor.hasModel() && this.editor.getModel().uri;
                    if (editorURI) {
                        return this.commentService.getDocumentComments(editorURI);
                    }
                    return Promise.resolve([]);
                }).then(commentInfos => {
                    if (this.commentService.isCommentingEnabled) {
                        const meaningfulCommentInfos = (0, arrays_1.coalesce)(commentInfos);
                        this._commentingRangeDecorator.update(this.editor, meaningfulCommentInfos, this.editor?.getPosition()?.lineNumber, this.editor?.getSelection() ?? undefined);
                    }
                }, (err) => {
                    (0, errors_1.onUnexpectedError)(err);
                    return null;
                });
            }
        }
        static get(editor) {
            return editor.getContribution(exports.ID);
        }
        revealCommentThread(threadId, commentUniqueId, fetchOnceIfNotExist, focus) {
            const commentThreadWidget = this._commentWidgets.filter(widget => widget.commentThread.threadId === threadId);
            if (commentThreadWidget.length === 1) {
                commentThreadWidget[0].reveal(commentUniqueId, focus);
            }
            else if (fetchOnceIfNotExist) {
                if (this._computePromise) {
                    this._computePromise.then(_ => {
                        this.revealCommentThread(threadId, commentUniqueId, false, focus);
                    });
                }
                else {
                    this.beginCompute().then(_ => {
                        this.revealCommentThread(threadId, commentUniqueId, false, focus);
                    });
                }
            }
        }
        collapseAll() {
            for (const widget of this._commentWidgets) {
                widget.collapse();
            }
        }
        expandAll() {
            for (const widget of this._commentWidgets) {
                widget.expand();
            }
        }
        expandUnresolved() {
            for (const widget of this._commentWidgets) {
                if (widget.commentThread.state === languages.CommentThreadState.Unresolved) {
                    widget.expand();
                }
            }
        }
        nextCommentThread() {
            this._findNearestCommentThread();
        }
        _findNearestCommentThread(reverse) {
            if (!this._commentWidgets.length || !this.editor?.hasModel()) {
                return;
            }
            const after = this.editor.getSelection().getEndPosition();
            const sortedWidgets = this._commentWidgets.sort((a, b) => {
                if (reverse) {
                    const temp = a;
                    a = b;
                    b = temp;
                }
                if (a.commentThread.range === undefined) {
                    return -1;
                }
                if (b.commentThread.range === undefined) {
                    return 1;
                }
                if (a.commentThread.range.startLineNumber < b.commentThread.range.startLineNumber) {
                    return -1;
                }
                if (a.commentThread.range.startLineNumber > b.commentThread.range.startLineNumber) {
                    return 1;
                }
                if (a.commentThread.range.startColumn < b.commentThread.range.startColumn) {
                    return -1;
                }
                if (a.commentThread.range.startColumn > b.commentThread.range.startColumn) {
                    return 1;
                }
                return 0;
            });
            const idx = (0, arraysFind_1.findFirstIdxMonotonousOrArrLen)(sortedWidgets, widget => {
                const lineValueOne = reverse ? after.lineNumber : (widget.commentThread.range?.startLineNumber ?? 0);
                const lineValueTwo = reverse ? (widget.commentThread.range?.startLineNumber ?? 0) : after.lineNumber;
                const columnValueOne = reverse ? after.column : (widget.commentThread.range?.startColumn ?? 0);
                const columnValueTwo = reverse ? (widget.commentThread.range?.startColumn ?? 0) : after.column;
                if (lineValueOne > lineValueTwo) {
                    return true;
                }
                if (lineValueOne < lineValueTwo) {
                    return false;
                }
                if (columnValueOne > columnValueTwo) {
                    return true;
                }
                return false;
            });
            let nextWidget;
            if (idx === this._commentWidgets.length) {
                nextWidget = this._commentWidgets[0];
            }
            else {
                nextWidget = sortedWidgets[idx];
            }
            this.editor.setSelection(nextWidget.commentThread.range ?? new range_1.Range(1, 1, 1, 1));
            nextWidget.reveal(undefined, true);
        }
        previousCommentThread() {
            this._findNearestCommentThread(true);
        }
        _findNearestCommentingRange(reverse) {
            if (!this.editor?.hasModel()) {
                return;
            }
            const after = this.editor.getSelection().getEndPosition();
            const range = this._commentingRangeDecorator.getNearestCommentingRange(after, reverse);
            if (range) {
                const position = reverse ? range.getEndPosition() : range.getStartPosition();
                this.editor.setPosition(position);
                this.editor.revealLineInCenterIfOutsideViewport(position.lineNumber);
            }
        }
        nextCommentingRange() {
            this._findNearestCommentingRange();
        }
        previousCommentingRange() {
            this._findNearestCommentingRange(true);
        }
        dispose() {
            this.globalToDispose.dispose();
            this.localToDispose.dispose();
            (0, lifecycle_1.dispose)(this._editorDisposables);
            (0, lifecycle_1.dispose)(this._commentWidgets);
            this.editor = null; // Strict null override - nulling out in dispose
        }
        onModelChanged() {
            this.localToDispose.clear();
            this.removeCommentWidgetsAndStoreCache();
            if (!this.editor) {
                return;
            }
            this._hasRespondedToEditorChange = false;
            this.localToDispose.add(this.editor.onMouseDown(e => this.onEditorMouseDown(e)));
            this.localToDispose.add(this.editor.onMouseUp(e => this.onEditorMouseUp(e)));
            if (this._editorDisposables.length) {
                this.clearEditorListeners();
                this.registerEditorListeners();
            }
            this._computeCommentingRangeScheduler = new async_1.Delayer(200);
            this.localToDispose.add({
                dispose: () => {
                    this._computeCommentingRangeScheduler?.cancel();
                    this._computeCommentingRangeScheduler = null;
                }
            });
            this.localToDispose.add(this.editor.onDidChangeModelContent(async () => {
                this.beginComputeCommentingRanges();
            }));
            this.localToDispose.add(this.commentService.onDidUpdateCommentThreads(async (e) => {
                const editorURI = this.editor && this.editor.hasModel() && this.editor.getModel().uri;
                if (!editorURI || !this.commentService.isCommentingEnabled) {
                    return;
                }
                if (this._computePromise) {
                    await this._computePromise;
                }
                const commentInfo = this._commentInfos.filter(info => info.owner === e.owner);
                if (!commentInfo || !commentInfo.length) {
                    return;
                }
                const added = e.added.filter(thread => thread.resource && thread.resource === editorURI.toString());
                const removed = e.removed.filter(thread => thread.resource && thread.resource === editorURI.toString());
                const changed = e.changed.filter(thread => thread.resource && thread.resource === editorURI.toString());
                const pending = e.pending.filter(pending => pending.uri.toString() === editorURI.toString());
                removed.forEach(thread => {
                    const matchedZones = this._commentWidgets.filter(zoneWidget => zoneWidget.owner === e.owner && zoneWidget.commentThread.threadId === thread.threadId && zoneWidget.commentThread.threadId !== '');
                    if (matchedZones.length) {
                        const matchedZone = matchedZones[0];
                        const index = this._commentWidgets.indexOf(matchedZone);
                        this._commentWidgets.splice(index, 1);
                        matchedZone.dispose();
                    }
                    const infosThreads = this._commentInfos.filter(info => info.owner === e.owner)[0].threads;
                    for (let i = 0; i < infosThreads.length; i++) {
                        if (infosThreads[i] === thread) {
                            infosThreads.splice(i, 1);
                            i--;
                        }
                    }
                });
                changed.forEach(thread => {
                    const matchedZones = this._commentWidgets.filter(zoneWidget => zoneWidget.owner === e.owner && zoneWidget.commentThread.threadId === thread.threadId);
                    if (matchedZones.length) {
                        const matchedZone = matchedZones[0];
                        matchedZone.update(thread);
                        this.openCommentsView(thread);
                    }
                });
                added.forEach(thread => {
                    const matchedZones = this._commentWidgets.filter(zoneWidget => zoneWidget.owner === e.owner && zoneWidget.commentThread.threadId === thread.threadId);
                    if (matchedZones.length) {
                        return;
                    }
                    const matchedNewCommentThreadZones = this._commentWidgets.filter(zoneWidget => zoneWidget.owner === e.owner && zoneWidget.commentThread.commentThreadHandle === -1 && range_1.Range.equalsRange(zoneWidget.commentThread.range, thread.range));
                    if (matchedNewCommentThreadZones.length) {
                        matchedNewCommentThreadZones[0].update(thread);
                        return;
                    }
                    const continueOnCommentText = (thread.range ? this.commentService.removeContinueOnComment({ owner: e.owner, uri: editorURI, range: thread.range })?.body : undefined);
                    const pendingCommentText = (this._pendingNewCommentCache[e.owner] && this._pendingNewCommentCache[e.owner][thread.threadId])
                        ?? continueOnCommentText;
                    const pendingEdits = this._pendingEditsCache[e.owner] && this._pendingEditsCache[e.owner][thread.threadId];
                    this.displayCommentThread(e.owner, thread, pendingCommentText, pendingEdits);
                    this._commentInfos.filter(info => info.owner === e.owner)[0].threads.push(thread);
                    this.tryUpdateReservedSpace();
                });
                pending.forEach(thread => {
                    this.commentService.createCommentThreadTemplate(thread.owner, thread.uri, range_1.Range.lift(thread.range));
                });
                this._commentThreadRangeDecorator.update(this.editor, commentInfo);
            }));
            this.beginComputeAndHandleEditorChange();
        }
        beginComputeAndHandleEditorChange() {
            this.beginCompute().then(() => {
                if (!this._hasRespondedToEditorChange) {
                    if (this._commentInfos.some(commentInfo => commentInfo.commentingRanges.ranges.length > 0 || commentInfo.commentingRanges.fileComments)) {
                        this._hasRespondedToEditorChange = true;
                        this._activeEditorHasCommentingRange.set(true);
                        (0, aria_1.status)(nls.localize('hasCommentRanges', "Editor has commenting ranges."));
                    }
                    else {
                        this._activeEditorHasCommentingRange.set(false);
                    }
                }
            });
        }
        async openCommentsView(thread) {
            if (thread.comments && (thread.comments.length > 0)) {
                const openViewState = this.configurationService.getValue(commentsConfiguration_1.COMMENTS_SECTION).openView;
                if (openViewState === 'file') {
                    return this.viewsService.openView(commentsTreeViewer_1.COMMENTS_VIEW_ID);
                }
                else if (openViewState === 'firstFile' || (openViewState === 'firstFileUnresolved' && thread.state === languages.CommentThreadState.Unresolved)) {
                    const hasShownView = this.viewsService.getViewWithId(commentsTreeViewer_1.COMMENTS_VIEW_ID)?.hasRendered;
                    if (!hasShownView) {
                        return this.viewsService.openView(commentsTreeViewer_1.COMMENTS_VIEW_ID);
                    }
                }
            }
            return undefined;
        }
        displayCommentThread(owner, thread, pendingComment, pendingEdits) {
            if (!this.editor?.getModel()) {
                return;
            }
            if (this.isEditorInlineOriginal(this.editor)) {
                return;
            }
            const zoneWidget = this.instantiationService.createInstance(commentThreadZoneWidget_1.ReviewZoneWidget, this.editor, owner, thread, pendingComment, pendingEdits);
            zoneWidget.display(thread.range);
            this._commentWidgets.push(zoneWidget);
            this.openCommentsView(thread);
        }
        onEditorMouseDown(e) {
            this.mouseDownInfo = (0, commentThreadZoneWidget_1.parseMouseDownInfoFromEvent)(e);
        }
        onEditorMouseUp(e) {
            const matchedLineNumber = (0, commentThreadZoneWidget_1.isMouseUpEventDragFromMouseDown)(this.mouseDownInfo, e);
            this.mouseDownInfo = null;
            if (!this.editor || matchedLineNumber === null || !e.target.element) {
                return;
            }
            const mouseUpIsOnDecorator = (e.target.element.className.indexOf('comment-range-glyph') >= 0);
            const lineNumber = e.target.position.lineNumber;
            let range;
            let selection;
            // Check for drag along gutter decoration
            if ((matchedLineNumber !== lineNumber)) {
                if (matchedLineNumber > lineNumber) {
                    selection = new range_1.Range(matchedLineNumber, this.editor.getModel().getLineLength(matchedLineNumber) + 1, lineNumber, 1);
                }
                else {
                    selection = new range_1.Range(matchedLineNumber, 1, lineNumber, this.editor.getModel().getLineLength(lineNumber) + 1);
                }
            }
            else if (mouseUpIsOnDecorator) {
                selection = this.editor.getSelection();
            }
            // Check for selection at line number.
            if (selection && (selection.startLineNumber <= lineNumber) && (lineNumber <= selection.endLineNumber)) {
                range = selection;
                this.editor.setSelection(new range_1.Range(selection.endLineNumber, 1, selection.endLineNumber, 1));
            }
            else if (mouseUpIsOnDecorator) {
                range = new range_1.Range(lineNumber, 1, lineNumber, 1);
            }
            if (range) {
                this.addOrToggleCommentAtLine(range, e);
            }
        }
        async addOrToggleCommentAtLine(commentRange, e) {
            // If an add is already in progress, queue the next add and process it after the current one finishes to
            // prevent empty comment threads from being added to the same line.
            if (!this._addInProgress) {
                this._addInProgress = true;
                // The widget's position is undefined until the widget has been displayed, so rely on the glyph position instead
                const existingCommentsAtLine = this._commentWidgets.filter(widget => widget.getGlyphPosition() === (commentRange ? commentRange.endLineNumber : 0));
                if (existingCommentsAtLine.length) {
                    const allExpanded = existingCommentsAtLine.every(widget => widget.expanded);
                    existingCommentsAtLine.forEach(allExpanded ? widget => widget.collapse() : widget => widget.expand());
                    this.processNextThreadToAdd();
                    return;
                }
                else {
                    this.addCommentAtLine(commentRange, e);
                }
            }
            else {
                this._emptyThreadsToAddQueue.push([commentRange, e]);
            }
        }
        processNextThreadToAdd() {
            this._addInProgress = false;
            const info = this._emptyThreadsToAddQueue.shift();
            if (info) {
                this.addOrToggleCommentAtLine(info[0], info[1]);
            }
        }
        addCommentAtLine(range, e) {
            const newCommentInfos = this._commentingRangeDecorator.getMatchedCommentAction(range);
            if (!newCommentInfos.length || !this.editor?.hasModel()) {
                this._addInProgress = false;
                if (!newCommentInfos.length) {
                    throw new Error('There are no commenting ranges at the current position.');
                }
                return Promise.resolve();
            }
            if (newCommentInfos.length > 1) {
                if (e && range) {
                    this.contextMenuService.showContextMenu({
                        getAnchor: () => e.event,
                        getActions: () => this.getContextMenuActions(newCommentInfos, range),
                        getActionsContext: () => newCommentInfos.length ? newCommentInfos[0] : undefined,
                        onHide: () => { this._addInProgress = false; }
                    });
                    return Promise.resolve();
                }
                else {
                    const picks = this.getCommentProvidersQuickPicks(newCommentInfos);
                    return this.quickInputService.pick(picks, { placeHolder: nls.localize('pickCommentService', "Select Comment Provider"), matchOnDescription: true }).then(pick => {
                        if (!pick) {
                            return;
                        }
                        const commentInfos = newCommentInfos.filter(info => info.ownerId === pick.id);
                        if (commentInfos.length) {
                            const { ownerId } = commentInfos[0];
                            this.addCommentAtLine2(range, ownerId);
                        }
                    }).then(() => {
                        this._addInProgress = false;
                    });
                }
            }
            else {
                const { ownerId } = newCommentInfos[0];
                this.addCommentAtLine2(range, ownerId);
            }
            return Promise.resolve();
        }
        getCommentProvidersQuickPicks(commentInfos) {
            const picks = commentInfos.map((commentInfo) => {
                const { ownerId, extensionId, label } = commentInfo;
                return {
                    label: label || extensionId,
                    id: ownerId
                };
            });
            return picks;
        }
        getContextMenuActions(commentInfos, commentRange) {
            const actions = [];
            commentInfos.forEach(commentInfo => {
                const { ownerId, extensionId, label } = commentInfo;
                actions.push(new actions_1.Action('addCommentThread', `${label || extensionId}`, undefined, true, () => {
                    this.addCommentAtLine2(commentRange, ownerId);
                    return Promise.resolve();
                }));
            });
            return actions;
        }
        addCommentAtLine2(range, ownerId) {
            if (!this.editor) {
                return;
            }
            this.commentService.createCommentThreadTemplate(ownerId, this.editor.getModel().uri, range);
            this.processNextThreadToAdd();
            return;
        }
        getExistingCommentEditorOptions(editor) {
            const lineDecorationsWidth = editor.getOption(65 /* EditorOption.lineDecorationsWidth */);
            let extraEditorClassName = [];
            const configuredExtraClassName = editor.getRawOptions().extraEditorClassName;
            if (configuredExtraClassName) {
                extraEditorClassName = configuredExtraClassName.split(' ');
            }
            return { lineDecorationsWidth, extraEditorClassName };
        }
        getWithoutCommentsEditorOptions(editor, extraEditorClassName, startingLineDecorationsWidth) {
            let lineDecorationsWidth = startingLineDecorationsWidth;
            const inlineCommentPos = extraEditorClassName.findIndex(name => name === 'inline-comment');
            if (inlineCommentPos >= 0) {
                extraEditorClassName.splice(inlineCommentPos, 1);
            }
            const options = editor.getOptions();
            if (options.get(43 /* EditorOption.folding */) && options.get(109 /* EditorOption.showFoldingControls */) !== 'never') {
                lineDecorationsWidth += 11; // 11 comes from https://github.com/microsoft/vscode/blob/94ee5f58619d59170983f453fe78f156c0cc73a3/src/vs/workbench/contrib/comments/browser/media/review.css#L485
            }
            lineDecorationsWidth -= 24;
            return { extraEditorClassName, lineDecorationsWidth };
        }
        getWithCommentsEditorOptions(editor, extraEditorClassName, startingLineDecorationsWidth) {
            let lineDecorationsWidth = startingLineDecorationsWidth;
            const options = editor.getOptions();
            if (options.get(43 /* EditorOption.folding */) && options.get(109 /* EditorOption.showFoldingControls */) !== 'never') {
                lineDecorationsWidth -= 11;
            }
            lineDecorationsWidth += 24;
            extraEditorClassName.push('inline-comment');
            return { lineDecorationsWidth, extraEditorClassName };
        }
        updateEditorLayoutOptions(editor, extraEditorClassName, lineDecorationsWidth) {
            editor.updateOptions({
                extraEditorClassName: extraEditorClassName.join(' '),
                lineDecorationsWidth: lineDecorationsWidth
            });
        }
        tryUpdateReservedSpace() {
            if (!this.editor) {
                return;
            }
            const hasCommentsOrRanges = this._commentInfos.some(info => {
                const hasRanges = Boolean(info.commentingRanges && (Array.isArray(info.commentingRanges) ? info.commentingRanges : info.commentingRanges.ranges).length);
                return hasRanges || (info.threads.length > 0);
            });
            if (hasCommentsOrRanges && !this._commentingRangeSpaceReserved && this.commentService.isCommentingEnabled) {
                this._commentingRangeSpaceReserved = true;
                const { lineDecorationsWidth, extraEditorClassName } = this.getExistingCommentEditorOptions(this.editor);
                const newOptions = this.getWithCommentsEditorOptions(this.editor, extraEditorClassName, lineDecorationsWidth);
                this.updateEditorLayoutOptions(this.editor, newOptions.extraEditorClassName, newOptions.lineDecorationsWidth);
            }
            else if ((!hasCommentsOrRanges || !this.commentService.isCommentingEnabled) && this._commentingRangeSpaceReserved) {
                this._commentingRangeSpaceReserved = false;
                const { lineDecorationsWidth, extraEditorClassName } = this.getExistingCommentEditorOptions(this.editor);
                const newOptions = this.getWithoutCommentsEditorOptions(this.editor, extraEditorClassName, lineDecorationsWidth);
                this.updateEditorLayoutOptions(this.editor, newOptions.extraEditorClassName, newOptions.lineDecorationsWidth);
            }
        }
        setComments(commentInfos) {
            if (!this.editor || !this.commentService.isCommentingEnabled) {
                return;
            }
            this._commentInfos = commentInfos;
            this.tryUpdateReservedSpace();
            // create viewzones
            this.removeCommentWidgetsAndStoreCache();
            this._commentInfos.forEach(info => {
                const providerCacheStore = this._pendingNewCommentCache[info.owner];
                const providerEditsCacheStore = this._pendingEditsCache[info.owner];
                info.threads = info.threads.filter(thread => !thread.isDisposed);
                info.threads.forEach(thread => {
                    let pendingComment = undefined;
                    if (providerCacheStore) {
                        pendingComment = providerCacheStore[thread.threadId];
                    }
                    let pendingEdits = undefined;
                    if (providerEditsCacheStore) {
                        pendingEdits = providerEditsCacheStore[thread.threadId];
                    }
                    if (pendingComment || pendingEdits) {
                        thread.collapsibleState = languages.CommentThreadCollapsibleState.Expanded;
                    }
                    this.displayCommentThread(info.owner, thread, pendingComment, pendingEdits);
                });
                info.pendingCommentThreads?.forEach(thread => {
                    this.commentService.createCommentThreadTemplate(thread.owner, thread.uri, range_1.Range.lift(thread.range));
                });
            });
            this._commentingRangeDecorator.update(this.editor, this._commentInfos);
            this._commentThreadRangeDecorator.update(this.editor, this._commentInfos);
        }
        closeWidget() {
            this._commentWidgets?.forEach(widget => widget.hide());
            if (this.editor) {
                this.editor.focus();
                this.editor.revealRangeInCenter(this.editor.getSelection());
            }
        }
        removeCommentWidgetsAndStoreCache() {
            if (this._commentWidgets) {
                this._commentWidgets.forEach(zone => {
                    const pendingComments = zone.getPendingComments();
                    const pendingNewComment = pendingComments.newComment;
                    const providerNewCommentCacheStore = this._pendingNewCommentCache[zone.owner];
                    let lastCommentBody;
                    if (zone.commentThread.comments && zone.commentThread.comments.length) {
                        const lastComment = zone.commentThread.comments[zone.commentThread.comments.length - 1];
                        if (typeof lastComment.body === 'string') {
                            lastCommentBody = lastComment.body;
                        }
                        else {
                            lastCommentBody = lastComment.body.value;
                        }
                    }
                    if (pendingNewComment && (pendingNewComment !== lastCommentBody)) {
                        if (!providerNewCommentCacheStore) {
                            this._pendingNewCommentCache[zone.owner] = {};
                        }
                        this._pendingNewCommentCache[zone.owner][zone.commentThread.threadId] = pendingNewComment;
                    }
                    else {
                        if (providerNewCommentCacheStore) {
                            delete providerNewCommentCacheStore[zone.commentThread.threadId];
                        }
                    }
                    const pendingEdits = pendingComments.edits;
                    const providerEditsCacheStore = this._pendingEditsCache[zone.owner];
                    if (Object.keys(pendingEdits).length > 0) {
                        if (!providerEditsCacheStore) {
                            this._pendingEditsCache[zone.owner] = {};
                        }
                        this._pendingEditsCache[zone.owner][zone.commentThread.threadId] = pendingEdits;
                    }
                    else if (providerEditsCacheStore) {
                        delete providerEditsCacheStore[zone.commentThread.threadId];
                    }
                    zone.dispose();
                });
            }
            this._commentWidgets = [];
        }
    };
    exports.CommentController = CommentController;
    exports.CommentController = CommentController = __decorate([
        __param(1, commentService_1.ICommentService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, codeEditorService_1.ICodeEditorService),
        __param(4, contextView_1.IContextMenuService),
        __param(5, quickInput_1.IQuickInputService),
        __param(6, views_1.IViewsService),
        __param(7, configuration_1.IConfigurationService),
        __param(8, contextkey_1.IContextKeyService),
        __param(9, editorService_1.IEditorService)
    ], CommentController);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudHNDb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY29tbWVudHMvYnJvd3Nlci9jb21tZW50c0NvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBd0NuRixRQUFBLEVBQUUsR0FBRyx1QkFBdUIsQ0FBQztJQVMxQyxNQUFNLHlCQUF5QjtRQUs5QixJQUFXLEVBQUU7WUFDWixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDM0IsQ0FBQztRQUVELElBQVcsRUFBRSxDQUFDLEVBQXNCO1lBQ25DLElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3pCLENBQUM7UUFFRCxJQUFXLEtBQUs7WUFDZixPQUFPO2dCQUNOLGVBQWUsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsV0FBVyxFQUFFLENBQUM7Z0JBQ3RELGFBQWEsRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLFNBQVMsRUFBRSxDQUFDO2FBQ2hELENBQUM7UUFDSCxDQUFDO1FBRUQsWUFBb0IsT0FBb0IsRUFBVSxRQUFnQixFQUFVLFlBQWdDLEVBQVUsTUFBMEIsRUFBVSxNQUFjLEVBQWtCLE9BQStCLEVBQVUsb0JBQWdELEVBQWtCLFVBQW1CLEtBQUs7WUFBelMsWUFBTyxHQUFQLE9BQU8sQ0FBYTtZQUFVLGFBQVEsR0FBUixRQUFRLENBQVE7WUFBVSxpQkFBWSxHQUFaLFlBQVksQ0FBb0I7WUFBVSxXQUFNLEdBQU4sTUFBTSxDQUFvQjtZQUFVLFdBQU0sR0FBTixNQUFNLENBQVE7WUFBa0IsWUFBTyxHQUFQLE9BQU8sQ0FBd0I7WUFBVSx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQTRCO1lBQWtCLFlBQU8sR0FBUCxPQUFPLENBQWlCO1lBQzVULElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxNQUFNLENBQUMs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