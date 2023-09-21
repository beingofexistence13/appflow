/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/contrib/tasks/common/problemMatcher", "vs/platform/markers/common/markers", "vs/base/common/uuid", "vs/base/common/platform"], function (require, exports, uri_1, event_1, lifecycle_1, problemMatcher_1, markers_1, uuid_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WatchingProblemCollector = exports.StartStopProblemCollector = exports.ProblemHandlingStrategy = exports.AbstractProblemCollector = exports.ProblemCollectorEventKind = void 0;
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
    class AbstractProblemCollector extends lifecycle_1.Disposable {
        constructor(problemMatchers, markerService, modelService, fileService) {
            super();
            this.problemMatchers = problemMatchers;
            this.markerService = markerService;
            this.modelService = modelService;
            this.modelListeners = new lifecycle_1.DisposableStore();
            this._onDidFindFirstMatch = new event_1.Emitter();
            this.onDidFindFirstMatch = this._onDidFindFirstMatch.event;
            this._onDidFindErrors = new event_1.Emitter();
            this.onDidFindErrors = this._onDidFindErrors.event;
            this._onDidRequestInvalidateLastMarker = new event_1.Emitter();
            this.onDidRequestInvalidateLastMarker = this._onDidRequestInvalidateLastMarker.event;
            this.matchers = Object.create(null);
            this.bufferLength = 1;
            problemMatchers.map(elem => (0, problemMatcher_1.createLineMatcher)(elem, fileService)).forEach((matcher) => {
                const length = matcher.matchLength;
                if (length > this.bufferLength) {
                    this.bufferLength = length;
                }
                let value = this.matchers[length];
                if (!value) {
                    value = [];
                    this.matchers[length] = value;
                }
                value.push(matcher);
            });
            this.buffer = [];
            this.activeMatcher = null;
            this._numberOfMatches = 0;
            this._maxMarkerSeverity = undefined;
            this.openModels = Object.create(null);
            this.applyToByOwner = new Map();
            for (const problemMatcher of problemMatchers) {
                const current = this.applyToByOwner.get(problemMatcher.owner);
                if (current === undefined) {
                    this.applyToByOwner.set(problemMatcher.owner, problemMatcher.applyTo);
                }
                else {
                    this.applyToByOwner.set(problemMatcher.owner, this.mergeApplyTo(current, problemMatcher.applyTo));
                }
            }
            this.resourcesToClean = new Map();
            this.markers = new Map();
            this.deliveredMarkers = new Map();
            this._register(this.modelService.onModelAdded((model) => {
                this.openModels[model.uri.toString()] = true;
            }, this, this.modelListeners));
            this._register(this.modelService.onModelRemoved((model) => {
                delete this.openModels[model.uri.toString()];
            }, this, this.modelListeners));
            this.modelService.getModels().forEach(model => this.openModels[model.uri.toString()] = true);
            this._onDidStateChange = new event_1.Emitter();
        }
        get onDidStateChange() {
            return this._onDidStateChange.event;
        }
        processLine(line) {
            if (this.tail) {
                const oldTail = this.tail;
                this.tail = oldTail.then(() => {
                    return this.processLineInternal(line);
                });
            }
            else {
                this.tail = this.processLineInternal(line);
            }
        }
        dispose() {
            super.dispose();
            this.modelListeners.dispose();
        }
        get numberOfMatches() {
            return this._numberOfMatches;
        }
        get maxMarkerSeverity() {
            return this._maxMarkerSeverity;
        }
        tryFindMarker(line) {
            let result = null;
            if (this.activeMatcher) {
                result = this.activeMatcher.next(line);
                if (result) {
                    this.captureMatch(result);
                    return result;
                }
                this.clearBuffer();
                this.activeMatcher = null;
            }
            if (this.buffer.length < this.bufferLength) {
                this.buffer.push(line);
            }
            else {
                const end = this.buffer.length - 1;
                for (let i = 0; i < end; i++) {
                    this.buffer[i] = this.buffer[i + 1];
                }
                this.buffer[end] = line;
            }
            result = this.tryMatchers();
            if (result) {
                this.clearBuffer();
            }
            return result;
        }
        async shouldApplyMatch(result) {
            switch (result.description.applyTo) {
                case problemMatcher_1.ApplyToKind.allDocuments:
                    return true;
                case problemMatcher_1.ApplyToKind.openDocuments:
                    return !!this.openModels[(await result.resource).toString()];
                case problemMatcher_1.ApplyToKind.closedDocuments:
                    return !this.openModels[(await result.resource).toString()];
                default:
                    return true;
            }
        }
        mergeApplyTo(current, value) {
            if (current === value || current === problemMatcher_1.ApplyToKind.allDocuments) {
                return current;
            }
            return problemMatcher_1.ApplyToKind.allDocuments;
        }
        tryMatchers() {
            this.activeMatcher = null;
            const length = this.buffer.length;
            for (let startIndex = 0; startIndex < length; startIndex++) {
                const candidates = this.matchers[length - startIndex];
                if (!candidates) {
                    continue;
                }
                for (const matcher of candidates) {
                    const result = matcher.handle(this.buffer, startIndex);
                    if (result.match) {
                        this.captureMatch(result.match);
                        if (result.continue) {
                            this.activeMatcher = matcher;
                        }
                        return result.match;
                    }
                }
            }
            return null;
        }
        captureMatch(match) {
            this._numberOfMatches++;
            if (this._maxMarkerSeverity === undefined || match.marker.severity > this._maxMarkerSeverity) {
                this._maxMarkerSeverity = match.marker.severity;
            }
        }
        clearBuffer() {
            if (this.buffer.length > 0) {
                this.buffer = [];
            }
        }
        recordResourcesToClean(owner) {
            const resourceSetToClean = this.getResourceSetToClean(owner);
            this.markerService.read({ owner: owner }).forEach(marker => resourceSetToClean.set(marker.resource.toString(), marker.resource));
        }
        recordResourceToClean(owner, resource) {
            this.getResourceSetToClean(owner).set(resource.toString(), resource);
        }
        removeResourceToClean(owner, resource) {
            const resourceSet = this.resourcesToClean.get(owner);
            resourceSet?.delete(resource);
        }
        getResourceSetToClean(owner) {
            let result = this.resourcesToClean.get(owner);
            if (!result) {
                result = new Map();
                this.resourcesToClean.set(owner, result);
            }
            return result;
        }
        cleanAllMarkers() {
            this.resourcesToClean.forEach((value, owner) => {
                this._cleanMarkers(owner, value);
            });
            this.resourcesToClean = new Map();
        }
        cleanMarkers(owner) {
            const toClean = this.resourcesToClean.get(owner);
            if (toClean) {
                this._cleanMarkers(owner, toClean);
                this.resourcesToClean.delete(owner);
            }
        }
        _cleanMarkers(owner, toClean) {
            const uris = [];
            const applyTo = this.applyToByOwner.get(owner);
            toClean.forEach((uri, uriAsString) => {
                if (applyTo === problemMatcher_1.ApplyToKind.allDocuments ||
                    (applyTo === problemMatcher_1.ApplyToKind.openDocuments && this.openModels[uriAsString]) ||
                    (applyTo === problemMatcher_1.ApplyToKind.closedDocuments && !this.openModels[uriAsString])) {
                    uris.push(uri);
                }
            });
            this.markerService.remove(owner, uris);
        }
        recordMarker(marker, owner, resourceAsString) {
            let markersPerOwner = this.markers.get(owner);
            if (!markersPerOwner) {
                markersPerOwner = new Map();
                this.markers.set(owner, markersPerOwner);
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
            else if (((existingMarker = markersPerResource.get(key)) !== undefined) && (existingMarker.message.length < marker.message.length) && platform_1.isWindows) {
                // Most likely https://github.com/microsoft/vscode/issues/77475
                // Heuristic dictates that when the key is the same and message is smaller, we have hit this limitation.
                markersPerResource.set(key, marker);
            }
        }
        reportMarkers() {
            this.markers.forEach((markersPerOwner, owner) => {
                const deliveredMarkersPerOwner = this.getDeliveredMarkersPerOwner(owner);
                markersPerOwner.forEach((markers, resource) => {
                    this.deliverMarkersPerOwnerAndResourceResolved(owner, resource, markers, deliveredMarkersPerOwner);
                });
            });
        }
        deliverMarkersPerOwnerAndResource(owner, resource) {
            const markersPerOwner = this.markers.get(owner);
            if (!markersPerOwner) {
                return;
            }
            const deliveredMarkersPerOwner = this.getDeliveredMarkersPerOwner(owner);
            const markersPerResource = markersPerOwner.get(resource);
            if (!markersPerResource) {
                return;
            }
            this.deliverMarkersPerOwnerAndResourceResolved(owner, resource, markersPerResource, deliveredMarkersPerOwner);
        }
        deliverMarkersPerOwnerAndResourceResolved(owner, resource, markers, reported) {
            if (markers.size !== reported.get(resource)) {
                const toSet = [];
                markers.forEach(value => toSet.push(value));
                this.markerService.changeOne(owner, uri_1.URI.parse(resource), toSet);
                reported.set(resource, markers.size);
            }
        }
        getDeliveredMarkersPerOwner(owner) {
            let result = this.deliveredMarkers.get(owner);
            if (!result) {
                result = new Map();
                this.deliveredMarkers.set(owner, result);
            }
            return result;
        }
        cleanMarkerCaches() {
            this._numberOfMatches = 0;
            this._maxMarkerSeverity = undefined;
            this.markers.clear();
            this.deliveredMarkers.clear();
        }
        done() {
            this.reportMarkers();
            this.cleanAllMarkers();
        }
    }
    exports.AbstractProblemCollector = AbstractProblemCollector;
    var ProblemHandlingStrategy;
    (function (ProblemHandlingStrategy) {
        ProblemHandlingStrategy[ProblemHandlingStrategy["Clean"] = 0] = "Clean";
    })(ProblemHandlingStrategy || (exports.ProblemHandlingStrategy = ProblemHandlingStrategy = {}));
    class StartStopProblemCollector extends AbstractProblemCollector {
        constructor(problemMatchers, markerService, modelService, _strategy = 0 /* ProblemHandlingStrategy.Clean */, fileService) {
            super(problemMatchers, markerService, modelService, fileService);
            const ownerSet = Object.create(null);
            problemMatchers.forEach(description => ownerSet[description.owner] = true);
            this.owners = Object.keys(ownerSet);
            this.owners.forEach((owner) => {
                this.recordResourcesToClean(owner);
            });
        }
        async processLineInternal(line) {
            const markerMatch = this.tryFindMarker(line);
            if (!markerMatch) {
                return;
            }
            const owner = markerMatch.description.owner;
            const resource = await markerMatch.resource;
            const resourceAsString = resource.toString();
            this.removeResourceToClean(owner, resourceAsString);
            const shouldApplyMatch = await this.shouldApplyMatch(markerMatch);
            if (shouldApplyMatch) {
                this.recordMarker(markerMatch.marker, owner, resourceAsString);
                if (this.currentOwner !== owner || this.currentResource !== resourceAsString) {
                    if (this.currentOwner && this.currentResource) {
                        this.deliverMarkersPerOwnerAndResource(this.currentOwner, this.currentResource);
                    }
                    this.currentOwner = owner;
                    this.currentResource = resourceAsString;
                }
            }
        }
    }
    exports.StartStopProblemCollector = StartStopProblemCollector;
    class WatchingProblemCollector extends AbstractProblemCollector {
        constructor(problemMatchers, markerService, modelService, fileService) {
            super(problemMatchers, markerService, modelService, fileService);
            this.lines = [];
            this.beginPatterns = [];
            this.resetCurrentResource();
            this.backgroundPatterns = [];
            this._activeBackgroundMatchers = new Set();
            this.problemMatchers.forEach(matcher => {
                if (matcher.watching) {
                    const key = (0, uuid_1.generateUuid)();
                    this.backgroundPatterns.push({
                        key,
                        matcher: matcher,
                        begin: matcher.watching.beginsPattern,
                        end: matcher.watching.endsPattern
                    });
                    this.beginPatterns.push(matcher.watching.beginsPattern.regexp);
                }
            });
            this.modelListeners.add(this.modelService.onModelRemoved(modelEvent => {
                let markerChanged = event_1.Event.debounce(this.markerService.onMarkerChanged, (last, e) => {
                    return (last ?? []).concat(e);
                }, 500)(async (markerEvent) => {
                    markerChanged?.dispose();
                    markerChanged = undefined;
                    if (!markerEvent.includes(modelEvent.uri) || (this.markerService.read({ resource: modelEvent.uri }).length !== 0)) {
                        return;
                    }
                    const oldLines = Array.from(this.lines);
                    for (const line of oldLines) {
                        await this.processLineInternal(line);
                    }
                });
                setTimeout(async () => {
                    markerChanged?.dispose();
                    markerChanged = undefined;
                }, 600);
            }));
        }
        aboutToStart() {
            for (const background of this.backgroundPatterns) {
                if (background.matcher.watching && background.matcher.watching.activeOnStart) {
                    this._activeBackgroundMatchers.add(background.key);
                    this._onDidStateChange.fire(IProblemCollectorEvent.create("backgroundProcessingBegins" /* ProblemCollectorEventKind.BackgroundProcessingBegins */));
                    this.recordResourcesToClean(background.matcher.owner);
                }
            }
        }
        async processLineInternal(line) {
            if (await this.tryBegin(line) || this.tryFinish(line)) {
                return;
            }
            this.lines.push(line);
            const markerMatch = this.tryFindMarker(line);
            if (!markerMatch) {
                return;
            }
            const resource = await markerMatch.resource;
            const owner = markerMatch.description.owner;
            const resourceAsString = resource.toString();
            this.removeResourceToClean(owner, resourceAsString);
            const shouldApplyMatch = await this.shouldApplyMatch(markerMatch);
            if (shouldApplyMatch) {
                this.recordMarker(markerMatch.marker, owner, resourceAsString);
                if (this.currentOwner !== owner || this.currentResource !== resourceAsString) {
                    this.reportMarkersForCurrentResource();
                    this.currentOwner = owner;
                    this.currentResource = resourceAsString;
                }
            }
        }
        forceDelivery() {
            this.reportMarkersForCurrentResource();
        }
        async tryBegin(line) {
            let result = false;
            for (const background of this.backgroundPatterns) {
                const matches = background.begin.regexp.exec(line);
                if (matches) {
                    if (this._activeBackgroundMatchers.has(background.key)) {
                        continue;
                    }
                    this._activeBackgroundMatchers.add(background.key);
                    result = true;
                    this._onDidFindFirstMatch.fire();
                    this.lines = [];
                    this.lines.push(line);
                    this._onDidStateChange.fire(IProblemCollectorEvent.create("backgroundProcessingBegins" /* ProblemCollectorEventKind.BackgroundProcessingBegins */));
                    this.cleanMarkerCaches();
                    this.resetCurrentResource();
                    const owner = background.matcher.owner;
                    const file = matches[background.begin.file];
                    if (file) {
                        const resource = (0, problemMatcher_1.getResource)(file, background.matcher);
                        this.recordResourceToClean(owner, await resource);
                    }
                    else {
                        this.recordResourcesToClean(owner);
                    }
                }
            }
            return result;
        }
        tryFinish(line) {
            let result = false;
            for (const background of this.backgroundPatterns) {
                const matches = background.end.regexp.exec(line);
                if (matches) {
                    if (this._numberOfMatches > 0) {
                        this._onDidFindErrors.fire();
                    }
                    else {
                        this._onDidRequestInvalidateLastMarker.fire();
                    }
                    if (this._activeBackgroundMatchers.has(background.key)) {
                        this._activeBackgroundMatchers.delete(background.key);
                        this.resetCurrentResource();
                        this._onDidStateChange.fire(IProblemCollectorEvent.create("backgroundProcessingEnds" /* ProblemCollectorEventKind.BackgroundProcessingEnds */));
                        result = true;
                        this.lines.push(line);
                        const owner = background.matcher.owner;
                        this.cleanMarkers(owner);
                        this.cleanMarkerCaches();
                    }
                }
            }
            return result;
        }
        resetCurrentResource() {
            this.reportMarkersForCurrentResource();
            this.currentOwner = undefined;
            this.currentResource = undefined;
        }
        reportMarkersForCurrentResource() {
            if (this.currentOwner && this.currentResource) {
                this.deliverMarkersPerOwnerAndResource(this.currentOwner, this.currentResource);
            }
        }
        done() {
            [...this.applyToByOwner.keys()].forEach(owner => {
                this.recordResourcesToClean(owner);
            });
            super.done();
        }
        isWatching() {
            return this.backgroundPatterns.length > 0;
        }
    }
    exports.WatchingProblemCollector = WatchingProblemCollector;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvYmxlbUNvbGxlY3RvcnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90YXNrcy9jb21tb24vcHJvYmxlbUNvbGxlY3RvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZWhHLElBQWtCLHlCQUdqQjtJQUhELFdBQWtCLHlCQUF5QjtRQUMxQyxzRkFBeUQsQ0FBQTtRQUN6RCxrRkFBcUQsQ0FBQTtJQUN0RCxDQUFDLEVBSGlCLHlCQUF5Qix5Q0FBekIseUJBQXlCLFFBRzFDO0lBTUQsSUFBVSxzQkFBc0IsQ0FJL0I7SUFKRCxXQUFVLHNCQUFzQjtRQUMvQixTQUFnQixNQUFNLENBQUMsSUFBK0I7WUFDckQsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNoQyxDQUFDO1FBRmUsNkJBQU0sU0FFckIsQ0FBQTtJQUNGLENBQUMsRUFKUyxzQkFBc0IsS0FBdEIsc0JBQXNCLFFBSS9CO0lBTUQsTUFBc0Isd0JBQXlCLFNBQVEsc0JBQVU7UUFnQ2hFLFlBQTRCLGVBQWlDLEVBQVksYUFBNkIsRUFBWSxZQUEyQixFQUFFLFdBQTBCO1lBQ3hLLEtBQUssRUFBRSxDQUFDO1lBRG1CLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQUFZLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUFZLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBdkIxSCxtQkFBYyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBY3ZDLHlCQUFvQixHQUFHLElBQUksZUFBTyxFQUFRLENBQUM7WUFDckQsd0JBQW1CLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQztZQUU1QyxxQkFBZ0IsR0FBRyxJQUFJLGVBQU8sRUFBUSxDQUFDO1lBQ2pELG9CQUFlLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFD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