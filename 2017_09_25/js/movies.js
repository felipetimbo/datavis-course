let file = "movies.json";

/**
 * Callback function
 */
d3.json(file, function(error, json) {
	render(json, "Worldwide_Gross_M", "Ranking de bilheterias de filmes", 0.4, "#4682b4", "Film");
	render(json, "Budget_M", "Ranking de orçamentos de filmes", 3.5, "#a66f00", "Film");
	
	json.map((obj) => {
	    obj.Profit = obj.Worldwide_Gross_M - obj.Budget_M;
	    return obj;
	})
	
	render(json, "Profit", "Ranking de lucros de filmes", 0.4, "#d94501", "Film");
	
	var groups = _.groupBy(json, 'Genre');
	var genres = _.map(groups, function(value, key) {
	  return { 
		Genre: key, 
		WWGross: _.reduce(value, function(total, o) { 
	        return total + o.Worldwide_Gross_M;
	    }, 0) 
	  };
	});
	
	render(genres, "WWGross", "Ranking de gêneros de filmes com maiores bilheterias", 0.09, "#525252", "Genre");
	
});

/**
 * Renders and sorts a h-bar graphic using d3.js lib 
 * @param json data file
 * @param attribute to display
 * @param graphic name
 * @param scale
 * @param graphic color
 * @param label to be displayed in each h-bar
 * @returns
 */
function render(data, attr, name, scale, color, label) {
	
	d3.select("body").append("h1").text(name);
	
	d3.select("body").append("div").attr("id", attr).selectAll("div.h-bar")
			.data(data).enter().append("div")
			.attr("style", "background-color: " + color)
			.attr("class", "h-bar").append("span");

	d3.select("#" + attr).selectAll("div.h-bar").data(data)
			.attr("class", "h-bar").style("width", function(d) {
				return (d[attr] * scale) + "px";
			}).select("span").style("margin-right", "8px").text(function(d) {
				return d[label];
			});
	d3.select("#" + attr).selectAll("div.h-bar").sort(function(a, b) {
    	return a[attr] > b[attr] ? -1 : 1;
    });
}