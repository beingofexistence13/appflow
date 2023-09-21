/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/linkedList", "vs/base/common/strings", "vs/base/common/uri", "vs/editor/common/core/range", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/markers/common/markers", "vs/platform/configuration/common/configuration"], function (require, exports, arrays_1, event_1, lifecycle_1, linkedList_1, strings_1, uri_1, range_1, extensions_1, instantiation_1, markers_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IMarkerNavigationService = exports.MarkerList = exports.MarkerCoordinate = void 0;
    class MarkerCoordinate {
        constructor(marker, index, total) {
            this.marker = marker;
            this.index = index;
            this.total = total;
        }
    }
    exports.MarkerCoordinate = MarkerCoordinate;
    let MarkerList = class MarkerList {
        constructor(resourceFilter, _markerService, _configService) {
            this._markerService = _markerService;
            this._configService = _configService;
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._dispoables = new lifecycle_1.DisposableStore();
            this._markers = [];
            this._nextIdx = -1;
            if (uri_1.URI.isUri(resourceFilter)) {
                this._resourceFilter = uri => uri.toString() === resourceFilter.toString();
            }
            else if (resourceFilter) {
                this._resourceFilter = resourceFilter;
            }
            const compareOrder = this._configService.getValue('problems.sortOrder');
            const compareMarker = (a, b) => {
                let res = (0, strings_1.compare)(a.resource.toString(), b.resource.toString());
                if (res === 0) {
                    if (compareOrder === 'position') {
                        res = range_1.Range.compareRangesUsingStarts(a, b) || markers_1.MarkerSeverity.compare(a.severity, b.severity);
                    }
                    else {
                        res = markers_1.MarkerSeverity.compare(a.severity, b.severity) || range_1.Range.compareRangesUsingStarts(a, b);
                    }
                }
                return res;
            };
            const updateMarker = () => {
                this._markers = this._markerService.read({
                    resource: uri_1.URI.isUri(resourceFilter) ? resourceFilter : undefined,
                    severities: markers_1.MarkerSeverity.Error | markers_1.MarkerSeverity.Warning | markers_1.MarkerSeverity.Info
                });
                if (typeof resourceFilter === 'function') {
                    this._markers = this._markers.filter(m => this._resourceFilter(m.resource));
                }
                this._markers.sort(compareMarker);
            };
            updateMarker();
            this._dispoables.add(_markerService.onMarkerChanged(uris => {
                if (!this._resourceFilter || uris.some(uri => this._resourceFilter(uri))) {
                    updateMarker();
                    this._nextIdx = -1;
                    this._onDidChange.fire();
                }
            }));
        }
        dispose() {
            this._dispoables.dispose();
            this._onDidChange.dispose();
        }
        matches(uri) {
            if (!this._resourceFilter && !uri) {
                return true;
            }
            if (!this._resourceFilter || !uri) {
                return false;
            }
            return this._resourceFilter(uri);
        }
        get selected() {
            const marker = this._markers[this._nextIdx];
            return marker && new MarkerCoordinate(marker, this._nextIdx + 1, this._markers.length);
        }
        _initIdx(model, position, fwd) {
            let found = false;
            let idx = this._markers.findIndex(marker => marker.resource.toString() === model.uri.toString());
            if (idx < 0) {
                idx = (0, arrays_1.binarySearch)(this._markers, { resource: model.uri }, (a, b) => (0, strings_1.compare)(a.resource.toString(), b.resource.toString()));
                if (idx < 0) {
                    idx = ~idx;
                }
            }
            for (let i = idx; i < this._markers.length; i++) {
                let range = range_1.Range.lift(this._markers[i]);
                if (range.isEmpty()) {
                    const word = model.getWordAtPosition(range.getStartPosition());
                    if (word) {
                        range = new range_1.Range(range.startLineNumber, word.startColumn, range.startLineNumber, word.endColumn);
                    }
                }
                if (position && (range.containsPosition(position) || position.isBeforeOrEqual(range.getStartPosition()))) {
                    this._nextIdx = i;
                    found = true;
                    break;
                }
                if (this._markers[i].resource.toString() !== model.uri.toString()) {
                    break;
                }
            }
            if (!found) {
                // after the last change
                this._nextIdx = fwd ? 0 : this._markers.length - 1;
            }
            if (this._nextIdx < 0) {
                this._nextIdx = this._markers.length - 1;
            }
        }
        resetIndex() {
            this._nextIdx = -1;
        }
        move(fwd, model, position) {
            if (this._markers.length === 0) {
                return false;
            }
            const oldIdx = this._nextIdx;
            if (this._nextIdx === -1) {
                this._initIdx(model, position, fwd);
            }
            else if (fwd) {
                this._nextIdx = (this._nextIdx + 1) % this._markers.length;
            }
            else if (!fwd) {
                this._nextIdx = (this._nextIdx - 1 + this._markers.length) % this._markers.length;
            }
            if (oldIdx !== this._nextIdx) {
                return true;
            }
            return false;
        }
        find(uri, position) {
            let idx = this._markers.findIndex(marker => marker.resource.toString() === uri.toString());
            if (idx < 0) {
                return undefined;
            }
            for (; idx < this._markers.length; idx++) {
                if (range_1.Range.containsPosition(this._markers[idx], position)) {
                    return new MarkerCoordinate(this._markers[idx], idx + 1, this._markers.length);
                }
            }
            return undefined;
        }
    };
    exports.MarkerList = MarkerList;
    exports.MarkerList = MarkerList = __decorate([
        __param(1, markers_1.IMarkerService),
        __param(2, configuration_1.IConfigurationService)
    ], MarkerList);
    exports.IMarkerNavigationService = (0, instantiation_1.createDecorator)('IMarkerNavigationService');
    let MarkerNavigationService = class MarkerNavigationService {
        constructor(_markerService, _configService) {
            this._markerService = _markerService;
            this._configService = _configService;
            this._provider = new linkedList_1.LinkedList();
        }
        registerProvider(provider) {
            const remove = this._provider.unshift(provider);
            return (0, lifecycle_1.toDisposable)(() => remove());
        }
        getMarkerList(resource) {
            for (const provider of this._provider) {
                const result = provider.getMarkerList(resource);
                if (result) {
                    return result;
                }
            }
            // default
            return new MarkerList(resource, this._markerService, this._configService);
        }
    };
    MarkerNavigationService = __decorate([
        __param(0, markers_1.IMarkerService),
        __param(1, configuration_1.IConfigurationService)
    ], MarkerNavigationService);
    (0, extensions_1.registerSingleton)(exports.IMarkerNavigationService, MarkerNavigationService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2VyTmF2aWdhdGlvblNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9nb3RvRXJyb3IvYnJvd3Nlci9tYXJrZXJOYXZpZ2F0aW9uU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFnQmhHLE1BQWEsZ0JBQWdCO1FBQzVCLFlBQ1UsTUFBZSxFQUNmLEtBQWEsRUFDYixLQUFhO1lBRmIsV0FBTSxHQUFOLE1BQU0sQ0FBUztZQUNmLFVBQUssR0FBTCxLQUFLLENBQVE7WUFDYixVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQ25CLENBQUM7S0FDTDtJQU5ELDRDQU1DO0lBRU0sSUFBTSxVQUFVLEdBQWhCLE1BQU0sVUFBVTtRQVd0QixZQUNDLGNBQXlELEVBQ3pDLGNBQStDLEVBQ3hDLGNBQXNEO1lBRDVDLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtZQUN2QixtQkFBYyxHQUFkLGNBQWMsQ0FBdUI7WUFaN0QsaUJBQVksR0FBRyxJQUFJLGVBQU8sRUFBUSxDQUFDO1lBQzNDLGdCQUFXLEdBQWdCLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBRzNDLGdCQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFFN0MsYUFBUSxHQUFjLEVBQUUsQ0FBQztZQUN6QixhQUFRLEdBQVcsQ0FBQyxDQUFDLENBQUM7WUFPN0IsSUFBSSxTQUFHLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxFQUFFO2dCQUM5QixJQUFJLENBQUMsZUFBZSxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLGNBQWMsQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUMzRTtpQkFBTSxJQUFJLGNBQWMsRUFBRTtnQkFDMUIsSUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUM7YUFDdEM7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