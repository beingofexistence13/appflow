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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/platform/workspace/common/workspace", "vs/base/common/network", "vs/platform/configuration/common/configuration", "vs/workbench/browser/parts/editor/breadcrumbs", "vs/platform/files/common/files", "vs/workbench/services/outline/browser/outline", "vs/platform/opener/common/opener"], function (require, exports, cancellation_1, errors_1, event_1, lifecycle_1, resources_1, workspace_1, network_1, configuration_1, breadcrumbs_1, files_1, outline_1, opener_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Exb = exports.$Dxb = exports.$Cxb = void 0;
    class $Cxb {
        constructor(uri, kind) {
            this.uri = uri;
            this.kind = kind;
        }
    }
    exports.$Cxb = $Cxb;
    class $Dxb {
        constructor(element, outline) {
            this.element = element;
            this.outline = outline;
        }
    }
    exports.$Dxb = $Dxb;
    let $Exb = class $Exb {
        constructor(resource, editor, configurationService, h, j) {
            this.resource = resource;
            this.h = h;
            this.j = j;
            this.a = new lifecycle_1.$jc();
            this.e = new lifecycle_1.$lc();
            this.f = new lifecycle_1.$jc();
            this.g = new event_1.$fd();
            this.onDidUpdate = this.g.event;
            this.c = breadcrumbs_1.$Bxb.FilePath.bindTo(configurationService);
            this.d = breadcrumbs_1.$Bxb.SymbolPath.bindTo(configurationService);
            this.a.add(this.c.onDidChange(_ => this.g.fire(this)));
            this.a.add(this.d.onDidChange(_ => this.g.fire(this)));
            this.h.onDidChangeWorkspaceFolders(this.l, this, this.a);
            this.b = this.k(resource);
            if (editor) {
                this.m(editor);
                this.a.add(j.onDidChange(() => this.m(editor)));
                this.a.add(editor.onDidChangeControl(() => this.m(editor)));
            }
            this.g.fire(this);
        }
        dispose() {
            this.a.dispose();
            this.c.dispose();
            this.d.dispose();
            this.e.dispose();
            this.f.dispose();
            this.g.dispose();
        }
        isRelative() {
            return Boolean(this.b.folder);
        }
        getElements() {
            let result = [];
            // file path elements
            if (this.c.getValue() === 'on') {
                result = result.concat(this.b.path);
            }
            else if (this.c.getValue() === 'last' && this.b.path.length > 0) {
                result = result.concat(this.b.path.slice(-1));
            }
            if (this.d.getValue() === 'off') {
                return result;
            }
            if (!this.e.value) {
                return result;
            }
            const breadcrumbsElements = this.e.value.config.breadcrumbsDataSource.getBreadcrumbElements();
            for (let i = this.d.getValue() === 'last' && breadcrumbsElements.length > 0 ? breadcrumbsElements.length - 1 : 0; i < breadcrumbsElements.length; i++) {
                result.push(new $Dxb(breadcrumbsElements[i], this.e.value));
            }
            if (breadcrumbsElements.length === 0 && !this.e.value.isEmpty) {
                result.push(new $Dxb(this.e.value, this.e.value));
            }
            return result;
        }
        k(uri) {
            if ((0, opener_1.$PT)(uri, network_1.Schemas.untitled, network_1.Schemas.data)) {
                return {
                    folder: undefined,
                    path: []
                };
            }
            const info = {
                folder: this.h.getWorkspaceFolder(uri) ?? undefined,
                path: []
            };
            let uriPrefix = uri;
            while (uriPrefix && uriPrefix.path !== '/') {
                if (info.folder && (0, resources_1.$bg)(info.folder.uri, uriPrefix)) {
                    break;
                }
                info.path.unshift(new $Cxb(uriPrefix, info.path.length === 0 ? files_1.FileKind.FILE : files_1.FileKind.FOLDER));
                const prevPathLength = uriPrefix.path.length;
                uriPrefix = (0, resources_1.$hg)(uriPrefix);
                if (uriPrefix.path.length === prevPathLength) {
                    break;
                }
            }
            if (info.folder && this.h.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
                info.path.unshift(new $Cxb(info.folder.uri, files_1.FileKind.ROOT_FOLDER));
            }
            return info;
        }
        l() {
            this.b = this.k(this.resource);
            this.g.fire(this);
        }
        m(editor) {
            const newCts = new cancellation_1.$pd();
            this.e.clear();
            this.f.clear();
            this.f.add((0, lifecycle_1.$ic)(() => newCts.dispose(true)));
            this.j.createOutline(editor, 2 /* OutlineTarget.Breadcrumbs */, newCts.token).then(outline => {
                if (newCts.token.isCancellationRequested) {
                    // cancelled: dispose new outline and reset
                    outline?.dispose();
                    outline = undefined;
                }
                this.e.value = outline;
                this.g.fire(this);
                if (outline) {
                    this.f.add(outline.onDidChange(() => this.g.fire(this)));
                }
            }).catch(err => {
                this.g.fire(this);
                (0, errors_1.$Y)(err);
            });
        }
    };
    exports.$Exb = $Exb;
    exports.$Exb = $Exb = __decorate([
        __param(2, configuration_1.$8h),
        __param(3, workspace_1.$Kh),
        __param(4, outline_1.$trb)
    ], $Exb);
});
//# sourceMappingURL=breadcrumbsModel.js.map