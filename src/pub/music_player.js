/* Floating music player — shared by the homepage and article pages. */
(() => {
  'use strict';

  if (window.__libertyMusicPlayerLoaded) return;
  window.__libertyMusicPlayerLoaded = true;

  const STORAGE_KEY = 'liberty-music-player-v1';

  const selfScript =
    document.currentScript ||
    Array.from(document.scripts).find((node) =>
      /music_player\.js(?:[?#]|$)/.test(node.src || '')
    );
  const playlistScript = document.querySelector(
    'script[src*="music/playlist.js"]'
  );
  const musicBase = selfScript
    ? new URL('music/', selfScript.src).href
    : playlistScript
      ? new URL('./', playlistScript.src).href
      : new URL('src/pub/music/', document.baseURI).href;

  const tracks = (Array.isArray(window.MUSIC_PLAYLIST)
    ? window.MUSIC_PLAYLIST
    : []
  )
    .filter((track) => track && typeof track.src === 'string' && track.src.trim())
    .map((track, index) => {
      let src;
      try {
        src = new URL(track.src, musicBase).href;
      } catch {
        return null;
      }
      return {
        title: String(track.title || `曲目 ${index + 1}`),
        artist: String(track.artist || ''),
        src,
      };
    })
    .filter(Boolean);

  const ICONS = {
    note: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M9 18V5l12-2v13" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="1.9"/><circle cx="18" cy="16" r="3" stroke="currentColor" stroke-width="1.9"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor"/></svg>',
    pause:
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><rect x="7" y="5" width="3.6" height="14" rx="1.2" fill="currentColor"/><rect x="13.4" y="5" width="3.6" height="14" rx="1.2" fill="currentColor"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M18 6v12l-9-6 9-6Z" fill="currentColor"/><path d="M6 5v14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M6 6v12l9-6-9-6Z" fill="currentColor"/><path d="M18 5v14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    volume:
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor"/><path d="M16 8.5a4.5 4.5 0 0 1 0 7M18.5 6a8 8 0 0 1 0 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    mute: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor"/><path d="m16 9 5 5m0-5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M8 6h12M8 12h12M8 18h12" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="M4 6h.01M4 12h.01M4 18h.01" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
    chevronDown:
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };

  const state = {
    index: 0,
    playing: false,
    seeking: false,
    volume: 0.6,
    muted: false,
    panelOpen: false,
    listOpen: false,
    resumeTime: 0,
  };

  let root = null;
  let els = {};
  let pendingSeek = null;
  let currentTimeTrusted = false;
  let lastSaveAt = 0;

  const audio = new Audio();
  audio.preload = 'metadata';

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function readSaved() {
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {};
    } catch {
      return;
    }

    if (
      Number.isInteger(saved.index) &&
      saved.index >= 0 &&
      saved.index < tracks.length
    ) {
      state.index = saved.index;
      if (
        typeof saved.time === 'number' &&
        Number.isFinite(saved.time) &&
        saved.time > 0
      ) {
        state.resumeTime = saved.time;
      }
    }
    if (typeof saved.volume === 'number' && Number.isFinite(saved.volume)) {
      state.volume = clamp(saved.volume, 0, 1);
    }
    if (typeof saved.muted === 'boolean') {
      state.muted = saved.muted;
    }
    if (typeof saved.panelOpen === 'boolean') {
      state.panelOpen = saved.panelOpen;
    }
  }

  function save() {
    try {
      const time =
        currentTimeTrusted && Number.isFinite(audio.currentTime)
          ? audio.currentTime
          : state.resumeTime;
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          index: state.index,
          volume: state.volume,
          muted: state.muted,
          panelOpen: state.panelOpen,
          time: Number.isFinite(time) && time > 0 ? time : 0,
        })
      );
    } catch {
      /* storage may be full or unavailable */
    }
  }

  function buildDOM() {
    root = document.createElement('div');
    root.className = 'mp-root';
    root.id = 'mpRoot';
    root.innerHTML = `
      <section class="mp-panel" id="mpPanel" role="region" aria-label="音乐播放器" aria-hidden="true">
        <header class="mp-head">
          <div>
            <span class="mp-kicker">NOW PLAYING</span>
            <span class="mp-status" id="mpStatus">准备就绪</span>
          </div>
          <button type="button" class="mp-icon-btn" id="mpMinimize" aria-label="收起播放器">${ICONS.chevronDown}</button>
        </header>

        <div class="mp-now">
          <div class="mp-disc" aria-hidden="true">${ICONS.note}</div>
          <div class="mp-meta">
            <div class="mp-title" id="mpTitle">还没有音乐</div>
            <div class="mp-artist" id="mpArtist">在 src/pub/music/playlist.js 中添加曲目</div>
          </div>
        </div>

        <div class="mp-progress">
          <input class="mp-range" id="mpSeek" type="range" min="0" max="1000" step="1" value="0" aria-label="播放进度" />
          <div class="mp-times">
            <span id="mpCurrent">0:00</span>
            <span id="mpDuration">0:00</span>
          </div>
        </div>

        <div class="mp-controls">
          <button type="button" class="mp-icon-btn" id="mpPrev" aria-label="上一首">${ICONS.prev}</button>
          <button type="button" class="mp-play" id="mpPlay" aria-label="播放">${ICONS.play}</button>
          <button type="button" class="mp-icon-btn" id="mpNext" aria-label="下一首">${ICONS.next}</button>
          <div class="mp-volume">
            <button type="button" class="mp-icon-btn" id="mpMute" aria-label="静音" aria-pressed="false">${ICONS.volume}</button>
            <input class="mp-range" id="mpVolume" type="range" min="0" max="100" step="1" value="60" aria-label="音量" />
          </div>
        </div>

        <div class="mp-extra">
          <button type="button" class="mp-list-toggle" id="mpListBtn" aria-expanded="false" aria-controls="mpPlaylistWrap">
            ${ICONS.list}<span>播放列表</span>
          </button>
          <span class="mp-count" id="mpCount"></span>
        </div>

        <div class="mp-playlist-wrap" id="mpPlaylistWrap" hidden>
          <ol class="mp-playlist" id="mpPlaylist"></ol>
        </div>

        <div class="mp-error" id="mpError" role="status" aria-live="polite" hidden></div>
      </section>

      <button type="button" class="mp-fab" id="mpFab" aria-label="打开音乐播放器" aria-expanded="false">
        <span class="mp-fab-note" aria-hidden="true">${ICONS.note}</span>
        <span class="mp-eq" aria-hidden="true"><i></i><i></i><i></i></span>
      </button>
    `;

    document.body.appendChild(root);

    audio.id = 'mpAudio';
    audio.setAttribute('aria-hidden', 'true');
    audio.style.display = 'none';
    document.body.appendChild(audio);

    els = {
      panel: root.querySelector('#mpPanel'),
      fab: root.querySelector('#mpFab'),
      minimize: root.querySelector('#mpMinimize'),
      status: root.querySelector('#mpStatus'),
      title: root.querySelector('#mpTitle'),
      artist: root.querySelector('#mpArtist'),
      disc: root.querySelector('.mp-disc'),
      seek: root.querySelector('#mpSeek'),
      current: root.querySelector('#mpCurrent'),
      duration: root.querySelector('#mpDuration'),
      play: root.querySelector('#mpPlay'),
      prev: root.querySelector('#mpPrev'),
      next: root.querySelector('#mpNext'),
      mute: root.querySelector('#mpMute'),
      volume: root.querySelector('#mpVolume'),
      listBtn: root.querySelector('#mpListBtn'),
      listWrap: root.querySelector('#mpPlaylistWrap'),
      playlist: root.querySelector('#mpPlaylist'),
      count: root.querySelector('#mpCount'),
      error: root.querySelector('#mpError'),
    };
  }

  function formatTime(value) {
    if (!Number.isFinite(value) || value < 0) return '0:00';
    const total = Math.floor(value);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }

  function updateFill(input, percent) {
    input.style.setProperty('--p', `${clamp(percent, 0, 100).toFixed(2)}%`);
  }

  function updateVolumeUI() {
    const percent = Math.round(state.volume * 100);
    els.volume.value = String(percent);
    updateFill(els.volume, percent);
    const muted = audio.muted || state.volume === 0;
    els.mute.innerHTML = muted ? ICONS.mute : ICONS.volume;
    els.mute.setAttribute('aria-label', audio.muted ? '取消静音' : '静音');
    els.mute.setAttribute('aria-pressed', String(audio.muted));
  }

  function updatePlayUI() {
    if (!root) return;
    root.classList.toggle('is-playing', state.playing);
    els.play.innerHTML = state.playing ? ICONS.pause : ICONS.play;
    els.play.setAttribute('aria-label', state.playing ? '暂停' : '播放');

    if (!tracks.length) {
      els.status.textContent = '播放列表为空';
    } else if (state.playing) {
      els.status.textContent = '正在播放';
    } else if (currentTimeTrusted && audio.currentTime > 0) {
      els.status.textContent = '已暂停';
    } else {
      els.status.textContent = '准备就绪';
    }

    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = state.playing
          ? 'playing'
          : 'paused';
      } catch {
        /* not supported */
      }
    }
  }

  function updateDuration() {
    els.duration.textContent = formatTime(audio.duration);
  }

  function updateProgress() {
    if (state.seeking) return;
    const duration = audio.duration;
    if (Number.isFinite(duration) && duration > 0) {
      const ratio = clamp(audio.currentTime / duration, 0, 1);
      els.seek.value = String(Math.round(ratio * 1000));
      updateFill(els.seek, ratio * 100);
      els.current.textContent = formatTime(audio.currentTime);
    } else {
      els.seek.value = '0';
      updateFill(els.seek, 0);
      els.current.textContent = '0:00';
    }
  }

  function updateActiveTrack() {
    const buttons = els.playlist.querySelectorAll('.mp-track');
    buttons.forEach((button, index) => {
      button.classList.toggle('is-active', index === state.index);
    });
    if (state.listOpen) {
      const active = buttons[state.index];
      if (active && typeof active.scrollIntoView === 'function') {
        active.scrollIntoView({ block: 'nearest' });
      }
    }
  }

  function updateMediaSession() {
    if (
      !('mediaSession' in navigator) ||
      typeof window.MediaMetadata === 'undefined' ||
      !tracks.length
    ) {
      return;
    }
    const track = tracks[state.index];
    try {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: track.title,
        artist: track.artist || 'LiBertY',
        album: 'LiBertY',
      });
    } catch {
      /* metadata is optional */
    }
  }

  function renderPlaylist() {
    els.playlist.innerHTML = '';

    if (!tracks.length) {
      const empty = document.createElement('li');
      empty.className = 'mp-empty';
      empty.textContent =
        '播放列表为空。打开 src/pub/music/playlist.js 添加歌曲，再把音频文件放进同一个文件夹。';
      els.playlist.appendChild(empty);
      els.count.textContent = '0 首';
      return;
    }

    els.count.textContent = `${tracks.length} 首`;

    tracks.forEach((track, index) => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'mp-track';
      button.setAttribute('aria-label', `播放 ${track.title}`);

      const number = document.createElement('span');
      number.className = 'mp-track-index';
      number.textContent = String(index + 1).padStart(2, '0');

      const info = document.createElement('span');
      info.className = 'mp-track-info';

      const title = document.createElement('span');
      title.className = 'mp-track-title';
      title.textContent = track.title;

      const artist = document.createElement('span');
      artist.className = 'mp-track-artist';
      artist.textContent = track.artist || '未知作者';

      info.append(title, artist);
      button.append(number, info);
      button.addEventListener('click', () => {
        setTrack(index, { autoplay: true });
      });

      item.appendChild(button);
      els.playlist.appendChild(item);
    });
  }

  function clearError() {
    els.error.hidden = true;
    els.error.textContent = '';
  }

  function showError(message) {
    els.error.textContent = message;
    els.error.hidden = false;
  }

  function setTrack(index, { autoplay = false, seek = null } = {}) {
    if (!tracks.length) return;

    clearError();
    state.index = ((index % tracks.length) + tracks.length) % tracks.length;
    state.playing = false;
    currentTimeTrusted = false;
    state.resumeTime =
      typeof seek === 'number' && Number.isFinite(seek) && seek > 0 ? seek : 0;
    pendingSeek = state.resumeTime > 0 ? state.resumeTime : null;

    const track = tracks[state.index];
    els.title.textContent = track.title;
    els.artist.textContent = track.artist || '未知作者';
    els.current.textContent = '0:00';
    els.duration.textContent = '0:00';
    els.seek.value = '0';
    updateFill(els.seek, 0);

    audio.src = track.src;
    audio.load();

    updateActiveTrack();
    updateMediaSession();
    updatePlayUI();
    save();

    if (autoplay) play();
  }

  async function play() {
    if (!tracks.length) return;
    clearError();
    try {
      await audio.play();
    } catch {
      state.playing = false;
      updatePlayUI();
      showError('浏览器阻止了播放，请再点一次播放按钮。');
    }
  }

  function togglePlay() {
    if (!tracks.length) return;
    if (audio.paused) {
      if (audio.ended) audio.currentTime = 0;
      play();
    } else {
      audio.pause();
    }
  }

  function next(auto = !audio.paused) {
    if (!tracks.length) return;
    if (tracks.length === 1) {
      audio.currentTime = 0;
      currentTimeTrusted = true;
      state.resumeTime = 0;
      save();
      if (auto) play();
      return;
    }
    setTrack(state.index + 1, { autoplay: auto });
  }

  function prev(auto = !audio.paused) {
    if (!tracks.length) return;
    if (audio.currentTime > 3 || tracks.length === 1) {
      audio.currentTime = 0;
      currentTimeTrusted = true;
      state.resumeTime = 0;
      save();
      if (auto) play();
      return;
    }
    setTrack(state.index - 1, { autoplay: auto });
  }

  function toggleMute() {
    audio.muted = !audio.muted;
    state.muted = audio.muted;
    updateVolumeUI();
    save();
  }

  function setPanel(open) {
    state.panelOpen = Boolean(open);
    root.classList.toggle('is-open', state.panelOpen);
    els.panel.setAttribute('aria-hidden', String(!state.panelOpen));
    els.fab.setAttribute('aria-expanded', String(state.panelOpen));
    els.fab.setAttribute(
      'aria-label',
      state.panelOpen ? '收起音乐播放器' : '打开音乐播放器'
    );
    save();
  }

  function toggleList() {
    state.listOpen = !state.listOpen;
    els.listWrap.hidden = !state.listOpen;
    els.listBtn.setAttribute('aria-expanded', String(state.listOpen));
    if (state.listOpen) {
      updateActiveTrack();
    }
  }

  function onSeekInput() {
    state.seeking = true;
    const ratio = Number(els.seek.value) / 1000;
    updateFill(els.seek, ratio * 100);
    if (Number.isFinite(audio.duration)) {
      els.current.textContent = formatTime(ratio * audio.duration);
    }
  }

  function onSeekChange() {
    if (Number.isFinite(audio.duration)) {
      audio.currentTime = (Number(els.seek.value) / 1000) * audio.duration;
    }
    currentTimeTrusted = true;
    state.resumeTime = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    state.seeking = false;
    save();
  }

  function onVolumeInput() {
    const value = clamp(Number(els.volume.value) / 100, 0, 1);
    state.volume = value;
    audio.volume = value;
    if (value > 0 && audio.muted) {
      audio.muted = false;
      state.muted = false;
    }
    updateVolumeUI();
    save();
  }

  function onTimeUpdate() {
    currentTimeTrusted = true;
    state.resumeTime = Number.isFinite(audio.currentTime)
      ? audio.currentTime
      : state.resumeTime;
    updateProgress();
    if (Date.now() - lastSaveAt > 5000) {
      lastSaveAt = Date.now();
      save();
    }
  }

  function onEnded() {
    if (!tracks.length) return;
    if (tracks.length === 1) {
      audio.currentTime = 0;
      currentTimeTrusted = true;
      play();
      return;
    }
    setTrack(state.index + 1, { autoplay: true });
  }

  function onAudioError() {
    if (!audio.src) return;
    if (audio.error && audio.error.code === 1) return;
    state.playing = false;
    updatePlayUI();
    showError('无法播放这个音频，请检查文件路径或浏览器是否支持该格式。');
  }

  function bindAudioEvents() {
    audio.addEventListener('play', () => {
      state.playing = true;
      currentTimeTrusted = true;
      state.resumeTime = Number.isFinite(audio.currentTime)
        ? audio.currentTime
        : state.resumeTime;
      updatePlayUI();
      save();
    });

    audio.addEventListener('pause', () => {
      state.playing = false;
      updatePlayUI();
      save();
    });

    audio.addEventListener('loadedmetadata', () => {
      updateDuration();
      if (
        pendingSeek != null &&
        Number.isFinite(audio.duration) &&
        audio.duration > 0
      ) {
        const max = Math.max(0, audio.duration - 0.25);
        try {
          audio.currentTime = Math.min(pendingSeek, max);
        } catch {
          /* seeking may fail on some streams */
        }
      }
      pendingSeek = null;
      currentTimeTrusted = true;
      state.resumeTime = Number.isFinite(audio.currentTime)
        ? audio.currentTime
        : 0;
      updateProgress();
      save();
    });

    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onAudioError);
  }

  function bindUIEvents() {
    els.fab.addEventListener('click', () => setPanel(!state.panelOpen));
    els.minimize.addEventListener('click', () => {
      setPanel(false);
      els.fab.focus();
    });

    els.play.addEventListener('click', togglePlay);
    els.prev.addEventListener('click', () => prev());
    els.next.addEventListener('click', () => next());
    els.mute.addEventListener('click', toggleMute);

    els.seek.addEventListener('input', onSeekInput);
    els.seek.addEventListener('change', onSeekChange);
    els.volume.addEventListener('input', onVolumeInput);
    els.listBtn.addEventListener('click', toggleList);

    els.panel.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        setPanel(false);
        els.fab.focus();
      }
    });
  }

  function setupMediaSession() {
    if (!('mediaSession' in navigator)) return;
    const handlers = {
      play: () => play(),
      pause: () => audio.pause(),
      previoustrack: () => prev(),
      nexttrack: () => next(),
    };
    Object.entries(handlers).forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {
        /* action may be unsupported */
      }
    });
    try {
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details && Number.isFinite(details.seekTime)) {
          audio.currentTime = details.seekTime;
        }
      });
    } catch {
      /* seekto may be unsupported */
    }
  }

  function markEmptyState() {
    els.title.textContent = '还没有音乐';
    els.artist.textContent = '打开 src/pub/music/playlist.js 添加曲目';
    [els.play, els.prev, els.next, els.seek, els.mute, els.volume].forEach(
      (element) => {
        element.disabled = true;
      }
    );
    updatePlayUI();
  }

  function init() {
    if (document.getElementById('mpRoot')) return;

    readSaved();
    buildDOM();
    bindAudioEvents();
    bindUIEvents();
    renderPlaylist();

    audio.volume = clamp(state.volume, 0, 1);
    audio.muted = state.muted;
    updateVolumeUI();

    if (tracks.length) {
      setTrack(state.index, { seek: state.resumeTime });
    } else {
      markEmptyState();
    }

    setPanel(state.panelOpen);
    setupMediaSession();

    window.addEventListener('pagehide', save);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') save();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
