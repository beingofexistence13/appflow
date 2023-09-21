/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/graph", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/base/common/linkedList"], function (require, exports, async_1, errors_1, lifecycle_1, descriptors_1, graph_1, instantiation_1, serviceCollection_1, linkedList_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Trace = exports.InstantiationService = void 0;
    // TRACING
    const _enableAllTracing = false;
    class CyclicDependencyError extends Error {
        constructor(graph) {
            super('cyclic dependency between services');
            this.message = graph.findCycleSlow() ?? `UNABLE to detect cycle, dumping graph: \n${graph.toString()}`;
        }
    }
    class InstantiationService {
        constructor(_services = new serviceCollection_1.ServiceCollection(), _strict = false, _parent, _enableTracing = _enableAllTracing) {
            this._services = _services;
            this._strict = _strict;
            this._parent = _parent;
            this._enableTracing = _enableTracing;
            this._activeInstantiations = new Set();
            this._services.set(instantiation_1.IInstantiationService, this);
            this._globalGraph = _enableTracing ? _parent?._globalGraph ?? new graph_1.Graph(e => e) : undefined;
        }
        createChild(services) {
            return new InstantiationService(services, this._strict, this, this._enableTracing);
        }
        invokeFunction(fn, ...args) {
            const _trace = Trace.traceInvocation(this._enableTracing, fn);
            let _done = false;
            try {
                const accessor = {
                    get: (id) => {
                        if (_done) {
                            throw (0, errors_1.illegalState)('service accessor is only valid during the invocation of its target method');
                        }
                        const result = this._getOrCreateServiceInstance(id, _trace);
                        if (!result) {
                            throw new Error(`[invokeFunction] unknown service '${id}'`);
                        }
                        return result;
                    }
                };
                return fn(accessor, ...args);
            }
            finally {
                _done = true;
                _trace.stop();
            }
        }
        createInstance(ctorOrDescriptor, ...rest) {
            let _trace;
            let result;
            if (ctorOrDescriptor instanceof descriptors_1.SyncDescriptor) {
                _trace = Trace.traceCreation(this._enableTracing, ctorOrDescriptor.ctor);
                result = this._createInstance(ctorOrDescriptor.ctor, ctorOrDescriptor.staticArguments.concat(rest), _trace);
            }
            else {
                _trace = Trace.traceCreation(this._enableTracing, ctorOrDescriptor);
                result = this._createInstance(ctorOrDescriptor, rest, _trace);
            }
            _trace.stop();
            return result;
        }
        _createInstance(ctor, args = [], _trace) {
            // arguments defined by service decorators
            const serviceDependencies = instantiation_1._util.getServiceDependencies(ctor).sort((a, b) => a.index - b.index);
            const serviceArgs = [];
            for (const dependency of serviceDependencies) {
                const service = this._getOrCreateServiceInstance(dependency.id, _trace);
                if (!service) {
                    this._throwIfStrict(`[createInstance] ${ctor.name} depends on UNKNOWN service ${dependency.id}.`, false);
                }
                serviceArgs.push(service);
            }
            const firstServiceArgPos = serviceDependencies.length > 0 ? serviceDependencies[0].index : args.length;
            // check for argument mismatches, adjust static args if needed
            if (args.length !== firstServiceArgPos) {
                console.trace(`[createInstance] First service dependency of ${ctor.name} at position ${firstServiceArgPos + 1} conflicts with ${args.length} static arguments`);
                const delta = firstServiceArgPos - args.length;
                if (delta > 0) {
                    args = args.concat(new Array(delta));
                }
                else {
                    args = args.slice(0, firstServiceArgPos);
                }
            }
            // now create the instance
            return Reflect.construct(ctor, args.concat(serviceArgs));
        }
        _setServiceInstance(id, instance) {
            if (this._services.get(id) instanceof descriptors_1.SyncDescriptor) {
                this._services.set(id, instance);
            }
            else if (this._parent) {
                this._parent._setServiceInstance(id, instance);
            }
            else {
                throw new Error('illegalState - setting UNKNOWN service instance');
            }
        }
        _getServiceInstanceOrDescriptor(id) {
            const instanceOrDesc = this._services.get(id);
            if (!instanceOrDesc && this._parent) {
                return this._parent._getServiceInstanceOrDescriptor(id);
            }
            else {
                return instanceOrDesc;
            }
        }
        _getOrCreateServiceInstance(id, _trace) {
            if (this._globalGraph && this._globalGraphImplicitDependency) {
                this._globalGraph.insertEdge(this._globalGraphImplicitDependency, String(id));
            }
            const thing = this._getServiceInstanceOrDescriptor(id);
            if (thing instanceof descriptors_1.SyncDescriptor) {
                return this._safeCreateAndCacheServiceInstance(id, thing, _trace.branch(id, true));
            }
            else {
                _trace.branch(id, false);
                return thing;
            }
        }
        _safeCreateAndCacheServiceInstance(id, desc, _trace) {
            if (this._activeInstantiations.has(id)) {
                throw new Error(`illegal state - RECURSIVELY instantiating service '${id}'`);
            }
            this._activeInstantiations.add(id);
            try {
                return this._createAndCacheServiceInstance(id, desc, _trace);
            }
            finally {
                this._activeInstantiations.delete(id);
            }
        }
        _createAndCacheServiceInstance(id, desc, _trace) {
            const graph = new graph_1.Graph(data => data.id.toString());
            let cycleCount = 0;
            const stack = [{ id, desc, _trace }];
            while (stack.length) {
                const item = stack.pop();
                graph.lookupOrInsertNode(item);
                // a weak but working heuristic for cycle checks
                if (cycleCount++ > 1000) {
                    throw new CyclicDependencyError(graph);
                }
                // check all dependencies for existence and if they need to be created first
                for (const dependency of instantiation_1._util.getServiceDependencies(item.desc.ctor)) {
                    const instanceOrDesc = this._getServiceInstanceOrDescriptor(dependency.id);
                    if (!instanceOrDesc) {
                        this._throwIfStrict(`[createInstance] ${id} depends on ${dependency.id} which is NOT registered.`, true);
                    }
                    // take note of all service dependencies
                    this._globalGraph?.insertEdge(String(item.id), String(dependency.id));
                    if (instanceOrDesc instanceof descriptors_1.SyncDescriptor) {
                        const d = { id: dependency.id, desc: instanceOrDesc, _trace: item._trace.branch(dependency.id, true) };
                        graph.insertEdge(item, d);
                        stack.push(d);
                    }
                }
            }
            while (true) {
                const roots = graph.roots();
                // if there is no more roots but still
                // nodes in the graph we have a cycle
                if (roots.length === 0) {
                    if (!graph.isEmpty()) {
                        throw new CyclicDependencyError(graph);
                    }
                    break;
                }
                for (const { data } of roots) {
                    // Repeat the check for this still being a service sync descriptor. That's because
                    // instantiating a dependency might have side-effect and recursively trigger instantiation
                    // so that some dependencies are now fullfilled already.
                    const instanceOrDesc = this._getServiceInstanceOrDescriptor(data.id);
                    if (instanceOrDesc instanceof descriptors_1.SyncDescriptor) {
                        // create instance and overwrite the service collections
                        const instance = this._createServiceInstanceWithOwner(data.id, data.desc.ctor, data.desc.staticArguments, data.desc.supportsDelayedInstantiation, data._trace);
                        this._setServiceInstance(data.id, instance);
                    }
                    graph.removeNode(data);
                }
            }
            return this._getServiceInstanceOrDescriptor(id);
        }
        _createServiceInstanceWithOwner(id, ctor, args = [], supportsDelayedInstantiation, _trace) {
            if (this._services.get(id) instanceof descriptors_1.SyncDescriptor) {
                return this._createServiceInstance(id, ctor, args, supportsDelayedInstantiation, _trace);
            }
            else if (this._parent) {
                return this._parent._createServiceInstanceWithOwner(id, ctor, args, supportsDelayedInstantiation, _trace);
            }
            else {
                throw new Error(`illegalState - creating UNKNOWN service instance ${ctor.name}`);
            }
        }
        _createServiceInstance(id, ctor, args = [], supportsDelayedInstantiation, _trace) {
            if (!supportsDelayedInstantiation) {
                // eager instantiation
                return this._createInstance(ctor, args, _trace);
            }
            else {
                const child = new InstantiationService(undefined, this._strict, this, this._enableTracing);
                child._globalGraphImplicitDependency = String(id);
                // Return a proxy object that's backed by an idle value. That
                // strategy is to instantiate services in our idle time or when actually
                // needed but not when injected into a consumer
                // return "empty events" when the service isn't instantiated yet
                const earlyListeners = new Map();
                const idle = new async_1.IdleValue(() => {
                    const result = child._createInstance(ctor, args, _trace);
                    // early listeners that we kept are now being subscribed to
                    // the real service
                    for (const [key, values] of earlyListeners) {
                        const candidate = result[key];
                        if (typeof candidate === 'function') {
                            for (const listener of values) {
                                candidate.apply(result, listener);
                            }
                        }
                    }
                    earlyListeners.clear();
                    return result;
                });
                return new Proxy(Object.create(null), {
                    get(target, key) {
                        if (!idle.isInitialized) {
                            // looks like an event
                            if (typeof key === 'string' && (key.startsWith('onDid') || key.startsWith('onWill'))) {
                                let list = earlyListeners.get(key);
                                if (!list) {
                                    list = new linkedList_1.LinkedList();
                                    earlyListeners.set(key, list);
                                }
                                const event = (callback, thisArg, disposables) => {
                                    const rm = list.push([callback, thisArg, disposables]);
                                    return (0, lifecycle_1.toDisposable)(rm);
                                };
                                return event;
                            }
                        }
                        // value already exists
                        if (key in target) {
                            return target[key];
                        }
                        // create value
                        const obj = idle.value;
                        let prop = obj[key];
                        if (typeof prop !== 'function') {
                            return prop;
                        }
                        prop = prop.bind(obj);
                        target[key] = prop;
                        return prop;
                    },
                    set(_target, p, value) {
                        idle.value[p] = value;
                        return true;
                    },
                    getPrototypeOf(_target) {
                        return ctor.prototype;
                    }
                });
            }
        }
        _throwIfStrict(msg, printWarning) {
            if (printWarning) {
                console.warn(msg);
            }
            if (this._strict) {
                throw new Error(msg);
            }
        }
    }
    exports.InstantiationService = InstantiationService;
    //#region -- tracing ---
    var TraceType;
    (function (TraceType) {
        TraceType[TraceType["None"] = 0] = "None";
        TraceType[TraceType["Creation"] = 1] = "Creation";
        TraceType[TraceType["Invocation"] = 2] = "Invocation";
        TraceType[TraceType["Branch"] = 3] = "Branch";
    })(TraceType || (TraceType = {}));
    class Trace {
        static { this.all = new Set(); }
        static { this._None = new class extends Trace {
            constructor() { super(0 /* TraceType.None */, null); }
            stop() { }
            branch() { return this; }
        }; }
        static traceInvocation(_enableTracing, ctor) {
            return !_enableTracing ? Trace._None : new Trace(2 /* TraceType.Invocation */, ctor.name || new Error().stack.split('\n').slice(3, 4).join('\n'));
        }
        static traceCreation(_enableTracing, ctor) {
            return !_enableTracing ? Trace._None : new Trace(1 /* TraceType.Creation */, ctor.name);
        }
        static { this._totals = 0; }
        constructor(type, name) {
            this.type = type;
            this.name = name;
            this._start = Date.now();
            this._dep = [];
        }
        branch(id, first) {
            const child = new Trace(3 /* TraceType.Branch */, id.toString());
            this._dep.push([id, first, child]);
            return child;
        }
        stop() {
            const dur = Date.now() - this._start;
            Trace._totals += dur;
            let causedCreation = false;
            function printChild(n, trace) {
                const res = [];
                const prefix = new Array(n + 1).join('\t');
                for (const [id, first, child] of trace._dep) {
                    if (first && child) {
                        causedCreation = true;
                        res.push(`${prefix}CREATES -> ${id}`);
                        const nested = printChild(n + 1, child);
                        if (nested) {
                            res.push(nested);
                        }
                    }
                    else {
                        res.push(`${prefix}uses -> ${id}`);
                    }
                }
                return res.join('\n');
            }
            const lines = [
                `${this.type === 1 /* TraceType.Creation */ ? 'CREATE' : 'CALL'} ${this.name}`,
                `${printChild(1, this)}`,
                `DONE, took ${dur.toFixed(2)}ms (grand total ${Trace._totals.toFixed(2)}ms)`
            ];
            if (dur > 2 || causedCreation) {
                Trace.all.add(lines.join('\n'));
            }
        }
    }
    exports.Trace = Trace;
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdGFudGlhdGlvblNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9pbnN0YW50aWF0aW9uL2NvbW1vbi9pbnN0YW50aWF0aW9uU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFZaEcsVUFBVTtJQUNWLE1BQU0saUJBQWlCLEdBQUcsS0FBSyxDQUU3QjtJQUVGLE1BQU0scUJBQXNCLFNBQVEsS0FBSztRQUN4QyxZQUFZLEtBQWlCO1lBQzVCLEtBQUssQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO1lBQzVDLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLGFBQWEsRUFBRSxJQUFJLDRDQUE0QyxLQUFLLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQztRQUN4RyxDQUFDO0tBQ0Q7SUFFRCxNQUFhLG9CQUFvQjtRQU9oQyxZQUNrQixZQUErQixJQUFJLHFDQUFpQixFQUFFLEVBQ3RELFVBQW1CLEtBQUssRUFDeEIsT0FBOEIsRUFDOUIsaUJBQTBCLGlCQUFpQjtZQUgzQyxjQUFTLEdBQVQsU0FBUyxDQUE2QztZQUN0RCxZQUFPLEdBQVAsT0FBTyxDQUFpQjtZQUN4QixZQUFPLEdBQVAsT0FBTyxDQUF1QjtZQUM5QixtQkFBYyxHQUFkLGNBQWMsQ0FBNkI7WUFtSDVDLDBCQUFxQixHQUFHLElBQUksR0FBRyxFQUEwQixDQUFDO1lBaEgxRSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUIsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNoRCxJQUFJLENBQUMsWUFBWSxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLFlBQVksSUFBSSxJQUFJLGFBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDN0YsQ0FBQztRQUVELFdBQVcs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