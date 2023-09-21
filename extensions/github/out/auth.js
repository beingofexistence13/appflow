"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOctokitGraphql = exports.getOctokit = exports.getSession = exports.AuthenticationError = void 0;
const vscode_1 = require("vscode");
const https_1 = require("https");
const tunnel_1 = require("tunnel");
const url_1 = require("url");
class AuthenticationError extends Error {
}
exports.AuthenticationError = AuthenticationError;
function getAgent(url = process.env.HTTPS_PROXY) {
    if (!url) {
        return https_1.globalAgent;
    }
    try {
        const { hostname, port, username, password } = new url_1.URL(url);
        const auth = username && password && `${username}:${password}`;
        return (0, tunnel_1.httpsOverHttp)({ proxy: { host: hostname, port, proxyAuth: auth } });
    }
    catch (e) {
        vscode_1.window.showErrorMessage(`HTTPS_PROXY environment variable ignored: ${e.message}`);
        return https_1.globalAgent;
    }
}
const scopes = ['repo', 'workflow', 'user:email', 'read:user'];
async function getSession() {
    return await vscode_1.authentication.getSession('github', scopes, { createIfNone: true });
}
exports.getSession = getSession;
let _octokit;
function getOctokit() {
    if (!_octokit) {
        _octokit = getSession().then(async (session) => {
            const token = session.accessToken;
            const agent = getAgent();
            const { Octokit } = await Promise.resolve().then(() => require('@octokit/rest'));
            return new Octokit({
                request: { agent },
                userAgent: 'GitHub VSCode',
                auth: `token ${token}`
            });
        }).then(null, async (err) => {
            _octokit = undefined;
            throw err;
        });
    }
    return _octokit;
}
exports.getOctokit = getOctokit;
let _octokitGraphql;
async function getOctokitGraphql() {
    if (!_octokitGraphql) {
        try {
            const session = await vscode_1.authentication.getSession('github', scopes, { silent: true });
            if (!session) {
                throw new AuthenticationError('No GitHub authentication session available.');
            }
            const token = session.accessToken;
            const { graphql } = await Promise.resolve().then(() => require('@octokit/graphql'));
            return graphql.defaults({
                headers: {
                    authorization: `token ${token}`
                },
                request: {
                    agent: getAgent()
                }
            });
        }
        catch (err) {
            _octokitGraphql = undefined;
            throw err;
        }
    }
    return _octokitGraphql;
}
exports.getOctokitGraphql = getOctokitGraphql;
//# sourceMappingURL=auth.js.map