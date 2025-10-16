# 실무 수준 Best Practices

## 1. Repository Naming Convention
```
ibeanthere-{service}           # 서비스별 레포지토리
├── ibeanthere-fe              # Next.js 프론트엔드
├── ibeanthere-be              # FastAPI 백엔드
├── ibeanthere-shared          # 공유 타입 및 문서
└── ibeanthere-infrastructure  # 인프라 및 배포 (선택사항)
```

## 2. Branch Strategy (GitFlow)
```
main                    # 프로덕션 배포 브랜치
├── develop            # 개발 통합 브랜치
├── feature/auth       # 기능 개발 브랜치
├── hotfix/critical    # 긴급 수정 브랜치
└── release/v1.0.0     # 릴리스 준비 브랜치
```

## 3. API Versioning Strategy
```
/api/v1/               # 현재 버전
├── /auth/
├── /cafes/
└── /reviews/

/api/v2/               # 향후 버전 (하위 호환성 유지)
├── /auth/
├── /cafes/
└── /reviews/
```

## 4. Environment Management
```
Development    → localhost:3000 (frontend) + localhost:8000 (backend)
Staging        → staging.ibeanthere.com + api-staging.ibeanthere.com
Production     → ibeanthere.com + api.ibeanthere.com
```

## 5. Type Safety & Contract Testing
```typescript
// shared/types/api.ts
export interface CreateReviewRequest {
  cafeId: string;
  tasteRating: number;
  atmosphereRating: number;
  varietyRating: number;
  comment?: string;
  isPublic: boolean;
}

export interface CreateReviewResponse {
  id: string;
  userId: string;
  cafeId: string;
  createdAt: string;
}
```

```python
# shared/types/python/api_models.py
from pydantic import BaseModel
from typing import Optional

class CreateReviewRequest(BaseModel):
    cafe_id: str
    taste_rating: int
    atmosphere_rating: int
    variety_rating: int
    comment: Optional[str] = None
    is_public: bool = True

class CreateReviewResponse(BaseModel):
    id: str
    user_id: str
    cafe_id: str
    created_at: str
```

## 6. CI/CD Pipeline
```
Frontend: GitHub → Vercel (자동 배포)
Backend:  GitHub → Render (자동 배포)
Shared:   GitHub → 타입 동기화 워크플로우
```

## 7. Monitoring & Observability
```
Frontend: Vercel Analytics + Sentry
Backend:  Render Logs + Sentry
Database: Supabase Dashboard
```

## 8. Security Best Practices
- **Environment Variables**: 모든 시크릿을 env 변수로 관리
- **CORS**: 프론트엔드 도메인만 허용
- **JWT**: Supabase Auth 토큰 검증
- **Rate Limiting**: API 엔드포인트별 요청 제한
- **Input Validation**: Pydantic 모델로 데이터 검증

## 9. Development Workflow
```bash
# 1. 기능 개발 시작
git checkout develop
git pull origin develop
git checkout -b feature/user-authentication

# 2. 프론트엔드 개발
cd fe
npm run dev

# 3. 백엔드 개발 (별도 터미널)
cd be
uvicorn app.main:app --reload

# 4. 타입 동기화
cd shared
npm run sync-types

# 5. 테스트 실행
npm run test  # frontend
pytest       # backend

# 6. PR 생성 및 리뷰
git push origin feature/user-authentication
# GitHub에서 PR 생성
```

## 10. 실무 수준 장점
- **독립적 배포**: 프론트엔드와 백엔드가 독립적으로 배포 가능
- **팀 협업**: 프론트엔드/백엔드 팀이 동시에 작업 가능
- **기술 스택 분리**: 각 서비스에 최적화된 기술 스택 사용
- **확장성**: 서비스별로 독립적인 스케일링
- **유지보수성**: 명확한 책임 분리로 유지보수 용이
