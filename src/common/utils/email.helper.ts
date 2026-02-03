
export const normalizeEmail = (email: string): string => {
  if (!email) return '';
  
  const lowerEmail = email.toLowerCase().trim();
  const [localPart, domain] = lowerEmail.split('@');

  
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    
    const [alias] = localPart.split('+');
   
    const cleanLocalPart = alias.replace(/\./g, '');
    return `${cleanLocalPart}@${domain}`;
  }

  return lowerEmail;
};
