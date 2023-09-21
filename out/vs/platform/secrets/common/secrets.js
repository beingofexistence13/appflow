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
define(["require", "exports", "vs/base/common/async", "vs/platform/encryption/common/encryptionService", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/base/common/event", "vs/platform/log/common/log", "vs/base/common/lifecycle", "vs/base/common/lazy"], function (require, exports, async_1, encryptionService_1, instantiation_1, storage_1, event_1, log_1, lifecycle_1, lazy_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BaseSecretStorageService = exports.ISecretStorageService = void 0;
    exports.ISecretStorageService = (0, instantiation_1.createDecorator)('secretStorageService');
    let BaseSecretStorageService = class BaseSecretStorageService extends lifecycle_1.Disposable {
        constructor(_useInMemoryStorage, _storageService, _encryptionService, _logService) {
            super();
            this._useInMemoryStorage = _useInMemoryStorage;
            this._storageService = _storageService;
            this._encryptionService = _encryptionService;
            this._logService = _logService;
            this._storagePrefix = 'secret://';
            this.onDidChangeSecretEmitter = this._register(new event_1.Emitter());
            this.onDidChangeSecret = this.onDidChangeSecretEmitter.event;
            this._sequencer = new async_1.SequencerByKey();
            this._type = 'unknown';
            this._onDidChangeValueDisposable = this._register(new lifecycle_1.DisposableStore());
            this._lazyStorageService = new lazy_1.Lazy(() => this.initialize());
        }
        /**
         * @Note initialize must be called first so that this can be resolved properly
         * otherwise it will return 'unknown'.
         */
        get type() {
            return this._type;
        }
        get resolvedStorageService() {
            return this._lazyStorageService.value;
        }
        get(key) {
            return this._sequencer.queue(key, async () => {
                const storageService = await this.resolvedStorageService;
                const fullKey = this.getKey(key);
                this._logService.trace('[secrets] getting secret for key:', fullKey);
                const encrypted = storageService.get(fullKey, -1 /* StorageScope.APPLICATION */);
                if (!encrypted) {
                    this._logService.trace('[secrets] no secret found for key:', fullKey);
                    return undefined;
                }
                try {
                    this._logService.trace('[secrets] decrypting gotten secret for key:', fullKey);
                    // If the storage service is in-memory, we don't need to decrypt
                    const result = this._type === 'in-memory'
                        ? encrypted
                        : await this._encryptionService.decrypt(encrypted);
                    this._logService.trace('[secrets] decrypted secret for key:', fullKey);
                    return result;
                }
                catch (e) {
                    this._logService.error(e);
                    this.delete(key);
                    return undefined;
                }
            });
        }
        set(key, value) {
            return this._sequencer.queue(key, async () => {
                const storageService = await this.resolvedStorageService;
                this._logService.trace('[secrets] encrypting secret for key:', key);
                let encrypted;
                try {
                    // If the storage service is in-memory, we don't need to encrypt
                    encrypted = this._type === 'in-memory'
                        ? value
                        : await this._encryptionService.encrypt(value);
                }
                catch (e) {
                    this._logService.error(e);
                    throw e;
                }
                const fullKey = this.getKey(key);
                this._logService.trace('[secrets] storing encrypted secret for key:', fullKey);
                storageService.store(fullKey, encrypted, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                this._logService.trace('[secrets] stored encrypted secret for key:', fullKey);
            });
        }
        delete(key) {
            return this._sequencer.queue(key, async () => {
                const storageService = await this.resolvedStorageService;
                const fullKey = this.getKey(key);
                this._logService.trace('[secrets] deleting secret for key:', fullKey);
                storageService.remove(fullKey, -1 /* StorageScope.APPLICATION */);
                this._logService.trace('[secrets] deleted secret for key:', fullKey);
            });
        }
        async initialize() {
            let storageService;
            if (!this._useInMemoryStorage && await this._encryptionService.isEncryptionAvailable()) {
                this._logService.trace(`[SecretStorageService] Encryption is available, using persisted storage`);
                this._type = 'persisted';
                storageService = this._storageService;
            }
            else {
                // If we already have an in-memory storage service, we don't need to recreate it
                if (this._type === 'in-memory') {
                    return this._storageService;
                }
                this._logService.trace('[SecretStorageService] Encryption is not available, falling back to in-memory storage');
                this._type = 'in-memory';
                storageService = this._register(new storage_1.InMemoryStorageService());
            }
            this._onDidChangeValueDisposable.clear();
            this._onDidChangeValueDisposable.add(storageService.onDidChangeValue(-1 /* StorageScope.APPLICATION */, undefined, this._onDidChangeValueDisposable)(e => {
                this.onDidChangeValue(e.key);
            }));
            return storageService;
        }
        reinitialize() {
            this._lazyStorageService = new lazy_1.Lazy(() => this.initialize());
        }
        onDidChangeValue(key) {
            if (!key.startsWith(this._storagePrefix)) {
                return;
            }
            const secretKey = key.slice(this._storagePrefix.length);
            this._logService.trace(`[SecretStorageService] Notifying change in value for secret: ${secretKey}`);
            this.onDidChangeSecretEmitter.fire(secretKey);
        }
        getKey(key) {
            return `${this._storagePrefix}${key}`;
        }
    };
    exports.BaseSecretStorageService = BaseSecretStorageService;
    exports.BaseSecretStorageService = BaseSecretStorageService = __decorate([
        __param(1, storage_1.IStorageService),
        __param(2, encryptionService_1.IEncryptionService),
        __param(3, log_1.ILogService)
    ], BaseSecretStorageService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjcmV0cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3NlY3JldHMvY29tbW9uL3NlY3JldHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBV25GLFFBQUEscUJBQXFCLEdBQUcsSUFBQSwrQkFBZSxFQUF3QixzQkFBc0IsQ0FBQyxDQUFDO0lBYzdGLElBQU0sd0JBQXdCLEdBQTlCLE1BQU0sd0JBQXlCLFNBQVEsc0JBQVU7UUFjdkQsWUFDa0IsbUJBQTRCLEVBQzVCLGVBQXdDLEVBQ3JDLGtCQUFnRCxFQUN2RCxXQUEyQztZQUV4RCxLQUFLLEVBQUUsQ0FBQztZQUxTLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBUztZQUNwQixvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFDM0IsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtZQUNwQyxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQWZ4QyxtQkFBYyxHQUFHLFdBQVcsQ0FBQztZQUUzQiw2QkFBd0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFVLENBQUMsQ0FBQztZQUNwRixzQkFBaUIsR0FBa0IsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssQ0FBQztZQUVwRCxlQUFVLEdBQUcsSUFBSSxzQkFBYyxFQUFVLENBQUM7WUFFckQsVUFBSyxHQUEwQyxTQUFTLENBQUM7WUFFaEQsZ0NBQTJCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDJCQUFlLEVBQUUsQ0FBQyxDQUFDO1lBbUI3RSx3QkFBbUIsR0FBbUMsSUFBSSxXQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFWaEcsQ0FBQztRQUVEOzs7V0FHRztRQUNILElBQUksSUFBSTtZQUNQLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNu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