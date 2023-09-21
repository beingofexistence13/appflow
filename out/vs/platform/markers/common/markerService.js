/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/iterator", "vs/base/common/map", "vs/base/common/network", "vs/base/common/uri", "./markers"], function (require, exports, arrays_1, event_1, iterator_1, map_1, network_1, uri_1, markers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MarkerService = exports.unsupportedSchemas = void 0;
    exports.unsupportedSchemas = new Set([network_1.Schemas.inMemory, network_1.Schemas.vscodeSourceControl, network_1.Schemas.walkThrough, network_1.Schemas.walkThroughSnippet]);
    class DoubleResourceMap {
        constructor() {
            this._byResource = new map_1.ResourceMap();
            this._byOwner = new Map();
        }
        set(resource, owner, value) {
            let ownerMap = this._byResource.get(resource);
            if (!ownerMap) {
                ownerMap = new Map();
                this._byResource.set(resource, ownerMap);
            }
            ownerMap.set(owner, value);
            let resourceMap = this._byOwner.get(owner);
            if (!resourceMap) {
                resourceMap = new map_1.ResourceMap();
                this._byOwner.set(owner, resourceMap);
            }
            resourceMap.set(resource, value);
        }
        get(resource, owner) {
            const ownerMap = this._byResource.get(resource);
            return ownerMap?.get(owner);
        }
        delete(resource, owner) {
            let removedA = false;
            let removedB = false;
            const ownerMap = this._byResource.get(resource);
            if (ownerMap) {
                removedA = ownerMap.delete(owner);
            }
            const resourceMap = this._byOwner.get(owner);
            if (resourceMap) {
                removedB = resourceMap.delete(resource);
            }
            if (removedA !== removedB) {
                throw new Error('illegal state');
            }
            return removedA && removedB;
        }
        values(key) {
            if (typeof key === 'string') {
                return this._byOwner.get(key)?.values() ?? iterator_1.Iterable.empty();
            }
            if (uri_1.URI.isUri(key)) {
                return this._byResource.get(key)?.values() ?? iterator_1.Iterable.empty();
            }
            return iterator_1.Iterable.map(iterator_1.Iterable.concat(...this._byOwner.values()), map => map[1]);
        }
    }
    class MarkerStats {
        constructor(service) {
            this.errors = 0;
            this.infos = 0;
            this.warnings = 0;
            this.unknowns = 0;
            this._data = new map_1.ResourceMap();
            this._service = service;
            this._subscription = service.onMarkerChanged(this._update, this);
        }
        dispose() {
            this._subscription.dispose();
        }
        _update(resources) {
            for (const resource of resources) {
                const oldStats = this._data.get(resource);
                if (oldStats) {
                    this._substract(oldStats);
                }
                const newStats = this._resourceStats(resource);
                this._add(newStats);
                this._data.set(resource, newStats);
            }
        }
        _resourceStats(resource) {
            const result = { errors: 0, warnings: 0, infos: 0, unknowns: 0 };
            // TODO this is a hack
            if (exports.unsupportedSchemas.has(resource.scheme)) {
                return result;
            }
            for (const { severity } of this._service.read({ resource })) {
                if (severity === markers_1.MarkerSeverity.Error) {
                    result.errors += 1;
                }
                else if (severity === markers_1.MarkerSeverity.Warning) {
                    result.warnings += 1;
                }
                else if (severity === markers_1.MarkerSeverity.Info) {
                    result.infos += 1;
                }
                else {
                    result.unknowns += 1;
                }
            }
            return result;
        }
        _substract(op) {
            this.errors -= op.errors;
            this.warnings -= op.warnings;
            this.infos -= op.infos;
            this.unknowns -= op.unknowns;
        }
        _add(op) {
            this.errors += op.errors;
            this.warnings += op.warnings;
            this.infos += op.infos;
            this.unknowns += op.unknowns;
        }
    }
    class MarkerService {
        constructor() {
            this._onMarkerChanged = new event_1.DebounceEmitter({
                delay: 0,
                merge: MarkerService._merge
            });
            this.onMarkerChanged = this._onMarkerChanged.event;
            this._data = new DoubleResourceMap();
            this._stats = new MarkerStats(this);
        }
        dispose() {
            this._stats.dispose();
            this._onMarkerChanged.dispose();
        }
        getStatistics() {
            return this._stats;
        }
        remove(owner, resources) {
            for (const resource of resources || []) {
                this.changeOne(owner, resource, []);
            }
        }
        changeOne(owner, resource, markerData) {
            if ((0, arrays_1.isFalsyOrEmpty)(markerData)) {
                // remove marker for this (owner,resource)-tuple
                const removed = this._data.delete(resource, owner);
                if (removed) {
                    this._onMarkerChanged.fire([resource]);
                }
            }
            else {
                // insert marker for this (owner,resource)-tuple
                const markers = [];
                for (const data of markerData) {
                    const marker = MarkerService._toMarker(owner, resource, data);
                    if (marker) {
                        markers.push(marker);
                    }
                }
                this._data.set(resource, owner, markers);
                this._onMarkerChanged.fire([resource]);
            }
        }
        static _toMarker(owner, resource, data) {
            let { code, severity, message, source, startLineNumber, startColumn, endLineNumber, endColumn, relatedInformation, tags, } = data;
            if (!message) {
                return undefined;
            }
            // santize data
            startLineNumber = startLineNumber > 0 ? startLineNumber : 1;
            startColumn = startColumn > 0 ? startColumn : 1;
            endLineNumber = endLineNumber >= startLineNumber ? endLineNumber : startLineNumber;
            endColumn = endColumn > 0 ? endColumn : startColumn;
            return {
                resource,
                owner,
                code,
                severity,
                message,
                source,
                startLineNumber,
                startColumn,
                endLineNumber,
                endColumn,
                relatedInformation,
                tags,
            };
        }
        changeAll(owner, data) {
            const changes = [];
            // remove old marker
            const existing = this._data.values(owner);
            if (existing) {
                for (const data of existing) {
                    const first = iterator_1.Iterable.first(data);
                    if (first) {
                        changes.push(first.resource);
                        this._data.delete(first.resource, owner);
                    }
                }
            }
            // add new markers
            if ((0, arrays_1.isNonEmptyArray)(data)) {
                // group by resource
                const groups = new map_1.ResourceMap();
                for (const { resource, marker: markerData } of data) {
                    const marker = MarkerService._toMarker(owner, resource, markerData);
                    if (!marker) {
                        // filter bad markers
                        continue;
                    }
                    const array = groups.get(resource);
                    if (!array) {
                        groups.set(resource, [marker]);
                        changes.push(resource);
                    }
                    else {
                        array.push(marker);
                    }
                }
                // insert all
                for (const [resource, value] of groups) {
                    this._data.set(resource, owner, value);
                }
            }
            if (changes.length > 0) {
                this._onMarkerChanged.fire(changes);
            }
        }
        read(filter = Object.create(null)) {
            let { owner, resource, severities, take } = filter;
            if (!take || take < 0) {
                take = -1;
            }
            if (owner && resource) {
                // exactly one owner AND resource
                const data = this._data.get(resource, owner);
                if (!data) {
                    return [];
                }
                else {
                    const result = [];
                    for (const marker of data) {
                        if (MarkerService._accept(marker, severities)) {
                            const newLen = result.push(marker);
                            if (take > 0 && newLen === take) {
                                break;
                            }
                        }
                    }
                    return result;
                }
            }
            else if (!owner && !resource) {
                // all
                const result = [];
                for (const markers of this._data.values()) {
                    for (const data of markers) {
                        if (MarkerService._accept(data, severities)) {
                            const newLen = result.push(data);
                            if (take > 0 && newLen === take) {
                                return result;
                            }
                        }
                    }
                }
                return result;
            }
            else {
                // of one resource OR owner
                const iterable = this._data.values(resource ?? owner);
                const result = [];
                for (const markers of iterable) {
                    for (const data of markers) {
                        if (MarkerService._accept(data, severities)) {
                            const newLen = result.push(data);
                            if (take > 0 && newLen === take) {
                                return result;
                            }
                        }
                    }
                }
                return result;
            }
        }
        static _accept(marker, severities) {
            return severities === undefined || (severities & marker.severity) === marker.severity;
        }
        // --- event debounce logic
        static _merge(all) {
            const set = new map_1.ResourceMap();
            for (const array of all) {
                for (const item of array) {
                    set.set(item, true);
                }
            }
            return Array.from(set.keys());
        }
    }
    exports.MarkerService = MarkerService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2VyU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL21hcmtlcnMvY29tbW9uL21hcmtlclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBV25GLFFBQUEsa0JBQWtCLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxpQkFBTyxDQUFDLFFBQVEsRUFBRSxpQkFBTyxDQUFDLG1CQUFtQixFQUFFLGlCQUFPLENBQUMsV0FBVyxFQUFFLGlCQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO0lBRTVJLE1BQU0saUJBQWlCO1FBQXZCO1lBRVMsZ0JBQVcsR0FBRyxJQUFJLGlCQUFXLEVBQWtCLENBQUM7WUFDaEQsYUFBUSxHQUFHLElBQUksR0FBRyxFQUEwQixDQUFDO1FBa0R0RCxDQUFDO1FBaERBLEdBQUcsQ0FBQyxRQUFhLEVBQUUsS0FBYSxFQUFFLEtBQVE7WUFDekMsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDZCxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFDckIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2FBQ3pDO1lBQ0QsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFM0IsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDM0MsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDakIsV0FBVyxHQUFHLElBQUksaUJBQVcsRUFBRSxDQUFDO2dCQUNoQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUs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