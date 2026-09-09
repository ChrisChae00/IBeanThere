# IBeanThere 웹 애플리케이션 보안 점검 보고서

- 점검일: 2026-09-09
- 기준 커밋: `f4d54a2`
- 범위: 기준 커밋과 점검 당시 로컬 미커밋 변경
- 후속 기준: 점검 대상 미커밋 변경과 이 보고서는 `4f95bfe`에 포함되었다. 이 커밋은 보안 수정 완료를 의미하지 않는다.
- 대상: Next.js 프론트엔드, FastAPI 백엔드, Supabase 인증·Data API·Storage 정책, 외부 API 연동, 의존성
- 점검 방식: 소스·설정·SQL·테스트·문서 검토, 외부 연결을 막은 로컬 테스트, 가짜 DB를 사용한 API 재현, 의존성 취약점 조회

## 결론

문서 동기화(2026-09-09): `4f95bfe`의 특성 제안 승인, 로그 생성 시 특성 즉시 반영,
카페 태그 무효화는 원래 점검 대상에 이미 포함된 구현이다. 따라서 SEC-07과 SEC-10을
포함한 기존 발견 사항을 해결 상태로 바꾸지 않는다. 커밋 전 백엔드 59개 테스트와
프론트엔드 프로덕션 빌드 통과 기록은 기능 검증이며, 보안 재검증이나 운영 설정 확인을
대신하지 않는다. 이번 문서 갱신에서는 외부 취약점 조회와 운영 검증을 다시 수행하지 않았다.

현재 상태에서는 공개 출시 확대 전에 보안 보완이 필요하다.

익명 로그가 작성자와 다시 연결되는 경로, 위치 증거가 없는 일반 로그에서 카페 특성이 즉시 승인되는 경로, 비공개 로그에 타인이 좋아요를 생성하는 경로를 로컬에서 재현했다. 관리자 역할 보호 SQL은 운영 권한 구성에 따라 일반 계정의 관리자 승격을 막지 못할 수 있다. 사용자 사진과 신고 첨부의 공개 범위, Supabase Data API 직접 접근 정책에도 운영 확인이 필요한 중대한 위험이 있다.

프론트엔드의 고정된 Next.js 버전 `15.5.23`은 2026년 8월 공개된 Critical 보안 공지의 영향 범위에 들어간다. 공식 패치 버전은 `15.5.24`다.

## 제품 방향과 위협 모델

제품은 기존의 "독립 카페를 개척하고 방문 순서를 기록하는 앱"에서 다음 약속으로 전환 중이다.

> 좋았던 한 잔을 기억하고, 다음에 마실 커피와 살 원두를 찾는 지도.

새 방향에서는 다음 자산의 보호가 중요하다.

- 개인 커피 기록의 비공개·익명성
- 카페에서 판매하거나 사용하는 원두 정보의 신뢰성
- 사용자 사진과 위치 이력
- 관리자 승인과 카페 검증 상태
- Google Places, 지도 서비스, 이메일, Storage의 비용과 가용성
- 공유 컬렉션 토큰과 비공개 메모

기존 커뮤니티 피드, 성장 기록, 뱃지, 공개 사진, 공유 기능이 여전히 남아 있다. 새 로그의 공개 범위가 이 잔여 경로 전체에서 일관되게 적용되는지를 중점적으로 검사했다.

## 판정 기준

- **확인**: 현재 소스 또는 로컬 재현으로 동작을 확인했다.
- **조건부**: 위험한 코드나 SQL은 확인했지만 운영 DB·버킷·배포 설정을 확인해야 실제 노출을 확정할 수 있다.
- **미확인**: 운영 콘솔, 배포 인프라 또는 외부 시스템 접근이 필요해 이번 점검에서 확인하지 않았다.

이 보고서의 우선순위는 공격 난이도, 노출 데이터, 권한 상승 가능성, 비용·서비스 장애 가능성, 현재 제품 방향과의 충돌을 함께 고려했다.

## 주요 발견 사항

### SEC-01. 알려진 Next.js 원격 코드 실행 취약점 영향 버전

- 심각도: **Critical**
- 상태: **확인**
- 관련 코드: `apps/fe/package-lock.json`, `apps/fe/next.config.js`

현재 lockfile은 Next.js `15.5.23`, sharp `0.34.5`를 사용한다. Next.js 공식 공지에 따르면 `15.5.24` 미만은 공격자가 제어하는 AVIF 이미지를 이미지 최적화 API에서 처리할 때 원격 코드 실행으로 이어질 수 있는 취약점의 영향 범위에 포함된다.

