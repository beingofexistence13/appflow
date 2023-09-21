/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/base/common/types"], function (require, exports, async_1, cancellation_1, lifecycle_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PickerQuickAccessProvider = exports.TriggerAction = void 0;
    var TriggerAction;
    (function (TriggerAction) {
        /**
         * Do nothing after the button was clicked.
         */
        TriggerAction[TriggerAction["NO_ACTION"] = 0] = "NO_ACTION";
        /**
         * Close the picker.
         */
        TriggerAction[TriggerAction["CLOSE_PICKER"] = 1] = "CLOSE_PICKER";
        /**
         * Update the results of the picker.
         */
        TriggerAction[TriggerAction["REFRESH_PICKER"] = 2] = "REFRESH_PICKER";
        /**
         * Remove the item from the picker.
         */
        TriggerAction[TriggerAction["REMOVE_ITEM"] = 3] = "REMOVE_ITEM";
    })(TriggerAction || (exports.TriggerAction = TriggerAction = {}));
    function isPicksWithActive(obj) {
        const candidate = obj;
        return Array.isArray(candidate.items);
    }
    function isFastAndSlowPicks(obj) {
        const candidate = obj;
        return !!candidate.picks && candidate.additionalPicks instanceof Promise;
    }
    class PickerQuickAccessProvider extends lifecycle_1.Disposable {
        constructor(prefix, options) {
            super();
            this.prefix = prefix;
            this.options = options;
        }
        provide(picker, token, runOptions) {
            const disposables = new lifecycle_1.DisposableStore();
            // Apply options if any
            picker.canAcceptInBackground = !!this.options?.canAcceptInBackground;
            // Disable filtering & sorting, we control the results
            picker.matchOnLabel = picker.matchOnDescription = picker.matchOnDetail = picker.sortByLabel = false;
            // Set initial picks and update on type
            let picksCts = undefined;
            const picksDisposable = disposables.add(new lifecycle_1.MutableDisposable());
            const updatePickerItems = async () => {
                const picksDisposables = picksDisposable.value = new lifecycle_1.DisposableStore();
                // Cancel any previous ask for picks and busy
                picksCts?.dispose(true);
                picker.busy = false;
                // Create new cancellation source for this run
                picksCts = new cancellation_1.CancellationTokenSource(token);
                // Collect picks and support both long running and short or combined
                const picksToken = picksCts.token;
                const picksFilter = picker.value.substr(this.prefix.length).trim();
                const providedPicks = this._getPicks(picksFilter, picksDisposables, picksToken, runOptions);
                const applyPicks = (picks, skipEmpty) => {
                    let items;
                    let activeItem = undefined;
                    if (isPicksWithActive(picks)) {
                        items = picks.items;
                        activeItem = picks.active;
                    }
                    else {
                        items = picks;
                    }
                    if (items.length === 0) {
                        if (skipEmpty) {
                            return false;
                        }
                        // We show the no results pick if we have no input to prevent completely empty pickers #172613
                        if ((picksFilter.length > 0 || picker.hideInput) && this.options?.noResultsPick) {
                            if ((0, types_1.isFunction)(this.options.noResultsPick)) {
                                items = [this.options.noResultsPick(picksFilter)];
                            }
                            else {
                                items = [this.options.noResultsPick];
                            }
                        }
                    }
                    picker.items = items;
                    if (activeItem) {
                        picker.activeItems = [activeItem];
                    }
                    return true;
                };
                const applyFastAndSlowPicks = async (fastAndSlowPicks) => {
                    let fastPicksApplied = false;
                    let slowPicksApplied = false;
                    await Promise.all([
                        // Fast Picks: if `mergeDelay` is configured, in order to reduce
                        // amount of flicker, we race against the slow picks over some delay
                        // and then set the fast picks.
                        // If the slow picks are faster, we reduce the flicker by only
                        // setting the items once.
                        (async () => {
                            if (typeof fastAndSlowPicks.mergeDelay === 'number') {
                                await (0, async_1.timeout)(fastAndSlowPicks.mergeDelay);
                                if (picksToken.isCancellationRequested) {
                                    return;
                                }
                            }
                            if (!slowPicksApplied) {
                                fastPicksApplied = applyPicks(fastAndSlowPicks.picks, true /* skip over empty to reduce flicker */);
                            }
                        })(),
                        // Slow Picks: we await the slow picks and then set them at
                        // once together with the fast picks, but only if we actually
                        // have additional results.
                        (async () => {
                            picker.busy = true;
                            try {
                                const awaitedAdditionalPicks = await fastAndSlowPicks.additionalPicks;
                                if (picksToken.isCancellationRequested) {
                                    return;
                                }
                                let picks;
                                let activePick = undefined;
                                if (isPicksWithActive(fastAndSlowPicks.picks)) {
                                    picks = fastAndSlowPicks.picks.items;
                                    activePick = fastAndSlowPicks.picks.active;
                                }
                                else {
                                    picks = fastAndSlowPicks.picks;
                                }
                                let additionalPicks;
                                let additionalActivePick = undefined;
                                if (isPicksWithActive(awaitedAdditionalPicks)) {
                                    additionalPicks = awaitedAdditionalPicks.items;
                                    additionalActivePick = awaitedAdditionalPicks.active;
                                }
                                else {
                                    additionalPicks = awaitedAdditionalPicks;
                                }
                                if (additionalPicks.length > 0 || !fastPicksApplied) {
                                    // If we do not have any activePick or additionalActivePick
                                    // we try to preserve the currently active pick from the
                                    // fast results. This fixes an issue where the user might
                                    // have made a pick active before the additional results
                                    // kick in.
                                    // See https://github.com/microsoft/vscode/issues/102480
                                    let fallbackActivePick = undefined;
                                    if (!activePick && !additionalActivePick) {
                                        const fallbackActivePickCandidate = picker.activeItems[0];
                                        if (fallbackActivePickCandidate && picks.indexOf(fallbackActivePickCandidate) !== -1) {
                                            fallbackActivePick = fallbackActivePickCandidate;
                                        }
                                    }
                                    applyPicks({
                                        items: [...picks, ...additionalPicks],
                                        active: activePick || additionalActivePick || fallbackActivePick
                                    });
                                }
                            }
                            finally {
                                if (!picksToken.isCancellationRequested) {
                                    picker.busy = false;
                                }
                                slowPicksApplied = true;
                            }
                        })()
                    ]);
                };
                // No Picks
                if (providedPicks === null) {
                    // Ignore
                }
                // Fast and Slow Picks
                else if (isFastAndSlowPicks(providedPicks)) {
                    await applyFastAndSlowPicks(providedPicks);
                }
                // Fast Picks
                else if (!(providedPicks instanceof Promise)) {
                    applyPicks(providedPicks);
                }
                // Slow Picks
                else {
                    picker.busy = true;
                    try {
                        const awaitedPicks = await providedPicks;
                        if (picksToken.isCancellationRequested) {
                            return;
                        }
                        if (isFastAndSlowPicks(awaitedPicks)) {
                            await applyFastAndSlowPicks(awaitedPicks);
                        }
                        else {
                            applyPicks(awaitedPicks);
                        }
                    }
                    finally {
                        if (!picksToken.isCancellationRequested) {
                            picker.busy = false;
                        }
                    }
                }
            };
            disposables.add(picker.onDidChangeValue(() => updatePickerItems()));
            updatePickerItems();
            // Accept the pick on accept and hide picker
            disposables.add(picker.onDidAccept(event => {
                const [item] = picker.selectedItems;
                if (typeof item?.accept === 'function') {
                    if (!event.inBackground) {
                        picker.hide(); // hide picker unless we accept in background
                    }
                    item.accept(picker.keyMods, event);
                }
            }));
            // Trigger the pick with button index if button triggered
            disposables.add(picker.onDidTriggerItemButton(async ({ button, item }) => {
                if (typeof item.trigger === 'function') {
                    const buttonIndex = item.buttons?.indexOf(button) ?? -1;
                    if (buttonIndex >= 0) {
                        const result = item.trigger(buttonIndex, picker.keyMods);
                        const action = (typeof result === 'number') ? result : await result;
                        if (token.isCancellationRequested) {
                            return;
                        }
                        switch (action) {
                            case TriggerAction.NO_ACTION:
                                break;
                            case TriggerAction.CLOSE_PICKER:
                                picker.hide();
                                break;
                            case TriggerAction.REFRESH_PICKER:
                                updatePickerItems();
                                break;
                            case TriggerAction.REMOVE_ITEM: {
                                const index = picker.items.indexOf(item);
                                if (index !== -1) {
                                    const items = picker.items.slice();
                                    const removed = items.splice(index, 1);
                                    const activeItems = picker.activeItems.filter(activeItem => activeItem !== removed[0]);
                                    const keepScrollPositionBefore = picker.keepScrollPosition;
                                    picker.keepScrollPosition = true;
                                    picker.items = items;
                                    if (activeItems) {
                                        picker.activeItems = activeItems;
                                    }
                                    picker.keepScrollPosition = keepScrollPositionBefore;
                                }
                                break;
                            }
                        }
                    }
                }
            }));
            return disposables;
        }
    }
    exports.PickerQuickAccessProvider = PickerQuickAccessProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlja2VyUXVpY2tBY2Nlc3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9xdWlja2lucHV0L2Jyb3dzZXIvcGlja2VyUXVpY2tBY2Nlc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU2hHLElBQVksYUFxQlg7SUFyQkQsV0FBWSxhQUFhO1FBRXhCOztXQUVHO1FBQ0gsMkRBQVMsQ0FBQTtRQUVUOztXQUVHO1FBQ0gsaUVBQVksQ0FBQTtRQUVaOztXQUVHO1FBQ0gscUVBQWMsQ0FBQTtRQUVkOztXQUVHO1FBQ0gsK0RBQVcsQ0FBQTtJQUNaLENBQUMsRUFyQlcsYUFBYSw2QkFBYixhQUFhLFFBcUJ4QjtJQWlFRCxTQUFTLGlCQUFpQixDQUFJLEdBQVk7UUFDekMsTUFBTSxTQUFTLEdBQUcsR0FBeUIsQ0FBQztRQUU1QyxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxTQUFTLGtCQUFrQixDQUFJLEdBQVk7UUFDMUMsTUFBTSxTQUFTLEdBQUcsR0FBMEIsQ0FBQztRQUU3QyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxJQUFJLFNBQVMsQ0FBQyxlQUFlLFlBQVksT0FBTyxDQUFDO0lBQzFFLENBQUM7SUFFRCxNQUFzQix5QkFBNEQsU0FBUSxzQkFBVTtRQUVuRyxZQUFvQixNQUFjLEVBQVksT0FBOEM7WUFDM0YsS0FBSyxFQUFFLENBQUM7WUFEVyxXQUFNLEdBQU4sTUFBTSxDQUFRO1lBQVksWUFBTyxHQUFQLE9BQU8sQ0FBdUM7UUFFNUYsQ0FBQztRQUVELE9BQU8sQ0FBQyxNQUFxQixFQUFFLEtBQXdCLEVBQUUsVUFBMkM7WUFDbkcsTUFBTSxXQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFFMUMsdUJBQXVCO1lBQ3ZCLE1BQU0sQ0FBQyxx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