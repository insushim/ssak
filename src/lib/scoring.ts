import type {
  ScoreResult,
  SelfAssessment,
  SentenceFeedback,
  TextStats,
  GradeLevel,
} from "../types";

// ─── Text Analysis Utilities ───

function splitSentences(text: string): string[] {
  return text
    .split(/[.!?。]\s*/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function splitWords(text: string): string[] {
  return text
    .replace(/[^\uAC00-\uD7A3a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n|\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

export function analyzeText(text: string): TextStats {
  const sentences = splitSentences(text);
  const words = splitWords(text);
  const paragraphs = splitParagraphs(text);
  const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
  const sentenceLengths = sentences.map((s) => splitWords(s).length);

  return {
    charCount: text.replace(/\s/g, "").length,
    wordCount: words.length,
    sentenceCount: sentences.length || 1,
    paragraphCount: paragraphs.length || 1,
    uniqueWordCount: uniqueWords.size,
    vocabularyDiversity: words.length > 0 ? uniqueWords.size / words.length : 0,
    avgSentenceLength:
      sentenceLengths.length > 0
        ? sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length
        : 0,
    longestSentence:
      sentenceLengths.length > 0 ? Math.max(...sentenceLengths) : 0,
    shortestSentence:
      sentenceLengths.length > 0 ? Math.min(...sentenceLengths) : 0,
  };
}

// ─── Grade Level Config ───

interface GradeConfig {
  minWords: number;
  idealWords: number;
  minSentences: number;
  minParagraphs: number;
  targetVocabDiversity: number;
  targetAvgSentenceLen: number;
}

const GRADE_CONFIGS: Record<string, GradeConfig> = {
  "초1-2": {
    minWords: 30,
    idealWords: 80,
    minSentences: 3,
    minParagraphs: 1,
    targetVocabDiversity: 0.5,
    targetAvgSentenceLen: 6,
  },
  "초3-4": {
    minWords: 60,
    idealWords: 150,
    minSentences: 5,
    minParagraphs: 2,
    targetVocabDiversity: 0.55,
    targetAvgSentenceLen: 8,
  },
  "초5-6": {
    minWords: 100,
    idealWords: 250,
    minSentences: 8,
    minParagraphs: 3,
    targetVocabDiversity: 0.6,
    targetAvgSentenceLen: 10,
  },
  중1: {
    minWords: 150,
    idealWords: 350,
    minSentences: 10,
    minParagraphs: 3,
    targetVocabDiversity: 0.6,
    targetAvgSentenceLen: 12,
  },
  중2: {
    minWords: 180,
    idealWords: 400,
    minSentences: 12,
    minParagraphs: 4,
    targetVocabDiversity: 0.62,
    targetAvgSentenceLen: 13,
  },
  중3: {
    minWords: 200,
    idealWords: 450,
    minSentences: 14,
    minParagraphs: 4,
    targetVocabDiversity: 0.65,
    targetAvgSentenceLen: 14,
  },
  고1: {
    minWords: 250,
    idealWords: 500,
    minSentences: 15,
    minParagraphs: 4,
    targetVocabDiversity: 0.65,
    targetAvgSentenceLen: 15,
  },
  고2: {
    minWords: 280,
    idealWords: 550,
    minSentences: 16,
    minParagraphs: 5,
    targetVocabDiversity: 0.68,
    targetAvgSentenceLen: 16,
  },
  고3: {
    minWords: 300,
    idealWords: 600,
    minSentences: 18,
    minParagraphs: 5,
    targetVocabDiversity: 0.7,
    targetAvgSentenceLen: 16,
  },
  대학: {
    minWords: 400,
    idealWords: 800,
    minSentences: 20,
    minParagraphs: 5,
    targetVocabDiversity: 0.7,
    targetAvgSentenceLen: 18,
  },
  성인: {
    minWords: 300,
    idealWords: 600,
    minSentences: 15,
    minParagraphs: 4,
    targetVocabDiversity: 0.68,
    targetAvgSentenceLen: 16,
  },
};

function getGradeConfig(grade: string): GradeConfig {
  return GRADE_CONFIGS[grade] || GRADE_CONFIGS["초3-4"];
}

// ─── Common Korean Error Patterns ───

const SPELLING_ERRORS: [RegExp, string][] = [
  [/되([^었다])/g, "'되'와 '돼' 혼동 가능성"],
  [/돼([었다])/g, "'돼었'은 '됐'으로 써야 합니다"],
  [/않되/g, "'안 돼'가 맞습니다"],
  [/안돼([^요서겠지])/g, "'안 돼' 띄어쓰기 확인"],
  [/왠지/g, "'웬지'가 맞습니다 (왠 → 왜인지의 줄임)"],
  [/어의없/g, "'어이없'이 맞습니다"],
  [/오랫만/g, "'오랜만'이 맞습니다"],
  [/몇일/g, "'며칠'이 맞습니다"],
  [/금새/g, "'금세'가 맞습니다"],
  [/일찍히/g, "'일찍이'가 맞습니다"],
  [/어떻게([^든하])/g, "'어떡해'와 '어떻게' 확인"],
  [/할께/g, "'할게'가 맞습니다"],
  [/할꺼/g, "'할 거'가 맞습니다"],
  [/있슴/g, "'있음'이 맞습니다"],
  [/없슴/g, "'없음'이 맞습니다"],
  [/머리말/g, ""],
  [/설레임/g, "'설렘'이 맞습니다"],
  [/가르켜/g, "'가리켜'가 맞습니다"],
  [/희안/g, "'희한'이 맞습니다"],
  [/역활/g, "'역할'이 맞습니다"],
  [/갈켜/g, "'가르쳐'가 맞습니다"],
  [/걸리다/g, ""],
  [/문안하/g, ""],
  [/바램/g, "'바람'이 맞습니다 (희망의 의미)"],
  [/곰곰히/g, "'곰곰이'가 맞습니다"],
  [/깨끗히/g, "'깨끗이'가 맞습니다"],
  [/일일히/g, "'일일이'가 맞습니다"],
  [/다를바/g, "'다를 바' 띄어쓰기 필요"],
  [/어쨋든/g, "'어쨌든'이 맞습니다"],
  [/어째든/g, "'어쨌든'이 맞습니다"],
  [/댓가/g, "'대가'가 맞습니다"],
  [/뒷처리/g, "'뒤처리'가 맞습니다"],
  [/갯수/g, "'개수'가 맞습니다"],
  [/해결/g, ""],
];

const SPACING_ERRORS: [RegExp, string][] = [
  [/[가-힣]것같/g, "'것 같' 띄어쓰기"],
  [/할수있/g, "'할 수 있' 띄어쓰기"],
  [/할수없/g, "'할 수 없' 띄어쓰기"],
  [/것이다/g, ""],
  [/할때/g, "'할 때' 띄어쓰기"],
  [/인것/g, "'인 것' 띄어쓰기"],
  [/할줄/g, "'할 줄' 띄어쓰기"],
  [/할수록/g, "'할수록'은 붙여쓰기 OK"],
  [/[가-힣]뿐만아니라/g, "'뿐만 아니라' 띄어쓰기"],
  [/그런데도불구/g, "'그런데도 불구' 띄어쓰기"],
];

// ─── Overused/Filler Words ───

const FILLER_WORDS = [
  "정말",
  "진짜",
  "너무",
  "매우",
  "아주",
  "굉장히",
  "엄청",
  "완전",
  "되게",
  "많이",
  "조금",
  "약간",
];
const WEAK_ENDINGS = [
  "했다",
  "갔다",
  "왔다",
  "봤다",
  "먹었다",
  "잤다",
  "있었다",
  "없었다",
];
const OVERUSED_CONNECTORS = ["그리고", "그래서", "그런데", "하지만", "그러나"];

// ─── Score Content (30 points) ───

function scoreContent(
  text: string,
  topic: string,
  stats: TextStats,
  config: GradeConfig,
): { score: number; feedback: string[] } {
  let score = 0;
  const feedback: string[] = [];
  const words = splitWords(text);

  // 1. Length adequacy (0-12)
  const lengthRatio = stats.wordCount / config.idealWords;
  if (lengthRatio >= 1) {
    score += 12;
  } else if (lengthRatio >= 0.7) {
    score += Math.round(8 + ((lengthRatio - 0.7) / 0.3) * 4);
  } else if (lengthRatio >= 0.4) {
    score += Math.round(4 + ((lengthRatio - 0.4) / 0.3) * 4);
  } else {
    score += Math.round((lengthRatio / 0.4) * 4);
    feedback.push(
      `글의 분량이 부족해요. ${config.idealWords}단어 정도를 목표로 써보세요.`,
    );
  }

  // 2. Topic relevance (0-10) - keyword matching
  if (topic) {
    const topicWords = splitWords(topic);
    const textLower = text.toLowerCase();
    let topicMatches = 0;
    for (const tw of topicWords) {
      if (textLower.includes(tw.toLowerCase())) topicMatches++;
    }
    const topicScore =
      topicWords.length > 0
        ? Math.min(10, Math.round((topicMatches / topicWords.length) * 10))
        : 7;
    score += topicScore;
    if (topicScore < 5) {
      feedback.push("주제와 관련된 내용을 더 써보세요.");
    }
  } else {
    score += 7; // no topic specified, give reasonable score
  }

  // 3. Detail & specificity (0-8)
  const specificWords = words.filter((w) => w.length >= 3).length;
  const specificRatio = words.length > 0 ? specificWords / words.length : 0;
  const detailScore = Math.min(8, Math.round(specificRatio * 12));
  score += detailScore;
  if (detailScore < 4) {
    feedback.push("더 구체적이고 자세한 표현을 사용해보세요.");
  }

  return { score: Math.min(30, score), feedback };
}

// ─── Score Organization (25 points) ───

function scoreOrganization(
  text: string,
  stats: TextStats,
  config: GradeConfig,
): { score: number; feedback: string[] } {
  let score = 0;
  const feedback: string[] = [];
  const paragraphs = splitParagraphs(text);
  const sentences = splitSentences(text);

  // 1. Paragraph structure (0-10)
  if (paragraphs.length >= config.minParagraphs) {
    score += Math.min(10, 6 + paragraphs.length);
  } else {
    score += Math.max(
      3,
      Math.round((paragraphs.length / config.minParagraphs) * 8),
    );
    feedback.push(
      `문단을 나누어 써보세요. ${config.minParagraphs}개 이상의 문단을 추천합니다.`,
    );
  }

  // 2. Intro/Body/Conclusion check (0-8)
  if (paragraphs.length >= 3) {
    const firstPara = paragraphs[0];
    const lastPara = paragraphs[paragraphs.length - 1];
    let structureScore = 4; // base

    // Check if first paragraph is introduction-like (shorter, sets context)
    if (splitSentences(firstPara).length >= 1) structureScore += 2;
    // Check if last paragraph wraps up
    if (splitSentences(lastPara).length >= 1) structureScore += 2;

    score += structureScore;
  } else if (paragraphs.length === 2) {
    score += 5;
  } else {
    score += 3;
    feedback.push("시작-중간-끝 구조로 글을 구성해보세요.");
  }

  // 3. Logical flow - connector usage (0-7)
  const connectors = [
    "그리고",
    "그래서",
    "그런데",
    "하지만",
    "그러나",
    "왜냐하면",
    "따라서",
    "게다가",
    "또한",
    "더불어",
    "뿐만 아니라",
    "이어서",
    "결국",
    "마지막으로",
    "먼저",
    "다음으로",
  ];
  const usedConnectors = connectors.filter((c) => text.includes(c));
  const connectorScore = Math.min(
    7,
    Math.round(
      (usedConnectors.length / Math.max(3, sentences.length * 0.3)) * 7,
    ),
  );
  score += connectorScore;
  if (usedConnectors.length < 2 && sentences.length > 5) {
    feedback.push("문장과 문장을 연결하는 접속어를 더 사용해보세요.");
  }

  return { score: Math.min(25, score), feedback };
}

// ─── Score Expression (25 points) ───

function scoreExpression(
  text: string,
  stats: TextStats,
  config: GradeConfig,
): { score: number; feedback: string[] } {
  let score = 0;
  const feedback: string[] = [];
  const words = splitWords(text);
  const sentences = splitSentences(text);

  // 1. Vocabulary diversity (0-10)
  const diversityRatio =
    stats.vocabularyDiversity / config.targetVocabDiversity;
  const diversityScore = Math.min(10, Math.round(diversityRatio * 8));
  score += diversityScore;
  if (diversityScore < 5) {
    feedback.push("같은 단어를 반복하지 말고 다양한 표현을 써보세요.");
  }

  // 2. Sentence variety (0-8)
  if (sentences.length >= 3) {
    const lengths = sentences.map((s) => splitWords(s).length);
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance =
      lengths.reduce((sum, l) => sum + Math.pow(l - mean, 2), 0) /
      lengths.length;
    const stddev = Math.sqrt(variance);
    // Higher stddev = more variety = better
    const varietyScore = Math.min(8, Math.round((stddev / 4) * 8));
    score += varietyScore;
    if (varietyScore < 3) {
      feedback.push(
        "문장 길이를 다양하게 해보세요. 짧은 문장과 긴 문장을 섞어 쓰면 좋아요.",
      );
    }
  } else {
    score += 4;
  }

  // 3. Filler word avoidance (0-7)
  let fillerCount = 0;
  for (const filler of FILLER_WORDS) {
    const regex = new RegExp(filler, "g");
    const matches = text.match(regex);
    if (matches) fillerCount += matches.length;
  }
  const fillerRatio = words.length > 0 ? fillerCount / words.length : 0;
  const fillerScore = Math.max(0, 7 - Math.round(fillerRatio * 50));
  score += fillerScore;
  if (fillerCount > 3) {
    const topFillers = FILLER_WORDS.filter((f) => text.includes(f)).slice(0, 3);
    feedback.push(
      `'${topFillers.join("', '")}'을(를) 너무 많이 사용했어요. 다른 표현으로 바꿔보세요.`,
    );
  }

  return { score: Math.min(25, score), feedback };
}

// ─── Score Mechanics (20 points) ───

function scoreMechanics(
  text: string,
  stats: TextStats,
): {
  score: number;
  feedback: string[];
  errors: { type: string; detail: string }[];
} {
  let score = 20; // Start from max and deduct
  const feedback: string[] = [];
  const errors: { type: string; detail: string }[] = [];

  // 1. Spelling check (deduct from 7)
  let spellingDeductions = 0;
  for (const [pattern, msg] of SPELLING_ERRORS) {
    if (!msg) continue; // skip non-error patterns
    const matches = text.match(pattern);
    if (matches) {
      spellingDeductions += matches.length;
      errors.push({ type: "맞춤법", detail: msg });
    }
  }
  score -= Math.min(7, spellingDeductions * 2);
  if (spellingDeductions > 0) {
    feedback.push(`맞춤법 오류가 ${spellingDeductions}개 발견되었어요.`);
  }

  // 2. Spacing check (deduct from 6)
  let spacingDeductions = 0;
  for (const [pattern, msg] of SPACING_ERRORS) {
    if (!msg) continue;
    const matches = text.match(pattern);
    if (matches) {
      spacingDeductions += matches.length;
      errors.push({ type: "띄어쓰기", detail: msg });
    }
  }
  score -= Math.min(6, spacingDeductions * 2);
  if (spacingDeductions > 0) {
    feedback.push(`띄어쓰기 오류가 ${spacingDeductions}개 발견되었어요.`);
  }

  // 3. Punctuation (deduct from 7)
  const sentences = splitSentences(text);
  let punctuationScore = 7;

  // Check if sentences end properly
  const rawSentences = text
    .split(/\n/)
    .flatMap((line) =>
      line.split(/(?<=[.!?。])\s*/).filter((s) => s.trim().length > 0),
    );
  const withoutPunctuation = rawSentences.filter((s) => {
    const trimmed = s.trim();
    return trimmed.length > 5 && !/[.!?。]$/.test(trimmed);
  });
  if (withoutPunctuation.length > 0) {
    punctuationScore -= Math.min(4, withoutPunctuation.length);
    feedback.push("문장 끝에 마침표를 꼭 찍어주세요.");
  }

  score = Math.min(
    score,
    7 -
      Math.min(7, spellingDeductions * 2) +
      6 -
      Math.min(6, spacingDeductions * 2) +
      punctuationScore,
  );
  score = Math.max(0, Math.min(20, score));

  return { score, feedback, errors };
}

// ─── Sentence-level Micro Feedback ───

function generateSentenceFeedbacks(text: string): SentenceFeedback[] {
  const sentences = splitSentences(text);
  const feedbacks: SentenceFeedback[] = [];
  const endingCounts: Record<string, number> = {};
  const connectorCounts: Record<string, number> = {};

  // Pre-scan for patterns
  for (const s of sentences) {
    const words = splitWords(s);
    if (words.length > 0) {
      const ending = words[words.length - 1];
      endingCounts[ending] = (endingCounts[ending] || 0) + 1;
    }
    const firstWord = words[0] || "";
    if (OVERUSED_CONNECTORS.includes(firstWord)) {
      connectorCounts[firstWord] = (connectorCounts[firstWord] || 0) + 1;
    }
  }

  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    const words = splitWords(s);
    const issues: string[] = [];
    const suggestions: string[] = [];
    let type: "error" | "warning" | "tip" = "tip";

    // Check sentence ending repetition
    if (words.length > 0) {
      const ending = words[words.length - 1];
      if (WEAK_ENDINGS.includes(ending) && endingCounts[ending] >= 3) {
        issues.push(
          `'${ending}' 문장 끝맺음이 ${endingCounts[ending]}번 반복됩니다`,
        );
        suggestions.push("다른 문장 끝맺음을 시도해보세요");
        type = "warning";
      }
    }

    // Check connector overuse
    const firstWord = words[0] || "";
    if (
      OVERUSED_CONNECTORS.includes(firstWord) &&
      connectorCounts[firstWord] >= 2
    ) {
      issues.push(
        `'${firstWord}'가 ${connectorCounts[firstWord]}번 연속 사용됨`,
      );
      const alternatives: Record<string, string[]> = {
        그리고: ["게다가", "뿐만 아니라", "이어서", "또한"],
        그래서: ["덕분에", "그 결과", "이 때문에", "따라서"],
        그런데: ["하지만", "그럼에도", "반면에"],
        하지만: ["그러나", "반면", "그럼에도 불구하고"],
        그러나: ["하지만", "그렇지만", "다만"],
      };
      if (alternatives[firstWord]) {
        suggestions.push(
          `대신 사용해보세요: ${alternatives[firstWord].join(", ")}`,
        );
      }
      type = "warning";
    }

    // Check too short sentence
    if (words.length <= 2 && i > 0) {
      issues.push("문장이 너무 짧아요");
      suggestions.push("좀 더 자세하게 써보세요");
      type = "tip";
    }

    // Check too long sentence
    if (words.length > 25) {
      issues.push("문장이 너무 길어요");
      suggestions.push("두 문장으로 나눠보세요");
      type = "warning";
    }

    // Check spelling errors in this sentence
    for (const [pattern, msg] of SPELLING_ERRORS) {
      if (!msg) continue;
      if (pattern.test(s)) {
        issues.push(msg);
        type = "error";
        pattern.lastIndex = 0; // reset regex
      }
    }

    // Check filler words
    const fillersInSentence = FILLER_WORDS.filter((f) => s.includes(f));
    if (fillersInSentence.length >= 2) {
      issues.push(`수식어가 많아요: ${fillersInSentence.join(", ")}`);
      suggestions.push("하나만 남기고 나머지는 빼보세요");
      type = "tip";
    }

    if (issues.length > 0) {
      feedbacks.push({ index: i, sentence: s, issues, suggestions, type });
    }
  }

  return feedbacks;
}

// ─── Main Scoring Function ───

export function scoreWriting(
  text: string,
  topic: string = "",
  gradeLevel: string = "초3-4",
): ScoreResult {
  const stats = analyzeText(text);
  const config = getGradeConfig(gradeLevel);
  const allFeedback: string[] = [];

  // Score each domain
  const content = scoreContent(text, topic, stats, config);
  const organization = scoreOrganization(text, stats, config);
  const expression = scoreExpression(text, stats, config);
  const mechanics = scoreMechanics(text, stats);

  allFeedback.push(
    ...content.feedback,
    ...organization.feedback,
    ...expression.feedback,
    ...mechanics.feedback,
  );

  const total =
    content.score + organization.score + expression.score + mechanics.score;

  // Generate overall feedback message
  let overallFeedback = "";
  if (total >= 90) {
    overallFeedback = "훌륭해요! 아주 잘 쓴 글이에요. ";
  } else if (total >= 80) {
    overallFeedback = "잘 썼어요! 조금만 더 다듬으면 완벽해질 거예요. ";
  } else if (total >= 70) {
    overallFeedback =
      "좋은 시작이에요! 아래 피드백을 참고해서 고쳐쓰기를 해보세요. ";
  } else if (total >= 60) {
    overallFeedback = "노력한 게 보여요. 피드백을 잘 읽고 다시 도전해보세요! ";
  } else {
    overallFeedback =
      "글쓰기는 연습할수록 늘어요! 피드백을 참고해서 다시 써보세요. ";
  }

  if (allFeedback.length > 0) {
    overallFeedback +=
      "\n\n" + allFeedback.map((f, i) => `${i + 1}. ${f}`).join("\n");
  }

  const sentenceFeedbacks = generateSentenceFeedbacks(text);

  return {
    content: content.score,
    organization: organization.score,
    expression: expression.score,
    mechanics: mechanics.score,
    total,
    feedback: overallFeedback,
    sentenceFeedbacks,
    textStats: stats,
  };
}

// ─── Error Pattern Detection ───

export function detectErrorPatterns(
  text: string,
): { type: string; detail: string; example: string }[] {
  const patterns: { type: string; detail: string; example: string }[] = [];

  for (const [pattern, msg] of SPELLING_ERRORS) {
    if (!msg) continue;
    const matches = text.match(pattern);
    if (matches) {
      patterns.push({ type: "맞춤법", detail: msg, example: matches[0] });
    }
    pattern.lastIndex = 0;
  }

  for (const [pattern, msg] of SPACING_ERRORS) {
    if (!msg) continue;
    const matches = text.match(pattern);
    if (matches) {
      patterns.push({ type: "띄어쓰기", detail: msg, example: matches[0] });
    }
    pattern.lastIndex = 0;
  }

  // Check connector overuse
  const sentences = splitSentences(text);
  const firstWords = sentences.map((s) => splitWords(s)[0]).filter(Boolean);
  for (const connector of OVERUSED_CONNECTORS) {
    const count = firstWords.filter((w) => w === connector).length;
    if (count >= 3) {
      patterns.push({
        type: "접속사 반복",
        detail: `'${connector}'를 문장 시작에 ${count}번 사용`,
        example: connector,
      });
    }
  }

  // Check ending repetition
  const endings = sentences.map((s) => {
    const w = splitWords(s);
    return w[w.length - 1] || "";
  });
  for (const ending of WEAK_ENDINGS) {
    const count = endings.filter((e) => e === ending).length;
    if (count >= 3) {
      patterns.push({
        type: "서술어 반복",
        detail: `'${ending}'로 끝나는 문장이 ${count}번`,
        example: ending,
      });
    }
  }

  return patterns;
}

// ─── Self Assessment Comparison ───

export function compareSelfAssessment(
  selfAssessment: SelfAssessment,
  scoreResult: ScoreResult,
): {
  category: string;
  selfRating: number;
  actualLevel: number;
  message: string;
}[] {
  const results: {
    category: string;
    selfRating: number;
    actualLevel: number;
    message: string;
  }[] = [];

  const toLevel = (score: number, max: number): number =>
    Math.round((score / max) * 5);

  // Topic/Content
  const contentLevel = toLevel(scoreResult.content, 30);
  results.push({
    category: "주제 적합성",
    selfRating: selfAssessment.rating_topic,
    actualLevel: contentLevel,
    message: getComparisonMessage(
      selfAssessment.rating_topic,
      contentLevel,
      "주제",
    ),
  });

  // Length
  const lengthLevel = toLevel(
    Math.min((scoreResult.textStats.wordCount / 200) * 30, 30),
    30,
  );
  results.push({
    category: "분량",
    selfRating: selfAssessment.rating_length,
    actualLevel: lengthLevel,
    message: getComparisonMessage(
      selfAssessment.rating_length,
      lengthLevel,
      "분량",
    ),
  });

  // Spelling/Mechanics
  const mechanicsLevel = toLevel(scoreResult.mechanics, 20);
  results.push({
    category: "맞춤법",
    selfRating: selfAssessment.rating_spelling,
    actualLevel: mechanicsLevel,
    message: getComparisonMessage(
      selfAssessment.rating_spelling,
      mechanicsLevel,
      "맞춤법",
    ),
  });

  // Expression
  const expressionLevel = toLevel(scoreResult.expression, 25);
  results.push({
    category: "표현 다양성",
    selfRating: selfAssessment.rating_expression,
    actualLevel: expressionLevel,
    message: getComparisonMessage(
      selfAssessment.rating_expression,
      expressionLevel,
      "표현",
    ),
  });

  return results;
}

// ─── Sensory Expression Detection ───

const SENSORY_EXPRESSIONS: Record<string, string[]> = {
  시각: [
    "보이다",
    "보였다",
    "빛나다",
    "반짝",
    "빨간",
    "파란",
    "노란",
    "초록",
    "하얀",
    "까만",
    "밝다",
    "어둡다",
    "빛",
    "색",
    "그림자",
    "눈부시",
    "환하",
    "무지개",
  ],
  청각: [
    "들리다",
    "들렸다",
    "소리",
    "노래",
    "울리다",
    "시끄럽",
    "조용",
    "속삭",
    "외치다",
    "울음",
    "웃음소리",
    "빗소리",
    "바람소리",
    "뚝뚝",
    "쨍그랑",
  ],
  촉각: [
    "느끼다",
    "느껴지",
    "따뜻",
    "차갑",
    "뜨거",
    "부드럽",
    "딱딱",
    "거칠",
    "매끄럽",
    "포근",
    "축축",
    "미끈",
    "쫀득",
  ],
  미각: [
    "맛있",
    "달콤",
    "씁쓸",
    "시큼",
    "짠",
    "매운",
    "새콤",
    "맛",
    "먹었",
    "감칠맛",
    "향긋",
  ],
  후각: [
    "냄새",
    "향기",
    "향",
    "구수",
    "고소",
    "역겹",
    "상큼",
    "풍기다",
    "맡다",
    "코끝",
  ],
};

export function detectSensoryExpressions(
  text: string,
): { sense: string; count: number; words: string[] }[] {
  const results: { sense: string; count: number; words: string[] }[] = [];

  for (const [sense, keywords] of Object.entries(SENSORY_EXPRESSIONS)) {
    const found: string[] = [];
    for (const kw of keywords) {
      if (text.includes(kw)) found.push(kw);
    }
    results.push({ sense, count: found.length, words: found });
  }

  return results;
}

// ─── Content Depth Analysis ───

const DEPTH_KEYWORDS: Record<string, { keywords: string[]; label: string }> = {
  감정: {
    keywords: [
      "기쁘",
      "슬프",
      "행복",
      "화",
      "놀라",
      "무섭",
      "걱정",
      "설레",
      "뿌듯",
      "후회",
      "그리",
      "외로",
      "부끄",
    ],
    label: "감정 표현",
  },
  이유: {
    keywords: [
      "왜냐하면",
      "때문",
      "이유",
      "덕분",
      "까닭",
      "그래서",
      "결과",
      "영향",
    ],
    label: "이유/원인",
  },
  비유: {
    keywords: ["처럼", "같이", "마치", "만큼", "듯이", "닮", "비슷"],
    label: "비유 표현",
  },
  대화: {
    keywords: [
      "말했다",
      "물었다",
      "대답",
      "외쳤다",
      "속삭",
      "이야기했",
      "라고",
      "라며",
    ],
    label: "대화 표현",
  },
  감각: {
    keywords: ["소리", "냄새", "맛", "느낌", "보이", "들리", "향기", "촉감"],
    label: "감각 묘사",
  },
  생각: {
    keywords: [
      "생각",
      "느꼈",
      "깨달",
      "알게 되",
      "배웠",
      "궁금",
      "기억",
      "떠올",
    ],
    label: "생각/깨달음",
  },
};

export function analyzeContentDepth(text: string): {
  categories: { name: string; label: string; count: number }[];
  score: number;
  tips: string[];
} {
  const categories: { name: string; label: string; count: number }[] = [];
  let totalFound = 0;

  for (const [name, { keywords, label }] of Object.entries(DEPTH_KEYWORDS)) {
    let count = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) count++;
    }
    categories.push({ name, label, count });
    if (count > 0) totalFound++;
  }

  const score = Math.min(100, Math.round((totalFound / 6) * 100));
  const tips: string[] = [];

  const missing = categories.filter((c) => c.count === 0);
  if (missing.length > 0) {
    const topMissing = missing.slice(0, 2).map((m) => m.label);
    tips.push(`'${topMissing.join("', '")}'을 추가하면 글이 더 풍부해져요!`);
  }
  if (!categories.find((c) => c.name === "생각")?.count) {
    tips.push("글 끝에 '느낀 점'이나 '깨달은 것'을 써보세요.");
  }

  return { categories, score, tips };
}

// ─── Error Pattern Quiz Generation ───

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
  tip: string;
}

const QUIZ_BANK: Record<string, QuizQuestion[]> = {
  맞춤법: [
    {
      question: "맞는 것을 고르세요: (왠일 / 웬일)이야!",
      options: ["왠일", "웬일"],
      answer: 1,
      tip: "'왠'은 '왜인'의 줄임, '웬'은 '어찌 된'의 뜻이에요.",
    },
    {
      question: "'며칠'의 올바른 표기는?",
      options: ["몇일", "며칠", "멫일"],
      answer: 1,
      tip: "'며칠'이 표준어예요.",
    },
    {
      question: "맞는 표현은?",
      options: ["금새 도착했다", "금세 도착했다"],
      answer: 1,
      tip: "'금세'는 '금시에'의 줄임말이에요.",
    },
    {
      question: "올바른 것은?",
      options: ["어의없다", "어이없다"],
      answer: 1,
      tip: "'어이'가 맞는 표현이에요.",
    },
    {
      question: "맞는 표현은?",
      options: ["할께", "할게"],
      answer: 1,
      tip: "'ㄹ게'가 맞아요. 'ㄹ께'는 틀린 표기예요.",
    },
    {
      question: "'설렘'의 올바른 형태는?",
      options: ["설레임", "설렘"],
      answer: 1,
      tip: "'설렘'이 맞아요. '-ㅁ'이 붙어요.",
    },
    {
      question: "올바른 것은?",
      options: ["역활", "역할"],
      answer: 1,
      tip: "'역할'이 맞아요. '활'을 써요.",
    },
    {
      question: "올바른 띄어쓰기는?",
      options: ["할수있다", "할 수 있다"],
      answer: 1,
      tip: "'할 수 있다'로 띄어 써요.",
    },
    {
      question: "올바른 것은?",
      options: ["오랫만에", "오랜만에"],
      answer: 1,
      tip: "'오랜만에'가 맞아요.",
    },
    {
      question: "맞는 표현은?",
      options: ["바램", "바람"],
      answer: 1,
      tip: "희망의 의미일 때 '바람'이 맞아요.",
    },
  ],
  띄어쓰기: [
    {
      question: "올바른 것은?",
      options: ["것같다", "것 같다"],
      answer: 1,
      tip: "'것 같다'로 띄어 써요.",
    },
    {
      question: "올바른 것은?",
      options: ["할때", "할 때"],
      answer: 1,
      tip: "'할 때'로 띄어 써요.",
    },
  ],
  "접속사 반복": [
    {
      question: "'그래서'의 대체 표현이 아닌 것은?",
      options: ["덕분에", "그 결과", "그리고", "따라서"],
      answer: 2,
      tip: "'그리고'는 나열, '그래서'는 인과관계예요.",
    },
    {
      question: "'그리고'를 대체할 표현은?",
      options: ["그래서", "게다가", "하지만"],
      answer: 1,
      tip: "'게다가'는 추가 정보를 연결할 때 써요.",
    },
  ],
};

export function generateQuiz(
  errorPatterns: { type: string; detail: string; example: string }[],
  maxQuestions: number = 3,
): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const usedIndices = new Set<string>();

  // From actual errors first
  for (const ep of errorPatterns) {
    const bank = QUIZ_BANK[ep.type];
    if (!bank) continue;
    for (const q of bank) {
      const key = `${ep.type}-${q.question}`;
      if (!usedIndices.has(key)) {
        questions.push(q);
        usedIndices.add(key);
        if (questions.length >= maxQuestions) return questions;
        break;
      }
    }
  }

  // Fill with general questions
  if (questions.length < maxQuestions) {
    for (const [, bank] of Object.entries(QUIZ_BANK)) {
      for (const q of bank) {
        const key = q.question;
        if (!usedIndices.has(key)) {
          questions.push(q);
          usedIndices.add(key);
          if (questions.length >= maxQuestions) return questions;
        }
      }
    }
  }

  return questions;
}

function getComparisonMessage(
  self: number,
  actual: number,
  category: string,
): string {
  const diff = self - actual;
  if (Math.abs(diff) <= 1) {
    return `${category} 자기 평가를 정확하게 잘 하고 있어요!`;
  } else if (diff > 1) {
    return `${category}를 실제보다 높게 평가했어요. 더 꼼꼼히 살펴보세요.`;
  } else {
    return `${category}를 실제보다 낮게 평가했어요. 자신감을 가져도 돼요!`;
  }
}
