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
define(["require", "exports", "vs/base/common/process", "vs/base/common/lifecycle", "vs/base/common/map", "vs/platform/configuration/common/configuration", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/base/common/uri", "vs/workbench/services/remote/common/remoteAgentService", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/path"], function (require, exports, process_1, lifecycle_1, map_1, configuration_1, files_1, instantiation_1, storage_1, uri_1, remoteAgentService_1, network_1, platform_1, path_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.sanitizeFishHistoryCmd = exports.fetchFishHistory = exports.fetchPwshHistory = exports.fetchZshHistory = exports.fetchBashHistory = exports.TerminalPersistedHistory = exports.clearShellFileHistory = exports.getShellFileHistory = exports.getDirectoryHistory = exports.getCommandHistory = void 0;
    var Constants;
    (function (Constants) {
        Constants[Constants["DefaultHistoryLimit"] = 100] = "DefaultHistoryLimit";
    })(Constants || (Constants = {}));
    var StorageKeys;
    (function (StorageKeys) {
        StorageKeys["Entries"] = "terminal.history.entries";
        StorageKeys["Timestamp"] = "terminal.history.timestamp";
    })(StorageKeys || (StorageKeys = {}));
    let commandHistory = undefined;
    function getCommandHistory(accessor) {
        if (!commandHistory) {
            commandHistory = accessor.get(instantiation_1.IInstantiationService).createInstance(TerminalPersistedHistory, 'commands');
        }
        return commandHistory;
    }
    exports.getCommandHistory = getCommandHistory;
    let directoryHistory = undefined;
    function getDirectoryHistory(accessor) {
        if (!directoryHistory) {
            directoryHistory = accessor.get(instantiation_1.IInstantiationService).createInstance(TerminalPersistedHistory, 'dirs');
        }
        return directoryHistory;
    }
    exports.getDirectoryHistory = getDirectoryHistory;
    // Shell file history loads once per shell per window
    const shellFileHistory = new Map();
    async function getShellFileHistory(accessor, shellType) {
        const cached = shellFileHistory.get(shellType);
        if (cached === null) {
            return [];
        }
        if (cached !== undefined) {
            return cached;
        }
        let result;
        switch (shellType) {
            case "bash" /* PosixShellType.Bash */:
                result = await fetchBashHistory(accessor);
                break;
            case "pwsh" /* PosixShellType.PowerShell */: // WindowsShellType.PowerShell has the same value
                result = await fetchPwshHistory(accessor);
                break;
            case "zsh" /* PosixShellType.Zsh */:
                result = await fetchZshHistory(accessor);
                break;
            case "fish" /* PosixShellType.Fish */:
                result = await fetchFishHistory(accessor);
                break;
            default: return [];
        }
        if (result === undefined) {
            shellFileHistory.set(shellType, null);
            return [];
        }
        const array = Array.from(result);
        shellFileHistory.set(shellType, array);
        return array;
    }
    exports.getShellFileHistory = getShellFileHistory;
    function clearShellFileHistory() {
        shellFileHistory.clear();
    }
    exports.clearShellFileHistory = clearShellFileHistory;
    let TerminalPersistedHistory = class TerminalPersistedHistory extends lifecycle_1.Disposable {
        get entries() {
            this._ensureUpToDate();
            return this._entries.entries();
        }
        constructor(_storageDataKey, _configurationService, _storageService) {
            super();
            this._storageDataKey = _storageDataKey;
            this._configurationService = _configurationService;
            this._storageService = _storageService;
            this._timestamp = 0;
            this._isReady = false;
            this._isStale = true;
            // Init cache
            this._entries = new map_1.LRUCache(this._getHistoryLimit());
            // Listen for config changes to set history limit
            this._register(this._configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("terminal.integrated.shellIntegration.history" /* TerminalSettingId.ShellIntegrationCommandHistory */)) {
                    this._entries.limit = this._getHistoryLimit();
                }
            }));
            // Listen to cache changes from other windows
            this._register(this._storageService.onDidChangeValue(-1 /* StorageScope.APPLICATION */, this._getTimestampStorageKey(), this._store)(() => {
                if (!this._isStale) {
                    this._isStale = this._storageService.getNumber(this._getTimestampStorageKey(), -1 /* StorageScope.APPLICATION */, 0) !== this._timestamp;
                }
            }));
        }
        add(key, value) {
            this._ensureUpToDate();
            this._entries.set(key, value);
            this._saveState();
        }
        remove(key) {
            this._ensureUpToDate();
            this._entries.delete(key);
            this._saveState();
        }
        clear() {
            this._ensureUpToDate();
            this._entries.clear();
            this._saveState();
        }
        _ensureUpToDate() {
            // Initial load
            if (!this._isReady) {
                this._loadState();
                this._isReady = true;
            }
            // React to stale cache caused by another window
            if (this._isStale) {
                // Since state is saved whenever the entries change, it's a safe assumption that no
                // merging of entries needs to happen, just loading the new state.
                this._entries.clear();
                this._loadState();
                this._isStale = false;
            }
        }
        _loadState() {
            this._timestamp = this._storageService.getNumber(this._getTimestampStorageKey(), -1 /* StorageScope.APPLICATION */, 0);
            // Load global entries plus
            const serialized = this._loadPersistedState();
            if (serialized) {
                for (const entry of serialized.entries) {
                    this._entries.set(entry.key, entry.value);
                }
            }
        }
        _loadPersistedState() {
            const raw = this._storageService.get(this._getEntriesStorageKey(), -1 /* StorageScope.APPLICATION */);
            if (raw === undefined || raw.length === 0) {
                return undefined;
            }
            let serialized = undefined;
            try {
                serialized = JSON.parse(raw);
            }
            catch {
                // Invalid data
                return undefined;
            }
            return serialized;
        }
        _saveState() {
            const serialized = { entries: [] };
            this._entries.forEach((value, key) => serialized.entries.push({ key, value }));
            this._storageService.store(this._getEntriesStorageKey(), JSON.stringify(serialized), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            this._timestamp = Date.now();
            this._storageService.store(this._getTimestampStorageKey(), this._timestamp, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        }
        _getHistoryLimit() {
            const historyLimit = this._configurationService.getValue("terminal.integrated.shellIntegration.history" /* TerminalSettingId.ShellIntegrationCommandHistory */);
            return typeof historyLimit === 'number' ? historyLimit : 100 /* Constants.DefaultHistoryLimit */;
        }
        _getTimestampStorageKey() {
            return `${"terminal.history.timestamp" /* StorageKeys.Timestamp */}.${this._storageDataKey}`;
        }
        _getEntriesStorageKey() {
            return `${"terminal.history.entries" /* StorageKeys.Entries */}.${this._storageDataKey}`;
        }
    };
    exports.TerminalPersistedHistory = TerminalPersistedHistory;
    exports.TerminalPersistedHistory = TerminalPersistedHistory = __decorate([
        __param(1, configuration_1.IConfigurationService),
        __param(2, storage_1.IStorageService)
    ], TerminalPersistedHistory);
    async function fetchBashHistory(accessor) {
        const fileService = accessor.get(files_1.IFileService);
        const remoteAgentService = accessor.get(remoteAgentService_1.IRemoteAgentService);
        const remoteEnvironment = await remoteAgentService.getEnvironment();
        if (remoteEnvironment?.os === 1 /* OperatingSystem.Windows */ || !remoteEnvironment && platform_1.isWindows) {
            return undefined;
        }
        const content = await fetchFileContents(process_1.env['HOME'], '.bash_history', false, fileService, remoteAgentService);
        if (content === undefined) {
            return undefined;
        }
        // .bash_history does not differentiate wrapped commands from multiple commands. Parse
        // the output to get the
        const fileLines = content.split('\n');
        const result = new Set();
        let currentLine;
        let currentCommand = undefined;
        let wrapChar = undefined;
        for (let i = 0; i < fileLines.length; i++) {
            currentLine = fileLines[i];
            if (currentCommand === undefined) {
                currentCommand = currentLine;
            }
            else {
                currentCommand += `\n${currentLine}`;
            }
            for (let c = 0; c < currentLine.length; c++) {
                if (wrapChar) {
                    if (currentLine[c] === wrapChar) {
                        wrapChar = undefined;
                    }
                }
                else {
                    if (currentLine[c].match(/['"]/)) {
                        wrapChar = currentLine[c];
                    }
                }
            }
            if (wrapChar === undefined) {
                if (currentCommand.length > 0) {
                    result.add(currentCommand.trim());
                }
                currentCommand = undefined;
            }
        }
        return result.values();
    }
    exports.fetchBashHistory = fetchBashHistory;
    async function fetchZshHistory(accessor) {
        const fileService = accessor.get(files_1.IFileService);
        const remoteAgentService = accessor.get(remoteAgentService_1.IRemoteAgentService);
        const remoteEnvironment = await remoteAgentService.getEnvironment();
        if (remoteEnvironment?.os === 1 /* OperatingSystem.Windows */ || !remoteEnvironment && platform_1.isWindows) {
            return undefined;
        }
        const content = await fetchFileContents(process_1.env['HOME'], '.zsh_history', false, fileService, remoteAgentService);
        if (content === undefined) {
            return undefined;
        }
        const fileLines = content.split(/\:\s\d+\:\d+;/);
        const result = new Set();
        for (let i = 0; i < fileLines.length; i++) {
            const sanitized = fileLines[i].replace(/\\\n/g, '\n').trim();
            if (sanitized.length > 0) {
                result.add(sanitized);
            }
        }
        return result.values();
    }
    exports.fetchZshHistory = fetchZshHistory;
    async function fetchPwshHistory(accessor) {
        const fileService = accessor.get(files_1.IFileService);
        const remoteAgentService = accessor.get(remoteAgentService_1.IRemoteAgentService);
        let folderPrefix;
        let filePath;
        const remoteEnvironment = await remoteAgentService.getEnvironment();
        const isFileWindows = remoteEnvironment?.os === 1 /* OperatingSystem.Windows */ || !remoteEnvironment && platform_1.isWindows;
        if (isFileWindows) {
            folderPrefix = process_1.env['APPDATA'];
            filePath = '\\Microsoft\\Windows\\PowerShell\\PSReadLine\\ConsoleHost_history.txt';
        }
        else {
            folderPrefix = process_1.env['HOME'];
            filePath = '.local/share/powershell/PSReadline/ConsoleHost_history.txt';
        }
        const content = await fetchFileContents(folderPrefix, filePath, isFileWindows, fileService, remoteAgentService);
        if (content === undefined) {
            return undefined;
        }
        const fileLines = content.split('\n');
        const result = new Set();
        let currentLine;
        let currentCommand = undefined;
        let wrapChar = undefined;
        for (let i = 0; i < fileLines.length; i++) {
            currentLine = fileLines[i];
            if (currentCommand === undefined) {
                currentCommand = currentLine;
            }
            else {
                currentCommand += `\n${currentLine}`;
            }
            if (!currentLine.endsWith('`')) {
                const sanitized = currentCommand.trim();
                if (sanitized.length > 0) {
                    result.add(sanitized);
                }
                currentCommand = undefined;
                continue;
            }
            // If the line ends with `, the line may be wrapped. Need to also test the case where ` is
            // the last character in the line
            for (let c = 0; c < currentLine.length; c++) {
                if (wrapChar) {
                    if (currentLine[c] === wrapChar) {
                        wrapChar = undefined;
                    }
                }
                else {
                    if (currentLine[c].match(/`/)) {
                        wrapChar = currentLine[c];
                    }
                }
            }
            // Having an even number of backticks means the line is terminated
            // TODO: This doesn't cover more complicated cases where ` is within quotes
            if (!wrapChar) {
                const sanitized = currentCommand.trim();
                if (sanitized.length > 0) {
                    result.add(sanitized);
                }
                currentCommand = undefined;
            }
            else {
                // Remove trailing backtick
                currentCommand = currentCommand.replace(/`$/, '');
                wrapChar = undefined;
            }
        }
        return result.values();
    }
    exports.fetchPwshHistory = fetchPwshHistory;
    async function fetchFishHistory(accessor) {
        const fileService = accessor.get(files_1.IFileService);
        const remoteAgentService = accessor.get(remoteAgentService_1.IRemoteAgentService);
        const remoteEnvironment = await remoteAgentService.getEnvironment();
        if (remoteEnvironment?.os === 1 /* OperatingSystem.Windows */ || !remoteEnvironment && platform_1.isWindows) {
            return undefined;
        }
        /**
         * From `fish` docs:
         * > The command history is stored in the file ~/.local/share/fish/fish_history
         *   (or $XDG_DATA_HOME/fish/fish_history if that variable is set) by default.
         *
         * (https://fishshell.com/docs/current/interactive.html#history-search)
         */
        const overridenDataHome = process_1.env['XDG_DATA_HOME'];
        // TODO: Unchecked fish behavior:
        // What if XDG_DATA_HOME was defined but somehow $XDG_DATA_HOME/fish/fish_history
        // was not exist. Does fish fall back to ~/.local/share/fish/fish_history?
        const content = await (overridenDataHome
            ? fetchFileContents(process_1.env['XDG_DATA_HOME'], 'fish/fish_history', false, fileService, remoteAgentService)
            : fetchFileContents(process_1.env['HOME'], '.local/share/fish/fish_history', false, fileService, remoteAgentService));
        if (content === undefined) {
            return undefined;
        }
        /**
         * These apply to `fish` v3.5.1:
         * - It looks like YAML but it's not. It's, quoting, *"a broken psuedo-YAML"*.
         *   See these discussions for more details:
         *   - https://github.com/fish-shell/fish-shell/pull/6493
         *   - https://github.com/fish-shell/fish-shell/issues/3341
         * - Every record should exactly start with `- cmd:` (the whitespace between `-` and `cmd` cannot be replaced with tab)
         * - Both `- cmd: echo 1` and `- cmd:echo 1` are valid entries.
         * - Backslashes are esacped as `\\`.
         * - Multiline commands are joined with a `\n` sequence, hence they're read as single line commands.
         * - Property `when` is optional.
         * - History navigation respects the records order and ignore the actual `when` property values (chronological order).
         * - If `cmd` value is multiline , it just takes the first line. Also YAML operators like `>-` or `|-` are not supported.
         */
        const result = new Set();
        const cmds = content.split('\n')
            .filter(x => x.startsWith('- cmd:'))
            .map(x => x.substring(6).trimStart());
        for (let i = 0; i < cmds.length; i++) {
            const sanitized = sanitizeFishHistoryCmd(cmds[i]).trim();
            if (sanitized.length > 0) {
                result.add(sanitized);
            }
        }
        return result.values();
    }
    exports.fetchFishHistory = fetchFishHistory;
    function sanitizeFishHistoryCmd(cmd) {
        /**
         * NOTE
         * This repeatedReplace() call can be eliminated by using look-ahead
         * caluses in the original RegExp pattern:
         *
         * >>> ```ts
         * >>> cmds[i].replace(/(?<=^|[^\\])((?:\\\\)*)(\\n)/g, '$1\n')
         * >>> ```
         *
         * But since not all browsers support look aheads we opted to a simple
         * pattern and repeatedly calling replace method.
         */
        return repeatedReplace(/(^|[^\\])((?:\\\\)*)(\\n)/g, cmd, '$1$2\n');
    }
    exports.sanitizeFishHistoryCmd = sanitizeFishHistoryCmd;
    function repeatedReplace(pattern, value, replaceValue) {
        let last;
        let current = value;
        while (true) {
            last = current;
            current = current.replace(pattern, replaceValue);
            if (current === last) {
                return current;
            }
        }
    }
    async function fetchFileContents(folderPrefix, filePath, isFileWindows, fileService, remoteAgentService) {
        if (!folderPrefix) {
            return undefined;
        }
        const isRemote = !!remoteAgentService.getConnection()?.remoteAuthority;
        const historyFileUri = uri_1.URI.from({
            scheme: isRemote ? network_1.Schemas.vscodeRemote : network_1.Schemas.file,
            path: (isFileWindows ? path_1.win32.join : path_1.posix.join)(folderPrefix, filePath)
        });
        let content;
        try {
            content = await fileService.readFile(historyFileUri);
        }
        catch (e) {
            // Handle file not found only
            if (e instanceof files_1.FileOperationError && e.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                return undefined;
            }
            throw e;
        }
        if (content === undefined) {
            return undefined;
        }
        return content.value.toString();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlzdG9yeS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsL2NvbW1vbi9oaXN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTBDaEcsSUFBVyxTQUVWO0lBRkQsV0FBVyxTQUFTO1FBQ25CLHlFQUF5QixDQUFBO0lBQzFCLENBQUMsRUFGVSxTQUFTLEtBQVQsU0FBUyxRQUVuQjtJQUVELElBQVcsV0FHVjtJQUhELFdBQVcsV0FBVztRQUNyQixtREFBb0MsQ0FBQTtRQUNwQyx1REFBd0MsQ0FBQTtJQUN6QyxDQUFDLEVBSFUsV0FBVyxLQUFYLFdBQVcsUUFHckI7SUFFRCxJQUFJLGNBQWMsR0FBNEUsU0FBUyxDQUFDO0lBQ3hHLFNBQWdCLGlCQUFpQixDQUFDLFFBQTBCO1FBQzNELElBQUksQ0FBQyxjQUFjLEVBQUU7WUFDcEIsY0FBYyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMscUNBQXFCLENBQUMsQ0FBQyxjQUFjLENBQUMsd0JBQXdCLEVBQUUsVUFBVSxDQUErRCxDQUFDO1NBQ3hLO1FBQ0QsT0FBTyxjQUFjLENBQUM7SUFDdkIsQ0FBQztJQUxELDhDQUtDO0lBRUQsSUFBSSxnQkFBZ0IsR0FBd0UsU0FBUyxDQUFDO0lBQ3RHLFNBQWdCLG1CQUFtQixDQUFDLFFBQTBCO1FBQzdELElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtZQUN0QixnQkFBZ0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFDQUFxQixDQUFDLENBQUMsY0FBYyxDQUFDLHdCQUF3QixFQUFFLE1BQU0sQ0FBMkQsQ0FBQztTQUNsSztRQUNELE9BQU8sZ0JBQWdCLENBQUM7SUFDekIsQ0FBQztJQUxELGtEQUtDO0lBRUQscURBQXFEO0lBQ3JELE1BQU0sZ0JBQWdCLEdBQXdELElBQUksR0FBRyxFQUFFLENBQUM7SUFD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