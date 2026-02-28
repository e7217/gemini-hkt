export type PresetCategory = '커리어' | '건강' | '재무' | '창업' | '교육' | '여행';

export interface PresetGoal {
  readonly id: string;
  readonly category: PresetCategory;
  readonly title: string;
  readonly description: string;
}

export const ALL_PRESET_GOALS: readonly PresetGoal[] = [
  // 커리어
  { id: 'career-001', category: '커리어', title: '연봉 8000만원 풀스택 개발자 되기', description: '프론트엔드부터 백엔드까지 다루는 전문가로 성장하여 시장 가치 증명' },
  { id: 'career-002', category: '커리어', title: '3년 내 시니어 엔지니어로 승진', description: '기술적 리더십과 아키텍처 설계 역량을 강화하여 팀의 핵심 인재로 거듭나기' },
  { id: 'career-003', category: '커리어', title: '데이터 사이언티스트로 전향 (연봉 20% 상승)', description: '통계학과 머신러닝 지식을 쌓아 데이터 전문가로 변신하고 처우 개선' },
  { id: 'career-004', category: '커리어', title: '월 방문자 1만 명 기술 블로그 운영', description: '학습한 내용을 기록하고 공유하며 영향력 확대 및 퍼스널 브랜딩' },
  { id: 'career-005', category: '커리어', title: '오픈소스 프로젝트 컨트리뷰션 50회 달성', description: '전 세계 개발자들과 협업하며 기술 생태계에 공헌하고 실력 검증' },
  { id: 'career-006', category: '커리어', title: '영어 기술 면접 합격 (해외 취업 확정)', description: '글로벌 기업 이직을 위한 커뮤니케이션 능력을 배양하여 해외 진출 성공' },
  // 건강
  { id: 'health-001', category: '건강', title: '3개월 내 바디 프로필 촬영 성공', description: '체계적인 식단과 운동으로 인생 최고의 몸매를 만들고 기록으로 남기기' },
  { id: 'health-002', category: '건강', title: '풀코스 마라톤 4시간 내 완주', description: '꾸준한 달리기 훈련으로 기초 체력 증진 및 완주의 성취감 달성' },
  { id: 'health-003', category: '건강', title: '100일 연속 매일 아침 명상 10분', description: '정신적 건강과 집중력을 높이기 위한 마음 챙김 연습 습관화' },
  { id: 'health-004', category: '건강', title: '체지방률 10%p 감량', description: '건강한 생활 습관 형성을 통한 확실한 체질 개선' },
  { id: 'health-005', category: '건강', title: '요가 지도자 자격증 취득', description: '유연성과 근력을 동시에 키워 전문가 수준의 몸의 균형 잡기' },
  { id: 'health-006', category: '건강', title: '하루 7.5시간 질 높은 수면 유지', description: '규칙적인 수면 패턴을 통해 최상의 컨디션 관리' },
  // 재무
  { id: 'finance-001', category: '재무', title: '순자산 1억 원 조기 달성', description: '절약과 저축을 통해 탄탄한 종잣돈 마련' },
  { id: 'finance-002', category: '재무', title: '연 수익률 15% 주식 포트폴리오 구축', description: '재무제표 분석과 시장 흐름 파악을 통한 스마트한 투자' },
  { id: 'finance-003', category: '재무', title: '월 200만원 자동화 수익 파이프라인 구축', description: '경제적 자유를 향한 비근로 소득 시스템 완성' },
  { id: 'finance-004', category: '재무', title: '지출 30% 절감 (가계부 1년 기록)', description: '불필요한 소비를 억제하고 자산 운용 효율 극대화' },
  { id: 'finance-005', category: '재무', title: '부동산 경매로 첫 수익 3000만원 창출', description: '자산 증식을 위한 실전 경매 지식 습득 및 성공적인 투자 경험' },
  { id: 'finance-006', category: '재무', title: '개인연금 저축 연 600만원 납입', description: '안정적인 노후 준비를 위한 전략적인 자산 운용' },
  // 창업
  { id: 'startup-001', category: '창업', title: '월 구독자 500명 SaaS 서비스 런칭', description: '실사용자가 있는 유료 구독형 소프트웨어 출시 및 수익화' },
  { id: 'startup-002', category: '창업', title: '정부 지원 자금 1억 원 확보', description: '비즈니스 모델의 타당성을 인정받고 사업 가속화를 위한 자금 마련' },
  { id: 'startup-003', category: '창업', title: '핵심 팀원 3명 영입 (MVP 개발)', description: '비전을 공유할 전문가들을 모아 서비스의 핵심 가치 구현' },
  { id: 'startup-004', category: '창업', title: '6개월 내 월 매출 1000만원 돌파', description: '빠른 실행력을 통해 수익 모델을 검증하고 성장을 가속화' },
  { id: 'startup-005', category: '창업', title: '시드 투자 2억 원 유치 성공', description: '전문 투자자로부터 비즈니스 가치를 인정받고 도약의 발판 마련' },
  { id: 'startup-006', category: '창업', title: '해외 사용자 1만 명 유치 (글로벌 진출)', description: '국내를 넘어 글로벌 시장에서의 경쟁력 확인' },
  // 교육
  { id: 'edu-001', category: '교육', title: '2년 내 석사 학위 취득', description: '전문 분야에 대한 깊이 있는 연구와 학술적 성과 달성' },
  { id: 'edu-002', category: '교육', title: '관련 분야 국가 공인 자격증 3개 취득', description: '업무 역량 강화를 위한 공신력 있는 전문 자격 확보' },
  { id: 'edu-003', category: '교육', title: 'OPIC AL 등급 획득 (영어 회화)', description: '비즈니스 수준의 외국어 습득을 통한 글로벌 소통 능력 증명' },
  { id: 'edu-004', category: '교육', title: '매주 1편 전문 칼럼 기고 (1년 지속)', description: '논리적인 글쓰기와 표현력을 키우며 전문가로서의 입지 구축' },
  { id: 'edu-005', category: '교육', title: '피아노 연주곡 5곡 마스터', description: '새로운 취미 활동을 통해 정서적 풍요로움과 성취감 획득' },
  { id: 'edu-006', category: '교육', title: '100명 규모의 독서 모임 운영', description: '함께 성장하는 커뮤니티를 구축하고 리더십 경험' },
  // 여행
  { id: 'travel-001', category: '여행', title: '1년 동안 20개국 세계 일주', description: '다양한 국가와 문화를 경험하며 인생의 새로운 시야 확보' },
  { id: 'travel-002', category: '여행', title: '제주도 한 달 살기 (기록집 발간)', description: '여유로운 일상을 보내며 나만의 이야기를 콘텐츠로 제작' },
  { id: 'travel-003', category: '여행', title: '유럽 10개 도시 배낭여행 완료', description: '역사와 예술이 숨 쉬는 도시들을 직접 체험하며 견문 확대' },
  { id: 'travel-004', category: '여행', title: '전국 캠핑장 30곳 탐방 달성', description: '자연 속에서 힐링하며 진정한 캠핑 전문가로 거듭나기' },
  { id: 'travel-005', category: '여행', title: '미슐랭 스타 레스토랑 5곳 방문 (미식 여행)', description: '최고의 미식 경험을 통해 새로운 감각과 영감 얻기' },
  { id: 'travel-006', category: '여행', title: '국토 종주 자전거 길 완주 (633km)', description: '한계를 극복하며 우리나라의 아름다운 풍경을 온몸으로 경험' },
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
