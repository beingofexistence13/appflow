define(["require", "exports", "vs/nls"], function (require, exports, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isAndroid = exports.isEdge = exports.isSafari = exports.isFirefox = exports.isChrome = exports.isLittleEndian = exports.OS = exports.OperatingSystem = exports.setTimeout0 = exports.setTimeout0IsFaster = exports.translationsConfigFile = exports.platformLocale = exports.locale = exports.Language = exports.language = exports.userAgent = exports.platform = exports.isCI = exports.isMobile = exports.isIOS = exports.isWebWorker = exports.isWeb = exports.isElectron = exports.isNative = exports.isLinuxSnap = exports.isLinux = exports.isMacintosh = exports.isWindows = exports.PlatformToString = exports.Platform = exports.globals = exports.LANGUAGE_DEFAULT = void 0;
    exports.LANGUAGE_DEFAULT = 'en';
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
    let _language = exports.LANGUAGE_DEFAULT;
    let _platformLocale = exports.LANGUAGE_DEFAULT;
    let _translationsConfigFile = undefined;
    let _userAgent = undefined;
    /**
     * @deprecated use `globalThis` instead
     */
    exports.globals = (typeof self === 'object' ? self : typeof global === 'object' ? global : {});
    let nodeProcess = undefined;
    if (typeof exports.globals.vscode !== 'undefined' && typeof exports.globals.vscode.process !== 'undefined') {
        // Native environment (sandboxed)
        nodeProcess = exports.globals.vscode.process;
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
        nls.localize({ key: 'ensureLoaderPluginIsLoaded', comment: ['{Locked}'] }, '_'));
        _locale = configuredLocale || exports.LANGUAGE_DEFAULT;
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
        _locale = exports.LANGUAGE_DEFAULT;
        _language = exports.LANGUAGE_DEFAULT;
        const rawNlsConfig = nodeProcess.env['VSCODE_NLS_CONFIG'];
        if (rawNlsConfig) {
            try {
                const nlsConfig = JSON.parse(rawNlsConfig);
                const resolved = nlsConfig.availableLanguages['*'];
                _locale = nlsConfig.locale;
                _platformLocale = nlsConfig.osLocale;
                // VSCode's default language is 'en'
                _language = resolved ? resolved : exports.LANGUAGE_DEFAULT;
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
    function PlatformToString(platform) {
        switch (platform) {
            case 0 /* Platform.Web */: return 'Web';
            case 1 /* Platform.Mac */: return 'Mac';
            case 2 /* Platform.Linux */: return 'Linux';
            case 3 /* Platform.Windows */: return 'Windows';
        }
    }
    exports.PlatformToString = PlatformToString;
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
    exports.isWindows = _isWindows;
    exports.isMacintosh = _isMacintosh;
    exports.isLinux = _isLinux;
    exports.isLinuxSnap = _isLinuxSnap;
    exports.isNative = _isNative;
    exports.isElectron = _isElectron;
    exports.isWeb = _isWeb;
    exports.isWebWorker = (_isWeb && typeof exports.globals.importScripts === 'function');
    exports.isIOS = _isIOS;
    exports.isMobile = _isMobile;
    /**
     * Whether we run inside a CI environment, such as
     * GH actions or Azure Pipelines.
     */
    exports.isCI = _isCI;
    exports.platform = _platform;
    exports.userAgent = _userAgent;
    /**
     * The language used for the user interface. The format of
     * the string is all lower case (e.g. zh-tw for Traditional
     * Chinese)
     */
    exports.language = _language;
    var Language;
    (function (Language) {
        function value() {
            return exports.language;
        }
        Language.value = value;
        function isDefaultVariant() {
            if (exports.language.length === 2) {
                return exports.language === 'en';
            }
            else if (exports.language.length >= 3) {
                return exports.language[0] === 'e' && exports.language[1] === 'n' && exports.language[2] === '-';
            }
            else {
                return false;
            }
        }
        Language.isDefaultVariant = isDefaultVariant;
        function isDefault() {
            return exports.language === 'en';
        }
        Language.isDefault = isDefault;
    })(Language || (exports.Language = Language = {}));
    /**
     * The OS locale or the locale specified by --locale. The format of
     * the string is all lower case (e.g. zh-tw for Traditional
     * Chinese). The UI is not necessarily shown in the provided locale.
     */
    exports.locale = _locale;
    /**
     * This will always be set to the OS/browser's locale regardless of
     * what was specified by --locale. The format of the string is all
     * lower case (e.g. zh-tw for Traditional Chinese). The UI is not
     * necessarily shown in the provided locale.
     */
    exports.platformLocale = _platformLocale;
    /**
     * The translations that are available through language packs.
     */
    exports.translationsConfigFile = _translationsConfigFile;
    exports.setTimeout0IsFaster = (typeof exports.globals.postMessage === 'function' && !exports.globals.importScripts);
    /**
     * See https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#:~:text=than%204%2C%20then-,set%20timeout%20to%204,-.
     *
     * Works similarly to `setTimeout(0)` but doesn't suffer from the 4ms artificial delay
     * that browsers set when the nesting level is > 5.
     */
    exports.setTimeout0 = (() => {
        if (exports.setTimeout0IsFaster) {
            const pending = [];
            exports.globals.addEventListener('message', (e) => {
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
                exports.globals.postMessage({ vscodeScheduleAsyncWork: myId }, '*');
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
    function isLittleEndian() {
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
    exports.isLittleEndian = isLittleEndian;
    exports.isChrome = !!(exports.userAgent && exports.userAgent.indexOf('Chrome') >= 0);
    exports.isFirefox = !!(exports.userAgent && exports.userAgent.indexOf('Firefox') >= 0);
    exports.isSafari = !!(!exports.isChrome && (exports.userAgent && exports.userAgent.indexOf('Safari') >= 0));
    exports.isEdge = !!(exports.userAgent && exports.userAgent.indexOf('Edg/') >= 0);
    exports.isAndroid = !!(exports.userAgent && exports.userAgent.indexOf('Android') >= 0);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm0uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2NvbW1vbi9wbGF0Zm9ybS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBTWEsUUFBQSxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7SUFFckMsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDO0lBQ3ZCLElBQUksWUFBWSxHQUFHLEtBQUssQ0FBQztJQUN6QixJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7SUFDckIsSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDO0lBQ3pCLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQztJQUN0QixJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUM7SUFDbkIsSUFBSSxXQUFXLEdBQUcsS0FBSyxDQUFDO0lBQ3hCLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQztJQUNuQixJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDbEIsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQ3RCLElBQUksT0FBTyxHQUF1QixTQUFTLENBQUM7SUFDNUMsSUFBSSxTQUFTLEdBQVcsd0JBQWdCLENBQUM7SUFDekMsSUFBSSxlQUFlLEdBQVcsd0JBQWdCLENBQUM7SUFDL0MsSUFBSSx1QkFBdUIsR0FBdUIsU0FBUyxDQUFDO0lBQzVELElBQUksVUFBVSxHQUF1QixTQUFTLENBQUM7SUFvQy9DOztPQUVHO0lBQ1UsUUFBQSxPQUFPLEdBQVEsQ0FBQyxPQUFPLElBQUksS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxNQUFNLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRXpHLElBQUksV0FBVyxHQUE2QixTQUFTLENBQUM7SUFDdEQsSUFBSSxPQUFPLGVBQU8sQ0FBQyxNQUFNLEtBQUssV0FBVyxJQUFJLE9BQU8s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