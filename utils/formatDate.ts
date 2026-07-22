import moment from "moment";

const formatDate = (date: string, lang: string) => {
  return moment(date).subtract().locale(lang).format("DD MMM YY, HH:mm");
};

export default formatDate;