이 앱은 Supabase Storage의 원격 이미지를 Next.js 이미지 최적화 대상으로 허용한다. 프론트엔드 파일 선택기는 AVIF를 허용하지 않지만 이것만으로 Storage 직접 업로드, 파일 확장자 위장, 서버의 실제 파일 내용 처리까지 막았다고 볼 수 없다.

권고:

1. Next.js를 최소 `15.5.24` 이상으로 갱신하고 lockfile을 반영한다.
2. sharp를 포함한 결과 의존성 버전을 다시 감사한다.
3. Supabase 버킷에서 AVIF 및 허용하지 않는 MIME 업로드가 서버 측에서도 차단되는지 확인한다.
4. 배포 환경이 실제로 Next.js 이미지 최적화를 수행하는지 확인한다.

완료 기준:

- `npm audit --omit=dev`에서 해당 Next.js Critical 항목이 사라진다.
- 악성 확장자·MIME 조합의 업로드가 버킷에서 거부된다.

참고:

- <https://nextjs.org/blog/august-2026-security-release>
- <https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4>

### SEC-02. 관리자 역할 컬럼 보호가 충분하지 않을 가능성

- 심각도: **Critical**
- 상태: **조건부**
- 관련 코드: `apps/be/scripts/migrations/006_protect_user_role.sql`, `apps/be/app/api/deps.py`

역할 보호 마이그레이션은 다음 컬럼 단위 권한 회수만 수행한다.

```sql
REVOKE UPDATE (role) ON public.users FROM authenticated;
```

PostgreSQL에서는 `authenticated` 역할에 테이블 전체 `UPDATE` 권한이 남아 있으면 특정 컬럼의 `REVOKE UPDATE`가 테이블 권한을 무효화하지 않는다. 기존 RLS는 사용자가 자기 행을 업데이트할 수 있게 하고, 백엔드는 `public.users.role`을 관리자 판단에 사용한다.

운영 권한이 이 구성이라면 가능한 공격 흐름은 다음과 같다.

```text
일반 사용자 JWT
  -> Supabase Data API로 자신의 users 행 role 수정
  -> 백엔드가 수정된 role을 조회
  -> 관리자 API 접근
```

운영 계정의 실제 승격은 시도하지 않았다.

권고:

1. 운영 DB에서 `anon`, `authenticated`의 테이블·컬럼 권한을 조회한다.
2. 프로필 변경이 백엔드를 통해서만 이루어진다면 클라이언트 역할의 `users` 직접 쓰기를 제거한다.
3. 직접 쓰기가 필요하면 테이블 `UPDATE` 권한을 회수하고 허용 컬럼만 다시 부여한다.
4. `role` INSERT와 UPDATE를 모두 일반 사용자가 수행할 수 없는지 검사한다.
5. 일반 JWT로 역할 변경이 실패하고 관리자 JWT만 가능한 DB 회귀 테스트를 추가한다.

참고:

- <https://supabase.com/docs/guides/database/postgres/column-level-security>
- <https://www.postgresql.org/docs/current/sql-grant.html>

### SEC-03. 익명 로그의 작성자 식별 정보 노출

- 심각도: **High**
- 상태: **확인·재현됨**
- 관련 코드: `apps/be/app/api/v1/cafes.py`, `apps/be/app/api/v1/community.py`, `apps/be/app/models/cafe.py`

익명 로그가 API 경로에 따라 다르게 처리된다.

| 경로 | 동작 |
|---|---|
| `GET /api/v1/cafes/{id}/logs` | 공개 모델에서 작성자 UUID를 제외한다. |
| `GET /api/v1/cafes/{id}` | 표시명은 `Anonymous`로 바꾸지만 `recent_logs[].user_id`는 그대로 반환한다. |
| `GET /api/v1/community/feed` | `anonymous`를 확인하지 않고 username, display name, avatar, user ID를 반환한다. |

로컬 가짜 DB에 익명 로그를 넣어 다음을 재현했다.

- 카페 상세 API가 HTTP 200으로 작성자 UUID를 반환했다.
- 해당 작성자를 신뢰하는 계정의 피드가 HTTP 200으로 username을 반환했다.

피드는 특정 사용자가 작성한 로그를 기준으로 먼저 조회하기 때문에 화면에서 이름만 `Anonymous`로 바꾸어도 작성자가 추론된다.

권고:

1. 공개 로그 응답 생성기를 한곳으로 통합한다.
2. 익명 로그에는 `user_id`, username, display name, avatar URL이 절대 포함되지 않게 한다.
3. 사용자 관계를 기준으로 구성하는 커뮤니티 피드에서는 익명 로그를 제외한다.
4. 상세, 피드, 검색 미리보기, SEO, 공유 페이지를 같은 테스트 행렬로 검사한다.

완료 기준:

