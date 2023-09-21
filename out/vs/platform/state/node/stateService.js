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
define(["require", "exports", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/lifecycle", "vs/base/common/types", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/log/common/log"], function (require, exports, async_1, buffer_1, lifecycle_1, types_1, environment_1, files_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StateService = exports.StateReadonlyService = exports.FileStorage = exports.SaveStrategy = void 0;
    var SaveStrategy;
    (function (SaveStrategy) {
        SaveStrategy[SaveStrategy["IMMEDIATE"] = 0] = "IMMEDIATE";
        SaveStrategy[SaveStrategy["DELAYED"] = 1] = "DELAYED";
    })(SaveStrategy || (exports.SaveStrategy = SaveStrategy = {}));
    class FileStorage extends lifecycle_1.Disposable {
        constructor(storagePath, saveStrategy, logService, fileService) {
            super();
            this.storagePath = storagePath;
            this.logService = logService;
            this.fileService = fileService;
            this.storage = Object.create(null);
            this.lastSavedStorageContents = '';
            this.initializing = undefined;
            this.closing = undefined;
            this.flushDelayer = saveStrategy === 0 /* SaveStrategy.IMMEDIATE */ ? undefined : this._register(new async_1.ThrottledDelayer(100 /* buffer saves over a short time */));
        }
        init() {
            if (!this.initializing) {
                this.initializing = this.doInit();
            }
            return this.initializing;
        }
        async doInit() {
            try {
                this.lastSavedStorageContents = (await this.fileService.readFile(this.storagePath)).value.toString();
                this.storage = JSON.parse(this.lastSavedStorageContents);
            }
            catch (error) {
                if (error.fileOperationResult !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    this.logService.error(error);
                }
            }
        }
        getItem(key, defaultValue) {
            const res = this.storage[key];
            if ((0, types_1.isUndefinedOrNull)(res)) {
                return defaultValue;
            }
            return res;
        }
        setItem(key, data) {
            this.setItems([{ key, data }]);
        }
        setItems(items) {
            let save = false;
            for (const { key, data } of items) {
                // Shortcut for data that did not change
                if (this.storage[key] === data) {
                    continue;
                }
                // Remove items when they are undefined or null
                if ((0, types_1.isUndefinedOrNull)(data)) {
                    if (!(0, types_1.isUndefined)(this.storage[key])) {
                        this.storage[key] = undefined;
                        save = true;
                    }
                }
                // Otherwise add an item
                else {
                    this.storage[key] = data;
                    save = true;
                }
            }
            if (save) {
                this.save();
            }
        }
        removeItem(key) {
            // Only update if the key is actually present (not undefined)
            if (!(0, types_1.isUndefined)(this.storage[key])) {
                this.storage[key] = undefined;
                this.save();
            }
        }
        async save() {
            if (this.closing) {
                return; // already about to close
            }
            if (this.flushDelayer) {
                return this.flushDelayer.trigger(() => this.doSave());
            }
            return this.doSave();
        }
        async doSave() {
            if (!this.initializing) {
                return; // if we never initialized, we should not save our state
            }
            // Make sure to wait for init to finish first
            await this.initializing;
            // Return early if the database has not changed
            const serializedDatabase = JSON.stringify(this.storage, null, 4);
            if (serializedDatabase === this.lastSavedStorageContents) {
                return;
            }
            // Write to disk
            try {
                await this.fileService.writeFile(this.storagePath, buffer_1.VSBuffer.fromString(serializedDatabase), { atomic: { postfix: '.vsctmp' } });
                this.lastSavedStorageContents = serializedDatabase;
            }
            catch (error) {
                this.logService.error(error);
            }
        }
        async close() {
            if (!this.closing) {
                this.closing = this.flushDelayer
                    ? this.flushDelayer.trigger(() => this.doSave(), 0 /* as soon as possible */)
                    : this.doSave();
            }
            return this.closing;
        }
    }
    exports.FileStorage = FileStorage;
    let StateReadonlyService = class StateReadonlyService extends lifecycle_1.Disposable {
        constructor(saveStrategy, environmentService, logService, fileService) {
            super();
            this.fileStorage = this._register(new FileStorage(environmentService.stateResource, saveStrategy, logService, fileService));
        }
        async init() {
            await this.fileStorage.init();
        }
        getItem(key, defaultValue) {
            return this.fileStorage.getItem(key, defaultValue);
        }
    };
    exports.StateReadonlyService = StateReadonlyService;
    exports.StateReadonlyService = StateReadonlyService = __decorate([
        __param(1, environment_1.IEnvironmentService),
        __param(2, log_1.ILogService),
        __param(3, files_1.IFileService)
    ], StateReadonlyService);
    class StateService extends StateReadonlyService {
        setItem(key, data) {
            this.fileStorage.setItem(key, data);
        }
        setItems(items) {
            this.fileStorage.setItems(items);
        }
        removeItem(key) {
            this.fileStorage.removeItem(key);
        }
        close() {
            return this.fileStorage.close();
        }
    }
    exports.StateService = StateService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGVTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vc3RhdGUvbm9kZS9zdGF0ZVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBY2hHLElBQWtCLFlBR2pCO0lBSEQsV0FBa0IsWUFBWTtRQUM3Qix5REFBUyxDQUFBO1FBQ1QscURBQU8sQ0FBQTtJQUNSLENBQUMsRUFIaUIsWUFBWSw0QkFBWixZQUFZLFFBRzdCO0lBRUQsTUFBYSxXQUFZLFNBQVEsc0JBQVU7UUFVMUMsWUFDa0IsV0FBZ0IsRUFDakMsWUFBMEIsRUFDVCxVQUF1QixFQUN2QixXQUF5QjtZQUUxQyxLQUFLLEVBQUUsQ0FBQztZQUxTLGdCQUFXLEdBQVgsV0FBVyxDQUFLO1lBRWhCLGVBQVUsR0FBVixVQUFVLENBQWE7WUFDdkIsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFabkMsWUFBTyxHQUFvQixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQy9DLDZCQUF3QixHQUFHLEVBQUUsQ0FBQztZQUk5QixpQkFBWSxHQUE4QixTQUFTLENBQUM7WUFDcEQsWUFBTyxHQUE4QixTQUFTLENBQUM7WUFVdEQsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLG1DQUEyQixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSx3QkFBZ0IsQ0FBTyxHQUFHLENBQUMsb0NBQW9DLENBQUMsQ0FBQyxDQUFDO1FBQ2hLLENBQUM7UUFFRCxJQUFJO1lBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQ3ZCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2FBQ2xDO1lBRUQsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBQzFCLENB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