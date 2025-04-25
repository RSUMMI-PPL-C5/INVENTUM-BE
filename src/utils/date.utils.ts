/*
  Function to get the current date and time in Jakarta, Indonesia.
  Jakarta is in the UTC+7 timezone.
*/
export function getJakartaTime(): Date {
  const now = new Date();
  return new Date(now.getTime() + 7 * 60 * 60 * 1000);
}

/*
  Function to convert the current date and time to Jakarta, Indonesia.
  For validations.
*/
export function toJakartaDate(value: string, isEnd = false) {
  let date = new Date(value);
  if (isNaN(date.getTime())) return null;

  // Jika user hanya kirim tanggal (tanpa waktu), tambahkan waktu default
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    if (isEnd) {
      // Akhir hari di WIB
      date.setUTCHours(16, 59, 59, 999);
    } else {
      // Awal hari di WIB
      date.setUTCHours(17, 0, 0, 0);
      date = new Date(date.getTime() - 24 * 60 * 60 * 1000); // Mundur 1 hari
    }
  } else {
    // Jika ada waktu, tambahkan offset +7 jam
    date = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  }
  return date;
}