- 익명 로그의 모든 공개 응답에서 작성자 식별 필드가 없다.
- 익명 작성자를 신뢰하는 사용자도 피드에서 해당 로그를 통해 작성자를 추론할 수 없다.

### SEC-04. Supabase Data API에서 이메일·위치·활동 이력 노출 가능성

- 심각도: **High**
- 상태: **조건부**
- 관련 코드: `apps/be/scripts/fix_supabase_security_issues.sql`, `apps/be/scripts/create_drop_bean_tables.sql`

로컬 SQL에는 다음 정책이 존재한다.

| 테이블 | 정책 | 위험 |
|---|---|---|
| `users` | 모든 행 SELECT 허용 | 이메일과 역할까지 직접 조회될 가능성 |
| `cafe_visits` | 공개 로그 행 SELECT 허용 | 익명 로그의 작성자 ID와 체크인 좌표 노출 가능성 |
| `cafe_beans` | 모든 행 SELECT 허용 | 사용자별 방문 관계, 마지막 좌표, 시각 노출 가능성 |
| `cafe_bean_drops` | 모든 행 SELECT 허용 | 사용자별 위치와 시각 이력 노출 가능성 |
| `cafes` | 인증 사용자 INSERT, navigator UPDATE | 백엔드 등록 검증과 관리자 필드 제한 우회 가능성 |

백엔드 응답 모델이 필드를 숨겨도 Supabase Data API 직접 조회가 열려 있으면 보호되지 않는다. 비공개 로그를 저장할 때도 `cafe_beans`가 자동 생성·갱신되므로 로그 본문을 숨긴 뒤 방문 사실이 다른 테이블에서 드러날 수 있다.

권고:

1. 운영의 실제 RLS와 GRANT를 SQL로 내보내 로컬 정의와 비교한다.
2. 백엔드 전용 테이블은 `anon`, `authenticated`의 직접 접근을 회수한다.
3. 공개 프로필과 공개 활동은 필요한 필드만 담는 별도 뷰나 API 응답으로 제공한다.
4. 위치 필드는 소유자와 제한된 관리자만 읽을 수 있게 한다.
5. `anon`, 일반 사용자, 소유자, 관리자별 SELECT·INSERT·UPDATE·DELETE 허용/거부 테스트를 만든다.

### SEC-05. 비공개·익명 사진과 신고 첨부의 공개 URL 사용

- 심각도: **High**
- 상태: **조건부**
- 관련 코드: `apps/fe/src/shared/lib/supabase/storage.ts`, `apps/fe/src/features/report/data/ReportRepository.ts`, `apps/be/scripts/create_cafe_images_bucket.sql`

로그 사진은 공개 `cafe-images` 버킷에 업로드하고 `getPublicUrl()`을 반환한다. 경로에는 작성자 UUID가 포함된다.

위험:

- 비공개 로그 사진도 URL을 가진 누구나 접근할 수 있다.
- 익명 로그 사진 URL의 UUID가 프로필이나 다른 활동과 연결될 수 있다.
- 버킷의 객체 SELECT 정책이 공개되어 있으면 파일 목록 접근 가능성도 있다.
- 신고 첨부도 공개 URL을 만들며, 신고 버킷의 실제 공개 설정은 확인되지 않았다.
- 프론트엔드 검사는 Storage 직접 업로드를 통제하지 못한다.

권고:

1. 비공개 로그와 신고 첨부를 private 버킷으로 이동한다.
2. 다운로드 시 사용자 권한을 확인하거나 짧은 signed URL을 발급한다.
3. 익명 공개 사진의 외부 경로에 작성자 UUID를 사용하지 않는다.
4. 버킷 수준에서 허용 MIME, 최대 파일 크기, 사용자별 저장 총량을 제한한다.
5. 기존 공개 URL을 비공개로 철회할 마이그레이션 절차를 준비한다.

참고: <https://supabase.com/docs/guides/storage/buckets/fundamentals>

### SEC-06. 공유 컬렉션 토큰과 비공개 컬렉션 노출

- 심각도: **High**
- 상태: **확인 및 조건부**
- 관련 코드: `apps/be/scripts/create_cafe_collections.sql`, `apps/be/app/api/v1/users.py`, `apps/be/app/models/collection.py`

SQL 정책은 공유 토큰이 요청의 토큰과 일치하는지를 확인하지 않고 `share_token IS NOT NULL`인 모든 컬렉션의 SELECT를 허용한다. SELECT 권한까지 남아 있으면 토큰을 모르는 사용자도 Data API를 통해 공유 컬렉션을 조회할 수 있다.

API에서도 사용자 수준 `collections_public=true`이면 컬렉션별 `is_public=false`를 필터링하지 않고 `share_token`을 응답에 포함한다.

로컬 재현에서는 공개 컬렉션 목록 API가 다음 값을 반환했다.

