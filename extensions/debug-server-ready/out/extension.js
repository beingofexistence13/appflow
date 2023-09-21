"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
const util = require("util");
const crypto_1 = require("crypto");
const PATTERN = 'listening on.* (https?://\\S+|[0-9]+)'; // matches "listening on port 3000" or "Now listening on: https://localhost:5001"
const URI_PORT_FORMAT = 'http://localhost:%s';
const URI_FORMAT = '%s';
const WEB_ROOT = '${workspaceFolder}';
// Escape codes, compiled from https://invisible-island.net/xterm/ctlseqs/ctlseqs.html#h3-Functions-using-CSI-_-ordered-by-the-final-character_s_
const CSI_SEQUENCE = /(:?\x1b\[|\x9B)[=?>!]?[\d;:]*["$#'* ]?[a-zA-Z@^`{}|~]/g;
/**
 * Froms vs/base/common/strings.ts in core
 * @see https://github.com/microsoft/vscode/blob/22a2a0e833175c32a2005b977d7fbd355582e416/src/vs/base/common/strings.ts#L736
 */
function removeAnsiEscapeCodes(str) {
    if (str) {
        str = str.replace(CSI_SEQUENCE, '');
    }
    return str;
}
class Trigger {
    constructor() {
        this._fired = false;
    }
    get hasFired() {
        return this._fired;
    }
    fire() {
        this._fired = true;
    }
}
class ServerReadyDetector extends vscode.Disposable {
    static start(session) {
        if (session.configuration.serverReadyAction) {
            let detector = ServerReadyDetector.detectors.get(session);
            if (!detector) {
                detector = new ServerReadyDetector(session);
                ServerReadyDetector.detectors.set(session, detector);
            }
            return detector;
        }
        return undefined;
    }
    static stop(session) {
        const detector = ServerReadyDetector.detectors.get(session);
        if (detector) {
            ServerReadyDetector.detectors.delete(session);
            detector.dispose();
        }
    }
    static rememberShellPid(session, pid) {
        const detector = ServerReadyDetector.detectors.get(session);
        if (detector) {
            detector.shellPid = pid;
        }
    }
    static async startListeningTerminalData() {
        if (!this.terminalDataListener) {
            this.terminalDataListener = vscode.window.onDidWriteTerminalData(async (e) => {
                // first find the detector with a matching pid
                const pid = await e.terminal.processId;
                const str = removeAnsiEscapeCodes(e.data);
                for (const [, detector] of this.detectors) {
                    if (detector.shellPid === pid) {
                        detector.detectPattern(str);
                        return;
                    }
                }
                // if none found, try all detectors until one matches
                for (const [, detector] of this.detectors) {
                    if (detector.detectPattern(str)) {
                        return;
                    }
                }
            });
        }
    }
    constructor(session) {
        super(() => this.internalDispose());
        this.session = session;
        this.disposables = [];
        this.lateDisposables = new Set([]);
        // Re-used the triggered of the parent session, if one exists
        if (session.parentSession) {
            this.trigger = ServerReadyDetector.start(session.parentSession)?.trigger ?? new Trigger();
        }
        else {
            this.trigger = new Trigger();
        }
        this.regexp = new RegExp(session.configuration.serverReadyAction.pattern || PATTERN, 'i');
    }
    internalDispose() {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
    }
    dispose() {
        this.lateDisposables.forEach(d => d.dispose());
        return super.dispose();
    }
    detectPattern(s) {
        if (!this.trigger.hasFired) {
            const matches = this.regexp.exec(s);
            if (matches && matches.length >= 1) {
                this.openExternalWithString(this.session, matches.length > 1 ? matches[1] : '');
                this.trigger.fire();
                this.internalDispose();
                return true;
            }
        }
        return false;
    }
    openExternalWithString(session, captureString) {
        const args = session.configuration.serverReadyAction;
        let uri;
        if (captureString === '') {
            // nothing captured by reg exp -> use the uriFormat as the target uri without substitution
            // verify that format does not contain '%s'
            const format = args.uriFormat || '';
            if (format.indexOf('%s') >= 0) {
                const errMsg = vscode.l10n.t("Format uri ('{0}') uses a substitution placeholder but pattern did not capture anything.", format);
                vscode.window.showErrorMessage(errMsg, { modal: true }).then(_ => undefined);
                return;
            }
            uri = format;
        }
        else {
            // if no uriFormat is specified guess the appropriate format based on the captureString
            const format = args.uriFormat || (/^[0-9]+$/.test(captureString) ? URI_PORT_FORMAT : URI_FORMAT);
            // verify that format only contains a single '%s'
            const s = format.split('%s');
            if (s.length !== 2) {
                const errMsg = vscode.l10n.t("Format uri ('{0}') must contain exactly one substitution placeholder.", format);
                vscode.window.showErrorMessage(errMsg, { modal: true }).then(_ => undefined);
                return;
            }
            uri = util.format(format, captureString);
        }
        this.openExternalWithUri(session, uri);
    }
    async openExternalWithUri(session, uri) {
        const args = session.configuration.serverReadyAction;
        switch (args.action || 'openExternally') {
            case 'openExternally':
                await vscode.env.openExternal(vscode.Uri.parse(uri));
                break;
            case 'debugWithChrome':
                await this.debugWithBrowser('pwa-chrome', session, uri);
                break;
            case 'debugWithEdge':
                await this.debugWithBrowser('pwa-msedge', session, uri);
                break;
            case 'startDebugging':
                await this.startNamedDebugSession(session, args.name || 'unspecified');
                break;
            default:
                // not supported
                break;
        }
    }
    async debugWithBrowser(type, session, uri) {
        const args = session.configuration.serverReadyAction;
        if (!args.killOnServerStop) {
            await this.startBrowserDebugSession(type, session, uri);
            return;
        }
        const trackerId = (0, crypto_1.randomUUID)();
        const cts = new vscode.CancellationTokenSource();
        const newSessionPromise = this.catchStartedDebugSession(session => session.configuration._debugServerReadySessionId === trackerId, cts.token);
        if (!await this.startBrowserDebugSession(type, session, uri, trackerId)) {
            cts.cancel();
            cts.dispose();
            return;
        }
        const createdSession = await newSessionPromise;
        cts.dispose();
        if (!createdSession) {
            return;
        }
        const stopListener = vscode.debug.onDidTerminateDebugSession(async (terminated) => {
            if (terminated === session) {
                stopListener.dispose();
                this.lateDisposables.delete(stopListener);
                await vscode.debug.stopDebugging(createdSession);
            }
        });
        this.lateDisposables.add(stopListener);
    }
    startBrowserDebugSession(type, session, uri, trackerId) {
        return vscode.debug.startDebugging(session.workspaceFolder, {
            type,
            name: 'Browser Debug',
            request: 'launch',
            url: uri,
            webRoot: session.configuration.serverReadyAction.webRoot || WEB_ROOT,
            _debugServerReadySessionId: trackerId,
        });
    }
    async startNamedDebugSession(session, name) {
        const args = session.configuration.serverReadyAction;
        if (!args.killOnServerStop) {
            await vscode.debug.startDebugging(session.workspaceFolder, name);
            return;
        }
        const cts = new vscode.CancellationTokenSource();
        const newSessionPromise = this.catchStartedDebugSession(x => x.name === name, cts.token);
        if (!await vscode.debug.startDebugging(session.workspaceFolder, name)) {
            cts.cancel();
            cts.dispose();
            return;
        }
        const createdSession = await newSessionPromise;
        cts.dispose();
        if (!createdSession) {
            return;
        }
        const stopListener = vscode.debug.onDidTerminateDebugSession(async (terminated) => {
            if (terminated === session) {
                stopListener.dispose();
                this.lateDisposables.delete(stopListener);
                await vscode.debug.stopDebugging(createdSession);
            }
        });
        this.lateDisposables.add(stopListener);
    }
    catchStartedDebugSession(predicate, cancellationToken) {
        return new Promise(_resolve => {
            const done = (value) => {
                listener.dispose();
                cancellationListener.dispose();
                this.lateDisposables.delete(listener);
                this.lateDisposables.delete(cancellationListener);
                _resolve(value);
            };
            const cancellationListener = cancellationToken.onCancellationRequested(done);
            const listener = vscode.debug.onDidStartDebugSession(session => {
                if (predicate(session)) {
                    done(session);
                }
            });
            // In case the debug session of interest was never caught anyhow.
            this.lateDisposables.add(listener);
            this.lateDisposables.add(cancellationListener);
        });
    }
}
ServerReadyDetector.detectors = new Map();
function activate(context) {
    context.subscriptions.push(vscode.debug.onDidStartDebugSession(session => {
        if (session.configuration.serverReadyAction) {
            const detector = ServerReadyDetector.start(session);
            if (detector) {
                ServerReadyDetector.startListeningTerminalData();
            }
        }
    }));
    context.subscriptions.push(vscode.debug.onDidTerminateDebugSession(session => {
        ServerReadyDetector.stop(session);
    }));
    const trackers = new Set();
    context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('*', {
        resolveDebugConfigurationWithSubstitutedVariables(_folder, debugConfiguration) {
            if (debugConfiguration.type && debugConfiguration.serverReadyAction) {
                if (!trackers.has(debugConfiguration.type)) {
                    trackers.add(debugConfiguration.type);
                    startTrackerForType(context, debugConfiguration.type);
                }
            }
            return debugConfiguration;
        }
    }));
}
exports.activate = activate;
function startTrackerForType(context, type) {
    // scan debug console output for a PORT message
    context.subscriptions.push(vscode.debug.registerDebugAdapterTrackerFactory(type, {
        createDebugAdapterTracker(session) {
            const detector = ServerReadyDetector.start(session);
            if (detector) {
                let runInTerminalRequestSeq;
                return {
                    onDidSendMessage: m => {
                        if (m.type === 'event' && m.event === 'output' && m.body) {
                            switch (m.body.category) {
                                case 'console':
                                case 'stderr':
                                case 'stdout':
                                    if (m.body.output) {
                                        detector.detectPattern(m.body.output);
                                    }
                                    break;
                                default:
                                    break;
                            }
                        }
                        if (m.type === 'request' && m.command === 'runInTerminal' && m.arguments) {
                            if (m.arguments.kind === 'integrated') {
                                runInTerminalRequestSeq = m.seq; // remember this to find matching response
                            }
                        }
                    },
                    onWillReceiveMessage: m => {
                        if (runInTerminalRequestSeq && m.type === 'response' && m.command === 'runInTerminal' && m.body && runInTerminalRequestSeq === m.request_seq) {
                            runInTerminalRequestSeq = undefined;
                            ServerReadyDetector.rememberShellPid(session, m.body.shellProcessId);
                        }
                    }
                };
            }
            return undefined;
        }
    }));
}
//# sourceMappingURL=extension.js.map