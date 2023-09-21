/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/base/browser/ui/tree/dataTree", "vs/base/common/async", "vs/base/parts/contextmenu/electron-sandbox/contextmenu", "vs/base/parts/sandbox/electron-sandbox/globals", "vs/platform/diagnostics/common/diagnostics", "vs/platform/files/common/files", "vs/platform/ipc/electron-sandbox/mainProcessService", "vs/platform/native/electron-sandbox/nativeHostService", "vs/platform/theme/browser/iconsStyleSheet", "vs/platform/window/electron-sandbox/window", "vs/base/browser/keyboardEvent", "vs/css!./media/processExplorer", "vs/base/browser/ui/codicons/codiconStyles"], function (require, exports, nls_1, dom_1, dataTree_1, async_1, contextmenu_1, globals_1, diagnostics_1, files_1, mainProcessService_1, nativeHostService_1, iconsStyleSheet_1, window_1, keyboardEvent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.startup = void 0;
    const DEBUG_FLAGS_PATTERN = /\s--inspect(?:-brk|port)?=(?<port>\d+)?/;
    const DEBUG_PORT_PATTERN = /\s--inspect-port=(?<port>\d+)/;
    class ProcessListDelegate {
        getHeight(element) {
            return 22;
        }
        getTemplateId(element) {
            if (isProcessItem(element)) {
                return 'process';
            }
            if (isMachineProcessInformation(element)) {
                return 'machine';
            }
            if ((0, diagnostics_1.isRemoteDiagnosticError)(element)) {
                return 'error';
            }
            if (isProcessInformation(element)) {
                return 'header';
            }
            return '';
        }
    }
    class ProcessTreeDataSource {
        hasChildren(element) {
            if ((0, diagnostics_1.isRemoteDiagnosticError)(element)) {
                return false;
            }
            if (isProcessItem(element)) {
                return !!element.children?.length;
            }
            else {
                return true;
            }
        }
        getChildren(element) {
            if (isProcessItem(element)) {
                return element.children ? element.children : [];
            }
            if ((0, diagnostics_1.isRemoteDiagnosticError)(element)) {
                return [];
            }
            if (isProcessInformation(element)) {
                // If there are multiple process roots, return these, otherwise go directly to the root process
                if (element.processRoots.length > 1) {
                    return element.processRoots;
                }
                else {
                    return [element.processRoots[0].rootProcess];
                }
            }
            if (isMachineProcessInformation(element)) {
                return [element.rootProcess];
            }
            return [element.processes];
        }
    }
    class ProcessHeaderTreeRenderer {
        constructor() {
            this.templateId = 'header';
        }
        renderTemplate(container) {
            const row = (0, dom_1.append)(container, (0, dom_1.$)('.row'));
            const name = (0, dom_1.append)(row, (0, dom_1.$)('.nameLabel'));
            const CPU = (0, dom_1.append)(row, (0, dom_1.$)('.cpu'));
            const memory = (0, dom_1.append)(row, (0, dom_1.$)('.memory'));
            const PID = (0, dom_1.append)(row, (0, dom_1.$)('.pid'));
            return { name, CPU, memory, PID };
        }
        renderElement(node, index, templateData, height) {
            templateData.name.textContent = (0, nls_1.localize)('name', "Process Name");
            templateData.CPU.textContent = (0, nls_1.localize)('cpu', "CPU (%)");
            templateData.PID.textContent = (0, nls_1.localize)('pid', "PID");
            templateData.memory.textContent = (0, nls_1.localize)('memory', "Memory (MB)");
        }
        disposeTemplate(templateData) {
            // Nothing to do
        }
    }
    class MachineRenderer {
        constructor() {
            this.templateId = 'machine';
        }
        renderTemplate(container) {
            const data = Object.create(null);
            const row = (0, dom_1.append)(container, (0, dom_1.$)('.row'));
            data.name = (0, dom_1.append)(row, (0, dom_1.$)('.nameLabel'));
            return data;
        }
        renderElement(node, index, templateData, height) {
            templateData.name.textContent = node.element.name;
        }
        disposeTemplate(templateData) {
            // Nothing to do
        }
    }
    class ErrorRenderer {
        constructor() {
            this.templateId = 'error';
        }
        renderTemplate(container) {
            const data = Object.create(null);
            const row = (0, dom_1.append)(container, (0, dom_1.$)('.row'));
            data.name = (0, dom_1.append)(row, (0, dom_1.$)('.nameLabel'));
            return data;
        }
        renderElement(node, index, templateData, height) {
            templateData.name.textContent = node.element.errorMessage;
        }
        disposeTemplate(templateData) {
            // Nothing to do
        }
    }
    class ProcessRenderer {
        constructor(platform, totalMem, mapPidToName) {
            this.platform = platform;
            this.totalMem = totalMem;
            this.mapPidToName = mapPidToName;
            this.templateId = 'process';
        }
        renderTemplate(container) {
            const row = (0, dom_1.append)(container, (0, dom_1.$)('.row'));
            const name = (0, dom_1.append)(row, (0, dom_1.$)('.nameLabel'));
            const CPU = (0, dom_1.append)(row, (0, dom_1.$)('.cpu'));
            const memory = (0, dom_1.append)(row, (0, dom_1.$)('.memory'));
            const PID = (0, dom_1.append)(row, (0, dom_1.$)('.pid'));
            return { name, CPU, PID, memory };
        }
        renderElement(node, index, templateData, height) {
            const { element } = node;
            const pid = element.pid.toFixed(0);
            let name = element.name;
            if (this.mapPidToName.has(element.pid)) {
                name = this.mapPidToName.get(element.pid);
            }
            templateData.name.textContent = name;
            templateData.name.title = element.cmd;
            templateData.CPU.textContent = element.load.toFixed(0);
            templateData.PID.textContent = pid;
            templateData.PID.parentElement.id = `pid-${pid}`;
            const memory = this.platform === 'win32' ? element.mem : (this.totalMem * (element.mem / 100));
            templateData.memory.textContent = (memory / files_1.ByteSize.MB).toFixed(0);
        }
        disposeTemplate(templateData) {
            // Nothing to do
        }
    }
    function isMachineProcessInformation(item) {
        return !!item.name && !!item.rootProcess;
    }
    function isProcessInformation(item) {
        return !!item.processRoots;
    }
    function isProcessItem(item) {
        return !!item.pid;
    }
    class ProcessExplorer {
        constructor(windowId, data) {
            this.data = data;
            this.mapPidToName = new Map();
            const mainProcessService = new mainProcessService_1.ElectronIPCMainProcessService(windowId);
            this.nativeHostService = new nativeHostService_1.NativeHostService(windowId, mainProcessService);
            this.applyStyles(data.styles);
            this.setEventHandlers(data);
            globals_1.ipcRenderer.on('vscode:pidToNameResponse', (event, pidToNames) => {
                this.mapPidToName = new Map();
                for (const [pid, name] of pidToNames) {
                    this.mapPidToName.set(pid, name);
                }
            });
            globals_1.ipcRenderer.on('vscode:listProcessesResponse', async (event, processRoots) => {
                processRoots.forEach((info, index) => {
                    if (isProcessItem(info.rootProcess)) {
                        info.rootProcess.name = index === 0 ? `${this.data.applicationName} main` : 'remote agent';
                    }
                });
                if (!this.tree) {
                    await this.createProcessTree(processRoots);
                }
                else {
                    this.tree.setInput({ processes: { processRoots } });
                    this.tree.layout(window.innerHeight, window.innerWidth);
                }
                this.requestProcessList(0);
            });
            this.lastRequestTime = Date.now();
            globals_1.ipcRenderer.send('vscode:pidToNameRequest');
            globals_1.ipcRenderer.send('vscode:listProcesses');
        }
        setEventHandlers(data) {
            document.onkeydown = (e) => {
                const cmdOrCtrlKey = data.platform === 'darwin' ? e.metaKey : e.ctrlKey;
                // Cmd/Ctrl + w closes issue window
                if (cmdOrCtrlKey && e.keyCode === 87) {
                    e.stopPropagation();
                    e.preventDefault();
                    globals_1.ipcRenderer.send('vscode:closeProcessExplorer');
                }
                // Cmd/Ctrl + zooms in
                if (cmdOrCtrlKey && e.keyCode === 187) {
                    (0, window_1.zoomIn)();
                }
                // Cmd/Ctrl - zooms out
                if (cmdOrCtrlKey && e.keyCode === 189) {
                    (0, window_1.zoomOut)();
                }
            };
        }
        async createProcessTree(processRoots) {
            const container = document.getElementById('process-list');
            if (!container) {
                return;
            }
            const { totalmem } = await this.nativeHostService.getOSStatistics();
            const renderers = [
                new ProcessRenderer(this.data.platform, totalmem, this.mapPidToName),
                new ProcessHeaderTreeRenderer(),
                new MachineRenderer(),
                new ErrorRenderer()
            ];
            this.tree = new dataTree_1.DataTree('processExplorer', container, new ProcessListDelegate(), renderers, new ProcessTreeDataSource(), {
                identityProvider: {
                    getId: (element) => {
                        if (isProcessItem(element)) {
                            return element.pid.toString();
                        }
                        if ((0, diagnostics_1.isRemoteDiagnosticError)(element)) {
                            return element.hostName;
                        }
                        if (isProcessInformation(element)) {
                            return 'processes';
                        }
                        if (isMachineProcessInformation(element)) {
                            return element.name;
                        }
                        return 'header';
                    }
                }
            });
            this.tree.setInput({ processes: { processRoots } });
            this.tree.layout(window.innerHeight, window.innerWidth);
            this.tree.onKeyDown(e => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.keyCode === 35 /* KeyCode.KeyE */ && event.altKey) {
                    const selectionPids = this.getSelectedPids();
                    void Promise.all(selectionPids.map((pid) => this.nativeHostService.killProcess(pid, 'SIGTERM'))).then(() => this.tree?.refresh());
                }
            });
            this.tree.onContextMenu(e => {
                if (isProcessItem(e.element)) {
                    this.showContextMenu(e.element, true);
                }
            });
            container.style.height = `${window.innerHeight}px`;
            window.addEventListener('resize', () => {
                container.style.height = `${window.innerHeight}px`;
                this.tree?.layout(window.innerHeight, window.innerWidth);
            });
        }
        isDebuggable(cmd) {
            const matches = DEBUG_FLAGS_PATTERN.exec(cmd);
            return (matches && matches.groups.port !== '0') || cmd.indexOf('node ') >= 0 || cmd.indexOf('node.exe') >= 0;
        }
        attachTo(item) {
            const config = {
                type: 'node',
                request: 'attach',
                name: `process ${item.pid}`
            };
            let matches = DEBUG_FLAGS_PATTERN.exec(item.cmd);
            if (matches) {
                config.port = Number(matches.groups.port);
            }
            else {
                // no port -> try to attach via pid (send SIGUSR1)
                config.processId = String(item.pid);
            }
            // a debug-port=n or inspect-port=n overrides the port
            matches = DEBUG_PORT_PATTERN.exec(item.cmd);
            if (matches) {
                // override port
                config.port = Number(matches.groups.port);
            }
            globals_1.ipcRenderer.send('vscode:workbenchCommand', { id: 'debug.startFromConfig', from: 'processExplorer', args: [config] });
        }
        applyStyles(styles) {
            const styleElement = (0, dom_1.createStyleSheet)();
            const content = [];
            if (styles.listFocusBackground) {
                content.push(`.monaco-list:focus .monaco-list-row.focused { background-color: ${styles.listFocusBackground}; }`);
                content.push(`.monaco-list:focus .monaco-list-row.focused:hover { background-color: ${styles.listFocusBackground}; }`);
            }
            if (styles.listFocusForeground) {
                content.push(`.monaco-list:focus .monaco-list-row.focused { color: ${styles.listFocusForeground}; }`);
            }
            if (styles.listActiveSelectionBackground) {
                content.push(`.monaco-list:focus .monaco-list-row.selected { background-color: ${styles.listActiveSelectionBackground}; }`);
                content.push(`.monaco-list:focus .monaco-list-row.selected:hover { background-color: ${styles.listActiveSelectionBackground}; }`);
            }
            if (styles.listActiveSelectionForeground) {
                content.push(`.monaco-list:focus .monaco-list-row.selected { color: ${styles.listActiveSelectionForeground}; }`);
            }
            if (styles.listHoverBackground) {
                content.push(`.monaco-list-row:hover:not(.selected):not(.focused) { background-color: ${styles.listHoverBackground}; }`);
            }
            if (styles.listHoverForeground) {
                content.push(`.monaco-list-row:hover:not(.selected):not(.focused) { color: ${styles.listHoverForeground}; }`);
            }
            if (styles.listFocusOutline) {
                content.push(`.monaco-list:focus .monaco-list-row.focused { outline: 1px solid ${styles.listFocusOutline}; outline-offset: -1px; }`);
            }
            if (styles.listHoverOutline) {
                content.push(`.monaco-list-row:hover { outline: 1px dashed ${styles.listHoverOutline}; outline-offset: -1px; }`);
            }
            // Scrollbars
            if (styles.scrollbarShadowColor) {
                content.push(`
				.monaco-scrollable-element > .shadow.top {
					box-shadow: ${styles.scrollbarShadowColor} 0 6px 6px -6px inset;
				}

				.monaco-scrollable-element > .shadow.left {
					box-shadow: ${styles.scrollbarShadowColor} 6px 0 6px -6px inset;
				}

				.monaco-scrollable-element > .shadow.top.left {
					box-shadow: ${styles.scrollbarShadowColor} 6px 6px 6px -6px inset;
				}
			`);
            }
            if (styles.scrollbarSliderBackgroundColor) {
                content.push(`
				.monaco-scrollable-element > .scrollbar > .slider {
					background: ${styles.scrollbarSliderBackgroundColor};
				}
			`);
            }
            if (styles.scrollbarSliderHoverBackgroundColor) {
                content.push(`
				.monaco-scrollable-element > .scrollbar > .slider:hover {
					background: ${styles.scrollbarSliderHoverBackgroundColor};
				}
			`);
            }
            if (styles.scrollbarSliderActiveBackgroundColor) {
                content.push(`
				.monaco-scrollable-element > .scrollbar > .slider.active {
					background: ${styles.scrollbarSliderActiveBackgroundColor};
				}
			`);
            }
            styleElement.textContent = content.join('\n');
            if (styles.color) {
                document.body.style.color = styles.color;
            }
        }
        showContextMenu(item, isLocal) {
            const items = [];
            const pid = Number(item.pid);
            if (isLocal) {
                items.push({
                    accelerator: 'Alt+E',
                    label: (0, nls_1.localize)('killProcess', "Kill Process"),
                    click: () => {
                        this.nativeHostService.killProcess(pid, 'SIGTERM');
                    }
                });
                items.push({
                    label: (0, nls_1.localize)('forceKillProcess', "Force Kill Process"),
                    click: () => {
                        this.nativeHostService.killProcess(pid, 'SIGKILL');
                    }
                });
                items.push({
                    type: 'separator'
                });
            }
            items.push({
                label: (0, nls_1.localize)('copy', "Copy"),
                click: () => {
                    // Collect the selected pids
                    const selectionPids = this.getSelectedPids();
                    // If the selection does not contain the right clicked item, copy the right clicked
                    // item only.
                    if (!selectionPids?.includes(pid)) {
                        selectionPids.length = 0;
                        selectionPids.push(pid);
                    }
                    const rows = selectionPids?.map(e => document.getElementById(`pid-${e}`)).filter(e => !!e);
                    if (rows) {
                        const text = rows.map(e => e.innerText).filter(e => !!e);
                        this.nativeHostService.writeClipboardText(text.join('\n'));
                    }
                }
            });
            items.push({
                label: (0, nls_1.localize)('copyAll', "Copy All"),
                click: () => {
                    const processList = document.getElementById('process-list');
                    if (processList) {
                        this.nativeHostService.writeClipboardText(processList.innerText);
                    }
                }
            });
            if (item && isLocal && this.isDebuggable(item.cmd)) {
                items.push({
                    type: 'separator'
                });
                items.push({
                    label: (0, nls_1.localize)('debug', "Debug"),
                    click: () => {
                        this.attachTo(item);
                    }
                });
            }
            (0, contextmenu_1.popup)(items);
        }
        requestProcessList(totalWaitTime) {
            setTimeout(() => {
                const nextRequestTime = Date.now();
                const waited = totalWaitTime + nextRequestTime - this.lastRequestTime;
                this.lastRequestTime = nextRequestTime;
                // Wait at least a second between requests.
                if (waited > 1000) {
                    globals_1.ipcRenderer.send('vscode:pidToNameRequest');
                    globals_1.ipcRenderer.send('vscode:listProcesses');
                }
                else {
                    this.requestProcessList(waited);
                }
            }, 200);
        }
        getSelectedPids() {
            return this.tree?.getSelection()?.map(e => {
                if (!e || !('pid' in e)) {
                    return undefined;
                }
                return e.pid;
            }).filter(e => !!e);
        }
    }
    function createCodiconStyleSheet() {
        const codiconStyleSheet = (0, dom_1.createStyleSheet)();
        codiconStyleSheet.id = 'codiconStyles';
        const iconsStyleSheet = (0, iconsStyleSheet_1.getIconsStyleSheet)(undefined);
        function updateAll() {
            codiconStyleSheet.textContent = iconsStyleSheet.getCSS();
        }
        const delayer = new async_1.RunOnceScheduler(updateAll, 0);
        iconsStyleSheet.onDidChange(() => delayer.schedule());
        delayer.schedule();
    }
    function startup(configuration) {
        const platformClass = configuration.data.platform === 'win32' ? 'windows' : configuration.data.platform === 'linux' ? 'linux' : 'mac';
        document.body.classList.add(platformClass); // used by our fonts
        createCodiconStyleSheet();
        (0, window_1.applyZoom)(configuration.data.zoomLevel);
        new ProcessExplorer(configuration.windowId, configuration.data);
    }
    exports.startup = startup;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvY2Vzc0V4cGxvcmVyTWFpbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2NvZGUvZWxlY3Ryb24tc2FuZGJveC9wcm9jZXNzRXhwbG9yZXIvcHJvY2Vzc0V4cGxvcmVyTWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUF5QmhHLE1BQU0sbUJBQW1CLEdBQUcseUNBQXlDLENBQUM7SUFDdEUsTUFBTSxrQkFBa0IsR0FBRywrQkFBK0IsQ0FBQztJQUUzRCxNQUFNLG1CQUFtQjtRQUN4QixTQUFTLENBQUMsT0FBeUU7WUFDbEYsT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDO1FBRUQsYUFBYSxDQUFDLE9BQThGO1lBQzNHLElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUMzQixPQUFPLFNBQVMsQ0FBQzthQUNqQjtZQUVELElBQUksMkJBQTJCLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ3pDLE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1lBRUQsSUFBSSxJQUFBLHFDQUF1QixFQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNyQyxPQUFPLE9BQU8sQ0FBQzthQUNmO1lBRUQsSUFBSSxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDbEMsT0FBTyxRQUFRLENBQUM7YUFDaEI7WUFFRCxPQUFPLEVBQUUsQ0FBQztRQUNYLENBQUM7S0FDRDtJQVlELE1BQU0scUJBQXFCO1FBQzFCLFdBQVcsQ0FBQyxPQUE0RztZQUN2SCxJQUFJLElBQUEscUNBQXVCLEVBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ3JDLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFFRCxJQUFJLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDM0IsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUM7YUFDbEM7aUJBQU07Z0JBQ04sT0FBTyxJQUFJLENBQUM7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