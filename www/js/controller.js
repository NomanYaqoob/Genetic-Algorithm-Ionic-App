angular.module("starter")

.controller("HomeController", function($scope, $rootScope) {

  $scope.Parents = [];
  $rootScope.bestFitness = [];
  $rootScope.averageFitness = [];
  var randomParent1 = {},
    randomParent2 = {},
    randomP1, randomP2, survivalsFitness = 0;;
  console.log($scope.Parents.length);
  $scope.Survivals = [];
  $scope.FPSbest = [];
  $scope.FPSaverage = [];

  function getRandomArbitrary(min, max) {
    var x = +((Math.random() * (max - min) + min).toFixed(4));
    return x < 0 ? x * -1 : x;
  }

  function make2DecimalPlace(val) {
    return +(val.toFixed(4));
  }

  console.log($scope.Parents);

  function genTable(objTable, size) {
    var lastProbab = -0.0001,
      sumProbab = 0,
      sumFitness = 0,
      temp = 0;
    for (var i = 0; i < size; i++) {
      objTable.push({});
      objTable[i].x = getRandomArbitrary(-2, 2); // get X value between -2 and 2
      objTable[i].y = getRandomArbitrary(-5, 5); // get Y value between -5 and 5
      temp = make2DecimalPlace((2 * objTable[i].x) + (3 * objTable[i].y));
      objTable[i].fitness = temp;
      sumFitness += objTable[i].fitness;
    }

    for (var i = 0; i < size; i++) {
      temp = make2DecimalPlace(objTable[i].fitness / sumFitness);
      sumProbab += temp;
      objTable[i].probability = temp;
      objTable[i].rangeStart = make2DecimalPlace(lastProbab + 0.0001);
      lastProbab = make2DecimalPlace(sumProbab);
      objTable[i].rangeEnd = make2DecimalPlace(sumProbab);
    }
  }
  $scope.calculate = function() {
    for (var b = 0; b < 25; b++) {

      var temp = 0;
      $scope.Parents = [];
      $scope.Children = [];
      $scope.Survivals = [];
      console.log("Before: ", $scope.Parents.length);
      genTable($scope.Parents, 50);
      for (var n = 0; n < 15; n++) {
        randomP1 = getRandomArbitrary(0, 1);
        randomP2 = getRandomArbitrary(0, 1);

        for (var i = 0; i < 50; i++) {
          if ($scope.Parents[i].rangeStart <= randomP1 && $scope.Parents[i].rangeEnd >= randomP1) {
            randomParent1.x = $scope.Parents[i].x;
            randomParent1.y = $scope.Parents[i].y;
          } else if ($scope.Parents[i].rangeStart <= randomP2 && $scope.Parents[i].rangeEnd >= randomP2) {
            randomParent2.x = $scope.Parents[i].x;
            randomParent2.y = $scope.Parents[i].y;
          }
        }

        var temp = randomParent1.x;
        randomParent1.x = randomParent2.x;
        randomParent2.x = temp;

        var genRandom;
        genRandom = getRandomArbitrary(0, 1);
        if (genRandom > 0.2) {
          if (!(randomParent1.x + genRandom < -2 || randomParent1.x + genRandom > 2)) {
            randomParent1.x += genRandom;
          }
          if (!(randomParent1.y + genRandom < -5 || randomParent1.y + genRandom > 5)) {
            randomParent1.y += genRandom;
          }
        }
        genRandom = getRandomArbitrary(0, 1);
        if (genRandom > 0.2) {
          if (!(randomParent2.x + genRandom < -2 || randomParent2.x + genRandom > 2)) {
            randomParent2.x += genRandom;
          }
          if (!(randomParent2.y + genRandom < -5 || randomParent2.y + genRandom > 5)) {
            randomParent2.y += genRandom;
          }
        }
        $scope.Children.push({
          x: randomParent1.x,
          y: randomParent1.y
        });
        $scope.Children.push({
          x: randomParent2.x,
          y: randomParent2.y
        });
      }

      makeCombination($scope.Survivals, 50, $scope.Parents, true);
      makeCombination($scope.Survivals, 30, $scope.Children, false);
      Sort($scope.Survivals)
      $scope.FPSbest.push($scope.Survivals[0]);
      $rootScope.bestFitness.push($scope.Survivals[0].fitness);

      var sumX = 0,
        sumY = 0,
        sumAvgFitness = 0;
      for (var o = 0; o < 80; o++) {
        sumX += $scope.Survivals[o].x;
        sumY += $scope.Survivals[o].y;
        if (o != 0)
          sumAvgFitness += $scope.Survivals[o].fitness;
      }
      $scope.FPSaverage.push({
        x: sumX / 80,
        y: sumY / 80
      });
      $rootScope.averageFitness.push(sumAvgFitness / 80)

      //console.log("After: ", $scope.Parents.length);
      $scope.Survivals.splice(50, 30);
    }
    console.log("Best:", $scope.FPSbest.length);
    console.log("Average:", $scope.FPSaverage.length);
    console.log("BEst Fitness:", $rootScope.bestFitness);
    console.log($rootScope.averageFitness);
    $rootScope.FPSbest = $scope.FPSbest;
    $rootScope.FPSaverage = $scope.FPSaverage;
  }

  $scope.chart = {
    options: {
      chart: {
        type: 'line'
      },
      legend: {
        enabled: false
      }
    },
    title: {
      text: "Genetic Algorithm"
    },
    yAxis: {
      title: "Fitness",
      min: 5,
      max: 20,
      tickPixelInterval: 120,
      tickLength: 5
    },
    xAxis: {
      type: 'linear',
      min: 0,
      max: 10,
      tickPixelInterval: 60
    },
    series: [{
      name: "FPS Best",
      data: $rootScope.bestFitness
    },{
      name: "Average Fitness",
      data: $rootScope.averageFitness
    }
  ]
  };

  $scope.cutLastThirty = function() {
    $scope.Survivals.splice(50, 30);
  }


  function makeCombination(Survivals, size, data, hasFitness) {
    var lastProbab = -0.0001,
      sumProbab = 0,
      sumFitness = 0,
      temp = 0;
    if (hasFitness) {
      for (var i = 0; i < size; i++) {
        Survivals.push({});
        Survivals[i].x = data[i].x;
        Survivals[i].y = data[i].y;
        Survivals[i].fitness = data[i].fitness;
        survivalsFitness += data[i].fitness;
      }
    } else {
      for (var i = 50; i < size + 50; i++) {
        Survivals.push({});
        Survivals[i].x = data[i - 50].x;
        Survivals[i].y = data[i - 50].y;
        temp = make2DecimalPlace((2 * data[i - 50].x) + (3 * data[i - 50].y));
        Survivals[i].fitness = temp;
        survivalsFitness += temp;
      }
      for (var i = 0; i < size + 50; i++) {
        temp = make2DecimalPlace(Survivals[i].fitness / survivalsFitness);
        sumProbab += temp;
        Survivals[i].probability = temp;
        Survivals[i].rangeStart = make2DecimalPlace(lastProbab + 0.0001);
        lastProbab = make2DecimalPlace(sumProbab);
        Survivals[i].rangeEnd = make2DecimalPlace(sumProbab);
      }
    }

  }

  function Sort(array) {
    array.sort(function(a, b) {
      return b.fitness - a.fitness
    });
  }
})

