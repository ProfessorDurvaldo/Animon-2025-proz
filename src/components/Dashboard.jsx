import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { showError, showToast, showWarning, showSuccess } from '../utils/sweetAlert';
import ProfileCompletion from './ProfileCompletion';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser, userProfile, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [referrals, setReferrals] = useState([]);
  const [newReferral, setNewReferral] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [loadingReferrals, setLoadingReferrals] = useState(true);
  const [hasWon, setHasWon] = useState(false);
  const [winnerInfo, setWinnerInfo] = useState(null);

  useEffect(() => {
    document.title = 'Dashboard - Sorteio ANIMON 2025 | Proz';
  }, []);

  const checkWinnerStatus = async () => {
    if (!currentUser) return;
    
    try {
      const drawsQuery = query(
        collection(db, 'draws'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(drawsQuery);
      let foundWin = false;
      let winInfo = null;
      
      snapshot.docs.forEach(doc => {
        const drawData = doc.data();
        if (drawData.winners) {
          const winner = drawData.winners.find(w => w.userId === currentUser.uid);
          if (winner && !foundWin) {
            foundWin = true;
            winInfo = {
              drawId: doc.id,
              position: winner.drawPosition,
              drawDate: drawData.createdAt?.toDate()
            };
          }
        }
      });
      
      if (foundWin && !hasWon) {
        setHasWon(true);
        setWinnerInfo(winInfo);
        // Mostrar alerta de vitória
        showSuccess(
          '🎉 PARABÉNS! VOCÊ GANHOU!',
          `Você foi sorteado na posição #${winInfo.position}!\n\nVenha até a escola Proz para retirar seu ingresso gratuito para o ANIMON 2025!\n\n📍 Compareça o quanto antes com um documento de identidade.`
        );
      }
    } catch (error) {
      console.error('Erro ao verificar status de ganhador:', error);
    }
  };

  const loadReferrals = async () => {
    if (!currentUser) return;
    
    try {
      const referralsQuery = query(
        collection(db, 'referrals'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(referralsQuery);
      const referralsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setReferrals(referralsList);
    } catch (error) {
      console.error('Erro ao carregar indicações:', error);
    } finally {
      setLoadingReferrals(false);
    }
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    if (!phoneRegex.test(phone)) return false;
    
    // Extrair apenas os números do telefone
    const numbers = phone.replace(/\D/g, '');
    
    // Verificar se não são todos números iguais
    const firstDigit = numbers[0];
    const allSameDigits = numbers.split('').every(digit => digit === firstDigit);
    if (allSameDigits) return false;
    
    // Verificar padrões suspeitos comuns
    const suspiciousPatterns = [
      '00000000000',
      '11111111111',
      '22222222222',
      '33333333333',
      '44444444444',
      '55555555555',
      '66666666666',
      '77777777777',
      '88888888888',
      '99999999999',
      '12345678901',
      '01234567890'
    ];
    
    if (suspiciousPatterns.includes(numbers)) return false;
    
    // Verificar se tem pelo menos 10 dígitos únicos (DDD + número)
    if (numbers.length < 10) return false;
    
    return true;
  };

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4,5})(\d{4})/, '$1-$2');
    }
    return value;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setNewReferral(prev => ({ ...prev, phone: formatted }));
  };

  const addReferral = async (e) => {
    e.preventDefault();
    
    if (!newReferral.name.trim() || !newReferral.phone.trim()) {
      showWarning(
        'Campos obrigatórios!',
        'Por favor, preencha todos os campos para continuar.'
      );
      return;
    }

    if (!validatePhone(newReferral.phone)) {
      showWarning(
        'Telefone inválido!',
        'Por favor, insira um telefone válido no formato (XX) XXXXX-XXXX'
      );
      return;
    }

    try {
      setLoading(true);
      
      await addDoc(collection(db, 'referrals'), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: userProfile?.fullName || currentUser.displayName,
        friendName: newReferral.name.trim(),
        friendPhone: newReferral.phone,
        isValid: true,
        createdAt: serverTimestamp()
      });

      setNewReferral({ name: '', phone: '' });
      await loadReferrals();
      
      showToast('🎉 Amigo adicionado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao adicionar indicação:', error);
      showError(
        'Erro na indicação',
        'Não foi possível adicionar a indicação. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && userProfile) {
      loadReferrals();
      checkWinnerStatus();
    }
  }, [currentUser, userProfile]);

  // Função para verificar se o perfil está completo
  const isProfileComplete = (profile) => {
    if (!profile) return false;
    return profile.fullName && 
           profile.phone && 
           profile.teacher && 
           profile.turno && 
           profile.curso;
  };

  if (!isProfileComplete(userProfile)) {
    return <ProfileCompletion />;
  }

  const validReferrals = referrals.filter(ref => ref.isValid);
  const invalidReferrals = referrals.filter(ref => !ref.isValid);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-info">
            <h1>🎌 Dashboard - Sorteio ANIMON 2025</h1>
          </div>
          <div className="user-section">
            <div className="user-details">
              <span className="welcome-text">Olá, {userProfile.fullName}!</span>
              <span className="user-email">{currentUser.email}</span>
              {userProfile.teacher && (
                <span className="user-teacher">Professor: {userProfile.teacher}</span>
              )}
              {userProfile.turno && (
                <span className="user-turno">Turno: {userProfile.turno}</span>
              )}
              {userProfile.curso && (
                <span className="user-curso">Curso: {userProfile.curso}</span>
              )}
            </div>
            <div className="header-actions">
              {isAdmin && (
                <button 
                  onClick={() => navigate('/admin')} 
                  className="admin-btn"
                  title="Acessar Painel Administrativo"
                >
                  🛡️ Painel Admin
                </button>
              )}
              <button 
                onClick={logout} 
                className="logout-btn"
                title="Fazer logout"
              >
                🚪 Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{validReferrals.length}</div>
              <div className="stat-label">Indicações Válidas</div>
              <div className="stat-sublabel">= Chances no sorteio</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{invalidReferrals.length}</div>
              <div className="stat-label">Números Inválidos</div>
              <div className="stat-sublabel">Não contam no sorteio</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{referrals.length}</div>
              <div className="stat-label">Total de Indicações</div>
              <div className="stat-sublabel">Todos os cadastros</div>
            </div>
          </div>

          <div className="add-referral-section">
            <h2>➕ Indicar Novo Amigo</h2>
            <form onSubmit={addReferral} className="referral-form">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Nome completo do amigo"
                  value={newReferral.name}
                  onChange={(e) => setNewReferral(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="tel"
                  placeholder="Telefone (XX) XXXXX-XXXX"
                  value={newReferral.phone}
                  onChange={handlePhoneChange}
                  required
                  className="form-input"
                  maxLength="15"
                />
              </div>
              <button type="submit" disabled={loading} className="add-btn">
                {loading ? '⏳ Adicionando...' : '🚀 Adicionar Amigo'}
              </button>
            </form>
          </div>

          <div className="referrals-section">
            <h2>📋 Suas Indicações</h2>
            
            {loadingReferrals ? (
              <div className="loading">Carregando indicações...</div>
            ) : referrals.length === 0 ? (
              <div className="no-referrals">
                <p>Você ainda não fez nenhuma indicação.</p>
                <p>Comece agora e aumente suas chances de ganhar!</p>
              </div>
            ) : (
              <div className="referrals-grid">
                {validReferrals.length > 0 && (
                  <div className="referrals-group">
                    <h3 className="group-title valid">✅ Indicações Válidas ({validReferrals.length})</h3>
                    <div className="referrals-list">
                      {validReferrals.map(referral => (
                        <div key={referral.id} className="referral-card valid">
                          <div className="referral-info">
                            <h4>{referral.friendName}</h4>
                            <p>{referral.friendPhone}</p>
                            <small>
                              Adicionado em {referral.createdAt?.toDate().toLocaleDateString('pt-BR')}
                            </small>
                          </div>
                          <div className="referral-status">
                            <span className="status-badge valid">✅ Válido</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {invalidReferrals.length > 0 && (
                  <div className="referrals-group">
                    <h3 className="group-title invalid">❌ Números Inválidos ({invalidReferrals.length})</h3>
                    <div className="referrals-list">
                      {invalidReferrals.map(referral => (
                        <div key={referral.id} className="referral-card invalid">
                          <div className="referral-info">
                            <h4>{referral.friendName}</h4>
                            <p>{referral.friendPhone}</p>
                            <small>
                              Adicionado em {referral.createdAt?.toDate().toLocaleDateString('pt-BR')}
                            </small>
                          </div>
                          <div className="referral-status">
                            <span className="status-badge invalid">❌ Inválido</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="tips-section">
            <h3>💡 Dicas para Aumentar suas Chances</h3>
            <ul>
              <li>Indique amigos que realmente têm interesse em estudar na Proz</li>
              <li>Verifique se o telefone está correto antes de adicionar</li>
              <li>Números inválidos serão marcados pela administração</li>
              <li>Quanto mais indicações válidas, maiores suas chances!</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;