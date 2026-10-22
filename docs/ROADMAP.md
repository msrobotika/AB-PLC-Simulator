# Roadmap · MS ROBOTIKA

## v0.1 · Fundamentos (implementados)
- [x] Motor reproducible y desacoplado
- [x] Contactos y redes, TON/TOF, CTU
- [x] Interfaz industrial responsive y ejemplo de cinta
- [x] Editor JSON, diagnóstico, pruebas CI

## v0.2 · Editor gráfico
- [x] Editor KOP visual por contactos/bobinas, conexiones AND/OR, presets, edición por formularios y undo/redo
- [ ] Drag-and-drop de componentes de circuitos (actualmente mediante botones)
- [ ] Tabla de símbolos, variables y gráficos de tendencia
- [x] Prueba E2E del editor en Chromium a través del workflow de capturas
- [ ] Accesibilidad avanzada, pruebas multi-navegador y responsive E2E

## v0.3 · Motor extendido
- [ ] Contadores CTD/CTUD, flancos R_TRIG/F_TRIG y TONR
- [ ] Interpretación de un subconjunto de SCL/ST **documentado**
- [ ] Editor GRAFCET traducido al AST propio

## v0.4 · Integración
- [ ] Adaptador Modbus TCP / OPC UA de solo lectura por defecto
- [ ] Replay CSV/JSON, pruebas multi-PLC, HMI

## v1.0
- [ ] API pública estable, proyectos versionados y pruebas de conformidad por escenario

Estas fases son propuestas, **no funcionalidades presentes**. Cualquier control industrial real requiere una revisión de seguridad independiente.
