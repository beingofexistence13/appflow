/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/platform/contextkey/common/contextkey", "vs/platform/registry/common/platform"], function (require, exports, instantiation_1, contextkey_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ITerminalLogService = exports.ILocalPtyService = exports.TerminalExtensions = exports.TerminalExitReason = exports.ShellIntegrationStatus = exports.ProfileSource = exports.FlowControlConstants = exports.LocalReconnectConstants = exports.TerminalLocationString = exports.TerminalLocation = exports.HeartbeatConstants = exports.IPtyService = exports.ProcessPropertyType = exports.TerminalIpcChannels = exports.TitleEventSource = exports.WindowsShellType = exports.PosixShellType = exports.TerminalSettingId = exports.TerminalSettingPrefix = exports.terminalTabFocusModeContextKey = void 0;
    exports.terminalTabFocusModeContextKey = new contextkey_1.RawContextKey('terminalTabFocusMode', false, true);
    var TerminalSettingPrefix;
    (function (TerminalSettingPrefix) {
        TerminalSettingPrefix["DefaultProfile"] = "terminal.integrated.defaultProfile.";
        TerminalSettingPrefix["Profiles"] = "terminal.integrated.profiles.";
    })(TerminalSettingPrefix || (exports.TerminalSettingPrefix = TerminalSettingPrefix = {}));
    var TerminalSettingId;
    (function (TerminalSettingId) {
        TerminalSettingId["SendKeybindingsToShell"] = "terminal.integrated.sendKeybindingsToShell";
        TerminalSettingId["AutomationProfileLinux"] = "terminal.integrated.automationProfile.linux";
        TerminalSettingId["AutomationProfileMacOs"] = "terminal.integrated.automationProfile.osx";
        TerminalSettingId["AutomationProfileWindows"] = "terminal.integrated.automationProfile.windows";
        TerminalSettingId["ProfilesWindows"] = "terminal.integrated.profiles.windows";
        TerminalSettingId["ProfilesMacOs"] = "terminal.integrated.profiles.osx";
        TerminalSettingId["ProfilesLinux"] = "terminal.integrated.profiles.linux";
        TerminalSettingId["DefaultProfileLinux"] = "terminal.integrated.defaultProfile.linux";
        TerminalSettingId["DefaultProfileMacOs"] = "terminal.integrated.defaultProfile.osx";
        TerminalSettingId["DefaultProfileWindows"] = "terminal.integrated.defaultProfile.windows";
        TerminalSettingId["UseWslProfiles"] = "terminal.integrated.useWslProfiles";
        TerminalSettingId["TabsDefaultColor"] = "terminal.integrated.tabs.defaultColor";
        TerminalSettingId["TabsDefaultIcon"] = "terminal.integrated.tabs.defaultIcon";
        TerminalSettingId["TabsEnabled"] = "terminal.integrated.tabs.enabled";
        TerminalSettingId["TabsEnableAnimation"] = "terminal.integrated.tabs.enableAnimation";
        TerminalSettingId["TabsHideCondition"] = "terminal.integrated.tabs.hideCondition";
        TerminalSettingId["TabsShowActiveTerminal"] = "terminal.integrated.tabs.showActiveTerminal";
        TerminalSettingId["TabsShowActions"] = "terminal.integrated.tabs.showActions";
        TerminalSettingId["TabsLocation"] = "terminal.integrated.tabs.location";
        TerminalSettingId["TabsFocusMode"] = "terminal.integrated.tabs.focusMode";
        TerminalSettingId["MacOptionIsMeta"] = "terminal.integrated.macOptionIsMeta";
        TerminalSettingId["MacOptionClickForcesSelection"] = "terminal.integrated.macOptionClickForcesSelection";
        TerminalSettingId["AltClickMovesCursor"] = "terminal.integrated.altClickMovesCursor";
        TerminalSettingId["CopyOnSelection"] = "terminal.integrated.copyOnSelection";
        TerminalSettingId["EnableMultiLinePasteWarning"] = "terminal.integrated.enableMultiLinePasteWarning";
        TerminalSettingId["DrawBoldTextInBrightColors"] = "terminal.integrated.drawBoldTextInBrightColors";
        TerminalSettingId["FontFamily"] = "terminal.integrated.fontFamily";
        TerminalSettingId["FontSize"] = "terminal.integrated.fontSize";
        TerminalSettingId["LetterSpacing"] = "terminal.integrated.letterSpacing";
        TerminalSettingId["LineHeight"] = "terminal.integrated.lineHeight";
        TerminalSettingId["MinimumContrastRatio"] = "terminal.integrated.minimumContrastRatio";
        TerminalSettingId["TabStopWidth"] = "terminal.integrated.tabStopWidth";
        TerminalSettingId["FastScrollSensitivity"] = "terminal.integrated.fastScrollSensitivity";
        TerminalSettingId["MouseWheelScrollSensitivity"] = "terminal.integrated.mouseWheelScrollSensitivity";
        TerminalSettingId["BellDuration"] = "terminal.integrated.bellDuration";
        TerminalSettingId["FontWeight"] = "terminal.integrated.fontWeight";
        TerminalSettingId["FontWeightBold"] = "terminal.integrated.fontWeightBold";
        TerminalSettingId["CursorBlinking"] = "terminal.integrated.cursorBlinking";
        TerminalSettingId["CursorStyle"] = "terminal.integrated.cursorStyle";
        TerminalSettingId["CursorStyleInactive"] = "terminal.integrated.cursorStyleInactive";
        TerminalSettingId["CursorWidth"] = "terminal.integrated.cursorWidth";
        TerminalSettingId["Scrollback"] = "terminal.integrated.scrollback";
        TerminalSettingId["DetectLocale"] = "terminal.integrated.detectLocale";
        TerminalSettingId["DefaultLocation"] = "terminal.integrated.defaultLocation";
        TerminalSettingId["GpuAcceleration"] = "terminal.integrated.gpuAcceleration";
        TerminalSettingId["TerminalTitleSeparator"] = "terminal.integrated.tabs.separator";
        TerminalSettingId["TerminalTitle"] = "terminal.integrated.tabs.title";
        TerminalSettingId["TerminalDescription"] = "terminal.integrated.tabs.description";
        TerminalSettingId["RightClickBehavior"] = "terminal.integrated.rightClickBehavior";
        TerminalSettingId["Cwd"] = "terminal.integrated.cwd";
        TerminalSettingId["ConfirmOnExit"] = "terminal.integrated.confirmOnExit";
        TerminalSettingId["ConfirmOnKill"] = "terminal.integrated.confirmOnKill";
        TerminalSettingId["EnableBell"] = "terminal.integrated.enableBell";
        TerminalSettingId["CommandsToSkipShell"] = "terminal.integrated.commandsToSkipShell";
        TerminalSettingId["AllowChords"] = "terminal.integrated.allowChords";
        TerminalSettingId["AllowMnemonics"] = "terminal.integrated.allowMnemonics";
        TerminalSettingId["TabFocusMode"] = "terminal.integrated.tabFocusMode";
        TerminalSettingId["EnvMacOs"] = "terminal.integrated.env.osx";
        TerminalSettingId["EnvLinux"] = "terminal.integrated.env.linux";
        TerminalSettingId["EnvWindows"] = "terminal.integrated.env.windows";
        TerminalSettingId["EnvironmentChangesIndicator"] = "terminal.integrated.environmentChangesIndicator";
        TerminalSettingId["EnvironmentChangesRelaunch"] = "terminal.integrated.environmentChangesRelaunch";
        TerminalSettingId["ShowExitAlert"] = "terminal.integrated.showExitAlert";
        TerminalSettingId["SplitCwd"] = "terminal.integrated.splitCwd";
        TerminalSettingId["WindowsEnableConpty"] = "terminal.integrated.windowsEnableConpty";
        TerminalSettingId["WordSeparators"] = "terminal.integrated.wordSeparators";
        TerminalSettingId["EnableFileLinks"] = "terminal.integrated.enableFileLinks";
        TerminalSettingId["UnicodeVersion"] = "terminal.integrated.unicodeVersion";
        TerminalSettingId["LocalEchoLatencyThreshold"] = "terminal.integrated.localEchoLatencyThreshold";
        TerminalSettingId["LocalEchoEnabled"] = "terminal.integrated.localEchoEnabled";
        TerminalSettingId["LocalEchoExcludePrograms"] = "terminal.integrated.localEchoExcludePrograms";
        TerminalSettingId["LocalEchoStyle"] = "terminal.integrated.localEchoStyle";
        TerminalSettingId["EnablePersistentSessions"] = "terminal.integrated.enablePersistentSessions";
        TerminalSettingId["PersistentSessionReviveProcess"] = "terminal.integrated.persistentSessionReviveProcess";
        TerminalSettingId["HideOnStartup"] = "terminal.integrated.hideOnStartup";
        TerminalSettingId["CustomGlyphs"] = "terminal.integrated.customGlyphs";
        TerminalSettingId["PersistentSessionScrollback"] = "terminal.integrated.persistentSessionScrollback";
        TerminalSettingId["InheritEnv"] = "terminal.integrated.inheritEnv";
        TerminalSettingId["ShowLinkHover"] = "terminal.integrated.showLinkHover";
        TerminalSettingId["IgnoreProcessNames"] = "terminal.integrated.ignoreProcessNames";
        TerminalSettingId["AutoReplies"] = "terminal.integrated.autoReplies";
        TerminalSettingId["ShellIntegrationEnabled"] = "terminal.integrated.shellIntegration.enabled";
        TerminalSettingId["ShellIntegrationShowWelcome"] = "terminal.integrated.shellIntegration.showWelcome";
        TerminalSettingId["ShellIntegrationDecorationsEnabled"] = "terminal.integrated.shellIntegration.decorationsEnabled";
        TerminalSettingId["ShellIntegrationCommandHistory"] = "terminal.integrated.shellIntegration.history";
        TerminalSettingId["ShellIntegrationSuggestEnabled"] = "terminal.integrated.shellIntegration.suggestEnabled";
        TerminalSettingId["EnableImages"] = "terminal.integrated.enableImages";
        TerminalSettingId["SmoothScrolling"] = "terminal.integrated.smoothScrolling";
        TerminalSettingId["IgnoreBracketedPasteMode"] = "terminal.integrated.ignoreBracketedPasteMode";
        TerminalSettingId["FocusAfterRun"] = "terminal.integrated.focusAfterRun";
        // Debug settings that are hidden from user
        /** Simulated latency applied to all calls made to the pty host */
        TerminalSettingId["DeveloperPtyHostLatency"] = "terminal.integrated.developer.ptyHost.latency";
        /** Simulated startup delay of the pty host process */
        TerminalSettingId["DeveloperPtyHostStartupDelay"] = "terminal.integrated.developer.ptyHost.startupDelay";
        /** Shows the textarea element */
        TerminalSettingId["DevMode"] = "terminal.integrated.developer.devMode";
    })(TerminalSettingId || (exports.TerminalSettingId = TerminalSettingId = {}));
    var PosixShellType;
    (function (PosixShellType) {
        PosixShellType["PowerShell"] = "pwsh";
        PosixShellType["Bash"] = "bash";
        PosixShellType["Fish"] = "fish";
        PosixShellType["Sh"] = "sh";
        PosixShellType["Csh"] = "csh";
        PosixShellType["Ksh"] = "ksh";
        PosixShellType["Zsh"] = "zsh";
    })(PosixShellType || (exports.PosixShellType = PosixShellType = {}));
    var WindowsShellType;
    (function (WindowsShellType) {
        WindowsShellType["CommandPrompt"] = "cmd";
        WindowsShellType["PowerShell"] = "pwsh";
        WindowsShellType["Wsl"] = "wsl";
        WindowsShellType["GitBash"] = "gitbash";
    })(WindowsShellType || (exports.WindowsShellType = WindowsShellType = {}));
    var TitleEventSource;
    (function (TitleEventSource) {
        /** From the API or the rename command that overrides any other type */
        TitleEventSource[TitleEventSource["Api"] = 0] = "Api";
        /** From the process name property*/
        TitleEventSource[TitleEventSource["Process"] = 1] = "Process";
        /** From the VT sequence */
        TitleEventSource[TitleEventSource["Sequence"] = 2] = "Sequence";
        /** Config changed */
        TitleEventSource[TitleEventSource["Config"] = 3] = "Config";
    })(TitleEventSource || (exports.TitleEventSource = TitleEventSource = {}));
    var TerminalIpcChannels;
    (function (TerminalIpcChannels) {
        /**
         * Communicates between the renderer process and shared process.
         */
        TerminalIpcChannels["LocalPty"] = "localPty";
        /**
         * Communicates between the shared process and the pty host process.
         */
        TerminalIpcChannels["PtyHost"] = "ptyHost";
        /**
         * Communicates between the renderer process and the pty host process.
         */
        TerminalIpcChannels["PtyHostWindow"] = "ptyHostWindow";
        /**
         * Deals with logging from the pty host process.
         */
        TerminalIpcChannels["Logger"] = "logger";
        /**
         * Enables the detection of unresponsive pty hosts.
         */
        TerminalIpcChannels["Heartbeat"] = "heartbeat";
    })(TerminalIpcChannels || (exports.TerminalIpcChannels = TerminalIpcChannels = {}));
    var ProcessPropertyType;
    (function (ProcessPropertyType) {
        ProcessPropertyType["Cwd"] = "cwd";
        ProcessPropertyType["InitialCwd"] = "initialCwd";
        ProcessPropertyType["FixedDimensions"] = "fixedDimensions";
        ProcessPropertyType["Title"] = "title";
        ProcessPropertyType["ShellType"] = "shellType";
        ProcessPropertyType["HasChildProcesses"] = "hasChildProcesses";
        ProcessPropertyType["ResolvedShellLaunchConfig"] = "resolvedShellLaunchConfig";
        ProcessPropertyType["OverrideDimensions"] = "overrideDimensions";
        ProcessPropertyType["FailedShellIntegrationActivation"] = "failedShellIntegrationActivation";
        ProcessPropertyType["UsedShellIntegrationInjection"] = "usedShellIntegrationInjection";
    })(ProcessPropertyType || (exports.ProcessPropertyType = ProcessPropertyType = {}));
    exports.IPtyService = (0, instantiation_1.createDecorator)('ptyService');
    var HeartbeatConstants;
    (function (HeartbeatConstants) {
        /**
         * The duration between heartbeats
         */
        HeartbeatConstants[HeartbeatConstants["BeatInterval"] = 5000] = "BeatInterval";
        /**
         * The duration of the first heartbeat while the pty host is starting up. This is much larger
         * than the regular BeatInterval to accomodate slow machines, we still want to warn about the
         * pty host's unresponsiveness eventually though.
         */
        HeartbeatConstants[HeartbeatConstants["ConnectingBeatInterval"] = 20000] = "ConnectingBeatInterval";
        /**
         * Defines a multiplier for BeatInterval for how long to wait before starting the second wait
         * timer.
         */
        HeartbeatConstants[HeartbeatConstants["FirstWaitMultiplier"] = 1.2] = "FirstWaitMultiplier";
        /**
         * Defines a multiplier for BeatInterval for how long to wait before telling the user about
         * non-responsiveness. The second timer is to avoid informing the user incorrectly when waking
         * the computer up from sleep
         */
        HeartbeatConstants[HeartbeatConstants["SecondWaitMultiplier"] = 1] = "SecondWaitMultiplier";
        /**
         * How long to wait before telling the user about non-responsiveness when they try to create a
         * process. This short circuits the standard wait timeouts to tell the user sooner and only
         * create process is handled to avoid additional perf overhead.
         */
        HeartbeatConstants[HeartbeatConstants["CreateProcessTimeout"] = 5000] = "CreateProcessTimeout";
    })(HeartbeatConstants || (exports.HeartbeatConstants = HeartbeatConstants = {}));
    var TerminalLocation;
    (function (TerminalLocation) {
        TerminalLocation[TerminalLocation["Panel"] = 1] = "Panel";
        TerminalLocation[TerminalLocation["Editor"] = 2] = "Editor";
    })(TerminalLocation || (exports.TerminalLocation = TerminalLocation = {}));
    var TerminalLocationString;
    (function (TerminalLocationString) {
        TerminalLocationString["TerminalView"] = "view";
        TerminalLocationString["Editor"] = "editor";
    })(TerminalLocationString || (exports.TerminalLocationString = TerminalLocationString = {}));
    var LocalReconnectConstants;
    (function (LocalReconnectConstants) {
        /**
         * If there is no reconnection within this time-frame, consider the connection permanently closed...
        */
        LocalReconnectConstants[LocalReconnectConstants["GraceTime"] = 60000] = "GraceTime";
        /**
         * Maximal grace time between the first and the last reconnection...
        */
        LocalReconnectConstants[LocalReconnectConstants["ShortGraceTime"] = 6000] = "ShortGraceTime";
    })(LocalReconnectConstants || (exports.LocalReconnectConstants = LocalReconnectConstants = {}));
    var FlowControlConstants;
    (function (FlowControlConstants) {
        /**
         * The number of _unacknowledged_ chars to have been sent before the pty is paused in order for
         * the client to catch up.
         */
        FlowControlConstants[FlowControlConstants["HighWatermarkChars"] = 100000] = "HighWatermarkChars";
        /**
         * After flow control pauses the pty for the client the catch up, this is the number of
         * _unacknowledged_ chars to have been caught up to on the client before resuming the pty again.
         * This is used to attempt to prevent pauses in the flowing data; ideally while the pty is
         * paused the number of unacknowledged chars would always be greater than 0 or the client will
         * appear to stutter. In reality this balance is hard to accomplish though so heavy commands
         * will likely pause as latency grows, not flooding the connection is the important thing as
         * it's shared with other core functionality.
         */
        FlowControlConstants[FlowControlConstants["LowWatermarkChars"] = 5000] = "LowWatermarkChars";
        /**
         * The number characters that are accumulated on the client side before sending an ack event.
         * This must be less than or equal to LowWatermarkChars or the terminal max never unpause.
         */
        FlowControlConstants[FlowControlConstants["CharCountAckSize"] = 5000] = "CharCountAckSize";
    })(FlowControlConstants || (exports.FlowControlConstants = FlowControlConstants = {}));
    var ProfileSource;
    (function (ProfileSource) {
        ProfileSource["GitBash"] = "Git Bash";
        ProfileSource["Pwsh"] = "PowerShell";
    })(ProfileSource || (exports.ProfileSource = ProfileSource = {}));
    var ShellIntegrationStatus;
    (function (ShellIntegrationStatus) {
        /** No shell integration sequences have been encountered. */
        ShellIntegrationStatus[ShellIntegrationStatus["Off"] = 0] = "Off";
        /** Final term shell integration sequences have been encountered. */
        ShellIntegrationStatus[ShellIntegrationStatus["FinalTerm"] = 1] = "FinalTerm";
        /** VS Code shell integration sequences have been encountered. Supercedes FinalTerm. */
        ShellIntegrationStatus[ShellIntegrationStatus["VSCode"] = 2] = "VSCode";
    })(ShellIntegrationStatus || (exports.ShellIntegrationStatus = ShellIntegrationStatus = {}));
    var TerminalExitReason;
    (function (TerminalExitReason) {
        TerminalExitReason[TerminalExitReason["Unknown"] = 0] = "Unknown";
        TerminalExitReason[TerminalExitReason["Shutdown"] = 1] = "Shutdown";
        TerminalExitReason[TerminalExitReason["Process"] = 2] = "Process";
        TerminalExitReason[TerminalExitReason["User"] = 3] = "User";
        TerminalExitReason[TerminalExitReason["Extension"] = 4] = "Extension";
    })(TerminalExitReason || (exports.TerminalExitReason = TerminalExitReason = {}));
    exports.TerminalExtensions = {
        Backend: 'workbench.contributions.terminal.processBackend'
    };
    class TerminalBackendRegistry {
        constructor() {
            this._backends = new Map();
        }
        get backends() { return this._backends; }
        registerTerminalBackend(backend) {
            const key = this._sanitizeRemoteAuthority(backend.remoteAuthority);
            if (this._backends.has(key)) {
                throw new Error(`A terminal backend with remote authority '${key}' was already registered.`);
            }
            this._backends.set(key, backend);
        }
        getTerminalBackend(remoteAuthority) {
            return this._backends.get(this._sanitizeRemoteAuthority(remoteAuthority));
        }
        _sanitizeRemoteAuthority(remoteAuthority) {
            // Normalize the key to lowercase as the authority is case-insensitive
            return remoteAuthority?.toLowerCase() ?? '';
        }
    }
    platform_1.Registry.add(exports.TerminalExtensions.Backend, new TerminalBackendRegistry());
    exports.ILocalPtyService = (0, instantiation_1.createDecorator)('localPtyService');
    exports.ITerminalLogService = (0, instantiation_1.createDecorator)('terminalLogService');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS90ZXJtaW5hbC9jb21tb24vdGVybWluYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZ0JuRixRQUFBLDhCQUE4QixHQUFHLElBQUksMEJBQWEsQ0FBVSxzQkFBc0IsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFFOUcsSUFBa0IscUJBR2pCO0lBSEQsV0FBa0IscUJBQXFCO1FBQ3RDLCtFQUFzRCxDQUFBO1FBQ3RELG1FQUEwQyxDQUFBO0lBQzNDLENBQUMsRUFIaUIscUJBQXFCLHFDQUFyQixxQkFBcUIsUUFHdEM7SUFFRCxJQUFrQixpQkFvR2pCO0lBcEdELFdBQWtCLGlCQUFpQjtRQUNsQywwRkFBcUUsQ0FBQTtRQUNyRSwyRkFBc0UsQ0FBQTtRQUN0RSx5RkFBb0UsQ0FBQTtRQUNwRSwrRkFBMEUsQ0FBQTtRQUMxRSw2RUFBd0QsQ0FBQTtRQUN4RCx1RUFBa0QsQ0FBQTtRQUNsRCx5RUFBb0QsQ0FBQTtRQUNwRCxxRkFBZ0UsQ0FBQTtRQUNoRSxtRkFBOEQsQ0FBQTtRQUM5RCx5RkFBb0UsQ0FBQTtRQUNwRSwwRUFBcUQsQ0FBQTtRQUNyRCwrRUFBMEQsQ0FBQTtRQUMxRCw2RUFBd0QsQ0FBQTtRQUN4RCxxRUFBZ0QsQ0FBQTtRQUNoRCxxRkFBZ0UsQ0FBQTtRQUNoRSxpRkFBNEQsQ0FBQTtRQUM1RCwyRkFBc0UsQ0FBQTtRQUN0RSw2RUFBd0QsQ0FBQTtRQUN4RCx1RUFBa0QsQ0FBQTtRQUNsRCx5RUFBb0QsQ0FBQTtRQUNwRCw0RUFBdUQsQ0FBQTtRQUN2RCx3R0FBbUYsQ0FBQTtRQUNuRixvRkFBK0QsQ0FBQTtRQUMvRCw0RUFBdUQsQ0FBQTtRQUN2RCxvR0FBK0UsQ0FBQTtRQUMvRSxrR0FBNkUsQ0FBQTtRQUM3RSxrRUFBNkMsQ0FBQTtRQUM3Qyw4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