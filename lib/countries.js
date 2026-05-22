// lib/countries.js — Pays et formats d'adresse pour Alfred Major
// Partagé entre web et app mobile

export const COUNTRIES = [
  // Europe francophone
  { code: 'FR', flag: '🇫🇷', name: 'France' },
  { code: 'BE', flag: '🇧🇪', name: 'Belgique' },
  { code: 'CH', flag: '🇨🇭', name: 'Suisse' },
  { code: 'LU', flag: '🇱🇺', name: 'Luxembourg' },
  { code: 'MC', flag: '🇲🇨', name: 'Monaco' },
  // Europe
  { code: 'ES', flag: '🇪🇸', name: 'Espagne' },
  { code: 'PT', flag: '🇵🇹', name: 'Portugal' },
  { code: 'IT', flag: '🇮🇹', name: 'Italie' },
  { code: 'DE', flag: '🇩🇪', name: 'Allemagne' },
  { code: 'AT', flag: '🇦🇹', name: 'Autriche' },
  { code: 'NL', flag: '🇳🇱', name: 'Pays-Bas' },
  { code: 'GB', flag: '🇬🇧', name: 'Royaume-Uni' },
  { code: 'IE', flag: '🇮🇪', name: 'Irlande' },
  { code: 'GR', flag: '🇬🇷', name: 'Grèce' },
  { code: 'HR', flag: '🇭🇷', name: 'Croatie' },
  // Afrique francophone
  { code: 'MA', flag: '🇲🇦', name: 'Maroc' },
  { code: 'TN', flag: '🇹🇳', name: 'Tunisie' },
  { code: 'DZ', flag: '🇩🇿', name: 'Algérie' },
  { code: 'SN', flag: '🇸🇳', name: 'Sénégal' },
  { code: 'CI', flag: '🇨🇮', name: "Côte d'Ivoire" },
  // Amériques
  { code: 'US', flag: '🇺🇸', name: 'États-Unis' },
  { code: 'CA', flag: '🇨🇦', name: 'Canada' },
  { code: 'MX', flag: '🇲🇽', name: 'Mexique' },
  { code: 'BR', flag: '🇧🇷', name: 'Brésil' },
  // Moyen-Orient
  { code: 'AE', flag: '🇦🇪', name: 'Émirats Arabes Unis' },
  { code: 'QA', flag: '🇶🇦', name: 'Qatar' },
];

