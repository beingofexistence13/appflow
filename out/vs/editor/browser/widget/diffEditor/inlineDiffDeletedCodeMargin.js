/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/actions", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/themables", "vs/nls"], function (require, exports, dom_1, actions_1, codicons_1, lifecycle_1, platform_1, themables_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlineDiffDeletedCodeMargin = void 0;
    class InlineDiffDeletedCodeMargin extends lifecycle_1.Disposable {
        get visibility() {
            return this._visibility;
        }
        set visibility(_visibility) {
            if (this._visibility !== _visibility) {
                this._visibility = _visibility;
                this._diffActions.style.visibility = _visibility ? 'visible' : 'hidden';
            }
        }
        constructor(_getViewZoneId, _marginDomNode, _modifiedEditor, _diff, _editor, _viewLineCounts, _originalTextModel, _contextMenuService, _clipboardService) {
            super();
            this._getViewZoneId = _getViewZoneId;
            this._marginDomNode = _marginDomNode;
            this._modifiedEditor = _modifiedEditor;
            this._diff = _diff;
            this._editor = _editor;
            this._viewLineCounts = _viewLineCounts;
            this._originalTextModel = _originalTextModel;
            this._contextMenuService = _contextMenuService;
            this._clipboardService = _clipboardService;
            this._visibility = false;
            // make sure the diff margin shows above overlay.
            this._marginDomNode.style.zIndex = '10';
            this._diffActions = document.createElement('div');
            this._diffActions.className = themables_1.ThemeIcon.asClassName(codicons_1.Codicon.lightBulb) + ' lightbulb-glyph';
            this._diffActions.style.position = 'absolute';
            const lineHeight = this._modifiedEditor.getOption(66 /* EditorOption.lineHeight */);
            this._diffActions.style.right = '0px';
            this._diffActions.style.visibility = 'hidden';
            this._diffActions.style.height = `${lineHeight}px`;
            this._diffActions.style.lineHeight = `${lineHeight}px`;
            this._marginDomNode.appendChild(this._diffActions);
            let currentLineNumberOffset = 0;
            const useShadowDOM = _modifiedEditor.getOption(126 /* EditorOption.useShadowDOM */) && !platform_1.isIOS; // Do not use shadow dom on IOS #122035
            const showContextMenu = (x, y) => {
                this._contextMenuService.showContextMenu({
                    domForShadowRoot: useShadowDOM ? _modifiedEditor.getDomNode() ?? undefined : undefined,
                    getAnchor: () => ({ x, y }),
                    getActions: () => {
                        const actions = [];
                        const isDeletion = _diff.modified.isEmpty;
                        // default action
                        actions.push(new actions_1.Action('diff.clipboard.copyDeletedContent', isDeletion
                            ? (_diff.original.length > 1
                                ? (0, nls_1.localize)('diff.clipboard.copyDeletedLinesContent.label', "Copy deleted lines")
                                : (0, nls_1.localize)('diff.clipboard.copyDeletedLinesContent.single.label', "Copy deleted line"))
                            : (_diff.original.length > 1
                                ? (0, nls_1.localize)('diff.clipboard.copyChangedLinesContent.label', "Copy changed lines")
                                : (0, nls_1.localize)('diff.clipboard.copyChangedLinesContent.single.label', "Copy changed line")), undefined, true, async () => {
                            const originalText = this._originalTextModel.getValueInRange(_diff.original.toExclusiveRange());
                            await this._clipboardService.writeText(originalText);
                        }));
                        if (_diff.original.length > 1) {
                            actions.push(new actions_1.Action('diff.clipboard.copyDeletedLineContent', isDeletion
                                ? (0, nls_1.localize)('diff.clipboard.copyDeletedLineContent.label', "Copy deleted line ({0})", _diff.original.startLineNumber + currentLineNumberOffset)
                                : (0, nls_1.localize)('diff.clipboard.copyChangedLineContent.label', "Copy changed line ({0})", _diff.original.startLineNumber + currentLineNumberOffset), undefined, true, async () => {
                                let lineContent = this._originalTextModel.getLineContent(_diff.original.startLineNumber + currentLineNumberOffset);
                                if (lineContent === '') {
                                    // empty line -> new line
                                    const eof = this._originalTextModel.getEndOfLineSequence();
                                    lineContent = eof === 0 /* EndOfLineSequence.LF */ ? '\n' : '\r\n';
                                }
                                await this._clipboardService.writeText(lineContent);
                            }));
                        }
                        const readOnly = _modifiedEditor.getOption(90 /* EditorOption.readOnly */);
                        if (!readOnly) {
                            actions.push(new actions_1.Action('diff.inline.revertChange', (0, nls_1.localize)('diff.inline.revertChange.label', "Revert this change"), undefined, true, async () => {
                                this._editor.revert(this._diff);
                            }));
                        }
                        return actions;
                    },
                    autoSelectFirstItem: true
                });
            };
            this._register((0, dom_1.addStandardDisposableListener)(this._diffActions, 'mousedown', e => {
                const { top, height } = (0, dom_1.getDomNodePagePosition)(this._diffActions);
                const pad = Math.floor(lineHeight / 3);
                e.preventDefault();
                showContextMenu(e.posx, top + height + pad);
            }));
            this._register(_modifiedEditor.onMouseMove((e) => {
                if ((e.target.type === 8 /* MouseTargetType.CONTENT_VIEW_ZONE */ || e.target.type === 5 /* MouseTargetType.GUTTER_VIEW_ZONE */) && e.target.detail.viewZoneId === this._getViewZoneId()) {
                    currentLineNumberOffset = this._updateLightBulbPosition(this._marginDomNode, e.event.browserEvent.y, lineHeight);
                    this.visibility = true;
                }
                else {
                    this.visibility = false;
                }
            }));
            this._register(_modifiedEditor.onMouseDown((e) => {
                if (!e.event.rightButton) {
                    return;
                }
                if (e.target.type === 8 /* MouseTargetType.CONTENT_VIEW_ZONE */ || e.target.type === 5 /* MouseTargetType.GUTTER_VIEW_ZONE */) {
                    const viewZoneId = e.target.detail.viewZoneId;
                    if (viewZoneId === this._getViewZoneId()) {
                        e.event.preventDefault();
                        currentLineNumberOffset = this._updateLightBulbPosition(this._marginDomNode, e.event.browserEvent.y, lineHeight);
                        showContextMenu(e.event.posx, e.event.posy + lineHeight);
                    }
                }
            }));
        }
        _updateLightBulbPosition(marginDomNode, y, lineHeight) {
            const { top } = (0, dom_1.getDomNodePagePosition)(marginDomNode);
            const offset = y - top;
            const lineNumberOffset = Math.floor(offset / lineHeight);
            const newTop = lineNumberOffset * lineHeight;
            this._diffActions.style.top = `${newTop}px`;
            if (this._viewLineCounts) {
                let acc = 0;
                for (let i = 0; i < this._viewLineCounts.length; i++) {
                    acc += this._viewLineCounts[i];
                    if (lineNumberOffset < acc) {
                        return i;
                    }
                }
            }
            return lineNumberOffset;
        }
    }
    exports.InlineDiffDeletedCodeMargin = InlineDiffDeletedCodeMargin;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lRGlmZkRlbGV0ZWRDb2RlTWFyZ2luLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2Jyb3dzZXIvd2lkZ2V0L2RpZmZFZGl0b3IvaW5saW5lRGlmZkRlbGV0ZWRDb2RlTWFyZ2luLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWtCaEcsTUFBYSwyQkFBNEIsU0FBUSxzQkFBVTtRQUsxRCxJQUFJLFVBQVU7WUFDYixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDekIsQ0FBQztRQUVELElBQUksVUFBVSxDQUFDLFdBQW9CO1lBQ2xDLElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxXQUFXLEVBQUU7Z0JBQ3JDLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO2dCQUMvQixJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQzthQUN4RTtRQUNGLENBQUM7UUFFRCxZQUNrQixjQUE0QixFQUM1QixjQUEyQixFQUMzQixlQUFpQyxFQUNqQyxLQUErQixFQUMvQixPQUF5QixFQUN6QixlQUF5QixFQUN6QixrQkFBOEIsRUFDOUIsbUJBQXdDLEVBQ3hDLGlCQUFvQztZQUVyRCxLQUFLLEVBQUUsQ0FBQztZQVZTLG1CQUFjLEdBQWQsY0FBYyxDQUFjO1lBQzVCLG1CQUFjLEdBQWQsY0FBYyxDQUFhO1lBQzNCLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQUNqQyxVQUFLLEdBQUwsS0FBSyxDQUEwQjtZQUMvQixZQUFPLEdBQVAsT0FBTyxDQUFrQjtZQUN6QixvQkFBZSxHQUFmLGVBQWUsQ0FBVTtZQUN6Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQVk7WUFDOUIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtZQUN4QyxzQkFBaUIs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