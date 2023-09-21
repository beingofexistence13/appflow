"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
(function () {
    const monacoEnvironment = globalThis.MonacoEnvironment;
    const monacoBaseUrl = monacoEnvironment && monacoEnvironment.baseUrl ? monacoEnvironment.baseUrl : '../../../';
    function createTrustedTypesPolicy(policyName, policyOptions) {
        if (monacoEnvironment?.createTrustedTypesPolicy) {
            try {
                return monacoEnvironment.createTrustedTypesPolicy(policyName, policyOptions);
            }
            catch (err) {
                console.warn(err);
                return undefined;
            }
        }
        try {
            return self.trustedTypes?.createPolicy(policyName, policyOptions);
        }
        catch (err) {
            console.warn(err);
            return undefined;
        }
    }
    const trustedTypesPolicy = createTrustedTypesPolicy('amdLoader', {
        createScriptURL: value => value,
        createScript: (_, ...args) => {
            // workaround a chrome issue not allowing to create new functions
            // see https://github.com/w3c/webappsec-trusted-types/wiki/Trusted-Types-for-function-constructor
            const fnArgs = args.slice(0, -1).join(',');
            const fnBody = args.pop().toString();
            // Do not add a new line to fnBody, as this will confuse source maps.
            const body = `(function anonymous(${fnArgs}) { ${fnBody}\n})`;
            return body;
        }
    });
    function canUseEval() {
        try {
            const func = (trustedTypesPolicy
                ? globalThis.eval(trustedTypesPolicy.createScript('', 'true')) // CodeQL [SM01632] fetch + eval is used on the web worker instead of importScripts if possible because importScripts is synchronous and we observed deadlocks on Safari
                : new Function('true') // CodeQL [SM01632] fetch + eval is used on the web worker instead of importScripts if possible because importScripts is synchronous and we observed deadlocks on Safari
            );
            func.call(globalThis);
            return true;
        }
        catch (err) {
            return false;
        }
    }
    function loadAMDLoader() {
        return new Promise((resolve, reject) => {
            if (typeof globalThis.define === 'function' && globalThis.define.amd) {
                return resolve();
            }
            const loaderSrc = monacoBaseUrl + 'vs/loader.js';
            const isCrossOrigin = (/^((http:)|(https:)|(file:))/.test(loaderSrc) && loaderSrc.substring(0, globalThis.origin.length) !== globalThis.origin);
            if (!isCrossOrigin && canUseEval()) {
                // use `fetch` if possible because `importScripts`
                // is synchronous and can lead to deadlocks on Safari
                fetch(loaderSrc).then((response) => {
                    if (response.status !== 200) {
                        throw new Error(response.statusText);
                    }
                    return response.text();
                }).then((text) => {
                    text = `${text}\n//# sourceURL=${loaderSrc}`;
                    const func = (trustedTypesPolicy
                        ? globalThis.eval(trustedTypesPolicy.createScript('', text))
                        : new Function(text) // CodeQL [SM01632] fetch + eval is used on the web worker instead of importScripts if possible because importScripts is synchronous and we observed deadlocks on Safari
                    );
                    func.call(globalThis);
                    resolve();
                }).then(undefined, reject);
                return;
            }
            if (trustedTypesPolicy) {
                importScripts(trustedTypesPolicy.createScriptURL(loaderSrc));
            }
            else {
                importScripts(loaderSrc);
            }
            resolve();
        });
    }
    function configureAMDLoader() {
        require.config({
            baseUrl: monacoBaseUrl,
            catchError: true,
            trustedTypesPolicy,
            amdModulesPattern: /^vs\//
        });
    }
    function loadCode(moduleId) {
        loadAMDLoader().then(() => {
            configureAMDLoader();
            require([moduleId], function (ws) {
                setTimeout(function () {
                    const messageHandler = ws.create((msg, transfer) => {
                        globalThis.postMessage(msg, transfer);
                    }, null);
                    globalThis.onmessage = (e) => messageHandler.onmessage(e.data, e.ports);
                    while (beforeReadyMessages.length > 0) {
                        const e = beforeReadyMessages.shift();
                        messageHandler.onmessage(e.data, e.ports);
                    }
                }, 0);
            });
        });
    }
    // If the loader is already defined, configure it immediately
    // This helps in the bundled case, where we must load nls files
    // and they need a correct baseUrl to be loaded.
    if (typeof globalThis.define === 'function' && globalThis.define.amd) {
        configureAMDLoader();
    }
    let isFirstMessage = true;
    const beforeReadyMessages = [];
    globalThis.onmessage = (message) => {
        if (!isFirstMessage) {
            beforeReadyMessages.push(message);
            return;
        }
        isFirstMessage = false;
        loadCode(message.data);
    };
})();
//# sourceMappingURL=workerMain.js.map