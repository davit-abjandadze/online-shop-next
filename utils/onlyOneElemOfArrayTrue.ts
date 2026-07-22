function onlyOneElemOfArrayTrue(array: any[]) {
  return array.filter((elem) => !!elem).length === 1;
}

export default onlyOneElemOfArrayTrue;
