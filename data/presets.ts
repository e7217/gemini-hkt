export type PresetCategory = '커리어' | '건강' | '재무' | '창업' | '교육' | '여행';

export interface PresetGoal {
  readonly id: string;
  readonly category: PresetCategory;
  readonly title: string;
  readonly description: string;
}

export const ALL_PRESET_GOALS: readonly PresetGoal[] = [
  // 커리어
  { id: 'career-001', category: '커리어', title: '풀스택 개발자 되기', description: '프론트엔드부터 백엔드까지 다루는 전문가로 성장' },
  { id: 'career-002', category: '커리어', title: '시니어 엔지니어로 승진', description: '기술적 리더십과 아키텍처 설계 역량 강화' },
  { id: 'career-003', category: '커리어', title: '데이터 사이언티스트 전향', description: '통계학과 머신러닝 지식을 쌓아 데이터 전문가로 변신' },
  { id: 'career-004', category: '커리어', title: '기술 블로그 운영', description: '학습한 내용을 기록하고 공유하며 영향력 확대' },
  { id: 'career-005', category: '커리어', title: '오픈소스 기여자 되기', description: '전 세계 개발자들과 협업하며 기술 생태계에 공헌' },
  { id: 'career-006', category: '커리어', title: '영어 기술 면접 합격', description: '해외 취업 또는 글로벌 기업 이직을 위한 커뮤니케이션 능력 배양' },
  // 건강
  { id: 'health-001', category: '건강', title: '바디 프로필 촬영', description: '체계적인 식단과 운동으로 인생 최고의 몸매 만들기' },
  { id: 'health-002', category: '건강', title: '마라톤 완주', description: '꾸준한 달리기 훈련으로 기초 체력 증진 및 완주의 성취감 달성' },
  { id: 'health-003', category: '건강', title: '매일 아침 명상 10분', description: '정신적 건강과 집중력을 높이기 위한 마음 챙김 연습' },
  { id: 'health-004', category: '건강', title: '체지방 10% 감량', description: '건강한 생활 습관 형성을 통한 체질 개선' },
  { id: 'health-005', category: '건강', title: '요가 마스터', description: '유연성과 근력을 동시에 키워 몸의 균형 잡기' },
  { id: 'health-006', category: '건강', title: '충분한 수면 습관 형성', description: '하루 7시간 이상 질 높은 수면을 통해 컨디션 관리' },
  // 재무
  { id: 'finance-001', category: '재무', title: '1억 모으기', description: '절약과 저축을 통해 종잣돈 마련' },
  { id: 'finance-002', category: '재무', title: '주식 투자 수익률 10% 달성', description: '재무제표 분석과 시장 흐름 파악을 통한 스마트한 투자' },
  { id: 'finance-003', category: '재무', title: '경제적 자유 조기 달성', description: '파이프라인 구축을 통한 비근로 소득 창출' },
  { id: 'finance-004', category: '재무', title: '가계부 매일 기록', description: '지출 내역을 철저히 분석하여 불필요한 소비 억제' },
  { id: 'finance-005', category: '재무', title: '부동산 경매 입문', description: '자산 증식을 위한 실전 경매 지식 습득 및 도전' },
  { id: 'finance-006', category: '재무', title: '연금 저축 펀드 가입', description: '안정적인 노후 준비를 위한 장기적인 자산 운용' },
  // 창업
  { id: 'startup-001', category: '창업', title: 'SaaS 서비스 런칭', description: '실사용자가 있는 유료 구독형 소프트웨어 출시' },
  { id: 'startup-002', category: '창업', title: '정부 지원 사업 선정', description: '비즈니스 모델의 타당성을 인정받고 초기 자금 확보' },
  { id: 'startup-003', category: '창업', title: '초기 멤버 3명 채용', description: '비전을 공유할 팀을 구성하여 본격적인 사업 확장' },
  { id: 'startup-004', category: '창업', title: '월 매출 1000만원 달성', description: '수익 모델 검증 및 성장을 위한 지표 확보' },
  { id: 'startup-005', category: '창업', title: '엔젤 투자 유치', description: '전문 투자자로부터 비즈니스 가치를 인정받고 성장의 발판 마련' },
  { id: 'startup-006', category: '창업', title: '글로벌 시장 진출', description: '국내를 넘어 해외 사용자들에게 서비스 제공' },
  // 교육
  { id: 'edu-001', category: '교육', title: '석사 학위 취득', description: '전문 분야에 대한 깊이 있는 연구와 학술적 성과 달성' },
  { id: 'edu-002', category: '교육', title: '자격증 3개 취득', description: '업무 역량 강화를 위한 전문 자격 확보' },
  { id: 'edu-003', category: '교육', title: '새로운 외국어 회화 가능', description: '제2외국어 습득을 통한 소통 범위 확대' },
  { id: 'edu-004', category: '교육', title: '글쓰기 강의 수강', description: '논리적인 글쓰기와 표현력을 키우기 위한 교육 이수' },
  { id: 'edu-005', category: '교육', title: '악기 연주 마스터', description: '새로운 취미 활동을 통해 정서적 풍요로움 찾기' },
  { id: 'edu-006', category: '교육', title: '독서 모임 운영', description: '함께 책을 읽고 토론하며 지식의 폭 넓히기' },
  // 여행
  { id: 'travel-001', category: '여행', title: '세계 일주', description: '다양한 국가와 문화를 경험하며 넓은 시야 확보' },
  { id: 'travel-002', category: '여행', title: '제주도 한 달 살기', description: '여유로운 일상을 보내며 새로운 환경에서 재충전' },
  { id: 'travel-003', category: '여행', title: '유럽 배낭여행', description: '유서 깊은 도시들을 방문하며 역사와 예술 경험' },
  { id: 'travel-004', category: '여행', title: '캠핑 전문가 되기', description: '자연 속에서 힐링하며 캠핑 장비와 기술 숙달' },
  { id: 'travel-005', category: '여행', title: '일본 미식 여행', description: '현지 유명 맛집을 탐방하며 미식의 즐거움 만끽' },
  { id: 'travel-006', category: '여행', title: '전국 일주 자전거 여행', description: '자전거를 타고 우리나라 곳곳을 누비며 체력과 인내심 시험' },
];

const DEMO_PRESET_IDS = ['career-001', 'startup-001', 'finance-001', 'health-001', 'travel-001'];

export function getRandomGoal(): PresetGoal {
  const randomIndex = Math.floor(Math.random() * ALL_PRESET_GOALS.length);
  return ALL_PRESET_GOALS[randomIndex];
}

export function getGoalsByCategory(category: PresetCategory): PresetGoal[] {
  return ALL_PRESET_GOALS.filter((goal) => goal.category === category);
}

export function getDemoGoals(): PresetGoal[] {
  return ALL_PRESET_GOALS.filter((goal) => DEMO_PRESET_IDS.includes(goal.id));
}
