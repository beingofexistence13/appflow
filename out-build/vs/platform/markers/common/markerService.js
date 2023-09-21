/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/iterator", "vs/base/common/map", "vs/base/common/network", "vs/base/common/uri", "./markers"], function (require, exports, arrays_1, event_1, iterator_1, map_1, network_1, uri_1, markers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$MBb = exports.$LBb = void 0;
    exports.$LBb = new Set([network_1.Schemas.inMemory, network_1.Schemas.vscodeSourceControl, network_1.Schemas.walkThrough, network_1.Schemas.walkThroughSnippet]);
    class DoubleResourceMap {
        constructor() {
            this.a = new map_1.$zi();
            this.b = new Map();
        }
        set(resource, owner, value) {
            let ownerMap = this.a.get(resource);
            if (!ownerMap) {
                ownerMap = new Map();
                this.a.set(resource, ownerMap);
            }
            ownerMap.set(owner, value);
            let resourceMap = this.b.get(owner);
            if (!resourceMap) {
                resourceMap = new map_1.$zi();
                this.b.set(owner, resourceMap);
            }
            resourceMap.set(resource, value);
        }
        get(resource, owner) {
            const ownerMap = this.a.get(resource);
            return ownerMap?.get(owner);
        }
        delete(resource, owner) {
            let removedA = false;
            let removedB = false;
            const ownerMap = this.a.get(resource);
            if (ownerMap) {
                removedA = ownerMap.delete(owner);
            }
            const resourceMap = this.b.get(owner);
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
                return this.b.get(key)?.values() ?? iterator_1.Iterable.empty();
            }
            if (uri_1.URI.isUri(key)) {
                return this.a.get(key)?.values() ?? iterator_1.Iterable.empty();
            }
            return iterator_1.Iterable.map(iterator_1.Iterable.concat(...this.b.values()), map => map[1]);
        }
    }
    class MarkerStats {
        constructor(service) {
            this.errors = 0;
            this.infos = 0;
            this.warnings = 0;
            this.unknowns = 0;
            this.a = new map_1.$zi();
            this.b = service;
            this.c = service.onMarkerChanged(this.d, this);
        }
        dispose() {
            this.c.dispose();
        }
        d(resources) {
            for (const resource of resources) {
                const oldStats = this.a.get(resource);
                if (oldStats) {
                    this.f(oldStats);
                }
                const newStats = this.e(resource);
                this.g(newStats);
                this.a.set(resource, newStats);
            }
        }
        e(resource) {
            const result = { errors: 0, warnings: 0, infos: 0, unknowns: 0 };
            // TODO this is a hack
            if (exports.$LBb.has(resource.scheme)) {
                return result;
            }
            for (const { severity } of this.b.read({ resource })) {
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
        f(op) {
            this.errors -= op.errors;
            this.warnings -= op.warnings;
            this.infos -= op.infos;
            this.unknowns -= op.unknowns;
        }
        g(op) {
            this.errors += op.errors;
            this.warnings += op.warnings;
            this.infos += op.infos;
            this.unknowns += op.unknowns;
        }
    }
    class $MBb {
        constructor() {
            this.a = new event_1.$jd({
                delay: 0,
                merge: $MBb.f
            });
            this.onMarkerChanged = this.a.event;
            this.b = new DoubleResourceMap();
            this.c = new MarkerStats(this);
        }
        dispose() {
            this.c.dispose();
            this.a.dispose();
        }
        getStatistics() {
            return this.c;
        }
        remove(owner, resources) {
            for (const resource of resources || []) {
                this.changeOne(owner, resource, []);
            }
        }
        changeOne(owner, resource, markerData) {
            if ((0, arrays_1.$Ib)(markerData)) {
                // remove marker for this (owner,resource)-tuple
                const removed = this.b.delete(resource, owner);
                if (removed) {
                    this.a.fire([resource]);
                }
            }
            else {
                // insert marker for this (owner,resource)-tuple
                const markers = [];
                for (const data of markerData) {
                    const marker = $MBb.d(owner, resource, data);
                    if (marker) {
                        markers.push(marker);
                    }
                }
                this.b.set(resource, owner, markers);
                this.a.fire([resource]);
            }
        }
        static d(owner, resource, data) {
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
            const existing = this.b.values(owner);
            if (existing) {
                for (const data of existing) {
                    const first = iterator_1.Iterable.first(data);
                    if (first) {
                        changes.push(first.resource);
                        this.b.delete(first.resource, owner);
                    }
                }
            }
            // add new markers
            if ((0, arrays_1.$Jb)(data)) {
                // group by resource
                const groups = new map_1.$zi();
                for (const { resource, marker: markerData } of data) {
                    const marker = $MBb.d(owner, resource, markerData);
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
                    this.b.set(resource, owner, value);
                }
            }
            if (changes.length > 0) {
                this.a.fire(changes);
            }
        }
        read(filter = Object.create(null)) {
            let { owner, resource, severities, take } = filter;
            if (!take || take < 0) {
                take = -1;
            }
            if (owner && resource) {
                // exactly one owner AND resource
                const data = this.b.get(resource, owner);
                if (!data) {
                    return [];
                }
                else {
                    const result = [];
                    for (const marker of data) {
                        if ($MBb.e(marker, severities)) {
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
                for (const markers of this.b.values()) {
                    for (const data of markers) {
                        if ($MBb.e(data, severities)) {
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
                const iterable = this.b.values(resource ?? owner);
                const result = [];
                for (const markers of iterable) {
                    for (const data of markers) {
                        if ($MBb.e(data, severities)) {
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
        static e(marker, severities) {
            return severities === undefined || (severities & marker.severity) === marker.severity;
        }
        // --- event debounce logic
        static f(all) {
            const set = new map_1.$zi();
            for (const array of all) {
                for (const item of array) {
                    set.set(item, true);
                }
            }
            return Array.from(set.keys());
        }
    }
    exports.$MBb = $MBb;
});
//# sourceMappingURL=markerService.js.map