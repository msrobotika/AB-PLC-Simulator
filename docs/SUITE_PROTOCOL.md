# Protocolo Suite MS ROBOTIKA — contrato v1

## Matriz de integración

| Emisor | Consumidor | Resultado actual |
| --- | --- | --- |
| AB-KOP Studio | AB-PLC Simulator | Importación JSON schema 1, mediante src/kop-import.js |
| AB-SCL Studio → AB-KOP JSON | AB-PLC Simulator | Importa el JSON AB-KOP generado, no SCL nativo |
| AB-PLC Simulator | AB-BI Studio | Exportación CSV tabular |
| AB-PLC Simulator | Suite futura | Contrato JSON msrobotika.suite.telemetry.v1 |
| AB-PLC Simulator | AB-Modbus Studio | Solo preview de mapa de registros, sin TCP |
| AB-GRAFCET Studio | AB-PLC Simulator | Pendiente de adaptador |
| AB-Vision Inspector | AB-PLC Simulator | Pendiente de adaptador |

## Importador AB-KOP

Convierte las entradas simbólicas a I0.N y las salidas a Q0.N, en orden de declaración. Convierte los contactos NO y NC a sus equivalentes del AST. Las ramas de serie se traducen a AND y las paralelas a OR. Los temporizadores TON se convierten de preset de ciclos a milisegundos multiplicando por 100. El importador rechaza formatos incompatibles. No se afirma equivalencia de scan y temporización entre dos implementaciones PLC distintas; las redes importadas requieren nuevas pruebas. La tabla de símbolos aparece en el simulador, en modo bastidor libre.

## CSV para AB-BI Studio

Campos: scan, simulated_ms, scenario, cpu_mode, process_value, process_unit, motor_or_fill, lamp_or_drain, count, analog_ai0, active_faults.

Cada fila es una muestra sintética. simulated_ms mide tiempo virtual, no tiempo UTC. Se admite CSV en AB-BI Studio como tabla de observaciones.

## JSON Suite

Nombre de contrato: msrobotika.suite.telemetry.v1. Campos: schema, producer, source, scenario, sample_period_ms, fields, samples. No representa una API en tiempo real.

## Modbus (solo representación in-memory)

Mapa de registros con direcciones de base cero:
- HR0 scan, HR1 tiempo dividido entre 100 ms, HR2 CV, HR3 AI0 multiplicado por 100, HR4 valor de proceso multiplicado por 100.
- Coils 0–2 corresponden Q0.0–Q0.2.
- Discrete inputs 0–3 corresponden I0.0–I0.3.
- Registros de 16 bits saturados a 0..65535.

**No está implementado un servidor Modbus TCP**: el preview no escucha sockets ni expone funciones FC01/03. El adaptador futuro deberá ser un proceso aislado de solo lectura, habilitado explícitamente.

## Arquitectura de Suite pendiente

Propuesta: AB-Suite Core alojará el contrato compartido y un bus IPC local versionado. Los editores emitirán proyectos mediante adaptadores independientes; AB-PLC Simulator ejecutará la CPU y planta virtual; AB-Modbus Studio supervisará por lectura; AB-BI Studio analizará históricos; AB-Vision Inspector aportará resultados virtuales de inspección; AB-GRAFCET Studio aportará secuencias transformadas bajo validación. La comunicación en vivo, autenticación y validación entre aplicaciones aún NO están implementadas.