.controller("ChartController", function($scope, $rootScope) {
  var iteration = 0;
  $scope.chart = {
    options: {
      chart: {
        type: 'line'
      },
      legend: {
        enabled: false
      }
    },
    title: {
      text: "Genetic Algorithm"
    },
    yAxis: {
      title: "Fitness",
      min: 5,
      max: 20,
      tickPixelInterval: 120,
      tickLength: 5
    },
    xAxis: {
      type: 'linear',
      min: 0,
      max: 10,
      tickPixelInterval: 60
    },
    series: [{
      name: "FPS Best",
      data: $rootScope.bestFitness
    },{
      name: "Average Fitness",
      data: $rootScope.averageFitness
    }
  ]
  };
  // $scope.options = {
  //   chart: {
  //     type: 'cumulativeLineChart',
  //     height: 450,
  //     margin: {
  //       top: 20,
  //       right: 20,
  //       bottom: 50,
  //       left: 65
  //     },
  //     x: function(d) {
  //       console.log("x:", iteration);
  //       return iteration++;
  //     },
  //     y: function(d) {
  //       console.log("y:", d.fitness);
  //
  //       return d.fitness;
  //     },
  //     color: d3.scale.category10().range(),
  //     //duration: 300,
  //     useInteractiveGuideline: false,
  //     clipVoronoi: false,
  //
  //     "xAxis": {
  //       axisLabel: "First Parent",
  //       // tickFormat: function(d) {
  //       //   console.log("DD", d);
  //       //   return d3.format('.02f')(d);
  //       //   axisLabelDistance:10;
  //       // },
  //     },
  //     "yAxis": {
  //       "axisLabel": "Voltage (v)",
  //       // tickFormat: function(d) {
  //       //   //console.log("DD", d);
  //       //   return d3.format('.02f')(d);
  //       // }
  //     }
  //   }
  // };
  // $scope.chart.series.data.push($rootScope.FPSbest);
  // $scope.data = [{
  //     key: "FPS Best",
  //     values: $rootScope.FPSbest
  //   },
  // {
  //   key: "FPS Average",
  //   values: $rootScope.FPSaverage
  // }

});
