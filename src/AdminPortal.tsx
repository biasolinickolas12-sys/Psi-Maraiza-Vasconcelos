import React, { useState, useEffect, useMemo } from "react";
import { 
  X, Plus, Flower2, Edit2, DollarSign, CalendarDays, LineChart as LineChartIcon, Filter, MessageCircle, Trash2, Search
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
  const [dayOverrides, setDayOverrides] = useState<Record<string, number>>({});

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

    const { data: overridesData } = await supabase.from('configuracoes').select('chave, valor').like('chave', 'override_pacientes_%');
    if (overridesData) {
      const overrides: Record<string, number> = {};
      overridesData.forEach((item: any) => {
        const dateStr = item.chave.replace('override_pacientes_', '');
        overrides[dateStr] = Number(item.valor);
      });
      setDayOverrides(overrides);
    }
  };

  const saveNotas = async (val: string) => {
    setNotasImportantes(val);
    await supabase.from('configuracoes').upsert({ chave: 'notas_importantes', valor: val });
  };

  const saveMeta = async (val: number) => {
    setMetaConsultas(val);
    await supabase.from('configuracoes').upsert({ chave: 'meta_consultas', valor: val.toString() });
  };

  const handleSaveDayOverride = async (dateStr: string, value: string) => {
    const chave = `override_pacientes_${dateStr}`;
    if (value === '') {
      await supabase.from('configuracoes').delete().eq('chave', chave);
      setDayOverrides(prev => {
        const next = { ...prev };
        delete next[dateStr];
        return next;
      });
    } else {
      await supabase.from('configuracoes').upsert({ chave, valor: value });
      setDayOverrides(prev => ({ ...prev, [dateStr]: Number(value) }));
    }
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
      if (activeTab === 'financeiro') {
        loadTodasSessoes();
        loadNotas();
      }
    }
  }, [activeTab, isLoggedIn]);

  const handleNewPacienteClick = () => {
    setEditingPaciente(null);
    setFormData({
      nome_completo: "", idade: "", telefone: "", relato_proxima_triagem: "", pauta_proxima_semana: "",
      data_consulta: "", horario_consulta: "", valor_sessao: "", dia_fixo: ""
    });
    setIsModalOpen(true);
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

    const payload: any = { ...formData };
    if (!payload.data_consulta) payload.data_consulta = null;

    if (editingPaciente) {
      const { error } = await supabase.from('pacientes').update(payload).eq('id', editingPaciente.id);
      if (!error) {
        setIsModalOpen(false);
        loadPacientes();
      } else {
        console.error(error);
        alert("Erro ao editar paciente");
      }
    } else {
      const { error } = await supabase.from('pacientes').insert([payload]);
      if (!error) {
        setIsModalOpen(false);
        loadPacientes();
      } else {
        console.error(error);
        alert("Erro ao salvar paciente");
      }
    }
    setLoading(false);
  };

  const handleDeletePaciente = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este paciente e todo seu histórico?")) {
      setLoading(true);
      await supabase.from('pacientes').delete().eq('id', id);
      loadPacientes();
      setLoading(false);
    }
  };

  const openFinanceiro = (p: any, initialDate?: string) => {
    setSelectedPacienteForPayment(p);
    setPagamentoData({ 
      data_sessao: initialDate || p.data_consulta || new Date().toISOString().split('T')[0], 
      valor: p.valor_sessao || "", 
      pago: true 
    });
    loadPagamentos(p.id);
    setIsPaymentModalOpen(true);
  };

  const loadPagamentos = async (pacienteId: string) => {
    const { data } = await supabase.from('pagamentos').select('*').eq('paciente_id', pacienteId).order('data_sessao', { ascending: false });
    if (data) setPagamentos(data);
  };

  const handleSavePagamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPacienteForPayment) return;
    setLoading(true);
    
    // Convert comma to dot for parsing
    const valorNum = parseFloat(pagamentoData.valor.replace(',', '.') || '0');
    
    const { error } = await supabase.from('pagamentos').insert([{
      paciente_id: selectedPacienteForPayment.id,
      data_sessao: pagamentoData.data_sessao,
      valor: valorNum,
      pago: pagamentoData.pago
    }]);

    if (!error) {
      setPagamentoData({ data_sessao: "", valor: selectedPacienteForPayment.valor_sessao || "", pago: false });
      loadPagamentos(selectedPacienteForPayment.id);
      if (activeTab === 'financeiro') loadTodasSessoes();
    } else {
      alert("Erro ao adicionar pagamento");
    }
    setLoading(false);
  };

  const togglePago = async (pag: any) => {
    const { error } = await supabase.from('pagamentos').update({ pago: !pag.pago }).eq('id', pag.id);
    if (!error) {
      loadPagamentos(pag.paciente_id);
      if (activeTab === 'financeiro') loadTodasSessoes();
    }
  };

  const handleDeletePagamento = async (id: string, pacienteId: string) => {
    if (!window.confirm("Deseja realmente excluir este registro de pagamento?")) return;
    
    const { error } = await supabase.from('pagamentos').delete().eq('id', id);
    if (!error) {
      loadPagamentos(pacienteId);
      if (activeTab === 'financeiro') loadTodasSessoes();
    }
  };

  const handleDeleteDayData = async () => {
    if (!selectedChartDay) return;
    const dateFormatted = new Date(selectedChartDay + 'T12:00:00').toLocaleDateString('pt-BR');
    if (!window.confirm(`ATENÇÃO: Deseja apagar TODOS os registros de sessões e pagamentos do dia ${dateFormatted}?\n\nEsta ação não pode ser desfeita.`)) return;
    
    setLoading(true);
    const { error } = await supabase
      .from('pagamentos')
      .delete()
      .eq('data_sessao', selectedChartDay);

    if (!error) {
      loadTodasSessoes();
      alert("Dados do dia removidos com sucesso.");
    } else {
      alert("Erro ao remover dados.");
    }
    setLoading(false);
  };

  const handleClearAgendaMonth = async () => {
    const mesNome = new Date(faturamentoAno, faturamentoMes - 1).toLocaleString('pt-BR', { month: 'long' });
    if (!window.confirm(`ATENÇÃO: Você deseja apagar TODOS os dados de agenda de ${mesNome} de ${faturamentoAno}?\n\n- Datas de consultas dos pacientes esporádicos deste mês serão removidas.\n- Todos os registros financeiros (pagamentos) deste mês serão deletados.\n\nEsta ação é irreversível!`)) return;

    setLoading(true);
    const firstDay = `${faturamentoAno}-${String(faturamentoMes).padStart(2, '0')}-01`;
    const lastDay = `${faturamentoAno}-${String(faturamentoMes).padStart(2, '0')}-${new Date(faturamentoAno, faturamentoMes, 0).getDate()}`;
    
    // 1. Clear sporadic dates
    await supabase.from('pacientes').update({ data_consulta: null }).gte('data_consulta', firstDay).lte('data_consulta', lastDay);
    // 2. Clear payments
    await supabase.from('pagamentos').delete().gte('data_sessao', firstDay).lte('data_sessao', lastDay);

    loadPacientes();
    loadTodasSessoes();
    alert("Dados do mês removidos com sucesso.");
    setLoading(false);
  };

  const handleDeleteMonthData = async () => {
    const mesNome = new Date(faturamentoAno, faturamentoMes - 1).toLocaleString('pt-BR', { month: 'long' });
    if (!window.confirm(`ATENÇÃO: Você está prestes a apagar TODOS os registros de sessões e pagamentos de ${mesNome} de ${faturamentoAno}.\n\nEsta ação é irreversível. Deseja continuar?`)) return;
    
    setLoading(true);
    const daysInMonth = new Date(faturamentoAno, faturamentoMes, 0).getDate();
    const startDate = `${faturamentoAno}-${String(faturamentoMes).padStart(2, '0')}-01`;
    const endDate = `${faturamentoAno}-${String(faturamentoMes).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
    
    const { error } = await supabase
      .from('pagamentos')
      .delete()
      .gte('data_sessao', startDate)
      .lte('data_sessao', endDate);

    if (!error) {
      loadTodasSessoes();
      alert("Dados do mês removidos com sucesso.");
    } else {
      alert("Erro ao remover dados.");
    }
    setLoading(false);
  };

  const filteredPacientes = pacientes.filter(p => 
    p.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pacientesFixos = filteredPacientes.filter(p => p.dia_fixo);
  const pacientesEsporadicos = filteredPacientes.filter(p => !p.dia_fixo);

  // Faturamento Logic
  const sessoesMesSelecionado = useMemo(() => {
    return todasSessoes.filter(s => {
      if (!s.data_sessao) return false;
      const date = new Date(s.data_sessao);
      // We must add timezone offset to avoid previous day issue
      const userTimezoneOffset = date.getTimezoneOffset() * 60000;
      const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
      return adjustedDate.getMonth() + 1 === faturamentoMes && adjustedDate.getFullYear() === faturamentoAno;
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
    
    // Create a map for O(1) lookup of real sessions
    const sessionCounts = new Map<string, number>();
    sessoesMesSelecionado.forEach(s => {
      if (s.data_sessao) {
        sessionCounts.set(s.data_sessao, (sessionCounts.get(s.data_sessao) || 0) + 1);
      }
    });

    const weekdaysMap: Record<number, string> = {
      1: "Segunda", 2: "Terça", 3: "Quarta", 4: "Quinta", 5: "Sexta", 6: "Sábado", 0: "Domingo"
    };

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(faturamentoAno, faturamentoMes - 1, day);
      const dayOfWeek = weekdaysMap[date.getDay()];
      const dateStr = `${faturamentoAno}-${String(faturamentoMes).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      let expectedTotal = 0;
      if (dayOverrides[dateStr] !== undefined) {
        expectedTotal = dayOverrides[dateStr];
      } else {
        const fixedCount = pacientesFixos.filter(p => p.dia_fixo === dayOfWeek).length;
        const sporadicScheduled = pacientesEsporadicos.filter(p => p.data_consulta === dateStr).length;
        expectedTotal = fixedCount + sporadicScheduled;
      }
      
      data.push({ 
        date: dateStr, 
        consultas: expectedTotal
      });
    }
    
    return data;
  }, [sessoesMesSelecionado, faturamentoMes, faturamentoAno, pacientesFixos, pacientesEsporadicos, dayOverrides]);

  const pacientesDoDia = useMemo(() => {
    if (!selectedChartDay) return [];
    
    // Real sessions from payments table
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

    // Fixed patients for that day of week
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
        pago: false // Projections are pending by default
      }));

    // Scheduled sporadic patients for this specific date
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
        pago: false // Projections are pending by default
      }));

    const combined = [...realSessions];
    
    // Add scheduled patients if they don't already have a session record for this day
    [...fixed, ...sporadicScheduled].forEach(p => {
      if (!combined.some(c => c.id === p.id)) {
        combined.push(p);
      }
    });

    return combined.sort((a, b) => (a.horario || "").localeCompare(b.horario || ""));
  }, [sessoesMesSelecionado, selectedChartDay, pacientesFixos, pacientesEsporadicos]);

  const scheduleForToday = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('en-CA');
    const dayOfWeek = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"][new Date().getDay()];
    
    // Real sessions for today (using todasSessoes to avoid month-filter dependency)
    const realSessions = todasSessoes
      .filter(s => s.data_sessao === todayStr)
      .map(s => ({
        id: s.paciente_id,
        nome_completo: s.pacientes?.nome_completo || "Paciente",
        tipo: 'esporadico',
        horario: s.pacientes?.horario_consulta,
        telefone: s.pacientes?.telefone,
        relato: s.pacientes?.relato_proxima_triagem,
        pauta: s.pacientes?.pauta_proxima_semana
      }));

    // Fixed patients for today's weekday (using raw pacientes to ignore search term)
    const fixed = pacientes
      .filter(p => p.dia_fixo === dayOfWeek)
      .map(p => ({
        id: p.id,
        nome_completo: p.nome_completo,
        tipo: 'fixo',
        horario: p.horario_consulta,
        telefone: p.telefone,
        relato: p.relato_proxima_triagem,
        pauta: p.pauta_proxima_semana
      }));

    // Scheduled sporadic patients for today (using raw pacientes to ignore search term)
    const sporadicScheduled = pacientes
      .filter(p => !p.dia_fixo && p.data_consulta === todayStr)
      .map(p => ({
        id: p.id,
        nome_completo: p.nome_completo,
        tipo: 'esporadico',
        horario: p.horario_consulta,
        telefone: p.telefone,
        relato: p.relato_proxima_triagem,
        pauta: p.pauta_proxima_semana
      }));

    const combined = [...realSessions];
    [...fixed, ...sporadicScheduled].forEach(p => {
      if (!combined.some(c => c.id === p.id)) {
        combined.push(p);
      }
    });

    return combined.sort((a, b) => (a.horario || "").localeCompare(b.horario || ""));
  }, [todasSessoes, pacientes]);

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 bg-slate-900/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-slate-900">Acesso Restrito</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-brand-orange outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-brand-orange outline-none" required />
            </div>
            {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
            <button type="submit" className="w-full bg-brand-orange text-white font-black py-4 rounded-xl shadow-lg hover:bg-orange-600 transition-colors">
              Entrar
            </button>
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
        </div>
      </div>
      
      <div className="flex gap-2">
        <a 
          href={`https://wa.me/55${p.telefone?.replace(/\D/g, '')}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-1 bg-emerald-50 text-emerald-600 font-bold py-2 rounded-xl hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2 text-xs"
        >
          <MessageCircle size={14} /> WhatsApp
        </a>
        <button onClick={() => handleEditClick(p)} className="px-4 bg-slate-50 text-slate-500 font-bold py-2 rounded-xl hover:bg-slate-200 transition-all text-xs">
          Editar
        </button>
        <button onClick={() => handleDeletePaciente(p.id)} className="px-4 bg-red-50 text-red-400 font-bold py-2 rounded-xl hover:bg-red-500 hover:text-white transition-all text-xs">
          Excluir
        </button>
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
      <div className="bg-white border-b border-slate-200 p-4 flex flex-col sm:flex-row justify-between items-center shrink-0 shadow-sm z-10 gap-4">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Flower2 className="text-brand-orange" />
          Portal Administrativo
        </h1>
        
        <div className="flex bg-slate-100 p-1 rounded-full">
          <button 
            onClick={() => setActiveTab('agenda')}
            className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'agenda' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <CalendarDays size={18} className="inline mr-2" />
            Agenda
          </button>
          <button 
            onClick={() => { setActiveTab('financeiro'); setSelectedChartDay(null); }}
            className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'financeiro' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <LineChartIcon size={18} className="inline mr-2" />
            Financeiro
          </button>
        </div>

        <div className="flex items-center gap-4">
          {activeTab === 'agenda' && (
            <button onClick={handleNewPacienteClick} className="bg-slate-900 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-slate-800 shadow-md">
              <Plus size={20} />
              Novo
            </button>
          )}
          <button 
            onClick={() => { 
              setIsLoggedIn(false); 
              localStorage.removeItem('isLoggedIn');
              localStorage.removeItem('isAdminPortalOpen');
            }} 
            className="px-4 py-2 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-full font-bold text-xs transition-colors flex items-center gap-2"
          >
            Sair
          </button>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 bg-slate-100 rounded-full text-slate-500">
            <X size={24} />
          </button>
        </div>
      </div>

      {activeTab === 'agenda' && (
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <input 
                type="text" 
                placeholder="Pesquisar paciente por nome..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-12 outline-none focus:border-brand-orange focus:bg-white transition-all font-medium"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={20} />
              </div>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 w-full md:w-auto">
              <select value={faturamentoMes} onChange={e => setFaturamentoMes(Number(e.target.value))} className="bg-transparent border-none text-xs font-bold text-slate-700 outline-none p-1">
                {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('pt-BR', { month: 'short' }).toUpperCase()}</option>
                ))}
              </select>
              <select value={faturamentoAno} onChange={e => setFaturamentoAno(Number(e.target.value))} className="bg-transparent border-none text-xs font-bold text-slate-700 outline-none p-1">
                {[2024, 2025, 2026, 2027, 2028].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <button 
                onClick={handleClearAgendaMonth}
                className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest whitespace-nowrap"
              >
                Limpar Mês
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          
          {activeTab === 'agenda' && (
            <div className="space-y-10">
              {/* Anotações Importantes na Agenda */}
              <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <span className="text-slate-500 font-bold uppercase text-xs mb-3 block flex items-center gap-2">
                  <Edit2 size={14} /> Anotações Importantes
                </span>
                <textarea 
                  value={notasImportantes}
                  onChange={(e) => saveNotas(e.target.value)}
                  placeholder="Digite aqui anotações, lembretes ou tarefas..."
                  className="w-full bg-slate-50 rounded-2xl p-4 outline-none focus:bg-white border-2 border-transparent focus:border-brand-orange/20 transition-all text-slate-700 text-sm min-h-[120px] resize-none"
                />
              </section>

              {/* Agenda de Hoje - Timeline */}
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 rounded-bl-full -z-0" />
                <div className="flex items-center gap-4 mb-8 relative z-10">
                  <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <CalendarDays size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Agenda de Hoje</h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                  </div>
                </div>

                <div className="space-y-1 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar relative z-10">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const hour = String(i).padStart(2, '0') + ":00";
                    const patientsAtThisHour = scheduleForToday.filter(s => s.horario?.startsWith(String(i).padStart(2, '0')));
                    
                    return (
                      <div key={hour} className="group flex gap-4 min-h-[50px]">
                        <div className="w-12 pt-1 text-right">
                          <span className="text-[10px] font-black text-slate-300 group-hover:text-brand-orange transition-colors">{hour}</span>
                        </div>
                        <div className="flex-1 relative pb-2">
                          <div className="absolute left-0 top-3 bottom-0 w-px bg-slate-100 group-last:bg-transparent" />
                          <div className="absolute left-[-4px] top-3 w-2 h-2 rounded-full border-2 border-slate-200 bg-white group-hover:border-brand-orange transition-colors" />
                          
                          <div className="ml-6 space-y-2">
                            {patientsAtThisHour.map(p => (
                              <div key={p.id} className={`p-4 rounded-[1.5rem] border flex flex-col gap-3 transition-all group/item hover:shadow-md ${p.tipo === 'fixo' ? 'bg-slate-900 text-white border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="font-black text-base block leading-none mb-1">{p.nome_completo}</span>
                                    <span className={`text-[10px] uppercase font-bold tracking-widest ${p.tipo === 'fixo' ? 'text-slate-400' : 'text-brand-orange'}`}>{p.horario} • {p.tipo}</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <a 
                                      href={`https://wa.me/55${p.telefone?.replace(/\D/g, '')}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-sm text-xs font-bold"
                                    >
                                      <MessageCircle size={16} />
                                      WhatsApp
                                    </a>
                                    <button 
                                      onClick={() => openFinanceiro(p)} 
                                      className={`p-2 rounded-xl transition-colors ${p.tipo === 'fixo' ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                                    >
                                      <DollarSign size={16} />
                                    </button>
                                  </div>
                                </div>

                                {(p.pauta || p.relato) && (
                                  <div className={`text-[10px] p-3 rounded-xl ${p.tipo === 'fixo' ? 'bg-white/5 text-slate-300' : 'bg-slate-50 text-slate-500'} border ${p.tipo === 'fixo' ? 'border-white/10' : 'border-slate-100'}`}>
                                    {p.pauta && <p className="line-clamp-1"><strong>Pauta:</strong> {p.pauta}</p>}
                                    {p.relato && <p className="line-clamp-1 mt-1"><strong>Relato:</strong> {p.relato}</p>}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section>
                <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-brand-orange block"></span>
                  Pacientes Fixos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pacientesFixos.map(renderPatientCard)}
                  {pacientesFixos.length === 0 && (
                    <p className="text-slate-400 col-span-full">Nenhum paciente fixo cadastrado.</p>
                  )}
                </div>
              </section>

              <section>
                <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-400 block"></span>
                  Pacientes Esporádicos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pacientesEsporadicos.map(renderPatientCard)}
                  {pacientesEsporadicos.length === 0 && (
                    <p className="text-slate-400 col-span-full">Nenhum paciente esporádico cadastrado.</p>
                  )}
                </div>
              </section>

            </div>
          )}

          {activeTab === 'financeiro' && (
            <div className="space-y-8">
              {/* Filtros e Total */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Section */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
                  <span className="text-slate-500 font-bold uppercase text-xs mb-2 block">Faturamento Total do Mês</span>
                  <div className="text-4xl font-black text-emerald-600">
                    {faturamentoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                  <span className="text-slate-400 text-sm mt-2">Apenas sessões marcadas como "Pagas"</span>
                </div>
                
                {/* Meta de Consultas */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-slate-500 font-bold uppercase text-xs block">Meta de Consultas Pagas</span>
                    <input 
                      type="number" 
                      value={metaConsultas} 
                      onChange={e => saveMeta(Number(e.target.value))}
                      className="w-16 bg-slate-50 border-none rounded-lg p-1 text-center font-bold text-slate-700 focus:ring-2 focus:ring-brand-orange outline-none"
                    />
                  </div>
                  
                  {(() => {
                    const pagasCount = sessoesMesSelecionado.filter(s => s.pago).length;
                    const percent = Math.min(Math.round((pagasCount / (metaConsultas || 1)) * 100), 100);
                    return (
                      <>
                        <div className="flex items-end gap-2 mb-2">
                          <span className="text-3xl font-black text-slate-800">{pagasCount}</span>
                          <span className="text-slate-400 font-bold mb-1">/ {metaConsultas}</span>
                          <span className="ml-auto text-brand-orange font-black">{percent}%</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-brand-orange transition-all duration-1000" 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Filters Section */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-500 font-bold uppercase text-xs flex items-center gap-2">
                      <Filter size={14} /> Filtros de Período
                    </span>
                    <button 
                      onClick={handleDeleteMonthData}
                      className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors"
                    >
                      Apagar Dados do Mês
                    </button>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Mês</label>
                      <select value={faturamentoMes} onChange={e => setFaturamentoMes(Number(e.target.value))} className="w-full border-2 border-slate-200 rounded-xl p-3 outline-none bg-slate-50">
                        {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                          <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('pt-BR', { month: 'long' })}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Ano</label>
                      <select value={faturamentoAno} onChange={e => setFaturamentoAno(Number(e.target.value))} className="w-full border-2 border-slate-200 rounded-xl p-3 outline-none bg-slate-50">
                        {[2024, 2025, 2026, 2027, 2028].map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gráfico */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <span className="text-slate-500 font-bold uppercase text-xs mb-6 block">Consultas por Dia (Clique para filtrar)</span>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} onClick={(data) => {
                      if (data && data.activeLabel) {
                        setSelectedChartDay(data.activeLabel === selectedChartDay ? null : data.activeLabel);
                      }
                    }}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ff6600" stopOpacity={1} />
                          <stop offset="100%" stopColor="#cc5200" stopOpacity={1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(val) => new Date(val + 'T12:00:00').getDate().toString()} 
                        axisLine={false} 
                        tickLine={false}
                        interval={0}
                        tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                      />
                      <YAxis domain={[0, 20]} ticks={[0, 5, 10, 15, 20]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                      <RechartsTooltip 
                        labelFormatter={(label) => new Date(label + 'T12:00:00').toLocaleDateString('pt-BR')}
                        cursor={{ fill: '#f8fafc', radius: 4 }}
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="consultas" fill="url(#barGradient)" radius={[4, 4, 0, 0]} cursor="pointer" barSize={20}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.date === selectedChartDay ? '#993d00' : 'url(#barGradient)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pacientes do Dia Selecionado */}
              {selectedChartDay && (
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 border-l-4 border-l-brand-orange">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-800 font-bold text-lg">
                      Sessões do dia {new Date(selectedChartDay + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-black uppercase text-slate-500">No Gráfico:</span>
                        <input
                          type="number"
                          placeholder="Auto"
                          value={dayOverrides[selectedChartDay] !== undefined ? dayOverrides[selectedChartDay] : ''}
                          onChange={(e) => handleSaveDayOverride(selectedChartDay, e.target.value)}
                          className="w-12 bg-transparent text-center font-bold text-brand-orange outline-none text-sm placeholder:text-slate-300"
                        />
                      </div>
                      <button 
                        onClick={handleDeleteDayData}
                        className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors"
                      >
                        Apagar dados deste dia
                      </button>
                      <button onClick={() => setSelectedChartDay(null)} className="text-sm text-slate-500 hover:text-slate-800 font-medium">Limpar filtro</button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {pacientesDoDia.map(s => (
                      <div key={s.sessionId || `${s.id}-${s.tipo}`} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-black text-xl text-slate-900 leading-tight">{s.nome_completo}</div>
                            <div className="text-slate-500 text-xs font-bold mt-1">
                              {s.idade} {s.idade ? 'anos •' : ''} {s.telefone}
                            </div>
                            <div className="text-[10px] uppercase font-bold tracking-widest text-brand-orange mt-2 bg-brand-orange/5 px-2 py-0.5 rounded-full inline-block">
                              {s.horario} • {s.tipo} {s.valor ? `• R$ ${s.valor}` : ''}
                            </div>
                          </div>
                          <div>
                            {s.pago 
                              ? <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black shadow-sm">PAGO</span>
                              : (
                                <button 
                                  onClick={() => openFinanceiro(s, selectedChartDay)}
                                  className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-[10px] font-black border border-amber-200 hover:bg-amber-200 transition-colors"
                                >
                                  REGISTRAR PAGAMENTO
                                </button>
                              )
                            }
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white/80 p-4 rounded-2xl border border-slate-100">
                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Relato Última Triagem</span>
                            <p className="text-xs text-slate-600 italic leading-relaxed">{s.relato || 'Nenhum relato preenchido.'}</p>
                          </div>
                          <div className="bg-white/80 p-4 rounded-2xl border border-slate-100">
                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pauta Próxima Semana</span>
                            <p className="text-xs text-slate-600 italic leading-relaxed">{s.pauta || 'Nenhuma pauta preenchida.'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {pacientesDoDia.length === 0 && <p className="text-sm text-slate-500">Nenhuma consulta encontrada para este dia.</p>}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Modal de Adicionar/Editar Paciente */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-[110] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900">{editingPaciente ? 'Editar Paciente' : 'Novo Paciente'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSavePaciente} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Nome Completo *</label>
                <input type="text" value={formData.nome_completo} onChange={e => setFormData({...formData, nome_completo: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-brand-orange outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Idade</label>
                <input type="text" value={formData.idade} onChange={e => setFormData({...formData, idade: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-brand-orange outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Telefone</label>
                <input type="text" value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-brand-orange outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Descrição de relato da última triagem</label>
                <textarea value={formData.relato_proxima_triagem} onChange={e => setFormData({...formData, relato_proxima_triagem: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-brand-orange outline-none h-24 resize-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Descrição de pauta para a próxima semana</label>
                <textarea value={formData.pauta_proxima_semana} onChange={e => setFormData({...formData, pauta_proxima_semana: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-brand-orange outline-none h-24 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Data da Consulta</label>
                <input type="date" value={formData.data_consulta} onChange={e => setFormData({...formData, data_consulta: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-brand-orange outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Horário</label>
                <input type="time" value={formData.horario_consulta} onChange={e => setFormData({...formData, horario_consulta: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-brand-orange outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Fixo na Semana?</label>
                <select value={formData.dia_fixo} onChange={e => setFormData({...formData, dia_fixo: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-brand-orange outline-none bg-white">
                  <option value="">Não Fixo</option>
                  <option value="Segunda">Segunda-feira</option>
                  <option value="Terça">Terça-feira</option>
                  <option value="Quarta">Quarta-feira</option>
                  <option value="Quinta">Quinta-feira</option>
                  <option value="Sexta">Sexta-feira</option>
                  <option value="Sábado">Sábado</option>
                </select>
              </div>
              <div className="md:col-span-2 pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 border-2 border-slate-200 text-slate-700 font-black py-4 rounded-xl hover:bg-slate-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="flex-1 bg-brand-orange text-white font-black py-4 rounded-xl shadow-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Financeiro do Paciente */}
      {isPaymentModalOpen && selectedPacienteForPayment && (
        <div className="fixed inset-0 bg-slate-900/60 z-[110] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900">Financeiro: {selectedPacienteForPayment.nome_completo}</h2>
              <button onClick={() => setIsPaymentModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                <X size={24} />
              </button>
            </div>

            {/* Adicionar Pagamento */}
            <form onSubmit={handleSavePagamento} className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase">Registrar Novo Pagamento</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">
                    Data da Sessão (Referência no Gráfico) *
                  </label>
                  <div className="relative">
                    <input 
                      type="date" 
                      value={pagamentoData.data_sessao} 
                      onChange={e => setPagamentoData({...pagamentoData, data_sessao: e.target.value})} 
                      className={`w-full border-2 border-slate-200 rounded-xl p-3 outline-none focus:border-brand-orange bg-white ${selectedChartDay ? 'border-brand-orange bg-orange-50/30' : ''}`} 
                      required 
                    />
                    {selectedChartDay && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-brand-orange bg-white px-2 py-1 rounded-lg border border-orange-100 uppercase">
                        Vinculado ao Gráfico
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1 font-bold">
                    * Este pagamento marcará como "PAGO" o dia selecionado acima.
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Valor *</label>
                  <input type="text" value={pagamentoData.valor} onChange={e => setPagamentoData({...pagamentoData, valor: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-2 outline-none focus:border-brand-orange" required />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={pagamentoData.pago} onChange={e => setPagamentoData({...pagamentoData, pago: e.target.checked})} className="w-5 h-5 accent-brand-orange" />
                  <span className="font-bold text-slate-700">Já foi pago?</span>
                </label>
                <button type="submit" disabled={loading} className="ml-auto bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50">
                  Registrar
                </button>
              </div>
            </form>

            {/* Lista de Pagamentos */}
            <div>
              <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase">Histórico</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {pagamentos.map(pag => (
                  <div key={pag.id} className="flex items-center justify-between p-4 bg-white border-2 border-slate-100 rounded-xl">
                    <div>
                      <div className="font-bold text-slate-800">{new Date(pag.data_sessao + 'T12:00:00').toLocaleDateString('pt-BR')}</div>
                      <div className="text-sm text-slate-500">R$ {pag.valor}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => togglePago(pag)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold border-2 transition-colors ${
                          pag.pago 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' 
                          : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {pag.pago ? 'PAGO' : 'PENDENTE'}
                      </button>
                      <button 
                        onClick={() => handleDeletePagamento(pag.id, pag.paciente_id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir Pagamento"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {pagamentos.length === 0 && (
                  <p className="text-slate-400 text-sm text-center py-4">Nenhum registro encontrado.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
