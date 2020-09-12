function puzzleURL(initialDigits, difficulty, vector) {
  const baseURL = window.location.toString().replace(/\?.*$/, '');
  const params = new URLSearchParams();
  params.set('s', initialDigits);
  if (difficulty) {
      params.set('d', difficulty);
  }
  if (vector) {
      params.set('v', vector);
  }
  return baseURL + '?' + params.toString();
}

export { puzzleURL }