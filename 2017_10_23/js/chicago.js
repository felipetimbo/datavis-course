var map = L.map('mapid').setView([41.85,-87.62], 10);
			
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/">OpenStreetMap</a> contributors',
	maxZoom: 17
}).addTo(map);

var crimeByTypeChart = dc.barChart('#crimeByTypeChart');
var crimeByDayChart = dc.seriesChart('#crimeByDayChart');

// Creating the dc.js chart objects & link to divs
var dataTable = dc.dataTable("#dc-table-graph");

// setting color scale
var colorScale = d3.scale.ordinal()
	.domain(["HOMICIDE", "ROBBERY", "BURGLARY"])
	.range(["#3182bd", "#e6550d", "#636363"]);

// loading data from a csv file
d3.csv("crimes_chicago.csv", function (data) {

	// formating data
	var dtFormat = d3.time.format("%m/%d/%Y %H:%M:%S %p");
	  
	data.forEach(function(d) {
	   d.dtg = dtFormat.parse(d.Date);
	   d.lat = +d.Latitude;
	   d.lng = +d.Longitude;
	   d.crimeType = d["Primary Type"];
	       
	   var circle = L.circle([d.lat, d.lng], 100, {
		color: colorScale(d.crimeType),
		weight: 1,
		fillColor: colorScale(d.crimeType),
		fillOpacity: 0.5
		}).addTo(map);

	   circle.bindPopup("Crime Type: " + d.crimeType + "<br /> Time: " + d.dtg);
       
	});
	
	var facts = crossfilter(data);
  
	var crimeTypeDim = facts.dimension(function(d){
		return d.crimeType;
	});
  
	var crimeTypeDimGroup = crimeTypeDim.group();
	
	crimeByTypeChart.width(650)
	    .height(500)
	    .x(d3.scale.ordinal())
	    .y(d3.scale.linear().domain([0,2000]))
	    .xUnits(dc.units.ordinal)
	    .brushOn(false)
	    .xAxisLabel('Crime Type')
	    .yAxisLabel('Total')
	    .margins({top: 10, right: 50, bottom: 50, left: 60})
	    .dimension(crimeTypeDim)
	    .group(crimeTypeDimGroup)
	    .barPadding(0.15)
	    .outerPadding(0.15)
	    .ordering(function(d){
	    	return d.value;
	    })
	    .on('renderlet', function(chart){
	    	chart.selectAll('rect.bar').each(function(d){
                  d3.select(this).attr("style", "fill: " + colorScale(d.x)); // use key accessor if you are using a custom accessor
	    	});
	 });
	
	var crimeDayDim = facts.dimension(function (d){
		return [d3.time.day(d.dtg), d.crimeType];
	});

	var crimeDayDimGroup = crimeDayDim.group();
	
	crimeByDayChart.width(960)
		.height(480)
		.dimension(crimeDayDim)
		.group(crimeDayDimGroup)
		.margins({top: 10, right: 50, bottom: 40, left: 30})
		.elasticY(true)
		.xAxisLabel('Crime Day')
	    .yAxisLabel('Total')
		.transitionDuration(500)
		.ordinalColors(["#636363", "#3182bd", "#e6550d"])
		.seriesAccessor(function(d) { 
			return d.key[1]; 
		})
		.keyAccessor(function(d) {
			return d.key[0];}
		)
		.x(d3.time.scale().domain(d3.extent(data, function(d) { 
			return d3.time.day(d.dtg); 
		 })));
	
	// Render all Charts
    dc.renderAll();
  
});