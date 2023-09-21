/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/graph", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/base/common/linkedList"], function (require, exports, async_1, errors_1, lifecycle_1, descriptors_1, graph_1, instantiation_1, serviceCollection_1, linkedList_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$7p = exports.$6p = void 0;
    // TRACING
    const _enableAllTracing = false;
    class CyclicDependencyError extends Error {
        constructor(graph) {
            super('cyclic dependency between services');
            this.message = graph.findCycleSlow() ?? `UNABLE to detect cycle, dumping graph: \n${graph.toString()}`;
        }
    }
    class $6p {
        constructor(f = new serviceCollection_1.$zh(), g = false, h, i = _enableAllTracing) {
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.o = new Set();
            this.f.set(instantiation_1.$Ah, this);
            this._globalGraph = i ? h?._globalGraph ?? new graph_1.$5p(e => e) : undefined;
        }
        createChild(services) {
            return new $6p(services, this.g, this, this.i);
        }
        invokeFunction(fn, ...args) {
            const _trace = $7p.traceInvocation(this.i, fn);
            let _done = false;
            try {
                const accessor = {
                    get: (id) => {
                        if (_done) {
                            throw (0, errors_1.$6)('service accessor is only valid during the invocation of its target method');
                        }
                        const result = this.m(id, _trace);
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
            if (ctorOrDescriptor instanceof descriptors_1.$yh) {
                _trace = $7p.traceCreation(this.i, ctorOrDescriptor.ctor);
                result = this.j(ctorOrDescriptor.ctor, ctorOrDescriptor.staticArguments.concat(rest), _trace);
            }
            else {
                _trace = $7p.traceCreation(this.i, ctorOrDescriptor);
                result = this.j(ctorOrDescriptor, rest, _trace);
            }
            _trace.stop();
            return result;
        }
        j(ctor, args = [], _trace) {
            // arguments defined by service decorators
            const serviceDependencies = instantiation_1._util.getServiceDependencies(ctor).sort((a, b) => a.index - b.index);
            const serviceArgs = [];
            for (const dependency of serviceDependencies) {
                const service = this.m(dependency.id, _trace);
                if (!service) {
                    this.u(`[createInstance] ${ctor.name} depends on UNKNOWN service ${dependency.id}.`, false);
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
        k(id, instance) {
            if (this.f.get(id) instanceof descriptors_1.$yh) {
                this.f.set(id, instance);
            }
            else if (this.h) {
                this.h.k(id, instance);
            }
            else {
                throw new Error('illegalState - setting UNKNOWN service instance');
            }
        }
        l(id) {
            const instanceOrDesc = this.f.get(id);
            if (!instanceOrDesc && this.h) {
                return this.h.l(id);
            }
            else {
                return instanceOrDesc;
            }
        }
        m(id, _trace) {
            if (this._globalGraph && this.c) {
                this._globalGraph.insertEdge(this.c, String(id));
            }
            const thing = this.l(id);
            if (thing instanceof descriptors_1.$yh) {
                return this.q(id, thing, _trace.branch(id, true));
            }
            else {
                _trace.branch(id, false);
                return thing;
            }
        }
        q(id, desc, _trace) {
            if (this.o.has(id)) {
                throw new Error(`illegal state - RECURSIVELY instantiating service '${id}'`);
            }
            this.o.add(id);
            try {
                return this.r(id, desc, _trace);
            }
            finally {
                this.o.delete(id);
            }
        }
        r(id, desc, _trace) {
            const graph = new graph_1.$5p(data => data.id.toString());
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
                    const instanceOrDesc = this.l(dependency.id);
                    if (!instanceOrDesc) {
                        this.u(`[createInstance] ${id} depends on ${dependency.id} which is NOT registered.`, true);
                    }
                    // take note of all service dependencies
                    this._globalGraph?.insertEdge(String(item.id), String(dependency.id));
                    if (instanceOrDesc instanceof descriptors_1.$yh) {
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
                    const instanceOrDesc = this.l(data.id);
                    if (instanceOrDesc instanceof descriptors_1.$yh) {
                        // create instance and overwrite the service collections
                        const instance = this.s(data.id, data.desc.ctor, data.desc.staticArguments, data.desc.supportsDelayedInstantiation, data._trace);
                        this.k(data.id, instance);
                    }
                    graph.removeNode(data);
                }
            }
            return this.l(id);
        }
        s(id, ctor, args = [], supportsDelayedInstantiation, _trace) {
            if (this.f.get(id) instanceof descriptors_1.$yh) {
                return this.t(id, ctor, args, supportsDelayedInstantiation, _trace);
            }
            else if (this.h) {
                return this.h.s(id, ctor, args, supportsDelayedInstantiation, _trace);
            }
            else {
                throw new Error(`illegalState - creating UNKNOWN service instance ${ctor.name}`);
            }
        }
        t(id, ctor, args = [], supportsDelayedInstantiation, _trace) {
            if (!supportsDelayedInstantiation) {
                // eager instantiation
                return this.j(ctor, args, _trace);
            }
            else {
                const child = new $6p(undefined, this.g, this, this.i);
                child.c = String(id);
                // Return a proxy object that's backed by an idle value. That
                // strategy is to instantiate services in our idle time or when actually
                // needed but not when injected into a consumer
                // return "empty events" when the service isn't instantiated yet
                const earlyListeners = new Map();
                const idle = new async_1.$Xg(() => {
                    const result = child.j(ctor, args, _trace);
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
                                    list = new linkedList_1.$tc();
                                    earlyListeners.set(key, list);
                                }
                                const event = (callback, thisArg, disposables) => {
                                    const rm = list.push([callback, thisArg, disposables]);
                                    return (0, lifecycle_1.$ic)(rm);
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
        u(msg, printWarning) {
            if (printWarning) {
                console.warn(msg);
            }
            if (this.g) {
                throw new Error(msg);
            }
        }
    }
    exports.$6p = $6p;
    //#region -- tracing ---
    var TraceType;
    (function (TraceType) {
        TraceType[TraceType["None"] = 0] = "None";
        TraceType[TraceType["Creation"] = 1] = "Creation";
        TraceType[TraceType["Invocation"] = 2] = "Invocation";
        TraceType[TraceType["Branch"] = 3] = "Branch";
    })(TraceType || (TraceType = {}));
    class $7p {
        static { this.all = new Set(); }
        static { this.c = new class extends $7p {
            constructor() { super(0 /* TraceType.None */, null); }
            stop() { }
            branch() { return this; }
        }; }
        static traceInvocation(_enableTracing, ctor) {
            return !_enableTracing ? $7p.c : new $7p(2 /* TraceType.Invocation */, ctor.name || new Error().stack.split('\n').slice(3, 4).join('\n'));
        }
        static traceCreation(_enableTracing, ctor) {
            return !_enableTracing ? $7p.c : new $7p(1 /* TraceType.Creation */, ctor.name);
        }
        static { this.f = 0; }
        constructor(type, name) {
            this.type = type;
            this.name = name;
            this.g = Date.now();
            this.h = [];
        }
        branch(id, first) {
            const child = new $7p(3 /* TraceType.Branch */, id.toString());
            this.h.push([id, first, child]);
            return child;
        }
        stop() {
            const dur = Date.now() - this.g;
            $7p.f += dur;
            let causedCreation = false;
            function printChild(n, trace) {
                const res = [];
                const prefix = new Array(n + 1).join('\t');
                for (const [id, first, child] of trace.h) {
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
                `DONE, took ${dur.toFixed(2)}ms (grand total ${$7p.f.toFixed(2)}ms)`
            ];
            if (dur > 2 || causedCreation) {
                $7p.all.add(lines.join('\n'));
            }
        }
    }
    exports.$7p = $7p;
});
//#endregion
//# sourceMappingURL=instantiationService.js.map