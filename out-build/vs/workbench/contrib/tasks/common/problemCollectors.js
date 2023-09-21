/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/contrib/tasks/common/problemMatcher", "vs/platform/markers/common/markers", "vs/base/common/uuid", "vs/base/common/platform"], function (require, exports, uri_1, event_1, lifecycle_1, problemMatcher_1, markers_1, uuid_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$yXb = exports.$xXb = exports.ProblemHandlingStrategy = exports.$wXb = exports.ProblemCollectorEventKind = void 0;
    var ProblemCollectorEventKind;
    (function (ProblemCollectorEventKind) {
        ProblemCollectorEventKind["BackgroundProcessingBegins"] = "backgroundProcessingBegins";
        ProblemCollectorEventKind["BackgroundProcessingEnds"] = "backgroundProcessingEnds";
    })(ProblemCollectorEventKind || (exports.ProblemCollectorEventKind = ProblemCollectorEventKind = {}));
    var IProblemCollectorEvent;
    (function (IProblemCollectorEvent) {
        function create(kind) {
            return Object.freeze({ kind });
        }
        IProblemCollectorEvent.create = create;
    })(IProblemCollectorEvent || (IProblemCollectorEvent = {}));
    class $wXb extends lifecycle_1.$kc {
        constructor(problemMatchers, D, F, fileService) {
            super();
            this.problemMatchers = problemMatchers;
            this.D = D;
            this.F = F;
            this.m = new lifecycle_1.$jc();
            this.y = new event_1.$fd();
            this.onDidFindFirstMatch = this.y.event;
            this.z = new event_1.$fd();
            this.onDidFindErrors = this.z.event;
            this.C = new event_1.$fd();
            this.onDidRequestInvalidateLastMarker = this.C.event;
            this.a = Object.create(null);
            this.h = 1;
            problemMatchers.map(elem => (0, problemMatcher_1.$5F)(elem, fileService)).forEach((matcher) => {
                const length = matcher.matchLength;
                if (length > this.h) {
                    this.h = length;
                }
                let value = this.a[length];
                if (!value) {
                    value = [];
                    this.a[length] = value;
                }
                value.push(matcher);
            });
            this.g = [];
            this.b = null;
            this.c = 0;
            this.f = undefined;
            this.j = Object.create(null);
            this.r = new Map();
            for (const problemMatcher of problemMatchers) {
                const current = this.r.get(problemMatcher.owner);
                if (current === undefined) {
                    this.r.set(problemMatcher.owner, problemMatcher.applyTo);
                }
                else {
                    this.r.set(problemMatcher.owner, this.J(current, problemMatcher.applyTo));
                }
            }
            this.s = new Map();
            this.t = new Map();
            this.u = new Map();
            this.B(this.F.onModelAdded((model) => {
                this.j[model.uri.toString()] = true;
            }, this, this.m));
            this.B(this.F.onModelRemoved((model) => {
                delete this.j[model.uri.toString()];
            }, this, this.m));
            this.F.getModels().forEach(model => this.j[model.uri.toString()] = true);
            this.w = new event_1.$fd();
        }
        get onDidStateChange() {
            return this.w.event;
        }
        processLine(line) {
            if (this.n) {
                const oldTail = this.n;
                this.n = oldTail.then(() => {
                    return this.G(line);
                });
            }
            else {
                this.n = this.G(line);
            }
        }
        dispose() {
            super.dispose();
            this.m.dispose();
        }
        get numberOfMatches() {
            return this.c;
        }
        get maxMarkerSeverity() {
            return this.f;
        }
        H(line) {
            let result = null;
            if (this.b) {
                result = this.b.next(line);
                if (result) {
                    this.M(result);
                    return result;
                }
                this.N();
                this.b = null;
            }
            if (this.g.length < this.h) {
                this.g.push(line);
            }
            else {
                const end = this.g.length - 1;
                for (let i = 0; i < end; i++) {
                    this.g[i] = this.g[i + 1];
                }
                this.g[end] = line;
            }
            result = this.L();
            if (result) {
                this.N();
            }
            return result;
        }
        async I(result) {
            switch (result.description.applyTo) {
                case problemMatcher_1.ApplyToKind.allDocuments:
                    return true;
                case problemMatcher_1.ApplyToKind.openDocuments:
                    return !!this.j[(await result.resource).toString()];
                case problemMatcher_1.ApplyToKind.closedDocuments:
                    return !this.j[(await result.resource).toString()];
                default:
                    return true;
            }
        }
        J(current, value) {
            if (current === value || current === problemMatcher_1.ApplyToKind.allDocuments) {
                return current;
            }
            return problemMatcher_1.ApplyToKind.allDocuments;
        }
        L() {
            this.b = null;
            const length = this.g.length;
            for (let startIndex = 0; startIndex < length; startIndex++) {
                const candidates = this.a[length - startIndex];
                if (!candidates) {
                    continue;
                }
                for (const matcher of candidates) {
                    const result = matcher.handle(this.g, startIndex);
                    if (result.match) {
                        this.M(result.match);
                        if (result.continue) {
                            this.b = matcher;
                        }
                        return result.match;
                    }
                }
            }
            return null;
        }
        M(match) {
            this.c++;
            if (this.f === undefined || match.marker.severity > this.f) {
                this.f = match.marker.severity;
            }
        }
        N() {
            if (this.g.length > 0) {
                this.g = [];
            }
        }
        O(owner) {
            const resourceSetToClean = this.R(owner);
            this.D.read({ owner: owner }).forEach(marker => resourceSetToClean.set(marker.resource.toString(), marker.resource));
        }
        P(owner, resource) {
            this.R(owner).set(resource.toString(), resource);
        }
        Q(owner, resource) {
            const resourceSet = this.s.get(owner);
            resourceSet?.delete(resource);
        }
        R(owner) {
            let result = this.s.get(owner);
            if (!result) {
                result = new Map();
                this.s.set(owner, result);
            }
            return result;
        }
        S() {
            this.s.forEach((value, owner) => {
                this.W(owner, value);
            });
            this.s = new Map();
        }
        U(owner) {
            const toClean = this.s.get(owner);
            if (toClean) {
                this.W(owner, toClean);
                this.s.delete(owner);
            }
        }
        W(owner, toClean) {
            const uris = [];
            const applyTo = this.r.get(owner);
            toClean.forEach((uri, uriAsString) => {
                if (applyTo === problemMatcher_1.ApplyToKind.allDocuments ||
                    (applyTo === problemMatcher_1.ApplyToKind.openDocuments && this.j[uriAsString]) ||
                    (applyTo === problemMatcher_1.ApplyToKind.closedDocuments && !this.j[uriAsString])) {
                    uris.push(uri);
                }
            });
            this.D.remove(owner, uris);
        }
        X(marker, owner, resourceAsString) {
            let markersPerOwner = this.t.get(owner);
            if (!markersPerOwner) {
                markersPerOwner = new Map();
                this.t.set(owner, markersPerOwner);
            }
            let markersPerResource = markersPerOwner.get(resourceAsString);
            if (!markersPerResource) {
                markersPerResource = new Map();
                markersPerOwner.set(resourceAsString, markersPerResource);
            }
            const key = markers_1.IMarkerData.makeKeyOptionalMessage(marker, false);
            let existingMarker;
            if (!markersPerResource.has(key)) {
                markersPerResource.set(key, marker);
            }
            else if (((existingMarker = markersPerResource.get(key)) !== undefined) && (existingMarker.message.length < marker.message.length) && platform_1.$i) {
                // Most likely https://github.com/microsoft/vscode/issues/77475
                // Heuristic dictates that when the key is the same and message is smaller, we have hit this limitation.
                markersPerResource.set(key, marker);
            }
        }
        Y() {
            this.t.forEach((markersPerOwner, owner) => {
                const deliveredMarkersPerOwner = this.ab(owner);
                markersPerOwner.forEach((markers, resource) => {
                    this.$(owner, resource, markers, deliveredMarkersPerOwner);
                });
            });
        }
        Z(owner, resource) {
            const markersPerOwner = this.t.get(owner);
            if (!markersPerOwner) {
                return;
            }
            const deliveredMarkersPerOwner = this.ab(owner);
            const markersPerResource = markersPerOwner.get(resource);
            if (!markersPerResource) {
                return;
            }
            this.$(owner, resource, markersPerResource, deliveredMarkersPerOwner);
        }
        $(owner, resource, markers, reported) {
            if (markers.size !== reported.get(resource)) {
                const toSet = [];
                markers.forEach(value => toSet.push(value));
                this.D.changeOne(owner, uri_1.URI.parse(resource), toSet);
                reported.set(resource, markers.size);
            }
        }
        ab(owner) {
            let result = this.u.get(owner);
            if (!result) {
                result = new Map();
                this.u.set(owner, result);
            }
            return result;
        }
        bb() {
            this.c = 0;
            this.f = undefined;
            this.t.clear();
            this.u.clear();
        }
        done() {
            this.Y();
            this.S();
        }
    }
    exports.$wXb = $wXb;
    var ProblemHandlingStrategy;
    (function (ProblemHandlingStrategy) {
        ProblemHandlingStrategy[ProblemHandlingStrategy["Clean"] = 0] = "Clean";
    })(ProblemHandlingStrategy || (exports.ProblemHandlingStrategy = ProblemHandlingStrategy = {}));
    class $xXb extends $wXb {
        constructor(problemMatchers, markerService, modelService, _strategy = 0 /* ProblemHandlingStrategy.Clean */, fileService) {
            super(problemMatchers, markerService, modelService, fileService);
            const ownerSet = Object.create(null);
            problemMatchers.forEach(description => ownerSet[description.owner] = true);
            this.cb = Object.keys(ownerSet);
            this.cb.forEach((owner) => {
                this.O(owner);
            });
        }
        async G(line) {
            const markerMatch = this.H(line);
            if (!markerMatch) {
                return;
            }
            const owner = markerMatch.description.owner;
            const resource = await markerMatch.resource;
            const resourceAsString = resource.toString();
            this.Q(owner, resourceAsString);
            const shouldApplyMatch = await this.I(markerMatch);
            if (shouldApplyMatch) {
                this.X(markerMatch.marker, owner, resourceAsString);
                if (this.db !== owner || this.eb !== resourceAsString) {
                    if (this.db && this.eb) {
                        this.Z(this.db, this.eb);
                    }
                    this.db = owner;
                    this.eb = resourceAsString;
                }
            }
        }
    }
    exports.$xXb = $xXb;
    class $yXb extends $wXb {
        constructor(problemMatchers, markerService, modelService, fileService) {
            super(problemMatchers, markerService, modelService, fileService);
            this.gb = [];
            this.beginPatterns = [];
            this.kb();
            this.cb = [];
            this.db = new Set();
            this.problemMatchers.forEach(matcher => {
                if (matcher.watching) {
                    const key = (0, uuid_1.$4f)();
                    this.cb.push({
                        key,
                        matcher: matcher,
                        begin: matcher.watching.beginsPattern,
                        end: matcher.watching.endsPattern
                    });
                    this.beginPatterns.push(matcher.watching.beginsPattern.regexp);
                }
            });
            this.m.add(this.F.onModelRemoved(modelEvent => {
                let markerChanged = event_1.Event.debounce(this.D.onMarkerChanged, (last, e) => {
                    return (last ?? []).concat(e);
                }, 500)(async (markerEvent) => {
                    markerChanged?.dispose();
                    markerChanged = undefined;
                    if (!markerEvent.includes(modelEvent.uri) || (this.D.read({ resource: modelEvent.uri }).length !== 0)) {
                        return;
                    }
                    const oldLines = Array.from(this.gb);
                    for (const line of oldLines) {
                        await this.G(line);
                    }
                });
                setTimeout(async () => {
                    markerChanged?.dispose();
                    markerChanged = undefined;
                }, 600);
            }));
        }
        aboutToStart() {
            for (const background of this.cb) {
                if (background.matcher.watching && background.matcher.watching.activeOnStart) {
                    this.db.add(background.key);
                    this.w.fire(IProblemCollectorEvent.create("backgroundProcessingBegins" /* ProblemCollectorEventKind.BackgroundProcessingBegins */));
                    this.O(background.matcher.owner);
                }
            }
        }
        async G(line) {
            if (await this.ib(line) || this.jb(line)) {
                return;
            }
            this.gb.push(line);
            const markerMatch = this.H(line);
            if (!markerMatch) {
                return;
            }
            const resource = await markerMatch.resource;
            const owner = markerMatch.description.owner;
            const resourceAsString = resource.toString();
            this.Q(owner, resourceAsString);
            const shouldApplyMatch = await this.I(markerMatch);
            if (shouldApplyMatch) {
                this.X(markerMatch.marker, owner, resourceAsString);
                if (this.eb !== owner || this.fb !== resourceAsString) {
                    this.lb();
                    this.eb = owner;
                    this.fb = resourceAsString;
                }
            }
        }
        forceDelivery() {
            this.lb();
        }
        async ib(line) {
            let result = false;
            for (const background of this.cb) {
                const matches = background.begin.regexp.exec(line);
                if (matches) {
                    if (this.db.has(background.key)) {
                        continue;
                    }
                    this.db.add(background.key);
                    result = true;
                    this.y.fire();
                    this.gb = [];
                    this.gb.push(line);
                    this.w.fire(IProblemCollectorEvent.create("backgroundProcessingBegins" /* ProblemCollectorEventKind.BackgroundProcessingBegins */));
                    this.bb();
                    this.kb();
                    const owner = background.matcher.owner;
                    const file = matches[background.begin.file];
                    if (file) {
                        const resource = (0, problemMatcher_1.$4F)(file, background.matcher);
                        this.P(owner, await resource);
                    }
                    else {
                        this.O(owner);
                    }
                }
            }
            return result;
        }
        jb(line) {
            let result = false;
            for (const background of this.cb) {
                const matches = background.end.regexp.exec(line);
                if (matches) {
                    if (this.c > 0) {
                        this.z.fire();
                    }
                    else {
                        this.C.fire();
                    }
                    if (this.db.has(background.key)) {
                        this.db.delete(background.key);
                        this.kb();
                        this.w.fire(IProblemCollectorEvent.create("backgroundProcessingEnds" /* ProblemCollectorEventKind.BackgroundProcessingEnds */));
                        result = true;
                        this.gb.push(line);
                        const owner = background.matcher.owner;
                        this.U(owner);
                        this.bb();
                    }
                }
            }
            return result;
        }
        kb() {
            this.lb();
            this.eb = undefined;
            this.fb = undefined;
        }
        lb() {
            if (this.eb && this.fb) {
                this.Z(this.eb, this.fb);
            }
        }
        done() {
            [...this.r.keys()].forEach(owner => {
                this.O(owner);
            });
            super.done();
        }
        isWatching() {
            return this.cb.length > 0;
        }
    }
    exports.$yXb = $yXb;
});
//# sourceMappingURL=problemCollectors.js.map