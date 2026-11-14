import json

with open('src/data/songs/emerald.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

for l in d['lyrics']:
    if l['id'] == 17:
        l['rubyText'] = '高[たか]らかに、伸[の]びやかに、詩[し]の束[たば]が響[ひび]いている'
    elif l['id'] == 25:
        l['rubyText'] = 'きっと今日[きょう]の日[ひ]も、明日[あした]も、明後日[あさって]も'
    elif l['id'] == 26:
        l['rubyText'] = '目[め]の前[まえ]の暗闇[くらやみ]は少[すこ]しずつしか照[て]らせない'
    elif l['id'] == 30:
        l['rubyText'] = 'あなたに見[み]送[おく]られて辿[たど]り着[つ]けた未来[みらい]だ'

with open('src/data/songs/emerald.json', 'w', encoding='utf-8') as f:
    json.dump(d, f, ensure_ascii=False, indent=2)

ts_content = "import type { Song } from '../../types/song';\n\nexport const emeraldSong: Song = " + json.dumps(d, ensure_ascii=False, indent=2) + ";\n"

with open('src/data/songs/emerald.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print('Updated lyric line 25:', d['lyrics'][24]['rubyText'])
