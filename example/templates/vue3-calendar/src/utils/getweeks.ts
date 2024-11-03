/*
 * @Description:
 * @Date: 2023-05-16 11:54:03
 * @Author: didi
 * @LastEditTime: 2023-05-16 11:54:14
 */
export function getYearWeek(
  year: number,
  month: string,
  date: number | undefined
) {
  /*  
        dateNow是当前日期 
        dateFirst是当年第一天  
        dataNumber是当前日期是今年第多少天  
        用dataNumber + 当前年的第一天的周差距的和在除以7就是本年第几周  
    */
  let dateNow = new Date(year, parseInt(month) - 1, date);
  let dateFirst = new Date(year, 0, 1);
  let dataNumber = Math.round(
    (dateNow.valueOf() - dateFirst.valueOf()) / 86400000
  );
  return Math.ceil((dataNumber + (dateFirst.getDay() + 1 - 1)) / 7);
}
