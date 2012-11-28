function fractal(x_extent, y_extent) {
  var jul = {};

  var __ = {
    method: "m",
    realMin: -1.7,
    realMax: 1.7,
    imagMin: -1,
    imagMax: 1,
    CR: -.8,
    CI: .156,
    maxIter: 2000,
    minResolution: 40,
    newtonThresh: 0.000001,
    newtonContrast: 50
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

  jul.changeMethod = function(method, reals, imags) {
    if(method == "j" || method =="m" || method =="n") __.method = method;
    else __.method = "m";
    done = true;
    __.realMin = reals[0];
    __.realMax = reals[1];
    __.imagMin = imags[0];
    __.imagMax = imags[1];
    jul.resetForRender();
  }

  jul.changeColor = function(color){
    jul.color = color;
    jul.resetForRender();
  }

  jul.iterate = function(real,imag) {
      if(__.method == "j") return  jul.juliaIterate(real, imag)
      else return jul.mandelbrotIterate(real,imag)
  }

  jul.juliaIterate = function(real,imag){
    var iterations = 0;
    var zr = real;
    var zi = imag;
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

  jul.mandelbrotIterate = function(real,imag){
    var iterations = 0;
    var zr = 0;
    var zi = 0;
    while (true) {
      iterations++;
      if ( iterations > __.maxIter ) return 0;
      zr_next = zr * zr - zi * zi + real;
      zi_next = 2 * zi * zr +imag;
      zr = zr_next;
      zi = zi_next;
      if ( zr > 4 ) return iterations;
      if ( zi > 4 ) return iterations;
    }
    return iterations;
  }

  jul.newtonIterate = function(x,y)
  {
    var iterations = 0;

    var thresh = __.newtonThresh;
    while(true)
    {
      iterations++;

      var x2 = x*x;
      var x3 = x2*x;
      var x4 = x3*x;
      var x6 = x3*x3;

      var y2 = y*y;
      var y4 = y2*y2;
      var y6 = y2*y4;

      var denom = 4*Math.pow((x2 + y2),3);

      var rtemp = x*(3*y2+y6+x6 +3*x4*y2-x2 +3*x2*y4);
      rtemp /= denom;

      var itemp = y*(3*x2+y6 +3*x2*y4-y2 +x6 + 3*x4*y2);
      itemp /= denom;

      x = x - rtemp;
      y = y - itemp;

      //
      // for the equation being solved, f(Z)=Z^4-1, the iteration will converge
      // on one of four roots (-1,1,-i,i)  The tighter we make the threshold
      // around the roots the cleaner the picture will be
      //
      // each root gets its own color, and the starting point is colored with
      // the color of the root it ends up converging on.
      //

      if ( x > 1-thresh && x < 1 + thresh )
        return jul.makeColorString(255,0,0,iterations);
      if ( x < -1+thresh && x > -1-thresh )
        return jul.makeColorString(0,255,0,iterations);
      if ( y > 1-thresh && y < 1+thresh )
        return jul.makeColorString(0,0,255,iterations);
      if ( y < -1+thresh && y > -1-thresh )
        return jul.makeColorString(255,255,0,iterations);
      if ( iterations >= __.maxIter )
        return "rgb(0,0,0)";
    }
  }

  jul.makeColorString = function(r,g,b,i)
  {
    //console.log(i)
    i /= __.maxIter-20;
    i*=255;
    i *= __.newtonContrast;
    i = Math.floor(i);
    //i -= this.myRefine*50;
    if ( i > 255 ) i = 255;
    if ( i < 0 ) i = 0;
    if(r>0) r-= i;
    if(g>0) g-= i;
    if(b>0) b-= i;
    var str = "rgb(" + r + "," + g + "," + b + ")";
    return str;
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

        if(__.method == "n"){
          var color = jul.newtonIterate(real,imag);
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
        if(__.method == "n"){
          var color = jul.newtonIterate(real,imag);
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