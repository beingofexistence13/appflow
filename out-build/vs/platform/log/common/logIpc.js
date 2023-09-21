/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/base/common/event", "vs/platform/log/common/log", "vs/base/common/lifecycle"], function (require, exports, uri_1, event_1, log_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$3q = exports.$2q = exports.$1q = void 0;
    class $1q extends log_1.$dj {
        constructor(r, logLevel, logsHome, loggers, t) {
            super(logLevel, logsHome, loggers);
            this.r = r;
            this.t = t;
            this.B(t.listen('onDidChangeLogLevel', r)(arg => {
                if ((0, log_1.$7i)(arg)) {
                    super.setLogLevel(arg);
                }
                else {
                    super.setLogLevel(uri_1.URI.revive(arg[0]), arg[1]);
                }
            }));
            this.B(t.listen('onDidChangeVisibility', r)(([resource, visibility]) => super.setVisibility(uri_1.URI.revive(resource), visibility)));
            this.B(t.listen('onDidChangeLoggers', r)(({ added, removed }) => {
                for (const loggerResource of added) {
                    super.registerLogger({ ...loggerResource, resource: uri_1.URI.revive(loggerResource.resource) });
                }
                for (const loggerResource of removed) {
                    super.deregisterLogger(loggerResource.resource);
                }
            }));
        }
        createConsoleMainLogger() {
            return new log_1.$bj({
                log: (level, args) => {
                    this.t.call('consoleLog', [level, args]);
                }
            });
        }
        registerLogger(logger) {
            super.registerLogger(logger);
            this.t.call('registerLogger', [logger, this.r]);
        }
        deregisterLogger(resource) {
            super.deregisterLogger(resource);
            this.t.call('deregisterLogger', [resource, this.r]);
        }
        setLogLevel(arg1, arg2) {
            super.setLogLevel(arg1, arg2);
            this.t.call('setLogLevel', [arg1, arg2]);
        }
        setVisibility(resourceOrId, visibility) {
            super.setVisibility(resourceOrId, visibility);
            this.t.call('setVisibility', [this.n(resourceOrId), visibility]);
        }
        s(file, logLevel, options) {
            return new Logger(this.t, file, logLevel, options, this.r);
        }
        static setLogLevel(channel, arg1, arg2) {
            return channel.call('setLogLevel', [arg1, arg2]);
        }
    }
    exports.$1q = $1q;
    class Logger extends log_1.$$i {
        constructor(r, s, logLevel, loggerOptions, windowId) {
            super(loggerOptions?.logLevel === 'always');
            this.r = r;
            this.s = s;
            this.m = false;
            this.n = [];
            this.setLevel(logLevel);
            this.r.call('createLogger', [s, loggerOptions, windowId])
                .then(() => {
                this.u(this.n);
                this.m = true;
            });
        }
        g(level, message) {
            const messages = [[level, message]];
            if (this.m) {
                this.u(messages);
            }
            else {
                this.n.push(...messages);
            }
        }
        u(messages) {
            this.r.call('log', [this.s, messages]);
        }
    }
    class $2q {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        listen(context, event) {
            const uriTransformer = this.b(context);
            switch (event) {
                case 'onDidChangeLoggers': return event_1.Event.map(this.a.onDidChangeLoggers, (e) => ({
                    added: [...e.added].map(logger => this.c(logger, uriTransformer)),
                    removed: [...e.removed].map(logger => this.c(logger, uriTransformer)),
                }));
                case 'onDidChangeVisibility': return event_1.Event.map(this.a.onDidChangeVisibility, e => [uriTransformer.transformOutgoingURI(e[0]), e[1]]);
                case 'onDidChangeLogLevel': return event_1.Event.map(this.a.onDidChangeLogLevel, e => (0, log_1.$7i)(e) ? e : [uriTransformer.transformOutgoingURI(e[0]), e[1]]);
            }
            throw new Error(`Event not found: ${event}`);
        }
        async call(context, command, arg) {
            const uriTransformer = this.b(context);
            switch (command) {
                case 'setLogLevel': return (0, log_1.$7i)(arg[0]) ? this.a.setLogLevel(arg[0]) : this.a.setLogLevel(uri_1.URI.revive(uriTransformer.transformIncoming(arg[0][0])), arg[0][1]);
                case 'getRegisteredLoggers': return Promise.resolve([...this.a.getRegisteredLoggers()].map(logger => this.c(logger, uriTransformer)));
            }
            throw new Error(`Call not found: ${command}`);
        }
        c(logger, transformer) {
            return {
                ...logger,
                resource: transformer.transformOutgoingURI(logger.resource)
            };
        }
    }
    exports.$2q = $2q;
    class $3q extends lifecycle_1.$kc {
        constructor(loggerService, channel) {
            super();
            channel.call('setLogLevel', [loggerService.getLogLevel()]);
            this.B(loggerService.onDidChangeLogLevel(arg => channel.call('setLogLevel', [arg])));
            channel.call('getRegisteredLoggers').then(loggers => {
                for (const loggerResource of loggers) {
                    loggerService.registerLogger({ ...loggerResource, resource: uri_1.URI.revive(loggerResource.resource) });
                }
            });
            this.B(channel.listen('onDidChangeVisibility')(([resource, visibility]) => loggerService.setVisibility(uri_1.URI.revive(resource), visibility)));
            this.B(channel.listen('onDidChangeLoggers')(({ added, removed }) => {
                for (const loggerResource of added) {
                    loggerService.registerLogger({ ...loggerResource, resource: uri_1.URI.revive(loggerResource.resource) });
                }
                for (const loggerResource of removed) {
                    loggerService.deregisterLogger(loggerResource.resource);
                }
            }));
        }
    }
    exports.$3q = $3q;
});
//# sourceMappingURL=logIpc.js.map