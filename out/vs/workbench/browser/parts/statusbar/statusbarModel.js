/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/services/statusbar/browser/statusbar", "vs/base/browser/dom", "vs/base/common/event"], function (require, exports, lifecycle_1, statusbar_1, dom_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StatusbarViewModel = void 0;
    class StatusbarViewModel extends lifecycle_1.Disposable {
        static { this.HIDDEN_ENTRIES_KEY = 'workbench.statusbar.hidden'; }
        get entries() { return this._entries.slice(0); }
        get lastFocusedEntry() {
            return this._lastFocusedEntry && !this.isHidden(this._lastFocusedEntry.id) ? this._lastFocusedEntry : undefined;
        }
        constructor(storageService) {
            super();
            this.storageService = storageService;
            this._onDidChangeEntryVisibility = this._register(new event_1.Emitter());
            this.onDidChangeEntryVisibility = this._onDidChangeEntryVisibility.event;
            this._entries = []; // Intentionally not using a map here since multiple entries can have the same ID
            this.hidden = new Set();
            this.restoreState();
            this.registerListeners();
        }
        restoreState() {
            const hiddenRaw = this.storageService.get(StatusbarViewModel.HIDDEN_ENTRIES_KEY, 0 /* StorageScope.PROFILE */);
            if (hiddenRaw) {
                try {
                    const hiddenArray = JSON.parse(hiddenRaw);
                    this.hidden = new Set(hiddenArray);
                }
                catch (error) {
                    // ignore parsing errors
                }
            }
        }
        registerListeners() {
            this._register(this.storageService.onDidChangeValue(0 /* StorageScope.PROFILE */, StatusbarViewModel.HIDDEN_ENTRIES_KEY, this._register(new lifecycle_1.DisposableStore()))(() => this.onDidStorageValueChange()));
        }
        onDidStorageValueChange() {
            // Keep current hidden entries
            const currentlyHidden = new Set(this.hidden);
            // Load latest state of hidden entries
            this.hidden.clear();
            this.restoreState();
            const changed = new Set();
            // Check for each entry that is now visible
            for (const id of currentlyHidden) {
                if (!this.hidden.has(id)) {
                    changed.add(id);
                }
            }
            // Check for each entry that is now hidden
            for (const id of this.hidden) {
                if (!currentlyHidden.has(id)) {
                    changed.add(id);
                }
            }
            // Update visibility for entries have changed
            if (changed.size > 0) {
                for (const entry of this._entries) {
                    if (changed.has(entry.id)) {
                        this.updateVisibility(entry.id, true);
                        changed.delete(entry.id);
                    }
                }
            }
        }
        add(entry) {
            // Add to set of entries
            this._entries.push(entry);
            // Update visibility directly
            this.updateVisibility(entry, false);
            // Sort according to priority
            this.sort();
            // Mark first/last visible entry
            this.markFirstLastVisibleEntry();
        }
        remove(entry) {
            const index = this._entries.indexOf(entry);
            if (index >= 0) {
                // Remove from entries
                this._entries.splice(index, 1);
                // Re-sort entries if this one was used
                // as reference from other entries
                if (this._entries.some(otherEntry => (0, statusbar_1.isStatusbarEntryLocation)(otherEntry.priority.primary) && otherEntry.priority.primary.id === entry.id)) {
                    this.sort();
                }
                // Mark first/last visible entry
                this.markFirstLastVisibleEntry();
            }
        }
        isHidden(id) {
            return this.hidden.has(id);
        }
        hide(id) {
            if (!this.hidden.has(id)) {
                this.hidden.add(id);
                this.updateVisibility(id, true);
                this.saveState();
            }
        }
        show(id) {
            if (this.hidden.has(id)) {
                this.hidden.delete(id);
                this.updateVisibility(id, true);
                this.saveState();
            }
        }
        findEntry(container) {
            return this._entries.find(entry => entry.container === container);
        }
        getEntries(alignment) {
            return this._entries.filter(entry => entry.alignment === alignment);
        }
        focusNextEntry() {
            this.focusEntry(+1, 0);
        }
        focusPreviousEntry() {
            this.focusEntry(-1, this.entries.length - 1);
        }
        isEntryFocused() {
            return !!this.getFocusedEntry();
        }
        getFocusedEntry() {
            return this._entries.find(entry => (0, dom_1.isAncestor)(document.activeElement, entry.container));
        }
        focusEntry(delta, restartPosition) {
            const getVisibleEntry = (start) => {
                let indexToFocus = start;
                let entry = (indexToFocus >= 0 && indexToFocus < this._entries.length) ? this._entries[indexToFocus] : undefined;
                while (entry && this.isHidden(entry.id)) {
                    indexToFocus += delta;
                    entry = (indexToFocus >= 0 && indexToFocus < this._entries.length) ? this._entries[indexToFocus] : undefined;
                }
                return entry;
            };
            const focused = this.getFocusedEntry();
            if (focused) {
                const entry = getVisibleEntry(this._entries.indexOf(focused) + delta);
                if (entry) {
                    this._lastFocusedEntry = entry;
                    entry.labelContainer.focus();
                    return;
                }
            }
            const entry = getVisibleEntry(restartPosition);
            if (entry) {
                this._lastFocusedEntry = entry;
                entry.labelContainer.focus();
            }
        }
        updateVisibility(arg1, trigger) {
            // By identifier
            if (typeof arg1 === 'string') {
                const id = arg1;
                for (const entry of this._entries) {
                    if (entry.id === id) {
                        this.updateVisibility(entry, trigger);
                    }
                }
            }
            // By entry
            else {
                const entry = arg1;
                const isHidden = this.isHidden(entry.id);
                // Use CSS to show/hide item container
                if (isHidden) {
                    (0, dom_1.hide)(entry.container);
                }
                else {
                    (0, dom_1.show)(entry.container);
                }
                if (trigger) {
                    this._onDidChangeEntryVisibility.fire({ id: entry.id, visible: !isHidden });
                }
                // Mark first/last visible entry
                this.markFirstLastVisibleEntry();
            }
        }
        saveState() {
            if (this.hidden.size > 0) {
                this.storageService.store(StatusbarViewModel.HIDDEN_ENTRIES_KEY, JSON.stringify(Array.from(this.hidden.values())), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            }
            else {
                this.storageService.remove(StatusbarViewModel.HIDDEN_ENTRIES_KEY, 0 /* StorageScope.PROFILE */);
            }
        }
        sort() {
            // Split up entries into 2 buckets:
            // - those with `priority: number` that can be compared
            // - those with `priority: string` that must be sorted
            //   relative to another entry if possible
            const mapEntryWithNumberedPriorityToIndex = new Map();
            const mapEntryWithRelativePriority = new Map();
            for (let i = 0; i < this._entries.length; i++) {
                const entry = this._entries[i];
                if (typeof entry.priority.primary === 'number') {
                    mapEntryWithNumberedPriorityToIndex.set(entry, i);
                }
                else {
                    let entries = mapEntryWithRelativePriority.get(entry.priority.primary.id);
                    if (!entries) {
                        entries = [];
                        mapEntryWithRelativePriority.set(entry.priority.primary.id, entries);
                    }
                    entries.push(entry);
                }
            }
            // Sort the entries with `priority: number` according to that
            const sortedEntriesWithNumberedPriority = Array.from(mapEntryWithNumberedPriorityToIndex.keys());
            sortedEntriesWithNumberedPriority.sort((entryA, entryB) => {
                if (entryA.alignment === entryB.alignment) {
                    // Sort by primary/secondary priority: higher values move towards the left
                    if (entryA.priority.primary !== entryB.priority.primary) {
                        return Number(entryB.priority.primary) - Number(entryA.priority.primary);
                    }
                    if (entryA.priority.secondary !== entryB.priority.secondary) {
                        return entryB.priority.secondary - entryA.priority.secondary;
                    }
                    // otherwise maintain stable order (both values known to be in map)
                    return mapEntryWithNumberedPriorityToIndex.get(entryA) - mapEntryWithNumberedPriorityToIndex.get(entryB);
                }
                if (entryA.alignment === 0 /* StatusbarAlignment.LEFT */) {
                    return -1;
                }
                if (entryB.alignment === 0 /* StatusbarAlignment.LEFT */) {
                    return 1;
                }
                return 0;
            });
            let sortedEntries;
            // Entries with location: sort in accordingly
            if (mapEntryWithRelativePriority.size > 0) {
                sortedEntries = [];
                for (const entry of sortedEntriesWithNumberedPriority) {
                    const relativeEntries = mapEntryWithRelativePriority.get(entry.id);
                    // Fill relative entries to LEFT
                    if (relativeEntries) {
                        sortedEntries.push(...relativeEntries.filter(entry => (0, statusbar_1.isStatusbarEntryLocation)(entry.priority.primary) && entry.priority.primary.alignment === 0 /* StatusbarAlignment.LEFT */));
                    }
                    // Fill referenced entry
                    sortedEntries.push(entry);
                    // Fill relative entries to RIGHT
                    if (relativeEntries) {
                        sortedEntries.push(...relativeEntries.filter(entry => (0, statusbar_1.isStatusbarEntryLocation)(entry.priority.primary) && entry.priority.primary.alignment === 1 /* StatusbarAlignment.RIGHT */));
                    }
                    // Delete from map to mark as handled
                    mapEntryWithRelativePriority.delete(entry.id);
                }
                // Finally, just append all entries that reference another entry
                // that does not exist to the end of the list
                for (const [, entries] of mapEntryWithRelativePriority) {
                    sortedEntries.push(...entries);
                }
            }
            // No entries with relative priority: take sorted entries as is
            else {
                sortedEntries = sortedEntriesWithNumberedPriority;
            }
            // Take over as new truth of entries
            this._entries = sortedEntries;
        }
        markFirstLastVisibleEntry() {
            this.doMarkFirstLastVisibleStatusbarItem(this.getEntries(0 /* StatusbarAlignment.LEFT */));
            this.doMarkFirstLastVisibleStatusbarItem(this.getEntries(1 /* StatusbarAlignment.RIGHT */));
        }
        doMarkFirstLastVisibleStatusbarItem(entries) {
            let firstVisibleItem;
            let lastVisibleItem;
            for (const entry of entries) {
                // Clear previous first
                entry.container.classList.remove('first-visible-item', 'last-visible-item');
                const isVisible = !this.isHidden(entry.id);
                if (isVisible) {
                    if (!firstVisibleItem) {
                        firstVisibleItem = entry;
                    }
                    lastVisibleItem = entry;
                }
            }
            // Mark: first visible item
            firstVisibleItem?.container.classList.add('first-visible-item');
            // Mark: last visible item
            lastVisibleItem?.container.classList.add('last-visible-item');
        }
    }
    exports.StatusbarViewModel = StatusbarViewModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdHVzYmFyTW9kZWwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9wYXJ0cy9zdGF0dXNiYXIvc3RhdHVzYmFyTW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBa0JoRyxNQUFhLGtCQUFtQixTQUFRLHNCQUFVO2lCQUV6Qix1QkFBa0IsR0FBRyw0QkFBNEIsQUFBL0IsQ0FBZ0M7UUFNMUUsSUFBSSxPQUFPLEtBQWlDLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRzVFLElBQUksZ0JBQWdCO1lBQ25CLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQ2pILENBQUM7UUFJRCxZQUE2QixjQUErQjtZQUMzRCxLQUFLLEVBQUUsQ0FBQztZQURvQixtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFiM0MsZ0NBQTJCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBb0MsQ0FBQyxDQUFDO1lBQ3RHLCtCQUEwQixHQUFHLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxLQUFLLENBQUM7WUFFckUsYUFBUSxHQUErQixFQUFFLENBQUMsQ0FBQyxpRkFBaUY7WUFRNUgsV0FBTSxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7WUFLbEMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFFTyxZQUFZO1lBQ25CLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxjQUFjLENB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