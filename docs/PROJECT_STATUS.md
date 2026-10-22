# Estado técnico · AB-PLC Simulator

Fecha de revisión: 22 de octubre de 2026. Versión: v0.3.

## Entregables implementados
- CPU virtual RUN/PAUSE/STOP/STEP, imagen de proceso y scan determinista.
- Plantas transportador y depósito, bastidor genérico, sensores y fallos.
- Adaptador AB-KOP schema 1 a AB-PLC version 1; exportación CSV de telemetría para AB-BI.
- Preview Modbus de solo lectura **sin servidor TCP**.
- Pruebas unitarias e integración navegador via GitHub Actions.
- Capturas reales: lab-conveyor.png, lab-fault.png, lab-tank.png, lab-suite-import.png.

## Calidad verificable
El workflow Verify engine ejecuta npm run check. Capture screenshots vuelve a comprobar el motor y navega por las vistas de laboratorio y KOP antes de publicar PNG reales. Las capturas no constituyen validación industrial.

## No implementado
Un bus de comunicación Suite, adaptadores GRAFCET/Vision, servidores Modbus TCP, importación binaria Step7/TIA Portal/Omron, E/S reales, gemelo digital calibrado, CI multiplataforma de SO y cumplimiento de normas de seguridad funcional.

## Riesgos y próximos pasos
1. Versionar el contrato de formatos y diseñar SDK AB-Suite Core independiente.
2. Completar pruebas cruzadas contra el motor real de AB-KOP para todos los casos admitidos.
3. Mantener pruebas de FC01–04 del puente Modbus local; falta sincronización de CPU entre navegador y proceso Node.
4. Medir rendimiento y memoria del simulador bajo escenarios de larga duración.
5. Diseñar una API de procesos y módulos de periféricos extensibles.
