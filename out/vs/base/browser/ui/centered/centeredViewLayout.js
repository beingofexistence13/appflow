/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/splitview/splitview", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, dom_1, splitview_1, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CenteredViewLayout = void 0;
    const defaultState = {
        targetWidth: 900,
        leftMarginRatio: 0.1909,
        rightMarginRatio: 0.1909,
    };
    const distributeSizing = { type: 'distribute' };
    function createEmptyView(background) {
        const element = (0, dom_1.$)('.centered-layout-margin');
        element.style.height = '100%';
        if (background) {
            element.style.backgroundColor = background.toString();
        }
        return {
            element,
            layout: () => undefined,
            minimumSize: 60,
            maximumSize: Number.POSITIVE_INFINITY,
            onDidChange: event_1.Event.None
        };
    }
    function toSplitViewView(view, getHeight) {
        return {
            element: view.element,
            get maximumSize() { return view.maximumWidth; },
            get minimumSize() { return view.minimumWidth; },
            onDidChange: event_1.Event.map(view.onDidChange, e => e && e.width),
            layout: (size, offset, ctx) => view.layout(size, getHeight(), ctx?.top ?? 0, (ctx?.left ?? 0) + offset)
        };
    }
    class CenteredViewLayout {
        constructor(container, view, state = { ...defaultState }) {
            this.container = container;
            this.view = view;
            this.state = state;
            this.lastLayoutPosition = { width: 0, height: 0, left: 0, top: 0 };
            this.didLayout = false;
            this.splitViewDisposables = new lifecycle_1.DisposableStore();
            this.centeredLayoutFixedWidth = true;
            this._boundarySashes = {};
            this.container.appendChild(this.view.element);
            // Make sure to hide the split view overflow like sashes #52892
            this.container.style.overflow = 'hidden';
        }
        get minimumWidth() { return this.splitView ? this.splitView.minimumSize : this.view.minimumWidth; }
        get maximumWidth() { return this.splitView ? this.splitView.maximumSize : this.view.maximumWidth; }
        get minimumHeight() { return this.view.minimumHeight; }
        get maximumHeight() { return this.view.maximumHeight; }
        get onDidChange() { return this.view.onDidChange; }
        get boundarySashes() { return this._boundarySashes; }
        set boundarySashes(boundarySashes) {
            this._boundarySashes = boundarySashes;
            if (!this.splitView) {
                return;
            }
            this.splitView.orthogonalStartSash = boundarySashes.top;
            this.splitView.orthogonalEndSash = boundarySashes.bottom;
        }
        layout(width, height, top, left) {
            this.lastLayoutPosition = { width, height, top, left };
            if (this.splitView) {
                this.splitView.layout(width, this.lastLayoutPosition);
                if (!this.didLayout || this.centeredLayoutFixedWidth) {
                    this.resizeSplitViews();
                }
            }
            else {
                this.view.layout(width, height, top, left);
            }
            this.didLayout = true;
        }
        resizeSplitViews() {
            if (!this.splitView) {
                return;
            }
            if (this.centeredLayoutFixedWidth) {
                const centerViewWidth = Math.min(this.lastLayoutPosition.width, this.state.targetWidth);
                const marginWidthFloat = (this.lastLayoutPosition.width - centerViewWidth) / 2;
                this.splitView.resizeView(0, Math.floor(marginWidthFloat));
                this.splitView.resizeView(1, centerViewWidth);
                this.splitView.resizeView(2, Math.ceil(marginWidthFloat));
            }
            else {
                const leftMargin = this.state.leftMarginRatio * this.lastLayoutPosition.width;
                const rightMargin = this.state.rightMarginRatio * this.lastLayoutPosition.width;
                const center = this.lastLayoutPosition.width - leftMargin - rightMargin;
                this.splitView.resizeView(0, leftMargin);
                this.splitView.resizeView(1, center);
                this.splitView.resizeView(2, rightMargin);
            }
        }
        setFixedWidth(option) {
            this.centeredLayoutFixedWidth = option;
            if (!!this.splitView) {
                this.updateState();
                this.resizeSplitViews();
            }
        }
        updateState() {
            if (!!this.splitView) {
                this.state.targetWidth = this.splitView.getViewSize(1);
                this.state.leftMarginRatio = this.splitView.getViewSize(0) / this.lastLayoutPosition.width;
                this.state.rightMarginRatio = this.splitView.getViewSize(2) / this.lastLayoutPosition.width;
            }
        }
        isActive() {
            return !!this.splitView;
        }
        styles(style) {
            this.style = style;
            if (this.splitView && this.emptyViews) {
                this.splitView.style(this.style);
                this.emptyViews[0].element.style.backgroundColor = this.style.background.toString();
                this.emptyViews[1].element.style.backgroundColor = this.style.background.toString();
            }
        }
        activate(active) {
            if (active === this.isActive()) {
                return;
            }
            if (active) {
                this.container.removeChild(this.view.element);
                this.splitView = new splitview_1.SplitView(this.container, {
                    inverseAltBehavior: true,
                    orientation: 1 /* Orientation.HORIZONTAL */,
                    styles: this.style
                });
                this.splitView.orthogonalStartSash = this.boundarySashes.top;
                this.splitView.orthogonalEndSash = this.boundarySashes.bottom;
                this.splitViewDisposables.add(this.splitView.onDidSashChange(() => {
                    if (!!this.splitView) {
                        this.updateState();
                    }
                }));
                this.splitViewDisposables.add(this.splitView.onDidSashReset(() => {
                    this.state = { ...defaultState };
                    this.resizeSplitViews();
                }));
                this.splitView.layout(this.lastLayoutPosition.width, this.lastLayoutPosition);
                const backgroundColor = this.style ? this.style.background : undefined;
                this.emptyViews = [createEmptyView(backgroundColor), createEmptyView(backgroundColor)];
                this.splitView.addView(this.emptyViews[0], distributeSizing, 0);
                this.splitView.addView(toSplitViewView(this.view, () => this.lastLayoutPosition.height), distributeSizing, 1);
                this.splitView.addView(this.emptyViews[1], distributeSizing, 2);
                this.resizeSplitViews();
            }
            else {
                if (this.splitView) {
                    this.container.removeChild(this.splitView.el);
                }
                this.splitViewDisposables.clear();
                this.splitView?.dispose();
                this.splitView = undefined;
                this.emptyViews = undefined;
                this.container.appendChild(this.view.element);
                this.view.layout(this.lastLayoutPosition.width, this.lastLayoutPosition.height, this.lastLayoutPosition.top, this.lastLayoutPosition.left);
            }
        }
        isDefault(state) {
            if (this.centeredLayoutFixedWidth) {
                return state.targetWidth === defaultState.targetWidth;
            }
            else {
                return state.leftMarginRatio === defaultState.leftMarginRatio
                    && state.rightMarginRatio === defaultState.rightMarginRatio;
            }
        }
        dispose() {
            this.splitViewDisposables.dispose();
            if (this.splitView) {
                this.splitView.dispose();
                this.splitView = undefined;
            }
        }
    }
    exports.CenteredViewLayout = CenteredViewLayout;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VudGVyZWRWaWV3TGF5b3V0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL3VpL2NlbnRlcmVkL2NlbnRlcmVkVmlld0xheW91dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFtQmhHLE1BQU0sWUFBWSxHQUFzQjtRQUN2QyxXQUFXLEVBQUUsR0FBRztRQUNoQixlQUFlLEVBQUUsTUFBTTtRQUN2QixnQkFBZ0IsRUFBRSxNQUFNO0tBQ3hCLENBQUM7SUFFRixNQUFNLGdCQUFnQixHQUFxQixFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsQ0FBQztJQUVsRSxTQUFTLGVBQWUsQ0FBQyxVQUE2QjtRQUNyRCxNQUFNLE9BQU8sR0FBRyxJQUFBLE9BQUMsRUFBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQzdDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUM5QixJQUFJLFVBQVUsRUFBRTtZQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUN0RDtRQUVELE9BQU87WUFDTixPQUFPO1lBQ1AsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLFNBQVM7WUFDdkIsV0FBVyxFQUFFLEVBQUU7WUFDZixXQUFXLEVBQUUsTUFBTSxDQUFDLGlCQUFpQjtZQUNyQyxXQUFXLEVBQUUsYUFBSyxDQUFDLElBQUk7U0FDdkIsQ0FBQztJQUNILENBQUM7SUFFRCxTQUFTLGVBQWUsQ0FBQyxJQUFXLEVBQUUsU0FBdUI7UUFDNUQsT0FBTztZQUNOLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztZQUNyQixJQUFJLFdBQVcsS0FBSyxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQy9DLElBQUksV0FBVyxLQUFLLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDL0MsV0FBVyxFQUFFLGFBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQzNELE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDO1NBQ3ZHLENBQUM7SUFDSCxDQUFDO0lBTUQsTUFBYSxrQkFBa0I7UUFVOUIsWUFDUyxTQUFzQixFQUN0QixJQUFXLEVBQ1osUUFBMkIsRUFBRSxHQUFHLFlBQVksRUFBRTtZQUY3QyxjQUFTLEdBQVQsU0FBUyxDQUFhO1lBQ3RCLFNBQUksR0FBSixJQUFJLENBQU87WUFDWixVQUFLLEdBQUwsS0FBSyxDQUF5QztZQVY5Qyx1QkFBa0IsR0FBeUIsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFFcEYsY0FBUyxHQUFHLEtBQUssQ0FBQztZQUVULHlCQUFvQixHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBQ3RELDZCQUF3QixHQUFHLElBQUksQ0FBQztZQWtCaEMsb0JBQWUsR0FBb0IsRUFBRSxDQUFDO1lBWDdDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDOUMsK0RBQStEO1lBQy9ELElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDMUMsQ0FBQztRQUVELElBQUksWUFBWSxLQUFhLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUMzRyxJQUFJLFlBQVksS0FBYSxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFDM0csSUFBSSxhQUFhLEtBQWEsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7UUFDL0QsSUFBSSxhQUFhLEtBQWEsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7UUFDL0QsSUFBSSxXQUFXLEtBQW1DLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBR2pGLElBQUksY0FBYyxLQUFzQixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBQ3RFLElBQUksY0FBYyxDQUFDLGNBQStCO1lBQ2pELElBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO1lBRXRDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNwQixPQUFPO2FBQ1A7WUFFRCxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixHQUFHLGNBQWMsQ0FBQyxHQUFHLENBQUM7WUFDeEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDO1FBQzFELENBQUM7UUFFRCxNQUFNLENBQUMsS0FBYSxFQUFFLE1BQWMsRUFBRSxHQUFXLEVBQUUsSUFBWTtZQUM5RCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQztZQUN2RCxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ25CLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztnQkFDdEQsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLHdCQUF3QixFQUFFO29CQUNyRCxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztpQkFDeEI7YUFDRDtpQkFBTTtnQkFDTixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQzthQUMzQztZQUVELElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLENBQUM7UUFFTyxnQkFBZ0I7WUFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ3BCLE9BQU87YUFDUDtZQUNELElBQUksSUFBSSxDQUFDLHdCQUF3QixFQUFFO2dCQUNsQyxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDeEYsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMvRSxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7Z0JBQzNELElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxlQUFlLENBQUMsQ0FBQztnQkFDOUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO2FBQzFEO2lCQUFNO2dCQUNOLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUM7Z0JBQzlFLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQztnQkFDaEYsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssR0FBRyxVQUFVLEdBQUcsV0FBVyxDQUFDO2dCQUN4RSxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBQ3pDLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDckMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO2FBQzFDO1FBQ0YsQ0FBQztRQUVELGFBQWEsQ0FBQyxNQUFlO1lBQzVCLElBQUksQ0FBQyx3QkFBd0IsR0FBRyxNQUFNLENBQUM7WUFDdkMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDckIsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNuQixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQzthQUN4QjtRQUNGLENBQUM7UUFFTyxXQUFXO1lBQ2xCLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ3JCLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2RCxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDO2dCQUMzRixJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUM7YUFDNUY7UUFDRixDQUFDO1FBRUQsUUFBUTtZQUNQLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDekIsQ0FBQztRQUVELE1BQU0sQ0FBQyxLQUEwQjtZQUNoQyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNuQixJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDdEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNqQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNwRixJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQ3BGO1FBQ0YsQ0FBQztRQUVELFFBQVEsQ0FBQyxNQUFlO1lBQ3ZCLElBQUksTUFBTSxLQUFLLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDL0IsT0FBTzthQUNQO1lBRUQsSUFBSSxNQUFNLEVBQUU7Z0JBQ1gsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDOUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLHFCQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtvQkFDOUMsa0JBQWtCLEVBQUUsSUFBSTtvQkFDeEIsV0FBVyxnQ0FBd0I7b0JBQ25DLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSztpQkFDbEIsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUM7Z0JBQzdELElBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUM7Z0JBRTlELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFO29CQUNqRSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO3dCQUNyQixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7cUJBQ25CO2dCQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ0osSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUU7b0JBQ2hFLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxHQUFHLFlBQVksRUFBRSxDQUFDO29CQUNqQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDekIsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFSixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2dCQUM5RSxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO2dCQUN2RSxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO2dCQUV2RixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNoRSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzlHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBRWhFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2FBQ3hCO2lCQUFNO2dCQUNOLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtvQkFDbkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDOUM7Z0JBQ0QsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNsQyxJQUFJLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxDQUFDO2dCQUMxQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztnQkFDM0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzlDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUMzSTtRQUNGLENBQUM7UUFFRCxTQUFTLENBQUMsS0FBd0I7WUFDakMsSUFBSSxJQUFJLENBQUMsd0JBQXdCLEVBQUU7Z0JBQ2xDLE9BQU8sS0FBSyxDQUFDLFdBQVcsS0FBSyxZQUFZLENBQUMsV0FBVyxDQUFDO2FBQ3REO2lCQUFNO2dCQUNOLE9BQU8sS0FBSyxDQUFDLGVBQWUsS0FBSyxZQUFZLENBQUMsZUFBZTt1QkFDekQsS0FBSyxDQUFDLGdCQUFnQixLQUFLLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQzthQUM3RDtRQUNGLENBQUM7UUFFRCxPQUFPO1lBQ04sSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxDQUFDO1lBRXBDLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDbkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDekIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7YUFDM0I7UUFDRixDQUFDO0tBQ0Q7SUF0S0QsZ0RBc0tDIn0=