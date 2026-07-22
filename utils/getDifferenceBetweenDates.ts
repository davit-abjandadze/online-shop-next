import moment from "moment";

const getDifferenceBetweenDates = (datestr_1: string, datestr_2: string) => {
  const date_1 = new Date(datestr_1).getTime();
  const date_2 = new Date(datestr_2).getTime();

  var now = moment(date_1);
  var end = moment(date_2);
  var duration = moment.duration(end.diff(now));
  var days = duration.asDays();
  var hours = duration.hours();
  var minutes = duration.minutes();
  var seconds = duration.seconds();

  return { days, hours, minutes, seconds };
};

export default getDifferenceBetweenDates;
