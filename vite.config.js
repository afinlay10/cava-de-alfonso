# La Cava de Alfonso 🍷

Administrador personal de cava de vinos. PWA instalable en móvil.

## Deploy en Vercel (5 minutos)

### 1. Crear el repo en GitHub

```bash
# En tu terminal local
mkdir cava-de-alfonso && cd cava-de-alfonso
git init
# Copia todos los archivos del proyecto aquí
git add .
git commit -m "Initial commit - La Cava de Alfonso"
git remote add origin https://github.com/afinlay10/cava-de-alfonso.git
git push -u origin main
```

### 2. Instalar dependencias (solo para verificar local)

```bash
npm install
npm run dev
```

### 3. Conectar a Vercel

1. Ir a [vercel.com/new](https://vercel.com/new)
2. Importar el repo `cava-de-alfonso`
3. Framework Preset: **Vite**
4. Click **Deploy**

### 4. Instalar como app en iPhone

1. Abrir la URL de Vercel en Safari
2. Tap en el ícono de compartir (cuadrado con flecha)
3. Seleccionar **"Agregar a pantalla de inicio"**
4. Listo — la app aparece con ícono propio

## Stack

- React 18 + Vite
- localStorage para persistencia
- PWA con vite-plugin-pwa (offline support)
- Zero backend, zero dependencias externas

## Dominio personalizado (opcional)

En Vercel → Settings → Domains, puedes agregar un dominio como `cava.tudominio.com`.
