jsPlumb.ready(function() {
	jsPlumb.Defaults.Container = $("#stage");
	var grid = new GridLayout(3);
	grid.doLayout();
	jsPlumbDemo.init();
});

var GridLayout = function(columns) {
	this.columns = columns;
};

GridLayout.prototype = {
	doLayout: function() {
		var that = this;
		var topOffset = 150;
		var leftOffset = 0;
		$('.state').each(function(index, element) {
			if(index % that.columns === 0 && index > 0) {
				topOffset += 200;
				leftOffset = 350;
			} else {
				leftOffset += 350;
			}
			$(element).css({
				top: topOffset,
				left: leftOffset
			}).addClass('column' + (index % that.columns + 1));
		});
	}
}

;(function() {
	window.jsPlumbDemo = {
		init : function() {			
			jsPlumb.importDefaults({
				DragOptions: { cursor: "pointer", zIndex:2000 },
				HoverClass: "connector-hover"
			});

			var Color = {
				Blue: '#3f66f5',
				Green: '#14b43a',
			}
			
			var connectorStrokeColor = "rgba(50, 50, 200, 1)",
				connectorHighlightStrokeColor = "rgba(180, 180, 200, 1)",
				hoverPaintStyle = { strokeStyle:"#7ec3d9" };
			
			var defaultConnectorSettings = {
				connector: ['Flowchart', {stub: 100, alwaysRespectStubs: true}],
				anchor: "Continuous",
				endpoint: 'Blank',
				paintStyle: {
					lineWidth: 4,
					strokeStyle: Color.Green,
					joinstyle: "round"
				},
				hoverPaintStyle: hoverPaintStyle,
				detachable: false,
				overlays:[
					["Arrow", {
						location: 1,
						width: 16,
						length: 12
					}]
				]
			};

			var selfReferencingConnectorSettings = {				
				connector:"StateMachine",
				paintStyle:{
					lineWidth: 4,
					strokeStyle: Color.Green
				},
				hoverPaintStyle: hoverPaintStyle,
				endpoint: "Blank",
				anchor: "TopRight",
				overlays:[
					["Arrow", {
						location: 1,
						width: 16,
						length: 12
					}]
				]
			};

			var connection0 = jsPlumb.connect({
				source: 'start',
				target: 'state1',
				paintStyle: {
					strokeStyle: Color.Blue
				}
			}, defaultConnectorSettings);
			
			var connection1 = jsPlumb.connect({  
				source: 'state1', 
				target: 'state2', 
		    }, defaultConnectorSettings);

		    var connection1 = jsPlumb.connect({  
				source: 'state1', 
				target: 'state1', 
		    }, selfReferencingConnectorSettings);

		    var connection3 = jsPlumb.connect({
		    	source: 'state3',
		    	target: 'state1',
		    	connector: ['Flowchart', {stub: 200, alwaysRespectStubs: true}],
		    	anchors: ['TopCenter', 'TopCenter'],
		    	stub: 40
		    }, defaultConnectorSettings);

		    var connection4 = jsPlumb.connect({
		    	source: 'state4',
		    	target: 'state3',
			    connector: ['Flowchart', {stub: 200, alwaysRespectStubs: true}],
		    	anchors: ['BottomCenter', 'BottomCenter'],
		    	stub: 40
		    }, defaultConnectorSettings);
		}
	};
})();