import React, { useState, useEffect, useMemo } from "react";
import { 
  X, Plus, Flower2, Edit2, DollarSign, CalendarDays, LineChart as LineChartIcon, Filter, MessageCircle, Trash2
} from "lucide-react";
import { supabase } from "./supabase";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

export const AdminPortal = ({ onClose }: { onClose: () => void }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [notasImportantes, setNotasImportantes] = useState("");
  const [metaConsultas, setMetaConsultas] = useState(20);

  const [activeTab, setActiveTab] = useState<'agenda' | 'financeiro'>('agenda');

  const [pacientes, setPacientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState<any>(null);

  const [formData, setFormData] = useState({
    nome_completo: "",
    idade: "",
    telefone: "",
    relato_proxima_triagem: "",
    pauta_proxima_semana: "",
    data_consulta: "",
    horario_consulta: "",
    valor_sessao: "",
    dia_fixo: ""
  });

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPacienteForPayment, setSelectedPacienteForPayment] = useState<any>(null);
  const [pagamentos, setPagamentos] = useState<any[]>([]);
  const [pagamentoData, setPagamentoData] = useState({ data_sessao: "", valor: "", pago: false });

  const [faturamentoMes, setFaturamentoMes] = useState(new Date().getMonth() + 1);
  const [faturamentoAno, setFaturamentoAno] = useState(new Date().getFullYear());
  const [todasSessoes, setTodasSessoes] = useState<any[]>([]);
  const [selectedChartDay, setSelectedChartDay] = useState<string | null>(null);

  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "maraizapsic@gmail.com" && password === "iniciaratendimento135.") {
      setIsLoggedIn(true);
      setError("");
      loadPacientes();
    } else {
      setError("Credenciais inválidas");
    }
  };

  const loadPacientes = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('pacientes').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setPacientes(data);
    }
    setLoading(false);
  };

  const loadNotas = async () => {
    const { data: nData } = await supabase.from('configuracoes').select('valor').eq('chave', 'notas_importantes').maybeSingle();
    if (nData) setNotasImportantes(nData.valor || "");
    
    const { data: mData } = await supabase.from('configuracoes').select('valor').eq('chave', 'meta_consultas').maybeSingle();
    if (mData) setMetaConsultas(Number(mData.valor) || 20);
  };

  const saveNotas = async (val: string) => {
    setNotasImportantes(val);
    await supabase.from('configuracoes').upsert({ chave: 'notas_importantes', valor: val });
  };

  const saveMeta = async (val: number) => {
    setMetaConsultas(val);
    await supabase.from('configuracoes').upsert({ chave: 'meta_consultas', valor: val.toString() });
  };

  const loadTodasSessoes = async () => {
    const { data } = await supabase.from('pagamentos').select(`
      id, data_sessao, valor, pago, paciente_id, 
      pacientes(nome_completo, horario_consulta, idade, telefone, relato_proxima_triagem, pauta_proxima_semana)
    `);
    if (data) setTodasSessoes(data);
  };

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn.toString());
    if (isLoggedIn) {
      loadPacientes();
      loadTodasSessoes();
      loadNotas();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      loadTodasSessoes();
    }
  }, [activeTab]);

  const loadPagamentos = async (pacienteId: string) => {
    const { data } = await supabase
      .from('pagamentos')
      .select('*')
      .eq('paciente_id', pacienteId)
      .order('data_sessao', { ascending: false });
    if (data) setPagamentos(data);
  };

  const openFinanceiro = (p: any, prefillDate?: string | null) => {
    setSelectedPacienteForPayment(p);
    setPagamentoData({ 
      data_sessao: prefillDate || getTodayStr(), 
      valor: p.valor || p.valor_sessao || "", 
      pago: true 
    });
    loadPagamentos(p.id);
    setIsPaymentModalOpen(true);
  };

  const handleSavePagamento = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('pagamentos').insert([{
      paciente_id: selectedPacienteForPayment.id,
      ...pagamentoData
    }]);

    if (!error) {
      loadPagamentos(selectedPacienteForPayment.id);
      loadTodasSessoes();
    } else {
      alert("Erro ao adicionar pagamento");
    }
    setLoading(false);
  };

  const togglePago = async (pag: any) => {
    const { error } = await supabase.from('pagamentos').update({ pago: !pag.pago }).eq('id', pag.id);
    if (!error) {
      loadPagamentos(pag.paciente_id);
      loadTodasSessoes();
    }
  };

  const handleDeletePagamento = async (id: string, pacienteId: string) => {
    if (!window.confirm("Deseja realmente excluir este registro de pagamento?")) return;
    const { error } = await supabase.from('pagamentos').delete().eq('id', id);
    if (!error) {
      loadPagamentos(pacienteId);
      loadTodasSessoes();
    }
  };

  const handleDeleteDayData = async () => {
    if (!selectedChartDay) return;
    const dateFormatted = new Date(selectedChartDay + 'T12:00:00').toLocaleDateString('pt-BR');
    if (!window.confirm(`ATENÇÃO: Deseja apagar TODOS os registros de sessões e pagamentos do dia ${dateFormatted}?`)) return;
    
    setLoading(true);
    const { error } = await supabase.from('pagamentos').delete().eq('data_sessao', selectedChartDay);
    if (!error) {
      loadTodasSessoes();
      alert("Dados do dia removidos com sucesso.");
    }
    setLoading(false);
  };

  const handleClearAgendaMonth = async () => {
    const mesNome = new Date(faturamentoAno, faturamentoMes - 1).toLocaleString('pt-BR', { month: 'long' });
    if (!window.confirm(`ATENÇÃO: Você deseja apagar TODOS os dados de agenda de ${mesNome} de ${faturamentoAno}?`)) return;

    setLoading(true);
    const firstDay = `${faturamentoAno}-${String(faturamentoMes).padStart(2, '0')}-01`;
    const lastDay = `${faturamentoAno}-${String(faturamentoMes).padStart(2, '0')}-${new Date(faturamentoAno, faturamentoMes, 0).getDate()}`;
    
    await supabase.from('pacientes').update({ data_consulta: null }).gte('data_consulta', firstDay).lte('data_consulta', lastDay);
    await supabase.from('pagamentos').delete().gte('data_sessao', firstDay).lte('data_sessao', lastDay);

    loadPacientes();
    loadTodasSessoes();
    alert("Dados do mês removidos com sucesso.");
    setLoading(false);
  };

  const filteredPacientes = pacientes.filter(p => 
    p.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pacientesFixos = filteredPacientes.filter(p => p.dia_fixo);
  const pacientesEsporadicos = filteredPacientes.filter(p => !p.dia_fixo);

  const sessoesMesSelecionado = useMemo(() => {
    return todasSessoes.filter(s => {
      if (!s.data_sessao) return false;
      const date = new Date(s.data_sessao + 'T12:00:00');
      return date.getMonth() + 1 === faturamentoMes && date.getFullYear() === faturamentoAno;
    });
  }, [todasSessoes, faturamentoMes, faturamentoAno]);

  const faturamentoTotal = useMemo(() => {
    return sessoesMesSelecionado
      .filter(s => s.pago)
      .reduce((sum, s) => sum + Number(s.valor || 0), 0);
  }, [sessoesMesSelecionado]);

  const chartData = useMemo(() => {
    const daysInMonth = new Date(faturamentoAno, faturamentoMes, 0).getDate();
    const data = [];
    const weekdaysMap: Record<number, string> = {
      1: "Segunda", 2: "Terça", 3: "Quarta", 4: "Quinta", 5: "Sexta", 6: "Sábado", 0: "Domingo"
    };

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(faturamentoAno, faturamentoMes - 1, day);
      const dayOfWeek = weekdaysMap[date.getDay()];
      const dateStr = `${faturamentoAno}-${String(faturamentoMes).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const fixedCount = pacientesFixos.filter(p => p.dia_fixo === dayOfWeek).length;
      const sporadicScheduled = pacientesEsporadicos.filter(p => p.data_consulta === dateStr).length;
      data.push({ date: dateStr, consultas: fixedCount + sporadicScheduled });
    }
    return data;
  }, [sessoesMesSelecionado, faturamentoMes, faturamentoAno, pacientesFixos, pacientesEsporadicos]);

  const pacientesDoDia = useMemo(() => {
    if (!selectedChartDay) return [];
    
    const realSessions = sessoesMesSelecionado
      .filter(s => s.data_sessao === selectedChartDay)
      .map(s => ({
        id: s.paciente_id,
        sessionId: s.id,
        nome_completo: s.pacientes?.nome_completo || "Paciente",
        tipo: 'esporadico',
        valor: s.valor,
        pago: s.pago,
        horario: s.pacientes?.horario_consulta,
        idade: s.pacientes?.idade,
        telefone: s.pacientes?.telefone,
        relato: s.pacientes?.relato_proxima_triagem,
        pauta: s.pacientes?.pauta_proxima_semana
      }));

    const date = new Date(selectedChartDay + 'T12:00:00');
    const dayOfWeek = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"][date.getDay()];
    
    const fixed = pacientesFixos
      .filter(p => p.dia_fixo === dayOfWeek)
      .map(p => ({
        id: p.id,
        nome_completo: p.nome_completo,
        tipo: 'fixo',
        horario: p.horario_consulta,
        valor: p.valor_sessao,
        idade: p.idade,
        telefone: p.telefone,
        relato: p.relato_proxima_triagem,
        pauta: p.pauta_proxima_semana,
        pago: false
      }));

    const sporadicScheduled = pacientesEsporadicos
      .filter(p => p.data_consulta === selectedChartDay)
      .map(p => ({
        id: p.id,
        nome_completo: p.nome_completo,
        tipo: 'esporadico',
        horario: p.horario_consulta,
        valor: p.valor_sessao,
        idade: p.idade,
        telefone: p.telefone,
        relato: p.relato_proxima_triagem,
        pauta: p.pauta_proxima_semana,
        pago: false
      }));

    const combined = [...realSessions];
    [...fixed, ...sporadicScheduled].forEach(p => {
      if (!combined.some(c => c.id === p.id)) {
        combined.push(p);
      }
    });

    return combined.sort((a, b) => (a.horario || "").localeCompare(b.horario || ""));
  }, [sessoesMesSelecionado, selectedChartDay, pacientesFixos, pacientesEsporadicos]);

  const scheduleForToday = useMemo(() => {
    const todayStr = getTodayStr();
    const dayOfWeek = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"][new Date().getDay()];
    
    const realSessions = sessoesMesSelecionado
      .filter(s => s.data_sessao === todayStr)
      .map(s => ({
        id: s.paciente_id,
        nome_completo: s.pacientes?.nome_completo || "Paciente",
        tipo: 'esporadico',
        horario: s.pacientes?.horario_consulta,
        telefone: s.pacientes?.telefone
      }));

    const fixed = pacientesFixos.filter(p => p.dia_fixo === dayOfWeek);
    const sporadic = pacientesEsporadicos.filter(p => p.data_consulta === todayStr);

    const combined = [...realSessions];
    [...fixed, ...sporadic].forEach(p => {
      if (!combined.some(c => c.id === p.id)) {
        combined.push({
          id: p.id,
          nome_completo: p.nome_completo,
          tipo: p.dia_fixo ? 'fixo' : 'esporadico',
          horario: p.horario_consulta,
          telefone: p.telefone
        });
      }
    });

    return combined.sort((a, b) => (a.horario || "").localeCompare(b.horario || ""));
  }, [sessoesMesSelecionado, pacientesFixos, pacientesEsporadicos]);

  const handleDeletePaciente = async (id: string) => {
    if (!window.confirm("Deseja realmente excluir este paciente?")) return;
    const { error } = await supabase.from('pacientes').delete().eq('id', id);
    if (!error) loadPacientes();
  };

  const handleEditClick = (p: any) => {
    setEditingPaciente(p);
    setFormData({
      nome_completo: p.nome_completo || "",
      idade: p.idade || "",
      telefone: p.telefone || "",
      relato_proxima_triagem: p.relato_proxima_triagem || "",
      pauta_proxima_semana: p.pauta_proxima_semana || "",
      data_consulta: p.data_consulta || "",
      horario_consulta: p.horario_consulta || "",
      valor_sessao: p.valor_sessao || "",
      dia_fixo: p.dia_fixo || ""
    });
    setIsModalOpen(true);
  };

  const handleSavePaciente = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = { ...formData };
    if (!payload.data_consulta) (payload as any).data_consulta = null;

    if (editingPaciente) {
      await supabase.from('pacientes').update(payload).eq('id', editingPaciente.id);
    } else {
      await supabase.from('pacientes').insert([payload]);
    }
    setIsModalOpen(false);
    loadPacientes();
    setLoading(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 bg-slate-900/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-slate-900">Acesso Restrito</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><X size={24} /></button>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border-2 border-slate-200 rounded-xl p-3 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border-2 border-slate-200 rounded-xl p-3 outline-none" required />
            </div>
            {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
            <button type="submit" className="w-full bg-brand-orange text-white font-black py-4 rounded-xl shadow-lg hover:bg-orange-600 transition-colors">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  const renderPatientCard = (p: any) => (
    <div key={p.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-orange/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-black text-xl text-slate-900">{p.nome_completo}</h3>
          <p className="text-slate-500 text-sm">{p.idade} {p.idade ? 'anos •' : ''} {p.telefone}</p>
        </div>
        <div className="flex items-center gap-3">
          {p.data_consulta && (
            <div className="text-right">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Consulta</span>
              <span className="font-black text-brand-orange text-sm">{new Date(p.data_consulta + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
            </div>
          )}
          <button onClick={() => openFinanceiro(p)} className="p-3 bg-brand-orange/10 text-brand-orange hover:bg-brand-orange hover:text-white rounded-2xl transition-all shadow-sm">
            <DollarSign size={20} />
          </button>
        </div>
      </div>
      <div className="flex gap-2">
        <a href={`https://wa.me/55${p.telefone?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-emerald-50 text-emerald-600 font-bold py-2 rounded-xl hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2 text-xs">
          <MessageCircle size={14} /> WhatsApp
        </a>
        <button onClick={() => handleEditClick(p)} className="px-4 bg-slate-50 text-slate-500 font-bold py-2 rounded-xl hover:bg-slate-200 transition-all text-xs">Editar</button>
        <button onClick={() => handleDeletePaciente(p.id)} className="px-4 bg-red-50 text-red-400 font-bold py-2 rounded-xl hover:bg-red-500 hover:text-white transition-all text-xs">Excluir</button>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[10px] uppercase font-bold tracking-wider">
        <div className="bg-slate-50 p-2 rounded-xl">
          <span className="text-slate-400 block mb-1">Horário</span>
          <span className="text-slate-700">{p.horario_consulta || '-'}</span>
        </div>
        <div className="bg-slate-50 p-2 rounded-xl">
          <span className="text-slate-400 block mb-1">Dia Fixo</span>
          <span className="text-slate-700">{p.dia_fixo || '-'}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-100 z-[100] flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4 flex flex-col sm:flex-row justify-between items-center shrink-0 shadow-sm z-10 gap-4">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Flower2 className="text-brand-orange" />
          Portal Administrativo
        </h1>
        
        <div className="flex bg-slate-100 p-1 rounded-full">
          <button onClick={() => setActiveTab('agenda')} className={`px-8 py-2 rounded-full font-black text-sm transition-all ${activeTab === 'agenda' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Agenda</button>
          <button onClick={() => { setActiveTab('financeiro'); setSelectedChartDay(null); }} className={`px-8 py-2 rounded-full font-black text-sm transition-all ${activeTab === 'financeiro' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Financeiro</button>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => { setIsLoggedIn(false); localStorage.removeItem('isLoggedIn'); onClose(); }} className="px-4 py-2 bg-slate-900 text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-colors">Sair</button>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 bg-slate-100 rounded-full text-slate-500"><X size={24} /></button>
        </div>
      </div>

      {/* Subheader Filters */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 group">
            <input type="text" placeholder="Pesquisar paciente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-12 outline-none focus:border-brand-orange focus:bg-white transition-all font-medium" />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Filter size={20} /></div>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <select value={faturamentoMes} onChange={e => setFaturamentoMes(Number(e.target.value))} className="bg-transparent border-none text-xs font-black p-1 outline-none uppercase tracking-widest text-slate-700">
              {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('pt-BR', { month: 'short' }).toUpperCase()}</option>
              ))}
            </select>
            <select value={faturamentoAno} onChange={e => setFaturamentoAno(Number(e.target.value))} className="bg-transparent border-none text-xs font-black p-1 outline-none text-slate-700">
              {[2024, 2025, 2026, 2027, 2028].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button onClick={handleClearAgendaMonth} className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border border-red-100">Limpar Mês</button>
          </div>
          
          {activeTab === 'agenda' && (
            <button onClick={() => { setEditingPaciente(null); setFormData({ nome_completo: "", idade: "", telefone: "", relato_proxima_triagem: "", pauta_proxima_semana: "", data_consulta: "", horario_consulta: "", valor_sessao: "", dia_fixo: "" }); setIsModalOpen(true); }} className="bg-brand-orange text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-orange-600 shadow-lg shadow-brand-orange/20 transition-all active:scale-95">
              <Plus size={20} /> Novo Registro
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'agenda' && (
            <div className="space-y-12">
              {/* Agenda Section */}
              <section className="bg-white rounded-[3rem] p-8 md:p-10 shadow-xl border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-brand-orange/5 rounded-bl-full -z-0" />
                <h2 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
                  <CalendarDays className="text-brand-orange" /> Agenda de Hoje
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scheduleForToday.map(p => (
                    <div key={p.id} className={`p-6 rounded-[2rem] border-2 flex items-center justify-between transition-all hover:scale-[1.02] ${p.tipo === 'fixo' ? 'bg-slate-900 border-slate-800 text-white shadow-xl shadow-slate-900/10' : 'bg-brand-orange/5 border-brand-orange/10 text-slate-900'}`}>
                      <div>
                        <span className="font-black text-lg block">{p.nome_completo}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${p.tipo === 'fixo' ? 'bg-white/10 text-brand-orange' : 'bg-brand-orange text-white'}`}>{p.tipo}</span>
                          <span className="text-[11px] font-bold opacity-60">{p.horario}</span>
                        </div>
                      </div>
                      <a href={`https://wa.me/55${p.telefone?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-emerald-500 rounded-2xl text-white flex items-center justify-center hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-90">
                        <MessageCircle size={22} />
                      </a>
                    </div>
                  ))}
                  {scheduleForToday.length === 0 && <p className="col-span-full text-center py-10 text-slate-400 font-bold italic">Nenhuma consulta programada para hoje.</p>}
                </div>
              </section>

              {/* Pacientes List */}
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px flex-1 bg-slate-200" />
                  <h2 className="text-xl font-black text-slate-400 uppercase tracking-[0.3em]">Gestão de Pacientes</h2>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {pacientesFixos.length > 0 && <div className="col-span-full"><h3 className="text-xs font-black uppercase text-brand-orange tracking-[0.2em] mb-2">Pacientes Fixos</h3></div>}
                  {pacientesFixos.map(p => renderPatientCard(p))}
                  {pacientesEsporadicos.length > 0 && <div className="col-span-full mt-10"><h3 className="text-xs font-black uppercase text-brand-orange tracking-[0.2em] mb-2">Pacientes Esporádicos</h3></div>}
                  {pacientesEsporadicos.map(p => renderPatientCard(p))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'financeiro' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats Card */}
                <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col justify-center border-4 border-slate-800">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-orange/10 to-transparent pointer-events-none" />
                  <span className="text-brand-orange font-black uppercase text-[10px] tracking-[0.3em] mb-3 block">Faturamento Consolidado</span>
                  <div className="text-5xl font-black text-white mb-2">{faturamentoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                  <p className="text-slate-400 text-xs font-medium">Referente ao período selecionado</p>
                </div>
                
                {/* Chart Card */}
                <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 lg:col-span-2">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest flex items-center gap-2">
                      <LineChartIcon size={16} className="text-brand-orange" /> Performance Mensal
                    </h3>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Meta: {metaConsultas} consultas</div>
                  </div>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} onClick={(data) => data && data.activeLabel && setSelectedChartDay(data.activeLabel)}>
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ff6600" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#ff9900" stopOpacity={0.8}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} tickFormatter={(val) => new Date(val + 'T12:00:00').getDate().toString()} />
                        <YAxis domain={[0, metaConsultas]} ticks={[0, 5, 10, 15, 20]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                        <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} labelFormatter={(label) => new Date(label + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })} />
                        <Bar dataKey="consultas" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={20}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.date === selectedChartDay ? '#0f172a' : 'url(#barGradient)'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Day Details */}
              {selectedChartDay && (
                <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-2 border-brand-orange/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                      <h3 className="font-black text-3xl text-slate-900">{new Date(selectedChartDay + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</h3>
                      <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Detalhamento de Consultas e Receitas</p>
                    </div>
                    <button onClick={handleDeleteDayData} className="px-6 py-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all border border-red-100">Excluir Tudo deste Dia</button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pacientesDoDia.map(s => (
                      <div key={s.sessionId || s.id} className="group p-8 bg-slate-50 rounded-[2.5rem] border-2 border-transparent hover:border-brand-orange/20 hover:bg-white hover:shadow-xl transition-all duration-300">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <div className="font-black text-xl text-slate-900 group-hover:text-brand-orange transition-colors">{s.nome_completo}</div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter">{s.horario}</span>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.tipo}</span>
                              {s.valor && <span className="text-[10px] font-black text-emerald-600">R$ {s.valor}</span>}
                            </div>
                          </div>
                          {s.pago ? (
                            <div className="flex flex-col items-end">
                              <span className="bg-emerald-100 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black border border-emerald-200">PAGO</span>
                              {s.sessionId && <button onClick={() => handleDeletePagamento(s.sessionId!, s.id)} className="mt-2 text-[9px] font-black text-red-400 hover:text-red-600 uppercase">Estornar</button>}
                            </div>
                          ) : (
                            <button onClick={() => openFinanceiro(s, selectedChartDay)} className="bg-white text-brand-orange px-5 py-2 rounded-full text-[10px] font-black border-2 border-brand-orange/30 hover:bg-brand-orange hover:text-white hover:border-brand-orange transition-all shadow-sm">REGISTRAR PAGAMENTO</button>
                          )}
                        </div>
                        <div className="space-y-4">
                          <div className="bg-white/80 p-5 rounded-2xl border border-slate-100">
                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Relato Próxima Triagem</span>
                            <p className="text-xs text-slate-600 italic leading-relaxed">{s.relato || 'Nenhum relato preenchido.'}</p>
                          </div>
                          <div className="bg-white/80 p-5 rounded-2xl border border-slate-100">
                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pauta Próxima Semana</span>
                            <p className="text-xs text-slate-600 italic leading-relaxed">{s.pauta || 'Nenhuma pauta preenchida.'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {pacientesDoDia.length === 0 && <p className="col-span-full text-center py-20 text-slate-400 font-bold italic">Nenhum paciente vinculado a este dia.</p>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 z-[120] flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[3rem] p-10 max-w-2xl w-full my-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-slate-900">{editingPaciente ? 'Editar Cadastro' : 'Novo Paciente'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400"><X size={28} /></button>
            </div>
            <form onSubmit={handleSavePaciente} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-2">Nome Completo</label>
                <input type="text" value={formData.nome_completo} onChange={e => setFormData({...formData, nome_completo: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-brand-orange focus:bg-white transition-all font-bold" required />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-2">Idade</label>
                <input type="text" value={formData.idade} onChange={e => setFormData({...formData, idade: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-brand-orange focus:bg-white transition-all font-bold" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-2">WhatsApp</label>
                <input type="text" value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-brand-orange focus:bg-white transition-all font-bold" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-2">Relato da Triagem</label>
                <textarea value={formData.relato_proxima_triagem} onChange={e => setFormData({...formData, relato_proxima_triagem: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 h-28 resize-none outline-none focus:border-brand-orange focus:bg-white transition-all font-medium text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-2">Pauta para Próxima Semana</label>
                <textarea value={formData.pauta_proxima_semana} onChange={e => setFormData({...formData, pauta_proxima_semana: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 h-28 resize-none outline-none focus:border-brand-orange focus:bg-white transition-all font-medium text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-2">Data da Consulta</label>
                <input type="date" value={formData.data_consulta} onChange={e => setFormData({...formData, data_consulta: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-brand-orange focus:bg-white transition-all font-bold" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-2">Horário</label>
                <input type="time" value={formData.horario_consulta} onChange={e => setFormData({...formData, horario_consulta: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-brand-orange focus:bg-white transition-all font-bold" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-2">Valor da Sessão</label>
                <input type="text" value={formData.valor_sessao} onChange={e => setFormData({...formData, valor_sessao: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-brand-orange focus:bg-white transition-all font-bold" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-2">Dia Fixo de Atendimento</label>
                <select value={formData.dia_fixo} onChange={e => setFormData({...formData, dia_fixo: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-brand-orange focus:bg-white transition-all font-bold">
                  <option value="">NÃO É FIXO (ESPORÁDICO)</option>
                  <option value="Segunda">SEGUNDA-FEIRA</option><option value="Terça">TERÇA-FEIRA</option><option value="Quarta">QUARTA-FEIRA</option><option value="Quinta">QUINTA-FEIRA</option><option value="Sexta">SEXTA-FEIRA</option><option value="Sábado">SÁBADO</option>
                </select>
              </div>
              <div className="md:col-span-2 flex gap-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 border-2 border-slate-100 py-4 rounded-2xl font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all">Cancelar</button>
                <button type="submit" disabled={loading} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50">Salvar Dados</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPaymentModalOpen && selectedPacienteForPayment && (
        <div className="fixed inset-0 bg-slate-900/70 z-[130] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] p-10 max-w-xl w-full shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900">Registrar Pagamento</h2>
              <button onClick={() => setIsPaymentModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><X size={24} /></button>
            </div>
            <p className="text-slate-500 font-bold mb-8 flex items-center gap-2">Paciente: <span className="text-brand-orange">{selectedPacienteForPayment.nome_completo}</span></p>
            
            <form onSubmit={handleSavePagamento} className="bg-slate-50 p-8 rounded-[2.5rem] mb-8 border border-slate-100 shadow-inner">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 ml-2">Data da Sessão (Ref. Gráfico)</label>
                  <input type="date" value={pagamentoData.data_sessao} onChange={e => setPagamentoData({...pagamentoData, data_sessao: e.target.value})} className="w-full p-4 border-2 border-slate-100 rounded-2xl outline-none focus:border-brand-orange bg-white font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 ml-2">Valor Recebido</label>
                  <input type="text" value={pagamentoData.valor} onChange={e => setPagamentoData({...pagamentoData, valor: e.target.value})} className="w-full p-4 border-2 border-slate-100 rounded-2xl outline-none focus:border-brand-orange bg-white font-bold" />
                </div>
                <label className="flex items-center gap-3 font-black text-slate-700 cursor-pointer select-none">
                  <input type="checkbox" checked={pagamentoData.pago} onChange={e => setPagamentoData({...pagamentoData, pago: e.target.checked})} className="w-6 h-6 rounded-lg accent-emerald-500" />
                  Confirmar Recebimento?
                </label>
                <button type="submit" disabled={loading} className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95">Efetivar Registro</button>
              </div>
            </form>
            
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Últimos Lançamentos</h4>
              <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {pagamentos.map(p => (
                  <div key={p.id} className="flex justify-between items-center p-4 bg-white rounded-2xl text-sm border border-slate-100 shadow-sm">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800">{new Date(p.data_sessao + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                      <span className="text-[10px] font-bold text-emerald-600">R$ {p.valor}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => togglePago(p)} className={`px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest transition-all ${p.pago ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-amber-100 text-amber-600 border border-amber-200'}`}>{p.pago ? 'CONCLUÍDO' : 'PENDENTE'}</button>
                      <button onClick={() => handleDeletePagamento(p.id, p.paciente_id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
                {pagamentos.length === 0 && <p className="text-center py-4 text-slate-400 text-xs font-bold italic">Sem histórico financeiro.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
