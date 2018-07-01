const D3_ELEMENTS = {
    svg: null
}

const CHART_DATA = [
    {status: "Warning", percent: 0, count: 0},
    {status: "Need attention", percent: 0, count: 0},
    {status: "In progress", percent: 0, count: 0}
];

function change(data){};

function renderPieChart() {
    const width = 960,
        height = 500,
        radius = Math.min(width, height) / 2;

    const toolTip = d3.select("body").append("div").attr("class", "toolTip");

    const pie = d3.layout.pie()
        .value(function(d) { return d.count; })
        .sort(null);

    const arc = d3.svg.arc()
        .innerRadius(radius - 100)
        .outerRadius(radius - 20);

    const svg = d3.select(".chart-container").append("svg")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("viewBox", "0 0 960 500")
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    D3_ELEMENTS.svg = svg;

    const path = svg.datum(CHART_DATA).selectAll("path")
        .data(pie)
        .enter().append("path")
        .attr("fill", function(d, i) { return ["red", "yellow", '#efefef'][i] })
        .attr("d", arc)
        .each(function(d) { this._current = d; }); // store the initial angles

    d3.selectAll("path").on("mousemove", function(d) {
        toolTip.style("left", d3.event.pageX+10+"px");
        toolTip.style("top", d3.event.pageY-25+"px");
        toolTip.style("display", "inline-block");
        toolTip.html(`${d.data.status}: ${d.data.percent}%`);
    });

    d3.selectAll("path").on("mouseout", function(d){
        toolTip.style("display", "none");
    });

    change = function(data) {
        const path = svg.datum(data).selectAll("path").data(pie);
        path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs
    };

    // Store the displayed angles in _current.
    // Then, interpolate from _current to the new angles.
    // During the transition, _current is updated in-place by d3.interpolate.
    function arcTween(a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function(t) {
        return arc(i(t));
        };
    }
}

function displayClock() {
    const svg = D3_ELEMENTS.svg;
    svg.append('line').attr('id', 'h-hand').attr('x2', 0).attr('y2', -60);
    svg.append('line').attr('id', 'm-hand').attr('x2', 0).attr('y2', -120);
    svg.append('line').attr('id', 's-hand').attr('x2', 0).attr('y2', -120);
}

function startClock() {
    setInterval(setClock, 1000);
}


function setClock(){
    var d, h, m, s;
    d = new Date();
    
    h = 30 * ((d.getHours() % 12) + d.getMinutes() / 60);
    m = 6 * d.getMinutes();
    s = 6 * d.getSeconds();

    setAttr('h-hand', h);
    setAttr('m-hand', m);
    setAttr('s-hand', s);
}

function setAttr(id,val){
    var v = `rotate(${val}deg)`;
    $(`#${id}`).css('transform', v);
};

function initializePieChart() {
    renderPieChart();
    displayClock();
    startClock();
}

$(initializePieChart);