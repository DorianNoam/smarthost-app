// generate-vapid-keys.js
// Exécuter UNE SEULE FOIS : node generate-vapid-keys.js
// Puis copier les clés dans les variables d'environnement Vercel

const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('');
console.log('✅ Clés VAPID générées pour Alfred Major');
console.log('');
console.log('Copiez ces valeurs dans vos variables Vercel :');
console.log('');
console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY=', vapidKeys.publicKey);
console.log('');
console.log('VAPID_PRIVATE_KEY=', vapidKeys.privateKey);
console.log('');
console.log('⚠️  Ne partagez jamais la clé privée !');