```text
is_public=false
share_token=audit-private-token
```

권고:

1. 공개 사용자 목록은 `is_public=true`인 컬렉션만 반환한다.
2. 공개 응답 모델에서 `share_token`을 제거한다.
3. 토큰 조회는 실제 토큰을 일치시키는 백엔드 API로 한정한다.
4. 공유 링크 해제 시 토큰을 즉시 폐기한다.
5. 비공개 컬렉션 메모가 일반 Data API에서 읽히지 않는지 검사한다.

### SEC-07. 카페 특성 관리자 승인 우회

- 심각도: **High**
- 상태: **확인·재현됨**
- 관련 코드: `apps/be/app/api/v1/visits.py`, `apps/be/app/services/traits.py`

카페 상세에서 제출하는 특성 제안은 `pending`으로 저장된다. 그러나 로그 작성의 `sells_beans` 값은 즉시 `approved`로 저장된다. 백엔드는 다음 조건을 검사하지 않는다.

- 로그가 `purchase` 모드인지
- 실제 위치가 제공됐는지
- 위치가 카페 반경 안인지
- 로그가 공개인지

로컬에서 다음 요청이 HTTP 201로 성공하고 `approved` 상태의 부정 관찰을 생성했다.

```text
mode=drink
is_public=false
check_in_lat/check_in_lng 없음
sells_beans=false
```

이 관찰은 지도 필터가 사용하는 현재 특성 상태를 바꿀 수 있다.

권고:

1. 자동 승인 조건을 서버에서 명시적으로 검사한다.
2. 최소한 `purchase` 모드와 유효한 위치 증거가 모두 있을 때만 자동 승인한다.
3. 한 명의 관찰이 공개 지도 상태를 즉시 뒤집을 수 있는 정책을 다시 검토한다.
4. 일반 로그 입력과 공개 카페 정보 변경을 별도 명령으로 분리하는 방안을 고려한다.

완료 기준:

- 일반 drink 로그, 좌표 없는 로그, 비정상 좌표 로그가 승인 관찰을 만들지 못한다.
- 카페 상세 제안 경로는 계속 `pending`으로 남는다.

### SEC-08. 봇 공격과 외부 비용 소모 방어 부족

- 심각도: **High**
- 상태: **확인 및 운영 확인 필요**
- 관련 코드: `apps/be/app/core/rate_limit.py`, `apps/be/app/api/v1/cafes.py`, `apps/be/app/services/google_places_service.py`

기본 `60/minute` 제한은 로컬에서 동작했다. 같은 경로의 61번째 요청은 429였고 다른 경로는 계속 200이었다. 저장소는 프로세스 메모리이므로 여러 인스턴스가 공통 한도를 공유하지 않는다.

주요 공격 경로:

| 경로 | 조건 | 영향 |
|---|---|---|
| Supabase 가입·로그인·비밀번호 복구 | 비로그인 | 계정 대량 생성, credential stuffing, 복구 메일 악용 |
| `/cafes/osm/search`, `/osm/reverse` | 비로그인 | 공용 Nominatim 용량 점유, 정상 등록 대기 |
| `/cafes/{id}/google-photo` | 비로그인, 기능 활성화 | 월간 사진 한도 소모, 정상 사용자 사진 차단 |
| `/cafes/google-places/lookup` | 일반 계정 | Google Places 요청 비용 발생 |
| `/roasters`, `/beans` POST | 일반 계정 | 공유 카탈로그 대량 오염 |
| `/cafes/{id}/visit` | 일반 계정 | 평점·활동·성장 기록 오염 |
| `/reports` POST | 일반 계정 | 신고 큐와 알림 메일 적체 |
| Supabase Storage | 일반 계정 | FastAPI 제한을 우회한 저장공간 소모 |
| `revalidateCafe` Server Action | 공개 HTTP 진입점 | 캐시 무효화 반복과 백엔드 재조회 부하 |

Google 사진용 월 900회 캡은 일반 Places lookup에는 적용되지 않는다. 일반 lookup은 현재 가격 체계에서 높은 SKU를 발생시킬 수 있는 전화번호와 영업시간 필드를 요청한다. 사진 경로도 월간 캡을 확인하기 전에 `get_first_photo()`를 호출한다.

권고:

1. 비용·쓰기 경로에 IP 제한과 계정별 일일 제한을 함께 적용한다.
2. 여러 인스턴스가 공유하는 원자적 저장소에서 한도를 관리한다.
3. 전체 서비스 한도와 kill switch를 외부 API 호출 전에 검사한다.
4. Google field mask를 현재 화면에 필요한 필드만 남긴다.
5. Supabase Auth 가입·로그인·비밀번호 복구에 CAPTCHA와 대시보드 rate limit을 적용한다.
6. Storage에도 사용자별 크기·파일 수·기간 한도를 적용한다.

