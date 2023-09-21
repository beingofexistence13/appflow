/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/browser/web.api", "vs/workbench/browser/web.main", "vs/base/common/lifecycle", "vs/platform/commands/common/commands", "vs/base/common/performance", "vs/platform/actions/common/actions", "vs/base/common/async", "vs/base/common/arrays"], function (require, exports, web_api_1, web_main_1, lifecycle_1, commands_1, performance_1, actions_1, async_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.workspace = exports.window = exports.env = exports.logger = exports.commands = exports.$j5b = void 0;
    let created = false;
    const workbenchPromise = new async_1.$2g();
    /**
     * Creates the workbench with the provided options in the provided container.
     *
     * @param domElement the container to create the workbench in
     * @param options for setting up the workbench
     */
    function $j5b(domElement, options) {
        // Mark start of workbench
        (0, performance_1.mark)('code/didLoadWorkbenchMain');
        // Assert that the workbench is not created more than once. We currently
        // do not support this and require a full context switch to clean-up.
        if (created) {
            throw new Error('Unable to create the VSCode workbench more than once.');
        }
        else {
            created = true;
        }
        // Register commands if any
        if (Array.isArray(options.commands)) {
            for (const command of options.commands) {
                commands_1.$Gr.registerCommand(command.id, (accessor, ...args) => {
                    // we currently only pass on the arguments but not the accessor
                    // to the command to reduce our exposure of internal API.
                    return command.handler(...args);
                });
                // Commands with labels appear in the command palette
                if (command.label) {
                    for (const menu of (0, arrays_1.$1b)(command.menu ?? web_api_1.Menu.CommandPalette)) {
                        actions_1.$Tu.appendMenuItem(asMenuId(menu), { command: { id: command.id, title: command.label } });
                    }
                }
            }
        }
        // Startup workbench and resolve waiters
        let instantiatedWorkbench = undefined;
        new web_main_1.$a3b(domElement, options).open().then(workbench => {
            instantiatedWorkbench = workbench;
            workbenchPromise.complete(workbench);
        });
        return (0, lifecycle_1.$ic)(() => {
            if (instantiatedWorkbench) {
                instantiatedWorkbench.shutdown();
            }
            else {
                workbenchPromise.p.then(instantiatedWorkbench => instantiatedWorkbench.shutdown());
            }
        });
    }
    exports.$j5b = $j5b;
    function asMenuId(menu) {
        switch (menu) {
            case web_api_1.Menu.CommandPalette: return actions_1.$Ru.CommandPalette;
            case web_api_1.Menu.StatusBarWindowIndicatorMenu: return actions_1.$Ru.StatusBarWindowIndicatorMenu;
        }
    }
    var commands;
    (function (commands) {
        /**
         * {@linkcode IWorkbench.commands IWorkbench.commands.executeCommand}
         */
        async function executeCommand(command, ...args) {
            const workbench = await workbenchPromise.p;
            return workbench.commands.executeCommand(command, ...args);
        }
        commands.executeCommand = executeCommand;
    })(commands || (exports.commands = commands = {}));
    var logger;
    (function (logger) {
        /**
         * {@linkcode IWorkbench.logger IWorkbench.logger.log}
         */
        function log(level, message) {
            workbenchPromise.p.then(workbench => workbench.logger.log(level, message));
        }
        logger.log = log;
    })(logger || (exports.logger = logger = {}));
    var env;
    (function (env) {
        /**
         * {@linkcode IWorkbench.env IWorkbench.env.retrievePerformanceMarks}
         */
        async function retrievePerformanceMarks() {
            const workbench = await workbenchPromise.p;
            return workbench.env.retrievePerformanceMarks();
        }
        env.retrievePerformanceMarks = retrievePerformanceMarks;
        /**
         * {@linkcode IWorkbench.env IWorkbench.env.getUriScheme}
         */
        async function getUriScheme() {
            const workbench = await workbenchPromise.p;
            return workbench.env.getUriScheme();
        }
        env.getUriScheme = getUriScheme;
        /**
         * {@linkcode IWorkbench.env IWorkbench.env.openUri}
         */
        async function openUri(target) {
            const workbench = await workbenchPromise.p;
            return workbench.env.openUri(target);
        }
        env.openUri = openUri;
    })(env || (exports.env = env = {}));
    var window;
    (function (window) {
        /**
         * {@linkcode IWorkbench.window IWorkbench.window.withProgress}
         */
        async function withProgress(options, task) {
            const workbench = await workbenchPromise.p;
            return workbench.window.withProgress(options, task);
        }
        window.withProgress = withProgress;
        async function createTerminal(options) {
            const workbench = await workbenchPromise.p;
            workbench.window.createTerminal(options);
        }
        window.createTerminal = createTerminal;
    })(window || (exports.window = window = {}));
    var workspace;
    (function (workspace) {
        /**
         * {@linkcode IWorkbench.workspace IWorkbench.workspace.openTunnel}
         */
        async function openTunnel(tunnelOptions) {
            const workbench = await workbenchPromise.p;
            return workbench.workspace.openTunnel(tunnelOptions);
        }
        workspace.openTunnel = openTunnel;
    })(workspace || (exports.workspace = workspace = {}));
});
//# sourceMappingURL=web.factory.js.map