/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/services/statusbar/browser/statusbar", "vs/base/browser/dom", "vs/base/common/event"], function (require, exports, lifecycle_1, statusbar_1, dom_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$byb = void 0;
    class $byb extends lifecycle_1.$kc {
        static { this.a = 'workbench.statusbar.hidden'; }
        get entries() { return this.c.slice(0); }
        get lastFocusedEntry() {
            return this.f && !this.isHidden(this.f.id) ? this.f : undefined;
        }
        constructor(h) {
            super();
            this.h = h;
            this.b = this.B(new event_1.$fd());
            this.onDidChangeEntryVisibility = this.b.event;
            this.c = []; // Intentionally not using a map here since multiple entries can have the same ID
            this.g = new Set();
            this.j();
            this.m();
        }
        j() {
            const hiddenRaw = this.h.get($byb.a, 0 /* StorageScope.PROFILE */);
            if (hiddenRaw) {
                try {
                    const hiddenArray = JSON.parse(hiddenRaw);
                    this.g = new Set(hiddenArray);
                }
                catch (error) {
                    // ignore parsing errors
                }
            }
        }
        m() {
            this.B(this.h.onDidChangeValue(0 /* StorageScope.PROFILE */, $byb.a, this.B(new lifecycle_1.$jc()))(() => this.n()));
        }
        n() {
            // Keep current hidden entries
            const currentlyHidden = new Set(this.g);
            // Load latest state of hidden entries
            this.g.clear();
            this.j();
            const changed = new Set();
            // Check for each entry that is now visible
            for (const id of currentlyHidden) {
                if (!this.g.has(id)) {
                    changed.add(id);
                }
            }
            // Check for each entry that is now hidden
            for (const id of this.g) {
                if (!currentlyHidden.has(id)) {
                    changed.add(id);
                }
            }
            // Update visibility for entries have changed
            if (changed.size > 0) {
                for (const entry of this.c) {
                    if (changed.has(entry.id)) {
                        this.t(entry.id, true);
                        changed.delete(entry.id);
                    }
                }
            }
        }
        add(entry) {
            // Add to set of entries
            this.c.push(entry);
            // Update visibility directly
            this.t(entry, false);
            // Sort according to priority
            this.w();
            // Mark first/last visible entry
            this.y();
        }
        remove(entry) {
            const index = this.c.indexOf(entry);
            if (index >= 0) {
                // Remove from entries
                this.c.splice(index, 1);
                // Re-sort entries if this one was used
                // as reference from other entries
                if (this.c.some(otherEntry => (0, statusbar_1.$7$)(otherEntry.priority.primary) && otherEntry.priority.primary.id === entry.id)) {
                    this.w();
                }
                // Mark first/last visible entry
                this.y();
            }
        }
        isHidden(id) {
            return this.g.has(id);
        }
        hide(id) {
            if (!this.g.has(id)) {
                this.g.add(id);
                this.t(id, true);
                this.u();
            }
        }
        show(id) {
            if (this.g.has(id)) {
                this.g.delete(id);
                this.t(id, true);
                this.u();
            }
        }
        findEntry(container) {
            return this.c.find(entry => entry.container === container);
        }
        getEntries(alignment) {
            return this.c.filter(entry => entry.alignment === alignment);
        }
        focusNextEntry() {
            this.s(+1, 0);
        }
        focusPreviousEntry() {
            this.s(-1, this.entries.length - 1);
        }
        isEntryFocused() {
            return !!this.r();
        }
        r() {
            return this.c.find(entry => (0, dom_1.$NO)(document.activeElement, entry.container));
        }
        s(delta, restartPosition) {
            const getVisibleEntry = (start) => {
                let indexToFocus = start;
                let entry = (indexToFocus >= 0 && indexToFocus < this.c.length) ? this.c[indexToFocus] : undefined;
                while (entry && this.isHidden(entry.id)) {
                    indexToFocus += delta;
                    entry = (indexToFocus >= 0 && indexToFocus < this.c.length) ? this.c[indexToFocus] : undefined;
                }
                return entry;
            };
            const focused = this.r();
            if (focused) {
                const entry = getVisibleEntry(this.c.indexOf(focused) + delta);
                if (entry) {
                    this.f = entry;
                    entry.labelContainer.focus();
                    return;
                }
            }
            const entry = getVisibleEntry(restartPosition);
            if (entry) {
                this.f = entry;
                entry.labelContainer.focus();
            }
        }
        t(arg1, trigger) {
            // By identifier
            if (typeof arg1 === 'string') {
                const id = arg1;
                for (const entry of this.c) {
                    if (entry.id === id) {
                        this.t(entry, trigger);
                    }
                }
            }
            // By entry
            else {
                const entry = arg1;
                const isHidden = this.isHidden(entry.id);
                // Use CSS to show/hide item container
                if (isHidden) {
                    (0, dom_1.$eP)(entry.container);
                }
                else {
                    (0, dom_1.$dP)(entry.container);
                }
                if (trigger) {
                    this.b.fire({ id: entry.id, visible: !isHidden });
                }
                // Mark first/last visible entry
                this.y();
            }
        }
        u() {
            if (this.g.size > 0) {
                this.h.store($byb.a, JSON.stringify(Array.from(this.g.values())), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            }
            else {
                this.h.remove($byb.a, 0 /* StorageScope.PROFILE */);
            }
        }
        w() {
            // Split up entries into 2 buckets:
            // - those with `priority: number` that can be compared
            // - those with `priority: string` that must be sorted
            //   relative to another entry if possible
            const mapEntryWithNumberedPriorityToIndex = new Map();
            const mapEntryWithRelativePriority = new Map();
            for (let i = 0; i < this.c.length; i++) {
                const entry = this.c[i];
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
                        sortedEntries.push(...relativeEntries.filter(entry => (0, statusbar_1.$7$)(entry.priority.primary) && entry.priority.primary.alignment === 0 /* StatusbarAlignment.LEFT */));
                    }
                    // Fill referenced entry
                    sortedEntries.push(entry);
                    // Fill relative entries to RIGHT
                    if (relativeEntries) {
                        sortedEntries.push(...relativeEntries.filter(entry => (0, statusbar_1.$7$)(entry.priority.primary) && entry.priority.primary.alignment === 1 /* StatusbarAlignment.RIGHT */));
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
            this.c = sortedEntries;
        }
        y() {
            this.z(this.getEntries(0 /* StatusbarAlignment.LEFT */));
            this.z(this.getEntries(1 /* StatusbarAlignment.RIGHT */));
        }
        z(entries) {
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
    exports.$byb = $byb;
});
//# sourceMappingURL=statusbarModel.js.map