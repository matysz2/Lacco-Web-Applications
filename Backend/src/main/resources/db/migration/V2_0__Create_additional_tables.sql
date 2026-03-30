-- Create customers table (leady_stolarze)
CREATE TABLE IF NOT EXISTS leady_stolarze (
    id INTEGER PRIMARY KEY,
    nazwa_firmy TEXT NOT NULL,
    telefon TEXT,
    adres TEXT,
    region TEXT,
    handlowiec UUID,
    data_pozyskania DATE,
    czy_odwiedzony BOOLEAN,
    status_wizyty TEXT,
    opis_notatki TEXT,
    data_ostatniej_edycji TIMESTAMP WITHOUT TIME ZONE,
    nawigacja TEXT,
    strona_www TEXT,
    grupa_cenowa INTEGER,
    ostatnia_wizyta TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create products table (produkty)
CREATE TABLE IF NOT EXISTS produkty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kod_produktu TEXT NOT NULL,
    nazwa TEXT NOT NULL,
    opis TEXT,
    ilosc_w_magazynie DECIMAL(10,2) DEFAULT 0,
    cena_za_kg DECIMAL(10,2),
    jednostka_miary TEXT,
    kategoria TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table (zamowienia)
CREATE TABLE IF NOT EXISTS zamowienia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numer_zamowienia INTEGER NOT NULL,
    klient_id INTEGER REFERENCES leady_stolarze(id),
    status TEXT DEFAULT 'NEW',
    suma_brutto DECIMAL(10,2),
    uwagi TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    handlowiec_id UUID REFERENCES profiles(id),
    suma_netto DECIMAL(10,2)
);

-- Create order_items table (pozycje_zamowienia)
CREATE TABLE IF NOT EXISTS pozycje_zamowienia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zamowienie_id UUID REFERENCES zamowienia(id),
    produkt_id UUID REFERENCES produkty(id),
    ilosc DECIMAL(10,2),
    cena_zastosowana DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    wartosc_netto DECIMAL(10,2),
    nazwa TEXT,
    opakowanie TEXT,
    kolor_id INTEGER
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leady_stolarze_created_at ON leady_stolarze(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_produkty_nazwa ON produkty(nazwa);
CREATE INDEX IF NOT EXISTS idx_zamowienia_klient_id ON zamowienia(klient_id);
CREATE INDEX IF NOT EXISTS idx_zamowienia_handlowiec_id ON zamowienia(handlowiec_id);
CREATE INDEX IF NOT EXISTS idx_zamowienia_status ON zamowienia(status);
CREATE INDEX IF NOT EXISTS idx_zamowienia_created_at ON zamowienia(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pozycje_zamowienia_zamowienie_id ON pozycje_zamowienia(zamowienie_id);
CREATE INDEX IF NOT EXISTS idx_pozycje_zamowienia_produkt_id ON pozycje_zamowienia(produkt_id);

-- Insert sample data
INSERT INTO leady_stolarze (id, nazwa_firmy, telefon, adres) VALUES
(1, 'Jan Kowalski', '123-456-789', 'Warszawa, ul. Główna 1'),
(2, 'Anna Nowak', '987-654-321', 'Kraków, ul. Krakowska 2')
ON CONFLICT DO NOTHING;

INSERT INTO produkty (kod_produktu, nazwa, opis, ilosc_w_magazynie, cena_za_kg) VALUES
('SOSN001', 'Drewno sosnowe', 'Wysokiej jakości drewno sosnowe', 100.50, 5.00),
('DEB001', 'Drewno dębowe', 'Trwałe drewno dębowe', 75.25, 10.00)
ON CONFLICT DO NOTHING;