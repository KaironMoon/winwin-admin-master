import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Award, Loader2, RefreshCw, AlertCircle, X } from 'lucide-react';
import config from '../config';

function ReferralTreePage() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hierarchyData, setHierarchyData] = useState(null);
  const [error, setError] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [maxDepth] = useState(10);

  // URL에서 user_id 파라미터 추출
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('user_id');
    if (id) {
      setUserId(id);
      loadReferralTree(id);
    } else {
      setError('사용자 ID가 제공되지 않았습니다.');
      setLoading(false);
    }
  }, []);

  // 제휴라인 트리 데이터 로드
  const loadReferralTree = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const tokenDataStr = localStorage.getItem('tokenData');
      let token = null;
      if (tokenDataStr) {
        const tokenData = JSON.parse(tokenDataStr);
        token = tokenData.token;
      }

      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }

      const endpoint = `${config.API_BASE_URL}/api/hierarchy/my-tree?max_depth=${maxDepth}&user_id=${id}`;

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error(`제휴라인 트리를 불러오는데 실패했습니다. (${response.status})`);
      }

      const data = await response.json();
      setHierarchyData(data);

      // 초기에 모든 노드 확장
      const allExpanded = new Set();
      const collectNodeIds = (node, parentPath = '') => {
        const currentPath = parentPath ? `${parentPath}/${node.user?.id}` : String(node.user?.id);
        if (currentPath) allExpanded.add(currentPath);
        if (node.children && node.children.length > 0) {
          node.children.forEach(child => collectNodeIds(child, currentPath));
        }
      };
      if (data) collectNodeIds(data);
      setExpandedNodes(allExpanded);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 노드 확장/축소 토글
  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // 트리 노드 렌더링
  const TreeNode = ({ node, level = 0, parentPath = '' }) => {
    const hasChildren = node.children && node.children.length > 0;
    const nodeId = parentPath ? `${parentPath}/${node.user?.id}` : String(node.user?.id);
    const isExpanded = expandedNodes.has(nodeId);

    // 레벨별 색상 (파스텔 톤)
    const getNodeStyle = () => {
      const styles = [
        { bg: '#A5B4FC', label: 'ROOT' },  // Level 0 - Indigo-300
        { bg: '#C4B5FD', label: 'L1' },    // Level 1 - Violet-300
        { bg: '#93C5FD', label: 'L2' },    // Level 2 - Blue-300
        { bg: '#67E8F9', label: 'L3' },    // Level 3 - Cyan-300
        { bg: '#6EE7B7', label: 'L4' },    // Level 4 - Emerald-300
        { bg: '#BEF264', label: 'L5' },    // Level 5 - Lime-300
        { bg: '#FCD34D', label: 'L6' },    // Level 6 - Amber-300
        { bg: '#FDBA74', label: 'L7' },    // Level 7 - Orange-300
        { bg: '#FCA5A5', label: 'L8' },    // Level 8 - Red-300
        { bg: '#F9A8D4', label: 'L9' },    // Level 9 - Pink-300
        { bg: '#DDD6FE', label: 'L10' },   // Level 10 - Violet-200
      ];
      return styles[Math.min(level, styles.length - 1)] || { bg: '#D1D5DB', label: `L${level}` };
    };

    const nodeStyle = getNodeStyle();
    const indent = level * 36;

    return (
      <div className="relative">
        {/* 노드 컨텐츠 */}
        <div
          className="relative py-2 hover:bg-gray-100 cursor-pointer transition-colors"
          onClick={() => hasChildren && toggleNode(nodeId)}
          style={{ paddingLeft: `${indent + 8}px` }}
        >
          {/* 첫 번째 줄: 아이콘, 이름, 레벨 */}
          <div className="flex items-center">
            {/* 확장/축소 아이콘 */}
            <div className="w-5 h-5 mr-2 flex items-center justify-center flex-shrink-0">
              {hasChildren ? (
                isExpanded ? (
                  <span className="text-gray-600 text-sm">▼</span>
                ) : (
                  <span className="text-gray-600 text-sm">▶</span>
                )
              ) : (
                <span className="text-gray-400 text-xs">●</span>
              )}
            </div>

            {/* 아이콘 원 */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-gray-800 font-bold text-sm mr-3 relative flex-shrink-0 shadow-lg"
              style={{ backgroundColor: nodeStyle.bg }}
            >
              {node.user?.name?.charAt(0) || '?'}
              {/* 직접 추천 수 배지 */}
              {node.user?.direct_referral_count > 0 && (
                <div className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-orange-400 rounded-full flex items-center justify-center shadow-md"
                     style={{ fontSize: '11px', fontWeight: 'bold', color: 'white' }}>
                  {node.user.direct_referral_count}
                </div>
              )}
            </div>

            {/* 이름 */}
            <span className="text-gray-900 text-base font-semibold mr-3 whitespace-nowrap">
              {node.user?.name || '익명'}
            </span>

            {/* 레벨 배지 */}
            <span
              className="px-2 py-1 text-gray-800 font-bold rounded shadow-md"
              style={{ backgroundColor: nodeStyle.bg, fontSize: '12px' }}
            >
              {nodeStyle.label}
            </span>
          </div>

          {/* 두 번째 줄: 통계 정보 */}
          <div className="flex items-center mt-1" style={{ paddingLeft: '47px' }}>
            <div className="flex items-center gap-4">
              <span style={{ color: '#6B7280', fontSize: '13px' }}>
                이메일: <span style={{ color: '#2563EB', fontWeight: '500' }}>{node.user?.email || '-'}</span>
              </span>
              <span style={{ color: '#6B7280', fontSize: '13px' }}>
                코드: <span style={{ color: '#D97706', fontWeight: '500' }}>{node.user?.referral_code || '-'}</span>
              </span>
              <span style={{ color: '#6B7280', fontSize: '13px' }}>
                전체추천: <span style={{ color: '#059669', fontWeight: '500' }}>{node.stats?.total_referrals || 0}명</span>
              </span>
              <span style={{ color: '#6B7280', fontSize: '13px' }}>
                수익: <span style={{ color: '#059669', fontWeight: '500' }}>₩{(node.stats?.total_revenue || 0).toLocaleString()}</span>
              </span>
            </div>
          </div>
        </div>

        {/* 자식 노드들 */}
        {hasChildren && isExpanded && (
          <div className="relative">
            {node.children.map((child, index) => (
              <TreeNode
                key={child.user?.id || index}
                node={child}
                level={level + 1}
                parentPath={nodeId}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">제휴라인을 불러오는 중...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => userId && loadReferralTree(userId)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <RefreshCw className="mr-2" size={16} />
              다시 시도
            </button>
          </div>
        ) : hierarchyData ? (
          <div>
            {/* 상단 헤더 */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-300">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">제휴라인 조회</h1>
                  <p className="text-sm text-gray-600">{hierarchyData.user?.name || '익명'} ({hierarchyData.user?.email || '-'})</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => userId && loadReferralTree(userId)}
                  disabled={loading}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-5 w-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => window.close()}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={16} className="inline mr-1" />
                  닫기
                </button>
              </div>
            </div>

            {/* 요약 정보 */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-3 text-white shadow-lg">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <div>
                    <p className="text-xs text-blue-100">전체 추천인원</p>
                    <p className="text-lg font-bold">{hierarchyData.stats?.total_referrals || 0}명</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-3 text-white shadow-lg">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <div>
                    <p className="text-xs text-green-100">총 수수료</p>
                    <p className="text-lg font-bold">₩{(hierarchyData.stats?.total_revenue || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-3 text-white shadow-lg">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <div>
                    <p className="text-xs text-purple-100">추천 코드</p>
                    <p className="text-base font-bold">{hierarchyData.user?.referral_code || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 트리 구조 */}
            <div className="bg-white rounded-lg border border-gray-300 shadow-lg">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-300">
                <h2 className="text-lg font-semibold text-gray-900">추천 네트워크 구조</h2>
                <button
                  onClick={() => {
                    // 모든 노드 확장
                    const allIds = new Set();
                    const collectIds = (node, parentPath = '') => {
                      const currentPath = parentPath ? `${parentPath}/${node.user?.id}` : String(node.user?.id);
                      if (currentPath) allIds.add(currentPath);
                      if (node.children && node.children.length > 0) {
                        node.children.forEach(child => collectIds(child, currentPath));
                      }
                    };
                    collectIds(hierarchyData);
                    setExpandedNodes(allIds);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  모두 펼치기
                </button>
              </div>

              <div className="py-3 px-2 overflow-x-auto bg-gray-50">
                <div className="min-w-max">
                  <TreeNode
                    node={hierarchyData}
                    level={0}
                    parentPath=""
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-600">사용자 정보를 찾을 수 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReferralTreePage;
