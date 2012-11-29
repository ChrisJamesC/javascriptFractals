/* Julia Set */
juliaIterate = function(jul, real,imag){
  var iterations = 0;
  var zr = real;
  var zi = imag;
  while (true) {
    iterations++;
    if ( iterations > jul.__.maxIter ) return jul.__.maxIter;
    zr_next = zr * zr - zi * zi + jul.__.CR;
    zi_next = 2 * zi * zr + jul.__.CI;
    zr = zr_next;
    zi = zi_next;
    if ( zr > 4 ) return iterations;
    if ( zi > 4 ) return iterations;
  }
  return iterations;
}

/* Mandelbrot Set */
mandelbrotIterate = function(jul, real,imag, power){
  //var power= 2
  var iterations = 0;
  var zr = 0;
  var zi = 0;
  while (true) {
    iterations++;
    if ( iterations > jul.__.maxIter ) return jul.__.maxIter;
    z_pow = intPower(zr, zi, power)
    zr_next = z_pow[0] + real;
    zi_next = z_pow[1] +imag;
    zr = zr_next;
    zi = zi_next;
    if ( zr > 4 ) return iterations;
    if ( zi > 4 ) return iterations;
  }
  return iterations;
}

/* Newton fractals */
newtonColor = function(jul, x,y)
{
  var iterations = 0;

  var thresh = jul.__.newtonThresh;
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
      return makeColorString(jul, 255,0,0,iterations);
    if ( x < -1+thresh && x > -1-thresh )
      return makeColorString(jul,0,255,0,iterations);
    if ( y > 1-thresh && y < 1+thresh )
      return makeColorString(jul,0,0,255,iterations);
    if ( y < -1+thresh && y > -1-thresh )
      return makeColorString(jul,255,255,0,iterations);
    if ( iterations >= jul.__.maxIter )
      return "rgb(0,0,0)";
  }
}

makeColorString = function(jul, r,g,b,i)
{
  //console.log(i)
  i /= jul.__.maxIter-20;
  i*=255;
  i *= jul.__.newtonContrast;
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

/* Utility to compute power of complex number
 * Support for n = 0,1,2,3,4,6
 */
intPower = function(real, imag, n){
  if(n==0) return [1,0];
  if(n==1) return [real, imag];
  var z2 = multiply(real, imag, real, imag);
  if(n==2) return z2;
  var z3 = multiply(real, imag, z2[0], z2[1]);
  if(n==3) return z3;
  var z4 = multiply(z2[0], z2[1], z2[0], z2[1]);
  if(n==4) return z4;
  var z8 = multiply(z4[0], z4[1], z4[0], z4[1]);
  if(n==8) return z8;
  return [0,0]
}

multiply = function(r1, i1, r2, i2) {
  return [r1*r2 - i1*i2, r1*i2 + i1*r2]
}