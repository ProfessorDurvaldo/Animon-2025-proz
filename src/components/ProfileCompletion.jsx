import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { serverTimestamp } from 'firebase/firestore';
import { showError, showToast, showWarning } from '../utils/sweetAlert';
import './ProfileCompletion.css';

const ProfileCompletion = () => {
  const { currentUser, updateUserProfile, logout } = useAuth();
  const [formData, setFormData] = useState({
    fullName: currentUser?.displayName || '',
    phone: '',
    teacher: '',
    turno: '',
    curso: ''
  });
  const [loading, setLoading] = useState(false);

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4,5})(\d{4})/, '$1-$2');
    }
    return value;
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.teacher.trim() || !formData.turno || !formData.curso) {
      showWarning(
        'Campos obrigatórios!',
        'Por favor, preencha todos os campos para continuar.'
      );
      return;
    }

    if (!validatePhone(formData.phone)) {
      showWarning(
        'Telefone inválido!',
        'Por favor, insira um telefone válido no formato (XX) XXXXX-XXXX'
      );
      return;
    }

    try {
      setLoading(true);
      
      const profileData = {
        fullName: formData.fullName.trim(),
        phone: formData.phone,
        teacher: formData.teacher.trim(),
        turno: formData.turno,
        curso: formData.curso,
        email: currentUser.email,
        profileCompletedAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      };

      const success = await updateUserProfile(currentUser.uid, profileData);
      
      if (success) {
        showToast('🎉 Perfil completado com sucesso!', 'success');
      } else {
        showError(
          'Erro ao salvar',
          'Não foi possível salvar o perfil. Tente novamente.'
        );
      }
    } catch (error) {
      console.error('Erro ao completar perfil:', error);
      showError(
        'Erro no cadastro',
        'Ocorreu um erro ao completar o perfil. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-completion">
      <header className="profile-header">
        <div className="header-content">
          <div className="header-info">
            <h1>🎌 Complete seu Perfil</h1>
            <p className="event-info">Finalize seu cadastro para participar do sorteio</p>
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
      </header>

      <main className="profile-main">
        <div className="container">
          <div className="completion-card">
            <div className="card-header">
              <h2>📝 Informações Necessárias</h2>
              <p>Para participar do sorteio, precisamos de algumas informações suas:</p>
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="fullName">Nome Completo *</label>
                <input
                  type="text"
                  id="fullName"
                  placeholder="Seu nome completo"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Telefone *</label>
                <input
                  type="tel"
                  id="phone"
                  placeholder="(XX) XXXXX-XXXX"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  required
                  className="form-input"
                  maxLength="15"
                />
                <small className="form-help">Digite seu número com DDD</small>
              </div>

              <div className="form-group">
                <label htmlFor="teacher">Nome do seu Professor *</label>
                <input
                  type="text"
                  id="teacher"
                  placeholder="Nome do seu professor na Proz"
                  value={formData.teacher}
                  onChange={(e) => setFormData(prev => ({ ...prev, teacher: e.target.value }))}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="turno">Turno *</label>
                <select
                  id="turno"
                  value={formData.turno}
                  onChange={(e) => setFormData(prev => ({ ...prev, turno: e.target.value }))}
                  required
                  className="form-input"
                >
                  <option value="">Selecione seu turno</option>
                  <option value="Manhã">Manhã</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Noite">Noite</option>
                </select>
              </div>

              <div className="course-promotion-notice">
                <h3>🎯 Promoção Exclusiva!</h3>
                <p>Esta promoção é válida apenas para alunos do curso de <strong>Desenvolvimento de Sistemas</strong>.</p>
              </div>

              <div className="form-group">
                <label htmlFor="curso">Curso *</label>
                <select
                  id="curso"
                  value={formData.curso}
                  onChange={(e) => setFormData(prev => ({ ...prev, curso: e.target.value }))}
                  required
                  className="form-input"
                >
                  <option value="">Confirme seu curso</option>
                  <option value="Desenvolvimento de Sistemas">Desenvolvimento de Sistemas</option>
                </select>
              </div>

              <div className="form-info">
                <h3>📧 Email já cadastrado:</h3>
                <p>{currentUser?.email}</p>
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? '⏳ Salvando...' : '🚀 Completar Perfil'}
              </button>
            </form>

            <div className="info-section">
              <h3>ℹ️ Por que precisamos dessas informações?</h3>
              <ul>
                <li><strong>Nome Completo:</strong> Para identificação no sorteio</li>
                <li><strong>Telefone:</strong> Para contato em caso de prêmio</li>
                <li><strong>Professor:</strong> Para validar que você é aluno da Proz</li>
                <li><strong>Turno:</strong> Para organização e estatísticas</li>
                <li><strong>Curso:</strong> Para segmentação dos participantes</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileCompletion;