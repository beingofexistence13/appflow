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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/base/common/types", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/editor/common/core/range", "vs/editor/contrib/zoneWidget/browser/zoneWidget", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/colorRegistry", "vs/editor/common/core/editorColorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/editor/common/core/lineRange", "vs/editor/common/diff/rangeMapping", "vs/editor/common/core/position", "vs/editor/browser/editorExtensions", "vs/platform/log/common/log", "vs/workbench/contrib/inlineChat/browser/utils", "vs/workbench/browser/labels", "vs/platform/files/common/files", "vs/editor/common/services/model", "vs/editor/common/core/editOperation", "vs/editor/common/languages/language", "vs/editor/contrib/folding/browser/folding", "vs/editor/contrib/wordHighlighter/browser/wordHighlighter", "vs/platform/accessibility/common/accessibility"], function (require, exports, dom_1, lifecycle_1, types_1, embeddedCodeEditorWidget_1, range_1, zoneWidget_1, instantiation_1, colorRegistry, editorColorRegistry, themeService_1, inlineChat_1, lineRange_1, rangeMapping_1, position_1, editorExtensions_1, log_1, utils_1, labels_1, files_1, model_1, editOperation_1, language_1, folding_1, wordHighlighter_1, accessibility_1) {
    "use strict";
    var $fqb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$gqb = exports.$fqb = void 0;
    let $fqb = class $fqb extends zoneWidget_1.$z3 {
        static { $fqb_1 = this; }
        static { this.a = 'overlayDiff'; }
        constructor(editor, t, instantiationService, themeService, v, J) {
            super(editor, { showArrow: false, showFrame: false, isResizeable: false, isAccessible: true, allowUnlimitedHeight: true, showInHiddenAreas: true, ordinal: 10000 + 1 });
            this.t = t;
            this.v = v;
            this.J = J;
            this.b = (0, dom_1.h)('div.inline-chat-diff-widget@domNode');
            this.d = this.o.add(new lifecycle_1.$jc());
            this.r = false;
            this.s = false;
            super.create();
            (0, types_1.$tf)(editor.hasModel());
            const diffContributions = editorExtensions_1.EditorExtensionsRegistry
                .getEditorContributions()
                .filter(c => c.id !== inlineChat_1.$ez && c.id !== folding_1.$z8.ID);
            this.l = instantiationService.createInstance(embeddedCodeEditorWidget_1.$x3, this.b.domNode, {
                scrollbar: { useShadows: false, alwaysConsumeMouseWheel: false },
                scrollBeyondLastLine: false,
                renderMarginRevertIcon: true,
                renderOverviewRuler: false,
                rulers: undefined,
                overviewRulerBorder: undefined,
                overviewRulerLanes: 0,
                diffAlgorithm: 'advanced',
                splitViewDefaultRatio: 0.35,
                padding: { top: 0, bottom: 0 },
                folding: false,
                diffCodeLens: false,
                stickyScroll: { enabled: false },
                minimap: { enabled: false },
                isInEmbeddedEditor: true,
                overflowWidgetsDomNode: editor.getOverflowWidgetsDomNode(),
                onlyShowAccessibleDiffViewer: this.J.isScreenReaderOptimized(),
            }, {
                originalEditor: { contributions: diffContributions },
                modifiedEditor: { contributions: diffContributions }
            }, editor);
            this.o.add(this.l);
            this.l.setModel({ original: this.t.textModel0, modified: editor.getModel() });
            this.l.updateOptions({
                lineDecorationsWidth: editor.getLayoutInfo().decorationsWidth
            });
            const highlighter = wordHighlighter_1.$f$.get(editor);
            if (highlighter) {
                this.o.add(highlighter.linkWordHighlighters(this.l.getModifiedEditor()));
            }
            const doStyle = () => {
                const theme = themeService.getColorTheme();
                const overrides = [
                    [colorRegistry.$ww, inlineChat_1.$Mz],
                    [editorColorRegistry.$lB, inlineChat_1.$Mz],
                    [colorRegistry.$hx, inlineChat_1.$Rz],
                    [colorRegistry.$fx, inlineChat_1.$Rz],
                    [colorRegistry.$ix, inlineChat_1.$Sz],
                    [colorRegistry.$gx, inlineChat_1.$Sz],
                ];
                for (const [target, source] of overrides) {
                    const value = theme.getColor(source);
                    if (value) {
                        this.b.domNode.style.setProperty(colorRegistry.$ov(target), String(value));
                    }
                }
            };
            doStyle();
            this.o.add(themeService.onDidColorThemeChange(doStyle));
        }
        E(container) {
            container.appendChild(this.b.domNode);
        }
        // --- show / hide --------------------
        get isVisible() {
            return this.r;
        }
        hide() {
            this.N();
            this.d.clear();
            super.hide();
            this.r = false;
        }
        show() {
            (0, types_1.$tf)(this.editor.hasModel());
            this.d.clear();
            this.s = false;
            this.r = true;
            this.d.add(this.l.onDidUpdateDiff(() => {
                const result = this.l.getDiffComputationResult();
                const hasFocus = this.l.hasTextFocus();
                this.L(this.t.wholeRange.value, result?.changes2 ?? []);
                // TODO@jrieken find a better fix for this. this is the challenge:
                // the _doShowForChanges method invokes show of the zone widget which removes and adds the
                // zone and overlay parts. this dettaches and reattaches the dom nodes which means they lose
                // focus
                if (hasFocus) {
                    this.l.focus();
                }
            }));
            this.L(this.t.wholeRange.value, this.t.lastTextModelChanges);
        }
        lockToDiff() {
            this.s = true;
        }
        L(range, changes) {
            (0, types_1.$tf)(this.editor.hasModel());
            if (this.s) {
                return;
            }
            if (changes.length === 0 || this.t.textModel0.getValueLength() === 0) {
                // no change or changes to an empty file
                this.v.debug('[IE] livePreview-mode: no diff');
                this.N();
            }
            else {
                // complex changes
                this.v.debug('[IE] livePreview-mode: full diff');
                this.M(changes, range);
            }
        }
        // --- full diff
        M(changes, range) {
            const modified = this.editor.getModel();
            const ranges = this.O(modified, range, changes);
            this.P(this.editor, [ranges.modifiedHidden]);
            this.P(this.l.getOriginalEditor(), ranges.originalDiffHidden);
            this.P(this.l.getModifiedEditor(), ranges.modifiedDiffHidden);
            this.l.revealLine(ranges.modifiedHidden.startLineNumber, 1 /* ScrollType.Immediate */);
            const lineCountModified = ranges.modifiedHidden.length;
            const lineCountOriginal = ranges.originalHidden.length;
            const lineHeightDiff = Math.max(lineCountModified, lineCountOriginal);
            const lineHeightPadding = (this.editor.getOption(66 /* EditorOption.lineHeight */) / 12) /* padding-top/bottom*/;
            const heightInLines = lineHeightDiff + lineHeightPadding;
            super.show(ranges.anchor, heightInLines);
            this.v.debug(`[IE] diff SHOWING at ${ranges.anchor} with ${heightInLines} lines height`);
        }
        N() {
            this.editor.setHiddenAreas([], $fqb_1.a);
            this.l.getOriginalEditor().setHiddenAreas([], $fqb_1.a);
            this.l.getModifiedEditor().setHiddenAreas([], $fqb_1.a);
            super.hide();
        }
        O(model, range, changes) {
            if (changes.length === 0) {
                changes = [new rangeMapping_1.$ws(lineRange_1.$ts.fromRange(range), lineRange_1.$ts.fromRange(range), undefined)];
            }
            let originalLineRange = changes[0].original;
            let modifiedLineRange = changes[0].modified;
            for (let i = 1; i < changes.length; i++) {
                originalLineRange = originalLineRange.join(changes[i].original);
                modifiedLineRange = modifiedLineRange.join(changes[i].modified);
            }
            const startDelta = modifiedLineRange.startLineNumber - range.startLineNumber;
            if (startDelta > 0) {
                modifiedLineRange = new lineRange_1.$ts(modifiedLineRange.startLineNumber - startDelta, modifiedLineRange.endLineNumberExclusive);
                originalLineRange = new lineRange_1.$ts(originalLineRange.startLineNumber - startDelta, originalLineRange.endLineNumberExclusive);
            }
            const endDelta = range.endLineNumber - (modifiedLineRange.endLineNumberExclusive - 1);
            if (endDelta > 0) {
                modifiedLineRange = new lineRange_1.$ts(modifiedLineRange.startLineNumber, modifiedLineRange.endLineNumberExclusive + endDelta);
                originalLineRange = new lineRange_1.$ts(originalLineRange.startLineNumber, originalLineRange.endLineNumberExclusive + endDelta);
            }
            const originalDiffHidden = (0, utils_1.$dqb)(originalLineRange, this.t.textModel0);
            const modifiedDiffHidden = (0, utils_1.$dqb)(modifiedLineRange, model);
            return {
                originalHidden: originalLineRange,
                originalDiffHidden,
                modifiedHidden: modifiedLineRange,
                modifiedDiffHidden,
                anchor: new position_1.$js(modifiedLineRange.endLineNumberExclusive - 1, Number.MAX_SAFE_INTEGER)
            };
        }
        P(editor, lineRanges) {
            (0, types_1.$tf)(editor.hasModel());
            lineRanges = lineRanges.filter(range => !range.isEmpty);
            if (lineRanges.length === 0) {
                // todo?
                this.v.debug(`[IE] diff NOTHING to hide for ${editor.getId()} with ${String(editor.getModel()?.uri)}`);
                return;
            }
            let hiddenRanges;
            const hiddenLinesCount = lineRanges.reduce((p, c) => p + c.length, 0); // assumes no overlap
            if (hiddenLinesCount >= editor.getModel().getLineCount()) {
                // TODO: not every line can be hidden, keep the first line around
                hiddenRanges = [editor.getModel().getFullModelRange().delta(1)];
            }
            else {
                hiddenRanges = lineRanges.map(utils_1.$eqb);
            }
            editor.setHiddenAreas(hiddenRanges, $fqb_1.a);
            this.v.debug(`[IE] diff HIDING ${hiddenRanges} for ${editor.getId()} with ${String(editor.getModel()?.uri)}`);
        }
        C(range, isLastLine) {
            // ignore
        }
        // --- layout -------------------------
        F(widthInPixel) {
            if (this.m) {
                this.G(this.m.height, widthInPixel);
            }
        }
        G(heightInPixel, widthInPixel) {
            const newDim = new dom_1.$BO(widthInPixel, heightInPixel);
            if (!dom_1.$BO.equals(this.m, newDim)) {
                this.m = newDim;
                this.l.layout(this.m.with(undefined, this.m.height - 12 /* padding */));
                this.v.debug('[IE] diff LAYOUT', this.m);
            }
        }
    };
    exports.$fqb = $fqb;
    exports.$fqb = $fqb = $fqb_1 = __decorate([
        __param(2, instantiation_1.$Ah),
        __param(3, themeService_1.$gv),
        __param(4, log_1.$5i),
        __param(5, accessibility_1.$1r)
    ], $fqb);
    let $gqb = class $gqb extends zoneWidget_1.$z3 {
        constructor(parentEditor, instaService, r, s, themeService) {
            super(parentEditor, { showArrow: false, showFrame: false, isResizeable: false, isAccessible: true, showInHiddenAreas: true, ordinal: 10000 + 2 });
            this.r = r;
            this.s = s;
            this.a = (0, dom_1.h)('div.inline-chat-newfile-widget@domNode', [
                (0, dom_1.h)('div.title@title', [
                    (0, dom_1.h)('span.name.show-file-icons@name'),
                    (0, dom_1.h)('span.detail@detail'),
                ]),
                (0, dom_1.h)('div.editor@editor'),
            ]);
            this.l = new lifecycle_1.$lc();
            super.create();
            this.b = instaService.createInstance(labels_1.$Mlb, this.a.name, { supportIcons: true });
            const contributions = editorExtensions_1.EditorExtensionsRegistry
                .getEditorContributions()
                .filter(c => c.id !== inlineChat_1.$ez);
            this.d = instaService.createInstance(embeddedCodeEditorWidget_1.$w3, this.a.editor, {
                scrollBeyondLastLine: false,
                stickyScroll: { enabled: false },
                readOnly: true,
                minimap: { enabled: false },
                scrollbar: { alwaysConsumeMouseWheel: false, useShadows: true },
            }, { isSimpleWidget: true, contributions }, parentEditor);
            const doStyle = () => {
                const theme = themeService.getColorTheme();
                const overrides = [
                    [colorRegistry.$ww, inlineChat_1.$Mz],
                    [editorColorRegistry.$lB, inlineChat_1.$Mz],
                ];
                for (const [target, source] of overrides) {
                    const value = theme.getColor(source);
                    if (value) {
                        this.a.domNode.style.setProperty(colorRegistry.$ov(target), String(value));
                    }
                }
            };
            doStyle();
            this.o.add(themeService.onDidColorThemeChange(doStyle));
        }
        dispose() {
            this.b.dispose();
            this.d.dispose();
            this.l.dispose();
            super.dispose();
        }
        E(container) {
            container.appendChild(this.a.domNode);
        }
        show() {
            throw new Error('Use showFileCreation');
        }
        showCreation(where, uri, edits) {
            this.b.element.setFile(uri, { fileKind: files_1.FileKind.FILE });
            const langSelection = this.r.createByFilepathOrFirstLine(uri, undefined);
            const model = this.s.createModel('', langSelection, undefined, true);
            model.applyEdits(edits.map(edit => editOperation_1.$ls.replace(range_1.$ks.lift(edit.range), edit.text)));
            this.l.value = model;
            this.d.setModel(model);
            const lineHeight = this.editor.getOption(66 /* EditorOption.lineHeight */);
            this.a.title.style.height = `${lineHeight}px`;
            const maxLines = Math.max(4, Math.floor((this.editor.getLayoutInfo().height / lineHeight) / .33));
            const lines = Math.min(maxLines, model.getLineCount());
            const lineHeightPadding = (lineHeight / 12) /* padding-top/bottom*/;
            super.show(where, lines + 1 + lineHeightPadding);
        }
        // --- layout
        C(range, isLastLine) {
            // ignore
        }
        F(widthInPixel) {
            if (this.m) {
                this.G(this.m.height, widthInPixel);
            }
        }
        G(heightInPixel, widthInPixel) {
            const { lineNumbersLeft } = this.editor.getLayoutInfo();
            this.a.title.style.marginLeft = `${lineNumbersLeft}px`;
            const newDim = new dom_1.$BO(widthInPixel, heightInPixel);
            if (!dom_1.$BO.equals(this.m, newDim)) {
                this.m = newDim;
                const oneLineHeightInPx = this.editor.getOption(66 /* EditorOption.lineHeight */);
                this.d.layout(this.m.with(undefined, this.m.height - oneLineHeightInPx /* title */));
            }
        }
    };
    exports.$gqb = $gqb;
    exports.$gqb = $gqb = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, language_1.$ct),
        __param(3, model_1.$yA),
        __param(4, themeService_1.$gv)
    ], $gqb);
});
//# sourceMappingURL=inlineChatLivePreviewWidget.js.map