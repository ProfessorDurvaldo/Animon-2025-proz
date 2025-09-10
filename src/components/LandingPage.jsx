import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import logoProz from '../assets/logo_proz.png';

const LandingPage = () => {
  const { signInWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'ANIMON 2025 - Sorteio de Ingressos Gratuitos | Proz';
  }, []);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro no login:', error);
      alert('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (currentUser) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="landing-page">
      <header className="hero-section">
        <div className="hero-background">
          <div className="anime-particles"></div>
        </div>
        <nav className="navbar">
          <img src={logoProz} alt="Proz" className="logo" />
          <button 
            onClick={handleLogin} 
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar com Google'}
          </button>
        </nav>
        
        <div className="hero-content">
          <h1 className="hero-title">
            🎌 SORTEIO ÉPICO ANIMON 2025! 🎌
          </h1>
          <p className="hero-subtitle">
            Quer curtir o MAIOR evento de anime de Montes Claros com ingressos DE GRAÇA?
          </p>
          <div className="prize-highlight">
            <span className="prize-number">16</span>
            <span className="prize-text">INGRESSOS GRATUITOS</span>
          </div>
        </div>
      </header>

      <section className="how-to-participate">
        <div className="container">
          <h2>🚀 Como Participar?</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Faça Login</h3>
              <p>Entre com sua conta Google</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Complete seu Perfil</h3>
              <p>Adicione telefone, professor e nome completo</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Indique Amigos</h3>
              <p>Quanto mais amigos indicar para estudar na Proz, maiores suas chances!</p>
            </div>
          </div>
        </div>
      </section>

      <section className="event-info">
        <div className="container">
          <h2>🎪 ANIMON 2025 - O MAIOR FESTIVAL GEEK DO NORTE DE MINAS</h2>
          <div className="event-details">
            <div className="event-date">
              <h3>📅 13 e 14 de setembro de 2025</h3>
              <p>Avenida Viriato Ribeiro Aquino – Montes Claros – MG</p>
            </div>
            <div className="event-highlights">
              <h3>⚡ Prepare-se para dois dias ÉPICOS!</h3>
              <ul>
                <li>🎵 Shows ao vivo com bandas incríveis</li>
                <li>🎭 Concurso de cosplay oficial</li>
                <li>🎤 8 dubladores famosos de animes</li>
                <li>🎮 Games e ativações</li>
                <li>🍜 Praça de alimentação temática</li>
                <li>🛍️ Mais de 50 expositores</li>
              </ul>
            </div>
          </div>

          <div className="attractions">
            <div className="attraction-category">
              <h4>🎤 Dubladores Confirmados</h4>
              <p>8 dubladores de animes famosos, incluindo:</p>
              <ul>
                <li>Frieren: Além da Jornada</li>
                <li>DanDaDan</li>
                <li>Painel especial "O Mundo da Dublagem"</li>
              </ul>
            </div>

            <div className="attraction-category">
              <h4>🎸 Bandas ao Vivo</h4>
              <ul>
                <li>Akatsuki Band (Naruto e mais)</li>
                <li>Sempai Old School (clássicos anime rock)</li>
                <li>Ghouls (cover Ghost)</li>
                <li>Impera Rock</li>
                <li>Whisper (cover Evanescence)</li>
                <li>Lost in Hollywood (cover System of a Down)</li>
                <li>Cover Mamonas Assassinas</li>
              </ul>
            </div>

            <div className="attraction-category">
              <h4>🗣️ Painéis Especiais</h4>
              <ul>
                <li>Painel Chapéus de Palha (One Piece)</li>
                <li>Painel Mundo Cosplay</li>
                <li>Painel Swordplay</li>
              </ul>
            </div>
          </div>

          <div className="event-cta">
            <h3>💰 INGRESSOS A PARTIR DE R$ 20</h3>
            <p>Apoio oficial da Prefeitura de Montes Claros</p>
            <p>Produção profissional da NEXA Productions</p>
          </div>
        </div>
      </section>

      <section className="rules">
        <div className="container">
          <h2>📜 Regras do Sorteio</h2>
          <ul>
            <li>Somente alunos da Proz podem participar</li>
            <li>É necessário completar o perfil com telefone válido</li>
            <li>Cada amigo indicado = 1 chance no sorteio</li>
            <li>Os números serão conferidos e validados</li>
            <li>16 ganhadores serão sorteados</li>
            <li>Números inválidos não contam para o sorteio</li>
          </ul>
        </div>
      </section>

      <footer className="cta-section">
        <div className="container">
          <h2>Pronto para participar?</h2>
          <button 
            onClick={handleLogin} 
            className="main-cta-btn"
            disabled={loading}
          >
            {loading ? '🔄 Carregando...' : '🚀 PARTICIPAR AGORA!'}
          </button>
          <p>Faça login com Google e comece a indicar seus amigos!</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;