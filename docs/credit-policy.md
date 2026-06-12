# Politica de creditos y acceso a avatares

## Reglas base

- Toda ejecucion de avatar debe registrar fecha, hora, usuario, avatar, creditos consumidos, saldo anterior y saldo final.
- Toda ejecucion descuenta creditos, ya sean creditos regalados, comprados o asignados extraordinariamente por Super Admin.
- Los usuarios sin compra previa pueden usar una sola vez los avatares elegibles de prueba, siempre que tengan saldo suficiente de creditos regalados.
- Cuando el usuario compra creditos, puede usar cualquier avatar cuantas veces quiera mientras tenga saldo disponible.
- Si el usuario agota creditos, debe comprar mas o solicitar asignacion extraordinaria al Super Admin.
- Toda asignacion extraordinaria debe quedar en ledger como `adjustment` y en bitacora como `credits.grant`.

## Avatares estrella sin periodo de prueba

Estos avatares requieren compra previa de creditos:

- Optim
- Mr. Boost Linked
- Tommy Lee Picture
- Indiana Jobs
- Miss Quest

## Estados de cuenta

El estado de cuenta mensual del usuario debe incluir:

- Fecha y hora de movimiento.
- Avatar o concepto ejecutado.
- Tipo de movimiento: compra, consumo, reembolso o ajuste.
- Creditos consumidos o agregados.
- Saldo antes y despues.
- ID de ejecucion o referencia cuando aplique.

## Reportes Super Admin

El Super Admin debe poder consultar consumo por:

- Dia.
- Semana.
- Mes.
- Rango personalizado.
- Usuario.
- Organizacion o campana, cuando los datos reales de Supabase esten conectados.

## Baseline inicial recomendado

- Usuario online: 750 creditos.
- Cliente de emprendedor: 1600 creditos.
- Ex-empleado de empresa / outplacement: 1900 creditos.

Estos montos deben revisarse contra consumo real de tokens, modelos utilizados, tipo de cambio USD/MXN y margen objetivo.
