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
define(["require", "exports", "vs/nls!vs/workbench/contrib/localHistory/browser/localHistoryTimeline", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/contrib/timeline/common/timeline", "vs/workbench/services/workingCopy/common/workingCopyHistory", "vs/base/common/uri", "vs/workbench/services/path/common/pathService", "vs/workbench/browser/parts/editor/editorCommands", "vs/platform/files/common/files", "vs/workbench/contrib/localHistory/browser/localHistoryFileSystemProvider", "vs/workbench/services/environment/common/environmentService", "vs/workbench/common/editor", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/localHistory/browser/localHistoryCommands", "vs/base/common/htmlContent", "vs/workbench/contrib/localHistory/browser/localHistory", "vs/base/common/network", "vs/platform/workspace/common/workspace", "vs/platform/workspace/common/virtualWorkspace"], function (require, exports, nls_1, event_1, lifecycle_1, timeline_1, workingCopyHistory_1, uri_1, pathService_1, editorCommands_1, files_1, localHistoryFileSystemProvider_1, environmentService_1, editor_1, configuration_1, localHistoryCommands_1, htmlContent_1, localHistory_1, network_1, workspace_1, virtualWorkspace_1) {
    "use strict";
    var $G1b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$G1b = void 0;
    let $G1b = class $G1b extends lifecycle_1.$kc {
        static { $G1b_1 = this; }
        static { this.a = 'timeline.localHistory'; }
        static { this.b = 'workbench.localHistory.enabled'; }
        constructor(g, h, j, m, n, r, s) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.id = $G1b_1.a;
            this.label = (0, nls_1.localize)(0, null);
            this.scheme = '*'; // we try to show local history for all schemes if possible
            this.c = this.B(new event_1.$fd());
            this.onDidChange = this.c.event;
            this.f = this.B(new lifecycle_1.$lc());
            this.t();
            this.w();
        }
        t() {
            // Timeline (if enabled)
            this.u();
            // File Service Provider
            this.B(this.m.registerProvider(localHistoryFileSystemProvider_1.$x1b.SCHEMA, new localHistoryFileSystemProvider_1.$x1b(this.m)));
        }
        u() {
            if (this.r.getValue($G1b_1.b)) {
                this.f.value = this.g.registerTimelineProvider(this);
            }
            else {
                this.f.clear();
            }
        }
        w() {
            // History changes
            this.B(this.h.onDidAddEntry(e => this.y(e.entry)));
            this.B(this.h.onDidChangeEntry(e => this.y(e.entry)));
            this.B(this.h.onDidReplaceEntry(e => this.y(e.entry)));
            this.B(this.h.onDidRemoveEntry(e => this.y(e.entry)));
            this.B(this.h.onDidRemoveEntries(() => this.y(undefined /* all entries */)));
            this.B(this.h.onDidMoveEntries(() => this.y(undefined /* all entries */)));
            // Configuration changes
            this.B(this.r.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration($G1b_1.b)) {
                    this.u();
                }
            }));
        }
        y(entry) {
            // Re-emit as timeline change event
            this.c.fire({
                id: $G1b_1.a,
                uri: entry?.workingCopy.resource,
                reset: true // there is no other way to indicate that items might have been replaced/removed
            });
        }
        async provideTimeline(uri, options, token) {
            const items = [];
            // Try to convert the provided `uri` into a form that is likely
            // for the provider to find entries for so that we can ensure
            // the timeline is always providing local history entries
            let resource = undefined;
            if (uri.scheme === localHistoryFileSystemProvider_1.$x1b.SCHEMA) {
                // `vscode-local-history`: convert back to the associated resource
                resource = localHistoryFileSystemProvider_1.$x1b.fromLocalHistoryFileSystem(uri).associatedResource;
            }
            else if (uri.scheme === this.j.defaultUriScheme || uri.scheme === network_1.Schemas.vscodeUserData) {
                // default-scheme / settings: keep as is
                resource = uri;
            }
            else if (this.m.hasProvider(uri)) {
                // anything that is backed by a file system provider:
                // try best to convert the URI back into a form that is
                // likely to match the workspace URIs. That means:
                // - change to the default URI scheme
                // - change to the remote authority or virtual workspace authority
                // - preserve the path
                resource = uri_1.URI.from({
                    scheme: this.j.defaultUriScheme,
                    authority: this.n.remoteAuthority ?? (0, virtualWorkspace_1.$wJ)(this.s.getWorkspace()),
                    path: uri.path
                });
            }
            if (resource) {
                // Retrieve from working copy history
                const entries = await this.h.getEntries(resource, token);
                // Convert to timeline items
                for (const entry of entries) {
                    items.push(this.z(entry));
                }
            }
            return {
                source: $G1b_1.a,
                items
            };
        }
        z(entry) {
            return {
                handle: entry.id,
                label: editor_1.$SE.getSourceLabel(entry.source),
                tooltip: new htmlContent_1.$Xj(`$(history) ${(0, localHistory_1.$y1b)().format(entry.timestamp)}\n\n${editor_1.$SE.getSourceLabel(entry.source)}`, { supportThemeIcons: true }),
                source: $G1b_1.a,
                timestamp: entry.timestamp,
                themeIcon: localHistory_1.$B1b,
                contextValue: localHistory_1.$z1b,
                command: {
                    id: editorCommands_1.$Xub,
                    title: localHistoryCommands_1.$D1b.value,
                    arguments: (0, localHistoryCommands_1.$E1b)(entry, entry.workingCopy.resource)
                }
            };
        }
    };
    exports.$G1b = $G1b;
    exports.$G1b = $G1b = $G1b_1 = __decorate([
        __param(0, timeline_1.$ZI),
        __param(1, workingCopyHistory_1.$v1b),
        __param(2, pathService_1.$yJ),
        __param(3, files_1.$6j),
        __param(4, environmentService_1.$hJ),
        __param(5, configuration_1.$8h),
        __param(6, workspace_1.$Kh)
    ], $G1b);
});
//# sourceMappingURL=localHistoryTimeline.js.map