/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/resources", "vs/editor/common/core/range", "vs/platform/markers/common/markers", "vs/base/common/arrays", "vs/base/common/map", "vs/base/common/event", "vs/base/common/hash", "vs/base/common/strings", "vs/platform/markers/common/markerService"], function (require, exports, resources_1, range_1, markers_1, arrays_1, map_1, event_1, hash_1, strings_1, markerService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MarkersModel = exports.RelatedInformation = exports.MarkerTableItem = exports.Marker = exports.ResourceMarkers = exports.compareMarkersByUri = void 0;
    function compareMarkersByUri(a, b) {
        return resources_1.extUri.compare(a.resource, b.resource);
    }
    exports.compareMarkersByUri = compareMarkersByUri;
    function compareResourceMarkers(a, b) {
        const [firstMarkerOfA] = a.markers;
        const [firstMarkerOfB] = b.markers;
        let res = 0;
        if (firstMarkerOfA && firstMarkerOfB) {
            res = markers_1.MarkerSeverity.compare(firstMarkerOfA.marker.severity, firstMarkerOfB.marker.severity);
        }
        if (res === 0) {
            res = a.path.localeCompare(b.path) || a.name.localeCompare(b.name);
        }
        return res;
    }
    class ResourceMarkers {
        constructor(id, resource) {
            this.id = id;
            this.resource = resource;
            this._markersMap = new map_1.ResourceMap();
            this._total = 0;
            this.path = this.resource.fsPath;
            this.name = (0, resources_1.basename)(this.resource);
        }
        get markers() {
            if (!this._cachedMarkers) {
                this._cachedMarkers = (0, arrays_1.flatten)([...this._markersMap.values()]).sort(ResourceMarkers._compareMarkers);
            }
            return this._cachedMarkers;
        }
        has(uri) {
            return this._markersMap.has(uri);
        }
        set(uri, marker) {
            this.delete(uri);
            if ((0, arrays_1.isNonEmptyArray)(marker)) {
                this._markersMap.set(uri, marker);
                this._total += marker.length;
                this._cachedMarkers = undefined;
            }
        }
        delete(uri) {
            const array = this._markersMap.get(uri);
            if (array) {
                this._total -= array.length;
                this._cachedMarkers = undefined;
                this._markersMap.delete(uri);
            }
        }
        get total() {
            return this._total;
        }
        static _compareMarkers(a, b) {
            return markers_1.MarkerSeverity.compare(a.marker.severity, b.marker.severity)
                || resources_1.extUri.compare(a.resource, b.resource)
                || range_1.Range.compareRangesUsingStarts(a.marker, b.marker);
        }
    }
    exports.ResourceMarkers = ResourceMarkers;
    class Marker {
        get resource() { return this.marker.resource; }
        get range() { return this.marker; }
        get lines() {
            if (!this._lines) {
                this._lines = (0, strings_1.splitLines)(this.marker.message);
            }
            return this._lines;
        }
        constructor(id, marker, relatedInformation = []) {
            this.id = id;
            this.marker = marker;
            this.relatedInformation = relatedInformation;
        }
        toString() {
            return JSON.stringify({
                ...this.marker,
                resource: this.marker.resource.path,
                relatedInformation: this.relatedInformation.length ? this.relatedInformation.map(r => ({ ...r.raw, resource: r.raw.resource.path })) : undefined
            }, null, '\t');
        }
    }
    exports.Marker = Marker;
    class MarkerTableItem extends Marker {
        constructor(marker, sourceMatches, codeMatches, messageMatches, fileMatches, ownerMatches) {
            super(marker.id, marker.marker, marker.relatedInformation);
            this.sourceMatches = sourceMatches;
            this.codeMatches = codeMatches;
            this.messageMatches = messageMatches;
            this.fileMatches = fileMatches;
            this.ownerMatches = ownerMatches;
        }
    }
    exports.MarkerTableItem = MarkerTableItem;
    class RelatedInformation {
        constructor(id, marker, raw) {
            this.id = id;
            this.marker = marker;
            this.raw = raw;
        }
    }
    exports.RelatedInformation = RelatedInformation;
    class MarkersModel {
        get resourceMarkers() {
            if (!this.cachedSortedResources) {
                this.cachedSortedResources = [...this.resourcesByUri.values()].sort(compareResourceMarkers);
            }
            return this.cachedSortedResources;
        }
        constructor() {
            this.cachedSortedResources = undefined;
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._total = 0;
            this.resourcesByUri = new Map();
        }
        reset() {
            const removed = new Set();
            for (const resourceMarker of this.resourcesByUri.values()) {
                removed.add(resourceMarker);
            }
            this.resourcesByUri.clear();
            this._total = 0;
            this._onDidChange.fire({ removed, added: new Set(), updated: new Set() });
        }
        get total() {
            return this._total;
        }
        getResourceMarkers(resource) {
            return this.resourcesByUri.get(resources_1.extUri.getComparisonKey(resource, true)) ?? null;
        }
        setResourceMarkers(resourcesMarkers) {
            const change = { added: new Set(), removed: new Set(), updated: new Set() };
            for (const [resource, rawMarkers] of resourcesMarkers) {
                if (markerService_1.unsupportedSchemas.has(resource.scheme)) {
                    continue;
                }
                const key = resources_1.extUri.getComparisonKey(resource, true);
                let resourceMarkers = this.resourcesByUri.get(key);
                if ((0, arrays_1.isNonEmptyArray)(rawMarkers)) {
                    // update, add
                    if (!resourceMarkers) {
                        const resourceMarkersId = this.id(resource.toString());
                        resourceMarkers = new ResourceMarkers(resourceMarkersId, resource.with({ fragment: null }));
                        this.resourcesByUri.set(key, resourceMarkers);
                        change.added.add(resourceMarkers);
                    }
                    else {
                        change.updated.add(resourceMarkers);
                    }
                    const markersCountByKey = new Map();
                    const markers = rawMarkers.map((rawMarker) => {
                        const key = markers_1.IMarkerData.makeKey(rawMarker);
                        const index = markersCountByKey.get(key) || 0;
                        markersCountByKey.set(key, index + 1);
                        const markerId = this.id(resourceMarkers.id, key, index, rawMarker.resource.toString());
                        let relatedInformation = undefined;
                        if (rawMarker.relatedInformation) {
                            relatedInformation = rawMarker.relatedInformation.map((r, index) => new RelatedInformation(this.id(markerId, r.resource.toString(), r.startLineNumber, r.startColumn, r.endLineNumber, r.endColumn, index), rawMarker, r));
                        }
                        return new Marker(markerId, rawMarker, relatedInformation);
                    });
                    this._total -= resourceMarkers.total;
                    resourceMarkers.set(resource, markers);
                    this._total += resourceMarkers.total;
                }
                else if (resourceMarkers) {
                    // clear
                    this._total -= resourceMarkers.total;
                    resourceMarkers.delete(resource);
                    this._total += resourceMarkers.total;
                    if (resourceMarkers.total === 0) {
                        this.resourcesByUri.delete(key);
                        change.removed.add(resourceMarkers);
                    }
                    else {
                        change.updated.add(resourceMarkers);
                    }
                }
            }
            this.cachedSortedResources = undefined;
            if (change.added.size || change.removed.size || change.updated.size) {
                this._onDidChange.fire(change);
            }
        }
        id(...values) {
            const hasher = new hash_1.Hasher();
            for (const value of values) {
                hasher.hash(value);
            }
            return `${hasher.value}`;
        }
        dispose() {
            this._onDidChange.dispose();
            this.resourcesByUri.clear();
        }
    }
    exports.MarkersModel = MarkersModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Vyc01vZGVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbWFya2Vycy9icm93c2VyL21hcmtlcnNNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFnQmhHLFNBQWdCLG1CQUFtQixDQUFDLENBQVUsRUFBRSxDQUFVO1FBQ3pELE9BQU8sa0JBQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUZELGtEQUVDO0lBRUQsU0FBUyxzQkFBc0IsQ0FBQyxDQUFrQixFQUFFLENBQWtCO1FBQ3JFLE1BQU0sQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDO1FBQ25DLE1BQU0sQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDO1FBQ25DLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztRQUNaLElBQUksY0FBYyxJQUFJLGNBQWMsRUFBRTtZQUNyQyxHQUFHLEdBQUcsd0JBQWMsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsY0FBYyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUM3RjtRQUNELElBQUksR0FBRyxLQUFLLENBQUMsRUFBRTtZQUNkLEdBQUcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ25FO1FBQ0QsT0FBTyxHQUFHLENBQUM7SUFDWixDQUFDO0lBR0QsTUFBYSxlQUFlO1FBVTNCLFlBQXFCLEVBQVUsRUFBVyxRQUFhO1lBQWxDLE9BQUUsR0FBRixFQUFFLENBQVE7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