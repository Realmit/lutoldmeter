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
  Clock,
  Layers,
  Thermometer,
  Languages
} from 'lucide-react';

// Standard values for matching closest outputs based on unit scale
const STANDARD_VALUES = {
  iso: [6, 8, 10, 12, 16, 20, 25, 32, 40, 50, 64, 80, 100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600, 2000, 2500, 3200, 6400, 12800],
  asa: [6, 8, 10, 12, 16, 20, 25, 32, 40, 50, 64, 80, 100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600, 2000, 2500, 3200, 6400, 12800],
  din: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 39, 42],
  gost_new: [6, 8, 10, 12, 16, 20, 25, 32, 40, 50, 64, 80, 100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600, 2000, 2500, 3200, 6400, 12800],
  gost_old: [11, 16, 22, 32, 45, 65, 90, 130, 180, 250, 350, 500, 700, 1000, 1400, 2000, 2800]
};

// Unit presets
const PRESETS = {
  iso: [25, 50, 64, 100, 160, 200, 400, 800, 1600, 3200],
  asa: [25, 50, 64, 100, 160, 200, 400, 800, 1600, 3200],
  din: [15, 18, 19, 21, 23, 24, 27, 30, 33, 36],
  gost_new: [25, 50, 64, 100, 160, 200, 400, 800, 1600, 3200],
  gost_old: [22, 32, 45, 65, 90, 130, 180, 250, 350, 700]
};

const UNIT_RANGES = {
  iso: { min: 12, max: 3200, default: 400 },
  asa: { min: 12, max: 3200, default: 400 },
  din: { min: 12, max: 36, default: 27 },
  gost_new: { min: 12, max: 3200, default: 400 },
  gost_old: { min: 11, max: 2800, default: 350 }
};

// Conversion helper functions
const convertToIso = (val, unit) => {
  switch (unit) {
    case 'gost_old':
      // Old GOST 2817-50 (pre-1987) where GOST = 0.9 * ISO (thus ISO = GOST / 0.9)
      return val / 0.9;
    case 'gost_new':
      // Modern GOST 10691-84 (aligned with ISO 1:1)
      return val;
    case 'din':
      return Math.pow(10, (val - 1) / 10);
    case 'asa':
    case 'iso':
    default:
      return val;
  }
};

const convertFromIso = (iso, unit) => {
  switch (unit) {
    case 'gost_old':
      return iso * 0.9;
    case 'gost_new':
      return iso;
    case 'din':
      return 1 + 10 * Math.log10(iso);
    case 'asa':
    case 'iso':
    default:
      return iso;
  }
};

