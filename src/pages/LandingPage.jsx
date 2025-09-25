import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Shield, 
  BarChart3, 
  Zap, 
  Users, 
  ArrowRight,
  Play,
  CheckCircle,
  MessageCircle
} from 'lucide-react';

const LandingPage = ({ onShowLoginModal }) => {


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 -mt-[68px] pt-[68px]">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={require('../assets/hero-bg.mp4')} type="video/mp4" />
        </video>
        
        {/* Radial Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/50 to-black/80"></div>
        
        {/* Text Background Radial */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[800px] h-[600px] bg-gradient-radial from-black/80 via-black/60 to-transparent rounded-full blur-xl"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-center px-3 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center mb-6">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent font-sacheon leading-[1.2] md:leading-[1.2]">
                MegaBit AI
              </h1>
            </div>
            
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-6">
              진짜 AI 트레이딩 프로그램
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              <span className="block sm:hidden">
                META Prophet 기반 AI와 함께하는<br />
                스마트한 자동매매 시스템으로<br />
                리스크를 최소화하고 수익을 극대화하세요
              </span>
              <span className="hidden sm:block">
                META Prophet 기반 AI와 함께하는 스마트한 자동매매 시스템으로<br />
                리스크를 최소화하고 수익을 극대화하세요
              </span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center space-x-2 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-2xl"
                onClick={() => window.location.href = '/create'}
              >
                <Play className="w-5 h-5" />
                <span>데모 보기</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2"></div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-3 bg-gradient-to-b from-black/50 to-slate-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              왜 <span className="font-sacheon">MegaBit</span>인가요?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              투자 초보자도 쉽게 따라할 수 있는 <span className="text-yellow-400 font-semibold">자동화 시스템</span>과<br />
              <span className="text-green-400 font-semibold">평생 무료 혜택</span>으로 진정한 <span className="font-sacheon">AI 트레이딩</span>을 만들어갑니다
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: "똑똑한 AI가 알아서",
                description: "복잡한 투자 지식 없이도 AI가 시장을 분석해서 최적의 매수 타이밍을 자동으로 알려줍니다",
                gradient: "from-yellow-500 to-orange-500"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "지금만 평생 무료",
                description: "얼리버드로 가입하면 평생 무료! 나중에 가입하는 사람들은 유료 이용이 필수입니다",
                gradient: "from-green-500 to-emerald-500"
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: "실제 사용자들의 후기",
                description: "이미 많은 분들이 사용하고 계시며, 실제로 수익을 내고 있다는 생생한 후기들이 있습니다",
                gradient: "from-blue-500 to-cyan-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MegaBit AI 트레이딩 봇 소개 섹션 */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              <span className="font-sacheon">MegaBit</span>은 어떤 프로그램인가요?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              AI에 초집중한 DCA + 마틴게일 트레이딩 프로그램으로<br/>기존 시장에 없던 혁신적인 자동매매 시스템입니다
            </p>
          </motion.div>

          {/* 데모 비디오 섹션 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            {/* 모바일: 카드 없이 큰 영상 */}
            <div className="block lg:hidden px-2">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto"
                >
                  <source src={require('../assets/demo.mp4')} type="video/mp4" />
                </video>
                {/* 비디오 오버레이 효과 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute top-4 left-4 bg-blue-500/90 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  📱 실제 화면
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-gray-300 text-sm"><span className="font-sacheon">MegaBit</span> 실제 작동 화면</p>
              </div>
            </div>

            {/* 데스크톱: 카드에 담긴 영상 */}
            <div className="hidden lg:block max-w-4xl mx-auto">
              <div className="relative bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-3xl p-6 border border-white/10 backdrop-blur-sm">
                <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-auto"
                  >
                    <source src={require('../assets/demo.mp4')} type="video/mp4" />
                  </video>
                  {/* 비디오 오버레이 효과 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
                  <div className="absolute top-4 left-4 bg-blue-500/90 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    📱 실제 화면
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-gray-300 text-sm"><span className="font-sacheon">MegaBit</span> 실제 작동 화면</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 설명 섹션 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold text-white mb-6 text-center">🚀 AI가 완전히 자동화한 DCA 트레이딩</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl p-6 border border-yellow-500/20">
                  <h4 className="text-xl font-bold text-yellow-400 mb-3">💰 DCA (Dollar Cost Averaging)</h4>
                  <p className="text-gray-300 leading-relaxed">
                    <strong>단계적 투자로 평균 단가를 낮추는 전략</strong><br/>
                    시장이 하락해도 체계적으로 매수하여, 상승 시 더 큰 수익을 실현하는 방식입니다. 
                    마치 저축처럼 꾸준히 투자하되, AI가 최적의 진입 시점을 선별해줍니다.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-blue-500/20">
                  <h4 className="text-xl font-bold text-blue-400 mb-3">🎯 마틴게일 방식</h4>
                  <p className="text-gray-300 leading-relaxed">
                    <strong>손실 시 투자 금액을 늘려 회복하는 전략</strong><br/>
                    전통적으로는 리스크가 높은 방식이지만, AI가 시장을 정밀하게 분석하여 
                    언제 투자 금액을 늘릴지, 언제 멈출지 정확하게 판단합니다.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 비교표 섹션 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold text-white mb-8 text-center">🔍 일반 자동매매 vs <span className="font-sacheon">MegaBit</span> 심층 비교</h3>
            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-4 px-2 sm:px-6 text-white font-bold text-lg">핵심 요소</th>
                      <th className="text-center py-4 px-2 sm:px-6 text-red-400 font-bold text-lg">일반 자동매매</th>
                      <th className="text-center py-4 px-2 sm:px-6 text-green-400 font-bold text-lg font-sacheon">MegaBit</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr className="border-b border-white/10">
                      <td className="py-4 px-2 sm:px-6 font-semibold">
                        <div className="text-white">AI 분석 엔진</div>
                        <div className="text-sm text-gray-400 mt-1">시장 분석 방식</div>
                      </td>
                      <td className="py-4 px-2 sm:px-6 text-center">
                        <div className="text-red-400 font-medium">무늬만 AI</div>
                        <div className="text-sm text-gray-400 mt-1">실제로는 조건문에 불과한 가짜 AI</div>
                      </td>
                      <td className="py-4 px-2 sm:px-6 text-center">
                        <div className="text-green-400 font-medium">진짜 AI 분석 엔진</div>
                        <div className="text-sm text-gray-400 mt-1">실시간 패턴 인식 + 학습 능력</div>
                      </td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-4 px-2 sm:px-6 font-semibold">
                        <div className="text-white">리스크 관리 시스템</div>
                        <div className="text-sm text-gray-400 mt-1">손실 제한 방식</div>
                      </td>
                      <td className="py-4 px-2 sm:px-6 text-center">
                        <div className="text-red-400 font-medium">고정된 손절선</div>
                        <div className="text-sm text-gray-400 mt-1">시장 상황과 무관하게 동일한 기준</div>
                      </td>
                      <td className="py-4 px-2 sm:px-6 text-center">
                        <div className="text-green-400 font-medium">동적 리스크 조정</div>
                        <div className="text-sm text-gray-400 mt-1">시장 변동성에 따라 실시간 조정</div>
                      </td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-4 px-2 sm:px-6 font-semibold">
                        <div className="text-white">진입 타이밍 결정</div>
                        <div className="text-sm text-gray-400 mt-1">매수 시점 판단</div>
                      </td>
                      <td className="py-4 px-2 sm:px-6 text-center">
                        <div className="text-red-400 font-medium">규칙 기반 진입</div>
                        <div className="text-sm text-gray-400 mt-1">미리 설정된 조건에만 반응</div>
                      </td>
                      <td className="py-4 px-2 sm:px-6 text-center">
                        <div className="text-green-400 font-medium">AI 예측 기반 진입</div>
                        <div className="text-sm text-gray-400 mt-1">다중 요인 분석으로 최적 타이밍 포착</div>
                      </td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-4 px-2 sm:px-6 font-semibold">
                        <div className="text-white">수익률 안정성</div>
                        <div className="text-sm text-gray-400 mt-1">장기적 성과</div>
                      </td>
                      <td className="py-4 px-2 sm:px-6 text-center">
                        <div className="text-red-400 font-medium">시장 의존적</div>
                        <div className="text-sm text-gray-400 mt-1">상승장에서만 수익, 하락장에서 큰 손실</div>
                      </td>
                      <td className="py-4 px-2 sm:px-6 text-center">
                        <div className="text-green-400 font-medium">시장 독립적</div>
                        <div className="text-sm text-gray-400 mt-1">상승/하락장 모두에서 안정적 수익</div>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 px-2 sm:px-6 font-semibold">
                        <div className="text-white">자본 효율성</div>
                        <div className="text-sm text-gray-400 mt-1">투자 대비 수익률</div>
                      </td>
                      <td className="py-4 px-2 sm:px-6 text-center">
                        <div className="text-red-400 font-medium">낮은 효율성</div>
                        <div className="text-sm text-gray-400 mt-1">많은 자본으로 적은 수익</div>
                      </td>
                      <td className="py-4 px-2 sm:px-6 text-center">
                        <div className="text-green-400 font-medium">높은 효율성</div>
                        <div className="text-sm text-gray-400 mt-1">적은 자본으로 큰 수익</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI 기능 어필 섹션 */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              지금 바로 <span className="font-sacheon text-blue-400">무료</span>로 제공받는
            </h2>
                          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                <span className="font-sacheon">MegaBit</span>의 핵심 AI 기능
              </h3>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              다른 곳에서는 아예 없는 고급 AI 기능을 지금 바로 무료로 경험하세요
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* AI 기반 진입 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 backdrop-blur-sm rounded-3xl p-8 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 shadow-2xl"
            >
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mr-4">
                  🎯
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">AI 기반 진입</h3>
                  <p className="text-blue-400 font-semibold">시장의 최적 진입점을 AI가 선별</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300">실시간 시장 분석으로 최적의 매수 타이밍을 정확히 포착</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300">감정적 판단 없이 데이터 기반으로 객관적 진입 결정</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300">24시간 연속 모니터링으로 놓치지 않는 기회 포착</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <p className="text-blue-300 text-sm font-medium">
                  💡 <span className="font-semibold">다른 곳에서는 아예 없는</span> 기능을 
                  <span className="text-white font-bold"> 지금 무료</span>로!
                </p>
              </div>
            </motion.div>

            {/* AI 기반 리스크 매니징 */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-sm rounded-3xl p-8 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 shadow-2xl"
            >
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mr-4">
                  🛡️
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">AI 기반 리스크 매니징</h3>
                  <p className="text-green-400 font-semibold">손실을 최소화하는 스마트한 방어 시스템</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300">동적인 포지션 관리로 시장 상황에 맞춰 실시간 리스크 조정</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300">포지션 크기를 자동으로 조절하여 자본 보호</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300">예측 불가능한 시장 변동에도 안전한 자금 관리</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                <p className="text-green-300 text-sm font-medium">
                  💡 <span className="font-semibold">다른 곳에서는 아예 없는</span> 기능을 
                  <span className="text-white font-bold"> 지금 무료</span>로!
                </p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-500/30 mb-8">
              <h3 className="text-2xl font-bold text-white mb-3">
                🚨 얼리버드 전용 혜택
              </h3>
              <p className="text-yellow-300 text-lg">
                이 두 기능은 곧 유료화될 예정입니다. 지금 가입하시면 
                <span className="text-white font-bold"> 평생 무료</span>로 이용하실 수 있습니다!
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center space-x-2 mx-auto hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-2xl"
              onClick={() => window.open('https://t.me/winwin_bot', '_blank')}
            >
              <MessageCircle className="w-5 h-5" />
              <span>텔레그램으로 얼리버드 상담하기</span>
            </motion.button>
            <p className="text-sm text-gray-400 mt-4">
              상담용 텔레그램 채널 : <a href="https://t.me/winwin_bot" className="text-blue-400 hover:text-blue-500">@winwin_bot</a>
            </p>
          </motion.div>
        </div>
      </section>

             {/* Roadmap Section */}
       <section className="py-20 px-3 bg-gradient-to-br from-slate-900 via-purple-900/20 to-black relative overflow-hidden">
         {/* Background Image */}
         <div 
           className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
           style={{ backgroundImage: `url(${require('../assets/section-bg.jpg')})` }}
         ></div>
         {/* Overlay */}
         <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-purple-900/40 to-black/80"></div>
         <div className="max-w-6xl mx-auto relative z-10">
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
             viewport={{ once: true }}
             className="text-center mb-16"
           >
             <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                               <span className="font-sacheon">MegaBit</span>의 미래 로드맵
             </h2>
             <p className="text-xl text-gray-300 max-w-3xl mx-auto">
               지속적인 혁신으로 더욱 강력한 트레이딩 플랫폼을 만들어갑니다
             </p>
           </motion.div>

           <div className="grid md:grid-cols-2 gap-8 mb-12">
             {/* AI Track */}
             <motion.div
               initial={{ opacity: 0, x: -30 }}
               whileInView={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.8 }}
               viewport={{ once: true }}
               className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 backdrop-blur-sm rounded-3xl p-8 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 shadow-2xl"
             >
               <div className="flex items-center mb-8">
                 <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                   <Bot className="w-8 h-8 text-white" />
                 </div>
                 <div>
                   <h3 className="text-2xl font-bold text-white">AI 기능 트랙</h3>
                   <p className="text-blue-400 font-semibold">차세대 AI 기술 도입</p>
                 </div>
               </div>
               
               <div className="space-y-4">
                 {[
                   { text: "다양한 모델 도입 확장", desc: "GPT-4, Claude 등 최신 모델 통합" },
                   { text: "실시간 시장 감정 분석", desc: "소셜미디어, 뉴스 데이터 실시간 분석" },
                   { text: "멀티 타임프레임 분석", desc: "1분~월봉까지 모든 시간대 동시 분석" },
                   { text: "커스텀 AI 전략 생성", desc: "개인별 맞춤형 트레이딩 전략 자동 생성" },
                   { text: "예측 정확도 향상 알고리즘", desc: "머신러닝 기반 지속적 학습 시스템" }
                 ].map((feature, index) => (
                   <div key={index} className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                     <div className="flex items-start space-x-3">
                       <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                       <div>
                         <p className="text-white font-semibold">{feature.text}</p>
                         <p className="text-blue-300 text-sm mt-1">{feature.desc}</p>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </motion.div>

             {/* Community Track */}
             <motion.div
               initial={{ opacity: 0, x: 30 }}
               whileInView={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.8 }}
               viewport={{ once: true }}
               className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-sm rounded-3xl p-8 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 shadow-2xl"
             >
               <div className="flex items-center mb-8">
                 <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                   <Users className="w-8 h-8 text-white" />
                 </div>
                 <div>
                   <h3 className="text-2xl font-bold text-white">커뮤니티 트랙</h3>
                   <p className="text-green-400 font-semibold">트레이더 생태계 구축</p>
                 </div>
               </div>
               
               <div className="space-y-4">
                 {[
                   { text: "트레이더 커뮤니티 플랫폼", desc: "실시간 소통과 정보 공유 공간" },
                   { text: "전략 공유 및 평가 시스템", desc: "성공 전략의 검증된 공유 플랫폼" },
                   { text: "실시간 채팅 및 알림", desc: "24시간 실시간 시장 정보 공유" },
                   { text: "성과 리더보드", desc: "투명한 수익률 비교 및 경쟁 시스템" },
                   { text: "전문가 멘토링 프로그램", desc: "1:1 맞춤형 투자 교육 서비스" }
                 ].map((feature, index) => (
                   <div key={index} className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                     <div className="flex items-start space-x-3">
                       <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                       <div>
                         <p className="text-white font-semibold">{feature.text}</p>
                         <p className="text-green-300 text-sm mt-1">{feature.desc}</p>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </motion.div>
           </div>

           {/* Timeline */}
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.4 }}
             viewport={{ once: true }}
             className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20"
           >
             <h3 className="text-2xl font-bold text-white text-center mb-8">🚀 개발 로드맵</h3>
             <div className="grid md:grid-cols-3 gap-6">
               {[
                 { phase: "Phase 1", title: "기반 구축", period: "2025 Q3-Q4", features: ["AI 엔진 고도화", "사용자 인터페이스 개선", "기본 커뮤니티 기능"] },
                 { phase: "Phase 2", title: "확장 성장", period: "2026 Q1-Q2", features: ["고급 AI 모델 도입", "커뮤니티 플랫폼 런칭", "모바일 앱 출시"] },
                 { phase: "Phase 3", title: "생태계 완성", period: "2026 Q3-Q4", features: ["글로벌 서비스 확장", "기관 투자자 서비스", "AI 연구소 설립"] }
               ].map((phase, index) => (
                 <div key={index} className="text-center">
                   <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl p-6 border border-purple-500/30">
                     <div className="text-purple-400 font-bold text-sm mb-2">{phase.phase}</div>
                     <h4 className="text-xl font-bold text-white mb-2">{phase.title}</h4>
                     <div className="text-blue-400 font-semibold mb-4">{phase.period}</div>
                     <div className="space-y-2">
                       {phase.features.map((feature, idx) => (
                         <div key={idx} className="text-gray-300 text-sm">• {feature}</div>
                       ))}
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           </motion.div>
         </div>
       </section>

      {/* Early Bird Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-purple-900/50 to-blue-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-6 md:p-12 border border-white/20"
          >
            <div className="flex items-center justify-center mb-6">
              <h2 className="text-4xl md:text-5xl font-bold text-white">얼리버드 특별 혜택</h2>
            </div>
            
            <p className="text-2xl text-gray-300 mb-8">
              선착순 가입자 100명에게 드리는 평생 무료 혜택
            </p>
            
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl p-6 mb-8 border border-green-500/30">
              <h3 className="text-3xl font-bold text-white mb-4">곧 유료화가 될 다양한 기능들</h3>
              
              {/* 현재 제공 기능 */}
              <div className="mb-4">
                <div className="grid md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                  {[
                    "AI 기반 포지션 진입",
                    "AI 기반 리스크 매니징 트리거"
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-200">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 구분선 */}
              <div className="flex items-center my-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
                <div className="px-4 py-1 bg-green-500/20 rounded-full border border-green-500/30">
                  <span className="text-xs font-medium text-green-400">Coming Soon</span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
              </div>
              
              {/* 차후 공개될 기능 */}
              <div>
                <h4 className="text-lg font-semibold text-gray-400 mb-3">차후 공개될 기능</h4>
                <div className="grid md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                  {[
                    "나만의 커스텀 AI 생성",
                    "LLM 기반 AI Persona 추적",
                    "리더보드 기반 전문가 커뮤니티",
                    "AI 기반 백테스팅"
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-5 h-5 rounded-full border-2 border-gray-500 flex-shrink-0"></div>
                      <span className="text-gray-400">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center space-x-2 mx-auto hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-2xl"
              onClick={() => window.open('https://t.me/winwin_bot', '_blank')}
            >
              <span>텔레그램으로 얼리버드 신청하기</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            
            <p className="text-sm text-gray-400 mt-4">
              상담용 텔레그램 채널 : <a href="https://t.me/winwin_bot" className="text-blue-400 hover:text-blue-500">@winwin_bot</a>
            </p>
          </motion.div>
        </div>
      </section>
      

      {/* 클로즈 테스트 리뷰 섹션 */}
      <section className="py-20 px-0 bg-gradient-to-b from-slate-900 to-black overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              클로즈 테스트 리뷰
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              많은 사용자가 경험한 <span className="font-sacheon">MegaBit</span>의 놀라운 성과
            </p>
          </motion.div>
        </div>

        {/* 무한 스크롤 캐러셀 */}
        <div className="relative">
          <div className="flex animate-scroll" id="testimonial-carousel">
            {[
              {
                name: "김철수",
                role: "개인 투자자",
                avatar: "👨‍💼",
                days: 15,
                profit: 87.42,
                positions: 8,
                seed: 10000,
                entryType: "AI",
                riskType: "AI",
                content: "처음에는 반신반의했는데, 정말 놀랍네요! 한 달 만에 87.42% 수익을 냈어요. <span className='font-sacheon'>MegaBit</span> 덕분에 투자에 대한 자신감이 생겼습니다."
              },
              {
                name: "이영희",
                role: "직장인",
                avatar: "👩‍💻",
                days: 12,
                profit: 124.67,
                positions: 6,
                seed: 5000,
                entryType: "시장가",
                riskType: "AI",
                content: "바쁜 직장생활 중에도 자동으로 수익을 내주니까 정말 편해요. 월 15만원 투자로 월 3만원씩 수익이 나고 있어요!"
              },
              {
                name: "박민수",
                role: "대학생",
                avatar: "👨‍🎓",
                days: 23,
                profit: 95.31,
                positions: 12,
                seed: 2000,
                entryType: "AI",
                riskType: "AI",
                content: "용돈으로 시작했는데 벌써 50만원이 되었어요! <span className='font-sacheon'>MegaBit</span>의 AI가 정말 똑똑한 것 같아요. 친구들한테도 추천했어요."
              },
              {
                name: "최지영",
                role: "주부",
                avatar: "👩‍🍳",
                days: 8,
                profit: 67.89,
                positions: 5,
                seed: 3000,
                entryType: "지정가",
                riskType: "AI",
                content: "가계부에 투자 항목이 생겼어요! 매달 꾸준히 수익이 나서 기분이 좋아요. 남편도 깜짝 놀랐답니다."
              },
              {
                name: "정현우",
                role: "프리랜서",
                avatar: "👨‍🎨",
                days: 19,
                profit: 138.76,
                positions: 10,
                seed: 70000,
                entryType: "AI",
                riskType: "AI",
                content: "수입이 불규칙한데도 안정적으로 수익을 낼 수 있어서 좋아요. <span className='font-sacheon'>MegaBit</span>이 제 금융 파트너가 되었어요!"
              },
              {
                name: "한소영",
                role: "사업가",
                avatar: "👩‍💼",
                days: 26,
                profit: 112.45,
                positions: 7,
                seed: 30000,
                entryType: "시장가",
                riskType: "수동",
                content: "사업 자금 일부를 투자했는데 예상보다 훨씬 좋은 결과가 나왔어요. AI의 정확도가 정말 대단해요!"
              },
              {
                name: "임동현",
                role: "IT 개발자",
                avatar: "👨‍💻",
                days: 21,
                profit: 89.23,
                positions: 11,
                seed: 15000,
                entryType: "AI",
                riskType: "AI",
                content: "개발자로서 AI 기술에 관심이 많았는데, 실제로 이렇게 효과적인 시스템이 있다니 놀라워요. 코드도 깔끔하고 안정적이에요."
              },
              {
                name: "윤미라",
                role: "의사",
                avatar: "👩‍⚕️",
                days: 14,
                profit: 73.58,
                positions: 6,
                seed: 1000,
                entryType: "AI",
                riskType: "AI",
                content: "의료진은 바쁘기만 한데, 이런 자동화 시스템이 있다니 정말 다행이에요. 투자 공부할 시간도 없었는데 이제 걱정 없어요."
              },
              {
                name: "강태호",
                role: "교사",
                avatar: "👨‍🏫",
                days: 11,
                profit: 56.92,
                positions: 4,
                seed: 8000,
                entryType: "지정가",
                riskType: "AI",
                content: "안정적인 직업이라 투자에 보수적이었는데, <span className='font-sacheon'>MegaBit</span> 덕분에 안전하게 수익을 낼 수 있게 되었어요."
              },
              {
                name: "송은지",
                role: "디자이너",
                avatar: "👩‍🎨",
                days: 17,
                profit: 101.34,
                positions: 9,
                seed: 12000,
                entryType: "AI",
                riskType: "AI",
                content: "창의적인 일을 하는데 금융은 어려웠어요. 하지만 <span className='font-sacheon'>MegaBit</span>은 정말 쉽고 직관적이에요!"
              }
            ].map((testimonial, index) => (
              <div key={index} className="w-80 flex-shrink-0 px-4">
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{testimonial.avatar}</div>
                      <div>
                        <h4 className="text-white font-semibold">{testimonial.name.charAt(0)}**</h4>
                        <p className="text-gray-400 text-sm">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold text-lg">+{testimonial.profit.toFixed(2)}%</div>
                      <div className="text-gray-400 text-xs">{testimonial.days}일간</div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
                      <span>포지션 진입</span>
                      <span className="text-blue-400 font-semibold">{testimonial.positions}회</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(testimonial.positions * 8, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex flex-col gap-1 text-xs text-gray-400 bg-gray-800/60 rounded-lg px-3 py-2 mb-2">
                      <div>시드: <span className="text-white font-semibold">${testimonial.seed.toLocaleString()}</span></div>
                      <div>진입 방식: <span className="text-white font-semibold">{testimonial.entryType}</span></div>
                      <div>리스크 매니징: <span className="text-white font-semibold">{testimonial.riskType}</span></div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: testimonial.content }}></p>
                </div>
              </div>
            ))}
            {/* 무한 스크롤을 위한 복제 */}
            {[
              {
                name: "김철수",
                role: "개인 투자자",
                avatar: "👨‍💼",
                days: 13,
                profit: 78.91,
                positions: 8,
                seed: 50000,
                entryType: "AI",
                riskType: "AI",
                content: "처음에는 반신반의했는데, 정말 놀랍네요! 한 달 만에 78.91% 수익을 냈어요. <span className='font-sacheon'>MegaBit</span> 덕분에 투자에 대한 자신감이 생겼습니다."
              },
              {
                name: "이영희",
                role: "직장인",
                avatar: "👩‍💻",
                days: 9,
                profit: 115.67,
                positions: 6,
                seed: 15000,
                entryType: "지정가",
                riskType: "AI",
                content: "바쁜 직장생활 중에도 자동으로 수익을 내주니까 정말 편해요. 월 15만원 투자로 월 3만원씩 수익이 나고 있어요!"
              },
              {
                name: "박민수",
                role: "대학생",
                avatar: "👨‍🎓",
                days: 24,
                profit: 142.33,
                positions: 12,
                seed: 5000,
                entryType: "AI",
                riskType: "AI",
                content: "용돈으로 시작했는데 벌써 50만원이 되었어요! <span className='font-sacheon'>MegaBit</span>의 AI가 정말 똑똑한 것 같아요. 친구들한테도 추천했어요."
              },
              {
                name: "최지영",
                role: "주부",
                avatar: "👩‍🍳",
                days: 7,
                profit: 45.78,
                positions: 5,
                seed: 3000,
                entryType: "지정가",
                riskType: "AI",
                content: "가계부에 투자 항목이 생겼어요! 매달 꾸준히 수익이 나서 기분이 좋아요. 남편도 깜짝 놀랐답니다."
              },
              {
                name: "정현우",
                role: "프리랜서",
                avatar: "👨‍🎨",
                days: 28,
                profit: 129.45,
                positions: 10,
                seed: 70000,
                entryType: "AI",
                riskType: "AI",
                content: "수입이 불규칙한데도 안정적으로 수익을 낼 수 있어서 좋아요. <span className='font-sacheon'>MegaBit</span>이 제 금융 파트너가 되었어요!"
              }
            ].map((testimonial, index) => (
              <div key={`duplicate-${index}`} className="w-80 flex-shrink-0 px-4">
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{testimonial.avatar}</div>
                      <div>
                        <h4 className="text-white font-semibold">{testimonial.name.charAt(0)}**</h4>
                        <p className="text-gray-400 text-sm">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold text-lg">+{testimonial.profit.toFixed(2)}%</div>
                      <div className="text-gray-400 text-xs">{testimonial.days}일간</div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
                      <span>포지션 진입</span>
                      <span className="text-blue-400 font-semibold">{testimonial.positions}회</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(testimonial.positions * 8, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex flex-col gap-1 text-xs text-gray-400 bg-gray-800/60 rounded-lg px-3 py-2 mb-2">
                      <div>시드: <span className="text-white font-semibold">${testimonial.seed.toLocaleString()}</span></div>
                      <div>진입 방식: <span className="text-white font-semibold">{testimonial.entryType}</span></div>
                      <div>리스크 매니징: <span className="text-white font-semibold">{testimonial.riskType}</span></div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: testimonial.content }}></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GPU 클러스터 섹션 */}
      <section className="py-20 px-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 relative overflow-hidden">
        {/* GPU 클러스터 배경 이미지 */}
        <div className="absolute inset-0 opacity-20">
          <img 
            src={require('../assets/h100-og.jpg')} 
            alt="GPU 클러스터" 
            className="w-full h-full object-cover blur-sm"
          />
        </div>
        {/* 배경 패턴 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          {/* 헤더 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full px-6 py-3 border border-red-500/30 mb-6">
              <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-red-300 font-medium">🔥 얼리버드 마감 임박</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                The True AI Trading
              </span>
              <br />
              <span className="text-3xl md:text-4xl text-gray-300">GPU 클러스터 호실 분양 마감 임박!</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              <span className="font-sacheon">MegaBit</span>이 확보한 초고성능 AI 리소스를 얼리버드 고객만을 위한 <span className="text-yellow-400 font-semibold">전용 호실</span>로 분양합니다.<br />
              후발 유입자들에게는 유상 제공될 예정이므로 지금이 마지막 기회입니다.
            </p>
          </motion.div>

          {/* GPU 스펙 카드들 */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: "🏢",
                title: "전용 호실 분양",
                description: "고성능 GPU 클러스터의 전용 공간을 얼리버드 고객에게만 할당하여 독점적 사용권 제공",
                spec: "전용 공간"
              },
              {
                icon: "⚡",
                title: "무제한 AI 연산",
                description: "분양받은 호실에서 24시간 무제한으로 AI 연산을 수행할 수 있는 권한",
                spec: "무제한 사용"
              },
              {
                icon: "🎯",
                title: "평생 무료 이용",
                description: "얼리버드 분양 고객은 향후 유료화되어도 평생 무료로 AI 기능을 이용",
                spec: "평생 무료"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 group"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-300 text-sm mb-4">{item.description}</p>
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg px-3 py-1 inline-block">
                  <span className="text-blue-300 font-mono text-sm">{item.spec}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 하이라이트 섹션 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-red-600/20 via-orange-600/20 to-yellow-600/20 rounded-3xl p-8 border border-red-500/30 mb-8"
          >
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-center md:text-left mb-6 md:mb-0">
                <h3 className="text-2xl font-bold text-white mb-2">🔥 얼리버드 분양 마감 임박</h3>
                <p className="text-gray-300">한정된 호실만 남았습니다. 후발 유입자들은 유료 이용이 필수입니다.</p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400">100</div>
                  <div className="text-sm text-gray-400">준비한 호실</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400">비공개</div>
                  <div className="text-sm text-gray-400">남은 호실</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">∞</div>
                  <div className="text-sm text-gray-400">평생 무료</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA 버튼 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-red-500 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center space-x-2 mx-auto hover:from-red-600 hover:to-orange-700 transition-all duration-300 shadow-2xl"
              onClick={() => window.open('https://t.me/winwin_bot', '_blank')}
            >
              <span>🔥 텔레그램으로 얼리버드 신청하기</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <p className="text-sm text-red-400 mt-4 font-semibold">
              ⚠️ 마감 임박! 후발 유입자들은 유료 이용이 필수입니다
            </p>
            <p className="text-sm text-gray-400 mt-4">
              상담용 텔레그램 채널 : <a href="https://t.me/winwin_bot" className="text-blue-400 hover:text-blue-500">@winwin_bot</a>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-900 via-purple-900/30 to-black">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              <span className="font-sacheon">MegaBit</span>을 만드는 사람들
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              금융과 AI 기술의 전문가들이 모여 만든 혁신적인 트레이딩 플랫폼
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* CEO - 한국인 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 backdrop-blur-sm rounded-3xl p-8 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 shadow-2xl"
            >
              <div className="text-center">
                               <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center text-6xl">
                 😎
               </div>
                <h3 className="text-2xl font-bold text-white mb-2">BOSS</h3>
                <p className="text-blue-400 font-semibold mb-4">CEO & Co-Founder</p>
                <div className="space-y-3 text-left">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-300 text-sm">前 삼성증권 퀀트팀 팀장</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-300 text-sm">연세대 금융공학 박사</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-300 text-sm">15년+ 금융권 경력</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-300 text-sm">AI 트레이딩 시스템 설계 전문가</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CTO - 한국인 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-sm rounded-3xl p-8 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 shadow-2xl"
            >
              <div className="text-center">
                                 <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center text-6xl">
                   🤓
                 </div>
                <h3 className="text-2xl font-bold text-white mb-2">TECHMAN</h3>
                <p className="text-green-400 font-semibold mb-4">CTO & Co-Founder</p>
                <div className="space-y-3 text-left">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300 text-sm">前 네이버 AI 연구소 수석연구원</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300 text-sm">KAIST 컴퓨터공학 박사</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300 text-sm">머신러닝/딥러닝 전문가</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300 text-sm">대규모 AI 시스템 아키텍처 설계</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* AI Research Lead - 외국인 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 backdrop-blur-sm rounded-3xl p-8 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 shadow-2xl"
            >
              <div className="text-center">
                                 <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center text-6xl">
                   🧐
                 </div>
                <h3 className="text-2xl font-bold text-white mb-2">AI Nerd</h3>
                <p className="text-yellow-400 font-semibold mb-4">AI Research Lead</p>
                <div className="space-y-3 text-left">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-gray-300 text-sm">前 Google DeepMind 연구원</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-gray-300 text-sm">Stanford AI 박사</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-gray-300 text-sm">강화학습 전문가</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-gray-300 text-sm">금융 AI 모델 개발 경험 10년+</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-3">
                💼 총 <span className="text-blue-400 font-bold">35억원</span> 투자 유치
              </h3>
              <p className="text-gray-300">
                국내외 유명 VC들과 엔젤 투자자들의 신뢰를 받아 안정적인 성장을 이어가고 있습니다
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-3 bg-black/50 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
                      <div className="flex items-center justify-center mb-6">
              <h3 className="text-2xl font-bold text-white font-sacheon">MegaBit</h3>
            </div>
          
          <p className="text-gray-400 mb-6">
            AI 기반 DCA 트레이딩으로 안전하고 효율적인 투자를 경험하세요
          </p>
          
          <div className="flex justify-center space-x-6 text-sm text-gray-500">
                            <span>© 2025 <span className="font-sacheon">MegaBit</span>. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 