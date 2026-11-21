# =====================================================================
#  Champions Crown - crea copias .webp (más ligeras) de los PNG grandes de efectos y del HUD,
#  y escribe la lista en js/carga.js (CARGA_WEBP) para que el juego las pida en vez de los .png.
#  Los .png originales NO se borran (son el plan B si una .webp fallara).
#  Uso (en la carpeta del proyecto):   python tools/png_a_webp.py
#  Necesita Pillow:  pip install pillow
#  Vuelve a ejecutarlo cuando añadas o cambies imágenes en estas carpetas.
# =====================================================================
import os, io, re, json
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CARPETAS = ['assets/fx', 'assets/objetos', 'assets/objetos/ataques', 'assets/objetos/ataques/e', 'assets/objetos/ataques/brecha',
            'assets/objetos/cargas', 'assets/objetos/ataques/m', 'assets/objetos/ataques/p', 'assets/iconos/hud', 'assets/entrenadores_mini']
SIN_PERDIDA = ['assets/entrenadores_mini']      # pixel art: se guarda sin perder ni un píxel
MINIMO = 20 * 1024                              # los PNG pequeños no merecen la pena

lista = []
antes = despues = 0
for carpeta in CARPETAS:
    base = os.path.join(RAIZ, carpeta)
    if not os.path.isdir(base):
        continue
    for nombre in sorted(os.listdir(base)):                 # solo esa carpeta, sin subcarpetas
        if not nombre.lower().endswith('.png'):
            continue
        ruta = os.path.join(base, nombre)
        tam = os.path.getsize(ruta)
        if tam < MINIMO:
            continue
        web = ruta[:-4] + '.webp'
        if os.path.exists(web) and os.path.getmtime(web) >= os.path.getmtime(ruta):      # ya estaba hecha: no se repite (va mucho más rápido)
            lista.append(carpeta + '/' + nombre[:-4]); antes += tam; despues += os.path.getsize(web); continue
        im = Image.open(ruta).convert('RGBA')
        b = io.BytesIO()
        if any(carpeta.startswith(s) for s in SIN_PERDIDA):
            im.save(b, 'WEBP', lossless=True, method=6)
        else:
            im.save(b, 'WEBP', quality=94, alpha_quality=100, method=6)
        if len(b.getvalue()) >= tam * 0.9:                   # no compensa
            continue
        with open(ruta[:-4] + '.webp', 'wb') as f:
            f.write(b.getvalue())
        lista.append(carpeta + '/' + nombre[:-4])
        antes += tam
        despues += len(b.getvalue())

js = os.path.join(RAIZ, 'js', 'carga.js')
with open(js, encoding='utf-8') as f:
    txt = f.read()
txt = re.sub(r'new Set\(\[.*?\]\);', 'new Set([/*WEBP_LISTA*/' + ', '.join(json.dumps(x) for x in lista) + ']);', txt, count=1, flags=re.S)
with open(js, 'w', encoding='utf-8') as f:
    f.write(txt)
print(f'Hecho: {len(lista)} imágenes en WebP, de {antes // 1024} KB a {despues // 1024} KB. Lista guardada en js/carga.js')
