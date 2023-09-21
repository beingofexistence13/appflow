"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const ipcClient_1 = require("./ipc/ipcClient");
function fatal(err) {
    console.error('Missing or invalid credentials.');
    console.error(err);
    process.exit(1);
}
function main(argv) {
    if (!process.env['VSCODE_GIT_ASKPASS_PIPE']) {
        return fatal('Missing pipe');
    }
    if (!process.env['VSCODE_GIT_ASKPASS_TYPE']) {
        return fatal('Missing type');
    }
    if (process.env['VSCODE_GIT_ASKPASS_TYPE'] !== 'https' && process.env['VSCODE_GIT_ASKPASS_TYPE'] !== 'ssh') {
        return fatal(`Invalid type: ${process.env['VSCODE_GIT_ASKPASS_TYPE']}`);
    }
    if (process.env['VSCODE_GIT_COMMAND'] === 'fetch' && !!process.env['VSCODE_GIT_FETCH_SILENT']) {
        return fatal('Skip silent fetch commands');
    }
    const output = process.env['VSCODE_GIT_ASKPASS_PIPE'];
    const askpassType = process.env['VSCODE_GIT_ASKPASS_TYPE'];
    // HTTPS (username | password), SSH (passphrase | authenticity)
    const request = askpassType === 'https' ? argv[2] : argv[3];
    let host, file, fingerprint;
    if (askpassType === 'https') {
        host = argv[4].replace(/^["']+|["':]+$/g, '');
    }
    if (askpassType === 'ssh') {
        if (/passphrase/i.test(request)) {
            // passphrase
            file = argv[6].replace(/^["']+|["':]+$/g, '');
        }
        else {
            // authenticity
            host = argv[6].replace(/^["']+|["':]+$/g, '');
            fingerprint = argv[15];
        }
    }
    const ipcClient = new ipcClient_1.IPCClient('askpass');
    ipcClient.call({ askpassType, request, host, file, fingerprint }).then(res => {
        fs.writeFileSync(output, res + '\n');
        setTimeout(() => process.exit(0), 0);
    }).catch(err => fatal(err));
}
main(process.argv);
//# sourceMappingURL=askpass-main.js.map