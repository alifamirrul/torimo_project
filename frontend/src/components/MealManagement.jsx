// 食事管理（検索/登録/履歴）
import { useState, useEffect, useRef, useCallback } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Search, X, Loader2, Sparkles, TrendingUp, Award, AlertTriangle, Pencil, Trash2, Save, ScanLine } from 'lucide-react';
import Progress from './ui/Progress';
import CircularStat from './ui/CircularStat';
import { useAuth } from '../hooks/useAuth.js';
import BarcodeScannerModal from './BarcodeScannerModal.jsx';

// APIのベースURLを決める
function resolveApiBase() {
  const envBase = import.meta.env.VITE_API_BASE;
  if (envBase) {
    return envBase.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    if (port && port !== '8000' && port !== '80' && port !== '443') {
      // Assume backend stays on 8000 when Vite dev server (5173) or any other port is used
      return `${protocol}//${hostname}:8000`;
    }
    return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
  }
  return 'http://127.0.0.1:8000';
}

// APIのベースURL
const API_BASE = resolveApiBase();
// 1食あたりの高マクロ基準
const MACRO_THRESHOLDS = { protein: 25, fat: 20, carbs: 45 }; // 1食あたりの高マクロ基準
const OPEN_FOOD_FACTS_ENDPOINT = 'https://world.openfoodfacts.org/api/v2/product';

// 数値に変換（失敗時は0）
const numberOrZero = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

// サービングサイズの文字列から数値を取り出す
const parseServingSize = (text) => {
  if (!text || typeof text !== 'string') return null;
  const match = text.replace(/,/g, '.').match(/([0-9]+(?:\.[0-9]+)?)\s*(g|ml|mL|グラム|ミリリットル)?/i);
  if (!match) return null;
  const value = parseFloat(match[1]);
  if (!Number.isFinite(value)) return null;
  return value;
};

// バーコード取得データをフォーム値に変換する
const buildBarcodeFormValues = (macrosPer100, grams) => {
  const safeGrams = grams && grams > 0 ? grams : 100;
  const ratio = safeGrams / 100;
  return {
    calories: Math.round(Math.max(0, macrosPer100.calories * ratio)).toString(),
    protein: (Math.max(0, macrosPer100.protein * ratio)).toFixed(1),
    fat: (Math.max(0, macrosPer100.fat * ratio)).toFixed(1),
    carbs: (Math.max(0, macrosPer100.carbs * ratio)).toFixed(1),
  };
};

