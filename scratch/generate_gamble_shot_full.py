# -*- coding: utf-8 -*-
import json
import re

# Comprehensive Kanji Database for Gamble Shot (129 Kanji)
KANJI_DB = {
    "一": {
        "character": "一", "korean": "한 일", "kun": ["ひと", "ひと.つ"], "on": ["イチ", "イツ"],
        "meaning": "하나, 첫째, 오로지", "jlptLevel": "N5",
        "examples": [{"word": "一気", "reading": "いっき", "meaning": "단숨에, 일기"}, {"word": "一番", "reading": "いちばん", "meaning": "가장, 첫째"}]
    },
    "上": {
        "character": "上", "korean": "위 상", "kun": ["うえ", "あ.がる", "のぼ.る"], "on": ["ジョウ", "ショウ"],
        "meaning": "위, 높다, 바치다, 훌륭하다", "jlptLevel": "N5",
        "examples": [{"word": "極上", "reading": "ごくじょう", "meaning": "극상, 최고급"}, {"word": "上手", "reading": "じょうず", "meaning": "능숙함"}]
    },
    "不": {
        "character": "不", "korean": "아니 불 / 아닐 부", "kun": [], "on": ["フ", "ブ"],
        "meaning": "아니다, 못하다, 어긋나다", "jlptLevel": "N4",
        "examples": [{"word": "理不尽", "reading": "りふじん", "meaning": "부당함, 도리에 어긋남"}, {"word": "不安", "reading": "ふあん", "meaning": "불안"}]
    },
    "予": {
        "character": "予", "korean": "미리 예 / 나 여", "kun": ["あらかじ.め"], "on": ["ヨ"],
        "meaning": "미리, 사전에", "jlptLevel": "N4",
        "examples": [{"word": "予測", "reading": "よそく", "meaning": "예측"}, {"word": "予定", "reading": "よてい", "meaning": "예정"}]
    },
    "今": {
        "character": "今", "korean": "이제 금", "kun": ["いま"], "on": ["コン", "キン"],
        "meaning": "지금, 현재", "jlptLevel": "N5",
        "examples": [{"word": "今宵", "reading": "こよい", "meaning": "오늘 밤"}, {"word": "今", "reading": "いま", "meaning": "지금"}]
    },
    "任": {
        "character": "任", "korean": "맡길 임", "kun": ["まか.せる", "まか.す"], "on": ["ニン"],
        "meaning": "맡기다, 책임", "jlptLevel": "N3",
        "examples": [{"word": "任せる", "reading": "まかせる", "meaning": "맡기다"}, {"word": "責任", "reading": "せきにん", "meaning": "책임"}]
    },
    "係": {
        "character": "係", "korean": "맬 계 / 관계할 계", "kun": ["かか.る", "かかり"], "on": ["ケイ"],
        "meaning": "관계하다, 매다, 담당자", "jlptLevel": "N3",
        "examples": [{"word": "関係", "reading": "かんけい", "meaning": "관계"}, {"word": "係員", "reading": "かかりいん", "meaning": "담당자"}]
    },
    "偶": {
        "character": "偶", "korean": "짝 우 / 뜻밖 우", "kun": ["たまに"], "on": ["グウ"],
        "meaning": "짝, 우연, 뜻밖", "jlptLevel": "N2",
        "examples": [{"word": "偶然", "reading": "ぐうぜん", "meaning": "우연"}, {"word": "偶像", "reading": "ぐうぞう", "meaning": "우상"}]
    },
    "僕": {
        "character": "僕", "korean": "나 복 / 종 복", "kun": ["しもべ"], "on": ["ボク"],
        "meaning": "나 (남성 1인칭 대명사), 하인", "jlptLevel": "N4",
        "examples": [{"word": "僕たち", "reading": "ぼくたち", "meaning": "우리들"}, {"word": "公僕", "reading": "こうぼく", "meaning": "공복(공무원)"}]
    },
    "入": {
        "character": "入", "korean": "들 입", "kun": ["い.る", "はい.る"], "on": ["ニュウ"],
        "meaning": "들어가다, 넣다", "jlptLevel": "N5",
        "examples": [{"word": "受け入れる", "reading": "うけいれる", "meaning": "받아들이다"}, {"word": "入口", "reading": "いりぐち", "meaning": "입구"}]
    },
    "全": {
        "character": "全", "korean": "온전할 전", "kun": ["まった.く", "すべ.て"], "on": ["ゼン"],
        "meaning": "모두, 온전하다, 전부", "jlptLevel": "N3",
        "examples": [{"word": "全て", "reading": "すべて", "meaning": "모든 것, 전부"}, {"word": "全部", "reading": "ぜんぶ", "meaning": "전부"}]
    },
    "冗": {
        "character": "冗", "korean": "쓸데없을 용", "kun": [], "on": ["ジョウ"],
        "meaning": "쓸데없다, 번잡하다", "jlptLevel": "N1",
        "examples": [{"word": "冗談", "reading": "じょうだん", "meaning": "농담"}, {"word": "冗長", "reading": "じょうちょう", "meaning": "장황함"}]
    },
    "凡": {
        "character": "凡", "korean": "무릇 범", "kun": ["およ.そ"], "on": ["ボン", "ハン"],
        "meaning": "무릇, 평범하다, 보통", "jlptLevel": "N1",
        "examples": [{"word": "凡才", "reading": "ぼんさい", "meaning": "범재, 평범한 재능"}, {"word": "平凡", "reading": "へいぼん", "meaning": "평범"}]
    },
    "出": {
        "character": "出", "korean": "날 출", "kun": ["で.る", "だ.す"], "on": ["シュツ", "スイ"],
        "meaning": "나가다, 내다, 드러나다", "jlptLevel": "N5",
        "examples": [{"word": "出す", "reading": "だす", "meaning": "내다"}, {"word": "溶け出す", "reading": "とけだす", "meaning": "녹아내리다"}]
    },
    "切": {
        "character": "切", "korean": "끊을 절 / 벨 절", "kun": ["き.る", "き.れる"], "on": ["セツ", "サイ"],
        "meaning": "자르다, 끊다, 간절하다", "jlptLevel": "N4",
        "examples": [{"word": "裏切る", "reading": "うらぎる", "meaning": "배신하다, 거스르다"}, {"word": "大切", "reading": "たいせつ", "meaning": "소중함"}]
    },
    "利": {
        "character": "利", "korean": "이로울 리", "kun": ["き.く"], "on": ["リ"],
        "meaning": "이롭다, 날카롭다, 이익", "jlptLevel": "N3",
        "examples": [{"word": "勝利", "reading": "しょうり", "meaning": "승리"}, {"word": "利用", "reading": "りよう", "meaning": "이용"}]
    },
    "勇": {
        "character": "勇", "korean": "날랠 용", "kun": ["いさ.む"], "on": ["ユウ"],
        "meaning": "용감하다, 날래다", "jlptLevel": "N3",
        "examples": [{"word": "勇気", "reading": "ゆうき", "meaning": "용기"}, {"word": "勇者", "reading": "ゆうしゃ", "meaning": "용사"}]
    },
    "勝": {
        "character": "勝", "korean": "이길 승", "kun": ["か.つ", "まさ.る"], "on": ["ショウ"],
        "meaning": "이기다, 낫다", "jlptLevel": "N3",
        "examples": [{"word": "勝負", "reading": "しょうぶ", "meaning": "승부"}, {"word": "勝利", "reading": "しょうり", "meaning": "승리"}]
    },
    "卑": {
        "character": "卑", "korean": "낮을 비", "kun": ["いや.しい"], "on": ["ヒ"],
        "meaning": "낮다, 천하다, 비열하다", "jlptLevel": "N1",
        "examples": [{"word": "卑怯", "reading": "ひきょう", "meaning": "비겁함"}, {"word": "卑下", "reading": "ひげ", "meaning": "비하"}]
    },
    "去": {
        "character": "去", "korean": "갈 거", "kun": ["さ.る"], "on": ["キョ", "コ"],
        "meaning": "가다, 떠나다, 지나가다", "jlptLevel": "N4",
        "examples": [{"word": "過去", "reading": "かこ", "meaning": "과거"}, {"word": "去る", "reading": "さる", "meaning": "떠나다"}]
    },
    "受": {
        "character": "受", "korean": "받을 수", "kun": ["う.ける", "う.かる"], "on": ["ジュ"],
        "meaning": "받다, 받아들이다", "jlptLevel": "N3",
        "examples": [{"word": "受け入れる", "reading": "うけいれる", "meaning": "받아들이다"}, {"word": "受験", "reading": "じゅけん", "meaning": "수험"}]
    },
    "可": {
        "character": "可", "korean": "옳을 가", "kun": ["-べ.き"], "on": ["カ"],
        "meaning": "옳다, 가하다, 인정하다", "jlptLevel": "N3",
        "examples": [{"word": "可笑しい", "reading": "おかしい", "meaning": "이상하다, 우습다"}, {"word": "可能", "reading": "かのう", "meaning": "가능"}]
    },
    "向": {
        "character": "向", "korean": "향할 향", "kun": ["む.く", "む.かう"], "on": ["コウ"],
        "meaning": "향하다, 나아가다, 너머", "jlptLevel": "N3",
        "examples": [{"word": "向こう", "reading": "むこう", "meaning": "저쪽, 너머"}, {"word": "方向", "reading": "ほうこう", "meaning": "방향"}]
    },
    "味": {
        "character": "味", "korean": "맛 미", "kun": ["あじ", "あじ.わう"], "on": ["ミ"],
        "meaning": "맛, 의미, 묘미", "jlptLevel": "N4",
        "examples": [{"word": "醍醐味", "reading": "だいごみ", "meaning": "참맛, 묘미"}, {"word": "意味", "reading": "いみ", "meaning": "의미"}]
    },
    "命": {
        "character": "命", "korean": "목숨 명", "kun": ["いのち"], "on": ["メイ", "ミョウ"],
        "meaning": "목숨, 명령, 운명", "jlptLevel": "N3",
        "examples": [{"word": "命", "reading": "いのち", "meaning": "목숨, 생명"}, {"word": "運命", "reading": "うんめい", "meaning": "운명"}]
    },
    "品": {
        "character": "品", "korean": "물건 품", "kun": ["しな"], "on": ["ヒン"],
        "meaning": "물건, 품격, 일품", "jlptLevel": "N4",
        "examples": [{"word": "一品", "reading": "いっぴん", "meaning": "일품, 뛰어난 물건"}, {"word": "作品", "reading": "さくひん", "meaning": "작품"}]
    },
    "嘲": {
        "character": "嘲", "korean": "비웃을 조", "kun": ["あざわら.う"], "on": ["チョウ"],
        "meaning": "비웃다, 조롱하다", "jlptLevel": "N1",
        "examples": [{"word": "嘲笑う", "reading": "あざわらう", "meaning": "비웃다"}, {"word": "嘲笑", "reading": "ちょうしょう", "meaning": "조소, 비웃음"}]
    },
    "堪": {
        "character": "堪", "korean": "견딜 감", "kun": ["た.える", "たま.る"], "on": ["カン"],
        "meaning": "견디다, 참다, 견뎌내다", "jlptLevel": "N1",
        "examples": [{"word": "堪らない", "reading": "たまらない", "meaning": "참을 수 없다, 견딜 수 없다"}, {"word": "堪忍", "reading": "かんにん", "meaning": "용서, 참음"}]
    },
    "塗": {
        "character": "塗", "korean": "칠할 도", "kun": ["ぬ.る", "まみ.れる"], "on": ["ト"],
        "meaning": "칠하다, 묻다, 투성이 되다", "jlptLevel": "N1",
        "examples": [{"word": "塗れる", "reading": "まみれる", "meaning": "피/흙투성이가 되다"}, {"word": "塗装", "reading": "とそう", "meaning": "도장, 페인트칠"}]
    },
    "変": {
        "character": "変", "korean": "변할 변", "kun": ["か.わる", "か.える"], "on": ["ヘン"],
        "meaning": "변하다, 이상하다", "jlptLevel": "N4",
        "examples": [{"word": "変える", "reading": "かえる", "meaning": "바꾸다"}, {"word": "大変", "reading": "たいへん", "meaning": "큰일, 매우"}]
    },
    "大": {
        "character": "大", "korean": "큰 대", "kun": ["おお", "おお.きい"], "on": ["ダイ", "タイ"],
        "meaning": "크다, 넓다, 대단하다", "jlptLevel": "N5",
        "examples": [{"word": "大胆", "reading": "だいたん", "meaning": "대담함"}, {"word": "大学", "reading": "だいがく", "meaning": "대학교"}]
    },
    "天": {
        "character": "天", "korean": "하늘 천", "kun": ["あま", "あめ"], "on": ["テン"],
        "meaning": "하늘, 천성, 자연", "jlptLevel": "N5",
        "examples": [{"word": "天才", "reading": "てんさい", "meaning": "천재"}, {"word": "天命", "reading": "てんめい", "meaning": "천명"}]
    },
    "奈": {
        "character": "奈", "korean": "어찌 나", "kun": ["いかん"], "on": ["ナ", "ダイ"],
        "meaning": "어찌, 나락", "jlptLevel": "N1",
        "examples": [{"word": "奈落", "reading": "ならく", "meaning": "나락, 지옥 밑바닥"}, {"word": "奈良", "reading": "なら", "meaning": "나라 (지명)"}]
    },
    "奮": {
        "character": "奮", "korean": "떨칠 분", "kun": ["ふる.う"], "on": ["フン"],
        "meaning": "떨치다, 분발하다, 고무되다", "jlptLevel": "N1",
        "examples": [{"word": "奮い立つ", "reading": "ふるいたつ", "meaning": "용기를 내다, 분발하다"}, {"word": "奮闘", "reading": "ふんとう", "meaning": "분투"}]
    },
    "女": {
        "character": "女", "korean": "계집 녀", "kun": ["おんな", "め"], "on": ["ジョ", "ニョ"],
        "meaning": "여자, 여성, 여신", "jlptLevel": "N5",
        "examples": [{"word": "女神", "reading": "めがみ", "meaning": "여신"}, {"word": "女性", "reading": "じょせい", "meaning": "여성"}]
    },
    "委": {
        "character": "委", "korean": "맡길 위", "kun": ["ゆだ.ねる"], "on": ["イ"],
        "meaning": "맡기다, 위임하다", "jlptLevel": "N2",
        "examples": [{"word": "委ねる", "reading": "ゆだねる", "meaning": "맡기다, 내맡기다"}, {"word": "委員会", "reading": "いいんかい", "meaning": "위원회"}]
    },
    "宵": {
        "character": "宵", "korean": "밤 소", "kun": ["よい"], "on": ["ショウ"],
        "meaning": "초저녁, 밤", "jlptLevel": "N1",
        "examples": [{"word": "今宵", "reading": "こよい", "meaning": "오늘 밤"}, {"word": "宵の口", "reading": "よいのくち", "meaning": "초저녁"}]
    },
    "少": {
        "character": "少", "korean": "적을 소", "kun": ["すく.ない", "すこ.し"], "on": ["ショウ"],
        "meaning": "적다, 어리다, 젊다", "jlptLevel": "N5",
        "examples": [{"word": "少年", "reading": "しょうねん", "meaning": "소년"}, {"word": "少女", "reading": "しょうじょ", "meaning": "소녀"}]
    },
    "尽": {
        "character": "尽", "korean": "다할 진", "kun": ["つ.くす", "つ.きる", "つ.かす"], "on": ["ジン"],
        "meaning": "다하다, 끝나다, 온통", "jlptLevel": "N1",
        "examples": [{"word": "理不尽", "reading": "りふじん", "meaning": "이치에 닿지 않음, 부당함"}, {"word": "尽力", "reading": "じんりょく", "meaning": "진력, 힘을 다함"}]
    },
    "希": {
        "character": "希", "korean": "바랄 희", "kun": ["こいねが.う"], "on": ["キ", "ケ"],
        "meaning": "바라다, 희망, 드물다", "jlptLevel": "N3",
        "examples": [{"word": "希望", "reading": "きぼう", "meaning": "희망"}, {"word": "希少", "reading": "きしょう", "meaning": "희소"}]
    },
    "常": {
        "character": "常", "korean": "항상 상", "kun": ["つね", "とこ"], "on": ["ジョウ"],
        "meaning": "항상, 평소, 보통", "jlptLevel": "N3",
        "examples": [{"word": "常識", "reading": "じょうしき", "meaning": "상식"}, {"word": "日常", "reading": "にちじょう", "meaning": "일상"}]
    },
    "平": {
        "character": "平", "korean": "평평할 평", "kun": ["たい.ら", "ひら"], "on": ["ヘイ", "ビョウ"],
        "meaning": "평평하다, 공평하다, 평민", "jlptLevel": "N4",
        "examples": [{"word": "平民", "reading": "へいみん", "meaning": "평민"}, {"word": "平等", "reading": "びょうどう", "meaning": "평등"}]
    },
    "年": {
        "character": "年", "korean": "해 년", "kun": ["とし"], "on": ["ネン"],
        "meaning": "해, 나이, 소년", "jlptLevel": "N5",
        "examples": [{"word": "少年", "reading": "しょうねん", "meaning": "소년"}, {"word": "今年", "reading": "ことし", "meaning": "올해"}]
    },
    "幻": {
        "character": "幻", "korean": "헛보일 환", "kun": ["まぼろし"], "on": ["ゲン"],
        "meaning": "헛것, 환상, 아련하다", "jlptLevel": "N1",
        "examples": [{"word": "幻想", "reading": "げんそう", "meaning": "환상"}, {"word": "幻覚", "reading": "げんかく", "meaning": "환각"}]
    },
    "底": {
        "character": "底", "korean": "밑 저", "kun": ["そこ"], "on": ["テイ"],
        "meaning": "바닥, 밑바닥", "jlptLevel": "N2",
        "examples": [{"word": "底", "reading": "そこ", "meaning": "바닥, 밑"}, {"word": "海底", "reading": "かいてい", "meaning": "해저"}]
    },
    "引": {
        "character": "引", "korean": "끌 인", "kun": ["ひ.く", "ひ.ける"], "on": ["イン"],
        "meaning": "끌다, 당기다", "jlptLevel": "N4",
        "examples": [{"word": "引き金", "reading": "ひきがね", "meaning": "방아쇠, 도화선"}, {"word": "引用", "reading": "いんよう", "meaning": "인용"}]
    },
    "当": {
        "character": "当", "korean": "마땅할 당", "kun": ["あ.たる", "あ.てる"], "on": ["トウ"],
        "meaning": "마땅하다, 맞추다, 알맞다", "jlptLevel": "N3",
        "examples": [{"word": "適当", "reading": "てきとう", "meaning": "적당함, 대충"}, {"word": "本当", "reading": "ほんとう", "meaning": "진짜, 정말"}]
    },
    "待": {
        "character": "待", "korean": "기다릴 대", "kun": ["ま.つ"], "on": ["タイ"],
        "meaning": "기다리다, 기대하다", "jlptLevel": "N4",
        "examples": [{"word": "期待", "reading": "きたい", "meaning": "기대"}, {"word": "待つ", "reading": "まつ", "meaning": "기다리다"}]
    },
    "必": {
        "character": "必", "korean": "반드시 필", "kun": ["かなら.ず"], "on": ["ヒツ"],
        "meaning": "반드시, 꼭", "jlptLevel": "N3",
        "examples": [{"word": "必然", "reading": "ひつぜん", "meaning": "필연"}, {"word": "必要", "reading": "ひつよう", "meaning": "필요"}]
    },
    "怖": {
        "character": "怖", "korean": "두려울 포", "kun": ["こわ.い"], "on": ["フ", "ホ"],
        "meaning": "두렵다, 무섭다", "jlptLevel": "N3",
        "examples": [{"word": "怖い", "reading": "こわい", "meaning": "무섭다"}, {"word": "恐怖", "reading": "きょうふ", "meaning": "공포"}]
    },
    "怯": {
        "character": "怯", "korean": "겁낼 겁", "kun": ["おびえ.る", "ひる.む"], "on": ["キョウ"],
        "meaning": "겁내다, 비겁하다", "jlptLevel": "N1",
        "examples": [{"word": "卑怯", "reading": "ひきょう", "meaning": "비겁함"}, {"word": "怯える", "reading": "おびえる", "meaning": "겁내다"}]
    },
    "悔": {
        "character": "悔", "korean": "뉘우칠 회", "kun": ["く.いる", "くや.む", "くや.しい"], "on": ["カイ"],
        "meaning": "뉘우치다, 후회하다, 분하다", "jlptLevel": "N2",
        "examples": [{"word": "悔やむ", "reading": "くやむ", "meaning": "후회하다"}, {"word": "後悔", "reading": "こうかい", "meaning": "후회"}]
    },
    "悟": {
        "character": "悟", "korean": "깨달을 오", "kun": ["さと.る"], "on": ["ゴ"],
        "meaning": "깨닫다, 각오하다", "jlptLevel": "N1",
        "examples": [{"word": "覚悟", "reading": "かくご", "meaning": "각오"}, {"word": "悟る", "reading": "さとる", "meaning": "깨닫다"}]
    },
    "想": {
        "character": "想", "korean": "생각 상", "kun": ["おも.う"], "on": ["ソウ", "ソ"],
        "meaning": "생각하다, 상상, 환상", "jlptLevel": "N3",
        "examples": [{"word": "幻想", "reading": "げんそう", "meaning": "환상"}, {"word": "想像", "reading": "そうぞう", "meaning": "상상"}]
    },
    "慎": {
        "character": "慎", "korean": "삼갈 신", "kun": ["つつし.む"], "on": ["シン"],
        "meaning": "삼가다, 신중하다", "jlptLevel": "N1",
        "examples": [{"word": "慎重", "reading": "しんちょう", "meaning": "신중함"}, {"word": "慎む", "reading": "つつしむ", "meaning": "삼가다"}]
    },
    "憶": {
        "character": "憶", "korean": "기억할 억", "kun": [], "on": ["オク"],
        "meaning": "기억하다, 생각하다", "jlptLevel": "N2",
        "examples": [{"word": "記憶", "reading": "きおく", "meaning": "기억"}, {"word": "追憶", "reading": "ついおく", "meaning": "추억"}]
    },
    "所": {
        "character": "所", "korean": "바 소", "kun": ["ところ"], "on": ["ショ"],
        "meaning": "곳, 장소, 때", "jlptLevel": "N4",
        "examples": [{"word": "勝負所", "reading": "しょうぶどころ", "meaning": "승부처"}, {"word": "場所", "reading": "ばしょ", "meaning": "장소"}]
    },
    "手": {
        "character": "手", "korean": "손 수", "kun": ["て", "た"], "on": ["シュ"],
        "meaning": "손, 수단", "jlptLevel": "N5",
        "examples": [{"word": "手", "reading": "て", "meaning": "손"}, {"word": "拍手", "reading": "はくしゅ", "meaning": "박수"}]
    },
    "才": {
        "character": "才", "korean": "재주 재", "kun": [], "on": ["サイ"],
        "meaning": "재주, 재능", "jlptLevel": "N2",
        "examples": [{"word": "天才", "reading": "てんさい", "meaning": "천재"}, {"word": "才能", "reading": "さいのう", "meaning": "재능"}]
    },
    "抜": {
        "character": "抜", "korean": "뽑을 발", "kun": ["ぬ.く", "ぬ.ける"], "on": ["バツ"],
        "meaning": "뽑다, 빼다, 뛰어나다", "jlptLevel": "N2",
        "examples": [{"word": "抜く", "reading": "ぬく", "meaning": "뽑다, 당기다"}, {"word": "抜群", "reading": "ばつぐん", "meaning": "발군, 뛰어남"}]
    },
    "抱": {
        "character": "抱", "korean": "안을 포", "kun": ["だ.く", "いだ.く", "かか.える"], "on": ["ホウ"],
        "meaning": "안다, 품다", "jlptLevel": "N2",
        "examples": [{"word": "抱く", "reading": "いだく", "meaning": "마음에 품다"}, {"word": "抱擁", "reading": "ほうよう", "meaning": "포옹"}]
    },
    "捨": {
        "character": "捨", "korean": "버릴 사", "kun": ["す.てる"], "on": ["シャ"],
        "meaning": "버리다, 포기하다", "jlptLevel": "N3",
        "examples": [{"word": "捨てる", "reading": "すてる", "meaning": "버리다"}, {"word": "四捨五入", "reading": "ししゃごにゅう", "meaning": "사사오입"}]
    },
    "掻": {
        "character": "掻", "korean": "긁을 조", "kun": ["か.く"], "on": ["ソウ"],
        "meaning": "긁다, 헤치다, 발버둥 치다", "jlptLevel": "N1",
        "examples": [{"word": "足掻く", "reading": "あがく", "meaning": "발버둥 치다"}, {"word": "掻き乱す", "reading": "かきみだす", "meaning": "어지럽히다"}]
    },
    "族": {
        "character": "族", "korean": "겨레 족", "kun": [], "on": ["ゾク"],
        "meaning": "무리, 겨레, 친족", "jlptLevel": "N4",
        "examples": [{"word": "王族", "reading": "おうぞく", "meaning": "왕족"}, {"word": "家族", "reading": "かぞく", "meaning": "가족"}]
    },
    "望": {
        "character": "望", "korean": "바랄 망", "kun": ["のぞ.む"], "on": ["ボウ", "モウ"],
        "meaning": "바라다, 희망, 원하다", "jlptLevel": "N3",
        "examples": [{"word": "本望", "reading": "ほんもう", "meaning": "숙원, 바라던 바"}, {"word": "絶望", "reading": "ぜつぼう", "meaning": "절망"}]
    },
    "期": {
        "character": "期", "korean": "기약할 기", "kun": [], "on": ["キ", "ゴ"],
        "meaning": "시기, 기한, 기대", "jlptLevel": "N3",
        "examples": [{"word": "期待", "reading": "きたい", "meaning": "기대"}, {"word": "時期", "reading": "じき", "meaning": "시기"}]
    },
    "本": {
        "character": "本", "korean": "근본 본", "kun": ["もと"], "on": ["ホン"],
        "meaning": "책, 근본, 본래", "jlptLevel": "N5",
        "examples": [{"word": "本望", "reading": "ほんもう", "meaning": "숙원, 오랜 소원"}, {"word": "基本", "reading": "きほん", "meaning": "기본"}]
    },
    "朽": {
        "character": "朽", "korean": "썩을 후", "kun": ["く.ちる"], "on": ["キュウ"],
        "meaning": "썩다, 쇠퇴하다", "jlptLevel": "N1",
        "examples": [{"word": "朽ちる", "reading": "くちる", "meaning": "썩다, 쇠망하다"}, {"word": "不朽", "reading": "ふきゅう", "meaning": "불후(불후의 명작)"}]
    },
    "果": {
        "character": "果", "korean": "열매 과", "kun": ["は.たす", "は.てる"], "on": ["カ"],
        "meaning": "열매, 결과, 끝", "jlptLevel": "N3",
        "examples": [{"word": "果て", "reading": "はて", "meaning": "끝, 막다른 곳"}, {"word": "結果", "reading": "けっか", "meaning": "결과"}]
    },
    "極": {
        "character": "極", "korean": "다할 극", "kun": ["きわ.める", "きわ.まる"], "on": ["キョク", "ゴク"],
        "meaning": "극진하다, 최고, 다하다", "jlptLevel": "N2",
        "examples": [{"word": "極上", "reading": "ごくじょう", "meaning": "극상, 최상급"}, {"word": "極限", "reading": "きょくげん", "meaning": "극한"}]
    },
    "欲": {
        "character": "欲", "korean": "욕심 욕", "kun": ["ほ.しい", "ほっ.する"], "on": ["ヨク"],
        "meaning": "바라다, 욕망", "jlptLevel": "N3",
        "examples": [{"word": "欲望", "reading": "よくぼう", "meaning": "욕망"}, {"word": "意欲", "reading": "いよく", "meaning": "의욕"}]
    },
    "死": {
        "character": "死", "korean": "죽을 사", "kun": ["し.ぬ"], "on": ["シ"],
        "meaning": "죽다, 사망", "jlptLevel": "N4",
        "examples": [{"word": "死ぬ", "reading": "しぬ", "meaning": "죽다"}, {"word": "死者", "reading": "ししゃ", "meaning": "사망자"}]
    },
    "民": {
        "character": "民", "korean": "백성 민", "kun": ["たみ"], "on": ["ミン"],
        "meaning": "백성, 국민, 평민", "jlptLevel": "N4",
        "examples": [{"word": "平民", "reading": "へいみん", "meaning": "평민"}, {"word": "国民", "reading": "こくみん", "meaning": "국민"}]
    },
    "気": {
        "character": "気", "korean": "기운 기", "kun": ["いき"], "on": ["キ", "ケ"],
        "meaning": "기운, 마음, 기분", "jlptLevel": "N5",
        "examples": [{"word": "勇気", "reading": "ゆうき", "meaning": "용기"}, {"word": "一気", "reading": "いっき", "meaning": "단숨에"}]
    },
    "決": {
        "character": "決", "korean": "결단할 결", "kun": ["き.める", "き.まる"], "on": ["ケツ"],
        "meaning": "결정하다, 정하다", "jlptLevel": "N3",
        "examples": [{"word": "決める", "reading": "きめる", "meaning": "정하다, 결판내다"}, {"word": "決して", "reading": "けっして", "meaning": "결코"}]
    },
    "淡": {
        "character": "淡", "korean": "맑을 담", "kun": ["あわ.い"], "on": ["タン"],
        "meaning": "담백하다, 옅다, 희미하다", "jlptLevel": "N1",
        "examples": [{"word": "淡い", "reading": "あわい", "meaning": "옅다, 희미하다"}, {"word": "淡白", "reading": "たんぱく", "meaning": "담백함"}]
    },
    "測": {
        "character": "測", "korean": "헤아릴 측", "kun": ["はか.る"], "on": ["ソク"],
        "meaning": "재다, 측정하다, 예측하다", "jlptLevel": "N2",
        "examples": [{"word": "予測", "reading": "よそく", "meaning": "예측"}, {"word": "測定", "reading": "そくてい", "meaning": "측정"}]
    },
    "溶": {
        "character": "溶", "korean": "녹을 용", "kun": ["と.ける", "と.かす"], "on": ["ヨウ"],
        "meaning": "녹다, 풀리다", "jlptLevel": "N2",
        "examples": [{"word": "溶け出す", "reading": "とけだす", "meaning": "녹아내리다"}, {"word": "溶液", "reading": "ようえき", "meaning": "용액"}]
    },
    "溺": {
        "character": "溺", "korean": "빠질 닉", "kun": ["おぼ.れる"], "on": ["デキ"],
        "meaning": "빠지다, 탐닉하다, 빠져 헤매다", "jlptLevel": "N1",
        "examples": [{"word": "溺れる", "reading": "おぼれる", "meaning": "빠지다, 탐닉하다"}, {"word": "溺愛", "reading": "できあい", "meaning": "익애, 맹목적인 사랑"}]
    },
    "然": {
        "character": "然", "korean": "그럴 연", "kun": ["しか.し"], "on": ["ゼン", "ネン"],
        "meaning": "그러하다, 그렇다", "jlptLevel": "N3",
        "examples": [{"word": "偶然", "reading": "ぐうぜん", "meaning": "우연"}, {"word": "必然", "reading": "ひつぜん", "meaning": "필연"}]
    },
    "爆": {
        "character": "爆", "korean": "터질 폭", "kun": ["は.ぜる"], "on": ["バク"],
        "meaning": "터지다, 폭발하다", "jlptLevel": "N1",
        "examples": [{"word": "爆ぜる", "reading": "はぜる", "meaning": "터지다, 튀다"}, {"word": "爆発", "reading": "ばくはつ", "meaning": "폭발"}]
    },
    "犯": {
        "character": "犯", "korean": "범할 범", "kun": ["おか.す"], "on": ["ハン"],
        "meaning": "범하다, 어기다, 거스르다", "jlptLevel": "N2",
        "examples": [{"word": "犯す", "reading": "おかす", "meaning": "범하다, 거역하다"}, {"word": "犯罪", "reading": "はんざい", "meaning": "범죄"}]
    },
    "狂": {
        "character": "狂", "korean": "미칠 광", "kun": ["くる.う", "くる.おしい"], "on": ["キョウ"],
        "meaning": "미치다, 어긋나다, 열광하다", "jlptLevel": "N1",
        "examples": [{"word": "狂う", "reading": "くるう", "meaning": "미치다, 어긋나다"}, {"word": "熱狂", "reading": "ねっきょう", "meaning": "열광"}]
    },
    "率": {
        "character": "率", "korean": "비율 률 / 거느릴 솔", "kun": ["ひき.いる"], "on": ["リツ", "ソツ"],
        "meaning": "비율, 거느리다", "jlptLevel": "N3",
        "examples": [{"word": "確率", "reading": "かくりつ", "meaning": "확률"}, {"word": "能率", "reading": "のうりつ", "meaning": "능률"}]
    },
    "王": {
        "character": "王", "korean": "임금 왕", "kun": [], "on": ["オウ"],
        "meaning": "임금, 우두머리", "jlptLevel": "N4",
        "examples": [{"word": "王族", "reading": "おうぞく", "meaning": "왕족"}, {"word": "王国", "reading": "おうこく", "meaning": "왕국"}]
    },
    "理": {
        "character": "理", "korean": "다스릴 리", "kun": ["ことわり"], "on": ["リ"],
        "meaning": "이치, 다스리다, 도리", "jlptLevel": "N4",
        "examples": [{"word": "理不尽", "reading": "りふじん", "meaning": "이치에 닿지 않음, 부당함"}, {"word": "理由", "reading": "りゆう", "meaning": "이유"}]
    },
    "界": {
        "character": "界", "korean": "지경 계", "kun": [], "on": ["カイ"],
        "meaning": "경계, 한계, 세계", "jlptLevel": "N3",
        "examples": [{"word": "限界", "reading": "げんかい", "meaning": "한계"}, {"word": "世界", "reading": "せかい", "meaning": "세계"}]
    },
    "痛": {
        "character": "痛", "korean": "아플 통", "kun": ["いた.い", "いた.む"], "on": ["ツウ"],
        "meaning": "아프다, 괴롭다", "jlptLevel": "N3",
        "examples": [{"word": "痛い", "reading": "いたい", "meaning": "아프다, 괴롭다"}, {"word": "苦痛", "reading": "くつう", "meaning": "고통"}]
    },
    "発": {
        "character": "発", "korean": "필 발", "kun": ["た.つ", "あば.く"], "on": ["ハツ", "ホツ"],
        "meaning": "쏘다, 출발하다, 나타나다", "jlptLevel": "N4",
        "examples": [{"word": "一発", "reading": "いっぱつ", "meaning": "한 방, 일발"}, {"word": "出発", "reading": "しゅっぱつ", "meaning": "출발"}]
    },
    "瞬": {
        "character": "瞬", "korean": "깜짝일 순", "kun": ["またた.く"], "on": ["シュン"],
        "meaning": "눈 깜빡이다, 순식간", "jlptLevel": "N1",
        "examples": [{"word": "瞬間", "reading": "しゅんかん", "meaning": "순간"}, {"word": "一瞬", "reading": "いっしゅん", "meaning": "일순간"}]
    },
    "確": {
        "character": "確", "korean": "굳을 확", "kun": ["たし.か"], "on": ["カク"],
        "meaning": "확실하다, 굳다", "jlptLevel": "N3",
        "examples": [{"word": "確率", "reading": "かくりつ", "meaning": "확률"}, {"word": "確か", "reading": "たしか", "meaning": "확실함, 분명"}]
    },
    "神": {
        "character": "神", "korean": "귀신 신", "kun": ["かみ", "かん"], "on": ["シン", "ジン"],
        "meaning": "신령, 신, 정신", "jlptLevel": "N3",
        "examples": [{"word": "女神", "reading": "めがみ", "meaning": "여신"}, {"word": "神経", "reading": "しんけい", "meaning": "신경"}]
    },
    "空": {
        "character": "空", "korean": "빌 공", "kun": ["そら", "あ.く", "から"], "on": ["クウ"],
        "meaning": "하늘, 비다, 헛되다", "jlptLevel": "N5",
        "examples": [{"word": "空", "reading": "から", "meaning": "텅 빔, 껍질"}, {"word": "青空", "reading": "あおぞら", "meaning": "푸른 하늘"}]
    },
    "立": {
        "character": "立", "korean": "설 립", "kun": ["た.つ", "た.てる"], "on": ["リツ", "リュウ"],
        "meaning": "서다, 세우다", "jlptLevel": "N5",
        "examples": [{"word": "奮い立つ", "reading": "ふるいたつ", "meaning": "용기를 내다"}, {"word": "立場", "reading": "たちば", "meaning": "입장"}]
    },
    "笑": {
        "character": "笑", "korean": "웃을 소", "kun": ["わら.う", "え.む"], "on": ["ショウ"],
        "meaning": "웃다, 기뻐하다", "jlptLevel": "N3",
        "examples": [{"word": "笑う", "reading": "わらう", "meaning": "웃다"}, {"word": "笑顔", "reading": "えがお", "meaning": "웃는 얼굴"}]
    },
    "等": {
        "character": "等", "korean": "같을 등", "kun": ["ひと.しい"], "on": ["トウ"],
        "meaning": "같다, 등급, 무리", "jlptLevel": "N3",
        "examples": [{"word": "平等", "reading": "びょうどう", "meaning": "평등"}, {"word": "高等", "reading": "こうとう", "meaning": "고등"}]
    },
    "結": {
        "character": "結", "korean": "맺을 결", "kun": ["むす.ぶ", "ゆ.う"], "on": ["ケツ"],
        "meaning": "맺다, 묶다, 끝나다", "jlptLevel": "N3",
        "examples": [{"word": "結果", "reading": "けっか", "meaning": "결과"}, {"word": "結婚", "reading": "けっこん", "meaning": "결혼"}]
    },
    "絶": {
        "character": "絶", "korean": "끊을 절", "kun": ["た.える", "た.やす"], "on": ["ゼツ"],
        "meaning": "끊다, 끊어지다, 뛰어나다", "jlptLevel": "N2",
        "examples": [{"word": "絶望", "reading": "ぜつぼう", "meaning": "절망"}, {"word": "絶対", "reading": "ぜったい", "meaning": "절대"}]
    },
    "胆": {
        "character": "胆", "korean": "쓸개 담", "kun": ["きも"], "on": ["タン"],
        "meaning": "쓸개, 담력, 배짱", "jlptLevel": "N1",
        "examples": [{"word": "大胆", "reading": "だいたん", "meaning": "대담함"}, {"word": "落胆", "reading": "らくたん", "meaning": "낙담"}]
    },
    "落": {
        "character": "落", "korean": "떨어질 락", "kun": ["お.ちる", "お.とす"], "on": ["ラク"],
        "meaning": "떨어지다, 나락", "jlptLevel": "N3",
        "examples": [{"word": "奈落", "reading": "ならく", "meaning": "나락"}, {"word": "落第", "reading": "らくだい", "meaning": "낙제"}]
    },
    "血": {
        "character": "血", "korean": "피 혈", "kun": ["ち"], "on": ["ケツ"],
        "meaning": "피, 혈통", "jlptLevel": "N3",
        "examples": [{"word": "血", "reading": "ち", "meaning": "피"}, {"word": "出血", "reading": "しゅっけつ", "meaning": "출혈"}]
    },
    "行": {
        "character": "行", "korean": "갈 행", "kun": ["い.く", "ゆ.く", "おこな.う"], "on": ["コウ", "ギョウ"],
        "meaning": "가다, 행하다", "jlptLevel": "N5",
        "examples": [{"word": "行こう", "reading": "いこう", "meaning": "가자"}, {"word": "朽ちて行く", "reading": "くちてゆく", "meaning": "썩어가다"}]
    },
    "裏": {
        "character": "裏", "korean": "속 리", "kun": ["うら"], "on": ["リ"],
        "meaning": "뒤, 안, 속, 거스르다", "jlptLevel": "N3",
        "examples": [{"word": "裏切る", "reading": "うらぎる", "meaning": "배신하다, 거스르다"}, {"word": "裏口", "reading": "うらぐち", "meaning": "뒷문"}]
    },
    "襲": {
        "character": "襲", "korean": "엄습할 습", "kun": ["おそ.う"], "on": ["シュウ"],
        "meaning": "덮치다, 엄습하다", "jlptLevel": "N1",
        "examples": [{"word": "襲いかかる", "reading": "おそいかかる", "meaning": "덮쳐오다, 덤벼들다"}, {"word": "奇襲", "reading": "きしゅう", "meaning": "기습"}]
    },
    "覚": {
        "character": "覚", "korean": "깨달을 각", "kun": ["おぼ.える", "さ.ます"], "on": ["カク"],
        "meaning": "깨닫다, 각오하다, 기억하다", "jlptLevel": "N3",
        "examples": [{"word": "覚悟", "reading": "かくご", "meaning": "각오"}, {"word": "自覚", "reading": "じかく", "meaning": "자각"}]
    },
    "記": {
        "character": "記", "korean": "기록할 기", "kun": ["しる.す"], "on": ["キ"],
        "meaning": "기록하다, 적다, 기억", "jlptLevel": "N4",
        "examples": [{"word": "記憶", "reading": "きおく", "meaning": "기억"}, {"word": "日記", "reading": "にっき", "meaning": "일기"}]
    },
    "訪": {
        "character": "訪", "korean": "찾을 방", "kun": ["おとず.れる", "たず.ねる"], "on": ["ホウ"],
        "meaning": "찾다, 방문하다, 찾아오다", "jlptLevel": "N3",
        "examples": [{"word": "訪れる", "reading": "おとずれる", "meaning": "찾아오다, 도래하다"}, {"word": "訪問", "reading": "ほうもん", "meaning": "방문"}]
    },
    "誰": {
        "character": "誰", "korean": "누구 수", "kun": ["だれ", "たれ"], "on": ["スイ"],
        "meaning": "누구", "jlptLevel": "N4",
        "examples": [{"word": "誰", "reading": "だれ", "meaning": "누구"}, {"word": "誰か", "reading": "だれか", "meaning": "누군가"}]
    },
    "談": {
        "character": "談", "korean": "말씀 담", "kun": [], "on": ["ダン"],
        "meaning": "이야기, 말하다, 농담", "jlptLevel": "N3",
        "examples": [{"word": "冗談", "reading": "じょうだん", "meaning": "농담"}, {"word": "相談", "reading": "そうだん", "meaning": "상담"}]
    },
    "識": {
        "character": "識", "korean": "알 식", "kun": ["し.る"], "on": ["シキ"],
        "meaning": "알다, 식별하다, 상식", "jlptLevel": "N3",
        "examples": [{"word": "常識", "reading": "じょうしき", "meaning": "상식"}, {"word": "知識", "reading": "ちしき", "meaning": "지식"}]
    },
    "負": {
        "character": "負", "korean": "질 부", "kun": ["ま.ける", "お.う"], "on": ["フ"],
        "meaning": "지다, 짊어지다, 부담하다", "jlptLevel": "N3",
        "examples": [{"word": "勝負", "reading": "しょうぶ", "meaning": "승부"}, {"word": "負う", "reading": "おう", "meaning": "짊어지다"}]
    },
    "賭": {
        "character": "賭", "korean": "걸 도", "kun": ["か.ける"], "on": ["ト"],
        "meaning": "걸다, 내기하다, 도박하다", "jlptLevel": "N1",
        "examples": [{"word": "賭ける", "reading": "かける", "meaning": "걸다, 내기하다"}, {"word": "賭博", "reading": "とばく", "meaning": "도박"}]
    },
    "超": {
        "character": "超", "korean": "넘을 초", "kun": ["こ.える", "こ.す"], "on": ["チョウ"],
        "meaning": "넘다, 뛰어넘다, 초과하다", "jlptLevel": "N2",
        "examples": [{"word": "超える", "reading": "こえる", "meaning": "넘다, 넘어서다"}, {"word": "超過", "reading": "ちょうか", "meaning": "초과"}]
    },
    "足": {
        "character": "足", "korean": "발 족", "kun": ["あし", "た.りる"], "on": ["ソク"],
        "meaning": "발, 족하다, 충족하다", "jlptLevel": "N5",
        "examples": [{"word": "足掻く", "reading": "あがく", "meaning": "발버둥 치다"}, {"word": "満足", "reading": "まんぞく", "meaning": "만족"}]
    },
    "身": {
        "character": "身", "korean": "몸 신", "kun": ["み"], "on": ["シン"],
        "meaning": "몸, 자신, 신체", "jlptLevel": "N3",
        "examples": [{"word": "身", "reading": "み", "meaning": "몸, 신체"}, {"word": "自身", "reading": "じしん", "meaning": "자신"}]
    },
    "込": {
        "character": "込", "korean": "담을 입", "kun": ["こ.む", "こ.める"], "on": [],
        "meaning": "들어가다, 넣다, 듬뿍", "jlptLevel": "N3",
        "examples": [{"word": "迷い込む", "reading": "まよいこむ", "meaning": "헤매어 들다"}, {"word": "思い込む", "reading": "おもいこむ", "meaning": "굳게 믿다"}]
    },
    "迷": {
        "character": "迷", "korean": "미혹할 미", "kun": ["まよ.う"], "on": ["メイ"],
        "meaning": "헤매다, 미혹되다", "jlptLevel": "N3",
        "examples": [{"word": "迷う", "reading": "まよう", "meaning": "헤매다"}, {"word": "迷惑", "reading": "めいわく", "meaning": "민폐"}]
    },
    "逃": {
        "character": "逃", "korean": "달아날 도", "kun": ["に.げる", "のが.す"], "on": ["トウ"],
        "meaning": "도망치다, 달아나다", "jlptLevel": "N3",
        "examples": [{"word": "逃げる", "reading": "にげる", "meaning": "도망치다"}, {"word": "逃走", "reading": "とうそう", "meaning": "도주"}]
    },
    "運": {
        "character": "運", "korean": "옮길 운", "kun": ["はこ.ぶ"], "on": ["ウン"],
        "meaning": "운, 운명, 옮기다", "jlptLevel": "N4",
        "examples": [{"word": "運命", "reading": "うんめい", "meaning": "운명"}, {"word": "幸運", "reading": "こううん", "meaning": "행운"}]
    },
    "過": {
        "character": "過", "korean": "지날 과", "kun": ["す.ぎる", "す.ごす"], "on": ["カ"],
        "meaning": "지나다, 지나치다, 허물", "jlptLevel": "N3",
        "examples": [{"word": "過去", "reading": "かこ", "meaning": "과거"}, {"word": "通過", "reading": "つうか", "meaning": "통과"}]
    },
    "達": {
        "character": "達", "korean": "통달할 달", "kun": ["-たち"], "on": ["タツ"],
        "meaning": "통달하다, 도달하다, 무리", "jlptLevel": "N3",
        "examples": [{"word": "少年達", "reading": "しょうねんたち", "meaning": "소년들"}, {"word": "友達", "reading": "ともだち", "meaning": "친구"}]
    },
    "適": {
        "character": "適", "korean": "맞을 적", "kun": ["かな.う"], "on": ["テキ"],
        "meaning": "알맞다, 마땅하다, 적당하다", "jlptLevel": "N3",
        "examples": [{"word": "適当", "reading": "てきとう", "meaning": "적당함, 대충"}, {"word": "適切", "reading": "てきせつ", "meaning": "적절함"}]
    },
    "醍": {
        "character": "醍", "korean": "맑은술 제", "kun": [], "on": ["ダイ", "テイ"],
        "meaning": "맑은 술, 제호", "jlptLevel": "N1",
        "examples": [{"word": "醍醐味", "reading": "だいごみ", "meaning": "참맛, 묘미"}, {"word": "醍醐", "reading": "だいご", "meaning": "제호(최고의 맛)"}]
    },
    "醐": {
        "character": "醐", "korean": "맑은술 호", "kun": [], "on": ["ゴ", "コ"],
        "meaning": "맑은 술, 제호", "jlptLevel": "N1",
        "examples": [{"word": "醍醐味", "reading": "だいごみ", "meaning": "참맛, 묘미"}, {"word": "醍醐", "reading": "だいご", "meaning": "제호"}]
    },
    "重": {
        "character": "重", "korean": "무거울 중", "kun": ["おも.い", "かさ.なる"], "on": ["ジュウ", "チョウ"],
        "meaning": "무겁다, 겹치다, 소중하다", "jlptLevel": "N4",
        "examples": [{"word": "慎重", "reading": "しんちょう", "meaning": "신중함"}, {"word": "重大", "reading": "じゅうだい", "meaning": "중대함"}]
    },
    "金": {
        "character": "金", "korean": "쇠 금 / 돈 금", "kun": ["かね", "かな"], "on": ["キン", "コン"],
        "meaning": "쇠, 돈, 황금", "jlptLevel": "N5",
        "examples": [{"word": "引き金", "reading": "ひきがね", "meaning": "방아쇠"}, {"word": "お金", "reading": "おかね", "meaning": "돈"}]
    },
    "間": {
        "character": "間", "korean": "사이 간", "kun": ["あいだ", "ま"], "on": ["カン", "ケン"],
        "meaning": "사이, 틈, 순간", "jlptLevel": "N5",
        "examples": [{"word": "瞬間", "reading": "しゅんかん", "meaning": "순간"}, {"word": "人間", "reading": "にんげん", "meaning": "인간"}]
    },
    "関": {
        "character": "関", "korean": "빗장 관", "kun": ["せき", "かか.わる"], "on": ["カン"],
        "meaning": "관계하다, 관문", "jlptLevel": "N3",
        "examples": [{"word": "関係", "reading": "かんけい", "meaning": "관계"}, {"word": "関心", "reading": "かんしん", "meaning": "관심"}]
    },
    "限": {
        "character": "限", "korean": "한할 한", "kun": ["かぎ.る"], "on": ["ゲン"],
        "meaning": "한계, 한정하다", "jlptLevel": "N3",
        "examples": [{"word": "限界", "reading": "げんかい", "meaning": "한계"}, {"word": "限り", "reading": "かぎり", "meaning": "한도, 끝"}]
    }
}

