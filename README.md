# LutOldMeter — Expired Film Exposure Calculator

[👉 На русском языке (READMERU.md)](./READMERU.md)

LutOldMeter is an interactive web application built with React, Vite, and Tailwind CSS designed to calculate the effective sensitivity ($ISO_{\text{eff}}$) of expired photographic film.

## 📌 Mathematical Formula

The calculator uses the following formula to estimate film degradation:

$$ISO_{\text{eff}} = \frac{ISO_{\text{исх}}}{2^{\left( \frac{\Delta T}{10} \times K \right)}}$$

Where:
* $ISO_{\text{исх}}$ — Box speed of the film (nominal sensitivity).
* $\Delta T$ — Years expired (current shooting year minus expiration year).
* $K$ — Degradation rate coefficient, which depends on the nominal sensitivity.
* $2^{(\dots)}$ — Mathematical expression of exposure "stops" (each stop halves the effective ISO).

---

## ⚡ Degradation Coefficient ($K$) Classification

* **Up to 64 ISO (Low):** $K = 0.7 - 0.8$ (loses less than 1 stop per 10 years).
* **100 – 200 ISO (Medium):** $K = 1.0$ (classic loss of exactly 1 stop per 10 years).
* **400 ISO (High):** $K = 1.2 - 1.4$ (loses about 1.3 stops per 10 years).
* **800 ISO and above (Catastrophic):** $K = 1.8 - 2.0$ (up to 2 stops loss per 10 years, high fog level).

---

## 🌟 Key Features

1. **Dual Language Support:** Easily switch between English and Russian (English is set as default).
2. **Liquid Glass UI:** Modern premium-styled dark UI design featuring "Liquid Glass" animated icons with realistic gloss shaders.
3. **Advanced Corrections:** Adjust the calculation dynamically using storage conditions (Freezer, Refrigerator, Room Temp, Heat) and emulsion types (Black & White, Color Negative, Slide/Reversal).
4. **Closest Standard ISO Selector:** Instantly provides the nearest standard 1/3-stop ISO setting to adjust your camera's light meter or exposure dials.
5. **Interactive Exposure Simulator:** View simulated visual changes side-by-side: expired film shot at box speed vs. compensated exposure.
6. **Detailed Step-by-Step Math Breakdown:** Watch the mathematical calculations unfold in real-time.

---

## 🚀 How to Run Locally

### Prerequisites
* [Node.js](https://nodejs.org/) (v16+)
* [npm](https://www.npmjs.com/)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the local development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

---

## 📄 License
This project is open-source. Feel free to use, share, and modify. Made with ❤️ for film photographers.
