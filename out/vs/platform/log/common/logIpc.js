/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/base/common/event", "vs/platform/log/common/log", "vs/base/common/lifecycle"], function (require, exports, uri_1, event_1, log_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteLoggerChannelClient = exports.LoggerChannel = exports.LoggerChannelClient = void 0;
    class LoggerChannelClient extends log_1.AbstractLoggerService {
        constructor(windowId, logLevel, logsHome, loggers, channel) {
            super(logLevel, logsHome, loggers);
            this.windowId = windowId;
            this.channel = channel;
            this._register(channel.listen('onDidChangeLogLevel', windowId)(arg => {
                if ((0, log_1.isLogLevel)(arg)) {
                    super.setLogLevel(arg);
                }
                else {
                    super.setLogLevel(uri_1.URI.revive(arg[0]), arg[1]);
                }
            }));
            this._register(channel.listen('onDidChangeVisibility', windowId)(([resource, visibility]) => super.setVisibility(uri_1.URI.revive(resource), visibility)));
            this._register(channel.listen('onDidChangeLoggers', windowId)(({ added, removed }) => {
                for (const loggerResource of added) {
                    super.registerLogger({ ...loggerResource, resource: uri_1.URI.revive(loggerResource.resource) });
                }
                for (const loggerResource of removed) {
                    super.deregisterLogger(loggerResource.resource);
                }
            }));
        }
        createConsoleMainLogger() {
            return new log_1.AdapterLogger({
                log: (level, args) => {
                    this.channel.call('consoleLog', [level, args]);
                }
            });
        }
        registerLogger(logger) {
            super.registerLogger(logger);
            this.channel.call('registerLogger', [logger, this.windowId]);
        }
        deregisterLogger(resource) {
            super.deregisterLogger(resource);
            this.channel.call('deregisterLogger', [resource, this.windowId]);
        }
        setLogLevel(arg1, arg2) {
            super.setLogLevel(arg1, arg2);
            this.channel.call('setLogLevel', [arg1, arg2]);
        }
        setVisibility(resourceOrId, visibility) {
            super.setVisibility(resourceOrId, visibility);
            this.channel.call('setVisibility', [this.toResource(resourceOrId), visibility]);
        }
        doCreateLogger(file, logLevel, options) {
            return new Logger(this.channel, file, logLevel, options, this.windowId);
        }
        static setLogLevel(channel, arg1, arg2) {
            return channel.call('setLogLevel', [arg1, arg2]);
        }
    }
    exports.LoggerChannelClient = LoggerChannelClient;
    class Logger extends log_1.AbstractMessageLogger {
        constructor(channel, file, logLevel, loggerOptions, windowId) {
            super(loggerOptions?.logLevel === 'always');
            this.channel = channel;
            this.file = file;
            this.isLoggerCreated = false;
            this.buffer = [];
            this.setLevel(logLevel);
            this.channel.call('createLogger', [file, loggerOptions, windowId])
                .then(() => {
                this.doLog(this.buffer);
                this.isLoggerCreated = true;
            });
        }
        log(level, message) {
            const messages = [[level, message]];
            if (this.isLoggerCreated) {
                this.doLog(messages);
            }
            else {
                this.buffer.push(...messages);
            }
        }
        doLog(messages) {
            this.channel.call('log', [this.file, messages]);
        }
    }
    class LoggerChannel {
        constructor(loggerService, getUriTransformer) {
            this.loggerService = loggerService;
            this.getUriTransformer = getUriTransformer;
        }
        listen(context, event) {
            const uriTransformer = this.getUriTransformer(context);
            switch (event) {
                case 'onDidChangeLoggers': return event_1.Event.map(this.loggerService.onDidChangeLoggers, (e) => ({
                    added: [...e.added].map(logger => this.transformLogger(logger, uriTransformer)),
                    removed: [...e.removed].map(logger => this.transformLogger(logger, uriTransformer)),
                }));
                case 'onDidChangeVisibility': return event_1.Event.map(this.loggerService.onDidChangeVisibility, e => [uriTransformer.transformOutgoingURI(e[0]), e[1]]);
                case 'onDidChangeLogLevel': return event_1.Event.map(this.loggerService.onDidChangeLogLevel, e => (0, log_1.isLogLevel)(e) ? e : [uriTransformer.transformOutgoingURI(e[0]), e[1]]);
            }
            throw new Error(`Event not found: ${event}`);
        }
        async call(context, command, arg) {
            const uriTransformer = this.getUriTransformer(context);
            switch (command) {
                case 'setLogLevel': return (0, log_1.isLogLevel)(arg[0]) ? this.loggerService.setLogLevel(arg[0]) : this.loggerService.setLogLevel(uri_1.URI.revive(uriTransformer.transformIncoming(arg[0][0])), arg[0][1]);
                case 'getRegisteredLoggers': return Promise.resolve([...this.loggerService.getRegisteredLoggers()].map(logger => this.transformLogger(logger, uriTransformer)));
            }
            throw new Error(`Call not found: ${command}`);
        }
        transformLogger(logger, transformer) {
            return {
                ...logger,
                resource: transformer.transformOutgoingURI(logger.resource)
            };
        }
    }
    exports.LoggerChannel = LoggerChannel;
    class RemoteLoggerChannelClient extends lifecycle_1.Disposable {
        constructor(loggerService, channel) {
            super();
            channel.call('setLogLevel', [loggerService.getLogLevel()]);
            this._register(loggerService.onDidChangeLogLevel(arg => channel.call('setLogLevel', [arg])));
            channel.call('getRegisteredLoggers').then(loggers => {
                for (const loggerResource of loggers) {
                    loggerService.registerLogger({ ...loggerResource, resource: uri_1.URI.revive(loggerResource.resource) });
                }
            });
            this._register(channel.listen('onDidChangeVisibility')(([resource, visibility]) => loggerService.setVisibility(uri_1.URI.revive(resource), visibility)));
            this._register(channel.listen('onDidChangeLoggers')(({ added, removed }) => {
                for (const loggerResource of added) {
                    loggerService.registerLogger({ ...loggerResource, resource: uri_1.URI.revive(loggerResource.resource) });
                }
                for (const loggerResource of removed) {
                    loggerService.deregisterLogger(loggerResource.resource);
                }
            }));
        }
    }
    exports.RemoteLoggerChannelClient = RemoteLoggerChannelClient;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nSXBjLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vbG9nL2NvbW1vbi9sb2dJcGMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU2hHLE1BQWEsbUJBQW9CLFNBQVEsMkJBQXFCO1FBRTdELFlBQTZCLFFBQTRCLEVBQUUsUUFBa0IsRUFBRSxRQUFhLEVBQUUsT0FBMEIsRUFBbUIsT0FBaUI7WUFDM0osS0FBSyxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFEUCxhQUFRLEdBQVIsUUFBUSxDQUFvQjtZQUFrRixZQUFPLEdBQVAsT0FBTyxDQUFVO1lBRTNKLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBNkIscUJBQXFCLEVBQUUsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2hHLElBQUksSUFBQSxnQkFBVSxFQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUNwQixLQUFLLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUN2QjtxQkFBTTtvQkFDTixLQUFLLENBQUMsV0FBVyxDQUFDLFNBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQzlDO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBaUIsdUJBQXVCLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxTQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNySyxJQUFJLENBQUMs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