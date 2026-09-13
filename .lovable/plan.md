Voy a resolverlo por el camino más simple y robusto:

1. **Corregir la fuente del mensaje de Slack**
   - Ajustar `subscribe-sportclub` para que el mensaje de Slack incluya siempre una línea `Alquiler`, incluso si el valor llega con otro nombre/capitalización o vacío.
   - Normalizar valores posibles (`si`, `sí`, `no`, `considerando`, textos legibles) a una etiqueta clara.

2. **Evitar que dependa de automatizaciones externas**
   - Mantener el envío directo desde la Edge Function al canal `registro-socios-sportclub` como fuente confiable.
   - Incluir todos los campos del formulario en ese mensaje: nombre, email, teléfono, plan, sede, nivel/perfil y alquiler.

3. **Agregar trazabilidad sin exponer datos sensibles**
   - Dejar un log interno compacto indicando si llegó `alquiler` y qué valor se mandó a Slack, para poder verificar futuros envíos.

4. **Deploy y validación**
   - Redeployar `subscribe-sportclub`.
   - Probar la función con un envío de prueba que incluya `alquiler` y revisar que Slack reciba la línea `Alquiler` completa.

**Nota:** El código actual ya intenta enviar `Alquiler`, pero el síntoma de Slack muestra que producción o el flujo real todavía no lo está incorporando. El fix será hacerlo tolerante a variantes y validar contra la función desplegada.