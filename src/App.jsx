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
  Languages,
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  Check
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
    descCatFog: 'Catastrophic fog (up to 2 stops per 10 years)',
    
    // Development additions
    tabExposure: 'Exposure Calculator',
    tabDevelopment: 'Development & Timer',
    devTitle: 'Film Development Calculator & Timer',
    devSubtitle: 'Agitation cues, custom chemistry parameters, and standard formulas.',
    devFilmBw: 'B&W Negative',
    devFilmColor: 'Color Negative / Cross-Process',
    emulsionType: 'Emulsion & Grain Type',
    emulsionThin: 'Thin Emulsion / Modern T-Grain (e.g., T-Max, Delta)',
    emulsionMedium: 'Medium Emulsion / Classic Grain (e.g., HP5, FP4, Foma)',
    emulsionThick: 'Thick Emulsion / Vintage Silver (e.g., Soviet Svema, Tasma)',
    developer: 'Developer',
    developerPM: 'PM (Soviet Metol Fine-Grain, User Photo)',
    developerD76: 'D-76 (Standard Metol-Hydroquinone)',
    developerRodinal: 'Rodinal (High Acutance)',
    developerXtol: 'Xtol (Ascorbic Acid Standard)',
    developerMicrophen: 'Microphen (Fine-Grain/Push)',
    developerC41: 'C-41 Color Developer',
    dilution: 'Dilution',
    temperature: 'Temperature',
    rollNumber: 'Roll Development Number',
    rollNumberDesc: 'PM developer: increases time by 1-2 min per subsequent film (up to 3 rolls).',
    rollCounter: 'Film Roll #',
    fixer: 'Fixer Type',
    fixerAcid: 'Acid Fixer (10-15 min, User Photo)',
    fixerNeutral: 'Neutral Fixer (10-15 min, User Photo)',
    fixerRapid: 'Rapid Fixer (4-6 min)',
    agitation: 'Agitation Pattern',
    agitStandard: 'Standard B&W (Continuous 1st 30s, then 10s every 60s)',
    agitHalfMin: 'Frequent B&W (Continuous 1st 30s, then 5s every 30s)',
    agitContinuous: 'Continuous Rotary (Constant rotation)',
    agitStand: 'Minimal Stand (Continuous 1st 30s, then rest)',
    stepPrewet: 'Pre-wet / Wash',
    stepDev: 'Development',
    stepStop: 'Stop Bath',
    stepFix: 'Fixing',
    stepWash: 'Final Wash',
    stepWet: 'Wetting Agent / Stabilizer',
    timeRemaining: 'Time Remaining',
    startTimer: 'Start',
    pauseTimer: 'Pause',
    skipStep: 'Skip',
    resetTimer: 'Reset',
    agitationCue: 'AGITATE NOW (INVERT TANK)!',
    agitationRest: 'Resting (Emulsion absorbing)',
    agitationContinuousCue: 'Continuous Agitation Active',
    beepSound: 'Acoustic Alerts',
    soundOn: 'Sound On',
    soundOff: 'Muted',
    testBeep: 'Test Beep',
    setupSteps: 'Include Steps:',
    rollLabel: 'Roll',
    mins: 'min',
    secs: 'sec',
    statusFinished: 'Processing complete! Wash and hang to dry.',
    agitateAction: 'Agitate',
    restAction: 'Rest',
    instructionTitle: 'Development Technology Guide',
    instructionPMText: 'PM Developer: Dissolve the small package in 200 ml of boiled water at 40–50°C, then dissolve the large package. Top up to 350 ml and filter. Develop at 20°C. Reuse up to 3 rolls: add 1–2 minutes (+1.5m for 2nd, +3m for 3rd roll).',
    instructionFixerText: 'Fixers (Acid/Neutral): Dissolve the contents of the package in warm water, filter. Fix for 10–15 min at 18–20°C. Acid fixer is good for 3 rolls, Neutral for 10 rolls.',
    instructionGeneralText: 'Standard Developers (D-76, Rodinal, etc.): Diluting developer changes speed and grain characteristics. T-grain films require longer washing and fixing times due to heavier dye load.',
    
    // Presets & Overdevelopment calculations
    presetLabel: 'Film Preset',
    presetNone: 'Manual Selection',
    presetSvemaDS4: 'Svema DS-4 (Color, 45 ISO / 32 GOST)',
    presetSvema64: 'Svema Foto 64 (B&W, 64 ISO/GOST)',
    presetSvema65: 'Svema Foto 65 (B&W, 65 ISO/GOST, vintage)',
    presetTasma64: 'Tasma 64 (B&W, 64 ISO/GOST)',
    presetSvema125: 'Svema Foto 125 (B&W, 125 ISO/GOST)',
    useOverdevLabel: 'Compensate for age / degradation (increase dev time)',
    filmExpAgeLabel: 'Years Expired (ΔT)',
    calculatedOverdevLabel: 'Time compensation:',
    overdevFactorLabel: 'Development factor:',
    originalIsoLabel: 'Original box speed (ISO):',
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
    descCatFog: 'Катастрофическая вуаль (до 2 стопов за 10 лет)',
    
    // Development additions
    tabExposure: 'Калькулятор экспозиции',
    tabDevelopment: 'Проявка и Таймер',
    devTitle: 'Калькулятор и таймер проявки',
    devSubtitle: 'Схемы агитации, учет типа эмульсии, кастомная химия с фото и стандарты.',
    devFilmBw: 'Ч/Б негатив',
    devFilmColor: 'Цветной негатив / Кросс-процесс',
    emulsionType: 'Эмульсия и тип зерна',
    emulsionThin: 'Тонкая эмульсия / Т-зерно (T-Max, Delta)',
    emulsionMedium: 'Средняя эмульсия / Классика (HP5, FP4, Foma)',
    emulsionThick: 'Толстая эмульсия / Винтаж (советские Свема, Тасма)',
    developer: 'Проявитель',
    developerPM: 'ПМ (Метоловый мелкозернистый, из фото)',
    developerD76: 'Д-76 (Стандартный метол-гидрохиноновый)',
    developerRodinal: 'Родинал (Резкостный)',
    developerXtol: 'Xtol (Мягкий аскорбиновый)',
    developerMicrophen: 'Микрофен (Мелкозернистый / Пуш)',
    developerC41: 'C-41 проявитель (Цветной)',
    dilution: 'Разведение',
    temperature: 'Температура',
    rollNumber: 'Номер проявления в растворе',
    rollNumberDesc: 'Проявитель ПМ: время увеличивается на 1–2 мин для каждой следующей плёнки (до 3 раз).',
    rollCounter: 'Плёнка №',
    fixer: 'Тип фиксажа',
    fixerAcid: 'Кислый фиксаж (10-15 мин, из фото)',
    fixerNeutral: 'Нейтральный фиксаж (10-15 мин, из фото)',
    fixerRapid: 'Быстрый фиксаж (4-6 мин)',
    agitation: 'Схема перемешивания (агитации)',
    agitStandard: 'Стандартная Ч/Б (1-я мин постоянно, далее 10 сек каждые 60 сек)',
    agitHalfMin: 'Частая Ч/Б (1-я мин постоянно, далее 5 сек каждые 30 сек)',
    agitContinuous: 'Постоянная ротационная (Непрерывное вращение)',
    agitStand: 'Минимальная / Метол (1-я минута постоянно, далее 1-2 переворота в начале каждой минуты)',
    stepPrewet: 'Предварительный полив',
    stepDev: 'Проявление',
    stepStop: 'Стоп-ванна',
    stepFix: 'Фиксирование',
    stepWash: 'Финальная промывка',
    stepWet: 'Ополаскиватель / Стабилизатор',
    timeRemaining: 'Осталось времени',
    startTimer: 'Старт',
    pauseTimer: 'Пауза',
    skipStep: 'Пропустить',
    resetTimer: 'Сброс',
    agitationCue: 'ПЕРЕВЕРНУТЬ БАЧОК (АГИТАЦИЯ)!',
    agitationRest: 'Покой (Впитывание эмульсии)',
    agitationContinuousCue: 'Активна постоянная агитация',
    beepSound: 'Звуковые сигналы',
    soundOn: 'Звук включен',
    soundOff: 'Звук выключен',
    testBeep: 'Тест сигнала',
    setupSteps: 'Включить шаги:',
    rollLabel: 'Плёнка',
    mins: 'мин',
    secs: 'сек',
    statusFinished: 'Процесс завершен! Промойте плёнку и повесьте сушиться.',
    agitateAction: 'Перемешивание',
    restAction: 'Покой',
    instructionTitle: 'Руководство по технологии проявки',
    instructionPMText: 'Проявитель ПМ: Растворить малый пакет в 200 мл кипяченой воды (40–50°C), затем добавить большой пакет. Объем довести до 350 мл, отфильтровать. Проявлять при 20°C. Ресурс: до 3 плёнок (для 2-й плёнки добавить +1.5 мин, для 3-й добавить +3 мин).',
    instructionFixerText: 'Фиксажи (Кислый/Нейтральный): Растворить содержимое пакета в теплой воде, профильтровать. Фиксировать 10–15 мин при 18–20°C. Кислый фиксаж рассчитан на 3 плёнки, Нейтральный — на 10 плёнок.',
    instructionGeneralText: 'Стандартные проявители (Д-76, Родинал и др.): Разбавление проявителя меняет зернистость и контурную резкость. Плёнки с Т-зерном требуют более долгого фиксирования и промывки для полного вымывания красителей.',
    
    // Presets & Overdevelopment calculations
    presetLabel: 'Пресет плёнки',
    presetNone: 'Ручной выбор',
    presetSvemaDS4: 'Свема ДС-4 (Цветная, 45 ISO / 32 ГОСТ)',
    presetSvema64: 'Свема Фото 64 (Ч/Б, 64 ISO/ГОСТ)',
    presetSvema65: 'Свема Фото 65 (Ч/Б, 65 ISO/ГОСТ, винтаж)',
    presetTasma64: 'Тасма 64 (Ч/Б, 64 ISO/ГОСТ)',
    presetSvema125: 'Свема Фото 125 (Ч/Б, 125 ISO/ГОСТ)',
    useOverdevLabel: 'Компенсировать просрочку / вуаль (увеличить время проявления)',
    filmExpAgeLabel: 'Срок просрочки плёнки (лет)',
    calculatedOverdevLabel: 'Компенсация времени:',
    overdevFactorLabel: 'Коэффициент удлинения:',
    originalIsoLabel: 'Изначальное ISO (номинал):',
  }
};

