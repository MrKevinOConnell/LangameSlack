export function convertTZ(date: Date | string, tzString: string,locale: string) {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString(locale? locale : "en-US", {timeZone: tzString as string}));   
}

const splitAt = function(i: number, xs: string | any[]) {
    var a = xs.slice(0, i);
    var b = xs.slice(i, xs.length);
    return [a, b];
  };
  
  const shuffle = function(xs: any[]) {
    return xs.slice(0).sort(function() {
      return .5 - Math.random();
    });
  };
  
    const zip = function(xs: any[]) {
    return xs[0].map(function(_: any,i: string | number) {
      return xs.map(function(x) {
        return x[i];
      });
    });
  }
  export const result = (members: string[]): any[] => zip(splitAt(members.length/2, shuffle(members)));