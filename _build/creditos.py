# Genera creditos.html con las fotos de ambiente usadas (solo las que están en _build/fotos.py).
import json, html, re
from pathlib import Path
R = Path(__file__).resolve().parent.parent
used = set(re.findall(r"\('([^']+\.jpg)'", (R / '_build' / 'fotos.py').read_text(encoding='utf-8')))
d = [c for c in json.load(open(R / 'assets' / 'raw' / 'credits.json', encoding='utf-8')) if Path(c['file']).name in used]
rows = ''.join(f'<li><a href="{html.escape(c["page"])}">{html.escape(c["title"])}</a>, de {html.escape(c.get("creator") or "autor desconocido")}, {html.escape(c["license"])} vía {html.escape(c.get("via") or "")}. Versión en duotono.</li>' for c in d)
page = f'''<!doctype html><html lang="es-AR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>Créditos de las fotos</title><style>body{{margin:0;background:#d9d4cb;color:#221b1a;font:17px/1.55 system-ui,sans-serif;padding:48px 20px}}main{{max-width:720px;margin:0 auto}}h1{{font-size:2rem;margin:0 0 20px}}li{{margin-bottom:10px}}a{{color:#7a1f33}}</style></head>
<body><main><h1>Créditos de las fotos</h1><p>Las fotos de ambiente de esta muestra son de colecciones abiertas, pasadas a duotono con el color de la vinoteca. En la web final van las fotos del local.</p><ul>{rows}</ul><p><a href="./">Volver</a></p></main></body></html>'''
(R / 'creditos.html').write_text(page, encoding='utf-8')
print(len(d))
