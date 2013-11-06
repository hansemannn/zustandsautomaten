/**
 * Visualisierung von Zustandsautomaten mit HTML5 & CSS3
 * 
 * Projektwoche 2013
 *
 * @author  Jan Vennemann & Hans Knoechel
 */

jsPlumb.ready(function() {
	jsPlumb.Defaults.Container = $("#stage");
	$.getJSON('http://api.hans-knoechel.de/projektwoche/data.json', function(data) {
		// delete end node, what do we do with it?
		var end = data.pop();
		$.each(data, function(index, node) {
			$('#stage').append($('<div>').attr('id', node.name).addClass(index === 0 ? 'start' : 'state').text((node.name).toUpperCase()));
		});
		var grid;
		$('#stage').data('grid', (grid = new GridLayout($('#stage'), 3)));
		grid.doLayout();
		jsPlumb.reset();
		jsPlumbDemo.init(data);
	});
});

/**
 * Grid Layout to order all elements within the given element in a grid
 * with a given number of columns.
 * 
 * @param HTMLElement element
 * @param int columns
 */
var GridLayout = function(element, columns) {
	this.element = $(element);
	this.columns = columns;
	this.rows = 1;
};

GridLayout.prototype = {
	doLayout: function() {
		var that = this;
		var topOffset = 150;
		var leftOffset = 0;
		this.element.find('.state').each(function(index, element) {
			if(index % that.columns === 0 && index > 0) {
				that.rows++;
				topOffset += 200;
				leftOffset = 350;
			} else {
				leftOffset += 350;
			}
			$(element).css({
				top: topOffset,
				left: leftOffset
			}).data('column', index % that.columns + 1).data('row', that.rows);
		});
	}
};

/**
 * A set of different colors for the connectors
 * 
 * @author  Jan Vennemann & Hans Knoechel
 */
var ColorPool = {
	key: 0,
	colors: ['#3f66f5', '#14b43a', '#e521d5', '#e59421', '#93363a', '#1e4474'],
	next: function() {
		if(this.key === this.colors.length) {
			this.key = 0;
		}
		return this.colors[this.key++];
	}
};

/**
 * Builder for connections between endpoints
 * 
 * @author  Jan Vennemann & Hans Knoechel
 */
var ConnectionBuilder = function(data) {
	this.data = data;
};

ConnectionBuilder.Style = {};
ConnectionBuilder.Style.HoverPaintStyle = { strokeStyle: "#7ec3d9" };

ConnectionBuilder.DefaultConnectorSettings = {
	connector: ['Flowchart', {cornerRadius: 10}],
	anchor: "Continuous",
	endpoint: 'Blank',
	paintStyle: {
		lineWidth: 4,
		joinStyle: "round"
	},
	hoverPaintStyle: ConnectionBuilder.Style.HoverPaintStyle,
	detachable: false,
	overlays:[
		["Arrow", {
			location: 1,
			width: 16,
			length: 12
		}]
	]
};

ConnectionBuilder.SelfReferencingConnectorSettings = {
	connector:"StateMachine",
	paintStyle:{
		lineWidth: 4
	},
	hoverPaintStyle: ConnectionBuilder.Style.HoverPaintStyle,
	endpoint: "Blank",
	anchor: [1, 0, 0, 0, 50, 10],
	cssClass: 'self-reference',
	overlays:[
		["Arrow", {
			location: 1,
			width: 16,
			length: 12
		}]
	]
};

