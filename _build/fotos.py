# Pasa todas las fotos a duotono con el color de la vinoteca (Receta Corrado: misma serie de color).
# Uso: python -I _build/fotos.py [#oscuro] [#claro]   (por defecto, bordó y papel de la demo)
# Para una vinoteca nueva: poner SUS fotos en assets/raw/ con los mismos nombres de destino (o editar MAPA).
import sys
from pathlib import Path
from PIL import Image, ImageOps, ImageEnhance
R = Path(__file__).resolve().parent.parent
DARK = sys.argv[1] if len(sys.argv) > 1 else '#2a0c15'
MID = '#8c2a40'
LIGHT = sys.argv[2] if len(sys.argv) > 2 else '#ece5da'
# destino: (origen, ancho, alto, foco x, foco y)
MAPA = {
 'estante':   ('dz6-0556-a-sleek-wine-rack-showcasing.jpg', 1200, 1500, .55, .5),
 'barricas':  ('large-botti-size-oak-barrels-in-chianti.jpg', 1200, 1500, .5, .5),
 'copa':      ('wine-being-poured-into-a-glass.jpg', 1200, 1500, .42, .5),
 'corchos':   ('wine-corks-in-variety-rostov-on-don.jpg', 1200, 1500, .5, .5),
 'semana':    ('dz6-0556-a-sleek-wine-rack-showcasing.jpg', 1100, 1100, .3, .5),
 'regalo':    ('packaging-a-wine-bottle-with-wood-wool.jpg', 1400, 1050, .5, .5),
 'envio':     ('packaging-fragile-items-for-delivery.jpg', 1000, 1250, .45, .5),
 'calle':     ('recoleta-street-buenos-aires-6479490213.jpg', 1000, 1250, .5, .5),
 'maridaje':  ('la-provoleta-dorada-servida-en-su-punto.jpg', 1400, 1050, .5, .5),
 'caja':      ('wine-corks-in-variety-rostov-on-don.jpg', 1400, 1050, .5, .5),
 'uco':       ('distrito-de-uco-09951.jpg', 900, 900, .5, .5),
 'lujan':     ('cepa-malbec-en-la-plaza-de-lujan.jpg', 900, 900, .5, .45),
 'maipu':     ('vineyard-in-mendoza-argentina.jpg', 900, 900, .5, .5),
 'andes':     ('vineyards-below-the-andes.jpg', 900, 900, .5, .5),
 'cafayate':  ('wine-and-the-mountains-in-cafayate.jpg', 900, 900, .5, .5),
 'colome':    ('en-la-bodega-colome.jpg', 900, 900, .5, .5),
 'espumante': ('bottles-in-riddling-rack.jpg', 900, 900, .35, .5),
 'barrica-sq':('large-botti-size-oak-barrels-in-chianti.jpg', 900, 900, .5, .5),
 'faq':       ('large-botti-size-oak-barrels-in-chianti.jpg', 1050, 1400, .3, .5),
 'faq-sq':    ('packaging-a-wine-bottle-with-wood-wool.jpg', 700, 700, .62, .5),
}
out = R / 'assets' / 'img'; out.mkdir(parents=True, exist_ok=True)
for dst, (src, w, h, fx, fy) in MAPA.items():
    im = Image.open(R / 'assets' / 'raw' / src).convert('L')
    im = ImageOps.fit(im, (w, h), Image.LANCZOS, centering=(fx, fy))
    im = ImageOps.autocontrast(im, cutoff=1)
    im = ImageEnhance.Contrast(im).enhance(1.08)
    col = ImageOps.colorize(im, black=DARK, mid=MID, white=LIGHT, midpoint=110)
    col.save(out / f'{dst}.jpg', quality=82, optimize=True, progressive=True)
print('ok', len(MAPA))
