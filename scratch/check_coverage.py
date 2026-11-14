# -*- coding: utf-8 -*-
import json
import re

# Read emerald.json to borrow existing kanji definitions
with open('src/data/songs/emerald.json', 'r', encoding='utf-8') as f:
    emerald_data = json.load(f)
emerald_kanji = emerald_data.get('kanjiDictionary', {})

with open('scratch/build_gamble_shot.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Execute to get raw_lines and kanji_chars
scope = {}
exec(text, scope)
raw_lines = scope['raw_lines']
kanji_chars = scope['kanji_chars']

existing = {c: emerald_kanji[c] for c in kanji_chars if c in emerald_kanji}
missing = [c for c in kanji_chars if c not in emerald_kanji]

print(f"Existing in emerald: {len(existing)}")
print(f"Missing to define: {len(missing)}")
print("Missing:", "".join(missing))
