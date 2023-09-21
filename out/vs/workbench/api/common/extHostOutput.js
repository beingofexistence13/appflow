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
    exports.IExtHostOutputService = exports.ExtHostOutputService = void 0;
    class ExtHostOutputChannel extends log_1.AbstractMessageLogger {
        get disposed() { return this._disposed; }
        constructor(id, name, logger, proxy, extension) {
            super();
            this.id = id;
            this.name = name;
            this.logger = logger;
            this.proxy = proxy;
            this.extension = extension;
            this.offset = 0;
            this._disposed = false;
            this.visible = false;
            this.setLevel(logger.getLevel());
            this._register(logger.onDidChangeLogLevel(level => this.setLevel(level)));
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
            const till = this.offset;
            this.logger.flush();
            this.proxy.$update(this.id, output_1.OutputChannelUpdateMode.Clear, till);
        }
        replace(value) {
            const till = this.offset;
            this.info(value);
            this.proxy.$update(this.id, output_1.OutputChannelUpdateMode.Replace, till);
            if (this.visible) {
                this.logger.flush();
            }
        }
        show(columnOrPreserveFocus, preserveFocus) {
            this.logger.flush();
            this.proxy.$reveal(this.id, !!(typeof columnOrPreserveFocus === 'boolean' ? columnOrPreserveFocus : preserveFocus));
        }
        hide() {
            this.proxy.$close(this.id);
        }
        log(level, message) {
            this.offset += buffer_1.VSBuffer.fromString(message).byteLength;
            (0, log_1.log)(this.logger, level, message);
            if (this.visible) {
                this.logger.flush();
                this.proxy.$update(this.id, output_1.OutputChannelUpdateMode.Append);
            }
        }
        dispose() {
            super.dispose();
            if (!this._disposed) {
                this.proxy.$dispose(this.id);
                this._disposed = true;
            }
        }
    }
    class ExtHostLogOutputChannel extends ExtHostOutputChannel {
        appendLine(value) {
            this.append(value);
        }
    }
    let ExtHostOutputService = class ExtHostOutputService {
        constructor(extHostRpc, initData, extHostFileSystem, extHostFileSystemInfo, loggerService, logService) {
            this.initData = initData;
            this.extHostFileSystem = extHostFileSystem;
            this.extHostFileSystemInfo = extHostFileSystemInfo;
            this.loggerService = loggerService;
            this.logService = logService;
            this.extensionLogDirectoryPromise = new Map();
            this.namePool = 1;
            this.channels = new Map();
            this.visibleChannelId = null;
            this.proxy = extHostRpc.getProxy(extHost_protocol_1.MainContext.MainThreadOutputService);
            this.outputsLocation = this.extHostFileSystemInfo.extUri.joinPath(initData.logsLocation, `output_logging_${(0, date_1.toLocalISOString)(new Date()).replace(/-|:|\.\d+Z$/g, '')}`);
        }
        $setVisibleChannel(visibleChannelId) {
            this.visibleChannelId = visibleChannelId;
            for (const [id, channel] of this.channels) {
                channel.visible = id === this.visibleChannelId;
            }
        }
        createOutputChannel(name, options, extension) {
            name = name.trim();
            if (!name) {
                throw new Error('illegal argument `name`. must not be falsy');
            }
            const log = typeof options === 'object' && options.log;
            const languageId = (0, types_1.isString)(options) ? options : undefined;
            if ((0, types_1.isString)(languageId) && !languageId.trim()) {
                throw new Error('illegal argument `languageId`. must not be empty');
            }
            let logLevel;
            const logLevelValue = this.initData.environment.extensionLogLevel?.find(([identifier]) => extensions_1.ExtensionIdentifier.equals(extension.identifier, identifier))?.[1];
            if (logLevelValue) {
                logLevel = (0, log_1.parseLogLevel)(logLevelValue);
            }
            const extHostOutputChannel = log ? this.doCreateLogOutputChannel(name, logLevel, extension) : this.doCreateOutputChannel(name, languageId, extension);
            extHostOutputChannel.then(channel => {
                this.channels.set(channel.id, channel);
                channel.visible = channel.id === this.visibleChannelId;
            });
            return log ? this.createExtHostLogOutputChannel(name, logLevel ?? this.logService.getLevel(), extHostOutputChannel) : this.createExtHostOutputChannel(name, extHostOutputChannel);
        }
        async doCreateOutputChannel(name, languageId, extension) {
            if (!this.outputDirectoryPromise) {
                this.outputDirectoryPromise = this.extHostFileSystem.value.createDirectory(this.outputsLocation).then(() => this.outputsLocation);
            }
            const outputDir = await this.outputDirectoryPromise;
            const file = this.extHostFileSystemInfo.extUri.joinPath(outputDir, `${this.namePool++}-${name.replace(/[\\/:\*\?"<>\|]/g, '')}.log`);
            const logger = this.loggerService.createLogger(file, { logLevel: 'always', donotRotate: true, donotUseFormatters: true, hidden: true });
            const id = await this.proxy.$register(name, file, languageId, extension.identifier.value);
            return new ExtHostOutputChannel(id, name, logger, this.proxy, extension);
        }
        async doCreateLogOutputChannel(name, logLevel, extension) {
            const extensionLogDir = await this.createExtensionLogDirectory(extension);
            const fileName = name.replace(/[\\/:\*\?"<>\|]/g, '');
            const file = this.extHostFileSystemInfo.extUri.joinPath(extensionLogDir, `${fileName}.log`);
            const id = `${extension.identifier.value}.${fileName}`;
            const logger = this.loggerService.createLogger(file, { id, name, logLevel, extensionId: extension.identifier.value });
            return new ExtHostLogOutputChannel(id, name, logger, this.proxy, extension);
        }
        createExtensionLogDirectory(extension) {
            let extensionLogDirectoryPromise = this.extensionLogDirectoryPromise.get(extension.identifier.value);
            if (!extensionLogDirectoryPromise) {
                const extensionLogDirectory = this.extHostFileSystemInfo.extUri.joinPath(this.initData.logsLocation, extension.identifier.value);
                this.extensionLogDirectoryPromise.set(extension.identifier.value, extensionLogDirectoryPromise = (async () => {
                    try {
                        await this.extHostFileSystem.value.createDirectory(extensionLogDirectory);
                    }
                    catch (err) {
                        if ((0, files_1.toFileSystemProviderErrorCode)(err) !== files_1.FileSystemProviderErrorCode.FileExists) {
                            throw err;
                        }
                    }
                    return extensionLogDirectory;
                })());
            }
            return extensionLogDirectoryPromise;
        }
        createExtHostOutputChannel(name, channelPromise) {
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
        createExtHostLogOutputChannel(name, logLevel, channelPromise) {
            const disposables = new lifecycle_1.DisposableStore();
            const validate = () => {
                if (disposables.isDisposed) {
                    throw new Error('Channel has been closed');
                }
            };
            const onDidChangeLogLevel = disposables.add(new event_1.Emitter());
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
                ...this.createExtHostOutputChannel(name, channelPromise),
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
    exports.ExtHostOutputService = ExtHostOutputService;
    exports.ExtHostOutputService = ExtHostOutputService = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService),
        __param(1, extHostInitDataService_1.IExtHostInitDataService),
        __param(2, extHostFileSystemConsumer_1.IExtHostConsumerFileSystem),
        __param(3, extHostFileSystemInfo_1.IExtHostFileSystemInfo),
        __param(4, log_1.ILoggerService),
        __param(5, log_1.ILogService)
    ], ExtHostOutputService);
    exports.IExtHostOutputService = (0, instantiation_1.createDecorator)('IExtHostOutputService');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdE91dHB1dC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3RPdXRwdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBb0JoRyxNQUFNLG9CQUFxQixTQUFRLDJCQUFxQjtRQUt2RCxJQUFJLFFBQVEsS0FBYyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBSWxELFlBQ1UsRUFBVSxFQUFXLElBQVksRUFDdkIsTUFBZSxFQUNmLEtBQW1DLEVBQzdDLFNBQWdDO1lBRXpDLEtBQUssRUFBRSxDQUFDO1lBTEMsT0FBRSxHQUFGLEVBQUUsQ0FBUTtZQUFXLFNBQUksR0FBSixJQUFJLENBQVE7WUFDdkIsV0FBTSxHQUFOLE1BQU0sQ0FBUztZQUNmLFVBQUssR0FBTCxLQUFLLENBQThCO1lBQzdDLGNBQVMsR0FBVCxTQUFTLENBQXVCO1lBWGxDLFdBQU0sR0FBVyxDQUFDLENBQUM7WUFFbkIsY0FBUyxHQUFZLEtBQUssQ0FBQztZQUc1QixZQUFPLEdBQVksS0FBSyxDQUFDO1lBUy9CLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDakMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzRSxDQUFDO1FBRUQsSUFBSSxRQUFRO1lBQ1gsT0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDeEIsQ0FBQztRQUVELFVBQVUsQ0FBQyxLQUFhO1lBQ3ZCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQzNCLENBQUM7UUFFRCxNQUFNLENBQUMsS0FBYTtZQUNuQixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xCLENBQUM7UUFFRCxLQUFLO1lBQ0osTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUN6QixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsZ0NBQXVCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2xFLENBQUM7UUFFRCxPQUFPLENBQUMsS0FBYTtZQUNwQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDakIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxnQ0FBdUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDbkUsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQ3BCO1FBQ0YsQ0FBQztRQUVELElBQUksQ0FBQyxxQkFBbUQsRUFBRSxhQUF1QjtZQUNoRixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxxQkFBcUIsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1FBQ3JILENBQUM7UUFFRCxJQUFJO1lBQ0gsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzVCLENBQUM7UUFFUyxHQUFHLENBQUMsS0FBZSxFQUFFLE9BQWU7WUFDN0MsSUFBSSxDQUFDLE1BQU0sSUFBSSxpQkFBUSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxVQUFVLENBQUM7WUFDdkQsSUFBQSxTQUFHLEVBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDakMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNwQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLGdDQUF1QixDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzVEO1FBQ0YsQ0FBQztRQUVRLE9BQU87WUFDZixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFaEIsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ3BCLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDN0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7YUFDdEI7UUFDRixDQUFDO0tBRUQ7SUFFRCxNQUFNLHVCQUF3QixTQUFRLG9CQUFvQjtRQUVoRCxVQUFVLENBQUMsS0FBYTtZQUNoQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3BCLENBQUM7S0FFRDtJQUVNLElBQU0sb0JBQW9CLEdBQTFCLE1BQU0sb0JBQW9CO1FBY2hDLFlBQ3FCLFVBQThCLEVBQ3pCLFFBQWtELEVBQy9DLGlCQUE4RCxFQUNsRSxxQkFBOEQsRUFDdEUsYUFBOEMsRUFDakQsVUFBd0M7WUFKWCxhQUFRLEdBQVIsUUFBUSxDQUF5QjtZQUM5QixzQkFBaUIsR0FBakIsaUJBQWlCLENBQTRCO1lBQ2pELDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBd0I7WUFDckQsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQ2hDLGVBQVUsR0FBVixVQUFVLENBQWE7WUFackMsaUNBQTRCLEdBQUcsSUFBSSxHQUFHLEVBQXlCLENBQUM7WUFDekUsYUFBUSxHQUFXLENBQUMsQ0FBQztZQUVaLGFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBMEQsQ0FBQztZQUN0RixxQkFBZ0IsR0FBa0IsSUFBSSxDQUFDO1lBVTlDLElBQUksQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyw4QkFBVyxDQUFDLHVCQUF1QixDQUFDLENBQUM7WUFDdEUsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLGtCQUFrQixJQUFBLHVCQUFnQixFQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN4SyxDQUFDO1FBRUQsa0JBQWtCLENBQUMsZ0JBQStCO1lBQ2pELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztZQUN6QyxLQUFLLE1BQU0sQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDMUMsT0FBTyxDQUFDLE9BQU8sR0FBRyxFQUFFLEtBQUssSUFBSSxDQUFDLGdCQUFnQixDQUFDO2FBQy9DO1FBQ0YsQ0FBQztRQUVELG1CQUFtQixDQUFDLElBQVksRUFBRSxPQUEyQyxFQUFFLFNBQWdDO1lBQzlHLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDbkIsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDVixNQUFNLElBQUksS0FBSyxDQUFDLDRDQUE0QyxDQUFDLENBQUM7YUFDOUQ7WUFDRCxNQUFNLEdBQUcsR0FBRyxPQUFPLE9BQU8sS0FBSyxRQUFRLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUN2RCxNQUFNLFVBQVUsR0FBRyxJQUFBLGdCQUFRLEVBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQzNELElBQUksSUFBQSxnQkFBUSxFQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxFQUFFO2dCQUMvQyxNQUFNLElBQUksS0FBSyxDQUFDLGtEQUFrRCxDQUFDLENBQUM7YUFDcEU7WUFDRCxJQUFJLFFBQThCLENBQUM7WUFDbkMsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLENBQUMsZ0NBQW1CLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdKLElBQUksYUFBYSxFQUFFO2dCQUNsQixRQUFRLEdBQUcsSUFBQSxtQkFBYSxFQUFDLGFBQWEsQ0FBQyxDQUFDO2FBQ3hDO1lBQ0QsTUFBTSxvQkFBb0IsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUN0SixvQkFBb0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ25DLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ3ZDLE9BQU8sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7WUFDeEQsQ0FBQyxDQUFDLENBQUM7WUFDSCxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLElBQUksRUFBRSxRQUFRLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsRUFBaUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksRUFBaUMsb0JBQW9CLENBQUMsQ0FBQztRQUNqUCxDQUFDO1FBRU8sS0FBSyxDQUFDLHFCQUFxQixDQUFDLElBQVksRUFBRSxVQUE4QixFQUFFLFNBQWdDO1lBQ2pILElBQUksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEVBQUU7Z0JBQ2pDLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQzthQUNsSTtZQUNELE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDO1lBQ3BELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNySSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ3hJLE1BQU0sRUFBRSxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsU0FBUyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMxRixPQUFPLElBQUksb0JBQW9CLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztRQUMxRSxDQUFDO1FBRU8sS0FBSyxDQUFDLHdCQUF3QixDQUFDLElBQVksRUFBRSxRQUE4QixFQUFFLFNBQWdDO1lBQ3BILE1BQU0sZUFBZSxHQUFHLE1BQU0sSUFBSSxDQUFDLDJCQUEyQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzFFLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDdEQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUFFLEdBQUcsUUFBUSxNQUFNLENBQUMsQ0FBQztZQUM1RixNQUFNLEVBQUUsR0FBRyxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUMsS0FBSyxJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQ3ZELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxTQUFTLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDdEgsT0FBTyxJQUFJLHVCQUF1QixDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDN0UsQ0FBQztRQUVPLDJCQUEyQixDQUFDLFNBQWdDO1lBQ25FLElBQUksNEJBQTRCLEdBQUcsSUFBSSxDQUFDLDRCQUE0QixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3JHLElBQUksQ0FBQyw0QkFBNEIsRUFBRTtnQkFDbEMsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNqSSxJQUFJLENBQUMsNEJBQTRCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLDRCQUE0QixHQUFHLENBQUMsS0FBSyxJQUFJLEVBQUU7b0JBQzVHLElBQUk7d0JBQ0gsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO3FCQUMxRTtvQkFBQyxPQUFPLEdBQUcsRUFBRTt3QkFDYixJQUFJLElBQUEscUNBQTZCLEVBQUMsR0FBRyxDQUFDLEtBQUssbUNBQTJCLENBQUMsVUFBVSxFQUFFOzRCQUNsRixNQUFNLEdBQUcsQ0FBQzt5QkFDVjtxQkFDRDtvQkFDRCxPQUFPLHFCQUFxQixDQUFDO2dCQUM5QixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDTjtZQUNELE9BQU8sNEJBQTRCLENBQUM7UUFDckMsQ0FBQztRQUVPLDBCQUEwQixDQUFDLElBQVksRUFBRSxjQUE2QztZQUM3RixJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7WUFDckIsTUFBTSxRQUFRLEdBQUcsR0FBRyxFQUFFO2dCQUNyQixJQUFJLFFBQVEsRUFBRTtvQkFDYixNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7aUJBQzNDO1lBQ0YsQ0FBQyxDQUFDO1lBQ0YsT0FBTztnQkFDTixJQUFJLElBQUksS0FBYSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ25DLE1BQU0sQ0FBQyxLQUFhO29CQUNuQixRQUFRLEVBQUUsQ0FBQztvQkFDWCxjQUFjLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUN2RCxDQUFDO2dCQUNELFVBQVUsQ0FBQyxLQUFhO29CQUN2QixRQUFRLEVBQUUsQ0FBQztvQkFDWCxjQUFjLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUMzRCxDQUFDO2dCQUNELEtBQUs7b0JBQ0osUUFBUSxFQUFFLENBQUM7b0JBQ1gsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUNqRCxDQUFDO2dCQUNELE9BQU8sQ0FBQyxLQUFhO29CQUNwQixRQUFRLEVBQUUsQ0FBQztvQkFDWCxjQUFjLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUN4RCxDQUFDO2dCQUNELElBQUksQ0FBQyxxQkFBbUQsRUFBRSxhQUF1QjtvQkFDaEYsUUFBUSxFQUFFLENBQUM7b0JBQ1gsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQztnQkFDcEYsQ0FBQztnQkFDRCxJQUFJO29CQUNILFFBQVEsRUFBRSxDQUFDO29CQUNYLGNBQWMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDaEQsQ0FBQztnQkFDRCxPQUFPO29CQUNOLFFBQVEsR0FBRyxJQUFJLENBQUM7b0JBQ2hCLGNBQWMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztnQkFDbkQsQ0FBQzthQUNELENBQUM7UUFDSCxDQUFDO1FBRU8sNkJBQTZCLENBQUMsSUFBWSxFQUFFLFFBQWtCLEVBQUUsY0FBNkM7WUFDcEgsTUFBTSxXQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFDMUMsTUFBTSxRQUFRLEdBQUcsR0FBRyxFQUFFO2dCQUNyQixJQUFJLFdBQVcsQ0FBQyxVQUFVLEVBQUU7b0JBQzNCLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztpQkFDM0M7WUFDRixDQUFDLENBQUM7WUFDRixNQUFNLG1CQUFtQixHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxlQUFPLEVBQVksQ0FBQyxDQUFDO1lBQ3JFLFNBQVMsV0FBVyxDQUFDLFdBQXFCO2dCQUN6QyxRQUFRLEdBQUcsV0FBVyxDQUFDO2dCQUN2QixtQkFBbUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDdkMsQ0FBQztZQUNELGNBQWMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQzdCLFdBQVcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3pCLElBQUksT0FBTyxDQUFDLFFBQVEsS0FBSyxRQUFRLEVBQUU7b0JBQ2xDLFdBQVcsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQzlCO2dCQUNELFdBQVcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuRSxDQUFDLENBQUMsQ0FBQztZQUNILE9BQU87Z0JBQ04sR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQztnQkFDeEQsSUFBSSxRQUFRLEtBQUssT0FBTyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNuQyxtQkFBbUIsRUFBRSxtQkFBbUIsQ0FBQyxLQUFLO2dCQUM5QyxLQUFLLENBQUMsS0FBYSxFQUFFLEdBQUcsSUFBVztvQkFDbEMsUUFBUSxFQUFFLENBQUM7b0JBQ1gsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDL0QsQ0FBQztnQkFDRCxLQUFLLENBQUMsS0FBYSxFQUFFLEdBQUcsSUFBVztvQkFDbEMsUUFBUSxFQUFFLENBQUM7b0JBQ1gsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDL0QsQ0FBQztnQkFDRCxJQUFJLENBQUMsS0FBYSxFQUFFLEdBQUcsSUFBVztvQkFDakMsUUFBUSxFQUFFLENBQUM7b0JBQ1gsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDOUQsQ0FBQztnQkFDRCxJQUFJLENBQUMsS0FBYSxFQUFFLEdBQUcsSUFBVztvQkFDakMsUUFBUSxFQUFFLENBQUM7b0JBQ1gsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDOUQsQ0FBQztnQkFDRCxLQUFLLENBQUMsS0FBcUIsRUFBRSxHQUFHLElBQVc7b0JBQzFDLFFBQVEsRUFBRSxDQUFDO29CQUNYLGNBQWMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQy9ELENBQUM7Z0JBQ0QsT0FBTztvQkFDTixXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ3ZCLENBQUM7YUFDRCxDQUFDO1FBQ0gsQ0FBQztLQUNELENBQUE7SUF0TFksb0RBQW9CO21DQUFwQixvQkFBb0I7UUFlOUIsV0FBQSxzQ0FBa0IsQ0FBQTtRQUNsQixXQUFBLGdEQUF1QixDQUFBO1FBQ3ZCLFdBQUEsc0RBQTBCLENBQUE7UUFDMUIsV0FBQSw4Q0FBc0IsQ0FBQTtRQUN0QixXQUFBLG9CQUFjLENBQUE7UUFDZCxXQUFBLGlCQUFXLENBQUE7T0FwQkQsb0JBQW9CLENBc0xoQztJQUdZLFFBQUEscUJBQXFCLEdBQUcsSUFBQSwrQkFBZSxFQUF3Qix1QkFBdUIsQ0FBQyxDQUFDIn0=