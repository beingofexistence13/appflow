/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/workbench/contrib/mergeEditor/browser/model/mapping", "vs/workbench/contrib/mergeEditor/browser/utils"], function (require, exports, lifecycle_1, observable_1, mapping_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ScrollSynchronizer = void 0;
    class ScrollSynchronizer extends lifecycle_1.Disposable {
        get model() { return this.viewModel.get()?.model; }
        get shouldAlignResult() { return this.layout.get().kind === 'columns'; }
        get shouldAlignBase() { return this.layout.get().kind === 'mixed' && !this.layout.get().showBaseAtTop; }
        constructor(viewModel, input1View, input2View, baseView, inputResultView, layout) {
            super();
            this.viewModel = viewModel;
            this.input1View = input1View;
            this.input2View = input2View;
            this.baseView = baseView;
            this.inputResultView = inputResultView;
            this.layout = layout;
            this.reentrancyBarrier = new utils_1.ReentrancyBarrier();
            const handleInput1OnScroll = this.updateScrolling = () => {
                if (!this.model) {
                    return;
                }
                this.input2View.editor.setScrollTop(this.input1View.editor.getScrollTop(), 1 /* ScrollType.Immediate */);
                if (this.shouldAlignResult) {
                    this.inputResultView.editor.setScrollTop(this.input1View.editor.getScrollTop(), 1 /* ScrollType.Immediate */);
                }
                else {
                    const mappingInput1Result = this.model.input1ResultMapping.get();
                    this.synchronizeScrolling(this.input1View.editor, this.inputResultView.editor, mappingInput1Result);
                }
                const baseView = this.baseView.get();
                if (baseView) {
                    if (this.shouldAlignBase) {
                        this.baseView.get()?.editor.setScrollTop(this.input1View.editor.getScrollTop(), 1 /* ScrollType.Immediate */);
                    }
                    else {
                        const mapping = new mapping_1.DocumentLineRangeMap(this.model.baseInput1Diffs.get(), -1).reverse();
                        this.synchronizeScrolling(this.input1View.editor, baseView.editor, mapping);
                    }
                }
            };
            this._store.add(this.input1View.editor.onDidScrollChange(this.reentrancyBarrier.makeExclusive((c) => {
                if (c.scrollTopChanged) {
                    handleInput1OnScroll();
                }
                if (c.scrollLeftChanged) {
                    this.baseView.get()?.editor.setScrollLeft(c.scrollLeft, 1 /* ScrollType.Immediate */);
                    this.input2View.editor.setScrollLeft(c.scrollLeft, 1 /* ScrollType.Immediate */);
                    this.inputResultView.editor.setScrollLeft(c.scrollLeft, 1 /* ScrollType.Immediate */);
                }
            })));
            this._store.add(this.input2View.editor.onDidScrollChange(this.reentrancyBarrier.makeExclusive((c) => {
                if (!this.model) {
                    return;
                }
                if (c.scrollTopChanged) {
                    this.input1View.editor.setScrollTop(c.scrollTop, 1 /* ScrollType.Immediate */);
                    if (this.shouldAlignResult) {
                        this.inputResultView.editor.setScrollTop(this.input2View.editor.getScrollTop(), 1 /* ScrollType.Immediate */);
                    }
                    else {
                        const mappingInput2Result = this.model.input2ResultMapping.get();
                        this.synchronizeScrolling(this.input2View.editor, this.inputResultView.editor, mappingInput2Result);
                    }
                    const baseView = this.baseView.get();
                    if (baseView && this.model) {
                        if (this.shouldAlignBase) {
                            this.baseView.get()?.editor.setScrollTop(c.scrollTop, 1 /* ScrollType.Immediate */);
                        }
                        else {
                            const mapping = new mapping_1.DocumentLineRangeMap(this.model.baseInput2Diffs.get(), -1).reverse();
                            this.synchronizeScrolling(this.input2View.editor, baseView.editor, mapping);
                        }
                    }
                }
                if (c.scrollLeftChanged) {
                    this.baseView.get()?.editor.setScrollLeft(c.scrollLeft, 1 /* ScrollType.Immediate */);
                    this.input1View.editor.setScrollLeft(c.scrollLeft, 1 /* ScrollType.Immediate */);
                    this.inputResultView.editor.setScrollLeft(c.scrollLeft, 1 /* ScrollType.Immediate */);
                }
            })));
            this._store.add(this.inputResultView.editor.onDidScrollChange(this.reentrancyBarrier.makeExclusive((c) => {
                if (c.scrollTopChanged) {
                    if (this.shouldAlignResult) {
                        this.input1View.editor.setScrollTop(c.scrollTop, 1 /* ScrollType.Immediate */);
                        this.input2View.editor.setScrollTop(c.scrollTop, 1 /* ScrollType.Immediate */);
                    }
                    else {
                        const mapping1 = this.model?.resultInput1Mapping.get();
                        this.synchronizeScrolling(this.inputResultView.editor, this.input1View.editor, mapping1);
                        const mapping2 = this.model?.resultInput2Mapping.get();
                        this.synchronizeScrolling(this.inputResultView.editor, this.input2View.editor, mapping2);
                    }
                    const baseMapping = this.model?.resultBaseMapping.get();
                    const baseView = this.baseView.get();
                    if (baseView && this.model) {
                        this.synchronizeScrolling(this.inputResultView.editor, baseView.editor, baseMapping);
                    }
                }
                if (c.scrollLeftChanged) {
                    this.baseView.get()?.editor?.setScrollLeft(c.scrollLeft, 1 /* ScrollType.Immediate */);
                    this.input1View.editor.setScrollLeft(c.scrollLeft, 1 /* ScrollType.Immediate */);
                    this.input2View.editor.setScrollLeft(c.scrollLeft, 1 /* ScrollType.Immediate */);
                }
            })));
            this._store.add((0, observable_1.autorunWithStore)((reader, store) => {
                /** @description set baseViewEditor.onDidScrollChange */
                const baseView = this.baseView.read(reader);
                if (baseView) {
                    store.add(baseView.editor.onDidScrollChange(this.reentrancyBarrier.makeExclusive((c) => {
                        if (c.scrollTopChanged) {
                            if (!this.model) {
                                return;
                            }
                            if (this.shouldAlignBase) {
                                this.input1View.editor.setScrollTop(c.scrollTop, 1 /* ScrollType.Immediate */);
                                this.input2View.editor.setScrollTop(c.scrollTop, 1 /* ScrollType.Immediate */);
                            }
                            else {
                                const baseInput1Mapping = new mapping_1.DocumentLineRangeMap(this.model.baseInput1Diffs.get(), -1);
                                this.synchronizeScrolling(baseView.editor, this.input1View.editor, baseInput1Mapping);
                                const baseInput2Mapping = new mapping_1.DocumentLineRangeMap(this.model.baseInput2Diffs.get(), -1);
                                this.synchronizeScrolling(baseView.editor, this.input2View.editor, baseInput2Mapping);
                            }
                            const baseMapping = this.model?.baseResultMapping.get();
                            this.synchronizeScrolling(baseView.editor, this.inputResultView.editor, baseMapping);
                        }
                        if (c.scrollLeftChanged) {
                            this.inputResultView.editor.setScrollLeft(c.scrollLeft, 1 /* ScrollType.Immediate */);
                            this.input1View.editor.setScrollLeft(c.scrollLeft, 1 /* ScrollType.Immediate */);
                            this.input2View.editor.setScrollLeft(c.scrollLeft, 1 /* ScrollType.Immediate */);
                        }
                    })));
                }
            }));
        }
        synchronizeScrolling(scrollingEditor, targetEditor, mapping) {
            if (!mapping) {
                return;
            }
            const visibleRanges = scrollingEditor.getVisibleRanges();
            if (visibleRanges.length === 0) {
                return;
            }
            const topLineNumber = visibleRanges[0].startLineNumber - 1;
            const result = mapping.project(topLineNumber);
            const sourceRange = result.inputRange;
            const targetRange = result.outputRange;
            const resultStartTopPx = targetEditor.getTopForLineNumber(targetRange.startLineNumber);
            const resultEndPx = targetEditor.getTopForLineNumber(targetRange.endLineNumberExclusive);
            const sourceStartTopPx = scrollingEditor.getTopForLineNumber(sourceRange.startLineNumber);
            const sourceEndPx = scrollingEditor.getTopForLineNumber(sourceRange.endLineNumberExclusive);
            const factor = Math.min((scrollingEditor.getScrollTop() - sourceStartTopPx) / (sourceEndPx - sourceStartTopPx), 1);
            const resultScrollPosition = resultStartTopPx + (resultEndPx - resultStartTopPx) * factor;
            targetEditor.setScrollTop(resultScrollPosition, 1 /* ScrollType.Immediate */);
        }
    }
    exports.ScrollSynchronizer = ScrollSynchronizer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Nyb2xsU3luY2hyb25pemVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbWVyZ2VFZGl0b3IvYnJvd3Nlci92aWV3L3Njcm9sbFN5bmNocm9uaXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFjaEcsTUFBYSxrQkFBbUIsU0FBUSxzQkFBVTtRQUNqRCxJQUFZLEtBQUssS0FBSyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztRQU0zRCxJQUFZLGlCQUFpQixLQUFLLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNoRixJQUFZLGVBQWUsS0FBSyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxLQUFLLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztRQUVoSCxZQUNrQixTQUF3RCxFQUN4RCxVQUErQixFQUMvQixVQUErQixFQUMvQixRQUFxRCxFQUNyRCxlQUFxQyxFQUNyQyxNQUF1QztZQUV4RCxLQUFLLEVBQUUsQ0FBQztZQVBTLGNBQVMsR0FBVCxTQUFTLENBQStDO1lBQ3hELGVBQVUsR0FBVixVQUFVLENBQXFCO1lBQy9CLGVBQVUsR0FBVixVQUFVLENBQXFCO1lBQy9CLGFBQVEsR0FBUixRQUFRLENBQTZDO1lBQ3JELG9CQUFlLEdBQWYsZUFBZSxDQUFzQjtZQUNyQyxXQUFNLEdBQU4sTUFBTSxDQUFpQztZQWJ4QyxzQkFBaUIsR0FBRyxJQUFJLHlCQUFpQixFQUFFLENBQUM7WUFpQjVELE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLGVBQWUsR0FB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