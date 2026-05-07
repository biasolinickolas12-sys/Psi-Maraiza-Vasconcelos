/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "motion/react";
import { 
  Home,
  BookOpen,
  Sparkles,
  Phone,
  Lightbulb,
  Monitor, 
  GraduationCap, 
  Users, 
  Layers, 
  Globe,
  IdCard,
  Heart, 
  ChevronLeft,
  ChevronRight,
  ArrowRight, 
  MessageCircle, 
  MessagesSquare,
  CheckCircle2,
  Check,
  ShieldCheck,
  Scale,
  Lock,
  Menu,
  X,
  Instagram,
  Flower2,
  Plus,
  Minus,
  Edit2,
  DollarSign,
  CalendarDays,
  LineChart as LineChartIcon,
  Filter
} from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { AdminPortal } from "./AdminPortal";
import { supabase } from "./supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

// Triage Section Component
const TriageSection = ({ isMobile }: { isMobile: boolean }) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  
  const [answers, setAnswers] = useState<Record<string, string>>({
    nome: "",
    idade: "",
    objetivo: "",
    queixa: "",
  });

  const questions = [
    { 
      id: "nome", 
      label: "Como se chama?", 
      type: "text", 
      placeholder: "Seu nome aqui..." 
    },
    { 
      id: "idade", 
      label: "Quantos anos tem?", 
      type: "text", 
      inputMode: "numeric",
      pattern: "[0-9]*",
      placeholder: "Ex: 28" 
    },
    { 
      id: "objetivo", 
      label: "O que procura num processo de psicoterapia?", 
      type: "text", 
      placeholder: "Descreva o que busca..." 
    },
    { 
      id: "queixa", 
      label: "Qual sua principal queixa ou desafio no momento?", 
      type: "text", 
      placeholder: "Fale um pouco sobre o que te trouxe aqui..." 
    }
  ];

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      processTriage();
    }
  };

  const processTriage = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('leads_entrada')
        .insert([
          { 
            nome: answers.nome, 
            idade: answers.idade, 
            objetivo: answers.objetivo, 
            queixa: answers.queixa 
          }
        ]);
      
      if (error) throw error;
      
      setLoading(false);
      setCompleted(true);
    } catch (error) {
      console.error("Erro ao salvar triagem:", error);
      // Fallback para continuar mesmo com erro
      setLoading(false);
      setCompleted(true);
    }
  };

  const generateWhatsAppLink = () => {
    const phone = "553498859591";
    
    const message = `🌟 *Nova Triagem Digital Realizada!* 🌟\n\n` +
      `Olá Maraiza! 👋 Acabei de completar o formulário no seu site e gostaria de iniciar meu acompanhamento psicoterapêutico. 🤝\n\n` +
      `✨ *Meus dados:*\n` +
      `👤 *Nome:* ${answers.nome}\n` +
      `🎂 *Idade:* ${answers.idade}\n` +
      `🎯 *Objetivo:* ${answers.objetivo}\n` +
      `💭 *Queixa Principal:* ${answers.queixa}\n\n` +
      `Aguardo seu retorno para agendarmos! ✨🚀`;
    
    const encodedMessage = encodeURIComponent(message);
    
    return `https://wa.me/${phone}?text=${encodedMessage}`;
  };

  const renderInput = (q: any) => {
    if (q.type === "text" || q.type === "number" || q.type === "tel") {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <input 
            type={q.type}
            inputMode={q.inputMode}
            pattern={q.pattern}
            placeholder={q.placeholder}
            value={answers[q.id]}
            onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
            className="w-full bg-orange-50/50 border-[3px] border-slate-100 rounded-[2rem] px-8 py-6 text-2xl font-bold focus:border-brand-orange focus:bg-white transition-all outline-none shadow-inner focus:shadow-[0_0_30px_rgba(249,115,22,0.15)] group-hover:border-slate-200"
          />
          {answers[q.id] && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-orange"
            >
              <CheckCircle2 size={32} />
            </motion.div>
          )}
        </motion.div>
      );
    }
    if (q.type === "select" || q.type === "choice") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {q.options.map((opt: string) => (
            <motion.button
              key={opt}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setAnswers({...answers, [q.id]: opt})}
              className={`px-8 py-6 rounded-[2rem] border-[3px] transition-all text-left font-black text-lg ${
                answers[q.id] === opt 
                  ? "border-brand-orange bg-gradient-to-br from-brand-orange to-brand-yellow text-white shadow-[0_0_40px_rgba(249,115,22,0.4)]" 
                  : "border-slate-100 bg-white text-slate-800 hover:border-brand-orange/30 hover:shadow-2xl shadow-lg shadow-slate-200/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{opt}</span>
                {answers[q.id] === opt && <Check size={24} />}
              </div>
            </motion.button>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <section id="triagem" className="py-16 md:py-24 relative overflow-hidden">
      {/* Background Decor matching Home style - Desktop */}
      <div className="hidden md:block absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-slate-50/50 -z-20" />
        <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-brand-orange/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-brand-yellow/10 blur-[120px] rounded-full" />
        
        {/* Animated Abstract Elements - More Vibrant */}
        <motion.div
          animate={isMobile ? {} : {
            scale: [1, 1.3, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-[10%] w-[500px] h-[500px] bg-brand-orange/20 blur-[120px] rounded-full mix-blend-multiply"
        />
        <motion.div
          animate={isMobile ? {} : {
            scale: [1, 1.4, 1],
            rotate: [0, -60, 0],
            x: [0, -60, 0],
            y: [0, 40, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] left-[5%] w-[600px] h-[600px] bg-brand-yellow/15 blur-[140px] rounded-full mix-blend-multiply"
        />

        {/* Floating Geometric Elements */}
        <motion.div
          animate={isMobile ? {} : { 
            rotate: 360,
            y: [0, -40, 0],
            x: [0, 20, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[15%] left-[10%] w-16 h-16 border-2 border-brand-orange/20 rounded-2xl opacity-40"
        />
        <motion.div
          animate={isMobile ? {} : { 
            rotate: -360,
            x: [0, 40, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[20%] right-[10%] w-24 h-24 border-4 border-brand-yellow/30 rounded-full opacity-30"
        />
        <motion.div
          animate={isMobile ? {} : { 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.4, 0.1],
            rotate: [0, 45, 0]
          }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-[60%] right-[5%] w-40 h-40 bg-brand-orange/5 rounded-3xl blur-2xl"
        />
        
        {/* Dotted Patterns */}
        <div className="absolute top-[10%] right-[20%] w-32 h-32 opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, #f97316 2px, transparent 0)', backgroundSize: '16px 16px' }} />
        
        <motion.div 
          animate={isMobile ? {} : { y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute bottom-[10%] left-[20%] w-48 h-48 border-2 border-dashed border-brand-yellow/20 rounded-full opacity-30" 
        />
        
        {/* Small Rectangles */}
        <motion.div
          animate={{ rotate: [0, 90, 180, 270, 360] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-[15%] w-8 h-8 border border-brand-orange/30 rounded-md opacity-20"
        />
        
        {/* Background blobs maintained for blush effect */}
      </div>

      {/* Static Mobile Fallback - Zero Animations, Zero Lag */}
      <div className="md:hidden absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-slate-50/50 -z-20" />
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-brand-orange/5 rounded-full" />
        <div className="absolute bottom-0 -left-10 w-56 h-56 bg-brand-yellow/5 rounded-full" />
        <div className="absolute top-[20%] right-[10%] w-24 h-24 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, #f97316 2px, transparent 0)', backgroundSize: '16px 16px' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-10 md:mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-slate-900 border border-brand-orange/20 text-white font-bold text-[8px] md:text-[10px] uppercase tracking-[0.2em] mb-6 md:mb-8 shadow-2xl shadow-brand-orange/10"
          >
            <Sparkles size={14} className="text-brand-yellow" />
            <span>Processo de Acompanhamento Profissional</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-7xl font-black text-slate-900 mb-6 md:mb-8 italic tracking-tighter leading-none">
            Triagem <span className="text-brand-orange drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]">Digital</span>
          </h2>
          
          <div className="max-w-xl mx-auto space-y-4 md:space-y-6">
            <p className="text-slate-600 text-lg md:text-xl leading-relaxed font-serif italic">
              Oi tudo bem? Que bom te ter aqui comigo 💙<br/>
              Antes de tudo, o que você acha de me contar um pouquinho sobre você?
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Elegant Step Indicator */}
            {!completed && !loading && (
              <div className="flex justify-center gap-3 md:gap-4 mb-8 md:mb-14">
                {questions.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-2 md:h-3 rounded-full transition-all duration-700 ${
                      i === step ? "w-12 md:w-16 bg-gradient-to-r from-brand-orange to-brand-yellow shadow-[0_0_20px_rgba(249,115,22,0.6)]" : i < step ? "w-4 md:w-6 bg-brand-orange/40" : "w-4 md:w-6 bg-slate-200"
                    }`}
                  />
                ))}
              </div>
            )}

            <div 
              className={`bg-white/95 ${isMobile ? 'backdrop-blur-sm' : 'backdrop-blur-2xl'} rounded-[2.5rem] md:rounded-[4rem] p-6 mb-8 md:p-20 border-[6px] relative overflow-hidden group transition-all duration-700 ${!isMobile ? 'neon-card-glow' : 'border-brand-orange border-b-brand-yellow border-r-brand-yellow shadow-xl shadow-brand-orange/10'}`}
              style={{
                backgroundImage: "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(254,250,246,1) 100%)",
              }}
            >
              {/* Internal Glow Elements */}
              <div className="absolute inset-0 border-2 border-brand-yellow/30 rounded-[4rem] pointer-events-none shadow-[inset_0_0_60px_rgba(249,115,22,0.15)]" />
              
              {/* Gold Accents Decor */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-brand-yellow/30 to-transparent blur-3xl opacity-60" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-brand-orange/20 to-transparent blur-[80px] opacity-60" />

              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="text-center py-20"
                  >
                    <div className="relative w-32 h-32 mx-auto mb-12">
                      <div className="absolute inset-0 border-[6px] border-orange-50 rounded-full" />
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-[6px] border-transparent border-t-brand-orange rounded-full"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], rotate: [0, 45, -45, 0] }}
                          transition={{ duration: 4, repeat: Infinity }}
                        >
                          <Sparkles size={48} className="text-brand-yellow drop-shadow-2xl" />
                        </motion.div>
                      </div>
                    </div>
                    <h3 className="text-2xl md:text-4xl font-black text-slate-900 mb-6 italic tracking-tight">Verificando suas respostas</h3>
                    <p className="text-slate-500 font-serif italic text-lg md:text-2xl leading-relaxed">
                      Transformando suas respostas em uma recepção única...
                    </p>
                  </motion.div>
                ) : completed ? (
                  <motion.div 
                    key="completed"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="text-center py-10"
                  >
                    <div className="relative w-36 h-36 mx-auto mb-12">
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-[-20px] border-2 border-dashed border-brand-yellow/30 rounded-[3.5rem]"
                      />
                      <div className="w-36 h-36 bg-slate-900 border-[6px] border-brand-yellow rounded-[3.5rem] flex items-center justify-center relative shadow-[0_30px_70px_rgba(249,115,22,0.5)] rotate-6 group-hover:rotate-0 transition-transform duration-700">
                        <Check className="text-brand-yellow" size={80} strokeWidth={4} />
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-4 -right-4 w-8 h-8 bg-brand-orange rounded-full shadow-lg shadow-brand-orange/40"
                      />
                    </div>
                    <h3 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 md:mb-8 italic tracking-tight max-w-2xl mx-auto">
                      Pronto !! Agora apenas clique em "Iniciar Atendimento "
                    </h3>
                    <p className="text-slate-600 text-lg md:text-2xl mb-8 max-w-lg mx-auto leading-relaxed font-serif italic">
                      "A sua coragem em se ver é o primeiro passo para o seu novo papel no mundo."
                    </p>
                    <div className="mb-10 md:mb-12">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block mb-2">Investimento da Sessão</span>
                      <span className="text-3xl md:text-4xl font-black text-brand-orange drop-shadow-[0_0_15px_rgba(249,115,22,0.2)]">R$ 60,00</span>
                    </div>
                    <a 
                      href={generateWhatsAppLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-6 md:gap-10 bg-gradient-to-r from-brand-orange via-brand-yellow to-brand-orange bg-[length:200%_auto] hover:bg-right text-white font-black py-6 px-10 md:py-9 md:px-20 rounded-[2rem] md:rounded-[2.5rem] text-xl md:text-3xl shadow-[0_30px_80px_-15px_rgba(249,115,22,0.6)] hover:scale-[1.05] active:scale-[0.95] transition-all duration-700 group animate-gradient-xy"
                    >
                      <span className="tracking-tighter">Iniciar Atendimento</span>
                      <ArrowRight size={28} className="group-hover:translate-x-4 transition-transform duration-500" />
                    </a>
                  </motion.div>
                ) : (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="w-full"
                  >
                    <div className="mb-8 md:mb-12">
                      <h3 className="text-2xl md:text-5xl font-black text-slate-900 mb-8 md:mb-14 leading-[1.1] tracking-tight">
                        {questions[step].label}
                      </h3>
                      
                      <div className="space-y-4 md:space-y-6">
                        {renderInput(questions[step])}
                      </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row justify-between items-center mt-8 md:mt-12 gap-4 sm:gap-6 pt-8 md:pt-12 border-t border-slate-100 relative z-20">
                      <button 
                        onClick={() => step > 0 && setStep(step - 1)}
                        className={`text-sm sm:text-base font-black transition-all py-4 px-6 w-full sm:w-auto rounded-xl ${step === 0 ? "opacity-0 pointer-events-none hidden sm:flex" : "text-slate-400 hover:text-brand-orange hover:bg-slate-50 active:bg-slate-100 tracking-widest uppercase flex items-center justify-center gap-2"}`}
                        style={step === 0 ? { display: 'none' } : {}}
                      >
                        <ChevronLeft size={18} className="pointer-events-none" />
                        <span className="pointer-events-none">Voltar</span>
                      </button>
                      
                      <button 
                        onClick={handleNext}
                        disabled={!answers[questions[step].id]}
                        className={`w-full sm:w-auto bg-slate-900 text-white font-black py-5 sm:py-6 px-10 sm:px-14 rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-slate-900/10 transition-all cursor-pointer ${
                          !answers[questions[step].id] 
                            ? "opacity-30 cursor-not-allowed bg-slate-200" 
                            : "hover:bg-brand-orange hover:shadow-brand-orange/30 hover:-translate-y-1 active:scale-95 active:translate-y-0"
                        }`}
                      >
                        <span className="pointer-events-none">{step === questions.length - 1 ? "Finalizar Agora" : "Próximo Passo"}</span>
                        <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform pointer-events-none" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FAQSection = ({ isMobile }: { isMobile: boolean }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Como funciona o atendimento online?",
      answer: "Meus atendimentos online são realizados pelo Google Meet. Eu mesma envio os links para você no momento da nossa sessão, garantindo que tenhamos um espaço seguro, prático e acolhedor para o nosso encontro, onde quer que você esteja."
    },
    {
      question: "Qual a duração e frequência das sessões?",
      answer: "A duração e o prazo do acompanhamento dependem muito do seu momento e do que precisamos trabalhar — se é algo pontual ou um processo mais profundo. Sobre a frequência, o ideal é que comecemos com encontros semanais para fortalecermos nosso vínculo e o processo, e depois vamos ajustando tudo conforme a sua necessidade e evolução."
    },
    {
      question: "O que é o Psicodrama e como ele funciona?",
      answer: "O Psicodrama é uma abordagem que transforma sentimentos em experiência vivida! Ele se baseia na Espontaneidade, Criatividade, no Encontro genuíno e nos Papéis que assumimos na vida. Através dele, não apenas falamos sobre os conflitos, mas os experimentamos no 'aqui e agora' para ressignificá-los. Trabalho tanto de forma individual quanto em grupo, sempre buscando ampliar a consciência e possibilitar mudanças reais."
    },
    {
      question: "Você aceita convênios?",
      answer: "Eu não trabalho diretamente com convênios, mas ofereço planos de atendimento personalizados. Meu objetivo é que possamos viabilizar o seu processo terapêutico de uma maneira que faça sentido para você. Vamos conversar sobre as possibilidades?"
    }
  ];

  return (
    <section id="faq" className="py-16 md:py-32 bg-white relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-slate-50/50 -z-10" />
        
        {/* Intense Animated Background Blobs */}
        <motion.div
          animate={isMobile ? {} : {
            scale: [1, 1.4, 1],
            rotate: [0, 180, 0],
            x: [0, 150, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 -right-40 w-[800px] h-[800px] bg-gradient-to-br from-brand-orange to-red-500 blur-[150px] rounded-full opacity-20 mix-blend-multiply"
        />
        <motion.div
          animate={isMobile ? {} : {
            scale: [1, 1.2, 1],
            rotate: [0, -120, 0],
            x: [0, -100, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-60 -left-20 w-[900px] h-[900px] bg-gradient-to-tr from-brand-yellow via-orange-400 to-transparent blur-[160px] rounded-full opacity-25 mix-blend-multiply"
        />

        {/* Geographic Floating Elements */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`geo-${i}`}
            animate={isMobile ? {} : {
              y: [0, Math.random() * -100, 0],
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute opacity-20"
            style={{
              top: `${10 + i * 15}%`,
              left: `${(i * 18) % 90}%`,
            }}
          >
            {i % 3 === 0 ? (
              <div className="w-32 h-32 border-[10px] border-brand-orange rounded-full shadow-[0_0_40px_rgba(249,115,22,0.8)]" />
            ) : i % 3 === 1 ? (
              <div className="w-40 h-40 border-[10px] border-brand-yellow transform rotate-45 shadow-[0_0_40px_rgba(250,204,21,0.8)]" />
            ) : (
              <div className="w-0 h-0 border-l-[60px] border-l-transparent border-r-[60px] border-r-transparent border-b-[100px] border-b-brand-orange shadow-[0_30px_40px_-10px_rgba(249,115,22,0.5)]" />
            )}
          </motion.div>
        ))}

        {/* Structural Grid */}
        <div className="absolute inset-0 opacity-[0.03] grid grid-cols-12 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="border-r border-slate-900 h-full w-full" />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-24">
          <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-slate-900 border border-brand-orange/20 text-white font-bold text-[8px] md:text-[10px] uppercase tracking-[0.2em] mb-6 md:mb-10 shadow-2xl shadow-brand-orange/10">
              <Sparkles size={14} className="text-brand-yellow" />
              <span>Dúvidas Comuns</span>
            </div>
            
            <h2 className="font-serif text-4xl md:text-7xl font-bold mb-6 md:mb-10 text-slate-900 leading-tight tracking-tighter">
              Esclareça suas <br />
              <span className="text-brand-orange italic font-light relative">
                Dúvidas.
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: '100%' }}
                  className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-brand-orange to-transparent"
                />
              </span>
            </h2>
          </motion.div>
        </div>

        <div className="max-w-4xl mx-auto space-y-4 md:space-y-8">
          {faqs.slice(0, isMobile ? 4 : faqs.length).map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className={`group border-2 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden transition-all duration-700 relative shadow-2xl bg-white ${
                openIndex === idx 
                  ? "border-brand-orange shadow-[0_0_40px_rgba(249,115,22,0.4)]" 
                  : "border-brand-yellow/30 shadow-[0_20px_60px_-20px_rgba(250,204,21,0.2)] hover:border-brand-orange/50"
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full px-6 py-6 md:px-10 md:py-10 text-left flex items-center justify-between gap-4 md:gap-6 outline-none"
              >
                <div className="flex items-center gap-4 md:gap-6">
                  <span className={`text-[10px] md:text-sm font-black transition-colors duration-500 ${openIndex === idx ? 'text-brand-orange' : 'text-brand-yellow bg-slate-900/5 px-2 md:px-3 py-1 rounded-full'}`}>
                    0{idx + 1}
                  </span>
                  <span className={`text-lg md:text-2xl font-bold tracking-tight transition-all duration-500 ${openIndex === idx ? 'text-slate-900 transform scale-105 origin-left' : 'text-slate-800'}`}>
                    {faq.question}
                  </span>
                </div>
                
                <div className={`shrink-0 w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-700 ${
                  openIndex === idx 
                    ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/30 rotate-180' 
                    : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600'
                }`}>
                  {openIndex === idx ? <Minus size={18} strokeWidth={3} /> : <Plus size={18} strokeWidth={3} />}
                </div>
              </button>
              
              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="px-6 pb-8 md:px-10 md:pb-12 text-slate-600 text-lg md:text-xl leading-relaxed font-serif italic border-t border-slate-50 pt-6 md:pt-10 mx-2 md:mx-6">
                      <motion.div
                        initial={{ y: 20 }}
                        animate={{ y: 0 }}
                        className="relative"
                      >
                        <span className="absolute -left-6 md:-left-8 -top-3 md:-top-4 text-4xl md:text-6xl text-brand-orange/10 font-serif">"</span>
                        {faq.answer}
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(() => {
    try {
      return localStorage.getItem('isAdminPortalOpen') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem('isAdminPortalOpen', isAdminPortalOpen.toString());
    if (isAdminPortalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isAdminPortalOpen]);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [showExitPopup, setShowExitPopup] = useState(false);
  const [hasShownExitPopup, setHasShownExitPopup] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // Detecta se o mouse está saindo pelo topo (intenção de fechar a aba/mudar de URL)
      if (e.clientY <= 0 && !hasShownExitPopup) {
        setShowExitPopup(true);
        setHasShownExitPopup(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [hasShownExitPopup]);

  const storyImages = [
    "/WhatsApp Image 2026-04-22 at 15.52.56.jpeg",
    "/Captura de tela 2026-04-27 185511.png",
    "/Captura de tela 2026-04-27 185520.png",
    "/Captura de tela 2026-04-27 185529.png",
    "/Captura de tela 2026-04-27 185538.png",
    "/Captura de tela 2026-04-27 185550.png"
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % storyImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + storyImages.length) % storyImages.length);
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const NavItem = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => (
    <a 
      href={href} 
      className="text-gray-600 hover:text-brand-orange transition-colors duration-200 font-medium"
      onClick={onClick}
    >
      {children}
    </a>
  );

  const typingContainer = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.5
      }
    }
  };

  const charVariant = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.01 }
    }
  };

  const TypingText = ({ text, className }: { text: string; className?: string }) => {
    if (isMobile) return <span className={className}>{text}</span>;
    return (
      <>
        {text.split("").map((char, index) => (
          <motion.span key={index} variants={charVariant} className={className}>
            {char}
          </motion.span>
        ))}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-brand-yellow/30 overflow-x-hidden">
      {/* Background Graphic Elements - Artistic Flair */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Vibrant Blobs - Hidden on Mobile for Performance */}
        <div className="hidden md:block absolute -top-24 -left-24 w-96 h-96 bg-brand-orange rounded-full blur-[120px] opacity-20"></div>
        <div className="hidden md:block absolute top-1/2 -right-48 w-[600px] h-[600px] bg-brand-yellow rounded-full blur-[150px] opacity-20"></div>
        <div className="hidden md:block absolute bottom-0 left-1/4 w-80 h-80 bg-brand-blue/30 rounded-full blur-[100px] opacity-15"></div>
        <div className="hidden md:block absolute top-1/4 left-1/3 w-64 h-64 bg-pink-500/20 rounded-full blur-[100px] opacity-15"></div>
        
        {/* Geographic/Geometric Decorative Elements */}
        <motion.div 
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-[20%] w-32 h-32 border-2 border-brand-orange/20 rounded-[2rem] -rotate-12"
        />
        <motion.div 
          animate={{ 
            y: [0, -50, 0],
            rotate: [45, 90, 45]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-40 left-[10%] w-24 h-24 bg-brand-yellow/10 rounded-lg rotate-45"
        />
        <motion.div 
          animate={{ 
            x: [0, 100, 0],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-[-5%] w-[400px] h-[1px] bg-gradient-to-r from-transparent via-brand-orange to-transparent rotate-12"
        />
      </div>

      {/* New Menu Trigger Button - Top Left */}
      <motion.button 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => setIsMenuOpen(true)}
        className="fixed top-2 left-2 md:top-6 md:left-6 z-50 w-12 h-12 md:w-14 md:h-14 bg-white/80 backdrop-blur-xl rounded-full flex items-center justify-center shadow-[0_0_20px_#ff6600,inset_0_0_10px_#ff6600] border-[3px] border-[#ff6600] group hover:bg-[#ff6600] hover:shadow-[0_0_30px_#ff6600,inset_0_0_15px_#ff6600] transition-all duration-300"
      >
        <Menu className="w-5 h-5 md:w-6 md:h-6 text-[#ff6600] group-hover:text-white transition-colors" />
      </motion.button>

      {/* Slide-in Navigation Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60]"
            />
            
            {/* Sidebar with Enhanced Color and Design */}
            <motion.nav 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-full max-w-[280px] md:max-w-sm bg-white z-[70] shadow-2xl flex flex-col p-6 md:p-10 border-r border-brand-orange/20 overflow-hidden"
            >
              {/* Subtle Texture Overlay */}
              <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />
              
              {/* Vibrant Decorative Sidebar Elements */}
              <div className="absolute -top-24 -left-24 w-80 h-80 bg-brand-orange/15 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-brand-yellow/15 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute top-1/2 left-0 w-1.5 h-40 bg-gradient-to-b from-brand-orange/0 via-brand-orange to-brand-orange/0 opacity-60 flex items-center justify-center">
                <div className="w-4 h-4 bg-brand-orange blur-md" />
              </div>

              <div className="relative flex justify-between items-center mb-8 md:mb-16">
                <div className="flex items-center gap-3 md:gap-4">
                  <div 
                    onClick={() => { setIsAdminPortalOpen(true); setIsMenuOpen(false); }}
                    className="cursor-pointer w-10 h-10 md:w-12 md:h-12 bg-brand-orange rounded-2xl flex items-center justify-center shadow-lg shadow-brand-orange/30 rotate-3 group-hover:rotate-0 transition-transform"
                  >
                    <Flower2 size={24} md:size={28} className="text-white opacity-90" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg md:text-xl font-black tracking-tighter text-slate-900 leading-none">
                      MARAIZA
                    </span>
                    <span className="text-base md:text-lg font-serif italic text-brand-orange leading-none">
                      Vasconcelos
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)} 
                  className="p-2 md:p-3 text-slate-400 hover:text-white hover:bg-slate-900 transition-all duration-300 rounded-xl md:rounded-2xl bg-slate-50"
                >
                  <X size={18} md:size={20} />
                </button>
              </div>

              <div className="relative flex flex-col gap-5 flex-grow">
                {[
                  { name: 'Início', href: '#inicio', icon: Home },
                  { name: 'História', href: '#sobre', icon: BookOpen },
                  { name: 'FAQ', href: '#faq', icon: MessagesSquare },
                  { name: 'Especialidades', href: '#abordagem', icon: GraduationCap },
                  { name: 'Contato', href: '#triagem', icon: Phone }
                ].map((item, idx) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -25 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx + 0.2 }}
                  >
                    <a 
                      href={item.href} 
                      onClick={() => setIsMenuOpen(false)}
                      className="group flex items-center gap-5 text-slate-600 hover:text-brand-orange transition-all duration-500"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 shadow-sm border border-slate-100 flex items-center justify-center group-hover:bg-brand-orange group-hover:border-brand-orange group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                        <item.icon size={20} className="text-brand-orange group-hover:text-white transition-all duration-500" />
                      </div>
                      <span className="text-xl font-bold tracking-tight group-hover:translate-x-2 transition-transform">
                        {item.name}
                      </span>
                    </a>
                  </motion.div>
                ))}
              </div>

              <div className="relative pt-12">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 px-1">Conecte-se</p>
                <div className="flex gap-3">
                  <a href="https://www.instagram.com/maraizapsi?igsh=MWcxanY3NWZoY2hhZA==" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center p-4 bg-white border border-slate-100 rounded-2xl text-slate-500 hover:text-white hover:bg-[#E1306C] hover:border-[#E1306C] hover:shadow-lg hover:shadow-[#E1306C]/20 transition-all group active:scale-95">
                    <Instagram size={22} className="group-hover:scale-110 transition-transform" />
                  </a>
                </div>
                <div className="mt-8 p-6 bg-brand-orange/5 rounded-[2rem] border border-brand-orange/10">
                  <p className="text-[9px] font-black text-brand-orange uppercase tracking-[0.2em] mb-1">Registro</p>
                  <p className="text-xs font-bold text-slate-700">CRP 04/66976 • Minas Gerais</p>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* History/Story Modal */}
      <AnimatePresence>
        {isStoryOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsStoryOpen(false)}
              className={`fixed inset-0 bg-slate-950/80 ${isMobile ? 'backdrop-blur-sm' : 'backdrop-blur-xl'} z-[100]`}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="fixed inset-4 md:inset-10 lg:inset-20 bg-white z-[110] rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
              {/* Image Side - Carousel - Hidden on Mobile for Performance */}
              <div className="hidden md:block w-full md:w-2/5 h-64 md:h-full relative overflow-hidden bg-slate-100 group/carousel">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={currentImageIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.4 }}
                    src={storyImages[currentImageIndex]} 
                    alt={`Maraiza Vasconcelos ${currentImageIndex + 1}`} 
                    className="w-full h-full object-cover object-center"
                  />
                </AnimatePresence>
                
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent pointer-events-none" />
                
                {/* Navigation Arrows */}
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between z-20">
                  <button 
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-brand-orange transition-all duration-300 opacity-0 group-hover/carousel:opacity-100"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-brand-orange transition-all duration-300 opacity-0 group-hover/carousel:opacity-100"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>

                {/* Progress Indicators */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                  {storyImages.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-6 bg-brand-orange' : 'w-1.5 bg-white/40'}`}
                    />
                  ))}
                </div>

                <button 
                  onClick={() => setIsStoryOpen(false)}
                  className="absolute top-6 left-6 md:top-6 md:left-6 w-12 h-12 bg-slate-900/40 md:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-brand-orange transition-all duration-300 z-30"
                >
                  <X size={24} />
                </button>
                
                <div className="absolute bottom-6 left-6 md:bottom-10 md:left-8 z-10">
                  <h2 className="text-white font-serif text-2xl md:text-3xl font-bold">Maraiza Vasconcelos</h2>
                  <p className="text-brand-orange font-bold text-[10px] md:text-xs uppercase tracking-widest mt-1">Sua trajetória & Essência</p>
                </div>
              </div>

              {/* Text Side */}
              <div className="w-full md:w-3/5 h-full overflow-y-auto p-8 md:p-16 bg-[#FEFAF6]">
                <div className="max-w-xl mx-auto space-y-8 md:space-y-12">
                  <section>
                    <div className="flex items-center gap-3 mb-3 md:mb-4">
                      <div className="w-1.5 h-1.5 bg-brand-orange rounded-full" />
                      <h3 className="text-[10px] md:text-xs font-black text-brand-orange uppercase tracking-[0.3em]">Quem Sou</h3>
                    </div>
                    <p className="text-slate-700 text-base md:text-lg leading-relaxed font-serif italic">
                      Tenho 27 anos, Psicóloga formada pela universidade Unitri desde 2021 e Pos-graduanda em Psicodrama pela Casa das Cenas. Sou mãe de um neném lindo e casada com um homem incrível, que me apoia até nas maiores loucuras que desejo fazer. Assumo que acho-me idealista e que um dos meus maiores sonhos é levar o meu trabalho a todos de uma maneira acessível, e que ao mesmo tempo não tire minha essência.
                    </p>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-3 md:mb-4">
                      <div className="w-1.5 h-1.5 bg-brand-yellow rounded-full" />
                      <h3 className="text-[10px] md:text-xs font-black text-brand-yellow-dark uppercase tracking-[0.3em]">Propósito</h3>
                    </div>
                    <p className="text-slate-700 text-base md:text-lg leading-relaxed font-serif italic">
                      Pensar em um propósito para mim é pensar em algo transformador. Sempre desejei tocar o mundo de alguma forma. Hoje esse desejo se afunilou e se transformou. Meu propósito se transformou em tocar cada um dos meus pacientes. Fazer com que eles tenham uma conexão profunda consigo mesmos e que descubram cada um a sua potência única e a usem para transformar as suas vidas, assim como aconteceu comigo.
                    </p>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-3 md:mb-4">
                      <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                      <h3 className="text-[10px] md:text-xs font-black text-slate-800 uppercase tracking-[0.3em]">Minhas Competências</h3>
                    </div>
                    <p className="text-slate-700 text-base md:text-lg leading-relaxed font-serif italic">
                      Áreas de atuação: Sou psicóloga clínica e social, atuando com adolescentes, adultos e grupos, tanto na modalidade presencial quanto on-line. Também faço parte do time da Casa das Cenas no Centro de Desenvolvimento (Clínica Social), onde atendemos pessoas em situação de vulnerabilidade financeira.
                    </p>
                  </section>

                  <section className="space-y-4 md:space-y-6">
                    <div className="flex items-center gap-3 mb-3 md:mb-4">
                      <div className="w-1.5 h-1.5 bg-brand-blue rounded-full" />
                      <h3 className="text-[10px] md:text-xs font-black text-slate-800 uppercase tracking-[0.3em]">Parcerias</h3>
                    </div>
                    <div className="space-y-4 md:space-y-6">
                      <p className="text-slate-700 text-base md:text-lg leading-relaxed font-serif italic">
                        Participo dos atendimentos socias na Casa das Cenas e em alguns projetos voltados para o desenvolvimento do papel de direção, como o Prosa com Moreno e Psicodrama e Cinema. Para nós do psicodrama, o diretor conduz o grupo e explora através da espontaneidade as pautas em debate. 
                      </p>
                      <p className="text-slate-700 text-base md:text-lg leading-relaxed font-serif italic border-l-4 border-brand-yellow/30 pl-4 md:pl-6 bg-brand-yellow/5 py-4 rounded-r-2xl">
                        Atualmente, busco parcerias que me desafiem. Lugares onde eu possa levar o que eu sei e aprender em conjunto, onde possamos tirar experiências e vivências maravilhosas e transformadoras. Sejam essas experiências em grupo, ou individuais.
                      </p>
                    </div>
                  </section>

                  <div className="pt-8 md:pt-12">
                    <button 
                      onClick={() => setIsStoryOpen(false)}
                      className="px-8 py-3 md:px-10 md:py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl md:rounded-2xl hover:bg-brand-orange transition-colors duration-300"
                    >
                      Fechar História
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Wrapper */}
      <main className={`transition-all duration-300 ${isAdminPortalOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>

      {/* Hero Section - Full Screen and Aligned for Maximum Visibility */}
      <section id="inicio" className="relative min-h-screen flex flex-col items-center justify-center pt-24 md:pt-12 overflow-hidden bg-[#FAF9F6]">
        {/* Sunset & Wave Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Main Sunset Gradient */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#FF9E3D] via-[#FF6B35]/30 to-[#FAF9F6]"></div>
          
          {/* Layered Orange Waves with soft movement */}
          <div className="absolute bottom-0 left-0 w-full h-full overflow-hidden opacity-30">
            <motion.svg 
              animate={!isMobile ? { 
                x: [0, -100, 0],
                y: [0, 20, 0]
              } : {}}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-[-10%] left-0 w-[200%] h-[70%]" 
              viewBox="0 0 1440 320" 
              preserveAspectRatio="none"
            >
              <path fill="#FF9E3D" fillOpacity="0.6" d="M0,192L60,170.7C120,149,240,107,360,117.3C480,128,600,192,720,213.3C840,235,960,213,1080,202.7C1200,192,1320,192,1380,192L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
            </motion.svg>
            <motion.svg 
              animate={!isMobile ? { 
                x: [-100, 0, -100],
                y: [20, 0, 20]
              } : {}}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-[-20%] left-0 w-[200%] h-[80%]" 
              viewBox="0 0 1440 320" 
              preserveAspectRatio="none"
            >
              <path fill="#FF6B35" fillOpacity="0.4" d="M0,256L60,245.3C120,235,240,213,360,197.3C480,181,600,171,720,186.7C840,203,960,245,1080,234.7C1200,224,1320,160,1380,128L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
            </motion.svg>
          </div>
          
          {/* Subtle Grain Texturing */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
            {/* Centered Doctor's Portrait */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative mb-6 md:mb-8 md:-mt-10 group"
            >
              <div className="relative">
                {/* Floating Cards - Refined Premium Design */}
                {/* 1. Psicodrama */}
                <motion.div 
                  initial={{ opacity: 0, x: -30, scale: 1.05, y: -5 }}
                  animate={{ opacity: 1, x: 0, scale: 1.05, y: -5 }}
                  transition={{ duration: 1, delay: 1 }}
                  className="absolute -top-6 -left-8 md:top-8 md:-left-48 z-20"
                >
                  <div className="bg-white/80 backdrop-blur-2xl px-2 py-1 md:px-6 md:py-4 rounded-[1rem] md:rounded-[2.5rem] shadow-[0_0_20px_rgba(255,107,53,0.4),0_20px_50px_rgba(255,107,53,0.15)] border border-white/60 flex items-center gap-1.5 md:gap-4 group cursor-default relative overflow-hidden ring-1 md:ring-2 ring-brand-orange">
                    <div className="absolute inset-0 bg-gradient-to-tr from-brand-orange/10 to-transparent opacity-100 transition-opacity" />
                    <div className="w-5 h-5 md:w-11 md:h-11 rounded-full bg-brand-orange flex items-center justify-center shadow-[0_0_20px_rgba(255,107,53,0.4)]">
                      <GraduationCap size={10} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[55%] md:text-[10px] font-black text-brand-orange uppercase tracking-[0.25em] mb-0.5 md:mb-1">Especialidade</span>
                      <span className="text-[65%] md:text-sm font-extrabold text-slate-800 tracking-tight">Psicodrama</span>
                    </div>
                  </div>
                </motion.div>

                {/* 2. Identidade */}
                <motion.div 
                  initial={{ opacity: 0, x: 30, scale: 1.05, y: -5 }}
                  animate={{ opacity: 1, x: 0, scale: 1.05, y: -5 }}
                  transition={{ duration: 1, delay: 1.3 }}
                  className="absolute top-[82%] md:top-[65%] -right-12 md:-right-52 -translate-y-1/2 z-20"
                >
                  <div className="bg-white/80 backdrop-blur-2xl px-2 py-1 md:px-6 md:py-4 rounded-[1rem] md:rounded-[2.5rem] shadow-[0_0_20px_rgba(255,107,53,0.4),0_20px_50px_rgba(255,107,53,0.15)] border border-white/60 flex items-center gap-1.5 md:gap-4 group cursor-default relative overflow-hidden ring-1 md:ring-2 ring-brand-orange">
                    <div className="absolute inset-0 bg-gradient-to-tr from-brand-yellow/10 to-transparent opacity-100 transition-opacity" />
                    <div className="w-5 h-5 md:w-11 md:h-11 rounded-full bg-brand-yellow flex items-center justify-center shadow-[0_0_20px_rgba(255,158,61,0.4)]">
                      <Users size={10} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[55%] md:text-[10px] font-black text-brand-yellow-dark uppercase tracking-[0.25em] mb-0.5 md:mb-1">Foco Principal</span>
                      <span className="text-[65%] md:text-sm font-extrabold text-slate-800 tracking-tight">Identidade & Papéis</span>
                    </div>
                  </div>
                </motion.div>

                {/* 3. Transformação */}
                <motion.div 
                  initial={{ opacity: 0, y: 30, scale: 1.05 }}
                  animate={{ opacity: 1, y: -5, scale: 1.05 }}
                  transition={{ duration: 1, delay: 1.6 }}
                  className="absolute -bottom-6 -left-10 md:bottom-12 md:-left-40 z-20"
                >
                  <div className="bg-white/80 backdrop-blur-2xl px-2 py-1 md:px-6 md:py-4 rounded-[1rem] md:rounded-[2.5rem] shadow-[0_0_20px_rgba(255,107,53,0.4),0_20px_50px_rgba(255,107,53,0.15)] border border-white/60 flex items-center gap-1.5 md:gap-4 group cursor-default relative overflow-hidden ring-1 md:ring-2 ring-brand-orange">
                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-200/10 to-transparent opacity-100 transition-opacity" />
                    <div className="w-5 h-5 md:w-11 md:h-11 rounded-full bg-slate-900 flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.2)]">
                      <Heart size={10} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[65%] md:text-sm font-extrabold text-slate-800 tracking-tight">Psicóloga Clínica e Social</span>
                    </div>
                  </div>
                </motion.div>

                {/* Soft Rotating Sun Rays & Pulsing Lights */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10">
                  {/* Rotating Rays */}
                  <motion.div
                    animate={!isMobile ? { rotate: 360 } : {}}
                    transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250%] md:[300%] h-[250%] md:[300%] opacity-[0.45] md:opacity-[0.45]"
                  >
                    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                      <defs>
                        <radialGradient id="rayGradient" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#FFF5E1" stopOpacity="1" />
                          <stop offset="20%" stopColor="#FFD700" stopOpacity="0.9" />
                          <stop offset="50%" stopColor="#FF9E3D" stopOpacity="0.75" />
                          <stop offset="80%" stopColor="#FF6B35" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#FF6B35" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                      {[...Array(isMobile ? 12 : 24)].map((_, i) => (
                        <motion.path
                          key={i}
                          d={`M 50 50 L ${50 + 150 * Math.cos((i * (isMobile ? 30 : 15) * Math.PI) / 180)} ${50 + 150 * Math.sin((i * (isMobile ? 30 : 15) * Math.PI) / 180)} L ${50 + 150 * Math.cos(((i * (isMobile ? 30 : 15) + 6) * Math.PI) / 180)} ${50 + 150 * Math.sin(((i * (isMobile ? 30 : 15) + 6) * Math.PI) / 180)} Z`}
                          fill="url(#rayGradient)"
                        />
                      ))}
                    </svg>
                  </motion.div>

                  {/* Pulsing Glows */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-brand-orange/10 blur-[80px]"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
                <div className="w-[16rem] h-[16rem] md:w-[28rem] md:h-[28rem] rounded-full overflow-hidden border-[8px] md:border-[12px] border-white shadow-[0_40px_100px_rgba(0,0,0,0.15),0_0_0_1px_rgba(226,232,240,0.5)_inset] ring-1 md:ring-2 ring-brand-orange relative z-10 bg-white mb-6 md:mb-12">
                  <img 
                    src="/WhatsApp Image 2026-04-22 at 15.52.56.jpeg" 
                    alt="Psicóloga Maraiza Vasconcelos"
                    className="w-full h-full object-cover object-[center_15%] transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {/* Design Accents */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-4 border border-slate-200/50 rounded-full border-dashed -z-0"
                />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative z-20 flex flex-col items-center mt-2 md:-mt-8"
            >
              <motion.h1 
                className="font-serif text-[24px] md:text-[40px] lg:text-[50px] font-bold tracking-tighter leading-tight text-slate-950 mb-6 w-full drop-shadow-[0_2px_10px_rgba(255,255,255,0.4)] flex flex-col items-center overflow-visible"
              >
                <div className="text-center px-2">
                  Toque sua essência, descubra sua 
                  <span className="relative inline-block mx-2">
                    <span className="relative z-10 italic font-black text-brand-orange">potência</span>
                    <motion.span 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: 0.8, duration: 1, ease: "circOut" }}
                      className="absolute bottom-0 md:bottom-1 left-0 h-3 md:h-4 bg-brand-yellow/50 -rotate-1 z-0"
                    />
                  </span>
                  e transforme a sua 
                  <span className="relative inline-block mx-2">
                    <span className="relative z-10 font-black">história</span>
                    <motion.span 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: 1, duration: 1, ease: "circOut" }}
                      className="absolute bottom-0 md:bottom-1 left-0 h-3 md:h-4 bg-brand-yellow/50 -rotate-1 z-0"
                    />
                  </span>.
                </div>
              </motion.h1>
              
              {/* Highlighted Quote Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="relative p-6 md:p-8 mb-8 max-w-2xl group"
              >
                {/* Card Background with Sunset Gradient and High-End Border */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-orange via-brand-yellow to-brand-orange-light rounded-[1.5rem] md:rounded-[2rem] shadow-[0_20px_50px_rgba(255,107,53,0.25)] border-[4px] md:border-[8px] border-white overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
                </div>
                
                <p className="relative z-10 text-lg md:text-2xl text-slate-900 font-serif font-black italic leading-relaxed text-center tracking-tight drop-shadow-sm px-2">
                  "Desperte sua espontaneidade e ressignifique sua história através do Psicodrama."
                </p>
              </motion.div>

              <div className="flex flex-col sm:flex-row gap-6 items-center px-4 mb-12 md:mb-0">
                <motion.button 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98, y: 0 }}
                  onClick={() => document.getElementById('triagem')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group relative h-14 md:h-16 px-10 md:px-14 flex items-center justify-center rounded-2xl overflow-hidden shadow-[0_15px_40px_-10px_rgba(0,0,0,0.3)] transition-all duration-300 border-2 border-white/80"
                >
                  {/* Solid Elegant Dark Background */}
                  <div className="absolute inset-0 bg-slate-950" />
                  
                  {/* Glossy Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Refined Shine Effect */}
                  <div className="absolute inset-0 overflow-hidden">
                    <motion.div 
                      animate={{ 
                        x: ['-100%', '200%'],
                        opacity: [0, 0.4, 0]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        repeatDelay: 1,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-y-0 w-2/3 bg-gradient-to-r from-transparent via-white to-transparent skew-x-[-35deg]"
                    />
                  </div>

                  {/* Pulsing Glow Background */}
                  <motion.div 
                    animate={{ 
                      opacity: [0.1, 0.3, 0.1],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 bg-brand-orange/20 mix-blend-overlay"
                  />

                  <span className="relative z-10 flex items-center gap-4 text-white font-black text-[12px] uppercase tracking-[0.3em]">
                    Agendar Consulta
                    <div className="w-8 h-8 rounded-xl bg-brand-orange flex items-center justify-center group-hover:translate-x-2 transition-transform duration-500 shadow-lg shadow-brand-orange/20">
                      <ArrowRight size={16} strokeWidth={3} className="text-white" />
                    </div>
                  </span>
                </motion.button>
              </div>
            </motion.div>
        </div>
      </section>

      {/* Abstract Geometric & Geographic Divider */}
      <div className="relative h-40 bg-white z-20 overflow-hidden flex items-center">
        {/* Geographic "Nodes" and Connections */}
        <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between pointer-events-none opacity-40">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 10, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-16 h-16 border-2 border-brand-orange rounded-full flex items-center justify-center -rotate-12"
          >
            <div className="w-2 h-2 bg-brand-orange rounded-full" />
          </motion.div>

          <div className="hidden md:flex items-center gap-1">
            {[...Array(20)].map((_, i) => (
              <motion.div 
                key={i}
                animate={{ opacity: [0.1, 0.4, 0.1] }}
                transition={{ duration: 0.8, delay: i * 0.05, repeat: Infinity }}
                className="w-1 h-1 bg-slate-300 rounded-full"
              />
            ))}
          </div>

          <motion.div 
            animate={{ 
              y: [0, -15, 0],
              rotate: [45, 60, 45]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-20 h-20 bg-brand-yellow/30 rounded-2xl rotate-45"
          />

          <div className="hidden lg:block w-32 h-px bg-gradient-to-r from-slate-200 via-brand-orange/30 to-transparent" />

          <motion.div 
            animate={{ 
              scale: [0.8, 1, 0.8],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 5, repeat: Infinity }}
            className="relative"
          >
            <div className="w-24 h-24 border-t border-l border-brand-blue/40 rounded-tl-[3rem]" />
            <div className="absolute top-2 left-2 w-3 h-3 bg-brand-blue rounded-full" />
          </motion.div>
        </div>

        {/* Central Geographic Line with Pulse */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent relative">
          <motion.div 
            initial={{ left: '0%' }}
            animate={{ left: '100%' }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 -translate-y-1/2 flex items-center gap-2 -ml-10"
          >
            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent to-brand-orange" />
            <div className="w-3 h-3 bg-brand-orange rounded-full shadow-[0_0_20px_rgba(255,107,53,0.8)] relative">
              <div className="absolute inset-0 bg-brand-orange rounded-full animate-ping" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Pain Identification Section - New */}
      <section id="identificacao" className="py-16 md:py-24 bg-brand-orange/10 relative z-10 overflow-hidden">
        {/* Dynamic Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent opacity-100" />
        <div className="absolute -right-32 top-1/4 w-[500px] h-[500px] bg-brand-orange/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -left-32 bottom-1/4 w-[400px] h-[400px] bg-brand-yellow/30 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Geographic Accents */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-10 left-10 w-2 h-40 bg-brand-orange/40 rounded-full rotate-45" />
          <div className="absolute bottom-20 right-10 w-40 h-40 border-8 border-brand-yellow/30 rounded-full" />
          <div className="absolute top-1/2 right-20 w-16 h-16 bg-brand-blue/20 rounded-2xl rotate-12" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12 md:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-[10px] font-bold text-brand-orange uppercase tracking-[0.4em] mb-6 md:mb-8 flex items-center justify-center gap-3">
                <span className="w-6 md:w-8 h-px bg-brand-orange/30" />
                Identificação
                <span className="w-6 md:w-8 h-px bg-brand-orange/30" />
              </h2>
              
              <h3 className="font-serif text-3xl md:text-6xl font-bold mb-6 md:mb-8 text-slate-900 leading-[1.2] tracking-tight px-4">
                Você sente que é o momento de <br className="hidden md:block" />
                <span className="relative inline-block mt-2">
                  <span className="relative z-10 italic text-brand-orange">olhar para si?</span>
                  <motion.span 
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8, duration: 1, ease: "circOut" }}
                    className="absolute bottom-1 md:bottom-2 left-0 h-3 md:h-4 bg-brand-yellow/30 -rotate-1 z-0"
                  />
                </span>
              </h3>
              
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 1 }}
                className="text-slate-500 max-w-2xl mx-auto text-lg md:text-2xl leading-relaxed font-light italic px-4"
              >
                "Muitas vezes, os sinais de que precisamos de ajuda são sutis. <br className="hidden md:block" />
                <span className="font-semibold text-slate-700 not-italic">Reconhecer essas dores é o primeiro passo para a transformação."</span>
              </motion.p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 px-4">
            {/* Card 1 - Inspired by "Terapia: Espaço Seguro" */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="group relative bg-[#FDF4F1] p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_10px_30px_-10px_rgba(255,107,53,0.15)] border border-brand-orange/10 hover:bg-brand-orange transition-all duration-500 flex flex-col items-center text-center overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-brand-orange-light opacity-20 rounded-bl-[4rem] md:rounded-bl-[5rem] group-hover:scale-150 transition-transform duration-700" />
              
              <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-white shadow-xl shadow-brand-orange/20 flex items-center justify-center mb-6 md:mb-8 rotate-3 group-hover:rotate-12 transition-transform duration-500">
                <MessagesSquare size={28} className="text-brand-orange group-hover:scale-110 transition-transform" />
              </div>
              
              <h4 className="relative font-serif text-2xl md:text-3xl font-bold text-slate-900 mb-4 md:mb-6 italic group-hover:text-white transition-colors">Espaço de Escuta</h4>
              <p className="relative text-sm md:text-base text-slate-600 leading-relaxed group-hover:text-white/90 transition-colors font-medium">
                Sente que não tem um lugar seguro para compartilhar traumas, sentimentos e situações não resolvidas que pesam no dia a dia?
              </p>
            </motion.div>

            {/* Card 2 - Inspired by "Importância do Diálogo" */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group relative bg-[#FFF9ED] p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_10px_30px_-10px_rgba(255,183,3,0.2)] border border-brand-yellow/20 hover:bg-brand-yellow transition-all duration-500 flex flex-col items-center text-center overflow-hidden"
            >
              <div className="absolute -bottom-8 -left-8 md:-bottom-10 md:-left-10 w-32 md:w-40 h-32 md:h-40 bg-brand-yellow-light opacity-30 rounded-full group-hover:scale-125 transition-transform duration-700" />
              
              <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-white shadow-xl shadow-brand-yellow/30 flex items-center justify-center mb-6 md:mb-8 -rotate-3 group-hover:-rotate-12 transition-transform duration-500">
                <Users size={28} className="text-brand-yellow-dark group-hover:scale-110 transition-transform" />
              </div>
              
              <h4 className="relative font-serif text-2xl md:text-3xl font-bold text-slate-900 mb-4 md:mb-6 italic group-hover:text-slate-900 transition-colors">Conflitos nas Relações</h4>
              <p className="relative text-sm md:text-base text-slate-600 leading-relaxed group-hover:text-slate-800 transition-colors font-medium">
                A dificuldade em dialogar e se fazer entender tem gerado angústia nas suas relações familiares, amorosas ou profissionais?
              </p>
            </motion.div>

            {/* Card 3 - Inspired by "Online/Presencial/Grupo" & Matrix of Identity */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="group relative bg-[#F4F5F7] p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_10px_30px_-10px_rgba(100,116,139,0.1)] border border-slate-200 hover:bg-slate-900 transition-all duration-500 flex flex-col items-center text-center overflow-hidden"
            >
              <div className="absolute top-1/2 left-0 w-full h-1/2 bg-slate-200/50 group-hover:bg-brand-orange-light/20 transition-all duration-700" />
              
              <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-white shadow-xl shadow-slate-200 flex items-center justify-center mb-6 md:mb-8 rotate-6 group-hover:rotate-0 transition-transform duration-500">
                <IdCard size={28} className="text-slate-600 group-hover:text-brand-orange group-hover:scale-110 transition-all" />
              </div>
              
              <h4 className="relative font-serif text-2xl md:text-3xl font-bold text-slate-900 mb-4 md:mb-6 italic group-hover:text-white transition-colors">Perda de Identidade</h4>
              <p className="relative text-sm md:text-base text-slate-600 leading-relaxed group-hover:text-white/90 transition-colors font-medium">
                Você se sente perdido entre os tantos papéis que exerce, com a sensação de que sua essência ficou esquecida pelo caminho?
              </p>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="mt-12 md:mt-20 flex justify-center px-4"
          >
            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => document.getElementById('abordagem')?.scrollIntoView({ behavior: 'smooth' })}
              className="group relative p-[2px] rounded-[1.5rem] md:rounded-full overflow-hidden cursor-pointer w-full md:w-auto"
            >
              {/* Animated Gradient Border */}
              <motion.div 
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-brand-orange via-brand-yellow to-brand-orange bg-[length:200%_auto] opacity-100" 
              />
              
              <div className="relative flex flex-col md:flex-row items-center gap-4 md:gap-6 bg-white/95 backdrop-blur-md px-6 py-5 md:px-10 md:py-5 rounded-[1.5rem] md:rounded-full shadow-2xl overflow-hidden text-center md:text-left">
                {/* Subtle pulse background */}
                <div className="absolute inset-0 bg-brand-orange/5 animate-pulse" />
                
                <div className="relative">
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles size={26} className="text-brand-orange relative z-10 drop-shadow-[0_0_8px_rgba(255,107,53,0.4)]" />
                  </motion.div>
                  <motion.div 
                    animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-brand-orange/30 rounded-full blur-md"
                  />
                </div>
                
                <p className="text-sm md:text-xl font-bold tracking-tight text-slate-800 leading-tight">
                  Descubra como o <span className="bg-gradient-to-r from-brand-orange via-brand-orange-dark to-brand-orange font-black bg-clip-text text-transparent px-1">Psicodrama</span> pode resgatar a sua <span className="relative inline-block text-brand-orange italic underline decoration-brand-yellow/30 decoration-wavy underline-offset-4">espontaneidade.</span>
                </p>
                
                <motion.div 
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-orange/10 text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-all duration-500 shadow-inner"
                  whileHover={{ rotate: 360 }}
                >
                  <ArrowRight size={18} />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Bio Section - Premium Revamp */}
      <section id="sobre" className="py-16 md:py-32 bg-slate-50 relative z-10 overflow-hidden">
        {/* Vibrant Background Accents */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-orange/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-yellow/10 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Floating Geometric Elements - Aligned with Home */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-10 w-40 h-40 border border-brand-orange/20 rounded-3xl -z-0 opacity-40 rotate-12"
        />
        <motion.div 
          animate={{ y: [-20, 20, -20] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-20 left-10 w-32 h-32 bg-brand-yellow/10 rounded-full -z-0 blur-2xl"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            
            {/* Left Column: Portrait with Design Flourishes - Hidden on Mobile for Performance */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative order-2 lg:order-1"
            >
              {/* Back Geometry */}
              <div className="absolute -top-10 -left-10 w-full h-full bg-brand-orange/10 rounded-[4rem] -z-10 rotate-3" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-yellow/20 rounded-full -z-10 blur-3xl" />
              
              <div className="relative group overflow-hidden rounded-[4rem] border-[16px] border-white shadow-2xl">
                <img 
                  src="/Captura de tela 2026-04-27 185511.png" 
                  alt="Maraiza Vasconcelos Portrait" 
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Overlay Text on Image */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 to-transparent p-12 text-white text-left">
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="font-serif text-2xl italic font-light"
                  >
                    "Acredito no encontro humano como o solo fértil para a mudança."
                  </motion.p>
                </div>
              </div>
              
              {/* Secondary Authority Badge */}
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
                className="absolute -bottom-6 -left-6 bg-slate-900 text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 z-20"
              >
                <div className="w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center">
                  <ShieldCheck size={20} className="text-slate-900" strokeWidth={3} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase tracking-[0.3em] text-brand-yellow">Protocolo de Ética</span>
                  <span className="text-xs font-bold uppercase tracking-widest leading-none">100% Verificado</span>
                </div>
              </motion.div>
              
              {/* Floating Badge */}
              <motion.div 
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute -top-6 -right-6 bg-brand-orange text-white p-8 rounded-full shadow-2xl flex flex-col items-center justify-center text-center rotate-6"
              >
                <GraduationCap size={32} className="mb-2" />
                <span className="text-[10px] font-black uppercase tracking-widest">Especialista</span>
              </motion.div>
            </motion.div>

            {/* Right Column: Content and Cards */}
            <div className="order-1 lg:order-2">
              <motion.div {...fadeIn}>
                <h2 className="text-sm font-black text-brand-orange uppercase tracking-[0.4em] mb-6 flex items-center gap-4">
                  <div className="w-12 h-0.5 bg-brand-orange/30" />
                  Trajetória Profissional
                </h2>
                
                <h3 className="font-serif text-5xl md:text-7xl font-bold mb-8 text-slate-900 leading-tight">
                  Maraiza <br />
                  <span className="text-brand-orange italic underline decoration-brand-yellow/40 decoration-wavy underline-offset-8">Vasconcelos</span>
                </h3>
                
                <p className="text-slate-800 text-xl md:text-2xl leading-relaxed mb-12 font-medium italic">
                  Como psicóloga formada pelo <strong className="text-brand-orange">Unitri</strong> e pós-graduada pela <strong className="text-brand-orange italic">Casa das Cenas</strong>, minha atuação é guiada pela integração entre a escuta clínica e a potência da ação dramática.
                </p>

                <div className="grid gap-6">
                  <motion.div 
                    whileHover={{ x: 10 }}
                    className="bg-white p-8 rounded-[2.5rem] shadow-sm border-l-8 border-brand-orange group transition-all hover:shadow-xl hover:bg-brand-orange"
                  >
                    <div className="flex items-start gap-6">
                      <div className="w-14 h-14 bg-brand-orange/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        <BookOpen size={28} className="text-brand-orange group-hover:text-white" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-slate-900 group-hover:text-white transition-colors mb-2">Graduação em Psicologia</h4>
                        <p className="text-slate-500 group-hover:text-white/80 transition-colors">Unitri - Centro Universitário do Triângulo</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ x: 10 }}
                    className="bg-white p-8 rounded-[2.5rem] shadow-sm border-l-8 border-brand-yellow group transition-all hover:shadow-xl hover:bg-brand-yellow"
                  >
                    <div className="flex items-start gap-6">
                      <div className="w-14 h-14 bg-brand-yellow/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        <GraduationCap size={28} className="text-brand-yellow-dark group-hover:text-slate-900" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-slate-900 transition-colors mb-2">Pós-Graduação em Psicodrama</h4>
                        <p className="text-slate-500 group-hover:text-slate-800 transition-colors">Casa das Cenas - Referência em Psicodrama Clínico</p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="mt-12 flex flex-wrap gap-8 items-center border-t border-slate-200 pt-12">
                   {/* New Authority Element: CRP Badge */}
                   <motion.div 
                     whileHover={{ scale: 1.02 }}
                     className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 flex items-center gap-5"
                   >
                     <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/10">
                       <CheckCircle2 size={28} className="text-brand-orange" strokeWidth={3} />
                     </div>
                     <div className="flex flex-col">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Registro Profissional</span>
                       <span className="text-2xl font-black text-slate-900 tracking-tighter leading-none">CRP 04/66976</span>
                       <span className="text-[10px] font-bold text-brand-orange mt-1 uppercase tracking-widest">Ativo & Regularizado</span>
                     </div>
                   </motion.div>

                   {/* New Story Toggle Button */}
                   <motion.button 
                     whileHover={{ scale: 1.05, x: 5 }}
                     whileTap={{ scale: 0.95 }}
                     onClick={() => setIsStoryOpen(true)}
                     className="group flex items-center gap-4 bg-brand-orange text-white px-8 py-5 rounded-[2rem] shadow-xl shadow-brand-orange/20 hover:shadow-brand-orange/40 transition-all duration-300"
                   >
                     <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                       <BookOpen size={20} />
                     </div>
                     <div className="flex flex-col items-start translate-y-0.5">
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Saiba mais</span>
                       <span className="text-sm font-black uppercase tracking-widest">Conheça minha história</span>
                     </div>
                     <ArrowRight size={18} className="ml-2 group-hover:translate-x-2 transition-transform" />
                   </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Approach & Psychodrama Section - Organic Scenic Design */}
      <section id="abordagem" className="py-32 bg-[#fffcf9] relative overflow-hidden z-10">
        {/* Artistic Background Decor */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-orange/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-brand-yellow/10 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Animated Geographical Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Moving Topographic Map Overlay - Increased Opacity */}
          <motion.div 
            animate={isMobile ? {} : { 
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 opacity-[0.12] mix-blend-multiply"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 100 Q 100 0 200 100 T 400 100' fill='none' stroke='black' stroke-width='1.5'/%3E%3Cpath d='M0 200 Q 100 100 200 200 T 400 200' fill='none' stroke='black' stroke-width='1.5'/%3E%3Cpath d='M0 300 Q 100 200 200 300 T 400 300' fill='none' stroke='black' stroke-width='1.5'/%3E%3C/svg%3E")`,
              backgroundSize: '1000px 1000px'
            }}
          />

          {/* Floating "Continents" / Organic Shapes - More Vibrant Colors and Higher Opacity */}
          <motion.div
            animate={isMobile ? {} : { 
              x: [-30, 30],
              y: [-30, 30],
              scale: [1, 1.2, 1],
              rotate: [0, 10, 0]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-brand-orange/30 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] blur-[100px]"
          />
          <motion.div
            animate={isMobile ? {} : { 
              x: [30, -30],
              y: [30, -30],
              scale: [1, 1.3, 1],
              rotate: [0, -10, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-1/4 -right-20 w-[700px] h-[700px] bg-brand-yellow/30 rounded-[60%_40%_30%_70%/50%_60%_40%_60%] blur-[120px]"
          />
          <motion.div
            animate={isMobile ? {} : { 
              y: [0, -60, 0],
              opacity: [0.15, 0.3, 0.15],
              scale: [1.2, 1.5, 1.2]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] border-[2px] border-brand-orange/15 rounded-full pointer-events-none"
          />
          
          {/* Intense Pulse Points (Like Vibrant Map Locations) */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 1, opacity: 0.3 }}
              animate={isMobile ? {} : { 
                scale: [1, 3.5], 
                opacity: [0.6, 0],
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                delay: i * 1.5,
                ease: "easeOut" 
              }}
              className="absolute w-6 h-6 bg-brand-orange/40 rounded-full blur-[2px]"
              style={{ 
                top: `${10 + i * 12}%`, 
                left: `${5 + (i * 30) % 90}%` 
              }}
            />
          ))}
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <motion.div {...fadeIn}>
              <h2 className="text-[10px] md:text-xs font-bold text-brand-orange uppercase tracking-[0.5em] mb-4 md:mb-6 inline-flex items-center gap-4">
                <span className="w-8 md:w-12 h-px bg-brand-orange/30" />
                Atuação & Método
                <span className="w-8 md:w-12 h-px bg-brand-orange/30" />
              </h2>
              <h3 className="font-serif text-3xl md:text-7xl font-bold mb-6 md:mb-10 text-slate-900 leading-tight">
                A Vida em <span className="text-brand-orange italic font-light">Cena.</span>
              </h3>
              <p className="text-lg md:text-xl text-slate-600 font-serif italic leading-relaxed px-4">
                "No psicodrama, não apenas falamos sobre a vida; nós a experimentamos, transformando conflitos em ação transformadora no aqui e agora."
              </p>
            </motion.div>
          </div>

          {/* New Scenic Flow Layout */}
          <div className="space-y-8 md:space-y-12">
            {[
              {
                title: "Espontaneidade",
                desc: "Ajudar a pessoa a sair de respostas automáticas e criar novas formas de agir perante a vida.",
                icon: <Sparkles />,
                color: "#f97316", // brand-orange
                align: "left",
                shape: "rounded-[6rem_2rem_6rem_2rem]"
              },
              {
                title: "Criatividade",
                desc: "Explorar possibilidades diferentes e inovadoras diante dos conflitos e desafios quotidianos.",
                icon: <Lightbulb />,
                color: "#facc15", // brand-yellow
                align: "right",
                shape: "rounded-[2rem_6rem_2rem_6rem]"
              },
              {
                title: "Encontro",
                desc: "Valorizar a relação genuína entre as pessoas — seja no consultório ou em grupos terapêuticos.",
                icon: <Users />,
                color: "#facc15", // Now Gold
                align: "left",
                shape: "rounded-[6rem_6rem_2rem_6rem]"
              },
              {
                title: "Papéis",
                desc: "Entender as diversas funções que assumimos no mundo e encontrar o equilíbrio entre elas.",
                icon: <Globe />,
                color: "#a855f7", // Purple
                align: "right",
                shape: "rounded-[6rem_2rem_6rem_6rem]"
              }
            ].map((pillar, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: idx * 0.05 }}
                className={`flex w-full ${pillar.align === 'right' ? 'justify-end' : 'justify-start'}`}
              >
                <motion.div 
                  whileHover={{ y: -12, scale: 1.01 }}
                  className={`relative w-full max-w-2xl bg-white p-8 md:p-14 ${pillar.shape} shadow-[0_30px_60px_rgba(0,0,0,0.06)] border-[4px] border-transparent transition-all duration-500 flex flex-col md:flex-row items-center gap-8 md:gap-10 group overflow-hidden`}
                  style={{ borderColor: pillar.color }}
                >
                  {/* Subtle Background Glow */}
                  <div className="absolute -inset-20 blur-[120px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" 
                       style={{ backgroundColor: pillar.color, opacity: 0.08 }} />
                  
                  {/* Icon Section with Custom Background */}
                  <div className="relative shrink-0">
                    <div className={`w-20 h-20 md:w-28 md:h-28 ${pillar.shape} flex items-center justify-center shadow-inner relative overflow-hidden group-hover:rotate-3 transition-all duration-500 border-2 border-transparent group-hover:border-current`}
                         style={{ 
                           backgroundColor: pillar.color,
                           color: 'white',
                           boxShadow: 'inset 0 0 20px rgba(0,0,0,0.02)'
                         }}>
                      <div className="absolute inset-0 opacity-10" style={{ backgroundColor: 'black' }} />
                      {/* Hover Glow Effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                           style={{ 
                             boxShadow: `0 0 30px ${pillar.color}`,
                             background: `radial-gradient(circle, ${pillar.color} 0%, transparent 70%)`,
                             opacity: 0.2
                           }} />
                      
                      <div className={`relative group-hover:scale-110 transition-transform duration-500`}>
                        {React.cloneElement(pillar.icon as React.ReactElement, { size: 36, strokeWidth: 1.5 })}
                      </div>
                    </div>
                    {/* Index Badge */}
                    <div className="absolute -top-2 -right-2 md:-top-3 md:-right-3 w-8 h-8 md:w-12 md:h-12 text-white rounded-full flex items-center justify-center text-[10px] md:text-sm font-black shadow-lg z-20"
                         style={{ backgroundColor: pillar.color }}>
                      0{idx + 1}
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="flex-grow text-center md:text-left relative z-10">
                    {/* Vibrant Crescendo Bar above title */}
                    <div className="relative w-48 md:w-64 h-2 md:h-3.5 bg-slate-100 rounded-full overflow-hidden mb-6 md:mb-8 mx-auto md:mx-0 shadow-inner">
                      <motion.div 
                        initial={{ width: "0%" }}
                        whileInView={{ width: idx === 0 ? "85%" : idx === 1 ? "95%" : idx === 2 ? "75%" : "92%" }}
                        viewport={{ once: true, margin: "-20px" }}
                        transition={{ duration: 2, ease: "circOut", delay: 0.2 + idx * 0.1 }}
                        className="absolute top-0 left-0 h-full rounded-full"
                        style={{ 
                          backgroundColor: pillar.color,
                          boxShadow: `0 0 8px ${pillar.color}`
                        }}
                      />
                    </div>

                    <motion.h4 
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.15 + idx * 0.05 }}
                      className="text-2xl md:text-4xl font-black text-slate-900 mb-3 md:mb-4 tracking-tighter uppercase leading-none group-hover:text-slate-900 transition-colors"
                    >
                      {pillar.title}
                    </motion.h4>
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 + idx * 0.05 }}
                      className="text-slate-500 text-lg md:text-xl leading-relaxed font-serif italic group-hover:text-slate-800 transition-colors"
                    >
                      {pillar.desc}
                    </motion.p>
                  </div>

                  {/* Corner Sparkle */}
                  <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:rotate-45">
                    <Sparkles size={24} style={{ color: pillar.color, opacity: 0.5 }} />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>


        </div>
      </section>

      <FAQSection isMobile={isMobile} />

      {/* Exit Intent Popup */}
      <AnimatePresence>
        {showExitPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExitPopup(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-white/20 overflow-hidden"
            >
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/10 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-orange/10 rounded-full blur-3xl -ml-16 -mb-16" />

              <button 
                onClick={() => setShowExitPopup(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-900"
              >
                <X size={24} />
              </button>

              <div className="relative z-10 text-center">
                <div className="w-16 h-16 bg-brand-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                  <Heart size={32} className="text-brand-orange" />
                </div>
                
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight italic">
                  Já vai? Não deixe o seu cuidado para depois.
                </h2>
                
                <p className="text-slate-600 text-base md:text-lg mb-8 font-serif italic">
                  Entendo que dar o primeiro passo pode ser desafiador. Que tal conversarmos rapidinho, sem compromisso, para eu tirar suas dúvidas?
                </p>

                <div className="flex flex-col gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowExitPopup(false);
                      window.open("https://wa.me/553498859591?text=Ol%C3%A1%20Maraiza!%20Vi%20seu%20site%20e%20gostaria%20de%20agendar%20uma%20consulta.", "_blank");
                    }}
                    className="w-full bg-slate-900 text-white rounded-2xl py-5 font-black text-xs md:text-sm uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all"
                  >
                    Agendar Agora
                  </motion.button>
                  
                  <button 
                    onClick={() => setShowExitPopup(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-black uppercase tracking-[0.1em] transition-colors"
                  >
                    Vou pensar mais um pouco
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <TriageSection isMobile={isMobile} />

      {/* Ethics Note Section */}
      <section className="py-20 bg-slate-50 relative overflow-hidden border-t border-slate-200">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-orange/20 to-transparent" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 border border-slate-200 shadow-xl"
          >
            <div className="grid md:grid-cols-12 gap-12 items-center">
              <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-slate-100 pb-8 md:pb-0 md:pr-12">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20 rotate-3">
                    <ShieldCheck size={32} className="text-brand-orange" />
                  </div>
                  <h3 className="font-serif text-2xl md:text-3xl font-bold text-slate-900 leading-tight">Nota de Ética Profissional</h3>
                </div>
                <p className="text-slate-500 font-serif italic text-lg leading-relaxed">
                  "O cuidado com a alma exige o máximo respeito à privacidade e à integridade."
                </p>
              </div>
              
              <div className="md:col-span-8 md:pl-4">
                <div className="grid sm:grid-cols-2 gap-8 md:gap-12">
                  <div className="group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-brand-orange/10 rounded-lg text-brand-orange group-hover:scale-110 transition-transform">
                        <Lock size={18} />
                      </div>
                      <span className="text-[10px] md:text-xs font-black text-slate-800 uppercase tracking-widest">Confidencialidade Estrita</span>
                    </div>
                    <p className="text-slate-600 text-sm md:text-base font-serif italic leading-relaxed">
                      Todas as sessões são protegidas pelo sigilo psicoterapêutico absoluto, conforme o Código de Ética Profissional do Psicólogo. Seus dados e relatos estão em ambiente seguro e criptografado.
                    </p>
                  </div>
                  
                  <div className="group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-brand-orange/10 rounded-lg text-brand-orange group-hover:scale-110 transition-transform">
                        <Scale size={18} />
                      </div>
                      <span className="text-[10px] md:text-xs font-black text-slate-800 uppercase tracking-widest">Conduta Normativa</span>
                    </div>
                    <p className="text-slate-600 text-sm md:text-base font-serif italic leading-relaxed">
                      Atuação orientada pelos princípios fundamentais do Conselho Federal de Psicologia (CFP), priorizando o respeito à dignidade, à liberdade e à integridade do ser humano.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-slate-900 text-white relative z-10 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -top-32 -right-32 w-96 h-96 border border-white/5 rounded-[4rem] opacity-20"
          />
          <motion.div
            animate={{ 
              rotate: -360,
              x: [0, 20, 0]
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-20 -left-20 w-80 h-80 border border-brand-orange/10 rounded-full opacity-10"
          />
          
          {/* Rectangles and Dots in Footer */}
          <motion.div 
            animate={{ rotate: 45, y: [0, -30, 0] }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute top-20 left-1/4 w-32 h-32 border-2 border-white/5 rounded-3xl opacity-10"
          />
          
          <div className="absolute bottom-1/2 right-1/3 w-40 h-40 opacity-[0.03]" 
               style={{ backgroundImage: 'radial-gradient(circle, white 2px, transparent 0)', backgroundSize: '12px 12px' }} />

          <motion.div
            animate={{ opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-1/2 left-1/3 w-1 h-20 bg-gradient-to-b from-transparent via-brand-yellow/20 to-transparent"
          />
          <motion.div
            animate={{ opacity: [0.05, 0.1, 0.05], y: [0, 50, 0] }}
            transition={{ duration: 12, repeat: Infinity }}
            className="absolute top-1/4 right-1/4 w-40 h-40 bg-brand-orange/5 blur-[80px] rounded-full"
          />
          
          {/* Floating Circle in Footer */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute bottom-1/4 right-10 w-24 h-24 border-2 border-brand-yellow/10 rounded-full opacity-20"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-start mb-16 md:mb-20">
            <div className="col-span-1 md:col-span-6">
              <div className="flex items-center gap-3 mb-6 md:mb-8">
                <div className="w-10 h-10 bg-brand-orange rounded-full flex items-center justify-center shadow-lg shadow-brand-orange/20">
                  <Flower2 size={22} className="text-white opacity-90" />
                </div>
                <span className="font-serif text-2xl md:text-3xl font-bold tracking-tight">Maraiza <span className="text-brand-orange italic font-light">Vasconcelos</span></span>
              </div>
              <p className="text-slate-400 text-lg md:text-xl font-serif italic max-w-md leading-relaxed mb-8 md:mb-10">
                "Psicoterapia digital baseada na espontaneidade e no resgate de papéis."
              </p>
              <div className="text-[10px] uppercase tracking-[0.4em] text-slate-600 font-bold">
                Psicologia Clínica & Social
              </div>
            </div>
            
            <div className="col-span-1 md:col-span-3">
              <h5 className="text-[10px] uppercase font-black text-slate-500 mb-6 md:mb-8 tracking-widest">Links Rápidos</h5>
              <ul className="space-y-4 md:space-y-6 text-sm font-bold uppercase tracking-[0.2em]">
                <li><a href="#inicio" className="text-slate-400 hover:text-brand-orange transition-colors">Início</a></li>
                <li><a href="#sobre" className="text-slate-400 hover:text-brand-orange transition-colors">Sobre</a></li>
                <li><a href="#abordagem" className="text-slate-400 hover:text-brand-orange transition-colors">Método</a></li>
                <li><a href="#triagem" className="text-slate-400 hover:text-brand-orange transition-colors">Contato</a></li>
              </ul>
            </div>

            <div className="col-span-1 md:col-span-3">
              <h5 className="text-[10px] uppercase font-black text-slate-500 mb-6 md:mb-8 tracking-widest">Siga no Instagram</h5>
              <a 
                href="https://www.instagram.com/maraizapsi?igsh=MWcxanY3NWZoY2hhZA==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex flex-col items-center justify-center p-6 md:p-8 border border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] bg-white/5 hover:bg-white/10 hover:border-brand-orange/30 transition-all duration-500 shadow-2xl hover:shadow-brand-orange/10"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-500">
                  <Instagram size={24} md:size={32} className="text-white" />
                </div>
                <p className="text-white font-bold tracking-tight text-base md:text-lg">@maraizapsi</p>
                <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-1">Clique para seguir</p>
              </a>
            </div>
          </div>
          
          <div className="pt-12 border-t border-white/5 text-center text-slate-600 text-[10px] uppercase tracking-widest font-black">
            <p>&copy; {new Date().getFullYear()} Maraiza Vasconcelos. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </main>
    {isAdminPortalOpen && <AdminPortal onClose={() => setIsAdminPortalOpen(false)} />}
  </div>
);
}
