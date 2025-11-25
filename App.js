import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  Dimensions,
  StyleSheet,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { PieChart, BarChart } from "react-native-chart-kit";

/*
Dependencies to add in Snack:
- @react-navigation/native
- @react-navigation/bottom-tabs
- react-native-gesture-handler
- react-native-reanimated
- react-native-svg
- @expo/vector-icons
- @react-native-async-storage/async-storage
- react-native-chart-kit
*/

const STORAGE = {
  USERS: "@zp_users_v1",
  CURRENT_USER: "@zp_current_user_v1",
  TX: "@zp_tx_v3",
  CATS: "@zp_cats_v3",
  GOALS: "@zp_goals_v3",
  SETTINGS: "@zp_set_v3",
};

// Defaults
const DEFAULT_CATS = [
  { id: "c_food", name: "Alimentação", color: "#FF6384" },
  { id: "c_transport", name: "Transporte", color: "#36A2EB" },
  { id: "c_shopping", name: "Compras", color: "#FFCE56" },
  { id: "c_salary", name: "Salário", color: "#4BC0C0" },
];

// Helpers
function formatCurrency(n) {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(Number(n) || 0);
  const parts = abs.toFixed(2).split(".");
  let int = parts[0];
  let res = "";
  while (int.length > 3) {
    res = "." + int.slice(-3) + res;
    int = int.slice(0, -3);
  }
  res = int + res;
  return `${sign}$${res},${parts[1]}`;
}

const SCREEN = {
  width: Dimensions.get("window").width,
  height: Dimensions.get("window").height,
};
function useScreenWidth() {
  const [w, setW] = useState(Dimensions.get("window").width);
  useEffect(() => {
    const sub = Dimensions.addEventListener?.("change", ({ window }) => setW(window.width));
    return () => sub?.remove?.();
  }, []);
  return w;
}

