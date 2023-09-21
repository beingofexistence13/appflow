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
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/instantiationService", "vs/platform/instantiation/common/serviceCollection"], function (require, exports, assert, event_1, lifecycle_1, descriptors_1, instantiation_1, instantiationService_1, serviceCollection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const IService1 = (0, instantiation_1.createDecorator)('service1');
    class Service1 {
        constructor() {
            this.c = 1;
        }
    }
    const IService2 = (0, instantiation_1.createDecorator)('service2');
    class Service2 {
        constructor() {
            this.d = true;
        }
    }
    const IService3 = (0, instantiation_1.createDecorator)('service3');
    class Service3 {
        constructor() {
            this.s = 'farboo';
        }
    }
    const IDependentService = (0, instantiation_1.createDecorator)('dependentService');
    let DependentService = class DependentService {
        constructor(service) {
            this.name = 'farboo';
            assert.strictEqual(service.c, 1);
        }
    };
    DependentService = __decorate([
        __param(0, IService1)
    ], DependentService);
    let Service1Consumer = class Service1Consumer {
        constructor(service1) {
            assert.ok(service1);
            assert.strictEqual(service1.c, 1);
        }
    };
    Service1Consumer = __decorate([
        __param(0, IService1)
    ], Service1Consumer);
    let Target2Dep = class Target2Dep {
        constructor(service1, service2) {
            assert.ok(service1 instanceof Service1);
            assert.ok(service2 instanceof Service2);
        }
    };
    Target2Dep = __decorate([
        __param(0, IService1),
        __param(1, IService2)
    ], Target2Dep);
    let TargetWithStaticParam = class TargetWithStaticParam {
        constructor(v, service1) {
            assert.ok(v);
            assert.ok(service1);
            assert.strictEqual(service1.c, 1);
        }
    };
    TargetWithStaticParam = __decorate([
        __param(1, IService1)
    ], TargetWithStaticParam);
    let DependentServiceTarget = class DependentServiceTarget {
        constructor(d) {
            assert.ok(d);
            assert.strictEqual(d.name, 'farboo');
        }
    };
    DependentServiceTarget = __decorate([
        __param(0, IDependentService)
    ], DependentServiceTarget);
    let DependentServiceTarget2 = class DependentServiceTarget2 {
        constructor(d, s) {
            assert.ok(d);
            assert.strictEqual(d.name, 'farboo');
            assert.ok(s);
            assert.strictEqual(s.c, 1);
        }
    };
    DependentServiceTarget2 = __decorate([
        __param(0, IDependentService),
        __param(1, IService1)
    ], DependentServiceTarget2);
    let ServiceLoop1 = class ServiceLoop1 {
        constructor(s) {
            this.c = 1;
        }
    };
    ServiceLoop1 = __decorate([
        __param(0, IService2)
    ], ServiceLoop1);
    let ServiceLoop2 = class ServiceLoop2 {
        constructor(s) {
            this.d = true;
        }
    };
    ServiceLoop2 = __decorate([
        __param(0, IService1)
    ], ServiceLoop2);
    suite('Instantiation Service', () => {
        test('service collection, cannot overwrite', function () {
            const collection = new serviceCollection_1.ServiceCollection();
            let result = collection.set(IService1, null);
            assert.strictEqual(result, undefined);
            result = collection.set(IService1, new Service1());
            assert.strictEqual(result, null);
        });
        test('service collection, add/has', function () {
            const collection = new serviceCollection_1.ServiceCollection();
            collection.set(IService1, null);
            assert.ok(collection.has(IService1));
            collection.set(IService2, null);
            assert.ok(collection.has(IService1));
            assert.ok(collection.has(IService2));
        });
        test('@Param - simple clase', function () {
            const collection = new serviceCollection_1.ServiceCollection();
            const service = new instantiationService_1.InstantiationService(collection);
            collection.set(IService1, new Service1());
            collection.set(IService2, new Service2());
            collection.set(IService3, new Service3());
            service.createInstance(Service1Consumer);
        });
        test('@Param - fixed args', function () {
            const collection = new serviceCollection_1.ServiceCollection();
            const service = new instantiationService_1.InstantiationService(collection);
            collection.set(IService1, new Service1());
            collection.set(IService2, new Service2());
            collection.set(IService3, new Service3());
            service.createInstance(TargetWithStaticParam, true);
        });
        test('service collection is live', function () {
            const collection = new serviceCollection_1.ServiceCollection();
            collection.set(IService1, new Service1());
            const service = new instantiationService_1.InstantiationService(collection);
            service.createInstance(Service1Consumer);
            collection.set(IService2, new Service2());
            service.createInstance(Target2Dep);
            service.invokeFunction(function (a) {
                assert.ok(a.get(IService1));
                assert.ok(a.get(IService2));
            });
        });
        // we made this a warning
        // test('@Param - too many args', function () {
        // 	let service = instantiationService.create(Object.create(null));
        // 	service.addSingleton(IService1, new Service1());
        // 	service.addSingleton(IService2, new Service2());
        // 	service.addSingleton(IService3, new Service3());
        // 	assert.throws(() => service.createInstance(ParameterTarget2, true, 2));
        // });
        // test('@Param - too few args', function () {
        // 	let service = instantiationService.create(Object.create(null));
        // 	service.addSingleton(IService1, new Service1());
        // 	service.addSingleton(IService2, new Service2());
        // 	service.addSingleton(IService3, new Service3());
        // 	assert.throws(() => service.createInstance(ParameterTarget2));
        // });
        test('SyncDesc - no dependencies', function () {
            const collection = new serviceCollection_1.ServiceCollection();
            const service = new instantiationService_1.InstantiationService(collection);
            collection.set(IService1, new descriptors_1.SyncDescriptor(Service1));
            service.invokeFunction(accessor => {
                const service1 = accessor.get(IService1);
                assert.ok(service1);
                assert.strictEqual(service1.c, 1);
                const service2 = accessor.get(IService1);
                assert.ok(service1 === service2);
            });
        });
        test('SyncDesc - service with service dependency', function () {
            const collection = new serviceCollection_1.ServiceCollection();
            const service = new instantiationService_1.InstantiationService(collection);
            collection.set(IService1, new descriptors_1.SyncDescriptor(Service1));
            collection.set(IDependentService, new descriptors_1.SyncDescriptor(DependentService));
            service.invokeFunction(accessor => {
                const d = accessor.get(IDependentService);
                assert.ok(d);
                assert.strictEqual(d.name, 'farboo');
            });
        });
        test('SyncDesc - target depends on service future', function () {
            const collection = new serviceCollection_1.ServiceCollection();
            const service = new instantiationService_1.InstantiationService(collection);
            collection.set(IService1, new descriptors_1.SyncDescriptor(Service1));
            collection.set(IDependentService, new descriptors_1.SyncDescriptor(DependentService));
            const d = service.createInstance(DependentServiceTarget);
            assert.ok(d instanceof DependentServiceTarget);
            const d2 = service.createInstance(DependentServiceTarget2);
            assert.ok(d2 instanceof DependentServiceTarget2);
        });
        test('SyncDesc - explode on loop', function () {
            const collection = new serviceCollection_1.ServiceCollection();
            const service = new instantiationService_1.InstantiationService(collection);
            collection.set(IService1, new descriptors_1.SyncDescriptor(ServiceLoop1));
            collection.set(IService2, new descriptors_1.SyncDescriptor(ServiceLoop2));
            assert.throws(() => {
                service.invokeFunction(accessor => {
                    accessor.get(IService1);
                });
            });
            assert.throws(() => {
                service.invokeFunction(accessor => {
                    accessor.get(IService2);
                });
            });
            try {
                service.invokeFunction(accessor => {
                    accessor.get(IService1);
                });
            }
            catch (err) {
                assert.ok(err.name);
                assert.ok(err.message);
            }
        });
        test('Invoke - get services', function () {
            const collection = new serviceCollection_1.ServiceCollection();
            const service = new instantiationService_1.InstantiationService(collection);
            collection.set(IService1, new Service1());
            collection.set(IService2, new Service2());
            function test(accessor) {
                assert.ok(accessor.get(IService1) instanceof Service1);
                assert.strictEqual(accessor.get(IService1).c, 1);
                return true;
            }
            assert.strictEqual(service.invokeFunction(test), true);
        });
        test('Invoke - get service, optional', function () {
            const collection = new serviceCollection_1.ServiceCollection([IService1, new Service1()]);
            const service = new instantiationService_1.InstantiationService(collection);
            function test(accessor) {
                assert.ok(accessor.get(IService1) instanceof Service1);
                assert.throws(() => accessor.get(IService2));
                return true;
            }
            assert.strictEqual(service.invokeFunction(test), true);
        });
        test('Invoke - keeping accessor NOT allowed', function () {
            const collection = new serviceCollection_1.ServiceCollection();
            const service = new instantiationService_1.InstantiationService(collection);
            collection.set(IService1, new Service1());
            collection.set(IService2, new Service2());
            let cached;
            function test(accessor) {
                assert.ok(accessor.get(IService1) instanceof Service1);
                assert.strictEqual(accessor.get(IService1).c, 1);
                cached = accessor;
                return true;
            }
            assert.strictEqual(service.invokeFunction(test), true);
            assert.throws(() => cached.get(IService2));
        });
        test('Invoke - throw error', function () {
            const collection = new serviceCollection_1.ServiceCollection();
            const service = new instantiationService_1.InstantiationService(collection);
            collection.set(IService1, new Service1());
            collection.set(IService2, new Service2());
            function test(accessor) {
                throw new Error();
            }
            assert.throws(() => service.invokeFunction(test));
        });
        test('Create child', function () {
            let serviceInstanceCount = 0;
            const CtorCounter = class {
                constructor() {
                    this.c = 1;
                    serviceInstanceCount += 1;
                }
            };
            // creating the service instance BEFORE the child service
            let service = new instantiationService_1.InstantiationService(new serviceCollection_1.ServiceCollection([IService1, new descriptors_1.SyncDescriptor(CtorCounter)]));
            service.createInstance(Service1Consumer);
            // second instance must be earlier ONE
            let child = service.createChild(new serviceCollection_1.ServiceCollection([IService2, new Service2()]));
            child.createInstance(Service1Consumer);
            assert.strictEqual(serviceInstanceCount, 1);
            // creating the service instance AFTER the child service
            serviceInstanceCount = 0;
            service = new instantiationService_1.InstantiationService(new serviceCollection_1.ServiceCollection([IService1, new descriptors_1.SyncDescriptor(CtorCounter)]));
            child = service.createChild(new serviceCollection_1.ServiceCollection([IService2, new Service2()]));
            // second instance must be earlier ONE
            service.createInstance(Service1Consumer);
            child.createInstance(Service1Consumer);
            assert.strictEqual(serviceInstanceCount, 1);
        });
        test('Remote window / integration tests is broken #105562', function () {
            const Service1 = (0, instantiation_1.createDecorator)('service1');
            let Service1Impl = class Service1Impl {
                constructor(insta) {
                    const c = insta.invokeFunction(accessor => accessor.get(Service2)); // THIS is the recursive call
                    assert.ok(c);
                }
            };
            Service1Impl = __decorate([
                __param(0, instantiation_1.IInstantiationService)
            ], Service1Impl);
            const Service2 = (0, instantiation_1.createDecorator)('service2');
            class Service2Impl {
                constructor() { }
            }
            // This service depends on Service1 and Service2 BUT creating Service1 creates Service2 (via recursive invocation)
            // and then Servce2 should not be created a second time
            const Service21 = (0, instantiation_1.createDecorator)('service21');
            let Service21Impl = class Service21Impl {
                constructor(service2, service1) {
                    this.service2 = service2;
                    this.service1 = service1;
                }
            };
            Service21Impl = __decorate([
                __param(0, Service2),
                __param(1, Service1)
            ], Service21Impl);
            const insta = new instantiationService_1.InstantiationService(new serviceCollection_1.ServiceCollection([Service1, new descriptors_1.SyncDescriptor(Service1Impl)], [Service2, new descriptors_1.SyncDescriptor(Service2Impl)], [Service21, new descriptors_1.SyncDescriptor(Service21Impl)]));
            const obj = insta.invokeFunction(accessor => accessor.get(Service21));
            assert.ok(obj);
        });
        test('Sync/Async dependency loop', async function () {
            const A = (0, instantiation_1.createDecorator)('A');
            const B = (0, instantiation_1.createDecorator)('B');
            let BConsumer = class BConsumer {
                constructor(b) {
                    this.b = b;
                }
                doIt() {
                    return this.b.b();
                }
            };
            BConsumer = __decorate([
                __param(0, B)
            ], BConsumer);
            let AService = class AService {
                constructor(insta) {
                    this.prop = insta.createInstance(BConsumer);
                }
                doIt() {
                    return this.prop.doIt();
                }
            };
            AService = __decorate([
                __param(0, instantiation_1.IInstantiationService)
            ], AService);
            let BService = class BService {
                constructor(a) {
                    assert.ok(a);
                }
                b() { return true; }
            };
            BService = __decorate([
                __param(0, A)
            ], BService);
            // SYNC -> explodes AImpl -> [insta:BConsumer] -> BImpl -> AImpl
            {
                const insta1 = new instantiationService_1.InstantiationService(new serviceCollection_1.ServiceCollection([A, new descriptors_1.SyncDescriptor(AService)], [B, new descriptors_1.SyncDescriptor(BService)]), true, undefined, true);
                try {
                    insta1.invokeFunction(accessor => accessor.get(A));
                    assert.ok(false);
                }
                catch (error) {
                    assert.ok(error instanceof Error);
                    assert.ok(error.message.includes('RECURSIVELY'));
                }
            }
            // ASYNC -> doesn't explode but cycle is tracked
            {
                const insta2 = new instantiationService_1.InstantiationService(new serviceCollection_1.ServiceCollection([A, new descriptors_1.SyncDescriptor(AService, undefined, true)], [B, new descriptors_1.SyncDescriptor(BService, undefined)]), true, undefined, true);
                const a = insta2.invokeFunction(accessor => accessor.get(A));
                a.doIt();
                const cycle = insta2._globalGraph?.findCycleSlow();
                assert.strictEqual(cycle, 'A -> B -> A');
            }
        });
        test('Delayed and events', function () {
            const A = (0, instantiation_1.createDecorator)('A');
            let created = false;
            class AImpl {
                constructor() {
                    this._doIt = 0;
                    this._onDidDoIt = new event_1.Emitter();
                    this.onDidDoIt = this._onDidDoIt.event;
                    created = true;
                }
                doIt() {
                    this._doIt += 1;
                    this._onDidDoIt.fire(this);
                }
            }
            const insta = new instantiationService_1.InstantiationService(new serviceCollection_1.ServiceCollection([A, new descriptors_1.SyncDescriptor(AImpl, undefined, true)]), true, undefined, true);
            let Consumer = class Consumer {
                constructor(a) {
                    this.a = a;
                    // eager subscribe -> NO service instance
                }
            };
            Consumer = __decorate([
                __param(0, A)
            ], Consumer);
            const c = insta.createInstance(Consumer);
            let eventCount = 0;
            // subscribing to event doesn't trigger instantiation
            const listener = (e) => {
                assert.ok(e instanceof AImpl);
                eventCount++;
            };
            const d1 = c.a.onDidDoIt(listener);
            const d2 = c.a.onDidDoIt(listener);
            assert.strictEqual(created, false);
            assert.strictEqual(eventCount, 0);
            d2.dispose();
            // instantiation happens on first call
            c.a.doIt();
            assert.strictEqual(created, true);
            assert.strictEqual(eventCount, 1);
            const d3 = c.a.onDidDoIt(listener);
            c.a.doIt();
            assert.strictEqual(eventCount, 3);
            (0, lifecycle_1.dispose)([d1, d3]);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdGFudGlhdGlvblNlcnZpY2UudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2luc3RhbnRpYXRpb24vdGVzdC9jb21tb24vaW5zdGFudGlhdGlvblNlcnZpY2UudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7OztJQVVoRyxNQUFNLFNBQVMsR0FBRyxJQUFBLCtCQUFlLEVBQVksVUFBVSxDQUFDLENBQUM7SUFPekQsTUFBTSxRQUFRO1FBQWQ7WUFFQyxNQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztLQUFBO0lBRUQsTUFBTSxTQUFTLEdBQUcsSUFBQSwrQkFBZSxFQUFZLFVBQVUsQ0FBQyxDQUFDO0lBT3pELE1BQU0sUUFBUTtRQUFkO1lBRUMsTUFBQyxHQUFHLElBQUksQ0FBQztRQUNWLENBQUM7S0FBQTtJQUVELE1BQU0sU0FBUyxHQUFHLElBQUEsK0JBQWUsRUFBWSxVQUFVLENBQUMsQ0FBQztJQU96RCxNQUFNLFFBQVE7UUFBZDtZQUVDLE1BQUMsR0FBRyxRQUFRLENBQUM7UUFDZCxDQUFDO0tBQUE7SUFFRCxNQUFNLGlCQUFpQixHQUFHLElBQUEsK0JBQWUsRUFBb0Isa0JBQWtCLENBQUMsQ0FBQztJQU9qRixJQUFNLGdCQUFnQixHQUF0QixNQUFNLGdCQUFnQjtRQUVyQixZQUF1QixPQUFrQjtZQUl6QyxTQUFJLEdBQUcsUUFBUSxDQUFDO1lBSGYsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2xDLENBQUM7S0FHRCxDQUFBO0lBUEssZ0JBQWdCO1FBRVIsV0FBQSxTQUFTLENBQUE7T0FGakIsZ0JBQWdCLENBT3JCO0lBRUQsSUFBTSxnQkFBZ0IsR0FBdEIsTUFBTSxnQkFBZ0I7UUFFckIsWUFBdUIsUUFBbUI7WUFDekMsTUFBTSxDQUFD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