// Format d'adresse par pays
// fields : liste des champs dans l'ordre d'affichage
// labels : libellés adaptés à la locale
export const ADDRESS_FORMAT = {
  // Format français standard
  FR: {
    fields: ['street_number', 'address', 'address_complement', 'city', 'postal_code'],
    labels: { street_number: 'Numéro de rue', address: 'Nom de la voie', address_complement: "Complément d'adresse", city: 'Ville', postal_code: 'Code postal' },
    placeholders: { street_number: 'ex: 12', address: 'ex: Rue de Rivoli', address_complement: 'ex: Bât. B, Apt. 3', city: 'ex: Paris', postal_code: 'ex: 75001' }
  },
  BE: {
    fields: ['street_number', 'address', 'address_complement', 'postal_code', 'city'],
    labels: { street_number: 'Numéro', address: 'Rue', address_complement: 'Boîte / Complément', postal_code: 'Code postal', city: 'Commune' },
    placeholders: { street_number: 'ex: 42', address: 'ex: Avenue Louise', address_complement: 'ex: Boîte 3', postal_code: 'ex: 1050', city: 'ex: Bruxelles' }
  },
  CH: {
    fields: ['address', 'street_number', 'address_complement', 'postal_code', 'city'],
    labels: { address: 'Rue', street_number: 'Numéro', address_complement: 'Complément', postal_code: 'NPA', city: 'Localité' },
    placeholders: { address: 'ex: Bahnhofstrasse', street_number: 'ex: 21', address_complement: 'ex: c/o Müller', postal_code: 'ex: 8001', city: 'ex: Zürich' }
  },
  LU: {
    fields: ['street_number', 'address', 'address_complement', 'postal_code', 'city'],
    labels: { street_number: 'Numéro', address: 'Rue', address_complement: 'Complément', postal_code: 'Code postal', city: 'Localité' },
    placeholders: { street_number: 'ex: 5', address: 'ex: Rue de la Paix', address_complement: '', postal_code: 'ex: L-1515', city: 'ex: Luxembourg' }
  },
  // UK
  GB: {
    fields: ['address', 'address_complement', 'city', 'postal_code'],
    labels: { address: 'Address line 1', address_complement: 'Address line 2', city: 'Town / City', postal_code: 'Postcode' },
    placeholders: { address: 'ex: 10 Downing Street', address_complement: 'ex: Flat 2', city: 'ex: London', postal_code: 'ex: SW1A 2AA' }
  },
  // USA
  US: {
    fields: ['street_number', 'address', 'address_complement', 'city', 'state', 'postal_code'],
    labels: { street_number: 'Street number', address: 'Street name', address_complement: 'Apt / Suite', city: 'City', state: 'State', postal_code: 'ZIP Code' },
    placeholders: { street_number: 'ex: 350', address: 'ex: Fifth Avenue', address_complement: 'ex: Suite 4B', city: 'ex: New York', state: 'ex: NY', postal_code: 'ex: 10118' }
  },
  // Canada
  CA: {
    fields: ['street_number', 'address', 'address_complement', 'city', 'state', 'postal_code'],
    labels: { street_number: 'Numéro', address: 'Rue', address_complement: 'App. / Bureau', city: 'Ville', state: 'Province', postal_code: 'Code postal' },
    placeholders: { street_number: 'ex: 100', address: 'ex: Rue Sainte-Catherine', address_complement: 'ex: App. 5', city: 'ex: Montréal', state: 'ex: QC', postal_code: 'ex: H2X 1Z7' }
  },
  // Espagne
  ES: {
    fields: ['address', 'street_number', 'address_complement', 'postal_code', 'city'],
    labels: { address: 'Calle / Avenida', street_number: 'Número', address_complement: 'Piso / Puerta', postal_code: 'Código postal', city: 'Ciudad' },
    placeholders: { address: 'ej: Calle Mayor', street_number: 'ej: 15', address_complement: 'ej: 3º Izq.', postal_code: 'ej: 28013', city: 'ej: Madrid' }
  },
  // Portugal
  PT: {
    fields: ['address', 'street_number', 'address_complement', 'postal_code', 'city'],
    labels: { address: 'Rua / Avenida', street_number: 'Número', address_complement: 'Andar / Apartamento', postal_code: 'Código postal', city: 'Localidade' },
    placeholders: { address: 'ex: Rua Augusta', street_number: 'ex: 24', address_complement: 'ex: 2º Dto.', postal_code: 'ex: 1100-053', city: 'ex: Lisboa' }
  },
  // Italie
  IT: {
    fields: ['address', 'street_number', 'address_complement', 'postal_code', 'city'],
    labels: { address: 'Via / Corso', street_number: 'Civico', address_complement: 'Interno', postal_code: 'CAP', city: 'Città' },
    placeholders: { address: 'es: Via Condotti', street_number: 'es: 8', address_complement: 'es: Interno 3', postal_code: 'es: 00187', city: 'es: Roma' }
  },
  // Allemagne
  DE: {
    fields: ['address', 'street_number', 'address_complement', 'postal_code', 'city'],
    labels: { address: 'Straße', street_number: 'Hausnummer', address_complement: 'Adresszusatz', postal_code: 'Postleitzahl', city: 'Stadt' },
    placeholders: { address: 'z.B: Unter den Linden', street_number: 'z.B: 77', address_complement: 'z.B: 2. OG', postal_code: 'z.B: 10117', city: 'z.B: Berlin' }
  },
  // Maroc
  MA: {
    fields: ['street_number', 'address', 'address_complement', 'city', 'postal_code'],
    labels: { street_number: 'N°', address: 'Rue / Avenue', address_complement: 'Appartement / Étage', city: 'Ville', postal_code: 'Code postal' },
    placeholders: { street_number: 'ex: 7', address: 'ex: Avenue Mohammed V', address_complement: 'ex: Appt 4, 2ème étage', city: 'ex: Marrakech', postal_code: 'ex: 40000' }
  },
  // Tunisie
  TN: {
    fields: ['street_number', 'address', 'address_complement', 'city', 'postal_code'],
    labels: { street_number: 'N°', address: 'Rue / Avenue', address_complement: 'Appartement', city: 'Ville', postal_code: 'Code postal' },
    placeholders: { street_number: 'ex: 15', address: 'ex: Avenue Habib Bourguiba', address_complement: '', city: 'ex: Tunis', postal_code: 'ex: 1001' }
  },
  // Brésil
  BR: {
    fields: ['address', 'street_number', 'address_complement', 'city', 'state', 'postal_code'],
    labels: { address: 'Logradouro', street_number: 'Número', address_complement: 'Complemento', city: 'Cidade', state: 'Estado', postal_code: 'CEP' },
    placeholders: { address: 'ex: Av. Paulista', street_number: 'ex: 1578', address_complement: 'ex: Apto 42', city: 'ex: São Paulo', state: 'ex: SP', postal_code: 'ex: 01310-200' }
  },
  // Émirats
  AE: {
    fields: ['address', 'address_complement', 'city', 'postal_code'],
    labels: { address: 'Street / Building', address_complement: 'Apartment / Office', city: 'Emirate', postal_code: 'P.O. Box' },
    placeholders: { address: 'ex: Sheikh Zayed Road', address_complement: 'ex: Floor 12, Office 5', city: 'ex: Dubai', postal_code: 'ex: 12345' }
  },
};

// Retourne le format pour un pays donné, avec fallback sur le format français
export function getAddressFormat(countryCode) {
  return ADDRESS_FORMAT[countryCode] || ADDRESS_FORMAT['FR'];
}

// Pays sans format spécifique → utilise le format français par défaut
['MC', 'AT', 'NL', 'IE', 'GR', 'HR', 'DZ', 'SN', 'CI', 'MX', 'QA'].forEach(code => {
  if (!ADDRESS_FORMAT[code]) ADDRESS_FORMAT[code] = ADDRESS_FORMAT['FR'];
});