참고:

- <https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/>
- <https://owasp.org/API-Security/editions/2023/en/0xa6-unrestricted-access-to-sensitive-business-flows/>
- <https://supabase.com/docs/guides/auth/auth-captcha>

### SEC-09. 작은 요청 수로 큰 서버 부하를 만드는 경로

- 심각도: **Medium~High**
- 상태: **확인**
- 관련 코드: `apps/be/app/api/v1/community.py`, `apps/be/app/services/osm_service.py`, `apps/be/app/models/visit.py`

주요 문제:

- 다수의 `async def` 엔드포인트 안에서 동기 Supabase `.execute()`를 직접 호출한다.
- 커뮤니티 피드는 항목마다 좋아요 수와 현재 사용자의 좋아요를 따로 조회한다. 50개 피드면 좋아요 관련 조회만 최대 100회다.
- 모든 Nominatim 호출이 하나의 프로세스 잠금 뒤에 서지만 대기열 길이 제한이 없다.
- 로그 모델은 `atmosphere_tags` 항목 수와 각 문자열 길이를 제한하지 않는다.
- `photo_urls`는 URL 형식을 검증하지 않는다.
- 카페 등록의 이름, 주소, 설명 등 여러 문자열에 최대 길이가 없다.

로컬 모델 생성에서 태그 1,000개와 URL이 아닌 사진 문자열이 허용되는 것을 확인했다.

권고:

1. 피드 좋아요 집계를 한 번의 일괄 조회나 DB 집계로 바꾼다.
2. 동기 DB 호출이 이벤트 루프를 막지 않도록 실행 모델을 통일한다.
3. HTTP 본문 크기, 배열 길이, 각 원소 길이, 문자열 길이를 서버에서 제한한다.
4. 외부 API 대기열과 요청별 총 실행 시간에 상한을 둔다.
5. 느린 요청 수, DB 호출 수, 외부 API 대기 시간을 관측한다.

### SEC-10. 공개 철회와 캐시 무효화 불일치

- 심각도: **Medium**
- 상태: **확인**
- 관련 코드: `apps/fe/src/lib/api/cafes.ts`, `apps/fe/src/app/actions/cafe.ts`, `apps/fe/src/app/[locale]/my-logs/MyLogsClient.tsx`, `apps/be/app/api/v1/visits.py`

카페 상세은 요청에 사용한 식별자로 캐시 태그를 만든다. slug 조회는 `cafe-{slug}`, 로그 수정 후 무효화는 `cafe-{UUID}`를 사용한다. 두 태그가 달라 공개였던 로그가 slug 상세 캐시에 남을 수 있다.

관리자 이미지 backfill은 공개 방문 사진 URL을 `cafes.main_image`로 복사한다. 원본 로그가 비공개로 바뀌거나 삭제돼도 복사된 URL을 철회하는 연결 정보가 없다.

추가된 `revalidateCafe` Server Action에는 인증, 권한, 입력 검사가 없다. Server Action은 공개 API와 같은 보안 경계로 취급해야 한다.

권고:

1. 카페 캐시 태그를 내부 UUID 하나로 통일한다.
2. 로그 공개 범위 변경과 삭제 시 관련 상세·목록·원두·사진 캐시를 서버에서 함께 무효화한다.
3. 대표 이미지의 출처 로그 ID를 저장하거나 공개 상태에서 직접 파생한다.
4. Server Action 내부에서 인증·권한·식별자 형식을 검사한다.

참고: <https://nextjs.org/docs/15/app/guides/data-security>

### SEC-11. 비공개 로그 좋아요와 신고 메일 HTML 주입

- 심각도: **Medium**
- 상태: **확인·재현됨**
- 관련 코드: `apps/be/app/api/v1/community.py`, `apps/be/app/services/email.py`

좋아요 API는 방문 행의 존재와 작성자만 확인하고 `is_public`을 확인하지 않는다. 로컬에서 타인이 알고 있는 비공개 로그 ID에 좋아요를 생성해 HTTP 201을 받았다. 로그 본문이 반환된 것은 아니지만 비공개 객체에 대한 쓰기 권한 검사 누락이다.

신고 알림 메일은 사용자 입력 설명과 target URL을 HTML에 그대로 삽입한다. 가짜 메일 전송기를 사용한 로컬 재현에서 사용자 제공 `<a>` 태그가 메일 HTML에 그대로 포함됐다. 실제 메일은 전송하지 않았다.

권고:

1. 좋아요와 좋아요 수 조회 전에 로그의 공개·접근 권한을 확인한다.
2. 비공개 전환 시 기존 좋아요를 보존할지 삭제할지 정책을 정한다.
3. 메일에 삽입하는 모든 사용자 문자열을 HTML escape 한다.
4. 링크는 `https` 등 허용 스킴과 필요한 호스트 범위를 검증한다.

