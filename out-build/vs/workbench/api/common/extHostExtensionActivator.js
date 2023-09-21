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
    exports.$vbc = exports.$ubc = exports.$tbc = exports.$sbc = exports.$rbc = exports.$qbc = void 0;
    class $qbc {
        static { this.NONE = new $qbc(false, -1, -1, -1); }
        constructor(startup, codeLoadingTime, activateCallTime, activateResolvedTime) {
            this.startup = startup;
            this.codeLoadingTime = codeLoadingTime;
            this.activateCallTime = activateCallTime;
            this.activateResolvedTime = activateResolvedTime;
        }
    }
    exports.$qbc = $qbc;
    class $rbc {
        constructor(startup) {
            this.a = startup;
            this.b = -1;
            this.c = -1;
            this.d = -1;
            this.f = -1;
            this.g = -1;
            this.h = -1;
        }
        j(start, stop) {
            if (start === -1 || stop === -1) {
                return -1;
            }
            return stop - start;
        }
        build() {
            return new $qbc(this.a, this.j(this.b, this.c), this.j(this.d, this.f), this.j(this.g, this.h));
        }
        codeLoadingStart() {
            this.b = Date.now();
        }
        codeLoadingStop() {
            this.c = Date.now();
        }
        activateCallStart() {
            this.d = Date.now();
        }
        activateCallStop() {
            this.f = Date.now();
        }
        activateResolveStart() {
            this.g = Date.now();
        }
        activateResolveStop() {
            this.h = Date.now();
        }
    }
    exports.$rbc = $rbc;
    class $sbc {
        constructor(activationFailed, activationFailedError, activationTimes, module, exports, subscriptions) {
            this.activationFailed = activationFailed;
            this.activationFailedError = activationFailedError;
            this.activationTimes = activationTimes;
            this.module = module;
            this.exports = exports;
            this.subscriptions = subscriptions;
        }
    }
    exports.$sbc = $sbc;
    class $tbc extends $sbc {
        constructor(activationTimes) {
            super(false, null, activationTimes, { activate: undefined, deactivate: undefined }, undefined, []);
        }
    }
    exports.$tbc = $tbc;
    class $ubc extends $sbc {
        constructor() {
            super(false, null, $qbc.NONE, { activate: undefined, deactivate: undefined }, undefined, []);
        }
    }
    exports.$ubc = $ubc;
    class FailedExtension extends $sbc {
        constructor(activationError) {
            super(true, activationError, $qbc.NONE, { activate: undefined, deactivate: undefined }, undefined, []);
        }
    }
    let $vbc = class $vbc {
        constructor(registry, globalRegistry, host, g) {
            this.g = g;
            this.a = registry;
            this.b = globalRegistry;
            this.c = host;
            this.d = new extensions_1.$Xl();
            this.f = Object.create(null);
        }
        dispose() {
            for (const [_, op] of this.d) {
                op.dispose();
            }
        }
        async waitForActivatingExtensions() {
            const res = [];
            for (const [_, op] of this.d) {
                res.push(op.wait());
            }
            await Promise.all(res);
        }
        isActivated(extensionId) {
            const op = this.d.get(extensionId);
            return Boolean(op && op.value);
        }
        getActivatedExtension(extensionId) {
            const op = this.d.get(extensionId);
            if (!op || !op.value) {
                throw new Error(`Extension '${extensionId.value}' is not known or not activated`);
            }
            return op.value;
        }
        async activateByEvent(activationEvent, startup) {
            if (this.f[activationEvent]) {
                return;
            }
            const activateExtensions = this.a.getExtensionDescriptionsForActivationEvent(activationEvent);
            await this.h(activateExtensions.map(e => ({
                id: e.identifier,
                reason: { startup, extensionId: e.identifier, activationEvent }
            })));
            this.f[activationEvent] = true;
        }
        activateById(extensionId, reason) {
            const desc = this.a.getExtensionDescription(extensionId);
            if (!desc) {
                throw new Error(`Extension '${extensionId}' is not known`);
            }
            return this.h([{ id: desc.identifier, reason }]);
        }
        async h(extensions) {
            const operations = extensions
                .filter((p) => !this.isActivated(p.id))
                .map(ext => this.j(ext));
            await Promise.all(operations.map(op => op.wait()));
        }
        /**
         * Handle semantics related to dependencies for `currentExtension`.
         * We don't need to worry about dependency loops because they are handled by the registry.
         */
        j(currentActivation) {
            if (this.d.has(currentActivation.id)) {
                return this.d.get(currentActivation.id);
            }
            if (this.l(currentActivation.id)) {
                return this.k(currentActivation, null, [], null);
            }
            const currentExtension = this.a.getExtensionDescription(currentActivation.id);
            if (!currentExtension) {
                // Error condition 0: unknown extension
                const error = new Error(`Cannot activate unknown extension '${currentActivation.id.value}'`);
                const result = this.k(currentActivation, null, [], new FailedExtension(error));
                this.c.onExtensionActivationError(currentActivation.id, error, new extensions_2.$NF(currentActivation.id.value));
                return result;
            }
            const deps = [];
            const depIds = (typeof currentExtension.extensionDependencies === 'undefined' ? [] : currentExtension.extensionDependencies);
            for (const depId of depIds) {
                if (this.m(depId)) {
                    // This dependency is already resolved
                    continue;
                }
                const dep = this.d.get(depId);
                if (dep) {
                    deps.push(dep);
                    continue;
                }
                if (this.l(depId)) {
                    // must first wait for the dependency to activate
                    deps.push(this.j({
                        id: this.b.getExtensionDescription(depId).identifier,
                        reason: currentActivation.reason
                    }));
                    continue;
                }
                const depDesc = this.a.getExtensionDescription(depId);
                if (depDesc) {
                    if (!depDesc.main && !depDesc.browser) {
                        // this dependency does not need to activate because it is descriptive only
                        continue;
                    }
                    // must first wait for the dependency to activate
                    deps.push(this.j({
                        id: depDesc.identifier,
                        reason: currentActivation.reason
                    }));
                    continue;
                }
                // Error condition 1: unknown dependency
                const currentExtensionFriendlyName = currentExtension.displayName || currentExtension.identifier.value;
                const error = new Error(`Cannot activate the '${currentExtensionFriendlyName}' extension because it depends on unknown extension '${depId}'`);
                const result = this.k(currentActivation, currentExtension.displayName, [], new FailedExtension(error));
                this.c.onExtensionActivationError(currentExtension.identifier, error, new extensions_2.$NF(depId));
                return result;
            }
            return this.k(currentActivation, currentExtension.displayName, deps, null);
        }
        k(activation, displayName, deps, value) {
            const operation = new ActivationOperation(activation.id, displayName, activation.reason, deps, value, this.c, this.g);
            this.d.set(activation.id, operation);
            return operation;
        }
        l(extensionId) {
            return extensionDescriptionRegistry_1.$y3b.isHostExtension(extensionId, this.a, this.b);
        }
        m(extensionId) {
            const extensionDescription = this.b.getExtensionDescription(extensionId);
            if (!extensionDescription) {
                // unknown extension
                return false;
            }
            return (!extensionDescription.main && !extensionDescription.browser);
        }
    };
    exports.$vbc = $vbc;
    exports.$vbc = $vbc = __decorate([
        __param(3, log_1.$5i)
    ], $vbc);
    let ActivationOperation = class ActivationOperation {
        get value() {
            return this.h;
        }
        get friendlyName() {
            return this.d || this.c.value;
        }
        constructor(c, d, f, g, h, j, k) {
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.k = k;
            this.a = new async_1.$Fg();
            this.b = false;
            this.l();
        }
        dispose() {
            this.b = true;
        }
        wait() {
            return this.a.wait();
        }
        async l() {
            await this.m();
            this.a.open();
        }
        async m() {
            if (this.h) {
                // this operation is already finished
                return;
            }
            while (this.g.length > 0) {
                // remove completed deps
                for (let i = 0; i < this.g.length; i++) {
                    const dep = this.g[i];
                    if (dep.value && !dep.value.activationFailed) {
                        // the dependency is already activated OK
                        this.g.splice(i, 1);
                        i--;
                        continue;
                    }
                    if (dep.value && dep.value.activationFailed) {
                        // Error condition 2: a dependency has already failed activation
                        const error = new Error(`Cannot activate the '${this.friendlyName}' extension because its dependency '${dep.friendlyName}' failed to activate`);
                        error.detail = dep.value.activationFailedError;
                        this.h = new FailedExtension(error);
                        this.j.onExtensionActivationError(this.c, error, null);
                        return;
                    }
                }
                if (this.g.length > 0) {
                    // wait for one dependency
                    await Promise.race(this.g.map(dep => dep.wait()));
                }
            }
            await this.n();
        }
        async n() {
            try {
                this.h = await this.j.actualActivateExtension(this.c, this.f);
            }
            catch (err) {
                const error = new Error();
                if (err && err.name) {
                    error.name = err.name;
                }
                if (err && err.message) {
                    error.message = `Activating extension '${this.c.value}' failed: ${err.message}.`;
                }
                else {
                    error.message = `Activating extension '${this.c.value}' failed: ${err}.`;
                }
                if (err && err.stack) {
                    error.stack = err.stack;
                }
                // Treat the extension as being empty
                this.h = new FailedExtension(error);
                if (this.b && errors.$2(err)) {
                    // It is expected for ongoing activations to fail if the extension host is going down
                    // So simply ignore and don't log canceled errors in this case
                    return;
                }
                this.j.onExtensionActivationError(this.c, error, null);
                this.k.error(`Activating extension ${this.c.value} failed due to an error:`);
                this.k.error(err);
            }
        }
    };
    ActivationOperation = __decorate([
        __param(6, log_1.$5i)
    ], ActivationOperation);
});
//# sourceMappingURL=extHostExtensionActivator.js.map