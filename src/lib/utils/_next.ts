function next(minute: number) {
  const now = new Date();
  const remain = {
    seconds: 60 - now.getSeconds(),
    minutes: now.getMinutes() % minute,
  };

  const seconds = remain.seconds;
  const minutes = remain.minutes === 0 ? minute : minute - remain.minutes;

  if (seconds === 60) {
    return minutes * 60 * 1000;
  }
  return (minutes - 1) * 60 * 1000 + seconds * 1000;
}

export default next;
