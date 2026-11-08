/*
 * 音乐播放列表
 *
 * src 相对于本目录（src/pub/music/）解析，可以直接写文件名。
 * 支持浏览器能播放的格式，推荐 mp3 / ogg / m4a / wav。
 *
 * 示例：
 *   { title: "歌名", artist: "作者", src: "song.mp3" },
 *   { title: "另一首", artist: "作者", src: "tracks/another.ogg" },
 *
 * 如果使用外链，也可以写完整 URL。
 */
window.MUSIC_PLAYLIST = [
  {
    title: 'Emerald Breeze',
    artist: 'Demo · 可替换',
    src: 'emerald-breeze.wav',
  },
];
