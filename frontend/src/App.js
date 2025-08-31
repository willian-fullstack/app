import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Textarea } from "./components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Badge } from "./components/ui/badge";
import { Separator } from "./components/ui/separator";
import { Alert, AlertDescription } from "./components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Calendar } from "./components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { Loader2, Heart, Shield, Coins, Sparkles, MessageCircle, Calendar as CalendarIcon, Lock, Eye, Video, Clock, Edit3, Users, CreditCard, FileText, Plus } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Home Component - Service Selection
const Home = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API}/services`);
      setServices(Object.entries(response.data.services));
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
      setLoading(false);
    }
  };

  const handleSelectService = (serviceKey) => {
    navigate(`/payment/${serviceKey}`);
  };

  const getServiceIcon = (serviceKey) => {
    const icons = {
      amor: <Heart className="w-8 h-8" />,
      protecao: <Shield className="w-8 h-8" />,
      prosperidade: <Coins className="w-8 h-8" />,
      limpeza: <Sparkles className="w-8 h-8" />
    };
    return icons[serviceKey] || <Sparkles className="w-8 h-8" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1489568685157-ec3bcd451894?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwyfHxteXN0aWNhbCUyMHNwaXJpdHVhbHxlbnwwfHx8fDE3NTY2NjM3NDN8MA&ixlib=rb-4.1.0&q=85')"
          }}
        ></div>
        
        <div className="relative container mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">
            Serviços
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600">
              Místicos
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-purple-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transforme sua vida através da energia espiritual. Rituais personalizados para amor, proteção, prosperidade e limpeza energética.
          </p>
          <div className="flex justify-center items-center gap-4 text-purple-200">
            <Calendar className="w-5 h-5" />
            <span>Resultados em 1-14 dias</span>
            <Separator orientation="vertical" className="h-6 bg-purple-400" />
            <MessageCircle className="w-5 h-5" />
            <span>Acompanhamento pelo WhatsApp</span>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Escolha Seu Ritual</h2>
          <p className="text-xl text-purple-200">Cada ritual é personalizado especialmente para você</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          {services.map(([serviceKey, service]) => (
            <Card 
              key={serviceKey} 
              className="group bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden"
              onClick={() => handleSelectService(serviceKey)}
            >
              <div className="relative">
                <img 
                  src={service.image} 
                  alt={service.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute top-4 left-4 text-amber-400">
                  {getServiceIcon(serviceKey)}
                </div>
              </div>
              
              <CardHeader className="text-white pb-2">
                <CardTitle className="text-xl mb-2">{service.name}</CardTitle>
                <CardDescription className="text-purple-200 text-sm leading-relaxed">
                  {service.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="text-white pt-0">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-2xl font-bold text-amber-400">
                    R$ {service.price.toFixed(2)}
                  </div>
                  <Badge variant="secondary" className="bg-purple-600/80 text-white">
                    {service.duration}
                  </Badge>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-3 rounded-full transition-all duration-300 transform hover:scale-105"
                >
                  Escolher Ritual
                </Button>
              </CardContent>
            </Card>
          ))}
          
          {/* Consulta Espiritual Card */}
          <Card 
            className="group bg-gradient-to-br from-green-600/20 to-blue-600/20 backdrop-blur-md border-green-400/30 hover:border-green-400/50 transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden"
            onClick={() => navigate('/consulta')}
          >
            <div className="relative p-6">
              <div className="text-green-400 mb-4">
                <CalendarIcon className="w-8 h-8" />
              </div>
              
              <CardHeader className="text-white pb-2 p-0">
                <CardTitle className="text-xl mb-2">Consulta Espiritual</CardTitle>
                <CardDescription className="text-green-200 text-sm leading-relaxed">
                  Orientação personalizada de 20 minutos
                </CardDescription>
              </CardHeader>
              
              <CardContent className="text-white pt-4 p-0">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-2xl font-bold text-green-400">
                    R$ 50,00
                  </div>
                  <Badge variant="secondary" className="bg-green-600/80 text-white">
                    20 min
                  </Badge>
                </div>
                
                <div className="text-sm text-green-200 mb-4">
                  14h00 às 22h00
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-3 rounded-full transition-all duration-300 transform hover:scale-105"
                >
                  Agendar Consulta
                </Button>
              </CardContent>
            </div>
          </Card>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-black/30 py-16">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold text-white mb-8">Por que escolher nossos rituais?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-white">
              <Shield className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">100% Seguro</h4>
              <p className="text-purple-200">Pagamentos protegidos e dados criptografados</p>
            </div>
            <div className="text-white">
              <Heart className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">Rituais Personalizados</h4>
              <p className="text-purple-200">Cada ritual é único e feito especialmente para você</p>
            </div>
            <div className="text-white">
              <MessageCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">Acompanhamento Completo</h4>
              <p className="text-purple-200">Suporte direto pelo WhatsApp durante todo o processo</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

// Payment Component
const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const serviceKey = location.pathname.split('/')[2];

  useEffect(() => {
    fetchServiceDetails();
  }, [serviceKey]);

  const fetchServiceDetails = async () => {
    try {
      const response = await axios.get(`${API}/services`);
      const serviceData = response.data.services[serviceKey];
      if (serviceData) {
        setService({ key: serviceKey, ...serviceData });
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error("Erro ao carregar serviço:", error);
      navigate('/');
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setError("");
    
    try {
      const originUrl = window.location.origin;
      const response = await axios.post(`${API}/checkout/session`, {
        service_type: serviceKey,
        origin_url: originUrl
      });
      
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      setError("Erro ao processar pagamento. Tente novamente.");
      setLoading(false);
    }
  };

  if (!service) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-12">
      <div className="container mx-auto px-6 max-w-2xl">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="text-center">
            <img 
              src={service.image} 
              alt={service.name}
              className="w-32 h-32 object-cover rounded-full mx-auto mb-4"
            />
            <CardTitle className="text-2xl text-white">{service.name}</CardTitle>
            <CardDescription className="text-purple-200 text-lg">
              {service.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-white">
            <div className="text-center mb-8">
              <div className="text-4xl font-bold text-amber-400 mb-2">
                R$ {service.price.toFixed(2)}
              </div>
              <Badge className="bg-purple-600 text-white">
                Duração: {service.duration}
              </Badge>
            </div>

            {error && (
              <Alert className="mb-6 bg-red-500/20 border-red-500/50">
                <AlertDescription className="text-red-200">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-purple-200">
                <Shield className="w-5 h-5 text-green-400" />
                <span>Pagamento 100% seguro via Stripe</span>
              </div>
              <div className="flex items-center gap-3 text-purple-200">
                <Coins className="w-5 h-5 text-green-400" />
                <span>Aceita cartão de crédito e Pix</span>
              </div>
              <div className="flex items-center gap-3 text-purple-200">
                <Heart className="w-5 h-5 text-green-400" />
                <span>Ritual personalizado após pagamento</span>
              </div>
            </div>

            <Button 
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-4 rounded-full text-lg transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                "Finalizar Pagamento"
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="w-full mt-4 text-purple-200 hover:text-white"
            >
              Voltar aos Serviços
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Success Component - Payment Confirmation and Form
const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState("checking");
  const [sessionId, setSessionId] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [formData, setFormData] = useState({
    nome_completo: "",
    data_nascimento: "",
    telefone: "",
    nome_pessoa_amada: "",
    situacao_atual: "",
    observacoes: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const session_id = params.get('session_id');
    if (session_id) {
      setSessionId(session_id);
      checkPaymentStatus(session_id);
    } else {
      navigate('/');
    }
  }, [location, navigate]);

  const checkPaymentStatus = async (session_id, attempts = 0) => {
    const maxAttempts = 10;
    
    if (attempts >= maxAttempts) {
      setPaymentStatus("timeout");
      return;
    }

    try {
      const response = await axios.get(`${API}/checkout/status/${session_id}`);
      
      if (response.data.payment_status === 'paid') {
        setPaymentStatus("completed");
        setServiceType(response.data.metadata?.service_type || "");
      } else if (response.data.status === 'expired') {
        setPaymentStatus("expired");
      } else {
        // Continue polling
        setTimeout(() => checkPaymentStatus(session_id, attempts + 1), 2000);
      }
    } catch (error) {
      console.error("Erro ao verificar status:", error);
      setPaymentStatus("error");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await axios.post(`${API}/client-form`, {
        ...formData,
        payment_session_id: sessionId,
        service_type: serviceType
      });
      
      navigate('/complete');
    } catch (error) {
      setError("Erro ao enviar formulário. Tente novamente.");
      setSubmitting(false);
    }
  };

  if (paymentStatus === "checking") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Verificando Pagamento</h2>
          <p className="text-purple-200">Aguarde enquanto confirmamos seu pagamento...</p>
        </Card>
      </div>
    );
  }

  if (paymentStatus === "expired" || paymentStatus === "error" || paymentStatus === "timeout") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8 text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Pagamento não confirmado</h2>
          <p className="text-purple-200 mb-6">Houve um problema com seu pagamento. Tente novamente.</p>
          <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-amber-500 to-orange-600">
            Voltar ao Início
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-12">
      <div className="container mx-auto px-6 max-w-2xl">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">Pagamento Confirmado!</CardTitle>
            <CardDescription className="text-purple-200">
              Agora precisamos de algumas informações para personalizar seu ritual
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert className="mb-6 bg-red-500/20 border-red-500/50">
                <AlertDescription className="text-red-200">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-6">
              <div>
                <Label htmlFor="nome_completo" className="text-white">Nome Completo *</Label>
                <Input 
                  id="nome_completo"
                  value={formData.nome_completo}
                  onChange={(e) => handleInputChange('nome_completo', e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <Label htmlFor="data_nascimento" className="text-white">Data de Nascimento *</Label>
                <Input 
                  id="data_nascimento"
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div>
                <Label htmlFor="telefone" className="text-white">WhatsApp *</Label>
                <Input 
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                  placeholder="(11) 99999-9999"
                />
              </div>

              {serviceType === "amor" && (
                <div>
                  <Label htmlFor="nome_pessoa_amada" className="text-white">Nome da Pessoa Amada</Label>
                  <Input 
                    id="nome_pessoa_amada"
                    value={formData.nome_pessoa_amada}
                    onChange={(e) => handleInputChange('nome_pessoa_amada', e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                    placeholder="Nome da pessoa que deseja atrair ou reconquistar"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="situacao_atual" className="text-white">Situação Atual *</Label>
                <Textarea 
                  id="situacao_atual"
                  value={formData.situacao_atual}
                  onChange={(e) => handleInputChange('situacao_atual', e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 min-h-[100px]"
                  placeholder="Descreva sua situação atual e o que deseja alcançar com o ritual"
                />
              </div>

              <div>
                <Label htmlFor="observacoes" className="text-white">Observações Especiais</Label>
                <Textarea 
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 min-h-[80px]"
                  placeholder="Informações adicionais que considera importantes"
                />
              </div>

              <Button 
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-4 text-lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  "Enviar Informações"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Consulta Component - Agendamento de Consultas
const Consulta = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome_completo: "",
    telefone: "",
    observacoes: ""
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await axios.get(`${API}/horarios-disponiveis/${dateStr}`);
      setAvailableSlots(response.data.horarios_disponiveis);
    } catch (error) {
      console.error("Erro ao buscar horários:", error);
    }
  };

  const handleAgendamento = async (e) => {
    e.preventDefault();
    if (!selectedTime || !formData.nome_completo || !formData.telefone) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await axios.post(`${API}/consulta/agendar`, {
        ...formData,
        data_consulta: dateStr,
        horario: selectedTime
      });

      // Redirect to WhatsApp for confirmation
      window.location.href = response.data.whatsapp_link;
    } catch (error) {
      setError("Erro ao agendar consulta. Tente novamente.");
      setLoading(false);
    }
  };

  const isDateDisabled = (date) => {
    const today = new Date();
    return date < today.setHours(0,0,0,0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">Agendar Consulta Espiritual</CardTitle>
            <CardDescription className="text-purple-200">
              Orientação personalizada de 20 minutos • R$ 50,00
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-white">
            {error && (
              <Alert className="mb-6 bg-red-500/20 border-red-500/50">
                <AlertDescription className="text-red-200">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleAgendamento} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Calendar Section */}
                <div>
                  <Label className="text-white text-lg mb-4 block">Escolha a Data</Label>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={isDateDisabled}
                      className="rounded-md"
                    />
                  </div>
                </div>

                {/* Time Slots Section */}
                <div>
                  <Label className="text-white text-lg mb-4 block">Horários Disponíveis</Label>
                  <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot}
                        type="button"
                        variant={selectedTime === slot ? "default" : "outline"}
                        className={`${
                          selectedTime === slot 
                            ? "bg-green-600 text-white" 
                            : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                        }`}
                        onClick={() => setSelectedTime(slot)}
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                  {availableSlots.length === 0 && selectedDate && (
                    <p className="text-purple-200 text-center py-4">
                      Nenhum horário disponível para esta data
                    </p>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="nome_completo" className="text-white">Nome Completo *</Label>
                  <Input 
                    id="nome_completo"
                    value={formData.nome_completo}
                    onChange={(e) => setFormData({...formData, nome_completo: e.target.value})}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <Label htmlFor="telefone" className="text-white">WhatsApp *</Label>
                  <Input 
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes" className="text-white">Observações</Label>
                <Textarea 
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 min-h-[80px]"
                  placeholder="Descreva brevemente o que gostaria de consultar"
                />
              </div>

              {selectedTime && (
                <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                  <h4 className="text-green-400 font-semibold mb-2">Resumo do Agendamento:</h4>
                  <p className="text-white">Data: {selectedDate?.toLocaleDateString('pt-BR')}</p>
                  <p className="text-white">Horário: {selectedTime}</p>
                  <p className="text-white">Duração: 20 minutos</p>
                  <p className="text-white">Valor: R$ 50,00</p>
                </div>
              )}

              <div className="flex gap-4">
                <Button 
                  type="submit"
                  disabled={loading || !selectedTime}
                  className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-4 text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Agendando...
                    </>
                  ) : (
                    "Confirmar Agendamento"
                  )}
                </Button>
                
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => navigate('/')}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Voltar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Complete Component
const Complete = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
      <div className="container mx-auto px-6 max-w-2xl text-center">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 p-12">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">Ritual Iniciado!</h1>
          <p className="text-xl text-purple-200 mb-8 leading-relaxed">
            Suas informações foram recebidas com sucesso. Seu ritual personalizado será iniciado em breve.
          </p>
          
          <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-amber-400 mb-2">Próximos Passos:</h3>
            <ul className="text-purple-200 text-left space-y-2">
              <li>• Entraremos em contato pelo WhatsApp em até 2 horas</li>
              <li>• Você receberá informações sobre o andamento do ritual</li>
              <li>• Links exclusivos serão enviados quando apropriado</li>
              <li>• Acompanhamento completo durante todo o processo</li>
            </ul>
          </div>

          <Button 
            onClick={() => window.location.href = `https://wa.me/5511999999999?text=Olá! Acabei de contratar um ritual e gostaria de saber mais detalhes.`}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-full mr-4"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Falar no WhatsApp
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Voltar ao Início
          </Button>
        </Card>
      </div>
    </div>
  );
};

