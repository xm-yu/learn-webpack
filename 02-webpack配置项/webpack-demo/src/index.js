import { hello } from './utils/utils';
let x = 10 ** 3;
x **= 3;

console.log(x);
let array = [1, 2, 3, 4, 5, 6];
array.includes((item) => item > 2);
new Promise(() => {});
console.log('test');
hello();

console.log(process.env.NODE_ENV);
console.log(module);
// Enable HMR
if (process.env.NODE_ENV === 'development') {
  const HMR = module.hot;
  HMR && HMR.accept && HMR.accept();
}