### SEC-12. 위치·일일 제한의 서버 보장 부족

- 심각도: **Medium**
- 상태: **확인**
- 관련 코드: `apps/be/app/api/v1/visits.py`, `apps/be/app/api/v1/cafes.py`, `apps/be/app/api/v1/users.py`

GPS 좌표는 클라이언트가 전송한 값이므로 위조할 수 있다. 위치 일관성 검사는 의심 활동을 기록할 뿐 차단하지 않는다. 일반 로그는 좌표 없이도 작성할 수 있으며 그 결과 성장 기록과 특성 관찰 같은 공개 파생 상태가 변한다.

드롭, 조회수, trust의 일일 제한은 대체로 "조회 후 쓰기"라 동시 요청에서 경쟁 조건이 생길 수 있다. trust 카운터 조회 오류는 0을 반환하므로 제한이 fail-open 된다.

권고:

1. 위치 증거가 필요한 공개 효과와 개인 기록 저장을 분리한다.
2. 일일 제한은 DB UNIQUE 제약 또는 원자적 함수로 보장한다.
3. 제한 상태 조회 실패 시 쓰기를 허용할지 명시적으로 결정한다.
4. GPS 위조를 완전히 방지한다고 표현하지 말고 탐지·완화 수준을 문서화한다.

### SEC-13. 레거시 엔드포인트와 문서 불일치

- 심각도: **Low~Medium**
- 상태: **확인**
- 관련 코드: `apps/be/app/api/v1/auth.py`, `README.md`, `.gitignore`

다음 엔드포인트는 실제 인증 작업을 하지 않고 성공 메시지만 반환한다.

- `/auth/logout`
- `/auth/refresh`
- `/auth/forgot-password`
- `/auth/reset-password`

프론트엔드는 Supabase Auth를 직접 사용하므로 미사용이면 제거하는 편이 공격 표면과 오해를 줄인다.

README에는 Next.js 14, 프랜차이즈 차단, 개척 경쟁 중심 설명이 남아 있어 현재 방향과 다르다. 또한 중요한 보안·스키마 SQL 대부분이 `.gitignore`로 제외되어 새 환경에서 운영 정책을 재현하기 어렵다.

권고:

1. 미사용 인증 엔드포인트를 호출 검색 후 삭제한다.
2. 현재 제품 방향과 실제 보안 수준에 맞게 README를 갱신한다.
3. 운영에 필수인 마이그레이션은 재현 가능한 방식으로 버전 관리한다.
4. API 문서에서 실제 rate limit, 공개 범위, 외부 비용 경로를 명시한다.

## 긍정적으로 확인한 방어

- Supabase에 토큰 유효성을 확인하며 단순 JWT payload 디코딩만으로 인증하지 않는다.
- 일반 사용자의 관리자 API 접근은 로컬에서 403을 반환했다.
- 타인 로그 수정·삭제 전에 소유자 검사를 수행한다.
- 카페 상세 공개 로그와 원두 집계에 공통 `public_logs` 필터를 사용하려는 구조가 있다.
- Google 사진 기능은 기본 비활성화이며 월간 예약 함수와 no-store 응답을 사용한다.
- Nominatim 호출은 프로세스 단위 직렬화, 간격 제한, 캐시를 사용한다.
- 프론트엔드에는 HSTS, frame 차단, MIME sniffing 방지, 기본 CSP가 있다.
- 현재 Git 추적 파일의 대표 비밀키 패턴 검사에서 키를 발견하지 못했다.
- Google 사진·백필, 로그 프라이버시, 소유권, OSM 제한에 대한 테스트가 존재한다.

이 항목들은 전체 안전성을 보장하지 않는다. 예를 들어 공개 로그 필터가 존재해도 피드와 성장 기록이 같은 필터를 쓰지 않으면 프라이버시가 깨진다.

## Webapp 보안 체크리스트