# Run coverage check
with open('scratch/build_gamble_shot.py', 'r', encoding='utf-8') as f:
    text = f.read()

scope = {}
exec(text, scope)
raw_lines = scope['raw_lines']
kanji_chars = scope['kanji_chars']

missing = [c for c in kanji_chars if c not in KANJI_DB]
print(f"Missing from KANJI_DB: {len(missing)} ({''.join(missing)})")

# Build full song structure
song_data = {
    "id": "gamble-shot",
    "title": "ギャンブルショット (Gamble Shot)",
    "artist": "佐倉流星 feat. 重音テトSV",
    "youtubeId": "QOVVWkAXtSg",
    "thumbnail": "https://img.youtube.com/vi/QOVVWkAXtSg/hqdefault.jpg",
    "duration": 145,
    "lyrics": [
        {
            "id": i + 1,
            "start": item["start"],
            "end": item["end"],
            "rubyText": item["ruby"],
            "translation": item["ko"]
        }
        for i, item in enumerate(raw_lines)
    ],
    "kanjiDictionary": {
        c: KANJI_DB[c] for c in sorted(list(kanji_chars)) if c in KANJI_DB
    }
}

# Write JSON
with open('src/data/songs/gamble_shot.json', 'w', encoding='utf-8') as f:
    json.dump(song_data, f, ensure_ascii=False, indent=2)

# Write TypeScript
ts_content = f"""import type {{ Song }} from '../../types/song';

export const gambleShotSong: Song = {json.dumps(song_data, ensure_ascii=False, indent=2)};
"""

with open('src/data/songs/gamble_shot.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print(f"Successfully generated gamble_shot.json and gamble_shot.ts with {len(song_data['lyrics'])} lyrics and {len(song_data['kanjiDictionary'])} kanji details!")
