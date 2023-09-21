/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "sinon", "vs/base/common/lifecycle", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiationService", "vs/platform/instantiation/common/serviceCollection"], function (require, exports, sinon, lifecycle_1, descriptors_1, instantiationService_1, serviceCollection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$M0b = exports.$L0b = void 0;
    const isSinonSpyLike = (fn) => fn && 'callCount' in fn;
    class $L0b extends instantiationService_1.$6p {
        constructor(w = new serviceCollection_1.$zh(), strict = false, parent) {
            super(w, strict, parent);
            this.w = w;
            this.v = new Map();
        }
        get(service) {
            return super.m(service, instantiationService_1.$7p.traceCreation(false, $L0b));
        }
        set(service, instance) {
            return this.w.set(service, instance);
        }
        mock(service) {
            return this.x(service, { mock: true });
        }
        stub(serviceIdentifier, arg2, arg3, arg4) {
            const service = typeof arg2 !== 'string' ? arg2 : undefined;
            const serviceMock = { id: serviceIdentifier, service: service };
            const property = typeof arg2 === 'string' ? arg2 : arg3;
            const value = typeof arg2 === 'string' ? arg3 : arg4;
            const stubObject = this.x(serviceMock, { stub: true }, service && !property);
            if (property) {
                if (stubObject[property]) {
                    if (stubObject[property].hasOwnProperty('restore')) {
                        stubObject[property].restore();
                    }
                    if (typeof value === 'function') {
                        const spy = isSinonSpyLike(value) ? value : sinon.spy(value);
                        stubObject[property] = spy;
                        return spy;
                    }
                    else {
                        const stub = value ? sinon.stub().returns(value) : sinon.stub();
                        stubObject[property] = stub;
                        return stub;
                    }
                }
                else {
                    stubObject[property] = value;
                }
            }
            return stubObject;
        }
        stubPromise(arg1, arg2, arg3, arg4) {
            arg3 = typeof arg2 === 'string' ? Promise.resolve(arg3) : arg3;
            arg4 = typeof arg2 !== 'string' && typeof arg3 === 'string' ? Promise.resolve(arg4) : arg4;
            return this.stub(arg1, arg2, arg3, arg4);
        }
        spy(service, fnProperty) {
            const spy = sinon.spy();
            this.stub(service, fnProperty, spy);
            return spy;
        }
        x(arg1, options, reset = false) {
            if (this.B(arg1)) {
                const service = this.y(arg1, options, reset);
                this.w.set(arg1.id, service);
                return service;
            }
            return options.mock ? sinon.mock(arg1) : this.A(arg1);
        }
        y(serviceMock, opts, reset) {
            const service = this.w.get(serviceMock.id);
            if (!reset && service) {
                if (opts.mock && service['sinonOptions'] && !!service['sinonOptions'].mock) {
                    return service;
                }
                if (opts.stub && service['sinonOptions'] && !!service['sinonOptions'].stub) {
                    return service;
                }
            }
            return this.z(serviceMock, opts);
        }
        z(serviceMock, opts) {
            serviceMock.service = serviceMock.service ? serviceMock.service : this.v.get(serviceMock.id);
            const service = opts.mock ? sinon.mock(serviceMock.service) : this.A(serviceMock.service);
            service['sinonOptions'] = opts;
            return service;
        }
        A(arg) {
            return typeof arg === 'object' ? arg : sinon.createStubInstance(arg);
        }
        B(arg1) {
            return typeof arg1 === 'object' && arg1.hasOwnProperty('id');
        }
        createChild(services) {
            return new $L0b(services, false, this);
        }
        dispose() {
            sinon.restore();
        }
    }
    exports.$L0b = $L0b;
    function $M0b(disposables, services) {
        const serviceIdentifiers = [];
        const serviceCollection = new serviceCollection_1.$zh();
        const define = (id, ctorOrInstance) => {
            if (!serviceCollection.has(id)) {
                if (typeof ctorOrInstance === 'function') {
                    serviceCollection.set(id, new descriptors_1.$yh(ctorOrInstance));
                }
                else {
                    serviceCollection.set(id, ctorOrInstance);
                }
            }
            serviceIdentifiers.push(id);
        };
        for (const [id, ctor] of services) {
            define(id, ctor);
        }
        const instantiationService = disposables.add(new $L0b(serviceCollection, true));
        disposables.add((0, lifecycle_1.$ic)(() => {
            for (const id of serviceIdentifiers) {
                const instanceOrDescriptor = serviceCollection.get(id);
                if (typeof instanceOrDescriptor.dispose === 'function') {
                    instanceOrDescriptor.dispose();
                }
            }
        }));
        return instantiationService;
    }
    exports.$M0b = $M0b;
});
//# sourceMappingURL=instantiationServiceMock.js.map