function App() {
  // Lang state (defaults to English)
  const [lang, setLang] = useState('en');

  // Top-level Navigation (exposure or development)
  const [activeTab, setActiveTab] = useState('exposure'); // 'exposure' or 'development'

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

  // ----------------------------------------------------
  // FILM DEVELOPMENT STATE VARIABLES
  // ----------------------------------------------------
  const [devPreset, setDevPreset] = useState('none'); // 'none', 'ds4', 'foto64', 'foto65', 'tasma64', 'foto125'
  const [devFilmType, setDevFilmType] = useState('bw'); // 'bw' or 'color'
  const [emulsion, setEmulsion] = useState('medium'); // 'thin' (T-Grain/Thin), 'medium' (Classic), 'thick' (Vintage Silver / Soviet)
  const [developer, setDeveloper] = useState('pm'); // 'pm', 'd76', 'rodinal', 'xtol', 'microphen', 'c41'
  const [dilution, setDilution] = useState('stock'); // 'stock', '1+1', '1+2', '1+3', '1+25', '1+50'
  const [temperature, setTemperature] = useState(20); // 18, 20, 22, 24, 38 etc
  const [pmRollNumber, setPmRollNumber] = useState(1); // 1, 2, 3 (resource coefficient for PM: +0/1.5/3.0 min)

  // Film degradation / age compensation checkbox and manual sliders in development view
  const [compensateAge, setCompensateAge] = useState(false);
  const [devOriginalIso, setDevOriginalIso] = useState(64); // original speed for age compensation calculations
  const [devExpireYear, setDevExpireYear] = useState(1996); // expiration year of the film
  const [devCurrentYear, setDevCurrentYear] = useState(2026); // current shooting year
  
  // Fixer variables (Acid and Neutral are the user's chemicals from photos)
  const [fixerType, setFixerType] = useState('acid'); // 'acid', 'neutral', 'rapid'
  const [agitationPattern, setAgitationPattern] = useState('standard'); // 'standard', 'halfmin', 'continuous', 'stand'

  // Included steps in timer
  const [includePrewet, setIncludePrewet] = useState(true);
  const [includeStopBath, setIncludeStopBath] = useState(true);
  const [includeWetting, setIncludeWetting] = useState(true);

  // Timer run states
  const [timerRunning, setTimerRunning] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0); // index in currentSteps array
  const [stepSecondsRemaining, setStepSecondsRemaining] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Keep AudioContext in a ref to avoid browser blocks inside setInterval
  const audioCtxRef = React.useRef(null);

  const initAudio = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    } catch (e) {
      console.warn('Unable to initialize AudioContext:', e);
    }
  };

  // Audio feedback helper (using Web Audio API so it runs without external files)
  const playSoundNotification = (freq = 880, duration = 0.25) => {
    if (!soundEnabled) return;
    try {
      // Lazy load/unlock AudioContext
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const audioCtx = audioCtxRef.current;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.value = freq;
      
      // Prevent clicking by ramping down the volume
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  };

  // Sound test button
  const handleTestBeep = () => {
    initAudio();
    playSoundNotification(880, 0.3);
    setTimeout(() => {
      playSoundNotification(1200, 0.2);
    }, 150);
  };

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

  // Preset configuration matching when devPreset changes
  useEffect(() => {
    if (devPreset === 'ds4') {
      setDevFilmType('color');
      setEmulsion('thick');
      setDeveloper('c41');
      setDilution('stock');
      setTemperature(38);
      setFixerType('rapid');
      setAgitationPattern('continuous');
      setDevOriginalIso(45);
    } else if (devPreset === 'foto64') {
      setDevFilmType('bw');
      setEmulsion('thick'); // Svema is vintage thick emulsion
      setDeveloper('pm');
      setDilution('stock');
      setTemperature(20);
      setFixerType('acid');
      setAgitationPattern('stand'); // "Метол любит покой" - stand/semi-stand fits better
      setDevOriginalIso(64);
    } else if (devPreset === 'foto65') {
      setDevFilmType('bw');
      setEmulsion('thick');
      setDeveloper('pm');
      setDilution('stock');
      setTemperature(20);
      setFixerType('acid');
      setAgitationPattern('stand');
      setDevOriginalIso(65);
    } else if (devPreset === 'tasma64') {
      setDevFilmType('bw');
      setEmulsion('thick'); // Tasma vintage is thick emulsion
      setDeveloper('d76');
      setDilution('stock');
      setTemperature(20);
      setFixerType('neutral');
      setAgitationPattern('standard');
      setDevOriginalIso(64);
    } else if (devPreset === 'foto125') {
      setDevFilmType('bw');
      setEmulsion('thick'); // Svema vintage is thick emulsion
      setDeveloper('pm');
      setDilution('stock');
      setTemperature(20);
      setFixerType('acid');
      setAgitationPattern('stand');
      setDevOriginalIso(125);
    }
  }, [devPreset]);

  // ----------------------------------------------------
  // CALCULATIONS & FORMULAS FOR FILM DEVELOPMENT TIME
  // ----------------------------------------------------

  // Calculate development age based on expiration year and shooting year
  const calculatedDevFilmAge = Math.max(0, devCurrentYear - devExpireYear);

  // Calculate devKCoeff using the exact same formula rules as exposure calculator
  const getDevKCoeff = () => {
    // Get base K recommendation based on devOriginalIso
    let baseK = 1.0;
    if (devOriginalIso <= 64) {
      baseK = 0.75;
    } else if (devOriginalIso > 64 && devOriginalIso <= 250) {
      baseK = 1.0;
    } else if (devOriginalIso > 250 && devOriginalIso <= 600) {
      baseK = 1.3;
    } else {
      baseK = 1.9;
    }

    // Apply storage multipliers
    let multiplier = 1.0;
    if (storage === 'freezer') multiplier = 0.2;
    if (storage === 'fridge') multiplier = 0.5;
    if (storage === 'hot') multiplier = 1.6;

    // Adjust based on film type
    let typeMult = 1.0;
    if (devFilmType === 'bw') typeMult = 0.8;

    return parseFloat((baseK * multiplier * typeMult).toFixed(2));
  };

  const devKCoeff = getDevKCoeff();

  // Calculate age compensation time extension factor
  // For expired film, fog increases and sensitivity drops. If we want to compensate this in development
  // (especially when the film is shot closer to speed or we just want to improve contrast to break fog):
  // Common rule: Increase development time by 10% for every 10 years expired, up to +50% max.
  // BUT the user reported that Svema 64 (originally 64 GOST/ISO, expired to effective ISO 16, which is a 2-stop loss, i.e. 20 years expired)
  // got good results with PM developer at 16-18 minutes at 20°C.
  // Let's calibrate:
  // Base dev time for Svema 64 (thick emulsion, PM developer, 20°C) is 10.0 minutes (600 seconds).
  // Target dev time is ~17.0 minutes (1020 seconds), which is a factor of 1.7x (or +70%).
  // Let's define the factor to scale more aggressively for thick vintage emulsions (which lose speed and fog heavily),
  // e.g. B&W thick vintage emulsion gets +23% development time per 10 years expired.
  // Specifically:
  // - thick emulsion (Soviet/vintage): Factor = 1.0 + (yearsExpired / 10) * 0.23
  //   For Svema 64 at ISO 16 (expired in 1996, shot in 2026, which is 30 years):
  //   Factor = 1.0 + (30 / 10) * 0.23 = 1.69.
  //   10.0 min * 1.69 = 16.9 minutes (16 minutes 54 seconds), which perfectly matches the user's 16-18 minutes range!
  // - medium emulsion: Factor = 1.0 + (yearsExpired / 10) * 0.15
  // - thin emulsion: Factor = 1.0 + (yearsExpired / 10) * 0.10
  const getAgeCompensationFactor = () => {
    if (!compensateAge) return 1.0;
    
    let rate = 0.15; // default medium
    if (emulsion === 'thick') rate = 0.23; // Soviet vintage thick needs more push/contrast
    if (emulsion === 'thin') rate = 0.10;

    const factor = 1.0 + (calculatedDevFilmAge / 10) * rate;
    return Math.min(2.0, Math.max(1.0, factor));
  };

  // Calculate base development time in seconds
  // Standard development times at 20°C in dilution "stock"
  // PM developer: (from packaging instruction) - develops up to 3 rolls.
  // We determine base development times based on film type and emulsion thickness (grain type):
  //   - color: 3.25 min (standard C-41 color developer time is 3m15s)
  //   - bw + thin (modern T-grain): D-76 is usually ~7.5 min, PM ~8 min, Rodinal ~11 min, Xtol ~8 min, Microphen ~7 min
  //   - bw + medium (classic grain): D-76 ~8.5 min, PM ~9 min, Rodinal ~13 min, XTol ~9 min, Microphen ~8 min
  //   - bw + thick (vintage Soviet): D-76 ~10 min, PM ~10 min (fits old packaging instructions for Svema/Tasma), Rodinal ~15 min, XTol ~10.5 min, Microphen ~9.5 min
  const getBaseDevTime = () => {
    if (developer === 'c41') {
      return 195; // 3m 15s color dev constant
    }

    let baseMin = 9; // default B&W time at 20°C in stock
    
    if (developer === 'pm') {
      if (emulsion === 'thin') baseMin = 8.0;
      else if (emulsion === 'medium') baseMin = 9.0;
      else baseMin = 10.0;
    } else if (developer === 'd76') {
      if (emulsion === 'thin') baseMin = 7.5;
      else if (emulsion === 'medium') baseMin = 8.5;
      else baseMin = 10.0;
    } else if (developer === 'rodinal') {
      if (emulsion === 'thin') baseMin = 11.0;
      else if (emulsion === 'medium') baseMin = 13.0;
      else baseMin = 15.0;
    } else if (developer === 'xtol') {
      if (emulsion === 'thin') baseMin = 8.0;
      else if (emulsion === 'medium') baseMin = 9.0;
      else baseMin = 10.5;
    } else if (developer === 'microphen') {
      if (emulsion === 'thin') baseMin = 7.0;
      else if (emulsion === 'medium') baseMin = 8.0;
      else baseMin = 9.5;
    }

    return baseMin * 60;
  };

  // Adjust for Dilution
  // Diluting developer increases development time:
  // - stock: x1.0
  // - 1+1: x1.5 (for D-76, Xtol, PM)
  // - 1+2: x1.8
  // - 1+3: x2.2
  // - 1+25 (Rodinal): x1.0 (as Rodinal standard base is calculated for 1+25)
  // - 1+50 (Rodinal): x2.0
  const getDilutionFactor = () => {
    if (developer === 'c41') return 1.0;
    
    if (developer === 'rodinal') {
      if (dilution === '1+50') return 2.0;
      return 1.0; // standard base is 1+25
    }

    switch (dilution) {
      case '1+1': return 1.5;
      case '1+2': return 1.8;
      case '1+3': return 2.2;
      case 'stock':
      default:
        return 1.0;
    }
  };

  // Adjust for Temperature
  // Photographic chemical times follow the Arrhenius relation.
  // The standard rule is: for every 1°C increase, reduce time by 4% to 5% (and vice versa).
  // Time_T = Time_20 * exp(-0.045 * (T - 20))
  // For C-41, we operate strictly at 38°C (temperature coefficient matches standard 38°C development).
  const getTemperatureFactor = () => {
    if (developer === 'c41') {
      // If color process temperature is selected, we adjust relative to 38°C standard
      return Math.exp(-0.045 * (temperature - 38));
    }
    // B&W standard is 20°C
    return Math.exp(-0.045 * (temperature - 20));
  };

  // Adjust for Roll Number (for PM developer)
  // Packaging instructions: "В свежеприготовленном растворе проявлять до трех катушечных фотопленок. При проявлении каждой последующей пленки время проявления увеличить на 1-2 минуты."
  // Let's take the middle: +1.5 minutes (90 seconds) for roll #2, and +3.0 minutes (180 seconds) for roll #3.
  const getRollCompensationSeconds = () => {
    if (developer === 'pm') {
      if (pmRollNumber === 2) return 90;
      if (pmRollNumber === 3) return 180;
    }
    return 0;
  };

  // Calculate final development time in seconds
  const calculateFinalDevSeconds = () => {
    const baseSeconds = getBaseDevTime();
    const dilutionFactor = getDilutionFactor();
    const tempFactor = getTemperatureFactor();
    const rollBonus = getRollCompensationSeconds();
    const overdevFactor = getAgeCompensationFactor(); // overdevelopment time multiplier for expired film

    const result = Math.round((baseSeconds * dilutionFactor * tempFactor + rollBonus) * overdevFactor);
    return Math.max(30, result);
  };

  const finalDevSeconds = calculateFinalDevSeconds();

  // Get fixer time based on type and film emulsion
  // Standard Acid/Neutral Fixer time (from packaging): "Фиксировать 10-15 мин при 18-20°C"
  // Standard Rapid Fixer: 4-6 min
  // Thick or T-grain emulsions contain more silver/sensitizing dyes, requiring longer fixing.
  // - Thin/T-grain: Fix for upper range or slightly longer (e.g. 14 min for Acid/Neutral, 6 min for Rapid)
  // - Medium: 12 min for Acid/Neutral, 5 min for Rapid
  // - Thick: 15 min for Acid/Neutral, 6 min for Rapid
  const getFixSeconds = () => {
    if (fixerType === 'rapid') {
      if (emulsion === 'medium') return 300; // 5 min
      return 360; // 6 min
    }
    // Acid or Neutral
    if (emulsion === 'thin') return 840; // 14 min
    if (emulsion === 'medium') return 720; // 12 min
    return 900; // 15 min (Thick/Vintage)
  };

  const finalFixSeconds = getFixSeconds();

  // Define steps list dynamically
  const buildStepsList = () => {
    const steps = [];

    // Step 1: Pre-wet / Pre-wash (optional)
    if (includePrewet) {
      steps.push({
        id: 'prewet',
        name: t('stepPrewet'),
        duration: 60, // 1 min standard wash
        agitation: 'continuous',
        color: 'border-cyan-500 text-cyan-400 bg-cyan-950/20'
      });
    }

    // Step 2: Developer
    steps.push({
      id: 'developer',
      name: t('stepDev') + ` (${developer.toUpperCase()} ${dilution === 'stock' ? 'Stock' : dilution}, ${temperature}°C)`,
      duration: finalDevSeconds,
      agitation: agitationPattern,
      color: 'border-amber-500 text-amber-400 bg-amber-950/20'
    });

    // Step 3: Stop bath (optional or automatically included for color)
    if (includeStopBath || devFilmType === 'color') {
      steps.push({
        id: 'stopbath',
        name: t('stepStop'),
        duration: 30, // 30 sec stop bath
        agitation: 'continuous',
        color: 'border-yellow-500 text-yellow-400 bg-yellow-950/20'
      });
    }

    // Step 4: Fixer
    steps.push({
      id: 'fixer',
      name: t('stepFix') + ` (${fixerType === 'rapid' ? t('fixerRapid') : fixerType === 'acid' ? t('fixerAcid') : t('fixerNeutral')})`,
      duration: finalFixSeconds,
      agitation: 'standard', // fix is standard agitation
      color: 'border-purple-500 text-purple-400 bg-purple-950/20'
    });

    // Step 5: Wash (always included)
    steps.push({
      id: 'wash',
      name: t('stepWash'),
      duration: 300, // 5 min final wash
      agitation: 'standard',
      color: 'border-blue-500 text-blue-400 bg-blue-950/20'
    });

    // Step 6: Wetting Agent / Stabilizer (optional)
    if (includeWetting) {
      steps.push({
        id: 'wetting',
        name: t('stepWet'),
        duration: 60, // 1 min stabilizer/wetting
        agitation: 'none', // no agitation for wetting agent to prevent bubble marks
        color: 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
      });
    }

    return steps;
  };

  const currentSteps = buildStepsList();
  const currentStep = currentSteps[activeStepIndex] || null;

  // Initialize step countdown when activeStepIndex or steps list changes
  useEffect(() => {
    if (currentStep) {
      setStepSecondsRemaining(currentStep.duration);
    }
  }, [activeStepIndex, developer, dilution, temperature, emulsion, pmRollNumber, fixerType, includePrewet, includeStopBath, includeWetting, devFilmType]);

  // Main countdown effect
  useEffect(() => {
    let intervalId = null;
    
    if (timerRunning) {
      intervalId = setInterval(() => {
        setStepSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Sound cue when step ends
            playSoundNotification(587.33, 0.15); // D5 note
            setTimeout(() => playSoundNotification(880, 0.4), 180); // A5 note

            // Go to next step or finish
            if (activeStepIndex < currentSteps.length - 1) {
              setActiveStepIndex((prevIdx) => prevIdx + 1);
            } else {
              setTimerRunning(false);
              playSoundNotification(1046.5, 0.5); // high C6 finish chime
            }
            return 0;
          }

          const nextSec = prev - 1;

          // Sound check for AGITATION warnings:
          // Check if nextSec falls inside the agitation interval
          // Continuous agitation: no sound cues needed except start
          // Standard B&W agitation: Continuous 1st 30s, then 10s every 60s
          // Frequent B&W agitation: Continuous 1st 30s, then 5s every 30s
          if (currentStep && currentStep.id === 'developer' && activeStepIndex === activeStepIndex) {
            const elapsed = currentStep.duration - nextSec;
            
            if (agitationPattern === 'standard') {
              // Beep at 30s mark (end of continuous)
              if (elapsed === 30) {
                playSoundNotification(440, 0.2);
              }
              // Beep 3 seconds before next agitation interval (every 60s starting at 60s, i.e., 57, 58, 59...)
              else if (elapsed > 30 && (elapsed % 60 === 57 || elapsed % 60 === 58 || elapsed % 60 === 59)) {
                playSoundNotification(660, 0.08); // warning tick
              }
              // High beep at start of agitation (elapsed % 60 === 0)
              else if (elapsed > 30 && elapsed % 60 === 0) {
                playSoundNotification(880, 0.35); // Agitation start bell
              }
            } else if (agitationPattern === 'halfmin') {
              if (elapsed === 30) {
                playSoundNotification(440, 0.2);
              }
              else if (elapsed > 30 && (elapsed % 30 === 27 || elapsed % 30 === 28 || elapsed % 30 === 29)) {
                playSoundNotification(660, 0.08); // warning tick
              }
              else if (elapsed > 30 && elapsed % 30 === 0) {
                playSoundNotification(880, 0.35); // Agitation start bell
              }
            }
          }

          return nextSec;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [timerRunning, activeStepIndex, currentSteps, agitationPattern, currentStep]);

  // Determine current agitation state to display to user
  const getAgitationStatus = () => {
    if (!currentStep) return { status: 'idle', label: '' };
    if (!timerRunning) return { status: 'idle', label: t('startTimer') };

    const elapsed = currentStep.duration - stepSecondsRemaining;

    // Prewet & Stop Bath are Continuous
    if (currentStep.agitation === 'continuous' || currentStep.id === 'prewet' || currentStep.id === 'stopbath') {
      return { status: 'agitate', label: t('agitationContinuousCue') };
    }

    if (currentStep.agitation === 'none') {
      return { status: 'rest', label: t('agitationRest') };
    }

    // Developer or standard step agitation patterns
    if (currentStep.id === 'developer' || currentStep.id === 'fixer' || currentStep.id === 'wash') {
      const pattern = currentStep.id === 'developer' ? agitationPattern : 'standard';

      if (pattern === 'continuous') {
        return { status: 'agitate', label: t('agitationContinuousCue') };
      }

      if (pattern === 'stand') {
        // Continuous first 60 seconds, then 1-2 inversions (5s) at the start of each minute
        if (elapsed <= 60) {
          return { status: 'agitate', label: t('agitationCue') + ` (1st 60s)` };
        }
        const cycleSec = elapsed % 60;
        if (cycleSec > 0 && cycleSec <= 5) {
          return { status: 'agitate', label: t('agitationCue') + ` (1-2 flips: ${5 - cycleSec}s)` };
        }
        return { status: 'rest', label: t('agitationRest') };
      }

      // Standard B&W: continuous first 30s, then 10s every 60s
      if (pattern === 'standard') {
        if (elapsed <= 30) {
          return { status: 'agitate', label: t('agitationCue') + ` (1st 30s)` };
        }
        const cycleSec = elapsed % 60;
        if (cycleSec > 0 && cycleSec <= 10) {
          return { status: 'agitate', label: t('agitationCue') + ` (${10 - cycleSec}s ${t('secs')})` };
        }
        return { status: 'rest', label: t('agitationRest') };
      }

      // Frequent B&W: continuous first 30s, then 5s every 30s
      if (pattern === 'halfmin') {
        if (elapsed <= 30) {
          return { status: 'agitate', label: t('agitationCue') + ` (1st 30s)` };
        }
        const cycleSec = elapsed % 30;
        if (cycleSec > 0 && cycleSec <= 5) {
          return { status: 'agitate', label: t('agitationCue') + ` (${5 - cycleSec}s ${t('secs')})` };
        }
        return { status: 'rest', label: t('agitationRest') };
      }
    }

    return { status: 'rest', label: t('agitationRest') };
  };

  const agitationStatus = getAgitationStatus();

  // Formatting minutes and seconds
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer controls
  const handleStartPause = () => {
    initAudio();
    setTimerRunning(!timerRunning);
  };

  const handleSkip = () => {
    initAudio();
    if (activeStepIndex < currentSteps.length - 1) {
      setActiveStepIndex((prev) => prev + 1);
    } else {
      setTimerRunning(false);
      setActiveStepIndex(0);
    }
  };

  const handleResetTimer = () => {
    initAudio();
    setTimerRunning(false);
    setActiveStepIndex(0);
    if (currentSteps[0]) {
      setStepSecondsRemaining(currentSteps[0].duration);
    }
  };

  // Sync developer list when film type changes (Color film needs C-41)
  useEffect(() => {
    if (devFilmType === 'color') {
      setDeveloper('c41');
      setDilution('stock');
      setTemperature(38);
      setFixerType('rapid');
      setAgitationPattern('continuous');
    } else {
      // standard B&W defaults
      setDeveloper('pm');
      setDilution('stock');
      setTemperature(20);
      setFixerType('acid');
      setAgitationPattern('standard');
    }
  }, [devFilmType]);

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
        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8 bg-[#161822] p-1.5 rounded-xl border border-[#222530] max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('exposure')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'exposure'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10'
                : 'text-[#a0a5b8] hover:text-white hover:bg-[#222530]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            {t('tabExposure')}
          </button>
          <button
            onClick={() => setActiveTab('development')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'development'
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/10'
                : 'text-[#a0a5b8] hover:text-white hover:bg-[#222530]'
            }`}
          >
            <Clock className="w-4 h-4" />
            {t('tabDevelopment')}
          </button>
        </div>

        {activeTab === 'exposure' ? (
          <>
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
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT COLUMN: Controls & Settings */}
            <div className="lg:col-span-7 space-y-6">
              {/* Card 1: Development Parameters */}
              <div className="bg-[#161822] border border-[#222530] rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>

                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center liquid-glass-icon-blue glossy-glow">
                    <Sliders className="w-5 h-5 text-blue-300" />
                  </div>
                  <h2 className="text-lg font-bold text-white">{t('filmParams')}</h2>
                </div>

                <div className="space-y-6">
                  {/* Ready-made Presets Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-[#a0a5b8] mb-2 uppercase tracking-wider">
                      {t('presetLabel')}
                    </label>
                    <select
                      value={devPreset}
                      onChange={(e) => setDevPreset(e.target.value)}
                      className="w-full bg-[#222530] border border-[#2e3344] rounded-lg px-3 py-2.5 text-white font-semibold text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="none">-- {t('presetNone')} --</option>
                      <option value="ds4">{t('presetSvemaDS4')}</option>
                      <option value="foto64">{t('presetSvema64')}</option>
                      <option value="foto65">{t('presetSvema65')}</option>
                      <option value="tasma64">{t('presetTasma64')}</option>
                      <option value="foto125">{t('presetSvema125')}</option>
                    </select>
                  </div>

                  {/* Dev Film Type */}
                  <div className="grid grid-cols-2 gap-3 bg-[#1b1e2c] p-1.5 rounded-xl border border-[#272a3f] text-xs font-bold">
                    <button
                      onClick={() => {
                        setDevPreset('none');
                        setDevFilmType('bw');
                      }}
                      className={`py-2 rounded-lg transition-all ${
                        devFilmType === 'bw'
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'text-[#a0a5b8] hover:text-white'
                      }`}
                    >
                      {t('devFilmBw')}
                    </button>
                    <button
                      onClick={() => {
                        setDevPreset('none');
                        setDevFilmType('color');
                      }}
                      className={`py-2 rounded-lg transition-all ${
                        devFilmType === 'color'
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'text-[#a0a5b8] hover:text-white'
                      }`}
                    >
                      {t('devFilmColor')}
                    </button>
                  </div>

                  {/* Emulsion Thickness / Grain Type */}
                  <div>
                    <label className="block text-xs font-semibold text-[#a0a5b8] mb-2 uppercase tracking-wider">
                      {t('emulsionType')}
                    </label>
                    <select
                      value={emulsion}
                      onChange={(e) => setEmulsion(e.target.value)}
                      className="w-full bg-[#222530] border border-[#2e3344] rounded-lg px-3 py-2.5 text-white font-semibold text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="thin">{t('emulsionThin')}</option>
                      <option value="medium">{t('emulsionMedium')}</option>
                      <option value="thick">{t('emulsionThick')}</option>
                    </select>
                  </div>

                  {/* Developer Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#a0a5b8] mb-2 uppercase tracking-wider">
                        {t('developer')}
                      </label>
                      <select
                        value={developer}
                        onChange={(e) => {
                          const dev = e.target.value;
                          setDeveloper(dev);
                          if (dev === 'c41') {
                            setDevFilmType('color');
                          } else {
                            setDevFilmType('bw');
                          }
                        }}
                        className="w-full bg-[#222530] border border-[#2e3344] rounded-lg px-3 py-2.5 text-white font-semibold text-sm focus:outline-none focus:border-blue-500"
                      >
                        <option value="pm">{t('developerPM')}</option>
                        <option value="d76">{t('developerD76')}</option>
                        <option value="rodinal">{t('developerRodinal')}</option>
                        <option value="xtol">{t('developerXtol')}</option>
                        <option value="microphen">{t('developerMicrophen')}</option>
                        <option value="c41">{t('developerC41')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#a0a5b8] mb-2 uppercase tracking-wider">
                        {t('dilution')}
                      </label>
                      <select
                        value={dilution}
                        onChange={(e) => setDilution(e.target.value)}
                        disabled={developer === 'c41'}
                        className="w-full bg-[#222530] border border-[#2e3344] rounded-lg px-3 py-2.5 text-white font-semibold text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
                      >
                        {developer === 'rodinal' ? (
                          <>
                            <option value="1+25">1+25</option>
                            <option value="1+50">1+50</option>
                          </>
                        ) : developer === 'c41' ? (
                          <option value="stock">Stock</option>
                        ) : (
                          <>
                            <option value="stock">Stock</option>
                            <option value="1+1">1+1</option>
                            <option value="1+2">1+2</option>
                            <option value="1+3">1+3</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Temperature slider */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-[#c5c9d6]">
                        {t('temperature')}
                      </label>
                      <span className="text-base font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                        {temperature}°C
                      </span>
                    </div>
                    <input
                      type="range"
                      min={developer === 'c41' ? 30 : 15}
                      max={developer === 'c41' ? 42 : 28}
                      step="0.5"
                      value={temperature}
                      onChange={(e) => setTemperature(Number(e.target.value))}
                      className="w-full h-2 bg-[#222530] rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  {/* PM Developer Roll Count Multiplier */}
                  {developer === 'pm' && (
                    <div className="p-4 rounded-xl bg-[#1b1e2c] border border-[#272a3f]">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-semibold text-[#a0a5b8] uppercase tracking-wider">
                          {t('rollNumber')}
                        </label>
                        <span className="text-xs font-bold text-amber-400">
                          {t('rollCounter')}{pmRollNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#9095a6] mb-3 leading-normal">
                        {t('rollNumberDesc')}
                      </p>
                      <div className="flex space-x-2">
                        {[1, 2, 3].map((num) => (
                          <button
                            key={num}
                            onClick={() => setPmRollNumber(num)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                              pmRollNumber === num
                                ? 'bg-amber-500 text-black border-amber-400'
                                : 'bg-[#222530] text-[#a0a5b8] border-[#2e3344] hover:bg-[#2b2f3e] hover:text-white'
                            }`}
                          >
                            {t('rollLabel')} #{num}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <hr className="border-[#222530]" />

                  {/* Fixer & Agitation Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#a0a5b8] mb-2 uppercase tracking-wider">
                        {t('fixer')}
                      </label>
                      <select
                        value={fixerType}
                        onChange={(e) => setFixerType(e.target.value)}
                        className="w-full bg-[#222530] border border-[#2e3344] rounded-lg px-3 py-2.5 text-white font-semibold text-sm focus:outline-none focus:border-blue-500"
                      >
                        <option value="acid">{t('fixerAcid')}</option>
                        <option value="neutral">{t('fixerNeutral')}</option>
                        <option value="rapid">{t('fixerRapid')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#a0a5b8] mb-2 uppercase tracking-wider">
                        {t('agitation')}
                      </label>
                      <select
                        value={agitationPattern}
                        onChange={(e) => setAgitationPattern(e.target.value)}
                        disabled={developer === 'c41'}
                        className="w-full bg-[#222530] border border-[#2e3344] rounded-lg px-3 py-2.5 text-white font-semibold text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
                      >
                        <option value="standard">{t('agitStandard')}</option>
                        <option value="halfmin">{t('agitHalfMin')}</option>
                        <option value="continuous">{t('agitContinuous')}</option>
                        <option value="stand">{t('agitStand')}</option>
                      </select>
                    </div>
                  </div>

                  {/* Step Setup Toggles */}
                  <div>
                    <label className="block text-xs font-semibold text-[#a0a5b8] mb-2.5 uppercase tracking-wider">
                      {t('setupSteps')}
                    </label>
                    <div className="flex flex-wrap gap-4 text-xs font-semibold text-[#c5c9d6]">
                      <label className="flex items-center space-x-2.5 cursor-pointer hover:text-white transition-all">
                        <input
                          type="checkbox"
                          checked={includePrewet}
                          onChange={(e) => setIncludePrewet(e.target.checked)}
                          className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
                        />
                        <span>{t('stepPrewet')}</span>
                      </label>
                      
                      <label className="flex items-center space-x-2.5 cursor-pointer hover:text-white transition-all">
                        <input
                          type="checkbox"
                          checked={includeStopBath}
                          disabled={devFilmType === 'color'}
                          onChange={(e) => setIncludeStopBath(e.target.checked)}
                          className="w-4 h-4 rounded accent-blue-500 cursor-pointer disabled:opacity-50"
                        />
                        <span>{t('stepStop')}</span>
                      </label>

                      <label className="flex items-center space-x-2.5 cursor-pointer hover:text-white transition-all">
                        <input
                          type="checkbox"
                          checked={includeWetting}
                          onChange={(e) => setIncludeWetting(e.target.checked)}
                          className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
                        />
                        <span>{t('stepWet')}</span>
                      </label>
                    </div>
                  </div>

                  <hr className="border-[#222530]" />

                  {/* Film Degradation / Age Time Compensation Calculator Checkbox & UI */}
                  <div className="p-4 rounded-xl bg-[#1b1e2c] border border-[#272a3f] space-y-4">
                    <label className="flex items-start space-x-3 cursor-pointer text-xs font-bold text-[#c5c9d6] hover:text-white transition-all">
                      <input
                        type="checkbox"
                        checked={compensateAge}
                        onChange={(e) => setCompensateAge(e.target.checked)}
                        className="w-4.5 h-4.5 rounded accent-blue-500 cursor-pointer mt-0.5"
                      />
                      <span className="leading-tight">{t('useOverdevLabel')}</span>
                    </label>

                    {compensateAge && (
                      <div className="space-y-4 pt-2 border-t border-[#272a3f]">
                        {/* Expiration Year and Current Year Sliders */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="block text-xs text-[#a0a5b8] mb-1">
                              {lang === 'ru' ? 'Год окончания срока' : 'Expiration Year'}
                            </span>
                            <input
                              type="number"
                              min="1950"
                              max={devCurrentYear}
                              value={devExpireYear}
                              onChange={(e) => setDevExpireYear(Number(e.target.value))}
                              className="w-full bg-[#222530] border border-[#2e3344] rounded-lg px-2.5 py-1.5 text-white font-semibold text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <span className="block text-xs text-[#a0a5b8] mb-1">
                              {lang === 'ru' ? 'Текущий год съёмки' : 'Current Shooting Year'}
                            </span>
                            <input
                              type="number"
                              min={devExpireYear}
                              max="2100"
                              value={devCurrentYear}
                              onChange={(e) => setDevCurrentYear(Number(e.target.value))}
                              className="w-full bg-[#222530] border border-[#2e3344] rounded-lg px-2.5 py-1.5 text-white font-semibold text-xs focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="text-xs text-[#a0a5b8] flex justify-between bg-[#222530] p-2 rounded border border-[#2e3344]">
                          <span>{t('howManyYears')}:</span>
                          <span className="font-bold text-white">{calculatedDevFilmAge} {getYearsPlural(calculatedDevFilmAge)}</span>
                        </div>

                        {/* Original speed input slider */}
                        <div>
                          <div className="flex justify-between items-center mb-1 text-xs text-[#a0a5b8]">
                            <span>{t('originalIsoLabel')}</span>
                            <span className="font-bold text-blue-400">{devOriginalIso} ISO</span>
                          </div>
                          <input
                            type="range"
                            min="12"
                            max="400"
                            step="1"
                            value={devOriginalIso}
                            onChange={(e) => setDevOriginalIso(Number(e.target.value))}
                            className="w-full h-2 bg-[#222530] rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
                          />
                        </div>

                        {/* Calculation report summary */}
                        <div className="bg-[#131521] p-3 rounded-lg border border-[#23263b] space-y-2 text-[11px] leading-relaxed text-[#9095a6]">
                          <div className="flex justify-between">
                            <span>{t('overdevFactorLabel')}</span>
                            <span className="font-bold text-white font-mono">{getAgeCompensationFactor().toFixed(2)}x</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t('calculatedOverdevLabel')}</span>
                            <span className="font-bold text-amber-400 font-mono">
                              +{Math.round((getAgeCompensationFactor() - 1.0) * 100)}% ({lang === 'ru' ? 'к времени' : 'to time'})
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-[#23263b] pt-1.5 mt-1">
                            <span>{lang === 'ru' ? 'Новое расчетное ISO (утраченное):' : 'Calculated ISO (degraded):'}</span>
                            <span className="font-bold text-red-400 font-mono">
                              ~{Math.max(1, Math.round(devOriginalIso / Math.pow(2, (calculatedDevFilmAge / 10) * devKCoeff)))} ISO
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 2: Educational technology guide instructions */}
              <div className="bg-[#161822] border border-[#222530] rounded-2xl p-6 shadow-xl relative overflow-hidden text-xs text-[#a0a5b8] leading-relaxed space-y-3">
                <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-2 text-xs">
                  <BookOpen className="w-4 h-4 text-blue-300" />
                  {t('instructionTitle')}
                </h3>
                <p>
                  <b>{developer === 'pm' ? 'PM' : developer.toUpperCase()}:</b>{' '}
                  {developer === 'pm' ? t('instructionPMText') : t('instructionGeneralText')}
                </p>
                <p>
                  <b>{t('fixer')}:</b> {t('instructionFixerText')}
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN: Interactive timer & Steps */}
            <div className="lg:col-span-5 space-y-6">
              {/* Card 1: Interactive Active Timer */}
              <div className="bg-[#1c1e2d] border border-[#30344d] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-16 -right-16 w-32 h-32 bg-blue-500/15 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center liquid-glass-icon-blue glossy-glow">
                      <Clock className="w-5 h-5 text-blue-300" />
                    </div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      {currentStep ? currentStep.name : t('statusFinished')}
                    </h2>
                  </div>

                  {/* Sound Alerts settings */}
                  <div className="flex items-center space-x-2 bg-[#222530] py-1 px-2.5 rounded-lg border border-[#2e3344] text-[10px]">
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="text-[#a0a5b8] hover:text-white flex items-center gap-1.5 font-bold transition-all"
                    >
                      {soundEnabled ? (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                          <span className="hidden sm:inline text-blue-400">{t('soundOn')}</span>
                        </>
                      ) : (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-red-400" />
                          <span className="hidden sm:inline text-[#a0a5b8]">{t('soundOff')}</span>
                        </>
                      )}
                    </button>
                    <span className="text-[#3b3f54]">|</span>
                    <button
                      onClick={handleTestBeep}
                      className="text-[#a0a5b8] hover:text-white font-bold transition-all"
                    >
                      {t('testBeep')}
                    </button>
                  </div>
                </div>

                {/* Main giant time display */}
                <div className="text-center py-8 bg-[#131521] rounded-2xl border border-[#2a2d42] mb-5 relative overflow-hidden">
                  {/* Subtle progress bar indicator */}
                  {currentStep && (
                    <div 
                      className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000"
                      style={{ width: `${(stepSecondsRemaining / currentStep.duration) * 100}%` }}
                    />
                  )}

                  <span className="block text-xs uppercase tracking-widest text-[#8a8fa3] mb-1.5 font-semibold">
                    {t('timeRemaining')}
                  </span>
                  <span className="text-6xl font-black text-white tracking-tight font-mono">
                    {formatTime(stepSecondsRemaining)}
                  </span>
                  
                  {/* Agitation Cue Status */}
                  <span className={`block text-xs mt-3 font-semibold px-3 py-1 rounded-full w-fit mx-auto border transition-all ${
                    agitationStatus.status === 'agitate'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                      : agitationStatus.status === 'rest'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : 'bg-zinc-800/40 text-zinc-500 border-zinc-700/30'
                  }`}>
                    {agitationStatus.label}
                  </span>
                </div>

                {/* Timer Controls buttons */}
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={handleStartPause}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm shadow-md transition-all ${
                      timerRunning
                        ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-amber-500/10'
                        : 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/10'
                    }`}
                  >
                    {timerRunning ? (
                      <>
                        <Pause className="w-5 h-5" />
                        {t('pauseTimer')}
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        {t('startTimer')}
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSkip}
                    className="px-4 bg-[#222530] text-[#a0a5b8] hover:text-white border border-[#2e3344] rounded-xl font-bold text-sm transition-all flex items-center justify-center"
                    title={t('skipStep')}
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handleResetTimer}
                    className="px-4 bg-[#222530] text-[#a0a5b8] hover:text-red-400 border border-[#2e3344] rounded-xl font-bold text-sm transition-all flex items-center justify-center"
                    title={t('resetTimer')}
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Card 2: Steps timeline checklist */}
              <div className="bg-[#161822] border border-[#222530] rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Layers className="w-4.5 h-4.5 text-blue-400" />
                  <span>Timeline Steps</span>
                </h3>

                <div className="space-y-3 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-[#252835]">
                  {currentSteps.map((step, idx) => {
                    const isPassed = idx < activeStepIndex;
                    const isActive = idx === activeStepIndex;
                    return (
                      <div
                        key={step.id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          isActive
                            ? 'border-blue-500 bg-blue-500/5'
                            : 'border-[#222530] bg-[#161822]/40 opacity-70'
                        }`}
                      >
                        <div className="flex items-center space-x-3.5 z-10">
                          {/* Step bullet */}
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center border text-xs font-bold transition-all ${
                            isPassed
                              ? 'bg-blue-500 border-blue-500 text-white shadow-md'
                              : isActive
                              ? 'bg-blue-500/10 border-blue-500 text-blue-400 shadow-md shadow-blue-500/10'
                              : 'bg-[#222530] border-[#2e3344] text-[#8a8fa3]'
                          }`}>
                            {isPassed ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                          </div>

                          <div>
                            <span className={`block text-xs font-bold leading-tight ${isActive ? 'text-white' : 'text-[#a0a5b8]'}`}>
                              {step.name}
                            </span>
                            <span className="block text-[10px] text-[#6a6f80] mt-0.5 uppercase tracking-wide">
                              {step.agitation === 'continuous'
                                ? t('agitContinuous')
                                : step.agitation === 'none'
                                ? t('restAction')
                                : t('agitateAction')}
                            </span>
                          </div>
                        </div>

                        <span className="font-mono text-xs font-semibold text-[#8a8fa3]">
                          {formatTime(step.duration)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

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
