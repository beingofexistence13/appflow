/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/network", "vs/platform/accessibility/common/accessibility", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/base/common/event", "vs/nls", "vs/base/common/observable", "vs/platform/telemetry/common/telemetry"], function (require, exports, lifecycle_1, network_1, accessibility_1, configuration_1, instantiation_1, event_1, nls_1, observable_1, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AudioCue = exports.SoundSource = exports.Sound = exports.AudioCueService = exports.IAudioCueService = void 0;
    exports.IAudioCueService = (0, instantiation_1.createDecorator)('audioCue');
    let AudioCueService = class AudioCueService extends lifecycle_1.Disposable {
        constructor(configurationService, accessibilityService, telemetryService) {
            super();
            this.configurationService = configurationService;
            this.accessibilityService = accessibilityService;
            this.telemetryService = telemetryService;
            this.sounds = new Map();
            this.screenReaderAttached = (0, observable_1.observableFromEvent)(this.accessibilityService.onDidChangeScreenReaderOptimized, () => /** @description accessibilityService.onDidChangeScreenReaderOptimized */ this.accessibilityService.isScreenReaderOptimized());
            this.sentTelemetry = new Set();
            this.playingSounds = new Set();
            this.obsoleteAudioCuesEnabled = (0, observable_1.observableFromEvent)(event_1.Event.filter(this.configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration('audioCues.enabled')), () => /** @description config: audioCues.enabled */ this.configurationService.getValue('audioCues.enabled'));
            this.isEnabledCache = new Cache((cue) => {
                const settingObservable = (0, observable_1.observableFromEvent)(event_1.Event.filter(this.configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration(cue.settingsKey)), () => this.configurationService.getValue(cue.settingsKey));
                return (0, observable_1.derived)(reader => {
                    /** @description audio cue enabled */
                    const setting = settingObservable.read(reader);
                    if (setting === 'on' ||
                        (setting === 'auto' && this.screenReaderAttached.read(reader))) {
                        return true;
                    }
                    const obsoleteSetting = this.obsoleteAudioCuesEnabled.read(reader);
                    if (obsoleteSetting === 'on' ||
                        (obsoleteSetting === 'auto' && this.screenReaderAttached.read(reader))) {
                        return true;
                    }
                    return false;
                });
            });
        }
        async playAudioCue(cue, options = {}) {
            if (this.isEnabled(cue)) {
                this.sendAudioCueTelemetry(cue, options.source);
                await this.playSound(cue.sound.getSound(), options.allowManyInParallel);
            }
        }
        async playAudioCues(cues) {
            for (const cue of cues) {
                this.sendAudioCueTelemetry('cue' in cue ? cue.cue : cue, 'source' in cue ? cue.source : undefined);
            }
            // Some audio cues might reuse sounds. Don't play the same sound twice.
            const sounds = new Set(cues.map(c => 'cue' in c ? c.cue : c).filter(cue => this.isEnabled(cue)).map(cue => cue.sound.getSound()));
            await Promise.all(Array.from(sounds).map(sound => this.playSound(sound, true)));
        }
        sendAudioCueTelemetry(cue, source) {
            const isScreenReaderOptimized = this.accessibilityService.isScreenReaderOptimized();
            const key = cue.name + (source ? `::${source}` : '') + (isScreenReaderOptimized ? '{screenReaderOptimized}' : '');
            // Only send once per user session
            if (this.sentTelemetry.has(key) || this.getVolumeInPercent() === 0) {
                return;
            }
            this.sentTelemetry.add(key);
            this.telemetryService.publicLog2('audioCue.played', {
                audioCue: cue.name,
                source: source ?? '',
                isScreenReaderOptimized,
            });
        }
        getVolumeInPercent() {
            const volume = this.configurationService.getValue('audioCues.volume');
            if (typeof volume !== 'number') {
                return 50;
            }
            return Math.max(Math.min(volume, 100), 0);
        }
        async playSound(sound, allowManyInParallel = false) {
            if (!allowManyInParallel && this.playingSounds.has(sound)) {
                return;
            }
            this.playingSounds.add(sound);
            const url = network_1.FileAccess.asBrowserUri(`vs/platform/audioCues/browser/media/${sound.fileName}`).toString(true);
            try {
                const sound = this.sounds.get(url);
                if (sound) {
                    sound.volume = this.getVolumeInPercent() / 100;
                    sound.currentTime = 0;
                    await sound.play();
                }
                else {
                    const playedSound = await playAudio(url, this.getVolumeInPercent() / 100);
                    this.sounds.set(url, playedSound);
                }
            }
            catch (e) {
                console.error('Error while playing sound', e);
            }
            finally {
                this.playingSounds.delete(sound);
            }
        }
        playAudioCueLoop(cue, milliseconds) {
            let playing = true;
            const playSound = () => {
                if (playing) {
                    this.playAudioCue(cue, { allowManyInParallel: true }).finally(() => {
                        setTimeout(() => {
                            if (playing) {
                                playSound();
                            }
                        }, milliseconds);
                    });
                }
            };
            playSound();
            return (0, lifecycle_1.toDisposable)(() => playing = false);
        }
        isEnabled(cue) {
            return this.isEnabledCache.get(cue).get();
        }
        onEnabledChanged(cue) {
            return event_1.Event.fromObservableLight(this.isEnabledCache.get(cue));
        }
    };
    exports.AudioCueService = AudioCueService;
    exports.AudioCueService = AudioCueService = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, accessibility_1.IAccessibilityService),
        __param(2, telemetry_1.ITelemetryService)
    ], AudioCueService);
    /**
     * Play the given audio url.
     * @volume value between 0 and 1
     */
    function playAudio(url, volume) {
        return new Promise((resolve, reject) => {
            const audio = new Audio(url);
            audio.volume = volume;
            audio.addEventListener('ended', () => {
                resolve(audio);
            });
            audio.addEventListener('error', (e) => {
                // When the error event fires, ended might not be called
                reject(e.error);
            });
            audio.play().catch(e => {
                // When play fails, the error event is not fired.
                reject(e);
            });
        });
    }
    class Cache {
        constructor(getValue) {
            this.getValue = getValue;
            this.map = new Map();
        }
        get(arg) {
            if (this.map.has(arg)) {
                return this.map.get(arg);
            }
            const value = this.getValue(arg);
            this.map.set(arg, value);
            return value;
        }
    }
    /**
     * Corresponds to the audio files in ./media.
    */
    class Sound {
        static register(options) {
            const sound = new Sound(options.fileName);
            return sound;
        }
        static { this.error = Sound.register({ fileName: 'error.mp3' }); }
        static { this.warning = Sound.register({ fileName: 'warning.mp3' }); }
        static { this.foldedArea = Sound.register({ fileName: 'foldedAreas.mp3' }); }
        static { this.break = Sound.register({ fileName: 'break.mp3' }); }
        static { this.quickFixes = Sound.register({ fileName: 'quickFixes.mp3' }); }
        static { this.taskCompleted = Sound.register({ fileName: 'taskCompleted.mp3' }); }
        static { this.taskFailed = Sound.register({ fileName: 'taskFailed.mp3' }); }
        static { this.terminalBell = Sound.register({ fileName: 'terminalBell.mp3' }); }
        static { this.diffLineInserted = Sound.register({ fileName: 'diffLineInserted.mp3' }); }
        static { this.diffLineDeleted = Sound.register({ fileName: 'diffLineDeleted.mp3' }); }
        static { this.diffLineModified = Sound.register({ fileName: 'diffLineModified.mp3' }); }
        static { this.chatRequestSent = Sound.register({ fileName: 'chatRequestSent.mp3' }); }
        static { this.chatResponsePending = Sound.register({ fileName: 'chatResponsePending.mp3' }); }
        static { this.chatResponseReceived1 = Sound.register({ fileName: 'chatResponseReceived1.mp3' }); }
        static { this.chatResponseReceived2 = Sound.register({ fileName: 'chatResponseReceived2.mp3' }); }
        static { this.chatResponseReceived3 = Sound.register({ fileName: 'chatResponseReceived3.mp3' }); }
        static { this.chatResponseReceived4 = Sound.register({ fileName: 'chatResponseReceived4.mp3' }); }
        constructor(fileName) {
            this.fileName = fileName;
        }
    }
    exports.Sound = Sound;
    class SoundSource {
        constructor(randomOneOf) {
            this.randomOneOf = randomOneOf;
        }
        getSound(deterministic = false) {
            if (deterministic || this.randomOneOf.length === 1) {
                return this.randomOneOf[0];
            }
            else {
                const index = Math.floor(Math.random() * this.randomOneOf.length);
                return this.randomOneOf[index];
            }
        }
    }
    exports.SoundSource = SoundSource;
    class AudioCue {
        static { this._audioCues = new Set(); }
        static register(options) {
            const soundSource = new SoundSource('randomOneOf' in options.sound ? options.sound.randomOneOf : [options.sound]);
            const audioCue = new AudioCue(soundSource, options.name, options.settingsKey);
            AudioCue._audioCues.add(audioCue);
            return audioCue;
        }
        static get allAudioCues() {
            return [...this._audioCues];
        }
        static { this.error = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.lineHasError.name', 'Error on Line'),
            sound: Sound.error,
            settingsKey: 'audioCues.lineHasError',
        }); }
        static { this.warning = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.lineHasWarning.name', 'Warning on Line'),
            sound: Sound.warning,
            settingsKey: 'audioCues.lineHasWarning',
        }); }
        static { this.foldedArea = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.lineHasFoldedArea.name', 'Folded Area on Line'),
            sound: Sound.foldedArea,
            settingsKey: 'audioCues.lineHasFoldedArea',
        }); }
        static { this.break = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.lineHasBreakpoint.name', 'Breakpoint on Line'),
            sound: Sound.break,
            settingsKey: 'audioCues.lineHasBreakpoint',
        }); }
        static { this.inlineSuggestion = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.lineHasInlineSuggestion.name', 'Inline Suggestion on Line'),
            sound: Sound.quickFixes,
            settingsKey: 'audioCues.lineHasInlineSuggestion',
        }); }
        static { this.terminalQuickFix = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.terminalQuickFix.name', 'Terminal Quick Fix'),
            sound: Sound.quickFixes,
            settingsKey: 'audioCues.terminalQuickFix',
        }); }
        static { this.onDebugBreak = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.onDebugBreak.name', 'Debugger Stopped on Breakpoint'),
            sound: Sound.break,
            settingsKey: 'audioCues.onDebugBreak',
        }); }
        static { this.noInlayHints = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.noInlayHints', 'No Inlay Hints on Line'),
            sound: Sound.error,
            settingsKey: 'audioCues.noInlayHints'
        }); }
        static { this.taskCompleted = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.taskCompleted', 'Task Completed'),
            sound: Sound.taskCompleted,
            settingsKey: 'audioCues.taskCompleted'
        }); }
        static { this.taskFailed = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.taskFailed', 'Task Failed'),
            sound: Sound.taskFailed,
            settingsKey: 'audioCues.taskFailed'
        }); }
        static { this.terminalCommandFailed = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.terminalCommandFailed', 'Terminal Command Failed'),
            sound: Sound.error,
            settingsKey: 'audioCues.terminalCommandFailed'
        }); }
        static { this.terminalBell = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.terminalBell', 'Terminal Bell'),
            sound: Sound.terminalBell,
            settingsKey: 'audioCues.terminalBell'
        }); }
        static { this.notebookCellCompleted = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.notebookCellCompleted', 'Notebook Cell Completed'),
            sound: Sound.taskCompleted,
            settingsKey: 'audioCues.notebookCellCompleted'
        }); }
        static { this.notebookCellFailed = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.notebookCellFailed', 'Notebook Cell Failed'),
            sound: Sound.taskFailed,
            settingsKey: 'audioCues.notebookCellFailed'
        }); }
        static { this.diffLineInserted = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.diffLineInserted', 'Diff Line Inserted'),
            sound: Sound.diffLineInserted,
            settingsKey: 'audioCues.diffLineInserted'
        }); }
        static { this.diffLineDeleted = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.diffLineDeleted', 'Diff Line Deleted'),
            sound: Sound.diffLineDeleted,
            settingsKey: 'audioCues.diffLineDeleted'
        }); }
        static { this.diffLineModified = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.diffLineModified', 'Diff Line Modified'),
            sound: Sound.diffLineModified,
            settingsKey: 'audioCues.diffLineModified'
        }); }
        static { this.chatRequestSent = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.chatRequestSent', 'Chat Request Sent'),
            sound: Sound.chatRequestSent,
            settingsKey: 'audioCues.chatRequestSent'
        }); }
        static { this.chatResponseReceived = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.chatResponseReceived', 'Chat Response Received'),
            settingsKey: 'audioCues.chatResponseReceived',
            sound: {
                randomOneOf: [
                    Sound.chatResponseReceived1,
                    Sound.chatResponseReceived2,
                    Sound.chatResponseReceived3,
                    Sound.chatResponseReceived4
                ]
            }
        }); }
        static { this.chatResponsePending = AudioCue.register({
            name: (0, nls_1.localize)('audioCues.chatResponsePending', 'Chat Response Pending'),
            sound: Sound.chatResponsePending,
            settingsKey: 'audioCues.chatResponsePending'
        }); }
        constructor(sound, name, settingsKey) {
            this.sound = sound;
            this.name = name;
            this.settingsKey = settingsKey;
        }
    }
    exports.AudioCue = AudioCue;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXVkaW9DdWVTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vYXVkaW9DdWVzL2Jyb3dzZXIvYXVkaW9DdWVTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVluRixRQUFBLGdCQUFnQixHQUFHLElBQUEsK0JBQWUsRUFBbUIsVUFBVSxDQUFDLENBQUM7SUFrQnZFLElBQU0sZUFBZSxHQUFyQixNQUFNLGVBQWdCLFNBQVEsc0JBQVU7UUFTOUMsWUFDd0Isb0JBQTRELEVBQzVELG9CQUE0RCxFQUNoRSxnQkFBb0Q7WUFFdkUsS0FBSyxFQUFFLENBQUM7WUFKZ0MseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUMzQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQy9DLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFWdkQsV0FBTSxHQUFrQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ2xELHlCQUFvQixHQUFHLElBQUEsZ0NBQW1CLEVBQzFELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxnQ0FBZ0MsRUFDMUQsR0FBRyxFQUFFLENBQUMseUVBQXlFLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLHVCQUF1QixFQUFFLENBQ25JLENBQUM7WUFDZSxrQkFBYSxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7WUFnRWxDLGtCQUFhLEdBQUcsSUFBSSxHQUFHLEVBQVMsQ0FBQztZQTJDakMsNkJBQXdCLEdBQUcsSUFBQSxnQ0FBbUIsRUFDOUQsYUFBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsd0JBQXdCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUN0RSxDQUFDLENBQUMsb0JBQW9CLENBQUMsbUJBQW1CLENBQUMsQ0FDM0MsRUFDRCxHQUFHLEVBQUUsQ0FBQyw2Q0FBNkMs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