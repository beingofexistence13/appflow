var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "os", "vs/base/common/async", "vs/base/common/json", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/uri", "vs/base/node/id", "vs/base/node/pfs", "vs/base/node/ps", "vs/platform/diagnostics/common/diagnostics", "vs/platform/files/common/files", "vs/platform/product/common/productService", "vs/platform/telemetry/common/telemetry"], function (require, exports, osLib, async_1, json_1, network_1, path_1, platform_1, uri_1, id_1, pfs_1, ps_1, diagnostics_1, files_1, productService_1, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DiagnosticsService = exports.collectLaunchConfigs = exports.getMachineInfo = exports.collectWorkspaceStats = void 0;
    const worksapceStatsCache = new Map();
    async function collectWorkspaceStats(folder, filter) {
        const cacheKey = `${folder}::${filter.join(':')}`;
        const cached = worksapceStatsCache.get(cacheKey);
        if (cached) {
            return cached;
        }
        const configFilePatterns = [
            { tag: 'grunt.js', filePattern: /^gruntfile\.js$/i },
            { tag: 'gulp.js', filePattern: /^gulpfile\.js$/i },
            { tag: 'tsconfig.json', filePattern: /^tsconfig\.json$/i },
            { tag: 'package.json', filePattern: /^package\.json$/i },
            { tag: 'jsconfig.json', filePattern: /^jsconfig\.json$/i },
            { tag: 'tslint.json', filePattern: /^tslint\.json$/i },
            { tag: 'eslint.json', filePattern: /^eslint\.json$/i },
            { tag: 'tasks.json', filePattern: /^tasks\.json$/i },
            { tag: 'launch.json', filePattern: /^launch\.json$/i },
            { tag: 'settings.json', filePattern: /^settings\.json$/i },
            { tag: 'webpack.config.js', filePattern: /^webpack\.config\.js$/i },
            { tag: 'project.json', filePattern: /^project\.json$/i },
            { tag: 'makefile', filePattern: /^makefile$/i },
            { tag: 'sln', filePattern: /^.+\.sln$/i },
            { tag: 'csproj', filePattern: /^.+\.csproj$/i },
            { tag: 'cmake', filePattern: /^.+\.cmake$/i },
            { tag: 'github-actions', filePattern: /^.+\.ya?ml$/i, relativePathPattern: /^\.github(?:\/|\\)workflows$/i },
            { tag: 'devcontainer.json', filePattern: /^devcontainer\.json$/i },
            { tag: 'dockerfile', filePattern: /^(dockerfile|docker\-compose\.ya?ml)$/i }
        ];
        const fileTypes = new Map();
        const configFiles = new Map();
        const MAX_FILES = 20000;
        function collect(root, dir, filter, token) {
            const relativePath = dir.substring(root.length + 1);
            return async_1.Promises.withAsyncBody(async (resolve) => {
                let files;
                try {
                    files = await pfs_1.Promises.readdir(dir, { withFileTypes: true });
                }
                catch (error) {
                    // Ignore folders that can't be read
                    resolve();
                    return;
                }
                if (token.count >= MAX_FILES) {
                    token.count += files.length;
                    token.maxReached = true;
                    resolve();
                    return;
                }
                let pending = files.length;
                if (pending === 0) {
                    resolve();
                    return;
                }
                let filesToRead = files;
                if (token.count + files.length > MAX_FILES) {
                    token.maxReached = true;
                    pending = MAX_FILES - token.count;
                    filesToRead = files.slice(0, pending);
                }
                token.count += files.length;
                for (const file of filesToRead) {
                    if (file.isDirectory()) {
                        if (!filter.includes(file.name)) {
                            await collect(root, (0, path_1.join)(dir, file.name), filter, token);
                        }
                        if (--pending === 0) {
                            resolve();
                            return;
                        }
                    }
                    else {
                        const index = file.name.lastIndexOf('.');
                        if (index >= 0) {
                            const fileType = file.name.substring(index + 1);
                            if (fileType) {
                                fileTypes.set(fileType, (fileTypes.get(fileType) ?? 0) + 1);
                            }
                        }
                        for (const configFile of configFilePatterns) {
                            if (configFile.relativePathPattern?.test(relativePath) !== false && configFile.filePattern.test(file.name)) {
                                configFiles.set(configFile.tag, (configFiles.get(configFile.tag) ?? 0) + 1);
                            }
                        }
                        if (--pending === 0) {
                            resolve();
                            return;
                        }
                    }
                }
            });
        }
        const statsPromise = async_1.Promises.withAsyncBody(async (resolve) => {
            const token = { count: 0, maxReached: false };
            await collect(folder, folder, filter, token);
            const launchConfigs = await collectLaunchConfigs(folder);
            resolve({
                configFiles: asSortedItems(configFiles),
                fileTypes: asSortedItems(fileTypes),
                fileCount: token.count,
                maxFilesReached: token.maxReached,
                launchConfigFiles: launchConfigs
            });
        });
        worksapceStatsCache.set(cacheKey, statsPromise);
        return statsPromise;
    }
    exports.collectWorkspaceStats = collectWorkspaceStats;
    function asSortedItems(items) {
        return Array.from(items.entries(), ([name, count]) => ({ name: name, count: count }))
            .sort((a, b) => b.count - a.count);
    }
    function getMachineInfo() {
        const machineInfo = {
            os: `${osLib.type()} ${osLib.arch()} ${osLib.release()}`,
            memory: `${(osLib.totalmem() / files_1.ByteSize.GB).toFixed(2)}GB (${(osLib.freemem() / files_1.ByteSize.GB).toFixed(2)}GB free)`,
            vmHint: `${Math.round((id_1.virtualMachineHint.value() * 100))}%`,
        };
        const cpus = osLib.cpus();
        if (cpus && cpus.length > 0) {
            machineInfo.cpus = `${cpus[0].model} (${cpus.length} x ${cpus[0].speed})`;
        }
        return machineInfo;
    }
    exports.getMachineInfo = getMachineInfo;
    async function collectLaunchConfigs(folder) {
        try {
            const launchConfigs = new Map();
            const launchConfig = (0, path_1.join)(folder, '.vscode', 'launch.json');
            const contents = await pfs_1.Promises.readFile(launchConfig);
            const errors = [];
            const json = (0, json_1.parse)(contents.toString(), errors);
            if (errors.length) {
                console.log(`Unable to parse ${launchConfig}`);
                return [];
            }
            if ((0, json_1.getNodeType)(json) === 'object' && json['configurations']) {
                for (const each of json['configurations']) {
                    const type = each['type'];
                    if (type) {
                        if (launchConfigs.has(type)) {
                            launchConfigs.set(type, launchConfigs.get(type) + 1);
                        }
                        else {
                            launchConfigs.set(type, 1);
                        }
                    }
                }
            }
            return asSortedItems(launchConfigs);
        }
        catch (error) {
            return [];
        }
    }
    exports.collectLaunchConfigs = collectLaunchConfigs;
    let DiagnosticsService = class DiagnosticsService {
        constructor(telemetryService, productService) {
            this.telemetryService = telemetryService;
            this.productService = productService;
        }
        formatMachineInfo(info) {
            const output = [];
            output.push(`OS Version:       ${info.os}`);
            output.push(`CPUs:             ${info.cpus}`);
            output.push(`Memory (System):  ${info.memory}`);
            output.push(`VM:               ${info.vmHint}`);
            return output.join('\n');
        }
        formatEnvironment(info) {
            const output = [];
            output.push(`Version:          ${this.productService.nameShort} ${this.productService.version} (${this.productService.commit || 'Commit unknown'}, ${this.productService.date || 'Date unknown'})`);
            output.push(`OS Version:       ${osLib.type()} ${osLib.arch()} ${osLib.release()}`);
            const cpus = osLib.cpus();
            if (cpus && cpus.length > 0) {
                output.push(`CPUs:             ${cpus[0].model} (${cpus.length} x ${cpus[0].speed})`);
            }
            output.push(`Memory (System):  ${(osLib.totalmem() / files_1.ByteSize.GB).toFixed(2)}GB (${(osLib.freemem() / files_1.ByteSize.GB).toFixed(2)}GB free)`);
            if (!platform_1.isWindows) {
                output.push(`Load (avg):       ${osLib.loadavg().map(l => Math.round(l)).join(', ')}`); // only provided on Linux/macOS
            }
            output.push(`VM:               ${Math.round((id_1.virtualMachineHint.value() * 100))}%`);
            output.push(`Screen Reader:    ${info.screenReader ? 'yes' : 'no'}`);
            output.push(`Process Argv:     ${info.mainArguments.join(' ')}`);
            output.push(`GPU Status:       ${this.expandGPUFeatures(info.gpuFeatureStatus)}`);
            return output.join('\n');
        }
        async getPerformanceInfo(info, remoteData) {
            return Promise.all([(0, ps_1.listProcesses)(info.mainPID), this.formatWorkspaceMetadata(info)]).then(async (result) => {
                let [rootProcess, workspaceInfo] = result;
                let processInfo = this.formatProcessList(info, rootProcess);
                remoteData.forEach(diagnostics => {
                    if ((0, diagnostics_1.isRemoteDiagnosticError)(diagnostics)) {
                        processInfo += `\n${diagnostics.errorMessage}`;
                        workspaceInfo += `\n${diagnostics.errorMessage}`;
                    }
                    else {
                        processInfo += `\n\nRemote: ${diagnostics.hostName}`;
                        if (diagnostics.processes) {
                            processInfo += `\n${this.formatProcessList(info, diagnostics.processes)}`;
                        }
                        if (diagnostics.workspaceMetadata) {
                            workspaceInfo += `\n|  Remote: ${diagnostics.hostName}`;
                            for (const folder of Object.keys(diagnostics.workspaceMetadata)) {
                                const metadata = diagnostics.workspaceMetadata[folder];
                                let countMessage = `${metadata.fileCount} files`;
                                if (metadata.maxFilesReached) {
                                    countMessage = `more than ${countMessage}`;
                                }
                                workspaceInfo += `|    Folder (${folder}): ${countMessage}`;
                                workspaceInfo += this.formatWorkspaceStats(metadata);
                            }
                        }
                    }
                });
                return {
                    processInfo,
                    workspaceInfo
                };
            });
        }
        async getSystemInfo(info, remoteData) {
            const { memory, vmHint, os, cpus } = getMachineInfo();
            const systemInfo = {
                os,
                memory,
                cpus,
                vmHint,
                processArgs: `${info.mainArguments.join(' ')}`,
                gpuStatus: info.gpuFeatureStatus,
                screenReader: `${info.screenReader ? 'yes' : 'no'}`,
                remoteData
            };
            if (!platform_1.isWindows) {
                systemInfo.load = `${osLib.loadavg().map(l => Math.round(l)).join(', ')}`;
            }
            if (platform_1.isLinux) {
                systemInfo.linuxEnv = {
                    desktopSession: process.env['DESKTOP_SESSION'],
                    xdgSessionDesktop: process.env['XDG_SESSION_DESKTOP'],
                    xdgCurrentDesktop: process.env['XDG_CURRENT_DESKTOP'],
                    xdgSessionType: process.env['XDG_SESSION_TYPE']
                };
            }
            return Promise.resolve(systemInfo);
        }
        async getDiagnostics(info, remoteDiagnostics) {
            const output = [];
            return (0, ps_1.listProcesses)(info.mainPID).then(async (rootProcess) => {
                // Environment Info
                output.push('');
                output.push(this.formatEnvironment(info));
                // Process List
                output.push('');
                output.push(this.formatProcessList(info, rootProcess));
                // Workspace Stats
                if (info.windows.some(window => window.folderURIs && window.folderURIs.length > 0 && !window.remoteAuthority)) {
                    output.push('');
                    output.push('Workspace Stats: ');
                    output.push(await this.formatWorkspaceMetadata(info));
                }
                remoteDiagnostics.forEach(diagnostics => {
                    if ((0, diagnostics_1.isRemoteDiagnosticError)(diagnostics)) {
                        output.push(`\n${diagnostics.errorMessage}`);
                    }
                    else {
                        output.push('\n\n');
                        output.push(`Remote:           ${diagnostics.hostName}`);
                        output.push(this.formatMachineInfo(diagnostics.machineInfo));
                        if (diagnostics.processes) {
                            output.push(this.formatProcessList(info, diagnostics.processes));
                        }
                        if (diagnostics.workspaceMetadata) {
                            for (const folder of Object.keys(diagnostics.workspaceMetadata)) {
                                const metadata = diagnostics.workspaceMetadata[folder];
                                let countMessage = `${metadata.fileCount} files`;
                                if (metadata.maxFilesReached) {
                                    countMessage = `more than ${countMessage}`;
                                }
                                output.push(`Folder (${folder}): ${countMessage}`);
                                output.push(this.formatWorkspaceStats(metadata));
                            }
                        }
                    }
                });
                output.push('');
                output.push('');
                return output.join('\n');
            });
        }
        formatWorkspaceStats(workspaceStats) {
            const output = [];
            const lineLength = 60;
            let col = 0;
            const appendAndWrap = (name, count) => {
                const item = ` ${name}(${count})`;
                if (col + item.length > lineLength) {
                    output.push(line);
                    line = '|                 ';
                    col = line.length;
                }
                else {
                    col += item.length;
                }
                line += item;
            };
            // File Types
            let line = '|      File types:';
            const maxShown = 10;
            const max = workspaceStats.fileTypes.length > maxShown ? maxShown : workspaceStats.fileTypes.length;
            for (let i = 0; i < max; i++) {
                const item = workspaceStats.fileTypes[i];
                appendAndWrap(item.name, item.count);
            }
            output.push(line);
            // Conf Files
            if (workspaceStats.configFiles.length >= 0) {
                line = '|      Conf files:';
                col = 0;
                workspaceStats.configFiles.forEach((item) => {
                    appendAndWrap(item.name, item.count);
                });
                output.push(line);
            }
            if (workspaceStats.launchConfigFiles.length > 0) {
                let line = '|      Launch Configs:';
                workspaceStats.launchConfigFiles.forEach(each => {
                    const item = each.count > 1 ? ` ${each.name}(${each.count})` : ` ${each.name}`;
                    line += item;
                });
                output.push(line);
            }
            return output.join('\n');
        }
        expandGPUFeatures(gpuFeatures) {
            const longestFeatureName = Math.max(...Object.keys(gpuFeatures).map(feature => feature.length));
            // Make columns aligned by adding spaces after feature name
            return Object.keys(gpuFeatures).map(feature => `${feature}:  ${' '.repeat(longestFeatureName - feature.length)}  ${gpuFeatures[feature]}`).join('\n                  ');
        }
        formatWorkspaceMetadata(info) {
            const output = [];
            const workspaceStatPromises = [];
            info.windows.forEach(window => {
                if (window.folderURIs.length === 0 || !!window.remoteAuthority) {
                    return;
                }
                output.push(`|  Window (${window.title})`);
                window.folderURIs.forEach(uriComponents => {
                    const folderUri = uri_1.URI.revive(uriComponents);
                    if (folderUri.scheme === network_1.Schemas.file) {
                        const folder = folderUri.fsPath;
                        workspaceStatPromises.push(collectWorkspaceStats(folder, ['node_modules', '.git']).then(stats => {
                            let countMessage = `${stats.fileCount} files`;
                            if (stats.maxFilesReached) {
                                countMessage = `more than ${countMessage}`;
                            }
                            output.push(`|    Folder (${(0, path_1.basename)(folder)}): ${countMessage}`);
                            output.push(this.formatWorkspaceStats(stats));
                        }).catch(error => {
                            output.push(`|      Error: Unable to collect workspace stats for folder ${folder} (${error.toString()})`);
                        }));
                    }
                    else {
                        output.push(`|    Folder (${folderUri.toString()}): Workspace stats not available.`);
                    }
                });
            });
            return Promise.all(workspaceStatPromises)
                .then(_ => output.join('\n'))
                .catch(e => `Unable to collect workspace stats: ${e}`);
        }
        formatProcessList(info, rootProcess) {
            const mapProcessToName = new Map();
            info.windows.forEach(window => mapProcessToName.set(window.pid, `window [${window.id}] (${window.title})`));
            info.pidToNames.forEach(({ pid, name }) => mapProcessToName.set(pid, name));
            const output = [];
            output.push('CPU %\tMem MB\t   PID\tProcess');
            if (rootProcess) {
                this.formatProcessItem(info.mainPID, mapProcessToName, output, rootProcess, 0);
            }
            return output.join('\n');
        }
        formatProcessItem(mainPid, mapProcessToName, output, item, indent) {
            const isRoot = (indent === 0);
            // Format name with indent
            let name;
            if (isRoot) {
                name = item.pid === mainPid ? `${this.productService.applicationName} main` : 'remote agent';
            }
            else {
                if (mapProcessToName.has(item.pid)) {
                    name = mapProcessToName.get(item.pid);
                }
                else {
                    name = `${'  '.repeat(indent)} ${item.name}`;
                }
            }
            const memory = process.platform === 'win32' ? item.mem : (osLib.totalmem() * (item.mem / 100));
            output.push(`${item.load.toFixed(0).padStart(5, ' ')}\t${(memory / files_1.ByteSize.MB).toFixed(0).padStart(6, ' ')}\t${item.pid.toFixed(0).padStart(6, ' ')}\t${name}`);
            // Recurse into children if any
            if (Array.isArray(item.children)) {
                item.children.forEach(child => this.formatProcessItem(mainPid, mapProcessToName, output, child, indent + 1));
            }
        }
        async getWorkspaceFileExtensions(workspace) {
            const items = new Set();
            for (const { uri } of workspace.folders) {
                const folderUri = uri_1.URI.revive(uri);
                if (folderUri.scheme !== network_1.Schemas.file) {
                    continue;
                }
                const folder = folderUri.fsPath;
                try {
                    const stats = await collectWorkspaceStats(folder, ['node_modules', '.git']);
                    stats.fileTypes.forEach(item => items.add(item.name));
                }
                catch { }
            }
            return { extensions: [...items] };
        }
        async reportWorkspaceStats(workspace) {
            for (const { uri } of workspace.folders) {
                const folderUri = uri_1.URI.revive(uri);
                if (folderUri.scheme !== network_1.Schemas.file) {
                    continue;
                }
                const folder = folderUri.fsPath;
                try {
                    const stats = await collectWorkspaceStats(folder, ['node_modules', '.git']);
                    this.telemetryService.publicLog2('workspace.stats', {
                        'workspace.id': workspace.telemetryId,
                        rendererSessionId: workspace.rendererSessionId
                    });
                    stats.fileTypes.forEach(e => {
                        this.telemetryService.publicLog2('workspace.stats.file', {
                            rendererSessionId: workspace.rendererSessionId,
                            type: e.name,
                            count: e.count
                        });
                    });
                    stats.launchConfigFiles.forEach(e => {
                        this.telemetryService.publicLog2('workspace.stats.launchConfigFile', {
                            rendererSessionId: workspace.rendererSessionId,
                            type: e.name,
                            count: e.count
                        });
                    });
                    stats.configFiles.forEach(e => {
                        this.telemetryService.publicLog2('workspace.stats.configFiles', {
                            rendererSessionId: workspace.rendererSessionId,
                            type: e.name,
                            count: e.count
                        });
                    });
                }
                catch {
                    // Report nothing if collecting metadata fails.
                }
            }
        }
    };
    exports.DiagnosticsService = DiagnosticsService;
    exports.DiagnosticsService = DiagnosticsService = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, productService_1.IProductService)
    ], DiagnosticsService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhZ25vc3RpY3NTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZGlhZ25vc3RpY3Mvbm9kZS9kaWFnbm9zdGljc1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQTJCQSxNQUFNLG1CQUFtQixHQUFHLElBQUksR0FBRyxFQUFtQyxDQUFDO0lBQ2hFLEtBQUssVUFBVSxxQkFBcUIsQ0FBQyxNQUFjLEVBQUUsTUFBZ0I7UUFDM0UsTUFBTSxRQUFRLEdBQUcsR0FBRyxNQUFNLEtBQUssTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ2xELE1BQU0sTUFBTSxHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNqRCxJQUFJLE1BQU0sRUFBRTtZQUNYLE9BQU8sTUFBTSxDQUFDO1NBQ2Q7UUFFRCxNQUFNLGtCQUFrQixHQUF5QjtZQUNoRCxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLGtCQUFrQixFQUFFO1lBQ3BELEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQUU7WUFDbEQsRUFBRSxHQUFHLEVBQUUsZUFBZSxFQUFFLFdBQVcsRUFBRSxtQkFBbUIsRUFBRTtZQUMxRCxFQUFFLEdBQUcsRUFBRSxjQUFjLEVBQUUsV0FBVyxFQUFFLGtCQUFrQixFQUFFO1lBQ3hELEVBQUUsR0FBRyxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUUsbUJBQW1CLEVBQUU7WUFDMUQsRUFBRSxHQUFHLEVBQUUsYUFBYSxFQUFFLFdBQVcsRUFBRSxpQkFBaUIsRUFBRTtZQUN0RCxFQUFFLEdBQUcsRUFBRSxhQUFhLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFFO1lBQ3RELEVBQUUsR0FBRyxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsZ0JBQWdC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