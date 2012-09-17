var color = d3.scale.linear()
  .domain([0, 12, 30, 50, 100, 180, 260, 380, 600, 800, 1200, 1600,3200])
  .range(["moccasin", "#999", "steelblue", "yellow", "brown", "#222", "pink", "purple", "#027", "#260", "orange", "yellow", "blue"])
  .interpolate(d3.interpolateHcl)

function Julia(screenXOff, screenYOff, x_extent, y_extent) {
   this.myScreenXOff = screenXOff;
   this.myScreenYOff = screenYOff;

   this.myXExtent = x_extent;
   this.myYExtent = y_extent;

   this.myRealMin = -2;
   this.myRealMax = 2;
   this.myImagMin = -1.2;
   this.myImagMax = 1.2;

   this.myCR = -.8;
   this.myCI = .156;

   this.myMaxIter = 2000;

   this._x = 0;
   this._y = 0;
   this.myBoxResolution = 100;
   this.myDone = false;
}

Julia.prototype.zoom = function(x,y,w,h) {
   this.myDone = true;

   x -= this.myScreenXOff;
   y -= this.myScreenYOff;

   x /= this.myXExtent;
   y /= this.myYExtent;
   w /= this.myXExtent;
   h /= this.myYExtent;

   var newRealMin = (this.myRealMax - this.myRealMin) * x + this.myRealMin;
   var newRealMax = newRealMin + (this.myRealMax - this.myRealMin) * w;
   var newImagMin = (this.myImagMax - this.myImagMin) * y + this.myImagMin;
   var newImagMax = newImagMin + (this.myImagMax - this.myImagMin) * h;

   this.myRealMin = newRealMin;
   this.myRealMax = newRealMax;
   this.myImagMin = newImagMin;
   this.myImagMax = newImagMax;

   this.resetForRender();
}

Julia.prototype.iterate = function(real,imag) {
   var zr = real;
   var zi = imag;

   var iterations = 0;

   while (true) {
      iterations++;
      if ( iterations > this.myMaxIter )
         return 0;

      zr_next = zr * zr - zi * zi + this.myCR;
      zi_next = 2 * zi * zr + this.myCI;

      zr = zr_next;
      zi = zi_next;

      if ( zr > 4 )
         return iterations;
      if ( zi > 4 )
         return iterations;
   }

   return iterations;
}

Julia.prototype.render = function() {
   if (this.myDone)
      return;

   if ( this.boxes() )
      return;

   var realSpan = this.myRealMax - this.myRealMin;
   var imagSpan = this.myImagMax - this.myImagMin;

   var ll = this._x + 6; // how many columns to render at once
   for ( ; this._x < ll; ++this._x) {
      for ( this._y = 0; this._y < this.myYExtent; ++this._y) {
         var fx = this._x / this.myXExtent;
         var fy = this._y / this.myYExtent;

         var real = fx * realSpan + this.myRealMin;
         var imag = fy * imagSpan + this.myImagMin;

         var iterations = this.iterate(real,imag);

         g_context.fillStyle = this.color(iterations);
         g_context.fillRect(this._x+this.myScreenXOff,
                            this._y+this.myScreenYOff,
                            1,1);
      }
   }

   if ( this._x >= this.myXExtent ) {
      this.myDone = true;
   }
}

Julia.prototype.boxes = function() {
   if ( this.myBoxResolution <= 6 ) {
      return false;
   }

   var realSpan = this.myRealMax - this.myRealMin;
   var imagSpan = this.myImagMax - this.myImagMin;

   for ( this._x = 0; this._x < this.myXExtent; this._x += this.myBoxResolution) {
      for ( this._y = 0; this._y < this.myYExtent; this._y += this.myBoxResolution) {
         var fx = (this._x + this.myBoxResolution/2) / this.myXExtent;
         var fy = (this._y + this.myBoxResolution/2) / this.myYExtent;

         var real = fx * realSpan + this.myRealMin;
         var imag = fy * imagSpan + this.myImagMin;

         var iterations = this.iterate(real,imag);

         g_context.fillStyle = this.color(iterations);
         g_context.fillRect(this._x+this.myScreenXOff,
                            this._y+this.myScreenYOff,
                            this.myBoxResolution,this.myBoxResolution);
      }
   }

   this.myBoxResolution -= 2;
   this._x = 0;
   this._y = 0;
   return true;
}

Julia.prototype.resetForRender = function() {
   this._x = 0;
   this._y = 0;
   this.myBoxResolution = 100;
   this.myDone = false;
}

Julia.prototype.color = _.memoize(color);

Julia.prototype.go = function() {
  var self = this;
  var render = function() {
    self.render();
  }
  d3.timer(render);
}