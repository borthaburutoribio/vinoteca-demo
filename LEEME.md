# Demo vinoteca (Tranquera Digital)

Muestra reutilizable para vinotecas. Para personalizar una:

1. **Vista rápida sin tocar nada:** `?n=Nombre&b=Barrio&d=Dirección&w=5491100000000&c=7a1f33&ig=usuario`
   (agregar `&demo=0` para sacar la franja de muestra).
2. **Versión propia:** copiar esta carpeta a `<slug>-website`, editar `config.js` (nombre, color, WhatsApp,
   envíos, horarios, pagos, envoltorios) y `vinos.csv` (o pegar en `planilla` el CSV publicado de su Google Sheet).
3. **Fotos con su color:** poner SUS fotos en `assets/raw/` y apuntarlas en `_build/fotos.py`, después
   `python -I _build/fotos.py "#oscuro" "#claro"`. Créditos: `python -I _build/creditos.py` (solo si quedan fotos de colecciones abiertas).
4. Sacar `noindex` y `robots.txt` cuando sea la web final.

Planilla: columnas `id,nombre,bodega,varietal,tipo,region,precio,maridaje,destacado,stock,nota`.
`tipo` = Tinto/Blanco/Rosado/Espumante. `maridaje` separado por `|` (asado, pastas, pizza, picada, quesos,
pescado, sushi, pollo, postre). `stock` = no lo oculta. `destacado` = si lo pone en "el vino de la semana".
