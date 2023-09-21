"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const ms_rest_azure_env_1 = require("@azure/ms-rest-azure-env");
const AADHelper_1 = require("./AADHelper");
const betterSecretStorage_1 = require("./betterSecretStorage");
const UriEventHandler_1 = require("./UriEventHandler");
const extension_telemetry_1 = require("@vscode/extension-telemetry");
async function initMicrosoftSovereignCloudAuthProvider(context, telemetryReporter, uriHandler, tokenStorage) {
    const environment = vscode.workspace.getConfiguration('microsoft-sovereign-cloud').get('environment');
    let authProviderName;
    if (!environment) {
        return undefined;
    }
    if (environment === 'custom') {
        const customEnv = vscode.workspace.getConfiguration('microsoft-sovereign-cloud').get('customEnvironment');
        if (!customEnv) {
            const res = await vscode.window.showErrorMessage(vscode.l10n.t('You must also specify a custom environment in order to use the custom environment auth provider.'), vscode.l10n.t('Open settings'));
            if (res) {
                await vscode.commands.executeCommand('workbench.action.openSettingsJson', 'microsoft-sovereign-cloud.customEnvironment');
            }
            return undefined;
        }
        try {
            ms_rest_azure_env_1.Environment.add(customEnv);
        }
        catch (e) {
            const res = await vscode.window.showErrorMessage(vscode.l10n.t('Error validating custom environment setting: {0}', e.message), vscode.l10n.t('Open settings'));
            if (res) {
                await vscode.commands.executeCommand('workbench.action.openSettings', 'microsoft-sovereign-cloud.customEnvironment');
            }
            return undefined;
        }
        authProviderName = customEnv.name;
    }
    else {
        authProviderName = environment;
    }
    const env = ms_rest_azure_env_1.Environment.get(authProviderName);
    if (!env) {
        const res = await vscode.window.showErrorMessage(vscode.l10n.t('The environment `{0}` is not a valid environment.', authProviderName), vscode.l10n.t('Open settings'));
        return undefined;
    }
    const aadService = new AADHelper_1.AzureActiveDirectoryService(vscode.window.createOutputChannel(vscode.l10n.t('Microsoft Sovereign Cloud Authentication'), { log: true }), context, uriHandler, tokenStorage, telemetryReporter, env);
    await aadService.initialize();
    const disposable = vscode.authentication.registerAuthenticationProvider('microsoft-sovereign-cloud', authProviderName, {
        onDidChangeSessions: aadService.onDidChangeSessions,
        getSessions: (scopes) => aadService.getSessions(scopes),
        createSession: async (scopes) => {
            try {
                /* __GDPR__
                    "login" : {
                        "owner": "TylerLeonhardt",
                        "comment": "Used to determine the usage of the Microsoft Sovereign Cloud Auth Provider.",
                        "scopes": { "classification": "PublicNonPersonalData", "purpose": "FeatureInsight", "comment": "Used to determine what scope combinations are being requested." }
                    }
                */
                telemetryReporter.sendTelemetryEvent('loginMicrosoftSovereignCloud', {
                    // Get rid of guids from telemetry.
                    scopes: JSON.stringify(scopes.map(s => s.replace(/[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}/i, '{guid}'))),
                });
                return await aadService.createSession(scopes);
            }
            catch (e) {
                /* __GDPR__
                    "loginFailed" : { "owner": "TylerLeonhardt", "comment": "Used to determine how often users run into issues with the login flow." }
                */
                telemetryReporter.sendTelemetryEvent('loginMicrosoftSovereignCloudFailed');
                throw e;
            }
        },
        removeSession: async (id) => {
            try {
                /* __GDPR__
                    "logout" : { "owner": "TylerLeonhardt", "comment": "Used to determine how often users log out." }
                */
                telemetryReporter.sendTelemetryEvent('logoutMicrosoftSovereignCloud');
                await aadService.removeSessionById(id);
            }
            catch (e) {
                /* __GDPR__
                    "logoutFailed" : { "owner": "TylerLeonhardt", "comment": "Used to determine how often fail to log out." }
                */
                telemetryReporter.sendTelemetryEvent('logoutMicrosoftSovereignCloudFailed');
            }
        }
    }, { supportsMultipleAccounts: true });
    context.subscriptions.push(disposable);
    return disposable;
}
async function activate(context) {
    const aiKey = context.extension.packageJSON.aiKey;
    const telemetryReporter = new extension_telemetry_1.default(aiKey);
    const uriHandler = new UriEventHandler_1.UriEventHandler();
    context.subscriptions.push(uriHandler);
    context.subscriptions.push(vscode.window.registerUriHandler(uriHandler));
    const betterSecretStorage = new betterSecretStorage_1.BetterTokenStorage('microsoft.login.keylist', context);
    const loginService = new AADHelper_1.AzureActiveDirectoryService(vscode.window.createOutputChannel(vscode.l10n.t('Microsoft Authentication'), { log: true }), context, uriHandler, betterSecretStorage, telemetryReporter, ms_rest_azure_env_1.Environment.AzureCloud);
    await loginService.initialize();
    context.subscriptions.push(vscode.authentication.registerAuthenticationProvider('microsoft', 'Microsoft', {
        onDidChangeSessions: loginService.onDidChangeSessions,
        getSessions: (scopes) => loginService.getSessions(scopes),
        createSession: async (scopes) => {
            try {
                /* __GDPR__
                    "login" : {
                        "owner": "TylerLeonhardt",
                        "comment": "Used to determine the usage of the Microsoft Auth Provider.",
                        "scopes": { "classification": "PublicNonPersonalData", "purpose": "FeatureInsight", "comment": "Used to determine what scope combinations are being requested." }
                    }
                */
                telemetryReporter.sendTelemetryEvent('login', {
                    // Get rid of guids from telemetry.
                    scopes: JSON.stringify(scopes.map(s => s.replace(/[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}/i, '{guid}'))),
                });
                return await loginService.createSession(scopes);
            }
            catch (e) {
                /* __GDPR__
                    "loginFailed" : { "owner": "TylerLeonhardt", "comment": "Used to determine how often users run into issues with the login flow." }
                */
                telemetryReporter.sendTelemetryEvent('loginFailed');
                throw e;
            }
        },
        removeSession: async (id) => {
            try {
                /* __GDPR__
                    "logout" : { "owner": "TylerLeonhardt", "comment": "Used to determine how often users log out." }
                */
                telemetryReporter.sendTelemetryEvent('logout');
                await loginService.removeSessionById(id);
            }
            catch (e) {
                /* __GDPR__
                    "logoutFailed" : { "owner": "TylerLeonhardt", "comment": "Used to determine how often fail to log out." }
                */
                telemetryReporter.sendTelemetryEvent('logoutFailed');
            }
        }
    }, { supportsMultipleAccounts: true }));
    let microsoftSovereignCloudAuthProviderDisposable = await initMicrosoftSovereignCloudAuthProvider(context, telemetryReporter, uriHandler, betterSecretStorage);
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(async (e) => {
        if (e.affectsConfiguration('microsoft-sovereign-cloud')) {
            microsoftSovereignCloudAuthProviderDisposable?.dispose();
            microsoftSovereignCloudAuthProviderDisposable = await initMicrosoftSovereignCloudAuthProvider(context, telemetryReporter, uriHandler, betterSecretStorage);
        }
    }));
    return;
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map