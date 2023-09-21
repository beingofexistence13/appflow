/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/arraysFind", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/base/common/themables", "vs/editor/browser/widget/diffEditor/utils", "vs/editor/common/core/offsetRange", "vs/nls"], function (require, exports, dom_1, actionbar_1, actions_1, arrays_1, arraysFind_1, codicons_1, lifecycle_1, observable_1, themables_1, utils_1, offsetRange_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MovedBlocksLinesPart = void 0;
    class MovedBlocksLinesPart extends lifecycle_1.Disposable {
        static { this.movedCodeBlockPadding = 4; }
        constructor(_rootElement, _diffModel, _originalEditorLayoutInfo, _modifiedEditorLayoutInfo, _editors) {
            super();
            this._rootElement = _rootElement;
            this._diffModel = _diffModel;
            this._originalEditorLayoutInfo = _originalEditorLayoutInfo;
            this._modifiedEditorLayoutInfo = _modifiedEditorLayoutInfo;
            this._editors = _editors;
            this._originalScrollTop = (0, observable_1.observableFromEvent)(this._editors.original.onDidScrollChange, () => this._editors.original.getScrollTop());
            this._modifiedScrollTop = (0, observable_1.observableFromEvent)(this._editors.modified.onDidScrollChange, () => this._editors.modified.getScrollTop());
            this._viewZonesChanged = (0, observable_1.observableSignalFromEvent)('onDidChangeViewZones', this._editors.modified.onDidChangeViewZones);
            this.width = (0, observable_1.observableValue)(this, 0);
            this._modifiedViewZonesChangedSignal = (0, observable_1.observableSignalFromEvent)('modified.onDidChangeViewZones', this._editors.modified.onDidChangeViewZones);
            this._originalViewZonesChangedSignal = (0, observable_1.observableSignalFromEvent)('original.onDidChangeViewZones', this._editors.original.onDidChangeViewZones);
            this._state = (0, observable_1.derivedWithStore)((reader, store) => {
                /** @description state */
                this._element.replaceChildren();
                const model = this._diffModel.read(reader);
                const moves = model?.diff.read(reader)?.movedTexts;
                if (!moves || moves.length === 0) {
                    this.width.set(0, undefined);
                    return;
                }
                this._viewZonesChanged.read(reader);
                const infoOrig = this._originalEditorLayoutInfo.read(reader);
                const infoMod = this._modifiedEditorLayoutInfo.read(reader);
                if (!infoOrig || !infoMod) {
                    this.width.set(0, undefined);
                    return;
                }
                this._modifiedViewZonesChangedSignal.read(reader);
                this._originalViewZonesChangedSignal.read(reader);
                const lines = moves.map((move) => {
                    function computeLineStart(range, editor) {
                        const t1 = editor.getTopForLineNumber(range.startLineNumber, true);
                        const t2 = editor.getTopForLineNumber(range.endLineNumberExclusive, true);
                        return (t1 + t2) / 2;
                    }
                    const start = computeLineStart(move.lineRangeMapping.original, this._editors.original);
                    const startOffset = this._originalScrollTop.read(reader);
                    const end = computeLineStart(move.lineRangeMapping.modified, this._editors.modified);
                    const endOffset = this._modifiedScrollTop.read(reader);
                    const from = start - startOffset;
                    const to = end - endOffset;
                    const top = Math.min(start, end);
                    const bottom = Math.max(start, end);
                    return { range: new offsetRange_1.OffsetRange(top, bottom), from, to, fromWithoutScroll: start, toWithoutScroll: end, move };
                });
                lines.sort((0, arrays_1.tieBreakComparators)((0, arrays_1.compareBy)(l => l.fromWithoutScroll > l.toWithoutScroll, arrays_1.booleanComparator), (0, arrays_1.compareBy)(l => l.fromWithoutScroll > l.toWithoutScroll ? l.fromWithoutScroll : -l.toWithoutScroll, arrays_1.numberComparator)));
                const layout = LinesLayout.compute(lines.map(l => l.range));
                const padding = 10;
                const lineAreaLeft = infoOrig.verticalScrollbarWidth;
                const lineAreaWidth = (layout.getTrackCount() - 1) * 10 + padding * 2;
                const width = lineAreaLeft + lineAreaWidth + (infoMod.contentLeft - MovedBlocksLinesPart.movedCodeBlockPadding);
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
                    this._element.appendChild(rect);
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
                    this._element.appendChild(g);
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
            this._element = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this._element.setAttribute('class', 'moved-blocks-lines');
            this._rootElement.appendChild(this._element);
            this._register((0, lifecycle_1.toDisposable)(() => this._element.remove()));
            this._register((0, observable_1.autorun)(reader => {
                /** @description update moved blocks lines positioning */
                const info = this._originalEditorLayoutInfo.read(reader);
                const info2 = this._modifiedEditorLayoutInfo.read(reader);
                if (!info || !info2) {
                    return;
                }
                this._element.style.left = `${info.width - info.verticalScrollbarWidth}px`;
                this._element.style.height = `${info.height}px`;
                this._element.style.width = `${info.verticalScrollbarWidth + info.contentLeft - MovedBlocksLinesPart.movedCodeBlockPadding + this.width.read(reader)}px`;
            }));
            this._register((0, observable_1.recomputeInitiallyAndOnChange)(this._state));
            const movedBlockViewZones = (0, observable_1.derived)(reader => {
                const model = this._diffModel.read(reader);
                const d = model?.diff.read(reader);
                if (!d) {
                    return [];
                }
                return d.movedTexts.map(move => ({
                    move,
                    original: new utils_1.PlaceholderViewZone((0, observable_1.constObservable)(move.lineRangeMapping.original.startLineNumber - 1), 18),
                    modified: new utils_1.PlaceholderViewZone((0, observable_1.constObservable)(move.lineRangeMapping.modified.startLineNumber - 1), 18),
                }));
            });
            this._register((0, utils_1.applyViewZones)(this._editors.original, movedBlockViewZones.map(zones => zones.map(z => z.original))));
            this._register((0, utils_1.applyViewZones)(this._editors.modified, movedBlockViewZones.map(zones => zones.map(z => z.modified))));
            this._register((0, observable_1.autorunWithStore)((reader, store) => {
                const blocks = movedBlockViewZones.read(reader);
                for (const b of blocks) {
                    store.add(new MovedBlockOverlayWidget(this._editors.original, b.original, b.move, 'original', this._diffModel.get()));
                    store.add(new MovedBlockOverlayWidget(this._editors.modified, b.modified, b.move, 'modified', this._diffModel.get()));
                }
            }));
            const originalCursorPosition = (0, observable_1.observableFromEvent)(this._editors.original.onDidChangeCursorPosition, () => this._editors.original.getPosition());
            const modifiedCursorPosition = (0, observable_1.observableFromEvent)(this._editors.modified.onDidChangeCursorPosition, () => this._editors.modified.getPosition());
            const originalHasFocus = (0, observable_1.observableSignalFromEvent)('original.onDidFocusEditorWidget', e => this._editors.original.onDidFocusEditorWidget(() => setTimeout(() => e(undefined), 0)));
            const modifiedHasFocus = (0, observable_1.observableSignalFromEvent)('modified.onDidFocusEditorWidget', e => this._editors.modified.onDidFocusEditorWidget(() => setTimeout(() => e(undefined), 0)));
            let lastChangedEditor = 'modified';
            this._register((0, observable_1.autorunHandleChanges)({
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
                const m = this._diffModel.read(reader);
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
    exports.MovedBlocksLinesPart = MovedBlocksLinesPart;
    class LinesLayout {
        static compute(lines) {
            const setsPerTrack = [];
            const trackPerLineIdx = [];
            for (const line of lines) {
                let trackIdx = setsPerTrack.findIndex(set => !set.intersectsStrict(line));
                if (trackIdx === -1) {
                    const maxTrackCount = 6;
                    if (setsPerTrack.length >= maxTrackCount) {
                        trackIdx = (0, arraysFind_1.findMaxIdxBy)(setsPerTrack, (0, arrays_1.compareBy)(set => set.intersectWithRangeLength(line), arrays_1.numberComparator));
                    }
                    else {
                        trackIdx = setsPerTrack.length;
                        setsPerTrack.push(new offsetRange_1.OffsetRangeSet());
                    }
                }
                setsPerTrack[trackIdx].addRange(line);
                trackPerLineIdx.push(trackIdx);
            }
            return new LinesLayout(setsPerTrack.length, trackPerLineIdx);
        }
        constructor(_trackCount, trackPerLineIdx) {
            this._trackCount = _trackCount;
            this.trackPerLineIdx = trackPerLineIdx;
        }
        getTrack(lineIdx) {
            return this.trackPerLineIdx[lineIdx];
        }
        getTrackCount() {
            return this._trackCount;
        }
    }
    class MovedBlockOverlayWidget extends utils_1.ViewZoneOverlayWidget {
        constructor(_editor, _viewZone, _move, _kind, _diffModel) {
            const root = (0, dom_1.h)('div.diff-hidden-lines-widget');
            super(_editor, _viewZone, root.root);
            this._editor = _editor;
            this._move = _move;
            this._kind = _kind;
            this._diffModel = _diffModel;
            this._nodes = (0, dom_1.h)('div.diff-moved-code-block', { style: { marginRight: '4px' } }, [
                (0, dom_1.h)('div.text-content@textContent'),
                (0, dom_1.h)('div.action-bar@actionBar'),
            ]);
            root.root.appendChild(this._nodes.root);
            const editorLayout = (0, observable_1.observableFromEvent)(this._editor.onDidLayoutChange, () => this._editor.getLayoutInfo());
            this._register((0, utils_1.applyStyle)(this._nodes.root, {
                paddingRight: editorLayout.map(l => l.verticalScrollbarWidth)
            }));
            let text;
            if (_move.changes.length > 0) {
                text = this._kind === 'original' ? (0, nls_1.localize)('codeMovedToWithChanges', 'Code moved with changes to line {0}-{1}', this._move.lineRangeMapping.modified.startLineNumber, this._move.lineRangeMapping.modified.endLineNumberExclusive - 1) : (0, nls_1.localize)('codeMovedFromWithChanges', 'Code moved with changes from line {0}-{1}', this._move.lineRangeMapping.original.startLineNumber, this._move.lineRangeMapping.original.endLineNumberExclusive - 1);
            }
            else {
                text = this._kind === 'original' ? (0, nls_1.localize)('codeMovedTo', 'Code moved to line {0}-{1}', this._move.lineRangeMapping.modified.startLineNumber, this._move.lineRangeMapping.modified.endLineNumberExclusive - 1) : (0, nls_1.localize)('codeMovedFrom', 'Code moved from line {0}-{1}', this._move.lineRangeMapping.original.startLineNumber, this._move.lineRangeMapping.original.endLineNumberExclusive - 1);
            }
            const actionBar = this._register(new actionbar_1.ActionBar(this._nodes.actionBar, {
                highlightToggledItems: true,
            }));
            const caption = new actions_1.Action('', text, '', false);
            actionBar.push(caption, { icon: false, label: true });
            const actionCompare = new actions_1.Action('', 'Compare', themables_1.ThemeIcon.asClassName(codicons_1.Codicon.compareChanges), true, () => {
                this._editor.focus();
                this._diffModel.movedTextToCompare.set(this._diffModel.movedTextToCompare.get() === _move ? undefined : this._move, undefined);
            });
            this._register((0, observable_1.autorun)(reader => {
                const isActive = this._diffModel.movedTextToCompare.read(reader) === _move;
                actionCompare.checked = isActive;
            }));
            actionBar.push(actionCompare, { icon: false, label: true });
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW92ZWRCbG9ja3NMaW5lcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL3dpZGdldC9kaWZmRWRpdG9yL21vdmVkQmxvY2tzTGluZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBcUJoRyxNQUFhLG9CQUFxQixTQUFRLHNCQUFVO2lCQUM1QiwwQkFBcUIsR0FBRyxDQUFDLEFBQUosQ0FBSztRQVNqRCxZQUNrQixZQUF5QixFQUN6QixVQUF3RCxFQUN4RCx5QkFBK0QsRUFDL0QseUJBQStELEVBQy9ELFFBQTJCO1lBRTVDLEtBQUssRUFBRSxDQUFDO1lBTlMsaUJBQVksR0FBWixZQUFZLENBQWE7WUFDekIsZUFBVSxHQUFWLFVBQVUsQ0FBOEM7WUFDeEQsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUFzQztZQUMvRCw4QkFBeUIsR0FBekIseUJBQXlCLENBQXNDO1lBQy9ELGFBQVEsR0FBUixRQUFRLENBQW1CO1lBWDVCLHVCQUFrQixHQUFHLElBQUEsZ0NBQW1CLEVBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztZQUNoSSx1QkFBa0IsR0FBRyxJQUFBLGdDQUFtQixFQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7WUFDaEksc0JBQWlCLEdBQUcsSUFBQSxzQ0FBeUIsRUFBQyxzQkFBc0IsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBRXBILFVBQUssR0FBRyxJQUFBLDRCQUFlLEVBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBd0doQyxvQ0FBK0IsR0FBRyxJQUFBLHNDQUF5QixFQUFDLCtCQUErQixFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFDMUksb0NBQStCLEdBQUcsSUFBQSxzQ0FBeUIsRUFBQywrQkFBK0IsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBRTFJLFdBQU0sR0FBRyxJQUFBLDZCQUFnQixFQUFDLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUM1RCx5QkFBeUI7Z0JBRXpCLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUFFLENBQUM7Z0JBQ2hDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUMzQyxNQUFNLEtBQUssR0FBRyxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxVQUFVLENBQUM7Z0JBQ25ELElBQUksQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQ2pDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztvQkFDN0IsT0FBTztpQkFDUDtnQkFFRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUVwQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM3RCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM1RCxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsT0FBTyxFQUFFO29CQUMxQixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7b0JBQzdCLE9BQU87aUJBQ1A7Z0JBRUQsSUFBSSxDQUFDLCtCQUErQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDbEQsSUFBSSxDQUFDLCtCQUErQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFFbEQsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO29CQUNoQyxTQUFTLGdCQUFnQixDQUFDLEtBQWdCLEVBQUUsTUFBbUI7d0JBQzlELE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFDO3dCQUNuRSxNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLHNCQUFzQixFQUFFLElBQUksQ0FBQyxDQUFDO3dCQUMxRSxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDdEIsQ0FBQztvQkFFRCxNQUFNLEtBQUssR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ3ZGLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ3pELE1BQU0sR0FBRyxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDckYsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFFdkQsTUFBTSxJQUFJLEdBQUcsS0FBSyxHQUFHLFdBQVcsQ0FBQztvQkFDakMsTUFBTSxFQUFFLEdBQUcsR0FBRyxHQUFHLFNBQVMsQ0FBQztvQkFFM0IsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7b0JBQ2pDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUVwQyxPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUkseUJBQVcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSxLQUFLLEVBQUUsZUFBZSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQztnQkFDaEgsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFBLDRCQUFtQixFQUM3QixJQUFBLGtCQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDLGVBQWUsRUFBRSwwQkFBaUIsQ0FBQyxFQUMxRSxJQUFBLGtCQUFTLEVBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLEVBQUUseUJBQWdCLENBQUMsQ0FDcEgsQ0FBQyxDQUFDO2dCQUVILE1BQU0sTUFBTSxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUU1RCxNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUM7Z0JBQ25CLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQztnQkFDckQsTUFBTSxhQUFhLEdBQUcsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLE9BQU8sR0FBRyxDQUFDLENBQUM7Z0JBQ3RFLE1BQU0sS0FBSyxHQUFHLFlBQVksR0FBRyxhQUFhLEdBQUcsQ0FBQyxPQUFPLENBQUMsV0FBVyxHQUFHLG9CQUFvQixDQUFDLHFCQUFxQixDQUFDLENBQUM7Z0JBRWhILElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDWixLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtvQkFDekIsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDbkMsTUFBTSxTQUFTLEdBQUcsWUFBWSxHQUFHLE9BQU8sR0FBRyxLQUFLLEdBQUcsRUFBRSxDQUFDO29CQUV0RCxNQUFNLFdBQVcsR0FBRyxFQUFFLENBQUM7b0JBQ3ZCLE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQztvQkFDdEIsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDO29CQUVwQixNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDO29CQUN0RSxNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUM7b0JBQ3RCLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsNEJBQTRCLEVBQUUsTUFBTSxDQUFDLENBQUM7b0JBQzVFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7b0JBQ3RDLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxHQUFHLFNBQVMsRUFBRSxDQUFDLENBQUM7b0JBQy9DLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxVQUFVLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDdEQsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsR0FBRyxTQUFTLEVBQUUsQ0FBQyxDQUFDO29CQUMzQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxHQUFHLFVBQVUsRUFBRSxDQUFDLENBQUM7b0JBQzdDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUVoQyxNQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDLDRCQUE0QixFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUV0RSxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDLDRCQUE0QixFQUFFLE1BQU0sQ0FBQyxDQUFDO29CQUU1RSxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxNQUFNLFNBQVMsSUFBSSxJQUFJLENBQUMsSUFBSSxNQUFNLFNBQVMsSUFBSSxJQUFJLENBQUMsRUFBRSxNQUFNLEtBQUssR0FBRyxVQUFVLElBQUksSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQ3ZJLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO29CQUNsQyxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUVwQixNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDLDRCQUE0QixFQUFFLFNBQVMsQ0FBQyxDQUFDO29CQUNyRixVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFFbEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFBLG9CQUFPLEVBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQzFCLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7d0JBQ3ZGLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7b0JBQzlGLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBRUosVUFBVSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsR0FBRyxLQUFLLEdBQUcsVUFBVSxJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsV0FBVyxHQUFHLENBQUMsSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLEVBQUUsSUFBSSxLQUFLLEdBQUcsVUFBVSxJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsV0FBVyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQy9KLENBQUMsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBRTFCLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUU3Qjs7Ozs7Ozt5QkFPSztvQkFFTCxHQUFHLEVBQUUsQ0FBQztpQkFDTjtnQkFFRCxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDMUMsQ0FBQyxDQUFDLENBQUM7WUE3TUYsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDLDRCQUE0QixFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzlFLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQzFELElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM3QyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUEsd0JBQVksRUFBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUUzRCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUEsb0JBQU8sRUFBQyxNQUFNLENBQUMsRUFBRTtnQkFDL0IseURBQXlEO2dCQUN6RCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUN6RCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUMxRCxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO29CQUNwQixPQUFPO2lCQUNQO2dCQUVELElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixJQUFJLENBQUM7Z0JBQzNFLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQztnQkFDaEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksQ0FBQyxXQUFXLEdBQUcsb0JBQW9CLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUMxSixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFBLDBDQUE2QixFQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBRTNELE1BQU0sbUJBQW1CLEdBQUcsSUFBQSxvQkFBTyxFQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUM1QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDM0MsTUFBTSxDQUFDLEdBQUcsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ25DLElBQUksQ0FBQyxDQUFDLEVBQUU7b0JBQUUsT0FBTyxFQUFFLENBQUM7aUJBQUU7Z0JBQ3RCLE9BQU8sQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUNoQyxJQUFJO29CQUNKLFFBQVEsRUFBRSxJQUFJLDJCQUFtQixDQUFDLElBQUEsNEJBQWUsRUFBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQzFHLFFBQVEsRUFBRSxJQUFJLDJCQUFtQixDQUFDLElBQUEsNEJBQWUsRUFBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7aUJBQzFHLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUEsc0JBQWMsRUFBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JILElBQUksQ0FBQyxTQUFTLENBQUMsSUFBQSxzQkFBYyxFQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFckgsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFBLDZCQUFnQixFQUFDLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUNqRCxNQUFNLE1BQU0sR0FBRyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ2hELEtBQUssTUFBTSxDQUFDLElBQUksTUFBTSxFQUFFO29CQUN2QixLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksdUJBQXVCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRyxDQUFDLENBQUMsQ0FBQztvQkFDdkgsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLHVCQUF1QixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUcsQ0FBQyxDQUFDLENBQUM7aUJBQ3ZIO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLE1BQU0sc0JBQXNCLEdBQUcsSUFBQSxnQ0FBbUIsRUFBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1lBQ2pKLE1BQU0sc0JBQXNCLEdBQUcsSUFBQSxnQ0FBbUIsRUFBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1lBQ2pKLE1BQU0sZ0JBQWdCLEdBQUcsSUFBQSxzQ0FBeUIsRUFDakQsaUNBQWlDLEVBQ2pDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsc0JBQXNCLENBQUMsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUMzRixDQUFDO1lBQ0YsTUFBTSxnQkFBZ0IsR0FBRyxJQUFBLHNDQUF5QixFQUNqRCxpQ0FBaUMsRUFDakMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQzNGLENBQUM7WUFFRixJQUFJLGlCQUFpQixHQUE0QixVQUFVLENBQUM7WUFFNUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFBLGlDQUFvQixFQUFDO2dCQUNuQyx3QkFBd0IsRUFBRSxHQUFHLEVBQUUsQ0FBQyxTQUFTO2dCQUN6QyxZQUFZLEVBQUUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLEVBQUU7b0JBQzlCLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO3dCQUFFLGlCQUFpQixHQUFHLFVBQVUsQ0FBQztxQkFBRTtvQkFDeEUsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLEVBQUU7d0JBQUUsaUJBQWlCLEdBQUcsVUFBVSxDQUFDO3FCQUFFO29CQUN4RSxPQUFPLElBQUksQ0FBQztnQkFDYixDQUFDO2FBQ0QsRUFBRSxNQUFNLENBQUMsRUFBRTtnQkFDWCxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzlCLGdCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFFOUIsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3ZDLElBQUksQ0FBQyxDQUFDLEVBQUU7b0JBQUUsT0FBTztpQkFBRTtnQkFDbkIsTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBRWpDLElBQUksU0FBUyxHQUEwQixTQUFTLENBQUM7Z0JBRWpELElBQUksSUFBSSxJQUFJLGlCQUFpQixLQUFLLFVBQVUsRUFBRTtvQkFDN0MsTUFBTSxXQUFXLEdBQUcsc0JBQXNCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUN4RCxJQUFJLFdBQVcsRUFBRTt3QkFDaEIsU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7cUJBQ3BHO2lCQUNEO2dCQUVELElBQUksSUFBSSxJQUFJLGlCQUFpQixLQUFLLFVBQVUsRUFBRTtvQkFDN0MsTUFBTSxXQUFXLEdBQUcsc0JBQXNCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUN4RCxJQUFJLFdBQVcsRUFBRTt3QkFDaEIsU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7cUJBQ3BHO2lCQUNEO2dCQUVELElBQUksU0FBUyxLQUFLLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsRUFBRTtvQkFDN0MsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7aUJBQy9DO2dCQUNELENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNqQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQzs7SUE5R0Ysb0RBaU9DO0lBRUQsTUFBTSxXQUFXO1FBQ1QsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFvQjtZQUN6QyxNQUFNLFlBQVksR0FBcUIsRUFBRSxDQUFDO1lBQzFDLE1BQU0sZUFBZSxHQUFhLEVBQUUsQ0FBQztZQUVyQyxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtnQkFDekIsSUFBSSxRQUFRLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQzFFLElBQUksUUFBUSxLQUFLLENBQUMsQ0FBQyxFQUFFO29CQUNwQixNQUFNLGFBQWEsR0FBRyxDQUFDLENBQUM7b0JBQ3hCLElBQUksWUFBWSxDQUFDLE1BQU0sSUFBSSxhQUFhLEVBQUU7d0JBQ3pDLFFBQVEsR0FBRyxJQUFBLHlCQUFZLEVBQUMsWUFBWSxFQUFFLElBQUEsa0JBQVMsRUFBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsRUFBRSx5QkFBZ0IsQ0FBQyxDQUFDLENBQUM7cUJBQzlHO3lCQUFNO3dCQUNOLFFBQVEsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDO3dCQUMvQixZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksNEJBQWMsRUFBRSxDQUFDLENBQUM7cUJBQ3hDO2lCQUNEO2dCQUNELFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3RDLGVBQWUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDL0I7WUFFRCxPQUFPLElBQUksV0FBVyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFDOUQsQ0FBQztRQUVELFlBQ2tCLFdBQW1CLEVBQ25CLGVBQXlCO1lBRHpCLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1lBQ25CLG9CQUFlLEdBQWYsZUFBZSxDQUFVO1FBQ3ZDLENBQUM7UUFFTCxRQUFRLENBQUMsT0FBZTtZQUN2QixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUVELGFBQWE7WUFDWixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDekIsQ0FBQztLQUNEO0lBRUQsTUFBTSx1QkFBd0IsU0FBUSw2QkFBcUI7UUFNMUQsWUFDa0IsT0FBb0IsRUFDckMsU0FBOEIsRUFDYixLQUFnQixFQUNoQixLQUE4QixFQUM5QixVQUErQjtZQUVoRCxNQUFNLElBQUksR0FBRyxJQUFBLE9BQUMsRUFBQyw4QkFBOEIsQ0FBQyxDQUFDO1lBQy9DLEtBQUssQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQVBwQixZQUFPLEdBQVAsT0FBTyxDQUFhO1lBRXBCLFVBQUssR0FBTCxLQUFLLENBQVc7WUFDaEIsVUFBSyxHQUFMLEtBQUssQ0FBeUI7WUFDOUIsZUFBVSxHQUFWLFVBQVUsQ0FBcUI7WUFWaEMsV0FBTSxHQUFHLElBQUEsT0FBQyxFQUFDLDJCQUEyQixFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7Z0JBQzNGLElBQUEsT0FBQyxFQUFDLDhCQUE4QixDQUFDO2dCQUNqQyxJQUFBLE9BQUMsRUFBQywwQkFBMEIsQ0FBQzthQUM3QixDQUFDLENBQUM7WUFXRixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXhDLE1BQU0sWUFBWSxHQUFHLElBQUEsZ0NBQW1CLEVBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7WUFFN0csSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFBLGtCQUFVLEVBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUU7Z0JBQzNDLFlBQVksRUFBRSxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLHNCQUFzQixDQUFDO2FBQzdELENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxJQUFZLENBQUM7WUFFakIsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQzdCLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBQSxjQUFRLEVBQzFDLHdCQUF3QixFQUN4Qix5Q0FBeUMsRUFDekMsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUNwRCxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsR0FBRyxDQUFDLENBQy9ELENBQUMsQ0FBQyxDQUFDLElBQUEsY0FBUSxFQUNYLDBCQUEwQixFQUMxQiwyQ0FBMkMsRUFDM0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUNwRCxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsR0FBRyxDQUFDLENBQy9ELENBQUM7YUFDRjtpQkFBTTtnQkFDTixJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUEsY0FBUSxFQUMxQyxhQUFhLEVBQ2IsNEJBQTRCLEVBQzVCLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFDcEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsc0JBQXNCLEdBQUcsQ0FBQyxDQUMvRCxDQUFDLENBQUMsQ0FBQyxJQUFBLGNBQVEsRUFDWCxlQUFlLEVBQ2YsOEJBQThCLEVBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFDcEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsc0JBQXNCLEdBQUcsQ0FBQyxDQUMvRCxDQUFDO2FBQ0Y7WUFFRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUkscUJBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRTtnQkFDckUscUJBQXFCLEVBQUUsSUFBSTthQUMzQixDQUFDLENBQUMsQ0FBQztZQUVKLE1BQU0sT0FBTyxHQUFHLElBQUksZ0JBQU0sQ0FDekIsRUFBRSxFQUNGLElBQUksRUFDSixFQUFFLEVBQ0YsS0FBSyxDQUNMLENBQUM7WUFDRixTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFFdEQsTUFBTSxhQUFhLEdBQUcsSUFBSSxnQkFBTSxDQUMvQixFQUFFLEVBQ0YsU0FBUyxFQUNULHFCQUFTLENBQUMsV0FBVyxDQUFDLGtCQUFPLENBQUMsY0FBYyxDQUFDLEVBQzdDLElBQUksRUFDSixHQUFHLEVBQUU7Z0JBQ0osSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDckIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNoSSxDQUFDLENBQ0QsQ0FBQztZQUNGLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBQSxvQkFBTyxFQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUMvQixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxLQUFLLENBQUM7Z0JBQzNFLGFBQWEsQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDO1lBQ2xDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDN0QsQ0FBQztLQUNEIn0=