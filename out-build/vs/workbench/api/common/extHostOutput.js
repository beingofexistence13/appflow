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
define(["require", "exports", "./extHost.protocol", "vs/platform/instantiation/common/instantiation", "vs/workbench/api/common/extHostRpcService", "vs/platform/extensions/common/extensions", "vs/platform/log/common/log", "vs/workbench/services/output/common/output", "vs/workbench/api/common/extHostFileSystemConsumer", "vs/workbench/api/common/extHostInitDataService", "vs/workbench/api/common/extHostFileSystemInfo", "vs/base/common/date", "vs/base/common/buffer", "vs/base/common/types", "vs/platform/files/common/files", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, extHost_protocol_1, instantiation_1, extHostRpcService_1, extensions_1, log_1, output_1, extHostFileSystemConsumer_1, extHostInitDataService_1, extHostFileSystemInfo_1, date_1, buffer_1, types_1, files_1, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Zbc = exports.$Ybc = void 0;
    class ExtHostOutputChannel extends log_1.$$i {
        get disposed() { return this.n; }
        constructor(id, name, r, s, extension) {
            super();
            this.id = id;
            this.name = name;
            this.r = r;
            this.s = s;
            this.extension = extension;
            this.m = 0;
            this.n = false;
            this.visible = false;
            this.setLevel(r.getLevel());
            this.B(r.onDidChangeLogLevel(level => this.setLevel(level)));
        }
        get logLevel() {
            return this.getLevel();
        }
        appendLine(value) {
            this.append(value + '\n');
        }
        append(value) {
            this.info(value);
        }
        clear() {
            const till = this.m;
            this.r.flush();
            this.s.$update(this.id, output_1.OutputChannelUpdateMode.Clear, till);
        }
        replace(value) {
            const till = this.m;
            this.info(value);
            this.s.$update(this.id, output_1.OutputChannelUpdateMode.Replace, till);
            if (this.visible) {
                this.r.flush();
            }
        }
        show(columnOrPreserveFocus, preserveFocus) {
            this.r.flush();
            this.s.$reveal(this.id, !!(typeof columnOrPreserveFocus === 'boolean' ? columnOrPreserveFocus : preserveFocus));
        }
        hide() {
            this.s.$close(this.id);
        }
        g(level, message) {
            this.m += buffer_1.$Fd.fromString(message).byteLength;
            (0, log_1.log)(this.r, level, message);
            if (this.visible) {
                this.r.flush();
                this.s.$update(this.id, output_1.OutputChannelUpdateMode.Append);
            }
        }
        dispose() {
            super.dispose();
            if (!this.n) {
                this.s.$dispose(this.id);
                this.n = true;
            }
        }
    }
    class ExtHostLogOutputChannel extends ExtHostOutputChannel {
        appendLine(value) {
            this.append(value);
        }
    }
    let $Ybc = class $Ybc {
        constructor(extHostRpc, i, j, k, l, m) {
            this.i = i;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.d = new Map();
            this.f = 1;
            this.g = new Map();
            this.h = null;
            this.a = extHostRpc.getProxy(extHost_protocol_1.$1J.MainThreadOutputService);
            this.b = this.k.extUri.joinPath(i.logsLocation, `output_logging_${(0, date_1.$7l)(new Date()).replace(/-|:|\.\d+Z$/g, '')}`);
        }
        $setVisibleChannel(visibleChannelId) {
            this.h = visibleChannelId;
            for (const [id, channel] of this.g) {
                channel.visible = id === this.h;
            }
        }
        createOutputChannel(name, options, extension) {
            name = name.trim();
            if (!name) {
                throw new Error('illegal argument `name`. must not be falsy');
            }
            const log = typeof options === 'object' && options.log;
            const languageId = (0, types_1.$jf)(options) ? options : undefined;
            if ((0, types_1.$jf)(languageId) && !languageId.trim()) {
                throw new Error('illegal argument `languageId`. must not be empty');
            }
            let logLevel;
            const logLevelValue = this.i.environment.extensionLogLevel?.find(([identifier]) => extensions_1.$Vl.equals(extension.identifier, identifier))?.[1];
            if (logLevelValue) {
                logLevel = (0, log_1.$ij)(logLevelValue);
            }
            const extHostOutputChannel = log ? this.o(name, logLevel, extension) : this.n(name, languageId, extension);
            extHostOutputChannel.then(channel => {
                this.g.set(channel.id, channel);
                channel.visible = channel.id === this.h;
            });
            return log ? this.r(name, logLevel ?? this.m.getLevel(), extHostOutputChannel) : this.q(name, extHostOutputChannel);
        }
        async n(name, languageId, extension) {
            if (!this.c) {
                this.c = this.j.value.createDirectory(this.b).then(() => this.b);
            }
            const outputDir = await this.c;
            const file = this.k.extUri.joinPath(outputDir, `${this.f++}-${name.replace(/[\\/:\*\?"<>\|]/g, '')}.log`);
            const logger = this.l.createLogger(file, { logLevel: 'always', donotRotate: true, donotUseFormatters: true, hidden: true });
            const id = await this.a.$register(name, file, languageId, extension.identifier.value);
            return new ExtHostOutputChannel(id, name, logger, this.a, extension);
        }
        async o(name, logLevel, extension) {
            const extensionLogDir = await this.p(extension);
            const fileName = name.replace(/[\\/:\*\?"<>\|]/g, '');
            const file = this.k.extUri.joinPath(extensionLogDir, `${fileName}.log`);
            const id = `${extension.identifier.value}.${fileName}`;
            const logger = this.l.createLogger(file, { id, name, logLevel, extensionId: extension.identifier.value });
            return new ExtHostLogOutputChannel(id, name, logger, this.a, extension);
        }
        p(extension) {
            let extensionLogDirectoryPromise = this.d.get(extension.identifier.value);
            if (!extensionLogDirectoryPromise) {
                const extensionLogDirectory = this.k.extUri.joinPath(this.i.logsLocation, extension.identifier.value);
                this.d.set(extension.identifier.value, extensionLogDirectoryPromise = (async () => {
                    try {
                        await this.j.value.createDirectory(extensionLogDirectory);
                    }
                    catch (err) {
                        if ((0, files_1.$ik)(err) !== files_1.FileSystemProviderErrorCode.FileExists) {
                            throw err;
                        }
                    }
                    return extensionLogDirectory;
                })());
            }
            return extensionLogDirectoryPromise;
        }
        q(name, channelPromise) {
            let disposed = false;
            const validate = () => {
                if (disposed) {
                    throw new Error('Channel has been closed');
                }
            };
            return {
                get name() { return name; },
                append(value) {
                    validate();
                    channelPromise.then(channel => channel.append(value));
                },
                appendLine(value) {
                    validate();
                    channelPromise.then(channel => channel.appendLine(value));
                },
                clear() {
                    validate();
                    channelPromise.then(channel => channel.clear());
                },
                replace(value) {
                    validate();
                    channelPromise.then(channel => channel.replace(value));
                },
                show(columnOrPreserveFocus, preserveFocus) {
                    validate();
                    channelPromise.then(channel => channel.show(columnOrPreserveFocus, preserveFocus));
                },
                hide() {
                    validate();
                    channelPromise.then(channel => channel.hide());
                },
                dispose() {
                    disposed = true;
                    channelPromise.then(channel => channel.dispose());
                }
            };
        }
        r(name, logLevel, channelPromise) {
            const disposables = new lifecycle_1.$jc();
            const validate = () => {
                if (disposables.isDisposed) {
                    throw new Error('Channel has been closed');
                }
            };
            const onDidChangeLogLevel = disposables.add(new event_1.$fd());
            function setLogLevel(newLogLevel) {
                logLevel = newLogLevel;
                onDidChangeLogLevel.fire(newLogLevel);
            }
            channelPromise.then(channel => {
                disposables.add(channel);
                if (channel.logLevel !== logLevel) {
                    setLogLevel(channel.logLevel);
                }
                disposables.add(channel.onDidChangeLogLevel(e => setLogLevel(e)));
            });
            return {
                ...this.q(name, channelPromise),
                get logLevel() { return logLevel; },
                onDidChangeLogLevel: onDidChangeLogLevel.event,
                trace(value, ...args) {
                    validate();
                    channelPromise.then(channel => channel.trace(value, ...args));
                },
                debug(value, ...args) {
                    validate();
                    channelPromise.then(channel => channel.debug(value, ...args));
                },
                info(value, ...args) {
                    validate();
                    channelPromise.then(channel => channel.info(value, ...args));
                },
                warn(value, ...args) {
                    validate();
                    channelPromise.then(channel => channel.warn(value, ...args));
                },
                error(value, ...args) {
                    validate();
                    channelPromise.then(channel => channel.error(value, ...args));
                },
                dispose() {
                    disposables.dispose();
                }
            };
        }
    };
    exports.$Ybc = $Ybc;
    exports.$Ybc = $Ybc = __decorate([
        __param(0, extHostRpcService_1.$2L),
        __param(1, extHostInitDataService_1.$fM),
        __param(2, extHostFileSystemConsumer_1.$Bbc),
        __param(3, extHostFileSystemInfo_1.$9ac),
        __param(4, log_1.$6i),
        __param(5, log_1.$5i)
    ], $Ybc);
    exports.$Zbc = (0, instantiation_1.$Bh)('IExtHostOutputService');
});
//# sourceMappingURL=extHostOutput.js.map