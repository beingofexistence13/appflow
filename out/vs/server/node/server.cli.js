/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "fs", "url", "child_process", "http", "vs/base/common/process", "vs/base/common/path", "vs/platform/environment/node/argv", "vs/platform/environment/node/wait", "vs/platform/environment/node/stdin"], function (require, exports, _fs, _url, _cp, _http, process_1, path_1, argv_1, wait_1, stdin_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.main = void 0;
    const isSupportedForCmd = (optionId) => {
        switch (optionId) {
            case 'user-data-dir':
            case 'extensions-dir':
            case 'export-default-configuration':
            case 'install-source':
            case 'enable-smoke-test-driver':
            case 'extensions-download-dir':
            case 'builtin-extensions-dir':
            case 'telemetry':
                return false;
            default:
                return true;
        }
    };
    const isSupportedForPipe = (optionId) => {
        switch (optionId) {
            case 'version':
            case 'help':
            case 'folder-uri':
            case 'file-uri':
            case 'add':
            case 'diff':
            case 'merge':
            case 'wait':
            case 'goto':
            case 'reuse-window':
            case 'new-window':
            case 'status':
            case 'install-extension':
            case 'uninstall-extension':
            case 'list-extensions':
            case 'force':
            case 'show-versions':
            case 'category':
            case 'verbose':
            case 'remote':
            case 'locate-shell-integration-path':
                return true;
            default:
                return false;
        }
    };
    const cliPipe = process.env['VSCODE_IPC_HOOK_CLI'];
    const cliCommand = process.env['VSCODE_CLIENT_COMMAND'];
    const cliCommandCwd = process.env['VSCODE_CLIENT_COMMAND_CWD'];
    const cliRemoteAuthority = process.env['VSCODE_CLI_AUTHORITY'];
    const cliStdInFilePath = process.env['VSCODE_STDIN_FILE_PATH'];
    async function main(desc, args) {
        if (!cliPipe && !cliCommand) {
            console.log('Command is only available in WSL or inside a Visual Studio Code terminal.');
            return;
        }
        // take the local options and remove the ones that don't apply
        const options = { ...argv_1.OPTIONS, gitCredential: { type: 'string' }, openExternal: { type: 'boolean' } };
        const isSupported = cliCommand ? isSupportedForCmd : isSupportedForPipe;
        for (const optionId in argv_1.OPTIONS) {
            const optId = optionId;
            if (!isSupported(optId)) {
                delete options[optId];
            }
        }
        if (cliPipe) {
            options['openExternal'] = { type: 'boolean' };
        }
        const errorReporter = {
            onMultipleValues: (id, usedValue) => {
                console.error(`Option '${id}' can only be defined once. Using value ${usedValue}.`);
            },
            onEmptyValue: (id) => {
                console.error(`Ignoring option '${id}': Value must not be empty.`);
            },
            onUnknownOption: (id) => {
                console.error(`Ignoring option '${id}': not supported for ${desc.executableName}.`);
            },
            onDeprecatedOption: (deprecatedOption, message) => {
                console.warn(`Option '${deprecatedOption}' is deprecated: ${message}`);
            }
        };
        const parsedArgs = (0, argv_1.parseArgs)(args, options, errorReporter);
        const mapFileUri = cliRemoteAuthority ? mapFileToRemoteUri : (uri) => uri;
        const verbose = !!parsedArgs['verbose'];
        if (parsedArgs.help) {
            console.log((0, argv_1.buildHelpMessage)(desc.productName, desc.executableName, desc.version, options));
            return;
        }
        if (parsedArgs.version) {
            console.log((0, argv_1.buildVersionMessage)(desc.version, desc.commit));
            return;
        }
        if (parsedArgs['locate-shell-integration-path']) {
            let file;
            switch (parsedArgs['locate-shell-integration-path']) {
                // Usage: `[[ "$TERM_PROGRAM" == "vscode" ]] && . "$(code --locate-shell-integration-path bash)"`
                case 'bash':
                    file = 'shellIntegration-bash.sh';
                    break;
                // Usage: `if ($env:TERM_PROGRAM -eq "vscode") { . "$(code --locate-shell-integration-path pwsh)" }`
                case 'pwsh':
                    file = 'shellIntegration.ps1';
                    break;
                // Usage: `[[ "$TERM_PROGRAM" == "vscode" ]] && . "$(code --locate-shell-integration-path zsh)"`
                case 'zsh':
                    file = 'shellIntegration-rc.zsh';
                    break;
                // Usage: `string match -q "$TERM_PROGRAM" "vscode"; and . (code --locate-shell-integration-path fish)`
                case 'fish':
                    file = 'fish_xdg_data/fish/vendor_conf.d/shellIntegration.fish';
                    break;
                default: throw new Error('Error using --locate-shell-integration-path: Invalid shell type');
            }
            console.log((0, path_1.resolve)(__dirname, '../..', 'workbench', 'contrib', 'terminal', 'browser', 'media', file));
            return;
        }
        if (cliPipe) {
            if (parsedArgs['openExternal']) {
                openInBrowser(parsedArgs['_'], verbose);
                return;
            }
        }
        let remote = parsedArgs.remote;
        if (remote === 'local' || remote === 'false' || remote === '') {
            remote = null; // null represent a local window
        }
        const folderURIs = (parsedArgs['folder-uri'] || []).map(mapFileUri);
        parsedArgs['folder-uri'] = folderURIs;
        const fileURIs = (parsedArgs['file-uri'] || []).map(mapFileUri);
        parsedArgs['file-uri'] = fileURIs;
        const inputPaths = parsedArgs['_'];
        let hasReadStdinArg = false;
        for (const input of inputPaths) {
            if (input === '-') {
                hasReadStdinArg = true;
            }
            else {
                translatePath(input, mapFileUri, folderURIs, fileURIs);
            }
        }
        parsedArgs['_'] = [];
        if (hasReadStdinArg && (0, stdin_1.hasStdinWithoutTty)()) {
            try {
                let stdinFilePath = cliStdInFilePath;
                if (!stdinFilePath) {
                    stdinFilePath = (0, stdin_1.getStdinFilePath)();
                    await (0, stdin_1.readFromStdin)(stdinFilePath, verbose); // throws error if file can not be written
                }
                // Make sure to open tmp file
                translatePath(stdinFilePath, mapFileUri, folderURIs, fileURIs);
                // Enable --wait to get all data and ignore adding this to history
                parsedArgs.wait = true;
                parsedArgs['skip-add-to-recently-opened'] = true;
                console.log(`Reading from stdin via: ${stdinFilePath}`);
            }
            catch (e) {
                console.log(`Failed to create file to read via stdin: ${e.toString()}`);
            }
        }
        if (parsedArgs.extensionDevelopmentPath) {
            parsedArgs.extensionDevelopmentPath = parsedArgs.extensionDevelopmentPath.map(p => mapFileUri(pathToURI(p).href));
        }
        if (parsedArgs.extensionTestsPath) {
            parsedArgs.extensionTestsPath = mapFileUri(pathToURI(parsedArgs['extensionTestsPath']).href);
        }
        const crashReporterDirectory = parsedArgs['crash-reporter-directory'];
        if (crashReporterDirectory !== undefined && !crashReporterDirectory.match(/^([a-zA-Z]:[\\\/])/)) {
            console.log(`The crash reporter directory '${crashReporterDirectory}' must be an absolute Windows path (e.g. c:/crashes)`);
            return;
        }
        if (cliCommand) {
            if (parsedArgs['install-extension'] !== undefined || parsedArgs['uninstall-extension'] !== undefined || parsedArgs['list-extensions']) {
                const cmdLine = [];
                parsedArgs['install-extension']?.forEach(id => cmdLine.push('--install-extension', id));
                parsedArgs['uninstall-extension']?.forEach(id => cmdLine.push('--uninstall-extension', id));
                ['list-extensions', 'force', 'show-versions', 'category'].forEach(opt => {
                    const value = parsedArgs[opt];
                    if (value !== undefined) {
                        cmdLine.push(`--${opt}=${value}`);
                    }
                });
                const cp = _cp.fork((0, path_1.join)(__dirname, '../../../server-main.js'), cmdLine, { stdio: 'inherit' });
                cp.on('error', err => console.log(err));
                return;
            }
            const newCommandline = [];
            for (const key in parsedArgs) {
                const val = parsedArgs[key];
                if (typeof val === 'boolean') {
                    if (val) {
                        newCommandline.push('--' + key);
                    }
                }
                else if (Array.isArray(val)) {
                    for (const entry of val) {
                        newCommandline.push(`--${key}=${entry.toString()}`);
                    }
                }
                else if (val) {
                    newCommandline.push(`--${key}=${val.toString()}`);
                }
            }
            if (remote !== null) {
                newCommandline.push(`--remote=${remote || cliRemoteAuthority}`);
            }
            const ext = (0, path_1.extname)(cliCommand);
            if (ext === '.bat' || ext === '.cmd') {
                const processCwd = cliCommandCwd || (0, process_1.cwd)();
                if (verbose) {
                    console.log(`Invoking: cmd.exe /C ${cliCommand} ${newCommandline.join(' ')} in ${processCwd}`);
                }
                _cp.spawn('cmd.exe', ['/C', cliCommand, ...newCommandline], {
                    stdio: 'inherit',
                    cwd: processCwd
                });
            }
            else {
                const cliCwd = (0, path_1.dirname)(cliCommand);
                const env = { ...process.env, ELECTRON_RUN_AS_NODE: '1' };
                newCommandline.unshift('--ms-enable-electron-run-as-node');
                newCommandline.unshift('resources/app/out/cli.js');
                if (verbose) {
                    console.log(`Invoking: cd "${cliCwd}" && ELECTRON_RUN_AS_NODE=1 "${cliCommand}" "${newCommandline.join('" "')}"`);
                }
                _cp.spawn(cliCommand, newCommandline, { cwd: cliCwd, env, stdio: ['inherit'] });
            }
        }
        else {
            if (parsedArgs.status) {
                sendToPipe({
                    type: 'status'
                }, verbose).then((res) => {
                    console.log(res);
                }).catch(e => {
                    console.error('Error when requesting status:', e);
                });
                return;
            }
            if (parsedArgs['install-extension'] !== undefined || parsedArgs['uninstall-extension'] !== undefined || parsedArgs['list-extensions']) {
                sendToPipe({
                    type: 'extensionManagement',
                    list: parsedArgs['list-extensions'] ? { showVersions: parsedArgs['show-versions'], category: parsedArgs['category'] } : undefined,
                    install: asExtensionIdOrVSIX(parsedArgs['install-extension']),
                    uninstall: asExtensionIdOrVSIX(parsedArgs['uninstall-extension']),
                    force: parsedArgs['force']
                }, verbose).then((res) => {
                    console.log(res);
                }).catch(e => {
                    console.error('Error when invoking the extension management command:', e);
                });
                return;
            }
            let waitMarkerFilePath = undefined;
            if (parsedArgs['wait']) {
                if (!fileURIs.length) {
                    console.log('At least one file must be provided to wait for.');
                    return;
                }
                waitMarkerFilePath = (0, wait_1.createWaitMarkerFileSync)(verbose);
            }
            sendToPipe({
                type: 'open',
                fileURIs,
                folderURIs,
                diffMode: parsedArgs.diff,
                mergeMode: parsedArgs.merge,
                addMode: parsedArgs.add,
                gotoLineMode: parsedArgs.goto,
                forceReuseWindow: parsedArgs['reuse-window'],
                forceNewWindow: parsedArgs['new-window'],
                waitMarkerFilePath,
                remoteAuthority: remote
            }, verbose).catch(e => {
                console.error('Error when invoking the open command:', e);
            });
            if (waitMarkerFilePath) {
                waitForFileDeleted(waitMarkerFilePath);
            }
        }
    }
    exports.main = main;
    async function waitForFileDeleted(path) {
        while (_fs.existsSync(path)) {
            await new Promise(res => setTimeout(res, 1000));
        }
    }
    function openInBrowser(args, verbose) {
        const uris = [];
        for (const location of args) {
            try {
                if (/^(http|https|file):\/\//.test(location)) {
                    uris.push(_url.parse(location).href);
                }
                else {
                    uris.push(pathToURI(location).href);
                }
            }
            catch (e) {
                console.log(`Invalid url: ${location}`);
            }
        }
        if (uris.length) {
            sendToPipe({
                type: 'openExternal',
                uris
            }, verbose).catch(e => {
                console.error('Error when invoking the open external command:', e);
            });
        }
    }
    function sendToPipe(args, verbose) {
        if (verbose) {
            console.log(JSON.stringify(args, null, '  '));
        }
        return new Promise((resolve, reject) => {
            const message = JSON.stringify(args);
            if (!cliPipe) {
                console.log('Message ' + message);
                resolve('');
                return;
            }
            const opts = {
                socketPath: cliPipe,
                path: '/',
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'accept': 'application/json'
                }
            };
            const req = _http.request(opts, res => {
                if (res.headers['content-type'] !== 'application/json') {
                    reject('Error in response: Invalid content type: Expected \'application/json\', is: ' + res.headers['content-type']);
                    return;
                }
                const chunks = [];
                res.setEncoding('utf8');
                res.on('data', chunk => {
                    chunks.push(chunk);
                });
                res.on('error', (err) => fatal('Error in response.', err));
                res.on('end', () => {
                    const content = chunks.join('');
                    try {
                        const obj = JSON.parse(content);
                        if (res.statusCode === 200) {
                            resolve(obj);
                        }
                        else {
                            reject(obj);
                        }
                    }
                    catch (e) {
                        reject('Error in response: Unable to parse response as JSON: ' + content);
                    }
                });
            });
            req.on('error', (err) => fatal('Error in request.', err));
            req.write(message);
            req.end();
        });
    }
    function asExtensionIdOrVSIX(inputs) {
        return inputs?.map(input => /\.vsix$/i.test(input) ? pathToURI(input).href : input);
    }
    function fatal(message, err) {
        console.error('Unable to connect to VS Code server: ' + message);
        console.error(err);
        process.exit(1);
    }
    const preferredCwd = process.env.PWD || (0, process_1.cwd)(); // prefer process.env.PWD as it does not follow symlinks
    function pathToURI(input) {
        input = input.trim();
        input = (0, path_1.resolve)(preferredCwd, input);
        return _url.pathToFileURL(input);
    }
    function translatePath(input, mapFileUri, folderURIS, fileURIS) {
        const url = pathToURI(input);
        const mappedUri = mapFileUri(url.href);
        try {
            const stat = _fs.lstatSync(_fs.realpathSync(input));
            if (stat.isFile()) {
                fileURIS.push(mappedUri);
            }
            else if (stat.isDirectory()) {
                folderURIS.push(mappedUri);
            }
            else if (input === '/dev/null') {
                // handle /dev/null passed to us by external tools such as `git difftool`
                fileURIS.push(mappedUri);
            }
        }
        catch (e) {
            if (e.code === 'ENOENT') {
                fileURIS.push(mappedUri);
            }
            else {
                console.log(`Problem accessing file ${input}. Ignoring file`, e);
            }
        }
    }
    function mapFileToRemoteUri(uri) {
        return uri.replace(/^file:\/\//, 'vscode-remote://' + cliRemoteAuthority);
    }
    const [, , productName, version, commit, executableName, ...remainingArgs] = process.argv;
    main({ productName, version, commit, executableName }, remainingArgs).then(null, err => {
        console.error(err.message || err.stack || err);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmNsaS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3NlcnZlci9ub2RlL3NlcnZlci5jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBa0NoRyxNQUFNLGlCQUFpQixHQUFHLENBQUMsUUFBZ0MsRUFBRSxFQUFFO1FBQzlELFFBQVEsUUFBUSxFQUFFO1lBQ2pCLEtBQUssZUFBZSxDQUFDO1lBQ3JCLEtBQUssZ0JBQWdCLENBQUM7WUFDdEIsS0FBSyw4QkFBOEIsQ0FBQztZQUNwQyxLQUFLLGdCQUFnQixDQUFDO1lBQ3RCLEtBQUssMEJBQTBCLENBQUM7WUFDaEMsS0FBSyx5QkFBeUIsQ0FBQztZQUMvQixLQUFLLHdCQUF3QixDQUFDO1lBQzlCLEtBQUssV0FBVztnQkFDZixPQUFPLEtBQUssQ0FBQztZQUNkO2dCQUNDLE9BQU8sSUFBSSxDQUFDO1NBQ2I7SUFDRixDQUFDLENBQUM7SUFFRixNQUFNLGtCQUFrQixHQUFHLENBQUMsUUFBZ0MsRUFBRSxFQUFFO1FBQy9ELFFBQVEsUUFBUSxFQUFFO1lBQ2pCLEtBQUssU0FBUyxDQUFDO1lBQ2YsS0FBSyxNQUFNLENBQUM7WUFDWixLQUFLLFlBQVksQ0FBQztZQUNsQixLQUFLLFVBQVUsQ0FBQztZQUNoQixLQUFLLEtBQUssQ0FBQztZQUNYLEtBQUssTUFBTSxDQUFDO1lBQ1osS0FBSyxPQUFPLENBQUM7WUFDYixLQUFLLE1BQU0sQ0FBQztZQUNaLEtBQUssTUFBTSxDQUFDO1lBQ1osS0FBSyxjQUFjLENBQUM7WUFDcEIsS0FBSyxZQUFZLENBQUM7WUFDbEIsS0FBSyxRQUFRLENBQUM7WUFDZCxLQUFLLG1CQUFtQixDQUFDO1lBQ3pCLEtBQUsscUJBQXFCLENBQUM7WUFDM0IsS0FBSyxpQkFBaUIsQ0FBQztZQUN2QixLQUFLLE9BQU8sQ0FBQztZQUNiLEtBQUssZUFBZSxDQUFDO1lBQ3JCLEtB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