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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/network", "vs/platform/accessibility/common/accessibility", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/base/common/event", "vs/nls!vs/platform/audioCues/browser/audioCueService", "vs/base/common/observable", "vs/platform/telemetry/common/telemetry"], function (require, exports, lifecycle_1, network_1, accessibility_1, configuration_1, instantiation_1, event_1, nls_1, observable_1, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$wZ = exports.$vZ = exports.$uZ = exports.$tZ = exports.$sZ = void 0;
    exports.$sZ = (0, instantiation_1.$Bh)('audioCue');
    let $tZ = class $tZ extends lifecycle_1.$kc {
        constructor(g, h, j) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.a = new Map();
            this.b = (0, observable_1.observableFromEvent)(this.h.onDidChangeScreenReaderOptimized, () => /** @description accessibilityService.onDidChangeScreenReaderOptimized */ this.h.isScreenReaderOptimized());
            this.f = new Set();
            this.r = new Set();
            this.s = (0, observable_1.observableFromEvent)(event_1.Event.filter(this.g.onDidChangeConfiguration, (e) => e.affectsConfiguration('audioCues.enabled')), () => /** @description config: audioCues.enabled */ this.g.getValue('audioCues.enabled'));
            this.t = new Cache((cue) => {
                const settingObservable = (0, observable_1.observableFromEvent)(event_1.Event.filter(this.g.onDidChangeConfiguration, (e) => e.affectsConfiguration(cue.settingsKey)), () => this.g.getValue(cue.settingsKey));
                return (0, observable_1.derived)(reader => {
                    /** @description audio cue enabled */
                    const setting = settingObservable.read(reader);
                    if (setting === 'on' ||
                        (setting === 'auto' && this.b.read(reader))) {
                        return true;
                    }
                    const obsoleteSetting = this.s.read(reader);
                    if (obsoleteSetting === 'on' ||
                        (obsoleteSetting === 'auto' && this.b.read(reader))) {
                        return true;
                    }
                    return false;
                });
            });
        }
        async playAudioCue(cue, options = {}) {
            if (this.isEnabled(cue)) {
                this.m(cue, options.source);
                await this.playSound(cue.sound.getSound(), options.allowManyInParallel);
            }
        }
        async playAudioCues(cues) {
            for (const cue of cues) {
                this.m('cue' in cue ? cue.cue : cue, 'source' in cue ? cue.source : undefined);
            }
            // Some audio cues might reuse sounds. Don't play the same sound twice.
            const sounds = new Set(cues.map(c => 'cue' in c ? c.cue : c).filter(cue => this.isEnabled(cue)).map(cue => cue.sound.getSound()));
            await Promise.all(Array.from(sounds).map(sound => this.playSound(sound, true)));
        }
        m(cue, source) {
            const isScreenReaderOptimized = this.h.isScreenReaderOptimized();
            const key = cue.name + (source ? `::${source}` : '') + (isScreenReaderOptimized ? '{screenReaderOptimized}' : '');
            // Only send once per user session
            if (this.f.has(key) || this.n() === 0) {
                return;
            }
            this.f.add(key);
            this.j.publicLog2('audioCue.played', {
                audioCue: cue.name,
                source: source ?? '',
                isScreenReaderOptimized,
            });
        }
        n() {
            const volume = this.g.getValue('audioCues.volume');
            if (typeof volume !== 'number') {
                return 50;
            }
            return Math.max(Math.min(volume, 100), 0);
        }
        async playSound(sound, allowManyInParallel = false) {
            if (!allowManyInParallel && this.r.has(sound)) {
                return;
            }
            this.r.add(sound);
            const url = network_1.$2f.asBrowserUri(`vs/platform/audioCues/browser/media/${sound.fileName}`).toString(true);
            try {
                const sound = this.a.get(url);
                if (sound) {
                    sound.volume = this.n() / 100;
                    sound.currentTime = 0;
                    await sound.play();
                }
                else {
                    const playedSound = await playAudio(url, this.n() / 100);
                    this.a.set(url, playedSound);
                }
            }
            catch (e) {
                console.error('Error while playing sound', e);
            }
            finally {
                this.r.delete(sound);
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
            return (0, lifecycle_1.$ic)(() => playing = false);
        }
        isEnabled(cue) {
            return this.t.get(cue).get();
        }
        onEnabledChanged(cue) {
            return event_1.Event.fromObservableLight(this.t.get(cue));
        }
    };
    exports.$tZ = $tZ;
    exports.$tZ = $tZ = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, accessibility_1.$1r),
        __param(2, telemetry_1.$9k)
    ], $tZ);
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
        constructor(b) {
            this.b = b;
            this.a = new Map();
        }
        get(arg) {
            if (this.a.has(arg)) {
                return this.a.get(arg);
            }
            const value = this.b(arg);
            this.a.set(arg, value);
            return value;
        }
    }
    /**
     * Corresponds to the audio files in ./media.
    */
    class $uZ {
        static a(options) {
            const sound = new $uZ(options.fileName);
            return sound;
        }
        static { this.error = $uZ.a({ fileName: 'error.mp3' }); }
        static { this.warning = $uZ.a({ fileName: 'warning.mp3' }); }
        static { this.foldedArea = $uZ.a({ fileName: 'foldedAreas.mp3' }); }
        static { this.break = $uZ.a({ fileName: 'break.mp3' }); }
        static { this.quickFixes = $uZ.a({ fileName: 'quickFixes.mp3' }); }
        static { this.taskCompleted = $uZ.a({ fileName: 'taskCompleted.mp3' }); }
        static { this.taskFailed = $uZ.a({ fileName: 'taskFailed.mp3' }); }
        static { this.terminalBell = $uZ.a({ fileName: 'terminalBell.mp3' }); }
        static { this.diffLineInserted = $uZ.a({ fileName: 'diffLineInserted.mp3' }); }
        static { this.diffLineDeleted = $uZ.a({ fileName: 'diffLineDeleted.mp3' }); }
        static { this.diffLineModified = $uZ.a({ fileName: 'diffLineModified.mp3' }); }
        static { this.chatRequestSent = $uZ.a({ fileName: 'chatRequestSent.mp3' }); }
        static { this.chatResponsePending = $uZ.a({ fileName: 'chatResponsePending.mp3' }); }
        static { this.chatResponseReceived1 = $uZ.a({ fileName: 'chatResponseReceived1.mp3' }); }
        static { this.chatResponseReceived2 = $uZ.a({ fileName: 'chatResponseReceived2.mp3' }); }
        static { this.chatResponseReceived3 = $uZ.a({ fileName: 'chatResponseReceived3.mp3' }); }
        static { this.chatResponseReceived4 = $uZ.a({ fileName: 'chatResponseReceived4.mp3' }); }
        constructor(fileName) {
            this.fileName = fileName;
        }
    }
    exports.$uZ = $uZ;
    class $vZ {
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
    exports.$vZ = $vZ;
    class $wZ {
        static { this.a = new Set(); }
        static b(options) {
            const soundSource = new $vZ('randomOneOf' in options.sound ? options.sound.randomOneOf : [options.sound]);
            const audioCue = new $wZ(soundSource, options.name, options.settingsKey);
            $wZ.a.add(audioCue);
            return audioCue;
        }
        static get allAudioCues() {
            return [...this.a];
        }
        static { this.error = $wZ.b({
            name: (0, nls_1.localize)(0, null),
            sound: $uZ.error,
            settingsKey: 'audioCues.lineHasError',
        }); }
        static { this.warning = $wZ.b({
            name: (0, nls_1.localize)(1, null),
            sound: $uZ.warning,
            settingsKey: 'audioCues.lineHasWarning',
        }); }
        static { this.foldedArea = $wZ.b({
            name: (0, nls_1.localize)(2, null),
            sound: $uZ.foldedArea,
            settingsKey: 'audioCues.lineHasFoldedArea',
        }); }
        static { this.break = $wZ.b({
            name: (0, nls_1.localize)(3, null),
            sound: $uZ.break,
            settingsKey: 'audioCues.lineHasBreakpoint',
        }); }
        static { this.inlineSuggestion = $wZ.b({
            name: (0, nls_1.localize)(4, null),
            sound: $uZ.quickFixes,
            settingsKey: 'audioCues.lineHasInlineSuggestion',
        }); }
        static { this.terminalQuickFix = $wZ.b({
            name: (0, nls_1.localize)(5, null),
            sound: $uZ.quickFixes,
            settingsKey: 'audioCues.terminalQuickFix',
        }); }
        static { this.onDebugBreak = $wZ.b({
            name: (0, nls_1.localize)(6, null),
            sound: $uZ.break,
            settingsKey: 'audioCues.onDebugBreak',
        }); }
        static { this.noInlayHints = $wZ.b({
            name: (0, nls_1.localize)(7, null),
            sound: $uZ.error,
            settingsKey: 'audioCues.noInlayHints'
        }); }
        static { this.taskCompleted = $wZ.b({
            name: (0, nls_1.localize)(8, null),
            sound: $uZ.taskCompleted,
            settingsKey: 'audioCues.taskCompleted'
        }); }
        static { this.taskFailed = $wZ.b({
            name: (0, nls_1.localize)(9, null),
            sound: $uZ.taskFailed,
            settingsKey: 'audioCues.taskFailed'
        }); }
        static { this.terminalCommandFailed = $wZ.b({
            name: (0, nls_1.localize)(10, null),
            sound: $uZ.error,
            settingsKey: 'audioCues.terminalCommandFailed'
        }); }
        static { this.terminalBell = $wZ.b({
            name: (0, nls_1.localize)(11, null),
            sound: $uZ.terminalBell,
            settingsKey: 'audioCues.terminalBell'
        }); }
        static { this.notebookCellCompleted = $wZ.b({
            name: (0, nls_1.localize)(12, null),
            sound: $uZ.taskCompleted,
            settingsKey: 'audioCues.notebookCellCompleted'
        }); }
        static { this.notebookCellFailed = $wZ.b({
            name: (0, nls_1.localize)(13, null),
            sound: $uZ.taskFailed,
            settingsKey: 'audioCues.notebookCellFailed'
        }); }
        static { this.diffLineInserted = $wZ.b({
            name: (0, nls_1.localize)(14, null),
            sound: $uZ.diffLineInserted,
            settingsKey: 'audioCues.diffLineInserted'
        }); }
        static { this.diffLineDeleted = $wZ.b({
            name: (0, nls_1.localize)(15, null),
            sound: $uZ.diffLineDeleted,
            settingsKey: 'audioCues.diffLineDeleted'
        }); }
        static { this.diffLineModified = $wZ.b({
            name: (0, nls_1.localize)(16, null),
            sound: $uZ.diffLineModified,
            settingsKey: 'audioCues.diffLineModified'
        }); }
        static { this.chatRequestSent = $wZ.b({
            name: (0, nls_1.localize)(17, null),
            sound: $uZ.chatRequestSent,
            settingsKey: 'audioCues.chatRequestSent'
        }); }
        static { this.chatResponseReceived = $wZ.b({
            name: (0, nls_1.localize)(18, null),
            settingsKey: 'audioCues.chatResponseReceived',
            sound: {
                randomOneOf: [
                    $uZ.chatResponseReceived1,
                    $uZ.chatResponseReceived2,
                    $uZ.chatResponseReceived3,
                    $uZ.chatResponseReceived4
                ]
            }
        }); }
        static { this.chatResponsePending = $wZ.b({
            name: (0, nls_1.localize)(19, null),
            sound: $uZ.chatResponsePending,
            settingsKey: 'audioCues.chatResponsePending'
        }); }
        constructor(sound, name, settingsKey) {
            this.sound = sound;
            this.name = name;
            this.settingsKey = settingsKey;
        }
    }
    exports.$wZ = $wZ;
});
//# sourceMappingURL=audioCueService.js.map