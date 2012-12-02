function fractal(x_extent, y_extent) {
  var jul = {};

  var _methods = {
    mandelbrot: {id: "m", name: "Mandelbrot", iterFunc: function(jul, real,imag){return mandelbrotIterate(jul, real, imag, 2)}},
      mandelbrot3: {id: "m3", name: "Mandelbrot z^3", iterFunc: function(jul, real,imag){return mandelbrotIterate(jul, real, imag,3)}},
      mandelbrot4: {id: "m4", name: "Mandelbrot z^4", iterFunc: function(jul, real,imag){return mandelbrotIterate(jul, real, imag,4)}},
      mandelbrot8: {id: "m8", name: "Mandelbrot z^8", iterFunc: function(jul, real,imag){return mandelbrotIterate(jul, real, imag,8)}},
      tricorn: {id: "t", name: "Tricorn", iterFunc: tricornIterate},
      burningShip: {id: "bs", name: "Burning ship", iterFunc: burningShipIterate},
    julia: {id: "j", name: "Julia", iterFunc: function(jul, real,imag){return juliaIterate(jul, real, imag, 2)}, initParams: function(){__.CR=-0.8; __.CI= .156;}},
      julia3: {id: "j3", name: "Julia z^3", iterFunc: function(jul, real,imag){return juliaIterate(jul, real, imag, 3)}, initParams: function(){__.CR=-0.8; __.CI= .156;}},
      dentrite: {id: "d", name: "Dentrite", iterFunc: function(jul, real,imag){return juliaIterate(jul, real, imag, 2)}, initParams: function(){__.CR=0; __.CI= 1;}},
      siegelDisk: {id: "sd", name: "Siegel Disk", iterFunc: function(jul, real,imag){return juliaIterate(jul, real, imag, 2)}, initParams: function(){__.CR=-0.390541; __.CI= -0.586788;}},
      douadysRabbit: {id: "dr", name: "Douady's Rabbit", iterFunc: function(jul, real,imag){return juliaIterate(jul, real, imag, 2)}, initParams: function(){__.CR=-0.123; __.CI= -0.745;}},
      sanMarco: {id: "sm", name: "San Marco", iterFunc: function(jul, real,imag){return juliaIterate(jul, real, imag, 2)}, initParams: function(){__.CR=-3/4; __.CI= 0;}},
      juliaCos: {id: "jcos", name: "Julia cos(z)+c", iterFunc: juliaCosIterate},
    barnleys: {id: "bt", name: "Barnleys Tree", iterFunc: function(jul, real,imag){return barnsleysIterate(jul, real, imag)}, initParams: function(){__.CR=0.6; __.CI= 1.1; __.maxIter=50;}},
    newton:  {id: "n", name: "Newton", iterFunc: null }
  }

  var _menuItems = {
    mandelbrotItems: {
      name:"Mandelbrot",
      id:"mandelbrotMenu",
      main:_methods.mandelbrot,
      others:[_methods.mandelbrot3, _methods.mandelbrot4, _methods.mandelbrot8, _methods.tricorn, _methods.burningShip]
    },
    juliaItems: {
      name:"Julia",
      id:"JuliaMenu",
      main: _methods.julia,
      others: [_methods.julia3, _methods.dentrite, _methods.siegelDisk, _methods.douadysRabbit, _methods.sanMarco]
    },
    BarnleysItems:{
      name:"Barnleys Tree",
      id:"BarnleysMenu",
      main:_methods.barnleys,
      others: []
    },
    NewtonItems:{
      name:"Newton",
      id:"NewtonMenu",
      main:_methods.newton,
      others: []
    }
  }

  var __ = {
    method: _methods.mandelbrot,
    realMin: -1.7,
    realMax: 1.7,
    imagMin: -1,
    imagMax: 1,
    maxIter: 2000,
    minResolution: 40,
    CR: -.8,
    CI: .156,
    newtonThresh: 0.000001,
    newtonContrast: 50
  };

  var events = d3.dispatch.apply(this, ["done"].concat(d3.keys(__)));

  jul.color = d3.scale.sqrt()
    .domain([0, __.maxIter])
    .range(["white", "black"])
    .interpolate(d3.interpolateLab);

  jul.__ = __;
  jul._menuItems = _menuItems
  getset(jul, __, events);
  //getset(jul, _methods, events);
  d3.rebind(jul, events, "on");

  var ctx;
  var _x = 0;
  var _y = 0;
  var resolution = __.minResolution;
  var done = false;

  jul.zoom = function(reals,imags) {
    done = true;
    __.realMin = reals[0];
    __.realMax = reals[1];
    __.imagMin = imags[0];
    __.imagMax = imags[1];
    jul.resetForRender();
  }

  jul.changeMethod = function(method, reals, imags) {
    //if(method == "j" || method =="m" || method =="n") __.method = method;
    //else __.method = "m";
    __.method = method
    done = true;
    __.realMin = reals[0];
    __.realMax = reals[1];
    __.imagMin = imags[0];
    __.imagMax = imags[1];
    if(method.initParams != null ){
      method.initParams();
    }
    jul.resetForRender();
  }

  jul.changeColor = function(color){
    jul.color = color;
    jul.resetForRender();
  }

  jul.iterate = function(real,imag) {
      //if(__.method == "j") return  juliaIterate(jul, real, imag)
      //else return mandelbrotIterate(jul, real,imag, 2)
    //console.log("call of jul.iterate")
    return __.method.iterFunc(jul, real, imag)

  }

  jul.render = function() {
    if (done)
      return;

    if ( jul.boxes() )
      return;

    var realSpan = __.realMax - __.realMin;
    var imagSpan = __.imagMax - __.imagMin;
    var realMin = __.realMin;
    var imagMin = __.imagMin;
    var fast_color = _.memoize(jul.color);

    var ll = _x + 6; // how many columns to render at once
    for ( ; _x < ll; ++_x) {
      for ( _y = 0; _y < y_extent; ++_y) {
        var fx = _x / x_extent;
        var fy = _y / y_extent;

        var real = fx * realSpan + realMin;
        var imag = fy * imagSpan + imagMin;

        if(__.method == _methods.newton){
          var color = newtonColor(jul, real,imag);
          ctx.fillStyle = color;
          ctx.fillRect(_x,_y,1,1);
        }else {
          var iterations = jul.iterate(real,imag);
          ctx.fillStyle = fast_color(iterations);
          ctx.fillRect(_x,_y,1,1);
        }
      }
    }

    if ( _x >= x_extent ) {
      done = true;
      events.done.call(jul);
    }
  }

  jul.boxes = function() {
    if ( resolution <= 3 ) {
      return false;
    }

    var realSpan = __.realMax - __.realMin;
    var imagSpan = __.imagMax - __.imagMin;
    var fast_color = _.memoize(jul.color);

    for ( _x = 0; _x < x_extent; _x += resolution) {
      for ( _y = 0; _y < y_extent; _y += resolution) {
        var fx = (_x + resolution/2) / x_extent;
        var fy = (_y + resolution/2) / y_extent;

        var real = fx * realSpan + __.realMin;
        var imag = fy * imagSpan + __.imagMin;
        /*
        var iterations = jul.iterate(real,imag);

        ctx.fillStyle = fast_color(iterations);
        ctx.fillRect(_x,_y,resolution,resolution);
        */
        if(__.method == _methods.newton){
          var color = newtonColor(jul, real,imag);
          ctx.fillStyle = color;
          ctx.fillRect(_x,_y,resolution,resolution);
        }else {
          var iterations = jul.iterate(real,imag);
          ctx.fillStyle = fast_color(iterations);
          ctx.fillRect(_x,_y,resolution,resolution);
        }
      }
    }

    resolution -= 3;
    _x = 0;
    _y = 0;
    return true;
  }

  jul.resetForRender = function() {
    _x = 0;
    _y = 0;
    resolution = __.minResolution;
    done = false;
  }

  jul.context  = function(_) {
    if (!arguments.length) return ctx;
    ctx = _;
    return this;
  };

  jul.x_extent = function(_) {
    if (!arguments.length) return x_extent;
    x_extent = _;
    jul.resetForRender();
    return this;
  };

  jul.y_extent = function(_) {
    if (!arguments.length) return y_extent;
    y_extent = _;
    jul.resetForRender();
    return this;
  };

  jul.go = function() {
    var render = function() {
      jul.render();
    }
    d3.timer(render);
  }

  // getter/setter with event firing
  function getset(obj,state)  {
    d3.keys(state).forEach(function(key) {
      obj[key] = function(x) {
        if (!arguments.length) return state[key];
        var old = state[key];
        state[key] = typeof (x - 0) == "number" ? x - 0 : x;
        events[key].call(jul,{"value": state[key], "previous": old});
        obj.resetForRender();
        return obj;
      };
    });
  };

  return jul;
}