jsPlumb.ready(function() {
		jsPlumb.Defaults.Container = $("#stage");
		jsPlumbDemo.init();
	});

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
					connector: "Flowchart",
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
							location:1,
							width:16,
							length:12}
						]
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
			    	target: 'state1'
			    }, defaultConnectorSettings);
			}
		};
	})();