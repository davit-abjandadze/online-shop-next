import generateRandomNumber from "./generateRandomNumber";

function generateTwoUniqueRandomNumbers(min: number, max: number) {
  let num1 = generateRandomNumber(min, max);
  let num2 = generateRandomNumber(min, max);

  while (num2 === num1) {
    num2 = generateRandomNumber(min, max);
  }

  return [num1, num2];
}

export default generateTwoUniqueRandomNumbers;
