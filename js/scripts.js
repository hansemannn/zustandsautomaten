jsPlumb.ready(function() {
	jsPlumb.Defaults.Container = $("#stage");
	$.getJSON('http://api.hans-knoechel.de/projektwoche/data.json', function(data) {
		// delete end node, what do we do with it?
		var end = data.pop();
		$.each(data, function(index, node) {
			$('#stage').append($('<div>').attr('id', node.name).addClass(index === 0 ? 'start' : 'state').text(node.name));
		});
		var grid;
		$('#stage').data('grid', (grid = new GridLayout($('#stage'), 3)));
		grid.doLayout();
		jsPlumb.reset();
		jsPlumbDemo.init(data);
	});
});

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

var Color = {
	Blue: '#3f66f5',
	Green: '#14b43a',
};

var ConnectionBuilder = function(data) {
	this.data = data;
};

ConnectionBuilder.Style = {};
ConnectionBuilder.Style.HoverPaintStyle = { strokeStyle: "#7ec3d9" };

ConnectionBuilder.DefaultConnectorSettings = {
	connector: 'Flowchart',
	anchor: "Continuous",
	endpoint: 'Blank',
	paintStyle: {
		lineWidth: 4,
		strokeStyle: Color.Green,
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
		lineWidth: 4,
		strokeStyle: Color.Green
	},
	hoverPaintStyle: ConnectionBuilder.Style.HoverPaintStyle,
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
			target: target,
			paintStyle: {
				strokeStyle: Color.Blue
			}
		}, ConnectionBuilder.DefaultConnectorSettings);
	},

	connectState: function(source, target) {
		var connectorParameter = {};

		if(source === target) {
			connectorParameter = ConnectionBuilder.SelfReferencingConnectorSettings;
		} else if(this.isDirectNeighbor(source, target)) {
			connectorParameter = ConnectionBuilder.DefaultConnectorSettings;
			console.log(connectorParameter);
		} else {
			$.extend(connectorParameter, ConnectionBuilder.DefaultConnectorSettings, this.detectConnectorParameter(source, target));
			console.log(connectorParameter);
		}

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

		if(sourceRow === targetRow && sourceRow === 1) {
			connectorParameter = {
				connector: ['Flowchart', {stub: 100}],
				anchor: ["Continuous", {faces:["top"]}]
			};
		} else if(sourceRow === $('#stage').data('grid').rows) {
			connectorParameter = {
				connector: ['Flowchart', {stub: 100}],
				anchors: ['BottomCenter', 'BottomCenter']
			};
		} else if(sourceRow < targetRow && sourceColumn < targetColumn) {
			connectorParameter = {
				connector: ['Flowchart', {stub: 100}],
				anchors: [
					["Continuous", {faces:["right"]}],
					["Continuous", {faces:["bottom"]}]
				]
			};
		}

		return connectorParameter;
	}
}

;(function() {
	window.jsPlumbDemo = {
		init : function(data) {			
			jsPlumb.importDefaults({
				DragOptions: { cursor: "pointer", zIndex:2000 },
				HoverClass: "connector-hover"
			});
			
			var connectionBuilder = new ConnectionBuilder(data);
			connectionBuilder.buildConnections();
		}
	};
})();