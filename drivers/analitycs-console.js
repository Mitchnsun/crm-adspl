export default function createDriver() {
  return {
    log(event) {
      return console.log('Analitycs', event);
    },
  };
}
