/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/workbench/contrib/mergeEditor/browser/model/lineRange"], function (require, exports, dom_1, lifecycle_1, observable_1, lineRange_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Vjb = void 0;
    class $Vjb extends lifecycle_1.$kc {
        constructor(m, n, r) {
            super();
            this.m = m;
            this.n = n;
            this.r = r;
            this.a = (0, observable_1.observableFromEvent)(this.m.onDidScrollChange, (e) => /** @description editor.onDidScrollChange */ this.m.getScrollTop());
            this.b = this.a.map((scrollTop) => /** @description isScrollTopZero */ scrollTop === 0);
            this.c = (0, observable_1.observableFromEvent)(this.m.onDidChangeModel, (e) => /** @description editor.onDidChangeModel */ this.m.hasModel());
            this.f = (0, observable_1.observableSignalFromEvent)('onDidChangeViewZones', this.m.onDidChangeViewZones);
            this.g = (0, observable_1.observableSignalFromEvent)('onDidContentSizeChange', this.m.onDidContentSizeChange);
            this.j = (0, observable_1.observableSignal)('domNodeSizeChanged');
            this.s = new Map();
            this.n.className = 'gutter monaco-editor';
            const scrollDecoration = this.n.appendChild((0, dom_1.h)('div.scroll-decoration', { role: 'presentation', ariaHidden: 'true', style: { width: '100%' } })
                .root);
            const o = new ResizeObserver(() => {
                (0, observable_1.transaction)(tx => {
                    /** @description ResizeObserver: size changed */
                    this.j.trigger(tx);
                });
            });
            o.observe(this.n);
            this.B((0, lifecycle_1.$ic)(() => o.disconnect()));
            this.B((0, observable_1.autorun)(reader => {
                /** @description update scroll decoration */
                scrollDecoration.className = this.b.read(reader) ? '' : 'scroll-decoration';
            }));
            this.B((0, observable_1.autorun)(reader => /** @description EditorGutter.Render */ this.t(reader)));
        }
        dispose() {
            super.dispose();
            (0, dom_1.$_O)(this.n);
        }
        t(reader) {
            if (!this.c.read(reader)) {
                return;
            }
            this.j.read(reader);
            this.f.read(reader);
            this.g.read(reader);
            const scrollTop = this.a.read(reader);
            const visibleRanges = this.m.getVisibleRanges();
            const unusedIds = new Set(this.s.keys());
            if (visibleRanges.length > 0) {
                const visibleRange = visibleRanges[0];
                const visibleRange2 = new lineRange_1.$6ib(visibleRange.startLineNumber, visibleRange.endLineNumber - visibleRange.startLineNumber).deltaEnd(1);
                const gutterItems = this.r.getIntersectingGutterItems(visibleRange2, reader);
                for (const gutterItem of gutterItems) {
                    if (!gutterItem.range.touches(visibleRange2)) {
                        continue;
                    }
                    unusedIds.delete(gutterItem.id);
                    let view = this.s.get(gutterItem.id);
                    if (!view) {
                        const viewDomNode = document.createElement('div');
                        this.n.appendChild(viewDomNode);
                        const itemView = this.r.createView(gutterItem, viewDomNode);
                        view = new ManagedGutterItemView(itemView, viewDomNode);
                        this.s.set(gutterItem.id, view);
                    }
                    else {
                        view.gutterItemView.update(gutterItem);
                    }
                    const top = gutterItem.range.startLineNumber <= this.m.getModel().getLineCount()
                        ? this.m.getTopForLineNumber(gutterItem.range.startLineNumber, true) - scrollTop
                        : this.m.getBottomForLineNumber(gutterItem.range.startLineNumber - 1, false) - scrollTop;
                    const bottom = this.m.getBottomForLineNumber(gutterItem.range.endLineNumberExclusive - 1, true) - scrollTop;
                    const height = bottom - top;
                    view.domNode.style.top = `${top}px`;
                    view.domNode.style.height = `${height}px`;
                    view.gutterItemView.layout(top, height, 0, this.n.clientHeight);
                }
            }
            for (const id of unusedIds) {
                const view = this.s.get(id);
                view.gutterItemView.dispose();
                this.n.removeChild(view.domNode);
                this.s.delete(id);
            }
        }
    }
    exports.$Vjb = $Vjb;
    class ManagedGutterItemView {
        constructor(gutterItemView, domNode) {
            this.gutterItemView = gutterItemView;
            this.domNode = domNode;
        }
    }
});
//# sourceMappingURL=editorGutter.js.map