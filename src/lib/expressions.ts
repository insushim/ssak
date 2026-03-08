export interface ExpressionEntry {
  word: string;
  category: string;
  upgrades: string[];
  example: string;
}

export const EXPRESSION_DB: Record<string, ExpressionEntry[]> = {
  "감정-기쁨": [
    {
      word: "기쁘다",
      category: "감정",
      upgrades: ["신이 나다", "가슴이 뛰다", "입꼬리가 올라가다", "환호하다"],
      example: "시험이 끝나자 가슴이 뛰었다.",
    },
    {
      word: "좋다",
      category: "감정",
      upgrades: ["흡족하다", "만족스럽다", "황홀하다", "흐뭇하다"],
      example: "결과를 보니 흡족했다.",
    },
    {
      word: "행복하다",
      category: "감정",
      upgrades: ["벅차다", "충만하다", "가슴이 벅차오르다"],
      example: "그 순간 행복이 가슴에 충만했다.",
    },
    {
      word: "재미있다",
      category: "감정",
      upgrades: ["흥미진진하다", "신나다", "짜릿하다", "매력적이다"],
      example: "이야기가 흥미진진해서 시간 가는 줄 몰랐다.",
    },
  ],
  "감정-슬픔": [
    {
      word: "슬프다",
      category: "감정",
      upgrades: [
        "마음이 찡하다",
        "눈시울이 붉어지다",
        "가슴이 먹먹하다",
        "서글프다",
      ],
      example: "할머니 댁을 떠날 때 마음이 찡했다.",
    },
    {
      word: "울다",
      category: "감정",
      upgrades: ["눈물이 글썽이다", "목이 메다", "흐느끼다", "오열하다"],
      example: "이별 영화를 보며 눈물이 글썽였다.",
    },
    {
      word: "외롭다",
      category: "감정",
      upgrades: ["쓸쓸하다", "적적하다", "고독하다", "허전하다"],
      example: "친구가 떠나고 쓸쓸한 교실에 혼자 남았다.",
    },
  ],
  "감정-분노": [
    {
      word: "화나다",
      category: "감정",
      upgrades: ["울컥하다", "분하다", "격분하다", "치밀어 오르다"],
      example: "부당한 대우에 분함이 치밀어 올랐다.",
    },
    {
      word: "짜증나다",
      category: "감정",
      upgrades: ["답답하다", "속상하다", "불쾌하다", "신경이 거슬리다"],
      example: "계속되는 소음에 신경이 거슬렸다.",
    },
  ],
  "감정-놀람": [
    {
      word: "놀라다",
      category: "감정",
      upgrades: [
        "깜짝 놀라다",
        "경악하다",
        "아연실색하다",
        "눈이 휘둥그레지다",
      ],
      example: "예상치 못한 소식에 눈이 휘둥그레졌다.",
    },
    {
      word: "신기하다",
      category: "감정",
      upgrades: ["경이롭다", "불가사의하다", "놀랍다", "감탄스럽다"],
      example: "자연의 경이로운 모습에 감탄했다.",
    },
  ],
  "감정-두려움": [
    {
      word: "무섭다",
      category: "감정",
      upgrades: ["섬뜩하다", "오싹하다", "등골이 서늘하다", "간담이 서늘하다"],
      example: "어두운 골목에서 등골이 서늘했다.",
    },
    {
      word: "걱정되다",
      category: "감정",
      upgrades: [
        "불안하다",
        "조마조마하다",
        "마음이 놓이지 않다",
        "전전긍긍하다",
      ],
      example: "시험 결과가 나올 때까지 조마조마했다.",
    },
  ],
  연결어: [
    {
      word: "그리고",
      category: "연결어",
      upgrades: ["게다가", "뿐만 아니라", "이어서", "또한", "더불어"],
      example: "공부도 잘하고, 게다가 운동도 잘한다.",
    },
    {
      word: "그래서",
      category: "연결어",
      upgrades: ["덕분에", "그 결과", "이 때문에", "따라서", "이로 인해"],
      example: "꾸준히 연습한 덕분에 실력이 늘었다.",
    },
    {
      word: "그런데",
      category: "연결어",
      upgrades: ["하지만", "반면에", "그럼에도 불구하고", "그렇지만"],
      example: "열심히 준비했지만 결과가 아쉬웠다.",
    },
    {
      word: "그래도",
      category: "연결어",
      upgrades: ["그럼에도", "그렇지만", "비록 ~지만"],
      example: "힘들었지만, 그럼에도 포기하지 않았다.",
    },
    {
      word: "왜냐하면",
      category: "연결어",
      upgrades: ["그 까닭은", "~ 때문이다", "이유는 ~이다"],
      example: "일찍 출발했다. 그 까닭은 길이 막힐 수 있기 때문이다.",
    },
  ],
  "묘사-시각": [
    {
      word: "크다",
      category: "묘사",
      upgrades: ["거대하다", "웅장하다", "광활하다", "어마어마하다"],
      example: "웅장한 산맥이 눈앞에 펼쳐졌다.",
    },
    {
      word: "작다",
      category: "묘사",
      upgrades: ["아담하다", "소담하다", "앙증맞다", "자그마하다"],
      example: "아담한 카페가 골목 안에 숨어 있었다.",
    },
    {
      word: "예쁘다",
      category: "묘사",
      upgrades: ["아름답다", "황홀하다", "눈부시다", "빼어나다"],
      example: "노을빛이 눈부시게 아름다웠다.",
    },
  ],
  "묘사-촉감": [
    {
      word: "부드럽다",
      category: "묘사",
      upgrades: ["보드랍다", "매끄럽다", "포근하다", "사르르하다"],
      example: "이불이 포근해서 금방 잠이 들었다.",
    },
    {
      word: "딱딱하다",
      category: "묘사",
      upgrades: ["단단하다", "뻣뻣하다", "빳빳하다"],
      example: "새 신발이 빳빳해서 발이 아팠다.",
    },
  ],
  동작: [
    {
      word: "가다",
      category: "동작",
      upgrades: ["걸어가다", "향하다", "나아가다", "발걸음을 옮기다"],
      example: "학교를 향해 발걸음을 옮겼다.",
    },
    {
      word: "보다",
      category: "동작",
      upgrades: ["바라보다", "관찰하다", "응시하다", "살펴보다"],
      example: "하늘을 한참 바라보았다.",
    },
    {
      word: "먹다",
      category: "동작",
      upgrades: ["맛보다", "음미하다", "한입 베어 물다", "꼭꼭 씹다"],
      example: "엄마가 만든 음식을 음미하며 먹었다.",
    },
    {
      word: "말하다",
      category: "동작",
      upgrades: ["속삭이다", "외치다", "중얼거리다", "토로하다", "이야기하다"],
      example: "친구에게 비밀을 속삭였다.",
    },
  ],
  시간: [
    {
      word: "아침",
      category: "시간",
      upgrades: ["새벽녘", "동이 트다", "해가 뜨다", "이른 아침"],
      example: "동이 트자 새소리가 들려왔다.",
    },
    {
      word: "저녁",
      category: "시간",
      upgrades: ["해질녘", "황혼", "어스름", "석양"],
      example: "황혼이 내려앉을 무렵 집에 도착했다.",
    },
    {
      word: "갑자기",
      category: "시간",
      upgrades: ["느닷없이", "불현듯", "돌연", "문득"],
      example: "불현듯 좋은 생각이 떠올랐다.",
    },
  ],
};

export function findBetterExpressions(
  text: string,
): { word: string; upgrades: string[]; example: string }[] {
  const suggestions: { word: string; upgrades: string[]; example: string }[] =
    [];
  const seen = new Set<string>();

  for (const entries of Object.values(EXPRESSION_DB)) {
    for (const entry of entries) {
      if (!seen.has(entry.word) && text.includes(entry.word)) {
        // Count occurrences
        const regex = new RegExp(entry.word, "g");
        const count = (text.match(regex) || []).length;
        if (count >= 2 || entry.category === "연결어") {
          suggestions.push({
            word: entry.word,
            upgrades: entry.upgrades,
            example: entry.example,
          });
          seen.add(entry.word);
        }
      }
    }
  }

  return suggestions;
}

export function getExpressionsByCategory(category: string): ExpressionEntry[] {
  const key = Object.keys(EXPRESSION_DB).find((k) => k.startsWith(category));
  return key ? EXPRESSION_DB[key] : [];
}

export function getAllCategories(): string[] {
  return [...new Set(Object.keys(EXPRESSION_DB).map((k) => k.split("-")[0]))];
}
