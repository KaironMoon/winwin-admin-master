import React, { useState, useRef } from 'react';
import OKXApiTester from '../lib/okxApiTest.js';
import OKXApi from '../lib/okxApi.js';

const OKXTestPanel = () => {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [isSandbox, setIsSandbox] = useState(true);
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');
  const consoleRef = useRef(null);

  // 콘솔 로그를 캡처하기 위한 오버라이드
  const captureConsole = () => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const logs = [];

    console.log = (...args) => {
      logs.push({ type: 'log', timestamp: new Date().toISOString(), message: args.join(' ') });
      originalLog.apply(console, args);
    };

    console.error = (...args) => {
      logs.push({ type: 'error', timestamp: new Date().toISOString(), message: args.join(' ') });
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      logs.push({ type: 'warn', timestamp: new Date().toISOString(), message: args.join(' ') });
      originalWarn.apply(console, args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      return logs;
    };
  };

  // 전체 테스트 실행
  const runAllTests = async () => {
    if (!apiKey || !apiSecret || !passphrase) {
      alert('API Key, Secret, Passphrase를 모두 입력해주세요.');
      return;
    }

    setIsRunning(true);
    setTestResults([]);
    setCurrentTest('테스트 준비 중...');

    const restoreConsole = captureConsole();

    try {
      const tester = new OKXApiTester(apiKey, apiSecret, passphrase, isSandbox);
      
      // 테스트 진행 상황을 추적하기 위한 커스텀 로그
      const originalRecordTest = tester.recordTest.bind(tester);
      tester.recordTest = (testName, success, details) => {
        setCurrentTest(testName);
        const result = originalRecordTest(testName, success, details);
        setTestResults(prev => [...prev, result]);
        return result;
      };

      await tester.runAllTests();
      setCurrentTest('테스트 완료');
    } catch (error) {
      setCurrentTest('테스트 실패');
    } finally {
      setIsRunning(false);
      restoreConsole();
      // 로그를 상태에 저장하거나 표시할 수 있습니다
    }
  };

  // 특정 테스트 실행
  const runSpecificTest = async (testName) => {
    if (!apiKey || !apiSecret || !passphrase) {
      alert('API Key, Secret, Passphrase를 모두 입력해주세요.');
      return;
    }

    setIsRunning(true);
    setCurrentTest(`${testName} 테스트 실행 중...`);

    const restoreConsole = captureConsole();

    try {
      const tester = new OKXApiTester(apiKey, apiSecret, passphrase, isSandbox);
      await tester.runSpecificTest(testName);
      setCurrentTest('테스트 완료');
    } catch (error) {
      setCurrentTest('테스트 실패');
    } finally {
      setIsRunning(false);
      restoreConsole();
    }
  };

  // 서명 검증 테스트
  const runSignatureVerification = async () => {
    if (!apiKey || !apiSecret || !passphrase) {
      alert('API Key, Secret, Passphrase를 모두 입력해주세요.');
      return;
    }

    setIsRunning(true);
    setCurrentTest('서명 검증 테스트 실행 중...');

    try {
      const api = new OKXApi(apiKey, apiSecret, passphrase, isSandbox);
      
      // 테스트용 서명 생성
      const method = 'GET';
      const requestPath = '/account/balance';
      const body = '';
      
      const { timestamp, signature } = await api.generateSignature(method, requestPath, body);
      
      // 서명 검증
      const verification = await api.verifySignature(method, requestPath, body, signature, timestamp);
      
      const result = {
        testName: '서명 검증',
        success: verification.isValid,
        timestamp: new Date().toISOString(),
        details: {
          isValid: verification.isValid,
          timestamp: verification.timestamp,
          message: verification.message
        }
      };
      
      setTestResults(prev => [...prev, result]);
      setCurrentTest('서명 검증 테스트 완료');
    } catch (error) {
      const result = {
        testName: '서명 검증',
        success: false,
        timestamp: new Date().toISOString(),
        details: { error: error.message }
      };
      
      setTestResults(prev => [...prev, result]);
      setCurrentTest('서명 검증 테스트 실패');
    } finally {
      setIsRunning(false);
    }
  };

  // 테스트 결과 초기화
  const clearResults = () => {
    setTestResults([]);
    setCurrentTest('');
  };

  return (
    <div className="min-h-screen bg-background p-3">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">OKX API 테스트 패널</h2>
          <p className="text-muted-foreground mb-6">
            OKX API 연결 및 기능을 테스트할 수 있습니다. API Key, Secret, Passphrase를 입력하고 테스트를 실행하세요.
          </p>

          {/* API 설정 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">API Key</label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                placeholder="API Key를 입력하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">API Secret</label>
              <input
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                placeholder="API Secret을 입력하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Passphrase</label>
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                placeholder="Passphrase를 입력하세요"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isSandbox}
                  onChange={(e) => setIsSandbox(e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm text-foreground">Sandbox 모드</span>
              </label>
            </div>
          </div>

          {/* 테스트 버튼들 */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="btn-primary px-4 py-2 disabled:opacity-50"
            >
              {isRunning ? '테스트 실행 중...' : '전체 테스트 실행'}
            </button>
            
            <button
              onClick={runSignatureVerification}
              disabled={isRunning}
              className="btn-secondary px-4 py-2 disabled:opacity-50"
            >
              서명 검증 테스트
            </button>
            
            <button
              onClick={clearResults}
              className="btn-ghost px-4 py-2"
            >
              결과 초기화
            </button>
          </div>

          {/* 개별 테스트 버튼들 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
            {[
              { name: 'setup', label: '기본 설정' },
              { name: 'time', label: '시간 동기화' },
              { name: 'signature', label: '서명 생성' },
              { name: 'headers', label: '헤더 생성' },
              { name: 'public', label: '공개 API' },
              { name: 'auth', label: '인증 API' },
              { name: 'balance', label: '잔액 조회' },
              { name: 'positions', label: '포지션 조회' }
            ].map((test) => (
              <button
                key={test.name}
                onClick={() => runSpecificTest(test.name)}
                disabled={isRunning}
                className="btn-outline px-3 py-1 text-sm disabled:opacity-50"
              >
                {test.label}
              </button>
            ))}
          </div>

          {/* 현재 테스트 상태 */}
          {currentTest && (
            <div className="mb-6 p-3 bg-muted rounded-md">
              <p className="text-sm text-foreground">
                <strong>현재 상태:</strong> {currentTest}
              </p>
            </div>
          )}
        </div>

        {/* 테스트 결과 */}
        {testResults.length > 0 && (
          <div className="bg-card rounded-lg border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-foreground">테스트 결과</h3>
              <p className="text-muted-foreground text-sm">
                총 {testResults.length}개 테스트 중 {testResults.filter(r => r.success).length}개 성공
              </p>
            </div>
            
            <div className="divide-y divide-border">
              {testResults.map((result, index) => (
                <div key={index} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground">{result.testName}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      result.success 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {result.success ? '성공' : '실패'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-2">
                    {new Date(result.timestamp).toLocaleString()}
                  </div>
                  
                  {result.details && Object.keys(result.details).length > 0 && (
                    <div className="bg-muted/50 rounded p-3">
                      <pre className="text-xs text-foreground whitespace-pre-wrap">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 콘솔 로그 출력 */}
        <div className="bg-card rounded-lg border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-foreground">콘솔 로그</h3>
            <p className="text-muted-foreground text-sm">
              테스트 실행 중 생성된 로그를 확인하세요.
            </p>
          </div>
          
          <div className="p-6">
            <div
              ref={consoleRef}
              className="bg-background border rounded p-4 h-64 overflow-y-auto font-mono text-sm"
            >
              <p className="text-muted-foreground">
                테스트를 실행하면 여기에 로그가 표시됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OKXTestPanel; 