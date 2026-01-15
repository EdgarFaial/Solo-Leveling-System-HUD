import React, { useEffect, useRef, useState } from 'react';
import { Zap, Target, Shield, Brain, Dumbbell } from 'lucide-react';

interface ImmersiveAdProps {
  section: string;
}

const ImmersiveAd: React.FC<ImmersiveAdProps> = ({ section }) => {
  const [isVisible, setIsVisible] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );
    
    if (adRef.current) {
      observer.observe(adRef.current);
    }
    
    return () => {
      if (adRef.current) {
        observer.unobserve(adRef.current);
      }
    };
  }, []);
  
  // Anúncios mockados para desenvolvimento
  const mockAds = [
    {
      title: "OTIMIZADOR DE FOCO S-RANK",
      description: "App de bloqueio de distrações. Aumente +30% produtividade.",
      icon: Brain,
      color: "text-cyan-400"
    },
    {
      title: "MONITOR BIOMÉTRICO",
      description: "Smartwatch com análise de sono e estresse. Integração direta com Sistema.",
      icon: Target,
      color: "text-green-400"
    },
    {
      title: "SUPLEMENTO NEURO",
      description: "Nootrópico para +2 INT. Aprovado pelo Protocolo Arquiteto.",
      icon: Shield,
      color: "text-purple-400"
    },
    {
      title: "TREINO ESPARTANO",
      description: "Programa de 30 dias para +5 FOR. Protocolo militar adaptado.",
      icon: Dumbbell,
      color: "text-red-400"
    },
    {
      title: "APP DE MEDITAÇÃO",
      description: "Técnicas de respiração para +3 VONTADE. Controle mental total.",
      icon: Zap,
      color: "text-yellow-400"
    }
  ];
  
  const randomAd = mockAds[Math.floor(Math.random() * mockAds.length)];
  const Icon = randomAd.icon;
  
  if (!isVisible) {
    return (
      <div ref={adRef} className="ad-container cut-corners my-6 animate-pulse">
        <div className="h-24 bg-white/5 rounded"></div>
      </div>
    );
  }
  
  return (
    <div 
      ref={adRef}
      className={`ad-container cut-corners my-6 ${isVisible ? 'visible' : ''}`}
    >
      <div className="pt-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 bg-white/5 rounded ${randomAd.color}`}>
            <Icon size={20} />
          </div>
          <div className="flex-1">
            <h4 className={`text-[11px] font-black uppercase italic ${randomAd.color}`}>
              {randomAd.title}
            </h4>
            <p className="text-[10px] text-gray-400 uppercase italic mt-1">
              {randomAd.description}
            </p>
            <button className="mt-3 text-[9px] text-cyan-400 font-black uppercase italic border border-cyan-400/30 px-3 py-1 cut-corners hover:bg-cyan-400/10 transition-all">
              [ ACESSAR RECURSO ]
            </button>
          </div>
        </div>
      </div>
      <div className="text-[7px] text-gray-600 text-center mt-3 font-black uppercase">
        PUBLICIDADE • SISTEMA DE OTIMIZAÇÃO
      </div>
    </div>
  );
};

export default ImmersiveAd;