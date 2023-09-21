/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/lifecycle"], function (require, exports, dom, async_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$IBb = void 0;
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
    class $IBb extends lifecycle_1.$kc {
        constructor(userActivityService) {
            super();
            let intervalsWithoutActivity = MIN_INTERVALS_WITHOUT_ACTIVITY;
            const intervalTimer = this.B(new async_1.$Rg());
            const activeMutex = this.B(new lifecycle_1.$lc());
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
            this.B(dom.$nO(document, 'touchstart', onActivity, eventListenerOptions));
            this.B(dom.$nO(document, 'mousedown', onActivity, eventListenerOptions));
            this.B(dom.$nO(document, 'keydown', onActivity, eventListenerOptions));
            onActivity();
        }
    }
    exports.$IBb = $IBb;
});
//# sourceMappingURL=domActivityTracker.js.map