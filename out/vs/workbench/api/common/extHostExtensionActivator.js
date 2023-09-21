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
define(["require", "exports", "vs/base/common/errors", "vs/workbench/services/extensions/common/extensionDescriptionRegistry", "vs/platform/extensions/common/extensions", "vs/workbench/services/extensions/common/extensions", "vs/platform/log/common/log", "vs/base/common/async"], function (require, exports, errors, extensionDescriptionRegistry_1, extensions_1, extensions_2, log_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionsActivator = exports.HostExtension = exports.EmptyExtension = exports.ActivatedExtension = exports.ExtensionActivationTimesBuilder = exports.ExtensionActivationTimes = void 0;
    class ExtensionActivationTimes {
        static { this.NONE = new ExtensionActivationTimes(false, -1, -1, -1); }
        constructor(startup, codeLoadingTime, activateCallTime, activateResolvedTime) {
            this.startup = startup;
            this.codeLoadingTime = codeLoadingTime;
            this.activateCallTime = activateCallTime;
            this.activateResolvedTime = activateResolvedTime;
        }
    }
    exports.ExtensionActivationTimes = ExtensionActivationTimes;
    class ExtensionActivationTimesBuilder {
        constructor(startup) {
            this._startup = startup;
            this._codeLoadingStart = -1;
            this._codeLoadingStop = -1;
            this._activateCallStart = -1;
            this._activateCallStop = -1;
            this._activateResolveStart = -1;
            this._activateResolveStop = -1;
        }
        _delta(start, stop) {
            if (start === -1 || stop === -1) {
                return -1;
            }
            return stop - start;
        }
        build() {
            return new ExtensionActivationTimes(this._startup, this._delta(this._codeLoadingStart, this._codeLoadingStop), this._delta(this._activateCallStart, this._activateCallStop), this._delta(this._activateResolveStart, this._activateResolveStop));
        }
        codeLoadingStart() {
            this._codeLoadingStart = Date.now();
        }
        codeLoadingStop() {
            this._codeLoadingStop = Date.now();
        }
        activateCallStart() {
            this._activateCallStart = Date.now();
        }
        activateCallStop() {
            this._activateCallStop = Date.now();
        }
        activateResolveStart() {
            this._activateResolveStart = Date.now();
        }
        activateResolveStop() {
            this._activateResolveStop = Date.now();
        }
    }
    exports.ExtensionActivationTimesBuilder = ExtensionActivationTimesBuilder;
    class ActivatedExtension {
        constructor(activationFailed, activationFailedError, activationTimes, module, exports, subscriptions) {
            this.activationFailed = activationFailed;
            this.activationFailedError = activationFailedError;
            this.activationTimes = activationTimes;
            this.module = module;
            this.exports = exports;
            this.subscriptions = subscriptions;
        }
    }
    exports.ActivatedExtension = ActivatedExtension;
    class EmptyExtension extends ActivatedExtension {
        constructor(activationTimes) {
            super(false, null, activationTimes, { activate: undefined, deactivate: undefined }, undefined, []);
        }
    }
    exports.EmptyExtension = EmptyExtension;
    class HostExtension extends ActivatedExtension {
        constructor() {
            super(false, null, ExtensionActivationTimes.NONE, { activate: undefined, deactivate: undefined }, undefined, []);
        }
    }
    exports.HostExtension = HostExtension;
    class FailedExtension extends ActivatedExtension {
        constructor(activationError) {
            super(true, activationError, ExtensionActivationTimes.NONE, { activate: undefined, deactivate: undefined }, undefined, []);
        }
    }
    let ExtensionsActivator = class ExtensionsActivator {
        constructor(registry, globalRegistry, host, _logService) {
            this._logService = _logService;
            this._registry = registry;
            this._globalRegistry = globalRegistry;
            this._host = host;
            this._operations = new extensions_1.ExtensionIdentifierMap();
            this._alreadyActivatedEvents = Object.create(null);
        }
        dispose() {
            for (const [_, op] of this._operations) {
                op.dispose();
            }
        }
        async waitForActivatingExtensions() {
            const res = [];
            for (const [_, op] of this._operations) {
                res.push(op.wait());
            }
            await Promise.all(res);
        }
        isActivated(extensionId) {
            const op = this._operations.get(extensionId);
            return Boolean(op && op.value);
        }
        getActivatedExtension(extensionId) {
            const op = this._operations.get(extensionId);
            if (!op || !op.value) {
                throw new Error(`Extension '${extensionId.value}' is not known or not activated`);
            }
            return op.value;
        }
        async activateByEvent(activationEvent, startup) {
            if (this._alreadyActivatedEvents[activationEvent]) {
                return;
            }
            const activateExtensions = this._registry.getExtensionDescriptionsForActivationEvent(activationEvent);
            await this._activateExtensions(activateExtensions.map(e => ({
                id: e.identifier,
                reason: { startup, extensionId: e.identifier, activationEvent }
            })));
            this._alreadyActivatedEvents[activationEvent] = true;
        }
        activateById(extensionId, reason) {
            const desc = this._registry.getExtensionDescription(extensionId);
            if (!desc) {
                throw new Error(`Extension '${extensionId}' is not known`);
            }
            return this._activateExtensions([{ id: desc.identifier, reason }]);
        }
        async _activateExtensions(extensions) {
            const operations = extensions
                .filter((p) => !this.isActivated(p.id))
                .map(ext => this._handleActivationRequest(ext));
            await Promise.all(operations.map(op => op.wait()));
        }
        /**
         * Handle semantics related to dependencies for `currentExtension`.
         * We don't need to worry about dependency loops because they are handled by the registry.
         */
        _handleActivationRequest(currentActivation) {
            if (this._operations.has(currentActivation.id)) {
                return this._operations.get(currentActivation.id);
            }
            if (this._isHostExtension(currentActivation.id)) {
                return this._createAndSaveOperation(currentActivation, null, [], null);
            }
            const currentExtension = this._registry.getExtensionDescription(currentActivation.id);
            if (!currentExtension) {
                // Error condition 0: unknown extension
                const error = new Error(`Cannot activate unknown extension '${currentActivation.id.value}'`);
                const result = this._createAndSaveOperation(currentActivation, null, [], new FailedExtension(error));
                this._host.onExtensionActivationError(currentActivation.id, error, new extensions_2.MissingExtensionDependency(currentActivation.id.value));
                return result;
            }
            const deps = [];
            const depIds = (typeof currentExtension.extensionDependencies === 'undefined' ? [] : currentExtension.extensionDependencies);
            for (const depId of depIds) {
                if (this._isResolvedExtension(depId)) {
                    // This dependency is already resolved
                    continue;
                }
                const dep = this._operations.get(depId);
                if (dep) {
                    deps.push(dep);
                    continue;
                }
                if (this._isHostExtension(depId)) {
                    // must first wait for the dependency to activate
                    deps.push(this._handleActivationRequest({
                        id: this._globalRegistry.getExtensionDescription(depId).identifier,
                        reason: currentActivation.reason
                    }));
                    continue;
                }
                const depDesc = this._registry.getExtensionDescription(depId);
                if (depDesc) {
                    if (!depDesc.main && !depDesc.browser) {
                        // this dependency does not need to activate because it is descriptive only
                        continue;
                    }
                    // must first wait for the dependency to activate
                    deps.push(this._handleActivationRequest({
                        id: depDesc.identifier,
                        reason: currentActivation.reason
                    }));
                    continue;
                }
                // Error condition 1: unknown dependency
                const currentExtensionFriendlyName = currentExtension.displayName || currentExtension.identifier.value;
                const error = new Error(`Cannot activate the '${currentExtensionFriendlyName}' extension because it depends on unknown extension '${depId}'`);
                const result = this._createAndSaveOperation(currentActivation, currentExtension.displayName, [], new FailedExtension(error));
                this._host.onExtensionActivationError(currentExtension.identifier, error, new extensions_2.MissingExtensionDependency(depId));
                return result;
            }
            return this._createAndSaveOperation(currentActivation, currentExtension.displayName, deps, null);
        }
        _createAndSaveOperation(activation, displayName, deps, value) {
            const operation = new ActivationOperation(activation.id, displayName, activation.reason, deps, value, this._host, this._logService);
            this._operations.set(activation.id, operation);
            return operation;
        }
        _isHostExtension(extensionId) {
            return extensionDescriptionRegistry_1.ExtensionDescriptionRegistry.isHostExtension(extensionId, this._registry, this._globalRegistry);
        }
        _isResolvedExtension(extensionId) {
            const extensionDescription = this._globalRegistry.getExtensionDescription(extensionId);
            if (!extensionDescription) {
                // unknown extension
                return false;
            }
            return (!extensionDescription.main && !extensionDescription.browser);
        }
    };
    exports.ExtensionsActivator = ExtensionsActivator;
    exports.ExtensionsActivator = ExtensionsActivator = __decorate([
        __param(3, log_1.ILogService)
    ], ExtensionsActivator);
    let ActivationOperation = class ActivationOperation {
        get value() {
            return this._value;
        }
        get friendlyName() {
            return this._displayName || this._id.value;
        }
        constructor(_id, _displayName, _reason, _deps, _value, _host, _logService) {
            this._id = _id;
            this._displayName = _displayName;
            this._reason = _reason;
            this._deps = _deps;
            this._value = _value;
            this._host = _host;
            this._logService = _logService;
            this._barrier = new async_1.Barrier();
            this._isDisposed = false;
            this._initialize();
        }
        dispose() {
            this._isDisposed = true;
        }
        wait() {
            return this._barrier.wait();
        }
        async _initialize() {
            await this._waitForDepsThenActivate();
            this._barrier.open();
        }
        async _waitForDepsThenActivate() {
            if (this._value) {
                // this operation is already finished
                return;
            }
            while (this._deps.length > 0) {
                // remove completed deps
                for (let i = 0; i < this._deps.length; i++) {
                    const dep = this._deps[i];
                    if (dep.value && !dep.value.activationFailed) {
                        // the dependency is already activated OK
                        this._deps.splice(i, 1);
                        i--;
                        continue;
                    }
                    if (dep.value && dep.value.activationFailed) {
                        // Error condition 2: a dependency has already failed activation
                        const error = new Error(`Cannot activate the '${this.friendlyName}' extension because its dependency '${dep.friendlyName}' failed to activate`);
                        error.detail = dep.value.activationFailedError;
                        this._value = new FailedExtension(error);
                        this._host.onExtensionActivationError(this._id, error, null);
                        return;
                    }
                }
                if (this._deps.length > 0) {
                    // wait for one dependency
                    await Promise.race(this._deps.map(dep => dep.wait()));
                }
            }
            await this._activate();
        }
        async _activate() {
            try {
                this._value = await this._host.actualActivateExtension(this._id, this._reason);
            }
            catch (err) {
                const error = new Error();
                if (err && err.name) {
                    error.name = err.name;
                }
                if (err && err.message) {
                    error.message = `Activating extension '${this._id.value}' failed: ${err.message}.`;
                }
                else {
                    error.message = `Activating extension '${this._id.value}' failed: ${err}.`;
                }
                if (err && err.stack) {
                    error.stack = err.stack;
                }
                // Treat the extension as being empty
                this._value = new FailedExtension(error);
                if (this._isDisposed && errors.isCancellationError(err)) {
                    // It is expected for ongoing activations to fail if the extension host is going down
                    // So simply ignore and don't log canceled errors in this case
                    return;
                }
                this._host.onExtensionActivationError(this._id, error, null);
                this._logService.error(`Activating extension ${this._id.value} failed due to an error:`);
                this._logService.error(err);
            }
        }
    };
    ActivationOperation = __decorate([
        __param(6, log_1.ILogService)
    ], ActivationOperation);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdEV4dGVuc2lvbkFjdGl2YXRvci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3RFeHRlbnNpb25BY3RpdmF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBaUNoRyxNQUFhLHdCQUF3QjtpQkFFYixTQUFJLEdBQUcsSUFBSSx3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQU85RSxZQUFZLE9BQWdCLEVBQUUsZUFBdUIsRUFBRSxnQkFBd0IsRUFBRSxvQkFBNEI7WUFDNUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7WUFDdkIsSUFBSSxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUM7WUFDdkMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO1lBQ3pDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxvQkFBb0IsQ0FBQztRQUNsRCxDQUFDOztJQWRGLDREQWVDO0lBRUQsTUFBYSwrQkFBK0I7UUFVM0MsWUFBWSxPQUFnQjtZQUMzQixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztZQUN4QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM3QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLHFCQUFxQixHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNoQyxDQUFDO1FBRU8sTUFB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