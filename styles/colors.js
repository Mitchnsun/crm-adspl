const base = {
  BLACK: 'hsl(223, 11%, 13%)',
  BRONZE: 'hsl(33, 100%, 34%)',
  BRONZE_DARK: 'hsl(33, 87%, 22%)',
  GRAY: 'hsl(217, 10%, 49%)',
  GRAY_LIGHT: 'hsl(218, 31%, 90%)',
  GREEN: 'hsl(144, 52%, 34%)',
  INDIGO: 'hsl(240, 53%, 46%)',
  RED: 'hsl(0, 78%, 49%)',
  SKY: 'hsl(200, 87%, 37%)',
  SKY_DARK: 'hsl(200, 90%, 23%)',
  SKY_LIGHT: 'hsl(200, 64%, 95%)',
  WHITE: 'hsl(0, 0%, 100%)',
};

export default {
  ...base,
  PRIMARY: base.SKY,
  SECONDARY: base.BRONZE,
  SUCCESS: base.GREEN,
  WARNING: base.BRONZE,
  ERROR: base.RED,
};
