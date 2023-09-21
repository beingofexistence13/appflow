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
define(["require", "exports", "vs/base/common/event", "vs/platform/native/common/native", "vs/platform/instantiation/common/extensions", "vs/base/common/lifecycle", "vs/workbench/services/themes/common/hostColorSchemeService", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/platform/storage/common/storage", "vs/base/common/types"], function (require, exports, event_1, native_1, extensions_1, lifecycle_1, hostColorSchemeService_1, environmentService_1, storage_1, types_1) {
    "use strict";
    var NativeHostColorSchemeService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeHostColorSchemeService = void 0;
    let NativeHostColorSchemeService = class NativeHostColorSchemeService extends lifecycle_1.Disposable {
        static { NativeHostColorSchemeService_1 = this; }
        static { this.STORAGE_KEY = 'HostColorSchemeData'; }
        constructor(nativeHostService, environmentService, storageService) {
            super();
            this.nativeHostService = nativeHostService;
            this.storageService = storageService;
            this._onDidChangeColorScheme = this._register(new event_1.Emitter());
            this.onDidChangeColorScheme = this._onDidChangeColorScheme.event;
            // register listener with the OS
            this._register(this.nativeHostService.onDidChangeColorScheme(scheme => this.update(scheme)));
            const initial = this.getStoredValue() ?? environmentService.window.colorScheme;
            this.dark = initial.dark;
            this.highContrast = initial.highContrast;
            // fetch the actual value from the OS
            this.nativeHostService.getOSColorScheme().then(scheme => this.update(scheme));
        }
        getStoredValue() {
            const stored = this.storageService.get(NativeHostColorSchemeService_1.STORAGE_KEY, -1 /* StorageScope.APPLICATION */);
            if (stored) {
                try {
                    const scheme = JSON.parse(stored);
                    if ((0, types_1.isObject)(scheme) && (0, types_1.isBoolean)(scheme.highContrast) && (0, types_1.isBoolean)(scheme.dark)) {
                        return scheme;
                    }
                }
                catch (e) {
                    // ignore
                }
            }
            return undefined;
        }
        update({ highContrast, dark }) {
            if (dark !== this.dark || highContrast !== this.highContrast) {
                this.dark = dark;
                this.highContrast = highContrast;
                this.storageService.store(NativeHostColorSchemeService_1.STORAGE_KEY, JSON.stringify({ highContrast, dark }), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                this._onDidChangeColorScheme.fire();
            }
        }
    };
    exports.NativeHostColorSchemeService = NativeHostColorSchemeService;
    exports.NativeHostColorSchemeService = NativeHostColorSchemeService = NativeHostColorSchemeService_1 = __decorate([
        __param(0, native_1.INativeHostService),
        __param(1, environmentService_1.INativeWorkbenchEnvironmentService),
        __param(2, storage_1.IStorageService)
    ], NativeHostColorSchemeService);
    (0, extensions_1.registerSingleton)(hostColorSchemeService_1.IHostColorSchemeService, NativeHostColorSchemeService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF0aXZlSG9zdENvbG9yU2NoZW1lU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy90aGVtZXMvZWxlY3Ryb24tc2FuZGJveC9uYXRpdmVIb3N0Q29sb3JTY2hlbWVTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFZekYsSUFBTSw0QkFBNEIsR0FBbEMsTUFBTSw0QkFBNkIsU0FBUSxzQkFBVTs7aUJBRTNDLGdCQUFXLEdBQUcscUJBQXFCLEFBQXhCLENBQXlCO1FBVXBELFlBQ3FCLGlCQUFzRCxFQUN0QyxrQkFBc0QsRUFDekUsY0FBdUM7WUFFeEQsS0FBSyxFQUFFLENBQUM7WUFKNkIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUVqRCxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFUeEMsNEJBQXVCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDdEUsMkJBQXNCLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEtBQUssQ0FBQztZQVlwRSxnQ0FBZ0M7WUFDaEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsc0JBQXNCLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUU3RixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksa0JBQWtCLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztZQUMvRSxJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7WUFDekIsSUFBSSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDO1lBRXpDLHFDQUFxQztZQUNyQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDL0UsQ0FBQztRQUVPLGNBQWM7WUFDckIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsOEJBQTRCLENBQUMsV0FBVyxvQ0FBMkIsQ0FBQztZQUMzRyxJQUFJLE1BQU0sRUFBRTtnQkFDWCxJQUFJO29CQUNILE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ2xDLElBQUksSUFBQSxnQkFBUSxFQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUEsaUJBQVMsRUFBQyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksSUFBQSxpQkFBUyxFQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTt3QkFDakYsT0FBTyxNQUFzQixDQUFDO3FCQUM5QjtpQkFDRDtnQkFBQyxPQUFPLENBQUMsRUFBRTtvQkFDWCxTQUFTO2lCQUNUO2FBQ0Q7WUFDRCxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRU8sTUFBTSxDQUFDLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBZ0I7WUFDbEQsSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLElBQUksSUFBSSxZQUFZLEtBQUssSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFFN0QsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7Z0JBQ2pCLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO2dCQUNqQyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyw4QkFBNEIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsQ0FBQyxtRUFBa0QsQ0FBQztnQkFDN0osSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksRUFBRSxDQUFDO2FBQ3BDO1FBQ0YsQ0FBQzs7SUFyRFcsb0VBQTRCOzJDQUE1Qiw0QkFBNEI7UUFhdEMsV0FBQSwyQkFBa0IsQ0FBQTtRQUNsQixXQUFBLHVEQUFrQyxDQUFBO1FBQ2xDLFdBQUEseUJBQWUsQ0FBQTtPQWZMLDRCQUE0QixDQXVEeEM7SUFFRCxJQUFBLDhCQUFpQixFQUFDLGdEQUF1QixFQUFFLDRCQUE0QixvQ0FBNEIsQ0FBQyJ9