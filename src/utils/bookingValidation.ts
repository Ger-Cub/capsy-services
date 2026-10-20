/**
 * Utilitaires de validation stricts pour le formulaire de prise de rendez-vous CAPSY.
 * Empêche la saisie de faux e-mails, faux numéros de téléphone et faux noms.
 */

// Domaines d'emails jetables, temporaires ou manifestement faux
const DISPOSABLE_OR_FAKE_DOMAINS = new Set([
  'test.com',
  'test.fr',
  'fake.com',
  'example.com',
  'example.org',
  'sample.com',
  'domain.com',
  'asdf.com',
  'aaa.com',
  'bbb.com',
  'xyz.com',
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'trashmail.com',
  'yopmail.com',
  'yopmail.fr',
  'sharklasers.com',
  'throwawaymail.com',
  'dispostable.com',
  'getairmail.com',
  'generator.email',
]);

// Noms d'utilisateurs d'emails bidons fréquents
const FAKE_USERNAMES = new Set([
  'test',
  'testing',
  'fake',
  'asdf',
  'toto',
  'titi',
  'aaa',
  'bbb',
  'ccc',
  'user',
  'admin',
  'sample',
  'bidon',
  'noemail',
  'none',
  'null',
  'qwerty',
  'azerty',
  '1234',
  '12345',
]);

// Suites répétitives ou séquentielles évidentes
const OBVIOUS_FAKE_SEQUENCES = [
  '123456789',
  '987654321',
  '012345678',
  '876543210',
  '000000000',
  '111111111',
  '222222222',
  '333333333',
  '444444444',
  '555555555',
  '666666666',
  '777777777',
  '888888888',
  '999999999',
];

/**
 * Valide le nom complet du client.
 */
export function validateClientName(name: string): { isValid: boolean; error?: string } {
  const clean = name.trim();
  if (!clean) {
    return { isValid: false, error: 'Votre nom complet est obligatoire.' };
  }

  if (clean.length < 3) {
    return { isValid: false, error: 'Le nom doit comporter au moins 3 caractères.' };
  }

  const lower = clean.toLowerCase();
  if (FAKE_USERNAMES.has(lower) || lower.includes('test test') || lower === 'asdf asdf') {
    return { isValid: false, error: 'Veuillez saisir votre véritable nom et prénom.' };
  }

  // Ne doit pas être composé uniquement de chiffres ou de caractères spéciaux
  const letterCount = (clean.match(/[a-zA-ZÀ-ÿ]/g) || []).length;
  if (letterCount < 3) {
    return { isValid: false, error: 'Veuillez saisir un nom valide avec des lettres.' };
  }

  return { isValid: true };
}

/**
 * Valide et normalise le numéro de téléphone.
 * - Spécialement calibré pour les réseaux RDC (Vodacom, Airtel, Orange, Africell).
 * - Supporte également les numéros internationaux si le format complet est fourni.
 */
