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
define(["require", "exports", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/arraysFind", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/range", "vs/editor/common/editorCommon", "vs/editor/common/model/textModel", "vs/editor/common/languages", "vs/nls!vs/workbench/contrib/comments/browser/commentsController", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/comments/browser/commentGlyphWidget", "vs/workbench/contrib/comments/browser/commentService", "vs/workbench/contrib/comments/browser/commentThreadZoneWidget", "vs/workbench/services/editor/common/editorService", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/workbench/common/views", "vs/workbench/contrib/comments/browser/commentsTreeViewer", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/comments/common/commentsConfiguration", "vs/workbench/contrib/comments/browser/commentReply", "vs/base/common/event", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/comments/browser/commentThreadRangeDecorator", "vs/base/browser/ui/aria/aria", "vs/workbench/contrib/comments/common/commentContextKeys", "vs/css!./media/review"], function (require, exports, actions_1, arrays_1, arraysFind_1, async_1, errors_1, lifecycle_1, codeEditorService_1, range_1, editorCommon_1, textModel_1, languages, nls, contextView_1, instantiation_1, quickInput_1, commentGlyphWidget_1, commentService_1, commentThreadZoneWidget_1, editorService_1, embeddedCodeEditorWidget_1, views_1, commentsTreeViewer_1, configuration_1, commentsConfiguration_1, commentReply_1, event_1, contextkey_1, commentThreadRangeDecorator_1, aria_1, commentContextKeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Lmb = exports.ID = void 0;
    exports.ID = 'editor.contrib.review';
    class CommentingRangeDecoration {
        get id() {
            return this.c;
        }
        set id(id) {
            this.c = id;
        }
        get range() {
            return {
                startLineNumber: this.d, startColumn: 1,
                endLineNumber: this.f, endColumn: 1
            };
        }
        constructor(g, h, j, k, l, options, m, isHover = false) {
            this.g = g;
            this.h = h;
            this.j = j;
            this.k = k;
            this.l = l;
            this.options = options;
            this.m = m;
            this.isHover = isHover;
            this.d = l.startLineNumber;
            this.f = l.endLineNumber;
        }
        getCommentAction() {
            return {
                extensionId: this.j,
                label: this.k,
                ownerId: this.h,
                commentingRangesInfo: this.m
            };
        }
        getOriginalRange() {
            return this.l;
        }
        getActiveRange() {
            return this.id ? this.g.getModel().getDecorationRange(this.id) : undefined;
        }
    }
    class CommentingRangeDecorator {
        static { this.description = 'commenting-range-decorator'; }
        constructor() {
            this.g = [];
            this.h = [];
            this.l = -1;
            this.o = new event_1.$fd();
            this.onDidChangeDecorationsCount = this.o.event;
            const decorationOptions = {
                description: CommentingRangeDecorator.description,
                isWholeLine: true,
                linesDecorationsClassName: 'comment-range-glyph comment-diff-added'
            };
            this.c = textModel_1.$RC.createDynamic(decorationOptions);
            const hoverDecorationOptions = {
                description: CommentingRangeDecorator.description,
                isWholeLine: true,
                linesDecorationsClassName: `comment-range-glyph line-hover`
            };
            this.d = textModel_1.$RC.createDynamic(hoverDecorationOptions);
            const multilineDecorationOptions = {
                description: CommentingRangeDecorator.description,
                isWholeLine: true,
                linesDecorationsClassName: `comment-range-glyph multiline-add`
            };
            this.f = textModel_1.$RC.createDynamic(multilineDecorationOptions);
        }
        updateHover(hoverLine) {
            if (this.j && this.k && (hoverLine !== this.l)) {
                this.q(this.j, this.k, hoverLine);
            }
            this.l = hoverLine ?? -1;
        }
        updateSelection(cursorLine, range = new range_1.$ks(0, 0, 0, 0)) {
            this.m = range.isEmpty() ? undefined : range;
            this.n = range.isEmpty() ? undefined : cursorLine;
            // Some scenarios:
            // Selection is made. Emphasis should show on the drag/selection end location.
            // Selection is made, then user clicks elsewhere. We should still show the decoration.
            if (this.j && this.k) {
                this.q(this.j, this.k, cursorLine, range);
            }
        }
        update(editor, commentInfos, cursorLine, range) {
            if (editor) {
                this.j = editor;
                this.k = commentInfos;
                this.q(editor, commentInfos, cursorLine, range);
            }
        }
        p(editor, lineRange) {
            return editor.getDecorationsInRange(lineRange)?.find(decoration => decoration.options.description === commentGlyphWidget_1.$8lb.description);
        }
        q(editor, commentInfos, emphasisLine = -1, selectionRange = this.m) {
            const model = editor.getModel();
            if (!model) {
                return;
            }
            // If there's still a selection, use that.
            emphasisLine = this.n ?? emphasisLine;
            const commentingRangeDecorations = [];
            for (const info of commentInfos) {
                info.commentingRanges.ranges.forEach(range => {
                    const rangeObject = new range_1.$ks(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn);
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
                            intersectingSelectionRange = new range_1.$ks(intersectingSelectionRange.startLineNumber + 1, 1, intersectingSelectionRange.endLineNumber, 1);
                        }
                        else {
                            intersectingEmphasisRange = new range_1.$ks(intersectingSelectionRange.endLineNumber, 1, intersectingSelectionRange.endLineNumber, 1);
                            intersectingSelectionRange = new range_1.$ks(intersectingSelectionRange.startLineNumber, 1, intersectingSelectionRange.endLineNumber - 1, 1);
                        }
                        commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.owner, info.extensionId, info.label, intersectingSelectionRange, this.f, info.commentingRanges, true));
                        if (!this.p(editor, intersectingEmphasisRange)) {
                            commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.owner, info.extensionId, info.label, intersectingEmphasisRange, this.d, info.commentingRanges, true));
                        }
                        const beforeRangeEndLine = Math.min(intersectingEmphasisRange.startLineNumber, intersectingSelectionRange.startLineNumber) - 1;
                        const hasBeforeRange = rangeObject.startLineNumber <= beforeRangeEndLine;
                        const afterRangeStartLine = Math.max(intersectingEmphasisRange.endLineNumber, intersectingSelectionRange.endLineNumber) + 1;
                        const hasAfterRange = rangeObject.endLineNumber >= afterRangeStartLine;
                        if (hasBeforeRange) {
                            const beforeRange = new range_1.$ks(range.startLineNumber, 1, beforeRangeEndLine, 1);
                            commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.owner, info.extensionId, info.label, beforeRange, this.c, info.commentingRanges, true));
                        }
                        if (hasAfterRange) {
                            const afterRange = new range_1.$ks(afterRangeStartLine, 1, range.endLineNumber, 1);
                            commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.owner, info.extensionId, info.label, afterRange, this.c, info.commentingRanges, true));
                        }
                    }
                    else if ((rangeObject.startLineNumber <= emphasisLine) && (emphasisLine <= rangeObject.endLineNumber)) {
                        if (rangeObject.startLineNumber < emphasisLine) {
                            const beforeRange = new range_1.$ks(range.startLineNumber, 1, emphasisLine - 1, 1);
                            commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.owner, info.extensionId, info.label, beforeRange, this.c, info.commentingRanges, true));
                        }
                        const emphasisRange = new range_1.$ks(emphasisLine, 1, emphasisLine, 1);
                        if (!this.p(editor, emphasisRange)) {
                            commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.owner, info.extensionId, info.label, emphasisRange, this.d, info.commentingRanges, true));
                        }
                        if (emphasisLine < rangeObject.endLineNumber) {
                            const afterRange = new range_1.$ks(emphasisLine + 1, 1, range.endLineNumber, 1);
                            commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.owner, info.extensionId, info.label, afterRange, this.c, info.commentingRanges, true));
                        }
                    }
                    else {
                        commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.owner, info.extensionId, info.label, range, this.c, info.commentingRanges));
                    }
                });
            }
            editor.changeDecorations((accessor) => {
                this.h = accessor.deltaDecorations(this.h, commentingRangeDecorations);
                commentingRangeDecorations.forEach((decoration, index) => decoration.id = this.h[index]);
            });
            const rangesDifference = this.g.length - commentingRangeDecorations.length;
            this.g = commentingRangeDecorations;
            if (rangesDifference) {
                this.o.fire(this.g.length);
            }
        }
        r(a, b) {
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
                const foundInfos = this.k?.filter(info => info.commentingRanges.fileComments);
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
            for (const decoration of this.g) {
                const range = decoration.getActiveRange();
                if (range && this.r(range, commentRange)) {
                    // We can have several commenting ranges that match from the same owner because of how
                    // the line hover and selection decoration is done.
                    // The ranges must be merged so that we can see if the new commentRange fits within them.
                    const action = decoration.getCommentAction();
                    const alreadyFoundInfo = foundHoverActions.get(action.ownerId);
                    if (alreadyFoundInfo?.action.commentingRangesInfo === action.commentingRangesInfo) {
                        // Merge ranges.
                        const newRange = new range_1.$ks(range.startLineNumber < alreadyFoundInfo.range.startLineNumber ? range.startLineNumber : alreadyFoundInfo.range.startLineNumber, range.startColumn < alreadyFoundInfo.range.startColumn ? range.startColumn : alreadyFoundInfo.range.startColumn, range.endLineNumber > alreadyFoundInfo.range.endLineNumber ? range.endLineNumber : alreadyFoundInfo.range.endLineNumber, range.endColumn > alreadyFoundInfo.range.endColumn ? range.endColumn : alreadyFoundInfo.range.endColumn);
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
                for (let i = this.g.length - 1; i >= 0; i--) {
                    decorations.push(this.g[i]);
                }
            }
            else {
                decorations = this.g;
            }
            for (const decoration of decorations) {
                const range = decoration.getActiveRange();
                if (!range) {
                    continue;
                }
                if (findPositionContainedWithin && this.r(range, findPositionContainedWithin)) {
                    findPositionContainedWithin = range_1.$ks.plusRange(findPositionContainedWithin, range);
                    continue;
                }
                if (range.startLineNumber <= findPosition.lineNumber && findPosition.lineNumber <= range.endLineNumber) {
                    findPositionContainedWithin = new range_1.$ks(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn);
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
            this.g = [];
        }
    }
    let $Lmb = class $Lmb {
        constructor(editor, y, z, A, B, C, D, E, contextKeyService, F) {
            this.y = y;
            this.z = z;
            this.A = A;
            this.B = B;
            this.C = C;
            this.D = D;
            this.E = E;
            this.F = F;
            this.c = new lifecycle_1.$jc();
            this.d = new lifecycle_1.$jc();
            this.l = null;
            this.m = false;
            this.p = [];
            this.u = [];
            this.x = false;
            this.h = [];
            this.g = [];
            this.s = {};
            this.t = {};
            this.n = null;
            this.v = commentContextKeys_1.CommentContextKeys.activeCursorHasCommentingRange.bindTo(contextKeyService);
            this.w = commentContextKeys_1.CommentContextKeys.activeEditorHasCommentingRange.bindTo(contextKeyService);
            if (editor instanceof embeddedCodeEditorWidget_1.$w3) {
                return;
            }
            this.f = editor;
            this.j = new CommentingRangeDecorator();
            this.c.add(this.j.onDidChangeDecorationsCount(count => {
                if (count === 0) {
                    this.H();
                }
                else if (this.u.length === 0) {
                    this.G();
                }
            }));
            this.c.add(this.k = new commentThreadRangeDecorator_1.$Jmb(this.y));
            this.c.add(this.y.onDidDeleteDataProvider(ownerId => {
                if (ownerId) {
                    delete this.s[ownerId];
                    delete this.t[ownerId];
                }
                else {
                    this.s = {};
                    this.t = {};
                }
                this.M();
            }));
            this.c.add(this.y.onDidSetDataProvider(_ => this.Q()));
            this.c.add(this.y.onDidUpdateCommentingRanges(_ => this.Q()));
            this.c.add(this.y.onDidSetResourceCommentInfos(e => {
                const editorURI = this.f && this.f.hasModel() && this.f.getModel().uri;
                if (editorURI && editorURI.toString() === e.resource.toString()) {
                    this.cb(e.commentInfos.filter(commentInfo => commentInfo !== null));
                }
            }));
            this.c.add(this.y.onDidChangeCommentingEnabled(e => {
                if (e) {
                    this.G();
                    this.M();
                }
                else {
                    this.bb();
                    this.H();
                    this.j.update(this.f, []);
                    this.k.update(this.f, []);
                    (0, lifecycle_1.$fc)(this.g);
                    this.g = [];
                }
            }));
            this.c.add(this.f.onDidChangeModel(_ => this.onModelChanged()));
            this.c.add(this.E.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('diffEditor.renderSideBySide')) {
                    this.M();
                }
            }));
            this.onModelChanged();
            this.A.registerDecorationType('comment-controller', commentReply_1.$tmb, {});
            this.y.registerContinueOnCommentProvider({
                provideContinueOnComments: () => {
                    const pendingComments = [];
                    if (this.g) {
                        for (const zone of this.g) {
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
        G() {
            this.u = [];
            if (!this.f) {
                return;
            }
            this.u.push(this.f.onMouseMove(e => this.I(e)));
            this.u.push(this.f.onDidChangeCursorPosition(e => this.K(e.position)));
            this.u.push(this.f.onDidFocusEditorWidget(() => this.K(this.f?.getPosition() ?? null)));
            this.u.push(this.f.onDidChangeCursorSelection(e => this.J(e)));
            this.u.push(this.f.onDidBlurEditorWidget(() => this.J()));
        }
        H() {
            (0, lifecycle_1.$fc)(this.u);
            this.u = [];
        }
        I(e) {
            const position = e.target.position?.lineNumber;
            if (e.event.leftButton.valueOf() && position && this.l) {
                this.j.updateSelection(position, new range_1.$ks(this.l.lineNumber, 1, position, 1));
            }
            else {
                this.j.updateHover(position);
            }
        }
        J(e) {
            const position = this.f?.getPosition()?.lineNumber;
            if (position) {
                this.j.updateSelection(position, e?.selection);
            }
        }
        K(e) {
            const decorations = e ? this.f?.getDecorationsInRange(range_1.$ks.fromPositions(e, { column: -1, lineNumber: e.lineNumber })) : undefined;
            let hasCommentingRange = false;
            if (decorations) {
                for (const decoration of decorations) {
                    if (decoration.options.description === commentGlyphWidget_1.$8lb.description) {
                        // We don't allow multiple comments on the same line.
                        hasCommentingRange = false;
                        break;
                    }
                    else if (decoration.options.description === CommentingRangeDecorator.description) {
                        hasCommentingRange = true;
                    }
                }
            }
            this.v.set(hasCommentingRange);
        }
        L(testEditor) {
            if (this.E.getValue('diffEditor.renderSideBySide')) {
                return false;
            }
            const foundEditor = this.F.visibleTextEditorControls.find(editor => {
                if (editor.getEditorType() === editorCommon_1.EditorType.IDiffEditor) {
                    const diffEditor = editor;
                    return diffEditor.getOriginalEditor() === testEditor;
                }
                return false;
            });
            return !!foundEditor;
        }
        M() {
            this.n = (0, async_1.$ug)(token => {
                const editorURI = this.f && this.f.hasModel() && this.f.getModel().uri;
                if (editorURI) {
                    return this.y.getDocumentComments(editorURI);
                }
                return Promise.resolve([]);
            });
            return this.n.then(commentInfos => {
                this.cb((0, arrays_1.$Fb)(commentInfos));
                this.n = null;
            }, error => console.log(error));
        }
        N() {
            if (this.r) {
                if (this.q) {
                    this.q.cancel();
                    this.q = null;
                }
                this.r.trigger(() => {
                    const editorURI = this.f && this.f.hasModel() && this.f.getModel().uri;
                    if (editorURI) {
                        return this.y.getDocumentComments(editorURI);
                    }
                    return Promise.resolve([]);
                }).then(commentInfos => {
                    if (this.y.isCommentingEnabled) {
                        const meaningfulCommentInfos = (0, arrays_1.$Fb)(commentInfos);
                        this.j.update(this.f, meaningfulCommentInfos, this.f?.getPosition()?.lineNumber, this.f?.getSelection() ?? undefined);
                    }
                }, (err) => {
                    (0, errors_1.$Y)(err);
                    return null;
                });
            }
        }
        static get(editor) {
            return editor.getContribution(exports.ID);
        }
        revealCommentThread(threadId, commentUniqueId, fetchOnceIfNotExist, focus) {
            const commentThreadWidget = this.g.filter(widget => widget.commentThread.threadId === threadId);
            if (commentThreadWidget.length === 1) {
                commentThreadWidget[0].reveal(commentUniqueId, focus);
            }
            else if (fetchOnceIfNotExist) {
                if (this.n) {
                    this.n.then(_ => {
                        this.revealCommentThread(threadId, commentUniqueId, false, focus);
                    });
                }
                else {
                    this.M().then(_ => {
                        this.revealCommentThread(threadId, commentUniqueId, false, focus);
                    });
                }
            }
        }
        collapseAll() {
            for (const widget of this.g) {
                widget.collapse();
            }
        }
        expandAll() {
            for (const widget of this.g) {
                widget.expand();
            }
        }
        expandUnresolved() {
            for (const widget of this.g) {
                if (widget.commentThread.state === languages.CommentThreadState.Unresolved) {
                    widget.expand();
                }
            }
        }
        nextCommentThread() {
            this.O();
        }
        O(reverse) {
            if (!this.g.length || !this.f?.hasModel()) {
                return;
            }
            const after = this.f.getSelection().getEndPosition();
            const sortedWidgets = this.g.sort((a, b) => {
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
            const idx = (0, arraysFind_1.$ib)(sortedWidgets, widget => {
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
            if (idx === this.g.length) {
                nextWidget = this.g[0];
            }
            else {
                nextWidget = sortedWidgets[idx];
            }
            this.f.setSelection(nextWidget.commentThread.range ?? new range_1.$ks(1, 1, 1, 1));
            nextWidget.reveal(undefined, true);
        }
        previousCommentThread() {
            this.O(true);
        }
        P(reverse) {
            if (!this.f?.hasModel()) {
                return;
            }
            const after = this.f.getSelection().getEndPosition();
            const range = this.j.getNearestCommentingRange(after, reverse);
            if (range) {
                const position = reverse ? range.getEndPosition() : range.getStartPosition();
                this.f.setPosition(position);
                this.f.revealLineInCenterIfOutsideViewport(position.lineNumber);
            }
        }
        nextCommentingRange() {
            this.P();
        }
        previousCommentingRange() {
            this.P(true);
        }
        dispose() {
            this.c.dispose();
            this.d.dispose();
            (0, lifecycle_1.$fc)(this.u);
            (0, lifecycle_1.$fc)(this.g);
            this.f = null; // Strict null override - nulling out in dispose
        }
        onModelChanged() {
            this.d.clear();
            this.db();
            if (!this.f) {
                return;
            }
            this.x = false;
            this.d.add(this.f.onMouseDown(e => this.T(e)));
            this.d.add(this.f.onMouseUp(e => this.U(e)));
            if (this.u.length) {
                this.H();
                this.G();
            }
            this.r = new async_1.$Dg(200);
            this.d.add({
                dispose: () => {
                    this.r?.cancel();
                    this.r = null;
                }
            });
            this.d.add(this.f.onDidChangeModelContent(async () => {
                this.N();
            }));
            this.d.add(this.y.onDidUpdateCommentThreads(async (e) => {
                const editorURI = this.f && this.f.hasModel() && this.f.getModel().uri;
                if (!editorURI || !this.y.isCommentingEnabled) {
                    return;
                }
                if (this.n) {
                    await this.n;
                }
                const commentInfo = this.h.filter(info => info.owner === e.owner);
                if (!commentInfo || !commentInfo.length) {
                    return;
                }
                const added = e.added.filter(thread => thread.resource && thread.resource === editorURI.toString());
                const removed = e.removed.filter(thread => thread.resource && thread.resource === editorURI.toString());
                const changed = e.changed.filter(thread => thread.resource && thread.resource === editorURI.toString());
                const pending = e.pending.filter(pending => pending.uri.toString() === editorURI.toString());
                removed.forEach(thread => {
                    const matchedZones = this.g.filter(zoneWidget => zoneWidget.owner === e.owner && zoneWidget.commentThread.threadId === thread.threadId && zoneWidget.commentThread.threadId !== '');
                    if (matchedZones.length) {
                        const matchedZone = matchedZones[0];
                        const index = this.g.indexOf(matchedZone);
                        this.g.splice(index, 1);
                        matchedZone.dispose();
                    }
                    const infosThreads = this.h.filter(info => info.owner === e.owner)[0].threads;
                    for (let i = 0; i < infosThreads.length; i++) {
                        if (infosThreads[i] === thread) {
                            infosThreads.splice(i, 1);
                            i--;
                        }
                    }
                });
                changed.forEach(thread => {
                    const matchedZones = this.g.filter(zoneWidget => zoneWidget.owner === e.owner && zoneWidget.commentThread.threadId === thread.threadId);
                    if (matchedZones.length) {
                        const matchedZone = matchedZones[0];
                        matchedZone.update(thread);
                        this.R(thread);
                    }
                });
                added.forEach(thread => {
                    const matchedZones = this.g.filter(zoneWidget => zoneWidget.owner === e.owner && zoneWidget.commentThread.threadId === thread.threadId);
                    if (matchedZones.length) {
                        return;
                    }
                    const matchedNewCommentThreadZones = this.g.filter(zoneWidget => zoneWidget.owner === e.owner && zoneWidget.commentThread.commentThreadHandle === -1 && range_1.$ks.equalsRange(zoneWidget.commentThread.range, thread.range));
                    if (matchedNewCommentThreadZones.length) {
                        matchedNewCommentThreadZones[0].update(thread);
                        return;
                    }
                    const continueOnCommentText = (thread.range ? this.y.removeContinueOnComment({ owner: e.owner, uri: editorURI, range: thread.range })?.body : undefined);
                    const pendingCommentText = (this.s[e.owner] && this.s[e.owner][thread.threadId])
                        ?? continueOnCommentText;
                    const pendingEdits = this.t[e.owner] && this.t[e.owner][thread.threadId];
                    this.S(e.owner, thread, pendingCommentText, pendingEdits);
                    this.h.filter(info => info.owner === e.owner)[0].threads.push(thread);
                    this.bb();
                });
                pending.forEach(thread => {
                    this.y.createCommentThreadTemplate(thread.owner, thread.uri, range_1.$ks.lift(thread.range));
                });
                this.k.update(this.f, commentInfo);
            }));
            this.Q();
        }
        Q() {
            this.M().then(() => {
                if (!this.x) {
                    if (this.h.some(commentInfo => commentInfo.commentingRanges.ranges.length > 0 || commentInfo.commentingRanges.fileComments)) {
                        this.x = true;
                        this.w.set(true);
                        (0, aria_1.$_P)(nls.localize(0, null));
                    }
                    else {
                        this.w.set(false);
                    }
                }
            });
        }
        async R(thread) {
            if (thread.comments && (thread.comments.length > 0)) {
                const openViewState = this.E.getValue(commentsConfiguration_1.$Hlb).openView;
                if (openViewState === 'file') {
                    return this.D.openView(commentsTreeViewer_1.$Wlb);
                }
                else if (openViewState === 'firstFile' || (openViewState === 'firstFileUnresolved' && thread.state === languages.CommentThreadState.Unresolved)) {
                    const hasShownView = this.D.getViewWithId(commentsTreeViewer_1.$Wlb)?.hasRendered;
                    if (!hasShownView) {
                        return this.D.openView(commentsTreeViewer_1.$Wlb);
                    }
                }
            }
            return undefined;
        }
        S(owner, thread, pendingComment, pendingEdits) {
            if (!this.f?.getModel()) {
                return;
            }
            if (this.L(this.f)) {
                return;
            }
            const zoneWidget = this.z.createInstance(commentThreadZoneWidget_1.$Imb, this.f, owner, thread, pendingComment, pendingEdits);
            zoneWidget.display(thread.range);
            this.g.push(zoneWidget);
            this.R(thread);
        }
        T(e) {
            this.l = (0, commentThreadZoneWidget_1.$Fmb)(e);
        }
        U(e) {
            const matchedLineNumber = (0, commentThreadZoneWidget_1.$Gmb)(this.l, e);
            this.l = null;
            if (!this.f || matchedLineNumber === null || !e.target.element) {
                return;
            }
            const mouseUpIsOnDecorator = (e.target.element.className.indexOf('comment-range-glyph') >= 0);
            const lineNumber = e.target.position.lineNumber;
            let range;
            let selection;
            // Check for drag along gutter decoration
            if ((matchedLineNumber !== lineNumber)) {
                if (matchedLineNumber > lineNumber) {
                    selection = new range_1.$ks(matchedLineNumber, this.f.getModel().getLineLength(matchedLineNumber) + 1, lineNumber, 1);
                }
                else {
                    selection = new range_1.$ks(matchedLineNumber, 1, lineNumber, this.f.getModel().getLineLength(lineNumber) + 1);
                }
            }
            else if (mouseUpIsOnDecorator) {
                selection = this.f.getSelection();
            }
            // Check for selection at line number.
            if (selection && (selection.startLineNumber <= lineNumber) && (lineNumber <= selection.endLineNumber)) {
                range = selection;
                this.f.setSelection(new range_1.$ks(selection.endLineNumber, 1, selection.endLineNumber, 1));
            }
            else if (mouseUpIsOnDecorator) {
                range = new range_1.$ks(lineNumber, 1, lineNumber, 1);
            }
            if (range) {
                this.addOrToggleCommentAtLine(range, e);
            }
        }
        async addOrToggleCommentAtLine(commentRange, e) {
            // If an add is already in progress, queue the next add and process it after the current one finishes to
            // prevent empty comment threads from being added to the same line.
            if (!this.o) {
                this.o = true;
                // The widget's position is undefined until the widget has been displayed, so rely on the glyph position instead
                const existingCommentsAtLine = this.g.filter(widget => widget.getGlyphPosition() === (commentRange ? commentRange.endLineNumber : 0));
                if (existingCommentsAtLine.length) {
                    const allExpanded = existingCommentsAtLine.every(widget => widget.expanded);
                    existingCommentsAtLine.forEach(allExpanded ? widget => widget.collapse() : widget => widget.expand());
                    this.V();
                    return;
                }
                else {
                    this.addCommentAtLine(commentRange, e);
                }
            }
            else {
                this.p.push([commentRange, e]);
            }
        }
        V() {
            this.o = false;
            const info = this.p.shift();
            if (info) {
                this.addOrToggleCommentAtLine(info[0], info[1]);
            }
        }
        addCommentAtLine(range, e) {
            const newCommentInfos = this.j.getMatchedCommentAction(range);
            if (!newCommentInfos.length || !this.f?.hasModel()) {
                this.o = false;
                if (!newCommentInfos.length) {
                    throw new Error('There are no commenting ranges at the current position.');
                }
                return Promise.resolve();
            }
            if (newCommentInfos.length > 1) {
                if (e && range) {
                    this.B.showContextMenu({
                        getAnchor: () => e.event,
                        getActions: () => this.X(newCommentInfos, range),
                        getActionsContext: () => newCommentInfos.length ? newCommentInfos[0] : undefined,
                        onHide: () => { this.o = false; }
                    });
                    return Promise.resolve();
                }
                else {
                    const picks = this.W(newCommentInfos);
                    return this.C.pick(picks, { placeHolder: nls.localize(1, null), matchOnDescription: true }).then(pick => {
                        if (!pick) {
                            return;
                        }
                        const commentInfos = newCommentInfos.filter(info => info.ownerId === pick.id);
                        if (commentInfos.length) {
                            const { ownerId } = commentInfos[0];
                            this.addCommentAtLine2(range, ownerId);
                        }
                    }).then(() => {
                        this.o = false;
                    });
                }
            }
            else {
                const { ownerId } = newCommentInfos[0];
                this.addCommentAtLine2(range, ownerId);
            }
            return Promise.resolve();
        }
        W(commentInfos) {
            const picks = commentInfos.map((commentInfo) => {
                const { ownerId, extensionId, label } = commentInfo;
                return {
                    label: label || extensionId,
                    id: ownerId
                };
            });
            return picks;
        }
        X(commentInfos, commentRange) {
            const actions = [];
            commentInfos.forEach(commentInfo => {
                const { ownerId, extensionId, label } = commentInfo;
                actions.push(new actions_1.$gi('addCommentThread', `${label || extensionId}`, undefined, true, () => {
                    this.addCommentAtLine2(commentRange, ownerId);
                    return Promise.resolve();
                }));
            });
            return actions;
        }
        addCommentAtLine2(range, ownerId) {
            if (!this.f) {
                return;
            }
            this.y.createCommentThreadTemplate(ownerId, this.f.getModel().uri, range);
            this.V();
            return;
        }
        Y(editor) {
            const lineDecorationsWidth = editor.getOption(65 /* EditorOption.lineDecorationsWidth */);
            let extraEditorClassName = [];
            const configuredExtraClassName = editor.getRawOptions().extraEditorClassName;
            if (configuredExtraClassName) {
                extraEditorClassName = configuredExtraClassName.split(' ');
            }
            return { lineDecorationsWidth, extraEditorClassName };
        }
        Z(editor, extraEditorClassName, startingLineDecorationsWidth) {
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
        $(editor, extraEditorClassName, startingLineDecorationsWidth) {
            let lineDecorationsWidth = startingLineDecorationsWidth;
            const options = editor.getOptions();
            if (options.get(43 /* EditorOption.folding */) && options.get(109 /* EditorOption.showFoldingControls */) !== 'never') {
                lineDecorationsWidth -= 11;
            }
            lineDecorationsWidth += 24;
            extraEditorClassName.push('inline-comment');
            return { lineDecorationsWidth, extraEditorClassName };
        }
        ab(editor, extraEditorClassName, lineDecorationsWidth) {
            editor.updateOptions({
                extraEditorClassName: extraEditorClassName.join(' '),
                lineDecorationsWidth: lineDecorationsWidth
            });
        }
        bb() {
            if (!this.f) {
                return;
            }
            const hasCommentsOrRanges = this.h.some(info => {
                const hasRanges = Boolean(info.commentingRanges && (Array.isArray(info.commentingRanges) ? info.commentingRanges : info.commentingRanges.ranges).length);
                return hasRanges || (info.threads.length > 0);
            });
            if (hasCommentsOrRanges && !this.m && this.y.isCommentingEnabled) {
                this.m = true;
                const { lineDecorationsWidth, extraEditorClassName } = this.Y(this.f);
                const newOptions = this.$(this.f, extraEditorClassName, lineDecorationsWidth);
                this.ab(this.f, newOptions.extraEditorClassName, newOptions.lineDecorationsWidth);
            }
            else if ((!hasCommentsOrRanges || !this.y.isCommentingEnabled) && this.m) {
                this.m = false;
                const { lineDecorationsWidth, extraEditorClassName } = this.Y(this.f);
                const newOptions = this.Z(this.f, extraEditorClassName, lineDecorationsWidth);
                this.ab(this.f, newOptions.extraEditorClassName, newOptions.lineDecorationsWidth);
            }
        }
        cb(commentInfos) {
            if (!this.f || !this.y.isCommentingEnabled) {
                return;
            }
            this.h = commentInfos;
            this.bb();
            // create viewzones
            this.db();
            this.h.forEach(info => {
                const providerCacheStore = this.s[info.owner];
                const providerEditsCacheStore = this.t[info.owner];
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
                    this.S(info.owner, thread, pendingComment, pendingEdits);
                });
                info.pendingCommentThreads?.forEach(thread => {
                    this.y.createCommentThreadTemplate(thread.owner, thread.uri, range_1.$ks.lift(thread.range));
                });
            });
            this.j.update(this.f, this.h);
            this.k.update(this.f, this.h);
        }
        closeWidget() {
            this.g?.forEach(widget => widget.hide());
            if (this.f) {
                this.f.focus();
                this.f.revealRangeInCenter(this.f.getSelection());
            }
        }
        db() {
            if (this.g) {
                this.g.forEach(zone => {
                    const pendingComments = zone.getPendingComments();
                    const pendingNewComment = pendingComments.newComment;
                    const providerNewCommentCacheStore = this.s[zone.owner];
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
                            this.s[zone.owner] = {};
                        }
                        this.s[zone.owner][zone.commentThread.threadId] = pendingNewComment;
                    }
                    else {
                        if (providerNewCommentCacheStore) {
                            delete providerNewCommentCacheStore[zone.commentThread.threadId];
                        }
                    }
                    const pendingEdits = pendingComments.edits;
                    const providerEditsCacheStore = this.t[zone.owner];
                    if (Object.keys(pendingEdits).length > 0) {
                        if (!providerEditsCacheStore) {
                            this.t[zone.owner] = {};
                        }
                        this.t[zone.owner][zone.commentThread.threadId] = pendingEdits;
                    }
                    else if (providerEditsCacheStore) {
                        delete providerEditsCacheStore[zone.commentThread.threadId];
                    }
                    zone.dispose();
                });
            }
            this.g = [];
        }
    };
    exports.$Lmb = $Lmb;
    exports.$Lmb = $Lmb = __decorate([
        __param(1, commentService_1.$Ilb),
        __param(2, instantiation_1.$Ah),
        __param(3, codeEditorService_1.$nV),
        __param(4, contextView_1.$WZ),
        __param(5, quickInput_1.$Gq),
        __param(6, views_1.$$E),
        __param(7, configuration_1.$8h),
        __param(8, contextkey_1.$3i),
        __param(9, editorService_1.$9C)
    ], $Lmb);
});
//# sourceMappingURL=commentsController.js.map