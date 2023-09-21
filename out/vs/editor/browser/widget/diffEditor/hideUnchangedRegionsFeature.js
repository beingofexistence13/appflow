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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/arrays", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/base/common/themables", "vs/base/common/types", "vs/editor/browser/widget/diffEditor/outlineModel", "vs/editor/browser/widget/diffEditor/utils", "vs/editor/common/core/lineRange", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/languages", "vs/editor/common/services/languageFeatures", "vs/nls"], function (require, exports, dom_1, iconLabels_1, arrays_1, codicons_1, event_1, htmlContent_1, lifecycle_1, observable_1, themables_1, types_1, outlineModel_1, utils_1, lineRange_1, position_1, range_1, languages_1, languageFeatures_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HideUnchangedRegionsFeature = void 0;
    let HideUnchangedRegionsFeature = class HideUnchangedRegionsFeature extends lifecycle_1.Disposable {
        get isUpdatingViewZones() { return this._isUpdatingViewZones; }
        constructor(_editors, _diffModel, _options, _languageFeaturesService) {
            super();
            this._editors = _editors;
            this._diffModel = _diffModel;
            this._options = _options;
            this._languageFeaturesService = _languageFeaturesService;
            this._isUpdatingViewZones = false;
            this._modifiedOutlineSource = (0, observable_1.derivedWithStore)(this, (reader, store) => {
                const m = this._editors.modifiedModel.read(reader);
                if (!m) {
                    return undefined;
                }
                return store.add(new OutlineSource(this._languageFeaturesService, m));
            });
            this._register(this._editors.original.onDidChangeCursorPosition(e => {
                if (e.reason === 3 /* CursorChangeReason.Explicit */) {
                    const m = this._diffModel.get();
                    (0, observable_1.transaction)(tx => {
                        for (const s of this._editors.original.getSelections() || []) {
                            m?.ensureOriginalLineIsVisible(s.getStartPosition().lineNumber, tx);
                            m?.ensureOriginalLineIsVisible(s.getEndPosition().lineNumber, tx);
                        }
                    });
                }
            }));
            this._register(this._editors.modified.onDidChangeCursorPosition(e => {
                if (e.reason === 3 /* CursorChangeReason.Explicit */) {
                    const m = this._diffModel.get();
                    (0, observable_1.transaction)(tx => {
                        for (const s of this._editors.modified.getSelections() || []) {
                            m?.ensureModifiedLineIsVisible(s.getStartPosition().lineNumber, tx);
                            m?.ensureModifiedLineIsVisible(s.getEndPosition().lineNumber, tx);
                        }
                    });
                }
            }));
            const unchangedRegions = this._diffModel.map((m, reader) => m?.diff.read(reader)?.mappings.length === 0 ? [] : m?.unchangedRegions.read(reader) ?? []);
            const viewZones = (0, observable_1.derivedWithStore)(this, (reader, store) => {
                /** @description view Zones */
                const modifiedOutlineSource = this._modifiedOutlineSource.read(reader);
                if (!modifiedOutlineSource) {
                    return { origViewZones: [], modViewZones: [] };
                }
                const origViewZones = [];
                const modViewZones = [];
                const sideBySide = this._options.renderSideBySide.read(reader);
                const curUnchangedRegions = unchangedRegions.read(reader);
                for (const r of curUnchangedRegions) {
                    if (r.shouldHideControls(reader)) {
                        continue;
                    }
                    {
                        const d = (0, observable_1.derived)(reader => /** @description hiddenOriginalRangeStart */ r.getHiddenOriginalRange(reader).startLineNumber - 1);
                        const origVz = new utils_1.PlaceholderViewZone(d, 24);
                        origViewZones.push(origVz);
                        store.add(new CollapsedCodeOverlayWidget(this._editors.original, origVz, r, r.originalUnchangedRange, !sideBySide, modifiedOutlineSource, l => this._diffModel.get().ensureModifiedLineIsVisible(l, undefined), this._options));
                    }
                    {
                        const d = (0, observable_1.derived)(reader => /** @description hiddenModifiedRangeStart */ r.getHiddenModifiedRange(reader).startLineNumber - 1);
                        const modViewZone = new utils_1.PlaceholderViewZone(d, 24);
                        modViewZones.push(modViewZone);
                        store.add(new CollapsedCodeOverlayWidget(this._editors.modified, modViewZone, r, r.modifiedUnchangedRange, false, modifiedOutlineSource, l => this._diffModel.get().ensureModifiedLineIsVisible(l, undefined), this._options));
                    }
                }
                return { origViewZones, modViewZones, };
            });
            const unchangedLinesDecoration = {
                description: 'unchanged lines',
                className: 'diff-unchanged-lines',
                isWholeLine: true,
            };
            const unchangedLinesDecorationShow = {
                description: 'Fold Unchanged',
                glyphMarginHoverMessage: new htmlContent_1.MarkdownString(undefined, { isTrusted: true, supportThemeIcons: true })
                    .appendMarkdown((0, nls_1.localize)('foldUnchanged', 'Fold Unchanged Region')),
                glyphMarginClassName: 'fold-unchanged ' + themables_1.ThemeIcon.asClassName(codicons_1.Codicon.fold),
                zIndex: 10001,
            };
            this._register((0, utils_1.applyObservableDecorations)(this._editors.original, (0, observable_1.derived)(reader => {
                /** @description decorations */
                const curUnchangedRegions = unchangedRegions.read(reader);
                const result = curUnchangedRegions.map(r => ({
                    range: r.originalUnchangedRange.toInclusiveRange(),
                    options: unchangedLinesDecoration,
                }));
                for (const r of curUnchangedRegions) {
                    if (r.shouldHideControls(reader)) {
                        result.push({
                            range: range_1.Range.fromPositions(new position_1.Position(r.originalLineNumber, 1)),
                            options: unchangedLinesDecorationShow,
                        });
                    }
                }
                return result;
            })));
            this._register((0, utils_1.applyObservableDecorations)(this._editors.modified, (0, observable_1.derived)(reader => {
                /** @description decorations */
                const curUnchangedRegions = unchangedRegions.read(reader);
                const result = curUnchangedRegions.map(r => ({
                    range: r.modifiedUnchangedRange.toInclusiveRange(),
                    options: unchangedLinesDecoration,
                }));
                for (const r of curUnchangedRegions) {
                    if (r.shouldHideControls(reader)) {
                        result.push({
                            range: lineRange_1.LineRange.ofLength(r.modifiedLineNumber, 1).toInclusiveRange(),
                            options: unchangedLinesDecorationShow,
                        });
                    }
                }
                return result;
            })));
            this._register((0, utils_1.applyViewZones)(this._editors.original, viewZones.map(v => v.origViewZones), v => this._isUpdatingViewZones = v));
            this._register((0, utils_1.applyViewZones)(this._editors.modified, viewZones.map(v => v.modViewZones), v => this._isUpdatingViewZones = v));
            this._register((0, observable_1.autorun)((reader) => {
                /** @description update folded unchanged regions */
                const curUnchangedRegions = unchangedRegions.read(reader);
                this._editors.original.setHiddenAreas(curUnchangedRegions.map(r => r.getHiddenOriginalRange(reader).toInclusiveRange()).filter(types_1.isDefined));
                this._editors.modified.setHiddenAreas(curUnchangedRegions.map(r => r.getHiddenModifiedRange(reader).toInclusiveRange()).filter(types_1.isDefined));
            }));
            this._register(this._editors.modified.onMouseUp(event => {
                if (!event.event.rightButton && event.target.position && event.target.element?.className.includes('fold-unchanged')) {
                    const lineNumber = event.target.position.lineNumber;
                    const model = this._diffModel.get();
                    if (!model) {
                        return;
                    }
                    const region = model.unchangedRegions.get().find(r => r.modifiedUnchangedRange.includes(lineNumber));
                    if (!region) {
                        return;
                    }
                    region.collapseAll(undefined);
                    event.event.stopPropagation();
                    event.event.preventDefault();
                }
            }));
            this._register(this._editors.original.onMouseUp(event => {
                if (!event.event.rightButton && event.target.position && event.target.element?.className.includes('fold-unchanged')) {
                    const lineNumber = event.target.position.lineNumber;
                    const model = this._diffModel.get();
                    if (!model) {
                        return;
                    }
                    const region = model.unchangedRegions.get().find(r => r.originalUnchangedRange.includes(lineNumber));
                    if (!region) {
                        return;
                    }
                    region.collapseAll(undefined);
                    event.event.stopPropagation();
                    event.event.preventDefault();
                }
            }));
        }
    };
    exports.HideUnchangedRegionsFeature = HideUnchangedRegionsFeature;
    exports.HideUnchangedRegionsFeature = HideUnchangedRegionsFeature = __decorate([
        __param(3, languageFeatures_1.ILanguageFeaturesService)
    ], HideUnchangedRegionsFeature);
    let OutlineSource = class OutlineSource extends lifecycle_1.Disposable {
        constructor(_languageFeaturesService, _textModel) {
            super();
            this._languageFeaturesService = _languageFeaturesService;
            this._textModel = _textModel;
            this._currentModel = (0, observable_1.observableValue)(this, undefined);
            const documentSymbolProviderChanged = (0, observable_1.observableSignalFromEvent)('documentSymbolProvider.onDidChange', this._languageFeaturesService.documentSymbolProvider.onDidChange);
            const textModelChanged = (0, observable_1.observableSignalFromEvent)('_textModel.onDidChangeContent', event_1.Event.debounce(e => this._textModel.onDidChangeContent(e), () => undefined, 100));
            this._register((0, observable_1.autorunWithStore)(async (reader, store) => {
                documentSymbolProviderChanged.read(reader);
                textModelChanged.read(reader);
                const src = store.add(new utils_1.DisposableCancellationTokenSource());
                const model = await outlineModel_1.OutlineModel.create(this._languageFeaturesService.documentSymbolProvider, this._textModel, src.token);
                if (store.isDisposed) {
                    return;
                }
                this._currentModel.set(model, undefined);
            }));
        }
        getBreadcrumbItems(startRange, reader) {
            const m = this._currentModel.read(reader);
            if (!m) {
                return [];
            }
            const symbols = m.asListOfDocumentSymbols()
                .filter(s => startRange.contains(s.range.startLineNumber) && !startRange.contains(s.range.endLineNumber));
            symbols.sort((0, arrays_1.reverseOrder)((0, arrays_1.compareBy)(s => s.range.endLineNumber - s.range.startLineNumber, arrays_1.numberComparator)));
            return symbols.map(s => ({ name: s.name, kind: s.kind, startLineNumber: s.range.startLineNumber }));
        }
    };
    OutlineSource = __decorate([
        __param(0, languageFeatures_1.ILanguageFeaturesService)
    ], OutlineSource);
    class CollapsedCodeOverlayWidget extends utils_1.ViewZoneOverlayWidget {
        constructor(_editor, _viewZone, _unchangedRegion, _unchangedRegionRange, hide, _modifiedOutlineSource, _revealModifiedHiddenLine, _options) {
            const root = (0, dom_1.h)('div.diff-hidden-lines-widget');
            super(_editor, _viewZone, root.root);
            this._editor = _editor;
            this._unchangedRegion = _unchangedRegion;
            this._unchangedRegionRange = _unchangedRegionRange;
            this.hide = hide;
            this._modifiedOutlineSource = _modifiedOutlineSource;
            this._revealModifiedHiddenLine = _revealModifiedHiddenLine;
            this._options = _options;
            this._nodes = (0, dom_1.h)('div.diff-hidden-lines', [
                (0, dom_1.h)('div.top@top', { title: (0, nls_1.localize)('diff.hiddenLines.top', 'Click or drag to show more above') }),
                (0, dom_1.h)('div.center@content', { style: { display: 'flex' } }, [
                    (0, dom_1.h)('div@first', { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: '0' } }, [(0, dom_1.$)('a', { title: (0, nls_1.localize)('showAll', 'Show all'), role: 'button', onclick: () => { this._unchangedRegion.showAll(undefined); } }, ...(0, iconLabels_1.renderLabelWithIcons)('$(unfold)'))]),
                    (0, dom_1.h)('div@others', { style: { display: 'flex', justifyContent: 'center', alignItems: 'center' } }),
                ]),
                (0, dom_1.h)('div.bottom@bottom', { title: (0, nls_1.localize)('diff.bottom', 'Click or drag to show more below'), role: 'button' }),
            ]);
            root.root.appendChild(this._nodes.root);
            const layoutInfo = (0, observable_1.observableFromEvent)(this._editor.onDidLayoutChange, () => this._editor.getLayoutInfo());
            if (!this.hide) {
                this._register((0, utils_1.applyStyle)(this._nodes.first, { width: layoutInfo.map((l) => l.contentLeft) }));
            }
            else {
                (0, dom_1.reset)(this._nodes.first);
            }
            const editor = this._editor;
            this._register((0, dom_1.addDisposableListener)(this._nodes.top, 'mousedown', e => {
                if (e.button !== 0) {
                    return;
                }
                this._nodes.top.classList.toggle('dragging', true);
                this._nodes.root.classList.toggle('dragging', true);
                e.preventDefault();
                const startTop = e.clientY;
                let didMove = false;
                const cur = this._unchangedRegion.visibleLineCountTop.get();
                this._unchangedRegion.isDragged.set(true, undefined);
                const mouseMoveListener = (0, dom_1.addDisposableListener)(window, 'mousemove', e => {
                    const currentTop = e.clientY;
                    const delta = currentTop - startTop;
                    didMove = didMove || Math.abs(delta) > 2;
                    const lineDelta = Math.round(delta / editor.getOption(66 /* EditorOption.lineHeight */));
                    const newVal = Math.max(0, Math.min(cur + lineDelta, this._unchangedRegion.getMaxVisibleLineCountTop()));
                    this._unchangedRegion.visibleLineCountTop.set(newVal, undefined);
                });
                const mouseUpListener = (0, dom_1.addDisposableListener)(window, 'mouseup', e => {
                    if (!didMove) {
                        this._unchangedRegion.showMoreAbove(this._options.hideUnchangedRegionsRevealLineCount.get(), undefined);
                    }
                    this._nodes.top.classList.toggle('dragging', false);
                    this._nodes.root.classList.toggle('dragging', false);
                    this._unchangedRegion.isDragged.set(false, undefined);
                    mouseMoveListener.dispose();
                    mouseUpListener.dispose();
                });
            }));
            this._register((0, dom_1.addDisposableListener)(this._nodes.bottom, 'mousedown', e => {
                if (e.button !== 0) {
                    return;
                }
                this._nodes.bottom.classList.toggle('dragging', true);
                this._nodes.root.classList.toggle('dragging', true);
                e.preventDefault();
                const startTop = e.clientY;
                let didMove = false;
                const cur = this._unchangedRegion.visibleLineCountBottom.get();
                this._unchangedRegion.isDragged.set(true, undefined);
                const mouseMoveListener = (0, dom_1.addDisposableListener)(window, 'mousemove', e => {
                    const currentTop = e.clientY;
                    const delta = currentTop - startTop;
                    didMove = didMove || Math.abs(delta) > 2;
                    const lineDelta = Math.round(delta / editor.getOption(66 /* EditorOption.lineHeight */));
                    const newVal = Math.max(0, Math.min(cur - lineDelta, this._unchangedRegion.getMaxVisibleLineCountBottom()));
                    const top = editor.getTopForLineNumber(this._unchangedRegionRange.endLineNumberExclusive);
                    this._unchangedRegion.visibleLineCountBottom.set(newVal, undefined);
                    const top2 = editor.getTopForLineNumber(this._unchangedRegionRange.endLineNumberExclusive);
                    editor.setScrollTop(editor.getScrollTop() + (top2 - top));
                });
                const mouseUpListener = (0, dom_1.addDisposableListener)(window, 'mouseup', e => {
                    this._unchangedRegion.isDragged.set(false, undefined);
                    if (!didMove) {
                        const top = editor.getTopForLineNumber(this._unchangedRegionRange.endLineNumberExclusive);
                        this._unchangedRegion.showMoreBelow(this._options.hideUnchangedRegionsRevealLineCount.get(), undefined);
                        const top2 = editor.getTopForLineNumber(this._unchangedRegionRange.endLineNumberExclusive);
                        editor.setScrollTop(editor.getScrollTop() + (top2 - top));
                    }
                    this._nodes.bottom.classList.toggle('dragging', false);
                    this._nodes.root.classList.toggle('dragging', false);
                    mouseMoveListener.dispose();
                    mouseUpListener.dispose();
                });
            }));
            this._register((0, observable_1.autorun)(reader => {
                /** @description update labels */
                const children = [];
                if (!this.hide) {
                    const lineCount = _unchangedRegion.getHiddenModifiedRange(reader).length;
                    const linesHiddenText = (0, nls_1.localize)('hiddenLines', '{0} hidden lines', lineCount);
                    const span = (0, dom_1.$)('span', { title: (0, nls_1.localize)('diff.hiddenLines.expandAll', 'Double click to unfold') }, linesHiddenText);
                    span.addEventListener('dblclick', e => {
                        if (e.button !== 0) {
                            return;
                        }
                        e.preventDefault();
                        this._unchangedRegion.showAll(undefined);
                    });
                    children.push(span);
                    const range = this._unchangedRegion.getHiddenModifiedRange(reader);
                    const items = this._modifiedOutlineSource.getBreadcrumbItems(range, reader);
                    if (items.length > 0) {
                        children.push((0, dom_1.$)('span', undefined, '\u00a0\u00a0|\u00a0\u00a0'));
                        for (let i = 0; i < items.length; i++) {
                            const item = items[i];
                            const icon = languages_1.SymbolKinds.toIcon(item.kind);
                            const divItem = (0, dom_1.h)('div.breadcrumb-item', {
                                style: { display: 'flex', alignItems: 'center' },
                            }, [
                                (0, iconLabels_1.renderIcon)(icon),
                                '\u00a0',
                                item.name,
                                ...(i === items.length - 1
                                    ? []
                                    : [(0, iconLabels_1.renderIcon)(codicons_1.Codicon.chevronRight)])
                            ]).root;
                            children.push(divItem);
                            divItem.onclick = () => {
                                this._revealModifiedHiddenLine(item.startLineNumber);
                            };
                        }
                    }
                }
                (0, dom_1.reset)(this._nodes.others, ...children);
            }));
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlkZVVuY2hhbmdlZFJlZ2lvbnNGZWF0dXJlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2Jyb3dzZXIvd2lkZ2V0L2RpZmZFZGl0b3IvaGlkZVVuY2hhbmdlZFJlZ2lvbnNGZWF0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTRCekYsSUFBTSwyQkFBMkIsR0FBakMsTUFBTSwyQkFBNEIsU0FBUSxzQkFBVTtRQUUxRCxJQUFXLG1CQUFtQixLQUFjLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztRQVEvRSxZQUNrQixRQUEyQixFQUMzQixVQUF3RCxFQUN4RCxRQUEyQixFQUNsQix3QkFBbUU7WUFFN0YsS0FBSyxFQUFFLENBQUM7WUFMUyxhQUFRLEdBQVIsUUFBUSxDQUFtQjtZQUMzQixlQUFVLEdBQVYsVUFBVSxDQUE4QztZQUN4RCxhQUFRLEdBQVIsUUFBUSxDQUFtQjtZQUNELDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7WUFidEYseUJBQW9CLEdBQUcsS0FBSyxDQUFDO1lBR3BCLDJCQUFzQixHQUFHLElBQUEsNkJBQWdCLEVBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUNsRixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ25ELElBQUksQ0FBQyxDQUFDLEVBQUU7b0JBQUUsT0FBTyxTQUFTLENBQUM7aUJBQUU7Z0JBQzdCLE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2RSxDQUFDLENBQUMsQ0FBQztZQVVGLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxD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