# ZeroPaper – Controle Financeiro Inteligente no Celular

O **ZeroPaper** é um sistema financeiro **exclusivo para celulares Android e iOS**, desenvolvido para ajudar o usuário a **controlar seus gastos**, **visualizar comparações com o salário** e **atingir metas financeiras** de forma simples, prática e eficiente.

---

## 📲 Principais Funcionalidades

- Registro de receitas e despesas
- Classificação dos gastos por categorias (mercado, saúde, transporte, etc.)
- Gráficos interativos para análise de gastos
- Identificação de despesas desnecessárias
- Planejamento de metas financeiras com prazos
- Cálculo automático de quanto guardar por mês
- Acompanhamento mensal do progresso das metas

---

## 🎯 Exemplo de Meta

**Meta:** Comprar um celular de R$ 2.000 guardando R$ 200  
**Sistema sugere:** guardar R$ 200 por 10 meses  
Mostra o progresso, sugere cortes e guarda o valor mensal virtualmente

---

## 💰 Planos Disponíveis

- **Gratuito**: Controle básico de despesas, categorias e gráficos
- **Premium (R$ 19,90/mês)**: Metas financeiras, sugestões de economia, backup na nuvem, relatórios e exportação de dados

---

## ✅ Requisitos do Sistema

### ✅ Requisitos Funcionais

- Permitir cadastro e login de usuários
- Registrar receitas e despesas com data, valor e categoria
- Exibir gráficos de gastos por categoria e por mês
- Calcular o saldo mensal (renda - despesas)
- Permitir criação de metas com valor e prazo
- Calcular economia mensal necessária para atingir a meta
- Acompanhar o progresso das metas
- Identificar e sugerir cortes de gastos com base no histórico

### ✅ Requisitos Não Funcionais

- Aplicativo disponível para **Android 8.0+** e **iOS 13+**
- Interface intuitiva e responsiva
- Armazenamento local e em nuvem (premium)
- Tempo de resposta rápido (menos de 2 segundos por ação)
- Segurança dos dados com criptografia de informações sensíveis
- Baixo consumo de bateria e armazenamento (até 100MB)
- Disponibilidade mínima de 99% do tempo (exceto atualizações)
- Conexão à internet obrigatória para backup e sincronização

---

## 📱 Por que usar o ZeroPaper?

- Controle financeiro direto no celular
- Clareza sobre gastos e renda
- Economia facilitada e metas alcançadas
- Simples, rápido e acessível

# ZeroPaper

Este repositório contém um app financeiro simples (ZeroPaper) com:
- Tela de Login (usuário/senha via AsyncStorage ou registrar)
- Tela principal (Dash) com lista de transações (FlatList)
- Telas: Transactions, Categories, Goals, Settings
- Navegação por Bottom Tabs (React Navigation)
- Armazenamento local via AsyncStorage

## Como rodar (local)

1. Instale o Expo CLI (se não tiver):
   ```bash
   npm install -g expo-cli
   ```
2. Instale dependências:
   ```bash
   npm install
   ```
3. Rode o app:
   ```bash
   npm start
   ```
   ou
   ```bash
   expo start
   ```

## Responsabilidades do grupo (preenchido)
- Nathan — Programação (implementou a maior parte da lógica e integração)
- Leonardo Rodrigues — Layout / UI (estilização e design com StyleSheet)
- Eyke — Lógica / Estados (FlatList, manipulação de transações, AsyncStorage)
- Vinícius — Documentação (README, vídeo e organização do repositório)

---

**ZeroPaper: organize sua vida financeira e realize seus sonhos.**
