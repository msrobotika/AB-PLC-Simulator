# AB-Suite Core

El paquete independiente reside inicialmente en packages/ab-suite-core; aún no existe un repositorio público separado msrobotika/AB-Suite-Core. Tiene exports, tests y estructura propia para extraerlo más adelante.

Desde la raíz ejecuta:

    npm run suite:core

Activa una CPU VirtualPLC compartida por web y Modbus, más el bus SSE con telemetría. Todo enlazado únicamente a 127.0.0.1. Credenciales independientes de sesión.

Consulta packages/ab-suite-core/README.md, packages/ab-suite-core/docs/ARCHITECTURE.md y packages/ab-suite-core/docs/INTEGRATIONS.md.

Integración efectiva: AB-PLC Simulator y bus Core. Resto de aplicaciones pendientes de adaptador nativo. Sin E/S reales.
