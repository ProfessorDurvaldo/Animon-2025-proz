# 🎌 Sorteio ANIMON 2025 - Proz

Sistema web para sorteio de passaportes gratuitos para o evento ANIMON 2025, onde alunos da Proz podem indicar amigos para aumentar suas chances de ganhar.

## ✨ Funcionalidades

### Para Usuários
- 🔐 Login com Google
- 📝 Completar perfil (telefone, professor, nome completo)
- 👥 Indicar amigos com nome e telefone
- 📊 Visualizar estatísticas pessoais
- ✅ Acompanhar status das indicações (válida/inválida)

### Para Administradores
- 👥 Visualizar todos os usuários cadastrados
- 📞 Gerenciar todas as indicações
- ❌ Marcar números como inválidos
- 🛡️ Promover/remover outros administradores
- 🎲 Realizar sorteios automáticos
- 📋 Visualizar histórico de sorteios

## 🚀 Como Instalar

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn
- Conta no Firebase

### 1. Instale as dependências
```bash
npm install
```

### 2. Configure o Firebase
1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative Authentication com Google
3. Ative Firestore Database
4. Configure as regras de segurança (arquivo `firestore.rules`)

### 3. Configure as variáveis de ambiente
O arquivo `.env` já está configurado com as credenciais do Firebase.

### 4. Execute o projeto
```bash
npm run dev
```

O site estará disponível em `http://localhost:5173`

## 🏗️ Como Fazer Deploy

### Build para produção
```bash
npm run build
```

### Deploy no Firebase Hosting (opcional)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 🛡️ Administradores

### Administrador Principal
- Email: `durvaldomarques@gmail.com`
- Tem todos os privilégios
- Não pode ser removido
- Pode promover outros usuários a administradores

### Como Promover um Usuário a Admin
1. Faça login como administrador
2. Acesse o Painel Admin
3. Vá para a aba "Usuários"
4. Clique em "⭐ Tornar Admin" ao lado do usuário desejado

## 🎲 Como Funciona o Sorteio

1. **Pool de Bilhetes**: Cada indicação válida = 1 bilhete no sorteio
2. **Usuários Únicos**: O sistema prioriza usuários únicos (máximo 1 prêmio por pessoa)
3. **16 Passaportes**: São sorteados 16 passaportes (válidos para os 2 dias) aleatoriamente
4. **Histórico**: Todos os sorteios ficam salvos no banco de dados

## 📱 Responsividade

O site foi desenvolvido com design responsivo, funcionando perfeitamente em:
- 💻 Desktop
- 📱 Smartphones
- 📲 Tablets

## 🎨 Tema Visual

- **Inspiração**: Cultura anime/otaku
- **Cores principais**: Gradientes vibrantes
- **Tipografia**: Orbitron (títulos) + Roboto (texto)
- **Animações**: Efeitos suaves e modernos

## 🔒 Segurança

- ✅ Autenticação obrigatória
- ✅ Regras de segurança no Firestore
- ✅ Validação de dados no frontend
- ✅ Proteção contra spam
- ✅ Roles de usuário (user/admin)

## 🐛 Resolução de Problemas

### Erro de Permissão no Firestore
- Verifique se as regras de segurança estão configuradas
- Confirme se o usuário está autenticado

### Login não funciona
- Verifique as configurações do Firebase Auth
- Confirme se o domínio está autorizado no Firebase

### Indicações não aparecem
- Verifique se o usuário completou o perfil
- Confirme se há indicações válidas no banco

## 📞 Suporte

Para dúvidas ou problemas, entre em contato:
- 📧 Email: durvaldomarques@gmail.com
- 🏢 Proz - Escola de Tecnologia

## 📄 Licença

Este projeto foi desenvolvido exclusivamente para a Proz e o evento ANIMON 2025.

---
🎌 **ANIMON 2025** - O maior festival geek do Norte de Minas!
📅 13 e 14 de setembro de 2025
📍 Montes Claros - MG
