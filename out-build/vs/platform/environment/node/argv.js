/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "minimist", "vs/base/common/platform", "vs/nls!vs/platform/environment/node/argv"], function (require, exports, minimist, platform_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Cl = exports.$Bl = exports.$Al = exports.$zl = exports.$yl = exports.$xl = void 0;
    /**
     * This code is also used by standalone cli's. Avoid adding any other dependencies.
     */
    const helpCategories = {
        o: (0, nls_1.localize)(0, null),
        e: (0, nls_1.localize)(1, null),
        t: (0, nls_1.localize)(2, null)
    };
    exports.$xl = ['tunnel', 'serve-web'];
    exports.$yl = {
        'tunnel': {
            type: 'subcommand',
            description: 'Make the current machine accessible from vscode.dev or other machines through a secure tunnel',
            options: {
                'cli-data-dir': { type: 'string', args: 'dir', description: (0, nls_1.localize)(3, null) },
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
                'cli-data-dir': { type: 'string', args: 'dir', description: (0, nls_1.localize)(4, null) },
                'disable-telemetry': { type: 'boolean' },
                'telemetry-level': { type: 'string' },
            }
        },
        'diff': { type: 'boolean', cat: 'o', alias: 'd', args: ['file', 'file'], description: (0, nls_1.localize)(5, null) },
        'merge': { type: 'boolean', cat: 'o', alias: 'm', args: ['path1', 'path2', 'base', 'result'], description: (0, nls_1.localize)(6, null) },
        'add': { type: 'boolean', cat: 'o', alias: 'a', args: 'folder', description: (0, nls_1.localize)(7, null) },
        'goto': { type: 'boolean', cat: 'o', alias: 'g', args: 'file:line[:character]', description: (0, nls_1.localize)(8, null) },
        'new-window': { type: 'boolean', cat: 'o', alias: 'n', description: (0, nls_1.localize)(9, null) },
        'reuse-window': { type: 'boolean', cat: 'o', alias: 'r', description: (0, nls_1.localize)(10, null) },
        'wait': { type: 'boolean', cat: 'o', alias: 'w', description: (0, nls_1.localize)(11, null) },
        'waitMarkerFilePath': { type: 'string' },
        'locale': { type: 'string', cat: 'o', args: 'locale', description: (0, nls_1.localize)(12, null) },
        'user-data-dir': { type: 'string', cat: 'o', args: 'dir', description: (0, nls_1.localize)(13, null) },
        'profile': { type: 'string', 'cat': 'o', args: 'profileName', description: (0, nls_1.localize)(14, null) },
        'help': { type: 'boolean', cat: 'o', alias: 'h', description: (0, nls_1.localize)(15, null) },
        'extensions-dir': { type: 'string', deprecates: ['extensionHomePath'], cat: 'e', args: 'dir', description: (0, nls_1.localize)(16, null) },
        'extensions-download-dir': { type: 'string' },
        'builtin-extensions-dir': { type: 'string' },
        'list-extensions': { type: 'boolean', cat: 'e', description: (0, nls_1.localize)(17, null) },
        'show-versions': { type: 'boolean', cat: 'e', description: (0, nls_1.localize)(18, null) },
        'category': { type: 'string', allowEmptyValue: true, cat: 'e', description: (0, nls_1.localize)(19, null), args: 'category' },
        'install-extension': { type: 'string[]', cat: 'e', args: 'ext-id | path', description: (0, nls_1.localize)(20, null) },
        'pre-release': { type: 'boolean', cat: 'e', description: (0, nls_1.localize)(21, null) },
        'uninstall-extension': { type: 'string[]', cat: 'e', args: 'ext-id', description: (0, nls_1.localize)(22, null) },
        'enable-proposed-api': { type: 'string[]', allowEmptyValue: true, cat: 'e', args: 'ext-id', description: (0, nls_1.localize)(23, null) },
        'version': { type: 'boolean', cat: 't', alias: 'v', description: (0, nls_1.localize)(24, null) },
        'verbose': { type: 'boolean', cat: 't', global: true, description: (0, nls_1.localize)(25, null) },
        'log': { type: 'string[]', cat: 't', args: 'level', global: true, description: (0, nls_1.localize)(26, null) },
        'status': { type: 'boolean', alias: 's', cat: 't', description: (0, nls_1.localize)(27, null) },
        'prof-startup': { type: 'boolean', cat: 't', description: (0, nls_1.localize)(28, null) },
        'prof-append-timers': { type: 'string' },
        'prof-duration-markers': { type: 'string[]' },
        'prof-duration-markers-file': { type: 'string' },
        'no-cached-data': { type: 'boolean' },
        'prof-startup-prefix': { type: 'string' },
        'prof-v8-extensions': { type: 'boolean' },
        'disable-extensions': { type: 'boolean', deprecates: ['disableExtensions'], cat: 't', description: (0, nls_1.localize)(29, null) },
        'disable-extension': { type: 'string[]', cat: 't', args: 'ext-id', description: (0, nls_1.localize)(30, null) },
        'sync': { type: 'string', cat: 't', description: (0, nls_1.localize)(31, null), args: ['on | off'] },
        'inspect-extensions': { type: 'string', allowEmptyValue: true, deprecates: ['debugPluginHost'], args: 'port', cat: 't', description: (0, nls_1.localize)(32, null) },
        'inspect-brk-extensions': { type: 'string', allowEmptyValue: true, deprecates: ['debugBrkPluginHost'], args: 'port', cat: 't', description: (0, nls_1.localize)(33, null) },
        'disable-gpu': { type: 'boolean', cat: 't', description: (0, nls_1.localize)(34, null) },
        'disable-chromium-sandbox': { type: 'boolean', cat: 't', description: (0, nls_1.localize)(35, null) },
        'ms-enable-electron-run-as-node': { type: 'boolean', global: true },
        'telemetry': { type: 'boolean', cat: 't', description: (0, nls_1.localize)(36, null) },
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
    function $zl(args, options, errorReporter = ignoringReporter) {
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
            const subcommandOptions = $zl(newArgs, options, reporter);
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
                                errorReporter.onDeprecatedOption(deprecatedId, o.deprecationMessage || (0, nls_1.localize)(37, null, optionId));
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
    exports.$zl = $zl;
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
    function $Al(options, columns) {
        const usageTexts = [];
        for (const optionId in options) {
            const o = options[optionId];
            const usageText = formatUsage(optionId, o);
            usageTexts.push([usageText, o.description]);
        }
        return formatUsageTexts(usageTexts, columns);
    }
    exports.$Al = $Al;
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
    function $Bl(productName, executableName, version, options, capabilities) {
        const columns = (process.stdout).isTTY && (process.stdout).columns || 80;
        const inputFiles = capabilities?.noInputFiles !== true ? `[${(0, nls_1.localize)(38, null)}...]` : '';
        const help = [`${productName} ${version}`];
        help.push('');
        help.push(`${(0, nls_1.localize)(39, null)}: ${executableName} [${(0, nls_1.localize)(40, null)}]${inputFiles}`);
        help.push('');
        if (capabilities?.noPipe !== true) {
            if (platform_1.$i) {
                help.push((0, nls_1.localize)(41, null, executableName));
            }
            else {
                help.push((0, nls_1.localize)(42, null, executableName));
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
                help.push(...$Al(categoryOptions, columns));
                help.push('');
            }
        }
        if (subcommands.length) {
            help.push((0, nls_1.localize)(43, null));
            help.push(...formatUsageTexts(subcommands.map(s => [s.command, s.description]), columns));
            help.push('');
        }
        return help.join('\n');
    }
    exports.$Bl = $Bl;
    function $Cl(version, commit) {
        return `${version || (0, nls_1.localize)(44, null)}\n${commit || (0, nls_1.localize)(45, null)}\n${process.arch}`;
    }
    exports.$Cl = $Cl;
});
//# sourceMappingURL=argv.js.map