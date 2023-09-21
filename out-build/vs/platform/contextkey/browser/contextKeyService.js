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
define(["require", "exports", "vs/base/common/event", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/ternarySearchTree", "vs/base/common/uri", "vs/nls!vs/platform/contextkey/browser/contextKeyService", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey"], function (require, exports, event_1, iterator_1, lifecycle_1, objects_1, ternarySearchTree_1, uri_1, nls_1, commands_1, configuration_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ytb = exports.$xtb = exports.$wtb = exports.$vtb = void 0;
    const KEYBINDING_CONTEXT_ATTR = 'data-keybinding-context';
    class $vtb {
        constructor(id, parent) {
            this.f = id;
            this.c = parent;
            this.d = Object.create(null);
            this.d['_contextId'] = id;
        }
        get value() {
            return { ...this.d };
        }
        setValue(key, value) {
            // console.log('SET ' + key + ' = ' + value + ' ON ' + this._id);
            if (this.d[key] !== value) {
                this.d[key] = value;
                return true;
            }
            return false;
        }
        removeValue(key) {
            // console.log('REMOVE ' + key + ' FROM ' + this._id);
            if (key in this.d) {
                delete this.d[key];
                return true;
            }
            return false;
        }
        getValue(key) {
            const ret = this.d[key];
            if (typeof ret === 'undefined' && this.c) {
                return this.c.getValue(key);
            }
            return ret;
        }
        updateParent(parent) {
            this.c = parent;
        }
        collectAllValues() {
            let result = this.c ? this.c.collectAllValues() : Object.create(null);
            result = { ...result, ...this.d };
            delete result['_contextId'];
            return result;
        }
    }
    exports.$vtb = $vtb;
    class NullContext extends $vtb {
        static { this.INSTANCE = new NullContext(); }
        constructor() {
            super(-1, null);
        }
        setValue(key, value) {
            return false;
        }
        removeValue(key) {
            return false;
        }
        getValue(key) {
            return undefined;
        }
        collectAllValues() {
            return Object.create(null);
        }
    }
    class ConfigAwareContextValuesContainer extends $vtb {
        static { this.g = 'config.'; }
        constructor(id, j, emitter) {
            super(id, null);
            this.j = j;
            this.h = ternarySearchTree_1.$Hh.forConfigKeys();
            this.i = this.j.onDidChangeConfiguration(event => {
                if (event.source === 7 /* ConfigurationTarget.DEFAULT */) {
                    // new setting, reset everything
                    const allKeys = Array.from(this.h, ([k]) => k);
                    this.h.clear();
                    emitter.fire(new ArrayContextKeyChangeEvent(allKeys));
                }
                else {
                    const changedKeys = [];
                    for (const configKey of event.affectedKeys) {
                        const contextKey = `config.${configKey}`;
                        const cachedItems = this.h.findSuperstr(contextKey);
                        if (cachedItems !== undefined) {
                            changedKeys.push(...iterator_1.Iterable.map(cachedItems, ([key]) => key));
                            this.h.deleteSuperstr(contextKey);
                        }
                        if (this.h.has(contextKey)) {
                            changedKeys.push(contextKey);
                            this.h.delete(contextKey);
                        }
                    }
                    emitter.fire(new ArrayContextKeyChangeEvent(changedKeys));
                }
            });
        }
        dispose() {
            this.i.dispose();
        }
        getValue(key) {
            if (key.indexOf(ConfigAwareContextValuesContainer.g) !== 0) {
                return super.getValue(key);
            }
            if (this.h.has(key)) {
                return this.h.get(key);
            }
            const configKey = key.substr(ConfigAwareContextValuesContainer.g.length);
            const configValue = this.j.getValue(configKey);
            let value = undefined;
            switch (typeof configValue) {
                case 'number':
                case 'boolean':
                case 'string':
                    value = configValue;
                    break;
                default:
                    if (Array.isArray(configValue)) {
                        value = JSON.stringify(configValue);
                    }
                    else {
                        value = configValue;
                    }
            }
            this.h.set(key, value);
            return value;
        }
        setValue(key, value) {
            return super.setValue(key, value);
        }
        removeValue(key) {
            return super.removeValue(key);
        }
        collectAllValues() {
            const result = Object.create(null);
            this.h.forEach((value, index) => result[index] = value);
            return { ...result, ...super.collectAllValues() };
        }
    }
    class ContextKey {
        constructor(service, key, defaultValue) {
            this.c = service;
            this.d = key;
            this.f = defaultValue;
            this.reset();
        }
        set(value) {
            this.c.setContext(this.d, value);
        }
        reset() {
            if (typeof this.f === 'undefined') {
                this.c.removeContext(this.d);
            }
            else {
                this.c.setContext(this.d, this.f);
            }
        }
        get() {
            return this.c.getContextKeyValue(this.d);
        }
    }
    class SimpleContextKeyChangeEvent {
        constructor(key) {
            this.key = key;
        }
        affectsSome(keys) {
            return keys.has(this.key);
        }
        allKeysContainedIn(keys) {
            return this.affectsSome(keys);
        }
    }
    class ArrayContextKeyChangeEvent {
        constructor(keys) {
            this.keys = keys;
        }
        affectsSome(keys) {
            for (const key of this.keys) {
                if (keys.has(key)) {
                    return true;
                }
            }
            return false;
        }
        allKeysContainedIn(keys) {
            return this.keys.every(key => keys.has(key));
        }
    }
    class CompositeContextKeyChangeEvent {
        constructor(events) {
            this.events = events;
        }
        affectsSome(keys) {
            for (const e of this.events) {
                if (e.affectsSome(keys)) {
                    return true;
                }
            }
            return false;
        }
        allKeysContainedIn(keys) {
            return this.events.every(evt => evt.allKeysContainedIn(keys));
        }
    }
    function allEventKeysInContext(event, context) {
        return event.allKeysContainedIn(new Set(Object.keys(context)));
    }
    class $wtb extends lifecycle_1.$kc {
        constructor(myContextId) {
            super();
            this.g = this.B(new event_1.$id({ merge: input => new CompositeContextKeyChangeEvent(input) }));
            this.onDidChangeContext = this.g.event;
            this.c = false;
            this.f = myContextId;
        }
        get contextId() {
            return this.f;
        }
        createKey(key, defaultValue) {
            if (this.c) {
                throw new Error(`AbstractContextKeyService has been disposed`);
            }
            return new ContextKey(this, key, defaultValue);
        }
        bufferChangeEvents(callback) {
            this.g.pause();
            try {
                callback();
            }
            finally {
                this.g.resume();
            }
        }
        createScoped(domNode) {
            if (this.c) {
                throw new Error(`AbstractContextKeyService has been disposed`);
            }
            return new ScopedContextKeyService(this, domNode);
        }
        createOverlay(overlay = iterator_1.Iterable.empty()) {
            if (this.c) {
                throw new Error(`AbstractContextKeyService has been disposed`);
            }
            return new OverlayContextKeyService(this, overlay);
        }
        contextMatchesRules(rules) {
            if (this.c) {
                throw new Error(`AbstractContextKeyService has been disposed`);
            }
            const context = this.getContextValuesContainer(this.f);
            const result = (rules ? rules.evaluate(context) : true);
            // console.group(rules.serialize() + ' -> ' + result);
            // rules.keys().forEach(key => { console.log(key, ctx[key]); });
            // console.groupEnd();
            return result;
        }
        getContextKeyValue(key) {
            if (this.c) {
                return undefined;
            }
            return this.getContextValuesContainer(this.f).getValue(key);
        }
        setContext(key, value) {
            if (this.c) {
                return;
            }
            const myContext = this.getContextValuesContainer(this.f);
            if (!myContext) {
                return;
            }
            if (myContext.setValue(key, value)) {
                this.g.fire(new SimpleContextKeyChangeEvent(key));
            }
        }
        removeContext(key) {
            if (this.c) {
                return;
            }
            if (this.getContextValuesContainer(this.f).removeValue(key)) {
                this.g.fire(new SimpleContextKeyChangeEvent(key));
            }
        }
        getContext(target) {
            if (this.c) {
                return NullContext.INSTANCE;
            }
            return this.getContextValuesContainer(findContextAttr(target));
        }
        dispose() {
            super.dispose();
            this.c = true;
        }
    }
    exports.$wtb = $wtb;
    let $xtb = class $xtb extends $wtb {
        constructor(configurationService) {
            super(0);
            this.j = new Map();
            this.h = 0;
            const myContext = this.B(new ConfigAwareContextValuesContainer(this.f, configurationService, this.g));
            this.j.set(this.f, myContext);
            // Uncomment this to see the contexts continuously logged
            // let lastLoggedValue: string | null = null;
            // setInterval(() => {
            // 	let values = Object.keys(this._contexts).map((key) => this._contexts[key]);
            // 	let logValue = values.map(v => JSON.stringify(v._value, null, '\t')).join('\n');
            // 	if (lastLoggedValue !== logValue) {
            // 		lastLoggedValue = logValue;
            // 		console.log(lastLoggedValue);
            // 	}
            // }, 2000);
        }
        getContextValuesContainer(contextId) {
            if (this.c) {
                return NullContext.INSTANCE;
            }
            return this.j.get(contextId) || NullContext.INSTANCE;
        }
        createChildContext(parentContextId = this.f) {
            if (this.c) {
                throw new Error(`ContextKeyService has been disposed`);
            }
            const id = (++this.h);
            this.j.set(id, new $vtb(id, this.getContextValuesContainer(parentContextId)));
            return id;
        }
        disposeContext(contextId) {
            if (!this.c) {
                this.j.delete(contextId);
            }
        }
        updateParent(_parentContextKeyService) {
            throw new Error('Cannot update parent of root ContextKeyService');
        }
    };
    exports.$xtb = $xtb;
    exports.$xtb = $xtb = __decorate([
        __param(0, configuration_1.$8h)
    ], $xtb);
    class ScopedContextKeyService extends $wtb {
        constructor(parent, domNode) {
            super(parent.createChildContext());
            this.m = this.B(new lifecycle_1.$lc());
            this.h = parent;
            this.n();
            this.j = domNode;
            if (this.j.hasAttribute(KEYBINDING_CONTEXT_ATTR)) {
                let extraInfo = '';
                if (this.j.classList) {
                    extraInfo = Array.from(this.j.classList.values()).join(', ');
                }
                console.error(`Element already has context attribute${extraInfo ? ': ' + extraInfo : ''}`);
            }
            this.j.setAttribute(KEYBINDING_CONTEXT_ATTR, String(this.f));
        }
        n() {
            // Forward parent events to this listener. Parent will change.
            this.m.value = this.h.onDidChangeContext(e => {
                const thisContainer = this.h.getContextValuesContainer(this.f);
                const thisContextValues = thisContainer.value;
                if (!allEventKeysInContext(e, thisContextValues)) {
                    this.g.fire(e);
                }
            });
        }
        dispose() {
            if (this.c) {
                return;
            }
            this.h.disposeContext(this.f);
            this.j.removeAttribute(KEYBINDING_CONTEXT_ATTR);
            super.dispose();
        }
        getContextValuesContainer(contextId) {
            if (this.c) {
                return NullContext.INSTANCE;
            }
            return this.h.getContextValuesContainer(contextId);
        }
        createChildContext(parentContextId = this.f) {
            if (this.c) {
                throw new Error(`ScopedContextKeyService has been disposed`);
            }
            return this.h.createChildContext(parentContextId);
        }
        disposeContext(contextId) {
            if (this.c) {
                return;
            }
            this.h.disposeContext(contextId);
        }
        updateParent(parentContextKeyService) {
            if (this.h === parentContextKeyService) {
                return;
            }
            const thisContainer = this.h.getContextValuesContainer(this.f);
            const oldAllValues = thisContainer.collectAllValues();
            this.h = parentContextKeyService;
            this.n();
            const newParentContainer = this.h.getContextValuesContainer(this.h.contextId);
            thisContainer.updateParent(newParentContainer);
            const newAllValues = thisContainer.collectAllValues();
            const allValuesDiff = {
                ...(0, objects_1.$2m)(oldAllValues, newAllValues),
                ...(0, objects_1.$2m)(newAllValues, oldAllValues)
            };
            const changedKeys = Object.keys(allValuesDiff);
            this.g.fire(new ArrayContextKeyChangeEvent(changedKeys));
        }
    }
    class OverlayContext {
        constructor(c, d) {
            this.c = c;
            this.d = d;
        }
        getValue(key) {
            return this.d.has(key) ? this.d.get(key) : this.c.getValue(key);
        }
    }
    class OverlayContextKeyService {
        get contextId() {
            return this.d.contextId;
        }
        get onDidChangeContext() {
            return this.d.onDidChangeContext;
        }
        constructor(d, overlay) {
            this.d = d;
            this.c = new Map(overlay);
        }
        bufferChangeEvents(callback) {
            this.d.bufferChangeEvents(callback);
        }
        createKey() {
            throw new Error('Not supported.');
        }
        getContext(target) {
            return new OverlayContext(this.d.getContext(target), this.c);
        }
        getContextValuesContainer(contextId) {
            const parentContext = this.d.getContextValuesContainer(contextId);
            return new OverlayContext(parentContext, this.c);
        }
        contextMatchesRules(rules) {
            const context = this.getContextValuesContainer(this.contextId);
            const result = (rules ? rules.evaluate(context) : true);
            return result;
        }
        getContextKeyValue(key) {
            return this.c.has(key) ? this.c.get(key) : this.d.getContextKeyValue(key);
        }
        createScoped() {
            throw new Error('Not supported.');
        }
        createOverlay(overlay = iterator_1.Iterable.empty()) {
            return new OverlayContextKeyService(this, overlay);
        }
        updateParent() {
            throw new Error('Not supported.');
        }
    }
    function findContextAttr(domNode) {
        while (domNode) {
            if (domNode.hasAttribute(KEYBINDING_CONTEXT_ATTR)) {
                const attr = domNode.getAttribute(KEYBINDING_CONTEXT_ATTR);
                if (attr) {
                    return parseInt(attr, 10);
                }
                return NaN;
            }
            domNode = domNode.parentElement;
        }
        return 0;
    }
    function $ytb(accessor, contextKey, contextValue) {
        const contextKeyService = accessor.get(contextkey_1.$3i);
        contextKeyService.createKey(String(contextKey), stringifyURIs(contextValue));
    }
    exports.$ytb = $ytb;
    function stringifyURIs(contextValue) {
        return (0, objects_1.$Xm)(contextValue, (obj) => {
            if (typeof obj === 'object' && obj.$mid === 1 /* MarshalledId.Uri */) {
                return uri_1.URI.revive(obj).toString();
            }
            if (obj instanceof uri_1.URI) {
                return obj.toString();
            }
            return undefined;
        });
    }
    commands_1.$Gr.registerCommand('_setContext', $ytb);
    commands_1.$Gr.registerCommand({
        id: 'getContextKeyInfo',
        handler() {
            return [...contextkey_1.$2i.all()].sort((a, b) => a.key.localeCompare(b.key));
        },
        description: {
            description: (0, nls_1.localize)(0, null),
            args: []
        }
    });
    commands_1.$Gr.registerCommand('_generateContextKeyInfo', function () {
        const result = [];
        const seen = new Set();
        for (const info of contextkey_1.$2i.all()) {
            if (!seen.has(info.key)) {
                seen.add(info.key);
                result.push(info);
            }
        }
        result.sort((a, b) => a.key.localeCompare(b.key));
        console.log(JSON.stringify(result, undefined, 2));
    });
});
//# sourceMappingURL=contextKeyService.js.map