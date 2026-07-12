import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Sliders, 
  Calendar, 
  Info, 
  RotateCcw, 
  Sparkles, 
  Snowflake, 
  Flame, 
  AlertTriangle,
  BookOpen,
  HelpCircle,
  Clock,
  Layers,
  Thermometer,
  ArrowRight
} from 'lucide-react';

// Standard 1/3-stop ISO list
const STANDARD_ISOS = [
  6, 8, 10, 12, 16, 20, 25, 32, 40, 50, 64, 80, 100, 125, 160, 200, 250, 320, 
  400, 500, 640, 800, 1000, 1250, 1600, 2000, 2500, 3200, 6400, 12800
];

// Presets for initial ISO
const ISO_PRESETS = [25, 50, 64, 100, 160, 200, 400, 800, 1600, 3200];

function App() {
  // Main states
  const [isoStart, setIsoStart] = useState(400);
  const [expireYear, setExpireYear] = useState(2016);
  const [currentYear, setCurrentYear] = useState(2026);
  const [deltaTManual, setDeltaTManual] = useState(10);
  const [useManualDeltaT, setUseManualDeltaT] = useState(false);
  const [kCoeff, setKCoeff] = useState(1.3);
  const [storage, setStorage] = useState('room'); // freezer, fridge, room, hot
  const [filmType, setFilmType] = useState('color_neg'); // bw, color_neg, slide
  const [isKManual, setIsKManual] = useState(false);

  // Derived Delta T (years in expiry)
  const calculatedDeltaT = Math.max(0, currentYear - expireYear);
  const deltaT = useManualDeltaT ? deltaTManual : calculatedDeltaT;

  // Function to get K recommendations
  const getKRecommendation = (iso) => {
    if (iso <= 64) {
      return { 
        min: 0.7, 
        max: 0.8, 
        default: 0.75, 
        desc: 'Сохраняется отлично (теряет меньше 1 стопа за 10 лет)',
        label: 'Низкая деградация'
      };
    } else if (iso > 64 && iso <= 250) {
      return { 
        min: 1.0, 
        max: 1.0, 
        default: 1.0, 
        desc: 'Классическая потеря (ровно 1 стоп за 10 лет)',
        label: 'Классическая потеря'
      };
    } else if (iso > 250 && iso <= 600) {
      return { 
        min: 1.2, 
        max: 1.4, 
        default: 1.3, 
        desc: 'Разрушается быстро (около 1.3 стопа за 10 лет)',
        label: 'Быстрое разрушение'
      };
    } else {
      return { 
        min: 1.8, 
        max: 2.0, 
        default: 1.9, 
        desc: 'Катастрофическая вуаль (до 2 стопов за 10 лет)',
        label: 'Катастрофическая вуаль'
      };
    }
  };

  const kRec = getKRecommendation(isoStart);

  // Auto update K coefficient if not manually modified
  useEffect(() => {
    if (!isKManual) {
      // Modify default K based on storage conditions & film type (optional but nice adjustments)
      let baseK = kRec.default;
      
      // We'll apply storage multipliers if user selects them
      let multiplier = 1.0;
      if (storage === 'freezer') multiplier = 0.2; // Frozen preserves film extremely well
      if (storage === 'fridge') multiplier = 0.5;   // Cold preserves
      if (storage === 'hot') multiplier = 1.6;      // Heat accelerates

      // Adjust based on film type (B&W degrades slower, slide film degrades normally but behaves terribly)
      let typeMult = 1.0;
      if (filmType === 'bw') typeMult = 0.8; // B&W is more stable

      const adjustedK = parseFloat((baseK * multiplier * typeMult).toFixed(2));
      setKCoeff(adjustedK);
    }
  }, [isoStart, storage, filmType, isKManual]);

  // Recalculate K if user resets manual override
  const handleResetK = () => {
    setIsKManual(false);
  };

  // Math: ISO_eff = ISO_start / 2^( (deltaT / 10) * K )
  const stopsLost = (deltaT / 10) * kCoeff;
  const reductionFactor = Math.pow(2, stopsLost);
  const rawIsoEff = isoStart / reductionFactor;
  const isoEff = Math.max(1, Math.round(rawIsoEff));

  // Find closest standard ISO
  const closestStandardIso = STANDARD_ISOS.reduce((prev, curr) => {
    return Math.abs(curr - rawIsoEff) < Math.abs(prev - rawIsoEff) ? curr : prev;
  });

  // Exposure recommendation text
  const getExposureRecommendation = () => {
    if (deltaT <= 0) {
      return 'Плёнка свежая! Экспонируйте как обычно по номиналу.';
    }

    const stopsFloat = stopsLost.toFixed(1);
    let advice = `Необходимо переэкспонировать плёнку примерно на ${stopsFloat} ${getStopsPlural(stopsLost)}. `;
    
    if (filmType === 'slide') {
      advice += '⚠️ Внимание: Слайдовая плёнка плохо переносит переэкспозицию и теряет цвета. Рекомендуется снимать близко к номиналу или использовать кросс-процесс.';
    } else if (filmType === 'bw') {
      advice += 'Ч/Б плёнка имеет хорошую широту. Допускается погрешность +/- 0.5 стопа.';
    } else {
      advice += 'Цветной негатив отлично переносит переэкспозицию. Округляйте в большую сторону.';
    }

    return advice;
  };

  function getStopsPlural(num) {
    const floor = Math.floor(num);
    if (floor === 1) return 'стоп';
    if (floor >= 2 && floor <= 4) return 'стопа';
    return 'стопов';
  }

  // Visual simulation of exposure
  // We want to simulate underexposed (box ISO), correct (calculated ISO), and overexposed
  const getSimulationStyle = (type) => {
    // Standard photo exposure offset simulation
    // standard: correct exposure is bright
    // underexposed: dark, contrasty
    if (type === 'underexposed') {
      // Simulates shooting expired film at BOX speed (without compensation)
      const diff = Math.min(3, stopsLost);
      const brightness = Math.max(25, 100 - (diff * 22));
      const contrast = 100 + (diff * 10);
      const saturate = Math.max(30, 100 - (diff * 15));
      return {
        filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) grayscale(${filmType === 'bw' ? '100%' : '0%'})`,
        transition: 'all 0.5s ease-in-out'
      };
    } else if (type === 'correct') {
      // Properly compensated shot (exposing at ISO_eff)
      // Colors are slightly shifted to reflect expired film aesthetic (grainy/vintage)
      return {
        filter: `brightness(100%) contrast(95%) saturate(${filmType === 'bw' ? '0%' : '105%'}) sepia(${filmType === 'bw' ? '10%' : '15%'})`,
        transition: 'all 0.5s ease-in-out'
      };
    } else {
      // Overexposed (too bright, washed out)
      return {
        filter: `brightness(140%) contrast(80%) saturate(${filmType === 'bw' ? '0%' : '80%'})`,
        transition: 'all 0.5s ease-in-out'
      };
    }
  };

  return (
    <div className="min-h-screen bg-[#111318] text-[#e3e4e6] font-sans antialiased selection:bg-amber-500 selection:text-black">
      {/* Header */}
      <header className="border-b border-[#222530] bg-[#161822]/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center liquid-glass-icon-amber glossy-glow">
              <Camera className="w-6 h-6 stroke-[2] text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                LutOldMeter
                <span className="text-xs font-normal px-2 py-0.5 bg-[#2a2d3d] text-amber-400 rounded-full border border-amber-500/20">
                  Expired Film Calc
                </span>
              </h1>
              <p className="text-xs text-[#9095a6] hidden sm:block">Калькулятор экспозиции для просроченной фотоплёнки</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 text-xs bg-[#222530] px-3 py-1.5 rounded-full border border-[#2e3344] text-[#a0a5b8]">
            <div className="w-5 h-5 rounded-full flex items-center justify-center liquid-glass-icon-amber">
              <Clock className="w-3 h-3 text-amber-300" />
            </div>
            <span>Текущий год в калькуляторе: <b>{currentYear}</b></span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Controls & Settings (7 cols on large screens) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Card 1: Film parameters */}
            <div className="bg-[#161822] border border-[#222530] rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
              
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center liquid-glass-icon-amber glossy-glow">
                  <Sliders className="w-5 h-5 text-amber-300" />
                </div>
                <h2 className="text-lg font-bold text-white">Параметры плёнки</h2>
              </div>

              <div className="space-y-6">
                {/* Initial ISO */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-[#c5c9d6] flex items-center gap-1.5">
                      Номинальная чувствительность (ISOисх)
                    </label>
                    <span className="text-xl font-bold text-amber-400">{isoStart} ISO</span>
                  </div>
                  
                  {/* Slider */}
                  <input 
                    type="range" 
                    min="12" 
                    max="3200" 
                    step="1"
                    value={isoStart} 
                    onChange={(e) => setIsoStart(Number(e.target.value))}
                    className="w-full h-2 bg-[#222530] rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 mb-3"
                  />

                  {/* ISO Presets */}
                  <div className="flex flex-wrap gap-1.5">
                    {ISO_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setIsoStart(preset)}
                        className={`text-xs px-2.5 py-1.5 rounded transition-all font-semibold ${
                          isoStart === preset 
                            ? 'bg-amber-500 text-[#111318] font-bold shadow-md' 
                            : 'bg-[#222530] text-[#a0a5b8] hover:bg-[#2b2f3e] hover:text-white'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <hr className="border-[#222530]" />

                {/* Expiration and delta T */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium text-[#c5c9d6] flex items-center gap-2">
                      <span className="w-7 h-7 rounded-md flex items-center justify-center liquid-glass-icon-amber">
                        <Calendar className="w-4 h-4 text-amber-300" />
                      </span>
                      Возраст просрочки (ΔT)
                    </label>
                    <div className="flex bg-[#222530] p-0.5 rounded-lg border border-[#2e3344] text-[11px]">
                      <button
                        onClick={() => setUseManualDeltaT(false)}
                        className={`px-2.5 py-1 rounded transition-all ${!useManualDeltaT ? 'bg-amber-500 text-black font-bold' : 'text-[#a0a5b8]'}`}
                      >
                        По годам
                      </button>
                      <button
                        onClick={() => setUseManualDeltaT(true)}
                        className={`px-2.5 py-1 rounded transition-all ${useManualDeltaT ? 'bg-amber-500 text-black font-bold' : 'text-[#a0a5b8]'}`}
                      >
                        Вручную (лет)
                      </button>
                    </div>
                  </div>

                  {!useManualDeltaT ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="block text-xs text-[#9095a6] mb-1">Год окончания срока</span>
                        <input
                          type="number"
                          min="1950"
                          max={currentYear}
                          value={expireYear}
                          onChange={(e) => setExpireYear(Number(e.target.value))}
                          className="w-full bg-[#222530] border border-[#2e3344] rounded-lg px-3 py-2 text-white font-semibold text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <span className="block text-xs text-[#9095a6] mb-1">Текущий год съёмки</span>
                        <input
                          type="number"
                          min={expireYear}
                          max="2100"
                          value={currentYear}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setCurrentYear(val);
                            if (val < expireYear) setExpireYear(val);
                          }}
                          className="w-full bg-[#222530] border border-[#2e3344] rounded-lg px-3 py-2 text-white font-semibold text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-[#9095a6]">Сколько лет просрочена плёнка</span>
                        <span className="text-sm font-bold text-amber-400">{deltaTManual} лет</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="70" 
                        step="1"
                        value={deltaTManual} 
                        onChange={(e) => setDeltaTManual(Number(e.target.value))}
                        className="w-full h-2 bg-[#222530] rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>
                  )}

                  {/* Calculated ΔT Badge */}
                  <div className="mt-3 flex items-center justify-between bg-[#1e212b] p-3 rounded-lg border border-[#2a2d3d] text-xs">
                    <span className="text-[#a0a5b8] flex items-center gap-2">
                      <span className="w-7 h-7 rounded-md flex items-center justify-center liquid-glass-icon-amber">
                        <Clock className="w-4 h-4 text-amber-300" />
                      </span>
                      Итоговый срок просрочки (ΔT):
                    </span>
                    <span className="font-bold text-white bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded text-sm">
                      {deltaT} {getStopsPlural(deltaT)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Degradation & Environmental factors */}
            <div className="bg-[#161822] border border-[#222530] rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center liquid-glass-icon-blue glossy-glow">
                    <Layers className="w-5 h-5 text-blue-300" />
                  </div>
                  <h2 className="text-lg font-bold text-white">Коэффициент & Условия</h2>
                </div>
                {isKManual && (
                  <button 
                    onClick={handleResetK} 
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20"
                  >
                    <RotateCcw className="w-3 h-3" /> Сбросить авто-К
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Degradation Coefficient Slider (K) */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium text-[#c5c9d6] flex items-center gap-1.5">
                      Коэффициент деградации (K)
                    </label>
                    <span className="text-base font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                      K = {kCoeff}
                    </span>
                  </div>
                  
                  <p className="text-xs text-[#9095a6] mb-3">
                    Рекомендуемый диапазон для {isoStart} ISO: <b className="text-white">{kRec.min} – {kRec.max}</b> ({kRec.label})
                  </p>

                  <input 
                    type="range" 
                    min="0.5" 
                    max="2.5" 
                    step="0.05"
                    value={kCoeff} 
                    onChange={(e) => {
                      setKCoeff(Number(e.target.value));
                      setIsKManual(true);
                    }}
                    className="w-full h-2 bg-[#222530] rounded-lg appearance-none cursor-pointer accent-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                  />

                  {/* K Guide Info */}
                  <div className="mt-2 text-xs text-[#9095a6] bg-[#1a1d29] p-3 rounded-lg border border-[#252838] leading-relaxed">
                    <span className="text-white font-semibold">Справочник деградации (от ISOисх):</span>
                    <ul className="mt-1.5 space-y-1 list-disc list-inside">
                      <li>до 64: <span className="text-[#a0a5b8]">K = 0.7 - 0.8 (Низкая)</span></li>
                      <li>100 - 200: <span className="text-[#a0a5b8]">K = 1.0 (Классическая)</span></li>
                      <li>400: <span className="text-[#a0a5b8]">K = 1.2 - 1.4 (Быстрая)</span></li>
                      <li>800+: <span className="text-[#a0a5b8]">K = 1.8 - 2.0 (Катастрофическая)</span></li>
                    </ul>
                  </div>
                </div>

                <hr className="border-[#222530]" />

                {/* Additional Presets (Storage conditions & Film Type) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Storage Condition */}
                  <div>
                    <label className="block text-xs font-semibold text-[#a0a5b8] mb-2 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-7 h-7 rounded-md flex items-center justify-center liquid-glass-icon-blue">
                        <Thermometer className="w-4 h-4 text-blue-300" />
                      </span>
                      Условия хранения
                    </label>
                    <div className="space-y-1.5">
                      <button
                        onClick={() => setStorage('freezer')}
                        className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all flex items-center justify-between border ${
                          storage === 'freezer'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/50 font-bold'
                            : 'bg-[#222530]/50 text-[#a0a5b8] border-[#222530] hover:bg-[#2b2f3e]'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded flex items-center justify-center liquid-glass-icon-blue">
                            <Snowflake className="w-3.5 h-3.5 text-blue-300" />
                          </span>
                          Морозилка (-18°C)
                        </span>
                        <span>x0.2 K</span>
                      </button>
                      <button
                        onClick={() => setStorage('fridge')}
                        className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all flex items-center justify-between border ${
                          storage === 'fridge'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/50 font-bold'
                            : 'bg-[#222530]/50 text-[#a0a5b8] border-[#222530] hover:bg-[#2b2f3e]'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded flex items-center justify-center liquid-glass-icon-blue">
                            <Snowflake className="w-3.5 h-3.5 text-blue-300 opacity-70" />
                          </span>
                          Холодильник (4-8°C)
                        </span>
                        <span>x0.5 K</span>
                      </button>
                      <button
                        onClick={() => setStorage('room')}
                        className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all flex items-center justify-between border ${
                          storage === 'room'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/50 font-bold'
                            : 'bg-[#222530]/50 text-[#a0a5b8] border-[#222530] hover:bg-[#2b2f3e]'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded flex items-center justify-center liquid-glass-icon-blue bg-blue-500/20 text-xs">
                            🏠
                          </span>
                          Комнатная (15-22°C)
                        </span>
                        <span>x1.0 K</span>
                      </button>
                      <button
                        onClick={() => setStorage('hot')}
                        className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all flex items-center justify-between border ${
                          storage === 'hot'
                            ? 'bg-red-500/10 text-red-400 border-red-500/50 font-bold'
                            : 'bg-[#222530]/50 text-[#a0a5b8] border-[#222530] hover:bg-[#2b2f3e]'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded flex items-center justify-center liquid-glass-icon-red">
                            <Flame className="w-3.5 h-3.5 text-red-300 animate-pulse" />
                          </span>
                          Жара / Влажность
                        </span>
                        <span>x1.6 K</span>
                      </button>
                    </div>
                  </div>

                  {/* Film Type */}
                  <div>
                    <label className="block text-xs font-semibold text-[#a0a5b8] mb-2 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-7 h-7 rounded-md flex items-center justify-center liquid-glass-icon-blue">
                        <Camera className="w-4 h-4 text-blue-300" />
                      </span>
                      Тип фотоплёнки
                    </label>
                    <div className="space-y-1.5">
                      <button
                        onClick={() => setFilmType('bw')}
                        className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all flex items-center justify-between border ${
                          filmType === 'bw'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/50 font-bold'
                            : 'bg-[#222530]/50 text-[#a0a5b8] border-[#222530] hover:bg-[#2b2f3e]'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded flex items-center justify-center bg-zinc-800 text-[10px] text-zinc-300 font-bold border border-zinc-700">
                            B&W
                          </span>
                          Ч/Б негатив
                        </span>
                        <span>x0.8 K (Стабильнее)</span>
                      </button>
                      <button
                        onClick={() => setFilmType('color_neg')}
                        className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all flex items-center justify-between border ${
                          filmType === 'color_neg'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/50 font-bold'
                            : 'bg-[#222530]/50 text-[#a0a5b8] border-[#222530] hover:bg-[#2b2f3e]'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded flex items-center justify-center bg-[#ea580c]/20 text-[10px] text-amber-500 font-bold border border-[#ea580c]/30">
                            RGB
                          </span>
                          Цветной негатив
                        </span>
                        <span>x1.0 K (Норма)</span>
                      </button>
                      <button
                        onClick={() => setFilmType('slide')}
                        className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all flex items-center justify-between border ${
                          filmType === 'slide'
                            ? 'bg-red-500/10 text-red-400 border-red-500/50 font-bold'
                            : 'bg-[#222530]/50 text-[#a0a5b8] border-[#222530] hover:bg-[#2b2f3e]'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded flex items-center justify-center bg-[#ef4444]/20 text-[10px] text-red-400 font-bold border border-[#ef4444]/30">
                            DIA
                          </span>
                          Слайд (Обратимая)
                        </span>
                        <span>⚠️ Сложная широта</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Results & Recommendations (5 cols on large screens) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Calculation Result Card */}
            <div className="bg-[#1c1e2d] border border-[#30344d] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              {/* Decorative light leak effect at the top right */}
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center liquid-glass-icon-amber glossy-glow">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <h2 className="text-lg font-bold text-white">Результирующее ISO</h2>
              </div>

              {/* Main computed ISO number */}
              <div className="text-center py-6 bg-[#131521] rounded-xl border border-[#2a2d42] mb-5">
                <span className="block text-xs uppercase tracking-widest text-[#8a8fa3] mb-1 font-semibold">
                  Эффективная чувствительность (ISOэфф)
                </span>
                <span className="text-6xl font-black text-white tracking-tight">
                  {isoEff}
                </span>
                <span className="block text-xs text-amber-400 mt-2 font-medium">
                  {deltaT > 0 ? `Потеряно экспозиции: ~${stopsLost.toFixed(2)} стопа` : 'Без изменений'}
                </span>
              </div>

              <div className="space-y-4 text-sm">
                {/* Nearest Standard ISO */}
                <div className="flex justify-between items-center py-2.5 border-b border-[#292d3f]">
                  <span className="text-[#a0a5b8] flex items-center gap-1.5">
                    Ближайшее стандартное ISO:
                  </span>
                  <span className="font-bold text-white text-base bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    {closestStandardIso}
                  </span>
                </div>

                {/* Reduction ratio */}
                <div className="flex justify-between items-center py-2.5 border-b border-[#292d3f]">
                  <span className="text-[#a0a5b8]">Коэффициент ослабления:</span>
                  <span className="font-mono text-[#c5c9d6]">
                    в {reductionFactor.toFixed(1)} раз
                  </span>
                </div>

                {/* Expiry status */}
                <div className="flex justify-between items-center py-2.5 border-b border-[#292d3f]">
                  <span className="text-[#a0a5b8]">Срок просрочки (ΔT):</span>
                  <span className="font-semibold text-white">
                    {deltaT} {getStopsPlural(deltaT)}
                  </span>
                </div>

                {/* K coeff value used */}
                <div className="flex justify-between items-center py-2.5 border-b border-[#292d3f]">
                  <span className="text-[#a0a5b8]">Использованный K-коэф:</span>
                  <span className="font-semibold text-blue-400">{kCoeff}</span>
                </div>
              </div>

              {/* Recommendations Box */}
              <div className="mt-5 p-4 rounded-xl bg-[#222739] border border-[#2f3552] text-xs leading-relaxed text-[#c5c9d6]">
                <div className="flex items-center space-x-2 mb-2 font-bold text-white text-xs uppercase tracking-wider">
                  <span className="w-6 h-6 rounded flex items-center justify-center liquid-glass-icon-amber">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                  </span>
                  <span>Рекомендация по съёмке:</span>
                </div>
                <p>{getExposureRecommendation()}</p>
                {deltaT > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#313854] flex items-center justify-between text-[#a0a5b8]">
                    <span>Настройка экспонометра:</span>
                    <span className="font-bold text-white flex items-center gap-1">
                      Выставить {closestStandardIso} ISO
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Exposure simulation visual card */}
            <div className="bg-[#161822] border border-[#222530] rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center liquid-glass-icon-amber glossy-glow">
                  <Camera className="w-5 h-5 text-amber-300" />
                </div>
                <h3 className="text-sm font-bold text-white">Симуляция правильной экспозиции</h3>
              </div>

              <p className="text-xs text-[#9095a6] mb-4">
                Посмотрите, как экспокоррекция по расчету {isoEff} ISO компенсирует деградацию эмульсии:
              </p>

              {/* Simulated Image comparison */}
              <div className="grid grid-cols-2 gap-3">
                {/* Without compensation */}
                <div className="space-y-1.5">
                  <div className="relative h-28 rounded-lg overflow-hidden border border-[#2a2d40] bg-[#1e2030] flex items-center justify-center">
                    {/* Simulated visual image */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center" 
                      style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=400&auto=format&fit=crop')`,
                        ...getSimulationStyle('underexposed')
                      }}
                    />
                    <div className="absolute bottom-1 left-1 right-1 bg-black/60 backdrop-blur-xs py-0.5 px-1.5 rounded text-[10px] text-center text-red-400 font-semibold border border-red-500/20">
                      Без компенсации (на {isoStart} ISO)
                    </div>
                  </div>
                  <p className="text-[10px] text-center text-[#9095a6] leading-snug">
                    Недоэкспонировано, тёмные тени, сильное зерно и вуаль.
                  </p>
                </div>

                {/* With compensation */}
                <div className="space-y-1.5">
                  <div className="relative h-28 rounded-lg overflow-hidden border border-[#2a2d40] bg-[#1e2030] flex items-center justify-center">
                    {/* Simulated visual image */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center" 
                      style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=400&auto=format&fit=crop')`,
                        ...getSimulationStyle('correct')
                      }}
                    />
                    <div className="absolute bottom-1 left-1 right-1 bg-black/60 backdrop-blur-xs py-0.5 px-1.5 rounded text-[10px] text-center text-green-400 font-semibold border border-green-500/20">
                      С компенсацией (на {isoEff} ISO)
                    </div>
                  </div>
                  <p className="text-[10px] text-center text-[#9095a6] leading-snug">
                    Нормальная яркость, проработанные тени, винтажный тон.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Detailed Guide & Math breakdown */}
        <div className="mt-8 bg-[#161822] border border-[#222530] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center liquid-glass-icon-amber glossy-glow">
              <BookOpen className="w-5 h-5 text-amber-300" />
            </div>
            <h3 className="text-base font-bold text-white">Как устроен расчёт? Математика формулы</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-[#a0a5b8]">
            <div className="space-y-3">
              <p>
                С течением времени чувствительность фотоплёнки падает из-за космического излучения, фонового тепла и естественного распада химических элементов эмульсии. Наша формула вычисляет падение чувствительности в экспозиционных «стопах» (каждый стоп — это уменьшение ISO в 2 раза):
              </p>

              <div className="bg-[#1c1d2b] p-4 rounded-xl text-center border border-[#25283b] my-3">
                <span className="block text-xs text-amber-500 font-bold mb-1">Используемая формула</span>
                <code className="text-white text-base block font-mono">
                  ISOэфф = ISOисх / 2^( (ΔT / 10) * K )
                </code>
              </div>

              <p>
                В классической плёночной фотографии есть эмпирическое правило: <strong className="text-white">«добавлять 1 стоп экспозиции на каждые 10 лет просрочки»</strong>. Это соответствует значению коэффициента <code className="text-amber-500">K = 1.0</code>.
              </p>
            </div>

            <div className="space-y-3 bg-[#131521] p-5 rounded-xl border border-[#1e212f]">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded flex items-center justify-center liquid-glass-icon-blue">
                  <Info className="w-3.5 h-3.5 text-blue-300" />
                </span>
                Расчёт на ваших глазах (пошагово):
              </h4>
              <ol className="space-y-2 text-xs leading-relaxed">
                <li className="flex justify-between">
                  <span>1. Исходное ISO (ISOисх):</span>
                  <span className="text-white font-mono">{isoStart}</span>
                </li>
                <li className="flex justify-between">
                  <span>2. Срок просрочки (ΔT):</span>
                  <span className="text-white font-mono">{deltaT} лет</span>
                </li>
                <li className="flex justify-between">
                  <span>3. Коэффициент деградации (K):</span>
                  <span className="text-blue-400 font-mono">{kCoeff}</span>
                </li>
                <li className="flex justify-between border-t border-[#25283b] pt-2 mt-1">
                  <span>4. Расчет показателя степени:</span>
                  <span className="text-amber-400 font-mono">({deltaT} / 10) * {kCoeff} = {stopsLost.toFixed(3)} стопов</span>
                </li>
                <li className="flex justify-between">
                  <span>5. Ослабление (2^стопы):</span>
                  <span className="text-[#a0a5b8] font-mono">2^{stopsLost.toFixed(2)} = в {reductionFactor.toFixed(2)} раз</span>
                </li>
                <li className="flex justify-between border-t border-[#25283b] pt-2 mt-1 font-bold text-white">
                  <span>Результат (ISOэфф):</span>
                  <span className="text-amber-400 font-mono">{isoStart} / {reductionFactor.toFixed(2)} = {rawIsoEff.toFixed(1)} → {isoEff} ISO</span>
                </li>
              </ol>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#222530] mt-16 bg-[#161822]/60 py-8 text-center text-xs text-[#6e7485]">
        <div className="max-w-6xl mx-auto px-4 space-y-2">
          <p>© {new Date().getFullYear()} LutOldMeter. Сделано с ❤️ для плёночных фотографов.</p>
          <p className="max-w-2xl mx-auto leading-relaxed">
            Помните, что данный калькулятор даёт теоретическую оценку. Точный результат зависит от истории хранения плёнки (замораживание значительно снижает скорость деградации). Если плёнка представляет большую ценность, всегда рекомендуется отснять тестовый ролик.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
