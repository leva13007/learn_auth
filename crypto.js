import bcrypt from 'bcrypt';

const password = "Password1";
const hash = await bcrypt.hash(password, 10);

const isSame = await bcrypt.compare(password, hash);
console.log(isSame); // true / false