ConnectionBuilder.prototype = {
	buildConnections: function() {
		var that = this;
		$.each(this.data, function(index, node) {
			if(index === 0) {
				that.connectStart(node.name, node.transitions[0].target);
			} else {
				$.each(node.transitions, function(index, transition) {
					that.connectState(node.name, transition.target);
				});
			}
		});
	},

	connectStart: function(source, target) {
		jsPlumb.connect({
			source: source,
			target: target
		}, $.extend(true, {}, ConnectionBuilder.DefaultConnectorSettings, {paintStyle: {strokeStyle: '#3f66f5'}}));
	},

	connectState: function(source, target) {
		var connectorParameter = {};

		if(source === target) {
			connectorParameter = $.extend(true, {}, ConnectionBuilder.SelfReferencingConnectorSettings);
			console.log('Self reference: ' + source + '/' + target);
		} else if(this.isDirectNeighbor(source, target)) {
			connectorParameter = $.extend(true, {}, ConnectionBuilder.DefaultConnectorSettings);
			console.log('direct neighbor: ' + source + '/' + target);
		} else {
			$.extend(connectorParameter, ConnectionBuilder.DefaultConnectorSettings, this.detectConnectorParameter(source, target));
		}

		var color = ColorPool.next();
		$.extend(true, connectorParameter, {paintStyle: {strokeStyle: color}});

		jsPlumb.connect({
			source: source,
			target: target,
		}, connectorParameter);
	},

	isDirectNeighbor: function(source, target) {
		var sourceRow = $('#' + source).data('row');
		var sourceColumn = $('#' + source).data('column');
		var targetRow = $('#' + target).data('row');
		var targetColumn = $('#' + target).data('column');
		
		if((sourceRow === targetRow && (sourceColumn === targetColumn - 1 || sourceColumn === targetColumn + 1)) || (sourceColumn === targetColumn && (sourceRow === targetRow - 1 || sourceRow === targetRow + 1))) {
			return true;
		}

		return false;
	},

	detectConnectorParameter: function(source, target) {
		var sourceRow = $('#' + source).data('row');
		var sourceColumn = $('#' + source).data('column');
		var targetRow = $('#' + target).data('row');
		var targetColumn = $('#' + target).data('column');
		var connectorParameter = {};
		var sourceAnchor, targetAnchor;

		// Path finding magic for the connections
		// @todo: refactor into methods with speaking names to make it easier to understands what happens hier
		if(Math.abs(sourceRow - targetRow) === 1) {
			if(sourceRow - targetRow === -1) {
				sourceAnchor = ["Continuous", {faces:["left"]}];
				targetAnchor = ["Continuous", {faces:["right"]}];
			} else {
				sourceAnchor = ["Continuous", {faces:["right"]}];
				targetAnchor = ["Continuous", {faces:["left"]}];
			}

			connectorParameter = {
				connector: ['Flowchart', {stub: [100, 100], cornerRadius: 15}],
				anchors: [
					sourceAnchor,
					targetAnchor
				]
			};
		} else if(Math.abs(sourceColumn - targetColumn) === 1) {
			if(sourceColumn - targetColumn === -1) {
				sourceAnchor = ["Continuous", {faces:["right"]}];
				targetAnchor = ["Continuous", {faces:["left"]}];
			} else {
				sourceAnchor = ["Continuous", {faces:["left"]}];
				targetAnchor = ["Continuous", {faces:["right"]}];
			}

			var connections = jsPlumb.getConnections({source: source});
			console.log(connections);

			connectorParameter = {
				connector: ['Flowchart', {stub: [50, 50], cornerRadius: 15}],
				anchors: [
					sourceAnchor,
					targetAnchor
				]
			};
		} else if(this.isOuterBoundaryConnectionPossible(source, target)) {
			console.log('outer boundary: ' + source + '/' + target);
			if(sourceRow === targetRow) {
				if(sourceRow === 1) {
					sourceAnchor = targetAnchor = ["Continuous", {faces:["top"]}];
				} else {
					sourceAnchor = targetAnchor = ["Continuous", {faces:["bottom"]}];
				}
			} else if(sourceColumn === targetColumn) {
				if(sourceColumn === 1) {
					sourceAnchor = targetAnchor = ["Continuous", {faces:["left"]}];
				} else {
					sourceAnchor = targetAnchor = ["Continuous", {faces:["right"]}];
				}
			} else if(sourceRow === 1) {
				sourceAnchor = ["Continuous", {faces:["top"]}];
				if(targetColumn == 1) {
					sourceAnchor = ["Continuous", {faces:["top"]}];
				} else {

				}
			} else if(sourceRow === $('#stage').data('grid').rows) {
				sourceAnchor = ["Continuous", {faces:["bottom"]}];
				if(targetColumn === 1) {
					targetAnchor = ["Continuous", {faces:["left"]}];
				} else {
					targetAnchor = ["Continuous", {faces:["right"]}];
				}
			} else if(sourceColumn === 1) {
				sourceAnchor = ["Continuous", {faces:["left"]}];
				if(targetColumn === 1) {
					targetAnchor = ["Continuous", {faces:["top"]}];
				} else {
					targetAnchor = ["Continuous", {faces:["right"]}];
				}
			} else if(targetRow === 1) {
				targetAnchor = ["Continuous", {faces:["top"]}];
				if(sourceColumn == 1) {
					sourceAnchor = ["Continuous", {faces:["left"]}];
				} else {
					sourceAnchor = ["Continuous", {faces:["right"]}];
				}
			}

			connectorParameter = {
				connector: ['Flowchart', {stub: [100, 100], cornerRadius: 15}],
				anchors: [
					sourceAnchor,
					targetAnchor
				]
			};
		} else if(sourceRow < targetRow && sourceColumn > targetColumn) {
			connectorParameter = {
				connector: ['Flowchart', {stub: 50, cornerRadius: 15}],
				anchors: [
					["Continuous", {faces:["bottom"]}],
					["Continuous", {faces:["top"]}]
				]
			};
		} else if(sourceRow > targetRow) {
			connectorParameter = {
				connector: ['Flowchart', {stub: 50, cornerRadius: 15}],
				anchors: [
					["Continuous", {faces:["top"]}],
					["Continuous", {faces:["bottom"]}]
				]
			};
		}

		return connectorParameter;
	},

	isOuterBoundaryConnectionPossible: function(source, target) {
		$.each([source, target], function(index, element) {
			var elementRow = $('#' + element).data('row');
			var elementColumn = $('#' + element).data('column');

			if(elementRow > 1 && elementRow < $('#stage').data('grid').rows && elementColumn > 1 && elementColumn < $('#stage').data('grid').columns) {
				return false;
			}
		});

		return true;
	}
}

/**
 * Init function for jsPlumb
 *
 * @author  Jan Vennemann & Hans Knoechel
 */
;(function() {
	window.jsPlumbDemo = {
		init : function(data) {
			jsPlumb.importDefaults({
				DragOptions: { cursor: "pointer", zIndex: 2000 },
				HoverClass: "connector-hover"
			});
			
			var connectionBuilder = new ConnectionBuilder(data);
			connectionBuilder.buildConnections();
		}
	};
})();