/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/workbench/contrib/mergeEditor/browser/model/lineRange"], function (require, exports, dom_1, lifecycle_1, observable_1, lineRange_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorGutter = void 0;
    class EditorGutter extends lifecycle_1.Disposable {
        constructor(_editor, _domNode, itemProvider) {
            super();
            this._editor = _editor;
            this._domNode = _domNode;
            this.itemProvider = itemProvider;
            this.scrollTop = (0, observable_1.observableFromEvent)(this._editor.onDidScrollChange, (e) => /** @description editor.onDidScrollChange */ this._editor.getScrollTop());
            this.isScrollTopZero = this.scrollTop.map((scrollTop) => /** @description isScrollTopZero */ scrollTop === 0);
            this.modelAttached = (0, observable_1.observableFromEvent)(this._editor.onDidChangeModel, (e) => /** @description editor.onDidChangeModel */ this._editor.hasModel());
            this.editorOnDidChangeViewZones = (0, observable_1.observableSignalFromEvent)('onDidChangeViewZones', this._editor.onDidChangeViewZones);
            this.editorOnDidContentSizeChange = (0, observable_1.observableSignalFromEvent)('onDidContentSizeChange', this._editor.onDidContentSizeChange);
            this.domNodeSizeChanged = (0, observable_1.observableSignal)('domNodeSizeChanged');
            this.views = new Map();
            this._domNode.className = 'gutter monaco-editor';
            const scrollDecoration = this._domNode.appendChild((0, dom_1.h)('div.scroll-decoration', { role: 'presentation', ariaHidden: 'true', style: { width: '100%' } })
                .root);
            const o = new ResizeObserver(() => {
                (0, observable_1.transaction)(tx => {
                    /** @description ResizeObserver: size changed */
                    this.domNodeSizeChanged.trigger(tx);
                });
            });
            o.observe(this._domNode);
            this._register((0, lifecycle_1.toDisposable)(() => o.disconnect()));
            this._register((0, observable_1.autorun)(reader => {
                /** @description update scroll decoration */
                scrollDecoration.className = this.isScrollTopZero.read(reader) ? '' : 'scroll-decoration';
            }));
            this._register((0, observable_1.autorun)(reader => /** @description EditorGutter.Render */ this.render(reader)));
        }
        dispose() {
            super.dispose();
            (0, dom_1.reset)(this._domNode);
        }
        render(reader) {
            if (!this.modelAttached.read(reader)) {
                return;
            }
            this.domNodeSizeChanged.read(reader);
            this.editorOnDidChangeViewZones.read(reader);
            this.editorOnDidContentSizeChange.read(reader);
            const scrollTop = this.scrollTop.read(reader);
            const visibleRanges = this._editor.getVisibleRanges();
            const unusedIds = new Set(this.views.keys());
            if (visibleRanges.length > 0) {
                const visibleRange = visibleRanges[0];
                const visibleRange2 = new lineRange_1.LineRange(visibleRange.startLineNumber, visibleRange.endLineNumber - visibleRange.startLineNumber).deltaEnd(1);
                const gutterItems = this.itemProvider.getIntersectingGutterItems(visibleRange2, reader);
                for (const gutterItem of gutterItems) {
                    if (!gutterItem.range.touches(visibleRange2)) {
                        continue;
                    }
                    unusedIds.delete(gutterItem.id);
                    let view = this.views.get(gutterItem.id);
                    if (!view) {
                        const viewDomNode = document.createElement('div');
                        this._domNode.appendChild(viewDomNode);
                        const itemView = this.itemProvider.createView(gutterItem, viewDomNode);
                        view = new ManagedGutterItemView(itemView, viewDomNode);
                        this.views.set(gutterItem.id, view);
                    }
                    else {
                        view.gutterItemView.update(gutterItem);
                    }
                    const top = gutterItem.range.startLineNumber <= this._editor.getModel().getLineCount()
                        ? this._editor.getTopForLineNumber(gutterItem.range.startLineNumber, true) - scrollTop
                        : this._editor.getBottomForLineNumber(gutterItem.range.startLineNumber - 1, false) - scrollTop;
                    const bottom = this._editor.getBottomForLineNumber(gutterItem.range.endLineNumberExclusive - 1, true) - scrollTop;
                    const height = bottom - top;
                    view.domNode.style.top = `${top}px`;
                    view.domNode.style.height = `${height}px`;
                    view.gutterItemView.layout(top, height, 0, this._domNode.clientHeight);
                }
            }
            for (const id of unusedIds) {
                const view = this.views.get(id);
                view.gutterItemView.dispose();
                this._domNode.removeChild(view.domNode);
                this.views.delete(id);
            }
        }
    }
    exports.EditorGutter = EditorGutter;
    class ManagedGutterItemView {
        constructor(gutterItemView, domNode) {
            this.gutterItemView = gutterItemView;
            this.domNode = domNode;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yR3V0dGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbWVyZ2VFZGl0b3IvYnJvd3Nlci92aWV3L2VkaXRvckd1dHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRaEcsTUFBYSxZQUEwRCxTQUFRLHNCQUFVO1FBZXhGLFlBQ2tCLE9BQXlCLEVBQ3pCLFFBQXFCLEVBQ3JCLFlBQW9DO1lBRXJELEtBQUssRUFBRSxDQUFDO1lBSlMsWUFBTyxHQUFQLE9BQU8sQ0FBa0I7WUFDekIsYUFBUSxHQUFSLFFBQVEsQ0FBYTtZQUNyQixpQkFBWSxHQUFaLFlBQVksQ0FBd0I7WUFqQnJDLGNBQVMsR0FBRyxJQUFBLGdDQUFtQixFQUMvQyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUM5QixDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsNENBQTRDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FDL0UsQ0FBQztZQUNlLG9CQUFlLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLG1DQUFtQyxDQUFDLFNBQVMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUN6RyxrQkFBYSxHQUFHLElBQUEsZ0NBQW1CLEVBQ25ELElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQzdCLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQywyQ0FBMkMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUMxRSxDQUFDO1lBRWUsK0JBQTBCLEdBQUcsSUFBQSxzQ0FBeUIsRUFBQyxzQkFBc0IsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFDbEgsaUNBQTRCLEdBQUcsSUFBQSxzQ0FBeUIsRUFBQyx3QkFBd0IsRUFB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