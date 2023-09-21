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
define(["require", "exports", "vs/base/common/event", "vs/base/common/decorators", "vs/platform/storage/common/storage", "vs/workbench/services/extensions/common/extensions", "vs/platform/terminal/common/environmentVariableCollection", "vs/platform/terminal/common/environmentVariableShared", "vs/base/common/lifecycle"], function (require, exports, event_1, decorators_1, storage_1, extensions_1, environmentVariableCollection_1, environmentVariableShared_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EnvironmentVariableService = void 0;
    /**
     * Tracks and persists environment variable collections as defined by extensions.
     */
    let EnvironmentVariableService = class EnvironmentVariableService extends lifecycle_1.Disposable {
        get onDidChangeCollections() { return this._onDidChangeCollections.event; }
        constructor(_extensionService, _storageService) {
            super();
            this._extensionService = _extensionService;
            this._storageService = _storageService;
            this.collections = new Map();
            this._onDidChangeCollections = this._register(new event_1.Emitter());
            this._storageService.remove("terminal.integrated.environmentVariableCollections" /* TerminalStorageKeys.DeprecatedEnvironmentVariableCollections */, 1 /* StorageScope.WORKSPACE */);
            const serializedPersistedCollections = this._storageService.get("terminal.integrated.environmentVariableCollectionsV2" /* TerminalStorageKeys.EnvironmentVariableCollections */, 1 /* StorageScope.WORKSPACE */);
            if (serializedPersistedCollections) {
                const collectionsJson = JSON.parse(serializedPersistedCollections);
                collectionsJson.forEach(c => this.collections.set(c.extensionIdentifier, {
                    persistent: true,
                    map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)(c.collection),
                    descriptionMap: (0, environmentVariableShared_1.deserializeEnvironmentDescriptionMap)(c.description)
                }));
                // Asynchronously invalidate collections where extensions have been uninstalled, this is
                // async to avoid making all functions on the service synchronous and because extensions
                // being uninstalled is rare.
                this._invalidateExtensionCollections();
            }
            this.mergedCollection = this._resolveMergedCollection();
            // Listen for uninstalled/disabled extensions
            this._register(this._extensionService.onDidChangeExtensions(() => this._invalidateExtensionCollections()));
        }
        set(extensionIdentifier, collection) {
            this.collections.set(extensionIdentifier, collection);
            this._updateCollections();
        }
        delete(extensionIdentifier) {
            this.collections.delete(extensionIdentifier);
            this._updateCollections();
        }
        _updateCollections() {
            this._persistCollectionsEventually();
            this.mergedCollection = this._resolveMergedCollection();
            this._notifyCollectionUpdatesEventually();
        }
        _persistCollectionsEventually() {
            this._persistCollections();
        }
        _persistCollections() {
            const collectionsJson = [];
            this.collections.forEach((collection, extensionIdentifier) => {
                if (collection.persistent) {
                    collectionsJson.push({
                        extensionIdentifier,
                        collection: (0, environmentVariableShared_1.serializeEnvironmentVariableCollection)(this.collections.get(extensionIdentifier).map),
                        description: (0, environmentVariableShared_1.serializeEnvironmentDescriptionMap)(collection.descriptionMap)
                    });
                }
            });
            const stringifiedJson = JSON.stringify(collectionsJson);
            this._storageService.store("terminal.integrated.environmentVariableCollectionsV2" /* TerminalStorageKeys.EnvironmentVariableCollections */, stringifiedJson, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        _notifyCollectionUpdatesEventually() {
            this._notifyCollectionUpdates();
        }
        _notifyCollectionUpdates() {
            this._onDidChangeCollections.fire(this.mergedCollection);
        }
        _resolveMergedCollection() {
            return new environmentVariableCollection_1.MergedEnvironmentVariableCollection(this.collections);
        }
        async _invalidateExtensionCollections() {
            await this._extensionService.whenInstalledExtensionsRegistered();
            const registeredExtensions = this._extensionService.extensions;
            let changes = false;
            this.collections.forEach((_, extensionIdentifier) => {
                const isExtensionRegistered = registeredExtensions.some(r => r.identifier.value === extensionIdentifier);
                if (!isExtensionRegistered) {
                    this.collections.delete(extensionIdentifier);
                    changes = true;
                }
            });
            if (changes) {
                this._updateCollections();
            }
        }
    };
    exports.EnvironmentVariableService = EnvironmentVariableService;
    __decorate([
        (0, decorators_1.throttle)(1000)
    ], EnvironmentVariableService.prototype, "_persistCollectionsEventually", null);
    __decorate([
        (0, decorators_1.debounce)(1000)
    ], EnvironmentVariableService.prototype, "_notifyCollectionUpdatesEventually", null);
    exports.EnvironmentVariableService = EnvironmentVariableService = __decorate([
        __param(0, extensions_1.IExtensionService),
        __param(1, storage_1.IStorageService)
    ], EnvironmentVariableService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52aXJvbm1lbnRWYXJpYWJsZVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbC9jb21tb24vZW52aXJvbm1lbnRWYXJpYWJsZVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBbUJoRzs7T0FFRztJQUNJLElBQU0sMEJBQTBCLEdBQWhDLE1BQU0sMEJBQTJCLFNBQVEsc0JBQVU7UUFPekQsSUFBSSxzQkFBc0IsS0FBa0QsT0FBTyxJQUFJLENBQUMsdUJBQXVCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUV4SCxZQUNvQixpQkFBcUQsRUFDdkQsZUFBaUQ7WUFFbEUsS0FBSyxFQUFFLENBQUM7WUFINEIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtZQUN0QyxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFSbkUsZ0JBQVcsR0FBK0QsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUduRSw0QkFBdUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUF3QyxDQUFDLENBQUM7WUFTOUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLHlKQUFzRixDQUFDO1lBQ2xILE1BQU0sOEJBQThCLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLGlKQUE0RSxDQUFDO1lBQzVJLElBQUksOEJBQThCLEVBQUU7Z0JBQ25DLE1BQU0sZUFBZSxHQUEwRCxJQUFJLENBQUMsS0FBSyxDQUFDLDhCQUE4QixDQUFDLENBQUM7Z0JBQzFILGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLEVBQUU7b0JBQ3hFLFVBQVUsRUFBRSxJQUFJO29CQUNoQixHQUFHLEVBQUUsSUFBQSxvRUFBd0MsRUFBQyxDQUFDLENBQUMsVUFBVSxDQUFDO29CQUMzRCxjQUFjLEVBQUUsSUFBQSxnRUFBb0MsRUFBQyxDQUFDLENBQUMsV0FBVyxDQUFDO2lCQUNuRSxDQUFDLENBQUMsQ0FBQztnQkFFSix3RkFBd0Y7Z0JBQ3hGLHdGQUF3RjtnQkFDeEYsNkJBQTZCO2dCQUM3QixJQUFJLENBQUMsK0JBQStCLEVBQUUsQ0FBQzthQUN2QztZQUNELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztZQUV4RCw2Q0FBNkM7WUFDN0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMscUJBQXFCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLCtCQUErQixFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzVHLENBQUM7UUFFRCxHQUFHLENBQUMsbUJBQTJCLEVBQUUsVUFBeUQ7WUFDekYsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDdEQsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUVELE1BQU0sQ0FBQyxtQkFBMkI7WUFDakMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUM3QyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUMzQixDQUFDO1FBRU8sa0JBQWtCO1lBQ3pCLElBQUksQ0FBQyw2QkFBNkIsRUFBRSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztZQUN4RCxJQUFJLENBQUMsa0NBQWtDLEVBQUUsQ0FBQztRQUMzQyxDQUFDO1FBR08sNkJBQTZCO1lBQ3BDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBQzVCLENBQUM7UUFFUyxtQkFBbUI7WUFDNUIsTUFBTSxlQUFlLEdBQTBELEVBQUUsQ0FBQztZQUNsRixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFVBQVUsRUFBRSxtQkFBbUIsRUFBRSxFQUFFO2dCQUM1RCxJQUFJLFVBQVUsQ0FBQyxVQUFVLEVBQUU7b0JBQzFCLGVBQWUsQ0FBQyxJQUFJLENBQUM7d0JBQ3BCLG1CQUFtQjt3QkFDbkIsVUFBVSxFQUFFLElBQUEsa0VBQXNDLEVBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUUsQ0FBQyxHQUFHLENBQUM7d0JBQ2xHLFdBQVcsRUFBRSxJQUFBLDhEQUFrQyxFQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUM7cUJBQzFFLENBQUMsQ0FBQztpQkFDSDtZQUNGLENBQUMsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUN4RCxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssa0hBQXFELGVBQWUsZ0VBQWdELENBQUM7UUFDaEosQ0FBQztRQUdPLGtDQUFrQztZQUN6QyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztRQUNqQyxDQUFDO1FBRVMsd0JBQXdCO1lBQ2pDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDMUQsQ0FBQztRQUVPLHdCQUF3QjtZQUMvQixPQUFPLElBQUksbUVBQW1DLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2xFLENBQUM7UUFFTyxLQUFLLENBQUMsK0JBQStCO1lBQzVDLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLGlDQUFpQyxFQUFFLENBQUM7WUFDakUsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDO1lBQy9ELElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQztZQUNwQixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxtQkFBbUIsRUFBRSxFQUFFO2dCQUNuRCxNQUFNLHFCQUFxQixHQUFHLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxLQUFLLG1CQUFtQixDQUFDLENBQUM7Z0JBQ3pHLElBQUksQ0FBQyxxQkFBcUIsRUFBRTtvQkFDM0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsQ0FBQztvQkFDN0MsT0FBTyxHQUFHLElBQUksQ0FBQztpQkFDZjtZQUNGLENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxPQUFPLEVBQUU7Z0JBQ1osSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7YUFDMUI7UUFDRixDQUFDO0tBQ0QsQ0FBQTtJQXBHWSxnRUFBMEI7SUFxRDlCO1FBRFAsSUFBQSxxQkFBUSxFQUFDLElBQUksQ0FBQzttRkFHZDtJQWtCTztRQURQLElBQUEscUJBQVEsRUFBQyxJQUFJLENBQUM7d0ZBR2Q7eUNBM0VXLDBCQUEwQjtRQVVwQyxXQUFBLDhCQUFpQixDQUFBO1FBQ2pCLFdBQUEseUJBQWUsQ0FBQTtPQVhMLDBCQUEwQixDQW9HdEMifQ==