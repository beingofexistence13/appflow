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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/storage/common/storage", "vs/workbench/common/memento", "vs/workbench/contrib/externalUriOpener/common/configuration", "vs/workbench/services/extensions/common/extensions"], function (require, exports, lifecycle_1, storage_1, memento_1, configuration_1, extensions_1) {
    "use strict";
    var ContributedExternalUriOpenersStore_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ContributedExternalUriOpenersStore = void 0;
    let ContributedExternalUriOpenersStore = class ContributedExternalUriOpenersStore extends lifecycle_1.Disposable {
        static { ContributedExternalUriOpenersStore_1 = this; }
        static { this.STORAGE_ID = 'externalUriOpeners'; }
        constructor(storageService, _extensionService) {
            super();
            this._extensionService = _extensionService;
            this._openers = new Map();
            this._memento = new memento_1.Memento(ContributedExternalUriOpenersStore_1.STORAGE_ID, storageService);
            this._mementoObject = this._memento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            for (const [id, value] of Object.entries(this._mementoObject || {})) {
                this.add(id, value.extensionId, { isCurrentlyRegistered: false });
            }
            this.invalidateOpenersOnExtensionsChanged();
            this._register(this._extensionService.onDidChangeExtensions(() => this.invalidateOpenersOnExtensionsChanged()));
            this._register(this._extensionService.onDidChangeExtensionsStatus(() => this.invalidateOpenersOnExtensionsChanged()));
        }
        didRegisterOpener(id, extensionId) {
            this.add(id, extensionId, {
                isCurrentlyRegistered: true
            });
        }
        add(id, extensionId, options) {
            const existing = this._openers.get(id);
            if (existing) {
                existing.isCurrentlyRegistered = existing.isCurrentlyRegistered || options.isCurrentlyRegistered;
                return;
            }
            const entry = {
                extensionId,
                isCurrentlyRegistered: options.isCurrentlyRegistered
            };
            this._openers.set(id, entry);
            this._mementoObject[id] = entry;
            this._memento.saveMemento();
            this.updateSchema();
        }
        delete(id) {
            this._openers.delete(id);
            delete this._mementoObject[id];
            this._memento.saveMemento();
            this.updateSchema();
        }
        async invalidateOpenersOnExtensionsChanged() {
            await this._extensionService.whenInstalledExtensionsRegistered();
            const registeredExtensions = this._extensionService.extensions;
            for (const [id, entry] of this._openers) {
                const extension = registeredExtensions.find(r => r.identifier.value === entry.extensionId);
                if (extension) {
                    if (!this._extensionService.canRemoveExtension(extension)) {
                        // The extension is running. We should have registered openers at this point
                        if (!entry.isCurrentlyRegistered) {
                            this.delete(id);
                        }
                    }
                }
                else {
                    // The opener came from an extension that is no longer enabled/installed
                    this.delete(id);
                }
            }
        }
        updateSchema() {
            const ids = [];
            const descriptions = [];
            for (const [id, entry] of this._openers) {
                ids.push(id);
                descriptions.push(entry.extensionId);
            }
            (0, configuration_1.updateContributedOpeners)(ids, descriptions);
        }
    };
    exports.ContributedExternalUriOpenersStore = ContributedExternalUriOpenersStore;
    exports.ContributedExternalUriOpenersStore = ContributedExternalUriOpenersStore = ContributedExternalUriOpenersStore_1 = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, extensions_1.IExtensionService)
    ], ContributedExternalUriOpenersStore);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJpYnV0ZWRPcGVuZXJzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZXh0ZXJuYWxVcmlPcGVuZXIvY29tbW9uL2NvbnRyaWJ1dGVkT3BlbmVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBa0J6RixJQUFNLGtDQUFrQyxHQUF4QyxNQUFNLGtDQUFtQyxTQUFRLHNCQUFVOztpQkFFekMsZUFBVSxHQUFHLG9CQUFvQixBQUF2QixDQUF3QjtRQU0xRCxZQUNrQixjQUErQixFQUM3QixpQkFBcUQ7WUFFeEUsS0FBSyxFQUFFLENBQUM7WUFGNEIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtZQU54RCxhQUFRLEdBQUcsSUFBSSxHQUFHLEVBQW9DLENBQUM7WUFVdkUsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLGlCQUFPLENBQUMsb0NBQWtDLENBQUMsVUFBVSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQzNGLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLDZEQUE2QyxDQUFDO1lBQzVGLEtBQUssTUFBTSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLElBQUksRUFBRSxDQUFDLEVBQUU7Z0JBQ3BFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxXQUFXLEVBQUUsRUFBRSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO2FBQ2xFO1lBRUQsSUFBSSxDQUFDLG9DQUFvQyxFQUFFLENBQUM7WUFFNUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMscUJBQXFCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLG9DQUFvQyxFQUFF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