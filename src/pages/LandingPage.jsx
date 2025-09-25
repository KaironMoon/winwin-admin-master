import React from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  Shield,
  BarChart3,
  Zap,
  Users,
  ArrowRight,
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

            <h2 className="text-2xl md:text-4xl font-bold text-white">
              관리프로그램
            </h2>
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