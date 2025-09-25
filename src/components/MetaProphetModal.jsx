import React, { useState, useEffect } from 'react';

// MetaProphet 모달 컴포넌트
const MetaProphetModal = ({ isOpen, onClose }) => {
  const [animationStep, setAnimationStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (isOpen && !isPlaying) {
      setIsPlaying(true);
      setAnimationStep(0);
      
      // 차트 데이터를 한 번만 생성하여 고정
      const generateChartData = () => {
        const data = [];
        const basePrice = 45000;
        let currentPrice = basePrice;
        
        // 첫 5개 캔들 (기존 데이터) - 현실적인 변동
        for (let i = 0; i < 5; i++) {
          const volatility = 400;
          const trend = Math.random() > 0.5 ? 50 : -30; // 랜덤한 방향
          
          const open = currentPrice;
          const close = currentPrice + (Math.random() - 0.5) * volatility + trend;
          const high = Math.max(open, close) + Math.random() * 300;
          const low = Math.min(open, close) - Math.random() * 300;
          
          data.push({
            time: i,
            open,
            high,
            low,
            close,
            isHistorical: true,
            isPredicted: false
          });
          
          currentPrice = close;
        }
        
        // AI 예측 캔들 20개 - 현실적인 하락 후 반등 패턴
        for (let i = 5; i < 25; i++) {
          const volatility = 600;
          let trend = 0;
          
          // 하락 구간 (5-15) - 현실적인 하락
          if (i < 15) {
            trend = -100 - (15 - i) * 20 + (Math.random() - 0.5) * 100; // 랜덤 요소 추가
          } else {
            // 반등 구간 (15-25) - 현실적인 상승
            trend = 80 + (i - 15) * 30 + (Math.random() - 0.5) * 80; // 랜덤 요소 추가
          }
          
          const open = currentPrice;
          const close = currentPrice + (Math.random() - 0.5) * volatility + trend;
          const high = Math.max(open, close) + Math.random() * 400;
          const low = Math.min(open, close) - Math.random() * 400;
          
          data.push({
            time: i,
            open,
            high,
            low,
            close,
            isHistorical: false,
            isPredicted: true
          });
          
          currentPrice = close;
        }
        
        return data;
      };

      setChartData(generateChartData());
      
      const interval = setInterval(() => {
        setAnimationStep(prev => {
          if (prev >= 100) {
            return 0; // 0으로 리셋하여 반복 재생
          }
          return prev + 1;
        });
      }, 80); // 더 빠른 애니메이션

      return () => {
        clearInterval(interval);
        setIsPlaying(false);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStep = Math.floor(animationStep / 2);

  // AI 진입 가격 계산
  const agileEntryPrice = (chartData[6]?.close || 45000) - 300; // 민첩형 AI 진입선을 300 낮춤 (위쪽)
  const calmEntryPrice = (chartData[11]?.close || 45000) - 800; // 침착형 AI 진입선을 800 낮춤 (중간)
  const cautiousEntryPrice = (chartData[9]?.close || 45000) - 1200; // 신중형 AI 진입선을 1200 낮춤 (아래쪽)
  
  // 트리거 포인트 가격 (민첩형 AI 원래 자리)
  const triggerPrice = chartData[7]?.close || 45000;

  // 차트 Y축 범위 계산
  const allPrices = chartData.flatMap(candle => [candle.high, candle.low]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice;
  const padding = priceRange * 0.4; // 패딩을 더 늘려서 여유 공간 확보

  const getY = (price) => {
    const adjustedMin = minPrice - padding;
    const adjustedMax = maxPrice + padding;
    const normalizedPrice = (price - adjustedMin) / (adjustedMax - adjustedMin);
    return 350 - (normalizedPrice * 300); // 50~350 범위 사용 (300px 높이)
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-3"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white text-sm font-medium">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>META Prophet AI</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">AI 기반 트레이딩 전략</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="flex flex-col lg:flex-row">
          {/* 차트 영역 */}
          <div className="lg:w-2/3 p-4 bg-gray-50">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">실시간 AI 예측 차트</h3>
              
              {/* 차트 컨테이너 */}
              <div className="relative h-96 bg-gray-900 rounded-lg overflow-hidden">
                {/* 캔들스틱 차트 */}
                <svg className="w-full h-full" viewBox="0 0 800 400">
                  {/* 그리드 라인 */}
                  {[...Array(6)].map((_, i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={66.67 * i}
                      x2="800"
                      y2={66.67 * i}
                      stroke="#374151"
                      strokeWidth="1"
                      opacity="0.3"
                    />
                  ))}
                  
                                                        {/* 트리거 포인트 - 처음부터 표시 */}
                   <line
                     x1="0"
                     y1={getY(triggerPrice)}
                     x2="800"
                     y2={getY(triggerPrice)}
                     stroke="#9CA3AF"
                     strokeWidth="2"
                     strokeDasharray="5,5"
                     opacity={currentStep >= 8 ? 1 : 0.3}
                   />
                   <text
                     x="10"
                     y={getY(triggerPrice) - 5}
                     fill={currentStep >= 8 ? "#FFFFFF" : "#9CA3AF"}
                     fontSize="12"
                     fontWeight="bold"
                   >
                     트리거 포인트
                   </text>
                   
                   {/* AI 진입선들 - 트리거 포인트에 닿을 때 나타남 */}
                   {currentStep >= 8 && (
                     <>
                       {/* 민첩 AI 진입선 */}
                       <line
                         x1="0"
                         y1={getY(agileEntryPrice)}
                         x2="800"
                         y2={getY(agileEntryPrice)}
                         stroke="#F59E0B"
                         strokeWidth="2"
                         strokeDasharray="5,5"
                         opacity={currentStep >= 8 ? 1 : 0.3}
                       />
                       <text
                         x="10"
                         y={getY(agileEntryPrice) - 5}
                         fill="#F59E0B"
                         fontSize="12"
                         fontWeight="bold"
                       >
                         민첩형 AI 진입선
                       </text>
                       
                       {/* 침착 AI 진입선 */}
                       <line
                         x1="0"
                         y1={getY(calmEntryPrice)}
                         x2="800"
                         y2={getY(calmEntryPrice)}
                         stroke="#3B82F6"
                         strokeWidth="2"
                         strokeDasharray="5,5"
                         opacity={currentStep >= 12 ? 1 : 0.3}
                       />
                       <text
                         x="10"
                         y={getY(calmEntryPrice) - 5}
                         fill="#3B82F6"
                         fontSize="12"
                         fontWeight="bold"
                       >
                         침착형 AI 진입선
                       </text>
                       
                       {/* 신중 AI 진입선 */}
                       <line
                         x1="0"
                         y1={getY(cautiousEntryPrice)}
                         x2="800"
                         y2={getY(cautiousEntryPrice)}
                         stroke="#10B981"
                         strokeWidth="2"
                         strokeDasharray="5,5"
                         opacity={currentStep >= 10 ? 1 : 0.3}
                       />
                       <text
                         x="10"
                         y={getY(cautiousEntryPrice) - 5}
                         fill="#10B981"
                         fontSize="12"
                         fontWeight="bold"
                       >
                         신중형 AI 진입선
                       </text>
                     </>
                   )}
                  
                  {/* 캔들스틱 */}
                  {chartData.slice(0, Math.min(currentStep + 1, chartData.length)).map((candle, index) => {
                    const x = (index * 32) + 16;
                    const openY = getY(candle.open);
                    const closeY = getY(candle.close);
                    const highY = getY(candle.high);
                    const lowY = getY(candle.low);
                    const isGreen = candle.close > candle.open;
                    const isVisible = index <= currentStep;
                    
                    if (!isVisible) return null;
                    
                    return (
                      <g key={index}>
                        {/* 심지 */}
                        <line
                          x1={x}
                          y1={highY}
                          x2={x}
                          y2={lowY}
                          stroke={candle.isPredicted ? "#8B5CF6" : "#6B7280"}
                          strokeWidth="2"
                          opacity={candle.isPredicted ? 0.7 : 1}
                        />
                        {/* 캔들 바디 */}
                        <rect
                          x={x - 6}
                          y={Math.min(openY, closeY)}
                          width="12"
                          height={Math.abs(closeY - openY)}
                          fill={isGreen ? "#10B981" : "#EF4444"}
                          opacity={candle.isPredicted ? 0.7 : 1}
                        />
                      </g>
                    );
                  })}
                  
                  {/* AI 예측 라인 */}
                  {currentStep >= 5 && (
                    <path
                      d={`M ${5 * 32 + 16} ${getY(chartData[4].close)} ${chartData.slice(5, Math.min(currentStep + 1, 25)).map((candle, index) => 
                        `L ${(index + 5) * 32 + 16} ${getY(candle.close)}`
                      ).join(' ')}`}
                      stroke="#8B5CF6"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray="5,5"
                      opacity="0.8"
                    />
                  )}
                </svg>
                
                {/* 애니메이션 상태 표시 */}
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
                  {currentStep < 5 ? "📊 기존 5개 캔들 데이터 분석 중..." :
                   currentStep < 10 ? "🤖 AI가 향후 20개 캔들 예측 중..." :
                   currentStep < 15 ? "🎯 3가지 AI 스타일이 진입 포인트 설정 중..." :
                   currentStep < 25 ? "📈 실제 시장 움직임과 예측 비교 중..." :
                   "✅ 신중형 AI가 최적의 반등 지점에서 진입 성공!"}
                </div>
              </div>
            </div>
          </div>

          {/* 설명 영역 */}
          <div className="lg:w-1/3 p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* 메인 설명 */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">META Prophet AI란?</h3>
                <p className="text-gray-600 leading-relaxed">
                  메타(페이스북)의 <strong>프로핏 알고리즘</strong>을 기반으로 학습한 AI 모델입니다. 
                  실시간 시장 데이터를 분석하여 <strong>효과적인 포지션 진입과 리스크 관리</strong>를 도와드립니다.
                </p>
              </div>

              {/* AI 유형 설명 */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">3가지 AI 트레이딩 스타일</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-gray-800">민첩형 AI</div>
                      <div className="text-sm text-gray-600">빠른 반응으로 초기 진입 포인트를 포착</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-gray-800">침착형 AI</div>
                      <div className="text-sm text-gray-600">균형잡힌 접근으로 중간 진입 타이밍을 선택</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-gray-800">신중형 AI</div>
                      <div className="text-sm text-gray-600">신중한 분석으로 최적의 반등 지점을 예측</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetaProphetModal; 