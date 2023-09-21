/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "sinon", "vs/base/common/lifecycle", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiationService", "vs/platform/instantiation/common/serviceCollection"], function (require, exports, sinon, lifecycle_1, descriptors_1, instantiationService_1, serviceCollection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createServices = exports.TestInstantiationService = void 0;
    const isSinonSpyLike = (fn) => fn && 'callCount' in fn;
    class TestInstantiationService extends instantiationService_1.InstantiationService {
        constructor(_serviceCollection = new serviceCollection_1.ServiceCollection(), strict = false, parent) {
            super(_serviceCollection, strict, parent);
            this._serviceCollection = _serviceCollection;
            this._servciesMap = new Map();
        }
        get(service) {
            return super._getOrCreateServiceInstance(service, instantiationService_1.Trace.traceCreation(false, TestInstantiationService));
        }
        set(service, instance) {
            return this._serviceCollection.set(service, instance);
        }
        mock(service) {
            return this._create(service, { mock: true });
        }
        stub(serviceIdentifier, arg2, arg3, arg4) {
            const service = typeof arg2 !== 'string' ? arg2 : undefined;
            const serviceMock = { id: serviceIdentifier, service: service };
            const property = typeof arg2 === 'string' ? arg2 : arg3;
            const value = typeof arg2 === 'string' ? arg3 : arg4;
            const stubObject = this._create(serviceMock, { stub: true }, service && !property);
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
        _create(arg1, options, reset = false) {
            if (this.isServiceMock(arg1)) {
                const service = this._getOrCreateService(arg1, options, reset);
                this._serviceCollection.set(arg1.id, service);
                return service;
            }
            return options.mock ? sinon.mock(arg1) : this._createStub(arg1);
        }
        _getOrCreateService(serviceMock, opts, reset) {
            const service = this._serviceCollection.get(serviceMock.id);
            if (!reset && service) {
                if (opts.mock && service['sinonOptions'] && !!service['sinonOptions'].mock) {
                    return service;
                }
                if (opts.stub && service['sinonOptions'] && !!service['sinonOptions'].stub) {
                    return service;
                }
            }
            return this._createService(serviceMock, opts);
        }
        _createService(serviceMock, opts) {
            serviceMock.service = serviceMock.service ? serviceMock.service : this._servciesMap.get(serviceMock.id);
            const service = opts.mock ? sinon.mock(serviceMock.service) : this._createStub(serviceMock.service);
            service['sinonOptions'] = opts;
            return service;
        }
        _createStub(arg) {
            return typeof arg === 'object' ? arg : sinon.createStubInstance(arg);
        }
        isServiceMock(arg1) {
            return typeof arg1 === 'object' && arg1.hasOwnProperty('id');
        }
        createChild(services) {
            return new TestInstantiationService(services, false, this);
        }
        dispose() {
            sinon.restore();
        }
    }
    exports.TestInstantiationService = TestInstantiationService;
    function createServices(disposables, services) {
        const serviceIdentifiers = [];
        const serviceCollection = new serviceCollection_1.ServiceCollection();
        const define = (id, ctorOrInstance) => {
            if (!serviceCollection.has(id)) {
                if (typeof ctorOrInstance === 'function') {
                    serviceCollection.set(id, new descriptors_1.SyncDescriptor(ctorOrInstance));
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
        const instantiationService = disposables.add(new TestInstantiationService(serviceCollection, true));
        disposables.add((0, lifecycle_1.toDisposable)(() => {
            for (const id of serviceIdentifiers) {
                const instanceOrDescriptor = serviceCollection.get(id);
                if (typeof instanceOrDescriptor.dispose === 'function') {
                    instanceOrDescriptor.dispose();
                }
            }
        }));
        return instantiationService;
    }
    exports.createServices = createServices;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdGFudGlhdGlvblNlcnZpY2VNb2NrLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vaW5zdGFudGlhdGlvbi90ZXN0L2NvbW1vbi9pbnN0YW50aWF0aW9uU2VydmljZU1vY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBY2hHLE1BQU0sY0FBYyxHQUFHLENBQUMsRUFBWSxFQUF3QixFQUFFLENBQUMsRUFBRSxJQUFJLFdBQVcsSUFBSSxFQUFFLENBQUM7SUFFdkYsTUFBYSx3QkFBeUIsU0FBUSwyQ0FBb0I7UUFJakUsWUFBb0IscUJBQXdDLElBQUkscUNBQWlCLEVBQUUsRUFBRSxTQUFrQixLQUFLLEVBQUUsTUFBaUM7WUFDOUksS0FBSyxDQUFDLGtCQUFrQixFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUR2Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQTZDO1lBR2xGLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxHQUFHLEVBQStCLENBQUM7UUFDNUQsQ0FBQztRQUVNLEdBQUcsQ0FBSSxPQUE2QjtZQUMxQyxPQUFPLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxPQUFPLEVBQUUsNEJBQUssQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLHdCQUF3QixDQUFDLENBQUMsQ0FBQztRQUN6RyxDQUFDO1FBRU0sR0FBRyxDQUFJLE9BQTZCLEVBQUUsUUFBVztZQUN2RCxPQUFVLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzFELENBQUM7UUFFTSxJQUFJLENBQUksT0FBNkI7WUFDM0MsT0FBVSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ2pELENBQUM7UUFPTSxJQUFJLENBQUksaUJBQXVDLEVB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