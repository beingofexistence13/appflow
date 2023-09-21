"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const extension_telemetry_1 = __importDefault(require("@vscode/extension-telemetry"));
const fs = __importStar(require("fs"));
const vscode = __importStar(require("vscode"));
const api_1 = require("./api");
const commandManager_1 = require("./commands/commandManager");
const index_1 = require("./commands/index");
const experimentTelemetryReporter_1 = require("./experimentTelemetryReporter");
const experimentationService_1 = require("./experimentationService");
const lazyClientHost_1 = require("./lazyClientHost");
const cancellation_electron_1 = require("./tsServer/cancellation.electron");
const logDirectoryProvider_electron_1 = require("./tsServer/logDirectoryProvider.electron");
const serverProcess_electron_1 = require("./tsServer/serverProcess.electron");
const versionProvider_electron_1 = require("./tsServer/versionProvider.electron");
const activeJsTsEditorTracker_1 = require("./ui/activeJsTsEditorTracker");
const configuration_electron_1 = require("./configuration/configuration.electron");
const fs_electron_1 = require("./utils/fs.electron");
const logger_1 = require("./logging/logger");
const packageInfo_1 = require("./utils/packageInfo");
const plugins_1 = require("./tsServer/plugins");
const temp = __importStar(require("./utils/temp.electron"));
function activate(context) {
    const pluginManager = new plugins_1.PluginManager();
    context.subscriptions.push(pluginManager);
    const commandManager = new commandManager_1.CommandManager();
    context.subscriptions.push(commandManager);
    const onCompletionAccepted = new vscode.EventEmitter();
    context.subscriptions.push(onCompletionAccepted);
    const logDirectoryProvider = new logDirectoryProvider_electron_1.NodeLogDirectoryProvider(context);
    const versionProvider = new versionProvider_electron_1.DiskTypeScriptVersionProvider();
    const activeJsTsEditorTracker = new activeJsTsEditorTracker_1.ActiveJsTsEditorTracker();
    context.subscriptions.push(activeJsTsEditorTracker);
    let experimentTelemetryReporter;
    const packageInfo = (0, packageInfo_1.getPackageInfo)(context);
    if (packageInfo) {
        const { name: id, version, aiKey } = packageInfo;
        const vscTelemetryReporter = new extension_telemetry_1.default(aiKey);
        experimentTelemetryReporter = new experimentTelemetryReporter_1.ExperimentationTelemetryReporter(vscTelemetryReporter);
        context.subscriptions.push(experimentTelemetryReporter);
        // Currently we have no experiments, but creating the service adds the appropriate
        // shared properties to the ExperimentationTelemetryReporter we just created.
        new experimentationService_1.ExperimentationService(experimentTelemetryReporter, id, version, context.globalState);
    }
    const logger = new logger_1.Logger();
    const lazyClientHost = (0, lazyClientHost_1.createLazyClientHost)(context, (0, fs_electron_1.onCaseInsensitiveFileSystem)(), {
        pluginManager,
        commandManager,
        logDirectoryProvider,
        cancellerFactory: cancellation_electron_1.nodeRequestCancellerFactory,
        versionProvider,
        processFactory: new serverProcess_electron_1.ElectronServiceProcessFactory(),
        activeJsTsEditorTracker,
        serviceConfigurationProvider: new configuration_electron_1.ElectronServiceConfigurationProvider(),
        experimentTelemetryReporter,
        logger,
    }, item => {
        onCompletionAccepted.fire(item);
    });
    (0, index_1.registerBaseCommands)(commandManager, lazyClientHost, pluginManager, activeJsTsEditorTracker);
    Promise.resolve().then(() => __importStar(require('./task/taskProvider'))).then(module => {
        context.subscriptions.push(module.register(lazyClientHost.map(x => x.serviceClient)));
    });
    Promise.resolve().then(() => __importStar(require('./languageFeatures/tsconfig'))).then(module => {
        context.subscriptions.push(module.register());
    });
    context.subscriptions.push((0, lazyClientHost_1.lazilyActivateClient)(lazyClientHost, pluginManager, activeJsTsEditorTracker));
    return (0, api_1.getExtensionApi)(onCompletionAccepted.event, pluginManager);
}
exports.activate = activate;
function deactivate() {
    fs.rmSync(temp.getInstanceTempDir(), { recursive: true, force: true });
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map