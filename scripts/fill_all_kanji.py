import json

new_kanji = {
  '世': {'character': '世', 'korean': '인간 세 / 대 세', 'kun': ['よ'], 'on': ['セイ', 'セ'], 'meaning': '세상, 대대로 이어짐', 'jlptLevel': 'N4', 'examples': [{'word': '世界', 'reading': 'せかい', 'meaning': '세계'}, {'word': '世代', 'reading': 'せだい', 'meaning': '세대'}]},
  '今': {'character': '今', 'korean': '이제 금', 'kun': ['いま'], 'on': ['コン', 'キン'], 'meaning': '지금, 현재, 이번', 'jlptLevel': 'N5', 'examples': [{'word': '今日', 'reading': 'きょう', 'meaning': '오늘'}, {'word': '今週', 'reading': 'こんしゅう', 'meaning': '이번 주'}]},
  '伸': {'character': '伸', 'korean': '펼 신', 'kun': ['の.びる', 'の.ばす'], 'on': ['シン'], 'meaning': '펴다, 늘어나다, 뻗다', 'jlptLevel': 'N2', 'examples': [{'word': '伸びる', 'reading': 'のびる', 'meaning': '자라다, 늘어나다'}, {'word': '追伸', 'reading': 'ついしん', 'meaning': '추신'}]},
  '似': {'character': '似', 'korean': '닮을 사', 'kun': ['に.る'], 'on': ['ジ'], 'meaning': '닮다, 비슷하다', 'jlptLevel': 'N3', 'examples': [{'word': '似る', 'reading': 'にる', 'meaning': '닮다'}, {'word': '類似', 'reading': 'るいじ', 'meaning': '유사'}]},
  '何': {'character': '何', 'korean': '어찌 하', 'kun': ['なに', 'なん'], 'on': ['カ'], 'meaning': '무엇, 무슨, 어찌', 'jlptLevel': 'N5', 'examples': [{'word': '何か', 'reading': 'なにか', 'meaning': '무언가'}, {'word': '何度', 'reading': 'なんど', 'meaning': '몇 번'}]},
  '像': {'character': '像', 'korean': '형상 상', 'kun': [], 'on': ['ゾウ'], 'meaning': '모습, 형상, 상', 'jlptLevel': 'N3', 'examples': [{'word': '映像', 'reading': 'えいぞう', 'meaning': '영상'}, {'word': '想像', 'reading': 'そうぞう', 'meaning': '상상'}]},
  '出': {'character': '出', 'korean': '날 출', 'kun': ['で.る', 'だ.す'], 'on': ['シュツ', 'スイ'], 'meaning': '나다, 나가다, 꺼내다', 'jlptLevel': 'N5', 'examples': [{'word': '出口', 'reading': 'でぐち', 'meaning': '출구'}, {'word': '出発', 'reading': 'しゅっぱつ', 'meaning': '출발'}]},
  '分': {'character': '分', 'korean': '나눌 분', 'kun': ['わ.ける', 'わ.かる'], 'on': ['ブン', 'フン', 'ブ'], 'meaning': '나누다, 알다, 몫', 'jlptLevel': 'N5', 'examples': [{'word': '分かる', 'reading': 'わかる', 'meaning': '알다, 이해하다'}, {'word': '自分', 'reading': 'じぶん', 'meaning': '자신, 나'}]},
  '受': {'character': '受', 'korean': '받을 수', 'kun': ['う.ける', 'う.かる'], 'on': ['ジュ'], 'meaning': '받다, 떠맡다, 합격하다', 'jlptLevel': 'N3', 'examples': [{'word': '受け取る', 'reading': 'うけとる', 'meaning': '받다, 수취하다'}, {'word': '受験', 'reading': 'じゅけん', 'meaning': '수험'}]},
  '向': {'character': '向', 'korean': '향할 향', 'kun': ['む.く', 'む.かう', 'む.ける'], 'on': ['コウ'], 'meaning': '향하다, 마주보다, 쪽', 'jlptLevel': 'N3', 'examples': [{'word': '方向', 'reading': 'ほうこう', 'meaning': '방향'}, {'word': '向こう', 'reading': 'むこう', 'meaning': '건너편, 맞은편'}]},
  '少': {'character': '少', 'korean': '적을 소', 'kun': ['すく.ない', 'すこ.し'], 'on': ['ショウ'], 'meaning': '적다, 조금, 어리다', 'jlptLevel': 'N4', 'examples': [{'word': '少し', 'reading': 'すこし', 'meaning': '조금'}, {'word': '少女', 'reading': 'しょうじょ', 'meaning': '소녀'}]},
  '幼': {'character': '幼', 'korean': '어릴 유', 'kun': ['おさな.이'], 'on': ['ヨウ'], 'meaning': '어리다, 미숙하다', 'jlptLevel': 'N1', 'examples': [{'word': '幼い', 'reading': 'おさない', 'meaning': '어리다'}, {'word': '幼児', 'reading': 'ようじ', 'meaning': '유아'}]},
  '後': {'character': '後', 'korean': '뒤 후', 'kun': ['のち', 'うし.ろ', 'あと'], 'on': ['ゴ', 'コウ'], 'meaning': '뒤, 나중, 뒤쪽', 'jlptLevel': 'N5', 'examples': [{'word': '後ろ', 'reading': 'うしろ', 'meaning': '뒤'}, {'word': '最後', 'reading': 'さいご', 'meaning': '마지막'}]},
  '微': {'character': '微', 'korean': '작을 미', 'kun': ['かす.か'], 'on': ['ビ'], 'meaning': '작다, 은은하다, 아련하다', 'jlptLevel': 'N1', 'examples': [{'word': '微妙', 'reading': 'びみょう', 'meaning': '미묘함'}, {'word': '微笑み', 'reading': 'ほほえみ', 'meaning': '미소'}]},
  '想': {'character': '想', 'korean': '생각 상', 'kun': ['おも.う'], 'on': ['ソウ', 'ソ'], 'meaning': '생각하다, 마음에 품다', 'jlptLevel': 'N3', 'examples': [{'word': '想像', 'reading': 'そうぞう', 'meaning': '상상'}, {'word': '理想', 'reading': 'りそう', 'meaning': '이상'}]},
  '手': {'character': '手', 'korean': '손 수', 'kun': ['て'], 'on': ['シュ'], 'meaning': '손, 방법, 솜씨', 'jlptLevel': 'N5', 'examples': [{'word': '手紙', 'reading': 'てがみ', 'meaning': '편지'}, {'word': '上手', 'reading': 'じょうず', 'meaning': '능숙함'}]},
  '拙': {'character': '拙', 'korean': '졸할 졸', 'kun': ['つたな.い'], 'on': ['セツ'], 'meaning': '서툴다, 어설프다', 'jlptLevel': 'N1', 'examples': [{'word': '拙い', 'reading': 'つたない', 'meaning': '서투르다, 못나다'}, {'word': '拙作', 'reading': 'せっさく', 'meaning': '졸작'}]},
  '描': {'character': '描', 'korean': '그릴 묘', 'kun': ['えが.く', 'か.く'], 'on': ['ビョウ'], 'meaning': '그리다, 묘사하다', 'jlptLevel': 'N2', 'examples': [{'word': '描く', 'reading': 'え가く', 'meaning': '그리다'}, {'word': '描写', 'reading': 'びょうしゃ', 'meaning': '묘사'}]},
  '撫': {'character': '撫', 'korean': '어루만질 무', 'kun': ['な.でる'], 'on': ['ブ'], 'meaning': '어루만지다, 쓰다듬다', 'jlptLevel': 'N1', 'examples': [{'word': '撫でる', 'reading': 'なでる', 'meaning': '쓰다듬다'}]},
  '教': {'character': '教', 'korean': '가르칠 교', 'kun': ['おし.える', 'おそ.わる'], 'on': ['キョウ'], 'meaning': '가르치다, 배우다, 종교', 'jlptLevel': 'N4', 'examples': [{'word': '教える', 'reading': 'おしえる', 'meaning': '가르치다'}, {'word': '教室', 'reading': 'きょうしつ', 'meaning': '교실'}]},
  '散': {'character': '散', 'korean': '흩을 산', 'kun': ['ち.る', 'ち.らかす'], 'on': ['サン'], 'meaning': '흩어지다, 어지르다', 'jlptLevel': 'N2', 'examples': [{'word': '散歩', 'reading': 'さんぽ', 'meaning': '산책'}, {'word': '散る', 'reading': 'ちる', 'meaning': '흩어지다, 지다'}]},
  '数': {'character': '数', 'korean': '셈 수', 'kun': ['かぞ.える', 'かず'], 'on': ['スウ'], 'meaning': '수, 세다, 계산하다', 'jlptLevel': 'N3', 'examples': [{'word': '数える', 'reading': 'かぞえる', 'meaning': '세다'}, {'word': '数字', 'reading': 'すうじ', 'meaning': '숫자'}]},
  '方': {'character': '方', 'korean': '모 방 / 방법 방', 'kun': ['かた'], 'on': ['ホウ'], 'meaning': '방향, 방법, 분(존칭)', 'jlptLevel': 'N4', 'examples': [{'word': '方法', 'reading': 'ほうほう', 'meaning': '방법'}, {'word': '夕方', 'reading': 'ゆうがた', 'meaning': '해질녘'}]},
  '日': {'character': '日', 'korean': '날 일', 'kun': ['ひ', 'か'], 'on': ['ニチ', 'ジツ'], 'meaning': '해, 날, 낮', 'jlptLevel': 'N5', 'examples': [{'word': '毎日', 'reading': 'まいにち', 'meaning': '매일'}, {'word': '日曜日', 'reading': 'にちようび', 'meaning': '일요일'}]},
  '明': {'character': '明', 'korean': '밝을 명', 'kun': ['あか.るい', 'あ.ける'], 'on': ['メイ', 'ミョウ'], 'meaning': '밝다, 환하다, 밝히다', 'jlptLevel': 'N4', 'examples': [{'word': '明日', 'reading': 'あした', 'meaning': '내일'}, {'word': '説明', 'reading': 'せつめい', 'meaning': '설명'}]},
  '映': {'character': '映', 'korean': '비칠 영', 'kun': ['うつ.る', 'うつ.す'], 'on': ['エイ'], 'meaning': '비치다, 비추다', 'jlptLevel': 'N3', 'examples': [{'word': '映画', 'reading': 'えいが', 'meaning': '영화'}, {'word': '映像', 'reading': 'えいぞう', 'meaning': '영상'}]},
  '春': {'character': '春', 'korean': '봄 춘', 'kun': ['はる'], 'on': ['シュン'], 'meaning': '봄, 청춘', 'jlptLevel': 'N4', 'examples': [{'word': '春休み', 'reading': 'はるやすみ', 'meaning': '봄방학'}, {'word': '青春', 'reading': 'せいしゅん', 'meaning': '청춘'}]},
  '暗': {'character': '暗', 'korean': '어두울 암', 'kun': ['くら.い'], 'on': ['アン'], 'meaning': '어둡다, 캄캄하다', 'jlptLevel': 'N4', 'examples': [{'word': '暗い', 'reading': 'くらい', 'meaning': '어둡다'}, {'word': '暗記', 'reading': 'あんき', 'meaning': '암기'}]},
  '束': {'character': '束', 'korean': '묶을 속', 'kun': ['たば'], 'on': ['ソク'], 'meaning': '묶다, 다발', 'jlptLevel': 'N3', 'examples': [{'word': '約束', 'reading': 'やくそく', 'meaning': '약속'}, {'word': '花束', 'reading': 'はなたば', 'meaning': '꽃다발'}]},
  '歩': {'character': '歩', 'korean': '걸을 보', 'kun': ['ある.く', 'あゆ.む'], 'on': ['ホ', 'ブ'], 'meaning': '걷다, 걸음', 'jlptLevel': 'N4', 'examples': [{'word': '歩く', 'reading': 'あるく', 'meaning': '걷다'}, {'word': '進歩', 'reading': 'しんぽ', 'meaning': '진보'}]},
  '気': {'character': '気', 'korean': '기운 기', 'kun': ['いき'], 'on': ['キ', 'ケ'], 'meaning': '기운, 마음, 기분', 'jlptLevel': 'N5', 'examples': [{'word': '気持ち', 'reading': 'きもち', 'meaning': '기분'}, {'word': '天気', 'reading': 'てんき', 'meaning': '날씨'}]},
  '水': {'character': '水', 'korean': '물 수', 'kun': ['みず'], 'on': ['スイ'], 'meaning': '물, 액체', 'jlptLevel': 'N5', 'examples': [{'word': '水曜日', 'reading': 'すいようび', 'meaning': '수요일'}, {'word': '水道', 'reading': 'すいどう', 'meaning': '수도'}]},
  '無': {'character': '無', 'korean': '없을 무', 'kun': ['な.い'], 'on': ['ム', 'ブ'], 'meaning': '없다, 아니하다', 'jlptLevel': 'N3', 'examples': [{'word': '無理', 'reading': 'むり', 'meaning': '무리'}, {'word': '無事', 'reading': 'ぶじ', 'meaning': '무사함'}]},
  '照': {'character': '照', 'korean': '비출 조', 'kun': ['て.る', 'て.らす'], 'on': ['ショウ'], 'meaning': '비추다, 대조하다', 'jlptLevel': 'N2', 'examples': [{'word': '照らす', 'reading': 'てらす', 'meaning': '비추다'}, {'word': '対照', 'reading': 'たいしょう', 'meaning': '대조'}]},
  '目': {'character': '目', 'korean': '눈 목', 'kun': ['め'], 'on': ['モク'], 'meaning': '눈, 안목, 번째', 'jlptLevel': 'N5', 'examples': [{'word': '目的', 'reading': 'もくてき', 'meaning': '목적'}, {'word': '目次', 'reading': 'もくじ', 'meaning': '목차'}]},
  '砕': {'character': '砕', 'korean': '부술 쇄', 'kun': ['くだ.く', 'くだ.ける'], 'on': ['サイ'], 'meaning': '부수다, 깨지다', 'jlptLevel': 'N1', 'examples': [{'word': '砕く', 'reading': 'くだく', 'meaning': '부수다'}, {'word': '粉砕', 'reading': 'ふんさい', 'meaning': '분쇄'}]},
  '粘': {'character': '粘', 'korean': '끈끈할 점', 'kun': ['ねば.る'], 'on': ['ネン'], 'meaning': '끈기 있다, 차진 흙', 'jlptLevel': 'N1', 'examples': [{'word': '粘り強い', 'reading': 'ねばりづよい', 'meaning': '끈질기다'}, {'word': '粘土', 'reading': 'ねんど', 'meaning': '점토'}]},
  '纏': {'character': '纏', 'korean': '얽힐 전', 'kun': ['まと.う', 'まと.まる'], 'on': ['テン'], 'meaning': '몸에 두르다, 걸치다', 'jlptLevel': 'N1', 'examples': [{'word': '身に纏う', 'reading': 'みにまとう', 'meaning': '몸에 두르다'}]},
  '背': {'character': '背', 'korean': '등 배', 'kun': ['せ', 'せい', 'そむ.く'], 'on': ['ハイ'], 'meaning': '등, 키, 등지다', 'jlptLevel': 'N3', 'examples': [{'word': '背景', 'reading': 'はいけい', 'meaning': '배경'}, {'word': '背中', 'reading': 'せなか', 'meaning': '등'}]},
  '自': {'character': '自', 'korean': '스스로 자', 'kun': ['みずか.ら'], 'on': ['ジ', 'シ'], 'meaning': '스스로, 자기', 'jlptLevel': 'N4', 'examples': [{'word': '自分', 'reading': 'じぶん', 'meaning': '자신'}, {'word': '自由', 'reading': 'じゆう', 'meaning': '자유'}]},
  '見': {'character': '見', 'korean': '볼 견', 'kun': ['み.る', 'み.える', 'み.せる'], 'on': ['ケン'], 'meaning': '보다, 보이다, 의견', 'jlptLevel': 'N5', 'examples': [{'word': '見る', 'reading': 'みる', 'meaning': '보다'}, {'word': '意見', 'reading': 'いけん', 'meaning': '의견'}]},
  '詩': {'character': '詩', 'korean': '시 시', 'kun': ['うた'], 'on': ['シ'], 'meaning': '시, 노래', 'jlptLevel': 'N1', 'examples': [{'word': '詩人', 'reading': 'しじん', 'meaning': '시인'}, {'word': '詩集', 'reading': 'ししゅう', 'meaning': '시집'}]},
  '誰': {'character': '誰', 'korean': '누구 수', 'kun': ['だれ'], 'on': ['スイ'], 'meaning': '누구, 어떤 사람', 'jlptLevel': 'N3', 'examples': [{'word': '誰か', 'reading': 'だれか', 'meaning': '누군가'}, {'word': '誰でも', 'reading': 'だれでも', 'meaning': '누구라도'}]},
  '送': {'character': '送', 'korean': '보낼 송', 'kun': ['おく.る'], 'on': ['ソウ'], 'meaning': '보내다, 배웅하다', 'jlptLevel': 'N4', 'examples': [{'word': '送る', 'reading': 'おくる', 'meaning': '보내다'}, {'word': '送信', 'reading': 'そうしん', 'meaning': '송신'}]},
  '重': {'character': '重', 'korean': '무거울 중 / 거듭 중', 'kun': ['おも.い', 'かさ.ねる'], 'on': ['ジュウ', 'チョウ'], 'meaning': '무겁다, 겹치다, 중요하다', 'jlptLevel': 'N4', 'examples': [{'word': '重要', 'reading': 'じゅうよう', 'meaning': '중요'}, {'word': '重ねる', 'reading': 'かさねる', 'meaning': '겹치다, 포개다'}]},
  '鏡': {'character': '鏡', 'korean': '거울 경', 'kun': ['かがみ'], 'on': ['キョウ'], 'meaning': '거울, 비추어 보다', 'jlptLevel': 'N3', 'examples': [{'word': '鏡', 'reading': 'かがみ', 'meaning': '거울'}, {'word': '眼鏡', 'reading': 'めがね', 'meaning': '안경'}]},
  '闇': {'character': '闇', 'korean': '어두울 암', 'kun': ['やみ'], 'on': ['アン'], 'meaning': '어둠, 캄캄함', 'jlptLevel': 'N1', 'examples': [{'word': '暗闇', 'reading': 'くらやみ', 'meaning': '어둠'}, {'word': '闇夜', 'reading': 'やみよ', 'meaning': '칠흑 같은 밤'}]},
  '響': {'character': '響', 'korean': '울릴 향', 'kun': ['ひび.く'], 'on': ['キョウ'], 'meaning': '울리다, 영향을 주다', 'jlptLevel': 'N2', 'examples': [{'word': '影響', 'reading': 'えいきょう', 'meaning': '영향'}, {'word': '反響', 'reading': 'はんきょう', 'meaning': '반향'}]},
  '頬': {'character': '頬', 'korean': '뺨 뺨', 'kun': ['ほお', 'ほほ'], 'on': ['キョウ'], 'meaning': '뺨, 볼', 'jlptLevel': 'N1', 'examples': [{'word': '頬', 'reading': 'ほほ', 'meaning': '뺨'}, {'word': '頬笑み', 'reading': 'ほほえみ', 'meaning': '미소'}]},
  '風': {'character': '風', 'korean': '바람 풍', 'kun': ['かぜ'], 'on': ['フウ', 'フ'], 'meaning': '바람, 스타일, 풍습', 'jlptLevel': 'N4', 'examples': [{'word': '風', 'reading': 'かぜ', 'meaning': '바람'}, {'word': '台風', 'reading': 'たいふう', 'meaning': '태풍'}]},
  '高': {'character': '高', 'korean': '높을 고', 'kun': ['たか.い'], 'on': ['コウ'], 'meaning': '높다, 비싸다, 뛰어나다', 'jlptLevel': 'N5', 'examples': [{'word': '高い', 'reading': 'たかい', 'meaning': '높다, 비싸다'}, {'word': '最高', 'reading': 'さいこう', 'meaning': '최고'}]}
}

with open('src/data/songs/emerald.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

d['kanjiDictionary'].update(new_kanji)

with open('src/data/songs/emerald.json', 'w', encoding='utf-8') as f:
    json.dump(d, f, ensure_ascii=False, indent=2)

ts_content = "import type { Song } from '../../types/song';\n\nexport const emeraldSong: Song = " + json.dumps(d, ensure_ascii=False, indent=2) + ";\n"

with open('src/data/songs/emerald.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

total = len(d['kanjiDictionary'])
print("Total kanji in dictionary:", total)
