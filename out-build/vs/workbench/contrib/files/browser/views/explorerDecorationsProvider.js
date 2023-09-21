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
define(["require", "exports", "vs/base/common/event", "vs/nls!vs/workbench/contrib/files/browser/views/explorerDecorationsProvider", "vs/platform/workspace/common/workspace", "vs/platform/theme/common/colorRegistry", "vs/base/common/lifecycle", "vs/workbench/contrib/files/browser/views/explorerViewer", "vs/workbench/contrib/files/browser/files", "vs/base/common/errorMessage"], function (require, exports, event_1, nls_1, workspace_1, colorRegistry_1, lifecycle_1, explorerViewer_1, files_1, errorMessage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$qIb = exports.$pIb = void 0;
    function $pIb(fileStat) {
        if (fileStat.isRoot && fileStat.error) {
            return {
                tooltip: (0, nls_1.localize)(0, null, (0, errorMessage_1.$mi)(fileStat.error)),
                letter: '!',
                color: colorRegistry_1.$Lx,
            };
        }
        if (fileStat.isSymbolicLink) {
            return {
                tooltip: (0, nls_1.localize)(1, null),
                letter: '\u2937'
            };
        }
        if (fileStat.isUnknown) {
            return {
                tooltip: (0, nls_1.localize)(2, null),
                letter: '?'
            };
        }
        if (fileStat.isExcluded) {
            return {
                color: colorRegistry_1.$Yx,
            };
        }
        return undefined;
    }
    exports.$pIb = $pIb;
    let $qIb = class $qIb {
        constructor(c, contextService) {
            this.c = c;
            this.label = (0, nls_1.localize)(3, null);
            this.a = new event_1.$fd();
            this.b = new lifecycle_1.$jc();
            this.b.add(this.a);
            this.b.add(contextService.onDidChangeWorkspaceFolders(e => {
                this.a.fire(e.changed.concat(e.added).map(wf => wf.uri));
            }));
            this.b.add(explorerViewer_1.$gIb.event((resource => {
                this.a.fire([resource]);
            })));
        }
        get onDidChange() {
            return this.a.event;
        }
        async provideDecorations(resource) {
            const fileStat = this.c.findClosest(resource);
            if (!fileStat) {
                throw new Error('ExplorerItem not found');
            }
            return $pIb(fileStat);
        }
        dispose() {
            this.b.dispose();
        }
    };
    exports.$qIb = $qIb;
    exports.$qIb = $qIb = __decorate([
        __param(0, files_1.$xHb),
        __param(1, workspace_1.$Kh)
    ], $qIb);
});
//# sourceMappingURL=explorerDecorationsProvider.js.map