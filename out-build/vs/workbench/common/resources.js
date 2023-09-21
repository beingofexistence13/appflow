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
define(["require", "exports", "vs/base/common/uri", "vs/base/common/objects", "vs/base/common/path", "vs/base/common/event", "vs/base/common/resources", "vs/base/common/lifecycle", "vs/base/common/glob", "vs/platform/workspace/common/workspace", "vs/platform/configuration/common/configuration", "vs/base/common/network", "vs/base/common/map", "vs/base/common/extpath"], function (require, exports, uri_1, objects_1, path_1, event_1, resources_1, lifecycle_1, glob_1, workspace_1, configuration_1, network_1, map_1, extpath_1) {
    "use strict";
    var $wD_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$wD = void 0;
    let $wD = class $wD extends lifecycle_1.$kc {
        static { $wD_1 = this; }
        static { this.a = null; }
        constructor(g, h, j, m) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.b = this.B(new event_1.$fd());
            this.onExpressionChange = this.b.event;
            this.c = new Map();
            this.f = new Map();
            this.r(false);
            this.n();
        }
        n() {
            this.B(this.m.onDidChangeConfiguration(e => {
                if (this.h(e)) {
                    this.r(true);
                }
            }));
            this.B(this.j.onDidChangeWorkspaceFolders(() => this.r(true)));
        }
        r(fromEvent) {
            let changed = false;
            // Add expressions per workspaces that got added
            for (const folder of this.j.getWorkspace().folders) {
                const folderUriStr = folder.uri.toString();
                const newExpression = this.s(folder.uri);
                const currentExpression = this.f.get(folderUriStr);
                if (newExpression) {
                    if (!currentExpression || !(0, objects_1.$Zm)(currentExpression.expression, newExpression.expression)) {
                        changed = true;
                        this.c.set(folderUriStr, (0, glob_1.$rj)(newExpression.expression));
                        this.f.set(folderUriStr, newExpression);
                    }
                }
                else {
                    if (currentExpression) {
                        changed = true;
                        this.c.delete(folderUriStr);
                        this.f.delete(folderUriStr);
                    }
                }
            }
            // Remove expressions per workspace no longer present
            const foldersMap = new map_1.$Ai(this.j.getWorkspace().folders.map(folder => folder.uri));
            for (const [folder] of this.f) {
                if (folder === $wD_1.a) {
                    continue; // always keep this one
                }
                if (!foldersMap.has(uri_1.URI.parse(folder))) {
                    this.c.delete(folder);
                    this.f.delete(folder);
                    changed = true;
                }
            }
            // Always set for resources outside workspace as well
            const globalNewExpression = this.s(undefined);
            const globalCurrentExpression = this.f.get($wD_1.a);
            if (globalNewExpression) {
                if (!globalCurrentExpression || !(0, objects_1.$Zm)(globalCurrentExpression.expression, globalNewExpression.expression)) {
                    changed = true;
                    this.c.set($wD_1.a, (0, glob_1.$rj)(globalNewExpression.expression));
                    this.f.set($wD_1.a, globalNewExpression);
                }
            }
            else {
                if (globalCurrentExpression) {
                    changed = true;
                    this.c.delete($wD_1.a);
                    this.f.delete($wD_1.a);
                }
            }
            if (fromEvent && changed) {
                this.b.fire();
            }
        }
        s(resource) {
            const expression = this.g(resource);
            if (!expression) {
                return undefined;
            }
            const keys = Object.keys(expression);
            if (keys.length === 0) {
                return undefined;
            }
            let hasAbsolutePath = false;
            // Check the expression for absolute paths/globs
            // and specifically for Windows, make sure the
            // drive letter is lowercased, because we later
            // check with `URI.fsPath` which is always putting
            // the drive letter lowercased.
            const massagedExpression = Object.create(null);
            for (const key of keys) {
                if (!hasAbsolutePath) {
                    hasAbsolutePath = (0, path_1.$8d)(key);
                }
                let massagedKey = key;
                const driveLetter = (0, extpath_1.$Nf)(massagedKey, true /* probe for windows */);
                if (driveLetter) {
                    const driveLetterLower = driveLetter.toLowerCase();
                    if (driveLetter !== driveLetter.toLowerCase()) {
                        massagedKey = `${driveLetterLower}${massagedKey.substring(1)}`;
                    }
                }
                massagedExpression[massagedKey] = expression[key];
            }
            return {
                expression: massagedExpression,
                hasAbsolutePath
            };
        }
        matches(resource, hasSibling) {
            if (this.c.size === 0) {
                return false; // return early: no expression for this matcher
            }
            const folder = this.j.getWorkspaceFolder(resource);
            let expressionForFolder;
            let expressionConfigForFolder;
            if (folder && this.c.has(folder.uri.toString())) {
                expressionForFolder = this.c.get(folder.uri.toString());
                expressionConfigForFolder = this.f.get(folder.uri.toString());
            }
            else {
                expressionForFolder = this.c.get($wD_1.a);
                expressionConfigForFolder = this.f.get($wD_1.a);
            }
            if (!expressionForFolder) {
                return false; // return early: no expression for this resource
            }
            // If the resource if from a workspace, convert its absolute path to a relative
            // path so that glob patterns have a higher probability to match. For example
            // a glob pattern of "src/**" will not match on an absolute path "/folder/src/file.txt"
            // but can match on "src/file.txt"
            let resourcePathToMatch;
            if (folder) {
                resourcePathToMatch = (0, resources_1.$kg)(folder.uri, resource);
            }
            else {
                resourcePathToMatch = this.t(resource);
            }
            if (typeof resourcePathToMatch === 'string' && !!expressionForFolder(resourcePathToMatch, undefined, hasSibling)) {
                return true;
            }
            // If the configured expression has an absolute path, we also check for absolute paths
            // to match, otherwise we potentially miss out on matches. We only do that if we previously
            // matched on the relative path.
            if (resourcePathToMatch !== this.t(resource) && expressionConfigForFolder?.hasAbsolutePath) {
                return !!expressionForFolder(this.t(resource), undefined, hasSibling);
            }
            return false;
        }
        t(uri) {
            if (uri.scheme === network_1.Schemas.file) {
                return uri.fsPath;
            }
            return uri.path;
        }
    };
    exports.$wD = $wD;
    exports.$wD = $wD = $wD_1 = __decorate([
        __param(2, workspace_1.$Kh),
        __param(3, configuration_1.$8h)
    ], $wD);
});
//# sourceMappingURL=resources.js.map