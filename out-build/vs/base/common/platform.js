define(["require", "exports", "vs/nls!vs/base/common/platform"], function (require, exports, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$H = exports.$G = exports.$F = exports.$E = exports.$D = exports.$C = exports.OS = exports.OperatingSystem = exports.$A = exports.$z = exports.$y = exports.$x = exports.$w = exports.Language = exports.$v = exports.$u = exports.$t = exports.$s = exports.$r = exports.$q = exports.$p = exports.$o = exports.$n = exports.$m = exports.$l = exports.$k = exports.$j = exports.$i = exports.$h = exports.Platform = exports.$g = exports.$f = void 0;
    exports.$f = 'en';
    let _isWindows = false;
    let _isMacintosh = false;
    let _isLinux = false;
    let _isLinuxSnap = false;
    let _isNative = false;
    let _isWeb = false;
    let _isElectron = false;
    let _isIOS = false;
    let _isCI = false;
    let _isMobile = false;
    let _locale = undefined;
    let _language = exports.$f;
    let _platformLocale = exports.$f;
    let _translationsConfigFile = undefined;
    let _userAgent = undefined;
    /**
     * @deprecated use `globalThis` instead
     */
    exports.$g = (typeof self === 'object' ? self : typeof global === 'object' ? global : {});
    let nodeProcess = undefined;
    if (typeof exports.$g.vscode !== 'undefined' && typeof exports.$g.vscode.process !== 'undefined') {
        // Native environment (sandboxed)
        nodeProcess = exports.$g.vscode.process;
    }
    else if (typeof process !== 'undefined') {
        // Native environment (non-sandboxed)
        nodeProcess = process;
    }
    const isElectronProcess = typeof nodeProcess?.versions?.electron === 'string';
    const isElectronRenderer = isElectronProcess && nodeProcess?.type === 'renderer';
    // Web environment
    if (typeof navigator === 'object' && !isElectronRenderer) {
        _userAgent = navigator.userAgent;
        _isWindows = _userAgent.indexOf('Windows') >= 0;
        _isMacintosh = _userAgent.indexOf('Macintosh') >= 0;
        _isIOS = (_userAgent.indexOf('Macintosh') >= 0 || _userAgent.indexOf('iPad') >= 0 || _userAgent.indexOf('iPhone') >= 0) && !!navigator.maxTouchPoints && navigator.maxTouchPoints > 0;
        _isLinux = _userAgent.indexOf('Linux') >= 0;
        _isMobile = _userAgent?.indexOf('Mobi') >= 0;
        _isWeb = true;
        const configuredLocale = nls.getConfiguredDefaultLocale(
        // This call _must_ be done in the file that calls `nls.getConfiguredDefaultLocale`
        // to ensure that the NLS AMD Loader plugin has been loaded and configured.
        // This is because the loader plugin decides what the default locale is based on
        // how it's able to resolve the strings.
        nls.localize(0, null));
        _locale = configuredLocale || exports.$f;
        _language = _locale;
        _platformLocale = navigator.language;
    }
    // Native environment
    else if (typeof nodeProcess === 'object') {
        _isWindows = (nodeProcess.platform === 'win32');
        _isMacintosh = (nodeProcess.platform === 'darwin');
        _isLinux = (nodeProcess.platform === 'linux');
        _isLinuxSnap = _isLinux && !!nodeProcess.env['SNAP'] && !!nodeProcess.env['SNAP_REVISION'];
        _isElectron = isElectronProcess;
        _isCI = !!nodeProcess.env['CI'] || !!nodeProcess.env['BUILD_ARTIFACTSTAGINGDIRECTORY'];
        _locale = exports.$f;
        _language = exports.$f;
        const rawNlsConfig = nodeProcess.env['VSCODE_NLS_CONFIG'];
        if (rawNlsConfig) {
            try {
                const nlsConfig = JSON.parse(rawNlsConfig);
                const resolved = nlsConfig.availableLanguages['*'];
                _locale = nlsConfig.locale;
                _platformLocale = nlsConfig.osLocale;
                // VSCode's default language is 'en'
                _language = resolved ? resolved : exports.$f;
                _translationsConfigFile = nlsConfig._translationsConfigFile;
            }
            catch (e) {
            }
        }
        _isNative = true;
    }
    // Unknown environment
    else {
        console.error('Unable to resolve platform.');
    }
    var Platform;
    (function (Platform) {
        Platform[Platform["Web"] = 0] = "Web";
        Platform[Platform["Mac"] = 1] = "Mac";
        Platform[Platform["Linux"] = 2] = "Linux";
        Platform[Platform["Windows"] = 3] = "Windows";
    })(Platform || (exports.Platform = Platform = {}));
    function $h(platform) {
        switch (platform) {
            case 0 /* Platform.Web */: return 'Web';
            case 1 /* Platform.Mac */: return 'Mac';
            case 2 /* Platform.Linux */: return 'Linux';
            case 3 /* Platform.Windows */: return 'Windows';
        }
    }
    exports.$h = $h;
    let _platform = 0 /* Platform.Web */;
    if (_isMacintosh) {
        _platform = 1 /* Platform.Mac */;
    }
    else if (_isWindows) {
        _platform = 3 /* Platform.Windows */;
    }
    else if (_isLinux) {
        _platform = 2 /* Platform.Linux */;
    }
    exports.$i = _isWindows;
    exports.$j = _isMacintosh;
    exports.$k = _isLinux;
    exports.$l = _isLinuxSnap;
    exports.$m = _isNative;
    exports.$n = _isElectron;
    exports.$o = _isWeb;
    exports.$p = (_isWeb && typeof exports.$g.importScripts === 'function');
    exports.$q = _isIOS;
    exports.$r = _isMobile;
    /**
     * Whether we run inside a CI environment, such as
     * GH actions or Azure Pipelines.
     */
    exports.$s = _isCI;
    exports.$t = _platform;
    exports.$u = _userAgent;
    /**
     * The language used for the user interface. The format of
     * the string is all lower case (e.g. zh-tw for Traditional
     * Chinese)
     */
    exports.$v = _language;
    var Language;
    (function (Language) {
        function value() {
            return exports.$v;
        }
        Language.value = value;
        function isDefaultVariant() {
            if (exports.$v.length === 2) {
                return exports.$v === 'en';
            }
            else if (exports.$v.length >= 3) {
                return exports.$v[0] === 'e' && exports.$v[1] === 'n' && exports.$v[2] === '-';
            }
            else {
                return false;
            }
        }
        Language.isDefaultVariant = isDefaultVariant;
        function isDefault() {
            return exports.$v === 'en';
        }
        Language.isDefault = isDefault;
    })(Language || (exports.Language = Language = {}));
    /**
     * The OS locale or the locale specified by --locale. The format of
     * the string is all lower case (e.g. zh-tw for Traditional
     * Chinese). The UI is not necessarily shown in the provided locale.
     */
    exports.$w = _locale;
    /**
     * This will always be set to the OS/browser's locale regardless of
     * what was specified by --locale. The format of the string is all
     * lower case (e.g. zh-tw for Traditional Chinese). The UI is not
     * necessarily shown in the provided locale.
     */
    exports.$x = _platformLocale;
    /**
     * The translations that are available through language packs.
     */
    exports.$y = _translationsConfigFile;
    exports.$z = (typeof exports.$g.postMessage === 'function' && !exports.$g.importScripts);
    /**
     * See https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#:~:text=than%204%2C%20then-,set%20timeout%20to%204,-.
     *
     * Works similarly to `setTimeout(0)` but doesn't suffer from the 4ms artificial delay
     * that browsers set when the nesting level is > 5.
     */
    exports.$A = (() => {
        if (exports.$z) {
            const pending = [];
            exports.$g.addEventListener('message', (e) => {
                if (e.data && e.data.vscodeScheduleAsyncWork) {
                    for (let i = 0, len = pending.length; i < len; i++) {
                        const candidate = pending[i];
                        if (candidate.id === e.data.vscodeScheduleAsyncWork) {
                            pending.splice(i, 1);
                            candidate.callback();
                            return;
                        }
                    }
                }
            });
            let lastId = 0;
            return (callback) => {
                const myId = ++lastId;
                pending.push({
                    id: myId,
                    callback: callback
                });
                exports.$g.postMessage({ vscodeScheduleAsyncWork: myId }, '*');
            };
        }
        return (callback) => setTimeout(callback);
    })();
    var OperatingSystem;
    (function (OperatingSystem) {
        OperatingSystem[OperatingSystem["Windows"] = 1] = "Windows";
        OperatingSystem[OperatingSystem["Macintosh"] = 2] = "Macintosh";
        OperatingSystem[OperatingSystem["Linux"] = 3] = "Linux";
    })(OperatingSystem || (exports.OperatingSystem = OperatingSystem = {}));
    exports.OS = (_isMacintosh || _isIOS ? 2 /* OperatingSystem.Macintosh */ : (_isWindows ? 1 /* OperatingSystem.Windows */ : 3 /* OperatingSystem.Linux */));
    let _isLittleEndian = true;
    let _isLittleEndianComputed = false;
    function $C() {
        if (!_isLittleEndianComputed) {
            _isLittleEndianComputed = true;
            const test = new Uint8Array(2);
            test[0] = 1;
            test[1] = 2;
            const view = new Uint16Array(test.buffer);
            _isLittleEndian = (view[0] === (2 << 8) + 1);
        }
        return _isLittleEndian;
    }
    exports.$C = $C;
    exports.$D = !!(exports.$u && exports.$u.indexOf('Chrome') >= 0);
    exports.$E = !!(exports.$u && exports.$u.indexOf('Firefox') >= 0);
    exports.$F = !!(!exports.$D && (exports.$u && exports.$u.indexOf('Safari') >= 0));
    exports.$G = !!(exports.$u && exports.$u.indexOf('Edg/') >= 0);
    exports.$H = !!(exports.$u && exports.$u.indexOf('Android') >= 0);
});
//# sourceMappingURL=platform.js.map