// Admin Component - Enhanced with Video Links, Scheduling, and Flyers
const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [clients, setClients] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [flyers, setFlyers] = useState([]);
  const [rituais, setRituais] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("clients");
  const [selectedClient, setSelectedClient] = useState(null);
  const [videoData, setVideoData] = useState({ video_url: "", title: "", description: "" });
  const [flyerData, setFlyerData] = useState({ titulo: "", subtitulo: "", imagem_url: "", descricao: "" });
  const [ritualData, setRitualData] = useState({ 
    name: "", 
    description: "", 
    price: "", 
    duration: "", 
    image: "", 
    category: "",
    active: true 
  });
  const [editingRitual, setEditingRitual] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post(`${API}/admin/login`, { password });
      setIsAuthenticated(true);
      fetchAdminData();
    } catch (error) {
      setError("Senha incorreta");
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const [clientsRes, transactionsRes, consultasRes, flyersRes, rituaisRes] = await Promise.all([
        axios.get(`${API}/admin/clients`, { 
          headers: { Authorization: 'Bearer admin_authenticated' } 
        }),
        axios.get(`${API}/admin/transactions`, { 
          headers: { Authorization: 'Bearer admin_authenticated' } 
        }),
        axios.get(`${API}/admin/consultas`, { 
          headers: { Authorization: 'Bearer admin_authenticated' } 
        }),
        axios.get(`${API}/admin/flyers`, { 
          headers: { Authorization: 'Bearer admin_authenticated' } 
        }),
        axios.get(`${API}/admin/rituais`, { 
          headers: { Authorization: 'Bearer admin_authenticated' } 
        })
      ]);
      
      setClients(clientsRes.data.clients);
      setTransactions(transactionsRes.data.transactions);
      setConsultas(consultasRes.data.consultas || []);
      setFlyers(flyersRes.data.flyers || []);
      setRituais(rituaisRes.data.rituais || []);
      setLoading(false);
    } catch (error) {
      setError("Erro ao carregar dados");
      setLoading(false);
    }
  };

  const openWhatsApp = (client) => {
    const message = `Olá ${client.nome_completo}! Seu ritual foi iniciado. Em breve enviaremos mais informações.`;
    const phone = client.telefone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`);
  };

  const sendVideoLink = async (clientId) => {
    if (!videoData.video_url || !videoData.title) {
      setError("Preencha URL e título do vídeo");
      return;
    }

    try {
      await axios.post(`${API}/admin/send-video`, {
        client_id: clientId,
        ...videoData
      }, {
        headers: { Authorization: 'Bearer admin_authenticated' }
      });
      
      setVideoData({ video_url: "", title: "", description: "" });
      setSelectedClient(null);
      fetchAdminData();
      alert("Link do vídeo enviado com sucesso!");
    } catch (error) {
      setError("Erro ao enviar link do vídeo");
    }
  };

  const updateClientStatus = async (clientId, status) => {
    try {
      await axios.put(`${API}/admin/client-status/${clientId}?status=${status}`, {}, {
        headers: { Authorization: 'Bearer admin_authenticated' }
      });
      fetchAdminData();
    } catch (error) {
      setError("Erro ao atualizar status");
    }
  };

  const updateConsultaStatus = async (consultaId, status) => {
    try {
      await axios.put(`${API}/admin/consulta/${consultaId}/status?status=${status}`, {}, {
        headers: { Authorization: 'Bearer admin_authenticated' }
      });
      fetchAdminData();
    } catch (error) {
      setError("Erro ao atualizar consulta");
    }
  };

  const createFlyer = async (e) => {
    e.preventDefault();
    if (!flyerData.titulo || !flyerData.descricao) {
      setError("Preencha título e descrição do flyer");
      return;
    }

    try {
      await axios.post(`${API}/admin/flyer`, flyerData, {
        headers: { Authorization: 'Bearer admin_authenticated' }
      });
      
      setFlyerData({ titulo: "", subtitulo: "", imagem_url: "", descricao: "" });
      fetchAdminData();
      alert("Flyer criado com sucesso!");
    } catch (error) {
      setError("Erro ao criar flyer");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <CardTitle className="text-white">Acesso Administrativo</CardTitle>
            <CardDescription className="text-gray-400">Painel Secreto</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 bg-red-900 border-red-700">
                <AlertDescription className="text-red-200">{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <Label htmlFor="password" className="text-gray-300">Senha</Label>
                <Input 
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Painel Administrativo</h1>
          <Button 
            variant="outline" 
            onClick={() => setIsAuthenticated(false)}
            className="border-gray-600 text-gray-300"
          >
            Sair
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800">
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Clientes ({clients.length})
            </TabsTrigger>
            <TabsTrigger value="consultas" className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Consultas ({consultas.length})
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Transações
            </TabsTrigger>
            <TabsTrigger value="flyers" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Flyers
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Config
            </TabsTrigger>
          </TabsList>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <div className="grid gap-6">
              {clients.map((client) => (
                <Card key={client.id} className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white">{client.nome_completo}</CardTitle>
                        <CardDescription className="text-gray-400">
                          {client.payment_info?.service_name} - R$ {client.payment_info?.amount}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Badge 
                          variant={client.status === 'concluido' ? 'default' : 
                                   client.status === 'em_andamento' ? 'secondary' : 'outline'}
                          className={client.status === 'concluido' ? 'bg-green-600' : 
                                     client.status === 'em_andamento' ? 'bg-yellow-600' : 'bg-gray-600'}
                        >
                          {client.status || 'pendente'}
                        </Badge>
                        <Button 
                          size="sm"
                          onClick={() => openWhatsApp(client)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          WhatsApp
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                              <Video className="w-4 h-4 mr-1" />
                              Enviar Vídeo
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-gray-800 border-gray-700">
                            <DialogHeader>
                              <DialogTitle className="text-white">Enviar Link do Vídeo</DialogTitle>
                              <DialogDescription className="text-gray-400">
                                Para: {client.nome_completo}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label className="text-white">URL do Vídeo *</Label>
                                <Input 
                                  value={videoData.video_url}
                                  onChange={(e) => setVideoData({...videoData, video_url: e.target.value})}
                                  placeholder="https://drive.google.com/..."
                                  className="bg-gray-700 text-white"
                                />
                              </div>
                              <div>
                                <Label className="text-white">Título *</Label>
                                <Input 
                                  value={videoData.title}
                                  onChange={(e) => setVideoData({...videoData, title: e.target.value})}
                                  placeholder="Ritual de Amor - Etapa 1"
                                  className="bg-gray-700 text-white"
                                />
                              </div>
                              <div>
                                <Label className="text-white">Descrição</Label>
                                <Textarea 
                                  value={videoData.description}
                                  onChange={(e) => setVideoData({...videoData, description: e.target.value})}
                                  placeholder="Descrição opcional..."
                                  className="bg-gray-700 text-white"
                                />
                              </div>
                              <Button 
                                onClick={() => sendVideoLink(client.id)}
                                className="w-full bg-purple-600 hover:bg-purple-700"
                              >
                                Enviar Link
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="text-gray-300 space-y-3">
                    <div><strong>Telefone:</strong> {client.telefone}</div>
                    <div><strong>Data Nascimento:</strong> {client.data_nascimento}</div>
                    {client.nome_pessoa_amada && (
                      <div><strong>Pessoa Amada:</strong> {client.nome_pessoa_amada}</div>
                    )}
                    <div><strong>Situação:</strong> {client.situacao_atual}</div>
                    {client.observacoes && (
                      <div><strong>Observações:</strong> {client.observacoes}</div>
                    )}
                    
                    {/* Status Update Buttons */}
                    <div className="flex gap-2 pt-4 border-t border-gray-600">
                      <Button 
                        size="sm"
                        variant={client.status === 'pendente' ? 'default' : 'outline'}
                        onClick={() => updateClientStatus(client.id, 'pendente')}
                        className="text-xs"
                      >
                        Pendente
                      </Button>
                      <Button 
                        size="sm"
                        variant={client.status === 'em_andamento' ? 'default' : 'outline'}
                        onClick={() => updateClientStatus(client.id, 'em_andamento')}
                        className="text-xs"
                      >
                        Em Andamento
                      </Button>
                      <Button 
                        size="sm"
                        variant={client.status === 'concluido' ? 'default' : 'outline'}
                        onClick={() => updateClientStatus(client.id, 'concluido')}
                        className="text-xs"
                      >
                        Concluído
                      </Button>
                    </div>

                    {client.video_links && client.video_links.length > 0 && (
                      <div className="mt-4 p-3 bg-gray-700 rounded">
                        <h5 className="text-white font-semibold mb-2">Vídeos Enviados:</h5>
                        {client.video_links.map((link, index) => (
                          <div key={index} className="text-sm text-gray-300">
                            • {link.title}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-500">
                      Criado em: {new Date(client.created_at).toLocaleString('pt-BR')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Consultas Tab */}
          <TabsContent value="consultas" className="space-y-6">
            <div className="grid gap-4">
              {consultas.map((consulta) => (
                <Card key={consulta.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-white font-semibold">{consulta.nome_completo}</div>
                        <div className="text-gray-400">
                          {consulta.data_consulta} às {consulta.horario}
                        </div>
                        <div className="text-gray-400">Telefone: {consulta.telefone}</div>
                        {consulta.observacoes && (
                          <div className="text-gray-400 text-sm mt-2">
                            Obs: {consulta.observacoes}
                          </div>
                        )}
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-white font-bold">R$ {consulta.valor?.toFixed(2)}</div>
                        <div className="flex gap-1 flex-wrap">
                          <Button 
                            size="sm"
                            variant={consulta.status === 'confirmado' ? 'default' : 'outline'}
                            onClick={() => updateConsultaStatus(consulta.id, 'confirmado')}
                            className="text-xs"
                          >
                            Confirmar
                          </Button>
                          <Button 
                            size="sm"
                            variant={consulta.status === 'realizado' ? 'default' : 'outline'}
                            onClick={() => updateConsultaStatus(consulta.id, 'realizado')}
                            className="text-xs"
                          >
                            Realizado
                          </Button>
                        </div>
                        <Badge 
                          variant={consulta.status === 'realizado' ? 'default' : 
                                   consulta.status === 'confirmado' ? 'secondary' : 'outline'}
                          className={consulta.status === 'realizado' ? 'bg-green-600' : 
                                     consulta.status === 'confirmado' ? 'bg-blue-600' : 'bg-gray-600'}
                        >
                          {consulta.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            <div className="grid gap-4">
              {transactions.map((transaction) => (
                <Card key={transaction.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-white font-semibold">
                          {transaction.metadata?.service_name}
                        </div>
                        <div className="text-gray-400 text-sm">
                          ID: {transaction.session_id}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {new Date(transaction.created_at).toLocaleString('pt-BR')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">
                          R$ {transaction.amount.toFixed(2)}
                        </div>
                        <Badge 
                          variant={transaction.payment_status === 'completed' ? 'default' : 'secondary'}
                          className={transaction.payment_status === 'completed' ? 'bg-green-600' : 'bg-yellow-600'}
                        >
                          {transaction.payment_status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Flyers Tab */}
          <TabsContent value="flyers" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Criar Novo Flyer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={createFlyer} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Título *</Label>
                      <Input 
                        value={flyerData.titulo}
                        onChange={(e) => setFlyerData({...flyerData, titulo: e.target.value})}
                        placeholder="Promoção Especial"
                        className="bg-gray-700 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-white">Subtítulo</Label>
                      <Input 
                        value={flyerData.subtitulo}
                        onChange={(e) => setFlyerData({...flyerData, subtitulo: e.target.value})}
                        placeholder="Esta semana apenas"
                        className="bg-gray-700 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-white">URL da Imagem</Label>
                    <Input 
                      value={flyerData.imagem_url}
                      onChange={(e) => setFlyerData({...flyerData, imagem_url: e.target.value})}
                      placeholder="https://..."
                      className="bg-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Descrição *</Label>
                    <Textarea 
                      value={flyerData.descricao}
                      onChange={(e) => setFlyerData({...flyerData, descricao: e.target.value})}
                      placeholder="Descrição da promoção..."
                      className="bg-gray-700 text-white min-h-[100px]"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                    Criar Flyer
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Existing Flyers */}
            <div className="grid gap-4">
              {flyers.map((flyer) => (
                <Card key={flyer.id} className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white">{flyer.titulo}</CardTitle>
                        {flyer.subtitulo && (
                          <CardDescription className="text-gray-400">{flyer.subtitulo}</CardDescription>
                        )}
                      </div>
                      <Badge variant={flyer.ativo ? 'default' : 'secondary'}>
                        {flyer.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-gray-300">
                    {flyer.imagem_url && (
                      <img src={flyer.imagem_url} alt={flyer.titulo} className="w-full h-40 object-cover rounded mb-4" />
                    )}
                    <p>{flyer.descricao}</p>
                    <div className="text-sm text-gray-500 mt-4">
                      Criado em: {new Date(flyer.created_at).toLocaleString('pt-BR')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Configurações do Sistema</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <div>
                  <h4 className="text-white font-semibold mb-2">URL do Painel Admin:</h4>
                  <code className="bg-gray-700 px-3 py-1 rounded text-green-400">
                    {window.location.origin}/admin-secreto-2024
                  </code>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Estatísticas:</h4>
                  <ul className="space-y-1">
                    <li>• Total de Clientes: {clients.length}</li>
                    <li>• Consultas Agendadas: {consultas.length}</li>
                    <li>• Transações: {transactions.length}</li>
                    <li>• Flyers Criados: {flyers.length}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/payment/:service" element={<Payment />} />
          <Route path="/consulta" element={<Consulta />} />
          <Route path="/success" element={<Success />} />
          <Route path="/complete" element={<Complete />} />
          <Route path="/cancel" element={<Home />} />
          <Route path="/admin-secreto-2024" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;