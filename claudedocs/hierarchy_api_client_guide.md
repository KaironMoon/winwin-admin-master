# 계층 구조(Hierarchy) API 클라이언트 가이드

## 개요
유저 간 추천인 관계를 관리하고 계층 구조를 조회하는 API입니다.

## Base URL
```
https://api.winwin.com
```

## 인증
모든 API는 JWT Bearer 토큰 인증이 필요합니다.
```
Authorization: Bearer {access_token}
```

---

## 1. 회원가입 (추천인 포함)

### Endpoint
```
POST /api/auth/register
```

### Request Body
```json
{
  "email": "user@example.com",
  "name": "홍길동",
  "password": "SecurePassword123!",
  "referrer_email": "referrer@example.com"  // 선택적, 없으면 admin이 자동 추천인
}
```

### Response (201 Created)
```json
{
  "id": 23,
  "email": "user@example.com",
  "name": "홍길동",
  "level": "user",
  "is_active": true,
  "referrer_id": 8,  // 추천인 ID
  "created_at": "2025-09-16T12:00:00Z",
  "updated_at": null,
  "okx_api_key": null,
  "okx_api_secret": null,
  "okx_api_passphrase": null,
  "okx_demo_api_key": null,
  "okx_demo_api_secret": null
}
```

### Error Responses
- `400 Bad Request`: 이메일 중복 또는 잘못된 추천인 이메일
```json
{
  "detail": "Email already registered"
}
```
```json
{
  "detail": "Referrer with email 'wrong@example.com' not found"
}
```

### 추천인 로직
1. `referrer_email` 제공 시: 해당 이메일 사용자를 추천인으로 설정
2. `referrer_email` 미제공 시: admin 레벨의 첫 번째 사용자가 자동으로 추천인
3. 잘못된 이메일: 400 에러 반환

---

## 2. 내 계층 트리 조회

### Endpoint
```
GET /api/hierarchy/my-tree
```

### Query Parameters
- `max_depth` (optional): 조회할 최대 깊이 (1-10, 기본값: 전체)

### Request Example
```
GET /api/hierarchy/my-tree?max_depth=3
Authorization: Bearer {access_token}
```

### Response (200 OK)
```json
{
  "user": {
    "id": 8,
    "name": "문승욱",
    "email": "kizrael@gmail.com",
    "level": 2,
    "direct_referral_count": 3
  },
  "stats": {
    "total_referrals": 15,
    "direct_referrals": 3,
    "total_revenue": 1500000.50,
    "revenue_percentage": 0.05,
    "total_orders": 250
  },
  "children": [
    {
      "user": {
        "id": 22,
        "name": "김철수",
        "email": "kim@example.com",
        "level": 3,
        "direct_referral_count": 2
      },
      "stats": {
        "total_referrals": 5,
        "direct_referrals": 2,
        "total_revenue": 500000.00,
        "revenue_percentage": 0.03,
        "total_orders": 50
      },
      "children": []
    }
  ]
}
```

---

## 3. 특정 유저의 계층 트리 조회

### Endpoint
```
GET /api/hierarchy/tree/{user_id}
```

### Parameters
- `user_id`: 조회할 유저 ID
- `max_depth` (optional): 조회할 최대 깊이

### 권한
- 본인의 트리: 항상 조회 가능
- 하위 멤버의 트리: 조회 불가
- 상위 추천인의 트리: 상위 추천인만 조회 가능
- 관리자: 모든 트리 조회 가능

### Response
내 트리 조회와 동일한 구조

### Error Response (403 Forbidden)
```json
{
  "detail": "권한이 없습니다"
}
```

---

## 4. 상위 추천인 체인 조회

### Endpoint
```
GET /api/hierarchy/ancestors/{user_id}
```

### Response (200 OK)
```json
{
  "ancestors": [
    {
      "id": 2,
      "name": "Song",
      "email": "song@example.com"
    },
    {
      "id": 1,
      "name": "Admin",
      "email": "admin@example.com"
    }
  ]
}
```

추천인 체인은 직접 추천인부터 최상위까지 순서대로 반환됩니다.

---

## 5. 직접 추천한 멤버 목록

### Endpoint
```
GET /api/hierarchy/direct-referrals/{user_id}
```

### Response (200 OK)
```json
{
  "referrals": [
    {
      "id": 25,
      "name": "이영희",
      "email": "lee@example.com",
      "created_at": "2025-09-15T10:30:00Z",
      "stats": {
        "total_referrals": 3,
        "direct_referrals": 1,
        "total_revenue": 250000.00,
        "revenue_percentage": 0.02,
        "total_orders": 30
      }
    },
    {
      "id": 26,
      "name": "박민수",
      "email": "park@example.com",
      "created_at": "2025-09-16T08:20:00Z",
      "stats": {
        "total_referrals": 0,
        "direct_referrals": 0,
        "total_revenue": 0,
        "revenue_percentage": 0,
        "total_orders": 0
      }
    }
  ],
  "total": 2
}
```

---

## 6. 유저 통계 정보

### Endpoint
```
GET /api/hierarchy/stats/{user_id}
```

