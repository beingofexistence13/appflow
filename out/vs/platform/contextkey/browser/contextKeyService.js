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
define(["require", "exports", "vs/base/common/event", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/ternarySearchTree", "vs/base/common/uri", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey"], function (require, exports, event_1, iterator_1, lifecycle_1, objects_1, ternarySearchTree_1, uri_1, nls_1, commands_1, configuration_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.setContext = exports.ContextKeyService = exports.AbstractContextKeyService = exports.Context = void 0;
    const KEYBINDING_CONTEXT_ATTR = 'data-keybinding-context';
    class Context {
        constructor(id, parent) {
            this._id = id;
            this._parent = parent;
            this._value = Object.create(null);
            this._value['_contextId'] = id;
        }
        get value() {
            return { ...this._value };
        }
        setValue(key, value) {
            // console.log('SET ' + key + ' = ' + value + ' ON ' + this._id);
            if (this._value[key] !== value) {
                this._value[key] = value;
                return true;
            }
            return false;
        }
        removeValue(key) {
            // console.log('REMOVE ' + key + ' FROM ' + this._id);
            if (key in this._value) {
                delete this._value[key];
                return true;
            }
            return false;
        }
        getValue(key) {
            const ret = this._value[key];
            if (typeof ret === 'undefined' && this._parent) {
                return this._parent.getValue(key);
            }
            return ret;
        }
        updateParent(parent) {
            this._parent = parent;
        }
        collectAllValues() {
            let result = this._parent ? this._parent.collectAllValues() : Object.create(null);
            result = { ...result, ...this._value };
            delete result['_contextId'];
            return result;
        }
    }
    exports.Context = Context;
    class NullContext extends Context {
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
    class ConfigAwareContextValuesContainer extends Context {
        static { this._keyPrefix = 'config.'; }
        constructor(id, _configurationService, emitter) {
            super(id, null);
            this._configurationService = _configurationService;
            this._values = ternarySearchTree_1.TernarySearchTree.forConfigKeys();
            this._listener = this._configurationService.onDidChangeConfiguration(event => {
                if (event.source === 7 /* ConfigurationTarget.DEFAULT */) {
                    // new setting, reset everything
                    const allKeys = Array.from(this._values, ([k]) => k);
                    this._values.clear();
                    emitter.fire(new ArrayContextKeyChangeEvent(allKeys));
                }
                else {
                    const changedKeys = [];
                    for (const configKey of event.affectedKeys) {
                        const contextKey = `config.${configKey}`;
                        const cachedItems = this._values.findSuperstr(contextKey);
                        if (cachedItems !== undefined) {
                            changedKeys.push(...iterator_1.Iterable.map(cachedItems, ([key]) => key));
                            this._values.deleteSuperstr(contextKey);
                        }
                        if (this._values.has(contextKey)) {
                            changedKeys.push(contextKey);
                            this._values.delete(contextKey);
                        }
                    }
                    emitter.fire(new ArrayContextKeyChangeEvent(changedKeys));
                }
            });
        }
        dispose() {
            this._listener.dispose();
        }
        getValue(key) {
            if (key.indexOf(ConfigAwareContextValuesContainer._keyPrefix) !== 0) {
                return super.getValue(key);
            }
            if (this._values.has(key)) {
                return this._values.get(key);
            }
            const configKey = key.substr(ConfigAwareContextValuesContainer._keyPrefix.length);
            const configValue = this._configurationService.getValue(configKey);
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
            this._values.set(key, value);
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
            this._values.forEach((value, index) => result[index] = value);
            return { ...result, ...super.collectAllValues() };
        }
    }
    class ContextKey {
        constructor(service, key, defaultValue) {
            this._service = service;
            this._key = key;
            this._defaultValue = defaultValue;
            this.reset();
        }
        set(value) {
            this._service.setContext(this._key, value);
        }
        reset() {
            if (typeof this._defaultValue === 'undefined') {
                this._service.removeContext(this._key);
            }
            else {
                this._service.setContext(this._key, this._defaultValue);
            }
        }
        get() {
            return this._service.getContextKeyValue(this._key);
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
    class AbstractContextKeyService extends lifecycle_1.Disposable {
        constructor(myContextId) {
            super();
            this._onDidChangeContext = this._register(new event_1.PauseableEmitter({ merge: input => new CompositeContextKeyChangeEvent(input) }));
            this.onDidChangeContext = this._onDidChangeContext.event;
            this._isDisposed = false;
            this._myContextId = myContextId;
        }
        get contextId() {
            return this._myContextId;
        }
        createKey(key, defaultValue) {
            if (this._isDisposed) {
                throw new Error(`AbstractContextKeyService has been disposed`);
            }
            return new ContextKey(this, key, defaultValue);
        }
        bufferChangeEvents(callback) {
            this._onDidChangeContext.pause();
            try {
                callback();
            }
            finally {
                this._onDidChangeContext.resume();
            }
        }
        createScoped(domNode) {
            if (this._isDisposed) {
                throw new Error(`AbstractContextKeyService has been disposed`);
            }
            return new ScopedContextKeyService(this, domNode);
        }
        createOverlay(overlay = iterator_1.Iterable.empty()) {
            if (this._isDisposed) {
                throw new Error(`AbstractContextKeyService has been disposed`);
            }
            return new OverlayContextKeyService(this, overlay);
        }
        contextMatchesRules(rules) {
            if (this._isDisposed) {
                throw new Error(`AbstractContextKeyService has been disposed`);
            }
            const context = this.getContextValuesContainer(this._myContextId);
            const result = (rules ? rules.evaluate(context) : true);
            // console.group(rules.serialize() + ' -> ' + result);
            // rules.keys().forEach(key => { console.log(key, ctx[key]); });
            // console.groupEnd();
            return result;
        }
        getContextKeyValue(key) {
            if (this._isDisposed) {
                return undefined;
            }
            return this.getContextValuesContainer(this._myContextId).getValue(key);
        }
        setContext(key, value) {
            if (this._isDisposed) {
                return;
            }
            const myContext = this.getContextValuesContainer(this._myContextId);
            if (!myContext) {
                return;
            }
            if (myContext.setValue(key, value)) {
                this._onDidChangeContext.fire(new SimpleContextKeyChangeEvent(key));
            }
        }
        removeContext(key) {
            if (this._isDisposed) {
                return;
            }
            if (this.getContextValuesContainer(this._myContextId).removeValue(key)) {
                this._onDidChangeContext.fire(new SimpleContextKeyChangeEvent(key));
            }
        }
        getContext(target) {
            if (this._isDisposed) {
                return NullContext.INSTANCE;
            }
            return this.getContextValuesContainer(findContextAttr(target));
        }
        dispose() {
            super.dispose();
            this._isDisposed = true;
        }
    }
    exports.AbstractContextKeyService = AbstractContextKeyService;
    let ContextKeyService = class ContextKeyService extends AbstractContextKeyService {
        constructor(configurationService) {
            super(0);
            this._contexts = new Map();
            this._lastContextId = 0;
            const myContext = this._register(new ConfigAwareContextValuesContainer(this._myContextId, configurationService, this._onDidChangeContext));
            this._contexts.set(this._myContextId, myContext);
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
            if (this._isDisposed) {
                return NullContext.INSTANCE;
            }
            return this._contexts.get(contextId) || NullContext.INSTANCE;
        }
        createChildContext(parentContextId = this._myContextId) {
            if (this._isDisposed) {
                throw new Error(`ContextKeyService has been disposed`);
            }
            const id = (++this._lastContextId);
            this._contexts.set(id, new Context(id, this.getContextValuesContainer(parentContextId)));
            return id;
        }
        disposeContext(contextId) {
            if (!this._isDisposed) {
                this._contexts.delete(contextId);
            }
        }
        updateParent(_parentContextKeyService) {
            throw new Error('Cannot update parent of root ContextKeyService');
        }
    };
    exports.ContextKeyService = ContextKeyService;
    exports.ContextKeyService = ContextKeyService = __decorate([
        __param(0, configuration_1.IConfigurationService)
    ], ContextKeyService);
    class ScopedContextKeyService extends AbstractContextKeyService {
        constructor(parent, domNode) {
            super(parent.createChildContext());
            this._parentChangeListener = this._register(new lifecycle_1.MutableDisposable());
            this._parent = parent;
            this._updateParentChangeListener();
            this._domNode = domNode;
            if (this._domNode.hasAttribute(KEYBINDING_CONTEXT_ATTR)) {
                let extraInfo = '';
                if (this._domNode.classList) {
                    extraInfo = Array.from(this._domNode.classList.values()).join(', ');
                }
                console.error(`Element already has context attribute${extraInfo ? ': ' + extraInfo : ''}`);
            }
            this._domNode.setAttribute(KEYBINDING_CONTEXT_ATTR, String(this._myContextId));
        }
        _updateParentChangeListener() {
            // Forward parent events to this listener. Parent will change.
            this._parentChangeListener.value = this._parent.onDidChangeContext(e => {
                const thisContainer = this._parent.getContextValuesContainer(this._myContextId);
                const thisContextValues = thisContainer.value;
                if (!allEventKeysInContext(e, thisContextValues)) {
                    this._onDidChangeContext.fire(e);
                }
            });
        }
        dispose() {
            if (this._isDisposed) {
                return;
            }
            this._parent.disposeContext(this._myContextId);
            this._domNode.removeAttribute(KEYBINDING_CONTEXT_ATTR);
            super.dispose();
        }
        getContextValuesContainer(contextId) {
            if (this._isDisposed) {
                return NullContext.INSTANCE;
            }
            return this._parent.getContextValuesContainer(contextId);
        }
        createChildContext(parentContextId = this._myContextId) {
            if (this._isDisposed) {
                throw new Error(`ScopedContextKeyService has been disposed`);
            }
            return this._parent.createChildContext(parentContextId);
        }
        disposeContext(contextId) {
            if (this._isDisposed) {
                return;
            }
            this._parent.disposeContext(contextId);
        }
        updateParent(parentContextKeyService) {
            if (this._parent === parentContextKeyService) {
                return;
            }
            const thisContainer = this._parent.getContextValuesContainer(this._myContextId);
            const oldAllValues = thisContainer.collectAllValues();
            this._parent = parentContextKeyService;
            this._updateParentChangeListener();
            const newParentContainer = this._parent.getContextValuesContainer(this._parent.contextId);
            thisContainer.updateParent(newParentContainer);
            const newAllValues = thisContainer.collectAllValues();
            const allValuesDiff = {
                ...(0, objects_1.distinct)(oldAllValues, newAllValues),
                ...(0, objects_1.distinct)(newAllValues, oldAllValues)
            };
            const changedKeys = Object.keys(allValuesDiff);
            this._onDidChangeContext.fire(new ArrayContextKeyChangeEvent(changedKeys));
        }
    }
    class OverlayContext {
        constructor(parent, overlay) {
            this.parent = parent;
            this.overlay = overlay;
        }
        getValue(key) {
            return this.overlay.has(key) ? this.overlay.get(key) : this.parent.getValue(key);
        }
    }
    class OverlayContextKeyService {
        get contextId() {
            return this.parent.contextId;
        }
        get onDidChangeContext() {
            return this.parent.onDidChangeContext;
        }
        constructor(parent, overlay) {
            this.parent = parent;
            this.overlay = new Map(overlay);
        }
        bufferChangeEvents(callback) {
            this.parent.bufferChangeEvents(callback);
        }
        createKey() {
            throw new Error('Not supported.');
        }
        getContext(target) {
            return new OverlayContext(this.parent.getContext(target), this.overlay);
        }
        getContextValuesContainer(contextId) {
            const parentContext = this.parent.getContextValuesContainer(contextId);
            return new OverlayContext(parentContext, this.overlay);
        }
        contextMatchesRules(rules) {
            const context = this.getContextValuesContainer(this.contextId);
            const result = (rules ? rules.evaluate(context) : true);
            return result;
        }
        getContextKeyValue(key) {
            return this.overlay.has(key) ? this.overlay.get(key) : this.parent.getContextKeyValue(key);
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
    function setContext(accessor, contextKey, contextValue) {
        const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
        contextKeyService.createKey(String(contextKey), stringifyURIs(contextValue));
    }
    exports.setContext = setContext;
    function stringifyURIs(contextValue) {
        return (0, objects_1.cloneAndChange)(contextValue, (obj) => {
            if (typeof obj === 'object' && obj.$mid === 1 /* MarshalledId.Uri */) {
                return uri_1.URI.revive(obj).toString();
            }
            if (obj instanceof uri_1.URI) {
                return obj.toString();
            }
            return undefined;
        });
    }
    commands_1.CommandsRegistry.registerCommand('_setContext', setContext);
    commands_1.CommandsRegistry.registerCommand({
        id: 'getContextKeyInfo',
        handler() {
            return [...contextkey_1.RawContextKey.all()].sort((a, b) => a.key.localeCompare(b.key));
        },
        description: {
            description: (0, nls_1.localize)('getContextKeyInfo', "A command that returns information about context keys"),
            args: []
        }
    });
    commands_1.CommandsRegistry.registerCommand('_generateContextKeyInfo', function () {
        const result = [];
        const seen = new Set();
        for (const info of contextkey_1.RawContextKey.all()) {
            if (!seen.has(info.key)) {
                seen.add(info.key);
                result.push(info);
            }
        }
        result.sort((a, b) => a.key.localeCompare(b.key));
        console.log(JSON.stringify(result, undefined, 2));
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dEtleVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9jb250ZXh0a2V5L2Jyb3dzZXIvY29udGV4dEtleVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBZ0JoRyxNQUFNLHVCQUF1QixHQUFHLHlCQUF5QixDQUFDO0lBRTFELE1BQWEsT0FBTztRQU1uQixZQUFZLEVBQVUsRUFBRSxNQUFzQjtZQUM3QyxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztZQUNkLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsQyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNoQyxDQUFDO1FBRUQsSUFBVyxLQUFLO1lBQ2YsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFFTSxRQUFRLENBQUMsR0FBVyxFQUFFLEtBQVU7WUFDdEMsaUVBQWlFO1lBQ2pFLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxLQUFLLEVBQUU7Z0JBQy9CLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO2dCQUN6QixPQUFPLElBQUksQ0FBQzthQUNaO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRU0sV0FBVyxDQUFDLEdBQVc7WUFDN0Isc0RBQXNEO1lBQ3RELElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ3ZCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDeEIsT0FBTyxJQUFJLENBQUM7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