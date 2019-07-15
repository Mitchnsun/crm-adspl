const base = {
  BLACK: 'hsl(223, 11%, 13%)',
  BRONZE: 'hsl(33, 100%, 34%)',
  GREEN: 'hsl(144, 52%, 34%)',
  RED: 'hsl(0, 78%, 49%)',
  SLATE: 'hsl(205, 40%, 36%)',
  SLATE_DARK: 'hsl(205, 25%, 15%)',
};

export default {
  ...base,
  SUCCESS: base.GREEN,
  WARNING: base.BRONZE,
  ERROR: base.RED,
};
