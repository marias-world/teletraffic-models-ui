# Teletraffic Models

An interactive educational reference for teletraffic loss models, built with Next.js. Explore classical loss models, work through step-by-step calculations, and visualise key concepts through live animations.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-teletraffic--models--ui.vercel.app-blue?style=flat-square)](https://teletraffic-models-ui.vercel.app)
[![Licence: CC BY-NC 4.0](https://img.shields.io/badge/Licence-CC%20BY--NC%204.0-lightgrey?style=flat-square)](https://creativecommons.org/licenses/by-nc/4.0/)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=flat-square&logo=next.js)](https://nextjs.org)

---

## Note
The mathematical models were implemented in this repo and can be executed as a CLI 
https://github.com/mariakourtesi/Teletraffic-models


## Overview

This project covers the theory behind traffic loss models, provides worked examples, and includes live simulations to build intuition around key results.

**Author:** [Maria Kourtesi](https://www.linkedin.com/in/mariakourtesi/)  
**Thesis:** [Call blocking in cloud systems supporting multirate random traffic (IaaS)](https://apothesis.eap.gr/archive/item/228527)  
**Source:** [github.com/marias-world/teletraffic-models-ui](https://github.com/marias-world/teletraffic-models-ui)

---

## Features

- **Erlang-B calculator** with step-by-step breakdown and live blocking probability
- **Interactive simulation** of call arrivals, channel occupancy, and blocking events
- **Theory pages** covering traffic load, Poisson traffic, and classification of loss models
- **SVG diagrams** illustrating arrival processes, batch arrivals, and ON/OFF traffic patterns
- **Responsive design** built with Tailwind CSS

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Math rendering | KaTeX (`react-katex`) |
| Testing | Vitest |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm

### Installation

```bash
git clone https://github.com/marias-world/teletraffic-models-ui.git
cd teletraffic-models-ui
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Tests

```bash
npm run test
```

---

## Project Structure

```
src/
  app/
    erlang/           
    theory/
      traffic-load/               # Traffic load theory page
      poisson-traffic/            # Poisson traffic theory page
      classification-of-loss-models/  # Loss model classification page
  components/
    ErlangAnimation.tsx   # Live Erlang-B simulation
    PoissonAnimation.tsx  # Poisson arrival animation
    layout.tsx            # Shared navbar and footer
  lib/
    models/
      erlang-b.ts         # Recursive Erlang-B formula
```

---

## Contributing

Contributions are welcome. Please read the guidelines below before opening a pull request.

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes
4. Open a pull request using the provided template

All contributions must comply with the [CC BY-NC 4.0 licence](https://creativecommons.org/licenses/by-nc/4.0/). Commercial use of this project or derivative works is not permitted.

---

## Publication

M. Vlasakis, **M. Kourtesi**, I-A. Chousainov, I. Keramidi, D. Uzunidis, O. Zestas, I. D. Moscholios and M. Logothetis.
*"On the limited-availability group model for multirate Poisson traffic."*
Proc. Panhellenic Conf. Electronics and Telecommunications (PACET).

---

## Licence

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)** licence.

You are free to share and adapt this material for non-commercial purposes, provided appropriate credit is given to the author.

Full licence: [creativecommons.org/licenses/by-nc/4.0](https://creativecommons.org/licenses/by-nc/4.0/)
