# AB-Suite Core v0.1.0

Bus local versionado para MS ROBOTIKA. Paquete autónomo y sin dependencias externas, preparado para trasladarlo a un futuro repositorio AB-Suite-Core.

No es otro editor ni otro SCADA: mueve eventos de simulación entre aplicaciones.

## Implementado

- HTTP POST /v1/events autenticado con Bearer propio por aplicación.
- SSE GET /v1/events?after=N, replay, secuencias y error 409 cuando caduca un cursor.
- GET /v1/events/history?after=N&limit=100 y GET /v1/health.
- Contrato msrobotika.suite.event.v1, límites y validación de datos.
- SDK JavaScript SuiteClient y puente de telemetría SuitePLCBridge.
- Integración verificable con una sola CPU VirtualPLC, interfaz web y Modbus TCP.

## Ejecución desde la raíz del repositorio

Requiere Node.js >= 20.

    npm run suite:core

Servicios locales:
- HMI PLC: 127.0.0.1:4173
- Modbus TCP read-only: 127.0.0.1:1502
- Suite Core HTTP/SSE: 127.0.0.1:4175

El comando imprime los tokens de sesión. No se almacenan y cambian en cada ejecución. No compartir estos tokens ni la URL privada de la HMI.

En PowerShell:

    $env:AB_SUITE_TOKEN = "<TOKEN_MONITOR>"
    node packages/ab-suite-core/examples/subscribe.mjs

En la HMI pulsa RUN y MARCHA. Verás plc.status y plc.snapshot producidos por la misma CPU que lee Modbus.

Emisor de demostración (datos sintéticos, no conectado a cámara):

    $env:AB_VISION_TOKEN = "<TOKEN_AB_VISION>"
    node packages/ab-suite-core/examples/vision-publish.mjs

## Contrato de evento

    {
      "schema": "msrobotika.suite.event.v1",
      "source": "ab-vision-inspector",
      "topic": "vision.inspection.result",
      "trace_id": "vision-run-0001",
      "simulated_ms": 12500,
      "data": {"image_id": "sha256-or-reference", "passed": true, "defects": 0}
    }

El servidor añade sequence, id y received_at en UTC. simulated_ms es tiempo virtual. El origen y el tema deben concordar con la identidad autenticada.

## Límites

Solo accesible en 127.0.0.1. Conserva hasta 1.000 eventos en memoria, sin persistencia, acknowledgements, cola durable o garantía exactamente una vez. SSE permite recuperar lo retenido mediante cursor; al caducar responde 409. Los tokens se regeneran por sesión.

GRAFCET, AB-BI y Vision todavía NO disponen de adaptador propio en sus repositorios. El contrato y SDK permiten construirlos. No controla PLC ni máquinas físicas.

Documentación: docs/ARCHITECTURE.md y docs/INTEGRATIONS.md. Licencia MIT.
