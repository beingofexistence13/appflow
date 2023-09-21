/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/event"], function (require, exports, lifecycle_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ElementSizeObserver = void 0;
    class ElementSizeObserver extends lifecycle_1.Disposable {
        constructor(referenceDomElement, dimension) {
            super();
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._referenceDomElement = referenceDomElement;
            this._width = -1;
            this._height = -1;
            this._resizeObserver = null;
            this.measureReferenceDomElement(false, dimension);
        }
        dispose() {
            this.stopObserving();
            super.dispose();
        }
        getWidth() {
            return this._width;
        }
        getHeight() {
            return this._height;
        }
        startObserving() {
            if (!this._resizeObserver && this._referenceDomElement) {
                // We want to react to the resize observer only once per animation frame
                // The first time the resize observer fires, we will react to it immediately.
                // Otherwise we will postpone to the next animation frame.
                // We'll use `observeContentRect` to store the content rect we received.
                let observeContentRect = null;
                const observeNow = () => {
                    if (observeContentRect) {
                        this.observe({ width: observeContentRect.width, height: observeContentRect.height });
                    }
                    else {
                        this.observe();
                    }
                };
                let shouldObserve = false;
                let alreadyObservedThisAnimationFrame = false;
                const update = () => {
                    if (shouldObserve && !alreadyObservedThisAnimationFrame) {
                        try {
                            shouldObserve = false;
                            alreadyObservedThisAnimationFrame = true;
                            observeNow();
                        }
                        finally {
                            requestAnimationFrame(() => {
                                alreadyObservedThisAnimationFrame = false;
                                update();
                            });
                        }
                    }
                };
                this._resizeObserver = new ResizeObserver((entries) => {
                    observeContentRect = (entries && entries[0] && entries[0].contentRect ? entries[0].contentRect : null);
                    shouldObserve = true;
                    update();
                });
                this._resizeObserver.observe(this._referenceDomElement);
            }
        }
        stopObserving() {
            if (this._resizeObserver) {
                this._resizeObserver.disconnect();
                this._resizeObserver = null;
            }
        }
        observe(dimension) {
            this.measureReferenceDomElement(true, dimension);
        }
        measureReferenceDomElement(emitEvent, dimension) {
            let observedWidth = 0;
            let observedHeight = 0;
            if (dimension) {
                observedWidth = dimension.width;
                observedHeight = dimension.height;
            }
            else if (this._referenceDomElement) {
                observedWidth = this._referenceDomElement.clientWidth;
                observedHeight = this._referenceDomElement.clientHeight;
            }
            observedWidth = Math.max(5, observedWidth);
            observedHeight = Math.max(5, observedHeight);
            if (this._width !== observedWidth || this._height !== observedHeight) {
                this._width = observedWidth;
                this._height = observedHeight;
                if (emitEvent) {
                    this._onDidChange.fire();
                }
            }
        }
    }
    exports.ElementSizeObserver = ElementSizeObserver;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbWVudFNpemVPYnNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL2NvbmZpZy9lbGVtZW50U2l6ZU9ic2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1oRyxNQUFhLG1CQUFvQixTQUFRLHNCQUFVO1FBVWxELFlBQVksbUJBQXVDLEVBQUUsU0FBaUM7WUFDckYsS0FBSyxFQUFFLENBQUM7WUFURCxpQkFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQzNDLGdCQUFXLEdBQWdCLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBU2xFLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxtQkFBbUIsQ0FBQztZQUNoRCxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDbEIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7WUFDNUIsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNuRCxDQUFDO1FBRWUsT0FBTztZQUN0QixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDckIsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUM7UUFFTSxRQUFRO1lBQ2QsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3BCLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3JCLENBQUM7UUFFTSxjQUFjO1lBQ3BCLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxJQUFJLElBQUksQ0FBQyxvQkFBb0IsRUFBRTtnQkFDdkQsd0VBQXdFO2dCQUN4RSw2RUFBNkU7Z0JBQzdFLDBEQUEwRDtnQkFDMUQsd0VBQXdFO2dCQUV4RSxJQUFJLGtCQUFrQixHQUEyQixJQUFJLENBQUM7Z0JBQ3RELE1BQU0sVUFBVSxHQUFHLEdBQUcsRUFBRTtvQkFDdkIsSUFBSSxrQkFBa0IsRUFBRTt3QkFDdkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEtBQUssRUFBRSxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7cUJBQ3JGO3lCQUFNO3dCQUNOLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztxQkFDZjtnQkFDRixDQUFDLENBQUM7Z0JBRUYsSUFBSSxhQUFhLEdBQUcsS0FBSyxDQUFDO2dCQUMxQixJQUFJLGlDQUFpQyxHQUFHLEtBQUssQ0FBQztnQkFFOUMsTUFBTSxNQUFNLEdBQUcsR0FBRyxFQUFFO29CQUNuQixJQUFJLGFBQWEsSUFBSSxDQUFDLGlDQUFpQyxFQUFFO3dCQUN4RCxJQUFJOzRCQUNILGFBQWEsR0FBRyxLQUFLLENBQUM7NEJBQ3RCLGlDQUFpQyxHQUFHLElBQUksQ0FBQzs0QkFDekMsVUFBVSxFQUFFLENBQUM7eUJBQ2I7Z0NBQVM7NEJBQ1QscUJBQXFCLENBQUMsR0FBRyxFQUFFO2dDQUMxQixpQ0FBaUMsR0FBRyxLQUFLLENBQUM7Z0NBQzFDLE1BQU0sRUFBRSxDQUFDOzRCQUNWLENBQUMsQ0FBQyxDQUFDO3lCQUNIO3FCQUNEO2dCQUNGLENBQUMsQ0FBQztnQkFFRixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksY0FBYyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7b0JBQ3JELGtCQUFrQixHQUFHLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDdkcsYUFBYSxHQUFHLElBQUksQ0FBQztvQkFDckIsTUFBTSxFQUFFLENBQUM7Z0JBQ1YsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7YUFDeEQ7UUFDRixDQUFDO1FBRU0sYUFBYTtZQUNuQixJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUU7Z0JBQ3pCLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQ2xDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO2FBQzVCO1FBQ0YsQ0FBQztRQUVNLE9BQU8sQ0FBQyxTQUFzQjtZQUNwQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ2xELENBQUM7UUFFTywwQkFBMEIsQ0FBQyxTQUFrQixFQUFFLFNBQXNCO1lBQzVFLElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQztZQUN0QixJQUFJLGNBQWMsR0FBRyxDQUFDLENBQUM7WUFDdkIsSUFBSSxTQUFTLEVBQUU7Z0JBQ2QsYUFBYSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUM7Z0JBQ2hDLGNBQWMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDO2FBQ2xDO2lCQUFNLElBQUksSUFBSSxDQUFDLG9CQUFvQixFQUFFO2dCQUNyQyxhQUFhLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFdBQVcsQ0FBQztnQkFDdEQsY0FBYyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxZQUFZLENBQUM7YUFDeEQ7WUFDRCxhQUFhLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDM0MsY0FBYyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQzdDLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxhQUFhLElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxjQUFjLEVBQUU7Z0JBQ3JFLElBQUksQ0FBQyxNQUFNLEdBQUcsYUFBYSxDQUFDO2dCQUM1QixJQUFJLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQztnQkFDOUIsSUFBSSxTQUFTLEVBQUU7b0JBQ2QsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQztpQkFDekI7YUFDRDtRQUNGLENBQUM7S0FDRDtJQTFHRCxrREEwR0MifQ==