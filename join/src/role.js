export function roleFromLocation({ search, hash }) {
  const role = new URLSearchParams(search).get('role');
  if (role === 'creator' || role === 'illustrator') return role;
  if (/^#s(?:10|[1-9])$/.test(hash)) return 'creator';
  return /^#i(?:10|[1-9])$/.test(hash) ? 'illustrator' : null;
}

export function slideIndexForRole(role, hash) {
  const prefix = role === 'illustrator' ? 'i' : 's';
  const match = new RegExp(`^#${prefix}(10|[1-9])$`).exec(hash);
  return match ? Number(match[1]) - 1 : 0;
}
