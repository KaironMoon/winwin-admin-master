import React, { useState } from 'react';

// 테스트용 샘플 주문/포지션 데이터
const SampleData = ({ onApplySampleData }) => {
  const [showSamplePanel, setShowSamplePanel] = useState(false);

  const sampleOrders = [
    {
      ordId: 'tp_001',
      instId: 'BTC-USDT-SWAP',
      ordType: 'take_profit',
      side: 'sell',
      px: '105000',
      sz: '0.1',
      state: 'live'
    },
    {
      ordId: 'sl_001', 
      instId: 'BTC-USDT-SWAP',
      ordType: 'stop_loss',
      side: 'sell',
      px: '95000',
      sz: '0.1', 
      state: 'live'
    },
    {
      ordId: 'trigger_001',
      instId: 'BTC-USDT-SWAP', 
      ordType: 'trigger',
      side: 'buy',
      px: '98000',
      sz: '0.05',
      state: 'live'
    },
    {
      ordId: 'limit_001',
      instId: 'BTC-USDT-SWAP',
      ordType: 'limit', 
      side: 'buy',
      px: '99500',
      sz: '0.2',
      state: 'live'
    }
  ];

  const samplePositions = [
    {
      posId: 'pos_001',
      instId: 'BTC-USDT-SWAP',
      side: 'long',
      pos: '0.1',
      avgPx: '100000',
      upl: '500',
      uplRatio: '5.0'
    }
  ];

  const handleApplySample = () => {
    onApplySampleData(sampleOrders, samplePositions);
    setShowSamplePanel(false);
  };

  const handleClearData = () => {
    onApplySampleData([], []);
    setShowSamplePanel(false);
  };

  if (!showSamplePanel) {
    return (
      <button
        onClick={() => setShowSamplePanel(true)}
        className="text-xs px-2 py-1 bg-purple-500/20 text-purple-600 rounded hover:bg-purple-500/30"
        title="샘플 주문 데이터 적용"
      >
        📊 샘플
      </button>
    );
  }

  return (
    <div className="absolute top-12 right-4 z-50 bg-card border rounded-lg p-4 shadow-lg min-w-64">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">샘플 주문 데이터</h3>
        <button
          onClick={() => setShowSamplePanel(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 mb-4 text-xs">
        <div className="text-green-600">• Take Profit: $105,000</div>
        <div className="text-red-600">• Stop Loss: $95,000</div>
        <div className="text-orange-600">• Trigger Buy: $98,000</div>
        <div className="text-blue-600">• Limit Buy: $99,500</div>
        <div className="text-purple-600">• Long Position: $100,000 (+5%)</div>
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={handleApplySample}
          className="flex-1 px-3 py-1.5 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90"
        >
          적용
        </button>
        <button
          onClick={handleClearData}
          className="flex-1 px-3 py-1.5 bg-red-500 text-white rounded text-xs hover:bg-red-600"
        >
          지우기
        </button>
      </div>
    </div>
  );
};

export default SampleData;