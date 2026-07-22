const toFixed = (n: string, fixed: number) =>
  `${n}`.match(new RegExp(`^-?\\d*(?:\.\\d{0,${fixed}})?`))?.[0];

export default toFixed;
