// Application form validation
export function validateApplication(body) {
  const { nickname, discord, aternos_username, reason } = body;
  const errors = [];

  if (!nickname?.trim())          errors.push('Nickname is required.');
  if (!discord?.trim())           errors.push('Discord tag is required.');
  if (!aternos_username?.trim())  errors.push('Aternos username is required.');
  if (!reason?.trim())            errors.push('Reason is required.');
  if (reason?.trim().length < 20) errors.push('Please write at least 20 characters for your reason.');

  return errors;
}