export function validateClientPhone(
  rawPhone: string,
  networkType: string = 'Orange'
): { isValid: boolean; error?: string; cleanPhone?: string } {
  if (!rawPhone || !rawPhone.trim()) {
    return { isValid: false, error: 'Le numéro de téléphone est obligatoire pour confirmer le rendez-vous.' };
  }

  // Nettoyer tous les espaces, tirets, parenthèses et points
  let digits = rawPhone.replace(/[\s\-\(\)\.]/g, '');

  // Si l'utilisateur a tapé l'indicatif international +243 ou 00243
  if (digits.startsWith('+243')) {
    digits = digits.slice(4);
  } else if (digits.startsWith('00243')) {
    digits = digits.slice(5);
  } else if (digits.startsWith('+')) {
    // Numéro international hors RDC (+33, +32, +1, etc.)
    const intlDigits = digits.slice(1);
    if (!/^\d{7,15}$/.test(intlDigits)) {
      return { isValid: false, error: 'Format de numéro international invalide.' };
    }
    return { isValid: true, cleanPhone: digits };
  }

  // Si l'utilisateur commence par un 0 (ex: 0991234567 au lieu de 991234567), on le retire pour normaliser
  if (digits.startsWith('0') && digits.length === 10) {
    digits = digits.slice(1);
  }

  // Vérifier qu'il ne reste que des chiffres
  if (!/^\d+$/.test(digits)) {
    return { isValid: false, error: 'Le numéro ne doit contenir que des chiffres.' };
  }

  // Détection des suites de répétitions évidentes (ex: 000000000, 111111111, 123456789)
  if (OBVIOUS_FAKE_SEQUENCES.some((seq) => digits.includes(seq))) {
    return { isValid: false, error: 'Ce numéro de téléphone semble invalide ou fictif.' };
  }

  // Vérifier si tous les chiffres sont identiques (ex: 999999999)
  const firstChar = digits[0];
  if (digits.split('').every((c) => c === firstChar)) {
    return { isValid: false, error: 'Numéro de téléphone fictif non accepté.' };
  }

  // Si format congolais standard : doit faire exactement 9 chiffres
  if (networkType !== 'Autre') {
    if (digits.length !== 9) {
      return {
        isValid: false,
        error: `Un numéro RDC doit comporter 9 chiffres (vous en avez saisi ${digits.length}). Ex: 991234567`,
      };
    }

    // Préfixes d'opérateurs réels en RDC
    // Vodacom : 81, 82, 83, 70
    // Orange : 80, 84, 85, 89
    // Airtel : 97, 98, 99
    // Africell : 90, 91
    const prefix2 = digits.slice(0, 2);
    const validDrcPrefixes = ['80', '81', '82', '83', '84', '85', '88', '89', '90', '91', '97', '98', '99', '70'];

    if (!validDrcPrefixes.includes(prefix2)) {
      return {
        isValid: false,
        error: `Le préfixe '${prefix2}' n'est pas un indicatif mobile RDC valide (Airtel, Vodacom, Orange, Africell).`,
      };
    }
  } else {
    // Réseau "Autre" : doit comporter au moins 8 chiffres
    if (digits.length < 8 || digits.length > 15) {
      return { isValid: false, error: 'Le numéro de téléphone doit comporter entre 8 et 15 chiffres.' };
    }
  }

  return { isValid: true, cleanPhone: digits };
}

/**
 * Valide l'adresse e-mail.
 * - Facultative si vide.
 * - Stricte si renseignée : rejette les faux e-mails, domaines jetables et fautes de frappe courantes.
 */
export function validateClientEmail(email: string): { isValid: boolean; error?: string } {
  const clean = email.trim();

  // L'email est facultatif : vide = valide
  if (!clean) {
    return { isValid: true };
  }

  // Format RFC basique
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(clean)) {
    return { isValid: false, error: 'Format d\'adresse e-mail invalide (ex: exemple@gmail.com).' };
  }

  const [username, domain] = clean.toLowerCase().split('@');

  // Vérifier le nom d'utilisateur
  if (!username || username.length < 2) {
    return { isValid: false, error: 'Le nom d\'utilisateur de l\'e-mail est trop court.' };
  }

  if (FAKE_USERNAMES.has(username)) {
    return { isValid: false, error: 'Cette adresse e-mail semble être un compte de test ou fictif.' };
  }

  // Vérifier les répétitions comme aaaaa@gmail.com
  if (username.length >= 4 && username.split('').every((c) => c === username[0])) {
    return { isValid: false, error: 'Adresse e-mail fictive non acceptée.' };
  }

  // Vérifier le domaine
  if (!domain || !domain.includes('.')) {
    return { isValid: false, error: 'Le domaine de l\'e-mail est invalide.' };
  }

  if (DISPOSABLE_OR_FAKE_DOMAINS.has(domain)) {
    return {
      isValid: false,
      error: `Les adresses du domaine '@${domain}' (temporaires ou de test) ne sont pas autorisées pour la prise de rendez-vous.`,
    };
  }

  // L'extension (TLD) doit faire au moins 2 lettres
  const tld = domain.split('.').pop() || '';
  if (tld.length < 2 || !/^[a-z]+$/.test(tld)) {
    return { isValid: false, error: 'Extension de domaine d\'e-mail invalide.' };
  }

  return { isValid: true };
}
