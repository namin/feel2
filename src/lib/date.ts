  function pad2(indent, x) {
    var str = ''+x
    if (str.length == 1) {
      str = indent+str;
    }
    return str;
  }

  export function formatDate(d) {
    const date = new Date(parseInt(d));
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    var s = date.toLocaleDateString(undefined, options);
    const [hour, minutes] = [date.getHours(), date.getMinutes()];
    s += ' '+hour+':'+pad2('0', minutes)
    return s
  }
