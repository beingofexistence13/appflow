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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoInstallerFs = void 0;
const vscode = __importStar(require("vscode"));
const memFs_1 = require("./memFs");
const vscode_uri_1 = require("vscode-uri");
const ts_package_manager_1 = require("@vscode/ts-package-manager");
const path_1 = require("path");
const TEXT_DECODER = new TextDecoder('utf-8');
const TEXT_ENCODER = new TextEncoder();
class AutoInstallerFs {
    constructor() {
        this.memfs = new memFs_1.MemFs();
        this.projectCache = new Map();
        this._emitter = new vscode.EventEmitter();
        this.onDidChangeFile = this._emitter.event;
        this.watcher = vscode.workspace.createFileSystemWatcher('**/{package.json,package-lock.json,package-lock.kdl}');
        const handler = (uri) => {
            const root = (0, path_1.dirname)(uri.path);
            if (this.projectCache.delete(root)) {
                (async () => {
                    const pm = new ts_package_manager_1.PackageManager(this.fs);
                    const opts = await this.getInstallOpts(uri, root);
                    const proj = await pm.resolveProject(root, opts);
                    proj.pruneExtraneous();
                    // TODO: should this fire on vscode-node-modules instead?
                    // NB(kmarchan): This should tell TSServer that there's
                    // been changes inside node_modules and it needs to
                    // re-evaluate things.
                    this._emitter.fire([{
                            type: vscode.FileChangeType.Changed,
                            uri: uri.with({ path: (0, path_1.join)(root, 'node_modules') })
                        }]);
                })();
            }
        };
        this.watcher.onDidChange(handler);
        this.watcher.onDidCreate(handler);
        this.watcher.onDidDelete(handler);
        const memfs = this.memfs;
        memfs.onDidChangeFile((e) => {
            this._emitter.fire(e.map(ev => ({
                type: ev.type,
                // TODO: we're gonna need a MappedUri dance...
                uri: ev.uri.with({ scheme: 'memfs' })
            })));
        });
        this.fs = {
            readDirectory(path, _extensions, _exclude, _include, _depth) {
                return memfs.readDirectory(vscode_uri_1.URI.file(path)).map(([name, _]) => name);
            },
            deleteFile(path) {
                memfs.delete(vscode_uri_1.URI.file(path));
            },
            createDirectory(path) {
                memfs.createDirectory(vscode_uri_1.URI.file(path));
            },
            writeFile(path, data, _writeByteOrderMark) {
                memfs.writeFile(vscode_uri_1.URI.file(path), TEXT_ENCODER.encode(data), { overwrite: true, create: true });
            },
            directoryExists(path) {
                try {
                    const stat = memfs.stat(vscode_uri_1.URI.file(path));
                    return stat.type === vscode.FileType.Directory;
                }
                catch (e) {
                    return false;
                }
            },
            readFile(path, _encoding) {
                try {
                    return TEXT_DECODER.decode(memfs.readFile(vscode_uri_1.URI.file(path)));
                }
                catch (e) {
                    return undefined;
                }
            }
        };
    }
    watch(resource) {
        const mapped = vscode_uri_1.URI.file(new MappedUri(resource).path);
        console.log('watching', mapped);
        return this.memfs.watch(mapped);
    }
    async stat(uri) {
        // console.log('stat', uri.toString());
        const mapped = new MappedUri(uri);
        // TODO: case sensitivity configuration
        // We pretend every single node_modules or @types directory ever actually
        // exists.
        if ((0, path_1.basename)(mapped.path) === 'node_modules' || (0, path_1.basename)(mapped.path) === '@types') {
            return {
                mtime: 0,
                ctime: 0,
                type: vscode.FileType.Directory,
                size: 0
            };
        }
        await this.ensurePackageContents(mapped);
        return this.memfs.stat(vscode_uri_1.URI.file(mapped.path));
    }
    async readDirectory(uri) {
        // console.log('readDirectory', uri.toString());
        const mapped = new MappedUri(uri);
        await this.ensurePackageContents(mapped);
        return this.memfs.readDirectory(vscode_uri_1.URI.file(mapped.path));
    }
    async readFile(uri) {
        // console.log('readFile', uri.toString());
        const mapped = new MappedUri(uri);
        await this.ensurePackageContents(mapped);
        return this.memfs.readFile(vscode_uri_1.URI.file(mapped.path));
    }
    writeFile(_uri, _content, _options) {
        throw new Error('not implemented');
    }
    rename(_oldUri, _newUri, _options) {
        throw new Error('not implemented');
    }
    delete(_uri) {
        throw new Error('not implemented');
    }
    createDirectory(_uri) {
        throw new Error('not implemented');
    }
    async ensurePackageContents(incomingUri) {
        // console.log('ensurePackageContents', incomingUri.path);
        // If we're not looking for something inside node_modules, bail early.
        if (!incomingUri.path.includes('node_modules')) {
            throw vscode.FileSystemError.FileNotFound();
        }
        // standard lib files aren't handled through here
        if (incomingUri.path.includes('node_modules/@typescript') || incomingUri.path.includes('node_modules/@types/typescript__')) {
            throw vscode.FileSystemError.FileNotFound();
        }
        const root = this.getProjectRoot(incomingUri.path);
        const pkgPath = (0, ts_package_manager_1.packagePath)(incomingUri.path);
        if (!root || this.projectCache.get(root)?.has(pkgPath)) {
            return;
        }
        const proj = await (new ts_package_manager_1.PackageManager(this.fs)).resolveProject(root, await this.getInstallOpts(incomingUri.original, root));
        const restore = proj.restorePackageAt(incomingUri.path);
        try {
            await restore;
        }
        catch (e) {
            console.error(`failed to restore package at ${incomingUri.path}: `, e);
            throw e;
        }
        if (!this.projectCache.has(root)) {
            this.projectCache.set(root, new Set());
        }
        this.projectCache.get(root).add(pkgPath);
    }
    async getInstallOpts(originalUri, root) {
        const vsfs = vscode.workspace.fs;
        let pkgJson;
        try {
            pkgJson = TEXT_DECODER.decode(await vsfs.readFile(originalUri.with({ path: (0, path_1.join)(root, 'package.json') })));
        }
        catch (e) { }
        let kdlLock;
        try {
            kdlLock = TEXT_DECODER.decode(await vsfs.readFile(originalUri.with({ path: (0, path_1.join)(root, 'package-lock.kdl') })));
        }
        catch (e) { }
        let npmLock;
        try {
            npmLock = TEXT_DECODER.decode(await vsfs.readFile(originalUri.with({ path: (0, path_1.join)(root, 'package-lock.json') })));
        }
        catch (e) { }
        return {
            pkgJson,
            kdlLock,
            npmLock
        };
    }
    getProjectRoot(path) {
        const pkgPath = path.match(/(^.*)\/node_modules/);
        return pkgPath?.[1];
    }
}
exports.AutoInstallerFs = AutoInstallerFs;
class MappedUri {
    constructor(uri) {
        this.raw = uri;
        const parts = uri.path.match(/^\/([^\/]+)\/([^\/]*)(?:\/(.+))?$/);
        if (!parts) {
            throw new Error(`Invalid path: ${uri.path}`);
        }
        const scheme = parts[1];
        const authority = parts[2] === 'ts-nul-authority' ? '' : parts[2];
        const path = parts[3];
        this.original = vscode_uri_1.URI.from({ scheme, authority, path: (path ? '/' + path : path) });
        this.mapped = this.original.with({ scheme: this.raw.scheme, authority: this.raw.authority });
    }
    get path() {
        return this.mapped.path;
    }
    get scheme() {
        return this.mapped.scheme;
    }
    get authority() {
        return this.mapped.authority;
    }
    get flatPath() {
        return (0, path_1.join)('/', this.scheme, this.authority, this.path);
    }
}
//# sourceMappingURL=autoInstallerFs.js.map