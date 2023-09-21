/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/resources", "vs/editor/common/core/range", "vs/platform/markers/common/markers", "vs/base/common/arrays", "vs/base/common/map", "vs/base/common/event", "vs/base/common/hash", "vs/base/common/strings", "vs/platform/markers/common/markerService"], function (require, exports, resources_1, range_1, markers_1, arrays_1, map_1, event_1, hash_1, strings_1, markerService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ySb = exports.$xSb = exports.$wSb = exports.$vSb = exports.$uSb = exports.$tSb = void 0;
    function $tSb(a, b) {
        return resources_1.$$f.compare(a.resource, b.resource);
    }
    exports.$tSb = $tSb;
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
    class $uSb {
        constructor(id, resource) {
            this.id = id;
            this.resource = resource;
            this.c = new map_1.$zi();
            this.e = 0;
            this.path = this.resource.fsPath;
            this.name = (0, resources_1.$fg)(this.resource);
        }
        get markers() {
            if (!this.d) {
                this.d = (0, arrays_1.$Pb)([...this.c.values()]).sort($uSb.f);
            }
            return this.d;
        }
        has(uri) {
            return this.c.has(uri);
        }
        set(uri, marker) {
            this.delete(uri);
            if ((0, arrays_1.$Jb)(marker)) {
                this.c.set(uri, marker);
                this.e += marker.length;
                this.d = undefined;
            }
        }
        delete(uri) {
            const array = this.c.get(uri);
            if (array) {
                this.e -= array.length;
                this.d = undefined;
                this.c.delete(uri);
            }
        }
        get total() {
            return this.e;
        }
        static f(a, b) {
            return markers_1.MarkerSeverity.compare(a.marker.severity, b.marker.severity)
                || resources_1.$$f.compare(a.resource, b.resource)
                || range_1.$ks.compareRangesUsingStarts(a.marker, b.marker);
        }
    }
    exports.$uSb = $uSb;
    class $vSb {
        get resource() { return this.marker.resource; }
        get range() { return this.marker; }
        get lines() {
            if (!this.c) {
                this.c = (0, strings_1.$Ae)(this.marker.message);
            }
            return this.c;
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
    exports.$vSb = $vSb;
    class $wSb extends $vSb {
        constructor(marker, sourceMatches, codeMatches, messageMatches, fileMatches, ownerMatches) {
            super(marker.id, marker.marker, marker.relatedInformation);
            this.sourceMatches = sourceMatches;
            this.codeMatches = codeMatches;
            this.messageMatches = messageMatches;
            this.fileMatches = fileMatches;
            this.ownerMatches = ownerMatches;
        }
    }
    exports.$wSb = $wSb;
    class $xSb {
        constructor(id, marker, raw) {
            this.id = id;
            this.marker = marker;
            this.raw = raw;
        }
    }
    exports.$xSb = $xSb;
    class $ySb {
        get resourceMarkers() {
            if (!this.d) {
                this.d = [...this.f.values()].sort(compareResourceMarkers);
            }
            return this.d;
        }
        constructor() {
            this.d = undefined;
            this.e = new event_1.$fd();
            this.onDidChange = this.e.event;
            this.g = 0;
            this.f = new Map();
        }
        reset() {
            const removed = new Set();
            for (const resourceMarker of this.f.values()) {
                removed.add(resourceMarker);
            }
            this.f.clear();
            this.g = 0;
            this.e.fire({ removed, added: new Set(), updated: new Set() });
        }
        get total() {
            return this.g;
        }
        getResourceMarkers(resource) {
            return this.f.get(resources_1.$$f.getComparisonKey(resource, true)) ?? null;
        }
        setResourceMarkers(resourcesMarkers) {
            const change = { added: new Set(), removed: new Set(), updated: new Set() };
            for (const [resource, rawMarkers] of resourcesMarkers) {
                if (markerService_1.$LBb.has(resource.scheme)) {
                    continue;
                }
                const key = resources_1.$$f.getComparisonKey(resource, true);
                let resourceMarkers = this.f.get(key);
                if ((0, arrays_1.$Jb)(rawMarkers)) {
                    // update, add
                    if (!resourceMarkers) {
                        const resourceMarkersId = this.h(resource.toString());
                        resourceMarkers = new $uSb(resourceMarkersId, resource.with({ fragment: null }));
                        this.f.set(key, resourceMarkers);
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
                        const markerId = this.h(resourceMarkers.id, key, index, rawMarker.resource.toString());
                        let relatedInformation = undefined;
                        if (rawMarker.relatedInformation) {
                            relatedInformation = rawMarker.relatedInformation.map((r, index) => new $xSb(this.h(markerId, r.resource.toString(), r.startLineNumber, r.startColumn, r.endLineNumber, r.endColumn, index), rawMarker, r));
                        }
                        return new $vSb(markerId, rawMarker, relatedInformation);
                    });
                    this.g -= resourceMarkers.total;
                    resourceMarkers.set(resource, markers);
                    this.g += resourceMarkers.total;
                }
                else if (resourceMarkers) {
                    // clear
                    this.g -= resourceMarkers.total;
                    resourceMarkers.delete(resource);
                    this.g += resourceMarkers.total;
                    if (resourceMarkers.total === 0) {
                        this.f.delete(key);
                        change.removed.add(resourceMarkers);
                    }
                    else {
                        change.updated.add(resourceMarkers);
                    }
                }
            }
            this.d = undefined;
            if (change.added.size || change.removed.size || change.updated.size) {
                this.e.fire(change);
            }
        }
        h(...values) {
            const hasher = new hash_1.$ti();
            for (const value of values) {
                hasher.hash(value);
            }
            return `${hasher.value}`;
        }
        dispose() {
            this.e.dispose();
            this.f.clear();
        }
    }
    exports.$ySb = $ySb;
});
//# sourceMappingURL=markersModel.js.map