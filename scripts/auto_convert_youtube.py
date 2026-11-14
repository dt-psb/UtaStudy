import sys
import os
import re
import json
import subprocess
import pykakasi

kks = pykakasi.kakasi()

def to_seconds(t_str):
    parts = t_str.strip().split(':')
    if len(parts) == 3:
        h, m, s = parts
        return int(h)*3600 + int(m)*60 + float(s)
    elif len(parts) == 2:
        m, s = parts
        return int(m)*60 + float(s)
    return float(parts[0])

def parse_vtt(content):
    blocks = content.split('\n\n')
    entries = []
    time_re = re.compile(r'(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})')
    for b in blocks:
        lines = [l.strip() for l in b.strip().split('\n') if l.strip()]
        for i, line in enumerate(lines):
            m = time_re.search(line)
            if m:
                start = to_seconds(m.group(1))
                end = to_seconds(m.group(2))
                text = ' '.join(lines[i+1:]).strip()
                # Clean html tags if any
                text = re.sub(r'<[^>]+>', '', text)
                if text and not text.startswith('♪'):
                    entries.append({'start': round(start, 2), 'end': round(end, 2), 'text': text})
    return entries

def add_ruby(text):
    results = kks.convert(text)
    out = []
    for item in results:
        orig = item['orig']
        hira = item['hira']
        has_kanji = any('\u4e00' <= ch <= '\u9faf' for ch in orig)
        if has_kanji:
            prefix_len = 0
            while prefix_len < len(orig) and '\u4e00' <= orig[prefix_len] <= '\u9faf':
                prefix_len += 1
            kanji_part = orig[:prefix_len]
            okuri_part = orig[prefix_len:]
            if okuri_part and hira.endswith(okuri_part):
                ruby_part = hira[:-len(okuri_part)]
                out.append(f"{kanji_part}[{ruby_part}]{okuri_part}")
            else:
                out.append(f"{orig}[{hira}]")
        else:
            out.append(orig)
    return ''.join(out)

def convert_youtube_song(youtube_url, custom_lyrics=None, custom_translation=None):
    # Extract metadata using yt-dlp
    meta_cmd = ['yt-dlp', '--print', '%(title)s\t%(channel)s\t%(id)s', youtube_url]
    res = subprocess.run(meta_cmd, capture_output=True, text=True, encoding='utf-8')
    if res.returncode != 0:
        print(f"Error fetching metadata: {res.stderr}")
        return None
    
    parts = res.stdout.strip().split('\t')
    title = parts[0] if len(parts) > 0 else "Unknown Title"
    artist = parts[1] if len(parts) > 1 else "Unknown Artist"
    video_id = parts[2] if len(parts) > 2 else "video"

    temp_prefix = f"temp_sub_{video_id}"
    
    # Download subtitles (prefer ja, ko)
    dl_cmd = ['yt-dlp', '--skip-download', '--sub-lang', 'ja,ko,en', '--write-sub', '--write-auto-sub', '-o', temp_prefix, youtube_url]
    subprocess.run(dl_cmd, capture_output=True, text=True)

    ja_file = f"{temp_prefix}.ja.vtt"
    ko_file = f"{temp_prefix}.ko.vtt"

    ja_entries = []
    ko_entries = []

    if os.path.exists(ja_file):
        with open(ja_file, 'r', encoding='utf-8') as f:
            ja_entries = parse_vtt(f.read())
        os.remove(ja_file)
    elif os.path.exists(f"{temp_prefix}.en.vtt"):
        # Fallback to english if ja not found
        with open(f"{temp_prefix}.en.vtt", 'r', encoding='utf-8') as f:
            ja_entries = parse_vtt(f.read())
        os.remove(f"{temp_prefix}.en.vtt")

    if os.path.exists(ko_file):
        with open(ko_file, 'r', encoding='utf-8') as f:
            ko_entries = parse_vtt(f.read())
        os.remove(ko_file)

    # Clean other temp files
    for fname in os.listdir('.'):
        if fname.startswith(temp_prefix):
            try: os.remove(fname)
            except: pass

    # If custom lyrics provided
    if custom_lyrics:
        custom_lines = [l.strip() for l in custom_lyrics.strip().split('\n') if l.strip()]
        custom_trans_lines = [l.strip() for l in custom_translation.strip().split('\n') if l.strip()] if custom_translation else []
        
        lyrics_out = []
        for i, entry in enumerate(ja_entries):
            orig_text = custom_lines[i] if i < len(custom_lines) else entry['text']
            trans_text = custom_trans_lines[i] if i < len(custom_trans_lines) else ""
            lyrics_out.append({
                'id': i + 1,
                'start': entry['start'],
                'end': entry['end'],
                'rubyText': add_ruby(orig_text),
                'translation': trans_text
            })
    else:
        # Use downloaded subtitles
        lyrics_out = []
        for i, entry in enumerate(ja_entries):
            trans_text = ko_entries[i]['text'] if i < len(ko_entries) else ""
            lyrics_out.append({
                'id': i + 1,
                'start': entry['start'],
                'end': entry['end'],
                'rubyText': add_ruby(entry['text']),
                'translation': trans_text
            })

    song_id = f"song-{video_id}"
    song_obj = {
        'id': song_id,
        'title': title,
        'artist': artist,
        'youtubeId': video_id,
        'thumbnail': f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",
        'lyrics': lyrics_out,
        'kanjiDictionary': {}
    }

    out_file = f"src/data/songs/{song_id}.json"
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(song_obj, f, ensure_ascii=False, indent=2)

    print(f"Generated song JSON: {out_file} ({len(lyrics_out)} lines)")
    return song_obj

if __name__ == '__main__':
    url = sys.argv[1] if len(sys.argv) > 1 else 'https://youtu.be/kM8HEzBGU-0'
    convert_youtube_song(url)
