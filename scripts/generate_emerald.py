import re
import json
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

def parse_vtt(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
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
                if text:
                    entries.append({'start': round(start, 2), 'end': round(end, 2), 'text': text})
    return entries

def add_ruby(text):
    results = kks.convert(text)
    out = []
    for item in results:
        orig = item['orig']
        hira = item['hira']
        # Check if orig contains Kanji
        has_kanji = any('\u4e00' <= ch <= '\u9faf' for ch in orig)
        if has_kanji:
            # Try to strip common trailing okurigana
            # e.g. orig="消え", hira="きえ" -> kanji="消", ruby="き", okuri="え"
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

ja_entries = parse_vtt('temp_emerald.ja.vtt')
ko_entries = parse_vtt('temp_emerald.ko.vtt')

lyrics = []
all_kanji = set()

for i in range(len(ja_entries)):
    ja_item = ja_entries[i]
    ko_item = ko_entries[i] if i < len(ko_entries) else {'text': ''}
    ruby_line = add_ruby(ja_item['text'])
    
    # Collect kanji
    for ch in ja_item['text']:
        if '\u4e00' <= ch <= '\u9faf':
            all_kanji.add(ch)
            
    lyrics.append({
        'id': i + 1,
        'start': ja_item['start'],
        'end': ja_item['end'],
        'rubyText': ruby_line,
        'translation': ko_item['text']
    })

# Built-in Kanji knowledge base for the song
kanji_kb = {
    '僕': {
        'character': '僕',
        'korean': '나 복 / 종 복',
        'kun': ['しもべ'],
        'on': ['ボク'],
        'meaning': '나 (남성 1인칭 대명사), 하인',
        'jlptLevel': 'N4',
        'examples': [
            {'word': '僕たち', 'reading': 'ぼくたち', 'meaning': '우리들'},
            {'word': '公僕', 'reading': 'こうぼく', 'meaning': '공복 (공무원)'}
        ]
    },
    '拡': {
        'character': '拡',
        'korean': '넓힐 확',
        'kun': ['ひろ.がる', 'ひろ.げる'],
        'on': ['カク'],
        'meaning': '넓히다, 크게 벌리다',
        'jlptLevel': 'N2',
        'examples': [
            {'word': '拡大', 'reading': 'かくだい', 'meaning': '확대'},
            {'word': '拡声器', 'reading': 'かくせいき', 'meaning': '확성기'}
        ]
    },
    '声': {
        'character': '声',
        'korean': '소리 성',
        'kun': ['こえ', 'こわ'],
        'on': ['セイ', 'ショウ'],
        'meaning': '목소리, 소리, 의견',
        'jlptLevel': 'N4',
        'examples': [
            {'word': '大声', 'reading': 'おおごえ', 'meaning': '큰 목소리'},
            {'word': '声明', 'reading': 'せいめい', 'meaning': '성명, 발표'}
        ]
    },
    '器': {
        'character': '器',
        'korean': '그릇 기',
        'kun': ['うつわ'],
        'on': ['キ'],
        'meaning': '그릇, 도구, 기구, 그릇의 크기(도량)',
        'jlptLevel': 'N3',
        'examples': [
            {'word': '楽器', 'reading': 'がっき', 'meaning': '악기'},
            {'word': '食器', 'reading': 'しょっき', 'meaning': '식기'}
        ]
    },
    '部': {
        'character': '部',
        'korean': '나눌 부 / 거느릴 부',
        'kun': ['-べ'],
        'on': ['ブ'],
        'meaning': '부분, 부서, 방(部屋)',
        'jlptLevel': 'N4',
        'examples': [
            {'word': '部屋', 'reading': 'へや', 'meaning': '방'},
            {'word': '部分', 'reading': 'ぶぶん', 'meaning': '부분'}
        ]
    },
    '屋': {
        'character': '屋',
        'korean': '집 옥',
        'kun': ['や'],
        'on': ['オク'],
        'meaning': '집, 지붕, 가게/가문',
        'jlptLevel': 'N4',
        'examples': [
            {'word': '屋上', 'reading': 'おくじょう', 'meaning': '옥상'},
            {'word': '本屋', 'reading': 'ほんや', 'meaning': '서점, 책방'}
        ]
    },
    '消': {
        'character': '消',
        'korean': '사라질 소',
        'kun': ['き.える', 'け.す'],
        'on': ['ショウ'],
        'meaning': '사라지다, 지우다, 끄다',
        'jlptLevel:': 'N4',
        'examples': [
            {'word': '消滅', 'reading': 'しょうめつ', 'meaning': '소멸'},
            {'word': '消しゴム', 'reading': 'けしごむ', 'meaning': '지우개'}
        ]
    },
    '言': {
        'character': '言',
        'korean': '말씀 언',
        'kun': ['い.う', 'こと'],
        'on': ['ゲン', 'ゴン'],
        'meaning': '말하다, 말씀, 단어',
        'jlptLevel': 'N5',
        'examples': [
            {'word': '言葉', 'reading': 'ことば', 'meaning': '말, 언어'},
            {'word': '方言', 'reading': 'ほうげん', 'meaning': '방언, 사투리'}
        ]
    },
    '葉': {
        'character': '葉',
        'korean': '잎 엽',
        'kun': ['は'],
        'on': ['ヨウ'],
        'meaning': '나뭇잎, 잎사귀',
        'jlptLevel': 'N3',
        'examples': [
            {'word': '葉書', 'reading': 'はがき', 'meaning': '엽서'},
            {'word': '紅葉', 'reading': 'こうよう', 'meaning': '단풍'}
        ]
    },
    '歌': {
        'character': '歌',
        'korean': '노래 가',
        'kun': ['うた', 'うた.う'],
        'on': ['カ'],
        'meaning': '노래, 노래하다',
        'jlptLevel': 'N5',
        'examples': [
            {'word': '歌手', 'reading': 'かしゅ', 'meaning': '가수'},
            {'word': '校歌', 'reading': 'こうか', 'meaning': '교가'}
        ]
    },
    '変': {
        'character': '変',
        'korean': '변할 변',
        'kun': ['か.わる', 'か.える'],
        'on': ['ヘン'],
        'meaning': '바뀌다, 변하다, 이상하다',
        'jlptLevel': 'N4',
        'examples': [
            {'word': '変化', 'reading': 'へんか', 'meaning': '변화'},
            {'word': '大変', 'reading': 'たいへん', 'meaning': '힘듦, 큰일'}
        ]
    },
    '前': {
        'character': '前',
        'korean': '앞 전',
        'kun': ['まえ'],
        'on': ['ゼン'],
        'meaning': '앞, 이전',
        'jlptLevel': 'N5',
        'examples': [
            {'word': '以前', 'reading': 'いぜん', 'meaning': '이전'},
            {'word': '前進', 'reading': 'ぜんしん', 'meaning': '전진'}
        ]
    },
    '爆': {
        'character': '爆',
        'korean': '터질 폭',
        'kun': ['は.ぜる'],
        'on': ['バク'],
        'meaning': '터지다, 폭발하다',
        'jlptLevel': 'N1',
        'examples': [
            {'word': '爆ぜる', 'reading': 'はぜる', 'meaning': '탁 터지다'},
            {'word': '爆発', 'reading': 'ばくはつ', 'meaning': '폭발'}
        ]
    },
    '界': {
        'character': '界',
        'korean': '지경 계',
        'kun': [],
        'on': ['カイ'],
        'meaning': '경계, 세계, 범위',
        'jlptLevel': 'N4',
        'examples': [
            {'word': '世界', 'reading': 'せかい', 'meaning': '세계'},
            {'word': '限界', 'reading': 'げんかい', 'meaning': '한계'}
        ]
    },
    '引': {
        'character': '引',
        'korean': '끌 인',
        'kun': ['ひ.く', 'ひ.ける'],
        'on': ['イン'],
        'meaning': '당기다, 끌다, 이끌다',
        'jlptLevel': 'N4',
        'examples': [
            {'word': '引き出す', 'reading': 'ひきだす', 'meaning': '이끌어내다, 인출하다'},
            {'word': '引用', 'reading': 'いんよう', 'meaning': '인용'}
        ]
    },
    '物': {
        'character': '物',
        'korean': '물건 물',
        'kun': ['もの'],
        'on': ['ブツ', 'モツ'],
        'meaning': '물건, 일, 대상',
        'jlptLevel': 'N5',
        'examples': [
            {'word': '物語', 'reading': 'ものがたり', 'meaning': '이야기'},
            {'word': '動物', 'reading': 'どうぶつ', 'meaning': '동물'}
        ]
    },
    '語': {
        'character': '語',
        'korean': '말씀 어',
        'kun': ['かた.る', 'かた.らう'],
        'on': ['ゴ'],
        'meaning': '이야기하다, 말, 언어',
        'jlptLevel': 'N5',
        'examples': [
            {'word': '日本語', 'reading': 'にほんご', 'meaning': '일본어'},
            {'word': '語彙', 'reading': 'ごい', 'meaning': '어휘'}
        ]
    },
    '始': {
        'character': '始',
        'korean': '비로소 시',
        'kun': ['はじ.める', 'はじ.まる'],
        'on': ['シ'],
        'meaning': '시작하다, 비로소',
        'jlptLevel': 'N4',
        'examples': [
            {'word': '開始', 'reading': 'かいし', 'meaning': '개시'},
            {'word': '終始', 'reading': 'しゅうし', 'meaning': '시종, 처음부터 끝까지'}
        ]
    },
    '胸': {
        'character': '胸',
        'korean': '가슴 흉',
        'kun': ['むね', 'むな'],
        'on': ['キョウ'],
        'meaning': '가슴, 마음속',
        'jlptLevel': 'N2',
        'examples': [
            {'word': '胸騒ぎ', 'reading': 'むなさわぎ', 'meaning': '가슴이 울렁거림, 불안'},
            {'word': '胸囲', 'reading': 'きょうい', 'meaning': '가슴둘레'}
        ]
    },
    '跳': {
        'character': '跳',
        'korean': '뛸 도',
        'kun': ['は.ねる', 'と.ぶ'],
        'on': ['チョウ'],
        'meaning': '뛰어오르다, 튀다',
        'jlptLevel': 'N1',
        'examples': [
            {'word': '跳ねる', 'reading': 'はねる', 'meaning': '뛰어오르다, 튀다'},
            {'word': '跳躍', 'reading': 'ちょうやく', 'meaning': '도약'}
        ]
    },
    '支': {
        'character': '支',
        'korean': '지탱할 지',
        'kun': ['ささ.える'],
        'on': ['シ'],
        'meaning': '지탱하다, 버티다, 지점',
        'jlptLevel': 'N3',
        'examples': [
            {'word': '支持', 'reading': 'しじ', 'meaning': '지지, 응원'},
            {'word': '支配', 'reading': 'しはい', 'meaning': '지배'}
        ]
    },
    '涙': {
        'character': '涙',
        'korean': '눈물 루',
        'kun': ['なみだ'],
        'on': ['ルイ'],
        'meaning': '눈물',
        'jlptLevel': 'N3',
        'examples': [
            {'word': '涙声', 'reading': 'なみだごえ', 'meaning': '울먹이는 목소리'},
            {'word': '感涙', 'reading': 'かんるい', 'meaning': '감루, 감격의 눈물'}
        ]
    },
    '拭': {
        'character': '拭',
        'korean': '닦을 식',
        'kun': ['ふ.く', 'ぬぐ.う'],
        'on': ['ショク', 'シキ'],
        'meaning': '닦다, 훔치다',
        'jlptLevel': 'N1',
        'examples': [
            {'word': '拭い去る', 'reading': 'ぬぐいさる', 'meaning': '말끔히 닦아내다/털어내다'},
            {'word': '払拭', 'reading': 'ふっしょく', 'meaning': '불식 (씻은 듯이 없앰)'}
        ]
    },
    '輪': {
        'character': '輪',
        'korean': '바퀴 륜',
        'kun': ['わ'],
        'on': ['リン'],
        'meaning': '바퀴, 둥근 고리, 둘레',
        'jlptLevel': 'N2',
        'examples': [
            {'word': '輪郭', 'reading': 'りんかく', 'meaning': '윤곽'},
            {'word': '車輪', 'reading': 'しゃりん', 'meaning': '차륜, 바퀴'}
        ]
    },
    '郭': {
        'character': '郭',
        'korean': '외성 곽',
        'kun': [],
        'on': ['カク'],
        'meaning': '성곽, 테두리',
        'jlptLevel': 'N1',
        'examples': [
            {'word': '輪郭', 'reading': 'りんかく', 'meaning': '윤곽, 테두리'},
            {'word': '城郭', 'reading': 'じょうかく', 'meaning': '성곽'}
        ]
    },
    '導': {
        'character': '導',
        'korean': '이끌 도',
        'kun': ['みちび.く'],
        'on': ['ドウ'],
        'meaning': '이끌다, 지도하다, 유도하다',
        'jlptLevel': 'N2',
        'examples': [
            {'word': '指導', 'reading': 'しどう', 'meaning': '지도'},
            {'word': '導入', 'reading': 'どうにゅう', 'meaning': '도입'}
        ]
    },
    '辿': {
        'character': '辿',
        'korean': '더듬을 전',
        'kun': ['たど.る'],
        'on': ['テン'],
        'meaning': '더듬어 찾아가다, 다다르다',
        'jlptLevel': 'N1',
        'examples': [
            {'word': '辿り着く', 'reading': 'たどりつく', 'meaning': '가까스로 다다르다/도착하다'}
        ]
    },
    '着': {
        'character': '着',
        'korean': '붙을 착 / 입을 착',
        'kun': ['き.る', 'つ.く', 'つ.ける'],
        'on': ['チャク', 'ジャク'],
        'meaning': '입다, 닿다, 도착하다',
        'jlptLevel': 'N5',
        'examples': [
            {'word': '到着', 'reading': 'とうちゃく', 'meaning': '도착'},
            {'word': '着物', 'reading': 'きもの', 'meaning': '기모노, 옷'}
        ]
    },
    '未': {
        'character': '未',
        'korean': '아닐 미',
        'kun': ['いま.だ', 'ひつじ'],
        'on': ['ミ'],
        'meaning': '아직 ~하지 못하다, 미래',
        'jlptLevel': 'N3',
        'examples': [
            {'word': '未来', 'reading': 'みらい', 'meaning': '미래'},
            {'word': '未定', 'reading': 'みてい', 'meaning': '미정'}
        ]
    },
    '来': {
        'character': '来',
        'korean': '올 래',
        'kun': ['く.る', 'きた.る'],
        'on': ['ライ'],
        'meaning': '오다, 다가오다, 다음',
        'jlptLevel': 'N5',
        'examples': [
            {'word': '来年', 'reading': 'らいねん', 'meaning': '내년'},
            {'word': '本来', 'reading': 'ほんらい', 'meaning': '본래'}
        ]
    }
}

song_dict = {}
for ch in all_kanji:
    if ch in kanji_kb:
        song_dict[ch] = kanji_kb[ch]

song_data = {
    'id': 'kitani-emerald',
    'title': 'エメラルド (Emerald)',
    'artist': 'キタニタツヤ (Tatsuya Kitani) feat. 初音ミク',
    'youtubeId': 'kM8HEzBGU-0',
    'thumbnail': 'https://img.youtube.com/vi/kM8HEzBGU-0/hqdefault.jpg',
    'lyrics': lyrics,
    'kanjiDictionary': song_dict
}

# Write JSON
with open('src/data/songs/emerald.json', 'w', encoding='utf-8') as f:
    json.dump(song_data, f, ensure_ascii=False, indent=2)

# Write TS
ts_content = f'''import type {{ Song }} from '../../types/song';

export const emeraldSong: Song = {json.dumps(song_data, ensure_ascii=False, indent=2)};
'''

with open('src/data/songs/emerald.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

title = song_data['title']
print(f'Successfully generated song: {title} with {len(lyrics)} lines and {len(song_dict)} kanji definitions!')