| 점검 영역 | 결과 | 후속 조치 |
|---|---|---|
| 인증 토큰 검증 | 부분 양호 | Supabase Auth 설정과 세션 폐기 확인 |
| 관리자 권한 | 실패 가능 | 운영 DB role 권한 즉시 확인 |
| 객체 소유권 | 부분 양호 | 좋아요·공유·비공개 파생 객체 보강 |
| 공개/비공개 로그 | 미흡 | 모든 소비 경로에 공통 정책 적용 |
| 익명성 | 실패 | UUID·프로필·사진 경로 제거 |
| RLS/GRANT | 중요 위험 | 운영 권한 덤프와 역할별 DB 테스트 |
| 공유 토큰 | 실패 가능 | 토큰 없는 직접 SELECT 제거 |
| 입력 검증 | 미흡 | 본문·배열·문자열·URL 길이 제한 |
| 업로드 검증 | 미흡 | 버킷 수준 MIME·크기·총량 제한 |
| 파일 공개 범위 | 실패 가능 | private 버킷과 signed URL 적용 |
| SQL/명령 주입 | 뚜렷한 악용 미확인 | 문자열 PostgREST 필터 회귀 검사 |
| SSRF | 보완 필요 | URL 호스트 정확 비교, 리다이렉트 재검증 |
| XSS/HTML 주입 | 부분 실패 | 메일 HTML escape, JSON-LD 안전성 유지 |
| CSRF/CORS | 부분 양호 | 운영 CORS origin과 Server Action 검증 |
| 보안 헤더 | 부분 양호 | CSP의 `unsafe-inline`, `unsafe-eval` 축소 |
| Rate limit | 부분 양호 | 공유 저장소와 계정·서비스 한도 추가 |
| Bot/abuse | 미흡 | Auth CAPTCHA, 쓰기 경로 제한, WAF 검토 |
| 외부 API 비용 | 미흡 | 모든 Google SKU의 공통 선예약·kill switch |
| 캐시 프라이버시 | 미흡 | UUID 태그 통일, 공개 철회 전파 |
| 동시성 | 미흡 | DB 원자적 카운터와 UNIQUE 제약 |
| 의존성 | 실패 | Next.js 및 Python 의존성 갱신 |
| 비밀 관리 | 제한적 양호 | Git 이력·CI 로그·배포 env 별도 검사 |
| 로깅·감사 | 확인 필요 | 운영 로그 접근·보존·PII 마스킹 확인 |
| 백업·복구 | 미확인 | Supabase 백업과 복구 훈련 확인 |
| WAF·DDoS | 미확인 | Vercel/Render/Supabase 실제 설정 확인 |

## 테스트 및 검사 결과

| 검사 | 결과 |
|---|---|
| 기존 Python `unittest` | 59개 통과 |
| 주소·OSM rate gate·Overpass 독립 검사 | 3개 스크립트 통과 |
| 익명 카페 상세 응답 | 작성자 UUID 노출 재현, HTTP 200 |
| 익명 커뮤니티 피드 | username 노출 재현, HTTP 200 |
| 위치 없는 일반 로그의 특성 승인 | `approved` 관찰 생성 재현, HTTP 201 |
| 비공개 로그에 타인 좋아요 | 생성 재현, HTTP 201 |
| 공개 프로필의 비공개 컬렉션 토큰 | 노출 재현, HTTP 200 |
| 일반 사용자 관리자 접근 | 거부 확인, HTTP 403 |
| 타인 로그 삭제 | 거부 확인, HTTP 403 |
| 기본 rate limit | 같은 경로 61번째 요청 HTTP 429 |
| 입력 모델 | 태그 1,000개와 비 URL 사진 문자열 허용 재현 |
| 신고 메일 HTML | 가짜 sender에서 사용자 HTML 삽입 재현, 실제 메일 미전송 |
| `npm audit --omit=dev` | 취약 패키지 5개: Critical 1, High 3, Moderate 1 |
| 로컬 Python 환경 `pip-audit` | 6개 패키지, 중복 제거 기준 16건 |
| 현재 추적 파일의 주요 비밀 패턴 | 발견 없음 |

Python 의존성 경고가 모두 현재 API에서 직접 악용 가능하다는 뜻은 아니다. 폼 파서, Windows StaticFiles, 특정 JWT 검증 방식 등 조건이 필요한 항목도 포함되어 있다. 현재 사용하는 코드 경로와 배포 환경을 기준으로 각 항목을 분류한 뒤 갱신해야 한다.

## 수정 우선순위

### P0 — 다음 배포 전

1. Next.js를 패치 버전으로 갱신한다.
2. 운영 DB에서 `users.role`의 GRANT와 RLS를 검사하고 일반 사용자 변경을 차단한다.
3. `users`, `cafe_visits`, `cafe_beans`, `cafe_bean_drops`, `cafes`의 직접 Data API 노출을 확인한다.
4. 익명 상세·피드의 작성자 식별 정보를 제거한다.

### P1 — 공개 출시 전

1. 개인 로그와 신고 사진을 private Storage로 전환한다.
2. 공유 컬렉션 RLS와 공개 응답의 토큰 노출을 수정한다.
3. 위치 없는 로그의 특성 자동 승인을 막는다.
4. 비공개 로그의 좋아요 경로를 닫는다.
5. slug/UUID 캐시 무효화를 통일하고 사진 공개 철회를 연결한다.

