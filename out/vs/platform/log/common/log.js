/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errorMessage", "vs/base/common/event", "vs/base/common/hash", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/types", "vs/base/common/uri", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation"], function (require, exports, errorMessage_1, event_1, hash_1, lifecycle_1, map_1, platform_1, resources_1, types_1, uri_1, contextkey_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CONTEXT_LOG_LEVEL = exports.parseLogLevel = exports.LogLevelToString = exports.getLogLevel = exports.NullLogService = exports.NullLogger = exports.AbstractLoggerService = exports.MultiplexLogger = exports.AdapterLogger = exports.ConsoleLogger = exports.ConsoleMainLogger = exports.AbstractMessageLogger = exports.AbstractLogger = exports.log = exports.DEFAULT_LOG_LEVEL = exports.LogLevel = exports.isLogLevel = exports.ILoggerService = exports.ILogService = void 0;
    exports.ILogService = (0, instantiation_1.createDecorator)('logService');
    exports.ILoggerService = (0, instantiation_1.createDecorator)('loggerService');
    function now() {
        return new Date().toISOString();
    }
    function isLogLevel(thing) {
        return (0, types_1.isNumber)(thing);
    }
    exports.isLogLevel = isLogLevel;
    var LogLevel;
    (function (LogLevel) {
        LogLevel[LogLevel["Off"] = 0] = "Off";
        LogLevel[LogLevel["Trace"] = 1] = "Trace";
        LogLevel[LogLevel["Debug"] = 2] = "Debug";
        LogLevel[LogLevel["Info"] = 3] = "Info";
        LogLevel[LogLevel["Warning"] = 4] = "Warning";
        LogLevel[LogLevel["Error"] = 5] = "Error";
    })(LogLevel || (exports.LogLevel = LogLevel = {}));
    exports.DEFAULT_LOG_LEVEL = LogLevel.Info;
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
                a = (0, errorMessage_1.toErrorMessage)(a, verbose);
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
    class AbstractLogger extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this.level = exports.DEFAULT_LOG_LEVEL;
            this._onDidChangeLogLevel = this._register(new event_1.Emitter());
            this.onDidChangeLogLevel = this._onDidChangeLogLevel.event;
        }
        setLevel(level) {
            if (this.level !== level) {
                this.level = level;
                this._onDidChangeLogLevel.fire(this.level);
            }
        }
        getLevel() {
            return this.level;
        }
        checkLogLevel(level) {
            return this.level !== LogLevel.Off && this.level <= level;
        }
    }
    exports.AbstractLogger = AbstractLogger;
    class AbstractMessageLogger extends AbstractLogger {
        constructor(logAlways) {
            super();
            this.logAlways = logAlways;
        }
        checkLogLevel(level) {
            return this.logAlways || super.checkLogLevel(level);
        }
        trace(message, ...args) {
            if (this.checkLogLevel(LogLevel.Trace)) {
                this.log(LogLevel.Trace, format([message, ...args], true));
            }
        }
        debug(message, ...args) {
            if (this.checkLogLevel(LogLevel.Debug)) {
                this.log(LogLevel.Debug, format([message, ...args]));
            }
        }
        info(message, ...args) {
            if (this.checkLogLevel(LogLevel.Info)) {
                this.log(LogLevel.Info, format([message, ...args]));
            }
        }
        warn(message, ...args) {
            if (this.checkLogLevel(LogLevel.Warning)) {
                this.log(LogLevel.Warning, format([message, ...args]));
            }
        }
        error(message, ...args) {
            if (this.checkLogLevel(LogLevel.Error)) {
                if (message instanceof Error) {
                    const array = Array.prototype.slice.call(arguments);
                    array[0] = message.stack;
                    this.log(LogLevel.Error, format(array));
                }
                else {
                    this.log(LogLevel.Error, format([message, ...args]));
                }
            }
        }
        flush() { }
    }
    exports.AbstractMessageLogger = AbstractMessageLogger;
    class ConsoleMainLogger extends AbstractLogger {
        constructor(logLevel = exports.DEFAULT_LOG_LEVEL) {
            super();
            this.setLevel(logLevel);
            this.useColors = !platform_1.isWindows;
        }
        trace(message, ...args) {
            if (this.checkLogLevel(LogLevel.Trace)) {
                if (this.useColors) {
                    console.log(`\x1b[90m[main ${now()}]\x1b[0m`, message, ...args);
                }
                else {
                    console.log(`[main ${now()}]`, message, ...args);
                }
            }
        }
        debug(message, ...args) {
            if (this.checkLogLevel(LogLevel.Debug)) {
                if (this.useColors) {
                    console.log(`\x1b[90m[main ${now()}]\x1b[0m`, message, ...args);
                }
                else {
                    console.log(`[main ${now()}]`, message, ...args);
                }
            }
        }
        info(message, ...args) {
            if (this.checkLogLevel(LogLevel.Info)) {
                if (this.useColors) {
                    console.log(`\x1b[90m[main ${now()}]\x1b[0m`, message, ...args);
                }
                else {
                    console.log(`[main ${now()}]`, message, ...args);
                }
            }
        }
        warn(message, ...args) {
            if (this.checkLogLevel(LogLevel.Warning)) {
                if (this.useColors) {
                    console.warn(`\x1b[93m[main ${now()}]\x1b[0m`, message, ...args);
                }
                else {
                    console.warn(`[main ${now()}]`, message, ...args);
                }
            }
        }
        error(message, ...args) {
            if (this.checkLogLevel(LogLevel.Error)) {
                if (this.useColors) {
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
    exports.ConsoleMainLogger = ConsoleMainLogger;
    class ConsoleLogger extends AbstractLogger {
        constructor(logLevel = exports.DEFAULT_LOG_LEVEL, useColors = true) {
            super();
            this.useColors = useColors;
            this.setLevel(logLevel);
        }
        trace(message, ...args) {
            if (this.checkLogLevel(LogLevel.Trace)) {
                if (this.useColors) {
                    console.log('%cTRACE', 'color: #888', message, ...args);
                }
                else {
                    console.log(message, ...args);
                }
            }
        }
        debug(message, ...args) {
            if (this.checkLogLevel(LogLevel.Debug)) {
                if (this.useColors) {
                    console.log('%cDEBUG', 'background: #eee; color: #888', message, ...args);
                }
                else {
                    console.log(message, ...args);
                }
            }
        }
        info(message, ...args) {
            if (this.checkLogLevel(LogLevel.Info)) {
                if (this.useColors) {
                    console.log('%c INFO', 'color: #33f', message, ...args);
                }
                else {
                    console.log(message, ...args);
                }
            }
        }
        warn(message, ...args) {
            if (this.checkLogLevel(LogLevel.Warning)) {
                if (this.useColors) {
                    console.log('%c WARN', 'color: #993', message, ...args);
                }
                else {
                    console.log(message, ...args);
                }
            }
        }
        error(message, ...args) {
            if (this.checkLogLevel(LogLevel.Error)) {
                if (this.useColors) {
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
    exports.ConsoleLogger = ConsoleLogger;
    class AdapterLogger extends AbstractLogger {
        constructor(adapter, logLevel = exports.DEFAULT_LOG_LEVEL) {
            super();
            this.adapter = adapter;
            this.setLevel(logLevel);
        }
        trace(message, ...args) {
            if (this.checkLogLevel(LogLevel.Trace)) {
                this.adapter.log(LogLevel.Trace, [this.extractMessage(message), ...args]);
            }
        }
        debug(message, ...args) {
            if (this.checkLogLevel(LogLevel.Debug)) {
                this.adapter.log(LogLevel.Debug, [this.extractMessage(message), ...args]);
            }
        }
        info(message, ...args) {
            if (this.checkLogLevel(LogLevel.Info)) {
                this.adapter.log(LogLevel.Info, [this.extractMessage(message), ...args]);
            }
        }
        warn(message, ...args) {
            if (this.checkLogLevel(LogLevel.Warning)) {
                this.adapter.log(LogLevel.Warning, [this.extractMessage(message), ...args]);
            }
        }
        error(message, ...args) {
            if (this.checkLogLevel(LogLevel.Error)) {
                this.adapter.log(LogLevel.Error, [this.extractMessage(message), ...args]);
            }
        }
        extractMessage(msg) {
            if (typeof msg === 'string') {
                return msg;
            }
            return (0, errorMessage_1.toErrorMessage)(msg, this.checkLogLevel(LogLevel.Trace));
        }
        dispose() {
            // noop
        }
        flush() {
            // noop
        }
    }
    exports.AdapterLogger = AdapterLogger;
    class MultiplexLogger extends AbstractLogger {
        constructor(loggers) {
            super();
            this.loggers = loggers;
            if (loggers.length) {
                this.setLevel(loggers[0].getLevel());
            }
        }
        setLevel(level) {
            for (const logger of this.loggers) {
                logger.setLevel(level);
            }
            super.setLevel(level);
        }
        trace(message, ...args) {
            for (const logger of this.loggers) {
                logger.trace(message, ...args);
            }
        }
        debug(message, ...args) {
            for (const logger of this.loggers) {
                logger.debug(message, ...args);
            }
        }
        info(message, ...args) {
            for (const logger of this.loggers) {
                logger.info(message, ...args);
            }
        }
        warn(message, ...args) {
            for (const logger of this.loggers) {
                logger.warn(message, ...args);
            }
        }
        error(message, ...args) {
            for (const logger of this.loggers) {
                logger.error(message, ...args);
            }
        }
        flush() {
            for (const logger of this.loggers) {
                logger.flush();
            }
        }
        dispose() {
            for (const logger of this.loggers) {
                logger.dispose();
            }
        }
    }
    exports.MultiplexLogger = MultiplexLogger;
    class AbstractLoggerService extends lifecycle_1.Disposable {
        constructor(logLevel, logsHome, loggerResources) {
            super();
            this.logLevel = logLevel;
            this.logsHome = logsHome;
            this._loggers = new map_1.ResourceMap();
            this._onDidChangeLoggers = this._register(new event_1.Emitter);
            this.onDidChangeLoggers = this._onDidChangeLoggers.event;
            this._onDidChangeLogLevel = this._register(new event_1.Emitter);
            this.onDidChangeLogLevel = this._onDidChangeLogLevel.event;
            this._onDidChangeVisibility = this._register(new event_1.Emitter);
            this.onDidChangeVisibility = this._onDidChangeVisibility.event;
            if (loggerResources) {
                for (const loggerResource of loggerResources) {
                    this._loggers.set(loggerResource.resource, { logger: undefined, info: loggerResource });
                }
            }
        }
        getLoggerEntry(resourceOrId) {
            if ((0, types_1.isString)(resourceOrId)) {
                return [...this._loggers.values()].find(logger => logger.info.id === resourceOrId);
            }
            return this._loggers.get(resourceOrId);
        }
        getLogger(resourceOrId) {
            return this.getLoggerEntry(resourceOrId)?.logger;
        }
        createLogger(idOrResource, options) {
            const resource = this.toResource(idOrResource);
            const id = (0, types_1.isString)(idOrResource) ? idOrResource : (options?.id ?? (0, hash_1.hash)(resource.toString()).toString(16));
            let logger = this._loggers.get(resource)?.logger;
            const logLevel = options?.logLevel === 'always' ? LogLevel.Trace : options?.logLevel;
            if (!logger) {
                logger = this.doCreateLogger(resource, logLevel ?? this.getLogLevel(resource) ?? this.logLevel, { ...options, id });
            }
            const loggerEntry = {
                logger,
                info: { resource, id, logLevel, name: options?.name, hidden: options?.hidden, extensionId: options?.extensionId, when: options?.when }
            };
            this.registerLogger(loggerEntry.info);
            // TODO: @sandy081 Remove this once registerLogger can take ILogger
            this._loggers.set(resource, loggerEntry);
            return logger;
        }
        toResource(idOrResource) {
            return (0, types_1.isString)(idOrResource) ? (0, resources_1.joinPath)(this.logsHome, `${idOrResource}.log`) : idOrResource;
        }
        setLogLevel(arg1, arg2) {
            if (uri_1.URI.isUri(arg1)) {
                const resource = arg1;
                const logLevel = arg2;
                const logger = this._loggers.get(resource);
                if (logger && logLevel !== logger.info.logLevel) {
                    logger.info.logLevel = logLevel === this.logLevel ? undefined : logLevel;
                    logger.logger?.setLevel(logLevel);
                    this._loggers.set(logger.info.resource, logger);
                    this._onDidChangeLogLevel.fire([resource, logLevel]);
                }
            }
            else {
                this.logLevel = arg1;
                for (const [resource, logger] of this._loggers.entries()) {
                    if (this._loggers.get(resource)?.info.logLevel === undefined) {
                        logger.logger?.setLevel(this.logLevel);
                    }
                }
                this._onDidChangeLogLevel.fire(this.logLevel);
            }
        }
        setVisibility(resourceOrId, visibility) {
            const logger = this.getLoggerEntry(resourceOrId);
            if (logger && visibility !== !logger.info.hidden) {
                logger.info.hidden = !visibility;
                this._loggers.set(logger.info.resource, logger);
                this._onDidChangeVisibility.fire([logger.info.resource, visibility]);
            }
        }
        getLogLevel(resource) {
            let logLevel;
            if (resource) {
                logLevel = this._loggers.get(resource)?.info.logLevel;
            }
            return logLevel ?? this.logLevel;
        }
        registerLogger(resource) {
            const existing = this._loggers.get(resource.resource);
            if (existing) {
                if (existing.info.hidden !== resource.hidden) {
                    this.setVisibility(resource.resource, !resource.hidden);
                }
            }
            else {
                this._loggers.set(resource.resource, { info: resource, logger: undefined });
                this._onDidChangeLoggers.fire({ added: [resource], removed: [] });
            }
        }
        deregisterLogger(resource) {
            const existing = this._loggers.get(resource);
            if (existing) {
                if (existing.logger) {
                    existing.logger.dispose();
                }
                this._loggers.delete(resource);
                this._onDidChangeLoggers.fire({ added: [], removed: [existing.info] });
            }
        }
        *getRegisteredLoggers() {
            for (const entry of this._loggers.values()) {
                yield entry.info;
            }
        }
        getRegisteredLogger(resource) {
            return this._loggers.get(resource)?.info;
        }
        dispose() {
            this._loggers.forEach(logger => logger.logger?.dispose());
            this._loggers.clear();
            super.dispose();
        }
    }
    exports.AbstractLoggerService = AbstractLoggerService;
    class NullLogger {
        constructor() {
            this.onDidChangeLogLevel = new event_1.Emitter().event;
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
    exports.NullLogger = NullLogger;
    class NullLogService extends NullLogger {
    }
    exports.NullLogService = NullLogService;
    function getLogLevel(environmentService) {
        if (environmentService.verbose) {
            return LogLevel.Trace;
        }
        if (typeof environmentService.logLevel === 'string') {
            const logLevel = parseLogLevel(environmentService.logLevel.toLowerCase());
            if (logLevel !== undefined) {
                return logLevel;
            }
        }
        return exports.DEFAULT_LOG_LEVEL;
    }
    exports.getLogLevel = getLogLevel;
    function LogLevelToString(logLevel) {
        switch (logLevel) {
            case LogLevel.Trace: return 'trace';
            case LogLevel.Debug: return 'debug';
            case LogLevel.Info: return 'info';
            case LogLevel.Warning: return 'warn';
            case LogLevel.Error: return 'error';
            case LogLevel.Off: return 'off';
        }
    }
    exports.LogLevelToString = LogLevelToString;
    function parseLogLevel(logLevel) {
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
    exports.parseLogLevel = parseLogLevel;
    // Contexts
    exports.CONTEXT_LOG_LEVEL = new contextkey_1.RawContextKey('logLevel', LogLevelToString(LogLevel.Info));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vbG9nL2NvbW1vbi9sb2cudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZW5GLFFBQUEsV0FBVyxHQUFHLElBQUEsK0JBQWUsRUFBYyxZQUFZLENBQUMsQ0FBQztJQUN6RCxRQUFBLGNBQWMsR0FBRyxJQUFBLCtCQUFlLEVBQWlCLGVBQWUsQ0FBQyxDQUFDO0lBRS9FLFNBQVMsR0FBRztRQUNYLE9BQU8sSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0lBRUQsU0FBZ0IsVUFBVSxDQUFDLEtBQWM7UUFDeEMsT0FBTyxJQUFBLGdCQUFRLEVBQUMsS0FBSyxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUZELGdDQUVDO0lBRUQsSUFBWSxRQU9YO0lBUEQsV0FBWSxRQUFRO1FBQ25CLHFDQUFHLENBQUE7UUFDSCx5Q0FBSyxDQUFBO1FBQ0wseUNBQUssQ0FBQTtRQUNMLHVDQUFJLENBQUE7UUFDSiw2Q0FBTyxDQUFBO1FBQ1AseUNBQUssQ0FBQTtJQUNOLENBQUMsRUFQVyxRQUFRLHdCQUFSLFFBQVEsUUFPbkI7SUFFWSxRQUFBLGlCQUFpQixHQUFhLFFBQVEsQ0FBQyxJQUFJLENBQUM7SUFtQnpELFNBQWdCLEdBQUcsQ0FBQyxNQUFlLEVBQUUsS0FBZSxFQUFFLE9BQWU7UUFDcEUsUUFBUSxLQUFLLEVBQUU7WUFDZCxLQUFLLFFBQVEsQ0FBQyxLQUFLO2dCQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQUMsTUFBTTtZQUNsRCxLQUFLLFFBQVEsQ0FBQyxLQUFLO2dCQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQUMsTUFBTTtZQUNsRCxLQUFLLFFBQVEsQ0FBQyxJQUFJO2dCQUFFLE1BQU0sQ0FBQyxJ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