# Lacco Frontend

React + Vite aplikacja do zarządzania sprzedażą i magazynem.

## Technologie

- **React 18** - UI framework
- **Vite 8** - Build tool & dev server  
- **React Router** - Client-side routing
- **Axios** - HTTP client z interceptorami
- **Sass** - CSS preprocessor
- **ESLint** - Code linting

## Setup

### 1. Zainstaluj zależności
```bash
npm install
```

### 2. Konfiguracja
Skopiuj `.env.example` to `.env`:
```bash
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:8080/api
```

### 3. Uruchom dev server
```bash
npm run dev
```

Server bedzie dostepny na `http://localhost:5173/`

## Struktura

```
src/
├── pages/
│   ├── LoginPage.jsx          # Strona logowania
│   └── LoginPage.scss
├── components/
│   ├── LoginForm.jsx          # Formularz logowania
│   └── LoginForm.scss
├── services/
│   └── api.js                 # Axios z interceptorami
├── App.jsx                    # Główna aplikacja z routingiem
└── main.jsx                   # Entry point
```

## Dostępne komendy

- `npm run dev` - Dev server
- `npm run build` - Build do produkcji
- `npm run preview` - Podgląd build'u
- `npm run lint` - ESLint

## Implementowane funkcje

### ✅ Login Page (/login)
- Formularz email + hasło
- Walidacja formularza
- Obsługa błędów
- Axios integration z JWT tokenami
- Responsive design (mobile-first)

### ✅ API Service
- Automatyczne wstrzykiwanie JWT w nagłówkach
- Token stored localStoragelu
- Auto-logout na 401
- Centralized error handling

## Autentykacja

1. User przesyła formularz logowania
2. API call: `POST /auth/login`
3. Backend waliduje przeciwko tabeli `profiles`
4. JWT token jest zwracany i store'owany
5. Kolejne requesty zawierają token w Authorization header
6. Na 401 user jest redirectowany do login

## Styling

Sass/SCSS z:
- BEM naming convention
- CSS variables dla kolorów
- Mobile-first responsive design
- Smooth animations

## TODO

- [ ] Dashboard page
- [ ] Protected routes
- [ ] User context dla auth state
- [ ] Produkty strona
- [ ] Zamówienia strona
- [ ] Error boundary
- [ ] Global loading states
