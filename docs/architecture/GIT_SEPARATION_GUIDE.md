# Git Repository 분리 가이드

## 🎯 목표
단일 레포지토리를 3개의 독립적인 레포지토리로 분리:
- `ibeanthere-fe` (Frontend)
- `ibeanthere-be` (Backend)  
- `ibeanthere-shared` (Shared Types)

## 📋 단계별 분리 과정

### 1단계: GitHub 레포지토리 생성
```bash
# GitHub에서 다음 레포지토리들을 생성
# https://github.com/your-username/ibeanthere-fe.git
# https://github.com/your-username/ibeanthere-be.git
# https://github.com/your-username/ibeanthere-shared.git
```

### 2단계: 현재 레포지토리 백업
```bash
# 현재 작업 백업
cd /Users/chae/Projects/IBeanThere
git add .
git commit -m "feat: prepare for repository separation"
git push origin main
```

### 3단계: 각 레포지토리로 코드 분리

#### Frontend Repository (`ibeanthere-fe`)
```bash
# Frontend 레포지토리 클론
git clone https://github.com/your-username/ibeanthere-fe.git
cd ibeanthere-fe

# 현재 프로젝트에서 frontend 관련 파일들 복사
cp -r ../IBeanThere/frontend/* .
cp -r ../IBeanThere/docs/architecture/frontend-structure.md ./docs/
cp ../IBeanThere/.cursor/rules/frontend-nextjs.mdc ./.cursor/rules/

# Git 설정
git add .
git commit -m "feat: initial frontend setup"
git push origin main
```

#### Backend Repository (`ibeanthere-be`)
```bash
# Backend 레포지토리 클론
git clone https://github.com/your-username/ibeanthere-be.git
cd ibeanthere-be

# 현재 프로젝트에서 backend 관련 파일들 복사
cp -r ../IBeanThere/backend/* .
cp -r ../IBeanThere/docs/architecture/backend-structure.md ./docs/
cp ../IBeanThere/.cursor/rules/backend-fastapi.mdc ./.cursor/rules/

# Git 설정
git add .
git commit -m "feat: initial backend setup"
git push origin main
```

#### Shared Repository (`ibeanthere-shared`)
```bash
# Shared 레포지토리 클론
git clone https://github.com/your-username/ibeanthere-shared.git
cd ibeanthere-shared

# 공유 타입 및 문서 복사
cp -r ../IBeanThere/docs/architecture/shared-structure.md ./docs/
cp -r ../IBeanThere/.cursor/rules/database-supabase.mdc ./.cursor/rules/

# Git 설정
git add .
git commit -m "feat: initial shared types and docs"
git push origin main
```

### 4단계: 개발 환경 설정

#### 워크스페이스 생성
```bash
# 개발 워크스페이스 생성
mkdir IBeanThere-workspace
cd IBeanThere-workspace

# 각 레포지토리를 심볼릭 링크로 연결
ln -s ../ibeanthere-fe fe
ln -s ../ibeanthere-be be
ln -s ../ibeanthere-shared shared

# 개발 시작
cd fe && npm install && npm run dev
cd be && pip install -r requirements.txt && uvicorn app.main:app --reload
```

## 🔄 대안: Git Subtree 사용

### 더 고급 방법 (Git Subtree)
```bash
# 현재 레포지토리에서 각 서브트리 추출
git subtree push --prefix=frontend origin ibeanthere-fe:main
git subtree push --prefix=backend origin ibeanthere-be:main
git subtree push --prefix=shared origin ibeanthere-shared:main
```

## 📝 주의사항

1. **환경 변수**: 각 레포지토리별로 `.env.example` 파일 생성
2. **CI/CD**: 각 레포지토리별 GitHub Actions 워크플로우 설정
3. **의존성**: 각 레포지토리의 `package.json`, `requirements.txt` 확인
4. **문서**: 각 레포지토리에 해당하는 README.md 작성

## 🎯 결과

분리 후 각 레포지토리는 독립적으로:
- 개발 가능
- 배포 가능  
- 버전 관리 가능
- 팀 협업 가능
