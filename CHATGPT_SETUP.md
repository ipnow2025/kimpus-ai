# 🤖 ChatGPT API 연결 가이드

## 🚨 필수 구현 부분

이 프로젝트의 AI 기능을 사용하려면 ChatGPT API 연결이 필요합니다.

### 1. OpenAI API 키 발급
1. [OpenAI Platform](https://platform.openai.com/) 접속
2. API Keys 메뉴에서 새 API 키 생성
3. 생성된 키를 안전하게 보관

### 2. 환경변수 설정
\`\`\`bash
# .env 파일에 추가
OPENAI_API_KEY=sk-your-actual-api-key-here
\`\`\`

### 3. 의존성 설치
\`\`\`bash
npm install openai
\`\`\`

### 4. 구현 필요 파일들

#### 🔧 핵심 구현 파일
- `lib/openai-client.ts` - ChatGPT API 클라이언트 (🚨 필수 구현)
- `app/api/ai/generate/route.ts` - AI 생성 API 라우트 (🚨 필수 구현)

#### 🔧 연결 필요 부분
- `components/views/AIAssistantView.tsx` - AI 어시스턴트 뷰
- `app/api/chat/[teamId]/route.ts` - 팀 채팅 AI 기능

### 5. 테스트 방법
1. 개발 서버 실행: `npm run dev`
2. AI 어시스턴트 탭에서 과제 생성 테스트
3. 팀 채팅에서 "@AI" 멘션 테스트

### 6. 비용 관리
- OpenAI API는 사용량에 따라 과금됩니다
- 개발 환경에서는 적은 max_tokens 설정 권장
- 프로덕션에서는 사용량 모니터링 필수

### 7. 에러 처리
현재 구현된 에러 처리:
- API 키 없음
- 요청 한도 초과
- 네트워크 오류
- 잘못된 요청 형식

## 🚨 주의사항
- API 키는 절대 클라이언트 사이드에 노출하지 마세요
- 환경변수로만 관리하세요
- .env 파일은 .gitignore에 포함되어 있습니다
