# Security Policy

Para vulnerabilidades, utiliza GitHub Security Advisories (aviso privado) cuando esté habilitado. No publiques configuraciones industriales, credenciales, direcciones IP internas ni secretos.

La simulación es puramente local. Se validan programas JSON y no se ejecuta código arbitrario proporcionado por el usuario.

## Servidor de desarrollo y pruebas de aceptación

En el modo `npm run dev` el servidor HTTP solo escucha en `127.0.0.1` y publica explícitamente `index.html`, recursos de interfaz bajo `src/`, `assets/`, ejemplos JSON bajo `examples/` y capturas bajo `docs/screenshots/`. La política **no** autoriza publicar `.env`, `.npmrc`, `.git`, `package.json`, `scripts/`, `tests/` ni archivos internos del repositorio. El control se comprueba de forma funcional en `tests/acceptance-smoke.test.mjs`.

No almacenes tokens reales ni credenciales de dispositivos en un checkout compartido. El servidor sigue siendo de laboratorio, no un servicio HTTP reforzado para Internet o una red de planta. Las comunicaciones con el PLC virtual de Suite Live y Suite Core se gestionan por sus servidores locales independientes y sus controles de autenticación.

Para repetir la comprobación de una copia limpia (Node.js 20+): `node --test tests/acceptance-smoke.test.mjs`. No requiere instalar dependencias. Después, `npm install --ignore-scripts --no-audit --no-fund` y `npm run check` prueban el resto del motor, incluidos puentes Modbus y Suite Core.
