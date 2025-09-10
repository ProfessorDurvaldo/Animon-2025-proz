import Swal from 'sweetalert2';

// Configurações padrão do tema ANIMON 2025 Gray/Metallic
const defaultOptions = {
  confirmButtonColor: '#ffa726',
  cancelButtonColor: '#6c757d',
  background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 50%, #1a1a2e 100%)',
  color: '#ffffff',
  confirmButtonText: 'OK',
  cancelButtonText: 'Cancelar',
  allowOutsideClick: false,
  allowEscapeKey: true,
  showClass: {
    popup: 'swal2-show',
    backdrop: 'swal2-backdrop-show'
  },
  hideClass: {
    popup: 'swal2-hide',
    backdrop: 'swal2-backdrop-hide'
  }
};

// Alerta de sucesso
export const showSuccess = (title, text = '') => {
  return Swal.fire({
    ...defaultOptions,
    title,
    text,
    icon: 'success',
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: false,
    iconColor: '#4a9b8e',
    customClass: {
      popup: 'swal2-icon-success'
    }
  });
};

// Alerta de erro
export const showError = (title, text = '') => {
  return Swal.fire({
    ...defaultOptions,
    title,
    text,
    icon: 'error',
    iconColor: '#a64d4d',
    customClass: {
      popup: 'swal2-icon-error'
    }
  });
};

// Alerta de aviso
export const showWarning = (title, text = '') => {
  return Swal.fire({
    ...defaultOptions,
    title,
    text,
    icon: 'warning',
    iconColor: '#b8860b',
    customClass: {
      popup: 'swal2-icon-warning'
    }
  });
};

// Alerta de informação
export const showInfo = (title, text = '') => {
  return Swal.fire({
    ...defaultOptions,
    title,
    text,
    icon: 'info',
    iconColor: '#4ecdc4',
    customClass: {
      popup: 'swal2-icon-info'
    }
  });
};

// Confirmação
export const showConfirm = (title, text = '', confirmText = 'Confirmar') => {
  return Swal.fire({
    ...defaultOptions,
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: confirmText,
    iconColor: '#6c757d',
    customClass: {
      popup: 'swal2-icon-question'
    }
  });
};

// Loading/Processando
export const showLoading = (title = 'Processando...', text = '') => {
  return Swal.fire({
    ...defaultOptions,
    title,
    text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

// Fechar loading
export const closeLoading = () => {
  Swal.close();
};

// Toast notification (pequeno alerta no canto)
export const showToast = (title, icon = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)',
    color: '#ffffff',
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  return Toast.fire({
    icon,
    title
  });
};