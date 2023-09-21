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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/arrays", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/base/common/themables", "vs/base/common/types", "vs/editor/browser/widget/diffEditor/outlineModel", "vs/editor/browser/widget/diffEditor/utils", "vs/editor/common/core/lineRange", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/languages", "vs/editor/common/services/languageFeatures", "vs/nls!vs/editor/browser/widget/diffEditor/hideUnchangedRegionsFeature"], function (require, exports, dom_1, iconLabels_1, arrays_1, codicons_1, event_1, htmlContent_1, lifecycle_1, observable_1, themables_1, types_1, outlineModel_1, utils_1, lineRange_1, position_1, range_1, languages_1, languageFeatures_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$SZ = void 0;
    let $SZ = class $SZ extends lifecycle_1.$kc {
        get isUpdatingViewZones() { return this.a; }
        constructor(c, f, g, j) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.j = j;
            this.a = false;
            this.b = (0, observable_1.derivedWithStore)(this, (reader, store) => {
                const m = this.c.modifiedModel.read(reader);
                if (!m) {
                    return undefined;
                }
                return store.add(new OutlineSource(this.j, m));
            });
            this.B(this.c.original.onDidChangeCursorPosition(e => {
                if (e.reason === 3 /* CursorChangeReason.Explicit */) {
                    const m = this.f.get();
                    (0, observable_1.transaction)(tx => {
                        for (const s of this.c.original.getSelections() || []) {
                            m?.ensureOriginalLineIsVisible(s.getStartPosition().lineNumber, tx);
                            m?.ensureOriginalLineIsVisible(s.getEndPosition().lineNumber, tx);
                        }
                    });
                }
            }));
            this.B(this.c.modified.onDidChangeCursorPosition(e => {
                if (e.reason === 3 /* CursorChangeReason.Explicit */) {
                    const m = this.f.get();
                    (0, observable_1.transaction)(tx => {
                        for (const s of this.c.modified.getSelections() || []) {
                            m?.ensureModifiedLineIsVisible(s.getStartPosition().lineNumber, tx);
                            m?.ensureModifiedLineIsVisible(s.getEndPosition().lineNumber, tx);
                        }
                    });
                }
            }));
            const unchangedRegions = this.f.map((m, reader) => m?.diff.read(reader)?.mappings.length === 0 ? [] : m?.unchangedRegions.read(reader) ?? []);
            const viewZones = (0, observable_1.derivedWithStore)(this, (reader, store) => {
                /** @description view Zones */
                const modifiedOutlineSource = this.b.read(reader);
                if (!modifiedOutlineSource) {
                    return { origViewZones: [], modViewZones: [] };
                }
                const origViewZones = [];
                const modViewZones = [];
                const sideBySide = this.g.renderSideBySide.read(reader);
                const curUnchangedRegions = unchangedRegions.read(reader);
                for (const r of curUnchangedRegions) {
                    if (r.shouldHideControls(reader)) {
                        continue;
                    }
                    {
                        const d = (0, observable_1.derived)(reader => /** @description hiddenOriginalRangeStart */ r.getHiddenOriginalRange(reader).startLineNumber - 1);
                        const origVz = new utils_1.$dZ(d, 24);
                        origViewZones.push(origVz);
                        store.add(new CollapsedCodeOverlayWidget(this.c.original, origVz, r, r.originalUnchangedRange, !sideBySide, modifiedOutlineSource, l => this.f.get().ensureModifiedLineIsVisible(l, undefined), this.g));
                    }
                    {
                        const d = (0, observable_1.derived)(reader => /** @description hiddenModifiedRangeStart */ r.getHiddenModifiedRange(reader).startLineNumber - 1);
                        const modViewZone = new utils_1.$dZ(d, 24);
                        modViewZones.push(modViewZone);
                        store.add(new CollapsedCodeOverlayWidget(this.c.modified, modViewZone, r, r.modifiedUnchangedRange, false, modifiedOutlineSource, l => this.f.get().ensureModifiedLineIsVisible(l, undefined), this.g));
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
                glyphMarginHoverMessage: new htmlContent_1.$Xj(undefined, { isTrusted: true, supportThemeIcons: true })
                    .appendMarkdown((0, nls_1.localize)(0, null)),
                glyphMarginClassName: 'fold-unchanged ' + themables_1.ThemeIcon.asClassName(codicons_1.$Pj.fold),
                zIndex: 10001,
            };
            this.B((0, utils_1.$9Y)(this.c.original, (0, observable_1.derived)(reader => {
                /** @description decorations */
                const curUnchangedRegions = unchangedRegions.read(reader);
                const result = curUnchangedRegions.map(r => ({
                    range: r.originalUnchangedRange.toInclusiveRange(),
                    options: unchangedLinesDecoration,
                }));
                for (const r of curUnchangedRegions) {
                    if (r.shouldHideControls(reader)) {
                        result.push({
                            range: range_1.$ks.fromPositions(new position_1.$js(r.originalLineNumber, 1)),
                            options: unchangedLinesDecorationShow,
                        });
                    }
                }
                return result;
            })));
            this.B((0, utils_1.$9Y)(this.c.modified, (0, observable_1.derived)(reader => {
                /** @description decorations */
                const curUnchangedRegions = unchangedRegions.read(reader);
                const result = curUnchangedRegions.map(r => ({
                    range: r.modifiedUnchangedRange.toInclusiveRange(),
                    options: unchangedLinesDecoration,
                }));
                for (const r of curUnchangedRegions) {
                    if (r.shouldHideControls(reader)) {
                        result.push({
                            range: lineRange_1.$ts.ofLength(r.modifiedLineNumber, 1).toInclusiveRange(),
                            options: unchangedLinesDecorationShow,
                        });
                    }
                }
                return result;
            })));
            this.B((0, utils_1.$iZ)(this.c.original, viewZones.map(v => v.origViewZones), v => this.a = v));
            this.B((0, utils_1.$iZ)(this.c.modified, viewZones.map(v => v.modViewZones), v => this.a = v));
            this.B((0, observable_1.autorun)((reader) => {
                /** @description update folded unchanged regions */
                const curUnchangedRegions = unchangedRegions.read(reader);
                this.c.original.setHiddenAreas(curUnchangedRegions.map(r => r.getHiddenOriginalRange(reader).toInclusiveRange()).filter(types_1.$rf));
                this.c.modified.setHiddenAreas(curUnchangedRegions.map(r => r.getHiddenModifiedRange(reader).toInclusiveRange()).filter(types_1.$rf));
            }));
            this.B(this.c.modified.onMouseUp(event => {
                if (!event.event.rightButton && event.target.position && event.target.element?.className.includes('fold-unchanged')) {
                    const lineNumber = event.target.position.lineNumber;
                    const model = this.f.get();
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
            this.B(this.c.original.onMouseUp(event => {
                if (!event.event.rightButton && event.target.position && event.target.element?.className.includes('fold-unchanged')) {
                    const lineNumber = event.target.position.lineNumber;
                    const model = this.f.get();
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
    exports.$SZ = $SZ;
    exports.$SZ = $SZ = __decorate([
        __param(3, languageFeatures_1.$hF)
    ], $SZ);
    let OutlineSource = class OutlineSource extends lifecycle_1.$kc {
        constructor(b, c) {
            super();
            this.b = b;
            this.c = c;
            this.a = (0, observable_1.observableValue)(this, undefined);
            const documentSymbolProviderChanged = (0, observable_1.observableSignalFromEvent)('documentSymbolProvider.onDidChange', this.b.documentSymbolProvider.onDidChange);
            const textModelChanged = (0, observable_1.observableSignalFromEvent)('_textModel.onDidChangeContent', event_1.Event.debounce(e => this.c.onDidChangeContent(e), () => undefined, 100));
            this.B((0, observable_1.autorunWithStore)(async (reader, store) => {
                documentSymbolProviderChanged.read(reader);
                textModelChanged.read(reader);
                const src = store.add(new utils_1.$jZ());
                const model = await outlineModel_1.$RZ.create(this.b.documentSymbolProvider, this.c, src.token);
                if (store.isDisposed) {
                    return;
                }
                this.a.set(model, undefined);
            }));
        }
        getBreadcrumbItems(startRange, reader) {
            const m = this.a.read(reader);
            if (!m) {
                return [];
            }
            const symbols = m.asListOfDocumentSymbols()
                .filter(s => startRange.contains(s.range.startLineNumber) && !startRange.contains(s.range.endLineNumber));
            symbols.sort((0, arrays_1.$9b)((0, arrays_1.$5b)(s => s.range.endLineNumber - s.range.startLineNumber, arrays_1.$7b)));
            return symbols.map(s => ({ name: s.name, kind: s.kind, startLineNumber: s.range.startLineNumber }));
        }
    };
    OutlineSource = __decorate([
        __param(0, languageFeatures_1.$hF)
    ], OutlineSource);
    class CollapsedCodeOverlayWidget extends utils_1.$cZ {
        constructor(g, _viewZone, n, u, w, y, C, D) {
            const root = (0, dom_1.h)('div.diff-hidden-lines-widget');
            super(g, _viewZone, root.root);
            this.g = g;
            this.n = n;
            this.u = u;
            this.w = w;
            this.y = y;
            this.C = C;
            this.D = D;
            this.f = (0, dom_1.h)('div.diff-hidden-lines', [
                (0, dom_1.h)('div.top@top', { title: (0, nls_1.localize)(1, null) }),
                (0, dom_1.h)('div.center@content', { style: { display: 'flex' } }, [
                    (0, dom_1.h)('div@first', { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: '0' } }, [(0, dom_1.$)('a', { title: (0, nls_1.localize)(2, null), role: 'button', onclick: () => { this.n.showAll(undefined); } }, ...(0, iconLabels_1.$xQ)('$(unfold)'))]),
                    (0, dom_1.h)('div@others', { style: { display: 'flex', justifyContent: 'center', alignItems: 'center' } }),
                ]),
                (0, dom_1.h)('div.bottom@bottom', { title: (0, nls_1.localize)(3, null), role: 'button' }),
            ]);
            root.root.appendChild(this.f.root);
            const layoutInfo = (0, observable_1.observableFromEvent)(this.g.onDidLayoutChange, () => this.g.getLayoutInfo());
            if (!this.w) {
                this.B((0, utils_1.$fZ)(this.f.first, { width: layoutInfo.map((l) => l.contentLeft) }));
            }
            else {
                (0, dom_1.$_O)(this.f.first);
            }
            const editor = this.g;
            this.B((0, dom_1.$nO)(this.f.top, 'mousedown', e => {
                if (e.button !== 0) {
                    return;
                }
                this.f.top.classList.toggle('dragging', true);
                this.f.root.classList.toggle('dragging', true);
                e.preventDefault();
                const startTop = e.clientY;
                let didMove = false;
                const cur = this.n.visibleLineCountTop.get();
                this.n.isDragged.set(true, undefined);
                const mouseMoveListener = (0, dom_1.$nO)(window, 'mousemove', e => {
                    const currentTop = e.clientY;
                    const delta = currentTop - startTop;
                    didMove = didMove || Math.abs(delta) > 2;
                    const lineDelta = Math.round(delta / editor.getOption(66 /* EditorOption.lineHeight */));
                    const newVal = Math.max(0, Math.min(cur + lineDelta, this.n.getMaxVisibleLineCountTop()));
                    this.n.visibleLineCountTop.set(newVal, undefined);
                });
                const mouseUpListener = (0, dom_1.$nO)(window, 'mouseup', e => {
                    if (!didMove) {
                        this.n.showMoreAbove(this.D.hideUnchangedRegionsRevealLineCount.get(), undefined);
                    }
                    this.f.top.classList.toggle('dragging', false);
                    this.f.root.classList.toggle('dragging', false);
                    this.n.isDragged.set(false, undefined);
                    mouseMoveListener.dispose();
                    mouseUpListener.dispose();
                });
            }));
            this.B((0, dom_1.$nO)(this.f.bottom, 'mousedown', e => {
                if (e.button !== 0) {
                    return;
                }
                this.f.bottom.classList.toggle('dragging', true);
                this.f.root.classList.toggle('dragging', true);
                e.preventDefault();
                const startTop = e.clientY;
                let didMove = false;
                const cur = this.n.visibleLineCountBottom.get();
                this.n.isDragged.set(true, undefined);
                const mouseMoveListener = (0, dom_1.$nO)(window, 'mousemove', e => {
                    const currentTop = e.clientY;
                    const delta = currentTop - startTop;
                    didMove = didMove || Math.abs(delta) > 2;
                    const lineDelta = Math.round(delta / editor.getOption(66 /* EditorOption.lineHeight */));
                    const newVal = Math.max(0, Math.min(cur - lineDelta, this.n.getMaxVisibleLineCountBottom()));
                    const top = editor.getTopForLineNumber(this.u.endLineNumberExclusive);
                    this.n.visibleLineCountBottom.set(newVal, undefined);
                    const top2 = editor.getTopForLineNumber(this.u.endLineNumberExclusive);
                    editor.setScrollTop(editor.getScrollTop() + (top2 - top));
                });
                const mouseUpListener = (0, dom_1.$nO)(window, 'mouseup', e => {
                    this.n.isDragged.set(false, undefined);
                    if (!didMove) {
                        const top = editor.getTopForLineNumber(this.u.endLineNumberExclusive);
                        this.n.showMoreBelow(this.D.hideUnchangedRegionsRevealLineCount.get(), undefined);
                        const top2 = editor.getTopForLineNumber(this.u.endLineNumberExclusive);
                        editor.setScrollTop(editor.getScrollTop() + (top2 - top));
                    }
                    this.f.bottom.classList.toggle('dragging', false);
                    this.f.root.classList.toggle('dragging', false);
                    mouseMoveListener.dispose();
                    mouseUpListener.dispose();
                });
            }));
            this.B((0, observable_1.autorun)(reader => {
                /** @description update labels */
                const children = [];
                if (!this.w) {
                    const lineCount = n.getHiddenModifiedRange(reader).length;
                    const linesHiddenText = (0, nls_1.localize)(4, null, lineCount);
                    const span = (0, dom_1.$)('span', { title: (0, nls_1.localize)(5, null) }, linesHiddenText);
                    span.addEventListener('dblclick', e => {
                        if (e.button !== 0) {
                            return;
                        }
                        e.preventDefault();
                        this.n.showAll(undefined);
                    });
                    children.push(span);
                    const range = this.n.getHiddenModifiedRange(reader);
                    const items = this.y.getBreadcrumbItems(range, reader);
                    if (items.length > 0) {
                        children.push((0, dom_1.$)('span', undefined, '\u00a0\u00a0|\u00a0\u00a0'));
                        for (let i = 0; i < items.length; i++) {
                            const item = items[i];
                            const icon = languages_1.SymbolKinds.toIcon(item.kind);
                            const divItem = (0, dom_1.h)('div.breadcrumb-item', {
                                style: { display: 'flex', alignItems: 'center' },
                            }, [
                                (0, iconLabels_1.$yQ)(icon),
                                '\u00a0',
                                item.name,
                                ...(i === items.length - 1
                                    ? []
                                    : [(0, iconLabels_1.$yQ)(codicons_1.$Pj.chevronRight)])
                            ]).root;
                            children.push(divItem);
                            divItem.onclick = () => {
                                this.C(item.startLineNumber);
                            };
                        }
                    }
                }
                (0, dom_1.$_O)(this.f.others, ...children);
            }));
        }
    }
});
//# sourceMappingURL=hideUnchangedRegionsFeature.js.map