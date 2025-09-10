import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { showError, showSuccess, showWarning } from '../utils/sweetAlert';
import './AdminDraw.css';

const AdminDraw = ({ users, referrals, onRefresh }) => {
  const [drawResults, setDrawResults] = useState([]);
  const [previousDraws, setPreviousDraws] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const loadDrawHistory = async () => {
    try {
      const drawsQuery = query(
        collection(db, 'draws'), 
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(drawsQuery);
      const drawsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPreviousDraws(drawsList);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const isUserAdmin = (email) => {
    return email === 'durvaldomarques@gmail.com' || 
           // Verificar se é admin na lista de admins (se houver acesso)
           false; // Por enquanto, apenas o admin principal
  };

  const createDrawPool = () => {
    const pool = [];
    
    // Filtrar usuários: excluir admins e inválidos
    const eligibleUsers = users.filter(user => 
      !isUserAdmin(user.email) && // Excluir administradores
      user.isValid !== false     // Excluir usuários inválidos
    );
    
    eligibleUsers.forEach(user => {
      const userValidReferrals = referrals.filter(
        ref => ref.userId === user.id && ref.isValid === true
      );
      
      // Adicionar uma entrada na pool para cada indicação válida
      userValidReferrals.forEach((referral, index) => {
        pool.push({
          userId: user.id,
          userEmail: user.email,
          userName: user.fullName || user.email,
          userPhone: user.phone,
          userTeacher: user.teacher,
          referralId: referral.id,
          referralName: referral.friendName,
          referralPhone: referral.friendPhone,
          ticketNumber: index + 1
        });
      });
    });
    
    return pool;
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const performDraw = async () => {
    try {
      setLoading(true);
      
      const pool = createDrawPool();
      
      if (pool.length < 16) {
        showWarning(
          'Indicações insuficientes!',
          `Não há indicações válidas suficientes. Total: ${pool.length}, Necessário: 16`
        );
        return;
      }
      
      // Embaralhar a pool
      const shuffledPool = shuffleArray(pool);
      
      // Selecionar 16 ganhadores únicos (sem repetir usuário)
      const winners = [];
      const selectedUserIds = new Set();
      
      for (const ticket of shuffledPool) {
        if (winners.length >= 16) break;
        
        if (!selectedUserIds.has(ticket.userId)) {
          winners.push({
            ...ticket,
            drawPosition: winners.length + 1
          });
          selectedUserIds.add(ticket.userId);
        }
      }
      
      // Garantir que cada usuário só pode ganhar um passaporte (sem repetições)
      if (winners.length < 16) {
        showWarning(
          'Usuários insuficientes!',
          `Apenas ${winners.length} usuários únicos disponíveis. Não é possível sortear 16 passaportes sem repetir ganhadores.`
        );
        return;
      }
      
      // Salvar resultado no Firebase
      const drawData = {
        winners: winners,
        totalTickets: pool.length,
        totalUsers: users.length,
        createdAt: serverTimestamp(),
        createdBy: 'admin'
      };
      
      await addDoc(collection(db, 'draws'), drawData);
      
      setDrawResults(winners);
      await loadDrawHistory();
      
      showSuccess(
        '🏆 Sorteio realizado!',
        `${winners.length} ganhadores foram selecionados com sucesso.`
      );
      
    } catch (error) {
      console.error('Erro no sorteio:', error);
      showError(
        'Erro no sorteio',
        'Não foi possível realizar o sorteio. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getDrawStats = () => {
    const pool = createDrawPool();
    const uniqueUsers = new Set(pool.map(ticket => ticket.userId)).size;
    
    return {
      totalTickets: pool.length,
      uniqueUsers: uniqueUsers,
      averageTicketsPerUser: uniqueUsers > 0 ? (pool.length / uniqueUsers).toFixed(1) : 0
    };
  };

  useEffect(() => {
    loadDrawHistory();
  }, []);

  const stats = getDrawStats();

  return (
    <div className="admin-draw">
      <div className="draw-header">
        <h2>🎲 Sistema de Sorteio ANIMON 2025</h2>
        <p>Sorteie 16 passaportes (válidos para os 2 dias) baseado nas indicações válidas</p>
      </div>

      <div className="draw-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.totalTickets}</div>
          <div className="stat-label">Total de Bilhetes</div>
          <div className="stat-sublabel">Indicações válidas</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.uniqueUsers}</div>
          <div className="stat-label">Participantes</div>
          <div className="stat-sublabel">Usuários únicos</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.averageTicketsPerUser}</div>
          <div className="stat-label">Média por Usuário</div>
          <div className="stat-sublabel">Bilhetes por pessoa</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">16</div>
          <div className="stat-label">Passaportes</div>
          <div className="stat-sublabel">Válidos 2 dias</div>
        </div>
      </div>

      <div className="draw-actions">
        <button 
          onClick={performDraw} 
          disabled={loading || stats.totalTickets < 16}
          className="draw-btn"
        >
          {loading ? '🎲 Sorteando...' : '🚀 REALIZAR SORTEIO'}
        </button>
        
        {stats.totalTickets < 16 && (
          <p className="warning">
            ⚠️ Necessário pelo menos 16 indicações válidas para sortear os passaportes
          </p>
        )}
      </div>

      {/* Último Resultado */}
      {drawResults.length > 0 && (
        <div className="draw-results">
          <h3>🏆 Último Sorteio - Ganhadores</h3>
          <div className="winners-grid">
            {drawResults.map((winner, index) => (
              <div key={index} className="winner-card">
                <div className="winner-position">#{winner.drawPosition}</div>
                <div className="winner-info">
                  <h4>{winner.userName}</h4>
                  <p className="winner-email">{winner.userEmail}</p>
                  <p className="winner-phone">{winner.userPhone}</p>
                  <p className="winner-teacher">Prof: {winner.userTeacher}</p>
                  <div className="winner-referral">
                    <small>
                      Bilhete #{winner.ticketNumber}: {winner.referralName} ({winner.referralPhone})
                    </small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Histórico */}
      <div className="draw-history">
        <h3>📋 Histórico de Sorteios</h3>
        
        {loadingHistory ? (
          <div className="loading">Carregando histórico...</div>
        ) : previousDraws.length === 0 ? (
          <div className="no-history">
            <p>Nenhum sorteio realizado ainda.</p>
          </div>
        ) : (
          <div className="history-list">
            {previousDraws.map(draw => (
              <div key={draw.id} className="history-item">
                <div className="history-header">
                  <h4>
                    Sorteio - {draw.createdAt?.toDate().toLocaleDateString('pt-BR')} às {draw.createdAt?.toDate().toLocaleTimeString('pt-BR')}
                  </h4>
                  <div className="history-stats">
                    <span>{draw.winners?.length || 0} ganhadores</span>
                    <span>{draw.totalTickets} bilhetes</span>
                    <span>{draw.totalUsers} usuários</span>
                  </div>
                </div>
                
                <div className="history-winners">
                  {draw.winners?.slice(0, 5).map((winner, index) => (
                    <div key={index} className="history-winner">
                      <span className="position">#{winner.drawPosition}</span>
                      <span className="name">{winner.userName}</span>
                      <span className="email">{winner.userEmail}</span>
                    </div>
                  ))}
                  {draw.winners?.length > 5 && (
                    <div className="more-winners">
                      ... e mais {draw.winners.length - 5} ganhadores
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDraw;