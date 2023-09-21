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
define(["require", "exports", "vs/base/common/async", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform"], function (require, exports, async_1, decorators_1, event_1, lifecycle_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WindowsShellHelper = void 0;
    const SHELL_EXECUTABLES = [
        'cmd.exe',
        'powershell.exe',
        'pwsh.exe',
        'bash.exe',
        'wsl.exe',
        'ubuntu.exe',
        'ubuntu1804.exe',
        'kali.exe',
        'debian.exe',
        'opensuse-42.exe',
        'sles-12.exe'
    ];
    let windowsProcessTree;
    class WindowsShellHelper extends lifecycle_1.Disposable {
        get shellType() { return this._shellType; }
        get shellTitle() { return this._shellTitle; }
        get onShellNameChanged() { return this._onShellNameChanged.event; }
        get onShellTypeChanged() { return this._onShellTypeChanged.event; }
        constructor(_rootProcessId) {
            super();
            this._rootProcessId = _rootProcessId;
            this._shellTitle = '';
            this._onShellNameChanged = new event_1.Emitter();
            this._onShellTypeChanged = new event_1.Emitter();
            if (!platform_1.isWindows) {
                throw new Error(`WindowsShellHelper cannot be instantiated on ${platform_1.platform}`);
            }
            this._startMonitoringShell();
        }
        async _startMonitoringShell() {
            if (this._store.isDisposed) {
                return;
            }
            this.checkShell();
        }
        async checkShell() {
            if (platform_1.isWindows) {
                // Wait to give the shell some time to actually launch a process, this
                // could lead to a race condition but it would be recovered from when
                // data stops and should cover the majority of cases
                await (0, async_1.timeout)(300);
                this.getShellName().then(title => {
                    const type = this.getShellType(title);
                    if (type !== this._shellType) {
                        this._onShellTypeChanged.fire(type);
                        this._onShellNameChanged.fire(title);
                        this._shellType = type;
                        this._shellTitle = title;
                    }
                });
            }
        }
        traverseTree(tree) {
            if (!tree) {
                return '';
            }
            if (SHELL_EXECUTABLES.indexOf(tree.name) === -1) {
                return tree.name;
            }
            if (!tree.children || tree.children.length === 0) {
                return tree.name;
            }
            let favouriteChild = 0;
            for (; favouriteChild < tree.children.length; favouriteChild++) {
                const child = tree.children[favouriteChild];
                if (!child.children || child.children.length === 0) {
                    break;
                }
                if (child.children[0].name !== 'conhost.exe') {
                    break;
                }
            }
            if (favouriteChild >= tree.children.length) {
                return tree.name;
            }
            return this.traverseTree(tree.children[favouriteChild]);
        }
        /**
         * Returns the innermost shell executable running in the terminal
         */
        async getShellName() {
            if (this._store.isDisposed) {
                return Promise.resolve('');
            }
            // Prevent multiple requests at once, instead return current request
            if (this._currentRequest) {
                return this._currentRequest;
            }
            if (!windowsProcessTree) {
                windowsProcessTree = await new Promise((resolve_1, reject_1) => { require(['@vscode/windows-process-tree'], resolve_1, reject_1); });
            }
            this._currentRequest = new Promise(resolve => {
                windowsProcessTree.getProcessTree(this._rootProcessId, tree => {
                    const name = this.traverseTree(tree);
                    this._currentRequest = undefined;
                    resolve(name);
                });
            });
            return this._currentRequest;
        }
        getShellType(executable) {
            switch (executable.toLowerCase()) {
                case 'cmd.exe':
                    return "cmd" /* WindowsShellType.CommandPrompt */;
                case 'powershell.exe':
                case 'pwsh.exe':
                    return "pwsh" /* WindowsShellType.PowerShell */;
                case 'bash.exe':
                case 'git-cmd.exe':
                    return "gitbash" /* WindowsShellType.GitBash */;
                case 'wsl.exe':
                case 'ubuntu.exe':
                case 'ubuntu1804.exe':
                case 'kali.exe':
                case 'debian.exe':
                case 'opensuse-42.exe':
                case 'sles-12.exe':
                    return "wsl" /* WindowsShellType.Wsl */;
                default:
                    return undefined;
            }
        }
    }
    exports.WindowsShellHelper = WindowsShellHelper;
    __decorate([
        (0, decorators_1.debounce)(500)
    ], WindowsShellHelper.prototype, "checkShell", null);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93c1NoZWxsSGVscGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdGVybWluYWwvbm9kZS93aW5kb3dzU2hlbGxIZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7O0lBaUJoRyxNQUFNLGlCQUFpQixHQUFHO1FBQ3pCLFNBQVM7UUFDVCxnQkFBZ0I7UUFDaEIsVUFBVTtRQUNWLFVBQVU7UUFDVixTQUFTO1FBQ1QsWUFBWTtRQUNaLGdCQUFnQjtRQUNoQixVQUFVO1FBQ1YsWUFBWTtRQUNaLGlCQUFpQjtRQUNqQixhQUFhO0tBQ2IsQ0FBQztJQUVGLElBQUksa0JBQWlELENBQUM7SUFFdEQsTUFBYSxrQkFBbUIsU0FBUSxzQkFBVTtRQUdqRCxJQUFJLFNBQVMsS0FBb0MsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUUxRSxJQUFJLFVBQVUsS0FBYSxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBRXJELElBQUksa0JBQWtCLEtBQW9CLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFFbEYsSUFBSSxrQkFBa0IsS0FBMkMsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUV6RyxZQUNTLGNBQXNCO1lBRTlCLEtBQUssRUFBRSxDQUFDO1lBRkEsbUJBQWMsR0FBZCxjQUFjLENBQVE7WUFSdkIsZ0JBQVcsR0FBVyxFQUFFLENBQUM7WUFFaEIsd0JBQW1CLEdBQUcsSUFBSSxlQUFPLEVBQVUsQ0FBQztZQUU1Qyx3QkFBbUIsR0FBRyxJQUFJLGVBQU8sRUFBaUMsQ0FBQztZQVFuRixJQUFJLENBQUMsb0JBQVMsRUFBRTtnQkFDZixNQUFNLElBQUksS0FBSyxDQUFDLGdEQUFnRCxtQkFBUSxFQUFFLENB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