import { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { showError, showToast, showWarning, showInfo, showConfirm } from '../utils/sweetAlert';
import AdminDraw from './AdminDraw';
import './AdminPanel.css';
import whatsappIcon from '../assets/WhatsApp.svg.webp';

const AdminPanel = () => {
  const { logout, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    document.title = 'Painel Administrativo - ANIMON 2025 | Proz';
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar usuários
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);

      // Carregar indicações
      const referralsQuery = query(
        collection(db, 'referrals'), 
        orderBy('createdAt', 'desc')
      );
      const referralsSnapshot = await getDocs(referralsQuery);
      const referralsList = referralsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReferrals(referralsList);

      // Carregar admins
      const adminsSnapshot = await getDocs(collection(db, 'admins'));
      const adminsList = adminsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAdmins(adminsList);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showError(
        'Erro no carregamento',
        'Não foi possível carregar os dados do painel administrativo.'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleReferralValidity = async (referralId, currentStatus) => {
    try {
      setActionLoading(prev => ({ ...prev, [referralId]: true }));
      
      await updateDoc(doc(db, 'referrals', referralId), {
        isValid: !currentStatus
      });
      
      setReferrals(prev => 
        prev.map(ref => 
          ref.id === referralId 
            ? { ...ref, isValid: !currentStatus }
            : ref
        )
      );
      
      showToast(`✅ Indicação marcada como ${!currentStatus ? 'válida' : 'inválida'}`, 'success');
    } catch (error) {
      console.error('Erro ao atualizar indicação:', error);
      showError(
        'Erro na atualização',
        'Não foi possível atualizar o status da indicação.'
      );
    } finally {
      setActionLoading(prev => ({ ...prev, [referralId]: false }));
    }
  };

  const toggleUserValidity = async (userId, userName, currentValidity) => {
    const result = await showConfirm(
      'Alterar status do usuário',
      `Deseja ${currentValidity === false ? 'reativar' : 'invalidar'} o usuário ${userName}?`,
      'Confirmar'
    );

    if (!result.isConfirmed) return;

    try {
      const newStatus = currentValidity === false ? true : false;
      
      await updateDoc(doc(db, 'users', userId), {
        isValid: newStatus
      });
      
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, isValid: newStatus }
            : user
        )
      );
      
      showToast(
        `${newStatus ? '✅' : '❌'} ${userName} ${newStatus ? 'reativado' : 'invalidado'}`, 
        'success'
      );
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      showError(
        'Erro na operação',
        'Não foi possível alterar o status do usuário.'
      );
    }
  };

  const toggleAdminStatus = async (userEmail, userName, isCurrentlyAdmin) => {
    try {
      if (userEmail === 'durvaldomarques@gmail.com') {
        showWarning(
          'Operação não permitida!',
          'Não é possível alterar o status do administrador principal.'
        );
        return;
      }

      const adminDoc = admins.find(admin => admin.email === userEmail);
      
      if (isCurrentlyAdmin && adminDoc) {
        // Remover admin
        await deleteDoc(doc(db, 'admins', adminDoc.id));
        setAdmins(prev => prev.filter(admin => admin.id !== adminDoc.id));
        showToast(`🗑️ ${userName} removido dos administradores`, 'success');
      } else if (!isCurrentlyAdmin) {
        // Adicionar admin
        const newAdminRef = doc(collection(db, 'admins'));
        await setDoc(newAdminRef, {
          email: userEmail,
          name: userName,
          addedBy: currentUser.email,
          addedAt: new Date()
        });
        
        const newAdmin = {
          id: newAdminRef.id,
          email: userEmail,
          name: userName,
          addedBy: currentUser.email,
          addedAt: new Date()
        };
        
        setAdmins(prev => [...prev, newAdmin]);
        showToast(`⭐ ${userName} promovido a administrador`, 'success');
      }
    } catch (error) {
      console.error('Erro ao alterar status de admin:', error);
      showError(
        'Erro na operação',
        'Não foi possível alterar o status de administrador.'
      );
    }
  };

  const getUserReferrals = (userId) => {
    return referrals.filter(ref => ref.userId === userId);
  };

  const getValidReferralsCount = (userId) => {
    return getUserReferrals(userId).filter(ref => ref.isValid).length;
  };

  const isUserAdmin = (email) => {
    return email === 'durvaldomarques@gmail.com' || 
           admins.some(admin => admin.email === email);
  };

  const openWhatsApp = (phone) => {
    // Remover formatação e adicionar código do Brasil
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/55${cleanPhone}`;
    window.open(whatsappUrl, '_blank');
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="admin-panel loading">
        <div className="loading-content">
          <h2>🔄 Carregando Painel Administrativo...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <div className="header-content">
          <div className="header-info">
            <h1>🛡️ Painel Administrativo - ANIMON 2025</h1>
          </div>
          <div className="admin-section">
            <div className="admin-details">
              <span className="admin-title">Administrador</span>
              <span className="admin-email">{currentUser?.email}</span>
            </div>
            <div className="header-actions">
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

      <nav className="admin-nav">
        <div className="nav-content">
          <button 
            className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Usuários ({users.length})
          </button>
          <button 
            className={`nav-btn ${activeTab === 'referrals' ? 'active' : ''}`}
            onClick={() => setActiveTab('referrals')}
          >
            📞 Indicações ({referrals.length})
          </button>
          <button 
            className={`nav-btn ${activeTab === 'admins' ? 'active' : ''}`}
            onClick={() => setActiveTab('admins')}
          >
            🛡️ Administradores ({admins.length + 1})
          </button>
          <button 
            className={`nav-btn ${activeTab === 'draw' ? 'active' : ''}`}
            onClick={() => setActiveTab('draw')}
          >
            🎲 Sorteio
          </button>
        </div>
      </nav>

      <main className="admin-main">
        <div className="container">
          
          {/* Usuários */}
          {activeTab === 'users' && (
            <div className="tab-content">
              <div className="section-header">
                <h2>👥 Usuários Cadastrados</h2>
                <button onClick={loadData} className="refresh-btn">🔄 Atualizar</button>
              </div>
              
              <div className="users-grid">
                {users.map(user => {
                  const userReferrals = getUserReferrals(user.id);
                  const validReferrals = getValidReferralsCount(user.id);
                  const isAdmin = isUserAdmin(user.email);
                  
                  const isInvalidUser = user.isValid === false;
                  
                  return (
                    <div key={user.id} className={`user-card ${isAdmin ? 'admin-user' : ''} ${isInvalidUser ? 'invalid-user' : ''}`}>
                      <div className="user-info">
                        <h3>{user.fullName || 'Nome não informado'}</h3>
                        <p className="email">{user.email}</p>
                        <p className="phone">{user.phone || 'Telefone não informado'}</p>
                        <p className="teacher">Prof: {user.teacher || 'Não informado'}</p>
                        <p className="turno">Turno: {user.turno || 'Não informado'}</p>
                        <p className="curso">Curso: {user.curso || 'Não informado'}</p>
                      </div>
                      
                      <div className="user-stats">
                        <div className="stat">
                          <span className="stat-number">{validReferrals}</span>
                          <span className="stat-label">Válidas</span>
                        </div>
                        <div className="stat">
                          <span className="stat-number">{userReferrals.length - validReferrals}</span>
                          <span className="stat-label">Inválidas</span>
                        </div>
                        <div className="stat">
                          <span className="stat-number">{userReferrals.length}</span>
                          <span className="stat-label">Total</span>
                        </div>
                      </div>

                      <div className="user-actions">
                        <button
                          onClick={() => toggleUserValidity(user.id, user.fullName, user.isValid)}
                          className={`validity-toggle-btn ${isInvalidUser ? 'activate-user' : 'invalidate-user'}`}
                        >
                          {isInvalidUser ? '✅ Reativar' : '❌ Invalidar'}
                        </button>
                        <button
                          onClick={() => toggleAdminStatus(user.email, user.fullName, isAdmin)}
                          className={`admin-toggle-btn ${isAdmin ? 'remove-admin' : 'make-admin'}`}
                          disabled={user.email === 'durvaldomarques@gmail.com'}
                        >
                          {isAdmin ? '❌ Remover Admin' : '⭐ Tornar Admin'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Indicações */}
          {activeTab === 'referrals' && (
            <div className="tab-content">
              <div className="section-header">
                <h2>📞 Todas as Indicações</h2>
                <div className="referrals-summary">
                  <span className="summary-item valid">
                    ✅ Válidas: {referrals.filter(ref => ref.isValid).length}
                  </span>
                  <span className="summary-item invalid">
                    ❌ Inválidas: {referrals.filter(ref => !ref.isValid).length}
                  </span>
                </div>
                <button onClick={loadData} className="refresh-btn">🔄 Atualizar</button>
              </div>
              
              <div className="referrals-table">
                <div className="table-header">
                  <div>Indicado por</div>
                  <div>Nome do Amigo</div>
                  <div>Telefone</div>
                  <div>WhatsApp</div>
                  <div>Data</div>
                  <div>Status</div>
                  <div>Ações</div>
                </div>
                
                {referrals.map(referral => (
                  <div key={referral.id} className={`table-row ${referral.isValid ? 'valid' : 'invalid'}`}>
                    <div className="user-cell">
                      <strong>{referral.userName}</strong>
                      <small>{referral.userEmail}</small>
                    </div>
                    <div>{referral.friendName}</div>
                    <div className="phone-cell">{referral.friendPhone}</div>
                    <div className="whatsapp-cell">
                      <button
                        onClick={() => openWhatsApp(referral.friendPhone)}
                        className="whatsapp-btn"
                        title="Abrir no WhatsApp"
                      >
                        <img 
                          src={whatsappIcon} 
                          alt="WhatsApp" 
                          className="whatsapp-icon"
                        />
                      </button>
                    </div>
                    <div className="date-cell">
                      {referral.createdAt?.toDate().toLocaleDateString('pt-BR')}
                    </div>
                    <div>
                      <span className={`status-badge ${referral.isValid ? 'valid' : 'invalid'}`}>
                        {referral.isValid ? '✅ Válido' : '❌ Inválido'}
                      </span>
                    </div>
                    <div>
                      <button
                        onClick={() => toggleReferralValidity(referral.id, referral.isValid)}
                        disabled={actionLoading[referral.id]}
                        className={`toggle-btn ${referral.isValid ? 'invalidate' : 'validate'}`}
                      >
                        {actionLoading[referral.id] 
                          ? '⏳' 
                          : referral.isValid 
                            ? '❌ Invalidar' 
                            : '✅ Validar'
                        }
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Administradores */}
          {activeTab === 'admins' && (
            <div className="tab-content">
              <div className="section-header">
                <h2>🛡️ Administradores do Sistema</h2>
                <button onClick={loadData} className="refresh-btn">🔄 Atualizar</button>
              </div>
              
              <div className="admins-list">
                {/* Admin Principal */}
                <div className="admin-card primary">
                  <div className="admin-info">
                    <h3>durvaldomarques@gmail.com</h3>
                    <p className="admin-role">👑 Administrador Principal</p>
                    <p className="admin-permissions">Todas as permissões</p>
                  </div>
                  <div className="admin-status primary">
                    <span>🔒 Não removível</span>
                  </div>
                </div>

                {/* Outros Admins */}
                {admins.map(admin => (
                  <div key={admin.id} className="admin-card">
                    <div className="admin-info">
                      <h3>{admin.email}</h3>
                      <p className="admin-name">{admin.name}</p>
                      <p className="admin-details">
                        Promovido por: {admin.addedBy}<br />
                        Em: {admin.addedAt?.toDate?.()?.toLocaleDateString('pt-BR') || 'Data não disponível'}
                      </p>
                    </div>
                    <div className="admin-actions">
                      <button
                        onClick={() => toggleAdminStatus(admin.email, admin.name, true)}
                        className="remove-admin-btn"
                      >
                        ❌ Remover Admin
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="admin-instructions">
                <h3>💡 Como promover usuários</h3>
                <p>Vá até a aba "Usuários" e clique no botão "⭐ Tornar Admin" ao lado do usuário desejado.</p>
              </div>
            </div>
          )}

          {/* Sorteio */}
          {activeTab === 'draw' && (
            <AdminDraw 
              users={users}
              referrals={referrals}
              onRefresh={loadData}
            />
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminPanel;