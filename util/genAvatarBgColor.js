module.exports = function () {
  let bgcArr = [
    "#ff0000",
    "#ff4000",
    "#ff8000",
    "#ffbf00",
    "#ffff00",
    "#bfff00",
    "#80ff00",
    "#40ff00",
    "#00ff00",
    "#00ff40",
    "#00ff80",
    "#00ffbf",
    "#00ffff",
    "#00bfff",
    "#007fff",
    "#0040ff",
    "#0000ff",
    "#7f00ff",
    "#bf00ff",
    "#ff00ff",
    "#ff00bf",
    "#ff0080",
    "#ff0040",
    "#ff0000",
  ];
  let index = Math.floor(Math.random()*(bgcArr.length))
  return bgcArr[index]
};