// LOGIN SCREEN
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  async function handleAuth() {
    if (!email || !password) return Alert.alert("Erro", "Preencha todos os campos");
    try {
      const usersStr = await AsyncStorage.getItem(STORAGE.USERS);
      let users = usersStr ? JSON.parse(usersStr) : [];

      if (isRegister) {
        if (users.some(u => u.email === email)) {
          return Alert.alert("Erro", "Usuário já existe");
        }
        const newUser = { email, password };
        users.push(newUser);
        await AsyncStorage.setItem(STORAGE.USERS, JSON.stringify(users));
        await AsyncStorage.setItem(STORAGE.CURRENT_USER, email);
        Alert.alert("Sucesso", "Conta criada!");
        onLogin(email);
      } else {
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
          await AsyncStorage.setItem(STORAGE.CURRENT_USER, email);
          onLogin(email);
        } else {
          Alert.alert("Erro", "Credenciais inválidas");
        }
      }
    } catch (e) {
      Alert.alert("Erro", "Falha ao processar");
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: '#000' }]}>
      <View style={[styles.container, { justifyContent: 'center', flex: 1 }]}>
        <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 32 }}>
          ZeroPaper
        </Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Senha"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />

        <TouchableOpacity onPress={handleAuth} style={[styles.saveBtn, { backgroundColor: '#1DB954' }]}>
          <Text style={{ color: '#000', fontWeight: '700' }}>
            {isRegister ? "Criar Conta" : "Entrar"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsRegister(!isRegister)} style={{ marginTop: 16 }}>
          <Text style={{ color: '#1DB954', textAlign: 'center' }}>
            {isRegister ? "Já tem conta? Entrar" : "Não tem conta? Registrar"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// MAIN APP (only shown after login)
function MainApp({ currentUser, onLogout }) {
  const Tab = createBottomTabNavigator();

  // app state
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATS);
  const [goals, setGoals] = useState([]);
  const [settings, setSettings] = useState({ darkMode: true });

  // Keys scoped per user
  const userTxKey = `${STORAGE.TX}_${currentUser}`;
  const userCatsKey = `${STORAGE.CATS}_${currentUser}`;
  const userGoalsKey = `${STORAGE.GOALS}_${currentUser}`;
  const userSettingsKey = `${STORAGE.SETTINGS}_${currentUser}`;

  // load from storage
  useEffect(() => {
    (async () => {
      try {
        const [t, c, g, s] = await Promise.all([
          AsyncStorage.getItem(userTxKey),
          AsyncStorage.getItem(userCatsKey),
          AsyncStorage.getItem(userGoalsKey),
          AsyncStorage.getItem(userSettingsKey),
        ]);
        if (t) setTransactions(JSON.parse(t));
        else {
          // seed example data
          setTransactions([
            { id: "t1", title: "Salário", amount: 3200, categoryId: "c_salary", date: new Date().toISOString() },
            { id: "t2", title: "Supermercado", amount: -85.5, categoryId: "c_food", date: new Date().toISOString() },
            { id: "t3", title: "Ônibus", amount: -12.0, categoryId: "c_transport", date: new Date().toISOString() },
          ]);
        }
        if (c) setCategories(JSON.parse(c));
        if (g) setGoals(JSON.parse(g));
        if (s) setSettings(JSON.parse(s));
      } catch (e) {
        console.warn("load error", e);
      }
    })();
  }, [currentUser]);

  // persist
  useEffect(() => {
    AsyncStorage.setItem(userTxKey, JSON.stringify(transactions));
  }, [transactions, currentUser]);
  useEffect(() => {
    AsyncStorage.setItem(userCatsKey, JSON.stringify(categories));
  }, [categories, currentUser]);
  useEffect(() => {
    AsyncStorage.setItem(userGoalsKey, JSON.stringify(goals));
  }, [goals, currentUser]);
  useEffect(() => {
    AsyncStorage.setItem(userSettingsKey, JSON.stringify(settings));
  }, [settings, currentUser]);

  // derived
  const totals = useMemo(() => {
    const income = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + Number(t.amount), 0);
    const expense = transactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
    const balance = income - expense;
    return { income, expense, balance };
  }, [transactions]);

  const categorySums = useMemo(() => {
    const map = {};
    categories.forEach((c) => (map[c.id] = { ...c, value: 0 }));
    transactions.forEach((t) => {
      const cid = t.categoryId || "__uncat";
      if (!map[cid]) map[cid] = { id: cid, name: "Outros", color: "#888", value: 0 };
      map[cid].value += Math.abs(Number(t.amount));
    });
    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [transactions, categories]);

  // actions
  function addTransaction({ title, amount, categoryId }) {
    const t = { id: String(Date.now()), title, amount: Number(amount), categoryId, date: new Date().toISOString() };
    setTransactions((s) => [t, ...s]);
    return t;
  }
  function removeTransaction(id) {
    setTransactions((s) => s.filter((t) => t.id !== id));
  }
  function addCategory({ name, color }) {
    const c = { id: `c_${Date.now()}`, name, color: color || "#" + Math.floor(Math.random() * 16777215).toString(16) };
    setCategories((s) => [c, ...s]);
    return c;
  }
  function removeCategory(id) {
    Alert.alert("Remover categoria", "Deseja remover esta categoria? Transações não serão deletadas (ficarão sem categoria).", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () => {
          setCategories((s) => s.filter((c) => c.id !== id));
        },
      },
    ]);
  }
  function addGoal({ title, target, color }) {
    const g = { id: `g_${Date.now()}`, title, target: Number(target), saved: 0, color: color || "#" + Math.floor(Math.random() * 16777215).toString(16) };
    setGoals((s) => [g, ...s]);
    return g;
  }
  function contributeToGoal(goalId, amount) {
    amount = Number(amount);
    if (!goalId || isNaN(amount) || amount <= 0) return { ok: false, message: "Valor inválido" };
    const g = goals.find((x) => x.id === goalId);
    if (!g) return { ok: false, message: "Meta não encontrada" };
    const remaining = g.target - g.saved;
    const contribute = Math.min(remaining, amount);
    addTransaction({ title: `Economia: ${g.title}`, amount: -Math.abs(contribute), categoryId: null });
    setGoals((s) => s.map((x) => (x.id === g.id ? { ...x, saved: x.saved + contribute } : x)));
    return { ok: true, contributed: contribute };
  }

  // Theme
  const theme = settings.darkMode ? THEMES.dark : THEMES.light;

  // Screens definitions
  const screenWidth = useScreenWidth();
  const chartWidth = Math.min(screenWidth - 32, 900);

  function HomeScreen() {
    const pieData = categorySums.filter((c) => c.value > 0).map((c) => ({
      name: c.name,
      population: c.value,
      color: c.color,
      legendFontColor: theme.text,
      legendFontSize: 12,
    }));

    const last6 = (() => {
      const now = new Date();
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ label: d.toLocaleString('pt-BR', { month: "short" }).replace('.', ''), income: 0, expense: 0 });
      }
      transactions.forEach((t) => {
        const d = new Date(t.date);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const month = months.find((m, idx) => {
          const md = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
          return `${md.getFullYear()}-${md.getMonth()}` === key;
        });
        if (month) {
          if (t.amount > 0) month.income += t.amount;
          else month.expense += Math.abs(t.amount);
        }
      });
      return months;
    })();

    const incomeData = { 
      labels: last6.map((m) => m.label), 
      datasets: [{ data: last6.map((m) => Math.round(m.income)) }] 
    };
    const expenseData = { 
      labels: last6.map((m) => m.label), 
      datasets: [{ data: last6.map((m) => Math.round(m.expense)) }] 
    };

    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
        <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 140 }]}>
          <View style={[styles.headerRow, { marginBottom: 12 }]}>
            <Text style={[styles.h1, { color: theme.text }]}>ZeroPaper</Text>
            <Text style={{ color: theme.muted }}>{new Date().toLocaleDateString('pt-BR')}</Text>
          </View>

          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <Text style={[styles.labelSmall, { color: theme.muted }]}>Saldo Total</Text>
            <Text style={[styles.balance, { color: theme.text }]}>{formatCurrency(totals.balance)}</Text>
            <View style={styles.rowBetween}>
              <View>
                <Text style={[styles.labelSmall, { color: theme.muted }]}>Receitas</Text>
                <Text style={[styles.valueSmall, { color: theme.positive }]}>{formatCurrency(totals.income)}</Text>
              </View>
              <View>
                <Text style={[styles.labelSmall, { color: theme.muted }]}>Despesas</Text>
                <Text style={[styles.valueSmall, { color: theme.negative }]}>{formatCurrency(totals.expense)}</Text>
              </View>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Visão Geral de Gastos</Text>

          <View style={{ flexDirection: screenWidth >= 700 ? "row" : "column", justifyContent: "space-between" }}>
            <View style={[styles.chartCard, { backgroundColor: theme.surface, width: screenWidth >= 700 ? "48%" : "100%" }]}>
              <Text style={{ color: theme.text, marginBottom: 6 }}>Por Categoria</Text>
              <ScrollView horizontal contentContainerStyle={{ paddingRight: 8 }} showsHorizontalScrollIndicator={false}>
                <PieChart
                  data={pieData.length ? pieData : [{ name: "Sem dados", population: 1, color: theme.muted, legendFontColor: theme.muted, legendFontSize: 12 }]}
                  width={Math.max(220, Math.min(chartWidth / (screenWidth >= 700 ? 2 : 1), chartWidth))}
                  height={220}
                  accessor="population"
                  backgroundColor="transparent"
                  chartConfig={{
                    backgroundGradientFrom: theme.surface,
                    backgroundGradientTo: theme.surface,
                    color: (opacity = 1) => (theme.text === "#fff" ? `rgba(255,255,255,${opacity})` : `rgba(0,0,0,${opacity})`),
                  }}
                />
              </ScrollView>
            </View>

            <View style={[styles.chartCard, { backgroundColor: theme.surface, width: screenWidth >= 700 ? "48%" : "100%", marginTop: screenWidth >= 700 ? 0 : 12 }]}>
              <Text style={{ color: theme.text, marginBottom: 6 }}>Receita (acima) / Despesa (abaixo) — 6 meses</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ width: Math.max(320, chartWidth) }}>
                  <Text style={[styles.smallMuted, { color: theme.muted }]}>Receita</Text>
                  <BarChart
                    data={incomeData}
                    width={Math.max(320, chartWidth)}
                    height={160}
                    fromZero
                    yAxisLabel=""
                    chartConfig={{
                      backgroundGradientFrom: theme.surface,
                      backgroundGradientTo: theme.surface,
                      color: () => theme.positive,
                      labelColor: () => theme.text,
                      decimalPlaces: 0,
                      style: {
                        borderRadius: 16,
                      },
                      propsForLabels: {
                        fontSize: 10,
                        fontWeight: "bold",
                        rotation: 0,
                        fill: theme.text,
                      },
                    }}
                    style={{ marginBottom: 8, borderRadius: 16 }}
                    verticalLabelRotation={0}
                  />
                  <Text style={[styles.smallMuted, { color: theme.muted }]}>Despesa</Text>
                  <BarChart
                    data={expenseData}
                    width={Math.max(320, chartWidth)}
                    height={160}
                    fromZero
                    yAxisLabel=""
                    chartConfig={{
                      backgroundGradientFrom: theme.surface,
                      backgroundGradientTo: theme.surface,
                      color: () => theme.negative,
                      labelColor: () => theme.text,
                      decimalPlaces: 0,
                      style: {
                        borderRadius: 16,
                      },
                      propsForLabels: {
                        fontSize: 10,
                        fontWeight: "bold",
                        rotation: 0,
                        fill: theme.text,
                      },
                    }}
                    style={{ borderRadius: 16 }}
                    verticalLabelRotation={0}
                  />
                </View>
              </ScrollView>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 12 }]}>Transações Recentes</Text>
          <FlatList
            data={transactions}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <View style={[styles.txRow, { backgroundColor: theme.surface }]}>
                <View style={[styles.txIcon, { backgroundColor: (categories.find((c) => c.id === item.categoryId) || {}).color || "#666" }]} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: theme.text, fontWeight: "700" }}>{item.title}</Text>
                  <Text style={{ color: theme.muted, fontSize: 12 }}>{new Date(item.date).toLocaleString('pt-BR')}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ color: item.amount > 0 ? theme.positive : theme.negative, fontWeight: "700" }}>{formatCurrency(item.amount)}</Text>
                  <TouchableOpacity onPress={() => removeTransaction(item.id)}>
                    <Text style={{ color: theme.danger, fontSize: 12, marginTop: 6 }}>Remover</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            style={{ marginTop: 8 }}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  function TransactionsScreen() {
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [selectedCat, setSelectedCat] = useState(categories[0]?.id || null);
    const [isIncome, setIsIncome] = useState(false);
    const [createCatModal, setCreateCatModal] = useState(false);
    const [newCatName, setNewCatName] = useState("");
    const [newCatColor, setNewCatColor] = useState("");

    function onAddTx() {
      const val = Number(amount);
      if (!title || isNaN(val) || val === 0) return Alert.alert("Erro", "Informe título e valor válido.");
      const signed = isIncome ? Math.abs(val) : -Math.abs(val);
      addTransaction({ title, amount: signed, categoryId: selectedCat });
      setTitle("");
      setAmount("");
      setIsIncome(false);
      Alert.alert("OK", "Transação adicionada");
    }

    function onCreateCat() {
      if (!newCatName) return Alert.alert("Erro", "Nome da categoria obrigatório");
      const c = addCategory({ name: newCatName, color: newCatColor || "#" + Math.floor(Math.random() * 16777215).toString(16) });
      setSelectedCat(c.id);
      setCreateCatModal(false);
      setNewCatName("");
      setNewCatColor("");
    }

    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
        <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 140 }]}>
          <Text style={[styles.h2, { color: theme.text }]}>Adicionar Transação</Text>

          <View style={{ flexDirection: "row", marginBottom: 8 }}>
            <TouchableOpacity onPress={() => setIsIncome(false)} style={[styles.typeBtn, !isIncome && { backgroundColor: theme.positive }]}>
              <Text style={{ color: !isIncome ? "#FFFFFF" : "#FFFFFF" }}>
                Despesa
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsIncome(true)} style={[styles.typeBtn, isIncome && { backgroundColor: theme.positive, marginLeft: 8 }]}>
              <Text style={{ color: isIncome ? "#FFFFFF" : "#FFFFFF" }}>
                Receita
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput placeholder="Título" placeholderTextColor="#888" value={title} onChangeText={setTitle} style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]} />
          <TextInput placeholder="Valor" placeholderTextColor="#888" keyboardType="numeric" value={amount} onChangeText={setAmount} style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]} />

          <Text style={{ color: theme.muted, marginBottom: 6 }}>Categoria</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            {categories.map((c) => (
              <TouchableOpacity key={c.id} onPress={() => setSelectedCat(c.id)} style={[styles.pill, selectedCat === c.id && { borderWidth: 2, borderColor: theme.positive }]}>
                <View style={{ width: 10, height: 10, backgroundColor: c.color, marginRight: 8 }} />
                <Text style={{ color: "#FFFFFF" }}>{c.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setCreateCatModal(true)} style={[styles.pill, { borderStyle: "dashed", borderWidth: 1, borderColor: "#555" }]}>
              <Ionicons name="add" size={14} color={"#FFFFFF"} style={{ marginRight: 8 }} />
              <Text style={{ color: "#FFFFFF" }}>Nova</Text>
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity onPress={onAddTx} style={[styles.saveBtn, { backgroundColor: theme.positive }]}>
            <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>Salvar Transação</Text>
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 12 }]}>Todas as Transações</Text>
          <FlatList
            data={transactions}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <View style={[styles.txRow, { backgroundColor: theme.surface }]}>
                <View style={[styles.txIcon, { backgroundColor: (categories.find((c) => c.id === item.categoryId) || {}).color || "#666" }]} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: theme.text, fontWeight: "700" }}>{item.title}</Text>
                  <Text style={{ color: theme.muted, fontSize: 12 }}>{new Date(item.date).toLocaleString('pt-BR')}</Text>
                </View>
                <Text style={{ color: item.amount > 0 ? theme.positive : theme.negative, fontWeight: "700" }}>{formatCurrency(item.amount)}</Text>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            style={{ marginTop: 8 }}
            contentContainerStyle={{ paddingBottom: 120 }}
          />

          <Modal visible={createCatModal} animationType="slide" transparent>
            <View style={modalStyles.overlay}>
              <View style={[modalStyles.box, { backgroundColor: theme.surface }]}>
                <Text style={{ color: theme.text, fontWeight: "700", marginBottom: 8 }}>Criar Categoria</Text>
                <TextInput placeholder="Nome" placeholderTextColor="#888" value={newCatName} onChangeText={setNewCatName} style={[styles.input, { backgroundColor: theme.surface }]} />
                <TextInput placeholder="#hex (opcional)" placeholderTextColor="#888" value={newCatColor} onChangeText={setNewCatColor} style={[styles.input, { backgroundColor: theme.surface }]} />
                <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                  <TouchableOpacity onPress={() => setCreateCatModal(false)} style={[modalStyles.btn, { backgroundColor: "transparent" }]}>
                    <Text style={{ color: theme.muted }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={onCreateCat} style={[modalStyles.btn, { backgroundColor: theme.positive, marginLeft: 8 }]}>
                    <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>Criar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </SafeAreaView>
    );
  }

  function CategoriesScreen() {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
        <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 140 }]}>
          <Text style={[styles.h2, { color: theme.text }]}>Categorias</Text>

          <FlatList
            data={categorySums}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <View style={[styles.categoryRow, { backgroundColor: theme.surface }]}>
                <View style={[styles.iconSquare, { backgroundColor: item.color }]} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: theme.text, fontWeight: "700" }}>{item.name}</Text>
                  <Text style={{ color: theme.muted }}>{formatCurrency(item.value)} total</Text>
                </View>
                <TouchableOpacity onPress={() => removeCategory(item.id)}>
                  <Text style={{ color: theme.danger }}>Remover</Text>
                </TouchableOpacity>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            style={{ marginTop: 8 }}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  function GoalsScreen() {
    const [createModal, setCreateModal] = useState(false);
    const [title, setTitle] = useState("");
    const [target, setTarget] = useState("");
    const [currentGoal, setCurrentGoal] = useState(null);
    const [contribAmount, setContribAmount] = useState("");

    async function onCreateGoal() {
      if (!title || !target) return Alert.alert("Erro", "Título e alvo obrigatórios");
      addGoal({ title, target: Number(target) });
      setTitle("");
      setTarget("");
      setCreateModal(false);
    }

    async function onContribute() {
      if (!currentGoal) return;
      const a = Number(contribAmount);
      if (isNaN(a) || a <= 0) return Alert.alert("Erro", "Valor inválido");
      if (totals.balance < a) {
        Alert.alert("Saldo insuficiente", "Saldo disponível é menor que o valor informado.");
        return;
      }
      const res = contributeToGoal(currentGoal.id, a);
      if (res.ok) {
        Alert.alert("Contribuído", `R$ ${res.contributed} enviados para a meta.`);
        setContribAmount("");
        setCurrentGoal(null);
      } else {
        Alert.alert("Erro", res.message);
      }
    }

    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
        <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 140 }]}>
          <Text style={[styles.h2, { color: theme.text }]}>Metas</Text>

          <TouchableOpacity onPress={() => setCreateModal(true)} style={[styles.saveBtn, { backgroundColor: theme.positive, alignSelf: "flex-start" }]}>
            <Text style={{ color: settings.darkMode ? "#000" : "#FFFFFF", fontWeight: "700" }}>Criar Meta</Text>
          </TouchableOpacity>

          <FlatList
            data={goals}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => {
              const pct = Math.min(100, Math.round((item.saved / item.target) * 100));
              return (
                <View style={[styles.goalRow, { backgroundColor: theme.surface }]}>
                  <View style={[styles.iconSquare, { backgroundColor: item.color }]} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ color: theme.text, fontWeight: "700" }}>{item.title}</Text>
                    <Text style={{ color: theme.muted }}>{formatCurrency(item.saved)} / {formatCurrency(item.target)}</Text>
                    <View style={{ marginTop: 8, height: 8, backgroundColor: "#111827", borderRadius: 8, overflow: "hidden" }}>
                      <View style={{ width: `${pct}%`, height: "100%", backgroundColor: item.color }} />
                    </View>
                    <View style={{ flexDirection: "row", marginTop: 8 }}>
                      <TouchableOpacity onPress={() => setCurrentGoal(item)} style={[styles.smallBtn, { marginRight: 8 }]}>
                        <Text style={{ color: settings.darkMode ? "#000" : "#FFFFFF" }}>Adicionar dinheiro</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setGoals((s) => s.filter((g) => g.id !== item.id))} style={[styles.smallBtn, { backgroundColor: theme.danger }]}>
                        <Text style={{ color: "#fff" }}>Remover</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            style={{ marginTop: 12 }}
          />

          <Modal visible={createModal} transparent animationType="fade">
            <View style={modalStyles.overlay}>
              <View style={[modalStyles.box, { backgroundColor: theme.surface }]}>
                <Text style={{ color: theme.text, fontWeight: "700", marginBottom: 8 }}>Nova Meta</Text>
                <TextInput placeholder="Título" placeholderTextColor="#888" value={title} onChangeText={setTitle} style={[styles.input, { backgroundColor: theme.surface }]} />
                <TextInput placeholder="Valor alvo" keyboardType="numeric" placeholderTextColor="#888" value={target} onChangeText={setTarget} style={[styles.input, { backgroundColor: theme.surface }]} />
                <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                  <TouchableOpacity onPress={() => setCreateModal(false)} style={[modalStyles.btn, { backgroundColor: "transparent" }]}>
                    <Text style={{ color: theme.muted }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={onCreateGoal} style={[modalStyles.btn, { backgroundColor: theme.positive, marginLeft: 8 }]}>
                    <Text style={{ color: settings.darkMode ? "#000" : "#FFFFFF", fontWeight: "700" }}>Criar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal visible={!!currentGoal} transparent animationType="fade">
            <View style={modalStyles.overlay}>
              <View style={[modalStyles.box, { backgroundColor: theme.surface }]}>
                <Text style={{ color: theme.text, fontWeight: "700", marginBottom: 8 }}>Contribuir para {currentGoal?.title}</Text>
                <TextInput placeholder="Valor" keyboardType="numeric" placeholderTextColor="#888" value={contribAmount} onChangeText={setContribAmount} style={[styles.input, { backgroundColor: theme.surface }]} />
                <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                  <TouchableOpacity onPress={() => setCurrentGoal(null)} style={[modalStyles.btn, { backgroundColor: "transparent" }]}>
                    <Text style={{ color: theme.muted }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={onContribute} style={[modalStyles.btn, { backgroundColor: theme.positive, marginLeft: 8 }]}>
                    <Text style={{ color: settings.darkMode ? "#000" : "#FFFFFF", fontWeight: "700" }}>Adicionar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </SafeAreaView>
    );
  }

  function SettingsScreen() {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
        <View style={[styles.container, { paddingTop: 24 }]}>
          <Text style={[styles.h2, { color: theme.text }]}>Configurações</Text>
          <View style={{ marginTop: 12 }}>
            <TouchableOpacity onPress={() => setSettings((s) => ({ ...s, darkMode: !s.darkMode }))} style={[styles.saveBtn, { backgroundColor: theme.positive, alignSelf: "flex-start" }]}>
              <Text style={{ color: settings.darkMode ? "#000" : "#FFFFFF", fontWeight: "700" }}>{settings.darkMode ? "Mudar para Claro" : "Mudar para Escuro"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onLogout} style={[styles.saveBtn, { backgroundColor: '#ff6b6b', alignSelf: "flex-start", marginTop: 8 }]}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Sair</Text>
            </TouchableOpacity>
            <Text style={{ color: theme.muted, marginTop: 12 }}>Dados salvos localmente por usuário.</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer theme={settings.darkMode ? DarkTheme : DefaultTheme}>
      <StatusBar barStyle={settings.darkMode ? "light-content" : "dark-content"} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: { height: 62, paddingBottom: Platform.OS === "ios" ? 10 : 6 },
          tabBarIcon: ({ color, size }) => {
            let icon = "home";
            if (route.name === "Dashboard") icon = "home";
            if (route.name === "Transactions") icon = "list";
            if (route.name === "Categories") icon = "albums";
            if (route.name === "Goals") icon = "flag";
            if (route.name === "Settings") icon = "settings";
            return <Ionicons name={icon} size={22} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Dashboard" component={HomeScreen} />
        <Tab.Screen name="Transactions" component={TransactionsScreen} />
        <Tab.Screen name="Categories" component={CategoriesScreen} />
        <Tab.Screen name="Goals" component={GoalsScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// Simple theme tokens
const THEMES = {
  dark: {
    bg: "#000000",
    surface: "#0b1220",
    text: "#FFFFFF",
    muted: "#9CA3AF",
    positive: "#1DB954",
    negative: "#FF9F1C",
    danger: "#ff6b6b",
  },
  light: {
    bg: "#F8FAFC",
    surface: "#FFFFFF",
    text: "#0F172A",
    muted: "#64748B",
    positive: "#0F9D58",
    negative: "#F59E0B",
    danger: "#DC2626",
  },
};

// styles
const styles = StyleSheet.create({
  safe: { flex: 1, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
  container: { padding: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  h1: { fontSize: 22, fontWeight: "800" },
  h2: { fontSize: 18, fontWeight: "800", marginBottom: 8 },
  card: { borderRadius: 12, padding: 12, marginBottom: 12 },
  labelSmall: { fontSize: 12 },
  balance: { fontSize: 28, fontWeight: "800" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginTop: 12 },
  chartCard: { borderRadius: 12, padding: 8 },
  txRow: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 10 },
  txIcon: { width: 44, height: 44, borderRadius: 8 },
  txAmount: { fontWeight: "700" },
  input: { padding: 12, borderRadius: 8, marginBottom: 8, backgroundColor: '#111', color: '#fff' },
  pill: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, flexDirection: "row", alignItems: "center", marginRight: 8, backgroundColor: "#111827" },
  saveBtn: { padding: 12, borderRadius: 12, alignItems: "center", marginTop: 8 },
  typeBtn: { padding: 10, borderRadius: 8, backgroundColor: "#0b1220", marginRight: 8 },
  smallBtn: { padding: 8, borderRadius: 8, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  categoryRow: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 10 },
  iconSquare: { width: 44, height: 44, borderRadius: 8 },
  goalRow: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 10 },
});

// modal styles
const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  box: { width: Math.min(640, SCREEN.width - 48), padding: 16, borderRadius: 12 },
  btn: { padding: 10, borderRadius: 8, alignItems: "center", justifyContent: "center" },
});

// ROOT APP — Handles Login State
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    (async () => {
      const user = await AsyncStorage.getItem(STORAGE.CURRENT_USER);
      if (user) setCurrentUser(user);
    })();
  }, []);

  function handleLogin(email) {
    setCurrentUser(email);
  }

  function handleLogout() {
    AsyncStorage.removeItem(STORAGE.CURRENT_USER);
    setCurrentUser(null);
  }

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <MainApp currentUser={currentUser} onLogout={handleLogout} />;
}