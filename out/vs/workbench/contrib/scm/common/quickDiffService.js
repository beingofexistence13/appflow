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
    exports.QuickDiffService = void 0;
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
            const aIsParent = (0, resources_1.isEqualOrParent)(uri, a.rootUri);
            const bIsParent = (0, resources_1.isEqualOrParent)(uri, b.rootUri);
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
    let QuickDiffService = class QuickDiffService extends lifecycle_1.Disposable {
        constructor(uriIdentityService) {
            super();
            this.uriIdentityService = uriIdentityService;
            this.quickDiffProviders = new Set();
            this._onDidChangeQuickDiffProviders = this._register(new event_1.Emitter());
            this.onDidChangeQuickDiffProviders = this._onDidChangeQuickDiffProviders.event;
        }
        addQuickDiffProvider(quickDiff) {
            this.quickDiffProviders.add(quickDiff);
            this._onDidChangeQuickDiffProviders.fire();
            return {
                dispose: () => {
                    this.quickDiffProviders.delete(quickDiff);
                    this._onDidChangeQuickDiffProviders.fire();
                }
            };
        }
        isQuickDiff(diff) {
            return !!diff.originalResource && (typeof diff.label === 'string') && (typeof diff.isSCM === 'boolean');
        }
        getOriginalResourceFromCache(provider, uri) {
            if (this.cachedOriginalResource?.uri.toString() === uri.toString()) {
                return this.cachedOriginalResource.resources.get(provider);
            }
            return undefined;
        }
        updateOriginalResourceCache(uri, quickDiffs) {
            if (this.cachedOriginalResource?.uri.toString() !== uri.toString()) {
                this.cachedOriginalResource = { uri, resources: new Map(quickDiffs.map(diff => ([diff.label, diff.originalResource]))) };
            }
        }
        async getQuickDiffs(uri, language = '', isSynchronized = false) {
            const providers = Array.from(this.quickDiffProviders)
                .filter(provider => !provider.rootUri || this.uriIdentityService.extUri.isEqualOrParent(uri, provider.rootUri))
                .sort(createProviderComparer(uri));
            const diffs = await Promise.all(providers.map(async (provider) => {
                const scoreValue = provider.selector ? (0, languageSelector_1.score)(provider.selector, uri, language, isSynchronized, undefined, undefined) : 10;
                const diff = {
                    originalResource: scoreValue > 0 ? (this.getOriginalResourceFromCache(provider.label, uri) ?? await provider.getOriginalResource(uri) ?? undefined) : undefined,
                    label: provider.label,
                    isSCM: provider.isSCM
                };
                return diff;
            }));
            const quickDiffs = diffs.filter(this.isQuickDiff);
            this.updateOriginalResourceCache(uri, quickDiffs);
            return quickDiffs;
        }
    };
    exports.QuickDiffService = QuickDiffService;
    exports.QuickDiffService = QuickDiffService = __decorate([
        __param(0, uriIdentity_1.IUriIdentityService)
    ], QuickDiffService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpY2tEaWZmU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3NjbS9jb21tb24vcXVpY2tEaWZmU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFVaEcsU0FBUyxzQkFBc0IsQ0FBQyxHQUFRO1FBQ3ZDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDZixJQUFJLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFO2dCQUM1QixPQUFPLENBQUMsQ0FBQyxDQUFDO2FBQ1Y7aUJBQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRTtnQkFDbkMsT0FBTyxDQUFDLENBQUM7YUFDVDtpQkFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUU7Z0JBQ3BDLE9BQU8sQ0FBQyxDQUFDO2FBQ1Q7WUFFRCxNQUFNLFNBQVMsR0FBRyxJQUFBLDJCQUFlLEVBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxPQUFRLENBQUMsQ0FBQztZQUNuRCxNQUFNLFNBQVMsR0FBRyxJQUFBLDJCQUFlLEVBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxPQUFRLENBQUMsQ0FBQztZQUVuRCxJQUFJLFNBQVMsSUFBSSxTQUFTLEVBQUU7Z0JBQzNCLE9BQU8sQ0FBQyxDQUFDLE9BQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxPQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQzthQUMzRDtpQkFBTSxJQUFJLFNBQVMsRUFBRTtnQkFDckIsT0FBTyxDQUFDLENBQUMsQ0FBQzthQUNWO2lCQUFNLElBQUksU0FBUyxFQUFFO2dCQUNyQixPQUFPLENBQUMsQ0FBQzth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