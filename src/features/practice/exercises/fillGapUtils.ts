// Finds the longest trailing portion of the idiom that appears verbatim (contiguous,
// case-insensitive) inside its example sentence, and returns a gapped version of the
// sentence plus the exact answer text that was removed. This tolerates the common case
// where only the leading verb is inflected in the example ("go" -> "went"/"goes").
export interface GapResult {
  gappedSentence: string;
  answer: string;
}

function clean(token: string): string {
  return token.toLowerCase().replace(/[^a-z0-9']/g, '');
}

export function buildFillGap(idiom: string, sentence: string): GapResult {
  const idiomWords = idiom.split(/\s+/);
  const sentenceTokens = sentence.split(/\s+/);
  const sentenceClean = sentenceTokens.map(clean);

  for (let start = 0; start < idiomWords.length; start++) {
    const phraseWords = idiomWords.slice(start).map(clean).filter(Boolean);
    if (phraseWords.length === 0) continue;
    const matchIndex = findContiguous(sentenceClean, phraseWords);
    if (matchIndex !== -1) {
      const spanTokens = sentenceTokens.slice(matchIndex, matchIndex + phraseWords.length);
      const answer = spanTokens.join(' ').replace(/[.,!?;:]+$/, '');
      const trailingPunct = spanTokens[spanTokens.length - 1].match(/[.,!?;:]+$/)?.[0] ?? '';
      const before = sentenceTokens.slice(0, matchIndex).join(' ');
      const after = sentenceTokens.slice(matchIndex + phraseWords.length).join(' ');
      const gapped = [before, '_____' + trailingPunct, after].filter(Boolean).join(' ');
      return { gappedSentence: gapped, answer };
    }
  }

  // Fallback: blank the last word of the idiom if it appears anywhere in the sentence.
  const lastWord = clean(idiomWords[idiomWords.length - 1]);
  const idx = sentenceClean.findIndex((w) => w === lastWord);
  if (idx !== -1) {
    const token = sentenceTokens[idx];
    const trailingPunct = token.match(/[.,!?;:]+$/)?.[0] ?? '';
    const before = sentenceTokens.slice(0, idx).join(' ');
    const after = sentenceTokens.slice(idx + 1).join(' ');
    return { gappedSentence: [before, '_____' + trailingPunct, after].filter(Boolean).join(' '), answer: token.replace(/[.,!?;:]+$/, '') };
  }

  return { gappedSentence: sentence, answer: idiom };
}

function findContiguous(haystack: string[], needle: string[]): number {
  outer: for (let i = 0; i <= haystack.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) continue outer;
    }
    return i;
  }
  return -1;
}