// Translation dictionary
const TRANSLATIONS = {
  en: {
    subtitle: 'Exposure compensation calculator for expired film',
    gostOldNote: 'Old GOST (pre-1987) uses the 0.9 multiplier (ISO = GOST / 0.9). Used on older Soviet films.',
    gostNewNote: 'Modern GOST (post-1987) is aligned 1:1 with ISO/ASA (matches Svema/Tasma packaging with GOST and ASA values).',
    gostOldOption: 'GOST (old, pre-1987)',
    gostNewOption: 'GOST (new, post-1987)',
    currentYearText: 'Current calculator year: ',
    filmParams: 'Film Parameters',
    inputUnitLabel: 'Input Sensitivity Unit',
    outputUnitLabel: 'Output Sensitivity Unit',
    boxSpeed: 'Box Speed (Nominal)',
    expirationAge: 'Expiration Age (ΔT)',
    byYears: 'By Years',
    manualYears: 'Manual (years)',
    expYear: 'Expiration Year',
    curYear: 'Current Shooting Year',
    howManyYears: 'Years expired',
    totalExpAge: 'Total Expiration Age (ΔT):',
    coeffAndConditions: 'Degradation & Conditions',
    resetAutoK: 'Reset Auto-K',
    degradationCoeff: 'Degradation Coefficient (K)',
    recommendedRange: 'Recommended range for',
    degradationGuide: 'Degradation Guide (by nominal ISO equivalent):',
    storageConditions: 'Storage Conditions',
    freezer: 'Freezer (-18°C)',
    fridge: 'Refrigerator (4-8°C)',
    roomTemp: 'Room Temp (15-22°C)',
    heatHumidity: 'Heat / Humidity',
    filmTypeLabel: 'Film Type',
    bwNeg: 'B&W Negative',
    colorNeg: 'Color Negative',
    slideColor: 'Slide (Color Reversal)',
    stable: 'Stable',
    normal: 'Normal',
    narrowLatitude: 'Narrow Latitude',
    resultingIso: 'Resulting Sensitivity',
    effSensitivity: 'Effective Sensitivity',
    exposureLost: 'Exposure lost:',
    noChanges: 'No changes',
    nearestStandardIso: 'Nearest Standard',
    reductionFactorLabel: 'Reduction factor:',
    appliedKCoeff: 'Applied K-coeff:',
    shootingRec: 'Shooting Recommendation:',
    meterSetting: 'Lightmeter Settings:',
    setMeterTo: 'Set your lightmeter to',
    simulationTitle: 'Correct Exposure Simulation',
    simulationDesc: 'See how the calculated compensation offsets emulsion degradation:',
    noComp: 'No Compensation (at box speed)',
    noCompDesc: 'Underexposed, muddy shadows, heavy grain and fog.',
    withComp: 'Compensated',
    withCompDesc: 'Normal brightness, recovered shadows, vintage tone.',
    howItWorks: 'How does it work? Mathematical Formula',
    formulaExplanation: 'Over time, film sensitivity decreases due to cosmic radiation, background heat, and natural chemical decay of the emulsion. Our formula calculates this sensitivity loss in exposure "stops" (each stop halves the ISO):',
    formulaUsed: 'Formula Used',
    ruleOfThumb: 'In classic film photography, a common rule of thumb is "add 1 stop of exposure per 10 years of expiration". This corresponds to a degradation coefficient of K = 1.0.',
    calculationSteps: 'Real-time Calculation Steps:',
    stepBoxSpeed: '1. Box Speed (Input):',
    stepBoxSpeedConverted: 'Nominal converted to ISO:',
    stepExpAge: '2. Expiration Age (ΔT):',
    stepDegradationK: '3. Degradation Coeff (K):',
    stepExponentCalc: '4. Exponent Calculation:',
    stepAttenuation: '5. Attenuation (2^stops):',
    stepResult: 'Result (ISOeff):',
    stepResultConverted: 'Result converted to Output Unit:',
    footerCopyright: 'LutOldMeter. Made with ❤️ for film photographers.',
    footerWarning: 'Remember that this calculator provides a theoretical estimate. The exact result depends heavily on how the film was stored (freezing significantly slows down degradation). If the film is highly valuable, shooting a test roll is always recommended.',
    freshFilm: 'Film is fresh! Shoot at box speed.',
    needOverexposure: 'Needs overexposure by approximately',
    slideWarning: '⚠️ Warning: Slide film has very narrow latitude and handles overexposure poorly. Shoot close to box speed or consider cross-processing.',
    bwLatitude: 'B&W film has wide exposure latitude. A tolerance of +/- 0.5 stops is acceptable.',
    colorLatitude: 'Color negative film handles overexposure exceptionally well. Round up in favor of overexposure.',
    years: 'years',
    yearSingular: 'year',
    stops: 'stops',
    stopSingular: 'stop',
    lowDeg: 'Low Degradation',
    classicLoss: 'Classic Loss',
    fastDeg: 'Fast Degradation',
    catFog: 'Catastrophic Fog',
    descLowDeg: 'Preserves perfectly (loses less than 1 stop per 10 years)',
    descClassicLoss: 'Classic loss (exactly 1 stop per 10 years)',
    descFastDeg: 'Degrades quickly (approx 1.3 stops per 10 years)',
    descCatFog: 'Catastrophic fog (up to 2 stops per 10 years)'
  },
  ru: {
    subtitle: 'Калькулятор экспозиции для просроченной фотоплёнки',
    gostOldNote: 'Старый ГОСТ (до 1987 года, ГОСТ 2817-50) использует коэффициент 0.9 (ISO = ГОСТ / 0.9). Встречается на старых советских плёнках Свема/Тасма (например, ГОСТ 65, 130, 250).',
    gostNewNote: 'Новый ГОСТ (после 1987 года, ГОСТ 10691-84) приравнен к ISO/ASA 1:1. Встречается на более свежих упаковках плёнок.',
    gostOldOption: 'ГОСТ (старый, до 1987 года)',
    gostNewOption: 'ГОСТ (новый, после 1987 года)',
    currentYearText: 'Текущий год в калькуляторе: ',
    filmParams: 'Параметры плёнки',
    inputUnitLabel: 'Единицы чувствительности на входе',
    outputUnitLabel: 'Единицы чувствительности на выходе',
    boxSpeed: 'Номинал (чувствительность)',
    expirationAge: 'Возраст просрочки (ΔT)',
    byYears: 'По годам',
    manualYears: 'Вручную (лет)',
    expYear: 'Год окончания срока',
    curYear: 'Текущий год съёмки',
    howManyYears: 'Сколько лет просрочена плёнка',
    totalExpAge: 'Итоговый срок просрочки (ΔT):',
    coeffAndConditions: 'Коэффициент & Условия',
    resetAutoK: 'Сбросить авто-К',
    degradationCoeff: 'Коэффициент деградации (K)',
    recommendedRange: 'Рекомендуемый диапазон для',
    degradationGuide: 'Справочник деградации (в эквиваленте ISO):',
    storageConditions: 'Условия хранения',
    freezer: 'Морозилка (-18°C)',
    fridge: 'Холодильник (4-8°C)',
    roomTemp: 'Комнатная (15-22°C)',
    heatHumidity: 'Жара / Влажность',
    filmTypeLabel: 'Тип фотоплёнки',
    bwNeg: 'Ч/Б негатив',
    colorNeg: 'Цветной негатив',
    slideColor: 'Слайд (Обратимая)',
    stable: 'Стабильнее',
    normal: 'Норма',
    narrowLatitude: 'Сложная широта',
    resultingIso: 'Результирующая чувствительность',
    effSensitivity: 'Эффективная чувствительность',
    exposureLost: 'Потеряно экспозиции:',
    noChanges: 'Без изменений',
    nearestStandardIso: 'Ближайшее стандартное',
    reductionFactorLabel: 'Коэффициент ослабления:',
    appliedKCoeff: 'Использованный K-коэф:',
    shootingRec: 'Рекомендация по съёмке:',
    meterSetting: 'Настройка экспонометра:',
    setMeterTo: 'Выставить на экспонометре',
    simulationTitle: 'Симуляция правильной экспозиции',
    simulationDesc: 'Посмотрите, как экспокоррекция по расчету компенсирует деградацию эмульсии:',
    noComp: 'Без компенсации (на номинале)',
    noCompDesc: 'Недоэкспонировано, тёмные тени, сильное зерно и вуаль.',
    withComp: 'С компенсацией',
    withCompDesc: 'Нормальная яркость, проработанные тени, винтажный тон.',
    howItWorks: 'Как устроен расчёт? Математика формулы',
    formulaExplanation: 'С течением времени чувствительность фотоплёнки падает из-за космического излучения, фонового тепла и естественного распада химических элементов эмульсии. Наша формула вычисляет падение чувствительности в экспозиционных «стопах» (каждый стоп — это уменьшение ISO в 2 раза):',
    formulaUsed: 'Используемая формула',
    ruleOfThumb: 'В классической плёночной фотографии есть эмпирическое правило: «добавлять 1 стоп экспозиции на каждые 10 лет просрочки». Это соответствует значению коэффициента K = 1.0.',
    calculationSteps: 'Расчёт на ваших глазах (пошагово):',
    stepBoxSpeed: '1. Номинал на входе:',
    stepBoxSpeedConverted: 'Номинал в переводе на ISO:',
    stepExpAge: '2. Срок просрочки (ΔT):',
    stepDegradationK: '3. Коэффициент деградации (K):',
    stepExponentCalc: '4. Расчет показателя степени:',
    stepAttenuation: '5. Ослабление (2^стопы):',
    stepResult: 'Результат (ISOэфф):',
    stepResultConverted: 'Результат в целевых единицах:',
    footerCopyright: 'LutOldMeter. Сделано с ❤️ для плёночных фотографов.',
    footerWarning: 'Помните, что данный калькулятор даёт теоретическую оценку. Точный результат зависит от истории хранения плёнки (замораживание значительно снижает скорость деградации). Если плёнка представляет большую ценность, всегда рекомендуется отснять тестовый ролик.',
    freshFilm: 'Плёнка свежая! Экспонируйте как обычно по номиналу.',
    needOverexposure: 'Необходимо переэкспонировать плёнку примерно на',
    slideWarning: '⚠️ Внимание: Слайдовая плёнка плохо переносит переэкспозицию и теряет цвета. Рекомендуется снимать близко к номиналу или использовать кросс-процесс.',
    bwLatitude: 'Ч/Б плёнка имеет хорошую широту. Допускается погрешность +/- 0.5 стопа.',
    colorLatitude: 'Цветной негатив отлично переносит переэкспозицию. Округляйте в большую сторону.',
    years: 'лет',
    yearSingular: 'год',
    stops: 'стопов',
    stopSingular: 'stop',
    lowDeg: 'Низкая деградация',
    classicLoss: 'Классическая потеря',
    fastDeg: 'Быстрое разрушение',
    catFog: 'Катастрофическая вуаль',
    descLowDeg: 'Сохраняется отлично (теряет меньше 1 стопа за 10 лет)',
    descClassicLoss: 'Классическая потеря (ровно 1 стоп за 10 лет)',
    descFastDeg: 'Разрушается быстро (около 1.3 стопа за 10 лет)',
    descCatFog: 'Катастрофическая вуаль (до 2 стопов за 10 лет)'
  }
};

