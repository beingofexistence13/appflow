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
    exports.$BVb = exports.$AVb = exports.$zVb = exports.$yVb = exports.$xVb = exports.$wVb = exports.$vVb = exports.$uVb = exports.$tVb = exports.$sVb = void 0;
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
    function $sVb(accessor) {
        if (!commandHistory) {
            commandHistory = accessor.get(instantiation_1.$Ah).createInstance($wVb, 'commands');
        }
        return commandHistory;
    }
    exports.$sVb = $sVb;
    let directoryHistory = undefined;
    function $tVb(accessor) {
        if (!directoryHistory) {
            directoryHistory = accessor.get(instantiation_1.$Ah).createInstance($wVb, 'dirs');
        }
        return directoryHistory;
    }
    exports.$tVb = $tVb;
    // Shell file history loads once per shell per window
    const shellFileHistory = new Map();
    async function $uVb(accessor, shellType) {
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
                result = await $xVb(accessor);
                break;
            case "pwsh" /* PosixShellType.PowerShell */: // WindowsShellType.PowerShell has the same value
                result = await $zVb(accessor);
                break;
            case "zsh" /* PosixShellType.Zsh */:
                result = await $yVb(accessor);
                break;
            case "fish" /* PosixShellType.Fish */:
                result = await $AVb(accessor);
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
    exports.$uVb = $uVb;
    function $vVb() {
        shellFileHistory.clear();
    }
    exports.$vVb = $vVb;
    let $wVb = class $wVb extends lifecycle_1.$kc {
        get entries() {
            this.n();
            return this.a.entries();
        }
        constructor(h, j, m) {
            super();
            this.h = h;
            this.j = j;
            this.m = m;
            this.b = 0;
            this.f = false;
            this.g = true;
            // Init cache
            this.a = new map_1.$Ci(this.u());
            // Listen for config changes to set history limit
            this.B(this.j.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("terminal.integrated.shellIntegration.history" /* TerminalSettingId.ShellIntegrationCommandHistory */)) {
                    this.a.limit = this.u();
                }
            }));
            // Listen to cache changes from other windows
            this.B(this.m.onDidChangeValue(-1 /* StorageScope.APPLICATION */, this.w(), this.q)(() => {
                if (!this.g) {
                    this.g = this.m.getNumber(this.w(), -1 /* StorageScope.APPLICATION */, 0) !== this.b;
                }
            }));
        }
        add(key, value) {
            this.n();
            this.a.set(key, value);
            this.t();
        }
        remove(key) {
            this.n();
            this.a.delete(key);
            this.t();
        }
        clear() {
            this.n();
            this.a.clear();
            this.t();
        }
        n() {
            // Initial load
            if (!this.f) {
                this.r();
                this.f = true;
            }
            // React to stale cache caused by another window
            if (this.g) {
                // Since state is saved whenever the entries change, it's a safe assumption that no
                // merging of entries needs to happen, just loading the new state.
                this.a.clear();
                this.r();
                this.g = false;
            }
        }
        r() {
            this.b = this.m.getNumber(this.w(), -1 /* StorageScope.APPLICATION */, 0);
            // Load global entries plus
            const serialized = this.s();
            if (serialized) {
                for (const entry of serialized.entries) {
                    this.a.set(entry.key, entry.value);
                }
            }
        }
        s() {
            const raw = this.m.get(this.y(), -1 /* StorageScope.APPLICATION */);
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
        t() {
            const serialized = { entries: [] };
            this.a.forEach((value, key) => serialized.entries.push({ key, value }));
            this.m.store(this.y(), JSON.stringify(serialized), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            this.b = Date.now();
            this.m.store(this.w(), this.b, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        }
        u() {
            const historyLimit = this.j.getValue("terminal.integrated.shellIntegration.history" /* TerminalSettingId.ShellIntegrationCommandHistory */);
            return typeof historyLimit === 'number' ? historyLimit : 100 /* Constants.DefaultHistoryLimit */;
        }
        w() {
            return `${"terminal.history.timestamp" /* StorageKeys.Timestamp */}.${this.h}`;
        }
        y() {
            return `${"terminal.history.entries" /* StorageKeys.Entries */}.${this.h}`;
        }
    };
    exports.$wVb = $wVb;
    exports.$wVb = $wVb = __decorate([
        __param(1, configuration_1.$8h),
        __param(2, storage_1.$Vo)
    ], $wVb);
    async function $xVb(accessor) {
        const fileService = accessor.get(files_1.$6j);
        const remoteAgentService = accessor.get(remoteAgentService_1.$jm);
        const remoteEnvironment = await remoteAgentService.getEnvironment();
        if (remoteEnvironment?.os === 1 /* OperatingSystem.Windows */ || !remoteEnvironment && platform_1.$i) {
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
    exports.$xVb = $xVb;
    async function $yVb(accessor) {
        const fileService = accessor.get(files_1.$6j);
        const remoteAgentService = accessor.get(remoteAgentService_1.$jm);
        const remoteEnvironment = await remoteAgentService.getEnvironment();
        if (remoteEnvironment?.os === 1 /* OperatingSystem.Windows */ || !remoteEnvironment && platform_1.$i) {
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
    exports.$yVb = $yVb;
    async function $zVb(accessor) {
        const fileService = accessor.get(files_1.$6j);
        const remoteAgentService = accessor.get(remoteAgentService_1.$jm);
        let folderPrefix;
        let filePath;
        const remoteEnvironment = await remoteAgentService.getEnvironment();
        const isFileWindows = remoteEnvironment?.os === 1 /* OperatingSystem.Windows */ || !remoteEnvironment && platform_1.$i;
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
    exports.$zVb = $zVb;
    async function $AVb(accessor) {
        const fileService = accessor.get(files_1.$6j);
        const remoteAgentService = accessor.get(remoteAgentService_1.$jm);
        const remoteEnvironment = await remoteAgentService.getEnvironment();
        if (remoteEnvironment?.os === 1 /* OperatingSystem.Windows */ || !remoteEnvironment && platform_1.$i) {
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
            const sanitized = $BVb(cmds[i]).trim();
            if (sanitized.length > 0) {
                result.add(sanitized);
            }
        }
        return result.values();
    }
    exports.$AVb = $AVb;
    function $BVb(cmd) {
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
    exports.$BVb = $BVb;
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
            path: (isFileWindows ? path_1.$5d.join : path_1.$6d.join)(folderPrefix, filePath)
        });
        let content;
        try {
            content = await fileService.readFile(historyFileUri);
        }
        catch (e) {
            // Handle file not found only
            if (e instanceof files_1.$nk && e.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */) {
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
//# sourceMappingURL=history.js.map