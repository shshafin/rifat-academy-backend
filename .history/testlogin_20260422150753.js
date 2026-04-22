const bcrypt = require('bcryptjs');

const hash = '$wp$2y$10$LzWb7YHnfgST6VAGPrwwCujhNTs5gy5ncTLmDFk4jYuLE2BFIYije';
const pass = 'test';

const converted = hash.replace('$wp$2y$', '$2b$');
console.log('result:', bcrypt.compareSync(pass, converted));