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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyTWFpbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2Uvd29ya2VyL3dvcmtlck1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHO0FBRWhHLENBQUM7SUFTQSxNQUFNLGlCQUFpQixHQUFvQyxVQUFrQixDQUFDLGlCQUFpQixDQUFDO0lBQ2hHLE1BQU0sYUFBYSxHQUFHLGlCQUFpQixJQUFJLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUM7SUFFL0csU0FBUyx3QkFBd0IsQ0FDaEMsVUFBa0IsRUFDbEIsYUFBdUI7UUFHdkIsSUFBSSxpQkFBaUIsRUFBRSx3QkFBd0IsRUFBRTtZQUNoRCxJQUFJO2dCQUNILE9BQU8saUJBQWlCLENBQUMsd0JBQXdCLENBQUMsVUFBVSxFQUFFLGFBQWEsQ0FBQyxDQUFDO2FBQzdFO1lBQUMsT0FBTyxHQUFHLEVBQUU7Z0JBQ2IsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDbEIsT0FBTyxTQUFTLENBQUM7YUFDakI7U0FDRDtRQUVELElBQUk7WUFDSCxPQUFPLElBQUksQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLFVBQVUsRUFBRSxhQUFhLENBQUMsQ0FBQztTQUNsRTtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ2IsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNsQixPQUFPLFNBQVMsQ0FBQztTQUNqQjtJQUNGLENBQUM7SUFFRCxNQUFNLGtCQUFrQixHQUFHLHdCQUF3QixDQUFDLFdBQVcsRUFBRTtRQUNoRSxlQUFlLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLO1FBQy9CLFlBQVksRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLElBQWMsRUFBRSxFQUFFO1lBQ3RDLGlFQUFp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