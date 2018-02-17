/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
Namespace('Materia.Scores').Scoregraphics = (function() {

	const drawScoreCircle = function(canvasName, number, percent, greyMode) {
		const canvas = $(`#${canvasName}`);
		const h = parseInt(canvas.css('height'), 10);
		const halfH = h/2;
		const lineWidth = 5;
		const radius = (h - lineWidth)/2;
		canvas.attr('height', h).attr('width', h);

		if (canvas[0].getContext) {
			const context = canvas[0].getContext('2d');

			// choose the dot color based on the value if grey mode is enabled, the dot is greyed out.
			const dotColor = greyMode === true ? '#C3C5C8' : ( parseInt(percent, 10) !== 1 ? "#e2dcdf" :  "rgba(106, 148, 81, .2)" );

			//
			context.strokeStyle = greyMode === true ? "#B3B5B8" : "#db8081";
			context.beginPath();
			context.arc(halfH, halfH, radius, 0, Math.PI*2, false);
			context.lineWidth = lineWidth-0.5;
			context.fillStyle = dotColor;
			context.fill();
			context.stroke();

			// green
			const start = Math.PI * 2 * 0.75; // 90 degrees (NORTH)
			const end =  start + (Math.PI * 2 * percent);
			context.strokeStyle = greyMode === true ? "#B3B5B8" : "#7dba72";
			context.beginPath();
			context.arc(halfH, halfH, radius, start, end, false);
			context.lineWidth = lineWidth;
			context.stroke();

			const x = radius;
			const y = radius;

			context.font = "bold 28px Lato";
			context.textAlign = "center";
			context.textBaseline = "middle";
			context.fillStyle = "#555555"; // text color
			return context.fillText(number, halfH, halfH);
		}
	};

	const drawModifierCircle = function(canvasName, number, percent, greyMode) {
		const canvas = $(`#${canvasName}`);
		const h = parseInt(canvas.css('height'));
		const halfH = h/2;
		const lineWidth = 5;
		const radius = (h - lineWidth)/2;
		canvas.attr('height', h);
		canvas.attr('width', h);


		if (canvas[0].getContext) {
			const context = canvas[0].getContext('2d');

			// choose the dot color based on the value if grey mode is enabled, the dot is greyed out.

			const percentColor =  percent < 0 ? '#db8081' : '#7dba72';
			const dotColor = greyMode === true ? '#C3C5C8' : percentColor;

			context.lineWidth = lineWidth-0.5;

			context.strokeStyle = greyMode === true ? '#B3B5B8' : '#555555';

			context.beginPath();
			context.arc(halfH, halfH, radius, 0, Math.PI*2, false);
			context.fillStyle = dotColor;
			context.fill();
			context.stroke();

			context.font = "bold 28px Lato";
			context.textAlign = "center";
			context.textBaseline = "middle";
			context.fillStyle = "#555555"; // text color
			return context.fillText(number, halfH, halfH);
		}
	};

	const drawFinalScoreCircle = function(canvasName, number, percent) {
		const canvas = $(`#${canvasName}`);
		const h = parseInt(canvas.css('height'));
		const halfH = h/2;
		const radius = (h-2)/2;
		canvas.attr('height', h);
		canvas.attr('width', h);

		if (canvas[0].getContext) {
			const context = canvas[0].getContext('2d');
			const fillColor = '#db8081';

			context.strokeStyle = '555555';
			context.lineWidth = 2;

			context.beginPath();
			context.arc(halfH, halfH, radius, 0, Math.PI*2, false);
			context.fillStyle = fillColor;
			context.fill();
			context.stroke();

			const start = Math.PI*2*0.75; // 90 degrees (NORTH)
			const end =  start + (Math.PI*2*percent);

			const greenSliceColor = '#7dba72';
			context.fillStyle = greenSliceColor;

			context.beginPath();

			context.arc(halfH, halfH, (radius-1), start, end, false);
			context.lineTo(halfH, halfH);
			context.closePath();
			return context.fill();
		}
	};


	return {
		drawScoreCircle,
		drawModifierCircle,
		drawFinalScoreCircle
	};
})();