const areAllFieldsNull = (obj: { [key in string]: any }) => {
  for (let key in obj) {
    if (obj.hasOwnProperty(key) && obj[key] != undefined) {
      return false;
    }
  }
  return true;
};

export default areAllFieldsNull;
