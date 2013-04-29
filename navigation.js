var width = document.body.clientWidth;
var height = document.body.clientHeight;
var canvas = document.getElementById('theCanvas');
var interaction_canvas = document.getElementById('interactionCanvas');


var param_names = {
    realMin: "Minimum X",
    realMax: "Maximum X",
    imagMin: "Minimum Y",
    imagMax: "Maximum Y",
    maxIter: "Maximal Iterations",
    minResolution: "Minimal Resolution",
    CR: "C (Real part)",
    CI: "C (Imaginary part)",
    newtonThresh: "Threshold",
    newtonContrast: "Constrast"
}


/* Scaling */
var real_scale = d3.scale.linear()
    .range([0, width])
    .domain([-1.7,1.7]);

var imag_scale = d3.scale.linear()
    .range([0, height])
    .domain([-1,1]);

d3.selectAll("canvas")
    .attr("width", width)
    .attr("height", height);

var ctx = canvas.getContext('2d');

jul = fractal(width,height)
    .context(ctx)
    .minResolution(21);

/* Colors */
var bw = d3.scale.sqrt()
    .domain([0, jul.__.maxIter])
    .range(["white", "black"])
    .interpolate(d3.interpolateLab);

var mixed = d3.scale.linear()
    .domain([0, 12, 30, 50, 100, 180, 260, 380, 600, 800, 1200, 1600, 3200])
    .range(["moccasin", "#999", "steelblue", "yellow", "brown", "#222", "pink", "purple", "#027", "#260", "orange", "yellow", "blue"])
    .interpolate(d3.interpolateHcl);

var greenBlack = d3.scale.sqrt()
    .domain([0, jul.__.maxIter])
    .range(["black", "green"])
    .interpolate(d3.interpolateLab);

var deep = d3.scale.linear()
    .domain(d3.range(0,jul.__.maxIter,20))
    .range(d3.range(0,100).map(function(i) { return d3.hcl(190+120*i, 40+35*Math.round(Math.cos(i/5)), 18+6*(i%10)).toString(); }))
    .interpolate(d3.interpolateLab);

var zoom = d3.behavior.zoom()
    .x(real_scale)
    .y(imag_scale)
    .on("zoom", onzoom)

function onzoom() {
    d3.select("#input-realMin").attr("value", real_scale.domain()[0]);
    d3.select("#input-imagMin").attr("value", imag_scale.domain()[0]);
    d3.select("#input-realMax").attr("value", real_scale.domain()[1]);
    d3.select("#input-imagMax").attr("value", imag_scale.domain()[1]);
    jul.zoom(real_scale.domain(), imag_scale.domain());
};

function resetZoom() {
    real_scale.domain([-1.7,1.7]);
    imag_scale.domain([-1,1]);
    zoom.scale(1)
        .translate([0,0])
        .x(real_scale)
        .y(imag_scale);
    onzoom();
}

function changeMethod(method){
    real_scale.domain([-1.7,1.7]);
    imag_scale.domain([-1,1]);
    zoom.scale(1)
        .translate([0,0])
        .x(real_scale)
        .y(imag_scale);
    d3.select("#input-realMin").attr("value", real_scale.domain()[0]);
    d3.select("#input-imagMin").attr("value", imag_scale.domain()[0]);
    d3.select("#input-realMax").attr("value", real_scale.domain()[1]);
    d3.select("#input-imagMax").attr("value", imag_scale.domain()[1]);
    jul.changeMethod(method, real_scale.domain(), imag_scale.domain());
    updateKeys(method);
    activate(method)
}

function activate(method){
    d3.selectAll(".subchoice").classed("active", false)
    d3.selectAll(".choice").classed("active", false)
    d3.select("#"+method.id).classed("active", true)
}

function updateMethods() {
    d3.select("#methods").html("")
    d3.keys(jul._menuItems).
        forEach(function(menuItem) {
            var menu = jul._menuItems[menuItem]
            d3.select("#methods")
                .append("span")
                .attr("id", menu.main.id)
                .attr("class", "choice")
                .html(menu.name+"<br/>")
                .on("click", function(){changeMethod(menu.main)})
            menu.others.forEach(function(item){
                d3.select("#methods")
                    .append("span")
                    .attr("id", item.id)
                    .attr("class", "subchoice")
                    .html(item.name+"<br/>")
                    .on("click", function(){changeMethod(item)})
            })
        });
}

function changeColor(color){
    jul.changeColor(color)
    d3.select("#mixed").classed("active", color==mixed);
    d3.select("#deep").classed("active", color==deep);
    d3.select("#bw").classed("active", color==bw);
    d3.select("#greenBlack").classed("active", color==greenBlack);
}

// bind inputs to julia parameters
function updateKeys(method) {
    d3.select("#tools").html('')
    d3.keys(jul.__).filter(
        function(key){
            var specificFilterJ = (method.id == 'j' || method.id=='j3') | ((key != "CR") & (key != "CI"));
            var specificFilterN = method.id== 'n' | ((key != "newtonThresh") & (key != "newtonContrast"));
            var generalFilter = (key!= "method");
            return specificFilterJ & specificFilterN & generalFilter;
        }).
        forEach(function(key) {
            d3.select("#tools")
                .append("div")
                .html(param_names[key] + "<br/>")
                .append("input")
                .attr({
                    id: "input-" + key,
                    type: "text",
                    value: jul[key]()
                })
                .on("keyup", function() {
                    jul[key](this.value);
                });
        });
}

jul.color = deep;
//d3.select("#deep").classed("active");
updateKeys(jul.__.method);
updateMethods()
activate(jul.__.method)
jul.render();
jul.go();

d3.select(interaction_canvas)
    .call(zoom);

window.onresize = function() {
    width = document.body.clientWidth;
    height = document.body.clientHeight;

    real_scale.range([0, width]);
    imag_scale.range([0, height]);
    jul.x_extent(width)
        .y_extent(height);

    d3.selectAll("canvas")
        .attr("width", width)
        .attr("height", height);

    resetZoom()

}
