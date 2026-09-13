# Histórico de cambios de horarios

Registro acumulativo de lo que cambia entre una planilla vigente (`horarios_semana_<periodo>.csv`,
en la raíz del proyecto) y la siguiente. No guarda las planillas completas semana a semana — eso
vive en `horarios-historial/` como un solo archivo "anterior" (se pisa/renombra en cada reemplazo,
nombrado con su propio período — ej. `horarios_semana_2026-08-ultima-semana.csv`). Este archivo
sí se conserva y crece: es donde se ven los patrones (qué sede/día/hora/profe/cupos
cambia, con qué frecuencia) a lo largo de varios meses.

**Formato de cada entrada:** fecha del corte (semana vigente al momento del cruce) →
qué cambió, agrupado en Agregados / Eliminados / Cambio de profe / Cambio de horario.
"Agregado"/"Eliminado" es respecto de la planilla anterior, no necesariamente del
sitio (ver `CLAUDE.md` para qué se sincroniza a la web vs. qué solo se registra acá).

---

## 2026-09-07 (semana 07 al 13-sep) — vs. planilla anterior (14 al 20-ago)

**Agregados** (slot sede+día+hora que no existía en la planilla de agosto):
- Belgrano · Viernes 18:00 · Slalom
- Vic. Lopez · Miércoles 19:00 · nivel general (Nico Sappia)
- Rosedal · Sábado 17:00 · Slalom (Nico Sappia)

**Eliminados** (existían en agosto, no aparecen más):
- Rosedal · Miércoles 20:00 · Slalom (Nico Sappia)
- Rosedal · Sábado 11:00 · Urbano (Martu Demarchi)

**Cambio de día** (mismo horario/disciplina, día distinto):
- Villa Luro: Primeros Pasos/Principiante 19:00 + Skatepark 20:00 pasaron de **Viernes** a **Jueves**. Cambio grande, un solo profe (Abreu Daniel) en ambos casos — probable reacomodo real, no error de tipeo. **Pendiente confirmar con Gumercindo** si Villa Luro ahora es jueves de forma permanente.

**Cambio de horario dentro del mismo día/sede:**
- Rosedal · Sábado: el Slalom pasó de figurar a las 19:00 (agosto) a las 17:00 (septiembre). El resto de las 19:00 (nivel general) desapareció, solo queda Frenadas a esa hora.

**Cambio de profe** (mismo slot, profe distinto — normal, no requiere acción):
- Rosedal Miércoles 19:00: Nico Sappia → Rondina Guillermo
- Rosedal Sábado 18:00: Delfi Demilio → Nico Sappia
- Rosedal Sábado 19:00: Delfi Demilio → (sin dato)
- Varios slots de Rosedal (Martes 09:00/19:00/20:00, Jueves 20:00) pasaron de tener profe asignado (Martu Demarchi / Fruti Muñoz) a venir sin profe en la planilla — no necesariamente vacante real, puede ser que la planilla exportada esa semana no cargó el campo.

**Nota:** Rosedal es, lejos, la sede con más movimiento entre estas dos planillas (5 de los 6 cambios de horario/día). Si este patrón se repite semana a semana, vale la pena preguntarle a Gumercindo si Rosedal tiene una dinámica de horarios más variable que el resto (varios profes rotando) en vez de tratar cada diferencia como un error a corregir.
