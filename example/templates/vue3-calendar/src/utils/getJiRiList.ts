/*
 * @Description:根据时间范围,吉日名称查询吉日列表
 * @Date: 2023-05-17 10:23:04
 * @Author: didi
 * @LastEditTime: 2023-05-18 10:56:46
 */
import { Solar } from "lunar-typescript";
export const getJiRiList = (
  type: "1" | "2", //1:查询宜,2:查询忌
  name: string,
  starttime: string | number,
  endtime: string | number
) => {
  const starttimestamp = new Date(starttime).getTime();
  const endtimestamp = new Date(endtime).getTime();
  const solarIns: Solar[] = [];
  for (let i = starttimestamp; i < endtimestamp + 100; i = i + 86400000) {
    const solar = Solar.fromDate(new Date(i));
    if (type === "1" && solar.getLunar().getDayYi().indexOf(name) != -1)
      solarIns.push(solar);
    if (type === "2" && solar.getLunar().getDayJi().indexOf(name) != -1)
      solarIns.push(solar);
  }
  return solarIns;
};
