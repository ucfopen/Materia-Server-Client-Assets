// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Handles the graphs/scoring table
Namespace('Materia.MyWidgets').Statistics = (function() {
	const _curTableOrder = 'desc';
	let _plots = [];

	// Uses jPlot to create the bargraph and piechart
	// @param    type		The type of graph that will be made (bargraph | pieChart)
	// @return   void
	const createGraph = function(elementId, data) {
		if ((_plots[elementId] == null)) {
			const jqOptions = {
				animate: true,
				animateReplot: true,
				series: [{
						renderer:$.jqplot.BarRenderer,
						shadow: false,
						rendererOptions: {
							animation: {
								speed: 500
							}
						}
					}
				],
				title: {
					text: 'Score Distribution',
					fontFamily: 'Lato, Lucida Grande, Arial, sans'
				},
				axesDefaults: {
					tickRenderer: $.jqplot.CanvasAxisTickRenderer,
					tickOptions: {
						angle: 0,
						fontSize: '8pt'
					}
				},
				axes: {
					xaxis: {
						renderer: $.jqplot.CategoryAxisRenderer,
						ticks: ['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-89', '90-100']
					}
				},
				highlighter: {
					show: true,
					showMarker: false,
					sizeAdjust: 7.5,
					tooltipAxes: 'y',
					formatString: '%s scores'
				},
				cursor: {
					show: false
				},
				grid: {
					background: '#FFFFFF',
					shadow: false
				},
				seriesColors: ['#1e91e1']
			};

			const plot = $.jqplot(elementId, [data], jqOptions);
			return _plots[elementId] = plot;
		}
		else {}
	};
			// to replot we need to format the data in the way jqPlot expects.
			// normally the "constructor" of jqplot does this transformation
			// but here we are accessing the data property directly.

			// TODO: This code is broken. Commenting it out seems to work fine. Necessary??
			// plot = _plots[elementId]
			// seriesData = []
			// seriesData.push [i+1, series] for series, i in data
			// plot.series[0].data = seriesData
			// plot.replot({resetAxes: true})

	const clearGraphs = () => _plots = [];

	 // Constructs the score table when the Table score tab is selected.
	 // @param sort 		the method used to sort the names (asc | desc | newest)
	 // @return void

	return {
		createGraph,
		clearGraphs
	};
})();
