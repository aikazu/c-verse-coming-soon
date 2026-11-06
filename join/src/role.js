export function roleFromLocation({ search, hash }) {
  const role = new URLSearchParams(search).get('role');
  if (role === 'creator' || role === 'illustrator') return role;
  return /^#s(?:10|[1-9])$/.test(hash) ? 'creator' : null;
}