// 食事管理画面
export default function MealManagement() {
  // 認証トークン取得
  const { getAccessToken } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const searchDebounce = useRef(null);
  
  const [quantity, setQuantity] = useState('100');
  const [category, setCategory] = useState('breakfast');
  const [saving, setSaving] = useState(false);
  // --- 入力モード管理（単品／一括） ---
  const [addMode, setAddMode] = useState('single');
  const [multiInput, setMultiInput] = useState('');
  const [multiItems, setMultiItems] = useState([]); // { line, name, quantity, unit, macros, error }
  const [multiParsing, setMultiParsing] = useState(false);
  // --- Category filtering ---
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | breakfast | lunch | dinner | snack
  const [macroFilter, setMacroFilter] = useState(''); // '', 'protein', 'fat', 'carbs'
  // --- Inline edit/delete states ---
  const [editingMealId, setEditingMealId] = useState(null);
  const [editingFields, setEditingFields] = useState({ name: '', calories: '', protein: '', fat: '', carbs: '' });
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  // --- Barcode scanning states ---
  const [scannerOpen, setScannerOpen] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [barcodeStatus, setBarcodeStatus] = useState('idle');
  const [barcodeProduct, setBarcodeProduct] = useState(null);
  const [barcodeServing, setBarcodeServing] = useState('100');
  const [barcodeForm, setBarcodeForm] = useState({ name: '', calories: '0', protein: '0', fat: '0', carbs: '0' });
  const [barcodeTouched, setBarcodeTouched] = useState(false);
  const [barcodeError, setBarcodeError] = useState('');
  const [barcodeSaving, setBarcodeSaving] = useState(false);
  const [barcodeSuccess, setBarcodeSuccess] = useState('');

  // --- 1日の目標値（kcal / マクロ） ---
  const goals = {
    calories: 2400,
    protein: 150,
    fat: 80,
    carbs: 300,
  };

  const totals = meals.reduce((acc, meal) => ({
    calories: acc.calories + (meal.calories || 0),
    protein: acc.protein + (meal.protein || 0),
    fat: acc.fat + (meal.fat || 0),
    carbs: acc.carbs + (meal.carbs || 0),
  }), { calories: 0, protein: 0, fat: 0, carbs: 0 });

  // --- Meal Evaluation Logic ---
  function evaluateMeal(meal){
    const pCal = (meal.protein || 0) * 4
    const fCal = (meal.fat || 0) * 9
    const cCal = (meal.carbs || 0) * 4
    const total = pCal + fCal + cCal
    if(total <= 0){
      return { score: 0, tags: ['情報不足'], percents: { protein:0, fat:0, carbs:0 } }
    }
    const percents = {
      protein: Math.round((pCal/total)*100),
      fat: Math.round((fCal/total)*100),
      carbs: Math.round((cCal/total)*100)
    }
    // Target macro ratio roughly P30/F25/C45
    const target = { protein:30, fat:25, carbs:45 }
    const diff = Math.abs(percents.protein-target.protein) + Math.abs(percents.fat-target.fat) + Math.abs(percents.carbs-target.carbs)
    // Simple score: 100 - diff weighted
    let rawScore = Math.max(0, 100 - diff * 1.2)
    rawScore = Math.round(rawScore)
    const tags = []
    if(percents.protein >= 35) tags.push('高タンパク')
    if(percents.fat >= 40) tags.push('脂質多め')
    if(percents.carbs >= 60) tags.push('炭水化物多め')
    if(tags.length === 0){
      if(rawScore >= 70) tags.push('バランス良好')
      else if(rawScore >= 50) tags.push('やや偏り')
      else tags.push('改善推奨')
    }
    return { score: rawScore, tags, percents }
  }

  function evaluateDay(){
    if(meals.length === 0) return { dayScore:0, message:'記録がありません', status:'empty' }
    // Aggregate macro percentages vs goal
    const goalCal = goals.calories
    const dayCal = totals.calories
    const pctCal = Math.min(100, Math.round((dayCal/goalCal)*100))
    // Macro distribution score based on closeness to goals proportionally
    const pPctGoal = goals.protein, fPctGoal = goals.fat, cPctGoal = goals.carbs
    const diff = Math.abs(totals.protein - pPctGoal) + Math.abs(totals.fat - fPctGoal) + Math.abs(totals.carbs - cPctGoal)
    let macroBalanceScore = Math.max(0, 100 - diff)
    macroBalanceScore = Math.round(macroBalanceScore)
    // Combined day score (weight calories progress 40%, macro balance 60%)
    const dayScore = Math.round(pctCal * 0.4 + macroBalanceScore * 0.6)
    let message, status
    if(dayScore >= 75){ message='良い栄養バランスです'; status='good' }
    else if(dayScore >= 55){ message='概ね良好、微調整可能'; status='ok' }
    else { message='改善が必要です'; status='poor' }
    return { dayScore, message, status, pctCal, macroBalanceScore }
  }
  const dayEval = evaluateDay()

  // Per-category macro totals
  const categoryTotals = (cat) => {
    const filtered = meals.filter(m => m.category === cat);
    return filtered.reduce((acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein || 0),
      fat: acc.fat + (meal.fat || 0),
      carbs: acc.carbs + (meal.carbs || 0),
      count: acc.count + 1,
    }), { calories:0, protein:0, fat:0, carbs:0, count:0 });
  };
  const categoryLabels = {
    breakfast: '朝食',
    lunch: '昼食',
    dinner: '夕食',
    snack: '間食'
  };
  const categoriesOrder = ['breakfast','lunch','dinner','snack'];
  const visibleMeals = categoryFilter === 'all' ? meals : meals.filter(m => m.category === categoryFilter);
  const macroFilteredMeals = macroFilter
    ? visibleMeals.filter(m => (m[macroFilter] || 0) >= MACRO_THRESHOLDS[macroFilter])
    : visibleMeals;
  const displayedMeals = macroFilteredMeals;

  // --- 日付変更時に食事履歴を再取得 ---
  const buildAuthHeaders = useCallback((withJson = false) => {
    const token = getAccessToken();
    if (!token) {
      throw new Error('ログイン情報を確認できません。再度サインインしてください。');
    }
    const headers = { Authorization: `Bearer ${token}` };
    if (withJson) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }, [getAccessToken]);

  useEffect(() => {
    fetchMeals();
  }, [selectedDate]);

  // --- 食事履歴をAPIから取得 ---
  const fetchMeals = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/meals/?date=${selectedDate}`, {
        headers: buildAuthHeaders(),
      });
      if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
          const body = await res.json();
          detail = body?.detail || body?.error || detail;
        } catch (_) {
          try {
            detail = await res.text();
          } catch (__err) {
            // ignore
          }
        }
        throw new Error(detail);
      }
      const data = await res.json();
      setMeals(data);
    } catch (err) {
      console.error(err);
      if (err.message.includes('Supabase authentication')) {
        setError('ログインセッションが無効です。再度サインインしてください。');
      } else {
        setError('食事履歴の取得に失敗しました: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // --- 食品検索をディレイさせながら実行 ---
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    
    searchDebounce.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/nutrition/search/?q=${encodeURIComponent(searchQuery)}&limit=10`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
    };
  }, [searchQuery]);

  // --- 食品候補を選択してフォームへ反映 ---
  const selectFood = (food) => {
    setSelectedFood(food);
    setSearchQuery(food.name);
    setSearchResults([]);
  };

  const fetchFoodByName = async (name) => {
    if (!name) return null;
    try {
      const res = await fetch(`${API_BASE}/api/nutrition/search/?q=${encodeURIComponent(name)}&limit=1`);
      if (!res.ok) return null;
      const data = await res.json();
      const food = Array.isArray(data) ? data[0] : (data.results ? data.results[0] : null);
      if (food) {
        setSelectedFood(food);
        return food;
      }
    } catch (err) {
      console.error('食材取得に失敗しました', err);
    }
    return null;
  };

  const resetBarcodeFlow = (keepSuccess = false) => {
    setBarcodeProduct(null);
    setBarcodeForm({ name: '', calories: '0', protein: '0', fat: '0', carbs: '0' });
    setBarcodeServing('100');
    setBarcodeTouched(false);
    setBarcodeError('');
    setBarcodeStatus('idle');
    setManualBarcode('');
    if (!keepSuccess) {
      setBarcodeSuccess('');
    }
  };

  const openScanner = () => {
    resetBarcodeFlow();
    setScannerOpen(true);
  };

  const handleBarcodeDetected = (code) => {
    setScannerOpen(false);
    lookupBarcode(code);
  };

  const lookupBarcode = async (code) => {
    const trimmed = (code || '').trim();
    if (!trimmed) {
      setBarcodeError('バーコードを入力してください');
      setBarcodeStatus('error');
      return;
    }
    setBarcodeStatus('loading');
    setBarcodeError('');
    setBarcodeSuccess('');
    try {
      const res = await fetch(`${OPEN_FOOD_FACTS_ENDPOINT}/${encodeURIComponent(trimmed)}.json`);
      if (!res.ok) {
        throw new Error('Open Food Facts APIに接続できませんでした');
      }
      const json = await res.json();
      if (json.status !== 1 || !json.product) {
        throw new Error('該当する商品が見つかりませんでした');
      }
      const product = json.product || {};
      const nutriments = product.nutriments || {};
      const macrosPer100 = {
        calories: numberOrZero(nutriments['energy-kcal_100g'] ?? nutriments['energy-kcal_100ml']),
        protein: numberOrZero(nutriments['proteins_100g'] ?? nutriments['proteins_100ml']),
        fat: numberOrZero(nutriments['fat_100g'] ?? nutriments['fat_100ml']),
        carbs: numberOrZero(nutriments['carbohydrates_100g'] ?? nutriments['carbohydrates_100ml']),
      };
      const name = product.product_name || product.generic_name || product.brands || '不明な商品';
      const brand = product.brands || '';
      const servingGuess = parseServingSize(product.serving_size) || parseServingSize(product.serving_quantity) || 100;
      setBarcodeProduct({
        barcode: trimmed,
        name,
        brand,
        image: product.image_front_thumb_url || product.image_front_small_url || null,
        macrosPer100,
      });
      setManualBarcode(trimmed);
      setBarcodeServing(String(servingGuess));
      setBarcodeTouched(false);
      setBarcodeForm({ name, ...buildBarcodeFormValues(macrosPer100, servingGuess) });
      setBarcodeStatus('result');
      if (!macrosPer100.calories && !macrosPer100.protein && !macrosPer100.fat && !macrosPer100.carbs) {
        setBarcodeError('栄養情報が見つかりませんでした。数値を手動で入力してください。');
      }
    } catch (err) {
      console.error(err);
      setBarcodeStatus('error');
      setBarcodeError(err.message || 'バーコードの解析に失敗しました');
    }
  };

  const handleManualBarcodeLookup = () => {
    lookupBarcode(manualBarcode);
  };

  const handleBarcodeFieldChange = (field, value) => {
    setBarcodeTouched(true);
    setBarcodeForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBarcodeServingChange = (value) => {
    setBarcodeServing(value);
    if (!barcodeTouched && barcodeProduct) {
      const nextValues = buildBarcodeFormValues(barcodeProduct.macrosPer100, parseFloat(value));
      setBarcodeForm((prev) => ({ ...prev, ...nextValues }));
    }
  };

  const handleSkipScannedItem = () => {
    resetBarcodeFlow();
    setScannerOpen(true);
  };

  const handleSaveBarcodeMeal = async () => {
    if (!barcodeProduct) return;
    const payload = {
      barcode: barcodeProduct.barcode,
      name: barcodeForm.name.trim() || barcodeProduct.name,
      calories: parseInt(barcodeForm.calories, 10) || 0,
      protein: parseFloat(barcodeForm.protein) || 0,
      fat: parseFloat(barcodeForm.fat) || 0,
      carbs: parseFloat(barcodeForm.carbs) || 0,
      category,
      consumed_at: selectedDate,
      serving_grams: parseFloat(barcodeServing) || null,
    };

    setBarcodeSaving(true);
    setError('');
    setBarcodeSuccess('');
    try {
      const res = await fetch(`${API_BASE}/api/meals/barcode/`, {
        method: 'POST',
        headers: buildAuthHeaders(true),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let detail = '保存に失敗しました';
        try {
          const body = await res.json();
          detail = body?.detail || body?.error || detail;
        } catch (jsonErr) {
          console.error(jsonErr);
        }
        throw new Error(detail);
      }
      let savedMeal = null;
      try {
        const body = await res.json();
        savedMeal = Array.isArray(body) ? body[0] : body;
      } catch (jsonErr) {
        console.error('保存結果の解析に失敗しました', jsonErr);
      }
      if (savedMeal && typeof savedMeal.consumed_at === 'string' && savedMeal.consumed_at.startsWith(selectedDate)) {
        setMeals((prev) => {
          const filtered = savedMeal.id ? prev.filter((meal) => meal.id !== savedMeal.id) : prev;
          return [savedMeal, ...filtered];
        });
      }
      resetBarcodeFlow(true);
      const successName = savedMeal?.name || payload.name;
      setBarcodeSuccess(`${successName} を食事履歴に追加しました`);
      await fetchMeals();
    } catch (err) {
      console.error(err);
      setError(err.message || '保存に失敗しました');
    } finally {
      setBarcodeSaving(false);
    }
  };

  useEffect(() => {
    if (!barcodeSuccess) return;
    const timer = setTimeout(() => setBarcodeSuccess(''), 4000);
    return () => clearTimeout(timer);
  }, [barcodeSuccess]);

  // --- 単品入力を保存 ---
  const handleSaveMeal = async () => {
    let food = selectedFood;
    if (!food) {
      const fallback = await fetchFoodByName(searchQuery.trim());
      if (!fallback) {
        setError('入力された食品が見つかりませんでした');
        return;
      }
      food = fallback;
      setError('');
    }

    setSaving(true);
    setError('');
    
    try {
      const ratio = parseFloat(quantity || '0') / 100;
      const payload = {
        name: food.name,
        calories: Math.round(food.calories * ratio),
        protein: parseFloat((food.protein * ratio).toFixed(1)),
        fat: parseFloat((food.fat * ratio).toFixed(1)),
        carbs: parseFloat((food.carbs * ratio).toFixed(1)),
        category,
        consumed_at: selectedDate,
      };

      const res = await fetch(`${API_BASE}/api/meals/`, {
        method: 'POST',
        headers: buildAuthHeaders(true),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let detail = '保存に失敗しました';
        try {
          const body = await res.json();
          detail = body?.detail || body?.error || detail;
        } catch (jsonErr) {
          try {
            detail = await res.text();
          } catch (_) {
            // ignore
          }
        }
        throw new Error(detail || '保存に失敗しました');
      }

      setShowAddModal(false);
      setSearchQuery('');
      setSelectedFood(null);
      setQuantity('100');
      await fetchMeals();
    } catch (err) {
      setError(err.message || '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  // --- 日付ナビゲーション ---
  const changeDate = (days) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  // --- 一括入力欄を自動解析して候補を作成 ---
  useEffect(() => {
    if (addMode !== 'bulk') return; // only parse in bulk mode
    const handler = setTimeout(async () => {
      const text = multiInput.trim();
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length);
      if (!lines.length) { setMultiItems([]); return; }
      setMultiParsing(true);
      const parsed = await Promise.all(lines.map(async (line) => {
        const match = line.match(/(.+?)\s+(\d+(?:\.\d+)?)\s*(g|グラム|ml|mL|ミリリットル)?$/i);
        let name, qty, unit;
        if (match) {
          name = match[1].trim();
          qty = parseFloat(match[2]);
          unit = (match[3] || 'g').toLowerCase();
        } else {
          name = line.trim();
          qty = 100;
          unit = 'g';
        }
        try {
          const res = await fetch(`${API_BASE}/api/nutrition/search/?q=${encodeURIComponent(name)}&limit=1`);
          if (!res.ok) throw new Error('検索失敗');
          const data = await res.json();
          const food = Array.isArray(data) ? data[0] : (data.results ? data.results[0] : null);
          if (!food) return { line, name, quantity: qty, unit, macros: null, error: '食品が見つかりません' };
          const factor = qty / 100; // per 100g/ml basis
          const macros = {
            calories: Math.round(food.calories * factor),
            protein: parseFloat((food.protein * factor).toFixed(1)),
            fat: parseFloat((food.fat * factor).toFixed(1)),
            carbs: parseFloat((food.carbs * factor).toFixed(1)),
          };
          return { line, name: food.name, quantity: qty, unit, macros, error: null };
        } catch (e) {
          return { line, name, quantity: qty, unit, macros: null, error: e.message };
        }
      }));
      setMultiItems(parsed);
      setMultiParsing(false);
    }, 450); // debounce
    return () => clearTimeout(handler);
  }, [multiInput, addMode]);

  // --- 一括登録の共通POST処理 ---
  const bulkPostMeals = async (items) => {
    if (!items || !items.length) return;
    setSaving(true);
    try {
      for (const item of items) {
        const payload = {
          name: item.name,
          calories: item.macros.calories,
          protein: item.macros.protein,
          fat: item.macros.fat,
          carbs: item.macros.carbs,
          category,
          consumed_at: selectedDate,
        };
        const res = await fetch(`${API_BASE}/api/meals/`, {
          method: 'POST',
          headers: buildAuthHeaders(true),
          body: JSON.stringify(payload),
        });
        if (!res.ok) console.error('投稿失敗', item.name);
      }
      await fetchMeals();
      setShowAddModal(false);
      // reset mode-specific states
      setMultiInput('');
      setMultiItems([]);
      setAddMode('single');
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // --- 一括入力欄から登録ボタンを押下 ---
  const bulkAddMeals = async () => {
    const valid = multiItems.filter(i => !i.error && i.macros);
    if (!valid.length) return;
    await bulkPostMeals(valid);
  };

  // --- 既存レコードのインライン編集開始 ---
  const startEdit = (meal) => {
    setEditingMealId(meal.id);
    setEditingFields({
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      fat: meal.fat,
      carbs: meal.carbs,
    });
  };
  // --- 編集キャンセル ---
  const cancelEdit = () => {
    setEditingMealId(null);
    setEditingFields({ name: '', calories: '', protein: '', fat: '', carbs: '' });
  };
  const changeField = (field, value) => {
    setEditingFields(prev => ({ ...prev, [field]: value }));
  };
  // --- 編集値をAPIへ保存 ---
  const saveEdit = async () => {
    if (!editingMealId) return;
    setUpdating(true);
    try {
      const payload = {
        name: editingFields.name,
        calories: parseInt(editingFields.calories, 10) || 0,
        protein: parseFloat(editingFields.protein) || 0,
        fat: parseFloat(editingFields.fat) || 0,
        carbs: parseFloat(editingFields.carbs) || 0,
      };
      const res = await fetch(`${API_BASE}/api/meals/${editingMealId}/`, {
        method: 'PATCH',
        headers: buildAuthHeaders(true),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('更新失敗');
      await fetchMeals();
      cancelEdit();
    } catch (e) {
      console.error(e);
      setError('更新に失敗しました');
    } finally {
      setUpdating(false);
    }
  };
  // --- レコード削除 ---
  const deleteMeal = async (mealId) => {
    if (!mealId) return;
    setDeletingId(mealId);
    try {
      const res = await fetch(`${API_BASE}/api/meals/${mealId}/`, {
        method: 'DELETE',
        headers: buildAuthHeaders(),
      });
      if (!res.ok && res.status !== 204) throw new Error('削除失敗');
      await fetchMeals();
    } catch (e) {
      console.error(e);
      setError('削除に失敗しました');
    } finally {
      setDeletingId(null);
    }
  };

  // --- YYYY-MM-DDを日本語表記に変換 ---
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    return `${month}月${day}日 (${weekday})`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faf9] to-[#e8f5ec] dark:from-zinc-950 dark:to-zinc-950 pb-20 transition-colors">
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-zinc-800 transition-colors">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold text-[#34C759] dark:text-[#00ff41] transition-colors">
              食事管理
            </h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#34C759] dark:bg-[#00ff41] hover:bg-[#2fb350] dark:hover:bg-[#00cc33] text-white dark:text-zinc-950 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              <Plus size={20} />
              <span className="font-medium">追加</span>
            </button>
          </div>
          
          <div className="flex items-center justify-between bg-gray-50 dark:bg-zinc-800 rounded-2xl p-2 transition-colors">
            <button
              onClick={() => changeDate(-1)}
              className="p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-xl transition-colors text-gray-600 dark:text-zinc-300"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2 font-medium text-gray-700 dark:text-white transition-colors">
              <CalendarDays size={18} />
              {formatDate(selectedDate)}
            </div>
            <button
              onClick={() => changeDate(1)}
              className="p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-xl transition-colors text-gray-600 dark:text-zinc-300"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Macro Summary Redesigned (Circular stats) */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-zinc-800 animate-fadeIn transition-colors">
          <div className="text-gray-900 dark:text-white font-semibold mb-4 transition-colors">今日の栄養バランス</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 justify-items-center">
            <CircularStat label="カロリー" value={Math.round(totals.calories)} goal={goals.calories} unit="kcal" color="#22c55e" />
            <CircularStat label="タンパク質" value={Math.round(totals.protein)} goal={goals.protein} unit="g" color="#fb923c" />
            <CircularStat label="脂質" value={Math.round(totals.fat)} goal={goals.fat} unit="g" color="#facc15" />
            <CircularStat label="炭水化物" value={Math.round(totals.carbs)} goal={goals.carbs} unit="g" color="#60a5fa" />
          </div>
          {/* Category filter tabs */}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${categoryFilter==='all' ? 'bg-[#34C759] dark:bg-[#00ff41] text-white dark:text-zinc-950 shadow' : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'}`}
            >全て</button>
            {categoriesOrder.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${categoryFilter===cat ? 'bg-[#34C759] dark:bg-[#00ff41] text-white dark:text-zinc-950 shadow' : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'}`}
              >{categoryLabels[cat]}</button>
            ))}
          </div>
          {/* Macro highlight filter */}
          <div className="mt-4">
            <div className="text-xs text-gray-500 dark:text-zinc-400 mb-2 transition-colors">マクロハイライト (基準値以上のみ表示)</div>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'protein', label: 'Protein', sub: '高タンパク' },
                { key: 'fat', label: '脂質', sub: '脂質リッチ' },
                { key: 'carbs', label: '炭水化物', sub: '炭水化物' },
              ].map(btn => (
                <button
                  key={btn.key}
                  onClick={() => setMacroFilter(prev => prev === btn.key ? '' : btn.key)}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-colors ${macroFilter===btn.key ? 'bg-[#34C759] dark:bg-[#00ff41] text-white dark:text-zinc-950 border-[#34C759] dark:border-[#00ff41] shadow' : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300'}`}
                >
                  <div>{btn.label}</div>
                  <div className="text-[10px] opacity-80">{btn.sub} ≥ {MACRO_THRESHOLDS[btn.key]}g</div>
                </button>
              ))}
              {macroFilter && (
                <button
                  onClick={() => setMacroFilter('')}
                  className="px-3 py-2 rounded-xl text-sm font-semibold border border-gray-300 dark:border-zinc-600 text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >解除</button>
              )}
            </div>
          </div>
          {categoryFilter !== 'all' && (() => {
            const ct = categoryTotals(categoryFilter);
            const pctCal = Math.min(100, Math.round((ct.calories / goals.calories) * 100));
            return (
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-800 dark:to-zinc-800/80 border border-gray-200 dark:border-zinc-700 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold text-gray-700 dark:text-white transition-colors">{categoryLabels[categoryFilter]} 合計 (件数 {ct.count})</div>
                  <div className="text-xs text-gray-500 dark:text-zinc-400 transition-colors">{pctCal}% of daily kcal</div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-white dark:bg-zinc-900 rounded-lg p-2 transition-colors">
                    <div className="text-[10px] text-gray-500 dark:text-zinc-400">kcal</div>
                    <div className="font-bold text-gray-900 dark:text-white">{ct.calories}</div>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 rounded-lg p-2 transition-colors">
                    <div className="text-[10px] text-gray-500 dark:text-zinc-400">P(g)</div>
                    <div className="font-bold text-orange-600 dark:text-orange-400">{ct.protein.toFixed(1)}</div>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 rounded-lg p-2 transition-colors">
                    <div className="text-[10px] text-gray-500 dark:text-zinc-400">F(g)</div>
                    <div className="font-bold text-yellow-600 dark:text-yellow-400">{ct.fat.toFixed(1)}</div>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 rounded-lg p-2 transition-colors">
                    <div className="text-[10px] text-gray-500 dark:text-zinc-400">C(g)</div>
                    <div className="font-bold text-[#34C759] dark:text-[#00ff41]">{ct.carbs.toFixed(1)}</div>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
        {/* Daily Evaluation Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-zinc-800 flex items-start gap-4 animate-fadeIn transition-colors">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#34C759] to-[#30D158] dark:from-[#00ff41] dark:to-[#00cc33] text-white dark:text-zinc-950 shadow-inner">
            {dayEval.status === 'good' && <Award size={28} />}
            {dayEval.status === 'ok' && <TrendingUp size={28} />}
            {dayEval.status === 'poor' && <AlertTriangle size={28} />}
            {dayEval.status === 'empty' && <Sparkles size={28} className="text-yellow-300 dark:text-yellow-400" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">今日の評価</h2>
              <div className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 transition-colors">スコア {dayEval.dayScore}</div>
            </div>
            <p className="text-sm text-gray-600 dark:text-zinc-400 mb-2 transition-colors">{dayEval.message}</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-2 transition-colors">
                <div className="font-medium text-gray-700 dark:text-zinc-300 mb-1 transition-colors">カロリー進捗</div>
                <Progress value={dayEval.pctCal} className="h-2 mb-1" />
                <div className="text-[10px] text-gray-500 dark:text-zinc-500">{totals.calories} / {goals.calories} kcal ({dayEval.pctCal}%)</div>
              </div>
              <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-2 transition-colors">
                <div className="font-medium text-gray-700 dark:text-zinc-300 mb-1 transition-colors">マクロバランス</div>
                <Progress value={dayEval.macroBalanceScore} className="h-2 mb-1" />
                <div className="text-[10px] text-gray-500 dark:text-zinc-500">P {totals.protein}/{goals.protein} F {totals.fat}/{goals.fat} C {totals.carbs}/{goals.carbs}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-zinc-800 animate-fadeIn transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">バーコードで素早く記録</div>
              <p className="text-sm text-gray-500 dark:text-zinc-400 transition-colors">カメラで読み取るだけでP / F / Cが自動入力されます</p>
            </div>
            <button
              type="button"
              onClick={openScanner}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#34C759] dark:bg-[#00ff41] hover:bg-[#2fb350] dark:hover:bg-[#00cc33] text-white dark:text-zinc-950 font-semibold shadow hover:shadow-lg transition-all"
            >
              <ScanLine size={18} />
              カメラを起動
            </button>
          </div>
          <div
            className="mt-4 border-2 border-dashed border-[#34C759]/40 dark:border-[#00ff41]/40 rounded-3xl p-6 text-center text-gray-600 dark:text-zinc-300 cursor-pointer hover:bg-[#34C759]/5 dark:hover:bg-[#00ff41]/10 transition-colors"
            onClick={openScanner}
          >
            <ScanLine size={40} className="mx-auto text-[#34C759] dark:text-[#00ff41]" />
            <div className="mt-2 font-semibold text-gray-700 dark:text-white transition-colors">バーコードスキャン</div>
            <p className="text-xs text-gray-500 dark:text-zinc-400">商品のバーコードをスキャンしてPFCデータを確認</p>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              placeholder="バーコード番号を手入力"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-zinc-500 transition-colors"
            />
            <button
              type="button"
              onClick={handleManualBarcodeLookup}
              className="px-4 py-3 rounded-xl bg-gray-900 dark:bg-zinc-700 text-white text-sm font-semibold hover:bg-gray-700 dark:hover:bg-zinc-600 transition-colors"
            >検索</button>
          </div>
          {barcodeStatus === 'loading' && (
            <div className="mt-4 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <Loader2 className="animate-spin" size={20} />
              栄養情報を取得しています...
            </div>
          )}
          {barcodeStatus === 'error' && barcodeError && (
            <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-sm text-red-600 dark:text-red-300">
              {barcodeError}
            </div>
          )}
          {barcodeSuccess && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-sm text-emerald-700 dark:text-emerald-300">
              {barcodeSuccess}
            </div>
          )}
          {barcodeStatus === 'result' && barcodeProduct && (
            <div className="mt-5 space-y-4 border border-[#34C759]/30 dark:border-[#00ff41]/30 rounded-2xl p-4 bg-[#34C759]/5 dark:bg-[#00ff41]/10 transition-colors">
              <div className="flex items-center gap-3">
                {barcodeProduct.image ? (
                  <img src={barcodeProduct.image} alt={barcodeProduct.name} className="w-16 h-16 rounded-xl object-cover border border-white dark:border-zinc-700 shadow" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-white/60 dark:bg-zinc-800 flex items-center justify-center text-gray-400 dark:text-zinc-500">N/A</div>
                )}
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white transition-colors">{barcodeProduct.name}</div>
                  <div className="text-xs text-gray-500 dark:text-zinc-400">{barcodeProduct.brand || 'ブランド情報なし'} / {barcodeProduct.barcode}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400">食品名</label>
                  <input
                    type="text"
                    value={barcodeForm.name}
                    onChange={(e) => handleBarcodeFieldChange('name', e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400">摂取量 (g / ml)</label>
                  <input
                    type="number"
                    value={barcodeServing}
                    onChange={(e) => handleBarcodeServingChange(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                    min="1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { key: 'calories', label: 'kcal' },
                  { key: 'protein', label: 'P (g)' },
                  { key: 'fat', label: 'F (g)' },
                  { key: 'carbs', label: 'C (g)' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="text-xs text-slate-500 dark:text-slate-400">{field.label}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={barcodeForm[field.key]}
                      onChange={(e) => handleBarcodeFieldChange(field.key, e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                    />
                  </div>
                ))}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                保存先: {categoryLabels[category]} / 日付: {formatDate(selectedDate)}
                <span className="block text-[11px] text-emerald-600 dark:text-emerald-300 mt-1">保存すると食事履歴とSupabaseに即時反映されます</span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={handleSaveBarcodeMeal}
                  disabled={barcodeSaving}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 text-white font-semibold shadow hover:bg-emerald-600 disabled:opacity-50"
                >
                  {barcodeSaving ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                  食事履歴に追加
                </button>
                <button
                  type="button"
                  onClick={handleSkipScannedItem}
                  className="px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 text-sm text-slate-600 dark:text-slate-200"
                >保存せずにスキャンを続ける</button>
              </div>
            </div>
          )}
        </div>
        {/* Old summary grid replaced by circular stats above */}

        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          ) : displayedMeals.length === 0 ? (
            <div className="text-center py-12 animate-fadeIn">
              <Sparkles className="mx-auto mb-3 text-slate-300" size={48} />
              <p className="text-slate-500">
                {macroFilter
                  ? `${categoryFilter==='all' ? '全ての食事' : categoryLabels[categoryFilter]} で基準(${MACRO_THRESHOLDS[macroFilter]}g)を超える記録がありません`
                  : categoryFilter==='all'
                    ? 'まだ食事が記録されていません'
                    : `${categoryLabels[categoryFilter]} の記録がありません`}
              </p>
            </div>
          ) : (
            displayedMeals.map((meal, idx) => (
              <div
                key={meal.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-md hover:shadow-lg border border-gray-100 dark:border-zinc-800 transition-all animate-slideUp"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {editingMealId === meal.id ? (
                  <div className="space-y-3 mb-3">
                    <div className="flex justify-between items-center">
                      <input
                        type="text"
                        value={editingFields.name}
                        onChange={(e)=>changeField('name', e.target.value)}
                        className="flex-1 mr-2 px-3 py-2 text-sm border rounded-lg bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-gray-700"
                      />
                      <button onClick={cancelEdit} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700"><X size={16} /></button>
                    </div>
                    <div className="grid grid-cols-5 gap-2 text-xs">
                      {['calories','protein','fat','carbs'].map(key => (
                        <div key={key} className="flex flex-col">
                          <label className="text-[10px] text-slate-500">{key==='calories'?'kcal':key}</label>
                          <input
                            type="number"
                            value={editingFields[key]}
                            onChange={(e)=>changeField(key, e.target.value)}
                            className="px-2 py-1 rounded border bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-700 text-[11px]"
                          />
                        </div>
                      ))}
                      <div className="flex items-end">
                        <button
                          onClick={saveEdit}
                          disabled={updating}
                          className="w-full px-2 py-2 bg-blue-600 text-white rounded text-[11px] disabled:opacity-50 flex items-center justify-center gap-1"
                        >{updating ? <Loader2 className="animate-spin" size={14}/> : <Save size={14}/>}保存</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-lg text-slate-800 dark:text-slate-100">{meal.name}</div>
                      {categoryFilter === 'all' && (
                        <div className="text-xs text-slate-500">{categoryLabels[meal.category] || meal.category}</div>
                      )}
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-right">
                        <div className="text-xl font-bold text-orange-500">{meal.calories}</div>
                        <div className="text-xs text-slate-500">kcal</div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => startEdit(meal)}
                          className="p-2 rounded-full bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 transition"
                          title="編集"
                        ><Pencil size={16} /></button>
                        <button
                          onClick={() => deleteMeal(meal.id)}
                          disabled={deletingId === meal.id}
                          className="p-2 rounded-full bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-800 transition disabled:opacity-50"
                          title="削除"
                        >{deletingId === meal.id ? <Loader2 className="animate-spin" size={16}/> : <Trash2 size={16} />}</button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center">
                    <div className="text-xs text-slate-600 dark:text-slate-400">P</div>
                    <div className="font-semibold text-blue-600 dark:text-blue-400">{meal.protein}g</div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2 text-center">
                    <div className="text-xs text-slate-600 dark:text-slate-400">F</div>
                    <div className="font-semibold text-yellow-600 dark:text-yellow-400">{meal.fat}g</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center">
                    <div className="text-xs text-slate-600 dark:text-slate-400">C</div>
                    <div className="font-semibold text-green-600 dark:text-green-400">{meal.carbs}g</div>
                  </div>
                </div>
                {(() => {
                  const evalData = evaluateMeal(meal)
                  return (
                    <div className="flex flex-wrap gap-2 items-center">
                      <div className="text-[11px] px-2 py-1 rounded-full bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-300">Score {evalData.score}</div>
                      {evalData.tags.map((t,i)=>(
                        <span key={i} className={
                          'text-[11px] px-2 py-1 rounded-full font-medium ' +
                          (t==='高タンパク' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                           t==='脂質多め' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' :
                           t==='炭水化物多め' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
                           t==='バランス良好' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                           t==='やや偏り' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' :
                           t==='改善推奨' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-slate-200 text-slate-700 dark:bg-gray-700 dark:text-gray-300')
                        }>{t}</span>
                      ))}
                    </div>
                  )
                })()}
              </div>
            ))
          )}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl animate-fadeIn">
            {error}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-fadeIn">
          <div
            className="bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slideUp border border-gray-100 dark:border-zinc-800 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between transition-colors">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">食事を追加</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSearchQuery('');
                  setSelectedFood(null);
                  setError('');
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-600 dark:text-zinc-300"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <div className="flex flex-wrap gap-2 mb-4 text-sm">
                  {[{ key: 'single', label: '単品入力' }, { key: 'bulk', label: '一括入力' }].map(btn => (
                    <button
                      key={btn.key}
                      onClick={() => setAddMode(btn.key)}
                      className={`px-3 py-2 rounded-lg font-medium transition-colors ${addMode === btn.key ? 'bg-[#34C759] dark:bg-[#00ff41] text-white dark:text-zinc-950 shadow' : 'bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-700'}`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
                {addMode === 'single' && (
                  <>
                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2 transition-colors">
                      食品を検索
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" size={20} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="食品名を入力..."
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 rounded-xl focus:ring-2 focus:ring-[#34C759] dark:focus:ring-[#00ff41] focus:border-transparent transition-all"
                      />
                      {searchLoading && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#34C759] dark:text-[#00ff41]" size={20} />
                      )}
                    </div>
                    {searchResults.length > 0 && (
                      <div className="mt-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden animate-scaleIn">
                        {searchResults.map((food, idx) => (
                          <button
                            key={idx}
                            onClick={() => selectFood(food)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors border-b border-gray-100 dark:border-zinc-700 last:border-0"
                          >
                            <div className="font-medium text-gray-900 dark:text-white">{food.name}</div>
                            <div className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                              {food.calories}kcal / P:{food.protein}g F:{food.fat}g C:{food.carbs}g ({food.per})
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {selectedFood && (
                      <div className="mt-3 p-4 bg-[#34C759]/10 dark:bg-[#00ff41]/10 rounded-xl border border-[#34C759]/20 dark:border-[#00ff41]/20 animate-scaleIn transition-colors">
                        <div className="font-semibold text-[#34C759] dark:text-[#00ff41] mb-2">{selectedFood.name}</div>
                        <div className="text-sm text-gray-600 dark:text-zinc-400">
                          {selectedFood.per}あたり: {selectedFood.calories}kcal / P:{selectedFood.protein}g F:{selectedFood.fat}g C:{selectedFood.carbs}g
                        </div>
                      </div>
                    )}
                  </>
                )}
                {addMode === 'bulk' && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-pre-line">
                      {`複数食品入力 (1行1食品)
例:
白米 150g
鶏胸肉 80g
味噌汁 120ml`}
                    </label>
                    <textarea
                      value={multiInput}
                      onChange={(e) => setMultiInput(e.target.value)}
                      placeholder="食品名 数量g (改行で複数)"
                      className="w-full h-40 px-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    {multiParsing && <div className="text-xs text-blue-600">解析中...</div>}
                    {multiItems.length > 0 && (
                      <div className="max-h-48 overflow-y-auto space-y-1 border border-slate-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-900">
                        {multiItems.map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-xs px-2 py-1 rounded bg-slate-50 dark:bg-gray-800">
                            <span className="truncate w-1/2" title={item.line}>{item.name} {item.quantity}{item.unit}</span>
                            {item.error ? (
                              <span className="text-red-600 dark:text-red-400">{item.error}</span>
                            ) : (
                              <span className="text-slate-600 dark:text-slate-300">P{item.macros.protein} F{item.macros.fat} C{item.macros.carbs} ({item.macros.calories}kcal)</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {addMode === 'single' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  量 (g)
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  min="1"
                />
              </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  カテゴリー
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['breakfast', 'lunch', 'dinner', 'snack'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-3 rounded-xl font-medium transition-all ${
                        category === cat
                          ? 'bg-[#34C759] dark:bg-[#00ff41] text-white dark:text-zinc-950 shadow-lg'
                          : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {cat === 'breakfast' && '朝食'}
                      {cat === 'lunch' && '昼食'}
                      {cat === 'dinner' && '夕食'}
                      {cat === 'snack' && '間食'}
                    </button>
                  ))}
                </div>
              </div>

              {addMode === 'single' && selectedFood && quantity && (
                <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 animate-scaleIn">
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">栄養情報 ({quantity}g)</div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { label: 'Cal', value: Math.round(selectedFood.calories * parseFloat(quantity) / 100), unit: '' },
                      { label: 'P', value: (selectedFood.protein * parseFloat(quantity) / 100).toFixed(1), unit: 'g' },
                      { label: 'F', value: (selectedFood.fat * parseFloat(quantity) / 100).toFixed(1), unit: 'g' },
                      { label: 'C', value: (selectedFood.carbs * parseFloat(quantity) / 100).toFixed(1), unit: 'g' },
                    ].map((item) => (
                      <div key={item.label} className="bg-white dark:bg-gray-800 rounded-lg p-2">
                        <div className="text-xs text-slate-500">{item.label}</div>
                        <div className="font-bold text-slate-800 dark:text-slate-100">{item.value}{item.unit}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm animate-fadeIn">
                  {error}
                </div>
              )}

              {addMode === 'single' && (
                <button
                  onClick={handleSaveMeal}
                  disabled={saving || (!selectedFood && !searchQuery.trim())}
                  className="w-full py-4 bg-[#34C759] dark:bg-[#00ff41] hover:bg-[#2fb350] dark:hover:bg-[#00cc33] text-white dark:text-zinc-950 font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      食事を追加
                    </>
                  )}
                </button>
              )}
              {addMode === 'bulk' && (
                <button
                  onClick={bulkAddMeals}
                  disabled={saving || multiParsing || !multiItems.some(i => !i.error)}
                  className="w-full py-4 bg-[#34C759] dark:bg-[#00ff41] hover:bg-[#2fb350] dark:hover:bg-[#00cc33] text-white dark:text-zinc-950 font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      一括追加 ({multiItems.filter(i=>!i.error && i.macros).length})
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {scannerOpen && (
        <BarcodeScannerModal
          onClose={() => setScannerOpen(false)}
          onDetected={handleBarcodeDetected}
        />
      )}
    </div>
  );
}
