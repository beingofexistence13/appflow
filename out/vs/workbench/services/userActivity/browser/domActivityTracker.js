/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/lifecycle"], function (require, exports, dom, async_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DomActivityTracker = void 0;
    /**
     * This uses a time interval and checks whether there's any activity in that
     * interval. A naive approach might be to use a debounce whenever an event
     * happens, but this has some scheduling overhead. Instead, the tracker counts
     * how many intervals have elapsed since any activity happened.
     *
     * If there's more than `MIN_INTERVALS_WITHOUT_ACTIVITY`, then say the user is
     * inactive. Therefore the maximum time before an inactive user is detected
     * is `CHECK_INTERVAL * (MIN_INTERVALS_WITHOUT_ACTIVITY + 1)`.
     */
    const CHECK_INTERVAL = 30000;
    /** See {@link CHECK_INTERVAL} */
    const MIN_INTERVALS_WITHOUT_ACTIVITY = 2;
    const eventListenerOptions = {
        passive: true,
        capture: true, /** should dispatch first (before anyone stopPropagation()) */
    };
    class DomActivityTracker extends lifecycle_1.Disposable {
        constructor(userActivityService) {
            super();
            let intervalsWithoutActivity = MIN_INTERVALS_WITHOUT_ACTIVITY;
            const intervalTimer = this._register(new async_1.IntervalTimer());
            const activeMutex = this._register(new lifecycle_1.MutableDisposable());
            activeMutex.value = userActivityService.markActive();
            const onInterval = () => {
                if (++intervalsWithoutActivity === MIN_INTERVALS_WITHOUT_ACTIVITY) {
                    activeMutex.clear();
                    intervalTimer.cancel();
                }
            };
            const onActivity = () => {
                // if was inactive, they've now returned
                if (intervalsWithoutActivity === MIN_INTERVALS_WITHOUT_ACTIVITY) {
                    activeMutex.value = userActivityService.markActive();
                    intervalTimer.cancelAndSet(onInterval, CHECK_INTERVAL);
                }
                intervalsWithoutActivity = 0;
            };
            this._register(dom.addDisposableListener(document, 'touchstart', onActivity, eventListenerOptions));
            this._register(dom.addDisposableListener(document, 'mousedown', onActivity, eventListenerOptions));
            this._register(dom.addDisposableListener(document, 'keydown', onActivity, eventListenerOptions));
            onActivity();
        }
    }
    exports.DomActivityTracker = DomActivityTracker;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tQWN0aXZpdHlUcmFja2VyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3VzZXJBY3Rpdml0eS9icm93c2VyL2RvbUFjdGl2aXR5VHJhY2tlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFPaEc7Ozs7Ozs7OztPQVNHO0lBQ0gsTUFBTSxjQUFjLEdBQUcsS0FBTSxDQUFDO0lBRTlCLGlDQUFpQztJQUNqQyxNQUFNLDhCQUE4QixHQUFHLENBQUMsQ0FBQztJQUV6QyxNQUFNLG9CQUFvQixHQUE0QjtRQUNyRCxPQUFPLEVBQUUsSUFBSTtRQUNiLE9BQU8sRUFBRSxJQUFJLEVBQUUsOERBQThEO0tBQzdFLENBQUM7SUFFRixNQUFhLGtCQUFtQixTQUFRLHNCQUFVO1FBQ2pELFlBQVksbUJBQXlDO1lBQ3BELEtBQUssRUFBRSxDQUFDO1lBRVIsSUFBSSx3QkFBd0IsR0FBRyw4QkFBOEIsQ0FBQztZQUM5RCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUkscUJBQWEsRUFBRSxDQUFDLENBQUM7WUFDMUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDZCQUFpQixFQUFFLENBQUMsQ0FBQztZQUM1RCxXQUFXLENBQUMsS0FBSyxHQUFHLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxDQUFDO1lBRXJELE1BQU0sVUFBVSxHQUFHLEdBQUcsRUFBRTtnQkFDdkIsSUFBSSxFQUFFLHdCQUF3QixLQUFLLDhCQUE4QixFQUFFO29CQUNsRSxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ3BCLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztpQkFDdkI7WUFDRixDQUFDLENBQUM7WUFFRixNQUFNLFVBQVUsR0FBRyxHQUFHLEVBQUU7Z0JBQ3ZCLHdDQUF3QztnQkFDeEMsSUFBSSx3QkFBd0IsS0FBSyw4QkFBOEIsRUFBRTtvQkFDaEUsV0FBVyxDQUFDLEtBQUssR0FBRyxtQkFBbUIsQ0FBQyxVQUFVLEVBQUUsQ0FBQztvQkFDckQsYUFBYSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsY0FBYyxDQUFDLENBQUM7aUJBQ3ZEO2dCQUVELHdCQUF3QixHQUFHLENBQUMsQ0FBQztZQUM5QixDQUFDLENBQUM7WUFFRixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7WUFDcEcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO1lBQ25HLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLG9CQUFvQixDQUFDLENBQUMsQ0FBQztZQUVqRyxVQUFVLEVBQUUsQ0FBQztRQUNkLENBQUM7S0FDRDtJQWhDRCxnREFnQ0MifQ==