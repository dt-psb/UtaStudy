export interface ParsedToken {
  id: string;
  type: 'ruby' | 'text';
  text: string;
  ruby?: string;
  kanjiList: string[]; // Contains individual kanji characters found in text
}

// Regex to match Kanji characters in Unicode (CJK Unified Ideographs + repetition mark 々)
const KANJI_REGEX = /[\u4e00-\u9faf\u3400-\u4dbf\u3005]/;

export const isKanji = (char: string): boolean => {
  return KANJI_REGEX.test(char);
};

export const extractKanji = (str: string): string[] => {
  const result: string[] = [];
  for (const ch of str) {
    if (isKanji(ch) && !result.includes(ch)) {
      result.push(ch);
    }
  }
  return result;
};

/**
 * Accurately parses a string formatted like:
 * "きっと今日[きょう]の日[ひ]も、明日[あした]も、明後日[あさって]も"
 *
 * Ensures that leading kana/particles (like "きっと", "の", "も、") are parsed
 * as separate 'text' tokens, and ONLY the immediate kanji compound
 * (e.g. "今日", "日", "明日", "明後日") is attached to the ruby furigana!
 */
export const parseRubyText = (rubyText: string): ParsedToken[] => {
  const tokens: ParsedToken[] = [];
  
  // Regex matches:
  // Group 1: any leading text before the kanji
  // Group 2: the kanji compound immediately preceding the brackets
  // Group 3: the furigana inside [brackets]
  // Group 4: any standalone text without ruby
  // eslint-disable-next-line no-useless-escape
  const regex = /([^\[\]]*?)([\u4e00-\u9faf\u3400-\u4dbf\u3005]+)\[([^\]]+)\]|([^\[\]]+)/g;
  let match;
  let index = 0;

  while ((match = regex.exec(rubyText)) !== null) {
    if (match[2] !== undefined && match[3] !== undefined) {
      const leadingText = match[1];
      const kanjiText = match[2];
      const furigana = match[3];

      // If there's preceding text (kana, particle, punctuation), push as text token
      if (leadingText) {
        tokens.push({
          id: `token-${index++}`,
          type: 'text',
          text: leadingText,
          kanjiList: extractKanji(leadingText)
        });
      }

      // Push pure kanji with its furigana
      tokens.push({
        id: `token-${index++}`,
        type: 'ruby',
        text: kanjiText,
        ruby: furigana,
        kanjiList: extractKanji(kanjiText)
      });
    } else if (match[4] !== undefined) {
      tokens.push({
        id: `token-${index++}`,
        type: 'text',
        text: match[4],
        kanjiList: extractKanji(match[4])
      });
    }
  }

  return tokens;
};
