FROM node:20-alpine

WORKDIR /app

# Kopiujemy pliki konfiguracyjne
COPY package*.json ./

# Instalujemy zależności
RUN npm install

# Kopiujemy resztę kodu
COPY . .

# BUDUJEMY APLIKACJĘ (to stworzy folder /app/dist)
RUN npm run build

# Instalujemy prosty serwer statyczny
RUN npm install -g serve

# Uruchamiamy serwer wskazując na folder dist
CMD ["serve", "-s", "dist", "-l", "3000"]