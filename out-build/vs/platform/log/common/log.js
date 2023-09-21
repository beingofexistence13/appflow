/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errorMessage", "vs/base/common/event", "vs/base/common/hash", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/types", "vs/base/common/uri", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation"], function (require, exports, errorMessage_1, event_1, hash_1, lifecycle_1, map_1, platform_1, resources_1, types_1, uri_1, contextkey_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$jj = exports.$ij = exports.$hj = exports.$gj = exports.$fj = exports.$ej = exports.$dj = exports.$cj = exports.$bj = exports.$aj = exports.$_i = exports.$$i = exports.$0i = exports.log = exports.$8i = exports.LogLevel = exports.$7i = exports.$6i = exports.$5i = void 0;
    exports.$5i = (0, instantiation_1.$Bh)('logService');
    exports.$6i = (0, instantiation_1.$Bh)('loggerService');
    function now() {
        return new Date().toISOString();
    }
    function $7i(thing) {
        return (0, types_1.$nf)(thing);
    }
    exports.$7i = $7i;
    var LogLevel;
    (function (LogLevel) {
        LogLevel[LogLevel["Off"] = 0] = "Off";
        LogLevel[LogLevel["Trace"] = 1] = "Trace";
        LogLevel[LogLevel["Debug"] = 2] = "Debug";
        LogLevel[LogLevel["Info"] = 3] = "Info";
        LogLevel[LogLevel["Warning"] = 4] = "Warning";
        LogLevel[LogLevel["Error"] = 5] = "Error";
    })(LogLevel || (exports.LogLevel = LogLevel = {}));
    exports.$8i = LogLevel.Info;
    function log(logger, level, message) {
        switch (level) {
            case LogLevel.Trace:
                logger.trace(message);
                break;
            case LogLevel.Debug:
                logger.debug(message);
                break;
            case LogLevel.Info:
                logger.info(message);
                break;
            case LogLevel.Warning:
                logger.warn(message);
                break;
            case LogLevel.Error:
                logger.error(message);
                break;
            case LogLevel.Off: /* do nothing */ break;
            default: throw new Error(`Invalid log level ${level}`);
        }
    }
    exports.log = log;
    function format(args, verbose = false) {
        let result = '';
        for (let i = 0; i < args.length; i++) {
            let a = args[i];
            if (a instanceof Error) {
                a = (0, errorMessage_1.$mi)(a, verbose);
            }
            if (typeof a === 'object') {
                try {
                    a = JSON.stringify(a);
                }
                catch (e) { }
            }
            result += (i > 0 ? ' ' : '') + a;
        }
        return result;
    }
    class $0i extends lifecycle_1.$kc {
        constructor() {
            super(...arguments);
            this.b = exports.$8i;
            this.c = this.B(new event_1.$fd());
            this.onDidChangeLogLevel = this.c.event;
        }
        setLevel(level) {
            if (this.b !== level) {
                this.b = level;
                this.c.fire(this.b);
            }
        }
        getLevel() {
            return this.b;
        }
        f(level) {
            return this.b !== LogLevel.Off && this.b <= level;
        }
    }
    exports.$0i = $0i;
    class $$i extends $0i {
        constructor(h) {
            super();
            this.h = h;
        }
        f(level) {
            return this.h || super.f(level);
        }
        trace(message, ...args) {
            if (this.f(LogLevel.Trace)) {
                this.g(LogLevel.Trace, format([message, ...args], true));
            }
        }
        debug(message, ...args) {
            if (this.f(LogLevel.Debug)) {
                this.g(LogLevel.Debug, format([message, ...args]));
            }
        }
        info(message, ...args) {
            if (this.f(LogLevel.Info)) {
                this.g(LogLevel.Info, format([message, ...args]));
            }
        }
        warn(message, ...args) {
            if (this.f(LogLevel.Warning)) {
                this.g(LogLevel.Warning, format([message, ...args]));
            }
        }
        error(message, ...args) {
            if (this.f(LogLevel.Error)) {
                if (message instanceof Error) {
                    const array = Array.prototype.slice.call(arguments);
                    array[0] = message.stack;
                    this.g(LogLevel.Error, format(array));
                }
                else {
                    this.g(LogLevel.Error, format([message, ...args]));
                }
            }
        }
        flush() { }
    }
    exports.$$i = $$i;
    class $_i extends $0i {
        constructor(logLevel = exports.$8i) {
            super();
            this.setLevel(logLevel);
            this.g = !platform_1.$i;
        }
        trace(message, ...args) {
            if (this.f(LogLevel.Trace)) {
                if (this.g) {
                    console.log(`\x1b[90m[main ${now()}]\x1b[0m`, message, ...args);
                }
                else {
                    console.log(`[main ${now()}]`, message, ...args);
                }
            }
        }
        debug(message, ...args) {
            if (this.f(LogLevel.Debug)) {
                if (this.g) {
                    console.log(`\x1b[90m[main ${now()}]\x1b[0m`, message, ...args);
                }
                else {
                    console.log(`[main ${now()}]`, message, ...args);
                }
            }
        }
        info(message, ...args) {
            if (this.f(LogLevel.Info)) {
                if (this.g) {
                    console.log(`\x1b[90m[main ${now()}]\x1b[0m`, message, ...args);
                }
                else {
                    console.log(`[main ${now()}]`, message, ...args);
                }
            }
        }
        warn(message, ...args) {
            if (this.f(LogLevel.Warning)) {
                if (this.g) {
                    console.warn(`\x1b[93m[main ${now()}]\x1b[0m`, message, ...args);
                }
                else {
                    console.warn(`[main ${now()}]`, message, ...args);
                }
            }
        }
        error(message, ...args) {
            if (this.f(LogLevel.Error)) {
                if (this.g) {
                    console.error(`\x1b[91m[main ${now()}]\x1b[0m`, message, ...args);
                }
                else {
                    console.error(`[main ${now()}]`, message, ...args);
                }
            }
        }
        dispose() {
            // noop
        }
        flush() {
            // noop
        }
    }
    exports.$_i = $_i;
    class $aj extends $0i {
        constructor(logLevel = exports.$8i, g = true) {
            super();
            this.g = g;
            this.setLevel(logLevel);
        }
        trace(message, ...args) {
            if (this.f(LogLevel.Trace)) {
                if (this.g) {
                    console.log('%cTRACE', 'color: #888', message, ...args);
                }
                else {
                    console.log(message, ...args);
                }
            }
        }
        debug(message, ...args) {
            if (this.f(LogLevel.Debug)) {
                if (this.g) {
                    console.log('%cDEBUG', 'background: #eee; color: #888', message, ...args);
                }
                else {
                    console.log(message, ...args);
                }
            }
        }
        info(message, ...args) {
            if (this.f(LogLevel.Info)) {
                if (this.g) {
                    console.log('%c INFO', 'color: #33f', message, ...args);
                }
                else {
                    console.log(message, ...args);
                }
            }
        }
        warn(message, ...args) {
            if (this.f(LogLevel.Warning)) {
                if (this.g) {
                    console.log('%c WARN', 'color: #993', message, ...args);
                }
                else {
                    console.log(message, ...args);
                }
            }
        }
        error(message, ...args) {
            if (this.f(LogLevel.Error)) {
                if (this.g) {
                    console.log('%c  ERR', 'color: #f33', message, ...args);
                }
                else {
                    console.error(message, ...args);
                }
            }
        }
        dispose() {
            // noop
        }
        flush() {
            // noop
        }
    }
    exports.$aj = $aj;
    class $bj extends $0i {
        constructor(g, logLevel = exports.$8i) {
            super();
            this.g = g;
            this.setLevel(logLevel);
        }
        trace(message, ...args) {
            if (this.f(LogLevel.Trace)) {
                this.g.log(LogLevel.Trace, [this.h(message), ...args]);
            }
        }
        debug(message, ...args) {
            if (this.f(LogLevel.Debug)) {
                this.g.log(LogLevel.Debug, [this.h(message), ...args]);
            }
        }
        info(message, ...args) {
            if (this.f(LogLevel.Info)) {
                this.g.log(LogLevel.Info, [this.h(message), ...args]);
            }
        }
        warn(message, ...args) {
            if (this.f(LogLevel.Warning)) {
                this.g.log(LogLevel.Warning, [this.h(message), ...args]);
            }
        }
        error(message, ...args) {
            if (this.f(LogLevel.Error)) {
                this.g.log(LogLevel.Error, [this.h(message), ...args]);
            }
        }
        h(msg) {
            if (typeof msg === 'string') {
                return msg;
            }
            return (0, errorMessage_1.$mi)(msg, this.f(LogLevel.Trace));
        }
        dispose() {
            // noop
        }
        flush() {
            // noop
        }
    }
    exports.$bj = $bj;
    class $cj extends $0i {
        constructor(g) {
            super();
            this.g = g;
            if (g.length) {
                this.setLevel(g[0].getLevel());
            }
        }
        setLevel(level) {
            for (const logger of this.g) {
                logger.setLevel(level);
            }
            super.setLevel(level);
        }
        trace(message, ...args) {
            for (const logger of this.g) {
                logger.trace(message, ...args);
            }
        }
        debug(message, ...args) {
            for (const logger of this.g) {
                logger.debug(message, ...args);
            }
        }
        info(message, ...args) {
            for (const logger of this.g) {
                logger.info(message, ...args);
            }
        }
        warn(message, ...args) {
            for (const logger of this.g) {
                logger.warn(message, ...args);
            }
        }
        error(message, ...args) {
            for (const logger of this.g) {
                logger.error(message, ...args);
            }
        }
        flush() {
            for (const logger of this.g) {
                logger.flush();
            }
        }
        dispose() {
            for (const logger of this.g) {
                logger.dispose();
            }
        }
    }
    exports.$cj = $cj;
    class $dj extends lifecycle_1.$kc {
        constructor(h, j, loggerResources) {
            super();
            this.h = h;
            this.j = j;
            this.b = new map_1.$zi();
            this.c = this.B(new event_1.$fd);
            this.onDidChangeLoggers = this.c.event;
            this.f = this.B(new event_1.$fd);
            this.onDidChangeLogLevel = this.f.event;
            this.g = this.B(new event_1.$fd);
            this.onDidChangeVisibility = this.g.event;
            if (loggerResources) {
                for (const loggerResource of loggerResources) {
                    this.b.set(loggerResource.resource, { logger: undefined, info: loggerResource });
                }
            }
        }
        m(resourceOrId) {
            if ((0, types_1.$jf)(resourceOrId)) {
                return [...this.b.values()].find(logger => logger.info.id === resourceOrId);
            }
            return this.b.get(resourceOrId);
        }
        getLogger(resourceOrId) {
            return this.m(resourceOrId)?.logger;
        }
        createLogger(idOrResource, options) {
            const resource = this.n(idOrResource);
            const id = (0, types_1.$jf)(idOrResource) ? idOrResource : (options?.id ?? (0, hash_1.$pi)(resource.toString()).toString(16));
            let logger = this.b.get(resource)?.logger;
            const logLevel = options?.logLevel === 'always' ? LogLevel.Trace : options?.logLevel;
            if (!logger) {
                logger = this.s(resource, logLevel ?? this.getLogLevel(resource) ?? this.h, { ...options, id });
            }
            const loggerEntry = {
                logger,
                info: { resource, id, logLevel, name: options?.name, hidden: options?.hidden, extensionId: options?.extensionId, when: options?.when }
            };
            this.registerLogger(loggerEntry.info);
            // TODO: @sandy081 Remove this once registerLogger can take ILogger
            this.b.set(resource, loggerEntry);
            return logger;
        }
        n(idOrResource) {
            return (0, types_1.$jf)(idOrResource) ? (0, resources_1.$ig)(this.j, `${idOrResource}.log`) : idOrResource;
        }
        setLogLevel(arg1, arg2) {
            if (uri_1.URI.isUri(arg1)) {
                const resource = arg1;
                const logLevel = arg2;
                const logger = this.b.get(resource);
                if (logger && logLevel !== logger.info.logLevel) {
                    logger.info.logLevel = logLevel === this.h ? undefined : logLevel;
                    logger.logger?.setLevel(logLevel);
                    this.b.set(logger.info.resource, logger);
                    this.f.fire([resource, logLevel]);
                }
            }
            else {
                this.h = arg1;
                for (const [resource, logger] of this.b.entries()) {
                    if (this.b.get(resource)?.info.logLevel === undefined) {
                        logger.logger?.setLevel(this.h);
                    }
                }
                this.f.fire(this.h);
            }
        }
        setVisibility(resourceOrId, visibility) {
            const logger = this.m(resourceOrId);
            if (logger && visibility !== !logger.info.hidden) {
                logger.info.hidden = !visibility;
                this.b.set(logger.info.resource, logger);
                this.g.fire([logger.info.resource, visibility]);
            }
        }
        getLogLevel(resource) {
            let logLevel;
            if (resource) {
                logLevel = this.b.get(resource)?.info.logLevel;
            }
            return logLevel ?? this.h;
        }
        registerLogger(resource) {
            const existing = this.b.get(resource.resource);
            if (existing) {
                if (existing.info.hidden !== resource.hidden) {
                    this.setVisibility(resource.resource, !resource.hidden);
                }
            }
            else {
                this.b.set(resource.resource, { info: resource, logger: undefined });
                this.c.fire({ added: [resource], removed: [] });
            }
        }
        deregisterLogger(resource) {
            const existing = this.b.get(resource);
            if (existing) {
                if (existing.logger) {
                    existing.logger.dispose();
                }
                this.b.delete(resource);
                this.c.fire({ added: [], removed: [existing.info] });
            }
        }
        *getRegisteredLoggers() {
            for (const entry of this.b.values()) {
                yield entry.info;
            }
        }
        getRegisteredLogger(resource) {
            return this.b.get(resource)?.info;
        }
        dispose() {
            this.b.forEach(logger => logger.logger?.dispose());
            this.b.clear();
            super.dispose();
        }
    }
    exports.$dj = $dj;
    class $ej {
        constructor() {
            this.onDidChangeLogLevel = new event_1.$fd().event;
        }
        setLevel(level) { }
        getLevel() { return LogLevel.Info; }
        trace(message, ...args) { }
        debug(message, ...args) { }
        info(message, ...args) { }
        warn(message, ...args) { }
        error(message, ...args) { }
        critical(message, ...args) { }
        dispose() { }
        flush() { }
    }
    exports.$ej = $ej;
    class $fj extends $ej {
    }
    exports.$fj = $fj;
    function $gj(environmentService) {
        if (environmentService.verbose) {
            return LogLevel.Trace;
        }
        if (typeof environmentService.logLevel === 'string') {
            const logLevel = $ij(environmentService.logLevel.toLowerCase());
            if (logLevel !== undefined) {
                return logLevel;
            }
        }
        return exports.$8i;
    }
    exports.$gj = $gj;
    function $hj(logLevel) {
        switch (logLevel) {
            case LogLevel.Trace: return 'trace';
            case LogLevel.Debug: return 'debug';
            case LogLevel.Info: return 'info';
            case LogLevel.Warning: return 'warn';
            case LogLevel.Error: return 'error';
            case LogLevel.Off: return 'off';
        }
    }
    exports.$hj = $hj;
    function $ij(logLevel) {
        switch (logLevel) {
            case 'trace':
                return LogLevel.Trace;
            case 'debug':
                return LogLevel.Debug;
            case 'info':
                return LogLevel.Info;
            case 'warn':
                return LogLevel.Warning;
            case 'error':
                return LogLevel.Error;
            case 'critical':
                return LogLevel.Error;
            case 'off':
                return LogLevel.Off;
        }
        return undefined;
    }
    exports.$ij = $ij;
    // Contexts
    exports.$jj = new contextkey_1.$2i('logLevel', $hj(LogLevel.Info));
});
//# sourceMappingURL=log.js.map