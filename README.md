A [Julia set](http://paulbourke.net/fractals/juliaset/), a Mandelbrot set or a Newton fractal. 

This project focuses on Escape-time fractals but don't hesitate to contribute in order to show more types of fractals.


Based on [syntagmatic zoomable Julia](http://bl.ocks.org/3736720) and [DougX's Canvas Fractals](http://dougx.net/fractals/fractals.html).

Changes from syntagmatic's: 
* Support for Mandelbrot fractals (also with z^3, z^4, z^8)
* Support for Newton fractals
* Support for different color spaces

Changes from Doug's:

* [HCL Color Space](http://bl.ocks.org/3014589)
* [Memoized](http://underscorejs.org/#memoize) coloring function to speed up rendering
* Modifiable parameters. Try clicking the gear, and change CR to -0.75 and CI to 0.169
