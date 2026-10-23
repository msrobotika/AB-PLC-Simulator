# QA de aceptación — AB-PLC Simulator · 23/10/2026

**Producto:** simulador de CPU PLC virtual de laboratorio (no editor KOP ni PLC industrial certificado).
**Repositorio:** https://github.com/msrobotika/AB-PLC-Simulator
**SHA inicial main:** b48095cd99d59d09f98aa93e98a9f65c85eacde8.
**PR de documentación ajena, conservada:** https://github.com/msrobotika/AB-PLC-Simulator/pull/16

## Problema de servidor identificado y mitigación

El servidor HTTP inicial podía servir cualquier archivo bajo el directorio de proyecto: package.json, scripts de backend o configuraciones privadas como .env si existían. La corrección limita el acceso a index.html, fuentes JS/CSS públicos de src, assets, ejemplos JSON y capturas verificadas, y restringe HOST a 127.0.0.1. No hay escritura en un PLC.

La prueba de aceptación comprueba rutas públicas que deben responder 200 y rutas privadas realmente existentes que deben responder 404. Esto no significa que el servidor sea apto para despliegue en Internet o control industrial.

## Comandos de ensayo reproducible

Desde un checkout limpio, con Node.js 20 o superior y sin ejecutar npm install:

    node --version
    node --test tests/acceptance-smoke.test.mjs

Cuatro pruebas:
- Arranque del proceso Node real, descarga HTTP de index.html, JS, CSS/recursos de ejemplo, HEAD y Content-Type.
- Denegación real de HTTP para package.json, scripts, tests, .git, .env, .npmrc y otras rutas internas; método POST prohibido.
- CLI real con examples/conveyor-with-fault.json: 150 scans, 15.000 ms; atasco desde 100 a 119 y recuperación en 120. CSV con 150 muestras + cabecera; JSON que declara fuente virtual y versión 0.4.0.
- CLI real con examples/tank-cycle.json: 600 scans; fuga desde 150 a 239 y recuperación en 240; CSV con 600 muestras + cabecera.

Los CSV y JSON se escriben en temporales y no se versionan en Git.

Con las dependencias externas fijadas:

    npm install --ignore-scripts --no-audit --no-fund
    npm run check

Revisión CI: .github/workflows/qa-acceptance.yml (checkout limpio en Linux, Windows y macOS), .github/workflows/verify.yml y .github/workflows/screenshots.yml (Chromium real).

## Límites y autorización

- Clasificación EXPERIMENTAL. Una prueba de CI no demuestra homologación IEC 61131-3, seguridad funcional, hardware físico o operación real.
- PR #16 existente se revisa sin duplicar su README ni sobrescribir sus cambios.
- GitHub Pages: NO_VERIFICADO (el enlace en README no es evidencia de despliegue).
- No hay Release nuevo autorizado por esta auditoría.
- Pendientes: instalación manual en PC, pruebas físicas permitidas, distribución empaquetada, rendimiento sostenido y validación de enlaces/capturas al SHA final.
- El fichero de evidencia debe actualizarse con URLs y resultados del último SHA tras el cierre de CI.

## Evidencia ejecutada en GitHub Actions — 23/10/2026

**SHA bajo ensayo:** 7eb160ffd78ef5eb00bab44ac4a30e9f5f3c67cc (head inicial PR #17).

- Checkout limpio, comando node --test tests/acceptance-smoke.test.mjs: **4/4** en Ubuntu 22, Windows 22 y macOS 22, sin npm install previo. [Ejecución de aceptación](https://github.com/msrobotika/AB-PLC-Simulator/actions/runs/39982559165).
- Tras npm install de Suite Core fijado por commit, npm run check: **60/60** tests, cero fallos en Ubuntu/Windows/macOS; la matriz existente también incluye Node 20 Ubuntu. [Verify engine](https://github.com/msrobotika/AB-PLC-Simulator/actions/runs/39982559048).
- Chromium real: scripts/capture.mjs y scripts/capture-suite-live.mjs completos; artefacto de 6.4 MB con capturas generado por Actions. [Capture screenshots](https://github.com/msrobotika/AB-PLC-Simulator/actions/runs/39982559045).
- [PR #17, revisión de código y cambios](https://github.com/msrobotika/AB-PLC-Simulator/pull/17).

Esta documentación nueva modifica el SHA del head sin alterar código. Verificar la nueva ejecución CI del SHA definitivo antes de fusionar. **La prueba anterior no debe atribuirse automáticamente al nuevo SHA**.