function App() {
  // Lang state (defaults to English)
  const [lang, setLang] = useState('en');

  // Units selection (defaults to gost_old to start with classic Soviet units)
  const [inputUnit, setInputUnit] = useState('gost_old'); 
  const [outputUnit, setOutputUnit] = useState('iso'); 

  // Short hand translation getter
  const t = (key) => TRANSLATIONS[lang][key] || key;

  // Sensitivity states
  const [inputValue, setInputValue] = useState(350); // matching old GOST default
  const [expireYear, setExpireYear] = useState(2016);
  const [currentYear, setCurrentYear] = useState(2026);
  const [deltaTManual, setDeltaTManual] = useState(10);
  const [useManualDeltaT, setUseManualDeltaT] = useState(false);
  const [kCoeff, setKCoeff] = useState(1.3);
  const [storage, setStorage] = useState('room'); // freezer, fridge, room, hot
  const [filmType, setFilmType] = useState('color_neg'); // bw, color_neg, slide
  const [isKManual, setIsKManual] = useState(false);

  // Sync default input value when input unit changes
  useEffect(() => {
    setInputValue(UNIT_RANGES[inputUnit].default);
  }, [inputUnit]);

  // Derived nominal ISO
  const isoStart = convertToIso(inputValue, inputUnit);

  // Derived Delta T (years in expiry)
  const calculatedDeltaT = Math.max(0, currentYear - expireYear);
  const deltaT = useManualDeltaT ? deltaTManual : calculatedDeltaT;

  // Function to get K recommendations (based on equivalent nominal ISO)
  const getKRecommendation = (iso) => {
    if (iso <= 64) {
      return { 
        min: 0.7, 
        max: 0.8, 
        default: 0.75, 
        desc: t('descLowDeg'), 
        label: t('lowDeg')
      };
    } else if (iso > 64 && iso <= 250) {
      return { 
        min: 1.0, 
        max: 1.0, 
        default: 1.0, 
        desc: t('descClassicLoss'),
        label: t('classicLoss')
      };
    } else if (iso > 250 && iso <= 600) {
      return { 
        min: 1.2, 
        max: 1.4, 
        default: 1.3, 
        desc: t('descFastDeg'),
        label: t('fastDeg')
      };
    } else {
      return { 
        min: 1.8, 
        max: 2.0, 
        default: 1.9, 
        desc: t('descCatFog'),
        label: t('catFog')
      };
    }
  };

  const kRec = getKRecommendation(isoStart);

  // Auto update K coefficient if not manually modified
  useEffect(() => {
    if (!isKManual) {
      let baseK = kRec.default;
      
      // Apply storage multipliers
      let multiplier = 1.0;
      if (storage === 'freezer') multiplier = 0.2;
      if (storage === 'fridge') multiplier = 0.5;
      if (storage === 'hot') multiplier = 1.6;

      // Adjust based on film type
      let typeMult = 1.0;
      if (filmType === 'bw') typeMult = 0.8;

      const adjustedK = parseFloat((baseK * multiplier * typeMult).toFixed(2));
      setKCoeff(adjustedK);
    }
  }, [isoStart, storage, filmType, isKManual, lang]);

  // Recalculate K if user resets manual override
  const handleResetK = () => {
    setIsKManual(false);
  };

  // Math: ISO_eff = ISO_start / 2^( (deltaT / 10) * K )
  const stopsLost = (deltaT / 10) * kCoeff;
  const reductionFactor = Math.pow(2, stopsLost);
  const rawIsoEff = isoStart / reductionFactor;
  const isoEff = Math.max(1, Math.round(rawIsoEff));

  // Convert raw and computed ISO back to Output Unit
  const rawOutputEff = convertFromIso(rawIsoEff, outputUnit);
  
  // Custom rounding for DIN
  const formattedOutputEff = outputUnit === 'din' 
    ? Math.max(1, Math.round(rawOutputEff)) 
    : Math.max(1, Math.round(rawOutputEff));

  // Find closest standard value for the Output Unit
  const outputStandards = STANDARD_VALUES[outputUnit];
  const closestStandardOutput = outputStandards.reduce((prev, curr) => {
    return Math.abs(curr - rawOutputEff) < Math.abs(prev - rawOutputEff) ? curr : prev;
  });

  // Exposure recommendation text
  const getExposureRecommendation = () => {
    if (deltaT <= 0) {
      return t('freshFilm');
    }

    const stopsFloat = stopsLost.toFixed(1);
    let advice = `${t('needOverexposure')} ${stopsFloat} ${getStopsPlural(stopsLost)}. `;
    
    if (filmType === 'slide') {
      advice += t('slideWarning');
    } else if (filmType === 'bw') {
      advice += t('bwLatitude');
    } else {
      advice += t('colorLatitude');
    }

    return advice;
  };

  function getStopsPlural(num) {
    const floor = Math.floor(num);
    if (lang === 'ru') {
      if (floor === 1) return 'стоп';
      if (floor >= 2 && floor <= 4) return 'стопа';
      return 'стопов';
    } else {
      return floor === 1 ? t('stopSingular') : t('stops');
    }
  }

  function getYearsPlural(num) {
    if (lang === 'ru') {
      const lastDigit = num % 10;
      const lastTwoDigits = num % 100;
      if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'лет';
      if (lastDigit === 1) return 'год';
      if (lastDigit >= 2 && lastDigit <= 4) return 'года';
      return 'лет';
    } else {
      return num === 1 ? t('yearSingular') : t('years');
    }
  }

  const getUnitName = (unit) => {
    switch (unit) {
      case 'gost_old':
        return lang === 'ru' ? 'ГОСТ (старый)' : 'Old GOST';
      case 'gost_new':
        return lang === 'ru' ? 'ГОСТ (новый)' : 'New GOST';
      case 'din':
        return 'DIN';
      case 'asa':
        return 'ASA';
      case 'iso':
      default:
        return 'ISO';
    }
  };

  // Visual simulation of exposure
  const getSimulationStyle = (type) => {
    if (type === 'underexposed') {
      const diff = Math.min(3, stopsLost);
      const brightness = Math.max(25, 100 - (diff * 22));
      const contrast = 100 + (diff * 10);
      const saturate = Math.max(30, 100 - (diff * 15));
      return {
        filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) grayscale(${filmType === 'bw' ? '100%' : '0%'})`,
        transition: 'all 0.5s ease-in-out'
      };
    } else if (type === 'correct') {
      return {
        filter: `brightness(100%) contrast(95%) saturate(${filmType === 'bw' ? '0%' : '105%'}) sepia(${filmType === 'bw' ? '10%' : '15%'})`,
        transition: 'all 0.5s ease-in-out'
      };
    } else {
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
              <p className="text-xs text-[#9095a6] hidden sm:block">{t('subtitle')}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="flex items-center bg-[#222530] p-1 rounded-lg border border-[#2e3344] text-[11px] font-bold">
              <Languages className="w-3.5 h-3.5 mx-2 text-amber-500" />
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded transition-all ${lang === 'en' ? 'bg-amber-500 text-black' : 'text-[#a0a5b8] hover:text-white'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('ru')}
                className={`px-2.5 py-1 rounded transition-all ${lang === 'ru' ? 'bg-amber-500 text-black' : 'text-[#a0a5b8] hover:text-white'}`}
              >
                RU
              </button>
            </div>

            {/* Year Badge */}
            <div className="hidden md:flex items-center space-x-3 text-xs bg-[#222530] px-3 py-1.5 rounded-full border border-[#2e3344] text-[#a0a5b8]">
              <div className="w-5 h-5 rounded-full flex items-center justify-center liquid-glass-icon-amber">
                <Clock className="w-3 h-3 text-amber-300" />
              </div>
              <span>{t('currentYearText')}<b>{currentYear}</b></span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Controls & Settings */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Card 1: Film parameters */}
            <div className="bg-[#161822] border border-[#222530] rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
              
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center liquid-glass-icon-amber glossy-glow">
                  <Sliders className="w-5 h-5 text-amber-300" />
                </div>
                <h2 className="text-lg font-bold text-white">{t('filmParams')}</h2>
              </div>

              <div className="space-y-6">
                
                {/* Unit Selectors */}
                <div className="grid grid-cols-2 gap-4 bg-[#1b1e2c] p-4 rounded-xl border border-[#272a3f]">
                  <div>
                    <label className="block text-xs font-semibold text-[#a0a5b8] mb-2 uppercase tracking-wider">
                      {t('inputUnitLabel')}
                    </label>
                    <select
                      value={inputUnit}
                      onChange={(e) => setInputUnit(e.target.value)}
                      className="w-full bg-[#222530] border border-[#2e3344] rounded-lg px-2.5 py-1.5 text-white font-bold text-xs uppercase focus:outline-none focus:border-amber-500"
                    >
                      <option value="iso">ISO / ASA</option>
                      <option value="gost_new">{t('gostNewOption')}</option>
                      <option value="gost_old">{t('gostOldOption')}</option>
                      <option value="din">DIN</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#a0a5b8] mb-2 uppercase tracking-wider">
                      {t('outputUnitLabel')}
                    </label>
                    <select
                      value={outputUnit}
                      onChange={(e) => setOutputUnit(e.target.value)}
                      className="w-full bg-[#222530] border border-[#2e3344] rounded-lg px-2.5 py-1.5 text-white font-bold text-xs uppercase focus:outline-none focus:border-amber-500"
                    >
                      <option value="iso">ISO / ASA</option>
                      <option value="gost_new">{t('gostNewOption')}</option>
                      <option value="gost_old">{t('gostOldOption')}</option>
                      <option value="din">DIN</option>
                    </select>
                  </div>
                </div>

                {/* Input Value Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-[#c5c9d6] flex items-center gap-1.5">
                      {t('boxSpeed')}
                    </label>
                    <span className="text-xl font-bold text-amber-400">
                      {inputValue} {getUnitName(inputUnit).toUpperCase()}
                      {inputUnit !== 'iso' && inputUnit !== 'asa' && (
                        <span className="text-xs text-[#a0a5b8] font-normal block text-right mt-0.5">
                          (~ {Math.round(isoStart)} ISO)
                        </span>
                      )}
                    </span>
                  </div>
                  
                  <input 
                    type="range" 
                    min={UNIT_RANGES[inputUnit].min} 
                    max={UNIT_RANGES[inputUnit].max} 
                    step="1"
                    value={inputValue} 
                    onChange={(e) => setInputValue(Number(e.target.value))}
                    className="w-full h-2 bg-[#222530] rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 mb-3"
                  />

                  {/* Preset Values based on input unit */}
                  <div className="flex flex-wrap gap-1.5">
                    {PRESETS[inputUnit].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setInputValue(preset)}
                        className={`text-xs px-2.5 py-1.5 rounded transition-all font-semibold ${
                          inputValue === preset 
                            ? 'bg-amber-500 text-[#111318] font-bold shadow-md' 
                            : 'bg-[#222530] text-[#a0a5b8] hover:bg-[#2b2f3e] hover:text-white'
                        }`}
                      >
                        {preset} {getUnitName(inputUnit).toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <hr className="border-[#222530]" />

                {inputUnit === 'gost_old' && (
                  <p className="text-[11px] text-[#9095a6] bg-[#1a1d29] p-2.5 rounded-lg border border-[#252838] leading-normal">
                    💡 {t('gostOldNote')}
                  </p>
                )}
                {inputUnit === 'gost_new' && (
                  <p className="text-[11px] text-[#9095a6] bg-[#1a1d29] p-2.5 rounded-lg border border-[#252838] leading-normal">
                    💡 {t('gostNewNote')}
                  </p>
                )}

                {/* Expiration and delta T */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium text-[#c5c9d6] flex items-center gap-2">
                      <span className="w-7 h-7 rounded-md flex items-center justify-center liquid-glass-icon-amber">
                        <Calendar className="w-4 h-4 text-amber-300" />
                      </span>
                      {t('expirationAge')}
                    </label>
                    <div className="flex bg-[#222530] p-0.5 rounded-lg border border-[#2e3344] text-[11px]">
                      <button
                        onClick={() => setUseManualDeltaT(false)}
                        className={`px-2.5 py-1 rounded transition-all ${!useManualDeltaT ? 'bg-amber-500 text-black font-bold' : 'text-[#a0a5b8]'}`}
                      >
                        {t('byYears')}
                      </button>
                      <button
                        onClick={() => setUseManualDeltaT(true)}
                        className={`px-2.5 py-1 rounded transition-all ${useManualDeltaT ? 'bg-amber-500 text-black font-bold' : 'text-[#a0a5b8]'}`}
                      >
                        {t('manualYears')}
                      </button>
                    </div>
                  </div>

                  {!useManualDeltaT ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="block text-xs text-[#9095a6] mb-1">{t('expYear')}</span>
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
                        <span className="block text-xs text-[#9095a6] mb-1">{t('curYear')}</span>
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
                        <span className="text-xs text-[#9095a6]">{t('howManyYears')}</span>
                        <span className="text-sm font-bold text-amber-400">{deltaTManual} {getYearsPlural(deltaTManual)}</span>
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
                      {t('totalExpAge')}
                    </span>
                    <span className="font-bold text-white bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded text-sm">
                      {deltaT} {getYearsPlural(deltaT)}
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
                  <h2 className="text-lg font-bold text-white">{t('coeffAndConditions')}</h2>
                </div>
                {isKManual && (
                  <button 
                    onClick={handleResetK} 
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20"
                  >
                    <RotateCcw className="w-3 h-3" /> {t('resetAutoK')}
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Degradation Coefficient Slider (K) */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium text-[#c5c9d6] flex items-center gap-1.5">
                      {t('degradationCoeff')}
                    </label>
                    <span className="text-base font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                      K = {kCoeff}
                    </span>
                  </div>
                  
                  <p className="text-xs text-[#9095a6] mb-3">
                    {t('recommendedRange')} {Math.round(isoStart)} ISO: <b className="text-white">{kRec.min} – {kRec.max}</b> ({kRec.label})
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
                    <span className="text-white font-semibold">{t('degradationGuide')}</span>
                    <ul className="mt-1.5 space-y-1 list-disc list-inside">
                      <li>{lang === 'ru' ? 'до 64' : 'up to 64'}: <span className="text-[#a0a5b8]">K = 0.7 - 0.8 ({lang === 'ru' ? 'Низкая' : 'Low'})</span></li>
                      <li>100 - 200: <span className="text-[#a0a5b8]">K = 1.0 ({lang === 'ru' ? 'Классическая' : 'Classic'})</span></li>
                      <li>400: <span className="text-[#a0a5b8]">K = 1.2 - 1.4 ({lang === 'ru' ? 'Быстрая' : 'Fast'})</span></li>
                      <li>800+: <span className="text-[#a0a5b8]">K = 1.8 - 2.0 ({lang === 'ru' ? 'Катастрофическая' : 'Catastrophic'})</span></li>
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
                      {t('storageConditions')}
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
                          {t('freezer')}
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
                          {t('fridge')}
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
                          {t('roomTemp')}
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
                          {t('heatHumidity')}
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
                      {t('filmTypeLabel')}
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
                          {t('bwNeg')}
                        </span>
                        <span>x0.8 K ({t('stable')})</span>
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
                          {t('colorNeg')}
                        </span>
                        <span>x1.0 K ({t('normal')})</span>
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
                          {t('slideColor')}
                        </span>
                        <span>⚠️ {t('narrowLatitude')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Results & Recommendations */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Calculation Result Card */}
            <div className="bg-[#1c1e2d] border border-[#30344d] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center liquid-glass-icon-amber glossy-glow">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <h2 className="text-lg font-bold text-white">{t('resultingIso')}</h2>
              </div>

              {/* Main computed result value */}
              <div className="text-center py-6 bg-[#131521] rounded-xl border border-[#2a2d42] mb-5">
                <span className="block text-xs uppercase tracking-widest text-[#8a8fa3] mb-1 font-semibold">
                  {t('effSensitivity')} ({getUnitName(outputUnit).toUpperCase()})
                </span>
                <span className="text-6xl font-black text-white tracking-tight">
                  {formattedOutputEff}
                </span>
                <span className="block text-xs text-amber-400 mt-2 font-medium">
                  {deltaT > 0 ? `${t('exposureLost')} ~${stopsLost.toFixed(2)} ${getStopsPlural(stopsLost)}` : t('noChanges')}
                </span>
              </div>

              <div className="space-y-4 text-sm">
                {/* Nearest Standard Result */}
                <div className="flex justify-between items-center py-2.5 border-b border-[#292d3f]">
                  <span className="text-[#a0a5b8] flex items-center gap-1.5">
                    {t('nearestStandardIso')} ({getUnitName(outputUnit).toUpperCase()}):
                  </span>
                  <span className="font-bold text-white text-base bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    {closestStandardOutput} {getUnitName(outputUnit).toUpperCase()}
                  </span>
                </div>

                {/* Reduction ratio */}
                <div className="flex justify-between items-center py-2.5 border-b border-[#292d3f]">
                  <span className="text-[#a0a5b8]">{t('reductionFactorLabel')}</span>
                  <span className="font-mono text-[#c5c9d6]">
                    {lang === 'ru' ? `в ${reductionFactor.toFixed(1)} раз` : `${reductionFactor.toFixed(1)}x`}
                  </span>
                </div>

                {/* Expiry status */}
                <div className="flex justify-between items-center py-2.5 border-b border-[#292d3f]">
                  <span className="text-[#a0a5b8]">{t('expirationAge')}</span>
                  <span className="font-semibold text-white">
                    {deltaT} {getYearsPlural(deltaT)}
                  </span>
                </div>

                {/* K coeff value used */}
                <div className="flex justify-between items-center py-2.5 border-b border-[#292d3f]">
                  <span className="text-[#a0a5b8]">{t('appliedKCoeff')}</span>
                  <span className="font-semibold text-blue-400">{kCoeff}</span>
                </div>
              </div>

              {/* Recommendations Box */}
              <div className="mt-5 p-4 rounded-xl bg-[#222739] border border-[#2f3552] text-xs leading-relaxed text-[#c5c9d6]">
                <div className="flex items-center space-x-2 mb-2 font-bold text-white text-xs uppercase tracking-wider">
                  <span className="w-6 h-6 rounded flex items-center justify-center liquid-glass-icon-amber">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                  </span>
                  <span>{t('shootingRec')}</span>
                </div>
                <p>{getExposureRecommendation()}</p>
                {deltaT > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#313854] flex items-center justify-between text-[#a0a5b8]">
                    <span>{t('meterSetting')}</span>
                    <span className="font-bold text-white flex items-center gap-1">
                      {t('setMeterTo')} {closestStandardOutput} {getUnitName(outputUnit).toUpperCase()}
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
                <h3 className="text-sm font-bold text-white">{t('simulationTitle')}</h3>
              </div>

              <p className="text-xs text-[#9095a6] mb-4">
                {t('simulationDesc')}
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
                      {t('noComp')}
                    </div>
                  </div>
                  <p className="text-[10px] text-center text-[#9095a6] leading-snug">
                    {t('noCompDesc')}
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
                      {t('withComp')}
                    </div>
                  </div>
                  <p className="text-[10px] text-center text-[#9095a6] leading-snug">
                    {t('withCompDesc')}
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
            <h3 className="text-base font-bold text-white">{t('howItWorks')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-[#a0a5b8]">
            <div className="space-y-3">
              <p>{t('formulaExplanation')}</p>

              <div className="bg-[#1c1d2b] p-4 rounded-xl text-center border border-[#25283b] my-3">
                <span className="block text-xs text-amber-500 font-bold mb-1">{t('formulaUsed')}</span>
                <code className="text-white text-base block font-mono">
                  ISOэфф = ISOисх / 2^( (ΔT / 10) * K )
                </code>
              </div>

              <p>{t('ruleOfThumb')}</p>
            </div>

            <div className="space-y-3 bg-[#131521] p-5 rounded-xl border border-[#1e212f]">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded flex items-center justify-center liquid-glass-icon-blue">
                  <Info className="w-3.5 h-3.5 text-blue-300" />
                </span>
                {t('calculationSteps')}
              </h4>
              <ol className="space-y-2 text-xs leading-relaxed">
                <li className="flex justify-between">
                  <span>{t('stepBoxSpeed')}</span>
                  <span className="text-white font-mono">{inputValue} {getUnitName(inputUnit).toUpperCase()}</span>
                </li>
                {inputUnit !== 'iso' && (
                  <li className="flex justify-between text-[#8a8fa3]">
                    <span>{t('stepBoxSpeedConverted')}</span>
                    <span className="font-mono">{isoStart.toFixed(1)} ISO</span>
                  </li>
                )}
                <li className="flex justify-between">
                  <span>{t('stepExpAge')}</span>
                  <span className="text-white font-mono">{deltaT} {getYearsPlural(deltaT)}</span>
                </li>
                <li className="flex justify-between">
                  <span>{t('stepDegradationK')}</span>
                  <span className="text-blue-400 font-mono">{kCoeff}</span>
                </li>
                <li className="flex justify-between border-t border-[#25283b] pt-2 mt-1">
                  <span>{t('stepExponentCalc')}</span>
                  <span className="text-amber-400 font-mono">({deltaT} / 10) * {kCoeff} = {stopsLost.toFixed(3)} {getStopsPlural(stopsLost)}</span>
                </li>
                <li className="flex justify-between">
                  <span>{t('stepAttenuation')}</span>
                  <span className="text-[#a0a5b8] font-mono">2^{stopsLost.toFixed(2)} = {lang === 'ru' ? `в ${reductionFactor.toFixed(2)} раз` : `${reductionFactor.toFixed(2)}x`}</span>
                </li>
                <li className="flex justify-between border-t border-[#25283b] pt-2 mt-1">
                  <span>{t('stepResult')}</span>
                  <span className="text-amber-400 font-mono">{isoStart.toFixed(1)} / {reductionFactor.toFixed(2)} = {rawIsoEff.toFixed(1)} → {isoEff} ISO</span>
                </li>
                {outputUnit !== 'iso' && (
                  <li className="flex justify-between border-t border-[#25283b] pt-2 mt-1 font-bold text-white">
                    <span>{t('stepResultConverted')}</span>
                    <span className="text-amber-400 font-mono">{rawOutputEff.toFixed(2)} → {formattedOutputEff} {getUnitName(outputUnit).toUpperCase()}</span>
                  </li>
                )}
              </ol>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#222530] mt-16 bg-[#161822]/60 py-8 text-center text-xs text-[#6e7485]">
        <div className="max-w-6xl mx-auto px-4 space-y-2">
          <p>© {new Date().getFullYear()} {t('footerCopyright')}</p>
          <p className="max-w-2xl mx-auto leading-relaxed">
            {t('footerWarning')}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
