"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScripts = exports.findScriptAtPosition = exports.startDebugging = exports.runScript = exports.hasPackageJson = exports.getPackageJsonUriFromTask = exports.createTask = exports.getTaskName = exports.isAutoDetectionEnabled = exports.provideNpmScripts = exports.detectNpmScriptsForFolder = exports.hasNpmScripts = exports.getPackageManager = exports.isWorkspaceFolder = exports.invalidateTasksCache = exports.NpmTaskProvider = void 0;
const vscode_1 = require("vscode");
const path = require("path");
const fs = require("fs");
const minimatch = require("minimatch");
const vscode_uri_1 = require("vscode-uri");
const preferred_pm_1 = require("./preferred-pm");
const readScripts_1 = require("./readScripts");
const excludeRegex = new RegExp('^(node_modules|.vscode-test)$', 'i');
let cachedTasks = undefined;
const INSTALL_SCRIPT = 'install';
class NpmTaskProvider {
    constructor(context) {
        this.context = context;
    }
    get tasksWithLocation() {
        return provideNpmScripts(this.context, false);
    }
    async provideTasks() {
        const tasks = await provideNpmScripts(this.context, true);
        return tasks.map(task => task.task);
    }
    async resolveTask(_task) {
        const npmTask = _task.definition.script;
        if (npmTask) {
            const kind = _task.definition;
            let packageJsonUri;
            if (_task.scope === undefined || _task.scope === vscode_1.TaskScope.Global || _task.scope === vscode_1.TaskScope.Workspace) {
                // scope is required to be a WorkspaceFolder for resolveTask
                return undefined;
            }
            if (kind.path) {
                packageJsonUri = _task.scope.uri.with({ path: _task.scope.uri.path + '/' + kind.path + `${kind.path.endsWith('/') ? '' : '/'}` + 'package.json' });
            }
            else {
                packageJsonUri = _task.scope.uri.with({ path: _task.scope.uri.path + '/package.json' });
            }
            const cmd = [kind.script];
            if (kind.script !== INSTALL_SCRIPT) {
                cmd.unshift('run');
            }
            return createTask(await getPackageManager(this.context, _task.scope.uri), kind, cmd, _task.scope, packageJsonUri);
        }
        return undefined;
    }
}
exports.NpmTaskProvider = NpmTaskProvider;
function invalidateTasksCache() {
    cachedTasks = undefined;
}
exports.invalidateTasksCache = invalidateTasksCache;
const buildNames = ['build', 'compile', 'watch'];
function isBuildTask(name) {
    for (const buildName of buildNames) {
        if (name.indexOf(buildName) !== -1) {
            return true;
        }
    }
    return false;
}
const testNames = ['test'];
function isTestTask(name) {
    for (const testName of testNames) {
        if (name === testName) {
            return true;
        }
    }
    return false;
}
function isPrePostScript(name) {
    const prePostScripts = new Set([
        'preuninstall', 'postuninstall', 'prepack', 'postpack', 'preinstall', 'postinstall',
        'prepack', 'postpack', 'prepublish', 'postpublish', 'preversion', 'postversion',
        'prestop', 'poststop', 'prerestart', 'postrestart', 'preshrinkwrap', 'postshrinkwrap',
        'pretest', 'postest', 'prepublishOnly'
    ]);
    const prepost = ['pre' + name, 'post' + name];
    for (const knownScript of prePostScripts) {
        if (knownScript === prepost[0] || knownScript === prepost[1]) {
            return true;
        }
    }
    return false;
}
function isWorkspaceFolder(value) {
    return value && typeof value !== 'number';
}
exports.isWorkspaceFolder = isWorkspaceFolder;
async function getPackageManager(extensionContext, folder, showWarning = true) {
    let packageManagerName = vscode_1.workspace.getConfiguration('npm', folder).get('packageManager', 'npm');
    if (packageManagerName === 'auto') {
        const { name, multipleLockFilesDetected: multiplePMDetected } = await (0, preferred_pm_1.findPreferredPM)(folder.fsPath);
        packageManagerName = name;
        const neverShowWarning = 'npm.multiplePMWarning.neverShow';
        if (showWarning && multiplePMDetected && !extensionContext.globalState.get(neverShowWarning)) {
            const multiplePMWarning = vscode_1.l10n.t('Using {0} as the preferred package manager. Found multiple lockfiles for {1}.  To resolve this issue, delete the lockfiles that don\'t match your preferred package manager or change the setting "npm.packageManager" to a value other than "auto".', packageManagerName, folder.fsPath);
            const neverShowAgain = vscode_1.l10n.t("Do not show again");
            const learnMore = vscode_1.l10n.t("Learn more");
            vscode_1.window.showInformationMessage(multiplePMWarning, learnMore, neverShowAgain).then(result => {
                switch (result) {
                    case neverShowAgain:
                        extensionContext.globalState.update(neverShowWarning, true);
                        break;
                    case learnMore: vscode_1.env.openExternal(vscode_1.Uri.parse('https://docs.npmjs.com/cli/v9/configuring-npm/package-lock-json'));
                }
            });
        }
    }
    return packageManagerName;
}
exports.getPackageManager = getPackageManager;
async function hasNpmScripts() {
    const folders = vscode_1.workspace.workspaceFolders;
    if (!folders) {
        return false;
    }
    try {
        for (const folder of folders) {
            if (isAutoDetectionEnabled(folder) && !excludeRegex.test(vscode_uri_1.Utils.basename(folder.uri))) {
                const relativePattern = new vscode_1.RelativePattern(folder, '**/package.json');
                const paths = await vscode_1.workspace.findFiles(relativePattern, '**/node_modules/**');
                if (paths.length > 0) {
                    return true;
                }
            }
        }
        return false;
    }
    catch (error) {
        return Promise.reject(error);
    }
}
exports.hasNpmScripts = hasNpmScripts;
async function detectNpmScripts(context, showWarning) {
    const emptyTasks = [];
    const allTasks = [];
    const visitedPackageJsonFiles = new Set();
    const folders = vscode_1.workspace.workspaceFolders;
    if (!folders) {
        return emptyTasks;
    }
    try {
        for (const folder of folders) {
            if (isAutoDetectionEnabled(folder) && !excludeRegex.test(vscode_uri_1.Utils.basename(folder.uri))) {
                const relativePattern = new vscode_1.RelativePattern(folder, '**/package.json');
                const paths = await vscode_1.workspace.findFiles(relativePattern, '**/{node_modules,.vscode-test}/**');
                for (const path of paths) {
                    if (!isExcluded(folder, path) && !visitedPackageJsonFiles.has(path.fsPath)) {
                        const tasks = await provideNpmScriptsForFolder(context, path, showWarning);
                        visitedPackageJsonFiles.add(path.fsPath);
                        allTasks.push(...tasks);
                    }
                }
            }
        }
        return allTasks;
    }
    catch (error) {
        return Promise.reject(error);
    }
}
async function detectNpmScriptsForFolder(context, folder) {
    const folderTasks = [];
    try {
        if (excludeRegex.test(vscode_uri_1.Utils.basename(folder))) {
            return folderTasks;
        }
        const relativePattern = new vscode_1.RelativePattern(folder.fsPath, '**/package.json');
        const paths = await vscode_1.workspace.findFiles(relativePattern, '**/node_modules/**');
        const visitedPackageJsonFiles = new Set();
        for (const path of paths) {
            if (!visitedPackageJsonFiles.has(path.fsPath)) {
                const tasks = await provideNpmScriptsForFolder(context, path, true);
                visitedPackageJsonFiles.add(path.fsPath);
                folderTasks.push(...tasks.map(t => ({ label: t.task.name, task: t.task })));
            }
        }
        return folderTasks;
    }
    catch (error) {
        return Promise.reject(error);
    }
}
exports.detectNpmScriptsForFolder = detectNpmScriptsForFolder;
async function provideNpmScripts(context, showWarning) {
    if (!cachedTasks) {
        cachedTasks = await detectNpmScripts(context, showWarning);
    }
    return cachedTasks;
}
exports.provideNpmScripts = provideNpmScripts;
function isAutoDetectionEnabled(folder) {
    return vscode_1.workspace.getConfiguration('npm', folder?.uri).get('autoDetect') === 'on';
}
exports.isAutoDetectionEnabled = isAutoDetectionEnabled;
function isExcluded(folder, packageJsonUri) {
    function testForExclusionPattern(path, pattern) {
        return minimatch(path, pattern, { dot: true });
    }
    const exclude = vscode_1.workspace.getConfiguration('npm', folder.uri).get('exclude');
    const packageJsonFolder = path.dirname(packageJsonUri.fsPath);
    if (exclude) {
        if (Array.isArray(exclude)) {
            for (const pattern of exclude) {
                if (testForExclusionPattern(packageJsonFolder, pattern)) {
                    return true;
                }
            }
        }
        else if (testForExclusionPattern(packageJsonFolder, exclude)) {
            return true;
        }
    }
    return false;
}
function isDebugScript(script) {
    const match = script.match(/--(inspect|debug)(-brk)?(=((\[[0-9a-fA-F:]*\]|[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+|[a-zA-Z0-9\.]*):)?(\d+))?/);
    return match !== null;
}
async function provideNpmScriptsForFolder(context, packageJsonUri, showWarning) {
    const emptyTasks = [];
    const folder = vscode_1.workspace.getWorkspaceFolder(packageJsonUri);
    if (!folder) {
        return emptyTasks;
    }
    const scripts = await getScripts(packageJsonUri);
    if (!scripts) {
        return emptyTasks;
    }
    const result = [];
    const packageManager = await getPackageManager(context, folder.uri, showWarning);
    for (const { name, value, nameRange } of scripts.scripts) {
        const task = await createTask(packageManager, name, ['run', name], folder, packageJsonUri, value, undefined);
        result.push({ task, location: new vscode_1.Location(packageJsonUri, nameRange) });
    }
    if (!vscode_1.workspace.getConfiguration('npm', folder).get('scriptExplorerExclude', []).find(e => e.includes(INSTALL_SCRIPT))) {
        result.push({ task: await createTask(packageManager, INSTALL_SCRIPT, [INSTALL_SCRIPT], folder, packageJsonUri, 'install dependencies from package', []) });
    }
    return result;
}
function getTaskName(script, relativePath) {
    if (relativePath && relativePath.length) {
        return `${script} - ${relativePath.substring(0, relativePath.length - 1)}`;
    }
    return script;
}
exports.getTaskName = getTaskName;
async function createTask(packageManager, script, cmd, folder, packageJsonUri, scriptValue, matcher) {
    let kind;
    if (typeof script === 'string') {
        kind = { type: 'npm', script: script };
    }
    else {
        kind = script;
    }
    function getCommandLine(cmd) {
        const result = new Array(cmd.length);
        for (let i = 0; i < cmd.length; i++) {
            if (/\s/.test(cmd[i])) {
                result[i] = { value: cmd[i], quoting: cmd[i].includes('--') ? vscode_1.ShellQuoting.Weak : vscode_1.ShellQuoting.Strong };
            }
            else {
                result[i] = cmd[i];
            }
        }
        if (vscode_1.workspace.getConfiguration('npm', folder.uri).get('runSilent')) {
            result.unshift('--silent');
        }
        return result;
    }
    function getRelativePath(packageJsonUri) {
        const rootUri = folder.uri;
        const absolutePath = packageJsonUri.path.substring(0, packageJsonUri.path.length - 'package.json'.length);
        return absolutePath.substring(rootUri.path.length + 1);
    }
    const relativePackageJson = getRelativePath(packageJsonUri);
    if (relativePackageJson.length && !kind.path) {
        kind.path = relativePackageJson.substring(0, relativePackageJson.length - 1);
    }
    const taskName = getTaskName(kind.script, relativePackageJson);
    const cwd = path.dirname(packageJsonUri.fsPath);
    const task = new vscode_1.Task(kind, folder, taskName, 'npm', new vscode_1.ShellExecution(packageManager, getCommandLine(cmd), { cwd: cwd }), matcher);
    task.detail = scriptValue;
    const lowerCaseTaskName = kind.script.toLowerCase();
    if (isBuildTask(lowerCaseTaskName)) {
        task.group = vscode_1.TaskGroup.Build;
    }
    else if (isTestTask(lowerCaseTaskName)) {
        task.group = vscode_1.TaskGroup.Test;
    }
    else if (isPrePostScript(lowerCaseTaskName)) {
        task.group = vscode_1.TaskGroup.Clean; // hack: use Clean group to tag pre/post scripts
    }
    else if (scriptValue && isDebugScript(scriptValue)) {
        // todo@connor4312: all scripts are now debuggable, what is a 'debug script'?
        task.group = vscode_1.TaskGroup.Rebuild; // hack: use Rebuild group to tag debug scripts
    }
    return task;
}
exports.createTask = createTask;
function getPackageJsonUriFromTask(task) {
    if (isWorkspaceFolder(task.scope)) {
        if (task.definition.path) {
            return vscode_1.Uri.file(path.join(task.scope.uri.fsPath, task.definition.path, 'package.json'));
        }
        else {
            return vscode_1.Uri.file(path.join(task.scope.uri.fsPath, 'package.json'));
        }
    }
    return null;
}
exports.getPackageJsonUriFromTask = getPackageJsonUriFromTask;
async function hasPackageJson() {
    const token = new vscode_1.CancellationTokenSource();
    // Search for files for max 1 second.
    const timeout = setTimeout(() => token.cancel(), 1000);
    const files = await vscode_1.workspace.findFiles('**/package.json', undefined, 1, token.token);
    clearTimeout(timeout);
    return files.length > 0 || await hasRootPackageJson();
}
exports.hasPackageJson = hasPackageJson;
async function hasRootPackageJson() {
    const folders = vscode_1.workspace.workspaceFolders;
    if (!folders) {
        return false;
    }
    for (const folder of folders) {
        if (folder.uri.scheme === 'file') {
            const packageJson = path.join(folder.uri.fsPath, 'package.json');
            if (await exists(packageJson)) {
                return true;
            }
        }
    }
    return false;
}
async function exists(file) {
    return new Promise((resolve, _reject) => {
        fs.exists(file, (value) => {
            resolve(value);
        });
    });
}
async function runScript(context, script, document) {
    const uri = document.uri;
    const folder = vscode_1.workspace.getWorkspaceFolder(uri);
    if (folder) {
        const task = await createTask(await getPackageManager(context, folder.uri), script, ['run', script], folder, uri);
        vscode_1.tasks.executeTask(task);
    }
}
exports.runScript = runScript;
async function startDebugging(context, scriptName, cwd, folder) {
    vscode_1.commands.executeCommand('extension.js-debug.createDebuggerTerminal', `${await getPackageManager(context, folder.uri)} run ${scriptName}`, folder, { cwd });
}
exports.startDebugging = startDebugging;
function findScriptAtPosition(document, buffer, position) {
    const read = (0, readScripts_1.readScripts)(document, buffer);
    if (!read) {
        return undefined;
    }
    for (const script of read.scripts) {
        if (script.nameRange.start.isBeforeOrEqual(position) && script.valueRange.end.isAfterOrEqual(position)) {
            return script.name;
        }
    }
    return undefined;
}
exports.findScriptAtPosition = findScriptAtPosition;
async function getScripts(packageJsonUri) {
    if (packageJsonUri.scheme !== 'file') {
        return undefined;
    }
    const packageJson = packageJsonUri.fsPath;
    if (!await exists(packageJson)) {
        return undefined;
    }
    try {
        const document = await vscode_1.workspace.openTextDocument(packageJsonUri);
        return (0, readScripts_1.readScripts)(document);
    }
    catch (e) {
        const localizedParseError = vscode_1.l10n.t("Npm task detection: failed to parse the file {0}", packageJsonUri.fsPath);
        throw new Error(localizedParseError);
    }
}
exports.getScripts = getScripts;
//# sourceMappingURL=tasks.js.map