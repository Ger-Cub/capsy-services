/**
 * Utilitaires de validation stricts pour le formulaire de prise de rendez-vous CAPSY.
 * - E-mail : OBLIGATOIRE et strictement validé (rejet des faux emails et domaines jetables).
 * - Téléphone : OBLIGATOIRE et strictement validé (exactement 9 chiffres pour la RDC).
 * - Nom : FACULTATIF (pseudonyme ou anonyme autorisé).
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
 * Valide le nom du client (désormais FACULTATIF).
 * Si renseigné, vérifie qu'il ne s'agit pas d'un texte bidon.
 */
export function validateClientName(name: string): { isValid: boolean; error?: string } {
  const clean = name.trim();
  // Facultatif : si vide, c'est valide (le système utilisera un pseudonyme par défaut)
  if (!clean) {
    return { isValid: true };
  }

  if (clean.length < 2) {
    return { isValid: false, error: 'Le nom doit comporter au moins 2 caractères.' };
  }

  const lower = clean.toLowerCase();
  if (FAKE_USERNAMES.has(lower) || lower === 'asdf' || lower === 'test') {
    return { isValid: false, error: 'Veuillez saisir un nom ou pseudonyme valide.' };
  }

  // Ne doit pas être composé uniquement de chiffres
  const letterCount = (clean.match(/[a-zA-ZÀ-ÿ]/g) || []).length;
  if (letterCount < 1) {
    return { isValid: false, error: 'Le nom doit comporter des lettres.' };
  }

  return { isValid: true };
}

/**
 * Détecte automatiquement l'opérateur mobile RDC à partir des premiers chiffres.
 */
export function detectDrcNetwork(digits: string): 'Airtel' | 'Vodacom' | 'Orange' | 'Autre' | null {
  if (!digits || digits.length < 2) return null;
  const p = digits.slice(0, 2);

  if (['97', '98', '99'].includes(p)) return 'Airtel';
  if (['81', '82', '83', '70'].includes(p)) return 'Vodacom';
  if (['80', '84', '85', '89'].includes(p)) return 'Orange';
  if (['90', '91'].includes(p)) return 'Autre'; // Africell
  return null;
}

/**
 * Valide et normalise le numéro de téléphone.
 * - Le numéro est OBLIGATOIRE.
 * - En RDC (+243) : doit comporter exactement 9 chiffres après normalisation.
 * - Rejette les suites séquentielles et numéros fictifs.
 */
export function validateClientPhone(
  rawPhone: string,
  networkType: string = 'Orange'
): { isValid: boolean; error?: string; cleanPhone?: string } {
  const clean = (rawPhone || '').trim();
  if (!clean) {
    return { isValid: false, error: 'Le numéro de téléphone est obligatoire.' };
  }

  // Nettoyer tous les espaces, tirets, parenthèses et points
  let digits = clean.replace(/[\s\-\(\)\.]/g, '');

  // Si l'utilisateur tape l'indicatif international +243 ou 00243
  if (digits.startsWith('+243')) {
    digits = digits.slice(4);
  } else if (digits.startsWith('00243')) {
    digits = digits.slice(5);
  } else if (digits.startsWith('+')) {
    // Numéro international hors RDC
    const intlDigits = digits.slice(1);
    if (!/^\d{8,15}$/.test(intlDigits)) {
      return { isValid: false, error: 'Format de numéro international invalide (8 à 15 chiffres requis).' };
    }
    return { isValid: true, cleanPhone: digits };
  }

  // Si l'utilisateur commence par un 0 (ex: 0991234567 au lieu de 991234567), on le retire
  if (digits.startsWith('0') && digits.length === 10) {
    digits = digits.slice(1);
  }

  // Vérifier qu'il ne reste que des chiffres
  if (!/^\d+$/.test(digits)) {
    return { isValid: false, error: 'Le numéro ne doit contenir que des chiffres.' };
  }

  // Détection des suites de répétitions évidentes (ex: 000000000, 111111111, 123456789)
  if (OBVIOUS_FAKE_SEQUENCES.some((seq) => digits.includes(seq))) {
    return { isValid: false, error: 'Ce numéro de téléphone semble fictif ou invalide.' };
  }

  // Vérifier si tous les chiffres sont identiques (ex: 999999999)
  const firstChar = digits[0];
  if (digits.length >= 7 && digits.split('').every((c) => c === firstChar)) {
    return { isValid: false, error: 'Numéro de téléphone fictif non accepté.' };
  }

  // Pour la RDC (+243) : exactement 9 chiffres requis
  if (digits.length < 9) {
    return {
      isValid: false,
      error: `Numéro incomplet : 9 chiffres requis (vous en avez saisi ${digits.length}). Ex: 991102444`,
    };
  }

  if (digits.length > 9 && !digits.startsWith('+')) {
    return {
      isValid: false,
      error: `Numéro trop long : 9 chiffres requis pour la RDC (vous en avez saisi ${digits.length}).`,
    };
  }

  // Préfixes d'opérateurs réels en RDC
  const prefix2 = digits.slice(0, 2);
  const validDrcPrefixes = ['80', '81', '82', '83', '84', '85', '88', '89', '90', '91', '97', '98', '99', '70'];

  if (!validDrcPrefixes.includes(prefix2)) {
    return {
      isValid: false,
      error: `Le préfixe '${prefix2}' n'est pas un indicatif mobile RDC valide (Airtel, Vodacom, Orange, Africell).`,
    };
  }

  return { isValid: true, cleanPhone: digits };
}

/**
 * Valide l'adresse e-mail.
 * - L'adresse e-mail est OBLIGATOIRE.
 * - Stricte : rejette les faux e-mails (comme gercub@.outlook.com), domaines sans label et domaines jetables.
 */
export function validateClientEmail(email: string): { isValid: boolean; error?: string } {
  const clean = (email || '').trim();

  // L'e-mail est désormais OBLIGATOIRE
  if (!clean) {
    return { isValid: false, error: 'L\'adresse e-mail est obligatoire pour recevoir la confirmation.' };
  }

  // Regex RFC stricte :
  // Le domaine après @ doit comporter un nom alphanumérique valide avant chaque point (interdit @.outlook.com)
  const strictEmailRegex = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9]+([a-zA-Z0-9-]*[a-zA-Z0-9]+)?\.)+[a-zA-Z]{2,}$/;
  if (!strictEmailRegex.test(clean)) {
    // Message spécifique si l'utilisateur a tapé @. ou deux points
    if (clean.includes('@.')) {
      return { isValid: false, error: 'Domaine d\'e-mail invalide : supprimez le point immédiatement après le @.' };
    }
    if (clean.includes('..')) {
      return { isValid: false, error: 'L\'e-mail ne peut pas contenir deux points consécutifs.' };
    }
    return { isValid: false, error: 'Format d\'adresse e-mail invalide (ex: nom@domaine.com).' };
  }

  const [username, domain] = clean.toLowerCase().split('@');

  // Vérifier le nom d'utilisateur
  if (!username || username.length < 2) {
    return { isValid: false, error: 'Le nom d\'utilisateur avant @ est trop court.' };
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
      error: `Les adresses du domaine '@${domain}' (temporaires ou jetables) ne sont pas acceptées.`,
    };
  }

  // L'extension finale (TLD) doit faire au moins 2 lettres alphabétiques
  const tld = domain.split('.').pop() || '';
  if (tld.length < 2 || !/^[a-z]+$/.test(tld)) {
    return { isValid: false, error: 'Extension de domaine d\'e-mail invalide (ex: .com, .cd, .org).' };
  }

  return { isValid: true };
}
