function julia(x_extent, y_extent) {
  var jul = {};
  var __ = {
    realMin: -1.7,
    realMax: 1.7,
    imagMin: -1,
    imagMax: 1,
    CR: -.8,
    CI: .156,
    maxIter: 2000,
    minResolution: 40,
  };

  var events = d3.dispatch.apply(this, ["done"].concat(d3.keys(__)));

  jul.color = d3.scale.sqrt()
    .domain([0, __.maxIter])
    .range(["white", "black"])
    .interpolate(d3.interpolateLab);

  jul.__ = __;
  getset(jul, __, events);
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

  jul.iterate = function(real,imag) {
    var zr = real;
    var zi = imag;

    var iterations = 0;

    while (true) {
      iterations++;
      if ( iterations > __.maxIter ) return 0;
      zr_next = zr * zr - zi * zi + __.CR;
      zi_next = 2 * zi * zr + __.CI;
      zr = zr_next;
      zi = zi_next;
      if ( zr > 4 ) return iterations;
      if ( zi > 4 ) return iterations;
    }
    return iterations;
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

         var iterations = jul.iterate(real,imag);

         ctx.fillStyle = fast_color(iterations);
         ctx.fillRect(_x,_y,1,1);
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

          var iterations = jul.iterate(real,imag);

          ctx.fillStyle = fast_color(iterations);
          ctx.fillRect(_x,_y,resolution,resolution);
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