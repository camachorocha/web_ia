# M1 Garrage

M1 Garrage es una experiencia web premium para explorar vehículos. **M1 IA** es su asesora conversacional: responde preguntas sobre vehículos sin exponer credenciales en el navegador.

## Arquitectura

```
GitHub Pages (frontend estático) → Vercel /api/chat → OpenAI Responses API
```

- `index.html`, `styles.css` y `app.js`: presentación, interacción y llamada al backend.
- `config.js`: configuración pública de la URL del backend; no contiene secretos.
- `api/chat.js`: función serverless de Vercel que usa `process.env.OPENAI_API_KEY`.
- `api/health.js`: comprobación de disponibilidad del backend.
- Los vehículos de `app.js` son datos de demostración, separados de una futura fuente de inventario real.

## Desarrollo local

1. Instala dependencias: `npm install`.
2. Crea una variable de entorno local para el backend: `export OPENAI_API_KEY="tu_clave_local"`. No guardes esta variable en el repositorio.
3. Inicia Vercel localmente: `npm start`.
4. Abre la URL que muestre Vercel. Para servir solo la portada estática también puedes usar `python3 -m http.server`.

## Despliegue en Vercel

1. Importa este repositorio en Vercel.
2. En **Settings → Environment Variables**, crea `OPENAI_API_KEY` con la clave de OpenAI. Nunca la añadas a archivos, GitHub Pages ni al frontend.
3. Despliega y copia la URL de Vercel.
4. Actualiza el valor público `API_BASE_URL` de `config.js` con esa URL, sin barra final. Esta URL no es una credencial.
5. Publica el frontend en GitHub Pages desde `main` y la carpeta `/ (root)`.

El backend permite CORS únicamente desde `https://camachorocha.github.io`, que es el origen de GitHub Pages del proyecto.

## Comprobaciones de API

Después de desplegar, sustituye `https://tu-backend.vercel.app` por la URL real:

```bash
curl https://tu-backend.vercel.app/api/health
curl -X POST https://tu-backend.vercel.app/api/chat \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://camachorocha.github.io' \
  -d '{"message":"¿Qué debo revisar antes de comprar un auto usado?"}'
```

La respuesta de salud es `{ "status": "ok" }`. El chat devuelve `{ "reply": "..." }` y utiliza la Responses API con el modelo configurado en el backend.

## Inventario real futuro

Sustituye el arreglo `demoCars` por un adaptador que consulte la fuente de inventario verificada. Después, pasa resultados validados al backend como contexto controlado o conéctalo a esa fuente desde el backend. M1 IA debe confirmar disponibilidad antes de presentar un vehículo como disponible.
