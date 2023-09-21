/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/code/electron-sandbox/processExplorer/processExplorerMain", "vs/base/browser/dom", "vs/base/browser/ui/tree/dataTree", "vs/base/common/async", "vs/base/parts/contextmenu/electron-sandbox/contextmenu", "vs/base/parts/sandbox/electron-sandbox/globals", "vs/platform/diagnostics/common/diagnostics", "vs/platform/files/common/files", "vs/platform/ipc/electron-sandbox/mainProcessService", "vs/platform/native/electron-sandbox/nativeHostService", "vs/platform/theme/browser/iconsStyleSheet", "vs/platform/window/electron-sandbox/window", "vs/base/browser/keyboardEvent", "vs/css!./media/processExplorer", "vs/base/browser/ui/codicons/codiconStyles"], function (require, exports, nls_1, dom_1, dataTree_1, async_1, contextmenu_1, globals_1, diagnostics_1, files_1, mainProcessService_1, nativeHostService_1, iconsStyleSheet_1, window_1, keyboardEvent_1) {
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
            if ((0, diagnostics_1.$hm)(element)) {
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
            if ((0, diagnostics_1.$hm)(element)) {
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
            if ((0, diagnostics_1.$hm)(element)) {
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
            const row = (0, dom_1.$0O)(container, (0, dom_1.$)('.row'));
            const name = (0, dom_1.$0O)(row, (0, dom_1.$)('.nameLabel'));
            const CPU = (0, dom_1.$0O)(row, (0, dom_1.$)('.cpu'));
            const memory = (0, dom_1.$0O)(row, (0, dom_1.$)('.memory'));
            const PID = (0, dom_1.$0O)(row, (0, dom_1.$)('.pid'));
            return { name, CPU, memory, PID };
        }
        renderElement(node, index, templateData, height) {
            templateData.name.textContent = (0, nls_1.localize)(0, null);
            templateData.CPU.textContent = (0, nls_1.localize)(1, null);
            templateData.PID.textContent = (0, nls_1.localize)(2, null);
            templateData.memory.textContent = (0, nls_1.localize)(3, null);
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
            const row = (0, dom_1.$0O)(container, (0, dom_1.$)('.row'));
            data.name = (0, dom_1.$0O)(row, (0, dom_1.$)('.nameLabel'));
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
            const row = (0, dom_1.$0O)(container, (0, dom_1.$)('.row'));
            data.name = (0, dom_1.$0O)(row, (0, dom_1.$)('.nameLabel'));
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
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.templateId = 'process';
        }
        renderTemplate(container) {
            const row = (0, dom_1.$0O)(container, (0, dom_1.$)('.row'));
            const name = (0, dom_1.$0O)(row, (0, dom_1.$)('.nameLabel'));
            const CPU = (0, dom_1.$0O)(row, (0, dom_1.$)('.cpu'));
            const memory = (0, dom_1.$0O)(row, (0, dom_1.$)('.memory'));
            const PID = (0, dom_1.$0O)(row, (0, dom_1.$)('.pid'));
            return { name, CPU, PID, memory };
        }
        renderElement(node, index, templateData, height) {
            const { element } = node;
            const pid = element.pid.toFixed(0);
            let name = element.name;
            if (this.c.has(element.pid)) {
                name = this.c.get(element.pid);
            }
            templateData.name.textContent = name;
            templateData.name.title = element.cmd;
            templateData.CPU.textContent = element.load.toFixed(0);
            templateData.PID.textContent = pid;
            templateData.PID.parentElement.id = `pid-${pid}`;
            const memory = this.a === 'win32' ? element.mem : (this.b * (element.mem / 100));
            templateData.memory.textContent = (memory / files_1.$Ak.MB).toFixed(0);
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
        constructor(windowId, f) {
            this.f = f;
            this.b = new Map();
            const mainProcessService = new mainProcessService_1.$q7b(windowId);
            this.c = new nativeHostService_1.$r7b(windowId, mainProcessService);
            this.k(f.styles);
            this.g(f);
            globals_1.$M.on('vscode:pidToNameResponse', (event, pidToNames) => {
                this.b = new Map();
                for (const [pid, name] of pidToNames) {
                    this.b.set(pid, name);
                }
            });
            globals_1.$M.on('vscode:listProcessesResponse', async (event, processRoots) => {
                processRoots.forEach((info, index) => {
                    if (isProcessItem(info.rootProcess)) {
                        info.rootProcess.name = index === 0 ? `${this.f.applicationName} main` : 'remote agent';
                    }
                });
                if (!this.d) {
                    await this.h(processRoots);
                }
                else {
                    this.d.setInput({ processes: { processRoots } });
                    this.d.layout(window.innerHeight, window.innerWidth);
                }
                this.m(0);
            });
            this.a = Date.now();
            globals_1.$M.send('vscode:pidToNameRequest');
            globals_1.$M.send('vscode:listProcesses');
        }
        g(data) {
            document.onkeydown = (e) => {
                const cmdOrCtrlKey = data.platform === 'darwin' ? e.metaKey : e.ctrlKey;
                // Cmd/Ctrl + w closes issue window
                if (cmdOrCtrlKey && e.keyCode === 87) {
                    e.stopPropagation();
                    e.preventDefault();
                    globals_1.$M.send('vscode:closeProcessExplorer');
                }
                // Cmd/Ctrl + zooms in
                if (cmdOrCtrlKey && e.keyCode === 187) {
                    (0, window_1.$u7b)();
                }
                // Cmd/Ctrl - zooms out
                if (cmdOrCtrlKey && e.keyCode === 189) {
                    (0, window_1.$v7b)();
                }
            };
        }
        async h(processRoots) {
            const container = document.getElementById('process-list');
            if (!container) {
                return;
            }
            const { totalmem } = await this.c.getOSStatistics();
            const renderers = [
                new ProcessRenderer(this.f.platform, totalmem, this.b),
                new ProcessHeaderTreeRenderer(),
                new MachineRenderer(),
                new ErrorRenderer()
            ];
            this.d = new dataTree_1.$qS('processExplorer', container, new ProcessListDelegate(), renderers, new ProcessTreeDataSource(), {
                identityProvider: {
                    getId: (element) => {
                        if (isProcessItem(element)) {
                            return element.pid.toString();
                        }
                        if ((0, diagnostics_1.$hm)(element)) {
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
            this.d.setInput({ processes: { processRoots } });
            this.d.layout(window.innerHeight, window.innerWidth);
            this.d.onKeyDown(e => {
                const event = new keyboardEvent_1.$jO(e);
                if (event.keyCode === 35 /* KeyCode.KeyE */ && event.altKey) {
                    const selectionPids = this.n();
                    void Promise.all(selectionPids.map((pid) => this.c.killProcess(pid, 'SIGTERM'))).then(() => this.d?.refresh());
                }
            });
            this.d.onContextMenu(e => {
                if (isProcessItem(e.element)) {
                    this.l(e.element, true);
                }
            });
            container.style.height = `${window.innerHeight}px`;
            window.addEventListener('resize', () => {
                container.style.height = `${window.innerHeight}px`;
                this.d?.layout(window.innerHeight, window.innerWidth);
            });
        }
        i(cmd) {
            const matches = DEBUG_FLAGS_PATTERN.exec(cmd);
            return (matches && matches.groups.port !== '0') || cmd.indexOf('node ') >= 0 || cmd.indexOf('node.exe') >= 0;
        }
        j(item) {
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
            globals_1.$M.send('vscode:workbenchCommand', { id: 'debug.startFromConfig', from: 'processExplorer', args: [config] });
        }
        k(styles) {
            const styleElement = (0, dom_1.$XO)();
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
        l(item, isLocal) {
            const items = [];
            const pid = Number(item.pid);
            if (isLocal) {
                items.push({
                    accelerator: 'Alt+E',
                    label: (0, nls_1.localize)(4, null),
                    click: () => {
                        this.c.killProcess(pid, 'SIGTERM');
                    }
                });
                items.push({
                    label: (0, nls_1.localize)(5, null),
                    click: () => {
                        this.c.killProcess(pid, 'SIGKILL');
                    }
                });
                items.push({
                    type: 'separator'
                });
            }
            items.push({
                label: (0, nls_1.localize)(6, null),
                click: () => {
                    // Collect the selected pids
                    const selectionPids = this.n();
                    // If the selection does not contain the right clicked item, copy the right clicked
                    // item only.
                    if (!selectionPids?.includes(pid)) {
                        selectionPids.length = 0;
                        selectionPids.push(pid);
                    }
                    const rows = selectionPids?.map(e => document.getElementById(`pid-${e}`)).filter(e => !!e);
                    if (rows) {
                        const text = rows.map(e => e.innerText).filter(e => !!e);
                        this.c.writeClipboardText(text.join('\n'));
                    }
                }
            });
            items.push({
                label: (0, nls_1.localize)(7, null),
                click: () => {
                    const processList = document.getElementById('process-list');
                    if (processList) {
                        this.c.writeClipboardText(processList.innerText);
                    }
                }
            });
            if (item && isLocal && this.i(item.cmd)) {
                items.push({
                    type: 'separator'
                });
                items.push({
                    label: (0, nls_1.localize)(8, null),
                    click: () => {
                        this.j(item);
                    }
                });
            }
            (0, contextmenu_1.$WS)(items);
        }
        m(totalWaitTime) {
            setTimeout(() => {
                const nextRequestTime = Date.now();
                const waited = totalWaitTime + nextRequestTime - this.a;
                this.a = nextRequestTime;
                // Wait at least a second between requests.
                if (waited > 1000) {
                    globals_1.$M.send('vscode:pidToNameRequest');
                    globals_1.$M.send('vscode:listProcesses');
                }
                else {
                    this.m(waited);
                }
            }, 200);
        }
        n() {
            return this.d?.getSelection()?.map(e => {
                if (!e || !('pid' in e)) {
                    return undefined;
                }
                return e.pid;
            }).filter(e => !!e);
        }
    }
    function createCodiconStyleSheet() {
        const codiconStyleSheet = (0, dom_1.$XO)();
        codiconStyleSheet.id = 'codiconStyles';
        const iconsStyleSheet = (0, iconsStyleSheet_1.$yzb)(undefined);
        function updateAll() {
            codiconStyleSheet.textContent = iconsStyleSheet.getCSS();
        }
        const delayer = new async_1.$Sg(updateAll, 0);
        iconsStyleSheet.onDidChange(() => delayer.schedule());
        delayer.schedule();
    }
    function startup(configuration) {
        const platformClass = configuration.data.platform === 'win32' ? 'windows' : configuration.data.platform === 'linux' ? 'linux' : 'mac';
        document.body.classList.add(platformClass); // used by our fonts
        createCodiconStyleSheet();
        (0, window_1.$t7b)(configuration.data.zoomLevel);
        new ProcessExplorer(configuration.windowId, configuration.data);
    }
    exports.startup = startup;
});
//# sourceMappingURL=processExplorerMain.js.map