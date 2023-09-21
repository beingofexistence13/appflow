/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/arraysFind", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/base/common/themables", "vs/editor/browser/widget/diffEditor/utils", "vs/editor/common/core/offsetRange", "vs/nls!vs/editor/browser/widget/diffEditor/movedBlocksLines"], function (require, exports, dom_1, actionbar_1, actions_1, arrays_1, arraysFind_1, codicons_1, lifecycle_1, observable_1, themables_1, utils_1, offsetRange_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$LZ = void 0;
    class $LZ extends lifecycle_1.$kc {
        static { this.movedCodeBlockPadding = 4; }
        constructor(n, r, s, t, u) {
            super();
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.c = (0, observable_1.observableFromEvent)(this.u.original.onDidScrollChange, () => this.u.original.getScrollTop());
            this.f = (0, observable_1.observableFromEvent)(this.u.modified.onDidScrollChange, () => this.u.modified.getScrollTop());
            this.j = (0, observable_1.observableSignalFromEvent)('onDidChangeViewZones', this.u.modified.onDidChangeViewZones);
            this.width = (0, observable_1.observableValue)(this, 0);
            this.w = (0, observable_1.observableSignalFromEvent)('modified.onDidChangeViewZones', this.u.modified.onDidChangeViewZones);
            this.y = (0, observable_1.observableSignalFromEvent)('original.onDidChangeViewZones', this.u.original.onDidChangeViewZones);
            this.C = (0, observable_1.derivedWithStore)((reader, store) => {
                /** @description state */
                this.a.replaceChildren();
                const model = this.r.read(reader);
                const moves = model?.diff.read(reader)?.movedTexts;
                if (!moves || moves.length === 0) {
                    this.width.set(0, undefined);
                    return;
                }
                this.j.read(reader);
                const infoOrig = this.s.read(reader);
                const infoMod = this.t.read(reader);
                if (!infoOrig || !infoMod) {
                    this.width.set(0, undefined);
                    return;
                }
                this.w.read(reader);
                this.y.read(reader);
                const lines = moves.map((move) => {
                    function computeLineStart(range, editor) {
                        const t1 = editor.getTopForLineNumber(range.startLineNumber, true);
                        const t2 = editor.getTopForLineNumber(range.endLineNumberExclusive, true);
                        return (t1 + t2) / 2;
                    }
                    const start = computeLineStart(move.lineRangeMapping.original, this.u.original);
                    const startOffset = this.c.read(reader);
                    const end = computeLineStart(move.lineRangeMapping.modified, this.u.modified);
                    const endOffset = this.f.read(reader);
                    const from = start - startOffset;
                    const to = end - endOffset;
                    const top = Math.min(start, end);
                    const bottom = Math.max(start, end);
                    return { range: new offsetRange_1.$rs(top, bottom), from, to, fromWithoutScroll: start, toWithoutScroll: end, move };
                });
                lines.sort((0, arrays_1.$6b)((0, arrays_1.$5b)(l => l.fromWithoutScroll > l.toWithoutScroll, arrays_1.$8b), (0, arrays_1.$5b)(l => l.fromWithoutScroll > l.toWithoutScroll ? l.fromWithoutScroll : -l.toWithoutScroll, arrays_1.$7b)));
                const layout = LinesLayout.compute(lines.map(l => l.range));
                const padding = 10;
                const lineAreaLeft = infoOrig.verticalScrollbarWidth;
                const lineAreaWidth = (layout.getTrackCount() - 1) * 10 + padding * 2;
                const width = lineAreaLeft + lineAreaWidth + (infoMod.contentLeft - $LZ.movedCodeBlockPadding);
                let idx = 0;
                for (const line of lines) {
                    const track = layout.getTrack(idx);
                    const verticalY = lineAreaLeft + padding + track * 10;
                    const arrowHeight = 15;
                    const arrowWidth = 15;
                    const right = width;
                    const rectWidth = infoMod.glyphMarginWidth + infoMod.lineNumbersWidth;
                    const rectHeight = 18;
                    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    rect.classList.add('arrow-rectangle');
                    rect.setAttribute('x', `${right - rectWidth}`);
                    rect.setAttribute('y', `${line.to - rectHeight / 2}`);
                    rect.setAttribute('width', `${rectWidth}`);
                    rect.setAttribute('height', `${rectHeight}`);
                    this.a.appendChild(rect);
                    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute('d', `M ${0} ${line.from} L ${verticalY} ${line.from} L ${verticalY} ${line.to} L ${right - arrowWidth} ${line.to}`);
                    path.setAttribute('fill', 'none');
                    g.appendChild(path);
                    const arrowRight = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                    arrowRight.classList.add('arrow');
                    store.add((0, observable_1.autorun)(reader => {
                        path.classList.toggle('currentMove', line.move === model.activeMovedText.read(reader));
                        arrowRight.classList.toggle('currentMove', line.move === model.activeMovedText.read(reader));
                    }));
                    arrowRight.setAttribute('points', `${right - arrowWidth},${line.to - arrowHeight / 2} ${right},${line.to} ${right - arrowWidth},${line.to + arrowHeight / 2}`);
                    g.appendChild(arrowRight);
                    this.a.appendChild(g);
                    /*
                    TODO@hediet
                    path.addEventListener('mouseenter', () => {
                        model.setHoveredMovedText(line.move);
                    });
                    path.addEventListener('mouseleave', () => {
                        model.setHoveredMovedText(undefined);
                    });*/
                    idx++;
                }
                this.width.set(lineAreaWidth, undefined);
            });
            this.a = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.a.setAttribute('class', 'moved-blocks-lines');
            this.n.appendChild(this.a);
            this.B((0, lifecycle_1.$ic)(() => this.a.remove()));
            this.B((0, observable_1.autorun)(reader => {
                /** @description update moved blocks lines positioning */
                const info = this.s.read(reader);
                const info2 = this.t.read(reader);
                if (!info || !info2) {
                    return;
                }
                this.a.style.left = `${info.width - info.verticalScrollbarWidth}px`;
                this.a.style.height = `${info.height}px`;
                this.a.style.width = `${info.verticalScrollbarWidth + info.contentLeft - $LZ.movedCodeBlockPadding + this.width.read(reader)}px`;
            }));
            this.B((0, observable_1.recomputeInitiallyAndOnChange)(this.C));
            const movedBlockViewZones = (0, observable_1.derived)(reader => {
                const model = this.r.read(reader);
                const d = model?.diff.read(reader);
                if (!d) {
                    return [];
                }
                return d.movedTexts.map(move => ({
                    move,
                    original: new utils_1.$dZ((0, observable_1.constObservable)(move.lineRangeMapping.original.startLineNumber - 1), 18),
                    modified: new utils_1.$dZ((0, observable_1.constObservable)(move.lineRangeMapping.modified.startLineNumber - 1), 18),
                }));
            });
            this.B((0, utils_1.$iZ)(this.u.original, movedBlockViewZones.map(zones => zones.map(z => z.original))));
            this.B((0, utils_1.$iZ)(this.u.modified, movedBlockViewZones.map(zones => zones.map(z => z.modified))));
            this.B((0, observable_1.autorunWithStore)((reader, store) => {
                const blocks = movedBlockViewZones.read(reader);
                for (const b of blocks) {
                    store.add(new MovedBlockOverlayWidget(this.u.original, b.original, b.move, 'original', this.r.get()));
                    store.add(new MovedBlockOverlayWidget(this.u.modified, b.modified, b.move, 'modified', this.r.get()));
                }
            }));
            const originalCursorPosition = (0, observable_1.observableFromEvent)(this.u.original.onDidChangeCursorPosition, () => this.u.original.getPosition());
            const modifiedCursorPosition = (0, observable_1.observableFromEvent)(this.u.modified.onDidChangeCursorPosition, () => this.u.modified.getPosition());
            const originalHasFocus = (0, observable_1.observableSignalFromEvent)('original.onDidFocusEditorWidget', e => this.u.original.onDidFocusEditorWidget(() => setTimeout(() => e(undefined), 0)));
            const modifiedHasFocus = (0, observable_1.observableSignalFromEvent)('modified.onDidFocusEditorWidget', e => this.u.modified.onDidFocusEditorWidget(() => setTimeout(() => e(undefined), 0)));
            let lastChangedEditor = 'modified';
            this.B((0, observable_1.autorunHandleChanges)({
                createEmptyChangeSummary: () => undefined,
                handleChange: (ctx, summary) => {
                    if (ctx.didChange(originalHasFocus)) {
                        lastChangedEditor = 'original';
                    }
                    if (ctx.didChange(modifiedHasFocus)) {
                        lastChangedEditor = 'modified';
                    }
                    return true;
                }
            }, reader => {
                originalHasFocus.read(reader);
                modifiedHasFocus.read(reader);
                const m = this.r.read(reader);
                if (!m) {
                    return;
                }
                const diff = m.diff.read(reader);
                let movedText = undefined;
                if (diff && lastChangedEditor === 'original') {
                    const originalPos = originalCursorPosition.read(reader);
                    if (originalPos) {
                        movedText = diff.movedTexts.find(m => m.lineRangeMapping.original.contains(originalPos.lineNumber));
                    }
                }
                if (diff && lastChangedEditor === 'modified') {
                    const modifiedPos = modifiedCursorPosition.read(reader);
                    if (modifiedPos) {
                        movedText = diff.movedTexts.find(m => m.lineRangeMapping.modified.contains(modifiedPos.lineNumber));
                    }
                }
                if (movedText !== m.movedTextToCompare.get()) {
                    m.movedTextToCompare.set(undefined, undefined);
                }
                m.setActiveMovedText(movedText);
            }));
        }
    }
    exports.$LZ = $LZ;
    class LinesLayout {
        static compute(lines) {
            const setsPerTrack = [];
            const trackPerLineIdx = [];
            for (const line of lines) {
                let trackIdx = setsPerTrack.findIndex(set => !set.intersectsStrict(line));
                if (trackIdx === -1) {
                    const maxTrackCount = 6;
                    if (setsPerTrack.length >= maxTrackCount) {
                        trackIdx = (0, arraysFind_1.$ob)(setsPerTrack, (0, arrays_1.$5b)(set => set.intersectWithRangeLength(line), arrays_1.$7b));
                    }
                    else {
                        trackIdx = setsPerTrack.length;
                        setsPerTrack.push(new offsetRange_1.$ss());
                    }
                }
                setsPerTrack[trackIdx].addRange(line);
                trackPerLineIdx.push(trackIdx);
            }
            return new LinesLayout(setsPerTrack.length, trackPerLineIdx);
        }
        constructor(a, c) {
            this.a = a;
            this.c = c;
        }
        getTrack(lineIdx) {
            return this.c[lineIdx];
        }
        getTrackCount() {
            return this.a;
        }
    }
    class MovedBlockOverlayWidget extends utils_1.$cZ {
        constructor(n, _viewZone, r, u, w) {
            const root = (0, dom_1.h)('div.diff-hidden-lines-widget');
            super(n, _viewZone, root.root);
            this.n = n;
            this.r = r;
            this.u = u;
            this.w = w;
            this.f = (0, dom_1.h)('div.diff-moved-code-block', { style: { marginRight: '4px' } }, [
                (0, dom_1.h)('div.text-content@textContent'),
                (0, dom_1.h)('div.action-bar@actionBar'),
            ]);
            root.root.appendChild(this.f.root);
            const editorLayout = (0, observable_1.observableFromEvent)(this.n.onDidLayoutChange, () => this.n.getLayoutInfo());
            this.B((0, utils_1.$fZ)(this.f.root, {
                paddingRight: editorLayout.map(l => l.verticalScrollbarWidth)
            }));
            let text;
            if (r.changes.length > 0) {
                text = this.u === 'original' ? (0, nls_1.localize)(0, null, this.r.lineRangeMapping.modified.startLineNumber, this.r.lineRangeMapping.modified.endLineNumberExclusive - 1) : (0, nls_1.localize)(1, null, this.r.lineRangeMapping.original.startLineNumber, this.r.lineRangeMapping.original.endLineNumberExclusive - 1);
            }
            else {
                text = this.u === 'original' ? (0, nls_1.localize)(2, null, this.r.lineRangeMapping.modified.startLineNumber, this.r.lineRangeMapping.modified.endLineNumberExclusive - 1) : (0, nls_1.localize)(3, null, this.r.lineRangeMapping.original.startLineNumber, this.r.lineRangeMapping.original.endLineNumberExclusive - 1);
            }
            const actionBar = this.B(new actionbar_1.$1P(this.f.actionBar, {
                highlightToggledItems: true,
            }));
            const caption = new actions_1.$gi('', text, '', false);
            actionBar.push(caption, { icon: false, label: true });
            const actionCompare = new actions_1.$gi('', 'Compare', themables_1.ThemeIcon.asClassName(codicons_1.$Pj.compareChanges), true, () => {
                this.n.focus();
                this.w.movedTextToCompare.set(this.w.movedTextToCompare.get() === r ? undefined : this.r, undefined);
            });
            this.B((0, observable_1.autorun)(reader => {
                const isActive = this.w.movedTextToCompare.read(reader) === r;
                actionCompare.checked = isActive;
            }));
            actionBar.push(actionCompare, { icon: false, label: true });
        }
    }
});
//# sourceMappingURL=movedBlocksLines.js.map