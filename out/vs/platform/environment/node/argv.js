/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "minimist", "vs/base/common/platform", "vs/nls"], function (require, exports, minimist, platform_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildVersionMessage = exports.buildHelpMessage = exports.formatOptions = exports.parseArgs = exports.OPTIONS = exports.NATIVE_CLI_COMMANDS = void 0;
    /**
     * This code is also used by standalone cli's. Avoid adding any other dependencies.
     */
    const helpCategories = {
        o: (0, nls_1.localize)('optionsUpperCase', "Options"),
        e: (0, nls_1.localize)('extensionsManagement', "Extensions Management"),
        t: (0, nls_1.localize)('troubleshooting', "Troubleshooting")
    };
    exports.NATIVE_CLI_COMMANDS = ['tunnel', 'serve-web'];
    exports.OPTIONS = {
        'tunnel': {
            type: 'subcommand',
            description: 'Make the current machine accessible from vscode.dev or other machines through a secure tunnel',
            options: {
                'cli-data-dir': { type: 'string', args: 'dir', description: (0, nls_1.localize)('cliDataDir', "Directory where CLI metadata should be stored.") },
                'disable-telemetry': { type: 'boolean' },
                'telemetry-level': { type: 'string' },
                user: {
                    type: 'subcommand',
                    options: {
                        login: {
                            type: 'subcommand',
                            options: {
                                provider: { type: 'string' },
                                'access-token': { type: 'string' }
                            }
                        }
                    }
                }
            }
        },
        'serve-web': {
            type: 'subcommand',
            description: 'Make the current machine accessible from vscode.dev or other machines through a secure tunnel',
            options: {
                'cli-data-dir': { type: 'string', args: 'dir', description: (0, nls_1.localize)('cliDataDir', "Directory where CLI metadata should be stored.") },
                'disable-telemetry': { type: 'boolean' },
                'telemetry-level': { type: 'string' },
            }
        },
        'diff': { type: 'boolean', cat: 'o', alias: 'd', args: ['file', 'file'], description: (0, nls_1.localize)('diff', "Compare two files with each other.") },
        'merge': { type: 'boolean', cat: 'o', alias: 'm', args: ['path1', 'path2', 'base', 'result'], description: (0, nls_1.localize)('merge', "Perform a three-way merge by providing paths for two modified versions of a file, the common origin of both modified versions and the output file to save merge results.") },
        'add': { type: 'boolean', cat: 'o', alias: 'a', args: 'folder', description: (0, nls_1.localize)('add', "Add folder(s) to the last active window.") },
        'goto': { type: 'boolean', cat: 'o', alias: 'g', args: 'file:line[:character]', description: (0, nls_1.localize)('goto', "Open a file at the path on the specified line and character position.") },
        'new-window': { type: 'boolean', cat: 'o', alias: 'n', description: (0, nls_1.localize)('newWindow', "Force to open a new window.") },
        'reuse-window': { type: 'boolean', cat: 'o', alias: 'r', description: (0, nls_1.localize)('reuseWindow', "Force to open a file or folder in an already opened window.") },
        'wait': { type: 'boolean', cat: 'o', alias: 'w', description: (0, nls_1.localize)('wait', "Wait for the files to be closed before returning.") },
        'waitMarkerFilePath': { type: 'string' },
        'locale': { type: 'string', cat: 'o', args: 'locale', description: (0, nls_1.localize)('locale', "The locale to use (e.g. en-US or zh-TW).") },
        'user-data-dir': { type: 'string', cat: 'o', args: 'dir', description: (0, nls_1.localize)('userDataDir', "Specifies the directory that user data is kept in. Can be used to open multiple distinct instances of Code.") },
        'profile': { type: 'string', 'cat': 'o', args: 'profileName', description: (0, nls_1.localize)('profileName', "Opens the provided folder or workspace with the given profile and associates the profile with the workspace. If the profile does not exist, a new empty one is created. A folder or workspace must be provided for the profile to take effect.") },
        'help': { type: 'boolean', cat: 'o', alias: 'h', description: (0, nls_1.localize)('help', "Print usage.") },
        'extensions-dir': { type: 'string', deprecates: ['extensionHomePath'], cat: 'e', args: 'dir', description: (0, nls_1.localize)('extensionHomePath', "Set the root path for extensions.") },
        'extensions-download-dir': { type: 'string' },
        'builtin-extensions-dir': { type: 'string' },
        'list-extensions': { type: 'boolean', cat: 'e', description: (0, nls_1.localize)('listExtensions', "List the installed extensions.") },
        'show-versions': { type: 'boolean', cat: 'e', description: (0, nls_1.localize)('showVersions', "Show versions of installed extensions, when using --list-extensions.") },
        'category': { type: 'string', allowEmptyValue: true, cat: 'e', description: (0, nls_1.localize)('category', "Filters installed extensions by provided category, when using --list-extensions."), args: 'category' },
        'install-extension': { type: 'string[]', cat: 'e', args: 'ext-id | path', description: (0, nls_1.localize)('installExtension', "Installs or updates an extension. The argument is either an extension id or a path to a VSIX. The identifier of an extension is '${publisher}.${name}'. Use '--force' argument to update to latest version. To install a specific version provide '@${version}'. For example: 'vscode.csharp@1.2.3'.") },
        'pre-release': { type: 'boolean', cat: 'e', description: (0, nls_1.localize)('install prerelease', "Installs the pre-release version of the extension, when using --install-extension") },
        'uninstall-extension': { type: 'string[]', cat: 'e', args: 'ext-id', description: (0, nls_1.localize)('uninstallExtension', "Uninstalls an extension.") },
        'enable-proposed-api': { type: 'string[]', allowEmptyValue: true, cat: 'e', args: 'ext-id', description: (0, nls_1.localize)('experimentalApis', "Enables proposed API features for extensions. Can receive one or more extension IDs to enable individually.") },
        'version': { type: 'boolean', cat: 't', alias: 'v', description: (0, nls_1.localize)('version', "Print version.") },
        'verbose': { type: 'boolean', cat: 't', global: true, description: (0, nls_1.localize)('verbose', "Print verbose output (implies --wait).") },
        'log': { type: 'string[]', cat: 't', args: 'level', global: true, description: (0, nls_1.localize)('log', "Log level to use. Default is 'info'. Allowed values are 'critical', 'error', 'warn', 'info', 'debug', 'trace', 'off'. You can also configure the log level of an extension by passing extension id and log level in the following format: '${publisher}.${name}:${logLevel}'. For example: 'vscode.csharp:trace'. Can receive one or more such entries.") },
        'status': { type: 'boolean', alias: 's', cat: 't', description: (0, nls_1.localize)('status', "Print process usage and diagnostics information.") },
        'prof-startup': { type: 'boolean', cat: 't', description: (0, nls_1.localize)('prof-startup', "Run CPU profiler during startup.") },
        'prof-append-timers': { type: 'string' },
        'prof-duration-markers': { type: 'string[]' },
        'prof-duration-markers-file': { type: 'string' },
        'no-cached-data': { type: 'boolean' },
        'prof-startup-prefix': { type: 'string' },
        'prof-v8-extensions': { type: 'boolean' },
        'disable-extensions': { type: 'boolean', deprecates: ['disableExtensions'], cat: 't', description: (0, nls_1.localize)('disableExtensions', "Disable all installed extensions. This option is not persisted and is effective only when the command opens a new window.") },
        'disable-extension': { type: 'string[]', cat: 't', args: 'ext-id', description: (0, nls_1.localize)('disableExtension', "Disable the provided extension. This option is not persisted and is effective only when the command opens a new window.") },
        'sync': { type: 'string', cat: 't', description: (0, nls_1.localize)('turn sync', "Turn sync on or off."), args: ['on | off'] },
        'inspect-extensions': { type: 'string', allowEmptyValue: true, deprecates: ['debugPluginHost'], args: 'port', cat: 't', description: (0, nls_1.localize)('inspect-extensions', "Allow debugging and profiling of extensions. Check the developer tools for the connection URI.") },
        'inspect-brk-extensions': { type: 'string', allowEmptyValue: true, deprecates: ['debugBrkPluginHost'], args: 'port', cat: 't', description: (0, nls_1.localize)('inspect-brk-extensions', "Allow debugging and profiling of extensions with the extension host being paused after start. Check the developer tools for the connection URI.") },
        'disable-gpu': { type: 'boolean', cat: 't', description: (0, nls_1.localize)('disableGPU', "Disable GPU hardware acceleration.") },
        'disable-chromium-sandbox': { type: 'boolean', cat: 't', description: (0, nls_1.localize)('disableChromiumSandbox', "Use this option only when there is requirement to launch the application as sudo user on Linux or when running as an elevated user in an applocker environment on Windows.") },
        'ms-enable-electron-run-as-node': { type: 'boolean', global: true },
        'telemetry': { type: 'boolean', cat: 't', description: (0, nls_1.localize)('telemetry', "Shows all telemetry events which VS code collects.") },
        'remote': { type: 'string', allowEmptyValue: true },
        'folder-uri': { type: 'string[]', cat: 'o', args: 'uri' },
        'file-uri': { type: 'string[]', cat: 'o', args: 'uri' },
        'locate-extension': { type: 'string[]' },
        'extensionDevelopmentPath': { type: 'string[]' },
        'extensionDevelopmentKind': { type: 'string[]' },
        'extensionTestsPath': { type: 'string' },
        'extensionEnvironment': { type: 'string' },
        'debugId': { type: 'string' },
        'debugRenderer': { type: 'boolean' },
        'inspect-ptyhost': { type: 'string', allowEmptyValue: true },
        'inspect-brk-ptyhost': { type: 'string', allowEmptyValue: true },
        'inspect-search': { type: 'string', deprecates: ['debugSearch'], allowEmptyValue: true },
        'inspect-brk-search': { type: 'string', deprecates: ['debugBrkSearch'], allowEmptyValue: true },
        'inspect-sharedprocess': { type: 'string', allowEmptyValue: true },
        'inspect-brk-sharedprocess': { type: 'string', allowEmptyValue: true },
        'export-default-configuration': { type: 'string' },
        'install-source': { type: 'string' },
        'enable-smoke-test-driver': { type: 'boolean' },
        'logExtensionHostCommunication': { type: 'boolean' },
        'skip-release-notes': { type: 'boolean' },
        'skip-welcome': { type: 'boolean' },
        'disable-telemetry': { type: 'boolean' },
        'disable-updates': { type: 'boolean' },
        'use-inmemory-secretstorage': { type: 'boolean', deprecates: ['disable-keytar'] },
        'password-store': { type: 'string' },
        'disable-workspace-trust': { type: 'boolean' },
        'disable-crash-reporter': { type: 'boolean' },
        'crash-reporter-directory': { type: 'string' },
        'crash-reporter-id': { type: 'string' },
        'skip-add-to-recently-opened': { type: 'boolean' },
        'unity-launch': { type: 'boolean' },
        'open-url': { type: 'boolean' },
        'file-write': { type: 'boolean' },
        'file-chmod': { type: 'boolean' },
        'install-builtin-extension': { type: 'string[]' },
        'force': { type: 'boolean' },
        'do-not-sync': { type: 'boolean' },
        'trace': { type: 'boolean' },
        'trace-category-filter': { type: 'string' },
        'trace-options': { type: 'string' },
        'force-user-env': { type: 'boolean' },
        'force-disable-user-env': { type: 'boolean' },
        'open-devtools': { type: 'boolean' },
        'disable-gpu-sandbox': { type: 'boolean' },
        'logsPath': { type: 'string' },
        '__enable-file-policy': { type: 'boolean' },
        'editSessionId': { type: 'string' },
        'continueOn': { type: 'string' },
        'locate-shell-integration-path': { type: 'string', args: ['bash', 'pwsh', 'zsh', 'fish'] },
        'enable-coi': { type: 'boolean' },
        // chromium flags
        'no-proxy-server': { type: 'boolean' },
        // Minimist incorrectly parses keys that start with `--no`
        // https://github.com/substack/minimist/blob/aeb3e27dae0412de5c0494e9563a5f10c82cc7a9/index.js#L118-L121
        // If --no-sandbox is passed via cli wrapper it will be treated as --sandbox which is incorrect, we use
        // the alias here to make sure --no-sandbox is always respected.
        // For https://github.com/microsoft/vscode/issues/128279
        'no-sandbox': { type: 'boolean', alias: 'sandbox' },
        'proxy-server': { type: 'string' },
        'proxy-bypass-list': { type: 'string' },
        'proxy-pac-url': { type: 'string' },
        'js-flags': { type: 'string' },
        'inspect': { type: 'string', allowEmptyValue: true },
        'inspect-brk': { type: 'string', allowEmptyValue: true },
        'nolazy': { type: 'boolean' },
        'force-device-scale-factor': { type: 'string' },
        'force-renderer-accessibility': { type: 'boolean' },
        'ignore-certificate-errors': { type: 'boolean' },
        'allow-insecure-localhost': { type: 'boolean' },
        'log-net-log': { type: 'string' },
        'vmodule': { type: 'string' },
        '_urls': { type: 'string[]' },
        'disable-dev-shm-usage': { type: 'boolean' },
        'profile-temp': { type: 'boolean' },
        _: { type: 'string[]' } // main arguments
    };
    const ignoringReporter = {
        onUnknownOption: () => { },
        onMultipleValues: () => { },
        onEmptyValue: () => { },
        onDeprecatedOption: () => { }
    };
    function parseArgs(args, options, errorReporter = ignoringReporter) {
        const firstArg = args.find(a => a.length > 0 && a[0] !== '-');
        const alias = {};
        const stringOptions = ['_'];
        const booleanOptions = [];
        const globalOptions = {};
        let command = undefined;
        for (const optionId in options) {
            const o = options[optionId];
            if (o.type === 'subcommand') {
                if (optionId === firstArg) {
                    command = o;
                }
            }
            else {
                if (o.alias) {
                    alias[optionId] = o.alias;
                }
                if (o.type === 'string' || o.type === 'string[]') {
                    stringOptions.push(optionId);
                    if (o.deprecates) {
                        stringOptions.push(...o.deprecates);
                    }
                }
                else if (o.type === 'boolean') {
                    booleanOptions.push(optionId);
                    if (o.deprecates) {
                        booleanOptions.push(...o.deprecates);
                    }
                }
                if (o.global) {
                    globalOptions[optionId] = o;
                }
            }
        }
        if (command && firstArg) {
            const options = globalOptions;
            for (const optionId in command.options) {
                options[optionId] = command.options[optionId];
            }
            const newArgs = args.filter(a => a !== firstArg);
            const reporter = errorReporter.getSubcommandReporter ? errorReporter.getSubcommandReporter(firstArg) : undefined;
            const subcommandOptions = parseArgs(newArgs, options, reporter);
            return {
                [firstArg]: subcommandOptions,
                _: []
            };
        }
        // remove aliases to avoid confusion
        const parsedArgs = minimist(args, { string: stringOptions, boolean: booleanOptions, alias });
        const cleanedArgs = {};
        const remainingArgs = parsedArgs;
        // https://github.com/microsoft/vscode/issues/58177, https://github.com/microsoft/vscode/issues/106617
        cleanedArgs._ = parsedArgs._.map(arg => String(arg)).filter(arg => arg.length > 0);
        delete remainingArgs._;
        for (const optionId in options) {
            const o = options[optionId];
            if (o.type === 'subcommand') {
                continue;
            }
            if (o.alias) {
                delete remainingArgs[o.alias];
            }
            let val = remainingArgs[optionId];
            if (o.deprecates) {
                for (const deprecatedId of o.deprecates) {
                    if (remainingArgs.hasOwnProperty(deprecatedId)) {
                        if (!val) {
                            val = remainingArgs[deprecatedId];
                            if (val) {
                                errorReporter.onDeprecatedOption(deprecatedId, o.deprecationMessage || (0, nls_1.localize)('deprecated.useInstead', 'Use {0} instead.', optionId));
                            }
                        }
                        delete remainingArgs[deprecatedId];
                    }
                }
            }
            if (typeof val !== 'undefined') {
                if (o.type === 'string[]') {
                    if (!Array.isArray(val)) {
                        val = [val];
                    }
                    if (!o.allowEmptyValue) {
                        const sanitized = val.filter((v) => v.length > 0);
                        if (sanitized.length !== val.length) {
                            errorReporter.onEmptyValue(optionId);
                            val = sanitized.length > 0 ? sanitized : undefined;
                        }
                    }
                }
                else if (o.type === 'string') {
                    if (Array.isArray(val)) {
                        val = val.pop(); // take the last
                        errorReporter.onMultipleValues(optionId, val);
                    }
                    else if (!val && !o.allowEmptyValue) {
                        errorReporter.onEmptyValue(optionId);
                        val = undefined;
                    }
                }
                cleanedArgs[optionId] = val;
                if (o.deprecationMessage) {
                    errorReporter.onDeprecatedOption(optionId, o.deprecationMessage);
                }
            }
            delete remainingArgs[optionId];
        }
        for (const key in remainingArgs) {
            errorReporter.onUnknownOption(key);
        }
        return cleanedArgs;
    }
    exports.parseArgs = parseArgs;
    function formatUsage(optionId, option) {
        let args = '';
        if (option.args) {
            if (Array.isArray(option.args)) {
                args = ` <${option.args.join('> <')}>`;
            }
            else {
                args = ` <${option.args}>`;
            }
        }
        if (option.alias) {
            return `-${option.alias} --${optionId}${args}`;
        }
        return `--${optionId}${args}`;
    }
    // exported only for testing
    function formatOptions(options, columns) {
        const usageTexts = [];
        for (const optionId in options) {
            const o = options[optionId];
            const usageText = formatUsage(optionId, o);
            usageTexts.push([usageText, o.description]);
        }
        return formatUsageTexts(usageTexts, columns);
    }
    exports.formatOptions = formatOptions;
    function formatUsageTexts(usageTexts, columns) {
        const maxLength = usageTexts.reduce((previous, e) => Math.max(previous, e[0].length), 12);
        const argLength = maxLength + 2 /*left padding*/ + 1 /*right padding*/;
        if (columns - argLength < 25) {
            // Use a condensed version on narrow terminals
            return usageTexts.reduce((r, ut) => r.concat([`  ${ut[0]}`, `      ${ut[1]}`]), []);
        }
        const descriptionColumns = columns - argLength - 1;
        const result = [];
        for (const ut of usageTexts) {
            const usage = ut[0];
            const wrappedDescription = wrapText(ut[1], descriptionColumns);
            const keyPadding = indent(argLength - usage.length - 2 /*left padding*/);
            result.push('  ' + usage + keyPadding + wrappedDescription[0]);
            for (let i = 1; i < wrappedDescription.length; i++) {
                result.push(indent(argLength) + wrappedDescription[i]);
            }
        }
        return result;
    }
    function indent(count) {
        return ' '.repeat(count);
    }
    function wrapText(text, columns) {
        const lines = [];
        while (text.length) {
            const index = text.length < columns ? text.length : text.lastIndexOf(' ', columns);
            const line = text.slice(0, index).trim();
            text = text.slice(index);
            lines.push(line);
        }
        return lines;
    }
    function buildHelpMessage(productName, executableName, version, options, capabilities) {
        const columns = (process.stdout).isTTY && (process.stdout).columns || 80;
        const inputFiles = capabilities?.noInputFiles !== true ? `[${(0, nls_1.localize)('paths', 'paths')}...]` : '';
        const help = [`${productName} ${version}`];
        help.push('');
        help.push(`${(0, nls_1.localize)('usage', "Usage")}: ${executableName} [${(0, nls_1.localize)('options', "options")}]${inputFiles}`);
        help.push('');
        if (capabilities?.noPipe !== true) {
            if (platform_1.isWindows) {
                help.push((0, nls_1.localize)('stdinWindows', "To read output from another program, append '-' (e.g. 'echo Hello World | {0} -')", executableName));
            }
            else {
                help.push((0, nls_1.localize)('stdinUnix', "To read from stdin, append '-' (e.g. 'ps aux | grep code | {0} -')", executableName));
            }
            help.push('');
        }
        const optionsByCategory = {};
        const subcommands = [];
        for (const optionId in options) {
            const o = options[optionId];
            if (o.type === 'subcommand') {
                if (o.description) {
                    subcommands.push({ command: optionId, description: o.description });
                }
            }
            else if (o.description && o.cat) {
                let optionsByCat = optionsByCategory[o.cat];
                if (!optionsByCat) {
                    optionsByCategory[o.cat] = optionsByCat = {};
                }
                optionsByCat[optionId] = o;
            }
        }
        for (const helpCategoryKey in optionsByCategory) {
            const key = helpCategoryKey;
            const categoryOptions = optionsByCategory[key];
            if (categoryOptions) {
                help.push(helpCategories[key]);
                help.push(...formatOptions(categoryOptions, columns));
                help.push('');
            }
        }
        if (subcommands.length) {
            help.push((0, nls_1.localize)('subcommands', "Subcommands"));
            help.push(...formatUsageTexts(subcommands.map(s => [s.command, s.description]), columns));
            help.push('');
        }
        return help.join('\n');
    }
    exports.buildHelpMessage = buildHelpMessage;
    function buildVersionMessage(version, commit) {
        return `${version || (0, nls_1.localize)('unknownVersion', "Unknown version")}\n${commit || (0, nls_1.localize)('unknownCommit', "Unknown commit")}\n${process.arch}`;
    }
    exports.buildVersionMessage = buildVersionMessage;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJndi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2Vudmlyb25tZW50L25vZGUvYXJndi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFPaEc7O09BRUc7SUFDSCxNQUFNLGNBQWMsR0FBRztRQUN0QixDQUFDLEVBQUUsSUFBQSxjQUFRLEVBQUMsa0JBQWtCLEVBQUUsU0FBUyxDQUFDO1FBQzFDLENBQUMsRUFBRSxJQUFBLGNBQVEsRUFBQyxzQkFBc0IsRUFBRSx1QkFBdUIsQ0FBQztRQUM1RCxDQUFDLEVBQUUsSUFBQSxjQUFRLEVBQUMsaUJBQWlCLEVBQUUsaUJBQWlCLENBQUM7S0FDakQsQ0FBQztJQTZCVyxRQUFBLG1CQUFtQixHQUFHLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBVSxDQUFDO0lBRXZELFFBQUEsT0FBTyxHQUFtRDtRQUN0RSxRQUFRLEVBQUU7WUFDVCxJQUFJLEVBQUUsWUFBWTtZQUNsQixXQUFXLEVBQUUsK0ZBQStGO1lBQzVHLE9BQU8sRUFBRTtnQkFDUixjQUFjLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLFlBQVksRUFBRSxnREFBZ0QsQ0FBQyxFQUFFO2dCQUN0SSxtQkFBbUIsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUU7Z0JBQ3hDLGlCQUFpQixFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTtnQkFDckMsSUFBSSxFQUFFO29CQUNMLElBQUksRUFBRSxZQUFZO29CQUNsQixPQUFPLEVBQUU7d0JBQ1IsS0FBSyxFQUFFOzRCQUNOLElBQUksRUFBRSxZQUFZOzRCQUNsQixPQUFPLEVBQUU7Z0NBQ1IsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTtnQ0FDNUIsY0FBYyxFQUFFLEVBQUUsSUFB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