### P2 — 트래픽 확대 전

1. Auth CAPTCHA, 계정별 쓰기 제한, 공유 rate-limit 저장소를 적용한다.
2. Google Places의 공통 비용 한도와 field mask를 정리한다.
3. Storage 사용자별 총량과 파일 수 제한을 적용한다.
4. 피드 N+1 조회와 동기 DB I/O를 줄인다.
5. 본문과 배열의 서버 측 상한을 추가한다.

### P3 — 운영 성숙도

1. 필수 마이그레이션을 버전 관리한다.
2. 역할별 RLS 회귀 테스트를 CI에 넣는다.
3. 운영 WAF, 로그, 백업, 복구, 경보를 실제 콘솔에서 검증한다.
4. 폐기된 인증·방문 경쟁·리더보드 경로를 제거한다.

## 재검증 체크리스트

수정 후 아래 조건을 모두 확인해야 한다.

- [ ] 일반 Supabase JWT로 `users.role` INSERT와 UPDATE가 실패한다.
- [ ] 일반 사용자가 `users.email`, 공개 로그 작성자 ID, 체크인 좌표를 Data API로 읽지 못한다.
- [ ] 익명 로그의 모든 공개 API 응답에 사용자 ID·username·avatar가 없다.
- [ ] 비공개 로그의 사진 URL은 인증 없이 열리지 않는다.
- [ ] 익명 사진 URL에서 작성자 UUID를 추론할 수 없다.
- [ ] `collections_public=true`여도 개별 비공개 컬렉션은 공개 목록에 나오지 않는다.
- [ ] 공개 컬렉션 응답에 `share_token`이 없다.
- [ ] 토큰을 모르면 공유 컬렉션을 DB 또는 API에서 조회할 수 없다.
- [ ] `drink` 로그와 좌표 없는 로그가 승인된 카페 특성을 만들지 않는다.
- [ ] 비공개 로그에 타인이 좋아요를 생성하거나 조회할 수 없다.
- [ ] 로그를 비공개로 바꾼 직후 slug와 UUID 상세에서 모두 사라진다.
- [ ] 비공개 전환 또는 삭제된 로그 사진이 대표 이미지로 남지 않는다.
- [ ] Next.js Critical 취약점이 의존성 검사에서 사라진다.
- [ ] 허용하지 않는 MIME, 초과 크기, 초과 파일 수가 Storage에서 거부된다.
- [ ] 가입·로그인·비밀번호 복구 자동화에 CAPTCHA와 rate limit이 적용된다.
- [ ] Google 비용 한도 소진 후 어떤 유료 Google 호출도 시작되지 않는다.
- [ ] 여러 백엔드 인스턴스에서도 rate limit과 일일 카운터가 공유된다.
- [ ] 큰 JSON 본문, 긴 문자열, 큰 배열이 4xx로 빠르게 거부된다.
- [ ] 사용자 제공 신고 문구와 URL이 메일 HTML에서 escape 된다.

## 점검 한계

이번 점검에서는 다음 작업을 수행하지 않았다.

- 운영 서비스에 공격 페이로드 전송
- 운영 DB의 실제 GRANT·RLS 변경 또는 관리자 승격 시도
- Supabase·Vercel·Render·Google Cloud 콘솔 설정 확인
- 운영 Storage 파일 목록 조회 또는 비공개 사진 접근 시도
- 전체 Git 이력, CI artifact, 배포 로그의 비밀키 검사
- DAST, 브라우저 기반 자동 스캐너, 실제 부하 테스트
- 백업 복구 실행

따라서 **조건부** 항목은 운영 설정 조회로 확정해야 한다. 반대로 로컬에서 재현된 익명 정보 노출, 특성 승인 우회, 비공개 로그 좋아요, 컬렉션 토큰 노출은 운영 설정과 별개로 코드 수정이 필요하다.

## 참고 자료

- OWASP API Security Top 10: <https://owasp.org/API-Security/>
- OWASP API4 Unrestricted Resource Consumption: <https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/>
- OWASP API6 Sensitive Business Flows: <https://owasp.org/API-Security/editions/2023/en/0xa6-unrestricted-access-to-sensitive-business-flows/>
- Supabase Row Level Security: <https://supabase.com/docs/guides/database/postgres/row-level-security>
- Supabase Column Level Security: <https://supabase.com/docs/guides/database/postgres/column-level-security>
- Supabase Storage buckets: <https://supabase.com/docs/guides/storage/buckets/fundamentals>
- Supabase Auth CAPTCHA: <https://supabase.com/docs/guides/auth/auth-captcha>
- Next.js data security: <https://nextjs.org/docs/15/app/guides/data-security>
- Next.js August 2026 security release: <https://nextjs.org/blog/august-2026-security-release>
