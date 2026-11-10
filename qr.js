function qrSvg(reference) {
  const bits = [];
  const push = (value, count) => {
    for (let bit = count - 1; bit >= 0; bit--) bits.push((value >> bit) & 1);
  };
  const payload = new TextEncoder().encode(reference);
  if (payload.length > 17) throw Error('Booking reference is too long.');
  push(4, 4);
  push(payload.length, 8);
  for (const byte of payload) push(byte, 8);
  push(0, 4);
  while (bits.length % 8) bits.push(0);
  const data = [];
  for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(''), 2));
  for (let i = 0; data.length < 19; i++) data.push(i % 2 ? 17 : 236);
  const multiply = (a, b) => {
    let result = 0;
    while (b) {
      if (b & 1) result ^= a;
      a = (a << 1) ^ (a & 128 ? 285 : 0);
      b >>= 1;
    }
    return result;
  };
  const correctionBytes = 7;
  // Build the degree-seven Reed–Solomon generator over GF(256).
  let polynomial = [1],
    root = 1;
  for (let i = 0; i < correctionBytes; i++) {
    const next = Array(polynomial.length + 1).fill(0);
    polynomial.forEach((value, index) => {
      next[index] ^= value;
      next[index + 1] ^= multiply(value, root);
    });
    polynomial = next;
    root = multiply(root, 2);
  }
  const ecc = Array(7).fill(0);
  for (const byte of data) {
    const factor = byte ^ ecc.shift();
    ecc.push(0);
    for (let i = 0; i < 7; i++) ecc[i] ^= multiply(polynomial[i + 1], factor);
  }
  const code = [...data, ...ecc];
  const matrix = Array.from({ length: 21 }, () => Array(21).fill(null));
  const set = (x, y, value) => {
    if (x >= 0 && x < 21 && y >= 0 && y < 21) matrix[y][x] = value;
  };
  for (const [cx, cy] of [
    [3, 3],
    [17, 3],
    [3, 17],
  ])
    for (let y = -4; y <= 4; y++)
      for (let x = -4; x <= 4; x++) {
        const d = Math.max(Math.abs(x), Math.abs(y));
        set(cx + x, cy + y, d !== 2 && d !== 4);
      }
  for (let i = 8; i < 13; i++) {
    set(i, 6, i % 2 === 0);
    set(6, i, i % 2 === 0);
  }
  const format = 0x77c4;
  const f = (x, y, i) => set(x, y, Boolean((format >> i) & 1));
  for (let i = 0; i <= 5; i++) f(8, i, i);
  f(8, 7, 6);
  f(8, 8, 7);
  f(7, 8, 8);
  for (let i = 9; i < 15; i++) f(14 - i, 8, i);
  for (let i = 0; i < 8; i++) f(20 - i, 8, i);
  for (let i = 8; i < 15; i++) f(8, 6 + i, i);
  set(8, 13, true);
  let index = 0;
  for (let right = 20; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let i = 0; i < 21; i++) {
      const y = (right + 1) & 2 ? i : 20 - i;
      for (let x = right; x >= right - 1; x--)
        if (matrix[y][x] === null) {
          const bit = (code[index >> 3] >> (7 - (index++ % 8))) & 1;
          set(x, y, Boolean(bit ^ ((x + y) % 2 === 0)));
        }
    }
  }
  const path = matrix
    .map((row, y) =>
      row.map((on, x) => (on ? 'M' + (x + 4) + ' ' + (y + 4) + 'h1v1h-1z' : '')).join(''),
    )
    .join('');
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 29 29" role="img"' +
    ' aria-label="Booking reference QR code" shape-rendering="crispEdges"><path' +
    ' fill="#F3EEE9" d="M0 0h29v29H0z"/><path fill="#705849" d="' +
    path +
    '"/></svg>'
  );
}
