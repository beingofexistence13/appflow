/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/workbench/contrib/mergeEditor/browser/model/mapping", "vs/workbench/contrib/mergeEditor/browser/utils"], function (require, exports, lifecycle_1, observable_1, mapping_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$QSb = void 0;
    class $QSb extends lifecycle_1.$kc {
        get a() { return this.h.get()?.model; }
        get f() { return this.s.get().kind === 'columns'; }
        get g() { return this.s.get().kind === 'mixed' && !this.s.get().showBaseAtTop; }
        constructor(h, j, m, n, r, s) {
            super();
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.b = new utils_1.$7ib();
            const handleInput1OnScroll = this.updateScrolling = () => {
                if (!this.a) {
                    return;
                }
                this.m.editor.setScrollTop(this.j.editor.getScrollTop(), 1 /* ScrollType.Immediate */);
                if (this.f) {
                    this.r.editor.setScrollTop(this.j.editor.getScrollTop(), 1 /* ScrollType.Immediate */);
                }
                else {
                    const mappingInput1Result = this.a.input1ResultMapping.get();
                    this.t(this.j.editor, this.r.editor, mappingInput1Result);
                }
                const baseView = this.n.get();
                if (baseView) {
                    if (this.g) {
                        this.n.get()?.editor.setScrollTop(this.j.editor.getScrollTop(), 1 /* ScrollType.Immediate */);
                    }
                    else {
                        const mapping = new mapping_1.$pjb(this.a.baseInput1Diffs.get(), -1).reverse();
                        this.t(this.j.editor, baseView.editor, mapping);
                    }
                }
            };
            this.q.add(this.j.editor.onDidScrollChange(this.b.makeExclusive((c) => {
                if (c.scrollTopChanged) {
                    handleInput1OnScroll();
                }
                if (c.scrollLeftChanged) {
                    this.n.get()?.editor.setScrollLeft(c.scrollLeft, 1 /* ScrollType.Immediate */);
                    this.m.editor.setScrollLeft(c.scrollLeft, 1 /* ScrollType.Immediate */);
                    this.r.editor.setScrollLeft(c.scrollLeft, 1 /* ScrollType.Immediate */);
                }
            })));
            this.q.add(this.m.editor.onDidScrollChange(this.b.makeExclusive((c) => {
                if (!this.a) {
                    return;
                }
                if (c.scrollTopChanged) {
                    this.j.editor.setScrollTop(c.scrollTop, 1 /* ScrollType.Immediate */);
                    if (this.f) {
                        this.r.editor.setScrollTop(this.m.editor.getScrollTop(), 1 /* ScrollType.Immediate */);
                    }
                    else {
                        const mappingInput2Result = this.a.input2ResultMapping.get();
                        this.t(this.m.editor, this.r.editor, mappingInput2Result);
                    }
                    const baseView = this.n.get();
                    if (baseView && this.a) {
                        if (this.g) {
                            this.n.get()?.editor.setScrollTop(c.scrollTop, 1 /* ScrollType.Immediate */);
                        }
                        else {
                            const mapping = new mapping_1.$pjb(this.a.baseInput2Diffs.get(), -1).reverse();
                            this.t(this.m.editor, baseView.editor, mapping);
                        }
                    }
                }
                if (c.scrollLeftChanged) {
                    this.n.get()?.editor.setScrollLeft(c.scrollLeft, 1 /* ScrollType.Immediate */);
                    this.j.editor.setScrollLeft(c.scrollLeft, 1 /* ScrollType.Immediate */);
                    this.r.editor.setScrollLeft(c.scrollLeft, 1 /* ScrollType.Immediate */);
                }
            })));
            this.q.add(this.r.editor.onDidScrollChange(this.b.makeExclusive((c) => {
                if (c.scrollTopChanged) {
                    if (this.f) {
                        this.j.editor.setScrollTop(c.scrollTop, 1 /* ScrollType.Immediate */);
                        this.m.editor.setScrollTop(c.scrollTop, 1 /* ScrollType.Immediate */);
                    }
                    else {
                        const mapping1 = this.a?.resultInput1Mapping.get();
                        this.t(this.r.editor, this.j.editor, mapping1);
                        const mapping2 = this.a?.resultInput2Mapping.get();
                        this.t(this.r.editor, this.m.editor, mapping2);
                    }
                    const baseMapping = this.a?.resultBaseMapping.get();
                    const baseView = this.n.get();
                    if (baseView && this.a) {
                        this.t(this.r.editor, baseView.editor, baseMapping);
                    }
                }
                if (c.scrollLeftChanged) {
                    this.n.get()?.editor?.setScrollLeft(c.scrollLeft, 1 /* ScrollType.Immediate */);
                    this.j.editor.setScrollLeft(c.scrollLeft, 1 /* ScrollType.Immediate */);
                    this.m.editor.setScrollLeft(c.scrollLeft, 1 /* ScrollType.Immediate */);
                }
            })));
            this.q.add((0, observable_1.autorunWithStore)((reader, store) => {
                /** @description set baseViewEditor.onDidScrollChange */
                const baseView = this.n.read(reader);
                if (baseView) {
                    store.add(baseView.editor.onDidScrollChange(this.b.makeExclusive((c) => {
                        if (c.scrollTopChanged) {
                            if (!this.a) {
                                return;
                            }
                            if (this.g) {
                                this.j.editor.setScrollTop(c.scrollTop, 1 /* ScrollType.Immediate */);
                                this.m.editor.setScrollTop(c.scrollTop, 1 /* ScrollType.Immediate */);
                            }
                            else {
                                const baseInput1Mapping = new mapping_1.$pjb(this.a.baseInput1Diffs.get(), -1);
                                this.t(baseView.editor, this.j.editor, baseInput1Mapping);
                                const baseInput2Mapping = new mapping_1.$pjb(this.a.baseInput2Diffs.get(), -1);
                                this.t(baseView.editor, this.m.editor, baseInput2Mapping);
                            }
                            const baseMapping = this.a?.baseResultMapping.get();
                            this.t(baseView.editor, this.r.editor, baseMapping);
                        }
                        if (c.scrollLeftChanged) {
                            this.r.editor.setScrollLeft(c.scrollLeft, 1 /* ScrollType.Immediate */);
                            this.j.editor.setScrollLeft(c.scrollLeft, 1 /* ScrollType.Immediate */);
                            this.m.editor.setScrollLeft(c.scrollLeft, 1 /* ScrollType.Immediate */);
                        }
                    })));
                }
            }));
        }
        t(scrollingEditor, targetEditor, mapping) {
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
    exports.$QSb = $QSb;
});
//# sourceMappingURL=scrollSynchronizer.js.map