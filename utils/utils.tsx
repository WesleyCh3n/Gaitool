
export function findClosestIndex(arr: number[], target: number): number {
  const diffArr = arr.map(x => Math.abs(target - x));
  const minNumber = Math.min(...diffArr);
  return diffArr.findIndex(x => x === minNumber);
}
