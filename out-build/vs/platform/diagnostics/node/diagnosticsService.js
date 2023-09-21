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
    exports.$wr = exports.$vr = exports.$ur = exports.$tr = void 0;
    const worksapceStatsCache = new Map();
    async function $tr(folder, filter) {
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
                            await collect(root, (0, path_1.$9d)(dir, file.name), filter, token);
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
            const launchConfigs = await $vr(folder);
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
    exports.$tr = $tr;
    function asSortedItems(items) {
        return Array.from(items.entries(), ([name, count]) => ({ name: name, count: count }))
            .sort((a, b) => b.count - a.count);
    }
    function $ur() {
        const machineInfo = {
            os: `${osLib.type()} ${osLib.arch()} ${osLib.release()}`,
            memory: `${(osLib.totalmem() / files_1.$Ak.GB).toFixed(2)}GB (${(osLib.freemem() / files_1.$Ak.GB).toFixed(2)}GB free)`,
            vmHint: `${Math.round((id_1.$Hm.value() * 100))}%`,
        };
        const cpus = osLib.cpus();
        if (cpus && cpus.length > 0) {
            machineInfo.cpus = `${cpus[0].model} (${cpus.length} x ${cpus[0].speed})`;
        }
        return machineInfo;
    }
    exports.$ur = $ur;
    async function $vr(folder) {
        try {
            const launchConfigs = new Map();
            const launchConfig = (0, path_1.$9d)(folder, '.vscode', 'launch.json');
            const contents = await pfs_1.Promises.readFile(launchConfig);
            const errors = [];
            const json = (0, json_1.$Lm)(contents.toString(), errors);
            if (errors.length) {
                console.log(`Unable to parse ${launchConfig}`);
                return [];
            }
            if ((0, json_1.$Um)(json) === 'object' && json['configurations']) {
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
    exports.$vr = $vr;
    let $wr = class $wr {
        constructor(c, d) {
            this.c = c;
            this.d = d;
        }
        f(info) {
            const output = [];
            output.push(`OS Version:       ${info.os}`);
            output.push(`CPUs:             ${info.cpus}`);
            output.push(`Memory (System):  ${info.memory}`);
            output.push(`VM:               ${info.vmHint}`);
            return output.join('\n');
        }
        g(info) {
            const output = [];
            output.push(`Version:          ${this.d.nameShort} ${this.d.version} (${this.d.commit || 'Commit unknown'}, ${this.d.date || 'Date unknown'})`);
            output.push(`OS Version:       ${osLib.type()} ${osLib.arch()} ${osLib.release()}`);
            const cpus = osLib.cpus();
            if (cpus && cpus.length > 0) {
                output.push(`CPUs:             ${cpus[0].model} (${cpus.length} x ${cpus[0].speed})`);
            }
            output.push(`Memory (System):  ${(osLib.totalmem() / files_1.$Ak.GB).toFixed(2)}GB (${(osLib.freemem() / files_1.$Ak.GB).toFixed(2)}GB free)`);
            if (!platform_1.$i) {
                output.push(`Load (avg):       ${osLib.loadavg().map(l => Math.round(l)).join(', ')}`); // only provided on Linux/macOS
            }
            output.push(`VM:               ${Math.round((id_1.$Hm.value() * 100))}%`);
            output.push(`Screen Reader:    ${info.screenReader ? 'yes' : 'no'}`);
            output.push(`Process Argv:     ${info.mainArguments.join(' ')}`);
            output.push(`GPU Status:       ${this.j(info.gpuFeatureStatus)}`);
            return output.join('\n');
        }
        async getPerformanceInfo(info, remoteData) {
            return Promise.all([(0, ps_1.$sr)(info.mainPID), this.k(info)]).then(async (result) => {
                let [rootProcess, workspaceInfo] = result;
                let processInfo = this.m(info, rootProcess);
                remoteData.forEach(diagnostics => {
                    if ((0, diagnostics_1.$hm)(diagnostics)) {
                        processInfo += `\n${diagnostics.errorMessage}`;
                        workspaceInfo += `\n${diagnostics.errorMessage}`;
                    }
                    else {
                        processInfo += `\n\nRemote: ${diagnostics.hostName}`;
                        if (diagnostics.processes) {
                            processInfo += `\n${this.m(info, diagnostics.processes)}`;
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
                                workspaceInfo += this.h(metadata);
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
            const { memory, vmHint, os, cpus } = $ur();
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
            if (!platform_1.$i) {
                systemInfo.load = `${osLib.loadavg().map(l => Math.round(l)).join(', ')}`;
            }
            if (platform_1.$k) {
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
            return (0, ps_1.$sr)(info.mainPID).then(async (rootProcess) => {
                // Environment Info
                output.push('');
                output.push(this.g(info));
                // Process List
                output.push('');
                output.push(this.m(info, rootProcess));
                // Workspace Stats
                if (info.windows.some(window => window.folderURIs && window.folderURIs.length > 0 && !window.remoteAuthority)) {
                    output.push('');
                    output.push('Workspace Stats: ');
                    output.push(await this.k(info));
                }
                remoteDiagnostics.forEach(diagnostics => {
                    if ((0, diagnostics_1.$hm)(diagnostics)) {
                        output.push(`\n${diagnostics.errorMessage}`);
                    }
                    else {
                        output.push('\n\n');
                        output.push(`Remote:           ${diagnostics.hostName}`);
                        output.push(this.f(diagnostics.machineInfo));
                        if (diagnostics.processes) {
                            output.push(this.m(info, diagnostics.processes));
                        }
                        if (diagnostics.workspaceMetadata) {
                            for (const folder of Object.keys(diagnostics.workspaceMetadata)) {
                                const metadata = diagnostics.workspaceMetadata[folder];
                                let countMessage = `${metadata.fileCount} files`;
                                if (metadata.maxFilesReached) {
                                    countMessage = `more than ${countMessage}`;
                                }
                                output.push(`Folder (${folder}): ${countMessage}`);
                                output.push(this.h(metadata));
                            }
                        }
                    }
                });
                output.push('');
                output.push('');
                return output.join('\n');
            });
        }
        h(workspaceStats) {
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
        j(gpuFeatures) {
            const longestFeatureName = Math.max(...Object.keys(gpuFeatures).map(feature => feature.length));
            // Make columns aligned by adding spaces after feature name
            return Object.keys(gpuFeatures).map(feature => `${feature}:  ${' '.repeat(longestFeatureName - feature.length)}  ${gpuFeatures[feature]}`).join('\n                  ');
        }
        k(info) {
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
                        workspaceStatPromises.push($tr(folder, ['node_modules', '.git']).then(stats => {
                            let countMessage = `${stats.fileCount} files`;
                            if (stats.maxFilesReached) {
                                countMessage = `more than ${countMessage}`;
                            }
                            output.push(`|    Folder (${(0, path_1.$ae)(folder)}): ${countMessage}`);
                            output.push(this.h(stats));
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
        m(info, rootProcess) {
            const mapProcessToName = new Map();
            info.windows.forEach(window => mapProcessToName.set(window.pid, `window [${window.id}] (${window.title})`));
            info.pidToNames.forEach(({ pid, name }) => mapProcessToName.set(pid, name));
            const output = [];
            output.push('CPU %\tMem MB\t   PID\tProcess');
            if (rootProcess) {
                this.n(info.mainPID, mapProcessToName, output, rootProcess, 0);
            }
            return output.join('\n');
        }
        n(mainPid, mapProcessToName, output, item, indent) {
            const isRoot = (indent === 0);
            // Format name with indent
            let name;
            if (isRoot) {
                name = item.pid === mainPid ? `${this.d.applicationName} main` : 'remote agent';
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
            output.push(`${item.load.toFixed(0).padStart(5, ' ')}\t${(memory / files_1.$Ak.MB).toFixed(0).padStart(6, ' ')}\t${item.pid.toFixed(0).padStart(6, ' ')}\t${name}`);
            // Recurse into children if any
            if (Array.isArray(item.children)) {
                item.children.forEach(child => this.n(mainPid, mapProcessToName, output, child, indent + 1));
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
                    const stats = await $tr(folder, ['node_modules', '.git']);
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
                    const stats = await $tr(folder, ['node_modules', '.git']);
                    this.c.publicLog2('workspace.stats', {
                        'workspace.id': workspace.telemetryId,
                        rendererSessionId: workspace.rendererSessionId
                    });
                    stats.fileTypes.forEach(e => {
                        this.c.publicLog2('workspace.stats.file', {
                            rendererSessionId: workspace.rendererSessionId,
                            type: e.name,
                            count: e.count
                        });
                    });
                    stats.launchConfigFiles.forEach(e => {
                        this.c.publicLog2('workspace.stats.launchConfigFile', {
                            rendererSessionId: workspace.rendererSessionId,
                            type: e.name,
                            count: e.count
                        });
                    });
                    stats.configFiles.forEach(e => {
                        this.c.publicLog2('workspace.stats.configFiles', {
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
    exports.$wr = $wr;
    exports.$wr = $wr = __decorate([
        __param(0, telemetry_1.$9k),
        __param(1, productService_1.$kj)
    ], $wr);
});
//# sourceMappingURL=diagnosticsService.js.map