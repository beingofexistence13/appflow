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
define(["require", "exports", "vs/base/common/event", "vs/platform/log/common/log", "./timeline", "vs/workbench/common/views", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey"], function (require, exports, event_1, log_1, timeline_1, views_1, configuration_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$n1b = exports.$m1b = void 0;
    exports.$m1b = new contextkey_1.$2i('timelineHasProvider', false);
    let $n1b = class $n1b {
        constructor(j, k, l, m) {
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.c = new event_1.$fd();
            this.onDidChangeProviders = this.c.event;
            this.d = new event_1.$fd();
            this.onDidChangeTimeline = this.d.event;
            this.f = new event_1.$fd();
            this.onDidChangeUri = this.f.event;
            this.h = new Map();
            this.i = new Map();
            this.g = exports.$m1b.bindTo(this.m);
            this.n();
        }
        getSources() {
            return [...this.h.values()].map(p => ({ id: p.id, label: p.label }));
        }
        getTimeline(id, uri, options, tokenSource) {
            this.j.trace(`TimelineService#getTimeline(${id}): uri=${uri.toString()}`);
            const provider = this.h.get(id);
            if (provider === undefined) {
                return undefined;
            }
            if (typeof provider.scheme === 'string') {
                if (provider.scheme !== '*' && provider.scheme !== uri.scheme) {
                    return undefined;
                }
            }
            else if (!provider.scheme.includes(uri.scheme)) {
                return undefined;
            }
            return {
                result: provider.provideTimeline(uri, options, tokenSource.token)
                    .then(result => {
                    if (result === undefined) {
                        return undefined;
                    }
                    result.items = result.items.map(item => ({ ...item, source: provider.id }));
                    result.items.sort((a, b) => (b.timestamp - a.timestamp) || b.source.localeCompare(a.source, undefined, { numeric: true, sensitivity: 'base' }));
                    return result;
                }),
                options: options,
                source: provider.id,
                tokenSource: tokenSource,
                uri: uri
            };
        }
        registerTimelineProvider(provider) {
            this.j.trace(`TimelineService#registerTimelineProvider: id=${provider.id}`);
            const id = provider.id;
            const existing = this.h.get(id);
            if (existing) {
                // For now to deal with https://github.com/microsoft/vscode/issues/89553 allow any overwritting here (still will be blocked in the Extension Host)
                // TODO@eamodio: Ultimately will need to figure out a way to unregister providers when the Extension Host restarts/crashes
                // throw new Error(`Timeline Provider ${id} already exists.`);
                try {
                    existing?.dispose();
                }
                catch { }
            }
            this.h.set(id, provider);
            this.n();
            if (provider.onDidChange) {
                this.i.set(id, provider.onDidChange(e => this.d.fire(e)));
            }
            this.c.fire({ added: [id] });
            return {
                dispose: () => {
                    this.h.delete(id);
                    this.c.fire({ removed: [id] });
                }
            };
        }
        unregisterTimelineProvider(id) {
            this.j.trace(`TimelineService#unregisterTimelineProvider: id=${id}`);
            if (!this.h.has(id)) {
                return;
            }
            this.h.delete(id);
            this.i.delete(id);
            this.n();
            this.c.fire({ removed: [id] });
        }
        setUri(uri) {
            this.k.openView(timeline_1.$YI, true);
            this.f.fire(uri);
        }
        n() {
            this.g.set(this.h.size !== 0);
        }
    };
    exports.$n1b = $n1b;
    exports.$n1b = $n1b = __decorate([
        __param(0, log_1.$5i),
        __param(1, views_1.$$E),
        __param(2, configuration_1.$8h),
        __param(3, contextkey_1.$3i)
    ], $n1b);
});
//# sourceMappingURL=timelineService.js.map