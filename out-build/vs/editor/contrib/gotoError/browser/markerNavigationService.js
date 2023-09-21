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
    exports.$b5 = exports.$a5 = exports.$_4 = void 0;
    class $_4 {
        constructor(marker, index, total) {
            this.marker = marker;
            this.index = index;
            this.total = total;
        }
    }
    exports.$_4 = $_4;
    let $a5 = class $a5 {
        constructor(resourceFilter, h, j) {
            this.h = h;
            this.j = j;
            this.c = new event_1.$fd();
            this.onDidChange = this.c.event;
            this.e = new lifecycle_1.$jc();
            this.f = [];
            this.g = -1;
            if (uri_1.URI.isUri(resourceFilter)) {
                this.d = uri => uri.toString() === resourceFilter.toString();
            }
            else if (resourceFilter) {
                this.d = resourceFilter;
            }
            const compareOrder = this.j.getValue('problems.sortOrder');
            const compareMarker = (a, b) => {
                let res = (0, strings_1.$Fe)(a.resource.toString(), b.resource.toString());
                if (res === 0) {
                    if (compareOrder === 'position') {
                        res = range_1.$ks.compareRangesUsingStarts(a, b) || markers_1.MarkerSeverity.compare(a.severity, b.severity);
                    }
                    else {
                        res = markers_1.MarkerSeverity.compare(a.severity, b.severity) || range_1.$ks.compareRangesUsingStarts(a, b);
                    }
                }
                return res;
            };
            const updateMarker = () => {
                this.f = this.h.read({
                    resource: uri_1.URI.isUri(resourceFilter) ? resourceFilter : undefined,
                    severities: markers_1.MarkerSeverity.Error | markers_1.MarkerSeverity.Warning | markers_1.MarkerSeverity.Info
                });
                if (typeof resourceFilter === 'function') {
                    this.f = this.f.filter(m => this.d(m.resource));
                }
                this.f.sort(compareMarker);
            };
            updateMarker();
            this.e.add(h.onMarkerChanged(uris => {
                if (!this.d || uris.some(uri => this.d(uri))) {
                    updateMarker();
                    this.g = -1;
                    this.c.fire();
                }
            }));
        }
        dispose() {
            this.e.dispose();
            this.c.dispose();
        }
        matches(uri) {
            if (!this.d && !uri) {
                return true;
            }
            if (!this.d || !uri) {
                return false;
            }
            return this.d(uri);
        }
        get selected() {
            const marker = this.f[this.g];
            return marker && new $_4(marker, this.g + 1, this.f.length);
        }
        k(model, position, fwd) {
            let found = false;
            let idx = this.f.findIndex(marker => marker.resource.toString() === model.uri.toString());
            if (idx < 0) {
                idx = (0, arrays_1.$ub)(this.f, { resource: model.uri }, (a, b) => (0, strings_1.$Fe)(a.resource.toString(), b.resource.toString()));
                if (idx < 0) {
                    idx = ~idx;
                }
            }
            for (let i = idx; i < this.f.length; i++) {
                let range = range_1.$ks.lift(this.f[i]);
                if (range.isEmpty()) {
                    const word = model.getWordAtPosition(range.getStartPosition());
                    if (word) {
                        range = new range_1.$ks(range.startLineNumber, word.startColumn, range.startLineNumber, word.endColumn);
                    }
                }
                if (position && (range.containsPosition(position) || position.isBeforeOrEqual(range.getStartPosition()))) {
                    this.g = i;
                    found = true;
                    break;
                }
                if (this.f[i].resource.toString() !== model.uri.toString()) {
                    break;
                }
            }
            if (!found) {
                // after the last change
                this.g = fwd ? 0 : this.f.length - 1;
            }
            if (this.g < 0) {
                this.g = this.f.length - 1;
            }
        }
        resetIndex() {
            this.g = -1;
        }
        move(fwd, model, position) {
            if (this.f.length === 0) {
                return false;
            }
            const oldIdx = this.g;
            if (this.g === -1) {
                this.k(model, position, fwd);
            }
            else if (fwd) {
                this.g = (this.g + 1) % this.f.length;
            }
            else if (!fwd) {
                this.g = (this.g - 1 + this.f.length) % this.f.length;
            }
            if (oldIdx !== this.g) {
                return true;
            }
            return false;
        }
        find(uri, position) {
            let idx = this.f.findIndex(marker => marker.resource.toString() === uri.toString());
            if (idx < 0) {
                return undefined;
            }
            for (; idx < this.f.length; idx++) {
                if (range_1.$ks.containsPosition(this.f[idx], position)) {
                    return new $_4(this.f[idx], idx + 1, this.f.length);
                }
            }
            return undefined;
        }
    };
    exports.$a5 = $a5;
    exports.$a5 = $a5 = __decorate([
        __param(1, markers_1.$3s),
        __param(2, configuration_1.$8h)
    ], $a5);
    exports.$b5 = (0, instantiation_1.$Bh)('IMarkerNavigationService');
    let MarkerNavigationService = class MarkerNavigationService {
        constructor(d, e) {
            this.d = d;
            this.e = e;
            this.c = new linkedList_1.$tc();
        }
        registerProvider(provider) {
            const remove = this.c.unshift(provider);
            return (0, lifecycle_1.$ic)(() => remove());
        }
        getMarkerList(resource) {
            for (const provider of this.c) {
                const result = provider.getMarkerList(resource);
                if (result) {
                    return result;
                }
            }
            // default
            return new $a5(resource, this.d, this.e);
        }
    };
    MarkerNavigationService = __decorate([
        __param(0, markers_1.$3s),
        __param(1, configuration_1.$8h)
    ], MarkerNavigationService);
    (0, extensions_1.$mr)(exports.$b5, MarkerNavigationService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=markerNavigationService.js.map