### Response (200 OK)
```json
{
  "total_referrals": 25,
  "direct_referrals": 5,
  "total_revenue": 3500000.75,
  "revenue_percentage": 0.08,
  "total_orders": 580
}
```

---

## 7. 캐시 무효화 (관리자 전용)

### Endpoint
```
POST /api/hierarchy/invalidate-cache
```

### Request Body (Optional)
```json
{
  "user_id": 8  // 특정 유저의 캐시만 무효화, 없으면 전체
}
```

### Response (200 OK)
```json
{
  "message": "캐시가 무효화되었습니다",
  "user_id": 8,
  "scope": "user"
}
```

---

## 데이터 모델

### UserBasicInfo
```typescript
interface UserBasicInfo {
  id: number;
  name: string;
  email: string;
  level: number;  // 트리에서의 깊이 (ROOT=0, L1=1, ...)
  direct_referral_count: number;
}
```

### UserStatsResponse
```typescript
interface UserStatsResponse {
  total_referrals: number;      // 전체 하위 회원 수
  direct_referrals: number;      // 직접 추천 회원 수
  total_revenue: number;         // 하위 전체 수익
  revenue_percentage: number;    // 수익률
  total_orders: number;          // 하위 전체 주문 수
}
```

### HierarchyNode
```typescript
interface HierarchyNode {
  user: UserBasicInfo;
  stats: UserStatsResponse;
  children: HierarchyNode[];
}
```

---

## 구현 예시

### React/TypeScript
```typescript
// API 서비스
class HierarchyService {
  private baseURL = 'https://api.winwin.com';
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async getMyTree(maxDepth?: number): Promise<HierarchyNode> {
    const url = `${this.baseURL}/api/hierarchy/my-tree${
      maxDepth ? `?max_depth=${maxDepth}` : ''
    }`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  async registerWithReferrer(
    email: string,
    name: string,
    password: string,
    referrerEmail?: string
  ): Promise<User> {
    const response = await fetch(`${this.baseURL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        name,
        password,
        referrer_email: referrerEmail
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }
    
    return await response.json();
  }
}

// 컴포넌트에서 사용
const HierarchyTree: React.FC = () => {
  const [tree, setTree] = useState<HierarchyNode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const service = new HierarchyService(token!);
        const data = await service.getMyTree(3); // 최대 3단계까지
        setTree(data);
      } catch (error) {
        console.error('Failed to fetch hierarchy:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, []);

  const renderTree = (node: HierarchyNode, level = 0) => (
    <div style={{ marginLeft: level * 20 }}>
      <div className="user-node">
        <h4>{node.user.name}</h4>
        <p>직접 추천: {node.stats.direct_referrals}명</p>
        <p>전체 하위: {node.stats.total_referrals}명</p>
        <p>수익: {node.stats.total_revenue.toLocaleString()}원</p>
      </div>
      {node.children.map(child => (
        <div key={child.user.id}>
          {renderTree(child, level + 1)}
        </div>
      ))}
    </div>
  );

  if (loading) return <div>Loading...</div>;
  if (!tree) return <div>No data</div>;

  return <div>{renderTree(tree)}</div>;
};
```

### Vue.js
```javascript
// API 호출
export default {
  data() {
    return {
      myTree: null,
      loading: true
    }
  },
  
  async mounted() {
    await this.fetchMyTree();
  },
  
  methods: {
    async fetchMyTree() {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch('/api/hierarchy/my-tree?max_depth=3', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          this.myTree = await response.json();
        }
      } catch (error) {
        console.error('Error fetching tree:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async registerUser(userData) {
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: userData.email,
            name: userData.name,
            password: userData.password,
            referrer_email: userData.referrerEmail // 선택적
          })
        });
        
        if (response.ok) {
          const user = await response.json();
          console.log('Registration successful:', user);
          // 로그인 페이지로 리다이렉트
          this.$router.push('/login');
        } else {
          const error = await response.json();
          alert(error.detail);
        }
      } catch (error) {
        console.error('Registration error:', error);
      }
    }
  }
}
```

---

## 주의사항

1. **캐싱**: 계층 구조 데이터는 서버에서 5분간 캐싱됩니다. 실시간 업데이트가 필요한 경우 관리자에게 캐시 무효화를 요청하세요.

2. **권한**: 하위 멤버는 상위 멤버의 정보를 조회할 수 없습니다. 상위 멤버만 하위 전체를 조회할 수 있습니다.

3. **성능**: 깊은 계층 구조 조회 시 `max_depth` 파라미터를 사용하여 필요한 깊이만 조회하는 것을 권장합니다.

4. **추천인 설정**: 회원가입 시에만 추천인을 설정할 수 있으며, 가입 후에는 변경할 수 없습니다.

---

## 에러 코드

| 상태 코드 | 설명 |
|----------|------|
| 200 | 성공 |
| 201 | 생성 성공 (회원가입) |
| 400 | 잘못된 요청 (이메일 중복, 잘못된 추천인 등) |
| 401 | 인증 실패 (토큰 없음 또는 만료) |
| 403 | 권한 없음 (다른 유저의 정보 조회 시도) |
| 404 | 리소스를 찾을 수 없음 |
| 422 | 입력 데이터 검증 실패 |
| 500 | 서버 내부 오류 |