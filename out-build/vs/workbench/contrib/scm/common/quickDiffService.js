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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/editor/common/languageSelector", "vs/base/common/event", "vs/platform/uriIdentity/common/uriIdentity"], function (require, exports, lifecycle_1, resources_1, languageSelector_1, event_1, uriIdentity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ZPb = void 0;
    function createProviderComparer(uri) {
        return (a, b) => {
            if (a.rootUri && !b.rootUri) {
                return -1;
            }
            else if (!a.rootUri && b.rootUri) {
                return 1;
            }
            else if (!a.rootUri && !b.rootUri) {
                return 0;
            }
            const aIsParent = (0, resources_1.$cg)(uri, a.rootUri);
            const bIsParent = (0, resources_1.$cg)(uri, b.rootUri);
            if (aIsParent && bIsParent) {
                return a.rootUri.fsPath.length - b.rootUri.fsPath.length;
            }
            else if (aIsParent) {
                return -1;
            }
            else if (bIsParent) {
                return 1;
            }
            else {
                return 0;
            }
        };
    }
    let $ZPb = class $ZPb extends lifecycle_1.$kc {
        constructor(h) {
            super();
            this.h = h;
            this.c = new Set();
            this.f = this.B(new event_1.$fd());
            this.onDidChangeQuickDiffProviders = this.f.event;
        }
        addQuickDiffProvider(quickDiff) {
            this.c.add(quickDiff);
            this.f.fire();
            return {
                dispose: () => {
                    this.c.delete(quickDiff);
                    this.f.fire();
                }
            };
        }
        j(diff) {
            return !!diff.originalResource && (typeof diff.label === 'string') && (typeof diff.isSCM === 'boolean');
        }
        m(provider, uri) {
            if (this.g?.uri.toString() === uri.toString()) {
                return this.g.resources.get(provider);
            }
            return undefined;
        }
        n(uri, quickDiffs) {
            if (this.g?.uri.toString() !== uri.toString()) {
                this.g = { uri, resources: new Map(quickDiffs.map(diff => ([diff.label, diff.originalResource]))) };
            }
        }
        async getQuickDiffs(uri, language = '', isSynchronized = false) {
            const providers = Array.from(this.c)
                .filter(provider => !provider.rootUri || this.h.extUri.isEqualOrParent(uri, provider.rootUri))
                .sort(createProviderComparer(uri));
            const diffs = await Promise.all(providers.map(async (provider) => {
                const scoreValue = provider.selector ? (0, languageSelector_1.$cF)(provider.selector, uri, language, isSynchronized, undefined, undefined) : 10;
                const diff = {
                    originalResource: scoreValue > 0 ? (this.m(provider.label, uri) ?? await provider.getOriginalResource(uri) ?? undefined) : undefined,
                    label: provider.label,
                    isSCM: provider.isSCM
                };
                return diff;
            }));
            const quickDiffs = diffs.filter(this.j);
            this.n(uri, quickDiffs);
            return quickDiffs;
        }
    };
    exports.$ZPb = $ZPb;
    exports.$ZPb = $ZPb = __decorate([
        __param(0, uriIdentity_1.$Ck)
    ], $ZPb);
});
//# sourceMappingURL=quickDiffService.js.map